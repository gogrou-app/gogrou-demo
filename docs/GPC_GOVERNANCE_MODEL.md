# GPC Governance Model

## Cíl

Tento dokument navrhuje governance a approval model pro správu validované GPC databanky.

GPC zůstává centrálně kontrolovaná validovaná databanka Gogrou. Externí subjekty mohou dodávat data nebo podněty, ale produkční změny v GPC podléhají řízenému schválení.

Dokument popisuje architekturu a workflow. Neřeší frontend, GSS ani implementaci auth systému.

## Principy

Základní pravidla:

- GPC obsahuje pouze validované master položky.
- Produkční GPC není otevřený zápisový prostor.
- Každá významná změna má auditní stopu.
- Citlivé změny vyžadují lidské schválení.
- Výrobce nemá přímý write access do produkční GPC.
- AI může doporučovat, ale nepublikuje změny bez pravidel a odpovědné role.
- Rollback je auditovaná korekční změna, ne mazání historie.

## Role v Systému

Navržené role:

- `manufacturer_submitter`
- `gogrou_import_operator`
- `gogrou_validator`
- `gogrou_approver`
- `gogrou_publisher`
- `gogrou_admin`
- `gogrou_auditor`
- `system_integration`
- `ai_assistant`

Role mohou být v MVP sloučené, ale governance model je navržený tak, aby šel později rozdělit pomocí RBAC nebo ABAC.

## Role Výrobce

Výrobce je externí zdroj dat.

Může:

- dodat nová produktová data
- dodat aktualizace parametrů
- dodat datasheety, návody, výkresy a STEP/3D modely
- oznámit ukončení položky
- navrhnout náhradu
- opravit vlastní zdrojová data ve staging/import vrstvě

Nesmí:

- zapisovat přímo do produkční GPC
- schvalovat vlastní změny pro produkci
- publikovat změny
- provádět rollback
- řešit konflikty napříč výrobci
- archivovat produkční GPC položky

## Role Gogrou Validátora

Gogrou validátor je odborná role odpovědná za kvalitu dat.

Může:

- kontrolovat importní dávky
- validovat technické parametry
- kontrolovat mapování externích polí
- řešit běžné validační chyby
- navrhovat opravy
- označit změnu jako připravenou ke schválení
- zamítnout nekvalitní nebo neúplná data

Nesmí typicky:

- publikovat citlivé změny bez approval role
- provádět emergency rollback bez administrátora
- měnit governance pravidla

## Role Administrátora

Administrátor je nejvyšší interní role pro správu GPC governance.

Může:

- nastavovat role a oprávnění
- řešit konflikty identit
- provádět emergency rollback
- archivovat položky podle pravidel
- upravovat mapping pravidla
- spravovat integrační kanály výrobců
- řešit bezpečnostní incidenty
- dočasně pozastavit importní kanál

Administrátor nemá být běžnou rolí pro každodenní publikaci. Je to role pro kontrolu, výjimky a obnovu.

## Matice Pravomocí

| Akce | Výrobce | Import operator | Validátor | Approver | Publisher | Admin |
| --- | --- | --- | --- | --- | --- | --- |
| dodat data do staging | ano | ano | ano | ano | ano | ano |
| vytvořit draft položku | ne | ano | ano | ano | ano | ano |
| upravit staging data | omezeně | ano | ano | ano | ano | ano |
| upravit produkční položku | ne | ne | návrh | schválení | publikace | ano |
| schválit změnu | ne | ne | doporučení | ano | ne | ano |
| publikovat změnu | ne | ne | ne | ne | ano | ano |
| archivovat položku | ne | ne | návrh | schválení | publikace | ano |
| řešit konflikt | ne | eskalace | ano | ano | ne | ano |
| rollback | ne | ne | návrh | schválení | ne | ano |

V MVP mohou být `approver` a `publisher` stejná osoba, ale audit musí rozlišit, kdo změnu schválil a kdo ji publikoval, pokud jsou role oddělené.

## Vytváření Položek

Nová GPC položka vzniká vždy řízenou cestou:

1. data dorazí do staging/import vrstvy
2. importer vytvoří kandidáta
3. kandidát projde validací
4. vznikne GPC draft
5. validátor zkontroluje data
6. approver schválí zařazení
7. publisher publikuje položku jako `active`

Nová položka nesmí vzniknout přímým zápisem od výrobce ani automaticky z GSS.

## Úpravy Položek

Úpravy existujících položek se provádějí přes diff.

Každá změna má obsahovat:

- původní hodnotu
- novou hodnotu
- zdroj změny
- důvod změny
- validátora
- schvalovatele
- auditní metadata

Nízkorizikové změny mohou mít zjednodušené workflow, například oprava překlepu nebo doplnění neblokujícího assetu. Citlivé změny vždy vyžadují approval.

## Approval Workflow

Základní workflow:

1. `submitted`
   - změna byla přijata do staging/import vrstvy

2. `validated`
   - automatická validace prošla

3. `reviewed`
   - Gogrou validátor zkontroloval změnu

4. `approved`
   - odpovědná role schválila změnu

5. `published`
   - změna byla zapsána do produkční GPC

6. `audited`
   - vznikl auditní záznam

Alternativní stavy:

- `rejected`
- `needs_more_data`
- `conflict`
- `cancelled`
- `rolled_back`

## Víceúrovňové Schvalování

Víceúrovňové schvalování je vhodné pro citlivé změny.

Příklady:

- změna GTIN
- změna výrobce
- změna produktového typu
- změna lifecycle statusu na `discontinued` nebo `archived`
- změna náhrady
- hromadný import od výrobce
- hromadné ukončení produktové řady
- změna parametrů, které ovlivňují AI doporučení, alternativy nebo normativy

Model:

1. technická validace
2. datový review
3. business approval
4. publikace

Pro nejcitlivější změny může být vyžadováno pravidlo "four-eyes principle": validátor a approver nesmí být stejná osoba.

## Lifecycle Approvals

Lifecycle změny mají samostatnou governance.

Statusy GPC položky:

- `draft`
- `active`
- `phase_out`
- `discontinued`
- `archived`

Schvalovací pravidla:

- `draft` -> `active`: vyžaduje validaci a approval
- `active` -> `phase_out`: vyžaduje důvod a ideálně náhradu
- `phase_out` -> `discontinued`: vyžaduje potvrzení zdroje
- `discontinued` -> `archived`: vyžaduje administrativní schválení
- jakýkoli návrat z `archived`: vyžaduje admin approval

Lifecycle změna musí být auditovaná a musí obsahovat zdroj informace.

## Konflikty

Konflikt nastává například při:

- stejném GTIN pro dvě různé položky
- rozdílných parametrech z více zdrojů
- neshodě mezi výrobcem a existující GPC položkou
- duplicitním katalogovém čísle výrobce
- změně identity položky

Řešení konfliktu:

1. změna se zastaví ve staging vrstvě
2. validátor provede analýzu
3. podle závažnosti eskaluje na approvera nebo admina
4. výsledek se zapíše do audit logu
5. až potom může změna pokračovat do publikace

## Archivace Položek

Archivace není smazání.

Archivovat lze pouze položku, která už nemá být aktivně používaná jako běžný master záznam.

Pravidla:

- archivace vyžaduje schválení
- archivace musí být auditovaná
- historická identita položky zůstává zachovaná
- vazby na náhrady a dokumentaci se nemažou bez zvláštního důvodu
- položku lze v budoucnu dohledat pro historické účely

## Rollback

Rollback je řízená korekční operace.

Běžný rollback:

- navrhne validátor nebo approver
- schválí approver nebo admin
- provede publisher nebo admin
- zapíše se audit

Emergency rollback:

- používá se při chybné publikaci s dopadem na produkční GPC
- může ho provést administrátor
- musí vzniknout okamžitý auditní záznam
- po zásahu musí následovat post-incident review

Rollback nesmí mazat historii. Má vytvořit novou korekční změnu.

## Audit Změn

Audit je povinný pro všechny významné změny.

Auditní záznam má obsahovat:

- actor
- role actora
- akci
- čas
- dotčenou položku
- zdroj změny
- původní data
- nová data
- approval stav
- schvalovatele
- metadata importu nebo integrace

Příklady auditních akcí:

- `gpc.governance.change_submitted`
- `gpc.governance.change_validated`
- `gpc.governance.change_approved`
- `gpc.governance.change_rejected`
- `gpc.governance.change_published`
- `gpc.governance.lifecycle_approved`
- `gpc.governance.item_archived`
- `gpc.governance.rollback_executed`
- `gpc.governance.conflict_resolved`

## Bezpečnost

Bezpečnostní principy:

- least privilege
- žádný externí přímý write access do produkční GPC
- oddělení staging a produkční vrstvy
- audit všech publikovaných změn
- podpis nebo token pro integrační kanály
- rate limiting pro importy a API integrace
- kontrola příloh a technických souborů
- bezpečné uložení raw payloadů
- detekce duplicit a konfliktů
- oddělení approval a publish role u citlivých změn

## Tenant Isolation

GPC je globální master databanka, ne tenantová zákaznická databáze.

Tenant isolation se týká hlavně přístupu a kontextu:

- zákaznické GSS položky nesmí zapisovat do GPC
- zákazník nesmí vidět interní staging/import informace
- výrobce vidí pouze svoje dodané dávky a stav zpracování, pokud bude mít portal nebo API
- interní Gogrou role vidí data podle oprávnění
- auditní a governance metadata nejsou zákaznická data

Pokud budou výrobci nebo partneři přistupovat do staging vrstvy, musí být izolovaní podle výrobce, kanálu a oprávnění.

## Budoucí RBAC / ABAC Model

RBAC definuje role:

- `manufacturer_submitter`
- `gogrou_import_operator`
- `gogrou_validator`
- `gogrou_approver`
- `gogrou_publisher`
- `gogrou_admin`
- `gogrou_auditor`

ABAC může doplnit podmínky:

- výrobce
- produktový typ
- citlivost změny
- importní zdroj
- země nebo region
- stav položky
- approval status
- emergency režim

Příklad ABAC pravidla:

```text
gogrou_validator může schválit technickou validaci pouze pro product_type, ke kterému má odbornost.
```

RBAC řeší "kdo". ABAC řeší "za jakých podmínek".

## AI Recommendations vs Lidské Schválení

AI může v GPC governance pomáhat, ale nesmí bez pravidel nahrazovat odpovědnou lidskou roli.

AI může:

- navrhnout mapování polí
- najít podobné položky
- upozornit na konflikt
- navrhnout alternativu
- odhadnout chybějící kategorii
- shrnout diff
- označit rizikovou změnu

AI nesmí samostatně:

- publikovat změnu do produkční GPC
- měnit lifecycle status na `discontinued` nebo `archived`
- schválit citlivou změnu
- provést rollback
- řešit právní nebo obchodní odpovědnost za data výrobce

U nízkorizikových změn může AI doporučení vstupovat do automatického pravidla, ale odpovědnost musí zůstat přiřazená konkrétní systémové nebo lidské roli.

## Neřešené Věci

Tento dokument záměrně neřeší:

- frontend
- GSS
- implementaci auth systému
- konkrétní databázové tabulky pro role
- konkrétní identity provider
- právní smluvní rámec s výrobci
