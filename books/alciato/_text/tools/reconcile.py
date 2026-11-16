#!/usr/bin/env python3
"""Alciato 1551 - применяет решения разбора к трём прочтениям и пишет итоговый pages/NNNN.md (state: done).

  python3 tools/reconcile.py --scan 0050 --answers _work/0050/answers.txt

Формат answers.txt (одна строка на расхождение; разделитель полей « ; »):
  N PAGES ; wrong=            расхождение без ошибки (noise); wrong=1,3 — ошибались read1 и read3
  N READ2 ; wrong=1,3 ; hidden=text|latin|margin    (hidden — два прочтения совпали на неверном)
  N ERRATA:напечатано|исправление ; wrong=
  N FIX:точный текст ; wrong=1,2,3
  N UNSURE ; wrong=
  NEW text|latin|margin ; было → стало   (скрытая ошибка, найденная вне списка расхождений; было — уникальная подстрока тела)
Строк RECROP быть не должно (повторить вырезку и разобрать заново).
"""
import argparse, csv, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import compare3 as C3  # noqa: E402


def parse_answers(path):
    ans, news = {}, []
    for ln in open(path, encoding="utf-8").read().splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#"): continue
        if ln.startswith("NEW"):
            m = re.match(r"NEW\s+(\w+)\s*;\s*(.+?)\s*(?:→|->)\s*(.+)$", ln)
            if not m: raise SystemExit("плохая строка NEW: " + ln)
            news.append((m.group(1), m.group(2), m.group(3))); continue
        parts = [p.strip() for p in ln.split(" ; ")]
        m = re.match(r"(\d+)\s+(.+)$", parts[0])
        if not m: raise SystemExit("плохая строка: " + ln)
        d = {"token": m.group(2).strip(), "wrong": [], "hidden": None}
        for p in parts[1:]:
            if p.startswith("wrong="): d["wrong"] = [int(x) for x in p[6:].split(",") if x.strip()]
            elif p.startswith("hidden="): d["hidden"] = p[7:].strip()
        ans[m.group(1)] = d
    return ans, news


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--scan", required=True); ap.add_argument("--answers", required=True)
    ap.add_argument("--source", default="new"); a = ap.parse_args()
    scan = a.scan
    ans, news = parse_answers(a.answers)
    R, diffs, body, fields, marg, multi = C3.build_page(scan, ans)
    missing = [d["id"] for d in diffs if d["id"] not in ans]
    if missing: raise SystemExit("нет ответов на расхождения: " + ",".join(missing))
    if any(v["token"] == "RECROP" for v in ans.values()): raise SystemExit("есть RECROP")
    errs = [0, 0, 0]; both = noise = 0; hid = {"latin": 0, "margin": 0, "text": 0}; unsure = 0
    for d in diffs:
        v = ans[d["id"]]
        for k in v["wrong"]: errs[k - 1] += 1
        if v["token"].startswith("FIX:") and len(v["wrong"]) == 3: both += 1
        if not v["wrong"] and v["token"] != "UNSURE": noise += 1
        if v["token"] == "UNSURE": unsure += 1
        if v["hidden"]:
            if v["hidden"] not in hid: raise SystemExit("hidden= только text|latin|margin")
            hid[v["hidden"]] += 1
    for kind, was, now in news:
        if body.count(was) != 1: raise SystemExit("NEW: «%s» встречается %d раз" % (was, body.count(was)))
        body = body.replace(was, now)
        if kind not in hid: raise SystemExit("NEW: тип text|latin|margin")
        hid[kind] += 1
    h = sum(hid.values())
    hdr = ("<!-- scan: %s | label: %s | state: done | source: %s | method: triple | discrepancies: %d | errors_r1: %d | errors_r2: %d | errors_r3: %d "
           "| both_wrong: %d | noise: %d | hidden_errors: %d | hidden_errors_latin: %d | hidden_errors_margin: %d | hidden_errors_text: %d -->"
           % (scan, C3.label_of(scan), a.source, len(diffs), errs[0], errs[1], errs[2], both, noise, h, hid["latin"], hid["margin"], hid["text"]))
    open(os.path.join(BASE, "pages", scan + ".md"), "w", encoding="utf-8").write(C3.render(hdr, body, fields, marg, multi))
    print("%s: расхождений %d | errors %s | both_wrong %d | noise %d | hidden %d (latin %d, margin %d, text %d) | [?] от UNSURE %d"
          % (scan, len(diffs), errs, both, noise, h, hid["latin"], hid["margin"], hid["text"], unsure))


if __name__ == "__main__":
    main()
