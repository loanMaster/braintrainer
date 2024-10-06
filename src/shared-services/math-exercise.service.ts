import { requestHelper } from 'src/shared-services/request.helper';

export interface MathExerciseRequest {
  lang: string;
  difficulty: string;
}

export interface Equation {
  result: string;
  formula: string;
  formulaToRead: string;
}

export interface IEquation {
  a: number;
  b: number;
  c: number;
  operation: string;
  x: number;
  toFormula: (variant?: number) => string;
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
  operation: string;
  result: number;
  initial?: number;
  asText: string;
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

export const getRandomInteger = (
  min: number,
  max: number,
  cap: number = Number.MAX_SAFE_INTEGER
) => {
  if (min > max) {
    throw Error('min must not be larger than max in getRandomNumber');
  }
  return Math.floor(Math.random() * (Math.min(max, cap) - min) + min);
};

export interface MathExercise {
  first: number;
  second: number;
  operation: string;
  result: number;
  asText: string;
}

abstract class AbstractEquation implements IEquation {
  public a: number;
  public b: number;
  public c: number;
  public x: number;
  public operation: string;

  abstract getPlaceHolder(): string;

  toFormula(variant: number = Math.floor(Math.random() * 3)) {
    const x = this.getPlaceHolder();
    if (this.operation === '-') {
      return `${this.a}${x}-${this.b}=${this.c}`;
    }
    switch (variant % 3) {
      case 0:
        return `${this.a}${x}+${this.b}=${this.c}`;
      case 1:
        return `${this.b}+${this.a}${x}=${this.c}`;
      default:
        return `${this.c}-${this.a}${x}=${this.b}`;
    }
  }
}

export class LinearEquation extends AbstractEquation {
  public a: number;
  public b: number;
  public c: number;
  public x: number;
  public operation: string;
  constructor(difficulty = 'easy') {
    super();
    this.operation = Math.random() > 0.25 ? '+' : '-';
    this.a =
      difficulty === 'easy'
        ? getRandomInteger(2, 10)
        : difficulty === 'normal'
        ? getRandomInteger(2, 20)
        : getRandomInteger(11, 19);
    this.x =
      difficulty === 'easy' ? getRandomInteger(0, 10) : getRandomInteger(0, 20);
    const max =
      this.operation === '-' ? this.a * this.x : Number.MAX_SAFE_INTEGER;
    this.b =
      difficulty === 'easy'
        ? getRandomInteger(2, 10, max)
        : difficulty === 'normal'
        ? getRandomInteger(2, 20, max)
        : getRandomInteger(2, 100, max);
    this.c = this.a * this.x + this.b * (this.operation === '+' ? 1 : -1);
  }

  getPlaceHolder() {
    return 'x';
  }
}

export class QuadraticEquation extends AbstractEquation {
  public a: number;
  public b: number;
  public c: number;
  public x: number;
  public operation: string;
  constructor(difficulty = 'normal') {
    super();
    this.operation = Math.random() > 0.5 ? '+' : '-';
    this.a =
      difficulty === 'normal'
        ? getRandomInteger(2, 7)
        : getRandomInteger(5, 25);
    this.x =
      difficulty === 'normal'
        ? getRandomInteger(2, 7)
        : getRandomInteger(2, 10);
    const max =
      this.operation === '-'
        ? this.a * this.x * this.x
        : Number.MAX_SAFE_INTEGER;
    this.b =
      difficulty === 'normal'
        ? getRandomInteger(2, 10, max)
        : getRandomInteger(2, 20, max);
    this.c =
      this.a * this.x * this.x + this.b * (this.operation === '+' ? 1 : -1);
  }

  getPlaceHolder() {
    return 'x²';
  }
}

export class SqrtEquation extends AbstractEquation {
  public a: number;
  public b: number;
  public c: number;
  public x: number;
  public operation: string;
  constructor(difficulty = 'normal') {
    super();
    this.operation = Math.random() > 0.5 ? '+' : '-';
    this.a =
      difficulty === 'normal'
        ? getRandomInteger(2, 7)
        : getRandomInteger(11, 19);
    const sqrt =
      difficulty === 'normal' ? getRandomInteger(2, 7) : getRandomInteger(2, 7);
    this.x = sqrt * sqrt;
    const max =
      this.operation === '-' ? this.a * sqrt : Number.MAX_SAFE_INTEGER;
    this.b =
      difficulty === 'normal'
        ? getRandomInteger(2, 10, max)
        : getRandomInteger(2, 20, max);
    this.c = this.a * sqrt + this.b * (this.operation === '+' ? 1 : -1);
  }

  getPlaceHolder() {
    return '×√x';
  }
}

export class MathExerciseService {
  get serverPath() {
    return serverPath || '';
  }

  hasDigitsFlip(num1: number, num2: number, plus = true) {
    const str1 = String(num1);
    const str2 = String(num2);
    for (let idx = 0; idx < Math.min(str1.length, str2.length); idx++) {
      if (
        plus &&
        Number(str1[str1.length - idx - 1]) +
          Number(str2[str2.length - idx - 1]) >
          10
      ) {
        return true;
      }
      if (
        !plus &&
        Number(str1[str1.length - idx - 1]) <
          Number(str2[str2.length - idx - 1])
      ) {
        return true;
      }
    }
    return false;
  }

  endsWithZero(number: number) {
    return Math.floor(number / 10) * 10 === number;
  }

  getNumberPairWithDigitsFlip(digits = 3, plus = true) {
    let first = -1;
    let second = -1;
    let attempts = 0;
    const isSuccess = () => {
      return (
        first &&
        second &&
        second !== 0 &&
        first !== second &&
        (plus || second < first) &&
        this.hasDigitsFlip(first, second, plus) &&
        !this.endsWithZero(first) &&
        !this.endsWithZero(second)
      );
    };
    while (attempts < 30 && !isSuccess()) {
      first = getRandomInteger(
        Math.pow(10, digits - 1),
        Math.pow(10, digits) - 1
      );
      const max = plus
        ? Math.pow(10, digits) - 1 - first
        : Math.max(0, first - Math.pow(10, digits - 1));
      second = getRandomInteger(Math.min(max, Math.pow(10, digits - 1)), max);
      attempts++;
    }
    return { first, second, success: isSuccess() };
  }

  getNumberCausingDigitsFlip(
    start: number,
    digits = 3,
    plus = true
  ): { num: number; success: boolean } {
    let newNum = -1;
    let attempts = 0;
    const isSuccess = () => {
      return (
        newNum &&
        this.hasDigitsFlip(start, newNum, plus) &&
        !this.endsWithZero(newNum)
      );
    };
    while (attempts < 30 && !isSuccess()) {
      const max = plus
        ? Math.pow(10, digits) - 1
        : Math.max(0, start - Math.pow(10, digits - 1));
      newNum = getRandomInteger(Math.min(max, Math.pow(10, digits - 1)), max);
      attempts++;
    }
    return { num: newNum, success: isSuccess() || false };
  }

  createAddSubExercise(difficulty: 'easy' | 'normal' | 'hard'): MathExercise {
    const digits = difficulty === 'easy' ? 2 : difficulty === 'normal' ? 3 : 4;
    const plus = Math.random() > 0.5;
    const result = this.getNumberPairWithDigitsFlip(digits, plus);
    return {
      first: result.first,
      second: result.second,
      operation: plus ? '+' : '-',
      result: plus
        ? result.first + result.second
        : result.first - result.second,
      asText: result.first + ' ' + (plus ? 'plus' : 'minus') + result.second,
    };
  }

  createMulDivExercise(
    difficulty: 'easy' | 'normal' | 'hard',
    lang?: string
  ): MathExercise {
    const operation = Math.random() > 0.5 ? '*' : '/';
    const a =
      difficulty === 'easy' ? getRandomInteger(2, 9) : getRandomInteger(11, 19);
    const b =
      difficulty === 'hard'
        ? getRandomInteger(21, 99)
        : getRandomInteger(11, 19);
    const order = Math.random() > 0.5;
    const c = a * b;
    const first = operation === '/' ? c : order ? a : b;
    const second = order ? b : a;
    const operationText =
      operation === '*'
        ? lang === 'en'
          ? ' times '
          : ' mal '
        : lang === 'en'
        ? ' divided by '
        : ' geteilt durch ';
    return {
      first,
      second,
      operation,
      result: operation === '*' ? c : order ? a : b,
      asText: first + ' ' + operationText + ' ' + second,
    };
  }

  createEquation(query: MathExerciseRequest) {
    let eq: IEquation;
    if (query.difficulty === 'easy' || Math.random() < 0.33) {
      eq = new LinearEquation(query.difficulty);
    } else if (Math.random() < 0.5) {
      eq = new SqrtEquation(query.difficulty);
    } else {
      eq = new QuadraticEquation(query.difficulty);
    }
    const formula = eq.toFormula();
    return {
      formula: formula,
      formulaToRead: formula
        .replace(/x/g, ' X ')
        .replace('√', query.lang === 'en' ? ' squareroot ' : ' wurzel ')
        .replace(/\+/g, ' plus ')
        .replace(/-/g, ' minus ')
        .replace(/=/g, query.lang === 'en' ? ' equals ' : ' is gleich '),
      result: String(eq.x),
    };
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  getNextCalculation(
    query: ContinuationExerciseRequest
  ): ContinuationExerciseResponse {
    const digits =
      query.difficulty === 'easy' ? 2 : query.difficulty === 'normal' ? 3 : 4;
    const initialVal =
      query.current ||
      this.getRandomNumber(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    let result: number | undefined;
    let tmp: any;
    if (
      query.current &&
      query.current <= Math.pow(10, digits) / 3 &&
      Math.random() < 0.75
    ) {
      // multiply
      const next = Math.random() > 0.5 ? 3 : 2;
      tmp = { val: next, operation: '*' };
      result = initialVal * next;
    } else {
      const op =
        Math.random() > 0.5 || initialVal > Math.pow(10, digits) ? '-' : '+';
      if (op === '-') {
        const minusOption = this.getNumberCausingDigitsFlip(
          initialVal,
          digits,
          false
        );
        if (minusOption.success) {
          tmp = { val: Math.abs(minusOption.num), operation: '-' };
          result = initialVal - Math.abs(minusOption.num);
        }
      }
      if (result === undefined) {
        const plusOption = this.getNumberCausingDigitsFlip(
          initialVal,
          digits,
          true
        );
        tmp = { val: Math.abs(plusOption.num), operation: '+' };
        result = initialVal + Math.abs(plusOption.num);
      }
    }
    const operationText =
      tmp.operation === '*'
        ? query.lang === 'en'
          ? ' times '
          : ' mal '
        : tmp.operation === '/'
        ? query.lang === 'en'
          ? ' divided by '
          : ' geteilt durch '
        : tmp.operation === '+'
        ? ' plus '
        : ' minus ';
    return {
      val: tmp.val,
      operation: tmp.operation,
      result,
      initial: query.current ? undefined : initialVal,
      asText: operationText + tmp.val,
    };
  }
}
