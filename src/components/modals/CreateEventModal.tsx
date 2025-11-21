import React from 'react';
import { Plus } from 'lucide-react';
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

export const CreateEventModal = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/20"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Host an Event</DialogTitle>
                    <DialogDescription>
                        Create a new event to gather people.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input id="name" placeholder="e.g., Sunset Yoga" className="bg-white/5 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="What's the vibe?" className="bg-white/5 border-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" className="bg-white/5 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time</Label>
                            <Input id="time" type="time" className="bg-white/5 border-white/10" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Create Event</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
