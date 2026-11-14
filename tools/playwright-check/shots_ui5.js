const { webkit, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8971/index.html';
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = async n => p.screenshot({ path: 'out/ui5-' + n + '.png' });
  const go = async h => { await p.goto(BASE + '#/' + h); await p.evaluate(() => { sessionStorage.clear(); localStorage.setItem('ic-lang', 'ru'); }); await p.reload(); await W(2200); };
  await go('iconologie/list'); await shot('ripa-list');
  await p.click('[data-rb="sort"]'); await W(700); await shot('ripa-order-sheet');
  const sh = await p.evaluate(() => { const l = document.querySelector('#ic-ripa-sort .ic-tv-typelist'), pn = document.querySelector('#ic-ripa-sort .ic-rb-sheet-panel'); const rows = l.querySelectorAll('button'); const last = rows[rows.length-1].getBoundingClientRect(), pr = pn.getBoundingClientRect(); return { gapBelowLast: Math.round(pr.bottom - last.bottom), innerH: innerHeight }; });
  console.log('sheet', JSON.stringify(sh));
  await p.keyboard.press('Escape'); await go('iconologie/list');
  await p.click('[data-rb="find"]'); await W(400); await p.locator('.ic-rp-findbar input').pressSequentially('лав', { delay: 40 }); await W(500); await shot('ripa-find');
  await go('iconologie/p1-3'); await shot('ripa-article');
  await go('cartari/index'); await shot('cartari-index');
  await go('cartari/text'); const hr = await p.evaluate(() => { const a = document.querySelector('a[href*="/ch/"]'); return a && a.getAttribute('href'); }); if (hr) { await p.evaluate(h => { location.hash = h.replace(/^#/, ''); }, hr); await W(2500); await shot('cartari-chapter'); }
  await go('cartari/names'); await p.click('[data-rb="search"]'); await W(400); await p.locator('.ic-rp-findbar input').pressSequentially('апол', { delay: 40 }); await W(600); await shot('cartari-names-find');
  await p.keyboard.press('Enter'); await W(500); await shot('cartari-names-applied');
  await p.click('[data-rb="type"]'); await W(700); await shot('cartari-type-sheet'); await p.keyboard.press('Escape');
  await go('cartari/names'); await p.click('[data-rb="booksearch"]'); await W(500); await p.locator('#ic-rb-sheet input.ic-search').pressSequentially('аполлон', { delay: 40 }); await W(1800); await shot('cartari-loupe');
  const lp = await p.evaluate(() => document.querySelector('#ic-rb-sheet .ic-sr').innerText.slice(0, 160)); console.log('loupe:', JSON.stringify(lp));
  const chs = await p.evaluate(() => { const l = location.hash; return l; });
  console.log('errs', errs.length ? errs : 'none'); await br.close();
})();
