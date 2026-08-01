-- Cosentino kitchen materials — actualiza el campo materials del proyecto
-- Pegar en Supabase → SQL Editor → Run.

DO $$
DECLARE
  v_slug TEXT;
  v_materials JSONB;
BEGIN
  SELECT slug INTO v_slug FROM projects LIMIT 1;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'No hay proyectos en la tabla projects.';
  END IF;

  -- Lee el campo materials actual y reemplaza solo la cocina
  SELECT materials INTO v_materials FROM projects WHERE slug = v_slug;

  v_materials := jsonb_set(
    COALESCE(v_materials, '{}'::jsonb),
    '{kitchen}',
    '[
      {
        "id": "keena",
        "label": "Dekton Keena",
        "labelEN": "Dekton Keena",
        "collection": "Dekton",
        "swatch": "#DDD2C0",
        "source_url": "https://www.cosentino.com/es/colores/dekton/keena/",
        "description": "Superficie ultracompacta de tono beige cálido con vetas suaves. Alta resistencia a manchas, rayado y temperatura. Ideal para encimeras y revestimientos de cocina.",
        "descriptionEN": "Ultra-compact surface in warm beige with soft veining. High resistance to stains, scratches and heat. Ideal for kitchen worktops and claddings.",
        "render_day":   "./assets/images/cocina/cocina-day-02.webp",
        "render_night": "./assets/images/cocina/cocina-day-02.webp",
        "texture":      "./assets/images/cocina/cocina-day-02.webp"
      },
      {
        "id": "phantome",
        "label": "Eclos Phantome",
        "labelEN": "Eclos Phantome",
        "collection": "Eclos",
        "swatch": "#4A4A48",
        "source_url": "https://www.cosentino.com/usa/colors/eclos/phantome/",
        "description": "Superficie sostenible Eclos en gris ahumado profundo. Composición con alto contenido reciclado, acabado mate y textura sutil. Perfecta para cocinas contemporáneas.",
        "descriptionEN": "Sustainable Eclos surface in deep smoky grey. High recycled content, matte finish and subtle texture. Perfect for contemporary kitchens.",
        "render_day":   "./assets/images/cocina/cocina-day.webp",
        "render_night": "./assets/images/cocina/cocina-day.webp",
        "texture":      "./assets/images/cocina/cocina-day.webp"
      },
      {
        "id": "fantasy_brown",
        "label": "Scalea Fantasy Brown",
        "labelEN": "Scalea Fantasy Brown",
        "collection": "Scalea",
        "swatch": "#8B6F4A",
        "source_url": "https://www.cosentino.com/es/colores/scalea/fantasy-brown/",
        "description": "Cuarcita natural en tonos marrón cálido con vetas movidas únicas en cada pieza. Material noble de gran personalidad para cocinas de carácter.",
        "descriptionEN": "Natural quartzite in warm brown tones with bold veining unique to each piece. Noble material with strong personality for character-led kitchens.",
        "render_day":   "./assets/images/cocina/cocina-day-03.webp",
        "render_night": "./assets/images/cocina/cocina-day-03.webp",
        "texture":      "./assets/images/cocina/cocina-day-03.webp"
      }
    ]'::jsonb
  );

  UPDATE projects SET materials = v_materials WHERE slug = v_slug;

  RAISE NOTICE 'Materiales de cocina actualizados en %', v_slug;
END $$;

-- Verifica
SELECT slug, materials->'kitchen' AS kitchen_materials FROM projects;
