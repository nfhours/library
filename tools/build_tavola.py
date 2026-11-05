#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает books/cartari/tavola.json — указатель (Tavola delle cose notabili, сканы 25–36) как навигацию.

    python3 tools/build_tavola.py --dump     # (пере)создать _translation/TAVOLA_RU.tsv: id, it, parent, ru
    python3 tools/build_tavola.py            # собрать tavola.json (нужны все русские заголовки)

Шаги: разбор указателя → русские заголовки из _translation/TAVOLA_RU.tsv (имена и термины — по GLOSSARY.tsv) →
печатная страница 1626 года → скан (PAGES.tsv) → место в переводе (глава + блок).
"""
import argparse, csv, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "books", "cartari")
PAGES = os.path.join(B, "_text", "pages")
TSV = os.path.join(B, "_translation", "TAVOLA_RU.tsv")

# ---------------------------------------------------------------- разбор указателя
SKIP_LINES = {"TAVOLA", "TAVOLA.", "DELLE COSE NOTABILI", "Che nell'Opera si contengono.", "IL FINE.",
              "Con Licenza de' Superiori."}
# опечатки печатного указателя (склеенные/разорванные слова), исправляются до разбора
TEXT_FIX = {"G unone 149": "Giunone 149", "GiunoneLucina": "Giunone Lucina",
            "Dea delle caccie 97": "Diana dea delle caccie 97"}
# номер страницы, напечатанный с ошибкой (в указателе 594, а Ganissone — на с. 564; в книге всего 588 страниц)
PAGE_FIX = {("Ganissone dio", 594): 564,
            # в книге 588 страниц, а с. 588 — пустая; термины стоят на с. 488 / 488–489 (опечатка в одной цифре)
            ("Clamide", 588): 488, ("Via Appia", 588): 488, ("Anella, & loro vso", 589): 489}
RUN = re.compile(r"\d+(?:(?:\s*[.,]\s*|\s+)\d+)*")


def _n(c):
    c = c.lower()
    return {"v": "u", "j": "i", "k": "c"}.get(c, c)


def tavola_lines():
    for s in range(25, 37):
        t = open(os.path.join(PAGES, "%04d.md" % s), encoding="utf8").read()
        t = re.sub(r"<!--.*?-->", "", t, flags=re.S).split("\nКолонтитул:")[0]
        t = re.sub(r"\{([^|}]*)\|([^}]*)\}", r"\2", t)   # {напечатано|исправлено} → исправлено
        for ln in t.splitlines():
            yield s, ln


def split_inline(x):
    m = re.match(r"(.*?)[.,]?\s*vedi\s+(.*?)\.?$", x)
    if m and not RUN.search(x):
        return [{"it": m.group(1).strip(" .,;"), "see": m.group(2).strip(" .,;"), "pages": []}]
    out, pos = [], 0
    for m in RUN.finditer(x):
        label = x[pos:m.start()].strip(" .,;:")
        out.append({"it": label, "pages": sorted({int(n) for n in re.findall(r"\d+", m.group(0))})})
        pos = m.end()
        mm = re.match(r"[.\s]*&c\.?", x[pos:])
        if mm:
            pos += mm.end()
    return out


def parse_tavola():
    lines, pend, sec = [], "", None
    for s, ln in tavola_lines():
        x = re.sub(r"\[ИНИЦИАЛ:\s*(.)\]", r"\1", ln.strip())
        if not x or x in SKIP_LINES:
            continue
        if re.fullmatch(r"[A-Z]", x):
            sec = x
            continue
        for k, v in TEXT_FIX.items():
            x = x.replace(k, v)
        x = re.sub(r"\s+", " ", x)
        if not re.search(r"\d", x) and not re.search(r"\bvedi\b", x):
            pend = (pend + " " + x).strip()      # строка без номеров — начало следующей (перенос)
            continue
        if pend:
            x, pend = pend + " " + x, ""
        lines.append((s, sec, x))
    heads, cur = [], None
    for s, sec, x in lines:
        # подстатья: строчная буква или буква не из текущего раздела алфавита (отступ сам по себе ничего не значит:
        # «    Acheronte» — отдельная статья)
        sub = cur is not None and (x[0].islower() or _n(x[0]) != _n(sec))
        ents = split_inline(x)
        if sub:
            cur["subs"].extend(ents)
        else:
            cur = ents[0]
            cur.update({"letter": sec, "scan": s, "subs": ents[1:]})
            heads.append(cur)
    for i, h in enumerate(heads, 1):
        h["id"] = "t%04d" % i
        for j, sb in enumerate(h["subs"], 1):
            sb["id"] = "%s.%d" % (h["id"], j)
    return heads


# ---------------------------------------------------------------- русские заголовки
def load_ru():
    ru = {}
    if os.path.exists(TSV):
        for r in csv.DictReader(open(TSV, encoding="utf8"), delimiter="\t"):
            ru[r["id"]] = r
    return ru


def dump_tsv(heads):
    old = load_ru()
    with open(TSV, "w", encoding="utf8", newline="") as f:
        w = csv.writer(f, delimiter="\t", lineterminator="\n")
        w.writerow(["id", "it", "parent", "ru"])
        for h in heads:
            for e, par in [(h, "")] + [(s, h["it"]) for s in h["subs"]]:
                prev = old.get(e["id"])
                keep = prev["ru"] if prev and prev["it"] == e["it"] else ""
                it = e["it"] + (" → vedi " + e["see"] if "see" in e else "")
                w.writerow([e["id"], it, par, keep])



# ---------------------------------------------------------------- страница → скан → место в переводе
import difflib, unicodedata

CHAPTERS = os.path.join(B, "chapters_ru.json")
STOP = set("""dei del della delle dello degli gli con che come per perche sua suo sue suoi loro non nel nella nei sopra
ouero altrimente vedi quali quale chi cui sono essere cosa cose altri altre tutti tutte molti molte vno vna
solo dio dea dee idoli et ed tre due ouer onde dove doue quando cosi anche ancora fra tra poi sono suo""".split())
TR = dict(zip("абвгдежзийклмнопрстуфхцчшщъыьэюя", "abvgdezziiclmnoprstufhccssieua"))
TR.update({"ё": "e", "ж": "z", "з": "z"})
CHAP_HEAD = {"nettuno": "NETTVNO.", "venere": "VENERE."}   # главы, начинающиеся посреди страницы


def nw(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if not unicodedata.combining(c))
    w = w.replace("ph", "f").replace("th", "t").replace("ch", "c").replace("h", "")
    w = w.replace("v", "u").replace("j", "i").replace("k", "c").replace("y", "i")
    return re.sub(r"(.)\1+", r"\1", re.sub(r"[^a-z]", "", w))


def toks(label):
    out = []
    for w in re.findall(r"[A-Za-zÀ-ÿ]+", label):
        n = nw(w)
        if len(n) >= 3 and n not in STOP:
            out.append(n)
    return out


def wmatch(tok, word):
    if len(tok) <= 4:
        return word == tok or (len(tok) == 4 and word.startswith(tok))
    return word[:4] == tok[:4] and abs(len(word) - len(tok)) <= 4


def page_text(scan):
    t = open(os.path.join(PAGES, "%04d.md" % scan), encoding="utf8").read()
    t = re.sub(r"<!--.*?-->", "", t, flags=re.S).split("\nКолонтитул:")[0]
    t = re.sub(r"\{([^|}]*)\|([^}]*)\}", r"\2", t)
    t = re.sub(r"\[ИНИЦИАЛ:\s*(.)\]", r"\1", t)
    t = re.sub(r"\[ГРАВЮРА:\s*(.*?)\]", r"\1", t, flags=re.S)
    t = re.sub(r"\[[^\]]*\]", "", t)
    return re.sub(r"\s+", " ", t.replace("*", "")).strip()


def margins(scan):
    t = open(os.path.join(PAGES, "%04d.md" % scan), encoding="utf8").read()
    m = re.search(r"^Маргиналии:\s*\n((?:- .*\n?)*)", t, re.M)
    return [re.sub(r"\{([^|}]*)\|([^}]*)\}", r"\2", x[2:].strip()) for x in m.group(1).splitlines()] if m else []


def skel(s):
    s = "".join(TR.get(c, c) for c in s.lower())
    s = nw(s)
    return re.sub(r"(.)\1+", r"\1", re.sub(r"[aeiou]", "", s))


def label_scans():
    lab, num = {}, {}
    for r in csv.reader(open(os.path.join(B, "_text", "PAGES.tsv"), encoding="utf8"), delimiter="\t"):
        if r[0].isdigit():
            lab[int(r[0])] = r[1]
            if r[1].isdigit():
                num[int(r[1])] = int(r[0])
    return lab, num


def block_w(b):
    if b["t"] == "aside":
        return 0
    if b["t"] == "quote":
        return sum(len(x) for x in b.get("lines", []))
    return len(b.get("text", ""))


def align_asides(ch):
    """Пометы на полях (Маргиналии: в сканах) ↔ блоки aside перевода: по порядку, с пропуском лишних строк скана."""
    a, b = ch["scans"]
    A = [(i, x["text"]) for i, x in enumerate(ch["blocks"]) if x["t"] == "aside"]
    M = [(s, m) for s in range(a, b + 1) for m in margins(s)
         if not re.match(r"[a-zàèéìòù\[]", m) and not re.search("[а-я]", m)]
    n, m = len(A), len(M)
    if n == 0 or n > m:
        return [] if n == 0 else None
    NEG = -1e9
    S = [[difflib.SequenceMatcher(None, skel(A[i][1]), skel(M[j][1])).ratio() for j in range(m)] for i in range(n)]
    dp = [[NEG] * (m + 1) for _ in range(n + 1)]
    bk = [[None] * (m + 1) for _ in range(n + 1)]
    for j in range(m + 1):
        dp[0][j] = -0.01 * j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            best, how = NEG, None
            if dp[i - 1][j - 1] > NEG:
                best, how = dp[i - 1][j - 1] + S[i - 1][j - 1], "m"
            if dp[i][j - 1] > NEG and dp[i][j - 1] - 0.01 > best:
                best, how = dp[i][j - 1] - 0.01, "s"
            dp[i][j], bk[i][j] = best, how
    i, j, out = n, m, []
    while i > 0:
        if bk[i][j] == "m":
            out.append((A[i - 1][0], M[j - 1][0], M[j - 1][1]))
            i, j = i - 1, j - 1
        else:
            j -= 1
    return out[::-1]


class Chap:
    def __init__(self, ch):
        self.slug, self.scans, self.blocks = ch["slug"], ch["scans"], ch.get("blocks") or []
        self.start, x = [], 0
        for b in self.blocks:
            self.start.append(x)
            x += block_w(b)
        self.total = x
        self.ok = bool(self.blocks)
        self.mar = {}        # скан → [(индекс блока aside, текст пометы)]
        self.anch = {}       # скан → [индексы блоков-якорей]
        self.X = {}
        if not self.ok:
            return
        al = align_asides(ch)
        self.aligned = al is not None
        for i, s, m in (al or []):
            self.mar.setdefault(s, []).append((i, m))
            self.anch.setdefault(s, []).append(i)
        self.caps = {}
        for i, b in enumerate(self.blocks):
            if b["t"] == "cap" and re.fullmatch(r"e\d{4}", b.get("pid", "")):
                s = int(b["pid"][1:])
                if self.scans[0] <= s <= self.scans[1]:
                    self.caps.setdefault(s, []).append(i)
        self.build_x()

    def para_end(self, i):
        j = i
        while j < len(self.blocks) and self.blocks[j]["t"] == "aside":
            j += 1
        return (self.start[j] + block_w(self.blocks[j])) if j < len(self.blocks) else self.total

    def build_x(self):
        a, b = self.scans
        pages = list(range(a, b + 1))
        L = {s: len(page_text(s)) for s in pages}
        if self.slug in CHAP_HEAD_SPLIT:       # глава начинается посреди первой страницы
            L[a] = len(page_text(a)) - CHAP_HEAD_SPLIT[self.slug]
        if self.slug in CHAP_TAIL:              # глава кончается посреди последней страницы
            L[b] = CHAP_TAIL[self.slug]
        cum, c = {}, 0
        for s in pages:
            cum[s] = c
            c += L[s]
        self.cum, self.L, self.Ltot = cum, L, max(c, 1)
        pts = [(0.0, 0.0)]
        for s in pages:
            xs = [self.start[i] for i in self.anch.get(s, [])]
            if xs:
                pts.append((cum[s] + L[s] / 2.0, sum(xs) / len(xs)))
        pts.append((float(self.Ltot), float(self.total)))
        pts.sort()

        def interp(u):
            for (u0, r0), (u1, r1) in zip(pts, pts[1:]):
                if u0 <= u <= u1:
                    return r0 if u1 == u0 else r0 + (r1 - r0) * (u - u0) / (u1 - u0)
            return pts[-1][1]
        lo, hi, last = {}, {}, 0.0
        for s in pages:
            lo[s] = last
            if self.anch.get(s):
                last = max(last, self.start[self.anch[s][-1]])
        nxt = float(self.total)
        for s in reversed(pages):
            if self.anch.get(s):
                nxt = min(nxt, self.para_end(self.anch[s][0]))
            hi[s] = nxt
        prev = 0.0
        for s in pages:
            e = interp(cum[s])
            x = min(max(e, lo[s]), max(hi[s], lo[s]))
            x = max(x, prev)
            self.X[s] = 0.0 if s == a else x
            prev = self.X[s]
        self.X[b + 1] = float(self.total)

    def page_range(self, scan):
        """Блоки перевода, лежащие на скане: [a, b] (оценка по координате X; абзац на стыке страниц входит в обе)."""
        n = len(self.blocks)
        a = self.block_at(self.X.get(scan, 0.0))
        if scan + 1 not in self.X:
            return a, n
        x1 = self.X[scan + 1]
        a2 = self.block_at(x1)
        j = a2 - 1
        while j < n - 1 and self.blocks[j]["t"] == "aside":
            j += 1
        b = j + 1 if self.start[j] < x1 - 1 else a2 - 1
        return a, min(n, max(a, b))

    def block_at(self, x):
        n = len(self.blocks)
        i = 0
        for k in range(n):
            if self.start[k] <= x:
                i = k
        while i < n - 1 and self.blocks[i]["t"] == "aside":
            i += 1
        j = i
        while j > 0 and self.blocks[j - 1]["t"] == "aside":
            j -= 1
        return j + 1                          # номер блока n (с 1); асайд, стоящий перед абзацем, — вместе с ним


CHAP_HEAD_SPLIT, CHAP_TAIL = {}, {}


def build_chapters(chs):
    for slug, head in CHAP_HEAD.items():
        ci = [c for c in chs if c["slug"] == slug][0]
        t = page_text(ci["scans"][0])
        k = t.find(head)
        CHAP_HEAD_SPLIT[slug] = k if k >= 0 else len(t) // 2
        prev = chs[chs.index(ci) - 1]
        CHAP_TAIL[prev["slug"]] = CHAP_HEAD_SPLIT[slug]
    return {c["slug"]: Chap(c) for c in chs}


# ---------------------------------------------------------------- поиск места
RU_STOP = set("""какими какой какая какие каких слова словами совершались совершался почему зачем когда чтобы чего и в во на о об от по при для из с со к у за над под про без как что это его ее их она он они оно
или но не ни же бы да был была были быть есть также еще только между перед после через около""".split())


def block_str(b):
    if b["t"] == "quote":
        t = " ".join(b.get("lines", []))
    else:
        t = b.get("text", "")
    return t.lower().replace("ё", "е")


def ru_stems(ru):
    out = []
    for w in re.findall(r"[а-яё]+", re.sub(r"\([^)]*\)", " ", ru.lower().replace("ё", "е"))):
        if len(w) >= 4 and w not in RU_STOP:
            out.append(w[:4] if len(w) >= 8 else w[:max(4, len(w) - 2)] if len(w) >= 6 else w[:4] if len(w) == 5 else w)
    return out


def tok_hits(tokens, words):
    return sum(1 for t in tokens if any(wmatch(t, w) for w in words))


def wm(tok, word):
    if tok == word:
        return True
    m = min(len(tok), len(word))
    if m < 5 or abs(len(tok) - len(word)) > 3:
        return False
    k = 0
    while k < m and tok[k] == word[k]:
        k += 1
    return k >= m - 1


def wm_strict(tok, word):
    if tok == word:
        return True
    m = min(len(tok), len(word))
    if m < 6 or abs(len(tok) - len(word)) > 3:
        return False
    k = 0
    while k < m and tok[k] == word[k]:
        k += 1
    return k >= m - 1


_PW = {}
_LAST = [0]


def page_words(scan):
    if scan not in _PW:
        t = page_text(scan)
        _PW[scan] = (t, [(nw(m.group(0)), m.start()) for m in re.finditer(r"[A-Za-zÀ-ÿ]+", t)])
    return _PW[scan]


def find_pos(own, par, scan, lo=0, hi=None, strict=False):
    """Позиция (символ) в итальянском тексте страницы, где встречается название статьи; None — не найдено."""
    t, ws = page_words(scan)
    hi = len(t) if hi is None else hi
    ws = [(w, o) for w, o in ws if lo <= o < hi]
    if par and not any(wm(x, w) for x in par for w, _ in ws):
        return None
    toks_ = own or par
    if not toks_:
        return None
    need = len(toks_) if strict else (len(toks_) + 1) // 2
    if strict and sum(len(x) for x in toks_) < 9:
        return None
    best = None
    for i, (w, o) in enumerate(ws):
        if not any(wm(x, w) for x in toks_):
            continue
        seen = {x for x in toks_ for w2, o2 in ws[i:] if o2 - o <= 320 and wm(x, w2)}
        occ_ = sum(1 for x in toks_ for w2, o2 in ws if 0 <= o2 - o <= 600 and wm(x, w2))
        key = (len(seen), occ_, -o)
        if len(seen) >= need and (best is None or key > best[0]):
            best = (key, o)
            _LAST[0] = len(seen)
    if best is None and not strict:
        long_ = [x for x in toks_ if len(x) >= 5]
        cands = [o for x in sorted(long_, key=len, reverse=True)[:1] for w, o in ws if wm_strict(x, w)]
        if cands:
            return cands[0]
    return None if best is None else best[1]


def digit_variants(p):
    s_ = str(p)
    out = set()
    for i in range(len(s_)):
        for d in "0123456789":
            if d != s_[i]:
                out.add(s_[:i] + d + s_[i + 1:])
        out.add(s_[:i] + s_[i + 1:])
    for i in range(len(s_) + 1):
        for d in "0123456789":
            out.add(s_[:i] + d + s_[i:])
    return sorted(int(x) for x in out if x and x[0] != "0" and 1 <= int(x) <= 588 and int(x) != p)


class Locator:
    def __init__(self):
        self.chs = json.load(open(CHAPTERS, encoding="utf8"))["chapters"]
        self.C = build_chapters(self.chs)
        self.lab, self.num = label_scans()
        self.byscan = {}
        for c in self.chs:
            for s in range(c["scans"][0], c["scans"][1] + 1):
                self.byscan.setdefault(s, []).append(c["slug"])
        self.fixed = []

    def portion(self, slug, scan, n):
        """Границы (символы) части страницы scan, принадлежащей главе slug."""
        lo, hi = 0, n
        if CHAP_HEAD_SPLIT.get(slug) is not None and self.C[slug].scans[0] == scan:
            lo = CHAP_HEAD_SPLIT[slug]
        if CHAP_TAIL.get(slug) is not None and self.C[slug].scans[1] == scan:
            hi = CHAP_TAIL[slug]
        return lo, hi

    def place(self, slug, scan, pos, own, stems, found):
        ch = self.C[slug]
        t, _ = page_words(scan)
        lo, hi = self.portion(slug, scan, len(t))
        frac = 0.0 if pos is None else min(1.0, max(0.0, (pos - lo) / float(max(1, hi - lo))))
        x0, x1 = ch.X.get(scan, 0.0), ch.X.get(scan + 1, float(ch.total))
        n0 = ch.block_at(x0 + frac * (x1 - x0))
        if not found:
            return "p", n0
        caps = ch.caps.get(scan)
        if caps and len(t) < 400:
            return "g", caps[0] + 1
        for idx, txt in ch.mar.get(scan, []):
            words = [nw(w) for w in re.findall(r"[A-Za-zÀ-ÿ]+", txt)]
            hits = sum(1 for x in own if any(wm_strict(x, w) for w in words))
            if own and hits * 2 >= len(own):
                i = idx
                while i < len(ch.blocks) - 1 and ch.blocks[i]["t"] == "aside":
                    i += 1
                if abs(i + 1 - n0) <= 6:
                    return "m", i + 1
        if stems:
            need = max(1, (len(stems) + 1) // 2)
            cnt = {}
            for n in range(max(1, n0 - 9), min(len(ch.blocks), n0 + 9) + 1):
                b = ch.blocks[n - 1]
                if b["t"] == "aside":
                    continue
                w = re.findall(r"[а-яе]+", block_str(b))
                dist_ = sum(1 for st in stems if any(x.startswith(st) for x in w))
                occ = sum(1 for st in stems for x in w if x.startswith(st))
                cnt[n] = (dist_, occ)
            best = None
            for n, (dd, oc) in cnt.items():
                if dd < need:
                    continue
                dens = oc + 3 * dd + sum(cnt.get(k, (0, 0))[1] for k in (n - 1, n + 1)) * 0.5
                sc_ = dens - 0.3 * abs(n - n0)
                if best is None or sc_ > best[0]:
                    best = (sc_, n)
            if best:
                return "t", best[1]
        return "i", n0

    def try_scan(self, scan, own, par, stems, kind_found, strict=False):
        """Ищет название в итальянском тексте скана; → (kind, slug, n) или None."""
        slugs = self.byscan.get(scan)
        if not slugs:
            return None
        t, _ = page_words(scan)
        for sl in slugs:
            if not self.C[sl].ok:
                continue
            lo, hi = self.portion(sl, scan, len(t))
            _LAST[0] = 1
            pos = find_pos(own, par, scan, lo, hi, strict)
            if pos is not None:
                k, n = self.place(sl, scan, pos, own, stems, True)
                return (kind_found or k), sl, n, _LAST[0]
        return None

    DUP = {p_: [127 + p_ - 95, 137 + p_ - 95] for p_ in range(95, 103)}
    DUP.update({103: [135, 145], 104: [136, 146]})

    def locate(self, head, page, ru, parent=""):
        scans = self.DUP.get(page) or ([self.num[page]] if page in self.num else [])
        if not scans:
            return None
        scan = scans[0]
        own, par, stems = toks(head), (toks(parent) if parent else []), ru_stems(ru)
        cand = [self.try_scan(sc, own, par, stems, None) for sc in scans]
        cand = [(c, sc) for c, sc in zip(cand, scans) if c]
        r = None
        if cand:
            r, scan = max(cand, key=lambda x: (x[0][3], -scans.index(x[1])))
        if r is None:
            cand = []
            for sc0 in scans:
                for d in (1, -1):
                    c = self.try_scan(sc0 + d, own, par, stems, "n")
                    if c:
                        cand.append((c, sc0))
            if cand:
                r, scan = max(cand, key=lambda x: x[0][3])
        if r is None and not par and any(len(x) >= 7 for x in own):
            for sc0 in scans:
                for d in (2, -2):
                    c = self.try_scan(sc0 + d, own, par, stems, "n")
                    if c and r is None:
                        r, scan = c, sc0
        if r is None and (own or par):
            hits = []
            for q in digit_variants(page):
                sq = self.num.get(q)
                if sq:
                    rr = self.try_scan(sq, own, par, stems, "f", True)
                    if rr:
                        hits.append((q, rr))
            if len(hits) == 1:
                q, r = hits[0]
                self.fixed.append((head, page, q))
                page, scan = q, self.num[q]
        slugs = self.byscan.get(scan)
        if not slugs:
            near = min(self.chs, key=lambda c: min(abs(scan - c["scans"][0]), abs(scan - c["scans"][1])))
            return {"p": page, "ch": near["slug"], "k": "c"}
        if r and r[1] in slugs:
            sl = r[1]
        else:
            sl = max(slugs, key=lambda x: self.C[x].L.get(scan, 0))
        if not self.C[sl].ok:
            return {"p": page, "ch": sl, "k": "c"}
        a, b = self.C[sl].page_range(scan)
        if r and r[1] == sl and r[0] != "n":
            n = r[2]
            if r[0] == "g":
                a = b = n
            else:
                a, b = min(a, n), max(b, n)
            return {"p": page, "ch": sl, "a": a, "b": b, "n": n, "k": r[0]}
        return {"p": page, "ch": sl, "a": a, "b": b, "k": "n" if r and r[0] == "n" else "p"}


def norm_key(t):
    return " ".join(nw(w) for w in re.findall(r"[A-Za-zÀ-ÿ]+", t))


def build(heads):
    ru = load_ru()
    L = Locator()
    keys = {}
    for h in heads:
        keys.setdefault(norm_key(h["it"]), h["id"])
    ents, stats = [], {k: 0 for k in "mtginfpc"}
    stats["none"] = 0
    refs = unresolved = 0

    def conv(e, parent=""):
        nonlocal refs, unresolved
        r = (ru.get(e["id"]) or {}).get("ru", "").strip()
        d = {"id": e["id"], "it": e["it"], "ru": r}
        pl = []
        for p in e["pages"]:
            p = PAGE_FIX.get((e["it"], p), p)
            loc = L.locate(e["it"], p, r, parent)
            if loc is None:
                stats["none"] += 1
                pl.append({"p": p})
            else:
                stats[loc["k"]] += 1
                pl.append(loc)
        if pl:
            d["pages"] = pl
        if "see" in e:
            refs += 1
            d["see"] = e["see"]
            sk = norm_key(e["see"])
            tid = keys.get(sk) or next((v for k, v in keys.items() if k.startswith(sk + " ")), None)
            if tid:
                d["see_id"] = tid
            else:
                unresolved += 1
        return d
    for h in heads:
        d = conv(h)
        d["letter"] = h["letter"]
        if h["subs"]:
            d["subs"] = [conv(sb, h["it"]) for sb in h["subs"]]
        ents.append(d)
    links = sum(stats.values())
    out = {"title": "Tavola delle cose notabili", "entries": ents,
           "stats": {"entries": len(heads), "subs": sum(len(h["subs"]) for h in heads), "refs": refs,
                     "refs_unresolved": unresolved, "links": links,
                     "kinds": stats, "page_fixed": len(L.fixed),
                     "by_text": sum(stats[k] for k in "mtginf"), "page_start": stats["p"],
                     "chapter_start": stats["c"], "no_scan": stats["none"]}}
    out["fixed"] = L.fixed
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump", action="store_true")
    a = ap.parse_args()
    heads = parse_tavola()
    if a.dump:
        dump_tsv(heads)
        print("статей:", len(heads), "подстатей:", sum(len(h["subs"]) for h in heads))
        sys.exit(0)
    out = build(heads)
    LOC_FIXED = out.pop("fixed")
    miss = [e["id"] for h in out["entries"] for e in [h] + h.get("subs", []) if not e["ru"]]
    if miss:
        print("нет русского заголовка у %d записей (например %s)" % (len(miss), ", ".join(miss[:5])))
    json.dump(out, open(os.path.join(B, "tavola.json"), "w", encoding="utf8"), ensure_ascii=False,
              separators=(",", ":"))
    print(json.dumps(out["stats"], ensure_ascii=False))
    for hd, p0, p1 in LOC_FIXED:
        print("  страница исправлена:", hd, p0, "→", p1)
