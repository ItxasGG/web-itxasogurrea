# Cómo publicar un artículo en el blog

1. **Imagen destacada.** Guárdala en `blog/images/` (JPG o PNG, horizontal, al menos 1200 px de ancho; se verá recortada en 16:9). Usa un nombre sin espacios ni tildes, por ejemplo `gestion-del-estres.jpg`.

2. **Texto.** Copia `blog/posts/plantilla-articulo.md`, ponle el nombre del artículo (por ejemplo `gestion-del-estres.md`) y rellena los datos de arriba:
   - `titulo`: el título que se verá en la página.
   - `slug`: la dirección. Solo minúsculas sin tildes, números y guiones. Ejemplo: `gestion-del-estres` → www.itxasogurrea.com/blog/gestion-del-estres
   - `fecha`: AAAA-MM-DD, por ejemplo `2026-11-20`.
   - `extracto`: dos o tres frases para la tarjeta del listado.
   - `imagen`: `images/` + el nombre del archivo de la imagen.
   - `imagen_alt`: qué se ve en la imagen, para quien no puede verla.
   - `titulo_seo` y `descripcion_seo`: lo que aparecerá en Google.
   - `borrador`: `si` mientras no quieras publicarlo; `no` para publicarlo.
   - Opcional: `boton_final_texto` y `boton_final_enlace` para cambiar el botón verde del final del artículo (si no se ponen, es «Reservar entrevista gratuita» hacia /entrevista-gratuita).

   Debajo de la segunda línea `---` escribe el artículo:
   - Párrafos separados por una línea en blanco.
   - `## Subtítulo` y `### Subtítulo más pequeño`.
   - `- punto` para listas y `1. paso` para listas numeradas.
   - `> frase` para una cita destacada.
   - `**negrita**`, `*cursiva*` y `[texto](https://enlace)`.
   - `![descripción](images/foto.jpg)` para una imagen dentro del texto.
   - `[Botón: texto del botón](https://enlace)` en una línea sola para un botón verde.

3. **Generar las páginas.** En la carpeta de la web ejecuta:

       python3 blog/build.py

   Crea el listado, la página del artículo, las imágenes WebP y las entradas del sitemap. Si falta algún dato, te dice cuál.

4. **Publicar.** Sube los cambios a GitHub; Cloudflare publica la web automáticamente.

Para ver también los borradores (solo en una copia de prueba, no en la web real): `python3 blog/build.py --borradores`.
