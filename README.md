# 🏆 SKAILE Academy Building Challenge

Willkommen zur Building Challenge. Hier startest du deinen Build. Eine Aufgabe, echtes Preisgeld, fairer Start für alle.

## So läuft die Challenge

- **Start:** Samstag, 12:00 Uhr. Dann droppe ich das konkrete Thema in der Community. Vorher kennt es keiner.
- **Ende:** Dienstag, 18:00 Uhr. Bis dahin muss dein Build abgegeben sein.
- **Solo:** Du baust allein.
- **Preisgeld:** 🥇 250 € · 🥈 150 € · 🥉 100 €

## So machst du mit (Schritt für Schritt)

1. **Warte auf das Thema.** Erst wenn ich Samstag um 12:00 das Thema gepostet habe, geht es los. Vorher anfangen ist nicht erlaubt.
2. **Erstelle dein eigenes Repo.** Klick oben auf **"Use this template" → "Create a new repository"** und lass es **öffentlich (public)**. Damit bekommst du deine eigene, frische Kopie.
3. **Hol dir die Kopie auf deinen Rechner.** Auf deinem neuen Repo den grünen **Code**-Button klicken, die HTTPS-URL kopieren, dann im Terminal:
   ```bash
   git clone <deine-repo-url>
   cd <dein-repo-name>
   ```
4. **Starte Claude Code** in diesem Ordner und gib ihm einmal den Setup-Prompt (siehe unten). Damit pusht Claude deinen Fortschritt ab jetzt automatisch in dein Repo.
5. **Bau dein Minigame.**
6. **Mach dein Game spielbar.** Deploy es kostenlos über GitHub Pages, Netlify oder Vercel, damit man es direkt im Browser spielen kann.
7. **Gib ab.** Poste bis Dienstag 18:00 im Abgabe-Thread in der Community zwei Links: den Link zu deinem Repo und den Link zum spielbaren Game.

## Verbinde deinen Claude Code (Setup-Prompt)

Gib diesen Prompt einmal in deine Claude Code Session in deinem Projektordner. Danach pusht Claude deinen Fortschritt automatisch in dein eigenes Repo, auch in jeder neuen Session:

```text
Ich nehme an einer Coding-Challenge teil und baue hier ein Minigame. Bevor du loslegst, richte einmal die GitHub-Anbindung ein und halte dich ab dann strikt daran:

1. Push-Ziel prüfen. Schau mit `git remote -v`, wohin "origin" zeigt. Es MUSS mein eigenes Repo sein, also meine eigene Kopie mit MEINEM GitHub-Namen in der URL. Falls origin fehlt oder noch auf das Original-Template "sebaskauf/building-challenge-starter" zeigt, frag mich nach der URL meines eigenen Repos und setz sie als origin. Pushe niemals woanders hin.

2. Verbindung testen. Mach jetzt einen kleinen Test-Commit ("chore: setup push") und pushe ihn zu origin. Sag mir, ob er durchgegangen ist. Wird der Push abgelehnt, zeigt origin aufs falsche Repo, dann zurück zu Schritt 1.

3. Leg eine CLAUDE.md an mit diesen Regeln, damit jede zukünftige Session sie automatisch befolgt:
   - Nach jedem abgeschlossenen Arbeitsschritt sofort committen und zu origin pushen (git add -A, kurze klare Message, git push). Sehr regelmäßig, immer dann wenn wieder ein Stück fertig ist. Kein Timer, sondern an den Fortschritt gekoppelt.
   - Immer nur zu origin (meinem eigenen Repo) pushen, das Ziel nie ändern.
   - Zu Beginn jeder neuen Session zuerst git log und git status anschauen, kurz orientieren, dann nahtlos weiterbauen, weiterhin mit Push nach jedem Schritt.

Ziel: mein kompletter Fortschritt landet fortlaufend und nachvollziehbar in meinem eigenen Repo.
```

## Fairness und Regeln

Damit alle die gleiche Chance haben:

- **Erst nach dem Themen-Drop starten** (Samstag 12:00). Dein Repo darf nicht vorher entstehen.
- **Solo bauen.**
- **Progressiv pushen.** Lokal bauen und am Ende alles in einem Schwung hochladen ist nicht erlaubt. Wir schauen uns den Push-Verlauf an, nicht das Commit-Datum.
- **Öffentliches Repo**, damit alles nachvollziehbar bleibt.
- Dein Game muss zum **Samstags-Thema** passen. Ein vorgebautes Game einzureichen funktioniert also ohnehin nicht.

## Bewertung

Bewertet wird von mir und 5 weiteren Judges nach drei Dingen:

1. **Funktioniert es?**
2. **Wie kreativ ist dein Ansatz?**
3. **Wie sauber ist die Umsetzung?**

Die **Top 3** stellen ihren Build danach kurz vor (ein kleiner Walkthrough, wo du dein Game zeigst und erklärst) und bekommen das Preisgeld.

## Das Starter-Gerüst

In diesem Repo liegt ein minimales Web-Gerüst (`index.html`, `style.css`, `game.js`), mit dem du direkt loslegen kannst. Du musst es nicht nutzen. Wenn du dein Game mit einer anderen Engine baust (z.B. Godot, Python), ist das völlig okay, dann ersetz die Dateien einfach durch dein Projekt.

Viel Erfolg und viel Spaß. Lass uns was bauen 🚀
