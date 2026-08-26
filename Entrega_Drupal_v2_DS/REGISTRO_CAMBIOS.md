# Registro de cambios — Entrega Drupal v2 (UNDP DS)

## 2026-08-26 — Primera versión v2 sobre el UNDP Design System

- Origen: observación del usuario — la v1 cumplía las reglas de publicación pero
  no los estilos/parámetros del DS de PNUD ("sistema paralelo").
- Nueva capa de presentación `assets/app-ds.jsx` + `assets/styles-ds.css`
  (namespace `.atlas-ds`, tokens `--undpds-*`, componentes del DS; misma lógica
  y datos que la app original).
- Correcciones conocidas del DS aplicadas: `--undpds-color-blue-800` definido
  (anillo de foco); foco del modal gestionado por JS propio; visibilidad del
  modal declarada explícitamente; `prefers-reduced-motion`.
- Verificado con Chrome headless sobre el host simulado con el CSS del DS desde
  CDN: EN y ES completos, mapa con escala DS y Brasil aparte, filtros
  `select-default`, tabla Noteworthy, modal ES con deep-link `?case=c004`.
- La v1 (`Entrega_Drupal/`) queda intacta para rollback/comparación.
