# Atlas of Innovation in Public Communication — Case Repository

Repositorio interactivo de **112 casos** de innovación en comunicación pública
(UNDP + Catálise Social, open call global 2025–2026). Bilingüe EN/ES.

**Demo:** https://dyoma-web.github.io/atlas-innovation/

## Estructura

- `index.html` — mockup de desarrollo (requiere servidor http; con doble clic no carga por CORS de Babel).
- `standalone/atlas-repository-standalone.html` — versión autocontenida: funciona con **doble clic**, sin internet (librerías, fuentes, datos, mapa e imágenes embebidos).
- `assets/` — desarrollo: `app.jsx` (React 18 + Babel in-browser), `styles.css` (tokens bajo `.atlas-app`), `cases.js` (datos generados), `images.js` + `img/spotlight/`, `world110m.js` (TopoJSON), texturas.
- `tools/` — pipeline regenerable:
  - `xlsx_to_cases.py` — Excel del cliente → `assets/cases.js` (normalización + bilingüe).
  - `extract_report_categories.py` + `build_categories.py` — categorías oficiales desde el Final Report (PDF) + propuestas.
  - `merge_es.py` — fusiona las traducciones ES (`es_parts/`) en `es_translations.json`.
  - `download_drive_material.py` + `build_spotlight_images.py` — material gráfico Spotlight desde Drive → imágenes web optimizadas.
  - `build_standalone.py` — genera el standalone (vendor cacheado en `tools/vendor/`, gitignored).
  - `CATEGORIAS_VALIDACION.md` — categorías propuestas pendientes de validación del cliente.
- `DESIGN-SYSTEM_atlas.md` — sistema de diseño (línea gráfica oficial del Atlas).

## Integración en Drupal

El desarrollo se diseñó para **embeberse** en el Drupal del cliente: sin banner,
sin logos y sin footer (los aporta el entorno anfitrión). Todo el CSS vive bajo
la clase raíz `.atlas-app`. Configuración del embed:

- Idioma inicial: `?lang=es|en` o `window.ATLAS_LANG = 'es'` (el toggle persiste en localStorage).
- Enlace directo a un caso: `?case=c004`.
- Notas de producción internas (no públicas): `window.ATLAS_SHOW_PROD = true`.

## Regenerar tras actualizar el Excel

```bash
python tools/xlsx_to_cases.py      # datos
python tools/build_standalone.py   # standalone
```

## Pendientes conocidos

- Validación del cliente: 9 categorías propuestas (`tools/CATEGORIAS_VALIDACION.md`) y 3 casos sin descripción.
- Material gráfico faltante: Portal TCU (solo logos), Les ondes de la parole publique (carpeta vacía), Ancla de Voces (solo PDF de métricas).
