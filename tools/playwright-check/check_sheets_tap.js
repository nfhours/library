/* Тёмные шторки (общий механизм makeRbSheet): тап по затемнению ниже короткой шторки закрывает её
 * (пустая область клип-бокса/слайда не перехватывает касания); «назад» с открытой шторкой уходит чисто;
 * тапы внутри шторки работают. Картари: Тип (имена), лупа, содержание; Рипа: Часть, Порядок, лупа.
 *   cd tools/playwright-check && BASE=http://localhost:8950/index.html node check_sheets_tap.js
 */
const { webkit, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8950/index.html';
const W = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, c, x) => { if (!c) bad++; console.log((c ? 'ok  ' : 'FAIL ') + n + (x !== undefined ? ' ' + x : '')); };

const CASES = [
  { name: 'cartari names: Тип', hash: '#/cartari/names', btn: '[data-rb="type"]', sheet: '#ic-tv-type-sheet',
    inside: async p => { await p.tap('#ic-tv-type-sheet .ic-tv-typerow:nth-child(2)'); await W(900);
      return p.evaluate(() => !document.querySelector('#ic-tv-type-sheet.ic-rb-sheet-open') && document.querySelector('[data-rb="type"]').classList.contains('ic-rbar-on')); } },
  { name: 'cartari: лупа', hash: '#/cartari/names', btn: '[data-rb="booksearch"]', sheet: '#ic-rb-sheet',
    inside: async p => { await p.tap('#ic-rb-sheet .ic-search'); await p.keyboard.type('аполлон'); await W(1500);
      return p.evaluate(() => !!document.querySelector('#ic-rb-sheet.ic-rb-sheet-open') && document.querySelectorAll('#ic-rb-sheet .ic-sr a').length > 0); } },
  { name: 'cartari: содержание', hash: '#/cartari/ch/frontespizio-dedica', btn: '[data-rb="pos"]', sheet: '#ic-rb-toc-sheet',
    inside: async p => { const h0 = await p.evaluate(() => location.hash);
      const a = p.locator('#ic-rb-toc-sheet .ic-rb-toc-body a').nth(3); await a.scrollIntoViewIfNeeded(); await a.tap(); await W(1800);
      return p.evaluate(h0 => location.hash !== h0 && !document.querySelector('.ic-rb-sheet-open'), h0); } },
  { name: 'ripa: Часть', hash: '#/iconologie/list', btn: '[data-rb="part"]', sheet: '#ic-ripa-part',
    inside: async p => { await p.tap('#ic-ripa-part .ic-tv-typerow[data-f="2"]'); await W(900);
      return p.evaluate(() => !document.querySelector('#ic-ripa-part.ic-rb-sheet-open') && document.querySelector('[data-rb="part"]').classList.contains('ic-rbar-on')); } },
  { name: 'ripa: Порядок', hash: '#/iconologie/list', btn: '[data-rb="sort"]', sheet: '#ic-ripa-sort',
    inside: async p => { await p.tap('#ic-ripa-sort .ic-tv-typerow[data-sort-opt="ru"]'); await W(900);
      return p.evaluate(() => !document.querySelector('#ic-ripa-sort.ic-rb-sheet-open') && document.querySelector('[data-rb="sort"]').classList.contains('ic-rbar-on')); } },
  { name: 'ripa: лупа', hash: '#/iconologie/list', btn: '[data-rb="booksearch"]', sheet: '#ic-rb-sheet.ic-rp-loupe',
    inside: async p => { await p.tap('#ic-rb-sheet .ic-search'); await p.keyboard.type('любовь'); await W(1500);
      return p.evaluate(() => !!document.querySelector('#ic-rb-sheet.ic-rb-sheet-open') && document.querySelectorAll('#ic-rb-sheet .ic-sr a').length > 0); } },
];

(async () => {
  const br = await webkit.launch(), ctx = await br.newContext({ ...devices['iPhone 13'] }), p = await ctx.newPage(), errs = [];
  const benign = t => /access control checks|Load failed|cancelled/i.test(t); // fetch, оборванный перезагрузкой страницы (как в check_ripa.js)
  p.on('console', m => { if (m.type() === 'error' && !benign(m.text())) errs.push(m.text()); });
  p.on('pageerror', e => { if (!benign(e.message)) errs.push('pageerror: ' + e.message); });
  const fresh = async h => { await p.goto(BASE + h); await p.evaluate(() => { localStorage.setItem('ic-lang', 'ru'); sessionStorage.clear(); }); await p.reload(); await W(2500); };
  const state = s => p.evaluate(s => ({ open: !!document.querySelector(s + '.ic-rb-sheet-open'), dim: !!document.querySelector('#ic-rb-dim.ic-rb-dim-show'),
    lock: document.body.style.position === 'fixed' }), s);
  const open = async c => { await p.tap(c.btn); await W(900); return state(c.sheet); };
  for (const c of CASES) {
    // 1) тап мимо — в затемнение ниже панели
    await fresh(c.hash); let s = await open(c);
    ok(c.name + ': opens', s.open && s.dim, JSON.stringify(s));
    const g = await p.evaluate(sel => { const pn = document.querySelector(sel + ' .ic-rb-sheet-panel').getBoundingClientRect(); return { bottom: pn.bottom, vh: innerHeight }; }, c.sheet);
    if (g.bottom < g.vh - 30) {
      const y = Math.round((g.bottom + g.vh) / 2);
      const hit = await p.evaluate(y => { const e = document.elementFromPoint(40, y); return e ? (e.id || e.className) : ''; }, y);
      await p.touchscreen.tap(40, y); await W(900); s = await state(c.sheet);
      ok(c.name + ': tap on dim below the panel closes it', !s.open && !s.dim && !s.lock, JSON.stringify({ y, hit, ...s }));
    } else ok(c.name + ': panel reaches the bottom — no empty area below (tap-outside n/a)', true, JSON.stringify(g));
    // 2) «назад» с открытой шторкой
    await fresh(c.hash); await open(c); const h0 = await p.evaluate(() => location.hash);
    await p.tap('.ic-bt-back'); await W(1800);
    const b = await p.evaluate(() => ({ h: location.hash, open: !!document.querySelector('.ic-rb-sheet-open'), dim: !!document.querySelector('#ic-rb-dim.ic-rb-dim-show'), lock: document.body.style.position === 'fixed' }));
    ok(c.name + ': «назад» with sheet open leaves cleanly', b.h !== h0 && !b.open && !b.dim && !b.lock, JSON.stringify(b));
    // 3) Esc
    await fresh(c.hash); await open(c); await p.keyboard.press('Escape'); await W(900); s = await state(c.sheet);
    ok(c.name + ': Esc closes', !s.open && !s.lock, JSON.stringify(s));
    // 4) тапы внутри шторки работают
    await fresh(c.hash); await open(c);
    ok(c.name + ': taps inside the sheet work', await c.inside(p));
  }
  ok('console clean', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); console.log(bad ? 'FAILS ' + bad : 'ALL OK');
})();
