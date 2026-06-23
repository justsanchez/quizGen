// helper/quizHelper.js

/**
 * Return a new array with the input shuffled in place via Fisher–Yates.
 * Pure: the input array is not mutated.
 *
 * @template T
 * @param {T[]} array
 * @returns {T[]} A new shuffled copy.
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Shuffle a quiz question's options and re-map `correct` to the new index.
   * Used to randomize answer order on every render so users can't memorize
   * positions.
   *
   * @param {{ question: string, options: string[], correct: number, explanation?: string }} question
   * @returns {{ question: string, options: string[], correct: number, explanation?: string }}
   *   Same shape, with `options` shuffled and `correct` updated.
   */
  export function shuffleQuestionOptions(question) {
    const shuffledOptions = shuffleArray(question.options);
    const originalCorrectAnswer = question.options[question.correct];
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectAnswer);
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex,
    };
  }

  /**
   * Coerce a quiz set's `tags` into a clean string array. Handles all three
   * shapes that have ended up in the `tags` text column: a real array, a plain
   * comma-separated string, and a JSON-array string like `["#a","#b"]` (written
   * by an earlier version that saved a JS array into the text column).
   *
   * @param {string[]|string|null|undefined} tags
   * @returns {string[]}
   */
  export function normalizeTags(tags) {
    if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof tags === "string") {
      const s = tags.trim();
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
        } catch { /* not valid JSON — fall through to comma split */ }
      }
      return s.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }