import { describe, expect, it } from 'vitest';
import {
  calculateDough,
  ballWeightGrams,
  formatAmount,
  inchesToCm,
  STYLES,
  type DoughResult,
  type IngredientId,
  type Leavening,
  type PizzaStyle,
} from './index';

const g = (r: DoughResult, id: IngredientId) => r.ingredients.find((i) => i.id === id)?.grams;
const SIXTEEN = inchesToCm(16);

describe("NY style matches Jack's recipes (2 x 480 g)", () => {
  it('yeast, cold ferment', () => {
    const r = calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: SIXTEEN, count: 2 });
    expect(r.ballGrams).toBeCloseTo(480, 5);
    expect(g(r, 'flour')).toBeCloseTo(545, 0);
    expect(g(r, 'water')).toBeCloseTo(354, 0);
    expect(g(r, 'oil')).toBeCloseTo(38, 0);
    expect(g(r, 'sugar')).toBeCloseTo(13, 0);
    expect(g(r, 'salt')).toBeCloseTo(9.5, 0);
    // 3/4 to 7/8 of a 7 g packet.
    expect(g(r, 'yeast')).toBeGreaterThanOrEqual(7 * 0.75);
    expect(g(r, 'yeast')).toBeLessThanOrEqual(7 * 0.875);
    expect(g(r, 'starter')).toBeUndefined();
  });

  it('yeast, same day uses a full packet', () => {
    const r = calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: SIXTEEN, count: 2, coldFerment: false });
    expect(g(r, 'yeast')).toBeCloseTo(7, 1);
  });

  it('sourdough, corrected version totals 960 g', () => {
    const r = calculateDough({ style: 'ny', leavening: 'sourdough', diameterCm: SIXTEEN, count: 2 });
    expect(g(r, 'flour')).toBeCloseTo(501, 0);
    expect(g(r, 'starter')).toBeCloseTo(85, 0);
    expect(g(r, 'water')).toBeCloseTo(312, 0);
    expect(g(r, 'oil')).toBeCloseTo(39, 0);
    expect(g(r, 'sugar')).toBeCloseTo(13, 0);
    expect(g(r, 'salt')).toBeCloseTo(10, 0);
    expect(g(r, 'yeast')).toBeUndefined();
    const total = r.ingredients.reduce((s, i) => s + i.grams, 0);
    expect(total).toBeCloseTo(960, 6);
  });
});

describe('scaling', () => {
  const styles: PizzaStyle[] = ['ny', 'neapolitan', 'newHaven'];
  const leavenings: Leavening[] = ['yeast', 'sourdough'];

  it('ball weight scales with area', () => {
    expect(ballWeightGrams('ny', SIXTEEN / 2)).toBeCloseTo(120, 5);
  });

  it('doubling the count doubles every ingredient', () => {
    for (const style of styles) {
      for (const leavening of leavenings) {
        const one = calculateDough({ style, leavening, diameterCm: 30, count: 3 });
        const two = calculateDough({ style, leavening, diameterCm: 30, count: 6 });
        one.ingredients.forEach((ing, i) => expect(two.ingredients[i]!.grams).toBeCloseTo(ing.grams * 2, 6));
      }
    }
  });

  it('dough weight (excluding yeast) equals balls x count for every combination', () => {
    for (const style of styles) {
      for (const leavening of leavenings) {
        for (const coldFerment of [true, false]) {
          const r = calculateDough({ style, leavening, diameterCm: 33, count: 4, coldFerment, hydrationPct: 70 });
          const total = r.ingredients.filter((i) => i.id !== 'yeast').reduce((s, i) => s + i.grams, 0);
          expect(total).toBeCloseTo(r.ballGrams * 4, 6);
          r.ingredients.forEach((i) => expect(i.grams).toBeGreaterThan(0));
        }
      }
    }
  });
});

describe('advanced options', () => {
  it('hydration override counts the water in the starter', () => {
    const r = calculateDough({ style: 'ny', leavening: 'sourdough', diameterCm: 35, count: 2, hydrationPct: 70 });
    const starter = g(r, 'starter')!;
    const totalWater = g(r, 'water')! + starter / 2;
    const totalFlour = g(r, 'flour')! + starter / 2;
    expect((totalWater / totalFlour) * 100).toBeCloseTo(70, 6);
  });

  it('cold ferment uses less yeast than same-day; starter is the same either way', () => {
    const run = (leavening: Leavening, coldFerment: boolean) =>
      calculateDough({ style: 'ny', leavening, diameterCm: 40, count: 1, coldFerment });
    expect(g(run('yeast', false), 'yeast')!).toBeGreaterThan(g(run('yeast', true), 'yeast')!);
    expect(g(run('sourdough', false), 'starter')).toBe(g(run('sourdough', true), 'starter'));
  });

  it('defaults to cold ferment', () => {
    expect(calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: 40, count: 1 }).input.coldFerment).toBe(true);
  });

  it('clamps out-of-range input', () => {
    const r = calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: 500, count: 0, hydrationPct: 200 });
    expect(r.input).toMatchObject({ diameterCm: 46, count: 1, hydrationPct: 80 });
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe('style differences', () => {
  it('only NY uses oil and sugar', () => {
    for (const style of ['neapolitan', 'newHaven'] as const) {
      const r = calculateDough({ style, leavening: 'yeast', diameterCm: 30, count: 1 });
      expect(g(r, 'oil')).toBeUndefined();
      expect(g(r, 'sugar')).toBeUndefined();
    }
  });

  it('Neapolitan uses 00 flour', () => {
    const r = calculateDough({ style: 'neapolitan', leavening: 'yeast', diameterCm: 30, count: 1 });
    expect(r.ingredients[0]!.name).toMatch(/00/);
    expect(STYLES.neapolitan.bake.tempC).toBeGreaterThan(400);
  });
});

describe('directions', () => {
  it("sourdough cold ferment follows Jack's process", () => {
    const r = calculateDough({ style: 'ny', leavening: 'sourdough', diameterCm: SIXTEEN, count: 2 });
    const titles = r.steps.map((s) => s.title);
    expect(titles.indexOf('Autolyse')).toBeLessThan(titles.indexOf('Mix'));
    expect(r.steps.find((s) => s.title === 'Autolyse')!.duration).toBe('30–60 min');
    expect(r.steps.find((s) => s.title === 'Stretch and folds')!.detail).toMatch(/4–5 sets.*20–30 minutes/);
    expect(r.steps.find((s) => s.title === 'Cold ferment')!.duration).toBe('2–3 days');
    expect(r.steps.find((s) => s.title === 'Warm up')!.duration).toBe('3–4 h');
    expect(titles.at(-1)).toBe('Stretch, top and bake');
  });

  it('same-day doughs have no cold ferment step', () => {
    const r = calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: SIXTEEN, count: 2, coldFerment: false });
    expect(r.steps.some((s) => s.title === 'Cold ferment')).toBe(false);
    expect(r.steps.some((s) => s.title === 'Bulk rise')).toBe(true);
  });
});

describe('units', () => {
  const r = calculateDough({ style: 'ny', leavening: 'yeast', diameterCm: SIXTEEN, count: 2 });
  const ing = (id: IngredientId) => r.ingredients.find((i) => i.id === id)!;

  it('metric shows grams', () => {
    expect(formatAmount(ing('flour'), 'metric')).toBe('545 g');
    expect(formatAmount(ing('salt'), 'metric')).toBe('9.5 g');
  });

  it('imperial shows ounces, with spoon hints for small ingredients', () => {
    expect(formatAmount(ing('flour'), 'imperial')).toBe('19.2 oz');
    expect(formatAmount(ing('oil'), 'imperial')).toMatch(/oz \(2\.8 tbsp\)$/);
    expect(formatAmount(ing('yeast'), 'imperial')).toMatch(/oz \(1¾ tsp\)$/);
  });
});
