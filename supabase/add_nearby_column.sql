-- Añade columna nearby a la tabla projects y la rellena
-- Pegar en Supabase → SQL Editor → Run.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS nearby JSONB DEFAULT '[]';

UPDATE projects
SET nearby = '[
  {
    "id": "beach",
    "icon": "Waves",
    "es": "Playa",
    "en": "Beach",
    "dist": "50 m",
    "description": "Primera línea de playa en la Costa del Sol. Acceso directo desde el edificio a la arena y al mar Mediterráneo, con todas las comodidades de los chiringuitos más exclusivos de Marbella.",
    "descriptionEN": "First beach line on the Costa del Sol. Direct access from the building to the sand and Mediterranean Sea, with all the amenities of Marbella''s most exclusive beach clubs.",
    "images": ["./assets/images/piscina-01.webp", "./assets/images/terraza/terraza-day-02.webp"]
  },
  {
    "id": "puerto",
    "icon": "Anchor",
    "es": "Puerto Banús",
    "en": "Puerto Banús",
    "dist": "3 km",
    "description": "A solo 3 km, Puerto Banús es sinónimo de lujo en la Costa del Sol. Tiendas de alta gama, restaurantes con estrella Michelin y el marina más glamuroso del Mediterráneo.",
    "descriptionEN": "Just 3 km away, Puerto Banús is synonymous with luxury on the Costa del Sol. High-end boutiques, Michelin-starred restaurants and the most glamorous marina in the Mediterranean.",
    "images": ["./assets/images/salon/salon-day.webp", "./assets/images/salon/salon-day-02.webp"]
  },
  {
    "id": "golf",
    "icon": "Flag",
    "es": "Campo de golf",
    "en": "Golf course",
    "dist": "1.2 km",
    "description": "Marbella cuenta con más de 70 campos de golf en un radio de 30 km, siendo uno de los destinos de golf más importantes de Europa. A 1,2 km del edificio, acceso inmediato a greens de primer nivel.",
    "descriptionEN": "Marbella has over 70 golf courses within a 30 km radius, making it one of Europe''s premier golf destinations. Just 1.2 km from the building, with immediate access to top-level greens.",
    "images": ["./assets/images/terraza/terraza-day.webp"]
  },
  {
    "id": "shopping",
    "icon": "ShoppingBag",
    "es": "Centro comercial",
    "en": "Shopping centre",
    "dist": "1.5 km",
    "description": "A 1,5 km, todo lo que necesitas: supermercados, moda, restauración y servicios. Marbella cuenta además con una calle comercial peatonal con marcas internacionales de primer nivel.",
    "descriptionEN": "1.5 km away, everything you need: supermarkets, fashion, dining and services. Marbella also has a pedestrian shopping street with top international brands.",
    "images": []
  },
  {
    "id": "airport",
    "icon": "Plane",
    "es": "Aeropuerto Málaga",
    "en": "Málaga Airport",
    "dist": "45 min",
    "description": "El Aeropuerto Internacional de Málaga-Costa del Sol conecta con más de 100 destinos en toda Europa. A tan solo 45 minutos en coche por la AP-7, con opciones de traslado privado disponibles.",
    "descriptionEN": "Málaga-Costa del Sol International Airport connects to over 100 destinations across Europe. Just 45 minutes by car via the AP-7, with private transfer options available.",
    "images": []
  },
  {
    "id": "restaurants",
    "icon": "Utensils",
    "es": "Restaurantes",
    "en": "Restaurants",
    "dist": "200 m",
    "description": "A apenas 200 metros, una selección de restaurantes de alta cocina mediterránea, chiringuitos de playa y terrazas con vistas al mar. La gastronomía de Marbella, al alcance de la mano.",
    "descriptionEN": "Just 200 meters away, a selection of fine Mediterranean cuisine restaurants, beach bars and sea-view terraces. Marbella''s gastronomy, right at your doorstep.",
    "images": ["./assets/images/cocina/cocina-day-02.webp", "./assets/images/cocina/cocina-day.webp"]
  }
]'::jsonb
WHERE slug = 'las-conchas';

-- Verifica
SELECT slug, nearby FROM projects WHERE slug = 'las-conchas';
