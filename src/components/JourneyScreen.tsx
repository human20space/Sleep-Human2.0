import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Compass, Flame } from 'lucide-react';
import { JOURNEYS_DATA } from '../data/bookContent';
import type { Journey, JourneyDay } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface JourneyScreenProps {
  onBack: () => void;
  onRecordMAM: (title: string) => void;
  onSaveInsight: (text: string, tag: string) => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({ onBack, onRecordMAM, onSaveInsight }) => {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(JOURNEYS_DATA[0]);
  const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);
  const [experimentNote, setExperimentNote] = useState<string>('');
  const [hasCommitted, setHasCommitted] = useState<boolean>(false);

  const handleCommitExperiment = (day: JourneyDay) => {
    setHasCommitted(true);
    audioEngine.playBowlChime(480, 3);
    onRecordMAM(`Committed to Experiment: Day ${day.day} - ${day.title}`);
    if (experimentNote.trim()) {
      onSaveInsight(experimentNote.trim(), `Journey 1 Day ${day.day}`);
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
            12 Transformative Movements
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e]">
            Awareness Journeys
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {!activeDay ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Journey Hero Card */}
          {selectedJourney && (
            <div className="bg-gradient-to-br from-[#17495e] to-[#1f5f78] text-white p-5 rounded-3xl shadow-md border border-[#17495e]/40 relative overflow-hidden">
              <div className="absolute top-2 right-3 text-[#e8b98a]/20">
                <Compass size={80} />
              </div>

              <span className="text-[10px] uppercase tracking-widest font-mono text-[#e8b98a] block mb-1">
                Active Movement · Journey {selectedJourney.number} of 12
              </span>
              <h3 className="font-serif-title text-xl text-[#f7f3ec] font-bold mb-1">
                {selectedJourney.title}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-3 font-serif-quote italic">
                "{selectedJourney.description}"
              </p>

              {/* Progress bar */}
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-[#d9a44a] h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedJourney.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/70 font-mono">
                <span>Progress</span>
                <span>{selectedJourney.progressPercent}% integrated</span>
              </div>
            </div>
          )}

          {/* Days Path */}
          {selectedJourney && selectedJourney.days.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8e6724] mb-2 px-1">
                Daily Behavioral Architecture
              </h4>

              <div className="space-y-2.5">
                {selectedJourney.days.map((day) => (
                  <div
                    key={day.day}
                    onClick={() => {
                      setActiveDay(day);
                      setHasCommitted(false);
                      setExperimentNote('');
                      audioEngine.playBreathChime('inhale');
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-[#e6dccb] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          day.completed
                            ? 'bg-[#e8f1ec] text-[#3c7858]'
                            : 'bg-[#fdf6ec] text-[#d9a44a] border border-[#d9a44a]/40'
                        }`}
                      >
                        {day.completed ? <CheckCircle2 size={16} /> : `D${day.day}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-serif-title font-bold text-[#17495e]">
                            {day.title}
                          </h5>
                          {day.completed && (
                            <span className="text-[9px] bg-[#e8f1ec] text-[#3c7858] font-bold px-1.5 py-0.2 rounded-full">
                              Integrated
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5a6663] line-clamp-1">
                          {day.concept}
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={15} className="text-[#838c89]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All 12 Book Movements List */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8e6724] mb-2 px-1">
              All 12 Book Movements
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {JOURNEYS_DATA.map((j) => (
                <div
                  key={j.id}
                  onClick={() => {
                    setSelectedJourney(j);
                    audioEngine.playBreathChime('inhale');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedJourney?.id === j.id
                      ? 'bg-[#17495e] text-white border-[#17495e]'
                      : 'bg-white text-[#1f2a28] border-[#e6dccb] hover:border-[#17495e]/40'
                  }`}
                >
                  <span className={`text-[9px] font-mono uppercase block mb-0.5 ${selectedJourney?.id === j.id ? 'text-[#e8b98a]' : 'text-[#8e6724]'}`}>
                    Journey {j.number}
                  </span>
                  <h6 className="font-serif-title font-bold text-xs truncate">
                    {j.title}
                  </h6>
                  <p className={`text-[10px] mt-0.5 truncate ${selectedJourney?.id === j.id ? 'text-white/70' : 'text-[#5a6663]'}`}>
                    {j.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Journey Day Interactive Walkthrough */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6dccb]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8e6724] bg-[#fdf6ec] px-2.5 py-0.5 rounded-full border border-[#d9a44a]/30">
                Day {activeDay.day} of Journey
              </span>
              <span className="text-xs font-mono text-[#5a6663]">
                Understand · Notice · Practice · Apply
              </span>
            </div>

            <h3 className="font-serif-title text-xl text-[#17495e] font-bold">
              {activeDay.title}
            </h3>

            {/* Step 1: Understand Concept */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#e6dccb] shadow-sm">
              <span className="text-[9.5px] font-mono tracking-widest text-[#8e6724] uppercase block mb-1">
                1. Understand (The Law)
              </span>
              <p className="font-serif-quote italic text-xs text-[#1f2a28] leading-relaxed">
                "{activeDay.concept}"
              </p>
            </div>

            {/* Step 2: Notice (Inquiry) */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#e6dccb] shadow-sm">
              <span className="text-[9.5px] font-mono tracking-widest text-[#1f5f78] uppercase block mb-1">
                2. Notice (Inquiry)
              </span>
              <p className="text-xs text-[#1f2a28] font-medium leading-relaxed">
                {activeDay.inquiry}
              </p>
            </div>

            {/* Step 3: Practice */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#e6dccb] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono tracking-widest text-[#3c7858] uppercase block mb-0.5">
                  3. Somatic Practice
                </span>
                <p className="text-xs font-semibold text-[#17495e]">
                  {activeDay.practice}
                </p>
              </div>
              <button
                onClick={() => audioEngine.playBowlChime(400, 2.5)}
                className="px-2.5 py-1 rounded-xl bg-[#1f5f78] text-white text-[11px] font-semibold"
              >
                Launch
              </button>
            </div>

            {/* Step 4: Real-Life Experiment */}
            <div className="bg-[#fdf6ec] p-4 rounded-2xl border border-[#d9a44a]/40 shadow-sm">
              <div className="flex items-center gap-1.5 text-[#8e6724] text-xs font-bold uppercase tracking-wider mb-1">
                <Flame size={14} className="text-[#d9a44a]" />
                <span>4. Real-Life Experiment (Today)</span>
              </div>
              <p className="text-xs text-[#1f2a28] font-medium leading-relaxed mb-3">
                {activeDay.experiment}
              </p>

              {!hasCommitted ? (
                <div>
                  <textarea
                    rows={2}
                    value={experimentNote}
                    onChange={(e) => setExperimentNote(e.target.value)}
                    placeholder="Where and when will you test this in your real day?"
                    className="w-full p-2 bg-white border border-[#e6dccb] rounded-xl text-xs text-[#1f2a28] focus:outline-none mb-2 placeholder:text-[#838c89] resize-none"
                  />
                  <button
                    onClick={() => handleCommitExperiment(activeDay)}
                    className="w-full py-2.5 rounded-xl bg-[#d9a44a] text-[#17495e] font-bold text-xs shadow-sm hover:bg-[#c98a05] transition-all"
                  >
                    I Commit to Testing This in Real Life
                  </button>
                </div>
              ) : (
                <div className="bg-[#e8f1ec] text-[#3c7858] p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 size={15} />
                  <span>Experiment Committed! Return tomorrow to reflect.</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveDay(null)}
            className="w-full py-2.5 text-center text-xs text-[#838c89] hover:text-[#17495e] mt-4"
          >
            ← Back to Movement Overview
          </button>
        </div>
      )}
    </div>
  );
};
