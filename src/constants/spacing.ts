// 8pt grid spacing system
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const layout = {
  screenPaddingH: spacing[4],
  screenPaddingV: spacing[4],
  sectionGap: spacing[6],
  cardPadding: spacing[4],
  listItemGap: spacing[3],
  tabBarHeight: 60,
  headerHeight: 56,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
