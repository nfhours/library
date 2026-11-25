/* Крестик очистки (общий стиль) + поиск Картари: «Фортуна» находит, «456» — «Ничего не найдено», подсказка без номеров страниц.
 * Запуск: BASE=http://localhost:8977/index.html node check_search_clear.js (сервер из корня проекта, threaded) */
const { webkit } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8977/index.html', OUT = path.join(__dirname, 'out'); const W = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, c, x) => { if (!c) bad++; console.log((c ? 'ok  ' : 'FAIL ') + n + (x ? ' ' + x : '')); };
const info = (p, sel) => p.evaluate(sel => { const b = document.querySelector(sel); if (!b) return null; const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
  return { w: r.width, h: r.height, vis: !b.hidden && r.width > 0, bg: cs.backgroundColor, bd: cs.borderTopWidth, rad: cs.borderRadius, col: cs.color, fs: cs.fontSize }; }, sel);
(async () => {
  const br = await webkit.launch(); const errs = [];
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '#/cartari/search'); await W(2500);
  const hint = await p.evaluate(() => (document.querySelector('.ic-sr-hint') || {}).textContent);
  ok('подсказка без номеров', hint && !/429|номер|page|numéro/i.test(hint), JSON.stringify(hint));
  const q = async v => { await p.evaluate(v => { const i = document.querySelector('input.ic-search'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }, v); await W(1200);
    return p.evaluate(() => ({ hint: (document.querySelector('.ic-sr-hint') || {}).textContent, rows: document.querySelectorAll('.ic-sr-a').length })); };
  let r = await q('Фортуна'); ok('«Фортуна» находит', r.rows > 0, r.rows);
  const x = await info(p, '.ic-search-clear'); console.log(JSON.stringify(x));
  ok('крестик виден при тексте', x && x.vis); ok('зона ≥44×44', x && x.w >= 44 && x.h >= 44);
  ok('без фона/рамки/кружка', x && x.bg === 'rgba(0, 0, 0, 0)' && x.bd === '0px' && x.rad === '0px');
  await p.screenshot({ path: path.join(OUT, 'clear-cartari-text.png') });
  r = await q('456'); ok('«456» — Ничего не найдено', r.rows === 0 && /Ничего не найдено|Nothing found/.test(r.hint || ''), JSON.stringify(r));
  r = await q('429'); ok('«429» — Ничего не найдено', r.rows === 0, JSON.stringify(r));
  await p.evaluate(() => document.querySelector('.ic-search-clear').click()); await W(400);
  ok('очистка скрыла крестик', (await info(p, '.ic-search-clear')).vis === false);
  ok('очистка вернула подсказку', await p.evaluate(() => !!document.querySelector('.ic-sr-hint') && document.querySelector('input.ic-search').value === ''));
  // другие поля
  for (const [name, url, sel, open] of [
    ['Рипа: найти', '#/iconologie', '.ic-rbar-findx', null], ['Мотивы', '#/motifs', '.ic-mot-findx', '.ic-mot-loupe'],
    ['Иконология: поиск', '#/iconologie/search', '.ic-search-clear', null], ['Альчато: поиск', '#/alciato/search', '.ic-search-clear', null], ['Главная: поиск', '#/', '.ic-search-clear', null]]) {
    await p.goto(BASE + url); await W(2200);
    if (open) { await p.evaluate(o => { const e = document.querySelector(o); e && e.click(); }, open); await W(300); }
    const has = await p.evaluate(s => !!document.querySelector(s), sel);
    if (!has) { console.log('skip ' + name + ' (нет ' + sel + ')'); continue; }
    await p.evaluate(s => { const b = document.querySelector(s); const w = b.parentNode.querySelector('input'); w.focus(); w.value = 'zz'; w.dispatchEvent(new Event('input', { bubbles: true })); }, sel); await W(300);
    const i = await info(p, sel); console.log(name, JSON.stringify(i));
    ok(name + ': 44×44, без фона', i && i.vis && i.w >= 44 && i.h >= 44 && i.bg === 'rgba(0, 0, 0, 0)' && i.bd === '0px', '');
    await p.screenshot({ path: path.join(OUT, 'clear-' + name.replace(/\W+/g, '_') + '.png') });
  }
  ok('нет ошибок JS', !errs.length, errs.join('|')); console.log(bad ? 'FAILS ' + bad : 'ALL OK'); await br.close();
})();
