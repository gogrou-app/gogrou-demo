CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stav produktové karty v GPC.
CREATE TYPE gpc_product_status AS ENUM (
  'draft',
  'active',
  'phase_out',
  'discontinued'
);

-- Stav validace produktových dat.
CREATE TYPE gpc_validation_status AS ENUM (
  'not_validated',
  'valid',
  'invalid',
  'needs_review'
);

-- Typ přílohy nebo odkazu navázaného na produktovou kartu.
CREATE TYPE gpc_attachment_type AS ENUM (
  'image',
  'datasheet',
  'drawing',
  'manual',
  'product_url',
  'toolsunited_url',
  'other'
);

CREATE TABLE gpc_manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_manufacturers_name_unique UNIQUE (name),
  CONSTRAINT gpc_manufacturers_code_unique UNIQUE (code)
);

CREATE TABLE gpc_product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES gpc_product_types(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_product_types_code_unique UNIQUE (code)
);

CREATE TABLE gpc_product_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gpc_id text NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES gpc_manufacturers(id) ON DELETE RESTRICT,
  product_type_id uuid NOT NULL REFERENCES gpc_product_types(id) ON DELETE RESTRICT,
  name text NOT NULL,
  manufacturer_part_number text,
  description text,
  application text,
  status gpc_product_status NOT NULL DEFAULT 'draft',
  validation_status gpc_validation_status NOT NULL DEFAULT 'not_validated',
  replacement_product_card_id uuid REFERENCES gpc_product_cards(id) ON DELETE SET NULL,
  technical_parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_product_cards_gpc_id_unique UNIQUE (gpc_id),
  CONSTRAINT gpc_product_cards_parameters_object_check CHECK (jsonb_typeof(technical_parameters) = 'object'),
  CONSTRAINT gpc_product_cards_replacement_not_self_check CHECK (replacement_product_card_id IS NULL OR replacement_product_card_id <> id)
);

CREATE TABLE gpc_gtins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_card_id uuid NOT NULL REFERENCES gpc_product_cards(id) ON DELETE CASCADE,
  gtin text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_gtins_gtin_unique UNIQUE (gtin),
  CONSTRAINT gpc_gtins_gtin_digits_check CHECK (gtin ~ '^[0-9]{8,14}$')
);

CREATE UNIQUE INDEX gpc_gtins_one_primary_per_product_idx
  ON gpc_gtins (product_card_id)
  WHERE is_primary;

CREATE TABLE gpc_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_card_id uuid NOT NULL REFERENCES gpc_product_cards(id) ON DELETE CASCADE,
  attachment_type gpc_attachment_type NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  mime_type text,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_attachments_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE gpc_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_card_id uuid NOT NULL REFERENCES gpc_product_cards(id) ON DELETE CASCADE,
  validation_status gpc_validation_status NOT NULL,
  validated_by text,
  validation_message text,
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_validations_errors_array_check CHECK (jsonb_typeof(validation_errors) = 'array')
);

CREATE TABLE gpc_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_card_id uuid REFERENCES gpc_product_cards(id) ON DELETE SET NULL,
  actor text,
  action text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gpc_audit_logs_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX gpc_product_cards_manufacturer_id_idx ON gpc_product_cards (manufacturer_id);
CREATE INDEX gpc_product_cards_product_type_id_idx ON gpc_product_cards (product_type_id);
CREATE INDEX gpc_product_cards_status_idx ON gpc_product_cards (status);
CREATE INDEX gpc_product_cards_validation_status_idx ON gpc_product_cards (validation_status);
CREATE INDEX gpc_product_cards_technical_parameters_gin_idx ON gpc_product_cards USING gin (technical_parameters);
CREATE INDEX gpc_gtins_product_card_id_idx ON gpc_gtins (product_card_id);
CREATE INDEX gpc_attachments_product_card_id_idx ON gpc_attachments (product_card_id);
CREATE INDEX gpc_validations_product_card_id_created_at_idx ON gpc_validations (product_card_id, created_at DESC);
CREATE INDEX gpc_audit_logs_product_card_id_occurred_at_idx ON gpc_audit_logs (product_card_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION gpc_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gpc_manufacturers_set_updated_at
BEFORE UPDATE ON gpc_manufacturers
FOR EACH ROW EXECUTE FUNCTION gpc_set_updated_at();

CREATE TRIGGER gpc_product_types_set_updated_at
BEFORE UPDATE ON gpc_product_types
FOR EACH ROW EXECUTE FUNCTION gpc_set_updated_at();

CREATE TRIGGER gpc_product_cards_set_updated_at
BEFORE UPDATE ON gpc_product_cards
FOR EACH ROW EXECUTE FUNCTION gpc_set_updated_at();
