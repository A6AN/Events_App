import { useState, useEffect } from 'react';
import { Zap, Ticket, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        }, 200);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop - reduced blur for premium look */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
                        onClick={onClose}
                    />

                    {/* Centered Container - positioned at bottom above nav */}
                    <div className="fixed inset-x-0 bottom-28 z-50 flex justify-center pointer-events-none">
                        <div className="relative pointer-events-auto">
                            {/* Center Plus Button (transforms to X) */}
                            <motion.button
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 45 }}
                                exit={{ rotate: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={onClose}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 flex items-center justify-center z-10 border-4 border-background"
                            >
                                <Plus className="h-6 w-6" />
                            </motion.button>

                            {/* Casual Event - Left */}
                            <motion.button
                                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                animate={{ x: -80, y: -20, opacity: 1, scale: 1 }}
                                exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                onClick={() => handleSelect('casual')}
                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                                    selectedType === 'casual' ? 'scale-110' : ''
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                    selectedType === 'casual'
                                        ? 'bg-primary shadow-primary/50'
                                        : 'bg-card border border-border hover:bg-primary/20 hover:border-primary/50'
                                }`}>
                                    <Zap className={`h-5 w-5 ${
                                        selectedType === 'casual' ? 'text-primary-foreground' : 'text-primary'
                                    }`} />
                                </div>
                                <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded-full shadow-sm">
                                    Casual
                                </span>
                            </motion.button>

                            {/* Ticketed Event - Right */}
                            <motion.button
                                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                animate={{ x: 80, y: -20, opacity: 1, scale: 1 }}
                                exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                onClick={() => handleSelect('ticketed')}
                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                                    selectedType === 'ticketed' ? 'scale-110' : ''
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                    selectedType === 'ticketed'
                                        ? 'bg-primary shadow-primary/50'
                                        : 'bg-card border border-border hover:bg-primary/20 hover:border-primary/50'
                                }`}>
                                    <Ticket className={`h-5 w-5 ${
                                        selectedType === 'ticketed' ? 'text-primary-foreground' : 'text-primary'
                                    }`} />
                                </div>
                                <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded-full shadow-sm">
                                    Ticketed
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
