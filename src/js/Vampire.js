import Character from './Character';

export default class Vampire extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.isPlayer = false;
    this.step = 2;
    this.range = 2;
  }
}
