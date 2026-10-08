import React, { useState } from 'react';
import { ArrowLeft, Cpu, UserCheck, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HumanAiScreenProps {
  onBack: () => void;
  onSaveInsight: (text: string, tag: string) => void;
  onRecordMAM: (title: string) => void;
}

export const HumanAiScreen: React.FC<HumanAiScreenProps> = ({ onBack, onSaveInsight, onRecordMAM }) => {
  const [activeTab, setActiveTab] = useState<'pre_prompt' | 'decision_matrix' | 'voice_check'>('pre_prompt');

  // Pre-prompt state
  const [taskInput, setTaskInput] = useState<string>('');
  const [myOwnThought, setMyOwnThought] = useState<string>('');
  const [savedCheck, setSavedCheck] = useState<boolean>(false);

  // Decision matrix state
  const [decisionTitle, setDecisionTitle] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [humanIntuition, setHumanIntuition] = useState<string>('');
  const [humanChoice, setHumanChoice] = useState<string>('');
  const [matrixFinished, setMatrixFinished] = useState<boolean>(false);

  const handlePrePromptSave = () => {
    if (!myOwnThought.trim()) return;
    setSavedCheck(true);
    audioEngine.playBowlChime(440, 3);
    onSaveInsight(
      `Before asking AI about "${taskInput || 'problem'}": I anchored in my own thought: "${myOwnThought}"`,
      'Human + AI Pre-Prompt'
    );
    onRecordMAM('Conscious AI Pre-Prompt Anchor');
  };

  const handleDecisionSave = () => {
    if (!humanChoice.trim()) return;
    setMatrixFinished(true);
    audioEngine.playBowlChime(500, 4);
    onSaveInsight(
      `Decision: "${decisionTitle}". AI suggested logistics: [${aiAnalysis || 'data'}]. My sovereign human decision: "${humanChoice}"`,
      'Sovereign Decision Matrix'
    );
    onRecordMAM('Sovereign Human Decision Over AI');
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
          <div className="flex items-center gap-1.5">
            <Cpu size={14} className="text-[#1f5f78]" />
            <h2 className="text-sm font-serif-title font-bold text-[#17495e]">
              Human + AI Mode
            </h2>
          </div>
          <span className="text-[10px] text-[#8e6724] font-medium">
            Use AI Without Losing Yourself
          </span>
        </div>

        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-1 flex gap-1.5 border-b border-[#e6dccb] bg-white">
        <button
          onClick={() => {
            setActiveTab('pre_prompt');
            audioEngine.playBreathChime('inhale');
          }}
          className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
            activeTab === 'pre_prompt'
              ? 'bg-[#17495e] text-white shadow-sm'
              : 'text-[#5a6663] hover:text-[#17495e]'
          }`}
        >
          Before Asking AI
        </button>

        <button
          onClick={() => {
            setActiveTab('decision_matrix');
            audioEngine.playBreathChime('inhale');
          }}
          className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
            activeTab === 'decision_matrix'
              ? 'bg-[#17495e] text-white shadow-sm'
              : 'text-[#5a6663] hover:text-[#17495e]'
          }`}
        >
          Sovereign Decision
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'pre_prompt' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="bg-[#fdf6ec] p-4 rounded-2xl border border-[#d9a44a]/40">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8e6724] block mb-1">
                The Core Principle
              </span>
              <p className="font-serif-quote italic text-xs text-[#1f2a28] leading-relaxed">
                "If you consult AI before knowing what you think, you train yourself to be a consumer of thought rather than a sovereign creator."
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#17495e] block mb-1">
                1. What task or inquiry are you considering giving to AI?
              </label>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g. Write an email setting boundaries with a client..."
                className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 placeholder:text-[#838c89]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#17495e] block mb-1">
                2. Before prompting: What is your own raw, authentic instinct?
              </label>
              <p className="text-[11px] text-[#5a6663] mb-2">
                Write 2 sentences of what you actually believe, feel, or want, before any AI algorithms shape it.
              </p>
              <textarea
                rows={3}
                value={myOwnThought}
                onChange={(e) => setMyOwnThought(e.target.value)}
                placeholder="What I honestly feel is that this scope creep is unfair, and I want to say no without apologizing..."
                className="w-full p-3 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none focus:ring-2 focus:ring-[#1f5f78]/30 placeholder:text-[#838c89] resize-none"
              />
            </div>

            {!savedCheck ? (
              <button
                disabled={!myOwnThought.trim()}
                onClick={handlePrePromptSave}
                className="w-full py-2.5 rounded-xl bg-[#1f5f78] disabled:opacity-40 text-white font-semibold text-xs shadow-sm hover:bg-[#17495e] transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck size={14} />
                <span>Anchor My Authentic Voice</span>
              </button>
            ) : (
              <div className="bg-[#e8f1ec] text-[#3c7858] p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} />
                <span>Anchored! Now you may consult AI without losing your center.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'decision_matrix' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="bg-[#e8f1ec] p-3.5 rounded-2xl border border-[#3c7858]/30">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#3c7858] block mb-1">
                Separation of Intelligence
              </span>
              <p className="text-xs text-[#1f2a28] leading-relaxed">
                AI calculates logistics (compensation, commute, schedule). <strong>The human makes the sovereign decision</strong> (integrity, purpose, relationships).
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#17495e] block mb-1">
                The Decision at Hand:
              </label>
              <input
                type="text"
                value={decisionTitle}
                onChange={(e) => setDecisionTitle(e.target.value)}
                placeholder="e.g. Should I accept this promotion that requires relocating?"
                className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5a6663] block mb-1">
                What practical factors can AI assist in calculating?
              </label>
              <input
                type="text"
                value={aiAnalysis}
                onChange={(e) => setAiAnalysis(e.target.value)}
                placeholder="e.g. Salary bump, tax differential, cost of living index..."
                className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8e6724] block mb-1">
                What is your somatic intuition sensing?
              </label>
              <textarea
                rows={2}
                value={humanIntuition}
                onChange={(e) => setHumanIntuition(e.target.value)}
                placeholder="Does the thought of this make my body contract or expand?"
                className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#17495e] block mb-1">
                Your Sovereign Human Choice:
              </label>
              <textarea
                rows={2}
                value={humanChoice}
                onChange={(e) => setHumanChoice(e.target.value)}
                placeholder="If fear were quiet, what choice honors my life?"
                className="w-full p-2.5 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none resize-none"
              />
            </div>

            {!matrixFinished ? (
              <button
                disabled={!humanChoice.trim()}
                onClick={handleDecisionSave}
                className="w-full py-2.5 rounded-xl bg-[#d9a44a] text-[#17495e] font-bold text-xs shadow-sm hover:bg-[#c98a05] transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Confirm Sovereign Human Decision</span>
              </button>
            ) : (
              <div className="bg-[#e8f1ec] text-[#3c7858] p-3 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                ✓ Decision sealed into My Human 2.0 Vault. You remain sovereign.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Quote */}
      <div className="p-3 border-t border-[#e6dccb] bg-[#efe9df]/60 text-center">
        <p className="text-[10px] text-[#5a6663] font-serif-quote italic">
          "Human + AI is not about replacing human consciousness; it is about awakening it."
        </p>
      </div>
    </div>
  );
};
