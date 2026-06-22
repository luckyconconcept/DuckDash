# Duck & Dash Gameplay Testing

Stand: 2026-06-22

## Automatischer Check

```bash
node tools/gameplay-balance-check.mjs
```

Der Check prueft:

- Spawn-Phasen passen zu verfuegbaren Hindernissen.
- Jump/Dive kommen frueh, Stomp kommt im Midgame, Underwater kommt erst spaeter.
- Die erste Dive-Lektion nutzt den Becher statt der schwereren Zahnbuerste.
- Zahnbuerste bleibt langsamer, mit groesserem Abstand und fairer Hitbox.
- Stomp toleriert Spruenge nahe am Apex.
- Reward-Perlen locken nicht in die falsche Lane.
- Telemetrie-Hooks fuer Challenge-, Reward- und Powerup-Outcomes sind vorhanden.
- Kritische Testwerte sind noch mit `game.js` synchron.

## Was der Check nicht beweist

Der Check beweist nicht, dass das Spiel automatisch Spass macht. Er verhindert nur harte Balancing-Regressionen. Spielgefuehl braucht weiter kurze echte Testlaeufe.

## Manueller Kurztest nach Balancing-Aenderungen

1. 3 Runden bis mindestens 45 Sekunden spielen.
2. Aufschreiben, wodurch man stirbt: zu spaet gedrueckt, falsche Aktion, unklare Regel oder unfaire Hitbox.
3. Pruefen, ob Perlen die richtige Aktion zeigen:
   - Jump: Bogen oberhalb der Wasserlinie.
   - Dive: Unterwasser-Tunnel.
   - Stomp: Landelinie auf Sponge/Ring.
   - Stay-up: Perlen bleiben oben.
4. Wenn ein Hindernis in 2 von 3 Runden unfair wirkt, nicht Asset tauschen, sondern zuerst Timing/Hitbox/Sequenz pruefen.

## Run-Telemetrie

Nach einem Game Over liegt der letzte Lauf im Browser bereit:

```js
window.__duckDashLastRunTelemetry
```

Alternativ aus `localStorage`:

```js
JSON.parse(localStorage.getItem("duck-dash-last-run-telemetry"))
```

Wichtige Felder:

- `challenge.spawnedByMode`: wie oft `jump`, `dive`, `stomp`, `underwater` gespawnt wurden.
- `challenge.clearedByMode`: wie oft der Modus sauber geschafft wurde.
- `challenge.hitByMode`: echte Treffer ohne Shield/Turbo/Bombe.
- `challenge.absorbedByMode`, `turboClearedByMode`, `bombClearedByMode`: gerettete oder entfernte Hindernisse.
- `reward.spawnedBySequence` und `reward.collectedBySequence`: ob die Perlenlinie gelesen und erreicht wurde.
- `powerup.spawnedByType`, `collectedByType`, `usedEffect`: ob Powerups nur auftauchen oder wirklich helfen.

Praktische Auswertung: Wenn `dive` viele Spawns, aber deutlich mehr `hitByMode.dive` als `clearedByMode.dive` hat, erst Tauchfenster und Hitbox pruefen. Wenn `reward.collectedBySequence.dive_pearl_tunnel` niedrig bleibt, ist nicht zwingend das Hindernis unfair, sondern eventuell die Perlenlinie oder Tauchdauer.
