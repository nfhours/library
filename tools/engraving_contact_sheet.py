#!/usr/bin/env python3
"""Before/after contact sheet for engraving "_display" tone normalization:
picks engravings spanning the full range from palest to darkest raw
impression, and shows each one's raw crop next to its _display copy
composited on the site's own page color, so the normalization's
uniformity across impressions can be judged directly."""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE_BG = (236, 229, 212)
SHEET_BG = (247, 243, 233)
CELL = 200
PAD = 16
LABEL_H = 18
N_SAMPLES = 24


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


def darkness_score(path):
    im = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if im is None:
        return None
    small = cv2.resize(im, (150, 150))
    return float(small.mean())


def pick_spread(engravings, book_dir, n):
    scored = []
    for e in engravings:
        raw_path = os.path.join(book_dir, "engravings", e["file"].replace(e["file"].split(".")[-1], "jpg")) \
            if e["file"].endswith(".webp") else os.path.join(book_dir, "engravings", e["file"])
        # "file" in engravings.json is the raw jpg (display is separate)
        raw_path = os.path.join(book_dir, "engravings", e["file"])
        score = darkness_score(raw_path)
        if score is not None:
            scored.append((score, e))
    scored.sort(key=lambda t: t[0])  # low mean = dark, high mean = pale
    if len(scored) <= n:
        return scored
    idxs = [round(i * (len(scored) - 1) / (n - 1)) for i in range(n)]
    return [scored[i] for i in idxs]


def tier_label(score, lo, hi):
    frac = (score - lo) / max(hi - lo, 1)
    if frac < 0.33:
        return "тёмный"
    if frac < 0.66:
        return "средний"
    return "бледный"


def build(book):
    book_dir = os.path.join(REPO, "books", book)
    engravings = json.load(open(os.path.join(book_dir, "engravings.json"), encoding="utf-8"))
    sample = pick_spread(engravings, book_dir, N_SAMPLES)
    scores = [s for s, _ in sample]
    lo, hi = min(scores), max(scores)

    cols = 4
    pair_w = CELL * 2 + 6
    rows = (len(sample) + cols - 1) // cols
    label_font = font(13)
    title_font = font(24)

    width = cols * (pair_w + PAD) + PAD
    height = 70 + rows * (CELL + LABEL_H * 2 + PAD)
    img = Image.new("RGB", (width, height), SHEET_BG)
    draw = ImageDraw.Draw(img)
    draw.text((PAD, 18), f"{book} — engraving _display before/after, {len(sample)} impressions palest→darkest",
               font=title_font, fill=(30, 25, 20))

    for i, (score, e) in enumerate(sample):
        col, row = i % cols, i // cols
        x = PAD + col * (pair_w + PAD)
        y = 70 + row * (CELL + LABEL_H * 2 + PAD)

        raw_path = os.path.join(book_dir, "engravings", e["file"])
        raw = Image.open(raw_path).convert("RGB")
        raw.thumbnail((CELL, CELL))
        cell_before = Image.new("RGB", (CELL, CELL), (255, 255, 255))
        cell_before.paste(raw, ((CELL - raw.width) // 2, (CELL - raw.height) // 2))
        img.paste(cell_before, (x, y))

        disp_path = os.path.join(book_dir, "engravings", e["display"])
        disp = Image.open(disp_path).convert("RGBA")
        disp.thumbnail((CELL, CELL))
        cell_after = Image.new("RGBA", (CELL, CELL), PAGE_BG + (255,))
        cell_after.alpha_composite(disp, ((CELL - disp.width) // 2, (CELL - disp.height) // 2))
        img.paste(cell_after.convert("RGB"), (x + CELL + 6, y))

        draw.text((x, y + CELL + 2), "до", font=label_font, fill=(90, 85, 75))
        draw.text((x + CELL + 6, y + CELL + 2), "после", font=label_font, fill=(90, 85, 75))
        tier = tier_label(score, lo, hi)
        draw.text((x, y + CELL + LABEL_H), f"{e['source']} · {tier}", font=label_font, fill=(60, 55, 48))

    out_path = os.path.join(REPO, f"{book}_engraving_tone_contact_sheet.png")
    img.save(out_path)
    print(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "cartari")
