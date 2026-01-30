import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Search, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserChats } from '../../lib/supabase';
import { ChatScreen } from './ChatScreen';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

interface ChatListSheetProps {
    open: boolean;
    onClose: () => void;
}

interface Chat {
    id: string; // chat_id
    eventId: string;
    title: string;
    image: string;
    lastRead: string;
}

export function ChatListSheet({ open, onClose }: ChatListSheetProps) {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    // Load chats when sheet opens
    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            getUserChats(user.id).then((data) => {
                // Map supabase response to Chat interface
                // getUserChats returns chat_members with nested chat -> event
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
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    {/* Full Screen Sheet */}
                    <motion.div
                        className="fixed inset-0 z-50 max-w-lg mx-auto overflow-hidden bg-[#0a0a0f]"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Grain overlay */}
                        <div
                            className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                            }}
                        />

                        <div className="h-full relative z-10 flex flex-col">
                            {/* Header */}
                            <div className="flex-shrink-0 px-4 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/20">
                                        <MessageCircle className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">Messages</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5 text-white/70" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search chats..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                                {loading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                                    </div>
                                ) : filteredChats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                            <MessageCircle className="h-7 w-7 text-white/30" />
                                        </div>
                                        <h3 className="text-white font-medium mb-1">No chats yet</h3>
                                        <p className="text-sm text-white/40 max-w-[200px]">
                                            Join events to start chatting with other attendees!
                                        </p>
                                    </div>
                                ) : (
                                    filteredChats.map((chat) => (
                                        <motion.div
                                            key={chat.id}
                                            onClick={() => setSelectedChat(chat)}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                            <div className="relative h-12 w-12 flex-shrink-0">
                                                <ImageWithFallback
                                                    src={chat.image}
                                                    alt={chat.title}
                                                    className="h-full w-full rounded-xl object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-medium truncate">{chat.title}</h3>
                                                <p className="text-xs text-white/50 truncate">Tap to view messages</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-white/30" />
                                        </motion.div>
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
                </>
            )}
        </AnimatePresence>
    );
}
