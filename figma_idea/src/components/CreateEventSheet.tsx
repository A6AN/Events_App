import { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Calendar, Clock, Users, IndianRupee, Tag, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

interface CreateEventSheetProps {
  open: boolean;
  onClose: () => void;
  eventType: 'casual' | 'ticketed';
}

export function CreateEventSheet({ open, onClose, eventType }: CreateEventSheetProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    mood: '',
    capacity: '',
    price: '',
  });

  const moods = ['Energetic', 'Chill', 'Creative', 'Romantic', 'Wild'];

  const handleSubmit = () => {
    toast.success('🎉 Event created successfully!', {
      description: `Your ${eventType} event "${formData.title}" is now live!`
    });
    onClose();
    setStep(1);
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      mood: '',
      capacity: '',
      price: '',
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        mood: '',
        capacity: '',
        price: '',
      });
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] max-h-[700px] rounded-t-3xl border-t border-border p-0 bg-background"
      >
        <SheetTitle className="sr-only">Create Event</SheetTitle>
        <SheetDescription className="sr-only">
          {eventType === 'casual' ? 'Create a casual gathering event' : 'Create a ticketed event'}
        </SheetDescription>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-foreground text-base">Create Event</h2>
                  <p className="text-muted-foreground text-[11px]">
                    {eventType === 'casual' ? 'Casual gathering' : 'Ticketed event'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1.5 mt-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 pb-6 space-y-4">
              {step === 1 && (
                <>
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Event Photo</Label>
                    <div className="relative aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/30 group-hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Tap to upload photo</p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your event a catchy name..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-card border-border rounded-xl h-12"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What's the vibe? Tell people what to expect..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-card border-border rounded-xl min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Mood Selection */}
                  <div className="space-y-2">
                    <Label>Event Mood</Label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => (
                        <Badge
                          key={mood}
                          variant="outline"
                          onClick={() => setFormData({ ...formData, mood })}
                          className={`cursor-pointer px-4 py-2 rounded-xl transition-all ${
                            formData.mood === mood
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card hover:bg-muted border-border'
                          }`}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Hauz Khas Village, Delhi"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-card border-border rounded-xl h-12 pl-11"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-card border-border rounded-xl h-12 pl-11"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="bg-card border-border rounded-xl h-12 pl-11"
                      />
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Max Attendees</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="bg-card border-border rounded-xl h-12 pl-11"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  {eventType === 'ticketed' && (
                    <>
                      {/* Price */}
                      <div className="space-y-2">
                        <Label htmlFor="price">Ticket Price</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="price"
                            type="number"
                            placeholder="500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="bg-card border-border rounded-xl h-12 pl-11"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Summary Card */}
                  <div className="space-y-2">
                    <Label>Event Summary</Label>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-foreground mb-1">{formData.title || 'Event Title'}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {formData.description || 'Event description...'}
                          </p>
                        </div>
                        {formData.mood && (
                          <Badge className="bg-primary/20 text-primary border-0">
                            {formData.mood}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{formData.location || 'Location'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formData.date || 'Date'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{formData.time || 'Time'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{formData.capacity || '0'} max</span>
                        </div>
                      </div>

                      {eventType === 'ticketed' && formData.price && (
                        <div className="pt-3 border-t border-primary/20 flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Ticket Price</span>
                          <span className="text-foreground text-xl">₹{formData.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-xl border-t border-border/50 p-4">
            <div className="flex gap-2.5">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-11 rounded-xl border-border"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {step === 3 ? '🎉 Publish Event' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}