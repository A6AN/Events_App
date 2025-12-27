import { useState, useEffect } from 'react';
import { Zap, Ticket, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateEventWheelProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'casual' | 'ticketed') => void;
}

export function CreateEventWheel({ open, onClose, onSelectType }: CreateEventWheelProps) {
  const [selectedType, setSelectedType] = useState<'casual' | 'ticketed' | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
    }
  }, [open]);

  const handleSelect = (type: 'casual' | 'ticketed') => {
    setSelectedType(type);
    setTimeout(() => {
      onSelectType(type);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Wheel Container */}
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none pb-24">
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto relative"
            >
              {/* Close Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onClose}
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-card/90 backdrop-blur-xl border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-lg"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>

              {/* Radial Options */}
              <div className="relative w-[260px] h-[140px]">
                {/* Casual Event - Left */}
                <motion.button
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: -120, opacity: 1 }}
                  exit={{ x: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.05 }}
                  onClick={() => handleSelect('casual')}
                  className={`absolute top-1/2 left-1/2 -translate-y-1/2 w-32 h-32 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-2xl transition-all duration-300 ${
                    selectedType === 'casual'
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-card border-2 border-border hover:border-primary/50 hover:scale-105 text-foreground'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedType === 'casual' 
                      ? 'bg-primary-foreground/20' 
                      : 'bg-primary/20'
                  }`}>
                    <Zap className={`h-7 w-7 ${
                      selectedType === 'casual' 
                        ? 'text-primary-foreground' 
                        : 'text-primary'
                    }`} />
                  </div>
                  <span className="text-sm">Casual</span>
                </motion.button>

                {/* Ticketed Event - Right */}
                <motion.button
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: 120, opacity: 1 }}
                  exit={{ x: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.05 }}
                  onClick={() => handleSelect('ticketed')}
                  className={`absolute top-1/2 left-1/2 -translate-y-1/2 w-32 h-32 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-2xl transition-all duration-300 ${
                    selectedType === 'ticketed'
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-card border-2 border-border hover:border-primary/50 hover:scale-105 text-foreground'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedType === 'ticketed' 
                      ? 'bg-primary-foreground/20' 
                      : 'bg-primary/20'
                  }`}>
                    <Ticket className={`h-7 w-7 ${
                      selectedType === 'ticketed' 
                        ? 'text-primary-foreground' 
                        : 'text-primary'
                    }`} />
                  </div>
                  <span className="text-sm">Ticketed</span>
                </motion.button>

                {/* Center Connection Line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}