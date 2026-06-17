import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { ChildProfile, HeightWeightRecord, PhotoRecord, ChildFormData } from '@/types/child';
import type { NightObservation, ObservationFormData, SymptomRecord } from '@/types/observation';
import type { RiskAssessment, RiskLevel } from '@/types/report';
import { calculateRisk } from '@/utils/riskCalculator';
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
  addWeight: (value: number) => void;
  addPhoto: (photo: PhotoRecord) => void;
  addObservation: (data: ObservationFormData) => void;
  deleteObservation: (id: string) => void;
  calculateAndUpdateRisk: () => void;
  setFollowUpDate: (date: string) => void;
  getAgeText: () => string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function saveToStorage(key: string, data: any): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 保存数据失败', e);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
    return null;
  } catch (e) {
    console.error('[Store] 读取数据失败', e);
    return null;
  }
}

export const useChildStore = create<ChildStore>((set, get) => ({
  child: null,
  observations: [],
  riskAssessment: null,

  loadFromStorage: () => {
    const child = loadFromStorage<ChildProfile>(CHILD_STORAGE_KEY);
    const observations = loadFromStorage<NightObservation[]>(OBSERVATIONS_STORAGE_KEY) || [];
    let riskAssessment: RiskAssessment | null = null;
    if (child && observations.length > 0) {
      riskAssessment = calculateRisk(observations, child);
    }
    set({ child, observations, riskAssessment });
  },

  setChild: (data: ChildFormData) => {
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
    saveToStorage(CHILD_STORAGE_KEY, child);
    set({ child });
  },

  addHeight: (value: number) => {
    const child = get().child;
    if (!child) return;
    const record: HeightWeightRecord = {
      date: dayjs().format('YYYY-MM-DD'),
      value,
    };
    const updated = {
      ...child,
      heightHistory: [...child.heightHistory, record],
    };
    saveToStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  addWeight: (value: number) => {
    const child = get().child;
    if (!child) return;
    const record: HeightWeightRecord = {
      date: dayjs().format('YYYY-MM-DD'),
      value,
    };
    const updated = {
      ...child,
      weightHistory: [...child.weightHistory, record],
    };
    saveToStorage(CHILD_STORAGE_KEY, updated);
    set({ child: updated });
  },

  addPhoto: (photo: PhotoRecord) => {
    const child = get().child;
    if (!child) return;
    const updated = {
      ...child,
      photos: [photo, ...child.photos],
    };
    saveToStorage(CHILD_STORAGE_KEY, updated);
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
    saveToStorage(OBSERVATIONS_STORAGE_KEY, observations);
    const riskAssessment = calculateRisk(observations, child);
    set({ observations, riskAssessment });
  },

  deleteObservation: (id: string) => {
    const observations = get().observations.filter(o => o.id !== id);
    saveToStorage(OBSERVATIONS_STORAGE_KEY, observations);
    const child = get().child;
    const riskAssessment = child && observations.length > 0 ? calculateRisk(observations, child) : null;
    set({ observations, riskAssessment });
  },

  calculateAndUpdateRisk: () => {
    const { child, observations } = get();
    if (!child || observations.length === 0) {
      set({ riskAssessment: null });
      return;
    }
    const riskAssessment = calculateRisk(observations, child);
    set({ riskAssessment });
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
    const birth = dayjs(child.birthDate);
    const now = dayjs();
    const years = now.diff(birth, 'year');
    const months = now.diff(birth.add(years, 'year'), 'month');
    if (years > 0) {
      return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
    }
    return `${months}个月`;
  },
}));
