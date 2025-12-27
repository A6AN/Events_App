import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Loader2, MapPin, Calendar, Clock,
    Sparkles, ArrowRight, ArrowLeft, Building2,
    PartyPopper, Mic2, Music, Palette, Users,
    CheckCircle2, X, Image as ImageIcon, Upload
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Sheet, SheetContent } from '../ui/sheet';
import { createEvent, uploadEventImage } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { mockVenues } from '../../data/mockVenues';
import { Venue } from '../../types';

const STEPS = {
    VIBE: 0,
    LOCATION: 1,
    DETAILS: 2,
};

const EVENT_TYPES = [
    { id: 'party', label: 'Party', icon: PartyPopper, color: 'bg-pink-500' },
    { id: 'show', label: 'Show', icon: Mic2, color: 'bg-purple-500' },
    { id: 'music', label: 'Concert', icon: Music, color: 'bg-blue-500' },
    { id: 'workshop', label: 'Workshop', icon: Palette, color: 'bg-orange-500' },
    { id: 'meetup', label: 'Meetup', icon: Users, color: 'bg-green-500' },
];

interface CreateEventWizardProps {
    open: boolean;
    onClose: () => void;
    eventType: 'casual' | 'ticketed';
}

export const CreateEventWizard = ({ open, onClose, eventType }: CreateEventWizardProps) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(STEPS.VIBE);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        }
    }, [open]);

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
            window.location.reload();
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
        }}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 bg-background border-t border-border [&>button]:hidden">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {currentStep === STEPS.VIBE && "What's the Vibe?"}
                                {currentStep === STEPS.LOCATION && "Where's it happening?"}
                                {currentStep === STEPS.DETAILS && "Final Details"}
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                {eventType === 'casual' ? 'Casual Event' : 'Ticketed Event'} • Step {currentStep + 1}/3
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "33%" }}
                            animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                    <AnimatePresence mode="wait">
                        {currentStep === STEPS.VIBE && (
                            <motion.div
                                key="vibe"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-muted-foreground">Select event type</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData(prev => ({ ...prev, category: type.label }))}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                formData.category === type.label
                                                    ? "bg-primary/20 border-primary"
                                                    : "bg-card border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                formData.category === type.label ? type.color : "bg-muted"
                                            )}>
                                                <type.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-foreground">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-sm">Mood / Vibe</Label>
                                    <Input
                                        placeholder="e.g. Chill, Energetic, Networking"
                                        value={formData.mood}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                                        className="bg-card border-border h-11"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentStep === STEPS.LOCATION && (
                            <motion.div
                                key="location"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Toggle Type */}
                                <div className="flex p-1 bg-muted rounded-xl">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'custom' }))}
                                        className={cn(
                                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                            formData.locationType === 'custom' 
                                                ? "bg-primary text-primary-foreground" 
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        Custom Location
                                    </button>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'venue' }))}
                                        className={cn(
                                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                            formData.locationType === 'venue' 
                                                ? "bg-primary text-primary-foreground" 
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        Book Venue
                                    </button>
                                </div>

                                {formData.locationType === 'custom' ? (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Location Name</Label>
                                            <Input
                                                placeholder="e.g. My House, Central Park"
                                                value={formData.location_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                                                className="bg-card border-border h-11"
                                            />
                                        </div>
                                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                                            <p className="flex items-center gap-2 text-foreground">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                Location will appear on the map
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                Using current location coordinates
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Select a venue</p>
                                        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                                            {mockVenues.slice(0, 4).map(venue => (
                                                <div
                                                    key={venue.id}
                                                    onClick={() => handleVenueSelect(venue)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all",
                                                        formData.selectedVenueId === venue.id
                                                            ? "bg-primary/10 border-primary"
                                                            : "bg-card border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <img
                                                        src={venue.imageUrl}
                                                        alt={venue.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-foreground text-sm truncate">{venue.name}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{venue.location}</p>
                                                        <p className="text-xs text-primary">₹{venue.pricePerHour}/hr</p>
                                                    </div>
                                                    {formData.selectedVenueId === venue.id && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === STEPS.DETAILS && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Compact Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm">Event Image</Label>
                                    {imagePreview ? (
                                        <div className="relative h-32 rounded-xl overflow-hidden border border-border">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={clearImage}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                                            >
                                                <X className="h-4 w-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-card">
                                            <div className="p-2 rounded-full bg-muted">
                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Upload image</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Event Title</Label>
                                    <Input
                                        placeholder="Give it a catchy name"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-card border-border h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Description</Label>
                                    <Textarea
                                        placeholder="Tell people what to expect..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-card border-border min-h-[80px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="bg-card border-border h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                            className="bg-card border-border h-11"
                                        />
                                    </div>
                                </div>

                                {eventType === 'ticketed' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">Ticket Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                            className="bg-card border-border h-11"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border flex gap-3">
                    {currentStep > STEPS.VIBE && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                            className="flex-1 h-12"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={isLoading || (currentStep === STEPS.VIBE && !formData.category)}
                        className="flex-1 h-12 bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : currentStep === STEPS.DETAILS ? (
                            <>Create Event <Sparkles className="h-4 w-4 ml-2" /></>
                        ) : (
                            <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
