import React from 'react';
import { View, Text } from '@tarojs/components';
import type { RiskLevel } from '@/types/report';
import { RISK_LEVEL_CONFIG } from '@/types/report';
import styles from './index.module.scss';

interface RiskBadgeProps {
  level: RiskLevel;
  showDescription?: boolean;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showDescription = false }) => {
  const config = RISK_LEVEL_CONFIG[level];

  return (
    <View className={styles.badge}>
      <View className={styles.indicator} style={{ backgroundColor: config.color }}>
        <Text className={styles.label}>{config.label}</Text>
      </View>
      {showDescription && (
        <Text className={styles.description}>{config.description}</Text>
      )}
    </View>
  );
};

export default RiskBadge;
