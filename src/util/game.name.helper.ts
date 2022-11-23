import {GAMES} from "src/const/games";

export const getNameOfTheGame = (nameLower: string) => {
  if (!nameLower) {
    return undefined
  }
  const idx = GAMES.findIndex(g => g.toLowerCase() === nameLower.toLowerCase())
  return GAMES[idx]
}
