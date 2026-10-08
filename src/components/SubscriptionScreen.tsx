import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  Headphones, 
  BookOpen, 
  Radio, 
  Lock, 
  HeartHandshake
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface SubscriptionScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack, onSuccess }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(() => {
    try {
      return localStorage.getItem('human2_is_premium') === 'true';
    } catch {
      return false;
    }
  });

  const handleSubscribe = () => {
    hapticsEngine.trigger('tap');
    audioEngine.playBreathChime('inhale');
    setIsSubscribing(true);

    setTimeout(() => {
      setIsSubscribing(false);
      setIsSuccess(true);
      hapticsEngine.trigger('hold');
      audioEngine.playBowlChime(528, 3.5); // 528Hz Solfeggio clarity chime
      try {
        localStorage.setItem('human2_is_premium', 'true');
      } catch {
        // ignore
      }
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const handleRestore = () => {
    hapticsEngine.trigger('tap');
    audioEngine.playBreathChime('inhale');
    alert('Simulated App Store receipt verification complete. Any previous purchases are restored.');
  };

  const FEATURES = [
    {
      icon: Sparkles,
      title: 'Conversational AI Meditation Teacher',
      free: '3 Inquiries / Week',
      sovereign: 'Unlimited 24/7 Access',
      highlight: true
    },
    {
      icon: Headphones,
      title: 'Full 45 Audiobook Chapters',
      free: 'Chapter 1 (25-Min Sample)',
      sovereign: 'All 45 Tracks Unlocked',
      highlight: true
    },
    {
      icon: BookOpen,
      title: '100,000+ Multi-Tradition Library',
      free: 'Sample Sessions',
      sovereign: 'Full Zen, Vipassana & Kundalini',
      highlight: false
    },
    {
      icon: Crown,
      title: 'World Expert Masterclasses',
      free: 'Locked',
      sovereign: 'Dr. Walker, Dr. Jud & Tara Brach',
      highlight: false
    },
    {
      icon: Radio,
      title: 'Live Teacher Sanghas & Rooms',
      free: 'Viewer Only',
      sovereign: 'Interactive Circles & Q&As',
      highlight: false
    },
    {
      icon: Lock,
      title: 'Encrypted Private Vault Memory',
      free: 'Local Device Only',
      sovereign: 'Zero-Knowledge Encrypted Sync',
      highlight: false
    }
  ];

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-10 transition-colors">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
          Membership Tier
        </span>

        <button
          onClick={handleRestore}
          className="text-[11px] font-semibold text-[#8e6724] dark:text-[#e8b98a] hover:underline cursor-pointer"
        >
          Restore
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Sovereign Hero Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#17495e] via-[#1d5b74] to-[#123645] text-white shadow-md border border-[#17495e]/50 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center mx-auto mb-3 shadow-inner ring-1 ring-white/20">
            <Crown size={28} />
          </div>

          <span className="inline-block text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#e8b98a] bg-black/25 px-2.5 py-0.5 rounded-full mb-1">
            StoreKit 2 · Apple In-App Purchase
          </span>
          <h2 className="font-serif-title text-xl font-bold text-white mb-1">
            Human 2.0 Sovereign
          </h2>
          <p className="font-serif-quote italic text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
            "Inner technology designed to keep human awareness ahead of artificial intelligence."
          </p>

          {isSuccess && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3c7858] text-white text-xs font-semibold shadow-xs">
              <Check size={13} />
              <span>Sovereign Membership Active</span>
            </div>
          )}
        </div>

        {/* Annual vs Monthly Billing Toggle */}
        <div className="p-1 rounded-2xl bg-[#efe9df] dark:bg-[#15232c] flex items-center gap-1 border border-[#e6dccb] dark:border-[#1d2e38]">
          <button
            onClick={() => {
              hapticsEngine.trigger('tap');
              setBillingCycle('annual');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-[#1f3542] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#838c89] dark:text-[#98abb6]'
            }`}
          >
            <span>Annual Plan</span>
            <span className="text-[9px] bg-[#d9a44a]/20 dark:bg-[#e8b98a]/20 text-[#8e6724] dark:text-[#e8b98a] px-1.5 py-0.2 rounded-full font-mono font-bold">
              SAVE 58%
            </span>
          </button>

          <button
            onClick={() => {
              hapticsEngine.trigger('tap');
              setBillingCycle('monthly');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-[#1f3542] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#838c89] dark:text-[#98abb6]'
            }`}
          >
            <span>Monthly Plan</span>
          </button>
        </div>

        {/* Pricing Card Details */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14232c] border-2 border-[#17495e] dark:border-[#e8b98a] shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-serif-title text-[#17495e] dark:text-[#e8b98a]">
                {billingCycle === 'annual' ? '$69.99' : '$9.99'}
              </span>
              <span className="text-xs text-[#838c89] dark:text-[#98abb6]">
                {billingCycle === 'annual' ? '/ year ($5.83/mo)' : '/ month'}
              </span>
            </div>
            <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6]">
              {billingCycle === 'annual' 
                ? 'Includes 7-day free trial. Cancel anytime in Apple Settings.' 
                : 'Flexible monthly billing. Cancel anytime.'}
            </p>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] flex items-center justify-center">
            <Check size={14} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Standalone Audiobook One-Time Purchase Card (As per pricing plan) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#17252f] dark:to-[#132029] border border-amber-200/80 dark:border-[#203644] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#8e6724] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
              <Headphones size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                  Audiobook Only · One-Time
                </span>
                <span className="text-[8.5px] font-mono font-bold bg-[#d9a44a]/20 text-[#8e6724] dark:text-[#e8b98a] px-1.5 py-0.2 rounded-full">
                  SAVE 35%
                </span>
              </div>
              <p className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                All 45 Chapters · Launch Offer AED 39 / $10.99
              </p>
              <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                Keep forever with zero monthly subscription fees
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticsEngine.trigger('tap');
              localStorage.setItem('human2_has_audiobook', 'true');
              audioEngine.playBowlChime(528, 3.5);
              alert('Complete 45-chapter Human 2.0 Audiobook unlocked! (AED 39 Launch Offer)');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] text-[10.5px] font-bold shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            Get Book →
          </button>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              What's Included
            </span>
            <span className="text-[9.5px] text-[#838c89] dark:text-[#98abb6]">
              Free Explorer vs. Sovereign
            </span>
          </div>

          <div className="bg-white dark:bg-[#14232c] rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] divide-y divide-[#e6dccb]/50 dark:divide-[#1d2e38] overflow-hidden shadow-xs">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#efe9df] dark:bg-[#1a2b36] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6] leading-tight">
                        {feat.title}
                      </h4>
                      <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                        Free: {feat.free}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#1f5f78] dark:text-[#e8b98a] text-right shrink-0">
                    {feat.sovereign}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
          >
            {isSubscribing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Contacting Apple StoreKit...</span>
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-1.5">
                <Check size={16} />
                <span>Subscription Confirmed</span>
              </span>
            ) : (
              <span>Start 7-Day Free Trial</span>
            )}
          </motion.button>

          <p className="text-[10px] text-center text-[#838c89] dark:text-[#98abb6] mt-2 leading-relaxed">
            Recurring billing. Apple Family Sharing enabled. Cancel anytime in iOS Settings at least 24 hours before trial ends.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-[#838c89] dark:text-[#98abb6]">
          <div className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#3c7858]" />
            <span>Apple StoreKit Verified</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <HeartHandshake size={13} className="text-[#8e6724]" />
            <span>Zero-Data Resale</span>
          </div>
        </div>
      </div>
    </div>
  );
};
