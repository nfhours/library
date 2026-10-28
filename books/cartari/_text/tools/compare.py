#!/usr/bin/env python3
"""
Cartari 1626 - сравнение pages/NNNN.md (done, сверено построчно с фото)
с _blind/NNNN.md (слепое прочтение тех же сканов с нуля).
Чистый код, без ИИ.

Для каждого скана из списка:
  - извлекает основной текст (без служебных строк и комментария-заголовка);
  - извлекает служебные поля: Колонтитул, Кустод, Сигнатура, Маргиналии;
  - из blind-файла дополнительно вытаскивает инлайн-пометы вида
    "[Эхо: слово]" (место для маргиналии-отголоска, подставленное слепым
    чтением прямо в строку стиха) и добавляет их к списку маргиналий blind,
    а из текста для сравнения тела страницы вырезает;
  - нормализует только регистр, долгую ſ->s и пробелы/переносы; акценты
    (à/è/ì/ò/ù), апострофы и u/v сравниваются как напечатано/транскрибировано
    (раньше здесь была NFKD-нормализация, прятавшая расхождения в диакритике
    и u/v — см. ALGORITHM.md) — и доп. убирает курсивные `*`;
  - сравнивает нормализованные последовательности слов тела страницы
    через difflib.SequenceMatcher, печатает несовпадающие участки
    (оригинальный, не нормализованный текст, с небольшим контекстом);
  - отдельно сравнивает Колонтитул/Кустод/Сигнатуру (нормализованно);
  - отдельно сравнивает списки Маргиналий (нормализованно, без учёта порядка).

Ничего не правит, только печатает расхождения и считает их количество.
"""
import argparse
import difflib
import os
import re
import sys
import unicodedata

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(BASE, "pages")
BLIND_DIR = os.path.join(BASE, "_blind")

SCANS = [
    "0138", "0139", "0140", "0141", "0142", "0143", "0144", "0145", "0146",
    "0147", "0148", "0149", "0150", "0151", "0154", "0156", "0159", "0161",
    "0163", "0165",
]


def parse_args():
    p = argparse.ArgumentParser(
        description="Сравнивает две папки с транскрипцией одних и тех же сканов "
                    "(done/pages vs blind, или read1 vs read2 для метода двойного "
                    "чтения новых страниц) — та же нормализация, что в check.py."
    )
    p.add_argument("--dir-a", default=PAGES_DIR, help="первая папка (по умолчанию pages/)")
    p.add_argument("--dir-b", default=BLIND_DIR, help="вторая папка (по умолчанию _blind/)")
    p.add_argument("--label-a", default="done", help="подпись первой папки в выводе")
    p.add_argument("--label-b", default="blind", help="подпись второй папки в выводе")
    p.add_argument(
        "--scans", default=None,
        help="сканы через запятую, напр. 0001,0002,0003 (по умолчанию — встроенный список SCANS)",
    )
    return p.parse_args()

HEADER_RE = re.compile(r"^<!--.*-->\s*$")
FIELD_RE = re.compile(
    r"^(Колонтитул|Кустод|Сигнатура|Маргиналии|Нумерация):[ \t]*(.*)$"
)
MARGIN_ITEM_RE = re.compile(r"^-\s*(.*)$")
ECHO_INLINE_RE = re.compile(r"\[Эхо:\s*([^\]]*?)\s*\]")
BRACKET_NOTE_RE = re.compile(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)[^\]]*\]")


def normalize_text(s):
    """Normalizes only whitespace/hyphenation and case; long-s is folded to
    s (same glyph, not a transcription choice). Accents (à/è/ì/ò/ù),
    apostrophes, and u/v are kept exactly as transcribed, since those are
    real orthographic choices that can hide genuine discrepancies when
    stripped (see ALGORITHM.md's note on compare.py's former blind spot).
    i/j is intentionally left unnormalized too, for the same reason."""
    if not s:
        return ""
    s = s.lower()
    s = s.replace("ſ", "s")
    s = re.sub(r"[^a-zà-öø-ÿ0-9']+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normalize_word(w):
    return normalize_text(w).replace(" ", "")


def tokenize(s):
    """Split into word tokens (letters/digits/apostrophes kept inside words)."""
    return re.findall(r"[A-Za-zÀ-ÿſ]+(?:'[A-Za-zÀ-ÿſ]+)?", s)


def parse_page(path, is_blind):
    """Returns dict: body_text (str, joined), fields: dict of
    kolontitul/kustod/signatura, marginalia: list[str] (normalized-ready,
    original case kept), echo_notes: list[str] (only meaningful for blind)."""
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")

    fields = {"Колонтитул": "", "Кустод": "", "Сигнатура": ""}
    marginalia = []
    body_lines = []
    echo_notes = []

    in_marginalia = False
    for ln in lines:
        if HEADER_RE.match(ln):
            continue
        m = FIELD_RE.match(ln.strip())
        if m:
            name, val = m.group(1), m.group(2).strip()
            if name == "Маргиналии":
                in_marginalia = True
                continue
            else:
                in_marginalia = False
                if name in fields:
                    fields[name] = val
                continue
        stripped = ln.strip()
        if in_marginalia:
            mi = MARGIN_ITEM_RE.match(stripped)
            if mi:
                marginalia.append(mi.group(1).strip())
                continue
            if stripped == "":
                continue
            # a stray non-dash line while "in marginalia" - stop section
            in_marginalia = False
        # ordinary body line
        body_lines.append(ln)

    body_text = "\n".join(body_lines)

    # pull out inline echo notes (only expected in blind files)
    def _grab_echo(m):
        echo_notes.append(m.group(1).strip())
        return " "

    body_text = ECHO_INLINE_RE.sub(_grab_echo, body_text)

    return {
        "fields": fields,
        "marginalia": marginalia,
        "body_text": body_text,
        "echo_notes": echo_notes,
    }


def _bracket_caption(m):
    """[ГРАВЮРА: <подпись буква в букву>. — <своб. описание картинки>] ->
    keep only <подпись>, which IS transcribed book text and must be
    compared word by word; drop the free-form visual description and bare
    markers like "[ГРАВЮРА — полностраничная]" or "[ИНИЦИАЛ: буква]"."""
    content = m.group(0)[1:-1]  # strip [ ]
    if ":" not in content:
        return " "
    _, rest = content.split(":", 1)
    kind = m.group(1)
    if kind == "ИНИЦИАЛ":
        return " "
    # cut off the free-form description after an em/en dash separator
    rest = re.split(r"\s+[—–]\s+", rest, maxsplit=1)[0]
    return " " + rest + " "


def body_tokens_with_norm(body_text):
    """Return list of (original_token, normalized_token) in reading order.
    Bracket notes [ГРАВЮРА: ...]/[ВИНЬЕТКА: ...]/[ИНИЦИАЛ: ...] are reduced
    to just their transcribed caption text (if any), stripping the free-form
    visual description that is not actual book text."""
    text_wo_brackets = BRACKET_NOTE_RE.sub(_bracket_caption, body_text)
    toks = tokenize(text_wo_brackets)
    return [(t, normalize_word(t)) for t in toks]


def _strip_trailing_kustod_dup(pairs, kustod_val):
    """blind sometimes repeats the bottom-of-page catchword as the literal
    last word of the running text (done never does - it only records it in
    the 'Кустод:' field), e.g. body ends '...altero.' then a lone 'Questo'
    line that duplicates Кустод: Questo. That is a formatting choice, not a
    transcription difference, so drop such a trailing duplicate token
    before diffing. Handles hyphenated/partial catchwords too (last body
    token being a prefix of, or equal to, the catchword)."""
    if not pairs or not kustod_val:
        return pairs
    target = normalize_word(kustod_val.rstrip("-"))
    if not target:
        return pairs
    last_norm = pairs[-1][1]
    if last_norm and (target.startswith(last_norm) or last_norm.startswith(target)):
        return pairs[:-1]
    return pairs


def diff_bodies(scan, done_body, blind_body, done_kustod, blind_kustod):
    done_pairs = body_tokens_with_norm(done_body)
    blind_pairs = body_tokens_with_norm(blind_body)
    done_pairs = _strip_trailing_kustod_dup(done_pairs, done_kustod)
    blind_pairs = _strip_trailing_kustod_dup(blind_pairs, blind_kustod)
    done_norm = [p[1] for p in done_pairs]
    blind_norm = [p[1] for p in blind_pairs]

    sm = difflib.SequenceMatcher(a=done_norm, b=blind_norm, autojunk=False)
    diffs = []
    CONTEXT = 3
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        d_lo = max(0, i1 - CONTEXT)
        d_hi = min(len(done_pairs), i2 + CONTEXT)
        b_lo = max(0, j1 - CONTEXT)
        b_hi = min(len(blind_pairs), j2 + CONTEXT)
        done_snip = " ".join(p[0] for p in done_pairs[d_lo:d_hi])
        blind_snip = " ".join(p[0] for p in blind_pairs[b_lo:b_hi])
        done_changed = " ".join(p[0] for p in done_pairs[i1:i2]) or "(нет / пропуск)"
        blind_changed = " ".join(p[0] for p in blind_pairs[j1:j2]) or "(нет / пропуск)"
        diffs.append({
            "tag": tag,
            "done_changed": done_changed,
            "blind_changed": blind_changed,
            "done_ctx": done_snip,
            "blind_ctx": blind_snip,
        })
    return diffs


def compare_fields(scan, done_fields, blind_fields):
    mismatches = []
    for name in ("Колонтитул", "Кустод", "Сигнатура"):
        dv = done_fields.get(name, "")
        bv = blind_fields.get(name, "")
        if name == "Колонтитул":
            # done puts the printed page number before or after the running
            # title inconsistently across old batches, and blind always
            # uses "title · number" - order is not a real discrepancy, only
            # the actual words/digits are. Compare as a bag of tokens.
            dn = sorted(normalize_text(dv).split())
            bn = sorted(normalize_text(bv).split())
            if dn != bn:
                mismatches.append((name, dv, bv))
        elif name == "Сигнатура":
            # "G2" vs "G 2" is pure spacing, not a content difference.
            dn = normalize_text(dv).replace(" ", "")
            bn = normalize_text(bv).replace(" ", "")
            if dn != bn:
                mismatches.append((name, dv, bv))
        else:
            if normalize_text(dv) != normalize_text(bv):
                mismatches.append((name, dv, bv))
    return mismatches


def compare_marginalia(scan, done_marg, blind_marg, blind_echo):
    # blind's margin-equivalent pool = explicit Маргиналии: list + inline
    # echo notes pulled out of the verse body (same semantic slot: a short
    # margin annotation next to a line of text).
    blind_pool = list(blind_marg) + list(blind_echo)

    done_norm = [normalize_text(x) for x in done_marg]
    blind_norm = [normalize_text(x) for x in blind_pool]

    done_remaining = list(zip(done_marg, done_norm))
    blind_remaining = list(zip(blind_pool, blind_norm))

    # exact-normalized matching, remove matched pairs greedily
    only_done = []
    for orig, norm in done_remaining:
        idx = next((k for k, (o2, n2) in enumerate(blind_remaining) if n2 == norm), None)
        if idx is not None:
            blind_remaining.pop(idx)
        else:
            only_done.append(orig)
    only_blind = [orig for orig, norm in blind_remaining]
    return only_done, only_blind


def main():
    args = parse_args()
    dir_a, dir_b = args.dir_a, args.dir_b
    label_a, label_b = args.label_a, args.label_b
    scans = args.scans.split(",") if args.scans else SCANS

    total_body_diffs = 0
    total_field_mismatches = 0
    total_marginalia_mismatches = 0

    print(f"=== Cartari compare.py: {label_a} ({dir_a}) vs {label_b} ({dir_b}) ===")
    print(f"Сканов для сверки: {len(scans)}")
    print()

    for scan in scans:
        done_path = os.path.join(dir_a, f"{scan}.md")
        blind_path = os.path.join(dir_b, f"{scan}.md")
        if not os.path.isfile(done_path):
            print(f"[{scan}] НЕТ файла {label_a}/{scan}.md — пропуск")
            continue
        if not os.path.isfile(blind_path):
            print(f"[{scan}] НЕТ файла {label_b}/{scan}.md — пропуск")
            continue

        done = parse_page(done_path, is_blind=False)
        blind = parse_page(blind_path, is_blind=True)

        body_diffs = diff_bodies(
            scan, done["body_text"], blind["body_text"],
            done["fields"].get("Кустод", ""), blind["fields"].get("Кустод", ""),
        )
        field_mismatches = compare_fields(scan, done["fields"], blind["fields"])
        only_done_marg, only_blind_marg = compare_marginalia(
            scan, done["marginalia"], blind["marginalia"], blind["echo_notes"]
        )

        if not body_diffs and not field_mismatches and not only_done_marg and not only_blind_marg:
            continue

        print(f"--- Скан {scan} ---")

        if body_diffs:
            print(f"  Расхождения текста ({len(body_diffs)}):")
            for d in body_diffs:
                print(f"    {label_a}:  ...{d['done_ctx']}...")
                print(f"    {label_b}: ...{d['blind_ctx']}...")
                print(f"      [{label_a}='{d['done_changed']}' | {label_b}='{d['blind_changed']}']")
            total_body_diffs += len(body_diffs)

        if field_mismatches:
            print(f"  Расхождения служебных полей ({len(field_mismatches)}):")
            for name, dv, bv in field_mismatches:
                print(f"    {name}: {label_a}='{dv}' | {label_b}='{bv}'")
            total_field_mismatches += len(field_mismatches)

        if only_done_marg or only_blind_marg:
            print(f"  Расхождения маргиналий ({label_a} {len(only_done_marg)} без пары / {label_b} {len(only_blind_marg)} без пары):")
            for x in only_done_marg:
                print(f"    только в {label_a}:  {x}")
            for x in only_blind_marg:
                print(f"    только в {label_b}: {x}")
            total_marginalia_mismatches += len(only_done_marg) + len(only_blind_marg)

        print()

    print("=== Итого ===")
    print(f"Расхождений текста (участков diff): {total_body_diffs}")
    print(f"Расхождений служебных полей: {total_field_mismatches}")
    print(f"Расхождений маргиналий (непарных пунктов): {total_marginalia_mismatches}")


if __name__ == "__main__":
    main()
