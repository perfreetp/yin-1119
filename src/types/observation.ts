export type FrequencyLevel = 'none' | 'occasional' | 'frequent' | 'constant';

export type DaytimeLevel = 'good' | 'normal' | 'poor' | 'very_poor';

export interface SymptomRecord {
  present: boolean;
  frequency: FrequencyLevel;
}

export interface NightObservation {
  id: string;
  childId: string;
  date: string;
  snoring: SymptomRecord;
  mouthBreathing: SymptomRecord;
  drooling: SymptomRecord;
  tossing: SymptomRecord;
  nightWaking: SymptomRecord;
  daytimeAttention: DaytimeLevel;
  daytimeEnergy: DaytimeLevel;
  daytimeMood: DaytimeLevel;
  notes: string;
  createdAt: string;
}

export interface ObservationFormData {
  date: string;
  snoring: SymptomRecord;
  mouthBreathing: SymptomRecord;
  drooling: SymptomRecord;
  tossing: SymptomRecord;
  nightWaking: SymptomRecord;
  daytimeAttention: DaytimeLevel;
  daytimeEnergy: DaytimeLevel;
  daytimeMood: DaytimeLevel;
  notes: string;
}

export const FREQUENCY_OPTIONS: { value: FrequencyLevel; label: string }[] = [
  { value: 'none', label: '没有' },
  { value: 'occasional', label: '偶尔' },
  { value: 'frequent', label: '经常' },
  { value: 'constant', label: '总是' },
];

export const DAYTIME_OPTIONS: { value: DaytimeLevel; label: string }[] = [
  { value: 'good', label: '很好' },
  { value: 'normal', label: '一般' },
  { value: 'poor', label: '较差' },
  { value: 'very_poor', label: '很差' },
];

export const SYMPTOM_LABELS: Record<string, string> = {
  snoring: '打鼾',
  mouthBreathing: '张口呼吸',
  drooling: '流口水',
  tossing: '夜间翻动',
  nightWaking: '憋醒',
};

export const DAYTIME_LABELS: Record<string, string> = {
  daytimeAttention: '白天注意力',
  daytimeEnergy: '白天精神',
  daytimeMood: '白天情绪',
};
