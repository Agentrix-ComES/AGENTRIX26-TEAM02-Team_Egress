
from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.ai import ChatRequest, ChatResponse
from app.services import orchestration_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Send a chat message (plan, modify, or ask)",
    response_description="The assistant reply plus the latest itinerary, if changed.",
)
async def chat(request: ChatRequest, session: SessionDep) -> ChatResponse:
  
    return await orchestration_service.run_chat(session, request)
