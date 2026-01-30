import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import {
    getChatMessages,
    sendMessage,
    getChatMembers,
    subscribeToChatMessages,
    markChatAsRead
} from '../../lib/supabase';

interface ChatScreenProps {
    chatId: string;
    eventTitle: string;
    eventImage?: string;
    onClose: () => void;
}

interface Message {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    message_type: 'text' | 'image' | 'system';
    user?: {
        full_name: string;
        avatar_url: string;
        username: string;
    };
}

interface Member {
    user_id: string;
    user?: {
        full_name: string;
        avatar_url: string;
        username: string;
    };
}

export function ChatScreen({ chatId, eventTitle, eventImage, onClose }: ChatScreenProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load initial data
    useEffect(() => {
        if (chatId && user?.id) {
            getChatMessages(chatId).then(setMessages);
            getChatMembers(chatId).then(setMembers);
            markChatAsRead(chatId, user.id);
        }
    }, [chatId, user?.id]);

    // Real-time subscription
    useEffect(() => {
        if (!chatId) return;

        const channel = subscribeToChatMessages(chatId, (newMsg: Message) => {
            setMessages(prev => [...prev, newMsg]);
        });

        return () => {
            channel.unsubscribe();
        };
    }, [chatId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user?.id || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(chatId, user.id, newMessage.trim());
            setNewMessage('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages: { [date: string]: Message[] } = {};
    messages.forEach(msg => {
        const date = formatDate(msg.created_at);
        if (!groupedMessages[date]) groupedMessages[date] = [];
        groupedMessages[date].push(msg);
    });

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-white" />
                </button>

                <div className="flex items-center gap-3 flex-1">
                    {eventImage && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                            <img src={eventImage} alt={eventTitle} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{eventTitle}</h3>
                        <p className="text-xs text-white/50">{members.length} members</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <Users className="h-5 w-5 text-white/70" />
                </button>
            </div>

            {/* Members Panel */}
            <AnimatePresence>
                {showMembers && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white/5 border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-white mb-3">Members</h4>
                            <div className="flex flex-wrap gap-2">
                                {members.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5"
                                    >
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={member.user?.avatar_url} />
                                            <AvatarFallback className="text-[10px]">
                                                {member.user?.full_name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-white/70">
                                            {member.user?.full_name || member.user?.username || 'Anonymous'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {Object.keys(groupedMessages).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Send className="h-7 w-7 text-white/30" />
                        </div>
                        <h3 className="text-white font-medium mb-1">No messages yet</h3>
                        <p className="text-sm text-white/40">Be the first to say hi! 👋</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-4">
                                <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/40">
                                    {date}
                                </span>
                            </div>

                            {/* Messages for this date */}
                            {msgs.map((msg, idx) => {
                                const isOwnMessage = msg.user_id === user?.id;
                                const showAvatar = idx === 0 || msgs[idx - 1].user_id !== msg.user_id;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-2 mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isOwnMessage && showAvatar && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={msg.user?.avatar_url} />
                                                <AvatarFallback className="text-xs">
                                                    {msg.user?.full_name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        {!isOwnMessage && !showAvatar && <div className="w-8" />}

                                        <div className={`max-w-[75%] ${isOwnMessage ? 'order-first' : ''}`}>
                                            {!isOwnMessage && showAvatar && (
                                                <p className="text-xs text-white/50 mb-1 ml-1">
                                                    {msg.user?.full_name || msg.user?.username || 'Anonymous'}
                                                </p>
                                            )}
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                                        ? 'bg-emerald-500 text-white rounded-br-sm'
                                                        : 'bg-white/10 text-white rounded-bl-sm'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            <p className={`text-[10px] text-white/30 mt-1 ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                    />
                    <motion.button
                        onClick={handleSend}
                        disabled={isSending || !newMessage.trim()}
                        className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center disabled:opacity-50"
                        whileTap={{ scale: 0.9 }}
                    >
                        <Send className="h-5 w-5 text-white" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
