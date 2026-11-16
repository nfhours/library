/* Одран: обложка, «Таблицы», страница таблицы, полноэкранный просмотр; RU/EN/FR. Скриншоты — out/audran-*.png (в чат не читать).
 * BASE=http://localhost:8975/index.html node check_audran.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
const HIT=`(sel)=>[...document.querySelectorAll(sel)].map(x=>{const r=x.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const a=document.elementFromPoint(cx,cy-21),b=document.elementFromPoint(cx,cy+21);return !!(a&&b&&(x.contains(a)||a.contains(x)&&a===x.parentElement)&&(x.contains(b)||b===x.parentElement&&true))||Math.round(r.height)>=44;})`;
let bad=0; const ok=(n,c,x)=>{ if(!c) bad++; console.log((c?'ok  ':'FAIL ')+n+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(), errs=[];
 p.on('pageerror',e=>{ if(!/access control|Load failed|cancelled/i.test(e.message)) errs.push(e.message); }); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
 const setLang=async l=>{ await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},l); await p.reload(); await W(3000); };
 const T={ru:{pref:'Предисловие',tables:'Таблицы',abbr:'табл.',prev:'Предыдущая',author:'Жерар Одран',ed:'Париж, 1683'},en:{pref:'Preface',tables:'Plates',abbr:'pl.',prev:'Previous',author:'Gérard Audran',ed:'Paris, 1683'},fr:{pref:'Préface',tables:'Planches',abbr:'pl.',prev:'Précédente',author:'Gérard Audran',ed:'Paris, 1683'}};
 for(const L of ['ru','en','fr']){
  const t=T[L];
  await p.goto(BASE+'#/audran'); await setLang(L);
  const cv=await p.evaluate(()=>({kicker:(document.querySelector('.ic-kicker')||{}).textContent,h1:(document.querySelector('h1')||{}).textContent,au:(document.querySelector('.ic-home-author')||{}).textContent,ed:(document.querySelector('.ic-home-ed')||{}).textContent,tiles:[...document.querySelectorAll('.ic-home-tile b')].map(x=>x.textContent),blurb:(document.querySelector('.ic-home-blurb')||{}).textContent,hero:(document.querySelector('.ic-home-fig img')||{}).naturalWidth,tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(x=>x.textContent),loupe:!!document.querySelector('[data-rb="booksearch"]'),tapH:0}));
  ok(L+' cover: kicker italic original',cv.kicker==='Les Proportions du corps humain',cv.kicker); ok(L+' cover: author/edition',cv.au===t.author&&cv.ed===t.ed,cv.au+' | '+cv.ed);
  ok(L+' cover: two buttons «'+t.tables+'», «'+t.pref+'»',cv.tiles.length===2&&cv.tiles[0]===t.tables&&cv.tiles[1]===t.pref,JSON.stringify(cv.tiles)); ok(L+' menu: Tables · Preface, no loupe',cv.tabs.length===2&&cv.tabs[0]===t.tables&&cv.tabs[1]===t.pref&&!cv.loupe,JSON.stringify(cv.tabs));
  ok(L+' cover: hero loaded, blurb has no instructions',cv.hero>0&&cv.blurb.length>40&&!/нажм|tap|press|appuy/i.test(cv.blurb),cv.hero+' '+(cv.blurb||'').slice(0,40)); { const h=await p.evaluate(eval(HIT),'.ic-home-tile,.ic-bt-back,.ic-bt-tabs a'); ok(L+' cover: touch zone ≥44',h.every(Boolean),JSON.stringify(h)); }
  if(L!=='fr') await p.screenshot({path:path.join(OUT,'audran-cover-'+L+'.png')});
  await p.tap('.ic-home-tile:first-child'); await W(2500);
  const gr=await p.evaluate(()=>({hash:location.hash,groups:[...document.querySelectorAll('.ic-pl-h')].map(x=>x.textContent),items:document.querySelectorAll('.ic-gal-item').length,lazy:[...document.querySelectorAll('.ic-gal-item img')].every(i=>i.getAttribute('loading')==='lazy'),cap:(document.querySelector('.ic-gal-cap')||{}).textContent,h1:(document.querySelector('h1')||{}).textContent}));
  ok(L+' grid: 30 items, lazy, groups',gr.items===30&&gr.lazy&&gr.groups.length>=10,gr.items+' groups='+gr.groups.length); ok(L+' grid: caption «'+t.abbr+' N»',new RegExp(t.abbr.replace('.','\\.')+' 1$').test(gr.cap),gr.cap);
  if(L==='ru'){ await p.screenshot({path:path.join(OUT,'audran-grid-ru.png')}); }
  // scroll to a later plate, open it, back returns to place
  await p.evaluate(()=>{ const a=document.querySelector('.ic-gal-item[data-id="aud15"]'); a.scrollIntoView({block:'center'}); }); await W(800);
  const y0=await p.evaluate(()=>Math.round(window.scrollY));
  await p.tap('.ic-gal-item[data-id="aud15"]'); await W(2500);
  const cd=await p.evaluate(()=>{ const f=document.querySelector('.ic-fig img'); const r=f?f.getBoundingClientRect():{height:0,width:0}; return {hash:location.hash,h1:(document.querySelector('h1')||{}).textContent,kick:(document.querySelector('.ic-kicker')||{}).textContent,sec:(document.querySelector('.ic-rbar-lbl-b')||{}).textContent,scanBtn:!!document.querySelector('[data-rb="scan"]'),figH:Math.round(r.height),figW:Math.round(r.width),vh:window.innerHeight,vw:window.innerWidth,text:(document.querySelector('.ic-text')||{}).textContent,prev:!!document.querySelector('.ic-rbar-nv[data-nav="prev"]:not([disabled])'),next:!!document.querySelector('.ic-rbar-nv[data-nav="next"]:not([disabled])'),pager:[...document.querySelectorAll('.ic-rp-nb')].map(x=>x.textContent),tapH:0}; });
  ok(L+' card: section «… · '+t.abbr+' 15», prev/next, no scan button',cd.sec.includes(t.abbr+' 15')&&cd.prev&&cd.next&&!cd.scanBtn,cd.sec); ok(L+' card: figure ≤70% screen, wide',cd.figH<=cd.vh*0.71&&cd.figW>150,cd.figH+'/'+cd.vh+' w'+cd.figW);
  ok(L+' card: title and text; statue line hidden when equal to title',cd.h1&&cd.text&&cd.text.length>40&&!cd.kick,cd.h1+' | '+cd.kick); ok(L+' card: bottom pager 2 buttons with titles',cd.pager.length===2&&cd.pager[0].includes(t.prev),JSON.stringify(cd.pager).slice(0,100)); { const h=await p.evaluate(eval(HIT),'.ic-rbar-nv,.ic-rp-nb,.ic-rbar-lbl-b'); ok(L+' card: touch zone ≥44',h.every(Boolean),JSON.stringify(h)); }
  if(L==='ru'){ await p.screenshot({path:path.join(OUT,'audran-plate-ru.png')}); }
  // full screen
  await p.tap('.ic-fig'); await W(1500);
  const fs=await p.evaluate(()=>{ const i=document.querySelector('.ic-svx-one img'); return {open:!!i,nat:i?i.naturalWidth:0,src:i?i.src:''}; });
  ok(L+' fullscreen opens (hi-res)',fs.open&&fs.nat>=1400,fs.nat+' '+fs.src.slice(-20)); if(L==='ru'){ await p.screenshot({path:path.join(OUT,'audran-full-ru.png')}); }
  await p.tap('.ic-svx-back'); await W(800); ok(L+' fullscreen closes with back',await p.evaluate(()=>!document.querySelector('.ic-svx-one')&&/audran\/aud15/.test(location.hash)));
  // back corner returns to grid at same place
  await p.tap('.ic-bt-back'); await W(2000); const y1=await p.evaluate(()=>Math.round(window.scrollY)); const onGrid=await p.evaluate(()=>/audran\/plates/.test(location.hash)); ok(L+' back → grid, same place',onGrid&&Math.abs(y1-y0)<120,y0+'→'+y1);
  // language switch keeps place (опорный блок остаётся на месте)
  await p.tap('.ic-gal-item[data-id="aud15"]'); await W(2500); await p.evaluate(()=>window.scrollTo(0,300)); await W(500);
  const top0=await p.evaluate(()=>Math.round(document.querySelector('.ic-text').getBoundingClientRect().top)); const other=L==='ru'?'en':'ru';
  await p.evaluate(l=>{ [...document.querySelectorAll('.ic-lang-b[data-lang="'+l+'"]')].pop().click(); },other); await W(1800);
  const top1=await p.evaluate(()=>Math.round(document.querySelector('.ic-text').getBoundingClientRect().top)); ok(L+' lang switch keeps place',Math.abs(top0-top1)<60,top0+'→'+top1);
  await p.evaluate(l=>{ [...document.querySelectorAll('.ic-lang-b[data-lang="'+l+'"]')].pop().click(); },L); await W(1500);

  // Предисловие
  await p.goto(BASE+'#/audran'); await setLang(L); await p.tap('.ic-home-tile:nth-child(2)'); await W(2500);
  const pv=await p.evaluate(()=>({hash:location.hash,h2:[...document.querySelectorAll('.ic-ch-body h2')].map(x=>x.textContent),p:document.querySelectorAll('.ic-ch-body p').length,pgm:document.querySelectorAll('.ic-pgm-b').length,scan:!!document.querySelector('[data-rb="scan"]:not([disabled])'),tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(x=>x.className+':'+x.textContent),sec:(document.querySelector('.ic-rbar-lbl-b')||{}).textContent,txt:document.querySelector('.ic-ch-body').innerText.slice(0,200),cyr:/[А-Яа-я]/.test(document.querySelector('.ic-ch-body').innerText)}));
  const H3={ru:['Предисловие','Предуведомления','Выписка'],en:['Preface','Notices','Extract'],fr:['Préface','Avertissements','Extrait']}[L];
  ok(L+' preface: headings «'+H3[0]+'», «'+H3[1]+'»',pv.h2.length===3&&pv.h2[0].startsWith(H3[0])&&pv.h2[1].startsWith(H3[1])&&pv.h2[2].startsWith(H3[2]),JSON.stringify(pv.h2)); ok(L+' preface: 36 paragraphs, page marks, scan button',pv.p===36&&pv.pgm>=5&&pv.scan,pv.p+' '+pv.pgm);
  ok(L+' preface: text in interface language',L==='ru'?pv.cyr:!pv.cyr,pv.txt.slice(0,50)); ok(L+' preface: section row & active tab',/audran\/preface/.test(pv.hash)&&pv.sec.includes(t.pref)&&pv.tabs.some(x=>x.startsWith('on:'+t.pref)),pv.sec);
  if(L==='ru'){ await p.screenshot({path:path.join(OUT,'audran-preface-ru.png')}); }
  await p.tap('[data-rb="scan"]'); await W(2500);
  const sc=await p.evaluate(()=>({open:!!document.querySelector('.ic-svx'),items:document.querySelectorAll('.ic-svx-item').length,imgs:[...document.querySelectorAll('.ic-svx-fu')].map(i=>i.getAttribute('src')||'').slice(0,5)}));
  ok(L+' preface: scan ribbon opens with 5 pages',sc.open&&sc.items===5&&sc.imgs.every(x=>/scans\/00\d\d\.webp/.test(x)),sc.items+' '+sc.imgs[0]);
  await p.tap('.ic-svx-sw [data-m="it"]'); await W(1800);
  const tr=await p.evaluate(()=>{const t=[...document.querySelectorAll('.ic-svx .ic-sv-it')].map(e=>e.innerText).join('\n'); return {n:t.length,fr:/Je ne crois pas qu/.test(t),cyr:/[А-Яа-я]/.test(t),ht:[...document.querySelectorAll('.ic-svx-h')].map(x=>x.textContent)};});
  ok(L+' preface: transcription is French, no Cyrillic',tr.n>5000&&tr.fr&&!tr.cyr,tr.n+' '+JSON.stringify(tr.ht)); if(L==='ru'){ await p.screenshot({path:path.join(OUT,'audran-preface-scan-ru.png')}); }
  await p.tap('.ic-svx-back'); await W(800); ok(L+' preface: ribbon closes',await p.evaluate(()=>!document.querySelector('.ic-svx')&&/audran\/preface/.test(location.hash)));
 }
 // next/prev steps and last plate (aud30) title
 await p.goto(BASE+'#/audran/aud30'); await setLang('ru'); const t30=await p.evaluate(()=>({h1:document.querySelector('h1').textContent,next:!!document.querySelector('.ic-rbar-nv[data-nav="next"]:not([disabled])')})); ok('aud30: title by subject, no next',/голов/.test(t30.h1)&&!t30.next,t30.h1);
 ok('console clean',errs.length===0,errs.slice(0,3).join('|')); await br.close(); console.log(bad?'FAILS '+bad:'ALL OK'); })();
