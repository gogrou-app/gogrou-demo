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

### Ohlášení Rozdílu Ve Fyzické Zásobě

GSS musí umožnit pracovníkovi ohlásit rozdíl ve skladu.

Příklad:

- systém ukazuje 10 ks
- pracovník fyzicky vidí jen 8 ks
- pracovník ohlásí validní množství / rozdíl
- informace jde zodpovědné osobě
- později se propojí s audit logem

Pracovník tím chrání sebe před odpovědností za předchozí chybu. Audit log později umožní dohledat předchozí pohyby a určit, kde rozdíl vznikl. Detailní workflow ohlášení, schválení a korekce zásoby bude řešeno později.

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

### Dokladová Logika Příjmu

Při naskladnění musí GSS připravit základ evidence, proč a na základě čeho se příjem děje. V MVP se zatím nevede plná historie pohybů, ale u položky se ukládá poslední příjem / intake metadata.

Typ dokladu nebo důvod příjmu:

- dodací list dodavatele
- faktura dodavatele
- interní příjemka
- servisní dodací list po broušení
- návrat z výroby
- ruční korekce / inventura

Metadata příjmu:

- číslo dokladu, volitelné pro MVP
- dodavatel / zdroj
- datum příjmu
- provedl
- poznámka k příjmu

Pole `provedl` je v MVP textové. V produkční vrstvě to bude přihlášená osoba, výdejní automat, ERP nebo integrační zdroj.

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
