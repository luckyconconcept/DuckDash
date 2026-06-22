# Duck & Dash Grafik-Produktionsplan

Stand: 2026-06-22

## Ziel

Neue Grafiken nur dort produzieren, wo sie das Spiel wirklich klarer machen. Hintergrund, Ente und Wasseranimation bleiben unveraendert. UI-Panels und Buttons werden aktuell im Code sauberer gezeichnet und sollen nicht nochmal als grosse Asset-Serie neu erstellt werden.

Meine Position: Erst die vier Regel-Signale erstellen, dann testen. Danach entscheiden wir, ob Hindernisse ersetzt werden muessen. Konfidenz: hoch, weil die vorhandenen Screens zeigen, dass die groesste Schwachstelle nicht Asset-Menge, sondern Lesbarkeit der Spielregeln ist.

## Batch 1: wirklich produzieren

Diese vier Assets liegen jetzt als Rohgrafiken aus `/input/newnew` in `assets/` und sind im Spiel aktiv. Sie muessen spaeter nur noch unter denselben Dateinamen freigestellt ersetzt werden.

| Datei | Geplanter Key | Zweck | Prioritaet |
|---|---|---|---|
| `assets/ui_signal_jump.png` | `uiSignalJump` | Vorwarnung: springen/ueber Hindernis | P0 |
| `assets/ui_signal_dive.png` | `uiSignalDive` | Vorwarnung: tauchen/unter Hindernis | P0 |
| `assets/ui_signal_stomp.png` | `uiSignalStomp` | Vorwarnung: draufspringen/bouncen | P0 |
| `assets/ui_signal_stay_up.png` | `uiSignalStayUp` | Vorwarnung: oben bleiben/nicht tauchen | P0 |

## Gameplay-Hooks fuer Batch 1

Die Signale sind nicht als Deko gedacht. Sie haengen an diesen Gameplay-Sequenzen:

| Sequenz | Aktueller Zweck | Passendes Asset |
|---|---|---|
| `jump_intro` | einfacher Lernsprung mit kurzer Perlenlinie | `assets/ui_signal_jump.png` |
| `jump_collect_arc` | groessere Sprungkurve mit mehr Reward | `assets/ui_signal_jump.png` |
| `dive_intro` | erstes klares Untertauchen | `assets/ui_signal_dive.png` |
| `dive_pearl_tunnel` | Unterwasser-Perlentunnel als Risiko-Route | `assets/ui_signal_dive.png` |
| `stomp_bounce_reward` | auf Sponge/Duck-Ring landen und bouncen | `assets/ui_signal_stomp.png` |
| `stay_up_surface_line` | Unterwasser-Gefahr, oben bleiben | `assets/ui_signal_stay_up.png` |

## Batch 2: nur ersetzen, wenn nach dem Test noetig

Diese Assets existieren bereits und sind im Gameplay sinnvoller als komplett neue Motive. Nicht neu erstellen, solange sie im Spiel visuell funktionieren.

| Datei | Key | Aktueller Zweck |
|---|---|---|
| `assets/obstacle_sponge.png` | `obstacleSponge` | weiches Stomp-Hindernis an der Wasserlinie |
| `assets/obstacle_duck_ring.png` | `obstacleDuckRing` | zweite Stomp-/Bounce-Variante |
| `assets/cup_brush_v2.png` | `cupBrushV2` | hohes Dive-Hindernis |
| `assets/drain_plug.png` | `drainPlug` | Unterwasser-Gefahr, bei der man oben bleiben muss |
| `assets/obstacle_bubble_gate.png` | `obstacleBubbleGate` | Reserve fuer klares Dive-Gate |
| `assets/fx_underwater_bubbles.png` | `fxUnderwaterBubbles` | Reserve fuer bessere Dive-Spur |
| `assets/fx_quack_wave.png` | `fxQuackWave` | Quack-Bombe Effektreserve |
| `assets/fx_speed_lines.png` | `fxSpeedLines` | Turbo-Feedbackreserve |

## Vorerst nicht produzieren

Diese Grafiken waeren aktuell wahrscheinlich Verschwendung:

- neue Button-Sets
- neue Panel-Sets
- weitere Shop-/Skin-UI
- zusaetzliche Power-up-Icons
- neue Hintergruende
- Deko-Bubbles fuer Screens
- weitere Sammelobjekte ausserhalb der drei Pearl-Lanes

Grund: Das Gameplay braucht erst stabile Regeln und klare Lanes. Danach sieht man, welche Motive wirklich fehlen.

## Vollstaendige Prompts fuer Batch 1

### `assets/ui_signal_jump.png`

```text
Create a polished 2D mobile game UI icon for the action "jump over" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck silhouette jumping upward over a low pink soap bar, with a curved upward arrow and a few bright water droplets. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, bright yellow duck, cyan water accents, small white highlight details, playful and premium. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

### `assets/ui_signal_dive.png`

```text
Create a polished 2D mobile game UI icon for the action "dive under" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck silhouette dipping below a blue waterline under a tall toothbrush cup obstacle, with a curved downward arrow and round bubbles. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, cyan underwater glow, white bubbles, playful and premium. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

### `assets/ui_signal_stomp.png`

```text
Create a polished 2D mobile game UI icon for the action "stomp and bounce" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck landing on top of a soft yellow bath sponge at the water surface, with a downward impact arrow, a springy bounce shape, and small splash droplets. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, yellow duck and sponge, cyan splash accents, playful and premium. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

### `assets/ui_signal_stay_up.png`

```text
Create a polished 2D mobile game UI icon for the action "stay above the water" in a cheerful rubber duck bathroom runner game. The icon should show a small yellow rubber duck safely floating above a blue waterline while a dark drain plug danger shape passes underwater below it, with a clear upward arrow and a pink warning accent. Friendly high-quality cartoon style, glossy mobile game art, strong dark-blue outline, very clear readable silhouette at 48px size, yellow duck, cyan waterline, pink danger marker, playful and premium. Place the icon centered on a pure white background for easy cutout, no text, no cropped parts, no shadows touching the image edges, 1024x1024 PNG.
```

## Einbau-Regel

Bitte die final freigestellten Dateien exakt mit den Dateinamen aus Batch 1 in `assets/` ablegen. Dann koennen wir die Code-Platzhalter direkt durch Bild-Icons ersetzen, ohne die Spielmechanik nochmal anzufassen.
