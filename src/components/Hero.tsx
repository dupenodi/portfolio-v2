"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

function useParticles(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COUNT = 90;
    const COLORS = ["#8b5cf6", "#7c3aed", "#22d3ee", "#06b6d4"];
    const CONNECT_DIST = 130;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.12;
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "55";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [ref]);
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl"
        >
          {/* Availability badge */}
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs tracking-widest font-medium uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Available for opportunities
            </span>
          </motion.div>

          {/* Name */}
          <motion.div variants={fadeUp} className="mb-6">
            <h1 className="font-display font-black leading-[0.9] tracking-tighter select-none">
              <span className="block text-white" style={{ fontSize: "clamp(72px, 14vw, 200px)" }}>
                SARATH
              </span>
              <span
                className="block gradient-text"
                style={{ fontSize: "clamp(72px, 14vw, 200px)" }}
              >
                DONEPUDI
              </span>
            </h1>
          </motion.div>

          {/* Role */}
          <motion.p
            variants={fadeUp}
            className="text-slate-400 text-lg md:text-xl font-light mb-2"
          >
            Full Stack AI Developer
            <span className="mx-3 text-slate-700">·</span>
            Founding Engineer{" "}
            <span className="text-violet-400">@ Niti AI</span>
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="text-slate-500 text-sm md:text-base max-w-xl mb-12 leading-relaxed"
          >
            Building AI-first infrastructure — from sleek interfaces to robust backends,
            LLM pipelines to agent architectures.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link
              href="#projects"
              className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              View Work
            </Link>
            <Link
              href="#contact"
              className="px-8 py-3.5 border border-white/10 hover:border-white/25 text-white font-semibold rounded-full transition-all duration-200 backdrop-blur-sm hover:bg-white/5"
            >
              Get in Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-600 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 border border-white/15 rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 bg-violet-400/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
