import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProject } from '../api/api';
import { useAuth } from '../context/AuthContext';

const CAROUSEL_ITEMS = [
    {
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG8mkgfF89F2aqgbsAA52r1IAePJiuujtFWWvDhpSWP79szYOJHrUF3UHcLDkzR0Ci4C756Pb0E4pfqNtVJp7_XnN4CY64PMwW09pupdS-uxaiteTrE-h2QUbIZns-ojsUcr9Q5UjGgbojFRcxtD55gBAp-F_hfb3ZcNNArDK11Ufvg_oOQgvoBORv5OLS6b2q4g1uhPNAyp5FtaDqoRnRwXT0T-B9EeU_rJG439ojLDKG6Za6Zfd0AbtpaPhPk368UYCLfVNOBWY",
        tag: "Visionary Interface",
        title: "DATA SYNTHESIS"
    },
    {
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiIkpO0P3TrSOXGLP8HAUBPomk8G4gWAAtapXGo9TgrUYkXOAGPahuaQ7OtAFUaIIgXlS9ktolkdm58sI_tdDMQL-eGHVBMz6XiZGWQAFs4KfOcXr7MgP9lu9sl_0IMbAE2ZXCJjcQsTsWQq3Tv0xGygKu5rNBOpm7K0BnhhgjahUBW0vd9XBJ08lZ033DtKPpM0riSChgwGVfs-hDfgc0S0ItrUebPPGalO2l2liUo2d4EW5-PYkVTNqpW2Ye6MkC0BQ2imeUDbQ",
        tag: "Human Centric",
        title: "EMOTIVE DESIGN"
    },
    {
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaF_IS6_37n9TFg8Djhllxauf5BaOb5dEGKia84Uue33i6E8xIfIVzBQMWMrL6LQxEqkm5KSXFTisP0SsGZzXoFOiTJ3TpywNCk_HC5ieSP5PVYJMPD7Xrj-MHVtOIHjlkutHbWi6VsdBzffbtYEoeSwFylahRCSYVUDmi_Dlih1h6SiWDnVCiS59ghAe7Z2xyDJSGQahvae4cqiH93iNUMHcMn9c_TeFKklsCxkfPKa0ACwDTJ_wW3e56OklZ2p3ljff_CVonTbg",
        tag: "Neural Core",
        title: "AGENCY EVOLVED"
    }
];

function Home() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const brandRef = useRef(null);
    const carouselRef = useRef(null);

    const handleCreate = async () => {
        if (!projectName.trim()) return;
        setIsCreating(true);
        try {
            const { data } = await createProject(projectName.trim());
            navigate(`/workspace/${data.projectId}`);
        } catch (err) {
            alert('Failed to create project: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            if (brandRef.current && brandRef.current.offsetParent) {
                const rect = brandRef.current.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                if (rect.top < viewHeight && rect.bottom > 0) {
                    const val = (scrolled - (brandRef.current.offsetTop + brandRef.current.offsetParent.offsetTop)) * 0.1;
                    brandRef.current.style.transform = `translateY(${val}px)`;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        let lastTime = 0;
        let accumulator = 0;
        const speed = 0.08; // Change this value to make it slower or faster (pixels per millisecond)
        let animationFrameId;

        const autoScroll = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            const carousel = carouselRef.current;
            if (carousel && carousel.children.length > 0 && !carousel.matches(':hover')) {
                accumulator += delta * speed;
                if (accumulator >= 1) {
                    const pixels = Math.floor(accumulator);
                    accumulator -= pixels;
                    
                    const firstChild = carousel.children[0];
                    if (carousel.scrollLeft >= firstChild.offsetWidth) {
                        carousel.scrollLeft -= firstChild.offsetWidth;
                    } else {
                        carousel.scrollLeft += pixels;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };
        animationFrameId = requestAnimationFrame(autoScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="home-container overflow-hidden pt-16">
            {/* 1. Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-surface transition-colors duration-500">
                <video autoPlay className="absolute w-full h-full object-cover opacity-20 scale-110 blur-[1px]" loop muted playsInline>
                    <source src="https://storage.googleapis.com/uxpilot-auth.appspot.com/62c0e8623e-63806f4c78572ce34661.mp4" type="video/mp4"/>
                </video>
                <div className="relative z-10 text-center px-6 reveal active">
                    <p className="text-primary uppercase tracking-[0.8em] font-label text-[10px] mb-12 heading-glow">Digital Auteur Experience</p>
                    <h1 className="font-headline font-black tracking-tighter text-on-background leading-[0.85] max-w-[90vw] mx-auto italic hero-title">
                        CRAFTING <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary">REALITIES</span>
                    </h1>
                </div>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                    <span className="material-symbols-outlined text-3xl">keyboard_double_arrow_down</span>
                </div>
            </section>

            {/* 2. Brand Parallax Section */}
            <section className="py-64 md:py-96 relative overflow-hidden bg-surface transition-colors duration-500">
                <div className="container mx-auto px-6 text-center reveal">
                    <div className="relative inline-block group">
                        <div className="absolute -inset-40 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
                        <h2 ref={brandRef} className="massive-type font-headline font-black cursor-pointer transition-all duration-1000 select-none tracking-[-0.08em] hover:tracking-[-0.05em] parallax-text vibrant-glow-blue" onClick={() => navigate('/')}>
                            NIRMANA
                        </h2>
                    </div>
                </div>
            </section>

            {/* 3. Capabilities Section */}
            <section className="py-32 relative bg-surface transition-colors duration-500">
                <div className="container mx-auto px-8 relative z-10">
                    <div className="mb-24 reveal text-center md:text-left">
                        <span className="text-primary font-label text-[10px] tracking-[0.5em] uppercase mb-4 block heading-glow">Core Architecture</span>
                        <h3 className="font-headline text-6xl md:text-8xl font-black tracking-tighter fix-clipping">THE ECOSYSTEM</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { icon: 'neurology', title: 'Prompt-Based', color: 'glow-blue', textColor: 'text-primary' },
                            { icon: 'terminal', title: 'Developer Control', color: 'glow-purple', textColor: 'text-secondary' },
                            { icon: 'bolt', title: 'Instant Preview', color: 'glow-gold', textColor: 'text-tertiary' },
                            { icon: 'history', title: 'Smart Versioning', color: 'glow-blue', textColor: 'text-primary' },
                            { icon: 'forum', title: 'Persistent Chat', color: 'glow-purple', textColor: 'text-secondary' },
                            { icon: 'bug_report', title: 'Debug Console', color: 'glow-gold', textColor: 'text-tertiary' },
                            { icon: 'smart_toy', title: 'Multi-Agent AI', color: 'glow-blue', textColor: 'text-primary' },
                            { icon: 'package_2', title: 'Full Code Access', color: 'glow-purple', textColor: 'text-secondary' },
                            { icon: 'palette', title: 'Smart UI', color: 'glow-gold', textColor: 'text-tertiary' },
                            { icon: 'rocket_launch', title: 'One-Click Deploy', color: 'glow-blue', textColor: 'text-primary' }
                        ].map((item, idx) => (
                            <div key={idx} className={`glass-card p-10 group ${item.color}`}>
                                <span className={`material-symbols-outlined text-4xl ${item.textColor} mb-8 group-hover:scale-110 transition-transform`}>{item.icon}</span>
                                <h4 className="font-headline text-lg font-bold mb-3 tracking-tight">{item.title}</h4>
                                <p className="text-on-surface/40 text-[11px] leading-relaxed">Built continuously with your guidance to exceed constraints.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Carousel Section */}
            <section className="py-48 bg-surface overflow-hidden transition-colors duration-500">
                <div className="container mx-auto px-8 mb-24 reveal">
                    <h3 className="font-headline text-6xl md:text-[10vw] font-black text-right tracking-tighter uppercase vibrant-glow-blue fix-clipping">Excellence</h3>
                </div>
                <div ref={carouselRef} className="flex overflow-x-auto hide-scrollbar pb-24">
                    <div className="flex gap-8 pr-8 flex-shrink-0">
                        {CAROUSEL_ITEMS.map((item, idx) => (
                            <div key={`set1-${idx}`} className="min-w-[350px] md:min-w-[900px] h-[600px] relative group overflow-hidden flex-shrink-0">
                                <img alt={item.tag} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" src={item.img} />
                                <div className="absolute inset-0 cinematic-overlay opacity-100 bg-gradient-to-t from-[#000000cc] via-[#00000066] to-transparent transition-opacity duration-500 flex flex-col justify-end p-12">
                                    <span className="always-white font-bold tracking-widest text-[10px] mb-2 uppercase shadow-black drop-shadow-md" style={{ color: '#ffffff' }}>{item.tag}</span>
                                    <h4 className="always-white text-4xl font-black tracking-tighter fix-clipping drop-shadow-lg" style={{ color: '#ffffff' }}>{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-8 pr-8 flex-shrink-0" aria-hidden="true">
                        {CAROUSEL_ITEMS.map((item, idx) => (
                            <div key={`set2-${idx}`} className="min-w-[350px] md:min-w-[900px] h-[600px] relative group overflow-hidden flex-shrink-0">
                                <img alt={item.tag} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" src={item.img} />
                                <div className="absolute inset-0 cinematic-overlay opacity-100 bg-gradient-to-t from-[#000000cc] via-[#00000066] to-transparent transition-opacity duration-500 flex flex-col justify-end p-12">
                                    <span className="always-white font-bold tracking-widest text-[10px] mb-2 uppercase shadow-black drop-shadow-md" style={{ color: '#ffffff' }}>{item.tag}</span>
                                    <h4 className="always-white text-4xl font-black tracking-tighter fix-clipping drop-shadow-lg" style={{ color: '#ffffff' }}>{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Forge Process */}
            <section className="py-48 bg-surface transition-colors duration-500">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-48">
                        <div className="reveal border-l border-white/10 pl-8 group">
                            <span className="text-7xl font-black mb-6 block vibrant-glow-blue">01</span>
                            <h4 className="text-2xl font-black mb-4 uppercase italic">Input</h4>
                            <p className="text-white/40 text-xs leading-relaxed uppercase tracking-tighter">Seed your intent. Natural language requirements translated to blueprints.</p>
                        </div>
                        <div className="reveal border-l border-white/10 pl-8 group" style={{transitionDelay: "100ms"}}>
                            <span className="text-7xl font-black mb-6 block vibrant-glow-blue">02</span>
                            <h4 className="text-2xl font-black mb-4 uppercase italic">Swarm</h4>
                            <p className="text-white/40 text-xs leading-relaxed uppercase tracking-tighter">Multi-agent nodes deliberate and co-author rapidly.</p>
                        </div>
                        <div className="reveal border-l border-white/10 pl-8 group" style={{transitionDelay: "200ms"}}>
                            <span className="text-7xl font-black mb-6 block vibrant-glow-blue">03</span>
                            <h4 className="text-2xl font-black mb-4 uppercase italic">Forge</h4>
                            <p className="text-white/40 text-xs leading-relaxed uppercase tracking-tighter">The system compiles design systems from logic.</p>
                        </div>
                        <div className="reveal border-l border-white/10 pl-8 group" style={{transitionDelay: "300ms"}}>
                            <span className="text-7xl font-black mb-6 block vibrant-glow-blue">04</span>
                            <h4 className="text-2xl font-black mb-4 uppercase italic">Manifest</h4>
                            <p className="text-white/40 text-xs leading-relaxed uppercase tracking-tighter">Deploy to the edge. A living web element ready for the world.</p>
                        </div>
                    </div>

                    <div className="reveal text-center relative py-32">
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <div className="w-[600px] h-[600px] bg-primary/20 blur-[150px] animate-pulse"></div>
                        </div>
                        <h2 className="font-headline text-5xl md:text-8xl font-black tracking-tighter mb-16 relative z-10 fix-clipping">MANIFEST YOUR REALITY.</h2>
                        <div className="relative z-10 flex flex-col items-center">
                            <button 
                                className="bg-primary hover:bg-white text-black px-16 py-8 rounded-full font-black text-2xl uppercase tracking-tighter transition-all duration-700 shadow-[0_0_80px_rgba(173,198,255,0.4)] hover:shadow-[0_0_120px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95"
                                onClick={() => currentUser ? navigate('/dashboard') : navigate('/login')}
                            >
                                Start Building Now
                            </button>
                            <p className="mt-8 text-white/20 uppercase tracking-[0.5em] text-[9px] font-bold">Limited Studio Access Available</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create Project Modal */}
            {showModal && (
                <div className="modal-overlay z-[100]" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Project</h2>
                        <p>Give your project a name to get started.</p>
                        <input
                            type="text"
                            className="input"
                            id="project-name-input"
                            placeholder="My Awesome Website"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                id="confirm-create-btn"
                                onClick={handleCreate}
                                disabled={isCreating || !projectName.trim()}
                            >
                                {isCreating ? (
                                    <>
                                        <span className="loading-spinner" /> Creating...
                                    </>
                                ) : (
                                    'Create Project'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
