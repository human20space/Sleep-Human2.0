export type StoryCategory = 'real_journeys' | 'life_stories' | 'comeback_stories' | 'wisdom_stories';

export interface HumanStory {
  id: string;
  title: string;
  theme?: string;
  category: StoryCategory;
  categoryLabel: string;
  durationFormatted: string;
  durationSeconds: number;
  subtitle: string;
  summary: string;
  videoUrl?: string;
  thumbnailGradient: string;
  icon: string;
  // For Real Journeys (Before & After shift structure)
  transformationDetails?: {
    before: string;
    shift: string;
    practice: string;
    after: string;
    person: string;
    role: string;
  };
}

export type UserFeeling = 'stressed' | 'overwhelmed' | 'lonely' | 'angry' | 'better' | 'grateful';

export interface FeelingRecommendation {
  feeling: UserFeeling;
  label: string;
  emoji: string;
  color: string;
  recommendationTitle: string;
  recommendationType: 'sos' | 'meditation' | 'music' | 'audiobook' | 'bell';
  targetScreen: 'pause' | 'meditation_hub' | 'music' | 'audio_chapters' | 'home';
  explanation: string;
}

export const FEELING_RECOMMENDATIONS: Record<UserFeeling, FeelingRecommendation> = {
  stressed: {
    feeling: 'stressed',
    label: 'Stressed',
    emoji: '🚨',
    color: '#ef4444',
    recommendationTitle: '90-Second Emergency SOS Reset',
    recommendationType: 'sos',
    targetScreen: 'pause',
    explanation: 'De-escalate the autonomic nervous system with 3-tap tactile breathing and a 360Hz tone.',
  },
  overwhelmed: {
    feeling: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '🌊',
    color: '#3b82f6',
    recommendationTitle: 'Sleep & Somatic Body Release Meditation',
    recommendationType: 'meditation',
    targetScreen: 'meditation_hub',
    explanation: 'Gentle somatic body scan to release tension accumulated in shoulders, neck, and chest.',
  },
  lonely: {
    feeling: 'lonely',
    label: 'Lonely',
    emoji: '💜',
    color: '#a855f7',
    recommendationTitle: 'Awareness Music: Inner Awakening (जागृति)',
    recommendationType: 'music',
    targetScreen: 'music',
    explanation: 'Acoustic conscious melodies reconnecting you with stillness, compassion, and shared humanity.',
  },
  angry: {
    feeling: 'angry',
    label: 'Angry',
    emoji: '🔥',
    color: '#f97316',
    recommendationTitle: '30-Second Sovereign Pause & Circuit Breaker',
    recommendationType: 'sos',
    targetScreen: 'pause',
    explanation: 'Interrupt the impulsive reaction loop before saying or sending anything regrettable.',
  },
  better: {
    feeling: 'better',
    label: 'Better',
    emoji: '🌱',
    color: '#10b981',
    recommendationTitle: 'Chapter 19: Awareness in Action & Presence',
    recommendationType: 'audiobook',
    targetScreen: 'audio_chapters',
    explanation: 'Harness this clear, grounded mental state to build intentional leadership and clean boundaries.',
  },
  grateful: {
    feeling: 'grateful',
    label: 'Grateful',
    emoji: '✨',
    color: '#eab308',
    recommendationTitle: 'Relaxing Temple Bell Unguided Stillness',
    recommendationType: 'bell',
    targetScreen: 'home',
    explanation: 'Sit in quiet appreciation with pure organic acoustic resonance and gentle timers.',
  },
};

export const HUMAN_STORIES: HumanStory[] = [
  // FEATURED CINEMATIC LIFE STORY
  {
    id: 'story-life-1',
    title: 'When Life Feels Too Much',
    theme: 'Stress & Overwhelm',
    category: 'life_stories',
    categoryLabel: 'Life Stories',
    durationFormatted: '2:32 min',
    durationSeconds: 152,
    subtitle: 'From pressure and disconnection to connection, purpose and joy.',
    summary: 'A cinematic arc showing people caught in everyday corporate tension, relationship friction, and isolation—moving toward genuine human connection, family, helping others, and lasting presence.',
    videoUrl: '/videos/when-life-feels-too-much.mp4',
    thumbnailGradient: 'from-[#17495e] via-[#1f5f78] to-[#123645]',
    icon: '🎬',
  },

  // REAL JOURNEYS (Reader & User Before & After Shifts)
  {
    id: 'story-journey-1',
    title: 'Grounded Presence in the Boardroom',
    category: 'real_journeys',
    categoryLabel: 'Real Journeys',
    durationFormatted: '3:10 min',
    durationSeconds: 190,
    subtitle: 'How an executive stopped reacting in high-stakes meetings.',
    summary: 'A corporate leader discovers the sovereign gap between provocative emails and reactive replies.',
    thumbnailGradient: 'from-[#1e4a3e] via-[#245a4c] to-[#173a30]',
    icon: '🌱',
    transformationDetails: {
      person: 'Arjun M.',
      role: 'VP of Technology, Dubai',
      before: 'I was checking my phone at midnight and arriving at morning meetings with a hair-trigger temper.',
      shift: 'One sentence in Chapter 15 stopped me: "The calmest person in the room invariably commands the authority of the room."',
      practice: 'The 30-Second Sovereign Pause before every key agenda item.',
      after: 'My team noticed immediately. Disagreements no longer turn into defensive firefights.',
    },
  },
  {
    id: 'story-journey-2',
    title: 'Ending the 3 AM Sleep Spiral',
    category: 'real_journeys',
    categoryLabel: 'Real Journeys',
    durationFormatted: '2:45 min',
    durationSeconds: 165,
    subtitle: 'Releasing the relentless urge to solve tomorrow tonight.',
    summary: 'A mother and entrepreneur finds restful sleep after years of insomnia.',
    thumbnailGradient: 'from-[#18314f] via-[#204269] to-[#122438]',
    icon: '🌙',
    transformationDetails: {
      person: 'Fatima Al-K.',
      role: 'Founder & Architect, Abu Dhabi',
      before: 'Every night, my brain would review 40 problems simultaneously in the dark.',
      shift: 'Moving from mental debate to somatic physical notice: feeling the mattress, the breath, the throat.',
      practice: 'The Relaxing Bell soundscape with a 30-minute gentle volume fade.',
      after: 'I now fall asleep in under 12 minutes without carrying the entire workday into bed.',
    },
  },
  {
    id: 'story-journey-3',
    title: 'Navigating Sudden Failure Without Collapse',
    category: 'real_journeys',
    categoryLabel: 'Real Journeys',
    durationFormatted: '3:25 min',
    durationSeconds: 205,
    subtitle: 'Distinguishing neutral Fact from defensive Story.',
    summary: 'Using The Mirror inquiry when a multimillion venture closed unexpectedly.',
    thumbnailGradient: 'from-[#3c2a4d] via-[#4d3663] to-[#2c1d39]',
    icon: '🪞',
    transformationDetails: {
      person: 'Vikram S.',
      role: 'Managing Partner, Singapore',
      before: 'When the deal collapsed, I felt like my identity was erased. Shame and panic were all-consuming.',
      shift: 'The Mirror inquiry: "The investment ended (Fact). You are a total failure (Story)."',
      practice: 'Daily 10-minute quiet reflection untangling truth from ego fear.',
      after: 'I negotiated a graceful transition and launched my next chapter from clear authority.',
    },
  },

  // LIFE STORIES (Cinematic Relatable Films)
  {
    id: 'story-life-2',
    title: 'The Midnight Notification',
    category: 'life_stories',
    categoryLabel: 'Life Stories',
    durationFormatted: '2:12 min',
    durationSeconds: 132,
    subtitle: 'The cost of constant accessibility vs true presence.',
    summary: 'A young professional learns that availability is not the same as value.',
    videoUrl: '/videos/story-relatable-life.mp4',
    thumbnailGradient: 'from-[#17495e] via-[#21576d] to-[#153e4f]',
    icon: '📱',
  },
  {
    id: 'story-life-3',
    title: 'The Dinner Table Distance',
    category: 'life_stories',
    categoryLabel: 'Life Stories',
    durationFormatted: '2:50 min',
    durationSeconds: 170,
    subtitle: 'Being physically present while mentally a thousand miles away.',
    summary: 'How one evening of quiet device-free stillness restored a fractured family bond.',
    thumbnailGradient: 'from-[#2e3b43] via-[#3d4d57] to-[#1f282e]',
    icon: '🕯️',
  },

  // COMEBACK STORIES
  {
    id: 'story-comeback-1',
    title: 'Rebuilding From Zero',
    category: 'comeback_stories',
    categoryLabel: 'Comeback Stories',
    durationFormatted: '1:38 min',
    durationSeconds: 98,
    subtitle: 'How quiet resilience beats frantic haste.',
    summary: 'When life forces a complete restart, inner stillness provides the only stable foundation.',
    videoUrl: '/videos/story-comeback.mp4',
    thumbnailGradient: 'from-[#4a2e1d] via-[#5e3b26] to-[#362115]',
    icon: '🏔️',
  },
  {
    id: 'story-comeback-2',
    title: 'The Courage to Say No',
    category: 'comeback_stories',
    categoryLabel: 'Comeback Stories',
    durationFormatted: '2:40 min',
    durationSeconds: 160,
    subtitle: 'Clean boundaries as an act of profound self-respect.',
    summary: 'Stepping off the treadmill of pleasing everyone to rediscover authentic purpose.',
    thumbnailGradient: 'from-[#293d34] via-[#375246] to-[#1d2c25]',
    icon: '🛡️',
  },

  // WISDOM STORIES
  {
    id: 'story-wisdom-1',
    title: 'The Golden Equation: AI + AI',
    category: 'wisdom_stories',
    categoryLabel: 'Wisdom Stories',
    durationFormatted: '2:10 min',
    durationSeconds: 130,
    subtitle: 'Aware Individual meets Artificial Intelligence.',
    summary: 'As algorithms become faster and more capable, human beings must become stiller and more conscious.',
    thumbnailGradient: 'from-[#1b3d54] via-[#255270] to-[#132c3d]',
    icon: '⚡',
  },
  {
    id: 'story-wisdom-2',
    title: 'The Sovereign Gap',
    category: 'wisdom_stories',
    categoryLabel: 'Wisdom Stories',
    durationFormatted: '1:55 min',
    durationSeconds: 115,
    subtitle: 'Between impulse and reaction lies all human freedom.',
    summary: 'A short visual parable illustrating how 30 seconds can change the trajectory of an entire life.',
    thumbnailGradient: 'from-[#3a2f4c] via-[#4b3d63] to-[#282036]',
    icon: '⏳',
  },
];
