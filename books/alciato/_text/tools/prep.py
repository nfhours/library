#!/usr/bin/env python3
"""Alciato 1551: готовит _img/NNNN.jpg для чтения из фото экземпляра пользователя:
~/Projects/photos/alciato/frame_NNNN.jpg (NNNN = номер кадра). Кадр целиком (с полями и краем соседней
страницы — читать только свою страницу), высота 1800 px, JPEG 85.
  python3 tools/prep.py --scans 7-26   (или 0007,0008)   |   без --scans — все из PAGES.tsv
"""
import argparse, os
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.expanduser("~/Projects/photos/alciato/")
OUT = os.path.join(HERE, "_img")
H = 1800


def parse_scans(s):
    out = []
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-"); out += list(range(int(a), int(b) + 1))
        else:
            out.append(int(part))
    return out


def all_scans():
    rows = open(os.path.join(HERE, "PAGES.tsv"), encoding="utf-8").read().split("\n")[1:]
    return [int(r.split("\t")[0]) for r in rows if r.strip()]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--scans"); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    scans = parse_scans(a.scans) if a.scans else all_scans()
    n = 0
    for s in scans:
        src = os.path.join(SRC, "frame_%04d.jpg" % s)
        if not os.path.exists(src): print("нет", src); continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        if im.height > H: im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
        im.save(os.path.join(OUT, "%04d.jpg" % s), "JPEG", quality=85); n += 1
    print("готово:", n, "->", OUT)


if __name__ == "__main__":
    main()
