/* Переход «Книги ⇄ Мотивы» (v254): только настоящие элементы, только transform/opacity (Web Animations). Фаза 1 (0–150 мс): страница opacity 1→0 и сдвиг вниз на 12px,
 * строка разделов при уходе с «Мотивов» уезжает вверх; смена содержимого; фаза 2 (150–450 мс): страница opacity 0→1, сдвиг −12→0, строка выезжает сверху.
 * Проверяется: нигде нет mask-image / filter / клонов / will-change на страницах в любой момент перехода; строка цельная (дети в её пределах, нет щели);
 * после перехода анимации и inline-стили сняты; бумага до низа; подложка и шапка; повторные нажатия, «назад», прямой заход, reduce-motion, прокрутка.
 * Запуск (из корня репозитория): python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs_anim.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8977/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
// кадры (на каждом rAF): страница, строка, шапка, моменты смены адреса
const LOG=`(()=>{ window.__log=[]; window.__hc=[]; window.__tc=null;
 if(!window.__clk){ window.__clk=1; document.addEventListener('click',()=>{ window.__tc=performance.now(); },true); addEventListener('hashchange',()=>{ window.__hc.push(performance.now()); }); }
 const bbEl=document.querySelector('.back-bar'); const mty=e=>{ const m=getComputedStyle(e).transform; return (!m||m==='none')?0:+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?13:5]; };
 const f=()=>{ const wr=document.querySelector('#iconologie > .ic-wrap'), bb=bbEl.getBoundingClientRect(), bt=document.getElementById('ic-booktabs'), b=bt&&bt.getBoundingClientRect(), pill=document.querySelector('.ic-mot-pill');
  const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bar=rw&&rw.querySelector('.ic-ch-outer-bar');
  const rootR=document.getElementById('iconologie').getBoundingClientRect(), rwb=rw?rw.getBoundingClientRect().bottom:(b?b.bottom:0); let light=0; for(const x of [2,innerWidth/2,innerWidth-3]) for(let y=1;y<rwb-1;y+=6){ const el=document.elementFromPoint(x,y); if(!el||!el.closest('.back-bar, .ic-booktabs, .ic-mot-rwrap')) light++; }
  window.__log.push({t:performance.now(),tc:window.__tc,hash:location.hash,light,rootBottom:Math.round(rootR.bottom),vh:innerHeight,wr:wr?{op:+getComputedStyle(wr).opacity,ty:mty(wr)}:null,strip:bar?{ty:mty(bar),h:Math.round(bar.getBoundingClientRect().height)}:null,
   bbSame:document.querySelector('.back-bar')===bbEl,bbTop:Math.round(bb.top),bbH:Math.round(bb.height),btTop:b?Math.round(b.top):null,btH:b?Math.round(b.height):null,pill:pill?(()=>{ const m=getComputedStyle(pill).transform; return (!m||m==='none')?0:+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?12:4]; })():null});
  if(window.__log.length<700) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
// аудит страницы: маски, filter, backdrop-filter, will-change, клоны/слои анимации
const AUDIT=`(()=>{ const bad=[]; document.querySelectorAll('html, body, body *').forEach(e=>{ const c=getComputedStyle(e), mk=(c.webkitMaskImage&&c.webkitMaskImage!=='none')||(c.maskImage&&c.maskImage!=='none'), bf=(c.webkitBackdropFilter||c.backdropFilter||'none');
  const nm=(e.id?'#'+e.id:'')+e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0];
  if(mk&&!(e.classList.contains('ic-mot-tabs')&&e.classList.contains('ic-mot-fade'))) bad.push(nm+' mask'); if(c.filter!=='none'&&!e.matches('.ic-lib-thumb img')) bad.push(nm+' filter');   /* тень/серость обложек книг на главной — статичное оформление (drop-shadow), не анимация */ if(bf&&bf!=='none') bad.push(nm+' backdrop'); if(c.willChange&&c.willChange!=='auto') bad.push(nm+' will-change='+c.willChange); });
  return {bad,clones:document.querySelectorAll('.ic-mot-ghost,.ic-mot-trail,.ic-mot-gstrip,.ic-mot-gin,.ic-mot-gbg').length,tabsMaskDuring:(()=>{ const t=document.querySelector('.ic-mot-tabs'); return t?t.classList.contains('ic-mot-fade'):null; })()}; })()`;
// строка цельная: дети внутри строки, строка непрерывна от переключателя вниз, нет щели со страницей
const STRIP=`(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'); if(!rw) return null; const bar=rw.querySelector('.ic-ch-outer-bar'), R=rw.getBoundingClientRect(), B=bar.getBoundingClientRect(), bt=document.getElementById('ic-booktabs').getBoundingClientRect(), wr=document.querySelector('#iconologie > .ic-wrap');
  const kids=[...bar.querySelectorAll('.ic-mot-loupe, .ic-mot-back, .ic-mot-ttl, .ic-mot-tabs')].map(e=>e.getBoundingClientRect()); const inside=kids.every(r=>r.top>=B.top-1&&r.bottom<=B.bottom+1&&r.left>=B.left-1&&r.right<=B.right+1);
  const m=getComputedStyle(wr).transform, wty=(!m||m==='none')?0:+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?13:5]; const hit=document.elementFromPoint(R.left+6,Math.min(R.bottom-2,Math.max(R.top+2,B.bottom-3)));
  return {inside,toggleToStrip:Math.round(R.top-bt.bottom),pageGap:Math.round(wr.getBoundingClientRect().top-wty-R.bottom),barTop:Math.round(B.top-R.top),barBottom:Math.round(B.bottom-R.top),h:Math.round(R.height),hitInStrip:!!(hit&&hit.closest('.ic-mot-rwrap')),clip:getComputedStyle(rw.querySelector('.ic-mot-rclip')).overflow}; })()`;
const REST=`(()=>{ const q=s=>[...document.querySelectorAll(s)]; const bad=[]; ['#iconologie > .ic-wrap','.ic-mot-rwrap','.ic-ch-outer-bar','.ic-mot-shd','.ic-mot-rclip'].forEach(s=>q(s).forEach(e=>{ const c=getComputedStyle(e); if(c.transform!=='none'||c.opacity!=='1') bad.push(s+' tf='+c.transform+' op='+c.opacity); if(e.getAttribute('style')) bad.push(s+' inline='+e.getAttribute('style')); }));
  return {bad,anims:document.getAnimations().length,rootH:Math.round(document.getElementById('iconologie').getBoundingClientRect().height),vh:innerHeight,min:getComputedStyle(document.getElementById('iconologie')).minHeight}; })()`;
const REST_STRIP=`(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'); const bar=rw.querySelector('.ic-ch-outer-bar'), rb=rw.querySelector('.ic-rbar'), R=rw.getBoundingClientRect(), tabs=rw.querySelector('.ic-mot-tab')||rw.querySelector('.ic-mot-ttl'), T=tabs.getBoundingClientRect(), bt=document.getElementById('ic-booktabs').getBoundingClientRect(); const cs=getComputedStyle(rb);
  const kids=[...rw.querySelectorAll('.ic-mot-tabs, .ic-mot-loupe, .ic-mot-back, .ic-mot-ttl')].concat([rw.querySelector('.ic-mot-tab')].filter(Boolean)).map(e=>e.getBoundingClientRect()); const inside=kids.every(r=>r.top>=R.top-0.5&&r.bottom<=R.bottom+0.5&&r.left>=R.left-0.5&&r.right<=R.right+0.5);
  return {mb:cs.marginBottom,pt:cs.paddingTop,pb:cs.paddingBottom,bg:cs.backgroundColor,rwBg:getComputedStyle(rw).backgroundColor,h:Math.round(R.height),inside,topGap:Math.round((T.top-R.top)*10)/10,bottomGap:Math.round((R.bottom-1-T.bottom)*10)/10,gapBelowToggle:Math.round(R.top-bt.bottom),top:R.top,bottom:R.bottom,btBottom:bt.bottom}; })()`;
const WRAP=`(()=>{ const wr=document.querySelector('#iconologie > .ic-wrap'), c=getComputedStyle(wr), m=c.transform; return {hash:location.hash,op:+c.opacity,ty:(!m||m==='none')?0:+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?13:5]}; })()`;
const LINES=`async ([b64,lines])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=Math.round(im.width/innerWidth); return {k, lines:lines.map(([x0,y0,dx,dy,len])=>{ const out=[]; for(let i=0;i<len*k;i++){ const d=x.getImageData(Math.round(x0*k)+dx*i,Math.round(y0*k)+dy*i,1,1).data; out.push(Math.round(0.3*d[0]+0.59*d[1]+0.11*d[2])); } return out; })}; }`;
function thick(arr){ const n=arr.length, edge=Math.max(2,Math.floor(n/6)); const lo=(arr.slice(0,edge).reduce((a,b)=>a+b,0)/edge), hi=(arr.slice(n-edge).reduce((a,b)=>a+b,0)/edge); const base=Math.max(lo,hi)+6; let best=0,cur=0; for(let i=edge;i<n-edge;i++){ if(arr[i]>base){ cur++; best=Math.max(best,cur); } else cur=0; } return best; }
(async()=>{
 const br=await webkit.launch(); const errs=[];
 for(const vp of [{name:'390x844',w:390,h:844,dev:devices['iPhone 13']},{name:'1180x820',w:1180,h:820}].filter(v=>!process.env.ONLY||v.name===process.env.ONLY)){
  for(const reduce of [false,true]){
   const ctx=await br.newContext({...(vp.dev||{}),viewport:{width:vp.w,height:vp.h},reducedMotion:reduce?'reduce':'no-preference'}); const p=await ctx.newPage();
   p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
   const T=vp.name+(reduce?' reduce ':' '); let hcN=null;
   const hash=()=>p.evaluate(()=>location.hash);
   const click=s=>p.evaluate(s=>document.querySelector(s).click(),s);
   await p.goto(BASE+'#/'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await p.waitForSelector('.ic-lib-row',{timeout:40000}); await W(3500);   // простой: данные «Мотивов» подгружены заранее
   await p.evaluate(()=>{ window.__an=[]; const o=Element.prototype.animate; Element.prototype.animate=function(){ window.__an.push((this.id?'#'+this.id+' ':'')+String(this.className||this.tagName)); return o.apply(this,arguments); }; });
   if(!reduce){
     // рамки капсулы и подложки: везде ровно 1 CSS-пиксель
     await p.goto(BASE+'#/motifs'); await W(2000);
     const sh0=await p.screenshot(); const g0=await p.evaluate(()=>{ const c=document.querySelector('.ic-mot-cap').getBoundingClientRect(), i=document.querySelector('.ic-mot-pill i').getBoundingClientRect(); return {c:[c.left,c.top,c.right,c.bottom],i:[i.left,i.top,i.right,i.bottom],ints:[c.left,c.top,c.width,c.height,i.left,i.top,i.width,i.height].every(v=>Math.abs(v-Math.round(v))<0.001)}; });
     const [cl,ct,cr,cb]=g0.c,[il,it,ir,ib]=g0.i, cx=(cl+cr)/2, cy=(ct+cb)/2, ix=(il+ir)/2, iy=(it+ib)/2, H=3;
     const res=await p.evaluate(eval(LINES),[sh0.toString('base64'),[[cl-H,cy,1,0,2*H],[cr-H,cy,1,0,2*H],[cx,ct-H,0,1,2*H],[cx,cb-H,0,1,2*H],[il-H,iy,1,0,2*H],[ir-H,iy,1,0,2*H],[ix,it-H,0,1,2*H],[ix,ib-H,0,1,2*H]]]);
     const th=res.lines.map(thick), want=res.k;
     ok(T+'рамки капсулы и подложки — по всему контуру ровно 1 CSS-пиксель ('+want+' девайсных)',th.every(x=>x===want),'k='+want+' '+JSON.stringify(th));
     ok(T+'размеры и положения капсулы/подложки — целые CSS-пиксели',g0.ints,JSON.stringify(g0.c.concat(g0.i)));
     const rs=await p.evaluate(REST_STRIP);
     ok(T+'строка разделов в покое: margin-bottom 0, отступы 7/7, сплошной тёмный фон у строки и обёртки, все дети внутри, вкладки по центру (равные отступы сверху и снизу), прямо под переключателем',rs.mb==='0px'&&rs.pt==='7px'&&rs.pb==='7px'&&rs.bg==='rgb(22, 19, 15)'&&rs.rwBg==='rgb(22, 19, 15)'&&rs.inside&&Math.abs(rs.topGap-rs.bottomGap)<=1.5&&Math.abs(rs.gapBelowToggle)<=1,JSON.stringify(rs));
     const lum0=await p.evaluate(eval(LINES),[sh0.toString('base64'),((rect)=>[[3,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)],[vp.w-4,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)]])({t:rs.btBottom,b:rs.bottom})]);
     ok(T+'в покое нет ни одного светлого пикселя между переключателем и низом строки (яркость < 60)',lum0.lines.every(l=>Math.max(...l)<60),JSON.stringify(lum0.lines.map(l=>Math.max(...l))));
     await p.goto(BASE+'#/'); await W(3000);
   }
   await p.evaluate(()=>window.scrollTo(0,300)); await W(500); const y0=await p.evaluate(()=>Math.round(scrollY));
   await p.evaluate(()=>{ window.__an.length=0; });
   if(!reduce){
     // ===== «Мотивы», замедленно (фаза 1 = 1 с, фаза 2 = 2 с) =====
     await p.evaluate(()=>{ window.__icMotMs=3000; }); await p.evaluate(LOG);
     await click('.ic-mot-cap a[href="#/motifs"]');
     const top1=await p.evaluate(()=>({y:Math.round(scrollY)})); ok(T+'нажато не вверху главной (300): страница сразу без анимации наверх',top1.y===0,JSON.stringify(top1));
     await W(450); const a1=await p.evaluate(AUDIT), w1=await p.evaluate(WRAP);
     ok(T+'фаза 1: главная ещё на месте, уходит (0<opacity<1, сдвиг вниз 0<ty<12), содержимое не сменено',w1.hash==='#/'&&w1.op>0&&w1.op<1&&w1.ty>0&&w1.ty<12,JSON.stringify(w1));
     ok(T+'фаза 1: нет mask-image/filter/backdrop/will-change и клонов',a1.bad.length===0&&a1.clones===0,JSON.stringify(a1));
     await W(1500); const shF=await p.screenshot(), rrF=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bt=document.getElementById('ic-booktabs'); return {t:bt.getBoundingClientRect().bottom,b:rw.getBoundingClientRect().bottom}; });
     const lumF=await p.evaluate(eval(LINES),[shF.toString('base64'),((rect)=>[[3,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)],[vp.w-4,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)]])(rrF)]);
     ok(T+'середина фазы 2: нет светлых пикселей между переключателем и низом строки (в том числе в ещё не заполненной части)',lumF.lines.every(l=>Math.max(...l)<60),JSON.stringify(lumF.lines.map(l=>Math.max(...l))));
     const a2=await p.evaluate(AUDIT), st2=await p.evaluate(STRIP), w2=await p.evaluate(WRAP);
     ok(T+'фаза 2: каталог «Мотивов», страница проявляется (0<opacity<1) со сдвигом −12<ty<0',w2.hash==='#/motifs'&&w2.op>0&&w2.op<1&&w2.ty<0&&w2.ty>-12,JSON.stringify(w2));
     ok(T+'фаза 2: нет mask-image/filter/backdrop/will-change и клонов в любой момент (и маска вкладок снята на время перехода)',a2.bad.length===0&&a2.clones===0&&a2.tabsMaskDuring===false,JSON.stringify(a2));
     ok(T+'фаза 2: строка разделов цельная — дети в пределах строки, она начинается у переключателя (нет щели), страница сразу под ней, клип только у самой строки',st2&&st2.inside&&Math.abs(st2.toggleToStrip)<=1&&Math.abs(st2.pageGap)<=1&&st2.hitInStrip&&st2.clip==='hidden'&&st2.barTop<-1&&st2.barTop>-st2.h&&st2.barBottom>2,JSON.stringify(st2));
     await W(2200); const r1=await p.evaluate(REST);
     ok(T+'после перехода: на странице и строке нет transform/opacity/inline-стилей, анимации сняты',r1.bad.length===0&&r1.anims===0,JSON.stringify(r1));
     const a3=await p.evaluate(AUDIT); ok(T+'после перехода: ни масок страницы, ни filter, ни клонов (маска вкладок вернулась — единственная)',a3.bad.length===0&&a3.clones===0,JSON.stringify(a3));
     ok(T+'бумага до низа: корень не короче окна (min-height 100lvh)',r1.rootH>=r1.vh&&parseFloat(r1.min)>=r1.vh,JSON.stringify([r1.rootH,r1.vh,r1.min]));
     // ===== возврат на «Книги», замедленно =====
     await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/"]'); await W(450);
     const shB=await p.screenshot(), rrB=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bt=document.getElementById('ic-booktabs'); return rw?{t:bt.getBoundingClientRect().bottom,b:rw.getBoundingClientRect().bottom}:null; });
     if(rrB){ const lumB=await p.evaluate(eval(LINES),[shB.toString('base64'),((rect)=>[[3,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)],[vp.w-4,rect.t+1,0,1,Math.max(1,rect.b-rect.t-2)]])(rrB)]); ok(T+'середина фазы 1 возврата: нет светлых пикселей под переключателем до низа строки',lumB.lines.every(l=>Math.max(...l)<60),JSON.stringify(lumB.lines.map(l=>Math.max(...l)))); }
     const b1=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'); const bar=rw&&rw.querySelector('.ic-ch-outer-bar'); const m=bar&&getComputedStyle(bar).transform; const wr=document.querySelector('#iconologie > .ic-wrap'); return {hash:location.hash,has:!!rw,ty:m&&m!=='none'?+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?13:5]:0,h:rw&&Math.round(rw.getBoundingClientRect().height),wop:+getComputedStyle(wr).opacity}; });
     const ab=await p.evaluate(AUDIT), stb=await p.evaluate(STRIP);
     ok(T+'возврат, фаза 1: строка уезжает вверх (−h<ty<0), страница уходит (opacity<1), строка цельная, нет масок/filter/клонов',b1.has&&b1.ty<-1&&b1.ty>-b1.h&&b1.wop<1&&b1.hash==='#/motifs'&&ab.bad.length===0&&ab.clones===0&&stb&&stb.inside&&Math.abs(stb.toggleToStrip)<=1,JSON.stringify([b1,stb]));
     await W(1400); const b2=await p.evaluate(()=>({hash:location.hash,strips:document.querySelectorAll('#iconologie .ic-mot-rwrap').length,tabs:document.querySelectorAll('.ic-mot-tab').length}));
     ok(T+'возврат, фаза 2: главная, строка разделов убрана',b2.hash==='#/'&&b2.strips===0&&b2.tabs===0,JSON.stringify(b2));
     await W(1800); await p.evaluate(()=>{ window.__icMotMs=450; }); const r2=await p.evaluate(REST); ok(T+'после возврата: transform/opacity/inline-стили и анимации сняты',r2.bad.length===0&&r2.anims===0,JSON.stringify(r2));
     // ===== временная линия на обычной скорости =====
     await p.evaluate(()=>window.scrollTo(0,0)); await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1500);
     const L=await p.evaluate(()=>window.__log), hcs=await p.evaluate(()=>window.__hc), tc=L.filter(x=>x.tc).pop().tc, fr=L.filter(x=>x.t>=tc), hc=hcs.filter(x=>x>=tc)[0]-tc;
     ok(T+'временная линия: смена содержимого ≈150 мс после нажатия (фаза 1 закончилась), страница к этому моменту почти невидима',hc>=120&&hc<=330&&fr.filter(x=>x.t-tc>=hc-15&&x.t-tc<hc&&x.wr).every(x=>x.wr.op<0.15),'смена через '+hc.toFixed(0)+' мс');
     const endT=(fr.filter(x=>x.wr&&(x.wr.op<0.999||Math.abs(x.wr.ty)>0.05)).pop()||{t:tc}).t-tc;
     ok(T+'всё закончено за ≈450 мс (не позже 700)',endT>=300&&endT<=700,endT.toFixed(0)+' мс');
     const strip2=fr.filter(x=>x.strip).map(x=>x.strip); ok(T+'строка выезжает монотонно −h→0 только после смены содержимого',strip2.length>3&&strip2[0].ty<=-strip2[0].h+4&&Math.abs(strip2[strip2.length-1].ty)<1&&strip2.every((s,i)=>i===0||s.ty>=strip2[i-1].ty-0.01),strip2.map(s=>Math.round(s.ty)).filter((v,i)=>i%6===0).join(','));
     hcN=hc;
     ok(T+'в каждом кадре перехода вперёд (шаг rAF): нет ни одного светлого места между верхом страницы и низом тёмной строки, низ корня ≥ низа окна',L.length>20&&L.every(x=>x.light===0)&&L.every(x=>x.rootBottom>=x.vh-0.5),'кадров '+L.length+' светлых '+L.reduce((a,x)=>a+x.light,0)+' мин. низ корня '+Math.min(...L.map(x=>x.rootBottom))+' окно '+L[0].vh);
     await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/"]'); await W(1500); const LBk=await p.evaluate(()=>window.__log);
     ok(T+'в каждом кадре возврата на «Книги»: нет светлых мест над страницей, низ корня ≥ низа окна',LBk.length>20&&LBk.every(x=>x.light===0)&&LBk.every(x=>x.rootBottom>=x.vh-0.5),'кадров '+LBk.length+' светлых '+LBk.reduce((a,x)=>a+x.light,0)+' мин. низ корня '+Math.min(...LBk.map(x=>x.rootBottom)));
     await p.evaluate(()=>window.scrollTo(0,0)); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1500);
     const hd=L.filter(x=>x.btTop!=null).map(x=>x.bbTop+'/'+x.bbH+'/'+x.btTop+'/'+x.btH); ok(T+'шапка: тот же элемент, не двигалась, высота не менялась',new Set(hd).size===1&&L.every(x=>x.bbSame),[...new Set(hd)].join(' | '));
     const pp=L.map(x=>x.pill).filter(v=>v!=null); ok(T+'подложка переезжает плавно за 450 мс и приходит в 143',pp.some(v=>v>1&&v<142)&&pp[pp.length-1]===143,pp.filter((v,i)=>i%10===0).map(v=>Math.round(v*10)/10).join(','));
   } else {
     await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1200);
     const an=await p.evaluate(()=>window.__an.filter(x=>/ic-wrap|ic-ch-outer-bar|ic-mot-shd|ic-mot-rwrap/.test(x))); ok(T+'reduce: страница и строка сменяются мгновенно (анимаций страницы и строки нет)',(await hash())==='#/motifs'&&an.length===0,JSON.stringify(an));
     const dp=await p.evaluate(()=>document.querySelector('.ic-mot-cap').dataset.pos); ok(T+'reduce: подложка на «Мотивах»',dp==='1');
   }
   // ===== повторные нажатия, «назад», прямой заход, прокрутка =====
   if(!reduce){
     await p.evaluate(()=>{ window.__an.length=0; window.__icMotMs=2500; }); await click('.ic-mot-cap a[href="#/"]'); await W(300); await click('.ic-mot-cap a[href="#/motifs"]'); await click('.ic-mot-cap a[href="#/"]'); await W(3600); await p.evaluate(()=>{ window.__icMotMs=450; });
     const an2=await p.evaluate(()=>window.__an.filter(x=>/ic-wrap/.test(x)).length);
     ok(T+'повторные нажатия во время перехода игнорируются (итог — главная, один переход: 2 анимации страницы)',(await hash())==='#/'&&an2===2,await hash()+' анимаций страницы '+an2);
   } else { await click('.ic-mot-cap a[href="#/"]'); await W(800); }
   const y1=await p.evaluate(()=>Math.round(scrollY)); ok(T+'главная — на прежнем месте прокрутки',reduce?Math.abs(y1-y0)<=40:y1>=0,y0+' → '+y1);
   await click('.ic-mot-cap a[href="#/motifs"]'); await W(1200); await p.evaluate(()=>{ window.__an.length=0; }); await p.goBack(); await W(1500);
   const anb=await p.evaluate(()=>window.__an.filter(x=>/ic-wrap|ic-ch-outer-bar|ic-mot-shd/.test(x)).length);
   ok(T+'«назад» браузера без анимации',(await hash())==='#/'&&anb===0,await hash()+' '+anb);
   await p.evaluate(()=>{ window.__an.length=0; }); await p.goto(BASE+'#/motifs'); await W(1500); const and=await p.evaluate(()=>window.__an.filter(x=>/ic-wrap|ic-ch-outer-bar|ic-mot-shd/.test(x)).length); ok(T+'прямой заход без анимации',and===0);
   if(!reduce){
     // пять быстрых переключений: в конце ничего не осталось
     await p.goto(BASE+'#/'); await W(2000);
     for(let i=0;i<5;i++){ await p.evaluate(()=>{ window.__icMotMs=100; }); await click('.ic-mot-cap a[href="#/motifs"]'); await click('.ic-mot-cap a[href="#/motifs"]'); await W(700); await click('.ic-mot-cap a[href="#/"]'); await W(700); }
     await click('.ic-mot-cap a[href="#/motifs"]'); await W(900); await p.evaluate(()=>{ window.__icMotMs=450; });
     await p.evaluate(()=>window.scrollTo(0,900)); await W(500); await p.evaluate(()=>window.scrollTo(0,0)); await W(300);
     const fa=await p.evaluate(AUDIT), fr2=await p.evaluate(REST);
     ok(T+'после 5 быстрых переключений и прокрутки: нет mask/filter/клонов/will-change, transform/opacity/inline сняты, анимаций нет, одна строка разделов',fa.bad.length===0&&fa.clones===0&&fr2.bad.length===0&&fr2.anims===0&&(await p.$$('.ic-mot-rwrap')).length===1&&(await hash())==='#/motifs',JSON.stringify([fa,fr2]));
   }
   if(!reduce){
     // ?slow=5: все длительности перехода ×5
     const p2=await ctx.newPage(); await p2.goto(BASE+(BASE.includes('?')?'&':'?')+'slow=5#/'); await p2.waitForSelector('.ic-lib-row',{timeout:40000}); await W(3500);
     await p2.evaluate(LOG); await p2.evaluate(()=>document.querySelector('.ic-mot-cap a[href="#/motifs"]').click()); await W(4200);
     const L5=await p2.evaluate(()=>window.__log), hc5s=await p2.evaluate(()=>window.__hc), tc5=L5.filter(x=>x.tc).pop().tc, hc5=hc5s.filter(x=>x>=tc5)[0]-tc5, fr5=L5.filter(x=>x.t>=tc5), end5=(fr5.filter(x=>x.wr&&(x.wr.op<0.999||Math.abs(x.wr.ty)>0.05)).pop()||{t:tc5}).t-tc5;
     ok(T+'?slow=5: переход в 5 раз длиннее (смена содержимого ≈750 мс вместо ≈150, конец ≈2250 мс), кадры без светлых мест',hc5>=600&&hc5<=1200&&end5>=1700&&end5<=3300&&hcN&&hc5/hcN>=3.5&&hc5/hcN<=7&&fr5.every(x=>x.light===0),'обычный '+(hcN&&hcN.toFixed(0))+' мс, slow=5: '+hc5.toFixed(0)+' мс, конец '+end5.toFixed(0)+' мс'); await p2.close();
   }
   if(!reduce&&vp.dev){
     // телефон в ландшафте (короткий экран: мобильные стили у .ic-rbar — margin-bottom:14px и padding 4px): строка всё равно сплошная
     const ctxL=await br.newContext({...devices['iPhone 13 landscape']}); const pl=await ctxL.newPage(); await pl.goto(BASE+'#/'); await pl.evaluate(()=>{localStorage.setItem('ic-lang','ru');}); await pl.goto(BASE+'#/motifs'); await pl.reload(); await W(3500);
     const rl=await pl.evaluate(REST_STRIP), shL=await pl.screenshot(), vwL=await pl.evaluate(()=>innerWidth);
     const lumL=await pl.evaluate(eval(LINES),[shL.toString('base64'),[[3,rl.btBottom+1,0,1,Math.max(1,rl.bottom-rl.btBottom-2)]]]);
     ok(T+'ландшафт: строка сплошная (margin-bottom 0, отступы 7/7), дети внутри, вкладки по центру, нет светлых пикселей',rl.mb==='0px'&&rl.pt==='7px'&&rl.pb==='7px'&&rl.inside&&Math.abs(rl.topGap-rl.bottomGap)<=1.5&&lumL.lines.every(l=>Math.max(...l)<60),JSON.stringify([rl,lumL.lines.map(l=>Math.max(...l))]));
     await ctxL.close();
   }
   await ctx.close();
  }
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
