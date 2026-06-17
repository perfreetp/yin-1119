import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface ShareButtonProps {
  childName: string;
  riskLevel: string;
  date: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ childName, riskLevel, date }) => {
  const handleShare = () => {
    const message = `【宝贝睡眠观察报告】\n宝贝：${childName}\n观察日期：${date}\n风险等级：${riskLevel}\n\n此报告由"宝贝睡眠观察"小程序生成，请关注宝贝的睡眠健康。`;

    Taro.showActionSheet({
      itemList: ['复制到剪贴板', '分享给另一位监护人'],
    }).then(res => {
      if (res.tapIndex === 0) {
        Taro.setClipboardData({
          data: message,
          success: () => {
            Taro.showToast({ title: '已复制', icon: 'success' });
          },
        });
      } else if (res.tapIndex === 1) {
        Taro.showModal({
          title: '分享给另一位监护人',
          content: '请将复制的报告内容发送给另一位监护人，共同关注宝贝的睡眠健康。',
          confirmText: '复制内容',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.setClipboardData({ data: message });
            }
          },
        });
      }
    }).catch(err => {
      console.error('[ShareButton] 分享操作失败', err);
    });
  };

  return (
    <View className={styles.container}>
      <Button className={styles.button} onClick={handleShare}>
        <Text className={styles.buttonText}>分享报告给另一位监护人</Text>
      </Button>
    </View>
  );
};

export default ShareButton;
