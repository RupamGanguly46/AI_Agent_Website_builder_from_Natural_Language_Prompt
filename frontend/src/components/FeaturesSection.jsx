import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '🤖',
    title: 'AI Agents',
    desc: 'LangGraph planner and coder agents iteratively generate, debug, and refine your website code inside a persistent workspace.',
    accent: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
    glow: 'from-purple-500/20',
  },
  {
    icon: '🔄',
    title: 'Git Versioning',
    desc: 'Every AI modification automatically creates a secure Git commit. Roll back to any checkpoint in milliseconds.',
    accent: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    glow: 'from-cyan-500/20',
  },
  {
    icon: '💬',
    title: 'History Tracking',
    desc: 'All prompts, responses, and debugging cycles are stored in MongoDB Atlas for complete project traceability.',
    accent: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    glow: 'from-blue-500/20',
  },
  {
    icon: '⚡',
    title: 'Instant Deploy',
    desc: 'Dev server spins up automatically per project. Preview your site live as the AI builds it in real-time.',
    accent: 'group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]',
    glow: 'from-yellow-500/20',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    desc: 'Your projects live in isolated, persistent workspaces. Credentials and code are never shared or exposed.',
    accent: 'group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]',
    glow: 'from-green-500/20',
  },
  {
    icon: '🌐',
    title: 'Full-Stack Ready',
    desc: 'Generate React frontends, Express APIs, and database schemas—full-stack apps born from a single sentence.',
    accent: 'group-hover:border-pink-500/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
    glow: 'from-pink-500/20',
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      });

      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 60,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 90%' },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-28 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-20">
          <p className="font-inter text-purple-400 uppercase tracking-[0.3em] text-xs mb-4">Platform Capabilities</p>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Everything You Need
          </h2>
          <p className="font-inter text-white/50 mt-4 text-lg max-w-xl mx-auto">
            A full production-grade AI builder packed into a single focused workspace.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 ${f.accent}`}
            >
              {/* Glow bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`} />
              
              <div className="relative z-10">
                <div className="text-4xl mb-5">{f.icon}</div>
                <h3 className="font-inter text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="font-inter text-white/50 leading-relaxed text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
