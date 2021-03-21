import GameState from '../GameState';

test('Проверяем, что GameState вернет null, если ничего не передать в класс', () => {
  expect(GameState.from()).toBe(null);
});
