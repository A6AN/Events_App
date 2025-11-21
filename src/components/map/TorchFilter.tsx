import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Slider } from '../../components/ui/slider';
import { cn } from '../ui/utils';

interface TorchFilterProps {
    isActive: boolean;
    onToggle: () => void;
    radius: number;
    onRadiusChange: (value: number) => void;
}

export const TorchFilter: React.FC<TorchFilterProps> = ({
    isActive,
    onToggle,
    radius,
    onRadiusChange
}) => {
    return (
        <div className="flex flex-col items-end gap-4">
            <button
                onClick={onToggle}
                className={cn(
                    "relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg backdrop-blur-md border border-white/20",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                        : "bg-background/80 text-muted-foreground hover:bg-background"
                )}
            >
                <Flame className={cn("w-6 h-6 transition-all", isActive && "animate-pulse")} />
                <span className="absolute right-full mr-3 px-2 py-1 rounded-md bg-background/90 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Torch Mode
                </span>
            </button>

            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl w-64"
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Search Radius</span>
                        <span className="text-xs text-muted-foreground">{radius} km</span>
                    </div>
                    <Slider
                        value={[radius]}
                        onValueChange={(vals: number[]) => onRadiusChange(vals[0])}
                        max={20}
                        step={1}
                        className="w-full"
                    />
                </motion.div>
            )}
        </div>
    );
};
