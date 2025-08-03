import React, { useState, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

export function SwipeToDelete({ 
  children, 
  onDelete, 
  disabled = false,
  className = ""
}: SwipeToDeleteProps) {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = -80; // Distance to trigger delete
  const DELETE_THRESHOLD = -120; // Distance for immediate delete

  const handleDragStart = () => {
    if (disabled) return;
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || isDeleting) return;

    // Only allow left swipe (negative offset)
    const newX = Math.min(info.offset.x, 0);
    setDragX(newX);
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || isDeleting) return;

    const finalX = info.offset.x;

    if (finalX <= DELETE_THRESHOLD) {
      // Immediate delete
      setIsDeleting(true);
      await controls.start({ 
        x: -window.innerWidth,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      });
      onDelete();
    } else if (finalX <= SWIPE_THRESHOLD) {
      // Show delete option
      await controls.start({ 
        x: SWIPE_THRESHOLD,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      setDragX(SWIPE_THRESHOLD);
    } else {
      // Snap back
      await controls.start({ 
        x: 0,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      setDragX(0);
    }
  };

  const handleDeleteClick = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    await controls.start({ 
      x: -window.innerWidth,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    });
    onDelete();
  };

  const resetPosition = async () => {
    if (isDeleting) return;
    
    await controls.start({ 
      x: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    });
    setDragX(0);
  };

  const deleteButtonOpacity = Math.min(Math.abs(dragX) / Math.abs(SWIPE_THRESHOLD), 1);
  const deleteButtonScale = Math.min(Math.abs(dragX) / Math.abs(SWIPE_THRESHOLD), 1);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Delete background */}
      <div 
        className="absolute inset-0 bg-destructive flex items-center justify-end pr-4"
        style={{
          opacity: deleteButtonOpacity * 0.9
        }}
      >
        <motion.button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 text-destructive-foreground"
          style={{
            scale: deleteButtonScale,
            opacity: deleteButtonOpacity
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 className="w-5 h-5" />
          <span className="body-medium">Delete</span>
        </motion.button>
      </div>

      {/* Swipeable content */}
      <motion.div
        drag={!disabled && !isDeleting ? "x" : false}
        dragConstraints={{ left: -200, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 bg-card"
        whileDrag={{ scale: 0.98 }}
      >
        {children}
      </motion.div>

      {/* Tap outside to reset */}
      {dragX < 0 && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={resetPosition}
        />
      )}
    </div>
  );
}