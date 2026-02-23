import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, UserPlus, Heart, MessageCircle, Ticket, Calendar, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getNotifications,
    markAllNotificationsRead,
    subscribeToNotifications,
    AppNotification,
} from '../../lib/supabase';
import './NotificationsSheet.css';
import '../modals/ModalStyles.css';

interface NotificationsSheetProps {
    open: boolean;
    onClose: () => void;
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function groupNotifications(notifs: AppNotification[]): { label: string; items: AppNotification[] }[] {
    const now = Date.now();
    const today: AppNotification[] = [];
    const thisWeek: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    notifs.forEach(n => {
        const age = now - new Date(n.created_at).getTime();
        if (age < 86400000) today.push(n);
        else if (age < 604800000) thisWeek.push(n);
        else earlier.push(n);
    });

    const groups = [];
    if (today.length) groups.push({ label: 'Today', items: today });
    if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
    if (earlier.length) groups.push({ label: 'Earlier', items: earlier });
    return groups;
}

const TYPE_ICON: Record<AppNotification['type'], { icon: any; color: string }> = {
    follow: { icon: UserPlus, color: '#a78bfa' },
    like: { icon: Heart, color: '#f472b6' },
    comment: { icon: MessageCircle, color: '#60a5fa' },
    booking: { icon: Ticket, color: '#34d399' },
    dm: { icon: MessageCircle, color: '#facc15' },
    event_reminder: { icon: Calendar, color: '#fb923c' },
};

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        const data = await getNotifications(user.id);
        setNotifications(data);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        if (open && user?.id) load();
    }, [open, user?.id, load]);

    // Mark all read when sheet opens
    useEffect(() => {
        if (open && user?.id) {
            markAllNotificationsRead(user.id);
            // Optimistically mark all as read in local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    }, [open, user?.id]);

    // Real-time new notifications
    useEffect(() => {
        if (!user?.id) return;
        const channel = subscribeToNotifications(user.id, (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });
        return () => { channel.unsubscribe(); };
    }, [user?.id]);

    const handleMarkAllRead = async () => {
        if (!user?.id) return;
        setMarkingRead(true);
        await markAllNotificationsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setMarkingRead(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const groups = groupNotifications(notifications);

    const getAvatar = (n: AppNotification) => {
        if (n.actor?.avatar_url) return n.actor.avatar_url;
        const name = n.actor?.full_name || n.actor?.username || '?';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000&bold=true`;
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content notifs-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        {/* Header */}
                        <div className="notifs-header">
                            <div className="notifs-header-left">
                                <h2 className="notifs-title">Notifications</h2>
                                {unreadCount > 0 && (
                                    <span className="notifs-badge">{unreadCount} new</span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button className="notifs-mark-read" onClick={handleMarkAllRead} disabled={markingRead}>
                                    {markingRead ? <Loader2 size={13} className="notifs-spinner" /> : <><Check size={13} /> Mark all read</>}
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="notifs-body">
                            {loading ? (
                                <div className="notifs-loading">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="notif-skeleton">
                                            <div className="notif-skeleton-avatar" />
                                            <div className="notif-skeleton-lines">
                                                <div className="notif-skeleton-line long" />
                                                <div className="notif-skeleton-line short" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="notifs-empty">
                                    <div className="notifs-empty-icon">
                                        <Bell size={32} />
                                    </div>
                                    <p className="notifs-empty-title">All caught up!</p>
                                    <p className="notifs-empty-sub">Follow people and interact with events to get notifications here.</p>
                                </div>
                            ) : (
                                groups.map(({ label, items }) => (
                                    <div key={label} className="notif-group">
                                        <div className="notif-group-label">{label}</div>
                                        {items.map((n, i) => {
                                            const { icon: Icon, color } = TYPE_ICON[n.type] || TYPE_ICON.follow;
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    className={`notif-row ${!n.read ? 'unread' : ''}`}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                >
                                                    {/* Avatar stack: actor photo + type icon badge */}
                                                    <div className="notif-avatar-wrap">
                                                        <img
                                                            src={getAvatar(n)}
                                                            alt=""
                                                            className="notif-avatar"
                                                        />
                                                        <div
                                                            className="notif-type-badge"
                                                            style={{ background: color }}
                                                        >
                                                            <Icon size={10} color="#000" strokeWidth={2.5} />
                                                        </div>
                                                    </div>

                                                    {/* Text */}
                                                    <div className="notif-text">
                                                        <p className="notif-body-text">
                                                            <strong>{n.actor?.full_name || n.actor?.username || 'Someone'}</strong>{' '}
                                                            {n.body}
                                                        </p>
                                                        <span className="notif-time">{timeAgo(n.created_at)}</span>
                                                    </div>

                                                    {/* Unread dot */}
                                                    {!n.read && <div className="notif-unread-dot" />}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
