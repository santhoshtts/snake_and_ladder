'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  winner: number | null;
  gameStarted: boolean;
}

interface DiceRoll {
  value: number;
  previousPosition: number;
  newPosition: number;
  playerIndex: number;
  message: string;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [boardLayout, setBoardLayout] = useState<{ snakes: any; ladders: any } | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentDiceValue, setCurrentDiceValue] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  useEffect(() => {
    fetchBoardLayout();
    fetchGameState();
  }, []);

  const fetchBoardLayout = async () => {
    try {
      const response = await fetch(`${API_URL}/game/board`);
      const data = await response.json();
      setBoardLayout(data);
    } catch (err) {
      console.error('Failed to fetch board layout:', err);
    }
  };

  const fetchGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/game/state`);
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error('Failed to fetch game state:', err);
    }
  };

  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playerNames }),
      });
      const data = await response.json();
      setGameState(data);
      setDiceRoll(null);
    } catch (err) {
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const rollDice = async () => {
    setLoading(true);
    setIsRolling(true);
    setError(null);
    
    // Animate dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(rollInterval);
      }
    }, 100);
    
    try {
      const response = await fetch(`${API_URL}/game/roll`, {
        method: 'POST',
      });
      const data = await response.json();
      
      setTimeout(() => {
        setDiceRoll(data);
        setCurrentDiceValue(data.value);
        setIsRolling(false);
        fetchGameState();
      }, 1200);
      
    } catch (err) {
      setError('Failed to roll dice');
      setIsRolling(false);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/game/reset`, { method: 'POST' });
      await fetchGameState();
      setDiceRoll(null);
      setCurrentDiceValue(1);
      setIsRolling(false);
    } catch (err) {
      setError('Failed to reset game');
    } finally {
      setLoading(false);
    }
  };

  const generateBoard = () => {
    const board = [];
    for (let row = 10; row >= 1; row--) {
      const rowCells = [];
      const isEvenRow = row % 2 === 0;
      for (let col = 1; col <= 10; col++) {
        const cellNumber = isEvenRow ? (row - 1) * 10 + col : row * 10 - col + 1;
        rowCells.push(cellNumber);
      }
      board.push(rowCells);
    }
    return board;
  };

  const board = generateBoard();

  const getCellColor = (cellNumber: number) => {
    return cellNumber % 2 === 0 ? '#f3f4f6' : '#ffffff';
  };

  const getCellCoordinates = (cellNumber: number) => {
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      const colIndex = board[rowIndex].indexOf(cellNumber);
      if (colIndex !== -1) {
        return {
          x: colIndex * 60, // Each cell is 56px + 4px gap = 60px
          y: rowIndex * 60,
        };
      }
    }
    return null;
  };

  const renderDiceFace = (value: number) => {
    const dotPositions: Record<number, { top: string; left: string }[]> = {
      1: [{ top: '50%', left: '50%' }],
      2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
      3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
      4: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
      5: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '50%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
      6: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '25%' }, { top: '50%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
    };

    return (
      <div className={`relative w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-gray-300 ${isRolling ? 'animate-bounce' : ''}`}>
        {dotPositions[value].map((position, index) => (
          <div
            key={index}
            className="absolute w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ top: position.top, left: position.left }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-8 text-gray-800">🐍 Snake and Ladder 🪜</h1>
        
        {!gameState?.gameStarted ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-black mb-6 text-gray-800">Start New Game</h2>
            <div className="space-y-4">
              {playerNames.map((name, index) => (
                <div key={index}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Player {index + 1} Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[index] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-800"
                    style={{ fontWeight: '700' }}
                  />
                </div>
              ))}
              <button
                onClick={() => setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`])}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                + Add Player
              </button>
              {playerNames.length > 2 && (
                <button
                  onClick={() => setPlayerNames(playerNames.slice(0, -1))}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  - Remove Player
                </button>
              )}
              <button
                onClick={startGame}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-gray-800">Game Board</h2>
                <button
                  onClick={resetGame}
                  disabled={loading}
                  className="py-2 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:bg-gray-400"
                >
                  Reset Game
                </button>
              </div>
              
              <div className="mb-4 flex gap-4 text-sm font-bold flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-800">🐍 Snake (Head → Tail)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-800">🪜 Ladder (Base → Top)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-gray-800">Finish (100)</span>
                </div>
              </div>
              
              <div className="relative">
                {/* SVG Layer for Snakes and Ladders */}
                <svg 
                  className="absolute top-0 left-0 pointer-events-none" 
                  style={{ zIndex: 5 }}
                  width="600"
                  height="600"
                  viewBox="0 0 600 600"
                >
                  {/* Snakes */}
                  {boardLayout?.snakes && Object.entries(boardLayout.snakes).map(([from, to]) => {
                    const fromCell = getCellCoordinates(parseInt(from as string));
                    const toCell = getCellCoordinates(to as number);
                    if (!fromCell || !toCell) return null;
                    
                    const startX = fromCell.x + 28;
                    const startY = fromCell.y + 28;
                    const endX = toCell.x + 28;
                    const endY = toCell.y + 28;
                    
                    // Create a zigzag snake path
                    const segments = 5;
                    const points = [];
                    for (let i = 0; i <= segments; i++) {
                      const t = i / segments;
                      const x = startX + (endX - startX) * t;
                      const y = startY + (endY - startY) * t;
                      const offset = (i % 2 === 0 ? 1 : -1) * 15 * Math.sin(t * Math.PI);
                      points.push(`${x + offset} ${y}`);
                    }
                    
                    const snakePath = `M ${points.join(' L ')}`;
                    
                    return (
                      <g key={`snake-${from}`}>
                        {/* Snake shadow for 3D effect */}
                        <path
                          d={snakePath}
                          stroke="#7f1d1d"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.4"
                          transform="translate(3, 3)"
                        />
                        
                        {/* Snake body - thick zigzag with gradient */}
                        <defs>
                          <linearGradient id={`snakeGradient-${from}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dc2626" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#b91c1c" />
                          </linearGradient>
                        </defs>
                        <path
                          d={snakePath}
                          stroke={`url(#snakeGradient-${from})`}
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Snake body pattern */}
                        <path
                          d={snakePath}
                          stroke="#fca5a5"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="10,5"
                          opacity="0.7"
                        />
                        
                        {/* Snake scales pattern */}
                        <path
                          d={snakePath}
                          stroke="#7f1d1d"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="3,7"
                          opacity="0.3"
                        />
                        
                        {/* Snake head shadow */}
                        <ellipse
                          cx={startX + 2}
                          cy={startY + 2}
                          rx="14"
                          ry="10"
                          fill="#7f1d1d"
                          opacity="0.4"
                        />
                        
                        {/* Snake head */}
                        <defs>
                          <radialGradient id={`headGradient-${from}`} cx="30%" cy="30%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </radialGradient>
                        </defs>
                        <ellipse
                          cx={startX}
                          cy={startY}
                          rx="14"
                          ry="10"
                          fill={`url(#headGradient-${from})`}
                        />
                        
                        {/* Snake eyes */}
                        <circle cx={startX - 4} cy={startY - 2} r="2.5" fill="white" />
                        <circle cx={startX + 4} cy={startY - 2} r="2.5" fill="white" />
                        <circle cx={startX - 4} cy={startY - 2} r="1.5" fill="black" />
                        <circle cx={startX + 4} cy={startY - 2} r="1.5" fill="black" />
                        
                        {/* Snake eye shine */}
                        <circle cx={startX - 4.5} cy={startY - 2.5} r="0.5" fill="white" />
                        <circle cx={startX + 3.5} cy={startY - 2.5} r="0.5" fill="white" />
                        
                        {/* Snake tongue */}
                        <path
                          d={`M ${startX} ${startY + 6} L ${startX - 4} ${startY + 12} L ${startX} ${startY + 10} L ${startX + 4} ${startY + 12} Z`}
                          fill="#ef4444"
                          stroke="#dc2626"
                          strokeWidth="0.5"
                        />
                        
                        {/* Snake tail shadow */}
                        <path
                          d={`M ${endX + 2} ${endY + 2} L ${endX - 3} ${endY - 6} L ${endX + 7} ${endY - 6} Z`}
                          fill="#7f1d1d"
                          opacity="0.4"
                        />
                        
                        {/* Snake tail */}
                        <path
                          d={`M ${endX} ${endY} L ${endX - 5} ${endY - 8} L ${endX + 5} ${endY - 8} Z`}
                          fill="#dc2626"
                        />
                        <path
                          d={`M ${endX} ${endY} L ${endX - 3} ${endY - 6} L ${endX + 3} ${endY - 6} Z`}
                          fill="#ef4444"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Ladders */}
                  {boardLayout?.ladders && Object.entries(boardLayout.ladders).map(([from, to]) => {
                    const fromCell = getCellCoordinates(parseInt(from as string));
                    const toCell = getCellCoordinates(to as number);
                    if (!fromCell || !toCell) return null;
                    
                    const startX = fromCell.x + 28;
                    const startY = fromCell.y + 28;
                    const endX = toCell.x + 28;
                    const endY = toCell.y + 28;
                    
                    const ladderWidth = 14;
                    const rungCount = 7;
                    
                    // Calculate ladder rung positions
                    const rungs = [];
                    for (let i = 1; i <= rungCount; i++) {
                      const t = i / (rungCount + 1);
                      const x = startX + (endX - startX) * t;
                      const y = startY + (endY - startY) * t;
                      rungs.push({ x, y });
                    }
                    
                    return (
                      <g key={`ladder-${from}`}>
                        {/* Enhanced 3D shadow */}
                        <g opacity="0.5" transform="translate(4, 4)">
                          <line
                            x1={startX - ladderWidth/2}
                            y1={startY}
                            x2={endX - ladderWidth/2}
                            y2={endY}
                            stroke="#78350f"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                          <line
                            x1={startX + ladderWidth/2}
                            y1={startY}
                            x2={endX + ladderWidth/2}
                            y2={endY}
                            stroke="#78350f"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                          {rungs.map((rung, i) => (
                            <line
                              key={`shadow-rung-${i}`}
                              x1={rung.x - ladderWidth/2}
                              y1={rung.y}
                              x2={rung.x + ladderWidth/2}
                              y2={rung.y}
                              stroke="#78350f"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          ))}
                        </g>
                        
                        {/* Ladder sides - main dark wood */}
                        <defs>
                          <linearGradient id={`ladderSide-${from}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#92400e" />
                            <stop offset="50%" stopColor="#78350f" />
                            <stop offset="100%" stopColor="#92400e" />
                          </linearGradient>
                        </defs>
                        <line
                          x1={startX - ladderWidth/2}
                          y1={startY}
                          x2={endX - ladderWidth/2}
                          y2={endY}
                          stroke={`url(#ladderSide-${from})`}
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        <line
                          x1={startX + ladderWidth/2}
                          y1={startY}
                          x2={endX + ladderWidth/2}
                          y2={endY}
                          stroke={`url(#ladderSide-${from})`}
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        
                        {/* Ladder sides - wood grain highlights */}
                        <line
                          x1={startX - ladderWidth/2 + 1}
                          y1={startY}
                          x2={endX - ladderWidth/2 + 1}
                          y2={endY}
                          stroke="#b45309"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        <line
                          x1={startX + ladderWidth/2 - 1}
                          y1={startY}
                          x2={endX + ladderWidth/2 - 1}
                          y2={endY}
                          stroke="#b45309"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        
                        {/* Ladder rungs with wood texture */}
                        {rungs.map((rung, i) => (
                          <g key={`rung-${i}`}>
                            {/* Rung shadow */}
                            <line
                              x1={rung.x - ladderWidth/2 + 3}
                              y1={rung.y + 3}
                              x2={rung.x + ladderWidth/2 + 3}
                              y2={rung.y + 3}
                              stroke="#713f12"
                              strokeWidth="4"
                              strokeLinecap="round"
                              opacity="0.6"
                            />
                            
                            {/* Rung main */}
                            <defs>
                              <linearGradient id={`rung-${from}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#d97706" />
                                <stop offset="50%" stopColor="#b45309" />
                                <stop offset="100%" stopColor="#d97706" />
                              </linearGradient>
                            </defs>
                            <line
                              x1={rung.x - ladderWidth/2}
                              y1={rung.y}
                              x2={rung.x + ladderWidth/2}
                              y2={rung.y}
                              stroke={`url(#rung-${from}-${i})`}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            
                            {/* Rung highlight */}
                            <line
                              x1={rung.x - ladderWidth/2 + 1}
                              y1={rung.y - 1}
                              x2={rung.x + ladderWidth/2 - 1}
                              y2={rung.y - 1}
                              stroke="#fbbf24"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              opacity="0.8"
                            />
                            
                            {/* Wood grain detail */}
                            <line
                              x1={rung.x - ladderWidth/2 + 2}
                              y1={rung.y}
                              x2={rung.x + ladderWidth/2 - 2}
                              y2={rung.y}
                              stroke="#92400e"
                              strokeWidth="1"
                              strokeLinecap="round"
                              opacity="0.4"
                            />
                          </g>
                        ))}
                        
                        {/* Enhanced 3D base platform */}
                        <g>
                          <rect
                            x={startX - 12}
                            y={startY - 4}
                            width="24"
                            height="8"
                            fill="#78350f"
                            rx="2"
                          />
                          <rect
                            x={startX - 12}
                            y={startY - 4}
                            width="24"
                            height="3"
                            fill="#92400e"
                            rx="2"
                          />
                          <rect
                            x={startX - 12}
                            y={startY - 4}
                            width="24"
                            height="1"
                            fill="#b45309"
                            rx="1"
                          />
                        </g>
                        
                        {/* Enhanced 3D top platform */}
                        <g>
                          <rect
                            x={endX - 12}
                            y={endY - 4}
                            width="24"
                            height="8"
                            fill="#78350f"
                            rx="2"
                          />
                          <rect
                            x={endX - 12}
                            y={endY - 4}
                            width="24"
                            height="3"
                            fill="#92400e"
                            rx="2"
                          />
                          <rect
                            x={endX - 12}
                            y={endY - 4}
                            width="24"
                            height="1"
                            fill="#b45309"
                            rx="1"
                          />
                        </g>
                      </g>
                    );
                  })}
                </svg>
                
                <div className="grid gap-1">
                  {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      {row.map((cellNumber) => (
                        <div
                          key={cellNumber}
                          id={`cell-${cellNumber}`}
                          className={`relative w-14 h-14 flex flex-col items-center justify-center text-sm font-bold border-2 border-gray-400 rounded ${
                            cellNumber === 100 ? 'bg-yellow-400' : ''
                          }`}
                          style={{ backgroundColor: cellNumber !== 100 ? getCellColor(cellNumber) : undefined }}
                        >
                          <span className="z-10 font-black text-sm text-gray-800">{cellNumber}</span>
                          {gameState?.players.map((player) =>
                            player.position === cellNumber ? (
                              <div
                                key={player.id}
                                className="absolute top-1 left-1 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: player.color }}
                              />
                            ) : null
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-black mb-4 text-gray-800">Players</h3>
                <div className="space-y-3">
                  {gameState?.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border-2 ${
                        gameState.currentPlayerIndex === index && gameState.winner === null
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="font-bold text-gray-800">{player.name}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">Position: {player.position}</p>
                      {gameState.winner === player.id && (
                        <p className="text-sm font-black text-green-600 mt-1">🏆 Winner!</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-black mb-4 text-gray-800">Game Controls</h3>
                {gameState.winner !== null ? (
                  <div className="text-center">
                    <p className="text-xl font-black text-green-600 mb-4">
                      🎉 {gameState.players.find((p) => p.id === gameState.winner)?.name} Wins! 🎉
                    </p>
                    <button
                      onClick={resetGame}
                      disabled={loading}
                      className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      Play Again
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg mb-4 font-bold text-gray-800">
                      Current Turn: <span className="font-black text-blue-600">
                        {gameState.players[gameState.currentPlayerIndex]?.name}
                      </span>
                    </p>
                    <button
                      onClick={rollDice}
                      disabled={loading}
                      className="w-full py-3 px-8 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 text-lg"
                    >
                      {loading ? 'Rolling...' : '🎲 Roll Dice'}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-blue-200">
                <h3 className="text-xl font-black mb-4 text-gray-800">🎲 Dice</h3>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {renderDiceFace(currentDiceValue)}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-4xl font-black text-blue-600">
                      {currentDiceValue}
                    </div>
                  </div>
                  {diceRoll && !isRolling && (
                    <div className="mt-12 text-center w-full">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800 font-bold">{diceRoll.message}</p>
                        <div className="mt-2 text-sm font-bold text-gray-700">
                          <span className="font-black">From:</span> {diceRoll.previousPosition} → 
                          <span className="font-black"> To:</span> {diceRoll.newPosition}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
