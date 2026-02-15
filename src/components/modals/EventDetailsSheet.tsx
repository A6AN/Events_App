import { Calendar, Clock, MapPin, ArrowLeft, Share2, Bookmark, Heart, MessageCircle, Send, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '../../types';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { likeEvent, unlikeEvent, getEventLikeStatus, getComments, addComment, deleteComment } from '../../lib/supabase';
import './EventDetailStyles.css';

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
      getEventLikeStatus(event.id, user.id).then(({ isLiked, likeCount }) => {
        setIsLiked(isLiked);
        setLikeCount(likeCount);
      });
      getComments(event.id).then(setComments);
    }
  }, [event?.id, user?.id, open]);

  if (!event) return null;

  // Format date from event
  const getFormattedDate = () => {
    try {
      const d = event.date ? new Date(event.date) : new Date();
      if (isNaN(d.getTime())) return { day: new Date().getDate(), month: 'Upcoming', weekday: '' };
      return {
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'long' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      };
    } catch {
      return { day: new Date().getDate(), month: 'Upcoming', weekday: '' };
    }
  };
  const dateInfo = getFormattedDate();

  const locationName = typeof event.location === 'object' ? event.location.name : (event.location || 'TBD');
  const locationAddr = typeof event.location === 'object' ? event.location.address : '';

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
            className="sheet-overlay"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Full-screen detail sheet */}
          <motion.div
            style={{ position: 'fixed', inset: 0, zIndex: 10000, maxWidth: 430, margin: '0 auto', overflow: 'hidden' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="event-detail" style={{ height: '100%', overflowY: 'auto' }}>
              {/* Hero Image */}
              <div className="event-hero">
                <img
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'}
                  alt={event.title}
                />
                <div className="event-hero-overlay" />

                {/* Action buttons */}
                <div className="event-hero-actions">
                  <button className="event-hero-btn" onClick={onClose}>
                    <ArrowLeft size={20} />
                  </button>
                  <div className="event-hero-right">
                    <button className="event-hero-btn"><Share2 size={18} /></button>
                    <button className="event-hero-btn"><Bookmark size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="event-body">
                <h1 className="event-title-text">{event.title}</h1>

                {/* Meta rows */}
                <div className="event-meta">
                  <div className="event-meta-row">
                    <Calendar size={16} />
                    <span>{dateInfo.weekday}, {dateInfo.month} {dateInfo.day}</span>
                  </div>
                  <div className="event-meta-row">
                    <Clock size={16} />
                    <span>{event.startTime || 'Time TBD'}</span>
                  </div>
                  <div className="event-meta-row">
                    <MapPin size={16} />
                    <span>{locationName}</span>
                  </div>
                </div>

                {/* Host card */}
                <div className="event-host-card">
                  <img
                    src={`https://i.pravatar.cc/100?img=${Math.abs(event.id.charCodeAt(0) % 70)}`}
                    alt="Host"
                    className="event-host-avatar"
                  />
                  <div className="event-host-info">
                    <div className="event-host-name">
                      {event.mood || 'Event Host'}
                      <svg className="event-host-badge" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="event-host-rep">Hosted {Math.floor(Math.random() * 20 + 5)} events</div>
                  </div>
                  <button className="event-host-follow-btn">Follow</button>
                </div>

                {/* Description */}
                <h3 className="event-desc-label">About this event</h3>
                <p className="event-desc-text">
                  Join us for {event.title} at {locationName}.
                  This is an amazing opportunity to experience live entertainment and connect with fellow enthusiasts.
                  The venue offers excellent atmosphere for all attendees.
                </p>

                {/* Location card */}
                <div className="event-location-card">
                  <div className="event-location-icon-wrap">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="event-location-name">{locationName}</div>
                    <div className="event-location-address">{locationAddr || 'View on map'}</div>
                  </div>
                </div>

                {/* Attendees */}
                <div className="event-attendees">
                  <h3 className="event-attendees-title">Who's Going</h3>
                  <div className="event-attendees-row">
                    {[11, 12, 13, 14, 15].map(n => (
                      <img key={n} src={`https://i.pravatar.cc/100?img=${n}`} alt="" className="event-attendee-avatar" />
                    ))}
                    <span className="event-attendee-count">+{event.attendees || Math.floor(Math.random() * 100 + 20)} going</span>
                  </div>
                </div>

                {/* Comments section */}
                <div className="event-comments-block">
                  <button className="event-comments-toggle" onClick={() => setShowComments(!showComments)}>
                    <div className="event-comments-toggle-left">
                      <MessageCircle size={18} />
                      <span>Comments</span>
                      <span className="event-comments-toggle-count">({comments.length})</span>
                    </div>
                    <motion.span animate={{ rotate: showComments ? 180 : 0 }} style={{ color: 'var(--text-muted)', fontSize: 12 }}>▼</motion.span>
                  </button>

                  <AnimatePresence>
                    {showComments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        {/* Add comment */}
                        {user && (
                          <div className="event-comment-input-row">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="event-comment-input"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button
                              onClick={handleAddComment}
                              disabled={isSubmitting || !newComment.trim()}
                              className="event-comment-send-btn"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        )}

                        {/* Comments list */}
                        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                          {comments.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                              No comments yet. Be the first!
                            </p>
                          ) : (
                            comments.map((comment) => (
                              <div key={comment.id} className="event-comment-item">
                                {comment.user?.avatar_url ? (
                                  <img src={comment.user.avatar_url} alt="" className="event-comment-avatar" />
                                ) : (
                                  <div className="event-comment-avatar-fallback">
                                    {comment.user?.full_name?.[0] || 'U'}
                                  </div>
                                )}
                                <div className="event-comment-body">
                                  <div className="event-comment-header">
                                    <span className="event-comment-name">
                                      {comment.user?.full_name || comment.user?.username || 'Anonymous'}
                                    </span>
                                    {comment.user_id === user?.id && (
                                      <button className="event-comment-delete" onClick={() => handleDeleteComment(comment.id)}>
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="event-comment-content">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="event-footer">
                <div className="event-footer-inner">
                  <div className="event-price-display">
                    <span className="event-price-label">Price</span>
                    <span className="event-price-amount">
                      {event.price ? `₹${event.price}` : 'Free'}
                    </span>
                  </div>

                  <button className="event-like-btn" onClick={handleLike}>
                    <Heart size={18} className={isLiked ? 'liked' : ''} />
                    <span className="event-like-count">{likeCount}</span>
                  </button>

                  <button className="event-book-btn" onClick={onBook}>
                    Book Ticket <ArrowRight size={16} style={{ marginLeft: 6 }} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
