import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Chess } from 'chess.js';
import type { Move, Square } from 'chess.js';
import Board from '../components/Board';
import { selectAIMove } from '../ai/engine';
import type { Difficulty, PlayerColor } from '../types';

export interface GameScreenProps {
  playerName: string;
  playerColor: PlayerColor;
  difficulty: Difficulty;
  onBackToMenu: () => void;
}

export function GameScreen({ playerName, playerColor, difficulty, onBackToMenu }: GameScreenProps) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState('');
  const [isIsometric, setIsIsometric] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const aiColor = useMemo<PlayerColor>(() => (playerColor === 'w' ? 'b' : 'w'), [playerColor]);

  const resetGame = useCallback(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
  }, []);

  const updateStatus = useCallback(() => {
    const chess = chessRef.current;
    if (isCheckmate(chess)) {
      const winner = chess.turn() === playerColor ? 'AI' : playerName || 'Player';
      setStatus(`Checkmate! ${winner} wins.`);
      return;
    }

    if (isDraw(chess)) {
      if (isStalemate(chess)) {
        setStatus('Draw by stalemate.');
      } else if (isThreefold(chess)) {
        setStatus('Draw by threefold repetition.');
      } else if (isInsufficient(chess)) {
        setStatus('Draw by insufficient material.');
      } else {
        setStatus('Draw.');
      }
      return;
    }

    const turn = chess.turn();
    if (turn === playerColor) {
      setStatus(`${playerName || 'Player'} to move.`);
    } else {
      setStatus('AI thinking...');
    }
  }, [playerColor, playerName]);

  useEffect(() => {
    resetGame();
  }, [difficulty, playerColor, resetGame]);

  useEffect(() => {
    updateStatus();
    const chess = chessRef.current;

    if (isGameOver(chess)) {
      setAiThinking(false);
      return;
    }

    if (chess.turn() !== playerColor) {
      setAiThinking(true);
      const timeout = setTimeout(() => {
        const move = selectAIMove(chess, difficulty, chess.turn() as PlayerColor);
        if (move) {
          const result = chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
          if (result) {
            setMoveHistory((moves) => [...moves, formatMove(moves.length, result.san)]);
          }
        }
        setFen(chess.fen());
        setSelectedSquare(null);
        setLegalMoves([]);
        setAiThinking(false);
      }, 300);

      return () => {
        clearTimeout(timeout);
      };
    }

    setAiThinking(false);
  }, [fen, difficulty, playerColor, updateStatus]);

  const handleSquarePress = useCallback(
    (square: string) => {
      const chess = chessRef.current;
      if (isGameOver(chess) || chess.turn() !== playerColor || aiThinking) {
        return;
      }

      if (selectedSquare && square === selectedSquare) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moves = chess.moves({ square: square as Square, verbose: true }) as Move[];
      const piece = chess.get(square as Square);

      if (selectedSquare && legalMoves.some((move) => move.to === square)) {
        const move = legalMoves.find((m) => m.to === square);
        if (move) {
          const promotion = move.promotion ?? (move.flags.includes('p') ? 'q' : undefined);
          const result = chess.move({ from: move.from, to: move.to, promotion });
          if (result) {
            setMoveHistory((moves) => [...moves, formatMove(moves.length, result.san)]);
          }
          setSelectedSquare(null);
          setLegalMoves([]);
          setFen(chess.fen());
        }
        return;
      }

      if (piece && piece.color === playerColor && moves.length > 0) {
        setSelectedSquare(square);
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [aiThinking, legalMoves, playerColor, selectedSquare]
  );

  useEffect(() => {
    updateStatus();
  }, [fen, updateStatus]);

  const togglePerspective = () => {
    setIsIsometric((prev) => !prev);
  };

  const handleNewGame = () => {
    resetGame();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>{playerName || 'Player'} vs AI</Text>
          <Text style={styles.subHeaderText}>
            You are playing {playerColor === 'w' ? 'White' : 'Black'} • AI plays {aiColor === 'w' ? 'White' : 'Black'}
          </Text>
          <Text style={styles.subHeaderText}>Difficulty: {difficulty.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
          <Text style={styles.backButtonText}>Menu</Text>
        </TouchableOpacity>
      </View>

      <Board
        chess={chessRef.current}
        playerColor={playerColor}
        selectedSquare={selectedSquare}
        legalMoves={legalMoves}
        onSquarePress={handleSquarePress}
        isIsometric={isIsometric}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={togglePerspective}>
          <Text style={styles.secondaryButtonText}>{isIsometric ? 'View in 2D' : 'View in 3D'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleNewGame}>
          <Text style={styles.secondaryButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>{status}</Text>

      <ScrollView style={styles.history} contentContainerStyle={styles.historyContent}>
        <Text style={styles.historyTitle}>Moves</Text>
        {moveHistory.length === 0 ? (
          <Text style={styles.historyText}>No moves yet.</Text>
        ) : (
          moveHistory.map((move, index) => (
            <Text key={`move-${move}-${index}`} style={styles.historyText}>
              {move}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function formatMove(index: number, san: string): string {
  const moveNumber = Math.floor(index / 2) + 1;
  const prefix = index % 2 === 0 ? `${moveNumber}.` : `${moveNumber}...`;
  return `${prefix} ${san}`;
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

function isStalemate(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isStalemate?: () => boolean;
    in_stalemate?: () => boolean;
  };
  if (typeof candidate.isStalemate === 'function') {
    return candidate.isStalemate();
  }
  if (typeof candidate.in_stalemate === 'function') {
    return candidate.in_stalemate();
  }
  return false;
}

function isThreefold(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isThreefoldRepetition?: () => boolean;
    in_threefold_repetition?: () => boolean;
  };
  if (typeof candidate.isThreefoldRepetition === 'function') {
    return candidate.isThreefoldRepetition();
  }
  if (typeof candidate.in_threefold_repetition === 'function') {
    return candidate.in_threefold_repetition();
  }
  return false;
}

function isInsufficient(chess: Chess): boolean {
  const candidate = chess as Chess & {
    isInsufficientMaterial?: () => boolean;
    insufficient_material?: () => boolean;
  };
  if (typeof candidate.isInsufficientMaterial === 'function') {
    return candidate.isInsufficientMaterial();
  }
  if (typeof candidate.insufficient_material === 'function') {
    return candidate.insufficient_material();
  }
  return false;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: 24,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff'
  },
  subHeaderText: {
    color: '#cccccc'
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#333'
  },
  secondaryButtonText: {
    color: '#f0f0f0',
    textAlign: 'center',
    fontWeight: '600'
  },
  status: {
    color: '#ddd',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16
  },
  history: {
    marginTop: 16,
    maxHeight: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    backgroundColor: '#151515'
  },
  historyContent: {
    padding: 12
  },
  historyTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8
  },
  historyText: {
    color: '#ccc',
    marginBottom: 4
  }
});

export default GameScreen;
