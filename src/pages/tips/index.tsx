import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useChildStore } from '@/store/useChildStore';
import { growthTips, TIP_CATEGORY_LABELS } from '@/data/growthTips';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const TipsPage: React.FC = () => {
  const riskAssessment = useChildStore(state => state.riskAssessment);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const categories = [
    { value: 'all', label: '全部' },
    ...Object.entries(TIP_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const filteredTips = selectedCategory === 'all'
    ? growthTips
    : growthTips.filter(tip => tip.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getCategoryLabel = (category: string) => {
    return TIP_CATEGORY_LABELS[category] || category;
  };

  return (
    <View className={styles.tipsPage}>
      <Text className={styles.pageTitle}>💡 成长提示</Text>
      <Text className={styles.pageDesc}>
        了解和宝贝睡眠相关的知识，帮助宝贝更好地成长
      </Text>

      {riskAssessment && riskAssessment.followUpDate && (
        <View className={styles.reminderCard}>
          <Text className={styles.reminderTitle}>🔔 复查提醒</Text>
          <Text className={styles.reminderText}>
            根据宝贝目前的情况，建议在以下日期前进行复查：
          </Text>
          <Text className={styles.reminderDate}>
            {riskAssessment.followUpDate}
            {dayjs(riskAssessment.followUpDate).isAfter(dayjs()) && (
              `（还有${dayjs(riskAssessment.followUpDate).diff(dayjs(), 'day')}天）`
            )}
          </Text>
        </View>
      )}

      <View className={styles.categoryRow}>
        {categories.map(cat => (
          <View
            key={cat.value}
            className={`${styles.categoryBtn} ${selectedCategory === cat.value ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <Text
              className={`${styles.categoryBtnText} ${selectedCategory === cat.value ? styles.categoryBtnTextActive : ''}`}
            >
              {cat.label}
            </Text>
          </View>
        ))}
      </View>

      {filteredTips.map(tip => (
        <View key={tip.id} className={styles.tipCard} onClick={() => toggleExpand(tip.id)}>
          <View className={styles.tipHeader}>
            <Text className={styles.tipTitle}>{tip.title}</Text>
            <Text className={styles.tipCategory}>{getCategoryLabel(tip.category)}</Text>
          </View>
          <Text className={styles.tipSummary}>{tip.summary}</Text>
          <View className={styles.tipTags}>
            {tip.tags.map(tag => (
              <Text key={tag} className={styles.tipTag}>{tag}</Text>
            ))}
          </View>
          {expandedIds.has(tip.id) && (
            <Text className={styles.tipContent}>{tip.content}</Text>
          )}
          <View className={styles.expandBtn}>
            <Text className={styles.expandBtnText}>
              {expandedIds.has(tip.id) ? '收起' : '展开阅读'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default TipsPage;
