/* Скриншоты четвёртого захода Рипы: ripa-new4-*.png */
const { webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8950/index.html'; const OUT = path.join(__dirname, 'out');
(async () => {
  const br = await webkit.launch(); const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; const bn = t => /access control|Load failed/.test(t);
  p.on('pageerror', e => { if (!bn(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !bn(m.text())) errs.push(m.text()); });
  const W = ms => p.waitForTimeout(ms);
  const open = async (h, l = 'ru') => { await p.goto(BASE + h); await p.evaluate(l => { localStorage.setItem('ic-lang', l); sessionStorage.clear(); }, l); await p.reload(); await W(1800); };
  const shot = n => p.screenshot({ path: OUT + '/ripa-new4-' + n + '.png' });
  await open('#/iconologie/list'); await shot('list');
  await p.click('[data-rb="find"]'); await W(400); await p.locator('.ic-rp-findbar input.ic-search').pressSequentially('лав', { delay: 40 }); await W(500); await shot('find-typing');
  await p.keyboard.press('Enter'); await W(400); await shot('find-applied');
  await open('#/iconologie/list'); await p.click('.ic-bt-search'); await W(500); await p.fill('#ic-rb-sheet input.ic-search', 'зеркал'); await W(900); await shot('loupe');
  await open('#/cartari/names'); await p.click('.ic-bt-search'); await W(600); await p.fill('#ic-rb-sheet input.ic-search', 'аполлон'); await W(1500); await shot('cartari-loupe');
  for (const L of ['en', 'fr']) { await open('#/iconologie/list', L); await shot('list-' + L); }
  console.log('errs', errs); await br.close();
})();
