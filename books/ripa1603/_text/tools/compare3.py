#!/usr/bin/env python3
"""Ripa 1603 - сведение ТРЕХ независимых прочтений страницы (_reads/NNNN/read1..3.md).

Нормализуются только регистр, долгая ſ→s и пробелы/пунктуация (токены = слова из латинских букв);
ударения, апострофы, u/v, i/j НЕ нормализуются (то же, что compare.py).

  python3 tools/compare3.py --scans 50-69          # пишет _work/NNNN/diffs.json, diffs_crop.json и черновик pages/NNNN.md (state: draft)
  (модуль) build_page(scan, answers=None)          # используется reconcile.py

Расхождение = место, где не все три прочтения совпали. База (read1) задаёт позиции; для каждого расхождения
хранятся варианты всех трёх прочтений, вариант большинства (если два совпали) и позиция в тексте read1.
"""
import argparse, difflib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import compare as C  # noqa: E402

READS = os.path.join(BASE, "_reads")
WORK = os.path.join(BASE, "_work")
PAGES = os.path.join(BASE, "pages")
WORD_RE = re.compile(r"[A-Za-zÀ-ÿſ]+(?:'[A-Za-zÀ-ÿſ]+)?")
BR_RE = re.compile(r"\[(ГРАВЮРА|ВИНЬЕТКА|ИНИЦИАЛ)[^\]]*\]")
FIELD_RE = re.compile(r"^(Колонтитул|Кустод|Сигнатура|Маргиналии|Нумерация|Рукописно|Штамп):[ \t]*(.*)$")
HEAD_RE = re.compile(r"^<!--.*-->\s*$")
SIMPLE = ("Колонтитул", "Кустод", "Сигнатура")
MULTI = ("Нумерация", "Рукописно", "Штамп")


def norm(w):
    return C.normalize_word(w)


def parse(path):
    body, fields, marg, multi = [], {}, [], []
    inm = False
    for ln in open(path, encoding="utf-8").read().split("\n"):
        if HEAD_RE.match(ln): continue
        m = FIELD_RE.match(ln.strip())
        if m:
            n, v = m.group(1), m.group(2).strip()
            if n == "Маргиналии": inm = True; continue
            inm = False
            if n in SIMPLE: fields[n] = v
            elif v: multi.append((n, v))
            continue
        s = ln.strip()
        if inm:
            mi = C.MARGIN_ITEM_RE.match(s)
            if mi:
                if mi.group(1).strip(): marg.append(mi.group(1).strip())
                continue
            if s == "": continue
            inm = False
        body.append(ln)
    while body and not body[-1].strip(): body.pop()
    return {"body": "\n".join(body), "fields": fields, "marg": marg, "multi": multi}


def tokens(body):
    """[(token, norm, start, end)] — слова тела; внутри [ИНИЦИАЛ/ВИНЬЕТКА: …] пропускаются, в [ГРАВЮРА: подпись] — только подпись."""
    mask = []
    for m in BR_RE.finditer(body):
        kind = m.group(1)
        if kind == "ГРАВЮРА":
            colon = body.find(":", m.start(), m.end())
            rest = body[colon + 1:m.end() - 1] if colon >= 0 else ""
            cut = re.search(r"\s+[—–]\s+", rest)
            keep_from = colon + 1
            keep_to = keep_from + (cut.start() if cut else len(rest))
            mask.append((m.start(), keep_from)); mask.append((keep_to, m.end()))
        else:
            mask.append((m.start(), m.end()))
    out = []
    for m in WORD_RE.finditer(body):
        if any(a <= m.start() < b for a, b in mask): continue
        out.append((m.group(0), norm(m.group(0)), m.start(), m.end()))
    return out


def strip_dup_kustod(toks, kustod):
    if not toks or not kustod: return toks
    t = norm(kustod.rstrip("-"))
    if not t: return toks
    ln = toks[-1][1]
    if ln and (t.startswith(ln) or ln.startswith(t)): return toks[:-1]
    return toks


def equal_blocks(sm):
    return [(b.a, b.b, b.size) for b in sm.get_matching_blocks()]


def map_pos(blocks, x, lenb):
    for i, j, n in blocks:
        if i <= x <= i + n: return j + (x - i)
    return None


def analyse(scan):
    R = [parse(os.path.join(READS, scan, "read%d.md" % k)) for k in (1, 2, 3)]
    T = [strip_dup_kustod(tokens(r["body"]), r["fields"].get("Кустод", "")) for r in R]
    N = [[t[1] for t in tk] for tk in T]
    sms = [difflib.SequenceMatcher(a=N[0], b=N[k], autojunk=False) for k in (1, 2)]
    iv = []
    for sm in sms:
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag != "equal": iv.append([i1, i2])
    iv.sort(); merged = []
    for a, b in iv:
        if merged and a <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], b)
        else: merged.append([a, b])
    blocks = [equal_blocks(sm) for sm in sms]
    diffs = []
    for n, (lo, hi) in enumerate(merged, 1):
        pos = [(lo, hi)]
        for k in (0, 1):
            plo, phi = map_pos(blocks[k], lo, len(N[0])), map_pos(blocks[k], hi, len(N[0]))
            if plo is None or phi is None:  # не должно случаться; защита
                plo = 0 if plo is None else plo; phi = len(N[k + 1]) if phi is None else phi
            pos.append((plo, phi))
        def raw(k):
            a_, b_ = pos[k]
            return R[k]["body"][T[k][a_][2]:T[k][b_ - 1][3]] if b_ > a_ else "(пропуск)"
        var = [raw(k) for k in range(3)]
        vn = [" ".join(t[1] for t in T[k][pos[k][0]:pos[k][1]]) for k in range(3)]
        maj = None
        for a, b in ((0, 1), (0, 2), (1, 2)):
            if vn[a] == vn[b]: maj = a; break
        base = T[0]
        cs = base[max(0, lo - 3):lo]; ce = base[hi:hi + 3]
        ctx = " ".join(t[0] for t in cs) + " [[" + var[0] + "]] " + " ".join(t[0] for t in ce)
        if lo < len(base): c0 = base[lo][2]
        else: c0 = len(R[0]["body"])
        c1 = base[hi - 1][3] if hi > lo else c0
        diffs.append({"id": str(n), "kind": "body", "variants": var, "majority": maj, "ctx": ctx.strip(),
                      "ctx_plain": " ".join(t[0] for t in base[max(0, lo - 3):hi + 3]), "span": [c0, c1], "insert": hi == lo})
    # поля
    k_id = len(diffs)
    for f in SIMPLE:
        v = [r["fields"].get(f, "") for r in R]
        nv = [C.normalize_text(x).replace(" ", "") if f == "Сигнатура" else (" ".join(sorted(C.normalize_text(x).split())) if f == "Колонтитул" else C.normalize_text(x)) for x in v]
        if len(set(nv)) > 1:
            k_id += 1
            maj = next((a for a, b in ((0, 1), (0, 2), (1, 2)) if nv[a] == nv[b]), None)
            diffs.append({"id": str(k_id), "kind": "field", "field": f, "variants": [x or "(пусто)" for x in v], "majority": maj, "ctx": f + ": " + " | ".join(v)})
    # маргиналии и прочие строки: множества
    for label, getter in (("Маргиналии", lambda r: r["marg"]), ("Прочее", lambda r: [n + ": " + v for n, v in r["multi"]])):
        sets = [{C.normalize_text(x): x for x in getter(r)} for r in R]
        allk = []
        for s in sets:
            for k in s:
                if k not in allk: allk.append(k)
        for key in allk:
            have = [key in s for s in sets]
            if all(have): continue
            k_id += 1
            txt = next(s[key] for s in sets if key in s)
            diffs.append({"id": str(k_id), "kind": "marg" if label == "Маргиналии" else "multi", "variants": [s.get(key, "(нет)") for s in sets],
                          "majority": 0 if sum(have) >= 2 and have[0] else (next((i for i, h in enumerate(have) if h), 0) if sum(have) >= 2 else None),
                          "have": have, "text": txt, "ctx": label + ": " + txt})
    return R, T, diffs


def final_fields(R, diffs, choice):
    """choice(d) -> строка итогового значения или None=пропустить. Возвращает fields, marg, multi."""
    fields = {f: R[0]["fields"].get(f, "") for f in SIMPLE}
    marg, multi = [], []
    cm = [{C.normalize_text(x): x for x in R[k]["marg"]} for k in range(3)]
    handled = set()
    for d in diffs:
        if d["kind"] == "field":
            v = choice(d)
            if v is not None: fields[d["field"]] = "" if v == "(пусто)" else v
        elif d["kind"] == "marg":
            handled.add(C.normalize_text(d["text"]))
    # маргиналии: общие + решённые
    seen = []
    for k in range(3):
        for key, orig in cm[k].items():
            if key in seen: continue
            seen.append(key)
    for key in seen:
        orig = next(c[key] for c in cm if key in c)
        d = next((x for x in diffs if x["kind"] == "marg" and C.normalize_text(x["text"]) == key), None)
        if d is None: marg.append(orig)
        else:
            v = choice(d)
            if v not in (None, "(нет)", ""): marg.append(v)
    cmu = [{C.normalize_text(n + ": " + v): (n, v) for n, v in R[k]["multi"]} for k in range(3)]
    seenm = []
    for k in range(3):
        for key in cmu[k]:
            if key not in seenm: seenm.append(key)
    for key in seenm:
        n, v = next(c[key] for c in cmu if key in c)
        d = next((x for x in diffs if x["kind"] == "multi" and C.normalize_text(x["text"]) == key), None)
        if d is None: multi.append((n, v))
        else:
            ch = choice(d)
            if ch not in (None, "(нет)", ""):
                multi.append((n, ch.split(": ", 1)[1] if ": " in ch else ch))
    return fields, marg, multi


def render(header, body, fields, marg, multi):
    out = [header, body.rstrip(), ""]
    out.append("Колонтитул: " + fields.get("Колонтитул", ""))
    out.append("Кустод: " + fields.get("Кустод", ""))
    out.append("Сигнатура: " + fields.get("Сигнатура", ""))
    out.append("Маргиналии:")
    out += ["- " + x for x in marg]
    for n, v in multi: out.append("%s: %s" % (n, v))
    return "\n".join(out) + "\n"


def build_page(scan, answers=None, header_extra=""):
    R, T, diffs = analyse(scan)
    body = R[0]["body"]

    def choice(d):
        if answers and d["id"] in answers:
            a = answers[d["id"]]
            t = a["token"]
            if t == "PAGES": k = d["majority"] if d["majority"] is not None else 0
            elif t in ("READ1", "READ2", "READ3"): k = int(t[-1]) - 1
            elif t.startswith("ERRATA:"):
                p, c = t[7:].split("|", 1); return "{%s|%s}" % (p, c)
            elif t.startswith("FIX:"): return t[4:]
            elif t == "UNSURE": return "[?]"
            else: k = d["majority"] if d["majority"] is not None else 0
        else:
            k = d["majority"] if d["majority"] is not None else 0
        v = d["variants"][k]
        return None if v == "(пропуск)" else v

    edits = []
    for d in diffs:
        if d["kind"] != "body": continue
        v = choice(d)
        if v is None: v = ""
        # вариант записан токенами (без пунктуации): если выбран вариант read1 — ничего не менять
        if answers and d["id"] in answers and answers[d["id"]]["token"] == "READ1": continue
        if (not answers or d["id"] not in answers) and (d["majority"] in (None, 0)): continue
        if answers and d["id"] in answers and answers[d["id"]]["token"] == "PAGES" and d["majority"] in (None, 0): continue
        edits.append((d["span"][0], d["span"][1], v, d["insert"]))
    for a, b, v, ins in sorted(edits, key=lambda e: -e[0]):
        if ins: body = body[:a] + (v + " " if v else "") + body[a:]
        else: body = body[:a] + v + body[b:]
    fields, marg, multi = final_fields(R, diffs, choice)
    return R, diffs, body, fields, marg, multi


def label_of(scan):
    for ln in open(os.path.join(BASE, "PAGES.tsv"), encoding="utf-8").read().split("\n")[1:]:
        p = ln.split("\t")
        if p and p[0] == scan: return p[1]
    return "?"


def parse_scans(s):
    out = []
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-"); out += list(range(int(a), int(b) + 1))
        else: out.append(int(part))
    return ["%04d" % x for x in out]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--scans", required=True); a = ap.parse_args()
    tot = 0
    for scan in parse_scans(a.scans):
        if not all(os.path.isfile(os.path.join(READS, scan, "read%d.md" % k)) for k in (1, 2, 3)):
            print(scan, "нет трёх прочтений — пропуск"); continue
        R, diffs, body, fields, marg, multi = build_page(scan)
        wd = os.path.join(WORK, scan); os.makedirs(wd, exist_ok=True)
        json.dump(diffs, open(os.path.join(wd, "diffs.json"), "w"), ensure_ascii=False, indent=1)
        json.dump([{"scan": scan, "id": d["id"], "context": d["ctx_plain"]} for d in diffs if d["kind"] == "body"],
                  open(os.path.join(wd, "diffs_crop.json"), "w"), ensure_ascii=False, indent=1)
        hdr = "<!-- scan: %s | label: %s | state: draft | source: new | method: triple -->" % (scan, label_of(scan))
        open(os.path.join(PAGES, scan + ".md"), "w", encoding="utf-8").write(render(hdr, body, fields, marg, multi))
        nb = sum(1 for d in diffs if d["kind"] == "body")
        print("%s: расхождений %d (тело %d, поля/маргиналии %d)" % (scan, len(diffs), nb, len(diffs) - nb)); tot += len(diffs)
    print("всего расхождений:", tot)


if __name__ == "__main__":
    main()
