from typing import Generator, List, Optional

from fastapi import Depends, FastAPI
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models import Habit

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    has_levels: bool = False
    levels: List[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_levels(self):
        if self.has_levels:
            if len(self.levels) != 3 or any(not level.strip() for level in self.levels):
                raise ValueError("Habits with levels must have exactly three nonempty level descriptions")
        elif self.levels:
            raise ValueError("Habits without levels must have an empty levels list")

        return self


class HabitResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    has_levels: bool
    levels: List[str]

    model_config = ConfigDict(from_attributes=True)


class HabitsResponse(BaseModel):
    habits: List[HabitResponse]


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

@app.get("/")
def root():
    return {"message": "Habit Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/habits", response_model=HabitsResponse)
def get_habits(db: Session = Depends(get_db)):
    active_habits = (
        db.query(Habit)
        .filter(Habit.deleted_at.is_(None))
        .order_by(Habit.id)
        .all()
    )
    return {"habits": active_habits}

@app.post("/habits", status_code=201, response_model=HabitResponse)
def post_habits(habit: HabitCreate, db: Session = Depends(get_db)):
    new_habit = Habit(
        name=habit.name,
        description=habit.description,
        has_levels=habit.has_levels,
        levels=habit.levels,
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit
