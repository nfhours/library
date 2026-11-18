/* Схема «шапка уезжает нативно» (HANDOFF, раздел 10) — ТОЛЬКО страница эмблемы Альчато (одно- и двухстраничная): «Библиотека» и меню книги — часть страницы,
 * строка раздела sticky top:0, html тёмный постоянно (кроме 400 мс при повороте), бумага с фактурой на корне; ширины 1180×820, 1366×1024, 820×1180, 390×844
 * (полосы шапки — на весь экран, содержимое по центру), прокрутка вниз/вверх (меню не выезжает), фактура совпадает с остальными страницами.
 * Скриншоты out/wide-<стр>-<размер>.png (в чат не читать). BASE=http://localhost:8975/index.html node check_flow_pages.js */
const { webkit } = require('playwright'); const path=require('path'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; if(!c||process.env.V) console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
const PAGES=[['alc-card','#/alciato/alc15'],['alc-card-2','#/alciato/alc128']];   // схема только на странице эмблемы Альчато (одно- и двухстраничная)
const SIZES=[[1180,820],[1366,1024],[820,1180],[390,844]];
const geo=()=>({ f:`(()=>{ const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.width)];}, se=document.scrollingElement, rb=document.querySelector('.ic-rbar'), T=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().bottom):null;};
  return {flow:document.documentElement.classList.contains('ic-flow-page'),html:getComputedStyle(document.documentElement).backgroundColor,bb:r('.back-bar'),bt:r('#ic-booktabs'),rb:r('.ic-rbar'),row:r('.ic-rbar-row'),wrap:r('.ic-wrap'),sw:se.scrollWidth,cw:se.clientWidth,sh:se.scrollHeight,
   pos:[getComputedStyle(document.querySelector('.back-bar')).position,document.getElementById('ic-booktabs')?getComputedStyle(document.getElementById('ic-booktabs')).position:'-',rb?getComputedStyle(rb).position:'-'].join('/')}; })()` });
(async()=>{ const br=await webkit.launch(); const errs=[];
 for(const [w,h] of SIZES){ const ctx=await br.newContext({viewport:{width:w,height:h}}), p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled|503|404/i.test(m.text())) errs.push(m.text()); });
  for(const [nm,hash] of PAGES){
   await p.goto(BASE+hash); await W(2500);
   const g=await p.evaluate(geo().f.slice(0));
   const tag=nm+' @'+w;
   ok(tag+': схема включена, html тёмный',g.flow&&g.html==='rgb(22, 19, 15)',JSON.stringify([g.flow,g.html]));
   ok(tag+': «Библиотека» — на весь экран, не sticky',g.bb[0]===0&&g.bb[1]===w&&g.pos.split('/')[0]==='relative',JSON.stringify([g.bb,g.pos]));
   if(g.bt) ok(tag+': меню книги — на весь экран, не sticky',g.bt[0]===0&&g.bt[1]===w&&g.pos.split('/')[1]==='relative',JSON.stringify([g.bt,g.pos]));
   if(g.rb) ok(tag+': строка раздела — sticky, на весь экран, капсула по центру ≤ 1060',g.rb[0]===0&&g.rb[1]===w&&g.pos.split('/')[2]==='sticky'&&(!g.row||(Math.abs((g.row[0]*2+g.row[1])-w)<=2&&g.row[1]<=1060)),JSON.stringify([g.rb,g.row,g.pos]));
   ok(tag+': нет горизонтальной прокрутки',g.sw<=g.cw,JSON.stringify([g.sw,g.cw]));
   if(g.wrap) ok(tag+': колонка по центру',Math.abs((g.wrap[0]*2+g.wrap[1])-w)<=2,JSON.stringify(g.wrap));
   await p.screenshot({path:path.join(__dirname,'out/wide-'+nm+'-'+w+'x'+h+'.png')});
   if((w===390||w===1180)&&g.sh>h+500){
    await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); await W(150);
    for(let i=0;i<20;i++){ await p.evaluate(()=>window.scrollBy(0,30)); await W(30); } await W(300);
    const q=`(()=>{ const r=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().bottom):null;}; const rb=document.querySelector('.ic-rbar'); return {bb:r('.back-bar'),bt:r('#ic-booktabs'),rb:rb?Math.round(rb.getBoundingClientRect().top):null,y:Math.round(scrollY)}; })()`;
    const s1=await p.evaluate(q);
    ok(tag+': вниз — «Библиотека» и меню уехали нативно, строка раздела у верха',s1.bb<=0&&(s1.bt===null||s1.bt<=0)&&(s1.rb===null||s1.rb===0),JSON.stringify(s1));
    for(const d of [-30,-60,-80]){ await p.evaluate(dd=>window.scrollBy(0,dd),d); await W(450); }
    const s2=await p.evaluate(q);
    ok(tag+': вверх — меню не выезжает, строка раздела на месте',s2.bb<=0&&(s2.bt===null||s2.bt<=0)&&(s2.rb===null||s2.rb===0),JSON.stringify(s2));
   }
  }
  await ctx.close(); }
 // ---- тёмный фон html постоянный; при повороте/смене ширины на ~400 мс бумажный ----
 { const ctx=await br.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}), p=await ctx.newPage();
  const bg=()=>p.evaluate(()=>({cls:document.documentElement.classList.contains('ic-flow-page'),html:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,y:Math.round(scrollY)}));
  const DARK=o=>o.html==='rgb(22, 19, 15)'&&o.body==='rgb(22, 19, 15)', PAPER=o=>o.html==='rgb(236, 229, 212)'&&o.body==='rgb(236, 229, 212)';
  for(const [nm,hash] of [['alc','#/alciato/alc15']]){
   await p.goto(BASE+hash); await W(2500); let o=await bg(); ok(nm+': у верха фон html и body тёмный',DARK(o)&&o.y===0,JSON.stringify(o));
   const seen=[]; await p.evaluate(()=>{ window.__bg=[]; window.addEventListener('scroll',()=>window.__bg.push(getComputedStyle(document.documentElement).backgroundColor),{passive:true}); });
   for(let i=0;i<14;i++){ await p.evaluate(()=>window.scrollBy(0,40)); await W(25); } o=await bg(); ok(nm+': после прокрутки вниз фон html остаётся тёмным',DARK(o)&&o.y>200,JSON.stringify(o));
   for(let i=0;i<14;i++){ await p.evaluate(()=>window.scrollBy(0,-40)); await W(25); } await p.evaluate(()=>window.scrollTo(0,0)); await W(200); o=await bg(); ok(nm+': после возврата наверх фон html тёмный',DARK(o)&&o.y===0,JSON.stringify(o));
   const all=await p.evaluate(()=>window.__bg); ok(nm+': во время прокрутки (все события) фон html ни разу не менялся',all.length>0&&all.every(c=>c==='rgb(22, 19, 15)'),all.length+' событий');
   await p.setViewportSize({width:430,height:844}); await W(80); o=await bg(); ok(nm+': смена ширины окна — сразу бумажный',PAPER(o),JSON.stringify(o));
   await W(600); o=await bg(); ok(nm+': через полсекунды снова тёмный',DARK(o),JSON.stringify(o));
   await p.evaluate(()=>window.scrollTo(0,300)); await W(300); await p.setViewportSize({width:390,height:844}); await W(80); o=await bg(); ok(nm+': смена ширины внизу — бумажный',PAPER(o),JSON.stringify(o));
   await W(600); o=await bg(); ok(nm+': через полсекунды внизу снова тёмный (правила верха нет)',DARK(o),JSON.stringify(o));
   await p.setViewportSize({width:390,height:760}); await W(600); o=await bg(); ok(nm+': смена только высоты (панели Safari) фон не трогает',DARK(o),JSON.stringify(o)); await p.setViewportSize({width:390,height:844});
  }
  await ctx.close(); }
 // ---- фактура бумаги: видимая страница с классом ic-flow-page и без него совпадает пиксель в пиксель; фактура = как на странице со старой логикой ----
 { const ctx=await br.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1}), p=await ctx.newPage();
  const crypto=require('crypto'); const hash=b=>crypto.createHash('md5').update(b).digest('hex');
  const shotOf=async(on)=>{ await p.evaluate(v=>{ document.documentElement.classList.toggle('ic-flow-page',v); },on); await W(150); return p.screenshot({clip:{x:0,y:110,width:1180,height:700}}); };
  for(const [nm,hs] of [['alc','#/alciato/alc15']]){
   await p.goto(BASE+hs); await W(2600); const a=await shotOf(true), b=await shotOf(false), a2=await shotOf(true);
   ok(nm+': страница с классом и без него совпадает пиксель в пиксель (бумага и фактура не меняются)',hash(a)===hash(b)&&hash(a)===hash(a2),hash(a).slice(0,8)+' / '+hash(b).slice(0,8));
   const bgi=await p.evaluate(()=>getComputedStyle(document.getElementById('iconologie')).backgroundImage); ok(nm+': корневой контейнер несёт фактуру (foxing + paper)',/foxing\.png/.test(bgi)&&/paper\.jpg/.test(bgi),bgi.slice(0,90));
  }
  // фактура = как на странице со старой логикой (список Рипы): левое поле 0..90 × 200..700, там нет текста
  const strip=async(hs,on)=>{ await p.goto(BASE+hs); await W(2600); await p.evaluate(v=>document.documentElement.classList.toggle('ic-flow-page',v),on); await W(150); return hash(await p.screenshot({clip:{x:0,y:200,width:90,height:500}})); };
  const ref=await strip('#/iconologie/list',false);
  for(const [nm,hs] of [['alc','#/alciato/alc15']]){ ok(nm+': фактура у края совпадает со списком Рипы (страница со старой логикой)',(await strip(hs,true))===ref&&(await strip(hs,false))===ref); }
  await ctx.close(); }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 await br.close(); console.log('passed '+(n-bad)+'/'+n); process.exit(bad?1:0); })();
