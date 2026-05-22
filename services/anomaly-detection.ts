import { MoodCheckin } from '@/types';

export interface AnomalyAlert {
  isAnomaly: boolean;
  severity: 'none' | 'warning' | 'critical';
  message: string;
  suggestAction: boolean;
}

export class AnomalyDetectionService {
  /**
   * Simulates an Isolation Forest / emotional pattern anomaly detector.
   * Triggers an alert if:
   * 1. A sudden drop in mood occurs (drop of >= 4 points in consecutive days).
   * 2. Chronic low mood is observed (average mood <= 3 over the last 3 check-ins).
   */
  static analyzeMoodTrends(history: MoodCheckin[]): AnomalyAlert {
    if (history.length < 2) {
      return {
        isAnomaly: false,
        severity: 'none',
        message: 'Need more history to analyze emotional trends.',
        suggestAction: false
      };
    }

    // Sort history chronologically (latest last)
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    // Check for sudden drop anomaly
    const suddenDrop = previous.value - latest.value;
    if (suddenDrop >= 4) {
      return {
        isAnomaly: true,
        severity: 'warning',
        message: `We noticed a sudden drop in your mood rating (down by ${suddenDrop} points). Remember that fluctuations are natural, but we're here to help you slow down.`,
        suggestAction: true
      };
    }

    // Check for chronic low mood (last 3 items)
    if (sorted.length >= 3) {
      const lastThree = sorted.slice(-3);
      const avgMood = lastThree.reduce((sum, item) => sum + item.value, 0) / 3;
      
      if (avgMood <= 3.5) {
        return {
          isAnomaly: true,
          severity: 'critical',
          message: 'Your recent mood check-ins have been consistently low. We highly recommend talking to a counselor or checking out our emergency resources in the footer.',
          suggestAction: true
        };
      }
    }

    return {
      isAnomaly: false,
      severity: 'none',
      message: 'Emotional trends look stable and normal.',
      suggestAction: false
    };
  }
}
