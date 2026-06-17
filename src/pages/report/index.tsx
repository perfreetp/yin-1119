import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import RiskBadge from '@/components/RiskBadge';
import ShareButton from '@/components/ShareButton';
import { RISK_LEVEL_CONFIG } from '@/types/report';
import { SYMPTOM_LABELS, DAYTIME_LABELS } from '@/types/observation';
import styles from './index.module.scss';

const SEVERITY_LABELS: Record<string, string> = {
  none: '没有',
  mild: '轻微',
  moderate: '中等',
  severe: '明显',
};

const ReportPage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const riskAssessment = useChildStore(state => state.riskAssessment);
  const observations = useChildStore(state => state.observations);

  if (!child) {
    return (
      <View className={styles.reportPage}>
        <Text className={styles.pageTitle}>📊 结果报告</Text>
        <Text className={styles.pageDesc}>根据观察记录生成风险评估和建议</Text>
        <View className={styles.emptyState}>
          <Text className={styles.emptyEmoji}>📋</Text>
          <Text className={styles.emptyText}>
            请先在"档案"中添加宝贝信息{'\n'}才能生成报告哦~
          </Text>
          <View
            className={styles.startBtn}
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className={styles.startBtnText}>去添加宝贝信息</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!riskAssessment || observations.length === 0) {
    return (
      <View className={styles.reportPage}>
        <Text className={styles.pageTitle}>📊 结果报告</Text>
        <Text className={styles.pageDesc}>根据观察记录生成风险评估和建议</Text>
        <View className={styles.emptyState}>
          <Text className={styles.emptyEmoji}>🌙</Text>
          <Text className={styles.emptyText}>
            还没有观察记录哦~{'\n'}今晚开始记录宝贝的睡眠情况，{'\n'}就能看到评估报告啦！
          </Text>
          <View
            className={styles.startBtn}
            onClick={() => Taro.switchTab({ url: '/pages/observe/index' })}
          >
            <Text className={styles.startBtnText}>开始观察</Text>
          </View>
        </View>
      </View>
    );
  }

  const config = RISK_LEVEL_CONFIG[riskAssessment.level];
  const scorePercent = Math.round((riskAssessment.score / riskAssessment.maxScore) * 100);

  const nightSymptoms = riskAssessment.symptoms.filter(s =>
    Object.keys(SYMPTOM_LABELS).includes(s.name)
  );
  const daytimeSymptoms = riskAssessment.symptoms.filter(s =>
    Object.keys(DAYTIME_LABELS).includes(s.name)
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'none': return styles.severityNone;
      case 'mild': return styles.severityMild;
      case 'moderate': return styles.severityModerate;
      case 'severe': return styles.severitySevere;
      default: return styles.severityNone;
    }
  };

  return (
    <View className={styles.reportPage}>
      <Text className={styles.pageTitle}>📊 结果报告</Text>
      <Text className={styles.pageDesc}>根据观察记录生成风险评估和建议</Text>

      <View className={styles.riskCard}>
        <View
          className={styles.riskCircle}
          style={{ backgroundColor: config.color }}
        >
          <Text className={styles.riskScore}>{riskAssessment.score}</Text>
          <Text className={styles.riskScoreMax}>/{riskAssessment.maxScore}</Text>
        </View>
        <RiskBadge level={riskAssessment.level} showDescription />
        <View className={styles.scoreBar}>
          <View
            className={styles.scoreBarFill}
            style={{
              width: `${scorePercent}%`,
              backgroundColor: config.color,
            }}
          />
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>💤 夜间症状分析</Text>
        {nightSymptoms.map(symptom => (
          <View key={symptom.name} className={styles.symptomItem}>
            <Text className={styles.symptomName}>
              {SYMPTOM_LABELS[symptom.name] || symptom.name}
            </Text>
            <Text className={`${styles.severityBadge} ${getSeverityStyle(symptom.severity)}`}>
              {SEVERITY_LABELS[symptom.severity] || symptom.severity}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>☀️ 白天状态分析</Text>
        {daytimeSymptoms.map(symptom => (
          <View key={symptom.name} className={styles.symptomItem}>
            <Text className={styles.symptomName}>
              {DAYTIME_LABELS[symptom.name] || symptom.name}
            </Text>
            <Text className={`${styles.severityBadge} ${getSeverityStyle(symptom.severity)}`}>
              {SEVERITY_LABELS[symptom.severity] || symptom.severity}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>💚 温馨建议</Text>
        {riskAssessment.recommendations.map((rec, index) => (
          <View key={index} className={styles.recommendationItem}>
            <View className={styles.recommendationDot} />
            <Text className={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {riskAssessment.followUpDate && (
        <View className={styles.followUpCard}>
          <Text className={styles.followUpTitle}>🔔 复查提醒</Text>
          <Text className={styles.followUpText}>
            根据宝贝目前的情况，建议您在以下日期前带宝贝复查：
          </Text>
          <Text className={styles.followUpDate}>{riskAssessment.followUpDate}</Text>
        </View>
      )}

      <View className={styles.shareSection}>
        <ShareButton
          childName={child.name}
          riskLevel={config.label}
          date={riskAssessment.assessedAt.split('T')[0]}
        />
      </View>
    </View>
  );
};

export default ReportPage;
