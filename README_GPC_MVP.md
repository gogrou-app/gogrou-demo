# GPC MVP Backend Checkpoint

## Co je GPC

GPC je interní master databanka Gogrou pro produktové karty, technické parametry, identifikátory, assety a katalogový stav položek.

GPC slouží jako zdroj pravdy pro položky, které lze následně natáhnout do zákaznického GSS.

## Co GPC není

GPC není zákaznické prostředí.

Zákazník v GPC nepracuje a GPC položky neupravuje. Zákazník pracuje v GSS.

GPC neřeší:

- skladový život konkrétního kusu
- DM tracking
- zákaz výdeje
- brousitelnost
- návrat z výroby
- zákaznické min/max
- zákaznické poznámky

Tyto věci patří do GSS.

## Oddělení GPC vs GSS

GPC drží interní master data:

- produktová karta
- výrobce
- typ produktu
- GTIN
- technické parametry
- katalogový status
- assety
- validační/auditní základ

GSS drží zákaznický provozní kontext:

- skladové položky zákazníka
- kusy a pohyby
- zákaznická pravidla
- zákaznické poznámky
- min/max
- provozní lifecycle konkrétního kusu

Zákazník si z GPC natáhne položku do GSS. Od té chvíle se zákaznický provoz řeší v GSS, ne v GPC.

## Architektura

Backend foundation je postavený na:

- Next.js API routes v `app/api/gpc/**`
- PostgreSQL přes `pg`
- repository vrstvě v `lib/gpc/repositories/**`
- service vrstvě v `lib/gpc/services/**`
- bootstrap SQL v `db/init/**`

Základní moduly:

- `lib/gpc/db.js` - PostgreSQL pool a health check
- `lib/gpc/repositories/products.repository.js` - základní načítání produktů a lifecycle update
- `lib/gpc/repositories/products.filters.repository.js` - relační filtering
- `lib/gpc/repositories/products.search.repository.js` - JSONB search
- `lib/gpc/repositories/products.assets.repository.js` - assety produktové karty
- `lib/gpc/services/products.service.js` - product detail service
- `lib/gpc/services/lifecycle.service.js` - interní katalogový lifecycle master položky

## PostgreSQL + JSONB

Hlavní tabulka je `gpc_product_cards`.

Důležité sloupce:

- `gpc_id` - interní GPC identifikátor
- `manufacturer_id` - vazba na `gpc_manufacturers`
- `product_type_id` - vazba na `gpc_product_types`
- `status` - katalogový status master položky
- `validation_status` - stav validace dat
- `replacement_product_card_id` - volitelná náhrada
- `technical_parameters jsonb` - flexibilní technické parametry
- `search_text` - připravené pole pro budoucí fulltext

JSONB je použitý pro technické parametry, protože různé produktové typy mají rozdílné sady parametrů. Nad `technical_parameters` existuje GIN index:

```sql
CREATE INDEX IF NOT EXISTS gpc_product_cards_technical_parameters_gin_idx
  ON gpc_product_cards USING gin (technical_parameters);
```

## Docker Setup

V repozitáři zatím není `docker-compose.yml`. Pro lokální MVP stačí PostgreSQL kontejner s databází `gogrou_demo`.

Spuštění PostgreSQL přes Docker:

```bash
docker run --name gogrou-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gogrou_demo \
  -p 5432:5432 \
  -d postgres:16
```

Pokud už kontejner existuje:

```bash
docker start gogrou-postgres
```

Používaný connection string:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gogrou_demo
```

## Bootstrap Workflow

Bootstrap načítá:

1. `db/init/001_gpc_schema.sql`
2. `db/init/002_gpc_seed.sql`

Spuštění:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gogrou_demo npm run gpc:bootstrap
```

Bootstrap vytvoří základní GPC schema, enumy, tabulky, indexy, triggery a seed data.

## Dev Server

Spuštění Next dev serveru:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gogrou_demo npm run dev
```

Výchozí URL:

```text
http://localhost:3000
```

## API Endpointy

Health check:

```http
GET /api/gpc/health
```

Seznam produktů:

```http
GET /api/gpc/products
```

Detail podle GPC ID:

```http
GET /api/gpc/products/gpc/GPC-WALTER-DC170-105
```

Detail podle GTIN:

```http
GET /api/gpc/products/gtin/4024035123456
```

Filtering:

```http
GET /api/gpc/products/filter?manufacturer=Walter
GET /api/gpc/products/filter?status=active
GET /api/gpc/products/filter?product_type=Drill
```

JSONB search:

```http
GET /api/gpc/products/search?material=Solid%20carbide
GET /api/gpc/products/search?coating=TiAlN
GET /api/gpc/products/search?diameter=10.5
GET /api/gpc/products/search?flute_count=4
```

Assety:

```http
GET /api/gpc/products/gpc/GPC-WALTER-DC170-105/assets
```

Lifecycle update:

```http
PATCH /api/gpc/products/gpc/GPC-WALTER-DC170-105
Content-Type: application/json

{
  "status": "active",
  "actor": "gpc-internal",
  "reason": "catalog status verification"
}
```

## Filtering

Filtering je relační a používá explicitně podporované parametry:

- `manufacturer`
- `product_type`
- `status`
- `validation_status`

Implementace je v `lib/gpc/repositories/products.filters.repository.js`.

## JSONB Search

JSONB search hledá v `technical_parameters`.

Podporované parametry v API route:

- `diameter`
- `material`
- `coating`
- `flute_count`

Repository má připravenou i podporu pro numeric range parametry:

- `diameter_min`
- `diameter_max`
- `flute_count_min`
- `flute_count_max`

Aktuální route zatím předává jen základní parametry. Rozšíření route o range parametry je další malý krok.

## Assets

Assety jsou uložené v `gpc_attachments`.

Aktuálně podporované typy zahrnují produktové datasheety, výkresy, manuály, URL odkazy a další přílohy podle enumu `gpc_attachment_type`.

Endpoint:

```http
GET /api/gpc/products/gpc/{gpcId}/assets
```

Příklad ověřeného výsledku:

```json
{
  "data": [
    {
      "asset_type": "datasheet",
      "title": "Datasheet Walter DC170",
      "external_url": "https://www.walter-tools.com/cs-cz/search/product/DC170",
      "mime_type": "text/html"
    }
  ]
}
```

## Lifecycle

GPC lifecycle je pouze interní katalogový status master položky.

Povolené statusy:

- `draft`
- `active`
- `phase_out`
- `discontinued`
- `archived`

Lifecycle service je v `lib/gpc/services/lifecycle.service.js`.

Lifecycle v GPC neřeší skladový stav, zákaz výdeje, brousitelnost, DM hodnoty ani zákaznické provozní poznámky. To patří do GSS.

## Audit Foundation

Schema obsahuje tabulku `gpc_audit_logs`.

Aktuálně ji používá lifecycle update pro akci:

```text
gpc.catalog_status_changed
```

Audit ukládá:

- `product_card_id`
- `actor`
- `action`
- `before_data`
- `after_data`
- `metadata`
- `occurred_at`

Tím je připravený základ pro další interní GPC audit, například změny parametrů, validace, importy nebo synchronizace z externích zdrojů.
