import PositionedCharacter from './PositionedCharacter';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomTeam = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = 1 + Math.floor(Math.random() * maxLevel);
    yield new allowedTypes[randomTeam](randomLevel);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const playerCoordinates = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
  const npcCoordinates = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
  let position;
  let idx;
  const teams = [];
  for (let key = 0; key < characterCount; key += 1) {
    const { value } = characterGenerator(allowedTypes, maxLevel).next();
    if (value.isPlayer) {
      idx = Math.floor(Math.random() * playerCoordinates.length);
      position = playerCoordinates[idx];
      playerCoordinates.splice(idx, 1);
    } else {
      idx = Math.floor(Math.random() * npcCoordinates.length);
      position = npcCoordinates[idx];
      npcCoordinates.splice(idx, 1);
    }
    teams.push(new PositionedCharacter(value, position));
  }
  return teams;
}
