#!/usr/bin/env python3
"""Перенос разметки предметов Гроссона из редактора обрезки в данные сайта.

Редактор:   python3 tools/crop-editor/server.py grosson
            (47 таблиц с текущей разметкой; рамка подписана номером предмета; правки пишутся в
             books/grosson/_crops/crops.json)
Перенос:    python3 tools/build_grosson_crops.py            — только показать, что изменится
            python3 tools/build_grosson_crops.py --apply    — записать

Что делает --apply:
  * books/grosson/entries.json: для каждого предмета, чья рамка изменена в редакторе, обновляет `bbox`
    ([x, y, w, h] в процентах таблицы) — по нему сайт рисует метку на гравюре таблицы;
  * вырезки предметов books/grosson/img/<id>.webp (то, что видно в шторке предмета и на плитках «Таблиц»):
    режет из изображения таблицы (plate_img) по рамке, ширина 700 px, webp q82. Вырезка делается у каждого предмета
    с настоящей рамкой; у предмета с маркером вместо рамки (рамка не больше 12×12 % или занимает ≥ 85 % таблицы)
    «картинка» остаётся целой таблицей. Предмету, у которого вырезки ещё не было, `img` становится `<id>.webp`;
  * ВЫЧИТАНИЕ: в каждой вырезке области ДРУГИХ рамок той же таблицы, которые её пересекают (любой, даже
    малой площади) и НЕ крупнее неё (более крупная рамка, пересекающая предмет, не вычитается — иначе стёрся бы
    он сам, как у предмета, лежащего внутри большой рамки соседа), закрашиваются цветом бумаги (оценивается по самой вырезке: медиана светлых пикселей),
    край мягкий (≈ 3 px). Сама рамка себя не вычитает. Рамки «1-2», «2-3» — обычные рамки. Исключение: рамка,
    которая накрывает ≥ 90 % вырезки, не вычитается (иначе вырезка стала бы пустой) — это выводится в отчёте;
  * РАМКА-ЛАСТИК: рамка с подписью «−» — не предмет, а зона вычитания: её область закрашивается во всех
    вырезках, которые она пересекает. Ластики в отчёт «рамка без предмета» не попадают;
  * books/grosson/book.json: пересчитывает plates[].thumb (размер первой вырезки таблицы — по нему плитка «Таблиц»
    облегает изображение), если первая вырезка изменилась.

Сопоставление рамка ↔ предмет — по таблице и подписи рамки (= `num` предмета; комментарий после номера в скобках
игнорируется). Рамка без подписи сопоставляется с предметом без номера (их два: pl11-1, pl36-1). Скрипт НЕ создаёт и
не удаляет записи: рамка с номером, которого нет в данных, и предмет без рамки только выводятся в отчёте.
Листы, на которых в редакторе ничего не сохранено, не затрагиваются. Флажки «что-то не так» не читаются.

Параметры: --root <папка книги> (для проверок на копии), --all (оставлен для совместимости: вырезки теперь
всегда перерезаются целиком, результат одинаков при повторном запуске).
"""
import argparse
import json
import os
import re
import sys

import numpy as np
from PIL import Image, ImageFilter

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CROP_WIDTH = 700
WEBP_Q = 82
FEATHER = 1.2          # sigma размытия маски, px итоговой вырезки (≈ 3 px перехода)
MINUS = ("−", "-", "–", "—")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def is_eraser(label):
    return str(label or "").strip() in MINUS


def is_marker(box):
    """Маркер вместо рамки: не больше 12×12 % или занимает ≥ 85 % таблицы — вырезка не делается."""
    x, y, w, h = box
    return (w <= 12 and h <= 12) or (w * h / 100.0 >= 85)


def inter(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1])
    x1, y1 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    return (x0, y0, x1 - x0, y1 - y0) if x1 > x0 and y1 > y0 else None


def paper_fill(arr, mask):
    """Цвет бумаги: медиана светлых (верхние 40 % по яркости) пикселей вне маски."""
    keep = mask < 0.5
    if keep.sum() < 50:
        return np.array([236, 229, 212], dtype=float)
    px = arr[keep]
    lum = px @ np.array([0.299, 0.587, 0.114])
    sel = px[lum >= np.percentile(lum, 60)]
    return np.median(sel, axis=0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true", help="записать изменения (без него — только отчёт)")
    ap.add_argument("--all", action="store_true", help="(совместимость) вырезки и так перерезаются целиком")
    ap.add_argument("--root", default=os.path.join(REPO, "books", "grosson"), help="папка книги (по умолчанию books/grosson)")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    crops_path = os.path.join(root, "_crops", "crops.json")
    entries_path = os.path.join(root, "entries.json")
    book_path = os.path.join(root, "book.json")
    img_dir = os.path.join(root, "img")
    if not os.path.exists(crops_path):
        print("Нет %s — в редакторе ещё ничего не сохранено." % crops_path)
        return 0
    crops = load_json(crops_path)
    data = load_json(entries_path)
    items = data["items"]

    by_img = {}
    for it in items:
        by_img.setdefault(it["plate_img"], []).append(it)

    changes = []        # (entry, old bbox, new bbox)
    notes = []          # предупреждения
    erasers = {}        # лист -> [[x, y, w, h], ...]
    for img, e in crops.items():
        if img not in by_img:
            notes.append("лист %s: такой таблицы нет в данных — пропущен" % img)
            continue
        if e.get("seed"):
            continue
        if e.get("noPlate"):
            notes.append("лист %s: отмечено «нет гравюры» — игнорируется" % img)
            continue
        ents = by_img[img]
        boxes = e.get("boxes") or []
        labelled, unlabelled = {}, []
        for b in boxes:
            lb = str(b.get("label") or "").strip()
            if is_eraser(lb):
                erasers.setdefault(img, []).append([round(float(b[k]), 2) for k in ("x", "y", "w", "h")])
                continue
            m = re.match(r"^(\d+(?:\s*[-–]\s*\d+)?)(?=$|[\s(,;:.])", lb)   # подпись «1 (комментарий…)» → номер «1»
            if m and m.group(1) != lb:
                notes.append("лист %s: к подписи «%s…» дописан комментарий — для сопоставления взят номер «%s»" % (img, lb[:20], m.group(1)))
                lb = re.sub(r"\s*[-–]\s*", "-", m.group(1))
            if lb:
                if lb in labelled:
                    notes.append("лист %s: подпись «%s» повторяется — взята первая рамка" % (img, lb))
                    continue
                labelled[lb] = b
            else:
                unlabelled.append(b)
        used = set()
        for it in ents:
            num = str(it.get("num") or "").strip()
            if num:
                b = labelled.get(num)
                if b is not None:
                    used.add(num)
            else:
                b = unlabelled.pop(0) if unlabelled else None
            if b is None:
                notes.append("лист %s: у предмета %s (№ %s) нет рамки — запись оставлена как есть" % (img, it["id"], num or "—"))
                continue
            new = [round(max(0.0, min(100.0, float(b[k]))), 2) for k in ("x", "y", "w", "h")]
            old = [round(float(v), 2) for v in it["bbox"]]
            if any(abs(a - c) > 0.004 for a, c in zip(old, new)):
                changes.append((it, old, new))
        for lb in labelled:
            if lb not in used:
                notes.append("лист %s: рамка «%s» — в данных нет предмета с таким номером (запись не создаётся)" % (img, lb))
        for _ in unlabelled:
            notes.append("лист %s: рамка без подписи — некому соответствовать (запись не создаётся)" % img)

    # итоговые рамки (с учётом правок) — для вычитания и вырезок
    newbox = {it["id"]: [float(v) for v in it["bbox"]] for it in items}
    for it, old, new in changes:
        newbox[it["id"]] = new

    # план вырезок: у каждого предмета с настоящей рамкой; для каждой — что вычитается
    plan = []   # (entry, box, [(источник, прямоугольник пересечения в % таблицы)])
    skipped_markers = []
    skipped_pairs = 0
    for it in items:
        box = newbox[it["id"]]
        if is_marker(box):
            if it["img"][0] == it["plate_img"]:
                skipped_markers.append(it["id"])
            continue
        subs = []
        for other in by_img[it["plate_img"]]:
            if other is it:
                continue
            ob = newbox[other["id"]]
            if is_marker(ob):
                continue
            r = inter(box, ob)
            if r:
                if ob[2] * ob[3] > box[2] * box[3]:
                    skipped_pairs += 1      # более крупная рамка «накрывает» этот предмет — вычитать её значило бы стереть его самого
                    continue
                subs.append((other["id"], r))
        for k, eb in enumerate(erasers.get(it["plate_img"], [])):
            r = inter(box, eb)
            if r:
                subs.append(("ластик %d" % (k + 1), r))
        ok = []
        for src, r in subs:
            if r[2] * r[3] >= 0.9 * box[2] * box[3]:
                notes.append("%s: %s накрывает ≥ 90%% предмета — не вычитается (иначе вырезка пуста)" % (it["id"], src))
            else:
                ok.append((src, r))
        plan.append((it, box, ok))

    n_new = sum(1 for it, _, _ in plan if it["img"][0] == it["plate_img"])
    n_sub = sum(1 for _, _, s in plan if s)
    print("Листов с сохранёнными правками: %d; ластиков: %d" % (sum(1 for v in crops.values() if not v.get("seed")), sum(len(v) for v in erasers.values())))
    print("Рамок изменено (bbox): %d; вырезок: %d (новых: %d); вырезок с вычитанием: %d; маркеры без вырезки: %d; пересечений с более крупной рамкой не вычтено: %d" % (len(changes), len(plan), n_new, n_sub, len(skipped_markers), skipped_pairs))
    for it, box, subs in plan:
        if subs:
            print("  вычтено в %-9s № %-4s ← %s" % (it["id"], it.get("num") or "—", ", ".join(s for s, _ in subs)))
    for n in notes:
        print("  !", n)
    if not args.apply:
        print("Это отчёт. Записать: python3 tools/build_grosson_crops.py --apply")
        return 0

    for it, old, new in changes:
        it["bbox"] = new
    new_size = {}
    for it, box, subs in plan:
        src = Image.open(os.path.join(img_dir, it["plate_img"])).convert("RGB")
        W, H = src.size
        x0, y0 = int(round(box[0] / 100 * W)), int(round(box[1] / 100 * H))
        x1, y1 = int(round((box[0] + box[2]) / 100 * W)), int(round((box[1] + box[3]) / 100 * H))
        x1, y1 = max(x1, x0 + 2), max(y1, y0 + 2)
        crop = src.crop((x0, y0, min(x1, W), min(y1, H)))
        cw, ch = crop.size
        h = max(1, int(round(ch * CROP_WIDTH / cw)))
        crop = crop.resize((CROP_WIDTH, h), Image.LANCZOS)
        if subs:
            m = np.zeros((h, CROP_WIDTH), dtype=np.uint8)
            for _, r in subs:
                rx0 = int(np.floor((r[0] - box[0]) / box[2] * CROP_WIDTH)) - 1
                rx1 = int(np.ceil((r[0] + r[2] - box[0]) / box[2] * CROP_WIDTH)) + 1
                ry0 = int(np.floor((r[1] - box[1]) / box[3] * h)) - 1
                ry1 = int(np.ceil((r[1] + r[3] - box[1]) / box[3] * h)) + 1
                m[max(ry0, 0):min(ry1, h), max(rx0, 0):min(rx1, CROP_WIDTH)] = 255
            arr = np.asarray(crop, dtype=float)
            hard = m.astype(float) / 255.0
            fill = paper_fill(arr, hard)
            soft = np.asarray(Image.fromarray(m).filter(ImageFilter.GaussianBlur(FEATHER)), dtype=float)[..., None] / 255.0
            soft = np.maximum(soft, 0)
            out = arr * (1 - soft) + fill[None, None, :] * soft
            crop = Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))
        name = it["img"][0] if it["img"][0] != it["plate_img"] else it["id"] + ".webp"
        crop.save(os.path.join(img_dir, name), "WEBP", quality=WEBP_Q, method=6)
        it["img"] = [name]
        new_size[it["id"]] = list(crop.size)

    with open(entries_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # plates[].thumb — размер первой вырезки таблицы
    raw = open(book_path, "r", encoding="utf-8").read()
    book = json.loads(raw)
    firsts = {}
    for it in items:
        firsts.setdefault(str(it["plate"]), it)
    touched = 0
    for p in book.get("plates", []):
        f = firsts.get(str(p["n"]))
        if f and f["id"] in new_size and p.get("thumb") != new_size[f["id"]]:
            p["thumb"] = new_size[f["id"]]
            touched += 1
    if touched:
        tail = raw[raw.index('  "libAuthor"'):]
        s = json.dumps(book, ensure_ascii=False, indent=2)
        s = s[:s.index('  "libAuthor"')] + tail
        with open(book_path, "w", encoding="utf-8") as f:
            f.write(s)
    print("Записано: entries.json (%d bbox), вырезок %d (с вычитанием %d), plates[].thumb обновлено %d." % (len(changes), len(plan), n_sub, touched))
    print("Проверить на сайте: #/grosson/plates и таблицы с изменёнными предметами; затем commit books/grosson/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
