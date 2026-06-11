# GPC Import Layer

## Cíl

GPC importní vrstva připravuje interní mechanismus pro příjem produktových dat do GPC z více zdrojů:

- ToolsUnited
- ruční vložení jedné položky
- hromadný import přes XLS, CSV nebo JSON

Import do GPC provádí pouze interní tým Gogrou. Zákazník do GPC neimportuje a GPC položky neupravuje.

GPC není zákaznické prostředí. Zákazník pracuje v GSS.

## Související globální principy

Tento dokument vychází z globálních architektonických principů Gogrou:
`docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.

Lokální pravidla v tomto dokumentu principy pouze zpřesňují pro daný modul.

## Architektonické Pravidlo: Validovaná Master Databanka

GPC obsahuje pouze validované master položky. GPC není prostor pro zákaznické nevalidované položky.

Pokud zákazník v GSS potřebuje položku, která v GPC není, může ji založit lokálně v GSS jako nevalidovanou zákaznickou položku. Taková položka patří pouze do zákaznického provozního světa GSS a nevzniká tím automaticky nový GPC master záznam.

Nevalidovaná zákaznická položka v GSS nemá dostupné pokročilé funkce, například:

- normativy
- AI doporučení
- plnohodnotné alternativy
- plnou technickou dokumentaci
- automatické optimalizace

Nevalidovaná položka v GSS může sloužit jako podnět pro doplnění do GPC. Gogrou může na základě těchto podnětů oslovit výrobce nebo dodavatele a získat data v rozsahu podobném ToolsUnited.

Cílový stav:

- výrobci a značky budou mít bezpečný řízený kanál pro dodávání a aktualizaci dat do GPC
- novinky, změny, ukončené položky a aktualizace parametrů budou předávány kontrolovanou cestou
- Gogrou tým data ověří nebo schválí před zařazením do GPC
- ve druhé obchodní vrstvě mohou značky získat možnost nabídnout Gogrou komunitě výhodné podmínky

## Rozsah

Importní vrstva řeší pouze master data GPC:

- produktovou kartu
- výrobce
- typ produktu
- identifikátory jako `gpc_id`, GTIN a výrobní číslo položky výrobce
- technické parametry
- katalogový status
- odkazy a assety
- validační a auditní stopu

Importní vrstva neřeší:

- skladové kusy zákazníka
- zákaznické min/max
- DM tracking
- zákaz výdeje
- brousitelnost
- zákaznické poznámky
- provozní lifecycle v GSS

## Importní Workflow

Základní workflow:

1. `ingest`
   - Přijetí zdrojových dat.
   - Zdroj může být ToolsUnited odpověď, ručně zadaný objekt nebo soubor XLS/CSV/JSON.

2. `normalize`
   - Převod zdrojových dat do interního importního formátu.
   - Sjednocení názvů polí, typů hodnot, jednotek a prázdných hodnot.

3. `map`
   - Mapování normalizovaných polí na GPC strukturu.
   - Oddělení relačních polí od `technical_parameters`.

4. `validate`
   - Kontrola povinných polí, datových typů, enumů, GTIN formátu, JSONB struktury a vazeb.

5. `match`
   - Rozhodnutí, zda jde o novou položku nebo aktualizaci existující položky.
   - Preferované klíče: `gpc_id`, GTIN, manufacturer + manufacturer part number.

6. `preview`
   - Interní náhled změn před zápisem.
   - Ukazuje nové položky, aktualizace, varování a chyby.

7. `apply`
   - Zápis do GPC databáze.
   - Vytvoření nebo aktualizace produktových karet a navazujících dat.

8. `audit`
   - Uložení auditní stopy importu.
   - Uložení chybového protokolu a přehledu změn.

## Importní Statusy

Navržené statusy importního běhu:

- `received` - importní dávka byla přijata
- `normalized` - data byla převedena do interního importního formátu
- `mapped` - pole byla namapována na GPC strukturu
- `validated` - validace proběhla bez blokujících chyb
- `validation_failed` - validace našla blokující chyby
- `ready_for_review` - import čeká na interní kontrolu
- `approved` - import byl interně schválen k zápisu
- `applied` - změny byly zapsány do GPC
- `partially_applied` - část položek byla zapsána, část skončila chybou
- `failed` - import selhal
- `cancelled` - import byl interně zrušen

Status importu je oddělený od katalogového statusu produktu (`draft`, `active`, `phase_out`, `discontinued`, `archived`).

## Validace Dat

Validace má dvě úrovně.

Blokující chyby:

- chybí výrobce
- chybí název produktu
- chybí typ produktu nebo ho nelze namapovat
- nevalidní GTIN
- nevalidní `technical_parameters` objekt
- nevalidní katalogový status
- konflikt unikátního identifikátoru

Varování:

- chybí doporučené technické parametry
- jednotka nebyla rozpoznána
- hodnota byla převedena nebo zaokrouhlena
- asset URL není ověřená
- položka pravděpodobně existuje, ale match není jednoznačný
- externí zdroj poslal pole bez GPC mapování

Validace nesmí automaticky řešit zákaznický provozní kontext. Pokud zdroj obsahuje provozní nebo skladové informace, import je ignoruje nebo označí jako mimo rozsah GPC.

## Mapování Externích Polí na GPC

Importní mapper převádí zdrojová pole do těchto oblastí:

| Externí význam | GPC cíl |
| --- | --- |
| výrobce | `gpc_manufacturers` |
| typ produktu | `gpc_product_types` |
| název produktu | `gpc_product_cards.name` |
| katalogové číslo výrobce | `gpc_product_cards.manufacturer_part_number` |
| popis | `gpc_product_cards.description` |
| použití | `gpc_product_cards.application` |
| GTIN/EAN | `gpc_gtins.gtin` |
| technické parametry | `gpc_product_cards.technical_parameters` |
| datasheet URL | `gpc_attachments` |
| obrázek/výkres/manuál | `gpc_attachments` |
| náhradní položka | `replacement_product_card_id` nebo interní lookup |

Technické parametry mají být mapované do JSONB struktury podle produktu. Příklad:

```json
{
  "geometry": {
    "diameter_mm": 10.5,
    "flutes": 4
  },
  "features": {
    "material": "Solid carbide",
    "coating": "TiAlN"
  }
}
```

## ToolsUnited

ToolsUnited import je externí zdroj master dat. Musí být normalizovaný před zápisem do GPC.

Zásady:

- ToolsUnited ID se ukládá jako externí metadata, ne jako primární GPC identita.
- GPC si drží vlastní `gpc_id`.
- Výrobce a produktový typ se mapují přes interní číselníky.
- Technické parametry se ukládají do `technical_parameters`.
- Datasheety, produktové URL a výkresy se ukládají jako `gpc_attachments`.

Pokud ToolsUnited pošle aktualizaci existující položky, import musí vytvořit diff a auditní záznam.

## Ruční Vložení Jedné Položky

Ruční vložení je interní Gogrou operace pro rychlé založení nebo doplnění master položky.

Workflow je stejné jako u ostatních zdrojů:

1. interní vstup
2. normalize
3. map
4. validate
5. preview
6. apply
7. audit

Ruční vložení nesmí obcházet validaci ani audit.

## XLS/CSV/JSON Import

Hromadný import se zpracovává jako importní dávka.

Zásady:

- každý řádek nebo objekt je jedna importní položka
- dávka má společný importní status
- každá položka má vlastní validační výsledek
- import může skončit jako `partially_applied`
- parser zatím není součástí tohoto návrhu

CSV/XLS zdroje musí projít normalizací hlaviček, datových typů a prázdných hodnot. JSON zdroje musí projít validací tvaru objektu.

## Nová Položka vs Aktualizace Existující

Nová položka se vytvoří, pokud importer nenajde existující GPC produkt podle match pravidel.

Aktualizace existující položky nastane, pokud se najde jednoznačný match podle:

1. `gpc_id`
2. primární GTIN
3. výrobce + `manufacturer_part_number`
4. externí metadata zdroje, například ToolsUnited identifikátor

Při aktualizaci se nesmí slepě přepsat celý produkt. Import má vytvořit diff:

- předchozí hodnota
- nová hodnota
- zdroj hodnoty
- typ změny
- případné varování

Citlivé změny, například změna výrobce, typu produktu nebo GTIN, mají vyžadovat interní review.

## Audit Změn

Každý aplikovaný import musí zapsat audit.

Auditní záznam má obsahovat:

- importní zdroj
- interního aktéra nebo systémový actor
- čas importu
- dotčený produkt
- akci, například `gpc.import.created` nebo `gpc.import.updated`
- `before_data`
- `after_data`
- metadata importu

Audit navazuje na existující `gpc_audit_logs`.

Navržené auditní akce:

- `gpc.import.batch_received`
- `gpc.import.validation_failed`
- `gpc.import.created`
- `gpc.import.updated`
- `gpc.import.asset_added`
- `gpc.import.cancelled`

## Importní Chybový Protokol

Importní chybový protokol má být čitelný pro interní tým.

Minimální struktura chyby:

```json
{
  "row": 12,
  "external_id": "TU-123456",
  "field": "gtin",
  "severity": "error",
  "code": "INVALID_GTIN",
  "message": "GTIN musi obsahovat 8 az 14 cislic.",
  "raw_value": "ABC123"
}
```

Severity:

- `error` - blokuje zápis dané položky nebo celé dávky
- `warning` - dovoluje pokračovat, ale vyžaduje pozornost
- `info` - informativní poznámka k transformaci

Chybový protokol se má ukládat k importní dávce a být dohledatelný podle zdroje, času, aktéra a produktu.

## Navržené Datové Objekty

Budoucí implementace může přidat tabulky:

- `gpc_import_batches`
- `gpc_import_items`
- `gpc_import_errors`
- `gpc_import_field_mappings`

MVP může začít bez těchto tabulek a zapisovat pouze do `gpc_audit_logs`, ale pro reálné importy je vhodné importní dávky modelovat explicitně.

## Neřešené Věci

Tento dokument záměrně neřeší:

- parser ToolsUnited
- XLS parser
- CSV parser
- JSON parser
- UI pro import
- GSS
- zákaznické úpravy položek
