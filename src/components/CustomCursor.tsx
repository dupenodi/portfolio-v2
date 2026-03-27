"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let hovering = false;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    document.addEventListener("mousemove", onMove);

    const addHover = (e: Event) => { void e; hovering = true; };
    const removeHover = (e: Event) => { void e; hovering = false; };

    const bindHover = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.addEventListener("mouseenter", addHover);
        el.addEventListener("mouseleave", removeHover);
      });
    };

    bindHover();
    const observer = new MutationObserver(bindHover);
    observer.observe(document.body, { childList: true, subtree: true });

    const tick = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      }
      if (ringRef.current) {
        const s = hovering ? 1.8 : 1;
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(${s})`;
        ringRef.current.style.opacity = hovering ? "1" : "0.5";
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-violet-400 rounded-full pointer-events-none z-[9999]"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 border border-violet-400 rounded-full pointer-events-none z-[9998] transition-[opacity,transform] duration-200"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
