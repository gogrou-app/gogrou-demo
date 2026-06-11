# Gogrou Core Architecture Principles

Tento dokument popisuje globální architektonické principy Gogrou. Nejde pouze o pravidla pro GSS, ale o zásady platné pro všechny moduly Gogrou: GPC, GSS, STM, GINA, Toolshop, služby, marketplace, kooperace, objednávky, servisní workflow a budoucí integrace.

## 1. Multilingual By Design

Všechny moduly musí být připravené na jazykové mutace.

Texty, labely, hlášky, stavy a dokumenty nesmí být pevně navázané pouze na češtinu. Datové modely, API kontrakty, localStorage prototypy i budoucí databázové tabulky mají používat interní klíče / enumy a překladovou vrstvu.

Správně:

```text
status = return_ready
```

Ne:

```text
status = "Připraveno k odeslání"
```

Překladová vrstva podle jazyka organizace nebo uživatele zobrazí správný text v UI, exportu, dokumentu nebo notifikaci.

## 2. Feature Gates / Monetizace

Každá zásadnější funkce musí být navržená tak, aby šla zapnout nebo vypnout podle zákazníka / organizace.

Základní princip:

```text
Má organizationId tuto funkci povolenou?
```

Příklad helperu:

```js
canUseFeature(organizationId, featureKey)
```

Příklady `featureKey`:

- `multiple_service_partners`
- `ai_assistant`
- `advanced_reports`
- `marketplace`
- `cooperation_network`
- `premium_integrations`
- `multilingual_pack`
- `external_service_partners`

Cíl je umožnit postupnou monetizaci Gogrou po modulech a rozšířeních bez přepisování architektury.

## 3. Multi-Provider By Design

Žádná důležitá logika nemá být natvrdo navázaná na jednoho partnera.

Dnes může být výchozí partner například M-technologies. Do budoucna ale mohou existovat další poskytovatelé:

- Walter Service
- Mapal Service
- externí brusírna
- lokální servisní partner
- zákaznická interní brusírna

Architektura má používat obecné identifikátory:

- `servicePartnerId`
- `providerId`
- `integrationProviderId`

Změna partnera nesmí vyžadovat změnu základní business logiky. Mění se přiřazený provider, ne princip procesu.

## 4. Tenant First

Vše musí být vázané na organizaci / zákazníka / tenant.

Používané identifikátory:

- `organizationId`
- `customerId`
- `tenantId`

Systém nesmí předpokládat:

- jednoho zákazníka
- jeden sklad
- jednu brusírnu
- jednu zemi
- jeden jazyk
- jeden typ firmy

Každý modul musí být připravený na multi-tenant provoz.

## 5. Audit First

Důležité akce musí mít auditní stopu.

Auditní záznam má zachytit:

- kdo akci provedl
- kdy akci provedl
- co se změnilo
- z jakého procesu změna vznikla
- jaká metadata byla u akce dostupná

Audit je důležitý zejména pro:

- GSS skladové pohyby
- GPC změny a validace
- STM / servisní workflow
- GINA doporučení
- objednávky
- změny parametrů po broušení
- tisky štítků
- příjmy
- výdeje
- návraty
- rezervace
- změny oprávnění a feature gates

## 6. Physical Item Reality

GPC říká, co je produkt.

GSS / DM říká, jaký je aktuální fyzický kus.

Konkrétní DM kus může mít jiné aktuální rozměry po broušení než master data v GPC. U fyzických kusů mají provozní hodnoty přednost před katalogovými daty.

Příklad:

- GPC katalog říká, že nástroj má průměr 12 mm.
- DM kus po broušení může mít aktuální průměr 11.83 mm.
- Pro výrobu, servis, štítek, výdej a návrat je rozhodující aktuální GSS / DM hodnota.

## 7. Context First

Každá akce hledá nejdřív ve své relevantní procesní množině a až potom aplikuje vyhledávání.

Příklady:

- Výdej hledá jen vydatelné položky.
- Návrat hledá jen položky / DM kusy ve výrobě.
- Servisní terminál hledá jen servisní zásilky daného partnera.
- Příjem z broušení hledá jen položky odeslané na broušení nebo servisně dokončené.

Nikdy se nemá nejdřív hledat v celém skladu a až potom procesně rozhodovat, zda položka do dané akce patří.

## 8. Service Partner Type - Budoucí Rozšíření

`servicePartnerType` je budoucí rozšíření. V MVP se neimplementuje, ale architektura s ním má počítat.

Možné hodnoty:

- `internal`
- `manufacturer`
- `tool_service`
- `local_partner`
- `customer_service`

Příklady:

- M-technologies -> `tool_service`
- Walter Service -> `manufacturer`
- Mapal Service -> `manufacturer`
- lokální brusírna -> `local_partner`
- interní brusírna zákazníka -> `customer_service`

Toto rozlišení pomůže později řídit oprávnění, billing, viditelnost servisních partnerů, servisní workflow a integrace.

## Související Dokumenty

Struktura aplikace, route, moduly a tenant vstupy jsou popsané v:
`docs/GOGROU_APP_STRUCTURE.md`.
