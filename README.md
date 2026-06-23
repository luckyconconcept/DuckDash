# 🦆 Duck & Dash

Ein schnelles 2D-Browser-Minispiel: Eine Gummiente flitzt durch ein überflutetes
Badezimmer, weicht Hindernissen aus, sammelt Perlen und nutzt Power-ups. Gebaut
mit **Phaser 3** als reine statische Web-App – kein Build-Schritt, kein Backend.

„Spring. Tauch. Sammle Perlen."

---

## Spielidee & Steuerung

Die Ente läuft automatisch nach vorn. Du reagierst auf die **Signale**, die kurz
vor jedem Hindernis erscheinen:

| Signal | Aktion | Steuerung |
|--------|--------|-----------|
| **SPRINGEN** | über das Hindernis | Leertaste / ↑ / Tippen |
| **TAUCHEN** | unter dem Hindernis durch | ↓ gedrückt halten (länger = tiefer) / Swipe nach unten |
| **DRAUF** | von oben auf den Gegner fallen | rechtzeitig springen und drauffallen |
| **OBEN BLEIBEN** | **nicht** tauchen, sonst Treffer! | nichts tun / oben bleiben |
| seitlich ausweichen | Bonus-Punkte beim Sammeln | ← / → / Swipe seitlich |

**Power-ups:** Schild (fängt einen Treffer ab), Magnet (zieht Perlen an), Turbo
(kurz unverwundbar, bricht durch alles), Quak-Bombe (räumt nahe Hindernisse weg).

**Sammeln:** Perlen (je nach Farbe mehr Punkte), Muschel, Seestern. Wer ohne
Treffer sammelt, steigert seinen **Perlen-Multiplikator** (bis ×2.5).

**Ziele (Missionen):** Rotierende Mini-Ziele oben am Bildschirm geben Bonuspunkte.

**Leben:** 3 Herzen. Bei 0 Herzen ist der **nächste** Treffer das Aus – letzte Chance.

Auf der Startseite erklärt ein **„?"-Button** alle Icons und Regeln im Detail.

---

## Lokal starten

Es ist eine statische Seite – einfach einen kleinen Webserver im Projektordner
starten (Doppelklick auf `index.html` reicht wegen Browser-Sicherheitsregeln
für Assets oft nicht):

```bash
cd "building-challenge-starter"
python3 -m http.server 8000
```

Dann im Browser **http://localhost:8000** öffnen (Fenster quer/breit ziehen).
Alternativ `npx serve` o. ä.

---

## Hosten / Deployen

Das Spiel besteht nur aus statischen Dateien und läuft auf **jedem** Webspace
(All-Inkl, GitHub Pages, Netlify, Vercel …). Lade den **Inhalt** dieses Ordners
ins Web-Root:

```
index.html
game.js
style.css
assets/
```

Aufrufbar ist das Spiel dann unter `…/index.html` bzw. der Domain-Root.

**Hinweise (z. B. für All-Inkl / klassisches Webhosting):**
- **Statisch genügt** – kein Node/PHP nötig. Einfach per FTP/SFTP hochladen.
- **HTTPS aktivieren** (Let's Encrypt) – sauberer und vermeidet Mixed-Content.
- **Dateipfade sind case-sensitiv** auf Linux-Servern. Lokal (macOS/Windows) ist
  Groß-/Kleinschreibung egal, auf dem Server nicht – alle Asset-Namen sind
  durchgängig klein geschrieben, also passt es; bei eigenen Ergänzungen darauf achten.
- **Phaser kommt per CDN** (`cdn.jsdelivr.net`). Für volle Eigenständigkeit kann
  man `phaser.min.js` herunterladen, ins Projekt legen und in `index.html`
  lokal einbinden (fällt der CDN aus, zeigt das Spiel sonst eine Fehlermeldung).
- **Relative Pfade**: Assets werden relativ geladen, das Spiel funktioniert daher
  auch in einem Unterordner.

---

## Highscore

Die Bestenliste wird aktuell **lokal im Browser** gespeichert (`localStorage`),
also pro Gerät/Browser. Eine globale Online-Highscore ist bewusst (noch) nicht
eingebaut.

---

## Technik

- **Phaser 3.80** (über CDN), Vanilla JavaScript, kein Bundler/Build.
- Audio rein prozedural (Web Audio), keine Sound-Dateien.
- Eine Datei `game.js` enthält alle Scenes (Boot, Menü, Highscore, Spiel).

### Projektstruktur

```
index.html      – Einstieg, lädt Phaser (CDN) + game.js
style.css       – Seiten-Layout, Rotate-Gate (Querformat-Hinweis)
game.js         – komplette Spiellogik & UI
assets/         – Grafiken (PNG/JPG)
tools/
  gameplay-balance-check.mjs  – Dev-Test für Balance-Invarianten
```

### Entwicklung

Balance-/Sequenz-Invarianten prüfen (kein Spiel nötig):

```bash
node tools/gameplay-balance-check.mjs
node --check game.js
```

---

## Hinweis

Die animierte Wasseroberfläche und die Flughöhe der Ente sind als visuelle
Baseline festgelegt (siehe `CLAUDE.md`) und sollten nur auf ausdrücklichen Wunsch
verändert werden.
