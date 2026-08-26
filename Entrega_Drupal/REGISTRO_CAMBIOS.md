# Registro de cambios — Entrega Drupal del Atlas

## 2026-08-26 — Primera entrega Drupal (versión alterna auditada)

- Auditoría del desarrollo contra las 6 reglas de publicación PNUD (`AUDITORIA_PNUD.md`).
- Rollback point: tag git `v1.0-pre-drupal` (local y en GitHub).
- Nuevo `tools/build_drupal_embed.py`: genera fragmentos ES/EN sin etiquetas de
  documento (verificación automática), JSX pre-transpilado (sin Babel en el host),
  texturas como data-URI, imágenes por URL absoluta (GitHub Pages).
- `assets/app.jsx`: soporte `data-lang` en `#atlas-root` (prioridad máxima; fija el
  idioma, oculta el selector interno y desactiva la escritura en localStorage).
- `assets/styles.css`: endurecimiento anti-colisión — `visibility/opacity/display`
  explícitos en overlay, panel y dropdown.
- Previews `preview-es.html` / `preview-en.html` que simulan el host Drupal;
  verificados con Chrome headless (ES sin selector de idioma; ficha visible sobre
  el host con deep-link `?case=c004`).
- El mockup (`index.html`), el standalone y la versión de GitHub Pages no cambian
  de comportamiento.
