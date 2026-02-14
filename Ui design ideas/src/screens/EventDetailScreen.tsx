import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Bookmark, MapPin, Clock, Calendar, ShieldCheck, MessageCircle } from 'lucide-react';
import './EventDetailScreen.css';

export const EventDetailScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="event-detail">
            {/* Hero */}
            <div className="event-hero">
                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900" alt="" />
                <div className="event-hero-overlay" />

                <div className="event-hero-actions">
                    <button className="event-hero-btn" onClick={() => navigate(-1)}>
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
                <h1 className="event-title">Neon Jungle Party 🌴</h1>

                <div className="event-meta">
                    <div className="event-meta-row">
                        <Calendar size={16} />
                        <span>Saturday, 15 Feb 2026</span>
                    </div>
                    <div className="event-meta-row">
                        <Clock size={16} />
                        <span>10:00 PM — 3:00 AM</span>
                    </div>
                    <div className="event-meta-row">
                        <MapPin size={16} />
                        <span>Skybar Lounge, Bandra West, Mumbai</span>
                    </div>
                </div>

                {/* Host */}
                <div className="event-host-card">
                    <img src="https://i.pravatar.cc/100?img=47" alt="" className="event-host-avatar" />
                    <div className="event-host-info">
                        <div className="event-host-name">
                            Ananya Sharma <ShieldCheck size={14} className="event-host-badge" />
                        </div>
                        <div className="event-host-rep">⭐ 950 • Event Champion</div>
                    </div>
                    <button className="event-host-follow-btn">Follow</button>
                </div>

                {/* Description */}
                <div className="event-desc-label">About</div>
                <p className="event-desc-text">
                    Get ready for Mumbai's wildest night! Neon Jungle transforms Skybar Lounge into a
                    tropical paradise with UV-reactive art installations, live DJs, and premium cocktails.
                    Dress code: neon everything. Early bird tickets include 2 complimentary drinks.
                </p>

                {/* Attendees */}
                <div className="event-attendees">
                    <div className="event-attendees-title">Going (142)</div>
                    <div className="event-attendees-row">
                        {[11, 12, 13, 14, 15, 16, 17].map(n => (
                            <img key={n} src={`https://i.pravatar.cc/100?img=${n}`} alt="" className="event-attendee-avatar" />
                        ))}
                        <span className="event-attendee-count">+135 others</span>
                    </div>
                </div>
            </div>

            {/* Chat FAB */}
            <button className="event-chat-fab">
                <MessageCircle size={22} />
            </button>

            {/* Sticky Footer */}
            <div className="event-footer">
                <div className="event-footer-inner">
                    <div className="event-price-display">
                        <span className="event-price-label">Price</span>
                        <span className="event-price-amount">₹299</span>
                    </div>
                    <button className="event-book-btn">Book Ticket →</button>
                </div>
            </div>
        </div>
    );
};
