import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Daemon from './Daemon';
import Vampire from './Vampire';
import Undead from './Undead';

export default class Team {
  constructor() {
    this.playerTeams = [Bowman, Swordsman, Magician];
    this.npcTeams = [Daemon, Vampire, Undead];
  }

  *[Symbol.iterator]() {
    const { playerTeams } = this;
    for (let value = 0; value < playerTeams.length; value += 1) {
      yield playerTeams[value];
    }
  }

  *[Symbol.iterator]() {
    const { npcTeams } = this;
    for (let value = 0; value < npcTeams.length; value += 1) {
      yield npcTeams[value];
    }
  }
}
