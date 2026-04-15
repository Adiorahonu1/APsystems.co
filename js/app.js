/* ─────────────────────────────────────────────────────────────
   AP SYSTEMS — Website One  |  Editorial Bold Redesign
   Scroll-container removed. Clean section-based animation.
   ───────────────────────────────────────────────────────────── */
'use strict';

let lenis = null;

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

/* ── HERO ENTRANCE ───────────────────────────────────────────── */
function initHeroEntrance() {
  const eyebrow  = document.querySelector('.hero-eyebrow');
  const headline = document.querySelector('.hero-headline');
  const bottom   = document.querySelector('.hero-bottom');

  const els = [eyebrow, headline, bottom].filter(Boolean);
  gsap.set(els, { opacity: 0, y: 36 });
  const tl = gsap.timeline({ delay: 0.25 });
  tl.to(eyebrow,  { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' });
  tl.to(headline, { opacity: 1, y: 0, duration: 1.1,  ease: 'power3.out' }, '-=0.35');
  tl.to(bottom,   { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, '-=0.5');
}

/* ── REVEAL-UP via IntersectionObserver ─────────────────────── */
function initRevealAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('in-view'); io.unobserve(target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
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

/* ── FEATURE CAROUSEL ────────────────────────────────────────── */
function initFeatureCarousel() {
  const FEATURES = [
    { label: 'AI Lead Generation',   image: 'https://images.unsplash.com/photo-1551288049-bbda38a10ad5?q=80&w=1200', description: 'Automated lead capture from every channel, around the clock.',                    svg: '<circle cx="12" cy="12" r="3"/><path d="M9 9a4.24 4.24 0 0 1 6 0"/><path d="M5.5 5.5a9.5 9.5 0 0 1 13 0"/><path d="M2 2l20 20"/>' },
    { label: 'Lead Qualification',   image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200', description: 'AI screens every prospect before they reach your calendar.',                   svg: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>' },
    { label: 'Appointment Booking',  image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200', description: 'Calendar fills automatically. No back-and-forth messaging.',                  svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { label: 'Follow-up Automation', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200', description: 'Multi-touch sequences that never go cold or miss a follow-up.',               svg: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' },
    { label: 'Pipeline Recovery',    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200', description: 'Dormant leads reactivated. Revenue recovered from your existing list.',        svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
    { label: 'CRM Integration',      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200', description: 'Connects to GoHighLevel, HubSpot, Salesforce and your full stack.',              svg: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>' },
    { label: 'Real-time Analytics',  image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200', description: 'Every lead tracked from first touch to closed deal, live.',                    svg: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { label: 'Speed to Lead',        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200', description: 'AI responds in under 60 seconds. Before competitors ever call first.',         svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
    { label: '24/7 Operation',       image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200', description: 'Your agent never sleeps, takes breaks, or misses an inbound lead.',           svg: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { label: 'Custom Build',         image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200', description: 'Built around your exact workflow, market, and business model.',                svg: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41A7 7 0 0 1 19 12a7 7 0 0 1-1.34 4.07l1.41 1.41A9 9 0 0 0 21 12a9 9 0 0 0-1.93-7.07zM4.93 4.93A9 9 0 0 0 3 12a9 9 0 0 0 1.93 7.07l1.41-1.41A7 7 0 0 1 5 12a7 7 0 0 1 1.34-4.07L4.93 4.93z"/>' },
  ];

  const ITEM_H = 65, INTERVAL = 3000;
  let step = 0, paused = false;
  const n = FEATURES.length;
  const track = document.getElementById('fcTrack');
  const cardsWrap = document.getElementById('fcCards');
  if (!track || !cardsWrap) return;

  const ci = () => ((step % n) + n) % n;
  const wd = (d) => { let r = d; if (r > n/2) r -= n; if (r < -n/2) r += n; return r; };

  const labelItems = FEATURES.map((f, i) => {
    const div = document.createElement('div');
    div.className = 'fc-label-item';
    div.innerHTML = `<button class="fc-label-btn"><svg class="fc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${f.svg}</svg><span>${f.label}</span></button>`;
    const btn = div.querySelector('button');
    btn.addEventListener('click', () => { const d = (i - ci() + n) % n; if (d > 0) { step += d; update(); } });
    btn.addEventListener('mouseenter', () => { paused = true; });
    btn.addEventListener('mouseleave', () => { paused = false; });
    track.appendChild(div);
    return div;
  });

  const cards = FEATURES.map((f, i) => {
    const div = document.createElement('div');
    div.className = 'fc-card';
    div.innerHTML = `<img src="${f.image}" alt="${f.label}" loading="lazy"/><div class="fc-card-live"><div class="fc-live-dot"></div><span class="fc-live-txt">Live System</span></div><div class="fc-card-overlay"><div class="fc-card-tag">${String(i+1).padStart(2,'0')} · ${f.label}</div><p class="fc-card-desc">${f.description}</p></div>`;
    cardsWrap.appendChild(div);
    return div;
  });

  function update() {
    const cur = ci();
    labelItems.forEach((item, i) => {
      const d = wd(i - cur);
      item.style.transform = `translateY(${d * ITEM_H}px)`;
      item.style.opacity = Math.max(0, 1 - Math.abs(d) * 0.25);
      item.querySelector('button').classList.toggle('is-active', i === cur);
    });
    cards.forEach((card, i) => {
      const d = wd(i - cur);
      const a = d === 0, p = d === -1, nx = d === 1, h = !a && !p && !nx;
      card.classList.toggle('is-active', a);
      card.classList.toggle('is-prev', p);
      card.classList.toggle('is-next', nx);
      card.classList.toggle('is-hidden', h);
      const tx = a ? 0 : p ? -80 : nx ? 80 : 0;
      const sc = a ? 1 : (p || nx) ? 0.85 : 0.7;
      const op = a ? 1 : (p || nx) ? 0.4 : 0;
      const rot = p ? -3 : nx ? 3 : 0;
      card.style.transform = `translateX(${tx}px) scale(${sc}) rotate(${rot}deg)`;
      card.style.opacity = String(op);
      card.style.zIndex = String(a ? 20 : (p || nx) ? 10 : 0);
      card.style.pointerEvents = a ? 'auto' : 'none';
    });
  }

  update();
  setInterval(() => { if (!paused) { step++; update(); } }, INTERVAL);
}

/* ── PROOF DASHBOARD ANIMATION ───────────────────────────────── */
function initDashboard() {
  const dashboard = document.getElementById('proof-dashboard');
  if (!dashboard) return;
  const KPI_TARGET   = 100400;
  const DONUT_TARGET = 0.72;
  const DONUT_CIRCUM = 2 * Math.PI * 70;
  const BAR_DATA = [
    { x: 16,  h: 49.5 },
    { x: 52,  h: 70.2 },
    { x: 88,  h: 37.8 },
    { x: 124, h: 82.8 },
    { x: 160, h: 59.4 },
  ];
  let fired = false;

  function runAnim() {
    const bars     = dashboard.querySelectorAll('.pd-bar');
    const dots     = dashboard.querySelectorAll('.pd-dot');
    const lineEl   = document.getElementById('pd-line');
    const donutEl  = document.getElementById('pd-donut');
    const revEl    = document.getElementById('pd-revenue');
    const deltaEl  = document.getElementById('pd-delta');
    const donutVal = document.getElementById('pd-donut-val');

    const tl = gsap.timeline();
    tl.from('.pd-tile', { opacity: 0, y: 14, stagger: 0.08, duration: 0.5, ease: 'power2.out' });
    tl.to({ v: 0 }, {
      v: KPI_TARGET, duration: 2.2, ease: 'power2.out',
      onUpdate: function() {
        if (revEl) revEl.textContent = '$' + Math.round(this.targets()[0].v).toLocaleString('en-US');
      }
    }, '-=0.3');
    tl.to({ v: 0 }, {
      v: 12.4, duration: 2.2, ease: 'power2.out',
      onUpdate: function() {
        if (deltaEl) deltaEl.textContent = '+' + this.targets()[0].v.toFixed(1) + '%';
      }
    }, '<');
    BAR_DATA.forEach(function(d, i) {
      tl.to(bars[i], { attr: { y: 100 - d.h, height: d.h }, duration: 0.55, ease: 'back.out(1.4)' }, 0.2 + i * 0.07);
    });
    if (lineEl) {
      tl.to(lineEl, { attr: { 'stroke-dashoffset': 0 }, duration: 1.4, ease: 'power2.inOut' }, 0.4);
      dots.forEach(function(dot, i) {
        tl.to(dot, { attr: { opacity: 1 }, duration: 0.14 }, 0.4 + (i / (dots.length - 1)) * 1.3);
      });
    }
    if (donutEl) {
      tl.to({ v: 0 }, {
        v: DONUT_TARGET, duration: 1.6, ease: 'power2.out',
        onUpdate: function() {
          const v = this.targets()[0].v;
          donutEl.setAttribute('stroke-dashoffset', DONUT_CIRCUM * (1 - v));
          if (donutVal) donutVal.textContent = (v * 100).toFixed(1) + '%';
        }
      }, 0.55);
    }
  }

  new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !fired) { fired = true; runAnim(); }
    });
  }, { threshold: 0.25 }).observe(dashboard);
}

/* ── HERO SHADER BACKGROUND ──────────────────────────────────── */
function initHeroShader() {
  const canvas = document.getElementById('hero-shader');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2');
  if (!gl) return;

  const VERT = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

  const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
void main(void){
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2.,1.);
  vec3 col=vec3(0.);
  float bg=clouds(vec2(st.x+T*.18,-st.y));
  uv*=1.-.18*(sin(T*.12)*.5+.5);
  for(float i=1.;i<9.;i++){
    uv+=.08*cos(i*vec2(.08+.008*i,.6)+i*2.8+T*.22+.08*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(2.,3.,5.))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.03,bg*.10,bg*.28),d);
  }
  O=vec4(col,1.);
}`;

  function makeShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = makeShader(gl.VERTEX_SHADER, VERT);
  const fs = makeShader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Shader link error:', gl.getProgramInfoLog(prog));
    return;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(prog, 'resolution');
  const uTime  = gl.getUniformLocation(prog, 'time');
  const uTouch = gl.getUniformLocation(prog, 'touch');

  let mx = 0, my = 0;

  function resize() {
    const dpr = Math.max(1, 0.5 * (window.devicePixelRatio || 1));
    const w = window.innerWidth  * dpr;
    const h = window.innerHeight * dpr;
    if (canvas.width === w && canvas.height === h) return;
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  function render(now) {
    requestAnimationFrame(render);
    gl.useProgram(prog);
    gl.uniform2f(uRes,   canvas.width, canvas.height);
    gl.uniform1f(uTime,  now * 1e-3);
    gl.uniform2f(uTouch, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  document.getElementById('hero').addEventListener('mousemove', (e) => {
    const dpr = Math.max(1, 0.5 * (window.devicePixelRatio || 1));
    mx = e.clientX * dpr;
    my = (window.innerHeight - e.clientY) * dpr;
  });

  window.addEventListener('resize', resize);
  resize();
  render(0);

  setTimeout(() => canvas.classList.add('ready'), 300);
}

/* ── SERVICE IMAGE ACCORDION ─────────────────────────────────── */
function initServiceAccordion() {
  const accordion = document.getElementById('svcAccordion');
  if (!accordion) return;
  const panels = accordion.querySelectorAll('.svc-panel');

  panels.forEach((panel) => {
    panel.addEventListener('mouseenter', () => {
      panels.forEach((p) => p.classList.remove('active'));
      panel.classList.add('active');
    });
    // Touch / click support for mobile vertical accordion
    panel.addEventListener('click', () => {
      if (!panel.classList.contains('active')) {
        panels.forEach((p) => p.classList.remove('active'));
        panel.classList.add('active');
      }
    });
  });

  // Reset to first panel when cursor leaves the accordion
  accordion.addEventListener('mouseleave', () => {
    panels.forEach((p) => p.classList.remove('active'));
    panels[0].classList.add('active');
  });
}

/* ── CINEMATIC CTA ANIMATION ─────────────────────────────────── */
function initCinematicCTA() {
  const section = document.querySelector('.cinematic-cta');
  if (!section) return;
  const bgText   = section.querySelector('.ccta-bg-text');
  const headline = section.querySelector('.ccta-headline');
  const sub      = section.querySelector('.ccta-sub');
  const actions  = section.querySelector('.ccta-actions');
  const trust    = section.querySelector('.ccta-trust');

  if (bgText) {
    gsap.to(bgText, {
      y: '-8vh', ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', once: true } })
    .from(headline, { y: 55, opacity: 0, duration: 0.9, ease: 'power3.out' })
    .from(sub,      { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
    .from(actions,  { y: 22, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from(trust,    { y: 18, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
}

/* ── HERO EXPANDABLE CTA ─────────────────────────────────────── */
function initExpandableHero() {
  const expandBtn  = document.getElementById('hero-expand-btn');
  const modal      = document.getElementById('hero-modal');
  const content    = document.getElementById('hero-modal-content');
  const closeBtn   = document.getElementById('hero-modal-close');
  const form       = document.getElementById('hm-form');
  const submitBtn  = document.getElementById('hm-submit-btn');
  const submitTxt  = document.getElementById('hm-submit-text');
  const submitSpn  = document.getElementById('hm-submit-loading');
  const formIdle   = document.getElementById('hm-form-idle');
  const formOk     = document.getElementById('hm-form-success');
  const redirectBtn= document.getElementById('hm-success-redirect');
  if (!expandBtn || !modal) return;

  function openModal() {
    const rect = expandBtn.getBoundingClientRect();
    modal.style.display = 'block';
    gsap.set(modal, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: '100px' });
    gsap.set(content, { opacity: 0, y: 16 });
    gsap.to(expandBtn, { opacity: 0, scale: 0.85, duration: 0.18 });
    document.body.style.overflow = 'hidden';
    gsap.to(modal, {
      left: 0, top: 0, width: '100vw', height: '100dvh', borderRadius: 0,
      duration: 0.48, ease: 'power3.inOut',
      onComplete: () => gsap.to(content, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' })
    });
  }

  function closeModal() {
    const rect = expandBtn.getBoundingClientRect();
    gsap.to(content, { opacity: 0, y: -12, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        gsap.to(modal, {
          left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: '100px',
          duration: 0.4, ease: 'power3.inOut',
          onComplete: () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            gsap.to(expandBtn, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(1.4)' });
          }
        });
      }
    });
  }

  expandBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display === 'block') closeModal(); });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitTxt.style.display = 'none';
      submitSpn.style.display = 'inline-block';
      submitBtn.disabled = true;
      setTimeout(() => { formIdle.style.display = 'none'; formOk.style.display = 'flex'; formOk.style.flexDirection = 'column'; }, 1500);
    });
  }
  if (redirectBtn) {
    redirectBtn.addEventListener('click', () => window.open('https://calendly.com/adiorahonuora/new-meeting', '_blank'));
  }
}

/* ── MAIN INIT ───────────────────────────────────────────────── */
/* ── BOOK A CALL BUTTONS ────────────────────────────────────── */
function enhanceBookCallBtns() {
  const PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.37 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.02-1.02a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

  document.querySelectorAll('.book-call-btn').forEach(btn => {
    /* Skip already-enhanced buttons (contain bcb-text) */
    if (btn.querySelector('.bcb-text')) return;
    const label = btn.textContent.trim().replace(/\s*→\s*$/, '');
    btn.innerHTML = `
      <span class="bcb-shine"></span>
      <span class="bcb-icon">
        <span class="bcb-icon-idle">${PHONE}</span>
        <span class="bcb-icon-hover">${PHONE}</span>
      </span>
      <span class="bcb-text">${label}</span>
    `;
  });
}

/* ── PULSE BEAMS (case study CTA) ───────────────────────────── */
function initPulseBeams() {
  const pulses = document.querySelectorAll('.cs-beam-pulse');
  if (!pulses.length) return;

  const delays = [0, 0.7, 1.3, 0.4, 1.8];
  const durations = [2.4, 2.2, 2.6, 2.3, 2.0];

  pulses.forEach((path, i) => {
    const len = path.getTotalLength();
    const seg = len * 0.28; // pulse segment = 28% of path length

    gsap.set(path, {
      attr: {
        'stroke-dasharray': `${seg} ${len}`,
        'stroke-dashoffset': len + seg
      },
      opacity: 0.9
    });

    gsap.to(path, {
      attr: { 'stroke-dashoffset': -(len + seg) },
      duration: durations[i],
      repeat: -1,
      repeatDelay: 1.2 + i * 0.15,
      ease: 'none',
      delay: delays[i]
    });
  });

  /* Subtle entrance: fade in the whole beams container */
  gsap.from('.cs-pulse-beams', { opacity: 0, duration: 1.2, ease: 'power2.out',
    scrollTrigger: { trigger: '.cs-pulse-section', start: 'top 80%' }
  });
  gsap.from('.cs-pulse-inner', { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.cs-pulse-section', start: 'top 75%' }
  });
}

function initScene() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) { loaderEl.style.display = 'none'; }

  gsap.registerPlugin(ScrollTrigger);

  initHeroShader();
  initExpandableHero();
  initLenis();
  initNav();
  initFAQ();
  initHeroEntrance();
  initRevealAnimations();
  initStickyCTA();
  initFeatureCarousel();
  initServiceAccordion();
  initCinematicCTA();
  enhanceBookCallBtns();
  initPulseBeams();

  ScrollTrigger.refresh();

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

/* ── BOOT ────────────────────────────────────────────────────── */
initScene();
