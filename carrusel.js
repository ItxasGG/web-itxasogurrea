/* =========================================================
   Itxaso Gurrea · carrusel.js
   Carrusel de testimonios de la portada (sin librerías).
   - Flechas anterior / siguiente (una tarjeta por pulsación)
   - Contador «2 / 8»
   - Teclado: flechas izquierda y derecha con el foco dentro
   - «Leer testimonio completo» / «Leer menos» en citas largas
   El deslizamiento con el dedo, el trackpad y el ajuste de cada
   tarjeta al borde izquierdo los hace el navegador (CSS scroll-snap).
   ========================================================= */

(function () {
  "use strict";

  function init() {
    var lista = document.getElementById("tcar-lista");
    if (!lista) return;
    var seccion = lista.closest("section");
    var controles = seccion.querySelector(".tcar__controls");
    var btnAnterior = seccion.querySelector("[data-tcar-anterior]");
    var btnSiguiente = seccion.querySelector("[data-tcar-siguiente]");
    var actual = seccion.querySelector("[data-tcar-actual]");
    var total = seccion.querySelector("[data-tcar-total]");
    var items = [].slice.call(lista.querySelectorAll(".tcar__item"));
    var sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)");

    total.textContent = items.length;
    controles.hidden = false;

    /* Distancia entre el inicio de una tarjeta y la siguiente */
    function paso() {
      if (items.length < 2) return lista.clientWidth;
      return items[1].offsetLeft - items[0].offsetLeft;
    }

    function indice() {
      return Math.round(lista.scrollLeft / paso());
    }

    function irA(i) {
      var max = lista.scrollWidth - lista.clientWidth;
      var destino = Math.max(0, Math.min(i * paso(), max));
      lista.scrollTo({ left: destino, behavior: sinAnimacion.matches ? "auto" : "smooth" });
    }

    function desactivar(boton, si) {
      boton.setAttribute("aria-disabled", si ? "true" : "false");
    }

    function actualizar() {
      var max = lista.scrollWidth - lista.clientWidth;
      var alPrincipio = lista.scrollLeft <= 2;
      var alFinal = lista.scrollLeft >= max - 2;
      desactivar(btnAnterior, alPrincipio);
      desactivar(btnSiguiente, alFinal);
      var n = Math.min(indice() + 1, items.length);
      if (actual.textContent !== String(n)) actual.textContent = n;
    }

    btnAnterior.addEventListener("click", function () {
      if (btnAnterior.getAttribute("aria-disabled") === "true") return;
      irA(indice() - 1);
    });
    btnSiguiente.addEventListener("click", function () {
      if (btnSiguiente.getAttribute("aria-disabled") === "true") return;
      irA(indice() + 1);
    });

    /* Teclado: flechas con el foco dentro del carrusel */
    lista.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); irA(indice() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); irA(indice() - 1); }
    });

    var pendiente = false;
    lista.addEventListener("scroll", function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () { pendiente = false; actualizar(); });
    }, { passive: true });

    /* Citas largas: recortadas a unas 8 líneas con botón para desplegar */
    items.forEach(function (item) {
      var cita = item.querySelector("blockquote");
      if (!cita) return;
      var nombre = item.querySelector("figcaption strong");
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "tcar__more";
      boton.hidden = true;
      boton.setAttribute("aria-expanded", "false");
      if (cita.id) boton.setAttribute("aria-controls", cita.id);
      var quien = nombre ? '<span class="sr-only"> de ' + nombre.textContent + "</span>" : "";
      boton.innerHTML = "Leer testimonio completo" + quien;
      cita.after(boton);

      boton.addEventListener("click", function () {
        var abierto = boton.getAttribute("aria-expanded") === "true";
        cita.classList.toggle("is-clamped", abierto);
        boton.setAttribute("aria-expanded", String(!abierto));
        boton.innerHTML = (abierto ? "Leer testimonio completo" : "Leer menos") + quien;
      });
      item._cita = cita;
      item._boton = boton;
    });

    /* Decide qué citas superan las 8 líneas (se recalcula al cambiar el ancho) */
    function revisarCitas() {
      items.forEach(function (item) {
        var cita = item._cita, boton = item._boton;
        if (!cita) return;
        if (boton.getAttribute("aria-expanded") === "true") return;
        cita.classList.add("is-clamped");
        var largo = cita.scrollHeight > cita.clientHeight + 2;
        if (!largo) cita.classList.remove("is-clamped");
        boton.hidden = !largo;
      });
    }

    var temporizador;
    window.addEventListener("resize", function () {
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { revisarCitas(); actualizar(); }, 150);
    });

    revisarCitas();
    actualizar();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { revisarCitas(); actualizar(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
