/* Сравнение поведения шапки на страницах со старой логикой: рабочая копия (BASE_NEW) и эталон v232 (BASE_OLD) — вверху, после прокрутки вниз, после небольшой прокрутки вверх,
 * на 390×844 и 1180×820: попиксельно (хэш скриншота) и по геометрии (положение «Библиотеки», меню, строки раздела). На 1180 ширина строки раздела отличается намеренно (v233).
 * BASE_NEW=http://localhost:8975/index.html BASE_OLD=http://localhost:8976/index.html node cmp_v232.js */
const { webkit } = require('playwright'); const crypto=require('crypto'); const path=require('path');
const NEW=process.env.BASE_NEW||'http://localhost:8975/index.html', OLD=process.env.BASE_OLD||'http://localhost:8976/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
const PAGES=[['ripa-card','#/iconologie/p1-1'],['ripa-plates','#/iconologie/plates'],['ripa-home','#/iconologie'],['ripa-list','#/iconologie/list'],
 ['cart-text','#/cartari/text'],['cart-plates','#/cartari/plates'],['cart-chapter','#/cartari/ch/frontespizio-dedica'],['cart-index','#/cartari/index'],['cart-names','#/cartari/names'],['cart-search','#/cartari/search'],['cart-home','#/cartari'],
 ['aud-preface','#/audran/preface'],['aud-plates','#/audran/plates'],['library-home','#/']];
const SIZES=[[390,844],[1180,820]];
const geo=`(()=>{ const T=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.top),Math.round(b.height)];}, W=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().width):null;};
 const st=document.getElementById('ic-stack'); return {y:Math.round(scrollY),bb:T('.back-bar'),bt:T('#ic-booktabs'),rb:T('.ic-rbar'),stack:st?st.className:null,bbc:document.querySelector('.back-bar').className,html:getComputedStyle(document.documentElement).backgroundColor,bodyBg:getComputedStyle(document.body).backgroundColor,wrapW:W('.ic-wrap')}; })()`;
const run=async(br,base,w,h,hash)=>{ const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<600,deviceScaleFactor:1}), p=await ctx.newPage(); const out={};
  await p.goto(base+hash); await W(3000);
  const snap=async k=>{ await W(900); out[k]={g:await p.evaluate(geo),h:crypto.createHash('md5').update(await p.screenshot()).digest('hex')}; };
  await snap('top');
  await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); await W(150);
  const sh=await p.evaluate(()=>document.scrollingElement.scrollHeight);
  if(sh>h+700){ for(let i=0;i<24;i++){ await p.evaluate(()=>window.scrollBy(0,30)); await W(30); } await snap('down');
    for(let i=0;i<4;i++){ await p.evaluate(()=>window.scrollBy(0,-20)); await W(30); } await snap('up-small'); }
  await ctx.close(); return out; };
(async()=>{ const br=await webkit.launch(); let diffs=0, total=0; const lines=[];
 for(const [w,h] of SIZES) for(const [nm,hash] of PAGES){
  const a=await run(br,OLD,w,h,hash), b=await run(br,NEW,w,h,hash);
  for(const k of Object.keys(a)){ total++; const ga=a[k].g, gb=b[k]&&b[k].g; const same=b[k]&&a[k].h===b[k].h;
   const sg=JSON.stringify(Object.assign({},ga,{wrapW:0}))===JSON.stringify(Object.assign({},gb||{},{wrapW:0}));
   if(!same){ diffs++; lines.push((w+' '+nm+' '+k+': пиксели '+(same?'=':'≠')+', геометрия '+(sg?'=':'≠'))+(sg?'':'\n    v232 '+JSON.stringify(ga)+'\n    new  '+JSON.stringify(gb))); } }
 }
 await br.close(); console.log(lines.join('\n')); console.log('состояний: '+total+', отличаются попиксельно: '+diffs); })();
