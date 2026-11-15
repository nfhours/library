/* Просмотр «Транскрипция» (итальянский текст страниц) в EN/FR: служебные маркеры [ГРАВЮРА…]/[ВИНЬЕТКА…]/[знак] и «с.» не должны показываться по-русски.
 * Запуск: BASE=http://localhost:8975/index.html node check_transcription_lang.js */
const { webkit, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8975/index.html';
const CH = (process.env.CHAPTERS || 'saturno,venere,annotationi-pignoria,aggionta').split(',');
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await webkit.launch(), ctx = await br.newContext({ ...devices['iPhone 13'] }), p = await ctx.newPage(), errs = []; let bad = 0;
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
  for (const L of ['en', 'fr', 'ru']) for (const c of CH) {
    await p.goto(BASE + '#/cartari/ch/' + c); await p.evaluate(l => { localStorage.setItem('ic-lang', l); sessionStorage.clear(); }, L); await p.reload(); await W(3500);
    try { await p.click('[data-rb="scan"]', { timeout: 3000 }); await W(1200); await p.click('.ic-svx-sw [data-m="it"]', { timeout: 3000 }); await W(1500); } catch (e) { console.log('FAIL open viewer', L, c); bad++; continue; }
    const r = await p.evaluate(() => { const t = [...document.querySelectorAll('.ic-svx .ic-sv-it')].map(e => e.innerText).join('\n'); return { n: t.length, cyr: (t.match(/[А-Яа-яЁё]+/g) || []).slice(0, 8), mk: (t.match(/\[[a-zé ]+(:[^\]]{0,30})?\]/g) || []).slice(0, 4) }; });
    const okc = L === 'ru' ? true : r.cyr.length === 0;
    console.log((okc && r.n > 100 ? 'ok  ' : 'FAIL ') + L + ' ' + c + ' len=' + r.n + ' cyr=' + JSON.stringify(r.cyr) + ' markers=' + JSON.stringify(r.mk)); if (!okc || r.n <= 100) bad++;
  }
  console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'console clean'); await br.close(); console.log(bad ? 'FAILS ' + bad : 'ALL OK');
})();
