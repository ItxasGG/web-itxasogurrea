/* =========================================================
   Itxaso Gurrea · data/formaciones.js
   Lista única de formaciones. El calendario (calendario.html)
   se genera a partir de este archivo.

   Todas las horas están en hora peninsular española (Europe/Madrid).

   Campos de cada formación:
   - id:        identificador (coincide con el nombre de su página)
   - titulo:    título visible
   - tipo:      "Seminario" o "Masterclass"
   - acceso:    "miembros" (solo miembros) o "abierta"
   - formato:   por ejemplo "Online"
   - duracion:  por ejemplo "90 minutos"
   - fechas:    una o varias; cada una con dia (AAAA-MM-DD),
                inicio (HH:MM) y fin (HH:MM)
   - resumen:   resumen breve
   - url:       página de la formación

   Al añadir una formación, actualiza también:
   la lista "Próximas formaciones" de calendario.html,
   su página en formaciones/ y sitemap.xml.
   ========================================================= */

window.FORMACIONES = [
  {
    id: "seminario-circulo-pro",
    titulo: "Seminario Círculo PRO",
    tipo: "Seminario",
    acceso: "miembros",
    formato: "Online",
    duracion: "90 minutos",
    fechas: [
      { dia: "2026-11-16", inicio: "11:00", fin: "12:30" },
      { dia: "2026-11-23", inicio: "11:00", fin: "12:30" },
      { dia: "2026-12-14", inicio: "11:00", fin: "12:30" }
    ],
    resumen: "Seminario del programa Círculo PRO, exclusivo para sus miembros (incluido en la membresía).",
    url: "formaciones/seminario-circulo-pro.html"
  },
  {
    id: "masterclass-objetivos-2027",
    titulo: "Masterclass «Objetivos 2027»",
    tipo: "Masterclass",
    acceso: "abierta",
    formato: "Online",
    duracion: "60 minutos",
    fechas: [
      { dia: "2026-12-16", inicio: "20:30", fin: "21:30" }
    ],
    resumen: "Qué propósitos eliges y qué sentido quieres darle al año desde el principio. Abierta y gratuita.",
    url: "formaciones/masterclass-objetivos-2027.html"
  }
];
