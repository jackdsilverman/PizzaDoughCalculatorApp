import type { PizzaStyle, StyleProfile } from './types';

/** 16 inches in cm. Jack's NY recipe makes 480 g balls, which is a standard 16" NY pie. */
const SIXTEEN_INCHES_CM = 40.64;
const TWELVE_INCHES_CM = 30.48;

/**
 * Baker's percentages.
 *
 * NY style comes straight from Jack's tested recipes (2 x 480 g balls):
 *   Yeast:     545 g bread flour, 354 g water, 38 g olive oil, 13 g sugar, 9.5 g kosher salt,
 *              1 packet yeast same-day or 3/4-7/8 packet for a cold ferment.
 *   Sourdough: 501 g bread flour, 85 g starter (100%), 312 g water, 39 g oil, 13 g sugar, 10 g salt.
 *              Total flour = 501 + 42.5 = 543.5 g, total water = 312 + 42.5 = 354.5 g.
 *
 * Neapolitan and New Haven are starting defaults for Jack to review.
 */
export const STYLES: Record<PizzaStyle, StyleProfile> = {
  ny: {
    id: 'ny',
    name: 'New York',
    referenceBallGrams: 480,
    referenceDiameterCm: SIXTEEN_INCHES_CM,
    defaultDiameterCm: SIXTEEN_INCHES_CM,
    bake: { tempC: 290, minutes: '6–8 min', surface: 'baking steel or stone, preheated 45–60 min' },
    formulas: {
      yeast: {
        flourName: 'Bread flour',
        hydrationPct: (354 / 545) * 100,
        oilPct: (38 / 545) * 100,
        sugarPct: (13 / 545) * 100,
        saltPct: (9.5 / 545) * 100,
        // 1 packet (7 g) same-day; 13/16 packet (~5.7 g) for a cold ferment.
        yeastPct: { sameDay: (7 / 545) * 100, cold: ((7 * 13) / 16 / 545) * 100 },
        waterTempC: 39,
        coldFermentDuration: '1–3 days',
      },
      sourdough: {
        flourName: 'Bread flour',
        hydrationPct: (354.5 / 543.5) * 100,
        oilPct: (39 / 543.5) * 100,
        sugarPct: (13 / 543.5) * 100,
        saltPct: (10 / 543.5) * 100,
        starterPct: (85 / 543.5) * 100,
        starterHydrationPct: 100,
        waterTempC: 26,
        coldFermentDuration: '2–3 days',
      },
    },
  },
  neapolitan: {
    id: 'neapolitan',
    name: 'Neapolitan',
    referenceBallGrams: 260,
    referenceDiameterCm: TWELVE_INCHES_CM,
    defaultDiameterCm: TWELVE_INCHES_CM,
    bake: { tempC: 450, minutes: '60–90 sec', surface: 'pizza oven floor at 430–485 °C' },
    formulas: {
      yeast: {
        flourName: 'Tipo 00 flour',
        hydrationPct: 62,
        oilPct: 0,
        sugarPct: 0,
        saltPct: 2.8,
        yeastPct: { sameDay: 0.15, cold: 0.1 },
        waterTempC: 20,
        coldFermentDuration: '1–3 days',
      },
      sourdough: {
        flourName: 'Tipo 00 flour',
        hydrationPct: 62,
        oilPct: 0,
        sugarPct: 0,
        saltPct: 2.8,
        starterPct: 10,
        starterHydrationPct: 100,
        waterTempC: 20,
        coldFermentDuration: '2–3 days',
      },
    },
  },
  newHaven: {
    id: 'newHaven',
    name: 'New Haven',
    referenceBallGrams: 430,
    referenceDiameterCm: SIXTEEN_INCHES_CM,
    defaultDiameterCm: SIXTEEN_INCHES_CM,
    bake: {
      tempC: 290,
      minutes: '8–10 min',
      surface: 'baking steel on the top rack, preheated 60 min, until the rim is charred',
    },
    formulas: {
      yeast: {
        flourName: 'Bread or high-gluten flour',
        hydrationPct: 66,
        oilPct: 0,
        sugarPct: 0,
        saltPct: 2,
        yeastPct: { sameDay: 0.8, cold: 0.5 },
        waterTempC: 30,
        coldFermentDuration: '1–3 days',
      },
      sourdough: {
        flourName: 'Bread or high-gluten flour',
        hydrationPct: 66,
        oilPct: 0,
        sugarPct: 0,
        saltPct: 2,
        starterPct: 15,
        starterHydrationPct: 100,
        waterTempC: 26,
        coldFermentDuration: '2–3 days',
      },
    },
  },
};

