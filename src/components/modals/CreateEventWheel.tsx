import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Ticket, X } from 'lucide-react';
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

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Centered Content Container */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative pointer-events-auto" style={{ width: '200px', height: '200px' }}>

                            {/* Casual Event - Left */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                                animate={{ opacity: 1, scale: 1, x: -65, y: -30 }}
                                exit={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.05 }}
                                onClick={() => handleSelect('casual')}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${selectedType === 'casual'
                                        ? 'bg-emerald-500 shadow-emerald-500/60'
                                        : 'bg-emerald-500/90 hover:bg-emerald-500 shadow-emerald-500/40'
                                        }`}
                                >
                                    {/* Pulsing ring */}
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-emerald-500/30"
                                    />
                                    <Zap className="h-7 w-7 text-white relative z-10" />
                                </motion.div>
                                <span className="text-sm font-bold text-white drop-shadow-lg">
                                    Casual
                                </span>
                            </motion.button>

                            {/* Ticketed Event - Right */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                                animate={{ opacity: 1, scale: 1, x: 65, y: -30 }}
                                exit={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                                onClick={() => handleSelect('ticketed')}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${selectedType === 'ticketed'
                                        ? 'bg-teal-500 shadow-teal-500/60'
                                        : 'bg-teal-500/90 hover:bg-teal-500 shadow-teal-500/40'
                                        }`}
                                >
                                    {/* Pulsing ring */}
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        className="absolute inset-0 rounded-full bg-teal-500/30"
                                    />
                                    <Ticket className="h-7 w-7 text-white relative z-10" />
                                </motion.div>
                                <span className="text-sm font-bold text-white drop-shadow-lg">
                                    Ticketed
                                </span>
                            </motion.button>

                            {/* Center Close Button */}
                            <motion.button
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={onClose}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 backdrop-blur-lg shadow-2xl flex items-center justify-center z-10 border border-white/50"
                            >
                                <X className="h-7 w-7 text-gray-800" />
                            </motion.button>

                            {/* Label */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 50 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 text-center text-white/80 text-sm font-medium whitespace-nowrap"
                            >
                                What type of event?
                            </motion.p>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('app-container') || document.body
    );
}
