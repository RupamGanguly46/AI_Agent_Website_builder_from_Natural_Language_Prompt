import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import api from '../api/api';
import { useOAuthSignIn } from '../hooks/useOAuthSignIn';

function Signup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, signInWithGitHub } = useOAuthSignIn();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirm_password.value;

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            // Force-refresh token so the interceptor gets a valid JWT immediately
            await userCredential.user.getIdToken(true);

            // Sync profile with backend MongoDB (firebaseUid is read from the Bearer token on the server)
            await api.post('/users/sync', {
                email: userCredential.user.email,
                name: name
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper flex-grow flex items-center justify-center relative px-4 py-24 md:py-32 w-full min-h-[calc(100vh-280px)]">
            {/* Background Atmospheric Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] atmospheric-glow rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] atmospheric-glow rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(233, 179, 255, 0.05) 0%, transparent 70%)" }}></div>
            
            {/* Signup Container */}
            <div className="w-full max-w-md z-10 transition-colors duration-500">
                {/* Header Text */}
                <div className="text-center mb-8">
                    <span className="font-label text-[0.6875rem] uppercase tracking-widest text-tertiary mb-2 block">The Auteur's Journey</span>
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface transition-colors duration-500">
                        Join the Vision.
                    </h1>
                    <p className="mt-3 text-on-surface-variant/80 font-body text-sm leading-relaxed transition-colors duration-500">
                        Enter the studio and start shaping your digital presence with atmospheric intelligence.
                    </p>
                </div>
                
                {/* Glass Card */}
                <div className="glass-card rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded mb-6 text-center">{error}</div>}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="space-y-1.5 text-left">
                            <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-1 transition-colors duration-500" htmlFor="name">Full Name</label>
                            <div className="relative input-glow border-b border-white/10 transition-all duration-300">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary/60 text-lg transition-colors duration-500">person</span>
                                <input className="w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-gray-600 pl-8 py-3 text-sm transition-colors duration-500" id="name" placeholder="Auteur Name" type="text" required />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5 text-left">
                            <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-1 transition-colors duration-500" htmlFor="email">Email Identity</label>
                            <div className="relative input-glow border-b border-white/10 transition-all duration-300">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary/60 text-lg transition-colors duration-500">alternate_email</span>
                                <input className="w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-gray-600 pl-8 py-3 text-sm transition-colors duration-500" id="email" placeholder="email@studio.ai" type="email" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password Field */}
                            <div className="space-y-1.5 text-left">
                                <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-1 transition-colors duration-500" htmlFor="password">Secret Key</label>
                                <div className="relative input-glow border-b border-white/10 transition-all duration-300">
                                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary/60 text-lg transition-colors duration-500">lock</span>
                                    <input 
                                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-gray-600 pl-8 pr-8 py-3 text-sm transition-colors duration-500" 
                                        id="password" 
                                        placeholder="••••••••" 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                    />
                                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-on-surface transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                                        <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Confirm Password */}
                            <div className="space-y-1.5 text-left">
                                <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-1 transition-colors duration-500" htmlFor="confirm_password">Verify Secret Key</label>
                                <div className="relative input-glow border-b border-white/10 transition-all duration-300">
                                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary/60 text-lg transition-colors duration-500">verified_user</span>
                                    <input 
                                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-gray-600 pl-8 pr-8 py-3 text-sm transition-colors duration-500" 
                                        id="confirm_password" 
                                        placeholder="••••••••" 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        required 
                                    />
                                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-on-surface transition-colors" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button disabled={loading} className={`w-full jewel-button text-white font-headline font-bold py-4 rounded-lg mt-4 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`} type="submit">
                            {loading ? 'Creating Vision...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-grow h-[1px] bg-white/5 transition-colors duration-500"></div>
                        <span className="px-4 font-label text-[0.6rem] uppercase tracking-[0.2em] text-gray-500 transition-colors duration-500">Or Continue With</span>
                        <div className="flex-grow h-[1px] bg-white/5 transition-colors duration-500"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => signInWithGoogle(setError, setLoading)}
                            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img alt="Google" className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3kAq3GZdfgBLIVfUZJHW9UuOXsmzeeThiVHtvSxnvnDaq1alwPwEj2UuPdbbvDjBKjUXXkHJ3eOa42JUYtL95ll6PvBtXIofSctfOHim9lyqx68EFe44GaQRnMmD_7Mqeqg2TA7qjBB6JMs5cNW6YcSaChf8hRyVCHjEcJdmVygiDhZFkDhnYAtdr0Pcgd614CKN7DQfwx3ZeTtfz4MbIhKSGkoeBgnZlHrlel_NdbV2p0c4PvBpLet9esuKP-gNdme7cmeMHuro"/>
                            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant transition-colors duration-500">Google</span>
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => signInWithGitHub(setError, setLoading)}
                            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4 fill-on-surface-variant opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                            </svg>
                            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant transition-colors duration-500">GitHub</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Secondary Action */}
                <div className="mt-8 text-center pt-8 pb-4">
                    <p className="text-on-surface-variant text-xs font-body transition-colors duration-500">
                        Already have an account? 
                        <Link className="text-primary hover:text-secondary font-bold ml-1 transition-colors underline decoration-primary/20 underline-offset-4" to="/login">Log In</Link>
                    </p>
                </div>
            </div>

            {/* Decorative Glow Blobs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
    );
}

export default Signup;
