/* =========================================================
   Itxaso Gurrea · chat.js
   Asistente de Pickaxe "Pregunta al Coach" como burbuja flotante
   en todas las páginas, con una etiqueta junto a la burbuja.
   ========================================================= */

(function () {
  const PICKAXE_ID = "deployment-1cd7b228-7e39-4c35-8f69-d287edb75e95";
  const PICKAXE_SCRIPT = "https://studio.pickaxe.co/api/embed/bundle.js";
  const PICKAXE_BUTTON = ".pickaxe-embed > button";

  function init() {
    if (document.getElementById(PICKAXE_ID)) return;

    // Código de Pickaxe: contenedor + script (crea su propia burbuja flotante)
    const embed = document.createElement("div");
    embed.id = PICKAXE_ID;
    document.body.appendChild(embed);

    const script = document.createElement("script");
    script.src = PICKAXE_SCRIPT;
    script.defer = true;
    document.body.appendChild(script);

    // Etiqueta "Pregunta al Coach" junto a la burbuja
    const label = document.createElement("button");
    label.type = "button";
    label.className = "chat-label";
    label.textContent = "Pregunta al Coach";
    label.setAttribute("aria-label", "Abrir el chat Pregunta al Coach");
    document.body.appendChild(label);

    let open = false;
    const sync = () => document.body.classList.toggle("chat-open", open);

    // La burbuja de Pickaxe abre y cierra el chat: seguimos su estado
    document.addEventListener("click", (e) => {
      if (e.target.closest(PICKAXE_BUTTON)) {
        open = !open;
        sync();
      }
    });

    // La etiqueta abre el chat pulsando la burbuja de Pickaxe
    label.addEventListener("click", () => {
      const bubble = document.querySelector(PICKAXE_BUTTON);
      if (bubble) bubble.click();
    });

    // Muestra la etiqueta solo cuando la burbuja de Pickaxe ya está cargada
    const reveal = () => {
      if (document.querySelector(PICKAXE_BUTTON)) {
        document.body.classList.add("chat-ready");
        return true;
      }
      return false;
    };
    if (!reveal()) {
      const observer = new MutationObserver(() => {
        if (reveal()) observer.disconnect();
      });
      observer.observe(embed, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
