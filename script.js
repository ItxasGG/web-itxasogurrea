/* =========================================================
   Itxaso Gurrea · script.js
   - Menú móvil
   - Cabecera al hacer scroll + enlace activo
   - Animaciones de aparición
   - Contador de cifras
   - Validación del formulario de contacto
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Año en el pie ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  /* ---------- Cabecera y botón "arriba" al hacer scroll ---------- */
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Enlace activo según la sección visible ---------- */
  const navLinks = [...nav.querySelectorAll('a:not(.btn)[href^="#"]')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Animación de aparición ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Contador de cifras ---------- */
  const formatNumber = (n) => n.toLocaleString("es-ES");
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const prefix = el.dataset.prefix || "";
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + formatNumber(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));
  }

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById("contactForm");
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");

  const isValid = (field) => {
    if (field.type === "checkbox") return field.checked;
    const v = field.value.trim();
    if (!v) return false;
    if (field.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (field.type === "tel") return v.replace(/\D/g, "").length >= 9;
    return true;
  };

  form.querySelectorAll("input, textarea").forEach((field) => {
    const clear = () => {
      if (isValid(field)) field.classList.remove("is-invalid");
    };
    field.addEventListener("input", clear);
    field.addEventListener("change", clear);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("[required]")];
    let ok = true;
    fields.forEach((f) => {
      const valid = isValid(f);
      f.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    formError.hidden = ok;
    if (!ok) {
      fields.find((f) => f.classList.contains("is-invalid"))?.focus();
      return;
    }

    /*
      IMPORTANTE: esta web es estática, así que el mensaje todavía no se envía a ningún sitio.
      Para recibirlo por email, conecta el formulario a un servicio como Formspree o Netlify Forms
      (por ejemplo: fetch("https://formspree.io/f/TU_ID", { method: "POST", body: new FormData(form),
      headers: { Accept: "application/json" } })) y muestra el mensaje de éxito cuando responda.
    */
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
