/* Скриншоты второго захода Рипы (?new): ripa-new2-*.png + замеры */
const { webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8950/index.html'; const OUT = path.join(__dirname, 'out');
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; const bn = t => /access control|Load failed/.test(t);
  p.on('pageerror', e => { if (!bn(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !bn(m.text())) errs.push(m.text()); });
  const W = ms => p.waitForTimeout(ms);
  const open = async (h, l = 'ru') => { await p.goto(BASE + '?new' + h); await p.evaluate(l => { localStorage.setItem('ic-lang', l); sessionStorage.clear(); }, l); await p.reload(); await W(1300); };
  await open('#/iconologie'); await p.screenshot({ path: OUT + '/ripa-new2-list.png' });
  await p.click('[data-rb="part"]'); await W(700); await p.screenshot({ path: OUT + '/ripa-new2-part-sheet.png' });
  await p.click('[data-rb="part"]'); await W(500);
  await p.click('[data-rb="find"]'); await W(600);
  await p.evaluate(() => { const i = document.querySelector('#ic-ripa-find input.ic-search'); i.value = 'abon'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await W(500);
  await p.screenshot({ path: OUT + '/ripa-new2-find-sheet.png' });
  await p.click('[data-rb="find"]'); await W(500);
  await p.click('.ic-bt-search'); await W(600);
  await p.evaluate(() => { const i = document.querySelector('#ic-rb-sheet input.ic-search'); i.value = 'зеркал'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await W(700);
  await p.screenshot({ path: OUT + '/ripa-new2-loupe-sheet.png' });
  await p.evaluate(() => document.querySelector('#ic-rb-sheet .ic-sr-a').click()); await W(1500);
  await p.screenshot({ path: OUT + '/ripa-new2-article-hl.png' });
  await open('#/iconologie/p1-5'); await p.screenshot({ path: OUT + '/ripa-new2-article-top.png' });
  await p.evaluate(() => document.querySelector('.ic-fig').click()); await W(900); await p.screenshot({ path: OUT + '/ripa-new2-viewer.png' });
  await p.click('.ic-svx-back'); await W(500);
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await W(600); await p.screenshot({ path: OUT + '/ripa-new2-article-bottom.png' });
  await open('#/iconologie/plates'); await W(1500); await p.screenshot({ path: OUT + '/ripa-new2-plates.png' });
  for (const L of ['en', 'fr']) { await open('#/iconologie', L); await p.screenshot({ path: OUT + '/ripa-new2-list-' + L + '.png' }); await open('#/iconologie/p2-123', L); await p.screenshot({ path: OUT + '/ripa-new2-article-' + L + '.png' }); }
  console.log('errs', errs); await br.close();
})();
