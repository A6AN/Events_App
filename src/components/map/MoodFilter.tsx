import React from 'react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../ui/utils';

interface MoodFilterProps {
    selectedMood: string | null;
    onSelectMood: (mood: string | null) => void;
}

const MOODS = [
    { id: 'Chill', label: 'Chill', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    { id: 'Energetic', label: 'Energetic', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
    { id: 'Creative', label: 'Creative', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    { id: 'Romantic', label: 'Romantic', color: 'bg-pink-500/20 text-pink-300 border-pink-500/50' },
    { id: 'Intellectual', label: 'Intellectual', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
];

export const MoodFilter: React.FC<MoodFilterProps> = ({ selectedMood, onSelectMood }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
            <Badge
                variant="outline"
                className={cn(
                    "cursor-pointer transition-all hover:bg-white/10 px-4 py-1.5 h-8",
                    !selectedMood ? "bg-white/20 border-white/40" : "bg-black/40 border-white/10 text-muted-foreground"
                )}
                onClick={() => onSelectMood(null)}
            >
                All
            </Badge>

            {MOODS.map((mood) => (
                <Badge
                    key={mood.id}
                    variant="outline"
                    className={cn(
                        "cursor-pointer transition-all hover:bg-white/10 px-4 py-1.5 h-8 border",
                        selectedMood === mood.id
                            ? mood.color
                            : "bg-black/40 border-white/10 text-muted-foreground"
                    )}
                    onClick={() => onSelectMood(mood.id === selectedMood ? null : mood.id)}
                >
                    {mood.label}
                </Badge>
            ))}
        </div>
    );
};
