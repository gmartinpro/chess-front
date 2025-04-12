import React, { useEffect, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Copy } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { GameState, Move } from '../types/chess';
import useKeycloak from '../hooks/useKeycloak';

const SOCKET_SERVER_URL = 'http://localhost:3000'; // TODO: to put in .env

export default function ChessGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game] = useState(new Chess());
  const [inputGameId, setInputGameId] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    id: null,
    players: null,
    status: 'pending',
    fen: game.fen(),
    isPlayerTurn: false,
    playerColor: null,
    winner: null
  });
  const { authenticated, initialized, userInfos, keycloak } = useKeycloak();

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true, transports: ['websocket', 'polling'], auth: keycloak ?? undefined });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [keycloak]);

  useEffect(() => {
    if (!socket) return;

    socket.on('gameCreated', ({ id, currentPlayer }) => {
      setGameState((prev) => ({
        ...prev,
        id,
        playerColor: 'white',
        isPlayerTurn: currentPlayer === socket.id,
        fen: game.fen()
      }));
    });

    socket.on('playerJoined', ({ gameId }) => {
      setGameState((prev) => ({
        ...prev,
        status: 'playing',
        id: gameId,
        isPlayerTurn: false,
        playerColor: 'black',
        fen: game.fen()
      }));
    });

    socket.on('gameStarted', () => {
      setGameState((prev) => ({
        ...prev,
        isPlayerTurn: true
      }));
    });

    socket.on('moveMade', ({ currentPlayer, from, to }) => {
      if (currentPlayer === socket.id) {
        game.move({ from, to });
      }
      setGameState((prev) => ({
        ...prev,
        fen: game.fen(),
        isPlayerTurn: currentPlayer === socket.id
      }));
    });

    socket.on('illegalMove', () => {
      game.undo();
      setGameState((prev) => ({
        ...prev,
        fen: game.fen(),
        isPlayerTurn: true
      }));
    });

    socket.on('gameOver', ({ winner, currentPlayer, from, to, status }) => {
      if (currentPlayer === socket.id) {
        game.move({ from, to });
      }
      setGameState((prev) => ({
        ...prev,
        fen: game.fen(),
        status,
        winner
      }));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('playerJoined');
      socket.off('moveMade');
      socket.off('checkmate');
      socket.off('error');
    };
  }, [socket, game]);

  const createNewGame = () => {
    console.log(socket);
    if (socket) {
      console.log('here');
      socket.emit('newGame', userInfos?.email);
      setGameState((prev) => ({ ...prev, status: 'pending' }));
    }
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    const gameId = inputGameId.trim();
    if (socket && gameId) {
      socket.emit('joinGame', { gameId, email: userInfos?.email });
      setGameState((prev) => ({ ...prev, status: 'pending', id: gameId }));
    }
  };

  const makeMove = useCallback(
    (move: Move) => {
      console.log('test', socket, gameState.isPlayerTurn);
      if (socket && gameState.isPlayerTurn) {
        try {
          const result = game.move(move);
          if (result) {
            socket.emit('makeMove', {
              gameId: gameState.id,
              move: move,
              email: userInfos?.email
            });
            setGameState((prev) => ({
              ...prev,
              position: game.fen(),
              isPlayerTurn: false
            }));
            return true;
          }
        } catch (error) {
          console.error('Invalid move:', error);
        }
      }
      return false;
    },
    [socket, game, gameState.id, gameState.isPlayerTurn, userInfos?.email]
  );

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    return makeMove({
      from: sourceSquare,
      to: targetSquare
    });
  };

  const copyGameId = () => {
    if (gameState.id) {
      navigator.clipboard.writeText(gameState.id);
    }
  };

  const resetGame = () => {
    game.reset();
    setGameState({
      id: null,
      fen: game.fen(),
      isPlayerTurn: false,
      playerColor: null,
      status: 'pending',
      winner: null,
      players: null
    });
    setInputGameId('');
    game.reset();
  };

  return !authenticated && initialized ? (
    <span> Please authenticate</span>
  ) : (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>Chess Game</h1>
          {!gameState.id && (
            <div className='space-y-4'>
              <button onClick={createNewGame} className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>
                Create New Game
              </button>
              <form onSubmit={joinGame} className='flex space-x-2'>
                <input type='text' placeholder='Enter Game ID' value={inputGameId} onChange={(e) => setInputGameId(e.target.value)} className='flex-1 border rounded px-3 py-2' />
                <button
                  type='submit'
                  disabled={!inputGameId.trim()}
                  className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Join Game
                </button>
              </form>
            </div>
          )}
          {gameState.id && (
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-gray-600'>Game ID: {gameState.id}</span>
                <button onClick={copyGameId} className='p-1 hover:bg-gray-100 rounded' title='Copy Game ID'>
                  <Copy size={16} />
                </button>
                {socket?.id ? <span className='text-gray-600'>Socket ID : {socket.id}</span> : null}
              </div>
              <button onClick={resetGame} className='text-red-600 hover:text-red-700 transition'>
                Leave Game
              </button>
            </div>
          )}
        </div>
        <div className='aspect-square w-full max-w-2xl mx-auto'>
          <Chessboard position={gameState.fen} onPieceDrop={onDrop} boardOrientation={gameState.playerColor || 'white'} />
        </div>
        <div className='mt-4 text-center'>
          {gameState.status === 'pending' && gameState.id && <p className='text-lg text-blue-600'>Waiting for opponent to join...</p>}
          {gameState.status === 'playing' && <p className='text-lg'>{gameState.isPlayerTurn ? "It's your turn" : "Waiting for opponent's to play"}</p>}
          {gameState.status === 'checkmate' && <p className='text-xl font-bold'>Game Over! {`${gameState.winner} wins!`}</p>}
          {gameState.status === 'draw' && <p className='text-xl font-bold'>Game Over! {`It's a draw`}</p>}
          {gameState.status === 'stalemate' && <p className='text-xl font-bold'>Game Over! {`It's a draw`}</p>}
        </div>
      </div>
    </div>
  );
}
