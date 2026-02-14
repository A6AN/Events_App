import { Search } from 'lucide-react';
import './ChatScreen.css';

const ONLINE = [
    { id: 1, name: 'Riya', img: 'https://i.pravatar.cc/100?img=5' },
    { id: 2, name: 'Aman', img: 'https://i.pravatar.cc/100?img=12' },
    { id: 3, name: 'Priya', img: 'https://i.pravatar.cc/100?img=32' },
    { id: 4, name: 'Raj', img: 'https://i.pravatar.cc/100?img=8' },
    { id: 5, name: 'Neha', img: 'https://i.pravatar.cc/100?img=25' },
    { id: 6, name: 'Dev', img: 'https://i.pravatar.cc/100?img=15' },
];

const CHATS = [
    { id: 'c1', name: 'Neon Jungle Party 🌴', preview: 'Ananya: Can\'t wait for tonight!', time: '2m', unread: 5, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=100', isGroup: true },
    { id: 'c2', name: 'Riya Patel', preview: 'See you at the party! 🎉', time: '15m', unread: 2, img: 'https://i.pravatar.cc/100?img=5', isGroup: false },
    { id: 'c3', name: 'Sunday Brunch Squad', preview: 'Aman shared a location', time: '1h', unread: 0, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=100', isGroup: true },
    { id: 'c4', name: 'Raj Kumar', preview: 'Bro that event was crazy', time: '3h', unread: 0, img: 'https://i.pravatar.cc/100?img=8', isGroup: false },
    { id: 'c5', name: 'Comedy Night Chat', preview: 'Who\'s going next week?', time: '5h', unread: 12, img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=100', isGroup: true },
    { id: 'c6', name: 'Priya Mehta', preview: 'Thanks for hosting! ❤️', time: '1d', unread: 0, img: 'https://i.pravatar.cc/100?img=32', isGroup: false },
];

export const ChatScreen = () => {
    return (
        <div className="chat-screen">
            <div className="chat-header">
                <h1 className="chat-greeting">Messages</h1>
                <p className="chat-sub">Stay connected with your crew</p>
            </div>

            <div className="chat-search-wrap">
                <Search size={18} color="rgba(255,255,255,0.3)" />
                <input className="chat-search-input" placeholder="Search conversations..." />
            </div>

            {/* Online */}
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
                {CHATS.map(chat => (
                    <div key={chat.id} className="chat-item">
                        <div className="chat-item-avatar-wrap">
                            <img src={chat.img} alt="" className="chat-item-avatar" />
                        </div>
                        <div className="chat-item-body">
                            <div className="chat-item-top">
                                <span className="chat-item-name">{chat.name}</span>
                                <span className="chat-item-time">{chat.time}</span>
                            </div>
                            <p className="chat-item-preview">{chat.preview}</p>
                        </div>
                        {chat.unread > 0 && <span className="chat-unread">{chat.unread}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};
