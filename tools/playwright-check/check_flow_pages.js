/* Схема «шапка уезжает нативно» (HANDOFF, раздел 10) на карточках Рипы, гравюрах Рипы, «Тексте»/«Гравюрах» книг и на странице эмблемы Альчато,
 * плюс ширина полос шапки на 1180×820, 1366×1024, 820×1180 и 390×844 (полосы — на весь экран, содержимое по центру).
 * Скриншоты out/wide-<стр>-<размер>.png (в чат не читать). BASE=http://localhost:8975/index.html node check_flow_pages.js */
const { webkit } = require('playwright'); const path=require('path'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; if(!c||process.env.V) console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
const PAGES=[['alc','#/alciato/alc15',true],['ripa-card','#/iconologie/p1-1',true],['ripa-plates','#/iconologie/plates',false],['cart-plates','#/cartari/plates',false],['cart-text','#/cartari/text',false]];
const SIZES=[[1180,820],[1366,1024],[820,1180],[390,844]];
(async()=>{ const br=await webkit.launch(); const errs=[];
 for(const [w,h] of SIZES){ const ctx=await br.newContext({viewport:{width:w,height:h}}), p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
  for(const [nm,hash,hasBar] of PAGES){
   await p.goto(BASE+hash); await W(2500);
   const g=await p.evaluate(()=>{ const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.width)];}, se=document.scrollingElement;
     return {flow:document.documentElement.classList.contains('ic-flow-page'),html:getComputedStyle(document.documentElement).backgroundColor,bb:r('.back-bar'),bt:r('#ic-booktabs'),rb:r('.ic-rbar'),row:r('.ic-rbar-row'),wrap:r('.ic-wrap'),sw:se.scrollWidth,cw:se.clientWidth}; });
   const tag=nm+' @'+w;
   ok(tag+': схема включена, html тёмный',g.flow&&g.html==='rgb(22, 19, 15)',JSON.stringify([g.flow,g.html]));
   ok(tag+': «Библиотека» и меню книги — на весь экран',g.bb[0]===0&&g.bb[1]===w&&g.bt[0]===0&&g.bt[1]===w,JSON.stringify([g.bb,g.bt]));
   if(hasBar) ok(tag+': строка раздела — на весь экран, капсула по центру ≤ 1060',g.rb[0]===0&&g.rb[1]===w&&Math.abs((g.row[0]*2+g.row[1])-w)<=2&&g.row[1]<=1060,JSON.stringify([g.rb,g.row]));
   ok(tag+': колонка по центру, нет горизонтальной прокрутки',Math.abs((g.wrap[0]*2+g.wrap[1])-w)<=2&&g.sw<=g.cw,JSON.stringify([g.wrap,g.sw,g.cw]));
   await p.screenshot({path:path.join(__dirname,'out/wide-'+nm+'-'+w+'x'+h+'.png')});
   if(w===390||w===1180){
    await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); await W(150);
    for(let i=0;i<20;i++){ await p.evaluate(()=>window.scrollBy(0,30)); await W(30); } await W(300);
    const s1=await p.evaluate(()=>{ const r=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().bottom):null;}; const rb=document.querySelector('.ic-rbar'); return {bb:r('.back-bar'),bt:r('#ic-booktabs'),rb:rb?Math.round(rb.getBoundingClientRect().top):null,y:Math.round(scrollY)}; });
    ok(tag+': вниз — «Библиотека» и меню уехали нативно, строка раздела у верха',s1.bb<=0&&s1.bt<=0&&(s1.rb===null||s1.rb===0),JSON.stringify(s1));
    for(const d of [-30,-60,-80]){ await p.evaluate(dd=>window.scrollBy(0,dd),d); await W(450); }
    const s2=await p.evaluate(()=>{ const r=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().bottom):null;}; const rb=document.querySelector('.ic-rbar'); return {bb:r('.back-bar'),bt:r('#ic-booktabs'),rb:rb?Math.round(rb.getBoundingClientRect().top):null,y:Math.round(scrollY)}; });
    ok(tag+': вверх — меню не выезжает, строка раздела на месте',s2.bb<=0&&s2.bt<=0&&(s2.rb===null||s2.rb===0),JSON.stringify(s2));
   }
  }
  // уход на другие страницы: схема снята, фон прежний, полосы на весь экран
  for(const hh of ['#/iconologie/list','#/iconologie','#/cartari','#/cartari/index']){ await p.goto(BASE+hh); await W(1800);
   const o=await p.evaluate(()=>{ const b=document.querySelector('.ic-booktabs'),rb=document.querySelector('.ic-rbar'),se=document.scrollingElement; return {flow:document.documentElement.classList.contains('ic-flow-page'),html:getComputedStyle(document.documentElement).backgroundColor,bt:b?Math.round(b.getBoundingClientRect().width):null,rb:rb?Math.round(rb.getBoundingClientRect().width):null,sw:se.scrollWidth,cw:se.clientWidth}; });
   ok('уход на '+hh+' @'+w+': схема снята, фон прежний, полосы на весь экран, без горизонтальной прокрутки',!o.flow&&o.html==='rgb(236, 229, 212)'&&(o.bt===null||o.bt===w)&&(o.rb===null||o.rb===w)&&o.sw<=o.cw,JSON.stringify(o)); }
  await ctx.close(); }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 await br.close(); console.log('passed '+(n-bad)+'/'+n); process.exit(bad?1:0); })();
