import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import RiskBadge from '@/components/RiskBadge';
import ObservationCard from '@/components/ObservationCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const observations = useChildStore(state => state.observations);
  const riskAssessment = useChildStore(state => state.riskAssessment);
  const getAgeText = useChildStore(state => state.getAgeText);

  const recentObservations = observations.slice(0, 3);

  return (
    <View className={styles.homePage}>
      <View className={styles.header}>
        <Text className={styles.greeting}>
          {child ? `${child.name}的睡眠观察` : '宝贝睡眠观察'}
        </Text>
        {child && (
          <Text className={styles.subtitle}>{getAgeText()} · 每晚守护宝贝好睡眠</Text>
        )}
        {!child && (
          <Text className={styles.subtitle}>温柔记录，守护宝贝每一夜好眠</Text>
        )}
      </View>

      <View className={styles.riskSection}>
        <View className={styles.riskHeader}>
          <Text className={styles.riskTitle}>风险评估</Text>
          {riskAssessment && <RiskBadge level={riskAssessment.level} />}
        </View>
        {riskAssessment && (
          <Text className={styles.riskDesc}>
            综合近7天观察，宝贝当前评分 {riskAssessment.score}/{riskAssessment.maxScore}
          </Text>
        )}
        {!riskAssessment && child && (
          <Text className={styles.noDataTip}>还没有观察记录，今晚开始记录宝贝的睡眠情况吧~</Text>
        )}
        {!child && (
          <Text className={styles.noDataTip}>请先在"档案"中添加宝贝的基本信息</Text>
        )}
      </View>

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>快捷操作</Text>
        <View className={styles.actionGrid}>
          <View
            className={styles.actionCard}
            onClick={() => Taro.switchTab({ url: '/pages/observe/index' })}
          >
            <View className={`${styles.actionIcon} ${styles.actionIconObserve}`}>
              <Text className={styles.actionEmoji}>🌙</Text>
            </View>
            <Text className={styles.actionLabel}>夜间观察</Text>
            <Text className={styles.actionDesc}>记录今晚的情况</Text>
          </View>
          <View
            className={styles.actionCard}
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <View className={`${styles.actionIcon} ${styles.actionIconProfile}`}>
              <Text className={styles.actionEmoji}>👶</Text>
            </View>
            <Text className={styles.actionLabel}>宝贝档案</Text>
            <Text className={styles.actionDesc}>管理基本信息</Text>
          </View>
          <View
            className={styles.actionCard}
            onClick={() => Taro.switchTab({ url: '/pages/tips/index' })}
          >
            <View className={`${styles.actionIcon} ${styles.actionIconTips}`}>
              <Text className={styles.actionEmoji}>💡</Text>
            </View>
            <Text className={styles.actionLabel}>成长提示</Text>
            <Text className={styles.actionDesc}>了解相关知识</Text>
          </View>
          <View
            className={styles.actionCard}
            onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
          >
            <View className={`${styles.actionIcon} ${styles.actionIconReport}`}>
              <Text className={styles.actionEmoji}>📊</Text>
            </View>
            <Text className={styles.actionLabel}>结果报告</Text>
            <Text className={styles.actionDesc}>查看风险评估</Text>
          </View>
        </View>
      </View>

      <View className={styles.recentSection}>
        <Text className={styles.sectionTitle}>最近观察</Text>
        {recentObservations.length > 0 ? (
          recentObservations.map(obs => (
            <ObservationCard key={obs.id} observation={obs} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyEmoji}>😴</Text>
            <Text className={styles.emptyText}>
              还没有观察记录{'\n'}今晚开始记录宝贝的睡眠吧~
            </Text>
            <View
              className={styles.startBtn}
              onClick={() => Taro.switchTab({ url: '/pages/observe/index' })}
            >
              <Text className={styles.startBtnText}>开始观察</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePage;
