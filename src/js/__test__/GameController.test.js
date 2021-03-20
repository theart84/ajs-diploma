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

test('Метод getPlayerTeam должен возвращать игровых персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 25,
        defence: 25,
        health: 100,
        isPlayer: true,
        level: 1,
        range: 2,
        step: 2,
        type: 'bowman',
      },
      position: 0,
    },
  ];
  expect(gameCtrl.getPlayerTeam()).toEqual(referenceObject);
});

test('Метод getNPCTeam должен возвращать npc персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 10,
        defence: 40,
        health: 100,
        isPlayer: false,
        level: 1,
        range: 4,
        step: 1,
        type: 'daemon',
      },
      position: 1,
    },
  ];
  expect(gameCtrl.getNPCTeam()).toEqual(referenceObject);
});

test('Проверяем что срабатывает метод showCellTooltip при наведении на ячейку', () => {
  gameCtrl.gamePlay.showCellTooltip = jest.fn();
  gameCtrl.onCellEnter(0);

  expect(gameCtrl.gamePlay.showCellTooltip).toBeCalled();
});

test('Проверяем что showCellTooltip не срабатывает, когда наводим на пустую ячейку', () => {
  gameCtrl.gamePlay.showCellTooltip = jest.fn();
  gameCtrl.onCellEnter(2);
  expect(gameCtrl.gamePlay.showCellTooltip).toBeCalledTimes(0);
});

test('Метод onCellEnter проверяет доступность перемещения в указанную ячейку', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(8);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(8, 'green');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('Метод onCellEnter проверяет доступность перемещения в указанную ячейку, если нельзя, то методы selectCell и setCursor вызваны не будут', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(38);
  expect(gameCtrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCtrl.gamePlay.setCursor).toBeCalledTimes(0);
});

test('Метод onCellEnter проверяет доступность атаки', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(1);

  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(1, 'red');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('crosshair');
});

test('Метод onCellEnter проверяет доступность атаки, если нельзя, то методы selectCell и setCursor вызваны не будут', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.selectedChar.position = 48;
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(1);

  expect(gameCtrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCtrl.gamePlay.setCursor).toBeCalled();
});

test('Метод onCellClick проверяет, что если в ячейке есть персонаж выделяем его', () => {
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellClick(0);

  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(0);
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test(
  'Метод onCellClick проверяет, ' +
    'возможно ли переместится в данную ячейку, если да то перемещаемся',
  () => {
    // eslint-disable-next-line prefer-destructuring
    gameCtrl.selectedChar = gameCtrl.state.teams[0];
    gameCtrl.stepIsPossible = true;
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.endOfTurn = jest.fn();
    gameCtrl.onCellClick(8);
    expect(gameCtrl.endOfTurn).toBeCalled();
  }
);

test(
  'Метод onCellClick проверяет, ' +
    'если ходить на данную ячейку нельзя, уведомляем пользователя об этом.',
  () => {
    // eslint-disable-next-line prefer-destructuring
    gameCtrl.selectedChar = gameCtrl.state.teams[0];
    gameCtrl.stepIsPossible = false;
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onCellClick(40);
    expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'Impossible to go here!',
      'warning'
    );
  }
);

test('Метод onCellClick проверяет, eсли атака доступна, атакуем', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.stepIsPossible = true;
  gameCtrl.attackIsPossible = true;
  gameCtrl.attackTheEnemy = jest.fn();
  gameCtrl.onCellClick(1);
  expect(gameCtrl.attackTheEnemy).toBeCalled();
});

test(
  'Метод onCellClick проверяет, ' +
    'eсли range атаки не достаточно, уведомляем о том что атаковать врага нельзя.',
  () => {
    // eslint-disable-next-line prefer-destructuring
    gameCtrl.selectedChar = gameCtrl.state.teams[0];
    gameCtrl.selectedChar.character.range = 0;
    gameCtrl.stepIsPossible = true;
    gameCtrl.attackIsPossible = false;
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onCellClick(1);
    expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'To far...',
      'warning'
    );
  }
);
test(
  'Метод onCellClick проверяет, ' +
    'eсли клик был произведен по ячейке с неигровым персонажей, уведомляем об этом пользователя',
  () => {
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onCellClick(1);
    expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'This is not a playable character!',
      'danger'
    );
  }
);

test('Метод onCellLeave вызывает hideCellTooltip', () => {
  gameCtrl.gamePlay.hideCellTooltip = jest.fn();
  gameCtrl.onCellLeave(1);
  expect(gameCtrl.gamePlay.hideCellTooltip).toBeCalled();
});

test('Метод onNewGame вызывает unsubscribeAllMouseListeners, prepareGame, clickOnCells, overOnCells, leaveOnCells, renderScore, gamePlay.showTooltip', () => {
  gameCtrl.gamePlay.unsubscribeAllMouseListeners = jest.fn();
  gameCtrl.prepareGame = jest.fn();
  gameCtrl.clickOnCells = jest.fn();
  gameCtrl.overOnCells = jest.fn();
  gameCtrl.leaveOnCells = jest.fn();
  gameCtrl.renderScore = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onNewGame();
  expect(gameCtrl.gamePlay.unsubscribeAllMouseListeners).toBeCalled();
  expect(gameCtrl.prepareGame).toBeCalled();
  expect(gameCtrl.clickOnCells).toBeCalled();
  expect(gameCtrl.overOnCells).toBeCalled();
  expect(gameCtrl.leaveOnCells).toBeCalled();
  expect(gameCtrl.renderScore).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
    'Information',
    'A new game has begun',
    'info'
  );
});

test('Метод onSaveGame вызывает метод save', () => {
  gameCtrl.stateService.save = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onSaveGame();
  expect(gameCtrl.stateService.save).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game saved', 'info');
});

test('Метод onLoadGame вызывает метод load, gamePlay.redrawPositions, showTooltip', () => {
  gameCtrl.gamePlay.redrawPositions = jest.fn();
  gameCtrl.renderScore = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onSaveGame();
  gameCtrl.onLoadGame();
  expect(gameCtrl.renderScore).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game loaded', 'info');
});
