export const fonts = {
  title: 'Bungee-Regular',
  body: 'AtkinsonHyperlegible-Regular',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

/** Session type label on exercise screens: 12pt, 100% LH, 5% tracking */
export const exerciseSessionTitleType = {
  fontSize: 12,
  lineHeight: 12,
  letterSpacing: 12 * 0.05,
} as const;

/** Exercise screen titles: 32pt, 120% line height, 3% tracking */
export const exerciseTitleType = {
  fontSize: 32,
  lineHeight: 32 * 1.2,
  letterSpacing: 32 * 0.03,
} as const;
