# Tetris (TDD + GitHub Pages)

A browser-based Tetris game built with TypeScript + Vite using TDD workflow.

## Commands

- `npm install`: install dependencies
- `npm run dev`: start local development server
- `npm test`: run test suite once
- `npm run test:watch`: run tests in watch mode
- `npm run build`: build production assets
- `npm run preview`: preview production build

## TDD Workflow

1. Add or update tests in `tests/engine.test.ts` first.
2. Run `npm test` and confirm failing tests.
3. Implement game logic in `src/game/engine.ts` and `src/game/tetrominoes.ts`.
4. Refactor and keep tests green.

## Controls

- Left Arrow: move left
- Right Arrow: move right
- Up Arrow or X: rotate clockwise
- Z: rotate counterclockwise
- Down Arrow: soft drop
- Space: hard drop
- Restart button: reset game

## Deployment to GitHub Pages

The workflow file `.github/workflows/deploy.yml` automatically:

1. Runs tests on every push to `main`
2. Builds the site
3. Deploys `dist` to GitHub Pages

After pushing to GitHub, enable **Pages** in repository settings with source set to **GitHub Actions**.
