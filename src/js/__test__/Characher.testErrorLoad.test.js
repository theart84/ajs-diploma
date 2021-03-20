import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import Bowman from '../Bowman';
import Daemon from '../Daemon';
import PositionedCharacter from '../PositionedCharacter';

let gamePlay = null;
let stateService = null;
let gameCtrl = null;

beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage);
  gameCtrl = new GameController(gamePlay, stateService);

  gameCtrl.init();
  gameCtrl.state.teams = [
    new PositionedCharacter(new Bowman(1), 0),
    new PositionedCharacter(new Daemon(1), 1),
  ];
  gameCtrl.gamePlay.redrawPositions(gameCtrl.state.teams);
});

jest.mock('../GameStateService', () =>
  jest.fn().mockImplementationOnce(() => new Error('Load failed'))
);
test('Должен ловить ошибку', () => {
  try {
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onLoadGame();
  } catch (err) {
    expect(err).toThrow();
  }
});
