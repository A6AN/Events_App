import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getChatsWithLastMessage,
    subscribeToUserChatList,
    ChatWithLastMessage,
} from '../../lib/supabase';
import { ChatScreen } from './ChatScreen';
import '../modals/ModalStyles.css';

interface ChatListSheetProps {
    open: boolean;
    onClose: () => void;
}

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
    const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState<ChatWithLastMessage | null>(null);

    const loadChats = useCallback(async () => {
        if (!user?.id) return;
        const data = await getChatsWithLastMessage(user.id);
        setChats(data);
        setLoading(false);
    }, [user?.id]);

    // Initial load
    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            loadChats();
        }
    }, [open, user?.id, loadChats]);

    // Real-time subscription — re-fetch when a new message arrives in any of the user's chats
    useEffect(() => {
        if (!open || !user?.id || chats.length === 0) return;

        const chatIds = chats.map(c => c.id);
        const channel = subscribeToUserChatList(user.id, chatIds, () => {
            // Refresh the chat list when a new message comes in
            loadChats();
        });

        return () => {
            channel?.unsubscribe();
        };
    }, [open, user?.id, chats.length, loadChats]);

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChatClose = useCallback(() => {
        setSelectedChat(null);
        // Refresh to update last_read_at / unread counts
        loadChats();
    }, [loadChats]);

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
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        <div className="chat-screen">
                            <div className="chat-header">
                                <h1 className="chat-greeting">Messages</h1>
                                <p className="chat-sub">Stay connected with your crew</p>
                            </div>

                            {/* Search */}
                            <div className="chat-search-wrap">
                                <Search size={18} color="rgba(255,255,255,0.3)" />
                                <input
                                    className="chat-search-input"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Chat list */}
                            <div className="chat-section-title">Recent</div>
                            <div className="chat-list">
                                {loading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                        <Loader2 size={24} style={{ animation: 'spin-slow 1s linear infinite', color: 'var(--gold)' }} />
                                    </div>
                                ) : filteredChats.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                            {searchQuery ? 'No matching chats' : 'No chats yet — join events to start chatting!'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredChats.map(chat => (
                                        <div key={chat.id} className="chat-item" onClick={() => setSelectedChat(chat)}>
                                            <div className="chat-item-avatar-wrap">
                                                <img
                                                    src={chat.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=100'}
                                                    alt=""
                                                    className="chat-item-avatar"
                                                />
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

                        {/* Selected Chat Screen */}
                        <AnimatePresence>
                            {selectedChat && (
                                <ChatScreen
                                    key={selectedChat.id}
                                    chatId={selectedChat.id}
                                    eventTitle={selectedChat.title}
                                    eventImage={selectedChat.image}
                                    onClose={handleChatClose}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
