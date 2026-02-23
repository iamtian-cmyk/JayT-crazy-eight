import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { getSuitColor, getSuitSymbol } from '../utils/gameLogic';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isFaceDown?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isPlayable = false, 
  isFaceDown = false,
  className = ""
}) => {
  const suitSymbol = getSuitSymbol(card.suit);
  const suitColor = getSuitColor(card.suit);

  if (isFaceDown) {
    return (
      <motion.div
        whileHover={onClick ? { y: -10 } : {}}
        className={`relative w-20 h-28 sm:w-24 sm:h-36 bg-slate-800 rounded-lg border-2 border-white shadow-lg flex items-center justify-center overflow-hidden ${className}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-2 border border-white/20 rounded-md flex items-center justify-center">
          <span className="text-white/40 font-bold text-xl italic tracking-tighter">JayT</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      className={`relative w-20 h-28 sm:w-24 sm:h-36 bg-emerald-50 rounded-lg border-2 border-emerald-200 shadow-md flex flex-col p-2 cursor-pointer select-none ${isPlayable ? 'ring-4 ring-emerald-400 shadow-emerald-400/50' : ''} ${className}`}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className={`flex justify-between items-start ${suitColor}`}>
        <span className="font-black text-lg leading-none">{card.rank}</span>
        <span className="text-sm leading-none">{suitSymbol}</span>
      </div>
      
      <div className={`flex-1 flex items-center justify-center text-4xl sm:text-5xl ${suitColor} drop-shadow-sm`}>
        {suitSymbol}
      </div>

      <div className={`flex justify-between items-end rotate-180 ${suitColor}`}>
        <span className="font-black text-lg leading-none">{card.rank}</span>
        <span className="text-sm leading-none">{suitSymbol}</span>
      </div>
    </motion.div>
  );
};
