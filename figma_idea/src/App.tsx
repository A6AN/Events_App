import { useState } from "react";
import {
  Map,
  User,
  Building2,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./components/ui/button";
import { MapTab } from "./components/MapTab";
import { FeedTab } from "./components/FeedTab";
import { ProfileTab } from "./components/ProfileTab";
import { VenuesTab } from "./components/VenuesTab";
import { EventDetailSheet } from "./components/EventDetailSheet";
import { CreateEventWheel } from "./components/CreateEventWheel";
import { CreateEventSheet } from "./components/CreateEventSheet";
import {
  ThemeProvider,
  useTheme,
} from "./context/ThemeContext";
import { mockEvents } from "./data/mockEvents";
import { mockTickets } from "./data/mockTickets";
import { mockVenues } from "./data/mockVenues";
import { Event } from "./types";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const [activeTab, setActiveTab] = useState<
    "feed" | "map" | "venues" | "profile"
  >("feed");
  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventType, setEventType] = useState<
    "casual" | "ticketed"
  >("casual");
  const { theme, toggleTheme } = useTheme();

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleCreateEvent = (type: "casual" | "ticketed") => {
    setEventType(type);
    setCreateEventOpen(true);
  };

  const tabs = [
    { id: "feed" as const, icon: Home, label: "Feed" },
    { id: "map" as const, icon: Map, label: "Discover" },
    { id: "venues" as const, icon: Building2, label: "Venues" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

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
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-[#FFB800]" />
          ) : (
            <Moon className="h-5 w-5 text-[#7209B7]" />
          )}
        </Button>
      </motion.div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <FeedTab
                events={mockEvents}
                tickets={mockTickets}
                onEventSelect={handleEventSelect}
              />
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <MapTab
                events={mockEvents}
                onEventSelect={handleEventSelect}
              />
            </motion.div>
          )}

          {activeTab === "venues" && (
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

          {activeTab === "profile" && (
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
      <div className="relative shrink-0 pb-6">
        {/* Navigation Bar - Floating Pill */}
        <motion.div
          className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto h-16 rounded-full glass backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] grid grid-cols-4 items-center px-2"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2"
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
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
                        "radial-gradient(circle, rgba(247, 37, 133, 0.2) 0%, transparent 70%)",
                    }}
                    transition={{
                      type: "spring",
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
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 max-w-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
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
                "linear-gradient(135deg, #F72585 0%, #7209B7 100%)",
            }}
          >
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #F72585 0%, #7209B7 100%)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Plus className="h-6 w-6 text-white relative z-10" />
          </Button>
        </motion.div>
      </div>

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