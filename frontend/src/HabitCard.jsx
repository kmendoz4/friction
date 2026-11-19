import { useState } from "react";

function HabitCard({ habit, number }) {
  const [completionLevel, setCompletionLevel] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLevels = Boolean(habit.has_levels);
  const circleCount = hasLevels ? 3 : 1;
  const detailsId = `habit-details-${habit.id ?? number}`;

  function selectCompletion(level) {
    setCompletionLevel((currentLevel) =>
      currentLevel === level ? 0 : level,
    );
  }

  function advanceCompletion(event) {
    const clickedButton =
      event.target instanceof Element && event.target.closest("button");

    if (clickedButton) {
      return;
    }

    setCompletionLevel((currentLevel) => (currentLevel + 1) % (circleCount + 1));
  }

  function handleCardKeyDown(event) {
    if (
      event.target === event.currentTarget &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      setCompletionLevel((currentLevel) => (currentLevel + 1) % (circleCount + 1));
    }
  }

  return (
    <article
      className={`habit-card${completionLevel > 0 ? " habit-card--active" : ""}`}
      role="group"
      tabIndex={0}
      aria-label={`${habit.name} habit card. Press Enter or Space to update completion.`}
      onClick={advanceCompletion}
      onKeyDown={handleCardKeyDown}
    >
      <div className="habit-card__top">
        <h3 className="habit-card__title">{habit.name}</h3>
        <div className="habit-card__top-actions">
          <div
            className="habit-card__completion"
            role="group"
            aria-label={`${habit.name} completion`}
          >
            {Array.from({ length: circleCount }, (_, index) => {
              const level = index + 1;
              const levelDescription = habit.levels?.[index];
              const isSelected = completionLevel === level;
              const isCompleted = completionLevel >= level;

              return (
                <button
                  className="habit-card__completion-button"
                  key={level}
                  type="button"
                  aria-label={
                    hasLevels
                      ? `Set ${habit.name} to level ${level}${levelDescription ? `: ${levelDescription}` : ""}`
                      : isSelected
                        ? `Mark ${habit.name} incomplete`
                        : `Mark ${habit.name} complete`
                  }
                  aria-pressed={isSelected}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectCompletion(level);
                  }}
                >
                  <span
                    className={`completion-dot${completionLevel >= level ? " completion-dot--filled" : ""}`}
                    aria-hidden="true"
                  >
                    {isCompleted && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3.25 8.25 3 3 6.5-6.5" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            className="habit-card__action-button habit-card__expand-button"
            type="button"
            aria-label={isExpanded ? "Collapse habit details" : "Expand habit details"}
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((expanded) => !expanded);
            }}
          >
            <svg
              className="habit-card__expand-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={isExpanded ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`habit-card__expanded${isExpanded ? " habit-card__expanded--open" : ""}`}
        id={detailsId}
        aria-hidden={!isExpanded}
      >
        <div className="habit-card__expanded-inner">
          {habit.description?.trim() && (
            <p className="habit-card__description">{habit.description.trim()}</p>
          )}

          {hasLevels ? (
            <div className="habit-card__level-details">
              <p className="habit-card__completion-heading">
                Completion levels
              </p>
              <ol>
                {Array.from({ length: 3 }, (_, index) => (
                  <li key={index}>
                    <span>Level {index + 1}</span>
                    <span>
                      {habit.levels?.[index]?.trim() || "No description provided"}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="habit-card__status">
                {completionLevel > 0
                  ? `Currently at Level ${completionLevel}.`
                  : "No level selected yet."}
              </p>
            </div>
          ) : (
            <div className="habit-card__level-details">
              <p className="habit-card__completion-heading">
                Standard completion
              </p>
              <p className="habit-card__status">
                {completionLevel > 0
                  ? "Completed for now."
                  : "Not completed yet."}
              </p>
            </div>
          )}
          <p className="habit-card__persistence-note">
            Completion is only tracked in this session.
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="habit-card__actions">
          <button
            className="habit-card__action-button"
            type="button"
            aria-label="Edit habit (coming soon)"
            title="Coming soon"
            disabled
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 5 4 4" />
              <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}

export default HabitCard;
