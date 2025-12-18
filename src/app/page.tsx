"use client";

import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Instagram, Twitter, Mail, Menu, X, ChevronDown, Globe, Maximize2 } from "lucide-react";

// Local path configuration - prioritizing public/images/
const IMAGES = {
  hero: "/hero.jpg",
  gallery: [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg",
    "/img5.jpg",
    "/img6.jpg",
  ],
  fallback: "https://drive.google.com/thumbnail?id=1t3CtsL00dH1mlYA8nLX230UCwgmBGOsA&sz=w2000"
};

const MODEL_DATA = {
  name: "Radhe",
  agency: "Avant Garde Management",
  location: "New York • Paris • Tokyo",
  bio: "A synthesis of human grace and futuristic aesthetic. Radhe redefines the editorial landscape through a lens of digital-age elegance.",
  stats: {
    height: "178cm / 5'10\"",
    bust: "81cm / 32\"",
    waist: "60cm / 23.5\"",
    hips: "88cm / 34.5\"",
    eyes: "Deep Hazel",
  }
};

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Smooth spring for cursor
  const cursorX = useSpring(0, { stiffness: 400, damping: 30 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 30 });

  // Parallax transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const getImageSrc = (path: string) => {
    return imgError[path] ? IMAGES.fallback : path;
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <div className="noise" />
      <div className="scanline-overlay" />
      <motion.div style={{ scaleX: scrollYProgress }} className="progress-bar" />

      {/* Custom Cursor */}
      <motion.div
        className="custom-cursor hidden md:flex"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-8 px-12 mix-blend-difference">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tighter"
        >
          {MODEL_DATA.name.toUpperCase()}
          <span className="text-[10px] block tracking-[0.4em] font-light text-zinc-500 mt-[-5px]">PORTFOLIO '25</span>
        </motion.div>

        <div className="hidden md:flex gap-16 text-[10px] font-bold tracking-[0.3em]">
          {["PORTFOLIO", "ABOUT", "CONTACT"].map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              whileHover={{ scale: 1.1, color: "#3b82f6" }}
              className="hover:text-zinc-400 transition-all duration-300 relative group"
            >
              {link}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        <button
          className="md:hidden p-2 z-[101]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[110vh] w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={getImageSrc(IMAGES.hero)}
            alt={MODEL_DATA.name}
            fill
            className="object-cover object-center md:grayscale md:brightness-75 md:hover:grayscale-0 transition-all duration-1000 ease-in-out"
            priority
            onError={() => setImgError(prev => ({ ...prev, [IMAGES.hero]: true }))}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]" />
        </motion.div>

        <motion.div
          style={{ y: textY }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 glass-morphism text-[10px] tracking-[0.4em] text-blue-400 uppercase"
          >
            <Globe size={12} className="animate-pulse" /> Global Representation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[18vw] md:text-[12vw] font-black leading-none tracking-tighter text-gradient"
          >
            {MODEL_DATA.name.toUpperCase()}
          </motion.h1>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 text-[12px] tracking-[0.5em] text-zinc-500 font-bold uppercase">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Editorial</motion.span>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Campaign</motion.span>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Runway</motion.span>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-zinc-500 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] tracking-[0.5em] uppercase">Scroll to Explore</span>
          <ChevronDown size={20} className="text-blue-500" strokeWidth={1} />
        </motion.div>

        {/* HUD Decoration */}
        <div className="absolute bottom-12 left-12 hidden lg:block text-[9px] tracking-[0.2em] font-mono text-zinc-600 space-y-1">
          <p>LOC: 40.7128° N, 74.0060° W</p>
          <p>FPS: 60 / {new Date().getFullYear()}</p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-32 px-6 flex justify-center">
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl text-center text-xl md:text-3xl font-light italic text-zinc-300 leading-relaxed md:leading-[1.6]"
        >
          "{MODEL_DATA.bio}"
        </motion.p>
      </section>

      {/* Gallery Section */}
      <section id="portfolio" className="py-20 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
            <div>
              <h2 className="text-[10px] tracking-[0.8em] text-blue-500 uppercase mb-4">Portfolio</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter">SELECTED WORKS</h3>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-zinc-600 block mb-2">COLLECTION</span>
              <span className="text-xl font-mono text-zinc-400">01 / 06</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {IMAGES.gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative aspect-[4/5] overflow-hidden glass-morphism p-2"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={getImageSrc(img)}
                    alt={`Works ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover md:grayscale md:group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    onError={() => setImgError(prev => ({ ...prev, [img]: true }))}
                  />
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* OverlayHUD */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 glass-morphism rounded-full hover:bg-white hover:text-black transition-colors">
                      <Maximize2 size={16} />
                    </button>
                  </div>

                  <div className="absolute bottom-8 left-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[8px] tracking-[0.5em] text-blue-400 mb-2 font-mono">SCENE_{i + 1}</p>
                    <h4 className="text-2xl font-black tracking-tighter">EDITORIAL VIEW</h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Magnetic Interaction */}
      <section id="about" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[10px] tracking-[0.8em] text-blue-500 uppercase mb-6">Bio-Data</h2>
            <h3 className="text-5xl md:text-7xl font-black mb-16 tracking-tighter">THE BLUEPRINT</h3>
            <div className="space-y-10">
              {Object.entries(MODEL_DATA.stats).map(([label, value]) => (
                <div key={label} className="group flex justify-between items-end border-b border-white/10 pb-6 overflow-hidden">
                  <span className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase group-hover:text-blue-500 transition-colors">{label}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl md:text-3xl font-light italic tracking-tight">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotateY: 20 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/5] relative glass-morphism p-6 group"
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={getImageSrc(IMAGES.hero)}
                alt="Profile"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(prev => ({ ...prev, [IMAGES.hero]: true }))}
              />
              <div className="absolute inset-0 border-[20px] border-[#050505] z-10" />
            </div>
            {/* Artistic text overlay */}
            <div className="absolute -bottom-10 -right-10 hidden lg:block">
              <span className="text-[15vw] font-black leading-none opacity-5 select-none text-blue-500">RADHE</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-64 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <h2 className="text-[40vw] font-black leading-none">AGENT</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h3 className="text-[10px] tracking-[1em] text-blue-500 uppercase mb-12 animate-pulse">Available Globally</h3>
          <p className="text-2xl md:text-5xl font-light mb-20 max-w-4xl mx-auto leading-tight transition-all hover:text-blue-100 cursor-default">
            Ready to define your next <span className="font-black italic">Visual Era</span>.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="mailto:bookings@radheportfolio.com"
            className="inline-flex items-center gap-6 px-12 py-6 border border-white/20 glass-morphism rounded-full text-[12px] font-bold tracking-[0.4em] hover:bg-white hover:text-black transition-all group"
          >
            INITIATE CONTACT <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 px-12 flex flex-col md:flex-row justify-between items-center gap-12 bg-black/50">
        <div className="flex gap-12 text-zinc-500">
          <Instagram className="hover:text-blue-500 cursor-pointer transition-colors" size={20} />
          <Twitter className="hover:text-blue-500 cursor-pointer transition-colors" size={20} />
          <Mail className="hover:text-blue-500 cursor-pointer transition-colors" size={20} />
        </div>
        <div className="text-zinc-700 text-[10px] tracking-[0.5em] uppercase font-mono">
          © 2025 RDHE-PORTFOLIO-SYS // ALL RIGHTS RESERVED
        </div>
        <div className="flex gap-12 text-[9px] tracking-[0.3em] font-bold text-zinc-600">
          <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
          <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center gap-12 text-5xl font-black"
          >
            {["PORTFOLIO", "ABOUT", "CONTACT"].map((link, i) => (
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="tracking-tighter hover:text-blue-500 transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
