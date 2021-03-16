import { generateTeam } from './generators';
import { isStepPosible } from './utils';
import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
    this.gamePlay.redrawPositions(this.teams);
    this.state = this.teams;
    this.currentChar = null;
    this.currentSelectedCharIndex = null;
    this.selectedChar = false;
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (firstChild) {
      this.currentChar = this.state.find((char) => char.position === index);
      if (!this.currentChar.character.isPlayer) {
        GamePlay.showError('This is not a playable character!');
        return;
      }
      this.selectedChar = true;
      this.gamePlay.deselectCell(this.currentSelectedCharIndex || index);
      this.gamePlay.selectCell(index);
      this.currentSelectedCharIndex = index;
      this.gamePlay.setCursor('pointer');
    }
    if (!firstChild && this.selectedChar) {
      const isPosible = isStepPosible(
        this.currentSelectedCharIndex,
        index,
        this.currentChar.character.step
      );
      // Если перемещение доступно, создаем новый стейт и перерендериваем поле
      if (isPosible) {
        this.state = [...this.state].filter((char) => char.position !== this.currentChar.position);
        this.state.push({
          character: this.currentChar.character,
          position: index,
        });
        // Обнуление состояния
        this.currentChar = null;
        this.currentSelectedCharIndex = null;
        this.selectedChar = false;
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
    if (this.selectedChar && !firstChild) {
      this.gamePlay.selectCell(index, 'green');
    }
    if (firstChild) {
      const { level, attack, defence, health, isPlayer } = this.state.find(
        (char) => char.position === index
      ).character;
      const message = `🎖 ${level} ⚔ ${attack} 🛡 ${defence} ❤ ${health}`;
      this.gamePlay.showCellTooltip(message, index);
      if (this.selectedChar && !isPlayer) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(index, 'red');
      }
    }
  }

  onCellLeave(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (firstChild) {
      const { isPlayer } = this.state.find((char) => char.position === index).character;
      if (this.selectedChar && !isPlayer) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-red'));
      }
    }
    if (this.selectedChar && !firstChild) {
      this.gamePlay.setCursor('pointer');
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
}
