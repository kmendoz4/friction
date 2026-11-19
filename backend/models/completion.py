
from datetime import date

from sqlalchemy import Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Completion(Base):
    __tablename__ = "completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    habit_id: Mapped[int] = mapped_column(Integer, ForeignKey("habits.id"), nullable=False)

    date: Mapped[date] = mapped_column(Date, nullable=False)

    completed_level: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (UniqueConstraint("habit_id", "date"),)
