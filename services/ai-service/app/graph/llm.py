"""Shared LLM and embeddings factory."""
from functools import lru_cache

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.core.config import settings


@lru_cache
def get_chat_model() -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.default_llm_model,
        temperature=settings.default_temperature,
        api_key=settings.openai_api_key,
    )


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        api_key=settings.openai_api_key,
    )
