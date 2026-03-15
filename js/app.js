/* ─────────────────────────────────────────────────────────────
   The Agents Pipeline — Website One  |  Optimised engine
   ScrollTrigger instances: 5  (was ~15)
   Frames approach: pre-decoded img array = zero seek latency
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── CONFIG ─────────────────────────────────────────────────── */
const FRAME_COUNT  = 97;
const FRAME_SPEED  = 2.0;   // animation completes by ~55% scroll
const IMAGE_SCALE  = 0.85;  // padded-contain scaling
const BG_COLOR     = '#06060f';
const FAST_LOAD    = 10;    // frames to show immediately for first paint

/* ── CANVAS ──────────────────────────────────────────────────── */
const canvas = document.getElementById('main-canvas');
// alpha:false lets the browser skip per-pixel blending (~15% faster draws)
const ctx    = canvas.getContext('2d', { alpha: false });

/* ── FRAME STATE ─────────────────────────────────────────────── */
let frames       = new Array(FRAME_COUNT).fill(null);
let currentFrame = 0;
let lenis        = null;

/* ── HELPERS ─────────────────────────────────────────────────── */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/* ── CANVAS RESIZE ───────────────────────────────────────────── */
function resizeCanvas() {
  // Cap DPR at 1.5 — Retina 2–3× makes canvas 4–9× bigger for no visible gain
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width  = Math.round(window.innerWidth  * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  drawFrame(currentFrame);
}
window.addEventListener('resize', resizeCanvas);

/* ── DRAW — synchronous, zero latency ───────────────────────── */
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const iw = img.naturalWidth  || vw;
  const ih = img.naturalHeight || vh;
  const s  = Math.max(vw / iw, vh / ih);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, vw, vh);
  ctx.drawImage(img, (vw - iw * s) / 2, (vh - ih * s) / 2, iw * s, ih * s);
}

/* ── FRAME PRELOADER (two-phase) ─────────────────────────────── */
function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `frames/frame_${String(i + 1).padStart(4, '0')}.webp`;
    img.onload  = () => { frames[i] = img; resolve(); };
    img.onerror = resolve; // don't block on missing frame
  });
}

async function preloadFrames(onComplete) {
  const loaderEl = document.getElementById('loader');
  const bar      = loaderEl.querySelector('.loader-bar');
  const status   = loaderEl.querySelector('.loader-status');

  // Phase 1: first FAST_LOAD frames → enough for first paint
  await Promise.all(Array.from({ length: FAST_LOAD }, (_, i) => loadFrame(i)));
  resizeCanvas();
  drawFrame(0);

  // Phase 2: rest in background with progress tracking
  let loaded = FAST_LOAD;
  const updateBar = () => {
    bar.style.width = Math.round((loaded / FRAME_COUNT) * 100) + '%';
  };
  updateBar();

  await Promise.all(
    Array.from({ length: FRAME_COUNT - FAST_LOAD }, (_, i) =>
      loadFrame(i + FAST_LOAD).then(() => { loaded++; updateBar(); })
    )
  );

  bar.style.width = '100%';
  status.textContent = 'LOADING ASSETS';

  gsap.to(loaderEl, {
    opacity: 0, duration: 0.5, delay: 0.2,
    onComplete: () => { loaderEl.style.display = 'none'; onComplete(); }
  });
}

/* ── LENIS ───────────────────────────────────────────────────── */
function initLenis() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  if (isMobile) {
    window.addEventListener('scroll', ScrollTrigger.update, { passive: true });
    return;
  }
  try {
    if (typeof Lenis === 'undefined') throw new Error('not loaded');
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('Lenis unavailable, using native scroll:', e);
    window.addEventListener('scroll', ScrollTrigger.update, { passive: true });
  }
}

/* ── SECTION TIMELINES ───────────────────────────────────────── */
function buildTimeline(anim, children) {
  const tl = gsap.timeline({ paused: true });
  const b  = { stagger: 0.1, duration: 0.8, ease: 'power3.out' };
  if      (anim === 'stagger-up')  tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
  else if (anim === 'fade-up')     tl.from(children, { y: 40, opacity: 0, ...b });
  else if (anim === 'slide-right') tl.from(children, { x: -60, opacity: 0, stagger: 0, duration: 0.8, ease: 'power3.out' });
  else if (anim === 'slide-left')  tl.from(children, { x:  60, opacity: 0, stagger: 0, duration: 0.8, ease: 'power3.out' });
  else if (anim === 'scale-up')    tl.from(children, { scale: 0.9, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power2.out' });
  else if (anim === 'clip-reveal') tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power4.inOut' });
  else                             tl.from(children, { opacity: 0, ...b });
  return tl;
}

/* ── CONSOLIDATED SECTION DRIVER ──────────────────────────────
   Replaces ~15 individual ScrollTrigger instances with ONE.
   Direct style.opacity replaces gsap.set() per tick.
   Skip update when change < threshold to avoid GSAP churn.
   ─────────────────────────────────────────────────────────── */
function initSectionAnimations() {
  const container = document.getElementById('scroll-container');
  const SELECTOR  = '.section-tag,.section-headline,.section-body,.pain-item,.pillar,.step,.service-item,.stat-card,.cta-tag,.cta-headline,.cta-sub,.btn-primary';

  // Build per-section data once
  const sections = [...container.querySelectorAll('.scroll-section')].map((el) => ({
    el,
    tl:      buildTimeline(el.dataset.animation, el.querySelectorAll(SELECTOR)),
    enter:   parseFloat(el.dataset.enter)  / 100,
    leave:   parseFloat(el.dataset.leave)  / 100,
    range:   (parseFloat(el.dataset.leave) - parseFloat(el.dataset.enter)) / 100,
    persist: el.dataset.persist === 'true',
    lastOp:  -1,  // cached opacity to skip redundant style writes
    lastPr:  -1,  // cached tl.progress to skip redundant GSAP calls
  }));

  // Counter elements
  const counters = [...container.querySelectorAll('.stat-number')].map((el) => {
    const sec = el.closest('.scroll-section');
    return { el, enter: parseFloat(sec.dataset.enter) / 100,
             target: parseFloat(el.dataset.value), dec: parseInt(el.dataset.decimals || '0'), fired: false };
  });

  ScrollTrigger.create({
    trigger:  container,
    start:    'top top',
    end:      'bottom bottom',
    onUpdate: ({ progress: p }) => {

      // Sections
      for (const s of sections) {
        const local = (p - s.enter) / s.range;

        if (p >= s.enter && p < s.leave) {
          const inPr = clamp(local / 0.4, 0, 1);
          let   op   = 1;
          if (!s.persist && local > 0.85) op = 1 - (local - 0.85) / 0.15;

          if (Math.abs(inPr - s.lastPr) > 0.003) { s.lastPr = inPr; s.tl.progress(inPr); }
          if (Math.abs(op   - s.lastOp) > 0.008) { s.lastOp = op;   s.el.style.opacity = op; }

        } else if (s.persist && p >= s.leave) {
          if (s.lastOp !== 1) { s.el.style.opacity = '1'; s.lastOp = 1; s.tl.progress(1); s.lastPr = 1; }

        } else {
          if (s.lastOp !== 0) {
            s.el.style.opacity = '0';
            s.lastOp = 0;
            if (!s.persist) { s.tl.progress(0); s.lastPr = 0; }
          }
        }
      }

      // Counters
      for (const c of counters) {
        if (p >= c.enter && !c.fired) {
          c.fired = true;
          gsap.fromTo({ v: 0 }, { v: c.target }, {
            duration: 2, ease: 'power2.out',
            onUpdate: function () {
              const v = this.targets()[0].v;
              c.el.textContent = c.dec === 0 ? Math.round(v) : v.toFixed(c.dec);
            }
          });
        }
        if (p < c.enter - 0.05 && c.fired) { c.fired = false; c.el.textContent = '0'; }
      }
    }
  });
}

/* ── HERO + OVERLAYS ─────────────────────────────────────────
   Merged into ONE scrubbed trigger (was 2 separate).
   Hero updates stop once fully hidden (saves transform/opacity writes).
   On mobile: simple enter/leave callbacks — no scrub, no per-tick writes.
   ─────────────────────────────────────────────────────────── */
function initScrollEffects() {
  const container = document.getElementById('scroll-container');
  const hero      = document.getElementById('hero');
  const overlay   = document.getElementById('dark-overlay');
  const accent    = document.getElementById('accent-overlay');
  const isMobile  = window.matchMedia('(pointer: coarse)').matches;

  if (isMobile) {
    hero.style.transition = 'opacity 0.3s ease';
    ScrollTrigger.create({
      trigger: container,
      start:   'top top',
      end:     '8% top',
      onLeave:      () => { hero.style.opacity = '0'; },
      onEnterBack:  () => { hero.style.opacity = '1'; },
    });
    return;
  }

  const E = 0.55, L = 0.70, F = 0.04;
  let heroHidden  = false;

  ScrollTrigger.create({
    trigger: container,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate: ({ progress: p }) => {

      // Hero — stop writing styles once it's gone
      if (p < 0.07) {
        if (heroHidden) { hero.style.cssText = ''; hero.style.transition = ''; heroHidden = false; }
        hero.style.opacity   = Math.max(0, 1 - p * 18);
        hero.style.transform = `translateY(${-p * 40}px)`;
      } else if (!heroHidden) {
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(-40px)';
        heroHidden = true;
      }

      // Overlays
      let op = 0;
      if      (p >= E - F && p <= E)   op = (p - (E - F)) / F;
      else if (p > E && p < L)         op = 0.9;
      else if (p >= L && p <= L + F)   op = 0.9 * (1 - (p - L) / F);
      overlay.style.opacity = op;
      accent.style.opacity  = op;
    }
  });
}

/* ── FRAME SCROLL — synchronous draw, zero seek lag ─────────── */
function initFrameScroll() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const container = document.getElementById('scroll-container');
  if (isMobile) {
    // On mobile: scroll-driven via passive listener, throttled to ~30fps
    // Avoids GSAP scrub:true thrashing while keeping animation tied to scroll
    let lastDrawTime = 0;
    window.addEventListener('scroll', () => {
      const now = performance.now();
      if (now - lastDrawTime < 32) return;
      lastDrawTime = now;
      const rect = container.getBoundingClientRect();
      const p = clamp(-rect.top / container.offsetHeight, 0, 1);
      const idx = Math.min(
        Math.floor(clamp(p * FRAME_SPEED, 0, 1) * FRAME_COUNT),
        FRAME_COUNT - 1
      );
      if (idx !== currentFrame) {
        currentFrame = idx;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }, { passive: true });
    return;
  }
  ScrollTrigger.create({
    trigger:  container,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    true,
    onUpdate: ({ progress: p }) => {
      const idx = Math.min(
        Math.floor(clamp(p * FRAME_SPEED, 0, 1) * FRAME_COUNT),
        FRAME_COUNT - 1
      );
      if (idx !== currentFrame) {
        currentFrame = idx;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

/* ── MARQUEE ─────────────────────────────────────────────────── */
function initMarquee() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const wrap  = document.getElementById('marquee-wrap');
  const track = document.getElementById('marquee-track');
  const c     = document.getElementById('scroll-container');

  ScrollTrigger.create({
    trigger: c, start: '10% top', end: '90% bottom',
    onEnter:     () => gsap.to(wrap, { opacity: 1, duration: 0.4 }),
    onLeave:     () => gsap.to(wrap, { opacity: 0, duration: 0.4 }),
    onEnterBack: () => gsap.to(wrap, { opacity: 1, duration: 0.4 }),
    onLeaveBack: () => gsap.to(wrap, { opacity: 0, duration: 0.4 }),
  });
  gsap.to(track, {
    xPercent: -30, ease: 'none',
    scrollTrigger: { trigger: c, start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
}

/* ── POSITION SECTIONS ───────────────────────────────────────── */
function positionSections() {
  const container = document.getElementById('scroll-container');
  const sections  = container.querySelectorAll('.scroll-section');
  function layout() {
    const h = container.offsetHeight;
    sections.forEach((s) => {
      const mid = (parseFloat(s.dataset.enter) + parseFloat(s.dataset.leave)) / 200;
      s.style.top       = `${mid * h}px`;
      s.style.transform = 'translateY(-50%)';
    });
  }
  layout();
  window.addEventListener('resize', layout);
}

/* ── HERO ENTRANCE ───────────────────────────────────────────── */
function initHeroEntrance() {
  const lines   = document.querySelectorAll('.hero-headline .line');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const sub     = document.querySelector('.hero-sub');
  const ctas    = document.querySelector('.hero-ctas');
  const trust   = document.querySelector('.hero-trust');
  gsap.set([...lines, eyebrow, sub, ctas, trust], { opacity: 0, y: 40 });
  const tl = gsap.timeline({ delay: 0.1 });
  tl.to(eyebrow,              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  tl.to(lines,                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, '-=0.3');
  tl.to([sub, ctas, trust],   { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1  }, '-=0.4');
}

/* ── REVEAL-UP via IntersectionObserver ──────────────────────
   Zero JS cost per scroll tick (vs one ScrollTrigger per element).
   CSS already has .reveal-up { transition } + .in-view { visible }.
   ─────────────────────────────────────────────────────────── */
function initRevealAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('in-view'); io.unobserve(target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-up').forEach((el) => io.observe(el));
}

/* ── STICKY MOBILE CTA ───────────────────────────────────────── */
function initStickyCTA() {
  const el = document.getElementById('sticky-mobile-cta');
  if (!el) return;
  window.addEventListener('scroll', () => {
    el.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  }, { passive: true });
}

/* ── NAV ─────────────────────────────────────────────────────── */
function initNav() {
  const nav       = document.getElementById('main-nav');
  const hamburger = document.getElementById('nav-hamburger');
  const menu      = document.getElementById('mobile-menu');
  let   prev      = false;
  // Only toggle class when state actually changes (not on every scroll px)
  window.addEventListener('scroll', () => {
    const s = window.scrollY > 60;
    if (s !== prev) { prev = s; nav.classList.toggle('scrolled', s); }
  }, { passive: true });
  hamburger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('open')));
}

/* ── FAQ ─────────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const ans = item.querySelector('.faq-answer');
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((o) => {
        o.classList.remove('open');
        o.querySelector('.faq-answer').style.maxHeight = '0';
      });
      if (!open) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });
}

/* ── MAIN INIT ───────────────────────────────────────────────── */
function initScene() {
  gsap.registerPlugin(ScrollTrigger);

  resizeCanvas();
  initLenis();
  positionSections();

  // 5 ScrollTrigger instances total
  initScrollEffects();     // #1: hero + overlays    (scrub:true)
  initFrameScroll();       // #2: frame index draw   (scrub:true, instant)
  initMarquee();           // #3+4: marquee           (enter/leave + scrub:1)
  initSectionAnimations(); // #5: all sections + counters (scrub:false)

  initNav();
  initFAQ();
  initHeroEntrance();
  initRevealAnimations();  // IntersectionObserver — zero scroll-tick cost
  initStickyCTA();

  ScrollTrigger.refresh();

  window.addEventListener('resize', () => {
    positionSections();
    resizeCanvas();
    ScrollTrigger.refresh();
  });
}

/* ── BOOT ────────────────────────────────────────────────────── */
preloadFrames(initScene);
