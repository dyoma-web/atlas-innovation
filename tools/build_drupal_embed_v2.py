# -*- coding: utf-8 -*-
"""Entrega Drupal v2 del Atlas — reconstruida sobre el UNDP Design System.

Diferencia con la v1 (Entrega_Drupal/): la capa visual usa los tokens --undpds-*
y los componentes del DS (stats-card, content-card, chip, select-default, modal,
grid) que el Drupal de undp.org YA carga; el fragmento por eso NO incluye el CSS
del DS, solo el complementario .atlas-ds (assets/styles-ds.css).

Mismas reglas de publicación que la v1: fragmento sin etiquetas de documento,
data-lang, sin tocar el host, JSX pre-transpilado, imágenes por URL absoluta.

Salidas en Entrega_Drupal_v2_DS/:
  atlas-ds-embed-en.html / atlas-ds-embed-es.html  -> fragmentos publicables
  preview-en.html / preview-es.html                -> host simulado CON el CSS del
                                                      DS desde CDN (servidor de pruebas)
Regenerar:  python tools/build_drupal_embed_v2.py
"""
import io, sys, os, re, subprocess, datetime, base64

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'Entrega_Drupal_v2_DS')
VENDOR = os.path.join(ROOT, 'tools', 'vendor')

ASSETS_BASE = 'https://dyoma-web.github.io/atlas-innovation/'
DS_CDN = 'https://cdn.jsdelivr.net/npm/@undp/design-system-assets@2.0.1/css/'

CDN_SCRIPTS = [
    'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
    'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',
    'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js',
]
FORBIDDEN = re.compile(r'<\s*(!DOCTYPE|html|head|body|title|meta)\b', re.IGNORECASE)


def esc_script(js):
    return js.replace('</script', '<\\/script')


def transpile():
    src = os.path.join(ROOT, 'assets', 'app-ds.jsx')
    out = os.path.join(VENDOR, 'app-ds.transpiled.js')
    node_prog = (
        "const Babel=require(process.argv[1]);const fs=require('fs');"
        "const r=Babel.transform(fs.readFileSync(process.argv[2],'utf8'),{presets:['react']});"
        "fs.writeFileSync(process.argv[3],r.code);"
    )
    subprocess.run(['node', '-e', node_prog, os.path.join(VENDOR, 'babel.min.js'), src, out],
                   check=True, capture_output=True)
    return open(out, encoding='utf-8').read()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    app_js = transpile()
    styles = open(os.path.join(ROOT, 'assets', 'styles-ds.css'), encoding='utf-8').read()
    cases = open(os.path.join(ROOT, 'assets', 'cases.js'), encoding='utf-8').read()
    world = open(os.path.join(ROOT, 'assets', 'world110m.js'), encoding='utf-8').read()
    img_dir = os.path.join(ROOT, 'assets', 'img', 'spotlight')
    entries = [f"  {f[:-4]}: '{ASSETS_BASE}assets/img/spotlight/{f}'"
               for f in sorted(os.listdir(img_dir)) if f.endswith('.jpg')]
    # Logo incrustado (data URI): no depende de que el SVG esté publicado en GitHub Pages
    logo_svg = open(os.path.join(ROOT, 'assets', 'img', 'undp-vertical-white.svg'), 'rb').read()
    logo_uri = 'data:image/svg+xml;base64,' + base64.b64encode(logo_svg).decode('ascii')
    images = ('window.ATLAS_IMAGES = {\n' + ',\n'.join(entries) + '\n};\n'
              f"window.ATLAS_LOGO = '{logo_uri}';")
    stamp = datetime.date.today().isoformat()

    for lang in ('en', 'es'):
        cdn = '\n'.join(f'<script src="{u}" crossorigin></script>' for u in CDN_SCRIPTS)
        fragment = f'''<!-- ============================================================
  Atlas of Innovation — fragmento v2 para Drupal (UNDP Design System)
  Idioma: {lang.upper()} (data-lang) · Generado: {stamp} por tools/build_drupal_embed_v2.py
  El host undp.org ya carga base-minimal + components del DS: este fragmento
  usa sus clases y tokens y NO incluye el CSS del DS. NO editar a mano.
============================================================ -->
<style>
{styles}
</style>
<div id="atlas-root" class="atlas-ds" data-lang="{lang}"></div>
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
        bad = FORBIDDEN.findall(fragment)
        if bad:
            raise SystemExit(f'FRAGMENTO {lang}: etiquetas prohibidas {set(bad)}')
        frag_path = os.path.join(OUT_DIR, f'atlas-ds-embed-{lang}.html')
        open(frag_path, 'w', encoding='utf-8').write(fragment)
        print(f'atlas-ds-embed-{lang}.html: {os.path.getsize(frag_path) // 1024} KB — fragmento ✓')

        preview = f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Atlas of Innovation — Preview host Drupal + UNDP DS ({lang.upper()})</title>
<link rel="stylesheet" href="{DS_CDN}base-minimal.min.css">
<link rel="stylesheet" href="{DS_CDN}components.min.css">
<style>
  body {{ margin: 0; }}
  .host-bar {{ background: #232E3E; color: #fff; padding: 14px 32px; font-size: 13px;
              font-family: sans-serif; display: flex; justify-content: space-between; align-items: center; }}
  .host-content {{ max-width: 90rem; margin: 0 auto; padding: 2rem 1.5rem; }}
  .host-footer {{ background: #232E3E; color: #9bb; padding: 26px 32px; font-size: 12px; font-family: sans-serif; margin-top: 60px; }}
</style>
</head>
<body>
<div class="host-bar"><b>HOST DRUPAL + UNDP DESIGN SYSTEM — SIMULACIÓN</b><span>Fragmento v2 ({lang.upper()}) — el host aporta el CSS del DS</span></div>
<div class="host-content">
{fragment}
</div>
<div class="host-footer">Pie del host (simulación)</div>
</body>
</html>
'''
        pv_path = os.path.join(OUT_DIR, f'preview-{lang}.html')
        open(pv_path, 'w', encoding='utf-8').write(preview)
        print(f'preview-{lang}.html: {os.path.getsize(pv_path) // 1024} KB')

    print('\nListo. La v1 (Entrega_Drupal/) queda intacta para rollback/comparación.')


if __name__ == '__main__':
    main()
