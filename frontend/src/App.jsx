import { useEffect, useState } from "react";
import HabitCard from "./HabitCard.jsx";

function App() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (
          !Array.isArray(data?.habits) ||
          !data.habits.every((habit) => typeof habit === "string")
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
            <button className="add-habit-button" type="button">
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
                <HabitCard key={habit} habit={habit} number={index + 1} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
