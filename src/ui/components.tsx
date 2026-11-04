import Slider from '@react-native-community/slider';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from './theme';

export function Card({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: t.text }]}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.segmented, { backgroundColor: t.chip }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && { backgroundColor: t.accent }]}
          >
            <Text style={[styles.segmentText, { color: selected ? t.accentText : t.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function LabeledSlider({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderLabels}>
        <Text style={[styles.label, { color: t.muted }]}>{label}</Text>
        <Text style={[styles.value, { color: t.text }]}>{valueLabel}</Text>
      </View>
      <Slider
        accessibilityLabel={label}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={t.accent}
        maximumTrackTintColor={t.border}
        thumbTintColor={t.accent}
      />
    </View>
  );
}

export function ToggleRow({
  label,
  detail,
  value,
  onChange,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: t.muted }]}>{label}</Text>
        {detail && <Text style={[styles.value, { color: t.text }]}>{detail}</Text>}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: t.accent, false: t.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentText: { fontSize: 15, fontWeight: '600' },
  sliderRow: { gap: 4 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 15 },
  value: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
