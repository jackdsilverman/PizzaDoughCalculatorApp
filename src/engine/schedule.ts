import { STYLES } from './styles';
import type { DoughInput, Step } from './types';

/** Fermentation and bake directions for the chosen dough. */
export function buildSteps(input: Required<DoughInput>): Step[] {
  const style = STYLES[input.style];
  const cold = input.coldFerment;
  const duration = style.formulas[input.leavening].coldFermentDuration;
  const steps: Step[] =
    input.leavening === 'sourdough' ? sourdoughSteps(input, cold, duration) : yeastSteps(input, cold, duration);

  const tempF = Math.round((style.bake.tempC * 9) / 5 + 32);
  steps.push(
    {
      title: 'Preheat',
      detail: `Heat the oven to ${style.bake.tempC} °C / ${tempF} °F with a ${style.bake.surface}.`,
    },
    {
      title: 'Stretch, top and bake',
      detail: `Stretch each ball by hand to size, top it and bake until done.`,
      duration: style.bake.minutes,
    },
  );
  return steps;
}

function sourdoughSteps(input: Required<DoughInput>, cold: boolean, coldDuration: string): Step[] {
  const steps: Step[] = [
    {
      title: 'Feed your starter',
      detail: 'Feed it so it peaks (just doubled) when you mix. Usually 4–8 hours at room temperature.',
      duration: '4–8 h',
    },
    {
      title: 'Autolyse',
      detail: 'In the stand mixer bowl, mix the flour and water with the dough hook on low until no dry flour remains, 1–2 minutes. Cover and rest.',
      duration: '30–60 min',
    },
    {
      title: 'Mix',
      detail: `Add the starter, salt${input.style === 'ny' ? ', sugar and oil' : ''}. Mix with the dough hook on low until fully combined, then on medium-low until the dough pulls away from the bowl.`,
      duration: '5–8 min',
    },
    {
      title: 'Stretch and folds',
      detail: 'Do 4–5 sets of stretch-and-folds, 20–30 minutes apart, until the dough is smooth and strong.',
      duration: '1.5–2.5 h',
    },
  ];

  if (cold) {
    steps.push(
      {
        title: 'Divide and ball',
        detail: `Divide into ${input.count} equal pieces, shape tight balls and put them in lightly oiled, covered containers.`,
      },
      {
        title: 'Cold ferment',
        detail: `Refrigerate at 3–4 °C / 37–40 °F.`,
        duration: coldDuration,
      },
      {
        title: 'Warm up',
        detail: 'Take the balls out of the fridge and let them rest, covered, at room temperature before stretching.',
        duration: '3–4 h',
      },
    );
  } else {
    steps.push(
      {
        title: 'Bulk ferment',
        detail: 'Leave covered at room temperature until the dough has grown about 50% and looks airy.',
        duration: '4–6 h',
      },
      {
        title: 'Divide, ball and proof',
        detail: `Divide into ${input.count} equal pieces, shape tight balls and proof, covered, until puffy.`,
        duration: '2–3 h',
      },
    );
  }
  return steps;
}

function yeastSteps(input: Required<DoughInput>, cold: boolean, coldDuration: string): Step[] {
  const neapolitan = input.style === 'neapolitan';
  const steps: Step[] = [
    {
      title: 'Mix',
      detail: neapolitan
        ? 'In the stand mixer bowl, dissolve the salt in the water and add the yeast. With the dough hook on low, add the flour gradually until a shaggy dough forms.'
        : `In the stand mixer bowl, stir the yeast${input.style === 'ny' ? ' and sugar' : ''} into the water. Add the flour${input.style === 'ny' ? ', oil' : ''} and salt and mix with the dough hook on low until no dry flour remains.`,
      duration: '1–2 min',
    },
    {
      title: 'Knead',
      detail: 'Knead with the dough hook on medium-low until smooth and elastic and the dough clears the sides of the bowl.',
      duration: '6–8 min',
    },
  ];

  if (cold) {
    steps.push(
      { title: 'Rest', detail: 'Cover and rest at room temperature.', duration: '30 min' },
      {
        title: 'Divide and ball',
        detail: `Divide into ${input.count} equal pieces, shape tight balls and put them in lightly oiled, covered containers.`,
      },
      { title: 'Cold ferment', detail: 'Refrigerate at 3–4 °C / 37–40 °F.', duration: coldDuration },
      {
        title: 'Warm up',
        detail: 'Take the balls out of the fridge and let them rest, covered, at room temperature before stretching.',
        duration: '2–3 h',
      },
    );
  } else {
    steps.push(
      {
        title: 'Bulk rise',
        detail: 'Cover and let rise in a warm spot until doubled.',
        duration: neapolitan ? '6–8 h' : '1.5–2 h',
      },
      {
        title: 'Divide, ball and proof',
        detail: `Divide into ${input.count} equal pieces, shape tight balls and proof, covered, until puffy.`,
        duration: neapolitan ? '2–4 h' : '45–60 min',
      },
    );
  }
  return steps;
}
