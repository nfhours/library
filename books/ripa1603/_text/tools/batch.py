#!/usr/bin/env python3
"""Ripa 1603 - оркестрация партии (механические шаги; чтение и разбор делают субагенты).
  python3 tools/batch.py prep A B       # _img + каталоги _reads/NNNN
  python3 tools/batch.py compare A B    # compare3 + вырезки по расхождениям
  python3 tools/batch.py finish A B     # reconcile всех страниц + check + build + bind + метрики партии
"""
import glob, os, re, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = HERE + "/tools/"


def run(*a, quiet=False):
    r = subprocess.run(["python3", *a], cwd=HERE, capture_output=True, text=True)
    if not quiet: print(r.stdout.strip()[-1500:], r.stderr.strip()[-500:])
    return r


def main():
    cmd, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    scans = ["%04d" % n for n in range(a, b + 1)]
    if cmd == "prep":
        run(T + "prep.py", "--scans", "%d-%d" % (a, b))
        for s in scans: os.makedirs("%s/_reads/%s" % (HERE, s), exist_ok=True)
    elif cmd == "compare":
        r = run(T + "compare3.py", "--scans", "%d-%d" % (a, b), quiet=True)
        print(r.stdout.strip().splitlines()[-1], r.stderr.strip()[-300:])
        for s in scans:
            j = "%s/_work/%s/diffs_crop.json" % (HERE, s)
            if os.path.exists(j):
                run(T + "crop_diff.py", "--batch-json", j, "--out-dir", "%s/_work/%s/crops" % (HERE, s), "--band", "0.18", "--upscale", "2.5", quiet=True)
    elif cmd == "finish":
        tot = dict(d=0, e1=0, e2=0, e3=0, b=0, n=0, h=0, hl=0, hm=0, ht=0, q=0)
        for s in scans:
            ans = "%s/_work/%s/answers.txt" % (HERE, s)
            if not os.path.exists(ans): print(s, "НЕТ answers.txt"); continue
            r = run(T + "reconcile.py", "--scan", s, "--answers", ans, quiet=True)
            if r.returncode: print(s, "ОШИБКА:", (r.stderr or r.stdout).strip()[-300:]); continue
            p = open("%s/pages/%s.md" % (HERE, s), encoding="utf-8").read()
            h = p.split("\n")[0]
            g = lambda k: int(re.search(k + r": (\d+)", h).group(1))
            tot["d"] += g("discrepancies"); tot["e1"] += g("errors_r1"); tot["e2"] += g("errors_r2"); tot["e3"] += g("errors_r3")
            tot["b"] += g("both_wrong"); tot["n"] += g("noise"); tot["h"] += g("hidden_errors"); tot["hl"] += g("hidden_errors_latin")
            tot["hm"] += g("hidden_errors_margin"); tot["ht"] += g("hidden_errors_text"); tot["q"] += p.count("[?]")
        run(T + "check.py", quiet=True); run(T + "build.py", quiet=True); run(T + "bind.py")
        n = len(scans)
        print("ПАРТИЯ %04d-%04d: расхождений %d (%.2f/стр) | errors r1/r2/r3 %d/%d/%d | both_wrong %d (%.2f/стр) | noise %d | hidden %d (latin %d, margin %d, text %d; %.2f/стр) | [?] %d"
              % (a, b, tot["d"], tot["d"] / n, tot["e1"], tot["e2"], tot["e3"], tot["b"], tot["b"] / n, tot["n"], tot["h"], tot["hl"], tot["hm"], tot["ht"], tot["h"] / n, tot["q"]))
        row = "| %04d–%04d | done | %d (%.2f/стр.) | %d/%d/%d | %d (%.2f/стр.) | %d (%.2f/стр.; latin %d, margin %d, text %d) | %d | noise %d |" % (a, b, tot["d"], tot["d"] / n, tot["e1"], tot["e2"], tot["e3"], tot["b"], tot["b"] / n, tot["h"], tot["h"] / n, tot["hl"], tot["hm"], tot["ht"], tot["q"], tot["n"])
        pp = HERE + "/PROGRESS.md"; lines = open(pp, encoding="utf-8").read().split("\n")
        if not any(l.startswith("| %04d–%04d" % (a, b)) for l in lines):
            idx = max(i for i, l in enumerate(lines) if l.startswith("| ") and i < 20)
            lines.insert(idx + 1, row); open(pp, "w", encoding="utf-8").write("\n".join(lines))


if __name__ == "__main__":
    main()
