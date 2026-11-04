import type { Ingredient, UnitSystem } from './types';

export const CM_PER_INCH = 2.54;
export const GRAMS_PER_OUNCE = 28.349523125;

export const cmToInches = (cm: number) => cm / CM_PER_INCH;
export const inchesToCm = (inches: number) => inches * CM_PER_INCH;
export const cToF = (c: number) => (c * 9) / 5 + 32;

/** Slider ranges per unit system. Metric is the default. */
export const DIAMETER_SLIDER = {
  metric: { min: 20, max: 46, step: 1, unit: 'cm' },
  imperial: { min: 8, max: 18, step: 1, unit: 'in' },
} as const;

/** Approximate grams per teaspoon, used for volume hints on small ingredients in imperial. */
const GRAMS_PER_TSP: Partial<Record<Ingredient['id'], number>> = {
  yeast: 3.1,
  sugar: 4.2,
  oil: 4.5,
};

export function formatDiameter(cm: number, units: UnitSystem): string {
  return units === 'metric' ? `${Math.round(cm)} cm` : `${Math.round(cmToInches(cm))}"`;
}

/** Formats an ingredient amount for display. Grams stay the source of truth. */
export function formatAmount(ing: Ingredient, units: UnitSystem): string {
  if (units === 'metric') {
    return ing.grams < 20 ? `${round(ing.grams, 1)} g` : `${Math.round(ing.grams)} g`;
  }
  const oz = ing.grams / GRAMS_PER_OUNCE;
  const weight = oz < 1 ? `${round(oz, 2)} oz` : `${round(oz, 1)} oz`;
  const perTsp = GRAMS_PER_TSP[ing.id];
  return perTsp ? `${weight} (${formatSpoons(ing.grams / perTsp)})` : weight;
}

function formatSpoons(tsp: number): string {
  if (tsp >= 3) return `${round(tsp / 3, 1)} tbsp`;
  // Round to the nearest 1/4 tsp.
  const quarters = Math.max(1, Math.round(tsp * 4));
  const whole = Math.floor(quarters / 4);
  const frac = ['', '¼', '½', '¾'][quarters % 4];
  return `${whole > 0 ? whole : ''}${frac} tsp`;
}

const round = (n: number, dp: number) => {
  const f = 10 ** dp;
  return String(Math.round(n * f) / f);
};
