import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface TrendChartProps {
  /** Values to plot, left to right. */
  data: number[];
  height?: number;
  color?: string;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/** Smooth area/line chart — the "Data Insights" style trend card. Only use with genuine
 *  time-ordered/sequential data, never to visualize categorical counts. */
export function TrendChart({ data, height = 90, color }: TrendChartProps) {
  const { colors } = useTheme();
  const strokeColor = color ?? colors.accent.primary;

  if (data.length === 0) return null;

  const width = Math.max(data.length * 56, 220);
  const paddingY = 12;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: data.length === 1 ? width / 2 : (i / (data.length - 1)) * width,
    y: paddingY + (1 - (value - min) / range) * (height - paddingY * 2),
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={{ width: '100%', height, overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={strokeColor} stopOpacity={0.35} />
            <Stop offset="1" stopColor={strokeColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#trendFill)" stroke="none" />
        <Path d={linePath} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={strokeColor} />
        ))}
      </Svg>
    </View>
  );
}
