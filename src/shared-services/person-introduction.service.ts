import { randomElement, shuffle } from '../util/array.utils';

const names: { [lang: string]: { FEMALE: string[]; MALE: string[] } } = {
  de: {
    FEMALE: [
      'Claudia',
      'Sarah',
      'Miriam',
      'Heidi',
      'Anna',
      'Emilia',
      'Hanna',
      'Sophia',
      'Emma',
      'Mia',
      'Ella',
    ],
    MALE: [
      'Stefan',
      'Martin',
      'Albert',
      'Otto',
      'Alfred',
      'Matteo',
      'Noah',
      'Leon',
      'Finn',
      'Elias',
    ],
  },
  en: {
    FEMALE: [
      'Olivia',
      'Ava',
      'Ivy',
      'Lily',
      'Florence',
      'Carol',
      'Willow',
      'Rosie',
      'Sophia',
      'Isabella',
      'Grace',
    ],
    MALE: [
      'Noah',
      'Oliver',
      'George',
      'Arthur',
      'Muhammad',
      'Leo',
      'Harry',
      'Oscar',
      'Archie',
    ],
  },
  es: {
    FEMALE: [
      'Lucia',
      'Sofia',
      'Vega',
      'Maria',
      'Julia',
      'Paula',
      'Alma',
      'Emma',
      'Daniela',
      'Noa',
    ],
    MALE: [
      'Hugo',
      'Mateo',
      'Miguel',
      'Lucas',
      'Leo',
      'Daniel',
      'Gael',
      'Manuel',
      'Pablo',
      'Jose',
    ],
  },
};

const introductions: { [lang: string]: string[] } = {
  de: ['Das ist {name}', '{name}', '{name}'],
  en: ['This is {name}', '{name}', '{name}'],
  es: ['Eso es {name}', '{name}', '{name}'],
};

export interface Introductions {
  introductions: Introduction[];
  optionalNames: {
    FEMALE: string[];
    MALE: string[];
  };
}

export interface Introduction {
  text: string;
  name: string;
  gender?: 'FEMALE' | 'MALE';
}

export class PersonIntroductionService {
  private getRandomIntroduction(name: string, lang: string): Introduction {
    const text = randomElement(introductions[lang]).replace('{name}', name);
    return {
      text,
      name,
    };
  }

  createIntroductions(lang: string, count: number): Introductions {
    const femaleNames = shuffle([...names[lang]['FEMALE']]);
    const maleNames = shuffle([...names[lang]['MALE']]);
    const introductions: Introduction[] = [];
    for (let i = 0; i < count; i++) {
      const sex = Math.random() > 0.5 ? 'FEMALE' : 'MALE';
      const name = sex === 'FEMALE' ? femaleNames.pop() : maleNames.pop();
      const introduction = this.getRandomIntroduction(name!, lang);
      introductions.push({ ...introduction, gender: sex });
    }
    return { introductions, optionalNames: names[lang] };
  }
}
