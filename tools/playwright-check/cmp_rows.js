/* Сверка вычисленных стилей строки раздела: v180 (порт A) против текущей (порт B). Запуск: A=http://localhost:8973/index.html B=http://localhost:8974/index.html node cmp_rows.js */
const { webkit, devices } = require('playwright'); const W = ms => new Promise(r => setTimeout(r, ms));
const A = process.env.A, B = process.env.B;
const PROPS = ['height','width','borderTopWidth','borderLeftWidth','borderLeftColor','borderRadius','backgroundColor','color','fontFamily','fontStyle','fontWeight','letterSpacing','textTransform','paddingLeft','paddingRight','boxShadow','opacity','overflow','display','flexGrow','fontSize'];
(async () => {
  const br = await webkit.launch(); const out = {};
  const pages = [['cartari/index', 'c-index'], ['cartari/names', 'c-names'], ['iconologie/list', 'r-list'], ['iconologie/p1-3', 'r-art']];
  for (const [base, tag] of [[A, 'A'], [B, 'B']]) {
    const p = await (await br.newContext({ ...devices['iPhone 13'] })).newPage();
    const list = pages.slice();
    await p.goto(base + '#/cartari/text'); await p.evaluate(() => localStorage.setItem('ic-lang', 'ru')); await p.reload(); await W(2500);
    const ch = await p.evaluate(() => { const a = document.querySelector('a[href*="/ch/"]'); return a && a.getAttribute('href').replace(/^#\//, ''); }); if (ch) list.push([ch, 'c-chapter']);
    for (const [h, name] of list) {
      await p.goto(base + '#/' + h); await p.evaluate(() => sessionStorage.clear()); await p.reload(); await W(2500);
      out[name] = out[name] || {};
      out[name][tag] = await p.evaluate(PROPS => { const row = document.querySelector('.ic-rbar-row'); if (!row) return null; const f = e => { const c = getComputedStyle(e), r = {}; PROPS.forEach(k => r[k] = c[k]); return r; };
        return { row: f(row), btns: [...row.children].filter(e => e.tagName === 'BUTTON').map(b => Object.assign(f(b), { h: Math.round(b.getBoundingClientRect().height), after: getComputedStyle(b, '::after').height, before: getComputedStyle(b, '::before').content })) }; }, PROPS);
    }
  }
  let diffs = 0;
  for (const [name, o] of Object.entries(out)) {
    if (!o.A || !o.B || !o.A.row) { console.log(name, 'нет строки', !!(o.A && o.A.row), !!(o.B && o.B.row)); continue; }
    const cmp = (x, y, w) => Object.keys(x).forEach(k => { if (String(x[k]) !== String(y[k])) { if (k === 'fontSize' && w.startsWith('btn')) return; if (k === 'width' || k === 'flexGrow') return; diffs++; console.log(name, w, k, x[k], '->', y[k]); } });
    cmp(o.A.row, o.B.row, 'row'); o.A.btns.forEach((b, i) => o.B.btns[i] && cmp(b, o.B.btns[i], 'btn' + i)); if (o.A.btns.length !== o.B.btns.length) { diffs++; console.log(name, 'число кнопок', o.A.btns.length, o.B.btns.length); }
    console.log(name, 'fontSize кнопок A/B', o.A.btns.map(b => b.fontSize).join(','), '/', o.B.btns.map(b => b.fontSize).join(','), 'h', o.B.btns.map(b => b.h).join(','));
  }
  await br.close(); console.log('расхождений', diffs);
})();
