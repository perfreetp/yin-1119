import type { NightObservation, FrequencyLevel, DaytimeLevel } from '@/types/observation';
import type { ChildProfile } from '@/types/child';
import type { RiskAssessment, RiskLevel, SymptomAnalysis } from '@/types/report';

const FREQUENCY_SCORES: Record<FrequencyLevel, number> = {
  none: 0,
  occasional: 1,
  frequent: 2,
  constant: 3,
};

const DAYTIME_SCORES: Record<DaytimeLevel, number> = {
  good: 0,
  normal: 1,
  poor: 2,
  very_poor: 3,
};

function getSeverity(frequency: FrequencyLevel): SymptomAnalysis['severity'] {
  if (frequency === 'none') return 'none';
  if (frequency === 'occasional') return 'mild';
  if (frequency === 'frequent') return 'moderate';
  return 'severe';
}

export function calculateRisk(observations: NightObservation[], _child: ChildProfile): RiskAssessment {
  const recent = observations.slice(0, 7);
  let totalScore = 0;
  const maxScore = 30;

  const symptomKeys = ['snoring', 'mouthBreathing', 'drooling', 'tossing', 'nightWaking'] as const;
  const symptoms: SymptomAnalysis[] = [];

  for (const key of symptomKeys) {
    let maxFrequency: FrequencyLevel = 'none';
    for (const obs of recent) {
      if (FREQUENCY_SCORES[obs[key].frequency] > FREQUENCY_SCORES[maxFrequency]) {
        maxFrequency = obs[key].frequency;
      }
    }
    const freqScore = FREQUENCY_SCORES[maxFrequency];
    totalScore += freqScore;
    symptoms.push({
      name: key,
      severity: getSeverity(maxFrequency),
      frequency: freqScore,
    });
  }

  const daytimeKeys = ['daytimeAttention', 'daytimeEnergy', 'daytimeMood'] as const;
  for (const key of daytimeKeys) {
    let worstLevel: DaytimeLevel = 'good';
    for (const obs of recent) {
      if (DAYTIME_SCORES[obs[key]] > DAYTIME_SCORES[worstLevel]) {
        worstLevel = obs[key];
      }
    }
    const dtScore = Math.min(DAYTIME_SCORES[worstLevel], 2);
    totalScore += dtScore;
    symptoms.push({
      name: key,
      severity: getSeverity(worstLevel === 'good' ? 'none' : worstLevel === 'normal' ? 'none' : worstLevel === 'poor' ? 'frequent' : 'constant'),
      frequency: dtScore,
    });
  }

  let level: RiskLevel;
  if (totalScore <= 5) {
    level = 'low';
  } else if (totalScore <= 12) {
    level = 'medium';
  } else {
    level = 'high';
  }

  const recommendations = generateRecommendations(level, symptoms);

  return {
    level,
    score: totalScore,
    maxScore,
    symptoms,
    recommendations,
    followUpDate: level !== 'low' ? getDefaultFollowUpDate(level) : null,
    assessedAt: new Date().toISOString(),
  };
}

function getDefaultFollowUpDate(level: RiskLevel): string {
  const now = new Date();
  if (level === 'high') {
    now.setDate(now.getDate() + 7);
  } else {
    now.setDate(now.getDate() + 14);
  }
  return now.toISOString().split('T')[0];
}

function generateRecommendations(level: RiskLevel, symptoms: SymptomAnalysis[]): string[] {
  const recs: string[] = [];

  if (level === 'low') {
    recs.push('继续保持每晚观察宝贝的睡眠情况');
    recs.push('记录宝贝的身高体重变化，关注成长趋势');
    return recs;
  }

  const hasSnoring = symptoms.find(s => s.name === 'snoring' && s.severity !== 'none');
  const hasMouthBreathing = symptoms.find(s => s.name === 'mouthBreathing' && s.severity !== 'none');
  const hasTossing = symptoms.find(s => s.name === 'tossing' && s.severity !== 'none');
  const hasNightWaking = symptoms.find(s => s.name === 'nightWaking' && s.severity !== 'none');
  const hasDaytimeIssues = symptoms.some(s =>
    ['daytimeAttention', 'daytimeEnergy', 'daytimeMood'].includes(s.name) && s.severity !== 'none'
  );

  if (hasSnoring) {
    recs.push('宝贝睡觉时有打鼾的情况，可以尝试让宝贝侧睡，观察是否改善');
  }
  if (hasMouthBreathing) {
    recs.push('宝贝睡觉时张嘴呼吸，可以留意宝贝白天是否也有用嘴呼吸的习惯');
  }
  if (hasTossing) {
    recs.push('宝贝夜间翻动较多，注意观察卧室温度和被子是否合适');
  }
  if (hasNightWaking) {
    recs.push('宝贝有憋醒的情况，这是比较重要的信号，建议咨询儿科医生');
  }
  if (hasDaytimeIssues) {
    recs.push('宝贝白天精神状态不佳，可能和夜间睡眠质量有关，建议持续关注');
  }

  if (level === 'high') {
    recs.push('建议尽快带宝贝去儿科或耳鼻喉科做一次详细检查');
    recs.push('医生可能会检查宝贝的扁桃体和腺样体大小');
    recs.push('带齐观察记录去看医生，能帮助医生更快了解宝贝的情况');
  } else {
    recs.push('如果这些情况持续2周以上，建议带宝贝咨询儿科医生');
    recs.push('定期记录可以帮助医生更好地判断宝贝的情况');
  }

  return recs;
}
