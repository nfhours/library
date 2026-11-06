#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает books/cartari/plates.json — карточки гравюр — заново, без старой карты.

Источники (и только они):
  скан страницы        books/cartari/_crops/crops.json (рамки Андрея как есть), ~/Projects/photos/cartari/,
                       вырезанные файлы books/cartari/engravings/*_display.webp (+ полноразмерные в photos/…/engravings-full/)
  транскрипция         books/cartari/_text/pages/NNNN.md  (метка [ГРАВЮРА: …] — итальянская подпись)
  перевод              books/cartari/_translation/ru/*.md  (глава, блок, русская подпись, абзацы-объяснения)
  имена                books/cartari/_translation/GLOSSARY.tsv (учтены при составлении заголовков)

Решения, которые нельзя вывести механически (короткий русский заголовок, блок для гравюры без печатной подписи,
абзацы-объяснения, подпись-блок для гравюры с подписью), лежат в books/cartari/_text/plates_manual.json:
    {"<id>": {"title": …, "at": "cap"|"before", "block": N, "expl": [N, …], "chapter": slug (если вне диапазона сканов), …}}
Скрипт проверяет каждое такое решение по тексту перевода (блок существует, тип подходящий, глава по диапазону
сканов) и падает, если что-то не сходится.

    python3 tools/build_plates.py            # пишет books/cartari/plates.json
    python3 tools/build_plates.py --report   # только отчёт «пункта 0» (гравюры ↔ файлы)

Схема plates.json:
  {"version": 2, "plates": [ {id, scan, page, file, w, h, shared_file, chapter, at, block, it_caption, ru_caption,
                              title, expl:[{chapter, block}], …}, … ]}
  id        e<скан> (e0072), для двух гравюр на одной странице — с буквой (e0598a, e0598b)
  scan      номер скана (1-based, как в _text/pages/NNNN.md)
  page      печатная страница издания 1626 (из PAGES.tsv: «30», «XII», «1a», «Titelblatt_2r»)
  file      имя вырезанного файла без расширения (префикс = номер файла на 1 меньше номера скана)
  at/block  как гравюра стоит в главе: at=cap — это подпись-блок (cap), at=before — перед блоком block
"""
import argparse, csv, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "books", "cartari")
PHOTOS = os.path.expanduser("~/Projects/photos/cartari")
sys.path.insert(0, os.path.join(ROOT, "tools"))
import build_chapters as bc  # noqa: E402

CYR = re.compile("[А-Яа-яЁё]")
MARK = re.compile(r"\[ГРАВЮРА:? ?([^\]]*)\]")
INSCR = re.compile(r"\s*\(надписи на гравюре:[^)]*\)\s*$")
PLATE_TYPES = ("гравюра", "без_подписи")
# Рамка Андрея типа «концовка», но на скане — полноценная гравюра, и файл вырезан (транскрипция: гравюра).
EXTRA_PLATE_KEYS = {"0564_523"}
# Две гравюры в одной рамке-файле: ключ скана → буквы.
TWO_PLATES = {"0597_552": ("a", "b")}


def load_pages():
    rows = {}
    with open(os.path.join(BOOK, "_text", "PAGES.tsv"), encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter="\t"):
            rows[r["scan"]] = r["label"]
    return rows


def clean_caption(t):
    """Как напечатано: переносы склеены, {напечатано|исправление} → напечатано, курсивные звёздочки убраны."""
    t = re.sub(r"\{([^|{}]*)\|[^{}]*\}", r"\1", t)
    t = re.sub(r"\*\s*\n\s*\*", "\n", t)
    t = re.sub(r"-\n", "", t).replace("\n", " ")
    t = t.replace("*", "")
    return re.sub(r"\s+", " ", t).strip()


def markers(scan):
    """[(текст метки, курсивный абзац сразу после метки или None)] — подпись бывает в метке или курсивом под ней."""
    s = open(os.path.join(BOOK, "_text", "pages", scan + ".md"), encoding="utf-8").read()
    paras = [p.strip() for p in re.split(r"\n\s*\n", s)]
    out = []
    for i, p in enumerate(paras):
        m = MARK.fullmatch(p)
        if not m:
            continue
        nxt = paras[i + 1] if i + 1 < len(paras) else ""
        ital = nxt if nxt and all(l.startswith("*") and l.endswith("*") for l in nxt.split("\n")) and not CYR.search(nxt) else None
        out.append((m.group(1).strip(), ital))
    return out


def caption_of(marker, ital=None):
    """Итальянская подпись ровно как напечатана; описание по-русски и «без подписи» — не подпись."""
    if marker.startswith("без подписи"):
        return None
    t = INSCR.sub("", marker).strip()
    if CYR.search(t):
        m = re.match(r"^(A carte \d+)\s*—", t)  # «A carte 3 — вставная …»: напечатана только ссылка
        if m:
            return m.group(1)
        return clean_caption(ital) if ital else None
    return clean_caption(t)


def enumerate_engravings():
    """Гравюры по сканам: рамки Андрея (гравюра, без_подписи) + EXTRA_PLATE_KEYS; файлы — по имени ключа скана."""
    crops = json.load(open(os.path.join(BOOK, "_crops", "crops.json"), encoding="utf-8"))
    engr = {e["file"].rsplit(".", 1)[0]: e for e in json.load(open(os.path.join(BOOK, "engravings.json"), encoding="utf-8"))}
    pages = load_pages()
    out = []
    for key in sorted(crops):
        stem = key[:-4]
        boxes = [b for b in crops[key]["boxes"] if b["type"] in PLATE_TYPES]
        if not boxes and stem not in EXTRA_PLATE_KEYS:
            continue
        scan = "%04d" % (int(stem[:4]) + 1)
        fstem = next((s for s in (stem, stem + "_0") if s in engr), None)
        mk = markers(scan)
        letters = TWO_PLATES.get(stem)
        n = len(letters) if letters else 1
        if len(mk) != n:
            sys.exit("скан %s: меток [ГРАВЮРА] %d, ожидалось %d" % (scan, len(mk), n))
        for i in range(n):
            e = engr.get(fstem) if fstem else None
            out.append({
                "id": "e" + scan + (letters[i] if letters else ""),
                "scan": scan, "page": pages[scan], "crops_key": key,
                "file": fstem, "w": e["width"] if e else None, "h": e["height"] if e else None,
                "shared_file": bool(letters),
                "box_type": (boxes[0]["type"] if boxes else crops[key]["boxes"][0]["type"]),
                "it_caption": caption_of(*mk[i]),
                "marker": mk[i][0],
            })
    return out


def report():
    es = enumerate_engravings()
    files = sorted(f[:-4] for f in os.listdir(os.path.join(PHOTOS, "engravings-full")))
    disp = sorted(f[:-len("_display.webp")] for f in os.listdir(os.path.join(BOOK, "engravings")) if f.endswith("_display.webp"))
    used = {}
    for e in es:
        if e["file"]:
            used.setdefault(e["file"], []).append(e["id"])
    print("гравюр на сканах: %d (страниц %d); файлов full: %d, display: %d" % (len(es), len({e["scan"] for e in es}), len(files), len(disp)))
    print("без файла:", [e["id"] for e in es if not e["file"]])
    print("файлы без гравюры на скане:", [f for f in files if f not in used])
    print("файлы, используемые дважды:", {f: v for f, v in used.items() if len(v) > 1})
    pages = load_pages()
    bad = [f for f in files if pages.get("%04d" % (int(f[:4]) + 1)) != re.sub(r"_0$", "", f[5:])]
    print("файлы с неверной страницей (метка в имени ≠ метка скана N+1):", bad)
    print("рамка не «гравюра», но гравюра:", [e["id"] for e in es if e["box_type"] not in PLATE_TYPES])


def ensure_thumbs(plates):
    """Миниатюры сетки (ширина 340, WebP) — для файлов, у которых их ещё нет."""
    from PIL import Image
    d = os.path.join(BOOK, "engravings")
    os.makedirs(os.path.join(d, "thumb"), exist_ok=True)
    made = 0
    for p in plates:
        t = os.path.join(d, "thumb", p["file"] + "_t.webp")
        if os.path.exists(t):
            continue
        im = Image.open(os.path.join(d, p["file"] + "_display.webp")).convert("RGBA")
        im.thumbnail((340, 10000), Image.LANCZOS)
        im.save(t, "WEBP", quality=80)
        made += 1
    return made


def old_ids_by_file():
    """Старые адреса карточек: id записи старой карты → файл; нужен только для редиректов #/cartari/plate/<старый id>."""
    m = json.load(open(os.path.join(BOOK, "engraving_map.json"), encoding="utf-8"))
    out = {}
    for oid, f in m.items():
        out.setdefault(f.rsplit(".", 1)[0], []).append(oid)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", action="store_true")
    ap.add_argument("--out", default=os.path.join(BOOK, "plates.json"))
    a = ap.parse_args()
    if a.report:
        return report()
    es = enumerate_engravings()
    manual = json.load(open(os.path.join(BOOK, "_text", "plates_manual.json"), encoding="utf-8"))
    chapters = {}
    for slug in bc.ORDER:
        chapters[slug] = bc.parse_chapter(os.path.join(BOOK, "_translation", "ru", slug + ".md"), slug)
    errs = []

    def chapter_of(scan, m):
        if m.get("chapter"):
            return m["chapter"]
        n = int(scan)
        hit = [s for s in bc.ORDER if chapters[s]["scans"] and chapters[s]["scans"][0] <= n <= chapters[s]["scans"][1]]
        return hit[0] if hit else None

    old = old_ids_by_file()
    plates = []
    for e in es:
        m = manual.get(e["id"])
        if not m:
            errs.append("%s: нет записи в plates_manual.json" % e["id"])
            continue
        slug = chapter_of(e["scan"], m)
        blocks = chapters[slug]["blocks"] if slug else []
        at, blk = m["at"], m["block"]
        b = blocks[blk - 1] if 0 < blk <= len(blocks) else None
        ru = None
        if b is None:
            errs.append("%s: нет блока %s в главе %s" % (e["id"], blk, slug))
        elif at == "cap":
            if b["t"] != "cap":
                errs.append("%s: блок %s (%s) — не подпись" % (e["id"], blk, slug))
            else:
                ru = b["text"]
        elif at != "before":
            errs.append("%s: at=%s" % (e["id"], at))
        cf = m.get("caption_from")
        if cf:
            cb = chapters[cf[0]]["blocks"][cf[1] - 1]
            if cb["t"] != "cap":
                errs.append("%s: caption_from %s/%s — не подпись" % (e["id"], cf[0], cf[1]))
            else:
                ru = cb["text"]
        expl = []
        for ref in m.get("expl", []):
            es_slug, es_n = (ref if isinstance(ref, list) else [slug, ref])
            bl = chapters[es_slug]["blocks"]
            if not (0 < es_n <= len(bl)) or bl[es_n - 1]["t"] not in ("p", "quote"):
                errs.append("%s: объяснение %s/%s — не абзац" % (e["id"], es_slug, es_n))
            expl.append({"chapter": es_slug, "block": es_n})
        if not 0 <= len(expl) <= 3:
            errs.append("%s: объяснений %d" % (e["id"], len(expl)))
        rec = {k: e[k] for k in ("id", "scan", "page", "file", "w", "h", "shared_file")}
        rec.update({"chapter": slug, "at": at, "block": blk, "it_caption": e["it_caption"], "ru_caption": ru,
                    "title": m["title"], "expl": expl})
        if cf:
            rec["cap_from"] = {"chapter": cf[0], "block": cf[1]}
        if m.get("note"):
            rec["note"] = m["note"]
        if e["file"] and not e["id"].endswith("b"):
            rec["old_ids"] = sorted(old.get(e["file"], []))
        plates.append(rec)
    if errs:
        print("\n".join(errs[:60]))
        sys.exit("ошибок: %d" % len(errs))
    with open(a.out, "w", encoding="utf-8") as f:
        f.write('{"version":2,"plates":[\n')
        f.write(",\n".join(json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in plates))
        f.write("\n]}\n")
    print("миниатюр создано:", ensure_thumbs(plates))
    print("записано %s: гравюр %d, с печатной подписью %d, с объяснением %d"
          % (os.path.relpath(a.out, ROOT), len(plates), sum(1 for p in plates if p["it_caption"]),
             sum(1 for p in plates if p["expl"])))


if __name__ == "__main__":
    main()
