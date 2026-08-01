-- Migrate image paths after rename + WebP conversion + new floor plans.
-- Run once in Supabase SQL Editor. Idempotent: re-running has no effect once paths are migrated.
--
-- Covers:
--  * Room imagery rename: "Salon 01.webp" → "salon/salon-day.webp", etc.
--  * Folder restructure: root → /salon, /cocina, /bano, /dormitorio, /terraza
--  * WebP conversion: every .png/.jpg → .webp (90% lighter)
--  * Root imagery: Piscina, Phamtome, fantasy-brown, keena, las-conchas-aerea
--  * Floor plans: ./assets/floorplan.svg →
--      plano-vivienda.webp (units.plan_image)
--      plano-edificio.webp (projects.building_data floorPlan.src)

CREATE OR REPLACE FUNCTION pg_temp.migrate_image_paths(input TEXT) RETURNS TEXT AS $$
DECLARE
  r TEXT := input;
BEGIN
  IF r IS NULL THEN RETURN NULL; END IF;

  -- ─── Salon (every legacy path → .webp) ────────────────────────────────────
  r := REPLACE(r, './assets/images/Salon 01.webp',         './assets/images/salon/salon-day.webp');
  r := REPLACE(r, './assets/images/salon/Salon 01.webp',   './assets/images/salon/salon-day.webp');
  r := REPLACE(r, './assets/images/Salon 01.png',          './assets/images/salon/salon-day.webp');
  r := REPLACE(r, './assets/images/salon/Salon 01.png',    './assets/images/salon/salon-day.webp');
  r := REPLACE(r, './assets/images/salon/salon-day.png',   './assets/images/salon/salon-day.webp');
  r := REPLACE(r, './assets/images/Salon noche.png',       './assets/images/salon/salon-night.webp');
  r := REPLACE(r, './assets/images/salon/Salon noche.png', './assets/images/salon/salon-night.webp');
  r := REPLACE(r, './assets/images/salon/salon-night.png', './assets/images/salon/salon-night.webp');
  r := REPLACE(r, './assets/images/salon 02.webp',         './assets/images/salon/salon-day-02.webp');
  r := REPLACE(r, './assets/images/salon/salon 02.webp',   './assets/images/salon/salon-day-02.webp');
  r := REPLACE(r, './assets/images/Salon 03.jpg',          './assets/images/salon/salon-day-03.webp');
  r := REPLACE(r, './assets/images/salon/Salon 03.jpg',    './assets/images/salon/salon-day-03.webp');
  r := REPLACE(r, './assets/images/salon/salon-day-03.jpg', './assets/images/salon/salon-day-03.webp');
  r := REPLACE(r, './assets/images/Salon 04.jpg',          './assets/images/salon/salon-day-04.webp');
  r := REPLACE(r, './assets/images/salon/Salon 04.jpg',    './assets/images/salon/salon-day-04.webp');
  r := REPLACE(r, './assets/images/salon/salon-day-04.jpg', './assets/images/salon/salon-day-04.webp');
  r := REPLACE(r, './assets/images/Salon 05.jpg',          './assets/images/salon/salon-day-05.webp');
  r := REPLACE(r, './assets/images/salon/Salon 05.jpg',    './assets/images/salon/salon-day-05.webp');
  r := REPLACE(r, './assets/images/salon/salon-day-05.jpg', './assets/images/salon/salon-day-05.webp');

  -- ─── Cocina ───────────────────────────────────────────────────────────────
  r := REPLACE(r, './assets/images/Cocina (1).jpg',          './assets/images/cocina/cocina-day-02.webp');
  r := REPLACE(r, './assets/images/cocina/Cocina (1).jpg',   './assets/images/cocina/cocina-day-02.webp');
  r := REPLACE(r, './assets/images/cocina/cocina-day-02.jpg', './assets/images/cocina/cocina-day-02.webp');
  r := REPLACE(r, './assets/images/Cocina (2).jpg',          './assets/images/cocina/cocina-day.webp');
  r := REPLACE(r, './assets/images/cocina/Cocina (2).jpg',   './assets/images/cocina/cocina-day.webp');
  r := REPLACE(r, './assets/images/cocina/cocina-day.jpg',   './assets/images/cocina/cocina-day.webp');
  r := REPLACE(r, './assets/images/Cocina (3).jpg',          './assets/images/cocina/cocina-day-03.webp');
  r := REPLACE(r, './assets/images/cocina/Cocina (3).jpg',   './assets/images/cocina/cocina-day-03.webp');
  r := REPLACE(r, './assets/images/cocina/cocina-day-03.jpg', './assets/images/cocina/cocina-day-03.webp');
  r := REPLACE(r, './assets/images/cocina noche.png',        './assets/images/cocina/cocina-night.webp');
  r := REPLACE(r, './assets/images/cocina/cocina noche.png', './assets/images/cocina/cocina-night.webp');
  r := REPLACE(r, './assets/images/cocina/cocina-night.png', './assets/images/cocina/cocina-night.webp');

  -- ─── Baño ─────────────────────────────────────────────────────────────────
  r := REPLACE(r, './assets/images/Baño (1).jpg',         './assets/images/bano/bano-day-02.webp');
  r := REPLACE(r, './assets/images/bano/Baño (1).jpg',    './assets/images/bano/bano-day-02.webp');
  r := REPLACE(r, './assets/images/bano/bano-day-02.jpg', './assets/images/bano/bano-day-02.webp');
  r := REPLACE(r, './assets/images/Baño (2).jpg',         './assets/images/bano/bano-day.webp');
  r := REPLACE(r, './assets/images/bano/Baño (2).jpg',    './assets/images/bano/bano-day.webp');
  r := REPLACE(r, './assets/images/bano/bano-day.jpg',    './assets/images/bano/bano-day.webp');
  r := REPLACE(r, './assets/images/Baño (3).jpg',         './assets/images/bano/bano-day-03.webp');
  r := REPLACE(r, './assets/images/bano/Baño (3).jpg',    './assets/images/bano/bano-day-03.webp');
  r := REPLACE(r, './assets/images/bano/bano-day-03.jpg', './assets/images/bano/bano-day-03.webp');
  r := REPLACE(r, './assets/images/baño noche.png',       './assets/images/bano/bano-night.webp');
  r := REPLACE(r, './assets/images/bano/baño noche.png',  './assets/images/bano/bano-night.webp');
  r := REPLACE(r, './assets/images/bano/bano-night.png',  './assets/images/bano/bano-night.webp');

  -- ─── Dormitorio ──────────────────────────────────────────────────────────
  r := REPLACE(r, './assets/images/Dormitorio (1).jpg',             './assets/images/dormitorio/dormitorio-day.webp');
  r := REPLACE(r, './assets/images/dormitorio/Dormitorio (1).jpg',  './assets/images/dormitorio/dormitorio-day.webp');
  r := REPLACE(r, './assets/images/dormitorio/dormitorio-day.jpg',  './assets/images/dormitorio/dormitorio-day.webp');
  r := REPLACE(r, './assets/images/Dormitorio (2).jpg',             './assets/images/dormitorio/dormitorio-night-02.webp');
  r := REPLACE(r, './assets/images/dormitorio/Dormitorio (2).jpg',  './assets/images/dormitorio/dormitorio-night-02.webp');
  r := REPLACE(r, './assets/images/dormitorio/dormitorio-night-02.jpg', './assets/images/dormitorio/dormitorio-night-02.webp');
  r := REPLACE(r, './assets/images/Dormitorio (3).jpg',             './assets/images/dormitorio/dormitorio-day-02.webp');
  r := REPLACE(r, './assets/images/dormitorio/Dormitorio (3).jpg',  './assets/images/dormitorio/dormitorio-day-02.webp');
  r := REPLACE(r, './assets/images/dormitorio/dormitorio-day-02.jpg', './assets/images/dormitorio/dormitorio-day-02.webp');
  r := REPLACE(r, './assets/images/Dormitorio noche.png',           './assets/images/dormitorio/dormitorio-night.webp');
  r := REPLACE(r, './assets/images/dormitorio/Dormitorio noche.png', './assets/images/dormitorio/dormitorio-night.webp');
  r := REPLACE(r, './assets/images/dormitorio/dormitorio-night.png', './assets/images/dormitorio/dormitorio-night.webp');

  -- ─── Terraza ──────────────────────────────────────────────────────────────
  r := REPLACE(r, './assets/images/Terraza (1).jpg',             './assets/images/terraza/terraza-day-02.webp');
  r := REPLACE(r, './assets/images/terraza/Terraza (1).jpg',     './assets/images/terraza/terraza-day-02.webp');
  r := REPLACE(r, './assets/images/terraza/terraza-day-02.jpg',  './assets/images/terraza/terraza-day-02.webp');
  r := REPLACE(r, './assets/images/Terraza (2).jpg',             './assets/images/terraza/terraza-day.webp');
  r := REPLACE(r, './assets/images/terraza/Terraza (2).jpg',     './assets/images/terraza/terraza-day.webp');
  r := REPLACE(r, './assets/images/terraza/terraza-day.jpg',     './assets/images/terraza/terraza-day.webp');
  r := REPLACE(r, './assets/images/Terraza noche.png',           './assets/images/terraza/terraza-night.webp');
  r := REPLACE(r, './assets/images/terraza/Terraza noche.png',   './assets/images/terraza/terraza-night.webp');
  r := REPLACE(r, './assets/images/terraza/terraza-night.png',   './assets/images/terraza/terraza-night.webp');

  -- ─── Root imagery ────────────────────────────────────────────────────────
  r := REPLACE(r, './assets/images/Piscina (1).jpg',          './assets/images/piscina-01.webp');
  r := REPLACE(r, './assets/images/Piscina (2).jpg',          './assets/images/piscina-02.webp');
  r := REPLACE(r, './assets/images/Piscina (3).jpg',          './assets/images/piscina-03.webp');
  r := REPLACE(r, './assets/images/Phamtome-day.jpg',         './assets/images/phamtome-day.webp');
  r := REPLACE(r, './assets/images/Phamtome-night.jpg',       './assets/images/phamtome-night.webp');
  r := REPLACE(r, './assets/images/fantasy-brown-day.jpg',    './assets/images/fantasy-brown-day.webp');
  r := REPLACE(r, './assets/images/fantasy-brown-night.jpg',  './assets/images/fantasy-brown-night.webp');
  r := REPLACE(r, './assets/images/keena-day.jpg',            './assets/images/keena-day.webp');
  r := REPLACE(r, './assets/images/keena-night.jpg',          './assets/images/keena-night.webp');
  r := REPLACE(r, './assets/images/las-conchas-aerea.jpg',    './assets/images/las-conchas-aerea.webp');

  RETURN r;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Update projects (building plan in building_data, generic everywhere else) ───
UPDATE projects SET
  aerial_image  = pg_temp.migrate_image_paths(aerial_image),
  hero_image    = pg_temp.migrate_image_paths(hero_image),
  gallery       = pg_temp.migrate_image_paths(gallery::text)::jsonb,
  nearby        = pg_temp.migrate_image_paths(nearby::text)::jsonb,
  amenities     = pg_temp.migrate_image_paths(amenities::text)::jsonb,
  materials     = pg_temp.migrate_image_paths(materials::text)::jsonb,
  building_data = REPLACE(
    pg_temp.migrate_image_paths(building_data::text),
    './assets/floorplan.svg',
    './assets/images/plano-edificio.webp'
  )::jsonb;

-- ─── Update units (per-unit floor plan → plano-vivienda.webp) ───────────────
UPDATE units SET
  hero_image     = pg_temp.migrate_image_paths(hero_image),
  thumbnail      = pg_temp.migrate_image_paths(thumbnail),
  plan_image     = REPLACE(
    pg_temp.migrate_image_paths(plan_image),
    './assets/floorplan.svg',
    './assets/images/plano-vivienda.webp'
  ),
  gallery_images = pg_temp.migrate_image_paths(gallery_images::text)::jsonb;

-- ─── Verify ──────────────────────────────────────────────────────────────────
SELECT id, hero_image, thumbnail, plan_image FROM units LIMIT 5;
SELECT slug, hero_image, aerial_image FROM projects WHERE slug = 'las-conchas';
