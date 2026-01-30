import { Star, Calendar, MapPin, X, Heart, Check, MessageCircle, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { likeEvent, unlikeEvent, getEventLikeStatus, getComments, addComment, deleteComment } from '../../lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onBook?: () => void;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export function EventDetailsSheet({ event, open, onClose, onBook }: EventDetailsSheetProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch like status and comments when event opens
  useEffect(() => {
    if (event?.id && user?.id && open) {
      // Fetch like status
      getEventLikeStatus(event.id, user.id).then(({ isLiked, count }) => {
        setIsLiked(isLiked);
        setLikeCount(count);
      });

      // Fetch comments
      getComments(event.id).then(setComments);
    }
  }, [event?.id, user?.id, open]);

  if (!event) return null;

  // Format date
  const getFormattedDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return { day, month, weekday };
  };

  const dateInfo = getFormattedDate();

  // Handle like/unlike
  const handleLike = async () => {
    if (!user?.id) return;

    try {
      if (isLiked) {
        await unlikeEvent(event.id, user.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEvent(event.id, user.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(event.id, user.id, newComment.trim());
      if (comment) {
        setComments(prev => [comment as Comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

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

          {/* Full Screen Detail Sheet */}
          <motion.div
            className="fixed inset-0 z-50 max-w-lg mx-auto overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="h-full overflow-y-auto scrollbar-hide bg-background">
              {/* Hero Image Section */}
              <div className="relative h-96">
                <ImageWithFallback
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 grain opacity-30" />

                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                  <motion.button
                    onClick={onClose}
                    className="glass backdrop-blur-2xl w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>

                  <motion.button
                    className="glass backdrop-blur-2xl w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M18 8h3M21 5v6M12 13v9M8 20h8M3 21l6-6M12 13l3 8 3-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>

                {/* Event Title & Price Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
                        {event.title}
                      </h1>
                      <p className="text-white/80 text-sm">
                        {event.mood}: {event.location.name}
                      </p>
                    </div>
                    <motion.div
                      className="bg-white rounded-3xl px-5 py-3 shadow-2xl ml-4 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-black text-xl font-bold">₹{event.price || '499'}</div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-6">
                {/* Date & Time Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-1">
                      <div>
                        <div className="text-3xl font-bold text-foreground">{dateInfo.day}</div>
                        <div className="text-xs text-muted-foreground uppercase">{dateInfo.month}</div>
                      </div>
                      <div className="h-12 w-px bg-border" />
                      <div>
                        <div className="text-lg font-semibold text-foreground">{dateInfo.weekday}</div>
                        <div className="text-sm text-muted-foreground">{event.startTime}</div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="glass backdrop-blur-xl p-3 rounded-2xl border border-white/10"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Calendar className="h-6 w-6 text-foreground" />
                  </motion.div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-foreground text-lg font-semibold mb-3">About this event :</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Join us for {event.title} at {event.location.name}.
                    This is an amazing opportunity to experience live entertainment and connect with fellow enthusiasts.
                    The venue offers excellent atmosphere for all attendees.
                  </p>
                </div>

                {/* Location */}
                <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="glass backdrop-blur-xl w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground text-sm font-medium mb-0.5">
                        {event.location.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {event.location.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-foreground" />
                      <span className="text-foreground font-medium">Comments</span>
                      <span className="text-muted-foreground text-sm">({comments.length})</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showComments ? 180 : 0 }}
                      className="text-muted-foreground"
                    >
                      ▼
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showComments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {/* Add Comment */}
                        {user && (
                          <div className="flex items-center gap-2 mt-4 mb-4">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <motion.button
                              onClick={handleAddComment}
                              disabled={isSubmitting || !newComment.trim()}
                              className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center disabled:opacity-50"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Send className="h-4 w-4 text-white" />
                            </motion.button>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {comments.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">
                              No comments yet. Be the first!
                            </p>
                          ) : (
                            comments.map((comment) => (
                              <div key={comment.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user?.avatar_url} />
                                  <AvatarFallback>{comment.user?.full_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">
                                      {comment.user?.full_name || comment.user?.username || 'Anonymous'}
                                    </span>
                                    {comment.user_id === user?.id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-3 pb-6">
                  <motion.button
                    onClick={handleLike}
                    className="glass backdrop-blur-xl w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-white/10 gap-0.5"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                        }`}
                    />
                    <span className="text-xs text-muted-foreground">{likeCount}</span>
                  </motion.button>

                  <motion.button
                    onClick={onBook}
                    className="flex-1 rounded-2xl text-white font-semibold py-4 shadow-lg relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Get a Ticket</span>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
