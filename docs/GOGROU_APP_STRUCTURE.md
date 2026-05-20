# Gogrou App Structure

## Cíl

Tento dokument odděluje obecnou registraci firmy do Gogrou od jednotlivých modulů, zejména od GSS.

Základní rozhodnutí: GSS není vstupní brána do Gogrou. GSS je pouze jeden z aktivovatelných modulů zákaznického portálu.

## Cílová Struktura

- `/register`: registrace nové firmy / organizace do Gogrou
- `/app`: zákaznický portál po přihlášení
- `/app/gss`: GSS modul, pouze pokud má firma aktivní GSS
- `/app/toolshop`: obchodní, nabídky a nákupní modul
- `/app/services`: služby, například broušení, povlakování, kalírna nebo poradenství
- `/admin`: interní Gogrou správa

Route `/admin` se zatím neprecizuje. V MVP může existovat dočasný interní prototyp v jiné route, ale finální interní správa bude oddělená od zákaznického portálu.

## Firma / Organizace / Tenant

Firma / organizace je obecný Gogrou tenant. Registruje se do Gogrou mimo GSS.

Firma si při registraci nebo později v administraci vybírá aktivní moduly. Dostupné moduly se po přihlášení zobrazují podle aktivace, trialu nebo zaplaceného předplatného.

Firma může existovat bez GSS.

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

