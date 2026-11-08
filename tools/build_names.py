#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает books/cartari/names.json — раздел «Имена» (#/cartari/names).

    python3 tools/build_names.py                  # собрать names.json
    python3 tools/build_names.py --sample 20      # 20 случайных упоминаний с контекстом (для проверки)
    python3 tools/build_names.py --forms          # какими словоформами найдено каждое имя

Источники: _translation/GLOSSARY.tsv (имена и их русские формы), _translation/NAMES_TYPES.tsv (какие строки
глоссария считаются именами и какого они типа: g божество, c персонаж, a автор, p место, n народ; всё остальное —
предметы, животные, добродетели — в раздел не попадает), chapters_ru.json (перевод), plates.json (гравюры).

Поиск: слова перевода сопоставляются со всеми падежными формами русского имени (по окончаниям; у многословных
имён склоняется каждое слово). Имена пишутся в переводе с заглавной, поэтому первое слово имени принимается только
с заглавной буквы (кроме народов и служебных слов вроде «святой»); так «Гор», «Пан», «Ком» не путаются с обычными словами.
"""
import argparse, collections, json, os, random, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "books", "cartari")
GLOSS = os.path.join(B, "_translation", "GLOSSARY.tsv")
TYPES = os.path.join(B, "_translation", "NAMES_TYPES.tsv")
OUT = os.path.join(B, "names.json")

# Строки глоссария, которые комментарии глоссария прямо называют вариантами одного лица: вариант → основная запись (по итальянской форме).
MERGE = {"Marco Tullio": "Cicerone", "Festo Pompeio": "Festo", "Giraldi": "Gregorio Giraldi", "Giraldo": "Gregorio Giraldi",
         "Marcellino": "Ammiano Marcellino", "Gellio": "Aulo Gellio", "Vvitfliet": "Cornelio Vvitfliet"}
# русская форма, которой в глоссарии нет (запись «Fortuna» там — «судьба»; богиня культа — «Фортуна», см. комментарий)
RU_OVERRIDE = {"Fortuna": "Фортуна"}
# дополнительные формы из комментариев глоссария
EXTRA_VARIANTS = {"Taurica": ["Таврическая земля", "земля Таврическая"],
                  "Gioue discacciatore di mosche": ["Отгоняющий Мух", "отгоняющий Мух"],
                  "Leone Decimo": ["Лев X"]}
EXTRA_VARIANTS["Cornelio Tacito"] = ["Тацит"]
# имя совпадает с обычным словом, которое переводчик пишет с заглавной в начале предложения:
# в начале предложения такие формы не считаются именем (кроме случая, когда весь блок — заголовок из одного имени)
SENT_START_SKIP = {"По": None, "Ком": {"кому"}}
# совпадение отбрасывается, если слева (до 40 знаков) / справа (до 40 знаков) от имени стоит такой текст
VETO_LEFT = {
    "Кипарис": r"(?:растение|дан)\s+$",       # дерево, а не юноша
    "Европа": r"\b(?:из|в)\s+$",             # часть света, а не нимфа
    "Гиацинт": r"Яспис,\s+$",                 # самоцвет
}
VETO_RIGHT = {"Клавдия": r"^\s+Миталери", "Цезарь": r"^\s+Буленгер"}
VETO_LEFT.update({
    "Мирра": r"запах\s+$",                    # смола, а не дочь Кинира
    "Нона": r"епископа\s+$",                  # город Нона
    "Цезарь": r"(?:Константина|Максимиана|Аврелия)\s+$",   # другие носители титула
})
# тёзки: запись глоссария относится к одному человеку, который упоминается только в этих главах
# (Александр — автор «Проблем»; Дионисий — Галикарнасский; Птолемей — царь, освободивший Апеллеса)
SCOPE = {"Александр": {"cupido"}, "Дионисий": {"bacco", "annotationi-pignoria"}, "Птолемей": {"fortuna"}}
REQUIRE_LEFT = {
    "Лета": r"\b[Рр]ек\w*\s+$",              # река, а не «лето» и не римлянка Лета
    "Север": r"(?:Император\w*|Септими\w*)\s+$",
}
# женские имена на -ия совпадают с родительным падежом мужских имён на -ий (Клавдий, Марций…)
MASC_CUE = r"(?:\bИмператор\w*|\bЦензор\w*|\bКонсул\w*|\bТрибун\w*|\bАппи\w+|\bТит\w{0,2}|\bМарк\w*|\bГай\w*|\bЛуци\w+|\bПубли\w+|\bСекст\w*|\bКвинт\w*|\bВалери\w+|\bЛицини\w+)\s+$"
# служебные слова: принимаются и со строчной, и с заглавной буквы
FREE_CASE = {"святой", "святая", "блаженный", "монсеньор", "кардинал", "гора", "холм", "земля", "бог", "богиня", "царь", "царица"}
ADJ_WORDS = {"святой", "всеблагой", "большой"}
NOUN_AYA = {"даная", "аглая"}
# слова на -и/-ы, которые не склоняются как множественное число
INDECL_I = set()

WORD = re.compile(r"[А-Яа-яЁё]+|\b[IVX]+\b")
GAP_OK = {" ", " "}


def fold(s):
    return s.lower().replace("ё", "е")


# ---------------------------------------------------------------- словоформы
def is_adj(w):
    if w in ADJ_WORDS:
        return True
    if re.search(r"(ский|цкий|зкий|жкий|ший|чий|щий|жий|кий|гий|хий|ный|вый|тый|ый)$", w):
        return True
    if re.search(r"(ая|яя)$", w) and w not in NOUN_AYA:
        return True
    return bool(re.search(r"(ое|ее|ые|ие|ых|их|ого|его|ому|ему)$", w))


def adj_forms(w):
    if re.search(r"(ого|его|ому|ему)$", w):
        stem = w[:-3]
    else:
        stem = w[:-2]
    F = set()
    if w.endswith("чий"):
        F = {w[:-2] + "ь" + x for x in ("его", "ему", "ем", "им", "я", "ю", "ей", "и", "их", "ими", "е")}
    ends = ["ый", "ий", "ой", "ого", "его", "ому", "ему", "ым", "им", "ом", "ем", "ая", "яя", "ой", "ей", "ую", "юю", "ое", "ее",
            "ые", "ие", "ых", "их", "ым", "им", "ыми", "ими"]
    return {w} | F | {stem + e for e in ends}


def plural_forms(w):
    F = {w}
    if re.search(r"[ая]не$", w):
        base = w[:-2]
        F |= {base + "н", base + "нам", base + "нами", base + "нах"}
    elif w.endswith(("ы", "и")):
        s = w[:-1]
        F |= {s + x for x in ("ы", "и", "", "ов", "ев", "ам", "ям", "ами", "ями", "ах", "ях", "ок", "ек")}
        if w.endswith("и"):
            F |= {s + "ий", s + "ей"}
        F = {f for f in F if len(f) >= 3 or f == w}
    return F


def noun_forms(w):
    F = {w}
    if w == "лев":
        F |= {"льва", "льву", "львом", "льве"}
    elif w == "мать":
        F |= {"матери", "матерью", "матерей", "матерям", "матерями", "матерях"}
    elif w.endswith("о"):
        s = w[:-1]
        F |= {s + x for x in ("а", "у", "ом", "е")}
    elif w.endswith("е") and len(w) > 4:
        s = w[:-1]
        F |= {s + x for x in ("я", "ю", "ем")}
    elif w.endswith("ия") or w.endswith("я"):
        s = w[:-1]
        F |= {s + x for x in ("и", "е", "ю", "ей", "ею")}
    elif w.endswith("а"):
        s = w[:-1]
        F |= {s + x for x in ("ы", "и", "е", "у", "ой", "ою", "ом")}
    elif w.endswith("ий"):
        s = w[:-2]
        F |= {s + x for x in ("ия", "ию", "ием", "ии")}
    elif w.endswith("й"):
        s = w[:-1]
        F |= {s + x for x in ("я", "ю", "ем", "е")}
    elif w.endswith("ь"):
        s = w[:-1]
        F |= {s + x for x in ("я", "ю", "ем", "е", "и", "ью")}
    elif w[-1] not in "оеэуюиыё":
        F |= {w + x for x in ("а", "у", "ом", "ем", "е")}
        if w == "египет":
            F |= {"египта", "египту", "египтом", "египте"}
    return F


def word_forms(w, plural):
    wf = fold(w)
    if is_adj(wf):
        return adj_forms(wf)
    if plural or (wf.endswith(("ы", "и")) and wf not in INDECL_I):
        return plural_forms(wf)
    return noun_forms(wf)


# ---------------------------------------------------------------- имена
class Entry:
    def __init__(self, slug, ru, it, typ, en="", fr=""):
        self.slug, self.ru, self.it, self.type = slug, ru, it, typ
        self.en, self.fr = en, fr
        self.variants = []      # русские варианты (кроме основной формы)
        self.phrases = []       # [(слова, разделители, формы по словам, свободный регистр по словам)]
        self.mentions = collections.OrderedDict()   # (глава, блок) -> [(начало, длина)]
        self.plates = []
        self.surface = collections.Counter()

    def add_phrase(self, text, plural):
        words = text.split()
        # дефис внутри слова («Боги-Аверрунки») — разделитель, слова склоняются отдельно
        parts, gaps = [], []
        for i, w in enumerate(words):
            sub = w.split("-")
            for j, s in enumerate(sub):
                parts.append(s)
                gaps.append("-" if j < len(sub) - 1 else " ")
        gaps = gaps[:-1]
        forms = [word_forms(p, plural) for p in parts]
        free = [(p[0].islower() or fold(p) in FREE_CASE or i > 0) for i, p in enumerate(parts)]
        self.phrases.append((parts, gaps, forms, free))


def slugify(s):
    t = s.lower()
    t = (t.replace("à", "a").replace("è", "e").replace("é", "e").replace("ì", "i").replace("ò", "o").replace("ù", "u"))
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t or "name"


def load_entries():
    typ = {}
    for ln in open(TYPES, encoding="utf8").read().split("\n")[1:]:
        c = ln.split("\t")
        if len(c) >= 3 and c[0]:
            typ[(c[0], c[1])] = c[2]
    rows = []
    for ln in open(GLOSS, encoding="utf8").read().split("\n")[1:]:
        c = ln.split("\t")
        if len(c) < 2 or not c[0]:
            continue
        ru = RU_OVERRIDE.get(c[0], c[1])
        t = typ.get((c[0], c[1]))
        en = c[2] if len(c) > 2 else ""
        fr = c[3] if len(c) > 3 else ""
        if t:
            rows.append((c[0], ru, t, en, fr))
    byit = {r[0]: r for r in rows}
    groups = collections.OrderedDict()
    for it, ru, t, en, fr in rows:
        target = byit[MERGE[it]] if it in MERGE else (it, ru, t, en, fr)
        key = fold(re.split(r",\s*", target[1])[0])
        g = groups.setdefault(key, {"ru": [], "it": [], "t": target[2], "en": [], "fr": []})
        for r in re.split(r",\s*", ru):
            if r not in g["ru"]:
                g["ru"].append(r)
        for i in re.split(r",\s*", it):
            if i and i not in g["it"]:
                g["it"].append(i)
        if en and en not in g["en"]:
            g["en"].append(en)
        if fr and fr not in g["fr"]:
            g["fr"].append(fr)
    entries, used = [], set()
    for key, g in groups.items():
        slug = slugify(g["it"][0])
        while slug in used:
            slug += "-2"
        used.add(slug)
        e = Entry(slug, g["ru"][0], g["it"], g["t"], en=g["en"][0] if g["en"] else "", fr=g["fr"][0] if g["fr"] else "")
        for v in g["ru"][1:] + [x for i in g["it"] for x in EXTRA_VARIANTS.get(i, [])]:
            e.variants.append(v)
        plural = g["t"] == "n"
        for ph in [e.ru] + e.variants:
            e.add_phrase(ph, plural)
        entries.append(e)
    return entries


class Matcher:
    def __init__(self, entries):
        self.first = collections.defaultdict(list)
        for e in entries:
            for pi, (parts, gaps, forms, free) in enumerate(e.phrases):
                for f in forms[0]:
                    self.first[f].append((e, pi))

    def find(self, text):
        toks = [(m.start(), m.end(), m.group()) for m in WORD.finditer(text)]
        out = []
        for i, (s, en, raw) in enumerate(toks):
            cand = self.first.get(fold(raw))
            if not cand:
                continue
            for e, pi in cand:
                parts, gaps, forms, free = e.phrases[pi]
                if not free[0] and not (raw[0].isupper() and (raw[1:].islower() or raw[1:] == "" or (len(raw) >= 4 and raw.isupper()))):
                    continue
                last = i
                ok = True
                for j in range(1, len(parts)):
                    if i + j >= len(toks):
                        ok = False
                        break
                    ps, pe, praw = toks[i + j]
                    if text[toks[i + j - 1][1]:ps] not in (GAP_OK if gaps[j - 1] == " " else {"-"}) or fold(praw) not in forms[j]:
                        ok = False
                        break
                    last = i + j
                if ok:
                    out.append((e, s, toks[last][1]))
        return out


def _lc(rx, s):
    return re.search(rx, s) is not None


# одна и та же словоформа подходит двум именам: решает контекст; без правила — совпадение с основной формой
CLASH = {
    frozenset(["Геллий", "Геллия"]): lambda L, S, R, ch: "Геллия" if _lc(r"(?:по имени|моя)\s+$", L) else "Геллий",
    frozenset(["Гении", "Гений"]): lambda L, S, R, ch: "Гении",
    frozenset(["Геркин", "Геркина"]): lambda L, S, R, ch: "Геркин" if (S == "Геркином" or _lc(r"\bрек\w+\s+(?:названн\w+\s+)?$", L)) else "Геркина",
    frozenset(["Главк", "Главка"]): lambda L, S, R, ch: "Главк",
    frozenset(["Данай", "Даная"]): lambda L, S, R, ch: "Даная" if _lc(r"\bк\s+$", L) else "Данай",
    frozenset(["Ипполит", "Ипполита"]): lambda L, S, R, ch: "Ипполита" if _lc(r"^,\s*Цариц", R) else "Ипполит",
    frozenset(["Ливий", "Ливия"]): lambda L, S, R, ch: "Ливий" if S == "Ливия" else "Ливия",
    frozenset(["Персий", "Персия"]): lambda L, S, R, ch: "Персий" if S == "Персия" else "Персия",
    frozenset(["Марий", "Мария"]): lambda L, S, R, ch: "Мария" if _lc(r"Гонория и\s+$", L) else "Марий",
    frozenset(["Фавн", "Фавна"]): lambda L, S, R, ch: "Фавна" if _lc(r"(?:^|или\s+)$", L) else "Фавн",
    frozenset(["Эврином", "Эвринома"]): lambda L, S, R, ch: "Эвринома" if ch == "nettuno" else "Эврином",
    frozenset(["Тацита", "Корнелий Тацит"]): lambda L, S, R, ch: "Тацита" if (L == "" and R == "") else "Корнелий Тацит",
    frozenset(["Кастор", "Касторы"]): lambda L, S, R, ch: "Кастор",
    frozenset(["Лун", "Луна"]): lambda L, S, R, ch: "Луна",
}


def pick(cands, S, L, R, ch):
    key = frozenset(e.ru for e in cands)
    fn = CLASH.get(key)
    if fn:
        w = fn(L, S, R, ch)
        for e in cands:
            if e.ru == w:
                return e
    base = [e for e in cands if fold(e.ru) == fold(S)]
    if len(base) == 1:
        return base[0]
    print("!! неразрешённая неоднозначность:", sorted(key), S, file=sys.stderr)
    return cands[0]


def resolve(M, text, ch=None, whole=False):
    """Все вхождения имён в text: [(Entry, начало, конец)] без перекрытий и неоднозначностей."""
    raw = M.find(text)
    groups = collections.OrderedDict()
    for e, s, en in raw:
        if e not in groups.setdefault((s, en), []):
            groups[(s, en)].append(e)
    taken, out = [], []
    for (s, en), cands in sorted(groups.items(), key=lambda kv: (-(kv[0][1] - kv[0][0]), kv[0][0])):
        if any(s < b and a < en for a, b in taken):
            continue
        L, S, R = text[max(0, s - 40):s], text[s:en], text[en:en + 40]
        Lfull = text[:s]
        keep = []
        for e in cands:
            if e.ru in SENT_START_SKIP and not (Lfull.strip() == "" and R.strip() == ""):
                if re.search(r"(?:^|[.!?…:»\n—])\s*$", Lfull) and (SENT_START_SKIP[e.ru] is None or fold(S) in SENT_START_SKIP[e.ru]):
                    continue
            if e.ru in SCOPE and ch not in SCOPE[e.ru]:
                continue
            if e.ru in VETO_LEFT and _lc(VETO_LEFT[e.ru], L):
                continue
            if e.ru in VETO_RIGHT and _lc(VETO_RIGHT[e.ru], R):
                continue
            if e.ru in REQUIRE_LEFT and not _lc(REQUIRE_LEFT[e.ru], L):
                continue
            if e.type == "c" and e.ru.endswith("ия") and " " not in e.ru and _lc(MASC_CUE, L):
                continue
            keep.append(e)
        if not keep:
            continue
        taken.append((s, en))
        out.append((pick(keep, S, Lfull if len(Lfull) < 40 else L, R, ch) if len(keep) > 1 else keep[0], s, en))
    out.sort(key=lambda x: x[1])
    return out


def block_text(b):
    if b["t"] == "quote":
        t = "\n".join(b.get("lines") or [])
        if b.get("author"):
            t += "\n— " + b["author"]
        return t
    return b.get("text") or ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=0)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--forms", action="store_true")
    ap.add_argument("--clash", action="store_true", help="спаны, которым подходит больше одного имени")
    ap.add_argument("--ctx", help="контексты вхождений имени (по русской форме)")
    a = ap.parse_args()

    entries = load_entries()
    M = Matcher(entries)
    if a.clash or a.ctx:
        chs = json.load(open(os.path.join(B, "chapters_ru.json"), encoding="utf8"))["chapters"]
        cl = collections.defaultdict(list)
        for ci, ch in enumerate(chs):
            for b in ch["blocks"]:
                t = block_text(b)
                by = collections.defaultdict(set)
                for e, s0, en in (resolve(M, t, ch["slug"]) if a.ctx else M.find(t)):
                    by[(s0, en)].add(e.ru + "/" + e.type)
                    if a.ctx and e.ru == a.ctx:
                        print("%s/%d …%s⟦%s⟧%s…" % (ch["slug"], b["n"], t[max(0, s0 - 70):s0].replace("\n", " "), t[s0:en], t[en:en + 50].replace("\n", " ")))
                for (s0, en), es in by.items():
                    if len(es) > 1:
                        cl[tuple(sorted(es))].append((ch["slug"], b["n"], t[max(0, s0 - 50):s0].replace("\n", " ") + "⟦" + t[s0:en] + "⟧" + t[en:en + 30].replace("\n", " ")))
        for k, v in sorted(cl.items()):
            print(len(v), " | ".join(k))
            for x in v[:12]:
                print("     ", x[0], x[1], x[2])
        return
    chapters = json.load(open(os.path.join(B, "chapters_ru.json"), encoding="utf8"))["chapters"]
    slugs = [c["slug"] for c in chapters]
    texts = {}
    for ci, ch in enumerate(chapters):
        for b in ch["blocks"]:
            text = block_text(b)
            texts[(ci, b["n"])] = text
            seen = {}
            for e, s, en in resolve(M, text, ch["slug"]):
                e.mentions.setdefault((ci, b["n"]), []).append((s, en - s))
                e.surface[text[s:en]] += 1
    plates = json.load(open(os.path.join(B, "plates.json"), encoding="utf8"))["plates"]
    for p in plates:
        for field in ("title", "ru_caption"):
            for e, s, en in resolve(M, p.get(field) or ""):
                if p["id"] not in e.plates:
                    e.plates.append(p["id"])

    kept = [e for e in entries if e.mentions or e.plates]
    kept.sort(key=lambda e: fold(e.ru))
    if a.forms:
        for e in kept:
            print("%-28s %s %4d  %s" % (e.ru, e.type, sum(len(v) for v in e.mentions.values()), ", ".join("%s×%d" % kv for kv in e.surface.most_common(12))))
        return
    if a.sample:
        rnd = random.Random(a.seed)
        flat = [(e, k, pos) for e in kept for k, v in e.mentions.items() for pos in v[:1]]
        for e, (ci, n), (s, ln) in rnd.sample(flat, a.sample):
            t = texts[(ci, n)]
            print("[%s] %s (%s) — %s/%d\n    …%s⟦%s⟧%s…\n" % (e.type, e.ru, "/".join(e.it), slugs[ci], n,
                  t[max(0, s - 110):s].replace("\n", " "), t[s:s + ln], t[s + ln:s + ln + 80].replace("\n", " ")))
        return

    names = []
    for e in kept:
        m = [[ci, n] + [x for pos in v for x in pos] for (ci, n), v in e.mentions.items()]
        d = {"id": e.slug, "ru": e.ru, "it": e.it, "t": e.type, "n": len(m),
             "en": e.en or e.it[0], "fr": e.fr or e.it[0]}
        if e.variants:
            d["v"] = e.variants
        if e.plates:
            d["pl"] = e.plates
        d["m"] = m
        names.append(d)
    out = {"version": 1, "chapters": slugs, "names": names}
    with open(OUT, "w", encoding="utf8") as f:
        f.write('{"version":1,"chapters":' + json.dumps(slugs, ensure_ascii=False) + ',"names":[\n' +
                ",\n".join(json.dumps(d, ensure_ascii=False, separators=(",", ":")) for d in names) + "\n]}\n")
    c = collections.Counter(e.type for e in kept)
    occ = sum(len(v) for e in kept for v in e.mentions.values())
    blk = sum(len(e.mentions) for e in kept)
    print("имён: %d (%s); пропущено без вхождений: %d" % (len(kept), ", ".join("%s %d" % kv for kv in sorted(c.items())), len(entries) - len(kept)))
    print("упоминаний: %d блоков, %d вхождений; гравюр привязано: %d" % (blk, occ, sum(len(e.plates) for e in kept)))
    print("размер", os.path.getsize(OUT))


if __name__ == "__main__":
    main()
