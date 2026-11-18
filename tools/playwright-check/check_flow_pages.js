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
 // ---- переходы со страниц со старой логикой скрытия на страницы с новой схемой и обратно (iPhone 390) ----
 { const ctx=await br.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}), p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
  const st=()=>p.evaluate(()=>{ const s=document.getElementById('ic-stack'),bb=document.querySelector('.back-bar'),bt=document.getElementById('ic-booktabs'),rb=document.querySelector('.ic-rbar'),T=e=>e?Math.round(e.getBoundingClientRect().top):null;
    return {y:Math.round(scrollY),flow:document.documentElement.classList.contains('ic-flow-page'),stack:s?s.className:null,stackStyle:s?s.getAttribute('style'):null,bbCls:bb.className,bbStyle:bb.getAttribute('style'),btCls:bt?bt.className:null,rbCls:rb?rb.className:null,bb:T(bb),bt:T(bt),rb:T(rb)}; });
  const clean=o=>!/hidden|snap/.test((o.stack||'')+(o.bbCls||'')+(o.btCls||'')+(o.rbCls||''))&&!o.stackStyle&&!o.bbStyle;
  const placed=(o,hasBar)=>o.y===0&&o.bb===0&&o.bt===52&&(!hasBar||o.rb===99);
  const down=async n=>{ await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); for(let i=0;i<n;i++){ await p.evaluate(()=>window.scrollBy(0,30)); await W(30);} await W(600); };
  const toList=async()=>{ await p.goto(BASE+'#/iconologie/list'); await W(2500); await down(40); const o=await p.evaluate(()=>document.getElementById('ic-stack').className); ok('список Рипы: старая логика спрятала шапку (ic-stack-hidden)',/ic-stack-hidden/.test(o),o); };
  // 1. список → карточка (тап)
  await toList(); await p.tap('.ic-row-item'); await W(2500); let o=await st(); ok('список → карточка: шапка, меню и строка раздела на местах, следов скрытия нет',o.flow&&clean(o)&&placed(o,true),JSON.stringify(o));
  // 2. список → карточка через поиск
  await toList(); await p.tap('[data-rb="booksearch"]').catch(()=>{}); await W(600); await p.fill('#ic-rb-sheet input.ic-search','любовь'); await W(900); await p.tap('#ic-rb-sheet .ic-sr-a'); await W(2800); o=await st(); ok('список → карточка через поиск: на местах, следов нет',o.flow&&/iconologie\/p/.test(await p.evaluate(()=>location.hash))&&clean(o)&&placed(o,true),JSON.stringify(o));
  // 3. карточка → «След.» / «Пред.» после прокрутки
  await down(15); await p.tap('[data-nav="next"]'); await W(2500); o=await st(); ok('карточка → «След.»: на местах, следов нет',clean(o)&&placed(o,true),JSON.stringify(o));
  await down(15); await p.tap('[data-nav="prev"]'); await W(2500); o=await st(); ok('карточка → «Пред.»: на местах, следов нет',clean(o)&&placed(o,true),JSON.stringify(o));
  // 4. подсунуть следы старого скрытия и войти на каждую из страниц с новой схемой
  for(const [nm,hash,hasBar] of PAGES){
   await p.goto(BASE+'#/iconologie/list'); await W(2000);
   await p.evaluate(()=>{ const bb=document.querySelector('.back-bar'); bb.classList.add('ic-bb-hidden'); bb.style.transform='translateY(-100%)'; bb.style.opacity='0'; const s=document.getElementById('ic-stack'); s.classList.add('ic-stack-hidden'); s.style.setProperty('--ic-stack-hide','99px'); });
   await p.evaluate(h=>{ location.hash=h.slice(1); },hash); await W(2800); o=await st(); ok('следы старого скрытия сняты при входе на '+nm,o.flow&&clean(o)&&placed(o,hasBar)&&!/ic-bb-hidden/.test(o.bbCls),JSON.stringify(o));
   // и обратно на страницу со старой логикой: схема снята, шапка прячется как раньше
   await p.evaluate(()=>{ location.hash='#/iconologie/list'; }); await W(2500); const t=await st(); ok('обратно на список после '+nm+': схема снята, шапка на месте',!t.flow&&clean(t)&&t.bb===0,JSON.stringify(t)); await down(40); const hid=await p.evaluate(()=>/ic-stack-hidden/.test(document.getElementById('ic-stack').className)); ok('список после '+nm+': старая логика снова прячет шапку',hid);
  }
  await ctx.close(); }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 await br.close(); console.log('passed '+(n-bad)+'/'+n); process.exit(bad?1:0); })();
