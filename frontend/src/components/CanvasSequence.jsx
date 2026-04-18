import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CanvasSequence({ frameCount = 298 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const playhead = useRef({ frame: 0 }); // Use an object so GSAP can animate the property

  // 1. Preload all frames
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];
    
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Zero-pad frame index to matching naming (e.g. frame_0001.jpg)
        const paddedIndex = String(i).padStart(4, '0');
        img.src = `/frames/frame_${paddedIndex}.jpg`;
        
        img.onload = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
                setImages(loadedImages);
                setLoaded(true);
            }
        };
        img.onerror = () => {
            // Handle missing image gracefully
            console.warn(`Failed to track frame ${paddedIndex}`);
            loadedCount++;
            if (loadedCount === frameCount) {
              setImages(loadedImages);
              setLoaded(true);
            }
        };
        loadedImages.push(img);
    }
  }, [frameCount]);

  // 2. Set up animation timeline
  useEffect(() => {
    if (!loaded || !canvasRef.current || !containerRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Canvas scaling and initial draw
    const renderFrame = () => {
        if (!images[Math.floor(playhead.current.frame)]) return;
        const img = images[Math.floor(playhead.current.frame)];
        
        // Ensure image is actually fully loaded (ignoring errored out frames)
        if (!img.complete || img.naturalWidth === 0) return;

        // Maintain aspect ratio (object-cover equivalent for canvas)
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let drawX = 0;
        let drawY = 0;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image
            drawHeight = drawWidth / imgRatio;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            // Image is wider than canvas
            drawWidth = drawHeight * imgRatio;
            drawX = (canvas.width - drawWidth) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const blockResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame();
    };

    blockResize();
    window.addEventListener('resize', blockResize);

    // Initial draw
    renderFrame();

    // GSAP ScrollTrigger Sequence
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=400%", // 400vh for long pinning
            pin: true,
            scrub: 1, // Smooth dampening
            anticipatePin: 1
        }
    });

    // Animate Frames
    tl.to(playhead.current, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: renderFrame,
        duration: 1 // Baseline duration for entire scrub ratio
    }, 0);

    return () => {
        window.removeEventListener('resize', blockResize);
        ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loaded, images, frameCount]);

  if (!loaded) {
      return (
          <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-white/50 font-inter">
              Loading High-Performance Assets...
          </div>
      );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden flex-shrink-0">
      
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

    </div>
  );
}
