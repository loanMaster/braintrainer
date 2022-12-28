import { Exercise } from 'stores/app-store';

export const calculateScore = (exercise: Exercise) => {
  const percentageCorrect = exercise.correctAnswers / exercise.totalQuestions;

  const minTime = exercise.totalAudioDuration;
  const maxScore = percentageCorrect * 100;
  const errorPenalty = 5 * exercise.totalStrikeCount;
  const time_divisor =
    exercise.difficulty === 'easy'
      ? 6_000
      : exercise.difficulty === 'normal'
      ? 9_000
      : 12_000;
  const timePenalty = Math.min(
    50,
    (exercise.duration - minTime) / time_divisor
  );

  return (
    Math.floor(Math.max(0, maxScore - errorPenalty - timePenalty) * 10) / 10
  );
};
