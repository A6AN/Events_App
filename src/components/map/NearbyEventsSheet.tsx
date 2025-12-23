import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Clock, Navigation2 } from 'lucide-react';
import { Event } from '../../types';

interface NearbyEventsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    events: Event[];
    userLocation: { lat: number; lng: number } | null;
    onEventClick: (event: Event) => void;
}

const RANGE_OPTIONS = [
    { label: '1 km', value: 1 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
];

// Calculate distance between two points
const getDistance = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export function NearbyEventsSheet({
    isOpen,
    onClose,
    events,
    userLocation,
    onEventClick
}: NearbyEventsSheetProps) {
    const [selectedRange, setSelectedRange] = useState(5);

    const nearbyEvents = useMemo(() => {
        if (!userLocation) return events;

        return events
            .map(event => ({
                ...event,
                distance: getDistance(
                    userLocation.lat, userLocation.lng,
                    event.location.lat, event.location.lng
                )
            }))
            .filter(event => event.distance <= selectedRange)
            .sort((a, b) => a.distance - b.distance);
    }, [events, userLocation, selectedRange]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[501] max-h-[80vh] flex flex-col"
                    >
                        {/* Glass container */}
                        <div className="bg-black/70 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col max-h-[80vh]">
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                                <div className="w-10 h-1 bg-white/30 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-5 pb-4 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Navigation2 className="h-5 w-5 text-cyan-400" />
                                            Nearby Events
                                        </h2>
                                        <p className="text-white/50 text-sm mt-0.5">
                                            {nearbyEvents.length} event{nearbyEvents.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-white/70" />
                                    </button>
                                </div>

                                {/* Range Filter */}
                                <div className="flex gap-2">
                                    {RANGE_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedRange(option.value)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${selectedRange === option.value
                                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Events List */}
                            <div className="flex-1 overflow-y-auto px-5 pb-8">
                                {!userLocation ? (
                                    <div className="text-center py-12 text-white/50">
                                        <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">Location access needed</p>
                                        <p className="text-sm mt-1">Allow location to see nearby events</p>
                                    </div>
                                ) : nearbyEvents.length === 0 ? (
                                    <div className="text-center py-12 text-white/50">
                                        <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">No events in this range</p>
                                        <p className="text-sm mt-1">Try increasing the distance</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {nearbyEvents.map((event, index) => (
                                            <motion.button
                                                key={event.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => {
                                                    onEventClick(event);
                                                    onClose();
                                                }}
                                                className="w-full bg-white/5 hover:bg-white/10 rounded-2xl p-3 flex items-center gap-3 transition-all group text-left"
                                            >
                                                {/* Event Image */}
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {/* Distance badge */}
                                                    {'distance' in event && (
                                                        <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                                            <span className="text-[10px] text-white font-medium">
                                                                {(event.distance as number).toFixed(1)} km
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Event Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-white/50 text-xs mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{event.startTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white/40 text-xs mt-0.5">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate">{event.location.name}</span>
                                                    </div>
                                                </div>

                                                {/* Attendees */}
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center gap-1 text-cyan-400">
                                                        <Users className="h-3 w-3" />
                                                        <span className="text-sm font-medium">{event.attendees}</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/40">going</span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
