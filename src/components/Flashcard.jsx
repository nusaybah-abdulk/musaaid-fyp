/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

export default function Flashcard({
  front,
  back,
  flipped = false,
  frontClassName = "",
  backClassName = "",
}) {
  const [isFlipped, setIsFlipped] = useState(flipped);

  // if the parent allFlippeed then state updates and flips all, useeffect to keep it in sync
  useEffect(() => {
    setIsFlipped(flipped);
  }, [flipped]);

  function handleFlip() {
    setIsFlipped((prev) => !prev);
  }

  // flips with keyboard
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  }

  return (
    <button
      type="button"
      className={`flashcard ${isFlipped ? "is-flipped" : ""}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      aria-pressed={isFlipped}
    >
      <div className="flashcard-inner">
        <div className="flashcard-face flashcard-front">
          <p className={frontClassName}>{front}</p>
        </div>

        <div className="flashcard-face flashcard-back">
          <p className={backClassName}>{back}</p>
        </div>
      </div>
    </button>
  );
}