"""
Готовит облегчённые изображения сканов для чтения субагентами.

Для каждого скана из PAGES.tsv берёт локальный файл из ~/Projects/photos/cartari/
(связка scan -> файл через _index.json: order = scan - 1) и сохраняет
обрезанную уменьшенную копию в _text/_img/NNNN.jpg.

Обрезка (чистый анализ яркости, без ИИ):
- убирает чёрный фон съёмочного стола (появляется либо слева, либо справа —
  книга фотографируется разворотом, у recto/verso страниц сторона меняется);
- убирает соседнюю страницу разворота (блёклый "просвет" у корешка);
- убирает нижнюю полосу с логотипом UB Heidelberg / DFG;
- поля с маргиналиями НЕ трогает — обрезка идёт точно по границе чёрного фона,
  весь текст страницы остаётся.

При любой неуверенности (нет чётного длинного тёмного участка у края) — не обрезает
эту сторону вообще, чтобы не отрезать настоящий текст. Это не 100% точная обрезка
для каждого скана, а быстрая предобработка для экономии токенов — финальная сверка
текста всегда идёт по оригинальному большому скану при малейшем сомнении.

Выход: высота ~1600px, JPEG quality 85. Папка _img/ в .gitignore, не коммитится.
"""

import csv
import json
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_TSV = os.path.join(HERE, "PAGES.tsv")
PHOTOS_DIR = os.path.expanduser("~/Projects/photos/cartari/")
INDEX_JSON = os.path.join(PHOTOS_DIR, "_index.json")
OUT_DIR = os.path.join(HERE, "_img")

TARGET_HEIGHT = 1600
JPEG_QUALITY = 85
EDGE_INSET = 12  # тонкий светлый артефакт съёмочной рамки у самого края кадра


def find_crop_box(arr_gray):
    h, w = arr_gray.shape
    r0, r1 = int(h * 0.15), int(h * 0.85)
    col_mean = arr_gray[r0:r1, EDGE_INSET:w - EDGE_INSET].mean(axis=0)
    w2 = len(col_mean)

    black_thresh = 55
    win = 25

    def dark_extent(from_left, max_scan_frac=0.35):
        limit = int(w2 * max_scan_frac)
        best = -1
        rng = range(0, limit) if from_left else range(w2 - 1, w2 - 1 - limit, -1)
        for i in rng:
            window = col_mean[i:i + win] if from_left else col_mean[i - win + 1:i + 1]
            if len(window) == 0:
                continue
            if np.median(window) < black_thresh:
                best = i
            else:
                break
        return best

    left_dark = dark_extent(True)
    right_dark = dark_extent(False)
    black_left = left_dark >= 60
    black_right = right_dark >= 0 and (w2 - 1 - right_dark) >= 60

    pad = 10
    crop_left = min(w2, left_dark + 1 + pad) if black_left else 0
    crop_right = max(0, right_dark - pad) if black_right else w2

    # соседняя страница / корешок — на стороне, противоположной чёрному фону:
    # участок умеренной яркости перед "настоящим" белым полем страницы
    bright_thresh = 230
    bright_run = 40
    max_trim_frac = 0.20
    if black_right and not black_left:
        i, limit, found = 0, int(w2 * max_trim_frac), None
        while i < limit:
            if np.all(col_mean[i:i + bright_run] >= bright_thresh):
                found = i
                break
            i += 1
        if found is not None:
            crop_left = found
    if black_left and not black_right:
        i, limit, found = w2 - 1, w2 - int(w2 * max_trim_frac), None
        while i > limit:
            if np.all(col_mean[i - bright_run:i] >= bright_thresh):
                found = i
                break
            i -= 1
        if found is not None:
            crop_right = found

    if crop_right <= crop_left:
        crop_left, crop_right = 0, w2

    crop_left += EDGE_INSET
    crop_right += EDGE_INSET

    # низ: полоса с логотипом UB Heidelberg / DFG, ищем по центральным колонкам
    c0, c1 = int(w * 0.15), int(w * 0.5)
    row_mean = arr_gray[EDGE_INSET:h - EDGE_INSET, c0:c1].mean(axis=1)
    h2 = len(row_mean)
    bottom = h2
    i = int(h2 * 0.7)
    while i < h2 and row_mean[i] >= black_thresh:
        i += 1
    if i < h2:
        bottom = max(0, i - pad)
    bottom += EDGE_INSET

    return crop_left, 0, crop_right, bottom


def load_scan_to_file():
    index = json.load(open(INDEX_JSON, encoding="utf-8"))
    # order (0-based) -> file; scan (1-based, из PAGES.tsv) = order + 1
    by_order = {item["order"]: item["file"] for item in index}
    scan_to_file = {}
    with open(PAGES_TSV, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            scan = row["scan"]
            order = int(scan) - 1
            if order in by_order:
                scan_to_file[scan] = by_order[order]
    return scan_to_file


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    scan_to_file = load_scan_to_file()
    done, skipped, errors = 0, 0, []
    for scan, fname in sorted(scan_to_file.items()):
        out_path = os.path.join(OUT_DIR, f"{scan}.jpg")
        src_path = os.path.join(PHOTOS_DIR, fname)
        if not os.path.exists(src_path):
            errors.append((scan, "исходный файл не найден"))
            continue
        try:
            im = Image.open(src_path)
            gray = np.array(im.convert("L"))
            box = find_crop_box(gray)
            cropped = im.crop(box)
            w, h = cropped.size
            if h > TARGET_HEIGHT:
                nw = int(w * TARGET_HEIGHT / h)
                cropped = cropped.resize((nw, TARGET_HEIGHT), Image.LANCZOS)
            cropped.convert("RGB").save(out_path, "JPEG", quality=JPEG_QUALITY)
            done += 1
        except Exception as e:
            errors.append((scan, str(e)))

    print(f"Обработано: {done}")
    print(f"Пропущено (нет исходника): {len([e for e in errors if e[1] == 'исходный файл не найден'])}")
    if errors:
        print(f"Ошибок: {len(errors)}")
        for scan, msg in errors[:20]:
            print(f"  {scan}: {msg}")
    print(f"Папка: {OUT_DIR}")


if __name__ == "__main__":
    main()
