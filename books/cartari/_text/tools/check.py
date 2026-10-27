#!/usr/bin/env python3
"""
Cartari 1626 - проверочный скрипт.
Чистый код, без вызовов AI/LLM.

Делает:
  - читает PAGES.tsv и pages/*.md
  - для каждого скана из PAGES.tsv проверяет наличие pages/NNNN.md (иначе state=todo)
  - проверяет отсутствие дублей и "осиротевших" файлов (NNNN без строки в PAGES.tsv)
  - сравнивает "Кустод:" страницы с первым словом текста следующей по порядку
    скана страницы (нормализация: нижний регистр, u->v, i->j, длинная s -> s,
    без пунктуации) - несовпадения ожидаемы, т.к. у черновиков Grok кустоды
    почти везде пустые
  - считает количество "[?]" по всем страницам
  - сравнивает печатный номер (если есть в тексте/колонтитуле) с label из PAGES.tsv
  - обновляет/создаёт _text/status.csv: scan, label, printed_number, state,
    unclear, engravings, note, method, discrepancies, errors_r1, errors_r2,
    both_wrong, noise (последние 6 колонок — из метода двойного чтения, см.
    ALGORITHM.md; пустые для страниц, обработанных старым однопрочтенческим
    способом). Инвариант: discrepancies = errors_r1 + errors_r2 - both_wrong
    + noise.
"""
import csv
import os
import re
import sys
import unicodedata

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_TSV = os.path.join(BASE, "PAGES.tsv")
PAGES_DIR = os.path.join(BASE, "pages")
STATUS_CSV = os.path.join(BASE, "status.csv")


def load_pages_tsv():
    rows = []
    with open(PAGES_TSV, encoding="utf-8") as f:
        r = csv.reader(f, delimiter="\t")
        header = next(r)
        for row in r:
            if not row:
                continue
            scan, label, url = row[0], row[1], row[2] if len(row) > 2 else ""
            rows.append({"scan": scan, "label": label, "url": url})
    return rows


def list_page_files():
    files = {}
    unmatched = []
    if not os.path.isdir(PAGES_DIR):
        return files, unmatched
    for name in sorted(os.listdir(PAGES_DIR)):
        if name == "_unmatched":
            continue
        if not name.endswith(".md"):
            continue
        scan = name[:-3]
        files[scan] = os.path.join(PAGES_DIR, name)
    unm_dir = os.path.join(PAGES_DIR, "_unmatched")
    if os.path.isdir(unm_dir):
        unmatched = sorted(os.listdir(unm_dir))
    return files, unmatched


HEADER_RE = re.compile(
    r"<!--\s*scan:\s*(\S+)\s*\|\s*label:\s*(\S+)\s*\|\s*state:\s*(\S+)\s*\|\s*source:\s*(\S+)\s*(.*?)-->"
)
METHOD_RE = re.compile(r"method:\s*(\S+)")
DISCREPANCIES_RE = re.compile(r"discrepancies:\s*(\d+)")
ERRORS_R1_RE = re.compile(r"errors_r1:\s*(\d+)")
ERRORS_R2_RE = re.compile(r"errors_r2:\s*(\d+)")
BOTH_WRONG_RE = re.compile(r"both_wrong:\s*(\d+)")
NOISE_RE = re.compile(r"noise:\s*(\d+)")
KUSTOD_RE = re.compile(r"^Кустод:[ \t]*(.*)$", re.M)
KOLONTITUL_RE = re.compile(r"^Колонтитул:[ \t]*(.*)$", re.M)
NUMERATION_RE = re.compile(r"^Нумерация:.*$", re.M)


def read_page(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def normalize_word(w):
    """Normalize a word for catchword comparison: lowercase, u->v, i->j,
    long s -> s, strip punctuation/diacritics."""
    if not w:
        return ""
    w = w.strip()
    w = unicodedata.normalize("NFKD", w)
    w = "".join(c for c in w if not unicodedata.combining(c))
    w = w.lower()
    w = w.replace("ſ", "s")
    w = w.replace("u", "v")
    w = w.replace("i", "j")
    w = re.sub(r"[^a-z]", "", w)
    return w


def first_word_of_body(body):
    # strip header line and leading blank lines
    lines = body.split("\n")
    # drop first line if it's the <!-- scan ... --> header
    text_lines = []
    started = False
    for ln in lines:
        if ln.strip().startswith("<!--"):
            continue
        if ln.strip() == "":
            if not started:
                continue
            else:
                text_lines.append(ln)
                continue
        started = True
        text_lines.append(ln)
    # stop collecting body at the trailer markers
    body_text = []
    for ln in text_lines:
        if ln.strip().startswith(("Колонтитул:", "Кустод:", "Маргиналии:", "Нумерация:")):
            break
        body_text.append(ln)
    joined = " ".join(body_text).strip()
    if not joined:
        return ""
    if joined.startswith("[ГРАВЮРА") or joined.startswith("[ВИНЬЕТКА") or joined.startswith("[ИНИЦИАЛ"):
        # try to find first real word after the bracket note
        after = re.sub(r"^\[[^\]]*\]\s*", "", joined)
        joined = after if after else joined
    m = re.search(r"[A-Za-zÀ-ÿſ]+", joined)
    return m.group(0) if m else ""


def main():
    pages_tsv = load_pages_tsv()
    page_files, unmatched_list = list_page_files()

    scans_in_tsv = [r["scan"] for r in pages_tsv]
    label_by_scan = {r["scan"]: r["label"] for r in pages_tsv}
    set_tsv = set(scans_in_tsv)
    set_files = set(page_files.keys())

    orphans = sorted(set_files - set_tsv)
    todo = sorted(set_tsv - set_files, key=lambda s: s)

    # duplicate check: filenames are unique by construction (one file per scan),
    # but PAGES.tsv itself could have dup scans (shouldn't)
    dup_scans = [s for s in scans_in_tsv if scans_in_tsv.count(s) > 1]
    dup_scans = sorted(set(dup_scans))

    # Pre-read bodies & first words, in scan order (as in PAGES.tsv)
    body_cache = {}
    first_word_cache = {}
    unclear_counts = {}
    printed_numbers = {}
    kustod_cache = {}
    kolontitul_cache = {}

    for scan in scans_in_tsv:
        if scan not in page_files:
            continue
        body = read_page(page_files[scan])
        body_cache[scan] = body
        first_word_cache[scan] = first_word_of_body(body)
        unclear_counts[scan] = body.count("[?]")
        km = KUSTOD_RE.search(body)
        kustod_cache[scan] = km.group(1).strip() if km else ""
        kolm = KOLONTITUL_RE.search(body)
        kolontitul_cache[scan] = kolm.group(1).strip() if kolm else ""
        # try to find a printed page number in the kolontitul line, e.g. "... с. 95"
        printed = ""
        if kolm:
            pm = re.search(r"(\d+)\s*$", kolm.group(1))
            if pm:
                printed = pm.group(1)
        # also check for an explicit "Нумерация: на странице напечатано X" line
        num_m = re.search(r"Нумерация:\s*на странице напечатано\s*(\d+)", body)
        if num_m:
            printed = num_m.group(1)
        printed_numbers[scan] = printed

    # catchword continuity check (informational, not an error per ALGORITHM.md note)
    kustod_mismatches = []
    for i, scan in enumerate(scans_in_tsv):
        if scan not in page_files:
            continue
        kustod = kustod_cache.get(scan, "")
        if not kustod:
            continue  # expected: Grok drafts almost never have kustod filled in
        # find next scan that has a page file
        nxt = None
        for j in range(i + 1, len(scans_in_tsv)):
            if scans_in_tsv[j] in page_files:
                nxt = scans_in_tsv[j]
                break
        if not nxt:
            continue
        next_first = first_word_cache.get(nxt, "")
        if normalize_word(kustod) != normalize_word(next_first):
            kustod_mismatches.append((scan, kustod, nxt, next_first))

    unclear_total = sum(unclear_counts.values())

    # numbering discrepancies: printed number in text vs PAGES.tsv label
    numbering_discrepancies = []
    for scan in scans_in_tsv:
        if scan not in page_files:
            continue
        label = label_by_scan.get(scan, "")
        printed = printed_numbers.get(scan, "")
        if printed and label.isdigit() and printed != label:
            numbering_discrepancies.append((scan, label, printed))

    # state: read from header if present, else "draft" if file exists w/o header, else "todo"
    # double-reading extras (method/discrepancies/errors_r1/errors_r2), if present in header tail
    states = {}
    double_reading = {}
    for scan in scans_in_tsv:
        if scan not in page_files:
            states[scan] = "todo"
            continue
        body = body_cache.get(scan, "")
        hm = HEADER_RE.search(body)
        states[scan] = hm.group(3) if hm else "draft"
        tail = hm.group(5) if hm else ""
        method_m = METHOD_RE.search(tail)
        disc_m = DISCREPANCIES_RE.search(tail)
        r1_m = ERRORS_R1_RE.search(tail)
        r2_m = ERRORS_R2_RE.search(tail)
        both_m = BOTH_WRONG_RE.search(tail)
        noise_m = NOISE_RE.search(tail)
        double_reading[scan] = {
            "method": method_m.group(1) if method_m else "",
            "discrepancies": disc_m.group(1) if disc_m else "",
            "errors_r1": r1_m.group(1) if r1_m else "",
            "errors_r2": r2_m.group(1) if r2_m else "",
            "both_wrong": both_m.group(1) if both_m else "",
            "noise": noise_m.group(1) if noise_m else "",
        }

    # count engraving markers per page (for status.csv "engravings" column)
    engraving_counts = {}
    for scan in scans_in_tsv:
        if scan not in page_files:
            engraving_counts[scan] = 0
            continue
        body = body_cache.get(scan, "")
        engraving_counts[scan] = len(
            re.findall(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)[^\]]*\]", body)
        )

    # write status.csv
    with open(STATUS_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["scan", "label", "printed_number", "state", "unclear", "engravings", "note",
                    "method", "discrepancies", "errors_r1", "errors_r2", "both_wrong", "noise"])
        for scan in scans_in_tsv:
            label = label_by_scan.get(scan, "")
            printed = printed_numbers.get(scan, "")
            state = states.get(scan, "todo")
            unclear = unclear_counts.get(scan, 0)
            engr = engraving_counts.get(scan, 0)
            note_parts = []
            if scan in page_files:
                body = body_cache.get(scan, "")
                num_m = re.search(r"^Нумерация:.*$", body, re.M)
                if num_m:
                    note_parts.append(num_m.group(0))
            note = " | ".join(note_parts)
            dr = double_reading.get(scan, {})
            w.writerow([scan, label, printed, state, unclear, engr, note,
                        dr.get("method", ""), dr.get("discrepancies", ""),
                        dr.get("errors_r1", ""), dr.get("errors_r2", ""),
                        dr.get("both_wrong", ""), dr.get("noise", "")])

    # ---- Report ----
    print("=== Cartari check.py отчёт ===")
    print(f"Сканов в PAGES.tsv: {len(scans_in_tsv)}")
    print(f"Файлов в pages/: {len(page_files)}")
    print(f"Файлов в pages/_unmatched/: {len(unmatched_list)}  -> {unmatched_list}")
    print()
    print(f"state=draft: {sum(1 for s in states.values() if s == 'draft')}")
    print(f"state=todo:  {sum(1 for s in states.values() if s == 'todo')}")
    print()
    print(f"Осиротевшие файлы (scan без строки в PAGES.tsv): {len(orphans)} -> {orphans}")
    print(f"Дубли сканов в PAGES.tsv: {len(dup_scans)} -> {dup_scans}")
    print()
    print(f"Всего '[?]' по всем страницам: {unclear_total}")
    print()
    print(f"Расхождения нумерации (печатный номер в тексте vs label PAGES.tsv): {len(numbering_discrepancies)}")
    for scan, label, printed in numbering_discrepancies:
        print(f"  scan {scan}: label={label}  printed={printed}")
    print()
    print(f"Несовпадения кустод/первое слово след. страницы (кустод непустой): {len(kustod_mismatches)}")
    print("  (ожидаемо: у черновиков Grok кустоды почти везде пустые, поэтому список короткий или пустой)")
    for scan, kustod, nxt, nf in kustod_mismatches:
        print(f"  scan {scan}: кустод='{kustod}' != первое слово скана {nxt} ('{nf}')")
    print()
    print(f"status.csv записан: {STATUS_CSV}")


if __name__ == "__main__":
    main()
