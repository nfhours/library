/* Страница «Мотивы» (#/motifs): вход с главной библиотеки и с главной Иконологии, фильтр по книгам, поиск («зме», «вен»),
 * вкладки категорий, родитель «венок» со всеми дочерними, сетка, переход в карточку и «назад» на то же место, метки на карточке Рипы,
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
  await p.goto(BASE+'#/'); await setLang('ru'); await W(1500);
  // вход с главной библиотеки
  const tile=await p.$('.ic-lib-mot .ic-home-tile'); ok(T+'плитка «Мотивы» на главной',!!tile && /Мотивы/.test(await tile.innerText()) && /Поиск гравюр/.test(await tile.innerText()));
  ok(T+'список книг не изменён',(await p.$$eval('.ic-lib-row',r=>r.map(x=>x.dataset.slug).join()))==='cartari,iconologie,alciato,audran,verrien,grosson,ripa1603');
  await tap('.ic-lib-mot .ic-home-tile'); await W(2500); ok(T+'открыт #/motifs',(await hash())==='#/motifs',await hash());
  // фильтр книг
  const chips=await p.$$eval('.ic-mot-books .ic-chip',c=>c.map(x=>({t:x.textContent,on:x.getAttribute('aria-pressed'),h:x.getBoundingClientRect().height})));
  ok(T+'метки книг: «Все книги» выбрана + Иконология',chips.length===2&&chips[0].t==='Все книги'&&chips[0].on==='true'&&chips[1].t==='Иконология'&&chips[1].on==='false',JSON.stringify(chips)); ok(T+'метки ≥44px',chips.every(c=>c.h>=43.5));
  const nAll=await p.$$eval('.ic-mot-row',r=>r.length); ok(T+'список мотивов',nAll>100,String(nAll));
  const top=await p.$$eval('.ic-mot-row:not(.ic-mot-kid)',r=>r.map(x=>+x.querySelector('.ic-mot-n').textContent)); ok(T+'сортировка по частоте (родители с дочерними, по убыванию)',top.length>50&&top.every((v,i)=>i===0||v<=top[i-1]),top.slice(0,6).join(','));
  ok(T+'крылья — второй по счёту (74), «венок» — первый (80 с дочерними)',await p.$$eval('.ic-mot-row',r=>/^венок/.test(r[0].textContent)&&r.some(x=>/^крылья74$/.test(x.textContent))));
  await tap('.ic-mot-books [data-mb="iconologie"]'); await W(1500); ok(T+'выбор книги → адрес',(await hash())==='#/motifs/iconologie',await hash());
  ok(T+'Иконология выбрана, «Все книги» снята',(await p.$$eval('.ic-mot-books .ic-chip',c=>c.map(x=>x.getAttribute('aria-pressed')).join()))==='false,true');
  await tap('.ic-mot-books [data-mb="all"]'); await W(1500); ok(T+'«Все книги» сбрасывает выбор',(await hash())==='#/motifs/all',await hash());
  // поиск с начала слова
  const q='.ic-rbar-findin';
  await p.fill(q,'зме'); await W(500); let rows=await p.$$eval('.ic-mot-row .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'поиск «зме»',rows.length>=1&&rows.every(x=>/(^|[\s-])зме/i.test(x)),rows.join(', '));
  await p.fill(q,'вен'); await W(500); rows=await p.$$eval('.ic-mot-row .ic-mot-nm',r=>r.map(x=>x.textContent));
  ok(T+'поиск «вен»',rows.length>=5&&rows.every(x=>/(^|[\s-])вен/i.test(x)),rows.slice(0,6).join(', '));
  await p.fill(q,'мея'); await W(400); ok(T+'поиск не с начала слова ничего не находит (зме≠«мея»)',(await p.$$('.ic-mot-row')).length===0);
  await p.fill(q,''); await W(500);
  // вкладки категорий
  const cats=await p.$$eval('.ic-mot-cats .ic-chip',c=>c.map(x=>x.textContent)); ok(T+'вкладки категорий (Все + непустые)',cats[0]==='Все'&&cats.length>=8&&cats.includes('Животные')&&cats.includes('Оружие'),cats.join(', '));
  await tap('.ic-mot-cats [data-cat="животное"]'); await W(500); const an=await p.$$eval('.ic-mot-row .ic-mot-nm',r=>r.map(x=>x.textContent)); ok(T+'вкладка «Животные»',an.includes('змея')&&!an.includes('книга'),an.slice(0,6).join(', '));
  await p.fill(q,'зме'); await W(500); const catsAfter=await p.$$eval('.ic-mot-cats .ic-chip',c=>c.map(x=>x.textContent)); ok(T+'при поиске пустые вкладки скрыты',catsAfter.length<cats.length,catsAfter.join(', '));
  await p.fill(q,''); await W(300); await tap('.ic-mot-cats [data-cat="all"]'); await W(400);
  // родитель «венок» с дочерними
  const wr=await p.evaluate(()=>{ const r=[...document.querySelectorAll('.ic-mot-row')]; const i=r.findIndex(x=>x.dataset.id==='wreath'); if(i<0) return null; const kids=[]; for(let j=i+1;j<r.length&&r[j].classList.contains('ic-mot-kid');j++) kids.push(r[j].dataset.id); return {n:+r[i].querySelector('.ic-mot-n').textContent,own:r[i].textContent,kids,padKid:getComputedStyle(r[i+1]).paddingLeft,padTop:getComputedStyle(r[i]).paddingLeft}; });
  ok(T+'родитель «венок» с дочерними под ним',wr&&wr.kids.length>=15&&wr.kids.includes('laurel-crown')&&parseFloat(wr.padKid)>parseFloat(wr.padTop),JSON.stringify(wr&&{n:wr.n,k:wr.kids.length}));
  // мотив: сетка
  await p.goto(BASE+'#/motifs/iconologie/wreath'); await W(3000);
  const g=await p.evaluate(()=>({n:document.querySelectorAll('.ic-mot-grid .ic-gal-item').length,cnt:document.querySelector('.ic-mot-count').textContent,h1:document.querySelector('.ic-mot-h1').textContent,cap:document.querySelector('.ic-gal-cap small').textContent,imgs:[...document.querySelectorAll('.ic-mot-grid img')].length}));
  ok(T+'сетка родителя «венок» (с дочерними)',g.n>=70&&g.h1==='венок'&&/Гравюр: \d+/.test(g.cnt),JSON.stringify(g)); ok(T+'при одной книге подпись «стр.»',/^с\. \d/.test(g.cap),g.cap);
  const gs=await p.evaluate(()=>{ const a=document.querySelectorAll('.ic-mot-grid .ic-gal-item'); return a.length; });
  await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2500); const sn=await p.$$eval('.ic-mot-grid .ic-gal-item',a=>a.length); ok(T+'змея: гравюры',sn>=15,String(sn));
  await p.goto(BASE+'#/motifs/all/wreath'); await W(2500); const cap2=await p.$eval('.ic-gal-cap small',e=>e.textContent); ok(T+'«Все книги»: подпись книги',cap2==='Иконология',cap2);
  const bc=await p.$$eval('.ic-mot-books .ic-chip',c=>c.map(x=>x.getAttribute('aria-pressed')).join()); ok(T+'переключатель книг сверху сетки',bc==='true,false',bc);
  await tap('.ic-mot-books [data-mb="iconologie"]'); await W(1500); ok(T+'тап: «Все книги» → одна книга',(await hash())==='#/motifs/iconologie/wreath',await hash());
  // переход в карточку и назад на то же место
  await p.evaluate(()=>{ window.scrollTo(0,1400); window.__y=-1; addEventListener('click',()=>{ window.__y=Math.round(scrollY); },true); }); await W(600);
  const idc=await p.evaluate(()=>{ const a=[...document.querySelectorAll('.ic-mot-grid .ic-gal-item')].find(x=>x.getBoundingClientRect().top>150); return a&&a.dataset.id; });
  await tap('.ic-mot-grid .ic-gal-item[data-id="'+idc+'"]'); await W(2500); ok(T+'тап по гравюре открывает карточку',new RegExp('#/iconologie/'+idc+'$').test(await hash()),await hash());
  const tags=await p.$$eval('.ic-mot-sec .ic-mot-tag',a=>a.map(x=>({t:x.textContent,h:x.getBoundingClientRect().height,href:x.getAttribute('href')}))); ok(T+'метки мотивов на карточке',tags.length>=1&&tags.every(x=>x.h>=43.5&&/^#\/motifs\/iconologie\//.test(x.href)),JSON.stringify(tags.slice(0,3)));
  const aft=await p.evaluate(()=>{ const s=[...document.querySelectorAll('.ic-sec')]; const i=s.findIndex(x=>x.classList.contains('ic-mot-sec')); return {i,prev:i>0&&s[i-1].querySelector('h3').textContent}; }); ok(T+'метки после «Что изображено»',aft.prev==='Что изображено',JSON.stringify(aft));
  await p.goBack(); await W(2500); const y0=await p.evaluate(()=>window.__y), y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'«назад» возвращает в сетку на то же место',(await hash())==='#/motifs/iconologie/wreath'&&Math.abs(y1-y0)<=40,y0+' → '+y1);
  // метка на карточке открывает сетку
  await p.goto(BASE+'#/iconologie/p1-1'); await W(2500); const t0=await p.$('.ic-mot-sec .ic-mot-tag'); const th=await t0.getAttribute('href'); await tap('.ic-mot-sec .ic-mot-tag'); await W(2200); ok(T+'метка ведёт на #/motifs/iconologie/<id>',(await hash())===th,th+' vs '+await hash());
  // главная Иконологии
  await p.goto(BASE+'#/iconologie'); await W(2500); const tiles=await p.$$eval('.ic-home-tile',a=>a.map(x=>({t:x.querySelector('b').textContent,href:x.getAttribute('href')}))); ok(T+'третья плитка «Мотивы» на главной Иконологии',tiles.length===3&&tiles[2].t==='Мотивы'&&tiles[2].href==='#/motifs/iconologie',JSON.stringify(tiles));
  await tap('.ic-home-tile:nth-child(3)'); await W(2500); ok(T+'плитка открывает #/motifs/iconologie',(await hash())==='#/motifs/iconologie');
  ok(T+'выбрана Иконология',(await p.$$eval('.ic-mot-books .ic-chip',c=>c.map(x=>x.getAttribute('aria-pressed')).join()))==='false,true');
  // языки
  for(const [l,all,find,cat,sub] of [['en','All books','Find a motif','Animals','Find engravings by the objects they show'],['fr','Tous les livres','Chercher un motif','Animaux','Chercher des gravures par les objets représentés'],['ru','Все книги','Найти мотив','Животные','Поиск гравюр по изображённым предметам']]){
   await p.goto(BASE+'#/motifs'); await setLang(l); await W(500);
   const o=await p.evaluate(()=>({all:document.querySelector('.ic-mot-books .ic-chip').textContent,ph:document.querySelector('.ic-rbar-findin').placeholder,cats:[...document.querySelectorAll('.ic-mot-cats .ic-chip')].map(x=>x.textContent),sub:document.querySelector('.ic-mot-sub').textContent,first:document.querySelector('.ic-mot-nm').textContent}));
   ok(T+l+': подписи и названия мотивов',o.all===all&&o.ph===find&&o.cats.includes(cat)&&o.sub===sub,JSON.stringify(o));
   const on=await p.evaluate(()=>document.querySelector('.ic-mot-nm').textContent); if(l==='en') ok(T+'en: первый мотив wreath',/^wreath$/i.test(on),on); if(l==='fr') ok(T+'fr: первый мотив couronne',/^couronne$/i.test(on),on);
  }
  await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2000); const lab=await p.evaluate(()=>[document.querySelector('.ic-mot-h1').textContent,document.querySelector('.ic-mot-count').textContent]); ok(T+'ru: мотив «змея»',lab[0]==='змея'&&/Гравюр/.test(lab[1]),lab.join(' | '));
  if(!process.env.NOSHOT){ await p.goto(BASE+'#/motifs'); await W(1500); await p.screenshot({path:path.join(OUT,'motifs-list-'+vp.name+'.png')}); await p.goto(BASE+'#/motifs/iconologie/snake'); await W(2500); await p.screenshot({path:path.join(OUT,'motifs-grid-'+vp.name+'.png')}); }
  await ctx.close();
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
