export const randomElement = (arr: any[]) => Math.floor(Math.random() * arr.length)
export const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5)
