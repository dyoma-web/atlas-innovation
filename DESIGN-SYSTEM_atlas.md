# Sistema de diseño — "Atlas of Innovation in Public Communication"

Línea gráfica del **Atlas of Innovation in Public Communication** (UNDP + Catálise Social), derivada de `Insumos/atlas_of_innovation_guidelines.pdf` y del wireframe aprobado. Documento de referencia para el desarrollo del repositorio de casos y piezas asociadas.

**Esencia en una frase**: cartográfico e institucional — azules oceánicos en degradación tonal con un único acento naranja solar, curvas topográficas finas como textura, tipografía Host Grotesk + Roboto, píldoras en lo interactivo y pasteles suaves para categorizar.

**Contexto de implementación**: el desarrollo se **embebe en el Drupal del cliente** (igual que el proyecto Exp). No lleva banner/hero, logos ni footer — los aporta el entorno anfitrión. Todos los estilos viven bajo la clase raíz `.atlas-app` para no contaminar el sitio contenedor. Bilingüe EN/ES con disclaimer de idioma obligatorio.

---

## 1. Paleta de color

### Primarios (azules de marca)

| Token | Hex | Uso |
|---|---|---|
| Deep Ocean | `#0e4478` | Fondos oscuros, titulares, color principal de marca; nivel 40+ del mapa |
| Pacific Blue | `#0868af` | Enlaces, identidad, barras de ranking; nivel 8–39 del mapa |
| Sky Blue | `#00abd6` | Apoyos vivos, nivel "High visibility", rangos medios del mapa |
| Ice Blue | `#dfecf5` | Superficies claras, bordes, divisores, fondos suaves |

### Acento

| Token | Hex | Uso |
|---|---|---|
| Solar Orange | `#f7931e` | SOLO énfasis: CTA principal, estado activo (selector de idioma), marcador del nivel Spotlight (punto + borde izquierdo de card). Nunca color dominante ni texto pequeño sobre blanco |

### Secundarios pastel (categorización)

Cada categoría temática tiene un pastel fijo; el texto sobre estos fondos siempre es Deep Ocean:

| Categoría | Hex |
|---|---|
| Clarity in Action | `#ffe5a5` |
| Inclusive Voices | `#c4ebcf` |
| Trust Catalysts | `#f698a4` |
| Exploring New Frontiers | `#d0bade` |
| Dialogue Builders | `#f8b288` |

### Neutros (matiz azul, nunca gris puro)

| Token | Hex | Uso |
|---|---|---|
| Ink | `#0e4478` | Titulares (= Deep Ocean) |
| Text | `#29465c` | Cuerpo de texto |
| Muted | `#55707f` | Secundario, metadatos |
| Faint | `#8ea6b6` | Placeholders, hints |
| Line | `#dfecf5` | Bordes de cards y divisores |
| Line strong | `#d5e4ee` | Bordes de inputs y controles |
| Bg soft | `#fafcfd` | Paneles suaves |
| Bg chip | `#eef4f9` | Chips neutros (país, tipo) |

### Escala del mapa coroplético (casos por país)

`1` → `#b9e3f0` · `2` → `#7fd0e6` · `3–7` → `#00abd6` · `8–39` → `#0868af` · `40+` → `#0e4478` · sin casos → `#e7eef4`. Trazos entre países: blanco.

## 2. Tipografía

- **Host Grotesk** (Google Fonts): títulos, subtítulos, botones, cifras KPI. Pesos 600/700.
- **Roboto** (Google Fonts): cuerpo de texto. Pesos 300/400/500/700. Condensada y legible, complementa a Host Grotesk.
- **IBM Plex Mono**: contadores, numeración de casos, etiquetas técnicas (`SHOWING X OF Y CASES`). Pesos 400/500.
- Escala de referencia: título de sección 40px/700 (letter-spacing −.025em) · título medio 27px/700 (−.02em) · título de card 15.5–20px/600 · cuerpo 13.5–15px/1.6 · metadatos 11–12.5px · eyebrow 11px MAYÚSCULAS letter-spacing .14–.18em.
- Titulares en Deep Ocean; los grandes solo llevan blanco sobre fondos Deep Ocean.

## 3. Forma y geometría

- **Píldora (radius 999px)**: buscador, filtros, chips, tags, botones, selector de idioma.
- Superficies: cards 12–18px · paneles/ficha 22px · dropdowns 14px.
- Bordes 1–1.5px en Line/Line strong. El nivel Spotlight se marca con borde izquierdo de 4px Solar Orange.
- Sombras con tinte azul profundo, nunca negro: sm `0 1px 3px rgba(14,68,120,.08)` · md `0 18px 44px rgba(14,68,120,.16)` · lg (ficha) `-24px 0 70px rgba(8,38,70,.28)`.

## 4. Motivo gráfico: textura topográfica

Líneas finas y curvas orgánicas inspiradas en mapas topográficos (`assets/texture.svg`): contornos concéntricos irregulares y ondas suaves en azules muy claros (`#c9dceb`, `#d5e4ee`), trazo 1px. Es **puramente decorativa** (aria-hidden, pointer-events none), con opacidad ≤ .55 sobre blanco; sobre Deep Ocean se usa en blanco con opacidad ≤ .18. Nunca compite con el contenido.

## 5. Componentes (especificación)

- **Franja de estadísticas**: reemplaza al hero (que aporta Drupal). Cifras KPI en Host Grotesk 700 sobre fondo Deep Ocean o cards claras; etiqueta eyebrow en azul claro.
- **Banda de categorías**: 5 tarjetas clicables con franja superior de 7px en el pastel de la categoría, cifra grande y nombre; al hacer clic filtran el repositorio.
- **Buscador**: input píldora, borde 1.5px Line strong, icono lupa a la izquierda; focus = borde Sky + halo `rgba(0,171,214,.12)`.
- **Filtros facetados**: botones píldora con contador y chevron; activo = borde Pacific + fondo chip; dropdown card blanca sombra md con opciones y conteos. Filtros: Región, País, Tipo de institución, Categoría, Visibilidad, Idioma original.
- **Chips de filtro activo**: píldora fondo `#ffe5a5`, texto Deep Ocean, con × para quitar.
- **Cards de caso**: blanco, borde Line, radius 12–18px; hover = borde `#b9d4e8` + sombra md + elevación −1px. Spotlight: borde izquierdo Solar. Estructura: tags (categoría pastel + país chip) · título Host Grotesk 600 · organización muted · descripción corta · "Read the case →" en Pacific 700.
- **Niveles de visibilidad**: encabezado de grupo con punto de color (Spotlight `#f7931e` · High visibility `#00abd6` · Noteworthy `#b9cdd9`), contador mono y línea divisoria. Spotlight en grid de cards con imagen; High visibility cards medianas; Noteworthy lista compacta (nombre · org · país · →).
- **Mapa coroplético**: d3 + topojson, escala de azules anterior, leyenda de swatches cuadrados 14px; panel lateral "Most represented" con barras píldora Pacific sobre `#e3edf4`; clic en país filtra el repositorio.
- **Ficha de caso**: panel deslizante derecho 640px (max 94vw), overlay `rgba(8,38,70,.46)`; cabecera sticky con nivel + numeración mono y botón cerrar circular; tags, título 31px/700, grid de metadatos 2×2 (país, región, nivel, idioma original) sobre Bg soft; secciones con eyebrow; enlaces con ↗; disclaimer corto de idioma bajo los enlaces. En móvil: pantalla completa.
- **Selector de idioma EN/ES**: píldora contenedora; opción activa = fondo Solar, texto Deep Ocean. Persistido en localStorage.
- **Disclaimer de idioma** (obligatorio, texto fijo de la Designers Guide): franja info con icono ⓘ bajo los filtros + versión corta en cada ficha.

## 6. Layout

- Contenedor máximo 1320px, padding lateral 40px (16px móvil).
- Mapa: grid asimétrico `1fr 372px` (mapa + ranking). Spotlight destacado: 2 columnas; repositorio: 4/3 columnas según nivel; todo colapsa a 1 columna en móvil.
- Jerarquía por borde + sombra sobre fondo blanco; franjas Deep Ocean solo para bloques de estadísticas.

## 7. Iconografía

- Iconos **filled** (rellenos, no de línea), en Deep Ocean sobre claro y blanco sobre oscuro (regla de la guía).
- Para énfasis: contenedor circular con fondo de cualquier color de la paleta.
- Numeración de casos en IBM Plex Mono (`01`, `02`…).

## 8. Accesibilidad

- Solar Orange sobre blanco NO cumple AA en texto pequeño: usarlo como fondo con texto Deep Ocean, o solo en elementos ≥19px bold.
- Cuerpo ≥ `#29465c`; metadatos ≥ `#55707f` sobre blanco.
- `:focus-visible` anillo 2px Pacific; focus-trap en la ficha; Escape cierra; `prefers-reduced-motion` desactiva animaciones.
- Controles con área táctil ≥ 40px.

## 9. Reglas rápidas (Do / Don't)

**Sí**: azules como voz principal y naranja como exclamación única · píldoras en lo interactivo · pasteles solo para categorizar (texto Deep Ocean encima) · textura topográfica sutil · neutros azulados · Host Grotesk para todo lo display.

**No**: grises fríos o negro puro · naranja dominante o en texto pequeño · más de un CTA naranja por vista · esquinas rectas en controles · texturas que compitan con el contenido · mezclar otras tipografías · banner/logos/footer propios (los da el Drupal anfitrión).

## 10. Tokens

Los tokens viven en `assets/styles.css` bajo `.atlas-app` (custom properties CSS). Carga de fuentes:

```html
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Roboto:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

*Fuentes: `Insumos/atlas_of_innovation_guidelines.pdf` (colores, tipografías, iconografía, textura), wireframe `Atlas of Innovation - Case Repository (offline).html` (componentes y neutros), `assets/styles.css` (tokens vivos).*
