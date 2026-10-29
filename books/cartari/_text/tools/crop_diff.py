#!/usr/bin/env python3
"""
Cartari 1626 - вырезка фрагмента фото вокруг спорного слова для сверки
третьего слепого прочтения.

Печатную позицию строки в скане у нас нет (проза в pages/*.md хранится
без разрывов строк оригинала), поэтому место оценивается по ДОЛЕ текста:
ищем контекстный фрагмент (несколько слов вокруг спорного места, как их
печатает tools/compare.py) внутри текста страницы, берём долю
(смещение символа / длина текста) и вырезаем полосу по всей ширине
картинки вокруг этой доли высоты - с запасом на несколько строк сверху
и снизу (ширина полосы задаётся --band, по умолчанию 9% высоты
страницы - это огрубление "одна строка сверху/снизу", а не точный
расчёт строк, см. ALGORITHM.md). Для стихов (один элемент text_fr-массива
= одна печатная строка) это обычно попадает даже точнее, для прозы -
с запасом.

Использование:
    python3 tools/crop_diff.py --scan 0278 --context "gli suo lasciui disordinati" --out /tmp/crops/0278_01.png
    (можно несколько --context на один --scan - каждый сохранится в out с суффиксом _N)

Либо пакетно из JSON-списка расхождений (см. --batch-json), сразу по
всем спорным местам одной страницы - именно так его вызывает процесс
партии.
"""
import argparse
import json
import os
import re
import sys
import unicodedata

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
IMG_DIR = os.path.join(BASE, "_img")
PAGES_DIR = os.path.join(BASE, "pages")

sys.path.insert(0, HERE)
import compare  # noqa: E402


def normalize_loose(s):
    """Looser than compare.normalize_text: also folds accents/apostrophes,
    purely for LOCATING the snippet (position only) - not used for the
    actual reconciliation decision, which still happens by eye on the crop."""
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("ſ", "s").replace("'", " ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


PROSE_CHARS_PER_LINE = 70  # calibrated against this edition's typeface/column width


def body_lines_of(page_path):
    """Raw body lines (prose paragraph = 1 long line, each verse line its
    own line), same field-stripping as compare.parse_page but NOT joined -
    needed here to weight verse lines (1 printed line each) differently
    from prose lines (many printed lines each) when estimating position."""
    lines = []
    in_marginalia = False
    with open(page_path, encoding="utf-8") as f:
        raw = f.read().split("\n")
    for ln in raw:
        if compare.HEADER_RE.match(ln):
            continue
        m = compare.FIELD_RE.match(ln.strip())
        if m:
            in_marginalia = m.group(1) == "Маргиналии"
            continue
        if in_marginalia:
            continue
        lines.append(ln)
    return lines


def line_weight(line):
    s = line.strip()
    if not s:
        return 0
    if s.startswith("*") and s.endswith("*"):
        return 1  # one verse line = one printed line
    return max(1, round(len(s) / PROSE_CHARS_PER_LINE))


def find_fraction(page_path, context):
    """Returns (fraction 0..1, found: bool), weighting each raw body line
    by its ESTIMATED number of printed lines (verse: exactly 1; prose:
    char count / PROSE_CHARS_PER_LINE) rather than by raw character count -
    a verse quote takes much more vertical space per character than dense
    prose, so a pure character-offset fraction places the target too early
    on pages that open with verse (confirmed empirically on scan 0279).
    Still an estimate, not real OCR layout - the caller uses a generous
    --band to absorb the remaining error."""
    lines = body_lines_of(page_path)
    weights = [line_weight(ln) for ln in lines]
    total = sum(weights) or 1
    norm_ctx = normalize_loose(context)
    ctx_words = [w for w in norm_ctx.split() if len(w) >= 3]

    cum = 0.0
    best = None  # (score, fraction)
    for ln, w in zip(lines, weights):
        norm_ln = normalize_loose(ln)
        if norm_ctx and norm_ctx in norm_ln:
            frac = (cum + w / 2) / total
            return frac, True
        if ctx_words:
            hits = sum(1 for word in ctx_words if word in norm_ln)
            if hits and (best is None or hits > best[0]):
                best = (hits, (cum + w / 2) / total)
        cum += w
    if best:
        return best[1], True
    return 0.5, False


def crop_one(scan, context, out_path, band=0.09, upscale=2.5):
    img_path = os.path.join(IMG_DIR, f"{scan}.jpg")
    page_path = os.path.join(PAGES_DIR, f"{scan}.md")
    frac, found = find_fraction(page_path, context)

    im = Image.open(img_path)
    w, h = im.size
    y_center = frac * h
    half = band * h / 2
    y0 = max(0, int(y_center - half))
    y1 = min(h, int(y_center + half))
    if y1 <= y0:
        y0, y1 = 0, h
    crop = im.crop((0, y0, w, y1))
    if upscale and upscale != 1:
        crop = crop.resize((int(crop.width * upscale), int(crop.height * upscale)), Image.LANCZOS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    crop.convert("RGB").save(out_path, "JPEG", quality=92)
    return found, (y0, y1, h)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--scan", help="номер скана, напр. 0278")
    p.add_argument("--context", action="append", default=[], help="контекстный фрагмент (можно повторять)")
    p.add_argument("--out", help="путь для одиночной вырезки (с --context ровно один раз)")
    p.add_argument("--out-dir", help="папка для серии вырезок (с несколькими --context или --batch-json)")
    p.add_argument("--band", type=float, default=0.09, help="доля высоты страницы на вырезку (по умолчанию 0.09)")
    p.add_argument("--upscale", type=float, default=2.5, help="коэффициент увеличения (по умолчанию 2.5)")
    p.add_argument("--batch-json", help="путь к JSON-файлу: [{\"scan\":\"0278\",\"id\":\"1\",\"context\":\"...\"}, ...]")
    args = p.parse_args()

    if args.batch_json:
        items = json.load(open(args.batch_json, encoding="utf-8"))
        out_dir = args.out_dir or "/tmp/cartari_crops"
        for it in items:
            out_path = os.path.join(out_dir, f"{it['scan']}_{it['id']}.jpg")
            found, (y0, y1, h) = crop_one(it["scan"], it["context"], out_path, args.band, args.upscale)
            print(f"{it['scan']} #{it['id']}: {'OK' if found else 'не найден контекст, вырезка по центру'} "
                  f"y={y0}-{y1}/{h} -> {out_path}")
        return

    if len(args.context) == 1 and args.out:
        found, (y0, y1, h) = crop_one(args.scan, args.context[0], args.out, args.band, args.upscale)
        print(f"{'OK' if found else 'не найден контекст, вырезка по центру'} y={y0}-{y1}/{h} -> {args.out}")
        return

    out_dir = args.out_dir or "/tmp/cartari_crops"
    for i, ctx in enumerate(args.context, 1):
        out_path = os.path.join(out_dir, f"{args.scan}_{i}.jpg")
        found, (y0, y1, h) = crop_one(args.scan, ctx, out_path, args.band, args.upscale)
        print(f"#{i}: {'OK' if found else 'не найден контекст, вырезка по центру'} y={y0}-{y1}/{h} -> {out_path}")


if __name__ == "__main__":
    main()
