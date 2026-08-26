/* =========================================================================
   Atlas of Innovation — versión v2 sobre el UNDP Design System
   El host (undp.org) carga base-minimal + components del DS: este código usa
   sus clases (stats-card, content-card, chip, select-default, modal, grid) y
   tokens --undpds-*. CSS complementario en assets/styles-ds.css (.atlas-ds).
   Lógica idéntica a app.jsx; cambia solo la capa de presentación.
   JS propio para el modal (el del DS no gestiona foco). Sin tocar el host.
   ========================================================================= */
const { useState, useEffect, useMemo, useRef, useContext, createContext } = React;

const CAT_COLORS = {
  'Clarity in Action': '#ffe5a5',
  'Inclusive Voices': '#c4ebcf',
  'Trust Catalysts': '#f698a4',
  'Exploring New Frontiers': '#d0bade',
  'Dialogue Builders': '#f8b288'
};
const CAT_ORDER = Object.keys(CAT_COLORS);
const TIER_ORDER = ['Spotlight', 'High visibility', 'Noteworthy'];
const TIER_DOT = { 'Spotlight': 'var(--undpds-color-dark-red)', 'High visibility': 'var(--undpds-color-blue-600)', 'Noteworthy': 'var(--undpds-color-gray-400)' };
const ISO_NUM = { BR:'076', AR:'032', CO:'170', DE:'276', IN:'356', ES:'724', MX:'484',
  CL:'152', PE:'604', EC:'218', UA:'804', KE:'404', NL:'528', VN:'704', MW:'454',
  CF:'140', CD:'180', AO:'024', BJ:'204', YE:'887', LR:'430', US:'840', CA:'124',
  GB:'826', ID:'360', UG:'800', KH:'116', PA:'591', PY:'600', VE:'862' };

const STR = {
  en: {
    kpiCases: 'Cases in the repository', kpiCountries: 'Countries represented',
    kpiRegions: 'UNDP regions', kpiLangs: 'Submission languages',
    howTitle: 'How the cases are organised',
    howText: 'Every case belongs to one of five thematic categories and to one of three visibility levels, which determine how much detail the repository entry carries.',
    tierDefs: {
      'Spotlight': 'Selected for extended treatment: full narrative, signs of impact and supporting visual material.',
      'High visibility': 'Full entry: short description, long-form case text and links.',
      'Noteworthy': 'Brief entry: name, organisation, country and short description.'
    },
    spotEyebrow: 'Highest visibility level', spotTitle: 'Spotlighted cases',
    spotText: 'Twenty initiatives were carefully reviewed and selected as spotlighted cases, based on their unique approach to public communication. As innovative solutions of working with public institutions or of public institutions to communicate matters of public interest, these hope to inspire future action.',
    mapTitle: 'Cases by country', mapText: 'Select a country to filter the repository below.',
    mapLegend: 'Cases', mapNone: 'no cases', mapMost: 'Most represented',
    mapNote: 'Two records are not tied to a single country: one regional Asia-Pacific network and one Germany / United Kingdom initiative.',
    mapBrazilCallout: n => `Brazil · ${n} cases`,
    mapBrazilShare: (n, pct) => `${n} cases — ${pct}% of the repository. Shown separately so differences among the other countries stay visible.`,
    allTitle: 'All cases', showing: (a, b) => `Showing ${a} of ${b} cases`,
    searchLabel: 'Search', searchPh: 'Initiative, organisation, country or keyword',
    fRegion: 'Region', fCountry: 'Country', fType: 'Institution type', fCategory: 'Category',
    fTier: 'Visibility', fLang: 'Original language', fAll: 'All', clearAll: 'Clear all filters',
    activeFilters: 'Active filters:',
    disclaimer: 'Please note: initiative names, as well as the links, websites, social media accounts and supporting materials featured in each case, are presented in their original language and may not be available in English.',
    disclaimerShort: 'Links and materials for this case are in their original language.',
    read: 'Read the case', emptyTitle: 'No cases match these filters',
    emptyText: 'Try removing a filter or searching a different term.',
    country: 'Country', region: 'Region', visibility: 'Visibility level', origLang: 'Original language',
    description: 'Description', fullCase: 'Full case', linksTitle: 'Links & materials',
    noDetails: 'Noteworthy entries carry the short description only. No long-form text was submitted for this case.',
    descPending: 'Short description pending in the dataset.',
    thName: 'Initiative', thOrg: 'Organisation', thCountry: 'Country', thCat: 'Category',
    langNames: { Portuguese: 'Portuguese', Spanish: 'Spanish', English: 'English', French: 'French' },
    tierNames: { 'Spotlight': 'Spotlighted', 'High visibility': 'High visibility', 'Noteworthy': 'Noteworthy' },
    close: 'Close', esFallback: ''
  },
  es: {
    kpiCases: 'Casos en el repositorio', kpiCountries: 'Países representados',
    kpiRegions: 'Regiones PNUD', kpiLangs: 'Idiomas de postulación',
    howTitle: 'Cómo se organizan los casos',
    howText: 'Cada caso pertenece a una de cinco categorías temáticas y a uno de tres niveles de visibilidad, que determinan el nivel de detalle de su entrada en el repositorio.',
    tierDefs: {
      'Spotlight': 'Selección con tratamiento ampliado: narrativa completa, señales de impacto y material visual de apoyo.',
      'High visibility': 'Entrada completa: descripción corta, texto extenso del caso y enlaces.',
      'Noteworthy': 'Entrada breve: nombre, organización, país y descripción corta.'
    },
    spotEyebrow: 'Nivel más alto de visibilidad', spotTitle: 'Casos Spotlighted',
    spotText: 'Veinte iniciativas fueron cuidadosamente revisadas y seleccionadas como casos spotlighted por su enfoque único de la comunicación pública. Como soluciones innovadoras que trabajan con instituciones públicas —o desde ellas— para comunicar asuntos de interés público, buscan inspirar acciones futuras.',
    mapTitle: 'Casos por país', mapText: 'Selecciona un país para filtrar el repositorio.',
    mapLegend: 'Casos', mapNone: 'sin casos', mapMost: 'Más representados',
    mapNote: 'Dos registros no corresponden a un solo país: una red regional de Asia-Pacífico y una iniciativa Alemania / Reino Unido.',
    mapBrazilCallout: n => `Brasil · ${n} casos`,
    mapBrazilShare: (n, pct) => `${n} casos — ${pct}% del repositorio. Se muestra aparte para que las diferencias entre los demás países sigan siendo visibles.`,
    allTitle: 'Todos los casos', showing: (a, b) => `Mostrando ${a} de ${b} casos`,
    searchLabel: 'Buscar', searchPh: 'Iniciativa, organización, país o palabra clave',
    fRegion: 'Región', fCountry: 'País', fType: 'Tipo de institución', fCategory: 'Categoría',
    fTier: 'Visibilidad', fLang: 'Idioma original', fAll: 'Todos', clearAll: 'Limpiar filtros',
    activeFilters: 'Filtros activos:',
    disclaimer: 'Ten en cuenta: los nombres de las iniciativas, así como los enlaces, sitios web, redes sociales y materiales de apoyo de cada caso, se presentan en su idioma original y pueden no estar disponibles en inglés o español.',
    disclaimerShort: 'Los enlaces y materiales de este caso están en su idioma original.',
    read: 'Ver el caso', emptyTitle: 'Ningún caso coincide con estos filtros',
    emptyText: 'Prueba quitando un filtro o buscando otro término.',
    country: 'País', region: 'Región', visibility: 'Nivel de visibilidad', origLang: 'Idioma original',
    description: 'Descripción', fullCase: 'Caso completo', linksTitle: 'Enlaces y materiales',
    noDetails: 'Las entradas Noteworthy llevan solo la descripción corta. Este caso no envió texto extenso.',
    descPending: 'Descripción corta pendiente en el dataset.',
    thName: 'Iniciativa', thOrg: 'Organización', thCountry: 'País', thCat: 'Categoría',
    langNames: { Portuguese: 'Portugués', Spanish: 'Español', English: 'Inglés', French: 'Francés' },
    tierNames: { 'Spotlight': 'Spotlighted', 'High visibility': 'Alta visibilidad', 'Noteworthy': 'Noteworthy' },
    close: 'Cerrar', esFallback: '(texto disponible solo en inglés)'
  }
};

const I18N = createContext(null);
function useI18n() { return useContext(I18N); }

const FIXED_LANG = (() => {
  try {
    const r = document.getElementById('atlas-root');
    const d = r && r.getAttribute('data-lang');
    return (d === 'es' || d === 'en') ? d : null;
  } catch (e) { return null; }
})();

function trunc(s, n) {
  if (!s) return '';
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}
function useL() {
  const { lang } = useI18n();
  return (obj) => {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || '';
  };
}
function CatDot({ cat, size }) {
  if (!cat) return null;
  return <span aria-hidden="true" className="atlds-dot" style={{ background: CAT_COLORS[cat] || 'var(--undpds-color-gray-300)', width: size || 10, height: size || 10 }}></span>;
}

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="atlds-lang" role="group" aria-label="Language / Idioma">
      {['en', 'es'].map(l => (
        <button key={l} type="button" className={'chip' + (lang === l ? ' atlds-lang--on' : '')}
          aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function StatsBand({ cases }) {
  const { t } = useI18n();
  const countries = new Set(cases.map(c => c.country.en)
    .filter(n => n !== 'Regional — Asia & the Pacific' && n !== 'Germany / United Kingdom'));
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
    <section>
      <div className="atlds-logoband">
        <img src={logo} alt="UNDP · Catálise" />
      </div>
      <div className="atlds-stats">
        {kpis.map(([n, label]) => (
          <div key={label} className="stats-card atlds-stats__card">
            <h2>{n}</h2>
            <p>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryBand({ cases, filters, setF }) {
  const { t } = useI18n();
  return (
    <section>
      <h3 className="atlds-h">{t.howTitle}</h3>
      <p className="atlds-lead">{t.howText}</p>
      <div className="atlds-cats" role="group" aria-label={t.fCategory}>
        {CAT_ORDER.map(k => (
          <button key={k} type="button" onClick={() => setF('category', k)}
            className={'atlds-cat' + (filters.category === k ? ' is-active' : '')}
            aria-pressed={filters.category === k}>
            <span className="atlds-cat__bar" style={{ background: CAT_COLORS[k] }} aria-hidden="true"></span>
            <span className="atlds-cat__n">{cases.filter(c => c.category === k).length}</span>
            <span className="atlds-cat__label">{k}</span>
          </button>
        ))}
      </div>
      <ul className="atlds-tierdefs">
        {TIER_ORDER.map(tier => (
          <li key={tier}>
            <span className="atlds-dot" style={{ background: TIER_DOT[tier] }} aria-hidden="true"></span>
            <span><strong>{t.tierNames[tier]}</strong> — {t.tierDefs[tier]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpotCard({ c, openCase, mini }) {
  const { t } = useI18n();
  const L = useL();
  return (
    <div className="content-card atlds-card">
      <a role="button" tabIndex={0} aria-label={c.name}
        onClick={e => { e.preventDefault(); openCase(c); }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(c); } }}>
        {!mini && (c.image
          ? <div className="atlds-card__img"><img src={c.image} alt="" loading="lazy" /></div>
          : <div className="atlds-card__img atlds-card__img--brand"><span>{L(c.country)}</span></div>)}
        <div className="content-caption atlds-card__body">
          <p className="atlds-kicker">
            <CatDot cat={c.category} />{c.category ? c.category + ' · ' : ''}{L(c.country)}
          </p>
          <h5>{mini ? trunc(c.name, 62) : c.name}</h5>
          <p className="atlds-card__meta">{c.org}</p>
          {!mini && <p className="atlds-card__desc">{trunc(L(c.desc), 180) || t.descPending}</p>}
          <span className="cta__link cta--space">{t.read} →</span>
        </div>
      </a>
    </div>
  );
}

function SpotlightSection({ cases, openCase }) {
  const { t } = useI18n();
  const spot = cases.filter(c => c.tier === 'Spotlight');
  return (
    <section id="atlas-spotlight">
      <p className="atlds-eyebrow">{t.spotEyebrow}</p>
      <h3 className="atlds-h atlds-h--xl">{t.spotTitle}</h3>
      <p className="atlds-lead">{t.spotText}</p>
      <div className="grid-x grid-margin-x atlds-grid">
        {spot.map(c => (
          <div key={c.id} className="cell medium-6">
            <SpotCard c={c} openCase={openCase} />
          </div>
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
    const color = (n, iso) => iso === 'BR' ? 'var(--undpds-color-gray-700)'
      : n >= 6 ? 'var(--undpds-color-blue-600)' : n >= 3 ? 'var(--undpds-color-blue-400)'
      : n === 2 ? 'var(--undpds-color-blue-300)' : n === 1 ? 'var(--undpds-color-blue-200)' : 'var(--undpds-color-gray-200)';
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
    const brazil = world.features.find(d => String(d.id).padStart(3, '0') === '076');
    if (brazil && brazilLabel) {
      const [cx, cy] = path.centroid(brazil);
      const lx = cx + width * .12, ly = cy + height * .16;
      const g = svg.append('g').attr('cursor', 'pointer').on('click', () => onPick('BR'));
      g.append('line').attr('x1', cx + 8).attr('y1', cy + 8).attr('x2', lx - 4).attr('y2', ly - 9)
        .attr('stroke', 'var(--undpds-color-gray-700)').attr('stroke-width', 1.2);
      const label = g.append('g');
      const text = label.append('text')
        .attr('x', lx + 10).attr('y', ly + 4)
        .attr('font-family', 'var(--undpds-font-family-primary)').attr('font-size', 12)
        .attr('font-weight', 700).attr('fill', '#fff')
        .text(brazilLabel);
      const tw = text.node().getComputedTextLength ? text.node().getComputedTextLength() : brazilLabel.length * 6.6;
      label.insert('rect', 'text')
        .attr('x', lx).attr('y', ly - 11).attr('width', tw + 20).attr('height', 22)
        .attr('fill', 'var(--undpds-color-gray-700)');
      g.append('title').text(brazilLabel);
    }
  }, [counts, selected, brazilLabel]);
  return <div ref={ref} className="atlds-map" style={{ width: '100%' }}></div>;
}

function MapSection({ cases, filters, setF }) {
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
  const brazil = byCountry.find(r => r.iso === 'BR');
  const others = byCountry.filter(r => r.iso !== 'BR').slice(0, 8);
  const max = others.length ? others[0].n : 1;
  const brazilPct = brazil ? Math.round(brazil.n / cases.length * 100) : 0;
  const selIso = useMemo(() => {
    if (!filters.country) return '';
    const c = cases.find(x => x.country.en === filters.country);
    return c ? c.iso : '';
  }, [filters.country, cases]);
  const legend = [
    ['var(--undpds-color-blue-200)', '1'], ['var(--undpds-color-blue-300)', '2'],
    ['var(--undpds-color-blue-400)', '3–5'], ['var(--undpds-color-blue-600)', '6+'],
    ['var(--undpds-color-gray-700)', lang === 'es' ? 'Brasil' : 'Brazil'],
    ['var(--undpds-color-gray-200)', t.mapNone]
  ];
  return (
    <section id="atlas-map" className="atlds-dash">
      <div>
        <h3 className="atlds-h">{t.mapTitle}</h3>
        <p className="atlds-lead">{t.mapText}</p>
        <WorldMap counts={counts} selected={selIso}
          brazilLabel={brazil ? t.mapBrazilCallout(brazil.n) : ''}
          onPick={iso => {
            const c = cases.find(x => x.iso === iso);
            if (c) setF('country', c.country.en);
          }} />
        <ul className="atlds-legend" aria-label={t.mapLegend}>
          {legend.map(([col, label]) => (
            <li key={label}><span className="atlds-swatch" style={{ background: col }}></span>{label}</li>
          ))}
        </ul>
      </div>
      <div className="atlds-panel">
        <h4 className="atlds-eyebrow">{t.mapMost}</h4>
        {brazil && (
          <button type="button" className="atlds-brazil" onClick={() => setF('country', brazil.key)}>
            <span className="atlds-brazil__row"><strong>{L(brazil.obj)}</strong><span>{brazil.n}</span></span>
            <span className="atlds-brazil__note">{t.mapBrazilShare(brazil.n, brazilPct)}</span>
          </button>
        )}
        <ul className="atlds-ranking">
          {others.map(r => (
            <li key={r.key}>
              <button type="button" onClick={() => setF('country', r.key)}>
                <span className="atlds-ranking__row">
                  <span style={{ fontWeight: filters.country === r.key ? 700 : 400 }}>{L(r.obj)}</span>
                  <span>{r.n}</span>
                </span>
                <span className="atlds-ranking__track"><span style={{ width: Math.max(4, Math.round(r.n / max * 100)) + '%' }}></span></span>
              </button>
            </li>
          ))}
        </ul>
        <p className="atlds-note">{t.mapNote}</p>
      </div>
    </section>
  );
}

function Repository({ cases, results, filters, setF, q, setQ, clearAll, openCase, facetOptions }) {
  const { t } = useI18n();
  const L = useL();
  const groups = TIER_ORDER.map(tier => ({ tier, items: results.filter(c => c.tier === tier) }));
  const LBL = { region: t.fRegion, country: t.fCountry, type: t.fType, category: t.fCategory, tier: t.fTier, lang: t.fLang };
  const chips = [];
  Object.keys(LBL).forEach(k => {
    if (filters[k]) {
      const f = facetOptions.find(x => x.key === k);
      const o = f && f.options.find(o => o.value === filters[k]);
      chips.push({ key: k, label: `${LBL[k]}: ${o ? o.label : filters[k]}` });
    }
  });
  const hasFilters = chips.length > 0 || !!q;
  return (
    <section id="atlas-repository">
      <div className="atlds-allhead">
        <h3 className="atlds-h atlds-h--xl">{t.allTitle}</h3>
        <p className="atlds-count" aria-live="polite">{t.showing(results.length, cases.length)}</p>
      </div>

      <div className="atlds-filters">
        <div className="atlds-filters__search">
          <label htmlFor="atlds-q">{t.searchLabel}</label>
          <input id="atlds-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPh} />
        </div>
        {facetOptions.map(f => (
          <div key={f.key} className="atlds-filters__f">
            <label htmlFor={'atlds-f-' + f.key}>{LBL[f.key]}</label>
            <select id={'atlds-f-' + f.key} className="select-default" value={filters[f.key]}
              onChange={e => setF(f.key, e.target.value, true)}>
              <option value="">{t.fAll}</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label} ({o.count})</option>)}
            </select>
          </div>
        ))}
        {hasFilters && (
          <div className="atlds-active">
            <span className="atlds-active__label">{t.activeFilters}</span>
            {chips.map(ch => (
              <button key={ch.key} type="button" className="chip" onClick={() => setF(ch.key, filters[ch.key])}>
                {ch.label} ✕
              </button>
            ))}
            <button type="button" className="atlds-clear" onClick={clearAll}>{t.clearAll}</button>
          </div>
        )}
      </div>

      <p className="atlds-notice">{t.disclaimer}</p>

      {groups.map(g => g.items.length > 0 && (
        <div key={g.tier} className="atlds-line">
          <p className="atlds-line__count">
            <span className="atlds-dot" style={{ background: TIER_DOT[g.tier] }} aria-hidden="true"></span>
            {t.tierNames[g.tier]} · {g.items.length}
          </p>

          {g.tier === 'Spotlight' && (
            <div className="grid-x grid-margin-x atlds-grid">
              {g.items.map(c => (
                <div key={c.id} className="cell medium-3">
                  <SpotCard c={c} openCase={openCase} mini />
                </div>
              ))}
            </div>
          )}

          {g.tier === 'High visibility' && (
            <div className="grid-x grid-margin-x atlds-grid">
              {g.items.map(c => (
                <div key={c.id} className="cell medium-4">
                  <SpotCard c={c} openCase={openCase} />
                </div>
              ))}
            </div>
          )}

          {g.tier === 'Noteworthy' && (
            <div className="atlds-tablewrap">
              <table className="atlds-table">
                <thead>
                  <tr><th scope="col">{t.thName}</th><th scope="col">{t.thOrg}</th><th scope="col">{t.thCountry}</th><th scope="col">{t.thCat}</th></tr>
                </thead>
                <tbody>
                  {g.items.map(c => (
                    <tr key={c.id}>
                      <td><button type="button" className="atlds-rowbtn" onClick={() => openCase(c)}>{c.name}</button></td>
                      <td className="atlds-td-org">{c.org}</td>
                      <td>{L(c.country)}</td>
                      <td className="atlds-td-cat">{c.category ? <span><CatDot cat={c.category} size={9} /> {c.category}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {results.length === 0 && (
        <div className="atlds-empty">
          <h4>{t.emptyTitle}</h4>
          <p>{t.emptyText}</p>
          <button type="button" className="button button-secondary" onClick={clearAll}>{t.clearAll}</button>
        </div>
      )}
    </section>
  );
}

function CaseModal({ c, onClose }) {
  const { t, lang } = useI18n();
  const L = useL();
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    if (ref.current) ref.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus();
    };
  }, [onClose]);
  if (!c) return null;
  const desc = L(c.desc), details = L(c.details);
  const descFallback = lang === 'es' && c.desc && !c.desc.es && c.desc.en;
  const detFallback = lang === 'es' && c.details && !c.details.es && c.details.en;
  const urls = (c.links || []).filter(l => /^(https?:|www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(l))
    .map(l => ({ href: /^https?:/i.test(l) ? l : 'https://' + l.replace(/^\/+/, ''), label: l }));
  const handles = (c.links || []).filter(l => !/^(https?:|www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(l));
  const meta = [
    [t.country, L(c.country)], [t.region, L(c.region)],
    [t.visibility, t.tierNames[c.tier]], [t.origLang, t.langNames[c.lang] || c.lang]
  ];
  return (
    <div className="modal open atlds-modal" role="dialog" aria-modal="true" aria-label={c.name}>
      <div className="atlds-modal__backdrop" onClick={onClose}></div>
      <div className="modal-content atlds-modal__box" tabIndex={-1} ref={ref}>
        <div className="atlds-modal__head">
          <p className="atlds-eyebrow">
            <span className="atlds-dot" style={{ background: TIER_DOT[c.tier] }} aria-hidden="true"></span>
            {t.tierNames[c.tier]} · {c.no}
          </p>
          <button type="button" className="button button-secondary atlds-modal__close" onClick={onClose}>{t.close} ✕</button>
        </div>
        <p className="atlds-kicker"><CatDot cat={c.category} />{c.category ? c.category + ' · ' : ''}{L(c.type)}</p>
        <h2>{c.name}</h2>
        <p className="atlds-modal__org">{c.org}</p>
        {c.image && <img className="atlds-modal__img" src={c.image} alt="" />}
        <dl className="atlds-meta">
          {meta.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <h4 className="atlds-eyebrow">{t.description}</h4>
        {descFallback && <p className="atlds-fallback">{t.esFallback}</p>}
        <p>{desc || t.descPending}</p>
        {details ? (
          <div>
            <h4 className="atlds-eyebrow">{t.fullCase}</h4>
            {detFallback && <p className="atlds-fallback">{t.esFallback}</p>}
            <p className="atlds-prewrap">{details}</p>
          </div>
        ) : (
          c.tier === 'Noteworthy' && <p className="atlds-note">{t.noDetails}</p>
        )}
        {(urls.length > 0 || handles.length > 0) && (
          <div>
            <h4 className="atlds-eyebrow">{t.linksTitle}</h4>
            <ul className="atlds-links">
              {urls.map(u => (
                <li key={u.href}><a className="cta__link" href={u.href} target="_blank" rel="noopener noreferrer">{u.label} ↗</a></li>
              ))}
              {handles.map(h => <li key={h}>{h}</li>)}
            </ul>
            <p className="atlds-note">{t.disclaimerShort}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [lang, setLangState] = useState(() => {
    if (FIXED_LANG) return FIXED_LANG;
    try {
      const p = new URLSearchParams(location.search).get('lang');
      if (p === 'es' || p === 'en') return p;
      if (window.ATLAS_LANG === 'es' || window.ATLAS_LANG === 'en') return window.ATLAS_LANG;
      return localStorage.getItem('atlas-lang') || 'en';
    } catch (e) { return 'en'; }
  });
  const setLang = l => {
    if (FIXED_LANG) return;
    setLangState(l);
    try { localStorage.setItem('atlas-lang', l); } catch (e) {}
  };
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
  const [sel, setSel] = useState(() => {
    try {
      const id = new URLSearchParams(location.search).get('case');
      return id ? (cases.find(c => c.id === id) || null) : null;
    } catch (e) { return null; }
  });

  const setF = (key, val, fromSelect) => {
    setFilters(f => Object.assign({}, f, { [key]: (!fromSelect && f[key] === val) ? '' : val }));
    if (!fromSelect && (key === 'country' || key === 'category')) {
      const el = document.getElementById('atlas-repository');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };
  const clearAll = () => { setQ(''); setFilters({ region: '', country: '', type: '', category: '', tier: '', lang: '' }); };

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
      return { key, options };
    });
  }, [cases, filters, q, lang]);

  return (
    <I18N.Provider value={{ lang, setLang, t }}>
      <div className="atlds-wrap">
        {!FIXED_LANG && <LangSwitch />}
        <StatsBand cases={cases} />
        <CategoryBand cases={cases} filters={filters} setF={setF} />
        <SpotlightSection cases={cases} openCase={setSel} />
        <MapSection cases={cases} filters={filters} setF={setF} />
        <Repository cases={cases} results={results} filters={filters} setF={setF}
          q={q} setQ={setQ} clearAll={clearAll} openCase={setSel} facetOptions={facetOptions} />
        {sel && <CaseModal c={sel} onClose={() => setSel(null)} />}
      </div>
    </I18N.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('atlas-root')).render(<App />);
