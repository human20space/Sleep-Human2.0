import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Play, CheckCircle } from 'lucide-react';
import type { Practice, PracticeDuration } from '../types';
import { CONTEXTUAL_PRACTICES } from '../data/bookContent';
import { audioEngine } from '../utils/audioEngine';
import confetti from 'canvas-confetti';

interface PracticeScreenProps {
  onBack: () => void;
  onRecordMAM: (title: string) => void;
  onSaveInsight: (text: string, tag: string) => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({ onBack, onRecordMAM, onSaveInsight }) => {
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('3min');
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [reflectionInput, setReflectionInput] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const filteredPractices = CONTEXTUAL_PRACTICES.filter(
    (p) => p.duration === selectedDuration
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            audioEngine.playBowlChime(440, 4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startPractice = (practice: Practice) => {
    setActivePractice(practice);
    setCurrentStepIdx(0);
    setTimerSeconds(practice.durationSeconds);
    setIsTimerRunning(true);
    setIsCompleted(false);
    audioEngine.playBowlChime(320, 3.5);
  };

  const handleCompletePractice = () => {
    setIsCompleted(true);
    setIsTimerRunning(false);
    audioEngine.playBowlChime(520, 5);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#1f5f78', '#d9a44a', '#3c7858'],
      });
    } catch {
      // ignore
    }

    if (activePractice) {
      onRecordMAM(`Completed: ${activePractice.title}`);
      if (reflectionInput.trim()) {
        onSaveInsight(reflectionInput.trim(), activePractice.title);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#f7f3ec] text-[#1f2a28] flex flex-col justify-between select-none relative overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] bg-[#f7f3ec] flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#17495e] hover:bg-[#efe9df] transition-all"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8e6724]">
            Contextual Awareness
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e]">
            Practices & Resets
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {!activePractice ? (
        /* Practice Browser */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {/* Duration Filters */}
          <div className="flex gap-1.5 p-1 bg-[#efe9df] rounded-2xl mb-4 border border-[#e6dccb]">
            {(['30s', '3min', '10min', '20min'] as PracticeDuration[]).map((dur) => (
              <button
                key={dur}
                onClick={() => {
                  setSelectedDuration(dur);
                  audioEngine.playBreathChime('inhale');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDuration === dur
                    ? 'bg-[#17495e] text-white shadow-sm'
                    : 'text-[#5a6663] hover:text-[#17495e]'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#5a6663] mb-3 font-serif-quote italic px-1">
            "Practice should be contextual. When you have a difficult meeting in 5 minutes, you need a 2-minute ground, not 47 meditations."
          </p>

          {/* Practice Cards */}
          <div className="space-y-3">
            {filteredPractices.map((practice) => (
              <div
                key={practice.id}
                onClick={() => startPractice(practice)}
                className="bg-white p-4 rounded-2xl border border-[#e6dccb] shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6724] bg-[#fdf6ec] px-2 py-0.5 rounded-full border border-[#d9a44a]/30">
                    {practice.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#5a6663] font-mono">
                    <Clock size={12} className="text-[#1f5f78]" />
                    <span>{practice.duration}</span>
                  </div>
                </div>

                <h3 className="font-serif-title font-semibold text-sm text-[#17495e] group-hover:text-[#1f5f78] transition-colors mb-1">
                  {practice.title}
                </h3>

                <p className="text-xs text-[#1f2a28] font-medium mb-1.5 leading-snug">
                  {practice.shortDesc}
                </p>

                <p className="text-[11px] text-[#838c89] leading-tight">
                  <span className="font-semibold text-[#5a6663]">When: </span>
                  {practice.situation}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#f7f3ec] flex items-center justify-between text-xs text-[#1f5f78] font-semibold">
                  <span className="text-[11px]">Begin practice</span>
                  <div className="w-6 h-6 rounded-full bg-[#1f5f78] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={11} className="fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Practice Session Runner */
        <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8e6724] bg-[#fdf6ec] px-2.5 py-0.5 rounded-full border border-[#d9a44a]/40">
                {activePractice.category}
              </span>

              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#17495e] bg-white px-3 py-1 rounded-full border border-[#e6dccb]">
                <Clock size={14} className="text-[#d9a44a]" />
                <span>
                  {Math.floor(timerSeconds / 60)}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            <h3 className="font-serif-title text-xl text-[#17495e] mb-2">
              {activePractice.title}
            </h3>

            {/* Stepped Guidance Card */}
            {!isCompleted ? (
              <div className="bg-white p-5 rounded-2xl border border-[#e6dccb] shadow-sm my-4">
                <span className="text-[10px] font-mono text-[#838c89] tracking-wider uppercase block mb-1">
                  Guidance {currentStepIdx + 1} of {activePractice.steps.length}
                </span>
                <p className="font-serif-quote text-base text-[#1f2a28] leading-relaxed italic mb-4">
                  "{activePractice.steps[currentStepIdx]}"
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={currentStepIdx === 0}
                    onClick={() => setCurrentStepIdx((i) => i - 1)}
                    className="flex-1 py-1.5 rounded-xl border border-[#e6dccb] text-xs font-semibold text-[#5a6663] disabled:opacity-30"
                  >
                    Previous
                  </button>
                  {currentStepIdx < activePractice.steps.length - 1 ? (
                    <button
                      onClick={() => {
                        audioEngine.playBreathChime('inhale');
                        setCurrentStepIdx((i) => i + 1);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-[#1f5f78] text-xs font-semibold text-white shadow-sm"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={handleCompletePractice}
                      className="flex-1 py-1.5 rounded-xl bg-[#3c7858] text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={13} />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Completion & Reflection */
              <div className="bg-[#e8f1ec] p-5 rounded-2xl border border-[#3c7858]/30 my-4 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-[#3c7858] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle size={24} />
                </div>
                <h4 className="font-serif-title text-lg text-[#17495e] mb-1">
                  Practice Complete
                </h4>
                <p className="text-xs text-[#5a6663] mb-4">
                  What did you notice in your body or mind?
                </p>

                <textarea
                  rows={2}
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Optional: Record one insight..."
                  className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none focus:ring-1 focus:ring-[#3c7858] mb-3 resize-none placeholder:text-[#838c89]"
                />

                <button
                  onClick={() => {
                    handleCompletePractice();
                    setActivePractice(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#17495e] text-white font-semibold text-xs shadow-sm hover:bg-[#1f5f78]"
                >
                  Save & Return to Practices
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActivePractice(null)}
            className="w-full py-2 text-center text-xs text-[#838c89] hover:text-[#17495e] transition-colors"
          >
            Leave Practice
          </button>
        </div>
      )}
    </div>
  );
};
