export type SentimentType = 'Stress' | 'Anxiety' | 'Normal' | 'Depression';

export class AIClassifierService {
  static analyzeText(text: string): SentimentType {
    const lowerText = text.toLowerCase();
    
    // Simple rule-based mock classification for DistilBERT simulation
    if (
      lowerText.includes('depressed') ||
      lowerText.includes('sad') ||
      lowerText.includes('hopeless') ||
      lowerText.includes('lonely') ||
      lowerText.includes('cry') ||
      lowerText.includes('miserable')
    ) {
      return 'Depression';
    }
    
    if (
      lowerText.includes('anxious') ||
      lowerText.includes('worry') ||
      lowerText.includes('panicking') ||
      lowerText.includes('panic') ||
      lowerText.includes('scared') ||
      lowerText.includes('fear')
    ) {
      return 'Anxiety';
    }
    
    if (
      lowerText.includes('stress') ||
      lowerText.includes('exhausted') ||
      lowerText.includes('burnout') ||
      lowerText.includes('tired') ||
      lowerText.includes('work') ||
      lowerText.includes('exam') ||
      lowerText.includes('test') ||
      lowerText.includes('deadline') ||
      lowerText.includes('pressure')
    ) {
      return 'Stress';
    }
    
    return 'Normal';
  }
}
