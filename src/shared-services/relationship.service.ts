export const possibleRelations = [
  'Sister',
  'Brother',
  'Mother',
  'Father',
  'Son',
  'Daughter',
  'Cousin'
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
  Son: ['Brother', 'You'],
  Daughter: ['Sister', 'You'],
};

const UncleAuntMapping = {
  Mother: ['Grandmother'],
  Father: ['Grandfather'],
  Sister: ['Aunt', 'Mother'],
  Brother: ['Uncle', 'Father'],
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
  Daughter: ['Niece'],
};

const daughterSonChildMapping = {
  Mother: ['You'],
  Father: ['You'],
  Cousin: ['Niece'],
  Sister: ['Daughter'],
  Brother: ['Son'],
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

export class Relative {
  public id: number;
  constructor (public type: string, public previous: Relative, public relationship: string) {
    this.id = Math.random()
    switch (relationship) {
      case 'Mother':
      case 'Father':
        this.children.push(previous)
        this.siblings.push(...previous.parents)
        previous.parents.push(this)
        break;
      case 'Son':
      case 'Daughter':
      case 'Child':
        this.parents.push(previous)
        this.siblings.push(...previous.children)
        previous.children.push(this)
        break;
      case 'Brother':
      case 'Sister':
        this.siblings.push(previous)
        this.siblings.push(...previous.siblings)
        this.parents.push(...previous.parents)
        previous.siblings.push(this)
        break;
    }
  }

  isIncest(): boolean {
    let incest = false
    this.parents.forEach(p => {
      if (this.parents.some(p2 => p2.hasSibling(p.id))) {
        this.printTrace()
        incest = true
      }
    })

    const parentIds: number[] = []
    this.children.forEach(c => {
      parentIds.push(...c.parents.map(parent => parent.id))
    })
    parentIds.forEach(id => {
      if (this.hasSibling(id)) {
        incest = true
      }
    })
    return incest
  }

  printTrace () {
    if (this.previous) {
      this.previous.printTrace()
    }
    console.log(`${this.relationship} -> ${this.type}`)
  }

  private hasSibling(id: number) {
    return this.siblings.map(s => s.id).indexOf(id) > -1
  }

  parents: Relative[] = [];
  children: Relative[] = [];
  siblings: Relative[] = [];
  next: Relative[] = []
}

export class RelationshipService {
  getGender (value: string) {
    switch (value) {
      case 'Sister':
      case 'Mother':
      case 'Daughter':
      case 'Niece':
      case 'Cousin':
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

  public isIncest(sequence: string[]) {
    try {
      this.buildTree(new Relative('You', undefined as any, ''), sequence, 0, [])
      return false
    } catch (error) {
      return true;
    }
  }

  private buildTree(current: Relative, sequence: string[], idx: number, leafes: Relative[]): void {
    if (current.type === 'You') {
      const nextNode = new Relative(sequence[idx], current, sequence[idx])
      current.next = [nextNode]
      return this.buildTree(nextNode, sequence, idx+1, leafes);
    } else {
      if (mapping[current.type][sequence[idx]]) {
        mapping[current.type][sequence[idx]].map((rel: string) => {
          const nextNode = new Relative(rel, current, sequence[idx])
          if (nextNode.isIncest()) {
            throw Error("Incest")
          }
          current.next.push(nextNode)
        })
        current.next.forEach(next => {
          if (idx < sequence.length -1) {
            this.buildTree(next, sequence, idx+1, leafes)
          } else {
            leafes.push(next)
          }
        })
      } else {
        leafes.push(current)
      }
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

  tryCreateExercise(difficulty: string) {
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
    const incest = this.isIncest(queue)
    const qReverse = queue.reverse();
    return { queue: qReverse, solutions: this.whoIs(qReverse), incest };
  }

  createExercise(difficulty: string): RelationshipTask {
    let result: any
    do {
      result = this.tryCreateExercise(difficulty)
    } while (result.incest)
    return { queue: result.queue, solutions: result.solutions }
  }
}
