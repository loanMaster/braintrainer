export const randomElement = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];
export const shuffle = <T>(arr: T[]) => arr.sort(() => Math.random() - 0.5);
export const isSortedAsc = <T>(arr: T[]) => {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
};
