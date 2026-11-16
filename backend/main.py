from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class HabitCreate(BaseModel):
    name: str

habits = [
    {"id": 1, "name": "Exercise"},
    {"id": 2, "name": "Read"},
    {"id": 3, "name": "Journal"}
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
        "name": habit.name
    }

    habits.append(new_habit)
    return new_habit
