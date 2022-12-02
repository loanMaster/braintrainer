import { Player, useAppStore } from 'stores/app-store';
import { GAMES } from 'src/const/games';
import { randomElement } from 'src/util/array.utils';

export class DailyTrainingService {
  getNextExercise(): { nameOfTheGame: string; difficulty: string } {
    const player: Player = useAppStore().player;
    const exerciseHistory = [...player.exerciseHistory];
    const lastPlayedGames = exerciseHistory.slice(-6);

    const nextPossibleGames = GAMES.filter(
      (g) => lastPlayedGames.indexOf(g) === -1
    );

    const nextGame = randomElement(nextPossibleGames);

    const averageEasy = player.averageRatings[nextGame]?.['easy'] || 0;
    const averageNormal = player.averageRatings[nextGame]?.['normal'] || 0;
    const averageHard = player.averageRatings[nextGame]?.['hard'] || 0;

    const nextDifficulty =
      averageHard > 1 || averageNormal > 2.5
        ? 'hard'
        : averageNormal > 1 || averageEasy > 2.5
        ? 'normal'
        : 'easy';
    return { nameOfTheGame: nextGame, difficulty: nextDifficulty };
  }

  hasNext() {
    if (
      useAppStore().dailyTraining.results.find(
        (r) => r.nameOfTheGame.indexOf('MathMarathon') > -1
      )
    ) {
      return useAppStore().dailyTraining.results.length < 2;
    } else {
      return useAppStore().dailyTraining.results.length < 3;
    }
  }
}
