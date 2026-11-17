#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Itxaso Gurrea · Generador del blog
==================================

Lee los artículos en Markdown de blog/posts/*.md y genera:
  - blog.html                 → listado (www.itxasogurrea.com/blog)
  - blog/pagina/N.html        → páginas siguientes del listado (si hay más de 9)
  - blog/<slug>.html          → cada artículo (www.itxasogurrea.com/blog/<slug>)
  - las entradas del blog en sitemap.xml
  - versiones WebP de las imágenes de blog/images (con Google Chrome, si está instalado)

Uso (desde la carpeta de la web):
    python3 blog/build.py               genera solo los artículos publicados
    python3 blog/build.py --borradores  incluye también los borradores (solo para vista previa)

No necesita instalar nada: solo usa Python 3.
"""

import base64
import datetime as dt
import html
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import urllib.parse

DOMINIO = "https://www.itxasogurrea.com"
POR_PAGINA = 9
CALENDLY = "https://calendly.com/itxasogurrea/entrevista"
AUTORA = "Itxaso Gurrea"
AUTORA_ID = DOMINIO + "/#itxaso-gurrea"
AUTORA_FOTO = "itxaso-autora-v2.webp"   # en blog/images
AUTORA_BIO = ("Coach ejecutiva y de vida, escritora, formadora y conferenciante. "
              "30 años acompañando a personas y equipos, online desde Bilbao.")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]
CAMPOS = ["titulo", "slug", "fecha", "extracto", "imagen", "imagen_alt", "titulo_seo", "descripcion_seo"]

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLOG = os.path.join(RAIZ, "blog")
POSTS = os.path.join(BLOG, "posts")
IMAGES = os.path.join(BLOG, "images")

errores = []


def e(texto):
    return html.escape(str(texto), quote=True)


def fecha_larga(d):
    return "%d %s, %d" % (d.day, MESES[d.month - 1], d.year)


# ---------------------------------------------------------------------------
# Imágenes: tamaño y conversión a WebP
# ---------------------------------------------------------------------------
def dimensiones(ruta):
    """Ancho y alto de un JPG, PNG o WebP (sin librerías externas)."""
    with open(ruta, "rb") as f:
        d = f.read(65536)
    if d[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", d[16:24])
    if d[:4] == b"RIFF" and d[8:12] == b"WEBP":
        tipo = d[12:16]
        if tipo == b"VP8 ":
            w, h = struct.unpack("<HH", d[26:30])
            return w & 0x3FFF, h & 0x3FFF
        if tipo == b"VP8L":
            b = d[21:25]
            w = 1 + (((b[1] & 0x3F) << 8) | b[0])
            h = 1 + (((b[3] & 0xF) << 10) | (b[2] << 2) | ((b[1] & 0xC0) >> 6))
            return w, h
        if tipo == b"VP8X":
            w = 1 + int.from_bytes(d[24:27], "little")
            h = 1 + int.from_bytes(d[27:30], "little")
            return w, h
    if d[:2] == b"\xff\xd8":
        with open(ruta, "rb") as f:
            f.read(2)
            while True:
                m = f.read(2)
                if len(m) < 2 or m[0] != 0xFF:
                    break
                if m[1] in (0xC0, 0xC1, 0xC2):
                    f.read(3)
                    h, w = struct.unpack(">HH", f.read(4))
                    return w, h
                largo = struct.unpack(">H", f.read(2))[0]
                f.read(largo - 2)
    return None


def a_webp(origen, destino, ancho_max):
    """Convierte a WebP con Google Chrome (canvas). Devuelve True si lo consigue."""
    if not os.path.exists(CHROME):
        return False
    ext = os.path.splitext(origen)[1].lower().lstrip(".")
    mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "webp": "webp"}.get(ext)
    if not mime:
        return False
    with open(origen, "rb") as f:
        datos = base64.b64encode(f.read()).decode()
    pagina = """<!DOCTYPE html><html><body><img id="i" src="data:image/%s;base64,%s">
<script>
window.addEventListener("load", function () {
  var i = document.getElementById("i"), w = Math.min(%d, i.naturalWidth), h = Math.round(i.naturalHeight * w / i.naturalWidth);
  var c = document.createElement("canvas"); c.width = w; c.height = h;
  var x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(i, 0, 0, w, h);
  var p = document.createElement("pre"); p.id = "salida"; p.textContent = c.toDataURL("image/webp", 0.82); document.body.appendChild(p);
});
</script></body></html>""" % (mime, datos, ancho_max)
    with tempfile.TemporaryDirectory() as tmp:
        ruta = os.path.join(tmp, "convertir.html")
        with open(ruta, "w") as f:
            f.write(pagina)
        try:
            r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--dump-dom", "file://" + ruta],
                               capture_output=True, timeout=90)
        except Exception:
            return False
    m = re.search(rb"data:image/webp;base64,([A-Za-z0-9+/=]+)", r.stdout)
    if not m:
        return False
    with open(destino, "wb") as f:
        f.write(base64.b64decode(m.group(1)))
    return True


def imagen_web(relativa, anchos=(640, 1200, 1600)):
    """
    A partir de una imagen de blog/images devuelve {ancho: (ruta relativa a blog/, w, h)}.
    Genera las versiones WebP si no existen o si la original es más nueva.
    Si no se pueden generar, usa la original.
    """
    origen = os.path.join(BLOG, relativa)
    if not os.path.exists(origen):
        errores.append("No encuentro la imagen: blog/%s" % relativa)
        return {}
    base, ext = os.path.splitext(relativa)
    salida = {}
    for ancho in anchos:
        rel = "%s-%d.webp" % (base, ancho)
        destino = os.path.join(BLOG, rel)
        if not os.path.exists(destino) or os.path.getmtime(destino) < os.path.getmtime(origen):
            a_webp(origen, destino, ancho)
        if os.path.exists(destino):
            w, h = dimensiones(destino)
            salida[ancho] = (rel, w, h)
    if not salida:
        dims = dimensiones(origen) or (1200, 675)
        salida[anchos[-1]] = (relativa, dims[0], dims[1])
    return salida


def imagen_redes(relativa):
    """JPG de 1200 px para compartir en redes (WhatsApp y LinkedIn no siempre aceptan WebP).
    Se crea con «sips» (macOS). Si no se puede, devuelve None y se usa la WebP."""
    origen = os.path.join(BLOG, relativa)
    base = os.path.splitext(relativa)[0]
    rel = base + "-redes.jpg"
    destino = os.path.join(BLOG, rel)
    if not os.path.exists(destino) or os.path.getmtime(destino) < os.path.getmtime(origen):
        if shutil.which("sips"):
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", "1200",
                            origen, "--out", destino], capture_output=True)
    if os.path.exists(destino):
        w, h = dimensiones(destino)
        return rel, w, h
    return None


def src_y_srcset(versiones, prefijo):
    claves = sorted(versiones)
    grande = versiones[claves[-1]]
    vistos, partes = set(), []
    for k in claves:   # sin anchos repetidos (si la original es más pequeña que 1600 px)
        if versiones[k][1] not in vistos:
            vistos.add(versiones[k][1])
            partes.append("%s%s %dw" % (prefijo, versiones[k][0], versiones[k][1]))
    srcset = ", ".join(partes)
    return prefijo + grande[0], srcset, grande[1], grande[2]


# ---------------------------------------------------------------------------
# Markdown (lo básico: títulos, párrafos, listas, citas, negritas, enlaces, imágenes)
# ---------------------------------------------------------------------------
def externo(url):
    return url.startswith("http") and "itxasogurrea.com" not in url


def en_linea(texto):
    t = e(texto)
    t = re.sub(r"\[([^\[\]]+)\]\(([^)\s]+)\)",
               lambda m: '<a href="%s"%s>%s</a>' % (
                   m.group(2), ' target="_blank" rel="noopener"' if externo(m.group(2)) else "", m.group(1)), t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)([^*]+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def imagen_md(alt, src, pie, prefijo):
    if src.startswith("http"):
        img = '<img src="%s" alt="%s" loading="lazy">' % (e(src), e(alt))
    else:
        rel = src.lstrip("./")
        if rel.startswith("blog/"):
            rel = rel[5:]
        v = imagen_web(rel, (1200,))
        if not v:
            return ""
        s, srcset, w, h = src_y_srcset(v, prefijo)
        img = '<img src="%s" alt="%s" width="%d" height="%d" loading="lazy" decoding="async">' % (s, e(alt), w, h)
    cap = "<figcaption>%s</figcaption>" % en_linea(pie) if pie else ""
    return "<figure class=\"post__figure\">%s%s</figure>" % (img, cap)


def markdown(texto, prefijo_img):
    lineas = texto.replace("\r\n", "\n").split("\n")
    n_consent = [0]
    out, parrafo, lista, tipo_lista, cita = [], [], [], None, []

    def cerrar_parrafo():
        if parrafo:
            out.append("<p>%s</p>" % en_linea(" ".join(parrafo)))
            parrafo.clear()

    def cerrar_lista():
        nonlocal tipo_lista
        if lista:
            out.append("<%s>%s</%s>" % (tipo_lista, "".join("<li>%s</li>" % en_linea(x) for x in lista), tipo_lista))
            lista.clear()
        tipo_lista = None

    def cerrar_cita():
        if cita:
            out.append('<blockquote class="post__quote"><p>%s</p></blockquote>' % en_linea(" ".join(cita)))
            cita.clear()

    def cerrar_todo():
        cerrar_parrafo(); cerrar_lista(); cerrar_cita()

    for linea in lineas:
        l = linea.rstrip()
        s = l.strip()
        if not s:
            cerrar_todo()
            continue
        m_img = re.match(r'^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$', s)
        if m_img:
            cerrar_todo()
            out.append(imagen_md(m_img.group(1), m_img.group(2), m_img.group(3), prefijo_img))
            continue
        m_priv = re.match(r"^\[(?:Botón|Boton|botón|boton) con privacidad:\s*([^\]]+)\]\(([^)\s]+)\)$", s)
        if m_priv:
            cerrar_todo()
            n_consent[0] += 1
            ident = "consentimiento-%d" % n_consent[0]
            url = m_priv.group(2)
            nueva = ' target="_blank" rel="noopener"' if externo(url) else ""
            aviso = '<span class="sr-only"> (se abre en una pestaña nueva)</span>' if nueva else ""
            out.append(
                '<div class="post__consent-cta" data-consentimiento>'
                '<p class="post__button"><a class="btn btn--primary" href="%s"%s data-requiere="%s">%s%s</a></p>'
                '<p class="post__consent"><input type="checkbox" id="%s"> '
                '<label for="%s">He leído y acepto la <a href="../politica-privacidad.html">política de privacidad</a> '
                'y doy mi consentimiento para el tratamiento de mis datos.</label></p>'
                '<p class="post__consent-msg" role="status" aria-live="polite"></p>'
                '</div>' % (e(url), nueva, ident, e(m_priv.group(1).strip()), aviso, ident, ident))
            continue
        m_btn = re.match(r"^\[(?:Botón|Boton|botón|boton):\s*([^\]]+)\]\(([^)\s]+)\)$", s)
        if m_btn:
            cerrar_todo()
            url = m_btn.group(2)
            nueva = ' target="_blank" rel="noopener"' if externo(url) else ""
            aviso = '<span class="sr-only"> (se abre en una pestaña nueva)</span>' if nueva else ""
            out.append('<p class="post__button"><a class="btn btn--primary" href="%s"%s>%s%s</a></p>'
                       % (e(url), nueva, e(m_btn.group(1).strip()), aviso))
            continue
        m_h = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m_h:
            cerrar_todo()
            nivel = max(2, len(m_h.group(1)))   # el H1 es el título del artículo
            out.append("<h%d>%s</h%d>" % (nivel, en_linea(m_h.group(2)), nivel))
            continue
        if re.match(r"^(-{3,}|\*{3,})$", s):
            cerrar_todo()
            out.append("<hr>")
            continue
        if s.startswith(">"):
            cerrar_parrafo(); cerrar_lista()
            cita.append(s.lstrip(">").strip())
            continue
        m_ul = re.match(r"^[-*+]\s+(.*)$", s)
        m_ol = re.match(r"^\d+[.)]\s+(.*)$", s)
        if m_ul or m_ol:
            cerrar_parrafo(); cerrar_cita()
            nuevo = "ul" if m_ul else "ol"
            if tipo_lista and tipo_lista != nuevo:
                cerrar_lista()
            tipo_lista = nuevo
            lista.append((m_ul or m_ol).group(1))
            continue
        if lista and linea.startswith(("  ", "\t")):
            lista[-1] += " " + s
            continue
        cerrar_lista(); cerrar_cita()
        parrafo.append(s)
    cerrar_todo()
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Lectura de artículos
# ---------------------------------------------------------------------------
def leer_post(ruta):
    with open(ruta, encoding="utf-8") as f:
        texto = f.read()
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", texto, re.S)
    nombre = os.path.basename(ruta)
    if not m:
        errores.append("%s: falta el bloque de datos entre --- al principio." % nombre)
        return None
    datos = {}
    for linea in m.group(1).split("\n"):
        if not linea.strip() or linea.strip().startswith("#") or ":" not in linea:
            continue
        clave, valor = linea.split(":", 1)
        valor = valor.strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
            valor = valor[1:-1]
        datos[clave.strip().lower()] = valor
    faltan = [c for c in CAMPOS if not datos.get(c)]
    borrador = datos.get("borrador", "no").lower() in ("si", "sí", "true", "yes", "1")
    if faltan and not borrador:
        errores.append("%s: faltan datos: %s" % (nombre, ", ".join(faltan)))
        return None
    for c in CAMPOS:
        datos.setdefault(c, "")
    if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", datos["slug"]):
        errores.append("%s: el slug «%s» solo puede tener minúsculas sin tildes, números y guiones." % (nombre, datos["slug"]))
        return None
    try:
        datos["_fecha"] = dt.date.fromisoformat(datos["fecha"])
        datos["_modificado"] = dt.date.fromisoformat(datos.get("modificado") or datos["fecha"])
    except ValueError:
        errores.append("%s: la fecha debe tener el formato AAAA-MM-DD (por ejemplo 2026-11-11)." % nombre)
        return None
    datos["_borrador"] = borrador
    datos["_cuerpo"] = m.group(2)
    datos["_archivo"] = nombre
    return datos


# ---------------------------------------------------------------------------
# Plantillas comunes (misma cabecera y pie que el resto de páginas interiores)
# ---------------------------------------------------------------------------
def version_css():
    with open(os.path.join(RAIZ, "index.html"), encoding="utf-8") as f:
        m = re.search(r"style\.css\?v=([0-9a-z]+)", f.read())
    return m.group(1) if m else "1"


def cabecera(r, v, actual_blog=True):
    blog_attr = ' aria-current="page"' if actual_blog else ""
    return """  <header class="header header--sub is-scrolled">
    <div class="container header__inner">
      <a href="{r}index.html" class="logo"><img src="{r}img/logo.svg?v={v}" alt="" class="logo__icon">Itxaso Gurrea</a>
      <nav class="subnav" aria-label="Navegación principal">
        <a href="{r}blog.html"{b}>Blog</a>
        <a href="{r}calendario.html">Calendario</a>
        <a href="{r}index.html" class="btn btn--primary btn--sm nav__cta">Volver a la web</a>
      </nav>
    </div>
  </header>
""".format(r=r, v=v, b=blog_attr)


def pie(r, v, scripts=""):
    return """  <footer class="footer">
    <div class="container footer__bottom">
      <p>© 2026 Itxaso Gurrea. Todos los derechos reservados.</p>
      <nav class="footer__legal" aria-label="Más información">
        <a href="{r}preguntas-frecuentes.html" class="footer__legal-link">Preguntas frecuentes</a>
        <a href="{r}condiciones-contratacion.html" class="footer__legal-link">Condiciones de contratación</a>
        <a href="{r}politica-privacidad.html" class="footer__legal-link">Política de privacidad</a>
        <a href="{r}aviso-legal.html" class="footer__legal-link">Aviso legal</a>
      </nav>
    </div>
  </footer>
{scripts}  <script src="{r}chat.js?v={v}" defer></script>
</body>
</html>
""".format(r=r, v=v, scripts=scripts)


def cabeza(r, v, titulo, descripcion, canonica, og_tipo, og_imagen, og_alt, extra="", jsonld=None, noindex=False):
    ld = ""
    if jsonld:
        ld = '  <script type="application/ld+json">\n%s\n  </script>\n' % json.dumps(jsonld, ensure_ascii=False, indent=2)
    robots = '  <meta name="robots" content="noindex">\n' if noindex else ""
    return """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{t}</title>
  <meta name="description" content="{d}">
{robots}  <link rel="canonical" href="{c}">
  <meta property="og:type" content="{ot}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="Itxaso Gurrea">
  <meta property="og:url" content="{c}">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:image" content="{oi}">
  <meta property="og:image:alt" content="{oa}">
{extra}  <meta name="twitter:card" content="summary_large_image">
{ld}  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="{r}img/logo.svg?v={v}">
  <link rel="stylesheet" href="{r}style.css?v={v}">
</head>
<body>

""".format(t=e(titulo), d=e(descripcion), c=e(canonica), ot=og_tipo, oi=e(og_imagen), oa=e(og_alt),
           extra=extra, ld=ld, r=r, v=v, robots=robots)


# ---------------------------------------------------------------------------
# Listado
# ---------------------------------------------------------------------------
def tarjeta(p, r, primera):
    img_src, srcset, w, h = src_y_srcset(p["_img"], r + "blog/")
    carga = 'fetchpriority="high"' if primera else 'loading="lazy"'
    return """      <li>
        <article class="bcard">
          <div class="bcard__media">
            <img class="bcard__img" src="{src}" srcset="{srcset}" sizes="(min-width: 1025px) 400px, (min-width: 600px) 50vw, 100vw" width="{w}" height="{h}" alt="{alt}" {carga} decoding="async">
          </div>
          <div class="bcard__body">
            <h2 class="bcard__title"><a class="bcard__link" href="{r}blog/{slug}.html">{titulo}</a></h2>
            <p class="bcard__excerpt">{extracto}</p>
            <span class="bcard__more" aria-hidden="true">Leer más »</span>
            <p class="bcard__date"><time datetime="{iso}">{fecha}</time></p>
          </div>
        </article>
      </li>""".format(src=e(img_src), srcset=e(srcset), w=w, h=h, alt=e(p["imagen_alt"]), carga=carga,
                     r=r, foto=AUTORA_FOTO, autora=AUTORA, slug=p["slug"], titulo=e(p["titulo"]),
                     extracto=e(p["extracto"]), iso=p["_fecha"].isoformat(), fecha=fecha_larga(p["_fecha"]))


def url_pagina(n):
    return DOMINIO + ("/blog" if n == 1 else "/blog/pagina/%d" % n)


def enlace_pagina(n, actual):
    """Enlace relativo desde la página 'actual' a la página n del listado."""
    if actual == 1:
        return "blog.html" if n == 1 else "blog/pagina/%d.html" % n
    return "../../blog.html" if n == 1 else "%d.html" % n


def listado(posts, v):
    paginas = max(1, -(-len(posts) // POR_PAGINA))
    generados = []
    for n in range(1, paginas + 1):
        r = "" if n == 1 else "../../"
        trozo = posts[(n - 1) * POR_PAGINA: n * POR_PAGINA]
        titulo = "Blog de Itxaso Gurrea | Reflexiones sobre estrés, autoestima y cambios vitales"
        if n > 1:
            titulo = "Blog de Itxaso Gurrea · Página %d | Reflexiones sobre estrés, autoestima y cambios vitales" % n
        descripcion = ("Reflexiones de Itxaso Gurrea, coach ejecutiva y de vida, sobre gestión del estrés, "
                       "autoestima, liderazgo y cambios vitales y profesionales.")
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": DOMINIO + "/blog#blog",
            "name": "Reflexiones · Blog de Itxaso Gurrea",
            "url": DOMINIO + "/blog",
            "inLanguage": "es",
            "author": {"@type": "Person", "@id": AUTORA_ID, "name": AUTORA},
            "publisher": {"@type": "Person", "@id": AUTORA_ID, "name": AUTORA},
            "blogPost": [{
                "@type": "BlogPosting",
                "headline": p["titulo"],
                "url": DOMINIO + "/blog/" + p["slug"],
                "datePublished": p["_fecha"].isoformat(),
                "dateModified": p["_modificado"].isoformat(),
                "image": DOMINIO + "/blog/" + p["_img"][max(p["_img"])][0],
                "author": {"@type": "Person", "@id": AUTORA_ID, "name": AUTORA},
            } for p in trozo],
        }
        prev_next = ""
        if n > 1:
            prev_next += '  <link rel="prev" href="%s">\n' % url_pagina(n - 1)
        if n < paginas:
            prev_next += '  <link rel="next" href="%s">\n' % url_pagina(n + 1)
        doc = cabeza(r, v, titulo, descripcion, url_pagina(n), "website", DOMINIO + "/img/og-itxaso-gurrea.jpg",
                     "Itxaso Gurrea, coach ejecutiva y de vida", extra=prev_next, jsonld=jsonld)
        doc += cabecera(r, v)
        doc += """  <main class="section legal-page blog-page">
    <div class="container">
      <header class="blog-head">
        <p class="eyebrow">Blog</p>
        <h1 class="section__title blog-head__title">Reflexiones</h1>
        <p class="blog-head__intro">Este es un espacio para detenernos a pensar. Aquí comparto reflexiones sobre lo que veo cada día en mi trabajo con las personas: el estrés que se confunde con compromiso, la autoestima que depende del rendimiento y los cambios que asustan aunque los deseemos. No encontrarás fórmulas rápidas, sino ideas para mirarte con más honestidad, comprender lo que te pasa y elegir cómo quieres vivir.</p>
      </header>
"""
        if trozo:
            doc += '\n      <ul class="bgrid" role="list">\n%s\n      </ul>\n' % "\n".join(
                tarjeta(p, r, n == 1 and i == 0) for i, p in enumerate(trozo))
        else:
            doc += '\n      <p class="blog-empty">Todavía no hay artículos publicados.</p>\n'
        if paginas > 1:
            items = []
            if n > 1:
                items.append('<a class="bpag__link" href="%s">← Más recientes</a>' % enlace_pagina(n - 1, n))
            for k in range(1, paginas + 1):
                if k == n:
                    items.append('<span class="bpag__link is-current" aria-current="page">%d</span>' % k)
                else:
                    items.append('<a class="bpag__link" href="%s" aria-label="Página %d">%d</a>' % (enlace_pagina(k, n), k, k))
            if n < paginas:
                items.append('<a class="bpag__link" href="%s">Más antiguos →</a>' % enlace_pagina(n + 1, n))
            doc += '\n      <nav class="bpag" aria-label="Páginas del blog">\n        %s\n      </nav>\n' % "\n        ".join(items)
        doc += "    </div>\n  </main>\n\n"
        doc += pie(r, v)
        destino = os.path.join(RAIZ, "blog.html") if n == 1 else os.path.join(BLOG, "pagina", "%d.html" % n)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "w", encoding="utf-8") as f:
            f.write(doc)
        generados.append(destino)
    return paginas


# ---------------------------------------------------------------------------
# Artículo
# ---------------------------------------------------------------------------
ICONO_LINKEDIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
ICONO_WHATSAPP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
ICONO_ENLACE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'


REDES = [
    ("LinkedIn", "https://www.linkedin.com/in/itxasogurrea/", ICONO_LINKEDIN),
    ("Instagram", "https://www.instagram.com/itxaso_gurrea/", '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'),
    ("Facebook", "https://www.facebook.com/itxasocoachingpnl/", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'),
    ("YouTube", "https://www.youtube.com/@itxasogurrea", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>'),
    ("Substack", "https://substack.com/@itxasogurrea", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14M5 8h14"/><path d="M5 12h14v8l-7-4-7 4z"/></svg>'),
]


def articulo(p, todos, v):
    r = "../"
    url = DOMINIO + "/blog/" + p["slug"]
    img_src, srcset, w, h = src_y_srcset(p["_img"], "")
    img_abs = DOMINIO + "/blog/" + p["_img"][max(p["_img"])][0]
    redes = imagen_redes(p["imagen"])
    og_img, og_w, og_h = (DOMINIO + "/blog/" + redes[0], redes[1], redes[2]) if redes else (img_abs, w, h)
    cuerpo = markdown(p["_cuerpo"], "")
    jsonld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url + "#articulo",
        "headline": p["titulo"],
        "description": p["descripcion_seo"],
        "url": url,
        "mainEntityOfPage": url,
        "inLanguage": "es",
        "datePublished": p["_fecha"].isoformat(),
        "dateModified": p["_modificado"].isoformat(),
        "image": {"@type": "ImageObject", "url": img_abs, "width": w, "height": h},
        "author": {"@type": "Person", "@id": AUTORA_ID, "name": AUTORA, "url": DOMINIO + "/"},
        "publisher": {"@type": "Person", "@id": AUTORA_ID, "name": AUTORA, "url": DOMINIO + "/"},
        "isPartOf": {"@type": "Blog", "@id": DOMINIO + "/blog#blog", "name": "Reflexiones · Blog de Itxaso Gurrea", "url": DOMINIO + "/blog"},
    }
    extra = ('  <meta property="og:image:width" content="%d">\n  <meta property="og:image:height" content="%d">\n'
             '  <meta property="article:published_time" content="%s">\n  <meta property="article:modified_time" content="%s">\n'
             '  <meta property="article:author" content="%s">\n') % (og_w, og_h, p["_fecha"].isoformat(), p["_modificado"].isoformat(), AUTORA)
    doc = cabeza(r, v, p["titulo_seo"] or p["titulo"], p["descripcion_seo"] or p["extracto"], url, "article", og_img,
                 p["imagen_alt"], extra=extra, jsonld=jsonld, noindex=p["_borrador"])
    doc += cabecera(r, v)

    # Artículos para la columna lateral («Más artículos») y navegación anterior / siguiente
    otros = [x for x in todos if x["slug"] != p["slug"]][:3]
    pos = [x["slug"] for x in todos].index(p["slug"])
    mas_nuevo = todos[pos - 1] if pos > 0 else None          # «Siguiente»
    mas_antiguo = todos[pos + 1] if pos + 1 < len(todos) else None  # «Anterior»

    lateral = ""
    if otros:
        lateral = """        <section class="post-side__block" aria-labelledby="mas-titulo">
          <h2 id="mas-titulo" class="post-side__title">Más artículos</h2>
          <ul class="post-side__list" role="list">
%s
          </ul>
        </section>
""" % "\n".join("""            <li>
              <article class="bcard bcard--mini">
                <div class="bcard__body">
                  <h3 class="bcard__title"><a class="bcard__link" href="{slug}.html">{titulo}</a></h3>
                  <p class="bcard__excerpt">{extracto}</p>
                  <span class="bcard__more" aria-hidden="true">Leer más »</span>
                  <p class="bcard__date"><time datetime="{iso}">{fecha}</time></p>
                </div>
              </article>
            </li>""".format(slug=x["slug"], titulo=e(x["titulo"]), extracto=e(x["extracto"]),
                             iso=x["_fecha"].isoformat(), fecha=fecha_larga(x["_fecha"])) for x in otros)

    redes_sociales = "".join(
        '<li><a class="social__link" href="%s" target="_blank" rel="noopener" aria-label="%s (se abre en una pestaña nueva)">%s</a></li>' % (u, n, i)
        for n, u, i in REDES)

    navegacion = ""
    if mas_antiguo or mas_nuevo:
        partes = []
        if mas_antiguo:
            partes.append('<a class="post-nav__link post-nav__link--prev" href="%s.html" rel="prev"><span class="post-nav__label">« Anterior</span><span class="post-nav__title">%s</span></a>'
                          % (mas_antiguo["slug"], e(mas_antiguo["titulo"])))
        if mas_nuevo:
            partes.append('<a class="post-nav__link post-nav__link--next" href="%s.html" rel="next"><span class="post-nav__label">Siguiente »</span><span class="post-nav__title">%s</span></a>'
                          % (mas_nuevo["slug"], e(mas_nuevo["titulo"])))
        navegacion = '\n    <nav class="post-nav" aria-label="Otros artículos">\n      <div class="container post-nav__inner">\n        %s\n      </div>\n    </nav>\n' % "\n        ".join(partes)

    texto_compartir = urllib.parse.quote(p["titulo"] + " " + url)
    modificado = ""
    if p["_modificado"] != p["_fecha"]:
        modificado = ' · Actualizado el <time datetime="%s">%s</time>' % (p["_modificado"].isoformat(), fecha_larga(p["_modificado"]))
    doc += """  <main class="section legal-page blog-page post-page">
    <header class="post-banner">
      <div class="container">
        <p class="eyebrow">Blog</p>
        <h1 class="post-banner__title">{titulo}</h1>
      </div>
    </header>

    <div class="container post-layout">
      <article class="post">
        <a class="post__back" href="../blog.html">← Volver al blog</a>
        <p class="post__meta"><time datetime="{iso}">{fecha}</time>{mod} · <span class="post__author">{autora}</span></p>
        <img class="post__hero" src="{src}" srcset="{srcset}" sizes="(min-width: 1025px) 760px, 100vw" width="{w}" height="{h}" alt="{alt}" fetchpriority="high" decoding="async">

        <div class="post__body">
{cuerpo}
        </div>

        <footer class="post__footer">
          <div class="post__share">
            <p class="post__share-label" id="compartir-titulo">Compartir</p>
            <ul class="post__share-list" role="list" aria-labelledby="compartir-titulo">
              <li><a class="social__link post__share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url={url_q}" target="_blank" rel="noopener" aria-label="Compartir en LinkedIn (se abre en una pestaña nueva)">{in_}</a></li>
              <li><a class="social__link post__share-btn" href="https://wa.me/?text={wa}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp (se abre en una pestaña nueva)">{wa_ico}</a></li>
              <li><button type="button" class="social__link post__share-btn" data-copiar="{url}" aria-label="Copiar enlace">{link}</button></li>
            </ul>
            <p class="post__copied" role="status" aria-live="polite"></p>
          </div>

          <aside class="post__author-box" aria-label="Sobre la autora">
            <img class="post__author-photo" src="images/{foto}" alt="{autora}" width="96" height="96" loading="lazy">
            <div>
              <p class="post__author-name">{autora}</p>
              <p class="post__author-bio">{bio}</p>
              <a class="post__author-link" href="../index.html">Conoce a Itxaso →</a>
            </div>
          </aside>

          <div class="post__cta">
            <a class="btn btn--primary" href="../entrevista-gratuita.html">Reservar entrevista gratuita</a>
          </div>
        </footer>
      </article>

      <aside class="post-side" aria-label="Más del blog">
{lateral}        <section class="post-side__follow" aria-labelledby="siguenos-titulo">
          <h2 id="siguenos-titulo" class="post-side__follow-title">Síguenos</h2>
          <ul class="social post-side__social" role="list">{redes}</ul>
        </section>
      </aside>
    </div>
{navegacion}  </main>

""".format(titulo=e(p["titulo"]), foto=AUTORA_FOTO, autora=AUTORA, iso=p["_fecha"].isoformat(),
           fecha=fecha_larga(p["_fecha"]), mod=modificado, src=e(img_src), srcset=e(srcset), w=w, h=h,
           alt=e(p["imagen_alt"]), cuerpo=cuerpo, url_q=urllib.parse.quote(url, safe=""), wa=texto_compartir,
           in_=ICONO_LINKEDIN, wa_ico=ICONO_WHATSAPP, link=ICONO_ENLACE, url=e(url), bio=e(AUTORA_BIO),
           calendly=CALENDLY, lateral=lateral, redes=redes_sociales, navegacion=navegacion)
    doc += pie(r, v, scripts='  <script src="../blog.js?v=%s" defer></script>\n' % v)
    with open(os.path.join(BLOG, p["slug"] + ".html"), "w", encoding="utf-8") as f:
        f.write(doc)


# ---------------------------------------------------------------------------
# Sitemap
# ---------------------------------------------------------------------------
def actualizar_sitemap(posts, paginas):
    ruta = os.path.join(RAIZ, "sitemap.xml")
    with open(ruta, encoding="utf-8") as f:
        s = f.read()
    hoy = max([p["_modificado"] for p in posts], default=dt.date.today()).isoformat()
    bloque = ["  <!-- BLOG:INICIO (lo genera blog/build.py, no editar a mano) -->",
              "  <url>\n    <loc>%s/blog</loc>\n    <lastmod>%s</lastmod>\n    <priority>0.7</priority>\n  </url>" % (DOMINIO, hoy)]
    for n in range(2, paginas + 1):
        bloque.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <priority>0.4</priority>\n  </url>" % (url_pagina(n), hoy))
    for p in posts:
        bloque.append("  <url>\n    <loc>%s/blog/%s</loc>\n    <lastmod>%s</lastmod>\n    <priority>0.6</priority>\n  </url>"
                      % (DOMINIO, p["slug"], p["_modificado"].isoformat()))
    bloque.append("  <!-- BLOG:FIN -->")
    nuevo = "\n".join(bloque)
    if "<!-- BLOG:INICIO" in s:
        s = re.sub(r"  <!-- BLOG:INICIO.*?<!-- BLOG:FIN -->", lambda _: nuevo, s, flags=re.S)
    else:
        s = s.replace("</urlset>", nuevo + "\n</urlset>")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(s)


# ---------------------------------------------------------------------------
def main():
    con_borradores = "--borradores" in sys.argv
    os.makedirs(POSTS, exist_ok=True)
    os.makedirs(IMAGES, exist_ok=True)
    v = version_css()

    leidos = []
    for nombre in sorted(os.listdir(POSTS)):
        if nombre.endswith(".md"):
            p = leer_post(os.path.join(POSTS, nombre))
            if p:
                leidos.append(p)
    publicados = [p for p in leidos if con_borradores or not p["_borrador"]]
    slugs = {}
    for p in publicados:
        if p["slug"] in slugs:
            errores.append("El slug «%s» está repetido en %s y %s." % (p["slug"], slugs[p["slug"]], p["_archivo"]))
        slugs[p["slug"]] = p["_archivo"]
    for p in publicados:
        p["_img"] = imagen_web(p["imagen"]) if p["imagen"] else {}
        if not p["_img"]:
            errores.append("%s: falta la imagen destacada." % p["_archivo"])
    if errores:
        print("\nNo se ha generado el blog. Revisa esto:\n")
        for x in errores:
            print("  · " + x)
        sys.exit(1)

    publicados.sort(key=lambda p: (p["_fecha"], p["slug"]), reverse=True)

    # Borra páginas generadas antes (artículos retirados o páginas del listado que ya no hacen falta)
    for nombre in os.listdir(BLOG):
        if nombre.endswith(".html"):
            os.remove(os.path.join(BLOG, nombre))
    shutil.rmtree(os.path.join(BLOG, "pagina"), ignore_errors=True)

    paginas = listado(publicados, v)
    for p in publicados:
        articulo(p, publicados, v)
    if not con_borradores:
        actualizar_sitemap(publicados, paginas)

    borradores = [p["_archivo"] for p in leidos if p["_borrador"]]
    print("Blog generado: %d artículo(s) publicado(s), %d página(s) de listado." % (
        len([p for p in publicados if not p["_borrador"]]), paginas))
    if borradores:
        print("Borradores %s: %s" % ("incluidos (vista previa)" if con_borradores else "sin publicar", ", ".join(borradores)))


if __name__ == "__main__":
    main()
