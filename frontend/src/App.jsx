import { useEffect, useRef, useState } from "react";
import HabitCard from "./HabitCard.jsx";

function App() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [hasLevels, setHasLevels] = useState(false);
  const [habitLevels, setHabitLevels] = useState(["", "", ""]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [addHabitError, setAddHabitError] = useState("");
  const addHabitButtonRef = useRef(null);
  const habitNameInputRef = useRef(null);
  const dialogRef = useRef(null);
  const wasPopupOpen = useRef(false);
  const isAddingHabitRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHabits() {
      try {
        const response = await fetch("/habits", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`The server responded with ${response.status}.`);
        }

        const data = await response.json();

        if (!Array.isArray(data?.habits) || !data.habits.every(
            (habit) =>
              habit !== null &&
              typeof habit === "object" &&
              !Array.isArray(habit) &&
              Number.isInteger(habit.id) &&
              typeof habit.name === "string"
          )
        ) {
          throw new Error("The server returned an invalid habits response.");
        }

        setHabits(data.habits);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "An unexpected error occurred.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadHabits();

    return () => controller.abort();
  }, []);

  async function addHabit(habit) {
    try {
      const response = await fetch("/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        throw new Error(`Failed to create habit: ${response.status}`);
      }

      const newHabit = await response.json();

      setHabits((previousHabits) => [
        ...previousHabits,
        newHabit,
      ]);

      return true;
    } catch (error) {
      console.error("Error adding habit:", error);
      return false;
    }
  }

  useEffect(() => {
    if (isPopupOpen) {
      wasPopupOpen.current = true;
      habitNameInputRef.current?.focus();
    } else if (wasPopupOpen.current) {
      wasPopupOpen.current = false;
      addHabitButtonRef.current?.focus();
    }
  }, [isPopupOpen]);

  useEffect(() => {
    if (!isPopupOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape" && !isAddingHabitRef.current) {
        setIsPopupOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPopupOpen]);

  function handleDialogKeyDown(event) {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
    );
    if (!focusableElements?.length) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  async function handleAddHabitSubmit(event) {
    event.preventDefault();
    const trimmedName = habitName.trim();
    const trimmedLevels = habitLevels.map((level) => level.trim());

    if (isAddingHabitRef.current) {
      return;
    }

    if (!trimmedName) {
      setAddHabitError("Enter a habit name.");
      return;
    }

    if (hasLevels && trimmedLevels.some((level) => !level)) {
      setAddHabitError("Enter a description for all three completion levels.");
      return;
    }

    isAddingHabitRef.current = true;
    setIsAddingHabit(true);
    setAddHabitError("");

    try {
      const wasAdded = await addHabit({
        name: trimmedName,
        description: habitDescription.trim(),
        has_levels: hasLevels,
        levels: hasLevels ? trimmedLevels : [],
      });

      if (!wasAdded) {
        setAddHabitError("We couldn't add that habit. Please try again.");
        return;
      }

      setHabitName("");
      setHabitDescription("");
      setHasLevels(false);
      setHabitLevels(["", "", ""]);
      setIsPopupOpen(false);
    } catch (requestError) {
      setAddHabitError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't add that habit. Please try again.",
      );
    } finally {
      isAddingHabitRef.current = false;
      setIsAddingHabit(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Friction home">
          <span className="brand__mark" aria-hidden="true">
            f
          </span>
          <span>Friction</span>
        </a>
        <span className="header-note">A little, often.</span>
      </header>

      <main className="dashboard">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-panel__copy">
            <p className="eyebrow">YOUR ROUTINE, AT A GLANCE</p>
            <h1 id="welcome-title">Build a little momentum.</h1>
            <p className="welcome-panel__description">
              Small steps count. Make today a day you show up for yourself.
            </p>
          </div>
          <div className="welcome-panel__decoration" aria-hidden="true">
            <span className="decoration-ring decoration-ring--outer" />
            <span className="decoration-ring decoration-ring--inner" />
            <span className="decoration-dot" />
          </div>
        </section>

        <section className="habits-section" aria-labelledby="habits-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOW UP FOR YOURSELF</p>
              <h2 id="habits-title">Today's habits</h2>
            </div>
            <button
              ref={addHabitButtonRef}
              className="add-habit-button"
              type="button"
              aria-haspopup="dialog"
              onClick={() => {
                setAddHabitError("");
                setIsPopupOpen(true);
              }}
            >
              <span aria-hidden="true">+</span>
              Add a habit
            </button>
          </div>

          <div className="habit-grid">
            {isLoading ? (
              <p className="state-message" role="status">
                Loading your habits...
              </p>
            ) : error ? (
              <div className="error-state" role="alert">
                <p className="error-state__title">
                  We couldn't load your habits.
                </p>
                <p className="error-state__detail">
                  Check that the backend is running, then refresh. Details:{" "}
                  {error}
                </p>
              </div>
            ) : habits.length === 0 ? (
              <p className="state-message">
                No habits yet. Your habits will appear here.
              </p>
            ) : (
              habits.map((habit, index) => (
                <HabitCard key={habit.id} habit={habit} number={index + 1} />
              ))
            )}
          </div>
        </section>
      </main>

      {isPopupOpen && (
        <div className="habit-modal-overlay">
          <section
            ref={dialogRef}
            className="habit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-habit-title"
            onKeyDown={handleDialogKeyDown}
          >
            <button
              className="habit-modal__close"
              type="button"
              aria-label="Close dialog"
              disabled={isAddingHabit}
              onClick={() => setIsPopupOpen(false)}
            >
              ×
            </button>
            <p className="eyebrow">A SMALL STEP, JUST FOR YOU</p>
            <h2 id="add-habit-title">Add a habit</h2>
            <p className="habit-modal__description">
              Choose something small you’d like to make part of your routine.
            </p>

            <form className="habit-modal__form" onSubmit={handleAddHabitSubmit}>
              <label htmlFor="habit-name">Habit name</label>
              <input
                ref={habitNameInputRef}
                id="habit-name"
                name="habitName"
                type="text"
                placeholder="e.g. Read 10 pages"
                value={habitName}
                onChange={(event) => {
                  setHabitName(event.target.value);
                  setAddHabitError("");
                }}
                aria-describedby={addHabitError ? "add-habit-error" : undefined}
                required
              />
              <label htmlFor="habit-description">Description (optional)</label>
              <textarea
                id="habit-description"
                name="habitDescription"
                placeholder="Add a little more detail"
                value={habitDescription}
                onChange={(event) => {
                  setHabitDescription(event.target.value);
                  setAddHabitError("");
                }}
              />
              <label className="habit-modal__checkbox-label" htmlFor="habit-has-levels">
                <input
                  id="habit-has-levels"
                  name="hasLevels"
                  type="checkbox"
                  checked={hasLevels}
                  aria-expanded={hasLevels}
                  aria-controls={hasLevels ? "habit-level-fields" : undefined}
                  onChange={(event) => {
                    setHasLevels(event.target.checked);
                    setAddHabitError("");
                  }}
                />
                Use three completion levels
              </label>
              {hasLevels && (
                <fieldset
                  className="habit-modal__level-fields"
                  id="habit-level-fields"
                >
                  <legend>Completion levels</legend>
                  {habitLevels.map((level, index) => {
                    const inputId = `habit-level-${index + 1}`;

                    return (
                      <div className="habit-modal__level" key={inputId}>
                        <label htmlFor={inputId}>
                          Level {index + 1} description
                        </label>
                        <input
                          id={inputId}
                          name={`level${index + 1}`}
                          type="text"
                          value={level}
                          onChange={(event) => {
                            const updatedLevels = [...habitLevels];
                            updatedLevels[index] = event.target.value;
                            setHabitLevels(updatedLevels);
                            setAddHabitError("");
                          }}
                          required
                        />
                      </div>
                    );
                  })}
                </fieldset>
              )}
              {addHabitError && (
                <p className="habit-modal__error" id="add-habit-error" role="alert">
                  {addHabitError}
                </p>
              )}
              <div className="habit-modal__actions">
                <button
                  className="habit-modal__cancel"
                  type="button"
                  disabled={isAddingHabit}
                  onClick={() => setIsPopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="habit-modal__submit"
                  type="submit"
                  disabled={isAddingHabit}
                >
                  {isAddingHabit ? "Adding..." : "Add habit"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
