"use client";

import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram, Twitter, Mail, Menu, X, ChevronDown, Globe, Maximize2, MoveLeft, MoveRight, ArrowLeft, Trash2 } from "lucide-react";
import Lenis from "lenis";

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

interface Wish {
  id: number;
  name: string;
  location: string;
  message: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isWishFormOpen, setIsWishFormOpen] = useState(false);
  const [newWish, setNewWish] = useState({ name: "", location: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply & Delete State
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const wishesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch wishes
  useEffect(() => {
    fetch('/api/wishes')
      .then(res => res.json())
      .then(data => setWishes(data))
      .catch(err => console.error("Failed to fetch wishes", err));
  }, []);

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWish)
      });

      if (res.ok) {
        const savedWish = await res.json();
        setWishes(prev => [savedWish, ...prev]);
        setNewWish({ name: "", location: "", message: "" });
        setIsWishFormOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyingTo || !replyMessage || !adminPassword) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: replyingTo,
          reply: replyMessage,
          password: adminPassword
        })
      });

      if (res.ok) {
        const updatedWish = await res.json();
        setWishes(prev => prev.map(w => w.id === updatedWish.id ? updatedWish : w));
        setReplyingTo(null);
        setAdminPassword("");
        setReplyMessage("");
      } else {
        alert("Failed to reply. Unauthorized?");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingId || !adminPassword) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deletingId,
          password: adminPassword
        })
      });

      if (res.ok) {
        setWishes(prev => prev.filter(w => w.id !== deletingId));
        setDeletingId(null);
        setAdminPassword("");
      } else {
        alert("Failed to delete. Unauthorized?");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollWishes = (direction: 'left' | 'right') => {
    if (wishesContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      wishesContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!selectedImg) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImg(null);
      if (e.key === "ArrowLeft") {
        const currentIndex = IMAGES.gallery.indexOf(selectedImg);
        const prevIndex = (currentIndex - 1 + IMAGES.gallery.length) % IMAGES.gallery.length;
        setSelectedImg(IMAGES.gallery[prevIndex]);
      }
      if (e.key === "ArrowRight") {
        const currentIndex = IMAGES.gallery.indexOf(selectedImg);
        const nextIndex = (currentIndex + 1) % IMAGES.gallery.length;
        setSelectedImg(IMAGES.gallery[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImg]);

  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle effect after scrolling past mostly the hero section
      setIsPastHero(window.scrollY > window.innerHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const getImageSrc = (path: string) => {
    return imgError[path] ? IMAGES.fallback : path;
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <div className="noise" />
      <div className="noise" />
      <motion.div style={{ scaleX: scrollYProgress }} className="progress-bar" />

      {/* BIRTHDAY MARQUEE - ACTIONABLE */}
      <div
        onClick={() => setIsWishFormOpen(true)}
        className="fixed top-0 left-0 w-full bg-[#fce300] text-black z-[200] overflow-hidden py-1 border-b border-black font-bold tracking-[0.2em] text-[10px] md:text-xs cursor-pointer hover:bg-white transition-colors"
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="whitespace-nowrap flex gap-8"
        >
          {Array(10).fill("HAPPY BIRTHDAY RADHE • CLICK TO SIGN THE WALL 🎂 • WISHING YOU STARDOM • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Custom Cursor */}
      <motion.div
        className="custom-cursor hidden md:flex"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-[26px] left-0 w-full z-[101] flex justify-between items-center p-8 px-12 transition-all duration-500 ${isPastHero
          ? "mix-blend-difference bg-transparent"
          : "bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]"
          }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tighter"
        >
          {MODEL_DATA.name.toUpperCase()}
          <span className="text-[10px] block tracking-[0.4em] font-light text-zinc-300 mt-[-5px]">PORTFOLIO '25</span>
        </motion.div>

        <div className="hidden md:flex gap-16 text-[10px] font-bold tracking-[0.3em]">
          {["PORTFOLIO", "ABOUT", "CONTACT"].map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              whileHover={{ scale: 1.1, color: "#ffffff" }}
              className="hover:text-zinc-400 transition-all duration-300 relative group"
            >
              {link}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all group-hover:w-full" />
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
            className="object-cover object-center grayscale md:brightness-75 md:hover:grayscale-0 transition-all duration-1000 ease-in-out"
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
            className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 glass-morphism text-[10px] tracking-[0.4em] text-white md:text-zinc-400 uppercase bg-black/40 md:bg-transparent"
          >
            <Globe size={12} className="animate-pulse" /> Global Representation
          </motion.div>

          <div className="relative">
            <h1 className="text-[18vw] md:text-[12vw] font-black leading-none tracking-tighter text-gradient opacity-0">
              {MODEL_DATA.name.toUpperCase()}
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[18vw] md:text-[12vw] font-black leading-none tracking-tighter text-gradient inline-block">
                {MODEL_DATA.name.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 text-[12px] tracking-[0.5em] text-zinc-200 font-bold uppercase">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Editorial</motion.span>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Campaign</motion.span>
            <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Runway</motion.span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 w-full flex justify-center px-6"
          >
            <button
              onClick={() => setIsWishFormOpen(true)}
              className="w-full md:w-auto px-6 py-4 bg-white text-black font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-black hover:text-white hover:border hover:border-white/20 transition-all rounded-sm flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
            >
              <span>🎂</span> SIGN THE BIRTHDAY WALL FOR RADHIKA
            </button>
          </motion.div>
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

      {/* WISHES GUESTBOOK SECTION (Moved) */}
      {/* WISHES GUESTBOOK SECTION (Horizontal Scroll) */}
      <section id="wishes" className="py-24 relative border-b border-white/5">
        <div className="w-full">
          <div className="px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-[10px] tracking-[0.8em] text-blue-500 uppercase mb-4 animate-pulse">Live Feed</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter">THE WISH WALL</h3>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex gap-2 mr-4">
                <button onClick={() => scrollWishes('left')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-colors rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <button onClick={() => scrollWishes('right')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-colors rounded-full">
                  <ArrowRight size={20} />
                </button>
              </div>

              <button
                onClick={() => setIsWishFormOpen(true)}
                className="px-8 py-4 bg-white text-black font-bold tracking-[0.2em] text-xs hover:bg-blue-500 hover:text-white transition-all rounded-sm uppercase whitespace-nowrap"
              >
                + Scribble a Wish
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={wishesContainerRef}
            className="flex overflow-x-auto gap-8 px-6 md:px-12 pb-12 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {wishes.map((wish) => (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="min-w-[300px] md:min-w-[400px] snap-center p-8 glass-morphism border border-white/10 hover:border-blue-500/50 transition-colors relative group flex flex-col justify-between"
              >
                <div>
                  <div className="absolute top-4 right-4 flex gap-4 text-zinc-600">
                    <button
                      onClick={() => setReplyingTo(wish.id)}
                      className="hover:text-blue-400 transition-colors text-[10px] uppercase tracking-widest font-bold"
                      title="Admin Reply"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setDeletingId(wish.id)}
                      className="hover:text-red-500 transition-colors"
                      title="Delete Wish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 mb-4 uppercase tracking-widest">{wish.location} • {new Date(wish.date).toLocaleDateString()}</p>
                  <p className="text-xl font-light italic mb-8 text-zinc-200">"{wish.message}"</p>

                  {wish.reply && (
                    <div className="mt-8 pl-6 border-l border-blue-500/30">
                      <p className="text-[10px] tracking-widest text-blue-500 uppercase mb-2">Radhe Replied</p>
                      <p className="text-sm text-zinc-300 italic">"{wish.reply}"</p>
                    </div>
                  )}

                  {!wish.reply && <div className="h-[1px] w-12 bg-zinc-500 mb-4 mt-8" />}
                </div>
                {!wish.reply && <p className="font-bold tracking-[0.2em] text-xs uppercase">{wish.name}</p>}
                {wish.reply && <p className="font-bold tracking-[0.2em] text-xs uppercase mt-4 text-right md:text-left">{wish.name}</p>}
              </motion.div>
            ))}
            {wishes.length === 0 && (
              <div className="w-full text-center py-12 text-zinc-500 font-mono text-sm tracking-widest uppercase md:min-w-[400px] flex items-center justify-center">
                No wishes yet. Be the first to sign the wall.
              </div>
            )}
            {/* Spacer for padding right */}
            <div className="min-w-[1px] h-1" />
          </div>
        </div>
      </section>

      {/* Admin Interaction Modal (Reply & Delete) */}
      <AnimatePresence>
        {(replyingTo !== null || deletingId !== null) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1005] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-12 relative"
            >
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setDeletingId(null);
                  setAdminPassword("");
                  setReplyMessage("");
                }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-black tracking-tight mb-8 text-red-500 uppercase">
                {deletingId ? "Delete Protocol" : "Admin Reply"}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Admin Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-2 focus:border-blue-500 outline-none text-xl font-light transition-colors"
                    placeholder="Enter Key"
                  />
                </div>

                {replyingTo && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Reply Message</label>
                    <textarea
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border-b border-white/20 py-2 focus:border-blue-500 outline-none text-xl font-light italic transition-colors resize-none"
                      placeholder="Your response..."
                    />
                  </div>
                )}

                <button
                  onClick={deletingId ? handleDeleteSubmit : handleReplySubmit}
                  disabled={isSubmitting}
                  className={`w-full py-4 font-bold tracking-[0.3em] text-xs uppercase transition-all mt-8 disabled:opacity-50 ${deletingId ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}
                >
                  {isSubmitting ? "PROCESSING..." : (deletingId ? "CONFIRM DELETE" : "POST REPLY")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h2 className="text-[10px] tracking-[0.8em] text-zinc-500 uppercase mb-4">Portfolio</h2>
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
                viewport={{ once: true, margin: "-50px" }}
                className="group relative aspect-[4/5] overflow-hidden glass-morphism p-2"
              >
                {/* Mobile: Colorize on scroll (in-view). Desktop: Hover logic takes precedence via CSS if needed, but in-view provides base reveal. */}
                <motion.div
                  className="relative w-full h-full overflow-hidden cursor-none"
                  onClick={() => setSelectedImg(img)}
                  viewport={{ once: false, margin: "-20%" }} // Trigger continually as you scroll
                  whileInView={{ filter: "grayscale(0%)" }} // Force color when in focus
                  initial={{ filter: "grayscale(100%)" }}   // Start gray
                  transition={{ duration: 1 }}
                >
                  <Image
                    src={getImageSrc(img)}
                    alt={`Works ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover md:grayscale md:group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    onError={() => setImgError(prev => ({ ...prev, [img]: true }))}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* OverlayHUD */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 glass-morphism rounded-full hover:bg-white hover:text-black transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImg(img);
                      }}
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>

                  <div className="absolute bottom-8 left-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[8px] tracking-[0.5em] text-blue-400 mb-2 font-mono">SCENE_{i + 1}</p>
                    <h4 className="text-2xl font-black tracking-tighter">EDITORIAL VIEW</h4>
                  </div>
                </motion.div>
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
            <h2 className="text-[10px] tracking-[0.8em] text-zinc-500 uppercase mb-6">Bio-Data</h2>
            <h3 className="text-5xl md:text-7xl font-black mb-16 tracking-tighter">THE BLUEPRINT</h3>
            <div className="space-y-10">
              {Object.entries(MODEL_DATA.stats).map(([label, value]) => (
                <div key={label} className="group flex justify-between items-end border-b border-white/10 pb-6 overflow-hidden">
                  <span className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase group-hover:text-blue-500 transition-colors">{label}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl md:text-3xl font-light italic tracking-tight">
                      {value}
                    </span>
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



      {/* Wish Form Modal */}
      <AnimatePresence>
        {isWishFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1005] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-12 relative"
            >
              <button onClick={() => setIsWishFormOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>

              <h3 className="text-2xl font-black tracking-tight mb-8">LEAVE A MARK</h3>

              <form onSubmit={handleWishSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Your Name</label>
                  <input
                    required
                    value={newWish.name}
                    onChange={e => setNewWish(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/20 py-2 focus:border-blue-500 outline-none text-xl font-light transition-colors"
                    placeholder="e.g. Alex Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Location</label>
                  <input
                    value={newWish.location}
                    onChange={e => setNewWish(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/20 py-2 focus:border-blue-500 outline-none text-xl font-light transition-colors"
                    placeholder="e.g. Paris, France"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Message</label>
                  <textarea
                    required
                    value={newWish.message}
                    onChange={e => setNewWish(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full bg-transparent border-b border-white/20 py-2 focus:border-blue-500 outline-none text-xl font-light italic transition-colors resize-none"
                    placeholder="Write something nice..."
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white text-black font-bold tracking-[0.3em] text-xs uppercase hover:bg-blue-500 hover:text-white transition-all mt-8 disabled:opacity-50"
                >
                  {isSubmitting ? "SENDING..." : "POST WISH"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            href="mailto:radhikahegde2001@gmail.com"
            className="inline-flex items-center gap-6 px-12 py-6 border border-white/20 glass-morphism rounded-full text-[12px] font-bold tracking-[0.4em] hover:bg-white hover:text-black transition-all group"
          >
            INITIATE CONTACT <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 px-12 flex flex-col md:flex-row justify-between items-center gap-12 bg-black/50">
        <div className="flex gap-12 text-zinc-500">
          <a href="https://www.instagram.com/_.ra_dhi/" target="_blank" rel="noopener noreferrer">
            <Instagram className="hover:text-white cursor-pointer transition-colors" size={20} />
          </a>
          <Twitter className="hover:text-white cursor-pointer transition-colors" size={20} />
          <a href="mailto:radhikahegde2001@gmail.com">
            <Mail className="hover:text-white cursor-pointer transition-colors" size={20} />
          </a>
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

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImg(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-8 right-8 z-[1001] p-4 text-white hover:text-blue-500 transition-colors"
              onClick={() => setSelectedImg(null)}
            >
              <X size={32} />
            </button>

            {/* Navigation Buttons */}
            <button
              className="absolute top-1/2 left-8 -translate-y-1/2 hidden md:block text-zinc-600 hover:text-white transition-colors p-4 z-[1002]"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = IMAGES.gallery.indexOf(selectedImg);
                const prevIndex = (currentIndex - 1 + IMAGES.gallery.length) % IMAGES.gallery.length;
                setSelectedImg(IMAGES.gallery[prevIndex]);
              }}
            >
              <MoveLeft size={48} />
            </button>

            <button
              className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block text-zinc-600 hover:text-white transition-colors p-4 z-[1002]"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = IMAGES.gallery.indexOf(selectedImg);
                const nextIndex = (currentIndex + 1) % IMAGES.gallery.length;
                setSelectedImg(IMAGES.gallery[nextIndex]);
              }}
            >
              <MoveRight size={48} />
            </button>

            <motion.div
              key={selectedImg}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-[80vh] md:h-full max-w-7xl select-none flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getImageSrc(selectedImg)}
                alt="Selected Work"
                fill
                className="object-contain"
                priority
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] tracking-[0.5em] text-blue-500 uppercase font-mono mb-2">High Resolution Preview</p>
                <div className="h-[1px] w-full bg-white/20" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main >
  );
}
