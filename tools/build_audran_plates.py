#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Одран: обрезка 30 таблиц по краю гравированного поля и сборка картинок.

  python3 tools/build_audran_plates.py --detect   # первичная разметка: books/audran/_crops/crops.json (рамки в % исходного кадра)
                                                  # и angles.json (наклон, градусы); существующие рамки НЕ перезаписываются без --force
  python3 tools/build_audran_plates.py --scans    # сканы предисловия (кадры 0007–0011): books/audran/scans/NNNN.webp, scans/thumb, scans/sizes.json
  python3 tools/build_audran_plates.py            # сборка по crops.json: img/audN.webp (длинная сторона 1600, бумага выровнена до белого — для multiply), img/audN_full.webp (2400, исходный тон — для полноэкранного просмотра на тёмном фоне),
                                                  # thumb/audN_t.webp (240 по ширине)

Таблица N = кадр ~/Projects/photos/audran/00(11+2N).jpg. Листы таблиц 21–30 в кадре лежат боком: после обрезки их поворачивают
на 90° по часовой, чтобы таблица читалась прямо. Рамки правятся вручную в tools/crop-editor (python3 tools/crop-editor/server.py audran);
сборка берёт рамку «как есть» (в процентах исходного кадра), затем выравнивает наклон (angles.json) и режет по рамке.
"""
import argparse, json, os, sys
import cv2, numpy as np
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = R + "/books/audran/"
PH = os.path.expanduser("~/Projects/photos/audran/")
CROPS, ANGLES = B + "_crops/crops.json", B + "_crops/angles.json"
LAND_FROM = 21   # с этой таблицы лист лежит боком


def frame(n): return "%04d.jpg" % (11 + 2 * n)
def rot_cw(a): return np.ascontiguousarray(np.rot90(a, -1))


def paper_contour(g):
    s = cv2.GaussianBlur(cv2.resize(g, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA), (0, 0), 3)
    t, _ = cv2.threshold(s, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    m = cv2.morphologyEx((s > t).astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return max(cs, key=cv2.contourArea) * 4


def ink_mask(g):
    bg = cv2.GaussianBlur(cv2.dilate(g, np.ones((25, 25), np.uint8)), (0, 0), 15).astype(np.float32)
    return (g.astype(np.float32) < bg * 0.78).astype(np.uint8)


def est_angle(ink):
    s = cv2.resize(ink * 255, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA).astype(np.float32)
    best = (0.0, -1.0)
    for a in np.arange(-2.5, 2.51, 0.1):
        M = cv2.getRotationMatrix2D((s.shape[1] / 2, s.shape[0] / 2), a, 1)
        v = np.var(np.diff(cv2.warpAffine(s, M, (s.shape[1], s.shape[0])).sum(1)))
        if v > best[1] + 1e-6: best = (a, v)
    return best[0]


def detect(n):
    im = cv2.imread(PH + frame(n)); H0, W0 = im.shape[:2]
    mask = cv2.drawContours(np.zeros((H0, W0), np.uint8), [paper_contour(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))], -1, 255, -1)
    O = rot_cw(im) if n >= LAND_FROM else im
    mo = rot_cw(mask) if n >= LAND_FROM else mask
    g = cv2.cvtColor(O, cv2.COLOR_BGR2GRAY); h, w = g.shape
    sx, sy, sw, sh = cv2.boundingRect(mo)
    inner = (sx + int(.03 * sw), sy + int(.03 * sh), sx + sw - int(.03 * sw), sy + sh - int(.03 * sh))
    ink = ink_mask(g); m = np.zeros_like(ink); m[inner[1]:inner[3], inner[0]:inner[2]] = 1; ink *= m
    ang = est_angle(ink)
    inkr = cv2.warpAffine(ink, cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1), (w, h), flags=cv2.INTER_NEAREST)
    d = cv2.dilate(inkr, np.ones((15, 15), np.uint8)); nl, lab, st, _ = cv2.connectedComponentsWithStats(d, 8)
    keep = np.zeros_like(d)
    for i in range(1, nl):
        x, y, ww, hh, a = st[i]
        if a > 3000 and (ww > 60 or hh > 60): keep[lab == i] = 1
    ys, xs = np.where(keep > 0)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    px, py = int(.025 * (x1 - x0)), int(.025 * (y1 - y0))
    bx0, by0, bx1, by1 = max(inner[0], x0 - px), max(inner[1], y0 - py), min(inner[2], x1 + px), min(inner[3], y1 + py)
    # рамка в координатах исходного кадра
    if n >= LAND_FROM: ox, oy, ow, oh = by0, H0 - bx1, by1 - by0, bx1 - bx0   # поворот по часовой: (x,y)->(H0-1-y, x)
    else: ox, oy, ow, oh = bx0, by0, bx1 - bx0, by1 - by0
    return dict(x=round(100.0 * ox / W0, 2), y=round(100.0 * oy / H0, 2), w=round(100.0 * ow / W0, 2), h=round(100.0 * oh / H0, 2), label=str(n)), round(float(ang), 2)


def flatten_paper(c):
    """Выравнивает бумагу листа до белого (по каждому каналу делит на локальный уровень бумаги): на странице гравюра кладётся
    через mix-blend-mode:multiply, бумага сливается с бумагой сайта, линии и цифры остаются как были."""
    f = c.astype(np.float32)
    out = np.empty_like(f)
    for k in range(3):
        bg = cv2.GaussianBlur(cv2.dilate(f[..., k], cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))), (0, 0), 30)
        out[..., k] = f[..., k] / np.maximum(bg, 1.0)
    for k in range(3):   # уровень бумаги (медиана светлых пикселей) → 255
        lev = float(np.percentile(out[..., k], 60))
        out[..., k] = out[..., k] / max(lev, 0.5)
    return (np.clip(out, 0, 1) * 255.0).astype(np.uint8)


def cut(n, box, ang, long_side, flat=False):
    im = cv2.imread(PH + frame(n)); H0, W0 = im.shape[:2]
    x, y, w, h = [box[k] / 100.0 for k in ("x", "y", "w", "h")]
    X0, Y0, X1, Y1 = int(x * W0), int(y * H0), int((x + w) * W0), int((y + h) * H0)
    tol = int(abs(np.sin(np.radians(ang))) * max(X1 - X0, Y1 - Y0)) + 6
    ax0, ay0, ax1, ay1 = max(0, X0 - tol), max(0, Y0 - tol), min(W0, X1 + tol), min(H0, Y1 + tol)
    c = im[ay0:ay1, ax0:ax1]
    # поворот вокруг центра рамки и снова срез: углы заполняются краем (бумагой)
    if abs(ang) > 0.05:
        M = cv2.getRotationMatrix2D((c.shape[1] / 2, c.shape[0] / 2), ang, 1)
        c = cv2.warpAffine(c, M, (c.shape[1], c.shape[0]), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    c = c[Y0 - ay0:Y1 - ay0, X0 - ax0:X1 - ax0]
    if flat: c = flatten_paper(c)
    if n >= LAND_FROM: c = rot_cw(c)
    pil = Image.fromarray(cv2.cvtColor(c, cv2.COLOR_BGR2RGB))
    s = long_side / max(pil.size)
    return pil.resize((round(pil.width * s), round(pil.height * s)), Image.LANCZOS) if s < 1 else pil


PREF_FRAMES = range(7, 12)


def build_scans():
    """Лист вырезается по краю бумаги (без фона сканера и кромки книги) с полем ~1%, высота 1600, миниатюра 300 px по ширине."""
    os.makedirs(B + "scans/thumb", exist_ok=True); sizes = {}
    for k in PREF_FRAMES:
        im = cv2.imread(PH + "%04d.jpg" % k)
        x, y, w, h = cv2.boundingRect(paper_contour(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)))
        mx, my = int(.01 * w), int(.01 * h)
        c = im[max(0, y - my):y + h + my, max(0, x - mx):x + w + mx]
        pil = Image.fromarray(cv2.cvtColor(c, cv2.COLOR_BGR2RGB)); pil = pil.resize((round(pil.width * 1600 / pil.height), 1600), Image.LANCZOS)
        pil.save(B + "scans/%04d.webp" % k, quality=80, method=6); sizes["%04d" % k] = list(pil.size)
        t = pil.copy(); t.thumbnail((300, 450), Image.LANCZOS); t.save(B + "scans/thumb/%04d.webp" % k, quality=55, method=6)
    json.dump(sizes, open(B + "scans/sizes.json", "w"), indent=0)
    print("сканы предисловия:", sizes)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--detect", action="store_true"); ap.add_argument("--force", action="store_true"); ap.add_argument("--scans", action="store_true")
    a = ap.parse_args()
    if a.scans: build_scans(); return
    os.makedirs(B + "_crops", exist_ok=True); os.makedirs(B + "thumb", exist_ok=True)
    crops = json.load(open(CROPS, encoding="utf8")) if os.path.exists(CROPS) else {}
    angles = json.load(open(ANGLES, encoding="utf8")) if os.path.exists(ANGLES) else {}
    if a.detect:
        for n in range(1, 31):
            f = frame(n)
            if f in crops and crops[f].get("boxes") and not a.force: continue
            box, ang = detect(n)
            crops[f] = {"boxes": [box], "noPlate": False, "flagged": False, "updatedAt": None}; angles[f] = ang
            print(n, f, box, ang)
        json.dump(crops, open(CROPS, "w", encoding="utf8"), ensure_ascii=False, indent=2); open(CROPS, "a").write("\n")
        json.dump(angles, open(ANGLES, "w", encoding="utf8"), indent=2); open(ANGLES, "a").write("\n")
        return
    for n in range(1, 31):
        f = frame(n); e = crops.get(f)
        if not e or not e.get("boxes"): print("нет рамки", f); continue
        ang = float(angles.get(f, 0.0))
        cut(n, e["boxes"][0], ang, 1600, True).save(B + "img/aud%d.webp" % n, quality=82, method=6)
        cut(n, e["boxes"][0], ang, 2400).save(B + "img/aud%d_full.webp" % n, quality=72, method=6)
        t = cut(n, e["boxes"][0], ang, 1600, True); t.thumbnail((240, 360), Image.LANCZOS); t.save(B + "thumb/aud%d_t.webp" % n, quality=55, method=6)
    print("готово")


if __name__ == "__main__":
    main()
