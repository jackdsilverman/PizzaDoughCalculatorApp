import { useColorScheme } from 'react-native';

const light = {
  bg: '#FBF7F2',
  card: '#FFFFFF',
  text: '#2A211B',
  muted: '#7A6A5E',
  border: '#E8DED3',
  accent: '#C2410C',
  accentText: '#FFFFFF',
  chip: '#F3EBE2',
  warnBg: '#FFF4E0',
  warnText: '#8A5300',
};

const dark: typeof light = {
  bg: '#16120F',
  card: '#221C17',
  text: '#F4ECE4',
  muted: '#A8998C',
  border: '#3A3029',
  accent: '#F97316',
  accentText: '#1A120C',
  chip: '#2E261F',
  warnBg: '#3A2A10',
  warnText: '#F6C66B',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
