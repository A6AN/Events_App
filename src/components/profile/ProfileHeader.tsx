import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogOut, Edit2, User } from 'lucide-react';
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
            {/* Header with gradient */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Profile</h1>
                        <p className="text-white/50 text-xs">Your activity & stats</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <User className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 overflow-hidden"
                >
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

                    {/* Logout Button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => signOut()}
                        className="absolute top-3 right-3 bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 rounded-full h-8 px-3 text-xs transition-colors"
                    >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                    </Button>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {/* Glow effect behind avatar */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-lg opacity-40 animate-pulse" />
                            <div className="relative h-18 w-18 rounded-full ring-2 ring-violet-400 overflow-hidden shadow-lg shadow-violet-500/30">
                                <Avatar className="h-full w-full">
                                    <AvatarImage
                                        src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-lg bg-violet-500/20 text-violet-300">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg shadow-green-500/30">
                                <span className="text-[8px]">✓</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-white">
                                {user?.user_metadata?.full_name || 'Event Explorer'}
                            </h2>
                            <p className="text-white/50 text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Lucknow
                            </p>
                            <p className="text-violet-400 text-xs mt-1">Life is a party 🥂</p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 text-xs h-8"
                        >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 mt-5 pt-4 border-t border-white/20">
                        <div className="flex-1 text-center bg-white/5 rounded-xl py-2 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                                {hostedCount}<span className="text-green-400 text-sm">✓</span>
                            </div>
                            <div className="text-xs text-white/50">Hosted</div>
                        </div>
                        <div className="flex-1 text-center bg-white/5 rounded-xl py-2 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">{attendedCount}</div>
                            <div className="text-xs text-white/50">Attended</div>
                        </div>
                        <div className="flex-1 text-center bg-violet-500/20 rounded-xl py-2 backdrop-blur-sm border border-violet-500/30">
                            <div className="text-2xl font-bold text-violet-400">{followersCount}</div>
                            <div className="text-xs text-violet-300/70">Rep Score</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
