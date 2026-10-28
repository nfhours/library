#!/usr/bin/env python3
"""
Cartari 1626 - отчёт о состоянии транскрипции.
Чистый код, без вызовов AI/LLM. Источники: status.csv + git log.

Печатает:
  - готово: N из 639 и процент; отдельно done / draft / todo
  - диапазоны готовых (done) сканов
  - по методу двойного чтения: расхождений/errors_r1/errors_r2/both_wrong/noise
    за всё время и отдельно за последние 24 часа (по сканам, чьи pages/NNNN.md
    менялись коммитом за этот период)
  - последние 5 коммитов с временем
  - скорость: сканов в час за последние 3 часа и примерный остаток в часах
"""
import csv
import os
import re
import subprocess

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATUS_CSV = os.path.join(HERE, "status.csv")
REPO_ROOT = subprocess.run(
    ["git", "rev-parse", "--show-toplevel"], cwd=HERE,
    capture_output=True, text=True, check=True,
).stdout.strip()
PAGES_REL = os.path.relpath(os.path.join(HERE, "pages"), REPO_ROOT)
TOTAL_SCANS = 639


def load_status():
    with open(STATUS_CSV, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ranges(scans):
    nums = sorted(int(s) for s in scans)
    out = []
    i = 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
            j += 1
        out.append((nums[i], nums[j]))
        i = j + 1
    return out


def format_ranges(rs):
    parts = []
    for a, b in rs:
        parts.append(f"{a:04d}" if a == b else f"{a:04d}-{b:04d}")
    return parts


def is_double_method(method):
    return bool(method) and (method.startswith("double") or method.startswith("triple"))


def double_totals(rows, scans_filter=None):
    disc = r1 = r2 = both = noise = n = 0
    for r in rows:
        if not is_double_method(r.get("method")):
            continue
        if scans_filter is not None and r["scan"] not in scans_filter:
            continue
        n += 1
        disc += int(r["discrepancies"] or 0)
        r1 += int(r["errors_r1"] or 0)
        r2 += int(r["errors_r2"] or 0)
        both += int(r["both_wrong"] or 0)
        noise += int(r["noise"] or 0)
    return {"pages": n, "discrepancies": disc, "errors_r1": r1, "errors_r2": r2,
            "both_wrong": both, "noise": noise}


def git_log(args):
    out = subprocess.run(
        ["git", "-C", REPO_ROOT, "log"] + args,
        capture_output=True, text=True, check=True,
    ).stdout
    return out


SCAN_FILE_RE = re.compile(re.escape(PAGES_REL) + r"/(\d{4})\.md$")


def scans_touched_since(since):
    out = git_log([f"--since={since}", "--name-only", "--pretty=format:", "--", PAGES_REL])
    scans = set()
    for line in out.splitlines():
        m = SCAN_FILE_RE.search(line.strip())
        if m:
            scans.add(m.group(1))
    return scans


def range_breakdown(rows, bucket=50):
    buckets = {}
    for r in rows:
        if not is_double_method(r.get("method")):
            continue
        scan = int(r["scan"])
        start = (scan // bucket) * bucket
        b = buckets.setdefault(start, {"pages": 0, "r1": 0, "r2": 0, "bw": 0, "disc": 0})
        b["pages"] += 1
        b["r1"] += int(r["errors_r1"] or 0)
        b["r2"] += int(r["errors_r2"] or 0)
        b["bw"] += int(r["both_wrong"] or 0)
        b["disc"] += int(r["discrepancies"] or 0)
    return buckets


PIGNORIA_START = 502


def pignoria_split_totals(rows):
    main = double_totals(rows, scans_filter={r["scan"] for r in rows if r["scan"].isdigit() and int(r["scan"]) < PIGNORIA_START})
    pign = double_totals(rows, scans_filter={r["scan"] for r in rows if r["scan"].isdigit() and int(r["scan"]) >= PIGNORIA_START})
    return main, pign


def print_pignoria_split(rows):
    main, pign = pignoria_split_totals(rows)
    print(f"Основной текст (<{PIGNORIA_START}) vs «Annotationi di Pignoria» (>={PIGNORIA_START}):")
    for label, b in (("основной текст", main), ("Pignoria", pign)):
        n = b["pages"]
        if n == 0:
            print(f"  {label:<16} страниц: 0")
            continue
        print(f"  {label:<16} страниц: {n:>4} | disc/стр: {b['discrepancies']/n:>5.2f} | "
              f"err_r1/стр: {b['errors_r1']/n:>5.2f} | err_r2/стр: {b['errors_r2']/n:>5.2f} | "
              f"both_wrong/стр: {b['both_wrong']/n:>5.2f}")
    print()


def print_range_breakdown(rows, bucket=50):
    buckets = range_breakdown(rows, bucket)
    print(f"Разбивка по диапазонам (каждые {bucket} сканов, только method=double):")
    header = f"  {'диапазон':<14}{'стр.':>5}{'disc/стр':>10}{'err_r1/стр':>12}{'err_r2/стр':>12}{'both_wrong/стр':>16}"
    print(header)
    for start in sorted(buckets):
        b = buckets[start]
        end = start + bucket - 1
        n = b["pages"]
        if n == 0:
            continue
        print(f"  {start:04d}-{end:04d}   {n:>5}{b['disc']/n:>10.1f}{b['r1']/n:>12.2f}{b['r2']/n:>12.2f}{b['bw']/n:>16.2f}")
    print()


def is_triple_method(method):
    return bool(method) and (method.startswith("triple") or "triple-reconciled" in method)


def triple_hidden_totals(rows):
    pages = 0
    measured = 0
    total = latin = margin = text = 0
    for r in rows:
        if not is_triple_method(r.get("method")):
            continue
        pages += 1
        h = r.get("hidden_errors", "")
        if h == "":
            continue
        measured += 1
        total += int(h or 0)
        latin += int(r.get("hidden_errors_latin") or 0)
        margin += int(r.get("hidden_errors_margin") or 0)
        text += int(r.get("hidden_errors_text") or 0)
    return {"pages": pages, "measured": measured, "total": total,
            "latin": latin, "margin": margin, "text": text}


def print_triple_hidden(rows):
    t = triple_hidden_totals(rows)
    print("Тройное чтение — скрытые совпавшие ошибки (2 из 3 источников совпали неверно, 3-й поймал):")
    print(f"  страниц методом triple/triple-reconciled: {t['pages']}")
    print(f"  из них размечено полем hidden_errors: {t['measured']} "
          f"(остальные {t['pages'] - t['measured']} — страницы до введения поля, не размечены, не реконструировались задним числом)")
    if t["measured"]:
        print(f"  скрытых ошибок всего: {t['total']} ({t['total'] / t['measured']:.2f} на размеченную страницу)")
        print(f"    в латинских/греческих цитатах: {t['latin']}")
        print(f"    в маргиналиях/сигнатурах/кустодах: {t['margin']}")
        print(f"    в основном итальянском тексте: {t['text']}")
    else:
        print("  скрытых ошибок: нет размеченных страниц")
    print()


THIRD_READING_SCOPE = (5, 636)  # scans 0005-0636, text-bearing pages only


def is_text_page(scan):
    fn = os.path.join(HERE, "pages", f"{scan:04d}.md")
    try:
        with open(fn, encoding="utf-8") as f:
            body = f.read()
    except FileNotFoundError:
        return False
    lines = body.split("\n")
    content = "\n".join(lines[1:]).strip()
    stripped = re.sub(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)[^\]]*\]", "", content)
    stripped = re.sub(r"(?m)^(Колонтитул|Кустод|Сигнатура|Маргиналии|Рукописно|Штамп|Нумерация):.*$", "", stripped)
    return len(stripped.strip()) > 50


def third_reading_planned():
    lo, hi = THIRD_READING_SCOPE
    return [n for n in range(lo, hi + 1) if is_text_page(n)]


def third_reading_totals(rows, bucket=50):
    planned = set(third_reading_planned())
    by_row = {int(r["scan"]): r for r in rows if r["scan"].isdigit()}
    done = 0
    total = {"accents": 0, "other": 0, "errata": 0, "unclear": 0}
    buckets = {}
    for n in sorted(planned):
        r = by_row.get(n)
        if not r or r.get("hidden_accents", "") == "":
            continue
        done += 1
        accents = int(r.get("hidden_accents") or 0)
        other = int(r.get("hidden_other") or 0)
        errata = int(r.get("errata") or 0)
        unclear = int(r.get("unclear") or 0)
        total["accents"] += accents
        total["other"] += other
        total["errata"] += errata
        total["unclear"] += unclear
        b = (n // bucket) * bucket
        bd = buckets.setdefault(b, {"pages": 0, "accents": 0, "other": 0, "errata": 0, "unclear": 0})
        bd["pages"] += 1
        bd["accents"] += accents
        bd["other"] += other
        bd["errata"] += errata
        bd["unclear"] += unclear
    return {"planned": len(planned), "done": done, "total": total, "buckets": buckets}


def print_third_reading(rows):
    t = third_reading_totals(rows)
    print(f"Третье слепое прочтение (сканы {THIRD_READING_SCOPE[0]:04d}-{THIRD_READING_SCOPE[1]:04d}, только текстовые):")
    print(f"  пройдено: {t['done']} из {t['planned']} запланированных ({t['done'] / t['planned'] * 100:.1f}%)" if t['planned'] else "  запланировано: 0")
    tot = t["total"]
    if t["done"]:
        print(f"  всего: hidden_accents={tot['accents']} | hidden_other={tot['other']} | "
              f"новых опечаток={tot['errata']} | [?]={tot['unclear']}")
        print(f"  на страницу: hidden_accents={tot['accents']/t['done']:.2f} | hidden_other={tot['other']/t['done']:.2f} | "
              f"новых опечаток={tot['errata']/t['done']:.2f} | [?]={tot['unclear']/t['done']:.2f}")
    print("  по диапазонам (каждые 50 сканов):")
    print(f"    {'диапазон':<14}{'стр.':>5}{'accents/стр':>13}{'other/стр':>11}{'errata/стр':>12}{'[?]/стр':>9}")
    for b in sorted(t["buckets"]):
        bd = t["buckets"][b]
        n = bd["pages"]
        if n == 0:
            continue
        print(f"    {b:04d}-{b+49:04d}   {n:>5}{bd['accents']/n:>13.2f}{bd['other']/n:>11.2f}{bd['errata']/n:>12.2f}{bd['unclear']/n:>9.2f}")
    print()


def recent_commits(n=5):
    out = git_log([f"-{n}", "--pretty=format:%h\t%ad\t%s", "--date=format:%Y-%m-%d %H:%M"])
    return [line.split("\t", 2) for line in out.splitlines() if line.strip()]


def main():
    rows = load_status()
    states = {}
    for r in rows:
        states.setdefault(r["state"], []).append(r["scan"])

    done = states.get("done", [])
    draft = states.get("draft", [])
    todo = states.get("todo", [])

    print("=== Cartari: отчёт о состоянии ===\n")

    print(f"Готово: {len(done)} из {TOTAL_SCANS} ({len(done) / TOTAL_SCANS * 100:.1f}%)")
    print(f"  done:  {len(done)}")
    print(f"  draft: {len(draft)}")
    print(f"  todo:  {len(todo)}")
    print()

    print("Диапазоны готовых (done) сканов:")
    for part in format_ranges(ranges(done)):
        print(f"  {part}")
    print()

    print_range_breakdown(rows)
    print_pignoria_split(rows)
    print_triple_hidden(rows)
    print_third_reading(rows)

    all_time = double_totals(rows)
    last24 = scans_touched_since("24 hours ago")
    last24_totals = double_totals(rows, scans_filter=last24)

    print("Метод двойного чтения — за всё время:")
    print(f"  страниц: {all_time['pages']}")
    print(f"  discrepancies: {all_time['discrepancies']} | errors_r1: {all_time['errors_r1']} | "
          f"errors_r2: {all_time['errors_r2']} | both_wrong: {all_time['both_wrong']} | "
          f"noise: {all_time['noise']}")
    print()

    print("Метод двойного чтения — за последние 24 часа:")
    print(f"  страниц тронуто (по git log): {len(last24)}")
    print(f"  discrepancies: {last24_totals['discrepancies']} | errors_r1: {last24_totals['errors_r1']} | "
          f"errors_r2: {last24_totals['errors_r2']} | both_wrong: {last24_totals['both_wrong']} | "
          f"noise: {last24_totals['noise']}")
    print()

    print("Последние 5 коммитов:")
    for h, d, s in recent_commits(5):
        print(f"  {d}  {h}  {s}")
    print()

    last3 = scans_touched_since("3 hours ago")
    rate = len(last3) / 3.0
    remaining_scans = TOTAL_SCANS - len(done)
    print("Скорость:")
    print(f"  сканов тронуто за последние 3 часа: {len(last3)}")
    if rate > 0:
        print(f"  скорость: {rate:.1f} сканов/час")
        print(f"  осталось сканов: {remaining_scans}")
        print(f"  примерный остаток: {remaining_scans / rate:.1f} часов")
    else:
        print("  скорость: нет данных (за последние 3 часа ничего не тронуто)")


if __name__ == "__main__":
    main()
