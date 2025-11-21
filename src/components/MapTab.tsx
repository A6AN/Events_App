import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Flashlight, MapPin, Navigation, Search, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet-custom.css';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Event, MoodFilter } from '../types';

interface MapTabProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

const moods: MoodFilter[] = ['All', 'Chill', 'Energetic', 'Creative', 'Romantic'];

const moodColors = {
  Chill: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Energetic: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Creative: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Romantic: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  All: 'bg-muted/50 text-foreground border-border hover:bg-muted'
};

// Ola Maps API Key from environment
const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY;

// Component to handle map flying to user location
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export function MapTab({ events, onEventSelect }: MapTabProps) {
  const [selectedMood, setSelectedMood] = useState<MoodFilter>('All');
  const [torchMode, setTorchMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock user location (Delhi center) if geolocation fails or for demo
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Geocoding search with Nominatim (OpenStreetMap)
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
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&format=json&limit=5&` +
          `countrycodes=in&addressdetails=1`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
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
      // Get place details to fetch coordinates
      const response = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${result.place_id}&api_key=${OLA_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.geometry && data.geometry.location && mapRef.current) {
        const map = mapRef.current as any;
        map.flyTo([data.geometry.location.lat, data.geometry.location.lng], 15, {
          duration: 1
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
      const map = mapRef.current as any;
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1
      });
    }
  };

  const filteredEvents = events.filter(event => {
    // Mood Filter
    if (selectedMood !== 'All' && event.mood !== selectedMood) return false;

    // Torch Filter (Radius check)
    if (torchMode && userLocation) {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(event.location.lat - userLocation.lat);
      const dLon = deg2rad(event.location.lng - userLocation.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(userLocation.lat)) * Math.cos(deg2rad(event.location.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km

      return d <= 5; // 5km radius
    }

    return true;
  });

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  // Custom Icon for Events
  const createEventIcon = (mood: string) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="relative">
            <div class="absolute -inset-2 bg-[#FFCB74]/30 rounded-full blur-md animate-pulse"></div>
            <div class="relative w-8 h-8 rounded-full border-2 border-[#FFCB74] bg-[#2F2F2F] flex items-center justify-center shadow-lg">
              <div class="w-2 h-2 bg-[#FFCB74] rounded-full"></div>
            </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
        ref={mapRef as any}
      >
        {/* Map Tiles - Using CartoDB (Ola Maps tiles have CORS issues from localhost) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <LocationMarker />

        {filteredEvents.map(event => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={createEventIcon(event.mood)}
            eventHandlers={{
              click: () => onEventSelect(event),
            }}
          />
        ))}
      </MapContainer>

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for a location in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-card/90 backdrop-blur-xl border-border text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-lg overflow-hidden shadow-lg">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultClick(result)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{result.display_name.split(',')[0]}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {result.display_name.split(',').slice(1).join(',')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && searchQuery.trim().length >= 3 && (
          <div className="mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-lg px-4 py-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Searching...
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="absolute top-20 left-4 right-4 z-[400] bg-gradient-to-b from-background/80 to-transparent backdrop-blur-md rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
            {moods.map((mood) => (
              <Badge
                key={mood}
                variant="outline"
                className={`cursor-pointer px-4 py-2 whitespace-nowrap transition-all ${selectedMood === mood
                  ? moodColors[mood]
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
                  }`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood}
              </Badge>
            ))}
          </div>
          <Button
            size="icon"
            variant="outline"
            className={`shrink-0 transition-all ${torchMode
              ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(255,203,116,0.5)]'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            onClick={() => setTorchMode(!torchMode)}
          >
            <Flashlight className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="shrink-0 bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={handleLocateMe}
            title="Center on my location"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-24 left-4 right-4 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 text-xs z-[400]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-foreground mb-1 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{filteredEvents.length} events found</span>
            </div>
            <div className="text-muted-foreground text-[10px]">Tap on hotspots to view details</div>
          </div>
          {torchMode && (
            <div className="text-primary flex items-center gap-1 text-[10px] animate-pulse">
              <Flashlight className="h-3 w-3" />
              <span className="font-bold">Torch Active (5km)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
