import React, { useEffect, useState } from "react";
import { shuffleArray } from "../helper/quizHelper";
import "../styles/Flashcard.css";

/**
 * Flashcard study mode. Reuses the same quiz `response` data as `QuizSection`:
 * the front of each card is the question, the back is the correct answer
 * (`options[correct]`) with the explanation shown underneath as support.
 *
 * Click the card (or press Space/Enter) to flip; ←/→ navigate. Shuffle
 * re-orders a local copy of the cards without mutating the prop.
 *
 * @component
 * @param {Object} props
 * @param {Array<{question:string,options:string[],correct:number,explanation:string}>} props.response
 * @returns {JSX.Element}
 */
export default function FlashcardSection({ response }) {
  const [cards, setCards] = useState(() => response ?? []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goTo = (nextIndex) => {
    if (cards.length === 0) return;
    // wrap around
    const wrapped = (nextIndex + cards.length) % cards.length;
    setIndex(wrapped);
    setFlipped(false);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);
  const flip = () => setFlipped((f) => !f);

  const shuffle = () => {
    setCards((prev) => shuffleArray(prev));
    setIndex(0);
    setFlipped(false);
  };

  // Keyboard: ←/→ navigate, Space/Enter flip. Mounted only while this tab is active.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards.length]);

  if (!response?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">🃏</div>
        <p>No flashcards available for this quiz.</p>
      </div>
    );
  }

  const current = cards[index];
  const answer = current?.options?.[current?.correct] ?? "—";

  return (
    <div className="w-full max-w-2xl mx-auto p-4 text-gray-200">
      {/* Top bar: shuffle + progress */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={shuffle}
          className="text-sm px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          Shuffle
        </button>
        <span className="text-sm text-gray-400">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div className="flashcard-scene">
        <div
          className={`flashcard bg-gray-800 border border-gray-700 ${flipped ? "is-flipped" : ""}`}
          onClick={flip}
          role="button"
          tabIndex={0}
          aria-label="Flashcard — click to flip"
        >
          {/* Front: question */}
          <div className="flashcard-face">
            <span className="text-xs uppercase tracking-wide text-gray-500 mb-3">Question</span>
            <p className="text-lg font-medium">{current?.question}</p>
            <span className="text-xs text-gray-500 mt-4">Click to reveal the answer</span>
          </div>

          {/* Back: answer + explanation */}
          <div className="flashcard-face flashcard-face--back bg-gray-800">
            <span className="text-xs uppercase tracking-wide text-blue-400 mb-2">Answer</span>
            <p className="text-lg font-semibold text-green-400">{answer}</p>
            {current?.explanation && (
              <p className="text-sm text-gray-300 mt-3 leading-relaxed">{current.explanation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mt-5">
        <button
          onClick={prev}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={flip}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium transition-colors"
        >
          Flip
        </button>
        <button
          onClick={next}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        >
          Next →
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        Tip: use ← / → to navigate and Space to flip.
      </p>
    </div>
  );
}
