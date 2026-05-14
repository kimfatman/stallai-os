import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  maxValue?: number;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function RadarChart({ data, size = 200, maxValue = 100 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size - 60) / 2;
  const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  const getPointCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const normalizedValue = value / maxValue;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = radius + 25;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  const getAxisEndCoordinates = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  const dataPoints = data.map((item, index) => getPointCoordinates(index, item.value));
  const polygonPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circles */}
        {[1, 2, 3, 4, 5].map((level) => (
          <Circle
            key={`level-${level}`}
            cx={center}
            cy={center}
            r={(radius * level) / levels}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, index) => {
          const end = getAxisEndCoordinates(index);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#E0E0E0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <Polygon
          points={polygonPoints}
          fill="rgba(229, 57, 53, 0.2)"
          stroke="#E53935"
          strokeWidth="2"
        />

        {/* Data Points */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#E53935"
          />
        ))}

        {/* Labels */}
        {data.map((item, index) => {
          const labelPos = getLabelCoordinates(index);
          const textAnchor = labelPos.x < center ? 'end' : labelPos.x > center ? 'start' : 'middle';
          return (
            <SvgText
              key={`label-${index}`}
              x={labelPos.x}
              y={labelPos.y}
              fontSize="11"
              fill="#616161"
              textAnchor={textAnchor}
              alignmentBaseline="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
