#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает для режима чтения «Оригинал рядом»:

  books/cartari/pagemap.json  — для каждой главы список страниц 1626 года: [скан, метка, блок с, блок по]
                                (границы те же, что у указателя: Chap.page_range из build_tavola.py, расширенные найденными в указателе местами; точность до абзаца);
  books/cartari/pages_it.json — читательский итальянский текст каждого скана (TEXT_reading.md);
  books/cartari/scans/NNNN.webp — уменьшенные сканы (_text/_img, 1072×1600) тех сканов, что входят в главы.

    python3 tools/build_pagemap.py [--no-copy]
"""
import argparse, json, os, re, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_tavola as T

B = T.B


def reading_pages():
    t = open(os.path.join(B, "_text", "TEXT_reading.md"), encoding="utf8").read()
    parts = re.split(r"^## Скан (\d{4}) · с\. .*$", t, flags=re.M)
    out = {}
    for i in range(1, len(parts), 2):
        s, body = int(parts[i]), parts[i + 1].strip("\n")
        head = cust = sig = ""
        mar = []
        m = re.search(r"^Колонтитул:", body, re.M)
        body, tail = (body[:m.start()], body[m.start():]) if m else (body, "")
        for ln in tail.splitlines():
            if ln.startswith("Колонтитул:"):
                head = ln[11:].strip()
            elif ln.startswith("Кустод:"):
                cust = ln[7:].strip()
            elif ln.startswith("Сигнатура:"):
                sig = ln[10:].strip()
            elif ln.startswith("- "):
                mar.append(ln[2:].strip())
        out[s] = [head, body.strip("\n"), cust, sig, mar]
    return out


def found_places():
    """Места, где термин указателя найден в тексте перевода: (глава, метка страницы) → блоки. Они уточняют page_range."""
    f = os.path.join(B, "tavola.json")
    out = {}
    if not os.path.exists(f):
        return out
    for e in json.load(open(f, encoding="utf8"))["entries"]:
        for x in [e] + (e.get("subs") or []):
            for p in x.get("pages") or []:
                if "n" in p and p.get("k") in ("t", "m", "g", "f", "i"):
                    out.setdefault((p["ch"], str(p["p"])), []).append(p["n"])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-copy", action="store_true")
    a = ap.parse_args()
    chs = json.load(open(os.path.join(B, "chapters_ru.json"), encoding="utf8"))["chapters"]
    lab, _ = T.label_scans()
    C = T.build_chapters(chs)
    found = found_places()
    out, used = {}, set()
    for ch in chs:
        c = C[ch["slug"]]
        if not c.ok:
            continue
        rows = []
        for s in range(ch["scans"][0], ch["scans"][1] + 1):
            x, y = c.page_range(s)
            ns = found.get((ch["slug"], lab.get(s, "")), [])
            if ns:
                x, y = min(x, min(ns)), max(y, max(ns))
            rows.append([s, lab.get(s, ""), x, y])
            used.add(s)
        for i in range(1, len(rows)):
            rows[i][2] = max(rows[i][2], rows[i - 1][2])
            rows[i][3] = max(rows[i][3], rows[i][2])
        out[ch["slug"]] = rows
    json.dump({"version": 1, "chapters": out}, open(os.path.join(B, "pagemap.json"), "w", encoding="utf8"),
              ensure_ascii=False, separators=(",", ":"))
    rd = reading_pages()
    json.dump({str(s): rd[s] for s in sorted(used)}, open(os.path.join(B, "pages_it.json"), "w", encoding="utf8"),
              ensure_ascii=False, separators=(",", ":"))
    n = 0
    if not a.no_copy:
        os.makedirs(os.path.join(B, "scans"), exist_ok=True)
        for s in sorted(used):
            src, dst = os.path.join(B, "_text", "_img", "%04d.jpg" % s), os.path.join(B, "scans", "%04d.webp" % s)
            if not os.path.exists(dst):
                from PIL import Image
                Image.open(src).convert("RGB").save(dst, "WEBP", quality=82, method=4)
                n += 1
    print("глав %d, страниц %d, скопировано сканов %d" % (len(out), len(used), n))


if __name__ == "__main__":
    main()
