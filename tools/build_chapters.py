#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает books/<book>/chapters_ru.json из books/<book>/_translation/ru/*.md.

    --lang en                      chapters_en.json из _translation/en/*.md (только главы из _translation/en/READY,
                                   по одному слагу в строке); структура блоков обязана совпадать с русской
    --lang en --check proemio ...  только сверка структуры английского файла с русским (печатает OK или различия)

    python3 tools/build_chapters.py                 # только diana (по умолчанию)
    python3 tools/build_chapters.py diana giove     # перечисленные главы
    python3 tools/build_chapters.py --all           # все 25 частей
    python3 tools/build_chapters.py --out /tmp/x.json diana

Раздел «## Сомнительные места» (заметки переводчика) как отдельный текст на сайт не попадает ни в одной
главе, но его пункты становятся пояснениями к значкам [?] в тексте — строго по номерам: пометы в тексте
пронумерованы [?1], [?2]… (сплошно, по порядку в главе), пункт раздела начинается с [?N] или [?N,M].
Номера на сайт не попадают: у блока появляется поле qm — список по порядку вхождений «[?]» в блоке
(строка пояснения или null; null — общее «место в оригинале неясно»). Нет сплошной нумерации — сборка падает.
Части, добавленные позже (RICH), собираются полнее: заголовки «## …» и «**…**» дают блок h
(lv 2 / lv 3), строки «- …» — отдельные абзацы, переносы строк внутри абзаца сохраняются (\\n).

Оглавление (chapters[]) всегда содержит все главы книги по порядку; поле blocks
есть только у собранных. Блоки: aside (помета на полях), p (абзац), quote
(цитата/стихи, lines + author), cap (подпись гравюры, eng — файл из engravings/, w/h — его размеры, pid — id гравюры из plates.json).
Гравюры без печатной подписи — поле figs у блока, перед которым они стоят (по plates.json: at=before). Расстановка гравюр
идёт только по plates.json (его строит tools/build_plates.py); нумерация блоков от гравюр не зависит.
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
ASIDE = re.compile(r"^<aside>(.*)</aside>\s*$")

# Однострочные цитаты без автора, которые не подписи гравюр (по началу текста).
NOT_CAP = {
    "mercurio": ["Я есмь пастырь добрый.", "I am the good shepherd"],
    "minerva": ["Пусть от меня учатся быть благочестивым", "Let people learn from me"],
    "annotationi-pignoria": ["Элий Монт", "Aelius Mont"],
}
SCAN_TAIL = re.compile(r"\s*\((?:скан|сканы|scan|scans) [^)]*\)\s*$")


QM_MAX = 520
QM_MARK = re.compile(r"\[\?(\d+)\]")
QM_TAG = re.compile(r"^\[\?(\d+(?:\s*,\s*\d+)*)\]\s*")


DOUBT = {"ru": "## Сомнительные места", "en": "## Doubtful passages"}


def doubt_items(lines, lang="ru"):
    """Пояснения из «Сомнительных мест»: {номер пометы: текст}. Пункт начинается с [?N] или [?N,M]."""
    head = DOUBT[lang]
    if head not in lines:
        return {}
    sec = lines[lines.index(head) + 1:]
    raw, cur = [], None
    for ln in sec:
        if ln.startswith("- "):
            cur = [ln[2:].strip()]
            raw.append(cur)
        elif cur is not None and ln.strip() and ln.strip() != "---":
            cur.append(ln.strip())
    items = {}
    for parts in raw:
        full = " ".join(parts)
        tag = QM_TAG.match(full)
        if not tag:
            continue
        full = full[tag.end():]
        shown = re.split(r"\s*\*\*(?:Опечатки|Typos)", full)[0]
        shown = re.sub(r"^(?:Скан|Scan) \d+[^:]*:\s*", "", shown)
        shown = re.sub(r"\s*\((?:скан|сканы|scan|scans) [^)]*\)", "", shown)
        if len(shown) > QM_MAX:
            cut = shown[:QM_MAX]
            k = max(cut.rfind(". "), cut.rfind("; "))
            shown = (cut[:k + 1] if k > 150 else cut.rstrip()) + ("" if k > 150 and cut[k] == "." else "…")
        for n in re.findall(r"\d+", tag.group(1)):
            if int(n) in items:
                raise SystemExit("пометка [?%s]: два пояснения" % n)
            items[int(n)] = shown.strip()
    return items


def attach_qm(blocks, items):
    """Номера [?N] убираются из текста (остаётся [?]); поле qm у блока — пояснения по номерам, null — общее.
    Пояснение берётся только по номеру; нумерация обязана быть сплошной, без пропусков и повторов."""
    seen = []

    def strip(s):
        def sub(m):
            seen.append(int(m.group(1)))
            return "[?]"
        if re.search(r"\[\?\]", s):
            raise SystemExit("непронумерованная пометка [?] в тексте: %s" % s[:80])
        return QM_MARK.sub(sub, s)

    for b in blocks:
        start = len(seen)
        if b["t"] == "quote":
            b["lines"] = [strip(x) for x in b["lines"]]
            if b.get("author"):
                b["author"] = strip(b["author"])
        else:
            b["text"] = strip(b["text"])
        nums = seen[start:]
        if nums:
            qm = [items.get(n) for n in nums]
            if any(qm):
                b["qm"] = qm
    if seen != list(range(1, len(seen) + 1)):
        raise SystemExit("нумерация [?N] не сплошная: %s" % seen)
    missing = set(items) - set(seen)
    if missing:
        raise SystemExit("пояснения без пометы: %s" % sorted(missing))
    return len(seen)


def parse_chapter(path, slug=None, lang="ru"):
    lines = open(path, encoding="utf-8").read().split("\n")
    title = lines[0].lstrip("# ").strip()
    sep = lines.index("---")
    header = "\n".join(lines[1:sep])
    m = re.search(r"(?:сканы|scans) (\d{4})[–-](\d{4})", header)
    scans = [int(m.group(1)), int(m.group(2))] if m else None
    rich = slug in RICH
    items = doubt_items(lines, lang)
    if DOUBT[lang] in lines:
        lines = lines[:lines.index(DOUBT[lang])]
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
    attach_qm(blocks, items)
    return {"title": title, "scans": scans, "blocks": blocks}


def jdump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


TITLES_EN = {
    "frontespizio-dedica": "Title page and the publisher's dedication",
    "prefatione": "Preface to the reader",
    "catalogo-dei": "Catalogue of the hundred best-known gods of the ancients",
    "catalogo-autori": "Catalogue of authors",
    "proemio": "Images of the Gods of the Ancients (introduction)",
    "saturno": "Saturn", "apollo": "Apollo, Phoebus — the Sun", "diana": "Diana", "giove": "Jupiter",
    "giunone": "Juno", "gran-madre": "The Great Mother", "nettuno": "Neptune", "vertunno": "Vertumnus",
    "plutone": "Pluto", "mercurio": "Mercury", "minerva": "Minerva", "bacco": "Bacchus",
    "fortuna": "Fortune", "cupido": "Cupid", "venere": "Venus", "gratie": "The Graces",
    "annotationi-pignoria": "Annotations by Lorenzo Pignoria",
    "aggionta": "Lorenzo Pignoria's Addition",
    "seconda-parte-titolo-dedica": "Second title page of the Second Part and the publisher's dedication",
    "seconda-parte-indiani": "The Second Part of the Images of the Indian Gods",
}


def sig(blocks):
    """Структурная подпись главы: типы блоков, число строк цитат, наличие автора, число пометок [?]."""
    out = []
    for b in blocks:
        if b["t"] == "quote":
            out.append(("quote", len(b["lines"]), bool(b.get("author")), sum(x.count("[?]") for x in b["lines"])))
        elif b["t"] == "h":
            out.append(("h", b["lv"], 0, b["text"].count("[?]")))
        else:
            out.append((b["t"], 0, 0, b["text"].count("[?]")))
    return out


def structure_diff(src_ru, src_en, slug):
    r = parse_chapter(os.path.join(src_ru, slug + ".md"), slug, "ru")["blocks"]
    e = parse_chapter(os.path.join(src_en, slug + ".md"), slug, "en")["blocks"]
    sr, se = sig(r), sig(e)
    diffs = []
    if len(sr) != len(se):
        diffs.append("число блоков: ru %d, en %d" % (len(sr), len(se)))
    for i, (x, y) in enumerate(zip(sr, se), 1):
        if x != y:
            diffs.append("блок %d: ru %s, en %s | ru: %s | en: %s" % (
                i, x, y, (r[i-1].get("text") or " / ".join(r[i-1]["lines"]))[:50],
                (e[i-1].get("text") or " / ".join(e[i-1]["lines"]))[:50]))
            if len(diffs) >= 12:
                break
    return diffs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("chapters", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--book", default=BOOK)
    ap.add_argument("--lang", default="ru", choices=["ru", "en"])
    ap.add_argument("--check", action="store_true", help="только сверка структуры en с ru")
    a = ap.parse_args()
    lang = a.lang
    bdir = os.path.join(ROOT, "books", a.book)
    src_ru = os.path.join(bdir, "_translation", "ru")
    src = os.path.join(bdir, "_translation", lang)
    if a.check:
        if lang != "en":
            sys.exit("--check только с --lang en")
        bad = 0
        for w in a.chapters:
            d = structure_diff(src_ru, src, w)
            print("%s: %s" % (w, "OK" if not d else "РАСХОЖДЕНИЯ"))
            for x in d:
                print("  " + x)
            bad += bool(d)
        sys.exit(1 if bad else 0)
    ready = None
    if lang == "en":
        rp = os.path.join(src, "READY")
        ready = [x.strip() for x in open(rp, encoding="utf-8")] if os.path.exists(rp) else []
        ready = [x for x in ready if x and not x.startswith("#")]
        want = [w for w in ORDER if w in ready]
    else:
        want = ORDER if a.all else (a.chapters or ["diana"])
    for w in want:
        if w not in ORDER:
            sys.exit("неизвестная глава: " + w)
    engravings = json.load(open(os.path.join(bdir, "engravings.json"), encoding="utf-8"))
    plates = json.load(open(os.path.join(bdir, "plates.json"), encoding="utf-8"))["plates"]
    by_stem = {e["file"].rsplit(".", 1)[0]: e for e in engravings}
    out_path = a.out or os.path.join(bdir, "chapters_%s.json" % lang)

    chapters = []
    for slug in ORDER:
        if lang == "en":
            ru_info = parse_chapter(os.path.join(src_ru, slug + ".md"), slug, "ru")
            rec = {"slug": slug, "title": TITLES_EN[slug], "scans": ru_info["scans"]}
            if slug in want:
                d = structure_diff(src_ru, src, slug)
                if d:
                    sys.exit("%s: структура en не совпадает с ru:\n  %s" % (slug, "\n  ".join(d)))
                info = parse_chapter(os.path.join(src, slug + ".md"), slug, "en")
                rec["title"] = info["title"] if slug not in RICH else rec["title"]
        else:
            info = parse_chapter(os.path.join(src, slug + ".md"), slug, lang)
            rec = {"slug": slug, "title": info["title"], "scans": info["scans"]}
        if slug in want:
            by_n = {b["n"]: b for b in info["blocks"]}
            for pl in plates:
                cf = pl.get("cap_from")
                if cf and cf["chapter"] == slug and pl["chapter"] != slug:
                    by_n[cf["block"]]["mv"] = pl["id"]
                if pl["chapter"] != slug:
                    continue
                if pl["shared_file"] and pl["id"].endswith("b"):
                    continue
                e = by_stem[pl["file"]]
                b = by_n[pl["block"]]
                if pl["at"] == "cap":
                    if b["t"] != "cap":
                        sys.exit("%s: блок %s главы %s не подпись" % (pl["id"], pl["block"], slug))
                    b["eng"], b["w"], b["h"], b["pid"], b["pt"] = e["display"], e["width"], e["height"], pl["id"], pl["title"]
                else:
                    fig = {"eng": e["display"], "w": e["width"], "h": e["height"], "pid": pl["id"], "pt": pl["title"]}
                    if cf:
                        cinfo = info if cf["chapter"] == slug else parse_chapter(os.path.join(src, cf["chapter"] + ".md"), cf["chapter"], lang)
                        fig["cap"] = next(x["text"] for x in cinfo["blocks"] if x["n"] == cf["block"])
                    b.setdefault("figs", []).append(fig)
            for b in info["blocks"]:
                if b["t"] == "cap" and "eng" not in b and "mv" not in b:
                    print("ПРЕДУПРЕЖДЕНИЕ: %s: подпись-блок %d без гравюры: %s" % (slug, b["n"], b["text"][:40]), file=sys.stderr)
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

    if lang == "ru":
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
        if b is None or b["t"] not in ("p", "quote", "cap"):
            print("ПРЕДУПРЕЖДЕНИЕ: %s: блок %s не абзац/цитата" % (rid, blk), file=sys.stderr); bad += 1; continue
        txt = b["text"] if b["t"] in ("p", "cap") else " ".join(b["lines"])
        if anchor and anchor not in txt:
            print("ПРЕДУПРЕЖДЕНИЕ: %s: в блоке %s нет якоря «%s»: «%s»" % (rid, blk, anchor, txt[:40]), file=sys.stderr); bad += 1
        if e is None or int(end) < int(blk):
            print("ПРЕДУПРЕЖДЕНИЕ: %s: конец %s раньше начала %s" % (rid, end, blk), file=sys.stderr); bad += 1
    print("chapter_links.tsv: строк %d, предупреждений %d" % (len(rows), bad))


if __name__ == "__main__":
    main()
