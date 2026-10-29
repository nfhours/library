#!/usr/bin/env python3
"""Build a single contact-sheet image of every ornament for review."""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = (24, 22, 20, 255)
CELL = 180
PAD = 14
LABEL_H = 20

GROUP_ORDER = ["headpiece", "tailpiece", "dropcap", "divider"]
GROUP_TITLES = {
    "headpiece": "Заставки",
    "tailpiece": "Концовки",
    "dropcap": "Буквицы",
    "divider": "Разделители",
}


def font(size):
    for path in [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def build(book):
    book_dir = os.path.join(REPO, "books", book)
    ornaments = json.load(open(os.path.join(book_dir, "ornaments.json"), encoding="utf-8"))
    groups = {g: [] for g in GROUP_ORDER}
    for o in ornaments:
        groups.setdefault(o["type"], []).append(o)
    for g in groups:
        groups[g].sort(key=lambda o: (o.get("letter", ""), o["file"]))

    cols = 8
    title_font = font(26)
    group_font = font(18)
    label_font = font(13)

    sections = []
    total_h = 60
    for g in GROUP_ORDER:
        items = groups.get(g, [])
        if not items:
            continue
        rows = (len(items) + cols - 1) // cols
        h = 34 + rows * (CELL + LABEL_H + PAD)
        sections.append((g, items, rows))
        total_h += h

    width = cols * (CELL + PAD) + PAD
    img = Image.new("RGBA", (width, total_h + 20), BG)
    draw = ImageDraw.Draw(img)
    y = 20
    draw.text((PAD, y), f"{book} — ornaments contact sheet (dark bg: any faint rectangle around a cell means leftover paper)", font=title_font, fill=(230, 225, 215, 255))
    y += 50

    for g, items, rows in sections:
        draw.text((PAD, y), f"{GROUP_TITLES.get(g, g)} ({len(items)})", font=group_font, fill=(214, 150, 120, 255))
        y += 34
        x = PAD
        col = 0
        for o in items:
            cell_path = os.path.join(book_dir, "ornaments", o["file"])
            try:
                thumb = Image.open(cell_path).convert("RGBA")
            except Exception:
                continue
            # Recolor ink -> near-white so it reads against the dark QA
            # background (the stored PNGs are dark ink, meant for a light
            # page); only the alpha channel carries real information here.
            arr = np.array(thumb)
            arr[:, :, 0] = 240
            arr[:, :, 1] = 236
            arr[:, :, 2] = 226
            thumb = Image.fromarray(arr, "RGBA")
            thumb.thumbnail((CELL - 8, CELL - 8))
            cell_img = Image.new("RGBA", (CELL, CELL), (255, 255, 255, 0))
            ox = (CELL - thumb.width) // 2
            oy = (CELL - thumb.height) // 2
            cell_img.alpha_composite(thumb, (ox, oy))
            # A faint but fully-opaque backdrop the exact size of the source
            # crop makes a leftover paper-rectangle defect visible even when
            # it's too subtle to see against the page background it's meant
            # for -- this is a diagnostic rendering, not the production one.
            draw.rectangle([x + ox, y + oy, x + ox + thumb.width, y + oy + thumb.height], outline=(70, 65, 60, 255))
            img.alpha_composite(cell_img, (x, y))
            label = o.get("letter") or o["file"].split("_", 1)[1].replace(".png", "")
            draw.text((x + 4, y + CELL), label, font=label_font, fill=(190, 184, 170, 255))
            col += 1
            x += CELL + PAD
            if col >= cols:
                col = 0
                x = PAD
                y += CELL + LABEL_H + PAD
        if col != 0:
            y += CELL + LABEL_H + PAD
        y += 10

    out_path = os.path.join(REPO, f"{book}_ornaments_contact_sheet.png")
    img.convert("RGB").save(out_path, quality=92)
    print(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "cartari")
