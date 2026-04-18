import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLightMode, setIsLightMode] = useState(false);
    const { currentUser, logout } = useAuth();

    const handleDashboardClick = (e) => {
        e.preventDefault();
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, [isLightMode]);

    const toggleTheme = () => {
        setIsLightMode(!isLightMode);
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#131313]/60 backdrop-blur-xl border-b border-white/5 transition-colors duration-500">
            <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
                <div className="flex items-center">
                    <Link to="/">
                        <img
                            alt="Nirmana Logo"
                            className="h-8 w-auto object-contain hover:scale-110 transition-transform duration-500"
                            id="theme-logo"
                            src={isLightMode ? "https://i.postimg.cc/T3KpRws9/Light_Logo.png" : "https://i.postimg.cc/8z7j15Yw/Dark_Logo.png"}
                        />
                    </Link>
                </div>

                <div className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2 font-headline tracking-tighter">
                    <a
                        className={`font-bold text-[11px] uppercase tracking-tight transition-all duration-500 cursor-pointer ${location.pathname === '/dashboard' ? 'text-[#adc6ff] border-b border-[#adc6ff]/50 pb-1' : 'text-[#e5e2e1]/70 hover:text-[#adc6ff]'}`}
                        onClick={handleDashboardClick}
                    >
                        Dashboard
                    </a>
                    <Link
                        className="text-[#e5e2e1]/70 hover:text-[#adc6ff] transition-all duration-500 font-bold text-[11px] uppercase tracking-tight"
                        to="#"
                    >
                        Gallery
                    </Link>
                    <Link
                        className="text-[#e5e2e1]/70 hover:text-[#adc6ff] transition-all duration-500 font-bold text-[11px] uppercase tracking-tight"
                        to="#"
                    >
                        Pricing
                    </Link>
                </div>

                <div className="flex items-center space-x-6">
                    <button
                        className="text-[#e5e2e1]/70 hover:text-[#adc6ff] transition-all duration-500 flex items-center justify-center p-2 rounded-full hover:bg-white/5 active:scale-90"
                        id="theme-toggle"
                        onClick={toggleTheme}
                    >
                        <span className="material-symbols-outlined" id="theme-icon">
                            {isLightMode ? 'dark_mode' : 'light_mode'}
                        </span>
                    </button>

                    {currentUser ? (
                        <div className="flex items-center space-x-3">
                            <span
                                className="navbar-username font-body text-[11px] hidden md:block"
                                style={{ color: 'rgba(255,255,255,0.85)', WebkitTextFillColor: 'rgba(255,255,255,0.85)' }}
                            >
                                {currentUser.displayName || currentUser.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="navbar-logout-btn px-4 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white/15 transition-all duration-500 active:scale-95"
                                style={{ color: 'white' }}
                            >
                                Log Out
                            </button>
                            <a onClick={handleDashboardClick} className="cursor-pointer">
                                <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#adc6ff] hover:scale-105 transition-all duration-500 shadow-md scale-95 active:scale-90 border border-white/30">
                                    Dashboard
                                </button>
                            </a>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link to="/login">
                                <button className="text-[#e5e2e1] px-4 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all duration-500 active:scale-95">
                                    Log In
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="text-[#e5e2e1] px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:border-white/30 active:scale-95">
                                    Sign Up
                                </button>
                            </Link>
                            <a onClick={handleDashboardClick} className="cursor-pointer">
                                <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#adc6ff] transition-all duration-500 shadow-[0_20px_50px_rgba(173,198,255,0.05)] scale-95 active:scale-90">
                                    Start Building
                                </button>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

