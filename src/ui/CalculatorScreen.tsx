import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  calculateDough,
  cmToInches,
  DIAMETER_SLIDER_INCHES,
  formatAmount,
  formatDiameter,
  GRAMS_PER_OUNCE,
  inchesToCm,
  LIMITS,
  STYLES,
  type Leavening,
  type PizzaStyle,
  type UnitSystem,
} from '../engine';
import { Card, LabeledSlider, Segmented, ToggleRow } from './components';
import { useTheme } from './theme';

const STYLE_OPTIONS: { value: PizzaStyle; label: string }[] = [
  { value: 'ny', label: 'NY' },
  { value: 'neapolitan', label: 'Neapolitan' },
  { value: 'newHaven', label: 'New Haven' },
];
const LEAVENING_OPTIONS: { value: Leavening; label: string }[] = [
  { value: 'yeast', label: 'Yeast' },
  { value: 'sourdough', label: 'Sourdough' },
];
const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
];

export function CalculatorScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const [style, setStyle] = useState<PizzaStyle>('ny');
  const [leavening, setLeavening] = useState<Leavening>('yeast');
  const [units, setUnits] = useState<UnitSystem>('metric');
  const [diameterCm, setDiameterCm] = useState(STYLES.ny.defaultDiameterCm);
  const [count, setCount] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // null = use the style's default.
  const [hydration, setHydration] = useState<number | null>(null);
  const [coldFerment, setColdFerment] = useState(true);

  const result = useMemo(
    () =>
      calculateDough({
        style,
        leavening,
        diameterCm,
        count,
        hydrationPct: hydration ?? undefined,
        coldFerment,
      }),
    [style, leavening, diameterCm, count, hydration, coldFerment],
  );

  const chooseStyle = (s: PizzaStyle) => {
    setStyle(s);
    setDiameterCm(STYLES[s].defaultDiameterCm);
    setHydration(null);
  };
  const chooseLeavening = (l: Leavening) => {
    setLeavening(l);
    setHydration(null);
  };

  const slider = DIAMETER_SLIDER_INCHES;
  const sliderValue = Math.round(cmToInches(diameterCm));
  const onDiameter = (v: number) => setDiameterCm(inchesToCm(v));

  const weight = (g: number) =>
    units === 'metric' ? `${Math.round(g)} g` : `${(g / GRAMS_PER_OUNCE).toFixed(1)} oz`;
  const { input } = result;

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={s.header}>
        <Text style={[s.title, { color: t.text }]}>Pizza Dough</Text>
        <View style={{ width: 176 }}>
          <Segmented label="Units" options={UNIT_OPTIONS} value={units} onChange={setUnits} />
        </View>
      </View>

      <Card title="Dough">
        <Segmented label="Pizza style" options={STYLE_OPTIONS} value={style} onChange={chooseStyle} />
        <Segmented label="Leavening" options={LEAVENING_OPTIONS} value={leavening} onChange={chooseLeavening} />
        <LabeledSlider
          label="Diameter"
          valueLabel={formatDiameter(diameterCm)}
          value={sliderValue}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          onChange={onDiameter}
        />
        <LabeledSlider
          label="Pizzas"
          valueLabel={String(count)}
          value={count}
          min={1}
          max={12}
          step={1}
          onChange={setCount}
        />
        <ToggleRow
          label="Cold ferment"
          detail={
            coldFerment
              ? `In the fridge for ${STYLES[style].formulas[leavening].coldFermentDuration}`
              : 'Same-day dough'
          }
          value={coldFerment}
          onChange={setColdFerment}
        />
        <Pressable accessibilityRole="button" onPress={() => setShowAdvanced((v) => !v)}>
          <Text style={[s.link, { color: t.accent }]}>{showAdvanced ? 'Hide advanced' : 'Advanced: hydration'}</Text>
        </Pressable>
        {showAdvanced && (
          <>
            <LabeledSlider
              label="Hydration"
              valueLabel={`${Math.round(input.hydrationPct)}%`}
              value={Math.round(input.hydrationPct)}
              min={LIMITS.hydrationPct.min}
              max={LIMITS.hydrationPct.max}
              step={1}
              onChange={setHydration}
            />
            {hydration !== null && (
              <Pressable accessibilityRole="button" onPress={() => setHydration(null)}>
                <Text style={[s.link, { color: t.muted }]}>Reset to {STYLES[style].name} defaults</Text>
              </Pressable>
            )}
          </>
        )}
      </Card>

      <Card
        title="Ingredients"
        right={
          <Text style={[s.meta, { color: t.muted }]}>
            {count} × {weight(result.ballGrams)}
          </Text>
        }
      >
        {result.ingredients.map((ing) => (
          <View key={ing.id} style={[s.row, { borderBottomColor: t.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.ingName, { color: t.text }]}>{ing.name}</Text>
              {ing.note && <Text style={[s.note, { color: t.muted }]}>{ing.note}</Text>}
            </View>
            <View style={s.amountCol}>
              <Text style={[s.amount, { color: t.text }]}>{formatAmount(ing, units)}</Text>
              <Text style={[s.note, { color: t.muted }]}>{ing.bakersPct.toFixed(1)}%</Text>
            </View>
          </View>
        ))}
        <Text style={[s.meta, { color: t.muted }]}>Total dough {weight(result.totalDoughGrams)}</Text>
        {result.warnings.map((w) => (
          <View key={w} style={[s.warning, { backgroundColor: t.warnBg }]}>
            <Text style={{ color: t.warnText }}>{w}</Text>
          </View>
        ))}
      </Card>

      <Card title="Directions">
        {result.steps.map((step, i) => (
          <View key={step.title} style={s.step}>
            <View style={[s.stepNum, { backgroundColor: t.chip }]}>
              <Text style={[s.stepNumText, { color: t.accent }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={s.stepHeader}>
                <Text style={[s.ingName, { color: t.text, flex: 1 }]}>{step.title}</Text>
                {step.duration && <Text style={[s.meta, { color: t.accent }]}>{step.duration}</Text>}
              </View>
              <Text style={[s.stepDetail, { color: t.muted }]}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', flexShrink: 1 },
  link: { fontSize: 15, fontWeight: '600', paddingVertical: 4 },
  meta: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  ingName: { fontSize: 16, fontWeight: '600' },
  note: { fontSize: 13 },
  amountCol: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  warning: { borderRadius: 10, padding: 10 },
  step: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontWeight: '800' },
  stepHeader: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  stepDetail: { fontSize: 14, lineHeight: 20 },
});
