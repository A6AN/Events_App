import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Ticket, Coffee } from 'lucide-react';
import './CreateEventScreen.css';

const CATEGORIES = [
    { id: 'party', name: 'House Party', c1: '#FF0044', c2: '#FF8800' },
    { id: 'concert', name: 'Concert', c1: '#1a1a2e', c2: '#5533ff' },
    { id: 'chill', name: 'Chill Sesh', c1: '#00CC88', c2: '#00EEDD' },
    { id: 'dinner', name: 'Dinner', c1: '#FFCC00', c2: '#FF6600' },
    { id: 'sports', name: 'Sports', c1: '#FF4400', c2: '#CC0000' },
    { id: 'other', name: 'Other', c1: '#CC00FF', c2: '#FF66AA' },
];

export const CreateEventScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual');

    return (
        <div className="create-screen">
            {/* Header */}
            <div className="create-header">
                <button className="create-back-btn" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
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
                        <div className="event-type-section">
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

                        <button className="create-continue-btn" onClick={() => setStep(2)}>
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="create-step-title">Event Details</h2>
                    <p className="create-step-subtitle">Tell people what's happening</p>

                    <div className="create-form">
                        <div className="create-field">
                            <label className="create-label">Event Name</label>
                            <input type="text" className="create-input" placeholder="e.g. Saturday Night Rage" />
                        </div>

                        <div className="create-field">
                            <label className="create-label">Description</label>
                            <textarea className="create-input" placeholder="What should people expect?" />
                        </div>

                        <div className="create-row">
                            <div className="create-field">
                                <label className="create-label">Date</label>
                                <input type="date" className="create-input" />
                            </div>
                            <div className="create-field">
                                <label className="create-label">Time</label>
                                <input type="time" className="create-input" />
                            </div>
                        </div>

                        <div className="create-field">
                            <label className="create-label">Location</label>
                            <input type="text" className="create-input" placeholder="Where is it happening?" />
                        </div>

                        {eventType === 'ticketed' && (
                            <div className="create-field">
                                <label className="create-label">Ticket Price (₹)</label>
                                <input type="number" className="create-input" placeholder="e.g. 499" />
                            </div>
                        )}

                        <button className="create-continue-btn" onClick={() => navigate('/event/1')}>
                            Publish Event <Check size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
