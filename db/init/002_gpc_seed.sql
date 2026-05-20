INSERT INTO gpc_manufacturers (id, name, code, website_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'M-technologies', 'MTECH', 'https://www.m-technologies.cz'),
  ('11111111-1111-1111-1111-111111111112', 'Walter', 'WALTER', 'https://www.walter-tools.com'),
  ('11111111-1111-1111-1111-111111111113', 'Sandvik Coromant', 'SANDVIK', 'https://www.sandvik.coromant.com'),
  ('11111111-1111-1111-1111-111111111114', 'MAZAK', 'MAZAK', 'https://www.mazakeu.com')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  website_url = EXCLUDED.website_url;

INSERT INTO gpc_product_types (id, code, name, parent_id)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'TOOL', 'Nástroj', NULL),
  ('22222222-2222-2222-2222-222222222222', 'MILL', 'Fréza', '22222222-2222-2222-2222-222222222221'),
  ('22222222-2222-2222-2222-222222222223', 'DRILL', 'Vrták', '22222222-2222-2222-2222-222222222221'),
  ('22222222-2222-2222-2222-222222222224', 'INSERT', 'Břitová destička', '22222222-2222-2222-2222-222222222221'),
  ('22222222-2222-2222-2222-222222222225', 'COATING', 'Povlak', NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id;

INSERT INTO gpc_product_cards (
  id,
  gpc_id,
  manufacturer_id,
  product_type_id,
  name,
  manufacturer_part_number,
  description,
  application,
  status,
  validation_status,
  technical_parameters,
  search_text
)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    'GPC-WALTER-DC170-105',
    '11111111-1111-1111-1111-111111111112',
    '22222222-2222-2222-2222-222222222223',
    'DC170-05-10.500A1-WJ30EJ',
    'DC170-05-10.500A1-WJ30EJ',
    'Monolitní tvrdokovový vrták s vnitřním chlazením.',
    'Vrtání slepých a průchozích otvorů v oceli a litině.',
    'active',
    'valid',
    '{
      "geometry": {
        "diameter_mm": 10.5,
        "flute_length_mm": 56,
        "overall_length_mm": 118,
        "flutes": 2,
        "point_angle_deg": 140
      },
      "cutting": {
        "coolant_required": true,
        "internal_coolant": true,
        "max_rpm": 100000
      },
      "features": {
        "material": "Solid carbide",
        "coating": "TiAlN",
        "shank_tolerance": "h6"
      }
    }'::jsonb,
    'Walter DC170 vrták 10.5 GTIN 4024035123456'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'GPC-SANDVIK-860-105',
    '11111111-1111-1111-1111-111111111113',
    '22222222-2222-2222-2222-222222222223',
    '860.1-1050-056A1-MM M2BM',
    '860.1-1050-056A1-MM M2BM',
    'CoroDrill 860-MM, monolitní vrták pro produktivní vrtání.',
    'Vrtání ocelí, nerezových materiálů a litin.',
    'active',
    'valid',
    '{
      "geometry": {
        "diameter_mm": 10.5,
        "flute_length_mm": 56,
        "overall_length_mm": 118,
        "flutes": 2,
        "helix_angle_deg": 30,
        "point_angle_deg": 140
      },
      "cutting": {
        "internal_coolant": true,
        "max_rpm": 1971
      },
      "features": {
        "material": "Solid carbide",
        "grade": "M2BM",
        "hand": "Right"
      }
    }'::jsonb,
    'Sandvik Coromant CoroDrill 860 vrták 10.5 GTIN 07323220'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'GPC-MTECH-EM-080',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'MTECH End Mill 8.0 Z4',
    'MTECH-EM-080-Z4',
    'Testovací monolitní stopková fréza pro interní katalog GPC.',
    'Dokončovací a polodokončovací frézování oceli.',
    'draft',
    'needs_review',
    '{
      "geometry": {
        "diameter_mm": 8.0,
        "overall_length_mm": 63,
        "cutting_length_mm": 20,
        "flutes": 4,
        "corner_radius_mm": 0
      },
      "cutting": {
        "recommended_vc_m_min": 180,
        "recommended_fz_mm": 0.04
      },
      "features": {
        "material": "Solid carbide",
        "coating": "AlTiN",
        "helix": "variable"
      }
    }'::jsonb,
    'M-technologies MTECH fréza 8.0 Z4 testovací GTIN 8590000000001'
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    'GPC-WALTER-INSERT-WNMG080408',
    '11111111-1111-1111-1111-111111111112',
    '22222222-2222-2222-2222-222222222224',
    'WNMG080408-MP WPP20S',
    'WNMG080408-MP WPP20S',
    'Vyměnitelná břitová destička pro soustružení ocelí.',
    'Hrubování a střední obrábění vnějších a vnitřních průměrů.',
    'active',
    'valid',
    '{
      "geometry": {
        "insert_shape": "W",
        "clearance_angle_deg": 0,
        "inscribed_circle_mm": 12.7,
        "thickness_mm": 4.76,
        "corner_radius_mm": 0.8
      },
      "features": {
        "grade": "WPP20S",
        "chipbreaker": "MP",
        "coating": "Tiger-tec Gold"
      }
    }'::jsonb,
    'Walter WNMG080408 břitová destička WPP20S GTIN 4024035000001'
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    'GPC-MAZAK-COATING-MAZATROL',
    '11111111-1111-1111-1111-111111111114',
    '22222222-2222-2222-2222-222222222225',
    'MAZAK Test Coating Package',
    'MAZAK-COAT-TEST',
    'Testovací karta povlaku vedená v GPC jako samostatný produktový typ.',
    'Referenční povlak pro ověření evidence nekusových položek.',
    'phase_out',
    'needs_review',
    '{
      "coating": {
        "name": "Test PVD coating",
        "technology": "PVD",
        "color": "bronze",
        "max_temperature_c": 850
      },
      "compatibility": {
        "product_types": ["DRILL", "MILL", "INSERT"],
        "materials": ["ISO P", "ISO M"]
      }
    }'::jsonb,
    'MAZAK povlak coating testovací GTIN 8590000000002'
  )
ON CONFLICT (id) DO UPDATE SET
  gpc_id = EXCLUDED.gpc_id,
  manufacturer_id = EXCLUDED.manufacturer_id,
  product_type_id = EXCLUDED.product_type_id,
  name = EXCLUDED.name,
  manufacturer_part_number = EXCLUDED.manufacturer_part_number,
  description = EXCLUDED.description,
  application = EXCLUDED.application,
  status = EXCLUDED.status,
  validation_status = EXCLUDED.validation_status,
  technical_parameters = EXCLUDED.technical_parameters,
  search_text = EXCLUDED.search_text;

INSERT INTO gpc_gtins (product_card_id, gtin, is_primary)
VALUES
  ('33333333-3333-3333-3333-333333333331', '4024035123456', true),
  ('33333333-3333-3333-3333-333333333332', '07323220', true),
  ('33333333-3333-3333-3333-333333333333', '8590000000001', true),
  ('33333333-3333-3333-3333-333333333334', '4024035000001', true),
  ('33333333-3333-3333-3333-333333333335', '8590000000002', true)
ON CONFLICT (gtin) DO NOTHING;

INSERT INTO gpc_attachments (id, product_card_id, attachment_type, title, url, mime_type, sort_order, metadata)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    'product_url',
    'Produktová stránka Walter',
    'https://www.walter-tools.com',
    NULL,
    10,
    '{"source": "manufacturer"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333331',
    'datasheet',
    'Datasheet Walter DC170',
    'https://www.walter-tools.com/cs-cz/search/product/DC170',
    'text/html',
    20,
    '{"source": "manufacturer"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333332',
    'product_url',
    'Produktová stránka Sandvik Coromant',
    'https://www.sandvik.coromant.com',
    NULL,
    10,
    '{"source": "manufacturer"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333332',
    'toolsunited_url',
    'ToolsUnited reference',
    'https://www.toolsunited.com',
    NULL,
    20,
    '{"source": "toolsunited"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444445',
    '33333333-3333-3333-3333-333333333333',
    'datasheet',
    'Interní testovací datasheet M-technologies',
    'https://www.m-technologies.cz/gpc/test-datasheet',
    'text/html',
    10,
    '{"source": "internal-test"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444446',
    '33333333-3333-3333-3333-333333333334',
    'product_url',
    'Produktová stránka Walter inserts',
    'https://www.walter-tools.com',
    NULL,
    10,
    '{"source": "manufacturer"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444447',
    '33333333-3333-3333-3333-333333333335',
    'product_url',
    'MAZAK Europe',
    'https://www.mazakeu.com',
    NULL,
    10,
    '{"source": "manufacturer", "test_record": true}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  product_card_id = EXCLUDED.product_card_id,
  attachment_type = EXCLUDED.attachment_type,
  title = EXCLUDED.title,
  url = EXCLUDED.url,
  mime_type = EXCLUDED.mime_type,
  sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata;

INSERT INTO gpc_validations (
  id,
  product_card_id,
  validation_status,
  validated_by,
  validation_message,
  validation_errors
)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '33333333-3333-3333-3333-333333333331',
    'valid',
    'seed',
    'Testovací karta obsahuje povinné minimum: výrobce, typ, GTIN a technické parametry.',
    '[]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333332',
    'valid',
    'seed',
    'Testovací karta je validní pro základní GPC scénář.',
    '[]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    '33333333-3333-3333-3333-333333333333',
    'needs_review',
    'seed',
    'Interní testovací karta čeká na doplnění externího výrobního zdroje.',
    '[{"field": "manufacturer_part_number", "message": "Ověřit proti internímu katalogu."}]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555554',
    '33333333-3333-3333-3333-333333333334',
    'valid',
    'seed',
    'Břitová destička má vyplněné základní rozměry a GTIN.',
    '[]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333335',
    'needs_review',
    'seed',
    'Karta povlaku je testovací a vyžaduje rozhodnutí, zda povlak zůstane samostatný typ produktu.',
    '[{"field": "product_type", "message": "Ověřit modelování povlaků v GPC."}]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  product_card_id = EXCLUDED.product_card_id,
  validation_status = EXCLUDED.validation_status,
  validated_by = EXCLUDED.validated_by,
  validation_message = EXCLUDED.validation_message,
  validation_errors = EXCLUDED.validation_errors;

INSERT INTO gpc_audit_logs (id, product_card_id, actor, action, before_data, after_data, metadata)
VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    '33333333-3333-3333-3333-333333333331',
    'seed',
    'create_product_card',
    NULL,
    '{"gpc_id": "GPC-WALTER-DC170-105", "status": "active"}'::jsonb,
    '{"source": "002_gpc_seed.sql"}'::jsonb
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '33333333-3333-3333-3333-333333333332',
    'seed',
    'create_product_card',
    NULL,
    '{"gpc_id": "GPC-SANDVIK-860-105", "status": "active"}'::jsonb,
    '{"source": "002_gpc_seed.sql"}'::jsonb
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    '33333333-3333-3333-3333-333333333333',
    'seed',
    'create_product_card',
    NULL,
    '{"gpc_id": "GPC-MTECH-EM-080", "status": "draft"}'::jsonb,
    '{"source": "002_gpc_seed.sql"}'::jsonb
  ),
  (
    '66666666-6666-6666-6666-666666666664',
    '33333333-3333-3333-3333-333333333334',
    'seed',
    'create_product_card',
    NULL,
    '{"gpc_id": "GPC-WALTER-INSERT-WNMG080408", "status": "active"}'::jsonb,
    '{"source": "002_gpc_seed.sql"}'::jsonb
  ),
  (
    '66666666-6666-6666-6666-666666666665',
    '33333333-3333-3333-3333-333333333335',
    'seed',
    'create_product_card',
    NULL,
    '{"gpc_id": "GPC-MAZAK-COATING-MAZATROL", "status": "phase_out"}'::jsonb,
    '{"source": "002_gpc_seed.sql"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
