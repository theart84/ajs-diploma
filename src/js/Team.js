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
}
