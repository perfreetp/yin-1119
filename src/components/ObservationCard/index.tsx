import React from 'react';
import { View, Text } from '@tarojs/components';
import type { NightObservation } from '@/types/observation';
import { SYMPTOM_LABELS, DAYTIME_LABELS, FREQUENCY_OPTIONS, DAYTIME_OPTIONS } from '@/types/observation';
import styles from './index.module.scss';

interface ObservationCardProps {
  observation: NightObservation;
  onDelete?: (id: string) => void;
}

const ObservationCard: React.FC<ObservationCardProps> = ({ observation, onDelete }) => {
  const activeSymptoms = Object.entries(SYMPTOM_LABELS)
    .filter(([key]) => observation[key]?.frequency !== 'none')
    .map(([key, label]) => {
      const freq = FREQUENCY_OPTIONS.find(f => f.value === observation[key]?.frequency);
      return { key, label, freqLabel: freq?.label || '' };
    });

  const daytimeItems = Object.entries(DAYTIME_LABELS)
    .map(([key, label]) => {
      const opt = DAYTIME_OPTIONS.find(o => o.value === observation[key]);
      return { key, label, value: opt?.label || '' };
    });

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.date}>{observation.date}</Text>
        {onDelete && (
          <Text className={styles.deleteBtn} onClick={() => onDelete(observation.id)}>
            删除
          </Text>
        )}
      </View>

      {activeSymptoms.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>夜间症状</Text>
          <View className={styles.tagList}>
            {activeSymptoms.map(s => (
              <View key={s.key} className={styles.tag}>
                <Text className={styles.tagText}>{s.label}·{s.freqLabel}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>白天状态</Text>
        <View className={styles.daytimeList}>
          {daytimeItems.map(d => (
            <View key={d.key} className={styles.daytimeItem}>
              <Text className={styles.daytimeLabel}>{d.label}</Text>
              <Text className={styles.daytimeValue}>{d.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {observation.notes && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注</Text>
          <Text className={styles.notes}>{observation.notes}</Text>
        </View>
      )}
    </View>
  );
};

export default ObservationCard;
