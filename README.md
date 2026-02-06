# Asteroid Watch

Un'applicazione web che traccia gli asteroidi vicini alla Terra utilizzando le API NASA NeoWs (Near Earth Object Web Service).

## Funzionalità

- **Monitoraggio in tempo reale**: carica i dati degli asteroidi per i prossimi 7 giorni
- **Classificazione pericolosità**: distingue visivamente gli asteroidi potenzialmente pericolosi
- **Filtri interattivi**: visualizza tutti, solo pericolosi, ordina per distanza o dimensione
- **Statistiche riassuntive**: totale asteroidi, numero pericolosi, il più grande e il più vicino
- **Design responsive**: funziona su desktop, tablet e mobile

## Tecnologie utilizzate

- HTML5, CSS3, JavaScript (ES6+)
- NASA NeoWs API
- CSS Glassmorphism (backdrop-filter, gradienti, effetti glow)
- Google Fonts (Inter)

## Concetti JavaScript implementati

Questo progetto è stato sviluppato per mettere in pratica concetti avanzati di JavaScript asincrono:

- **Fetch API**: chiamate HTTP con gestione a due fasi (Response → JSON)
- **Promise.race**: implementazione di timeout per le richieste (5 secondi)
- **Promise.allSettled**: caricamento parallelo di 7 giorni con gestione individuale degli errori
- **Pattern retry**: logica di ripetizione automatica (max 2 tentativi) per richieste fallite
- **Async/await**: gestione asincrona moderna con try/catch
- **Gestione errori**: controllo response.ok, messaggi di errore user-friendly

## Struttura del progetto

```
asteroid-watch/
├── index.html          # Struttura HTML
├── style.css           # Stili e tema glassmorphism
├── app.js              # Logica applicativa
├── config.js           # API key (non incluso nel repo)
├── config.example.js   # Template per la configurazione
└── README.md
```

## Installazione

1. Clona il repository
   ```bash
   git clone https://github.com/TUO-USERNAME/asteroid-watch.git
   ```

2. Ottieni una API key gratuita da [NASA API](https://api.nasa.gov/)

3. Crea il file `config.js` copiando da `config.example.js`
   ```javascript
   const apiKey = "LA_TUA_API_KEY";
   ```

4. Apri `index.html` nel browser

## Screenshot

![Asteroid Watch Screenshot](screenshot.png)

## API Reference

L'applicazione utilizza l'endpoint NASA NeoWs:
```
GET https://api.nasa.gov/neo/rest/v1/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&api_key=API_KEY
```

## Licenza

MIT
