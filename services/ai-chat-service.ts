import { AIClassifierService } from './ai-classifier-service';
import { Message } from '@/types';

export class AIChatService {
  static async generateCompanionResponse(
    messageText: string,
    history: Message[]
  ): Promise<{ content: string; sentiment: Message['sentiment'] }> {
    // Simulating remote inference latency for natural interactions
    await new Promise((resolve) => setTimeout(resolve, 800));

    const sentiment = AIClassifierService.analyzeText(messageText);

    let content = "";

    switch (sentiment) {
      case 'Depression':
        content = "I hear how heavy things feel right now. It takes a lot of strength to put these feelings into words. Please know that your feelings are valid, and you don't have to carry this alone. I'm here to listen, and I can also point you to professional resources whenever you're ready.";
        break;
      case 'Anxiety':
        content = "I sense that you're feeling anxious right now. Let's take a gentle pause together. Breathe in slowly... hold it... and let it go. You're safe here. Let's focus on this present moment. Would you like to explore what's causing this tension?";
        break;
      case 'Stress':
        content = "It sounds like you have a lot on your plate and you're feeling the pressure. Burnout and fatigue can creep up on us. Remember to give yourself credit for how hard you're working. Shall we try a quick breathing session, or would you like to list the tasks together to break them down?";
        break;
      case 'Normal':
      default:
        const lower = messageText.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi') {
          content = "Hello! I'm your MindBloom companion. I'm here to support you, listen without judgment, or guide you through grounding activities. How are you feeling today?";
        } else if (lower.includes('game') || lower.includes('bubble') || lower.includes('meditat')) {
          content = "I'd love to help with that! We have several interactive games like Bubble Pop, Breathing guides, and peaceful soundscapes in the Relief tools tab. They're great for finding focus and lowering cortisol levels.";
        } else if (lower.includes('thank') || lower.includes('appreciate')) {
          content = "You're very welcome. I'm glad I can be here for you. We can go at whatever pace feels comfortable for you.";
        } else {
          content = "Thank you for sharing that. It's really helpful to get those thoughts out. What else is on your mind? Or would you prefer to try a short reflection exercise?";
        }
        break;
    }

    return { content, sentiment };
  }
}
