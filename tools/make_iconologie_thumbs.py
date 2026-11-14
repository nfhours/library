#!/usr/bin/env python3
"""Миниатюры гравюр «Иконологии» для сетки «Гравюры»: 240 px по ширине, webp q50, на фоне бумаги (без прозрачности).
Берёт books/iconologie/img/<имя>_display.webp, пишет books/iconologie/thumb/<имя>_t.webp (имя — первая картинка статьи).
Запуск из корня репозитория: python3 tools/make_iconologie_thumbs.py"""
import json, os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BOOK = os.path.join(ROOT, "books", "iconologie")
W, Q, PAPER = 240, 50, (244, 239, 227, 255)
items = json.load(open(os.path.join(BOOK, "entries.json"), encoding="utf-8"))["items"]
out = os.path.join(BOOK, "thumb"); os.makedirs(out, exist_ok=True)
n = tot = 0
for it in items:
    if it.get("textOnly") or not it.get("img"): continue
    stem = os.path.splitext(it["img"][0])[0]
    src = os.path.join(BOOK, "img", stem + "_display.webp")
    if not os.path.exists(src): continue
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, PAPER); bg.alpha_composite(im)
    im = bg.convert("RGB"); im = im.resize((W, max(1, round(im.height * W / im.width))), Image.LANCZOS)
    dst = os.path.join(out, stem + "_t.webp"); im.save(dst, "WEBP", quality=Q, method=4)
    n += 1; tot += os.path.getsize(dst)
print(n, "миниатюр,", round(tot / 1e6, 2), "МБ")
