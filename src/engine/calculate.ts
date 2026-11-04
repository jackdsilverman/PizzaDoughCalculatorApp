import { STYLES, starterPctFor } from './styles';
import { buildSteps } from './schedule';
import type { DoughInput, DoughResult, Ingredient } from './types';

export const LIMITS = {
  diameterCm: { min: 20, max: 46 },
  count: { min: 1, max: 20 },
  hydrationPct: { min: 55, max: 80 },
  fermentDays: { min: 0, max: 5 },
} as const;

/** Grams of yeast in one standard packet. */
export const YEAST_PACKET_GRAMS = 7;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Dough-ball weight for a pizza of the given diameter. Weight scales with area. */
export function ballWeightGrams(style: DoughInput['style'], diameterCm: number): number {
  const s = STYLES[style];
  return s.referenceBallGrams * (diameterCm / s.referenceDiameterCm) ** 2;
}

export function calculateDough(raw: DoughInput): DoughResult {
  const style = STYLES[raw.style];
  const formula = style.formulas[raw.leavening];
  const warnings: string[] = [];

  const input: Required<DoughInput> = {
    style: raw.style,
    leavening: raw.leavening,
    diameterCm: clamp(raw.diameterCm, LIMITS.diameterCm.min, LIMITS.diameterCm.max),
    count: Math.round(clamp(raw.count, LIMITS.count.min, LIMITS.count.max)),
    hydrationPct: clamp(
      raw.hydrationPct ?? formula.hydrationPct,
      LIMITS.hydrationPct.min,
      LIMITS.hydrationPct.max,
    ),
    fermentDays: Math.round(
      clamp(raw.fermentDays ?? formula.defaultFermentDays, LIMITS.fermentDays.min, LIMITS.fermentDays.max),
    ),
  };

  const ballGrams = ballWeightGrams(input.style, input.diameterCm);
  const totalDoughGrams = ballGrams * input.count;

  const yeastPct =
    input.leavening === 'yeast' && formula.yeastPct ? formula.yeastPct(input.fermentDays) : 0;
  const starterPct =
    input.leavening === 'sourdough' && formula.starterPct
      ? starterPctFor(formula.starterPct, input.fermentDays)
      : 0;

  // Total dough = flour x (100% + water% + salt% + sugar% + oil%) / 100.
  // The starter's flour and water are already inside flour and water. Yeast is left out of the
  // total, as in most recipes: at ~1% or less it is lost in the dough that sticks to the bowl.
  const sumPct = 100 + input.hydrationPct + formula.saltPct + formula.sugarPct + formula.oilPct;
  const totalFlourGrams = (totalDoughGrams * 100) / sumPct;
  const totalWaterGrams = (totalFlourGrams * input.hydrationPct) / 100;

  const starterGrams = (totalFlourGrams * starterPct) / 100;
  const starterHydration = (formula.starterHydrationPct ?? 100) / 100;
  const starterFlour = starterGrams / (1 + starterHydration);
  const starterWater = starterGrams - starterFlour;

  const pct = (g: number) => (g / totalFlourGrams) * 100;
  const waterTempF = Math.round((formula.waterTempC * 9) / 5 + 32);

  const ingredients: Ingredient[] = [
    {
      id: 'flour',
      name: formula.flourName,
      grams: totalFlourGrams - starterFlour,
      bakersPct: pct(totalFlourGrams - starterFlour),
    },
    {
      id: 'water',
      name: 'Water',
      grams: totalWaterGrams - starterWater,
      bakersPct: pct(totalWaterGrams - starterWater),
      note: `about ${formula.waterTempC} °C / ${waterTempF} °F`,
    },
  ];

  if (starterGrams > 0) {
    ingredients.push({
      id: 'starter',
      name: `Active starter (${formula.starterHydrationPct ?? 100}% hydration)`,
      grams: starterGrams,
      bakersPct: starterPct,
      note: 'at its peak, just doubled',
    });
  }
  if (formula.oilPct > 0) {
    ingredients.push({ id: 'oil', name: 'Olive oil', grams: (totalFlourGrams * formula.oilPct) / 100, bakersPct: formula.oilPct });
  }
  if (formula.sugarPct > 0) {
    ingredients.push({ id: 'sugar', name: 'Sugar', grams: (totalFlourGrams * formula.sugarPct) / 100, bakersPct: formula.sugarPct });
  }
  ingredients.push({
    id: 'salt',
    name: input.style === 'ny' ? 'Kosher salt' : 'Fine sea salt',
    grams: (totalFlourGrams * formula.saltPct) / 100,
    bakersPct: formula.saltPct,
  });
  if (yeastPct > 0) {
    const grams = (totalFlourGrams * yeastPct) / 100;
    ingredients.push({
      id: 'yeast',
      name: 'Instant or active dry yeast',
      grams,
      bakersPct: yeastPct,
      note: `${(grams / YEAST_PACKET_GRAMS).toFixed(2)} packet (1 packet = ${YEAST_PACKET_GRAMS} g)`,
    });
  }

  if (input.hydrationPct >= 72) {
    warnings.push('Above 72% hydration the dough will be sticky. Use wet hands and a bench scraper.');
  }
  if (input.leavening === 'sourdough' && input.fermentDays === 0) {
    warnings.push('Same-day sourdough depends heavily on starter strength and room temperature. Watch the dough, not the clock.');
  }
  if (input.style === 'neapolitan' && input.leavening === 'yeast' && input.fermentDays === 0) {
    warnings.push('Same-day Neapolitan uses very little yeast and needs a long room-temperature rise (8–10 h).');
  }

  return {
    input,
    ballGrams,
    totalDoughGrams,
    totalFlourGrams,
    ingredients,
    steps: buildSteps(input),
    warnings,
  };
}
