import React, { useState } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import GrowthChart from '@/components/GrowthChart';
import type { ChildFormData } from '@/types/child';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const setChild = useChildStore(state => state.setChild);
  const addHeight = useChildStore(state => state.addHeight);
  const addWeight = useChildStore(state => state.addWeight);
  const addPhoto = useChildStore(state => state.addPhoto);
  const getAgeText = useChildStore(state => state.getAgeText);

  const [formData, setFormData] = useState<ChildFormData>({
    name: child?.name || '',
    gender: child?.gender || 'male',
    birthDate: child?.birthDate || '',
  });
  const [heightValue, setHeightValue] = useState('');
  const [weightValue, setWeightValue] = useState('');

  const handleSaveChild = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入宝贝昵称', icon: 'none' });
      return;
    }
    if (!formData.birthDate) {
      Taro.showToast({ title: '请选择出生日期', icon: 'none' });
      return;
    }
    setChild(formData);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleAddHeight = () => {
    const val = parseFloat(heightValue);
    if (isNaN(val) || val <= 0) {
      Taro.showToast({ title: '请输入有效身高', icon: 'none' });
      return;
    }
    addHeight(val);
    setHeightValue('');
    Taro.showToast({ title: '记录成功', icon: 'success' });
  };

  const handleAddWeight = () => {
    const val = parseFloat(weightValue);
    if (isNaN(val) || val <= 0) {
      Taro.showToast({ title: '请输入有效体重', icon: 'none' });
      return;
    }
    addWeight(val);
    setWeightValue('');
    Taro.showToast({ title: '记录成功', icon: 'success' });
  };

  const handleChoosePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      const uri = res.tempFilePaths[0];
      addPhoto({
        id: Date.now().toString(),
        uri,
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      Taro.showToast({ title: '照片已保存', icon: 'success' });
    }).catch(err => {
      console.error('[Profile] 选择照片失败', err);
    });
  };

  const handleDateChange = () => {
    Taro.showModal({
      title: '出生日期',
      editable: true,
      placeholderText: '如：2020-06-15',
      content: formData.birthDate,
      success: (res) => {
        if (res.confirm && res.content) {
          setFormData(prev => ({ ...prev, birthDate: res.content.trim() }));
        }
      },
    });
  };

  const latestHeight = child?.heightHistory?.[child.heightHistory.length - 1];
  const latestWeight = child?.weightHistory?.[child.weightHistory.length - 1];

  return (
    <View className={styles.profilePage}>
      {child && (
        <View className={styles.avatarSection}>
          <View className={styles.avatar}>
            <Text className={styles.avatarEmoji}>
              {child.gender === 'male' ? '👦' : '👧'}
            </Text>
          </View>
          <Text className={styles.avatarName}>{child.name}</Text>
          <Text className={styles.avatarAge}>{getAgeText()}</Text>
        </View>
      )}

      {!child && (
        <View className={styles.setupCard}>
          <Text className={styles.setupTitle}>添加宝贝信息</Text>
          <Text className={styles.setupDesc}>
            先填写宝贝的基本信息，这样我们才能更好地记录和观察哦~
          </Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>宝贝昵称</Text>
            <Input
              className={styles.formInput}
              placeholder="给宝贝取个昵称"
              value={formData.name}
              onInput={e => setFormData(prev => ({ ...prev, name: e.detail.value }))}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>性别</Text>
            <View className={styles.genderRow}>
              <View
                className={`${styles.genderOption} ${formData.gender === 'male' ? styles.genderOptionActive : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
              >
                <Text className={styles.genderText}>👦 男孩</Text>
              </View>
              <View
                className={`${styles.genderOption} ${formData.gender === 'female' ? styles.genderOptionActive : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
              >
                <Text className={styles.genderText}>👧 女孩</Text>
              </View>
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>出生日期</Text>
            <View className={styles.formInput} onClick={handleDateChange}>
              <Text style={{ color: formData.birthDate ? '#2D3748' : '#8E9AAB', fontSize: '28rpx' }}>
                {formData.birthDate || '请输入，如 2020-06-15'}
              </Text>
            </View>
          </View>

          <View className={styles.submitBtn} onClick={handleSaveChild}>
            <Text className={styles.submitBtnText}>保存宝贝信息</Text>
          </View>
        </View>
      )}

      {child && (
        <View className={styles.infoCard}>
          <Text className={styles.infoTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>昵称</Text>
            <Text className={styles.infoValue}>{child.name}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>性别</Text>
            <Text className={styles.infoValue}>{child.gender === 'male' ? '👦 男孩' : '👧 女孩'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>出生日期</Text>
            <Text className={styles.infoValue}>{child.birthDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>年龄</Text>
            <Text className={styles.infoValue}>{getAgeText()}</Text>
          </View>
        </View>
      )}

      <View className={styles.measureSection}>
        <View className={styles.measureCard}>
          <Text className={styles.measureTitle}>📏 身高记录</Text>
          <View className={styles.measureInputRow}>
            <Input
              className={styles.measureInput}
              type="digit"
              placeholder="输入身高"
              value={heightValue}
              onInput={e => setHeightValue(e.detail.value)}
            />
            <Text className={styles.measureUnit}>cm</Text>
            <View className={styles.measureBtn} onClick={handleAddHeight}>
              <Text className={styles.measureBtnText}>记录</Text>
            </View>
          </View>
          {latestHeight && (
            <Text className={styles.latestValue}>
              最近：{latestHeight.value}cm（{latestHeight.date}）
            </Text>
          )}
          <GrowthChart data={child?.heightHistory || []} type="height" unit="cm" />
        </View>
      </View>

      <View className={styles.measureSection}>
        <View className={styles.measureCard}>
          <Text className={styles.measureTitle}>⚖️ 体重记录</Text>
          <View className={styles.measureInputRow}>
            <Input
              className={styles.measureInput}
              type="digit"
              placeholder="输入体重"
              value={weightValue}
              onInput={e => setWeightValue(e.detail.value)}
            />
            <Text className={styles.measureUnit}>kg</Text>
            <View className={styles.measureBtn} onClick={handleAddWeight}>
              <Text className={styles.measureBtnText}>记录</Text>
            </View>
          </View>
          {latestWeight && (
            <Text className={styles.latestValue}>
              最近：{latestWeight.value}kg（{latestWeight.date}）
            </Text>
          )}
          <GrowthChart data={child?.weightHistory || []} type="weight" unit="kg" />
        </View>
      </View>

      <View className={styles.photoSection}>
        <View className={styles.photoCard}>
          <Text className={styles.photoTitle}>📸 照片留存</Text>
          <Text className={styles.photoDesc}>
            记录宝贝的日常状态，方便和医生沟通
          </Text>
          <View className={styles.photoBtn} onClick={handleChoosePhoto}>
            <Text className={styles.photoBtnText}>+ 拍照或选择照片</Text>
          </View>
          {child && child.photos.length > 0 && (
            <View className={styles.photoList}>
              {child.photos.slice(0, 9).map(photo => (
                <View key={photo.id} className={styles.photoItem}>
                  <Image className={styles.photoImg} src={photo.uri} mode="aspectFill" />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProfilePage;
