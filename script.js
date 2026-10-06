/* Real Javeed Productions — interactions */
(() => {
  const INSTAGRAM_HANDLE = "realjaveedproductions";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Preloader ---------- */
  document.body.classList.add("is-loading");
  const hidePreloader = () => {
    $("#preloader").classList.add("is-done");
    document.body.classList.remove("is-loading");
  };
  window.addEventListener("load", () => setTimeout(hidePreloader, 600));
  setTimeout(hidePreloader, 4000); // fallback if an asset hangs

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, back-to-top ---------- */
  const nav = $("#nav");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Active section link ---------- */
  const navAnchors = $$('.nav__links a[href^="#"]:not(.btn)');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll (staggered per parent) ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    groups.set(parent, i + 1);
    el.style.setProperty("--d", `${Math.min(i * 0.09, 0.6)}s`);
    revealObserver.observe(el);
  });

  /* ---------- Cursor glow + card spotlight ---------- */
  const glow = $(".cursor-glow");
  if (!prefersReduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  }
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- 3D tilt ---------- */
  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Hero gold dust particles ---------- */
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h, rafId;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vy: -(Math.random() * 0.35 + 0.08),
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.t += 0.02;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      const alpha = p.a * (0.6 + Math.sin(p.t) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 215, 122, ${alpha})`;
      ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  if (!prefersReduced) {
    // only animate while the hero is on screen
    new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(rafId);
      if (entry.isIntersecting) draw();
    }).observe(canvas);
  }

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg, ms = 4500) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), ms);
  };

  /* ---------- Clicking a service pre-selects it in the form ---------- */
  const form = $("#bookForm");
  const chipsBox = $(".chips", form);
  $$("[data-service]").forEach((el) => {
    el.addEventListener("click", () => {
      const box = $(`input[name="services"][value="${CSS.escape(el.dataset.service)}"]`, form);
      if (box) box.checked = true;
      chipsBox.classList.remove("is-invalid");
      $("#book").scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      showToast(`“${box ? box.parentElement.textContent.trim() : el.dataset.service}” added to your inquiry.`, 3000);
    });
  });

  /* ---------- Booking form ---------- */
  form.addEventListener("change", (e) => {
    if (e.target.name === "services") chipsBox.classList.remove("is-invalid");
  });
  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("is-invalid"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const services = data.getAll("services");
    let valid = true;

    ["name", "email"].forEach((key) => {
      const input = form.elements[key];
      const ok = key === "email" ? input.validity.valid && input.value.trim() : input.value.trim();
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!services.length) {
      chipsBox.classList.add("is-invalid");
      valid = false;
    }
    if (!valid) {
      showToast("Please fill in your name, a valid email and at least one service.");
      return;
    }

    const lines = [
      "Hi Real Javeed Productions! I'd like to make a booking inquiry.",
      "",
      `Name: ${data.get("name").trim()}`,
      `Email: ${data.get("email").trim()}`,
      data.get("phone").trim() && `Phone: ${data.get("phone").trim()}`,
      data.get("date") && `Event date: ${data.get("date")}`,
      `Services: ${services.join(", ")}`,
      data.get("message").trim() && `\nDetails: ${data.get("message").trim()}`,
    ].filter(Boolean);
    const message = lines.join("\n");

    let copied = false;
    try {
      await navigator.clipboard.writeText(message);
      copied = true;
    } catch {
      /* clipboard may be blocked (e.g. file://); fall through */
    }

    window.open(`https://ig.me/m/${INSTAGRAM_HANDLE}`, "_blank", "noopener");
    showToast(
      copied
        ? "Inquiry copied! Paste it into the Instagram DM that just opened. ✨"
        : `Opening Instagram DMs. Please message @${INSTAGRAM_HANDLE} with your details.`,
      7000
    );
  });
})();
