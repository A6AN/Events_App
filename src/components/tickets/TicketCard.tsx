import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Sparkles, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { DbEvent } from '../../types';

interface TicketCardProps {
    event: DbEvent;
    ticketId: string;
}

export const TicketCard = ({ event, ticketId }: TicketCardProps) => {
    const [showQR, setShowQR] = useState(false);

    const ticketData = JSON.stringify({
        ticketId,
        eventId: event.id,
        userId: 'user_id_placeholder',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl"
        >
            {/* Main Ticket Container */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">

                {/* Holographic Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />

                {/* Pattern Background */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative">
                    {/* Event Image Section */}
                    <div className="relative h-40 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />

                        {/* Premium Badge */}
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                            <Sparkles className="h-3 w-3 text-white" />
                            <span className="text-xs font-bold text-white">VIP ACCESS</span>
                        </div>

                        {/* Event Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                            <div className="flex items-center gap-1.5 text-white/80">
                                <MapPin className="w-3 h-3" />
                                <span className="text-sm truncate">{event.location_name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Perforated Divider */}
                    <div className="relative h-6 flex items-center">
                        <div className="absolute left-0 w-6 h-6 bg-background rounded-full -translate-x-1/2" />
                        <div className="absolute right-0 w-6 h-6 bg-background rounded-full translate-x-1/2" />
                        <div className="flex-1 border-b-2 border-dashed border-white/20 mx-4" />
                    </div>

                    {/* Ticket Details */}
                    <div className="p-4 space-y-4">
                        {/* Date & Time Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Date</div>
                                    <div className="text-white font-medium text-sm">
                                        {format(new Date(event.date), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Time</div>
                                    <div className="text-white font-medium text-sm">
                                        {format(new Date(event.date), 'h:mm a')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ticket ID & Status */}
                        <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                            <div>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Ticket ID</div>
                                <div className="font-mono text-xs text-white/60">{ticketId.slice(0, 12)}...</div>
                            </div>
                            <div className="bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                Valid
                            </div>
                        </div>

                        {/* QR Code Section - Animated Reveal */}
                        <motion.button
                            onClick={() => setShowQR(!showQR)}
                            className="w-full bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-2xl p-4 border border-primary/30 flex flex-col items-center gap-2"
                            whileTap={{ scale: 0.98 }}
                        >
                            <AnimatePresence mode="wait">
                                {showQR ? (
                                    <motion.div
                                        key="qr"
                                        initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                                        className="p-4 bg-white rounded-2xl shadow-2xl"
                                    >
                                        <QRCodeSVG
                                            value={ticketData}
                                            size={140}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="prompt"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center py-4"
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center mb-3">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-white font-medium mb-1">Tap to reveal QR Code</span>
                                        <span className="text-white/40 text-xs">Show this at the venue entrance</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <motion.div
                                animate={{ rotate: showQR ? 180 : 0 }}
                                className="text-white/40"
                            >
                                <ChevronDown className="h-5 w-5" />
                            </motion.div>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* CSS for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </motion.div>
    );
};
