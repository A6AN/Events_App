import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogOut, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

interface ProfileHeaderProps {
    hostedCount: number;
    attendedCount: number;
    followersCount: number;
}

export const ProfileHeader = ({ hostedCount, attendedCount, followersCount }: ProfileHeaderProps) => {
    const { user, signOut } = useAuth();

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="h-36 w-full overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 h-36 bg-gradient-to-b from-transparent to-background" />
            </div>

            {/* Logout Button */}
            <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut()}
                className="absolute top-3 right-3 bg-black/30 text-white hover:bg-black/50 rounded-full h-8 px-3 text-xs"
            >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
            </Button>

            {/* Profile Section */}
            <div className="px-5 -mt-12 relative">
                {/* Avatar */}
                <div className="flex items-end gap-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="h-20 w-20 rounded-full ring-4 ring-background overflow-hidden">
                            <Avatar className="h-full w-full">
                                <AvatarImage
                                    src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                                    alt="Profile"
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xl bg-primary/20">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                    </motion.div>

                    {/* Name & Location */}
                    <div className="flex-1 pb-1">
                        <h1 className="text-lg font-semibold text-white">
                            {user?.user_metadata?.full_name || 'Event Explorer'}
                        </h1>
                        <p className="text-white/50 text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Lucknow
                        </p>
                    </div>

                    {/* Edit Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/20 text-white/80 hover:bg-white/10 text-xs h-8"
                    >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                    </Button>
                </div>

                {/* Bio */}
                <p className="text-white/60 text-sm mt-3 leading-relaxed">
                    Life is a party, dress like it. 🥂✨
                </p>

                {/* Stats - Clean horizontal layout */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{hostedCount}</div>
                        <div className="text-xs text-white/50">Hosted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{attendedCount}</div>
                        <div className="text-xs text-white/50">Attended</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{followersCount}</div>
                        <div className="text-xs text-white/50">Rep Score</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
