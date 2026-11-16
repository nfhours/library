#!/usr/bin/env python3
"""Ripa 1603 - привязка гравюр к статьям по заголовкам на странице.

  python3 tools/bind.py            # читает pages/*.md (state: done), engravings.json и entries.json репозитория ripa-1603
Для страницы с гравюрой (файл NNNN_k в engravings.json): статья = последний [ЗАГОЛОВОК: …] перед строкой [ГРАВЮРА…];
иначе вторая часть Колонтитула после « / » (бегущий заголовок над гравюрой); иначе — все заголовки страницы (кандидаты).
Название нормализуется (регистр, ſ→s, v/u, j/i, знаки) и сопоставляется с `title` из entries.json (Tavola).
Пишет _text/ARTICLES_ON_PAGES.md и обновляет ~/Projects/ripa-1603/entries.json (поля title_printed, text_scan, img, bind_method).
"""
import json, os, re, glob, difflib

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = os.path.expanduser("~/Projects/ripa-1603/")


def nz(s):
    s = (s or "").lower().replace("ſ", "s")
    s = re.sub(r"[àáâ]", "a", s); s = re.sub(r"[èéê]", "e", s); s = re.sub(r"[ìíî]", "i", s); s = re.sub(r"[òóô]", "o", s); s = re.sub(r"[ùúû]", "u", s)
    s = s.replace("æ", "ae").replace("œ", "oe").replace("j", "i").replace("v", "u")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def page_info(path):
    t = open(path, encoding="utf-8").read().split("\n")
    hdr = t[0]
    if "state: done" not in hdr: return None
    scan = re.search(r"scan: (\d+)", hdr).group(1)
    titles, plate_title, run_title, seen_plate = [], None, None, False
    last = None
    for ln in t[1:]:
        m = re.match(r"\[ЗАГОЛОВОК:\s*(.*)\]\s*$", ln)
        if m: titles.append(m.group(1)); last = m.group(1)
        if ln.startswith("[ГРАВЮРА") and not seen_plate: seen_plate = True; plate_title = last
        k = re.match(r"Колонтитул:\s*(.*)$", ln)
        if k and " / " in k.group(1): run_title = k.group(1).split(" / ", 1)[1].strip()
    return {"scan": scan, "titles": titles, "plate_title": plate_title, "run_title": run_title, "has_plate_marker": seen_plate}


def main():
    ent = json.load(open(R + "entries.json")); items = ent["items"]
    idx = {}
    for e in items: idx.setdefault(nz(e["title"]), []).append(e)
    engs = {}
    for e in json.load(open(R + "engravings.json")): engs.setdefault("%04d" % e["scan"], []).append(e["file"])
    rows = []
    for p in sorted(glob.glob(HERE + "/pages/*.md")):
        pi = page_info(p)
        if not pi: continue
        sc = pi["scan"]; files = engs.get(sc, [])
        cands = []
        if files:
            if pi["plate_title"]: cands, method = [pi["plate_title"]], "заголовок перед гравюрой"
            elif pi["run_title"]: cands, method = [pi["run_title"]], "бегущий заголовок"
            else: cands, method = pi["titles"], "заголовки страницы (неоднозначно)"
        else:
            cands, method = pi["titles"], "нет рамки"
        hit = []
        for c in cands:
            k = nz(c)
            m = idx.get(k)
            if not m:
                cm = difflib.get_close_matches(k, list(idx), n=1, cutoff=0.82)
                m = idx[cm[0]] if cm else None
            if m: hit += [x for x in m if x not in hit]
        rows.append((sc, pi["titles"], pi["run_title"], files, cands, [h["id"] for h in hit], method))
        for h in hit:
            h["title_printed"] = cands[0] if len(cands) == 1 else next((c for c in cands if nz(c) == nz(h["title"])), cands[0])
            h["text_scan"] = int(sc)
            if files and method != "заголовки страницы (неоднозначно)": h["img"] = files; h["bind_method"] = method
    for e in items:  # заголовки, найденные в тексте страниц, но не привязанные к рамке: просто фиксируем страницу
        pass
    json.dump(ent, open(R + "entries.json", "w"), ensure_ascii=False, indent=1)
    out = ["# Привязка гравюр к статьям (по заголовкам на страницах)", "", "| Скан | Заголовки на странице | Бегущий | Гравюры | Статья (Tavola id) | Способ |", "|---|---|---|---|---|---|"]
    for sc, tt, rt, files, cands, ids, method in rows:
        out.append("| %s | %s | %s | %s | %s | %s |" % (sc, "; ".join(tt), rt or "", ", ".join(files), ", ".join(ids) or "—", method))
    open(HERE + "/ARTICLES_ON_PAGES.md", "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("страниц:", len(rows), "привязано к статьям Tavola:", sum(1 for r in rows if r[5]), "гравюр привязано:", sum(1 for r in rows if r[3] and r[5]))


if __name__ == "__main__":
    main()
