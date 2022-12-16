import { randomElement } from 'src/util/array.utils';

export interface FindRelativeTask {
  queue: string[];
  solutions: string[];
  gender: string;
}

export const possibleRelations = [
  'Sister',
  'Brother',
  'Mother',
  'Father',
  'Son',
  'Daughter',
  'Cousin',
];

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
  Son: ['Father', 'Uncle'],
  Daughter: ['Mother', 'Aunt'],
};

const nieceNephewMapping = {
  Father: ['Brother'],
  Mother: ['Sister'],
  Brother: ['Nephew'],
  Sister: ['Niece'],
  Cousin: ['Daughter'],
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
  constructor(
    public type: string,
    public previous?: Relative,
    public relationship?: string
  ) {
    this.id = Math.random();
    if (previous) {
      previous.next.push(this);
      switch (relationship) {
        case 'Mother':
        case 'Father':
          this.children.push(previous);
          this.siblings.push(...previous.parents);
          previous.parents.push(this);
          break;
        case 'Son':
        case 'Daughter':
        case 'Child':
          this.parents.push(previous);
          this.siblings.push(...previous.children);
          previous.children.push(this);
          break;
        case 'Brother':
        case 'Sister':
          this.siblings.push(previous);
          this.siblings.push(...previous.siblings);
          this.parents.push(...previous.parents);
          previous.siblings.push(this);
          break;
      }
    }
  }

  isIncest(): boolean {
    let incest = false;
    this.parents.forEach((p) => {
      if (this.parents.some((p2) => p2.hasSibling(p.id))) {
        incest = true;
      }
    });

    const parentIds: number[] = [];
    this.children.forEach((c) => {
      parentIds.push(...c.parents.map((parent) => parent.id));
    });
    parentIds.forEach((id) => {
      if (this.hasSibling(id)) {
        incest = true;
      }
    });
    return incest;
  }

  getLeaves(): Relative[] {
    if (this.next.length === 0) {
      return [this];
    }
    const leaves: Relative[] = [];
    this.next.forEach((n) =>
      n.getLeaves().forEach((leaf) => leaves.push(leaf))
    );
    return leaves;
  }

  depth(depth = 0): number {
    return this.next.length === 0
      ? depth
      : Math.max(...this.next.map((n) => n.depth(depth + 1)));
  }

  private hasSibling(id: number) {
    return this.siblings.map((s) => s.id).indexOf(id) > -1;
  }

  parents: Relative[] = [];
  children: Relative[] = [];
  siblings: Relative[] = [];
  next: Relative[] = [];
}

export class RelativesService {
  private relations: string[] = [];

  getGender(value: string) {
    switch (value) {
      case 'Sister':
      case 'Mother':
      case 'Daughter':
      case 'Niece':
      case 'Cousin':
      case 'Grandmother':
      case 'Aunt':
        return 'f';
      case 'Grandchild':
        return 'n';
      default:
        return 'm';
    }
  }

  private randomNextRelation(current: string) {
    let n = '';
    if (current === 'You') {
      return randomElement(possibleRelations);
    }
    if (!mapping[current]) {
      return undefined;
    }
    while (!n || !mapping[current][n]) {
      n = randomElement(possibleRelations);
    }
    return n;
  }

  private getNextRelation(depth: number, current: string) {
    if (this.relations.length <= depth) {
      const nextRelation = this.randomNextRelation(current);
      if (nextRelation) {
        this.relations.push(nextRelation);
      } else {
        return undefined
      }
    }
    return this.relations[depth];
  }

  private createTree(
    maxDepth: number,
    node: Relative = new Relative('You'),
    depth = 0
  ): Relative {
    if (depth < maxDepth) {
      const nextRelation = this.getNextRelation(depth, node.type);
      if (nextRelation) {
        const nextRelatives =
          node.type === 'You'
            ? [nextRelation]
            : mapping[node.type][nextRelation];
        if (nextRelatives) {
          nextRelatives.forEach((r: string) => {
            const nextNode = new Relative(r, node, nextRelation);
            if (!nextNode.isIncest()) {
              this.createTree(maxDepth, nextNode, depth + 1);
            }
          });
        }
      }
    }
    return node;
  }

  public createRelationshipTree(difficulty: string): FindRelativeTask {
    const maxDepth =
      difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;
    let tree: Relative;
    do {
      this.relations = [];
      tree = this.createTree(maxDepth);
    } while (
      tree.depth() < maxDepth ||
      tree.getLeaves().filter((l) => !l.isIncest()).length === 0
    );
    const relationsRev = this.relations.reverse();
    return {
      queue: relationsRev,
      solutions: [
        ...new Set(
          tree
            .getLeaves()
            .filter((l) => !l.isIncest())
            .map((leaf) => leaf.type)
        ),
      ],
      gender: this.getGender(relationsRev[0]),
    };
  }
}
