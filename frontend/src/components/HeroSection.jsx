import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const scrollIndRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in hero text on load
      gsap.from(textRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Fade out scroll indicator
      gsap.to(scrollIndRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=300',
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen flex items-end justify-center overflow-hidden bg-[#0a0a0a] -mt-[60px]"
    >
      {/* Bottom gradient fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* Minimal overlay text on canvas */}
      <div ref={textRef} className="relative z-20 pb-28 text-center px-4">
        <p className="font-inter text-white/40 uppercase tracking-[0.4em] text-xs sm:text-sm mb-3">
          Introducing
        </p>
        <h1 className="font-playfair text-5xl sm:text-7xl md:text-9xl font-bold text-white leading-none tracking-tight drop-shadow-2xl">
          Nirmana
        </h1>
        <p className="font-inter text-white/50 mt-4 text-base sm:text-lg tracking-widest uppercase">
          Build the web with intelligence
        </p>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollIndRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="font-inter text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
