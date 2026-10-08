import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import type { MirrorMessage, MirrorSession } from '../types';
import confetti from 'canvas-confetti';

interface MirrorScreenProps {
  onBack: () => void;
  onSaveSession: (session: MirrorSession) => void;
  onRecordMAM: (title: string) => void;
}

const STEPS = [
  { id: 'fact', label: '1. Fact' },
  { id: 'story', label: '2. Story' },
  { id: 'emotion', label: '3. Emotion' },
  { id: 'need', label: '4. Need' },
  { id: 'choice', label: '5. Choice' },
];

export const MirrorScreen: React.FC<MirrorScreenProps> = ({ onBack, onSaveSession, onRecordMAM }) => {
  const [messages, setMessages] = useState<MirrorMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      step: 'fact',
      text: "Welcome to the Human 2.0 Mirror.\n\nI am not here to validate grievances or tell you what to think. I am here to hold a clear glass up to your mind so you can see what is real.\n\nWhat happened just now that caused disturbance?",
      promptQuestion: "Describe what triggered you:",
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'fact' | 'story' | 'emotion' | 'need' | 'choice' | 'summary'>('fact');
  
  const [sessionData, setSessionData] = useState<Partial<MirrorSession>>({
    trigger: '',
    fact: '',
    story: '',
    emotions: [],
    coreNeed: '',
    choice: '',
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    audioEngine.playBowlChime(340, 3);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: MirrorMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsTyping(true);
    audioEngine.playBreathChime('inhale');

    // Thoughtful mirroring pacing
    setTimeout(() => {
      processNextMirrorStep(userMsg.text, nextMessages);
      setIsTyping(false);
      audioEngine.playBowlChime(420, 2);
    }, 1100);
  };

  const processNextMirrorStep = (userText: string, currentHistory: MirrorMessage[]) => {
    const lower = userText.toLowerCase();
    if (lower.includes('kill myself') || lower.includes('end my life') || lower.includes('suicide') || lower.includes('hurt myself')) {
      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: "I hear that you are carrying extraordinary pain right now. Human 2.0 is an awareness tool and not a crisis service.\n\nPlease pause and reach out immediately to people who can support you:\n• US: Call or text 988 (Suicide & Crisis Lifeline)\n• UK: Call 111 or text SHOUT to 85258\n• International: Find your local crisis line at befrienders.org\n\nYou are not alone. Please speak to someone who can hold safe ground with you right now.",
        },
      ]);
      return;
    }

    if (currentStep === 'fact') {
      setSessionData((prev) => ({ ...prev, trigger: userText, fact: userText }));
      setCurrentStep('story');
      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          step: 'story',
          text: `Let's slow it down for a moment.\n\nNow look at your mind's reaction. What story is your mind adding to this event? What assumptions, predictions, or meanings are you attaching?`,
          promptQuestion: "What is your mind telling you about it?",
        },
      ]);
    } else if (currentStep === 'story') {
      setSessionData((prev) => ({ ...prev, story: userText }));
      setCurrentStep('emotion');
      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          step: 'emotion',
          text: `Notice how fast the mind builds a narrative.\n\nNow drop your attention beneath the words and into the body. What physical sensations or emotions are present right now? (e.g. Tightness in chest, heat in face, fear, anger, shame, grief?)`,
          promptQuestion: "What is your body and feeling sensing?",
        },
      ]);
    } else if (currentStep === 'emotion') {
      setSessionData((prev) => ({ ...prev, emotions: [userText] }));
      setCurrentStep('need');
      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          step: 'need',
          text: `That feeling is real and allowed to be here. Don't fight it.\n\nNow, behind that emotion, what is the core need or value that matters deeply to you here? (e.g. Respect, autonomy, honesty, safety, connection?)`,
          promptQuestion: "What core value matters most to you here?",
        },
      ]);
    } else if (currentStep === 'need') {
      setSessionData((prev) => ({ ...prev, coreNeed: userText }));
      setCurrentStep('choice');
      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          step: 'choice',
          text: `You have separated the fact from the story, felt the sensation, and identified what you honor.\n\nNow comes your human sovereignty: What do you want to choose now? What response aligns with your dignity rather than your reflex?`,
          promptQuestion: "What do you consciously choose now?",
        },
      ]);
    } else if (currentStep === 'choice') {
      const finalChoice = userText;
      const completedSession: MirrorSession = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        trigger: sessionData.trigger || '',
        fact: sessionData.fact || '',
        story: sessionData.story || '',
        emotions: sessionData.emotions || [],
        coreNeed: sessionData.coreNeed || '',
        choice: finalChoice,
        completed: true,
      };

      setSessionData(completedSession);
      setCurrentStep('summary');
      onSaveSession(completedSession);
      onRecordMAM('The Human 2.0 Mirror Clarity Session');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#1f5f78', '#d9a44a', '#3c7858'],
        });
      } catch {
        // ignore
      }

      setMessages([
        ...currentHistory,
        {
          id: Date.now().toString(),
          sender: 'ai',
          step: 'summary',
          text: `✦ YOU HAVE REACHED CLARITY ✦\n\n• Fact: "${sessionData.fact}"\n• Mind Story: "${sessionData.story}"\n• Core Value: "${sessionData.coreNeed}"\n• Sovereign Choice: "${finalChoice}"\n\nThis insight is saved to My Human 2.0.\n\nDo not keep chatting. You have enough clarity for now. Close this screen and bring this consciousness into your life.`,
        },
      ]);
    }
  };

  const currentStepIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] text-[#1f2a28] flex flex-col justify-between select-none relative overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#e6dccb] bg-[#f7f3ec]/95 backdrop-blur-sm flex flex-col gap-2 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#17495e] hover:bg-[#efe9df] transition-all"
          >
            <ArrowLeft size={16} />
          </motion.button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1f5f78] animate-ping" />
              <h2 className="text-sm font-serif-title font-bold text-[#17495e]">
                Human 2.0 Mirror
              </h2>
            </div>
            <span className="text-[10px] text-[#5a6663]">
              Fact · Story · Feeling · Need · Choice
            </span>
          </div>

          <div className="w-8 flex justify-end" title="Zero third-party tracking">
            <Shield size={16} className="text-[#3c7858]" />
          </div>
        </div>

        {/* Animated 5-Step Milestone Progress Bar */}
        <div className="flex items-center justify-between gap-1 px-1">
          {STEPS.map((s, idx) => {
            const isPassed = currentStepIdx > idx || currentStep === 'summary';
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isPassed
                      ? 'bg-[#3c7858]'
                      : isCurrent
                      ? 'bg-[#d9a44a] shadow-sm animate-pulse'
                      : 'bg-[#e6dccb]'
                  }`}
                />
                <span
                  className={`text-[8.5px] mt-1 font-mono transition-colors ${
                    isCurrent
                      ? 'text-[#8e6724] font-bold'
                      : isPassed
                      ? 'text-[#3c7858]'
                      : 'text-[#838c89]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages Stream with Spring Animations */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-[#1f5f78] text-white shadow-sm rounded-br-none'
                    : 'bg-white text-[#1f2a28] border border-[#e6dccb] shadow-sm rounded-bl-none font-serif-quote'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'ai' && (
                <span className="text-[9.5px] text-[#838c89] mt-1 ml-2 font-mono flex items-center gap-1">
                  <Sparkles size={10} className="text-[#d9a44a]" />
                  Human 2.0 Clarity Guide
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs text-[#5a6663] bg-white border border-[#e6dccb] px-3.5 py-2 rounded-2xl w-fit shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1f5f78] animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#1f5f78] animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#1f5f78] animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-serif-quote italic ml-1">Holding space...</span>
          </motion.div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Footer / Input area */}
      {currentStep !== 'summary' ? (
        <div className="p-3 border-t border-[#e6dccb] bg-white shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Speak honestly to the mirror..."
              className="flex-1 bg-[#f7f3ec] border border-[#e6dccb] rounded-xl px-3.5 py-2.5 text-xs text-[#1f2a28] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 placeholder:text-[#838c89]"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-[#1f5f78] disabled:opacity-40 text-white flex items-center justify-center shadow-sm hover:bg-[#17495e] transition-all"
            >
              <Send size={15} />
            </motion.button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-[#838c89]">
            <span>Anti-dependency: prompts sovereign choice, not endless chat</span>
            <span className="capitalize text-[#8e6724] font-medium">{currentStep} Step</span>
          </div>
        </div>
      ) : (
        /* Completion Exit Card */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-[#e6dccb] bg-[#e8f1ec] text-center flex flex-col items-center shrink-0"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3c7858] mb-1">
            <CheckCircle2 size={16} />
            <span>Clarity Established</span>
          </div>
          <p className="text-[11px] text-[#5a6663] mb-3">
            Your choice has been sealed into your awareness vault.
          </p>
          <div className="w-full flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentStep('fact');
                setMessages([
                  {
                    id: Date.now().toString(),
                    sender: 'ai',
                    step: 'fact',
                    text: 'The Mirror is reset. What new disturbance would you like to deconstruct?',
                  },
                ]);
              }}
              className="flex-1 py-2.5 rounded-xl bg-white border border-[#e6dccb] text-xs font-semibold text-[#5a6663] hover:bg-[#f7f3ec] transition-all flex items-center justify-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl bg-[#17495e] text-xs font-semibold text-white shadow-sm hover:bg-[#1f5f78] transition-all"
            >
              Take Into My Day
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
