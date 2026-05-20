# GSS MVP Implementation Plan

## Cíl

Tento dokument popisuje implementační pořadí GSS MVP na úrovni produktové a datové logiky.

Neprogramuje databázi, neřeší detail UI a nezasahuje do GPC.

GSS MVP začíná entitou firma / tenant. GPC zůstává validovaný zdroj master dat.

## Výchozí Princip

GSS je multi-tenant zákaznické prostředí.

Každá firma má:

- vlastní uživatele
- vlastní role
- jeden hlavní sklad v MVP
- vlastní GSS položky
- vlastní DM kusy
- vlastní pohyby
- vlastní ceníky
- vlastní nadnormativy

Firma vidí pouze svá data.

## Etapa 1: Firma, Role, Hlavní Sklad, Základní Lokální Data

Etapa 1 vytváří základ zákaznického prostoru.

### Firma / Tenant

Základní atributy:

- název firmy
- zákaznický prefix, například `AH01`
- IČO
- země
- kontaktní údaje
- výchozí jazyk
- hlavní sklad
- stav firmy: `active`, `paused`, `archived`

Firma je tenantová hranice. Všechna GSS data musí být vázaná na firmu.

### Uživatelé Firmy

Základní atributy:

- jméno
- e-mail
- telefon
- role
- aktivní/neaktivní
- vazba na firmu

Uživatel může patřit k firmě a pracovat pouze s daty této firmy.

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

V MVP má firma jeden hlavní sklad.

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
