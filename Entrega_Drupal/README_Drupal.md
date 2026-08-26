# Entrega Drupal — Atlas of Innovation in Public Communication

Fragmentos listos para pegar en el campo de contenido del Drupal de undp.org,
según las reglas de publicación PNUD (ver `AUDITORIA_PNUD.md`).

## Archivos

| Archivo | Uso |
|---|---|
| `atlas-embed-en.html` | **Publicable** — fragmento en inglés (`data-lang="en"`) |
| `atlas-embed-es.html` | **Publicable** — fragmento en español (`data-lang="es"`) |
| `preview-en.html` / `preview-es.html` | **Solo pruebas** — documento completo que simula la página Drupal anfitriona; subir al servidor de pruebas y abrir por http (no publicar) |
| `AUDITORIA_PNUD.md` | Auditoría contra las reglas y decisiones tomadas |
| `REGISTRO_CAMBIOS.md` | Historial de la entrega |

## Cómo publicar

1. Copiar el contenido COMPLETO de `atlas-embed-en.html` (o `-es`) y pegarlo en el
   campo de contenido de la página Drupal correspondiente a ese idioma.
2. No editar a mano: cualquier ajuste se hace en `assets/` y se regenera con
   `python tools/build_drupal_embed.py`.

## Notas técnicas

- El idioma lo fija `data-lang` en `#atlas-root`; el selector EN/ES interno se
  oculta automáticamente en el embed (en el mockup sigue visible).
- El fragmento carga React, ReactDOM, d3 y topojson por CDN; el código de la app
  va pre-transpilado (sin Babel en el navegador).
- Las imágenes Spotlight y el logo se sirven desde
  `https://dyoma-web.github.io/atlas-innovation/` (configurable en `ASSETS_BASE`
  del build si el cliente prefiere su propio hosting).
- Deep-link a un caso: añadir `?case=c004` a la URL de la página anfitriona.
- Rollback de todo el desarrollo: tag git `v1.0-pre-drupal`.
