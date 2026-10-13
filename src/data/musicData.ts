export interface MusicTrack {
  id: string;
  title: string;
  titleHindi?: string;
  artist: string;
  language: 'hi' | 'en';
  languageLabel: string;
  durationFormatted: string;
  durationSeconds: number;
  mood: 'calm' | 'uplifting' | 'stillness' | 'focus';
  moodLabel: string;
  description: string;
  lyricsExcerpt: string;
  streamUrl?: string;
  isFree: boolean;
  coverGradient: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'music-track-1',
    title: 'Inner Awakening',
    titleHindi: 'जागृति (Jagriti)',
    artist: 'Vinay Kapoor & Sanctuary Ensemble',
    language: 'hi',
    languageLabel: 'Hindi',
    durationFormatted: '4:15 min',
    durationSeconds: 255,
    mood: 'uplifting',
    moodLabel: 'Uplifting Presence',
    description: 'Soulful acoustic composition with bamboo flute and acoustic guitar, celebrating inner awareness and presence in the modern world.',
    lyricsExcerpt: 'भीतर जो ज्योति जागी है, वही मेरा विश्राम है... न दौड़ है न होड़ है, केवल यह पल प्रणाम है।',
    isFree: true,
    coverGradient: 'from-[#8e5b23] via-[#b87333] to-[#6d4218]',
  },
  {
    id: 'music-track-2',
    title: 'Sovereign Peace',
    artist: 'Vinay Kapoor & Sanctuary Ensemble',
    language: 'en',
    languageLabel: 'English',
    durationFormatted: '5:02 min',
    durationSeconds: 302,
    mood: 'calm',
    moodLabel: 'Calm & Grounded',
    description: 'Atmospheric strings, gentle warm cello, and piano harmonics tuned to promote deep parasympathetic recovery and ease.',
    lyricsExcerpt: 'Beyond the noise, beneath the storm, a quiet space where truth is born... Unhurried, still, sovereign and free.',
    isFree: true,
    coverGradient: 'from-[#17495e] via-[#1f5f78] to-[#113747]',
  },
  {
    id: 'music-track-3',
    title: 'Thaharaav (Stillness)',
    titleHindi: 'ठहराव (Thaharaav)',
    artist: 'Vinay Kapoor & Sanctuary Ensemble',
    language: 'hi',
    languageLabel: 'Hindi',
    durationFormatted: '4:48 min',
    durationSeconds: 288,
    mood: 'stillness',
    moodLabel: 'Stillness & Rest',
    description: 'Meditative evening melody anchored in classical Indian raga notes, guiding the mind to set down the day’s weight and rest completely.',
    lyricsExcerpt: 'रुक जा ज़रा, सांस ले यहां... सारा संसार ठहर जाए, जब तू खुद से मिल जाए।',
    isFree: false,
    coverGradient: 'from-[#2a4d3a] via-[#356149] to-[#1c3628]',
  },
  {
    id: 'music-track-4',
    title: 'Awakening: Human 2.0 Anthem',
    artist: 'Vinay Kapoor & Sanctuary Ensemble',
    language: 'en',
    languageLabel: 'English',
    durationFormatted: '3:50 min',
    durationSeconds: 230,
    mood: 'focus',
    moodLabel: 'Future-Ready Mind',
    description: 'Inspiring fusion blending organic acoustic instruments and subtle modern pulses, celebrating human consciousness in the era of AI.',
    lyricsExcerpt: 'Fast world, still mind. AI outside, awareness within. The future is conscious human agency.',
    isFree: false,
    coverGradient: 'from-[#4a2e5d] via-[#5e3b75] to-[#362145]',
  },
];
