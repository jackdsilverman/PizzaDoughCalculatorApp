export type PizzaStyle = 'ny' | 'neapolitan' | 'newHaven';
export type Leavening = 'yeast' | 'sourdough';
export type UnitSystem = 'metric' | 'imperial';

/** What the user picks in the app. */
export interface DoughInput {
  style: PizzaStyle;
  leavening: Leavening;
  /** Pizza diameter in centimetres. The UI converts from inches when the unit toggle is imperial. */
  diameterCm: number;
  /** Number of pizzas (one dough ball each). */
  count: number;
  /** Advanced: total hydration as a percentage of total flour. Defaults to the style's value. */
  hydrationPct?: number;
  /** Cold-ferment the dough balls in the fridge (true, the default) or make it same-day (false). */
  coldFerment?: boolean;
}

export type IngredientId = 'flour' | 'water' | 'starter' | 'yeast' | 'salt' | 'sugar' | 'oil';

export interface Ingredient {
  id: IngredientId;
  /** Display name, e.g. "Bread flour" or "Tipo 00 flour". */
  name: string;
  grams: number;
  /** Baker's percentage relative to total flour (including flour inside the starter). */
  bakersPct: number;
  note?: string;
}

/** Baker's-percentage formula for one style + leavening combination. All percentages are of total flour. */
export interface Formula {
  flourName: string;
  hydrationPct: number;
  saltPct: number;
  sugarPct: number;
  oilPct: number;
  /** Starter weight as % of total flour, at `starterHydrationPct` hydration (sourdough only). */
  starterPct?: number;
  starterHydrationPct?: number;
  /** Instant/active dry yeast as % of total flour (yeast only). Depends on fermentation length. */
  yeastPct?: { sameDay: number; cold: number };
  /** Water temperature to aim for, °C. */
  waterTempC: number;
  /** How long to cold-ferment, shown in the directions, e.g. "2–3 days". */
  coldFermentDuration: string;
}

export interface StyleProfile {
  id: PizzaStyle;
  name: string;
  /** Reference dough-ball weight at the reference diameter. Ball weight scales with pizza area. */
  referenceBallGrams: number;
  referenceDiameterCm: number;
  defaultDiameterCm: number;
  bake: { tempC: number; minutes: string; surface: string };
  formulas: Record<Leavening, Formula>;
}

export interface Step {
  title: string;
  detail: string;
  /** Human-readable duration, e.g. "30–60 min" or "2 days". */
  duration?: string;
}

export interface DoughResult {
  input: Required<DoughInput>;
  ballGrams: number;
  totalDoughGrams: number;
  totalFlourGrams: number;
  ingredients: Ingredient[];
  steps: Step[];
  warnings: string[];
}
