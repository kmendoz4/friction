from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field, model_validator

app = FastAPI()

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

habits = [
    {"id": 1, "name": "Exercise", "description": "", "has_levels": False, "levels": []},
    {"id": 2, "name": "Read", "description": "", "has_levels": True, "levels": ["5 Minutes", "10 Minutes", "20 Minutes"]},
    {"id": 3, "name": "Journal", "description": "", "has_levels": False, "levels": []}
]

@app.get("/")
def root():
    return {"message": "Habit Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/habits")
def get_habits():
    return {"habits": habits}

@app.post("/habits", status_code=201)
def post_habits(habit: HabitCreate):
    next_id = max((h["id"] for h in habits), default=0) + 1

    new_habit = {
        "id": next_id,
        "name": habit.name,
        "description": habit.description,
        "has_levels": habit.has_levels,
        "levels": habit.levels
    }

    habits.append(new_habit)
    return new_habit
