(() => {
  const WA = "51946091273";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.body.classList.add("loading");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Split hero title into letters ---------- */
  $$(".split").forEach(el => {
    el.innerHTML = [...el.textContent].map((c, i) =>
      `<span class="ch" style="transition-delay:${0.08 * i}s">${c}</span>`).join("");
  });

  /* ---------- Preloader ---------- */
  const loader = $("#loader"), bar = $("#loaderBar"), pct = $("#loaderPct");
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18);
    bar.style.width = p + "%";
    pct.textContent = Math.floor(p) + "%";
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.classList.remove("loading");
        document.body.classList.add("ready");
        burst(innerWidth / 2, innerHeight / 2, 140);
        setTimeout(() => loader.remove(), 1200);
      }, 350);
    }
  }, reduced ? 10 : 110);

  /* ---------- Rotating words ---------- */
  const words = ["boda", "evento corporativo", "quinceañero", "cumpleaños", "baby shower", "aniversario", "graduación", "fiesta temática"];
  const rot = $("#rotator");
  let wi = 0;
  setInterval(() => {
    const cur = $("em", rot);
    cur.classList.add("out");
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      cur.textContent = words[wi];
      cur.classList.remove("out");
      cur.classList.add("in");
      requestAnimationFrame(() => requestAnimationFrame(() => cur.classList.remove("in")));
    }, 450);
  }, 2600);

  /* ---------- Sparkles / confetti canvas ---------- */
  const cv = $("#sparkles"), ctx = cv.getContext("2d");
  let W, H, DPR = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -999, y: -999 };
  const dust = [], confetti = [];
  const COLORS = ["#d4af37", "#f3dc8a", "#fff3c4", "#ffffff", "#b8892b"];

  function resize() {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  const N = Math.min(140, Math.floor(innerWidth / 9));
  for (let i = 0; i < N; i++) {
    dust.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + .3,
      vx: (Math.random() - .5) * .25, vy: -Math.random() * .4 - .05,
      tw: Math.random() * Math.PI * 2,
      c: COLORS[i % COLORS.length]
    });
  }

  function burst(x, y, n = 60) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 9 + 3;
      confetti.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4,
        w: Math.random() * 8 + 4, h: Math.random() * 4 + 3,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)], life: 1
      });
    }
  }

  $(".hero").addEventListener("click", e => {
    if (e.target.closest("a, button")) return;
    const r = cv.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top, 70);
  });
  $(".hero").addEventListener("pointermove", e => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  $(".hero").addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });

  let heroVisible = true;
  new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe($(".hero"));

  (function draw() {
    requestAnimationFrame(draw);
    if (!heroVisible) return;
    ctx.clearRect(0, 0, W, H);
    for (const d of dust) {
      d.tw += .04;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 120) { d.x += dx / dist * 1.6; d.y += dy / dist * 1.6; }
      d.x += d.vx; d.y += d.vy;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
      ctx.globalAlpha = .35 + Math.sin(d.tw) * .35;
      ctx.fillStyle = d.c;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vy += .22; c.vx *= .985; c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.life -= .008;
      if (c.life <= 0 || c.y > H + 20) { confetti.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, c.life);
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.scale(1, Math.cos(c.rot * 2));
      ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  })();

  /* ---------- Custom cursor & magnetic buttons ---------- */
  if (finePointer) {
    const cur = $("#cursor"), dot = $("#cursorDot");
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener("pointermove", e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    });
    (function follow() {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
    $$("a, button, .card, .chip, select, input, textarea").forEach(el => {
      el.addEventListener("pointerenter", () => cur.classList.add("hover"));
      el.addEventListener("pointerleave", () => cur.classList.remove("hover"));
    });
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .3}px, ${y * .4}px)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
  } else {
    $("#cursor").remove(); $("#cursorDot").remove();
  }

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    links.classList.toggle("open");
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open"); links.classList.remove("open");
  }));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    el.style.setProperty("--d", (sibs.indexOf(el) % 8) * 0.08 + "s");
    io.observe(el);
  });

  /* ---------- Statement word lighting ---------- */
  const statement = $("#statement");
  const goldWords = ["momentos", "para", "siempre."];
  statement.innerHTML = statement.textContent.trim().split(/\s+/)
    .map(w => `<span class="w${goldWords.includes(w) ? " gold" : ""}">${w}</span>`).join(" ");
  const sWords = $$(".w", statement);

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      const t0 = performance.now(), dur = 2000;
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 4)));
        el.textContent = pre + v + suf;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---------- 3D tilt + spotlight cards ---------- */
  if (finePointer) {
    $$(".tilt").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.transform = `rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 14}deg) translateZ(10px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
  }
  $$(".card").forEach(card => card.addEventListener("click", () => {
    const types = {
      "Corporativos": "Evento corporativo", "Bodas": "Boda", "Quinceañeros": "Quinceañero",
      "Cumpleaños": "Cumpleaños", "Baby Shower": "Baby shower", "Graduaciones y promociones": "Graduación / promoción",
      "Aniversarios y familiares": "Aniversario / familiar", "Fiestas temáticas": "Fiesta temática"
    };
    const t = types[$("h3", card).textContent];
    if (t) $("#fType").value = t;
    $("#contacto").scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- Scroll-driven effects ---------- */
  const progress = $("#progress");
  const hs = $(".hscroll"), track = $("#hTrack");
  const tl = $("#timeline"), tlFill = $("#timelineFill");
  const heroInner = $(".hero__inner");

  function onScroll() {
    const y = scrollY, vh = innerHeight;
    progress.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - vh)})`;
    nav.classList.toggle("scrolled", y > 40);

    if (!reduced && y < vh) {
      heroInner.style.transform = `translateY(${y * .35}px) scale(${1 - y / vh * .12})`;
      heroInner.style.opacity = 1 - y / vh * 1.1;
    }

    const sr = statement.getBoundingClientRect();
    const sp = Math.min(1, Math.max(0, (vh * .85 - sr.top) / (sr.height + vh * .35)));
    const lit = Math.floor(sp * sWords.length);
    sWords.forEach((w, i) => w.classList.toggle("lit", i < lit));

    if (!reduced) {
      const hr = hs.getBoundingClientRect();
      const total = hs.offsetHeight - vh;
      const hp = Math.min(1, Math.max(0, -hr.top / total));
      const max = track.scrollWidth - innerWidth;
      track.style.transform = `translateX(${-hp * max}px)`;
    }

    const tr = tl.getBoundingClientRect();
    const tp = Math.min(1, Math.max(0, (vh * .6 - tr.top) / tr.height));
    tlFill.style.transform = `scaleY(${tp})`;
  }
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Testimonials slider ---------- */
  const quotes = $$(".quote"), dots = $("#dots");
  let qi = 0, qTimer;
  quotes.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Testimonio ${i + 1}`);
    b.addEventListener("click", () => show(i));
    dots.appendChild(b);
  });
  function show(i) {
    qi = i;
    quotes.forEach((q, j) => q.classList.toggle("is-active", j === i));
    $$("button", dots).forEach((d, j) => {
      d.classList.remove("on"); void d.offsetWidth;
      d.classList.toggle("on", j === i);
    });
    clearTimeout(qTimer);
    qTimer = setTimeout(() => show((qi + 1) % quotes.length), 6000);
  }
  show(0);

  /* ---------- Quote form → WhatsApp ---------- */
  $("#quoteForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = id => $(id).value.trim();
    const fecha = v("#fDate") ? new Date(v("#fDate") + "T12:00").toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) : "";
    const lines = [
      `Hola Kelly 👋, soy ${v("#fName")}. Quiero cotizar un evento con Sazulli.`,
      `🎉 Tipo: ${v("#fType")}`,
      fecha && `📅 Fecha: ${fecha}`,
      v("#fGuests") && `👥 Invitados: ${v("#fGuests")}`,
      v("#fPlace") && `📍 Lugar: ${v("#fPlace")}`,
      v("#fMsg") && `💬 Idea: ${v("#fMsg")}`
    ].filter(Boolean);
    const r = e.submitter?.getBoundingClientRect();
    if (r) burstAt(r.left + r.width / 2, r.top);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  });

  // Confetti outside the hero: a temporary full-screen canvas
  function burstAt(x, y) {
    if (reduced) return;
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:500";
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const parts = Array.from({ length: 90 }, () => {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, s = Math.random() * 12 + 5;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: Math.random() * 6, c: COLORS[Math.floor(Math.random() * 5)], w: Math.random() * 8 + 4 };
    });
    let f = 0;
    (function loop() {
      g.clearRect(0, 0, c.width, c.height);
      parts.forEach(p => {
        p.vy += .3; p.x += p.vx; p.y += p.vy; p.r += .2;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.w / 2, -2, p.w, 4); g.restore();
      });
      if (++f < 140) requestAnimationFrame(loop); else c.remove();
    })();
  }
})();
