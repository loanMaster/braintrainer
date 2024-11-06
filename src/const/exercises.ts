export interface ExerciseConfig {
  name: string;
  category: 'memory' | 'math' | 'knowledge' | 'language';
  audio: boolean;
  numberOfQuestions?: number[];
  enableSkip: boolean;
  minLength?: number[];
  maxLength?: number[];
  sequenceLength?: number[];
}

export const exercises: ExerciseConfig[] = [
  {
    name: 'spell-backwards',
    category: 'language',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
    minLength: [3, 5, 7],
    maxLength: [5, 9, 16],
  },
  {
    name: 'word-scramble',
    category: 'language',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
    minLength: [3, 5, 6],
    maxLength: [4, 6, 7],
  },
  {
    name: 'find-relative',
    category: 'language',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
    sequenceLength: [3, 4, 5],
  },
  {
    name: 'language-basics',
    category: 'language',
    audio: true,
    numberOfQuestions: [5, 7, 9],
    enableSkip: true,
  },
  {
    name: 'countries-and-capitals',
    category: 'knowledge',
    audio: false,
    numberOfQuestions: [7, 7, 7],
    enableSkip: true,
  },
  {
    name: 'mental-arithmetic',
    category: 'math',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
  },
  {
    name: 'mental-arithmetic-mul',
    category: 'math',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
  },
  {
    name: 'math-marathon',
    category: 'math',
    audio: true,
    numberOfQuestions: [15, 15, 15],
    enableSkip: true,
  },
  {
    name: 'solve-equation',
    category: 'math',
    audio: true,
    numberOfQuestions: [6, 6, 6],
    enableSkip: true,
  },
  {
    name: 'remember-words',
    category: 'memory',
    audio: true,
    numberOfQuestions: [5, 5, 5],
    enableSkip: true,
    sequenceLength: [6, 9, 12],
    minLength: [3, 3, 3],
    maxLength: [12, 12, 12],
  },
  {
    name: 'remember-numbers',
    category: 'memory',
    audio: true,
    numberOfQuestions: [5, 5, 5],
    enableSkip: true,
    sequenceLength: [6, 8, 10],
  },
  {
    name: 'remember-names',
    category: 'memory',
    audio: true,
    numberOfQuestions: [5, 7, 10],
    enableSkip: true,
  },
  {
    name: 'memory-animals',
    category: 'memory',
    audio: true,
    numberOfQuestions: [6, 12, 20],
    enableSkip: false,
    minLength: [3, 3, 3],
    maxLength: [14, 14, 14],
  },
  {
    name: 'memory',
    category: 'memory',
    audio: true,
    numberOfQuestions: [6, 12, 20],
    enableSkip: false,
    minLength: [3, 3, 3],
    maxLength: [14, 14, 14],
  },
  {
    name: 'voices-memory',
    category: 'memory',
    audio: true,
    numberOfQuestions: [4, 5, 6],
    enableSkip: false,
    minLength: [3, 3, 3],
    maxLength: [14, 14, 14],
  },
  {
    name: 'picture-memory',
    category: 'memory',
    audio: false,
    numberOfQuestions: [6, 12, 20],
    enableSkip: false,
  },
];
