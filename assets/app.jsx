/* =========================================================================
   Atlas of Innovation in Public Communication — aplicación del repositorio
   React 18 (UMD) + Babel in-browser. Bilingüe EN/ES. Sin banner/logos/footer:
   el desarrollo se embebe en el Drupal del cliente (ver DESIGN-SYSTEM_atlas.md).
   Datos: window.ATLAS_CASES (assets/cases.js) · Mapa: window.ATLAS_WORLD.
   Flag interno: window.ATLAS_SHOW_PROD = true muestra las notas de producción
   de los Spotlight (revisión interna, NUNCA en el build público).
   ========================================================================= */
const { useState, useEffect, useMemo, useRef, useContext, createContext } = React;

/* ---------- Constantes de diseño ---------- */
const CAT_COLORS = {
  'Clarity in Action': '#ffe5a5',
  'Inclusive Voices': '#c4ebcf',
  'Trust Catalysts': '#f698a4',
  'Exploring New Frontiers': '#d0bade',
  'Dialogue Builders': '#f8b288'
};
const CAT_ORDER = Object.keys(CAT_COLORS);
const TIER_ORDER = ['Spotlight', 'High visibility', 'Noteworthy'];
const TIER_DOT = { 'Spotlight': '#f7931e', 'High visibility': '#00abd6', 'Noteworthy': '#b9cdd9' };
const ISO_NUM = { BR:'076', AR:'032', CO:'170', DE:'276', IN:'356', ES:'724', MX:'484',
  CL:'152', PE:'604', EC:'218', UA:'804', KE:'404', NL:'528', VN:'704', MW:'454',
  CF:'140', CD:'180', AO:'024', BJ:'204', YE:'887', LR:'430', US:'840', CA:'124',
  GB:'826', ID:'360', UG:'800', KH:'116', PA:'591', PY:'600', VE:'862' };

/* ---------- Textos de interfaz ---------- */
const STR = {
  en: {
    kpiCases: 'CASES IN THE REPOSITORY', kpiCountries: 'COUNTRIES REPRESENTED',
    kpiRegions: 'UNDP REGIONS', kpiLangs: 'SUBMISSION LANGUAGES',
    howTitle: 'How the cases are organised',
    howText: 'Every case belongs to one of five thematic categories and to one of three visibility levels, which determine how much detail the repository entry carries.',
    tierDefs: {
      'Spotlight': 'Selected for extended treatment: full narrative, signs of impact and supporting visual material.',
      'High visibility': 'Full entry: short description, long-form case text and links.',
      'Noteworthy': 'Brief entry: name, organisation, country and short description.'
    },
    spotEyebrow: 'HIGHEST VISIBILITY LEVEL', spotTitle: 'Spotlighted cases',
    spotText: 'Twenty initiatives were carefully reviewed and selected as spotlighted cases, based on their unique approach to public communication. As innovative solutions of working with public institutions or of public institutions to communicate matters of public interest, these hope to inspire future action.',
    mapTitle: 'Cases by country', mapText: 'Select a country to filter the repository below.',
    mapLegend: 'CASES', mapNone: 'no cases', mapMost: 'MOST REPRESENTED',
    mapNote: 'Two records are not tied to a single country: one regional Asia-Pacific network and one Germany / United Kingdom initiative.',
    mapBrazilCallout: n => `Brazil · ${n} cases`,
    mapBrazilShare: (n, pct) => `${n} cases — ${pct}% of the repository. Shown separately so differences among the other countries stay visible.`,
    allTitle: 'All cases', showing: (a, b) => `SHOWING ${a} OF ${b} CASES`,
    searchPh: 'Search by initiative, organisation, country or keyword',
    fRegion: 'Region', fCountry: 'Country', fType: 'Institution type', fCategory: 'Category',
    fTier: 'Visibility', fLang: 'Original language', clearAll: 'Clear all',
    disclaimer: 'Please note: initiative names, as well as the links, websites, social media accounts and supporting materials featured in each case, are presented in their original language and may not be available in English.',
    disclaimerShort: 'Links and materials for this case are in their original language.',
    read: 'Read the case →', emptyTitle: 'No cases match these filters',
    emptyText: 'Try removing a filter or searching a different term.',
    emptyBtn: 'Clear all filters', country: 'COUNTRY', region: 'REGION',
    visibility: 'VISIBILITY LEVEL', origLang: 'ORIGINAL LANGUAGE',
    description: 'DESCRIPTION', fullCase: 'FULL CASE', linksTitle: 'LINKS & MATERIALS',
    noDetails: 'Noteworthy entries carry the short description only. No long-form text was submitted for this case.',
    descPending: 'Short description pending in the dataset.',
    langNames: { Portuguese: 'Portuguese', Spanish: 'Spanish', English: 'English', French: 'French' },
    tierNames: { 'Spotlight': 'Spotlighted', 'High visibility': 'High visibility', 'Noteworthy': 'Noteworthy' },
    close: 'Close', esFallback: ''
  },
  es: {
    kpiCases: 'CASOS EN EL REPOSITORIO', kpiCountries: 'PAÍSES REPRESENTADOS',
    kpiRegions: 'REGIONES PNUD', kpiLangs: 'IDIOMAS DE POSTULACIÓN',
    howTitle: 'Cómo se organizan los casos',
    howText: 'Cada caso pertenece a una de cinco categorías temáticas y a uno de tres niveles de visibilidad, que determinan el nivel de detalle de su entrada en el repositorio.',
    tierDefs: {
      'Spotlight': 'Selección con tratamiento ampliado: narrativa completa, señales de impacto y material visual de apoyo.',
      'High visibility': 'Entrada completa: descripción corta, texto extenso del caso y enlaces.',
      'Noteworthy': 'Entrada breve: nombre, organización, país y descripción corta.'
    },
    spotEyebrow: 'NIVEL MÁS ALTO DE VISIBILIDAD', spotTitle: 'Casos Spotlighted',
    spotText: 'Veinte iniciativas fueron cuidadosamente revisadas y seleccionadas como casos spotlighted por su enfoque único de la comunicación pública. Como soluciones innovadoras que trabajan con instituciones públicas —o desde ellas— para comunicar asuntos de interés público, buscan inspirar acciones futuras.',
    mapTitle: 'Casos por país', mapText: 'Selecciona un país para filtrar el repositorio.',
    mapLegend: 'CASOS', mapNone: 'sin casos', mapMost: 'MÁS REPRESENTADOS',
    mapNote: 'Dos registros no corresponden a un solo país: una red regional de Asia-Pacífico y una iniciativa Alemania / Reino Unido.',
    mapBrazilCallout: n => `Brasil · ${n} casos`,
    mapBrazilShare: (n, pct) => `${n} casos — ${pct}% del repositorio. Se muestra aparte para que las diferencias entre los demás países sigan siendo visibles.`,
    allTitle: 'Todos los casos', showing: (a, b) => `MOSTRANDO ${a} DE ${b} CASOS`,
    searchPh: 'Busca por iniciativa, organización, país o palabra clave',
    fRegion: 'Región', fCountry: 'País', fType: 'Tipo de institución', fCategory: 'Categoría',
    fTier: 'Visibilidad', fLang: 'Idioma original', clearAll: 'Limpiar todo',
    disclaimer: 'Ten en cuenta: los nombres de las iniciativas, así como los enlaces, sitios web, redes sociales y materiales de apoyo de cada caso, se presentan en su idioma original y pueden no estar disponibles en inglés o español.',
    disclaimerShort: 'Los enlaces y materiales de este caso están en su idioma original.',
    read: 'Ver el caso →', emptyTitle: 'Ningún caso coincide con estos filtros',
    emptyText: 'Prueba quitando un filtro o buscando otro término.',
    emptyBtn: 'Limpiar filtros', country: 'PAÍS', region: 'REGIÓN',
    visibility: 'NIVEL DE VISIBILIDAD', origLang: 'IDIOMA ORIGINAL',
    description: 'DESCRIPCIÓN', fullCase: 'CASO COMPLETO', linksTitle: 'ENLACES Y MATERIALES',
    noDetails: 'Las entradas Noteworthy llevan solo la descripción corta. Este caso no envió texto extenso.',
    descPending: 'Descripción corta pendiente en el dataset.',
    langNames: { Portuguese: 'Portugués', Spanish: 'Español', English: 'Inglés', French: 'Francés' },
    tierNames: { 'Spotlight': 'Spotlighted', 'High visibility': 'Alta visibilidad', 'Noteworthy': 'Noteworthy' },
    close: 'Cerrar', esFallback: '(texto disponible solo en inglés)'
  }
};

const I18N = createContext(null);
function useI18n() { return useContext(I18N); }

function trunc(s, n) {
  if (!s) return '';
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

/* Campo bilingüe con fallback a EN */
function useL() {
  const { lang } = useI18n();
  return (obj) => {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || '';
  };
}

/* ---------- Componentes ---------- */

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="atlas-lang" role="group" aria-label="Language / Idioma">
      {['en', 'es'].map(l => (
        <button key={l} className={lang === l ? 'is-active' : ''}
          aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function StatsBand({ cases }) {
  const { t } = useI18n();
  const countries = new Set(cases.map(c => c.country.en)
    .filter(n => n !== 'Regional — Asia & the Pacific' && n !== 'Germany / United Kingdom'));
  // el caso binacional suma sus dos países al conteo
  if (cases.some(c => c.country.en === 'Germany / United Kingdom')) {
    countries.add('Germany'); countries.add('United Kingdom');
  }
  const kpis = [
    [cases.length, t.kpiCases],
    [countries.size, t.kpiCountries],
    [new Set(cases.map(c => c.region.en)).size, t.kpiRegions],
    [new Set(cases.map(c => c.lang)).size, t.kpiLangs]
  ];
  const logo = window.ATLAS_LOGO || 'assets/img/logos-white.png';
  return (
    <section style={{ position: 'relative', background: 'var(--deep-ocean)', overflow: 'hidden', borderRadius: 'var(--r-xl)' }}>
      <div className="atlas-texture atlas-texture--light" aria-hidden="true" style={{ opacity: .16 }}></div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', padding: '20px 26px 16px' }}>
        <img src={logo} alt="UNDP · Catálise" style={{ height: 34, width: 'auto' }} />
      </div>
      <div className="atlas-grid atlas-grid--stats" style={{ position: 'relative', background: 'rgba(255,255,255,.16)' }}>
        {kpis.map(([n, label]) => (
          <div key={label} style={{ background: 'rgba(14,68,120,.72)', padding: '24px 26px' }}>
            <div className="atlas-kpi" style={{ fontSize: 38, color: '#fff' }}>{n}</div>
            <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 600, letterSpacing: '.12em', color: '#9dc0dd' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryBand({ cases, filters, setF }) {
  const { t } = useI18n();
  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 24 }}>
        <h2 className="atlas-h2">{t.howTitle}</h2>
        <p style={{ margin: 0, maxWidth: '52ch', fontSize: 14, color: 'var(--text)' }}>{t.howText}</p>
      </div>
      <div className="atlas-grid atlas-grid--cats">
        {CAT_ORDER.map(k => (
          <button key={k} onClick={() => setF('category', k)}
            className="atlas-card atlas-card--click"
            aria-pressed={filters.category === k}
            style={{ textAlign: 'left', padding: 0, overflow: 'hidden',
              outlineOffset: 2, borderColor: filters.category === k ? 'var(--pacific)' : undefined }}>
            <div style={{ height: 7, background: CAT_COLORS[k] }}></div>
            <div style={{ padding: '18px 16px 20px' }}>
              <div className="atlas-kpi" style={{ fontSize: 30 }}>{cases.filter(c => c.category === k).length}</div>
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{k}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="atlas-grid atlas-grid--high" style={{ marginTop: 26 }}>
        {TIER_ORDER.map(tier => (
          <div key={tier} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '14px 16px', background: 'var(--bg-soft)', borderRadius: 'var(--r-sm)' }}>
            <span aria-hidden="true" style={{ flex: 'none', width: 9, height: 9, borderRadius: '50%', background: TIER_DOT[tier], marginTop: 5 }}></span>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text)' }}>
              <span style={{ fontFamily: 'var(--sans-display)', fontWeight: 700, color: 'var(--ink)' }}>{t.tierNames[tier]}</span>
              {' — '}{t.tierDefs[tier]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Tile de marca para casos sin imagen (motivo topográfico sobre Deep Ocean) */
function BrandTile({ caseObj, height }) {
  const L = useL();
  return (
    <div style={{ height, background: 'var(--deep-ocean)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
      <div className="atlas-texture atlas-texture--light" aria-hidden="true"></div>
      <div style={{ position: 'relative', height: '100%', padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="atlas-mono" style={{ color: '#9dc0dd' }}>{caseObj.no}</div>
        <div style={{ fontFamily: 'var(--sans-display)', fontWeight: 700, fontSize: 30, lineHeight: 1.08, letterSpacing: '-.03em', color: '#fff', maxWidth: '16ch' }}>{L(caseObj.country)}</div>
      </div>
    </div>
  );
}

function SpotlightSection({ cases, openCase }) {
  const { t } = useI18n();
  const L = useL();
  const spot = cases.filter(c => c.tier === 'Spotlight');
  return (
    <section id="atlas-spotlight" style={{ marginTop: 72 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 22, marginBottom: 34 }}>
        <div>
          <div className="atlas-eyebrow" style={{ color: '#a8620c', marginBottom: 12 }}>{t.spotEyebrow}</div>
          <h2 className="atlas-h2 atlas-h2--xl">{t.spotTitle}</h2>
        </div>
        <p style={{ margin: 0, maxWidth: '46ch', fontSize: 14.5, color: 'var(--text)' }}>{t.spotText}</p>
      </div>
      <div className="atlas-grid atlas-grid--spot">
        {spot.map(c => (
          <article key={c.id} className="atlas-card atlas-card--click" onClick={() => openCase(c)}
            tabIndex={0} role="button" aria-label={c.name}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(c); } }}
            style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {c.image
              ? <img src={c.image} alt="" style={{ height: 230, width: '100%', objectFit: 'cover', borderBottom: '1px solid var(--line)' }} />
              : <BrandTile caseObj={c} height={230} />}
            <div style={{ padding: '22px 26px 26px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {c.category && <span className="atlas-tag atlas-tag--cat" style={{ background: CAT_COLORS[c.category] }}>{c.category}</span>}
                <span className="atlas-tag atlas-tag--neutral">{L(c.country)}</span>
              </div>
              <h3 style={{ margin: 0, fontFamily: 'var(--sans-display)', fontWeight: 600, fontSize: 20, lineHeight: 1.26, letterSpacing: '-.015em', color: 'var(--ink)' }}>{c.name}</h3>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>{c.org}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62 }}>{trunc(L(c.desc), 185) || t.descPending}</p>
              <div style={{ marginTop: 'auto', paddingTop: 8, fontFamily: 'var(--sans-display)', fontSize: 13, fontWeight: 700, color: 'var(--pacific)' }}>{t.read}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorldMap({ counts, selected, onPick, brazilLabel }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.ATLAS_WORLD || !window.d3 || !window.topojson) return;
    const d3 = window.d3;
    const width = el.clientWidth || 800, height = Math.max(340, width * .52);
    el.innerHTML = '';
    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%').attr('role', 'img');
    const world = window.topojson.feature(window.ATLAS_WORLD, window.ATLAS_WORLD.objects.countries);
    const projection = d3.geoNaturalEarth1().fitSize([width, height], world);
    const path = d3.geoPath(projection);
    const numToIso = {};
    Object.keys(ISO_NUM).forEach(iso => { numToIso[ISO_NUM[iso]] = iso; });
    // Brasil concentra la mayoría de casos: se pinta y anota aparte, y la escala
    // de color se calcula SOLO con los demás países para que sus diferencias se vean.
    const color = (n, iso) => iso === 'BR' ? 'var(--map-40)'
      : n >= 6 ? 'var(--map-8-39)' : n >= 3 ? 'var(--map-3-7)'
      : n === 2 ? 'var(--map-2)' : n === 1 ? 'var(--map-1)' : 'var(--map-none)';
    svg.append('g').selectAll('path').data(world.features).join('path')
      .attr('d', path)
      .attr('fill', d => {
        const iso = numToIso[String(d.id).padStart(3, '0')];
        return color(iso ? (counts[iso] || 0) : 0, iso);
      })
      .attr('stroke', '#fff').attr('stroke-width', .6)
      .attr('cursor', d => numToIso[String(d.id).padStart(3, '0')] && counts[numToIso[String(d.id).padStart(3, '0')]] ? 'pointer' : 'default')
      .attr('opacity', d => {
        if (!selected) return 1;
        const iso = numToIso[String(d.id).padStart(3, '0')];
        return iso === selected ? 1 : .45;
      })
      .on('click', (e, d) => {
        const iso = numToIso[String(d.id).padStart(3, '0')];
        if (iso && counts[iso]) onPick(iso);
      })
      .append('title')
      .text(d => {
        const iso = numToIso[String(d.id).padStart(3, '0')];
        const n = iso ? (counts[iso] || 0) : 0;
        return `${d.properties.name}: ${n}`;
      });
    // Callout de Brasil: flecha desde el país hacia una etiqueta con su cifra
    const brazil = world.features.find(d => String(d.id).padStart(3, '0') === '076');
    if (brazil && brazilLabel) {
      const [cx, cy] = path.centroid(brazil);
      const lx = cx + width * .12, ly = cy + height * .16;
      const g = svg.append('g').attr('cursor', 'pointer')
        .on('click', () => onPick('BR'));
      g.append('line').attr('x1', cx + 8).attr('y1', cy + 8).attr('x2', lx - 4).attr('y2', ly - 9)
        .attr('stroke', 'var(--deep-ocean)').attr('stroke-width', 1.2);
      const label = g.append('g');
      const text = label.append('text')
        .attr('x', lx + 10).attr('y', ly + 4)
        .attr('font-family', 'var(--sans-display)').attr('font-size', 11.5)
        .attr('font-weight', 700).attr('fill', '#fff')
        .text(brazilLabel);
      const tw = text.node().getComputedTextLength ? text.node().getComputedTextLength() : brazilLabel.length * 6.4;
      label.insert('rect', 'text')
        .attr('x', lx).attr('y', ly - 10).attr('rx', 10)
        .attr('width', tw + 20).attr('height', 21)
        .attr('fill', 'var(--deep-ocean)');
      g.append('title').text(brazilLabel);
    }
  }, [counts, selected, brazilLabel]);
  return <div ref={ref} style={{ width: '100%' }}></div>;
}

function MapSection({ cases, filtered, filters, setF }) {
  const { t, lang } = useI18n();
  const L = useL();
  const counts = useMemo(() => {
    const m = {};
    cases.forEach(c => { if (c.iso) m[c.iso] = (m[c.iso] || 0) + 1; });
    return m;
  }, [cases]);
  const byCountry = useMemo(() => {
    const m = {};
    cases.forEach(c => { m[c.country.en] = (m[c.country.en] || 0) + 1; });
    return Object.keys(m).map(k => ({ key: k, n: m[k], obj: cases.find(c => c.country.en === k).country, iso: cases.find(c => c.country.en === k).iso }))
      .sort((a, b) => b.n - a.n);
  }, [cases]);
  // Brasil se muestra aparte (concentra la mayoría); las barras solo comparan al resto
  const brazil = byCountry.find(r => r.iso === 'BR');
  const others = byCountry.filter(r => r.iso !== 'BR').slice(0, 8);
  const max = others.length ? others[0].n : 1;
  const brazilPct = brazil ? Math.round(brazil.n / cases.length * 100) : 0;
  const selIso = useMemo(() => {
    if (!filters.country) return '';
    const c = cases.find(x => x.country.en === filters.country);
    return c ? c.iso : '';
  }, [filters.country, cases]);
  const legend = [['var(--map-1)', '1'], ['var(--map-2)', '2'], ['var(--map-3-7)', '3–5'], ['var(--map-8-39)', '6+'], ['var(--map-40)', lang === 'es' ? 'Brasil' : 'Brazil'], ['var(--map-none)', t.mapNone]];
  return (
    <section id="atlas-map" style={{ marginTop: 84 }}>
      <div className="atlas-card" style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div className="atlas-map-grid">
          <div style={{ padding: '34px 34px 24px', borderRight: '1px solid var(--line)' }}>
            <h2 className="atlas-h2" style={{ marginBottom: 6 }}>{t.mapTitle}</h2>
            <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--text)' }}>{t.mapText}</p>
            <WorldMap counts={counts} selected={selIso}
              brazilLabel={brazil ? t.mapBrazilCallout(brazil.n) : ''}
              onPick={iso => {
                const c = cases.find(x => x.iso === iso);
                if (c) setF('country', c.country.en);
              }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
              <span className="atlas-eyebrow" style={{ letterSpacing: '.12em' }}>{t.mapLegend}</span>
              {legend.map(([col, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: col }}></span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '34px 30px', background: 'var(--bg-soft)' }}>
            <div className="atlas-eyebrow" style={{ marginBottom: 20 }}>{t.mapMost}</div>
            {brazil && (
              <button onClick={() => setF('country', brazil.key)}
                style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, background: 'var(--deep-ocean)', borderRadius: 'var(--r-sm)', padding: '14px 16px', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--sans-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{L(brazil.obj)}</span>
                  <span className="atlas-mono" style={{ color: '#9dc0dd', fontSize: 13 }}>{brazil.n}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.55, color: '#cfe1f0' }}>{t.mapBrazilShare(brazil.n, brazilPct)}</div>
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {others.map(r => (
                <button key={r.key} onClick={() => setF('country', r.key)}
                  style={{ border: 0, background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: filters.country === r.key ? 700 : 500, color: 'var(--ink)' }}>{L(r.obj)}</span>
                    <span className="atlas-mono" style={{ fontSize: 11.5 }}>{r.n}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: '#e3edf4', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'var(--pacific)', width: Math.max(4, Math.round(r.n / max * 100)) + '%' }}></div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e3edf4', fontSize: 12, lineHeight: 1.6, color: 'var(--muted)' }}>{t.mapNote}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FacetFilter({ fkey, label, options, value, open, onToggle, onPick }) {
  return (
    <div data-atlas-filter="1" style={{ position: 'relative' }}>
      <button className={'atlas-filter-btn' + (value ? ' atlas-filter-btn--active' : '')}
        aria-expanded={open} onClick={onToggle}>
        <span>{value ? `${label}: ${trunc(value, 22)}` : label}</span>
        <span style={{ fontSize: 9, color: 'var(--faint)' }}>▼</span>
      </button>
      {open && (
        <div className="atlas-dropdown" role="listbox" aria-label={label}>
          {options.map(o => (
            <button key={o.value} role="option" aria-selected={value === o.value} onClick={() => onPick(o.value)}>
              <span>{o.label}{value === o.value ? '  ✓' : ''}</span>
              <span className="atlas-mono" style={{ fontSize: 11 }}>{o.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Repository({ cases, results, filters, setF, q, setQ, clearAll, openCase, facetOptions, openFacet, setOpenFacet }) {
  const { t, lang } = useI18n();
  const L = useL();
  const groups = TIER_ORDER.map(tier => ({ tier, items: results.filter(c => c.tier === tier) }));
  const chips = [];
  const LBL = { region: t.fRegion, country: t.fCountry, type: t.fType, category: t.fCategory, tier: t.fTier, lang: t.fLang };
  Object.keys(LBL).forEach(k => {
    if (filters[k]) {
      let display = filters[k];
      if (k === 'tier') display = t.tierNames[display] || display;
      if (k === 'lang') display = t.langNames[display] || display;
      if (k === 'country') { const c = cases.find(x => x.country.en === display); if (c) display = L(c.country); }
      if (k === 'type') { const c = cases.find(x => x.type.en === display); if (c) display = L(c.type); }
      if (k === 'region') { const c = cases.find(x => x.region.en === display); if (c) display = L(c.region); }
      chips.push({ key: k, label: `${LBL[k]}: ${display}` });
    }
  });
  const hasFilters = chips.length > 0 || !!q;
  return (
    <section id="atlas-repository" style={{ marginTop: 84 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 26 }}>
        <h2 className="atlas-h2 atlas-h2--xl">{t.allTitle}</h2>
        <div className="atlas-mono" style={{ fontSize: 12.5 }}>{t.showing(results.length, cases.length)}</div>
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', fill: 'var(--muted)' }}>
          <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/>
        </svg>
        <input className="atlas-search" value={q} onChange={e => setQ(e.target.value)}
          placeholder={t.searchPh} aria-label={t.searchPh} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {facetOptions.map(f => (
          <FacetFilter key={f.key} fkey={f.key} label={LBL[f.key]} options={f.options}
            value={f.display} open={openFacet === f.key}
            onToggle={() => setOpenFacet(openFacet === f.key ? '' : f.key)}
            onPick={v => { setF(f.key, v); setOpenFacet(''); }} />
        ))}
        {hasFilters && (
          <button onClick={clearAll} style={{ border: 0, background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--pacific)', cursor: 'pointer', padding: '11px 6px' }}>{t.clearAll}</button>
        )}
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {chips.map(ch => (
            <button key={ch.key} className="atlas-chip" onClick={() => setF(ch.key, filters[ch.key])}>
              <span>{ch.label}</span><span style={{ fontSize: 13, opacity: .55 }}>×</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 20, padding: '13px 16px', background: 'var(--bg-soft)', borderRadius: 10, maxWidth: '96ch' }}>
        <span aria-hidden="true" style={{ flex: 'none', width: 15, height: 15, borderRadius: '50%', background: '#b9cdd9', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', marginTop: 2 }}>i</span>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{t.disclaimer}</p>
      </div>

      {groups.map(g => g.items.length > 0 && (
        <div key={g.tier} style={{ marginTop: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: '50%', background: TIER_DOT[g.tier] }}></span>
            <h3 style={{ margin: 0, fontFamily: 'var(--sans-display)', fontWeight: 700, fontSize: 16, letterSpacing: '.02em', color: 'var(--ink)' }}>{t.tierNames[g.tier]}</h3>
            <span className="atlas-mono">{g.items.length}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
          </div>

          {g.tier === 'Spotlight' && (
            <div className="atlas-grid atlas-grid--spot-mini">
              {g.items.map(c => (
                <article key={c.id} className="atlas-card atlas-card--click atlas-card--spotlight"
                  onClick={() => openCase(c)} tabIndex={0} role="button" aria-label={c.name}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(c); } }}
                  style={{ borderRadius: 12, padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div className="atlas-mono" style={{ fontSize: 10.5 }}>{c.no}</div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--sans-display)', fontWeight: 600, fontSize: 15.5, lineHeight: 1.28, color: 'var(--ink)' }}>{trunc(c.name, 62)}</h4>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{c.org}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="atlas-tag atlas-tag--neutral" style={{ fontSize: 10.5 }}>{L(c.country)}</span>
                    {c.category && <span className="atlas-tag atlas-tag--cat" style={{ background: CAT_COLORS[c.category], fontSize: 10.5 }}>{c.category}</span>}
                  </div>
                </article>
              ))}
            </div>
          )}

          {g.tier === 'High visibility' && (
            <div className="atlas-grid atlas-grid--high">
              {g.items.map(c => (
                <article key={c.id} className="atlas-card atlas-card--click" onClick={() => openCase(c)}
                  tabIndex={0} role="button" aria-label={c.name}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(c); } }}
                  style={{ borderRadius: 'var(--r-md)', padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {c.category && <div><span className="atlas-tag atlas-tag--cat" style={{ background: CAT_COLORS[c.category], fontSize: 10.5 }}>{c.category}</span></div>}
                  <h4 style={{ margin: 0, fontFamily: 'var(--sans-display)', fontWeight: 600, fontSize: 17.5, lineHeight: 1.27, letterSpacing: '-.01em', color: 'var(--ink)' }}>{c.name}</h4>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>{c.org} · {L(c.country)}</div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{trunc(L(c.desc), 160) || t.descPending}</p>
                  <div style={{ marginTop: 'auto', paddingTop: 8, fontFamily: 'var(--sans-display)', fontSize: 12.5, fontWeight: 700, color: 'var(--pacific)' }}>{t.read}</div>
                </article>
              ))}
            </div>
          )}

          {g.tier === 'Noteworthy' && (
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {g.items.map(c => (
                <button key={c.id} className="atlas-row" onClick={() => openCase(c)}>
                  <span style={{ fontFamily: 'var(--sans-display)', fontWeight: 600, fontSize: 14.5, lineHeight: 1.35, color: 'var(--ink)' }}>{c.name}</span>
                  <span className="atlas-row-org" style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>{c.org}</span>
                  <span className="atlas-row-country" style={{ fontSize: 12, fontWeight: 600 }}>{L(c.country)}</span>
                  <span className="atlas-row-cat">
                    {c.category && <span className="atlas-tag atlas-tag--cat" style={{ background: CAT_COLORS[c.category], fontSize: 10.5 }}>{c.category}</span>}
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 13, color: '#b9cdd9', textAlign: 'right' }}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {results.length === 0 && (
        <div style={{ marginTop: 56, border: '1px dashed var(--line-strong)', borderRadius: 16, padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--sans-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>{t.emptyTitle}</div>
          <p style={{ margin: '10px 0 20px', fontSize: 14 }}>{t.emptyText}</p>
          <button className="atlas-btn atlas-btn--ghost" onClick={clearAll}>{t.emptyBtn}</button>
        </div>
      )}
    </section>
  );
}

function CasePanel({ c, onClose }) {
  const { t, lang } = useI18n();
  const L = useL();
  const panelRef = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape') { onClose(); return; }
      // focus-trap: Tab circula dentro de la ficha
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    if (panelRef.current) panelRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus();  // devolver el foco al disparador
    };
  }, [onClose]);
  if (!c) return null;
  const desc = L(c.desc), details = L(c.details);
  const descFallback = lang === 'es' && c.desc && !c.desc.es && c.desc.en;
  const detFallback = lang === 'es' && c.details && !c.details.es && c.details.en;
  const urls = (c.links || []).filter(l => /^(https?:|www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(l))
    .map(l => ({ href: /^https?:/i.test(l) ? l : 'https://' + l.replace(/^\/+/, ''), label: l }));
  const handles = (c.links || []).filter(l => !/^(https?:|www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(l));
  const showProd = !!window.ATLAS_SHOW_PROD && c.prod;
  const meta = [
    [t.country, L(c.country)], [t.region, L(c.region)],
    [t.visibility, t.tierNames[c.tier]], [t.origLang, t.langNames[c.lang] || c.lang]
  ];
  return (
    <div>
      <div className="atlas-overlay" onClick={onClose}></div>
      <aside className="atlas-panel" role="dialog" aria-modal="true" aria-label={c.name} tabIndex={-1} ref={panelRef}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--line)', padding: '18px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_DOT[c.tier] }}></span>
            <span className="atlas-eyebrow">{t.tierNames[c.tier].toUpperCase()} · {c.no}</span>
          </div>
          <button onClick={onClose} aria-label={t.close}
            style={{ border: '1px solid var(--line)', background: '#fff', width: 34, height: 34, borderRadius: '50%', color: 'var(--text)', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '30px 34px 46px' }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
            {c.category && <span className="atlas-tag atlas-tag--cat" style={{ background: CAT_COLORS[c.category], fontSize: 11.5, padding: '6px 12px' }}>{c.category}</span>}
            <span className="atlas-tag atlas-tag--neutral" style={{ fontSize: 11.5, padding: '6px 12px' }}>{L(c.type)}</span>
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--sans-display)', fontWeight: 700, fontSize: 31, lineHeight: 1.17, letterSpacing: '-.022em', color: 'var(--ink)' }}>{c.name}</h2>
          <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5 }}>{c.org}</div>

          {c.image && <img src={c.image} alt="" style={{ marginTop: 26, width: '100%', borderRadius: 14, border: '1px solid var(--line)' }} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line)', borderRadius: 12, overflow: 'hidden', marginTop: 28 }}>
            {meta.map(([k, v]) => (
              <div key={k} style={{ background: 'var(--bg-soft)', padding: '15px 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: 'var(--muted)' }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{v}</div>
              </div>
            ))}
          </div>

          <h4 className="atlas-eyebrow" style={{ margin: '34px 0 12px' }}>{t.description}</h4>
          {descFallback && <div style={{ fontSize: 11.5, color: 'var(--faint)', marginBottom: 8 }}>{t.esFallback}</div>}
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.72 }}>{desc || t.descPending}</p>

          {details ? (
            <div>
              <h4 className="atlas-eyebrow" style={{ margin: '34px 0 12px' }}>{t.fullCase}</h4>
              {detFallback && <div style={{ fontSize: 11.5, color: 'var(--faint)', marginBottom: 8 }}>{t.esFallback}</div>}
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{details}</p>
            </div>
          ) : (
            c.tier === 'Noteworthy' && (
              <div style={{ marginTop: 30, border: '1px dashed var(--line-strong)', borderRadius: 12, padding: '18px 20px', fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>{t.noDetails}</div>
            )
          )}

          {(urls.length > 0 || handles.length > 0) && (
            <div>
              <h4 className="atlas-eyebrow" style={{ margin: '34px 0 12px' }}>{t.linksTitle}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {urls.map(u => (
                  <a key={u.href} href={u.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, wordBreak: 'break-all' }}>{u.label} <span aria-hidden="true" style={{ fontSize: 12 }}>↗</span></a>
                ))}
                {handles.map(h => (
                  <span key={h} style={{ fontSize: 14, fontWeight: 500 }}>{h}</span>
                ))}
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.6, color: 'var(--muted)' }}>{t.disclaimerShort}</p>
            </div>
          )}

          {showProd && (
            <div style={{ marginTop: 34, border: '1px dashed var(--solar)', borderRadius: 12, padding: '20px 22px', background: '#fffaf2' }}>
              <div className="atlas-mono" style={{ color: '#a8620c', marginBottom: 12, fontSize: 10.5 }}>PRODUCTION NOTE — NOT PUBLIC</div>
              {[['MATERIAL RECEIVED', c.prod.files], ['SUGGESTED PIECES', c.prod.pieces], ['STILL MISSING', c.prod.gap]].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: 'var(--muted)' }}>{k}</div>
                  <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [lang, setLangState] = useState(() => {
    // prioridad: ?lang= → window.ATLAS_LANG (config del embed) → localStorage → 'en'
    try {
      const p = new URLSearchParams(location.search).get('lang');
      if (p === 'es' || p === 'en') return p;
      if (window.ATLAS_LANG === 'es' || window.ATLAS_LANG === 'en') return window.ATLAS_LANG;
      return localStorage.getItem('atlas-lang') || 'en';
    } catch (e) { return 'en'; }
  });
  const setLang = l => { setLangState(l); try { localStorage.setItem('atlas-lang', l); } catch (e) {} };
  const t = STR[lang];

  const cases = useMemo(() => {
    const spotIdx = { n: 0 };
    return (window.ATLAS_CASES || []).map((c, i) => {
      const no = c.tier === 'Spotlight' ? String(++spotIdx.n).padStart(2, '0') : String(i + 1).padStart(3, '0');
      return Object.assign({}, c, { no, image: (window.ATLAS_IMAGES || {})[c.id] || null });
    });
  }, []);

  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ region: '', country: '', type: '', category: '', tier: '', lang: '' });
  const [openFacet, setOpenFacet] = useState('');
  const [sel, setSel] = useState(() => {
    // deep-link: ?case=c001 abre la ficha directamente (compartible desde Drupal)
    try {
      const id = new URLSearchParams(location.search).get('case');
      return id ? (cases.find(c => c.id === id) || null) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    const onDoc = e => {
      if (!e.target.closest('[data-atlas-filter]')) setOpenFacet('');
    };
    document.addEventListener('click', onDoc, true);
    return () => document.removeEventListener('click', onDoc, true);
  }, []);

  const setF = (key, val) => {
    setFilters(f => Object.assign({}, f, { [key]: f[key] === val ? '' : val }));
    if (key === 'country' || key === 'category') {
      const el = document.getElementById('atlas-repository');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };
  const clearAll = () => { setQ(''); setFilters({ region: '', country: '', type: '', category: '', tier: '', lang: '' }); setOpenFacet(''); };

  const matches = (c, skip) => {
    for (const k of ['region', 'country', 'type', 'category', 'tier', 'lang']) {
      if (k === skip || !filters[k]) continue;
      const v = k === 'region' ? c.region.en : k === 'country' ? c.country.en : k === 'type' ? c.type.en : c[k];
      if (v !== filters[k]) return false;
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const hay = [c.name, c.org, c.country.en, c.country.es, c.type.en, c.type.es,
        (c.desc && c.desc.en) || '', (c.desc && c.desc.es) || ''].join(' ').toLowerCase();
      if (hay.indexOf(needle) === -1) return false;
    }
    return true;
  };
  const results = useMemo(() => cases.filter(c => matches(c, null)), [cases, filters, q]);

  const L = obj => (obj && (obj[lang] || obj.en)) || '';
  const facetOptions = useMemo(() => {
    const defs = [
      ['region', c => c.region.en, v => { const c = cases.find(x => x.region.en === v); return c ? L(c.region) : v; }],
      ['country', c => c.country.en, v => { const c = cases.find(x => x.country.en === v); return c ? L(c.country) : v; }],
      ['type', c => c.type.en, v => { const c = cases.find(x => x.type.en === v); return c ? L(c.type) : v; }],
      ['category', c => c.category, v => v],
      ['tier', c => c.tier, v => t.tierNames[v] || v],
      ['lang', c => c.lang, v => t.langNames[v] || v]
    ];
    return defs.map(([key, get, labelOf]) => {
      const pool = cases.filter(c => matches(c, key));
      let values = [...new Set(cases.map(get).filter(Boolean))];
      if (key === 'category') values = CAT_ORDER.filter(v => values.includes(v));
      if (key === 'tier') values = TIER_ORDER;
      if (key !== 'category' && key !== 'tier') values.sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
      const options = values.map(v => ({
        value: v, label: labelOf(v),
        count: pool.filter(c => get(c) === v).length
      })).filter(o => o.count > 0 || filters[key] === o.value);
      return { key, options, display: filters[key] ? (defs.find(d => d[0] === key)[2])(filters[key]) : '' };
    });
  }, [cases, filters, q, lang]);

  return (
    <I18N.Provider value={{ lang, setLang, t }}>
      <div className="atlas-container" style={{ paddingTop: 34, paddingBottom: 90 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <LangSwitch />
        </div>
        <StatsBand cases={cases} />
        <CategoryBand cases={cases} filters={filters} setF={setF} />
        <SpotlightSection cases={cases} openCase={setSel} />
        <MapSection cases={cases} filtered={results} filters={filters} setF={setF} />
        <Repository cases={cases} results={results} filters={filters} setF={setF}
          q={q} setQ={setQ} clearAll={clearAll} openCase={setSel}
          facetOptions={facetOptions} openFacet={openFacet} setOpenFacet={setOpenFacet} />
        {sel && <CasePanel c={sel} onClose={() => setSel(null)} />}
      </div>
    </I18N.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('atlas-root')).render(<App />);
