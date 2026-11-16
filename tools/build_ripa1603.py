#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Рипа 1603: нарезка гравюр из рамок crops.json (правятся в tools/crop-editor: python3 tools/crop-editor/server.py ripa1603).

  python3 tools/build_ripa1603.py

Читает books/ripa1603/_crops/crops.json (рамки в % исходного кадра ~/Projects/photos/ripa1603/<ключ>),
режет оригиналы и пишет в репозиторий данных ~/Projects/ripa-1603/ (публикуется на GitHub Pages):
  img/<скан>_<k>.webp        — гравюра (длинная сторона ≤ 1600)
  thumb/<скан>_<k>_t.webp    — миниатюра (ширина 240)
  engravings.json            — список: file, scan, printed, k, статьи-кандидаты (по entries.json)
Рамка с noPlate=true пропускается. Пересборка идемпотентна: файлы, которых больше нет в crops.json, удаляются.
"""
import json, os, re, sys
from PIL import Image

LIB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.expanduser("~/Projects/ripa-1603/")
PH = os.path.expanduser("~/Projects/photos/ripa1603/")
CROPS = LIB + "/books/ripa1603/_crops/crops.json"


def main():
    crops = json.load(open(CROPS))
    pm = {r["scan"]: r for r in json.load(open(OUT + "pagemap.json"))}
    ent = json.load(open(OUT + "entries.json"))["items"]
    by_page = {}
    for e in ent:
        if e.get("page"): by_page.setdefault(str(e["page"]), []).append(e["id"])
    for d in ("img", "thumb"): os.makedirs(OUT + d, exist_ok=True)
    keep, eng = set(), []
    for key in sorted(crops):
        rec = crops[key]
        if rec.get("noPlate") or not rec.get("boxes"): continue
        scan = int(re.search(r"(\d{4})_", key).group(1))
        im = Image.open(PH + key).convert("RGB"); W, H = im.size
        for k, b in enumerate(rec["boxes"], 1):
            x0, y0 = round(b["x"] / 100 * W), round(b["y"] / 100 * H)
            x1, y1 = round((b["x"] + b["w"]) / 100 * W), round((b["y"] + b["h"]) / 100 * H)
            c = im.crop((max(0, x0), max(0, y0), min(W, x1), min(H, y1)))
            c.thumbnail((1600, 1600), Image.LANCZOS)
            name = "%04d_%d" % (scan, k)
            c.save(OUT + "img/%s.webp" % name, quality=80, method=6)
            t = c.copy(); t.thumbnail((240, 360), Image.LANCZOS); t.save(OUT + "thumb/%s_t.webp" % name, quality=55, method=6)
            keep.add(name)
            pr = (pm.get(scan) or {}).get("printed")
            eng.append({"file": name, "scan": scan, "k": k, "printed": pr, "label": b.get("label"),
                        "articles_on_page": by_page.get(str(pr), []), "size": list(c.size)})
    for d, suf in (("img", ""), ("thumb", "_t")):
        for f in os.listdir(OUT + d):
            if f.endswith(".webp") and f[:-5 - len(suf)] not in keep: os.remove(OUT + d + "/" + f)
    json.dump(eng, open(OUT + "engravings.json", "w"), ensure_ascii=False, indent=0)
    print("гравюр:", len(eng))


if __name__ == "__main__":
    main()
