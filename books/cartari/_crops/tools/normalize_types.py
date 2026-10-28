#!/usr/bin/env python3
"""
Cartari 1626 - нормализация подписей рамок в crops.json.

Добавляет каждой рамке (box) поле "type" - один из семи фиксированных
вариантов (гравюра / заставка / концовка / буквица / разделитель /
марка / без_подписи), определённый по исходной подписи "label".
Само поле "label" не трогает - type добавляется рядом, как
дополнительное поле, не замена.

Классификация - по вхождению ключевого слова (без учёта регистра) в
label, в порядке проверки ниже; пустая подпись -> без_подписи. Слово
"буквица" ищется вместе с его опечаткой "уквица" (см. SCAN_MAP.tsv /
отчёт check: один box подписан "Юуквица P"), чтобы не провалиться в
"прочее" из-за опечатки в самой подписи - это не исправление подписи
(label остаётся "Юуквица P" как есть), только классификация.
"Марка" (издательская марка) в найденных подписях не встретилась -
отдельная проверка оставлена на случай будущих правок.

Порядок сверки: заставка/концовка/буквица/разделитель/марка проверяются
раньше "гравюра", поэтому "Гравюра концовка" идёт в "концовка" (концовка
важнее как более специфичная часть книги), а "Разворотная гравюра" - в
"гравюра" (в названии нет слова из других категорий).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CROPS_DIR = os.path.dirname(HERE)
CROPS_JSON = os.path.join(CROPS_DIR, "crops.json")

CATEGORIES = [
    ("заставка", ["заставка"]),
    ("концовка", ["концовка"]),
    ("буквица", ["буквица", "уквица"]),
    ("разделитель", ["разделитель"]),
    ("марка", ["марка"]),
    ("гравюра", ["гравюра"]),
]


def classify(label):
    s = (label or "").strip()
    if not s:
        return "без_подписи"
    low = s.lower()
    for type_name, keywords in CATEGORIES:
        if any(kw in low for kw in keywords):
            return type_name
    return "прочее"


def main():
    with open(CROPS_JSON, encoding="utf-8") as f:
        data = json.load(f)

    counts = {}
    unclassified = []
    changed = 0
    for key, entry in data.items():
        for box in entry.get("boxes") or []:
            t = classify(box.get("label"))
            counts[t] = counts.get(t, 0) + 1
            if t == "прочее":
                unclassified.append((key, box.get("label")))
            if box.get("type") != t:
                box["type"] = t
                changed += 1

    with open(CROPS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("=== Cartari _crops: нормализация type ===")
    print(f"Рамок обработано: {sum(counts.values())}, добавлено/обновлено поле type: {changed}")
    for t, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {n}")
    if unclassified:
        print(f"Не удалось классифицировать ни в одну категорию: {len(unclassified)}")
        for key, label in unclassified:
            print(f"  {key}: label={label!r}")
    print(f"crops.json перезаписан: {CROPS_JSON}")


if __name__ == "__main__":
    main()
