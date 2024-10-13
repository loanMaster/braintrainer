import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { randomElement } from 'src/util/array.utils';

export interface User {
  id: string | undefined;
  username: string | undefined;
}

const storeUser = (u: User) => {
  localStorage.setItem('auth.user', btoa(JSON.stringify(u)));
};

const nameFirstPart = ['Wild', 'Crazy', 'Awesome', 'Proud'];
const nameSecondPart = ['Goose', 'Melon', 'Apple', 'Coconut'];

const retrieveUser = () => {
  const user = localStorage.getItem('auth.user');
  if (user) {
    return JSON.parse(atob(user));
  } else {
    const user = {
      id: uuidv4(),
      username:
        randomElement(nameFirstPart) + ' ' + randomElement(nameSecondPart),
    };
    storeUser(user);
    return user;
  }
};

export const useAuthStore = defineStore('auth', {
  state: (): User => {
    return retrieveUser();
  },
  actions: {
    async update(username: string, image: string): Promise<void> {
      this.username = username;
      this.image = image;
      storeUser({ username, image, id: this.id });
    },
  },
});
