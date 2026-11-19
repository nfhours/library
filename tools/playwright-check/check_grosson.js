/* Гроссон (books/grosson, viewer "plate") в общем каркасе: обложка · «Таблицы» · «Предметы» · «Текст», лупа-шторка, карточка таблицы, шторка предмета.
 * 390×844 и 1180×820: обложка и плитки; «Таблицы» (шторка «Часть», плитки без пустых полей); «Предметы» (249 строк, поиск по списку, открытие и «назад» на то же место);
 * лупа находит предмет и абзац предисловия (переход + подсветка); шторка предмета одинакова на обоих размерах, заголовок «Таблица N, № M» + название; note и flag на RU/EN/FR;
 * «Как в книге»; нет зелёного; язык по умолчанию как у Картари; смена языка в «Тексте»; консоль чиста.
 * BASE=http://localhost:8975/index.html node check_grosson.js */
const { webkit } = require('playwright'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; if(!c||process.env.V) console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
const errs=[];
const info=p=>p.evaluate(()=>({hash:location.hash,h1:(document.querySelector('h1')||{}).textContent||'',tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(a=>a.textContent.trim()+(a.classList.contains('on')?'*':'')).join('|'),
  items:document.querySelectorAll('.ic-gal-item').length,heads:document.querySelectorAll('.ic-gro-grid .ic-pl-h').length,rows:document.querySelectorAll('.ic-row-item').length,tiles:document.querySelectorAll('.ic-home-tile').length,paras:document.querySelectorAll('.ic-ch-body [data-n]').length,
  marks:document.querySelectorAll('mark.ic-ch-mark').length,sw:document.scrollingElement.scrollWidth,cw:document.scrollingElement.clientWidth,y:Math.round(scrollY),loupe:!!document.querySelector('[data-rb="booksearch"]')}));
const greenCount=p=>p.evaluate(()=>{ const bad=[]; document.querySelectorAll('.ic-hotspot, .ic-hotspot span, .ic-obj-dot, .ic-gro-seg *, .ic-rbar *, #ic-gro-obj *, .ic-gro-note').forEach(e=>{ const cs=getComputedStyle(e); [cs.color,cs.backgroundColor,cs.borderTopColor].forEach(c=>{ const m=/rgba?\((\d+), (\d+), (\d+)/.exec(c); if(m&&+m[2]>+m[1]+20&&+m[2]>+m[3]+20) bad.push(c); }); }); return bad.length; });
(async()=>{ const br=await webkit.launch();
 for(const [w,h] of [[390,844],[1180,820]]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<600}), p=await ctx.newPage(); const tag=w+': '; let nav=0;
  p.on('pageerror',e=>errs.push(tag+e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled|503|404/i.test(m.text())) errs.push(tag+m.text().slice(0,140)); });
  const go=async hh=>{ await p.goto(BASE+'?r='+(++nav)+hh); await W(2600); return info(p); };
  const setLang=l=>p.evaluate(l=>{ try{localStorage.setItem('ic-lang',l);}catch(e){} },l);
  const sheet=()=>p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj'); if(!s) return null; const pn=s.querySelector('.ic-rb-sheet-panel'), r=pn.getBoundingClientRect(), t=s.querySelector('.ic-rb-sheet-head-title'); return {open:s.classList.contains('ic-rb-sheet-open'),bg:getComputedStyle(pn).backgroundColor,left:Math.round(r.left),w:Math.round(r.width),ref:(t.querySelector('.ic-gro-ref')||{}).textContent,ttl:(t.querySelector('.ic-gro-ttl')||{}).textContent,refFs:t.querySelector('.ic-gro-ref')?parseFloat(getComputedStyle(t.querySelector('.ic-gro-ref')).fontSize):0,ttlFs:t.querySelector('.ic-gro-ttl')?parseFloat(getComputedStyle(t.querySelector('.ic-gro-ttl')).fontSize):0,inline:!!document.querySelector('.ic-obj-d[open]'),old:!!document.querySelector('.ic-sheet'),nv:[...s.querySelectorAll('.ic-gro-nv')].map(b=>Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height))}; });
  const closeSheet=async()=>{ await p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj .ic-rb-sheet-close'); if(s) s.click(); }); await W(500); };
  await p.goto(BASE+'#/cartari'); await W(2200); const lc=await p.evaluate(()=>document.querySelector('.ic-lang-b[aria-pressed="true"]')?.dataset.lang); await go('#/grosson'); const lg=await p.evaluate(()=>document.querySelector('.ic-lang-b[aria-pressed="true"]')?.dataset.lang);
  ok(tag+'язык по умолчанию как у Картари',lc===lg,lc+'/'+lg);
  await setLang('ru');
  // ---- обложка ----
  const cv=await go('#/grosson');
  const cov=await p.evaluate(()=>({tiles:[...document.querySelectorAll('.ic-home-tile b')].map(b=>b.textContent.trim()),hero:!!document.querySelector('.ic-home-fig img'),heroOk:(()=>{const i=document.querySelector('.ic-home-fig img'); return !!i&&i.naturalWidth>0;})(),blurb:(document.querySelector('.ic-home-blurb')||{}).textContent||'',author:(document.querySelector('.ic-home-author')||{}).textContent,ed:(document.querySelector('.ic-home-ed')||{}).textContent,tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(a=>a.textContent.trim())}));
  ok(tag+'обложка: титул, автор, издание, описание',cov.hero&&cov.heroOk&&/Гроссон/.test(cov.author)&&/1773/.test(cov.ed)&&cov.blurb.length>40,JSON.stringify([cov.hero,cov.heroOk,cov.author,cov.ed,cov.blurb.length]));
  ok(tag+'обложка: плитки-входы «Таблицы», «Предметы», «Текст»; вкладки книги те же',cov.tiles.join()==='Таблицы,Предметы,Текст'&&cov.tabs.join()==='Таблицы,Предметы,Текст',JSON.stringify([cov.tiles,cov.tabs]));
  ok(tag+'обложка: адрес остаётся #/grosson, есть лупа',/#\/grosson$/.test(cv.hash)&&cv.loupe,cv.hash);
  for(const [i,exp] of [[0,'plates'],[1,'items'],[2,'text']]){ await go('#/grosson'); await p.evaluate(i=>document.querySelectorAll('.ic-home-tile')[i].click(),i); await W(2200); ok(tag+'плитка '+i+' ведёт в '+exp,new RegExp('#/grosson/'+exp+'$').test(await p.evaluate(()=>location.hash))); }
  // ---- «Таблицы» ----
  const a=await go('#/grosson/plates'), b=await go('#/grosson/items'), c=await go('#/grosson/text');
  ok(tag+'«Таблицы»: 47 плиток, 5 частей, вкладка активна',/^Таблицы\*\|Предметы\|Текст$/.test(a.tabs)&&a.items===47&&a.heads===5,JSON.stringify(a));
  ok(tag+'«Предметы»: 249 строк, вкладка активна',/Предметы\*/.test(b.tabs)&&b.rows===249,JSON.stringify([b.tabs,b.rows]));
  ok(tag+'«Текст»: 39 абзацев, вкладка активна',/Текст\*/.test(c.tabs)&&c.paras===39,JSON.stringify([c.tabs,c.paras]));
  ok(tag+'три раздела различаются',new Set([a.h1,b.h1,c.h1]).size===3,[a.h1,b.h1,c.h1].join(' / '));
  ok(tag+'вкладки «Поиск» нет, лупа на всех разделах',!/Поиск/.test(a.tabs+b.tabs+c.tabs)&&a.loupe&&b.loupe&&c.loupe);
  ok(tag+'нет горизонтальной прокрутки',a.sw<=a.cw&&b.sw<=b.cw&&c.sw<=c.cw);
  await go('#/grosson/plates');
  const bars=await p.evaluate(()=>{ const r=document.querySelector('.ic-rbar'), t=document.getElementById('ic-booktabs'); const g=e=>e?[Math.round(e.getBoundingClientRect().left),Math.round(e.getBoundingClientRect().width)]:null; return {rb:g(r),bt:g(t)}; });
  ok(tag+'полосы шапки во всю ширину',bars.rb&&bars.rb[0]===0&&bars.rb[1]===w&&bars.bt&&bars.bt[1]===w,JSON.stringify(bars));
  const lb0=await p.$eval('[data-rb="part"]',e=>e.textContent.trim()); ok(tag+'строка раздела показывает значение («Все части ▾»)',/Все части/.test(lb0)&&/▾/.test(lb0),lb0);
  const empt=await p.$$eval('.ic-gal-img',e=>Math.max(...e.map(g=>{ const r=g.getBoundingClientRect(),i=g.querySelector('img').getBoundingClientRect(); return 1-i.height/r.height; }))); ok(tag+'плитки без пустых полей > 15% высоты',empt<=0.15,empt.toFixed(3));
  await p.tap('[data-rb="part"]'); await W(600);
  const rows=await p.$$eval('#ic-gro-part [data-f]',e=>e.map(x=>x.textContent.trim()+(x.getAttribute('aria-pressed')==='true'?'*':''))); const rh=await p.$$eval('#ic-gro-part [data-f]',e=>e.map(x=>Math.round(x.getBoundingClientRect().height)));
  ok(tag+'шторка «Часть»: все + 5 частей, строки ≥ 44',rows.length===6&&rh.every(x=>x>=44),rows.join(' | '));
  await p.tap('#ic-gro-part [data-f="3"]'); await W(900); const s3=await info(p), lbl=await p.$eval('[data-rb="part"]',e=>e.textContent.trim());
  ok(tag+'часть III переключает сетку (5 таблиц, 1 заголовок), в строке — название части',s3.items===5&&s3.heads===1&&/Часть третья/.test(lbl)&&/▾/.test(lbl),JSON.stringify([s3.items,s3.heads,lbl]));
  await p.tap('[data-rb="part"]'); await W(600); await p.tap('#ic-gro-part [data-f="all"]'); await W(900); ok(tag+'«Все части»: 47 таблиц',(await info(p)).items===47);
  // ---- «Предметы» ----
  await go('#/grosson/items');
  const li=await p.evaluate(()=>{ const r=document.querySelector('.ic-row-item'); const ref=r.querySelector('.ic-gro-ref'), t=r.querySelector('.ic-tv-ru'); return {ref:ref.textContent,ttl:t.textContent,refFs:parseFloat(getComputedStyle(ref).fontSize),ttlFs:parseFloat(getComputedStyle(t).fontSize),h:Math.round(r.getBoundingClientRect().height),parts:document.querySelectorAll('.ic-rp-part').length,secs:document.querySelectorAll('.ic-rp-sec').length}; });
  ok(tag+'строка: сверху мелко «Таблица I, № 1», ниже крупно название',/^Таблица I, № 1$/.test(li.ref)&&li.ttl.length>2&&li.refFs<li.ttlFs&&li.h>=44,JSON.stringify(li));
  ok(tag+'список по порядку книги: 5 частей, 47 таблиц',li.parts===5&&li.secs===47,JSON.stringify([li.parts,li.secs]));
  await p.fill('.ic-rbar-findin','Диана'); await W(900); const f1=await info(p); const cnt=await p.$eval('.ic-rp-count',e=>e.textContent);
  ok(tag+'поиск по списку: строк меньше 249, «Найдено: N»',f1.rows>0&&f1.rows<249&&/Найдено: \d+/.test(cnt),f1.rows+' '+cnt);
  await p.fill('.ic-rbar-findin',''); await W(700); ok(tag+'очистка поиска возвращает 249',(await info(p)).rows===249);
  await p.evaluate(()=>window.dispatchEvent(new Event('touchstart')));
  await p.evaluate(()=>{ const r=document.querySelector('.ic-row-item[data-id="pl20-1"]')||document.querySelectorAll('.ic-row-item')[150]; window.scrollTo(0, r.getBoundingClientRect().top+scrollY-260); }); await W(500);
  const y0=(await info(p)).y; const rid=await p.evaluate(()=>{ const e=[...document.querySelectorAll('.ic-row-item')].find(x=>x.getBoundingClientRect().top>260); return e.getAttribute('data-id'); });
  await p.evaluate(id=>document.querySelector('.ic-row-item[data-id="'+id+'"]').click(),rid); await W(2700);
  const sh0=await sheet(); const hh=await info(p);
  ok(tag+'тап по строке открывает предмет (карточка таблицы + шторка)',/#\/grosson\/plate\/\d+/.test(hh.hash)&&sh0&&sh0.open,JSON.stringify([hh.hash,sh0&&sh0.ttl]));
  await closeSheet(); await p.evaluate(()=>document.querySelector('[data-rb="back"]').click()); await W(2500); const bk=await info(p);
  ok(tag+'«назад» возвращает в «Предметы» на то же место',/#\/grosson\/items/.test(bk.hash)&&Math.abs(bk.y-y0)<=30&&bk.rows===249,JSON.stringify([bk.hash,y0,bk.y]));
  // ---- шторка предмета (одинакова на обоих размерах) ----
  await go('#/grosson/plate/1');
  await p.evaluate(()=>document.querySelector('.ic-hotspot[data-id="pl1-4"]').click()); await W(900);
  const sh=await sheet();
  ok(tag+'шторка предмета: тёмная, открыта, не светлая панель и не раскрытая строка',sh.open&&sh.bg==='rgb(22, 19, 15)'&&!sh.old&&!sh.inline,JSON.stringify([sh.open,sh.bg,sh.old,sh.inline]));
  ok(tag+'заголовок: сверху мелко «Таблица I, № 4», ниже крупно название',sh.ref==='Таблица I, № 4'&&/Диана/.test(sh.ttl)&&sh.refFs<sh.ttlFs,JSON.stringify([sh.ref,sh.ttl,sh.refFs,sh.ttlFs]));
  ok(tag+'кнопки ‹ › ≥ 44',sh.nv.length===2&&sh.nv.every(x=>x.split('x').every(v=>+v>=44)),sh.nv.join(','));
  (global.shapes=global.shapes||{})[w]=[sh.left,sh.bg,sh.ref,sh.refFs,sh.ttlFs];
  await p.evaluate(()=>document.querySelector('#ic-gro-obj .ic-gro-nv[data-d="1"]').click()); await W(300);
  ok(tag+'› переключает на следующий предмет таблицы',(await sheet()).ref==='Таблица I, № 5');
  await closeSheet();
  // примечание и flag на трёх языках
  for(const [L,pat] of [['ru',/^Примечание/],['en',/^Note/],['fr',/^Note/]]){
   await setLang(L); await go('#/grosson/pl4-16'); await p.evaluate(()=>{});
   const nt=await p.evaluate(()=>[...document.querySelectorAll('#ic-gro-obj .ic-gro-note')].map(e=>{const r=e.getBoundingClientRect(); return {t:e.textContent,vis:r.width>0&&r.height>0,fs:parseFloat(getComputedStyle(e).fontSize)}; }));
   ok(tag+L+': note виден, мелко, с пометкой «Примечание/Note»',nt.length>=1&&nt.every(x=>x.vis&&x.fs<16&&pat.test(x.t)),JSON.stringify(nt).slice(0,160));
   await go('#/grosson/pl38-1'); const fl=await p.evaluate(()=>[...document.querySelectorAll('#ic-gro-obj .ic-gro-note')].map(e=>e.textContent));
   const frTxt=/l'outil|ascia = outil/.test(fl.join(' ')), ruTxt=/Толкование орудия/.test(fl.join(' ')), enTxt=/reading of the tool/.test(fl.join(' '));
   ok(tag+L+': flag выведен как примечание на языке интерфейса (pl38-1)',fl.length>=1&&(L==='ru'?ruTxt&&!frTxt:L==='en'?enTxt&&!frTxt:frTxt),fl.map(x=>x.slice(0,50)).join(' || '));
  }
  await setLang('ru');
  // [?] в легенде
  await go('#/grosson/pl37-1'); const qm=await p.evaluate(()=>document.querySelectorAll('#ic-gro-obj .ic-qm').length); ok(tag+'[?] в легенде — кружок-пояснение (pl37-1)',qm>=2,String(qm)); await closeSheet();
  // ---- карточка, «Как в книге», Пред./След. ----
  await go('#/grosson/plate/5');
  await p.evaluate(()=>document.querySelector('.ic-rbar-nv[data-nav="next"]').click()); await W(1800); const nx=await info(p);
  await p.evaluate(()=>document.querySelector('.ic-rbar-nv[data-nav="prev"]').click()); await W(1800); const pv=await info(p);
  ok(tag+'След. → таблица 6, Пред. → таблица 5',/plate\/6$/.test(nx.hash)&&/plate\/5$/.test(pv.hash),nx.hash+' '+pv.hash);
  await go('#/grosson/plate/1'); const first=await p.$eval('.ic-rbar-nv[data-nav="prev"]',e=>e.disabled); await go('#/grosson/plate/47'); const last=await p.$eval('.ic-rbar-nv[data-nav="next"]',e=>e.disabled); ok(tag+'на краях книги кнопки неактивны',first&&last);
  await go('#/grosson/plate/1');
  await p.evaluate(()=>document.querySelector('.ic-gro-seg .ic-chip[data-view="book"]').click()); await W(500);
  const bt=await p.evaluate(()=>({txt:document.querySelectorAll('.ic-book-text p').length,refs:document.querySelectorAll('.ic-numref').length,pressed:document.querySelector('.ic-gro-seg .ic-chip[data-view="book"]').getAttribute('aria-pressed')}));
  ok(tag+'«Как в книге»: сплошной текст с номерами-ссылками',bt.txt>=5&&bt.refs>=5&&bt.pressed==='true',JSON.stringify(bt));
  await p.evaluate(()=>document.querySelectorAll('.ic-numref')[2].click()); await W(800); const nsh=await sheet(); ok(tag+'номер в «Как в книге» открывает шторку предмета',nsh.open&&/№ 3$/.test(nsh.ref),JSON.stringify(nsh&&nsh.ref)); await closeSheet();
  await p.evaluate(()=>document.querySelector('.ic-gro-seg .ic-chip[data-view="list"]').click()); await W(400); ok(tag+'«Список предметов» возвращается',(await p.$$('.ic-obj')).length>=5);
  ok(tag+'на карточке нет зелёного',(await greenCount(p))===0);
  // ---- лупа ----
  await go('#/grosson/items'); await p.evaluate(()=>document.querySelector('[data-rb="booksearch"]').click()); await W(700);
  await p.fill('#ic-rb-sheet .ic-search','ascia'); await W(900);
  const r1=await p.$$eval('#ic-rb-sheet a.ic-sr-a',e=>e.map(x=>x.getAttribute('data-kind')+':'+x.getAttribute('data-plate')));
  ok(tag+'лупа находит предметы по слову «ascia»',r1.length>0&&r1.some(x=>x.startsWith('e:')),r1.slice(0,4).join(','));
  await p.evaluate(()=>document.querySelector('#ic-rb-sheet a.ic-sr-a[data-kind="e"]').click()); await W(2800); const hl=await info(p), shl=await sheet();
  ok(tag+'результат ведёт в карточку, шторка предмета открыта, слово подсвечено',/#\/grosson\/plate\/\d+/.test(hl.hash)&&shl.open&&(await p.evaluate(()=>document.querySelectorAll('#ic-gro-obj mark.ic-ch-mark').length))>=1,JSON.stringify([hl.hash,shl&&shl.open]));
  await go('#/grosson/plates'); await p.evaluate(()=>document.querySelector('[data-rb="booksearch"]').click()); await W(700); await p.fill('#ic-rb-sheet .ic-search','цитадел'); await W(900);
  ok(tag+'лупа находит абзац предисловия',(await p.$$('#ic-rb-sheet a.ic-sr-a[data-kind="p"]')).length>0);
  await p.evaluate(()=>document.querySelector('#ic-rb-sheet a.ic-sr-a[data-kind="p"]').click()); await W(2800); const ph=await info(p);
  ok(tag+'переход в «Текст» с подсветкой слова',/grosson\/text/.test(ph.hash)&&ph.marks>=1,JSON.stringify([ph.hash,ph.marks]));
  await go('#/grosson/plates'); await p.evaluate(()=>document.querySelector('[data-rb="booksearch"]').click()); await W(700); await p.fill('#ic-rb-sheet .ic-search','Таблица XXXIX'); await W(900);
  ok(tag+'лупа находит таблицу',(await p.$$('#ic-rb-sheet a.ic-sr-a[data-kind="t"]')).length>0||(await p.$$('#ic-rb-sheet a.ic-sr-a')).length>0);
  // ---- языки ----
  for(const L of ['ru','en','fr']){
   await setLang(L); const g=await go('#/grosson/plates'), t0=await go('#/grosson/text'); const tl=await p.$eval('.ic-ch-body',e=>e.getAttribute('lang')); const it=await go('#/grosson/items'); const cc=await go('#/grosson/plate/1'); const cv2=await go('#/grosson');
   const exp={ru:'Таблицы',en:'Plates',fr:'Planches'}[L], expI={ru:'Предметы',en:'Objects',fr:'Objets'}[L];
   ok(tag+L+': «Таблицы» и «Предметы» на языке интерфейса',g.h1===exp&&it.h1===expI&&it.rows===249,[g.h1,it.h1].join('/'));
   ok(tag+L+': «Текст» 39 абзацев, lang='+L,t0.paras===39&&tl===L);
   ok(tag+L+': карточка и обложка открываются',cc.h1.length>3&&cv2.tiles===3,cc.h1);
  }
  // ---- смена языка в «Текст» — на то же место ----
  await setLang('ru'); await go('#/grosson/text'); await p.evaluate(()=>window.dispatchEvent(new Event('touchstart')));
  await p.evaluate(()=>{ const e=document.querySelector('.ic-ch-body [data-n="22"]'); window.scrollTo(0, e.getBoundingClientRect().top+scrollY-200); }); await W(600);
  const top=async()=>p.evaluate(()=>{ let edge=0; ['ic-stack'].forEach(id=>{const e=document.getElementById(id); if(e) edge=Math.max(edge,e.getBoundingClientRect().bottom);}); const rb=document.querySelector('.ic-rbar'); if(rb) edge=Math.max(edge,rb.getBoundingClientRect().bottom); const els=[...document.querySelectorAll('.ic-ch-body [data-n]')]; for(const e of els){ const r=e.getBoundingClientRect(); if(r.bottom>edge+1) return {n:e.dataset.n,dy:Math.round(r.top-edge)}; } return null; });
  const t0=await top(); await p.evaluate(()=>document.querySelector('.ic-lang-b[data-lang="en"]').click()); await W(2500); const t1=await top();
  await p.evaluate(()=>document.querySelector('.ic-lang-b[data-lang="fr"]').click()); await W(2500); const t2=await top();
  ok(tag+'смена языка в «Тексте» — тот же абзац на том же месте',t0&&t1&&t2&&t0.n===t1.n&&t1.n===t2.n&&Math.abs(t0.dy-t1.dy)<=6&&Math.abs(t1.dy-t2.dy)<=6,JSON.stringify([t0,t1,t2]));
  await go('#/grosson/text'); await setLang('ru'); await go('#/grosson/text'); const sc=await p.$('[data-rb="scan"]');
  if(sc){ await sc.tap(); await W(900); const svx=await p.evaluate(()=>({imgs:document.querySelectorAll('.ic-svx-feed img').length})); ok(tag+'«Скан» открывает страницы предисловия',svx.imgs===22,JSON.stringify(svx)); await p.evaluate(()=>{ const b=document.querySelector('.ic-svx-back'); if(b) b.click(); }); } else ok(tag+'кнопка «Скан» есть',false);
  await ctx.close();
 }
 await br.close();
 const sh=global.shapes||{}; ok('шторка предмета одинакова на 390 и 1180 (цвет, заголовок «Таблица I, № 4», пропорция кеглей)',sh[390]&&sh[1180]&&sh[390][1]===sh[1180][1]&&sh[390][2]===sh[1180][2]&&Math.abs(sh[390][3]/sh[390][4]-sh[1180][3]/sh[1180][4])<0.02,JSON.stringify(sh));
 ok('консоль без ошибок',errs.length===0,errs.slice(0,5).join(' | '));
 console.log(bad?('FAIL: '+bad+' из '+n):('OK ('+n+' проверок)')); process.exit(bad?1:0); })();
