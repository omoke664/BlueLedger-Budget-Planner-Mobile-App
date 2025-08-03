import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  className?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  isRefreshing = false,
  className = ""
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const THRESHOLD = 80; // Distance to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    if (isRefreshing) {
      controls.start({ rotate: 360 });
    } else {
      controls.stop();
      controls.set({ rotate: 0 });
    }
  }, [isRefreshing, controls]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      const pull = Math.min(deltaY * 0.5, MAX_PULL);
      setPullDistance(pull);
      setCurrentY(currentY);
      
      if (pull >= THRESHOLD && !isTriggered) {
        setIsTriggered(true);
        // Haptic feedback simulation
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else if (pull < THRESHOLD && isTriggered) {
        setIsTriggered(false);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsTriggered(false);
      await onRefresh();
    }
    
    setPullDistance(0);
    setIsTriggered(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.clientY);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isRefreshing) return;

    const currentY = e.clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      const pull = Math.min(deltaY * 0.3, MAX_PULL);
      setPullDistance(pull);
      setCurrentY(currentY);
      
      if (pull >= THRESHOLD && !isTriggered) {
        setIsTriggered(true);
      } else if (pull < THRESHOLD && isTriggered) {
        setIsTriggered(false);
      }
    }
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsTriggered(false);
      await onRefresh();
    }
    
    setPullDistance(0);
    setIsTriggered(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY]);

  const refreshOpacity = pullDistance / THRESHOLD;
  const refreshScale = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          height: Math.max(pullDistance, 0),
          transform: `translateY(${Math.max(pullDistance - 60, -60)}px)`,
        }}
      >
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isTriggered 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
          style={{
            opacity: refreshOpacity,
            scale: refreshScale
          }}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? { 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            } : { duration: 0.2 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          <span className="caption">
            {isRefreshing 
              ? 'Refreshing...' 
              : isTriggered 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}