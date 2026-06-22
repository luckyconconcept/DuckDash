# Duck & Dash Review und Asset-Prompts

Stand: 2026-06-22

## Kurzfazit

Duck & Dash hat bereits die richtigen Bausteine: starke Hauptfigur, stimmige Badezimmerwelt, animiertes Wasser, Highscore, Power-ups, drei Sammel-Ebenen und verschiedene Hindernis-Modi. Trotzdem wirkt das Spiel noch nicht fertig, weil UI, Gameplay-Regeln und Asset-Lesbarkeit noch nicht als ein System funktionieren.

Meine Position: Vor neuen grossen Features sollten zuerst Lesbarkeit, Layout-System und Gameplay-Telegraphing stabilisiert werden. Konfidenz: hoch, weil die aktuellen Probleme wiederholt aus unklaren Screens, uneinheitlichen Hitboxen und nicht eindeutig erkennbaren Hindernis-Regeln entstanden sind.

## Gepruefte Flaechen

- Startscreen, Highscore, Pause, Game Over aus `game.js`
- HUD, Button-Helper, Screen-Panel-Helper
- Jump, Dive, Resurface, Left/Right-Drift
- Obstacle-Spawns, Collectible-Spawns, Power-up-Spawns
- Wasseranimation und Partikeleffekte
- LocalStorage-Highscore
- Asset-Bestand in `assets/`

Einschraenkung: Der In-App-Browser-Canvas-Screenshot ist in dieser Umgebung wiederholt in Timeouts gelaufen. Die Bewertung basiert deshalb auf Codepruefung, vorhandenen User-Screenshots, Assetbestand und Browser-Loadchecks ohne Konsolenfehler.

## Prioritaeten

### P0: UI-System bereinigen

Problem:
Screens wurden iterativ angepasst. Dadurch gibt es keine zentrale Layout-Sprache. `makeGlassPanel`, `makeButton`, DOM-Name-Input und einzelne Screen-Koordinaten arbeiten nebeneinander. Das erzeugt immer wieder Versatz, Ueberlappung und unterschiedliche Button-Breiten.

Empfehlung:

1. Einen Screen-Layout-Tokenblock einfuehren:
   - Panel-Groessen
   - Spaltenachsen
   - Button-Groessen
   - Fontgroessen
   - Standard-Abstaende
2. Screens nur noch aus diesen Tokens bauen.
3. Buttons nicht mehr per Textlaenge erraten, sondern aus Varianten:
   - `primaryLarge`
   - `secondaryLarge`
   - `dangerLarge`
   - `compact`
4. DOM-Input fuer Namen optisch noch besser in Canvas integrieren oder komplett durch Canvas-Buchstabenwahl ersetzen.

### P0: Gameplay-Regeln klarer machen

Problem:
Es gibt mehrere Modi (`jump`, `dive`, `stomp`, `underwater`), aber die Hindernisse sind nicht immer selbsterklaerend. Beispiel: Ein Strudel als `stomp`-Objekt ist visuell widerspruechlich, weil ein Strudel nach Gefahr aussieht, nicht nach "draufspringen".

Empfehlung:

1. Jeder Modus braucht eine eindeutige visuelle Sprache:
   - Jump: flache, breite Oberflaeche, gelbe Markierung
   - Dive: hohes Objekt mit sichtbarem Freiraum darunter, cyan Markierung
   - Stomp: federndes, weiches Objekt mit klarer Top-Flache
   - Stay-up: Unterwasser-Gefahr mit roter/pinker Markierung
2. Text-Prompts (`TAUCH!`, `DRAUF!`) nur als Hilfe nutzen, nicht als Hauptkommunikation.
3. Vor jedem Hindernis 0.5 bis 0.8 Sekunden vorher ein kleines Modus-Signal zeigen.

### P0: Dive-Mechanik weiter schaerfen

Aktuell:
Tauchen ist technisch stabiler, aber es muss im Spielgefuehl noch deutlicher werden.

Verbesserung:

1. Beim Tauchen die Ente staerker abdunkeln und eine klare Unterwasser-Silhouette geben.
2. Dive-Lane optisch markieren, z.B. mit kleinen Tiefenblasen und einer leichten cyan Spur.
3. Unterwasser-Perlen wirklich als Risiko-Route bauen:
   - 2 bis 4 Perlen nur erreichbar beim Dive
   - danach sofort ein Stay-up-Hindernis, damit der Spieler rechtzeitig auftauchen muss
4. Dive nicht nur als "unter Objekt durch", sondern als eigenes Rhythmus-Element einsetzen.

### P1: Spawn-System planbarer machen

Aktuell:
Das Pattern-System ist besser als reine Zufallsspawns, aber es ist noch nicht stark genug als Level-Design.

Empfehlung:

1. Feste Micro-Sequenzen definieren:
   - `jump_intro`
   - `dive_intro`
   - `jump_collect_arc`
   - `dive_pearl_tunnel`
   - `stomp_reward`
   - `fakeout_stay_up`
2. Jede Sequenz enthaelt Hindernis plus passende Perlenlinie.
3. Schwierigkeit ueber Sequenzmischung steigern, nicht nur ueber Geschwindigkeit.
4. Erste 20 Sekunden als Tutorial ohne harte Kombos.

### P1: Rechts/Links sinnvoller nutzen

Aktuell:
Links/rechts gibt Drift-Bonus, aber die Welt zwingt die Bewegung kaum.

Vorschlaege:

1. Horizontale Perlenlinien:
   - links oben
   - mittig Wasserlinie
   - rechts unten
2. Hindernisse mit seitlichem Freiraum:
   - breite Seife, links leichter
   - Bubble-Gate, rechts leichter
3. Bonus fuer perfekte Linie sichtbar machen:
   - kleine `SAUBERE LINIE`-Leiste
   - kurzer Score-Multiplier
4. Duck nicht sofort stark zur Mitte zurueckziehen. Besser: Position halten, bis Spieler gegensteuert oder sanfter Drift.

### P1: Screens optisch konsolidieren

Startscreen:
- Logo und Ente funktionieren, aber Score/Button-Layout braucht eine klare vertikale Hierarchie.
- Buttons sollten als klare Hauptaktionen unterhalb des Score-Blocks sitzen, nicht als lose Elemente.

Pause:
- Funktional solide.
- Sollte als kleineres Overlay wirken als Game Over.

Game Over:
- Besser als vorher, aber weiterhin zu stark aus Einzelobjekten komponiert.
- Rechts-Spalte sollte final als Kartenkomponente gebaut werden.
- Ente darf gross sein, aber braucht mehr visuelles Gewicht links, z.B. eigener Splash-Pod.

Highscore:
- Inhaltlich gut.
- Visuell fehlt noch die "Bestenliste als Belohnung". Rang 1 sollte staerker sein, aber die restlichen Eintraege duerfen ruhiger werden.

### P1: Performance und Stabilitaet

Risiken im aktuellen Code:

1. Viele Tweens und temporaere Images werden permanent erzeugt.
2. `children.each` und Gruppenloops laufen jeden Frame ueber viele Objekte.
3. Wasseranimation erzeugt viele permanente Graphics/Shapes. Sie sieht gut aus, sollte aber einen Low-FX-Modus bekommen.
4. `game.js` hat ueber 3000 Zeilen. Das macht Regressionen wahrscheinlicher.

Empfehlung:

1. Objekt-Pooling fuer:
   - Perlen
   - Floating Text
   - Splash-Partikel
   - kleine Bubble-Deko
2. `activeEffects`-Listen statt globalem `children.each` fuer Cleanup.
3. Low-FX-Schalter:
   - weniger Foam-Flecks
   - weniger Glints
   - keine extra Drift-Bubbles auf schwachen Devices
4. Split in Module:
   - `scenes/MenuScene.js`
   - `scenes/GameScene.js`
   - `scenes/HighscoreScene.js`
   - `systems/ObstacleSystem.js`
   - `systems/CollectibleSystem.js`
   - `systems/WaterEffects.js`
   - `ui/components.js`
   - `data/gameConfig.js`

### P2: Audio verbessern

Aktuell:
Procedural Tones sind okay fuer MVP, aber nicht charmant genug.

Empfehlung:

1. Kurzer echter Quak-Sound.
2. Collect-Sound als Bubble-Pop.
3. Hit-Sound als dumpfer Splash.
4. Loopbare, leise Badezimmer-Musik optional und abschaltbar.

### P2: Mehr Spieltiefe

Sinnvolle Features:

1. Missionen:
   - Sammle 20 Perlen in einer Runde
   - Tauche 5-mal perfekt
   - Springe auf 3 Hindernisse
2. Daily Challenge:
   - gleicher Seed fuer alle
   - Tageshighscore lokal
3. Kleine Skin-Auswahl:
   - Standard
   - Sonnenbrille
   - Schwimmring
4. Post-Game-Stats:
   - Perlen
   - perfekte Moves
   - laengste Combo
   - genutzte Power-ups

## Konkrete naechste Umsetzungsschritte

1. Gameplay-Sequenzen bauen, damit Hindernisse und Perlen nicht beliebig wirken.
2. Modus-Signale einbauen: Jump, Dive, Stomp, Stay-up.
3. Dive-Lane und Unterwasser-Perlen visuell verbessern.
4. Button-/Panel-System zentralisieren.
5. Game-over und Highscore mit festen Komponenten neu aufbauen.
6. Performance-Pass mit Objekt-Pooling und Low-FX-Modus.
7. Erst danach neue Hindernisse und Power-ups erweitern.

## Asset-Prompts

Alle folgenden Prompts sind vollstaendig. Wichtig: immer weisser Hintergrund, damit die Assets leicht freigestellt werden koennen. Export danach als PNG mit Alpha.

### 1. Jump-Signal Icon

```text
Create a polished 2D mobile game UI icon for the action "jump over" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck silhouette jumping upward over a low soap bar, with a curved upward arrow and a few water droplets. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, bright yellow duck, cyan water accents, small white highlight details. Place the icon centered on a pure white background for easy cutout, no text, no shadows touching the image edges, no cropped parts, 1024x1024 PNG.
```

### 2. Dive-Signal Icon

```text
Create a polished 2D mobile game UI icon for the action "dive under" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck silhouette dipping below a blue waterline under a tall toothbrush cup obstacle, with a curved downward arrow and bubbles. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, cyan underwater glow, white bubbles, playful and not realistic. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

### 3. Stomp-Signal Icon

```text
Create a polished 2D mobile game UI icon for the action "stomp" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck landing on a soft sponge platform, with a downward impact arrow, small splash droplets, and a squashy bounce effect. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, readable at 48px size, yellow duck, warm sponge color, cyan splash accents. The icon must communicate "land on top" and not danger. Place it centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

### 4. Stay-Up Signal Icon

```text
Create a polished 2D mobile game UI icon for the action "stay above water" in a cheerful rubber duck bathroom runner game. The icon should show a yellow rubber duck floating safely above the waterline while a red drain plug hazard sits underwater below it, with a small upward arrow and warning bubbles. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, readable at 48px size, cyan waterline, pink-red underwater hazard, playful but clearly cautionary. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching image edges, 1024x1024 PNG.
```

### 5. Dive-Lane Bubble Trail

```text
Create a polished 2D mobile game asset for an underwater lane guide in a cheerful rubber duck bathroom runner game. The asset should be a horizontal trail of small glowing cyan bubbles and tiny sparkles, arranged from left to right like a path the player can follow while diving. Friendly high-quality cartoon style, soft glow, transparent-looking bubbles, strong readability against blue water, no hard rectangular border. Place the full trail centered on a pure white background for easy cutout, no text, no cropped bubbles, no shadow touching the image edges, wide composition, 2048x512 PNG.
```

### 6. Surface Jump Arc Trail

```text
Create a polished 2D mobile game asset for a jump arc guide in a cheerful rubber duck bathroom runner game. The asset should be a dotted curved arc made from small white foam bubbles and tiny yellow sparkle points, showing a clear upward jump path over a low obstacle. Friendly high-quality cartoon style, soft foam, readable against blue water and bathroom background, no text, no character, no obstacle. Place the full arc centered on a pure white background for easy cutout, no cropped dots, no shadow touching image edges, 2048x1024 PNG.
```

### 7. Stompable Sponge Platform

```text
Create a polished 2D mobile game obstacle asset: a soft yellow bath sponge floating on bath water, designed as a clearly stompable platform for a rubber duck runner game. The top surface must be flat, wide, and inviting to land on, with rounded corners, small foam bubbles, soft squashy shape, glossy cartoon highlights, and a strong dark-blue outline. It should look safe and bouncy, not dangerous. Use bright yellow sponge texture with small holes and cyan water ripples at the base. Place it centered on a pure white background for easy cutout, no text, no cropped edges, no shadow touching image edges, 1024x1024 PNG.
```

### 8. Tall Toothbrush Cup Dive Gate

```text
Create a polished 2D mobile game obstacle asset: a tall turquoise toothbrush cup floating on bath water with two colorful toothbrushes sticking upward, designed as a "dive under" obstacle for a rubber duck runner game. The object must read as tall and blocking above the water, with a clear open space underneath implied by water ripples at the base. Friendly high-quality cartoon style, glossy plastic, strong dark-blue outline, bright turquoise cup, pink and white toothbrush head, small bubbles and splash at water contact. It should not look stompable. Place it centered on a pure white background for easy cutout, no text, no cropped edges, no shadow touching image edges, 1024x1024 PNG.
```

### 9. Underwater Drain Hazard

```text
Create a polished 2D mobile game underwater hazard asset: a red rubber drain plug with a short silver chain drifting underwater in a cheerful bathroom runner game. It should look clearly hazardous for diving, with a pink-red warning color, small bubbles, slight underwater glow, rounded cartoon shape, and strong dark-blue outline. Friendly mobile game art, not scary, not realistic, readable at 80px size. Place it centered on a pure white background for easy cutout, no text, no cropped chain, no shadow touching image edges, 1024x1024 PNG.
```

### 10. Bubble Gate Dive Window

```text
Create a polished 2D mobile game obstacle asset: a vertical gate made of foamy bath bubbles with a clear open tunnel through the lower middle, designed for a rubber duck to dive through. Friendly high-quality cartoon style, glossy translucent bubbles, cyan and white highlights, strong readable silhouette, playful bathroom theme. The open tunnel must be obvious and large enough to communicate "go through here". Place it centered on a pure white background for easy cutout, no text, no cropped bubbles, no shadow touching image edges, 1024x1024 PNG.
```

### 11. Floating Towel Barrier

```text
Create a polished 2D mobile game obstacle asset: a rolled pink bath towel floating sideways on bath water, acting as a wide surface barrier in a rubber duck runner game. Friendly high-quality cartoon style, soft fabric texture, glossy water ripples, strong dark-blue outline, clear readable silhouette, not too detailed, mobile game readability at 100px height. It should look like a low obstacle to jump over, not a platform. Place it centered on a pure white background for easy cutout, no text, no cropped edges, no shadow touching image edges, 1024x1024 PNG.
```

### 12. Rubber Duck Ring Bounce Platform

```text
Create a polished 2D mobile game obstacle asset: a small inflatable swim ring shaped like a rubber duck, floating on bath water, designed as a bouncy stomp platform. Bright yellow duck head with orange beak attached to a cyan-blue inflatable ring, glossy rubber material, strong dark-blue outline, clear flat-ish top reading as safe to land on, water ripples and small bubbles at the base. Friendly cartoon mobile game style, high-quality, readable at 100px. Place it centered on a pure white background for easy cutout, no text, no cropped edges, no shadow touching image edges, 1024x1024 PNG.
```

### 13. Unified Primary Button Blank

```text
Create a polished 2D mobile game UI button asset with no text, for a cheerful rubber duck bathroom game. Shape: wide rounded rectangle, golden yellow primary action color, glossy highlight strip at the top, subtle cyan rim light, thick white outer border, dark-blue thin outline, soft inner depth, playful but clean. The button must be blank so text can be added in-game. Keep the center area smooth and readable for white text. Place it centered on a pure white background for easy cutout, no text, no icons, no cropped corners, no shadow touching image edges, 1600x480 PNG.
```

### 14. Unified Secondary Button Blank

```text
Create a polished 2D mobile game UI button asset with no text, for a cheerful rubber duck bathroom game. Shape: wide rounded rectangle, bright medium blue secondary action color, glossy highlight strip at the top, subtle cyan glow, thick white outer border, dark-blue thin outline, soft inner depth, playful but clean. The button must be blank so text can be added in-game. Keep the center area smooth and readable for white text. Place it centered on a pure white background for easy cutout, no text, no icons, no cropped corners, no shadow touching image edges, 1600x480 PNG.
```

### 15. Unified Danger Button Blank

```text
Create a polished 2D mobile game UI button asset with no text, for a cheerful rubber duck bathroom game. Shape: wide rounded rectangle, vivid pink danger/menu action color, glossy highlight strip at the top, subtle cyan rim light, thick white outer border, dark-blue thin outline, soft inner depth, playful but clean. The button must be blank so text can be added in-game. Keep the center area smooth and readable for white text. Place it centered on a pure white background for easy cutout, no text, no icons, no cropped corners, no shadow touching image edges, 1600x480 PNG.
```

### 16. Game Over Splash Pod

```text
Create a polished 2D mobile game illustration asset for a game-over screen: a dizzy yellow rubber duck sitting in a round splash puddle, with small stars circling its head, worried funny expression, glossy cartoon style, bright yellow body, orange beak, cyan water splash base, strong dark-blue outline. The asset should work as the left-side character illustration in a blue game-over panel. Friendly, humorous, high-quality mobile game art, not scary. Place it centered on a pure white background for easy cutout, no text, no cropped water splash, no shadow touching image edges, 1400x1400 PNG.
```

### 17. Highscore Winner Badge

```text
Create a polished 2D mobile game UI badge for a highscore winner in a cheerful rubber duck bathroom game. The badge should combine a golden trophy, small rubber duck head, blue splash accents, and a circular medal frame. Glossy cartoon mobile game style, strong dark-blue outline, premium but playful, readable at 96px size. The center should feel like first place / champion. Place it centered on a pure white background for easy cutout, no text, no cropped edges, no shadow touching image edges, 1024x1024 PNG.
```

### 18. Quack Bomb Shockwave Effect

```text
Create a polished 2D mobile game effect asset: a circular cyan-blue shockwave burst with duck-themed water droplets, for a rubber duck bathroom runner game. The effect should look like a playful "quack bomb" clearing nearby obstacles, with a transparent-feeling ring, splash spikes, small yellow spark accents, glossy cartoon style, strong readability against blue water. Place it centered on a pure white background for easy cutout, no text, no character, no cropped ring, no shadow touching image edges, 2048x2048 PNG.
```

### 19. Magnet Pull Trail

```text
Create a polished 2D mobile game effect asset: curved pink and yellow magnetic pull trails for collectibles moving toward a rubber duck, with small sparkles and bubble dots. Friendly glossy cartoon style, high readability against blue bathroom water, no hard border, no text, no character. The asset should be a wide transparent-effect style trail that can sit behind pearls. Place it centered on a pure white background for easy cutout, no cropped trails, no shadow touching image edges, 2048x1024 PNG.
```

### 20. Low-FX Water Sparkle Sheet

```text
Create a polished 2D mobile game effect sprite sheet for subtle water sparkles in a cheerful flooded bathroom scene. Include 8 small sparkle shapes in one image: tiny cyan glints, white foam flecks, small bubble highlights, each separated with enough space for slicing. Friendly cartoon style, soft glow, readable but not too bright. Place all sparkles on a pure white background for easy cutout, no text, no cropped shapes, no shadow touching image edges, 2048x512 PNG.
```
