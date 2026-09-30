# Traghettamenti

Aprire `traghettamenti.html` con la cartella `assets` accanto, oppure servire il repository con un server statico.

## Orari

Le pagine Turni, Cerca treno e Capoturno mostrano gli orari direttamente nelle schede. I dettagli riportano anche la fonte e le note operative.

- **Partenza Parco Prenestino** e **Partenza Termini** sono due orari distinti. Le sigle P.p. e P.t. del PDF sono state confermate dal committente.
- **Arrivo Termini → Parco Prenestino** identifica i treni da riportare al Parco.
- Le prove mostrano l'orario di presentazione, quando disponibile; le prove notturne non ereditano gli orari delle partenze mattutine.
- La fonte degli orari è *Traghettamenti Settembre.pdf*. Assegnazioni e materiali continuano a seguire i prospetti già presenti nell'applicazione.
- Il 598 e il 546 non compaiono il sabato; 581 e 531 non compaiono la domenica. Il 728 rimane previsto il sabato.
- L'anticipo del 585 alle 16:20 è una possibilità da verificare, non un orario confermato. Festivi e variazioni devono essere verificati dall'operatore.
- Gli orari mancanti sono indicati esplicitamente. La ricerca riconosce anche i numeri alternativi riportati nel PDF: 770, 542, 89530, 734 e 584.

## Capoturno

1. Selezionare data e turno. Per la notte la data è quella di inizio turno; prima delle 06:00 viene proposta la data precedente.
2. Inserire fino a cinque traghettatori. Ogni persona può ricevere più servizi.
3. Assegnare un servizio usando il menu nella scheda: sparirà dalla vista **Da assegnare**.
4. Usare **Assegnati**, **Completati** o **Tutti i servizi** per rivedere le assegnazioni, cambiarle o segnare il completamento.
5. Selezionare **Da assegnare** nel menu di una scheda per liberare il servizio. Cancellare un nome libera i suoi servizi; modificare il nome mantiene le assegnazioni della stessa posizione.

“Disponibile” significa previsto per il turno e non ancora assegnato, senza filtro sull'ora attuale. La responsabilità 303 o degli altri abilitati, quando prevista, resta indicata.

I dati sono salvati in `localStorage`, separatamente per data e turno, soltanto nel browser/dispositivo corrente. Non c'è sincronizzazione tra dispositivi o gestione centralizzata degli operatori. Un avviso segnala gli errori di salvataggio. Cambiare il dominio o cancellare i dati del browser impedisce di recuperare i salvataggi precedenti.

## Verifica

Con Node.js, Playwright e Google Chrome disponibili, avviare un server statico sulla porta 8765 e poi eseguire:

```sh
node tests/operations.cjs
```

`BASE_URL` permette di scegliere un server diverso. `SCREENSHOT_DIR` abilita le catture desktop e mobile. Il test verifica orari, eccezioni, assegnazioni, completamento, persistenza, isolamento tra turni/date, salvataggio non disponibile e layout mobile.
