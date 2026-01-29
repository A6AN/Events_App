import { motion } from 'framer-motion';
import { Users, Map, Building2, User, Plus, Home } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onPlusClick: () => void;
}

const tabs = [
    { id: 'social', icon: Home, label: 'Feed' },
    { id: 'map', icon: Map, label: 'Discover' },
    { id: 'venues', icon: Building2, label: 'Venues' },
    { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange, onPlusClick }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 pointer-events-none">
            {/* Floating Center FAB - Positioned above nav */}
            <motion.div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    delay: 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
            >
                <button
                    onClick={onPlusClick}
                    className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                        boxShadow: '0 8px 24px rgba(247, 37, 133, 0.4)',
                    }}
                >
                    {/* Pulse animation ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <Plus className="h-6 w-6 text-white relative z-10" />
                </button>
            </motion.div>

            {/* Glass Pill Navigation - 4 Column Grid */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.2 }}
                className="mx-4 max-w-lg mx-auto pointer-events-auto"
            >
                <div
                    className="h-16 rounded-full overflow-hidden grid grid-cols-4 items-center px-2"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
                    }}
                >
                    {tabs.map((tab) => (
                        <NavItem
                            key={tab.id}
                            icon={tab.icon}
                            label={tab.label}
                            isActive={activeTab === tab.id}
                            onClick={() => onTabChange(tab.id)}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="relative flex flex-col items-center justify-center gap-1 py-2"
        >
            {/* Active Indicator Glow */}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(247, 37, 133, 0.2) 0%, transparent 70%)',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                />
            )}

            {/* Icon */}
            <motion.div
                className="relative z-10"
                animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
            >
                <Icon
                    className="h-5 w-5 transition-colors duration-200"
                    style={{
                        color: isActive ? '#FFFFFF' : '#a0a0a0',
                        filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' : 'none',
                    }}
                />
            </motion.div>

            {/* Label */}
            <span
                className="text-[10px] relative z-10 transition-colors duration-200"
                style={{
                    color: isActive ? '#FFFFFF' : '#a0a0a0',
                }}
            >
                {label}
            </span>

            {/* Active Dot Below */}
            {isActive && (
                <motion.div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            )}
        </motion.button>
    );
}
