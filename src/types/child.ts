export interface ChildProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  heightHistory: HeightWeightRecord[];
  weightHistory: HeightWeightRecord[];
  photos: PhotoRecord[];
}

export interface HeightWeightRecord {
  date: string;
  value: number;
}

export interface PhotoRecord {
  id: string;
  uri: string;
  date: string;
  note: string;
}

export interface ChildFormData {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
}
