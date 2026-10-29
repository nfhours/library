#!/usr/bin/env python3
"""Match articles (entries.json) to cut engraving crops (engravings.json) by
printed page number, so the article page can show the clean cut-out instead
of a scan of the whole page (frame, running header, caption and all).

entries.json's it.page is the article's printed-page span (a plain number, a
range, or several comma-separated ranges/numbers for a multi-part article).
engravings.json's "page" is the single printed-page label the crop's box was
drawn on (from SCAN_MAP.tsv's running-header reading, so usually numeric but
occasionally a roman numeral or a suffixed label like "586b" -- those are
skipped here, there's no reliable integer to match against). For each
illustrated article, pick the engraving whose page falls inside the
article's span (with a small fuzz for off-by-one leaf numbering), preferring
the one closest to the span's start -- the plate normally precedes its text
in this book layout.

Writes books/<book>/engraving_map.json: {article_id: engraving_file}.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def page_span(raw):
    nums = [int(n) for n in re.findall(r"\d+", str(raw or ""))]
    if not nums:
        return None
    return min(nums), max(nums)


def match_book(book):
    book_dir = os.path.join(REPO, "books", book)
    entries = json.load(open(os.path.join(book_dir, "entries.json"), encoding="utf-8"))
    eng_path = os.path.join(book_dir, "engravings.json")
    if not os.path.exists(eng_path):
        print(f"  ! no engravings.json for {book}, run cut_crops.py first", file=sys.stderr)
        return
    engravings = json.load(open(eng_path, encoding="utf-8"))

    eng_by_page = []
    for e in engravings:
        nums = re.findall(r"\d+", str(e.get("page") or ""))
        if not nums:
            continue
        eng_by_page.append((int(nums[0]), e["file"]))

    mapping = {}
    unmatched = 0
    for it in entries.get("items", []):
        if it.get("textOnly") or not it.get("img"):
            continue
        span = page_span(it.get("page"))
        if not span:
            continue
        pmin, pmax = span
        for fuzz in (0, 1, 2):
            candidates = [(p, f) for p, f in eng_by_page if pmin - fuzz <= p <= pmax + fuzz]
            if candidates:
                candidates.sort(key=lambda c: abs(c[0] - pmin))
                mapping[it["id"]] = candidates[0][1]
                break
        else:
            unmatched += 1

    out_path = os.path.join(book_dir, "engraving_map.json")
    json.dump(mapping, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{book}: matched {len(mapping)} articles to engravings, {unmatched} illustrated "
          f"articles left unmatched -> {out_path}")


if __name__ == "__main__":
    books = sys.argv[1:] or ["cartari"]
    for b in books:
        match_book(b)
