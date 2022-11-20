import {Exercise} from "stores/app-store";

export const calculateScore = (exercise: Exercise) => {
  const percentageCorrect = exercise.correctAnswers / exercise.totalQuestions
  const percentageRemainingTime = 1 // TODO!
  const numberOfErrors = exercise.strikes

  const baseScore = exercise.difficulty === 'easy'
    ? 1200
    : exercise.difficulty === 'normal' ? 1400 : 1600

  const errorPenalty = exercise.difficulty === 'easy'
    ? -50
    : exercise.difficulty === 'normal' ? -80 : -100

  if (percentageCorrect < 1.0 || numberOfErrors > 0) {
    return Math.max(Math.floor(percentageCorrect * baseScore + Math.min(8, numberOfErrors) * errorPenalty + percentageRemainingTime * 50), 100)
  } else {
    return Math.floor(baseScore + percentageRemainingTime * 275 + 5 / Math.pow((1 - percentageRemainingTime), 2))
  }
}
