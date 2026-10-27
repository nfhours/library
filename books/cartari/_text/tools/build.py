#!/usr/bin/env python3
"""
Cartari 1626 - сборочный скрипт.
Чистый код, без вызовов AI/LLM.

1) Собирает pages/*.md по порядку сканов (как в PAGES.tsv) в единый TEXT.md
   с заголовками "## Скан NNNN · с. X" (X = label из PAGES.tsv).
2) Собирает ENGRAVINGS.md из пометок [ГРАВЮРА: ...], [ВИНЬЕТКА: ...],
   [ИНИЦИАЛ: ...] - одна строка-находка на пометку, по порядку сканов,
   без дублей. Сюжет на русском оставлен пустым.
"""
import csv
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_TSV = os.path.join(BASE, "PAGES.tsv")
PAGES_DIR = os.path.join(BASE, "pages")
TEXT_OUT = os.path.join(BASE, "TEXT.md")
ENGRAVINGS_OUT = os.path.join(BASE, "ENGRAVINGS.md")

MARK_RE = re.compile(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)\s*:?\s*([^\]]*)\]")


def load_pages_tsv():
    rows = []
    with open(PAGES_TSV, encoding="utf-8") as f:
        r = csv.reader(f, delimiter="\t")
        next(r)
        for row in r:
            if not row:
                continue
            scan, label = row[0], row[1]
            rows.append((scan, label))
    return rows


def strip_header_line(body):
    lines = body.split("\n")
    if lines and lines[0].strip().startswith("<!--"):
        lines = lines[1:]
    # drop one leading blank line
    while lines and lines[0].strip() == "":
        lines = lines[1:]
    return "\n".join(lines).rstrip("\n")


def main():
    pages_tsv = load_pages_tsv()
    seen_marks = set()
    text_parts = []
    engraving_rows = []

    n_included = 0
    for scan, label in pages_tsv:
        fpath = os.path.join(PAGES_DIR, f"{scan}.md")
        if not os.path.isfile(fpath):
            continue
        n_included += 1
        with open(fpath, encoding="utf-8") as f:
            raw = f.read()
        body = strip_header_line(raw)
        header = f"## Скан {scan} · с. {label}"
        text_parts.append(header + "\n\n" + body)

        for m in MARK_RE.finditer(raw):
            kind, caption = m.group(1), m.group(2).strip()
            key = (scan, kind, caption)
            if key in seen_marks:
                continue
            seen_marks.add(key)
            type_ru = {"ГРАВЮРА": "гравюра", "ВИНЬЕТКА": "виньетка", "ИНИЦИАЛ": "инициал"}[kind]
            engraving_rows.append((scan, label, type_ru, caption))

    with open(TEXT_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: текст книги (собрано из pages/*.md)\n\n")
        f.write("\n\n".join(text_parts) + "\n")

    with open(ENGRAVINGS_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: реестр гравюр, виньеток и инициалов\n\n")
        f.write("Собрано из pages/*.md скриптом build.py. Сюжет на русском не заполнен (не задача этого этапа).\n\n")
        f.write("| Скан | Стр. | Тип | Подпись (буква в букву) | Сюжет (коротко, по-русски) |\n")
        f.write("|---|---|---|---|---|\n")
        for scan, label, type_ru, caption in engraving_rows:
            caption_md = caption.replace("|", "\\|")
            f.write(f"| {scan} | {label} | {type_ru} | {caption_md} | |\n")

    print(f"TEXT.md собран: {n_included} разделов -> {TEXT_OUT}")
    print(f"ENGRAVINGS.md собран: {len(engraving_rows)} находок -> {ENGRAVINGS_OUT}")


if __name__ == "__main__":
    main()
