from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Habit Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/habits")
def get_habits():
    return {"habits": ["Exercise", "Read"]}

