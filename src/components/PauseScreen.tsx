import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Smartphone } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface PauseScreenProps {
  onBack: () => void;
  onSaveInsight: (text: string, tag: string) => void;
  onRecordMAM: (title: string) => void;
}

type Phase = 'breathe' | 'notice' | 'adding' | 'matters' | 'choose' | 'complete';

export const PauseScreen: React.FC<PauseScreenProps> = ({ onBack, onSaveInsight, onRecordMAM }) => {
  const [phase, setPhase] = useState<Phase>('breathe');
  const [breathText, setBreathText] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [factInput, setFactInput] = useState<string>('');
  const [storyInput, setStoryInput] = useState<string>('');
  const [needInput, setNeedInput] = useState<string>('');
  const [choiceInput, setChoiceInput] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => hapticsEngine.enabled);

  const toggleHaptics = () => {
    const nextVal = !hapticsEnabled;
    hapticsEngine.setEnabled(nextVal);
    setHapticsEnabled(nextVal);
  };

  // Sound, Somatic Haptics, and countdown during breathing phase
  useEffect(() => {
    audioEngine.playBowlChime(360, 4);
    hapticsEngine.trigger('inhale');

    const breathInterval = setInterval(() => {
      setBreathText((prev) => {
        if (prev === 'Inhale') {
          audioEngine.playBreathChime('hold');
          hapticsEngine.trigger('hold');
          return 'Hold';
        }
        if (prev === 'Hold') {
          audioEngine.playBreathChime('exhale');
          hapticsEngine.trigger('exhale');
          return 'Exhale';
        }
        audioEngine.playBreathChime('inhale');
        hapticsEngine.trigger('inhale');
        return 'Inhale';
      });
    }, 3200);

    const timer = setInterval(() => {
      setSecondsRemaining((sec) => (sec > 0 ? sec - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(breathInterval);
      clearInterval(timer);
    };
  }, []);

  const handleFinish = () => {
    setPhase('complete');
    audioEngine.playBowlChime(480, 5);
    hapticsEngine.trigger('finish');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1f5f78', '#d9a44a', '#e8b98a'],
      });
    } catch {
      // ignore
    }

    const summaryText = choiceInput.trim()
      ? `Choice: "${choiceInput}" (Instead of reacting to: ${storyInput || 'impulse'})`
      : 'Completed 30-Second Sovereign Pause before reacting.';

    onSaveInsight(summaryText, 'Pause Reflection');
    onRecordMAM('The 30-Second Sovereign Pause');
  };

  const breathScale = breathText === 'Inhale' ? 1.22 : breathText === 'Hold' ? 1.22 : 0.88;

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-y-auto transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e6dccb] dark:border-[#1d2e38] shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            hapticsEngine.trigger('tap');
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-sm border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8e6724] dark:text-[#e8b98a]">
            Emergency Reset
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Pause Before You Respond
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Somatic Haptics Toggle Chip */}
          <button
            onClick={toggleHaptics}
            className={`px-2 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              hapticsEnabled
                ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] border-[#17495e] dark:border-[#e8b98a]'
                : 'bg-white dark:bg-[#14232c] text-[#838c89] dark:text-[#6c8491] border-[#e6dccb] dark:border-[#1d2e38]'
            }`}
            title={hapticsEnabled ? 'Somatic Haptics Guidance Active' : 'Enable Haptic Breathing Vibration'}
          >
            <Smartphone size={10} className={hapticsEnabled ? 'animate-pulse' : ''} />
            <span className="hidden xs:inline">{hapticsEnabled ? 'Haptics On' : 'Haptics Off'}</span>
          </button>

          <div className="text-xs font-mono font-medium text-[#5a6663] dark:text-[#98abb6] bg-white dark:bg-[#14232c] px-2.5 py-0.5 rounded-full border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs">
            {secondsRemaining}s
          </div>
        </div>
      </div>

      {/* Dynamic Content by Phase */}
      <div className="my-auto py-3 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === 'breathe' && (
            <motion.div
              key="breathe"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center max-w-xs w-full"
            >
              {/* Concentric Multi-Ring Somatic Breathing Sphere */}
              <div className="relative my-6 flex items-center justify-center w-52 h-52">
                {/* Outermost expanding halo */}
                <motion.div
                  animate={{ scale: breathScale * 1.15, opacity: breathText === 'Inhale' ? 0.35 : 0.15 }}
                  transition={{ duration: 3.2, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1f5f78] via-[#d9a44a] to-[#e8b98a] filter blur-xl"
                />

                {/* Concentric Ring 1 */}
                <motion.div
                  animate={{ scale: breathScale * 1.05 }}
                  transition={{ duration: 3.2, ease: 'easeInOut' }}
                  className="absolute w-44 h-44 rounded-full border border-[#d9a44a]/40 dark:border-[#e8b98a]/30 bg-[#d9a44a]/10 dark:bg-[#e8b98a]/5"
                />

                {/* Concentric Ring 2 (Core breathing circle) */}
                <motion.div
                  animate={{ scale: breathScale }}
                  transition={{ duration: 3.2, ease: 'easeInOut' }}
                  className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-[#1f5f78]/25 via-[#d9a44a]/30 to-[#e8b98a]/40 border-2 border-[#1f5f78]/40 dark:border-[#e8b98a]/40 shadow-lg flex items-center justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-[#121f26] shadow-md flex flex-col items-center justify-center text-[#17495e] dark:text-[#f1ede6] transition-colors">
                    <motion.span
                      key={breathText}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs uppercase tracking-widest font-bold text-[#8e6724] dark:text-[#e8b98a]"
                    >
                      {breathText}
                    </motion.span>
                    <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6] mt-0.5 font-mono">
                      Drop shoulders
                    </span>
                  </div>
                </motion.div>
              </div>

              <h3 className="font-serif-title text-xl text-[#17495e] dark:text-[#e8b98a] mb-1.5">
                Stop everything for 30 seconds.
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] leading-relaxed mb-6 font-serif-quote italic">
                "Between stimulus and response there is a space. In that space lies your freedom."
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  audioEngine.playBowlChime(400, 3);
                  setPhase('notice');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1f5f78] dark:bg-[#17495e] text-white font-semibold text-xs shadow-md hover:bg-[#17495e] dark:hover:bg-[#1f5f78] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>I am breathing. What happened?</span>
                <Sparkles size={14} className="text-[#e8b98a] animate-pulse" />
              </motion.button>
            </motion.div>
          )}

          {phase === 'notice' && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xs text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#8e6724] dark:text-[#e8b98a]">
                  Step 1 of 4 · Physical Reality
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9a44a] animate-ping" />
              </div>
              <h3 className="font-serif-title text-lg text-[#17495e] dark:text-[#f1ede6] mb-1 font-bold">
                What actually happened?
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] mb-3">
                Only write what a neutral camera would record. Strip away blame or assumptions.
              </p>

              <textarea
                rows={3}
                value={factInput}
                onChange={(e) => setFactInput(e.target.value)}
                placeholder="e.g. He did not reply to my text for 4 hours..."
                className="w-full p-3 bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] rounded-2xl text-xs text-[#1f2a28] dark:text-[#f1ede6] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 dark:focus:ring-[#e8b98a]/30 placeholder:text-[#838c89] dark:placeholder:text-[#6c8491] resize-none mb-4 shadow-2xs"
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!factInput.trim()}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  audioEngine.playBowlChime(380, 2);
                  setPhase('adding');
                }}
                className="w-full py-3 rounded-xl bg-[#1f5f78] dark:bg-[#17495e] disabled:opacity-40 text-white font-semibold text-xs shadow-sm hover:bg-[#17495e] dark:hover:bg-[#1f5f78] transition-all cursor-pointer"
              >
                Next: What is my mind adding?
              </motion.button>
            </motion.div>
          )}

          {phase === 'adding' && (
            <motion.div
              key="adding"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xs text-left"
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#8e6724] dark:text-[#e8b98a] block mb-1">
                Step 2 of 4 · The Story
              </span>
              <h3 className="font-serif-title text-lg text-[#17495e] dark:text-[#f1ede6] mb-1 font-bold">
                What story is your mind spinning?
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] mb-3">
                Notice the narrative: rejection, disrespect, catastrophic fear, or defense?
              </p>

              <textarea
                rows={3}
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
                placeholder="e.g. They don't respect my time; they are purposely avoiding me..."
                className="w-full p-3 bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] rounded-2xl text-xs text-[#1f2a28] dark:text-[#f1ede6] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 dark:focus:ring-[#e8b98a]/30 placeholder:text-[#838c89] dark:placeholder:text-[#6c8491] resize-none mb-4 shadow-2xs"
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!storyInput.trim()}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  audioEngine.playBowlChime(420, 2);
                  setPhase('matters');
                }}
                className="w-full py-3 rounded-xl bg-[#1f5f78] dark:bg-[#17495e] disabled:opacity-40 text-white font-semibold text-xs shadow-sm hover:bg-[#17495e] dark:hover:bg-[#1f5f78] transition-all cursor-pointer"
              >
                Next: What matters to me?
              </motion.button>
            </motion.div>
          )}

          {phase === 'matters' && (
            <motion.div
              key="matters"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xs text-left"
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#8e6724] dark:text-[#e8b98a] block mb-1">
                Step 3 of 4 · Inner Core
              </span>
              <h3 className="font-serif-title text-lg text-[#17495e] dark:text-[#f1ede6] mb-1 font-bold">
                What genuinely matters here?
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] mb-3">
                Beyond the ego's urge to strike back, what value are you honoring?
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {['Dignity', 'Peace', 'Clarity', 'Self-Respect', 'Connection', 'Honesty'].map((tag) => (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    key={tag}
                    onClick={() => {
                      hapticsEngine.trigger('tap');
                      setNeedInput(tag);
                    }}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      needInput === tag
                        ? 'bg-[#1f5f78] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] border-[#1f5f78] dark:border-[#e8b98a] shadow-xs'
                        : 'bg-white dark:bg-[#14232c] text-[#5a6663] dark:text-[#98abb6] border-[#e6dccb] dark:border-[#1d2e38] hover:border-[#1f5f78]'
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>

              <input
                type="text"
                value={needInput}
                onChange={(e) => setNeedInput(e.target.value)}
                placeholder="Or type your core need here..."
                className="w-full p-2.5 bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] rounded-xl text-xs text-[#1f2a28] dark:text-[#f1ede6] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 dark:focus:ring-[#e8b98a]/30 placeholder:text-[#838c89] dark:placeholder:text-[#6c8491] mb-4"
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!needInput.trim()}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  audioEngine.playBowlChime(460, 2);
                  setPhase('choose');
                }}
                className="w-full py-3 rounded-xl bg-[#1f5f78] dark:bg-[#17495e] disabled:opacity-40 text-white font-semibold text-xs shadow-sm hover:bg-[#17495e] dark:hover:bg-[#1f5f78] transition-all cursor-pointer"
              >
                Next: Conscious Sovereign Choice
              </motion.button>
            </motion.div>
          )}

          {phase === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-xs text-left"
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#8e6724] dark:text-[#e8b98a] block mb-1">
                Step 4 of 4 · Human Sovereignty
              </span>
              <h3 className="font-serif-title text-lg text-[#17495e] dark:text-[#f1ede6] mb-1 font-bold">
                How do you choose to respond?
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] mb-3">
                Not from automatic reaction, but from centered awareness.
              </p>

              <textarea
                rows={3}
                value={choiceInput}
                onChange={(e) => setChoiceInput(e.target.value)}
                placeholder="e.g. I will wait until tomorrow morning to reply calmly, without guilt..."
                className="w-full p-3 bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] rounded-2xl text-xs text-[#1f2a28] dark:text-[#f1ede6] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 dark:focus:ring-[#e8b98a]/30 placeholder:text-[#838c89] dark:placeholder:text-[#6c8491] resize-none mb-4 shadow-2xs"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={!choiceInput.trim()}
                onClick={handleFinish}
                className="w-full py-3.5 rounded-2xl bg-[#d9a44a] dark:bg-[#e8b98a] hover:bg-[#c98a05] dark:hover:bg-[#f0c79c] text-[#17495e] dark:text-[#0b1317] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Seal My Conscious Choice</span>
              </motion.button>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex flex-col items-center max-w-xs text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#e8f1ec] dark:bg-[#153123] text-[#3c7858] dark:text-[#52a378] flex items-center justify-center mb-4 shadow-md animate-bounce">
                <ShieldCheck size={34} />
              </div>

              <span className="text-[10.5px] font-mono tracking-widest uppercase text-[#3c7858] dark:text-[#52a378] font-bold">
                +1 Meaningful Awareness Moment
              </span>
              <h3 className="font-serif-title text-2xl text-[#17495e] dark:text-[#e8b98a] mt-1 mb-2 font-bold">
                You reclaimed your sovereignty.
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#98abb6] leading-relaxed mb-6 font-serif-quote italic">
                "You have enough clarity now. Do not stay on this screen. Take this conscious choice into your real life."
              </p>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  onBack();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] font-semibold text-xs shadow-md hover:bg-[#1f5f78] dark:hover:bg-[#f0c79c] transition-all cursor-pointer"
              >
                Return to Life
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer reassurance */}
      <div className="pt-2 text-center border-t border-[#e6dccb]/70 dark:border-[#1d2e38] shrink-0">
        <p className="text-[10px] text-[#838c89] dark:text-[#6c8491] flex items-center justify-center gap-1">
          <ShieldCheck size={11} className="text-[#3c7858] dark:text-[#52a378]" />
          <span>100% Private. Stored securely on your device only.</span>
        </p>
      </div>
    </div>
  );
};
