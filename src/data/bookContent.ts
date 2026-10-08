import type { Journey, Practice, UserInsight } from '../types';

export const DAILY_RITUAL = {
  dateStr: 'Today',
  eyebrow: 'DAILY AWARENESS',
  quote: 'Awareness is not something you produce by straining the mind. It is what remains when you gently step back from the story you are telling yourself.',
  chapterRef: 'From Part 2: Awareness Begins · Chapter 4',
  practiceTitle: '2-Minute Space Between Impulse & Action',
  soundTitle: '432Hz Stillness Resonance',
};

export const SITUATIONAL_CHIPS = [
  { id: 'react', label: "I'm about to react", action: 'pause', icon: 'Flame' },
  { id: 'overwhelmed', label: "I'm overwhelmed", action: 'practice_3min', icon: 'Waves' },
  { id: 'clarity', label: 'I need clarity', action: 'mirror', icon: 'Eye' },
  { id: 'thinking', label: "I can't stop thinking", action: 'practice_3min', icon: 'Compass' },
  { id: 'decision', label: 'Struggling with a decision', action: 'human_ai', icon: 'Sparkles' },
  { id: 'mirror_direct', label: 'Talk it through', action: 'mirror', icon: 'MessageCircle' },
];

export const CONTEXTUAL_PRACTICES: Practice[] = [
  // 30-Second Practices
  {
    id: 'pause-30',
    title: 'The Sovereign Pause',
    duration: '30s',
    durationSeconds: 30,
    category: 'Rapid Reset',
    situation: 'Right before hitting send, shouting, or jumping to conclusions.',
    shortDesc: 'Stop, take one full breath, notice what is real, choose your posture.',
    steps: [
      'Stop whatever your hands and mouth are doing.',
      'Take one slow, unbroken breath through the nose.',
      'Drop your shoulders. Feel your feet resting on the solid floor.',
      'Notice: What is an actual physical fact here, and what is your mind inventing?',
      'Choose the one response that preserves your dignity and calm.',
    ],
  },
  {
    id: 'ground-30',
    title: '30-Second Physical Anchor',
    duration: '30s',
    durationSeconds: 30,
    category: 'Somatic Ground',
    situation: 'When adrenaline is surging in your chest or throat.',
    shortDesc: 'Immediate physical sensory return to the present environment.',
    steps: [
      'Press both feet firmly into the ground.',
      'Notice 3 colors in the room right in front of you.',
      'Feel the physical temperature of the air entering your nostrils.',
      'Remind yourself: In this exact second, your body is safe.',
    ],
  },

  // 3-Minute Practices
  {
    id: 'meeting-3min',
    title: 'Ground Before a High-Stakes Meeting',
    duration: '3min',
    durationSeconds: 180,
    category: 'Preparation',
    situation: 'When you have a tense meeting, negotiation, or performance in 5 minutes.',
    shortDesc: 'Shift from defense posture to quiet inner authority.',
    steps: [
      'Sit upright with an open, unclenched chest.',
      'Exhale completely, twice as long as your inhales.',
      'Ask: What is my singular intention for this interaction? (Not to win, but to be clear).',
      'Release the need to control how other people react to the truth.',
      'Step into the room anchored in who you are, not who they want you to be.',
    ],
  },
  {
    id: 'rumination-3min',
    title: 'Unclench the Mind from Rumination',
    duration: '3min',
    durationSeconds: 180,
    category: 'Clarity',
    situation: 'When an argument or past failure loops relentlessly in your head.',
    shortDesc: 'Recognize the thought loop as mental weather, not truth.',
    steps: [
      'Acknowledge: The mind is spinning trying to solve an imagined danger.',
      'Say softly inside: "Thank you for trying to protect me, but I am here now."',
      'Bring all attention to the palms of your hands. Sense the subtle tingling.',
      'Notice how the thought loses its grip when you refuse to debate it.',
    ],
  },
  {
    id: 'boundary-3min',
    title: 'The Clean Boundary Reset',
    duration: '3min',
    durationSeconds: 180,
    category: 'Inner Authority',
    situation: 'When someone asks you for something and you feel an automatic, resentful "yes".',
    shortDesc: 'Pause before volunteering your energy to please others.',
    steps: [
      'Check your gut: Is there a knot or sinking sensation? That is an authentic NO.',
      'Notice the fear of being seen as difficult or unkind.',
      'Remember: A clear, calm "No" is more honest than a resentful "Yes".',
      'Formulate your clean statement: "I cannot take that on right now."',
    ],
  },

  // 10-Minute Practices
  {
    id: 'witness-10min',
    title: 'Observing the Thinker (Witness Meditation)',
    duration: '10min',
    durationSeconds: 60,
    category: 'Deep Awareness',
    situation: 'When you feel thoroughly identified with anxiety or worry.',
    shortDesc: 'Step behind the screen of the mind and rest as the observer.',
    steps: [
      'Close your eyes and allow breath to flow naturally without control.',
      'Listen to the furthest sound you can detect in the environment.',
      'Notice the thoughts passing like clouds through open blue sky.',
      'Ask: "Who is the one aware of these thoughts?"',
      'Rest in the silent, spacious knowing that never panics.',
    ],
  },

  // 20-Minute Practices
  {
    id: 'mastery-20min',
    title: 'Deconstructing the Conditioned Self',
    duration: '20min',
    durationSeconds: 1200,
    category: 'Quiet Mastery',
    situation: 'Deep weekend reflection or personal retreat.',
    shortDesc: 'A guided journey into dismantling persona, expectations, and digital conditioning.',
    steps: [
      'Enter an undisturbed quiet space.',
      'Allow the nervous system to settle through 10 conscious slow breaths.',
      'Inquire into what identity you have been defending this week.',
      'Experience the freedom of being nobody special, completely whole right here.',
    ],
  },
];

export const JOURNEYS_DATA: Journey[] = [
  {
    id: 'j1',
    number: 1,
    title: 'Awareness',
    subtitle: 'From Unconscious Living to the Witness',
    description: 'Learn to separate the one who is aware from the relentless chatter of the conditioned mind.',
    progressPercent: 65,
    days: [
      {
        day: 1,
        title: 'The Space Between',
        concept: 'You are not your thoughts; you are the silent space in which they appear.',
        inquiry: 'Can you notice a thought arise, linger, and disappear without following it down the rabbit hole?',
        practice: '3-Minute Witness Practice',
        experiment: 'During one routine task today (e.g. washing hands or pouring coffee), watch yourself doing it in full presence.',
        completed: true,
      },
      {
        day: 2,
        title: 'Interrupting the Story',
        concept: 'Suffering is 10% event, 90% the narrative your mind spins about the event.',
        inquiry: 'Where did you take an assumption as absolute truth today?',
        practice: 'The Mirror: Fact vs Story',
        experiment: 'Catch one complaint today and restate only the verifiable physical facts.',
        completed: true,
      },
      {
        day: 3,
        title: 'The Physical Alarm',
        concept: 'The body alerts you to triggers long before the mind rationalizes them.',
        inquiry: 'Where do you physically store hesitation or anger? Chest? Throat? Solar plexus?',
        practice: 'Somatic Check-In',
        experiment: 'Whenever you feel irritated today, pause and put your attention on your body for 20 seconds.',
        completed: false,
      },
    ],
  },
  {
    id: 'j2',
    number: 2,
    title: 'From Reaction to Response',
    subtitle: 'Interrupting Habitual Reflexes',
    description: 'Master the 30-second sovereign pause to transform knee-jerk triggers into conscious choices.',
    progressPercent: 25,
    days: [
      {
        day: 1,
        title: 'The Trigger Point',
        concept: 'A reaction is automatic conditioning; a response is conscious human sovereignty.',
        inquiry: 'What person or situation reliably pulls you out of your center?',
        practice: 'The 30-Second Sovereign Pause',
        experiment: 'Wait 10 seconds before replying to any message that causes an emotional spike.',
        completed: true,
      },
      {
        day: 2,
        title: 'The Hidden Urgency',
        concept: 'Anxiety creates a false sense of immediate catastrophe.',
        inquiry: 'Does this genuinely need to be resolved in the next 10 minutes?',
        practice: 'Slow Down Cadence',
        experiment: 'Walk and speak 20% slower for one hour this afternoon.',
        completed: false,
      },
    ],
  },
  {
    id: 'j3',
    number: 3,
    title: 'Understanding Patterns',
    subtitle: 'Decoding Your Lifelong Loops',
    description: 'Map the recurring defensive habits and emotional loops you adopted in childhood.',
    progressPercent: 0,
    days: [
      {
        day: 1,
        title: 'The Familiar Trap',
        concept: 'We repeat familiar suffering because the mind prefers known misery to unknown freedom.',
        inquiry: 'What pattern in your relationships keeps repeating under different faces?',
        practice: 'Pattern Mapping',
        experiment: 'Notice when you withdraw or attack; simply say internally: "There is the pattern."',
        completed: false,
      },
    ],
  },
  {
    id: 'j4',
    number: 4,
    title: 'Inner Authority',
    subtitle: 'Moving Beyond External Validation',
    description: 'Stop waiting for permission. Recover your sovereign inner compass.',
    progressPercent: 0,
    days: [],
  },
  {
    id: 'j11',
    number: 11,
    title: 'Living With AI',
    subtitle: 'Retaining Humanity in a Machine Age',
    description: 'Learn to leverage AI as a tool for amplification without outsourcing your thinking, intuition, or values.',
    progressPercent: 10,
    days: [
      {
        day: 1,
        title: 'Before the Prompt',
        concept: 'If you ask AI before knowing what you think, you train yourself to be a consumer of thought.',
        inquiry: 'What do I think, feel, and know about this problem before asking the machine?',
        practice: 'Pre-Prompt Inquiry',
        experiment: 'Spend 2 minutes writing your rough thoughts on paper before consulting any AI or search tool.',
        completed: true,
      },
    ],
  },
];

export const INITIAL_USER_INSIGHTS: UserInsight[] = [
  {
    id: 'ins-1',
    timestamp: 'Yesterday at 5:14 PM',
    source: 'mirror',
    tag: 'Work & Authority',
    text: 'I realized that my defensiveness when receiving feedback was not about the work, but about my fear that people will discover I do not know everything.',
  },
  {
    id: 'ins-2',
    timestamp: '3 days ago',
    source: 'pause',
    tag: 'Relationships',
    text: 'Taking 30 seconds before replying to my partner changed the entire evening. What I thought was anger was actually exhaustion.',
  },
  {
    id: 'ins-3',
    timestamp: 'Last Sunday',
    source: 'journey',
    tag: 'Human + AI',
    text: 'I will not use AI to write letters to people I love. Efficiency is the enemy of intimacy.',
  },
];

export const HUMAN_AI_PROTOCOLS = [
  {
    id: 'before_prompt',
    title: 'Before Asking AI',
    promptQuestion: 'What is your own unfiltered thought or instinct right now?',
    subtext: 'Ground yourself in your own mind before exposing your thinking to algorithmic direction.',
    guidingQuestions: [
      'What do I actually think about this before I ask?',
      'What does my gut or somatic intuition sense?',
      'Am I asking AI for data, or am I asking it to make a decision for me?',
    ],
  },
  {
    id: 'output_check',
    title: 'Before Accepting AI Recommendations',
    promptQuestion: 'Does this generated answer feel authentic, true, and aligned with your values?',
    subtext: 'Never accept an AI output just because it sounds polished, confident, and grammatically complete.',
    guidingQuestions: [
      'What is missing from this answer that only lived human experience knows?',
      'Does this language sound like my authentic voice or a generic corporate template?',
      'What part of me is feeling relieved, and what part is feeling uneasy?',
    ],
  },
  {
    id: 'decision_sovereign',
    title: 'The Sovereign Decision Protocol',
    promptQuestion: 'Let AI analyze logistics. You make the sovereign choice.',
    subtext: 'Separate computational logistics from ethical and intuitive wisdom.',
    guidingQuestions: [
      'AI can evaluate: salary, commute, risk, pros/cons list.',
      'Human must evaluate: integrity, emotional cost, purpose, relational impact.',
      'If fear were quiet, what would I choose right now?',
    ],
  },
];
