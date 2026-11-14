import { useState } from "react";

function HabitCard({ habit, number }) {
  const [completionLevel, setCompletionLevel] = useState(0);

  function advanceCompletion(event) {
    const interactiveTarget =
      event.target instanceof Element
        ? event.target.closest(
            "button, a, input, select, textarea, [role='button']",
          )
        : null;

    if (interactiveTarget && interactiveTarget !== event.currentTarget) {
      return;
    }

    setCompletionLevel((currentLevel) => (currentLevel + 1) % 4);
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setCompletionLevel((currentLevel) => (currentLevel + 1) % 4);
    }
  }

  return (
    <article
      className={`habit-card${completionLevel > 0 ? " habit-card--active" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${habit}, completion level ${completionLevel} of 3. Activate to change the level.`}
      onClick={advanceCompletion}
      onKeyDown={handleKeyDown}
    >
      <span className="habit-card__number">
        {String(number).padStart(2, "0")}
      </span>
      <div className="habit-card__details">
        <p className="habit-card__label">DAILY PRACTICE</p>
        <h3 className="habit-card__title">{habit}</h3>
      </div>
      <span className="habit-card__completion" aria-hidden="true">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`completion-dot${completionLevel >= level ? " completion-dot--filled" : ""}`}
          />
        ))}
      </span>
      <span className="habit-card__arrow" aria-hidden="true">
        ↗
      </span>
    </article>
  );
}

export default HabitCard;
