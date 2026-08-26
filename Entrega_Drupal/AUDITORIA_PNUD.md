# Auditoría del desarrollo "Atlas of Innovation" contra las reglas de publicación PNUD

Fecha: 2026-08-26 · Referencia: reglas de publicación establecidas para los desarrollos
PNUD en Drupal (proyecto Soluciones Integrales, ago 2026) · Auditado: versión `v1.0-pre-drupal`.

| # | Regla PNUD | Estado v1 | Acción en esta versión |
|---|---|---|---|
| 1 | El código debe ser un **fragmento**: sin `<!DOCTYPE>`, `<html>`, `<head>`, `<meta>`, `<title>`, `<body>` | ❌ `index.html` es un documento completo (es un mockup) | Nuevo build `tools/build_drupal_embed.py` que genera el fragmento; verificación automática por regex de que no viajen etiquetas de documento |
| 2 | Se conservan `<link>` externos, `<style>`, el wrapper y los `<script>` CDN/inline | ✅ (Google Fonts, React/d3 por CDN) | Sin cambios; además el JSX se transpila EN BUILD, así el fragmento no carga Babel (−2,9 MB y sin eval en el host) |
| 3 | Todo el CSS con namespace del wrapper; colisiones de clases genéricas del tema: declarar explícitamente las propiedades que el tema pueda pisar | ✅ parcial: todo bajo `.atlas-app` y clases propias `atlas-*` (no se usa `.modal`) | Endurecimiento añadido: `visibility/opacity/display` explícitos en `.atlas-overlay`, `.atlas-panel`, `.atlas-dropdown` (lección del modal invisible de jun-2026) |
| 4 | Idioma por `data-lang="es|en"` en el wrapper; NO depender de `<html lang>`; un archivo por idioma | ❌ el idioma venía de `?lang`/localStorage | Implementado `data-lang` en `#atlas-root` con prioridad máxima; cuando está presente, el idioma queda fijo y el selector EN/ES interno SE OCULTA (el host tiene el suyo). Se entregan dos archivos |
| 5 | No tocar el host: nada de `document.title`, `<html lang>`, localStorage con claves genéricas | ✅ casi: no se toca `document.*` del host; localStorage usa clave propia `atlas-lang` | En modo embed (data-lang) tampoco se escribe localStorage. Los listeners de documento (Escape, clic-fuera) no mutan el host |
| 6 | Entrega en carpeta con build regenerable + registro de cambios | ❌ no existía | Esta carpeta: fragmentos + previews + `REGISTRO_CAMBIOS.md`; build regenerable |

## Hallazgos adicionales (no bloqueantes)

- **Imágenes**: el fragmento no puede depender de rutas relativas → se sirven por URL
  absoluta desde GitHub Pages del proyecto (`ASSETS_BASE` en el build). Si el cliente
  prefiere alojarlas en su Drupal/CDN, se cambia la constante y se regenera.
- **Peso**: 694 KB por fragmento (datos de los 112 casos + mapa mundial inline).
  Dentro de lo manejable para un campo de contenido; si el Drupal impusiera un límite
  menor, la alternativa es servir `cases.js`/`world110m.js` como archivos y dejar solo
  los `<script src>` en el fragmento.
- **Deep-link** `?case=cXXX` sigue funcionando en el embed (lee el query string de la
  página anfitriona sin modificarlo).
- **El mockup (`index.html`) y el standalone NO cambian**: siguen siendo las piezas de
  revisión; el comportamiento sin `data-lang` es idéntico al de antes (toggle visible).

## Rollback

La versión previa a esta adaptación está etiquetada en git como **`v1.0-pre-drupal`**
(disponible también en GitHub). Restaurar: `git checkout v1.0-pre-drupal`.
