import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, Loader2, Check, ChevronRight, MapPin,
    User, AlignLeft, Globe, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadAvatar, uploadBanner } from '../../lib/supabase';
import './EditProfileSheet.css';
import './ModalStyles.css';

interface EditProfileSheetProps {
    open: boolean;
    onClose: () => void;
    currentProfile: any;
    onSaved: (updated: any) => void;
}

const COMMON_LANGUAGES = [
    'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu',
    'Bengali', 'Gujarati', 'Punjabi', 'Kannada', 'Urdu',
    'Spanish', 'French', 'Arabic', 'Mandarin', 'Japanese',
];

export function EditProfileSheet({ open, onClose, currentProfile, onSaved }: EditProfileSheetProps) {
    const { user } = useAuth();

    // Form state
    const [fullName, setFullName] = useState(currentProfile?.full_name || '');
    const [username, setUsername] = useState(currentProfile?.username || '');
    const [bio, setBio] = useState(currentProfile?.bio || '');
    const [location, setLocation] = useState(currentProfile?.location || '');
    const [languages, setLanguages] = useState<string[]>(currentProfile?.languages || []);
    const [langInput, setLangInput] = useState('');
    const [showLangSuggestions, setShowLangSuggestions] = useState(false);

    // Photo state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatar_url || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(currentProfile?.banner_url || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // Save state
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    // Reset when opening with fresh profile
    const handleOpen = useCallback(() => {
        setFullName(currentProfile?.full_name || '');
        setUsername(currentProfile?.username || '');
        setBio(currentProfile?.bio || '');
        setLocation(currentProfile?.location || '');
        setLanguages(currentProfile?.languages || []);
        setAvatarPreview(currentProfile?.avatar_url || null);
        setBannerPreview(currentProfile?.banner_url || null);
        setAvatarFile(null);
        setBannerFile(null);
        setError('');
        setSaved(false);
    }, [currentProfile]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const addLanguage = (lang: string) => {
        const trimmed = lang.trim();
        if (!trimmed || languages.includes(trimmed)) return;
        setLanguages(prev => [...prev, trimmed]);
        setLangInput('');
        setShowLangSuggestions(false);
    };

    const removeLanguage = (lang: string) => {
        setLanguages(prev => prev.filter(l => l !== lang));
    };

    const langSuggestions = COMMON_LANGUAGES.filter(
        l => l.toLowerCase().includes(langInput.toLowerCase()) && !languages.includes(l)
    ).slice(0, 5);

    const handleSave = async () => {
        if (!user?.id) return;
        setError('');
        setSaving(true);

        try {
            let avatarUrl = currentProfile?.avatar_url;
            let bannerUrl = currentProfile?.banner_url;

            if (avatarFile) avatarUrl = await uploadAvatar(user.id, avatarFile);
            if (bannerFile) bannerUrl = await uploadBanner(user.id, bannerFile);

            const updated = await updateProfile(user.id, {
                full_name: fullName.trim(),
                username: username.trim().toLowerCase().replace(/\s+/g, '_'),
                bio: bio.trim(),
                location: location.trim(),
                languages,
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
            });

            setSaved(true);
            onSaved(updated);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1200);
        } catch (err: any) {
            setError(err.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence onExitComplete={() => { }}>
            {open && (
                <div className="sheet-overlay" onClick={onClose}>
                    <motion.div
                        className="sheet-content edit-profile-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        onAnimationComplete={(def) => {
                            if (def === 'animate') handleOpen();
                        }}
                    >
                        <div className="sheet-handle" />
                        <button className="sheet-close-btn" onClick={onClose}><X size={18} /></button>

                        {/* Header */}
                        <div className="ep-header">
                            <h2 className="ep-title">Edit Profile</h2>
                            <button
                                className="ep-save-btn"
                                onClick={handleSave}
                                disabled={saving || saved}
                            >
                                {saving ? (
                                    <Loader2 size={14} className="ep-spinner" />
                                ) : saved ? (
                                    <><Check size={14} /> Saved</>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>

                        <div className="ep-body">
                            {/* ── BANNER PHOTO ── */}
                            <div className="ep-section-label">Photos</div>

                            <div className="ep-photos">
                                {/* Banner */}
                                <div
                                    className="ep-banner-wrap"
                                    onClick={() => bannerRef.current?.click()}
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="ep-banner-img" />
                                    ) : (
                                        <div className="ep-banner-placeholder">
                                            <Camera size={20} />
                                            <span>Cover Photo</span>
                                        </div>
                                    )}
                                    <div className="ep-photo-edit-badge">
                                        <Camera size={12} />
                                    </div>
                                    <input
                                        ref={bannerRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleBannerChange}
                                    />
                                </div>

                                {/* Avatar over banner */}
                                <div
                                    className="ep-avatar-row"
                                    onClick={() => avatarRef.current?.click()}
                                >
                                    <div className="ep-avatar-wrap">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="ep-avatar-img" />
                                        ) : (
                                            <div className="ep-avatar-placeholder">
                                                {fullName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="ep-avatar-edit-ring">
                                            <Camera size={14} />
                                        </div>
                                    </div>
                                    <span className="ep-avatar-label">Change profile photo</span>
                                    <input
                                        ref={avatarRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>

                            {/* ── INFO FIELDS ── */}
                            <div className="ep-section-label" style={{ marginTop: 24 }}>Info</div>

                            {/* Name */}
                            <div className="ep-field">
                                <div className="ep-field-icon"><User size={15} /></div>
                                <div className="ep-field-body">
                                    <label className="ep-label">Full Name</label>
                                    <input
                                        className="ep-input"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Your display name"
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="ep-field">
                                <div className="ep-field-icon" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 700 }}>@</div>
                                <div className="ep-field-body">
                                    <label className="ep-label">Username</label>
                                    <input
                                        className="ep-input"
                                        value={username}
                                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                                        placeholder="your_username"
                                        maxLength={30}
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="ep-field ep-field-top">
                                <div className="ep-field-icon"><AlignLeft size={15} /></div>
                                <div className="ep-field-body">
                                    <label className="ep-label">Bio</label>
                                    <textarea
                                        className="ep-input ep-textarea"
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Tell people a little about yourself..."
                                        maxLength={160}
                                        rows={3}
                                    />
                                    <span className="ep-char-count">{bio.length}/160</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="ep-field">
                                <div className="ep-field-icon"><MapPin size={15} /></div>
                                <div className="ep-field-body">
                                    <label className="ep-label">Location</label>
                                    <input
                                        className="ep-input"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="e.g. Mumbai, India"
                                        maxLength={60}
                                    />
                                </div>
                            </div>

                            {/* ── LANGUAGES ── */}
                            <div className="ep-section-label" style={{ marginTop: 24 }}>Languages</div>

                            <div className="ep-languages-wrap">
                                {/* Existing tags */}
                                <div className="ep-lang-tags">
                                    {languages.map(lang => (
                                        <div key={lang} className="ep-lang-tag">
                                            <Globe size={11} />
                                            {lang}
                                            <button
                                                className="ep-lang-remove"
                                                onClick={() => removeLanguage(lang)}
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add language input */}
                                <div className="ep-lang-input-wrap">
                                    <input
                                        className="ep-input ep-lang-input"
                                        value={langInput}
                                        onChange={e => { setLangInput(e.target.value); setShowLangSuggestions(true); }}
                                        onFocus={() => setShowLangSuggestions(true)}
                                        onKeyDown={e => e.key === 'Enter' && addLanguage(langInput)}
                                        placeholder="Add a language..."
                                    />
                                    {langInput.trim() && (
                                        <button className="ep-lang-add-btn" onClick={() => addLanguage(langInput)}>
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions dropdown */}
                                {showLangSuggestions && langSuggestions.length > 0 && langInput.length > 0 && (
                                    <div className="ep-lang-suggestions">
                                        {langSuggestions.map(s => (
                                            <button
                                                key={s}
                                                className="ep-lang-suggestion-item"
                                                onClick={() => addLanguage(s)}
                                            >
                                                <Globe size={13} /> {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Error */}
                            {error && <p className="ep-error">{error}</p>}

                            {/* Save button (bottom) */}
                            <button
                                className="ep-save-full-btn"
                                onClick={handleSave}
                                disabled={saving || saved}
                            >
                                {saving ? (
                                    <Loader2 size={16} className="ep-spinner" />
                                ) : saved ? (
                                    <><Check size={16} /> Profile Saved!</>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
