import { useAppStore } from 'stores/app-store';
import { useAuthStore } from 'stores/auth-store';
import { requestHelper } from './request.helper';

export interface Player {
  name: string;
  scores: Score[];
  scoreHistory: Score[];
}

export interface Score {
  nameOfTheGame: string;
  difficulty: string;
  date: number;
  score: number;
}

export interface PercentileScore {
  nameOfTheGame: string;
  difficulty: string;
  date: number;
  score: number;
  percentile: number;
}

export interface HighScoreDto {
  difficulty: string;
  nameOfTheGame: string;
  playerName: string;
  image: string;
  score: number;
  date: number;
  isYou: boolean;
  yourScore: number | undefined;
}

export interface ScoreUpdate {
  nameOfTheGame: string;
  difficulty: string;
  score: number;
}

export interface UpdateScoreResponse {
  percentile: number;
  isNewHighScore: boolean;
}

export class ScoreService {
  private get store() {
    return useAppStore();
  }

  get serverPath() {
    return serverPath || '';
  }

  async updateScore(scoreUpdate: ScoreUpdate): Promise<UpdateScoreResponse> {
    const scoreAsDoubleBase64 = btoa(btoa(JSON.stringify(scoreUpdate)));
    const inverted = scoreAsDoubleBase64.split('').reverse().join('');

    const response = await fetch(this.serverPath + '/player/raw', {
      ...requestHelper.getStandardRequestInit(),
      method: 'PUT',
      body: JSON.stringify({ v: inverted }),
    });
    return response.json();
  }

  async fetchHighscores(): Promise<{ scores: HighScoreDto[] }> {
    const response = await fetch(this.serverPath + '/player/highscores', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify({ id: useAuthStore().id || '' }),
    });
    return response.json();
  }

  async fetchPlayerScorePercentiles(): Promise<PercentileScore[]> {
    if (!useAuthStore().isLoggedIn) {
      return [];
    }
    if (!this.store.playerScores || !this.store.playerScores!.hasPercentiles) {
      const response = await fetch(
        this.serverPath + '/player/score-percentiles',
        {
          ...requestHelper.getStandardRequestInit(),
          method: 'GET',
        }
      );
      const scores = (await response.json()).scores;
      this.store.$patch({ playerScores: { hasPercentiles: true, scores } });
    }
    return this.store.playerScores!.scores;
  }

  async fetchPlayerScores(): Promise<Score[]> {
    if (!useAuthStore().isLoggedIn) {
      return [];
    }
    if (!this.store.playerScores) {
      const response = await fetch(this.serverPath + '/player/scores', {
        ...requestHelper.getStandardRequestInit(),
        method: 'GET',
      });
      const scores = (await response.json()).scores;
      this.store.$patch({ playerScores: { hasPercentiles: false, scores } });
    }
    return this.store.playerScores!.scores;
  }

  async fetchPlayerScoreHistory(): Promise<Score[]> {
    if (!useAuthStore().isLoggedIn) {
      return [];
    }
    if (this.store.scoreHistory === undefined) {
      const response = await fetch(this.serverPath + '/player/score-history', {
        ...requestHelper.getStandardRequestInit(),
        method: 'GET',
      });
      const scoreHistory = (await response.json()).scores;
      this.store.$patch({ scoreHistory });
    }
    return this.store.scoreHistory!;
  }
}
