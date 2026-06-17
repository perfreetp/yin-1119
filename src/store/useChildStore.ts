import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { ChildProfile, HeightWeightRecord, PhotoRecord, ChildFormData } from '@/types/child';
import type { NightObservation, ObservationFormData } from '@/types/observation';
import type { RiskAssessment } from '@/types/report';
import { calculateRisk } from '@/utils/riskCalculator';
import { isValidBirthDate } from '@/utils/dateValidator';
import { persistPhotoToLocal } from '@/utils/photoPersist';
import dayjs from 'dayjs';

const CHILD_STORAGE_KEY = 'sleep_observer_child';
const OBSERVATIONS_STORAGE_KEY = 'sleep_observer_observations';

interface ChildStore {
  child: ChildProfile | null;
  observations: NightObservation[];
  riskAssessment: RiskAssessment | null;

  loadFromStorage: () => void;
  setChild: (data: ChildFormData) => void;
  addHeight: (value: number) => void;
  deleteHeightRecord: (index: number) => void;
  addWeight: (value: number) => void;
  deleteWeightRecord: (index: number) => void;
  addPhoto: (photo: PhotoRecord) => Promise<void>;
  addObservation: (data: ObservationFormData) => void;
  deleteObservation: (id: string) => void;
  calculateAndUpdateRisk: () => void;
  setFollowUpDate: (date: string) => void;
  getAgeText: () => string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function safeSetStorage(key: string, data: any): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 保存数据失败', e);
  }
}

function safeGetStorage<T>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(key);
    if (!raw || typeof raw !== 'string') {
      if (typeof raw === 'object' && raw !== null) {
        return raw as T;
      }
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error('[Store] 读取数据失败', e);
    return null;
  }
}

function emptyChild(): ChildProfile {
  return {
    id: '',
    name: '',
    gender: 'male',
    birthDate: '',
    heightHistory: [],
    weightHistory: [],
    photos: [],
  };
}

function isChildProfileValid(c: any): c is ChildProfile {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.id !== 'string' || !c.id) return false;
  if (typeof c.name !== 'string' || !c.name) return false;
  if (c.gender !== 'male' && c.gender !== 'female') return false;
  if (!isValidBirthDate(c.birthDate)) return false;
  if (!Array.isArray(c.heightHistory)) return false;
  if (!Array.isArray(c.weightHistory)) return false;
  if (!Array.isArray(c.photos)) return false;
  return true;
}

export const useChildStore = create<ChildStore>((set, get) => ({
  child: null,
  observations: [],
  riskAssessment: null,

  loadFromStorage: () => {
    const rawChild = safeGetStorage<any>(CHILD_STORAGE_KEY);
    const rawObs = safeGetStorage<any[]>(OBSERVATIONS_STORAGE_KEY);
    const child: ChildProfile | null = isChildProfileValid(rawChild) ? { ...emptyChild(), ...rawChild } : null;
    const observations: NightObservation[] = Array.isArray(rawObs) ? rawObs as NightObservation[] : [];
    let riskAssessment: RiskAssessment | null = null;
    if (child && observations.length > 0) {
      try {
        riskAssessment = calculateRisk(observations, child);
      } catch (e) {
        console.error('[Store] 风险评估失败', e);
        riskAssessment = null;
      }
    }
    set({ child, observations, riskAssessment });
  },

  setChild: (data: ChildFormData) => {
    if (!isValidBirthDate(data.birthDate)) {
      return;
    }
    const existing = get().child;
    const child: ChildProfile = {
      id: existing?.id || generateId(),
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate,
      heightHistory: existing?.heightHistory || [],
      weightHistory: existing?.weightHistory || [],
      photos: existing?.photos || [],
    };
    safeSetStorage(CHILD_STORAGE_KEY, child);
    set({ child });
    get().calculateAndUpdateRisk();
  },

  addHeight: (value: number) => {
    const child = get().child;
    if (!child) return;
    const record: HeightWeightRecord = {
      date: dayjs().format('YYYY-MM-DD'),
      value,
    };
    const updated: ChildProfile = {
      ...child,
      heightHistory: [...child.heightHistory, record],
    };
    safeSetStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  deleteHeightRecord: (index: number) => {
    const child = get().child;
    if (!child || index < 0 || index >= child.heightHistory.length) return;
    const updated: ChildProfile = {
      ...child,
      heightHistory: child.heightHistory.filter((_, i) => i !== index),
    };
    safeSetStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  addWeight: (value: number) => {
    const child = get().child;
    if (!child) return;
    const record: HeightWeightRecord = {
      date: dayjs().format('YYYY-MM-DD'),
      value,
    };
    const updated: ChildProfile = {
      ...child,
      weightHistory: [...child.weightHistory, record],
    };
    safeSetStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  deleteWeightRecord: (index: number) => {
    const child = get().child;
    if (!child || index < 0 || index >= child.weightHistory.length) return;
    const updated: ChildProfile = {
      ...child,
      weightHistory: child.weightHistory.filter((_, i) => i !== index),
    };
    safeSetStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  addPhoto: async (photo: PhotoRecord) => {
    const child = get().child;
    if (!child) return;
    let persistedUri = photo.uri;
    try {
      persistedUri = await persistPhotoToLocal(photo.uri);
    } catch (e) {
      console.error('[Store] 照片持久化失败，使用原路径', e);
    }
    const record: PhotoRecord = { ...photo, uri: persistedUri };
    const updated: ChildProfile = {
      ...child,
      photos: [record, ...child.photos],
    };
    safeSetStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  addObservation: (data: ObservationFormData) => {
    const child = get().child;
    if (!child) return;
    const observation: NightObservation = {
      id: generateId(),
      childId: child.id,
      date: data.date,
      snoring: data.snoring,
      mouthBreathing: data.mouthBreathing,
      drooling: data.drooling,
      tossing: data.tossing,
      nightWaking: data.nightWaking,
      daytimeAttention: data.daytimeAttention,
      daytimeEnergy: data.daytimeEnergy,
      daytimeMood: data.daytimeMood,
      notes: data.notes,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    };
    const observations = [observation, ...get().observations];
    safeSetStorage(OBSERVATIONS_STORAGE_KEY, observations);
    let riskAssessment: RiskAssessment | null = null;
    try {
      riskAssessment = calculateRisk(observations, child);
    } catch (e) {
      console.error('[Store] 风险评估失败', e);
    }
    set({ observations, riskAssessment });
  },

  deleteObservation: (id: string) => {
    const observations = get().observations.filter(o => o.id !== id);
    safeSetStorage(OBSERVATIONS_STORAGE_KEY, observations);
    const child = get().child;
    let riskAssessment: RiskAssessment | null = null;
    if (child && observations.length > 0) {
      try {
        riskAssessment = calculateRisk(observations, child);
      } catch (e) {
        console.error('[Store] 风险评估失败', e);
      }
    }
    set({ observations, riskAssessment });
  },

  calculateAndUpdateRisk: () => {
    const { child, observations } = get();
    if (!child || observations.length === 0) {
      set({ riskAssessment: null });
      return;
    }
    try {
      const riskAssessment = calculateRisk(observations, child);
      set({ riskAssessment });
    } catch (e) {
      console.error('[Store] 风险评估失败', e);
      set({ riskAssessment: null });
    }
  },

  setFollowUpDate: (date: string) => {
    const riskAssessment = get().riskAssessment;
    if (!riskAssessment) return;
    const updated = { ...riskAssessment, followUpDate: date };
    set({ riskAssessment: updated });
  },

  getAgeText: () => {
    const child = get().child;
    if (!child) return '';
    if (!isValidBirthDate(child.birthDate)) {
      return '出生日期不正确';
    }
    const birth = dayjs(child.birthDate);
    const now = dayjs();
    const years = now.diff(birth, 'year');
    const afterYears = birth.add(years, 'year');
    const months = now.diff(afterYears, 'month');
    const safeYears = Math.max(0, years);
    const safeMonths = Math.max(0, Math.min(11, months));
    if (safeYears > 0) {
      return safeMonths > 0 ? `${safeYears}岁${safeMonths}个月` : `${safeYears}岁`;
    }
    return `${safeMonths}个月`;
  },
}));
