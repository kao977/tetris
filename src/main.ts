import "./style.css";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  boardWithPiece,
  createInitialState,
  hardDrop,
  movePiece,
  resetPieceSequence,
  rotatePiece,
  tick,
  type GameState
} from "./game/engine";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Cannot find app element.");
}

app.innerHTML = `
  <main class="layout">
    <section class="game-shell">
      <header class="game-header">
        <h1>TETRIS</h1>
        <button id="restart" aria-label="Restart game">Restart</button>
      </header>
      <canvas id="board" width="300" height="600" aria-label="Tetris board"></canvas>
      <p class="hint">Arrows: Move, Up/X: CW rotate, Z: CCW rotate, Space: Hard drop</p>
    </section>
    <aside class="panel">
      <p><span>Score</span><strong id="score">0</strong></p>
      <p><span>Lines</span><strong id="lines">0</strong></p>
      <p><span>Status</span><strong id="status">Running</strong></p>
    </aside>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#board");
const scoreEl = document.querySelector<HTMLElement>("#score");
const linesEl = document.querySelector<HTMLElement>("#lines");
const statusEl = document.querySelector<HTMLElement>("#status");
const restartBtn = document.querySelector<HTMLButtonElement>("#restart");

if (!canvas || !scoreEl || !linesEl || !statusEl || !restartBtn) {
  throw new Error("Missing required game elements.");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Cannot initialize canvas context.");
}

const CELL_SIZE = canvas.width / BOARD_WIDTH;
const COLORS = [
  "#000000",  // 0: 空白
  "#00e5ff",  // 1: 青色
  "#ff00ff",  // 2: 洋紅
  "#ffff00",  // 3: 黃色
  "#00ff00",  // 4: 綠色
  "#ff6600",  // 5: 橙色
  "#ff0066",  // 6: 粉紅
  "#6600ff"   // 7: 紫色
];
let state: GameState = createInitialState();

function restart(): void {
  resetPieceSequence();
  state = createInitialState();
  render();
}

function render(): void {
  const board = boardWithPiece(state);

  ctx.fillStyle = "#071114";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    for (let col = 0; col < BOARD_WIDTH; col += 1) {
      if (!board[row][col]) continue;

      ctx.fillStyle = COLORS[board[row][col]] ?? "#00e5ff";
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }

  scoreEl.textContent = String(state.score);
  linesEl.textContent = String(state.linesCleared);
  statusEl.textContent = state.gameOver ? "Game Over" : "Running";
}

function loop(): void {
  if (!state.gameOver) {
    state = tick(state);
    render();
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    state = movePiece(state, -1);
  } else if (event.key === "ArrowRight") {
    state = movePiece(state, 1);
  } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "x") {
    state = rotatePiece(state);
  } else if (event.key.toLowerCase() === "z") {
    state = rotatePiece(state, "ccw");
  } else if (event.key === "ArrowDown") {
    state = tick(state);
  } else if (event.code === "Space") {
    event.preventDefault();
    state = hardDrop(state);
  }

  render();
});

restartBtn.addEventListener("click", restart);

render();
setInterval(loop, 500);
