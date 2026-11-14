/* Снимок разметки страниц Картари (для сравнения до/после рефакторинга): node dump_dom.js <out.json>; BASE=... */
const { webkit, devices } = require('playwright'); const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8950/index.html';
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const out = {};
  await p.goto(BASE + '#/cartari/text'); await p.waitForTimeout(1500);
  const chs = await p.$$eval('a[href*="/ch/"]', as => [...new Set(as.map(a => a.getAttribute('href')))].slice(0, 3));
  const hashes = ['#/cartari', '#/cartari/text', '#/cartari/plates', '#/cartari/search', '#/cartari/index', '#/cartari/names', '#/cartari/plate/1', '#/', ...chs];
  for (const L of ['ru', 'en']) for (const h of hashes) {
    await p.goto(BASE + h); await p.evaluate(l => localStorage.setItem('ic-lang', l), L); await p.reload(); await p.waitForTimeout(1800);
    out[L + ' ' + h] = await p.evaluate(() => document.getElementById('iconologie').innerHTML.replace(/style="[^"]*"/g, ''));
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await br.close(); console.log(Object.keys(out).length, chs);
})();
