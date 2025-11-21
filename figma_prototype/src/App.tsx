import { useState } from 'react';
import { Map, Users, User, Ticket, Building2, Sun, Moon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { MapTab } from './components/MapTab';
import { SocialTab } from './components/SocialTab';
import { ProfileTab } from './components/ProfileTab';
import { TicketsTab } from './components/TicketsTab';
import { VenuesTab } from './components/VenuesTab';
import { EventDetailSheet } from './components/EventDetailSheet';
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
          <TabsContent value="social" className="absolute inset-0 m-0">
            <SocialTab events={mockEvents} onEventSelect={handleEventSelect} />
          </TabsContent>

          <TabsContent value="map" className="absolute inset-0 m-0">
            <MapTab events={mockEvents} onEventSelect={handleEventSelect} />
          </TabsContent>

          <TabsContent value="tickets" className="absolute inset-0 m-0">
            <TicketsTab tickets={mockTickets} />
          </TabsContent>

          <TabsContent value="venues" className="absolute inset-0 m-0">
            <VenuesTab venues={mockVenues} />
          </TabsContent>

          <TabsContent value="profile" className="absolute inset-0 m-0">
            <ProfileTab events={mockEvents} />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <TabsList className="w-full h-20 bg-card/80 backdrop-blur-lg border-t border-border grid grid-cols-5 rounded-none p-2 shrink-0">
          <TabsTrigger 
            value="social" 
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Social</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="map" 
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Map className="h-5 w-5" />
            <span className="text-[10px]">Map</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="tickets" 
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Ticket className="h-5 w-5" />
            <span className="text-[10px]">Tickets</span>
          </TabsTrigger>

          <TabsTrigger 
            value="venues" 
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[10px]">Venues</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="profile" 
            className="flex-col gap-1 text-muted-foreground rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Event Detail Sheet */}
      <EventDetailSheet 
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
