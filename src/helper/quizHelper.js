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