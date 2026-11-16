/* Главная библиотеки: строки, «в работе», тап, прямые ссылки; скрины обложки Картари. BASE=http://localhost:8975/index.html node check_libhome.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(), errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
 for(const lang of ['ru','en','fr']){
  await p.goto(BASE+'#/'); await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},lang); await p.reload(); await W(2500);
  const r=await p.evaluate(()=>({h1:document.querySelectorAll('h1').length, rows:[...document.querySelectorAll('.ic-lib-row')].map(r=>({s:r.dataset.slug,wip:r.classList.contains('ic-lib-wip'),h:r.getBoundingClientRect().height,desc:!!r.querySelector('.ic-lib-desc'),tag:!!r.querySelector('.ic-lib-tag'),tw:r.querySelector('img').getBoundingClientRect().width,th:r.querySelector('img').getBoundingClientRect().height,loaded:r.querySelector('img').naturalWidth,more:!!document.querySelector('.ic-book-more')})), sect:(document.querySelector('.ic-lib-sect')||{}).textContent, sub:(document.querySelector('.ic-lib-sub')||{}).textContent}));
  ok(lang+' no second h1',r.h1===0,'h1='+r.h1); ok(lang+' order',r.rows.map(x=>x.s).join()==='cartari,iconologie,audran,alciato,verrien,grosson');
  ok(lang+' ready rows have desc, wip have tag, no desc',r.rows.every(x=>x.wip?(x.tag&&!x.desc):(x.desc&&!x.tag)));
  ok(lang+' thumbs ≤84×110 and loaded',r.rows.every(x=>x.tw<=84.5&&x.th<=110.5&&x.loaded>0), JSON.stringify(r.rows.map(x=>[Math.round(x.tw),Math.round(x.th)])));
  const AU={ru:['Винченцо Картари','Чезаре Рипа','Жерар Одран','Андреа Альчато','Николя Верриен','Жан-Батист-Бернар Гроссон'],en:['Vincenzo Cartari','Cesare Ripa','Gérard Audran','Andrea Alciato','Nicolas Verrien','Jean-Baptiste-Bernard Grosson'],fr:['Vincenzo Cartari','Cesare Ripa','Gérard Audran','André Alciat','Nicolas Verrien','Jean-Baptiste-Bernard Grosson']}[lang];
  const tx=await p.evaluate(()=>[...document.querySelectorAll('.ic-lib-row')].map(r=>({a:r.querySelector('.ic-lib-author').textContent,t:r.querySelector('.ic-lib-title').textContent,pad:getComputedStyle(r).paddingTop+'/'+getComputedStyle(r).paddingBottom,fs:[getComputedStyle(r.querySelector('.ic-lib-title')).fontSize,getComputedStyle(r.querySelector('.ic-lib-place')).fontSize,(r.querySelector('.ic-lib-desc')?getComputedStyle(r.querySelector('.ic-lib-desc')).fontSize:'')]})));
  ok(lang+' authors',JSON.stringify(tx.map(x=>x.a))===JSON.stringify(AU),tx.map(x=>x.a).join(' | '));
  ok(lang+' padding 14/14 and sizes 22/15/15',tx.every(x=>x.pad==='14px/14px'&&x.fs[0]==='22px'&&x.fs[1]==='15px'&&(!x.fs[2]||x.fs[2]==='15px')),JSON.stringify(tx[0]));
  ok(lang+' short wip titles',tx.slice(3).every(x=>x.t.length<=32),tx.slice(3).map(x=>x.t).join(' | '));
  ok(lang+' rows ≥44px',r.rows.every(x=>x.h>=44)); ok(lang+' section',!!r.sect,r.sect); ok(lang+' no «+ Подробнее»',!r.rows[0].more);
 }
 await p.goto(BASE+'#/'); await W(1500);
 await p.tap('.ic-lib-row[data-slug="iconologie"]'); await W(2500); ok('tap row opens Ripa cover',/#\/iconologie/.test(await p.evaluate(()=>location.hash)),await p.evaluate(()=>location.hash));
 await p.goto(BASE+'#/'); await W(1500); await p.tap('.ic-lib-row[data-slug="cartari"]'); await W(3500); const h=await p.evaluate(()=>location.hash); ok('tap row opens Cartari cover',/#\/cartari/.test(h),h);
 await p.evaluate(()=>{localStorage.setItem('ic-lang','ru')}); await p.reload(); await W(3000); await p.screenshot({path:path.join(OUT,'home-cartari-cover.png')});
 await p.goto(BASE+'#/'); await W(1500); const hb=await p.evaluate(()=>location.hash); await p.tap('.ic-lib-row[data-slug="alciato"]'); await W(800); ok('wip row not clickable',(await p.evaluate(()=>location.hash))===hb);
 for(const s of ['alciato','verrien','grosson']){ await p.goto(BASE+'#/'+s); await W(3000); ok('direct link '+s,(await p.evaluate(()=>document.querySelectorAll('.ic-row-item, .ic-plate-row, .ic-row, .ic-list *').length))>0, await p.evaluate(()=>location.hash)); }
 ok('console clean',errs.length===0,errs.slice(0,3).join('|')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); })();
