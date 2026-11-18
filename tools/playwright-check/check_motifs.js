/* Страница «Мотивы» (#/motifs), вид по макету: переключатель «Книги | Мотивы» на главной библиотеки и на «Мотивах»,
 * вкладки разделов (листаются вбок) и лупа-поиск, каталог (заголовки разделов, до 8 плиток, кнопка «Все …»), вкладка раздела (родитель с дочерними),
 * страница мотива (назад к каталогу, метки вложенных, сетка, «назад» на то же место), метки на карточке Рипы, плитка на главной Иконологии,
 * RU/EN/FR, 390×844 и 1180×820, консоль без ошибок.
 * Запуск (из корня репозитория): python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8977/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
(async()=>{
 const br=await webkit.launch(); const errs=[];
 for(const vp of [{name:'390x844',w:390,h:844,dev:devices['iPhone 13']},{name:'1180x820',w:1180,h:820}]){
  const ctx=await br.newContext(vp.dev?{...vp.dev,viewport:{width:vp.w,height:vp.h}}:{viewport:{width:vp.w,height:vp.h}}); const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(vp.name+' '+e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(vp.name+' '+m.text()); });
  const tap=async s=>{ if(vp.dev) await p.tap(s); else await p.click(s); };
  const hash=()=>p.evaluate(()=>location.hash);
  const setLang=async l=>{ await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},l); await p.reload(); await W(2000); };
  const T=vp.name+' ';
  const tog=()=>p.$$eval('.ic-mot-bt .ic-bt-tabs a',a=>a.map(x=>({t:x.textContent.trim(),on:x.classList.contains('on'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height),href:x.getAttribute('href'),tt:getComputedStyle(x).textTransform,ls:getComputedStyle(x).letterSpacing})));
  await p.goto(BASE+'#/'); await setLang('ru'); await W(1500);
  // главная библиотеки: переключатель вместо плитки
  ok(T+'плитки «Мотивы» под списком книг больше нет',(await p.$$('.ic-lib-mot')).length===0 && (await p.$$('.ic-lib-list .ic-home-tile')).length===0);
  ok(T+'список книг не изменён',(await p.$$eval('.ic-lib-row',r=>r.map(x=>x.dataset.slug).join()))==='cartari,iconologie,alciato,audran,verrien,grosson,ripa1603');
  let tg=await tog(); ok(T+'главная: переключатель «Книги | Мотивы», выбраны «Книги»',tg.length===2&&tg[0].t==='Книги'&&tg[1].t==='Мотивы'&&tg[0].on&&!tg[1].on,JSON.stringify(tg));
  ok(T+'кнопки ≈118×38–40, прописные с разрядкой',tg.every(x=>Math.abs(x.w-118)<=2&&x.h>=38&&x.h<=40&&x.tt==='uppercase'&&parseFloat(x.ls)>0),JSON.stringify(tg.map(x=>[x.w,x.h,x.ls])));
  const geo=await p.evaluate(()=>{ const a=[...document.querySelectorAll('.ic-mot-bt .ic-bt-tabs a')].map(x=>x.getBoundingClientRect()); const bb=document.querySelector('.back-bar').getBoundingClientRect(), bt=document.querySelector('.ic-mot-bt').getBoundingClientRect(); const mid=(a[0].left+a[1].right)/2; return {centered:Math.abs(mid-innerWidth/2)<=3, under:bt.top>=bb.bottom-1}; });
  ok(T+'по центру, под строкой «Библиотека / RU EN FR»',geo.centered&&geo.under,JSON.stringify(geo));
  await tap('.ic-mot-bt a[href="#/motifs"]'); await W(2500); ok(T+'тап по «Мотивам» → #/motifs',(await hash())==='#/motifs',await hash());
  tg=await tog(); ok(T+'на «Мотивах» выбраны «Мотивы»',tg.length===2&&!tg[0].on&&tg[1].on,JSON.stringify(tg.map(x=>x.on)));
  // вкладки разделов
  const tabs=await p.$$eval('.ic-mot-tab',c=>c.map(x=>({t:x.textContent,on:x.getAttribute('aria-pressed')})));
  const want=['Все','Предметы','Оружие','Животные','Растения','Небесное','Позы и жесты','Черты фигуры','Места и постройки','Персонажи'];
  ok(T+'вкладки разделов по порядку, выбрана «Все»',tabs.map(x=>x.t).join()===want.join()&&tabs[0].on==='true'&&tabs.slice(1).every(x=>x.on==='false'),tabs.map(x=>x.t).join());
  ok(T+'вкладки листаются вбок',await p.$eval('.ic-mot-tabs',e=>getComputedStyle(e).overflowX==='auto'));
  ok(T+'справа лупа',await p.evaluate(()=>{ const l=document.querySelector('.ic-mot-loupe').getBoundingClientRect(), t=document.querySelector('.ic-mot-tabs').getBoundingClientRect(); return l.left>=t.right-1 && l.height>=38; }));
  ok(T+'фильтра книг нет (файл мотивов у одной книги)',(await p.$$('.ic-mot-books')).length===0);
  // каталог
  const cat=await p.evaluate(()=>({h1:document.querySelector('.ic-rp-h1').textContent,sub:document.querySelector('.ic-mot-sub').textContent,sects:[...document.querySelectorAll('.ic-mot-sect')].map(s=>({h:s.querySelector('.ic-mot-sh span').textContent,n:s.querySelector('.ic-mot-shn').textContent,tiles:s.querySelectorAll('.ic-mot-tile').length,btn:s.querySelector('.ic-mot-allbtn').textContent,btnW:Math.round(s.querySelector('.ic-mot-allbtn').getBoundingClientRect().width),secW:Math.round(s.getBoundingClientRect().width)})),tile:(()=>{ const t=document.querySelector('.ic-mot-tile'),r=t.getBoundingClientRect(),c=getComputedStyle(t); return {h:Math.round(r.height),rad:c.borderRadius,bw:c.borderTopWidth}; })(),cols:(()=>{ const t=[...document.querySelectorAll('.ic-mot-sect:first-of-type .ic-mot-tile')].map(x=>Math.round(x.getBoundingClientRect().left)); return [...new Set(t)].length; })()}));
  ok(T+'каталог: заголовок «Мотивы» и пояснение',cat.h1==='Мотивы'&&/Поиск гравюр/.test(cat.sub),cat.h1+' | '+cat.sub);
  ok(T+'разделы по порядку, пустые не показаны',cat.sects.map(s=>s.h).join()===want.slice(1).join(),cat.sects.map(s=>s.h).join());
  ok(T+'до 8 плиток в разделе, по 2 в ряд',cat.sects.every(s=>s.tiles>=1&&s.tiles<=8)&&cat.sects[0].tiles===8&&cat.cols===2,JSON.stringify(cat.sects.map(s=>s.tiles))+' cols '+cat.cols);
  ok(T+'плитка: ≈52 px, скругление 8, тонкая рамка',cat.tile.h>=50&&cat.tile.h<=64&&cat.tile.rad==='8px'&&cat.tile.bw==='1px',JSON.stringify(cat.tile));
  ok(T+'кнопка «Все предметы · N» во всю ширину',/^Все предметы · \d+$/.test(cat.sects[0].btn)&&cat.sects[0].btnW>=cat.sects[0].secW-2&&cat.sects[0].n===cat.sects[0].btn.split(' · ')[1],cat.sects[0].btn+' / '+cat.sects[0].n);
  const first=await p.$$eval('.ic-mot-sect:first-of-type .ic-mot-tile',r=>r.map(x=>x.querySelector('.ic-mot-nm').textContent+':'+x.querySelector('.ic-mot-n').textContent));
  ok(T+'первый — «Венок», по частоте, названия с заглавной',first[0]==='Венок:80'&&first.every(x=>/^[А-ЯЁ]/.test(x)),first.slice(0,3).join(', '));
  // кнопка «Все предметы»
  await tap('.ic-mot-allbtn[data-cat="предмет"]'); await W(600);
  const tb=await p.evaluate(()=>({on:document.querySelector('.ic-mot-tab[aria-pressed="true"]').textContent,fams:document.querySelectorAll('.ic-mot-fam').length,sect:document.querySelectorAll('.ic-mot-sect').length,y:Math.round(scrollY)}));
  ok(T+'«Все предметы» → вкладка «Предметы», вверху',tb.on==='Предметы'&&tb.fams>50&&tb.sect===0&&tb.y<=2,JSON.stringify(tb));
  const par=await p.evaluate(()=>{ const f=[...document.querySelectorAll('.ic-mot-fam')].find(x=>x.querySelector('.ic-mot-tile').dataset.id==='wreath'); if(!f) return null; const t=[...f.children]; const a=t[0].getBoundingClientRect(), b=t[1].getBoundingClientRect(); return {n:t.length,kidsUnder:b.top>=a.bottom-1,full:Math.round(a.width)>=Math.round(f.parentElement.getBoundingClientRect().width)-2,kid:t[1].classList.contains('ic-mot-kid')}; });
  ok(T+'вкладка раздела: родитель «венок» первым, дочерние под ним',par&&par.n>=15&&par.kidsUnder&&par.full&&par.kid,JSON.stringify(par));
  const freq=await p.$$eval('.ic-mot-fam > .ic-mot-tile:not(.ic-mot-kid)',r=>r.map(x=>+x.querySelector('.ic-mot-n').textContent)); ok(T+'вкладка раздела: по частоте',freq.length>50&&freq.every((v,i)=>i===0||v<=freq[i-1]),freq.slice(0,6).join(','));
  await tap('.ic-mot-tab[data-cat="животное"]'); await W(500); const an=await p.$$eval('.ic-mot-tile .ic-mot-nm',r=>r.map(x=>x.textContent)); ok(T+'вкладка «Животные»',an.includes('Змея')&&!an.includes('Книга'),an.slice(0,5).join(', '));
  await tap('.ic-mot-tab[data-cat="all"]'); await W(500);
  // поиск через лупу
  await tap('.ic-mot-loupe'); await W(400);
  const fo=await p.evaluate(()=>({tabsHidden:getComputedStyle(document.querySelector('.ic-mot-tabs')).display==='none',inp:getComputedStyle(document.querySelector('.ic-mot-findbox')).display!=='none',x:!!document.querySelector('.ic-mot-findx'),ph:document.querySelector('.ic-mot-findin').placeholder}));
  ok(T+'лупа заменяет вкладки полем поиска в той же строке',fo.tabsHidden&&fo.inp&&fo.x,JSON.stringify(fo));
  const q='.ic-mot-findin';
  await p.fill(q,'зме'); await W(500); let rows=await p.$$eval('.ic-mot-tile .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'поиск «зме» (с начала слова)',rows.length>=1&&rows.every(x=>/(^|[\s-])зме/i.test(x)),rows.join(', '));
  await p.fill(q,'вен'); await W(500); rows=await p.$$eval('.ic-mot-tile .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'поиск «вен»',rows.length>=5&&rows.every(x=>/(^|[\s-])вен/i.test(x)),rows.slice(0,6).join(', '));
  await p.fill(q,'мея'); await W(400);
  const none=await p.$eval('.ic-mot-body .ic-empty',e=>e.textContent).catch(()=>null);
  ok(T+'не с начала слова — «Ничего не найдено» без подсказки про hyver',none==='Ничего не найдено'&&!/hyver/.test(await p.evaluate(()=>document.body.innerText)),String(none));
  await tap('.ic-mot-findx'); await W(500);
  const cl=await p.evaluate(()=>({tabs:getComputedStyle(document.querySelector('.ic-mot-tabs')).display!=='none',q:document.querySelector('.ic-mot-findin').value,cat:document.querySelectorAll('.ic-mot-sect').length>0}));
  ok(T+'крестик закрывает поле, возвращает вкладки и каталог',cl.tabs&&cl.q===''&&cl.cat,JSON.stringify(cl));
  // страница мотива
  await p.goto(BASE+'#/motifs'); await W(2000);
  await p.evaluate(()=>{ window.scrollTo(0,500); window.__y=-1; addEventListener('click',()=>{ window.__y=Math.round(scrollY); },true); }); await W(500);
  await p.evaluate(()=>document.querySelector('.ic-mot-tile[data-id="wreath"]').click()); await W(3000); ok(T+'тап по плитке → #/motifs/all/wreath',(await hash())==='#/motifs/all/wreath',await hash());
  const g=await p.evaluate(()=>({n:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length,cnt:document.querySelector('.ic-mot-count').textContent,h1:document.querySelector('.ic-mot-h1').textContent,cap:document.querySelector('.ic-gal-cap').textContent,small:document.querySelector('.ic-gal-cap small').textContent,kids:document.querySelectorAll('.ic-mot-kids .ic-mot-tag').length,back:!!document.querySelector('.ic-mot-back'),loupe:!!document.querySelector('.ic-mot-loupe'),cols:[...new Set([...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].slice(0,6).map(x=>Math.round(x.getBoundingClientRect().left)))].length,tabs:document.querySelectorAll('.ic-mot-tab').length,on:document.querySelector('.ic-mot-bt a.on').textContent.trim()}));
  ok(T+'мотив: название с заглавной, «N гравюр · Иконология»',g.h1==='Венок'&&/^\d+ гравюр · Иконология$/.test(g.cnt)&&g.n>=70,JSON.stringify([g.h1,g.cnt,g.n]));
  ok(T+'мотив: вложенные мотивы метками, сетка по 2, название и страница',g.kids>=15&&g.cols===2&&/с\. \d/.test(g.small)&&g.cap.length>g.small.length,JSON.stringify([g.kids,g.cols,g.small]));
  ok(T+'мотив: в тёмной строке стрелка назад и лупа, вкладок нет, выбраны «Мотивы»',g.back&&g.loupe&&g.tabs===0&&g.on==='Мотивы');
  const allShown=await p.evaluate(()=>{ const c=document.querySelector('.ic-gal-cap'); return getComputedStyle(c).overflow==='visible'; }); ok(T+'сетка и подписи целиком (не обрезаны)',allShown);
  await p.goBack(); await W(2500);
  { const yc=await p.evaluate(()=>window.__y), yb=await p.evaluate(()=>Math.round(scrollY)); ok(T+'«назад» → каталог на то же место',(await hash())==='#/motifs'&&yc>100&&Math.abs(yb-yc)<=40,await hash()+' '+yc+' → '+yb); }
  // стрелка назад на странице мотива
  await p.evaluate(()=>{ window.scrollTo(0,0); }); await tap('.ic-mot-tab[data-cat="животное"]'); await W(500); await p.evaluate(()=>{ window.scrollTo(0,300); window.__y=-1; addEventListener('click',()=>{ window.__y=Math.round(scrollY); },true); }); await W(400);
  await p.evaluate(()=>document.querySelector('.ic-mot-tile[data-id="snake"]').click()); await W(2500);
  await tap('.ic-mot-back'); await W(2500);
  const bk=await p.evaluate(()=>({h:location.hash,on:document.querySelector('.ic-mot-tab[aria-pressed="true"]')&&document.querySelector('.ic-mot-tab[aria-pressed="true"]').textContent,y:Math.round(scrollY)})); const yc2=300; ok(T+'стрелка: в каталог, тот же раздел и место',bk.h==='#/motifs'&&bk.on==='Животные'&&yc2>50&&Math.abs(bk.y-yc2)<=40,JSON.stringify(bk)+' клик на '+yc2);
  await tap('.ic-mot-tab[data-cat="all"]'); await W(300);
  // лупа на странице мотива открывает поиск в каталоге
  await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2500); await tap('.ic-mot-loupe'); await W(1500);
  ok(T+'лупа на странице мотива → каталог с полем поиска',(await hash())==='#/motifs'&&await p.evaluate(()=>getComputedStyle(document.querySelector('.ic-mot-findbox')).display!=='none'),await hash());
  await tap('.ic-mot-findx'); await W(300);
  // тап по «Книгам» возвращает на главную
  await tap('.ic-mot-bt a[href="#/"]'); await W(2000); ok(T+'«Книги» → главная',(await hash())===''||(await hash())==='#/',await hash()+'|'+(await p.$$('.ic-lib-row')).length);
  // переход в карточку и назад на то же место сетки
  await p.goto(BASE+'#/motifs/iconologie/wreath'); await W(3000);
  await p.evaluate(()=>{ window.scrollTo(0,1400); window.__y=-1; addEventListener('click',()=>{ window.__y=Math.round(scrollY); },true); }); await W(600);
  const idc=await p.evaluate(()=>{ const a=[...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].find(x=>x.getBoundingClientRect().top>200); return a&&a.dataset.id; });
  await tap('.ic-mot-grid .ic-gal-item[data-id="'+idc+'"]'); await W(2500); ok(T+'тап по гравюре открывает карточку',new RegExp('#/iconologie/'+idc+'$').test(await hash()),await hash());
  const tags=await p.$$eval('.ic-mot-sec .ic-mot-tag',a=>a.map(x=>({t:x.textContent,h:x.getBoundingClientRect().height,href:x.getAttribute('href')}))); ok(T+'метки мотивов на карточке',tags.length>=1&&tags.every(x=>x.h>=43.5&&/^#\/motifs\/iconologie\//.test(x.href)),JSON.stringify(tags.slice(0,3)));
  const aft=await p.evaluate(()=>{ const s=[...document.querySelectorAll('.ic-sec')]; const i=s.findIndex(x=>x.classList.contains('ic-mot-sec')); return {i,prev:i>0&&s[i-1].querySelector('h3').textContent}; }); ok(T+'метки после «Что изображено»',aft.prev==='Что изображено',JSON.stringify(aft));
  await p.goBack(); await W(2500); const y0=await p.evaluate(()=>window.__y), y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'«назад» возвращает в сетку на то же место',(await hash())==='#/motifs/iconologie/wreath'&&Math.abs(y1-y0)<=40,y0+' → '+y1);
  await p.goto(BASE+'#/iconologie/p1-1'); await W(2500); const t0=await p.$('.ic-mot-sec .ic-mot-tag'); const th=await t0.getAttribute('href'); await tap('.ic-mot-sec .ic-mot-tag'); await W(2200); ok(T+'метка карточки ведёт на #/motifs/iconologie/<id>',(await hash())===th,th+' vs '+await hash());
  // главная Иконологии без изменений
  await p.goto(BASE+'#/iconologie'); await W(2500); const tiles=await p.$$eval('.ic-home-tile',a=>a.map(x=>({t:x.querySelector('b').textContent,href:x.getAttribute('href')}))); ok(T+'третья плитка «Мотивы» на главной Иконологии',tiles.length===3&&tiles[2].t==='Мотивы'&&tiles[2].href==='#/motifs/iconologie',JSON.stringify(tiles));
  await tap('.ic-home-tile:nth-child(3)'); await W(2500); ok(T+'плитка открывает #/motifs/iconologie',(await hash())==='#/motifs/iconologie');
  // языки
  for(const [l,books,motifs,find,all1,sub,first] of [['en','Books','Motifs','Find a motif','All objects','Find engravings by the objects they show','Wreath'],['fr','Livres','Motifs','Chercher un motif','Tous les objets','Chercher des gravures par les objets représentés','Couronne'],['ru','Книги','Мотивы','Найти мотив','Все предметы','Поиск гравюр по изображённым предметам','Венок']]){
   await p.goto(BASE+'#/motifs'); await setLang(l); await W(500);
   const o=await p.evaluate(()=>({tg:[...document.querySelectorAll('.ic-mot-bt .ic-bt-tabs a')].map(x=>x.textContent.trim()),ph:document.querySelector('.ic-mot-findin').placeholder,btn:document.querySelector('.ic-mot-allbtn').textContent,sub:document.querySelector('.ic-mot-sub').textContent,first:document.querySelector('.ic-mot-nm').textContent,w:[...document.querySelectorAll('.ic-mot-bt .ic-bt-tabs a')].map(x=>Math.round(x.getBoundingClientRect().width)).join()}));
   ok(T+l+': переключатель, поиск, кнопка, пояснение, мотив',o.tg.join()===[books,motifs].join()&&o.ph===find&&o.btn.startsWith(all1+' · ')&&o.sub===sub&&o.first===first&&o.w==='118,118',JSON.stringify(o));
   await p.goto(BASE+'#/'); await W(1500); const h=await p.$$eval('.ic-mot-bt .ic-bt-tabs a',a=>a.map(x=>x.textContent.trim()+(x.classList.contains('on')?'*':'')).join()); ok(T+l+': главная — переключатель',h.toLowerCase()===(books+'*,'+motifs).toLowerCase(),h);
  }
  await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2000); const lab=await p.evaluate(()=>[document.querySelector('.ic-mot-h1').textContent,document.querySelector('.ic-mot-count').textContent]); ok(T+'ru: мотив «Змея»',lab[0]==='Змея'&&/гравюр/.test(lab[1]),lab.join(' | '));
  if(!process.env.NOSHOT){ await p.goto(BASE+'#/'); await W(1500); await p.screenshot({path:path.join(OUT,'motifs-home-'+vp.name+'.png')}); await p.goto(BASE+'#/motifs'); await W(1500); await p.screenshot({path:path.join(OUT,'motifs-cat-'+vp.name+'.png')}); await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2500); await p.screenshot({path:path.join(OUT,'motifs-grid-'+vp.name+'.png')}); }
  await ctx.close();
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
