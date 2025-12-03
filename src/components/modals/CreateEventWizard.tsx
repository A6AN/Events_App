import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Loader2, MapPin, Calendar, Clock,
    Sparkles, ArrowRight, ArrowLeft, Building2,
    PartyPopper, Mic2, Music, Palette, Users,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "../../components/ui/dialog";
import { createEvent, uploadEventImage } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ImageUpload } from '../ui/ImageUpload';
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

export const CreateEventWizard = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(STEPS.VIBE);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        locationType: 'custom', // 'custom' | 'venue'
        selectedVenueId: '',
        location_name: '',
        latitude: 28.6139,
        longitude: 77.2090,
        price: 0,
        category: '',
        mood: '',
        capacity: 100
    });

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
            // In a real app, venues would have lat/lng
            latitude: 28.6139,
            longitude: 77.2090,
            capacity: venue.capacity,
            price: venue.pricePerHour * 4 // Estimate 4 hour event
        }));
        handleNext();
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
                price: formData.price,
                capacity: formData.capacity,
                image_url: imageUrl,
                host_id: user.id,
                category: formData.category,
                mood: formData.mood || 'Chill'
            });

            setIsOpen(false);
            resetForm();
            window.location.reload();
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
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
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/20"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-black/90 backdrop-blur-xl border-white/10 p-0 overflow-hidden gap-0">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white">
                            {currentStep === STEPS.VIBE && "What's the Vibe?"}
                            {currentStep === STEPS.LOCATION && "Where's it happening?"}
                            {currentStep === STEPS.DETAILS && "Final Details"}
                        </h2>
                        <span className="text-xs font-medium text-white/40">
                            Step {currentStep + 1} of 3
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "33%" }}
                            animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {currentStep === STEPS.VIBE && (
                            <motion.div
                                key="vibe"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData(prev => ({ ...prev, category: type.label }))}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 group",
                                                formData.category === type.label
                                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-full bg-white/10 group-hover:scale-110 transition-transform",
                                                formData.category === type.label && type.color
                                            )}>
                                                <type.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <span className="font-medium text-white">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label>Mood</Label>
                                    <Input
                                        placeholder="e.g. Chill, Rager, Networking"
                                        value={formData.mood}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                                        className="bg-white/5 border-white/10"
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
                                className="space-y-6"
                            >
                                {/* Toggle Type */}
                                <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'venue' }))}
                                        className={cn(
                                            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                            formData.locationType === 'venue' ? "bg-primary text-white" : "text-white/60 hover:text-white"
                                        )}
                                    >
                                        Book Venue
                                    </button>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'custom' }))}
                                        className={cn(
                                            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                            formData.locationType === 'custom' ? "bg-primary text-white" : "text-white/60 hover:text-white"
                                        )}
                                    >
                                        Custom Location
                                    </button>
                                </div>

                                {formData.locationType === 'venue' ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-white/60">Select a partner venue:</p>
                                        <div className="grid gap-3">
                                            {mockVenues.map(venue => (
                                                <div
                                                    key={venue.id}
                                                    onClick={() => handleVenueSelect(venue)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                                                        formData.selectedVenueId === venue.id
                                                            ? "bg-primary/20 border-primary"
                                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                                    )}
                                                >
                                                    <img
                                                        src={venue.imageUrl}
                                                        alt={venue.name}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white">{venue.name}</h4>
                                                        <p className="text-xs text-white/60 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> {venue.location}
                                                        </p>
                                                        <p className="text-xs text-primary mt-1">
                                                            Capacity: {venue.capacity} • ₹{venue.pricePerHour}/hr
                                                        </p>
                                                    </div>
                                                    {formData.selectedVenueId === venue.id && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Location Name</Label>
                                            <Input
                                                placeholder="e.g. My House, Central Park"
                                                value={formData.location_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                                            <p className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Using default coordinates (New Delhi)
                                            </p>
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
                                <div className="space-y-2">
                                    <Label>Event Image</Label>
                                    <ImageUpload onImageSelected={setImageFile} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Event Title</Label>
                                    <Input
                                        placeholder="Give it a catchy name"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Tell people what to expect..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === STEPS.VIBE || isLoading}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={isLoading || (currentStep === STEPS.VIBE && !formData.category)}
                        className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
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
            </DialogContent>
        </Dialog>
    );
};
