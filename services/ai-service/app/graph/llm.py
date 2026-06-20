from functools import lru_cache
from typing import Literal

from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)

from app.core.config import settings

ChatTier = Literal["primary", "secondary", "tertiary"]


def _tier_model(tier: ChatTier) -> tuple[str, float]:
    mapping: dict[ChatTier, tuple[str, float]] = {
        "primary": (settings.primary_llm_model, settings.primary_temperature),
        "secondary": (settings.secondary_llm_model, settings.secondary_temperature),
        "tertiary": (settings.tertiary_llm_model, settings.tertiary_temperature),
    }
    return mapping.get(tier, (settings.default_llm_model, settings.default_temperature))


@lru_cache
def get_chat_model(tier: ChatTier = "primary") -> ChatGoogleGenerativeAI:

    model, temperature = _tier_model(tier)
    return ChatGoogleGenerativeAI(
        model=model,
        temperature=temperature,
        google_api_key=settings.gemini_api_key,
    )


@lru_cache
def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.gemini_api_key,
        output_dimensionality=settings.embedding_dim,
    )
