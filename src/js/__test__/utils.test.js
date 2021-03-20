import { calcTileType, calcHealthLevel, isStepPossible, isAttackPossible } from '../utils';

test.each([
  [0, 'top-left'],
  [6, 'top'],
  [7, 'top-right'],
  [56, 'bottom-left'],
  [63, 'bottom-right'],
  [40, 'left'],
  [31, 'right'],
  [57, 'bottom'],
  [49, 'center'],
])('Функция должна правильно возвращать значения', (idx, expected) => {
  expect(calcTileType(idx, 8)).toBe(expected);
});

test.each([
  [7, 'critical'],
  [27, 'normal'],
  [57, 'high'],
])('Функция должна правильно возвращать значения статус здоровья', (health, expected) => {
  expect(calcHealthLevel(health)).toBe(expected);
});

test('Функция должна вернуть объект с полями success(тип булеан) и массив значений, куда возможен ход', () => {
  const referenceObject = {
    indexArray: [1, 8, 9],
    success: true,
  };

  expect(isStepPossible(0, 1, 1)).toEqual(referenceObject);
});

test('Функция должна возвращать true или false в зависимости от возможности атаки', () => {
  expect(isAttackPossible(0, 1, 1)).toBeTruthy();
  expect(isAttackPossible(0, 4, 1)).toBeFalsy();
});
