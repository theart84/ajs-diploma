export function calcTileType(index, boardSize) {
  if (index === 0) {
    return `top-left`;
  }
  if (index > 0 && index < boardSize - 1) {
    return `top`;
  }
  if (index === boardSize - 1) {
    return `top-right`;
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

function generateArrayOfCoordinates() {
  return new Array(64)
    .fill(0)
    .map((a, i) => i++)
    .map((item, index) => {
      if (index >= 56) {
        return { x: index - 56, y: 7 };
      }
      if (index >= 48) {
        return { x: index - 48, y: 6 };
      }
      if (index >= 40) {
        return { x: index - 40, y: 5 };
      }
      if (index >= 32) {
        return { x: index - 32, y: 4 };
      }
      if (index >= 24) {
        return { x: index - 24, y: 3 };
      }
      if (index >= 16) {
        return { x: index - 16, y: 2 };
      }
      if (index >= 8) {
        return { x: index - 8, y: 1 };
      }

      return { x: index, y: 0 };
    });
}

export function isStepPosible(curPosition, nextPosition, step) {
  const cordinates = generateArrayOfCoordinates();
  const currentXY = cordinates[curPosition];
  const nextXY = cordinates[nextPosition];
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
  return referenceCoordinateArray.some(
    (coordinate) => coordinate[0] === nextXY.x && coordinate[1] === nextXY.y
  );
}
