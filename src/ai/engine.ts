import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { Difficulty, PlayerColor } from '../types';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5']);

const POSITIONAL_BONUS: Record<string, number[][]> = {
  p: [
    [0, 5, 5, 0, 5, 10, 50, 0],
    [0, 10, -5, 0, 5, 10, 50, 0],
    [0, 10, -10, 20, 25, 30, 60, 0],
    [5, 5, 10, 25, 30, 35, 60, 5],
    [10, 10, 20, 30, 35, 40, 70, 10],
    [20, 25, 30, 35, 40, 45, 80, 20],
    [80, 80, 80, 80, 80, 80, 80, 80],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  r: [
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [25, 25, 25, 25, 25, 25, 25, 25],
    [0, 0, 5, 10, 10, 5, 0, 0]
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]
};

function cloneChess(chess: Chess): Chess {
  return new Chess(chess.fen());
}

function positionalBonus(piece: Move['piece'], color: PlayerColor, rank: number, file: number): number {
  const table = POSITIONAL_BONUS[piece];
  if (!table) {
    return 0;
  }

  const adjustedRank = color === 'w' ? 7 - rank : rank;
  return table[adjustedRank][file];
}

function evaluateBoard(chess: Chess, perspective: PlayerColor): number {
  if (isCheckmate(chess)) {
    return chess.turn() === perspective ? -Infinity : Infinity;
  }

  if (isDraw(chess)) {
    return 0;
  }

  const board = chess.board();
  let score = 0;

  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = board[rank][file];
      if (!piece) continue;

      const baseValue = PIECE_VALUES[piece.type];
      const positional = positionalBonus(piece.type, piece.color, rank, file);
      const centerControl = CENTER_SQUARES.has(squareNameFromIndices(rank, file)) ? 15 : 0;
      const total = baseValue + positional + centerControl;
      score += piece.color === perspective ? total : -total;
    }
  }

  score += evaluateKingSafety(chess, perspective);
  score += evaluateMobility(chess, perspective);

  return score;
}

function squareNameFromIndices(rank: number, file: number): string {
  const files = 'abcdefgh';
  return `${files[file]}${8 - rank}`;
}

function evaluateKingSafety(chess: Chess, perspective: PlayerColor): number {
  const perspectiveInCheck = isInCheck(cloneWithTurn(chess, perspective));
  const opponentInCheck = isInCheck(cloneWithTurn(chess, oppositeColor(perspective)));

  let score = 0;
  if (perspectiveInCheck) {
    score -= 75;
  }
  if (opponentInCheck) {
    score += 45;
  }
  return score;
}

function evaluateMobility(chess: Chess, perspective: PlayerColor): number {
  const currentTurn = chess.turn();
  const aiMoves = countMovesFor(chess, perspective);
  const opponentMoves = countMovesFor(chess, oppositeColor(perspective));

  let mobilityScore = (aiMoves - opponentMoves) * 5;
  if (currentTurn === perspective) {
    mobilityScore += 5;
  }
  return mobilityScore;
}

function countMovesFor(chess: Chess, color: PlayerColor): number {
  const clone = cloneWithTurn(chess, color);
  return (clone.moves({ verbose: true }) as Move[]).length;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  perspective: PlayerColor
): { score: number; move: Move | null } {
  if (depth === 0 || isGameOver(chess)) {
    return { score: evaluateBoard(chess, perspective), move: null };
  }

  const legalMoves = orderMoves(chess.moves({ verbose: true }) as Move[]);

  if (legalMoves.length === 0) {
    return { score: evaluateBoard(chess, perspective), move: null };
  }

  let bestMove: Move | null = null;

  if (maximizing) {
    let value = -Infinity;
    for (const move of legalMoves) {
      const next = cloneChess(chess);
      next.move({ from: move.from, to: move.to, promotion: move.promotion });
      const { score } = minimax(next, depth - 1, alpha, beta, false, perspective);
      if (score > value) {
        value = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
      if (beta <= alpha) break;
    }
    return { score: value, move: bestMove };
  }

  let value = Infinity;
  for (const move of legalMoves) {
    const next = cloneChess(chess);
    next.move({ from: move.from, to: move.to, promotion: move.promotion });
    const { score } = minimax(next, depth - 1, alpha, beta, true, perspective);
    if (score < value) {
      value = score;
      bestMove = move;
    }
    beta = Math.min(beta, value);
    if (beta <= alpha) break;
  }
  return { score: value, move: bestMove };
}

function orderMoves(moves: Move[]): Move[] {
  return moves
    .slice()
    .sort((a, b) => getMoveOrderingScore(b) - getMoveOrderingScore(a));
}

function getMoveOrderingScore(move: Move): number {
  let score = 0;
  if (move.flags.includes('c')) score += 1000;
  if (move.flags.includes('p')) score += 500;
  if (move.flags.includes('k') || move.flags.includes('q')) score += 100;
  if (CENTER_SQUARES.has(move.to)) score += 50;
  return score;
}

function oppositeColor(color: PlayerColor): PlayerColor {
  return color === 'w' ? 'b' : 'w';
}

export function selectAIMove(
  chess: Chess,
  difficulty: Difficulty,
  aiColor: PlayerColor
): Move | null {
  const legalMoves = chess.moves({ verbose: true }) as Move[];
  if (legalMoves.length === 0) {
    return null;
  }

  if (difficulty === 'easy') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const depth = difficulty === 'medium' ? 2 : 3;
  const maximizing = chess.turn() === aiColor;
  const { move } = minimax(cloneChess(chess), depth, -Infinity, Infinity, maximizing, aiColor);

  if (move) {
    return move;
  }

  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

function cloneWithTurn(chess: Chess, color: PlayerColor): Chess {
  const parts = chess.fen().split(' ');
  parts[1] = color;
  return new Chess(parts.join(' '));
}

function isInCheck(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isCheck?: () => boolean;
    in_check?: () => boolean;
  };
  if (typeof candidate.isCheck === 'function') {
    return candidate.isCheck();
  }
  if (typeof candidate.in_check === 'function') {
    return candidate.in_check();
  }
  return false;
}

function isGameOver(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isGameOver?: () => boolean;
    game_over?: () => boolean;
  };
  if (typeof candidate.isGameOver === 'function') {
    return candidate.isGameOver();
  }
  if (typeof candidate.game_over === 'function') {
    return candidate.game_over();
  }
  return false;
}

function isCheckmate(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isCheckmate?: () => boolean;
    in_checkmate?: () => boolean;
  };
  if (typeof candidate.isCheckmate === 'function') {
    return candidate.isCheckmate();
  }
  if (typeof candidate.in_checkmate === 'function') {
    return candidate.in_checkmate();
  }
  return false;
}

function isDraw(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isDraw?: () => boolean;
    in_draw?: () => boolean;
  };
  if (typeof candidate.isDraw === 'function') {
    return candidate.isDraw();
  }
  if (typeof candidate.in_draw === 'function') {
    return candidate.in_draw();
  }
  return false;
}
