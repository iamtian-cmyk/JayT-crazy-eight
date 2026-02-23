import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { getSuitColor, getSuitSymbol } from '../utils/gameLogic';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 border-4 border-orange-500">
        <h2 className="text-3xl font-black mb-6 text-slate-900 tracking-tight">PICK A SUIT</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group bg-slate-50"
            >
              <span className={`text-5xl mb-2 ${getSuitColor(suit)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {suit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
