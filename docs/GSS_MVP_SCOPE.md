# GSS MVP Scope

## Cíl

Tento dokument definuje finální MVP rozsah GSS tak, aby zákazníkovi dával reálný smysl už při prvním používání.

GSS MVP musí být jednoduchý, ale musí okamžitě ukázat hodnotu:

- přehled skladu
- napojení na GPC
- DM evidence
- nadnormativní položky
- poptávka/export do Promitea
- základ ceníků/toolshop logiky

GSS je zákaznický provozní svět. GPC je validovaný zdroj master dat.

Dokument neřeší UI a neprogramuje backend.

## 1. Firma / Organizace / Tenant

Gogrou MVP začíná obecnou entitou firma / organizace, tedy tenant. GSS je pouze jeden z modulů, který může být pro firmu aktivní.

Firma nemusí mít sklad ani výrobu. Stejná tenant entita může reprezentovat výrobní firmu, výrobce nástrojů, dodavatele, servisní firmu, konzultanta nebo obchodní společnost.

Registrace firmy není součástí GSS. Cílově se firma registruje do obecné Gogrou aplikace přes `/register`, po přihlášení vstupuje do zákaznického portálu `/app` a dostupné moduly se zobrazí podle aktivace, trialu nebo zaplaceného předplatného.

GSS není vstupní brána do Gogrou. GSS je pouze modul pro firmy, které řeší sklad, nástroje a DM tracking. Firma může existovat bez GSS.

Cílová struktura aplikace:

- `/register`: registrace nové firmy do Gogrou
- `/app`: zákaznický portál po přihlášení
- `/app/gss`: GSS modul, pouze pokud má firma aktivní GSS
- `/app/toolshop`: obchodní / nabídky / nákupní modul
- `/app/services`: služby, například broušení, povlakování, kalírna nebo poradenství
- `/admin`: interní Gogrou správa, zatím neprecizovaná
- `/admin/organizations`: interní Gogrou správa firem / organizací

Příklady firem bez GSS:

- obchodní firma může používat Toolshop / nabídky bez GSS
- výrobce nástrojů může používat datový kanál / obchodní vrstvu bez GSS
- službová firma může používat services profil bez GSS

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

V MVP jsou firmy uložené lokálně v `localStorage` jako demo tenant model. Společný klíč pro registraci, budoucí zákaznický portál a interní Gogrou správu je `gogrou_organizations`. Produkční verze bude ukládat firmy / organizace v databázi a bude mít samostatnou auth vrstvu pro přihlášení uživatelů.

Firmu může založit zákazník sám přes `/register`, nebo ji může předem založit Gogrou tým pro trial/demo. Gogrou může firmu ručně aktivovat, pozastavit nebo blokovat. Později bude aktivace navázána na platební bránu a subscription workflow.

### Interní Gogrou Správa Firem

Route `/admin/organizations` je v MVP interní Gogrou administrační pohled na firmy / organizace. Gogrou tým zde vidí všechny založené firmy a může je provozně spravovat.

Gogrou tým může:

- vyhledat firmu
- otevřít firmu
- změnit stav firmy
- vidět billing status
- vidět aktivní moduly
- ručně aktivovat firmu
- ručně pozastavit firmu
- ručně blokovat firmu

Zákazník v budoucnu neuvidí seznam všech firem. Po přihlášení uvidí pouze svůj tenant, svoje aktivované moduly a svoje data. Budoucí zákaznický vstup bude oddělený od interní Gogrou administrace.

Gogrou admin pohled není finální zákaznický portál. Jde o interní operační / administrační vrstvu Gogrou. Zákaznický tenant portál bude oddělený.

Registrace firmy a správa firmy jsou nad GSS. GSS je pouze modul, který může být pro organizaci aktivní.

Firma může mít více aktivních modulů, různé billing stavy a více typů organizace současně.

Příklady kombinací:

- výrobní firma + brusírna
- výrobce + toolshop
- obchodník + služby

Budoucí role se rozdělí na:

- Gogrou Super Admin
- Gogrou Support/Admin
- zákaznický tenant admin
- běžný zákaznický uživatel

V MVP se auth zatím neimplementuje. Texty a model pouze připravují architekturu interní a zákaznické role.

Firma má stav:

- `draft`
- `trial`
- `pending_payment`
- `active`
- `paused`
- `blocked`
- `archived`

Význam stavů:

- `draft`: firma je rozepsaná nebo čeká na dokončení registrace.
- `trial`: firma může dočasně používat vybrané moduly bez potvrzené platby.
- `pending_payment`: firma čeká na potvrzení platby nebo objednávky služby.
- `active`: firma má aktivní službu a může používat zaplacené nebo povolené moduly.
- `paused`: firma je dočasně pozastavená, typicky administrativně nebo obchodně.
- `blocked`: firma je zablokovaná kvůli bezpečnostnímu, platebnímu nebo provoznímu důvodu.
- `archived`: firma je historicky zachovaná, ale běžně se nepoužívá.

Firma může být aktivována:

- automaticky po potvrzení platby
- ručně administrátorem Gogrou
- dočasně přes trial režim

Firma může být pozastavena nebo zablokována. V MVP UI stačí základní správa firem: zobrazit stav firmy, změnit stav firmy, zobrazit billing status, zobrazit aktivní moduly a zobrazit zodpovědnou osobu.

### Subscription / Billing / Fee Model

Firma si při registraci nebo později v administraci vybere, které moduly Gogrou chce používat.

Princip:

- firma vybere `selectedModules`
- systém podle zvolených modulů ukáže orientační cenu / měsíční fee
- cenová politika se zatím nebude pevně programovat
- datový model musí být na billing připravený
- po potvrzení výběru vznikne `subscriptionPlan` / objednávka služby
- uživatel je v budoucnu naveden do platební brány
- po úspěšné platbě se nastaví `paymentConfirmedAt`
- vybrané a zaplacené moduly se propíšou do `activatedModules`
- firma může Gogrou ihned začít používat

Připravené billing pojmy:

- `selectedModules`
- `subscriptionPlan`
- `billingStatus`
- `trial`
- `active`
- `past_due`
- `cancelled`
- `paymentProvider`
- `paymentConfirmedAt`
- `activatedModules`

V MVP se platební brána neprogramuje a konkrétní cenová politika se nefixuje. GSS modul může být aktivní pouze tehdy, pokud je zaplacený nebo v trial režimu. Různé typy firem mohou mít různé moduly a různé fee.

Firma / organizace obsahuje:

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

Firma je základní hranice datové izolace. Všechna zákaznická provozní data v GSS musí být vázaná na konkrétní firmu. Osoby a kontakty budou později samostatná entita `users` / `contacts`; v MVP stačí základní kontaktní údaje přímo na firmě.

## 2. Uživatelé Firmy

Uživatel firmy je osoba, která pracuje v zákaznickém GSS prostoru.

Uživatel obsahuje:

- jméno
- e-mail
- telefon
- roli
- stav aktivní/neaktivní
- vazbu na firmu

Uživatel nevidí data jiné firmy. Přístup k operacím se řídí rolí.

Zodpovědná osoba firmy je hlavní kontaktní osoba tenant účtu. V budoucí produkční vrstvě zakládá nebo schvaluje další uživatele firmy. Přihlášení uživatele je budoucí auth vrstva, ne `localStorage` demo.

## 3. MVP Role

### ADMIN

Admin může spravovat zákaznický GSS prostor.

Oprávnění:

- správa firmy
- správa uživatelů
- nastavení skladu
- nastavení položek
- ERP / automat můstky
- nadnormativní položky
- poptávky / exporty

### POWER_USER / MISTR

Power user nebo mistr řeší běžné provozní skladové operace.

Oprávnění:

- skladové operace
- naskladnění
- výdej
- návrat
- blokace kusu
- broušení
- změna provozního stavu

### USER / OPERÁTOR

Operátor provádí základní provozní akce.

Oprávnění:

- hledání
- výdej
- návrat
- scan DM
- základní potvrzení operací

## 4. Hlavní Sklad Zákazníka

V GSS MVP má firma s aktivním modulem `GSS` jeden hlavní sklad.

Rozsah MVP:

- pouze hlavní sklad
- bez dceřiných skladů
- firma má jeden výchozí sklad
- položky ve skladu mohou být převzaty z GPC
- položky mohou být založeny lokálně jako nevalidované
- sklad drží zákaznický provozní stav položek a kusů
- všechny položky jsou vázané na firmu a hlavní sklad

Hlavní sklad je první pracovní prostor zákazníka. Má umožnit rychle vidět, co firma používá, co je skladem, co chybí, co je nadnormativní a co se má poptat.

## 5. Multi-Tenant Pravidlo

Firma vidí pouze svá data:

- svoje položky
- svoje DM kusy
- svoje uživatele
- svoje ceníky
- svoje nadnormativy
- svoje pohyby

GSS je multi-tenant zákaznické prostředí. Tenantová izolace je základní bezpečnostní pravidlo MVP.

## 6. GPC -> GSS

GPC je validovaná master databanka. GSS si z GPC přebírá validované položky do zákaznického provozního kontextu.

### Validovaná Položka z GPC

Validovaná položka převzatá z GPC má:

- GPC identitu
- výrobce
- produktový typ
- GTIN, pokud existuje
- technické parametry
- validovaný katalogový status
- vazbu na dokumentaci, pokud existuje

Po převzetí do GSS získává vlastní zákaznická nastavení, například min/max, DM tracking a skladovou historii.

### Datové Pravidlo GPC Reference v GSS

GSS nekopíruje kompletní GPC data.

GSS u validované položky ukládá pouze:

- `gpc_id`
- `gtin`
- případný malý snapshot pro rychlé zobrazení

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

### Lokální Nevalidovaná Položka v GSS

Pokud položka v GPC není, zákazník ji může založit lokálně v GSS.

Lokální nevalidovaná položka:

- existuje pouze v zákaznickém GSS
- existuje pouze v konkrétní organizaci / tenantovi
- má `origin = LOCAL`
- má `validationStatus = unvalidated`
- má `tenantOnly = true`
- není validovaným master záznamem
- nemá plnou GPC datovou kvalitu
- nemění GPC a nevytváří master data
- funguje okamžitě pro provoz firmy
- může sloužit jako podnět pro doplnění do GPC
- později může být validovaná a propojená s GPC

### Rozdíl Funkcí

Validovaná GPC položka může mít:

- technickou dokumentaci
- normativy
- kvalitnější alternativy
- AI doporučení
- automatické optimalizace
- vazbu na výrobce a budoucí aktualizace

Lokální nevalidovaná položka má v MVP hlavně provozní evidenci:

- lokální název
- zákaznický kód
- skladový stav
- DM kusy, pokud si je zákazník zapne
- poznámky
- pohyby a historii

### Povinná Data Pro Lokální Nevalidovanou Položku

Lokální položka nesmí být založená úplně volně bez základních parametrů. Nejde o plnou GPC validaci, ale o minimální provozní kontrolu, aby GSS nepřijímalo nepoužitelná data.

Společná povinná pole pro MVP:

- název položky
- typ položky
- výrobce nebo hodnota `neznámý`
- alespoň jeden identifikační údaj:
  - GTIN
  - interní kód zákazníka
  - stručný popis / rozměr

Pro nástroj typu vrták / fréza:

- průměr
- délka nebo poznámka k rozměru
- materiál nebo hodnota `neznámý`

Pro břitovou destičku:

- tvar / typ
- rozměr nebo označení
- materiál nebo hodnota `neznámý`

Pokud povinná data chybí, GSS položku neuloží a zobrazí hlášku:

`Pro založení lokální položky je nutné doplnit minimální povinné údaje.`

Detailní parametrické šablony podle typu položky se budou řešit později.

## 7. Lokální Nastavení Položky

Lokální nastavení položky patří do GSS, ne do GPC.

GSS tenant settings jsou lokální provozní pravidla konkrétní firmy. Nemění GPC master data, technické parametry ani katalogový status. Stejná GPC položka může mít u různých zákazníků jiné min/max hranice, DM tracking, pravidla broušení, blokace i interní poznámky.

MVP nastavení:

- `min`
- `max`
- `warning`
- `supplierPackQuantity`
- `supplierName`
- `supplierType`: `Gogrou partner`, `Standard supplier`, `Internal supplier`
- DM tracking ano/ne
- brousitelnost ano/ne
- max počet přebroušení
- poznámka k broušení
- zákaznické poznámky
- blokace položky
- důvod blokace
- blokace konkrétního kusu

Tato nastavení mohou být různá pro každého zákazníka, i když všichni používají stejnou GPC master položku.

## 8. DM Kusy

DM kus je konkrétní fyzický kus evidovaný v GSS.

MVP musí podporovat:

- evidenci konkrétního kusu
- stav kusu
- pohyb kusu
- výdej
- návrat
- broušení
- rozměry po broušení
- zákaz výdeje konkrétního kusu

Příklad stavů kusu:

- `stock`
- `issued`
- `returned`
- `sharpening`
- `blocked`
- `scrapped`

DM evidence je klíčová pro zákazníky, kteří potřebují sledovat reálný život nástroje, ne pouze agregované množství.

### Provozní Stavy Nástroje v GSS

Tyto stavy patří do GSS, ne do GPC.

GPC říká:

- co je produkt

GSS říká:

- kde je konkrétní kus
- v jakém je provozním stavu
- zda je použitelný
- zda má jít na broušení
- zda je dostupný k výdeji

GSS rozlišuje tyto provozní stavy zásoby nástroje:

#### Nový

Úplně nový nástroj, který nikdy nebyl vydán do výroby. Nemohl být broušený a nemohl se vrátit z výroby.

#### Nový Přebroušený

Nástroj po ostření, který aktuálně ještě nebyl vydán do výroby po posledním broušení. V minulosti už ale jako nový vydán byl.

#### Použitý

Nástroj byl vydán do výroby a vrátil se. Je stále použitelný a může být vrácen do skladu jako použitý. Tento stav je důležitý například pro krátké operace, kdy nástroj udělal jen několik děr a není potřeba brát nový nástroj.

#### Z Výroby / Na Broušení

Nástroj se vrátil z výroby a už není použitelný. Pokud je položka označená jako brousitelná, systém upozorní, že má jít na broušení.

U položky se eviduje:

- kdo brousí
- výchozí brusič: `M-technologies`
- možnost editovat brusiče
- provozní instrukce, například `dát do červené krabice`

### Objednávková Logika

Když GSS generuje objednávku, znamená to požadavek na nový nástroj.

Objednávka nesmí znamenat:

- použitý nástroj
- nový přebroušený nástroj
- nástroj vrácený z výroby

Objednávková potřeba se bude do budoucna počítat jako součet potřeb:

- hlavní sklad
- dceřiné sklady
- budoucí výdejní místa / automaty

V MVP je pouze hlavní sklad, ale logika musí být připravená na budoucí rozpad podle skladů a výdejních míst.

### Objednávkový Návrh

Objednávkový návrh je tenant provozní logika GSS. Nevzniká v GPC a nemění GPC master data.

Objednávka vždy znamená nový nástroj. Nikdy nejde o:

- použitý nástroj
- nový přebroušený nástroj
- nástroj na broušení
- kus ve výrobě
- rezervovaný kus

GSS automaticky hledá položky, které mají nastavené `min` a `max` a jejich skutečně volné `available` je menší než `min`.

Objednávka může vzniknout dvěma cestami:

- automaticky při poklesu na `min` nebo pod `min`
- ručně / mimořádně, pokud firma ví o budoucí zakázce, mimořádné spotřebě nebo plánovaném navýšení výroby

Ruční mimořádná objednávka je budoucí rozšíření objednávkového návrhu. I v tomto režimu objednávka vždy znamená nový nástroj / novou položku.

Do dostupného množství se nesmí počítat:

- `reserved`
- `production`
- `sharpening`
- `overstockReserved`

Návrh dopočítává objednávku do `max`.

Příklad:

- `min = 10`
- `max = 30`
- `available = 7`
- návrh objednat = 23 ks

Dodací násobek `supplierPackQuantity` určuje, po kolika kusech lze objednávat. Pokud není nastavený, používá se `1`.

Příklad:

- potřeba objednat = 23 ks
- `supplierPackQuantity = 10`
- výsledný návrh = 30 ks

U položky se eviduje dodavatel:

- `supplierName`
- `supplierType`

Objednávkový návrh se negeneruje jako jeden společný seznam všech položek. GSS musí návrh seskupovat podle kombinace:

- výrobce / značka položky
- přiřazený dodavatel položky
- nákupní kanál

GPC drží výrobce / značku. GSS drží dodavatele a nákupní kanál zákazníka. Objednávkový návrh vzniká kombinací těchto dvou informací.

Výrobce / značka se bere primárně z GPC. Dodavatel se nastavuje v GSS jako provozní a nákupní nastavení položky konkrétního zákazníka. Pokud dodavatel není vyplněný, GSS použije fallback `Gogrou` nebo `Neurčený dodavatel`.

Nákupní kanály:

- `Gogrou`
- `vlastní dodavatel zákazníka`
- `MAZAK Toolshop`
- `M-technologies`
- `jiný dodavatel`

Jeden objednávkový návrh nesmí míchat různé dodavatele. Oddělený návrh musí vzniknout pro každou kombinaci výrobce + dodavatel + nákupní kanál.

Příklad:

- Walter + Gogrou -> objednávkový návrh 1
- Walter + vlastní dodavatel -> objednávkový návrh 2
- Sandvik + MAZAK Toolshop -> objednávkový návrh 3
- MTTM + M-technologies -> objednávkový návrh 4

Cílem je, aby šel každý návrh později poslat správným nákupním kanálem nebo exportovat do Promitea / ERP bez ručního rozdělování položek.

Primární filozofie Gogrou je, aby zákazník měl pokud možno výrobce nebo partnera napřímo. Proto je preferovaný typ `Gogrou partner`.

Při vytváření objednávky musí být možné vybrat dodavatele:

- `Gogrou` / `Gogrou partner` jako default
- jiný uložený dodavatel zákazníka
- nový dodavatel
- dodavatel z aktuální nabídky / akce / Promitea / SS

V budoucnu má GSS před vytvořením objednávky porovnat dostupné možnosti:

- nadnormativa v Gogrou komunitě
- aktuální cena od Gogrou partnera
- běžící cenová akce
- SS nabídka
- Promitea / RFQ výsledek
- ceníky jiných dodavatelů stejné položky

U nadnormativy je nutné ověřit aktuální dostupnost u nabízející firmy, protože stav nabídky nemusí být vždy 100% aktuální.

GSS má zákazníkovi zobrazit, kde lze položku pořídit, za kolik, od koho a za jakých podmínek. Zákazník následně vybere, kde chce objednávku vytvořit.

Objednávkový balíček `purchaseProposal` obsahuje:

- `id`
- `createdAt`
- `createdBy`
- `organization`
- `supplier`
- `status`: `draft`, `exported`, `sent`, `completed`
- `items`

Položka návrhu obsahuje:

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

Uživatel může položku z návrhu vyřadit, změnit množství nebo doplnit poznámku.

Generování objednávky je v MVP placeholder. Budoucí objednávka bude generovaná jako PDF a bude obsahovat:

- údaje zákazníka
- dodavatele
- položky
- množství
- poznámky
- datum

Objednávku bude možné uložit, odeslat e-mailem, distribuovat Gogrou kanálem nebo exportovat.

MVP placeholdery:

- `Porovnání nabídek`
- `Ruční objednávka`
- `Vygenerovat objednávku`
- `Export XLS / Promitea`
- `Odeslat objednávku`

Placeholder tlačítka v MVP nesmí působit jako hotová funkce. UI je musí jasně označit textem `Připravuje se` nebo po kliknutí zobrazit hlášku `Tato funkce bude doplněna v další fázi.`

Pokud už existuje rozpracovaný objednávkový návrh ve stavu `draft`, nové vytvoření návrhu nesmí potichu založit další návrh. MVP musí uživatele upozornit, že draft existuje, a vyžádat jednoduché potvrzení pro vytvoření nového návrhu a přepsání aktuálního draftu.

Při vytvoření návrhu vzniká `movementHistory` záznam `purchase_proposal_created`.

Budoucí integrace:

- Promitea
- XLS
- RFQ
- AI doporučení
- automatické objednávky

Standardní provoz GSS objednává pouze do `max`. Automatická nadnormativa vzniká pouze ve specifických scénářích, například počáteční naplnění skladu, mimořádný nákup nebo bezpečnostní zásoba.

### Přehled a Rozpad Zásob

GSS musí u položky zobrazovat celkový počet kusů a rozpad podle provozních stavů:

- Nový
- Nový přebroušený
- Použitý
- Na broušení

První úroveň přehledu je celkový počet za firmu.

Klik na celkový počet zobrazí rozpad podle skladů:

- hlavní sklad
- budoucí dceřiné sklady

Klik na sklad zobrazí rozpad podle provozního stavu:

- Nový
- Nový přebroušený
- Použitý
- Na broušení

Pokud je aktivní DM tracking, klik na stav zobrazí konkrétní DM kusy. DM kus je konec rozpadového řetězce.

### První Skladový Pohyb v GSS

První naskladnění tenant skladové položky je základní skladový pohyb v GSS. V MVP ještě nejde o plný audit, ERP pohyb ani detailní DM lifecycle, ale pohyb už musí určit:

- položku v tenant skladu
- počet kusů
- provozní stav naskladnění
- čas vytvoření pohybu
- případnou provozní poznámku

Při naskladnění se aktualizuje `stockSummary` položky:

- `total`: celkový počet kusů evidovaných u položky
- `available`: kusy dostupné pro běžný výdej
- `reserved`: kusy rezervované pro jiný účel
- `production`: kusy ve výrobě
- `sharpening`: kusy určené na broušení

Rozpad provozních stavů v `stockSummary.states`:

- `new`
- `resharpened_new`
- `used`
- `sharpening`

Stavy `Nový`, `Nový přebroušený` a `Použitý` navyšují `available`, protože mohou být dostupné k výdeji.

Stav `Na broušení` navyšuje `sharpening`, ale nezvyšuje `available`, protože kus není dostupný pro běžný výdej.

Použitý nástroj může být stále použitelný pro méně náročné operace. GSS proto nesmí automaticky považovat každý použitý nástroj za nepoužitelný nebo určený na broušení.

### Výdej Do Výroby

Výdej je samostatná GSS služba. Výdej do výroby není přesun mezi sklady zákazníka. Přesun mezi sklady bude později samostatná služba.

Skladový pohyb se vždy provádí z konkrétního skladu. V MVP je pouze hlavní sklad. Do budoucna bude možné stát na hlavním skladu nebo dceřiném skladu a tím definovat, odkud se výdej provádí. Oprávnění kdo může dělat pohyby na kterém skladu se bude řešit později.

Výdej řeší vydání položky ze skladu do výroby. V MVP se položka hledá v tenant skladových položkách podle:

- názvu
- GPC ID
- GTIN
- interního kódu
- výrobce
- typu položky
- průměru
- počtu zubů, pokud je dostupný
- dalších parametrů, pokud jsou dostupné
- poznámky / rozměru

Budoucí čtečka:

- bude možné načíst DM kód
- bude možné načíst kód z pracovního postupu
- načtením DM kódu se automaticky najde konkrétní položka / kus
- uživatel může najít položku ručně a potom načíst DM kus

Při výběru položky musí GSS zobrazit:

- název
- výrobce
- GPC ID nebo lokální ID
- GTIN
- dostupné množství
- rozpad stavů: Nový, Nový přebroušený, Použitý, Na broušení
- DM tracking ano/ne
- brousitelnost ano/ne

Výdejový formulář obsahuje:

- preferovaný stav pro výdej:
  - Použitý
  - Nový přebroušený
  - Nový
- dostupnost ve vybraném stavu
- počet kusů do výroby
- středisko
- stroj
- zakázka
- poznámka k výdeji

Pravidla výdeje:

- systém nesmí vydat víc kusů, než je `available`
- systém nesmí vydat kusy ve stavu `Na broušení`
- pokud není dost kusů ve zvoleném stavu, výdej se neuloží
- výdej sníží `available`
- výdej zvýší `production`
- výdej sníží konkrétní stav: `used`, `resharpened_new` nebo `new`

Metadata výdeje:

- datum výdeje ze systému
- provedl, v MVP `MVP uživatel`
- později přihlášená osoba, výdejní automat, ERP nebo integrační zdroj

Zákazník si bude moct definovat evidenční dimenze podle toho, co chce vyhodnocovat:

- středisko
- stroj
- zakázka
- další interní dimenze podle firmy

Střediska, stroje, zakázky a další evidenční dimenze budou v budoucnu definované v administraci firmy. Při výdeji si uživatel nebude dlouhodobě psát volný text, ale vybírat z předdefinovaných hodnot. Zároveň musí existovat možnost hodnotu ručně zapsat, pokud ještě není v seznamu. Důvodem je, že zákazníci mají rozdílnou úroveň evidence a různě čistá data. Pro MVP mohou zůstat textová pole.

Tato data jsou důležitá pro budoucí vyhodnocování a GINA analytiku, například:

- `Kolik mě stála zakázka XY na nástrojích?`
- `Které středisko má nejvyšší spotřebu?`
- `Na kterém stroji nejčastěji odcházejí nástroje?`

Kontrola segmentu zásoby musí být striktní:

- pokud uživatel vybere `Použitý`, systém kontroluje segment `used`
- pokud uživatel vybere `Nový přebroušený`, systém kontroluje segment `resharpened_new`
- pokud uživatel vybere `Nový`, systém kontroluje segment `new`

Nestačí kontrolovat pouze celkové `available`. Například pokud `available = 10`, `new = 10` a `resharpened_new = 0`, výdej 3 ks jako `Nový přebroušený` musí být odmítnut.

Při DM trackingu bude výdej probíhat nad konkrétním DM kusem. Už nyní ale musí být správná agregovaná kontrola podle segmentu zásoby. Bez DM trackingu se v MVP pracuje s počtem kusů a zvoleným provozním stavem.

Výdej DM kusů může být jednotlivý nebo hromadný, ale vždy jde o konkrétní DM/QID kusy, nikdy anonymní množství.

Hromadný DM výdej:

- uživatel otevře skupinu `new`, `resharpened_new` nebo `used`
- vybere jeden nebo více konkrétních QID/DM kusů
- vybrané kusy jsou vizuálně označené
- GSS zobrazí počet vybraných kusů
- výdej se provede až tlačítkem `Vydat vybrané kusy`
- každý vybraný DM kus se nastaví na `production`
- ke každému kusu se uloží `lastIssueMetadata`
- pro každý kus vznikne DM history a skladový `movementHistory`

Rezervované DM kusy se běžným hromadným výdejem nevydávají. Rezervovaný kus jde vydat pouze přes potvrzený režim výdeje z rezervace pomocí Release Code nebo override důvodu.

### Rezervace Nástroje Pro Zakázku

Rezervace je provozní GSS vrstva. Nemění GPC data, GPC master položku ani technickou dokumentaci. Slouží k ochraně dostupnosti konkrétního nástroje pro konkrétní výrobu nebo zakázku.

Typický případ:

- nástroj se vrátí po broušení s konkrétním aktuálním průměrem
- technolog nebo programátor podle tohoto průměru upraví program
- nástroj musí být zablokovaný pro danou zakázku
- běžný výdej nesmí tento nástroj použít pro jinou zakázku

Bez DM trackingu se rezervuje agregované množství:

- zakázka
- stroj
- pro koho / role
- počet kusů
- stav rezervovaného nástroje:
  - `new`
  - `resharpened_new`
  - `used`
- důvod / poznámka rezervace
- kdo rezervoval
- datum rezervace
- volitelná platnost rezervace

Logika rezervace bez DM:

- rezervované kusy se odečtou z `stockSummary.available`
- zvýší se `stockSummary.reserved`
- sníží se příslušný segment v `stockSummary.states`
- rezervace nesmí povolit více kusů, než je dostupné ve vybraném segmentu

S DM trackingem se rezervuje konkrétní DM/QID kus. Rezervace nesmí být anonymní množství, zejména u stavů `resharpened_new` a `used`, protože jednotlivé kusy mohou mít jiné aktuální rozměry a historii.

Terminálový standard pro rezervaci:

`Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní DM/QID kus -> Rezervace`

UX rezervace DM položky:

- uživatel vybere položku
- GSS zobrazí dostupné skupiny `new`, `resharpened_new`, `used`
- klik na skupinu zobrazí konkrétní DM kusy v daném stavu
- u kusu se zobrazí QID, DM kód, aktuální lokace, aktuální rozměry, změněné parametry po broušení a poslední servis / výdej
- změněné parametry po broušení musí být výrazné, protože mohou řídit programování nebo přípravu výroby
- pokud má kus `lastServiceMetadata`, UI musí výrazně zobrazit `Aktuální rozměry po broušení: D, L1, L2`
- toto zvýraznění se používá ve výběru DM kusů pro výdej, rezervaci, DM zásobu, DM detail a příjem z broušení
- skupina `new` může nabídnout zkratku `Rezervovat libovolný nový kus`
- i při této zkratce musí systém ukázat konkrétní QID/DM kus, který bude rezervovaný
- u skupin `resharpened_new` a `used` musí uživatel vybrat konkrétní kus ručně

U DM kusu se eviduje:

- rezervováno pro zakázku
- stroj
- pro koho / role
- kdo rezervoval
- datum rezervace
- Release Code pro řízené uvolnění rezervace
- důvod
- případně aktuální průměr a aktuální délka po broušení

Při vytvoření rezervace GSS automaticky vygeneruje `Release Code`, například `4831` nebo `A7K2`. Kód je uložený v `reservationMetadata` a slouží k tomu, aby rezervovaný kus nebyl omylem vydán běžným výdejem.

Po potvrzení se konkrétní DM kus nastaví na `reserved`, uloží se `reservationMetadata`, zásoba se přepočítá z `dmItems[]` a v DM detailu se zobrazí informace o rezervaci včetně Release Code, data vytvoření a osoby, která rezervaci vytvořila.

Rezervace neznamená výdej. Rezervace není tvrdý zámek. Chrání proti neúmyslnému výdeji, ale neblokuje provoz natvrdo. Rezervovaný DM kus je blokovaný pro běžný výdej, ale může být vydán přes potvrzený režim `Výdej z rezervace`.

Výdej z rezervace:

- ve výdeji DM položky se vedle skupin `new`, `resharpened_new` a `used` zobrazí skupina `reserved`
- klik na `reserved` zobrazí konkrétní rezervované DM kusy
- u kusu se zobrazí QID, DM kód, původní stav před rezervací, aktuální rozměry, lokace a `reservationMetadata`
- `reservationMetadata` obsahuje pro koho / roli, zakázku, stroj, poznámku, datum rezervace, kdo rezervoval a Release Code
- ruční zadání rezervovaného QID/DM ve výdeji zobrazí, že kus je rezervovaný
- běžné tlačítko výdeje jej nesmí vydat jako anonymně dostupný kus
- uživatel musí potvrdit samostatnou akci `Vydat rezervovaný kus`
- standardní uvolnění probíhá zadáním správného Release Code
- nouzové uvolnění probíhá přes `Override výdej`, kde uživatel musí zadat důvod
- po potvrzení se konkrétní DM kus nastaví na `production`
- `reservationMetadata` zůstane dohledatelné v `lastReservationMetadata`
- při override se uloží `overrideMetadata`: kdo provedl, datum a důvod
- zapíše se `lastIssueMetadata`, DM history a `movementHistory`
- DM history rozlišuje záznam `rezervace uvolněna kódem` a `rezervace obejita override výdejem`

V budoucnu může GSS při override výdeji automaticky upozornit osobu, která rezervaci vytvořila. V MVP se informace ukládá pouze do historie.

U položek bez DM tracking zůstává původní množstevní logika rezervace.

Zrušení rezervace:

- může provést autor rezervace nebo oprávněná osoba
- vrací kusy zpět do `available`
- vrací kusy zpět do původního segmentu zásoby
- zapisuje `reservation_cancelled` do historie pohybů

V MVP je zrušení rezervace zatím placeholder bez plné implementace. Plná pravidla oprávnění, notifikace a automatická expirace nejsou součástí MVP.

### Ohlášení Rozdílu Ve Fyzické Zásobě

GSS musí umožnit pracovníkovi ohlásit rozdíl ve skladu.

Příklad:

- systém ukazuje 10 ks
- pracovník fyzicky vidí jen 8 ks
- pracovník ohlásí validní množství / rozdíl
- informace jde zodpovědné osobě
- později se propojí s audit logem

Pracovník tím chrání sebe před odpovědností za předchozí chybu. Audit log později umožní dohledat předchozí pohyby a určit, kde rozdíl vznikl. Detailní workflow ohlášení, schválení a korekce zásoby bude řešeno později.

### Základní Historie Pohybů

GSS MVP vede jednoduchou `movementHistory` u tenant skladových položek. Nejde ještě o plný audit log, ale o provozní historii, aby zákazník viděl poslední důležité pohyby položky a skladu.

Každý záznam obsahuje:

- `id`
- datum a čas vytvoření
- typ pohybu
- `organizationId`
- `warehouseId`, v MVP `MAIN`
- `itemId`
- název položky
- `gpc_id`, pokud existuje
- `origin`: `GPC` nebo `LOCAL`
- množství
- provozní stav, například `new`, `resharpened_new`, `used`, `sharpening`
- kdo pohyb provedl
- poznámku
- `metadata` objekt s doplňkovými údaji podle typu pohybu

V MVP se automaticky zapisují tyto typy pohybů:

- `intake`: příjem
- `issue_to_production`: výdej do výroby
- `return_from_production`: návrat z výroby
- `send_to_sharpening`: odesláno na broušení
- `stock_difference_report`: ohlášen rozdíl skladu
- `block`: blokace položky
- `unblock`: odblokace položky
- `reservation_created`: rezervace vytvořena
- `reservation_cancelled`: rezervace zrušena
- `overstock_offer_created`: nadnormativní nabídka vytvořena
- `overstock_offer_updated`: nadnormativní nabídka upravena
- `purchase_proposal_created`: objednávkový návrh vytvořen

U položky se zobrazuje posledních 10 pohybů. Na úrovni skladu se zobrazuje posledních 20 pohybů napříč položkami.

Movement history slouží hlavně pro provozní přehled. Budoucí audit log bude detailnější a bude evidovat například:

- IP adresu
- zařízení
- terminál
- konkrétní DM kus
- ERP zdroj
- výdejní automat
- autorizaci
- workflow stav a schválení

Movement history tedy odpovídá na otázku `co se s položkou stalo`. Audit log bude odpovídat i na otázku `kdo, odkud, čím a s jakým oprávněním změnu provedl`.

### Budoucí Výdejní Terminál

Budoucí výdejní terminál může mít režim pouze pro výdej.

Princip:

- scanner-first / touch-first režim
- podle aktivního pole se otevře numerická, textová nebo kombinovaná klávesnice
- cílem je rychlý provoz ve výrobě
- terminál minimalizuje zbytečné klikání a ruční psaní

Tento režim není součástí MVP.

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
- systém ví, na jaké položky má pracovník nárok
- pokud pracovník žádá dříve, než má nárok, systém nevydá automaticky
- vyšší role, například mistr, může výdej autorizovat
- výdej se uloží s poznámkou a vazbou na pracovníka
- bez OPP pracovník nemůže pracovat

Toto workflow není součástí MVP.

### Návrat Z Výroby

Návrat z výroby je samostatná GSS služba a samostatný skladový pohyb. Po návratu musí být vždy rozhodnuto, co se s položkou stane dál.

V MVP lze položku najít ručně v tenant skladu podle:

- názvu
- GPC ID
- GTIN
- interního kódu
- výrobce
- typu
- poznámky / rozměru

Budoucí DM:

- pokud má položka DM tracking, bude možné načíst DM kód konkrétního kusu
- načtením DM kódu se automaticky doplní položka a konkrétní kus
- pro MVP zůstává agregované množství a DM je placeholder

Návrat lze provést pouze u položek, které mají `production > 0`. Nelze vrátit více kusů, než je aktuálně ve výrobě.

Po výběru položky GSS zobrazí:

- název
- výrobce
- GPC ID / lokální ID
- GTIN
- ve výrobě
- brousitelná ano/ne
- DM tracking ano/ne
- max počet přebroušení, pokud je nastavený
- aktuální servisní poznámku / instrukci, pokud existuje

Formulář návratu obsahuje:

- počet kusů
- datum návratu, default dnešní datum
- provedl, default `MVP uživatel`
- středisko
- stroj
- zakázka
- poznámka k návratu

Rozhodnutí po návratu:

#### Zpět Na Sklad Jako Použitý

Použít, pokud je nástroj stále použitelný, není potřeba broušení a může se vrátit do skladu pro další kratší / méně náročné operace.

Logika:

- snížit `production`
- zvýšit `available`
- zvýšit `stockBreakdown.used`

GSS zobrazí místo uložení položky, pokud existuje. Pokud není známé, zobrazí `Umístění není nastavené`.

#### Poslat Na Broušení

Použít, pokud nástroj není použitelný bez servisu a položka je označená jako brousitelná.

Logika:

- snížit `production`
- zvýšit `sharpening`
- zvýšit `stockBreakdown.sharpening`

Pokud položka není označená jako brousitelná, GSS zobrazí výrazné varování `Položka není nastavena jako brousitelná.` Odeslání na broušení se bez potvrzení výjimky nesmí uložit.

U broušení se eviduje:

- brusič, defaultně `M-technologies`
- provozní instrukce, například `Dát do červené krabice`

Tímto GSS digitálně sbírá nástroje do servisní dávky. Později bude možné kliknout `Odeslat na ostření`, čímž vznikne servisní doklad / objednávka ostření / dodací list. V dokladu budou položky, počty, DM kódy, poznámky, požadavek na povlak a servisní cena.

#### Vyřadit / Odkup Tvrdokovu

Použít, pokud nástroj už není použitelný, nedává smysl další broušení nebo jde o položku určenou k recyklaci / odkupu tvrdokovu.

Logika:

- snížit `production`
- nezvyšovat `available`
- nezvyšovat `sharpening`
- v MVP uložit pouze placeholder informaci o vyřazení

Instrukce:

- `Vložit do černé bedýnky`
- u destiček / tvrdokovu: `Vložit do černé krabice na odkup tvrdokovu`

U tvrdokovu bude možné evidovat váhu, typ materiálu, aktuální cenu odkupu a odhad hodnoty. Zákazník tak uvidí hodnotu materiálu v recyklaci. Detailní recyklační workflow není součást MVP.

#### Přesměrovat Podle Instrukce / Jiná Řezná Hrana

Použít, pokud například břitová destička může být ještě využita jinou řeznou hranou nebo má být vložena do specifického místa podle interní instrukce.

Logika:

- snížit `production`
- zatím nevracet do `available`
- uložit poznámku / placeholder instrukce

GSS zobrazí instrukci, kam položku vložit a co s ní má pracovník udělat.

#### Dočasně Zablokovat

Použít, pokud není jasné, zda je položka použitelná a čeká na kontrolu mistra / technologa / seřizovače.

Logika:

- snížit `production`
- nezvyšovat `available`
- uložit důvod blokace

### DM Tracking a Počet Přebroušení Při Návratu

Pokud má položka DM tracking, návrat se bude v budoucnu řešit nad konkrétním DM kusem. Systém bude znát počet přebroušení konkrétního kusu.

Pokud je kus na posledním povoleném použití / přebroušení, systém zobrazí upozornění:

`Tento nástroj dosáhl limitu přebroušení. Doporučeno vyřadit.`

Instrukce může být například `Vložit do černé bedýnky`.

Pokud DM tracking není aktivní, pracuje se s agregovaným počtem kusů a počet přebroušení se řeší pouze obecně / poznámkou.

### Změna Parametrů Po Broušení

Po broušení bude nutné u DM kusu evidovat změněné parametry:

- aktuální průměr
- aktuální délka
- počet přebroušení
- poznámka k servisu
- případně typ povlaku
- nový vizuální identifikátor / štítek

Tyto změny nemění GPC master data. Jde pouze o tenant provozní data v GSS. Bez DM tracking se tyto změny zapisují pouze agregovaně / poznámkou.

### Štítek / Sáček / Transakční DM Kód

Při vyřazení, recyklaci, přesměrování nebo servisní dávce může systém v budoucnu vytisknout štítek.

Štítek může obsahovat:

- počet kusů
- typ
- datum
- pracovníka

Lepší cílový stav je, že štítek ponese pouze DM / transakční kód a detaily transakce budou uložené v systému. Díky tomu lze zpracovat i větší množství kusů, ne pouze jednotlivý kus.

Tisk štítků není součástí MVP.

### Dokladová Logika Příjmu

Při naskladnění musí GSS připravit základ evidence, proč a na základě čeho se příjem děje. V MVP se kromě provozní `movementHistory` ukládá i poslední příjem / intake metadata pro rychlé zobrazení na položce.

Typ dokladu nebo důvod příjmu:

- dodací list dodavatele
- faktura dodavatele
- interní příjemka
- servisní dodací list po broušení
- návrat z výroby
- ruční korekce / inventura

Metadata příjmu:

- zdroj příjmu: `manual`, `gss_system_order`, `external_order_erp`, `sharpening_return`, `inventory_correction`
- číslo dokladu, volitelné pro MVP
- číslo zdrojového dokladu / objednávky
- vazba na `purchaseProposalId` / `orderProposalId`, pokud jde o systémovou objednávku GSS
- číslo externí objednávky, pokud jde o ERP / Promitea / Money
- dodavatel / zdroj
- datum příjmu
- provedl
- poznámka k příjmu

Pole `provedl` je v MVP textové. V produkční vrstvě to bude přihlášená osoba, výdejní automat, ERP nebo integrační zdroj.

Příjem ze systémové objednávky GSS se vždy páruje na konkrétní skladovou položku, ne na celý seznam všech objednávek. Pokud uživatel přijímá konkrétní položku, GSS nabídne pouze otevřené objednávkové návrhy / systémové objednávky, které tuto položku obsahují. Seznam se řadí od nejstarší otevřené objednávky, protože ta má největší pravděpodobnost, že právě dorazila.

Nabídka systémových objednávek u příjmu zobrazuje:

- číslo systémové objednávky Gogrou
- datum vytvoření
- dodavatele
- výrobce / značku
- objednané množství
- už přijaté množství
- zbývá přijmout
- nákupní kanál

Po výběru objednávky se do pohybu uloží `receiptSourceType = gss_system_order`, `purchaseProposalId`, `orderProposalId`, `systemOrderNumber`, `supplier`, `purchaseChannel` a `manufacturer`. Soft MVP zatím automaticky neodečítá přijaté množství z objednávky, ale datová struktura musí být připravená na pozdější párování. Dodavatel by měl v budoucnu uvádět systémové číslo objednávky Gogrou na dodacím listu.

Po výběru systémové objednávky GSS se množství příjmu automaticky předvyplní hodnotou `zbývá přijmout`. Pokud objednávka zatím nemá evidenci přijatého množství, použije se hodnota `objednáno`. Množství zůstává editovatelné, aby šlo obsloužit plné dodání, částečné dodání i situaci, kdy fyzicky dorazí větší množství než objednáno. Nadlimitní příjem v MVP zobrazí warning a uloží metadata do movement history; automatické uzavírání objednávky a skutečné přepočítání zůstatku se doplní později.

Objednávkový návrh musí rozlišovat:

- `suggestedQuantity`: množství navržené systémem podle min/max a dodacího násobku
- `orderedQuantity`: skutečně potvrzené množství po ruční úpravě uživatelem
- `receivedQuantity`: již přijaté množství
- `remainingQuantity`: zbývá přijmout
- `quantityAdjustedByUser`: příznak, že uživatel změnil systémový návrh

Uživatel může upravit `orderedQuantity` už v draftu před vytvořením systémové objednávky. Uložený řádek systémové objednávky musí zachovat původní `suggestedQuantity` i potvrzené `orderedQuantity`; příjem se dál řídí jen potvrzeným `orderedQuantity`.

Příjem ze systémové objednávky se vždy řídí `orderedQuantity`, nikdy původním systémovým návrhem. Pokud systém navrhne 4 ks a uživatel objedná 2 ks, příjem předvyplní 2 ks. Po částečném příjmu 1 ks se další příjem zobrazí jako `objednáno 2`, `již přijato 1`, `zbývá 1`. Po plném příjmu se řádek označí jako `fulfilled` a dál se nenabízí jako otevřený.

Metadata příjmu ze systémové objednávky ukládají také `suggestedQuantity`, `orderedQuantity`, `receivedQuantityBefore`, `receivedQuantityAfter`, `remainingQuantityBefore`, `remainingQuantityAfter`, `receivedFromThisMovement` a `quantityAdjustedByUser`.

Pokud k položce není otevřená žádná systémová objednávka, GSS zobrazí informaci a umožní pokračovat jako běžný příjem nebo příjem z externí objednávky / ERP.

Do budoucna bude možné načítat kódy z dodacích listů, faktur nebo servisních dokladů. Doklad může být importován z ERP, výdejního automatu nebo přímo od dodavatele. Cílem je minimalizovat ruční zadávání a zároveň zachovat dohledatelnost příjmu.

### Servisní Workflow Ostření / M-technologies

GSS musí připravit budoucí workflow ostření mezi zákazníkem a M-technologies.

Základní tok:

1. zákazník v GSS shromažďuje nástroje k ostření
2. systém ukazuje počet kusů na broušení
3. zákazník klikne `Odeslat na ostření`
4. tím se ukončí sběr aktuální dávky
5. vznikne servisní doklad

Servisní doklad může mít podobu:

- objednávky ostření
- dodacího listu pro předání nástrojů
- požadavku na povlakování

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

Bez DM trackingu se změny zapisují pouze agregovaně nebo jako poznámka k položce / příjmu.

DM kus po broušení může mít:

- nový aktuální průměr
- novou délku
- počet přebroušení
- servisní historii
- nový štítek / vizuální identifikátor

Zákazník ani servis nesmí měnit GPC master data. Mění se pouze tenant provozní data v GSS.

### Na Broušení

GSS musí zobrazovat celkový počet kusů na broušení.

Klik na počet kusů na broušení zobrazí rozpad:

- ještě ve firmě
- aktuálně v brusírně

Pokud je aktivní DM tracking, u každého čísla lze zobrazit konkrétní DM kusy.

### DM Tracking a Rozpad Zásob

Bez DM trackingu systém pracuje s počtem kusů.

S DM trackingem systém pracuje s konkrétními kusy:

- každý kus má svůj DM kód
- každý kus má vlastní provozní stav
- rozpad zásoby může skončit na seznamu konkrétních DM kódů

## 9. Datové Můstky

GSS musí být připravené na různé provozní modely zákazníků.

### Zákazník Bez ERP / Bez Automatu

GSS je hlavní systém.

GSS eviduje:

- skladové stavy
- naskladnění
- výdeje
- návraty
- DM kusy
- historii

### Zákazník s ERP

ERP je primární zdroj pohybů. GSS přijímá data z ERP.

GSS slouží jako specializovaná vrstva pro:

- GPC vazbu
- DM evidenci
- brousitelnost
- nadnormativní položky
- technickou a skladovou analytiku

### Zákazník s Výdejním Automatem

Výdejní automat generuje výdejové a návratové události. GSS přijímá data z automatu.

GSS mapuje:

- automatový kód
- zákaznické ID položky
- GSS položku
- DM kus, pokud existuje
- pohyb

### Zákazník s ERP + Výdejním Automatem

Preferovaný tok:

1. automat zapisuje pohyby do ERP
2. ERP je primární zdroj pohybů
3. GSS čte pohyby z ERP

Tím se snižuje riziko duplicit a rozdílných stavů.

### Kombinovaný Režim

Někteří zákazníci mohou mít více kanálů najednou.

Každý systém může mít vlastní integrační kanál:

- ERP
- automat
- ruční import
- servisní partner
- měřicí zařízení
- budoucí API konektor

### Princip Datových Můstků

GSS musí být připraveno na import/export pohybů.

Podporované směry:

- API
- CSV
- XLS
- budoucí konektory

Každý přijatý pohyb musí mít:

- audit
- zdroj
- externí ID
- čas přijetí
- mapování na GSS položku
- kontrolu duplicit
- výsledek zpracování

GSS musí mapovat zákaznická ID na GSS položky. Pokud položka není jednoznačně mapovatelná, pohyb nesmí být tiše aplikován.

## 10. Nadnormativní Položky

Nadnormativní zásoba vzniká v GSS, ne v GPC. Jde o lokální obchodní / provozní vrstvu zákazníka nad jeho vlastním skladem.

Firma může u skladové položky označit část zásoby jako nadnormativní. Nadnormativní položka nebo kus je položka, kterou zákazník nepotřebuje držet ve skladu v běžném množství a může ji nabídnout.

Nadnormativní položka může být:

- interně evidovaná
- nabídnutá ostatním firmám v Gogrou komunitě
- později napojená na obchodní / Toolshop vrstvu

Nadnormativní nabídka nesmí měnit master data GPC. GPC zůstává validovaný master katalog. Nabídka je lokální zákaznická vrstva v GSS a později může být viditelná komunitě Gogrou podle pravidel a oprávnění.

MVP rozsah:

- označení položky jako nadnormativní
- počet kusů k nabídnutí/prodeji
- cena za kus
- měna
- stav nabídky
- interní / externí nabídka
- vazba na Gogrou komunitu
- vazba na zákazníka
- evidence kusů / množství určeného k nabídce
- historie nabídky
- poznámka
- datum vytvoření

MVP pravidlo: nadnormativa se týká pouze volných kusů ve stavu `Nový`.

Do nadnormativní nabídky se v MVP nesmí použít:

- `Nový přebroušený`
- `Použitý`
- `Na broušení`
- kusy ve výrobě
- rezervované kusy

Zákazník v MVP ručně zadá pevný počet a pevnou cenu. Systém kontroluje, že počet k nabídnutí není vyšší než počet volných nových kusů. Pokud není dost nových kusů, nabídka se neuloží.

Stavy nadnormativní nabídky:

- `draft`: rozpracovaná nabídka
- `active`: aktivní nabídka přebytku
- `paused`: pozastavená nabídka
- `sold`: prodaná nabídka
- `cancelled`: zrušená nabídka

Aktivní nadnormativní nabídka (`active`) v MVP eviduje nabízené množství, ale tvrdě neblokuje výdej. Výroba má prioritu.

Pokud výdej nových kusů zasáhne do množství nabízeného jako nadnormativa, systém automaticky poníží `overstockOffer.quantity`. Pokud nabídka klesne na `0`, systém nabídku pozastaví (`paused`) a zobrazí upozornění:

`Výdej zasáhl do nadnormativní nabídky. Nabízené množství bylo automaticky poníženo.`

`overstockReserved` se v MVP nepoužívá jako tvrdá blokace výdeje. Starší rezervovaná nadnormativní množství se při uložení nabídky uvolní zpět do skladové dostupnosti.

U tenant položky se ukládá `overstockOffer`:

- `enabled`
- `quantity`
- `pricePerUnit`
- `currency`
- `note`
- `status`
- `createdAt`
- `updatedAt`

Při vytvoření nebo změně nabídky vzniká záznam v `movementHistory`:

- `overstock_offer_created`
- `overstock_offer_updated`

Stavy nabídky:

- `draft`
- `active`
- `paused`
- `sold`
- `cancelled`

Kusy určené k nabídce se v MVP tvrdě neblokují proti běžnému výdeji. Výroba má prioritu a nabídnuté množství se při výdeji může automaticky ponížit.

### Rezervace Nadnormativních Zásob

GSS musí rozlišit dva režimy rezervace podle toho, zda má položka zapnutý DM tracking.

#### A) Položka bez DM trackingu

U položky bez DM trackingu se rezervuje pouze množství.

Příklad:

- celková zásoba: 20 ks
- nadnormativní nabídka: 5 ks
- dostupné množství pro běžný výdej: 15 ks

V aktuálním MVP nadnormativní nabídka dostupnost tvrdě nesnižuje. Systém musí jasně zobrazit, kolik kusů je nabízených, a upozornit odpovědnou osobu, pokud se sklad blíží nabízenému množství.

#### B) Položka s DM trackingem

U položky s DM trackingem se rezervují konkrétní DM kusy.

Každý rezervovaný kus může mít stav:

- `available_for_offer`
- `reserved_for_offer`
- `offered`
- `sold`
- `cancelled`

Rezervovaný DM kus nelze běžně vydat do výroby. Systém musí jasně ukázat, které kusy jsou blokované pro nabídku. Historie rezervace se zapisuje do pohybů / auditu.

Detailní DM lifecycle, včetně přesných stavů kusu, přechodů a pravidel výdeje, bude řešen v samostatné části GSS DM lifecycle.

Budoucí automatická nadnormativa není součástí MVP. Později může systém nadnormativu počítat podle:

- maximální zásoby
- tolerance nad maximum
- procenta nad max
- poslední nákupní ceny
- slevy z poslední nákupní ceny

Příklad:

- max zásoba = 100
- tolerance nad max = 20 %
- skutečná zásoba = 150
- hranice = 120
- nadnormativa = 150 - 120 = 30 ks

Marketplace, platby a Toolshop integrace nejsou součástí MVP nadnormativy.

## 11. Poptávka / Promitea

GSS MVP musí umožnit vytvoření poptávkového balíčku.

Proces:

1. zákazník vybere položky k poptávce
2. nastaví množství
3. vznikne poptávkový balíček
4. balíček se exportuje do XLS
5. XLS lze předat do Promitea
6. historie poptávky zůstane v GSS

Stavy poptávky:

- `draft`
- `exported`
- `sent`
- `completed`
- `cancelled`

### Struktura XLS pro Promitea

Minimální sloupce:

- zákazník
- zákaznické ID položky
- GPC ID, pokud existuje
- GTIN, pokud existuje
- výrobce
- katalogové číslo
- název
- množství
- jednotka
- poznámka
- požadovaný termín

Budoucí stav může být API napojení na Promitea. MVP počítá s XLS exportem jako jednoduchou a praktickou cestou.

## 12. Ceníky / Toolshop Logika

Ceny v GSS nejsou master technická data. Ceny jsou obchodní vrstva.

MVP rozlišuje:

- základní ceník
- speciální ceník
- zákaznický ceník
- MAZAK Toolshop jako speciální obchodní vrstva

Položka může mít více cenových kontextů:

- běžná cena
- zákaznická cena
- akční cena
- Toolshop cena
- nabídka pro nadnormativní kus
- cena v poptávce

GPC drží technickou master identitu položky. GSS nebo obchodní vrstva drží cenové a obchodní kontexty.

## 13. Co Nepatří do MVP

Do MVP nepatří:

- dceřiné sklady
- plná ERP integrace
- plná automat integrace
- pokročilé AI doporučení
- marketplace v plném rozsahu
- workflow více schvalovatelů
- pokročilé reporty

Tyto oblasti jsou důležité, ale nejsou nutné pro první hodnotné používání GSS.

## 14. Vyhledávání a Obchodní Nabídka v GSS

GSS MVP má rozlišovat dvě hlavní úrovně vyhledávání:

- lokální GSS vyhledávání nad zákaznickým skladem
- vyhledávání do validovaného GPC katalogu

### A. Lokální GSS Vyhledávání

Lokální GSS vyhledávání odpovídá na otázku: co má zákazník aktuálně ve svém provozním světě.

GSS musí umožnit vyhledávání minimálně podle:

- názvu
- GTIN
- GPC ID
- výrobce
- typu položky
- průměru
- délky
- počtu zubů
- povlaku
- materiálu
- interního kódu
- DM kódu
- dalších parametrů dle typu položky

Výsledek lokálního GSS vyhledávání má ukázat:

- co má zákazník aktuálně skladem
- aktuální množství
- dostupné DM kusy
- warning/minimum
- stav položky
- umístění
- kusy na broušení
- nadnormativní kusy

Lokální GSS vyhledávání pracuje nad zákaznickými daty. Může zahrnovat validované položky převzaté z GPC i lokální nevalidované položky založené zákazníkem.

### B. Vyhledávání do GPC

Uživatel může z GSS vytvořit dotaz nad validovaným GPC katalogem.

Dotaz může obsahovat:

- parametrické filtrování
- technické parametry
- výrobce
- rozměry
- materiál
- povlak
- aplikaci
- typ nástroje

Výsledek GPC vyhledávání má ukázat:

- všechny odpovídající validované položky v GPC
- technické informace
- dostupnou dokumentaci
- alternativy
- obchodní informace

Zobrazované obchodní informace:

- Gogrou cena pro zákazníka
- speciální cena
- Toolshop cena
- dodací podmínky
- dostupnost
- lead time
- doporučený dodavatel
- doporučená alternativa

GPC zůstává master technický katalog. Ceny a obchodní podmínky jsou obchodní vrstva nad GPC.

Budoucí směr:

- MAZAK Toolshop
- speciální zákaznické ceníky
- komunitní obchodní vrstvy
- doporučené alternativy
- AI doporučení

## MVP Hodnota pro Zákazníka

Zákazník v MVP získá:

- jednoduchý přehled hlavního skladu
- možnost převzít validovanou položku z GPC
- možnost založit lokální nevalidovanou položku
- min/max a výstrahy
- DM evidenci konkrétních kusů
- výdej a návrat
- broušení a měření
- nadnormativní položky
- poptávku/export do Promitea
- základ ceníků a Toolshop logiky
- lokální GSS vyhledávání
- GPC vyhledávání s obchodní vrstvou

MVP nemusí vyřešit všechny integrace. Musí ale mít datový model a procesní logiku připravené tak, aby se ERP, automat, Promitea a budoucí konektory daly napojit bez přepsání základní architektury.

## MVP Tuning Po Prvním Testování

Lokální nevalidovaná položka je plnohodnotná tenant skladová položka v GSS. Není validovaná v GPC, ale po naskladnění musí jít vydat do výroby stejně jako položka převzatá z GPC. UI ji musí jasně označit jako `Lokální nevalidovaná položka`.

Při naskladnění se může evidovat pořizovací cena:

- pořizovací cena za kus
- měna
- celková hodnota příjmu
- datum nákupu / příjmu
- dodavatel / zdroj

Tato data slouží pro nadnormativy, budoucí cenové analýzy, SS akce a GINA predikce. Nejsou master technická data GPC.

Výdej nad systémovou zásobu není v MVP standardně povolený. Pokud pracovník fyzicky vidí více kusů, než ukazuje systém, použije `Ohlásit rozdíl ve skladu`. Budoucí override režim může vyšší roli umožnit výdej nad evidovanou zásobu, ale musí vzniknout výrazná auditní stopa a upozornění odpovědné osobě.

Zákazník bude mít v budoucí administraci seznam dodavatelů. U dodavatele se bude evidovat název firmy, přiřazená značka / výrobce, e-mail, telefon, kontaktní osoba a typ dodavatele: `Gogrou partner`, `Standardní dodavatel`, `Interní dodavatel`. V nastavení položky znamená `Dodavatel položky` konkrétní firmu, zatímco `Typ dodavatele` popisuje vztah / kategorii dodavatele. Default pro MVP je `Gogrou` a `Gogrou partner`.

U položky se připravuje poznámka k broušení, budoucí výkres / příloha / odkaz a povlak jako samostatný provozní údaj. Povlaky budou později vybírány podle typu operace, například vrtání, frézování nebo soustružení. U validovaných položek se operace odvodí z GPC, u lokálních položek bude nutné ji zadat jako povinný parametr.

Povinné parametry lokální položky budou později řízené typem položky. Struktura má být sladěná s GPC / ToolsUnited daty a nebude platit pouze pro nástroje, ale pro všechny budoucí typy položek v GPC/GSS.

Cílové UX tenant skladových položek má být kompaktní řádkový seznam. Dnešní dlouhá karta je MVP prototyp; detail položky se později otevře až po kliknutí.

Řádek tenant skladové položky má obsahovat:

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

Po kliknutí na řádek se otevře detail položky. Detail obsahuje akce:

- Výdej
- Návrat z výroby
- Příjem / naskladnění
- Nastavení položky
- Rezervovat
- Nadnormativa
- Vytvořit objednávku
- Historie pohybů

Po práci v detailu musí být možné kliknout `Zavřít` nebo `Vrátit zpět na řádkový seznam`.

V MVP dlouhé kartě musí mít každá rozbalená akce položky bezpečný návrat na detail položky. Akce jako `Naskladnit`, `Nastavení položky`, `Rezervovat`, `Nadnormativa` a DM detail musí jít zavřít bez smazání položky a bez ztráty uložených skladových dat. Pokud je u jedné položky otevřeno více rozbalených akcí, návrat na detail položky zavře všechny tyto akce a vrátí položku do základního detailu položky.

Vyhledání položky má být centrální. Jeden vstup má postupně umět hledat v GSS skladu, hledat v GPC a později využít GINA logiku / AI dotazy, například:

- `Najdi vrták průměr 10`
- `Najdi APKX`
- `Najdi frézu 4 zuby D10`

V MVP se celé UI překlápí do provozního skladového terminálu. Základní tok je:

`najít položku -> otevřít detail -> vybrat akci -> provést -> zpět`.

Hlavní pohled `/app/gss` má být zúžený. Nesmí trvale zobrazovat všechny procesní sekce najednou. V horní části zůstává aktivní firma, prefix, stav organizace a rychlý vstup do správy organizací / založení další firmy. Pod tím je hlavní akční panel:

- `Příjem`
- `Výdej`
- `Návrat z výroby`
- `Načíst DM kód`
- `Vyhledat v GPC`
- `Přidat lokální položku`
- `Objednávkový návrh`
- `Nadnormativní zásoby`

Akční sekce se otevírají pouze na vyžádání a vždy má být otevřený nejvýše jeden hlavní panel. Každý hlavní panel má mít návrat `Zpět na akce`.

Sekce `Skladové položky` musí být čistá a připravená na stovky až tisíce položek. Nad řádkovým seznamem je základní vyhledávání, které filtruje tenant sklad podle názvu, výrobce, typu, GPC ID, GTIN, GID, interního / lokálního kódu a základních lokálních parametrů.

MVP hledání podporuje jednoduché víceparametrové zadání bez AI. Uživatel může oddělit kritéria středníkem, čárkou nebo mezerami, například `Walter ; fréza ; D12 ; 4z`, `Walter freza`, `Walter D12`, `freza 12 4z` nebo `VBD CNMG Walter WKP35G`. Položka projde filtrem pouze tehdy, když splní všechna zadaná kritéria. Jednoduché zápisy jako `D12`, `d=12`, `Z4`, `4z`, `L25` nebo `l=25` se pro MVP převedou na číselné tokeny. Stejnou logiku musí používat skladový seznam i terminálové akce, zejména Výdej.

Toto je rychlé provozní hledání ve skladu a příprava na budoucí parametrické / GINA hledání. Později se stejný princip rozšíří i do GPC katalogu a Toolshop obchodní vrstvy.

Vyhledávání skladových položek je základní provozní funkce. Budoucí GINA hledání má umět postupné dotazování:

- typ nástroje
- průměr
- délka břitu
- počet zubů
- výrobce
- použití

Podporované budou také přesné identifikátory jako GTIN, GID, přesný název a načtení čtečkou.

Budoucí parametrické vyhledávání v GSS i GPC bude řízené typem položky. Uživatel nejdříve zvolí nebo zadá typ a systém nabídne pouze relevantní parametry pro danou skupinu. Příklady typů:

- TK fréza
- TK vrták
- VBD
- držák
- povlak
- OPP
- materiál
- náhradní díl

Příklad pro TK frézu:

- průměr
- délka břitu
- počet zubů
- stopka
- povlak
- výrobce
- použití / operace

Příklad pro TK vrták:

- průměr
- délka
- hloubka vrtání
- úhel špičky
- povlak
- výrobce
- použití

Příklad pro VBD:

- tvar
- velikost
- rádius
- povlak
- materiálová skupina
- výrobce
- ISO označení

Parametry musí vycházet z GPC. GPC bude sladěné s ToolsUnited strukturou, aby validované položky měly čistá a typově použitelná data. Lokální nevalidované položky v GSS musí mít minimální povinné parametry podle svého typu, aby je šlo provozně hledat, vydávat a později validovat do GPC.

GINA / AI hledání bude další vrstva nad čistými daty. Umí postupně dotazovat chybějící parametry, například `Fréza` -> `Jaký průměr?` -> `Jaká délka břitu?` -> `Kolik zubů?`. Textové hledání v MVP zůstává základní vrstva, parametrické a AI hledání je navazující vrstva nad strukturovanými GPC/GSS daty.

Příjem na sklad má více zdrojů:

- `Běžný příjem`: ruční příjem položky bez vazby na objednávku.
- `Příjem ze systémové objednávky GSS`: příjem proti otevřenému objednávkovému návrhu / systémové objednávce, která obsahuje právě přijímanou položku.
- `Příjem z externí objednávky / ERP`: budoucí vazba na Money, Promitea, ERP nebo jiný externí zdroj.
- `Příjem z broušení`: samostatný DM tok pro návrat konkrétního DM/QID kusu po servisu.
- `Korekční příjem / inventura`: budoucí inventurní úprava.

Příjem z objednávky je důležitý pro budoucí vazbu `objednávka -> dodací list -> faktura -> příjem`. V MVP je systémová objednávka soft logika: uživatel u konkrétní položky vybere otevřený návrh, uloží se vazba do movement metadata a později půjde doplnit automatické odečítání přijatého množství.

## DM Foundation MVP

DM tracking patří do GSS, ne do GPC. GPC říká, co je produkt. GSS + DM říká, kde je konkrétní fyzický kus, v jakém je stavu, co se s ním stalo a jaké má aktuální provozní parametry.

Tenant skladová položka může mít `dmItems[]`. Každý DM kus eviduje:

- `id`
- `dmCode`
- `itemId`
- `gpc_id`, pokud existuje
- `origin`: `GPC` nebo `LOCAL`
- `status`: `new`, `resharpened_new`, `used`, `production`, `sharpening`, `in_grinding_shop`, `reserved`, `blocked`, `scrapped`
- `location`: `main_warehouse`, `production`, `sharpening_collection`, `grinding_shop`, `black_box`, `unknown`
- `currentDiameter`
- `currentLength`
- `sharpeningCount`
- `maxSharpeningCount`
- `lastServiceAt`
- `lastMeasuredAt`
- `lastMeasurementProtocol`
- `serviceNote`
- `coating`
- `drawingUrl`
- `blockedReason`
- `reservedForOrder`
- `history[]`

Pokud je u položky zapnutý DM tracking, GSS zobrazí sekci `DM kusy`. Pokud žádné kusy neexistují, zobrazí empty state `Zatím nejsou vytvořené žádné DM kusy.`

MVP umožňuje digitálně vytvořit DM kusy bez tisku fyzických štítků. Uživatel zadá počet kusů, stav, výchozí průměr, výchozí délku, max počet přebroušení a umístění. Systém automaticky vytvoří unikátní DM kódy v rámci tenant skladu a zapíše `movementHistory` typ `dm_items_created`.

Formát DM kódu je:

`PREFIX-GID-DMSEQ`

Příklad:

`AH01-000045872-001`

Pravidla:

- `PREFIX` je zákaznický prefix organizace
- `GID` je Gogrou ID položky v pevné délce 9 číslic
- `DMSEQ` je pořadové číslo konkrétního kusu u zákazníka v pevné délce 3 číslice
- DM kód musí být unikátní v rámci tenant organizace
- DM kód se po broušení nikdy nemění
- změněné rozměry po broušení se zapisují ke konkrétnímu DM kusu
- vyřazené DM kusy zůstávají v historii
- znovupoužití pořadového čísla se zatím neimplementuje
- pokud položka nemá GID, použije se dočasný lokální GID / local item ID

### QID / Quick ID

QID = Quick ID (Quick Identifier). QID je schválené architektonické rozhodnutí GSS pro rychlou lidskou identifikaci konkrétního DM kusu.

Účel QID:

- rychlá lidská identifikace konkrétního DM kusu
- orientace ve skladu
- orientace ve výdejních automatech
- orientace při servisu a ostření
- orientace na štítku

QID není technický identifikátor a nenese žádnou logiku. QID nesmí obsahovat:

- prefix firmy
- GTIN
- GID
- typ nástroje
- výrobce
- DM kód

Formát QID:

`ABC 12345`

Pravidla formátu:

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

Soft MVP QID:

- GSS při vytvoření DM kusu automaticky vygeneruje `quickId`
- QID se uloží ke konkrétnímu DM kusu
- QID se zobrazí výrazně v DM detailu
- starší DM kus bez QID může mít v detailu akci `Vygenerovat QID`
- QID se nemění při ostření, změně rozměrů, přesunu ani rezervaci
- GSS připraví textový výstup pro ruční tisk, laser nebo dočasný štítek

MVP štítek DM kusu obsahuje pouze:

1. QID jako nejsilnější a největší prvek štítku
2. název položky z GPC
3. aktuální rozměry, například `D = 11,83`, `L1 = 24,70`, `L2 = 78,00`
4. DM kód

Legenda parametrů na štítku bude vycházet z ToolsUnited. Na štítek se v MVP netiskne historie, výrobce, povlak, počet přebroušení ani další informace. Po načtení DM kódu jsou všechny detailní informace dostupné v GSS.

Plný tisk štítků, tiskárny, PDF a finální štítkové šablony nejsou součástí soft MVP. Soft MVP řeší pouze generování QID, zobrazení QID a textový výstup pro ruční zpracování.

### DM Vytvořen vs. Fyzicky Označen

DM vytvořený v systému je platný kus. Fyzické označení nástroje laserem nebo štítkem je samostatný krok.

Při naskladnění nebo vytvoření DM kusu:

- automaticky vznikne DM kód
- automaticky vznikne QID
- kus je vedený v GSS
- `markingStatus = unmarked`
- výchozí skladový stav je `new`
- výchozí dostupnost je available

Stavy fyzického označení:

- `unmarked`: DM vytvořen v systému, fyzicky neznačeno
- `marked`: DM fyzicky označen

DM kus s `markingStatus = unmarked`:

- je evidovaný v GSS
- má DM kód
- má QID
- může být součástí zásoby
- ještě není fyzicky označený na nástroji

Fyzické laserování nebo štítek může proběhnout později, typicky při prvním ostření, měření nebo servisu. DM umožňuje historii, aktuální rozměry, rezervace a trasovatelnost už před fyzickým označením. Laser nebo štítek je fyzický nosič identity, ne samotná identita.

U DM kusu se zobrazí textový výstup:

- DM kód pro laser
- QID pro štítek

### DM Kusy jako Zdroj Skladové Zásoby

Pokud má tenant položka zapnutý DM tracking, zdrojem pravdy pro skladovou zásobu je seznam `dmItems[]`, ne ručně vedený agregovaný počet.

Pravidla soft MVP:

- DM kus ve stavu `new` se počítá do celkem i dostupné zásoby
- DM kus ve stavu `resharpened_new` se počítá do celkem i dostupné zásoby
- DM kus ve stavu `used` se počítá do celkem i dostupné zásoby
- DM kus ve stavu `reserved` se počítá do celkem, ale ne do dostupné zásoby
- DM kus ve stavu `production` se počítá do celkem, ale ne do dostupné zásoby
- DM kus ve stavu `sharpening` se počítá do celkem a do `Na broušení`, ale ne do dostupné zásoby
- DM kus ve stavu `in_grinding_shop` se počítá do celkem a do `Na broušení / v brusírně`, ale ne do dostupné zásoby
- DM kus ve stavu `sharpening` s `sharpeningDispatchStatus = sent` zůstává ve stavu `sharpening`, ale v rozpadu broušení se vede jako fyzicky mimo firmu / u brusírny
- DM kus ve stavu `blocked` se počítá do celkem, ale ne do dostupné zásoby
- DM kus ve stavu `scrapped` se nepočítá do dostupné zásoby

Při vytvoření DM kusů je výchozí stav `new` a výchozí umístění `main_warehouse`. Vytvořené DM kusy se ihned projeví v zásobě položky. U položek bez DM trackingu zůstává dosavadní množstevní logika přes `stockSummary`.

U DM položek je zásoba souhrnem konkrétních DM kusů. Základní skladový řádek a detail položky mají ukazovat primárně agregované počty:

- Celkem
- Dostupné
- Nové
- Nové přebroušené
- Ve výrobě
- Na broušení
- Blokované
- Neoznačené

Detailní seznam DM kusů se otevírá až klikem na konkrétní stav nebo tlačítkem `Zobrazit DM kusy`. Cílem je, aby základní GSS sklad nebyl dlouhý otevřený seznam jednotlivých DM kusů.

DM zásoba používá lazy expand:

`agregované stavy -> klik -> konkrétní DM/QID kusy`

Po otevření detailu položky se konkrétní DM/QID kusy nezobrazují automaticky. Uživatel vidí pouze agregované stavy jako `Celkem`, `Dostupné`, `Nové`, `Nové přebroušené`, `Použité`, `Rezervované`, `Ve výrobě`, `Na broušení`, `Blokované` a `Neoznačené`. Klik na konkrétní stav otevře pouze kusy v daném stavu, druhý klik stejný stav zavře a klik na jiný stav přepne rozpad. Tento princip je nutný kvůli výkonu a přehlednosti u zákazníků se stovkami až tisíci DM kusů.

Výdej DM položky:

- u položky s DM trackingem se nesmí automaticky vybrat první dostupný kus
- uživatel může zadat nebo načíst konkrétní DM kód nebo QID
- uživatel může také vybrat položku, kliknout na dostupnou skupinu a vybrat konkrétní DM kus ze seznamu
- dostupné skupiny pro výdej jsou `new`, `resharpened_new` a `used`
- standard GSS terminálu je `položka -> souhrn podle stavů -> konkrétní DM kus -> akce`
- systém hledá kus pouze v rámci vybrané skladové položky
- pokud DM/QID kus neexistuje, výdej se neuloží
- pokud kus není ve stavu `new`, `resharpened_new` nebo `used`, výdej se neuloží
- pokud je kus blokovaný, rezervovaný, ve výrobě, na broušení, v brusírně nebo vyřazený, není dostupný pro běžný výdej
- po kliknutí na skupinu se zobrazí konkrétní DM kusy včetně QID, DM kódu, aktuálního stavu, rozměrů, lokace, fyzického označení a posledního servisu / výdeje
- po kliknutí na `Vybrat tento kus` se tento DM/QID kus nastaví jako vybraný pro výdej
- před výdejem se zobrazí potvrzení QID, DM kódu, aktuálních rozměrů, stavu a lokace
- po potvrzení se právě tento kus nastaví na `production` a lokaci `production`
- k DM kusu se uloží poslední výdej včetně zakázky, stroje, střediska a poznámky, pokud jsou zadané

U položek bez DM trackingu zůstává množstevní výdej podle počtu kusů a vybraného provozního stavu.

Návrat DM položky z výroby:

- u položky s DM trackingem se návrat nesmí provádět množstevně bez identifikace kusu
- uživatel může zadat nebo načíst konkrétní DM kód nebo QID
- uživatel může také vybrat položku a kliknout na skupinu `Ve výrobě`
- klik na `Ve výrobě` otevře konkrétní DM kusy aktuálně vedené ve výrobě
- standard GSS terminálu pro návrat je `položka -> Ve výrobě -> konkrétní DM kus -> rozhodnutí po návratu`
- systém hledá kus pouze v rámci vybrané skladové položky
- pokud DM/QID kus neexistuje, návrat se neuloží
- pokud kus není ve stavu `production`, návrat se neuloží
- u kusů ve výrobě se zobrazí QID, DM kód, aktuální lokace, stroj, zakázka, středisko, datum posledního výdeje a kdo výdej provedl
- po kliknutí na `Vybrat tento kus` se tento DM/QID kus nastaví jako vybraný pro návrat
- před návratem se zobrazí potvrzení QID, DM kódu, aktuálních rozměrů, stavu a posledního výdeje
- uživatel rozhodne, zda se konkrétní kus vrací jako `used`, jde na `sharpening`, má být `blocked`, nebo `scrapped`
- po návratu se mění stav přesně tohoto DM kusu
- k DM kusu se uloží `lastReturnMetadata`
- skladový souhrn se znovu přepočítá z `dmItems[]`

U položek bez DM trackingu zůstává množstevní návrat podle počtu kusů.

Terminálové pravidlo DM operací:

Výdej:

`Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní kus -> Akce`

Návrat:

`Položka -> Ve výrobě -> Konkrétní kus -> Rozhodnutí po návratu`

Rezervace:

`Položka -> Nový / Nový přebroušený / Použitý -> Konkrétní DM/QID kus -> Rezervace`

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

DM kus navíc zobrazuje:

- QID
- aktuální lokaci
- aktuální rozměry
- stav
- rezervaci

Příklad zobrazení DM kusu:

```text
QID: KPL 14852

Lokace:
Hlavní sklad
Regál A
Police 03
Box 12
```

DM detail zobrazuje:

- DM kód
- název položky
- GPC ID / lokální položku
- výrobce
- typ
- aktuální průměr
- aktuální délku
- počet přebroušení
- max počet přebroušení
- povlak
- výkres / odkaz na výkres
- stav
- umístění
- blokaci
- poznámku
- poslední servis
- historii DM kusu

Po načtení DM kódu má zákazník okamžitě vidět aktuální hodnoty po ostření, například `MTTM MAXLIFE D=11,83 mm, L=24,73 mm`.

DM detail v MVP umožňuje akci `Zapsat servis / změnit parametry`. Uživatel nebo servisní partner může ručně zapsat nový aktuální průměr, novou aktuální délku, počet přebroušení, povlak, poznámku k servisu, měřicí protokol / odkaz, kdo servis provedl a datum servisu. Po uložení se DM kus nastaví na `resharpened_new`, umístění `main_warehouse` a vznikne `movementHistory` typ `dm_service_updated`.

M-technologies / Gogrou je výchozí servisní autorita. Servisní partner může po načtení DM kódu otevřít servisní pohled konkrétního nástroje zákazníka a zapsat aktuální parametry po broušení. GPC master data se nemění; mění se pouze tenant provozní data konkrétního DM kusu v GSS.

Pokud chce zákazník povolit jinou brusírnu jako servisního partnera, bude to později placená autorizační služba. Platit může zákazník i externí brusírna podle budoucího obchodního modelu. Detailní fee model není součástí MVP.

M-technologies může po změření na Helicheku generovat měřicí protokol. Do budoucna může měřicí zařízení poslat data přímo do Gogrou a systém podle DM kódu zapíše konkrétní hodnoty, například průměr, délku a další měřené parametry podle typu nástroje. V MVP je pouze pole `měřicí protokol / odkaz` a ruční zadání hodnot.

Aktuální hodnoty DM kusu bude možné později exportovat mimo Gogrou pro rychlé nahrání korekcí do stroje, podklad pro programátora nebo servisní report. V MVP je export pouze placeholder.

Pokud je DM kus `blocked`, detail výrazně zobrazí `Tento kus je blokovaný` a důvod blokace. Blokovaný kus nesmí být vydán do výroby.

Pokud `sharpeningCount >= maxSharpeningCount`, GSS zobrazí varování `Tento nástroj dosáhl limitu přebroušení. Doporučeno vyřadit.` Automatické vyřazení není součástí MVP.

DM umožňuje:

- evidovat konkrétní fyzický kus
- sledovat aktuální rozměry po broušení
- rezervovat konkrétní kus
- vést servisní historii
- připravit integraci měřicích zařízení
- připravit export hodnot do výroby

V MVP se neřeší fyzický tisk DM kódů, integrace čteček, Helichek API, automatické měřicí protokoly, plný servisní portál, billing externích brusíren, detailní oprávnění, backend / DB / auth ani export do CNC / strojů.

### Soft MVP Odeslání DM Kusu Na Broušení

DM kus ve stavu `sharpening` může být nejdříve pouze připravený ve firmě ke sběru. GSS proto rozlišuje digitální stav `Na broušení` a fyzické odeslání servisnímu partnerovi.

Příznak `sharpeningDispatchStatus`:

- `waiting`: čeká na fyzické odeslání
- `sent`: fyzicky odesláno na broušení
- `serviced`: servis zapsal nové parametry po broušení
- `returned`: vráceno z broušení

Soft MVP workflow zákazníka:

1. DM kus je ve stavu `sharpening`.
2. Uživatel v detailu položky otevře skupinu `Na broušení`.
3. U konkrétního QID/DM kusu klikne `Odeslat na broušení`.
4. Doplní brusírnu / servisního partnera, box / bedýnku / sběrné místo, datum odeslání, kdo provedl a poznámku.
5. Po potvrzení se DM kus nemění na nový provozní stav; zůstává `sharpening`.
6. Nastaví se `sharpeningDispatchStatus = sent`.
7. `location` se nastaví na servisní partner / mimo firmu.
8. Uloží se `sharpeningDispatchMetadata`.
9. Zapíše se historie kusu a `movementHistory`.

Soft MVP výstup:

- GSS zobrazí textový podklad `Dodací podklad broušení`
- obsahuje datum, brusírnu, položku, QID, DM kód, pokyny k broušení, výkres / přílohu, povlak a poznámku
- výstup je zatím pouze textarea pro ruční kopírování nebo tisk

### Soft MVP Servisní Terminál M-Technologies

Změna aktuálních rozměrů po broušení probíhá v MVP primárně v servisním terminálu M-technologies, ne až u zákazníka při příjmu.

Servisní terminál:

- načte DM kód
- najde konkrétní DM kus
- pokud kus není ve stavu `sharpening` nebo nemá `sharpeningDispatchStatus = sent`, zobrazí varování
- zobrazí QID, DM kód, položku, GPC ID / GTIN, zákazníka, aktuální stav, rozměry před broušením, historii kusu, poslední výdej / návrat, pokyny k broušení, výkres / přílohu, povlak, poznámky a limity přebroušení
- umožní zapsat nové parametry po broušení: `D`, `L1`, `L2`, další parametry, servisní poznámku, kdo provedl a datum servisu

Po uložení servisního zápisu:

- nové aktuální rozměry se uloží ke konkrétnímu DM kusu
- uloží se `lastServiceMetadata`
- zvýší se počet přebroušení
- `sharpeningDispatchStatus = serviced`
- provozní status zůstává `sharpening`, dokud zákazník nepotvrdí příjem zpět
- vznikne DM history a `movementHistory`
- QID a DM kód se nemění

Servisní terminál připraví print-friendly štítek s QID, názvem položky, výrobcem / značkou, typem, aktuálními rozměry `D`, `L1`, `L2`, stavem kusu, DM kódem, datem posledního servisu, servisním partnerem a poznámkou.

Po každé změně parametrů v brusírně musí být možné okamžitě vytisknout nový štítek s aktuálními rozměry. Štítek slouží k rychlé fyzické identifikaci nástroje ve skladu, u stroje, ve výdejním automatu nebo při ruční manipulaci. V MVP tisk používá `window.print()` a print-friendly panel, který při tisku skryje zbytek aplikace. Klik na tisk zapíše do DM history záznam `label_printed` s QID, DM kódem, aktuálními rozměry, datem, kdo tisk provedl a zdrojem (`servisní terminál` nebo `detail kusu`).

Stejný render štítku je dostupný i v detailu konkrétního DM/QID kusu, aby bylo možné znovu vytisknout štítek například při ztrátě fyzického označení.

### Soft MVP Příjem Z Broušení

Příjem z broušení je návrat konkrétního DM/QID kusu, ne běžný anonymní příjem položky.

Zákazník v GSS:

- zadá / načte DM nebo QID
- nebo otevře skupiny `Odesláno na broušení` a `Servis dokončen / čeká na příjem`
- vybere konkrétní DM kus
- potvrdí datum příjmu, kdo provedl, poznámku a cílový sklad / lokaci

Po potvrzení:

- status kusu se nastaví na `resharpened_new` jako MVP název pro nový přebroušený stav
- architektonický alias cílového stavu je `resharpened`
- `sharpeningDispatchStatus = returned`
- `location = main_warehouse` nebo zvolená lokace
- uloží se `sharpeningReturnMetadata`
- kus se počítá jako dostupný
- vznikne DM history a `movementHistory`
- aktuální rozměry zůstávají ty, které zadala M-technologies
- QID a DM kód se nemění

Pokud kus nemá `sharpeningDispatchStatus = serviced`, GSS zobrazí varování `U tohoto kusu nejsou uložené servisní rozměry z brusírny.` Pro MVP může být příjem povolen po potvrzení výjimky.

Běžný příjem znamená nové kusy. Příjem z broušení znamená návrat konkrétního DM/QID kusu.

U DM položky nesmí běžné naskladnění `Nový přebroušený` vytvářet anonymní nové DM kusy. Přebroušený DM kus se přijímá přes `Příjem z broušení`.

Mimo MVP zůstává PDF, číslování dodacích listů, e-mail, backend, databáze a externí servisní přístup brusírny.

Budoucí směr:

- brusírna načte DM kód přes servisní přístup
- uvidí pokyny k broušení, výkres, povlak a servisní historii
- doplní nové rozměry po broušení, počet přebroušení, poznámku a případně měřicí protokol
- po návratu se kus nastaví na `resharpened` / v MVP `resharpened_new`
- QID i DM kód zůstávají stejné
- mění se pouze tenant provozní data konkrétního DM kusu v GSS.

## GSS Onboarding Engine / Hromadný Import a Konfigurační XLS

GSS musí být architektonicky připravené na rychlé pilotní nasazení u zákazníků, kteří už dnes mají reálná skladová data v ERP, výdejním automatu, Excelu nebo interním skladovém seznamu. Cílem není ručně zakládat stovky až tisíce položek, ale co nejrychleji dostat reálný zákaznický sklad do GSS a následně hromadně doplnit provozní pravidla.

### Vstupní Scénář A: Zákazník Má Existující Data

Zákazník může dodat:

- ERP export
- export z výdejního automatu
- XLS / CSV seznam
- interní skladový seznam

GSS Onboarding Engine se pokusí položky spárovat s GPC podle:

- GTIN
- GID
- objednací číslo
- výrobce + objednací číslo
- čárový kód
- přesný název
- podobnost názvu

Výstup párování má být srozumitelný pro rozhodnutí zákazníka nebo Gogrou týmu, například:

`Z 1678 položek bylo v GPC nalezeno 1234. Chcete je převzít do GSS?`

Nalezené položky z GPC se převezmou do GSS zákazníka jako tenant skladové položky. Nenalezené položky se založí jako lokální / nevalidované položky v GSS.

### Vstupní Scénář B: Zákazník Data Nemá

Pokud zákazník nemá připravený export, GSS umožní postupný vznik skladového seznamu:

- ruční založení položky
- načtení čtečkou
- postupné doplňování položek při běžném provozu

I v tomto scénáři musí být možné kdykoliv vygenerovat GSS konfigurační XLS pro hromadné doplnění provozních pravidel.

### GSS Konfigurační XLS

GSS konfigurační XLS není jen importní soubor. Je to hromadná konfigurace zákaznického skladu.

Musí být vždy generovatelný z GSS a slouží k doplnění:

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

### Rozdělení Odpovědnosti GPC vs. GSS XLS

GPC drží:

- technickou identitu položky
- výrobce
- GTIN/GID
- technické parametry
- ToolsUnited strukturu
- obrázky / datasheety / odkazy

GSS konfigurační XLS drží:

- provozní pravidla zákazníka
- skladovou logiku
- nákupní logiku
- servisní logiku
- lokace
- zákaznickou konfiguraci

GSS XLS nesmí měnit GPC master data. Slouží pouze k tenant provozní konfiguraci.

### Delegování Práce

Konfigurační XLS má umožnit zákazníkovi delegovat doplnění dat na:

- technology
- nákup
- skladníky
- seřizovače
- výrobu

Důvod je praktický: u zákazníka mohou být stovky až tisíce položek a ruční editace přímo v GSS by byla pomalá.

### Budoucí Doporučení Systému

GSS může později nad importovanými a provozními daty doporučit:

- zapnout DM tracking u drahých / brousitelných nástrojů
- zapnout nadnormativy
- upravit min/max podle spotřeby
- označit položku jako servisovatelnou
- doporučit sledování životnosti

Příklad:

`Monolitní fréza, vysoká cena, brousitelná položka -> doporučit DM tracking.`

### GINA Onboarding Analytics

Budoucí služba `GINA Onboarding Analytics` je AI návrh GSS skladu ze skutečné historické spotřeby zákazníka.

Vstupem může být:

- spotřeba položek za 6-12 měsíců
- ERP export
- export z výdejního automatu
- XLS / CSV

GINA nad těmito daty navrhne:

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

Výstupem služby může být:

- návrh GSS konfiguračního XLS
- přehled nalezených položek v GPC
- přehled nenalezených položek
- doporučení pro zákazníka

Toto není MVP implementace. Jde o budoucí placenou AI službu nad onboardingem zákazníka.

### Pilotní Zákazníci

Tato funkce je důležitá pro pilotní zákazníky, kteří už dnes mají data z:

- výdejních automatů
- ERP
- skladových systémů
- Excelů

Cílem je rychle dostat jejich reálný sklad do GSS bez ruční práce a bez toho, aby se technická master data přesouvala mimo GPC.

### MVP Rozsah

Pro MVP se GSS Onboarding Engine zapisuje jako návrhový směr a architektonický požadavek.

Mimo MVP zůstává:

- plný parser XLS/CSV
- UI import
- backend importní pipeline
- validace XLS
- napojení ERP
- napojení výdejních automatů

Architektura GSS s touto vrstvou musí počítat, protože je zásadní pro pilotní nasazení.

## Komunikační Vrstva pro Nadnormativy

Nadnormativy mezi firmami potřebují řízenou komunikaci. Nadnormativní nabídka nemusí být vždy 100% aktuální, protože fyzická zásoba se může mezitím změnit. Nabízející firma proto musí potvrdit, že položku stále má, v jakém množství, za jakou cenu a za jakých podmínek.

MVP směr je jednoduché tlačítko `Mám zájem`. Po kliknutí vznikne `inquiry` / poptávkový kontakt navázaný na konkrétní nadnormativní nabídku.

Inquiry eviduje:

- kupující firmu
- prodávající firmu
- položku
- počet kusů
- zprávu
- stav: `nový`, `řeší se`, `potvrzeno`, `zamítnuto`, `dokončeno`

Komunikace v MVP může začít jako interní zpráva v Gogrou. E-mail upozornění slouží jako fallback, aby prodávající firma nezmeškala zájem o nabídku.

Pozdější směr:

- Gogrou chat mezi firmami
- vlákno navázané na konkrétní nadnormativní nabídku
- potvrzení aktuální dostupnosti
- potvrzení ceny
- dohoda dopravy / předání
- přechod do objednávky / RFQ

Komunikace musí být auditovatelná. GSS musí umět zpětně dohledat, kdo projevil zájem, kdo dostupnost potvrdil, jaká cena byla potvrzena a jaký byl výsledek komunikace.

Tato komunikační vrstva je budoucí Gogrou workflow. V aktuálním MVP se neprogramuje chat, e-mailové odesílání, objednávka ani RFQ přechod.

## Hlídací Pes / Watchdog

Hlídací pes je budoucí služba Gogrou, ve které si zákazník nastaví, co ho obchodně nebo provozně zajímá. Gogrou potom za zákazníka sleduje relevantní signály napříč GSS, nadnormativami, Gogrou partnery, akcemi, SS / RFQ / Promitea výsledky a budoucí obchodní vrstvou.

Hlídací pes může sledovat:

- cenu konkrétní položky
- nadnormativy v Gogrou komunitě
- obchodní akce
- alternativní nabídky
- nabídky Gogrou partnerů
- budoucí SS / RFQ / Promitea výsledky

Důležité pravidlo: Hlídací pes není objednávka. Je to upozornění / obchodní příležitost, ze které může později vzniknout inquiry, poptávka, RFQ nebo objednávka.

### Hlídání Konkrétní Položky

Uživatel může u položky v GSS zapnout akci `Hlídat položku`.

Nastavení hlídání:

- cílová cena
- procento pod poslední nákupní cenou
- hlídat pouze nadnormativy
- hlídat Gogrou partner nabídky
- aktivní / neaktivní
- poznámka

Tato nastavení jsou tenant provozní a obchodní vrstva. Nemění GPC master data.

### Hlídání Podle Parametrů

Budoucí možnost je hlídání podle parametrického dotazu, například:

- tvrdokovová fréza
- průměr D12
- 4 zuby
- HPC
- konkrétní výrobce / bez výrobce
- maximální cena
- dostupnost

Parametrické hlídání může později využívat GPC jako validovaný technický katalog, GSS nákupní historii a obchodní nabídky nad GPC.

### Watchdog Záznam

Dokumentační model `watchdog`:

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

### Výstup Hlídacího Psa

Pokud Gogrou najde shodu, vytvoří upozornění. Upozornění musí ukázat:

- odkud nabídka je
- cenu
- dodavatele
- stav dostupnosti
- možnost vytvořit inquiry / poptávku / objednávku

Hlídací pes bude napojený na komunikační vrstvu Gogrou:

- notifikace
- interní Gogrou zprávu
- e-mail fallback
- později push do Gogrou app

### Budoucí GINA

GINA může později nad daty Hlídacího psa doporučovat:

- tuto položku kupujete draze
- existuje levnější alternativa
- objevila se nadnormativa
- je vhodné vytvořit RFQ
- akce SS je výhodná proti vaší historii nákupů

Pro MVP se Hlídací pes pouze dokumentačně připravuje. Neprogramuje se UI, DB, AI matching, skutečné notifikace, marketplace, platby ani backend.

## GSS Hlavní Obrazovka: Terminál A Skladové Položky

Hlavní obrazovka GSS nesmí být dlouhý dashboard se všemi otevřenými sekcemi. Cílový MVP princip je jednoduchá křižovatka:

1. `TERMINÁL`
2. `SKLADOVÉ POLOŽKY`

Horní část obrazovky má být pouze malý kontext firmy a skladu, například `Firma: ARGO HYTOS | Sklad: Hlavní sklad`. Informace o firmě, kontaktech, modulech, předplatném a správě skladů patří do samostatných administračních částí. Hlavní pracovní plocha patří GSS.

### Terminál

Terminál je pracovní režim pro konkrétní provozní úkony:

- Příjem
- Výdej
- Návrat z výroby
- Rezervace
- Odeslat na broušení
- Příjem z broušení
- Servisní terminál M-technologies
- Načíst DM/QID

Terminálový princip:

`Akce -> chytré hledání / načtení kódu -> položka -> konkrétní stav / kus -> provedení operace`

Po otevření terminálové akce se ostatní části obrazovky schovají. Uživatel se vrací přes `Zpět na Terminál`.

### Skladové Položky

Skladové položky slouží pro evidenci a správu položek. Základní pohled je kompaktní řádkový seznam s chytrým hledáním.

Hledání musí podporovat:

- název
- výrobce
- GTIN
- GID
- DM
- QID
- interní kód
- parametry z GPC
- volné kombinace typu `freza 12 4z`, `Walter D12 L25`, `VBD CNMG`

Položky lze zobrazit i bez hledání. Řazení může být podle nejčastějšího použití nebo posledního použití. Do budoucna může být řazení personalizované podle přihlášeného uživatele, role nebo pracoviště, například frézař může vidět jiné nejčastější položky než soustružník.

### Karta Položky V Seznamu

První pohled na položku má být stručný:

- vlevo přesný název položky, typ / kategorie / výrobce a GPC ID / GTIN
- uprostřed skladové počty: celkem, dostupné, nový, nový přebroušený, použitý, rezervované, ve výrobě, na broušení, blokované
- nastavení DM, min/max, warning a nadnormativa nemají být hlavní informace v řádku; patří do detailu položky nebo nastavení

### Symbol DM/QID Rozpadu

Globální UX pravidlo:

`◢ = konkrétní kusy / DM/QID rozpad`

Pokud je symbol `◢` za číslem, údaj reprezentuje konkrétní DM/QID kusy a je prokliknutelný nebo připravený k rozbalení. Používá se u počtů jako celkem, nový, nový přebroušený, použitý, rezervované, ve výrobě, na broušení a blokované.

Bez symbolu `◢` jde o běžnou množstevní evidenci bez konkrétních DM/QID kusů.

### GPC Detail V GSS

GSS neukládá kompletní technická data položky. GSS drží provozní logiku zákazníka:

- stav zásob
- min/max
- DM/QID
- broušení
- lokace
- historie
- rezervace
- servisní cyklus

GPC je zdroj technických dat:

- parametry
- GPC ID
- GTIN
- výrobce
- výkresy
- katalogová data
- ToolsUnited vazby
- technické přílohy

GSS si technická data pouze zobrazuje nebo dotahuje podle vazby na GPC. Detail skladové položky proto může nabídnout akci `Zobrazit GPC detail`, která v MVP ukáže základní technický panel a později bude napojená na plná GPC / ToolsUnited data.

### Detail Položky

Detail položky slouží pro kontrolu a správu:

- identita položky
- skladové počty
- DM rozpad přes `◢`
- nastavení položky
- historie pohybů
- akční tlačítka pro operace

Historie pohybů ani nastavení nemají být defaultně rozbalené. Uživatel je otevírá tlačítkem.

Akce z detailu položky mají uživatele vést do příslušného terminálového režimu s předvyplněnou položkou. Nesmí vzniknout dvě různé logiky výdeje, návratu nebo rezervace.

Při otevřené akci nad položkou se detail zjednodušuje. Zůstává vidět pouze:

- stručná identita položky
- základní skladové počty
- informace, zda jde o DM/QID sledovanou položku
- aktivní akční panel

Dlouhá DM zásoba, historie, nadnormativa a detailní nastavení se během provádění akce schovají, aby pracovník nebyl zahlcený.

Každý akční režim musí mít jasnou návratovou cestu:

- `Zpět na Terminál`
- `Zpět na skladové položky`
- `Zpět na detail položky`

Ve skladových položkách má být dostupné trvalé tlačítko `Zpět na hlavní GSS`, aby se uživatel i při dlouhém scrollování rychle vrátil na hlavní křižovatku.

### Feature Flags A Placené Moduly

Každá větší služba GSS/Gogrou musí být do budoucna zapínatelná nebo vypínatelná pro konkrétního zákazníka jako modul nebo placená funkce.

Příklady modulárních funkcí:

- DM tracking
- Nadnormativy
- Servisní terminál
- GINA služby
- XLS onboarding
- Kooperace
- Toolshop
- Reporty
- Automat / PLC napojení

V MVP se neřeší platby ani fakturace. Architektura ale musí počítat s obchodní modularitou funkcí.
