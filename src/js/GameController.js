import { generateTeam } from './generators';
import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.gamePlay.redrawPositions(this.teams);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
