import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../Bowman';

test('Будет выброшена ошибка если в PositionedCharacter передать объект, которые не наследуется от Character', () => {
  const testObject = {};
  expect(() => new PositionedCharacter(testObject, 1)).toThrow();
});

test('Будет выброшена ошибка если в PositionedCharacter передать в позицию не числовой тип', () => {
  const bowman = new Bowman(1);
  expect(() => new PositionedCharacter(bowman, '1')).toThrow();
});
