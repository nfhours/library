/* Рипа: обложка (гравированный титул) и p1-54 со сканом с. 82 (Internet Archive). BASE=http://localhost:8975/index.html node shots_ripa_ia.js */
const { webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8975/index.html', OUT = path.join(__dirname, 'out');
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await webkit.launch(), ctx = await br.newContext({ ...devices['iPhone 13'] }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
  await p.goto(BASE + '#/iconologie'); await p.evaluate(() => { localStorage.setItem('ic-lang', 'ru'); sessionStorage.clear(); }); await p.reload(); await W(3000);
  const src = await p.$eval('.ic-home-fig img', i => i.getAttribute('src')); const nat = await p.$eval('.ic-home-fig img', i => i.naturalWidth);
  console.log('cover hero', src, 'naturalWidth', nat);
  await p.screenshot({ path: path.join(OUT, 'ripa-cover-title.png') });
  await p.goto(BASE + '#/iconologie/p1-54'); await W(2500);
  await p.tap('[data-rb="scan"]'); await W(1500);
  const n = await p.$$eval('.ic-scan-nav span', s => s.map(x => x.textContent)); console.log('scan nav', n);
  await p.tap('.ic-scan-next'); await W(1500);
  const s2 = await p.$eval('.ic-scan-frame img', i => i.getAttribute('src') + ' w=' + i.naturalWidth); console.log('scan', s2);
  const fr = await p.$('.ic-scan'); await fr.scrollIntoViewIfNeeded(); await W(800);
  await p.screenshot({ path: path.join(OUT, 'ripa-p1-54-scan.png') });
  const txt = await p.$$eval('.ic-fr p, .ic-text p', e => e.length); console.log('paras', txt);
  console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'console clean'); await br.close();
})();
