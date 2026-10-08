import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Play subtle opening chime
    audioEngine.playBowlChime(432, 3.5);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 390);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    // Particle system simulating galaxy stardust converging inward
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.7 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.4 ? '#e8b98a' : '#8fd0ff',
    }));

    const render = () => {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, width, height);

      // Subtle radial center nebula
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        10,
        width / 2,
        height * 0.42,
        width * 0.65
      );
      grad.addColorStop(0, 'rgba(31, 95, 120, 0.22)');
      grad.addColorStop(0.5, 'rgba(217, 164, 74, 0.1)');
      grad.addColorStop(1, 'rgba(5, 7, 10, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw and update stardust
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#05070a] text-white flex flex-col justify-between items-center p-8 select-none overflow-hidden z-50">
      {/* Background Stardust Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Skip button */}
      <div className="w-full flex justify-end relative z-10">
        <button
          onClick={onComplete}
          className="text-xs uppercase tracking-widest text-[#8fd0ff]/80 hover:text-white px-3 py-1 rounded-full border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
        >
          Skip Intro
        </button>
      </div>

      {/* Center Brand Identity */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#17495e] to-[#1f5f78] border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(232,185,138,0.35)] animate-breath">
            <span className="font-serif-title font-bold text-4xl text-[#e8b98a]">2.0</span>
          </div>
          <div className="absolute -top-1 -right-1 text-[#e8b98a] animate-pulse">
            <Sparkles size={18} />
          </div>
        </div>

        <h1 className="font-serif-title text-3xl font-medium tracking-wide text-[#f7f3ec] mb-2">
          Human 2.0
        </h1>
        <p className="font-serif-quote italic text-sm text-[#e8b98a] max-w-xs leading-relaxed opacity-95">
          "Technology evolves outward. Awareness evolves inward."
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-[#7d8aab] tracking-wider uppercase font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3c7858] inline-block animate-ping" />
          The Operating System for the AI Age
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full relative z-10 pt-4 flex flex-col items-center">
        <button
          onClick={onComplete}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-[#1f5f78] hover:bg-[#17495e] text-[#f7f3ec] font-semibold text-sm shadow-[0_10px_25px_rgba(31,95,120,0.4)] flex items-center justify-center gap-2 border border-white/15 transition-all active:scale-[0.98]"
        >
          <span>Begin Awareness</span>
          <ArrowRight size={16} className="text-[#e8b98a]" />
        </button>

        <p className="text-[10px] text-[#7d8aab] mt-3">
          Not therapy. Not an AI friend. Conscious human agency.
        </p>
      </div>
    </div>
  );
};
