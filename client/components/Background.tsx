import React from "react";

/**
 * Decorative, non-interactive background layers.
 * Lightweight: purely CSS-driven, GPU-accelerated transforms and opacity animations.
 * Respects prefers-reduced-motion.
 */
export default function Background() {
  const images = [
    "/images/pic1.jpg",
    "/images/pic2.jpg",
    "/images/pic3.jpg",
  ];

  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [index, setIndex] = React.useState(0);

  // Preload images
  React.useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Rotation interval
  React.useEffect(() => {
    if (prefersReduced || images.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 8000);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  return (
    <div aria-hidden="true" className="app-bg pointer-events-none fixed inset-0">
      {/* Image layers (crossfade) */}
      {images.map((src, i) => (
        <div
          key={src}
          className={`bg-layer bg-image ${i === index ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      <div className="bg-layer bg-gradient" />

      {/* Large blurred color blobs (keeps previous look) */}
      <div className="bg-layer bg-blob bg-blob-1" />
      <div className="bg-layer bg-blob bg-blob-2" />

      {/* Decorative SVG artwork layers (inline so no external assets needed) */}
      <svg className="bg-svg bg-svg-1" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <g fill="none" strokeWidth="1.2" stroke="rgba(255,255,255,0.06)">
          <path d="M0 120 C200 40 600 200 800 120 L800 0 L0 0 Z" />
          <path d="M0 240 C200 160 600 320 800 240 L800 100 L0 100 Z" />
        </g>
      </svg>

      <svg className="bg-svg bg-svg-2" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g2)" />
        <g fill="rgba(255,255,255,0.02)">
          <circle cx="120" cy="80" r="40" />
          <circle cx="680" cy="520" r="60" />
        </g>
      </svg>

      <div className="bg-pattern" />
    </div>
  );
}
