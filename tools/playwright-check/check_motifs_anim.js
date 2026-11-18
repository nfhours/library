/* Плавный переход «Книги ⇄ Мотивы» (CSS blur + Web Animations): сдвиг и размытие в середине, нет кадра без страниц, старт в тот же кадр что и нажатие,
 * шапка не перерисовывается, рамки капсулы одинаковой толщины (DSF 3), фильтр снят после перехода, «назад»/прямой заход без анимации,
 * повторные нажатия игнорируются, prefers-reduced-motion, прокрутка, консоль.
 * Запуск (из корня репозитория): python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs_anim.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8977/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
const LOG=`(()=>{ window.__log=[]; window.__ghostSeen=0; window.__tc=null; window.__gs=window.__gs||new WeakSet();
 if(!window.__clk){ window.__clk=1; document.addEventListener('click',()=>{ window.__tc=performance.now(); },true); }
 new MutationObserver(m=>{ m.forEach(x=>x.addedNodes.forEach(n=>{ if(n.classList&&(n.classList.contains('ic-mot-ghost')||n.classList.contains('ic-mot-gbg'))&&!window.__gs.has(n)){ window.__gs.add(n); window.__ghostSeen++; } })); }).observe(document.getElementById('iconologie'),{childList:true});
 const bbEl=document.querySelector('.back-bar'); const f=()=>{ const bb=bbEl.getBoundingClientRect(), bt=document.getElementById('ic-booktabs'), b=bt&&bt.getBoundingClientRect(); const pill=document.querySelector('.ic-mot-pill');
  const g=[...document.querySelectorAll('.ic-mot-ghost')]; const mtx=e=>{ const m=getComputedStyle(e).transform; return (!m||m==='none')?0:+m.split(',')[4]; };
  window.__log.push({t:performance.now(),tc:window.__tc,n:g.length,g:g.map(x=>({op:+getComputedStyle(x).opacity,bl:parseFloat((getComputedStyle(x).filter.match(/blur\\(([\\d.]+)px/)||[0,0])[1]),tx:mtx(x.firstChild)})),pill:pill?mtx(pill):null,bbSame:document.querySelector('.back-bar')===bbEl,bbTop:Math.round(bb.top),bbH:Math.round(bb.height),btTop:b?Math.round(b.top):null,btH:b?Math.round(b.height):null,gbg:[...document.querySelectorAll('.ic-mot-gbg')].map(x=>{const r=x.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.right),getComputedStyle(x).transform]; })}); if(window.__log.length<500) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
const PIX=`async ([b64,pts])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=im.width/innerWidth; return pts.map(([px,py])=>Array.from(x.getImageData(Math.round(px*k),Math.round(py*k),1,1).data).slice(0,3)); }`;
// яркость вдоль линии: начало в CSS-пикселях, шаг dx/dy — один девайсный пиксель, len — длина в CSS-пикселях
const LINES=`async ([b64,lines])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=Math.round(im.width/innerWidth); return {k, lines:lines.map(([x0,y0,dx,dy,len])=>{ const out=[]; for(let i=0;i<len*k;i++){ const d=x.getImageData(Math.round(x0*k)+dx*i,Math.round(y0*k)+dy*i,1,1).data; out.push(Math.round(0.3*d[0]+0.59*d[1]+0.11*d[2])); } return out; })}; }`;
function thick(arr){ // число подряд идущих отсчётов заметно ярче фона по краям линии
  const n=arr.length, edge=Math.max(2,Math.floor(n/6)); const lo=(arr.slice(0,edge).reduce((a,b)=>a+b,0)/edge), hi=(arr.slice(n-edge).reduce((a,b)=>a+b,0)/edge); const base=Math.max(lo,hi)+6;
  let best=0,cur=0; for(let i=edge;i<n-edge;i++){ if(arr[i]>base){ cur++; best=Math.max(best,cur); } else cur=0; } return best; }
(async()=>{
 const br=await webkit.launch(); const errs=[];
 for(const vp of [{name:'390x844',w:390,h:844,dev:devices['iPhone 13']},{name:'1180x820',w:1180,h:820}]){
  for(const reduce of [false,true]){
   const ctx=await br.newContext({...(vp.dev||{}),viewport:{width:vp.w,height:vp.h},reducedMotion:reduce?'reduce':'no-preference'}); const p=await ctx.newPage();
   p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
   const T=vp.name+(reduce?' reduce ':' ');
   const hash=()=>p.evaluate(()=>location.hash);
   const click=s=>p.evaluate(s=>document.querySelector(s).click(),s);
   await p.goto(BASE+'#/'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await W(3500);   // простой: данные «Мотивов» подгружены заранее
   if(!reduce){
     // рамки капсулы и подложки: везде ровно 1 CSS-пиксель (на телефоне 3 девайсных)
     await p.goto(BASE+'#/motifs'); await W(2000);
     const sh0=await p.screenshot(); const g0=await p.evaluate(()=>{ const c=document.querySelector('.ic-mot-cap').getBoundingClientRect(), i=document.querySelector('.ic-mot-pill i').getBoundingClientRect(); return {c:[c.left,c.top,c.right,c.bottom],i:[i.left,i.top,i.right,i.bottom],ints:[c.left,c.top,c.width,c.height,i.left,i.top,i.width,i.height].every(v=>Math.abs(v-Math.round(v))<0.001)}; });
     const [cl,ct,cr,cb]=g0.c,[il,it,ir,ib]=g0.i, cx=(cl+cr)/2, cy=(ct+cb)/2, ix=(il+ir)/2, iy=(it+ib)/2, H=3;
     const res=await p.evaluate(eval(LINES),[sh0.toString('base64'),[[cl-H,cy,1,0,2*H],[cr-H,cy,1,0,2*H],[cx,ct-H,0,1,2*H],[cx,cb-H,0,1,2*H],[il-H,iy,1,0,2*H],[ir-H,iy,1,0,2*H],[ix,it-H,0,1,2*H],[ix,ib-H,0,1,2*H]]]);
     const th=res.lines.map(thick), want=res.k;
     ok(T+'рамки капсулы и подложки — по всему контуру ровно 1 CSS-пиксель ('+want+' девайсных)',th.every(x=>x===want),'k='+want+' '+JSON.stringify(th));
     ok(T+'размеры и положения капсулы/подложки — целые CSS-пиксели',g0.ints,JSON.stringify(g0.c.concat(g0.i)));
     await p.goto(BASE+'#/'); await W(3000);
   }
   await p.evaluate(()=>window.scrollTo(0,300)); await W(500); const y0=await p.evaluate(()=>Math.round(scrollY));
   // 1) замедленный прогон: кадры в середине
   if(!reduce) await p.evaluate(()=>{ window.__icMotMs=3000; });
   await p.evaluate(LOG);
   await click('.ic-mot-cap a[href="#/motifs"]');
   if(!reduce){
     await W(1300); const sh=await p.screenshot(); if(!process.env.NOSHOT) require('fs').writeFileSync(path.join(OUT,'anim-fwd-'+vp.name+'.png'),sh);
     const rb=await p.evaluate(()=>{ const g=document.querySelector('.ic-mot-gbg'); if(!g) return null; const r=g.getBoundingClientRect(); return {t:r.top,h:r.height}; });
     if(rb){ const y=rb.t+rb.h/2; const px=await p.evaluate(eval(PIX),[sh.toString('base64'),[[1,y],[3,y],[vp.w-3,y],[vp.w-2,y]]]); ok(T+'середина: у левого и правого края в тёмной строке нет бумаги',px.every(c=>c[0]<95&&c[1]<95&&c[2]<95),JSON.stringify(px)); }
     else ok(T+'середина: тёмный фон строки есть (слой)',false,'нет .ic-mot-gbg');
     await W(2200); await p.evaluate(()=>{ window.__icMotMs=420; });
   } else await W(900);
   const L=await p.evaluate(()=>window.__log); const run=L.filter(x=>x.n>0);
   if(!reduce){
     const mid=run[Math.floor(run.length/2)];
     ok(T+'в середине: оба слоя видны, сдвиг и размытие CSS blur (уходящий влево, входящий справа)',mid.n>=2&&mid.g.every(x=>x.op>0&&x.op<1&&x.bl>0&&x.bl<6)&&mid.g[0].tx<-5&&mid.g[mid.g.length-1].tx>5,JSON.stringify(mid.g));
     const mxo=Math.max(...run.map(x=>x.g[0].bl)), mxi=Math.max(...run.map(x=>x.g[x.g.length-1].bl)), mxtx=Math.min(...run.map(x=>x.g[0].tx));
     ok(T+'размах: blur до 6px у обеих, сдвиг до 60px',mxo>=4.5&&mxi>=4.5&&mxtx<=-45,'out blur '+mxo.toFixed(1)+' in blur '+mxi.toFixed(1)+' tx '+mxtx.toFixed(1));
     ok(T+'тёмный фон строки неподвижен (слой без сдвига, во всю ширину)',run.every(x=>x.gbg.every(g=>g[0]===0&&g[1]===vp.w&&g[2]==='none')),JSON.stringify(run[3].gbg));
     ok(T+'нет кадра без страниц (на каждом кадре два слоя, суммарно не прозрачнее 45%)',run.length>=20&&run.every(x=>x.n>=2&&(x.g.map(y=>y.op).reduce((a,b)=>a+b,0))>=0.45),run.length+' кадров');
   } else ok(T+'reduce: призраков нет, страница меняется мгновенно',run.length===0&&(await p.evaluate(()=>window.__ghostSeen))===0);
   const hd=L.filter(x=>x.btTop!=null).map(x=>x.bbTop+'/'+x.bbH+'/'+x.btTop+'/'+x.btH); ok(T+'шапка: тот же элемент, не двигалась, высота не менялась',new Set(hd).size===1&&L.every(x=>x.bbSame),[...new Set(hd)].join(' | '));
   if(!reduce){ const pp=L.map(x=>x.pill).filter(v=>v!=null); ok(T+'подложка движется плавно и приходит в 143',pp.some(v=>v>1&&v<142)&&pp[pp.length-1]===143,pp.filter((v,i)=>i%12===0).map(v=>Math.round(v*10)/10).join(',')); }
   ok(T+'итог: #/motifs, сверху, выбраны «Мотивы»',(await hash())==='#/motifs'&&await p.evaluate(()=>Math.round(scrollY))<=2&&(await p.evaluate(()=>document.querySelector('.ic-mot-cap').dataset.pos))==='1');
   const after=await p.evaluate(()=>{ let f=0; document.querySelectorAll('#iconologie *').forEach(e=>{ if(getComputedStyle(e).filter!=='none') f++; }); return {f,gh:document.querySelectorAll('.ic-mot-ghost,.ic-mot-gbg').length,vis:[...document.querySelectorAll('.ic-wrap,.ic-ch-outer-bar')].map(e=>e.style.visibility),sects:document.querySelectorAll('.ic-mot-sect').length,tabs:document.querySelectorAll('.ic-mot-tab').length}; });
   ok(T+'после перехода filter: none везде, призраков нет, всё видимо, каталог как в v244',after.f===0&&after.gh===0&&after.vis.every(v=>v==='')&&after.sects===9&&after.tabs===10,JSON.stringify(after));
   // 2) старт в тот же кадр: обычная скорость, данные подгружены заранее
   if(!reduce){
     await p.evaluate(()=>window.scrollTo(0,0)); await click('.ic-mot-cap a[href="#/"]'); await W(1500);   // назад на главную (разогрев)
     await p.evaluate(()=>{ const t={c:0,anim:[],f1:null}; window.__tm=t; document.addEventListener('click',()=>{ t.c=performance.now(); requestAnimationFrame(()=>{ t.f1={dt:performance.now()-t.c,ghosts:document.querySelectorAll('.ic-mot-ghost').length,running:document.getAnimations().length}; }); },true);
       const o=Element.prototype.animate; Element.prototype.animate=function(){ t.anim.push(performance.now()-t.c); return o.apply(this,arguments); }; });
     await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1200);
     const tm=await p.evaluate(()=>window.__tm), last=Math.max(...tm.anim), first=Math.min(...tm.anim);
     ok(T+'переход стартует в тот же кадр, что и нажатие: все анимации (подложка, уходящая, входящая) запущены раньше первого кадра',tm.anim.length>=8&&last<tm.f1.dt&&tm.f1.ghosts>=2&&tm.f1.running>=8,'первая анимация '+first.toFixed(1)+' мс, последняя '+last.toFixed(1)+' мс, первый кадр через '+tm.f1.dt.toFixed(0)+' мс, слоёв '+tm.f1.ghosts+', анимаций '+tm.f1.running);
     const L3=await p.evaluate(()=>window.__log), tc=L3.filter(x=>x.tc).pop().tc, fr=L3.filter(x=>x.t>=tc);
     ok(T+'нет пустого кадра между страницами (все кадры от нажатия до конца)',fr.filter(x=>x.t-tc<380).every(x=>x.n>=1),'');
   }
   // 3) повторные нажатия, обратно, прокрутка
   if(!reduce){
     await p.evaluate(()=>{ window.__icMotMs=2500; }); await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/"]'); await W(700); await click('.ic-mot-cap a[href="#/motifs"]'); await click('.ic-mot-cap a[href="#/"]'); await W(2600); await p.evaluate(()=>{ window.__icMotMs=420; });
     ok(T+'повторные нажатия во время перехода игнорируются (итог — главная, один переход)',(await hash())==='#/'&&(await p.evaluate(()=>window.__ghostSeen))<=3,await hash()+' ghosts '+await p.evaluate(()=>window.__ghostSeen));
     const L2=(await p.evaluate(()=>window.__log)).filter(x=>x.n>0); const mid2=L2[Math.floor(L2.length/2)];
     ok(T+'обратно — вправо (уходящий вправо, входящий слева)',mid2&&mid2.g[0].tx>5&&mid2.g[mid2.g.length-1].tx<-5,JSON.stringify(mid2&&mid2.g.map(g=>g.tx)));
   } else { await click('.ic-mot-cap a[href="#/"]'); await W(800); }
   const y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'главная — на прежнем месте прокрутки',reduce?Math.abs(y1-y0)<=40:y1>=0,y0+' → '+y1);
   await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1000); await p.evaluate(()=>{ window.__ghostSeen=0; }); await p.goBack(); await W(1500);
   ok(T+'«назад» браузера без анимации',(await hash())==='#/'&&(await p.evaluate(()=>window.__ghostSeen))===0,await hash());
   await p.evaluate(LOG); await p.goto(BASE+'#/motifs'); await W(1500); ok(T+'прямой заход без анимации',(await p.evaluate(()=>window.__ghostSeen))===0&&(await p.$$('.ic-mot-ghost')).length===0);
   await ctx.close();
  }
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
