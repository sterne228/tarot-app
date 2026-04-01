import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { CARD_BACK_IMAGE } from '../data/mockCards';

export const Card = ({
  card,
  totalCardsCount,
  status,
  isFanned,
  deckIndexOffset,
  globalScale,
  windowDimensions,
  isFlipped,
  isSelected,
  isTopStackedCard,
  backImage,
  onDragStart,
  onDragEnd,
  onClick,
  onRotate
}) => {
  const cardWidth = 100;
  // 长宽比 1.5
  const cardHeight = 150;

  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  let targetX = 0;
  let targetY = 0;
  let targetRotateZ = 0;
  const targetRotateY = isFlipped ? 180 : 0;
  let zIndex = card.deckIndex;
  let targetScale = 1;

  if (status === 'deck') {
    // 终极等比沉底公式：保证缩放时，无论是最小化还是全屏，露出部分始终在整体牌高的 2/3
    // 且中心牌的下1/3身躯完全浸没在屏幕外，彻底杜绝下边缘“露馅”及“镂空”。
    const deckCenterY = (windowDimensions.height / 2) - (25 * globalScale);

    targetScale = globalScale;

    if (isFanned) {
      const R = 450;
      const anglePerCard = 3.5;

      const virtualIndex = card.deckIndex - deckIndexOffset;
      const centerIndex = totalCardsCount / 2;
      const offset = virtualIndex - centerIndex;

      const theta = offset * anglePerCard;
      const angleRad = (theta * Math.PI) / 180;

      // 扇形水平扩展与重力下坠同享 globalScale 等比放缩
      targetX = R * Math.sin(angleRad) * globalScale;
      targetY = deckCenterY + (R * (1 - Math.cos(angleRad)) * globalScale);
      targetRotateZ = theta;
      zIndex = card.deckIndex;

      if (isSelected) {
        targetY -= (30 * globalScale);
      }
    } else {
      // 聚拢态
      targetX = 0;
      targetY = deckCenterY - (card.deckIndex * 0.15 * globalScale);
      targetRotateZ = 0;
      zIndex = card.deckIndex;
    }
  } else {
    // 牌桌防溢出边界墙算法 (Rigid Clamping bounds)
    const playmatBound = (windowDimensions.height / 2) - 130;
    
    // 当前全局尺度下牌面所占的一半物理像素（碰撞箱半径）
    const cardHalfWidth = (cardWidth / 2) * globalScale;
    const cardHalfHeight = (cardHeight / 2) * globalScale;

    const screenHalfWidth = windowDimensions.width / 2;
    const screenHalfHeight = windowDimensions.height / 2;

    // 分别切割计算 x 和 y 的极限物理活动范围（笛卡尔坐标极点：中心为0,0）
    const maxX = screenHalfWidth - cardHalfWidth;
    const minX = -screenHalfWidth + cardHalfWidth;
    
    const minY = -screenHalfHeight + cardHalfHeight;
    const maxY = playmatBound - cardHalfHeight; // 最底下限制到底盘警戒线外侧

    // Raw board positions via logic scaling
    let rawX = card.boardX * globalScale;
    let rawY = card.boardY * globalScale;

    // 四壁防飞算法：把不管任何比率落下去的坐标，强行拍死在屏幕可见的框内。绝对杜绝半边卡在屏幕外的情况。
    targetX = Math.max(minX, Math.min(maxX, rawX));
    targetY = Math.max(minY, Math.min(maxY, rawY));
    
    targetRotateZ = card.boardRotation || 0;
    zIndex = 100 + card.deckIndex;
    targetScale = globalScale;
  }

  const [localRotation, setLocalRotation] = useState(card.boardRotation || 0);
  const currentRotationRef = React.useRef(card.boardRotation || 0);
  
  // 同步外部状态
  useEffect(() => {
    currentRotationRef.current = card.boardRotation || 0;
    setLocalRotation(card.boardRotation || 0);
  }, [card.boardRotation]);

  const rotationTimer = React.useRef(null);
  const isLongPressActive = React.useRef(false);
  const [isRotating, setIsRotating] = useState(false);

  const startRotateTimer = () => {
    if (status !== 'board') return;
    if (!isFlipped) return; // 未翻面时（背面）禁止旋转
    
    // 长按 300ms 后才开始施加旋转效果
    rotationTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      setIsRotating(true);
      currentRotationRef.current += 90;
      setLocalRotation(currentRotationRef.current);
      
      // 之后每隔 500ms 旋转一次
      rotationTimer.current = setInterval(() => {
        currentRotationRef.current += 90;
        setLocalRotation(currentRotationRef.current);
      }, 500);
    }, 300);
  };

  const stopRotateTimer = () => {
    if (rotationTimer.current) {
      clearTimeout(rotationTimer.current);
      clearInterval(rotationTimer.current);
      rotationTimer.current = null;
      
      if (isLongPressActive.current) {
        if (onRotate) {
          onRotate(card.id, currentRotationRef.current);
        }
        // 延迟清除 long press 状态，防止被 onClick 劫持
        setTimeout(() => {
          isLongPressActive.current = false;
          setIsRotating(false);
        }, 50);
      }
    }
  };

  const isDraggable =
    ((status === 'board') ||
    (status === 'deck' && isFanned && isSelected) ||
    (status === 'deck' && !isFanned && isTopStackedCard)) && !isRotating;

  let currentRotateZ = isDragging ? 0 : targetRotateZ;
  if (status === 'board') {
     currentRotateZ = localRotation;
  }

  useEffect(() => {
    if (!isDragging) {
      animate(scale, targetScale, { type: 'spring', stiffness: 350, damping: 30 });
      animate(x, targetX, { type: 'spring', stiffness: status === 'deck' ? 200 : 350, damping: 25 });
      animate(y, targetY, { type: 'spring', stiffness: status === 'deck' ? 200 : 350, damping: 25 });
    }
  }, [targetX, targetY, targetScale, isDragging, status, x, y, scale, isRotating]);

  return (
    <div
      className={`card-element absolute flex items-center justify-center`}
      style={{
        width: cardWidth,
        height: cardHeight,
        top: '50%',
        left: '50%',
        marginTop: -cardHeight / 2,
        marginLeft: -cardWidth / 2,
        perspective: 1200,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        className={`w-full h-full ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{
          x,
          y,
          scale,
          transformStyle: 'preserve-3d',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
        drag={isDraggable}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={{ scale: 1.05 * targetScale }}
        onPointerDown={startRotateTimer}
        onPointerUp={stopRotateTimer}
        onPointerCancel={stopRotateTimer}
        onPointerLeave={stopRotateTimer}
        onDragStart={() => {
          if (isRotating) return;
          stopRotateTimer();
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          const isDragHorizontal = Math.abs(info.offset.x) > 30;
          onDragEnd(card.id, x.get(), y.get(), status, isDragHorizontal);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isLongPressActive.current) return;
          onClick(card.id);
        }}
        animate={{
          rotateZ: currentRotateZ,
          rotateY: targetRotateY,
          zIndex: isDragging ? 999 : zIndex
        }}
        initial={false}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* 牌背 */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl border border-white/20 overflow-hidden bg-[#1e1332]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <img src={backImage || CARD_BACK_IMAGE} alt="Card Back" className="w-full h-full object-cover pointer-events-none" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 mix-blend-overlay"></div>
        </div>

        {/* 牌面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl border border-brand-500/50 overflow-hidden bg-white shadow-lg"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent mix-blend-multiply"></div>
        </div>
      </motion.div>
    </div>
  );
};
