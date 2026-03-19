import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, Check, Loader2, Moon, Sun, Eye, EyeOff, Trash2, LogOut,
    User, Palette, BadgeCheck, Lock, Ticket, CreditCard, Star, Bell,
    Activity, Map, Shield, Settings, LifeBuoy, Wrench, Ban, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, updateProfile } from '../../lib/supabase';
import './SettingsSheet.css';

interface SettingsSheetProps {
    open: boolean;
    onClose: () => void;
    profile?: any;
}

type View = 
    | 'main' 
    // Account Area
    | 'profile-appearance'
    | 'personal-details'
    | 'milo-verified'
    | 'attendance-visibility'
    // Manage Format
    | 'bookings-hub'
    | 'payments-transactions'
    | 'your-reviews'
    | 'reminders'
    // Settings Format
    | 'pass-security'
    | 'activity-controls'
    | 'discovery-experience'
    | 'creator-tools'
    | 'support-info';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button className={`settings-toggle ${on ? 'on' : ''}`} onClick={onToggle}>
            <motion.span className="settings-toggle-knob" layout transition={{ type: 'spring', stiffness: 700, damping: 40 }} />
        </button>
    );
}

export function SettingsSheet({ open, onClose, profile }: SettingsSheetProps) {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [view, setView] = useState<View>('main');

    // Existing forms state ported over
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const handleClose = () => {
        setView('main');
        onClose();
    };

    // Sub-renderers
    const renderHeader = (title: string, back: View = 'main') => (
        <div className="settings-header settings-header-back">
            <button className="settings-back-btn" onClick={() => setView(back)}>
                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h2 className="settings-title">{title}</h2>
        </div>
    );

    const renderPlaceholder = (title: string, desc: string) => (
        <motion.div key={title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderHeader(title)}
            <div className="settings-success-state">
                <div className="settings-success-icon"><Wrench size={28} /></div>
                <p>{desc}</p>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This section is currently under development.</span>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={handleClose}>
                    <motion.div
                        className="sheet-content settings-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={handleClose}><X size={18} /></button>

                        <AnimatePresence mode="wait">
                            {/* ── 1. MAIN MENU ── */}
                            {view === 'main' && (
                                <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="settings-header">
                                        <h2 className="settings-title">Menu</h2>
                                    </div>

                                    {/* ACCOUNT AREA */}
                                    <div className="settings-section">
                                        <div className="settings-section-label">Account Area</div>
                                        
                                        <button className="settings-row" onClick={() => setView('profile-appearance')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Palette size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Profile & Appearance</div>
                                                    <div className="settings-row-sub">Themes, Avatars, Dark Mode</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('personal-details')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><User size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Personal Details</div>
                                                    <div className="settings-row-sub">Contact info, Date of Birth</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('milo-verified')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><BadgeCheck size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Milo Verified</div>
                                                    <div className="settings-row-sub">Request blue tick status</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('attendance-visibility')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Eye size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Attendance Visibility</div>
                                                    <div className="settings-row-sub">Public / Private history</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>
                                    </div>

                                    {/* MANAGE FORMAT */}
                                    <div className="settings-section">
                                        <div className="settings-section-label">Manage</div>
                                        
                                        <button className="settings-row" onClick={() => setView('bookings-hub')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Ticket size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Bookings Hub</div>
                                                    <div className="settings-row-sub">Tables, Tickets, Music</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('payments-transactions')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><CreditCard size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Payments & Transactions</div>
                                                    <div className="settings-row-sub">Cards, UPI, History</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('your-reviews')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Star size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Your Reviews</div>
                                                    <div className="settings-row-sub">Feedback given to hosts</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('reminders')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Bell size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Reminders</div>
                                                    <div className="settings-row-sub">Event & Movie alerts</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>
                                    </div>

                                    {/* SETTINGS FORMAT */}
                                    <div className="settings-section">
                                        <div className="settings-section-label">Settings</div>
                                        
                                        <button className="settings-row" onClick={() => setView('pass-security')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Shield size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Pass & Security</div>
                                                    <div className="settings-row-sub">2FA, Password, Devices</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('activity-controls')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Activity size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Activity Controls</div>
                                                    <div className="settings-row-sub">Likes, Comments, Tags</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('discovery-experience')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Map size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Discovery & Experience</div>
                                                    <div className="settings-row-sub">Radius, Feed Mutes, Chat</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('creator-tools')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Wrench size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Creator Tools</div>
                                                    <div className="settings-row-sub">Event Defaults, Rep Score, Payouts</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={() => setView('support-info')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><LifeBuoy size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Support & Info</div>
                                                    <div className="settings-row-sub">Help Center, TOS, App Updates</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>
                                        
                                        <button className="settings-row" onClick={signOut}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><LogOut size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title" style={{ color: '#ef4444' }}>Sign Out</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="settings-footer-note">
                                        Version 2.0.0 (Alpha Build) · <span>Privacy</span> · <span>Terms</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 2. SUB-PAGES (Placeholders & Ports) ── */}

                            {view === 'profile-appearance' && (
                                <motion.div key="pa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    {renderHeader('Profile & Appearance')}
                                    <div className="settings-section">
                                        <div className="settings-row" style={{ cursor: 'default' }}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon">
                                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                                </div>
                                                <div>
                                                    <div className="settings-row-title">Dark Mode</div>
                                                    <div className="settings-row-sub">{theme === 'dark' ? 'Currently dark' : 'Currently light'}</div>
                                                </div>
                                            </div>
                                            <Toggle on={theme === 'dark'} onToggle={toggleTheme} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'pass-security' && (
                                <motion.div key="ps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    {renderHeader('Pass & Security')}
                                    <div className="settings-section">
                                        <div className="settings-section-label">Password</div>
                                        <div className="settings-form mt-4">
                                            <div className="settings-input-group">
                                                <label>New Password</label>
                                                <div className="settings-input-wrap">
                                                    <input type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} className="settings-input" />
                                                    <button className="settings-pw-eye" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                                </div>
                                            </div>
                                            <div className="settings-input-group">
                                                <label>Confirm Password</label>
                                                <input type={showPw ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="settings-input" />
                                            </div>
                                            <button className="settings-save-btn">Update Password</button>
                                        </div>
                                    </div>
                                    <div className="settings-section" style={{ marginTop: 40 }}>
                                        <div className="settings-section-label" style={{ color: '#ef4444' }}>Danger Zone</div>
                                        <div className="settings-danger-box">
                                            <Trash2 size={24} color="#ef4444" />
                                            <h3>Delete Account</h3>
                                            <p>This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'discovery-experience' && renderPlaceholder('Discovery & Experience', 'Configure Map radius, Nearby alerts, and Chat delivery options.')}
                            {view === 'creator-tools' && renderPlaceholder('Creator Tools', 'Manage payout KYC, Rep Score visibility, and Event defaults.')}
                            {view === 'personal-details' && renderPlaceholder('Personal Details', 'Manage Date of Birth, Email, and Phone number.')}
                            {view === 'milo-verified' && renderPlaceholder('Milo Verified', 'Submit student ID for instant premium host verification.')}
                            {view === 'attendance-visibility' && renderPlaceholder('Attendance Visibility', 'Control who can view your past and upcoming RSVPs.')}
                            {view === 'bookings-hub' && renderPlaceholder('Bookings Hub', 'Centralized dashboard for all purchased tickets.')}
                            {view === 'payments-transactions' && renderPlaceholder('Payments', 'Manage Saved UPIs and View Transaction Receipts.')}
                            {view === 'your-reviews' && renderPlaceholder('Your Reviews', 'Edit feedback provided on previous hosts.')}
                            {view === 'reminders' && renderPlaceholder('Reminders', 'Configure 24-hr and 2-hr push notification alerts.')}
                            {view === 'activity-controls' && renderPlaceholder('Activity Controls', 'Manage your Likes, Comments, Tags & Mentions.')}
                            {view === 'support-info' && renderPlaceholder('Support & Info', 'Read FAQs or start a live agent chat.')}

                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
