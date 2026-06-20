"""One row per LangGraph orchestration run."""
import uuid

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin


class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    run_type: Mapped[str] = mapped_column(String(50), index=True)  # chat | plan | disruption
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    trip_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    user_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    langsmith_run_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    input: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    steps: Mapped[list["AgentStep"]] = relationship(  # noqa: F821
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="AgentStep.step_index",
    )
