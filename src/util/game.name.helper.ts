import {GAMES} from "src/const/games";

export const getNameOfTheGame = (nameLower: string) => {
  const idx = GAMES.findIndex(g => g.toLowerCase() === nameLower.toLowerCase())
  return GAMES[idx]
}
