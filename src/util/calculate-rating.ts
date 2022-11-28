import { Exercise } from 'stores/app-store';

export const calculateRating = (exerciseResult: Exercise) => {
  const percentageCorrect =
    exerciseResult.correctAnswers / exerciseResult.totalQuestions;
  const numberOfErrors = exerciseResult.strikes;
  const errorQuote = exerciseResult.strikes / exerciseResult.totalQuestions;
  if (errorQuote <= 0.1 && percentageCorrect === 1.0) {
    return 3;
  } else if (
    percentageCorrect === 1 &&
    (numberOfErrors < 3 || errorQuote <= 0.2)
  ) {
    return 2;
  } else if (percentageCorrect > 0.5) {
    return 1;
  }
  return 0;
};
