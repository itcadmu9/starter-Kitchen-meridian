from fastapi import APIRouter

from app import schemas
from app.services import assistant_service

router = APIRouter(prefix="/api/v1/assistant", tags=["assistant"])


@router.post("", response_model=schemas.AssistantReply)
def ask_assistant(payload: schemas.AssistantQuery):
    return schemas.AssistantReply(response=assistant_service.ask_assistant(payload.prompt))
