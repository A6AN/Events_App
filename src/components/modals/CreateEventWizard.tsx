import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Loader2, MapPin, Calendar, Clock, Search,
    Sparkles, ArrowRight, ArrowLeft, Building2,
    PartyPopper, Mic2, Music, Palette, Users,
    CheckCircle2, X, Upload
} from 'lucide-react';
import { createEvent, uploadEventImage, createVenueBooking } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Venue } from '../../types';
import './ModalStyles.css';

const STEPS = {
    VIBE: 0,
    LOCATION: 1,
    DETAILS: 2,
};

const EVENT_TYPES = [
    { id: 'party', label: 'Party', icon: PartyPopper },
    { id: 'show', label: 'Show', icon: Mic2 },
    { id: 'music', label: 'Concert', icon: Music },
    { id: 'workshop', label: 'Workshop', icon: Palette },
    { id: 'meetup', label: 'Meetup', icon: Users },
];

const OLA_MAPS_API_KEY = (import.meta as any).env.VITE_OLA_MAPS_API_KEY;

interface CreateEventWizardProps {
    open: boolean;
    onClose: () => void;
    eventType: 'casual' | 'ticketed';
    venues: Venue[];
    onEventCreated?: () => void;
}

export const CreateEventWizard: React.FC<CreateEventWizardProps> = ({ open, onClose, eventType, venues, onEventCreated }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(STEPS.VIBE);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Ola Maps search state
    const [locationQuery, setLocationQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        locationType: 'custom',
        selectedVenueId: '',
        location_name: '',
        latitude: 28.6139,
        longitude: 77.2090,
        price: 0,
        category: '',
        mood: '',
        capacity: 100
    });

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setCurrentStep(STEPS.VIBE);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                locationType: 'custom',
                selectedVenueId: '',
                location_name: '',
                latitude: 28.6139,
                longitude: 77.2090,
                price: 0,
                category: '',
                mood: '',
                capacity: 100
            });
            setImageFile(null);
            setImagePreview(null);
            setLocationQuery('');
            setSearchResults([]);
        }
    }, [open]);

    // Ola Maps autocomplete search
    const searchLocation = useCallback(async (query: string) => {
        if (!query || query.length < 3 || !OLA_MAPS_API_KEY) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${OLA_MAPS_API_KEY}`
            );
            const data = await res.json();
            setSearchResults(data.predictions || []);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleLocationQueryChange = (value: string) => {
        setLocationQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => searchLocation(value), 400);
    };

    const handleLocationSelect = async (result: any) => {
        const mainText = result.structured_formatting?.main_text || result.description;
        setFormData(prev => ({ ...prev, location_name: mainText }));
        setLocationQuery(mainText);
        setSearchResults([]);

        // Fetch place details to get lat/lng
        if (result.place_id && OLA_MAPS_API_KEY) {
            try {
                const res = await fetch(
                    `https://api.olamaps.io/places/v1/details?place_id=${result.place_id}&api_key=${OLA_MAPS_API_KEY}`
                );
                const data = await res.json();
                const geo = data.result?.geometry?.location;
                if (geo) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: geo.lat,
                        longitude: geo.lng,
                    }));
                }
            } catch {
                // Keep default coords
            }
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.DETAILS) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > STEPS.VIBE) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleVenueSelect = (venue: Venue) => {
        setFormData(prev => ({
            ...prev,
            locationType: 'venue',
            selectedVenueId: venue.id,
            location_name: venue.name,
            latitude: 28.6139,
            longitude: 77.2090,
            capacity: parseInt(venue.capacity) || 100,
            price: venue.pricePerHour * 4
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadEventImage(imageFile);
            }

            // Create Venue Booking if venue selected
            if (formData.locationType === 'venue' && formData.selectedVenueId) {
                const venue = venues.find(v => v.id === formData.selectedVenueId);
                if (venue) {
                    try {
                        const [hours, minutes] = formData.time.split(':').map(Number);
                        const endDate = new Date();
                        endDate.setHours(hours + 3, minutes);
                        const endTime = endDate.toTimeString().slice(0, 5);

                        await createVenueBooking({
                            venue_id: venue.id,
                            user_id: user.id,
                            booking_date: formData.date,
                            start_time: formData.time,
                            end_time: endTime,
                            total_price: (venue.pricePerHour || 1000) * 3,
                            notes: `Event: ${formData.title}`
                        });
                    } catch (bookingError) {
                        console.error('Failed to book venue, but proceeding with event creation:', bookingError);
                    }
                }
            }

            const eventDate = new Date(`${formData.date}T${formData.time}`);

            await createEvent({
                title: formData.title,
                description: formData.description,
                date: eventDate.toISOString(),
                location_name: formData.location_name,
                latitude: formData.latitude,
                longitude: formData.longitude,
                price: eventType === 'casual' ? 0 : formData.price,
                capacity: formData.capacity,
                image_url: imageUrl,
                host_id: user.id,
                category: formData.category,
                mood: formData.mood || 'Chill'
            });

            onClose();
            onEventCreated?.();
        } catch (error: any) {
            console.error('Error creating event:', error);
            alert(`Failed to create event: ${error.message || JSON.stringify(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const stepTitles = [
        "What's the Vibe?",
        "Where's it happening?",
        "Final Details"
    ];

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content"
                        style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="wizard-header">
                            <div className="wizard-header-top">
                                <div className="wizard-header-left">
                                    <div className="wizard-header-icon">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h2 className="wizard-title">{stepTitles[currentStep]}</h2>
                                        <span className="wizard-subtitle">
                                            {eventType === 'casual' ? '🎉 Casual' : '🎫 Ticketed'} • Step {currentStep + 1}/3
                                        </span>
                                    </div>
                                </div>
                                <button className="wizard-close-btn" onClick={onClose}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="wizard-progress">
                                <div
                                    className="wizard-progress-fill"
                                    style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="wizard-content">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Vibe */}
                                {currentStep === STEPS.VIBE && (
                                    <motion.div
                                        key="vibe"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="wizard-field-gap"
                                    >
                                        <p className="wizard-section-hint">Select event type</p>
                                        <div className="wizard-vibe-grid">
                                            {EVENT_TYPES.map((type) => {
                                                const isSelected = formData.category === type.label;
                                                return (
                                                    <div
                                                        key={type.id}
                                                        className={`wizard-vibe-card ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, category: type.label }))}
                                                    >
                                                        <div className="wizard-vibe-icon">
                                                            <type.icon size={24} />
                                                        </div>
                                                        <span className="wizard-vibe-label">{type.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="create-field">
                                            <label className="create-label">Mood / Vibe</label>
                                            <input
                                                className="create-input"
                                                placeholder="e.g. Chill, Energetic, Networking"
                                                value={formData.mood}
                                                onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Location */}
                                {currentStep === STEPS.LOCATION && (
                                    <motion.div
                                        key="location"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="wizard-field-gap"
                                    >
                                        <div className="wizard-loc-toggle">
                                            <div
                                                className={`wizard-loc-btn ${formData.locationType === 'custom' ? 'selected' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, locationType: 'custom' }))}
                                            >
                                                <div className="wizard-loc-icon"><MapPin size={24} /></div>
                                                <span className="wizard-loc-label">Custom Location</span>
                                            </div>
                                            <div
                                                className={`wizard-loc-btn ${formData.locationType === 'venue' ? 'selected' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, locationType: 'venue' }))}
                                            >
                                                <div className="wizard-loc-icon"><Building2 size={24} /></div>
                                                <span className="wizard-loc-label">Book Venue</span>
                                            </div>
                                        </div>

                                        {formData.locationType === 'custom' ? (
                                            <div className="wizard-field-gap">
                                                <div className="create-field">
                                                    <label className="create-label">Search Location</label>
                                                    <div className="wizard-search-input-wrap">
                                                        <Search size={16} className="wizard-search-icon" />
                                                        <input
                                                            className="create-input"
                                                            placeholder="Search places with Ola Maps..."
                                                            value={locationQuery}
                                                            onChange={(e) => handleLocationQueryChange(e.target.value)}
                                                        />
                                                        {locationQuery && (
                                                            <button className="wizard-search-clear" onClick={() => { setLocationQuery(''); setSearchResults([]); }}>
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Search Results */}
                                                {(isSearching || searchResults.length > 0) && (
                                                    <div className="wizard-search-results">
                                                        {isSearching ? (
                                                            <div className="wizard-search-loading">
                                                                <Loader2 size={16} className="wizard-spin" /> Searching...
                                                            </div>
                                                        ) : (
                                                            searchResults.map((result: any, idx: number) => (
                                                                <div
                                                                    key={result.place_id || idx}
                                                                    className="wizard-search-result-item"
                                                                    onClick={() => handleLocationSelect(result)}
                                                                >
                                                                    <div className="wizard-search-result-icon"><MapPin size={14} /></div>
                                                                    <div className="wizard-search-result-text">
                                                                        <div className="wizard-search-result-main">
                                                                            {result.structured_formatting?.main_text || result.description}
                                                                        </div>
                                                                        {result.structured_formatting?.secondary_text && (
                                                                            <div className="wizard-search-result-sub">
                                                                                {result.structured_formatting.secondary_text}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                        <div className="wizard-search-powered">Powered by Ola Maps 🇮🇳</div>
                                                    </div>
                                                )}

                                                {formData.location_name && !isSearching && searchResults.length === 0 && (
                                                    <div className="wizard-loc-hint">
                                                        <p><MapPin size={16} /> {formData.location_name}</p>
                                                        <p className="wizard-loc-hint-sub">📍 {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="wizard-section-hint">Select a venue</p>
                                                <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                                    {venues.slice(0, 50).map((venue) => (
                                                        <div
                                                            key={venue.id}
                                                            className={`wizard-venue-card ${formData.selectedVenueId === venue.id ? 'selected' : ''}`}
                                                            onClick={() => handleVenueSelect(venue)}
                                                        >
                                                            <img src={venue.imageUrl} alt={venue.name} className="wizard-venue-img" />
                                                            <div className="wizard-venue-info">
                                                                <div className="wizard-venue-name">{venue.name}</div>
                                                                <div className="wizard-venue-location">{venue.location}</div>
                                                                <div className="wizard-venue-price">₹{venue.pricePerHour}/hr</div>
                                                            </div>
                                                            {formData.selectedVenueId === venue.id && (
                                                                <div className="wizard-venue-check">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Step 3: Details */}
                                {currentStep === STEPS.DETAILS && (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="wizard-field-gap"
                                    >
                                        {/* Image Upload */}
                                        <div className="create-field">
                                            <label className="create-label">Event Image</label>
                                            {imagePreview ? (
                                                <div className="wizard-image-preview">
                                                    <img src={imagePreview} alt="Preview" />
                                                    <button className="wizard-image-preview-close" onClick={clearImage}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="wizard-image-upload">
                                                    <div className="wizard-image-upload-icon">
                                                        <Upload size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="wizard-image-upload-text">Upload image</div>
                                                        <div className="wizard-image-upload-sub">PNG, JPG up to 5MB</div>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        <div className="create-field">
                                            <label className="create-label">Event Title</label>
                                            <input
                                                className="create-input"
                                                placeholder="Give it a catchy name"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            />
                                        </div>

                                        <div className="create-field">
                                            <label className="create-label">Description</label>
                                            <textarea
                                                className="create-input"
                                                placeholder="Tell people what to expect..."
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>

                                        <div className="create-row">
                                            <div className="create-field">
                                                <label className="create-label">Date</label>
                                                <input
                                                    type="date"
                                                    className="create-input"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                            <div className="create-field">
                                                <label className="create-label">Time</label>
                                                <input
                                                    type="time"
                                                    className="create-input"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                        </div>

                                        {eventType === 'ticketed' && (
                                            <div className="create-field">
                                                <label className="create-label">Ticket Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="create-input"
                                                    placeholder="0"
                                                    value={formData.price || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="wizard-footer">
                            {currentStep > STEPS.VIBE && (
                                <button className="wizard-back-btn" onClick={handleBack} disabled={isLoading}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                            )}
                            <button
                                className="wizard-next-btn"
                                onClick={handleNext}
                                disabled={isLoading || (currentStep === STEPS.VIBE && !formData.category)}
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : currentStep === STEPS.DETAILS ? (
                                    <>Create Event <Sparkles size={18} /></>
                                ) : (
                                    <>Next <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('app-container') || document.body
    );
};
