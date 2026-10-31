# max sutter - Logo-Dateien

Die drei Varianten sind das eigenständige Icon, die einzeilige Wort-Bild-Marke
und die Wort-Bild-Marke mit **Executive Coaching & Facilitation** als Unterzeile.
Die Vorschau `preview.png` zeigt beide Wort-Bild-Marken in identischer Größe.

## Welche Datei wofür?

| Verwendung | Datei / Ordner |
| --- | --- |
| Website, Präsentation, Layoutprogramm | `svg/` - bevorzugtes Format |
| PNG erforderlich, z. B. Office oder Social Media | `png/` - transparenter Hintergrund |
| Druckerei, einfarbig schwarzer Druck | `print/` - Vektor-PDF, 100 % K |
| Browser-Tab, App-/Touch-Icon | `web-icons/` |

Die Dateien ohne Farbsuffix verwenden das warme Schwarz **#292722** (sRGB).
`-black` ist reines Schwarz, `-white` ist Weiß für dunkle Hintergründe.
Alle SVGs und regulären PNGs haben einen transparenten Hintergrund.
Das Apple-Touch-Icon hat absichtlich einen hellen Hintergrund (#f5f2eb).

## Qualität und Verwendung

- SVG und PDF enthalten ausschließlich echte Vektorkonturen für Bildzeichen und
  Schrift. Keine eingebetteten Rasterbilder, keine externen Schriftabhängigkeiten.
- Der Name ist in **Manrope Medium (500)** gesetzt. Die Unterzeile verwendet
  **Manrope Regular (400)** in Großbuchstaben mit etwas zusätzlichem Buchstabenabstand.
- Hauptlogos als PNG: **4096 Pixel breit**. Icon als PNG: **2048 x 2048 Pixel**.
  Die 300-dpi-Metadaten sind eine Ausgabehilfe; für Druck bevorzugt das Vektor-PDF.
- PDFs: Icon 50 x 50 mm; Wort-Bild-Marken 120 mm breit. Proportional skalierbar.
  Schwarz ist **C0 M0 Y0 K100**, damit feine Konturen einfarbig gedruckt werden.
  Kein Beschnitt erforderlich: Dies sind freigestellte Logoassets, keine fertigen Druckbögen.
- Für kleine Darstellungen die einzeilige Version verwenden. Die Version mit
  Unterzeile vorzugsweise ab etwa **400 Pixeln / 75 mm Breite** einsetzen.
- Die SVG-Datei `favicon.svg` passt die Farbe an den hellen bzw. dunklen
  Browsermodus an. `favicon.ico` enthält 16-, 32- und 48-Pixel-Versionen.
- Keine Verzerrung oder nichtproportionale Skalierung. Außen zusätzlichen Freiraum
  vorsehen; der Dateirand ist die technische Arbeitsfläche, kein vollständiger Schutzraum.

## Herkunft und Bearbeitung

Das Bildzeichen wurde aus der in diesem Designprozess ausgewählten Vorlage als
zwei glatte Bézierkonturen rekonstruiert. Die Rastertextur der Vorlage gehört nicht
zum finalen Vektorzeichen. Die Form wurde mit der gewählten Vorlage abgeglichen.

Die Schrift stammt aus dem offiziellen Google-Fonts-Repository:
https://github.com/google/fonts/tree/main/ofl/manrope

Manrope ist unter der SIL Open Font License 1.1 lizenziert. Originalschrift und
Lizenz liegen unter `source/`. Für die Nutzung der fertigen Logos muss keine Schrift
installiert werden. Wer die Texte bearbeiten möchte, kann die Originalschrift
installieren und die typografischen Parameter aus `manifest.json` verwenden.

`source/icon.svg` enthält die beiden ursprünglichen Vektorkonturen.
`source/build.py` erstellt die fertigen Konturen, PNGs, Druck-PDFs und das ZIP erneut.
Benötigt werden Python, die Pakete aus `source/requirements.txt` und Cairo.
Auf macOS mit Homebrew-Cairo kann dessen Bibliothekspfad erforderlich sein:

```sh
python -m pip install -r source/requirements.txt
DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python source/build.py
```

`manifest.json` dokumentiert Schrift, Farben, Abmessungen und Prüfsummen.
