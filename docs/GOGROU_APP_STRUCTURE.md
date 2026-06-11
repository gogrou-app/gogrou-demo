# Gogrou App Structure

## Cíl

Tento dokument odděluje obecnou registraci firmy do Gogrou od jednotlivých modulů, zejména od GSS.

Základní rozhodnutí: GSS není vstupní brána do Gogrou. GSS je pouze jeden z aktivovatelných modulů zákaznického portálu.

## Globální Architektonické Principy

Tento dokument popisuje strukturu aplikace, route, moduly a základní tenant model.

Globální architektonické principy Gogrou jsou definované v:
`docs/GOGROU_CORE_ARCHITECTURE_PRINCIPLES.md`.

APP_STRUCTURE tyto principy pouze používá, ale není jejich zdrojem pravdy.

## Cílová Struktura

- `/register`: registrace nové firmy / organizace do Gogrou
- `/app`: zákaznický portál po přihlášení
- `/app/gss`: GSS modul, pouze pokud má firma aktivní GSS
- `/app/toolshop`: obchodní, nabídky a nákupní modul
- `/app/services`: služby, například broušení, povlakování, kalírna nebo poradenství
- `/admin`: interní Gogrou správa
- `/admin/organizations`: interní Gogrou správa firem / organizací

Route `/admin` se zatím neprecizuje. V MVP může existovat dočasný interní prototyp v jiné route, ale finální interní správa bude oddělená od zákaznického portálu.

V MVP používá registrace, budoucí zákaznický portál a interní Gogrou správa jeden společný localStorage klíč:

- `gogrou_organizations`

## Firma / Organizace / Tenant

Firma / organizace je obecný Gogrou tenant. Registruje se do Gogrou mimo GSS.

Firma si při registraci nebo později v administraci vybírá aktivní moduly. Dostupné moduly se po přihlášení zobrazují podle aktivace, trialu nebo zaplaceného předplatného.

Firma může existovat bez GSS.

Firmu může založit zákazník sám přes `/register`, nebo ji může předem založit Gogrou tým pro trial/demo. Gogrou tým může v interní správě firmu ručně aktivovat, pozastavit nebo blokovat. Později bude aktivace navázána na platební bránu a subscription workflow.

Příklady:

- výrobní firma může používat GSS pro sklad, nástroje a DM tracking
- obchodní firma může používat Toolshop / nabídky bez GSS
- výrobce nástrojů může používat datový kanál / obchodní vrstvu bez GSS
- službová firma může používat services profil bez GSS

## GSS Modul

GSS je modul pro firmy, které řeší sklad, nástroje, lokální položky, DM tracking, výdej, návrat, broušení a provozní evidenci.

GSS nesmí být považováno za obecnou registraci firmy do Gogrou. GSS pracuje až s firmou, která už existuje jako Gogrou tenant a má aktivovaný GSS modul.

## Zákaznický Portál

Po přihlášení uživatel vstupuje do obecného Gogrou app portálu na `/app`.

Portál zobrazí pouze moduly dostupné pro jeho firmu:

- aktivované moduly
- trial moduly
- zaplacené moduly

Pokud firma nemá aktivní GSS, neuvidí `/app/gss` jako dostupný modul.

Zákazník po přihlášení uvidí pouze svůj tenant a svoje aktivované moduly. Neuvidí seznam všech firem / organizací.

## Interní Správa Organizací

Interní Gogrou správa organizací patří nad jednotlivé moduly. V MVP ji reprezentuje route `/admin/organizations`.

Gogrou tým zde může:

- vidět všechny organizace
- změnit stav organizace
- změnit billing status
- ručně aktivovat trial/demo organizaci
- pozastavit nebo zablokovat organizaci

GSS zůstává pouze modul. Registrace firmy a správa firmy jsou nad GSS.
