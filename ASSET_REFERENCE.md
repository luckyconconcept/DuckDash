# Duck & Dash Asset Reference

Diese Namen sind die verbindlichen Asset-Dateinamen im Spiel. Wenn Assets neu freigestellt werden, die Dateien bitte exakt unter diesen Namen in `assets/` ersetzen.

## Core

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `bg` | `assets/bathroom_bg_flooded.png` | aktueller Gameplay-/Screen-Hintergrund |
| `logo` | `assets/logo.png` | Startscreen-Logo |
| `duck` | `assets/duck.png` | Spielfigur |
| `duckHero` | `assets/duck_hero.png` | Hero-Ente fuer Startscreen |
| `duckGameOver` | `assets/duck_gameover.png` | benommene Ente fuer Game-Over-Screen |
| `duckVictory` | `assets/duck_victory.png` | Sieger-Ente fuer neue Rekorde |

## Gesperrte visuelle Baseline

Stand `20260622-waterdynamic10`: Entenhoehe, Wasserkante und Wasseranimation sind freigegeben und bleiben unveraendert, solange keine explizite neue Anweisung kommt.

- Wasserkante im Code: `WATER_SURFACE_Y = 456`
- Enten-Wasserlinie im Code: `DUCK_WATERLINE = 476`
- Wasseranimation: aktuelle Kombination aus `addAnimatedWaterSurface`, `addSurfaceFoamFlecks`, `addSurfaceShimmer`, `addBathtubRunoff` und `addWaterGlints`
- Keine Anpassung von Wellenhoehe, Foam-Flecks, Shimmer, Runoff oder Duck-Float bei unrelated Gameplay-/UI-Arbeit.

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
| `obstacleSponge` | `assets/obstacle_sponge.png` | Reserve: Oberflaechen-Hindernis |
| `obstacleDuckRing` | `assets/obstacle_duck_ring.png` | Reserve: Oberflaechen-Hindernis |
| `obstacleToyBoat` | `assets/obstacle_rubber_boat_toy.png` | Reserve: Oberflaechen-Hindernis |
| `obstacleRazorUnderwater` | `assets/obstacle_razor_underwater.png` | Reserve: Unterwasser-Hindernis |
| `obstacleBubbleGate` | `assets/obstacle_bubble_gate.png` | Reserve: Unterwasser-/Tauchfenster |
| `obstacleTowelSink` | `assets/obstacle_towel_sink.png` | Reserve: Unterwasser-Hindernis |

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
| `powerupHeart` | `assets/powerup_heart.png` | Reserve: Extra-Leben-Power-up |

## Wasser / Effekte

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `waterCurrent` | `assets/water_current.png` | bewegte Unterwasser-Stroemung |
| `fxSplashSmall` | `assets/fx_splash_small.png` | Reserve: kleiner Splash |
| `fxSplashBig` | `assets/fx_splash_big.png` | Reserve: grosser Splash |
| `fxBubblePop` | `assets/fx_bubble_pop.png` | Reserve: Bubble-Pop |
| `fxQuackWave` | `assets/fx_quack_wave.png` | Reserve: Quak-Schockwelle |
| `fxSpeedLines` | `assets/fx_speed_lines.png` | Reserve: Turbo-Speedlines |
| `fxUnderwaterBubbles` | `assets/fx_underwater_bubbles.png` | Reserve: Tauchblasen |

## Screen / UI

| Spiel-Key | Datei | Einsatz |
| --- | --- | --- |
| `uiPause` | `assets/ui_pause.png` | Pause-Button/Icon |
| `uiHeart` | `assets/ui_heart.png` | Leben/HUD |
| `uiTrophy` | `assets/ui_trophy.png` | Highscore/Game-Over-Pokal |
| `uiPanelLarge` | `assets/ui_panel_large.png` | grosses Screen-Overlay |
| `uiPanelSmall` | `assets/ui_panel_small.png` | kleines Pause-/Dialog-Overlay |
| `uiButtonPrimary` | `assets/ui_button_primary.png` | Hauptbutton ohne Text |
| `uiButtonSecondary` | `assets/ui_button_secondary.png` | Nebenbutton ohne Text |
| `uiButtonDanger` | `assets/ui_button_danger.png` | Beenden-/Danger-Button ohne Text |
| `uiInputName` | `assets/ui_input_name.png` | Namensfeld-Hintergrund |
| `uiNameBadge` | `assets/ui_name_badge.png` | Namens-Badge |
| `uiHome` | `assets/ui_home.png` | Home-Icon |
| `uiPlay` | `assets/ui_play.png` | Play-Icon |
| `uiRestart` | `assets/ui_restart.png` | Restart-Icon |
| `uiScoreCoin` | `assets/ui_score_coin.png` | Score-HUD-Icon |
| `uiPearlCounter` | `assets/ui_pearl_counter.png` | Perlen-HUD-Icon |

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
