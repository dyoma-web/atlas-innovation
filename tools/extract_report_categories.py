# -*- coding: utf-8 -*-
"""Extrae la asignación oficial de categorías del Final Report EN.pdf.

- Spotlight (p30-49): 1 caso/página; la categoría asignada es el ítem del checklist
  en DMSans-Black color oscuro (los no asignados van en DMSans-Bold pálido).
- High Visibility (p51-62): 2 casos/página en columnas; título HostGrotesk-Bold 13;
  la categoría aparece como span suelto dentro de la misma columna.
- Noteworthy (p64-78): 4 casos/página en cuadrícula 2x2; título Montserrat-Bold 8
  color claro; categoría como span suelto en el mismo cuadrante.

Salida: tools/categorias_report.json  {nombre_reporte: {"category":..., "tier":..., "page":...}}
        + cruce con el Excel por nombre (difflib) para revisión.
"""
import fitz, io, sys, json, re, unicodedata, difflib
import openpyxl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PDF = r'c:\wamp_3\www\atlas\Insumos\Final Report EN.pdf'
XLSX = r'c:\wamp_3\www\atlas\Insumos\UNDP_All_cases_ORGANIZADO_para_diseño.xlsx'
OUT = r'c:\wamp_3\www\atlas\tools\categorias_report.json'

CATS = ['Clarity in Action', 'Inclusive Voices', 'Trust Catalysts',
        'Exploring New Frontiers', 'Dialogue Builders']

def norm(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[“”"\'’‘´`\u2013\u2014:;,.!?()\[\]]', ' ', s.lower())
    return re.sub(r'\s+', ' ', s).strip()

def spans_of(page):
    out = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for sp in line['spans']:
                t = sp['text'].strip()
                if t:
                    out.append({'x': sp['bbox'][0], 'y': sp['bbox'][1],
                                'size': sp['size'], 'font': sp['font'],
                                'color': sp['color'], 'text': t})
    out.sort(key=lambda s: (s['y'], s['x']))
    return out

doc = fitz.open(PDF)
results = []  # (title, category, tier, page)

# ---- Spotlight p30-49 ----
for pn in range(30, 50):
    sp = spans_of(doc[pn - 1])
    title_parts = [s['text'] for s in sp
                   if 'HostGrotesk' in s['font'] and s['size'] >= 12 and s['y'] < 200]
    title = ' '.join(title_parts).replace('↗', '').strip()
    cat = None
    for s in sp:
        m = re.match(r'^\d\.\s*(.+)$', s['text'])
        if m and m.group(1).strip() in CATS and 'Black' in s['font']:
            cat = m.group(1).strip()
    results.append((title, cat, 'Spotlight', pn))

# ---- High Visibility p51-62 ----
for pn in range(51, 63):
    sp = spans_of(doc[pn - 1])
    titles = [s for s in sp if 'HostGrotesk-Bold' in s['font'] and s['size'] >= 12]
    cats = [s for s in sp if s['text'] in CATS]
    # agrupar título multi-línea por columna (x cercana) y quedarnos con la primera línea de cada caso
    page_w = doc[pn - 1].rect.width
    mid = page_w / 2
    for side in (0, 1):
        tside = [t for t in titles if (t['x'] >= mid) == bool(side)]
        cside = [c for c in cats if (c['x'] >= mid) == bool(side)]
        if not tside:
            continue
        title = ' '.join(t['text'] for t in sorted(tside, key=lambda s: (s['y'], s['x'])))
        cat = cside[0]['text'] if cside else None
        results.append((title.strip(), cat, 'High visibility', pn))

# ---- Noteworthy p64-78 ----
for pn in range(64, 79):
    page = doc[pn - 1]
    sp = spans_of(page)
    mid_x = page.rect.width / 2
    titles = [s for s in sp if s['font'] == 'Montserrat-Bold' and s['size'] >= 7.5
              and s['color'] == 0xf5f5f5 and s['text'] not in ('1.', '2.')
              and not s['text'].startswith('What can we learn')]
    # unir líneas de título contiguas (misma columna, y cercana)
    merged = []
    for t in sorted(titles, key=lambda s: (s['x'] >= mid_x, s['y'])):
        if merged and (t['x'] >= mid_x) == (merged[-1]['x'] >= mid_x) \
           and 0 <= t['y'] - merged[-1]['y2'] < 14:
            merged[-1]['text'] += ' ' + t['text']
            merged[-1]['y2'] = t['y']
        else:
            merged.append({'x': t['x'], 'y': t['y'], 'y2': t['y'], 'text': t['text']})
    cats = [s for s in sp if s['text'] in CATS]
    for m in merged:
        same_col = [c for c in cats if (c['x'] >= mid_x) == (m['x'] >= mid_x)
                    and c['y'] >= m['y'] - 5]
        cat = min(same_col, key=lambda c: c['y'] - m['y'])['text'] if same_col else None
        results.append((m['text'].strip(), cat, 'Noteworthy', pn))

# También los títulos Montserrat-Medium que continúan un Bold (títulos con comillas partidos)
# ya quedaron unidos arriba solo si eran Bold; aceptable para el matching difuso.

print(f'Extraídos: {len(results)} casos del reporte')
for tier in ('Spotlight', 'High visibility', 'Noteworthy'):
    n = sum(1 for r in results if r[2] == tier)
    nc = sum(1 for r in results if r[2] == tier and r[1])
    print(f'  {tier}: {n} casos, {nc} con categoría')

from collections import Counter
print('Totales por categoría:', Counter(r[1] for r in results if r[1]))

# ---- Cruce con Excel ----
wb = openpyxl.load_workbook(XLSX, data_only=True)
ws = wb['Final Overview (organized)']
excel = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] is None and row[1] is None:
        continue
    excel.append({'tier': str(row[0]).strip(), 'name': str(row[1]).strip()})

report_by_norm = {}
for title, cat, tier, pn in results:
    report_by_norm[norm(title)] = {'title': title, 'category': cat, 'tier': tier, 'page': pn}

matched, unmatched = {}, []
used = set()
for e in excel:
    key = norm(e['name'])
    hit = None
    if key in report_by_norm:
        hit = key
    else:
        cands = difflib.get_close_matches(key, list(report_by_norm.keys()), n=1, cutoff=0.55)
        if cands:
            hit = cands[0]
        else:  # contención parcial (p.ej. "Coleção Olhares Plurais" vs "Olhares Plurais")
            for rk in report_by_norm:
                if rk and (rk in key or key in rk):
                    hit = rk
                    break
    if hit:
        matched[e['name']] = dict(report_by_norm[hit], excel_tier=e['tier'])
        used.add(hit)
    else:
        unmatched.append(e['name'])

print(f'\nCruce: {len(matched)} de {len(excel)} casos del Excel emparejados')
print('Sin pareja en el reporte (candidatos a "casos nuevos"):')
for u in unmatched:
    print('  -', u)
leftover = [v['title'] for k, v in report_by_norm.items() if k not in used]
if leftover:
    print('Títulos del reporte sin usar:')
    for t in leftover:
        print('  *', t)

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump({'matched': matched, 'unmatched_excel': unmatched,
               'report_raw': [{'title': t, 'category': c, 'tier': ti, 'page': p}
                              for t, c, ti, p in results]},
              f, ensure_ascii=False, indent=1)
print(f'\nGuardado: {OUT}')
