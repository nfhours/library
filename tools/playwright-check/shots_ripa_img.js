/* Рипа: скриншоты 5 самых крупных картинок до/после уменьшения до 2000px: статья и полноэкранный просмотр (с увеличением, как щипок).
 * Запуск: BASE=http://localhost:8963/index.html node shots_ripa_img.js before|after */
const { webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8963/index.html', TAG = process.argv[2] || 'before', OUT = path.join(__dirname, 'out');
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await webkit.launch(), ctx = await br.newContext({ ...devices['iPhone 13'] }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
  for (const id of ['p2-249', 'p2-247', 'p2-250', 'p2-248', 'p2-210']) {
    await p.goto(BASE + '#/iconologie/' + id); await p.evaluate(() => { localStorage.setItem('ic-lang', 'ru'); sessionStorage.clear(); }); await p.reload(); await W(2500);
    const fig = await p.$('.ic-fig'); await fig.scrollIntoViewIfNeeded(); await W(1500);
    await fig.screenshot({ path: path.join(OUT, `ripa-img-${id}-article-${TAG}.png`) });
    await p.tap('.ic-fig img'); await W(2000);
    await p.evaluate(() => { const i = document.querySelector('.ic-svx-one img, .ic-lb img'); i.style.transform = 'scale(2.6)'; i.style.transformOrigin = '50% 40%'; }); await W(500);
    await p.screenshot({ path: path.join(OUT, `ripa-img-${id}-viewer-${TAG}.png`) });
  }
  console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'console clean'); await br.close();
})();
