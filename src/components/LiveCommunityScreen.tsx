import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Radio,
  Users,
  Calendar,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { LIVE_SESSIONS, COMMUNITY_GROUPS } from '../data/extendedMindfulnessData';
import type { LiveSession } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface LiveCommunityScreenProps {
  onBack: () => void;
}

export const LiveCommunityScreen: React.FC<LiveCommunityScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'community'>('live');
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(['group-morning-10min']);
  const [activeLiveAudio, setActiveLiveAudio] = useState<boolean>(false);

  const handleJoinLive = (session: LiveSession) => {
    hapticsEngine.trigger('hold');
    setJoinedSessionId(session.id);
    const drone = audioEngine.toggleAmbientDrone();
    setActiveLiveAudio(drone);
  };

  const handleLeaveLive = () => {
    hapticsEngine.trigger('tap');
    if (activeLiveAudio) {
      audioEngine.stopDrone();
      setActiveLiveAudio(false);
    }
    setJoinedSessionId(null);
  };

  const handleToggleJoinGroup = (groupId: string) => {
    hapticsEngine.trigger('tap');
    if (joinedGroupIds.includes(groupId)) {
      setJoinedGroupIds(joinedGroupIds.filter((id) => id !== groupId));
    } else {
      setJoinedGroupIds([...joinedGroupIds, groupId]);
      audioEngine.playBreathChime('inhale');
    }
  };

  const activeLiveSession = LIVE_SESSIONS.find((s) => s.id === joinedSessionId);

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (activeLiveAudio) audioEngine.stopDrone();
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
            Global Sangha
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Live & Community
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4">
        {/* Segmented Control */}
        <div className="p-1 rounded-2xl bg-[#efe9df] dark:bg-[#132028] flex items-center gap-1 border border-[#e6dccb] dark:border-[#1d2e38]">
          <button
            onClick={() => {
              hapticsEngine.trigger('tap');
              setActiveTab('live');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-white dark:bg-[#1f3542] text-[#17495e] dark:text-[#e8b98a] shadow-xs font-bold'
                : 'text-[#5a6663] dark:text-[#98abb6] hover:text-[#17495e]'
            }`}
          >
            <Radio size={13} className={activeTab === 'live' ? 'animate-pulse text-[#3c7858]' : ''} />
            <span>Live Sessions</span>
          </button>

          <button
            onClick={() => {
              hapticsEngine.trigger('tap');
              setActiveTab('community');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-white dark:bg-[#1f3542] text-[#17495e] dark:text-[#e8b98a] shadow-xs font-bold'
                : 'text-[#5a6663] dark:text-[#98abb6] hover:text-[#17495e]'
            }`}
          >
            <Users size={13} />
            <span>Community Circles</span>
          </button>
        </div>

        {/* ACTIVE LIVE ROOM MODAL (When user joins a live session) */}
        <AnimatePresence>
          {activeLiveSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-[#17495e] to-[#1f5f78] dark:from-[#0d222c] dark:to-[#173746] text-white shadow-lg space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[9.5px] uppercase font-mono font-bold bg-[#3c7858] text-white px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Connected Live
                </span>
                <span className="text-[10.5px] font-mono text-[#e8b98a]">
                  {activeLiveSession.attendeesCount + 1} practitioners in room
                </span>
              </div>

              <div>
                <h3 className="font-serif-title text-base font-bold text-white">
                  {activeLiveSession.title}
                </h3>
                <p className="text-xs text-white/80">
                  Lead Teacher: {activeLiveSession.teacher} ({activeLiveSession.teacherRole})
                </p>
              </div>

              {/* Live Waveform Stream Simulation */}
              <div className="p-3 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 text-[#e8b98a] flex items-center justify-center">
                    <Volume2 size={14} className="animate-bounce" />
                  </div>
                  <span className="text-xs font-mono">Live Sanctuary Audio</span>
                </div>

                <div className="flex items-center gap-1">
                  {[25, 60, 40, 80, 50, 90, 45, 75, 40, 60].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(20, h * 0.4)}%`] }}
                      transition={{ duration: 0.7 + (i % 3) * 0.15, repeat: Infinity }}
                      className="w-1 bg-[#e8b98a] rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/60">
                  Shared Intention: "Holding space for calm in turbulent times"
                </span>
                <button
                  onClick={handleLeaveLive}
                  className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer"
                >
                  Leave Room
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: LIVE SESSIONS LIST */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Today's Live Teacher Broadcasts
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Interactive Audio Rooms
              </span>
            </div>

            <div className="space-y-2.5">
              {LIVE_SESSIONS.map((session) => {
                const isConnected = joinedSessionId === session.id;

                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-2.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {session.isLiveNow ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#3c7858]/15 dark:bg-[#3c7858]/30 text-[#3c7858] dark:text-[#52a378] text-[9.5px] font-mono font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3c7858] animate-ping" />
                              LIVE NOW
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#efe9df] dark:bg-[#1a2b36] text-[#5a6663] dark:text-[#98abb6] text-[9.5px] font-mono font-bold flex items-center gap-1">
                              <Calendar size={10} />
                              {session.startTime}
                            </span>
                          )}
                          <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                            · {session.tradition}
                          </span>
                        </div>

                        <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6] leading-snug">
                          {session.title}
                        </h3>
                        <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed mt-0.5">
                          {session.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-[#838c89] dark:text-[#98abb6]">
                        <Users size={12} />
                        <span>{session.attendeesCount}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e6dccb]/60 dark:border-[#1d2e38] flex items-center justify-between">
                      <span className="text-[10.5px] text-[#8e6724] dark:text-[#e8b98a] font-semibold">
                        Teacher: {session.teacher}
                      </span>

                      {session.isLiveNow ? (
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleJoinLive(session)}
                          className="px-3 py-1.5 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Radio size={12} />
                          <span>{isConnected ? 'In Room' : 'Join Live Room'}</span>
                        </motion.button>
                      ) : (
                        <button
                          onClick={() => {
                            hapticsEngine.trigger('tap');
                            alert(`RSVP confirmed for "${session.title}". You will receive a calendar notification.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#efe9df] dark:bg-[#1b2f3d] text-[#17495e] dark:text-[#e8b98a] text-xs font-semibold hover:bg-[#e6dccb] transition-colors cursor-pointer"
                        >
                          RSVP & Add Reminder
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COMMUNITY CIRCLES LIST */}
        {activeTab === 'community' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Interest & Practice Circles
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Organized by Lifestyle
              </span>
            </div>

            <div className="space-y-2.5">
              {COMMUNITY_GROUPS.map((group) => {
                const isMember = joinedGroupIds.includes(group.id);

                return (
                  <motion.div
                    key={group.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-2.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] bg-[#fdf6ec] dark:bg-[#18262f] px-2 py-0.5 rounded-full font-mono">
                            {group.category}
                          </span>
                          <span className="text-[10px] text-[#3c7858] dark:text-[#52a378] font-mono">
                            ● {group.activeNowCount} active now
                          </span>
                        </div>

                        <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6]">
                          {group.name}
                        </h3>
                        <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] mt-0.5 leading-snug">
                          {group.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleJoinGroup(group.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          isMember
                            ? 'bg-[#e8f1ec] dark:bg-[#153123] text-[#3c7858] dark:text-[#52a378] border border-[#3c7858]/30'
                            : 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317]'
                        }`}
                      >
                        {isMember ? 'Joined ✓' : 'Join Circle'}
                      </button>
                    </div>

                    {/* Latest Community Thought Ticker */}
                    <div className="p-2.5 rounded-xl bg-[#f7f3ec] dark:bg-[#0e181e] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center gap-2 text-[10.5px]">
                      <MessageSquare size={13} className="text-[#8e6724] dark:text-[#e8b98a] shrink-0" />
                      <span className="text-[#1f2a28] dark:text-[#f1ede6] italic truncate">
                        {group.latestDiscussion}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
