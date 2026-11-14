/* Скриншоты и замеры нового вида Рипы (?new): node shots_ripa.js */
const { webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8950/index.html'; const OUT = path.join(__dirname, 'out');
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => { if (!/access control|Load failed/.test(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !/access control|Load failed/.test(m.text())) errs.push(m.text()); });
  const W = ms => p.waitForTimeout(ms);
  const open = async (h, l = 'ru') => { await p.goto(BASE + '?new' + h); await p.evaluate(l => localStorage.setItem('ic-lang', l), l); await p.reload(); await W(1200); };
  const metrics = async name => console.log(name, JSON.stringify(await p.evaluate(() => {
    const sw = document.documentElement.scrollWidth, iw = innerWidth;
    const small = [...document.querySelectorAll('.ic-rbar button, .ic-booktabs a, .ic-booktabs button, .ic-lang-b, .ic-row-item, .ic-rp-nb, .ic-gal-item, .ic-rbar-lbl')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.height < 43.5) && getComputedStyle(e).display !== 'none'; }).map(e => e.className + ':' + Math.round(e.getBoundingClientRect().height)).slice(0, 6);
    const bar = document.querySelector('.ic-rbar'); const rr = bar && bar.getBoundingClientRect();
    return { hscroll: sw > iw, small, rbarH: rr && Math.round(rr.height), rbarW: rr && Math.round(rr.width), stackH: Math.round(document.getElementById('ic-stack').getBoundingClientRect().height) };
  })));
  await open('#/iconologie'); await metrics('list'); await p.screenshot({ path: OUT + '/ripa-new-list.png' });
  await p.evaluate(() => scrollTo(0, 1200)); await W(500); await p.screenshot({ path: OUT + '/ripa-new-list-scrolled.png' });
  await open('#/iconologie/plates'); await metrics('plates'); await W(800); await p.screenshot({ path: OUT + '/ripa-new-plates.png' });
  await open('#/iconologie/about'); await metrics('about'); await p.screenshot({ path: OUT + '/ripa-new-about.png' });
  await open('#/iconologie/p1-5'); await W(800); await metrics('article'); await p.screenshot({ path: OUT + '/ripa-new-article-top.png' });
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await W(800); await p.screenshot({ path: OUT + '/ripa-new-article-bottom.png' });
  // шторки
  await open('#/iconologie'); await p.click('[data-rb="find"]'); await W(700); await p.screenshot({ path: OUT + '/ripa-new-find-sheet.png' });
  await p.click('[data-rb="find"]'); await W(500); await p.click('.ic-bt-search'); await W(700);
  await p.evaluate(() => { const i = document.querySelector('#ic-rb-sheet input.ic-search'); i.value = 'зеркал'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await W(700);
  await p.screenshot({ path: OUT + '/ripa-new-loupe-sheet.png' });
  // результат лупы -> статья с подсветкой
  await p.evaluate(() => document.querySelector('#ic-rb-sheet .ic-sr-a').click()); await W(1200);
  console.log('after loupe', JSON.stringify(await p.evaluate(() => ({ hash: location.hash, mark: !!document.querySelector('.ic-ch-mark'), markTop: document.querySelector('.ic-ch-mark') && Math.round(document.querySelector('.ic-ch-mark').getBoundingClientRect().top), y: scrollY }))));
  // EN/FR метрики
  for (const L of ['en', 'fr']) { await open('#/iconologie', L); await metrics('list ' + L); await open('#/iconologie/p1-5', L); await metrics('article ' + L); }
  console.log('errs', errs);
  await br.close();
})();
