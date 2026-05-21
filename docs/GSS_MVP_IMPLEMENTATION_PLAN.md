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
- založení lokální nevalidované tenant položky, pokud položka v GPC neexistuje
- uložení základní zákaznické identity položky v hlavním skladu

Pravidlo:

- GPC položka se v GSS neupravuje jako master data
- zákaznické provozní nastavení vzniká až v GSS
- GSS nekopíruje kompletní GPC data
- GSS ukládá pouze `gpc_id`, `gtin` a případný malý snapshot pro rychlé zobrazení
- lokální nevalidovaná položka má `origin = LOCAL`, `validationStatus = unvalidated` a `tenantOnly = true`
- lokální nevalidovaná položka existuje pouze v dané organizaci a nemění GPC
- lokální nevalidovaná položka může později sloužit jako podnět k validaci a propojení s GPC

Technická data, obrázky, datasheety, 3D modely a odkazy zůstávají v GPC. GSS je načítá přes `gpc_id`.

GSS ukládá pouze tenant provozní data:

- min/max
- warning
- stock
- DM kusy
- broušení
- lokální poznámky
- blokace
- nadnormativní nabídky

### Minimální Validace Lokální Nevalidované Položky

Nejde o plnou GPC validaci ani o finální parametrické šablony. MVP musí pouze zabránit tomu, aby GSS přijalo provozně nepoužitelnou lokální položku.

Společná povinná pole:

- název položky
- typ položky
- výrobce nebo `neznámý`
- alespoň jeden identifikační údaj: GTIN, interní kód zákazníka nebo stručný popis / rozměr

Pro vrták / frézu se navíc vyžaduje:

- průměr
- délka nebo poznámka k rozměru
- materiál nebo `neznámý`

Pro břitovou destičku se navíc vyžaduje:

- tvar / typ
- rozměr nebo označení
- materiál nebo `neznámý`

Pokud povinná data chybí, položka se neuloží a uživatel vidí hlášku:

`Pro založení lokální položky je nutné doplnit minimální povinné údaje.`

## Etapa 3: Lokální Nastavení Položky

Etapa 3 dává převzaté nebo lokální položce zákaznický provozní kontext.

Rozsah:

- `min`
- `max`
- `warning`
- DM tracking ano/ne
- brousitelnost ano/ne
- max počet přebroušení
- poznámka k broušení
- poznámky
- blokace položky
- důvod blokace
- blokace konkrétního kusu

Tato nastavení jsou tenantová. Jde o lokální provozní pravidla firmy v GSS, ne o GPC master data. Stejná GPC položka může mít pro různé zákazníky rozdílná GSS pravidla, například jiné min/max hranice, DM tracking, pravidla broušení, blokace nebo interní poznámky.

Uložení tenant settings musí aktualizovat pouze zákaznickou skladovou položku v hlavním skladu dané organizace. Nesmí měnit GPC katalog, GPC technická data ani katalogový lifecycle status.

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
- rozpad zásob podle provozních stavů
- rozlišení nových, přebroušených, použitých a na broušení čekajících kusů

Pohyby musí být auditované a vázané na firmu, hlavní sklad, položku a případně konkrétní DM kus.

### Provozní Stavy Zásoby Nástroje

Tyto stavy patří do GSS, ne do GPC. GPC říká, co je produkt. GSS říká, kde je konkrétní kus, v jakém je provozním stavu, zda je použitelný, zda má jít na broušení a zda je dostupný k výdeji.

GSS musí rozlišovat:

- `new`: nový nástroj, nikdy nevydaný do výroby
- `new_resharpened`: nový přebroušený nástroj, který po posledním broušení ještě nebyl vydán do výroby
- `used`: použitý nástroj, který se vrátil z výroby a je stále použitelný
- `from_production_for_sharpening`: nástroj z výroby / na broušení, který už není použitelný a má být odeslaný na broušení

U stavu na broušení se eviduje:

- brusič
- výchozí brusič `M-technologies`
- možnost editovat brusiče
- provozní instrukce, například `dát do červené krabice`

### Objednávková Logika

Když GSS generuje objednávku, znamená to požadavek na nový nástroj.

Objednávka nesmí znamenat:

- použitý nástroj
- nový přebroušený nástroj
- nástroj vrácený z výroby

Objednávková potřeba se bude do budoucna počítat jako součet potřeb hlavního skladu, dceřiných skladů a budoucích výdejních míst / automatů. V MVP je pouze hlavní sklad, ale datová a procesní logika musí být připravená na rozpad.

### Rozpad Zásob

GSS musí u položky zobrazovat celkem kusů a rozpad:

- nový
- nový přebroušený
- použitý
- na broušení

První úroveň je celkový počet za firmu. Klik zobrazí rozpad podle skladů, v MVP hlavní sklad a později dceřiné sklady. Klik na sklad zobrazí rozpad podle provozního stavu.

Pokud je aktivní DM tracking, klik na provozní stav zobrazí konkrétní DM kusy. DM kus je konec rozpadového řetězce.

### První Naskladnění Položky

První naskladnění je první skladový pohyb nad tenant skladovou položkou. V MVP se ještě neřeší plný audit, ERP pohyby ani detailní DM lifecycle, ale pohyb musí aktualizovat základní `stockSummary`.

Vstup pohybu:

- počet kusů
- stav naskladnění: `new`, `resharpened_new`, `used`, `sharpening`
- brusič, pokud jde o brousitelnou položku nebo stav `sharpening`
- provozní poznámka, například `Dát do červené krabice`
- typ dokladu / důvod příjmu
- číslo dokladu, volitelné pro MVP
- dodavatel / zdroj
- datum příjmu
- provedl
- poznámka k příjmu

Aktualizace `stockSummary`:

- každý pohyb navyšuje `total`
- stavy `new`, `resharpened_new` a `used` navyšují `available`
- stav `sharpening` navyšuje `sharpening`, ale nenavyšuje `available`
- `reserved` a `production` se v tomto kroku nemění

Rozpad stavů se ukládá do:

- `stockSummary.states.new`
- `stockSummary.states.resharpened_new`
- `stockSummary.states.used`
- `stockSummary.states.sharpening`

Použitý nástroj může být stále použitelný pro méně náročné operace. Proto může být naskladněn jako `used` a dostupný pro výdej, dokud není rozhodnutím obsluhy přesunut na broušení, blokaci nebo vyřazení.

### Výdej Do Výroby

Výdej je samostatná GSS služba. Výdej do výroby není přesun mezi sklady zákazníka. Přesun mezi sklady bude později samostatná služba.

Skladový pohyb se vždy provádí z konkrétního skladu. V MVP je pouze hlavní sklad. Do budoucna bude možné stát na hlavním skladu nebo dceřiném skladu a tím určit, odkud se výdej provádí. Oprávnění pro pohyby podle skladu se bude řešit později.

MVP výdej pracuje nad tenant skladovými položkami a hledá podle:

- názvu
- GPC ID
- GTIN
- interního kódu
- výrobce
- typu položky
- poznámky / rozměru
- dostupných lokálních parametrů

Výběr položky musí ukázat:

- název
- výrobce
- GPC ID nebo lokální ID
- GTIN
- dostupné množství
- rozpad stavů: `new`, `resharpened_new`, `used`, `sharpening`
- DM tracking ano/ne
- brousitelnost ano/ne

Vstup výdeje:

- preferovaný stav pro výdej: `used`, `resharpened_new`, `new`
- dostupnost ve vybraném stavu
- počet kusů do výroby
- středisko
- stroj
- zakázka
- poznámka k výdeji

Pravidla:

- nesmí se vydat víc než `available`
- nesmí se vydat kusy ve stavu `sharpening`
- pokud není dost kusů ve zvoleném stavu, výdej se neuloží
- výdej snižuje `stockSummary.available`
- výdej zvyšuje `stockSummary.production`
- výdej snižuje konkrétní stav v `stockSummary.states`

Metadata:

- datum výdeje ze systému
- provedl: v MVP `MVP uživatel`
- později přihlášená osoba, výdejní automat, ERP nebo integrační zdroj

Evidenční dimenze, které si zákazník bude moct definovat:

- středisko
- stroj
- zakázka
- další interní dimenze podle firmy

Střediska, stroje, zakázky a další evidenční dimenze budou v budoucnu definované v administraci firmy. Při výdeji si uživatel nebude dlouhodobě psát volný text, ale vybírat z předdefinovaných hodnot. Zároveň musí být možné hodnotu ručně zapsat, pokud ještě není v seznamu. Důvodem je rozdílná úroveň evidence a různě čistá data u zákazníků. Pro MVP mohou zůstat textová pole.

Tyto hodnoty jsou základ pro budoucí vyhodnocování a GINA analytiku:

- náklady podle zakázky
- náklady podle stroje
- náklady podle střediska
- opotřebení podle výroby
- dotazy typu `Kolik mě stála zakázka XY na nástrojích?`
- dotazy typu `Které středisko má nejvyšší spotřebu?`
- dotazy typu `Na kterém stroji nejčastěji odcházejí nástroje?`

Kontrola segmentu zásoby:

- při volbě `Použitý` se kontroluje `stockSummary.states.used`
- při volbě `Nový přebroušený` se kontroluje `stockSummary.states.resharpened_new`
- při volbě `Nový` se kontroluje `stockSummary.states.new`

Nestačí kontrolovat pouze `stockSummary.available`. Pokud například `available = 10`, `new = 10` a `resharpened_new = 0`, výdej 3 ks jako `Nový přebroušený` musí být odmítnut hláškou `Ve vybraném stavu není dostatek kusů k výdeji.`

Při DM trackingu bude výdej probíhat nad konkrétním DM kusem. V MVP je detailní DM výdej pouze placeholder, ale agregovaná kontrola podle segmentu zásoby musí být správná už nyní.

### Ohlášení Rozdílu Ve Skladu

MVP UI může obsahovat jednoduchou akci `Ohlásit rozdíl ve skladu`.

Smysl:

- systém ukazuje například 10 ks
- pracovník fyzicky vidí jen 8 ks
- pracovník ohlásí validní množství / rozdíl
- informace půjde zodpovědné osobě
- později se propojí s audit logem

Pracovník tím chrání sebe před odpovědností za předchozí chybu. Audit log umožní dohledat předchozí pohyby a určit, kde rozdíl vznikl. Detailní workflow se bude řešit později.

### Budoucí Výdejní Terminál

Výdejní terminál je budoucí směr mimo MVP.

Princip:

- režim pouze pro výdej
- scanner-first / touch-first provoz
- podle aktivního pole se otevře numerická, textová nebo kombinovaná klávesnice
- cílem je rychlý provoz ve výrobě

### Budoucí Štítkový Výdej

Štítkový výdej je budoucí nápad mimo MVP.

Příklad:

1. pracovník vyhledá položku, například rukavice
2. zvolí variantu
3. vytiskne se samolepka / lístek s požadavkem
4. pracovník s lístkem dojde na výdejní místo
5. výdej proběhne proti lístku

### Budoucí Nárokové Položky

GSS může v budoucnu hlídat, kdo má nárok na jaké položky za určité období. Typicky jde o OPP / ochranné pracovní pomůcky.

Princip:

- systém eviduje pracovníka
- systém zná nárok pracovníka na položky za období
- pokud pracovník žádá dříve, než má nárok, systém nevydá automaticky
- vyšší role, například mistr, může výdej autorizovat
- výdej se uloží s poznámkou a vazbou na pracovníka
- bez OPP pracovník nemůže pracovat

Toto workflow není součástí MVP.

### Intake Metadata a Budoucí Doklady

V MVP se při naskladnění uloží poslední příjem / intake metadata k položce. Nejde ještě o plnou historii pohybů, ale připravuje se tím budoucí audit a napojení na doklady.

Podporované důvody / doklady:

- dodací list dodavatele
- faktura dodavatele
- interní příjemka
- servisní dodací list po broušení
- návrat z výroby
- ruční korekce / inventura

Pole `provedl` je zatím textové a může mít hodnotu `MVP uživatel`. Později bude odvozené z přihlášené osoby, výdejního automatu, ERP nebo integračního zdroje.

Budoucí směr:

- načítání kódů z dodacích listů
- načítání kódů z faktur
- načítání servisních dokladů
- import dokladů z ERP
- import z výdejního automatu
- import od dodavatele

Cílem je minimalizovat ruční zadávání a přitom zachovat dohledatelnost příjmu.

### Servisní Workflow Ostření / M-technologies

Workflow ostření je budoucí servisní tok mezi zákaznickým GSS a M-technologies.

Proces:

1. zákazník v GSS shromažďuje nástroje k ostření
2. GSS ukazuje počet kusů na broušení
3. zákazník spustí akci `Odeslat na ostření`
4. systém ukončí sběr aktuální dávky
5. vznikne servisní doklad

Servisní doklad může být:

- objednávka ostření
- dodací list pro předání nástrojů
- požadavek na povlakování

Doklad obsahuje:

- zákazníka
- položky
- počty
- DM kódy, pokud existují
- poznámky zákazníka
- požadavek na broušení
- požadavek na povlak

M-technologies si tento doklad otevře. Po provedení služby zapíše:

- co bylo provedeno
- nové rozměry po broušení
- nový průměr
- novou délku
- počet přebroušení
- poznámku
- případně typ povlaku

Zákazník si výsledek natáhne zpět do GSS jako příjemku / servisní dodací list. Tím vzniká integrační kanál mezi GSS zákazníka a M-technologies.

### DM Parametrické Změny Po Broušení

Pokud je nástroj sledovaný přes DM, změny rozměrů po broušení se zapisují ke konkrétnímu DM kusu.

Bez DM trackingu se změny zapisují agregovaně nebo poznámkou.

DM kus po broušení může mít:

- nový aktuální průměr
- novou délku
- počet přebroušení
- servisní historii
- nový štítek / vizuální identifikátor

Zákazník ani servis nesmí měnit GPC master data. Mění se pouze tenant provozní data v GSS.

### Na Broušení

GSS musí zobrazovat celkový počet kusů na broušení a rozpad:

- ještě ve firmě
- aktuálně v brusírně

Pokud je aktivní DM tracking, u každého čísla lze zobrazit konkrétní DM kusy.

Bez DM trackingu systém pracuje s počtem kusů. S DM trackingem systém pracuje s konkrétními kusy a každý kus má svůj DM kód.

## Etapa 5: Nadnormativní Zásoby

Nadnormativní zásoba vzniká v GSS, ne v GPC. Jde o lokální obchodní / provozní vrstvu zákazníka nad jeho vlastním hlavním skladem.

Firma může u skladové položky označit část zásoby jako nadnormativní. Tato nadnormativní zásoba může být:

- interně evidovaná
- nabídnutá ostatním firmám v Gogrou komunitě
- později napojená na obchodní / Toolshop vrstvu

Nadnormativní nabídka nesmí měnit master data GPC. Nabídka je lokální zákaznická vrstva a pozdější viditelnost v komunitě Gogrou bude řízena pravidly a oprávněními.

### Datový Základ Nabídky

U nadnormativní nabídky se eviduje:

- položka v GSS
- počet kusů k nabídnutí
- cena za kus
- měna
- stav nabídky: `draft`, `active`, `paused`, `sold`, `cancelled`
- poznámka
- datum vytvoření
- vazba na firmu / tenant
- audit změn

Kusy označené k nabídce musí být blokované proti běžnému výdeji.

### Rezervace Bez DM Trackingu

U položky bez DM trackingu se rezervuje pouze množství.

Příklad:

- celková zásoba: 20 ks
- rezervováno pro nabídku: 5 ks
- dostupné pro běžný výdej: 15 ks

Rezervované množství se odečítá z dostupného množství pro běžný výdej.

### Rezervace S DM Trackingem

U položky s DM trackingem se rezervují konkrétní DM kusy.

Každý rezervovaný kus může mít stav:

- `available_for_offer`
- `reserved_for_offer`
- `offered`
- `sold`
- `cancelled`

Rezervovaný DM kus nelze běžně vydat do výroby. Systém musí jasně ukázat, které kusy jsou blokované pro nabídku. Historie rezervace se zapisuje do pohybů / auditu.

Detailní pravidla DM stavů, lifecycle přechodů a výdeje se budou řešit v samostatné části GSS DM lifecycle. V aktuální technické etapě stačí dokumentace a placeholder UI v tenant GSS.

## Další Etapy po MVP Základu

Po etapách 1-4 mohou navazovat:

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
