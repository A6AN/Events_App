import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sun, Moon, Map, User, Building2, Plus, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { MapTab } from './components/MapTab';
import { SocialTab } from './components/SocialTab';
import { ProfileTab } from './components/ProfileTab';
import { VenuesTab } from './components/VenuesTab';
import { TicketBookingDialog } from './components/TicketBookingDialog';
import { EventDetailsSheet } from './components/modals/EventDetailsSheet';
import { CreateEventWheel } from './components/modals/CreateEventWheel';
import { CreateEventWizard } from './components/modals/CreateEventWizard';
import { LiquidBackground } from './components/ui/LiquidBackground';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { mockEvents } from './data/mockEvents';
import { mockTickets } from './data/mockTickets';
import { mockVenues } from './data/mockVenues';
import { Event } from './types';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from './lib/supabase';

const tabs = [
  { id: 'feed' as const, icon: Home, label: 'Feed' },
  { id: 'map' as const, icon: Map, label: 'Discover' },
  { id: 'venues' as const, icon: Building2, label: 'Venues' },
  { id: 'profile' as const, icon: User, label: 'Profile' },
];

function AppContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual');
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'venues' | 'profile'>('feed');
  const [ticketBookingOpen, setTicketBookingOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleBookTicket = () => {
    setTicketBookingOpen(true);
    setSheetOpen(false);
  };

  // Helper to convert Event to TicketEvent (mock data mapping)
  const selectedTicket = selectedEvent ? {
    id: selectedEvent.id,
    title: selectedEvent.title,
    date: selectedEvent.startTime,
    time: selectedEvent.startTime,
    venue: selectedEvent.location.name,
    price: selectedEvent.price || 499,
    imageUrl: selectedEvent.imageUrl,
    availableSeats: 45,
    category: 'Concert' as const,
    attendees: selectedEvent.attendees,
    artist: selectedEvent.host.name,
    location: selectedEvent.location // Kept for compatibility if needed
  } : null;

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleCreateEvent = (type: 'casual' | 'ticketed') => {
    setEventType(type);
    setCreateEventOpen(true);
  };

  return (
    <div className="h-screen w-full max-w-lg mx-auto relative flex flex-col overflow-hidden astral-bg grain">
      {/* Theme Toggle Button */}
      <motion.div
        className="absolute top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          className="glass glass-hover rounded-2xl shadow-lg w-10 h-10 btn-press"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-[#FFB800]" />
          ) : (
            <Moon className="h-5 w-5 text-[#7209B7]" />
          )}
        </Button>
      </motion.div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <SocialTab
                events={mockEvents}
                tickets={mockTickets}
                onEventSelect={handleEventSelect}
              />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <MapTab />
            </motion.div>
          )}

          {activeTab === 'venues' && (
            <motion.div
              key="venues"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <VenuesTab venues={mockVenues} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <ProfileTab events={mockEvents} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Glass Pill Navigation */}
      <div className="relative shrink-0 pb-6 pointer-events-none">
        {/* Navigation Bar - Floating Pill */}
        <motion.div
          className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto h-16 rounded-full glass backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 grid grid-cols-4 items-center px-2 pointer-events-auto"
          style={{
            background: 'rgba(10, 10, 15, 0.95)',
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2"
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(247, 37, 133, 0.2) 0%, transparent 70%)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    className="h-5 w-5 transition-colors duration-200"
                    style={{
                      color: isActive ? '#FFFFFF' : '#a0a0a0',
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' : 'none',
                    }}
                  />
                </motion.div>

                {/* Label */}
                <span
                  className="text-[10px] relative z-10 transition-colors duration-200"
                  style={{
                    color: isActive ? '#FFFFFF' : '#a0a0a0',
                  }}
                >
                  {tab.label}
                </span>

                {/* Active Dot Below */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 rounded-full"
                    style={{
                      background: '#FFFFFF',
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Floating Center FAB */}
        <motion.div
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 max-w-lg pointer-events-auto"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.3,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="icon"
            onClick={() => setWheelOpen(true)}
            className="w-14 h-14 rounded-full shadow-[0_8px_24px_rgba(247,37,133,0.4)] border-0 relative overflow-hidden btn-press"
            style={{
              background:
                'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
            }}
          >
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <Plus className="h-6 w-6 text-white relative z-10" />
          </Button>
        </motion.div>
      </div>

      {/* Event Detail Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
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
    console.log('🔗 Setting up deep link listener...');

    const listener = CapApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('🚀 Deep link received:', url);

      if (url.includes('login-callback')) {
        console.log('✅ Login callback detected');
        try {
          await Browser.close().catch(() => {
            console.log('Browser already closed or not open');
          });

          console.log('📋 Full URL:', url);

          let accessToken = null;
          let refreshToken = null;

          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            console.log('📦 Hash found:', hash);
            const params = new URLSearchParams(hash);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
          }

          if (!accessToken) {
            const queryIndex = url.indexOf('?');
            if (queryIndex !== -1) {
              const query = url.substring(queryIndex + 1);
              console.log('📦 Query found:', query);
              const params = new URLSearchParams(query);
              accessToken = params.get('access_token');
              refreshToken = params.get('refresh_token');
            }
          }

          console.log('🔑 Tokens found:', {
            hasAccess: !!accessToken,
            hasRefresh: !!refreshToken
          });

          if (accessToken && refreshToken) {
            console.log('💾 Setting session...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('❌ Set session error:', error);
            } else {
              console.log('✅ Session set successfully!', data);
              const { data: sessionData } = await supabase.auth.getSession();
              console.log('🔄 Refreshed session:', sessionData);
            }
          } else {
            console.warn('⚠️ No tokens found in URL');
          }
        } catch (e) {
          console.error('💥 Deep link error:', e);
        }
      } else {
        console.log('⏭️ Not a login callback, ignoring');
      }
    });

    return () => {
      console.log('🧹 Cleaning up deep link listener');
      listener.then(l => l.remove());
    };
  }, []);

  useEffect(() => {
    const handleWebRedirect = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('🌍 Web redirect detected');
        try {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          console.log('🔑 Web Tokens found:', {
            hasAccess: !!accessToken,
            hasRefresh: !!refreshToken
          });

          if (accessToken && refreshToken) {
            console.log('💾 Setting web session...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('❌ Set web session error:', error);
            } else {
              console.log('✅ Web session set successfully!', data);
              window.history.replaceState(null, '', window.location.pathname);
              await supabase.auth.getSession();
            }
          }
        } catch (e) {
          console.error('💥 Web redirect error:', e);
        }
      }
    };

    handleWebRedirect();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <LiquidBackground />
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
