# reporteria1 · TORUS avance de obra

Tablero público de avance de obra de los proyectos de TORUS, publicado con GitHub Pages e insertado en el sitio de TORUS (Wix).

- `reporte.js` — tablero embebible (avance, curva histórica, carrusel de fotos con descripciones cortas).
- `<proyecto>/datos.json` — datos públicos del proyecto. **Nunca** contiene presupuesto, renglones, pendientes ni acuerdos.
- `<proyecto>/fotos/` — fotos publicadas (sin metadatos de ubicación).
- `<proyecto>/index.html` — página lista para mostrar dentro de Wix.
- `tools/publicar.py` — convierte un reporte emitido de la bitácora en datos públicos.

Se actualiza desde la bitácora de obra con el botón **Publicar en sitio**.
