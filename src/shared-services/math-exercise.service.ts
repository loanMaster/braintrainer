import { requestHelper } from 'src/shared-services/request.helper';

export interface MathExerciseRequest {
  lang: string;
  difficulty: string;
}

export interface EquationResponse {
  audio: string[];
  result: string;
  formula: string;
}

export interface ContinuationExerciseRequest {
  lang: string;
  difficulty: string;
  current?: number;
}

export interface ContinuationExerciseResponse {
  val: number;
  audio: string;
  operation: string;
  result: number;
  initial?: {
    val: number;
    audio: string;
  };
}

export interface MathExerciseResponse {
  first: {
    val: number;
    audio: string;
  };
  second: {
    val: number;
    audio: string;
  };
  operation: string;
  result: number;
}

export class MathExerciseService {
  get serverPath() {
    return serverPath || '';
  }

  async fetchAddSubExercise(
    request: MathExerciseRequest
  ): Promise<MathExerciseResponse> {
    const response = await fetch(this.serverPath + '/maths/add-sub-exercise', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async fetchMatMulExercise(
    request: MathExerciseRequest
  ): Promise<MathExerciseResponse> {
    const response = await fetch(this.serverPath + '/maths/mul-div-exercise', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async fetchEquation(request: MathExerciseRequest): Promise<EquationResponse> {
    const response = await fetch(this.serverPath + '/maths/equation', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async fetchContinuationExercise(
    request: ContinuationExerciseRequest
  ): Promise<ContinuationExerciseResponse> {
    const response = await fetch(
      this.serverPath + '/maths/continuation-exercise',
      {
        ...requestHelper.getStandardRequestInit(),
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.json();
  }
}
