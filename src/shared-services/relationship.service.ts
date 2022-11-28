export const possibleRelations = [
  'Sister',
  'Brother',
  'Mother',
  'Father',
  'Child',
  'Son',
  'Daughter',
  'Cousin',
];

export interface RelationshipTask {
  queue: string[];
  solutions: string[];
}

const fatherMotherMapping = {
  Mother: ['Grandmother'],
  Father: ['Grandfather'],
  Sister: ['Aunt'],
  Brother: ['Uncle'],
  Child: ['Brother', 'Sister', 'You'],
  Son: ['Brother', 'You'],
  Daughter: ['Sister', 'You'],
};

const UncleAuntMapping = {
  Mother: ['Grandmother'],
  Father: ['Grandfather'],
  Sister: ['Aunt', 'Mother'],
  Brother: ['Uncle', 'Father'],
  Child: ['Cousin'],
  Son: ['Cousin'],
  Daughter: ['Cousin'],
};

const sisterBrotherMapping = {
  Mother: ['Mother'],
  Father: ['Father'],
  Cousin: ['Cousin'],
  Sister: ['Sister', 'You'],
  Brother: ['Brother', 'You'],
  Son: ['Nephew'],
  Child: ['Nephew', 'Niece'],
  Daughter: ['Niece'],
};

const daughterSonChildMapping = {
  Mother: ['You'],
  Father: ['You'],
  Cousin: ['Niece'],
  Sister: ['Daughter'],
  Brother: ['Son'],
  Child: ['Grandchild'],
  Son: ['Grandchild'],
  Daughter: ['Grandchild'],
};

const grandparentMapping = {
  Child: ['Mother', 'Father', 'Uncle', 'Aunt'],
  Son: ['Father', 'Uncle'],
  Daughter: ['Mother', 'Aunt'],
};

const nieceNephewMapping = {
  Father: ['Brother'],
  Mother: ['Sister'],
  Brother: ['Nephew'],
  Sister: ['Niece'],
  Cousin: ['Daughter', 'Son', 'Child'],
};

const mapping: { [key: string]: any } = {
  Father: fatherMotherMapping,
  Mother: fatherMotherMapping,
  Uncle: UncleAuntMapping,
  Aunt: UncleAuntMapping,
  Cousin: {
    Mother: ['Aunt'],
    Father: ['Uncle'],
    Sister: ['Cousin'],
    Brother: ['Cousin'],
    Daughter: ['Niece'],
    Son: ['Nephew'],
    Child: ['Niece', 'Nephew'],
    Uncle: ['Father', 'Uncle'],
    Aunt: ['Mother', 'Aunt'],
  },
  Grandchild: {
    Father: ['Son'],
    Mother: ['Daughter'],
  },
  Niece: nieceNephewMapping,
  Nephew: nieceNephewMapping,
  Grandmother: grandparentMapping,
  Grandfather: grandparentMapping,
  Sister: sisterBrotherMapping,
  Brother: sisterBrotherMapping,
  Daughter: daughterSonChildMapping,
  Son: daughterSonChildMapping,
  Child: daughterSonChildMapping,
};

export class RelationshipService {
  getGender (value: string) {
    switch (value) {
      case 'Sister':
      case 'Mother':
      case 'Daughter':
      case 'Niece':
      case 'Grandmother':
      case 'Aunt':
        return 'f'
      case 'Child':
      case 'Grandchild':
        return 'n'
      default:
        return 'm'
    }
  }

  whoIs(sequence: string[]) {
    let current = ['You'];
    let next = [];
    for (let i = sequence.length - 1; i >= 0; i--) {
      next = [];
      for (let j = 0; j < current.length; j++) {
        if (current[j] === 'You') {
          next.push(sequence[i]);
        } else {
          if (mapping[current[j]][sequence[i]]) {
            next.push(...mapping[current[j]][sequence[i]]);
          }
        }
      }
      current = [...new Set(next)];
    }
    return current;
  }

  randomNextRelative(current: string) {
    let n = '';
    if (current === 'You') {
      return possibleRelations[
        Math.floor(Math.random() * possibleRelations.length)
      ];
    }
    if (!mapping[current]) {
      return undefined;
    }
    while (!n || !mapping[current][n]) {
      n =
        possibleRelations[Math.floor(Math.random() * possibleRelations.length)];
    }
    return n;
  }

  createExercise(difficulty: string): RelationshipTask {
    const length = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;
    const queue = [];
    let currentRelationship = 'You';
    while (queue.length < length) {
      const next = this.randomNextRelative(currentRelationship);
      if (!next) {
        break;
      }
      queue.push(next);
      const currentRelationships =
        currentRelationship === 'You'
          ? [next]
          : mapping[currentRelationship][next];
      currentRelationship =
        currentRelationships[
          Math.floor(Math.random() * currentRelationships.length)
        ];
    }
    const qReverse = queue.reverse();
    console.log(qReverse)
    console.log(this.whoIs(qReverse))
    return { queue: qReverse, solutions: this.whoIs(qReverse) };
  }
}
