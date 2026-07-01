# Sito Dott.ssa Pietri — Psicologa

Sito statico (HTML/CSS/JS puro, nessun build step) ospitato su GitHub Pages.
Ottimizzato per smartphone.

## Come aggiornare i contenuti

### Contatti, orari, dati fiscali → `resources/config.json`

Quasi tutte le informazioni "anagrafiche" si cambiano in **un unico file**,
[resources/config.json](resources/config.json), e si propagano automaticamente
a tutte le pagine (header, footer, contatti, privacy):

| Chiave | Cosa controlla |
|---|---|
| `name`, `short_name`, `subtitle`, `degree` | Nome nel header/footer, firma nella bio, titolo professionale |
| `hero_eyebrow` | Riga sopra il titolo della home ("Psicologia Clinica · Modena") |
| `phone`, `phone_href`, `email`, `email_href` | Recapiti cliccabili ovunque |
| `whatsapp_href` | Link "Scrivimi su WhatsApp" nei contatti (formato `https://wa.me/39XXXXXXXXXX`; per toglierlo elimina il blocco commentato in contatti.html) |
| `address_street`, `address_city`, `city` | Indirizzo dello studio |
| `albo_region`, `albo_number`, `piva` | Dati Ordine e fiscali nel footer |
| `maps_src`, `maps_href`, `maps_label` | Mappa nella pagina Contatti (`maps_src` = URL dell'iframe da Google Maps → Condividi → Incorpora una mappa) |
| `hours` | Orari di apertura (aggiungi `"closed": true` per i giorni di chiusura) |
| `page_descriptions` | Meta description per i motori di ricerca, una per pagina |

### Testi descrittivi → direttamente nelle pagine HTML

- [index.html](index.html) — bio ("Chi sono"), sezione "Come lavoro"
- [servizi.html](servizi.html) — card dei servizi (per aggiungerne una, copia un blocco `<div class="service-card">…</div>` e modifica titolo, tag e testo; i filtri funzionano in automatico in base ai tag)
- [contatti.html](contatti.html) — testi introduttivi (gli orari invece stanno nel config)
- [privacy.html](privacy.html) — informativa privacy (testo base **da far verificare** prima della pubblicazione definitiva)

### Header e footer → `_header.html` e `_footer.html`

Sono caricati via JavaScript su tutte le pagine: si modificano una volta sola.

### Foto

- `graphics/profilepic.jpg` — foto profilo (sostituire il file mantenendo il nome;
  tenerla quadrata e intorno ai 480×480 px, non serve di più — viene mostrata a 200 px
  e usata anche come anteprima nelle condivisioni social/WhatsApp)
- `graphics/favicon.png` — favicon

### Dominio

Il sito è pensato per GitHub Pages. Se in futuro si passa a un dominio
personalizzato, aggiornare gli URL in `sitemap.xml` e `robots.txt`.

## Attenzione: titoli professionali

I testi usano deliberatamente **"psicologa"**, "sostegno psicologico" e
"consulenza" — mai "psicoterapeuta", "psicoterapia" o "terapia". In Italia
questi ultimi termini sono riservati a chi ha completato la scuola
quadriennale di specializzazione in psicoterapia (L. 56/89): usarli senza
titolo espone a sanzioni dell'Ordine. Se in futuro la dott.ssa conseguirà la
specializzazione, basterà aggiornare `subtitle` nel config e i testi di
`index.html` e `servizi.html`.

## Struttura tecnica

- `js/config.js` — carica config + header/footer e li inietta in ogni pagina; genera anche meta description, favicon, orari e dati strutturati (schema.org `Psychologist`)
- `js/main.js` — filtri della pagina Servizi
- `js/moodmeter.js`, `anxiety.js`, `bodymap.js`, `checkin.js` — strumenti di check-in (Mood Meter, termometro dell'ansia, mappa corporea, testo riassuntivo)
- `js/breath.js` — respirazione guidata
- `js/plutchik.js` — ruota delle emozioni
- `resources/*.json` — dati degli strumenti (testi del Mood Meter e del termometro)
- `.nojekyll` — necessario perché GitHub Pages serva i file `_header.html`/`_footer.html`

## Sviluppo locale

Il sito usa `fetch()` per config e partials, quindi va servito via HTTP
(non aperto come file):

```
python -m http.server 8000
# poi apri http://localhost:8000
```
