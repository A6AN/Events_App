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
    { id: 'party', label: 'Party', icon: PartyPopper, color: 'bg-pink-500', selectedBg: 'bg-pink-500/20', selectedBorder: 'border-pink-500' },
    { id: 'show', label: 'Show', icon: Mic2, color: 'bg-purple-500', selectedBg: 'bg-purple-500/20', selectedBorder: 'border-purple-500' },
    { id: 'music', label: 'Concert', icon: Music, color: 'bg-blue-500', selectedBg: 'bg-blue-500/20', selectedBorder: 'border-blue-500' },
    { id: 'workshop', label: 'Workshop', icon: Palette, color: 'bg-orange-500', selectedBg: 'bg-orange-500/20', selectedBorder: 'border-orange-500' },
    { id: 'meetup', label: 'Meetup', icon: Users, color: 'bg-green-500', selectedBg: 'bg-green-500/20', selectedBorder: 'border-green-500' },
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
            <SheetContent
                side="bottom"
                className={cn(
                    "h-[90vh] rounded-t-3xl p-0 bg-zinc-950 border-t-0 [&>button]:hidden flex flex-col",
                    eventType === 'casual'
                        ? 'shadow-[0_-4px_60px_rgba(52,211,153,0.3)] border-2 border-emerald-500/50'
                        : 'shadow-[0_-4px_60px_rgba(139,92,246,0.3)] border-2 border-violet-500/50'
                )}
            >
                {/* Header - Fixed at top */}
                <div className={cn(
                    "flex-shrink-0 bg-zinc-950 px-5 py-4 border-b",
                    eventType === 'casual' ? 'border-emerald-500/30' : 'border-violet-500/30'
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${eventType === 'casual' ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
                                {eventType === 'casual' ? (
                                    <Sparkles className={`h-5 w-5 ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`} />
                                ) : (
                                    <Plus className="h-5 w-5 text-violet-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {currentStep === STEPS.VIBE && "What's the Vibe?"}
                                    {currentStep === STEPS.LOCATION && "Where's it happening?"}
                                    {currentStep === STEPS.DETAILS && "Final Details"}
                                </h2>
                                <span className={`text-xs font-medium ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`}>
                                    {eventType === 'casual' ? '🎉 Casual Event' : '🎫 Ticketed Event'} • Step {currentStep + 1}/3
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="h-5 w-5 text-white/60" />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${eventType === 'casual' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                            initial={{ width: "33%" }}
                            animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                            transition={{ type: "spring", damping: 20 }}
                        />
                    </div>
                </div>

                {/* Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    <AnimatePresence mode="wait">
                        {currentStep === STEPS.VIBE && (
                            <motion.div
                                key="vibe"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <p className="text-sm text-white/50">Select event type</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {EVENT_TYPES.map((type, index) => {
                                        const isSelected = formData.category === type.label;
                                        // Explicit class mappings for Tailwind JIT
                                        const getSelectedStyles = () => {
                                            switch (type.id) {
                                                case 'party': return 'bg-pink-500/20 border-pink-500 shadow-pink-500/30';
                                                case 'show': return 'bg-purple-500/20 border-purple-500 shadow-purple-500/30';
                                                case 'music': return 'bg-blue-500/20 border-blue-500 shadow-blue-500/30';
                                                case 'workshop': return 'bg-orange-500/20 border-orange-500 shadow-orange-500/30';
                                                case 'meetup': return 'bg-green-500/20 border-green-500 shadow-green-500/30';
                                                default: return 'bg-white/10 border-white/30';
                                            }
                                        };
                                        return (
                                            <motion.button
                                                key={type.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
                                                whileTap={{ scale: 0.92 }}
                                                whileHover={{ scale: 1.05, y: -4 }}
                                                onClick={() => setFormData(prev => ({ ...prev, category: type.label }))}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 backdrop-blur-sm",
                                                    isSelected
                                                        ? `${getSelectedStyles()} shadow-lg`
                                                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                                                )}
                                            >
                                                <motion.div
                                                    animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                                                    transition={{ duration: 0.4 }}
                                                    className={cn(
                                                        "p-3 rounded-xl transition-all",
                                                        isSelected
                                                            ? (type.id === 'party' ? 'bg-pink-500'
                                                                : type.id === 'show' ? 'bg-purple-500'
                                                                    : type.id === 'music' ? 'bg-blue-500'
                                                                        : type.id === 'workshop' ? 'bg-orange-500'
                                                                            : type.id === 'meetup' ? 'bg-green-500'
                                                                                : 'bg-white/20')
                                                            : "bg-white/10"
                                                    )}>
                                                    <type.icon className="h-6 w-6 text-white" />
                                                </motion.div>
                                                <span className={cn(
                                                    "text-xs font-medium transition-all",
                                                    isSelected ? "text-white" : "text-white/70"
                                                )}>{type.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 pt-3">
                                    <Label className="text-sm text-white/70">Mood / Vibe</Label>
                                    <Input
                                        placeholder="e.g. Chill, Energetic, Networking"
                                        value={formData.mood}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
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
                                className="space-y-5"
                            >
                                {/* Toggle Type - Redesigned */}
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'custom' }))}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 backdrop-blur-sm",
                                            formData.locationType === 'custom'
                                                ? eventType === 'casual'
                                                    ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                    : 'bg-violet-500/20 border-violet-500 shadow-lg shadow-violet-500/20'
                                                : "bg-white/5 border-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-xl",
                                            formData.locationType === 'custom'
                                                ? eventType === 'casual' ? 'bg-emerald-500' : 'bg-violet-500'
                                                : 'bg-white/10'
                                        )}>
                                            <MapPin className="h-6 w-6 text-white" />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            formData.locationType === 'custom' ? 'text-white' : 'text-white/60'
                                        )}>Custom Location</span>
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setFormData(prev => ({ ...prev, locationType: 'venue' }))}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 backdrop-blur-sm",
                                            formData.locationType === 'venue'
                                                ? eventType === 'casual'
                                                    ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                    : 'bg-violet-500/20 border-violet-500 shadow-lg shadow-violet-500/20'
                                                : "bg-white/5 border-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-xl",
                                            formData.locationType === 'venue'
                                                ? eventType === 'casual' ? 'bg-emerald-500' : 'bg-violet-500'
                                                : 'bg-white/10'
                                        )}>
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            formData.locationType === 'venue' ? 'text-white' : 'text-white/60'
                                        )}>Book Venue</span>
                                    </motion.button>
                                </div>

                                {formData.locationType === 'custom' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white/70">Location Name</Label>
                                            <Input
                                                placeholder="e.g. My House, Central Park"
                                                value={formData.location_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                                                className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                                            />
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${eventType === 'casual' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-violet-500/10 border-violet-500/20'}`}>
                                            <p className="flex items-center gap-2 text-white">
                                                <MapPin className={`h-4 w-4 ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`} />
                                                Location will appear on the map
                                            </p>
                                            <p className="text-xs text-white/50 mt-1 ml-6">
                                                Using current location coordinates
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-white/50">Select a venue</p>
                                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                            {mockVenues.slice(0, 4).map((venue, index) => (
                                                <motion.div
                                                    key={venue.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    whileHover={{ scale: 1.02, x: 8 }}
                                                    onClick={() => handleVenueSelect(venue)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all backdrop-blur-sm",
                                                        formData.selectedVenueId === venue.id
                                                            ? eventType === 'casual'
                                                                ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                                : 'bg-violet-500/15 border-violet-500 shadow-lg shadow-violet-500/20'
                                                            : "bg-zinc-900/80 border-white/10 hover:border-white/30 hover:bg-zinc-800/80"
                                                    )}
                                                >
                                                    <div className="relative h-16 w-16 flex-shrink-0">
                                                        <img
                                                            src={venue.imageUrl}
                                                            alt={venue.name}
                                                            className="h-full w-full rounded-xl object-cover"
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 to-transparent" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white truncate">{venue.name}</h4>
                                                        <p className="text-xs text-white/50 truncate">{venue.location}</p>
                                                        <p className={`text-sm font-bold mt-1 ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`}>₹{venue.pricePerHour}/hr</p>
                                                    </div>
                                                    <AnimatePresence>
                                                        {formData.selectedVenueId === venue.id && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0, rotate: 180 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                            >
                                                                <CheckCircle2 className={`h-7 w-7 flex-shrink-0 ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`} />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
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
                                className="space-y-5"
                            >
                                {/* Compact Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-white/70">Event Image</Label>
                                    {imagePreview ? (
                                        <div className="relative h-36 rounded-2xl overflow-hidden border-2 border-white/10">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={clearImage}
                                                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                                            >
                                                <X className="h-4 w-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${eventType === 'casual' ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5' : 'border-violet-500/30 hover:border-violet-500/50 bg-violet-500/5'}`}>
                                            <div className={`p-3 rounded-xl ${eventType === 'casual' ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
                                                <Upload className={`h-6 w-6 ${eventType === 'casual' ? 'text-emerald-400' : 'text-violet-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">Upload image</p>
                                                <p className="text-xs text-white/50">PNG, JPG up to 5MB</p>
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
                                    <Label className="text-sm text-white/70">Event Title</Label>
                                    <Input
                                        placeholder="Give it a catchy name"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm text-white/70">Description</Label>
                                    <Textarea
                                        placeholder="Tell people what to expect..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="bg-white/5 border-white/10 min-h-[100px] rounded-xl resize-none text-white placeholder:text-white/30 focus:border-white/30"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-white/70">Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-white/70">Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {eventType === 'ticketed' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm text-white/70">Ticket Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="flex-shrink-0 p-5 bg-zinc-950 border-t border-white/10">
                    <div className="flex gap-3">
                        {currentStep > STEPS.VIBE && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={isLoading}
                                className="flex-1 h-14 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </Button>
                        )}

                        <Button
                            onClick={handleNext}
                            disabled={isLoading || (currentStep === STEPS.VIBE && !formData.category)}
                            className={`flex-1 h-14 rounded-2xl font-semibold text-white shadow-lg ${eventType === 'casual' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 shadow-violet-500/30'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : currentStep === STEPS.DETAILS ? (
                                <>Create Event <Sparkles className="h-5 w-5 ml-2" /></>
                            ) : (
                                <>Next <ArrowRight className="h-5 w-5 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
