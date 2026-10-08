import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Headphones, Pause, Waves, Bookmark } from 'lucide-react';
import type { Screen } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface BottomTabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: 'home' as Screen, label: 'Sleep', icon: Moon },
    { id: 'audio_chapters' as Screen, label: 'Listen', icon: Headphones },
    { id: 'pause' as Screen, label: 'Reset', icon: Pause, isCenterHero: true },
    { id: 'ebb' as Screen, label: 'Ebb AI', icon: Waves },
    { id: 'vault' as Screen, label: 'Vault', icon: Bookmark },
  ];

  return (
    <nav className="absolute left-0 right-0 bottom-0 bg-[#ffffff]/95 dark:bg-[#101b22]/95 backdrop-blur-md border-t border-[#e6dccb] dark:border-[#1d2e38] px-3 pt-2 pb-[max(env(safe-area-inset-bottom),10px)] z-40 shadow-xs shrink-0 transition-colors">
      <div className="w-full max-w-lg mx-auto flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;

        if (tab.isCenterHero) {
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                audioEngine.playBreathChime('inhale');
                onNavigate(tab.id);
              }}
              className="flex flex-col items-center group focus:outline-none min-w-[48px] min-h-[48px] justify-center px-1 cursor-pointer"
              title="Acute 90-Second Racing Mind Reset"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-[#17495e] text-[#e8b98a] dark:bg-[#1f3542] dark:text-[#e8b98a] shadow-sm ring-2 ring-[#17495e]/20 dark:ring-[#e8b98a]/30'
                    : 'bg-[#efe9df] text-[#17495e] hover:bg-[#e6dccb] dark:bg-[#17252e] dark:text-[#9eb2be] dark:hover:bg-[#203340]'
                }`}
              >
                <Icon size={18} className="stroke-[2.2]" />
              </div>
              <span
                className={`text-[9.5px] mt-1 tracking-tight transition-colors ${
                  isActive
                    ? 'font-bold text-[#17495e] dark:text-[#e8b98a]'
                    : 'font-medium text-[#5a6663] dark:text-[#9eb2be]'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        }

        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate(tab.id);
            }}
            className={`flex flex-col items-center py-1 px-2.5 min-w-[48px] min-h-[48px] justify-center rounded-xl transition-all focus:outline-none cursor-pointer ${
              isActive
                ? 'text-[#17495e] dark:text-[#e8b98a]'
                : 'text-[#838c89] dark:text-[#6c8491] hover:text-[#17495e] dark:hover:text-[#e8b98a]'
            }`}
          >
            <Icon size={18} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'} />
            <span
              className={`text-[9.5px] mt-1 tracking-tight ${
                isActive
                  ? 'font-bold text-[#17495e] dark:text-[#e8b98a]'
                  : 'font-medium text-[#5a6663] dark:text-[#9eb2be]'
              }`}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
      </div>
    </nav>
  );
};
