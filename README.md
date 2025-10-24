# React Native Chess

A cross-platform React Native chess experience built with Expo and [chess.js](https://github.com/jhlywa/chess.js). Play against AI opponents of varying difficulty, switch between classic top-down and 3D-inspired board views, and manage games through an in-app menu.

## Features

- 📋 **Menu system** – enter your name, choose your side (white or black), set AI difficulty (easy, medium, hard), and quit.
- ♟️ **Interactive chess board** – tap to select pieces and target squares, with move highlighting and automatic promotion to queen when no choice is provided.
- 🤖 **AI opponents** – three tiers powered by a minimax search with positional heuristics:
  - *Easy*: random legal moves.
  - *Medium*: depth-2 alpha-beta search.
  - *Hard*: depth-3 alpha-beta search with move ordering and evaluation tweaks.
- 🧭 **Perspective toggle** – swap between a flat top-down board and an isometric-inspired 3D presentation.
- 📜 **Move history & status** – track SAN-formatted moves and receive updates for checkmate, draws, and current turn indicators.
- 🌐 **Cross platform** – runs on iOS, Android, and web via Expo.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npm run start
   ```

3. Use the Expo CLI output to open the app on a simulator, device, or in the browser.

## Project structure

```
.
├── App.tsx                # Entry point with menu/game navigation
├── assets/                # Documentation for supplying custom icons/splashes
├── src/
│   ├── ai/engine.ts       # Minimax AI with positional evaluation
│   ├── components/
│   │   ├── Board.tsx      # Chess board renderer with 2D/3D toggle
│   │   └── Menu.tsx       # Menu UI for player setup
│   ├── screens/
│   │   └── GameScreen.tsx # Game logic, AI orchestration, move history
│   └── types/index.ts     # Shared type definitions
└── package.json
```

## Notes

- Binary image assets are intentionally omitted so this project can be shared without large files. Add your own icons and splash artwork in `assets/` and reference them from `app.json` when you're ready to brand the experience.
- The AI evaluation balances speed and challenge; tune search depth or heuristics in `src/ai/engine.ts` if you need stronger or faster opponents.

## License

This project is provided as-is for demonstration purposes. Adapt and extend it to suit your needs.
