export interface GameState {
  id: string | null;
  players: string[] | null;
  status: GameStatus;
  fen: string; // Forsyth-Edwards Notation => État de l'échiquier
  playerColor: 'white' | 'black' | null;
  isPlayerTurn: boolean;
  winner: null;
}
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resign' | 'pending';

export interface Move {
  from: string;
  to: string;
}
