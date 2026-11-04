# PizzaDoughCalculatorApp

A pizza dough calculator for iOS and Android. Pick a style (New York, Neapolitan, New Haven), yeast or sourdough, pizza size and count, and get an ingredient list plus fermentation directions. Metric by default, with an imperial toggle.

## Status

- [x] Recipe engine (`src/engine`): pure TypeScript, no UI dependencies
- [ ] App (Expo / React Native)
- [ ] Polish and device testing
- [ ] Store release

## Recipe engine

```ts
import { calculateDough, formatAmount } from './src/engine';

const r = calculateDough({ style: 'ny', leavening: 'sourdough', diameterCm: 40.64, count: 2, fermentDays: 2 });
r.ingredients.map((i) => `${i.name}: ${formatAmount(i, 'metric')}`);
// Bread flour: 501 g, Water: 312 g, Active starter: 85 g, Olive oil: 39 g, Sugar: 13 g, Kosher salt: 10 g
```

How it works:

- Each style + leavening pair is a set of **baker's percentages** (`src/engine/styles.ts`). Hydration counts the flour and water inside the starter.
- **Ball weight scales with pizza area** from a reference ball (NY: 480 g at 16").
- **Advanced options**: hydration (55–80%) and cold-ferment days (0 = same day, up to 5). Yeast has one amount for same-day dough and one for any cold ferment. Longer ferments use less starter.
- **Units**: grams are the source of truth. Imperial shows ounces, with spoon hints for yeast, sugar and oil.

NY numbers come from tested recipes. Neapolitan and New Haven are starting defaults.

```sh
npm install
npm test
npm run typecheck
```
