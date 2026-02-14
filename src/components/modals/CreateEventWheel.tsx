import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, Ticket, Coffee, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../modals/ModalStyles.css';

const CATEGORIES = [
    { id: 'party', name: 'House Party', c1: '#FF0044', c2: '#FF8800' },
    { id: 'concert', name: 'Concert', c1: '#1a1a2e', c2: '#5533ff' },
    { id: 'chill', name: 'Chill Sesh', c1: '#00CC88', c2: '#00EEDD' },
    { id: 'dinner', name: 'Dinner', c1: '#FFCC00', c2: '#FF6600' },
    { id: 'sports', name: 'Sports', c1: '#FF4400', c2: '#CC0000' },
    { id: 'other', name: 'Other', c1: '#CC00FF', c2: '#FF66AA' },
];

interface CreateEventWheelProps {
    open: boolean;
    onClose: () => void;
    onSelectType: (type: 'casual' | 'ticketed') => void;
}

export function CreateEventWheel({ open, onClose, onSelectType }: CreateEventWheelProps) {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual');

    useEffect(() => {
        if (!open) {
            setStep(1);
            setCategory(CATEGORIES[0]);
            setEventType('casual');
        }
    }, [open]);

    const handleContinue = () => {
        onSelectType(eventType);
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        <div className="create-screen" style={{ height: 'auto', padding: '20px 20px 24px' }}>
                            {/* Header */}
                            <div className="create-header">
                                {step > 1 ? (
                                    <button className="create-back-btn" onClick={() => setStep(step - 1)}>
                                        <ArrowLeft size={20} />
                                    </button>
                                ) : <div style={{ width: 40 }} />}
                                <span className="create-title-text">Create Event</span>
                                <div style={{ width: 40 }} />
                            </div>

                            {/* Progress */}
                            <div className="create-steps">
                                {[1, 2].map(i => (
                                    <div key={i} className={`create-step-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
                                ))}
                            </div>

                            {step === 1 && (
                                <>
                                    <h2 className="create-step-title">Choose the Vibe</h2>
                                    <p className="create-step-subtitle">Select a disc for your event</p>

                                    <div className="disc-stage">
                                        {/* Main spinning CD */}
                                        <div
                                            className="main-disc"
                                            style={{ '--disc-c1': category.c1, '--disc-c2': category.c2 } as React.CSSProperties}
                                        >
                                            <div className="disc-tracks" />
                                            <div className="disc-shine" />
                                            <div className="disc-center-hole" />
                                        </div>
                                        <div className="disc-name">{category.name}</div>

                                        {/* Mini disc grid */}
                                        <div className="disc-grid">
                                            {CATEGORIES.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    className={`mini-disc ${category.id === cat.id ? 'selected' : ''}`}
                                                    onClick={() => setCategory(cat)}
                                                >
                                                    <div
                                                        className="mini-disc-circle"
                                                        style={{ '--mc1': cat.c1, '--mc2': cat.c2 } as React.CSSProperties}
                                                    >
                                                        <div className="mini-disc-hub" />
                                                    </div>
                                                    <span className="mini-disc-label">{cat.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Event Type Toggle */}
                                        <div className="event-type-section" style={{ marginTop: 20 }}>
                                            <div className="event-type-label">Event Type</div>
                                            <div className="event-type-toggle">
                                                <button
                                                    className={`type-btn ${eventType === 'casual' ? 'active' : ''}`}
                                                    onClick={() => setEventType('casual')}
                                                >
                                                    <Coffee size={14} /> Casual
                                                </button>
                                                <button
                                                    className={`type-btn ${eventType === 'ticketed' ? 'active' : ''}`}
                                                    onClick={() => setEventType('ticketed')}
                                                >
                                                    <Ticket size={14} /> Ticketed
                                                </button>
                                            </div>
                                        </div>

                                        <button className="create-continue-btn" style={{ marginTop: 16 }} onClick={handleContinue}>
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('app-container') || document.body
    );
}
