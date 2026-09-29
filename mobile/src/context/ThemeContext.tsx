import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light';

// Widened app-theme type — avoids literal-tuple conflicts between DarkColors and LightColors
export type AppTheme = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  border: string;
  borderLight: string;
  divider: string;
  overlay: string;
  overlayLight: string;
  gradientPrimary: readonly string[];
  gradientSecondary: readonly string[];
  gradientDark: readonly string[];
  gradientCard: readonly string[];
  skeleton: string;
  skeletonHighlight: string;
  categoryColors: Record<string, string>;
  primaryTransparent: string;
  secondaryTransparent: string;
  accentTransparent: string;
  whiteTransparent10: string;
  whiteTransparent20: string;
  blackTransparent50: string;
};

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@evently_theme';

// ─── Context ──────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setThemeMode(stored);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const theme = themeMode === 'dark' ? DarkColors : LightColors;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, themeMode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
