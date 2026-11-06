# Registro de cambios — Entrega Drupal v2 (UNDP DS)

## 2026-11-06 — Imagen para Spotlight sin foto

- Los tres casos Spotlight sin imagen (c004 Portal de Participação Cidadã, c014 Les
  ondes de la parole publique, c017 Ancla de Voces de Chinú) usan ahora el banner
  general del Atlas (`Insumos/IMG_9667.jpg`), recortado a 16:9 (1420×799) para las
  tarjetas, conservando el logo UNDP y sin el bloque "in collaboration with: catálise".
- Cifras (stats-card): el número ya no se parte en dos líneas en anchos medianos y
  móvil ("11 / 2" en 1080 px); tamaño fluido `clamp(2.5rem, 7vw, 6.875rem)` sin salto.
- Capturas del sitio en `capturas/` (EN y ES): 1440×926, 1080×720 y 1600×900 (16:9,
  proporción de las tarjetas), cada una también en @2x para alta resolución.

## 2026-10-20 — Ajustes del cliente ("Ajustes atlas.docx")

- Logo: se reemplaza la franja "UNDP · Catálise" (`logos-white.png`) por el
  **logo vertical de UNDP** en blanco (`assets/img/undp-vertical-white.svg`,
  archivo entregado por el cliente). Se **quita el logo de Catálise**.
- Nuevo enlace en la franja superior: "Acceso a la información — Descarga el
  informe completo (PDF) y mira el video" → https://www.undp.org/governance/access-information
  (EN: "Access to information — Download the full report (PDF) and watch the video").
- La franja pasa a dos columnas (enlace a la izquierda, logo a la derecha) y se
  acomoda en dos líneas en pantallas angostas.
- El logo va **incrustado en el fragmento** (data URI base64, ~25 KB) para no depender
  de que el SVG esté publicado en GitHub Pages.
- Mapa: los países sin casos usaban `gray-200`, el mismo gris del fondo del mapa
  (`surface-default`), y el mapa base no se veía. Ahora usan `gray-400` (mapa y leyenda).

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
