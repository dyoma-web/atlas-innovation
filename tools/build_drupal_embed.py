# -*- coding: utf-8 -*-
"""Genera la entrega para el Drupal del PNUD (Entrega_Drupal/), siguiendo las
reglas de publicación establecidas para los desarrollos PNUD (memoria "secure"):

1. FRAGMENTO, no documento: sin <!DOCTYPE>, <html>, <head>, <meta>, <title>, <body>.
2. Se conservan <link> externos (Google Fonts), <style>, el wrapper y <script> CDN/inline.
3. Todo el CSS con namespace .atlas-app + endurecimiento de visibilidad explícito.
4. Idioma por data-lang en el wrapper (un archivo por idioma); el selector EN/ES
   interno se oculta automáticamente (el host controla el idioma).
5. Sin tocar el host: nada de document.title, <html lang>, localStorage genérico.
6. Entrega con build regenerable + registro de cambios.

El JSX se transpila EN BUILD (node + tools/vendor/babel.min.js): el fragmento no
carga Babel en el navegador. Las imágenes se sirven por URL absoluta (ASSETS_BASE)
para que el fragmento pegado en Drupal no dependa de rutas relativas.

Salidas en Entrega_Drupal/:
  atlas-embed-en.html / atlas-embed-es.html   -> fragmentos publicables
  preview-en.html / preview-es.html           -> documento completo que simula el
                                                 host Drupal (para servidor de pruebas)
Regenerar:  python tools/build_drupal_embed.py
"""
import io, sys, os, re, base64, subprocess, datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'Entrega_Drupal')
VENDOR = os.path.join(ROOT, 'tools', 'vendor')

# Base pública de las imágenes (GitHub Pages del proyecto). Si el cliente prefiere
# alojarlas en su Drupal, basta cambiar esta constante y regenerar.
ASSETS_BASE = 'https://dyoma-web.github.io/atlas-innovation/'

CDN_SCRIPTS = [
    'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
    'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',
    'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js',
]
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,400;0,600;0,700;0,800;1,400'
         '&family=Roboto:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">')

FORBIDDEN = re.compile(r'<\s*(!DOCTYPE|html|head|body|title|meta)\b', re.IGNORECASE)


def esc_script(js):
    """Evita que un </script> literal dentro del contenido rompa el script inline."""
    return js.replace('</script', '<\\/script')


def transpile_jsx():
    src = os.path.join(ROOT, 'assets', 'app.jsx')
    out = os.path.join(VENDOR, 'app.transpiled.js')
    node_prog = (
        "const Babel=require(process.argv[1]);const fs=require('fs');"
        "const r=Babel.transform(fs.readFileSync(process.argv[2],'utf8'),{presets:['react']});"
        "fs.writeFileSync(process.argv[3],r.code);console.log('transpilado',r.code.length);"
    )
    subprocess.run(['node', '-e', node_prog,
                    os.path.join(VENDOR, 'babel.min.js'), src, out],
                   check=True, capture_output=True)
    return open(out, encoding='utf-8').read()


def build_styles():
    styles = open(os.path.join(ROOT, 'assets', 'styles.css'), encoding='utf-8').read()
    for tex in ('texture.svg', 'texture-light.svg'):
        svg = open(os.path.join(ROOT, 'assets', tex), 'rb').read()
        uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg).decode('ascii')
        styles = styles.replace(f"url('{tex}')", f"url('{uri}')")
    return styles


def build_images_js():
    img_dir = os.path.join(ROOT, 'assets', 'img', 'spotlight')
    entries = [f"  {f[:-4]}: '{ASSETS_BASE}assets/img/spotlight/{f}'"
               for f in sorted(os.listdir(img_dir)) if f.endswith('.jpg')]
    js = 'window.ATLAS_IMAGES = {\n' + ',\n'.join(entries) + '\n};'
    js += f"\nwindow.ATLAS_LOGO = '{ASSETS_BASE}assets/img/logos-white.png';"
    return js


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    app_js = transpile_jsx()
    styles = build_styles()
    cases = open(os.path.join(ROOT, 'assets', 'cases.js'), encoding='utf-8').read()
    world = open(os.path.join(ROOT, 'assets', 'world110m.js'), encoding='utf-8').read()
    images = build_images_js()
    stamp = datetime.date.today().isoformat()

    for lang in ('en', 'es'):
        cdn = '\n'.join(f'<script src="{u}" crossorigin></script>' for u in CDN_SCRIPTS)
        fragment = f'''<!-- ============================================================
  Atlas of Innovation in Public Communication — fragmento para Drupal
  Idioma: {lang.upper()} (fijado por data-lang; el selector interno se oculta)
  Generado: {stamp} por tools/build_drupal_embed.py — NO editar a mano
  Reglas: fragmento sin etiquetas de documento; CSS bajo .atlas-app;
  el host no se toca. Imágenes servidas desde {ASSETS_BASE}
============================================================ -->
{FONTS}
<style>
{styles}
</style>
<div id="atlas-root" class="atlas-app" data-lang="{lang}"></div>
{cdn}
<script>
{esc_script(world)}
{esc_script(cases)}
{esc_script(images)}
</script>
<script>
{esc_script(app_js)}
</script>
'''
        # Verificación regla 1: sin etiquetas de documento
        bad = FORBIDDEN.findall(fragment)
        if bad:
            raise SystemExit(f'FRAGMENTO {lang}: etiquetas prohibidas {set(bad)}')
        frag_path = os.path.join(OUT_DIR, f'atlas-embed-{lang}.html')
        open(frag_path, 'w', encoding='utf-8').write(fragment)
        print(f'atlas-embed-{lang}.html: {os.path.getsize(frag_path) // 1024} KB — sin etiquetas de documento ✓')

        # Preview: documento completo que simula la página Drupal anfitriona
        title = 'Atlas of Innovation — Preview host Drupal (%s)' % lang.upper()
        preview = f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{title}</title>
<style>
  body {{ margin: 0; font-family: system-ui, sans-serif; background: #fff; }}
  .host-bar {{ background: #232E3E; color: #fff; padding: 14px 32px; font-size: 13px;
              display: flex; justify-content: space-between; align-items: center; }}
  .host-bar b {{ letter-spacing: .06em; }}
  .host-footer {{ background: #232E3E; color: #9bb; padding: 26px 32px; font-size: 12px; margin-top: 60px; }}
  .host-content {{ max-width: 1440px; margin: 0 auto; }}
</style>
</head>
<body>
<div class="host-bar"><b>HOST DRUPAL — SIMULACIÓN</b><span>El contenido de abajo es el fragmento pegado en el campo de contenido ({lang.upper()})</span></div>
<div class="host-content">
{fragment}
</div>
<div class="host-footer">Pie de página del host (simulación) — el fragmento no lo aporta.</div>
</body>
</html>
'''
        pv_path = os.path.join(OUT_DIR, f'preview-{lang}.html')
        open(pv_path, 'w', encoding='utf-8').write(preview)
        print(f'preview-{lang}.html: {os.path.getsize(pv_path) // 1024} KB')

    print('\nListo. Publicables: atlas-embed-en.html / atlas-embed-es.html · '
          'Pruebas: preview-en.html / preview-es.html')


if __name__ == '__main__':
    main()
