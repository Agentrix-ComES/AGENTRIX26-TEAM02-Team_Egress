"""Neo4j async driver for route/graph traversal."""
import logging

from neo4j import AsyncDriver, AsyncGraphDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)

_driver: AsyncDriver | None = None


def get_neo4j() -> AsyncDriver:
    """Return a singleton async Neo4j driver."""
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
    return _driver


async def verify_neo4j() -> None:
    """Verify connectivity at startup."""
    driver = get_neo4j()
    await driver.verify_connectivity()
    logger.info("Neo4j connectivity verified")


async def close_neo4j() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
