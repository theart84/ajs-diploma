export function calcTileType(index, boardSize) {
  if (index === 0) {
    return 'top-left';
  }
  if (index > 0 && index < boardSize - 1) {
    return 'top';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index === boardSize ** 2 - boardSize) {
    return 'bottom-left';
  }
  if (index === boardSize ** 2 - 1) {
    return 'bottom-right';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if ((index - (boardSize - 1)) % boardSize === 0) {
    return 'right';
  }
  if (index < boardSize ** 2 - 1 && index > boardSize ** 2 - boardSize) {
    return 'bottom';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

/**
 * The function generates an array of coordinates in the format {x,y}
 * @returns {Array}
 */
function generateArrayOfCoordinates() {
  return new Array(64)
    .fill(0)
    .map((e, i) => i++)
    .map((e, i) => ({ x: i % 8, y: Math.floor(i / 8) }));
}

/**
 * The function calculates whether a step is available
 * @param {Number} curPosition The current position of the character
 * @param {Number} nextPosition
 * @param {Number} step Step
 * @returns {{success: boolean, indexArray: []}} Return result
 */
export function isStepPossible(curPosition, nextPosition, step) {
  const coordinates = generateArrayOfCoordinates();
  const currentXY = coordinates[curPosition];
  const nextXY = coordinates[nextPosition];
  const referenceCoordinateArray = [];
  for (let i = 1; i <= step; i += 1) {
    referenceCoordinateArray.push(
      [currentXY.x - i, currentXY.y - i],
      [currentXY.x, currentXY.y - i],
      [currentXY.x + i, currentXY.y - i],
      [currentXY.x - i, currentXY.y],
      [currentXY.x + i, currentXY.y],
      [currentXY.x - i, currentXY.y + i],
      [currentXY.x, currentXY.y + i],
      [currentXY.x + i, currentXY.y + i]
    );
  }
  const convertCoordinates = referenceCoordinateArray
    .filter(
      (coordinate) =>
        coordinate[0] >= 0 && coordinate[1] >= 0 && coordinate[0] <= 7 && coordinate[1] <= 7
    )
    .map((coordinate) => coordinate[0] + coordinate[1] * 8);
  return {
    success: referenceCoordinateArray.some(
      (coordinate) => coordinate[0] === nextXY.x && coordinate[1] === nextXY.y
    ),
    indexArray: convertCoordinates,
  };
}

/**
 * The function calculates whether an attack is available
 * @param {Number} curPosition The current position of the character
 * @param {Number} enemyPosition The current position of the enemy
 * @param {Number} range Distance
 * @returns {boolean} Return result
 */
export function isAttackPossible(curPosition, enemyPosition, range) {
  const coordinates = generateArrayOfCoordinates();
  const currentXY = coordinates[curPosition];
  const enemyXY = coordinates[enemyPosition];
  const referenceCoordinateArray = [];
  for (let y = currentXY.y - range; y <= currentXY.y + range; y += 1) {
    for (let x = currentXY.x - range; x <= currentXY.x + range; x += 1) {
      if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
        referenceCoordinateArray.push({ x, y });
      }
    }
  }

  return referenceCoordinateArray.some(
    (coordinate) => coordinate.x === enemyXY.x && coordinate.y === enemyXY.y
  );
}
