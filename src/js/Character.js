export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.type = type;
    if (new.target.name === 'Character') {
      throw new Error('You cannot create instances from the Character class');
    }
  }

  levelUp() {
    if (!this.health) {
      throw new Error('Нельзя повысить уровень умершего');
    }
    this.level += 1;
    this.attack = Math.max(this.attack, this.attack * (1.8 - this.health / 100));
    this.defence *= 1.2;
    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
  }

  damage(points) {
    if (this.health > 0) {
      this.health -= points;
    }
    if (this.health < 0) {
      this.health = 0;
    }
  }
}
