import { Injectable } from '@nestjs/common';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  winner: number | null;
  gameStarted: boolean;
}

export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
}

export interface DiceRoll {
  value: number;
  previousPosition: number;
  newPosition: number;
  playerIndex: number;
  message: string;
}

@Injectable()
export class GameService {
  private gameState: GameState;
  private snakes: { [key: number]: number };
  private ladders: { [key: number]: number };

  constructor() {
    this.initializeGame();
  }

  private initializeGame() {
    this.gameState = {
      players: [],
      currentPlayerIndex: 0,
      winner: null,
      gameStarted: false,
    };

    // Snake positions (head -> tail)
    this.snakes = {
      16: 6,
      47: 26,
      49: 11,
      56: 53,
      62: 19,
      64: 60,
      87: 24,
      93: 73,
      95: 75,
      98: 78,
    };

    // Ladder positions (bottom -> top)
    this.ladders = {
      1: 38,
      4: 14,
      9: 31,
      21: 42,
      28: 84,
      36: 44,
      51: 67,
      71: 91,
      80: 100,
    };
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  startGame(playerNames: string[]): GameState {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
    this.gameState.players = playerNames.map((name, index) => ({
      id: index + 1,
      name,
      position: 0,
      color: colors[index % colors.length],
    }));
    this.gameState.currentPlayerIndex = 0;
    this.gameState.winner = null;
    this.gameState.gameStarted = true;
    return this.getGameState();
  }

  /**
   * `forcedValue` lets QA/tests drive a specific dice outcome instead of a
   * random one (e.g. to deterministically test snake/ladder landings).
   */
  rollDice(forcedValue?: number): DiceRoll {
    if (!this.gameState.gameStarted || this.gameState.winner !== null) {
      throw new Error('Game not started or already finished');
    }

    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    const diceValue = forcedValue ?? Math.floor(Math.random() * 6) + 1;
    const previousPosition = currentPlayer.position;
    
    let newPosition = previousPosition + diceValue;
    let message = '';

    // Check if player exceeds 100
    if (newPosition > 100) {
      newPosition = previousPosition;
      message = `${currentPlayer.name} rolled ${diceValue} but needs exact number to reach 100`;
    } else {
      // Check for snake
      if (this.snakes[newPosition]) {
        message = `${currentPlayer.name} rolled ${diceValue}, landed on ${newPosition}, but got bitten by a snake! Sliding down to ${this.snakes[newPosition]}`;
        newPosition = this.snakes[newPosition];
      }
      // Check for ladder
      else if (this.ladders[newPosition]) {
        message = `${currentPlayer.name} rolled ${diceValue}, landed on ${newPosition}, and found a ladder! Climbing up to ${this.ladders[newPosition]}`;
        newPosition = this.ladders[newPosition];
      } else {
        message = `${currentPlayer.name} rolled ${diceValue} and moved to ${newPosition}`;
      }

      // Update player position
      currentPlayer.position = newPosition;

      // Check for winner
      if (newPosition === 100) {
        this.gameState.winner = currentPlayer.id;
        message = `🎉 ${currentPlayer.name} wins the game! 🎉`;
      }
    }

    // Move to next player if no winner
    if (this.gameState.winner === null) {
      this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
    }

    return {
      value: diceValue,
      previousPosition,
      newPosition,
      playerIndex: this.gameState.currentPlayerIndex,
      message,
    };
  }

  resetGame(): GameState {
    this.initializeGame();
    return this.getGameState();
  }

  getBoardLayout() {
    return {
      snakes: this.snakes,
      ladders: this.ladders,
    };
  }
}
