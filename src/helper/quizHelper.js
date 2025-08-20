// helper/quizHelper.js

/**
 * Randomly shuffle an array (Fisher–Yates shuffle algorithm).
 * The Fisher–Yates shuffle is an algorithm for shuffling a finite sequence. 
 * The algorithm takes a list of all the elements of the sequence, and 
 * continually determines the next element in the shuffled sequence 
 * by randomly drawing an element from the list until no elements remain
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
    const originalCorrectAnswer = question.options[question.correct];
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectAnswer);
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex,
    };
  }