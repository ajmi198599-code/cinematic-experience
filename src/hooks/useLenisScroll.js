import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useLenisScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      ScrollTrigger.normalizeScroll(false);
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    window.__obsidianLenis = lenis;

    const updateScrollTrigger = () => ScrollTrigger.update();
    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (window.__obsidianLenis === lenis) {
        delete window.__obsidianLenis;
      }
    };
  }, []);

  return lenisRef;
}
