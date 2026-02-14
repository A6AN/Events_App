import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserChats } from '../../lib/supabase';
import { ChatScreen } from './ChatScreen';
import '../modals/ModalStyles.css';

interface ChatListSheetProps {
    open: boolean;
    onClose: () => void;
}

interface Chat {
    id: string;
    eventId: string;
    title: string;
    image: string;
    lastRead: string;
}

// Static online friends for visual richness
const ONLINE = [
    { id: 1, name: 'Riya', img: 'https://i.pravatar.cc/100?img=5' },
    { id: 2, name: 'Aman', img: 'https://i.pravatar.cc/100?img=12' },
    { id: 3, name: 'Priya', img: 'https://i.pravatar.cc/100?img=32' },
    { id: 4, name: 'Raj', img: 'https://i.pravatar.cc/100?img=8' },
    { id: 5, name: 'Neha', img: 'https://i.pravatar.cc/100?img=25' },
    { id: 6, name: 'Dev', img: 'https://i.pravatar.cc/100?img=15' },
];

export function ChatListSheet({ open, onClose }: ChatListSheetProps) {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            getUserChats(user.id).then((data) => {
                const mappedChats = data.map((item: any) => {
                    if (!item.chat || !item.chat.event) return null;
                    return {
                        id: item.chat.id,
                        eventId: item.chat.event_id,
                        title: item.chat.event.title,
                        image: item.chat.event.image_url,
                        lastRead: item.last_read_at
                    };
                }).filter(Boolean) as Chat[];
                setChats(mappedChats);
                setLoading(false);
            });
        }
    }, [open, user?.id]);

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                            {/* Online Now */}
                            <div className="chat-online-section">
                                <div className="chat-section-title">Online Now</div>
                                <div className="chat-online-list">
                                    {ONLINE.map(u => (
                                        <div key={u.id} className="chat-online-item">
                                            <div className="chat-online-avatar-wrap">
                                                <img src={u.img} alt="" className="chat-online-avatar" />
                                                <span className="chat-online-dot" />
                                            </div>
                                            <span className="chat-online-name">{u.name}</span>
                                        </div>
                                    ))}
                                </div>
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
                                                    <span className="chat-item-time">Tap to view</span>
                                                </div>
                                                <p className="chat-item-preview">Event group chat</p>
                                            </div>
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
                                    onClose={() => setSelectedChat(null)}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
