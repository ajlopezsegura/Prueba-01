-- ──────────────────────────────────────────────────────────────────────────
-- DEMO LEADS SEED v2 — Las Conchas (con materiales en leads calientes)
-- Pegar en Supabase → SQL Editor → Run.
-- Script bulletproof: detecta automáticamente el project_slug existente.
-- ──────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_slug TEXT;
BEGIN
  SELECT slug INTO v_slug FROM projects LIMIT 1;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'No hay proyectos en la tabla projects. Crea uno primero.';
  END IF;

  -- Limpia demos previos
  DELETE FROM leads WHERE (contact->>'email') LIKE '%@demo.lasconchas.test';

  -- ═══════════════ HOT LEADS ═══════════════

  -- HOT · Carlos · visita · 3C · con materiales configurados
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'decision', 'visit', '["3C"]', '3C',
    '[{"unit_id":"3C","typology":"4 Dormitorios","floor":3,"bedrooms":4,"surface":165,"price":720000,"status":"available"}]',
    '{"name":"Carlos Mendoza Vidal","email":"carlos.mendoza@demo.lasconchas.test","phone":"+34 611 234 567","preferred_date":"2026-04-29","message":"Muy interesado en la 3C. Querria visitarla con mi esposa este miercoles o jueves.","materials":{"floor":"roble","walls":"blanco","kitchen":"marquina"},"configured_unit":"3C"}',
    '[{"type":"page_view","page":"/","duration_ms":12000},{"type":"page_view","page":"/proyecto","duration_ms":45000},{"type":"page_view","page":"/availability","duration_ms":38000},{"type":"page_view","page":"/availability/3c","duration_ms":52000},{"type":"page_view","page":"/inmersion/3c","duration_ms":184000},{"type":"page_view","page":"/decision","duration_ms":28000},{"type":"page_view","page":"/contact","duration_ms":71000}]',
    15, 'hot', 'new', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

  -- HOT · Isabel · llamada · 4A · con materiales
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'summary', 'call', '["4A"]', '4A',
    '[{"unit_id":"4A","typology":"4 Dormitorios","floor":4,"bedrooms":4,"surface":180,"price":810000,"status":"available"}]',
    '{"name":"Isabel Fernandez Ruiz","email":"isabel.fernandez@demo.lasconchas.test","phone":"+34 622 345 678","preferred_date":"2026-04-24","message":"Tengo financiacion aprobada hasta 850k. Quiero cerrar rapido.","materials":{"floor":"caliza","walls":"blanco","kitchen":"bianco"},"configured_unit":"4A"}',
    '[{"type":"page_view","page":"/","duration_ms":8000},{"type":"page_view","page":"/proyecto","duration_ms":62000},{"type":"page_view","page":"/availability","duration_ms":41000},{"type":"page_view","page":"/availability/4a","duration_ms":73000},{"type":"page_view","page":"/inmersion/4a","duration_ms":215000},{"type":"page_view","page":"/decision","duration_ms":34000},{"type":"page_view","page":"/summary/4a","duration_ms":58000},{"type":"page_view","page":"/contact","duration_ms":82000}]',
    15, 'hot', 'new', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours');

  -- HOT · Andreas · info · 3A + 4A (comparadas)
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'decision', 'info', '["3A","4A"]', '3A',
    '[{"unit_id":"3A","typology":"3 Dormitorios","floor":3,"bedrooms":3,"surface":130,"price":560000,"status":"available"},{"unit_id":"4A","typology":"4 Dormitorios","floor":4,"bedrooms":4,"surface":180,"price":810000,"status":"available"}]',
    '{"name":"Andreas Muller","email":"a.muller@demo.lasconchas.test","phone":"+49 171 4567 890","preferred_date":null,"message":"Looking to relocate from Munich. Need info on taxes and residency for non-EU.","materials":{"floor":"microcemento","walls":"grafito","kitchen":"laton"},"configured_unit":"3A"}',
    '[{"type":"page_view","page":"/","duration_ms":10000},{"type":"page_view","page":"/proyecto","duration_ms":52000},{"type":"page_view","page":"/availability","duration_ms":46000},{"type":"page_view","page":"/availability/3a","duration_ms":68000},{"type":"page_view","page":"/availability/4a","duration_ms":71000},{"type":"page_view","page":"/compare","duration_ms":94000},{"type":"page_view","page":"/decision","duration_ms":31000},{"type":"page_view","page":"/contact","duration_ms":64000}]',
    15, 'hot', 'contacted', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

  -- HOT · Javier · visita · Atico
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'summary', 'visit', '["AT1"]', 'AT1',
    '[{"unit_id":"AT1","typology":"Atico","floor":5,"bedrooms":4,"surface":280,"price":1150000,"status":"available"}]',
    '{"name":"Javier Alvarez-Cascos","email":"j.alvarez@demo.lasconchas.test","phone":"+34 639 876 543","preferred_date":"2026-04-26","message":"Interesado exclusivamente en el atico. Sabado manana para visita.","materials":{"floor":"roble","walls":"caliza_p","kitchen":"marquina"},"configured_unit":"AT1"}',
    '[{"type":"page_view","page":"/","duration_ms":6000},{"type":"page_view","page":"/proyecto","duration_ms":71000},{"type":"page_view","page":"/availability","duration_ms":29000},{"type":"page_view","page":"/availability/at1","duration_ms":88000},{"type":"page_view","page":"/inmersion/at1","duration_ms":276000},{"type":"page_view","page":"/decision","duration_ms":42000},{"type":"page_view","page":"/summary/at1","duration_ms":65000},{"type":"page_view","page":"/contact","duration_ms":51000}]',
    15, 'hot', 'new', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

  -- ═══════════════ COLD LEADS ═══════════════

  -- COLD · Laura · info · 2A
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'unit_detail', 'info', '["2A"]', '2A',
    '[{"unit_id":"2A","typology":"2 Dormitorios","floor":2,"bedrooms":2,"surface":100,"price":440000,"status":"available"}]',
    '{"name":"Laura Gomez Santos","email":"lgomez@demo.lasconchas.test","phone":"+34 655 123 789","preferred_date":null,"message":"Esta incluido el garaje? Plazo de entrega?","materials":null,"configured_unit":null}',
    '[{"type":"page_view","page":"/","duration_ms":5000},{"type":"page_view","page":"/proyecto","duration_ms":21000},{"type":"page_view","page":"/availability","duration_ms":18000},{"type":"page_view","page":"/availability/2a","duration_ms":32000},{"type":"page_view","page":"/contact","duration_ms":47000}]',
    3, 'cold', 'new', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

  -- COLD · Marc · info · 3B
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'unit_detail', 'info', '["3B"]', '3B',
    '[{"unit_id":"3B","typology":"2 Dormitorios","floor":3,"bedrooms":2,"surface":105,"price":475000,"status":"available"}]',
    '{"name":"Marc Delacroix","email":"marc.delacroix@demo.lasconchas.test","phone":"+33 6 12 34 56 78","preferred_date":null,"message":"Is rental income expected during low season?","materials":null,"configured_unit":null}',
    '[{"type":"page_view","page":"/","duration_ms":4000},{"type":"page_view","page":"/availability","duration_ms":15000},{"type":"page_view","page":"/availability/3b","duration_ms":24000},{"type":"page_view","page":"/contact","duration_ms":38000}]',
    3, 'cold', 'new', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

  -- COLD · Maria Carmen · llamada · general
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'general', 'call', '[]', NULL, '[]',
    '{"name":"Maria del Carmen Ortega","email":"mcortega@demo.lasconchas.test","phone":"+34 677 445 221","preferred_date":"2026-05-02","message":"Me interesa el proyecto en general.","materials":null,"configured_unit":null}',
    '[{"type":"page_view","page":"/","duration_ms":8000},{"type":"page_view","page":"/proyecto","duration_ms":32000},{"type":"page_view","page":"/contact","duration_ms":28000}]',
    3, 'cold', 'new', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days');

  -- COLD · Tomas · visita · 1A vendida
  INSERT INTO leads (project_slug, source_page, intent, unit_ids, primary_unit_id, unit_snapshot, contact, session_trail, lead_score, lead_temperature, status, created_at, timestamp)
  VALUES (v_slug, 'unit_detail', 'visit', '["1A"]', '1A',
    '[{"unit_id":"1A","typology":"2 Dormitorios","floor":1,"bedrooms":2,"surface":98,"price":420000,"status":"sold"}]',
    '{"name":"Tomas Rivera Pena","email":"tomas.rivera@demo.lasconchas.test","phone":"+34 699 112 334","preferred_date":"2026-04-28","message":"Vi que 1A ya esta vendida. Alternativas similares?","materials":null,"configured_unit":null}',
    '[{"type":"page_view","page":"/","duration_ms":7000},{"type":"page_view","page":"/proyecto","duration_ms":19000},{"type":"page_view","page":"/availability","duration_ms":22000},{"type":"page_view","page":"/availability/1a","duration_ms":18000},{"type":"page_view","page":"/contact","duration_ms":41000}]',
    3, 'cold', 'closed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days');

  RAISE NOTICE 'Insertados 8 leads demo con slug %', v_slug;
END $$;

-- Verifica
SELECT lead_temperature, contact->>'name' AS nombre, intent,
       primary_unit_id AS vivienda,
       contact->'materials' AS materiales,
       created_at
FROM leads
WHERE (contact->>'email') LIKE '%@demo.lasconchas.test'
ORDER BY created_at DESC;
