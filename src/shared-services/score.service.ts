import { useAppStore } from 'stores/app-store';

export interface Score {
  easy: number;
  normal: number;
  hard: number;
}

export interface Scores {
  [key: string]: Score;
}

export interface PlayerPercentiles {
  [key: string]: Percentiles;
}

export interface Percentiles {
  easy: Percentile;
  normal: Percentile;
  hard: Percentile;
}

export interface Percentile {
  score: number;
  percentile: number;
}

export interface HighScoreDto {
  playerName: string;
  score: number;
  date: number;
  isYou: boolean;
  yourScore: number;
}

export interface GameHighScoreDto {
  easy?: HighScoreDto;
  normal?: HighScoreDto;
  hard?: HighScoreDto;
}

export interface HighScoresDto {
  [key: string]: GameHighScoreDto;
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

  async fetchHighscores(): Promise<HighScoresDto> {
    const response = await fetch(this.serverPath + '/player/highscores', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify({ id: this.store.player.id }),
    });
    return response.json();
  }

  async fetchPlayerScores(): Promise<PlayerPercentiles> {
    const response = await fetch(
      this.serverPath + `/player/${this.store.player.id}/score-percentiles`,
      {
        ...this.getStandardRequestInit(),
        method: 'GET',
      }
    );
    return response.json();
  }
}
