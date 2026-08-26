# Entrega Drupal v2 — Atlas of Innovation sobre el UNDP Design System

Versión alterna del embed reconstruida sobre los **estilos y parámetros del UNDP
Design System** (design.undp.org), atendiendo la observación de que la v1 cumplía
las reglas de publicación pero mantenía un sistema visual paralelo.

## Qué cambia frente a la v1 (`Entrega_Drupal/`)

| Aspecto | v1 (línea gráfica Atlas) | v2 (UNDP DS) |
|---|---|---|
| Tokens | Propios (`--deep-ocean`…) | `--undpds-*` del DS (los aporta el host) |
| Tipografía | Host Grotesk + Roboto (Google Fonts) | ProximaNova / Söhne del DS (las carga el host; sin `<link>` de fuentes propio) |
| Componentes | Propios (píldoras, cards con radios y sombras) | DS: `stats-card`, `content-card`, `chip`, `select-default`, `modal`, grid `grid-x/cell`, `cta__link` |
| Ficha de caso | Panel lateral deslizante | **Modal centrado del DS** (`.modal.open`) con foco gestionado por JS propio (el del DS no lo hace) y visibilidad explícita (lección del modal invisible) |
| Filtros | Dropdowns facetados propios | `select-default` del DS (46 px) + chips de filtros activos + búsqueda del DS |
| Noteworthy | Lista propia | Tabla accesible estilo DS |
| Colores del mapa | Azules Atlas | Escala `--undpds-color-blue-200…600` + gris 700 para Brasil |
| Categorías | Píldoras pastel | Puntos/barras de color como paleta de datos (los pastel se conservan SOLO como codificación de datos, no como UI) |
| CSS incluido | Todo el sistema propio | SOLO complementario `.atlas-ds` (el host ya carga base-minimal + components del DS) |

Se conservan de la v1: reglas de publicación (fragmento sin etiquetas de documento,
`data-lang`, sin tocar el host), lógica bilingüe, Brasil como caso aparte, deep-link
`?case=`, accesibilidad (focus-trap, Escape, `prefers-reduced-motion`).

## Archivos

- `atlas-ds-embed-en.html` / `atlas-ds-embed-es.html` — **publicables** (fragmento;
  NO incluyen el CSS del DS porque undp.org ya lo carga).
- `preview-en.html` / `preview-es.html` — **para el servidor de pruebas**: documento
  completo que simula el host Drupal cargando el CSS del DS desde CDN
  (`@undp/design-system-assets@2.0.1`). Abrir por http.
- Fuente: `assets/app-ds.jsx` + `assets/styles-ds.css` · Build: `python tools/build_drupal_embed_v2.py`.

## Rollback

- La **v1 Drupal** sigue intacta en `Entrega_Drupal/`.
- La versión pre-Drupal completa: tag git `v1.0-pre-drupal`.
- El mockup (`index.html`, línea gráfica Atlas) y el standalone no cambian.

## Nota de diseño

La línea gráfica propia del Atlas (guidelines aprobadas por el cliente: Host Grotesk,
azules propios, píldoras) sigue viva en el mockup/standalone. La v2 es la adaptación
al DS para convivir dentro de undp.org; qué versión se publica es decisión del
cliente (v1 = marca Atlas, v2 = DS institucional).
