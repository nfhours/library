/* Гроссон (books/grosson, viewer "plate") в общем каркасе: «Таблицы» · «Текст» · «Поиск», карточка таблицы.
 * Проверяет на 390×844 и 1180×820: три раздела открываются и различаются; шторка «Часть» переключает сетку; карточка, примечания, Пред./След., «назад» на то же место сетки;
 * поиск (запись и предисловие) ведёт в карточку/текст с подсветкой; RU/EN/FR и смена языка в «Тексте» на то же место; язык по умолчанию как у Картари; полосы шапки; консоль чиста.
 * BASE=http://localhost:8975/index.html node check_grosson.js */
const { webkit } = require('playwright'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; if(!c||process.env.V) console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
const errs=[];
const info=p=>p.evaluate(()=>({hash:location.hash,h1:(document.querySelector('h1')||{}).textContent||'',tabs:[...document.querySelectorAll('.ic-bt-tabs a')].map(a=>a.textContent.trim()+(a.classList.contains('on')?'*':'')).join('|'),
  items:document.querySelectorAll('.ic-gal-item').length,heads:document.querySelectorAll('.ic-gro-grid .ic-pl-h').length,paras:document.querySelectorAll('.ic-ch-body [data-n]').length,
  notes:document.querySelectorAll('.ic-gro-note').length,marks:document.querySelectorAll('mark.ic-ch-mark').length,sw:document.scrollingElement.scrollWidth,cw:document.scrollingElement.clientWidth,y:Math.round(scrollY)}));
(async()=>{ const br=await webkit.launch();
 for(const [w,h] of [[390,844],[1180,820]]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<600}), p=await ctx.newPage(); const tag=w+': '; let nav=0;
  p.on('pageerror',e=>errs.push(tag+e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled|503|404/i.test(m.text())) errs.push(tag+m.text().slice(0,140)); });
  const go=async hh=>{ await p.goto(BASE+'?r='+(++nav)+hh); await W(2600); return info(p); };
  // язык по умолчанию — как у Картари
  { await p.goto(BASE+'#/cartari'); await W(2200); const lc=await p.evaluate(()=>document.querySelector('.ic-lang-b[aria-pressed="true"]')?.dataset.lang); const g=await go('#/grosson'); const lg=await p.evaluate(()=>document.querySelector('.ic-lang-b[aria-pressed="true"]')?.dataset.lang);
    ok(tag+'язык по умолчанию как у Картари',lc===lg,lc+'/'+lg); }
  await p.evaluate(()=>{ try{localStorage.setItem('ic-lang','ru'); }catch(e){} });
  // три раздела
  const a=await go('#/grosson'), b=await go('#/grosson/text'), c=await go('#/grosson/search');
  ok(tag+'вход в книгу ведёт в «Таблицы»',/#\/grosson\/plates/.test(a.hash)&&/^Таблицы\*/.test(a.tabs)&&a.items===47&&a.heads===5,JSON.stringify(a));
  ok(tag+'«Текст»: 39 абзацев, вкладка активна',/Текст\*/.test(b.tabs)&&b.paras===39&&b.items===0,JSON.stringify(b));
  ok(tag+'«Поиск»: вкладка активна, форма есть',/Поиск\*/.test(c.tabs)&&!!(await p.$('.ic-gro-sform')),JSON.stringify(c));
  ok(tag+'три раздела различаются',new Set([a.h1,b.h1,c.h1]).size===3,[a.h1,b.h1,c.h1].join(' / '));
  ok(tag+'нет горизонтальной прокрутки',a.sw<=a.cw&&b.sw<=b.cw&&c.sw<=c.cw);
  // полосы шапки на всю ширину
  await go('#/grosson/plates');
  const bars=await p.evaluate(()=>{ const r=document.querySelector('.ic-rbar'), t=document.getElementById('ic-booktabs'); const g=e=>e?[Math.round(e.getBoundingClientRect().left),Math.round(e.getBoundingClientRect().width)]:null; return {rb:g(r),bt:g(t),row:document.querySelector('.ic-rbar-row')?g(document.querySelector('.ic-rbar-row')):null}; });
  ok(tag+'полосы шапки во всю ширину',bars.rb&&bars.rb[0]===0&&bars.rb[1]===w&&bars.bt&&bars.bt[1]===w,JSON.stringify(bars));
  // строка раздела показывает текущее значение; плитки облегают изображение
  const lb0=await p.$eval('[data-rb="part"]',e=>e.textContent.trim());
  ok(tag+'строка раздела показывает значение («Все части ▾»)',/Все части/.test(lb0)&&/▾/.test(lb0),lb0);
  const empt=await p.$$eval('.ic-gal-img',e=>Math.max(...e.map(g=>{ const r=g.getBoundingClientRect(),i=g.querySelector('img').getBoundingClientRect(); return 1-i.height/r.height; })));
  ok(tag+'плитки без пустых полей > 15% высоты',empt<=0.15,empt.toFixed(3));
  // шторка «Часть»
  await p.tap('[data-rb="part"]'); await W(600);
  const rows=await p.$$eval('#ic-gro-part [data-f]',e=>e.map(x=>x.textContent.trim()+(x.getAttribute('aria-pressed')==='true'?'*':'')));
  ok(tag+'шторка «Часть»: все + 5 частей',rows.length===6&&/\*/.test(rows[0]),rows.join(' | '));
  const rh=await p.$$eval('#ic-gro-part [data-f]',e=>e.map(x=>Math.round(x.getBoundingClientRect().height)));
  ok(tag+'строки шторки ≥ 44',rh.every(x=>x>=44),rh.join(','));
  await p.tap('#ic-gro-part [data-f="3"]'); await W(900);
  const s3=await info(p), lbl=await p.$eval('[data-rb="part"]',e=>e.textContent.trim());
  ok(tag+'часть III: сетка переключилась (5 таблиц, 1 заголовок), в строке — название части',s3.items===5&&s3.heads===1&&/Часть третья/.test(lbl)&&/▾/.test(lbl),JSON.stringify([s3.items,s3.heads,lbl]));
  await p.tap('[data-rb="part"]'); await W(600); await p.tap('#ic-gro-part [data-f="all"]'); await W(900);
  ok(tag+'«Все части»: 47 таблиц',(await info(p)).items===47);
  // карточка: открывается тапом; «назад» — на то же место сетки
  await p.evaluate(()=>window.dispatchEvent(new Event('touchstart')));
  await p.evaluate(()=>{ const a=document.querySelector('.ic-gal-item[data-plate="20"]'); window.scrollTo(0, a.getBoundingClientRect().top+scrollY-200); }); await W(500);
  const y0=(await info(p)).y;
  await p.evaluate(()=>document.querySelector('.ic-gal-item[data-plate="20"]').click()); await W(2500);
  const cd=await info(p);
  ok(tag+'тап открывает карточку таблицы 20',/#\/grosson\/plate\/20/.test(cd.hash)&&/20|XX/.test(cd.h1),JSON.stringify([cd.hash,cd.h1]));
  await p.evaluate(()=>document.querySelector('[data-rb="back"]').click()); await W(2500);
  const bk=await info(p);
  ok(tag+'«назад» возвращает в «Таблицы» на то же место сетки',/#\/grosson\/plates/.test(bk.hash)&&Math.abs(bk.y-y0)<=30,JSON.stringify([bk.hash,y0,bk.y]));
  // примечания: pl1-4 (таблица 1)
  await go('#/grosson/plate/1');
  if(w<600){ await p.tap('.ic-hotspot[data-id="pl1-4"]'); await W(800); } else { await p.evaluate(()=>document.querySelector('.ic-obj[data-id="pl1-4"] .ic-obj-sum').click()); await W(800); }
  if(w<600){
   const sh=await p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj'), pn=s.querySelector('.ic-rb-sheet-panel'), cs=getComputedStyle(pn); const nv=s.querySelector('.ic-gro-nv'); const r=nv.getBoundingClientRect(); return {open:s.classList.contains('ic-rb-sheet-open'),bg:cs.backgroundColor,old:!!document.querySelector('.ic-sheet'),title:s.querySelector('.ic-rb-sheet-head-title').textContent,nv:[Math.round(r.width),Math.round(r.height)]}; });
   ok(tag+'окно предмета — тёмная шторка строки раздела (не светлая панель)',sh.open&&sh.bg==='rgb(22, 19, 15)'&&!sh.old&&/^4\./.test(sh.title),JSON.stringify(sh));
   ok(tag+'кнопки ‹ › шторки ≥ 44',sh.nv[0]>=44&&sh.nv[1]>=44,sh.nv.join('×'));
   await p.evaluate(()=>document.querySelector('#ic-gro-obj .ic-gro-nv[data-d="1"]').click()); await W(300);
   ok(tag+'› переключает на следующий предмет таблицы',/^5\./.test(await p.$eval('#ic-gro-obj .ic-rb-sheet-head-title',e=>e.textContent)));
   const grn=await p.evaluate(()=>{ const bad=[]; document.querySelectorAll('#ic-gro-obj *').forEach(e=>{ const cs=getComputedStyle(e); [cs.color,cs.backgroundColor,cs.borderTopColor].forEach(c=>{ const m=/rgba?\((\d+), (\d+), (\d+)/.exec(c); if(m&&+m[2]>+m[1]+20&&+m[2]>+m[3]+20) bad.push(c); }); }); return bad.length; });
   ok(tag+'в шторке предмета нет зелёного',grn===0,String(grn));
   await p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj .ic-rb-sheet-close'); if(s) s.click(); }); await W(500);
  }
  { const gr=await p.evaluate(()=>{ const bad=[]; const chk=(e,k)=>{ const cs=getComputedStyle(e); [cs.color,cs.backgroundColor,cs.borderTopColor].forEach(c=>{ const m=/rgba?\((\d+), (\d+), (\d+)/.exec(c); if(m&&+m[2]>+m[1]+20&&+m[2]>+m[3]+20) bad.push(k+':'+c); }); };
      document.querySelectorAll('.ic-hotspot, .ic-hotspot span, .ic-obj-dot, .ic-obj-dot.on, .ic-gro-seg *, .ic-rbar *').forEach(e=>chk(e,e.className)); return bad; });
    ok(tag+'на карточке нет зелёного (метки, точки, переключатель)',gr.length===0,gr.slice(0,3).join(' | '));
    const ht=await p.$eval('.ic-hotspot',e=>{ const r=e.getBoundingClientRect(), a=getComputedStyle(e,'::after'); return [Math.round(r.width),Math.round(r.height),a.width,a.height,getComputedStyle(e.querySelector('span')).backgroundColor]; });
    ok(tag+'метка на гравюре: тёмная шапка, зона нажатия ≥ 44',ht[4]==='rgb(22, 19, 15)'&&parseFloat(ht[2])>=44&&parseFloat(ht[3])>=44,JSON.stringify(ht));
    const seg=await p.evaluate(()=>{ const s=document.querySelector('.ic-gro-seg'); const b=[...s.querySelectorAll('.ic-chip')]; return {pill:!!document.querySelector('.ic-view-toggle,.ic-ov-b'),h:b.map(x=>Math.round(x.getBoundingClientRect().height)),on:getComputedStyle(b[0]).backgroundColor}; });
    ok(tag+'переключатель — стандартные сегменты (не красная таблетка), ≥ 44',!seg.pill&&seg.h.every(x=>x>=44)&&!/142, 43, 29/.test(seg.on),JSON.stringify(seg)); }
  const nt=await p.evaluate(()=>{ const e=document.querySelector('.ic-gro-note'); if(!e) return null; const r=e.getBoundingClientRect(); return {t:e.textContent.slice(0,120),vis:r.width>0&&r.height>0,fs:parseFloat(getComputedStyle(e).fontSize)}; });
  ok(tag+'примечание видно (с пометкой «Примечание», мелкий шрифт)',nt&&nt.vis&&/^Примечание/.test(nt.t)&&nt.fs<16,JSON.stringify(nt));
  await p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj .ic-rb-sheet-close'); if(s) s.click(); });
  const q1=await p.evaluate(()=>{ const e=document.querySelector('.ic-obj[data-id="pl37-1"]'); return !!e; }); // не на этой таблице
  // [?] в легенде pl37-1 → кружок
  await go('#/grosson/pl37-1');
  const qm=await p.evaluate(()=>{ return document.querySelectorAll('.ic-gro-ob-body .ic-qm, .ic-obj-d[open] .ic-obj-body .ic-qm').length; });
  ok(tag+'[?] в легенде — кружок-пояснение (pl37-1)',qm>=2,String(qm));
  await p.evaluate(()=>{ const s=document.querySelector('#ic-gro-obj .ic-rb-sheet-close'); if(s) s.click(); });
  // Пред./След.
  await go('#/grosson/plate/5');
  await p.evaluate(()=>document.querySelector('.ic-rbar-nv[data-nav="next"]').click()); await W(1800); const nx=await info(p);
  await p.evaluate(()=>document.querySelector('.ic-rbar-nv[data-nav="prev"]').click()); await W(1800); const pv=await info(p);
  ok(tag+'След. → таблица 6, Пред. → таблица 5',/plate\/6$/.test(nx.hash)&&/plate\/5$/.test(pv.hash),nx.hash+' '+pv.hash);
  await go('#/grosson/plate/1'); const first=await p.$eval('.ic-rbar-nv[data-nav="prev"]',e=>e.disabled); await go('#/grosson/plate/47'); const last=await p.$eval('.ic-rbar-nv[data-nav="next"]',e=>e.disabled);
  ok(tag+'на краях книги кнопки неактивны',first&&last);
  // поиск: запись
  await go('#/grosson/search'); await p.fill('.ic-gro-sform .ic-search','ascia'); await W(900);
  const r1=await p.$$eval('.ic-gro-sr a.ic-sr-a',e=>e.map(x=>x.getAttribute('data-kind')+':'+x.getAttribute('data-plate')));
  ok(tag+'поиск «ascia» находит записи',r1.length>0,r1.slice(0,4).join(','));
  const ent=await p.$('.ic-gro-sr a.ic-sr-a[data-kind="e"]'); await ent.tap(); await W(2800);
  const hl=await info(p);
  ok(tag+'результат ведёт в карточку с подсветкой',/#\/grosson\/plate\/\d+/.test(hl.hash)&&hl.marks>=1,JSON.stringify([hl.hash,hl.marks]));
  // поиск: предисловие
  await go('#/grosson/search'); await p.fill('.ic-gro-sform .ic-search','цитадел'); await W(900);
  const pr=await p.$('.ic-gro-sr a.ic-sr-a[data-kind="p"]'); ok(tag+'поиск находит абзац предисловия',!!pr);
  if(pr){ await pr.tap(); await W(2800); const ph=await info(p); ok(tag+'переход в «Текст» с подсветкой',/grosson\/text/.test(ph.hash)&&ph.marks>=1,JSON.stringify([ph.hash,ph.marks])); }
  // языки
  for(const L of ['ru','en','fr']){
   await p.evaluate(l=>{ try{localStorage.setItem('ic-lang',l);}catch(e){} },L);
   const g=await go('#/grosson/plates'), t=await go('#/grosson/text'); const tl=await p.$eval('.ic-ch-body',e=>e.getAttribute('lang')), cc=await go('#/grosson/plate/1');
   const exp={ru:'Таблицы',en:'Plates',fr:'Planches'}[L];
   ok(tag+L+': «Таблицы» на языке интерфейса',g.h1===exp,g.h1);
   ok(tag+L+': «Текст» 39 абзацев, lang='+L,t.paras===39&&tl===L);
   ok(tag+L+': карточка открывается',cc.h1.length>3&&!/undefined/.test(cc.h1),cc.h1);
  }
  // смена языка в «Тексте» — на то же место
  await p.evaluate(()=>{ try{localStorage.setItem('ic-lang','ru'); }catch(e){} });
  await go('#/grosson/text');
  await p.evaluate(()=>window.dispatchEvent(new Event('touchstart')));
  await p.evaluate(()=>{ const e=document.querySelector('.ic-ch-body [data-n="22"]'); window.scrollTo(0, e.getBoundingClientRect().top+scrollY-200); }); await W(600);
  const top=async()=>p.evaluate(()=>{ let edge=0; ['ic-stack'].forEach(id=>{const e=document.getElementById(id); if(e) edge=Math.max(edge,e.getBoundingClientRect().bottom);}); const rb=document.querySelector('.ic-rbar'); if(rb) edge=Math.max(edge,rb.getBoundingClientRect().bottom); const els=[...document.querySelectorAll('.ic-ch-body [data-n]')]; for(const e of els){ const r=e.getBoundingClientRect(); if(r.bottom>edge+1) return {n:e.dataset.n,dy:Math.round(r.top-edge)}; } return null; });
  const t0=await top(); await p.evaluate(()=>document.querySelector('.ic-lang-b[data-lang="en"]').click()); await W(2500); const t1=await top();
  await p.evaluate(()=>document.querySelector('.ic-lang-b[data-lang="fr"]').click()); await W(2500); const t2=await top();
  ok(tag+'смена языка в «Тексте» — тот же абзац на том же месте',t0&&t1&&t2&&t0.n===t1.n&&t1.n===t2.n&&Math.abs(t0.dy-t1.dy)<=6&&Math.abs(t1.dy-t2.dy)<=6,JSON.stringify([t0,t1,t2]));
  // «Скан» в «Тексте»
  await go('#/grosson/text'); await p.evaluate(()=>{try{localStorage.setItem('ic-lang','ru');}catch(e){}});
  const sc=await p.$('[data-rb="scan"]'); if(sc){ await sc.tap(); await W(900); const svx=await p.evaluate(()=>({imgs:document.querySelectorAll('.ic-svx-feed img').length})); ok(tag+'«Скан» открывает страницы предисловия',svx.imgs===22,JSON.stringify(svx)); await p.evaluate(()=>{ const b=document.querySelector('.ic-svx-back'); if(b) b.click(); }); } else ok(tag+'кнопка «Скан» есть',false);
  await ctx.close();
 }
 await br.close();
 ok('консоль без ошибок',errs.length===0,errs.slice(0,5).join(' | '));
 console.log(bad?('FAIL: '+bad+' из '+n):('OK ('+n+' проверок)')); process.exit(bad?1:0); })();
