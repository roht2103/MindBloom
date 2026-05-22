export class MoodScoringEngine {
  /**
   * Calculates a stress score between 1 and 10.
   * 1 = Very Calm, 10 = Severe Stress
   * Formula factors in:
   * - Mood (lower mood increases stress)
   * - Sleep (insufficient sleep increases stress)
   * - Focus (poor focus correlates with high stress/anxiety)
   */
  static calculateStressLevel(moodValue: number, sleepHours: number, focusScore: number): number {
    // Standardize variables (1-10 scale)
    const moodFactor = 10 - moodValue; // Lower mood = Higher stress contribution
    const sleepFactor = sleepHours >= 8 ? 0 : sleepHours <= 4 ? 10 : (8 - sleepHours) * 2.5; // Less than 8 hours = Higher stress contribution
    const focusFactor = 10 - focusScore; // Lower focus = Higher stress contribution
    
    // Weighted combination: Mood (40%), Sleep (35%), Focus (25%)
    const rawScore = (moodFactor * 0.4) + (sleepFactor * 0.35) + (focusFactor * 0.25);
    
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, Math.round(rawScore)));
  }

  /**
   * Returns a friendly description of the stress level
   */
  static getStressDescription(stressLevel: number): string {
    if (stressLevel <= 3) return 'Low (Relaxed & Calm)';
    if (stressLevel <= 6) return 'Moderate (Healthy Engagement/Mild Tension)';
    if (stressLevel <= 8) return 'High (Elevated Stress/Anxiety)';
    return 'Severe (Risk of Burnout/Depression)';
  }
}
