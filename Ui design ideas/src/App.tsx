import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { NavBar } from './components/NavBar';
import { FeedScreen } from './screens/FeedScreen';
import { MapScreen } from './screens/MapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { EventDetailScreen } from './screens/EventDetailScreen';
import { CreateEventScreen } from './screens/CreateEventScreen';
import { VenuesScreen } from './screens/VenuesScreen';
import { ChatScreen } from './screens/ChatScreen';
import './App.css';

const ChatFab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on event detail, create, and chat screens
  if (location.pathname.startsWith('/event/') || location.pathname === '/create' || location.pathname === '/chat') return null;

  return (
    <button className="app-chat-fab" onClick={() => navigate('/chat')}>
      <MessageCircle size={20} />
      <span className="chat-badge" />
    </button>
  );
};

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<FeedScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/venues" element={<VenuesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/event/:id" element={<EventDetailScreen />} />
          <Route path="/create" element={<CreateEventScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
        </Routes>
        <ChatFab />
        <NavBar />
      </div>
    </Router>
  );
}

export default App;
