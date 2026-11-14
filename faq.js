/* =========================================================
   Itxaso Gurrea · faq.js
   Buscador y filtros por categoría para las preguntas frecuentes.
   Las preguntas están escritas en preguntas-frecuentes.html (así las
   leen Google y los asistentes de IA). Cada pregunta lleva su
   categoría en el atributo data-cat.
   ========================================================= */

const FAQ_CATEGORIES = {
  "general": "Coaching en general",
  "itxaso": "Sobre Itxaso",
  "individual": "Coaching 1:1",
  "vida": "Vida y autoestima",
  "circulo": "Círculo PRO",
  "sinergia": "Sinergia Líder",
  "cursos": "Cursos y seminarios",
  "precios": "Precios y contratación",
  "dudas": "Expectativas y dudas"
};

document.addEventListener("DOMContentLoaded", () => {
  const faqList = document.getElementById("faqList");
  const faqSearch = document.getElementById("faqSearch");
  const faqFilters = document.getElementById("faqFilters");
  const faqEmpty = document.getElementById("faqEmpty");
  if (!faqList) return;
  let activeCat = "all";

  const normalize = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Abrir y cerrar cada respuesta
  const faqItems = [...faqList.querySelectorAll(".faq-item")].map((el) => {
    const btn = el.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const open = el.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    return { el, cat: el.dataset.cat, text: normalize(el.textContent) };
  });

  function renderFaq() {
    const terms = normalize(faqSearch.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    faqItems.forEach(({ el, cat, text }) => {
      const show = (activeCat === "all" || cat === activeCat) && terms.every((t) => text.includes(t));
      el.hidden = !show;
      if (show) visible++;
    });
    faqEmpty.hidden = visible > 0;
  }

  // Filtros por categoría
  [["all", "Todas"], ...Object.entries(FAQ_CATEGORIES)].forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "faq-filter" + (key === "all" ? " is-active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      activeCat = key;
      faqFilters.querySelectorAll(".faq-filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderFaq();
    });
    faqFilters.appendChild(btn);
  });

  faqSearch.addEventListener("input", renderFaq);
  renderFaq();
});
