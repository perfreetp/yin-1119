import React from 'react';
import { View, Text } from '@tarojs/components';
import type { HeightWeightRecord } from '@/types/child';
import styles from './index.module.scss';

interface GrowthChartProps {
  data: HeightWeightRecord[];
  type: 'height' | 'weight';
  unit?: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, type, unit = type === 'height' ? 'cm' : 'kg' }) => {
  if (data.length === 0) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyText}>暂无记录，快去添加吧~</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  const displayData = data.slice(-7);

  return (
    <View className={styles.chart}>
      <View className={styles.titleRow}>
        <Text className={styles.title}>{type === 'height' ? '身高' : '体重'}趋势</Text>
        <Text className={styles.unit}>{unit}</Text>
      </View>
      <View className={styles.chartArea}>
        <View className={styles.bars}>
          {displayData.map((item, index) => {
            const heightPercent = ((item.value - minVal) / range) * 60 + 40;
            return (
              <View key={index} className={styles.barWrapper}>
                <Text className={styles.barValue}>{item.value}</Text>
                <View
                  className={styles.bar}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: index === displayData.length - 1 ? '#6BA3BE' : '#93C5D8',
                  }}
                />
                <Text className={styles.barDate}>
                  {item.date.slice(5)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default GrowthChart;
