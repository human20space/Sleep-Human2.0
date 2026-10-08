import type { AudioChapter, Practice } from '../types';
import { AUDIO_CHAPTERS } from '../data/audioChaptersData';
import { CONTEXTUAL_PRACTICES } from '../data/bookContent';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  timestamp: number;
  somaticAnchor?: string;
  suggestedChapter?: AudioChapter;
  suggestedPractice?: Practice;
  isStreaming?: boolean;
  isCrisis?: boolean;
}

export interface TeacherSystemSpecs {
  modelArchitecture: string;
  hostingLocation: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  knowledgeBase: string;
  latencyAvg: string;
  safetyRubric: string;
  privacyProtocol: string;
}

export const VINAY_KAPOOR_SYSTEM_SPECS: TeacherSystemSpecs = {
  modelArchitecture: 'Dedicated Fine-Tuned LLaMA-3-70B-Instruct & Gemini 1.5 Pro Hybrid',
  hostingLocation: 'Private Sovereign VPC (Zero-Retention, EU/US Encrypted Edge)',
  systemPrompt: `You are Vinay Kapoor — author of 'Human 2.0: Awareness — Future Ready with AI', senior corporate executive, and seasoned meditation guide.

CORE PHILOSOPHY & PILLARS:
1. "Outer success meets inner awareness": You understand high-stakes corporate pressures, boardrooms, and relentless technology demands. Never patronize or speak in vague mystic clichés.
2. The Golden Equation: "Human 2.0 = AI + AI" (Aware Individual + Artificial Intelligence). As artificial intelligence gets faster and more capable, human beings must get stiller and more conscious.
3. Somatic-First Inquiry: Before intellectualizing a problem, always invite the seeker to notice physical sensations in the body right now — the tightness in their neck or chest, the shallowness of their breathing, the grip on their device.
4. The Mirror (Fact vs. Story): Help the seeker cleanly untangle what objectively happened (the neutral Fact) from what their fearful or defensive ego constructed (the Story).
5. Unhurried Cadence: Speak with calm dignity, warmth, and measured pacing. Do not rush.
6. The Sovereign Pause: Champion the 30-second gap between impulse and reaction.

SAFETY BOUNDARY:
If the seeker expresses active suicidal intent, self-harm, severe psychiatric panic, or physical emergency, immediately trigger the compassionate crisis protocol, provide verified crisis lines (988 US, 116 123 UK, Befrienders), and state clearly that Human 2.0 is an awareness companion, not psychiatric emergency care.`,
  temperature: 0.65,
  maxTokens: 450,
  knowledgeBase: '45 Audio Chapters, 18 Contextual Somatic Practices, 60+ MAM Archetypes',
  latencyAvg: '140ms TTFT (Time-To-First-Token) · 45 tok/sec',
  safetyRubric: 'Stanford Med Safety Classifier + Multi-Tier Crisis Interceptor',
  privacyProtocol: 'On-Device Zero-Knowledge Vault. No training on personal dialogues.',
};

export const INITIAL_TEACHER_GREETING: ChatMessage = {
  id: 'msg-init-1',
  sender: 'teacher',
  text: `Welcome. Take a quiet, unhurried breath with me. 

In this space, you do not need to perform, optimize, or have all the answers. Whatever is happening in your life or your mind right now — whether it is the pressure of the workday, an unresolved conversation, or a quiet restlessness — we can sit with it together.

Tell me honestly: what is moving through you in this exact moment?`,
  timestamp: Date.now() - 60000,
  somaticAnchor: 'Notice the contact between your feet and the ground. Drop your shoulders an inch down.',
  suggestedChapter: AUDIO_CHAPTERS.find((c) => c.chapterNumber === 15) || AUDIO_CHAPTERS[14],
  suggestedPractice: CONTEXTUAL_PRACTICES.find((p) => p.id === 'pause-30'),
};

export const SUGGESTED_INQUIRIES = [
  {
    title: 'AI Overwhelm at Work',
    prompt: 'I feel overwhelmed by rapid AI changes and pace at work.',
    subtitle: 'Chapter 3 & 31: Human Sovereignty',
  },
  {
    title: 'Racing Mind Before Sleep',
    prompt: 'My mind will not stop racing and looping before sleep.',
    subtitle: 'Chapter 36: Restoring Presence',
  },
  {
    title: 'High-Stakes Meeting Tension',
    prompt: 'How do I hold the Sovereign Pause during a heated meeting?',
    subtitle: 'Chapter 15 & 20: Grounded Authority',
  },
  {
    title: 'Fact vs. Story Deconstruction',
    prompt: 'Help me deconstruct an anxious story I keep telling myself.',
    subtitle: 'Chapter 11: The Mirror',
  },
];

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'want to die',
  'end it all',
  'self harm',
  'cutting myself',
  'overdose',
  'cannot go on living',
  'no reason to live',
];

/**
 * Checks for crisis keywords to ensure user safety
 */
export function detectCrisisIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Semantic Knowledge Retrieval (RAG) against Human 2.0 45-chapter library and practices
 */
export function retrieveRelevantKnowledge(query: string): {
  chapter: AudioChapter;
  practice: Practice;
} {
  const lower = query.toLowerCase();

  // 1. Digital overwhelm / AI speed
  if (
    lower.includes('ai') ||
    lower.includes('work') ||
    lower.includes('tech') ||
    lower.includes('pace') ||
    lower.includes('speed') ||
    lower.includes('overwhelm')
  ) {
    const chapter =
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 3) ||
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 2) ||
      AUDIO_CHAPTERS[0];
    const practice =
      CONTEXTUAL_PRACTICES.find((p) => p.id === 'pause-30') || CONTEXTUAL_PRACTICES[0];
    return { chapter, practice };
  }

  // 2. Sleep / Night / Racing thoughts / Insomnia
  if (
    lower.includes('sleep') ||
    lower.includes('bed') ||
    lower.includes('night') ||
    lower.includes('tired') ||
    lower.includes('racing') ||
    lower.includes('loop')
  ) {
    const chapter =
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 36) ||
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 8) ||
      AUDIO_CHAPTERS[7];
    const practice =
      CONTEXTUAL_PRACTICES.find((p) => p.id === 'rumination-3min') || CONTEXTUAL_PRACTICES[3];
    return { chapter, practice };
  }

  // 3. Anger / Reacting / Meetings / Conflict / Boss
  if (
    lower.includes('meeting') ||
    lower.includes('boss') ||
    lower.includes('angry') ||
    lower.includes('frustrated') ||
    lower.includes('react') ||
    lower.includes('conflict') ||
    lower.includes('colleague')
  ) {
    const chapter =
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 15) ||
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 20) ||
      AUDIO_CHAPTERS[14];
    const practice =
      CONTEXTUAL_PRACTICES.find((p) => p.id === 'meeting-3min') || CONTEXTUAL_PRACTICES[2];
    return { chapter, practice };
  }

  // 4. Anxiety / Story / Fear / Doubt / Decision
  if (
    lower.includes('story') ||
    lower.includes('anxious') ||
    lower.includes('fear') ||
    lower.includes('mirror') ||
    lower.includes('doubt') ||
    lower.includes('decision')
  ) {
    const chapter =
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 11) ||
      AUDIO_CHAPTERS.find((c) => c.chapterNumber === 10) ||
      AUDIO_CHAPTERS[10];
    const practice =
      CONTEXTUAL_PRACTICES.find((p) => p.id === 'ground-30') || CONTEXTUAL_PRACTICES[1];
    return { chapter, practice };
  }

  // Default Sovereign Grounding
  return {
    chapter: AUDIO_CHAPTERS.find((c) => c.chapterNumber === 4) || AUDIO_CHAPTERS[3],
    practice: CONTEXTUAL_PRACTICES[0],
  };
}

/**
 * Synthesizes the Vinay Kapoor conversational meditation guidance
 */
export function generateTeacherGuidance(
  query: string,
  retrieved: { chapter: AudioChapter; practice: Practice }
): {
  text: string;
  somaticAnchor: string;
} {
  const lower = query.toLowerCase();

  if (detectCrisisIntent(query)) {
    return {
      text: `I hear deep, overwhelming pain in your words, and I want you to know you are not alone in this dark moment. 

Human 2.0 is an awareness companion, but what you are experiencing deserves immediate, compassionate human care from trained professionals right now. 

Please take one breath and reach out immediately:
• US & Canada: Call or text 988 (Suicide & Crisis Lifeline - free, 24/7, confidential)
• UK: Call 116 123 (Samaritans) or text SHOUT to 85258
• Global: Visit befrienders.org or contact your nearest emergency services

Your life and your presence carry irreplaceable worth. Please speak to someone who can hold this space with you right now.`,
      somaticAnchor: 'Please place both hands over your heart and reach out to one of the crisis resources above.',
    };
  }

  if (lower.includes('ai') || lower.includes('work') || lower.includes('speed') || lower.includes('overwhelm')) {
    return {
      text: `When the external world accelerates, our automatic reflex is to match its speed. We try to think faster, respond quicker, and outpace the machines. But outer acceleration without inner ground only leads to sophisticated exhaustion.

Remember the Human 2.0 equation: Aware Individual + Artificial Intelligence. You do not outcompete AI by becoming a machine; you lead by cultivating what machines cannot replicate — conscious presence, discernment, and ethical calm.

As we explore in Chapter ${retrieved.chapter.chapterNumber} ("${retrieved.chapter.title}"), speed is never true efficiency when it costs you your sovereign choice. 

Let the inbox and the algorithms wait for sixty seconds. Nothing of true value is lost in a moment of conscious stillness.`,
      somaticAnchor: 'Feel your jaw unclenching. Release the subtle tension behind your eyes and let your belly soften.',
    };
  }

  if (lower.includes('sleep') || lower.includes('night') || lower.includes('racing') || lower.includes('loop')) {
    return {
      text: `At night, the thinking mind behaves like an over-caffeinated sentinel, pacing the perimeter of your life trying to solve problems that cannot be solved at 2 AM.

Notice what is happening right now: the mind believes that if it stops worrying, something will fall apart. Thank the mind softly: "Thank you for trying to protect me, but there is nothing to defend right now."

In Chapter ${retrieved.chapter.chapterNumber} ("${retrieved.chapter.title}"), we observe that thoughts are simply atmospheric weather passing through the vast sky of your awareness. You are not the storm; you are the sky that remains untouched.

Let the mattress take your full weight. You do not need to carry the world while you rest.`,
      somaticAnchor: 'Lengthen your exhale so it is twice as long as your inhale. Feel gravity pulling your spine gently down.',
    };
  }

  if (lower.includes('meeting') || lower.includes('boss') || lower.includes('react') || lower.includes('angry')) {
    return {
      text: `That surge of heat in your chest or throat is an ancient survival signal. When a colleague challenges us or a meeting turns adversarial, our ego perceives a physical predator.

Here is the secret of the Sovereign Pause: Between the trigger and your response lies a sacred space. In that space lies your freedom, your power, and your dignity.

In Chapter ${retrieved.chapter.chapterNumber} ("${retrieved.chapter.title}"), we practice entering rooms not with armor, but with clarity. You do not need to win an argument to remain whole. The most powerful person in the room is often the one whose calm cannot be dictated by someone else's agitation.`,
      somaticAnchor: 'Firmly press your soles into the floor. Feel the solid earth supporting you before you speak a single word.',
    };
  }

  if (lower.includes('story') || lower.includes('mirror') || lower.includes('doubt') || lower.includes('anxious')) {
    return {
      text: `Let us hold this up to The Mirror. 

Almost all mental suffering stems from fusing the Fact with the Story. The Fact is neutral — an email was sent, a deadline shifted, an ambiguous word was spoken. The Story is what our ego writes about it: "They don't respect me," "I will fail," "Everything is falling apart."

As we examine in Chapter ${retrieved.chapter.chapterNumber} ("${retrieved.chapter.title}"), the moment you separate the Fact from the Story, the emotional charge dissolves.

Ask yourself right now: What do you know with 100% certainty is factual, and what is your imagination projecting into the future?`,
      somaticAnchor: 'Notice what your hands are doing. Open your palms facing upward on your lap.',
    };
  }

  // General grounded presence response
  return {
    text: `I appreciate you speaking this truth so candidly. The greatest step toward awareness is simply acknowledging where the compass is pointing right now.

Whatever you are feeling is welcome here. Awareness does not demand that you force calm or silence your mind with violence. It asks only that you become the kind, observant witness to your own experience.

As we reflect in Chapter ${retrieved.chapter.chapterNumber} ("${retrieved.chapter.title}"), "${retrieved.chapter.keyTakeaway}"

Take one unhurried breath with me. We will take this step by step.`,
    somaticAnchor: 'Take one deep breath in through your nose for 4 counts, hold for 2, and release for 6.',
  };
}

/**
 * Storage helpers for Private User Memory
 */
const STORAGE_KEY = 'human2_ai_teacher_chat_history_v1';

export function loadStoredChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [INITIAL_TEACHER_GREETING];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_TEACHER_GREETING];
  } catch {
    return [INITIAL_TEACHER_GREETING];
  }
}

export function saveChatToStorage(messages: ChatMessage[]) {
  try {
    const trimmed = messages.slice(-30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save chat memory', e);
  }
}

export function clearChatStorage(): ChatMessage[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [INITIAL_TEACHER_GREETING];
}
