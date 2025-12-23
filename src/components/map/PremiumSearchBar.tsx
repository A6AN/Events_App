import React from 'react';
import { Search, X, Loader2, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumSearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: any[];
    isSearching: boolean;
    onResultClick: (result: any) => void;
    onClear: () => void;
}

export function PremiumSearchBar({
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    onResultClick,
    onClear
}: PremiumSearchBarProps) {
    const hasResults = searchResults.length > 0 || isSearching;

    return (
        <div className="relative">
            {/* Search Input */}
            <motion.div
                className={`relative transition-all duration-300 ${hasResults ? 'rounded-t-2xl' : 'rounded-2xl'
                    }`}
            >
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Animated glow border */}
                    <div className="absolute inset-0 opacity-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
                    </div>

                    <div className="relative flex items-center px-4 py-3">
                        <Search className="h-5 w-5 text-white/50 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search places in India..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none text-white placeholder:text-white/40 focus:outline-none px-3 text-sm"
                        />

                        <AnimatePresence>
                            {searchQuery && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={onClear}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-4 w-4 text-white/70" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {hasResults && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ transformOrigin: 'top' }}
                        className="absolute top-full left-0 right-0 bg-black/60 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl overflow-hidden shadow-2xl"
                    >
                        {isSearching ? (
                            <div className="p-4 flex items-center justify-center gap-3">
                                <div className="relative">
                                    <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
                                    <div className="absolute inset-0 blur-md bg-cyan-400/30 rounded-full" />
                                </div>
                                <span className="text-white/60 text-sm">Searching...</span>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <motion.button
                                        key={result.place_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onResultClick(result)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 group"
                                    >
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors flex-shrink-0">
                                            <MapPin className="h-4 w-4 text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white text-sm font-medium truncate group-hover:text-cyan-300 transition-colors">
                                                {result.structured_formatting?.main_text || result.description}
                                            </div>
                                            {result.structured_formatting?.secondary_text && (
                                                <div className="text-white/40 text-xs truncate mt-0.5">
                                                    {result.structured_formatting.secondary_text}
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Powered by badge */}
                        <div className="flex items-center justify-center gap-2 py-2 border-t border-white/5">
                            <span className="text-[10px] text-white/30">Powered by Ola Maps</span>
                            <span className="text-xs">🇮🇳</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
