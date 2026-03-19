import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mail, Lock, Chrome, Loader2, ArrowRight, Sparkles, PartyPopper, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';

// Map Supabase error messages to user-friendly strings
const getFriendlyError = (message: string): string => {
    const map: Record<string, string> = {
        'Invalid login credentials': 'Wrong email or password. Please try again.',
        'Email not confirmed': 'Please check your inbox and confirm your email first.',
        'User already registered': 'An account with this email already exists. Try signing in.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
        'Email rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
        'For security purposes, you can only request this once every 60 seconds': 'Please wait 60 seconds before requesting another code.',
        'Token has expired or is invalid': 'That code has expired or is invalid. Please request a new one.',
    };
    return map[message] || message;
};

type AuthMode = 'email' | 'phone' | 'reset';

export function LoginPage() {
    const [authMode, setAuthMode] = useState<AuthMode>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const { signIn, signInWithGoogle, signInWithPhone, verifyOtp, resetPassword, user } = useAuth();
    const navigate = useNavigate();

    // Eye-following card effect
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await signIn(email, password);

        if (error) {
            setError(getFriendlyError(error.message));
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            setError('Please enter your phone number.');
            return;
        }
        setLoading(true);
        setError('');

        const { error } = await signInWithPhone(phone);

        if (error) {
            setError(getFriendlyError(error.message));
        } else {
            setOtpSent(true);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setError('Please enter the 6-digit code.');
            return;
        }
        setLoading(true);
        setError('');

        const { error } = await verifyOtp(phone, otp);

        if (error) {
            setError(getFriendlyError(error.message));
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setLoading(true);
        setError('');

        const { error } = await resetPassword(email);

        if (error) {
            setError(getFriendlyError(error.message));
        } else {
            setResetSent(true);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(getFriendlyError(error.message));
            setLoading(false);
        }
    };

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setError('');
        setResetSent(false);
        setOtpSent(false);
        setOtp('');
    };

    const headerText = authMode === 'reset' ? 'Reset Password' : 'Welcome Back';
    const subtitleText = authMode === 'reset'
        ? 'Enter your email to receive a reset link'
        : authMode === 'phone'
            ? 'Sign in with your phone number'
            : 'Sign in to continue the party';

    return (
        <div
            className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-6 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, rgba(6, 78, 59, 0.4) 50%, #0a0a0a 100%)' }}
        >
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(20, 184, 166, 0.3) 100%)',
                        filter: 'blur(80px)'
                    }}
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(16, 185, 129, 0.4) 100%)',
                        filter: 'blur(80px)'
                    }}
                />
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%)',
                        filter: 'blur(60px)'
                    }}
                />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ rotateX, rotateY, transformPerspective: 1000 }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Glass Card */}
                <div
                    className="relative backdrop-blur-2xl border border-white/20 rounded-3xl p-8 overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 100px rgba(16, 185, 129, 0.15)'
                    }}
                >
                    {/* Inner glow effects */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.6), transparent)' }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%)' }}
                    />

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <PartyPopper className="h-8 w-8 text-white" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1
                                className="text-3xl font-bold mb-2"
                                style={{
                                    background: 'linear-gradient(90deg, #fff, #6ee7b7, #fff)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {headerText}
                            </h1>
                            <p className="text-white/50">{subtitleText}</p>
                        </motion.div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {/* Success Messages */}
                    {resetSent && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            Check your inbox! We've sent a password reset link to <strong>{email}</strong>.
                        </motion.div>
                    )}

                    {/* =================== RESET PASSWORD MODE =================== */}
                    {authMode === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-5 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email" className="text-white/70 ml-1 text-sm">Email</Label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-500/50 rounded-xl transition-all relative"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold text-white rounded-xl transition-all duration-300 border-0"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                                }}
                                disabled={loading || resetSent}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : resetSent ? 'Email Sent ✓' : 'Send Reset Link'}
                            </Button>

                            <button
                                type="button"
                                onClick={() => switchMode('email')}
                                className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors mt-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Sign In
                            </button>
                        </form>
                    )}

                    {/* =================== PHONE OTP MODE =================== */}
                    {authMode === 'phone' && (
                        <>
                            {!otpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-5 mb-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="phone" className="text-white/70 ml-1 text-sm">Phone Number</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-500/50 rounded-xl transition-all relative"
                                                required
                                            />
                                        </div>
                                        <p className="text-white/30 text-xs ml-1">Include country code (e.g., +91 for India)</p>
                                    </motion.div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold text-white rounded-xl transition-all duration-300 group border-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Send OTP
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-5 mb-6">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm text-center"
                                    >
                                        We sent a 6-digit code to <strong>{phone}</strong>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="otp" className="text-white/70 ml-1 text-sm">Verification Code</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <Input
                                                id="otp"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="h-14 bg-white/5 border-white/10 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/15 focus:bg-white/10 focus:border-emerald-500/50 rounded-xl transition-all relative"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold text-white rounded-xl transition-all duration-300 group border-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Verify & Sign In
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                        className="w-full text-center text-white/40 hover:text-white/70 text-xs transition-colors"
                                    >
                                        Didn't get the code? Send again
                                    </button>
                                </form>
                            )}

                            {/* Switch to email */}
                            <button
                                type="button"
                                onClick={() => switchMode('email')}
                                className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors"
                            >
                                <Mail className="h-4 w-4" /> Use email instead
                            </button>
                        </>
                    )}

                    {/* =================== EMAIL PASSWORD MODE =================== */}
                    {authMode === 'email' && (
                        <>
                            <form onSubmit={handleEmailLogin} className="space-y-5 mb-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="email" className="text-white/70 ml-1 text-sm">Email</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-500/50 rounded-xl transition-all relative"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-white/70 ml-1 text-sm">Password</Label>
                                        <button
                                            type="button"
                                            onClick={() => switchMode('reset')}
                                            className="text-emerald-400/70 hover:text-emerald-400 text-xs transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-500/50 rounded-xl transition-all relative"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold text-white rounded-xl transition-all duration-300 group border-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Sign In
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Phone login toggle */}
                            <button
                                type="button"
                                onClick={() => switchMode('phone')}
                                className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-4"
                            >
                                <Phone className="h-4 w-4" /> Use phone number instead
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 text-xs uppercase tracking-widest text-white/30 bg-transparent">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Google OAuth */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl transition-all group"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <Chrome className="mr-3 h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                                    Continue with Google
                                </Button>
                            </motion.div>

                            {/* Sign Up Link */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-8 text-center text-white/50"
                            >
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors inline-flex items-center gap-1"
                                >
                                    Sign up <Sparkles className="h-3 w-3" />
                                </Link>
                            </motion.p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
