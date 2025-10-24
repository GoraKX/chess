import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Chess, Move, Square } from 'chess.js';
import type { PlayerColor } from '../types';

const FILES = 'abcdefgh';

const PIECE_ICON: Record<string, string> = {
  wp: '♙',
  bp: '♟︎',
  wn: '♘',
  bn: '♞',
  wb: '♗',
  bb: '♝',
  wr: '♖',
  br: '♜',
  wq: '♕',
  bq: '♛',
  wk: '♔',
  bk: '♚'
};

export interface BoardProps {
  chess: Chess;
  playerColor: PlayerColor;
  selectedSquare: string | null;
  legalMoves: Move[];
  onSquarePress: (square: string) => void;
  isIsometric: boolean;
}

export function Board({
  chess,
  playerColor,
  selectedSquare,
  legalMoves,
  onSquarePress,
  isIsometric
}: BoardProps) {
  const legalTargets = useMemo(() => new Set(legalMoves.map((move) => move.to)), [legalMoves]);

  const rankIndices = useMemo(
    () => (playerColor === 'w' ? [...Array(8).keys()] : [...Array(8).keys()].reverse()),
    [playerColor]
  );
  const fileIndices = useMemo(
    () => (playerColor === 'w' ? [...Array(8).keys()] : [...Array(8).keys()].reverse()),
    [playerColor]
  );

  const boardStyle = useMemo(() => {
    if (!isIsometric) {
      return styles.board;
    }

    const rotateZ = playerColor === 'w' ? '45deg' : '-135deg';
    return [
      styles.board,
      {
        transform: [{ perspective: 900 }, { rotateX: '60deg' }, { rotateZ }]
      }
    ];
  }, [isIsometric, playerColor]);

  return (
    <View style={styles.wrapper}>
      <View style={boardStyle}>
        {rankIndices.map((rank) => (
          <View key={`rank-${rank}`} style={styles.rank}>
            {fileIndices.map((file) => {
              const square = `${FILES[file]}${8 - rank}`;
              const piece = chess.get(square as Square);
              const isDark = (rank + file) % 2 === 1;
              const isSelected = square === selectedSquare;
              const isTarget = legalTargets.has(square);
              const squareStyles = [styles.square, isDark ? styles.darkSquare : styles.lightSquare];

              if (isSelected) {
                squareStyles.push(styles.selectedSquare);
              } else if (isTarget) {
                squareStyles.push(styles.targetSquare);
              }

              return (
                <TouchableOpacity
                  key={square}
                  style={squareStyles}
                  onPress={() => onSquarePress(square)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.piece, piece?.color === 'w' ? styles.whitePiece : styles.blackPiece]}>
                    {piece ? PIECE_ICON[`${piece.color}${piece.type}`] : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  board: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  rank: {
    flex: 1,
    flexDirection: 'row'
  },
  square: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lightSquare: {
    backgroundColor: '#f0d9b5'
  },
  darkSquare: {
    backgroundColor: '#b58863'
  },
  selectedSquare: {
    backgroundColor: '#f6f669'
  },
  targetSquare: {
    backgroundColor: '#a2e0a1'
  },
  piece: {
    fontSize: 28,
    fontWeight: '600'
  },
  whitePiece: {
    color: '#fff'
  },
  blackPiece: {
    color: '#000'
  }
});

export default Board;
