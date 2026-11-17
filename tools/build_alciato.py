#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Alciato 1551: нарезка гравюр и рамок строго по разметке books/alciato/_crops/crops.json.

  python3 tools/build_alciato.py [--out DIR] [--only frame_0020.jpg ...]

Разбор подписей рамок (разметка владельца):
  страница  — «Гравюра», «Гравюра рамка + текст внутри», «Front» (титул, кадр 7): вся страница с бордюром;
  pic       — «гбтир» / «гравюра без текста и рамки» / «… без рамки и текста»: гравюра без рамки и текста (с девизом, как размечено);
  вычитание — «Текстовая область для вычитания», «зона вычитания…»: прозрачная дыра в странице;
  концовка / буквица — остаются в странице (в таблицу пишутся отдельно).
Неподписанные рамки: самая большая (>80×80 %) — страница, затем по y: первая — pic, следующая — вычитание.

Для каждого кадра (в OUT):
  plates/<id>.webp       — страница, прозрачная бумага (как _display Картари), области вычитания прозрачны, высота ≤ 1500
  plates/<id>_full.webp  — то же в полном разрешении для полноэкранного просмотра (высота ≤ 2400)
  pics/<id>.webp         — гравюра без рамки и текста (если размечена), высота ≤ 1000
  thumb/<id>_t.webp      — миниатюра (ширина 240) — гравюра, а если её нет, то страница
  frames/<id>.webp       — вырезка рамки (вычитаются и «зоны вычитания для извлечения лишнего из рамки»), только у кадров с такими зонами
  frames.json            — таблица: кадр, id, страница, эмблема (по смещению кадр−6, пересверено по девизам), рамки, размеры
id = alc<печатная страница> для кадров 16–232 (кадр − 6, как у прежних img/alc<стр>.webp), fm<кадр> для кадров 7–15 (титул и вступление).
"""
import argparse, json, os, re, sys
import cv2, numpy as np
from multiprocessing import Pool
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cut_crops as cc  # make_display_copy, INK_COLOR, display_tone_for

ROOT = os.path.dirname(HERE)
BOOK = ROOT + "/books/alciato/"
PHOTOS = os.path.expanduser("~/Projects/photos/alciato/")
OFFSET = 6          # печатная страница = кадр − 6 (проверено по номерам и девизам)
H_PLATE, H_FULL, H_PIC, W_THUMB = 1500, 2400, 1000, 240


def kind(label):
    l = (label or "").strip().lower()
    if "вычитан" in l: return "text"
    if "концовк" in l and "без" not in l: return "tail"
    if "буквиц" in l: return "initial"
    if l in ("гбтир", "гтбир", "гб") or "без текста" in l or "без рамки" in l: return "pic"
    if l.startswith("гравюр") or l.startswith("front"): return "page"
    return ""


def classify(boxes):
    out = [dict(b, k=kind(b.get("label"))) for b in boxes]
    if not any(b["k"] == "page" for b in out):
        big = max(out, key=lambda b: b["w"] * b["h"])
        if big["w"] > 80 and big["h"] > 80 and not big["k"]: big["k"] = "page"
    rest = sorted([b for b in out if not b["k"] and b["w"] > 30], key=lambda b: b["y"])
    for b in rest:
        if not any(x["k"] == "pic" for x in out): b["k"] = "pic"
        elif not any(x["k"] == "text" for x in out): b["k"] = "text"
    return out


def frame_id(n):
    return "alc%d" % (n - OFFSET) if 16 <= n <= 232 else "fm%04d" % n


def px(b, W, H):
    return (round(b["x"] / 100 * W), round(b["y"] / 100 * H), round((b["x"] + b["w"]) / 100 * W), round((b["y"] + b["h"]) / 100 * H))


def resize_rgba(a, maxh):
    h, w = a.shape[:2]
    if h <= maxh: return a
    s = maxh / h
    out = np.zeros((maxh, round(w * s), 4), np.uint8)
    out[:, :, :3] = a[0, 0, :3]
    out[:, :, 3] = cv2.resize(a[:, :, 3], (out.shape[1], maxh), interpolation=cv2.INTER_AREA)
    return out


def save(a, path, q=72):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(a, "RGBA").save(path, "WEBP", quality=q, alpha_quality=90, method=6)
    return os.path.getsize(path)


def do_frame(args):
    key, rec, out = args
    n = int(re.search(r"(\d+)", key).group(1)); fid = frame_id(n)
    if not rec["boxes"]: return {"frame": key, "id": fid, "status": "noPlate"}
    bx = classify(rec["boxes"])
    page = next((b for b in bx if b["k"] == "page"), None)
    if not page: return {"frame": key, "id": fid, "status": "нет рамки страницы", "labels": [b.get("label") for b in rec["boxes"]]}
    src = cv2.imread(PHOTOS + key); H, W = src.shape[:2]
    tone = cc.display_tone_for("alciato")
    x0, y0, x1, y1 = px(page, W, H)
    crop = src[y0:y1, x0:x1]
    plate = cc.make_display_copy(crop, tone)
    # plates: вычитаются только текстовые области (подпись со словом «текст» или без подписи); «зона вычитания для извлечения лишнего
    # из рамки» и подобные относятся только к отдельной вырезке рамки (frames/<id>.webp), plates от неё не зависят
    def is_text(b): return b["k"] == "text" and (not (b.get("label") or "").strip() or "текст" in b["label"].lower())
    def subtract(img, boxes):
        al0 = img[:, :, 3].copy()
        for (a, b_, c_, d) in [px(b, W, H) for b in boxes]:
            ax, ay, bx_, by = max(0, a - x0), max(0, b_ - y0), min(x1 - x0, c_ - x0), min(y1 - y0, d - y0)
            img[ay:by, ax:bx_, 3] = 0
        for b in bx:                        # концовка остаётся, даже если лежит внутри области вычитания
            if b["k"] == "tail":
                a, b_, c_, d = px(b, W, H)
                ax, ay, bx_, by = max(0, a - x0), max(0, b_ - y0), min(x1 - x0, c_ - x0), min(y1 - y0, d - y0)
                img[ay:by, ax:bx_, 3] = al0[ay:by, ax:bx_]
        return img
    holes = [b for b in bx if is_text(b)]
    zones = [b for b in bx if b["k"] == "text" and not is_text(b)]
    frame_only = subtract(plate.copy(), holes + zones) if zones else None
    plate = subtract(plate, holes)
    rec_out = {"frame": key, "id": fid, "status": "ok", "page_box": [page["x"], page["y"], page["w"], page["h"]],
               "kinds": sorted(set(b["k"] for b in bx if b["k"])), "holes": len(holes), "zones": len(zones), "labels": [b.get("label") for b in rec["boxes"]]}
    sz = 0
    sz += save(resize_rgba(plate, H_PLATE), "%s/plates/%s.webp" % (out, fid))
    if frame_only is not None: sz += save(resize_rgba(frame_only, H_PLATE), "%s/frames/%s.webp" % (out, fid))
    sz += save(resize_rgba(plate, H_FULL), "%s/plates/%s_full.webp" % (out, fid), 70)
    thumb_src = plate
    pic = next((b for b in bx if b["k"] == "pic"), None)
    if pic:
        px0, py0, px1, py1 = px(pic, W, H)
        pimg = cc.make_display_copy(src[py0:py1, px0:px1], tone)
        sz += save(resize_rgba(pimg, H_PIC), "%s/pics/%s.webp" % (out, fid))
        thumb_src = pimg
        rec_out["pic_box"] = [pic["x"], pic["y"], pic["w"], pic["h"]]
    h, w = thumb_src.shape[:2]; tw = W_THUMB; th = max(1, round(h * tw / w))
    t = np.zeros((th, tw, 4), np.uint8); t[:, :, :3] = thumb_src[0, 0, :3]
    t[:, :, 3] = cv2.resize(thumb_src[:, :, 3], (tw, th), interpolation=cv2.INTER_AREA)
    sz += save(t, "%s/thumb/%s_t.webp" % (out, fid), 70)
    rec_out["bytes"] = sz
    rec_out["tails"] = [[b["x"], b["y"], b["w"], b["h"]] for b in bx if b["k"] == "tail"]
    rec_out["initials"] = [b.get("label") for b in bx if b["k"] == "initial"]
    return rec_out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default=os.path.expanduser("~/Projects/alciato/")); ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    crops = json.load(open(BOOK + "_crops/crops.json"))
    keys = a.only or sorted(crops)
    with Pool(4) as p:
        res = p.map(do_frame, [(k, crops[k], a.out) for k in keys])
    if not a.only: json.dump(res, open(a.out + "/frames_raw.json", "w"), ensure_ascii=False, indent=1)
    ok = [r for r in res if r["status"] == "ok"]
    print("кадров:", len(res), "нарезано:", len(ok), "noPlate:", sum(r["status"] == "noPlate" for r in res), "прочие:", [r["frame"] for r in res if r["status"] not in ("ok", "noPlate")])
    print("объём, МБ:", round(sum(r["bytes"] for r in ok) / 1e6, 1))


if __name__ == "__main__":
    main()
