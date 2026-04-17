import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Describe Your Vision',
    desc: 'Type what you want in plain English. A landing page, a dashboard, an e-commerce store—Nirmana understands context.',
    color: 'from-purple-500 to-purple-700',
    glow: 'rgba(124,58,237,0.3)',
  },
  {
    num: '02',
    title: 'AI Builds Instantly',
    desc: 'LangGraph agents plan the architecture and write the code in parallel. Your site materializes in real time inside the preview.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    num: '03',
    title: 'Iterate with Prompts',
    desc: 'Dislike the hero section? Just say so. AI re-runs and patches only what changed. Every edit is versioned automatically.',
    color: 'from-violet-500 to-pink-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    num: '04',
    title: 'Export & Ship',
    desc: 'Download your vite-ready code or deploy directly. A real project—not a screenshot—delivered by AI.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 40, duration: 0.9,
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      });

      stepsRef.current.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          x: i % 2 === 0 ? -50 : 50,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-28 px-6 bg-[#080810] overflow-hidden">
      {/* bg glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div ref={titleRef} className="text-center mb-20">
          <p className="font-inter text-cyan-400 uppercase tracking-[0.3em] text-xs mb-4">The Process</p>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-white">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s, i) => (
            <div
              key={i}
              ref={(el) => (stepsRef.current[i] = el)}
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/10"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} mb-6 shadow-lg`}
                style={{ boxShadow: `0 0 20px ${s.glow}` }}>
                <span className="font-playfair font-bold text-white text-xl">{s.num}</span>
              </div>
              <h3 className="font-inter text-xl font-semibold text-white mb-3">{s.title}</h3>
              <p className="font-inter text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
