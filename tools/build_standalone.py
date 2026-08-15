# -*- coding: utf-8 -*-
"""Genera el HTML standalone autocontenido (funciona con doble clic, sin internet).

Vendoriza en tools/vendor/ (cacheado, gitignored): React, ReactDOM, Babel, d3,
topojson-client y las fuentes de Google (Host Grotesk, Roboto, IBM Plex Mono en
subsets latin/latin-ext, embebidas como base64). Inlina estilos (texturas como
data URI), datos y las imágenes Spotlight en base64.

Salida: standalone/atlas-repository-standalone.html
Regenerar tras cada cambio del desarrollo:  python tools/build_standalone.py
"""
import io, sys, os, re, base64, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENDOR = os.path.join(ROOT, 'tools', 'vendor')
OUT_DIR = os.path.join(ROOT, 'standalone')
OUT = os.path.join(OUT_DIR, 'atlas-repository-standalone.html')

LIBS = [
    ('react.min.js', 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'),
    ('react-dom.min.js', 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'),
    ('babel.min.js', 'https://unpkg.com/@babel/standalone@7.26.4/babel.min.js'),
    ('d3.min.js', 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'),
    ('topojson-client.min.js', 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js'),
]
FONTS_CSS_URL = ('https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,400;0,600;0,700;0,800;1,400'
                 '&family=Roboto:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap')
WOFF2_UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
            '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')


def fetch(url, path, ua=None):
    if os.path.exists(path) and os.path.getsize(path) > 100:
        return open(path, 'rb').read()
    req = urllib.request.Request(url, headers={'User-Agent': ua} if ua else {})
    data = urllib.request.urlopen(req).read()
    open(path, 'wb').write(data)
    return data


def build_fonts_css():
    """CSS de fuentes con woff2 embebidos (solo subsets latin y latin-ext)."""
    cache = os.path.join(VENDOR, 'fonts-inline.css')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    css = fetch(FONTS_CSS_URL, os.path.join(VENDOR, 'fonts-src.css'), ua=WOFF2_UA).decode('utf-8')
    blocks = re.findall(r'/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})', css)
    out, n = [], 0
    for subset, block in blocks:
        if subset not in ('latin', 'latin-ext'):
            continue
        m = re.search(r'url\((https://[^)]+\.woff2)\)', block)
        if not m:
            continue
        n += 1
        woff = fetch(m.group(1), os.path.join(VENDOR, f'font-{n:02d}-{subset}.woff2'), ua=WOFF2_UA)
        b64 = base64.b64encode(woff).decode('ascii')
        out.append(block.replace(m.group(1), f'data:font/woff2;base64,{b64}'))
    result = '\n'.join(out)
    open(cache, 'w', encoding='utf-8').write(result)
    print(f'fuentes embebidas: {n} woff2')
    return result


def main():
    os.makedirs(VENDOR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    libs = {}
    for name, url in LIBS:
        data = fetch(url, os.path.join(VENDOR, name))
        libs[name] = data.decode('utf-8')
        print(f'{name}: {len(data) // 1024} KB')

    fonts_css = build_fonts_css()

    # styles.css con texturas como data URI
    styles = open(os.path.join(ROOT, 'assets', 'styles.css'), encoding='utf-8').read()
    for tex in ('texture.svg', 'texture-light.svg'):
        svg = open(os.path.join(ROOT, 'assets', tex), 'rb').read()
        uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg).decode('ascii')
        styles = styles.replace(f"url('{tex}')", f"url('{uri}')")

    cases = open(os.path.join(ROOT, 'assets', 'cases.js'), encoding='utf-8').read()
    world = open(os.path.join(ROOT, 'assets', 'world110m.js'), encoding='utf-8').read()
    app = open(os.path.join(ROOT, 'assets', 'app.jsx'), encoding='utf-8').read()

    # imágenes Spotlight embebidas
    img_dir = os.path.join(ROOT, 'assets', 'img', 'spotlight')
    img_entries = []
    for f in sorted(os.listdir(img_dir)):
        if f.endswith('.jpg'):
            b64 = base64.b64encode(open(os.path.join(img_dir, f), 'rb').read()).decode('ascii')
            img_entries.append(f"  {f[:-4]}: 'data:image/jpeg;base64,{b64}'")
    images_js = 'window.ATLAS_IMAGES = {\n' + ',\n'.join(img_entries) + '\n};'
    logo_path = os.path.join(ROOT, 'assets', 'img', 'logos-white.png')
    if os.path.exists(logo_path):
        logo_b64 = base64.b64encode(open(logo_path, 'rb').read()).decode('ascii')
        images_js += f"\nwindow.ATLAS_LOGO = 'data:image/png;base64,{logo_b64}';"
    print(f'imágenes embebidas: {len(img_entries)} + logo')

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atlas of Innovation in Public Communication — Case Repository</title>
<!-- STANDALONE autocontenido — generado por tools/build_standalone.py. NO editar a mano. -->
<style>{fonts_css}</style>
<style>{styles}</style>
<style>body {{ margin: 0; background: #fff; }}</style>
</head>
<body>
<div id="atlas-root" class="atlas-app"></div>
<script>{libs['react.min.js']}</script>
<script>{libs['react-dom.min.js']}</script>
<script>{libs['babel.min.js']}</script>
<script>{libs['d3.min.js']}</script>
<script>{libs['topojson-client.min.js']}</script>
<script>{world}</script>
<script>{cases}</script>
<script>{images_js}</script>
<script type="text/babel" data-presets="react">
{app}
</script>
</body>
</html>
'''
    open(OUT, 'w', encoding='utf-8').write(html)
    print(f'\nEscrito: {OUT} ({os.path.getsize(OUT) // 1024 // 1024} MB)')


if __name__ == '__main__':
    main()
