#!/usr/bin/env python3
"""Build the approved logo assets from two vector contours and original Manrope."""

from dataclasses import dataclass
from functools import lru_cache
from io import BytesIO
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED

import cairosvg
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.reportLabPen import ReportLabPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image
from reportlab.pdfgen.canvas import Canvas
import uharfbuzz as hb


ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / "source/Manrope-Variable.ttf"
NS = "http://www.w3.org/2000/svg"
INK = "#292722"
TAGLINE = "EXECUTIVE COACHING & FACILITATION"


def number(value):
    return f"{value:.4f}".rstrip("0").rstrip(".") or "0"


def transform(path, matrix):
    pen = SVGPathPen(None, ntos=number)
    parse_path(path, TransformPen(pen, matrix))
    return pen.getCommands()


def bounds(paths):
    pen = BoundsPen(None)
    for path in paths:
        parse_path(path, pen)
    return pen.bounds


@dataclass
class Artwork:
    paths: list[str]
    width: float
    height: float

    def placed(self, x, y, scale=1):
        return [transform(p, (scale, 0, 0, scale, x, y)) for p in self.paths]


def normalize(paths):
    x0, y0, x1, y1 = bounds(paths)
    return Artwork([transform(p, (1, 0, 0, 1, -x0, -y0)) for p in paths], x1-x0, y1-y0)


@lru_cache(maxsize=2)
def font_at(weight):
    font = TTFont(FONT)
    assert "Manrope" in font["name"].getDebugName(1)
    font = instantiateVariableFont(font, {"wght": weight}, inplace=True)
    stream = BytesIO()
    font.save(stream)
    shaper = hb.Font(hb.Face(stream.getvalue()))
    units = font["head"].unitsPerEm
    shaper.scale = (units, units)
    hb.ot_font_set_funcs(shaper)
    return font, shaper, units


def lettering(text, size, weight=500, tracking=0):
    font, shaper, units = font_at(weight)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(shaper, buf, {"kern": True, "liga": True})
    glyphs = font.getGlyphSet()
    order = font.getGlyphOrder()
    pen = SVGPathPen(glyphs, ntos=number)
    scale = size / units
    cursor = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        glyphs[order[info.codepoint]].draw(TransformPen(pen, (
            scale, 0, 0, -scale,
            cursor + pos.x_offset * scale, -pos.y_offset * scale,
        )))
        cursor += pos.x_advance * scale + tracking * size
    return normalize([pen.getCommands()])


def svg(art, color=INK, title="max sutter"):
    root = ET.Element("svg", {
        "xmlns": NS, "viewBox": f"0 0 {number(art.width)} {number(art.height)}",
        "width": number(art.width), "height": number(art.height),
        "role": "img", "aria-labelledby": "title",
    })
    ET.SubElement(root, "title", {"id": "title"}).text = title
    ET.SubElement(root, "desc").text = "Vector artwork. Manrope lettering converted to outlines. Transparent background."
    group = ET.SubElement(root, "g", {"fill": color})
    for path in art.paths:
        ET.SubElement(group, "path", {"d": path})
    return ET.tostring(root, encoding="unicode") + "\n"


def png(svg_text, destination, width, background=None):
    data = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=width, background_color=background)
    image = Image.open(BytesIO(data))
    image.save(destination, dpi=(300, 300), optimize=True)


class PDFCanvasPen(ReportLabPen):
    def _closePath(self):
        self.path.close()


def print_pdf(art, destination, width_mm, title):
    scale = (width_mm * 72 / 25.4) / art.width
    pdf = Canvas(str(destination), pagesize=(art.width*scale, art.height*scale), pageCompression=1, invariant=1)
    pdf.setTitle(title)
    pdf.setAuthor("Max Sutter")
    pdf.setSubject("Vector logo; outlined Manrope; single-color process black, C0 M0 Y0 K100")
    pdf.translate(0, art.height*scale)
    pdf.scale(scale, -scale)
    pdf.setFillColorCMYK(0, 0, 0, 1)
    for path in art.paths:
        pen = PDFCanvasPen(None, pdf.beginPath())
        parse_path(path, pen)
        pdf.drawPath(pen.path, stroke=0, fill=1, fillMode=1)
    pdf.showPage()
    pdf.save()


def preview(horizontal, signature, icon):
    # Both lockups have exactly the same symbol, wordmark size and position.
    width, height = 1800, 680
    parts = [f'<svg xmlns="{NS}" viewBox="0 0 {width} {height}">', '<rect width="1800" height="680" fill="#ffffff"/>']

    def add(paths, color=INK):
        parts.extend(f'<path fill="{color}" d="{p}"/>' for p in paths)

    for x, label, art in [(100, "OHNE UNTERZEILE", horizontal), (1000, "MIT UNTERZEILE", signature)]:
        heading = lettering(label, 19, 400, .10)
        add(heading.placed(x, 74), "#6b6760")
        add(art.placed(x, 205, 700 / art.width))
    parts.append('<path d="M900 65V420M100 475H1700" fill="none" stroke="#e8e5df" stroke-width="1"/>')
    add(icon.placed(100, 520, 108 / icon.width))
    add(lettering("ICON", 17, 400, .10).placed(247, 550), "#6b6760")
    add(lettering("Manrope Medium", 18, 400).placed(1000, 550), "#6b6760")
    parts.append('</svg>')
    content = "\n".join(parts)
    (ROOT / "preview.svg").write_text(content)
    png(content, ROOT / "preview.png", 2400)


def main():
    for folder in ["svg", "png", "print", "web-icons"]:
        (ROOT / folder).mkdir(exist_ok=True)
    source = ET.parse(ROOT / "source/icon.svg").getroot()
    mark = normalize([p.attrib["d"] for p in source.findall(f"{{{NS}}}path")])
    assert len(mark.paths) == 2
    word = lettering("max sutter", 100, 500, -.03)
    icon_height = 96
    mark_scale = icon_height / mark.height
    mark_width = mark.width * mark_scale
    word_x = mark_width + 34
    word_y = (icon_height - word.height) / 2
    margin = 24
    total_width = 2*margin + word_x + word.width
    base_paths = mark.placed(margin, margin, mark_scale) + word.placed(margin+word_x, margin+word_y)
    horizontal = Artwork(base_paths, total_width, icon_height + 2*margin)

    descriptor = lettering(TAGLINE, 20, 400, .12)
    descriptor_scale = word.width / descriptor.width
    descriptor_y = margin + word_y + word.height + 19
    signature = Artwork(
        base_paths + descriptor.placed(margin+word_x, descriptor_y, descriptor_scale),
        total_width,
        max(margin+icon_height, descriptor_y+descriptor.height*descriptor_scale) + margin,
    )
    icon_canvas = 256
    icon_scale = 208 / mark.width
    icon = Artwork(mark.placed(24, (icon_canvas-mark.height*icon_scale)/2, icon_scale), icon_canvas, icon_canvas)
    assets = {"icon": icon, "horizontal": horizontal, "signature": signature}
    descriptions = {"icon": "max sutter - icon", "horizontal": "max sutter", "signature": "max sutter - Executive Coaching & Facilitation"}

    for name, art in assets.items():
        for suffix, color in [("", INK), ("-black", "#000000"), ("-white", "#ffffff")]:
            content = svg(art, color, descriptions[name])
            (ROOT / f"svg/max-sutter-{name}{suffix}.svg").write_text(content)
            if suffix != "-black":
                pixels = 2048 if name == "icon" else 4096
                png(content, ROOT / f"png/max-sutter-{name}{suffix}-{pixels}.png", pixels)
        print_pdf(art, ROOT / f"print/max-sutter-{name}-K100.pdf", 50 if name == "icon" else 120, descriptions[name])

    icon_svg = svg(icon, INK, descriptions["icon"])
    for size in [16, 32, 48, 180, 192, 512]:
        png(icon_svg, ROOT / f"web-icons/icon-{size}.png", size)
    png(icon_svg, ROOT / "web-icons/apple-touch-icon.png", 180, "#f5f2eb")
    favicon_svg = icon_svg.replace('<g fill="#292722">', '<style>.mark{fill:#292722}@media(prefers-color-scheme:dark){.mark{fill:#f5f2eb}}</style><g class="mark">')
    (ROOT / "web-icons/favicon.svg").write_text(favicon_svg)
    Image.open(ROOT / "png/max-sutter-icon-2048.png").save(ROOT / "web-icons/favicon.ico", sizes=[(16,16),(32,32),(48,48)])
    preview(horizontal, signature, icon)

    manifest = {
        "name": "max sutter", "descriptor": "Executive Coaching & Facilitation",
        "wordmark": {"family": "Manrope", "weight": 500, "tracking_em": -.03, "case": "lowercase"},
        "descriptor_style": {"family": "Manrope", "weight": 400, "tracking_em": .12, "case": "uppercase", "font_size_at_master_scale": 20*descriptor_scale},
        "colors": {"ink_srgb": INK, "black_srgb": "#000000", "white_srgb": "#ffffff", "print_CMYK": [0,0,0,100]},
        "icon_paths": 2, "reference_silhouette_iou": .9857157432915009,
        "source_font_url": "https://github.com/google/fonts/blob/main/ofl/manrope/Manrope%5Bwght%5D.ttf",
        "font_sha256": hashlib.sha256(FONT.read_bytes()).hexdigest(),
        "dimensions": {key: {"viewBox_width": art.width, "viewBox_height": art.height} for key, art in assets.items()},
        "exports": [],
    }
    for file in sorted(ROOT.rglob('*')):
        if file.is_file() and file.parent.name in {"svg", "png", "print", "web-icons"}:
            manifest["exports"].append({"path": str(file.relative_to(ROOT)), "bytes": file.stat().st_size, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})
    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    archive = ROOT.parent / "max-sutter-logo-kit.zip"
    with ZipFile(archive, 'w', ZIP_DEFLATED) as bundle:
        for file in sorted(ROOT.rglob('*')):
            if file.is_file() and '__pycache__' not in file.parts:
                bundle.write(file, Path('max-sutter') / file.relative_to(ROOT))
    print(json.dumps({"assets": len(manifest["exports"]), "archive": str(archive), "tagline_font_size": 20*descriptor_scale, "dimensions": manifest["dimensions"]}, indent=2))


if __name__ == '__main__':
    main()
