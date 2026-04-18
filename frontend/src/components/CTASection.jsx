import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection({ onStart, onDashboard }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        opacity: 0,
        scale: 0.96,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-32 px-6 overflow-hidden bg-[#060610]">
      {/* Large ambient glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] bg-purple-700/10 rounded-full blur-[120px]" />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-700/8 rounded-full blur-[120px] pointer-events-none" />

      <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-inter tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI-Powered Generation
        </div>

        <h2 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight mb-6">
          Stop Writing Code.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400">
            Start Commanding It.
          </span>
        </h2>

        <p className="font-inter text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          Nirmana turns your ideas into full-stack web applications in minutes.
          Describe, iterate, and ship—without writing a single line of boilerplate.
        </p>

        <div className="flex flex-wrap justify-center gap-5">
          <button
            id="cta-start-btn"
            onClick={onStart}
            className="group relative px-10 py-4 rounded-full font-inter font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transform hover:-translate-y-1 text-lg"
          >
            Start Building Free
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </button>
          <button
            onClick={onDashboard}
            className="px-10 py-4 rounded-full font-inter font-semibold border border-white/15 text-white/80 hover:bg-white/5 hover:border-white/30 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-lg"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
