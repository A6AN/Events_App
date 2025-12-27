import { useState } from 'react';
import { Map, User, Building2, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { MapTab } from './components/MapTab';
import { FeedTab } from './components/FeedTab';
import { ProfileTab } from './components/ProfileTab';
import { VenuesTab } from './components/VenuesTab';
import { EventDetailSheet } from './components/EventDetailSheet';
import { CreateEventWheel } from './components/CreateEventWheel';
import { CreateEventSheet } from './components/CreateEventSheet';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { mockEvents } from './data/mockEvents';
import { mockTickets } from './data/mockTickets';
import { mockVenues } from './data/mockVenues';
import { Event } from './types';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual');
  const { theme, toggleTheme } = useTheme();

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
    <div className="h-screen w-full max-w-lg mx-auto bg-background flex flex-col overflow-hidden relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          className="bg-card/80 backdrop-blur-xl border border-border/50 hover:bg-card rounded-2xl shadow-lg"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-primary" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>

      <Tabs defaultValue="feed" className="flex-1 flex flex-col h-full">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="feed" className="absolute inset-0 m-0">
            <FeedTab 
              events={mockEvents} 
              tickets={mockTickets}
              onEventSelect={handleEventSelect} 
            />
          </TabsContent>

          <TabsContent value="map" className="absolute inset-0 m-0">
            <MapTab events={mockEvents} onEventSelect={handleEventSelect} />
          </TabsContent>

          <TabsContent value="venues" className="absolute inset-0 m-0">
            <VenuesTab venues={mockVenues} />
          </TabsContent>

          <TabsContent value="profile" className="absolute inset-0 m-0">
            <ProfileTab events={mockEvents} />
          </TabsContent>
        </div>

        {/* Modern Bottom Navigation */}
        <div className="relative shrink-0">
          {/* Navigation Bar */}
          <TabsList className="w-full h-20 bg-card/90 backdrop-blur-2xl border-t border-border/50 grid grid-cols-4 rounded-none p-0">
            {/* Feed Tab */}
            <TabsTrigger 
              value="feed" 
              className="flex-col gap-1.5 text-muted-foreground rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all relative group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-data-[state=active]:scale-100 transition-transform blur-xl" />
                <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl group-data-[state=active]:bg-primary/10 transition-all">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px]">Feed</span>
            </TabsTrigger>
            
            {/* Map Tab */}
            <TabsTrigger 
              value="map" 
              className="flex-col gap-1.5 text-muted-foreground rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all relative group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-data-[state=active]:scale-100 transition-transform blur-xl" />
                <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl group-data-[state=active]:bg-primary/10 transition-all">
                  <Map className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px]">Discover</span>
            </TabsTrigger>

            {/* Venues Tab */}
            <TabsTrigger 
              value="venues" 
              className="flex-col gap-1.5 text-muted-foreground rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all relative group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-data-[state=active]:scale-100 transition-transform blur-xl" />
                <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl group-data-[state=active]:bg-primary/10 transition-all">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px]">Venues</span>
            </TabsTrigger>
            
            {/* Profile Tab */}
            <TabsTrigger 
              value="profile" 
              className="flex-col gap-1.5 text-muted-foreground rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all relative group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-data-[state=active]:scale-100 transition-transform blur-xl" />
                <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl group-data-[state=active]:bg-primary/10 transition-all">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px]">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Floating Plus Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <Button
              size="icon"
              onClick={() => setWheelOpen(true)}
              className="w-16 h-16 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/50 pointer-events-auto hover:scale-110 transition-all border-4 border-background"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </Tabs>

      {/* Event Detail Sheet */}
      <EventDetailSheet 
        event={selectedEvent} 
        open={sheetOpen} 
        onClose={handleCloseSheet} 
      />

      {/* Create Event Wheel */}
      <CreateEventWheel
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
        onSelectType={handleCreateEvent}
      />

      {/* Create Event Sheet */}
      <CreateEventSheet
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        eventType={eventType}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}