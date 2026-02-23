import { MapPin, Settings, Share2, Star } from 'lucide-react';
import './ProfileScreen.css';

export const ProfileScreen = () => {
    return (
        <div className="profile">
            {/* Hero */}
            <div className="profile-hero">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" alt="" className="profile-hero-img" />
                <div className="profile-hero-overlay" />

                <div className="profile-top-actions">
                    <div className="profile-location" style={{ color: '#fff', fontSize: 13 }}>
                        <MapPin size={14} /> Mumbai
                    </div>
                    <div className="profile-actions-right">
                        <button className="profile-action-btn"><Share2 size={18} /></button>
                        <button className="profile-action-btn"><Settings size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="profile-body">
                <div className="profile-avatar-wrap">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="" className="profile-avatar-img" />
                </div>

                <h1 className="profile-name">Ananya Sharma</h1>
                <div className="profile-location"><MapPin size={13} /> Mumbai, Maharashtra</div>

                <div className="profile-rep">
                    <Star size={16} className="profile-rep-star" fill="currentColor" />
                    <span className="profile-rep-score">950</span>
                    <span className="profile-rep-label">Event Champion</span>
                </div>

                <div className="profile-stats">
                    <div>
                        <div className="profile-stat-num">1.2k</div>
                        <div className="profile-stat-label">Followers</div>
                    </div>
                    <div>
                        <div className="profile-stat-num">450</div>
                        <div className="profile-stat-label">Following</div>
                    </div>
                    <div>
                        <div className="profile-stat-num">47</div>
                        <div className="profile-stat-label">Events</div>
                    </div>
                </div>

                <div className="profile-lang-row">
                    <span className="profile-lang">English</span>
                    <span className="profile-lang">हिंदी</span>
                    <span className="profile-lang">मराठी</span>
                </div>

                <div className="profile-actions">
                    <button className="profile-btn">Edit Profile</button>
                    <button className="profile-btn">Share</button>
                    <button className="profile-btn">Insights</button>
                </div>

                <div className="profile-tabs">
                    <button className="profile-tab active">Hosted</button>
                    <button className="profile-tab">Attended</button>
                    <button className="profile-tab">Saved</button>
                </div>

                <div className="profile-grid">
                    {['photo-1514525253440-b393452e8d03', 'photo-1501281668745-f7f57925c3b4', 'photo-1470225620780-dba8ba36b745', 'photo-1492684223066-81342ee5ff30', 'photo-1504674900247-0877df9cc836', 'photo-1540747913346-19e32dc3e97e'].map(id => (
                        <div key={id} className="profile-grid-item">
                            <img src={`https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=400`} alt="" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
