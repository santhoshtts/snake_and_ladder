import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize with empty game state', () => {
      const state = service.getGameState();
      expect(state.players).toEqual([]);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.winner).toBe(null);
      expect(state.gameStarted).toBe(false);
    });

    it('should have predefined snakes and ladders', () => {
      const board = service.getBoardLayout();
      expect(board.snakes).toBeDefined();
      expect(board.ladders).toBeDefined();
      expect(Object.keys(board.snakes).length).toBeGreaterThan(0);
      expect(Object.keys(board.ladders).length).toBeGreaterThan(0);
    });
  });

  describe('startGame', () => {
    it('should start game with player names', () => {
      const playerNames = ['Alice', 'Bob'];
      const state = service.startGame(playerNames);

      expect(state.gameStarted).toBe(true);
      expect(state.players.length).toBe(2);
      expect(state.players[0].name).toBe('Alice');
      expect(state.players[1].name).toBe('Bob');
      expect(state.players[0].position).toBe(0);
      expect(state.players[1].position).toBe(0);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.winner).toBe(null);
    });

    it('should assign different colors to players', () => {
      const playerNames = ['Alice', 'Bob', 'Charlie'];
      const state = service.startGame(playerNames);

      const colors = state.players.map(p => p.color);
      expect(new Set(colors).size).toBe(3);
    });

    it('should reset winner when starting new game', () => {
      service.startGame(['Alice']);
      // Simulate winning (this would normally happen through gameplay)
      const state = service.getGameState();
      state.winner = 1;
      
      const newState = service.startGame(['Bob']);
      expect(newState.winner).toBe(null);
    });
  });

  describe('rollDice', () => {
    beforeEach(() => {
      service.startGame(['Alice', 'Bob']);
    });

    it('should roll a dice between 1 and 6', () => {
      const result = service.rollDice();
      expect(result.value).toBeGreaterThanOrEqual(1);
      expect(result.value).toBeLessThanOrEqual(6);
    });

    it('should update player position', () => {
      const initialState = service.getGameState();
      const initialPosition = initialState.players[0].position;
      
      const result = service.rollDice();
      const newState = service.getGameState();
      
      expect(newState.players[0].position).toBe(initialPosition + result.value);
    });

    it('should move to next player after roll', () => {
      const initialState = service.getGameState();
      const initialPlayerIndex = initialState.currentPlayerIndex;
      
      service.rollDice();
      const newState = service.getGameState();
      
      expect(newState.currentPlayerIndex).not.toBe(initialPlayerIndex);
    });

    it('should detect snake and move player down', () => {
      // Manually set player to a snake head position
      const state = service.getGameState();
      state.players[0].position = 16; // Snake head at 16 goes to 6
      
      const result = service.rollDice();
      
      expect(result.message).toContain('snake');
      expect(state.players[0].position).toBe(6); // Should be at snake tail
    });

    it('should detect ladder and move player up', () => {
      // Manually set player to a ladder base position
      const state = service.getGameState();
      state.players[0].position = 4; // Ladder at 4 goes to 14
      
      const result = service.rollDice();
      
      expect(result.message).toContain('ladder');
      expect(state.players[0].position).toBe(14); // Should be at ladder top
    });

    it('should require exact roll to reach 100', () => {
      const state = service.getGameState();
      state.players[0].position = 99;
      
      const result = service.rollDice();
      
      // If roll is not exactly 1, player should stay at 99
      if (result.value !== 1) {
        expect(state.players[0].position).toBe(99);
        expect(result.message).toContain('exact number');
      }
    });

    it('should detect winner when reaching 100', () => {
      const state = service.getGameState();
      state.players[0].position = 99;
      
      // Keep rolling until we get a 1
      let result;
      do {
        result = service.rollDice();
      } while (result.value !== 1 && service.getGameState().winner === null);
      
      if (result.value === 1) {
        const finalState = service.getGameState();
        expect(finalState.winner).toBe(state.players[0].id);
        expect(result.message).toContain('wins');
      }
    });

    it('should throw error if game not started', () => {
      service.resetGame();
      expect(() => service.rollDice()).toThrow();
    });

    it('should throw error if game already finished', () => {
      const state = service.getGameState();
      state.players[0].position = 100;
      state.winner = state.players[0].id;
      
      expect(() => service.rollDice()).toThrow();
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      service.startGame(['Alice', 'Bob']);
      service.rollDice();
      
      const resetState = service.resetGame();
      
      expect(resetState.gameStarted).toBe(false);
      expect(resetState.players).toEqual([]);
      expect(resetState.winner).toBe(null);
      expect(resetState.currentPlayerIndex).toBe(0);
    });
  });

  describe('board layout', () => {
    it('should return correct snake positions', () => {
      const board = service.getBoardLayout();
      expect(board.snakes[16]).toBe(6);
      expect(board.snakes[47]).toBe(26);
    });

    it('should return correct ladder positions', () => {
      const board = service.getBoardLayout();
      expect(board.ladders[1]).toBe(38);
      expect(board.ladders[4]).toBe(14);
    });

    it('should not have overlapping snake and ladder positions', () => {
      const board = service.getBoardLayout();
      const snakePositions = new Set(Object.keys(board.snakes).map(Number));
      const ladderPositions = new Set(Object.keys(board.ladders).map(Number));
      
      const overlap = [...snakePositions].filter(x => ladderPositions.has(x));
      expect(overlap.length).toBe(0);
    });
  });
});
