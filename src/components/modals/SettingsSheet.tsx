import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Bell, Shield, Palette, Lock, Trash2, LogOut,
    ChevronRight, Moon, Sun, MessageCircle, UserCheck,
    Ticket, Calendar, Check, Loader2, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, updateProfile } from '../../lib/supabase';
import './SettingsSheet.css';

interface SettingsSheetProps {
    open: boolean;
    onClose: () => void;
}

type View = 'main' | 'notifications' | 'privacy' | 'change-password' | 'delete-account';

interface NotifPrefs {
    dms: boolean;
    follows: boolean;
    bookings: boolean;
    event_reminders: boolean;
    social_activity: boolean;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            className={`settings-toggle ${on ? 'on' : ''}`}
            onClick={onToggle}
            role="switch"
            aria-checked={on}
        >
            <motion.span
                className="settings-toggle-knob"
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 40 }}
            />
        </button>
    );
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [view, setView] = useState<View>('main');

    // Notification prefs
    const [notifs, setNotifs] = useState<NotifPrefs>({
        dms: true,
        follows: true,
        bookings: true,
        event_reminders: true,
        social_activity: false,
    });
    const [savingNotifs, setSavingNotifs] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    // Privacy prefs
    const [isPrivate, setIsPrivate] = useState(false);
    const [dmPrivacy, setDmPrivacy] = useState<'everyone' | 'followers'>('everyone');
    const [savingPrivacy, setSavingPrivacy] = useState(false);
    const [privacySaved, setPrivacySaved] = useState(false);

    // Change password
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    // Delete account
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleClose = () => {
        setView('main');
        onClose();
    };

    const saveNotifs = async () => {
        if (!user?.id) return;
        setSavingNotifs(true);
        // Store in profile metadata
        await updateProfile(user.id, { notification_prefs: notifs } as any);
        setSavingNotifs(false);
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 2000);
    };

    const savePrivacy = async () => {
        if (!user?.id) return;
        setSavingPrivacy(true);
        await updateProfile(user.id, { is_private: isPrivate, dm_privacy: dmPrivacy } as any);
        setSavingPrivacy(false);
        setPrivacySaved(true);
        setTimeout(() => setPrivacySaved(false), 2000);
    };

    const handleChangePassword = async () => {
        setPwError('');
        if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
        if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
        setPwLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPw });
        setPwLoading(false);
        if (error) { setPwError(error.message); return; }
        setPwSuccess(true);
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setTimeout(() => { setPwSuccess(false); setView('main'); }, 2000);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setDeleting(true);
        await signOut();
        // In production, call a Supabase Edge Function to hard-delete the auth user
        // supabase.functions.invoke('delete-account', { body: { user_id: user?.id } })
        setDeleting(false);
    };

    const NOTIF_ITEMS = [
        { key: 'dms', icon: MessageCircle, label: 'Direct Messages', sub: 'When someone messages you' },
        { key: 'follows', icon: UserCheck, label: 'New Followers', sub: 'When someone follows you' },
        { key: 'bookings', icon: Ticket, label: 'Ticket Bookings', sub: 'When someone books your event' },
        { key: 'event_reminders', icon: Calendar, label: 'Event Reminders', sub: '2 hours before events you RSVP\'d to' },
        { key: 'social_activity', icon: Bell, label: 'Social Activity', sub: 'Likes, comments on your events' },
    ] as const;

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

                            {/* ── MAIN ── */}
                            {view === 'main' && (
                                <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="settings-header">
                                        <h2 className="settings-title">Settings</h2>
                                    </div>

                                    <div className="settings-section">
                                        <div className="settings-section-label">Preferences</div>

                                        <button className="settings-row" onClick={() => setView('notifications')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Bell size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Notifications</div>
                                                    <div className="settings-row-sub">Manage what you get notified about</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

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

                                        <button className="settings-row" onClick={() => setView('privacy')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Shield size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Privacy</div>
                                                    <div className="settings-row-sub">Account visibility and DM controls</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>
                                    </div>

                                    <div className="settings-section">
                                        <div className="settings-section-label">Account</div>

                                        <button className="settings-row" onClick={() => setView('change-password')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Lock size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Change Password</div>
                                                    <div className="settings-row-sub">Update your login password</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="settings-chevron" />
                                        </button>

                                        <button className="settings-row" onClick={signOut}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><LogOut size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title" style={{ color: '#ef4444' }}>Sign Out</div>
                                                    <div className="settings-row-sub">Log out of your account</div>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="settings-row" onClick={() => setView('delete-account')}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}><Trash2 size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title" style={{ color: 'rgba(239,68,68,0.7)' }}>Delete Account</div>
                                                    <div className="settings-row-sub">Permanently remove your data</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="settings-footer-note">
                                        Version 1.0.0 · <span>Privacy Policy</span> · <span>Terms</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── NOTIFICATIONS ── */}
                            {view === 'notifications' && (
                                <motion.div key="notifs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="settings-header settings-header-back">
                                        <button className="settings-back-btn" onClick={() => setView('main')}>
                                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                        <h2 className="settings-title">Notifications</h2>
                                    </div>

                                    <p className="settings-section-desc">Choose what notifications you receive. Changes are saved immediately.</p>

                                    <div className="settings-section">
                                        {NOTIF_ITEMS.map(({ key, icon: Icon, label, sub }) => (
                                            <div key={key} className="settings-row" style={{ cursor: 'default' }}>
                                                <div className="settings-row-left">
                                                    <div className="settings-row-icon"><Icon size={18} /></div>
                                                    <div>
                                                        <div className="settings-row-title">{label}</div>
                                                        <div className="settings-row-sub">{sub}</div>
                                                    </div>
                                                </div>
                                                <Toggle
                                                    on={notifs[key]}
                                                    onToggle={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button className="settings-save-btn" onClick={saveNotifs} disabled={savingNotifs}>
                                        {savingNotifs ? <Loader2 size={16} className="settings-spinner" /> : notifSaved ? <><Check size={16} /> Saved!</> : 'Save Preferences'}
                                    </button>
                                </motion.div>
                            )}

                            {/* ── PRIVACY ── */}
                            {view === 'privacy' && (
                                <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="settings-header settings-header-back">
                                        <button className="settings-back-btn" onClick={() => setView('main')}>
                                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                        <h2 className="settings-title">Privacy</h2>
                                    </div>

                                    <div className="settings-section">
                                        <div className="settings-section-label">Account Visibility</div>
                                        <div className="settings-row" style={{ cursor: 'default' }}>
                                            <div className="settings-row-left">
                                                <div className="settings-row-icon"><Eye size={18} /></div>
                                                <div>
                                                    <div className="settings-row-title">Private Account</div>
                                                    <div className="settings-row-sub">Only approved followers see your events and activity</div>
                                                </div>
                                            </div>
                                            <Toggle on={isPrivate} onToggle={() => setIsPrivate(p => !p)} />
                                        </div>
                                    </div>

                                    <div className="settings-section">
                                        <div className="settings-section-label">Messaging</div>
                                        <p className="settings-section-desc">Who can send you direct messages?</p>

                                        {(['everyone', 'followers'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                className={`settings-radio-row ${dmPrivacy === opt ? 'selected' : ''}`}
                                                onClick={() => setDmPrivacy(opt)}
                                            >
                                                <div className="settings-radio-dot" />
                                                <div>
                                                    <div className="settings-row-title" style={{ textTransform: 'capitalize' }}>{opt === 'everyone' ? 'Everyone' : 'Followers Only'}</div>
                                                    <div className="settings-row-sub">
                                                        {opt === 'everyone' ? 'Anyone can message you' : 'Only people you follow back can message you'}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button className="settings-save-btn" onClick={savePrivacy} disabled={savingPrivacy}>
                                        {savingPrivacy ? <Loader2 size={16} className="settings-spinner" /> : privacySaved ? <><Check size={16} /> Saved!</> : 'Save Privacy Settings'}
                                    </button>
                                </motion.div>
                            )}

                            {/* ── CHANGE PASSWORD ── */}
                            {view === 'change-password' && (
                                <motion.div key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="settings-header settings-header-back">
                                        <button className="settings-back-btn" onClick={() => setView('main')}>
                                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                        <h2 className="settings-title">Change Password</h2>
                                    </div>

                                    {pwSuccess ? (
                                        <div className="settings-success-state">
                                            <div className="settings-success-icon"><Check size={28} /></div>
                                            <p>Password updated successfully!</p>
                                        </div>
                                    ) : (
                                        <div className="settings-form">
                                            <div className="settings-input-group">
                                                <label>New Password</label>
                                                <div className="settings-input-wrap">
                                                    <input
                                                        type={showPw ? 'text' : 'password'}
                                                        placeholder="At least 8 characters"
                                                        value={newPw}
                                                        onChange={e => setNewPw(e.target.value)}
                                                        className="settings-input"
                                                    />
                                                    <button className="settings-pw-eye" onClick={() => setShowPw(p => !p)}>
                                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="settings-input-group">
                                                <label>Confirm Password</label>
                                                <input
                                                    type={showPw ? 'text' : 'password'}
                                                    placeholder="Repeat new password"
                                                    value={confirmPw}
                                                    onChange={e => setConfirmPw(e.target.value)}
                                                    className="settings-input"
                                                />
                                            </div>
                                            {pwError && <p className="settings-error">{pwError}</p>}
                                            <button className="settings-save-btn" onClick={handleChangePassword} disabled={pwLoading || !newPw || !confirmPw}>
                                                {pwLoading ? <Loader2 size={16} className="settings-spinner" /> : 'Update Password'}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ── DELETE ACCOUNT ── */}
                            {view === 'delete-account' && (
                                <motion.div key="delete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="settings-header settings-header-back">
                                        <button className="settings-back-btn" onClick={() => setView('main')}>
                                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                        <h2 className="settings-title" style={{ color: '#ef4444' }}>Delete Account</h2>
                                    </div>

                                    <div className="settings-danger-box">
                                        <Trash2 size={28} color="#ef4444" />
                                        <h3>This can't be undone</h3>
                                        <p>All your events, tickets, messages, and data will be permanently deleted.</p>
                                    </div>

                                    <div className="settings-form">
                                        <div className="settings-input-group">
                                            <label>Type <strong>DELETE</strong> to confirm</label>
                                            <input
                                                className="settings-input settings-input-danger"
                                                placeholder="DELETE"
                                                value={deleteConfirm}
                                                onChange={e => setDeleteConfirm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            className="settings-danger-btn"
                                            disabled={deleteConfirm !== 'DELETE' || deleting}
                                            onClick={handleDeleteAccount}
                                        >
                                            {deleting ? <Loader2 size={16} className="settings-spinner" /> : 'Permanently Delete Account'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
