import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.ai import ConversationState, Itinerary
from app.services import orchestration_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get(
    "/{conversation_id}",
    response_model=ConversationState,
    summary="Get conversation history and current plan",
)
async def get_conversation(conversation_id: uuid.UUID) -> ConversationState:
    state = await orchestration_service.get_conversation(conversation_id)
    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )
    return state


@router.get(
    "/{conversation_id}/itinerary",
    response_model=Itinerary,
    summary="Get the latest itinerary for a conversation",
)
async def get_itinerary(conversation_id: uuid.UUID) -> Itinerary:
    itinerary = await orchestration_service.get_itinerary(conversation_id)
    if itinerary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No itinerary for this conversation",
        )
    return itinerary
