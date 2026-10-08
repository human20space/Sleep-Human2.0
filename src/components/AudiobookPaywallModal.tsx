import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Headphones,
  Sparkles,
  Lock,
  Crown,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface AudiobookPaywallModalProps {
  show: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  onNavigateToSovereign?: () => void;
  reason?: 'sample_ended' | 'chapter_locked';
}

type OfferType = 'launch' | 'regular' | 'upgrade';

export const AudiobookPaywallModal: React.FC<AudiobookPaywallModalProps> = ({
  show,
  onClose,
  onUnlockSuccess,
  onNavigateToSovereign,
  reason = 'sample_ended',
}) => {
  const [selectedOffer, setSelectedOffer] = useState<OfferType>('launch');
  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!show) return null;

  const OFFERS = [
    {
      id: 'launch' as OfferType,
      title: 'Launch Offer',
      badge: 'LIMITED LAUNCH SPECIAL · SAVE 35%',
      isPopular: true,
      priceAED: 'AED 39',
      priceUSD: 'US$10.99',
      description: 'Complete one-time unlock for all 45 chapters. Experience the complete journey before price increases.',
      tagline: 'Recommended for new listeners',
    },
    {
      id: 'regular' as OfferType,
      title: 'Regular Price',
      badge: 'STANDARD LIFETIME EDITION',
      isPopular: false,
      priceAED: 'AED 59',
      priceUSD: 'US$15.99',
      description: 'Standard lifetime purchase for the complete 45-chapter Human 2.0 audio edition with no recurring fees.',
      tagline: 'Full permanent catalogue access',
    },
    {
      id: 'upgrade' as OfferType,
      title: 'Upgrade for Book Buyers',
      badge: 'READER DISCOUNT · SAVE 50%',
      isPopular: false,
      priceAED: 'AED 29',
      priceUSD: 'US$7.99',
      description: 'Special verified upgrade rate for existing readers who already own the physical Human 2.0 hardcover/paperback.',
      tagline: 'Physical book owner discount',
    },
  ];

  const currentSelected = OFFERS.find((o) => o.id === selectedOffer) || OFFERS[0];

  const handlePurchase = () => {
    hapticsEngine.trigger('tap');
    audioEngine.playBreathChime('inhale');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      audioEngine.playBowlChime(528, 4); // 528Hz Solfeggio clarity confirmation
      hapticsEngine.trigger('hold');
      onUnlockSuccess();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="w-full max-w-lg max-h-[92vh] bg-[#f7f3ec] dark:bg-[#0c161d] text-[#1f2a28] dark:text-[#f2ede4] rounded-t-3xl sm:rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Bar with Title and Close */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#e6dccb] dark:border-[#1d2e38] bg-white/70 dark:bg-[#12202a]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#17495e] to-[#1f5f78] text-[#e8b98a] flex items-center justify-center shadow-xs">
                <Headphones size={16} />
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#8e6724] dark:text-[#e8b98a] block">
                  Official Audiobook Offer
                </span>
                <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6] leading-tight">
                  HUMAN 2.0 by Vinay Kapoor
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Currency Selector */}
              <div className="flex items-center rounded-xl bg-[#efe9df] dark:bg-[#192b37] p-0.5 border border-[#e6dccb] dark:border-[#1d2e38]">
                <button
                  type="button"
                  onClick={() => setCurrency('AED')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currency === 'AED'
                      ? 'bg-white dark:bg-[#203644] text-[#17495e] dark:text-[#e8b98a] shadow-2xs'
                      : 'text-[#838c89] dark:text-[#98abb6]'
                  }`}
                >
                  AED
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-[#203644] text-[#17495e] dark:text-[#e8b98a] shadow-2xs'
                      : 'text-[#838c89] dark:text-[#98abb6]'
                  }`}
                >
                  USD
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#efe9df] dark:bg-[#182933] text-[#717e7a] dark:text-[#98abb6] hover:text-[#17495e] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto">
            {/* Reason Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17495e] via-[#1c556d] to-[#123645] text-white shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#e8b98a] flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a]">
                  {reason === 'sample_ended'
                    ? 'Free 25-Minute Sample Completed'
                    : 'Chapters 2–45 Require Complete Book Unlock'}
                </span>
                <p className="text-xs text-white/90 leading-snug mt-0.5">
                  Unlock the full 45-chapter audio experience to explore the complete architecture of human awareness in the AI age.
                </p>
              </div>
            </div>

            {/* Offer Selection Cards */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] px-1 block">
                Select Your Purchase Plan (One-Time Payment)
              </span>

              {OFFERS.map((offer) => {
                const isSelected = selectedOffer === offer.id;
                const displayPrice = currency === 'AED' ? offer.priceAED : offer.priceUSD;
                const altPrice = currency === 'AED' ? offer.priceUSD : offer.priceAED;

                return (
                  <motion.div
                    key={offer.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      hapticsEngine.trigger('tap');
                      setSelectedOffer(offer.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-white dark:bg-[#152530] border-2 border-[#17495e] dark:border-[#e8b98a] shadow-sm'
                        : 'bg-white/80 dark:bg-[#121f28] border-[#e6dccb] dark:border-[#1c2e39] hover:bg-white dark:hover:bg-[#162733]'
                    }`}
                  >
                    {offer.isPopular && (
                      <span className="absolute top-0 right-0 bg-[#d9a44a] text-white text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-bl-lg">
                        MOST POPULAR
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6]">
                            {offer.title}
                          </span>
                          <span className="text-[8.5px] font-mono font-bold bg-[#efe9df] dark:bg-[#1a2d39] text-[#8e6724] dark:text-[#e8b98a] px-1.5 py-0.2 rounded-md">
                            {offer.badge}
                          </span>
                        </div>

                        <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      {/* Price Display */}
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold font-serif-title text-[#17495e] dark:text-[#e8b98a] whitespace-nowrap">
                          {displayPrice}
                        </div>
                        <span className="text-[9.5px] font-mono text-[#838c89] dark:text-[#6f8592] block">
                          ({altPrice})
                        </span>
                        <div className="mt-1 flex justify-end">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] border-transparent'
                                : 'border-[#d0c5b4] dark:border-[#2a4150]'
                            }`}
                          >
                            {isSelected && <Check size={12} className="stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Strategic Value Comparison Callout */}
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-[10.5px] text-[#5a6663] dark:text-[#b4c3cd] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <Tag size={12} />
                <span>Audible Comparison Benchmark</span>
              </div>
              <p>
                Audible costs <strong>$14.95 monthly</strong> for just 1 credit. For the Human 2.0 audiobook, enjoy a <strong>one-time purchase</strong>—all 45 chapters are yours forever with zero recurring monthly fees.
              </p>
            </div>

            {/* What's Included Bullets */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] px-1 block">
                Included in Your Audiobook Unlock
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-[#42504d] dark:text-[#9fb0bc]">
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-[#121f28] p-2 rounded-xl border border-[#e6dccb]/70 dark:border-[#1c2e39]">
                  <Check size={12} className="text-[#3c7858] shrink-0" />
                  <span>All 45 Chapters Unlocked</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-[#121f28] p-2 rounded-xl border border-[#e6dccb]/70 dark:border-[#1c2e39]">
                  <Check size={12} className="text-[#3c7858] shrink-0" />
                  <span>Narrated by Vinay Kapoor</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-[#121f28] p-2 rounded-xl border border-[#e6dccb]/70 dark:border-[#1c2e39]">
                  <Check size={12} className="text-[#3c7858] shrink-0" />
                  <span>Offline Playback in App</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-[#121f28] p-2 rounded-xl border border-[#e6dccb]/70 dark:border-[#1c2e39]">
                  <Check size={12} className="text-[#3c7858] shrink-0" />
                  <span>Private Vault Bookmarks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-[#e6dccb] dark:border-[#1d2e38] bg-white/80 dark:bg-[#12202a]/90 backdrop-blur-md space-y-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Apple In-App Purchase...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#e8b98a]" />
                  <span>
                    Unlock Complete Audiobook · {currency === 'AED' ? currentSelected.priceAED : currentSelected.priceUSD}
                  </span>
                </>
              )}
            </motion.button>

            {/* Sovereign Membership Alternative Link */}
            {onNavigateToSovereign && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToSovereign();
                  }}
                  className="text-[11px] font-semibold text-[#8e6724] dark:text-[#e8b98a] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Crown size={12} />
                  <span>Want Sleep Sanctuary & AI Teacher too? View Sovereign All-Access ($69.99/yr) →</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 text-[9.5px] text-[#838c89] dark:text-[#7d92a0]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#3c7858]" />
                StoreKit 2 Secure Checkout
              </span>
              <span>•</span>
              <span>One-Time Charge · Keep Forever</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
