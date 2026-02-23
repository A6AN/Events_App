import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getChatsWithLastMessage,
    subscribeToUserChatList,
    getUserDMConversations,
    ChatWithLastMessage,
    DMConversation,
} from '../../lib/supabase';
import { ChatScreen } from './ChatScreen';
import { DirectMessageScreen } from './DirectMessageScreen';
import '../modals/ModalStyles.css';

interface ChatListSheetProps {
    open: boolean;
    onClose: () => void;
}

type ActiveView =
    | { type: 'group'; chat: ChatWithLastMessage }
    | { type: 'dm'; conv: DMConversation };

function formatRelativeTime(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d`;
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function ChatListSheet({ open, onClose }: ChatListSheetProps) {
    const { user } = useAuth();
    const [listTab, setListTab] = useState<'dms' | 'groups'>('dms');
    const [groupChats, setGroupChats] = useState<ChatWithLastMessage[]>([]);
    const [dmConvs, setDmConvs] = useState<DMConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState<ActiveView | null>(null);

    const loadAll = useCallback(async () => {
        if (!user?.id) return;
        const [groups, dms] = await Promise.all([
            getChatsWithLastMessage(user.id),
            getUserDMConversations(user.id),
        ]);
        setGroupChats(groups);
        setDmConvs(dms);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            loadAll();
        }
    }, [open, user?.id, loadAll]);

    // Real-time: refresh group chats when new message arrives
    useEffect(() => {
        if (!open || !user?.id || groupChats.length === 0) return;
        const chatIds = groupChats.map(c => c.id);
        const channel = subscribeToUserChatList(user.id, chatIds, loadAll);
        return () => { channel?.unsubscribe(); };
    }, [open, user?.id, groupChats.length, loadAll]);

    const handleClose = useCallback(() => {
        setActiveView(null);
        loadAll();
    }, [loadAll]);

    const getAvatar = (u: DMConversation['otherUser']) => {
        if (u.avatar_url) return u.avatar_url;
        const name = u.full_name || u.username || 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000&bold=true`;
    };

    const q = searchQuery.toLowerCase();
    const filteredDMs = dmConvs.filter(c => {
        const name = (c.otherUser.full_name || c.otherUser.username || '').toLowerCase();
        return name.includes(q);
    });
    const filteredGroups = groupChats.filter(c => c.title.toLowerCase().includes(q));

    const totalUnreadDMs = dmConvs.reduce((s, c) => s + c.unreadCount, 0);
    const totalUnreadGroups = groupChats.reduce((s, c) => s + c.unreadCount, 0);

    return (
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        <div className="chat-screen" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div className="chat-header">
                                <h1 className="chat-greeting">Messages</h1>
                                <p className="chat-sub">Stay connected with your crew</p>
                            </div>

                            {/* Tab toggle: DMs vs Group Chats */}
                            <div style={{ display: 'flex', gap: 8, padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
                                <button
                                    className={`feed-tab-btn ${listTab === 'dms' ? 'active' : ''}`}
                                    onClick={() => setListTab('dms')}
                                    style={{ flex: 1, borderRadius: 100, padding: '8px 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: listTab === 'dms' ? 'rgba(255,255,255,0.12)' : 'transparent', color: listTab === 'dms' ? '#fff' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                >
                                    <MessageCircle size={14} />
                                    Direct
                                    {totalUnreadDMs > 0 && <span className="chat-unread" style={{ position: 'static', marginLeft: 4 }}>{totalUnreadDMs}</span>}
                                </button>
                                <button
                                    className={`feed-tab-btn ${listTab === 'groups' ? 'active' : ''}`}
                                    onClick={() => setListTab('groups')}
                                    style={{ flex: 1, borderRadius: 100, padding: '8px 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: listTab === 'groups' ? 'rgba(255,255,255,0.12)' : 'transparent', color: listTab === 'groups' ? '#fff' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                >
                                    <Users size={14} />
                                    Events
                                    {totalUnreadGroups > 0 && <span className="chat-unread" style={{ position: 'static', marginLeft: 4 }}>{totalUnreadGroups}</span>}
                                </button>
                            </div>

                            {/* Search */}
                            <div className="chat-search-wrap" style={{ marginBottom: 12 }}>
                                <Search size={16} color="rgba(255,255,255,0.3)" />
                                <input
                                    className="chat-search-input"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* List */}
                            <div className="chat-list" style={{ flex: 1, overflowY: 'auto' }}>
                                {loading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                        <Loader2 size={22} style={{ animation: 'spin-slow 1s linear infinite', color: 'var(--gold)' }} />
                                    </div>
                                ) : listTab === 'dms' ? (
                                    filteredDMs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                {searchQuery ? 'No matching conversations' : 'No direct messages yet.\nSearch for people to start chatting!'}
                                            </p>
                                        </div>
                                    ) : filteredDMs.map(conv => (
                                        <div key={conv.id} className="chat-item" onClick={() => setActiveView({ type: 'dm', conv })}>
                                            <div className="chat-item-avatar-wrap">
                                                <img src={getAvatar(conv.otherUser)} alt="" className="chat-item-avatar" />
                                            </div>
                                            <div className="chat-item-body">
                                                <div className="chat-item-top">
                                                    <span className="chat-item-name">
                                                        {conv.otherUser.full_name || conv.otherUser.username || 'User'}
                                                    </span>
                                                    <span className="chat-item-time">
                                                        {conv.lastMessage ? formatRelativeTime(conv.lastMessage.createdAt) : ''}
                                                    </span>
                                                </div>
                                                <p className="chat-item-preview">
                                                    {conv.lastMessage
                                                        ? (conv.lastMessage.senderId === user?.id ? 'You: ' : '') + conv.lastMessage.content
                                                        : 'Say hi! 👋'}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="chat-unread">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    filteredGroups.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                {searchQuery ? 'No matching chats' : 'No event chats yet — join events to start chatting!'}
                                            </p>
                                        </div>
                                    ) : filteredGroups.map(chat => (
                                        <div key={chat.id} className="chat-item" onClick={() => setActiveView({ type: 'group', chat })}>
                                            <div className="chat-item-avatar-wrap">
                                                <img src={chat.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=100'} alt="" className="chat-item-avatar" />
                                            </div>
                                            <div className="chat-item-body">
                                                <div className="chat-item-top">
                                                    <span className="chat-item-name">{chat.title}</span>
                                                    <span className="chat-item-time">
                                                        {chat.lastMessage ? formatRelativeTime(chat.lastMessage.createdAt) : ''}
                                                    </span>
                                                </div>
                                                <p className="chat-item-preview">
                                                    {chat.lastMessage
                                                        ? `${chat.lastMessage.senderName}: ${chat.lastMessage.content}`
                                                        : 'No messages yet — say hi! 👋'}
                                                </p>
                                            </div>
                                            {chat.unreadCount > 0 && (
                                                <span className="chat-unread">{chat.unreadCount}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Open DM or Group Chat screen */}
                        <AnimatePresence>
                            {activeView?.type === 'group' && (
                                <ChatScreen
                                    key={activeView.chat.id}
                                    chatId={activeView.chat.id}
                                    eventTitle={activeView.chat.title}
                                    eventImage={activeView.chat.image}
                                    onClose={handleClose}
                                />
                            )}
                            {activeView?.type === 'dm' && (
                                <DirectMessageScreen
                                    key={activeView.conv.id}
                                    conversationId={activeView.conv.id}
                                    otherUser={activeView.conv.otherUser}
                                    onClose={handleClose}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
