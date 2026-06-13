# MVP Status

Tento dokument mapuje aktualni stav projektu Gogrou v checkoutu branche `mvp/gogrou-mvp-baseline`.

Poznamka ke stavu: pri inventure obsahoval pracovni strom i necommitnute a untracked soubory. Casti oznacene jako rozpracovane nebo experiment jsou proto popsane podle aktualniho checkoutu, ne nutne jako stabilni pushnuta baseline.

## 1. Prehled projektu

Gogrou je digitální infrastruktura pro spolupráci průmyslových firem. Aktuální repozitář představuje MVP implementaci této vize.

GPC je centrální zdroj pravdy (Source of Truth) pro produkty.

Architektura je od začátku navržena jako multi-tenant.

Hlavni moduly v aktualnim projektu:

- GPC: produktovy katalog a PostgreSQL-backed API.
- GSS: tenantovy skladovy system nad localStorage.
- Gogrou App Shell: lokalni tenant shell a prepinani aktivni organizace.
- Registrace a admin organizaci: localStorage sprava organizaci a modulu.
- STM / servisni workflow: servisni terminal a ServiceShipment skeleton uvnitr GSS.
- Dokumentacni vrstva: core architecture dokumenty a `docs/brain`.
- Rozpracovane/experimenty: Kooperace a Kapacity, GPC manufacturing assets experiment, legacy GSS company route.
- Placeholder moduly: AI Assistant a SmartSplit.

Pouzite technologie:

- Next.js `14.1.0`.
- React `18.2.0`.
- App Router v adresari `app/`.
- PostgreSQL klient `pg`.
- SQL schema a seed soubory v `db/`.
- localStorage pro tenant demo, GSS data, organizace a rozpracovane moduly.
- Primarne inline styly v React komponentach.

Zakladni architektura:

- UI a route jsou v `app/`.
- GPC API route jsou v `app/api/gpc/...`.
- GPC repository/service vrstva je v `lib/gpc/...`.
- GSS helpery pro konstanty, storage, sklad a pohyby jsou v `lib/gss/...`.
- GPC schema je v `db/init/001_gpc_schema.sql`, seed v `db/init/002_gpc_seed.sql`, snapshot v `db/gpc_schema.sql`.
- Dokumentace je v `docs/`, vcetne `docs/brain`.

## 2. Implementovane moduly

### GPC

- Ucel: Validovana master produktova databanka.
- Aktualni stav: Castecne implementovano. Existuje frontend katalog, detail produktu, editacni demo obrazovka, PostgreSQL schema, seed data, API route a repository/service vrstva.

### GSS

- Ucel: Tenantovy skladovy a provozni system pro nastroje, skladove stavy, DM/QID kusy, vydej, navrat, rezervace a servis.
- Aktualni stav: Implementovany localStorage MVP v `/app/gss`. Obsahuje hlavni terminalovy UI tok, prevzeti GPC polozky, lokalni polozky, prijem, vydej, navrat z vyroby, rezervace, DM tracking, servisni terminal, prijem z brouseni a ServiceShipment skeleton. DM/QID tracking jednotlivých kusů nástrojů je součástí MVP.

### STM / servisni workflow

- Ucel: Servisni pohled pro praci s DM/QID kusy a servisnimi zasilkami.
- Aktualni stav: Castecne implementovano uvnitr `/app/gss`. Existuje servisni terminal M-technologies, zapis parametru po brouseni, stitek nastroje, ServiceShipment skeleton, detail servisni zasilky a non-DM pocty hotovo/neostreno.

### Gogrou App Shell

- Ucel: Zakaznicky tenant shell pro aktivni organizaci a aktivovane moduly.
- Aktualni stav: Implementovano jako localStorage MVP v `/app`. Nacita `gogrou_organizations`, nastavuje `activeOrganizationId` a zobrazuje dostupne moduly.

### Registrace organizace

- Ucel: Vytvoreni organizace/tenantu do Gogrou.
- Aktualni stav: Implementovano jako localStorage MVP v `/register`. Vytvari organizaci, prefix, company data, vybrane moduly a trial subscription data.

### Admin organizaci

- Ucel: Interni MVP sprava organizaci.
- Aktualni stav: Castecne implementovano v `/admin/organizations` a `/admin/organizations/[organizationId]`. Umi nacist organizace z localStorage, vytvaret organizaci, menit stav/billing a otevrit GSS firmy nastavenim `activeOrganizationId`.

### AI Assistant

- Ucel: Budouci AI asistent.
- Aktualni stav: Placeholder stranka `/ai`.

### SmartSplit

- Ucel: Samostatny demo/placeholder modul.
- Aktualni stav: Placeholder/demo stranka `/ss`.

### Kooperace a Kapacity

- Ucel: Modul pro stroje, schopnosti, materialy a kapacitni signaly nad existujici organizaci.
- Aktualni stav: Rozpracovane v pracovnim stromu v `/app/cooperation`, navazane na `lib/experiments/gpc-manufacturing-assets/...` a localStorage klice `gogrou_cooperation_${organizationId}_...`.

### GPC manufacturing assets experiment

- Ucel: Experiment pro katalog stroju, firemni stroje, schopnosti, RFQ a marketplace/network pohled.
- Aktualni stav: Experiment v `/experiments/gpc-manufacturing-assets`, `lib/experiments/...` a `db/experiments/...`.

### Gogrou Brain

- Ucel: Znalostni baze pro vyvojare, budouci AI agenty, architekturu, rozhodnuti a business pravidla.
- Aktualni stav: Inicializovana kostra dokumentu v `docs/brain`.

## 3. Datovy model

Hlavni entity a vztahy:

- Organization / tenant: Zakladni firma v Gogrou. Ukladana v localStorage klici `gogrou_organizations`.
- Active organization: Aktualni tenant vybrany pres localStorage klic `activeOrganizationId`.
- Module activation: Organizace obsahuje `selectedModules` / `activatedModules`, stav organizace, billing status a trial/subscription metadata.
- GPC manufacturer: Vyrobce v GPC databazi.
- GPC product type: Typ produktu v GPC databazi.
- GPC product card: Master produktova karta, navazana na vyrobce a typ produktu.
- GPC GTIN: Identifikatory navazane na produktovou kartu.
- GPC attachment: Prilohy a assety produktu.
- GPC validation: Validacni zaznamy produktu.
- GPC audit log: Auditni zaznamy GPC zmen.
- GSS warehouse item: Tenantova skladova polozka prevzata z GPC nebo vytvorena lokalne.
- GSS stock summary: Agregovane skladove stavy polozky.
- Tenant settings: Provozni nastaveni GSS polozky, napr. min/max, DM tracking, brousitelnost, blokace.
- DM/QID item: Konkretni fyzicky kus nastroje s DM kodem, QID, stavem, lokaci, rozmery a historií.
- Movement record: Pohyb skladove polozky nebo DM kusu.
- Reservation: Rezervace konkretniho kusu nebo mnozstvi pro zakazku/technologii.
- Purchase proposal / system order: Objednavkovy navrh v GSS pro nove nastroje.
- ServiceShipment: Servisni zasilka od zakaznika k servisnimu partnerovi.
- ServiceShipmentItem: Polozka servisni zasilky, DM nebo mnozstevni non-DM.
- ServiceShipment history: Historie zmen a udalosti servisni zasilky.
- CompanyMachine / CompanyCapability: Rozpracovane entity Kooperace a Kapacity v localStorage.
- RFQ / network / capacity signal: Entity v GPC manufacturing assets experimentu.

## 4. API

Existujici API endpointy:

- `GET /api/gpc/health`: Overuje pripojeni k GPC databazi.
- `GET /api/gpc/products`: Vraci seznam GPC produktu pres `productsService.listProducts()`.
- `GET /api/gpc/products/filter`: Filtruje produkty podle podporovanych parametru `manufacturer`, `product_type`, `status`, `validation_status`.
- `GET /api/gpc/products/search`: Vyhledava produkty podle podporovanych parametru `diameter`, `material`, `coating`, `flute_count`.
- `GET /api/gpc/products/gpc/[gpcId]`: Vraci detail produktu podle GPC ID.
- `PATCH /api/gpc/products/gpc/[gpcId]`: Meni katalogovy status produktu pres lifecycle service.
- `GET /api/gpc/products/gpc/[gpcId]/assets`: Vraci assety/prilohy produktu podle GPC ID.
- `GET /api/gpc/products/gtin/[gtin]`: Vraci detail produktu podle GTIN.

V API souborech jsou TODO poznamky k pagination, auth/RBAC, tenant isolation, audit logging, caching, signed URLs, CDN, OCR a AI enrichment.

## 5. Uzivatelske obrazovky

Existujici stranky a obrazovky:

- `/`: Uvodni rozcestnik Gogrou Demo.
- `/dashboard`: Dashboard rozcestnik na moduly.
- `/register`: Registrace nove organizace do Gogrou.
- `/admin/organizations`: Interni sprava organizaci.
- `/admin/organizations/[organizationId]`: Detail organizace a vstup do GSS firmy.
- `/app`: Zakaznicky tenant shell a seznam aktivnich modulu.
- `/app/gss`: Hlavni GSS MVP obrazovka.
- `/app/cooperation`: Rozpracovany modul Kooperace a Kapacity v pracovnim stromu.
- `/gpc`: Frontend GPC katalog.
- `/gpc/[id]`: Detail GPC polozky.
- `/gpc/[id]/edit`: Editacni demo/prototyp GPC polozky.
- `/gss`: Legacy/prototyp GSS route.
- `/gss/company`: Legacy/prototyp zalozeni firmy pro starou GSS vetvu.
- `/gss/company/[companyId]`: Legacy/prototyp sklad firmy.
- `/gss/company/[companyId]/item/[gpcId]`: Legacy/prototyp detailu polozky firmy v pracovnim stromu.
- `/experiments/gpc-manufacturing-assets`: Experiment pro GPC katalog vyrobnich prostredku.
- `/ai`: Placeholder AI Assistant.
- `/ss`: Placeholder/demo SmartSplit.

## 6. Co je jiz funkcni

Funkcionality implementovane v kodu:

- Next.js aplikace s App Routerem.
- Production build pro aktualni stav prosel pri posledni kontrole.
- LocalStorage registrace organizace pres `/register`.
- LocalStorage interna sprava organizaci pres `/admin/organizations`.
- Nastaveni aktivni organizace pres `activeOrganizationId`.
- Vstup do GSS firmy z detailu organizace.
- Zakaznicky `/app` shell pro vybranou organizaci a aktivovane moduly.
- GPC frontend katalog nad mock daty v `app/gpc/data.js`.
- GPC detail a editacni demo obrazovka.
- GPC PostgreSQL schema, seed a API route.
- GSS tenant sklad v localStorage klici `gss_wh_${organizationId}_MAIN`.
- Prevzeti GPC polozky do GSS skladu.
- Vytvoreni lokalni nevalidovane GSS polozky.
- Nastaveni GSS polozky: min/max, DM tracking, brousitelnost a dalsi tenant provozni nastaveni.
- Naskladneni polozky.
- Vydej do vyroby.
- Kontextove hledani pro navrat z vyroby.
- Navrat z vyroby.
- Rezervace, release code a override vydej rezervovaneho DM kusu.
- DM tracking a vytvareni konkretniho DM/QID kusu.
- QID generovani.
- Evidence aktualnich provoznich rozmeru DM kusu.
- Odeslani DM kusu na brouseni.
- Servisni terminal M-technologies pro nacteni DM/QID kusu, zapis parametru a stitek.
- Prijem konkretniho DM/QID kusu z brouseni.
- ServiceShipment skeleton v GSS, vcetne demo zasilky, vyhledani zasilky, detailu, DM a non-DM polozek.
- Non-DM servisni polozka: hotovo/neostreno/poznamka.
- Movement history v GSS.
- Objednavkovy navrh / purchase proposal v GSS.
- Dokumentacni kostra Gogrou Brain.

## 7. Co je rozpracovane

Rozpracovane nebo castecne oblasti v aktualnim checkoutu:

- Kooperace a Kapacity: existuje localStorage prototyp a route `/app/cooperation`, ale je vedeny jako rozpracovany/untracked stav.
- GPC manufacturing assets experiment: existuje experiment s daty, matchingem, RFQ a DB experimenty.
- Legacy GSS company route: existuji stranky `/gss/company...` s vlastnim localStorage modelem `gss_companies`.
- GSS docs maji necommitnute casti ke kontextovemu vyhledavani.
- README ma necommitnute onboarding zmeny.
- GPC TextInput refactor je pritomny v pracovnim stromu jako necommitnuta zmena.
- `app/gss/[id]/page.jsx` je v pracovnim stromu smazany, ale deletion nebyl resen jako soucast posledni MVP baseline prace.
- `docs/GSS_CUSTOMER_SERVICE_FLOW.md` je untracked dokumentacni soubor.
- Backupy a debug dumpy jsou pritomne jako untracked soubory.

## 8. Co zatim neni implementovano

Jednoznacne identifikovane z README, API TODO a dokumentace:

- Realny auth provider.
- Serverova session.
- Produkcni role/RBAC enforcement.
- PostgreSQL tenant/organization schema pro GSS/tenanty.
- GSS backend API.
- GSS PostgreSQL schema.
- Multi-user synchronizace GSS dat.
- Row-Level Security.
- Produkcni audit log pro GSS a tenant akce.
- Produkcni migration framework.
- Test framework.
- Pagination ve vybranych GPC API.
- Tenant isolation v GPC API.
- Signed URLs / CDN / preview generation pro GPC assety.
- OCR a AI extraction pro GPC assety.
- Plny production workflow pro ServiceShipment/ReturnShipment, PDF/DL, prijem navratove zasilky a vyrazeni neostrenych polozek.
- Produkcni AI/GINA funkcionalita.

## 9. Dokumentace

Dulezite dokumenty:

- `README.md`: Technicky onboarding a mapa projektu v pracovnim stromu; aktualne je soubor lokalne modifikovany.
- `docs/GOGROU_APP_STRUCTURE.md`: Struktura aplikace, tenant, moduly a route.
- `docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`: Globalni architektonicke principy.
- `docs/GPC_GOVERNANCE_MODEL.md`: Governance GPC.
- `docs/GPC_IMPORT_LAYER.md`: Importni vrstva GPC.
- `docs/GPC_MANUFACTURER_INTEGRATION.md`: Integrace vyrobcu do GPC.
- `docs/GSS_MVP_SCOPE.md`: Rozsah GSS MVP.
- `docs/GSS_MVP_IMPLEMENTATION_PLAN.md`: Implementacni plan GSS MVP.
- `docs/GSS_CUSTOMER_SERVICE_FLOW.md`: Untracked procesni dokument v aktualnim pracovnim stromu.
- `docs/brain/README.md`: Vstup do Gogrou Brain.
- `docs/brain/brain-001-vize-gogrou.md`: Kostra vize Gogrou.
- `docs/brain/brain-002-gpc.md`: Kostra GPC knowledge base.
- `docs/brain/brain-003-gss.md`: Kostra GSS knowledge base.
- `docs/brain/brain-004-stm.md`: Kostra STM knowledge base.
- `docs/brain/brain-005-gina.md`: Kostra GINA knowledge base.
- `docs/brain/brain-006-maxlife.md`: Kostra MaxLife knowledge base.
- `docs/brain/brain-007-kooperace-a-kapacity.md`: Kostra Kooperace a Kapacity.
- `docs/brain/brain-008-architektura.md`: Kostra architektonicke knowledge base.
- `docs/brain/brain-009-decision-log.md`: Kostra decision logu.

Architektonicke poznamky jsou rozdelene mezi core architecture dokument, GSS/GPC dokumenty a Brain dokumenty. Cast dalsiho stavu je take popsana primo v TODO komentarich v API souborech.

## 10. Doporuceni pro noveho vyvojare

Pro prvni orientaci:

1. Precist `README.md` pro zakladni mapu projektu a prikazy.
2. Precist `docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md` pro globalni pravidla.
3. Precist `docs/GOGROU_APP_STRUCTURE.md` pro tenant model, route a moduly.
4. Precist `docs/GSS_MVP_SCOPE.md` a `docs/GSS_MVP_IMPLEMENTATION_PLAN.md` pro GSS.
5. Precist `docs/GPC_GOVERNANCE_MODEL.md`, `docs/GPC_IMPORT_LAYER.md` a `docs/GPC_MANUFACTURER_INTEGRATION.md` pro GPC.
6. Projít `docs/brain/README.md` a jednotlive `docs/brain/brain-*.md` jako kostru znalostni baze.
7. Podivat se na `package.json`, aby bylo jasne, jake prikazy a technologie projekt pouziva.
8. Pro GPC kod zacit v `app/api/gpc/...`, `lib/gpc/...` a `db/init/001_gpc_schema.sql`.
9. Pro GSS kod zacit v `app/app/gss/page.jsx` a potom v `lib/gss/...`.
10. Pro tenant/organizace zacit v `app/register/page.jsx`, `app/admin/organizations/page.jsx`, `app/admin/organizations/[organizationId]/page.jsx` a `app/app/page.jsx`.

Hlavni zdroje pravdy:

- Pro architektonicke principy: `docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.
- Pro route a tenant strukturu: `docs/GOGROU_APP_STRUCTURE.md`.
- Pro aktualni GSS implementaci: `app/app/gss/page.jsx`.
- Pro GSS rozsah a procesy: `docs/GSS_MVP_SCOPE.md` a `docs/GSS_MVP_IMPLEMENTATION_PLAN.md`.
- Pro GPC backend a schema: `app/api/gpc/...`, `lib/gpc/...`, `db/init/001_gpc_schema.sql`.
- Pro znalostni kostru a budoucí agentni kontext: `docs/brain/...`.

Pred dalsi praci by novy vyvojar mel zkontrolovat `git status --short`, protoze aktualni checkout obsahuje rozpracovane zmeny mimo stabilni MVP baseline.
