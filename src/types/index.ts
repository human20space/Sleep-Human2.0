export type Screen = 
  | 'splash' 
  | 'home' 
  | 'pause' 
  | 'mirror' 
  | 'practice' 
  | 'journey' 
  | 'human_ai' 
  | 'vault' 
  | 'profile'
  | 'audio_chapters'
  | 'reader'
  | 'ebb'
  | 'explore'
  | 'timer'
  | 'community'
  | 'foundations'
  | 'sleep'
  | 'subscription';

export interface AudioChapter {
  id: string;
  chapterNumber: number;
  title: string;
  part: string;
  partNumber: number;
  durationMinutes: number;
  durationFormatted: string;
  description: string;
  keyTakeaway: string;
  fileName: string;
  driveUrl: string;
  driveId?: string;
  streamUrl?: string;
  dbId?: string;
}

export type AudioCategory = 
  | 'foundations' 
  | 'sos' 
  | 'sleepcast' 
  | 'sleep_story' 
  | 'daily_calm' 
  | 'soundscape' 
  | 'breathwork' 
  | 'masterclass' 
  | 'goal_program' 
  | 'tradition' 
  | 'live';

export interface ConstructionAudioSession {
  id: string;
  title: string;
  subtitle?: string;
  category: AudioCategory;
  tradition?: string; // Secular Mindfulness, Zen, Vipassana, Kundalini, Stoic, Advaita, Tibetan Dzogchen
  teacher: string;
  teacherRole?: string;
  durationFormatted: string;
  durationSeconds: number;
  description: string;
  keyTakeaway?: string;
  tags: string[];
  audioFileStatus: 'in_production';
  expectedAssetPath?: string;
}

export interface LiveSession {
  id: string;
  title: string;
  teacher: string;
  teacherRole: string;
  tradition: string;
  startTime: string;
  timeRemaining: string;
  attendeesCount: number;
  description: string;
  isLiveNow?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  activeNowCount: number;
  description: string;
  latestDiscussion: string;
  tags: string[];
}

export type PracticeDuration = '30s' | '3min' | '10min' | '20min';

export interface Practice {
  id: string;
  title: string;
  duration: PracticeDuration;
  durationSeconds: number;
  category: string;
  situation: string;
  shortDesc: string;
  steps: string[];
  ambientTone?: string;
}

export interface JourneyDay {
  day: number;
  title: string;
  concept: string;
  inquiry: string;
  practice: string;
  experiment: string;
  completed: boolean;
}

export interface Journey {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  progressPercent: number;
  days: JourneyDay[];
}

export interface MirrorMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  step?: 'fact' | 'story' | 'emotion' | 'need' | 'choice' | 'summary';
  promptQuestion?: string;
}

export interface MirrorSession {
  id: string;
  timestamp: string;
  trigger: string;
  fact: string;
  story: string;
  emotions: string[];
  coreNeed: string;
  choice: string;
  completed: boolean;
}

export interface UserInsight {
  id: string;
  timestamp: string;
  source: 'mirror' | 'pause' | 'journey' | 'practice';
  text: string;
  tag: string;
}

export interface AwarenessMoment {
  id: string;
  timestamp: string;
  type: 'pause' | 'mirror_clarity' | 'practice_completed' | 'experiment_committed';
  title: string;
}

export interface SleepTrack {
  id: string;
  title: string;
  subtitle: string;
  category: 'sleepcast' | 'solfeggio' | 'soundscape' | 'sos' | 'body_scan';
  durationSeconds: number;
  isPremium: boolean;
  audioEngineType?: 'solfeggio_432' | 'solfeggio_528' | 'delta_binaural' | 'ocean_rain' | 'sos_reset' | 'bell_sound';
  audioUrl?: string;
  tags: string[];
  description: string;
  dbId?: string;
}

export type PlayableTrack =
  | (SleepTrack & { type: 'sleep_track' })
  | (AudioChapter & { type: 'audiobook'; isPremium: boolean });

export interface ContinueListeningItem {
  id: string;
  type: 'sleep_track' | 'audiobook';
  title: string;
  subtitle: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
}

