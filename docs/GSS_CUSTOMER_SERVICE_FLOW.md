# GSS Customer Service Flow

## Cíl

Tento dokument popisuje procesní logiku GSS z pohledu zákazníka.

GSS je zákaznický provozní svět. GPC je pouze validovaný zdroj master dat.

GSS řeší konkrétní zákaznickou evidenci, sklady, kusy, výdeje, návraty, DM tracking, brousitelnost, zákaz výdeje, měření a historii. GPC drží validovanou master položku, ale neřeší provoz konkrétního zákazníka.

Dokument nepopisuje UI a neprogramuje backend. Jde o procesní mapu.

Tento dokument neobsahuje detailní MVP pravidla. Slouží jako procesní mapa GSS z pohledu zákazníka.

Detailní rozsah GSS je v:
`docs/GSS_MVP_SCOPE.md`

Implementační pořadí je v:
`docs/GSS_MVP_IMPLEMENTATION_PLAN.md`

## Související globální principy

Tento dokument vychází z globálních architektonických principů Gogrou:
`docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.

Lokální pravidla v tomto dokumentu principy pouze zpřesňují pro daný modul.

## 1. Založení Firmy / Zákaznického Účtu

Proces začíná vytvořením zákaznického účtu nebo firmy.

Zákaznický účet obsahuje:

- název firmy
- interní prefix zákazníka
- základní provozní nastavení
- hlavní sklad
- budoucí vazby na další sklady, ERP nebo automat

Po založení firmy vzniká izolovaný zákaznický prostor GSS. Zákazník v něm pracuje se svými položkami, svými kusy a vlastní historií.

## 2. Vytvoření Hlavního Skladu

Každá firma má minimálně hlavní sklad.

Hlavní sklad slouží jako výchozí místo pro:

- převzetí položek z GPC
- lokální evidenci zákaznických položek
- naskladnění kusů
- výdej do výroby
- návrat z výroby
- rozhodnutí o broušení, blokaci nebo vyřazení

Později může zákazník mít další sklady, výdejní automaty nebo lokace.

## 3. Vyhledání Položky v GPC

Zákazník může v GSS vyhledat položku v GPC katalogu.

Typické vyhledávací vstupy:

- název
- GPC ID
- GTIN
- katalogové číslo výrobce
- výrobce
- produktový typ
- technické parametry

GPC slouží jako validovaný zdroj master dat. Zákazník GPC položku neupravuje.

## 4. Převzetí Validované Položky z GPC do GSS

Pokud zákazník najde správnou validovanou GPC položku, převezme ji do svého GSS skladu.

Převzetím vzniká zákaznická GSS položka, která odkazuje na GPC master data, ale má vlastní zákaznický provozní kontext.

GSS položka může mít vlastní:

- min/max
- výstrahy
- DM tracking
- brousitelnost
- skladové stavy
- zákaznickou poznámku
- zákaznické interní ID
- historii pohybů

GPC master data zůstávají validovaným zdrojem. Provozní nastavení vzniká v GSS.

## 5. Lokální Nevalidovaná Položka, Pokud Není v GPC

Pokud položka v GPC není, zákazník ji může založit lokálně v GSS jako nevalidovanou zákaznickou položku.

Tato položka:

- nepatří do GPC
- není validovanou master položkou
- je viditelná pouze v zákaznickém GSS prostoru
- má omezené pokročilé funkce

Nevalidovaná GSS položka typicky nemá:

- normativy
- AI doporučení
- plnohodnotné alternativy
- plnou technickou dokumentaci
- automatické optimalizace

Nevalidovaná položka může sloužit jako podnět pro Gogrou tým k doplnění validované položky do GPC.

## 6. Nastavení Min/Max

Min/max je zákaznické provozní nastavení v GSS.

Zákazník nastavuje:

- minimální skladovou zásobu
- maximální skladovou zásobu
- výstražnou hranici
- případně pravidlo pro objednání nebo doplnění

Min/max se nikdy neukládá do GPC, protože jde o zákaznický provozní kontext.

## 7. Nastavení DM Trackingu

DM tracking určuje, zda se položka sleduje po jednotlivých fyzických kusech pomocí DataMatrix nebo podobného kódu.

Pokud je DM tracking zapnutý:

- každý kus má vlastní identitu
- každý kus má vlastní stav
- každý kus má vlastní historii
- lze blokovat konkrétní kus
- lze sledovat měření po broušení

Pokud je DM tracking vypnutý:

- položka se může evidovat agregovaně po množství
- stav se sleduje na úrovni skladové zásoby

## 8. Nastavení Brousitelnosti

Brousitelnost je zákaznické pravidlo v GSS.

Zákazník určuje:

- zda je položka brousitelná
- kolikrát ji lze typicky brousit
- kdy má jít po návratu z výroby na broušení
- zda po broušení vyžaduje měření
- zda se po broušení tiskne nový štítek

Brousitelnost nepatří do GPC. GPC může obsahovat technická master data, ale rozhodnutí o provozním zacházení je v GSS.

## 9. Naskladnění Položky

Naskladnění vytvoří skladový stav nebo konkrétní kusy.

Naskladnění může vzniknout z:

- počátečního stavu
- nákupu
- převodu
- návratu od dodavatele
- návratu z broušení
- ruční korekce

Při DM trackingu se pro každý kus vytvoří individuální evidence. Bez DM trackingu se navýší agregovaný stav.

## 10. Výdej Položky

Výdej znamená přesun položky nebo konkrétního kusu ze skladu do výroby, zakázky, stroje nebo pracovníka.

Výdej kontroluje:

- dostupnost množství
- stav konkrétního kusu
- zákaz výdeje
- potřebu měření nebo servisu
- případnou blokaci položky

Pokud je kus blokovaný, systém nemá dovolit jeho běžný výdej.

## 11. Návrat z Výroby

Návrat z výroby vrací položku nebo kus zpět do GSS procesu.

Při návratu se rozhoduje:

- zda je kus použitelný
- zda má jít zpět do skladu
- zda má jít na broušení
- zda má být blokovaný
- zda má být vyřazený
- zda je potřeba měření

U DM kusů se rozhodnutí zapisuje ke konkrétnímu kusu.

## 12. Rozhodnutí: Sklad / Broušení / Blokace / Vyřazení

Po návratu z výroby se určuje další stav.

Možnosti:

- `stock` - návrat do skladu
- `sharpening` - odeslat na broušení
- `blocked` - zakázat výdej
- `scrapped` - vyřadit

Rozhodnutí může být ruční nebo v budoucnu doporučené systémem podle pravidel, měření a historie.

## 13. Evidence Jednotlivých DM Kusů

Při DM trackingu má každý kus vlastní evidenci.

Kus může mít:

- unikátní DM kód
- stav
- lokaci
- historii výdejů a návratů
- počet broušení
- aktuální měřené rozměry
- zákaz výdeje
- vazbu na štítek
- servisní poznámky

Tato evidence je čistě zákaznická GSS evidence.

## 14. Zákaz Výdeje Konkrétního Kusu

Konkrétní DM kus může být zablokovaný.

Důvody blokace:

- poškození
- čeká na měření
- čeká na broušení
- nevyhovující rozměry
- interní reklamace
- bezpečnostní důvod

Blokace se vztahuje na konkrétní kus, ne na GPC master položku.

## 15. Aktualizace Rozměrů po Broušení

Po broušení se mohou změnit rozměry kusu.

GSS eviduje:

- původní rozměry
- nové naměřené rozměry
- datum měření
- kdo měřil
- vazbu na servisní cyklus
- počet broušení

Tyto rozměry nepřepisují GPC. GPC drží master technické parametry nové validované položky. GSS drží aktuální stav konkrétního kusu.

## 16. Tisk Štítku po Změření

Po změření může být potřeba vytisknout nový štítek.

Štítek může obsahovat:

- DM kód
- interní ID zákazníka
- aktuální rozměry
- stav po broušení
- počet broušení
- datum měření
- případné omezení výdeje

Tisk štítku navazuje na DM tracking a měření konkrétního kusu.

## 17. Přehled Stavů a Historie

GSS musí poskytovat historii provozního života položky a kusů.

Historie může obsahovat:

- převzetí položky z GPC
- založení lokální nevalidované položky
- naskladnění
- výdej
- návrat z výroby
- broušení
- měření
- změnu stavů
- blokaci
- vyřazení
- tisk štítku
- ruční poznámky

Historie je zákaznická provozní auditní stopa.

## 18. Vazba na Budoucí Automat / ERP / Promitea

GSS má být připravený na budoucí integrace.

Možné integrace:

- výdejní automat
- ERP
- Promitea
- nákupní proces
- skladový systém zákazníka
- servisní partner
- tiskárna štítků
- měřicí zařízení

Integrace musí respektovat rozdíl:

- GPC dodává validovaná master data
- GSS řídí zákaznický provozní život položek a kusů

Automat nebo ERP nesmí přímo měnit GPC. Pracuje s GSS daty a případně vytváří podnět pro doplnění GPC.

## Shrnutí Procesní Logiky

Základní tok:

1. zákazník založí firmu
2. vznikne hlavní sklad
3. zákazník vyhledá položku v GPC
4. validovanou položku převezme do GSS
5. pokud položka v GPC není, založí lokální nevalidovanou položku v GSS
6. nastaví provozní pravidla
7. naskladní položky nebo konkrétní DM kusy
8. vydává je do výroby
9. přijímá je zpět
10. rozhoduje o skladu, broušení, blokaci nebo vyřazení
11. eviduje historii
12. připravuje data pro budoucí automat, ERP nebo Promitea

GSS je zákaznický provozní svět. GPC je validovaný zdroj master dat.
