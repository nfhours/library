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


def double_totals(rows, scans_filter=None):
    disc = r1 = r2 = both = noise = n = 0
    for r in rows:
        if r.get("method") != "double":
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
        if r.get("method") != "double":
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
