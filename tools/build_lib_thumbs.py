#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Миниатюры для главной страницы библиотеки: books/<slug>/lib-thumb.webp (≤250×330, RGBA/RGB как у исходника).
Источник: Картари — чистый титул (engravings/title_clean_display.webp), Рипа — img/title-part1_display.webp,
остальные — титульный лист books/<slug>/title.webp.
    python3 tools/build_lib_thumbs.py"""
import json, os
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def first_img(slug):  # запасной вариант, если у книги нет титула
    d = json.load(open(f"{R}/books/{slug}/entries.json", encoding="utf8"))
    for e in (d["items"] if isinstance(d, dict) else d):
        if e.get("img"):
            n = e["img"][0].rsplit(".", 1)[0]
            for c in (f"img/{n}_display.webp", f"img/{e['img'][0]}"):
                if os.path.exists(f"{R}/books/{slug}/{c}"): return c
SRC = {"cartari": "engravings/title_clean_display.webp", "iconologie": "img/title-part1_display.webp", "grosson": "title.webp", "alciato": "title.webp", "verrien": "title.webp", "audran": "title.webp"}
for slug in ("cartari", "iconologie", "alciato", "verrien", "audran", "grosson"):
    src = SRC.get(slug) or first_img(slug)
    im = Image.open(f"{R}/books/{slug}/{src}")
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    s = min(250 / im.width, 330 / im.height); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    out = f"{R}/books/{slug}/lib-thumb.webp"; im.save(out, quality=80, method=6)
    print(slug, src, im.size, os.path.getsize(out))
