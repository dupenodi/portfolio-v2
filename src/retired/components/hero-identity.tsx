"use client";

import { useEffect, useRef, useState } from "react";
import { useScramble } from "use-scramble";
import { site } from "@/lib/site";

const NAMES = [site.identity.primary, site.identity.alt] as const;
const HOLD_MS = 4500;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function HeroIdentityScramble() {
  const [index, setIndex] = useState(0);
  const holdRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skipReplay = useRef(true);
  const text = NAMES[index];

  const { ref, replay } = useScramble({
    text,
    speed: 0.5,
    tick: 1,
    step: 1,
    scramble: 5,
    seed: 3,
    overdrive: true,
    onAnimationEnd: () => {
      holdRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % NAMES.length);
      }, HOLD_MS);
    },
  });

  useEffect(() => {
    if (skipReplay.current) {
      skipReplay.current = false;
      return;
    }
    replay();
  }, [index, replay]);

  useEffect(() => () => clearTimeout(holdRef.current), []);

  return (
    <span
      ref={ref}
      className="hero-identity"
      aria-label={`${site.identity.primary}, also ${site.identity.alt}`}
    >
      {site.identity.primary}
    </span>
  );
}

function HeroIdentitySwap() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % NAMES.length);
    }, HOLD_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <span className="hero-identity" aria-label={`${site.identity.primary}, also ${site.identity.alt}`}>
      {NAMES[index]}
    </span>
  );
}

export function HeroIdentity() {
  const reducedMotion = useReducedMotion();

  return (
    <span className="hero-identity-wrap">
      {reducedMotion ? <HeroIdentitySwap /> : <HeroIdentityScramble />}
    </span>
  );
}
