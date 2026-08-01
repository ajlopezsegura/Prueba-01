-- ============================================================
-- TVBS App — Supabase Schema + Seed Data
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  name_en      TEXT,
  subtitle     TEXT,
  architect    TEXT,
  description  TEXT,
  description_en TEXT,
  hero_video   TEXT,
  hero_image   TEXT,
  aerial_image TEXT,
  accent_color TEXT DEFAULT '#B89848',
  gallery      JSONB DEFAULT '[]',
  building_data JSONB DEFAULT '{}',
  amenities    JSONB DEFAULT '[]',
  materials    JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  pk               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_slug     TEXT NOT NULL REFERENCES projects(slug) ON DELETE CASCADE,
  id               TEXT NOT NULL,
  slug             TEXT NOT NULL,
  name             TEXT NOT NULL,
  title            TEXT,
  status           TEXT DEFAULT 'available' CHECK (status IN ('available','reserved','sold')),
  price            INTEGER,
  currency         TEXT DEFAULT 'EUR',
  bedrooms         INTEGER,
  bathrooms        INTEGER,
  surface          INTEGER,
  built_area_m2    INTEGER,
  interior_area_m2 INTEGER,
  terrace_area_m2  INTEGER DEFAULT 0,
  floor            TEXT,
  orientation      TEXT,
  typology         TEXT,
  block            TEXT,
  has_terrace      BOOLEAN DEFAULT FALSE,
  featured         BOOLEAN DEFAULT FALSE,
  parking_included BOOLEAN DEFAULT FALSE,
  storage_included BOOLEAN DEFAULT FALSE,
  view_label       TEXT,
  short_description TEXT,
  highlights       JSONB DEFAULT '[]',
  hero_image       TEXT,
  thumbnail        TEXT,
  plan_image       TEXT,
  gallery_images   JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (id, project_slug),
  UNIQUE (slug, project_slug)
);

CREATE TABLE IF NOT EXISTS leads (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_slug     TEXT REFERENCES projects(slug),
  timestamp        TIMESTAMPTZ DEFAULT NOW(),
  source_page      TEXT,
  intent           TEXT,
  unit_ids         JSONB DEFAULT '[]',
  primary_unit_id  TEXT,
  unit_snapshot    JSONB DEFAULT '[]',
  contact          JSONB DEFAULT '{}',
  session_trail    JSONB DEFAULT '[]',
  lead_score       INTEGER DEFAULT 0,
  lead_temperature TEXT DEFAULT 'cold',
  status           TEXT DEFAULT 'new',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_units_updated_at ON units;
CREATE TRIGGER trigger_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────

-- ── Tabla de sesiones anónimas ────────────────────────────────

CREATE TABLE IF NOT EXISTS page_sessions (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id    TEXT UNIQUE NOT NULL,
  visitor_id    TEXT,
  visit_number  INTEGER DEFAULT 1,
  referrer      TEXT DEFAULT 'directo',
  user_lang     TEXT,
  screen_size   TEXT,
  project_slug  TEXT,
  trail         JSONB DEFAULT '[]',
  pages_count   INTEGER DEFAULT 0,
  converted     BOOLEAN DEFAULT FALSE,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE units         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_public_select"  ON projects;
DROP POLICY IF EXISTS "projects_auth_update"    ON projects;
DROP POLICY IF EXISTS "units_public_select"     ON units;
DROP POLICY IF EXISTS "units_auth_update"       ON units;
DROP POLICY IF EXISTS "admin_update_units"      ON units;
DROP POLICY IF EXISTS "leads_public_insert"     ON leads;
DROP POLICY IF EXISTS "leads_auth_select"       ON leads;
DROP POLICY IF EXISTS "leads_auth_update"       ON leads;
DROP POLICY IF EXISTS "admin_select_leads"      ON leads;
DROP POLICY IF EXISTS "sessions_public_all"     ON page_sessions;

-- La app puede leer proyectos y unidades sin autenticación
CREATE POLICY "projects_public_select" ON projects FOR SELECT USING (true);
CREATE POLICY "units_public_select"    ON units    FOR SELECT USING (true);

-- El panel admin (clave pública) puede actualizar estados de unidades
CREATE POLICY "admin_update_units" ON units
  FOR UPDATE USING (true)
  WITH CHECK (status IN ('available', 'reserved', 'sold'));

-- Cualquiera puede enviar un lead (formulario de contacto)
CREATE POLICY "leads_public_insert" ON leads FOR INSERT WITH CHECK (true);

-- El panel admin (clave pública) puede leer leads
CREATE POLICY "admin_select_leads" ON leads FOR SELECT USING (true);

-- Sesiones anónimas: lectura y escritura pública (solo analytics)
CREATE POLICY "sessions_public_all" ON page_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- ── Seed: Proyecto ────────────────────────────────────────────

INSERT INTO projects (slug, name, name_en, subtitle, architect, description, description_en, hero_video, hero_image, aerial_image, accent_color, gallery, building_data, amenities, materials)
VALUES (
  'las-conchas',
  'Las Conchas',
  'Las Conchas',
  'Marbella — 2025',
  'The Visuals Boutique',
  'Una residencia frente al mar donde la luz mediterránea, los materiales nobles y el sonido del océano definen cada momento del día.',
  'A seafront residence where Mediterranean light, noble materials and the sound of the ocean define every moment of the day.',
  './assets/videos/Hero.mp4',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=90',
  './assets/images/las-conchas-aerea.webp',
  '#B89848',
  '["./assets/images/las-conchas-aerea.webp","./assets/images/salon/salon-day.webp","./assets/images/salon/salon-day-02.webp","./assets/images/salon/salon-day-03.webp","./assets/images/salon/salon-day-04.webp","./assets/images/salon/salon-day-05.webp","./assets/images/cocina/cocina-day-02.webp","./assets/images/cocina/cocina-day.webp","./assets/images/cocina/cocina-day-03.webp","./assets/images/dormitorio/dormitorio-day.webp","./assets/images/dormitorio/dormitorio-night-02.webp","./assets/images/dormitorio/dormitorio-day-02.webp","./assets/images/bano/bano-day-02.webp","./assets/images/bano/bano-day.webp","./assets/images/bano/bano-day-03.webp","./assets/images/piscina-01.webp","./assets/images/piscina-02.webp","./assets/images/piscina-03.webp","./assets/images/terraza/terraza-day-02.webp","./assets/images/terraza/terraza-day.webp"]'::jsonb,
  '{"totalUnits":24,"typologies":["1D","2D","3D","4D","Ático"],"surfaceRange":"65 – 320 m²","priceRange":"350.000 – 1.200.000 €","location":"Marbella, España","completion":"Q4 2026"}'::jsonb,
  '[{"id":"pool","icon":"Waves","label":"Piscina","labelEN":"Pool","description":"Piscina infinity con vistas al mar Mediterráneo. Zona de hamacas y servicio de pool bar en temporada.","descriptionEN":"Infinity pool with views of the Mediterranean Sea. Sun lounger area and pool bar service in season.","images":["./assets/images/piscina-01.webp","./assets/images/piscina-02.webp","./assets/images/piscina-03.webp"]},{"id":"gym","icon":"Dumbbell","label":"Gimnasio","labelEN":"Gym","description":"Gimnasio completamente equipado con máquinas de última generación, zona de pesas libres y sala de estiramiento.","descriptionEN":"Fully equipped gym with state-of-the-art machines, free weights area and stretching room.","images":["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"]},{"id":"garden","icon":"TreePine","label":"Jardines","labelEN":"Gardens","description":"Jardines mediterráneos diseñados con especies autóctonas y zonas de descanso privadas.","descriptionEN":"Mediterranean gardens designed with native species and private rest areas.","images":["./assets/images/terraza/terraza-day-02.webp","./assets/images/terraza/terraza-day.webp"]},{"id":"parking","icon":"Car","label":"Parking","labelEN":"Parking","description":"Plaza de garaje incluida con cada vivienda. Puntos de recarga para vehículo eléctrico disponibles.","descriptionEN":"Garage space included with each home. Electric vehicle charging points available.","images":["https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=800&q=80"]},{"id":"security","icon":"ShieldCheck","label":"Seguridad 24h","labelEN":"24h Security","description":"Seguridad perimetral con vigilancia 24 horas, acceso por videoportero y control de accesos biométrico.","descriptionEN":"Perimeter security with 24-hour surveillance, video intercom and biometric access control.","images":["https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80"]},{"id":"spa","icon":"Sparkles","label":"Spa & Wellness","labelEN":"Spa & Wellness","description":"Circuito de aguas termal, sauna finlandesa, hammam y sala de tratamientos exclusiva para residentes.","descriptionEN":"Thermal water circuit, Finnish sauna, hammam and treatment rooms for residents.","images":["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"]}]'::jsonb,
  '{"floor":[{"id":"roble","label":"Roble Natural","labelEN":"Natural Oak","swatch":"#C8A07A"},{"id":"caliza","label":"Caliza Natural","labelEN":"Natural Limestone","swatch":"#E8E0D0"},{"id":"microcemento","label":"Microcemento","labelEN":"Microcement","swatch":"#9A9690"}],"walls":[{"id":"blanco","label":"Blanco Roto","labelEN":"Off White","swatch":"#F2EEE8"},{"id":"caliza_p","label":"Caliza Pintada","labelEN":"Painted Limestone","swatch":"#D8CFC0"},{"id":"grafito","label":"Grafito","labelEN":"Graphite","swatch":"#4A4A4A"}],"kitchen":[{"id":"marquina","label":"Mármol Marquina","labelEN":"Marquina Marble","swatch":"#2A2520"},{"id":"bianco","label":"Mármol Bianco","labelEN":"Bianco Marble","swatch":"#F0EDE8"},{"id":"laton","label":"Latón Mate","labelEN":"Matte Brass","swatch":"#B89848"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: Unidades ────────────────────────────────────────────

INSERT INTO units (project_slug, id, slug, name, title, status, price, currency, bedrooms, bathrooms, surface, built_area_m2, interior_area_m2, terrace_area_m2, floor, orientation, typology, block, has_terrace, featured, parking_included, storage_included, view_label, short_description, highlights, hero_image, thumbnail, plan_image, gallery_images)
VALUES
('las-conchas','1A','1a','1A','1A · 2 Dormitorios Sur','sold',420000,'EUR',2,2,98,98,82,16,'1','Sur','2 Dormitorios','A',true,false,true,true,'Sea View','Apartamento sur con terraza privada y vistas al Mediterráneo. Luminosidad natural todo el día.','["Orientación sur","Terraza privada 16 m²","Vistas al Mediterráneo","Plaza de garaje incluida"]'::jsonb,'./assets/images/salon/salon-day.webp','./assets/images/salon/salon-day.webp',null,'["./assets/images/salon/salon-day.webp","./assets/images/dormitorio/dormitorio-day.webp","./assets/images/bano/bano-day-02.webp","./assets/images/terraza/terraza-day-02.webp"]'::jsonb),

('las-conchas','1B','1b','1B','1B · 3 Dormitorios Jardín','reserved',495000,'EUR',3,2,120,120,102,0,'1','Norte','3 Dormitorios','B',false,false,true,false,'Garden View','Amplio apartamento de 3 dormitorios con acceso directo al jardín privado y zona de día diferenciada.','["3 dormitorios","Acceso directo al jardín","Zona de día amplia","Acabados de primera calidad"]'::jsonb,'./assets/images/dormitorio/dormitorio-day.webp','./assets/images/dormitorio/dormitorio-day.webp',null,'["./assets/images/salon/salon-day-02.webp","./assets/images/dormitorio/dormitorio-night-02.webp","./assets/images/cocina/cocina-day-02.webp","./assets/images/bano/bano-day.webp"]'::jsonb),

('las-conchas','1C','1c','1C','1C · 2 Dormitorios Este','available',365000,'EUR',2,1,85,85,72,13,'1','Este','2 Dormitorios','C',true,false,true,false,'Pool View','Apartamento orientado al este con luminosidad natural en las mañanas y terraza con vistas a la piscina.','["Terraza 13 m²","Vistas a la piscina","Luz matinal natural","Acceso directo a jardines"]'::jsonb,'./assets/images/salon/salon-day-03.webp','./assets/images/salon/salon-day-03.webp',null,'["./assets/images/salon/salon-day-03.webp","./assets/images/cocina/cocina-day.webp","./assets/images/terraza/terraza-day-02.webp","./assets/images/piscina-01.webp"]'::jsonb),

('las-conchas','2A','2a','2A','2A · 2 Dormitorios Mar','available',440000,'EUR',2,2,100,100,84,16,'2','Sur','2 Dormitorios','A',true,false,true,true,'Sea View','Apartamento de 2 dormitorios con terraza sur y vistas directas al Mediterráneo desde la segunda planta.','["Vistas al mar desde terraza","Orientación sur","2 baños completos","Plaza de garaje incluida"]'::jsonb,'./assets/images/salon/salon-day-04.webp','./assets/images/cocina/cocina-day-02.webp',null,'["./assets/images/salon/salon-day-04.webp","./assets/images/cocina/cocina-day-02.webp","./assets/images/piscina-02.webp","./assets/images/terraza/terraza-day.webp"]'::jsonb),

('las-conchas','2B','2b','2B','2B · 3 Dormitorios Jardín','available',510000,'EUR',3,2,125,125,106,19,'2','Norte','3 Dormitorios','B',false,false,true,true,'Garden View','3 dormitorios con zona de estar diferenciada, cocina independiente y acabados de primera calidad.','["3 dormitorios amplios","Cocina independiente","Vistas al jardín","Trastero incluido"]'::jsonb,'./assets/images/salon/salon-day-05.webp','./assets/images/salon/salon-day-04.webp',null,'["./assets/images/salon/salon-day-05.webp","./assets/images/dormitorio/dormitorio-day-02.webp","./assets/images/bano/bano-day.webp","./assets/images/cocina/cocina-day-03.webp"]'::jsonb),

('las-conchas','2C','2c','2C','2C · 1 Dormitorio Oeste','sold',295000,'EUR',1,1,68,68,60,8,'2','Oeste','1 Dormitorio','C',true,false,true,false,'Pool View','Apartamento compacto de 1 dormitorio con terraza oeste y vistas a la piscina. Perfecto como inversión.','["Terraza privada 8 m²","Vistas a la piscina","Planta alta","Excelente relación calidad-precio"]'::jsonb,'./assets/images/dormitorio/dormitorio-night-02.webp','./assets/images/dormitorio/dormitorio-night-02.webp',null,'["./assets/images/salon/salon-day-02.webp","./assets/images/dormitorio/dormitorio-night-02.webp","./assets/images/bano/bano-day-03.webp"]'::jsonb),

('las-conchas','3A','3a','3A','3A · 3 Dormitorios Panorámico','available',560000,'EUR',3,2,130,130,110,20,'3','Sur','3 Dormitorios','A',true,true,true,true,'Sea View','Unidad destacada. 3 dormitorios con gran terraza sur, vistas panorámicas al Mediterráneo y acabados premium.','["Gran terraza sur 20 m²","Vistas panorámicas al mar","3 dormitorios + 2 baños","Garaje y trastero incluidos"]'::jsonb,'./assets/images/salon/salon-day-05.webp','./assets/images/salon/salon-day-05.webp',null,'["./assets/images/salon/salon-day.webp","./assets/images/salon/salon-day-03.webp","./assets/images/terraza/terraza-day-02.webp","./assets/images/piscina-02.webp","./assets/images/cocina/cocina-day-02.webp"]'::jsonb),

('las-conchas','3B','3b','3B','3B · 2 Dormitorios Mar','available',475000,'EUR',2,2,105,105,88,17,'3','Sur','2 Dormitorios','B',true,false,true,false,'Sea View','2 dormitorios con terraza sur, muy luminoso y tranquilo. Una de las mejores relaciones precio-calidad del edificio.','["Terraza sur 17 m²","Vistas al Mediterráneo","Planta alta","Muy luminoso"]'::jsonb,'./assets/images/terraza/terraza-day-02.webp','./assets/images/terraza/terraza-day-02.webp',null,'["./assets/images/salon/salon-day-04.webp","./assets/images/terraza/terraza-day.webp","./assets/images/piscina-01.webp","./assets/images/dormitorio/dormitorio-day.webp"]'::jsonb),

('las-conchas','3C','3c','3C','3C · 4 Dormitorios Familiar','reserved',720000,'EUR',4,3,165,165,138,27,'3','Sur','4 Dormitorios','C',true,false,true,true,'Sea View','4 dormitorios con gran terraza sur ideal para familias. Máxima amplitud y vistas directas al mar.','["4 dormitorios","Gran terraza 27 m²","3 baños completos","Garaje y trastero incluidos"]'::jsonb,'./assets/images/dormitorio/dormitorio-day-02.webp','./assets/images/dormitorio/dormitorio-day-02.webp',null,'["./assets/images/salon/salon-day-05.webp","./assets/images/dormitorio/dormitorio-day.webp","./assets/images/dormitorio/dormitorio-night-02.webp","./assets/images/cocina/cocina-day.webp","./assets/images/terraza/terraza-day.webp"]'::jsonb),

('las-conchas','4A','4a','4A','4A · 4 Dormitorios Premium','available',810000,'EUR',4,3,180,180,150,30,'4','Sur','4 Dormitorios','A',true,true,true,true,'Sea View','4 dormitorios con terraza de 30 m² y una de las mejores orientaciones del edificio. Vistas al mar desde todas las estancias principales.','["Terraza sur 30 m²","Vistas al mar en todas las estancias","4 dormitorios + 3 baños","Garaje doble disponible"]'::jsonb,'./assets/images/terraza/terraza-day.webp','./assets/images/terraza/terraza-day.webp',null,'["./assets/images/salon/salon-day.webp","./assets/images/salon/salon-day-03.webp","./assets/images/cocina/cocina-day-03.webp","./assets/images/terraza/terraza-day-02.webp","./assets/images/piscina-03.webp"]'::jsonb),

('las-conchas','4B','4b','4B','4B · 3 Dormitorios Piscina','available',590000,'EUR',3,2,135,135,114,21,'4','Este','3 Dormitorios','B',true,false,true,true,'Pool View','3 dormitorios con terraza este y espléndidas vistas a la piscina y los jardines desde la cuarta planta.','["Terraza este 21 m²","Vistas a piscina y jardines","Planta 4","Trastero incluido"]'::jsonb,'./assets/images/cocina/cocina-day.webp','./assets/images/cocina/cocina-day.webp',null,'["./assets/images/salon/salon-day-03.webp","./assets/images/cocina/cocina-day-03.webp","./assets/images/piscina-01.webp","./assets/images/bano/bano-day-02.webp","./assets/images/terraza/terraza-day.webp"]'::jsonb),

('las-conchas','AT1','at1','ÁTICO 1','Ático 1 · La joya del edificio','available',1150000,'EUR',4,4,280,280,210,70,'5','Sur','Ático','A',true,true,true,true,'Panoramic View','Ático exclusivo con terraza de 70 m² y vistas panorámicas a 360º al Mediterráneo. La pieza más singular del edificio.','["Terraza panorámica 70 m²","Vistas 360° al Mediterráneo","4 dormitorios + 4 baños","Doble garaje + trastero"]'::jsonb,'./assets/images/salon/salon-day-05.webp','./assets/images/salon/salon-day-05.webp',null,'["./assets/images/salon/salon-day-04.webp","./assets/images/salon/salon-day-05.webp","./assets/images/terraza/terraza-day-02.webp","./assets/images/terraza/terraza-day.webp","./assets/images/piscina-01.webp","./assets/images/piscina-02.webp"]'::jsonb)

ON CONFLICT (id, project_slug) DO NOTHING;
