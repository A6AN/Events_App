import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getDMMessages,
    sendDMMessage,
    markDMsAsRead,
    subscribeToDMMessages,
    DMMessage,
} from '../../lib/supabase';
import './DirectMessageScreen.css';

interface DirectMessageScreenProps {
    conversationId: string;
    otherUser: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    };
    onClose: () => void;
}

export function DirectMessageScreen({ conversationId, otherUser, onClose }: DirectMessageScreenProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DMMessage[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const otherName = otherUser.full_name || otherUser.username || 'User';
    const otherAvatar = otherUser.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=D4AF37&color=000&bold=true`;

    // Load messages
    useEffect(() => {
        if (!conversationId) return;
        getDMMessages(conversationId).then(data => {
            setMessages(data);
            setLoading(false);
        });
        if (user?.id) markDMsAsRead(conversationId, user.id);
    }, [conversationId, user?.id]);

    // Real-time subscription
    useEffect(() => {
        if (!conversationId) return;
        const channel = subscribeToDMMessages(conversationId, (msg) => {
            setMessages(prev => {
                // Avoid duplicate if we already added it on send
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            if (user?.id) markDMsAsRead(conversationId, user.id);
        });
        return () => { channel.unsubscribe(); };
    }, [conversationId, user?.id]);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || !user?.id || sending) return;
        setSending(true);
        const optimistic: DMMessage = {
            id: `optimistic-${Date.now()}`,
            conversation_id: conversationId,
            sender_id: user.id,
            content: text.trim(),
            created_at: new Date().toISOString(),
            read_at: null,
        };
        setMessages(prev => [...prev, optimistic]);
        setText('');
        const sent = await sendDMMessage(conversationId, user.id, optimistic.content);
        if (sent) {
            // Replace optimistic with real message
            setMessages(prev => prev.map(m => m.id === optimistic.id ? sent : m));
        }
        setSending(false);
        inputRef.current?.focus();
    };

    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Group messages by date
    const grouped: { date: string; msgs: DMMessage[] }[] = [];
    messages.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
        });
        const last = grouped[grouped.length - 1];
        if (last && last.date === date) last.msgs.push(msg);
        else grouped.push({ date, msgs: [msg] });
    });

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--bg-primary)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Header */}
            <div className="dm-header">
                <button className="dm-back-btn" onClick={onClose}>
                    <ArrowLeft size={20} />
                </button>
                <img src={otherAvatar} alt={otherName} className="dm-header-avatar" />
                <div>
                    <div className="dm-header-name">{otherName}</div>
                    {otherUser.username && (
                        <div className="dm-header-username">@{otherUser.username}</div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="dm-messages">
                {loading ? (
                    <div className="dm-loading">
                        <Loader2 size={24} className="dm-spinner" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="dm-empty">
                        <div className="dm-empty-avatar">
                            <img src={otherAvatar} alt={otherName} />
                        </div>
                        <p className="dm-empty-title">{otherName}</p>
                        <p className="dm-empty-sub">Say hi and start the conversation!</p>
                    </div>
                ) : (
                    grouped.map(({ date, msgs }) => (
                        <div key={date}>
                            <div className="dm-date-divider"><span>{date}</span></div>
                            {msgs.map((msg, idx) => {
                                const isOwn = msg.sender_id === user?.id;
                                const prevSame = idx > 0 && msgs[idx - 1].sender_id === msg.sender_id;
                                return (
                                    <div key={msg.id} className={`dm-bubble-row ${isOwn ? 'own' : 'other'}`}>
                                        {!isOwn && !prevSame && (
                                            <img src={otherAvatar} alt={otherName} className="dm-bubble-avatar" />
                                        )}
                                        {!isOwn && prevSame && <div className="dm-bubble-avatar-spacer" />}
                                        <div className="dm-bubble-wrap">
                                            <div className={`dm-bubble ${isOwn ? 'dm-bubble-own' : 'dm-bubble-other'}`}>
                                                {msg.content}
                                            </div>
                                            <div className={`dm-bubble-time ${isOwn ? 'own' : ''}`}>
                                                {formatTime(msg.created_at)}
                                                {isOwn && msg.read_at && <span className="dm-read-tick"> ✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="dm-input-bar">
                <input
                    ref={inputRef}
                    className="dm-input"
                    type="text"
                    placeholder={`Message ${otherName}...`}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                    className="dm-send-btn"
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                >
                    {sending ? <Loader2 size={18} className="dm-spinner" /> : <Send size={18} />}
                </button>
            </div>
        </motion.div>
    );
}
