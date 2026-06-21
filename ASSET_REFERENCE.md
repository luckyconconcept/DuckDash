# Duck & Dash Asset Reference

Diese Namen sind die verbindlichen Asset-Dateinamen im Spiel. Wenn Assets neu freigestellt werden, die Dateien bitte exakt unter diesen Namen in `assets/` ersetzen.

## Core

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `bg` | `assets/bathroom_bg_flooded.png` | aktueller Gameplay-/Screen-Hintergrund |
| `logo` | `assets/logo.png` | Startscreen-Logo |
| `duck` | `assets/duck.png` | Spielfigur |

## Hindernisse

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `soap` | `assets/soap.png` | altes Seifen-Asset / Stacking-Deko |
| `soapV2` | `assets/soap_v2.png` | springbares Seifen-Hindernis |
| `toothbrush` | `assets/toothbrush.png` | Tauch-Hindernis |
| `cupBrush` | `assets/cup_brush.png` | alter Zahnbuerstenbecher |
| `cupBrushV2` | `assets/cup_brush_v2.png` | Tauch-Hindernis Zahnbuerste im Becher |
| `whirlpool` | `assets/whirlpool.png` | alter Strudel |
| `whirlpoolV2` | `assets/whirlpool_v2.png` | Stomp-Hindernis |
| `underwaterCap` | `assets/underwater_cap.png` | Unterwasser-Hindernis, oben bleiben |
| `drainPlug` | `assets/drain_plug.png` | Unterwasser-Hindernis, nicht tauchen |

## Sammelobjekte

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `pearlPink` | `assets/pearl_pink.png` | Standard-Perle |
| `pearlBlue` | `assets/pearl_blue.png` | Standard-Perle / Partikel |
| `pearlGold` | `assets/pearl_gold.png` | Goldperle |
| `shellPearl` | `assets/shell_pearl.png` | seltene Muschelperle |
| `starfishBonus` | `assets/starfish_bonus.png` | Bonus-Collectible |
| `underwaterPearls` | `assets/underwater_pearls.png` | nur beim Tauchen sammelbar |

## Power-ups

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `quackBomb` | `assets/quack_bomb.png` | altes Bomben-Asset |
| `quackBombV2` | `assets/quack_bomb_v2.png` | aktive Quak-Bombe |
| `powerupMagnet` | `assets/powerup_magnet.png` | altes Magnet-Asset |
| `powerupMagnetV2` | `assets/powerup_magnet_v2.png` | aktives Magnet-Power-up |
| `powerupShield` | `assets/powerup_shield.png` | altes Schild-Asset |
| `powerupShieldV2` | `assets/powerup_shield_v2.png` | aktives Schild-Power-up |
| `powerupTurbo` | `assets/powerup_turbo.png` | altes Turbo-Asset |
| `powerupTurboV2` | `assets/powerup_turbo_v2.png` | aktives Turbo-Power-up |

## Wasser / Effekte

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `waterCurrent` | `assets/water_current.png` | bewegte Unterwasser-Stroemung |

## Vorhanden, aktuell nicht geladen

Diese Dateien liegen ebenfalls in `assets/`, werden im aktuellen Spielcode aber nicht direkt per `this.load.image(...)` geladen.

| Datei | Hinweis |
| --- | --- |
| `assets/bathroom_bg.jpg` | aelterer Hintergrund |
| `assets/bathroom_bg_clean.jpg` | aelterer/cleaner Hintergrund |

## Freistell-Regeln

- Hintergrund weiss oder transparent liefern, danach als PNG mit Alpha speichern.
- Motiv mittig mit wenig Rand exportieren; kein Schatten bis zum Bildrand.
- Keine Dateinamen aendern, sonst muss `game.js` angepasst werden.
- Empfohlene Zielgroessen: kleine Collectibles 96-220 px, Hindernisse 220-640 px, Power-ups 180-260 px, Hintergrund 1672x941 oder 1920x1080.
