/* Плавный переход «Книги ⇄ Мотивы»: размытие по горизонтали в середине анимации, нет шва/обрубленных краёв, шапка на месте,
 * фильтр снят после перехода, «назад» браузера без анимации, повторное нажатие игнорируется, prefers-reduced-motion, прокрутка, консоль.
 * Запуск (из корня репозитория): python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs_anim.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8977/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
const LOG=`(()=>{ window.__log=[]; window.__ghostSeen=0; window.__gs=new WeakSet(); new MutationObserver(m=>{ m.forEach(x=>x.addedNodes.forEach(n=>{ if(n.classList&&(n.classList.contains('ic-mot-ghost')||n.classList.contains('ic-mot-gbg'))&&!window.__gs.has(n)){ window.__gs.add(n); window.__ghostSeen++; } })); }).observe(document.getElementById('iconologie'),{childList:true});
 const f=()=>{ const bb=document.querySelector('.back-bar').getBoundingClientRect(), bt=document.getElementById('ic-booktabs'), b=bt&&bt.getBoundingClientRect(); const fo=document.getElementById('ic-mb-out'), fi=document.getElementById('ic-mb-in');
  const sd=e=>e?parseFloat(e.firstChild.getAttribute('stdDeviation')):null; const g=[...document.querySelectorAll('.ic-mot-ghost')];
  window.__log.push({t:Math.round(performance.now()),n:g.length,out:sd(fo),inn:sd(fi),op:g.map(x=>+getComputedStyle(x).opacity),tx:g.map(x=>{const m=getComputedStyle(x.firstChild).transform; return m==='none'?0:+m.split(',')[4];}),bbTop:Math.round(bb.top),bbH:Math.round(bb.height),btTop:b?Math.round(b.top):null,btH:b?Math.round(b.height):null,gbg:[...document.querySelectorAll('.ic-mot-gbg')].map(x=>{const r=x.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.right),getComputedStyle(x).transform]; })}); if(window.__log.length<400) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
const PIX=`async ([b64,pts])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=im.width/innerWidth; return pts.map(([px,py])=>Array.from(x.getImageData(Math.round(px*k),Math.round(py*k),1,1).data).slice(0,3)); }`;
(async()=>{
 const br=await webkit.launch(); const errs=[];
 for(const vp of [{name:'390x844',w:390,h:844,dev:devices['iPhone 13']},{name:'1180x820',w:1180,h:820}]){
  for(const reduce of [false,true]){
   const ctx=await br.newContext({...(vp.dev||{}),viewport:{width:vp.w,height:vp.h},reducedMotion:reduce?'reduce':'no-preference'}); const p=await ctx.newPage();
   p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
   const T=vp.name+(reduce?' reduce ':' ');
   const hash=()=>p.evaluate(()=>location.hash);
   await p.goto(BASE+'#/'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await W(2500);
   await p.evaluate(()=>window.scrollTo(0,300)); await W(500); const y0=await p.evaluate(()=>Math.round(scrollY));
   await p.evaluate(LOG);
   const click=s=>p.evaluate(s=>document.querySelector(s).click(),s);
   if(!reduce) await p.evaluate(()=>{ window.__icMotMs=3000; });
   await click('.ic-mot-cap a[href="#/motifs"]');
   if(!reduce){
     await W(1300); const sh=await p.screenshot(); if(!process.env.NOSHOT) require('fs').writeFileSync(path.join(OUT,'anim-fwd-'+vp.name+'.png'),sh);
     const rb=await p.evaluate(()=>{ const g=document.querySelector('.ic-mot-gbg'); if(!g) return null; const r=g.getBoundingClientRect(); return {t:r.top,h:r.height}; });
     if(rb){ const y=rb.t+rb.h/2; const px=await p.evaluate(eval(PIX),[sh.toString('base64'),[[1,y],[3,y],[vp.w-3,y],[vp.w-2,y]]]); ok(T+'середина: у левого и правого края в тёмной строке нет бумаги',px.every(c=>c[0]<95&&c[1]<95&&c[2]<95),JSON.stringify(px)); }
     else ok(T+'середина: тёмный фон строки есть (слой)',false,'нет .ic-mot-gbg');
   }
   if(!reduce){ await W(2200); await p.evaluate(()=>{ window.__icMotMs=420; }); } else await W(900);
   const L=await p.evaluate(()=>window.__log); const run=L.filter(x=>x.n>0);
   if(!reduce){
     ok(T+'анимация шла кадрами (замедленный прогон 3 с)',run.length>=8&&(run[run.length-1].t-run[0].t)>=2500,run.length+' кадров '+(run.length?run[run.length-1].t-run[0].t:0)+' мс');
     const rf=run.filter(x=>x.out!=null); const mx=Math.max(...run.map(x=>x.out==null?0:x.out)), mi=Math.max(...run.map(x=>x.inn==null?0:x.inn)), mid=run[Math.floor(run.length/2)];
     ok(T+'размытие по X: у уходящей растёт до ~14, у входящей спадает от ~14',mx>=12&&mi>=12&&rf[0].out<4&&rf[0].inn>=8&&rf[rf.length-1].out>=10&&rf[rf.length-1].inn<=3,'out max '+mx+' in max '+mi+' first '+rf[0].out+'/'+rf[0].inn+' last '+rf[rf.length-1].out+'/'+rf[rf.length-1].inn);
     ok(T+'в середине оба слоя видны и сдвинуты (уходящий влево, входящий справа)',mid.n>=2&&mid.op.every(o=>o>0&&o<1)&&mid.tx[0]<0&&mid.tx[mid.tx.length-1]>0,JSON.stringify([mid.op,mid.tx]));
     ok(T+'тёмный фон строки неподвижен (слой без сдвига)',run.every(x=>x.gbg.every(g=>g[0]===0&&g[2]==='none')),JSON.stringify(run[3].gbg));
   } else ok(T+'reduce: призраков нет, страница меняется мгновенно',run.length===0&&(await p.evaluate(()=>window.__ghostSeen))===0);
   const hd=L.filter(x=>x.btTop!=null).map(x=>x.bbTop+'/'+x.bbH+'/'+x.btTop+'/'+x.btH); ok(T+'шапка и переключатель не двигались и не меняли высоту',new Set(hd).size===1,[...new Set(hd)].join(' | '));
   ok(T+'итог: #/motifs, сверху, выбраны «Мотивы»',(await hash())==='#/motifs'&&await p.evaluate(()=>Math.round(scrollY))<=2&&(await p.evaluate(()=>document.querySelector('.ic-mot-cap').dataset.pos))==='1');
   const after=await p.evaluate(()=>{ let f=0; document.querySelectorAll('#iconologie *').forEach(e=>{ if(getComputedStyle(e).filter!=='none') f++; }); return {f,gh:document.querySelectorAll('.ic-mot-ghost,.ic-mot-gbg').length,vis:[...document.querySelectorAll('.ic-wrap,.ic-ch-outer-bar')].map(e=>e.style.visibility),sects:document.querySelectorAll('.ic-mot-sect').length,tabs:document.querySelectorAll('.ic-mot-tab').length}; });
   ok(T+'после перехода фильтр снят, призраков нет, всё видимо, каталог как в v243',after.f===0&&after.gh===0&&after.vis.every(v=>v==='')&&after.sects===9&&after.tabs===10,JSON.stringify(after));
   if(!reduce){
     await p.evaluate(LOG); await p.evaluate(()=>{ window.__icMotMs=2500; }); await click('.ic-mot-cap a[href="#/"]'); await W(700); await click('.ic-mot-cap a[href="#/motifs"]'); await click('.ic-mot-cap a[href="#/"]'); await W(2600); await p.evaluate(()=>{ window.__icMotMs=420; });
     ok(T+'повторные нажатия во время перехода игнорируются (итог — главная, один переход)',(await hash())==='#/'&&(await p.evaluate(()=>window.__ghostSeen))<=3,await hash()+' ghosts '+await p.evaluate(()=>window.__ghostSeen));
     const L2=(await p.evaluate(()=>window.__log)).filter(x=>x.n>0); const mid2=L2[Math.floor(L2.length/2)];
     ok(T+'обратно — вправо (уходящий вправо, входящий слева)',mid2&&mid2.tx[0]>0&&mid2.tx[mid2.tx.length-1]<0,JSON.stringify(mid2&&mid2.tx));
   } else { await click('.ic-mot-cap a[href="#/"]'); await W(800); }
   const y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'главная — на прежнем месте прокрутки',Math.abs(y1-y0)<=40,y0+' → '+y1);
   await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1000); await p.evaluate(()=>{ window.__ghostSeen=0; }); await p.goBack(); await W(1500);
   ok(T+'«назад» браузера без анимации',(await hash())==='#/'&&(await p.evaluate(()=>window.__ghostSeen))===0,await hash());
   await p.evaluate(LOG); await p.goto(BASE+'#/motifs'); await W(1500); ok(T+'прямой заход без анимации',(await p.evaluate(()=>window.__ghostSeen))===0&&(await p.$$('.ic-mot-ghost')).length===0);
   if(!reduce&&!process.env.NOSHOT){ await p.goto(BASE+'#/'); await W(1500); await p.screenshot({path:path.join(OUT,'anim-home-'+vp.name+'.png')}); }
   await ctx.close();
  }
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
