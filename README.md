# ZONE X 89

**Ein browser-basiertes Remake des Atari XL Klassikers — neu interpretiert für das Web.**

---

## Das Original: Lode Runner / Labyrinth-Varianten auf dem Atari 400/800 XL (1983–1989)

### Historischer Hintergrund

Der Atari 400 und 800 XL war in der ersten Hälfte der 1980er-Jahre einer der meistverbreiteten Heimcomputer Europas. Mit dem MOS 6502-Prozessor (1,79 MHz), dem ANTIC-Grafikchip und dem POKEY-Soundchip bot die Plattform für ihre Zeit außergewöhnliche Sprite- und Hintergrundgrafiken bei vergleichsweise geringem Speicher (16–64 KB RAM).

Zwischen 1983 und 1989 erschienen auf dem Atari XL zahlreiche Top-Down-Labyrinthspiele, deren Mechaniken das Genre maßgeblich prägten:

- **Lode Runner** (Broderbund, 1983) — Einer der ersten großen Hits, der Leveleditoren populär machte.
- **Miner 2049er** (Micro Fun, 1983) — Plattformer mit Sammel-Mechaniken.
- **Archon** (Electronic Arts, 1983) — Strategisches Kachel-Schach mit Echtzeitkämpfen.
- **Dandy** (1983) — Früher Top-Down-Dungeon-Crawler für bis zu 4 Spieler, direkte Inspirationsquelle für *Gauntlet* (Atari, 1985).
- **Gauntlet** (Atari, 1985 / Atari XL-Port) — Das legendäre Dungeon-Crawler-Arcade-Spiel: Spieler sammeln Schätze, weichen Gegnern aus, verwalten Ressourcen unter Zeitdruck.
- **Draconus** (Cognito, 1988) — Wissenschaftlich-fantastisches Action-Spiel für den Atari XL.
- **Entombed** (US Games, 1982 → diverse Ports) — Prozedural generierte Labyrinthe; einer der frühesten bekannten Fälle eines Algorithmus, der bis heute nicht vollständig entschlüsselt ist.

Das Spielprinzip, das diesen Titel inspirierte — Spieler navigiert durch ein Labyrinth, sammelt radioaktive oder gefährliche Objekte unter Zeitdruck, weicht Wächtern aus und nutzt Umgebungselemente strategisch — ist direkt dieser Ära entlehnt.

### Warum „Zone X 89"?

Der Name ist eine Hommage: **Zone X** steht für die verbotene, radioaktiv verseuchte Zone, in der Plutonium geborgen werden muss. **89** verweist auf das Jahr 1989 — das letzte große Jahr der Atari-XL-Ära, kurz bevor der Atari ST und Amiga den Heimcomputer-Markt dominierten.

---

## Das Spiel

**Zone X 89** ist ein Top-Down-Labyrinthspiel im Retro-Ästhetik-Stil. Der Spieler navigiert durch prozedural oder manuell gestaltete Level, sammelt Plutonium und liefert es an Tonnen ab — unter Zeitdruck und mit Gegnern, die den Weg abschneiden.

### Features

- **Echtzeit-Bewegung** mit pixelgenauer Kollisionserkennung
- **Nebel-Mechanik**: Nicht erkundete Bereiche sind verborgen; Gegner können nur sichtbare Kacheln betreten
- **Zwei Gegnertypen**: Schnelle (rote) und langsame (orange) Wächter mit unterschiedlichem Verhalten
- **Türen**: Öffnen und schließen sich automatisch in konfigurierbarem Takt — tödlich bei Kollision
- **Matten**: Sammelbar und als temporäre Wand gegen Gegner einsetzbar
- **Plutonium-Timer**: Läuft ab, wenn Plutonium zu lange gehalten wird — Spannung steigt mit jedem Tick
- **Partikelfreies Rendering**: Schlanke Canvas-2D-Engine ohne externe Abhängigkeiten
- **Prozedurale Labyrinthe**: 10+ Maze-Algorithmen (Backtracking, Prims, Sidewinder, Eller's, Wilson's u.v.m.)
- **Level-Editor** mit Undo/Redo (100 Schritte), Flood-Fill, Maze-Generierung und JSON-Export
- **Tuning-Panel**: Alle Spielparameter in Echtzeit anpassbar (Geschwindigkeiten, Timer, Leben, Zoom)
- **Licht- und Post-Processing-Effekte** für Retro-Atmosphäre
- **Mehrere Level** über `levels/manifest.json` ladbar

---

## Steuerung

| Taste | Aktion |
|-------|--------|
| `WASD` / `↑↓←→` | Spieler bewegen |
| `SPACE` | Matte auf letzter Position ablegen |
| `E` | Level-Editor öffnen / schließen |
| `H` | Hilfe öffnen / schließen |
| `R` | Neustart (nach Game Over / Level Complete) |

### Level-Editor

| Aktion | Beschreibung |
|--------|-------------|
| **Linksklick + Ziehen** | Tile malen |
| **Mausrad-Klick (Mitte)** | Flood-Fill: zusammenhängende Fläche füllen |
| **↩ Rückgängig** | Letzten Schritt rückgängig (bis 100) |
| **↪ Wiederholen** | Wiederholen |
| **🌀 Maze-Dropdown** | Labyrinth-Algorithmus auswählen und generieren |

---

## Spielelemente

| Symbol | Element | Beschreibung |
|--------|---------|-------------|
| 🟦 Spieler | `pl` | Du. Glühend-türkis. |
| ⬛ Wand | `wa` | Unpassierbar für alle. |
| 🌫️ Nebel | `fo` | Blockiert Gegner. Beim Betreten permanent entfernt. |
| 💚 Plutonium | `pu` | Aufsammeln startet Countdown. Mehrfach möglich. |
| 🔵 Tonne | `to` | Ziel für Plutonium-Abgabe. +100 Score. |
| 🟣 Tür | `tü` | Öffnet/schließt automatisch. Gegner-Hindernis. |
| 🟤 Matte | `ma` | Sammelbar, als Wand einsetzbar. |
| 🔴 Schneller Gegner | `R` | ~2× Grundgeschwindigkeit. Rot. |
| 🟠 Langsamer Gegner | `r` | ~0.5× Grundgeschwindigkeit. Orange. |

---

## Level hinzufügen

1. Level im Editor erstellen und als `.json` exportieren (💾 Speichern)
2. Datei in den `levels/`-Ordner kopieren
3. `levels/manifest.json` um den Eintrag erweitern:

```json
[
  {"name": "Level 1", "file": "levels/level1.json"},
  {"name": "Level 2", "file": "levels/level2.json"},
  {"name": "Mein Level", "file": "levels/meinlevel.json"}
]
```

4. Im Startscreen-Dropdown erscheint das neue Level automatisch.

---

## Technische Details

- **Engine**: Vanilla JavaScript, HTML5 Canvas 2D — keine Frameworks, keine Abhängigkeiten
- **Rendering**: Eigenes Tile-Caching-System mit Sprite-Texturgenerierung
- **Licht**: Radiales Lichtsystem mit Overlay-Pass
- **Post-Processing**: Scan-Lines, Vignette, Chromatic Aberration
- **Maze-Generierung**: 10+ klassische Algorithmen, alle in `js/maze.js`
- **Audio**: Web Audio API mit prozeduralem SFX-Synthesizer
- **Speichern**: Level als JSON (Editor-Export), Spielparameter als URL/Tuning-Panel
- **Kompatibilität**: Alle modernen Browser; kein Build-Schritt erforderlich

---

## Lokales Ausführen

```bash
# Einfachste Methode: VS Code Live Server Extension
# Oder: Python HTTP Server
python -m http.server 8080
# Dann: http://localhost:8080
```

> **Hinweis:** Das Spiel muss über einen HTTP-Server geöffnet werden (nicht als `file://`), damit die Level-JSON-Dateien geladen werden können.

---

## Entwicklung

**Zone X 89** — Browser-Remake  
Entwickelt von **Felix Schmidt**

Inspiriert von den Labyrinth- und Action-Klassikern der Atari XL-Ära (1983–1989), insbesondere *Gauntlet*, *Dandy* und den frühen Maze-Runnern der 8-Bit-Generation.

---

## Lizenz

Dieses Projekt ist ein Fan-Remake zu Bildungs- und Unterhaltungszwecken. Alle Spielmechaniken wurden neu implementiert; keine Original-Assets wurden übernommen.
