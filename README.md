# Traghettamenti

Aprire `traghettamenti.html` con la cartella `assets` accanto, oppure servire il repository con un server statico.

## Orari

Le pagine Turni, Cerca treno e Capoturno mostrano gli orari direttamente nelle schede. I dettagli riportano anche la fonte e le note operative.

- **Partenza Parco Prenestino** e **Partenza Termini** sono due orari distinti. Le sigle P.p. e P.t. del foglio sono state confermate dal committente.
- **Arrivo Termini → Parco Prenestino** identifica i treni da riportare al Parco.
- Le prove mostrano l'orario di presentazione, quando disponibile; le prove notturne non ereditano gli orari delle partenze mattutine.
- La fonte degli orari è il foglio *TRAGHETTAMENTI* fornito il 01/10/2026. Assegnazioni e materiali continuano a seguire i prospetti già presenti nell'applicazione.
- Il 598 e il 546 non compaiono il sabato; 581 e 531 non compaiono la domenica. Il 728 rimane previsto il sabato.
- L'anticipo del 585 alle 16:20 è una possibilità da verificare, non un orario confermato. Festivi e variazioni devono essere verificati dall'operatore.
- Gli orari mancanti sono indicati esplicitamente. La ricerca riconosce anche i numeri alternativi riportati nel foglio: 770, 89530, 734 e 584.

Il 723 parte dal Parco alle 06:40 e da Termini alle 07:26; il 727 alle 10:40 e 11:26. Il 1956 delle 07:24 è indicato solo domenica e lunedì: l’orario del servizio 303 negli altri giorni resta non indicato. Le 06:10 sono la corsetta per raggiungere il 771. Gli orari di 534/581 al mattino e delle prove 774/1959 al pomeriggio non sono riportati nel nuovo foglio e sono quindi lasciati non indicati.

## Capoturno

1. Selezionare data e turno. Per la notte la data è quella di inizio turno; prima delle 06:00 viene proposta la data precedente.
2. Inserire fino a sei traghettatori. Ogni persona può ricevere più servizi.
3. Assegnare un servizio usando il menu nella scheda: sparirà dalla vista **Da assegnare**.
4. Usare **Assegnati**, **Completati** o **Tutti i servizi** per rivedere le assegnazioni, cambiarle o segnare il completamento.
5. Selezionare **Da assegnare** nel menu di una scheda per liberare il servizio. Cancellare un nome libera i suoi servizi; modificare il nome mantiene le assegnazioni della stessa posizione.

“Disponibile” significa previsto per il turno e non ancora assegnato, senza filtro sull'ora attuale. TI e 303 sono assegnati automaticamente secondo lo schema del giorno (1956: 303 martedì–sabato, T1 domenica–lunedì). Gli altri servizi si assegnano ai colleghi. Dopo un’assegnazione, gli altri servizi liberi della stessa squadra T1/T2/T3 propongono il collega con un pulsante di conferma; assegnazioni già presenti non vengono sovrascritte. I vecchi salvataggi a cinque nomi restano compatibili.

I dati sono salvati in `localStorage`, separatamente per data e turno, soltanto nel browser/dispositivo corrente. Non c'è sincronizzazione tra dispositivi o gestione centralizzata degli operatori. Un avviso segnala gli errori di salvataggio. Cambiare il dominio o cancellare i dati del browser impedisce di recuperare i salvataggi precedenti.

## Stampa A4

Quando tutti i servizi previsti per data e turno sono assegnati, il pulsante **Stampa riepilogo A4** si abilita. Il foglio riporta tutti i servizi, indipendentemente dal filtro, raggruppati per traghettatore con TI/303 separati, data, turno e orari distinti. Un trattino indica un orario mancante. Il dialogo del browser permette di stampare o salvare come PDF: scegliere A4 verticale, scala 100%, senza intestazioni e piè di pagina del browser.

## Verifica

Il test della logica `node tests/captain.cjs` richiede soltanto Node.js. Per la verifica completa nel browser, con Node.js, Playwright e Chromium installato tramite `npx playwright install chromium` disponibili, avviare un server statico sulla porta 8765 e poi eseguire:

```sh
node tests/captain.cjs
node tests/operations.cjs
```

`BASE_URL` permette di scegliere un server diverso. `SCREENSHOT_DIR` abilita le catture desktop e mobile. Il test verifica orari, eccezioni, assegnazioni, completamento, persistenza, isolamento tra turni/date, salvataggio non disponibile e layout mobile.
