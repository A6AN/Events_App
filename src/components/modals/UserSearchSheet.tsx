import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, UserCheck, MessageCircle, Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchUsers, followUser, unfollowUser, getOrCreateDMConversation, SearchedUser } from '../../lib/supabase';
import { DirectMessageScreen } from './DirectMessageScreen';
import '../modals/ModalStyles.css';
import './UserSearchSheet.css';

interface UserSearchSheetProps {
    open: boolean;
    onClose: () => void;
}

export function UserSearchSheet({ open, onClose }: UserSearchSheetProps) {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());
    const [msgLoading, setMsgLoading] = useState<string | null>(null);
    const [dmTarget, setDmTarget] = useState<{ conversationId: string; otherUser: SearchedUser } | null>(null);

    // Debounced search
    useEffect(() => {
        if (!query.trim() || !user?.id) { setResults([]); return; }
        setLoading(true);
        const timer = setTimeout(async () => {
            const data = await searchUsers(query, user.id);
            setResults(data);
            setLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, [query, user?.id]);

    // Reset on close
    useEffect(() => {
        if (!open) { setQuery(''); setResults([]); setDmTarget(null); }
    }, [open]);

    const handleFollow = useCallback(async (targetId: string) => {
        if (!user?.id) return;
        setFollowLoading(prev => new Set(prev).add(targetId));
        try {
            await followUser(user.id, targetId);
            setResults(prev => prev.map(u => u.id === targetId ? { ...u, isFollowing: true } : u));
        } finally {
            setFollowLoading(prev => { const s = new Set(prev); s.delete(targetId); return s; });
        }
    }, [user?.id]);

    const handleUnfollow = useCallback(async (targetId: string) => {
        if (!user?.id) return;
        setFollowLoading(prev => new Set(prev).add(targetId));
        try {
            await unfollowUser(user.id, targetId);
            setResults(prev => prev.map(u => u.id === targetId ? { ...u, isFollowing: false } : u));
        } finally {
            setFollowLoading(prev => { const s = new Set(prev); s.delete(targetId); return s; });
        }
    }, [user?.id]);

    const handleMessage = useCallback(async (u: SearchedUser) => {
        if (!user?.id) return;
        setMsgLoading(u.id);
        const convId = await getOrCreateDMConversation(user.id, u.id);
        setMsgLoading(null);
        if (convId) setDmTarget({ conversationId: convId, otherUser: u });
    }, [user?.id]);

    const getAvatar = (u: SearchedUser) => {
        if (u.avatar_url) return u.avatar_url;
        const name = u.full_name || u.username || 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000&bold=true`;
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content user-search-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        <div className="user-search-header">
                            <h2 className="user-search-title">Find People</h2>
                            <p className="user-search-sub">Search by name or username</p>
                        </div>

                        <div className="user-search-input-wrap">
                            <Search size={18} className="user-search-icon" />
                            <input
                                className="user-search-input"
                                placeholder="Search people..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                            />
                            {loading && <Loader2 size={16} className="user-search-spinner" />}
                        </div>

                        <div className="user-search-results">
                            {!query.trim() ? (
                                <div className="user-search-empty">
                                    <div className="user-search-empty-icon"><Users size={36} /></div>
                                    <p>Search for people to follow or message</p>
                                </div>
                            ) : !loading && results.length === 0 ? (
                                <div className="user-search-empty">
                                    <div className="user-search-empty-icon"><Search size={36} /></div>
                                    <p>No users found for "{query}"</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {results.map((u, i) => (
                                        <motion.div
                                            key={u.id}
                                            className="user-search-card"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <img src={getAvatar(u)} alt={u.full_name || u.username || 'User'} className="user-search-avatar" />
                                            <div className="user-search-info">
                                                <div className="user-search-name">{u.full_name || u.username || 'Unknown User'}</div>
                                                {u.username && <div className="user-search-username">@{u.username}</div>}
                                            </div>

                                            {/* Message button */}
                                            <button
                                                className="user-search-msg-btn"
                                                onClick={() => handleMessage(u)}
                                                disabled={msgLoading === u.id}
                                                title="Send a message"
                                            >
                                                {msgLoading === u.id
                                                    ? <Loader2 size={14} className="user-search-spinner" />
                                                    : <MessageCircle size={14} />}
                                            </button>

                                            {/* Follow button */}
                                            <button
                                                className={`user-search-follow-btn ${u.isFollowing ? 'following' : ''}`}
                                                onClick={() => u.isFollowing ? handleUnfollow(u.id) : handleFollow(u.id)}
                                                disabled={followLoading.has(u.id)}
                                            >
                                                {followLoading.has(u.id) ? (
                                                    <Loader2 size={14} className="user-search-spinner" />
                                                ) : u.isFollowing ? (
                                                    <><UserCheck size={14} /> Following</>
                                                ) : (
                                                    <><UserPlus size={14} /> Follow</>
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Slide in DM screen */}
                        <AnimatePresence>
                            {dmTarget && (
                                <DirectMessageScreen
                                    key={dmTarget.conversationId}
                                    conversationId={dmTarget.conversationId}
                                    otherUser={dmTarget.otherUser}
                                    onClose={() => setDmTarget(null)}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
