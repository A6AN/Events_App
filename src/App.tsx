import { useState } from 'react';
import { Map, Users, User, Ticket, Building2, Sun, Moon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { MapTab } from './components/MapTab';
import { SocialTab } from './components/SocialTab';
import { ProfileTab } from './components/ProfileTab';
import { TicketsTab } from './components/TicketsTab';
import { VenuesTab } from './components/VenuesTab';
import { EventDetailsSheet } from './components/modals/EventDetailsSheet';
import { PageTransition } from './components/ui/PageTransition';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { mockEvents } from './data/mockEvents';
import { mockTickets } from './data/mockTickets';
import { mockVenues } from './data/mockVenues';
import { Event } from './types';

function AppContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  return (
    <div className="h-screen w-full max-w-lg mx-auto bg-background flex flex-col overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={toggleTheme}
          className="bg-card border-border hover:bg-accent"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-primary" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>

      <Tabs defaultValue="map" className="flex-1 flex flex-col h-full">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <TabsContent value="social" className="absolute inset-0 m-0">
              <PageTransition className="h-full">
                <SocialTab events={mockEvents} onEventSelect={handleEventSelect} />
              </PageTransition>
            </TabsContent>

            <TabsContent value="map" className="absolute inset-0 m-0">
              <PageTransition className="h-full">
                <MapTab />
              </PageTransition>
            </TabsContent>

            <TabsContent value="tickets" className="absolute inset-0 m-0">
              <PageTransition className="h-full">
                <TicketsTab tickets={mockTickets} />
              </PageTransition>
            </TabsContent>

            <TabsContent value="venues" className="absolute inset-0 m-0">
              <PageTransition className="h-full">
                <VenuesTab venues={mockVenues} />
              </PageTransition>
            </TabsContent>

            <TabsContent value="profile" className="absolute inset-0 m-0">
              <PageTransition className="h-full">
                <ProfileTab events={mockEvents} />
              </PageTransition>
            </TabsContent>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <TabsList className="w-full h-20 bg-background/60 backdrop-blur-2xl border-t border-white/10 grid grid-cols-5 rounded-none p-2 shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
          <TabsTrigger
            value="social"
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(120,119,198,0.5)] transition-all duration-300"
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">Social</span>
          </TabsTrigger>

          <TabsTrigger
            value="map"
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(120,119,198,0.5)] transition-all duration-300"
          >
            <Map className="h-5 w-5" />
            <span className="text-[10px] font-medium">Map</span>
          </TabsTrigger>

          <TabsTrigger
            value="tickets"
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(120,119,198,0.5)] transition-all duration-300"
          >
            <Ticket className="h-5 w-5" />
            <span className="text-[10px] font-medium">Tickets</span>
          </TabsTrigger>

          <TabsTrigger
            value="venues"
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(120,119,198,0.5)] transition-all duration-300"
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Venues</span>
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(120,119,198,0.5)] transition-all duration-300"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Event Detail Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        open={sheetOpen}
        onClose={handleCloseSheet}
      />
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
