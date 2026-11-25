/* =========================================================
   Itxaso Gurrea · newsletter.js
   Formulario «Newsletter» (pie de página
   y final de los artículos del blog). Envía los datos a HubSpot
   con la API pública de formularios (Forms API v3, «submit»).
   La configuración está en newsletter-config.js.
   ========================================================= */

(function () {
  "use strict";

  var CONFIG = window.NEWSLETTER_CONFIG;
  var TEXTO_CONSENTIMIENTO = "He leído y acepto la política de privacidad y quiero recibir la newsletter de Itxaso Gurrea.";
  var MENSAJES = {
    nombre: "Escribe tu nombre para que pueda saludarte",
    email: "Revisa tu email, parece que falta algo",
    casilla: "Marca la casilla para poder suscribirte",
    error: "No he podido completar la suscripción. Inténtalo de nuevo en unos minutos.",
    exito: "¡Casi está! Te he enviado un correo para confirmar tu suscripción. Si no lo ves, revisa la carpeta de spam o promociones."
  };
  var EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function cookie(nombre) {
    var m = document.cookie.match(new RegExp("(?:^|;\\s*)" + nombre + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  function marcarError(campo, texto) {
    var aviso = document.getElementById(campo.getAttribute("data-error"));
    campo.setAttribute("aria-invalid", texto ? "true" : "false");
    campo.classList.toggle("is-invalid", !!texto);
    if (aviso) {
      aviso.textContent = texto || "";
      aviso.hidden = !texto;
    }
  }

  function mostrarExito(form, estado) {
    var caja = form.closest("[data-newsletter-caja]");
    var mensaje = document.createElement("p");
    mensaje.className = "nl__success";
    mensaje.setAttribute("tabindex", "-1");
    mensaje.textContent = MENSAJES.exito;
    form.hidden = true;
    estado.textContent = "";
    estado.appendChild(mensaje);
    mensaje.focus();
    if (caja) caja.classList.add("is-done");
  }

  function iniciar(form) {
    var nombre = form.querySelector("[name=firstname]");
    var email = form.querySelector("[name=email]");
    var casilla = form.querySelector("[name=consent]");
    var trampa = form.querySelector("[name=website]");
    var boton = form.querySelector("button[type=submit]");
    var estado = document.getElementById(form.getAttribute("data-estado"));
    var textoBoton = boton.textContent;
    var enviando = false;

    form.hidden = false; // sin JavaScript el formulario queda oculto y se ve el aviso <noscript>

    var validar = function (campo) {
      if (campo === nombre) marcarError(nombre, nombre.value.trim() ? "" : MENSAJES.nombre);
      if (campo === email) marcarError(email, EMAIL_VALIDO.test(email.value.trim()) ? "" : MENSAJES.email);
      if (campo === casilla) marcarError(casilla, casilla.checked ? "" : MENSAJES.casilla);
      return campo.getAttribute("aria-invalid") !== "true";
    };
    // Al corregir un campo con error, el aviso desaparece
    [nombre, email].forEach(function (c) {
      c.addEventListener("input", function () { if (c.getAttribute("aria-invalid") === "true") validar(c); });
    });
    casilla.addEventListener("change", function () { if (casilla.getAttribute("aria-invalid") === "true") validar(casilla); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando) return;
      estado.textContent = "";

      var ok = [nombre, email, casilla].map(validar);
      if (ok.indexOf(false) !== -1) {
        [nombre, email, casilla][ok.indexOf(false)].focus();
        return;
      }

      // Campo trampa para robots: si viene relleno, no se envía nada
      if (trampa && trampa.value) {
        mostrarExito(form, estado);
        return;
      }

      if (!CONFIG || !CONFIG.portalId || !CONFIG.formGuid) {
        console.error("Newsletter: falta la configuración de HubSpot (newsletter-config.js).");
        estado.textContent = MENSAJES.error;
        return;
      }

      var contexto = { pageUri: window.location.href, pageName: document.title };
      var hutk = cookie("hubspotutk");
      if (hutk) contexto.hutk = hutk;

      var datos = {
        fields: [
          { objectTypeId: "0-1", name: "firstname", value: nombre.value.trim() },
          { objectTypeId: "0-1", name: "email", value: email.value.trim() }
        ],
        context: contexto,
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: TEXTO_CONSENTIMIENTO,
            communications: [
              { value: true, subscriptionTypeId: CONFIG.subscriptionTypeId, text: TEXTO_CONSENTIMIENTO }
            ]
          }
        }
      };

      enviando = true;
      boton.disabled = true;
      boton.textContent = "Enviando…";
      form.setAttribute("aria-busy", "true");

      var url = CONFIG.host + "/submissions/v3/integration/submit/" +
        encodeURIComponent(CONFIG.portalId) + "/" + encodeURIComponent(CONFIG.formGuid);

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      }).then(function (respuesta) {
        if (respuesta.ok) {
          mostrarExito(form, estado);
          return;
        }
        return respuesta.text().then(function (cuerpo) {
          throw new Error("HubSpot respondió " + respuesta.status + ": " + cuerpo);
        });
      }).catch(function (error) {
        console.error("Newsletter: no se ha podido completar la suscripción.", error);
        estado.textContent = MENSAJES.error;
      }).then(function () {
        enviando = false;
        boton.disabled = false;
        boton.textContent = textoBoton;
        form.removeAttribute("aria-busy");
      });
    });
  }

  function arrancar() {
    document.querySelectorAll("form[data-newsletter]").forEach(iniciar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
