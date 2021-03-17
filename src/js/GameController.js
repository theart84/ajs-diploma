import { generateTeam } from './generators';
import { isAttackPossible, isStepPossible } from './utils';
import cursors from './cursors';
import themes from './themes';
import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
    this.gamePlay.redrawPositions(this.teams);
    this.state = this.teams;
    this.currentChar = null;
    this.selectedChar = null;
    this.currentSelectedCharIndex = null;
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    const { firstChild } = this.gamePlay.cells[index];
    // debugger
    // Проверяем есть ли персонаж в ячейке
    if (firstChild) {
      this.currentChar = this.state.find((char) => char.position === index);
      // Если персонаж npc показываем алерт
      if (!this.selectedChar && !this.currentChar.character.isPlayer) {
        GamePlay.showError('This is not a playable character!');
        return;
      }
      // Если персонаж игровой, то присваиваем текущего персонажа в переменную this.selectChar
      if (this.currentChar.character.isPlayer) {
        this.selectedChar = this.currentChar;
        this.gamePlay.deselectCell(this.currentSelectedCharIndex || index);
        this.gamePlay.selectCell(index);
        this.currentSelectedCharIndex = index;
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
    // Делаем шаг
    if (!firstChild && this.selectedChar) {
      const isPossible = isStepPossible(
        this.selectedChar.position,
        index,
        this.selectedChar.character.step
      );
      // Если перемещение доступно, создаем новый стейт и перерендериваем поле,
      // иначе показываем ошибку о недоступности хода
      if (isPossible) {
        this.state = [...this.state].filter((char) => char.position !== this.selectedChar.position);
        this.state.push({
          character: this.selectedChar.character,
          position: index,
        });
        // Обнуление состояния
        this.selectedChar = null;
        this.currentSelectedCharIndex = null;
        this.gamePlay.cells.forEach((cell) =>
          cell.classList.remove('selected-yellow', 'selected-green')
        );
        // Перерисовка
        this.gamePlay.redrawPositions(this.state);
      } else {
        GamePlay.showError('Impossible to go here!');
      }
    }
  }

  onCellEnter(index) {
    const { firstChild } = this.gamePlay.cells[index];
    const currentChar = this.state.find((character) => character.position === index);
    // Если ячейка не пуста и выбран игровой персонаж,
    // проверяем доступность перемещения в указанную ячейку
    if (this.selectedChar && !firstChild) {
      const stepIsPossible = isStepPossible(
        this.selectedChar.position,
        index,
        this.selectedChar.character.step
      );
      // Проверяем можно ли сделать шаг на указанную клетку, если да, то подсвечивает клетку
      if (stepIsPossible) {
        this.gamePlay.selectCell(index, 'green');
      }
    }
    // Если в ячейке есть персонаж показывает его бейджик
    if (firstChild) {
      const message = `🎖 ${currentChar.character.level} ⚔ ${currentChar.character.attack} 🛡 ${currentChar.character.defence} ❤ ${currentChar.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      // Если выбран персонаж игрока и в наведенной есть npc,
      // то рассчитываем возможность атаки
      if (this.selectedChar && !currentChar.character.isPlayer) {
        const attackIsPossible = isAttackPossible(
          this.selectedChar.position,
          currentChar.position,
          this.selectedChar.character.range
        );
        // Если дистанция атаки позволяет атаковать, изменяем курсор и подсветку ячейки
        if (attackIsPossible) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (firstChild) {
      const { isPlayer } = this.state.find((char) => char.position === index).character;
      if (this.currentChar && !isPlayer) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-red'));
      }
    }
    if (this.currentChar && !firstChild) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-green'));
      return;
    }
    this.gamePlay.hideCellTooltip(index);
  }

  clickOnCells() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  overOnCells() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  leaveOnCells() {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  attackTheEnemy(attacker, defender) {
    const damage = Math.max(attacker.attack - defender.defence, attacker.attack * 0.1);
    console.log(damage);
  }
}
