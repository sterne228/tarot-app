import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { DECKS } from '../data/deckData';

// 提取出一个支持长按旋转的卡牌列表项组件
const DCCardItem = ({ card, config, onUpdateCard }) => {
  const isSelected = config?.selected !== false;
  const rotation = config?.rotation || 0;

  const [localRotation, setLocalRotation] = useState(rotation);
  const currentRotationRef = React.useRef(rotation);
  const timerRef = React.useRef(null);
  
  useEffect(() => {
    setLocalRotation(rotation);
    currentRotationRef.current = rotation;
  }, [rotation]);

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => {
      currentRotationRef.current += 90;
      setLocalRotation(currentRotationRef.current);
      
      timerRef.current = setInterval(() => {
        currentRotationRef.current += 90;
        setLocalRotation(currentRotationRef.current);
      }, 500);
    }, 300);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      timerRef.current = null;
      onUpdateCard(card.id, { rotation: currentRotationRef.current });
    }
  };

  const handleToggleSelect = () => {
    onUpdateCard(card.id, { selected: !isSelected });
  };

  return (
    <div className="flex border-b border-[#6D2825]/10 pb-4 items-center">
      {/* 牌缩略图，支持动画旋转和长按 */}
      <motion.div 
        className="w-16 h-24 flex-shrink-0 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <motion.img 
          src={card.image_url} 
          alt={card.name} 
          className="w-full h-full object-cover rounded shadow-md border border-[#6D2825]/20"
          animate={{ rotateZ: localRotation }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </motion.div>
      
      <div className="ml-6 flex-1 flex flex-col justify-center">
        <span className="text-2xl font-serif italic text-[#6D2825]">{card.name}</span>
        
        {/* 选择功能区 */}
        <div className="flex items-center mt-2 cursor-pointer w-max" onClick={handleToggleSelect}>
          <div className="flex flex-col mr-3">
             <span className="text-sm font-serif text-[#6D2825]">Already in play</span>
             <span className="text-xs text-[#6D2825]/70">已选择</span>
          </div>
          {isSelected ? (
            <div className="bg-black text-white p-0.5 rounded shadow-sm">
               <CheckSquare size={18} strokeWidth={2.5} />
            </div>
          ) : (
            <div className="text-black/30 p-0.5 rounded shadow-sm">
               <Square size={18} strokeWidth={2.5}/>
            </div>
          )}
        </div>
      </div>

      <button className="text-[#6D2825]/60 hover:text-[#6D2825] transition-colors ml-4 shrink-0">
        {isSelected ? <Eye size={24} /> : <EyeOff size={24} />}
      </button>
    </div>
  );
};

export const DCSettingsPage = ({ deckId, settings, deckConfig, onUpdateSettings, onUpdateDeckConfig, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(true); // 默认打开设置抽屉
  const [localSettings, setLocalSettings] = useState(settings);

  const activeDeck = DECKS.find(d => d.id === deckId) || DECKS[0];

  const handleUpdateCard = (cardId, updates) => {
    onUpdateDeckConfig(prev => ({
      ...prev,
      [cardId]: { ...(prev[cardId] || {}), ...updates }
    }));
  };

  const handleToggle = (key) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings = {
      cardCounter: true,
      onlyMajorArcana: false,
      onlyUpright: true
    };
    setLocalSettings(defaultSettings);
    onUpdateSettings(defaultSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex flex-col items-center bg-[#EFDEC5] overflow-y-auto"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`
      }}
    >
      {/* 顶部标题区 */}
      <div className="w-full flex justify-between items-start px-6 py-6 max-w-2xl text-[#6D2825]">
        <div className="flex flex-col">
          <span className="text-3xl font-serif italic mb-1">Decks</span>
          <span className="text-sm tracking-widest text-[#6D2825]/70">选择一套牌</span>
        </div>
        <button onClick={onBack} className="flex flex-col items-end hover:opacity-70 transition-opacity">
           <X size={32} strokeWidth={1} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
         <ArrowLeft size={24} className="text-[#6D2825] mb-4" /> {/* 模拟图中的装饰箭头 */}
         <div className="w-32 h-32 rounded-full border border-[#6D2825]/30 overflow-hidden shadow-inner flex items-center justify-center p-2 mb-2">
            <div className="w-full h-full rounded-full border border-dashed border-[#6D2825]/50 flex items-center justify-center text-center p-4">
              <span className="text-[#6D2825] font-serif leading-tight">{activeDeck.name.replace(' Tarot', '\nTarot')}</span>
            </div>
         </div>
         <span className="text-[#6D2825] tracking-widest text-sm">{activeDeck.nameCN}</span>
      </div>

      <div className="w-full px-8 max-w-xl pb-32">
        <div className="flex items-end gap-4 mb-4 border-b border-[#6D2825]/20 pb-2">
          <h2 className="text-3xl font-serif text-[#6D2825] italic">Cards</h2>
          <span className="text-sm text-[#6D2825]/70 tracking-widest mb-1">选卡</span>
          <span className="text-xs text-[#6D2825]/50 ml-auto mb-1 flex-1 text-right">(长按卡片可以进行正逆设置)</span>
        </div>

        {/* 牌列表 */}
        <div className="flex flex-col gap-6">
          {activeDeck.cards.map((card) => (
             <DCCardItem 
               key={card.id} 
               card={card} 
               config={deckConfig[card.id]} 
               onUpdateCard={handleUpdateCard} 
             />
          ))}
        </div>
      </div>

      <button 
        className="fixed bottom-0 inset-x-0 w-full bg-[#E5D5BC] border-t border-[#6D2825]/20 p-4 text-[#6D2825] font-serif text-center shadow-[0_-5px_15px_rgba(0,0,0,0.1)] hover:bg-[#D5C5AC] transition-colors z-40"
        onClick={() => setIsModalOpen(true)}
      >
        点击进入选项设置
      </button>

      {/* 撕纸边缘风格的模态框 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-12 max-w-md mx-auto z-50 p-4"
          >
            <div className="bg-[#DBD0C0] rounded-lg shadow-2xl border border-[#6D2825]/20 overflow-hidden relative">
              {/* 模拟撕纸顶部纹理边缘 */}
              <div className="h-4 w-full bg-[#E5D5BC] absolute top-0 inset-x-0" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"}}></div>
              
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#6D2825]/50 hover:text-[#6D2825] z-10"><X size={20}/></button>

              <div className="px-8 pt-12 pb-8 flex flex-col items-center">
                <h3 className="text-xl text-[#6D2825] mb-2 tracking-widest">Deck & Card</h3>
                <span className="text-sm text-[#6D2825] tracking-widest mb-10">功能设置</span>

                <div className="w-full flex flex-col gap-6">
                  {/* 计牌器 */}
                  <div className="flex flex-col border-b border-[#6D2825]/10 pb-4">
                    <span className="text-lg text-[#6D2825] mb-2 tracking-widest">计牌器</span>
                    <div className="flex gap-16 justify-end w-full px-6">
                      <button onClick={() => handleToggle('cardCounter')} className={`text-xl ${localSettings.cardCounter ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>on</button>
                      <button onClick={() => handleToggle('cardCounter')} className={`text-xl ${!localSettings.cardCounter ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>off</button>
                    </div>
                  </div>
                  
                  {/* 大阿尔卡纳 */}
                  <div className="flex flex-col border-b border-[#6D2825]/10 pb-4">
                    <span className="text-lg text-[#6D2825] mb-2 tracking-widest">只使用大阿尔卡纳</span>
                    <div className="flex gap-16 justify-end w-full px-6">
                      <button onClick={() => handleToggle('onlyMajorArcana')} className={`text-xl ${localSettings.onlyMajorArcana ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>on</button>
                      <button onClick={() => handleToggle('onlyMajorArcana')} className={`text-xl ${!localSettings.onlyMajorArcana ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>off</button>
                    </div>
                  </div>

                  {/* 仅正位 */}
                  <div className="flex flex-col border-b border-[#6D2825]/10 pb-4">
                    <span className="text-lg text-[#6D2825] mb-2 tracking-widest">只显示正位状态(仅自由模式)</span>
                    <div className="flex gap-16 justify-end w-full px-6">
                      <button onClick={() => handleToggle('onlyUpright')} className={`text-xl ${localSettings.onlyUpright ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>on</button>
                      <button onClick={() => handleToggle('onlyUpright')} className={`text-xl ${!localSettings.onlyUpright ? 'text-[#D03020] border border-[#D03020] rounded-full px-2' : 'text-[#6D2825]/50'}`}>off</button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={resetSettings}
                  className="mt-10 text-lg text-[#D03020] tracking-widest hover:opacity-70 transition-opacity"
                >
                  恢复到默认设置
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
