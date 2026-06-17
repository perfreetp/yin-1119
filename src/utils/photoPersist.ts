import Taro from '@tarojs/taro';

const FILE_PREFIX = 'sleep_observer_photo_';

export async function persistPhotoToLocal(tempPath: string): Promise<string> {
  try {
    if (process.env.TARO_ENV === 'h5' || !tempPath) {
      return tempPath;
    }
    const extMatch = /\.[a-zA-Z0-9]+$/.exec(tempPath);
    const ext = extMatch ? extMatch[0] : '.jpg';
    const fs = Taro.getFileSystemManager
      ? Taro.getFileSystemManager()
      : (Taro as any).getFileSystemManager && (Taro as any).getFileSystemManager();
    if (!fs || !fs.saveFileSync) {
      return tempPath;
    }
    const USER_DATA_PATH = (Taro.env && Taro.env.USER_DATA_PATH) || '';
    if (!USER_DATA_PATH) {
      return tempPath;
    }
    const fileName = FILE_PREFIX + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext;
    const targetPath = `${USER_DATA_PATH}/${fileName}`;
    try {
      fs.saveFileSync(tempPath, targetPath);
      return targetPath;
    } catch (err) {
      console.warn('[PhotoPersist] saveFileSync failed, fallback to temp path', err);
      return tempPath;
    }
  } catch (e) {
    console.error('[PhotoPersist] 保存照片失败', e);
    return tempPath;
  }
}
