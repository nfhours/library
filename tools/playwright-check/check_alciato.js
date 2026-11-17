/* Альчато: обложка, «Эмблемы» (разделы, «Найти эмблему», «Раздел»), «Гравюры», страница эмблемы (двухстраничная, вступление),
 * полноэкранный просмотр, лупа, возврат на место; RU/EN/FR. Скриншоты — out/alciato-*.png (в чат не читать).
 * BASE=http://localhost:8975/index.html node check_alciato.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
const HIT=`(sel)=>[...document.querySelectorAll(sel)].map(x=>{const r=x.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const a=document.elementFromPoint(cx,cy-21),b=document.elementFromPoint(cx,cy+21);return !!(a&&b&&(x.contains(a)||a.contains(x)&&a===x.parentElement)&&(x.contains(b)||b===x.parentElement&&true))||Math.round(r.height)>=44;})`;
let bad=0, n=0; const ok=(name,c,x)=>{ n++; if(!c) bad++; console.log((c?'ok  ':'FAIL ')+name+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(), errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
 const setLang=async l=>{ await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},l); await p.reload(); await W(3000); };
 const T={ru:{emb:'Эмблемы',gal:'Гравюры',title:'Эмблемы',author:'Андреа Альчато',ed:'Лион, 1551',find:'Найти эмблему',sec:'Раздел',intro:'Вступление',first:'Бог, или Религия',last:'Деревья',pg:'с.',tr:'Перевод',orig:'Оригинал',prev:'Предыдущая',q:'Ганимед'},
          en:{emb:'Emblems',gal:'Engravings',title:'Emblems',author:'Andrea Alciato',ed:'Lyon, 1551',find:'Find emblem',sec:'Section',intro:'Introduction',first:'God, or Religion',last:'Trees',pg:'p.',tr:'Translation',orig:'Original',prev:'Previous',q:'Ganymede'},
          fr:{emb:'Emblèmes',gal:'Gravures',title:'Emblèmes',author:'André Alciat',ed:'Lyon, 1551',find:'Chercher un emblème',sec:'Section',intro:'Introduction',first:'Dieu, ou la Religion',last:'Arbres',pg:'p.',tr:'Traduction',orig:'Original',prev:'Précédente',q:'Ganymède'}};
 for(const L of ['ru','en','fr']){
  const t=T[L];
  // 1. обложка
  await p.goto(BASE+'#/alciato'); await setLang(L);
  const cv=await p.evaluate(()=>{ const k=document.querySelector('.ic-home-txt .ic-kicker'); return {kicker:k&&k.textContent,kit:k&&getComputedStyle(k).fontStyle,h1:(document.querySelector('.ic-title')||{}).textContent,au:(document.querySelector('.ic-home-author')||{}).textContent,ed:(document.querySelector('.ic-home-ed')||{}).textContent,tiles:[...document.querySelectorAll('.ic-home-tile b')].map(x=>x.textContent),blurb:(document.querySelector('.ic-home-blurb')||{}).textContent||'',hero:(document.querySelector('.ic-home-fig img')||{}).naturalWidth,heroSrc:(document.querySelector('.ic-home-fig img')||{}).src||'',tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(x=>x.textContent),loupe:!!document.querySelector('[data-rb="booksearch"]')}; });
  ok(L+' cover: «Emblemata» italic, title, author, edition',cv.kicker==='Emblemata'&&cv.kit==='italic'&&cv.h1===t.title&&cv.au===t.author&&cv.ed===t.ed,[cv.kicker,cv.kit,cv.h1,cv.au,cv.ed].join(' | '));
  ok(L+' cover: title page from nfhours/alciato loaded',cv.hero>0&&/nfhours\.github\.io\/alciato\/plates\/fm0007\.webp/.test(cv.heroSrc),cv.heroSrc);
  ok(L+' cover: buttons «'+t.emb+'», «'+t.gal+'»; blurb',cv.tiles.join()===[t.emb,t.gal].join()&&cv.blurb.length>80&&!/нажм|click|cliquez/i.test(cv.blurb),JSON.stringify(cv.tiles));
  ok(L+' menu: back, «'+t.emb+' · '+t.gal+'», loupe',cv.tabs.join()===[t.emb,t.gal].join()&&cv.loupe&&!!(await p.$('.ic-bt-back')),JSON.stringify(cv.tabs));
  { const h=await p.evaluate(eval(HIT),'.ic-home-tile,.ic-bt-back,.ic-bt-tabs a,.ic-bt-search'); ok(L+' cover: touch zones ≥44',h.every(Boolean),JSON.stringify(h)); }
  await p.screenshot({path:path.join(OUT,'alciato-cover-'+L+'.png')});
  // 2. «Эмблемы»
  await p.tap('.ic-home-tile:first-child'); await W(2500);
  const ls=await p.evaluate(()=>{ const secs=[...document.querySelectorAll('.ic-rp-list .ic-rp-sec')]; const rows=[...document.querySelectorAll('.ic-alc-row')];
    const r=document.querySelector('.ic-alc-row[data-id="alc10"]');
    return {hash:location.hash,secs:secs.map(s=>s.querySelector('.ic-gcap').textContent),rows:rows.length,intro:secs[0]?[...secs[0].querySelectorAll('.ic-alc-row')].map(x=>x.dataset.id):[],
      r:r&&{t:r.querySelector('.ic-tv-ru').textContent,la:(r.querySelector('.ic-alc-rla')||{}).textContent,laIt:r.querySelector('.ic-alc-rla')&&getComputedStyle(r.querySelector('.ic-alc-rla')).fontStyle,pg:r.querySelector('.ic-rp-pg').textContent,th:(r.querySelector('.ic-alc-th img')||{}).getAttribute&&r.querySelector('.ic-alc-th img').getAttribute('src')},
      nm:(()=>{ const x=document.querySelector('.ic-alc-row[data-id="alc55"]'); return x&&{t:x.querySelector('.ic-tv-ru').textContent,la:!!x.querySelector('.ic-alc-rla')}; })(),
      two:(document.querySelector('.ic-alc-row[data-id="alc31"] .ic-rp-pg')||{}).textContent,
      find:(document.querySelector('.ic-rbar-findin')||{}).placeholder,secb:(document.querySelector('[data-rb="sec"]')||{}).textContent,tabOn:(document.querySelector('.ic-bt-tabs a.on')||{}).textContent}; });
  ok(L+' list: 35 sections, first «'+t.intro+'» (3 intros), then «'+t.first+'», last «'+t.last+'»',ls.secs.length===35&&ls.secs[0]===t.intro&&ls.intro.join()==='intro-1,intro-2,intro-3'&&ls.secs[1]===t.first&&ls.secs[34]===t.last,ls.secs.length+' '+ls.secs.slice(0,2).join('|'));
  ok(L+' list: 211 rows, active tab',ls.rows===211&&ls.tabOn===t.emb,ls.rows+' '+ls.tabOn);
  ok(L+' list row: thumb (engraving only), motto, Latin italic, page',ls.r&&/thumb\/alc10_t\.webp/.test(ls.r.th)&&ls.r.t.length>5&&ls.r.la==='In Deo lætandum'&&ls.r.laIt==='italic'&&ls.r.pg==='10',JSON.stringify(ls.r));
  ok(L+' list: no motto → section name; two-page page range',ls.nm&&ls.nm.t===({ru:'Целомудрие',en:'Chastity',fr:'Chasteté'}[L])&&!ls.nm.la&&ls.two==='31–32',JSON.stringify(ls.nm)+' '+ls.two);
  ok(L+' list: section row «'+t.find+' | '+t.sec+'»',ls.find===t.find&&ls.secb===t.sec,ls.find+' | '+ls.secb);
  { const h=await p.evaluate(eval(HIT),'.ic-alc-row'); ok(L+' list rows: touch zones ≥44',h.every(Boolean),JSON.stringify(h.map((x,i)=>x?'':i).filter(String))); }
  { const h=await p.evaluate(eval(HIT),'.ic-rbar-secb'); ok(L+' list: «'+t.sec+'» touch zone ≥44 (not clipped)',h.length===1&&h.every(Boolean),JSON.stringify(h)); }
  { const x=await p.evaluate(()=>{ const a=document.querySelector('.ic-alc-row[data-id="intro-1"]'),b=document.querySelector('.ic-alc-row[data-id="alc10"]'); return [Math.round(a.querySelector('.ic-rp-t').getBoundingClientRect().left),Math.round(b.querySelector('.ic-rp-t').getBoundingClientRect().left)]; }); ok(L+' list: no-thumb row text aligned with thumb rows',x[0]===x[1],x.join('/')); }
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-list-ru.png')});
  // «Раздел»: шторка, тап → прокрутка к разделу
  await p.tap('[data-rb="sec"]'); await W(700);
  const sh=await p.evaluate(()=>[...document.querySelectorAll('#ic-alc-secs .ic-tv-typerow')].map(x=>x.textContent));
  ok(L+' «'+t.sec+'» sheet: 35 sections',sh.length===35&&sh[0]===t.intro,sh.length);
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-sections-ru.png')});
  await p.tap('#ic-alc-secs .ic-tv-typerow[data-sec="20"]'); await W(1500);
  const sc=await p.evaluate(()=>{ const s=document.querySelector('.ic-rp-sec[data-sec="20"] h2').getBoundingClientRect(); const st=document.getElementById('ic-stack').getBoundingClientRect(); return {top:Math.round(s.top),bar:Math.round(st.bottom),y:Math.round(scrollY),open:document.querySelector('#ic-alc-secs').classList.contains('ic-rb-sheet-open')}; });
  ok(L+' section tap scrolls to section 20 (below bar, on screen)',sc.y>1000&&sc.top>=-2&&sc.top<220,JSON.stringify(sc));
  // «Найти эмблему»: только девизы
  await p.evaluate(()=>window.scrollTo(0,0)); await W(400);
  await p.tap('.ic-rbar-findin'); await p.fill('.ic-rbar-findin',({ru:'надежд',en:'hope',fr:'espér'})[L]); await W(900);
  const fd=await p.evaluate(()=>({rows:[...document.querySelectorAll('.ic-alc-row')].map(x=>x.dataset.id),marks:document.querySelectorAll('.ic-alc-row mark').length,count:(document.querySelector('.ic-rp-count')||{}).textContent}));
  ok(L+' find: motto-only results with highlight',fd.rows.length>=1&&fd.rows.length<20&&fd.marks>=1,fd.rows.join(',')+' '+fd.count);
  await p.fill('.ic-rbar-findin',t.q); await W(900); const fq=await p.evaluate(()=>document.querySelectorAll('.ic-alc-row').length);
  ok(L+' find: word only in epigram text («'+t.q+'») is not found by mottoes',fq===0,fq);
  await p.fill('.ic-rbar-findin',''); await W(700);
  // 3. лупа: девизы, перевод, латынь
  for(const [q,id] of [[t.q,'alc10'],['Iliacum','alc10'],[({ru:'Должно радоваться',en:'rejoice',fr:'réjouir'})[L].split(' ').pop(),'alc10']]){
    await p.tap('[data-rb="booksearch"]'); await W(600); await p.fill('#ic-rb-sheet input.ic-search',q); await W(900);
    const lp=await p.evaluate(()=>({ids:[...document.querySelectorAll('#ic-rb-sheet .ic-sr-a')].map(a=>a.dataset.id),snip:(document.querySelector('#ic-rb-sheet .ic-sr-snip')||{}).innerHTML||''}));
    ok(L+' loupe «'+q+'» finds '+id,lp.ids.includes(id),lp.ids.slice(0,5).join(',')+' '+lp.snip.slice(0,60));
    if(q===t.q){ if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-loupe-ru.png')});
      await p.tap('#ic-rb-sheet .ic-sr-a[data-id="alc10"]'); await W(2500);
      const hl=await p.evaluate(()=>({hash:location.hash,mark:(document.querySelector('.ic-rp mark.ic-ch-mark')||{}).textContent}));
      ok(L+' loupe result opens emblem (word may sit in text no longer shown on the page)',/alciato\/alc10$/.test(hl.hash),JSON.stringify(hl)); await p.goBack(); await W(2000); }
    else { await p.tap('[data-rb="booksearch"]'); await W(500); }
  }
  { await p.goto(BASE+'#/alciato/alc119'); await W(2200); const m=await p.evaluate(()=>({h1:(document.querySelector('.ic-alc-motto')||{}).textContent,la:(document.querySelector('.ic-alc-la')||{}).textContent}));
    ok(L+' emblem 106: motto fully translated, Latin only in its line',!!m.h1&&!/id amor|Αντέρως/.test(m.h1)&&/Αντέρως, id amor virtutis/.test(m.la),JSON.stringify(m)); }
  // 4. открыть эмблему из середины списка, «назад» — на то же место
  await p.goto(BASE+'#/alciato/list'); await W(2000);
  await p.evaluate(()=>document.querySelector('.ic-alc-row[data-id="alc128"]').scrollIntoView({block:'center'})); await W(700);
  const y0=await p.evaluate(()=>Math.round(scrollY));
  await p.tap('.ic-alc-row[data-id="alc128"]'); await W(2500);
  const cd=await p.evaluate(()=>{ const f=[...document.querySelectorAll('.ic-alc-figs .ic-fig img.ic-alc-pl')], fg=[...document.querySelectorAll('.ic-alc-figs .ic-fig')]; const q=s=>document.querySelector(s);
    return {hash:location.hash,pages:[...document.querySelectorAll('.ic-alc-figs img.ic-alc-or')].map(i=>i.getAttribute('data-src').replace(/^.*pages\//,'')),gap:fg.length>1?Math.round(fg[1].getBoundingClientRect().top-fg[0].getBoundingClientRect().bottom):null,w:f[0]?Math.round(f[0].getBoundingClientRect().width):0,blend:f[0]&&getComputedStyle(f[0]).mixBlendMode,
      sec:(q('.ic-rbar-lbl-b')||{}).textContent,scan:!!q('[data-rb="scan"]'),prev:!!q('.ic-rbar-nv[data-nav="prev"]:not([disabled])'),next:!!q('.ic-rbar-nv[data-nav="next"]:not([disabled])'),
      h1:(q('.ic-alc-motto')||{}).textContent,la:(q('.ic-alc-la')||{}).textContent,h3:[...document.querySelectorAll('.ic-rp-alc .ic-sec h3')].map(x=>x.textContent),
      trLines:document.querySelectorAll('.ic-alc-fv').length,btn:!!q('[data-rb="alcorig"]'),
      order:(()=>{ const a=q('.ic-alc-figs'),b=q('.ic-alc-motto'),c=q('.ic-rp-pager'); return !!(a&&b&&c&&b.compareDocumentPosition(a)&4&&a.compareDocumentPosition(c)&4); })(),
      pager:[...document.querySelectorAll('.ic-rp-nb')].map(x=>x.textContent),vw:innerWidth}; });
  ok(L+' two-page emblem: both pages, second right under first',cd.pages.join()==='alc128.webp,alc129.webp'&&cd.gap!==null&&cd.gap>=0&&cd.gap<=10,cd.pages.join()+' gap='+cd.gap);
  ok(L+' emblem: page full width, multiply',cd.w>=cd.vw-60&&cd.blend==='multiply',cd.w+' '+cd.blend);
  ok(L+' emblem: section row «motto · '+t.pg+' 128–129», «'+t.orig+'», prev/next, no scan',cd.sec.includes(t.pg+' 128–129')&&cd.prev&&cd.next&&!cd.scan,cd.sec);
  ok(L+' emblem: motto large + Latin under it, page with translation in frame, then pager; no text blocks below; «'+t.orig+'» button',cd.h1&&cd.la&&cd.h3.length===0&&cd.trLines>=4&&cd.btn&&cd.order,JSON.stringify([cd.h1,cd.la,cd.h3,cd.trLines]));
  ok(L+' emblem: bottom pager with titles',cd.pager.length===2&&cd.pager[0].includes(t.prev),cd.pager.join(' / ').slice(0,90));
  { const h=await p.evaluate(eval(HIT),'.ic-rbar-nv,.ic-rp-nb,.ic-rbar-lbl-b'); ok(L+' emblem: touch zones ≥44',h.every(Boolean)); }
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-emblem2-ru.png'),fullPage:true});
  { const sz=await p.evaluate(()=>[...document.querySelectorAll('.ic-alc-figs .ic-fig img.ic-alc-pl')].map(i=>[i.naturalWidth,i.naturalHeight])); ok(L+' two-page emblem: both pages loaded (plates/)',sz.length===2&&sz.every(a=>a[0]>=600&&a[1]>=1400),JSON.stringify(sz)); }
  // полноэкранный просмотр: _full, обе страницы, закрытие «назад»
  await p.tap('.ic-alc-figs .ic-fig[data-k="1"]',{position:{x:12,y:12}}); await W(2500);
  const fs=await p.evaluate(()=>{ const im=[...document.querySelectorAll('.ic-svx-alc img')]; const fd=document.querySelector('.ic-svx-alc .ic-svx-feed'); return {n:im.length,srcs:im.map(i=>i.src.replace(/^.*pages\//,'')),nat:im.map(i=>i.naturalWidth),st:fd?Math.round(fd.scrollTop):-1,bg:im[0]&&getComputedStyle(im[0]).backgroundColor}; });
  ok(L+' fullscreen: both _full pages, hi-res, scrolled to tapped page, paper under ink',fs.n===2&&fs.srcs.join()==='alc128_full.webp,alc129_full.webp'&&fs.nat.every(x=>x>=1100)&&fs.st>100&&fs.bg!=='rgba(0, 0, 0, 0)',JSON.stringify(fs));
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-full-ru.png')});
  await p.goBack(); await W(900); ok(L+' fullscreen closes with browser back',await p.evaluate(()=>!document.querySelector('.ic-svx')&&/alciato\/alc128$/.test(location.hash)));
  await p.tap('.ic-alc-figs .ic-fig[data-k="0"]',{position:{x:12,y:12}}); await W(1200); await p.tap('.ic-svx-back'); await W(800); ok(L+' fullscreen closes with corner',await p.evaluate(()=>!document.querySelector('.ic-svx')));
  // Пред./След.
  await p.tap('.ic-rbar-nv[data-nav="next"]'); await W(2000); ok(L+' next → alc130',await p.evaluate(()=>/alciato\/alc130$/.test(location.hash)));
  await p.tap('.ic-rbar-nv[data-nav="prev"]'); await W(2000); ok(L+' prev → alc128',await p.evaluate(()=>/alciato\/alc128$/.test(location.hash)));
  // уголок «назад» — в список на то же место
  await p.tap('.ic-bt-back'); await W(2200); const y1=await p.evaluate(()=>Math.round(scrollY));
  ok(L+' back corner → list, same place',await p.evaluate(()=>/alciato\/list$/.test(location.hash))&&Math.abs(y1-y0)<120,y0+'→'+y1);
  // 5. «Гравюры»
  await p.goto(BASE+'#/alciato/plates'); await W(2500);
  const gr=await p.evaluate(()=>({items:document.querySelectorAll('.ic-gal-item').length,heads:[...document.querySelectorAll('.ic-pl-h')].map(x=>x.textContent),srcs:[...document.querySelectorAll('.ic-gal-item img')].slice(0,3).map(i=>i.getAttribute('src')),lazy:[...document.querySelectorAll('.ic-gal-item img')].every(i=>i.getAttribute('loading')==='lazy'),no213:!document.querySelector('.ic-gal-item[data-id="alc213"]'),cap:(document.querySelector('.ic-gal-item[data-id="alc10"] .ic-gal-cap')||{}).textContent}));
  ok(L+' engravings: 209 thumbs by 35 sections, lazy, thumb/',gr.items===209&&gr.heads.length===35&&gr.heads[0]===t.intro&&gr.lazy&&gr.srcs.every(s=>/nfhours\.github\.io\/alciato\/thumb\/.+_t\.webp/.test(s))&&gr.no213,gr.items+' '+gr.heads.length+' '+gr.srcs[0]);
  ok(L+' engravings: caption with page',new RegExp(t.pg.replace('.','\\.')+' 10$').test(gr.cap||''),gr.cap);
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-plates-ru.png')});
  await p.evaluate(()=>document.querySelector('.ic-gal-item[data-id="alc140"]').scrollIntoView({block:'center'})); await W(600); const g0=await p.evaluate(()=>Math.round(scrollY));
  await p.tap('.ic-gal-item[data-id="alc140"]'); await W(2200); ok(L+' engraving tap → emblem',await p.evaluate(()=>/alciato\/alc140$/.test(location.hash)));
  await p.tap('.ic-bt-back'); await W(2200); const g1=await p.evaluate(()=>Math.round(scrollY)); ok(L+' back → engravings, same place',await p.evaluate(()=>/alciato\/plates$/.test(location.hash))&&Math.abs(g1-g0)<120,g0+'→'+g1);
  // 6. вступление — та же страница
  await p.goto(BASE+'#/alciato/intro-3'); await W(2500);
  const it=await p.evaluate(()=>({pages:[...document.querySelectorAll('.ic-alc-figs img.ic-alc-or')].map(i=>i.getAttribute('data-src').replace(/^.*pages\//,'')),h1:(document.querySelector('.ic-alc-motto')||{}).textContent,la:(document.querySelector('.ic-alc-la')||{}).textContent,h3:[...document.querySelectorAll('.ic-rp-alc .ic-sec h3')].map(x=>x.textContent),greek:(document.querySelector('.ic-alc-greek')||{}).textContent||'',prev:!!document.querySelector('.ic-rbar-nv[data-nav="prev"]:not([disabled])'),sec:(document.querySelector('.ic-rbar-lbl-b')||{}).textContent}));
  ok(L+' intro-3: page fm0015, title, Latin title, no text blocks below',it.pages.join()==='fm0015.webp'&&it.h1&&/procrastinandum/.test(it.la)&&it.h3.length===0&&!it.greek&&it.prev&&it.sec.includes(t.pg+' 9'),JSON.stringify(it).slice(0,200));
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-intro-ru.png'),fullPage:true});
  await p.goto(BASE+'#/alciato/alc10'); await W(2500);
  const e1=await p.evaluate(()=>({greek:(document.querySelector('.ic-alc-greek')||{}).textContent||'',prevT:(document.querySelector('.ic-rp-nb-prev')||{}).textContent||''}));
  ok(L+' alc10: no Greek block; previous is intro-3',!e1.greek&&e1.prevT.length>5,e1.prevT.slice(0,60));
  if(L==='ru') await p.screenshot({path:path.join(OUT,'alciato-emblem-ru.png')});
 }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | ')); await br.close(); console.log('passed '+(n-bad)+'/'+n); console.log(bad?'FAILS '+bad:'ALL OK'); })();
