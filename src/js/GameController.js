import { generateTeam } from './generators';
import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
    this.currentSelectedChar = null;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.gamePlay.redrawPositions(this.teams);
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (!firstChild) {
      return;
    }
    const { isPlayer } = this.teams.find((char) => char.position === index).character;
    if (!isPlayer) {
      GamePlay.showError('This is not a playable character!');
      return;
    }
    this.gamePlay.deselectCell(this.currentSelectedChar || index);
    this.gamePlay.selectCell(index);
    this.currentSelectedChar = index;
    // TODO: react to click
  }

  onCellEnter(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (!firstChild) {
      return;
    }
    const { level, attack, defence, health, isPlayer } = this.teams.find(
      (char) => char.position === index
    ).character;
    const message = `🎖 ${level} ⚔ ${attack} 🛡 ${defence} ❤ ${health}`;
    this.gamePlay.showCellTooltip(message, index);
    if (this.currentSelectedChar !== index && this.currentSelectedChar !== null && isPlayer) {
      this.gamePlay.setCursor('pointer');
    }
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    const { firstChild } = this.gamePlay.cells[index];
    if (!firstChild) {
      return;
    }
    this.gamePlay.hideCellTooltip(index);
    // TODO: react to mouse leave
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
