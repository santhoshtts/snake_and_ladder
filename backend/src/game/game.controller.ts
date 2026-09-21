import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService, GameState, DiceRoll } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getGameState(): GameState {
    return this.gameService.getGameState();
  }

  @Post('start')
  startGame(@Body('players') players: string[]): GameState {
    return this.gameService.startGame(players);
  }

  @Post('roll')
  rollDice(@Body('diceValue') diceValue?: number): DiceRoll {
    return this.gameService.rollDice();
  }

  @Post('reset')
  resetGame(): GameState {
    return this.gameService.resetGame();
  }

  @Get('board')
  getBoardLayout() {
    return this.gameService.getBoardLayout();
  }
}
