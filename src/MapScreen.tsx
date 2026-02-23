import { Search, Navigation, Plus, Minus, MapPin } from 'lucide-react';
import './MapScreen.css';

const CLUSTERS = [
    { id: 1, top: '22%', left: '18%', color: 'gold', count: 5, avatar: 'https://i.pravatar.cc/100?img=10' },
    { id: 2, top: '35%', left: '55%', color: 'blue', count: 12, avatar: 'https://i.pravatar.cc/100?img=15' },
    { id: 3, top: '50%', left: '30%', color: 'saffron', count: 8, avatar: 'https://i.pravatar.cc/100?img=20' },
    { id: 4, top: '42%', left: '78%', color: 'gold', count: 3, avatar: 'https://i.pravatar.cc/100?img=25' },
    { id: 5, top: '65%', left: '60%', color: 'blue', count: 15, avatar: 'https://i.pravatar.cc/100?img=30' },
];

const EVENT_PINS = [
    { id: 'e1', top: '28%', left: '40%', label: 'Neon Party', thumb: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=100' },
    { id: 'e2', top: '58%', left: '42%', label: 'Comedy Night', thumb: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=100' },
];

const NEARBY = [
    { id: 'n1', title: 'Neon Jungle', time: '10 PM', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300' },
    { id: 'n2', title: 'Comedy Show', time: '45m', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=300' },
    { id: 'n3', title: 'Sundowner', time: '5 PM', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300' },
    { id: 'n4', title: 'Art Walk', time: '3 PM', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300' },
];

export const MapScreen = () => {
    return (
        <div className="map-screen">
            <div className="map-bg">
                <div className="map-streets" />
            </div>

            {/* Search */}
            <div className="map-search-bar">
                <Search size={18} color="rgba(255,255,255,0.4)" />
                <input className="map-search-input" placeholder="Search events, friends, places..." />
            </div>

            {/* Clusters */}
            {CLUSTERS.map(c => (
                <div key={c.id} className="map-cluster" style={{ top: c.top, left: c.left }}>
                    <div className={`cluster-ring ${c.color}`}>
                        <img src={c.avatar} alt="" className="cluster-avatar" />
                        <span className={`cluster-count ${c.color}`}>{c.count}</span>
                    </div>
                </div>
            ))}

            {/* Event Pins */}
            {EVENT_PINS.map(p => (
                <div key={p.id} className="map-event-pin" style={{ top: p.top, left: p.left }}>
                    <img src={p.thumb} alt="" className="pin-thumb" />
                    <span className="pin-label">{p.label}</span>
                </div>
            ))}

            {/* Controls */}
            <div className="map-controls">
                <button className="map-ctrl-btn"><Plus size={18} /></button>
                <button className="map-ctrl-btn"><Minus size={18} /></button>
                <button className="map-ctrl-btn"><Navigation size={18} /></button>
            </div>

            {/* Bottom Drawer */}
            <div className="map-drawer">
                <div className="drawer-handle" />
                <div className="drawer-title">Nearby Events</div>
                <div className="drawer-scroll">
                    {NEARBY.map(n => (
                        <div key={n.id} className="drawer-card">
                            <img src={n.img} alt="" className="drawer-card-img" />
                            <div className="drawer-card-info">
                                <div className="drawer-card-title">{n.title}</div>
                                <div className="drawer-card-meta"><MapPin size={9} /> {n.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
