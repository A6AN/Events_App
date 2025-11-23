import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DbEvent } from '../../types';

interface TicketCardProps {
    event: DbEvent;
    ticketId: string;
}

export const TicketCard = ({ event, ticketId }: TicketCardProps) => {
    const ticketData = JSON.stringify({
        ticketId,
        eventId: event.id,
        userId: 'user_id_placeholder', // In a real app, this would be validated on scan
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
            {/* Holographic Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row">
                {/* Event Image Section */}
                <div className="relative h-48 md:h-auto md:w-1/3">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r" />

                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{event.location_name}</span>
                        </div>
                    </div>
                </div>

                {/* Ticket Details & QR Section */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Date</div>
                                <div className="flex items-center text-foreground font-medium">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Time</div>
                                <div className="flex items-center justify-end text-foreground font-medium">
                                    <Clock className="w-4 h-4 mr-2 text-primary" />
                                    {format(new Date(event.date), 'h:mm a')}
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/10 border-t border-dashed border-white/20" />

                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ticket ID</div>
                                <div className="font-mono text-xs text-white/50">{ticketId.slice(0, 8)}...</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20">
                                    Valid
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center pt-2">
                        <div className="p-3 bg-white rounded-xl shadow-lg">
                            <QRCodeSVG
                                value={ticketData}
                                size={120}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-white/10" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-white/10" />
        </motion.div>
    );
};
