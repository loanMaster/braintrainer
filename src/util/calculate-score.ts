import { Exercise } from 'stores/app-store';

export const calculateScore = (exercise: Exercise) => {
  const percentageCorrect = exercise.correctAnswers / exercise.totalQuestions

  const maxScore = percentageCorrect * 100
  const errorPenalty = 5 * exercise.strikes
  const timePenalty = Math.min(30, exercise.duration / 2000)

  return Math.floor(Math.max(0, maxScore - errorPenalty - timePenalty) * 10) / 10;
};

