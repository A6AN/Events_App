import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, MapPin, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { fetchEvents } from '../lib/supabase';
import { Event } from '../types';
import { TorchFilter } from './map/TorchFilter';
import { MoodFilter } from './map/MoodFilter';
import { EventDetailsSheet } from './modals/EventDetailsSheet';
import { CreateEventWizard } from './modals/CreateEventWizard';
import { OlaMaps } from 'olamaps-web-sdk';
import { mockEvents } from '../data/mockEvents';
import '../styles/leaflet-custom.css';

const OLA_MAPS_API_KEY = (import.meta as any).env.VITE_OLA_MAPS_API_KEY;

export const MapTab = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const olaMapsRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [torchMode, setTorchMode] = useState(false);
  const [torchRadius, setTorchRadius] = useState(5); // km
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Events
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      const data = await fetchEvents();
      // Use mock events as fallback if Supabase is empty
      setEvents(data.length > 0 ? data : mockEvents);
      setIsLoadingEvents(false);
    };
    loadEvents();
  }, []);

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
          renderMarkers();

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
    renderMarkers();
  }, [events, selectedMood, torchMode, torchRadius, userLocation]);

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for a location in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-background/80 backdrop-blur-md border-white/20 shadow-lg"
          />
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {(isSearching || searchResults.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching with Ola Maps...
              </div>
            ) : (
              searchResults.map((result) => (
                <Button
                  key={result.place_id}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{result.description}</div>
                      {result.structured_formatting?.secondary_text && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        )}
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

      {/* Bottom Legend */}
      <div className="absolute bottom-24 left-4 right-4 z-[400] pointer-events-none">
        <div className="bg-background/80 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg inline-flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{events.length} events</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="text-[10px] text-muted-foreground">Powered by Ola Maps 🇮🇳</div>
        </div>
      </div>

      {/* Create Event FAB */}
      <div className="absolute bottom-24 right-4 z-[400]">
        <CreateEventWizard />
      </div>

      {/* Event Details Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
      />
    </div>
  );
};


