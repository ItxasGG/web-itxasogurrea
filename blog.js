/* =========================================================
   Itxaso Gurrea · blog.js
   Botón «Copiar enlace» de los artículos del blog.
   ========================================================= */

(function () {
  "use strict";

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (ok, mal) {
      var campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.appendChild(campo);
      campo.select();
      try { document.execCommand("copy") ? ok() : mal(); } catch (e) { mal(e); }
      campo.remove();
    });
  }

  document.querySelectorAll("[data-copiar]").forEach(function (boton) {
    var aviso = boton.closest(".post__share").querySelector(".post__copied");
    var temporizador;
    boton.addEventListener("click", function () {
      copiar(boton.getAttribute("data-copiar")).then(function () {
        aviso.textContent = "Enlace copiado";
      }, function () {
        aviso.textContent = "No se ha podido copiar. Copia la dirección de la barra del navegador.";
      });
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { aviso.textContent = ""; }, 4000);
    });
  });
})();
