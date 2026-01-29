import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, MapPin, Clock, Ticket, CreditCard, CheckCircle } from 'lucide-react';
import { TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface TicketBookingDialogProps {
  ticket: TicketEvent | null;
  open: boolean;
  onClose: () => void;
}

export function TicketBookingDialog({ ticket, open, onClose }: TicketBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);

  if (!ticket) return null;

  const handleBook = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        {!isBooked ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">
                {ticket.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Book your ticket for this event
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Event Image */}
              <div className="relative h-40 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={ticket.imageUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-sm text-gray-300">{ticket.artist}</div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{ticket.date}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{ticket.time}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{ticket.venue}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>{ticket.availableSeats} seats available</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ticket Price</span>
                  <span className="text-2xl text-foreground">₹{ticket.price}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                onClick={handleBook}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Book Ticket Now
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-20 w-20 text-primary mb-4" />
            <h3 className="text-2xl mb-2 text-foreground">
              Booking Confirmed!
            </h3>
            <p className="text-muted-foreground text-center">
              Your ticket has been booked successfully.<br />
              Check your email for details.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
