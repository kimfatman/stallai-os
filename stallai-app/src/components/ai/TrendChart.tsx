import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface DataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TrendChartProps {
  data: DataPoint[];
  height?: number;
  showOrders?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export default function TrendChart({
  data,
  height = 180,
  showOrders = false,
}: TrendChartProps) {
  const chartWidth = screenWidth - 64;
  const chartHeight = height - 60;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 40;
  const paddingRight = 10;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue)) * 1.1;
  const minRevenue = 0;

  const getX = (index: number) => {
    return paddingLeft + (index * graphWidth) / (data.length - 1);
  };

  const getY = (value: number) => {
    return paddingTop + graphHeight - ((value - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
  };

  const linePath = data
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.revenue);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaPath = `${linePath} L ${getX(data.length - 1)} ${paddingTop + graphHeight} L ${getX(0)} ${paddingTop + graphHeight} Z`;

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={[styles.container, { height }]}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={`grid-${index}`}
            x1={paddingLeft}
            y1={paddingTop + graphHeight * (1 - ratio)}
            x2={chartWidth - paddingRight}
            y2={paddingTop + graphHeight * (1 - ratio)}
            stroke="#E0E0E0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = maxRevenue - ratio * (maxRevenue - minRevenue);
          return (
            <SvgText
              key={`label-${index}`}
              x={paddingLeft - 8}
              y={paddingTop + graphHeight * (1 - ratio) + 4}
              fontSize="10"
              fill="#9E9E9E"
              textAnchor="end"
            >
              ¥{Math.round(value)}
            </SvgText>
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#gradient)" opacity="0.3" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke="#E53935" strokeWidth="2" />

        {/* Data points */}
        {data.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={getX(index)}
            cy={getY(point.revenue)}
            r="4"
            fill="#E53935"
          />
        ))}

        {/* X-axis labels */}
        {data.map((point, index) => (
          <SvgText
            key={`xlabel-${index}`}
            x={getX(index)}
            y={chartHeight - 8}
            fontSize="10"
            fill="#9E9E9E"
            textAnchor="middle"
          >
            {point.date}
          </SvgText>
        ))}

        {/* Gradient definition */}
        <Path
          d={`M ${paddingLeft} ${paddingTop + graphHeight} L ${paddingLeft} ${paddingTop} L ${chartWidth - paddingRight} ${paddingTop} L ${chartWidth - paddingRight} ${paddingTop + graphHeight} Z`}
          fill="url(#gradient)"
          opacity="0"
        />
      </Svg>

      {/* SVG definitions */}
      <View style={styles.defs}>
        <View>
          {/* Gradient would be defined here */}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  defs: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
