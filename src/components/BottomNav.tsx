import { motion } from 'framer-motion';
import { Users, Map, Building2, User, Plus } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onPlusClick: () => void;
}

const tabs = [
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'map', icon: Map, label: 'Discover' },
    { id: 'venues', icon: Building2, label: 'Venues' },
    { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange, onPlusClick }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            {/* Floating Glass Pill Container */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.2 }}
                className="relative mx-auto max-w-md pointer-events-auto"
            >
                {/* Elevated Center FAB */}
                <motion.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPlusClick}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                        boxShadow: '0 8px 32px rgba(247, 37, 133, 0.5), 0 4px 16px rgba(114, 9, 183, 0.3)',
                    }}
                >
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.button>

                {/* Glass Pill Navigation */}
                <div
                    className="rounded-full overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
                    }}
                >
                    <div className="flex items-center justify-around h-16 px-2">
                        {tabs.slice(0, 2).map((tab) => (
                            <NavItem
                                key={tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                isActive={activeTab === tab.id}
                                onClick={() => onTabChange(tab.id)}
                            />
                        ))}

                        {/* Spacer for center FAB */}
                        <div className="w-16" />

                        {tabs.slice(2).map((tab) => (
                            <NavItem
                                key={tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                isActive={activeTab === tab.id}
                                onClick={() => onTabChange(tab.id)}
                            />
                        ))}
                    </div>
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
            className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors"
        >
            <motion.div
                animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'
                        }`}
                    strokeWidth={isActive ? 2.5 : 2}
                />
            </motion.div>

            <span
                className={`text-[10px] font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'
                    }`}
            >
                {label}
            </span>

            {/* Active Indicator Dot */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.5,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                style={{
                    background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                    boxShadow: '0 0 8px rgba(247, 37, 133, 0.8)',
                }}
            />
        </motion.button>
    );
}
