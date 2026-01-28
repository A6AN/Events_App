import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogOut, Settings, Share2, Heart, Bookmark, Info, Calendar, Grid3X3, Plus, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../context/AuthContext';
import { mockTickets } from '../data/mockTickets';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Extract dominant color from image
const extractDominantColor = (imgElement: HTMLImageElement): Promise<{ r: number; g: number; b: number }> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve({ r: 139, g: 92, b: 246 }); return; }
      canvas.width = canvas.height = 50;
      ctx.drawImage(imgElement, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 30 && brightness < 220) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
      }
      if (count > 0) resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
      else resolve({ r: 139, g: 92, b: 246 });
    } catch { resolve({ r: 139, g: 92, b: 246 }); }
  });
};

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'liked' | 'saved' | 'about'>('liked');
  const [themeColor, setThemeColor] = useState({ r: 139, g: 92, b: 246 });
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userAvatar = user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
  const userName = user?.user_metadata?.full_name || 'Event Explorer';

  // Extract color from avatar
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => extractDominantColor(img).then(setThemeColor);
    img.src = userAvatar;
  }, [userAvatar]);

  // Track scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 200);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const { r, g, b } = themeColor;
  const primaryColor = `rgb(${r}, ${g}, ${b})`;

  const likedEvents = mockTickets.slice(0, 3);
  const savedEvents = mockTickets.slice(2, 5);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto relative">
      {/* Floating Glass Header - Appears on scroll */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : -20 }}
        className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none"
      >
        <div
          className="max-w-lg mx-auto flex items-center justify-between px-4 py-3 rounded-full pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <button onClick={() => signOut()} className="text-white/60 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold">Profile</span>
          <button className="text-white/60 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Hero Section - Full Bleed */}
      <div className="relative h-[55vh] min-h-[400px]">
        {/* Background Image */}
        <img
          src={userAvatar}
          alt={userName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(${r}, ${g}, ${b}, 0.3) 0%, 
              transparent 30%, 
              rgba(0,0,0,0.8) 70%, 
              rgba(0,0,0,0.95) 100%)`
          }}
        />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => signOut()}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white border border-white/10"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            <span className="text-white text-sm font-medium">Profile</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white border border-white/10"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Social Icons - Left side */}
        <div className="absolute bottom-32 left-4 flex flex-col gap-3 z-10">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <Heart className="w-4 h-4" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <MessageCircle className="w-4 h-4" />
          </motion.button>
        </div>

        {/* User Info - Bottom */}
        <div className="absolute bottom-6 left-0 right-0 px-5 z-10">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">Lucknow, India</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-2">
            {userName.split(' ')[0]}<br />{userName.split(' ')[1] || ''}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span><span className="text-white font-bold">2,342</span> <span className="text-white/60">Followers</span></span>
            <span className="text-white/40">•</span>
            <span><span className="text-white font-bold">1,234</span> <span className="text-white/60">Following</span></span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative bg-black min-h-[50vh] pb-28 -mt-1">
        {/* Segmented Control */}
        <div className="px-4 py-4">
          <div
            className="flex p-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {(['liked', 'saved', 'about'] as const).map((tab) => (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${activeTab === tab
                    ? 'text-white'
                    : 'text-white/40'
                  }`}
                style={activeTab === tab ? {
                  background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.5), rgba(${r}, ${g}, ${b}, 0.3))`,
                  boxShadow: `0 4px 20px rgba(${r}, ${g}, ${b}, 0.3)`
                } : {}}
              >
                {tab === 'liked' && <Heart className="w-4 h-4" fill={activeTab === 'liked' ? 'currentColor' : 'none'} />}
                {tab === 'saved' && <Bookmark className="w-4 h-4" fill={activeTab === 'saved' ? 'currentColor' : 'none'} />}
                {tab === 'about' && <Info className="w-4 h-4" />}
                <span className="capitalize">{tab}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'liked' && (
            <motion.div
              key="liked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {/* Add Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ background: `rgba(${r}, ${g}, ${b}, 0.2)` }}
                  >
                    <Plus className="w-6 h-6 text-white/60" />
                  </div>
                  <span className="text-white/60 text-sm font-medium">Add</span>
                </motion.div>

                {likedEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Views/Likes */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                        👁 {Math.floor(Math.random() * 500) + 100}
                      </span>
                      <span className="text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                        ❤️ {Math.floor(Math.random() * 100) + 20}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {savedEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-white font-semibold text-sm truncate">{event.title}</h4>
                      <p className="text-white/60 text-xs mt-0.5">{event.date}</p>
                    </div>
                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `rgba(${r}, ${g}, ${b}, 0.8)` }}
                    >
                      <Bookmark className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 space-y-4"
            >
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">Bio</h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  🎉 Event enthusiast | 📍 Lucknow<br />
                  Living life one party at a time. Always up for spontaneous adventures and good vibes! ✨
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-3">Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>12</div>
                    <div className="text-white/40 text-xs">Hosted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">47</div>
                    <div className="text-white/40 text-xs">Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">4.9</div>
                    <div className="text-white/40 text-xs">Rating</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => signOut()}
                className="w-full py-3 rounded-xl text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
