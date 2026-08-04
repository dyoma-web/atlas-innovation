# -*- coding: utf-8 -*-
"""Consolida la asignación de categorías: reporte oficial + correcciones manuales.

Genera tools/categorias.json con {nombre_excel: {category, source}} y lista los
casos del Excel que no aparecen en el Final Report (los agregados después),
imprimiendo su descripción para clasificación manual.
"""
import json, io, sys, re, unicodedata, difflib
import openpyxl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

XLSX = r'c:\wamp_3\www\atlas\Insumos\UNDP_All_cases_ORGANIZADO_para_diseño.xlsx'
REPORT = r'c:\wamp_3\www\atlas\tools\categorias_report.json'
OUT = r'c:\wamp_3\www\atlas\tools\categorias.json'

# Correcciones verificadas contra el PDF (página indicada):
# - Los 4 Spotlight cuyo resaltado es texto vectorial son Exploring New Frontiers
#   (verificado visualmente p46-49).
# - Emparejamientos que el matcher difuso resolvió mal o no resolvió.
MANUAL = {
    'Portal de Participação Cidadã': ('Dialogue Builders', 'report p41 (TCU Participation Portal)'),
    'Sistema Mendocino de Comunicación Pública Basada en Evidencia (SIMECPE)': ('Trust Catalysts', 'report p42 (SIMECPE)'),
    'Saúde e direitos humanos das pessoas com deficiência: disseminando conhecimento para fortalecer a cidadania': ('Inclusive Voices', 'report p35'),
    'Voix des Survivants : une communication publique participative pour la justice et la paix au Kivu(Est de la RDCongo)': ('Inclusive Voices', 'report p34 (Voices of Survivors)'),
    'From Portals to Conversations: Reimagining Public Communication Through Messaging': ('Dialogue Builders', 'report p40 (ChatNation)'),
    '"Not Alone" - Anti-Cyber-Kidnaping Campaign': ('Exploring New Frontiers', 'report p47, resaltado visual'),
    'BHASHINI: Powering Multilingual AI for Inclusive Public Communication in a Linguistically Diverse Democracy': ('Exploring New Frontiers', 'report p46, resaltado visual'),
    'EXTRA FAVELAS': ('Exploring New Frontiers', 'report p48, resaltado visual'),
    'Elvia Derechos': ('Exploring New Frontiers', 'report p49, resaltado visual'),
    'CAPACITISMO OBSTÉTRICO: uma contracartilha para celebrar os direitos à maternidade das mulheres com deficiência': ('Inclusive Voices', 'report p70'),
    'Participación y Construcción Comunitaria de la Seguridad Ciudadana – “Modelo de Abordaje en Prevención Comunitaria de la Secretaria de Estado de Participación Ciudadana Tucumán – Argentina”': ('Dialogue Builders', 'report p60 (Modelo de Abordaje)'),
    'Edital de Processo Seletivo de Estágio em Linguagem Simples': ('Clarity in Action', 'report p65'),
    # El matcher confundió este caso con el Edital de estágio; NO está en el reporte:
    'Caixa de Ferramentas do Linguagem Simples Lab': (None, 'nuevo — no está en el Final Report'),
}

# Propuestas propias para los casos agregados al Excel después del Final Report
# (no tienen categoría oficial). PENDIENTES DE VALIDACIÓN por el cliente.
PROPUESTAS = {
    'Edital do Processo Eleitoral para Ouvidor Externo Geral da Defensoria Pública':
        ('Clarity in Action', 'Rediseño en lenguaje claro de un proceso de postulación; análogo al Edital de estágio em Linguagem Simples (Clarity, p65).'),
    'Programa jornalístico Conexões':
        ('Inclusive Voices', 'Noticiero con intérprete de Libras en pantalla igualitaria: acceso de personas sordas a la información pública.'),
    'Santo André pelo Clima - diálogos que transformam':
        ('Dialogue Builders', 'Política climática municipal construida mediante proceso participativo multiactor ("diálogos que transformam").'),
    'Caixa de Ferramentas do Linguagem Simples Lab':
        ('Clarity in Action', 'Caja de herramientas de lenguaje claro para instituciones; núcleo temático de Clarity in Action.'),
    'Expressão Nacional':
        ('Dialogue Builders', 'Programa de debate multiplataforma que reúne legisladores, expertos, sociedad civil y ciudadanía.'),
    'U=U Dance Challenge':
        ('Exploring New Frontiers', 'Formato nativo digital (challenge musical en redes) para comunicar consenso científico; análogo a los casos ENF de formatos digitales.'),
    'From dialogue to decisions: AI-supported participatory social planning (Siegen‑Wittgenstein District, Germany, 2024)':
        ('Dialogue Builders', 'El corazón es la deliberación participativa (10 conferencias municipales); la IA es soporte. Alternativa defendible: Exploring New Frontiers.'),
    'Creación de micrositio web: redacta simple unc':
        ('Clarity in Action', 'Micrositio de redacción simple/lenguaje claro (UNC); mismo eje que "Herramientas para modernizar la escritura" (Clarity). Sin descripción en el Excel.'),
    'REE SI! Red de Empoderamiento y Educación Sexual Integral':
        ('Inclusive Voices', 'Red de promotores juveniles pares para educación sexual integral: voz y empoderamiento de poblaciones jóvenes.'),
}

data = json.load(open(REPORT, encoding='utf-8'))
matched = data['matched']

wb = openpyxl.load_workbook(XLSX, data_only=True)
ws = wb['Final Overview (organized)']
excel = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] is None and row[1] is None:
        continue
    excel.append({'tier': str(row[0]).strip(), 'name': str(row[1]).strip(),
                  'desc': str(row[5]).strip() if row[5] else ''})

final, nuevos = {}, []
for e in excel:
    name = e['name']
    if name in MANUAL:
        cat, src = MANUAL[name]
        if cat:
            final[name] = {'category': cat, 'source': src}
        else:
            nuevos.append(e)
    elif name in matched and matched[name]['category']:
        m = matched[name]
        final[name] = {'category': m['category'],
                       'source': f"report p{m['page']} ({m['title'][:40]})"}
    else:
        nuevos.append(e)

from collections import Counter
cnt = Counter(v['category'] for v in final.values())
print(f'Con categoría oficial: {len(final)} / {len(excel)}')
for c in ['Clarity in Action', 'Inclusive Voices', 'Trust Catalysts',
          'Exploring New Frontiers', 'Dialogue Builders']:
    print(f'  {c}: {cnt[c]}')

propuestos = {}
sin_propuesta = []
for e in nuevos:
    if e['name'] in PROPUESTAS:
        cat, why = PROPUESTAS[e['name']]
        propuestos[e['name']] = {'category': cat, 'source': 'PROPUESTA (validar)',
                                 'rationale': why, 'tier': e['tier']}
    else:
        sin_propuesta.append(e['name'])
print(f'\nPropuestos (a validar): {len(propuestos)}')
if sin_propuesta:
    print('SIN PROPUESTA:', sin_propuesta)

json.dump({'oficial': final, 'propuestos': propuestos},
          open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'Guardado: {OUT}')

# ---- Documento de validación para el cliente ----
md = io.StringIO()
md.write('# Asignación de categorías temáticas — Atlas of Innovation\n\n')
md.write('**Fuente principal:** Final Report EN.pdf (asignación oficial por caso, '
         'verificada página por página). El Excel de diseño no trae columna de '
         'categoría; el reporte cubre 103 casos y el Excel agrega 10 posteriores '
         '(uno duplicado, ver nota final).\n\n')
tot = Counter(v['category'] for v in final.values())
for v in propuestos.values():
    tot[v['category']] += 1
md.write('| Categoría | Oficial (reporte) | + Propuestos | Total |\n|---|---|---|---|\n')
for c in ['Clarity in Action', 'Inclusive Voices', 'Trust Catalysts',
          'Exploring New Frontiers', 'Dialogue Builders']:
    nprop = sum(1 for v in propuestos.values() if v['category'] == c)
    md.write(f'| {c} | {cnt[c]} | +{nprop} | {tot[c]} |\n')
md.write(f'| **Total** | **{len(final)}** | **+{len(propuestos)}** | **{len(final)+len(propuestos)}** |\n')
md.write('\n## Casos nuevos — categoría PROPUESTA (requiere validación del cliente)\n\n')
md.write('Estos casos fueron agregados al repositorio después del Final Report y '
         'no tienen categoría oficial. Proponemos:\n\n')
for name, v in propuestos.items():
    md.write(f'- **{name}** → `{v["category"]}`\n  - {v["rationale"]}\n')
md.write('\n## Notas de calidad de datos para el cliente\n\n')
md.write('1. **Caso duplicado en el Excel**: "SOCIAL MEDIA GOV" (fila 59, con '
         'descripción) y "Social Media Gov" (fila 109, sin descripción) son la '
         'misma iniciativa. El desarrollo la incluirá una sola vez.\n')
md.write('2. **Sin descripción corta (3 casos)**: "Creación de micrositio web: '
         'redacta simple unc" (Argentina), "Research" (Sana\'a University, Yemen) '
         'y "Libertades públicas" (Consultora Gerencial, Venezuela) no tienen '
         'texto en la columna Description (EN). Para los dos últimos, el Final '
         'Report (p72 y p78) sí trae un resumen del caso: podemos tomar ese texto '
         'con visto bueno del cliente; para "redacta simple unc" hay que pedirlo.\n')
md.write('3. Los 4 casos Spotlight cuya categoría se marca "resaltado visual" '
         '(BHASHINI, Not Alone, Extra Favelas, Elvia Derechos) fueron verificados '
         'visualmente contra el PDF: todos Exploring New Frontiers.\n')
with open(r'c:\wamp_3\www\atlas\tools\CATEGORIAS_VALIDACION.md', 'w', encoding='utf-8') as f:
    f.write(md.getvalue())
print('Guardado: tools/CATEGORIAS_VALIDACION.md')
