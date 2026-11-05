#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает books/<book>/chapters_ru.json из books/<book>/_translation/ru/*.md.

    python3 tools/build_chapters.py                 # только diana (по умолчанию)
    python3 tools/build_chapters.py diana giove     # перечисленные главы
    python3 tools/build_chapters.py --all           # все 25 частей
    python3 tools/build_chapters.py --out /tmp/x.json diana

Раздел «## Сомнительные места» (заметки переводчика) как отдельный текст на сайт не попадает ни в одной
главе, но его пункты, где есть «[?]», становятся пояснениями к значкам [?] в тексте: у блока появляется
поле qm — список по порядку вхождений «[?]» в блоке (строка пояснения или null; null — пояснения нет).
Части, добавленные позже (RICH), собираются полнее: заголовки «## …» и «**…**» дают блок h
(lv 2 / lv 3), строки «- …» — отдельные абзацы, переносы строк внутри абзаца сохраняются (\\n).

Оглавление (chapters[]) всегда содержит все главы книги по порядку; поле blocks
есть только у собранных. Блоки: aside (помета на полях), p (абзац), quote
(цитата/стихи, lines + author), cap (подпись гравюры, eng — файл из engravings/, w/h — его размеры).
Номер блока n — сквозной по главе, с 1.

После сборки проверяет chapter_links.tsv: блок существует, это p/quote, текст
начинается с якоря из колонки anchor. Расхождения печатаются как ПРЕДУПРЕЖДЕНИЕ.

Колонки chapter_links.tsv: id, chapter, block, confidence (точно / примерно /
начало главы), end_block, anchor (слова, с которых начинается кусок записи; если
они не в начале блока — в карточке текст показывается с этого места), note.
"""
import argparse, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = "cartari"
ORDER = ["frontespizio-dedica", "prefatione", "catalogo-dei", "catalogo-autori",
         "proemio", "saturno", "apollo", "diana", "giove", "giunone", "gran-madre",
         "nettuno", "vertunno", "plutone", "mercurio", "minerva", "bacco", "fortuna",
         "cupido", "venere", "gratie",
         "annotationi-pignoria", "aggionta", "seconda-parte-titolo-dedica", "seconda-parte-indiani"]
RICH = {"frontespizio-dedica", "prefatione", "catalogo-dei", "catalogo-autori",
        "annotationi-pignoria", "aggionta", "seconda-parte-titolo-dedica", "seconda-parte-indiani"}
# У этих частей гравюры не идут подряд за подписями (почти все без подписи): привязываются только ENG_CARD.
NO_AUTO_PLATES = RICH

ASIDE = re.compile(r"^<aside>(.*)</aside>\s*$")

# Однострочные цитаты без автора, которые не подписи гравюр (по началу текста).
NOT_CAP = {
    "mercurio": ["Я есмь пастырь добрый."],
    "minerva": ["Пусть от меня учатся быть благочестивым"],
    "annotationi-pignoria": ["Элий Монт"],
}
# Явная привязка подписи (по началу текста) к файлу гравюры (без расширения), когда порядок
# подписей в тексте не совпадает с порядком листов или лист лежит вне сканов главы.
ENG_BIND = {
    "proemio": [("К с. 3.", "0043_3a"),
                ("Начало Идолопоклонства", "0040_1a"),
                ("Образы Богини Провидения", "0051_10"),
                ("Образы Вечности", "0057_16"),
                ("Пещера Вечности", "0061_20")],
    "giove": [("Изображение Веры", "0173_132"),
              ("Изображение Юпитера, разящего молнией клятвопреступников", "0171_130")],
}
# Подпись (по началу текста) -> id карточки; файл гравюры берётся из engraving_map.json.
ENG_CARD = {
    "aggionta": [("Имеющая некоторое сходство", "carta45"), ("Тиллину.", "carta27")],
    "seconda-parte-indiani": [("VOT P R", "carti_constantinevot")],
}

SCAN_TAIL = re.compile(r"\s*\((?:скан|сканы) [^)]*\)\s*$")


QM_WORD = re.compile(r"[\w]+", re.U)
QM_MAX = 520


def qm_ctx(text, pos):
    """Два слова перед позицией pos (в нижнем регистре, ё=е)."""
    words = QM_WORD.findall(text[:pos].lower().replace("ё", "е"))
    if words and words[-1] in ("с", "со"):
        words = words[:-1]
    return tuple(words[-2:])


def same_word(a, b):
    """Совпадение слов с учётом падежных окончаний (общий корень от 4 букв)."""
    if a == b:
        return True
    n = min(len(a), len(b))
    return n >= 4 and a[:max(4, n - 2)] == b[:max(4, n - 2)]


def doubt_items(lines):
    """Пункты раздела «Сомнительные места»: [(текст для показа, [контексты [?] в пункте])]."""
    if "## Сомнительные места" not in lines:
        return []
    sec = lines[lines.index("## Сомнительные места") + 1:]
    raw, cur = [], None
    for ln in sec:
        if ln.startswith("- "):
            cur = [ln[2:].strip()]
            raw.append(cur)
        elif cur is not None and ln.strip() and ln.strip() != "---":
            cur.append(ln.strip())
    items = []
    for parts in raw:
        full = " ".join(parts)
        ctxs = [qm_ctx(full.replace("*", ""), m.start()) for m in re.finditer(r"\[\?\]", full.replace("*", ""))]
        if not ctxs:
            continue
        shown = re.split(r"\s*\*\*Опечатки", full)[0]
        shown = re.sub(r"^Скан \d+[^:]*:\s*", "", shown)
        shown = re.sub(r"\s*\((?:скан|сканы) [^)]*\)", "", shown)
        if len(shown) > QM_MAX:
            cut = shown[:QM_MAX]
            k = max(cut.rfind(". "), cut.rfind("; "))
            shown = (cut[:k + 1] if k > 150 else cut.rstrip()) + ("" if k > 150 and cut[k] == "." else "…")
        items.append((shown.strip(), ctxs))
    return items


# Все [?] блока (по началу текста) -> пункт «Сомнительных мест» (по началу пункта), когда слова не совпадают
# по написанию (латинская надпись и её русская передача).
QM_BLOCK = {"annotationi-pignoria": [("Элий Монт", "Надпись «ÆL."), ("Перед ними — Сфинкс", "Цитата из Плиния о Сфинксе")]}


def lead_words(shown):
    head = re.split(r"[:—]", shown, 1)[0][:160].lower().replace("ё", "е")
    return [w for w in QM_WORD.findall(head) if len(w) >= 5]


def attach_qm(blocks, items, slug=None):
    """Поле qm у блоков с [?]: пояснение из «Сомнительных мест» по двум словам перед значком."""
    used = set()
    for b in blocks:
        if b["t"] == "quote":
            flat = " ".join(b["lines"]) + ((" " + b["author"]) if b.get("author") else "")
        else:
            flat = b["text"]
        flat = flat.replace("*", "")
        qm = []
        for m in re.finditer(r"\[\?\]", flat):
            ctx = qm_ctx(flat, m.start())
            best = None
            for idx, (shown, ctxs) in enumerate(items):
                for c in ctxs:
                    if not c or not ctx or not same_word(c[-1], ctx[-1]):
                        continue
                    score = 3 if c == ctx else 2 if (len(c) == len(ctx) == 2 and same_word(c[0], ctx[0])) else 1
                    if len(c) < 2 or len(ctx) < 2:
                        score = 2
                    if best is None or score > best[0]:
                        best = (score, idx)
            if not best:
                near = QM_WORD.findall(flat[:m.start()].lower().replace("ё", "е"))[-6:]
                for idx, (shown, ctxs) in enumerate(items):
                    if any(same_word(w, v) for w in near if len(w) >= 5 for v in lead_words(shown)):
                        best = (0, idx)
                        break
            if not best:
                for bp, ip in QM_BLOCK.get(slug, []):
                    if flat.startswith(bp):
                        idx = next((i for i, (sh, _) in enumerate(items) if sh.startswith(ip)), None)
                        if idx is not None:
                            best = (0, idx)
            if best:
                used.add(best[1])
                qm.append(items[best[1]][0])
            else:
                qm.append(None)
        if any(qm):
            b["qm"] = qm
    return len(used)


def parse_chapter(path, slug=None):
    lines = open(path, encoding="utf-8").read().split("\n")
    title = lines[0].lstrip("# ").strip()
    sep = lines.index("---")
    header = "\n".join(lines[1:sep])
    m = re.search(r"сканы (\d{4})[–-](\d{4})", header)
    scans = [int(m.group(1)), int(m.group(2))] if m else None
    rich = slug in RICH
    items = doubt_items(lines)
    if "## Сомнительные места" in lines:
        lines = lines[:lines.index("## Сомнительные места")]
        while lines and lines[-1].strip() in ("", "---"):
            lines.pop()
    blocks, i = [], sep + 1
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        if rich:
            h = re.match(r"^## (.+)$", ln)
            if h:
                blocks.append({"t": "h", "lv": 2, "text": SCAN_TAIL.sub("", h.group(1)).strip(), "l": i + 1})
                i += 1
                continue
            h = re.fullmatch(r"\*\*([^*]+)\*\*", ln.strip())
            if h:
                blocks.append({"t": "h", "lv": 3, "text": h.group(1).strip(), "l": i + 1})
                i += 1
                continue
            if ln.startswith("- "):
                blocks.append({"t": "p", "text": ln[2:].strip(), "l": i + 1})
                i += 1
                continue
        a = ASIDE.match(ln)
        if a:
            blocks.append({"t": "aside", "text": a.group(1).strip(), "l": i + 1})
            i += 1
            continue
        if ln.startswith(">"):
            start, grp = i, []
            while i < len(lines) and lines[i].startswith(">"):
                grp.append(lines[i][1:].lstrip(" "))
                i += 1
            author = None
            while grp and not grp[-1].strip():
                grp.pop()
            if grp and re.fullmatch(r"\*\((.+)\)\*", grp[-1].strip()):
                author = re.fullmatch(r"\*\((.+)\)\*", grp[-1].strip()).group(1)
                grp.pop()
                while grp and not grp[-1].strip():
                    grp.pop()
            if (author is None and len(grp) == 1
                    and not any(grp[0].startswith(x) for x in NOT_CAP.get(slug, []))):
                blocks.append({"t": "cap", "text": grp[0].strip(), "l": start + 1})
            else:
                b = {"t": "quote", "lines": grp, "l": start + 1}
                if author:
                    b["author"] = author
                blocks.append(b)
            continue
        para, start = [], i
        while (i < len(lines) and lines[i].strip() and not lines[i].startswith(">") and not ASIDE.match(lines[i])
               and not (rich and (lines[i].startswith(("## ", "- ")) or re.fullmatch(r"\*\*[^*]+\*\*", lines[i].strip())))):
            para.append(lines[i].strip())
            i += 1
        blocks.append({"t": "p", "text": ("\n" if rich else " ").join(para), "l": start + 1})
    for n, b in enumerate(blocks, 1):
        b["n"] = n
    attach_qm(blocks, items, slug)
    return {"title": title, "scans": scans, "blocks": blocks}


def plates_for(scans, engravings):
    # файл гравюры с префиксом N лежит на скане N+1 (см. apollo: 0127_86 = Диана на скане 0128)
    if not scans:
        return []
    out = []
    for e in engravings:
        m = re.match(r"(\d{4})_", e["file"])
        if m and scans[0] - 1 <= int(m.group(1)) <= scans[1] - 1:
            out.append(e)
    return sorted(out, key=lambda e: e["display"])


def jdump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("chapters", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--book", default=BOOK)
    a = ap.parse_args()
    want = ORDER if a.all else (a.chapters or ["diana"])
    for w in want:
        if w not in ORDER:
            sys.exit("неизвестная глава: " + w)
    bdir = os.path.join(ROOT, "books", a.book)
    src = os.path.join(bdir, "_translation", "ru")
    engravings = json.load(open(os.path.join(bdir, "engravings.json"), encoding="utf-8"))
    out_path = a.out or os.path.join(bdir, "chapters_ru.json")

    chapters = []
    for slug in ORDER:
        info = parse_chapter(os.path.join(src, slug + ".md"), slug)
        rec = {"slug": slug, "title": info["title"], "scans": info["scans"]}
        if slug in want:
            caps = [b for b in info["blocks"] if b["t"] == "cap"]
            plates = plates_for(info["scans"], engravings)
            by_stem = {e["file"].rsplit(".", 1)[0]: e for e in engravings}
            for prefix, stem in ENG_BIND.get(slug, []):
                b = next((c for c in caps if c["text"].startswith(prefix)), None)
                if b is None or stem not in by_stem:
                    sys.exit("ENG_BIND: %s: нет подписи «%s» или гравюры %s" % (slug, prefix, stem))
                e = by_stem[stem]
                b["eng"], b["w"], b["h"] = e["display"], e["width"], e["height"]
                caps.remove(b)
                plates = [x for x in plates if x["file"] != e["file"]]
            card_map = json.load(open(os.path.join(bdir, "engraving_map.json"), encoding="utf-8"))
            for prefix, card in ENG_CARD.get(slug, []):
                b = next((c for c in caps if c["text"].startswith(prefix)), None)
                e = next((x for x in engravings if x["file"] == card_map.get(card)), None)
                if b is None or e is None:
                    sys.exit("ENG_CARD: %s: нет подписи «%s» или гравюры карточки %s" % (slug, prefix, card))
                b["eng"], b["w"], b["h"] = e["display"], e["width"], e["height"]
                caps.remove(b)
            if slug in NO_AUTO_PLATES:
                if caps:
                    print("ПРЕДУПРЕЖДЕНИЕ: %s: подписей без гравюры %d" % (slug, len(caps)), file=sys.stderr)
            elif len(caps) == len(plates):
                for b, e in zip(caps, plates):
                    b["eng"] = e["display"]
                    b["w"], b["h"] = e["width"], e["height"]
            else:
                print("ПРЕДУПРЕЖДЕНИЕ: %s: подписей %d, гравюр %d — гравюры не привязаны"
                      % (slug, len(caps), len(plates)), file=sys.stderr)
            rec["blocks"] = info["blocks"]
        chapters.append(rec)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write('{"version":1,"chapters":[\n')
        for ci, c in enumerate(chapters):
            head = {k: v for k, v in c.items() if k != "blocks"}
            if "blocks" in c:
                f.write(jdump(head)[:-1] + ',"blocks":[\n')
                f.write(",\n".join(jdump(b) for b in c["blocks"]))
                f.write("\n]}")
            else:
                f.write(jdump(head))
            f.write(",\n" if ci < len(chapters) - 1 else "\n")
        f.write("]}\n")
    nb = sum(len(c.get("blocks", [])) for c in chapters)
    print("записано %s: глав в оглавлении %d, собрано %d (%s), блоков %d"
          % (os.path.relpath(out_path, ROOT), len(chapters), len(want), ", ".join(want), nb))

    check_links(bdir, {c["slug"]: c for c in chapters})


def check_links(bdir, by_slug):
    p = os.path.join(bdir, "chapter_links.tsv")
    if not os.path.exists(p):
        return
    bad = 0
    rows = [r.rstrip("\n").split("\t") for r in open(p, encoding="utf-8")][1:]
    for r in rows:
        if len(r) < 6:
            continue
        rid, slug, blk, conf, end, anchor = r[:6]
        ch = by_slug.get(slug)
        if not ch or "blocks" not in ch:
            continue
        bl = ch["blocks"]
        b = bl[int(blk) - 1] if 0 < int(blk) <= len(bl) else None
        e = bl[int(end) - 1] if end and 0 < int(end) <= len(bl) else None
        if b is None or b["t"] not in ("p", "quote"):
            print("ПРЕДУПРЕЖДЕНИЕ: %s: блок %s не абзац/цитата" % (rid, blk), file=sys.stderr); bad += 1; continue
        txt = b["text"] if b["t"] == "p" else " ".join(b["lines"])
        if anchor and anchor not in txt:
            print("ПРЕДУПРЕЖДЕНИЕ: %s: в блоке %s нет якоря «%s»: «%s»" % (rid, blk, anchor, txt[:40]), file=sys.stderr); bad += 1
        if e is None or int(end) < int(blk):
            print("ПРЕДУПРЕЖДЕНИЕ: %s: конец %s раньше начала %s" % (rid, end, blk), file=sys.stderr); bad += 1
    print("chapter_links.tsv: строк %d, предупреждений %d" % (len(rows), bad))


if __name__ == "__main__":
    main()
