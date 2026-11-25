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
  const tap=async s=>{ if(!vp.dev || /ic-mot-bt|ic-mot-cap/.test(s)) await p.evaluate(s=>document.querySelector(s).click(),s); else if(vp.dev) await p.tap(s); else await p.click(s); };
  const hash=()=>p.evaluate(()=>location.hash);
  const setLang=async l=>{ await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},l); const h=await p.evaluate(()=>location.hash); try{ await p.reload({waitUntil:'domcontentloaded',timeout:20000}); }catch(e){ await p.goto('about:blank'); await p.goto(BASE+h,{waitUntil:'domcontentloaded'}); } await W(2000); };
  const T=vp.name+' ';
  const tog=()=>p.$$eval('.ic-mot-cap a',a=>a.map(x=>({t:x.textContent.trim(),on:x.classList.contains('on'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height),href:x.getAttribute('href'),tt:getComputedStyle(x).textTransform,ls:getComputedStyle(x).letterSpacing})));
  await p.goto(BASE+'#/'); await setLang('ru'); await W(1500); await p.waitForSelector('.ic-lib-row',{timeout:30000});
  // главная библиотеки: переключатель вместо плитки
  ok(T+'плитки «Мотивы» под списком книг больше нет',(await p.$$('.ic-lib-mot')).length===0 && (await p.$$('.ic-lib-list .ic-home-tile')).length===0);
  ok(T+'список книг не изменён',(await p.$$eval('.ic-lib-row',r=>r.map(x=>x.dataset.slug).join()))==='cartari,iconologie,audran,alciato,verrien,grosson,ripa1603');
  let tg=await tog(); ok(T+'главная: переключатель «Книги | Мотивы», выбраны «Книги»',tg.length===2&&tg[0].t==='Книги'&&tg[1].t==='Мотивы'&&tg[0].on&&!tg[1].on,JSON.stringify(tg));
  const cap=await p.evaluate(()=>{ const c=document.querySelector('.ic-mot-cap'),r=c.getBoundingClientRect(),a=[...c.querySelectorAll('a')],ls=parseFloat(getComputedStyle(a[0]).letterSpacing)||0; const cen=a.map(x=>{ const h=x.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(x.firstChild); const t=rg.getBoundingClientRect(); return (t.left+(t.width-ls)/2)-(h.left+h.width/2); }); const pl=document.querySelector('.ic-mot-pill i').getBoundingClientRect(), on=a.find(x=>x.classList.contains('on')).getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),half:a.map(x=>Math.round(x.getBoundingClientRect().width*10)/10),cen:cen.map(x=>Math.round(x*100)/100),pillIn:[Math.round(pl.left-on.left),Math.round(pl.top-r.top-1),Math.round(on.right-pl.right)],tt:getComputedStyle(a[0]).textTransform,ls}; });
  ok(T+'капсула ≈288×46, две равные половины, подписи по центру (≤1px), подложка с отступом 4',cap.w>=286&&cap.w<=290&&cap.h===46&&Math.abs(cap.half[0]-cap.half[1])<=0.6&&cap.cen.every(x=>Math.abs(x)<=1)&&cap.pillIn[0]===0&&cap.pillIn[2]===0&&cap.pillIn[1]===4&&cap.tt==='uppercase'&&cap.ls>0,JSON.stringify(cap));
  const geo=await p.evaluate(()=>{ const a=[...document.querySelectorAll('.ic-mot-cap a')].map(x=>x.getBoundingClientRect()); const bb=document.querySelector('.back-bar').getBoundingClientRect(), bt=document.querySelector('.ic-mot-bt').getBoundingClientRect(); const mid=(a[0].left+a[1].right)/2; return {centered:Math.abs(mid-innerWidth/2)<=3, under:bt.top>=bb.bottom-1}; });
  ok(T+'по центру, под строкой «Библиотека / RU EN FR»',geo.centered&&geo.under,JSON.stringify(geo));
  await tap('.ic-mot-bt a[href="#/motifs"]'); await W(2500); ok(T+'тап по «Мотивам» → #/motifs',(await hash())==='#/motifs',await hash());
  tg=await tog(); ok(T+'на «Мотивах» выбраны «Мотивы»',tg.length===2&&!tg[0].on&&tg[1].on,JSON.stringify(tg.map(x=>x.on)));
  // вкладки разделов
  const tabs=await p.$$eval('.ic-mot-tab',c=>c.map(x=>({t:x.textContent,on:x.getAttribute('aria-pressed')})));
  const want=['Все','Предметы','Оружие','Животные','Растения','Небесное','Позы и жесты','Черты фигуры','Места и постройки','Персонажи'];
  ok(T+'вкладки разделов по порядку, выбрана «Все»',tabs.map(x=>x.t).join()===want.join()&&tabs[0].on==='true'&&tabs.slice(1).every(x=>x.on==='false'),tabs.map(x=>x.t).join());
  ok(T+'вкладки листаются вбок',await p.$eval('.ic-mot-tabs',e=>getComputedStyle(e).overflowX==='auto'));
  if(vp.dev){ // маска строки вкладок: у краёв затухание, слева — только когда прокручено от начала, справа — только когда есть что листать; лупа не затухает
    const mk=()=>p.evaluate(()=>{ const t=document.querySelector('.ic-mot-tabs'), c=getComputedStyle(t); return {ml:t.style.getPropertyValue('--ml'),mr:t.style.getPropertyValue('--mr'),mask:(c.webkitMaskImage||c.maskImage||''),sl:Math.round(t.scrollLeft),over:t.scrollWidth>t.clientWidth,loupeIn:!!t.querySelector('.ic-mot-loupe')}; });
    let m0=await mk(); ok(T+'маска вкладок: в начале списка слева затухания нет, справа есть (24px)',m0.over&&m0.ml==='0px'&&m0.mr==='24px'&&/linear-gradient/.test(m0.mask)&&!m0.loupeIn,JSON.stringify(m0));
    await p.evaluate(()=>{ document.querySelector('.ic-mot-tabs').scrollLeft=120; }); await W(300); let m1=await mk(); ok(T+'маска вкладок: в середине затухание с обеих сторон',m1.ml==='24px'&&m1.mr==='24px',JSON.stringify(m1));
    await p.evaluate(()=>{ const t=document.querySelector('.ic-mot-tabs'); t.scrollLeft=t.scrollWidth; }); await W(300); let m2=await mk(); ok(T+'маска вкладок: в конце справа затухания нет, слева есть',m2.ml==='24px'&&m2.mr==='0px',JSON.stringify(m2));
    const edge=await p.evaluate(()=>{ const t=document.querySelector('.ic-mot-tabs'), r=t.getBoundingClientRect(), l=document.querySelector('.ic-mot-loupe').getBoundingClientRect(); return {gap:Math.round(l.left-r.right)}; }); ok(T+'лупа отдельно от прокручиваемой области (не внутри маски)',edge.gap>=-1,JSON.stringify(edge));
    await p.evaluate(()=>{ document.querySelector('.ic-mot-tabs').scrollLeft=0; }); await W(300);
    await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="персонаж"]').click()); await W(900);
    const vis=await p.evaluate(()=>{ const t=document.querySelector('.ic-mot-tabs'), r=t.getBoundingClientRect(), b=document.querySelector('.ic-mot-tab[aria-pressed="true"]').getBoundingClientRect(); return {sl:Math.round(t.scrollLeft),inside:b.left>=r.left-1&&b.right<=r.right+1,txt:document.querySelector('.ic-mot-tab[aria-pressed="true"]').textContent}; });
    ok(T+'выбор дальней вкладки плавно прокручивает её в видимую область',vis.inside&&vis.sl>50,JSON.stringify(vis));
    await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="all"]').click()); await W(900);
  }
  ok(T+'справа лупа',await p.evaluate(()=>{ const l=document.querySelector('.ic-mot-loupe').getBoundingClientRect(), t=document.querySelector('.ic-mot-tabs').getBoundingClientRect(); return l.left>=t.right-1 && l.height>=38; }));
  const bb0=await p.evaluate(()=>{ const b=document.querySelector('.ic-mot-bookbtn'), box=document.querySelector('.ic-mot-bk'), r=b&&b.getBoundingClientRect(), br=box.getBoundingClientRect(), sub=document.querySelector('.ic-mot-sub').getBoundingClientRect(), c=getComputedStyle(box), col=document.querySelector('.ic-mot-pane, .ic-pane[data-pane="motifs"] .ic-mot-body').getBoundingClientRect(); return {t:b.textContent.trim(),h:Math.round(r.height),rad:c.borderRadius,bw:c.borderTopWidth,under:br.top>=sub.bottom-1,w:Math.round(br.width),colW:Math.round(col.width),exp:b.getAttribute('aria-expanded'),hidden:document.querySelector('.ic-mot-bkbody').hidden,chips:document.querySelectorAll('.ic-mot-chip,#ic-mot-bsheet').length}; });
  ok(T+'выбор книги: раскрывающееся поле «Книги: все» под пояснением, во всю ширину колонки, заголовок 44, рамка 1px, скругление 10, свёрнуто (aria-expanded=false); чипов и шторки нет',bb0.t==='Книги: все'&&bb0.h===44&&bb0.rad==='10px'&&bb0.bw==='1px'&&bb0.under&&Math.abs(bb0.w-bb0.colW)<=2&&bb0.exp==='false'&&bb0.hidden&&bb0.chips===0,JSON.stringify(bb0));
  // каталог
  const cat=await p.evaluate(()=>({h1:document.querySelector('.ic-rp-h1').textContent,sub:document.querySelector('.ic-mot-sub').textContent,sects:[...document.querySelectorAll('.ic-mot-sect')].map(s=>({h:s.querySelector('.ic-mot-sh span').textContent,n:s.querySelector('.ic-mot-sh').textContent.replace(s.querySelector('.ic-mot-sh span').textContent,''),tiles:s.querySelectorAll('.ic-mot-tile').length,btn:s.querySelector('.ic-mot-allbtn').textContent,btnW:Math.round(s.querySelector('.ic-mot-allbtn').getBoundingClientRect().width),secW:Math.round(s.getBoundingClientRect().width)})),tile:(()=>{ const t=document.querySelector('.ic-mot-tile'),r=t.getBoundingClientRect(),c=getComputedStyle(t); return {h:Math.round(r.height),rad:c.borderRadius,bw:c.borderTopWidth}; })(),cols:(()=>{ const t=[...document.querySelectorAll('.ic-mot-sect:first-of-type .ic-mot-tile')].map(x=>Math.round(x.getBoundingClientRect().left)); return [...new Set(t)].length; })()}));
  ok(T+'каталог: заголовок «Мотивы» и пояснение',cat.h1==='Мотивы'&&/Поиск гравюр/.test(cat.sub),cat.h1+' | '+cat.sub);
  ok(T+'разделы по порядку, пустые не показаны',cat.sects.map(s=>s.h).join()===want.slice(1).join(),cat.sects.map(s=>s.h).join());
  ok(T+'до 8 плиток в разделе, по 2 в ряд',cat.sects.every(s=>s.tiles>=1&&s.tiles<=8)&&cat.sects[0].tiles===8&&cat.cols===2,JSON.stringify(cat.sects.map(s=>s.tiles))+' cols '+cat.cols);
  ok(T+'плитка: ≈52 px, скругление 8, тонкая рамка',cat.tile.h>=50&&cat.tile.h<=64&&cat.tile.rad==='8px'&&cat.tile.bw==='1px',JSON.stringify(cat.tile));
  ok(T+'кнопка «Все предметы · N» во всю ширину',/^Все предметы · \d+$/.test(cat.sects[0].btn)&&cat.sects[0].btnW>=cat.sects[0].secW-2&&cat.sects.every(x=>x.n===''),cat.sects[0].btn+' / заголовок «'+cat.sects[0].h+cat.sects[0].n+'»');
  const first=await p.$$eval('.ic-mot-sect:first-of-type .ic-mot-tile',r=>r.map(x=>x.querySelector('.ic-mot-nm').textContent+':'+x.querySelector('.ic-mot-n').textContent));
  ok(T+'первый — «Венок», по частоте, названия с заглавной',/^Венок:(8\d|9\d|1\d\d)$/.test(first[0])&&first.every(x=>/^[А-ЯЁ]/.test(x)),first.slice(0,3).join(', '));
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
  ok(T+'поиск «вен» (короче 4 символов): только с начала слов',rows.length>=5&&rows.every(x=>/(^|[\s-,])вен/i.test(x)),rows.slice(0,6).join(', '));
  await p.fill(q,'мея'); await W(400);
  const mey=await p.$$eval('.ic-mot-tile .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'«мея» (3 символа) внутри слова не ищется',mey.length===0,mey.join(', '));
  await p.fill(q,'ноград'); await W(400);
  const ing=await p.$$eval('.ic-mot-tile .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'«ноград» (с 4 символов) — вхождение внутри слова находит «виноград…»',ing.length>0&&ing.every(x=>/виноград/i.test(x)),ing.join(', '));
  await p.fill(q,'zzzqqq'); await W(400);
  const none=await p.$eval('.ic-mot-body .ic-mot-nf',e=>e.innerText).catch(()=>null);
  ok(T+'ничего нет — «Мотив не найден» и ссылка поиска по текстам книг',/Мотив не найден/.test(none||'')&&/Искать «zzzqqq» в текстах книг/.test(none||''),String(none).replace(/\n+/g,' | '));
  await tap('.ic-mot-findx'); await W(500);
  const cl=await p.evaluate(()=>({tabs:getComputedStyle(document.querySelector('.ic-mot-tabs')).display!=='none',q:document.querySelector('.ic-mot-findin').value,cat:document.querySelectorAll('.ic-mot-sect').length>0}));
  ok(T+'крестик закрывает поле, возвращает вкладки и каталог',cl.tabs&&cl.q===''&&cl.cat,JSON.stringify(cl));
  // страница мотива
  await p.goto(BASE+'#/motifs'); await W(2000);
  await p.evaluate(()=>{ window.scrollTo(0,500); window.__y=-1; addEventListener('click',()=>{ window.__y=Math.round(scrollY); },true); }); await W(500);
  await p.evaluate(()=>document.querySelector('.ic-mot-tile[data-id="wreath"]').click()); await W(3000); ok(T+'тап по плитке → #/motifs/all/wreath',(await hash())==='#/motifs/all/wreath',await hash());
  const g=await p.evaluate(()=>({n:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length,cnt:document.querySelector('.ic-mot-count').textContent,h1:document.querySelector('.ic-mot-h1').textContent,cap:document.querySelector('.ic-gal-cap').textContent,small:document.querySelector('.ic-gal-cap small').textContent,kids:document.querySelectorAll('.ic-mot-kids .ic-mot-tag').length,back:!!document.querySelector('.ic-mot-back'),loupe:!!document.querySelector('.ic-mot-loupe'),cols:[...new Set([...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].slice(0,6).map(x=>Math.round(x.getBoundingClientRect().left)))].length,tabs:document.querySelectorAll('.ic-mot-tab').length,on:document.querySelector('.ic-mot-bt a.on').textContent.trim()}));
  ok(T+'мотив: название с заглавной, «N гравюр · Иконология»',g.h1==='Венок'&&/^\d+ гравюр · Иконология, Образы богов древних$/.test(g.cnt)&&g.n>=70,JSON.stringify([g.h1,g.cnt,g.n]));
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
  await tap('.ic-mot-grid .ic-gal-item[data-id="'+idc+'"]'); await W(2500); ok(T+'тап по гравюре открывает карточку',new RegExp('#/iconologie/'+idc+'([?]from=.*)?$').test(await hash()),await hash());
  const tags=await p.$$eval('.ic-mot-sec .ic-mot-tag',a=>a.map(x=>({t:x.textContent,h:x.getBoundingClientRect().height,href:x.getAttribute('href')}))); ok(T+'метки мотивов на карточке',tags.length>=1&&tags.every(x=>x.h>=43.5&&/^#\/motifs\/iconologie\//.test(x.href)),JSON.stringify(tags.slice(0,3)));
  const aft=await p.evaluate(()=>{ const s=[...document.querySelectorAll('.ic-sec')]; const i=s.findIndex(x=>x.classList.contains('ic-mot-sec')); return {i,prev:i>0&&s[i-1].querySelector('h3').textContent}; }); ok(T+'метки после «Что изображено»',aft.prev==='Что изображено',JSON.stringify(aft));
  await p.goBack(); await W(2500); const y0=await p.evaluate(()=>window.__y), y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'«назад» возвращает в сетку на то же место',(await hash())==='#/motifs/iconologie/wreath'&&Math.abs(y1-y0)<=40,y0+' → '+y1);
  await p.goto(BASE+'#/iconologie/p1-1'); await W(2500); const t0=await p.$('.ic-mot-sec .ic-mot-tag'); const th=await t0.getAttribute('href'); await tap('.ic-mot-sec .ic-mot-tag'); await W(2200); ok(T+'метка карточки ведёт на #/motifs/iconologie/<id>',(await hash())===th,th+' vs '+await hash());
  // главная Иконологии без изменений
  await p.goto(BASE+'#/iconologie'); await W(2500); const tiles=await p.$$eval('.ic-home-tile',a=>a.map(x=>({t:x.querySelector('b').textContent,href:x.getAttribute('href')}))); ok(T+'третья плитка «Мотивы» на главной Иконологии',tiles.length===3&&tiles[2].t==='Мотивы'&&tiles[2].href==='#/motifs/iconologie',JSON.stringify(tiles));
  await tap('.ic-home-tile:nth-child(3)'); await W(2500); ok(T+'плитка открывает #/motifs/iconologie',(await hash())==='#/motifs/iconologie');
  // разделители с затуханием (v250): псевдоэлемент ::after с градиентом вместо border-image
  await p.goto(BASE+'#/'); await p.waitForSelector('.ic-lib-row',{timeout:30000}); await W(2500);
  const dv=await p.evaluate(()=>{ const li=document.querySelectorAll('.ic-lib-row')[1], c=getComputedStyle(li), a=getComputedStyle(li,'::after'); li.scrollIntoView({block:'center'}); const r=li.getBoundingClientRect(); return {bi:c.borderImageSource,bb:c.borderBottomColor,bw:c.borderBottomWidth,pos:a.position,h:a.height,bg:a.backgroundImage.slice(0,160),bottom:a.bottom,left:a.left,right:a.right,rect:[r.left,r.top,r.right,r.bottom]}; });
  ok(T+'разделитель строки списка: border-image нет, border прозрачный, ::after 1px с градиентом (transparent → цвет → transparent)',dv.bi==='none'&&/transparent|rgba\(0, 0, 0, 0\)/.test(dv.bb)&&dv.bw==='1px'&&dv.pos==='absolute'&&dv.h==='1px'&&/linear-gradient/.test(dv.bg)&&/rgba\(0, 0, 0, 0\)|transparent/.test(dv.bg),JSON.stringify(dv));
  await W(300); const shd=await p.screenshot(); const dv2=await p.evaluate(()=>{ const li=document.querySelectorAll('.ic-lib-row')[1], r=li.getBoundingClientRect(); return {l:r.left,r:r.right,y:r.bottom-0.5}; });
  const px=await p.evaluate(async ([b64,pts])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=im.width/innerWidth; return pts.map(([px,py])=>{ const d=x.getImageData(Math.round(px*k),Math.round(py*k),1,1).data; return Math.round(0.3*d[0]+0.59*d[1]+0.11*d[2]); }); },[shd.toString('base64'),[[dv2.l+1,dv2.y],[(dv2.l+dv2.r)/2,dv2.y],[dv2.r-2,dv2.y],[dv2.l+1,dv2.y-6]]]);
  ok(T+'разделитель: у краёв прозрачность ≈ 0 (цвет как у фона), в середине линия заметно темнее',Math.abs(px[0]-px[3])<=18&&Math.abs(px[2]-px[3])<=18&&Math.min(px[0],px[2])-px[1]>=12,'края '+px[0]+'/'+px[2]+' фон '+px[3]+' центр '+px[1]);
  const biPages=[]; for(const pg of ['#/','#/motifs','#/iconologie/list','#/cartari/index']){ await p.goto(BASE+pg); await W(pg==='#/'?2500:3500); biPages.push(pg+':'+await p.evaluate(()=>{ let n=0; document.querySelectorAll('#iconologie *').forEach(e=>{ const c=getComputedStyle(e); if(c.borderImageSource&&c.borderImageSource!=='none') n++; }); return n; })); }
  ok(T+'нигде в приложении нет border-image (главная, «Мотивы», список Рипы, указатель Картари)',biPages.every(x=>/:0$/.test(x)),biPages.join(' '));
  // заголовок раздела каталога — обычный заголовок, без полосы и абсолютного позиционирования (v246–v249: класс тени совпал с классом заголовка)
  await p.goto(BASE+'#/motifs'); await W(2500); const sh1=await p.evaluate(()=>{ const h=document.querySelector('h2.ic-mot-sh'), c=getComputedStyle(h); return {pos:c.position,bg:c.backgroundImage,h:Math.round(h.getBoundingClientRect().height)}; });
  ok(T+'заголовок раздела каталога: не абсолютный, без фона-градиента',sh1.pos==='static'&&sh1.bg==='none'&&sh1.h<40,JSON.stringify(sh1));
  // шапка уезжает нативно (v251, HANDOFF раздел 10): «Библиотека» и переключатель — часть страницы, прилипает только строка разделов
  await p.goto(BASE+'#/motifs'); await W(2500);
  const flowGeo=async y=>{ await p.evaluate(y=>window.scrollTo(0,y),y); await W(350); return p.evaluate(()=>{ const r=e=>e.getBoundingClientRect(), bbE=document.querySelector('.back-bar'), bb=r(bbE), bt=r(document.getElementById('ic-booktabs')), rw=r(document.querySelector('.ic-mot-rwrap')), t=r(document.querySelector('.ic-mot-tile')); return {y:Math.round(scrollY),bbT:Math.round(bb.top),btB:Math.round(bt.bottom),rwT:Math.round(rw.top),rwH:Math.round(rw.height),tile:t.top+scrollY,bbPos:getComputedStyle(bbE).position,tr:getComputedStyle(bbE).transform,cls:[document.documentElement.className,bbE.className,document.getElementById('ic-stack').className,document.getElementById('ic-booktabs').className,document.getElementById('ic-rbar').className].join('|'),bg:getComputedStyle(document.documentElement).backgroundColor}; }); };
  const gg=[]; for(const y of [0,600,450,900,300,0]) gg.push(await flowGeo(y));
  ok(T+'после прокрутки вниз наверху только строка разделов (прилипла к 0), её высота постоянна',gg.slice(1,5).every(g=>Math.abs(g.rwT)<=1&&g.rwH===gg[0].rwH),JSON.stringify(gg.map(g=>[g.y,g.rwT,g.rwH])));
  ok(T+'«Библиотека» и переключатель — часть страницы: при прокрутке вверх не выскакивают (уходят вместе с прокруткой), без transform',gg.slice(1,5).every(g=>Math.abs(g.bbT+g.y)<=1&&g.btB<0&&g.bbPos==='relative'&&g.tr==='none'),JSON.stringify(gg.map(g=>[g.y,g.bbT,g.btB,g.bbPos])));
  ok(T+'содержимое не прыгает: позиция плитки в документе постоянна при любой прокрутке',gg.every(g=>Math.abs(g.tile-gg[0].tile)<=1.5),gg.map(g=>Math.round(g.tile)).join(','));
  ok(T+'возврат наверх: шапка на месте, как в начале',gg[5].bbT===gg[0].bbT&&gg[5].rwT===gg[0].rwT&&gg[0].bbT===0,JSON.stringify([gg[0].bbT,gg[5].bbT,gg[0].rwT,gg[5].rwT]));
  ok(T+'нет следов старого скрытия (ic-bb-hidden, ic-stack-hidden, ic-rbar-snap), html — ic-flow-page и тёмный фон (нет щели при оттягивании)',gg.every(g=>!/ic-bb-hidden|ic-stack-hidden|ic-rbar-snap/.test(g.cls)&&/ic-flow-page/.test(g.cls)&&/ic-stack-flow/.test(g.cls)&&g.bg==='rgb(22, 19, 15)'),gg[1].cls+' '+gg[1].bg);
  const rbw=await p.evaluate(()=>{ const r=document.querySelector('.ic-mot-rwrap .ic-rbar').getBoundingClientRect(); return [Math.round(r.left),Math.round(r.width),innerWidth]; }); ok(T+'тёмная строка разделов — во всю ширину экрана (нет бумаги по краям)',rbw[0]===0&&rbw[1]===rbw[2],JSON.stringify(rbw));
  // после перехода с главной (прокрутка главной вниз, потом «Мотивы»)
  await p.goto(BASE+'#/'); await p.waitForSelector('.ic-lib-row',{timeout:30000}); await W(2500); await p.evaluate(()=>window.scrollTo(0,300)); await W(400);
  await p.evaluate(()=>document.querySelector('.ic-mot-cap a[href="#/motifs"]').click()); await W(1800);
  const gf=await flowGeo(0), gf2=await flowGeo(700), gf3=await flowGeo(500);
  ok(T+'после перехода с главной (нажато не вверху → главная сначала наверх без анимации): шапка нативная, следов скрытия нет, строка прилипает',gf.y===0&&!/ic-bb-hidden|ic-stack-hidden/.test(gf.cls)&&gf2.rwT===0&&gf2.bbT===-700&&gf3.bbT===-500&&gf3.btB<0&&Math.abs(gf3.tile-gf.tile)<=1.5,JSON.stringify([gf,gf2.bbT,gf3.bbT]));
  await p.evaluate(()=>window.scrollTo(0,0)); await W(300);
  await p.goto(BASE+'#/'); await W(1500); const homeCls=await p.evaluate(()=>({flow:document.documentElement.classList.contains('ic-flow-page'),pos:getComputedStyle(document.querySelector('.ic-stack')).position}));
  ok(T+'главная библиотеки (v258): та же схема, что «Мотивы» — шапка нативная (ic-flow-page, стек не липкий), без скриптов скрытия',homeCls.flow&&homeCls.pos==='static',JSON.stringify(homeCls));
  // страница мотива: в строке стрелка, по центру название и число, лупа справа
  for(const [l,want] of [['ru','Венок · 80 гравюр'],['en','Wreath · 80 engravings'],['fr','Couronne · 80 gravures']]){
    await p.goto(BASE+'#/motifs'); await setLang(l); await p.goto(BASE+'#/motifs/iconologie/wreath'); await W(3000);
    const mt=await p.evaluate(()=>{ const t=document.querySelector('.ic-mot-ttl'), c=getComputedStyle(t), r=t.getBoundingClientRect(), b=document.querySelector('.ic-mot-back').getBoundingClientRect(), lo=document.querySelector('.ic-mot-loupe').getBoundingClientRect(); return {txt:t.textContent,ov:c.overflow,ws:c.whiteSpace,te:c.textOverflow,center:Math.abs((r.left+r.right)/2-innerWidth/2)<=40,between:r.left>=b.right-1&&r.right<=lo.left+1,h1:document.querySelector('.ic-mot-h1').textContent,cnt:document.querySelector('.ic-mot-count').textContent}; });
    ok(T+l+': строка страницы мотива — «'+want+'» по центру, одна строка, многоточие; большой заголовок остаётся',mt.txt===want&&mt.ov==='hidden'&&mt.ws==='nowrap'&&mt.te==='ellipsis'&&mt.center&&mt.between&&mt.h1.length>0,JSON.stringify(mt));
  }
  await p.goto(BASE+'#/motifs'); await setLang('ru'); await W(500);
  // подписи чисел: в заголовках разделов чисел нет (число видов — на тёмной кнопке раздела), плитка — число гравюр, родитель с названием раздела
  for(const [l,wp,pl,btn] of [['ru','Оружие, всё','Растение, всё',/^Все предметы · \d+$/],['en','All weapons','All plants',/^All objects · \d+$/],['fr','Toutes les armes','Toutes les plantes',/^Tous les objets · \d+$/]]){
    await p.goto(BASE+'#/motifs'); await setLang(l); await W(500);
    const nn=await p.evaluate(()=>({shn:document.querySelectorAll('.ic-mot-shn').length,hs:[...document.querySelectorAll('.ic-mot-sect .ic-mot-sh')].map(h=>h.textContent),btn:document.querySelector('.ic-mot-allbtn').textContent,w:(document.querySelector('.ic-mot-tile[data-id="weapon"]')||{}).textContent,tn:[...document.querySelectorAll('.ic-mot-tile .ic-mot-n')].every(e=>/^\d+$/.test(e.textContent))}));
    await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="растение"]').click()); await W(500); nn.p=await p.evaluate(()=>(document.querySelector('.ic-mot-tile[data-id="plant"]')||{textContent:''}).textContent); nn.h1=await p.evaluate(()=>document.querySelector('.ic-mot-sh1').textContent); await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="all"]').click()); await W(300);
    ok(T+l+': в заголовках разделов чисел нет, число видов — на кнопке раздела, совпадающие по названию родители, числа на плитках — числа гравюр',nn.shn===0&&nn.hs.length===9&&nn.hs.every(x=>!/\d/.test(x))&&!/\d/.test(nn.h1)&&btn.test(nn.btn)&&nn.w.startsWith(wp)&&nn.p.startsWith(pl)&&nn.tn,JSON.stringify([nn.hs.slice(0,3),nn.btn,nn.w,nn.p]));
  }
  await p.goto(BASE+'#/motifs'); await setLang('ru'); await W(500);
  {
  // ---- v252: контекст мотива в статье, шапка сразу, миниатюры, фокус плиток, «ещё N» ----
  await p.goto(BASE+'#/motifs'); await setLang('ru'); await W(500);
  await p.goto(BASE+'#/motifs/iconologie/heart'); await W(3000);
  const hi=await p.evaluate(()=>[...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].map(a=>a.dataset.id));
  const k0=Math.min(6,hi.length-2), idk=hi[k0];
  await p.evaluate(()=>{ window.scrollTo(0,500); }); await W(400); const yg=await p.evaluate(()=>{ window.__y=Math.round(scrollY); return window.__y; });
  await p.evaluate(id=>document.querySelector('.ic-mot-grid .ic-gal-item[data-id="'+id+'"]').click(),idk); await W(2500);
  const h1=await hash(); ok(T+'статья из мотива: адрес с контекстом ?from=motif:<книги>:<мотив>',new RegExp('#/iconologie/'+idk+'[?]from=motif:iconologie:heart$').test(h1),h1);
  const cap=await p.evaluate(()=>(document.querySelector('.ic-rp-mcap')||{}).textContent);
  ok(T+'подпись пейджера «Сердце, N из M» (номер по порядку сетки)',cap==='Сердце, '+(k0+1)+' из '+hi.length,String(cap));
  const nx=await p.evaluate(()=>{ const b=document.querySelector('.ic-rbar-nv[data-nav="next"]'); return b&&b.getAttribute('data-go'); });
  ok(T+'«След.» ведёт к следующей гравюре мотива по порядку сетки',nx===hi[k0+1],nx+' vs '+hi[k0+1]);
  await p.evaluate(()=>document.querySelector('.ic-rbar-nv[data-nav="next"]').click()); await W(2000);
  const h2=await hash(), cap2=await p.evaluate(()=>(document.querySelector('.ic-rp-mcap')||{}).textContent);
  ok(T+'после «След.»: следующая гравюра, контекст сохранён, подпись обновилась',new RegExp('#/iconologie/'+hi[k0+1]+'[?]from=motif:iconologie:heart$').test(h2)&&cap2==='Сердце, '+(k0+2)+' из '+hi.length,h2+' | '+cap2);
  await p.evaluate(()=>document.querySelector('.ic-bt-back').click()); await W(2500);
  const hb=await hash(), yb=await p.evaluate(()=>Math.round(scrollY));
  ok(T+'стрелка «назад» в статье из мотива: страница этого мотива на то же место сетки (не «Гравюры» Рипы)',hb==='#/motifs/iconologie/heart'&&Math.abs(yb-yg)<=60,hb+' y '+yg+' → '+yb);
  await p.evaluate(id=>document.querySelector('.ic-mot-grid .ic-gal-item[data-id="'+id+'"]').click(),idk); await W(2200);
  await p.goBack(); await W(2500); const hb2=await hash(), yb2=await p.evaluate(()=>Math.round(scrollY));
  ok(T+'кнопка «Назад» браузера из статьи: та же страница мотива и то же место',hb2==='#/motifs/iconologie/heart'&&Math.abs(yb2-yg)<=60,hb2+' y '+yg+' → '+yb2);
  // прямой заход на статью с контекстом (без истории): стрелка ведёт на страницу мотива
  await p.goto(BASE+'#/iconologie/'+idk+'?from=motif:iconologie:heart'); await W(3500);
  const dcap=await p.evaluate(()=>(document.querySelector('.ic-rp-mcap')||{}).textContent); await p.evaluate(()=>document.querySelector('.ic-bt-back').click()); await W(2000);
  ok(T+'статья по прямой ссылке с контекстом: подпись есть, стрелка ведёт на страницу мотива',dcap==='Сердце, '+(k0+1)+' из '+hi.length&&(await hash())==='#/motifs/iconologie/heart',dcap+' → '+await hash());
  // обычный путь из книги — как раньше
  await p.goto(BASE+'#/iconologie/p1-1'); await W(2500);
  const plain=await p.evaluate(()=>({cap:!!document.querySelector('.ic-rp-mcap'),next:document.querySelector('.ic-rbar-nv[data-nav="next"]').getAttribute('data-go')}));
  ok(T+'статья, открытая обычным путём: без подписи мотива, «След.» — следующая статья книги (p1-2)',!plain.cap&&plain.next==='p1-2',JSON.stringify(plain));
  // миниатюры первого экрана
  await p.goto(BASE+'#/motifs/iconologie/wreath'); await W(3000);
  const th=await p.evaluate(()=>[...document.querySelectorAll('.ic-mot-grid img')].slice(0,6).map(i=>[i.getAttribute('fetchpriority'),i.getAttribute('loading')]));
  ok(T+'первые 4 миниатюры: fetchpriority=high без lazy; дальше lazy',th.slice(0,4).every(x=>x[0]==='high'&&x[1]===null)&&th.slice(4).every(x=>x[1]==='lazy'),JSON.stringify(th));
  // первый заход на мотив: шапка сразу, «Загрузка» только в области сетки
  const pg=await ctx.newPage(); await pg.route(/books\/iconologie\/book\.json/, async r=>{ await new Promise(x=>setTimeout(x,2500)); try{ await r.continue(); }catch(e){} });
  await pg.goto(BASE+'#/motifs/iconologie/wreath'); await W(900);
  const early=await pg.evaluate(()=>({hdr:!!document.querySelector('.back-bar')&&!!document.querySelector('.ic-mot-cap'),strip:(document.querySelector('.ic-mot-ttl')||{}).textContent,h1:(document.querySelector('.ic-mot-h1')||{}).textContent,wait:!!document.querySelector('.ic-mot-wait'),fullLoading:!!document.querySelector('#iconologie > .ic-loading'),grid:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length}));
  ok(T+'первый заход на мотив: шапка, переключатель, строка с названием и заголовок — сразу; «Загрузка» только в области сетки',early.hdr&&/Венок · 80 гравюр/.test(early.strip||'')&&early.h1==='Венок'&&early.wait&&!early.fullLoading&&early.grid===0,JSON.stringify(early));
  await pg.waitForSelector('.ic-mot-grid .ic-gal-item',{timeout:20000}); const late=await pg.evaluate(()=>({n:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length,wait:!!document.querySelector('.ic-mot-wait')}));
  ok(T+'после загрузки сетка на месте, «Загрузка» исчезла',late.n>=70&&!late.wait,JSON.stringify(late)); await pg.close();
  // плитки и метки не остаются нажатыми после возврата
  await p.goto(BASE+'#/motifs'); await W(2500); await p.evaluate(()=>document.querySelector('.ic-mot-tile[data-id="wreath"]').click()); await W(2500); await p.goBack(); await W(2500);
  const pr=await p.evaluate(()=>{ const t=[...document.querySelectorAll('.ic-mot-tile, .ic-mot-tag, .ic-mot-allbtn')]; const bgs=new Set(t.filter(x=>x.classList.contains('ic-mot-tile')).map(x=>getComputedStyle(x).backgroundColor)); return {n:t.length,bgs:[...bgs],ae:document.activeElement&&document.activeElement.tagName,pressed:t.filter(x=>x.matches(':focus, :active')).length}; });
  ok(T+'после перехода и возврата ни одна плитка не остаётся нажатой (фокус снят, один цвет фона)',pr.n>20&&pr.bgs.length===1&&pr.ae==='BODY'&&pr.pressed===0,JSON.stringify(pr));
  await p.goto(BASE+'#/iconologie/p1-1'); await W(2500); await p.evaluate(()=>document.querySelector('.ic-mot-sec .ic-mot-tag').click()); await W(2500); await p.goBack(); await W(2500);
  const pr2=await p.evaluate(()=>({tags:[...document.querySelectorAll('.ic-mot-tag')].filter(x=>x.matches(':focus, :active')).length,ae:document.activeElement&&document.activeElement.tagName}));
  ok(T+'после возврата на карточку метка мотива не нажата',pr2.tags===0&&pr2.ae==='BODY',JSON.stringify(pr2));
  // «ещё N» у мотива с большим числом вложенных («Птица»)
  await p.goto(BASE+'#/motifs/iconologie/bird'); await W(3000);
  const bk=await p.evaluate(()=>({tags:document.querySelectorAll('.ic-mot-kids .ic-mot-tag').length,vis:[...document.querySelectorAll('.ic-mot-kids .ic-mot-tag')].filter(e=>getComputedStyle(e).display!=='none').length,more:(document.querySelector('.ic-mot-more')||{}).textContent,h:document.querySelector('.ic-mot-more')&&Math.round(document.querySelector('.ic-mot-more').getBoundingClientRect().height)}));
  ok(T+'«Птица»: первые 10 меток и кнопка «ещё N» (≥44px)',bk.tags>10&&bk.vis===10&&bk.more==='ещё '+(bk.tags-10)&&bk.h>=44,JSON.stringify(bk));
  await p.evaluate(()=>document.querySelector('.ic-mot-more').click()); await W(400);
  const bk2=await p.evaluate(()=>({vis:[...document.querySelectorAll('.ic-mot-kids .ic-mot-tag')].filter(e=>getComputedStyle(e).display!=='none').length,more:!!document.querySelector('.ic-mot-more')}));
  ok(T+'тап по «ещё N» раскрывает остальные метки на месте, кнопка исчезает',bk2.vis===bk.tags&&!bk2.more,JSON.stringify(bk2));
  }
  // языки
  for(const [l,books,motifs,find,all1,sub,first] of [['en','Books','Motifs','Find a motif','All objects','Find engravings by the objects they show','Wreath'],['fr','Livres','Motifs','Chercher un motif','Tous les objets','Chercher des gravures par les objets représentés','Couronne'],['ru','Книги','Мотивы','Найти мотив','Все предметы','Поиск гравюр по изображённым предметам','Венок']]){
   await p.goto(BASE+'#/motifs'); await setLang(l); await W(500);
   const o=await p.evaluate(()=>({tg:[...document.querySelectorAll('.ic-mot-cap a')].map(x=>x.textContent.trim()),ph:document.querySelector('.ic-mot-findin').placeholder,btn:document.querySelector('.ic-mot-allbtn').textContent,sub:document.querySelector('.ic-mot-sub').textContent,first:document.querySelector('.ic-mot-nm').textContent,w:[...document.querySelectorAll('.ic-mot-cap a')].map(x=>Math.round(x.getBoundingClientRect().width)).join()}));
   ok(T+l+': переключатель, поиск, кнопка, пояснение, мотив',o.tg.join()===[books,motifs].join()&&o.ph===find&&o.btn.startsWith(all1+' · ')&&o.sub===sub&&o.first===first&&o.w.split(',').every(x=>Math.abs(+x-139)<=1),JSON.stringify(o));
   await p.goto(BASE+'#/'); await W(1500); const h=await p.$$eval('.ic-mot-cap a',a=>a.map(x=>x.textContent.trim()+(x.classList.contains('on')?'*':'')).join()); ok(T+l+': главная — переключатель',h.toLowerCase()===(books+'*,'+motifs).toLowerCase(),h);
  }
  await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2000); const lab=await p.evaluate(()=>[document.querySelector('.ic-mot-h1').textContent,document.querySelector('.ic-mot-count').textContent]); ok(T+'ru: мотив «Змея»',lab[0]==='Змея'&&/гравюр/.test(lab[1]),lab.join(' | '));
  if(!process.env.NOSHOT){ await p.goto(BASE+'#/'); await W(1500); await p.screenshot({path:path.join(OUT,'motifs-home-'+vp.name+'.png')}); await p.goto(BASE+'#/motifs'); await W(1500); await p.screenshot({path:path.join(OUT,'motifs-cat-'+vp.name+'.png')}); await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2500); await p.screenshot({path:path.join(OUT,'motifs-grid-'+vp.name+'.png')}); }

  // ===== v259: общий словарь, привязки по книгам, фильтр книг, Картари в мотивах =====
  {
   const J=await p.evaluate(async()=>{ const g=u=>fetch('books/_motifs/'+u,{cache:'no-cache'}).then(r=>r.json()); const ix=await g('index.json'), v=await g(ix.vocab), bs=await Promise.all(ix.books.map(b=>g(b.file))); return {ix,v,bs}; });
   const V={}; J.v.motifs.forEach(m=>V[m.id]=m);
   ok(T+'словарь и обе привязки грузятся; index.json: путь к словарю, у книг слаг/файл/названия RU/EN/FR',J.ix.vocab==='motifs_vocab.json'&&J.ix.books.map(b=>b.slug).join()==='iconologie,cartari'&&J.ix.books.every(b=>b.file&&b.name.ru&&b.name.en&&b.name.fr)&&J.v.motifs.length>=450,JSON.stringify(J.ix.books.map(b=>b.name.ru)));
   ok(T+'словарь: у каждого id ru/en/fr, category, parent, children; 20 новых мотивов Картари на месте',J.v.motifs.every(m=>m.ru&&m.en&&m.fr&&m.category&&'parent' in m&&Array.isArray(m.children)&&(m.parent===null||V[m.parent]))&&['beard','horns','medallion','kalathos','sphinx','cerberus'].every(i=>V[i]),'мотивов '+J.v.motifs.length);
   const bk=J.bs.map(b=>Object.keys(b.bindings));
   ok(T+'привязки: только «id мотива → id», все id есть в словаре, счётчиков нет, у Картари id гравюр e####',bk.every(a=>a.every(i=>V[i]))&&J.bs.every(b=>Object.values(b.bindings).every(x=>Array.isArray(x)&&x.length))&&J.bs.every(b=>!('motifs' in b)&&!('count' in b))&&Object.values(J.bs[1].bindings).every(x=>x.every(i=>/^e\d{4}[a-z]?$/.test(i))),bk.map(a=>a.length).join('/'));
   ok(T+'мотива «рука» (hand) нет ни в словаре, ни в привязках; дочерние (поднятая рука и др.) остались без этого родителя',!V.hand&&bk.every(a=>a.indexOf('hand')<0)&&V['raised-hand']&&V['raised-hand'].parent===null&&V['pointing-hand']&&V['hand-on-chest'],'');
  }
  {
  await p.goto(BASE+'#/motifs'); await setLang('ru'); await p.waitForSelector('.ic-mot-bookbtn',{timeout:30000}); await W(1500);
  const nTile=async id=>p.evaluate(id=>{ const t=document.querySelector('.ic-mot-tile[data-id="'+id+'"]'); return t?+t.querySelector('.ic-mot-n').textContent:null; },id);
  const bk=()=>p.evaluate(()=>{ const bx=document.querySelector('.ic-mot-bk'), hd=bx.querySelector('.ic-mot-bookbtn'), body=bx.querySelector('.ic-mot-bkbody'), ch=getComputedStyle(bx.querySelector('.ic-mot-chev')).transform;
    return {open:bx.classList.contains('ic-open'),exp:hd.getAttribute('aria-expanded'),hl:hd.querySelector('.ic-mot-bkhl').textContent,hidden:body.hidden,h:Math.round(body.getBoundingClientRect().height),chev:ch,hdH:Math.round(hd.getBoundingClientRect().height),
      rows:[...body.querySelectorAll('.ic-mot-bkrow')].map(r=>{ const im=r.querySelector('img'), cb=r.querySelector('.ic-mot-cb'), cs=getComputedStyle(cb), nm=r.querySelector('.ic-mot-bknm'), n=r.querySelector('.ic-mot-bkn'); return {bk:r.dataset.bk,role:r.getAttribute('role'),on:r.getAttribute('aria-checked'),nm:nm.textContent,n:+n.textContent,nTab:getComputedStyle(n).fontVariantNumeric,h:Math.round(r.getBoundingClientRect().height),imgs:r.querySelectorAll('img').length,iw:im?Math.round(im.getBoundingClientRect().width):0,ih:im?Math.round(im.getBoundingClientRect().height):0,cw:Math.round(cb.getBoundingClientRect().width),chh:Math.round(cb.getBoundingClientRect().height),crad:cs.borderRadius,cbg:cs.backgroundColor,cbd:cs.borderTopWidth,ell:getComputedStyle(nm).textOverflow,small:r.querySelectorAll('small').length}; })}; });
  const hash2=()=>p.evaluate(()=>location.hash);
  const hdr=()=>p.evaluate(()=>document.querySelector('.ic-mot-bookbtn').click());
  const rowc=s=>p.evaluate(s=>document.querySelector('.ic-mot-bkrow[data-bk="'+s+'"]').click(),s);
  const cntAll=await nTile('wreath');
  // раскрытие и сворачивание: покадровая запись высоты поля и положения содержимого ниже
  const rec=`(()=>{ window.__f=[]; const body=document.querySelector('.ic-mot-bkbody'), below=document.querySelector('.ic-mot-sect, .ic-mot-grid, .ic-mot-sh1'); const f=()=>{ const r=body.getBoundingClientRect(); window.__f.push({t:performance.now(),h:body.hidden?0:r.height,y:below?below.getBoundingClientRect().top:0,tf:getComputedStyle(body.closest('.ic-pane')||document.body).transform,ro:[...body.querySelectorAll('.ic-mot-bkrow')].map(x=>+getComputedStyle(x).opacity)}); if(window.__f.length<80) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
  await p.evaluate(rec); await hdr(); await W(900);
  const fo=await p.evaluate(()=>window.__f), sh0=await bk();
  const hs=fo.map(x=>x.h), Hh=sh0.h, i0=hs.findIndex(v=>v>0), i1=hs.findIndex(v=>v>=Hh-0.5), ys=fo.slice(i0>0?i0-1:0,i1+1).map(x=>x.y), stepsY=ys.slice(1).map((v,i)=>Math.abs(v-ys[i])), msO=i1>=0&&i0>=0?fo[i1].t-fo[Math.max(0,i0-1)].t:0;
  ok(T+'раскрытие: высота растёт монотонно до полной ('+Hh+' px) за ≈280 мс (200–450), содержимое ниже съезжает без скачков (макс. шаг '+Math.max(0,...stepsY).toFixed(1)+' px за кадр ≤ 0,45 высоты), transform страницы нет, строки проявляются (opacity)',i0>=0&&i1>i0&&hs.slice(i0,i1+1).every((v,i,a)=>i===0||v>=a[i-1]-0.2)&&msO>=200&&msO<=450&&Math.max(0,...stepsY)<=Hh*0.45&&fo.every(x=>x.tf==='none')&&fo.slice(i0,i1).some(x=>x.ro.some(o=>o>0&&o<1)),JSON.stringify({Hh,msO:Math.round(msO),maxStep:Math.max(0,...stepsY),hs:hs.slice(i0,i1+1).map(Math.round).join(',')}));
  ok(T+'раскрыто: заголовок остаётся «Книги: все», aria-expanded=true, шеврон вверх; компактные строки 48 px (без второй строки), обложка 22×30, название с многоточием, число приглушённо (tabular-nums), чекбокс 22×22 скругление 6; «Все книги» — отмечена, обе книги отмечены; role=checkbox',sh0.open&&sh0.exp==='true'&&sh0.hl==='Книги: все'&&sh0.hdH===44&&/-1/.test(sh0.chev)&&sh0.rows.map(r=>r.bk).join()==='all,iconologie,cartari'&&sh0.rows.every(r=>r.role==='checkbox'&&r.h===48&&r.cw===22&&r.chh===22&&r.crad==='6px'&&r.ell==='ellipsis'&&r.small===0&&/tabular-nums/.test(r.nTab))&&sh0.rows.slice(1).every(r=>r.iw===22&&r.ih===30)&&sh0.rows[0].imgs===2&&sh0.rows[0].nm==='Все книги'&&sh0.rows[0].n===sh0.rows[1].n+sh0.rows[2].n&&sh0.rows.map(r=>r.on).join()==='true,true,true'&&sh0.rows.every(r=>r.cbg==='rgb(22, 19, 15)'),JSON.stringify(sh0).slice(0,500));
  // снятие одной книги: поле остаётся открытым, заголовок/числа/адрес меняются, у «Все книги» черта
  await rowc('cartari'); await W(900); const u1=await bk(), cI=await nTile('wreath');
  ok(T+'снята «Образы богов древних»: поле открыто, заголовок «Книги: Иконология», адрес #/motifs/iconologie, числа плиток пересчитаны (Венок 80), у «Все книги» черта (mixed), у Картари рамка без заливки',u1.open&&u1.hl==='Книги: Иконология'&&(await hash2())==='#/motifs/iconologie'&&cI===80&&u1.rows.map(r=>r.on).join()==='mixed,true,false'&&u1.rows[0].cbg==='rgb(22, 19, 15)'&&u1.rows[2].cbg!=='rgb(22, 19, 15)',JSON.stringify([u1.hl,u1.rows.map(r=>r.on).join(),cI]));
  await rowc('iconologie'); await W(500); const u2=await bk();
  ok(T+'последнюю отмеченную книгу снять нельзя (тап без изменений: адрес, заголовок и отметки прежние)',u2.hl==='Книги: Иконология'&&(await hash2())==='#/motifs/iconologie'&&u2.rows.map(r=>r.on).join()==='mixed,true,false',u2.rows.map(r=>r.on).join());
  await rowc('cartari'); await W(900); const u3=await bk(), cB=await nTile('wreath');
  ok(T+'отмечена снова вторая книга: набор из двух = «все» (адрес #/motifs, «Книги: все», числа вернулись), поле открыто',u3.open&&u3.hl==='Книги: все'&&(await hash2())==='#/motifs'&&cB===cntAll&&u3.rows.map(r=>r.on).join()==='true,true,true',JSON.stringify([u3.hl,await hash2(),cB]));
  await rowc('iconologie'); await W(800); await rowc('all'); await W(800); const u4=await bk();
  ok(T+'тап по «Все книги» при части отмеченных отмечает все (адрес #/motifs, числа вернулись); повторный тап ничего не меняет',u4.open&&u4.hl==='Книги: все'&&u4.rows.map(r=>r.on).join()==='true,true,true'&&(await hash2())==='#/motifs'&&(await nTile('wreath'))===cntAll,u4.rows.map(r=>r.on).join());
  await rowc('all'); await W(500); const u5=await bk(); ok(T+'«Все книги» при всех отмеченных — тап без изменений',u5.open&&u5.hl==='Книги: все'&&u5.rows.map(r=>r.on).join()==='true,true,true'&&(await hash2())==='#/motifs');
  // закрытие: тап по заголовку (сворачивается без изменений), тап вне поля, Escape
  await rowc('cartari'); await W(700);
  await p.evaluate(rec); await hdr(); await W(900);
  const fc=await p.evaluate(()=>window.__f), sh1=await bk(), hc=fc.map(x=>x.h), j0=hc.findIndex(v=>v<Hh-0.5), j1=hc.findIndex((v,i)=>i>j0&&v<=0.5);
  ok(T+'закрытие 1 — тап по заголовку: высота падает монотонно до 0, заголовок «Книги: Иконология», выбор и адрес прежние',!sh1.open&&sh1.exp==='false'&&sh1.hidden&&sh1.hl==='Книги: Иконология'&&hc.slice(j0,j1+1).every((v,i,a)=>i===0||v<=a[i-1]+0.2)&&j1>j0&&(await hash2())==='#/motifs/iconologie'&&!/-1/.test(sh1.chev),JSON.stringify({hc:hc.slice(j0,j1+1).map(Math.round).join(',')}));
  await hdr(); await W(700); await p.mouse.move(5,5); await p.evaluate(()=>document.querySelector('.ic-mot-sub').dispatchEvent(new MouseEvent('click',{bubbles:true}))); await W(700); const sh2=await bk();
  ok(T+'закрытие 2 — тап вне поля: свёрнуто, выбор прежний',!sh2.open&&sh2.hl==='Книги: Иконология'&&sh2.hidden&&(await hash2())==='#/motifs/iconologie');
  await hdr(); await W(600); await p.evaluate(()=>document.querySelector('.ic-mot-bookbtn').focus()); await p.keyboard.press('Escape'); await W(600); const sh3=await bk();
  ok(T+'закрытие 3 — Escape: свёрнуто, выбор прежний',!sh3.open&&sh3.exp==='false'&&sh3.hl==='Книги: Иконология');
  // тап по строке не сворачивает поле; затем «Все книги» → все
  await hdr(); await W(600); await rowc('all'); await W(900); const sv=await bk();
  ok(T+'после тапа по строке поле остаётся раскрытым; шапка поля «Книги: все»',sv.open&&sv.hl==='Книги: все'&&(await hash2())==='#/motifs');
  await hdr(); await W(600);
  await p.goto(BASE+'#/motifs/iconologie+cartari'); await p.waitForSelector('.ic-mot-bookbtn',{timeout:30000}); await W(1200);
  ok(T+'адрес «iconologie+cartari» = все книги (приводится к #/motifs, «Книги: все», числа общие)',(await hash())==='#/motifs'&&(await bk()).hl==='Книги: все'&&(await nTile('wreath'))===cntAll,await hash());
  await p.goto(BASE+'#/motifs/iconologie+cartari/snake'); await p.waitForSelector('.ic-mot-grid li',{timeout:40000}); await W(1500);
  ok(T+'адрес мотива «iconologie+cartari» → #/motifs/all/snake (гравюры обеих книг)',(await hash())==='#/motifs/all/snake'&&(await p.$$eval('.ic-mot-grid .ic-gal-item',a=>[...new Set(a.map(x=>x.dataset.slug))].sort().join()))==='cartari,iconologie',await hash());
  // страница мотива: то же поле под заголовком, выбор пересчитывает сетку на месте, поле остаётся открытым
  const mk=()=>p.evaluate(()=>({n:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length,sl:[...new Set([...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].map(a=>a.dataset.slug))].sort().join(),cnt:document.querySelector('.ic-mot-count').textContent,hl:document.querySelector('.ic-mot-bkhl').textContent,open:document.querySelector('.ic-mot-bk').classList.contains('ic-open'),h:location.hash,top:Math.round(document.querySelector('.ic-mot-bk').getBoundingClientRect().top)-Math.round(document.querySelector('.ic-mot-h1').getBoundingClientRect().bottom),cap:[...document.querySelectorAll('.ic-mot-grid small')].some(x=>/Иконология · |Образы богов древних · /.test(x.textContent))}));
  const m0=await mk();
  await hdr(); await W(800); const ms0=await bk();
  ok(T+'страница мотива: поле «Книги: все» под заголовком, раскрывается на месте (три строки по 48)',m0.hl==='Книги: все'&&m0.top>0&&ms0.open&&ms0.rows.length===3&&ms0.rows.every(r=>r.h===48)&&m0.cap,JSON.stringify([m0.hl,m0.top,ms0.open]));
  await rowc('cartari'); await W(900); const m1=await mk();
  await rowc('iconologie'); await W(500); const m1b=await mk();
  await rowc('cartari'); await W(900); const m2=await mk();
  await rowc('iconologie'); await W(900); const m3=await mk();
  ok(T+'на странице мотива снятие книги пересчитывает сетку и адрес на месте, поле открыто: без Картари → только Иконология (#/motifs/iconologie/snake); последнюю не снять; снова обе → все (#/motifs/all/snake), подписи книг; снята Иконология → только Картари',m1.h==='#/motifs/iconologie/snake'&&m1.sl==='iconologie'&&m1.hl==='Книги: Иконология'&&m1.open&&!m1.cap&&m1b.h===m1.h&&m1b.n===m1.n&&m2.sl==='cartari,iconologie'&&m2.h==='#/motifs/all/snake'&&m2.open&&m2.n===m0.n&&m1.n>3&&m1.n<m0.n&&m3.sl==='cartari'&&m3.h==='#/motifs/cartari/snake'&&m3.hl==='Книги: Образы богов древних'&&m1.n+m3.n===m0.n,JSON.stringify([m0.n,m1.n,m1b.n,m2.n,m3.n,m1.h,m2.h]));
  await p.goto(BASE+'#/motifs'); await p.waitForSelector('.ic-mot-bookbtn',{timeout:30000}); await W(1200);
  // «Позы и жесты»: рука как самостоятельного мотива нет
  await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="поза и жест"]').click()); await W(700);
  const poses=await p.$$eval('.ic-mot-tile',a=>a.map(x=>x.dataset.id));
  ok(T+'вкладка «Позы и жесты»: «руки» нет, дочерние на месте отдельными мотивами',poses.indexOf('hand')<0&&poses.indexOf('raised-hand')>=0,poses.slice(0,8).join());
  await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="all"]').click()); await W(300);
  // змея при «Все книги»: гравюры обеих книг с подписью книги; при одной книге подписи книги нет
  await p.goto(BASE+'#/motifs/all/snake'); await p.waitForSelector('.ic-mot-grid li',{timeout:40000}); await W(1500);
  const sn=await p.evaluate(()=>[...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].map(a=>({s:a.dataset.slug,id:a.dataset.id,cap:a.querySelector('small').textContent,href:a.getAttribute('href'),img:(a.querySelector('img')||{}).src})));
  const sl=new Set(sn.map(x=>x.s));
  ok(T+'«Змея» при «Все книги»: гравюры обеих книг, под каждой подпись книги, у Картари — адрес карточки гравюры с контекстом',sl.has('iconologie')&&sl.has('cartari')&&sn.every(x=>x.cap.indexOf(x.s==='cartari'?'Образы богов древних · ':'Иконология · ')===0)&&sn.filter(x=>x.s==='cartari').every(x=>/^#\/cartari\/plate\/e\d{4}\?from=motif:all:snake$/.test(x.href)&&/engravings\/thumb\/.+_t\.webp$/.test(x.img)),sn.length+' шт., Картари '+sn.filter(x=>x.s==='cartari').length);
  await p.goto(BASE+'#/motifs/cartari/snake'); await p.waitForSelector('.ic-mot-grid li',{timeout:40000}); await W(1200);
  const sc=await p.evaluate(()=>({caps:[...document.querySelectorAll('.ic-mot-grid small')].map(x=>x.textContent),cnt:document.querySelector('.ic-mot-count').textContent,sl:[...new Set([...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].map(a=>a.dataset.slug))].join()}));
  ok(T+'«Змея» при одной книге (Картари): без подписи книги, только гравюры Картари',sc.sl==='cartari'&&sc.caps.length>3&&sc.caps.every(x=>x.indexOf('Образы')<0&&x.indexOf('Иконология')<0)&&/Образы богов древних$/.test(sc.cnt),sc.cnt);
  // гравюра Картари из сетки: открытие, «назад» на то же место, «След.» по мотиву
  await p.goto(BASE+'#/motifs/all/snake'); await p.waitForSelector('.ic-mot-grid li',{timeout:40000}); await W(1500);
  const ids=await p.$$eval('.ic-mot-grid .ic-gal-item',a=>a.map(x=>x.dataset.slug+'|'+x.dataset.id));
  const k=ids.findIndex(x=>x.startsWith('cartari|'))+3, tgt=ids[k];
  await p.evaluate(k=>{ const a=document.querySelectorAll('.ic-mot-grid .ic-gal-item')[k]; window.scrollTo(0,Math.max(0,a.getBoundingClientRect().top+scrollY-200)); },k); await W(600);
  const y0=await p.evaluate(k=>({y:Math.round(scrollY),top:Math.round(document.querySelectorAll('.ic-mot-grid .ic-gal-item')[k].getBoundingClientRect().top)}),k);
  await p.evaluate(k=>document.querySelectorAll('.ic-mot-grid .ic-gal-item')[k].click(),k); await p.waitForSelector('.ic-pc',{timeout:30000}); await W(1200);
  const pc=await p.evaluate(()=>({h:location.hash,cnt:document.querySelector('.ic-pc-count').textContent,title:document.querySelector('.ic-pc-title').textContent,img:!!document.querySelector('.ic-pc-fig img'),it:!!document.querySelector('.ic-pc-it'),read:/#\/cartari\/ch\//.test((document.querySelector('.ic-pc-read')||{}).href||''),prev:!!document.querySelector('.ic-pc-pill[rel=prev]'),next:!!document.querySelector('.ic-pc-pill[rel=next]')}));
  ok(T+'тап по гравюре Картари в сетке мотива открывает карточку гравюры (крупно, подпись, ссылка на главу) с контекстом «Змея, k из n»',pc.h==='#/cartari/plate/'+tgt.split('|')[1]+'?from=motif:all:snake'&&/^Змея, \d+ из \d+$/.test(pc.cnt)&&pc.cnt.indexOf('Змея, '+(k+1)+' из '+ids.length)===0&&pc.img&&pc.read&&pc.prev&&pc.next,JSON.stringify(pc));
  // След.: соседняя гравюра мотива, запись истории заменяется
  await p.evaluate(()=>document.querySelector('.ic-pc-pill[rel=next]').click()); await W(1800);
  const nx=await p.evaluate(()=>({h:location.hash,cnt:(document.querySelector('.ic-pc-count')||{}).textContent,len:history.length}));
  const nid=ids[k+1], nIsC=nid&&nid.startsWith('cartari|');
  ok(T+'«След.» идёт по гравюре мотива (как в сетке), контекст сохраняется',nid&&nx.h.indexOf(nIsC?'#/cartari/plate/'+nid.split('|')[1]:'#/iconologie/'+nid.split('|')[1])===0&&/from=motif:all:snake$/.test(nx.h)&&nx.cnt&&nx.cnt.indexOf('Змея, '+(k+2)+' из '+ids.length)===0,JSON.stringify(nx)+' ждём '+nid);
  await p.evaluate(()=>document.querySelector('.ic-pc-pill[rel=prev], .ic-rp-nb-prev') && document.querySelector('.ic-pc-pill[rel=prev], .ic-rp-nb-prev').click()); await W(1500);
  const pv=await hash(); ok(T+'«Пред.» возвращает на предыдущую гравюру мотива',pv==='#/cartari/plate/'+tgt.split('|')[1]+'?from=motif:all:snake',pv);
  await p.evaluate(()=>document.querySelector('.ic-bt-back').click()); await p.waitForSelector('.ic-mot-grid li',{timeout:30000}); await W(1500);
  const y1=await p.evaluate(k=>({h:location.hash,y:Math.round(scrollY),top:Math.round(document.querySelectorAll('.ic-mot-grid .ic-gal-item')[k].getBoundingClientRect().top)}),k);
  ok(T+'«назад» из гравюры возвращает в сетку мотива на то же место (запись истории после Пред./След. не копилась)',y1.h==='#/motifs/all/snake'&&Math.abs(y1.y-y0.y)<=3&&Math.abs(y1.top-y0.top)<=3,JSON.stringify([y0,y1]));
  // метки у гравюры Картари
  const data=await p.evaluate(async()=>{ const b=await fetch('books/_motifs/motifs_cartari.json').then(r=>r.json()); const c={}; Object.values(b.bindings).forEach(a=>a.forEach(i=>c[i]=(c[i]||0)+1)); const e=Object.entries(c).sort((a,b)=>b[1]-a[1]); return {many:e[0],few:e.filter(x=>x[1]>=2&&x[1]<=4)[0]}; });
  await p.goto(BASE+'#/cartari/plate/'+data.few[0]); await p.waitForSelector('.ic-pc',{timeout:30000}); await W(1500);
  const tg2=await p.$$eval('.ic-pc .ic-mot-sec .ic-mot-tag',a=>a.map(x=>({t:x.textContent,h:Math.round(x.getBoundingClientRect().height),href:x.getAttribute('href')})));
  ok(T+'метки мотивов у гравюры Картари: 44px, ведут на #/motifs/cartari/<id>, заголовок «Мотивы», без «ещё» когда ≤10',tg2.length===data.few[1]&&tg2.every(x=>x.h>=44&&/^#\/motifs\/cartari\/[a-z-]+$/.test(x.href))&&(await p.$$('.ic-pc .ic-mot-more')).length===0,tg2.length+' меток, ожидали '+data.few[1]);
  await p.evaluate(()=>document.querySelector('.ic-pc .ic-mot-tag').click()); await W(1200);
  ok(T+'тап по метке открывает мотив Картари',/^#\/motifs\/cartari\/[a-z-]+$/.test(await hash()),await hash());
  await p.goto(BASE+'#/cartari/plate/'+data.many[0]); await p.waitForSelector('.ic-pc .ic-mot-sec .ic-mot-tag',{timeout:30000}); await W(1200);
  const mm=await p.evaluate(()=>{ const v=[...document.querySelectorAll('.ic-pc .ic-mot-tag')].filter(x=>x.offsetParent!==null).length, all=document.querySelectorAll('.ic-pc .ic-mot-tag').length, b=document.querySelector('.ic-pc .ic-mot-more'); return {v,all,more:b&&b.textContent}; });
  await p.evaluate(()=>document.querySelector('.ic-pc .ic-mot-more').click()); await W(300);
  const mm2=await p.evaluate(()=>({v:[...document.querySelectorAll('.ic-pc .ic-mot-tag')].filter(x=>x.offsetParent!==null).length,more:!!document.querySelector('.ic-pc .ic-mot-more')}));
  ok(T+'у гравюры с >10 мотивов: первые 10 и «ещё N»; тап раскрывает остальные',data.many[1]>10&&mm.all===data.many[1]&&mm.v===10&&mm.more==='ещё '+(mm.all-10)&&mm2.v===mm.all&&!mm2.more,JSON.stringify([mm,mm2]));
  // прямой заход на гравюру с контекстом (без загрузки Иконологии заранее)
  await p.goto(BASE+'#/cartari/plate/'+tgt.split('|')[1]+'?from=motif:cartari:snake'); await p.waitForSelector('.ic-pc',{timeout:40000}); await W(1500);
  const dc=await p.evaluate(()=>(document.querySelector('.ic-pc-count')||{}).textContent); ok(T+'прямой заход на гравюру с ?from=motif: подпись контекста есть',/^Змея, \d+ из \d+$/.test(dc),dc);
  // язык: подписи фильтра и гравюр
  for(const [l,btn,one,names,allr] of [['en','Books: all','Books: Iconology','Iconology|Images of the Gods','All books'],['fr','Livres : tous','Livres : Iconologie','Iconologie|Images des Dieux','Tous les livres']]){
    await setLang(l); await p.goto(BASE+'#/motifs/all/snake'); await p.waitForSelector('.ic-mot-bookbtn',{timeout:30000}); await W(1500);
    const cp=await p.$$eval('.ic-mot-grid .ic-gal-item[data-slug="cartari"] .ic-gal-cap',a=>a.slice(0,2).map(x=>x.textContent));
    const h0=await bk(); await hdr(); await W(900); const sx=await bk(); await rowc('cartari'); await W(900); const sy=await bk();
    ok(T+l+': поле «'+btn+'», раскрытое — тот же заголовок, строки «'+allr+'» / книги, снятие книги → «'+one+'», поле открыто, подписи Картари на языке интерфейса',h0.hl===btn&&sx.hl===btn&&sx.rows[0].nm===allr&&sx.rows.slice(1).map(r=>r.nm).join('|')===names&&sx.rows.every(r=>r.h===48)&&sy.hl===one&&sy.open&&sy.rows[0].on==='mixed'&&cp.length===2&&cp.every(x=>x.indexOf(names.split('|')[1])>=0),JSON.stringify([sx.hl,sy.hl,sx.rows.map(r=>r.nm),cp]));
  }
  await setLang('ru');
  }
  await ctx.close();
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
