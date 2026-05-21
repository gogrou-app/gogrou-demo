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
- blokace kusů určených k nabídce
- historie nabídky
- poznámka
- datum vytvoření

Stavy nabídky:

- `draft`
- `active`
- `paused`
- `sold`
- `cancelled`

Kusy určené k nabídce musí být blokované proti běžnému výdeji, aby se neprodaly a zároveň nevydaly do výroby.

### Rezervace Nadnormativních Zásob

GSS musí rozlišit dva režimy rezervace podle toho, zda má položka zapnutý DM tracking.

#### A) Položka bez DM trackingu

U položky bez DM trackingu se rezervuje pouze množství.

Příklad:

- celková zásoba: 20 ks
- nadnormativní nabídka: 5 ks
- dostupné množství pro běžný výdej: 15 ks

Rezervované množství se odečte z dostupného množství pro běžný výdej. Systém musí jasně zobrazit, kolik kusů je dostupných a kolik kusů je rezervovaných pro nabídku.

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
