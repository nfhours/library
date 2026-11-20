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
    перерезает из изображения таблицы (plate_img) по новой рамке, ширина 700 px, webp q82 — только у тех предметов,
    у которых вырезка отдельная (img != plate_img); у предметов, у которых «картинка» — вся таблица, меняется только bbox;
  * books/grosson/book.json: пересчитывает plates[].thumb (размер первой вырезки таблицы — по нему плитка «Таблиц»
    облегает изображение), если первая вырезка изменилась.

Сопоставление рамка ↔ предмет — по таблице и подписи рамки (= `num` предмета). Рамка без подписи сопоставляется
с предметом без номера (их два: pl11-1, pl36-1). Чего скрипт НЕ делает: не создаёт и не удаляет записи — рамка с
номером, которого нет в данных, и предмет без рамки только выводятся в отчёте (текст предмета нужно добавить/убрать вручную).
Листы, на которых в редакторе ничего не сохранено, не затрагиваются.

Параметры: --all (перерезать ВСЕ отдельные вырезки по текущему bbox), --root <папка книги> (для проверок на копии).
"""
import argparse
import json
import os
import re
import sys

from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CROP_WIDTH = 700
WEBP_Q = 82


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true", help="записать изменения (без него — только отчёт)")
    ap.add_argument("--all", action="store_true", help="перерезать все отдельные вырезки по текущему bbox")
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
            m = re.match(r"^(\d+(?:\s*[-–]\s*\d+)?)(?=$|[\s(,;:.])", lb)   # подпись «1 (комментарий…)» → номер «1»; комментарий игнорируется
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
        no_num = [x for x in ents if not str(x.get("num") or "").strip()]
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

    # какие вырезки перерезать
    recut = []
    for it in items:
        if it["img"][0] == it["plate_img"]:
            continue
        ch = next((c for c in changes if c[0] is it), None)
        if ch or args.all:
            recut.append((it, ch[2] if ch else [round(float(v), 2) for v in it["bbox"]]))

    print("Листов с сохранёнными правками: %d" % sum(1 for v in crops.values() if not v.get("seed")))
    print("Рамок изменено (bbox): %d; вырезок к перерезке: %d" % (len(changes), len(recut)))
    for it, old, new in changes:
        print("  %-9s № %-3s %s → %s%s" % (it["id"], it.get("num") or "—", old, new, "" if it["img"][0] != it["plate_img"] else "  (только bbox)"))
    for n in notes:
        print("  !", n)
    if not args.apply:
        print("Это отчёт. Записать: python3 tools/build_grosson_crops.py --apply")
        return 0
    if not changes and not recut:
        print("Нечего записывать.")
        return 0

    for it, old, new in changes:
        it["bbox"] = new
    new_size = {}
    for it, box in recut:
        src = Image.open(os.path.join(img_dir, it["plate_img"])).convert("RGB")
        W, H = src.size
        x0, y0 = int(round(box[0] / 100 * W)), int(round(box[1] / 100 * H))
        x1, y1 = int(round((box[0] + box[2]) / 100 * W)), int(round((box[1] + box[3]) / 100 * H))
        x1, y1 = max(x1, x0 + 2), max(y1, y0 + 2)
        crop = src.crop((x0, y0, min(x1, W), min(y1, H)))
        h = max(1, int(round(crop.size[1] * CROP_WIDTH / crop.size[0])))
        crop = crop.resize((CROP_WIDTH, h), Image.LANCZOS)
        out = os.path.join(img_dir, it["img"][0])
        crop.save(out, "WEBP", quality=WEBP_Q, method=6)
        new_size[it["id"]] = list(crop.size)
        print("  вырезка %s → %s (%dx%d)" % (it["id"], it["img"][0], crop.size[0], crop.size[1]))

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
    print("Записано: entries.json (%d bbox), вырезок %d, plates[].thumb обновлено %d." % (len(changes), len(recut), touched))
    print("Проверить на сайте: #/grosson/plates и таблицы с изменёнными предметами; затем commit books/grosson/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
