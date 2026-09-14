"""Small dependency-free password and token helpers for the demo deployment."""

import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db

SECRET_KEY = "meridian-demo-change-this-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"pbkdf2_sha256$120000${_encode(salt)}${_encode(digest)}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, rounds, salt, expected = hashed_password.split("$")
        digest = hashlib.pbkdf2_hmac(algorithm.removeprefix("pbkdf2_"), plain_password.encode(), _decode(salt), int(rounds))
        return hmac.compare_digest(_encode(digest), expected)
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expires = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": subject, "exp": int(expires.timestamp())}
    encoded = _encode(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).digest()
    return f"{encoded}.{_encode(signature)}"


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _subject_from_token(token: str) -> str | None:
    try:
        encoded, supplied_signature = token.split(".")
        expected_signature = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_decode(supplied_signature), expected_signature):
            return None
        payload = json.loads(_decode(encoded))
        if payload["exp"] < datetime.now(UTC).timestamp():
            return None
        return payload["sub"]
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User | None:
    if settings.testing:
        return None
    authorization = request.headers.get("Authorization", "")
    token = authorization.removeprefix("Bearer ").strip()
    email = _subject_from_token(token) if token else None
    user = db.query(models.User).filter(models.User.email == email).first() if email else None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def require_manager(user: models.User | None = Depends(get_current_user)) -> models.User | None:
    if user is not None and user.role != models.UserRole.manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager access required")
    return user
