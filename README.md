# PizzaDoughCalculatorApp

A pizza dough calculator for iOS and Android. Pick a style (New York, Neapolitan, New Haven), yeast or sourdough, pizza size and count, and get an ingredient list plus fermentation directions. Metric by default, with an imperial toggle.

## Status

- [x] Recipe engine (`src/engine`): pure TypeScript, no UI dependencies
- [x] App (Expo / React Native): single calculator screen
- [ ] Polish and device testing
- [ ] Store release

## Recipe engine

```ts
import { calculateDough, formatAmount } from './src/engine';

const r = calculateDough({ style: 'ny', leavening: 'sourdough', diameterCm: 40.64, count: 2, coldFerment: true });
r.ingredients.map((i) => `${i.name}: ${formatAmount(i, 'metric')}`);
// Bread flour: 501 g, Water: 312 g, Active starter: 85 g, Olive oil: 39 g, Sugar: 13 g, Kosher salt: 10 g
```

How it works:

- Each style + leavening pair is a set of **baker's percentages** (`src/engine/styles.ts`). Hydration counts the flour and water inside the starter.
- **Ball weight scales with pizza area** from a reference ball (NY: 480 g at 16").
- **Cold ferment** is an on/off toggle (on by default). Yeast has one amount for same-day dough and one for cold-fermented dough; starter is the same either way.
- **Advanced option**: hydration (55–80%).
- **Diameter** is always set in inches (8–18"), even in metric mode.
- **Units**: grams are the source of truth. Imperial shows ounces, with spoon hints for yeast, sugar and oil.

NY numbers come from tested recipes. Neapolitan and New Haven are starting defaults.

```sh
npm install
npm start          # Expo dev server; scan the QR code with Expo Go
npm run web        # run in a browser
npm test           # engine tests
npm run typecheck
```

The UI lives in `src/ui/` (`CalculatorScreen.tsx`) and imports the engine from `src/engine/`.
