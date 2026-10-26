#!/usr/bin/env python3
"""Проверка полей fix в _review/grok/<book>/*.json.

Нумерация абзацев: text_ru / text_en / text_fr в books/<book>/entries.json — список строк;
paragraph = номер элемента списка, с 1. Внутри элемента могут быть "\\n\\n" — они не делят абзац.
paragraph = null — fix к строковому полю (заголовок, legend_*, findspot_*), before = значение поля целиком.

Проверяется:
1. before побайтно равен текущему абзацу (полю) в entries.json; для абзаца ещё — before встречается в поле ровно один раз;
2. after != before;
3. before и after совпадают побайтно вне изменённой середины (общий префикс и суффикс);
   ошибка, если середина длиннее 3000 символов или правками затронуто больше MAX_CHANGED символов before.
   С -v печатается каждое изменение с контекстом.
entries.json только читается.
"""
import json, glob, os, sys, difflib

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(ROOT))
MAX_CHANGED = 300  # символов в before, затронутых правкой (для абзацев)

def load_items(book):
    d = json.load(open(os.path.join(REPO, 'books', book, 'entries.json'), encoding='utf-8'))
    d = d['items'] if isinstance(d, dict) else d
    return {e['id']: e for e in d}

def main():
    errors = 0; counts = {}; verbose = '-v' in sys.argv
    cache = {}
    for path in sorted(glob.glob(os.path.join(ROOT, '*', '*.json'))):
        book = os.path.basename(os.path.dirname(path))
        d = json.load(open(path, encoding='utf-8'))
        if not isinstance(d, dict):
            continue
        for o in d.get('issues', []):
            if 'fix' not in o:
                continue
            fixes = o['fix'] if isinstance(o['fix'], list) else [o['fix']]
            if book not in cache:
                cache[book] = load_items(book)
            e = cache[book][d['id']]
            for fx in fixes:
                tag = f"{book}/{d['id']} {o['issue_id']} {fx['field']} p{fx['paragraph']}"
                val = e.get(fx['field'])
                p = fx['paragraph']
                if p is None:
                    cur = val
                    ok = isinstance(cur, str) and cur == fx['before']
                else:
                    cur = val[p - 1] if isinstance(val, list) and 0 < p <= len(val) else None
                    ok = cur == fx['before'] and sum(x.count(fx['before']) for x in val) == 1
                if not ok:
                    print('ERROR before != entries.json:', tag); errors += 1; continue
                if fx['after'] == fx['before']:
                    print('ERROR after == before:', tag); errors += 1; continue
                b, a = fx['before'], fx['after']
                pre = 0
                while pre < min(len(b), len(a)) and b[pre] == a[pre]:
                    pre += 1
                suf = 0
                while suf < min(len(b), len(a)) - pre and b[-1 - suf] == a[-1 - suf]:
                    suf += 1
                mb, ma = b[pre:len(b) - suf], a[pre:len(a) - suf]
                # внутри изменённой середины: отдельные правки (difflib на коротком куске)
                sm = difflib.SequenceMatcher(None, mb, ma, autojunk=False)
                segs = [op for op in sm.get_opcodes() if op[0] != 'equal']
                changed = sum(i2 - i1 for _, i1, i2, _, _ in segs)
                if p is not None and (len(mb) > 3000 or changed > MAX_CHANGED):
                    print('ERROR правка слишком широкая:', tag, len(mb), changed); errors += 1
                counts[book] = counts.get(book, 0) + 1
                if verbose:
                    print(f"{tag}: «{b[max(0,pre-20):len(b)-suf+20]}» -> «{a[max(0,pre-20):len(a)-suf+20]}»")
    print('fix по книгам:', counts, 'ошибок:', errors)
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
