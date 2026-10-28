#!/usr/bin/env python3
"""
Cartari 1626 - таблица соответствия номеров.

crops.json (редактор обрезки) нумерует файлы с нуля (0000_Einband.jpg -
обложка - это первый физический лист), а _text/pages/*.md и PAGES.tsv
нумеруют сканы с единицы (0001 = Einband). Поэтому номер в crops.json
всегда на 1 меньше номера соответствующего скана в pages/.

Строит эту таблицу не предположением о постоянном сдвиге, а проверкой
по подписи файла: для каждой строки PAGES.tsv (scan, label) берёт ключ
crops.json с номером (scan - 1) и сверяет его текстовый "хвост" (после
NNNN_) с label из PAGES.tsv - совпадение подтверждает соответствие,
несовпадение или отсутствие ключа идёт в столбец note.

Вывод: _crops/SCAN_MAP.tsv (scan, crops_key, crops_num, label, note).
Ничего не меняет ни в pages/*.md, ни в crops.json.
"""
import csv
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CROPS_DIR = os.path.dirname(HERE)
TEXT_DIR = os.path.join(os.path.dirname(CROPS_DIR), "_text")
CROPS_JSON = os.path.join(CROPS_DIR, "crops.json")
PAGES_TSV = os.path.join(TEXT_DIR, "PAGES.tsv")
OUT_TSV = os.path.join(CROPS_DIR, "SCAN_MAP.tsv")

KEY_RE = re.compile(r"^(\d{4})_(.*)\.jpe?g$", re.I)


def load_pages_tsv():
    rows = []
    with open(PAGES_TSV, encoding="utf-8") as f:
        r = csv.DictReader(f, delimiter="\t")
        for row in r:
            rows.append(row)
    return rows


def load_crops_by_num():
    d = json.load(open(CROPS_JSON, encoding="utf-8"))
    by_num = {}
    for key in d.keys():
        m = KEY_RE.match(key)
        if not m:
            continue
        by_num[int(m.group(1))] = (key, m.group(2))
    return by_num


def main():
    pages = load_pages_tsv()
    crops_by_num = load_crops_by_num()

    rows_out = []
    matched = 0
    mismatched_label = 0
    missing = 0
    for row in pages:
        scan = int(row["scan"])
        label = row["label"]
        crops_num = scan - 1
        entry = crops_by_num.get(crops_num)
        if entry is None:
            rows_out.append((row["scan"], "", str(crops_num), label, "нет записи в crops.json"))
            missing += 1
            continue
        key, tail = entry
        if tail == label:
            note = ""
            matched += 1
        else:
            note = f"метка crops.json не совпадает с PAGES.tsv ({tail!r} vs {label!r})"
            mismatched_label += 1
        rows_out.append((row["scan"], key, str(crops_num), label, note))

    with open(OUT_TSV, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["scan", "crops_key", "crops_num", "label", "note"])
        w.writerows(rows_out)

    print("=== Cartari: соответствие pages/ (с 1) <-> crops.json (с 0) ===")
    print(f"Строк PAGES.tsv: {len(pages)}")
    print(f"Совпало по номеру и метке: {matched}")
    print(f"Есть запись в crops.json, но метка не совпала: {mismatched_label}")
    print(f"Нет записи в crops.json вовсе: {missing}")
    print(f"Таблица записана: {OUT_TSV}")


if __name__ == "__main__":
    main()
