"""LangSmith / LangChain tracing configuration."""
import logging
import os

from app.core.config import settings

logger = logging.getLogger(__name__)


def configure_langsmith() -> None:
    """Enable LangSmith tracing if configured.

    Sets the environment variables LangChain reads at runtime.
    """
    if settings.langchain_tracing_v2 and settings.langsmith_api_key:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
        os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
        logger.info("LangSmith tracing enabled for project '%s'", settings.langsmith_project)
    else:
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        logger.info("LangSmith tracing disabled")
