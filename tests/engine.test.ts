import { describe, expect, it, beforeEach } from "vitest";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createEmptyBoard,
  createInitialState,
  createPiece,
  hardDrop,
  movePiece,
  resetPieceSequence,
  rotatePiece,
  tick,
  type GameState
} from "../src/game/engine";

describe("tetris engine", () => {
  beforeEach(() => {
    resetPieceSequence();
  });

  it("creates an empty board with 20 x 10 size", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(board[0]).toHaveLength(BOARD_WIDTH);
    expect(board.flat().every((cell) => cell === 0)).toBe(true);
  });

  it("spawns a first piece in the center", () => {
    const state = createInitialState();
    expect(state.currentPiece.type).toBe("I");
    expect(state.currentPiece.col).toBe(3);
  });

  it("moves piece left and right when path is clear", () => {
    const state = createInitialState();
    const movedLeft = movePiece(state, -1);
    const movedRight = movePiece(movedLeft, 2);

    expect(movedLeft.currentPiece.col).toBe(state.currentPiece.col - 1);
    expect(movedRight.currentPiece.col).toBe(state.currentPiece.col + 1);
  });

  it("does not move a piece beyond board boundaries", () => {
    let state = createInitialState();
    for (let i = 0; i < 20; i += 1) {
      state = movePiece(state, -1);
    }

    expect(state.currentPiece.col).toBe(0);
  });

  it("rotates a piece clockwise", () => {
    const custom: GameState = {
      board: createEmptyBoard(),
      currentPiece: createPiece("T"),
      score: 0,
      linesCleared: 0,
      gameOver: false
    };

    const rotated = rotatePiece(custom);
    expect(rotated.currentPiece.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ]);
  });

  it("locks piece when it can no longer fall and spawns next piece", () => {
    let state = createInitialState();

    for (let i = 0; i < BOARD_HEIGHT; i += 1) {
      state = tick(state);
    }

    expect(state.currentPiece.type).toBe("O");
    expect(state.board.some((row) => row.some((cell) => cell === 1))).toBe(true);
  });

  it("clears full lines and updates score", () => {
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill(1);
    board[BOARD_HEIGHT - 2] = Array(BOARD_WIDTH).fill(1);

    const state: GameState = {
      board,
      currentPiece: {
        ...createPiece("O"),
        row: 0,
        col: 0
      },
      score: 0,
      linesCleared: 0,
      gameOver: false
    };

    const next = hardDrop(state);
    expect(next.linesCleared).toBeGreaterThanOrEqual(2);
    expect(next.score).toBeGreaterThanOrEqual(300);
  });

  it("rotates a piece counterclockwise", () => {
    const custom: GameState = {
      board: createEmptyBoard(),
      currentPiece: createPiece("T"),
      score: 0,
      linesCleared: 0,
      gameOver: false
    };

    const rotated = rotatePiece(custom, "ccw");
    expect(rotated.currentPiece.matrix).toEqual([
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]);
  });
});
