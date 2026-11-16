#!/usr/bin/env python3
"""Ripa 1603: готовит _img/NNNN.jpg для чтения из копии Internet Archive (Duke):
~/Projects/photos/ripa1603/IA/NNNN.jpg (NNNN = номер скана Heidelberg). Высота 1800 px, JPEG 85.
Кадры IA — отдельные страницы без съёмочного фона, обрезка не нужна.
  python3 tools/prep.py --scans 50-69   (или 0050,0051)   |   без --scans — все
"""
import argparse, os
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.expanduser("~/Projects/photos/ripa1603/IA/")
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


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--scans"); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    scans = parse_scans(a.scans) if a.scans else range(1, 558)
    n = 0
    for s in scans:
        src = os.path.join(SRC, "%04d.jpg" % s)
        if not os.path.exists(src): print("нет", src); continue
        im = Image.open(src).convert("RGB")
        if im.height > H: im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
        im.save(os.path.join(OUT, "%04d.jpg" % s), "JPEG", quality=85); n += 1
    print("готово:", n, "->", OUT)


if __name__ == "__main__":
    main()
