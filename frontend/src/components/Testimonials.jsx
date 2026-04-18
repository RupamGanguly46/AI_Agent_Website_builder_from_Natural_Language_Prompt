import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Aisha Patel',
    role: 'Indie Developer',
    avatar: 'AP',
    gradient: 'from-purple-600 to-violet-800',
    text: 'I shipped a full SaaS landing page in under 2 hours. Nirmana understands intent better than any tool I\'ve used. The Git versioning alone is a game changer.',
    stars: 5,
  },
  {
    name: 'Marcus Chen',
    role: 'Product Designer',
    avatar: 'MC',
    gradient: 'from-cyan-600 to-blue-800',
    text: 'The AI catches its own mistakes and fixes them. I described a "modern portfolio" and got production-quality React code in minutes. Insane.',
    stars: 5,
  },
  {
    name: 'Laura Williams',
    role: 'Startup Founder',
    avatar: 'LW',
    gradient: 'from-pink-600 to-rose-800',
    text: 'We replaced a week of frontend work with a single afternoon session on Nirmana. The agents handle the complexity so we can focus on product.',
    stars: 5,
  },
  {
    name: 'Dev Mehta',
    role: 'Full-Stack Engineer',
    avatar: 'DM',
    gradient: 'from-emerald-600 to-teal-800',
    text: 'Finally an AI builder that outputs real, readable code. No bloat. It even wired up the Express API and MongoDB schema without me asking.',
    stars: 5,
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 40, duration: 0.9,
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Auto-advance every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Animate track position
  useEffect(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, {
      x: `-${active * 100}%`,
      duration: 0.7,
      ease: 'power3.inOut',
    });
  }, [active]);

  return (
    <section ref={sectionRef} className="relative w-full py-28 px-6 bg-[#0a0a0a] overflow-hidden">
      {/* ambient blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div ref={titleRef} className="text-center mb-16">
          <p className="font-inter text-pink-400 uppercase tracking-[0.3em] text-xs mb-4">What Builders Say</p>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Real Stories
          </h2>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden rounded-3xl">
          <div ref={trackRef} className="flex" style={{ width: `${testimonials.length * 100}%` }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ width: `${100 / testimonials.length}%` }} className="px-3">
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(t.stars)].map((_, si) => (
                      <span key={si} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="font-inter text-white/80 text-base sm:text-lg leading-relaxed mb-8 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center font-inter font-bold text-white text-sm flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-inter font-semibold text-white">{t.name}</p>
                      <p className="font-inter text-white/40 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-purple-400 w-6' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
