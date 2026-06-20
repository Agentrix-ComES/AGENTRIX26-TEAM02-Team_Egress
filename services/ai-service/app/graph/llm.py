"""Shared LLM and embeddings factory.

Models are organized into capability tiers so each task uses an appropriately
sized model:

- ``primary``: hard intelligence (planning, complex reasoning, replanning).
- ``secondary``: medium tasks (conversation, disruption analysis).
- ``tertiary``: low/cheap tasks (intent classification, data extraction).
"""
from functools import lru_cache
from typing import Literal

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

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
def get_chat_model(tier: ChatTier = "primary") -> ChatOpenAI:
    """Return a cached chat model for the given capability tier."""
    model, temperature = _tier_model(tier)
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=settings.openai_api_key,
    )


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        api_key=settings.openai_api_key,
    )
