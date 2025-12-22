import React from 'react';
import { cn } from './utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    gradientBorder?: boolean;
    glow?: boolean;
}

export const GlassCard = ({
    children,
    className,
    hoverEffect = false,
    gradientBorder = false,
    glow = false,
    ...props
}: GlassCardProps) => {
    if (gradientBorder) {
        return (
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/10">
                <div
                    className={cn(
                        "bg-black/60 backdrop-blur-2xl rounded-2xl shadow-2xl",
                        glow && "shadow-primary/20",
                        hoverEffect && "transition-all duration-300 hover:bg-black/50 cursor-pointer",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl",
                glow && "shadow-lg shadow-primary/10",
                hoverEffect && "transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
