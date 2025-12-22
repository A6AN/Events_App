import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Share2, MapPin, Award, Sparkles, Calendar, Users, Edit3, LogOut } from 'lucide-react';
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
        <div className="relative mb-4">
            {/* Cover Image with Gradient Overlay */}
            <div className="h-44 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background z-10" />
                <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Top Actions */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 bg-black/40 backdrop-blur-xl text-white hover:bg-white/20 rounded-full border border-white/10"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 bg-black/40 backdrop-blur-xl text-white hover:bg-white/20 rounded-full border border-white/10"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Avatar - Positioned to overlap cover and card */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-28 z-30">
                <div className="relative">
                    {/* Animated Gradient Ring */}
                    <motion.div
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-pink-500 to-primary opacity-75 blur-sm"
                        animate={{
                            rotate: 360,
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                    />
                    <motion.div
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-pink-500 to-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Avatar Container */}
                    <div className="relative h-24 w-24 rounded-full p-1 bg-background">
                        <Avatar className="h-full w-full border-2 border-white/20">
                            <AvatarImage
                                src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                                alt="Profile"
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xl bg-primary/20">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Verified Badge */}
                    <motion.div
                        className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        <Award className="h-3 w-3 text-white" />
                    </motion.div>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="px-4 pt-16 pb-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
                >
                    {/* User Details */}
                    <div className="text-center space-y-1 mb-5">
                        <h1 className="text-xl font-bold text-white">
                            {user?.user_metadata?.full_name || 'Event Explorer'}
                        </h1>
                        <p className="text-white/50 text-sm flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" /> Lucknow, India
                        </p>
                        <p className="text-white/60 text-xs mt-2">
                            "Life is a party, dress like it." 🥂✨
                        </p>

                        {/* Edit Profile Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full px-5 text-xs"
                        >
                            <Edit3 className="h-3 w-3 mr-1.5" />
                            Edit Profile
                        </Button>
                    </div>

                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { icon: Calendar, value: hostedCount, label: 'Hosted', color: 'from-violet-500 to-purple-600' },
                            { icon: Users, value: attendedCount, label: 'Attended', color: 'from-pink-500 to-rose-600' },
                            { icon: Sparkles, value: followersCount, label: 'Rep', color: 'from-amber-500 to-orange-600' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="cursor-pointer"
                            >
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                                    <div className={`mx-auto w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 shadow-lg`}>
                                        <stat.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="text-lg font-bold text-white">{stat.value}</div>
                                    <div className="text-[9px] text-white/50 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
