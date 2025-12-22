import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

interface CommentSectionProps {
    eventId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const CommentSection = ({ eventId, isOpen, onClose }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Fetch comments
    useEffect(() => {
        if (isOpen && eventId) {
            fetchComments();
        }
    }, [isOpen, eventId]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setLoading(true);
        const { error } = await supabase.from('comments').insert({
            event_id: eventId,
            user_id: user.id,
            content: newComment.trim(),
        });

        if (!error) {
            setNewComment('');
            fetchComments();
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-background/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold text-white">Comments</h3>
                                <span className="text-sm text-white/50">({comments.length})</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/10"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(70vh-140px)]">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 text-white/50">
                                    <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p>No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                comments.map((comment, index) => (
                                    <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-3"
                                    >
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarImage src={comment.profiles?.avatar_url} />
                                            <AvatarFallback className="text-xs bg-primary/20">
                                                {comment.profiles?.full_name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-white">
                                                    {comment.profiles?.full_name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-white/40">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/80">{comment.content}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        {user && (
                            <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-white/10 p-4">
                                <div className="flex gap-3 items-center">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.user_metadata?.avatar_url} />
                                        <AvatarFallback className="text-xs">{user.email?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <Input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-white/5 border-white/10 rounded-full text-white placeholder:text-white/30"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!newComment.trim() || loading}
                                        className="rounded-full bg-primary hover:bg-primary/90"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
