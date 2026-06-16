import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// Type scale (8pt baseline grid)
export const typeScale = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  title1: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.semibold,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fontFamily.semibold,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  title3: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.semibold,
    letterSpacing: -0.1,
  } satisfies TextStyle,

  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    letterSpacing: 0,
  } satisfies TextStyle,

  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.medium,
    letterSpacing: 0,
  } satisfies TextStyle,

  caption1: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    letterSpacing: 0,
  } satisfies TextStyle,

  caption1Medium: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    letterSpacing: 0,
  } satisfies TextStyle,

  caption2: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.2,
  } satisfies TextStyle,
} as const;

export type TypeToken = keyof typeof typeScale;
