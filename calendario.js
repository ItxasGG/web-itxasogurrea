/* =========================================================
   Itxaso Gurrea · calendario.js
   - Oculta las fechas que ya han pasado (elementos con data-fin)
   - Dibuja el calendario mensual a partir de data/formaciones.js
   ========================================================= */

(function () {
  "use strict";

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var isoDia = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var mayus = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* Fecha y hora actuales en Madrid, como "AAAA-MM-DDTHH:MM" */
  function ahoraMadrid() {
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute;
    } catch (e) {
      var d = new Date();
      return isoDia(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
    }
  }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* ---------- 1. Ocultar fechas pasadas ---------- */
  var ahora = ahoraMadrid();
  document.querySelectorAll("[data-fin]").forEach(function (item) {
    if (item.getAttribute("data-fin") < ahora) item.hidden = true;
  });
  document.querySelectorAll("[data-proximas]").forEach(function (lista) {
    var visibles = lista.querySelectorAll("[data-fin]:not([hidden])").length;
    var vacio = document.getElementById(lista.getAttribute("data-proximas"));
    if (!visibles) {
      lista.hidden = true;
      if (vacio) vacio.hidden = false;
    }
  });

  /* ---------- 2. Calendario ---------- */
  var cal = document.getElementById("calendario");
  if (!cal || !window.FORMACIONES) return;

  var titulo = document.getElementById("cal-titulo");
  var cuerpo = document.getElementById("cal-cuerpo");
  var btnAnterior = document.getElementById("cal-anterior");
  var btnSiguiente = document.getElementById("cal-siguiente");

  /* Formaciones agrupadas por día */
  var porDia = {};
  window.FORMACIONES.forEach(function (f) {
    f.fechas.forEach(function (fecha) {
      (porDia[fecha.dia] = porDia[fecha.dia] || []).push({ f: f, fecha: fecha });
    });
  });
  Object.keys(porDia).forEach(function (k) {
    porDia[k].sort(function (a, b) { return a.fecha.inicio < b.fecha.inicio ? -1 : 1; });
  });

  var hoy = new Date();
  var hoyISO = isoDia(hoy);
  var anio = hoy.getFullYear();
  var mes = hoy.getMonth();
  var abierto = null; // panel desplegado en móvil

  function claseTipo(tipo) {
    return "cal-tag cal-tag--" + tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
  }

  function etiquetas(f) {
    var cont = el("span", "cal-tags");
    cont.appendChild(el("span", claseTipo(f.tipo), f.tipo));
    if (f.acceso === "miembros") cont.appendChild(el("span", "cal-tag cal-tag--miembros", "Solo miembros"));
    return cont;
  }

  function textoAccesible(fecha, lista) {
    return fecha.getDate() + " de " + MESES[fecha.getMonth()] + ": " + lista.map(function (x) {
      return x.f.titulo + ", " + x.fecha.inicio + (x.f.acceso === "miembros" ? ", solo miembros" : "");
    }).join("; ");
  }

  function numero(fecha, esHoy) {
    var n = el("span", "cal__num", String(fecha.getDate()));
    if (esHoy) n.appendChild(el("span", "sr-only", " (hoy)"));
    return n;
  }

  function evento(x) {
    var ev = el("span", "cal__ev");
    ev.appendChild(etiquetas(x.f));
    ev.appendChild(el("span", "cal__ev-title", x.f.titulo));
    ev.appendChild(el("span", "cal__ev-time", x.fecha.inicio));
    return ev;
  }

  function cerrarPanel(devolverFoco) {
    if (!abierto) return;
    abierto.fila.remove();
    abierto.boton.setAttribute("aria-expanded", "false");
    abierto.boton.classList.remove("is-selected");
    if (devolverFoco) abierto.boton.focus();
    abierto = null;
  }

  function alternarPanel(fecha, lista, filaSemana, boton) {
    var iso = isoDia(fecha);
    var mismo = abierto && abierto.iso === iso;
    cerrarPanel(false);
    if (mismo) return;

    var fila = el("tr", "cal__panel-row");
    var celda = el("td");
    celda.colSpan = 7;
    var panel = el("div", "cal__panel");
    panel.id = "cal-panel";
    panel.appendChild(el("h3", "cal__panel-date",
      mayus(DIAS[(fecha.getDay() + 6) % 7]) + " " + fecha.getDate() + " de " + MESES[fecha.getMonth()]));

    lista.forEach(function (x) {
      var item = el("div", "cal__panel-item");
      item.appendChild(etiquetas(x.f));
      item.appendChild(el("p", "cal__panel-title", x.f.titulo));
      item.appendChild(el("p", "cal__panel-time", "De " + x.fecha.inicio + " a " + x.fecha.fin + " (hora peninsular)"));
      var enlace = el("a", "btn btn--primary btn--sm", "Ver formación");
      enlace.href = x.f.url;
      enlace.setAttribute("aria-label", "Ver formación: " + x.f.titulo);
      item.appendChild(enlace);
      panel.appendChild(item);
    });

    celda.appendChild(panel);
    fila.appendChild(celda);
    filaSemana.after(fila);
    boton.setAttribute("aria-expanded", "true");
    boton.classList.add("is-selected");
    abierto = { iso: iso, fila: fila, boton: boton };
  }

  function celdaDia(fecha, filaSemana) {
    var td = el("td", "cal__day");
    var iso = isoDia(fecha);
    var otroMes = fecha.getMonth() !== mes;
    var esHoy = iso === hoyISO;
    if (otroMes) td.classList.add("is-other");
    if (esHoy) {
      td.classList.add("is-today");
      td.setAttribute("aria-current", "date");
    }

    var lista = !otroMes && porDia[iso];
    if (!lista) {
      var simple = el("div", "cal__cell");
      simple.appendChild(numero(fecha, esHoy));
      td.appendChild(simple);
      return td;
    }

    td.classList.add("has-events");
    var etiqueta = textoAccesible(fecha, lista);

    /* Ordenador y tablet: toda la celda enlaza a la formación */
    if (lista.length === 1) {
      var enlace = el("a", "cal__cell cal__link");
      enlace.href = lista[0].f.url;
      enlace.setAttribute("aria-label", etiqueta);
      enlace.appendChild(numero(fecha, esHoy));
      enlace.appendChild(evento(lista[0]));
      td.appendChild(enlace);
    } else {
      var varios = el("div", "cal__cell cal__multi");
      varios.appendChild(numero(fecha, esHoy));
      lista.forEach(function (x) {
        var a = el("a", "cal__link cal__link--item");
        a.href = x.f.url;
        a.setAttribute("aria-label", textoAccesible(fecha, [x]));
        a.appendChild(evento(x));
        varios.appendChild(a);
      });
      td.appendChild(varios);
    }

    /* Móvil: número + punto; al tocar se despliega el panel */
    var boton = el("button", "cal__btn");
    boton.type = "button";
    boton.setAttribute("aria-label", etiqueta);
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", "cal-panel");
    boton.appendChild(numero(fecha, esHoy));
    boton.appendChild(el("span", "cal__dot"));
    boton.addEventListener("click", function () { alternarPanel(fecha, lista, filaSemana, boton); });
    td.appendChild(boton);
    return td;
  }

  function dibujar() {
    abierto = null;
    titulo.textContent = mayus(MESES[mes]) + " " + anio;
    cuerpo.textContent = "";

    var desfase = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes = 0
    var diasMes = new Date(anio, mes + 1, 0).getDate();
    var semanas = Math.ceil((desfase + diasMes) / 7);

    for (var s = 0; s < semanas; s++) {
      var fila = el("tr");
      for (var d = 0; d < 7; d++) {
        fila.appendChild(celdaDia(new Date(anio, mes, 1 - desfase + s * 7 + d), fila));
      }
      cuerpo.appendChild(fila);
    }
  }

  function cambiarMes(paso) {
    mes += paso;
    if (mes < 0) { mes = 11; anio--; }
    if (mes > 11) { mes = 0; anio++; }
    dibujar();
  }

  btnAnterior.addEventListener("click", function () { cambiarMes(-1); });
  btnSiguiente.addEventListener("click", function () { cambiarMes(1); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && abierto) cerrarPanel(true);
  });

  cal.hidden = false;
  dibujar();
})();
