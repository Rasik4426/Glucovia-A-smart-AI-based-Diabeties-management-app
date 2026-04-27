import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SETS = {
  celebrate: { emojis: ['🎉', '⭐', '🏆', '💪', '🌟', '🎊', '🥳', '❤️', '👏', '🔥'], label: 'Amazing! Keep it up! 🚀', bg: 'rgba(20,184,166,0.18)' },
  good:      { emojis: ['✅', '😊', '💚', '👍', '🌈'], label: 'Perfect sugar levels! 💚', bg: 'rgba(34,197,94,0.18)' },
  low:       { emojis: ['⚠️', '🍬', '🧃', '🍭', '😟'], label: 'Sugar is low — eat something! 🍬', bg: 'rgba(239,68,68,0.18)' },
  high:      { emojis: ['⚠️', '💧', '🏃', '🩺', '😰'], label: 'Sugar is high — drink water! 💧', bg: 'rgba(249,115,22,0.2)' },
};

export function useEmojiPop() {
  const [popEvent, setPopEvent] = useState(null);

  const triggerPop = (type = 'celebrate') => {
    const set = SETS[type] || SETS.celebrate;
    const emoji = set.emojis[Math.floor(Math.random() * set.emojis.length)];
    setPopEvent({ emoji, id: Date.now(), type });
  };

  const clearPop = () => setPopEvent(null);

  return { popEvent, triggerPop, clearPop };
}

export default function EmojiPop({ popEvent, onDone }) {
  useEffect(() => {
    if (popEvent) {
      const t = setTimeout(() => onDone && onDone(), 2800);
      return () => clearTimeout(t);
    }
  }, [popEvent]);

  const config = popEvent ? (SETS[popEvent.type] || SETS.celebrate) : null;

  return (
    <AnimatePresence>
      {popEvent && config && (
        <motion.div
          key={popEvent.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backdropFilter: 'blur(10px)', backgroundColor: config.bg }}
          onClick={onDone}
        >
          {/* Orbiting emojis */}
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0.6],
                x: Math.cos((i / 10) * Math.PI * 2) * (120 + Math.random() * 60),
                y: Math.sin((i / 10) * Math.PI * 2) * (100 + Math.random() * 60),
              }}
              transition={{ duration: 2, delay: i * 0.08, ease: 'easeOut' }}
              className="absolute pointer-events-none select-none"
              style={{ fontSize: 28 + Math.random() * 20 }}
            >
              {config.emojis[i % config.emojis.length]}
            </motion.span>
          ))}

          {/* Center card */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: [0, 1.3, 1], rotate: [0, 8, -4, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.55, type: 'spring', bounce: 0.55 }}
            className="flex flex-col items-center gap-4 pointer-events-none select-none"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 6, -6, 0] }}
              transition={{ duration: 1, delay: 0.4, repeat: 1 }}
              style={{ fontSize: 110, lineHeight: 1 }}
            >
              {popEvent.emoji}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-3 shadow-2xl border border-white"
            >
              <p className="text-slate-800 font-extrabold text-xl text-center">{config.label}</p>
              <p className="text-slate-400 text-xs text-center mt-1">Tap anywhere to close</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}