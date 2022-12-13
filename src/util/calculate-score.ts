import { Exercise } from 'stores/app-store';

export const calculateScore = (exercise: Exercise) => {
  const percentageCorrect = exercise.correctAnswers / exercise.totalQuestions;

  const minTime = exercise.totalAudioDuration;
  const maxScore = percentageCorrect * 100;
  const errorPenalty = 5 * exercise.totalStrikeCount;
  const timePenalty = Math.min(50, (exercise.duration - minTime) / 6_000);

  console.log(
    `TODO minTime ${minTime}. time penalty ${timePenalty}. strikes ${exercise.totalStrikeCount} error penalty ${errorPenalty}`
  );
  return (
    Math.floor(Math.max(0, maxScore - errorPenalty - timePenalty) * 10) / 10
  );
};
