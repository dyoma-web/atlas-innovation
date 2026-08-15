# -*- coding: utf-8 -*-
"""Conversor Excel -> assets/cases.js (Atlas of Innovation in Public Communication).

Fuentes:
- Insumos/UNDP_All_cases_ORGANIZADO_para_diseño.xlsx  hoja "Final Overview (organized)"
  (fuente de verdad del contenido: tier, nombre, org, tipo, país, textos, enlaces)
- tools/wireframe_reference.json  (mismo orden de filas que el Excel, verificado 1:1;
  aporta normalización ya validada: iso, region, lang, links parseados, y las notas
  de producción de los Spotlight tomadas de la hoja "Spotlighted Cases (Top) - Info")
- tools/categorias.json  (asignación oficial del Final Report + propuestas a validar)
- tools/es_translations.json  (opcional: {id: {desc, details}} en español; si falta
  una traducción, la UI cae al inglés)

Salida: assets/cases.js  ->  window.ATLAS_CASES (script plano, sin módulos, para
poder embeberse en el Drupal del cliente igual que en el proyecto Exp).

Regenerar con:  python tools/xlsx_to_cases.py
"""
import io, sys, json, os, re, unicodedata, datetime
import openpyxl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, 'Insumos', 'UNDP_All_cases_ORGANIZADO_para_diseño.xlsx')
WFREF = os.path.join(ROOT, 'tools', 'wireframe_reference.json')
CATS = os.path.join(ROOT, 'tools', 'categorias.json')
ES_TR = os.path.join(ROOT, 'tools', 'es_translations.json')
OUT = os.path.join(ROOT, 'assets', 'cases.js')

TIER_MAP = {'Top': 'Spotlight', 'High Visibility': 'High visibility', 'Mention': 'Noteworthy'}

# Títulos para mostrar (Comentarios Atlas.docx 2026-08-15): acortar subtítulos de
# VALUEbot y Voix des Survivants, y normalizar los títulos TODO EN MAYÚSCULAS.
# La clave es el nombre EXACTO del Excel (que sigue siendo la llave para las
# categorías); el valor es el nombre publicado.
NAME_OVERRIDES = {
    'VALUEbot : Una plataforma generadora de chatbots mediante IA para la comunicación del valor público del PSM':
        'VALUEbot',
    'Voix des Survivants : une communication publique participative pour la justice et la paix au Kivu(Est de la RDCongo)':
        'Voix des Survivants',
    'ECOS DE CIENAGA ORO': 'Ecos de Ciénaga de Oro',
    'EXTRA FAVELAS': 'Extra Favelas',
    'DIGITAL JUSTICE AND HUMAN RIGHTS IN ANGOLA': 'Digital Justice and Human Rights in Angola',
    'SOCIAL MEDIA GOV': 'Social Media Gov',
    'DECODIFICANDO DIREITOS E DEVERES: UM PROTÓTIPO DIGITAL SIMPLIFICANDO A LINGUAGEM DO CÓDIGO DE ÉTICA E CONDUTA DA EBSERH':
        'Decodificando Direitos e Deveres: um protótipo digital simplificando a linguagem do Código de Ética e Conduta da EBSERH',
    'JUDICIÁRIO EM EVIDÊNCIA': 'Judiciário em Evidência',
    'FCB INDOOR': 'FCB Indoor',
    'HERRAMIENTAS PARA MODERNIZAR LA ESCRITURA EN LA UNIVERSIDAD NACIONAL DE CÓRDOBA: LA EXPERIENCIA DE ELABORACIÓN DEL MANUAL ESCRIBIR TEXTOS ADMINISTRATIVOS EN LA UNC CON PERSPECTIVA DE GÉNERO Y LENGUAJE JURÍDICO CLARO':
        'Herramientas para modernizar la escritura en la Universidad Nacional de Córdoba: la experiencia de elaboración del manual Escribir textos administrativos en la UNC con perspectiva de género y lenguaje jurídico claro',
}

COUNTRY_ES = {
    'Angola': 'Angola', 'Argentina': 'Argentina', 'Benin': 'Benín', 'Brazil': 'Brasil',
    'Cambodia': 'Camboya', 'Canada': 'Canadá',
    'Central African Republic': 'República Centroafricana', 'Chile': 'Chile',
    'Colombia': 'Colombia', 'DR Congo': 'RD Congo', 'Ecuador': 'Ecuador',
    'Germany': 'Alemania', 'Germany / United Kingdom': 'Alemania / Reino Unido',
    'India': 'India', 'Indonesia': 'Indonesia', 'Kenya': 'Kenia', 'Liberia': 'Liberia',
    'Malawi': 'Malaui', 'Mexico': 'México', 'Netherlands': 'Países Bajos',
    'Panama': 'Panamá', 'Paraguay': 'Paraguay', 'Peru': 'Perú',
    'Regional — Asia & the Pacific': 'Regional — Asia y el Pacífico', 'Spain': 'España',
    'Uganda': 'Uganda', 'Ukraine': 'Ucrania', 'United Kingdom': 'Reino Unido',
    'United States': 'Estados Unidos', 'Venezuela': 'Venezuela',
    'Viet Nam': 'Vietnam', 'Yemen': 'Yemen',
}
REGION_ES = {
    'Latin America & the Caribbean': 'América Latina y el Caribe',
    'Africa': 'África', 'Europe': 'Europa', 'Asia & the Pacific': 'Asia y el Pacífico',
    'North America': 'América del Norte', 'Arab States': 'Estados Árabes',
}
TYPE_ES = {
    'Public institution': 'Institución pública',
    'Civil society organisation': 'Organización de la sociedad civil',
    'University or research centre': 'Universidad o centro de investigación',
    'Private sector': 'Sector privado',
    'Media': 'Medio de comunicación',
    'Social innovation organization': 'Organización de innovación social',
    'Community or collective': 'Comunidad o colectivo',
}


def norm_name(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', s.lower()).strip()


def clean(v):
    if v is None:
        return ''
    return re.sub(r'\s+\n', '\n', str(v)).strip()


def main():
    wf = json.load(open(WFREF, encoding='utf-8'))
    catdata = json.load(open(CATS, encoding='utf-8'))
    cat_by_name = {}
    for name, v in catdata['oficial'].items():
        cat_by_name[name] = (v['category'], 'official')
    for name, v in catdata['propuestos'].items():
        cat_by_name[name] = (v['category'], 'proposed')
    es_tr = json.load(open(ES_TR, encoding='utf-8')) if os.path.exists(ES_TR) else {}

    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb['Final Overview (organized)']
    rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[0] or r[1]]
    assert len(rows) == len(wf), f'Excel {len(rows)} filas vs wireframe {len(wf)}'

    cases, seen, dropped = [], set(), []
    for idx, (row, ref) in enumerate(zip(rows, wf)):
        tier_raw = clean(row[0])
        name = clean(row[1])
        key = norm_name(name)
        if key in seen:
            dropped.append(name)
            continue
        seen.add(key)

        # sanity: la referencia del wireframe debe ser la misma fila
        assert norm_name(ref['name'])[:15] == key[:15], f'fila {idx} desalineada'

        cat, cat_src = cat_by_name.get(name, (None, None))
        cid = f'c{idx + 1:03d}'
        tr = es_tr.get(cid, {})

        country_en = ref['country']
        case = {
            'id': cid,
            'tier': TIER_MAP[tier_raw],
            'category': cat,
            'categorySource': cat_src,
            'iso': ref.get('iso'),
            'lang': ref.get('lang'),
            'region': {'en': ref['region'], 'es': REGION_ES[ref['region']]},
            'country': {'en': country_en, 'es': COUNTRY_ES.get(country_en, country_en)},
            'type': {'en': ref['type'], 'es': TYPE_ES.get(ref['type'], ref['type'])},
            'name': NAME_OVERRIDES.get(name, name),
            'org': clean(row[2]),
            'desc': {'en': clean(row[5]) or None, 'es': tr.get('desc') or None},
            'details': {'en': clean(row[6]) or None, 'es': tr.get('details') or None},
            'links': ref.get('links') or [],
            'hasPhotos': clean(row[7]).lower() == 'yes',
            'drive': clean(row[9]) or None,
        }
        # Notas de producción (solo Spotlight; NO públicas — la app las muestra
        # únicamente con el flag de revisión interna activado)
        if case['tier'] == 'Spotlight':
            case['prod'] = {'material': ref.get('material'), 'files': ref.get('files'),
                            'pieces': ref.get('pieces'), 'gap': ref.get('gap')}
        cases.append(case)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    stamp = datetime.date.today().isoformat()
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// Generado por tools/xlsx_to_cases.py — NO editar a mano.\n')
        f.write(f'// Fuente: Insumos/UNDP_All_cases_ORGANIZADO_para_diseño.xlsx ({stamp})\n')
        f.write('window.ATLAS_CASES = ')
        json.dump(cases, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')

    # ---- Resumen de validación ----
    from collections import Counter
    print(f'Casos emitidos: {len(cases)} (Excel {len(rows)}, duplicados omitidos: {dropped})')
    print('Tiers:', dict(Counter(c['tier'] for c in cases)))
    print('Categorías:', dict(Counter(c['category'] or 'SIN' for c in cases)))
    print('  propuestas a validar:', sum(1 for c in cases if c['categorySource'] == 'proposed'))
    print('Países:', len(set(c['country']['en'] for c in cases)),
          '| Regiones:', len(set(c['region']['en'] for c in cases)),
          '| Idiomas:', sorted(set(c['lang'] for c in cases)))
    sin_desc = [c['name'][:50] for c in cases if not c['desc']['en']]
    print('Sin descripción EN:', sin_desc)
    con_det = sum(1 for c in cases if c['details']['en'])
    print(f'Con texto largo: {con_det} (esperado 44 = Spotlight+High)')
    es_done = sum(1 for c in cases if c['desc']['es'])
    print(f'Traducciones ES presentes: {es_done}/{len(cases)}')
    print(f'\nEscrito: {OUT}')


if __name__ == '__main__':
    main()
