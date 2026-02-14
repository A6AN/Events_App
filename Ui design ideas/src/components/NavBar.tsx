import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Plus, Building2, User } from 'lucide-react';
import './NavBar.css';

export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    // Hide navbar on event detail and create screens
    if (location.pathname.startsWith('/event/') || location.pathname === '/create') return null;

    return (
        <div className="navbar-wrapper">
            <nav className="navbar">
                <button className={`nav-btn ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
                    <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
                </button>

                <button className={`nav-btn ${isActive('/map') ? 'active' : ''}`} onClick={() => navigate('/map')}>
                    <Map size={22} strokeWidth={isActive('/map') ? 2.5 : 1.8} />
                </button>

                <div className="nav-create-spacer" />

                <button className={`nav-btn ${isActive('/venues') ? 'active' : ''}`} onClick={() => navigate('/venues')}>
                    <Building2 size={22} strokeWidth={isActive('/venues') ? 2.5 : 1.8} />
                </button>

                <button className={`nav-btn ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 1.8} />
                </button>

                <div className="create-btn-anchor">
                    <button className="create-btn" onClick={() => navigate('/create')}>
                        <Plus size={28} strokeWidth={2.5} />
                    </button>
                </div>
            </nav>
        </div>
    );
};
