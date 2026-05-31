/* ============================================================
   CLEAR UP — interactions
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav scroll state ---- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // immediate pass for anything already in view (hero) + safety net
    function revealInView() {
      revealEls.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); }
      });
    }
    requestAnimationFrame(revealInView);
    setTimeout(revealInView, 250);
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 2600);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Accordion (Know / Learn / Innovate) ---- */
  document.querySelectorAll('.pillar__head').forEach(function (head) {
    head.addEventListener('click', function () {
      var pillar = head.closest('.pillar');
      var isOpen = pillar.classList.contains('open');
      // close siblings
      document.querySelectorAll('.pillar.open').forEach(function (p) {
        if (p !== pillar) p.classList.remove('open');
      });
      pillar.classList.toggle('open', !isOpen);
    });
  });

  /* ---- Smooth anchor for "Learn more" ---- */
  document.querySelectorAll('a[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { ev.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }
    });
  });

  /* ============================================================
     FLOW FIELD — generative topographic contour lines.
     Echoes the fingerprint texture of the brand mark.
     ============================================================ */
  // small, fast value-noise
  function makeNoise(seed) {
    var p = new Uint8Array(512), perm = [];
    for (var i = 0; i < 256; i++) perm[i] = i;
    var s = seed || 1;
    function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var j = 255; j > 0; j--) { var k = Math.floor(rnd() * (j + 1)); var t = perm[j]; perm[j] = perm[k]; perm[k] = t; }
    for (var m = 0; m < 512; m++) p[m] = perm[m & 255];
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(h, x, y) { var u = (h & 1) ? -x : x, v = (h & 2) ? -y : y; return u + v; }
    return function (x, y) {
      var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      var u = fade(x), v = fade(y);
      var A = p[X] + Y, B = p[X + 1] + Y;
      return lerp(
        lerp(grad(p[A], x, y), grad(p[B], x - 1, y), u),
        lerp(grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1), u),
        v
      );
    };
  }

  function FlowField(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var noise = makeNoise(opts.seed || 7);
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, particles = [], raf = null, running = false;
    var COUNT = opts.count || 260;
    var SCALE = opts.scale || 0.0016;     // noise frequency
    var SPEED = opts.speed || 1.0;
    var colors = opts.colors || ['rgba(189,214,48,', 'rgba(194,230,218,'];
    var t = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = opts.bg || '#160E36';
      ctx.fillRect(0, 0, W, H);
    }
    function seedParticles() {
      particles = [];
      for (var i = 0; i < COUNT; i++) particles.push(spawn());
    }
    function spawn() {
      var c = colors[Math.floor(Math.random() * colors.length)];
      return { x: Math.random() * W, y: Math.random() * H, life: 0, max: 90 + Math.random() * 180, c: c, a: 0.16 + Math.random() * 0.20 };
    }
    function step() {
      // gentle fade so trails decay -> clean contour look
      ctx.fillStyle = (opts.bg || '#160E36');
      ctx.globalAlpha = 0.060;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.lineWidth = opts.lineWidth || 1.35;
      ctx.lineCap = 'round';
      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        var ang = noise(pt.x * SCALE, pt.y * SCALE + t) * Math.PI * 3.2;
        var nx = pt.x + Math.cos(ang) * 1.6 * SPEED;
        var ny = pt.y + Math.sin(ang) * 1.6 * SPEED;
        ctx.strokeStyle = pt.c + pt.a + ')';
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        pt.x = nx; pt.y = ny; pt.life++;
        if (pt.life > pt.max || pt.x < -10 || pt.x > W + 10 || pt.y < -10 || pt.y > H + 10) {
          particles[i] = spawn();
        }
      }
      t += 0.0009 * SPEED;
    }
    function loop() { step(); raf = requestAnimationFrame(loop); }
    this.start = function () {
      if (running) return; running = true; resize();
      if (!particles.length) seedParticles();
      if (reduce) { // draw a few static frames then stop
        for (var i = 0; i < 120; i++) step();
        running = false; return;
      }
      loop();
    };
    this.stop = function () { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
    this.renderStatic = function () { resize(); if (!particles.length) seedParticles(); for (var i = 0; i < 120; i++) step(); };
    this.resize = function () { resize(); seedParticles(); };
    this._running = function () { return running; };
  }

  // expose for tweaks/host
  var fields = [];
  function initFields() {
    document.querySelectorAll('canvas[data-flow]').forEach(function (cv) {
      var f = new FlowField(cv, {
        bg: cv.getAttribute('data-bg') || '#160E36',
        count: parseInt(cv.getAttribute('data-count') || '240', 10),
        speed: parseFloat(cv.getAttribute('data-speed') || '1'),
        seed: parseInt(cv.getAttribute('data-seed') || '7', 10)
      });
      cv._field = f;
      fields.push({ el: cv, field: f });
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function (entries) {
          entries.forEach(function (en) {
            var c = en.target;
            clearTimeout(c._rt);
            c._rt = setTimeout(function () {
              if (c.offsetParent === null) return;
              c._field.resize();
              c._staticDone = false;
              if (document.documentElement.classList.contains('motion-off')) { c._field.renderStatic(); c._staticDone = true; }
            }, 140);
          });
        });
        ro.observe(cv);
      }
    });
  }
  initFields();

  // Only run a field's animation when visible & its hero variant active.
  function fieldVisible(cv) {
    if (cv.offsetParent === null) return false;
    var r = cv.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  function tickFields() {
    var motionOff = document.documentElement.classList.contains('motion-off');
    fields.forEach(function (o) {
      var vis = fieldVisible(o.el);
      if (motionOff) {
        if (o.field._running()) o.field.stop();
        if (vis && !o.el._staticDone) { o.field.renderStatic(); o.el._staticDone = true; }
        return;
      }
      o.el._staticDone = false;
      if (vis && !o.field._running()) o.field.start();
      else if (!vis && o.field._running()) o.field.stop();
    });
  }
  window.addEventListener('scroll', tickFields, { passive: true });
  setTimeout(tickFields, 60);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { fields.forEach(function (o) { if (o.field._running()) o.field.resize(); }); }, 200);
  });

  window.CLEARUP = { tickFields: tickFields, fields: fields };
})();
