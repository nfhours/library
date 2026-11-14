#!/usr/bin/env python3
"""Миниатюры сканов (~400px по ширине, webp) для просмотрщика сканов: books/<slug>/scans/thumb/NNNN.webp.
Запуск: python3 tools/make_scan_thumbs.py cartari   (существующие пропускаются)"""
import sys, pathlib
from PIL import Image
slug = sys.argv[1] if len(sys.argv) > 1 else "cartari"
src = pathlib.Path(__file__).resolve().parent.parent / "books" / slug / "scans"
dst = src / "thumb"; dst.mkdir(exist_ok=True)
n = 0
for f in sorted(src.glob("*.webp")):
    out = dst / f.name
    if out.exists(): continue
    im = Image.open(f); w = 400; h = round(im.height * w / im.width)
    im.convert("RGB").resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=68, method=6); n += 1
print("made", n)
