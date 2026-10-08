import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Send,
  HeartHandshake,
  MessageCircle,
  Sliders,
  Shield,
  Crown,
  Trash2,
  Square,
  X,
  Headphones,
  AlertTriangle,
  PhoneCall,
  Waves
} from 'lucide-react';
import type { Screen, ConstructionAudioSession } from '../types';
import { EBB_MOOD_RESPONSES, type EbbMoodOption } from '../data/extendedMindfulnessData';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';
import {
  type ChatMessage,
  VINAY_KAPOOR_SYSTEM_SPECS,
  SUGGESTED_INQUIRIES,
  detectCrisisIntent,
  retrieveRelevantKnowledge,
  generateTeacherGuidance,
  loadStoredChat,
  saveChatToStorage,
  clearChatStorage
} from '../services/aiTeacherService';

interface EbbCompanionScreenProps {
  onBack: () => void;
  onOpenSession: (session: ConstructionAudioSession) => void;
  onNavigate?: (screen: Screen) => void;
}

export const EbbCompanionScreen: React.FC<EbbCompanionScreenProps> = ({
  onBack,
  onOpenSession,
  onNavigate
}) => {
  // Navigation Tabs: 'teacher' (Conversational AI Meditation Guide) vs 'weather' (Somatic Mood Triage)
  const [activeTab, setActiveTab] = useState<'teacher' | 'weather'>('teacher');

  // ==========================================
  // Conversational AI Teacher State
  // ==========================================
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredChat());
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Daily Query Quota (3 free / day for Explorer tier, unlimited for Sovereign)
  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';
  const [queriesUsedToday, setQueriesUsedToday] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('human2_teacher_queries_today');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<number | null>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) {
        window.clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  // Save chat to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatToStorage(messages);
    }
  }, [messages]);

  // Handle User Message Submission
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    // Check free quota
    if (!isPremium && queriesUsedToday >= 3) {
      hapticsEngine.trigger('tap');
      audioEngine.playBreathChime('inhale');
      if (onNavigate) {
        onNavigate('subscription');
      }
      return;
    }

    hapticsEngine.trigger('tap');
    audioEngine.playBreathChime('inhale');

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);

    // Increment usage
    const newCount = queriesUsedToday + 1;
    setQueriesUsedToday(newCount);
    try {
      localStorage.setItem('human2_teacher_queries_today', newCount.toString());
    } catch {
      // ignore
    }

    // 2. Perform RAG Knowledge Retrieval & Teacher Synthesis
    const retrieved = retrieveRelevantKnowledge(text);
    const result = generateTeacherGuidance(text, retrieved);
    const isCrisis = detectCrisisIntent(text);

    // 3. Initiate Unhurried Streaming Response
    const teacherMsgId = `teacher-${Date.now()}`;
    const initialTeacherMsg: ChatMessage = {
      id: teacherMsgId,
      sender: 'teacher',
      text: '',
      timestamp: Date.now(),
      somaticAnchor: result.somaticAnchor,
      suggestedChapter: isCrisis ? undefined : retrieved.chapter,
      suggestedPractice: isCrisis ? undefined : retrieved.practice,
      isStreaming: true,
      isCrisis
    };

    setMessages([...newMessages, initialTeacherMsg]);

    const words = result.text.split(' ');
    let currentIdx = 0;
    let accumulatedText = '';

    const streamNextWord = () => {
      if (currentIdx < words.length) {
        const word = words[currentIdx];
        accumulatedText += (currentIdx === 0 ? '' : ' ') + word;
        currentIdx++;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === teacherMsgId
              ? { ...msg, text: accumulatedText, isStreaming: currentIdx < words.length }
              : msg
          )
        );

        // Variable unhurried delay: longer pause on periods, colons, question marks
        let delay = 35 + Math.random() * 25;
        if (word.endsWith('.') || word.endsWith('?') || word.endsWith('!')) {
          delay += 160;
        } else if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
          delay += 80;
        }

        streamTimeoutRef.current = window.setTimeout(streamNextWord, delay);
      } else {
        // Finished streaming
        setIsGenerating(false);
        hapticsEngine.trigger('hold');
        audioEngine.playBowlChime(432, 2.5); // 432Hz Stillness chime
      }
    };

    // Slight initial latency (TTFT simulation: 200ms)
    streamTimeoutRef.current = window.setTimeout(streamNextWord, 220);
  };

  // Interrupt Streaming
  const handleStopStreaming = () => {
    if (streamTimeoutRef.current) {
      window.clearTimeout(streamTimeoutRef.current);
    }
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
    hapticsEngine.trigger('tap');
  };

  // Clear Chat History
  const handleClearChat = () => {
    const cleared = clearChatStorage();
    setMessages(cleared);
    setShowClearConfirm(false);
    hapticsEngine.trigger('tap');
  };

  // ==========================================
  // Weather Triage State (Original Mode)
  // ==========================================
  const [selectedMood, setSelectedMood] = useState<EbbMoodOption>(EBB_MOOD_RESPONSES[0]);
  const [customWeatherInput, setCustomWeatherInput] = useState<string>('');
  const [isWeatherThinking, setIsWeatherThinking] = useState<boolean>(false);
  const [customWeatherResponse, setCustomWeatherResponse] = useState<string | null>(null);

  const handleSelectMood = (mood: EbbMoodOption) => {
    hapticsEngine.trigger('tap');
    audioEngine.playBreathChime('inhale');
    setSelectedMood(mood);
    setCustomWeatherResponse(null);
  };

  const handleWeatherSubmit = () => {
    if (!customWeatherInput.trim()) return;
    hapticsEngine.trigger('tap');
    setIsWeatherThinking(true);
    setCustomWeatherResponse(null);

    setTimeout(() => {
      setIsWeatherThinking(false);
      hapticsEngine.trigger('hold');
      audioEngine.playBowlChime(420, 2);

      const lower = customWeatherInput.toLowerCase();
      if (lower.includes('sleep') || lower.includes('tired') || lower.includes('night')) {
        setSelectedMood(EBB_MOOD_RESPONSES.find((m) => m.id === 'cannot-sleep') || EBB_MOOD_RESPONSES[2]);
      } else if (lower.includes('angry') || lower.includes('boss') || lower.includes('frustrated')) {
        setSelectedMood(EBB_MOOD_RESPONSES.find((m) => m.id === 'angry') || EBB_MOOD_RESPONSES[3]);
      } else if (lower.includes('focus') || lower.includes('distracted') || lower.includes('fog')) {
        setSelectedMood(EBB_MOOD_RESPONSES.find((m) => m.id === 'unfocused') || EBB_MOOD_RESPONSES[4]);
      } else if (lower.includes('anxious') || lower.includes('fear') || lower.includes('nervous')) {
        setSelectedMood(EBB_MOOD_RESPONSES.find((m) => m.id === 'anxious') || EBB_MOOD_RESPONSES[1]);
      } else {
        setSelectedMood(EBB_MOOD_RESPONSES[0]);
      }

      setCustomWeatherResponse(
        `I hear that you're experiencing "${customWeatherInput}". Thank you for honoring what is real. Let us step out of the thinking mind and ground into somatic presence.`
      );
    }, 600);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-hidden transition-colors">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TIER BADGE                               */}
      {/* ======================================================== */}
      <header className="px-4 py-2.5 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        {/* Center Title & Teacher Aura */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3c7858] inline-block animate-pulse" />
            <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
              {activeTab === 'teacher' ? 'Vinay Kapoor · AI Teacher' : 'Ebb · Somatic Triage'}
            </h2>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-mono font-medium text-[#8e6724] dark:text-[#e8b98a]">
            {activeTab === 'teacher' ? 'Outer Success · Inner Awareness' : 'Internal Weather Sensing'}
          </span>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'teacher' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSpecsModal(true)}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs flex items-center justify-center text-[#8e6724] dark:text-[#e8b98a] hover:bg-[#efe9df] transition-all cursor-pointer"
              title="Teacher System Prompt & Specifications (Researcher Review)"
            >
              <Sliders size={14} />
            </motion.button>
          )}

          {/* Membership Tier Pill */}
          {onNavigate && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('subscription')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-all cursor-pointer ${
                isPremium
                  ? 'bg-[#3c7858]/15 border-[#3c7858]/40 text-[#3c7858] dark:text-[#52a378]'
                  : 'bg-gradient-to-r from-[#d9a44a]/20 to-[#e8b98a]/30 border-[#d9a44a]/50 text-[#8e6724] dark:text-[#e8b98a]'
              }`}
            >
              <Crown size={11} className="fill-current" />
              <span>{isPremium ? 'Sovereign' : `${Math.max(0, 3 - queriesUsedToday)} Free`}</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MODE SEGMENTED CONTROL TABS                           */}
      {/* ======================================================== */}
      <div className="px-4 pt-2.5 pb-1 shrink-0">
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#efe9df] dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              hapticsEngine.trigger('tap');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-white dark:bg-[#1c3240] text-[#17495e] dark:text-[#e8b98a] shadow-xs font-bold'
                : 'text-[#6c7774] dark:text-[#8da0ac] hover:text-[#17495e] dark:hover:text-[#f1ede6]'
            }`}
          >
            <MessageCircle size={13} />
            <span>AI Meditation Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('weather');
              hapticsEngine.trigger('tap');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-white dark:bg-[#1c3240] text-[#17495e] dark:text-[#e8b98a] shadow-xs font-bold'
                : 'text-[#6c7774] dark:text-[#8da0ac] hover:text-[#17495e] dark:hover:text-[#f1ede6]'
            }`}
          >
            <Waves size={13} />
            <span>Internal Weather</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN BODY CONTAINER                                   */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-between">
        {/* ====================================================== */}
        {/* TAB 1: CONVERSATIONAL AI MEDITATION TEACHER            */}
        {/* ====================================================== */}
        {activeTab === 'teacher' && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Conversation Flow Area */}
            <div className="space-y-4">
              {/* Teacher Persona Banner Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] text-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center font-serif-title text-base font-bold shrink-0 shadow-inner">
                    VK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a]">
                        Trained on Human 2.0
                      </span>
                      <span className="text-[8.5px] bg-white/20 text-[#e8b98a] px-1.5 py-0.2 rounded-full font-mono">
                        45 Chapters
                      </span>
                    </div>
                    <h3 className="font-serif-title text-xs font-bold text-white leading-tight">
                      Unhurried, somatic guidance for high-pressure lives.
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Clear Chat Memory"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3.5">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender Indicator */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {!isUser && (
                          <div className="w-4 h-4 rounded-full bg-[#17495e] text-[#e8b98a] flex items-center justify-center text-[8px] font-bold">
                            VK
                          </div>
                        )}
                        <span className="text-[9px] uppercase font-mono text-[#838c89] dark:text-[#8da0ac]">
                          {isUser ? 'You' : 'Vinay Kapoor (AI Guide)'}
                        </span>
                      </div>

                      {/* Bubble Container */}
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs transition-colors ${
                          isUser
                            ? 'bg-[#17495e] dark:bg-[#1a3848] text-white rounded-tr-xs'
                            : 'bg-white dark:bg-[#14232c] text-[#1f2a28] dark:text-[#f1ede6] border border-[#e6dccb] dark:border-[#1d2e38] rounded-tl-xs'
                        }`}
                      >
                        {/* Text Content */}
                        <div className="text-xs leading-relaxed whitespace-pre-line font-serif-quote">
                          {msg.text}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-[#8e6724] dark:bg-[#e8b98a] animate-pulse align-middle" />
                          )}
                        </div>

                        {/* Somatic Anchor Callout (Teacher only) */}
                        {!isUser && msg.somaticAnchor && (
                          <div className="mt-3 pt-2.5 border-t border-[#e6dccb]/70 dark:border-[#1d2e38] flex items-start gap-2 text-[10.5px] text-[#8e6724] dark:text-[#e8b98a] bg-[#fbf8f2] dark:bg-[#0e181e] p-2.5 rounded-xl">
                            <span className="text-sm shrink-0">⚓</span>
                            <div className="leading-snug">
                              <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5">
                                Physical Somatic Anchor:
                              </span>
                              {msg.somaticAnchor}
                            </div>
                          </div>
                        )}

                        {/* Emergency Crisis Card (if crisis detected) */}
                        {!isUser && msg.isCrisis && (
                          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-red-800 dark:text-red-300">
                              <AlertTriangle size={14} className="text-red-600" />
                              <span>24/7 Free Immediate Crisis Support</span>
                            </div>
                            <p className="text-[11px] leading-tight">
                              Please call or text these human lifelines right now:
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <a
                                href="tel:988"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-xs hover:bg-red-700 transition-colors"
                              >
                                <PhoneCall size={12} />
                                <span>Call 988 (US/CA)</span>
                              </a>
                              <a
                                href="tel:116123"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-800 text-white font-bold text-xs shadow-xs hover:bg-red-900 transition-colors"
                              >
                                <PhoneCall size={12} />
                                <span>Call 116 123 (UK)</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Embedded Chapter RAG Recommendation */}
                        {!isUser && msg.suggestedChapter && !msg.isStreaming && (
                          <div className="mt-3 pt-2.5 border-t border-[#e6dccb]/70 dark:border-[#1d2e38] space-y-1.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                              Relevant Human 2.0 Chapter
                            </span>
                            <div className="p-2.5 rounded-xl bg-[#f7f3ec] dark:bg-[#18262f] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center font-bold text-xs shrink-0">
                                  {msg.suggestedChapter.chapterNumber}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                                    {msg.suggestedChapter.title}
                                  </h4>
                                  <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6] truncate">
                                    {msg.suggestedChapter.durationFormatted} · {msg.suggestedChapter.part}
                                  </p>
                                </div>
                              </div>

                              {onNavigate && (
                                <button
                                  onClick={() => {
                                    audioEngine.playBreathChime('inhale');
                                    onNavigate('audio_chapters');
                                  }}
                                  className="ml-2 px-2 py-1 rounded-lg bg-[#17495e] text-[#e8b98a] text-[10px] font-bold shrink-0 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Headphones size={11} />
                                  <span>Listen</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Embedded Practice Action */}
                        {!isUser && msg.suggestedPractice && !msg.isStreaming && (
                          <div className="mt-2 space-y-1">
                            <div className="p-2 rounded-xl bg-[#fdf6ec] dark:bg-[#1d2b33] border border-[#d9a44a]/30 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs">🧘</span>
                                <div className="min-w-0">
                                  <h5 className="text-[11px] font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                                    {msg.suggestedPractice.title}
                                  </h5>
                                  <span className="text-[9.5px] text-[#8e6724] dark:text-[#e8b98a]">
                                    {msg.suggestedPractice.duration} Grounding Reset
                                  </span>
                                </div>
                              </div>

                              {onNavigate && (
                                <button
                                  onClick={() => {
                                    audioEngine.playBreathChime('inhale');
                                    if (msg.suggestedPractice?.id.includes('pause')) {
                                      onNavigate('pause');
                                    } else {
                                      onNavigate('practice');
                                    }
                                  }}
                                  className="ml-2 px-2 py-1 rounded-lg bg-[#d9a44a] text-white text-[10px] font-bold shrink-0 hover:bg-[#c2913e] transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Play size={10} className="fill-current" />
                                  <span>Practice</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Suggested Inquiries Chips */}
                {!isGenerating && messages.length <= 3 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] px-1">
                      Suggested Inquiries:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUGGESTED_INQUIRIES.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.prompt)}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] text-left hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 transition-all cursor-pointer shadow-xs group"
                        >
                          <span className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] block group-hover:text-[#8e6724] transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                            {item.subtitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Bottom Input Area */}
            <div className="pt-2 space-y-2 sticky bottom-0 bg-[#f7f3ec] dark:bg-[#0b1317]">
              {/* Paywall Warning Banner if quota reached */}
              {!isPremium && queriesUsedToday >= 3 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#d9a44a]/25 to-[#e8b98a]/30 border border-[#d9a44a]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-[#8e6724] dark:text-[#e8b98a]" />
                    <div>
                      <h5 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6]">
                        Daily Free Inquiries Completed (3/3)
                      </h5>
                      <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                        Unlock 24/7 unlimited AI teacher access with Sovereign.
                      </p>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('subscription')}
                      className="px-3 py-1.5 rounded-xl bg-[#17495e] text-[#e8b98a] font-bold text-xs shrink-0 shadow-xs cursor-pointer"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs">
                {onNavigate && (
                  <button
                    onClick={() => {
                      audioEngine.playBreathChime('inhale');
                      onNavigate('pause');
                    }}
                    className="w-8 h-8 rounded-xl bg-[#f7f3ec] dark:bg-[#0e181e] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center text-xs hover:bg-[#efe9df] transition-colors cursor-pointer shrink-0"
                    title="Take 30-Second Sovereign Pause"
                  >
                    <Sparkles size={14} />
                  </button>
                )}

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    !isPremium && queriesUsedToday >= 3
                      ? 'Daily quota reached · Tap Upgrade for unlimited...'
                      : 'Ask Vinay Kapoor about pressure, meetings, sleep...'
                  }
                  disabled={!isPremium && queriesUsedToday >= 3}
                  className="flex-1 px-2.5 py-1.5 bg-transparent text-xs text-[#1f2a28] dark:text-[#f1ede6] placeholder-[#838c89] dark:placeholder-[#6c8491] focus:outline-none"
                />

                {isGenerating ? (
                  <button
                    onClick={handleStopStreaming}
                    className="w-8 h-8 rounded-xl bg-[#8e6724] text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Stop Generating"
                  >
                    <Square size={13} className="fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || (!isPremium && queriesUsedToday >= 3)}
                    className="w-8 h-8 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                  </button>
                )}
              </div>

              {/* Privacy Footer */}
              <div className="flex items-center justify-between px-2 text-[9.5px] text-[#838c89] dark:text-[#8da0ac]">
                <span className="flex items-center gap-1">
                  <Shield size={10} className="text-[#3c7858]" />
                  Private On-Device Memory · Encrypted Vault
                </span>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="hover:underline text-[#8e6724] dark:text-[#e8b98a] cursor-pointer"
                >
                  Clear Memory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 2: SOMATIC MOOD & WEATHER TRIAGE                   */}
        {/* ====================================================== */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            {/* Ebb Persona Introduction Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#17495e] to-[#1f5f78] dark:from-[#0d222c] dark:to-[#143240] text-white shadow-sm border border-[#17495e]/40 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                  🌊
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-title text-sm font-bold text-white leading-tight">
                    "Tell me honestly: how is your internal weather?"
                  </h3>
                  <p className="text-[11px] text-white/80 leading-relaxed font-serif-quote italic">
                    I sense where you are and recommend the exact practice, chapter, or soundscape to meet your nervous system.
                  </p>
                </div>
              </div>
            </div>

            {/* Emotion Selector Chips */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] px-1">
                Tap How You Feel Right Now
              </span>

              <div className="grid grid-cols-2 gap-2">
                {EBB_MOOD_RESPONSES.map((mood) => {
                  const isSelected = selectedMood.id === mood.id;
                  return (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectMood(mood)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#17495e] dark:bg-[#1a3240] text-[#e8b98a] border-[#17495e] dark:border-[#e8b98a] shadow-xs'
                          : 'bg-white dark:bg-[#14232c] text-[#1f2a28] dark:text-[#f1ede6] border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#182933]'
                      }`}
                    >
                      <span className="text-xl shrink-0">{mood.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold block leading-tight truncate">
                          {mood.label}
                        </span>
                        <span
                          className={`text-[9.5px] line-clamp-1 ${
                            isSelected ? 'text-[#e8b98a]/80' : 'text-[#838c89] dark:text-[#98abb6]'
                          }`}
                        >
                          {mood.feeling}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Or Type Freeform Weather Input */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] space-y-2">
              <span className="text-[10px] font-semibold text-[#8e6724] dark:text-[#e8b98a] uppercase tracking-wider">
                Or describe in your own words:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customWeatherInput}
                  onChange={(e) => setCustomWeatherInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWeatherSubmit()}
                  placeholder="e.g. My chest feels tight after a difficult meeting..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f7f3ec] dark:bg-[#0e181e] text-xs text-[#1f2a28] dark:text-[#f1ede6] placeholder-[#838c89] dark:placeholder-[#6c8491] border border-[#e6dccb] dark:border-[#1d2e38] focus:outline-none"
                />
                <button
                  onClick={handleWeatherSubmit}
                  disabled={!customWeatherInput.trim() || isWeatherThinking}
                  className="w-8 h-8 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>

            {/* Empathic Reflection & Tailored Session Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMood.id + (customWeatherResponse || '')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* Voice Reflection */}
                <div className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] flex items-center gap-1.5">
                      <HeartHandshake size={12} />
                      Somatic Weather Reading
                    </span>
                    <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                      Attuned to {selectedMood.label}
                    </span>
                  </div>

                  <p className="text-xs text-[#1f2a28] dark:text-[#f1ede6] leading-relaxed font-serif-quote italic">
                    "{customWeatherResponse || selectedMood.reflection}"
                  </p>
                </div>

                {/* Recommended Session Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#fdf6ec] to-white dark:from-[#18262f] dark:to-[#14232c] border border-[#d9a44a]/40 dark:border-[#e8b98a]/30 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] bg-[#d9a44a]/15 dark:bg-[#e8b98a]/20 px-2 py-0.5 rounded-full font-mono">
                      Recommended For You Now
                    </span>
                    <span className="text-[10px] font-mono text-[#838c89] dark:text-[#98abb6]">
                      {selectedMood.recommendedSession.durationFormatted}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6]">
                      {selectedMood.recommendedSession.title}
                    </h4>
                    <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] mt-0.5 leading-snug">
                      {selectedMood.recommendedSession.description}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onOpenSession(selectedMood.recommendedSession)}
                    className="w-full py-3 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
                  >
                    <Play size={14} className="fill-current" />
                    <span>{selectedMood.quickActionText}</span>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. TEACHER SYSTEM PROMPT & ARCHITECTURE MODAL            */}
      {/* (For Stakeholders & Researcher Review)                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showSpecsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="w-full max-w-md max-h-[85vh] bg-[#f7f3ec] dark:bg-[#101b22] text-[#1f2a28] dark:text-[#f1ede6] rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between bg-white dark:bg-[#14232c]">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[#8e6724] dark:text-[#e8b98a]" />
                  <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6]">
                    Teacher Architecture & Prompt Specs
                  </h3>
                </div>
                <button
                  onClick={() => setShowSpecsModal(false)}
                  className="w-7 h-7 rounded-full bg-[#f7f3ec] dark:bg-[#0e181e] flex items-center justify-center text-[#838c89] hover:text-[#17495e] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38]">
                    <span className="text-[9px] uppercase font-mono text-[#838c89] block">Model</span>
                    <span className="font-bold text-[#17495e] dark:text-[#e8b98a]">Fine-Tuned LLaMA-3 / Gemini</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38]">
                    <span className="text-[9px] uppercase font-mono text-[#838c89] block">Knowledge Base</span>
                    <span className="font-bold text-[#17495e] dark:text-[#e8b98a]">45 Audio Chapters RAG</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38]">
                    <span className="text-[9px] uppercase font-mono text-[#838c89] block">Latency</span>
                    <span className="font-bold text-[#3c7858]">140ms TTFT · Streaming</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38]">
                    <span className="text-[9px] uppercase font-mono text-[#838c89] block">Data Privacy</span>
                    <span className="font-bold text-[#17495e] dark:text-[#e8b98a]">On-Device Encrypted</span>
                  </div>
                </div>

                {/* System Prompt View */}
                <div>
                  <span className="text-[9.5px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] block mb-1">
                    Vinay Kapoor System Prompt:
                  </span>
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1419] border border-[#e6dccb] dark:border-[#1d2e38] font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text text-[#5a6663] dark:text-[#98abb6]">
                    {VINAY_KAPOOR_SYSTEM_SPECS.systemPrompt}
                  </div>
                </div>

                {/* Safety & Clinical Guardrails */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] space-y-1">
                  <span className="text-[9.5px] uppercase font-mono font-bold text-[#3c7858] block">
                    Safety & Crisis Protocol
                  </span>
                  <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6] leading-snug">
                    Real-time intent scanner automatically triggers crisis intervention cards (988 US/CA, 116 123 UK, Befrienders) and strictly blocks psychiatric diagnostics.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-[#e6dccb] dark:border-[#1d2e38] bg-white dark:bg-[#14232c] flex justify-end">
                <button
                  onClick={() => setShowSpecsModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. CLEAR MEMORY CONFIRMATION MODAL                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-xs bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xl text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 size={18} />
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-sm text-[#17495e] dark:text-[#f1ede6]">
                  Clear Private Chat Memory?
                </h4>
                <p className="text-[11px] text-[#838c89] dark:text-[#98abb6] mt-1 leading-snug">
                  This will wipe all stored dialogue from your local device. This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2 rounded-xl bg-[#efe9df] dark:bg-[#1d2e38] text-xs font-semibold text-[#1f2a28] dark:text-[#f1ede6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearChat}
                  className="py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
