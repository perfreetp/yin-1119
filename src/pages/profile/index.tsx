import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import GrowthChart from '@/components/GrowthChart';
import type { ChildFormData } from '@/types/child';
import { isValidBirthDate } from '@/utils/dateValidator';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const child = useChildStore(state => state.child);
  const setChild = useChildStore(state => state.setChild);
  const addHeight = useChildStore(state => state.addHeight);
  const deleteHeightRecord = useChildStore(state => state.deleteHeightRecord);
  const addWeight = useChildStore(state => state.addWeight);
  const deleteWeightRecord = useChildStore(state => state.deleteWeightRecord);
  const addPhoto = useChildStore(state => state.addPhoto);
  const getAgeText = useChildStore(state => state.getAgeText);

  const [formData, setFormData] = useState<ChildFormData>({
    name: child?.name || '',
    gender: child?.gender || 'male',
    birthDate: child?.birthDate || '',
  });
  const [editFormData, setEditFormData] = useState<ChildFormData>({
    name: child?.name || '',
    gender: child?.gender || 'male',
    birthDate: child?.birthDate || '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [heightValue, setHeightValue] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [photoSaving, setPhotoSaving] = useState(false);
  const [showHeightHistory, setShowHeightHistory] = useState(false);
  const [showWeightHistory, setShowWeightHistory] = useState(false);

  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate,
      });
      setEditFormData({
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate,
      });
    }
  }, [child?.id]);

  const handleSaveChild = () => {
    const name = formData.name.trim();
    if (!name) {
      Taro.showToast({ title: '请输入宝贝昵称', icon: 'none' });
      return;
    }
    const dateStr = formData.birthDate.trim();
    if (!dateStr) {
      Taro.showToast({ title: '请输入出生日期', icon: 'none' });
      return;
    }
    if (!isValidBirthDate(dateStr)) {
      Taro.showToast({
        title: '请输入真实日期，如2020-06-15',
        icon: 'none',
        duration: 2500,
      });
      return;
    }
    setChild({ name, gender: formData.gender, birthDate: dateStr });
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleOpenEdit = () => {
    if (!child) return;
    setEditFormData({
      name: child.name,
      gender: child.gender,
      birthDate: child.birthDate,
    });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    const name = editFormData.name.trim();
    if (!name) {
      Taro.showToast({ title: '请输入宝贝昵称', icon: 'none' });
      return;
    }
    const dateStr = editFormData.birthDate.trim();
    let finalDate = child?.birthDate || '';
    if (dateStr) {
      if (!isValidBirthDate(dateStr)) {
        Taro.showToast({
          title: '请输入真实日期，如2020-06-15',
          icon: 'none',
          duration: 2500,
        });
        return;
      }
      finalDate = dateStr;
    }
    setChild({
      name,
      gender: editFormData.gender,
      birthDate: finalDate,
    });
    setShowEditModal(false);
    Taro.showToast({ title: '已更新', icon: 'success' });
  };

  const handleEditDateChange = () => {
    Taro.showModal({
      title: '修改出生日期',
      editable: true,
      placeholderText: '如：2020-06-15',
      content: editFormData.birthDate,
      success: (res) => {
        if (res.confirm) {
          const val = (res.content || '').trim();
          if (!val) return;
          setEditFormData(prev => ({ ...prev, birthDate: val }));
        }
      },
    });
  };

  const handleAddHeight = () => {
    if (!child) {
      Taro.showToast({ title: '请先保存宝贝信息', icon: 'none' });
      return;
    }
    const val = parseFloat(heightValue);
    if (isNaN(val) || val <= 0) {
      Taro.showToast({ title: '请输入有效身高', icon: 'none' });
      return;
    }
    if (val < 20 || val > 250) {
      Taro.showToast({ title: '身高请在20-250cm之间', icon: 'none' });
      return;
    }
    addHeight(val);
    setHeightValue('');
    Taro.showToast({ title: '记录成功', icon: 'success' });
  };

  const handleAddWeight = () => {
    if (!child) {
      Taro.showToast({ title: '请先保存宝贝信息', icon: 'none' });
      return;
    }
    const val = parseFloat(weightValue);
    if (isNaN(val) || val <= 0) {
      Taro.showToast({ title: '请输入有效体重', icon: 'none' });
      return;
    }
    if (val < 1 || val > 200) {
      Taro.showToast({ title: '体重请在1-200kg之间', icon: 'none' });
      return;
    }
    addWeight(val);
    setWeightValue('');
    Taro.showToast({ title: '记录成功', icon: 'success' });
  };

  const handleDeleteHeight = (index: number) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条身高记录吗？',
      success: (res) => {
        if (res.confirm) {
          deleteHeightRecord(index);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleDeleteWeight = (index: number) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条体重记录吗？',
      success: (res) => {
        if (res.confirm) {
          deleteWeightRecord(index);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleChoosePhoto = async () => {
    if (!child) {
      Taro.showToast({ title: '请先保存宝贝信息', icon: 'none' });
      return;
    }
    if (photoSaving) return;
    try {
      setPhotoSaving(true);
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      const uri = (res.tempFilePaths && res.tempFilePaths[0]) ||
                  ((res as any).tempFiles?.[0]?.path) || '';
      if (!uri) {
        Taro.showToast({ title: '获取照片失败', icon: 'none' });
        return;
      }
      await addPhoto({
        id: Date.now().toString(),
        uri,
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      Taro.showToast({ title: '照片已保存', icon: 'success' });
    } catch (err) {
      if (err && (err as any).errMsg && (err as any).errMsg.indexOf('cancel') !== -1) {
        return;
      }
      console.error('[Profile] 选择照片失败', err);
      Taro.showToast({ title: '保存照片失败', icon: 'none' });
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleDateChange = () => {
    Taro.showModal({
      title: '出生日期',
      editable: true,
      placeholderText: '如：2020-06-15',
      content: formData.birthDate,
      success: (res) => {
        if (res.confirm) {
          const val = (res.content || '').trim();
          if (!val) return;
          setFormData(prev => ({ ...prev, birthDate: val }));
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
          <View className={styles.editBtn} onClick={handleOpenEdit}>
            <Text className={styles.editBtnText}>编辑资料</Text>
          </View>
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
              maxlength={20}
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
            {formData.birthDate && !isValidBirthDate(formData.birthDate) && (
              <Text className={styles.formError}>请输入真实日期，格式 2020-06-15，不能是未来</Text>
            )}
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

      {child && (
        <View className={styles.measureSection}>
          <View className={styles.measureCard}>
            <View className={styles.measureHeader}>
              <Text className={styles.measureTitle}>📏 身高记录</Text>
              <Text
                className={styles.historyToggle}
                onClick={() => setShowHeightHistory(!showHeightHistory)}>
                {showHeightHistory ? '收起' : '查看历史'}
              </Text>
            </View>
            <View className={styles.measureInputRow}>
              <Input
                className={styles.measureInput}
                type="digit"
                placeholder="输入身高"
                value={heightValue}
                onInput={e => setHeightValue(e.detail.value)}
                maxlength={6}
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

            {showHeightHistory && child.heightHistory.length > 0 && (
              <View className={styles.historyList}>
                {[...child.heightHistory].reverse().map((record, idx) => {
                  const originalIndex = child.heightHistory.length - 1 - idx;
                  return (
                    <View key={originalIndex} className={styles.historyItem}>
                      <View className={styles.historyItemLeft}>
                        <Text className={styles.historyValue}>{record.value} cm</Text>
                        <Text className={styles.historyDate}>{record.date}</Text>
                      </View>
                      <Text
                        className={styles.deleteLink}
                        onClick={() => handleDeleteHeight(originalIndex)}>
                        删除
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {showHeightHistory && child.heightHistory.length === 0 && (
              <Text className={styles.noHistoryText}>还没有身高记录~</Text>
            )}

            <GrowthChart data={child.heightHistory} type="height" unit="cm" />
          </View>
        </View>
      )}

      {child && (
        <View className={styles.measureSection}>
          <View className={styles.measureCard}>
            <View className={styles.measureHeader}>
              <Text className={styles.measureTitle}>⚖️ 体重记录</Text>
              <Text
                className={styles.historyToggle}
                onClick={() => setShowWeightHistory(!showWeightHistory)}>
                {showWeightHistory ? '收起' : '查看历史'}
              </Text>
            </View>
            <View className={styles.measureInputRow}>
              <Input
                className={styles.measureInput}
                type="digit"
                placeholder="输入体重"
                value={weightValue}
                onInput={e => setWeightValue(e.detail.value)}
                maxlength={6}
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

            {showWeightHistory && child.weightHistory.length > 0 && (
              <View className={styles.historyList}>
                {[...child.weightHistory].reverse().map((record, idx) => {
                  const originalIndex = child.weightHistory.length - 1 - idx;
                  return (
                    <View key={originalIndex} className={styles.historyItem}>
                      <View className={styles.historyItemLeft}>
                        <Text className={styles.historyValue}>{record.value} kg</Text>
                        <Text className={styles.historyDate}>{record.date}</Text>
                      </View>
                      <Text
                        className={styles.deleteLink}
                        onClick={() => handleDeleteWeight(originalIndex)}>
                        删除
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {showWeightHistory && child.weightHistory.length === 0 && (
              <Text className={styles.noHistoryText}>还没有体重记录~</Text>
            )}

            <GrowthChart data={child.weightHistory} type="weight" unit="kg" />
          </View>
        </View>
      )}

      {child && (
        <View className={styles.photoSection}>
          <View className={styles.photoCard}>
            <Text className={styles.photoTitle}>📸 照片留存</Text>
            <Text className={styles.photoDesc}>
              记录宝贝的日常状态，方便和医生沟通
            </Text>
            <View className={`${styles.photoBtn} ${photoSaving ? styles.photoBtnDisabled : ''}`} onClick={handleChoosePhoto}>
              <Text className={styles.photoBtnText}>
                {photoSaving ? '保存中...' : '+ 拍照或选择照片'}
              </Text>
            </View>
            <View className={styles.photoList}>
              {child.photos.slice(0, 9).map(photo => (
                <View key={photo.id} className={styles.photoItem}>
                  <Image
                    className={styles.photoImg}
                    src={photo.uri}
                    mode="aspectFill"
                    onError={e => console.error('[Profile] 图片加载失败', photo.uri, e)}
                  />
                </View>
              ))}
              {child.photos.length === 0 && (
                <Text className={styles.photoEmpty}>还没有照片，快来添加第一张吧~</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {showEditModal && child && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
          <View className={styles.modalHeader}>
            <Text className={styles.modalTitle}>编辑宝贝信息</Text>
            <Text className={styles.modalClose} onClick={() => setShowEditModal(false)}>
              ✕
            </Text>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>宝贝昵称</Text>
            <Input
              className={styles.formInput}
              placeholder="给宝贝取个昵称"
              value={editFormData.name}
              onInput={e => setEditFormData(prev => ({ ...prev, name: e.detail.value }))}
              maxlength={20}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>性别</Text>
            <View className={styles.genderRow}>
              <View
                className={`${styles.genderOption} ${editFormData.gender === 'male' ? styles.genderOptionActive : ''}`}
                onClick={() => setEditFormData(prev => ({ ...prev, gender: 'male' }))}
              >
                <Text className={styles.genderText}>👦 男孩</Text>
              </View>
              <View
                className={`${styles.genderOption} ${editFormData.gender === 'female' ? styles.genderOptionActive : ''}`}
                onClick={() => setEditFormData(prev => ({ ...prev, gender: 'female' }))}
              >
                <Text className={styles.genderText}>👧 女孩</Text>
              </View>
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>出生日期</Text>
            <View className={styles.formInput} onClick={handleEditDateChange}>
              <Text style={{ color: editFormData.birthDate ? '#2D3748' : '#8E9AAB', fontSize: '28rpx' }}>
                {editFormData.birthDate || '请输入，如 2020-06-15'}
              </Text>
            </View>
            {editFormData.birthDate && !isValidBirthDate(editFormData.birthDate) && (
              <Text className={styles.formError}>请输入真实日期，格式 2020-06-15，不能是未来</Text>
            )}
          </View>

          <View className={styles.modalBtnRow}>
            <View className={styles.modalCancelBtn} onClick={() => setShowEditModal(false)}>
              <Text className={styles.modalCancelBtnText}>取消</Text>
            </View>
            <View className={styles.modalConfirmBtn} onClick={handleEditSave}>
              <Text className={styles.modalConfirmBtnText}>保存</Text>
            </View>
          </View>
        </View>
      </View>
      )}
    </View>
  );
};

export default ProfilePage;
