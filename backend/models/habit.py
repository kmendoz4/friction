from datetime import datetime

from sqlalchemy import Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base

class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    
    has_levels: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    levels: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)