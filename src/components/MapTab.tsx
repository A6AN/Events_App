import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Loader2, ListFilter } from 'lucide-react';
import { Button } from './ui/button';
import { Event } from '../types';
import { TorchFilter } from './map/TorchFilter';
import { MoodFilter } from './map/MoodFilter';
import { PremiumSearchBar } from './map/PremiumSearchBar';
import { NearbyEventsSheet } from './map/NearbyEventsSheet';
import { EventDetailsSheet } from './modals/EventDetailsSheet';
import { CreateEventWizard } from './modals/CreateEventWizard';
import { OlaMaps } from 'olamaps-web-sdk';
import { mockEvents } from '../data/mockEvents';
import '../styles/leaflet-custom.css';


const OLA_MAPS_API_KEY = (import.meta as any).env.VITE_OLA_MAPS_API_KEY;

interface MapTabProps {
  events: Event[];
}

export const MapTab = ({ events }: MapTabProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const olaMapsRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);


  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [torchMode, setTorchMode] = useState(false);
  const [torchRadius, setTorchRadius] = useState(5); // km
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isNearbySheetOpen, setIsNearbySheetOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Events logic removed, using props.


  // Initialize Ola Maps
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      try {
        console.log('Initializing Ola Maps...');
        console.log('API Key present:', !!OLA_MAPS_API_KEY);

        // @ts-ignore
        olaMapsRef.current = new OlaMaps({
          apiKey: OLA_MAPS_API_KEY,
        });

        const myMap = olaMapsRef.current.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json",
          container: mapContainerRef.current,
          center: [80.9462, 26.8467], // Lucknow
          zoom: 12,
        });

        mapInstanceRef.current = myMap;

        // NavigationControl causing issues in prod, disabling for now
        // myMap.addControl(new olaMapsRef.current.NavigationControl(), 'bottom-right');

        // Wait for map to load before adding markers
        myMap.on('load', () => {
          setMapLoaded(true);

          // Tone down landmarks
          try {
            const layers = myMap.getStyle().layers;
            if (layers) {
              layers.forEach((layer: any) => {
                // Target POI, landmark, and label layers
                if (
                  layer.id.includes('poi') ||
                  layer.id.includes('landmark') ||
                  (layer.id.includes('label') && !layer.id.includes('road')) // Avoid dimming road labels too much if not desired
                ) {
                  // Mute text colors
                  if (layer.paint && layer.paint['text-color']) {
                    myMap.setPaintProperty(layer.id, 'text-color', '#888888');
                  }

                  // Mute icon colors if present (some layers use icon-color)
                  if (layer.paint && layer.paint['icon-color']) {
                    myMap.setPaintProperty(layer.id, 'icon-color', '#888888');
                  }

                  // Reduce opacity for a more subtle look
                  if (layer.type === 'symbol') {
                    myMap.setPaintProperty(layer.id, 'text-opacity', 0.7);
                    myMap.setPaintProperty(layer.id, 'icon-opacity', 0.7);
                  }
                }
              });
              console.log('🗺️ Landmark colors toned down');
            }
          } catch (e) {
            console.error('Error styling map layers:', e);
          }
        });

      } catch (error) {
        console.error("Error initializing Ola Maps:", error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          if (mapInstanceRef.current && olaMapsRef.current) {
            // Add or update user marker
            if (userMarkerRef.current) {
              userMarkerRef.current.setLngLat([longitude, latitude]);
            } else {
              const el = document.createElement('div');
              el.className = 'user-location-marker';
              el.style.width = '20px';
              el.style.height = '20px';
              el.style.backgroundColor = '#3b82f6';
              el.style.borderRadius = '50%';
              el.style.border = '3px solid white';
              el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

              userMarkerRef.current = olaMapsRef.current
                .addMarker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(mapInstanceRef.current);
            }

            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Render Event Markers
  const renderMarkers = () => {
    if (!mapInstanceRef.current || !olaMapsRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filteredEvents = events.filter(event => {
      // Mood filter
      if (selectedMood && event.mood !== selectedMood) return false;

      // Torch radius filter
      if (torchMode && userLocation) {
        const R = 6371; // Earth radius in km
        const dLat = (event.location.lat - userLocation.lat) * Math.PI / 180;
        const dLon = (event.location.lng - userLocation.lng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(event.location.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance > torchRadius) return false;
      }

      return true;
    });

    filteredEvents.forEach(event => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.backgroundImage = `url(${event.imageUrl})`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

      // Add pulsing effect if popular
      if (event.attendees > 50) {
        const pulse = document.createElement('div');
        pulse.className = 'absolute -inset-2 rounded-full bg-primary/30 animate-ping -z-10';
        el.appendChild(pulse);
      }

      el.addEventListener('click', () => {
        setSelectedEvent(event);
        setIsEventSheetOpen(true);
      });

      const marker = olaMapsRef.current
        .addMarker({ element: el })
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });
  };

  // Update markers when filters change or events load
  useEffect(() => {
    if (mapLoaded) {
      renderMarkers();
    }
  }, [events, selectedMood, torchMode, torchRadius, userLocation, mapLoaded]);

  // Geocoding search with Ola Maps API
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(searchQuery)}&api_key=${OLA_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.predictions && Array.isArray(data.predictions)) {
          setSearchResults(data.predictions.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Ola Maps search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchResultClick = async (result: any) => {
    try {
      const response = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${result.place_id}&api_key=${OLA_MAPS_API_KEY}`
      );
      const data = await response.json();
      console.log('Place Details Response:', data);

      // Check for different response structures (Google Places style vs others)
      const geometry = data.result?.geometry || data.geometry;
      const location = geometry?.location;

      if (location && mapInstanceRef.current) {
        const lat = typeof location.lat === 'function' ? location.lat() : parseFloat(location.lat);
        const lng = typeof location.lng === 'function' ? location.lng() : parseFloat(location.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('Flying to:', { lat, lng });
          mapInstanceRef.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 2000 // Add smooth animation duration
          });

          // Add a default marker
          olaMapsRef.current
            .addMarker({})
            .setLngLat([lng, lat])
            .addTo(mapInstanceRef.current);
        } else {
          console.error('Invalid coordinates:', location);
        }
      } else {
        console.error('Could not find location in response:', data);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLocateMe = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100vh' }} />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400]">
        <PremiumSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onResultClick={handleSearchResultClick}
          onClear={() => {
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
      </div>


      {/* Filters & Controls */}
      <div className="absolute top-20 left-0 right-0 z-[400] flex flex-col gap-4 pointer-events-none px-4">
        <div className="flex items-center justify-between pointer-events-auto">
          <MoodFilter selectedMood={selectedMood} onSelectMood={setSelectedMood} />

          <Button
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur-md border-white/20 shadow-lg shrink-0 ml-2"
            onClick={handleLocateMe}
          >
            <Navigation className={`h-4 w-4 ${userLocation ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
        </div>

        <div className="pointer-events-auto">
          <TorchFilter
            isActive={torchMode}
            onToggle={() => setTorchMode(!torchMode)}
            radius={torchRadius}
            onRadiusChange={setTorchRadius}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-24 left-4 right-4 z-[400] flex items-center justify-between">
        {/* Legend */}
        <div className="bg-background/80 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{events.length} events</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="text-[10px] text-muted-foreground">🇮🇳 Ola Maps</div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Nearby Events Button */}
          <Button
            onClick={() => setIsNearbySheetOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full px-4 py-2 h-auto shadow-lg shadow-cyan-500/30 border-0"
          >
            <ListFilter className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Nearby</span>
          </Button>


        </div>
      </div>

      {/* Event Details Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
      />

      {/* Nearby Events Sheet */}
      <NearbyEventsSheet
        isOpen={isNearbySheetOpen}
        onClose={() => setIsNearbySheetOpen(false)}
        events={events}
        userLocation={userLocation}
        onEventClick={(event) => {
          setSelectedEvent(event);
          setIsEventSheetOpen(true);
        }}
      />
    </div>
  );
};


