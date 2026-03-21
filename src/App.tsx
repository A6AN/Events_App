import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { SocialTab } from './components/SocialTab'
import { MapTab } from './components/MapTab'
import { ExploreTab } from './components/ExploreTab'
import { TicketsTab } from './components/TicketsTab'
import { ProfileTab } from './components/ProfileTab'
import { BottomNav } from './components/BottomNav'
import { EventDetailsSheet } from './components/modals/EventDetailsSheet'
import { TicketBookingDialog } from './components/TicketBookingDialog'
import { CreateEventWheel } from './components/modals/CreateEventWheel'
import { CreateEventWizard } from './components/modals/CreateEventWizard'
import { ChatListSheet } from './components/modals/ChatListSheet'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { OnboardingWizard } from './pages/OnboardingWizard'
import { usePublishedEvents, useVenues } from './hooks/useEvents'
import { useMyTickets } from './hooks/useTickets'
import type { EventWithMeta, DbEvent, DbTicketType } from './types'
import './App.css'

type Tab = 'feed' | 'explore' | 'map' | 'tickets' | 'profile'

function AppContent() {
  const [selectedEvent, setSelectedEvent] = useState<EventWithMeta | null>(null)
  const [selectedTicketType, setSelectedTicketType] = useState<DbTicketType | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [chatListOpen, setChatListOpen] = useState(false)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual')
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [ticketBookingOpen, setTicketBookingOpen] = useState(false)

  const { profile } = useAuth()

  // All data via centralised hooks — no manual useQuery in App
  const { data: events = [] } = usePublishedEvents(profile?.city)
  const { data: venues = [] } = useVenues(profile?.city)
  const { data: tickets = [] } = useMyTickets()

  const handleEventSelect = (event: EventWithMeta) => {
    setSelectedEvent(event)
    setSheetOpen(true)
  }

  const handleBookTicket = (ticketType?: DbTicketType) => {
    setSelectedTicketType(ticketType ?? null)
    setTicketBookingOpen(true)
    setSheetOpen(false)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setTimeout(() => setSelectedEvent(null), 300)
  }

  const handleCreateEvent = (type: 'casual' | 'ticketed') => {
    setEventType(type)
    setCreateEventOpen(true)
  }

  return (
    <div
      className="app-shell"
      style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', position: 'relative' }}
    >
      {/* Chat FAB */}
      <button className="app-chat-fab" onClick={() => setChatListOpen(true)}>
        <MessageCircle size={20} />
        <span className="chat-badge" />
      </button>

      <div style={{ height: '100%', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <div key="feed">
              <SocialTab
                events={events}
                tickets={tickets}
                onEventSelect={handleEventSelect}
              />
            </div>
          )}
          {activeTab === 'explore' && (
            <div key="explore" style={{ height: '100vh' }}>
              <ExploreTab
                events={events}
                venues={venues}
                onEventSelect={handleEventSelect}
              />
            </div>
          )}
          {activeTab === 'map' && (
            <div key="map" style={{ height: '100vh' }}>
              <MapTab events={events} />
            </div>
          )}
          {activeTab === 'tickets' && (
            <div key="tickets" style={{ height: '100vh' }}>
              <TicketsTab tickets={tickets} />
            </div>
          )}
          {activeTab === 'profile' && (
            <div key="profile">
              <ProfileTab />
            </div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        onPlusClick={() => setWheelOpen(true)}
      />

      <EventDetailsSheet
        event={selectedEvent}
        open={sheetOpen}
        onClose={handleCloseSheet}
        onBook={handleBookTicket}
      />

      <TicketBookingDialog
        event={selectedEvent}
        ticketType={selectedTicketType}
        open={ticketBookingOpen}
        onClose={() => setTicketBookingOpen(false)}
      />

      <CreateEventWheel
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
        onSelectType={handleCreateEvent}
      />

      <CreateEventWizard
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        eventType={eventType}
        venues={venues}
        onEventCreated={() => setCreateEventOpen(false)}
      />

      <ChatListSheet
        open={chatListOpen}
        onClose={() => setChatListOpen(false)}
      />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, onboardingRequired } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // New users get redirected to onboarding before seeing the app
  if (onboardingRequired) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Onboarding route — accessible when logged in but not yet onboarded */}
          <Route path="/onboarding" element={<OnboardingGuard />} />
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
  )
}

// Prevents already-onboarded users from accessing /onboarding directly
function OnboardingGuard() {
  const { user, loading, onboardingRequired } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!onboardingRequired) return <Navigate to="/" replace />

  return <OnboardingWizard />
}
