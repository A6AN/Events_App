import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Map, User, Building2, Plus, Home, MessageCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { SocialTab } from './components/SocialTab';
import { MapTab } from './components/MapTab';
import { VenuesTab } from './components/VenuesTab';
import { ProfileTab } from './components/ProfileTab';
import { EventDetailsSheet } from './components/modals/EventDetailsSheet';
import { TicketBookingDialog } from './components/TicketBookingDialog';
import { CreateEventWheel } from './components/modals/CreateEventWheel';
import { CreateEventWizard } from './components/modals/CreateEventWizard';
import { ChatListSheet } from './components/modals/ChatListSheet';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { mockEvents } from './data/mockEvents';
import { Event, Venue } from './types';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase, fetchVenues, getEvents, mapDbEventToEvent, mapDbVenueToVenue } from './lib/supabase';
import './App.css';

type Tab = 'feed' | 'map' | 'venues' | 'profile';

function AppContent() {
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual');
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'venues' | 'profile'>('feed');
  const [ticketBookingOpen, setTicketBookingOpen] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Fetch venues from Supabase
  useEffect(() => {
    const loadData = async () => {
      setVenuesLoading(true);
      const [venuesData, eventsData] = await Promise.all([
        fetchVenues(),
        getEvents()
      ]);
      setVenues((venuesData as any[]).map(mapDbVenueToVenue));
      const fetchedEvents = (eventsData as any[]).map(mapDbEventToEvent);
      setEvents(fetchedEvents.length > 0 ? fetchedEvents : mockEvents);
      setVenuesLoading(false);
    };
    loadData();
  }, []);

  const handleBookTicket = () => {
    setTicketBookingOpen(true);
    setSheetOpen(false);
  };



  const handleEventSelect = (event: Event) => {
    setSelectedTicket(event); // Changed to setSelectedTicket
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedTicket(null), 300); // Changed to setSelectedTicket
  };

  const handleCreateEvent = (type: 'casual' | 'ticketed') => {
    setEventType(type);
    setCreateEventOpen(true);
  };

  return (
    <div className="app-shell" style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      {/* Chat FAB — top right */}
      <button className="app-chat-fab" onClick={() => setChatListOpen(true)}>
        <MessageCircle size={20} />
        <span className="chat-badge" />
      </button>

      {/* Tab Content */}
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <div key="feed">
              <SocialTab
                events={events}
                tickets={[]}
                onEventSelect={handleEventSelect}
              />
            </div>
          )}
          {activeTab === 'map' && (
            <div key="map" style={{ height: '100vh' }}>
              <MapTab events={events} />
            </div>
          )}
          {activeTab === 'venues' && (
            <div key="venues">
              <VenuesTab venues={venues} />
            </div>
          )}
          {activeTab === 'profile' && (
            <div key="profile">
              <ProfileTab />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navbar */}
      <div className="navbar-wrapper">
        <nav className="navbar">
          <button className={`nav - btn ${activeTab === 'feed' ? 'active' : ''} `} onClick={() => setActiveTab('feed')}>
            <Home size={22} />
          </button>
          <button className={`nav - btn ${activeTab === 'map' ? 'active' : ''} `} onClick={() => setActiveTab('map')}>
            <Map size={22} />
          </button>

          {/* Create Button Anchor */}
          <div className="nav-create-spacer">
            <div className="create-btn-anchor">
              <button className="create-btn" onClick={() => setWheelOpen(true)}>
                <Plus size={26} style={{ position: 'relative', zIndex: 2 }} />
              </button>
            </div>
          </div>

          <button className={`nav - btn ${activeTab === 'venues' ? 'active' : ''} `} onClick={() => setActiveTab('venues')}>
            <Building2 size={22} />
          </button>
          <button className={`nav - btn ${activeTab === 'profile' ? 'active' : ''} `} onClick={() => setActiveTab('profile')}>
            <User size={22} />
          </button>
        </nav>
      </div>

      {/* Event Detail Sheet */}
      <EventDetailsSheet
        event={selectedTicket} // Changed to selectedTicket
        open={sheetOpen}
        onClose={handleCloseSheet}
        onBook={handleBookTicket}
      />

      {/* Ticket Booking Dialog */}
      <TicketBookingDialog
        ticket={selectedTicket}
        open={ticketBookingOpen}
        onClose={() => setTicketBookingOpen(false)}
      />

      {/* Create Event Wheel */}
      <CreateEventWheel
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
        onSelectType={handleCreateEvent}
      />

      {/* Create Event Wizard - opens after wheel selection */}
      <CreateEventWizard
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        eventType={eventType}
        venues={venues}
      />

      <ChatListSheet
        open={chatListOpen}
        onClose={() => setChatListOpen(false)}
      />
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    const listener = CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('login-callback')) {
        try {
          await Browser.close().catch(() => { });

          let accessToken = null;
          let refreshToken = null;

          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
          }

          if (!accessToken) {
            const queryIndex = url.indexOf('?');
            if (queryIndex !== -1) {
              const query = url.substring(queryIndex + 1);
              const params = new URLSearchParams(query);
              accessToken = params.get('access_token');
              refreshToken = params.get('refresh_token');
            }
          }

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              // Handle error silently or with minimal logging if critical
            } else {
              await supabase.auth.getSession();
            }
          }
        } catch (e) {
          // Handle error
        }
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  useEffect(() => {
    const handleWebRedirect = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        try {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              window.history.replaceState(null, '', window.location.pathname);
              await supabase.auth.getSession();
            }
          }
        } catch (e) {
          // Handle error
        }
      }
    };

    handleWebRedirect();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
