#!/usr/bin/env python3
"""Сборка books/alciato/text.json — компактные данные для страниц Альчато на сайте.

Источники (только чтение):
  books/alciato/entries.json          — эмблемы (id alcNN, num, page, section, no_motto), sections[], intro[]
  books/alciato/_text/pages/NNNN.md   — латынь по страницам (кадр = страница + 6), {как_напечатано|исправление} → исправление
  ~/Projects/alciato/frames.json      — какие страницы продолжают эмблему (двухстраничные), есть ли вырезанная гравюра (pic_box)
  ~/Projects/alciato/plates/, thumb/  — размеры картинок (резерв места до загрузки)

Выход books/alciato/text.json:
  sections: [{rubric, ru, en, fr, intro?}]        — 35 разделов, первый — «Вступление» (три вводных текста)
  la: {id: {motto, lines}}                         — латынь: motto — латинский заголовок-девиз (как в книге),
                                                     lines — строки эпиграммы; строка "# X" — подзаголовок (ALIVD., DIALOGISMVS. …)
  pages: {id: [[page_id, w, h], ...]}              — страницы эмблемы (plates/<page_id>.webp), вторая — продолжение
  thumbs: {id: [w, h]}                             — миниатюра гравюры (thumb/<id>_t.webp), только где гравюра вырезана
  introGreek: {intro-id: {en, fr}}                 — EN/FR перевод греческого места вводного текста

Запуск: python3 tools/build_alciato_text.py [путь к репозиторию alciato]
"""
import json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "books", "alciato")
HEAVY = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Projects/alciato")

SEC_FR = {
    "EMBLEM. DEDIC": "Introduction", "DEVS SIVE RELIGIO": "Dieu, ou la Religion", "FIDES": "Foi",
    "PRVDENTIA": "Prudence", "IVSTITIA": "Justice", "FORTITVDO": "Force", "CONCORDIA": "Concorde",
    "SPES": "Espérance", "PVDICITIA": "Chasteté", "PERFIDIA": "Perfidie", "STVLTITIA": "Folie",
    "SVPERBIA": "Orgueil", "INVIDIA": "Envie", "LVXVRIA": "Luxure", "DESIDIA": "Paresse",
    "AVARITIA": "Avarice", "GVLA": "Gourmandise", "DOCTORVM AGNOMINA": "Surnoms des savants",
    "NATVRA": "Nature", "ASTROLOGIA": "Astrologie", "AMOR": "Amour", "FORTVNA": "Fortune",
    "HONOR": "Honneur", "PRINCEPS": "Le Prince", "RESPVBLICA": "La République", "VITA": "Vie",
    "MORS": "Mort", "AMICITIA": "Amitié", "HOSTILITAS": "Inimitié", "VINDICTA": "Vengeance",
    "PAX": "Paix", "SCIENTIA": "Science", "IGNORANTIA": "Ignorance", "MATRIMONIVM": "Mariage",
    "ARBORES": "Arbres",
}
INTRO = {"ru": "Вступление", "en": "Introduction", "fr": "Introduction"}
# перевод греческой надписи вводного текста 3 (в intro.json он только по-русски: «ничего не откладывая»)
INTRO_GREEK = {"intro-3": {"en": "putting nothing off", "fr": "sans rien remettre à plus tard"}}


def key(s):
    s = re.sub(r"[^A-Za-z]", "", s).upper()
    return s.replace("U", "V").replace("J", "I")


def page_lines(scan):
    path = os.path.join(BOOK, "_text", "pages", "%04d.md" % scan)
    out = []
    for ln in open(path, encoding="utf-8").read().split("\n"):
        if ln.startswith("<!--") or not ln.strip():
            continue
        if re.match(r"^(Колонтитул|Кустод|Сигнатура|Маргиналии):", ln):
            continue
        ln = re.sub(r"\{([^{}|]*)\|([^{}]*)\}", r"\2", ln)
        ln = re.sub(r"\[ИНИЦИАЛ:\s*([^\]]*)\]", r"\1", ln)
        if re.match(r"^\[(ГРАВЮРА|ВИНЬЕТКА)", ln):
            continue
        out.append(ln.strip())
    return out


def size(path):
    with Image.open(path) as im:
        return list(im.size)


def main():
    ent = json.load(open(os.path.join(BOOK, "entries.json"), encoding="utf-8"))
    frames = json.load(open(os.path.join(HEAVY, "frames.json"), encoding="utf-8"))
    byframe = {f["id"]: f for f in frames}
    cont = {}  # entry id -> [continuation page ids]
    for f in frames:
        if f.get("entry") and f.get("first_page_of_entry") is False:
            cont.setdefault(f["entry"], []).append(f["id"])

    sections = []
    for s in ent["sections"]:
        r = {"rubric": s["rubric"], "ru": s["ru"], "en": s["en"], "fr": SEC_FR[s["rubric"]]}
        if s["rubric"].startswith("EMBLEM. DEDIC"):
            r.update(INTRO); r["intro"] = True
        sections.append(r)
    seckeys = set(key(s["rubric"]) for s in sections)

    la, pages, thumbs, nlat = {}, {}, {}, {}
    units = [(i["id"], int(i["frame"]), i["id"], None) for i in ent["intro"]]
    units += [(x["id"], int(x["page"].split("-")[0]) + 6, x["id"], x) for x in ent["items"]]
    for uid, scan, pid, it in units:
        page_ids = ["fm%04d" % scan] if uid.startswith("intro") else [uid]
        page_ids += cont.get(uid, [])
        lines, motto = [], None
        pcount = []
        for k, p in enumerate(page_ids):
            sc = scan + k
            n0 = sum(1 for x in lines if not x.startswith("# "))
            for ln in page_lines(sc):
                m = re.match(r"^\[ЗАГОЛОВОК:\s*(.*)\]$", ln)
                if m:
                    h = m.group(1).strip()
                    caps = h == h.upper()
                    if caps and (key(h) in seckeys or key(h) in ("VIRTVTES", "VITIA")):
                        continue
                    if motto is None and not lines and not (it and it.get("no_motto")):
                        motto = h
                        continue
                    lines.append("# " + h)
                elif ln.startswith("["):
                    continue
                else:
                    lines.append(ln)
            pcount.append(sum(1 for x in lines if not x.startswith("# ")) - n0)
        la[uid] = {"motto": motto, "lines": lines}
        for p_, n_ in zip(page_ids, pcount): nlat[p_] = n_
        pages[uid] = [[p] + size(os.path.join(HEAVY, "plates", p + ".webp")) for p in page_ids]
        fr = byframe.get(page_ids[0], {})
        if "pic" in (fr.get("kinds") or []):
            thumbs[uid] = size(os.path.join(HEAVY, "thumb", page_ids[0] + "_t.webp"))

    out = {"sections": sections, "la": la, "pages": pages, "thumbs": thumbs, "introGreek": INTRO_GREEK}
    # поля для перевода: области «вычитания» из разметки (crops.json) в долях страницы (page_box), % — books/alciato/fit.json
    crops = json.load(open(os.path.join(BOOK, "_crops", "crops.json"), encoding="utf-8"))
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    import build_alciato as ba
    fit = {}
    for f in frames:
        if f.get("status") != "ok" or f["id"] not in nlat: continue
        bx = ba.classify(crops[f["frame"]]["boxes"]); pg = next(b for b in bx if b["k"] == "page")
        rel = lambda b: [round((b["x"] - pg["x"]) / pg["w"] * 100, 2), round((b["y"] - pg["y"]) / pg["h"] * 100, 2), round(b["w"] / pg["w"] * 100, 2), round(b["h"] / pg["h"] * 100, 2)]
        # полем текста считаются рамки «Текстовая область для вычитания» (подпись со словом «текст») и неподписанные «текстовые»;
        # «зона вычитания для извлечения лишнего из рамки» и подобные — вычитание для вырезки рамки (в plates остаётся), полем не считаются
        holes = [rel(b) for b in bx if b["k"] == "text" and (not (b.get("label") or "").strip() or "текст" in b["label"].lower())]
        for tl in (rel(b) for b in bx if b["k"] == "tail"):   # концовка внутри поля остаётся печатной: поле кончается над ней
            for h in holes:
                if h[1] + h[3] * 0.3 < tl[1] < h[1] + h[3] and tl[0] < h[0] + h[2] and tl[0] + tl[2] > h[0]:
                    h[3] = round(tl[1] - h[1] - 0.6, 2)
        if len(holes) == 1: fit[f["id"]] = {"h": holes[0], "n": nlat[f["id"]]}
    with open(os.path.join(BOOK, "fit.json"), "w", encoding="utf-8") as fo:
        json.dump(fit, fo, separators=(",", ":")); fo.write("\n")
    with open(os.path.join(BOOK, "text.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print("units", len(la), "two-page", sum(len(v) > 1 for v in pages.values()), "thumbs", len(thumbs),
          "no motto", [k for k, v in la.items() if not v["motto"]])


if __name__ == "__main__":
    main()
