#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Alciato 1551: страница эмблемы целиком (с напечатанным текстом), без областей вычитания.

  python3 tools/build_alciato_pages.py [--out DIR] [--only alc15 ...]

По page_box из frames.json (репозиторий nfhours/alciato) собирает из фото ~/Projects/photos/alciato/frame_NNNN.jpg
  pages/<id>.webp       — страница, прозрачная бумага (multiply), высота ≤ 1500
  pages/<id>_full.webp  — для полноэкранного просмотра, высота ≤ 2000
Нарезка plates/ (с дырами вычитания) не затрагивается.
"""
import argparse, json, os, sys
import cv2
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import cut_crops as cc
import build_alciato as ba

def save(a, path, q, aq=55):
    from PIL import Image
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(a, "RGBA").save(path, "WEBP", quality=q, alpha_quality=aq, method=6)
    return os.path.getsize(path)

def do(args):
    r, out = args
    src = cv2.imread(ba.PHOTOS + r["frame"]); H, W = src.shape[:2]
    pb = r["page_box"]
    x0, y0, x1, y1 = ba.px({"x": pb[0], "y": pb[1], "w": pb[2], "h": pb[3]}, W, H)
    plate = cc.make_display_copy(src[y0:y1, x0:x1], cc.display_tone_for("alciato"))
    s = save(ba.resize_rgba(plate, ba.H_PLATE), "%s/pages/%s.webp" % (out, r["id"]), 60)
    s += save(ba.resize_rgba(plate, 2000), "%s/pages/%s_full.webp" % (out, r["id"]), 58)
    return r["id"], s

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default=os.path.expanduser("~/Projects/alciato/")); ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    fr = [r for r in json.load(open(a.out + "/frames.json")) if r["status"] == "ok" and (not a.only or r["id"] in a.only)]
    with Pool(4) as p: res = p.map(do, [(r, a.out) for r in fr])
    print("страниц:", len(res), "МБ:", round(sum(s for _, s in res) / 1e6, 1))

if __name__ == "__main__":
    main()
