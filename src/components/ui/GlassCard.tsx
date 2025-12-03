import React from 'react';
import { cn } from './utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard = ({ children, className, hoverEffect = false, ...props }: GlassCardProps) => {
    return (
        <div
            className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl",
                hoverEffect && "transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
