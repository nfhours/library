#!/usr/bin/env python3
"""
Cartari 1626 - сборочный скрипт.
Чистый код, без вызовов AI/LLM.

1) Собирает pages/*.md по порядку сканов (как в PAGES.tsv) в TEXT_diplomatic.md / TEXT_reading.md
   с заголовками "## Скан NNNN · с. X" (X = label из PAGES.tsv). Строки
   "Рукописно: ..." и "Штамп: ..." (владельческие записи, пометки, штампы
   библиотеки - не текст книги) в эти файлы не попадают.
2) Собирает ENGRAVINGS.md из пометок [ГРАВЮРА: ...], [ВИНЬЕТКА: ...],
   [ИНИЦИАЛ: ...] - одна строка-находка на пометку, по порядку сканов,
   без дублей. Сюжет на русском оставлен пустым.
3) Собирает PROVENANCE.md (история экземпляра) из строк "Рукописно: ..."
   и "Штамп: ..." по всем pages/*.md, по порядку сканов.
"""
import csv
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_TSV = os.path.join(BASE, "PAGES.tsv")
PAGES_DIR = os.path.join(BASE, "pages")
TEXT_DIPLOMATIC_OUT = os.path.join(BASE, "TEXT_diplomatic.md")
TEXT_READING_OUT = os.path.join(BASE, "TEXT_reading.md")
ERRATA_OUT = os.path.join(BASE, "ERRATA.md")
ENGRAVINGS_OUT = os.path.join(BASE, "ENGRAVINGS.md")
PROVENANCE_OUT = os.path.join(BASE, "PROVENANCE.md")

MARK_RE = re.compile(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)\s*:?\s*([^\]]*)\]")
PROVENANCE_LINE_RE = re.compile(r"^(Рукописно|Штамп):[ \t]*(.*)$")
ERRATA_RE = re.compile(r"\{([^{}|]+)\|([^{}|]+)\}")


def classify_errata(printed, corrected):
    """Rough automatic classification of a printer's-typo correction pair,
    for ERRATA.md's "тип опечатки" column."""
    a, b = printed.lower(), corrected.lower()
    if len(a) == len(b):
        diffs = [i for i in range(len(a)) if a[i] != b[i]]
        if len(diffs) == 1:
            return "перепутанная буква"
        if len(diffs) == 2 and diffs[1] == diffs[0] + 1 and a[diffs[0]] == b[diffs[1]] and a[diffs[1]] == b[diffs[0]]:
            return "перестановка букв"
        return "перестановка/замена букв"
    if len(a) == len(b) - 1:
        return "пропущена буква"
    if len(a) == len(b) + 1:
        return "лишняя буква"
    return "прочее"


def apply_errata(body, keep_group):
    """keep_group: 1 for diplomatic (as printed), 2 for reading (corrected)."""
    return ERRATA_RE.sub(lambda m: m.group(keep_group), body)


def collect_errata(body, scan, label):
    rows = []
    for m in ERRATA_RE.finditer(body):
        printed, corrected = m.group(1), m.group(2)
        rows.append((scan, label, printed, corrected, classify_errata(printed, corrected)))
    return rows


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


def extract_provenance(body):
    """Pulls out "Рукописно: ..." / "Штамп: ..." lines, returns
    (body_without_them, [(kind, value), ...])."""
    kept_lines = []
    found = []
    for line in body.split("\n"):
        m = PROVENANCE_LINE_RE.match(line.strip())
        if m:
            found.append((m.group(1), m.group(2).strip()))
            continue
        kept_lines.append(line)
    return "\n".join(kept_lines), found


def main():
    pages_tsv = load_pages_tsv()
    seen_marks = set()
    diplomatic_parts = []
    reading_parts = []
    engraving_rows = []
    provenance_rows = []
    errata_rows = []

    n_included = 0
    for scan, label in pages_tsv:
        fpath = os.path.join(PAGES_DIR, f"{scan}.md")
        if not os.path.isfile(fpath):
            continue
        n_included += 1
        with open(fpath, encoding="utf-8") as f:
            raw = f.read()
        body = strip_header_line(raw)
        body, provenance = extract_provenance(body)
        for kind, value in provenance:
            provenance_rows.append((scan, label, kind, value))
        errata_rows.extend(collect_errata(body, scan, label))
        header = f"## Скан {scan} · с. {label}"
        diplomatic_parts.append(header + "\n\n" + apply_errata(body, 1))
        reading_parts.append(header + "\n\n" + apply_errata(body, 2))

        for m in MARK_RE.finditer(raw):
            kind, caption = m.group(1), m.group(2).strip()
            key = (scan, kind, caption)
            if key in seen_marks:
                continue
            seen_marks.add(key)
            type_ru = {"ГРАВЮРА": "гравюра", "ВИНЬЕТКА": "виньетка", "ИНИЦИАЛ": "инициал"}[kind]
            engraving_rows.append((scan, label, type_ru, caption))

    with open(TEXT_DIPLOMATIC_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: текст книги, дипломатическая версия (как напечатано)\n\n")
        f.write(
            "Опечатки печатника переданы как напечатаны, без исправления. "
            "Читательскую версию с исправлениями см. TEXT_reading.md, список "
            "расхождений — ERRATA.md. Собрано из pages/*.md скриптом build.py.\n\n"
        )
        f.write("\n\n".join(diplomatic_parts) + "\n")

    with open(TEXT_READING_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: текст книги, читательская версия (с исправлениями)\n\n")
        f.write(
            "Опечатки печатника, размеченные в pages/*.md как `{как_напечатано|исправление}`, "
            "здесь даны исправленными. Дипломатическую версию (как напечатано) см. "
            "TEXT_diplomatic.md, список расхождений — ERRATA.md. Собрано из pages/*.md скриптом build.py.\n\n"
        )
        f.write("\n\n".join(reading_parts) + "\n")

    with open(ERRATA_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: список опечаток печатника (errata)\n\n")
        f.write(
            "Опечатки набора, размеченные в pages/*.md как `{как_напечатано|исправление}` "
            "и разведённые скриптом build.py в TEXT_diplomatic.md (как есть) / "
            "TEXT_reading.md (исправлено). Тип опечатки определён автоматически "
            "(эвристика по разнице строк), может требовать уточнения вручную.\n\n"
        )
        f.write("| Скан | Стр. | Напечатано | Исправлено | Тип опечатки |\n")
        f.write("|---|---|---|---|---|\n")
        for scan, label, printed, corrected, kind in errata_rows:
            printed_md = printed.replace("|", "\\|")
            corrected_md = corrected.replace("|", "\\|")
            f.write(f"| {scan} | {label} | {printed_md} | {corrected_md} | {kind} |\n")

    with open(ENGRAVINGS_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: реестр гравюр, виньеток и инициалов\n\n")
        f.write("Собрано из pages/*.md скриптом build.py. Сюжет на русском не заполнен (не задача этого этапа).\n\n")
        f.write("| Скан | Стр. | Тип | Подпись (буква в букву) | Сюжет (коротко, по-русски) |\n")
        f.write("|---|---|---|---|---|\n")
        for scan, label, type_ru, caption in engraving_rows:
            caption_md = caption.replace("|", "\\|")
            f.write(f"| {scan} | {label} | {type_ru} | {caption_md} | |\n")

    with open(PROVENANCE_OUT, "w", encoding="utf-8") as f:
        f.write("# Cartari 1626: история экземпляра (провенанс)\n\n")
        f.write(
            "Рукописные пометки, владельческие записи и библиотечные штампы — "
            "не текст книги, собраны сюда отдельно из pages/*.md скриптом "
            "build.py, по порядку сканов. В TEXT_diplomatic.md/TEXT_reading.md не входят.\n\n"
        )
        f.write("| Скан | Стр. | Тип | Текст |\n")
        f.write("|---|---|---|---|\n")
        for scan, label, kind, value in provenance_rows:
            value_md = value.replace("|", "\\|")
            f.write(f"| {scan} | {label} | {kind} | {value_md} |\n")

    print(f"TEXT_diplomatic.md собран: {n_included} разделов -> {TEXT_DIPLOMATIC_OUT}")
    print(f"TEXT_reading.md собран: {n_included} разделов -> {TEXT_READING_OUT}")
    print(f"ERRATA.md собран: {len(errata_rows)} опечаток -> {ERRATA_OUT}")
    print(f"ENGRAVINGS.md собран: {len(engraving_rows)} находок -> {ENGRAVINGS_OUT}")
    print(f"PROVENANCE.md собран: {len(provenance_rows)} записей -> {PROVENANCE_OUT}")


if __name__ == "__main__":
    main()
