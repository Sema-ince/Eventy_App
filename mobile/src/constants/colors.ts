// ─── Evently Design System — Colors ─────────────────────────────

// ─── Dark Theme Colors ────────────────────────────────────────────
export const DarkColors = {
  // Brand Colors
  primary: '#6C3CE1',
  primaryLight: '#8B5CF6',
  primaryDark: '#5025C4',
  secondary: '#FF6B35',
  accent: '#00F5A0',

  // Background
  background: '#000000',     // Pure Black (user spec)
  surface: '#111118',        // Card Surface
  surface2: '#1A1A28',       // Elevated Card
  surface3: '#222235',       // Highest elevation

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textTertiary: '#6B6B8A',
  textInverse: '#000000',

  // Status
  error: '#FF4757',
  errorLight: '#FF6B78',
  success: '#2ED573',
  successLight: '#52E07C',
  warning: '#FFA502',
  warningLight: '#FFB733',
  info: '#1E90FF',

  // UI
  border: '#2A2A40',
  borderLight: '#3A3A58',
  divider: '#1A1A30',
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Gradient Stops
  gradientPrimary: ['#6C3CE1', '#9B59F5'] as const,
  gradientSecondary: ['#FF6B35', '#FF8C42'] as const,
  gradientDark: ['#000000', '#111118'] as const,
  gradientCard: ['rgba(108, 60, 225, 0.15)', 'transparent'] as const,

  // Skeleton
  skeleton: '#1A1A30',
  skeletonHighlight: '#2A2A45',

  // Category Colors
  categoryColors: {
    'Müzik': '#FF6B35',
    'Teknoloji': '#6C3CE1',
    'Sanat': '#00F5A0',
    'Spor': '#FF4757',
    'Yemek': '#FFA502',
    'Eğitim': '#2ED573',
    'Film': '#1E90FF',
    'Komedi': '#FF6EB4',
  } as Record<string, string>,

  // Transparent variants
  primaryTransparent: 'rgba(108, 60, 225, 0.15)',
  secondaryTransparent: 'rgba(255, 107, 53, 0.15)',
  accentTransparent: 'rgba(0, 245, 160, 0.15)',
  whiteTransparent10: 'rgba(255, 255, 255, 0.10)',
  whiteTransparent20: 'rgba(255, 255, 255, 0.20)',
  blackTransparent50: 'rgba(0, 0, 0, 0.50)',
};

// ─── Light Theme Colors ───────────────────────────────────────────
export const LightColors = {
  // Brand Colors
  primary: '#6C3CE1',
  primaryLight: '#8B5CF6',
  primaryDark: '#5025C4',
  secondary: '#FF6B35',
  accent: '#00C97A',

  // Background
  background: '#F5F5F5',     // Off-white (user spec)
  surface: '#FFFFFF',        // Card Surface
  surface2: '#F0F0F8',       // Elevated Card
  surface3: '#E8E8F0',       // Highest elevation

  // Text
  text: '#0D0D1A',
  textSecondary: '#4A4A6A',
  textTertiary: '#8A8AAA',
  textInverse: '#FFFFFF',

  // Status
  error: '#D93025',
  errorLight: '#FF4C4C',
  success: '#1A8F4A',
  successLight: '#22A85A',
  warning: '#E07800',
  warningLight: '#FF9500',
  info: '#0070E0',

  // UI
  border: '#DDDDE8',
  borderLight: '#E8E8F0',
  divider: '#EBEBF5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',

  // Gradient Stops
  gradientPrimary: ['#6C3CE1', '#9B59F5'] as const,
  gradientSecondary: ['#FF6B35', '#FF8C42'] as const,
  gradientDark: ['#F5F5F5', '#FFFFFF'] as const,
  gradientCard: ['rgba(108, 60, 225, 0.08)', 'transparent'] as const,

  // Skeleton
  skeleton: '#E5E5EE',
  skeletonHighlight: '#EBEBF5',

  // Category Colors
  categoryColors: {
    'Müzik': '#FF6B35',
    'Teknoloji': '#6C3CE1',
    'Sanat': '#00C97A',
    'Spor': '#D93025',
    'Yemek': '#E07800',
    'Eğitim': '#1A8F4A',
    'Film': '#0070E0',
    'Komedi': '#E0509A',
  } as Record<string, string>,

  // Transparent variants
  primaryTransparent: 'rgba(108, 60, 225, 0.10)',
  secondaryTransparent: 'rgba(255, 107, 53, 0.10)',
  accentTransparent: 'rgba(0, 201, 122, 0.10)',
  whiteTransparent10: 'rgba(255, 255, 255, 0.70)',
  whiteTransparent20: 'rgba(255, 255, 255, 0.90)',
  blackTransparent50: 'rgba(0, 0, 0, 0.10)',
};

// ─── Legacy export (dark theme by default — backward compat) ──────
export const Colors = DarkColors;

export default Colors;
