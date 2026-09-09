import { useRef, type ReactNode } from 'react';

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number>(0);
  const isDragging = useRef(false);
  const pointerId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    currentX.current = 0;
    isDragging.current = true;
    pointerId.current = e.pointerId;
    
    // Only call setPointerCapture if it exists (browser environment)
    if (cardRef.current && cardRef.current.setPointerCapture) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || startX.current === null) return;

    const deltaX = e.clientX - startX.current;
    currentX.current = deltaX;

    // Update card position and rotation
    if (cardRef.current) {
      const rotate = deltaX * 0.08; // Rotate based on drag
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
      cardRef.current.style.transition = 'none';
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    startX.current = null;
    pointerId.current = null;

    const threshold = 100;

    if (cardRef.current) {
      if (currentX.current > threshold) {
        // Swipe right
        cardRef.current.style.transform = `translateX(400px) rotate(20deg)`;
        cardRef.current.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          onSwipeRight?.();
        }, 300);
      } else if (currentX.current < -threshold) {
        // Swipe left
        cardRef.current.style.transform = `translateX(-400px) rotate(-20deg)`;
        cardRef.current.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          onSwipeLeft?.();
        }, 300);
      } else {
        // Return to center
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
        cardRef.current.style.transition = 'transform 0.3s ease';
        currentX.current = 0;
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative touch-none select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ transition: 'none' }}
    >
      {children}
    </div>
  );
}