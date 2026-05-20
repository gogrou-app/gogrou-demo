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

## 1. Firma / Tenant

GSS MVP začíná entitou firma, tedy zákaznický tenant.

Firma / tenant obsahuje:

- název firmy
- zákaznický prefix, například `AH01`
- IČO
- země
- kontaktní údaje
- výchozí jazyk
- hlavní sklad
- stav firmy: `active`, `paused`, `archived`

Firma je základní hranice datové izolace. Všechna zákaznická provozní data v GSS musí být vázaná na konkrétní firmu.

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

V MVP má každá firma jeden hlavní sklad.

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

### Lokální Nevalidovaná Položka v GSS

Pokud položka v GPC není, zákazník ji může založit lokálně v GSS.

Lokální nevalidovaná položka:

- existuje pouze v zákaznickém GSS
- není validovaným master záznamem
- nemá plnou GPC datovou kvalitu
- může sloužit jako podnět pro doplnění do GPC

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

## 7. Lokální Nastavení Položky

Lokální nastavení položky patří do GSS, ne do GPC.

MVP nastavení:

- `min`
- `max`
- `warning`
- DM tracking ano/ne
- brousitelnost ano/ne
- max počet přebroušení
- zákaznické poznámky
- blokace položky
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

Nadnormativní položka je položka nebo kus, který zákazník nepotřebuje držet ve skladu v běžném množství a může ho nabídnout.

MVP rozsah:

- označení položky jako nadnormativní
- počet kusů k nabídnutí/prodeji
- cena
- stav nabídky
- interní / externí nabídka
- vazba na Gogrou komunitu
- vazba na zákazníka
- blokace kusů určených k nabídce
- historie nabídky

Stavy nabídky:

- `draft`
- `internal`
- `external`
- `offered`
- `reserved`
- `sold`
- `cancelled`

Kusy určené k nabídce musí být blokované proti běžnému výdeji, aby se neprodaly a zároveň nevydaly do výroby.

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
