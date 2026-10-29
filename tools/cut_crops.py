#!/usr/bin/env python3
"""Cut ornament and engraving crops out of raw page scans.

Reads books/<book>/_crops/crops.json (boxes in percent-of-image coords) and
books/<book>/_crops/SCAN_MAP.tsv (crops_key -> raw scan filename, in case the
two differ -- see the numbering offset note in SCAN_MAP.tsv) and produces:

  books/<book>/ornaments/*.png     (+ .svg where the trace comes out clean)
  books/<book>/engravings/*.jpg           (raw crop, EXACTLY the crops.json
                                            box, full native resolution,
                                            untouched -- see the standing
                                            rule in books/<book>/_text/
                                            ALGORITHM.md: no auto-cropping
                                            of the frame, ever)
  books/<book>/engravings/*_display.webp  (same frame, processed for the
                                            reading page -- see below)
  books/<book>/ornaments.json    (flat list: file, type, letter, w, h)
  books/<book>/engravings.json   (file, display, page label, w, h -- for
                                   matching engravings to articles by
                                   printed page)

Ornament types processed: заставка (headpiece), концовка (tailpiece),
буквица (dropcap), разделитель (divider). These get the paper background
removed (via local-background subtraction, which copes with the scans'
own lighting vignette) and are flattened to a single dark ink color on a
transparent PNG. The same physical woodblock/capital is often printed
several times through the book; near-duplicate impressions are grouped
and only the sharpest one is kept (dropcaps are grouped by letter only --
one per letter, regardless of how many distinct blocks exist for it).

гравюра (engraving) boxes are cropped exactly as drawn -- the whole plate,
border and caption included, at full native resolution, no resizing, no
retouching. The "_display" copy is the only derived file: same frame,
REAL transparency baked into the pixels (paper -> transparent, ink ->
opaque dark ink color, hatching -> partial alpha), not a CSS blend trick
-- mix-blend-mode:multiply was tried and reverted twice (an animated
ancestor's transform isolated it the first time, the CSS mask added for
a soft edge isolated it the second time, since masking an element forces
it into its own compositing layer regardless of its ancestors). A
transparent pixel just doesn't paint, in any browser, under any stacking
context, so there's nothing left to isolate. A click is meant to open the
untouched raw file instead, "as in the book".
"""
import csv
import json
import os
import re
import sys

import cv2
import imagehash
import numpy as np
from PIL import Image

try:
    import vtracer
except ImportError:
    vtracer = None

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS_ROOT = os.path.expanduser("~/Projects/photos")

ORNAMENT_TYPES = {
    "заставка": "headpiece",
    "концовка": "tailpiece",
    "буквица": "dropcap",
    "разделитель": "divider",
}

INK_COLOR = (42, 36, 30)  # dark warm-black, matches reader's body text color

# Single place to tune the engraving "_display" tone normalization --
# see make_display_copy(). Per book, falling back to "default"; a book
# gets its own entry when its plates print consistently lighter/darker
# than this (e.g. a different edition's paper or ink run).
#   dark_pct   -- percentile of local darkness that anchors full opacity
#                 (the darkest dark_pct% of ink-bearing pixels reach the
#                 target ink color); the actual printed darkest impression
#                 sets the scale, not a fixed brightness value, so pale
#                 and heavy impressions both normalize to the same range.
#   floor      -- normalized darkness below this is paper noise, forced
#                 fully transparent (keeps the whitest pixels from leaving
#                 a faint haze).
#   gamma      -- <1 brightens the mid-tones (faint hatching becomes
#                 readable) without pushing them all the way to full
#                 opacity (dense hatching stays separable, doesn't clump
#                 into a solid blob).
#   feather_frac -- how far in from each edge the alpha ramps from 0 to
#                 full (fraction of that side's length).
DISPLAY_TONE = {
    "default": {"dark_pct": 98, "floor": 0.06, "gamma": 0.75, "feather_frac": 0.025},
}


def display_tone_for(book):
    return DISPLAY_TONE.get(book, DISPLAY_TONE["default"])

# crops_key -> set of box indices to skip: reviewed and rejected as not
# ornament-like (a border/frame, a full illustration mislabeled as a
# tailpiece, or a headpiece specifically asked to be dropped).
EXCLUDE_BOXES = {
    "0501_460.jpg": {0},
    "0036_XXVI.jpg": {0},
    "0041_1.jpg": {2},
}

# (crops_key, box index) -> type override: these were boxed as "концовка"
# but are plainly rows-of-florets dividers, not tailpiece motifs.
RECLASSIFY = {
    ("0491_450.jpg", 0): "разделитель",
    ("0514_473.jpg", 0): "разделитель",
    ("0532_491.jpg", 0): "разделитель",
    ("0540_499.jpg", 0): "разделитель",
    ("0563_522.jpg", 0): "разделитель",
    ("0615_570.jpg", 1): "разделитель",
    # "без_подписи" (unclassified) boxes that are plainly full plates in the
    # same picture+border+caption layout as every other "гравюра" box, just
    # never given a type while editing; 0006 is the title page's armorial
    # vignette, not that layout, but still full illustrated content worth
    # keeping rather than silently dropping.
    ("0006_Titelblatt_2r.jpg", 0): "гравюра",
    ("0071_30.jpg", 0): "гравюра",
    ("0380_339.jpg", 0): "гравюра",
    ("0436_395.jpg", 0): "гравюра",
    ("0531_490.jpg", 0): "гравюра",
    ("0593_548.jpg", 0): "гравюра",
    # boxed as "концовка" but is a full illustration, not a tailpiece motif
    # (flagged on the ornaments contact sheet) -- recovered as a plate
    # instead of simply dropped.
    ("0564_523.jpg", 0): "гравюра",
}

# Cyrillic glyphs that are visually identical to Latin letters -- labels were
# sometimes typed on a Cyrillic layout by mistake.
CYR_TO_LAT = {
    "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "К": "K",
    "М": "M", "О": "O", "Р": "P", "Т": "T", "Х": "X", "У": "Y",
}


def load_scan_map(book_dir):
    path = os.path.join(book_dir, "_crops", "SCAN_MAP.tsv")
    mapping = {}
    if not os.path.exists(path):
        return mapping
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            mapping[row["crops_key"]] = row
    return mapping


def resolve_source_path(book, crops_key, scan_rows):
    """crops_key is normally already the filename in the photos dir; fall
    back to the SCAN_MAP-recorded scan number if that exact file is missing
    (handles books where crops.json keys don't match raw scan filenames)."""
    direct = os.path.join(PHOTOS_ROOT, book, crops_key)
    if os.path.exists(direct):
        return direct
    row = scan_rows.get(crops_key)
    scan = row["scan"] if row else None
    if scan:
        candidates = [f for f in os.listdir(os.path.join(PHOTOS_ROOT, book))
                      if f.startswith(scan)]
        if candidates:
            return os.path.join(PHOTOS_ROOT, book, candidates[0])
    return None


def extract_letter(label):
    m = re.search(r"[уб][укв][квв]ица\s*([A-Za-zА-Яа-я])", label, re.IGNORECASE)
    if not m:
        return None
    ch = m.group(1).upper()
    return CYR_TO_LAT.get(ch, ch)


def page_label_of(crops_key, scan_rows):
    row = scan_rows.get(crops_key)
    return row["label"] if row else None


def make_display_copy(bgr, tone):
    """Same frame, no cropping -- a copy for the reading page with REAL
    transparency baked into the file, not a CSS blend trick: paper ->
    transparent, ink -> opaque dark ink color, hatching/halftone -> partial
    alpha in between. mix-blend-mode:multiply was tried first and reverted
    -- applying a CSS mask-image (for the soft edge) forces an element into
    its own compositing layer, which isolates its blend mode exactly the
    same way a transformed ancestor did; there's no CSS-only way to get
    both a masked edge and a working blend on the same element. Baking
    transparency into the pixels sidesteps the whole stacking-context
    question: a transparent pixel just doesn't paint, on any browser, in
    any context, with nothing to isolate it from.

    Same local-background-subtraction idea as remove_paper_background()
    (large-radius blur as the per-pixel paper estimate, so it copes with
    the plate's own lighting gradient), but anchored and curved
    differently (see DISPLAY_TONE/display_tone_for -- the one place these
    numbers live): a FIXED percentile of darkness, not a fixed brightness,
    reaches full opacity, so a pale impression and a heavy one both
    normalize into the same range instead of one reading too faint and
    the other too crushed; then gamma<1 brightens the mid-tones (faint
    hatching becomes readable) without pushing them all the way to full
    opacity (dense hatching stays separable, doesn't clump into a solid
    blob). The edges get an extra alpha feather baked in (soft falloff
    over the outer feather_frac of each side) since there's no longer a
    CSS mask to do it. The untouched color original is what a click opens."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    h, w = gray.shape
    sigma = max(h, w) / 5.0
    local_paper = cv2.GaussianBlur(gray, (0, 0), sigmaX=sigma)
    diff = np.clip(local_paper - gray, 0, None)
    anchor = max(np.percentile(diff, tone["dark_pct"]), 5)
    norm = np.clip(diff / anchor, 0, 1)
    floor = tone["floor"]
    norm = np.clip((norm - floor) / (1 - floor), 0, 1)
    alpha = norm ** tone["gamma"]

    feather_frac = tone["feather_frac"]
    fx = int(feather_frac * w) or 1
    fy = int(feather_frac * h) or 1
    ramp_x = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / fx, 0, 1)
    ramp_y = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / fy, 0, 1)
    feather = np.outer(ramp_y, ramp_x)
    alpha = alpha * feather

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 0] = INK_COLOR[2]
    out[:, :, 1] = INK_COLOR[1]
    out[:, :, 2] = INK_COLOR[0]
    out[:, :, 3] = (alpha * 255).astype(np.uint8)
    return out


def crop_box(img, box):
    h, w = img.shape[:2]
    x0 = int(round(box["x"] / 100.0 * w))
    y0 = int(round(box["y"] / 100.0 * h))
    x1 = int(round((box["x"] + box["w"]) / 100.0 * w))
    y1 = int(round((box["y"] + box["h"]) / 100.0 * h))
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(w, x1), min(h, y1)
    return img[y0:y1, x0:x1]


def remove_paper_background(bgr, floor=0.22, gamma=1.4):
    """Paper -> transparent, ink -> a single dark color. Estimates the LOCAL
    paper tone with a large-radius blur (ink lines are thin enough to vanish
    into it) and measures darkness against that instead of one global
    threshold, which is what a plain Otsu/percentile split got wrong on
    scans with any lighting vignette: a faint but uniform haze across the
    whole paper area, reading back as a visible translucent rectangle on
    anything but a light background. floor/gamma then cut that residual
    noise floor and add contrast so edges stay crisp rather than muddy."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    h, w = gray.shape
    sigma = max(h, w) / 5.0
    local_paper = cv2.GaussianBlur(gray, (0, 0), sigmaX=sigma)
    diff = np.clip(local_paper - gray, 0, None)
    scale = max(np.percentile(diff, 99.5), 10)
    norm = np.clip(diff / scale, 0, 1)
    norm = np.clip((norm - floor) / (1 - floor), 0, 1)
    norm = norm ** gamma
    alpha_u8 = (norm * 255).astype(np.uint8)

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 0] = INK_COLOR[2]
    out[:, :, 1] = INK_COLOR[1]
    out[:, :, 2] = INK_COLOR[0]
    out[:, :, 3] = alpha_u8
    return out


def clean_bleed(alpha, min_area_frac=0.0006, cum_frac=0.8, margin_frac=0.025):
    """Drop ink that's spatially outside the design's own core region -- a
    neighbouring letter or page-furniture fragment that strayed into a
    generously-drawn crop box. Only meant for dropcaps: they are one design
    in a frame, so a fragment with no spatial relation to it is foreign.

    The "core" region is the union bounding box of however many of the
    largest components it takes to cover cum_frac of the total ink area --
    NOT just the single largest component, which breaks on a dropcap whose
    engraving is many separate strokes with no one dominant blob (an ornate
    capital's hatching very rarely forms a single connected shape). Every
    component overlapping that core (expanded by a margin), however small,
    is kept -- including fine interior texture -- so only components with
    no spatial relation to the design at all get zeroed out. NOT used on
    headpieces/tailpieces/dividers, whose motifs can legitimately repeat
    further apart than a dropcap's stray neighbour ever would be."""
    h, w = alpha.shape
    binm = (alpha > 60).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binm, connectivity=8)
    sig = []
    for i in range(1, n):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < min_area_frac * h * w:
            continue
        x, y, bw, bh = stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP], \
            stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
        sig.append((i, x, y, x + bw, y + bh, area))
    if not sig:
        return alpha
    sig.sort(key=lambda c: -c[5])
    total = sum(c[5] for c in sig)
    core, acc = [], 0
    for c in sig:
        core.append(c)
        acc += c[5]
        if acc >= cum_frac * total:
            break
    cx0 = min(c[1] for c in core); cy0 = min(c[2] for c in core)
    cx1 = max(c[3] for c in core); cy1 = max(c[4] for c in core)
    margin = int(margin_frac * max(h, w))
    cx0 -= margin; cy0 -= margin; cx1 += margin; cy1 += margin

    drop = []
    for i in range(1, n):
        x, y, bw, bh = stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP], \
            stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
        x1, y1 = x + bw, y + bh
        if x1 < cx0 or x > cx1 or y1 < cy0 or y > cy1:
            drop.append(i)
    dropmask = np.isin(labels, drop)
    out = alpha.copy()
    out[dropmask] = 0
    return out


def trim_transparent(rgba, pad=4):
    alpha = rgba[:, :, 3]
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0:
        return rgba
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, rgba.shape[1])
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, rgba.shape[0])
    return rgba[y0:y1, x0:x1]


def sharpness_of(bgr):
    """Focus measure (variance of Laplacian) -- used to pick the crispest
    impression among several prints of the same woodblock/capital."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()


def group_near_duplicates(records, hash_threshold=10):
    """Cluster records (each with a PIL image in rec['_img']) by perceptual
    hash of their alpha silhouette -- same woodblock printed on different
    pages comes out visually near-identical. Returns one record per
    cluster, the one with the highest '_sharpness'."""
    hashes = []
    for rec in records:
        alpha_img = Image.fromarray(rec["_rgba"][:, :, 3])
        hashes.append(imagehash.phash(alpha_img))
    n = len(records)
    parent = list(range(n))

    def find(i):
        while parent[i] != i:
            i = parent[i]
        return i

    def union(i, j):
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj
    for i in range(n):
        for j in range(i + 1, n):
            if hashes[i] - hashes[j] <= hash_threshold:
                union(i, j)
    clusters = {}
    for i in range(n):
        clusters.setdefault(find(i), []).append(records[i])
    survivors = []
    for group in clusters.values():
        survivors.append(max(group, key=lambda r: r["_sharpness"]))
    return survivors


def try_make_svg(rgba, svg_path):
    if vtracer is None:
        return False
    # vtracer's binary colormode traces dark-on-light; fed the RGBA mask
    # directly it flattens transparency onto black, so the "paper" area
    # traces as one giant opaque rectangle instead of being ignored. Flatten
    # onto white first so only the actual ink lines register as foreground.
    h, w = rgba.shape[:2]
    alpha = rgba[:, :, 3:4].astype(np.float32) / 255.0
    ink_bgr = rgba[:, :, :3].astype(np.float32)
    white = np.full_like(ink_bgr, 255.0)
    flat = (ink_bgr * alpha + white * (1 - alpha)).astype(np.uint8)
    tmp_path = svg_path + ".trace.png"
    cv2.imwrite(tmp_path, flat)
    try:
        vtracer.convert_image_to_svg_py(
            tmp_path, svg_path,
            colormode="binary",
            mode="spline",
            filter_speckle=4,
            corner_threshold=60,
            length_threshold=4.0,
            splice_threshold=45,
            path_precision=2,
        )
    except Exception as e:
        print(f"    vtracer failed: {e}", file=sys.stderr)
        return False
    finally:
        os.remove(tmp_path)
    if not os.path.exists(svg_path):
        return False
    svg_text = open(svg_path, encoding="utf-8").read()
    size = os.path.getsize(svg_path)
    path_count = svg_text.count("<path")
    # Heuristic for "came out clean": not a huge blob of tiny paths (noisy
    # trace), not suspiciously large, and no single path covering ~the whole
    # canvas (a background rectangle slipping through, as above).
    big_path = re.search(r'translate\(0,0\)', svg_text) and path_count == 1
    if path_count == 0 or path_count > 120 or size > 300_000 or big_path:
        os.remove(svg_path)
        return False
    return True


def process_book(book):
    book_dir = os.path.join(REPO, "books", book)
    crops_path = os.path.join(book_dir, "_crops", "crops.json")
    crops = json.load(open(crops_path, encoding="utf-8"))
    scan_rows = load_scan_map(book_dir)

    orn_dir = os.path.join(book_dir, "ornaments")
    eng_dir = os.path.join(book_dir, "engravings")
    os.makedirs(orn_dir, exist_ok=True)
    os.makedirs(eng_dir, exist_ok=True)
    for f in os.listdir(orn_dir):
        os.remove(os.path.join(orn_dir, f))
    tone = display_tone_for(book)

    candidates = []  # ornament candidates, pre-dedup
    engravings = []
    n_skip = 0

    for crops_key, entry in sorted(crops.items()):
        boxes = entry.get("boxes", [])
        if not boxes:
            continue
        src_path = resolve_source_path(book, crops_key, scan_rows)
        if not src_path:
            print(f"  ! no source image for {crops_key}", file=sys.stderr)
            n_skip += len(boxes)
            continue
        img = cv2.imread(src_path)
        if img is None:
            print(f"  ! could not read {src_path}", file=sys.stderr)
            n_skip += len(boxes)
            continue
        base = os.path.splitext(crops_key)[0]

        for i, box in enumerate(boxes):
            if i in EXCLUDE_BOXES.get(crops_key, ()):
                n_skip += 1
                continue
            btype = RECLASSIFY.get((crops_key, i), box.get("type", ""))
            suffix = f"_{i}" if len(boxes) > 1 else ""

            if btype == "гравюра":
                crop = crop_box(img, box)
                if crop.size == 0:
                    n_skip += 1
                    continue
                h, w = crop.shape[:2]
                fname = f"{base}{suffix}.jpg"
                # Full native resolution, exactly the box -- no resizing,
                # no recropping. quality=97 so "raw" really means raw.
                cv2.imwrite(os.path.join(eng_dir, fname), crop, [cv2.IMWRITE_JPEG_QUALITY, 97])

                display = make_display_copy(crop, tone)
                display_fname = f"{base}{suffix}_display.webp"
                cv2.imwrite(os.path.join(eng_dir, display_fname), display, [cv2.IMWRITE_WEBP_QUALITY, 90])

                engravings.append({
                    "file": fname, "display": display_fname,
                    "width": w, "height": h,
                    "source": crops_key, "page": page_label_of(crops_key, scan_rows),
                })
                continue

            if btype not in ORNAMENT_TYPES:
                n_skip += 1
                continue

            crop = crop_box(img, box)
            if crop.size == 0:
                n_skip += 1
                continue
            rgba = remove_paper_background(crop)
            kind = ORNAMENT_TYPES[btype]
            if kind == "dropcap":
                rgba[:, :, 3] = clean_bleed(rgba[:, :, 3])
            rgba = trim_transparent(rgba)

            candidates.append({
                "kind": kind,
                "letter": extract_letter(box.get("label", "")) if kind == "dropcap" else None,
                "_rgba": rgba,
                "_sharpness": sharpness_of(crop),
                "base": base,
                "suffix": suffix,
            })

    # Same woodblock/capital gets reused across the book; keep only the
    # sharpest impression per group. Headpiece/tailpiece/divider are
    # deduped by visual near-duplicate (distinct designs survive separately);
    # dropcaps are collapsed straight to one-per-letter regardless of how
    # many visually distinct blocks exist for that letter.
    survivors = []
    for kind in ("headpiece", "tailpiece", "divider"):
        group = [c for c in candidates if c["kind"] == kind]
        survivors += group_near_duplicates(group)
    dropcaps = [c for c in candidates if c["kind"] == "dropcap" and c["letter"]]
    by_letter = {}
    for c in dropcaps:
        by_letter.setdefault(c["letter"], []).append(c)
    for letter, group in by_letter.items():
        survivors.append(max(group, key=lambda r: r["_sharpness"]))
    n_dropped_dupes = len(candidates) - len(survivors)

    ornaments = []
    for rec in sorted(survivors, key=lambda r: (r["kind"], r["base"], r["suffix"])):
        rgba = rec["_rgba"]
        fname = f"{rec['kind']}_{rec['base']}{rec['suffix']}.png"
        png_path = os.path.join(orn_dir, fname)
        Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)).save(png_path)

        svg_name = None
        svg_path = os.path.join(orn_dir, f"{rec['kind']}_{rec['base']}{rec['suffix']}.svg")
        if try_make_svg(rgba, svg_path):
            svg_name = os.path.basename(svg_path)

        h, w = rgba.shape[:2]
        density = float((rgba[:, :, 3] > 128).mean())
        record = {
            "file": fname, "svg": svg_name, "type": rec["kind"],
            "width": w, "height": h, "source": rec["base"],
            "density": round(density, 3),
        }
        if rec["kind"] == "dropcap":
            record["letter"] = rec["letter"]
        ornaments.append(record)

    json.dump(ornaments, open(os.path.join(book_dir, "ornaments.json"), "w", encoding="utf-8"),
               ensure_ascii=False, indent=2)
    json.dump(engravings, open(os.path.join(book_dir, "engravings.json"), "w", encoding="utf-8"),
               ensure_ascii=False, indent=2)
    print(f"{book}: {len(ornaments)} ornaments ({n_dropped_dupes} duplicate impressions dropped), "
          f"{len(engravings)} engravings, {n_skip} boxes skipped")


if __name__ == "__main__":
    books = sys.argv[1:] or ["cartari"]
    for b in books:
        process_book(b)
