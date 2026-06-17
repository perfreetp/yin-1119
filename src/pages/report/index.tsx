import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import RiskBadge from '@/components/RiskBadge';
import ShareButton from '@/components/ShareButton';
import { RISK_LEVEL_CONFIG } from '@/types/report';
import { SYMPTOM_LABELS, DAYTIME_LABELS, FREQUENCY_OPTIONS } from '@/types/observation';
import type { NightObservation } from '@/types/observation';
import type { HeightWeightRecord } from '@/types/child';
import { analyze7DayTrend, generateTrendSummary, getTrendEmoji, getTrendTextColor } from '@/utils/trendAnalysis';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const SEVERITY_LABELS: Record<string, string> = {
  none: '没有',
  mild: '轻微',
  moderate: '中等',
  severe: '明显',
};

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const SYMPTOM_COLORS: Record<string, string> = {
  snoring: '#E76F6F',
  mouthBreathing: '#F4A261',
  nightWaking: '#6BA3BE',
  tossing: '#7EC88B',
  drooling: '#B58BD9',
};
const MAIN_SYMPTOM_KEYS = ['snoring', 'mouthBreathing', 'nightWaking', 'tossing', 'drooling'];

const ReportPage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const riskAssessment = useChildStore(state => state.riskAssessment);
  const observations = useChildStore(state => state.observations);
  const heightRecords = useChildStore(state => state.heightRecords);
  const weightRecords = useChildStore(state => state.weightRecords);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const trends = analyze7DayTrend(observations);
  const trendSummary = generateTrendSummary(trends);
  const hasTrendData = trends.some(t => t.hasData);

  const childObservations = useMemo(() => {
    if (!child) return [];
    return observations.filter(o => o.childId === child.id);
  }, [observations, child?.id]);

  const calendarData = useMemo(() => {
    const today = dayjs();
    const startDate = today.subtract(29, 'day');
    const days: { date: string; dayNum: string; weekday: number; isToday: boolean; isFuture: boolean; records: NightObservation[] }[] = [];
    const firstDayWeekday = startDate.day();
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({ date: '', dayNum: '', weekday: i, isToday: false, isFuture: false, records: [] });
    }
    for (let i = 0; i < 30; i++) {
      const d = startDate.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const records = childObservations.filter(o => o.date === dateStr);
      days.push({
        date: dateStr,
        dayNum: d.format('D'),
        weekday: d.day(),
        isToday: dateStr === today.format('YYYY-MM-DD'),
        isFuture: d.isAfter(today),
        records,
      });
    }
    return days;
  }, [childObservations]);

  const selectedDayRecords = useMemo(() => {
    if (!selectedDate) return null;
    return childObservations.filter(o => o.date === selectedDate);
  }, [selectedDate, childObservations]);

  const growthChanges = useMemo(() => {
    const getSortedRecords = (records: HeightWeightRecord[]) => {
      return [...records].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    };
    const sortedHeights = getSortedRecords(heightRecords);
    const sortedWeights = getSortedRecords(weightRecords);

    const getChange = (sorted: HeightWeightRecord[], unit: string) => {
      if (sorted.length === 0) return { hasData: false, hint: '还没有记录，去档案页记录一下吧~' };
      if (sorted.length < 2) {
        const latest = sorted[sorted.length - 1];
        return {
          hasData: true,
          canCompare: false,
          latest,
          hint: '只记录了一次，再记一次就能看到变化啦~',
          unit,
        };
      }
      const latest = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      const diff = Number((latest.value - prev.value).toFixed(2));
      return {
        hasData: true,
        canCompare: true,
        latest,
        prev,
        diff,
        unit,
        hint: `距离上次记录${dayjs(latest.date).diff(dayjs(prev.date), 'day')}天`,
      };
    };

    return {
      height: getChange(sortedHeights, 'cm'),
      weight: getChange(sortedWeights, 'kg'),
    };
  }, [heightRecords, weightRecords]);

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

      <View className={styles.trendCard}>
        <View className={styles.trendHeader}>
          <Text className={styles.trendTitle}>📊 最近7天趋势</Text>
          <Text style={{ fontSize: '24rpx', color: '#8E9AAB' }}>
            {hasTrendData ? `共${trends[0].totalDays}天记录` : '暂无数据'}
          </Text>
        </View>
        <Text className={styles.trendSummary}>{trendSummary}</Text>
        <View className={styles.trendList}>
          {trends.map(trend => (
            <View key={trend.key} className={styles.trendItem}>
              <Text className={styles.trendItemName}>{trend.label}</Text>
              <View className={styles.trendItemValue}>
                <Text style={{ fontSize: '32rpx' }}>{getTrendEmoji(trend.direction)}</Text>
                <Text style={{ color: getTrendTextColor(trend.direction) }}>
                  {trend.description.replace(trend.label, '')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.calendarCard}>
        <View className={styles.calendarHeader}>
          <Text className={styles.calendarTitle}>📅 症状日历（近30天）</Text>
        </View>
        <View className={styles.calendarLegend}>
          {MAIN_SYMPTOM_KEYS.map(key => (
            <View key={key} className={styles.legendItem}>
              <View className={styles.legendDot} style={{ backgroundColor: SYMPTOM_COLORS[key] }} />
              <Text className={styles.legendText}>{SYMPTOM_LABELS[key]}</Text>
            </View>
          ))}
        </View>
        <View className={styles.calendarGrid}>
          {WEEKDAYS.map(w => (
            <Text key={w} className={styles.calendarWeekday}>{w}</Text>
          ))}
          {calendarData.map((day, idx) => {
            if (!day.date) {
              return <View key={`empty-${idx}`} className={`${styles.calendarDay} ${styles.calendarDayEmpty}`} />;
            }
            const hasSymptoms: string[] = [];
            day.records.forEach(r => {
              MAIN_SYMPTOM_KEYS.forEach(k => {
                if ((r as any)[k]?.present && !hasSymptoms.includes(k)) {
                  hasSymptoms.push(k);
                }
              });
            });
            return (
              <View
                key={day.date}
                className={`${styles.calendarDay} ${day.isToday ? styles.calendarDayToday : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <Text className={styles.calendarDayNum}>{day.dayNum}</Text>
                <View className={styles.calendarDayDots}>
                  {hasSymptoms.slice(0, 3).map(k => (
                    <View key={k} className={styles.calendarDot} style={{ backgroundColor: SYMPTOM_COLORS[k] }} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {selectedDate && (
          <View className={styles.calendarDetail}>
            <Text className={styles.calendarDetailDate}>
              {selectedDate} 的记录
            </Text>
            {!selectedDayRecords || selectedDayRecords.length === 0 ? (
              <Text className={styles.calendarDetailEmpty}>当天没有观察记录</Text>
            ) : (
              selectedDayRecords.map(record => (
                <View key={record.id}>
                  <View className={styles.calendarDetailSymptoms}>
                    {MAIN_SYMPTOM_KEYS.map(k => {
                      const symptom = (record as any)[k];
                      const label = SYMPTOM_LABELS[k];
                      if (!symptom || !symptom.present) {
                        return (
                          <Text key={k} className={`${styles.calendarDetailTag} ${styles.calendarDetailTagNone}`}>
                            {label}：无
                          </Text>
                        );
                      }
                      return (
                        <Text key={k} className={styles.calendarDetailTag}>
                          {label}：{FREQUENCY_OPTIONS.find(o => o.value === symptom.frequency)?.label}
                        </Text>
                      );
                    })}
                  </View>
                  {record.notes && (
                    <Text className={styles.calendarDetailNotes}>备注：{record.notes}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View className={styles.growthCard}>
        <Text className={styles.growthTitle}>📏 成长变化对比</Text>
        <View className={styles.growthItem}>
          <View className={styles.growthItemHeader}>
            <Text className={styles.growthItemName}>身高</Text>
            {growthChanges.height.hasData && growthChanges.height.canCompare && (
              <Text
                className={styles.growthItemChange}
                style={{ color: growthChanges.height.diff >= 0 ? '#7EC88B' : '#E76F6F' }}
              >
                {growthChanges.height.diff >= 0 ? '+' : ''}{growthChanges.height.diff}{growthChanges.height.unit}
              </Text>
            )}
          </View>
          {!growthChanges.height.hasData ? (
            <Text className={styles.growthItemHint}>{growthChanges.height.hint}</Text>
          ) : (
            <>
              <Text className={styles.growthItemValue}>
                最近：{growthChanges.height.latest.value}cm（{growthChanges.height.latest.date}）
              </Text>
              <Text className={styles.growthItemHint}>{growthChanges.height.hint}</Text>
            </>
          )}
        </View>
        <View className={styles.growthItem}>
          <View className={styles.growthItemHeader}>
            <Text className={styles.growthItemName}>体重</Text>
            {growthChanges.weight.hasData && growthChanges.weight.canCompare && (
              <Text
                className={styles.growthItemChange}
                style={{ color: growthChanges.weight.diff >= 0 ? '#7EC88B' : '#E76F6F' }}
              >
                {growthChanges.weight.diff >= 0 ? '+' : ''}{growthChanges.weight.diff}{growthChanges.weight.unit}
              </Text>
            )}
          </View>
          {!growthChanges.weight.hasData ? (
            <Text className={styles.growthItemHint}>{growthChanges.weight.hint}</Text>
          ) : (
            <>
              <Text className={styles.growthItemValue}>
                最近：{growthChanges.weight.latest.value}kg（{growthChanges.weight.latest.date}）
              </Text>
              <Text className={styles.growthItemHint}>{growthChanges.weight.hint}</Text>
            </>
          )}
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
