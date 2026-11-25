#!/usr/bin/env python3
"""Пересобирает служебные таблицы books/_motifs/motifs_cartari.md и motifs_ripa1677.md
из motifs_vocab.json, motifs_cartari.json, motifs_ripa1677.json (и books/iconologie/entries.json для названий статей).
Сайт эти .md не читает: они нужны только человеку.

Запуск из корня репозитория:  python3 tools/build_motifs_md.py
Пути можно переопределить: --vocab --cartari --ripa --entries --out-dir
"""
import argparse, json, os
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT_ORDER_RIPA = ['предмет', 'оружие', 'животное', 'растение', 'небесное', 'поза и жест', 'черта фигуры', 'персонаж', 'место и постройка']
CAT_ORDER_CARTARI = ['животное', 'место и постройка', 'небесное', 'оружие', 'персонаж', 'поза и жест', 'предмет', 'растение', 'черта фигуры']
IND = '&emsp;'


def natkey(i):
    return (i[0], [int(x) if x.isdigit() else x for x in __import__('re').split(r'(\d+)', i)])


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def link_children(vocab):
    """children = перечисленные в словаре + все, у кого parent указывает на мотив (в словаре бывают расхождения)."""
    by_id = {m['id']: m for m in vocab}
    for m in vocab:
        p = m.get('parent')
        if p in by_id and m['id'] not in by_id[p].setdefault('children', []):
            by_id[p]['children'].append(m['id'])


def tree_rows(vocab, ids_by_motif, cats, tie=False):
    """Для каждой категории: список (motif, depth, own, total) — корни по убыванию числа гравюр, дети после родителя."""
    by_id = {m['id']: m for m in vocab}
    link_children(vocab)

    def total(mid):
        s = set(ids_by_motif.get(mid, ()))
        for ch in by_id[mid].get('children', []):
            if ch in by_id:
                s |= total(ch)
        return s

    out = {}
    for cat in cats:
        rows = []
        roots = [m for m in vocab if m['category'] == cat and (m.get('parent') not in by_id) and (m['id'] in ids_by_motif or total(m['id']))]
        roots.sort(key=lambda m: (-len(total(m['id'])), m['id'] if tie else ''))

        def walk(m, depth):
            own = len(ids_by_motif.get(m['id'], ()))
            tot = len(total(m['id']))
            rows.append((m, depth, own, tot))
            kids = [by_id[c] for c in m.get('children', []) if c in by_id and total(c)]
            kids.sort(key=lambda k: (-len(total(k['id'])), k['id'] if tie else ''))
            for k in kids:
                walk(k, depth + 1)
        for r in roots:
            walk(r, 0)
        out[cat] = rows
    return out


def build_ripa(vocab, rip, entries, out):
    by_id = {m['id']: m for m in vocab}
    ent = {e['id']: e for e in entries}
    bind = {k: v for k, v in rip['bindings'].items() if k in by_id}
    arts = set(a for v in bind.values() for a in v)
    merged_n = sum(len(v) for v in rip.get('merged', {}).values())
    L = ['# Мотивы Рипы 1677', '']
    L.append('Мотивов: %d (слито %d); статей с мотивами: %d из %d. Источник: attrs[].what. У мотива есть `category` и `parent`; число в скобках у родителя — гравюры с самим мотивом или любым дочерним. id мотивов Гроссона сохранены.' % (len(bind), merged_n, len(arts), len(entries)))
    L += ['', '| Категория | Мотивов |', '|---|---|']
    cnt = Counter(by_id[k]['category'] for k in bind)
    for c in CAT_ORDER_RIPA:
        L.append('| %s | %d |' % (c, cnt.get(c, 0)))
    trees = tree_rows(vocab, bind, CAT_ORDER_RIPA)
    for c in CAT_ORDER_RIPA:
        L += ['', '## ' + c, '', '| Мотив RU | EN | FR | id | Гравюр | Пример |', '|---|---|---|---|---|---|']
        for m, d, own, tot in trees[c]:
            if not tot:
                continue
            ex = ''
            ids = bind.get(m['id']) or []
            if not ids:
                for ch in m.get('children', []):
                    ids = bind.get(ch) or ids
                    if ids:
                        break
            if ids:
                a = ids[0]
                ex = '%s %s' % (a, ent.get(a, {}).get('ru', ''))
            num = str(tot) if tot == own else '%d (%d сам)' % (tot, own)
            L.append('| %s%s | %s | %s | %s | %s | %s |' % (IND * d, m['ru'], m['en'], m['fr'], m['id'], num, ex))
    L += ['', '## Слито', '']
    for t, srcs in rip.get('merged', {}).items():
        tr = by_id.get(t, {}).get('ru', '')
        L.append('- %s → %s («%s»)' % (', '.join('%s («%s»)' % (s['id'], s['ru']) for s in srcs), t, tr))
    L += ['', '## Спорные случаи', '']
    for d in rip.get('doubtful', []):
        L.append('- %s (%s): %s — %s' % (d['article'], ent.get(d['article'], {}).get('ru', ''), d['motif'], d['why']))
    one = [k for k, v in bind.items() if len(v) == 1]
    L += ['', '## Мотивы на одной гравюре (%d)' % len(one), '', ', '.join(one), '']
    with open(os.path.join(out, 'motifs_ripa1677.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


def build_cartari(vocab, car, rip, out):
    by_id = {m['id']: m for m in vocab}
    ripa_ids = set(rip['bindings'])
    bind = {k: sorted(v) for k, v in car['bindings'].items() if k in by_id}
    plates = car['plates']
    with_motifs = sum(1 for p in plates.values() if p.get('motifs'))
    new = [k for k in bind if k not in ripa_ids]
    common = len(bind) - len(new)
    no_cap = car['plates_no_caption']
    L = ['# Мотивы Картари', '']
    L.append('Гравюр: %d, с мотивами: %d. Мотивов: %d (общих с Рипой 1677: %d, новых: %d). «Под вопросом»: %d записей. Гравюр без подписи: %d.' % (len(plates), with_motifs, len(bind), common, len(new), len(car['doubtful']), len(no_cap)))
    L += ['', 'Как собрано: подсказки-кандидаты из подписей и текста глав (plates.json, chapters_ru.json), затем **каждая гравюра просмотрена по изображению**: в мотивы попало только то, что видно на гравюре. Названное в тексте, но не найденное на гравюре — в «под вопросом». id, названия, категории и родители Рипы сохранены; новые мотивы помечены.', '']
    L += ['## Топ-20 по частоте', '', '| # | Мотив | id | Гравюр |', '|---|---|---|---|']
    def tot_of_set(k):
        s = set(bind.get(k, ()))
        for c in by_id[k].get('children', []):
            if c in by_id: s |= tot_of_set(c)
        return s
    top = sorted([m['id'] for m in vocab if tot_of_set(m['id'])], key=lambda k: (-len(tot_of_set(k)), k))[:20]
    for i, k in enumerate(top, 1):
        L.append('| %d | %s | %s | %d |' % (i, by_id[k]['ru'], k, len(tot_of_set(k))))
    L += ['', '## По разделам']
    trees = tree_rows(vocab, bind, CAT_ORDER_CARTARI, True)
    for c in CAT_ORDER_CARTARI:
        L += ['', '### ' + c, '', '| Мотив RU | EN | FR | id | Гравюр | Примеры |', '|---|---|---|---|---|---|']
        for m, d, own, tot in trees[c]:
            if not tot:
                continue
            ids = sorted(tot_of_set(m['id']))
            num = str(tot) if tot == own and not m.get('children') else '%d (%d сам)' % (tot, own)
            star = ' ✦' if m['id'] in new else ''
            L.append('| %s%s%s | %s | %s | %s | %s | %s |' % (IND * d, m['ru'], star, m['en'], m['fr'], m['id'], num, ', '.join(ids[:3])))
    L += ['', '✦ — новый мотив (нет в словаре Рипы).', '', '## Новые мотивы (нет у Рипы)', '', '| Мотив | id | Категория | Родитель | Гравюр | Гравюры |', '|---|---|---|---|---|---|']
    for k in sorted(new, key=lambda k: -len(bind[k])):
        m = by_id[k]; ids = bind[k]
        L.append('| %s | %s | %s | %s | %d | %s%s |' % (m['ru'], k, m['category'], m.get('parent') or '—', len(ids), ', '.join(ids[:12]), ' …' if len(ids) > 12 else ''))
    L += ['', '## Под вопросом']
    groups = defaultdict(lambda: defaultdict(list))
    for d in car['doubtful']:
        groups[d['why']][d['motif']].append(d['plate'])
    for why, ms in groups.items():
        L += ['', '### %s (%d)' % (why, sum(len(v) for v in ms.values())), '', '| Мотив | id | Гравюр | Какие |', '|---|---|---|---|']
        for mid, pl in sorted(ms.items(), key=lambda kv: -len(kv[1])):
            pl = sorted(pl)
            L.append('| %s | %s | %d | %s |' % (by_id[mid]['ru'] if mid in by_id else '%s (нет в словаре)' % mid, mid, len(pl), ', '.join(pl)))
    L += ['', '### Замеченное на гравюре, но не внесённое в словарь (единичные предметы)', '']
    for name, pl in sorted(car.get('unmapped_extra', {}).items()):
        L.append('- %s: %s' % (name, ', '.join(pl)))
    L += ['', '## Гравюры без подписи (%d)' % len(no_cap), '', 'У них нет ни it_caption, ни ru_caption (это в основном вставные листы и рисунки без подписи); мотивы по ним взяты только с изображения.', '', '| id | Глава | Название |', '|---|---|---|']
    for e in no_cap:
        p = plates[e]
        L.append('| %s | %s | %s |' % (e, p.get('chapter', ''), p.get('title', '')))
    L.append('')
    with open(os.path.join(out, 'motifs_cartari.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


def main():
    a = argparse.ArgumentParser()
    d = os.path.join(ROOT, 'books', '_motifs')
    a.add_argument('--vocab', default=os.path.join(d, 'motifs_vocab.json'))
    a.add_argument('--cartari', default=os.path.join(d, 'motifs_cartari.json'))
    a.add_argument('--ripa', default=os.path.join(d, 'motifs_ripa1677.json'))
    a.add_argument('--entries', default=os.path.join(ROOT, 'books', 'iconologie', 'entries.json'))
    a.add_argument('--out-dir', default=d)
    a.add_argument('--only', choices=['ripa', 'cartari'])
    o = a.parse_args()
    vocab = load(o.vocab)['motifs']
    rip = load(o.ripa)
    if o.only != 'cartari':
        build_ripa(vocab, rip, load(o.entries)['items'], o.out_dir)
    if o.only != 'ripa':
        build_cartari(vocab, load(o.cartari), rip, o.out_dir)


if __name__ == '__main__':
    main()
