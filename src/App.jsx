import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MOCK_CARDS } from './data/mockCards';
import { Card } from './components/Card';
import { CardModal } from './components/CardModal';
import { ZoomIn, ZoomOut, CircleDot, LogOut, Loader } from 'lucide-react';

function App() {
  const [cards, setCards] = useState([]);
  const [isDeckFanned, setIsDeckFanned] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [drawingCardId, setDrawingCardId] = useState(null);

  const [globalScale, setGlobalScale] = useState(1);
  const [deckIndexOffset, setDeckIndexOffset] = useState(0);

  const viewportRef = useRef(null);
  // 全局卡牌拖拽锁：只有指尖确实拎起了某张牌，才冻结底座的滑动！
  const isCardDraggingRef = useRef(false);

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const initialCards = MOCK_CARDS.map((card, i) => ({
      ...card,
      status: 'deck',
      deckIndex: i,
      boardX: 0,
      boardY: 0,
      isFlipped: false,
    }));
    setCards(initialCards);

    const updateDimensions = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const totalCardsCount = cards.length;

  const handleGlobalPan = (e, info) => {
    // 只要没有正在被真实拖拽起飞的卡牌，你划到底盘的任何一张牌都能触发整个扇形的流转滑动！
    if (isCardDraggingRef.current) return;

    if (isDeckFanned) {
      setDeckIndexOffset(prev => {
        const newOffset = prev - (info.delta.x / 40);
        return Math.max(-totalCardsCount / 2, Math.min(totalCardsCount / 2, newOffset));
      });
    }
  };

  const handleDragStartApp = () => {
    isCardDraggingRef.current = true;
  };

  // 这里的 currentX 和 currentY 已经是通过 Math.max / Math.min 极限过滤后的合法物理显示坐标！可以直接转换除以倍率定死为原始值
  const handleDragEnd = (cardId, currentX, currentY, currentStatus, isDragHorizontal) => {
    isCardDraggingRef.current = false;
    if (!viewportRef.current) return;

    const localDropX = currentX / globalScale;
    const localDropY = currentY / globalScale;

    // 放回取牌区的判决线
    const playmatBound = (dimensions.height / 2) - 130; 

    setCards(prev => {
      // 收拢状态下
      if (currentStatus === 'deck' && !isDeckFanned) {
        // 放到了桌面上
        if (currentY < playmatBound) {
          return prev.map(c =>
            c.id === cardId ? { ...c, status: 'board', boardX: localDropX, boardY: localDropY } : c
          );
        }
        // 切牌
        if (isDragHorizontal) {
          const minDeckIndex = Math.min(...prev.filter(c => c.status === 'deck').map(c => c.deckIndex));
          return prev.map(c =>
            c.id === cardId ? { ...c, deckIndex: minDeckIndex - 1, isFlipped: false } : c
          );
        }
      }

      // 展开状态下
      if (currentStatus === 'deck' && isDeckFanned) {
        // 只要拉上来过那个非常薄的界限口，全部算放置！
        if (currentY < playmatBound) {
          return prev.map(c =>
            c.id === cardId ? { ...c, status: 'board', boardX: localDropX, boardY: localDropY } : c
          );
        }
      }

      // 牌桌上的牌互相甩动
      if (currentStatus === 'board') {
        // 刻意拖回下方废牌发牌区，触发回收
        if (currentY > playmatBound) {
          const maxDeckIndex = Math.max(-1, ...prev.map(p => p.deckIndex));
          return prev.map(c =>
            c.id === cardId ? { ...c, status: 'deck', isFlipped: false, deckIndex: maxDeckIndex + 1 } : c
          );
        }
        // 更新牌位
        return prev.map(c =>
          c.id === cardId ? { ...c, boardX: localDropX, boardY: localDropY } : c
        );
      }

      return prev;
    });

    setDrawingCardId(null);
  };

  const handleCardClick = (cardId) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        if (c.status === 'board') {
          if (!c.isFlipped) {
            return { ...c, isFlipped: true };
          } else {
            setSelectedCardId(cardId);
          }
        } else if (c.status === 'deck' && isDeckFanned) {
          if (drawingCardId === cardId) {
            setDrawingCardId(null);
          } else {
            setDrawingCardId(cardId);
          }
        }
      }
      return c;
    }));
  };

  const handleDoubleClickPlaymat = (e) => {
    if (e.target.closest('button') || e.target.closest('.card-element')) return;
    shuffleDeck();
  };

  const shuffleDeck = () => {
    setCards(prev => {
      let updated = prev.map(c => ({ ...c, status: 'deck', isFlipped: false }));
      let indices = updated.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return updated.map((c, i) => ({ ...c, deckIndex: indices[i] }));
    });
    setDrawingCardId(null);
    setDeckIndexOffset(0);
  };

  const toggleDeckLayout = () => {
    setIsDeckFanned(prev => {
      if (prev) setDeckIndexOffset(0);
      return !prev;
    });
    setDrawingCardId(null);
  };

  const selectedCard = cards.find(c => c.id === selectedCardId);
  const maxStackedIndex = Math.max(-1, ...cards.filter(c => c.status === 'deck').map(c => c.deckIndex));

  // 正向指示器：根据中心偏压自动推衍当前牌号
  let activeDeckIndex = Math.round(totalCardsCount / 2 + deckIndexOffset);
  activeDeckIndex = Math.max(0, Math.min(totalCardsCount - 1, activeDeckIndex));
  // 聚拢时强行归为 1
  const displayNumber = isDeckFanned ? activeDeckIndex + 1 : 1;

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none touch-none"
      style={{ backgroundColor: '#5c2270' }} 
      onDoubleClick={handleDoubleClickPlaymat}
    >
      <div 
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
        <div className="w-16 h-16 rounded-full shadow-[10px_5px_0_0_#FFF0A8] -rotate-[10deg] drop-shadow-[0_0_15px_rgba(255,255,200,0.8)] mb-6 transition-transform duration-[10s] ease-in-out hover:scale-110"></div>
        <div className="text-[#e8dced] text-4xl font-light tracking-widest italic" style={{ fontFamily: '"Bradley Hand", "Comic Sans MS", cursive', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Star Cat</div>
        <div className="text-[#e8dced] text-3xl font-light tracking-wider italic mt-2 ml-12" style={{ fontFamily: '"Bradley Hand", "Comic Sans MS", cursive', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Never lie</div>
      </div>

      <div className="absolute top-4 left-6 right-6 flex justify-between items-start z-40 pointer-events-none">
        <span className="text-white/70 text-lg font-light tracking-wide pointer-events-auto cursor-pointer hover:text-white transition-colors">Help</span>
        <div className="flex flex-col items-end gap-6">
          <span className="text-white/70 text-lg font-light tracking-wide pointer-events-auto cursor-pointer hover:text-white transition-colors">进行提问</span>
          
          <div className="flex flex-col gap-4 pointer-events-auto mt-2">
            <button
              onClick={() => setGlobalScale(s => Math.min(s + 0.1, 1.5))}
              className="p-1.5 rounded-full text-white/70 hover:text-white border border-white/30 backdrop-blur-sm transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            >
              <ZoomIn size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setGlobalScale(s => Math.max(s - 0.1, 0.7))}
              className="p-1.5 rounded-full text-white/70 hover:text-white border border-white/30 backdrop-blur-sm transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            >
              <ZoomOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-30" />

      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute bottom-[20dvh] w-full text-center">
          <span className="text-white/90 text-xl font-medium tracking-widest" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {displayNumber}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 flex flex-col gap-6 pointer-events-auto">
          <button onClick={shuffleDeck} className="text-white/60 hover:text-white hover:rotate-180 transition-all duration-500">
            <Loader size={34} strokeWidth={1.5} />
          </button>
          <button className="text-white/60 hover:text-white hover:-translate-x-1 transition-all">
            <LogOut size={34} strokeWidth={1.5} className="rotate-180" />
          </button>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col items-center gap-2 pointer-events-auto cursor-pointer group" onClick={toggleDeckLayout}>
          <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white transition-all group-hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <CircleDot size={26} strokeWidth={1.5} />
          </div>
          <span className="text-white/60 text-sm tracking-widest group-hover:text-white transition-colors">切换</span>
        </div>
      </div>

      <motion.div
        ref={viewportRef}
        className="absolute inset-0 touch-none transform-gpu"
        onPan={handleGlobalPan}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            totalCardsCount={totalCardsCount}
            status={card.status}
            isFanned={isDeckFanned}
            deckIndexOffset={deckIndexOffset}
            globalScale={globalScale}
            windowDimensions={dimensions}
            isFlipped={card.isFlipped}
            isSelected={drawingCardId === card.id}
            isTopStackedCard={!isDeckFanned && card.deckIndex === maxStackedIndex}
            onDragStart={handleDragStartApp}
            onDragEnd={handleDragEnd}
            onClick={handleCardClick}
          />
        ))}
      </motion.div>

      <CardModal card={selectedCard} onClose={() => setSelectedCardId(null)} />
    </div>
  );
}

export default App;
