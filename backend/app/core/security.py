"""Auth helper stubs for the kitchen vertical (password hashing / JWT issuance).

Not yet wired into main.py — routers here don't enforce auth. Fill in with
passlib/python-jose (or similar) once the Login/Profile flows need real auth.
"""

from datetime import UTC, datetime, timedelta

SECRET_KEY = "change-me"  # nosec - placeholder, load from settings before real use
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    """Placeholder — replace with passlib's CryptContext before storing real passwords."""
    raise NotImplementedError("Wire up a real password hashing library before use")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    raise NotImplementedError("Wire up a real password hashing library before use")


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Placeholder — replace with a real JWT library (e.g. python-jose) before use."""
    _ = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    raise NotImplementedError("Wire up a real JWT library before use")
