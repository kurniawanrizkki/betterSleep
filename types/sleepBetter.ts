// src/types/sleepBetter.ts

export interface SleepDay {
  day: string;
  hours: number;
}

export interface FeatureCardProps {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  isLarge?: boolean;
  onPress?: () => void;
}

export interface MainFeature {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}