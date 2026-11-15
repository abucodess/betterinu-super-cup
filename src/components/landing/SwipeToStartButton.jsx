import React, { useState, useRef } from 'react';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';

/**
 * Interactive Drag-to-Unlock / Slide-to-Start CTA Button
 * Users can drag the arrow handle to the right to trigger navigation,
 * or click/tap directly for instant accessibility.
 */
export function SwipeToStartButton({
  label = 'DRAG ARROW TO ENTER THE CUP',
  completedLabel = 'LAUNCHING SUPER CUP...',
  onComplete,
  variant = 'dark', // 'dark' (black track on lime hero) | 'lime' (lime border on dark bg)
  className = '',
}) {
  const trackRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(220);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startXRef = useRef(0);
  const movedDistanceRef = useRef(0);

  const HANDLE_SIZE = 52;
  const PADDING = 6;

  const computeMaxDrag = () => {
    if (!trackRef.current) return 220;
    return Math.max(80, trackRef.current.clientWidth - HANDLE_SIZE - PADDING * 2);
  };

  const triggerComplete = () => {
    if (isCompleted) return;
    const limit = computeMaxDrag();
    setIsCompleted(true);
    setDragX(limit);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 180);
  };

  const handlePointerDown = (e) => {
    if (isCompleted) return;
    const limit = computeMaxDrag();
    setMaxDrag(limit);
    setIsDragging(true);
    startXRef.current = e.clientX;
    movedDistanceRef.current = 0;
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isCompleted) return;
    const delta = e.clientX - startXRef.current;
    movedDistanceRef.current = Math.max(movedDistanceRef.current, Math.abs(delta));
    const clamped = Math.max(0, Math.min(maxDrag, delta));
    setDragX(clamped);

    if (clamped >= maxDrag * 0.72) {
      setIsDragging(false);
      triggerComplete();
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || isCompleted) return;
    setIsDragging(false);

    // If user clicked/tapped without dragging, trigger immediately for effortless UX
    if (movedDistanceRef.current < 8) {
      triggerComplete();
      return;
    }

    if (dragX >= maxDrag * 0.72) {
      triggerComplete();
    } else {
      setDragX(0);
    }
  };

  const progressRatio = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;

  const isDarkVariant = variant === 'dark';

  return (
    <div
      ref={trackRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerComplete();
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`group relative h-16 w-full max-w-[400px] rounded-full select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden transition-shadow duration-300 ${
        isDarkVariant
          ? 'bg-[#090909] text-[#F4F7F2] border-2 border-[#090909] shadow-[0_16px_40px_rgba(9,9,9,0.35)] hover:shadow-[0_20px_50px_rgba(9,9,9,0.5)]'
          : 'bg-[#090909] text-[#F4F7F2] border-2 border-[#B8F34A] shadow-[0_14px_38px_rgba(184,243,74,0.2)] hover:shadow-[0_18px_48px_rgba(184,243,74,0.32)]'
      } ${className}`}
    >
      {/* Dynamic Drag Fill Trail */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-[#B8F34A]/25 transition-none"
        style={{
          width: `${Math.max(HANDLE_SIZE + PADDING, dragX + HANDLE_SIZE + PADDING)}px`,
          opacity: dragX > 4 || isCompleted ? 1 : 0,
        }}
      />

      {/* Center Track Label */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center pl-14 pr-14 text-center transition-opacity duration-200"
        style={{ opacity: isCompleted ? 1 : Math.max(0.25, 1 - progressRatio * 1.15) }}
      >
        <span className="font-display text-sm sm:text-base font-extrabold uppercase tracking-[0.14em] text-[#F4F7F2] whitespace-nowrap truncate">
          {isCompleted ? completedLabel : label}
        </span>
      </div>

      {/* Right Animated Triple Chevrons */}
      <div
        className="pointer-events-none absolute right-4 inset-y-0 flex items-center text-[#B8F34A] transition-opacity duration-200"
        style={{ opacity: Math.max(0, 1 - progressRatio * 1.5) }}
      >
        <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
        <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
        <ChevronRight className="w-4 h-4 animate-chevron-3" />
      </div>

      {/* Draggable Handle */}
      <div
        style={{
          transform: `translate3d(${dragX}px, 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute top-[4px] left-[4px] w-[52px] h-[52px] rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center shadow-[0_0_24px_rgba(184,243,74,0.6)] group-hover:scale-105 transition-transform"
      >
        {isCompleted ? (
          <Check className="w-6 h-6 stroke-[3]" />
        ) : (
          <ArrowRight className="w-6 h-6 stroke-[2.75] transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </div>
    </div>
  );
}

export default SwipeToStartButton;
