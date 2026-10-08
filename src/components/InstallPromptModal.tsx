import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Sparkles, Moon, Radio, Zap } from 'lucide-react';

export interface InstallPromptModalProps {
  show: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isIOS: boolean;
  canPromptDirectly: boolean;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  show,
  onClose,
  onInstall,
  isIOS,
  canPromptDirectly,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal / Bottom Sheet Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md bg-[#101b22] text-[#f2ede4] border-t sm:border border-[#d9a44a]/30 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-6 z-10 overflow-hidden flex flex-col pb-[max(env(safe-area-inset-bottom),20px)]"
        >
          {/* Subtle top pull handle on mobile */}
          <div className="w-10 h-1 bg-[#223541] rounded-full mx-auto mb-4 sm:hidden" />

          {/* Close button (>= 44x44px touch target) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#17252e] hover:bg-[#1f3542] text-[#9eb2be] hover:text-[#f2ede4] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close install prompt"
          >
            <X size={18} />
          </button>

          {/* Brand Mark & Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#17495e] to-[#0d222c] border border-[#d9a44a]/40 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              <img
                src="/icons/icon-192x192.png"
                alt="Human 2.0"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-serif-title font-bold text-lg text-[#e8b98a]">
                2.0
              </span>
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e8b98a] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e8b98a] font-semibold">
                  Official Mobile App
                </span>
                <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] bg-[#17495e] text-[#e8b98a] font-mono">
                  PWA
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#f2ede4] leading-tight">
                Install Human 2.0
              </h3>
              <p className="text-[11px] text-[#9eb2be] leading-tight">
                Sleep Sanctuary & Personal Awareness Platform
              </p>
            </div>
          </div>

          {/* Benefits Feature Grid */}
          <div className="bg-[#14232c] rounded-2xl p-3.5 mb-5 border border-[#1d2e38] space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Moon size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Offline Sleep Induction:</strong> Instant 432Hz/528Hz drone soundscapes and SOS racing mind silencer.
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Radio size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Background Audio:</strong> Lock-screen audio controls & sleep auto-fade timers.
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Zap size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Full-Screen Immersion:</strong> True native app display without browser toolbars.
              </span>
            </div>
          </div>

          {/* Action Area: OS-Dependent */}
          {canPromptDirectly ? (
            /* Android / Chromium Direct Install */
            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  const accepted = await onInstall();
                  if (accepted) onClose();
                }}
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#17495e] to-[#1f5f78] hover:from-[#1f5f78] hover:to-[#277899] text-[#e8b98a] font-semibold text-xs shadow-md border border-[#d9a44a]/40 hover:border-[#d9a44a] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Download size={15} />
                <span>Install App to Home Screen</span>
              </button>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl text-xs text-[#9eb2be] hover:text-[#f2ede4] transition-colors cursor-pointer flex items-center justify-center"
              >
                Maybe Later
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Tactile 3-Step Guide */
            <div className="space-y-3">
              <div className="bg-[#0b1317] rounded-2xl p-3.5 border border-[#1d2e38] space-y-2.5">
                <div className="text-[11px] font-semibold text-[#e8b98a] flex items-center gap-1.5 mb-1">
                  <Sparkles size={13} />
                  <span>How to install on iOS Safari:</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <span className="leading-tight">
                    Tap the <strong className="text-[#f2ede4] inline-flex items-center gap-1">Share <Share size={12} className="text-[#3ba2c7]" /></strong> button in Safari's bottom bar.
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <span className="leading-tight">
                    Scroll down and select <strong className="text-[#f2ede4] inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} className="text-[#e8b98a]" /></strong>.
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <span className="leading-tight">
                    Tap <strong className="text-[#e8b98a]">Add</strong> in the top-right corner.
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-[#17495e] hover:bg-[#1f5f78] text-[#e8b98a] font-semibold text-xs shadow-md border border-[#d9a44a]/30 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center"
              >
                Got It, Thank You
              </button>
            </div>
          ) : (
            /* Desktop / Generic Browser Fallback */
            <div className="space-y-2.5">
              <p className="text-xs text-[#9eb2be] text-center leading-relaxed">
                To install, click the install icon in your browser's address bar or menu.
              </p>
              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#17495e] text-[#e8b98a] font-semibold text-xs cursor-pointer flex items-center justify-center"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
