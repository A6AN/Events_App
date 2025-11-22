import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { createEvent, uploadEventImage } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ImageUpload } from '../ui/ImageUpload';

export const CreateEventModal = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location_name: 'New Delhi', // Default for now
        latitude: 28.6139,
        longitude: 77.2090,
        price: 0,
        category: 'Social',
        mood: 'Chill'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                capacity: 100, // Default
                image_url: imageUrl, // TODO: Implement image upload
                host_id: user.id,
                category: formData.category,
                mood: formData.mood
            });

            setIsOpen(false);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                location_name: 'New Delhi',
                latitude: 28.6139,
                longitude: 77.2090,
                price: 0,
                category: 'Social',
                mood: 'Chill'
            });
            setImageFile(null);
            // Ideally trigger a refresh of events here
            window.location.reload(); // Simple refresh for now
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/20"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Host an Event</DialogTitle>
                    <DialogDescription>
                        Create a new event to gather people.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Event Image</Label>
                        <ImageUpload onImageSelected={setImageFile} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Sunset Yoga"
                            className="bg-white/5 border-white/10"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What's the vibe?"
                            className="bg-white/5 border-white/10"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                className="bg-white/5 border-white/10"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                className="bg-white/5 border-white/10"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Event'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
