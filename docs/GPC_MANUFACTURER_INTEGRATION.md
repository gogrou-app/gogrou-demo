# GPC Manufacturer Integration

## Cíl

Tento dokument navrhuje budoucí bezpečný integrační model mezi výrobci, značkami a GPC.

GPC zůstává centrálně kontrolovaná validovaná databanka Gogrou. Výrobce může dodávat data, ale nemá přímý write access do produkční GPC.

Gogrou tým zůstává odpovědný za kontrolu, validaci, schválení a publikaci změn do produkční GPC.

## Související globální principy

Tento dokument vychází z globálních architektonických principů Gogrou:
`docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.

Lokální pravidla v tomto dokumentu principy pouze zpřesňují pro daný modul.

## Role Výrobce v Gogrou Ekosystému

Výrobce nebo značka je důvěryhodný zdroj produktových dat, nikoli vlastník produkčního GPC zápisu.

Role výrobce:

- dodává produktová master data
- dodává aktualizace parametrů
- oznamuje nové produkty
- oznamuje ukončené nebo nahrazené položky
- dodává datasheety, návody, výkresy, STEP/3D modely a další dokumentaci
- potvrzuje správnost technických údajů
- může poskytovat obchodní informace pro druhou obchodní vrstvu

Role Gogrou:

- definuje GPC datový model
- kontroluje kvalitu a úplnost dat
- mapuje externí data na GPC strukturu
- schvaluje nebo zamítá změny
- publikuje validovaná data do produkční GPC
- drží audit, versioning a rollback

## Proč Výrobce Nemá Přímý Write Access

Výrobce nemá přímý write access do produkční GPC z těchto důvodů:

- GPC je centrálně kontrolovaná validovaná master databanka
- chyba výrobce by mohla poškodit data napříč celým Gogrou ekosystémem
- různí výrobci používají různé terminologie, jednotky a datové struktury
- změny parametrů mohou mít dopad na vyhledávání, alternativy, AI doporučení a normativy
- ukončení položky nebo změna náhrady musí projít kontrolou
- produkční GPC musí mít konzistentní auditní stopu a možnost rollbacku

Výrobce dodává data do staging/import vrstvy. Produkční zápis provádí až Gogrou po validaci a schválení.

## Způsoby Dodávání Dat

Podporované budoucí kanály:

- ruční dodání souboru XLS, CSV nebo JSON
- API push od výrobce do Gogrou staging endpointu
- API pull z výrobce nebo datového portálu
- ToolsUnited nebo podobný katalogový zdroj
- SFTP nebo jiný dávkový přenos
- řízený manufacturer portal v budoucnu

Každý zdroj se ukládá jako importní dávka a prochází stejným řízeným workflow.

## Staging / Import Workflow

Základní workflow:

1. `receive`
   - Přijetí dat od výrobce.
   - Data se uloží jako raw payload nebo raw soubor.

2. `identify_source`
   - Identifikace výrobce, značky, datového kanálu a verze zdroje.

3. `normalize`
   - Převod do interního importního formátu.
   - Normalizace jednotek, názvů polí, enumů, prázdných hodnot a struktur dokumentů.

4. `map`
   - Mapování výrobních polí na GPC strukturu.
   - Oddělení relačních polí, `technical_parameters` a assetů.

5. `validate`
   - Technická a business validace.

6. `diff`
   - Porovnání proti existující produkční GPC položce.

7. `review`
   - Interní kontrola Gogrou týmem.

8. `approve`
   - Schválení změn k publikaci.

9. `publish`
   - Aplikace do produkční GPC.

10. `audit`
   - Zápis auditního logu a verze změn.

## Validace

Validace probíhá před publikací do produkční GPC.

Blokující validace:

- neznámý nebo neschválený výrobce
- chybějící název produktu
- chybějící katalogové číslo výrobce, pokud je pro daný typ povinné
- nevalidní GTIN
- neznámý produktový typ
- nevalidní technické parametry
- nevalidní jednotky
- nevalidní katalogový status
- konflikt identit, například stejný GTIN pro jinou položku

Varování:

- chybějící datasheet
- chybějící STEP/3D model
- chybějící doporučené řezné podmínky
- změna hodnoty mimo očekávanou toleranci
- neznámé externí pole
- změna náhrady u ukončeného produktu

Validace se skládá z automatické části a interního review.

## Schválení Změn

Schválení provádí Gogrou tým.

Schvalovací režimy:

- `auto_reject` - blokující chyba, změna se nepustí dál
- `requires_review` - změna vyžaduje ruční kontrolu
- `approved` - změna je schválena k publikaci
- `rejected` - změna je zamítnuta
- `approved_with_notes` - změna je publikována s interní poznámkou

Citlivé změny vždy vyžadují review:

- změna GTIN
- změna výrobce
- změna produktového typu
- změna katalogového statusu na `discontinued` nebo `archived`
- změna náhrady
- výrazná změna klíčového technického parametru
- odstranění dokumentace nebo STEP/3D modelu

## Update Workflow

Aktualizace existující položky probíhá jako diff proti produkční GPC.

Import porovná:

- identifikátory
- název
- katalogové číslo výrobce
- GTIN
- produktový typ
- technické parametry
- katalogový status
- assety
- náhradní položky

Výsledek diffu:

- `unchanged` - beze změny
- `changed` - běžná aktualizace
- `sensitive_change` - změna vyžaduje review
- `conflict` - konflikt identit nebo dat
- `new_asset_version` - nová verze dokumentu nebo modelu

Publikace aktualizace musí vytvořit auditní záznam a novou verzi GPC položky nebo změnového záznamu.

## Lifecycle Update Workflow

Výrobce může dodat informaci o katalogovém lifecycle produktu, ale Gogrou ji musí schválit.

GPC katalogové statusy:

- `draft`
- `active`
- `phase_out`
- `discontinued`
- `archived`

Příklady lifecycle změn:

- nový produkt: `draft` -> `active`
- výběhová položka: `active` -> `phase_out`
- ukončený produkt: `phase_out` -> `discontinued`
- interní archivace: `discontinued` -> `archived`

Lifecycle změna má vždy obsahovat:

- zdroj informace
- datum účinnosti, pokud existuje
- důvod změny
- doporučenou náhradu, pokud existuje
- auditní metadata

## Ukončené Položky

Ukončené položky se v GPC nemažou.

Pravidla:

- ukončená položka dostane status `discontinued`
- pokud existuje náhrada, propojí se přes replacement vazbu
- historická identita položky zůstává zachovaná
- datasheet a dokumentace zůstávají dostupné, pokud je lze legálně uchovat
- ukončení položky musí být auditované

Pokud výrobce dodá hromadný seznam ukončených položek, import vytvoří diff a vyžádá si interní review.

## Nové Produkty

Nový produkt od výrobce nevstupuje přímo do produkční GPC.

Workflow:

1. výrobce dodá data
2. import vytvoří staging záznam
3. Gogrou provede validaci a mapování
4. produkt vznikne jako `draft`
5. po kontrole se změní na `active`

Nový produkt musí mít minimálně:

- výrobce
- název
- produktový typ
- katalogové číslo výrobce nebo jiný stabilní identifikátor
- technické parametry v rozsahu potřebném pro GPC

## Datasheet Updates

Datasheet update se eviduje jako asset update.

Pravidla:

- stará verze se nemaže bez auditní stopy
- nová verze dostane vlastní metadata
- ukládá se zdroj a čas dodání
- pokud se změnil obsah technických parametrů, musí vzniknout samostatný diff

Datasheet nesmí být jediným zdrojem pravdy pro technické parametry bez validace.

## STEP / 3D Model Updates

STEP/3D modely jsou technické assety navázané na produktovou kartu.

Pravidla:

- model má vlastní typ assetu nebo metadata
- verze modelu musí být auditovaná
- změna modelu může vyžadovat review, pokud souvisí se změnou geometrie
- nevalidní nebo nekompletní model se nepoužije jako produkční asset

V budoucnu může být nad modely doplněna automatická kontrola formátu, velikosti a kompatibility.

## Audit Log Změn

Každá výrobní integrace musí vytvářet auditní stopu.

Audit má obsahovat:

- výrobce
- integrační kanál
- importní dávku
- actor nebo system actor
- původní hodnoty
- nové hodnoty
- schvalovatele
- čas schválení
- čas publikace
- zdrojový payload nebo referenci na něj

Navržené auditní akce:

- `gpc.manufacturer_import.received`
- `gpc.manufacturer_import.validated`
- `gpc.manufacturer_import.approved`
- `gpc.manufacturer_import.rejected`
- `gpc.manufacturer_update.published`
- `gpc.manufacturer_lifecycle.changed`
- `gpc.manufacturer_asset.updated`
- `gpc.manufacturer_import.rollback`

## Versioning

Versioning má umožnit zjistit, jak produkt vypadal před změnou a po změně.

Minimální model:

- aktuální produkční stav je v GPC tabulkách
- každá změna má auditní záznam
- důležité importy ukládají `before_data` a `after_data`
- každá importní dávka má vlastní identifikátor

Budoucí rozšíření:

- explicitní tabulka verzí produktových karet
- explicitní verze assetů
- diff viewer pro interní review
- možnost obnovit vybrané pole nebo celý produkt na předchozí verzi

## Rollback

Rollback je interní Gogrou operace.

Rollback může znamenat:

- vrácení jedné změny pole
- vrácení celé produktové karty na předchozí verzi
- deaktivaci chybně publikovaného assetu
- vrácení lifecycle statusu
- zrušení celé importní dávky, pokud ještě nebyla publikovaná

Rollback musí být auditovaný stejně jako běžná změna.

Rollback nesmí mazat historii. Má vytvořit novou korekční změnu.

## Bezpečnost

Bezpečnostní principy:

- výrobce nemá přímý produkční write access
- každý integrační kanál má vlastní identitu
- API přístup používá tokeny nebo podpisy požadavků
- každý payload se loguje nebo ukládá s referencí
- importní dávky mají rate limiting a velikostní limity
- přílohy a modely procházejí kontrolou typu a velikosti
- citlivé změny vyžadují review
- publikace do produkční GPC je oddělená od příjmu dat

Přístupová práva:

- `manufacturer_submitter` - může dodat data do staging vrstvy
- `gogrou_reviewer` - může kontrolovat a komentovat změny
- `gogrou_approver` - může schválit publikaci
- `gogrou_admin` - může řešit rollback, konflikty a nastavení integrace

## API Integrations

API integrace jsou budoucí směr, ne aktuální implementace.

Možné endpointy:

- `POST /api/gpc/import/manufacturer/{manufacturerId}/batch`
- `GET /api/gpc/import/manufacturer/{manufacturerId}/batch/{batchId}`
- `POST /api/gpc/import/manufacturer/{manufacturerId}/assets`
- `POST /api/gpc/import/manufacturer/{manufacturerId}/lifecycle`

Tyto endpointy by zapisovaly pouze do staging/import vrstvy, ne přímo do produkční GPC.

## Push / Pull Model

Push model:

- výrobce posílá změny do Gogrou
- vhodné pro aktivní výrobce a automatizované aktualizace
- vyžaduje autentizaci, rate limiting a payload validaci

Pull model:

- Gogrou pravidelně stahuje data z výrobního API, portálu nebo zdroje
- vhodné pro výrobce, kteří poskytují stabilní datový feed
- vyžaduje plánování synchronizace a detekci změn

Hybridní model:

- výrobce posílá notifikaci o změně
- Gogrou si následně stáhne aktuální data

## Budoucí Automatické Synchronizace

Automatická synchronizace může postupně pokrýt:

- nové produkty
- změny parametrů
- ukončené položky
- nové datasheety
- nové STEP/3D modely
- změny doporučených náhrad

Automatická synchronizace neznamená automatickou publikaci. Publikace do produkční GPC zůstává řízená validací, pravidly a rolí Gogrou týmu.

Nízkorizikové změny mohou být v budoucnu auto-approved podle pravidel. Citlivé změny vždy zůstávají v review režimu.

## Role Gogrou Týmu

Gogrou tým je gatekeeper produkční GPC.

Odpovědnosti:

- nastavuje integrační pravidla pro výrobce
- spravuje mapování polí
- řeší konflikty identit
- kontroluje validační chyby
- schvaluje citlivé změny
- publikuje data do produkční GPC
- provádí rollback
- komunikuje s výrobcem při nejasnostech

Tím zůstává GPC validovanou master databankou a ne otevřeným zápisovým prostorem externích subjektů.

## Neřešené Věci

Tento dokument záměrně neřeší:

- implementaci API
- UI pro výrobce
- UI pro interní review
- GSS
- konkrétní parsery souborů
- konkrétní smluvní obchodní podmínky výrobců
