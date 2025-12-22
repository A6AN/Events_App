import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Share2, MapPin, Award, Sparkles, Calendar, Users, Edit3 } from 'lucide-react';
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
        <div className="relative mb-6">
            {/* Cover Image with Gradient Overlay */}
            <div className="h-56 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-black/80 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Top Actions */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-black/30 backdrop-blur-xl text-white hover:bg-white/20 rounded-full border border-white/10"
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-black/30 backdrop-blur-xl text-white hover:bg-white/20 rounded-full border border-white/10"
                            onClick={() => signOut()}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Profile Info Card - Glassmorphic */}
            <div className="px-4 -mt-16 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 pt-20 relative overflow-visible shadow-2xl"
                >
                    {/* Animated Gradient Avatar */}
                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
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
                            <div className="relative h-28 w-28 rounded-full p-1 bg-background">
                                <Avatar className="h-full w-full border-2 border-white/20">
                                    <AvatarImage
                                        src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-2xl bg-primary/20">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Verified Badge */}
                            <motion.div
                                className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-4 border-background shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <Award className="h-4 w-4 text-white" />
                            </motion.div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="text-center space-y-2 mb-6">
                        <motion.h1
                            className="text-2xl font-bold text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {user?.user_metadata?.full_name || 'Event Explorer'}
                        </motion.h1>
                        <motion.p
                            className="text-white/50 text-sm flex items-center justify-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <MapPin className="h-3 w-3" /> New Delhi, India
                        </motion.p>
                        <motion.p
                            className="text-white/70 text-sm mt-3 max-w-[280px] mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            "Life is a party, dress like it." 🥂✨
                        </motion.p>

                        {/* Edit Profile Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full px-6"
                            >
                                <Edit3 className="h-3.5 w-3.5 mr-2" />
                                Edit Profile
                            </Button>
                        </motion.div>
                    </div>

                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Calendar, value: hostedCount, label: 'Hosted', color: 'from-violet-500 to-purple-600' },
                            { icon: Users, value: attendedCount, label: 'Attended', color: 'from-pink-500 to-rose-600' },
                            { icon: Sparkles, value: followersCount, label: 'Rep Score', color: 'from-amber-500 to-orange-600' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="relative group cursor-pointer"
                            >
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105">
                                    {/* Icon with gradient background */}
                                    <div className={`mx-auto w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg`}>
                                        <stat.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
