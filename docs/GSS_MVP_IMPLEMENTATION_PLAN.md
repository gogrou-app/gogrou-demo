# GSS MVP Implementation Plan

## Cíl

Tento dokument popisuje implementační pořadí GSS MVP na úrovni produktové a datové logiky.

Neprogramuje databázi, neřeší detail UI a nezasahuje do GPC.

Gogrou tenant model začíná entitou firma / organizace. GSS MVP používá tento obecný tenant s aktivním modulem `GSS`. GPC zůstává validovaný zdroj master dat.

Registrace firmy není součástí GSS. Cílově vzniká firma přes obecnou registraci Gogrou na `/register`, uživatel po přihlášení vstupuje do `/app` a GSS je dostupné pouze jako modul `/app/gss`, pokud má firma GSS aktivované.

## Související globální principy

Tento dokument vychází z globálních architektonických principů Gogrou:
`docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.

Lokální pravidla v tomto dokumentu principy pouze zpřesňují pro daný modul.

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
- `supplierPackQuantity`
- `supplierName`
- `supplierType`
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

### Objednávkový Návrh

Objednávkový návrh je tenant provozní logika GSS. Objednávka vždy znamená nový nástroj.

Objednávka nikdy neznamená:

- `used`
- `resharpened_new`
- `sharpening`
- kus ve výrobě
- rezervovaný kus

Výběr položek:

- položka má nastavené `min`
- položka má nastavené `max`
- `stockSummary.available < min`

Vznik objednávky:

- automaticky při poklesu na `min` nebo pod `min`
- ručně / mimořádně pro budoucí zakázku, plánovanou vyšší spotřebu nebo mimořádný nákup

Ruční mimořádná objednávka je v MVP zatím dokumentovaná jako budoucí rozšíření objednávkového návrhu. Vždy ale platí, že objednávka znamená nový nástroj / novou položku.

Do `available` se nesmí přičítat `reserved`, `production`, `sharpening` ani `overstockReserved`. Jde pouze o skutečně volné dostupné množství.

Výpočet:

- potřeba = `max - available`
- pokud je nastavený `supplierPackQuantity`, výsledek se zaokrouhlí nahoru na nejbližší násobek
- pokud není nastavený, používá se `supplierPackQuantity = 1`

Příklad:

- `min = 10`
- `max = 30`
- `available = 7`
- potřeba = 23
- `supplierPackQuantity = 10`
- doporučení = 30 ks

Tenant nastavení dodavatele:

- `supplierName`
- `supplierType`: `Gogrou partner`, `Standard supplier`, `Internal supplier`

Objednávkový návrh se nesmí tvořit jako jeden společný seznam všech položek. Musí být rozdělený podle:

- výrobce / značka položky
- přiřazený dodavatel položky
- nákupní kanál

GPC je zdroj výrobce a značky. GSS je zdroj zákaznického dodavatele a nákupního kanálu. Kombinace těchto údajů určuje samostatný návrh.

Nákupní kanály pro MVP logiku:

- `Gogrou`
- `vlastní dodavatel zákazníka`
- `MAZAK Toolshop`
- `M-technologies`
- `jiný dodavatel`

Fallback při chybějícím dodavateli:

- `Gogrou`
- případně `Neurčený dodavatel`

Pravidlo: jeden návrh nesmí míchat různé dodavatele. Pokud má stejný výrobce více dodavatelů, vznikne více oddělených návrhů.

Příklad:

- Walter + Gogrou -> návrh 1
- Walter + vlastní dodavatel -> návrh 2
- Sandvik + MAZAK Toolshop -> návrh 3
- MTTM + M-technologies -> návrh 4

Soft MVP v UI může zatím pouze seskupit položky v objednávkovém návrhu. Plné odesílání objednávek, ERP export a Promitea export zůstávají placeholder.

Primární filozofie Gogrou je napojit zákazníka pokud možno přímo na výrobce nebo partnera. Preferovaný typ je proto `Gogrou partner`.

Při tvorbě objednávky bude možné vybrat:

- `Gogrou` / `Gogrou partner` jako default
- jiného uloženého dodavatele zákazníka
- nového dodavatele
- dodavatele z aktuální nabídky / akce / Promitea / SS

Budoucí nákupní porovnání před objednávkou:

- nadnormativa v Gogrou komunitě
- aktuální cena od Gogrou partnera
- běžící cenová akce
- SS nabídka
- Promitea / RFQ výsledek
- ceníky jiných dodavatelů stejné položky

U nadnormativy musí GSS ověřit aktuální dostupnost u nabízející firmy, protože stav nemusí být vždy 100% aktuální.

Výstup pro zákazníka má ukázat, kde lze položku pořídit, za kolik, od koho a za jakých podmínek. Zákazník pak vybere konkrétní nákupní cestu.

`purchaseProposal`:

- `id`
- `createdAt`
- `createdBy`
- `organization`
- `supplier`
- `status`: `draft`, `exported`, `sent`, `completed`
- `items`

Položka návrhu:

- `itemId`
- `itemName`
- `gpc_id`
- `gtin`
- `manufacturer`
- `supplierName`
- `supplierType`
- `purchaseChannel`
- `purchaseGroupKey`
- `recommendedQuantity`
- `editedQuantity`
- `supplierPackQuantity`
- `note`

Uživatel může upravit množství, vyřadit položku nebo doplnit poznámku.

Při vytvoření návrhu vzniká `movementHistory` typ `purchase_proposal_created`.

Placeholdery MVP:

- `Porovnání nabídek`: budoucí porovnání Gogrou partner / dodavatelé / nadnormativa / akce / SS / Promitea
- `Ruční objednávka`: budoucí mimořádná objednávka mimo automatický min/max návrh
- `Vygenerovat objednávku`: budoucí PDF
- `Export XLS / Promitea`: budoucí XLS nebo Promitea RFQ
- `Odeslat objednávku`: budoucí e-mail nebo Gogrou kanál

Placeholder tlačítka musí být v UI jasně označená jako `Připravuje se` nebo po kliknutí zobrazit hlášku `Tato funkce bude doplněna v další fázi.` Nesmí působit jako hotová funkce.

Pokud už existuje objednávkový návrh ve stavu `draft`, další vytvoření návrhu musí uživatele upozornit a vyžádat jednoduché potvrzení pro přepsání aktuálního draftu.

Budoucí objednávka bude obsahovat údaje zákazníka, dodavatele, položky, množství, poznámky a datum. Později půjde uložit, odeslat e-mailem, distribuovat Gogrou kanálem nebo exportovat.

Budoucí integrace:

- Promitea
- XLS
- RFQ
- AI doporučení
- automatické objednávky

Standardní provoz GSS objednává pouze do `max`. Automatická nadnormativa vzniká jen ve specifických scénářích, například počáteční naplnění skladu, mimořádný nákup nebo bezpečnostní zásoba.

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

### Rezervace Nástroje Pro Zakázku

Rezervace je tenant provozní funkce GSS. Nemění GPC master data a nesmí zapisovat do GPC. Chrání dostupnost nástroje pro konkrétní zakázku, přípravu programu nebo výrobu.

MVP formulář rezervace:

- zakázka
- stroj
- pro koho / role
- počet kusů
- stav rezervovaného nástroje: `new`, `resharpened_new`, `used`
- důvod / poznámka rezervace
- rezervoval, defaultně `MVP uživatel`
- datum rezervace
- platnost rezervace do, volitelné

Logika bez DM trackingu:

- kontroluje se dostupnost ve zvoleném segmentu `stockSummary.states`
- rezervace nesmí povolit více kusů, než existuje v daném segmentu
- po uložení se sníží `stockSummary.available`
- zvýší se `stockSummary.reserved`
- sníží se segment `stockSummary.states[state]`
- k položce se uloží aktivní rezervace
- vznikne `movementHistory` záznam `reservation_created`

Logika s DM trackingem:

- rezervuje se konkrétní DM/QID kus, ne anonymní množství
- UI zobrazí dostupné skupiny `new`, `resharpened_new` a `used`
- klik na skupinu zobrazí konkrétní DM kusy v daném stavu
- u každého kusu se zobrazí QID, DM kód, stav, aktuální lokace, aktuální rozměry, změněné parametry po broušení a poslední servis / výdej
- pokud má kus `lastServiceMetadata`, zobrazí se samostatný výrazný řádek `Aktuální rozměry po broušení` s hodnotami `D`, `L1`, `L2`
- stejné zvýraznění se používá v DM zásobě, výdeji, rezervaci, DM detailu a příjmu z broušení
- skupina `new` může nabídnout zkratku `Rezervovat libovolný nový kus`, ale po výběru musí být jasně zobrazen konkrétní QID/DM kus
- u stavů `resharpened_new` a `used` musí uživatel vybrat konkrétní kus, protože může mít jiné aktuální rozměry nebo historii použití
- po potvrzení se konkrétní DM kus nastaví na `reserved`
- k DM kusu se uloží `reservationMetadata`
- při vytvoření rezervace se automaticky vygeneruje čtyřznakový `Release Code`
- `Release Code` je uložený v `reservationMetadata` a zobrazuje se v detailu rezervace
- zásoba se přepočítá z `dmItems[]`
- vznikne `movementHistory` záznam `reservation_created`

Terminálový standard pro rezervaci:

`Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní DM/QID kus -> Rezervace`

Výdej rezervovaného nástroje:

- rezervace neznamená výdej
- rezervace není tvrdý zámek, chrání hlavně proti neúmyslnému výdeji
- rezervovaný DM kus je blokovaný pro běžný výdej
- ve výdeji DM položky se vedle skupin `new`, `resharpened_new` a `used` zobrazuje skupina `reserved`
- klik na `reserved` zobrazí konkrétní rezervované DM kusy včetně QID, DM kódu, původního stavu, rozměrů, lokace a `reservationMetadata`
- ruční zadání rezervovaného QID/DM ve výdeji zobrazí, že jde o rezervovaný kus
- takový kus se nevydává běžným anonymním výdejem
- uživatel musí potvrdit samostatnou akci `Vydat rezervovaný kus`
- varianta A: `Vydat pomocí Release Code`, kdy uživatel zadá kód uložený u rezervace
- varianta B: `Override výdej`, kdy uživatel zadá důvod obejití rezervace
- po potvrzení se konkrétní DM kus nastaví na `production`
- `reservationMetadata` se přesune do `lastReservationMetadata`
- při override výdeji se uloží `overrideMetadata` s osobou, datem a důvodem
- uloží se `lastIssueMetadata`
- vznikne DM history a `movementHistory`
- DM history rozlišuje, zda byla rezervace uvolněna kódem, nebo obejita override výdejem
- výdej je navázaný na zakázku / stroj / poznámku z rezervace nebo z výdejového formuláře

V budoucnu může GSS při override výdeji upozornit rezervující osobu. MVP zatím pouze zapisuje informaci do historie.

Zrušení rezervace:

- může provést autor rezervace nebo oprávněná osoba
- kusy se vrátí do `available`
- kusy se vrátí do původního segmentu zásoby
- vznikne `movementHistory` záznam `reservation_cancelled`
- v MVP je zrušení rezervace zatím placeholder bez plné implementace

Rezervace je důležitá hlavně pro technologii, programování a práci s přebroušenými nástroji. Pokud má přebroušený nástroj aktuální průměr použitý v programu, systém musí zabránit tomu, aby jej někdo vydal na jinou práci.

### Ohlášení Rozdílu Ve Skladu

MVP UI může obsahovat jednoduchou akci `Ohlásit rozdíl ve skladu`.

Smysl:

- systém ukazuje například 10 ks
- pracovník fyzicky vidí jen 8 ks
- pracovník ohlásí validní množství / rozdíl
- informace půjde zodpovědné osobě
- později se propojí s audit logem

Pracovník tím chrání sebe před odpovědností za předchozí chybu. Audit log umožní dohledat předchozí pohyby a určit, kde rozdíl vznikl. Detailní workflow se bude řešit později.

### Základní Historie Pohybů

Tenant GSS MVP ukládá jednoduchou provozní historii pohybů jako `movementHistory`. Záznam může být uložen u tenant skladové položky a z těchto položek se skládá globální historie hlavního skladu.

Datový tvar záznamu:

- `id`
- `createdAt`
- `type`
- `organizationId`
- `warehouseId`, v MVP `MAIN`
- `itemId`
- `itemName`
- `gpc_id`, pokud existuje
- `origin`: `GPC` nebo `LOCAL`
- `quantity`
- `state`: `new`, `resharpened_new`, `used`, `sharpening`
- `performedBy`
- `note`
- `metadata`

Podporované typy:

- `intake`
- `issue_to_production`
- `return_from_production`
- `send_to_sharpening`
- `stock_difference_report`
- `block`
- `unblock`
- `reservation_created`
- `reservation_cancelled`
- `overstock_offer_created`
- `overstock_offer_updated`
- `purchase_proposal_created`

Automatický zápis vzniká při:

- příjmu
- výdeji do výroby
- návratu z výroby
- rozhodnutí poslat na broušení
- ohlášení rozdílu ve skladu
- blokaci nebo odblokaci položky
- vytvoření rezervace
- budoucím zrušení rezervace
- vytvoření nebo změně nadnormativní nabídky
- vytvoření objednávkového návrhu

UI v MVP zobrazuje:

- u položky posledních 10 pohybů
- na úrovni skladu posledních 20 pohybů napříč položkami

Movement history není plný audit log. Slouží pro provozní přehled, rychlou orientaci a základní dohledatelnost posledních skladových událostí.

Budoucí audit log bude samostatná hlubší vrstva. Bude obsahovat například:

- IP adresu
- zařízení
- terminál
- konkrétní DM kus
- ERP zdroj
- výdejní automat
- autorizaci
- workflow a schvalovací stav

Movement history má být čitelná pro běžný provoz. Audit log bude určený pro kontrolu, odpovědnost, integrace a řešení konfliktů.

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

### Návrat Z Výroby

Návrat z výroby je samostatná GSS služba a samostatný skladový pohyb. Po návratu musí být vždy rozhodnuto, co se s položkou stane dál.

MVP hledá položku v tenant skladu podle:

- názvu
- GPC ID
- GTIN
- interního kódu
- výrobce
- typu
- poznámky / rozměru

Podmínka:

- návrat lze provést pouze u položky s `stockSummary.production > 0`
- nelze vrátit více kusů, než je aktuálně ve výrobě

Formulář návratu:

- počet kusů
- datum návratu, default dnešní datum
- provedl, default `MVP uživatel`
- středisko
- stroj
- zakázka
- poznámka k návratu

Rozhodnutí po návratu:

- `return_used`: zpět na sklad jako použitý
- `send_sharpening`: poslat na broušení
- `scrap_carbide`: vyřadit / odkup tvrdokovu
- `redirect_instruction`: přesměrovat podle instrukce / jiná řezná hrana
- `temporary_block`: dočasně zablokovat

Logika `return_used`:

- snížit `production`
- zvýšit `available`
- zvýšit `stockSummary.states.used`

Logika `send_sharpening`:

- snížit `production`
- zvýšit `sharpening`
- zvýšit `stockSummary.states.sharpening`
- zvýšit rozpad `sharpeningBreakdown.in_company`
- zobrazit brusiče, defaultně `M-technologies`
- umožnit provozní instrukci, například `Dát do červené krabice`
- pokud položka není brousitelná, zobrazit výrazné varování `Položka není nastavena jako brousitelná.`
- u nebrousitelné položky vyžadovat potvrzení výjimky, jinak se návrat na broušení neuloží

Logika `scrap_carbide`:

- snížit `production`
- nezvyšovat `available`
- nezvyšovat `sharpening`
- uložit placeholder informaci o vyřazení

U tvrdokovu bude možné evidovat váhu, typ materiálu, aktuální cenu odkupu a odhad hodnoty. Detailní recyklační workflow není součást MVP.

Logika `redirect_instruction`:

- snížit `production`
- zatím nevracet do `available`
- uložit poznámku / placeholder instrukce

Logika `temporary_block`:

- snížit `production`
- nezvyšovat `available`
- uložit důvod blokace

Tímto GSS získává data pro budoucí GINA analýzy. Servisní a recyklační workflow jsou budoucí navazující moduly.

### DM Tracking a Návrat Z Výroby

Pokud má položka DM tracking, návrat se bude v budoucnu řešit nad konkrétním DM kusem. Systém bude znát počet přebroušení konkrétního kusu.

Pokud je kus na posledním povoleném použití / přebroušení, systém zobrazí upozornění:

`Tento nástroj dosáhl limitu přebroušení. Doporučeno vyřadit.`

Bez DM trackingu se pracuje s agregovaným počtem kusů a počet přebroušení se řeší pouze obecně / poznámkou.

### Změna Parametrů Po Broušení

Po broušení bude nutné u DM kusu evidovat:

- aktuální průměr
- aktuální délku
- počet přebroušení
- poznámku k servisu
- případně typ povlaku
- nový vizuální identifikátor / štítek

Tyto změny nemění GPC master data. Jde pouze o tenant provozní data v GSS. Bez DM tracking se tyto změny zapisují agregovaně / poznámkou.

### Štítek / Sáček / Transakční DM Kód

Při vyřazení, recyklaci, přesměrování nebo servisní dávce může systém v budoucnu vytisknout štítek. Štítek může obsahovat počet kusů, typ, datum a pracovníka.

Cílově může štítek nést pouze DM / transakční kód a detaily transakce budou uložené v systému. Díky tomu lze zpracovat i větší množství kusů, ne pouze jednotlivý kus. Tisk štítků není součástí MVP.

### Intake Metadata a Budoucí Doklady

V MVP se při naskladnění uloží poslední příjem / intake metadata k položce a současně vznikne provozní záznam v `movementHistory`. Intake metadata slouží pro rychlé zobrazení posledního dokladu, movement history pro přehled pohybů.

Podporované důvody / doklady:

- dodací list dodavatele
- faktura dodavatele
- interní příjemka
- servisní dodací list po broušení
- návrat z výroby
- ruční korekce / inventura

Příjem musí ukládat také zdroj příjmu:

- `manual`: běžný ruční příjem
- `gss_system_order`: příjem ze systémové objednávky / objednávkového návrhu GSS
- `external_order_erp`: příjem z externí objednávky / ERP / Promitea / Money
- `sharpening_return`: příjem z broušení, který se v DM řeší samostatným tokem konkrétního kusu
- `inventory_correction`: korekční příjem / inventura

U příjmu ze systémové objednávky GSS se v UI nesmí zobrazovat všechny objednávky. Protože uživatel přijímá konkrétní položku, nabídka se filtruje pouze na otevřené objednávkové návrhy / systémové objednávky, které obsahují tuto položku. Řazení je od nejstarší otevřené objednávky, protože ta má největší pravděpodobnost fyzického doručení.

U každé nabídnuté systémové objednávky se zobrazí:

- systémové číslo objednávky Gogrou
- datum vytvoření
- dodavatel
- výrobce / značka
- objednané množství
- už přijaté množství
- zbývá přijmout
- nákupní kanál

Po výběru se předvyplní číslo objednávky a do `movementHistory.metadata` se uloží `receiptSourceType = gss_system_order`, `purchaseProposalId`, `orderProposalId`, `systemOrderNumber`, `supplier`, `purchaseChannel` a `manufacturer`. Soft MVP zatím automaticky nesnižuje zbývající množství v objednávce, ale datově je připravené pozdější párování příjemky na položku objednávky.

Množství příjmu se po výběru systémové objednávky předvyplní hodnotou `zbývá přijmout`. Pokud záznam objednávky nemá evidenci přijatého množství, použije se `objednáno`. Pole množství zůstává editovatelné. MVP tím pokryje plné dodání, částečné dodání i nadlimitní dodání; nadlimitní dodání zobrazí warning a uloží metadata do movement history, ale objednávku zatím automaticky neuzavírá ani nepřepočítává její skutečný zůstatek.

Objednávkový řádek musí ukládat systémový návrh odděleně od potvrzené objednávky:

- `suggestedQuantity`: vypočtené množství do max zásoby
- `originalSuggestedQuantity`: původní systémový návrh
- `orderedQuantity`: množství potvrzené uživatelem
- `receivedQuantity`: součet příjmů proti řádku
- `remainingQuantity`: `orderedQuantity - receivedQuantity`
- `quantityAdjustedByUser`: `true`, pokud uživatel změnil návrh

UI musí umožnit upravit `orderedQuantity` už u kandidátů před vytvořením objednávkového návrhu. Funkce vytvoření návrhu nesmí brát původní vypočtenou hodnotu, ale aktuální draft hodnotu z inputu. V localStorage soft MVP se ukládá celý aktuální `purchaseProposal`, aby následný příjem pracoval se stejným potvrzeným množstvím.

Příjem ze systémové objednávky aktualizuje řádek návrhu v localStorage soft MVP logice:

1. najde `purchaseProposalId` / `orderProposalId`
2. najde řádek konkrétní položky
3. zvýší `receivedQuantity` o skutečně přijaté množství
4. přepočítá `remainingQuantity`
5. při `remainingQuantity <= 0` označí řádek jako `fulfilled`
6. pokud jsou všechny řádky plně přijaté, označí celý návrh jako `fulfilled`

Příjem se vždy řídí `orderedQuantity`, ne `suggestedQuantity`. Do movement metadata se uloží `suggestedQuantity`, `orderedQuantity`, `receivedQuantityBefore`, `receivedQuantityAfter`, `remainingQuantityBefore`, `remainingQuantityAfter`, `receivedFromThisMovement` a `quantityAdjustedByUser`.

Pokud k položce není otevřená žádná systémová objednávka GSS, UI zobrazí informaci a umožní pokračovat jako běžný příjem nebo příjem z externí objednávky / ERP.

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

MVP pravidlo:

- nadnormativa se týká pouze stavu `new`
- nelze nabídnout `resharpened_new`
- nelze nabídnout `used`
- nelze nabídnout `sharpening`
- nelze nabídnout kusy ve výrobě
- nelze nabídnout kusy už rezervované pro zakázku

MVP formulář ukládá `overstockOffer`:

- `enabled`
- `quantity`
- `pricePerUnit`
- `currency`
- `note`
- `status`: `draft`, `active`, `paused`, `sold`, `cancelled`
- `createdAt`
- `updatedAt`

Kontrola dostupnosti:

- nabízený počet nesmí být větší než počet volných kusů ve stavu `new`
- volné nové kusy znamenají aktuální `stockSummary.states.new`; nadnormativa se v MVP z dostupnosti tvrdě neodečítá
- pokud není dost kusů, UI zobrazí `Pro nadnormativní nabídku není dostatek volných nových kusů.`

Kusy označené k nabídce nejsou v MVP tvrdě blokované proti běžnému výdeji. Výroba má prioritu a aktivní nabídka se při zásahu výdejem automaticky poníží.

Stavy nadnormativní nabídky:

- `draft`: rozpracovaná nabídka
- `active`: aktivní nabídka přebytku
- `paused`: pozastavená nabídka
- `sold`: prodaná nabídka
- `cancelled`: zrušená nabídka

Stav `active` znamená aktivní nabídku přebytku, ale v MVP tvrdě neblokuje výdej. Výroba má prioritu.

Pokud výdej nových kusů zasáhne do aktivně nabízeného množství, UI automaticky poníží `overstockOffer.quantity`. Pokud množství klesne na `0`, nabídka se pozastaví (`paused`) a uživatel dostane hlášku:

`Výdej zasáhl do nadnormativní nabídky. Nabízené množství bylo automaticky poníženo.`

`overstockReserved` se v aktuálním MVP nepoužívá jako tvrdá skladová blokace. Pokud existuje ze staršího prototypu, uložení nadnormativní nabídky ho uvolní zpět do skladové dostupnosti.

Při vytvoření nebo změně nabídky vzniká `movementHistory`:

- `overstock_offer_created`
- `overstock_offer_updated`

Automatická nadnormativa není součástí MVP. Budoucí výpočet může vycházet z:

- maximální zásoby
- procenta tolerance nad max
- skutečné zásoby
- poslední nákupní ceny
- slevy z poslední nákupní ceny

Příklad budoucího výpočtu:

- max zásoba = 100
- tolerance nad max = 20 %
- skutečná zásoba = 150
- hranice = 120
- nadnormativa = 30 ks

Marketplace, platby a Toolshop integrace nejsou součástí této MVP etapy.

### Rezervace Bez DM Trackingu

U položky bez DM trackingu se rezervuje pouze množství.

Příklad:

- celková zásoba: 20 ks
- rezervováno pro nabídku: 5 ks
- dostupné pro běžný výdej: 15 ks

V aktuálním MVP se nadnormativní nabídka neodečítá z dostupného množství pro běžný výdej. Systém eviduje nabízené množství a při výdeji ho podle potřeby automaticky poníží.

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

## Stabilizační Tuning Po Prvním Testování

Lokální nevalidovaná položka musí ve výdeji fungovat stejně jako položka převzatá z GPC. Rozdíl je ve validaci a dostupných pokročilých funkcích, ne v základní skladové operaci.

Příjem skladové položky v MVP eviduje volitelnou pořizovací cenu za kus a měnu. UI dopočítá celkovou hodnotu příjmu. K položce se ukládá poslední pořizovací cena, měna, datum a dodavatel / zdroj. Tato data připravují cenové analýzy, nadnormativy, SS akce a GINA doporučení.

Nadnormativa není tvrdá rezervace. Aktivní nabídka eviduje přebytek, ale výroba má prioritu. Výdej nových kusů může automaticky snížit `overstockOffer.quantity`; pokud nabídka klesne na `0`, status se nastaví na `paused` a UI zobrazí upozornění.

Budoucí upozornění nadnormativy:

- `Na položku`
- `Ignorovat`
- `Hlásit znovu po dalším pohybu`

V MVP jsou tyto akce pouze placeholder. Cílem je upozornit odpovědnou osobu, pokud se sklad blíží množství nabízenému jako nadnormativa.

Výdej nad systémovou zásobu se v MVP nepovoluje. Uživatel má použít `Ohlásit rozdíl ve skladu`. Budoucí override režim pro vyšší roli bude muset vytvořit výrazný historický / auditní záznam a upozornit odpovědnou osobu, aby se výroba nezastavila bez dohledatelnosti.

Dodavatelé zákazníka budou později samostatná administrační data firmy. Položka bude odkazovat na konkrétního dodavatele a zároveň uchová typ vztahu: `Gogrou partner`, `Standardní dodavatel`, `Interní dodavatel`. Default v MVP je `Gogrou` / `Gogrou partner`.

Poznámka k broušení, výkres / příloha / odkaz a povlak jsou připravené jako lehké tenant provozní údaje. Plná správa příloh, povlaků a technických dat se zatím neprogramuje.

Parametrické šablony lokálních položek budou později řízené typem položky a sladěné s GPC / ToolsUnited strukturou. MVP zatím používá pouze minimální provozní validaci.

Tenant skladové položky mají cílově přejít na kompaktní řádkový seznam s odděleným detailem položky. Současná dlouhá karta je přijatelná pro MVP prototyp, ale není cílové UX.

Řádek skladové položky má zobrazit:

- název položky
- výrobce
- GPC ID / lokální označení
- celkem
- nový
- nový přebroušený
- použitý
- ve výrobě
- na broušení
- rezervováno
- nadnormativa

Klik na řádek otevře detail položky. V detailu budou hlavní akce: `Výdej`, `Návrat z výroby`, `Příjem / naskladnění`, `Nastavení položky`, `Rezervovat`, `Nadnormativa`, `Vytvořit objednávku` a `Historie pohybů`.

Detail musí mít akce `Zavřít` a `Vrátit zpět na řádkový seznam`, aby se uživatel rychle vrátil do přehledu skladu.

V MVP prototypu musí každá rozbalená akce skladové položky podporovat stabilní návrat na detail položky. Tlačítko `Zpět na detail položky` zavře rozbalené panely dané položky, například `Naskladnit`, `Nastavení položky`, `Rezervovat`, `Nadnormativa` a DM detail / servis. Zavření nesmí mazat skladovou položku ani uložená data; pouze vrací UI do základního detailu položky. Cílově tento princip přejde do kompaktního řádkového seznamu s odděleným detailem.

Vyhledání položky má být centrální. Budoucí cílový tok má kombinovat hledání v GSS skladu, hledání v GPC a později GINA / AI dotazy typu `Najdi vrták průměr 10`, `Najdi APKX` nebo `Najdi frézu 4 zuby D10`.

V této etapě se hlavní GSS obrazovka překlápí do provozního skladového terminálu. Cílový MVP tok je `najít položku -> otevřít detail -> vybrat akci -> provést -> zpět`.

Implementační pravidla pro `/app/gss`:

- horní část zobrazuje aktivní firmu, prefix, stav organizace a odkaz do správy organizací
- hlavní akční panel otevírá procesní sekce pouze na vyžádání
- současně je otevřený nejvýše jeden hlavní akční panel
- panely `Objednávkový návrh`, `Vyhledat v GPC`, `Načíst DM kód`, `Poslední skladové pohyby`, `Nadnormativní zásoby` a `Lokální nevalidované položky` nesmí být trvale rozbalené
- každý hlavní panel má návrat `Zpět na akce`
- skladové položky jsou primárně kompaktní řádky a detail se otevírá až po kliknutí
- každá položková akce má návrat `Zpět na detail položky`

Sekce `Skladové položky` musí obsahovat základní klientské vyhledávání. V MVP filtruje řádkový seznam podle názvu položky, výrobce, typu, GPC ID, GTIN, GID, interního / lokálního kódu a základních lokálních parametrů. To je nutné, protože tenant sklad může obsahovat stovky až tisíce položek.

MVP doplňuje jednoduché chytré hledání bez AI. Vyhledávací text se rozdělí na tokeny podle středníku, čárky nebo mezer. Každý token se očistí a položka musí splnit všechny tokeny. Příklady: `Walter ; fréza ; 12 ; 25`, `Walter, freza, D12, 4z`, `Walter freza`, `VBD CNMG Walter WKP35G`. Zápisy `D12`, `d=12`, `Z4`, `4z`, `L25` a `l=25` se pro MVP převádí na číselné tokeny. Stejný helper hledání musí používat skladový seznam i terminálové akce, zejména Výdej.

Tato vrstva je rychlé provozní hledání ve skladu a zároveň příprava na budoucí parametrické / GINA hledání. Později se stejný princip rozšíří i do GPC a Toolshopu. V tomto kroku se neřeší backend, DB ani globální GPC hledání.

Budoucí GINA / AI vyhledávání bude nad touto provozní funkcí postupně dotazovat parametry: typ nástroje -> průměr -> délka břitu -> počet zubů -> výrobce -> použití. Vedle parametrického hledání musí zůstat podporované přesné vstupy: GTIN, GID, přesný název a načtení čtečkou.

Budoucí parametrické hledání v GSS/GPC bude řízené typem položky. První krok je typ, například `TK fréza`, `TK vrták`, `VBD`, `držák`, `povlak`, `OPP`, `materiál` nebo `náhradní díl`. Podle typu se zobrazí relevantní parametry.

Příklady parametrických sad:

- `TK fréza`: průměr, délka břitu, počet zubů, stopka, povlak, výrobce, použití / operace
- `TK vrták`: průměr, délka, hloubka vrtání, úhel špičky, povlak, výrobce, použití
- `VBD`: tvar, velikost, rádius, povlak, materiálová skupina, výrobce, ISO označení

Zdroj parametrů musí být GPC, které bude sladěné s ToolsUnited strukturou. GSS z GPC čerpá validovaná technická data přes `gpc_id`. Lokální nevalidované položky musí mít minimální povinné parametry podle typu, aby byly provozně použitelné a později validovatelné.

GINA / AI hledání není náhrada čistých dat. Je to vrstva nad strukturovanými GPC/GSS parametry. Typický dialog: `Fréza` -> `Jaký průměr?` -> `Jaká délka břitu?` -> `Kolik zubů?`. MVP textové hledání zůstává základní vrstva.

Příjem na sklad se rozlišuje podle zdroje: běžný ruční příjem, příjem ze systémové objednávky GSS, příjem z externí objednávky / ERP, příjem z broušení a korekční příjem / inventura. V MVP se skutečné naskladnění pořád provádí v detailu konkrétní položky. Varianta systémové objednávky GSS nabízí pouze otevřené návrhy, které obsahují přijímanou položku, a ukládá vazbu na `purchaseProposalId` / `orderProposalId`. Tento směr připravuje vazbu `objednávka -> dodací list -> faktura -> příjem`.

## DM Foundation MVP

DM tracking je tenant provozní vrstva GSS. Nezasahuje do GPC master dat. GPC definuje produkt, zatímco DM v GSS definuje konkrétní fyzický kus, jeho stav, umístění, aktuální rozměry a servisní historii.

Implementační základ:

- tenant položka má volitelné `dmItems[]`
- DM kus má unikátní `dmCode` v rámci tenant skladu
- DM kus má vlastní `status`, `location`, aktuální rozměry a `history[]`
- vytvoření DM kusů zapisuje provozní historii `dm_items_created`
- servisní úprava DM kusu zapisuje `dm_service_updated`

MVP formulář `Vytvořit DM kusy`:

- počet kusů
- stav: `new`, `resharpened_new`, `used`
- výchozí průměr
- výchozí délka
- max počet přebroušení
- umístění, default `main_warehouse`

Systém generuje digitální DM kód ve formátu `PREFIX-GID-DMSEQ`, například `AH01-000045872-001`.

Pravidla formátu:

- `PREFIX` je zákaznický prefix organizace
- `GID` je Gogrou ID položky v pevné délce 9 číslic
- `DMSEQ` je pořadové číslo konkrétního kusu u zákazníka v pevné délce 3 číslice
- DM kód je unikátní v rámci tenant organizace
- DM kód se po broušení nikdy nemění
- změněné rozměry po broušení se zapisují ke konkrétnímu DM kusu
- vyřazené DM kusy zůstávají v historii
- znovupoužití pořadového čísla se v MVP neimplementuje
- pokud položka nemá GID, použije se dočasný lokální GID / local item ID

### QID / Quick ID

QID = Quick ID (Quick Identifier). QID je schválené architektonické rozhodnutí GSS pro rychlou lidskou identifikaci konkrétního DM kusu.

QID slouží pro:

- rychlou lidskou identifikaci konkrétního DM kusu
- orientaci ve skladu
- orientaci ve výdejních automatech
- orientaci při servisu a ostření
- orientaci na štítku

QID není technický identifikátor a nenese žádnou logiku. QID nesmí obsahovat prefix firmy, GTIN, GID, typ nástroje, výrobce ani DM kód.

Formát QID je:

`ABC 12345`

Pravidla:

- 3 náhodná písmena
- mezera
- 5 náhodných číslic
- QID musí být unikátní
- systém vede databázi vydaných QID

Příklady:

- `KPL 14852`
- `XTR 58241`
- `MRV 90473`

Vznik QID:

`DM tracking = ANO -> vznik nového DM kusu -> automatické vytvoření DM -> automatické vytvoření QID`

QID je trvalý po celý život DM kusu. Po ostření se nemění DM kód ani QID. Mění se pouze aktuální rozměry a servisní historie konkrétního DM kusu.

Pokud dojde ke ztrátě štítku, uživatel načte DM kód, použije akci `Vytisknout štítek` a systém vytiskne nový štítek se stejným QID.

Soft MVP implementace QID:

- při vytvoření DM kusu se automaticky vygeneruje `quickId`
- QID se kontroluje proti existujícím DM kusům v aktuálním tenant skladu
- QID se ukládá ke konkrétnímu DM kusu
- QID se výrazně zobrazuje v DM detailu
- starší DM kus bez QID má v detailu akci `Vygenerovat QID`
- QID se nemění při ostření, změně rozměrů, přesunu ani rezervaci
- DM detail umí připravit textový výstup pro ruční tisk, laser nebo dočasný štítek

MVP štítek DM kusu obsahuje pouze:

1. QID jako nejsilnější a největší prvek štítku
2. název položky z GPC
3. aktuální rozměry, například `D = 11,83`, `L1 = 24,70`, `L2 = 78,00`
4. DM kód

Legenda parametrů na štítku bude vycházet z ToolsUnited. Na štítek se v MVP netiskne historie, výrobce, povlak, počet přebroušení ani další informace. Po načtení DM kódu jsou všechny detailní informace dostupné v GSS.

Fyzický tisk štítků, tiskárny, PDF a finální štítkové šablony nejsou součástí soft MVP. Model QID, pravidla obsahu štítku a textový výstup pro ruční zpracování jsou architektonicky schválené.

### DM Vytvořen vs. Fyzicky Označen

Implementační pravidlo: vznik DM identity a fyzické označení nástroje jsou dva oddělené kroky.

Při naskladnění nebo vytvoření DM kusu systém automaticky vytvoří:

- `dmCode`
- `quickId`
- `markingStatus = unmarked`
- výchozí stav `new`
- výchozí lokaci `main_warehouse`

`markingStatus`:

- `unmarked`: DM vytvořen v systému, fyzicky neznačeno
- `marked`: DM fyzicky označen

DM kus s `markingStatus = unmarked` je platný kus v GSS a může být součástí zásoby. Fyzické označení laserem nebo štítkem může proběhnout později, typicky při prvním ostření, měření nebo servisu.

UI v DM detailu:

- zobrazuje `markingStatus`
- zobrazuje text `DM vytvořen v systému, fyzické označení zatím neprovedeno.`
- nebo `DM fyzicky označen.`
- nabízí akci `Označit jako fyzicky označené`
- po akci nastaví `markingStatus = marked`
- uloží datum označení
- zapíše záznam do historie DM kusu
- nemění DM kód ani QID

Textový výstup pro značení:

- DM kód pro laser
- QID pro štítek

### DM Kusy jako Zdroj Skladové Zásoby

Implementační pravidlo: pokud má položka zapnutý DM tracking, skladový souhrn se pro zobrazení a provozní kontrolu počítá z `dmItems[]`.

Mapování stavů:

- `new` -> celkem + dostupné + stav `Nový`
- `resharpened_new` -> celkem + dostupné + stav `Nový přebroušený`
- `used` -> celkem + dostupné + stav `Použitý`
- `reserved` -> celkem + rezervované
- `production` -> celkem + ve výrobě
- `sharpening` -> celkem + na broušení + ještě ve firmě
- `sharpening` se `sharpeningDispatchStatus = sent` -> celkem + na broušení + v brusírně / mimo firmu
- `in_grinding_shop` -> celkem + na broušení + v brusírně
- `blocked` -> celkem, ale ne dostupné
- `scrapped` -> není dostupné a není běžně vydatelné

Při vytvoření DM kusů:

- výchozí stav je `new`
- výchozí umístění je `main_warehouse`
- vytvořené kusy se okamžitě promítnou do souhrnu položky
- QID a DM kód se vytvoří současně

U položek bez DM trackingu zůstává dosavadní množstevní logika přes `stockSummary`.

Kompaktní zobrazení DM zásoby:

- základní řádek položky a detail položky zobrazují pouze agregované počty
- detailní seznam DM kusů není trvale rozbalený
- uživatel otevře DM seznam klikem na konkrétní stav nebo tlačítko `Zobrazit DM kusy`
- seznam lze filtrovat podle stavů: celkem, dostupné, nové, nové přebroušené, ve výrobě, na broušení, blokované, neoznačené
- konkrétní DM/QID kusy se nezobrazují automaticky při otevření detailu položky
- DM zásoba používá lazy expand: `agregované stavy -> klik -> konkrétní DM/QID kusy`
- klik na stejný stav rozpad zavře, klik na jiný stav přepne seznam na jiný stav
- lazy expand je nutný kvůli výkonu a přehlednosti u stovek až tisíců DM kusů

Detailní DM seznam zobrazuje:

- QID
- DM kód
- stav
- `markingStatus`
- sklad / lokaci
- aktuální rozměry
- poslední výdej / návrat
- akci detail

U položek bez DM tracking zůstává množství jako jednoduché číslo.

Výdej u DM položek:

- UI zobrazí pole `Načíst / zadat DM nebo QID`
- vstup může být DM kód nebo QID
- UI zároveň zobrazí klikací souhrn dostupných skupin: `Nový`, `Nový přebroušený`, `Použitý`
- klik na skupinu rozbalí konkrétní dostupné DM kusy v této skupině
- u každého kusu se zobrazí QID, DM kód, stav, aktuální rozměry, lokace, `markingStatus`, poslední servis / výdej a akce `Vybrat tento kus`
- klik na `Vybrat tento kus` vyplní konkrétní DM/QID kus pro výdej
- vyhledávání probíhá pouze nad `dmItems[]` vybrané položky
- automatický výběr prvního dostupného DM kusu je zakázaný
- dostupné pro výdej jsou pouze stavy `new`, `resharpened_new` a `used`
- nedostupné jsou stavy `reserved`, `production`, `sharpening`, `in_grinding_shop`, `blocked`, `scrapped`
- před výdejem UI ukáže QID, DM kód, aktuální rozměry, stav a lokaci konkrétního kusu
- tlačítko pro výdej je u DM položky aktivní až po nalezení dostupného kusu
- po výdeji se konkrétní DM kus nastaví na `status = production` a `location = production`
- k DM kusu se uloží `lastIssueMetadata`
- vznikne `movementHistory` záznam `issue_to_production`
- skladový souhrn se znovu přepočítá z `dmItems[]`

U položek bez DM trackingu zůstává množstevní výdej beze změny.

Budoucí standard GSS terminálu pro DM operace:

`položka -> souhrn podle stavů -> konkrétní DM kus -> akce`

Návrat z výroby u DM položek:

- UI zobrazí pole `Načíst / zadat DM nebo QID`
- vstup může být DM kód nebo QID
- UI zároveň zobrazí klikací skupinu `Ve výrobě`
- klik na `Ve výrobě` rozbalí konkrétní DM kusy aktuálně vedené ve výrobě
- u každého kusu se zobrazí QID, DM kód, aktuální lokace, stroj, zakázka, středisko, datum posledního výdeje, kdo výdej provedl a akce `Vybrat tento kus`
- klik na `Vybrat tento kus` vyplní konkrétní DM/QID kus pro návrat
- vyhledávání probíhá pouze nad `dmItems[]` vybrané položky
- množstevní návrat bez identifikace kusu je u DM položek zakázaný
- platný návrat je možný pouze pro DM kus ve stavu `production`
- pokud kus neexistuje, UI zobrazí `DM/QID kus nebyl nalezen.`
- pokud kus není ve výrobě, UI zobrazí `Kus není vedený ve výrobě.`
- před potvrzením návratu UI ukáže QID, DM kód, aktuální rozměry, stav a poslední výdej
- po potvrzení se mění stav přesně tohoto DM kusu podle rozhodnutí návratu
- k DM kusu se uloží `lastReturnMetadata`
- vznikne provozní `movementHistory`
- skladový souhrn se znovu přepočítá z `dmItems[]`

U položek bez DM trackingu zůstává množstevní návrat beze změny.

Terminálové pravidlo DM operací:

- Výdej: `Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní kus -> Akce`
- Návrat: `Položka -> Ve výrobě -> Konkrétní kus -> Rozhodnutí po návratu`
- Rezervace: `Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní DM/QID kus -> Rezervace`

### Skladové Lokace

Lokace není vlastností DM kusu. Lokace je obecná vlastnost GSS skladů.

Každý sklad může mít vlastní strukturu lokací:

- hlavní sklad
- dceřiný sklad
- výdejní automat

Příklady:

- Hlavní sklad -> Regál A -> Police 03 -> Box 12
- Dceřiný sklad CNC 5 -> Skříň B -> Šuplík 04
- Automat 01 -> Pozice D-12

Stejná položka může mít na každém skladu jinou lokaci.

DM kus v provozním zobrazení navíc ukazuje:

- QID
- aktuální lokaci
- aktuální rozměry
- stav
- rezervaci

Příklad:

```text
QID: KPL 14852

Lokace:
Hlavní sklad
Regál A
Police 03
Box 12
```

DM detail zobrazuje aktuální hodnoty konkrétního kusu. Důraz je na rychlou čitelnost po načtení kódu, například `MTTM MAXLIFE D=11,83 mm, L=24,73 mm`.

MVP sekce `Načíst DM kód` používá textové pole a tlačítko `Vyhledat DM`. Později bude stejné místo napojené na čtečku, která automaticky otevře detail konkrétního kusu.

Servisní zápis v DM detailu:

- nový aktuální průměr
- nová aktuální délka
- počet přebroušení
- povlak
- poznámka k servisu
- měřicí protokol / odkaz
- servis provedl, default `M-technologies`
- datum servisu

Po uložení se aktualizuje DM kus:

- `currentDiameter`
- `currentLength`
- `sharpeningCount`
- `coating`
- `serviceNote`
- `lastServiceAt`
- `lastMeasuredAt`
- `lastMeasurementProtocol`
- `status = resharpened_new`
- `location = main_warehouse`

M-technologies / Gogrou je výchozí servisní autorita zdarma. Servisní partner po načtení DM kódu otevře konkrétní nástroj zákazníka a zapíše aktuální parametry po broušení. Jiná brusírna jako servisní partner bude později řešená placenou autorizací; detailní fee model není součást MVP.

Helichek / měřicí protokol:

- M-technologies může po měření generovat protokol
- později může měřicí zařízení posílat data přímo do Gogrou
- systém podle DM kódu zapíše konkrétní hodnoty ke konkrétnímu kusu
- v MVP se hodnoty i protokol zadávají ručně

Blokovaný DM kus:

- detail ukáže `Tento kus je blokovaný`
- zobrazí důvod blokace
- blokovaný kus nesmí být vydán do výroby

Limit přebroušení:

- pokud `sharpeningCount >= maxSharpeningCount`, UI zobrazí `Tento nástroj dosáhl limitu přebroušení. Doporučeno vyřadit.`
- automatické vyřazení není součást MVP

Export aktuálních hodnot:

- v UI je pouze placeholder `Exportovat aktuální parametry`
- budoucí cíle jsou korekce do stroje, podklad pro programátora a servisní report

Mimo MVP zůstává fyzický tisk DM kódů, integrace čteček, Helichek API, automatické měřicí protokoly, plný servisní portál, billing externích brusíren, detailní oprávnění, backend / DB / auth a export do CNC / strojů.

### Soft MVP Odeslání DM Kusů Na Broušení

Implementační cíl: DM kus ve stavu `sharpening` musí jít označit jako fyzicky odeslaný servisnímu partnerovi, aniž by se ztratil jeho provozní stav `Na broušení`.

Datové pole:

`sharpeningDispatchStatus`

- `waiting`: čeká na odeslání
- `sent`: odesláno na broušení
- `serviced`: servis zapsal nové parametry po broušení
- `returned`: vráceno z broušení

UI tok:

1. Uživatel otevře detail položky.
2. V DM zásobě klikne na skupinu `Na broušení`.
3. U konkrétního QID/DM kusu klikne `Odeslat na broušení`.
4. Formulář obsahuje servisního partnera, box / bedýnku / sběrné místo, poznámku, datum odeslání a kdo provedl.
5. Po potvrzení se DM kus ponechá ve stavu `sharpening`.
6. Nastaví se `sharpeningDispatchStatus = sent`.
7. `location` se nastaví na `grinding_shop`.
8. Uloží se `sharpeningDispatchMetadata`.
9. Zapíše se DM history a `movementHistory`.

MVP textový výstup:

- textarea `Dodací podklad broušení`
- obsahuje datum, brusírnu, položku, QID, DM, pokyny k broušení, výkres / přílohu, povlak a poznámku
- PDF, číslování dodacích listů, e-mail a backend nejsou součást MVP

### Soft MVP Servisní Terminál M-Technologies

Servisní terminál je v MVP interní panel v `/app/gss`. Simuluje budoucí servisní portál M-technologies.

Tok:

1. Servis zadá / načte DM kód.
2. GSS najde konkrétní DM kus.
3. Pokud kus neexistuje, zobrazí `DM kus nebyl nalezen.`
4. Pokud kus není `sharpening` nebo nemá `sharpeningDispatchStatus = sent`, zobrazí `Kus není vedený jako odeslaný na broušení.`
5. Servis vidí QID, DM kód, položku, zákazníka, GPC ID / GTIN, aktuální rozměry před broušením, historii, poslední výdej / návrat, pokyny k broušení, výkres / přílohu, povlak a poznámky.
6. Servis zadá nové parametry po broušení: `D`, `L1`, `L2`, další parametry, servisní poznámku, kdo provedl a datum servisu.
7. Po uložení se nastaví `sharpeningDispatchStatus = serviced`.
8. DM status zůstává `sharpening`, dokud zákazník nepotvrdí příjem zpět.
9. Uloží se `lastServiceMetadata`, zvýší se počet přebroušení, zapíše se DM history a `movementHistory`.
10. QID a DM kód se nemění.

Terminál po uložení nabídne textový štítek:

- výrazné QID
- název položky
- aktuální rozměry
- DM kód
- datum posledního servisu
- servisního partnera

Implementačně jde o sdílený print-friendly render pro servisní terminál i detail konkrétního DM/QID kusu. V MVP tlačítko `Tisk štítku` používá `window.print()` a CSS pro tisk pouze štítku, bez zbytku aplikace. Po kliknutí vznikne DM history záznam `label_printed` s metadaty:

- QID
- DM
- `D`
- `L1`
- `L2`
- datum tisku
- provedl
- zdroj: `servisní terminál` nebo `detail kusu`

Po každé změně parametrů po broušení se panel `Štítek nástroje` automaticky zobrazí, aby M-technologies mohla ihned vytisknout aktuální štítek.

### Soft MVP Příjem Z Broušení

Příjem z broušení je samostatný tok pro konkrétní DM/QID kus. Běžný příjem znamená nové kusy; příjem z broušení znamená návrat už existujícího DM kusu po servisu.

UI tok:

1. Uživatel otevře `Příjem z broušení`.
2. Zadá / načte DM nebo QID, nebo použije skupiny:
   - `Odesláno na broušení`
   - `Servis dokončen / čeká na příjem`
3. Vybere konkrétní DM kus.
4. Doplní datum příjmu, kdo provedl, poznámku a cílový sklad / lokaci.
5. Pokud kus nemá `sharpeningDispatchStatus = serviced`, GSS zobrazí varování `U tohoto kusu nejsou uložené servisní rozměry z brusírny.`
6. V MVP lze příjem povolit i s varováním po potvrzení výjimky.

Po potvrzení:

- `status = resharpened_new` jako MVP stav pro nový přebroušený kus
- architektonický alias cílového stavu je `resharpened`
- `sharpeningDispatchStatus = returned`
- `location = main_warehouse` nebo zvolená lokace
- uloží se `sharpeningReturnMetadata`
- kus se počítá jako dostupný
- zapíše se DM history a `movementHistory`
- aktuální rozměry zůstávají ty, které zadala M-technologies

Blokace běžného naskladnění:

- pokud má položka DM tracking a uživatel v běžném `Naskladnit` zvolí `Nový přebroušený`, GSS zobrazí upozornění
- běžné naskladnění `Nový přebroušený` u DM položky nesmí vytvářet anonymní nové DM kusy
- pro DM položky se přebroušený kus vrací přes `Příjem z broušení`

Budoucí servisní směr:

- brusírna načte DM kód přes servisní přístup
- uvidí pokyny k broušení, výkres, povlak a historii
- doplní nové rozměry po broušení a měřicí protokol
- po návratu se kus nastaví na `resharpened` / v MVP `resharpened_new`
- QID a DM kód se nikdy nemění

## GSS Onboarding Engine / Hromadný Import a Konfigurační XLS

GSS musí počítat s onboarding vrstvou pro pilotní zákazníky. Tato vrstva má umožnit rychle převzít existující skladová data zákazníka, spárovat je proti GPC a potom hromadně doplnit tenant provozní pravidla.

### Vstupní Scénář A: Existující Data Zákazníka

Zdroje:

- ERP export
- export z výdejního automatu
- XLS / CSV seznam
- interní skladový seznam

Párování proti GPC:

- GTIN
- GID
- objednací číslo
- výrobce + objednací číslo
- čárový kód
- přesný název
- podobnost názvu

Výstup pro uživatele:

`Z 1678 položek bylo v GPC nalezeno 1234. Chcete je převzít do GSS?`

Nalezené GPC položky se převezmou do tenant GSS skladu jako skladové položky s referencí na GPC. Nenalezené položky se vytvoří jako lokální / nevalidované položky v daném tenant GSS.

### Vstupní Scénář B: Zákazník Data Nemá

Pokud zákazník nemá vstupní export, skladový seznam vzniká postupně:

- ruční založení položky
- načtení čtečkou
- doplňování při běžném provozu

GSS musí i v tomto režimu umožnit kdykoliv vygenerovat konfigurační XLS pro hromadné doplnění pravidel.

### Konfigurační XLS

Konfigurační XLS není běžný import položek. Je to hromadná konfigurace skladu a musí být vždy generovatelná z GSS.

Sloupce / oblasti konfigurace:

- min
- max
- warning limit
- DM tracking ano/ne
- brousit ano/ne
- max počet přebroušení
- povlak
- nadnormativa ano/ne
- lokace
- preferovaný dodavatel
- objednací násobek
- poznámka
- interní kód zákazníka
- odpovědná osoba / role
- zákaznická omezení
- aktivní/neaktivní položka

### Odpovědnost Dat

GPC odpovídá za:

- technickou identitu položky
- výrobce
- GTIN/GID
- technické parametry
- ToolsUnited strukturu
- obrázky / datasheety / odkazy

GSS XLS odpovídá za:

- provozní pravidla zákazníka
- skladovou logiku
- nákupní logiku
- servisní logiku
- lokace
- zákaznickou konfiguraci

Import ani konfigurační XLS nesmí měnit GPC master data. Upravuje pouze tenant provozní vrstvu GSS.

### Delegování Konfigurace

Konfigurační XLS má zákazníkovi umožnit delegovat doplnění dat na:

- technology
- nákup
- skladníky
- seřizovače
- výrobu

Tento postup je nutný u zákazníků se stovkami až tisíci položek, kde by ruční editace přímo v GSS byla pomalá a organizačně nepraktická.

### Budoucí Doporučení GSS / GINA

Systém může později nad importovanými položkami doporučit:

- zapnout DM tracking u drahých / brousitelných nástrojů
- zapnout nadnormativy
- upravit min/max podle spotřeby
- označit položku jako servisovatelnou
- doporučit sledování životnosti

Příklad pravidla:

`Monolitní fréza, vysoká cena, brousitelná položka -> doporučit DM tracking.`

### GINA Onboarding Analytics

Budoucí služba `GINA Onboarding Analytics` je AI návrh GSS skladu ze skutečné historické spotřeby zákazníka.

Vstup:

- spotřeba položek za 6-12 měsíců
- ERP export
- výdejní automat
- XLS / CSV

GINA navrhne:

- spárování položek s GPC
- aktivaci položek do GSS
- doporučené min/max
- doporučené warning limity
- DM tracking ano/ne
- brousitelnost
- servisní logiku
- nadnormativy
- preferované položky
- položky ke sloučení / duplicitní položky
- položky k vyřazení

Výstup:

- návrh GSS konfiguračního XLS
- přehled nalezených položek v GPC
- přehled nenalezených položek
- doporučení pro zákazníka

Toto není MVP implementace. Jde o budoucí placenou AI službu nad onboardingem zákazníka.

### Pilotní Zákazníci

Onboarding Engine je důležitý pro pilotní zákazníky, kteří už dnes mají data z:

- výdejních automatů
- ERP
- skladových systémů
- Excelů

Cílem je rychle dostat jejich reálný sklad do GSS bez ruční práce a bez míchání zákaznické provozní konfigurace do GPC master dat.

### MVP Rozsah

Pro MVP jde o návrhový směr a architektonický požadavek.

Mimo MVP zůstává:

- plný parser XLS/CSV
- UI import
- backend importní pipeline
- validace XLS
- ERP integrace
- integrace výdejních automatů

GSS architektura s touto onboarding vrstvou musí počítat od začátku.

## Komunikační Vrstva pro Nadnormativy

Nadnormativní nabídka mezi firmami není pouze skladový záznam. Aby dávala obchodně smysl, musí být doplněná o komunikační workflow mezi kupující a prodávající firmou.

MVP směr:

- u nadnormativní nabídky bude akce `Mám zájem`
- po kliknutí vznikne `inquiry` / poptávkový kontakt
- inquiry je navázaná na konkrétní nabídku, kupující firmu a prodávající firmu

Základní pole inquiry:

- kupující firma
- prodávající firma
- položka
- počet kusů
- zpráva
- stav: `nový`, `řeší se`, `potvrzeno`, `zamítnuto`, `dokončeno`

Komunikační kanály:

- interní zpráva v Gogrou
- e-mail upozornění jako fallback

Budoucí workflow:

- Gogrou chat mezi firmami
- komunikační vlákno navázané na konkrétní nadnormativní nabídku
- potvrzení dostupnosti
- potvrzení ceny
- dohoda dopravy / předání
- přechod do objednávky / RFQ

Důležité pravidlo: nadnormativa nemusí být 100% aktuální. Nabízející firma musí potvrdit, že položku stále má. Komunikace musí být auditovatelná, aby bylo dohledatelné, kdo projevil zájem, kdo nabídku potvrdil, za jakých podmínek a s jakým výsledkem.

V této etapě se nic neprogramuje. Jde pouze o architektonický zápis budoucí Gogrou komunikační vrstvy.

## Hlídací Pes / Watchdog

Hlídací pes je budoucí obchodní a notifikační služba Gogrou. Umožní zákazníkovi nastavit, co chce sledovat, a Gogrou za něj bude vyhledávat relevantní příležitosti napříč nadnormativami, cenami, akcemi, Gogrou partner nabídkami, SS / RFQ / Promitea výsledky a budoucí obchodní vrstvou.

Implementační pravidlo pro MVP: v této etapě se nic neprogramuje. Zapisuje se pouze budoucí model a workflow, aby pozdější UI, DB a notifikace měly jasný směr.

Hlídací pes sleduje například:

- cenu konkrétní položky
- nadnormativy
- akce
- alternativní nabídky
- nabídky Gogrou partnerů
- budoucí SS / RFQ / Promitea výsledky

Hlídací pes není objednávka. Je to upozornění / obchodní příležitost. Teprve po reakci uživatele může vzniknout inquiry, poptávka, RFQ nebo objednávka.

### Hlídání Položky

U tenant skladové položky bude později možné zapnout akci `Hlídat položku`.

Základní nastavení:

- cílová cena
- procento pod poslední nákupní cenou
- hlídat pouze nadnormativy
- hlídat Gogrou partner nabídky
- aktivní / neaktivní
- poznámka

Hlídání položky vychází z tenant provozních a obchodních dat GSS, například z poslední nákupní ceny, dodavatele a historie nákupů. GPC zůstává pouze master technický katalog.

### Hlídání Podle Parametrů

Později bude možné vytvořit watchdog bez konkrétní položky, pouze podle parametrů. Příklad:

- tvrdokovová fréza
- průměr D12
- 4 zuby
- HPC
- konkrétní výrobce / bez výrobce
- maximální cena
- dostupnost

Tento režim může využít GPC parametrická data a obchodní vrstvy nad GPC. Cílem je najít vhodnou položku nebo alternativu, i když ji zákazník zatím nemá ve svém GSS skladu.

### Datový Model

Budoucí dokumentační model `watchdog`:

- `id`
- `organizationId`
- `userId`
- `type`: `item` nebo `parameter_search`
- `itemId`
- `gpc_id`
- `gtin`
- `filters`
- `targetPrice`
- `compareToLastPurchasePrice`
- `targetDiscountPercent`
- `overstockOnly`
- `gogrouPartnerOnly`
- `active`
- `createdAt`
- `updatedAt`

### Výsledek Shody

Pokud Gogrou najde shodu, vytvoří upozornění. Upozornění ukáže:

- odkud nabídka je
- cenu
- dodavatele
- stav dostupnosti
- možnost vytvořit inquiry / poptávku / objednávku

Hlídací pes bude napojený na komunikační vrstvu:

- notifikace
- interní Gogrou zprávu
- e-mail fallback
- později push do Gogrou app

### GINA Směr

GINA může nad Hlídacím psem později doporučovat:

- tuto položku kupujete draze
- existuje levnější alternativa
- objevila se nadnormativa
- je vhodné vytvořit RFQ
- akce SS je výhodná proti vaší historii nákupů

Mimo MVP zůstává backend, DB, AI matching, skutečné notifikace, marketplace a platby.

## GSS Terminál A Skladové Položky

Implementační směr hlavní obrazovky GSS:

- horní část je pouze kompaktní kontext aktivní firmy a hlavního skladu
- hlavní obrazovka je rozdělena na dvě pracovní sekce: `TERMINÁL` a `SKLADOVÉ POLOŽKY`
- terminálové procesy se otevírají jednotlivě a po otevření schovají ostatní sekce
- uživatel se vrací přes `Zpět na Terminál`
- skladové položky zůstávají kompaktní řádkový seznam s detailem po kliknutí

Terminál obsahuje dlaždice:

- Příjem
- Výdej
- Návrat z výroby
- Rezervace
- Odeslat na broušení
- Příjem z broušení
- Servisní terminál M-technologies
- Načíst DM/QID

MVP může mít aktivní dlaždicové zobrazení. Přepínač `Dlaždice / Seznam` je připravený pro budoucí režim.

Terminálové pravidlo:

`Akce -> chytré hledání / načtení kódu -> položka -> konkrétní stav / kus -> provedení operace`

Výdej DM kusů:

- může proběhnout jako výdej jednoho načteného DM/QID kusu
- může proběhnout jako hromadný výběr více konkrétních DM/QID kusů
- hromadný výběr používá skupiny `new`, `resharpened_new`, `used`
- vybraný kus je vizuálně odlišený a lze jej odebrat z výběru
- UI zobrazuje počet vybraných kusů
- potvrzení probíhá tlačítkem `Vydat vybrané kusy`
- každý kus se zapíše do DM history a dostane stejné `lastIssueMetadata`
- skladová zásoba se po výdeji přepočítá z `dmItems[]`
- rezervované kusy nejsou součástí běžného hromadného výdeje a vydávají se pouze přes Release Code nebo override

Skladové položky:

- používají chytré tokenové hledání
- podporují název, výrobce, GTIN, GID, DM, QID, interní kód a parametry
- podporují volné kombinace typu `freza 12 4z`, `Walter D12 L25`, `VBD CNMG`
- mohou být řazené podle nejčastějšího nebo posledního použití
- později může být řazení personalizované podle uživatele, role nebo pracoviště

Řádek položky:

- vlevo: název, typ / kategorie / výrobce, GPC ID / GTIN
- uprostřed: celkem, dostupné, nový, nový přebroušený, použitý, rezervované, ve výrobě, na broušení, blokované
- min/max, warning, DM nastavení a nadnormativa patří do detailu nebo nastavení, ne jako hlavní informace řádku

Globální UX symbol:

`◢ = konkrétní kusy / DM/QID rozpad`

Pokud je `◢` za číslem, údaj reprezentuje konkrétní DM/QID kusy a může se rozbalit na seznam konkrétních kusů. Bez `◢` jde o běžnou množstevní evidenci.

Detail položky:

- ukazuje identitu položky, skladové počty a DM rozpad
- nastavení položky se otevírá tlačítkem
- historie pohybů se otevírá tlačítkem
- akce jako Výdej, Návrat, Rezervace, Příjem a Broušení mají používat stejnou terminálovou logiku, pouze s předvyplněnou položkou
- akce `Zobrazit GPC detail` ukazuje technická data z GPC vazby, ne lokálně uloženou kopii technického katalogu

Pokud je otevřená konkrétní akce nad položkou, UI schová dlouhé podpůrné sekce detailu a ponechá pouze stručnou identitu, skladové počty, informaci o DM/QID a aktivní formulář. Akční panel se má objevit hned pod identitou položky a po otevření se má stránka posunout na začátek detailu.

GPC / GSS datové pravidlo:

- GSS ukládá provozní data zákazníka: zásoby, min/max, DM/QID, broušení, lokace, historii, rezervace a servisní cyklus
- GPC je zdroj technických dat: parametry, GPC ID, GTIN, výrobce, výkresy, katalogová data, ToolsUnited vazby a technické přílohy
- GSS si technická data pouze zobrazuje nebo dotahuje podle `gpc_id` / GTIN
- pokud GPC detail není dostupný, UI zobrazí placeholder `GPC detail bude načten z GPC / ToolsUnited v další fázi`

Návratová tlačítka:

- `Zpět na Terminál` vrací na hlavní terminálové dlaždice
- `Zpět na skladové položky` vrací na seznam položek
- `Zpět na detail položky` zavře konkrétní formulář a ponechá detail položky
- ve skladovém režimu má být sticky nebo floating tlačítko `Zpět na hlavní GSS`

Feature flags a placené moduly:

- větší služby musí být připravené na zapnutí / vypnutí pro konkrétního zákazníka
- příklady: DM tracking, Nadnormativy, Servisní terminál, GINA služby, XLS onboarding, Kooperace, Toolshop, Reporty, Automat / PLC napojení
- MVP neřeší billing, ale implementace nesmí předpokládat, že všechny funkce budou vždy aktivní pro každého zákazníka

## Servisní Zásilka / DL Broušení - MVP Skeleton

První implementační krok nad servisním terminálem je zavedení soft MVP objektu `serviceShipment` v localStorage.

### Datová Struktura

`serviceShipment`:

- `id`
- `shipmentNumber`
- `sourceDocumentNumber`
- `customerOrganizationId`
- `customerName`
- `servicePartnerId`
- `servicePartner`
- `status`
- `createdAt`
- `sentAt`
- `receivedByServiceAt`
- `completedAt`
- `items[]`
- `history[]`
- `note`

Stavy v MVP:

- `received_by_service`
- `in_service`
- `partially_completed`
- `return_ready`

`servicePartnerId` je klíčové pole. Servisní terminál smí zobrazit pouze zásilky přiřazené aktuálnímu servisnímu partnerovi. V MVP je výchozí servisní partner M-technologies, ale struktura musí být připravená na jiné brusírny / servisní partnery.

Budoucí servisní partneři mohou být například:

- M-technologies
- Walter Service
- Mapal Service
- externí brusírna
- lokální servisní partner zákazníka

Zákazník musí mít možnost přesunout ostření / servis k jinému partnerovi bez změny základní logiky GSS. Implementace proto nesmí vázat servisní workflow natvrdo na M-technologies. Změní se pouze `servicePartnerId`; princip zásilky, návratové zásilky, DM historie, štítků a příjmu z broušení zůstává stejný.

`serviceShipmentItem`:

- `id`
- `type`: `dm` / `quantity`
- `itemId`
- `itemName`
- `origin`
- `gpc_id`
- `gtin`
- `dmTrackingEnabled`
- `quantitySent`
- `quantityServiced`
- `quantityNotServiced`
- `quantityReadyToReturn`
- `status`
- `note`
- `dmItems[]` pouze pro DM položky

### Dva Samostatné Doklady Servisního Workflow

Servisní workflow musí používat dva samostatné doklady.

#### `ServiceShipment`

Vzniká u zákazníka při akci `Odeslat na broušení`. Reprezentuje zásilku od zákazníka k servisnímu partnerovi.

Obsahuje:

- zákazníka
- `servicePartnerId`
- číslo dokladu / DL / objednávky
- položky
- DM kusy
- non-DM množství
- datum odeslání
- stav
- historii

#### `ReturnShipment`

Vzniká u servisního partnera při akci `Odeslat k zákazníkovi`. Reprezentuje návratovou zásilku ze servisu zpět zákazníkovi.

Obsahuje:

- vlastní číslo dokladu
- zákazníka
- odkaz na původní `ServiceShipment`
- hotové kusy
- neostřené kusy
- DM/QID kusy
- non-DM množství
- datum odeslání zpět
- stav
- historii

`ServiceShipment` a `ReturnShipment` se nesmí spojovat do jednoho dokladu. Jde o dvě různé fyzické i procesní události: zákazník odesílá nástroje do servisu a servisní partner vrací nástroje zpět. Každá událost musí mít vlastní auditní stopu.

Důvody:

- reklamace
- dohledání
- tisk DL
- historie
- budoucí doprava
- více servisních partnerů

Jeden `ServiceShipment` může mít jeden nebo více `ReturnShipment`, pokud se zásilka vrací částečně.

Neostřené položky musí být v `ReturnShipment` jasně označené. Při příjmu `ReturnShipment` u zákazníka se nabídne rozhodnutí:

- vyřadit / archivovat / zablokovat
- vrátit do stavu `Použité`

### UI Skeleton

V panelu `Servisní terminál M-technologies` se zobrazí sekce `Servisní zásilky`:

- režim `Dle zákazníka`: seznam zákazníků s otevřenou servisní zásilkou přiřazenou aktuálnímu servisnímu partnerovi
- po výběru zákazníka seznam jeho otevřených GSS objednávek / DL / servisních zásilek
- režim `Dle čísla objednávky / DL`: zadání nebo načtení čísla dokladu vytvořeného v GSS při akci `Odeslat na broušení`
- nalezený doklad otevře konkrétní zásilku přímo
- seznam demo zásilek
- detail vybrané zásilky
- souhrn: odesláno / hotovo / neostřeno / připraveno k odeslání
- DM položka ukáže seznam QID/DM kusů a tlačítko `Otevřít servis kusu`
- non-DM položka umožní zadat `hotovo ks`, `neostřeno ks` a poznámku
- tlačítko `Označit zásilku jako připravenou k odeslání` nastaví stav `return_ready`

Detail zásilky v MVP skeletonu musí zobrazit zákazníka, číslo objednávky / DL, datum odeslání, stav zásilky, položky s DM i bez DM, souhrnné počty a možnost zpracování jednotlivých položek.

MVP skeleton neřeší:

- tisk dodacího listu
- návratovou zásilku jako samostatný skladový převod
- příjem u zákazníka
- vyřazení neostřených položek
- PDF / e-mail / backend / DB

## Kontextové Vyhledávání V GSS - Implementační Pravidlo

Každá terminálová nebo skladová akce v GSS musí nejdřív určit relevantní provozní množinu podle kontextu a až potom nad ní aplikovat hledání.

Správný implementační tok:

`proces / obrazovka -> relevantní stavová množina -> hledání: název, rozměr, DM, QID, GPC ID, GTIN, lokální ID -> výsledek`

Zakázaný tok:

`hledání v celém skladu -> až následné procesní rozhodnutí`

### Kontextové Množiny

- Výdej do výroby: pouze položky dostupné k výdeji ve vybraném stavu (`Nový`, `Nový přebroušený`, `Použitý`, po servisu). Pokud v daném stavu není dostupný kus, položka se nemá zobrazit.
- Návrat z výroby: pouze položky / DM kusy aktuálně vydané do výroby.
- Rezervace: pouze rezervovatelné kusy, případně aktivní rezervace podle rezervačního kódu.
- Odeslání na broušení: pouze použité / rozhodnuté kusy určené k broušení.
- Příjem z broušení: pouze kusy odeslané na broušení nebo servisně dokončené.
- Servisní terminál: pouze kusy u servisního partnera, na broušení nebo v servisní zásilce.
- Obecné načtení DM/QID: může hledat v celém tenant DM registru, ale detail musí jasně zobrazit aktuální provozní stav, aktuální lokaci a aktuální rozměry kusu.

### DM Detail

Detail načteného DM/QID kusu musí výrazně zobrazit:

- aktuální `D`
- aktuální `L1`
- aktuální `L2`
- počet přebroušení
- stav kusu
- aktuální lokaci

Tyto hodnoty jsou provozní GSS/DM data konkrétního fyzického kusu po broušení. Nejsou to GPC master data.

### Navržené Helpery

Kontextové filtrování má být postupně vytaženo do helperů:

- `getItemsForIssue`
- `getDmItemsForIssue`
- `getItemsForProductionReturn`
- `findDmForProductionReturn`
- `getItemsForReservation`
- `findDmForReservation`
- `getDmItemsForSharpeningDispatch`
- `getDmItemsForSharpeningReturn`
- `findDmForSharpeningReturn`
- `getDmItemsForServiceTerminal`
- `findDmForServiceTerminal`
- `matchesGssSearch`
- `buildItemSearchHaystack`
- `buildDmSearchHaystack`
