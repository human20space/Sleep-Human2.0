/**
 * Human 2.0 — UpdateToast Component
 * Surfaces a sleek, non-intrusive notification when a new app version is ready.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface UpdateToastProps {
  show: boolean;
  onRefresh: () => void;
  onDismiss?: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({
  show,
  onRefresh,
  onDismiss,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          role="status"
          aria-live="polite"
          aria-label="Update notification"
          initial={{ y: -32, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -32, opacity: 0, scale: 0.96 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          className="absolute top-[max(env(safe-area-inset-top),14px)] left-3 right-3 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-[#101b22]/95 text-[#f2ede4] backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#d9a44a]/40 shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 pointer-events-auto max-w-sm w-full transition-colors">
            {/* Left Status Glyph & Message */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#17495e]/80 border border-[#e8b98a]/30 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-[#e8b98a] animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#f2ede4] leading-tight truncate">
                  New version available
                </p>
                <p className="text-[11px] text-[#9eb2be] leading-tight truncate">
                  Tap to refresh app
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-[#17495e] hover:bg-[#1f5f78] active:scale-95 text-[#e8b98a] text-xs font-semibold border border-[#d9a44a]/30 shadow-xs cursor-pointer transition-all disabled:opacity-70"
                title="Refresh application with new version"
              >
                <RefreshCw
                  size={12}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>

              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="p-1.5 min-w-[32px] min-h-[32px] rounded-lg text-[#9eb2be] hover:text-[#f2ede4] hover:bg-white/5 active:scale-90 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Dismiss update notification"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
