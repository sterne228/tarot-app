import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { DECKS } from '../data/deckData';

export const DeckSelectPage = ({ currentDeckId, onSelect, onBack, onGotoDC }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex flex-col items-center bg-[#E6DCC8] overflow-y-auto"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`
      }}
    >
      {/* 顶部导航 */}
      <div className="w-full flex justify-between items-center px-6 py-6 max-w-2xl text-black">
        <button onClick={onBack} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft size={24} strokeWidth={1.5} />
          <span className="font-medium tracking-widest text-lg">返回桌面</span>
        </button>
        <button onClick={onGotoDC} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="font-medium tracking-widest text-lg">切换到DC设置</span>
          <Settings2 size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div className="w-full max-w-xl px-6 flex flex-col items-center flex-grow pb-12">
        <h1 className="text-4xl front-light text-black tracking-wide mb-2 mt-4">Choose the deck</h1>
        <p className="text-xl text-black/60 tracking-[0.2em] mb-12">选择牌组</p>

        {/* 牌组网格 */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-10 w-full">
          {DECKS.map((deck) => (
            <motion.div 
              key={deck.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(deck.id)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg mb-4 transition-transform group-hover:-translate-y-2 group-hover:shadow-xl">
                <img 
                  src={deck.coverImage} 
                  alt={deck.name} 
                  className="w-full h-full object-cover"
                />
                {currentDeckId === deck.id && (
                  <div className="absolute inset-0 border-4 border-[#5c2270] rounded-lg"></div>
                )}
              </div>
              <h3 className="text-center text-sm font-medium text-black/80 tracking-widest px-1">
                {deck.nameCN || deck.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
