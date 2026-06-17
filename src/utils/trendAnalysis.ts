import type { NightObservation } from '@/types/observation';
import { SYMPTOM_LABELS } from '@/types/observation';
import dayjs from 'dayjs';

export type TrendDirection = 'up' | 'down' | 'stable' | 'no_data';

export interface SymptomTrend {
  key: string;
  label: string;
  direction: TrendDirection;
  firstHalfAvg: number;
  secondHalfAvg: number;
  totalDays: number;
  hasData: boolean;
  description: string;
}

const FREQUENCY_SCORE: Record<string, number> = {
  none: 0,
  occasional: 1,
  frequent: 2,
  constant: 3,
};

const MAIN_SYMPTOMS = ['snoring', 'mouthBreathing', 'nightWaking', 'tossing', 'drooling'];

export function analyze7DayTrend(observations: NightObservation[]): SymptomTrend[] {
  const sorted = [...observations]
    .filter(o => {
      const diff = dayjs().diff(dayjs(o.date), 'day');
      return diff >= 0 && diff < 7;
    })
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  if (sorted.length === 0) {
    return MAIN_SYMPTOMS.map(key => ({
      key,
      label: SYMPTOM_LABELS[key] || key,
      direction: 'no_data' as TrendDirection,
      firstHalfAvg: 0,
      secondHalfAvg: 0,
      totalDays: 0,
      hasData: false,
      description: '最近7天还没有观察记录',
    }));
  }

  const midPoint = Math.max(1, Math.ceil(sorted.length / 2));
  const firstHalf = sorted.slice(0, midPoint);
  const secondHalf = sorted.slice(midPoint);

  return MAIN_SYMPTOMS.map(key => {
    const firstScore = firstHalf.reduce((sum, o) => sum + FREQUENCY_SCORE[o[key].frequency], 0);
    const secondScore = secondHalf.reduce((sum, o) => sum + FREQUENCY_SCORE[o[key].frequency], 0);
    const firstAvg = firstScore / firstHalf.length;
    const secondAvg = secondScore / secondHalf.length;

    const diff = secondAvg - firstAvg;
    let direction: TrendDirection = 'stable';
    let description = '';

    if (Math.abs(diff) < 0.2) {
      direction = 'stable';
      description = `${SYMPTOM_LABELS[key] || key}没有明显变化`;
    } else if (diff > 0) {
      direction = 'up';
      if (diff > 1.5) description = `${SYMPTOM_LABELS[key] || key}明显变多`;
      else if (diff > 0.5) description = `${SYMPTOM_LABELS[key] || key}有所增加`;
      else description = `${SYMPTOM_LABELS[key] || key}略微增加`;
    } else {
      direction = 'down';
      if (diff < -1.5) description = `${SYMPTOM_LABELS[key] || key}明显减少`;
      else if (diff < -0.5) description = `${SYMPTOM_LABELS[key] || key}有所改善`;
      else description = `${SYMPTOM_LABELS[key] || key}略微减少`;
    }

    return {
      key,
      label: SYMPTOM_LABELS[key] || key,
      direction,
      firstHalfAvg,
      secondHalfAvg,
      totalDays: sorted.length,
      hasData: true,
      description,
    };
  });
}

export function getTrendEmoji(direction: TrendDirection): string {
  switch (direction) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
    default: return '—';
  }
}

export function getTrendTextColor(direction: TrendDirection): string {
  switch (direction) {
    case 'up': return '#E76F6F';
    case 'down': return '#7EC88B';
    case 'stable': return '#6BA3BE';
    default: return '#8E9AAB';
  }
}

export function generateTrendSummary(trends: SymptomTrend[]): string {
  const hasData = trends.some(t => t.hasData);
  if (!hasData) {
    return '最近7天还没有观察记录，今晚开始记录就能看到趋势啦~';
  }

  const notable = trends.filter(t => t.hasData && t.direction !== 'stable' && t.direction !== 'no_data');
  if (notable.length === 0) {
    const hasAny = trends.filter(t => t.hasData && (t.firstHalfAvg > 0 || t.secondHalfAvg > 0));
    if (hasAny.length === 0) {
      return '最近7天宝贝没有观察到明显症状，继续保持哦~';
    }
    return '最近7天宝贝的各项症状整体都比较稳定，继续观察~';
  }

  const upItems = notable.filter(t => t.direction === 'up').map(t => t.label);
  const downItems = notable.filter(t => t.direction === 'down').map(t => t.label);
  const parts: string[] = [];
  if (downItems.length > 0) {
    parts.push(`👍 ${downItems.join('、')}有好转`);
  }
  if (upItems.length > 0) {
    parts.push(`⚠️ ${upItems.join('、')}有增加`);
  }
  return parts.join('，');
}
