import { useAppStore } from 'stores/app-store';

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

export interface ScoreHistory {
  scores: Score[];
}

export interface PlayerScores {
  scores: PercentileScore[];
}

export interface HighScoreDto {
  difficulty: string;
  nameOfTheGame: string;
  playerName: string;
  score: number;
  date: number;
  isYou: boolean;
  yourScore: number | undefined;
}

export interface ScoreUpdate {
  nameOfTheGame: string;
  difficulty: string;
  score: number;
  id: string;
  name: string;
}

export interface UpdateScoreResponse {
  percentile: number;
  isNewHighScore: boolean;
}

export class ScoreService {
  private get store() {
    return useAppStore();
  }

  private getStandardRequestInit(): RequestInit {
    return {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-machine': this.store.machineId,
        'x-player': this.store.player.id,
      },
    };
  }

  get serverPath() {
    return serverPath || '';
  }

  async updateScore(scoreUpdate: ScoreUpdate): Promise<UpdateScoreResponse> {
    const scoreAsDoubleBase64 = btoa(btoa(JSON.stringify(scoreUpdate)));
    const inverted = scoreAsDoubleBase64.split('').reverse().join('');

    const response = await fetch(this.serverPath + '/player/raw', {
      ...this.getStandardRequestInit(),
      method: 'PUT',
      body: JSON.stringify({ v: inverted }),
    });
    return response.json();
  }

  async fetchHighscores(): Promise<{ scores: HighScoreDto[] }> {
    const response = await fetch(this.serverPath + '/player/highscores', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify({ id: this.store.player.id }),
    });
    return response.json();
  }

  async fetchPlayerScorePercentiles(): Promise<PercentileScore[]> {
    if (!this.store.playerScores || !this.store.playerScores!.hasPercentiles) {
      const response = await fetch(
        this.serverPath + `/player/${this.store.player.id}/score-percentiles`,
        {
          ...this.getStandardRequestInit(),
          method: 'GET',
        }
      );
      const scores = (await response.json()).scores;
      this.store.$patch({ playerScores: { hasPercentiles: true, scores } });
    }
    return this.store.playerScores!.scores;
  }

  async fetchPlayerScores(): Promise<Score[]> {
    if (!this.store.playerScores) {
      const response = await fetch(
        this.serverPath + `/player/${this.store.player.id}/scores`,
        {
          ...this.getStandardRequestInit(),
          method: 'GET',
        }
      );
      const scores = (await response.json()).scores;
      this.store.$patch({ playerScores: { hasPercentiles: false, scores } });
    }
    return this.store.playerScores!.scores;
  }

  async fetchPlayerScoreHistory(): Promise<Score[]> {
    if (this.store.scoreHistory === undefined) {
      const response = await fetch(
        this.serverPath + `/player/${this.store.player.id}/score-history`,
        {
          ...this.getStandardRequestInit(),
          method: 'GET',
        }
      );
      const scoreHistory = (await response.json()).scores;
      this.store.$patch({ scoreHistory });
    }
    return this.store.scoreHistory!;
  }
}
