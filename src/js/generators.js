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
  for (let value = 0; value < characterCount; value += 1) {
    const characterTeams = characterGenerator(allowedTypes, maxLevel);
    const char = characterTeams.next();
    switch (char.value.type) {
      case 'bowman':
      case 'swordsman':
      case 'magician':
        idx = Math.floor(Math.random() * playerCoordinates.length);
        position = playerCoordinates[idx];
        playerCoordinates.splice(idx, 1);
        break;
      case 'undead':
      case 'vampire':
      case 'daemon':
        idx = Math.floor(Math.random() * npcCoordinates.length);
        position = npcCoordinates[idx];
        npcCoordinates.splice(idx, 1);
        break;
      default:
        break;
    }
    teams.push(new PositionedCharacter(char.value, position));
  }
  return teams;
}
