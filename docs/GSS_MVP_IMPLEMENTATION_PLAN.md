# GSS MVP Implementation Plan

## Cíl

Tento dokument popisuje implementační pořadí GSS MVP na úrovni produktové a datové logiky.

Neprogramuje databázi, neřeší detail UI a nezasahuje do GPC.

Gogrou tenant model začíná entitou firma / organizace. GSS MVP používá tento obecný tenant s aktivním modulem `GSS`. GPC zůstává validovaný zdroj master dat.

Registrace firmy není součástí GSS. Cílově vzniká firma přes obecnou registraci Gogrou na `/register`, uživatel po přihlášení vstupuje do `/app` a GSS je dostupné pouze jako modul `/app/gss`, pokud má firma GSS aktivované.

## Výchozí Princip

Gogrou je multi-tenant prostředí. GSS je jeden z modulů, který může být pro firmu aktivní.

GSS není vstupní brána do Gogrou. Firma / organizace je obecný Gogrou tenant a může existovat bez GSS.

Cílová struktura aplikace:

- `/register`: registrace nové firmy do Gogrou
- `/app`: zákaznický portál po přihlášení
- `/app/gss`: GSS modul, pouze pokud má firma aktivní GSS
- `/app/toolshop`: obchodní / nabídky / nákupní modul
- `/app/services`: služby, například broušení, povlakování, kalírna nebo poradenství
- `/admin`: interní Gogrou správa, zatím neprecizovaná

Moduly se v zákaznickém portálu zobrazí podle aktivace, trialu nebo zaplaceného předplatného.

Každá firma / organizace může mít:

- vlastní uživatele
- vlastní role
- aktivní moduly
- typy firmy
- jeden hlavní sklad v GSS MVP, pokud má aktivní modul `GSS`
- vlastní GSS položky, pokud používá GSS
- vlastní DM kusy, pokud používá GSS
- vlastní pohyby, pokud používá GSS
- vlastní ceníky
- vlastní nadnormativy

Firma vidí pouze svá data.

Příklady firem bez GSS:

- obchodní firma může používat Toolshop / nabídky bez GSS
- výrobce nástrojů může používat datový kanál / obchodní vrstvu bez GSS
- službová firma může používat services profil bez GSS

V aktuálním MVP demu jsou firmy uložené v `localStorage`. Produkční implementace bude používat databázi, tenantovou izolaci na úrovni dat a samostatnou auth vrstvu pro přihlášení uživatelů.

Route `/gss` je v MVP interní Gogrou administrační pohled na firmy / organizace. Gogrou tým zde vidí všechny firmy, může firmu vyhledat, otevřít, změnit její stav, vidět billing status, vidět aktivní moduly a ručně firmu aktivovat, pozastavit nebo blokovat.

Tento interní pohled není finální zákaznický portál. Zákazník v budoucnu neuvidí seznam všech firem, ale pouze svůj tenant. Budoucí zákaznický vstup bude oddělený od interní Gogrou administrace.

Firma může mít více aktivních modulů, různé billing stavy a více typů organizace současně. Například:

- výrobní firma + brusírna
- výrobce + toolshop
- obchodník + služby

Budoucí oddělení rolí:

- Gogrou Super Admin
- Gogrou Support/Admin
- zákaznický tenant admin
- běžný zákaznický uživatel

Auth se zatím neimplementuje. MVP pouze připravuje architekturu a texty pro interní administrační vrstvu a oddělený zákaznický tenant portál.

## Etapa 1: Firma, Role, Hlavní Sklad, Základní Lokální Data

Etapa 1 vytváří základ zákaznického prostoru.

### Firma / Organizace / Tenant

Základní atributy:

- název firmy
- zákaznický prefix, například `AH01`
- IČO
- DIČ
- adresa
- země
- výchozí jazyk
- firemní e-mail
- web
- zodpovědná osoba
- e-mail zodpovědné osoby
- telefon zodpovědné osoby
- typy firmy
- vybrané moduly
- aktivované moduly
- subscription plán
- billing status
- payment provider
- datum potvrzení platby
- hlavní sklad
- stav firmy: `draft`, `trial`, `pending_payment`, `active`, `paused`, `blocked`, `archived`

Firma je tenantová hranice. Všechna GSS data musí být vázaná na firmu.

Stavy firmy:

- `draft`: firma je rozepsaná nebo čeká na dokončení registrace.
- `trial`: firma může dočasně používat vybrané moduly.
- `pending_payment`: firma čeká na potvrzení platby nebo objednávky služby.
- `active`: firma má aktivní službu.
- `paused`: firma je dočasně pozastavená.
- `blocked`: firma je zablokovaná.
- `archived`: firma je archivovaná.

Aktivace firmy může proběhnout automaticky po potvrzení platby, ručně administrátorem Gogrou nebo dočasně přes trial režim. Firma může být pozastavena nebo zablokována.

Typy firmy jsou kombinovatelné:

- `manufacturing_company`
- `tool_manufacturer`
- `tool_supplier`
- `coating_service`
- `heat_treatment_service`
- `grinding_service`
- `consulting`
- `trading_company`
- `other`

Aktivní moduly:

- `GSS`
- `GPC supplier data channel`
- `Toolshop`
- `Services`
- `Promitea/RFQ`

Současné MVP flow v `/gss` je dočasný prototyp tenant registrace a GSS flow. Finální registrace firmy bude mimo GSS.

### Subscription / Billing / Fee Model

Firma si při registraci nebo později v administraci vybere moduly Gogrou, které chce používat.

Datový model firmy má být připravený na budoucí billing:

- `selectedModules`
- `subscriptionPlan`
- `billingStatus`
- `paymentProvider`
- `paymentConfirmedAt`
- `activatedModules`

Stavy `billingStatus`:

- `trial`
- `active`
- `past_due`
- `cancelled`

Budoucí workflow:

1. firma vybere moduly
2. systém zobrazí orientační měsíční fee
3. vznikne subscription / objednávka služby
4. uživatel je naveden do platební brány
5. po úspěšné platbě se nastaví `paymentConfirmedAt`
6. systém aktivuje zaplacené moduly v `activatedModules`
7. firma může Gogrou používat

V MVP se neprogramuje platební brána ani konkrétní cenová politika. Model pouze připravuje datovou strukturu. GSS modul může být aktivní pouze tehdy, pokud je zaplacený nebo v trial režimu.

Osoby a kontakty budou později samostatná entita `users` / `contacts`. V MVP stačí základní kontaktní údaje na firmě.

MVP UI pro správu firem má v této etapě umět:

- zobrazit stav firmy
- změnit stav firmy
- zobrazit billing status
- zobrazit aktivní moduly
- zobrazit zodpovědnou osobu

### Uživatelé Firmy

Základní atributy:

- jméno
- e-mail
- telefon
- role
- aktivní/neaktivní
- vazba na firmu

Uživatel může patřit k firmě a pracovat pouze s daty této firmy.

Zodpovědná osoba firmy je hlavní kontaktní osoba tenant účtu. V budoucí produkční vrstvě zakládá nebo schvaluje další uživatele firmy. Přihlášení uživatele bude řešit budoucí auth vrstva, ne `localStorage` demo.

### MVP Role

#### ADMIN

Admin může:

- spravovat firmu
- spravovat uživatele
- nastavovat sklad
- nastavovat položky
- spravovat ERP / automat můstky
- spravovat nadnormativní položky
- vytvářet poptávky a exporty

#### POWER_USER / MISTR

Power user nebo mistr může:

- provádět skladové operace
- naskladnit položku
- vydat položku
- přijmout návrat
- blokovat kus
- řešit broušení
- měnit provozní stav

#### USER / OPERÁTOR

Operátor může:

- hledat položky
- provést výdej
- provést návrat
- skenovat DM
- potvrdit základní operace

### Hlavní Sklad

V GSS MVP má firma s aktivním modulem `GSS` jeden hlavní sklad.

Pravidla:

- bez dceřiných skladů
- všechny položky jsou vázané na firmu a hlavní sklad
- hlavní sklad je výchozí místo pro naskladnění, výdej, návrat, DM evidenci a nadnormativy

### Výsledek Etapy 1

Po etapě 1 existuje zákaznický GSS prostor:

- firma
- uživatelé
- role
- hlavní sklad
- základní lokální datová izolace

## Etapa 2: Převzetí Položky z GPC do GSS

Etapa 2 propojuje GSS s validovaným GPC master katalogem.

Rozsah:

- vyhledání validované položky v GPC
- převzetí položky do GSS firmy
- vytvoření zákaznické GSS položky s vazbou na GPC
- rozlišení validované GPC položky a lokální nevalidované položky
- uložení základní zákaznické identity položky v hlavním skladu

Pravidlo:

- GPC položka se v GSS neupravuje jako master data
- zákaznické provozní nastavení vzniká až v GSS

## Etapa 3: Lokální Nastavení Položky

Etapa 3 dává převzaté nebo lokální položce zákaznický provozní kontext.

Rozsah:

- `min`
- `max`
- `warning`
- DM tracking ano/ne
- brousitelnost ano/ne
- max počet přebroušení
- poznámky
- blokace položky
- blokace konkrétního kusu

Tato nastavení jsou tenantová. Stejná GPC položka může mít pro různé zákazníky rozdílná GSS pravidla.

## Etapa 4: DM Kusy a Skladové Operace

Etapa 4 zavádí provozní život konkrétních kusů.

Rozsah:

- evidence DM kusu
- stav kusu
- naskladnění
- výdej
- návrat
- broušení
- aktualizace rozměrů po broušení
- zákaz výdeje konkrétního kusu
- historie pohybů

Pohyby musí být auditované a vázané na firmu, hlavní sklad, položku a případně konkrétní DM kus.

## Další Etapy po MVP Základu

Po etapách 1-4 mohou navazovat:

- nadnormativní položky
- poptávky / Promitea XLS export
- ceníky / Toolshop logika
- datové můstky ERP / automat
- import/export pohybů
- pokročilé reporty

Tyto oblasti mají být připravené v datové logice, ale nemusí být plně implementované v první technické etapě.

## Co Se Zatím Neprogramuje

Záměrně se zatím neprogramuje:

- finální DB schema
- detailní auth systém
- detail UI
- GPC změny
- plná ERP integrace
- plná automat integrace
- víceúrovňové schvalování
