export type RiskLevel = 'low' | 'medium' | 'high';

export interface SymptomAnalysis {
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  frequency: number;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  maxScore: number;
  symptoms: SymptomAnalysis[];
  recommendations: string[];
  followUpDate: string | null;
  assessedAt: string;
}

export interface ShareReport {
  childName: string;
  assessmentDate: string;
  riskLevel: RiskLevel;
  score: number;
  maxScore: number;
  topSymptoms: string[];
  recommendations: string[];
  followUpDate: string | null;
}

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; description: string }> = {
  low: {
    label: '低风险',
    color: '#7EC88B',
    description: '宝贝目前睡眠状况良好，继续保持观察哦~',
  },
  medium: {
    label: '中等风险',
    color: '#F5C542',
    description: '宝贝有一些需要注意的信号，建议持续观察并考虑咨询医生',
  },
  high: {
    label: '较高风险',
    color: '#E76F6F',
    description: '宝贝出现了较多值得关注的表现，建议尽快带孩子去看医生',
  },
};
