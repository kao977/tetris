import { cloneMatrix, rotateClockwise, rotateCounterClockwise, TETROMINO_MATRICES, type Matrix, type TetrominoType } from "./tetrominoes";

export type Board = number[][];

export interface Piece {
  type: TetrominoType;
  matrix: Matrix;
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentPiece: Piece;
  score: number;
  linesCleared: number;
  gameOver: boolean;
}

export type RotationDirection = "cw" | "ccw";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

const PIECE_SEQUENCE: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
let sequenceIndex = 0;

function nextPieceType(): TetrominoType {
  const type = PIECE_SEQUENCE[sequenceIndex % PIECE_SEQUENCE.length];
  sequenceIndex += 1;
  return type;
}

export function resetPieceSequence(): void {
  sequenceIndex = 0;
}

export function createEmptyBoard(width = BOARD_WIDTH, height = BOARD_HEIGHT): Board {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

export function createPiece(type: TetrominoType): Piece {
  const matrix = cloneMatrix(TETROMINO_MATRICES[type]);
  const col = Math.floor((BOARD_WIDTH - matrix[0].length) / 2);
  return { type, matrix, row: 0, col };
}

function collides(board: Board, piece: Piece): boolean {
  for (let row = 0; row < piece.matrix.length; row += 1) {
    for (let col = 0; col < piece.matrix[row].length; col += 1) {
      if (!piece.matrix[row][col]) {
        continue;
      }

      const boardRow = piece.row + row;
      const boardCol = piece.col + col;

      if (boardCol < 0 || boardCol >= BOARD_WIDTH || boardRow >= BOARD_HEIGHT) {
        return true;
      }

      if (boardRow >= 0 && board[boardRow][boardCol] > 0) {
        return true;
      }
    }
  }

  return false;
}

function mergePiece(board: Board, piece: Piece): Board {
  const nextBoard = board.map((row) => [...row]);

  for (let row = 0; row < piece.matrix.length; row += 1) {
    for (let col = 0; col < piece.matrix[row].length; col += 1) {
      if (!piece.matrix[row][col]) {
        continue;
      }

      const boardRow = piece.row + row;
      const boardCol = piece.col + col;

      if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
        nextBoard[boardRow][boardCol] = piece.matrix[row][col];
      }
    }
  }

  return nextBoard;
}

function clearLines(board: Board): { board: Board; lines: number } {
  const keptRows = board.filter((row) => row.some((cell) => cell === 0));
  const lines = BOARD_HEIGHT - keptRows.length;
  const newRows = Array.from({ length: lines }, () => Array(BOARD_WIDTH).fill(0));

  return {
    board: [...newRows, ...keptRows],
    lines
  };
}

function scoreForLines(lines: number): number {
  if (lines === 1) return 100;
  if (lines === 2) return 300;
  if (lines === 3) return 500;
  if (lines >= 4) return 800;
  return 0;
}

function spawnPiece(board: Board): { piece: Piece; gameOver: boolean } {
  const piece = createPiece(nextPieceType());
  return { piece, gameOver: collides(board, piece) };
}

export function createInitialState(): GameState {
  const board = createEmptyBoard();
  const piece = createPiece(nextPieceType());

  return {
    board,
    currentPiece: piece,
    score: 0,
    linesCleared: 0,
    gameOver: false
  };
}

export function movePiece(state: GameState, offsetCol: number): GameState {
  if (state.gameOver) return state;

  const nextPiece: Piece = { ...state.currentPiece, col: state.currentPiece.col + offsetCol };
  if (collides(state.board, nextPiece)) return state;

  return { ...state, currentPiece: nextPiece };
}

export function rotatePiece(state: GameState, direction: RotationDirection = "cw"): GameState {
  if (state.gameOver) return state;

  const matrix = direction === "cw" ? rotateClockwise(state.currentPiece.matrix) : rotateCounterClockwise(state.currentPiece.matrix);
  const rotated: Piece = { ...state.currentPiece, matrix };

  if (!collides(state.board, rotated)) {
    return { ...state, currentPiece: rotated };
  }

  const kickedLeft: Piece = { ...rotated, col: rotated.col - 1 };
  if (!collides(state.board, kickedLeft)) {
    return { ...state, currentPiece: kickedLeft };
  }

  const kickedRight: Piece = { ...rotated, col: rotated.col + 1 };
  if (!collides(state.board, kickedRight)) {
    return { ...state, currentPiece: kickedRight };
  }

  return state;
}

export function tick(state: GameState): GameState {
  if (state.gameOver) return state;

  const fallingPiece: Piece = { ...state.currentPiece, row: state.currentPiece.row + 1 };
  if (!collides(state.board, fallingPiece)) {
    return { ...state, currentPiece: fallingPiece };
  }

  const mergedBoard = mergePiece(state.board, state.currentPiece);
  const { board, lines } = clearLines(mergedBoard);
  const spawned = spawnPiece(board);

  return {
    board,
    currentPiece: spawned.piece,
    score: state.score + scoreForLines(lines),
    linesCleared: state.linesCleared + lines,
    gameOver: spawned.gameOver
  };
}

export function hardDrop(state: GameState): GameState {
  let next = state;
  let previousRow = -1;

  while (!next.gameOver && next.currentPiece.row !== previousRow) {
    previousRow = next.currentPiece.row;
    const progressed = tick(next);
    if (progressed.currentPiece.row <= previousRow) {
      return progressed;
    }
    next = progressed;
  }

  return next;
}

export function boardWithPiece(state: GameState): Board {
  return mergePiece(state.board, state.currentPiece);
}
