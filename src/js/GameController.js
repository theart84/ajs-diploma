import { generateTeam } from './generators';
import { isAttackPossible, isStepPossible } from './utils';
import cursors from './cursors';
import themes from './themes';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.currentLevel = 1;
    this.gamePlay.drawUi(themes[this.currentLevel - 1]);
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
    this.gamePlay.redrawPositions(this.teams);
    this.state = this.teams;
    this.selectedChar = null;
    this.record = 0;
    this.numberOfPoints = 0;
    this.currentSelectedCharIndex = null;
    this.playerTurn = true;
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    this.clickOnNewGame();
    this.clickOnSaveGame();
    this.clickOnLoadGame();
    // загружаем статистику
    this.renderScore();
  }

  getNPCTeam() {
    return this.state.filter((char) => !char.character.isPlayer);
  }

  getPlayerTeam() {
    return this.state.filter((char) => char.character.isPlayer);
  }

  onCellClick(index) {
    const { firstChild } = this.gamePlay.cells[index];
    const currentChar = this.state.find((char) => char.position === index);
    // debugger
    // Проверяем есть ли персонаж в ячейке
    if (firstChild) {
      // Если персонаж npc показываем алерт
      if (!this.selectedChar && !currentChar.character.isPlayer) {
        GamePlay.showError('This is not a playable character!');
        return;
      }
      // Если персонаж игровой, то присваиваем текущего персонажа в переменную this.selectChar
      if (currentChar && currentChar.character.isPlayer) {
        this.selectedChar = currentChar;
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
      if (isPossible.success) {
        this.state = [...this.state].filter((char) => char.position !== this.selectedChar.position);
        this.selectedChar.position = index;
        this.state.push(this.selectedChar);
        this.endOfTurn();
      } else {
        GamePlay.showError('Impossible to go here!');
      }
    }
    if (this.selectedChar && currentChar && !currentChar.character.isPlayer) {
      const attackIsPossible = isAttackPossible(
        this.selectedChar.position,
        currentChar.position,
        this.selectedChar.character.range
      );
      if (attackIsPossible) {
        this.attackTheEnemy(this.selectedChar, currentChar);
      }
    }
  }

  onCellEnter(index) {
    const { firstChild } = this.gamePlay.cells[index];
    const currentChar = this.state.find((character) => character.position === index);
    if (!firstChild && currentChar) {
      return;
    }
    // Если ячейка не пуста и выбран игровой персонаж,
    // проверяем доступность перемещения в указанную ячейку
    if (this.selectedChar && !firstChild) {
      const stepIsPossible = isStepPossible(
        this.selectedChar.position,
        index,
        this.selectedChar.character.step
      ).success;
      // Проверяем можно ли сделать шаг на указанную клетку, если да, то подсвечивает клетку
      if (stepIsPossible) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
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
    this.gamePlay.setCursor(cursors.pointer);
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-green', 'selected-red'));
    this.gamePlay.hideCellTooltip(index);
  }

  onNewGame() {
    this.currentLevel = 1;
    this.gamePlay.drawUi(themes[this.currentLevel - 1]);
    this.playerTeams = generateTeam(new Team().playerTeams, 1, 2);
    this.npcTeams = generateTeam(new Team().npcTeams, 1, 2);
    this.teams = [...this.playerTeams, ...this.npcTeams];
    this.gamePlay.redrawPositions(this.teams);
    this.state = this.teams;
    this.selectedChar = null;
    this.numberOfPoints = 0;
    this.currentSelectedCharIndex = null;
    this.playerTurn = true;
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    this.renderScore();
  }

  onSaveGame() {
    const state = {
      currentLevel: this.currentLevel,
      state: this.state,
      playerTurn: this.playerTurn,
      numberOfPoints: this.numberOfPoints,
      record: this.record,
    };
    this.stateService.save(GameState.from(state));
  }

  onLoadGame() {
    const loadState = GameState.from(this.stateService.load());
    this.currentLevel = loadState.currentLevel;
    this.gamePlay.drawUi(themes[loadState.currentLevel - 1]);
    loadState.state = loadState.state.reduce((acc, prev) => {
      prev.character.__proto__ = Character.prototype;
      acc.push(prev);
      return acc;
    }, []);
    this.state = loadState.state;
    this.numberOfPoints = loadState.numberOfPoints;
    this.playerTurn = loadState.playerTurn;
    this.gamePlay.redrawPositions(this.state);
    this.renderScore();
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

  clickOnNewGame() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  clickOnSaveGame() {
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  clickOnLoadGame() {
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  attackTheEnemy(attacker, defender) {
    const enemy = defender;
    const attackPoints = Math.max(
      attacker.character.attack - enemy.character.defence,
      attacker.character.attack * 0.1
    );
    this.state = this.state.filter((char) => char.position !== defender.position);
    enemy.character.damage(attackPoints);
    if (enemy.character.health > 0) {
      this.state.push(enemy);
    }

    this.gamePlay.showDamage(defender.position, attackPoints).then(() => this.endOfTurn());
  }

  stepAI() {
    if (!this.getNPCTeam().length || !this.getPlayerTeam().length) {
      return;
    }
    const npcTeam = this.getNPCTeam();
    const playerTeam = this.getPlayerTeam();
    const canAttackEnemies = npcTeam.reduce((acc, prev) => {
      const playerChar = [];
      playerTeam.forEach((userChar, index) => {
        const canAttack = isAttackPossible(prev.position, userChar.position, prev.character.range);
        if (canAttack) {
          playerChar.push(playerTeam[index]);
        }
      });
      if (playerChar.length > 0) {
        acc.push({
          npc: prev,
          playerChar,
        });
      }
      return acc;
    }, []);

    const attacker = canAttackEnemies[Math.floor(Math.random() * canAttackEnemies.length)];
    if (attacker) {
      const defender = attacker.playerChar[Math.floor(Math.random() * attacker.playerChar.length)];
      this.attackTheEnemy(attacker.npc, defender);
    } else {
      const npc = npcTeam[Math.floor(Math.random() * npcTeam.length)];
      const indexSteps = isStepPossible(npc.position, 0, npc.character.step).indexArray.filter(
        (index) => {
          const positions = [...this.state].map((char) => char.position);
          return !positions.includes(index);
        }
      );
      if (indexSteps) {
        const newPosition = indexSteps[Math.floor(Math.random() * indexSteps.length)];
        this.state = [...this.state].filter((char) => char.position !== npc.position);
        npc.position = newPosition;
        this.state.push(npc);
        this.endOfTurn();
      }
    }
  }

  endOfTurn() {
    if (!this.selectedChar.character.health) {
      this.selectedChar = null;
      this.gamePlay.redrawPositions(this.state);
      this.gamePlay.cells.forEach((cell) =>
        cell.classList.remove('selected-yellow', 'selected-green', 'selected-red')
      );
    }
    if (!this.getPlayerTeam().length) {
      this.gamePlay.redrawPositions(this.state);
      this.gamePlay.unsubscribe();
      GamePlay.showMessage('You Lose!');
      return;
    }
    if (!this.getNPCTeam().length) {
      this.gamePlay.cells.forEach((cell) =>
        cell.classList.remove('selected-yellow', 'selected-green', 'selected-red')
      );
      this.gamePlay.setCursor(cursors.auto);
      this.playerTurn = false;
      this.nextLevel();
      return;
    }
    this.currentSelectedCharIndex = null;
    this.gamePlay.cells.forEach((cell) =>
      cell.classList.remove('selected-yellow', 'selected-green', 'selected-red')
    );
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.redrawPositions(this.state);
    if (this.selectedChar) {
      this.gamePlay.selectCell(this.selectedChar.position);
    }
    if (this.playerTurn) {
      this.gamePlay.unsubscribe();
      this.playerTurn = false;
      this.stepAI();
    } else {
      this.playerTurn = true;
      this.clickOnCells();
      this.overOnCells();
      this.leaveOnCells();
    }
  }

  nextLevel() {
    this.gamePlay.unsubscribe();
    this.currentLevel += 1;
    if (this.currentLevel > 4) {
      this.endGame();
      return;
    }
    this.gamePlay.drawUi(themes[this.currentLevel - 1]);
    this.numberOfPoints += this.getPlayerTeam().reduce(
      (acc, prev) => acc + prev.character.health,
      0
    );
    this.renderScore();
    const playerCoordinates = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
    this.state = this.state.reduce((acc, prev) => {
      prev.character.levelUp();
      acc.push(prev);
      return acc;
    }, []);
    const quantityChar = this.currentLevel > 3 ? 2 : 1;
    const newPlayerTeam = generateTeam(new Team().playerTeams, this.currentLevel - 1, quantityChar);
    this.state = [...this.state, ...newPlayerTeam];
    this.state = this.state.reduce((acc, prev) => {
      const idx = Math.floor(Math.random() * playerCoordinates.length);
      prev.position = playerCoordinates[idx];
      playerCoordinates.splice(idx, 1);
      acc.push(prev);
      return acc;
    }, []);
    const newNPCTeams = generateTeam(
      new Team().npcTeams,
      this.currentLevel,
      this.getPlayerTeam().length
    );
    newNPCTeams.forEach((char) => {
      for (let i = 1; i < char.character.level; i++) {
        char.character.statsUp();
      }
    });
    this.state = [...this.state, ...newNPCTeams];
    this.gamePlay.redrawPositions(this.state);
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
  }

  endGame() {
    this.gamePlay.redrawPositions(this.state);
    this.currentLevel -= 1;
    this.numberOfPoints += this.getPlayerTeam().reduce(
      (acc, prev) => acc + prev.character.health,
      0
    );
    this.renderScore();
    GamePlay.showMessage('You Won!');
  }

  renderScore() {
    const levelElement = this.gamePlay.container.querySelector('.level-description')
      .firstElementChild;
    const scoreElement = this.gamePlay.container.querySelector('.score-description')
      .firstElementChild;
    const recordElement = this.gamePlay.container.querySelector('.record-description')
      .firstElementChild;
    levelElement.textContent = this.currentLevel;
    scoreElement.textContent = this.numberOfPoints;
    this.record = this.record > this.numberOfPoints ? this.record : this.numberOfPoints;
    recordElement.textContent = this.record;
    scoreElement.textContent = this.numberOfPoints;
  }
}
