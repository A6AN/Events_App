import { useState, useEffect } from 'react';
import { Zap, Ticket, Plus } from 'lucide-react';
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

                    {/* Center Plus Button (transforms to X) - Fixed position */}
                    <motion.button
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 45 }}
                        exit={{ rotate: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed bottom-[5.75rem] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 flex items-center justify-center z-[60] border-4 border-background"
                    >
                        <Plus className="h-6 w-6" />
                    </motion.button>

                    {/* Casual Event - Left */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: 'calc(-50% - 70px)' }}
                        exit={{ opacity: 0, scale: 0.5, x: '-50%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={() => handleSelect('casual')}
                        className={`fixed bottom-32 left-1/2 z-[55] flex flex-col items-center gap-1.5 ${
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
                        <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded-full shadow-sm border border-border">
                            Casual
                        </span>
                    </motion.button>

                    {/* Ticketed Event - Right */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: 'calc(-50% + 70px)' }}
                        exit={{ opacity: 0, scale: 0.5, x: '-50%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={() => handleSelect('ticketed')}
                        className={`fixed bottom-32 left-1/2 z-[55] flex flex-col items-center gap-1.5 ${
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
                        <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded-full shadow-sm border border-border">
                            Ticketed
                        </span>
                    </motion.button>
                </>
            )}
        </AnimatePresence>
    );
}
