import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const tags = ['AI Generated', 'React & Vite', 'MERN Stack', 'Git Versioning', 'Realtime Edits', 'LangGraph Powered', 'TypeScript', 'No-Code Friendly'];

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'How It Works', 'Pricing', 'Changelog'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'GitHub', 'Status'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
];

export default function Footer() {
  const carouselRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current?.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.7,
        scrollTrigger: { trigger: footerRef.current, start: 'top 90%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Infinite Tech-Stack Ticker */}
      <div className="w-full py-5 bg-[#06060e] border-y border-white/[0.05] overflow-hidden flex">
        <div className="flex w-max animate-infinite-scroll" aria-hidden>
          {[...tags, ...tags, ...tags, ...tags].map((tag, i) => (
            <div key={i} className="flex items-center gap-6 mx-8 flex-shrink-0">
              <span className="font-inter text-white/30 whitespace-nowrap uppercase tracking-widest text-sm">
                {tag}
              </span>
              <span className="text-purple-500/40 text-xs">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative w-full bg-[#0a0a0a] border-t border-white/[0.05] pt-20 pb-10 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-900/10 blur-[80px] pointer-events-none" />

        <div ref={footerRef} className="max-w-6xl mx-auto relative z-10">
          {/* Top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/20 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  <img
                    src="/Logo.png"
                    alt="Nirmana"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-inter font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Nirmana
                </span>
              </div>
              <p className="font-inter text-white/35 text-sm leading-relaxed">
                Build the web with intelligence. The AI-powered platform for next-generation developers.
              </p>
            </div>

            {/* Link columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="font-inter font-semibold text-white/70 text-sm mb-5 uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="font-inter text-white/35 text-sm hover:text-white/80 transition-colors duration-200"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom divider */}
          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-inter text-white/25 text-xs">
              © {new Date().getFullYear()} Nirmana. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((l) => (
                <a key={l} href="#" className="font-inter text-white/25 text-xs hover:text-white/50 transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
