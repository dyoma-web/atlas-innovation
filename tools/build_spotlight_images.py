# -*- coding: utf-8 -*-
"""Genera las imágenes principales optimizadas de los casos Spotlight.

Toma la curaduría definida en PICKS (elegida visualmente sobre el material de
Insumos/spotlight_drive), normaliza (máx 1600px de ancho, JPEG q82) y escribe:
  assets/img/spotlight/<case_id>.jpg
  assets/images.js  ->  window.ATLAS_IMAGES

Sin imagen real (mantienen tile de marca): c004 (TCU: solo logos vectoriales),
c014 (Les ondes: carpeta vacía en Drive), c017 (Ancla: solo PDF de métricas).
"""
import io, sys, os
from PIL import Image
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'Insumos', 'spotlight_drive')
OUT = os.path.join(ROOT, 'assets', 'img', 'spotlight')

# case_id -> ruta relativa dentro de spotlight_drive (pdf => se renderiza la pág. 1)
PICKS = {
    'c001': 'c001_e-eu-sou-o-que/apresentacao-2025.pdf',
    'c002': 'c002_saude-direitos-pcd/img-115746512-alta.jpg',
    'c003': 'c003_olhares-plurais/mockup-boletins.jpg',
    'c005': 'c005_tiny-town-hall/tiny-rathaus-foto.jpg',
    'c006': 'c006_extra-favelas/extra-favelas-urbanismo.jpg',
    'c007': 'c007_voices-of-resilience/img-2365.jpg',
    'c008': 'c008_chatnation/ecityzens-cards.png',
    'c009': 'c009_ecovr/ecovr-1.tif',
    'c010': 'c010_not-alone/school-tour-2.jpg',
    'c011': 'c011_mulheres-em-dialogo/mg-9342.jpg',
    'c012': 'c012_bhashini/bhashini-logo.png',
    'c013': 'c013_weaving-web-of-truth/campana-551004696.jpg',
    'c015': 'c015_voix-des-survivants/img-4444.jpg',
    'c016': 'c016_simecpe/informe-poder-liderazgo.pdf',
    'c018': 'c018_valuebot/matriz-valor-publico.png',
    'c019': 'c019_elvia-derechos/elvia-derechos.png',
    'c020': 'c020_ecos-cienaga-oro/latina-stereo-1.jpg',
}
MAX_W = 1600


def load(path):
    if path.lower().endswith('.pdf'):
        doc = fitz.open(path)
        page = doc[0]
        zoom = MAX_W / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        doc.close()
        return img
    return Image.open(path).convert('RGB')


def main():
    os.makedirs(OUT, exist_ok=True)
    entries = []
    for cid in sorted(PICKS):
        src = os.path.join(SRC, PICKS[cid].replace('/', os.sep))
        img = load(src)
        if img.width > MAX_W:
            img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)
        dest = os.path.join(OUT, f'{cid}.jpg')
        img.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
        kb = os.path.getsize(dest) // 1024
        print(f'{cid}: {img.width}x{img.height} · {kb} KB  ({os.path.basename(src)})')
        entries.append(cid)

    with open(os.path.join(ROOT, 'assets', 'images.js'), 'w', encoding='utf-8') as f:
        f.write('// Generado por tools/build_spotlight_images.py — imágenes principales Spotlight.\n')
        f.write('// Origen: Drive "spotlighted cases" (2026-08-03). Sin imagen: c004, c014, c017.\n')
        f.write('window.ATLAS_IMAGES = {\n')
        for cid in entries:
            f.write(f"  {cid}: 'assets/img/spotlight/{cid}.jpg',\n")
        f.write('};\n')
    print(f'\n{len(entries)} imágenes · assets/images.js escrito')


if __name__ == '__main__':
    main()
