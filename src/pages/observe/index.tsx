import React, { useState, useMemo } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import type { SymptomRecord, DaytimeLevel, ObservationFormData, NightObservation } from '@/types/observation';
import { FREQUENCY_OPTIONS, DAYTIME_OPTIONS, SYMPTOM_LABELS, DAYTIME_LABELS } from '@/types/observation';
import type { FrequencyLevel } from '@/types/observation';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const SYMPTOM_DESCRIPTIONS: Record<string, string> = {
  snoring: '睡觉时有没有发出呼噜声？',
  mouthBreathing: '睡觉时嘴巴是不是张开的？',
  drooling: '早上起来枕头有没有口水印？',
  tossing: '宝贝晚上是不是翻来翻去睡不踏实？',
  nightWaking: '宝贝有没有突然醒来哭闹或大口喘气？',
};

const DAYTIME_DESCRIPTIONS: Record<string, string> = {
  daytimeAttention: '宝贝白天能不能集中注意力做事情？',
  daytimeEnergy: '宝贝白天精神头怎么样？',
  daytimeMood: '宝贝白天情绪怎么样？',
};

const defaultSymptom: SymptomRecord = { present: false, frequency: 'none' };

const ObservePage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const addObservation = useChildStore(state => state.addObservation);
  const deleteObservation = useChildStore(state => state.deleteObservation);
  const observations = useChildStore(state => state.observations);

  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [symptoms, setSymptoms] = useState<Record<string, SymptomRecord>>({
    snoring: { ...defaultSymptom },
    mouthBreathing: { ...defaultSymptom },
    drooling: { ...defaultSymptom },
    tossing: { ...defaultSymptom },
    nightWaking: { ...defaultSymptom },
  });
  const [daytime, setDaytime] = useState<Record<string, DaytimeLevel>>({
    daytimeAttention: 'normal',
    daytimeEnergy: 'normal',
    daytimeMood: 'normal',
  });
  const [notes, setNotes] = useState('');

  const todayRecords = useMemo(() => {
    if (!child) return [];
    return observations.filter(o => o.childId === child.id && o.date === date);
  }, [observations, child?.id, date]);

  const handleFrequencyChange = (symptomKey: string, frequency: FrequencyLevel) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomKey]: { present: frequency !== 'none', frequency },
    }));
  };

  const handleDaytimeChange = (key: string, value: DaytimeLevel) => {
    setDaytime(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = () => {
    const today = dayjs();
    const dateStr = date;
    Taro.showActionSheet({
      itemList: [
        '今天',
        '昨天',
        '前天',
        '3天前',
        '手动选择日期',
      ],
      success: (res) => {
        let target = today;
        switch (res.tapIndex) {
          case 0: target = today; break;
          case 1: target = today.subtract(1, 'day'); break;
          case 2: target = today.subtract(2, 'day'); break;
          case 3: target = today.subtract(3, 'day'); break;
          case 4:
            Taro.showModal({
              title: '选择观察日期',
              editable: true,
              placeholderText: '如：2025-06-15',
              content: dateStr,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  const val = (modalRes.content || '').trim();
                  if (!val) return;
                  const parsed = dayjs(val);
                  if (!parsed.isValid() || parsed.format('YYYY-MM-DD') !== val) {
                    Taro.showToast({ title: '日期格式不正确', icon: 'none' });
                    return;
                  }
                  if (parsed.isAfter(today)) {
                    Taro.showToast({ title: '不能选择未来日期', icon: 'none' });
                    return;
                  }
                  setDate(val);
                }
              },
            });
            return;
        }
        setDate(target.format('YYYY-MM-DD'));
      },
    });
  };

  const handleDeleteRecord = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条观察记录吗？',
      success: (res) => {
        if (res.confirm) {
          deleteObservation(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleSave = () => {
    if (!child) {
      Taro.showToast({ title: '请先添加宝贝信息', icon: 'none' });
      return;
    }

    const data: ObservationFormData = {
      date,
      snoring: symptoms.snoring,
      mouthBreathing: symptoms.mouthBreathing,
      drooling: symptoms.drooling,
      tossing: symptoms.tossing,
      nightWaking: symptoms.nightWaking,
      daytimeAttention: daytime.daytimeAttention,
      daytimeEnergy: daytime.daytimeEnergy,
      daytimeMood: daytime.daytimeMood,
      notes,
    };

    addObservation(data);
    Taro.showToast({ title: '观察记录已保存~', icon: 'success' });

    setSymptoms({
      snoring: { ...defaultSymptom },
      mouthBreathing: { ...defaultSymptom },
      drooling: { ...defaultSymptom },
      tossing: { ...defaultSymptom },
      nightWaking: { ...defaultSymptom },
    });
    setDaytime({
      daytimeAttention: 'normal',
      daytimeEnergy: 'normal',
      daytimeMood: 'normal',
    });
    setNotes('');
  };

  if (!child) {
    return (
      <View className={styles.observePage}>
        <Text className={styles.pageTitle}>夜间观察</Text>
        <Text className={styles.pageDesc}>记录宝贝每晚的睡眠表现</Text>
        <View className={styles.noChildTip}>
          <Text className={styles.noChildEmoji}>📝</Text>
          <Text className={styles.noChildText}>
            请先在"档案"中添加宝贝信息{'\n'}才能开始记录观察哦~
          </Text>
          <View
            className={styles.goProfileBtn}
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className={styles.goProfileBtnText}>去添加宝贝信息</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.observePage}>
      <Text className={styles.pageTitle}>🌙 夜间观察</Text>
      <Text className={styles.pageDesc}>
        每天早上记录昨晚宝贝的睡眠表现，坚持记录可以更清楚地了解宝贝的情况
      </Text>

      <View className={styles.dateCard}>
        <View>
          <Text className={styles.dateLabel}>观察日期</Text>
          <Text className={styles.dateValue}>{date}</Text>
        </View>
        <Text className={styles.dateChangeBtn} onClick={handleDateChange}>选择日期</Text>
      </View>

      <View className={styles.existingRecords}>
        <Text className={styles.existingTitle}>
          📋 当天已记录
          {todayRecords.length > 0 && (
            <Text className={styles.existingCount}>（{todayRecords.length}条）</Text>
          )}
        </Text>
        {todayRecords.length === 0 ? (
          <Text className={styles.noRecordTip}>当天还没有记录，填写下方表单开始记录~</Text>
        ) : (
          todayRecords.map(record => (
            <View key={record.id} className={styles.recordItem}>
              <Text className={styles.recordTime}>记录时间：{record.createdAt}</Text>
              <View className={styles.recordSymptoms}>
                {Object.entries(SYMPTOM_LABELS).map(([key, label]) => {
                  const symptom = (record as any)[key];
                  if (!symptom || !symptom.present) {
                    return (
                      <Text key={key} className={`${styles.recordTag} ${styles.recordTagNone}`}>
                        {label}：无
                      </Text>
                    );
                  }
                  return (
                    <Text key={key} className={styles.recordTag}>
                      {label}：{FREQUENCY_OPTIONS.find(o => o.value === symptom.frequency)?.label}
                    </Text>
                  );
                })}
              </View>
              {record.notes && (
                <Text className={styles.recordNotes}>备注：{record.notes}</Text>
              )}
              <Text className={styles.recordDelete} onClick={() => handleDeleteRecord(record.id)}>
                删除此条
              </Text>
            </View>
          ))
        )}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>💤 夜间症状</Text>
        {Object.entries(SYMPTOM_LABELS).map(([key, label]) => (
          <View key={key} className={styles.symptomItem}>
            <Text className={styles.symptomName}>{label}</Text>
            <Text className={styles.symptomDesc}>{SYMPTOM_DESCRIPTIONS[key]}</Text>
            <View className={styles.frequencyRow}>
              {FREQUENCY_OPTIONS.map(opt => (
                <View
                  key={opt.value}
                  className={`${styles.frequencyOption} ${symptoms[key]?.frequency === opt.value ? styles.frequencyOptionActive : ''}`}
                  onClick={() => handleFrequencyChange(key, opt.value)}
                >
                  <Text
                    className={`${styles.frequencyText} ${symptoms[key]?.frequency === opt.value ? styles.frequencyTextActive : ''}`}
                  >
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>☀️ 白天状态</Text>
        {Object.entries(DAYTIME_LABELS).map(([key, label]) => (
          <View key={key} className={styles.daytimeItem}>
            <Text className={styles.daytimeName}>{label}</Text>
            <Text className={styles.symptomDesc}>{DAYTIME_DESCRIPTIONS[key]}</Text>
            <View className={styles.daytimeRow}>
              {DAYTIME_OPTIONS.map(opt => (
                <View
                  key={opt.value}
                  className={`${styles.daytimeOption} ${daytime[key] === opt.value ? styles.daytimeOptionActive : ''}`}
                  onClick={() => handleDaytimeChange(key, opt.value)}
                >
                  <Text
                    className={`${styles.daytimeText} ${daytime[key] === opt.value ? styles.daytimeTextActive : ''}`}
                  >
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>📝 备注</Text>
        <Textarea
          className={styles.notesInput}
          placeholder="记录宝贝今天特别的表现，比如：鼻塞严重、换了新枕头..."
          value={notes}
          onInput={e => setNotes(e.detail.value)}
          maxlength={500}
        />
      </View>

      <View className={styles.saveBtn} onClick={handleSave}>
        <Text className={styles.saveBtnText}>保存今晚的观察</Text>
      </View>
    </View>
  );
};

export default ObservePage;
