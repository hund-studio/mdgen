---
order: 1
label: Introduzione
---

# Documentazione completa

> Questo strumento vale sia come documentazione del tool **mdgen** che come esempio per avere un anteprima dell'output finale.

## Perché mdgen

Questo strumento nasce siccome troppo spesso scriviamo piccoli tool interni che richiedono una documentazione facilmente consultabile ed eventualmente pubblicabile online.
Fino a poco tempo fa usavamo soluzioni come Docusaurus o altri framework per generare documentazioni pagando però un elevato costo in termini di tempo dedicato a manutenzione e aggiornamento.

Da questa necessità abbiamo pensato a **mdgen**, un generatore di HTML statico a partire da una qualunque cartella contenente file `.md`.
Per renderlo facilmente (e rapidamente) utilizzabile anche da utenti non tecnici abbiamo pensato di sfruttare le FilesystemAPI del browser per generare un tool che, una volta selezionata la cartella contenente i file `.md`, generasse uno zip con dentro i file HTML.

Ovviamente subito dopo aver finito la prima versione ci siamo accorti della necessità di uno strumento CLI da poter usare direttamente, ad esempio, con gli script di NPM.

## Come funziona

L'idea di base è molto semplice (e per questa ragione non è probabilmente lo strumento giusto per complesse documentazioni) e consiste nel renderizzare staticamente, usando React, i file .md dopo averne letto il contenuto. Per questa ragione lo strumento non ha bisogno di una vera e propria struttura da rispettare ma può essere organizzato molto liberamente (un po' come fareste in strumenti come Obsidian).

Per informazioni più precise sull'utilizzo potete visitare:

- [La guida per usare lo strumento web](./web.md)
- [La guida per usare lo strumento CLI](./cli.md)
