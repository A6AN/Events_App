import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Share2, MapPin, Link as LinkIcon, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

interface ProfileHeaderProps {
    hostedCount: number;
    attendedCount: number;
    followersCount: number;
}

export const ProfileHeader = ({ hostedCount, attendedCount, followersCount }: ProfileHeaderProps) => {
    const { user, signOut } = useAuth();

    return (
        <div className="relative mb-4">
            {/* Cover Image */}
            <div className="h-48 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Top Actions */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <Button size="icon" variant="ghost" className="bg-black/20 backdrop-blur-md text-white hover:bg-black/40 rounded-full">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-black/20 backdrop-blur-md text-white hover:bg-black/40 rounded-full"
                        onClick={() => signOut()}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="px-4 -mt-10 relative z-20">
                <GlassCard className="p-4 pt-16 relative overflow-visible">
                    {/* Floating Avatar */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full p-1 bg-background/50 backdrop-blur-xl border border-white/20 shadow-xl">
                                <Avatar className="h-full w-full">
                                    <AvatarImage
                                        src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Online Status */}
                            <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-background" />
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="text-center space-y-1 mb-6">
                        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            {user?.user_metadata?.full_name || 'Event Explorer'}
                            <Award className="h-5 w-5 text-yellow-500" />
                        </h1>
                        <p className="text-white/60 text-sm flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" /> New Delhi, India
                        </p>
                        <p className="text-white/80 text-sm mt-2 max-w-[250px] mx-auto">
                            "Life is a party, dress like it." 🥂✨
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{hostedCount}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Hosted</div>
                        </div>
                        <div className="text-center border-l border-r border-white/10">
                            <div className="text-xl font-bold text-white">{attendedCount}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Attended</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{followersCount}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Reputation</div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
