import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Mail, Sparkles, X } from "lucide-react";
import { Atmosphere } from "./components/Atmosphere.jsx";
import { BottleStage } from "./components/BottleStage.jsx";
import { ProductCards } from "./components/ProductCards.jsx";
import { InteractiveProduct } from "./components/InteractiveProduct.jsx";
import { SignatureFooter } from "./components/SignatureFooter.jsx";
import { useLenisScroll } from "./hooks/useLenisScroll.js";

gsap.registerPlugin(ScrollTrigger);

const scentNotes = ["Oud", "Amber", "Saffron", "Smoked Vanilla", "Black Pepper", "Leather", "Musk"];

function LockView({ active, onClose }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  if (!active) return null;

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <div className="lock-view" onPointerMove={handlePointer}>
      <Atmosphere />
      <button className="back-to-scroll" type="button" onClick={onClose}>
        <X size={18} />
        BACK TO SCROLL
      </button>
      <div className="lock-copy">
        <p className="eyebrow">Locked product view</p>
        <h2>Rotate the ritual.</h2>
      </div>
      <div className="lock-bottle">
        <BottleStage locked pointer={pointer} active={active} />
      </div>
    </div>
  );
}

export default function App() {
  const appRef = useRef(null);
  const productRef = useRef(null);
  const lenisRef = useLenisScroll();
  const [locked, setLocked] = useState(false);
  const [productActive, setProductActive] = useState(true);

  const noteAngles = useMemo(
    () => scentNotes.map((_, index) => (index / scentNotes.length) * Math.PI * 2 - Math.PI / 2),
    [],
  );

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    setProductActive(true);

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 720px)").matches;
      const motion = isMobile ? 0.5 : 1;

      gsap.defaults({ overwrite: "auto" });
      gsap.set(productRef.current, { clearProps: "all", opacity: 1 });

      gsap.set(".hero-title .word", { yPercent: 46, opacity: 0 });
      gsap.set(".hero-kicker, .hero-subtitle, .hero-signature, .begin-ritual", {
        opacity: 0,
        y: 24,
      });
      gsap.set(".scene-left-copy", { opacity: 0, x: -70 * motion });
      gsap.set(".scent-note", { opacity: 0, scale: 0.84 });
      gsap.set(".ritual-line", { opacity: 0, yPercent: 42 });
      gsap.set(".archive-card", { opacity: 0, y: 90 * motion, rotateX: 8 });
      gsap.set(".interactive-grid", { opacity: 0.88, y: 20 * motion });
      gsap.set(".final-content > *", { opacity: 0, y: 36 * motion });
      gsap.set(".note-line", { scaleX: 0, opacity: 0 });
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(".hero-title .word", { yPercent: 0, opacity: 1, stagger: 0.12, duration: 1.0 })
        .to(".hero-kicker, .hero-subtitle, .hero-signature, .begin-ritual", {
          opacity: 1,
          y: 0,
          stagger: 0.09,
          duration: 0.7,
        }, "-=0.45");

      if (reduceMotion) {
        gsap.set([".scene-left-copy", ".scent-note", ".ritual-line", ".archive-card", ".final-content > *"], {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
        });
        return;
      }

      // Hero drive: the pinned opening behaves like a product-film vertical push.
      gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-drive",
          start: "top top",
          end: "+=185%",
          scrub: 0.65,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onEnter: () => setProductActive(true),
          onEnterBack: () => setProductActive(true),
        },
      })
        .to(productRef.current, { x: `${24 * motion}vw`, y: `${-3 * motion}vh`, scale: isMobile ? 0.82 : 0.92, rotate: 2 * motion, ease: "none" }, 0)
        .to(".hero-title", { scale: isMobile ? 0.8 : 0.68, x: `${-22 * motion}vw`, y: `${-6 * motion}vh`, ease: "none" }, 0)
        .to(".smoke-a", { y: -150 * motion, scale: 1 + 0.12 * motion, opacity: 0.58, ease: "none" }, 0)
        .to(".streak-one", { x: `${42 * motion}vw`, y: `${-18 * motion}vh`, opacity: 0.72, ease: "none" }, 0)
        .to(".scene-left-copy", { opacity: 1, x: 0, ease: "none" }, 0.42)
        .to(".begin-ritual", { opacity: 0, y: 38 * motion, ease: "none" }, 0.68)
        .to(".scene-left-copy, .hero-subtitle, .hero-signature", { opacity: 0, y: -42 * motion, ease: "none" }, 0.78)
        .to(".hero-title", { opacity: 0.18, y: `${-12 * motion}vh`, ease: "none" }, 0.86);

      // Essence and ritual now share one scrubbed film timeline instead of two stacked pins.
      gsap.timeline({
        scrollTrigger: {
          trigger: ".essence-scene",
          start: "top 72%",
          endTrigger: ".ritual-scene",
          end: "bottom 24%",
          scrub: 0.7,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onEnter: () => setProductActive(true),
          onEnterBack: () => setProductActive(true),
        },
      })
        .to(productRef.current, { x: "0vw", y: `${-4 * motion}vh`, scale: isMobile ? 0.56 : 0.66, rotate: -3 * motion, opacity: 0.98, ease: "none" }, 0)
        .to(".marble-ridge", { y: -90 * motion, scale: 1 + 0.07 * motion, opacity: 0.9, ease: "none" }, 0)
        .to(".scent-note", { opacity: 1, scale: 1, stagger: 0.035, ease: "none" }, 0.12)
        .to(".note-line", { scaleX: 1, opacity: 0.55, stagger: 0.03, ease: "none" }, 0.14)
        .to(".scent-note", { opacity: 0, scale: 0.92, stagger: 0.02, ease: "none" }, 0.48)
        .to(".note-line", { opacity: 0, scaleX: 0.72, stagger: 0.02, ease: "none" }, 0.48)
        .to(productRef.current, { x: `${-24 * motion}vw`, y: `${2 * motion}vh`, scale: isMobile ? 0.36 : 0.48, opacity: isMobile ? 0.08 : 0.32, rotate: -8 * motion, ease: "none" }, 0.58)
        .to(".ritual-backdrop", { scale: 1 + 0.1 * motion, opacity: 0.86, ease: "none" }, 0.58)
        .to(".ritual-line", { opacity: 1, yPercent: 0, stagger: 0.12, ease: "none" }, 0.64);

      gsap.timeline({
        scrollTrigger: {
          trigger: ".hall-scene",
          start: "top 78%",
          endTrigger: ".interactive-scene",
          end: "bottom 45%",
          scrub: 0.7,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onEnter: () => setProductActive(false),
          onLeaveBack: () => setProductActive(true),
        },
      })
        .to(productRef.current, { opacity: 0, scale: 0.42, ease: "none" }, 0)
        .to(".archive-card", { opacity: 1, y: 0, rotateX: 0, stagger: 0.08, ease: "none" }, 0.08)
        .to(".interactive-grid", { y: -32 * motion, opacity: 1, ease: "none" }, 0.62);

      ScrollTrigger.create({
        trigger: ".hall-scene",
        start: "top 82%",
        endTrigger: ".interactive-scene",
        end: "bottom 24%",
        onEnter: () => {
          setProductActive(false);
          gsap.set(productRef.current, { opacity: 0 });
        },
        onEnterBack: () => {
          setProductActive(false);
          gsap.set(productRef.current, { opacity: 0 });
        },
        onLeaveBack: () => {
          setProductActive(true);
        },
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: ".final-scene",
          start: "top top",
          end: "+=135%",
          scrub: 0.75,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onEnter: () => setProductActive(true),
          onEnterBack: () => setProductActive(true),
          onLeave: () => setProductActive(false),
          onLeaveBack: () => setProductActive(false),
        },
      })
        .to(productRef.current, { opacity: 1, x: "0vw", y: "0vh", scale: 0.78, rotate: 0, ease: "none" }, 0)
        .to(".final-smoke", { opacity: 0.18, y: -110 * motion, scale: 1 + 0.16 * motion, ease: "none" }, 0)
        .to(".final-content > *", { opacity: 1, y: 0, stagger: 0.09, ease: "none" }, 0.18);

      gsap.to(productRef.current, {
        opacity: 0,
        scale: 0.52,
        y: "-10vh",
        ease: "none",
        scrollTrigger: {
          trigger: ".signature-footer",
          start: "top bottom",
          end: "top center",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onEnter: () => setProductActive(false),
          onEnterBack: () => setProductActive(false),
        },
      });

      const refreshAfterMedia = () => requestAnimationFrame(() => ScrollTrigger.refresh());
      const images = Array.from(document.images);
      images.forEach((image) => {
        if (!image.complete) {
          image.addEventListener("load", refreshAfterMedia, { once: true });
          image.addEventListener("error", refreshAfterMedia, { once: true });
        }
      });

      refreshAfterMedia();
    }, appRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current || window.__obsidianLenis;
    if (locked) {
      document.body.classList.add("scroll-locked");
      lenis?.stop?.();
    } else {
      document.body.classList.remove("scroll-locked");
      lenis?.start?.();
    }

    return () => document.body.classList.remove("scroll-locked");
  }, [locked, lenisRef]);

  return (
    <main ref={appRef} className="obsidian-app">
      <Atmosphere />
      <div ref={productRef} className={`product-shell ${productActive ? "is-motion-active" : ""}`} aria-hidden="true">
        <BottleStage active={productActive} />
      </div>

      <section className="hero-drive section-full">
        <div className="hero-vignette" />
        <div className="hero-content">
          <p className="hero-kicker">Created by Mohammad Al-Ajmi</p>
          <h1 className="hero-title">
            <span className="word">OBSIDIAN</span>
            <span className="word">ESSENCE</span>
          </h1>
          <p className="hero-subtitle">Extrait de Parfum</p>
          <p className="hero-signature">A black and gold ritual carved from smoke.</p>
        </div>
        <div className="scene-left-copy">
          <span className="small-index">01 / VERTICAL DRIVE</span>
          <p>A fragrance carved from shadow, smoke, and gold.</p>
        </div>
        <div className="begin-ritual">
          <ArrowDown size={17} />
          BEGIN THE RITUAL
        </div>
      </section>

      <section id="essence" className="essence-scene section-full">
        <div className="marble-ridge" />
        <div className="scene-heading">
          <p className="eyebrow">The Essence</p>
          <h2>Notes suspended in black marble air.</h2>
        </div>
        <div className="notes-orbit">
          {scentNotes.map((note, index) => {
            const angle = noteAngles[index];
            const x = Math.cos(angle) * 30 + (note === "Black Pepper" ? -12 : 0);
            const y = Math.sin(angle) * 25 + (note === "Black Pepper" ? 4 : 0);
            return (
              <div
                className="note-wrap"
                key={note}
                style={{ "--x": `${x}vw`, "--y": `${y}vh`, "--angle": `${angle}rad` }}
              >
                <span className="note-line" />
                <span className="scent-note">{note}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="ritual-scene section-full">
        <div className="ritual-backdrop" />
        <div className="ritual-lines">
          <p className="ritual-line">Not worn. Declared.</p>
          <p className="ritual-line">Not sprayed. Remembered.</p>
          <p className="ritual-line">Not fragrance. Presence.</p>
        </div>
      </section>

      <section className="hall-scene section-tall">
        <div className="hall-header">
          <p className="eyebrow">Bottle Hall</p>
          <h2>Three expressions. One black flame.</h2>
        </div>
        <ProductCards />
      </section>

      <section className="interactive-scene section-tall">
        <InteractiveProduct onLock={() => setLocked(true)} />
      </section>

      <section className="final-scene section-full">
        <div className="final-smoke" />
        <div className="final-content">
          <p className="eyebrow">The smoke clears</p>
          <h2>ENTER THE COLLECTION</h2>
          <p>Obsidian Essence is fictional, but the presence is built to feel real.</p>
          <div className="cta-row">
            <a href="#essence" className="gold-button">
              <Sparkles size={18} />
              Discover the Essence
            </a>
            <a href="mailto:ajmi.198599@gmail.com" className="ghost-button">
              <Mail size={18} />
              Contact the Creator
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <SignatureFooter />
      <LockView active={locked} onClose={() => setLocked(false)} />
    </main>
  );
}
