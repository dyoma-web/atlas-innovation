# -*- coding: utf-8 -*-
"""Fusiona tools/es_parts/part_*.json -> tools/es_translations.json y valida
cobertura contra assets/cases.js. Ejecutar después: python tools/xlsx_to_cases.py
"""
import io, sys, json, glob, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, 'tools', 'es_parts')
OUT = os.path.join(ROOT, 'tools', 'es_translations.json')
CASES = os.path.join(ROOT, 'assets', 'cases.js')

merged = {}
for path in sorted(glob.glob(os.path.join(PARTS, 'part_*.json'))):
    part = json.load(open(path, encoding='utf-8'))
    dup = set(part) & set(merged)
    if dup:
        print(f'AVISO: ids duplicados entre partes: {sorted(dup)}')
    merged.update(part)
    print(f'{os.path.basename(path)}: {len(part)} casos')

txt = open(CASES, encoding='utf-8').read()
cases = json.loads(txt[txt.index('['):txt.rindex(']') + 1])

falta_desc, falta_det = [], []
for c in cases:
    tr = merged.get(c['id'], {})
    if c['desc']['en'] and not tr.get('desc'):
        falta_desc.append(c['id'])
    if c['details']['en'] and not tr.get('details'):
        falta_det.append(c['id'])

print(f'\nTotal fusionado: {len(merged)} casos (cases.js tiene {len(cases)})')
print('Falta desc ES:', falta_desc or 'ninguna')
print('Falta details ES:', falta_det or 'ninguna')

json.dump(merged, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'Guardado: {OUT}')
print('Ahora ejecutar: python tools/xlsx_to_cases.py')
