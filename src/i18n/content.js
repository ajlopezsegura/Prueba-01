// ─── Content translation for demo unit data ───────────────────────────────
// The Las Conchas dataset lives in Supabase with Spanish-only fields for the
// per-unit copy (title, typology, orientation, short_description, highlights).
// Since the demo data is fixed and known, we translate it client-side via an
// exact-match dictionary applied only when the interface language is English.
// Anything not in the dictionary is returned untouched (safe fallback).

const ES_EN = {
  // ── Titles ──────────────────────────────────────────────
  '1A · 2 Dormitorios Sur':          '1A · 2 Bedrooms South',
  '1B · 3 Dormitorios Jardín':       '1B · 3 Bedrooms Garden',
  '1C · 2 Dormitorios Este':         '1C · 2 Bedrooms East',
  '2A · 2 Dormitorios Mar':          '2A · 2 Bedrooms Sea',
  '2B · 3 Dormitorios Jardín':       '2B · 3 Bedrooms Garden',
  '2C · 1 Dormitorio Oeste':         '2C · 1 Bedroom West',
  '3A · 3 Dormitorios Panorámico':   '3A · 3 Bedrooms Panoramic',
  '3B · 2 Dormitorios Mar':          '3B · 2 Bedrooms Sea',
  '3C · 4 Dormitorios Familiar':     '3C · 4 Bedrooms Family',
  '4A · 4 Dormitorios Premium':      '4A · 4 Bedrooms Premium',
  '4B · 3 Dormitorios Piscina':      '4B · 3 Bedrooms Pool',
  'Ático 1 · La joya del edificio':  'Penthouse 1 · The jewel of the building',

  // ── Typology ────────────────────────────────────────────
  '1 Dormitorio':  '1 Bedroom',
  '2 Dormitorios': '2 Bedrooms',
  '3 Dormitorios': '3 Bedrooms',
  '4 Dormitorios': '4 Bedrooms',
  'Ático':         'Penthouse',

  // ── Orientation ─────────────────────────────────────────
  'Sur':   'South',
  'Norte': 'North',
  'Este':  'East',
  'Oeste': 'West',

  // ── Short descriptions ──────────────────────────────────
  'Apartamento sur con terraza privada y vistas al Mediterráneo. Luminosidad natural todo el día.':
    'South-facing apartment with a private terrace and Mediterranean views. Natural light all day long.',
  'Amplio apartamento de 3 dormitorios con acceso directo al jardín privado y zona de día diferenciada.':
    'Spacious 3-bedroom apartment with direct access to the private garden and a distinct living area.',
  'Apartamento orientado al este con luminosidad natural en las mañanas y terraza con vistas a la piscina.':
    'East-facing apartment with natural morning light and a terrace overlooking the pool.',
  'Apartamento de 2 dormitorios con terraza sur y vistas directas al Mediterráneo desde la segunda planta.':
    '2-bedroom apartment with a south terrace and direct Mediterranean views from the second floor.',
  '3 dormitorios con zona de estar diferenciada, cocina independiente y acabados de primera calidad.':
    '3 bedrooms with a distinct living area, separate kitchen and premium finishes.',
  'Apartamento compacto de 1 dormitorio con terraza oeste y vistas a la piscina. Perfecto como inversión.':
    'Compact 1-bedroom apartment with a west terrace and pool views. Perfect as an investment.',
  'Unidad destacada. 3 dormitorios con gran terraza sur, vistas panorámicas al Mediterráneo y acabados premium.':
    'Featured unit. 3 bedrooms with a large south terrace, panoramic Mediterranean views and premium finishes.',
  '2 dormitorios con terraza sur, muy luminoso y tranquilo. Una de las mejores relaciones precio-calidad del edificio.':
    '2 bedrooms with a south terrace, bright and quiet. One of the best-value units in the building.',
  '4 dormitorios con gran terraza sur ideal para familias. Máxima amplitud y vistas directas al mar.':
    '4 bedrooms with a large south terrace, ideal for families. Maximum space and direct sea views.',
  '4 dormitorios con terraza de 30 m² y una de las mejores orientaciones del edificio. Vistas al mar desde todas las estancias principales.':
    '4 bedrooms with a 30 m² terrace and one of the best orientations in the building. Sea views from every main room.',
  '3 dormitorios con terraza este y espléndidas vistas a la piscina y los jardines desde la cuarta planta.':
    '3 bedrooms with an east terrace and splendid views of the pool and gardens from the fourth floor.',
  'Ático exclusivo con terraza de 70 m² y vistas panorámicas a 360º al Mediterráneo. La pieza más singular del edificio.':
    'Exclusive penthouse with a 70 m² terrace and 360° panoramic Mediterranean views. The most singular piece in the building.',

  // ── Highlights ──────────────────────────────────────────
  '2 baños completos':                    '2 full bathrooms',
  '3 baños completos':                    '3 full bathrooms',
  '3 dormitorios':                        '3 bedrooms',
  '3 dormitorios + 2 baños':              '3 bedrooms + 2 baths',
  '3 dormitorios amplios':                '3 spacious bedrooms',
  '4 dormitorios':                        '4 bedrooms',
  '4 dormitorios + 3 baños':              '4 bedrooms + 3 baths',
  '4 dormitorios + 4 baños':              '4 bedrooms + 4 baths',
  'Acabados de primera calidad':          'Premium finishes',
  'Acceso directo a jardines':            'Direct access to gardens',
  'Acceso directo al jardín':             'Direct garden access',
  'Cocina independiente':                 'Separate kitchen',
  'Doble garaje + trastero':              'Double garage + storage',
  'Excelente relación calidad-precio':    'Excellent value for money',
  'Garaje doble disponible':              'Double garage available',
  'Garaje y trastero incluidos':          'Garage and storage included',
  'Gran terraza 27 m²':                   'Large 27 m² terrace',
  'Gran terraza sur 20 m²':               'Large 20 m² south terrace',
  'Luz matinal natural':                  'Natural morning light',
  'Muy luminoso':                         'Very bright',
  'Orientación sur':                      'South-facing',
  'Planta 4':                             '4th floor',
  'Planta alta':                          'High floor',
  'Plaza de garaje incluida':             'Garage space included',
  'Terraza 13 m²':                        '13 m² terrace',
  'Terraza este 21 m²':                   '21 m² east terrace',
  'Terraza panorámica 70 m²':             '70 m² panoramic terrace',
  'Terraza privada 16 m²':                '16 m² private terrace',
  'Terraza privada 8 m²':                 '8 m² private terrace',
  'Terraza sur 17 m²':                    '17 m² south terrace',
  'Terraza sur 30 m²':                    '30 m² south terrace',
  'Trastero incluido':                    'Storage included',
  'Vistas 360° al Mediterráneo':          '360° Mediterranean views',
  'Vistas a la piscina':                  'Pool views',
  'Vistas a piscina y jardines':          'Pool and garden views',
  'Vistas al Mediterráneo':               'Mediterranean views',
  'Vistas al jardín':                     'Garden views',
  'Vistas al mar desde terraza':          'Sea views from the terrace',
  'Vistas al mar en todas las estancias': 'Sea views from every room',
  'Vistas panorámicas al mar':            'Panoramic sea views',
  'Zona de día amplia':                   'Spacious living area',
}

/**
 * Translate a piece of demo content to the active language.
 * Only translates when lang === 'en' and an exact match exists;
 * otherwise returns the input untouched.
 */
export function tc(text, lang) {
  if (lang !== 'en' || text == null) return text
  return ES_EN[text] ?? text
}
