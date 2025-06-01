// helper/quizHelper.js

/**
 * Randomly shuffle an array (Fisher–Yates).
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
   * Given a question object of the form:
   *   {
   *     question: "…",
   *     options: ["A", "B", "C", "D"],
   *     correct: 1, // index into options
   *     …otherProps
   *   }
   * shuffle its options and return a new question with the correct index updated.
   */
  export function shuffleQuestionOptions(question) {
    const shuffledOptions = shuffleArray(question.options);
    const originalCorrect = question.options[question.correct];
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrect);
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex,
    };
  }