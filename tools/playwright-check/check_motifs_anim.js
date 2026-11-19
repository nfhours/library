/* Переход «Книги ⇄ Мотивы» (v258): главная и каталог «Мотивов» — две панели, собранные один раз и живущие в DOM (скрытая — `.ic-pane-off`); нажатие только переключает готовые.
 * Обе панели на время перехода лежат друг на друге абсолютно, каждая на своём конечном месте; строка разделов абсолютная поверх, её контейнер анимирует height (0↔H).
 * После подготовки ждём два requestAnimationFrame и стартуем ВСЕ анимации с общим startTime. Тайминг: уход старой 0–180 (opacity 1→0, +6px), появление новой 90–790 (0→1, −6→0),
 * шапка/строка 0–320, подложка 0–510; конец ≈790: абсолютность снята, старая панель скрыта, положение совпадает пиксель в пиксель.
 * Проверяется: с искусственной нагрузкой (главный поток занят 300 мс в обработчике нажатия) анимации стартуют с нуля; нет кадра пустой бумаги; плитка/книга не уходят от мест больше 6px
 * и не скачут в конце; строка цельная; нет клонов/масок/filter/will-change; капсула; ?slow=5; повторные нажатия, «назад», прямой заход, reduce-motion; главная и «Персонажи» — нативная шапка.
 * Запуск (из корня репозитория): python3 -m http.server 8977 & ; cd tools/playwright-check && BASE=http://localhost:8977/index.html node check_motifs_anim.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8977/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(n,c,x)=>{ if(!c){bad++;} console.log((c?'ok  ':'FAIL ')+n+(x?' '+x:'')); };
// кадры (на каждом rAF)
const LOG=`(()=>{ window.__log=[]; window.__tc=null;
 if(!window.__clk){ window.__clk=1; document.addEventListener('click',()=>{ window.__tc=performance.now(); },true); }
 const bbEl=document.querySelector('.back-bar'); const mt=(e,i)=>{ if(!e) return null; const m=getComputedStyle(e).transform; return (!m||m==='none')?0:+m.slice(m.indexOf('(')+1,-1).split(',')[m.startsWith('matrix3d')?i[1]:i[0]]; };
 const f=()=>{ const q=s=>document.querySelector(s); const homeP=q('#iconologie > .ic-pane[data-pane="home"]'), motP=q('#iconologie > .ic-pane[data-pane="motifs"]'), old=q('#iconologie > .ic-pane[data-mot="old"]'), nw=q('#iconologie > .ic-pane[data-mot="new"]'), sg=q('#iconologie > .ic-pane:not(.ic-pane-off):not([data-mot])'), bb=bbEl.getBoundingClientRect(), bt=document.getElementById('ic-booktabs'), b=bt&&bt.getBoundingClientRect(), pill=q('.ic-mot-pill');
  const rw0=q('#iconologie .ic-mot-rwrap'), rw=(rw0&&getComputedStyle(rw0).display!=='none')?rw0:null, clip=rw&&rw.querySelector('.ic-mot-rclip'), bar=rw&&rw.querySelector('.ic-ch-outer-bar');
  const homeVis=homeP&&!homeP.classList.contains('ic-pane-off'), motVis=motP&&!motP.classList.contains('ic-pane-off'), row=homeVis?homeP.querySelector('.ic-lib-row'):null, tile=motVis?motP.querySelector('.ic-mot-tile'):null, rootE=document.getElementById('iconologie'), rootR=rootE.getBoundingClientRect();
  let light=0; const rwb=rw?rw.getBoundingClientRect().bottom:(b?b.bottom:0); for(const x of [2,innerWidth-3]) for(let y=1;y<rwb-1;y+=6){ const el=document.elementFromPoint(x,y); if(!el||!el.closest('.back-bar, .ic-booktabs, .ic-mot-rwrap')) light++; }
  const op=e=>e?+getComputedStyle(e).opacity:null;
  window.__log.push({t:performance.now(),tc:window.__tc,hash:location.hash,old:old?{op:op(old),ty:mt(old,[5,13]),pos:getComputedStyle(old).position}:null,nw:nw?{op:op(nw),ty:mt(nw,[5,13]),pos:getComputedStyle(nw).position}:null,sg:sg?{op:op(sg),pos:getComputedStyle(sg).position}:null,
   anims:document.getAnimations().map(a=>Math.round(a.currentTime||0)),
   rowTop:row?Math.round(row.getBoundingClientRect().top*10)/10:null,tileTop:tile?Math.round(tile.getBoundingClientRect().top*10)/10:null,
   rw:rw?{clipH:Math.round(clip.getBoundingClientRect().height*10)/10,top:Math.round(rw.getBoundingClientRect().top*10)/10,pos:getComputedStyle(rw).position,btBottom:b?Math.round(b.bottom*10)/10:null,barTy:mt(bar,[5,13]),old:rw.getAttribute('data-mot')==='old',inline:!!rw.getAttribute('style')}:null,
   light,rootBottom:Math.round(rootR.bottom),vh:innerHeight,rootStyle:rootE.getAttribute('style')||'',nMot:document.querySelectorAll('[data-mot]').length,
   bbSame:document.querySelector('.back-bar')===bbEl,bbTop:Math.round(bb.top),bbH:Math.round(bb.height),btTop:b?Math.round(b.top):null,btH:b?Math.round(b.height):null,pill:pill?mt(pill,[4,12]):null});
  if(window.__log.length<900) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`;
const AUDIT=`(()=>{ const bad=[]; document.querySelectorAll('html, body, body *').forEach(e=>{ const c=getComputedStyle(e), mk=(c.webkitMaskImage&&c.webkitMaskImage!=='none')||(c.maskImage&&c.maskImage!=='none'), bf=(c.webkitBackdropFilter||c.backdropFilter||'none');
  const nm=(e.id?'#'+e.id:'')+e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0];
  if(mk&&!(e.classList.contains('ic-mot-tabs')&&e.classList.contains('ic-mot-fade'))) bad.push(nm+' mask'); if(c.filter!=='none'&&!e.matches('.ic-lib-thumb img')) bad.push(nm+' filter'); if(bf&&bf!=='none') bad.push(nm+' backdrop'); if(c.willChange&&c.willChange!=='auto') bad.push(nm+' will-change='+c.willChange); });
  return {bad,clones:document.querySelectorAll('.ic-mot-ghost,.ic-mot-trail,.ic-mot-gstrip,.ic-mot-gin,.ic-mot-gbg').length}; })()`;
const REST=`(()=>{ const q=s=>[...document.querySelectorAll(s)]; const bad=[]; ['#iconologie > .ic-pane:not(.ic-pane-off)','.ic-mot-rwrap','.ic-ch-outer-bar','.ic-mot-shd','.ic-mot-rclip'].forEach(s=>q(s).forEach(e=>{ if(e.matches('.ic-mot-rwrap')&&getComputedStyle(e).display==='none') return; const c=getComputedStyle(e); if(c.transform!=='none'||c.opacity!=='1') bad.push(s+' tf='+c.transform+' op='+c.opacity); if(e.getAttribute('style')) bad.push(s+' inline='+e.getAttribute('style')); if(e.matches('.ic-pane')&&c.position!=='static') bad.push(s+' position='+c.position); }));
  q('#iconologie > .ic-pane.ic-pane-off').forEach(e=>{ if(e.getAttribute('style')) bad.push('off inline='+e.getAttribute('style')); });
  const r=document.getElementById('iconologie'), rw=q('.ic-mot-rwrap')[0]; return {bad,anims:document.getAnimations().length,wraps:q('#iconologie > .ic-pane:not(.ic-pane-off)').length,dataMot:q('[data-mot]').length,rootStyle:r.getAttribute('style')||'',rootH:Math.round(r.getBoundingClientRect().height),vh:innerHeight,min:getComputedStyle(r).minHeight,rwPos:(rw&&getComputedStyle(rw).display!=='none')?getComputedStyle(rw).position:null}; })()`;
const PILL=`(()=>{ const c=document.querySelector('.ic-mot-cap'), p=document.querySelector('.ic-mot-pill i'), a=[...c.querySelectorAll('a')]; const C=c.getBoundingClientRect(), P=p.getBoundingClientRect(); const lab=a.map(x=>{ const r=x.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(x.firstChild); const t=rg.getBoundingClientRect(); const ls=parseFloat(getComputedStyle(x).letterSpacing)||0; return (t.left+(t.width-ls)/2)-(r.left+r.width/2); });
  return {pos:c.dataset.pos,gapL:Math.round((P.left-C.left-1)*100)/100,gapR:Math.round((C.right-1-P.right)*100)/100,w:Math.round(P.width*100)/100,capInner:Math.round((C.width-2)*100)/100,lab}; })()`;
const LINES=`async ([b64,lines])=>{ const im=new Image(); await new Promise(r=>{im.onload=r; im.src='data:image/png;base64,'+b64;}); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); const k=Math.round(im.width/innerWidth); return {k, lines:lines.map(([x0,y0,dx,dy,len])=>{ const out=[]; for(let i=0;i<len*k;i++){ const d=x.getImageData(Math.round(x0*k)+dx*i,Math.round(y0*k)+dy*i,1,1).data; out.push(Math.round(0.3*d[0]+0.59*d[1]+0.11*d[2])); } return out; })}; }`;
const HDR=`(()=>{ const bb=document.querySelector('.back-bar'), bt=document.getElementById('ic-booktabs'), st=document.getElementById('ic-stack'), r=document.getElementById('iconologie').getBoundingClientRect();
  return {y:Math.round(scrollY),bbTop:Math.round(bb.getBoundingClientRect().top),btTop:Math.round(bt.getBoundingClientRect().top),bbPos:getComputedStyle(bb).position,stackPos:getComputedStyle(st).position,cls:[document.documentElement.className,bb.className,st.className,bt.className].join('|'),tf:getComputedStyle(bb).transform+getComputedStyle(st).transform,rootBottom:Math.round(r.bottom),vh:innerHeight,sh:document.documentElement.scrollHeight}; })()`;
function thick(arr){ const n=arr.length, edge=Math.max(2,Math.floor(n/6)); const lo=(arr.slice(0,edge).reduce((a,b)=>a+b,0)/edge), hi=(arr.slice(n-edge).reduce((a,b)=>a+b,0)/edge); const base=Math.max(lo,hi)+6; let best=0,cur=0; for(let i=edge;i<n-edge;i++){ if(arr[i]>base){ cur++; best=Math.max(best,cur); } else cur=0; } return best; }
function maxStep(fr,key){ let m=0; for(let i=1;i<fr.length;i++){ const dt=fr[i].t-fr[i-1].t; if(dt<4) continue; m=Math.max(m,Math.abs(fr[i][key]-fr[i-1][key])*16.7/dt); } return m; }
(async()=>{
 const br=await webkit.launch(); const errs=[];
 for(const vp of [{name:'390x844',w:390,h:844,dev:devices['iPhone 13']},{name:'1180x820',w:1180,h:820}].filter(v=>!process.env.ONLY||v.name===process.env.ONLY)){
  for(const reduce of [false,true]){
   const ctx=await br.newContext({...(vp.dev||{}),viewport:{width:vp.w,height:vp.h},reducedMotion:reduce?'reduce':'no-preference'}); const p=await ctx.newPage();
   p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
   const T=vp.name+(reduce?' reduce ':' ');
   const hash=()=>p.evaluate(()=>location.hash);
   const click=s=>p.evaluate(s=>document.querySelector(s).click(),s);
   await p.goto(BASE+'#/'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await p.waitForSelector('.ic-lib-row',{timeout:40000}); await W(3500);
   await p.evaluate(()=>{ window.__an=[]; const o=Element.prototype.animate; Element.prototype.animate=function(){ window.__an.push((this.id?'#'+this.id+' ':'')+String(this.className||this.tagName)); return o.apply(this,arguments); }; });
   if(!reduce){
     // ===== главная: нативная шапка (без скриптов скрытия), бумага до низа =====
     const hh=[]; for(const y of [0,600,300,900,0]){ await p.evaluate(y=>window.scrollTo(0,y),y); await W(350); hh.push(await p.evaluate(HDR)); }
     ok(T+'главная: шапка движется ровно вместе с прокруткой (верх «Библиотеки» = −прокрутка), нет классов и стилей старого скрытия, стек не липкий, html тёмный, низ корня ≥ низа окна',hh.every(g=>Math.abs(g.bbTop+g.y)<=1&&!/ic-bb-hidden|ic-stack-hidden|ic-rbar-snap/.test(g.cls)&&/ic-flow-page/.test(g.cls)&&g.bbPos==='relative'&&g.stackPos==='static'&&g.rootBottom>=g.vh-0.5&&!/matrix/.test(g.tf)),JSON.stringify(hh.map(g=>[g.y,g.bbTop,g.rootBottom])));
     // ===== капсула =====
     const pl0=await p.evaluate(PILL);
     await p.goto(BASE+'#/motifs'); await W(2000);
     const pl1=await p.evaluate(PILL);
     ok(T+'капсула: подложка — ровно половина внутренней ширины (calc(50% − 4px)), внешний отступ 4px слева (в положении «Книги») и справа (в положении «Мотивы»), подпись по центру подложки',pl0.pos==='0'&&pl1.pos==='1'&&Math.abs(pl0.gapL-4)<=0.01&&Math.abs(pl1.gapR-4)<=0.01&&Math.abs(pl0.gapR-(pl0.capInner-4-pl0.w))<=0.51&&Math.abs(pl1.gapL-(pl1.capInner-4-pl1.w))<=0.51&&[pl0,pl1].every(x=>Math.abs(x.w-(x.capInner/2-4))<=0.51&&x.lab.every(l=>Math.abs(l)<=1)),JSON.stringify([pl0,pl1]));
     const sh0=await p.screenshot(); const g0=await p.evaluate(()=>{ const c=document.querySelector('.ic-mot-cap').getBoundingClientRect(), i=document.querySelector('.ic-mot-pill i').getBoundingClientRect(); return {c:[c.left,c.top,c.right,c.bottom],i:[i.left,i.top,i.right,i.bottom],ints:[c.left,c.top,c.width,c.height,i.left,i.top,i.width,i.height].every(v=>Math.abs(v-Math.round(v))<0.001)}; });
     const [cl,ct,cr,cb]=g0.c,[il,it,ir,ib]=g0.i, cx=(cl+cr)/2, cy=(ct+cb)/2, ix=(il+ir)/2, iy=(it+ib)/2, H=3;
     const res=await p.evaluate(eval(LINES),[sh0.toString('base64'),[[cl-H,cy,1,0,2*H],[cr-H,cy,1,0,2*H],[cx,ct-H,0,1,2*H],[cx,cb-H,0,1,2*H],[il-H,iy,1,0,2*H],[ir-H,iy,1,0,2*H],[ix,it-H,0,1,2*H],[ix,ib-H,0,1,2*H]]]);
     const th=res.lines.map(thick), want=res.k;
     ok(T+'рамки капсулы и подложки — по всему контуру ровно 1 CSS-пиксель ('+want+' девайсных)',th.every(x=>x===want),'k='+want+' '+JSON.stringify(th));
     ok(T+'размеры и положения капсулы/подложки — целые CSS-пиксели',g0.ints,JSON.stringify(g0.c.concat(g0.i)));
     // ===== короткая вкладка «Персонажи»: нативная шапка, корень не короче окна, есть запас прокрутки =====
     await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="персонаж"]').click()); await W(700);
     const cc=[]; for(const y of [0,40,90,0]){ await p.evaluate(y=>window.scrollTo(0,y),y); await W(300); cc.push(await p.evaluate(HDR)); }
     ok(T+'«Персонажи» (короткая страница): низ корня ≥ низа окна, есть запас прокрутки на высоту шапки (шапка уезжает целиком, а не застревает наполовину), шапка не двигается скриптом (верх = −прокрутка), без классов скрытия',cc.every(g=>g.rootBottom>=g.vh-0.5&&Math.abs(g.bbTop+g.y)<=1&&!/ic-bb-hidden|ic-stack-hidden|ic-rbar-snap/.test(g.cls)&&!/matrix/.test(g.tf))&&cc[0].sh-cc[0].vh>=100,JSON.stringify(cc.map(g=>[g.y,g.bbTop,g.rootBottom,g.sh])));
     await p.evaluate(()=>document.querySelector('.ic-mot-tab[data-cat="all"]').click()); await W(400);
     await p.goto(BASE+'#/'); await W(2500);
   }
   await p.evaluate(()=>window.scrollTo(0,300)); await W(500);
   await p.evaluate(()=>{ window.__an.length=0; });
   if(!reduce){
     // ===== «Мотивы», обычная скорость: покадровая проверка =====
     const rowRest=await p.evaluate(()=>{ window.scrollTo(0,0); return Math.round(document.querySelector('#iconologie > .ic-pane[data-pane="home"] .ic-lib-row').getBoundingClientRect().top*10)/10; }); await W(300);
     await p.evaluate(()=>window.scrollTo(0,300)); await W(300); await p.evaluate(LOG);
     await click('.ic-mot-cap a[href="#/motifs"]');
     const top1=await p.evaluate(()=>({y:Math.round(scrollY)})); ok(T+'нажато не вверху главной (300): страница сразу без анимации наверх',top1.y===0,JSON.stringify(top1));
     await W(1800);
     const L=await p.evaluate(()=>window.__log), tc=L.filter(x=>x.tc).pop().tc, fr=L.filter(x=>x.t>=tc), inT=fr.filter(x=>x.nMot>0), tEnd=inT.length?inT[inT.length-1].t-tc:0, after=fr.filter(x=>x.nMot===0&&x.t-tc>tEnd).slice(0,3);
     const ts=(inT.find(x=>x.old&&x.old.op<0.999)||inT[0]).t, fa=fr.find(x=>x.anims.length>0), dtFirst=fa?fa.t-tc:null;
     ok(T+'от тапа до первого кадра анимации ≤ 120 мс (без нагрузки: '+(dtFirst==null?'—':dtFirst.toFixed(0))+' мс)',dtFirst!=null&&dtFirst<=120,'старт по часам анимации через '+(ts-tc).toFixed(0)+' мс');
     const vis=x=>(x.old&&x.old.op>0.05)||(x.nw&&x.nw.op>0.05)||(x.sg&&x.sg.op>0.05);
     ok(T+'в каждом кадре перехода видна хотя бы одна страница (нет кадра пустой бумаги: opacity старой или новой > 0,05)',inT.length>20&&inT.every(vis),'кадров '+inT.length+' пустых '+inT.filter(x=>!vis(x)).length);
     ok(T+'обе панели на время перехода абсолютные (на своих конечных местах); после — новая в обычной раскладке, старая скрыта (ic-pane-off)',inT.every(x=>(!x.old||x.old.pos==='absolute')&&(!x.nw||x.nw.pos==='absolute'))&&after.length>0&&after.every(x=>x.sg&&x.sg.pos==='static'&&!x.old&&!x.nw),'кадров перехода '+inT.length);
     ok(T+'конец перехода ≈790 мс от старта анимаций (700–900)',inT.length>0&&(inT[inT.length-1].t-ts)>=700&&(inT[inT.length-1].t-ts)<=900,(inT.length?(inT[inT.length-1].t-ts):0).toFixed(0)+' мс');
     const oldF=inT.filter(x=>x.old), newF=inT.filter(x=>x.nw);
     const o190=oldF.filter(x=>x.anims.length&&Math.max(...x.anims)>=190)[0], n80=newF.filter(x=>x.anims.length&&Math.max(...x.anims)<=80), n130=newF.find(x=>x.anims.length&&Math.max(...x.anims)>=130), oty=Math.max(...oldF.map(x=>x.old.ty));
     ok(T+'старая страница: уход 0–180 мс (к 190 мс opacity ≈ 0), сдвиг вниз до +6px',o190&&o190.old.op<=0.06&&oty>4.5&&oty<=6.2,'opacity@190 '+(o190&&o190.old.op.toFixed(3))+' ty max '+oty.toFixed(2));
     ok(T+'новая страница: до 90 мс невидима, дальше проявляется 700 мс (на 130 мс уже видна), сдвиг −6→0',n80.every(x=>x.nw.op<=0.02)&&n130&&n130.nw.op>0.05&&Math.min(...newF.map(x=>x.nw.ty))>=-6.1&&Math.abs(newF[newF.length-1].nw.ty)<0.6,'opacity@≤80: '+Math.max(0,...n80.map(x=>x.nw.op)).toFixed(3)+', @130: '+(n130&&n130.nw.op.toFixed(3)));
     // позиции
     const tileFinal=after.length?after[0].tileTop:null, rowFr=inT.filter(x=>x.rowTop!=null), tileFr=inT.filter(x=>x.tileTop!=null);
     ok(T+'первая книга главной не уходит от своего места больше чем на 6px сдвига (макс. '+Math.max(...rowFr.map(x=>Math.abs(x.rowTop-rowRest))).toFixed(1)+' px)',rowFr.length>10&&rowFr.every(x=>Math.abs(x.rowTop-rowRest)<=6.6),'место '+rowRest);
     ok(T+'первая плитка «Мотивов» не уходит от конечного места больше чем на 6px (макс. '+Math.max(...tileFr.map(x=>Math.abs(x.tileTop-tileFinal))).toFixed(1)+' px) и не скачет в конце (до/после снятия абсолютной позиции: '+(tileFr.length&&tileFinal!=null?Math.abs(tileFr[tileFr.length-1].tileTop-tileFinal).toFixed(2):'—')+' px)',tileFr.length>10&&tileFinal!=null&&tileFr.every(x=>Math.abs(x.tileTop-tileFinal)<=6.6)&&Math.abs(tileFr[tileFr.length-1].tileTop-tileFinal)<=0.6&&tileFr.slice(1).every((x,i)=>Math.abs(x.tileTop-tileFr[i].tileTop)<=6.6),'конечное '+tileFinal);
     // строка разделов
     const rwF=inT.filter(x=>x.rw&&!x.rw.old), ch=rwF.map(x=>x.rw.clipH), stepF=maxStep(rwF.map(x=>({t:x.t,v:x.rw.clipH})),'v');
     ok(T+'строка разделов: абсолютная, сразу под шапкой (верх = низ переключателя); контейнер растёт монотонно с 0 до H, в первых кадрах начинается с 0 (макс. шаг '+stepF.toFixed(1)+' px/кадр)',rwF.length>10&&rwF.every(x=>x.rw.pos==='absolute'&&Math.abs(x.rw.top-x.rw.btBottom)<=1)&&ch[0]<=3&&ch[ch.length-1]>=50&&ch.every((v,i)=>i===0||v>=ch[i-1]-0.2)&&stepF<=12,ch.filter((v,i)=>i%5===0).join(','));
     const tH=(rwF.find(x=>x.rw.clipH>=52.5)||{t:ts}).t-ts; ok(T+'выезд строки 0–320 мс от старта: полная высота к ≈320 (260–420)',tH>=200&&tH<=420,tH.toFixed(0)+' мс');
     ok(T+'после перехода строка в обычной прилипающей позиции без inline-стилей (position: sticky)',after.length>0&&after.every(x=>x.rw&&x.rw.pos==='sticky'&&!x.rw.inline&&Math.abs(x.rw.clipH-53)<=1),JSON.stringify(after[0]&&after[0].rw));
     ok(T+'в каждом кадре нет светлых мест между верхом страницы и низом тёмной строки; низ корня ≥ низа окна; корень зафиксирован на время перехода и освобождён после',fr.length>20&&fr.every(x=>x.light===0&&x.rootBottom>=x.vh-0.5)&&inT.every(x=>/position: relative/.test(x.rootStyle)&&/min-height/.test(x.rootStyle))&&after.every(x=>!/position|min-height/.test(x.rootStyle)),'светлых '+fr.reduce((a,x)=>a+x.light,0)+', мин. низ корня '+Math.min(...fr.map(x=>x.rootBottom)));
     const hd=L.filter(x=>x.btTop!=null&&x.t>=tc&&x.nMot>0).map(x=>x.bbTop+'/'+x.bbH+'/'+x.btTop+'/'+x.btH); ok(T+'шапка: тот же элемент, не двигалась, высота не менялась',new Set(hd).size===1&&L.every(x=>x.bbSame),[...new Set(hd)].join(' | '));
     const pp=fr.map(x=>x.pill).filter(v=>v!=null), pEnd=(fr.find(x=>x.pill!=null&&x.pill>=138.9)||{t:ts}).t-ts; ok(T+'подложка переезжает плавно 0–510 мс от старта и приходит в 139',pp.some(v=>v>1&&v<138)&&Math.abs(pp[pp.length-1]-139)<0.6&&pEnd>=380&&pEnd<=640,'дошла за '+pEnd.toFixed(0)+' мс');
     const a3=await p.evaluate(AUDIT), r1=await p.evaluate(REST);
     ok(T+'после перехода: на страницах и строке нет transform/opacity/inline-стилей, одна видимая панель, data-атрибутов нет, корень без inline-стиля, анимации сняты',r1.bad.length===0&&r1.anims===0&&r1.wraps===1&&r1.dataMot===0&&r1.rootStyle.indexOf('position')<0&&r1.rootStyle.indexOf('min-height')<0&&r1.rwPos==='sticky',JSON.stringify(r1));
     ok(T+'ни масок страницы, ни filter, ни клонов, ни will-change',a3.bad.length===0&&a3.clones===0,JSON.stringify(a3));
     ok(T+'бумага до низа: корень не короче окна (min-height 100lvh + высота шапки)',r1.rootH>=r1.vh&&parseFloat(r1.min)>=r1.vh,JSON.stringify([r1.rootH,r1.vh,r1.min]));
     // ===== возврат на «Книги» =====
     await p.evaluate(()=>window.scrollTo(0,0)); await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/"]'); await W(1800);
     const LB=await p.evaluate(()=>window.__log), tcb=LB.filter(x=>x.tc).pop().tc, frb=LB.filter(x=>x.t>=tcb), inB=frb.filter(x=>x.nMot>0), tsb=(inB.find(x=>x.old&&x.old.op<0.999)||inB[0]).t, tEndB=inB.length?inB[inB.length-1].t-tsb:0, afterB=frb.filter(x=>x.nMot===0&&x.t>inB[inB.length-1].t).slice(0,3);
     const rowFinal=afterB.length?afterB[0].rowTop:null, tileRest=(inB.find(x=>x.tileTop!=null)||{}).tileTop;
     ok(T+'возврат: в каждом кадре видна страница, нет светлых мест, низ корня ≥ низа окна, конец ≈790 мс от старта анимаций',inB.length>20&&inB.every(x=>(x.old&&x.old.op>0.05)||(x.nw&&x.nw.op>0.05))&&frb.every(x=>x.light===0&&x.rootBottom>=x.vh-0.5)&&tEndB>=700&&tEndB<=900,'кадров '+inB.length+' конец '+tEndB.toFixed(0)+' мс');
     const rwB=inB.filter(x=>x.rw&&x.rw.old), chB=rwB.map(x=>x.rw.clipH), stepB=maxStep(rwB.map(x=>({t:x.t,v:x.rw.clipH})),'v');
     ok(T+'возврат: строка уходит — контейнер H→0 монотонно (макс. шаг '+stepB.toFixed(1)+' px/кадр), под шапкой, затем скрыта',rwB.length>10&&chB[0]>=50&&chB[chB.length-1]<=3&&chB.every((v,i)=>i===0||v<=chB[i-1]+0.2)&&rwB.every(x=>x.rw.pos==='absolute'&&Math.abs(x.rw.top-x.rw.btBottom)<=1)&&stepB<=12&&afterB.every(x=>!x.rw),chB.filter((v,i)=>i%5===0).join(','));
     const rowFrB=inB.filter(x=>x.rowTop!=null&&x.nw), tileFrB=inB.filter(x=>x.tileTop!=null&&x.old);
     ok(T+'возврат: первая книга главной (новая) не уходит от конечного места больше чем на 6px и не скачет в конце; первая плитка «Мотивов» (старая) — от своего',rowFrB.length>10&&rowFinal!=null&&rowFrB.every(x=>Math.abs(x.rowTop-rowFinal)<=6.6)&&Math.abs(rowFrB[rowFrB.length-1].rowTop-rowFinal)<=0.6&&tileFrB.every(x=>Math.abs(x.tileTop-tileRest)<=6.6),'конечное '+rowFinal+' плитка '+tileRest);
     const r2=await p.evaluate(REST); ok(T+'после возврата: всё снято (inline-стили, transform/opacity, анимации, data-атрибуты)',r2.bad.length===0&&r2.anims===0&&r2.wraps===1&&r2.dataMot===0&&r2.rootStyle.indexOf('position')<0&&r2.rwPos===null,JSON.stringify(r2));
     // ===== искусственная нагрузка: главный поток занят 300 мс в обработчике нажатия — анимации всё равно начинаются с нуля =====
     await p.evaluate(()=>window.scrollTo(0,0)); await p.evaluate(()=>{ window.__busy=function(){ const t=performance.now(); while(performance.now()-t<300){} }; document.addEventListener('click',window.__busy,true); }); await p.evaluate(LOG);
     await click('.ic-mot-cap a[href="#/motifs"]'); await W(1800); await p.evaluate(()=>document.removeEventListener('click',window.__busy,true));
     const LH=await p.evaluate(()=>window.__log), tch=LH.filter(x=>x.tc).pop().tc, frh=LH.filter(x=>x.t>=tch), fh=frh.find(x=>x.anims.length>0), fhi=frh.indexOf(fh), first4=frh.slice(fhi,fhi+4);
     ok(T+'с нагрузкой (300 мс): в первом отрисованном кадре у ВСЕХ анимаций currentTime ≤ 40 мс (два кадра 60 Гц; спецификация 34 + дрожание кадра эмуляции)',fh&&Math.max(...fh.anims)<=40&&fh.anims.length>=8,'анимаций '+(fh&&fh.anims.length)+' макс. currentTime '+(fh&&Math.max(...fh.anims))+' мс, кадр через '+(fh&&(fh.t-tch).toFixed(0))+' мс');
     const rwH=first4.filter(x=>x.rw&&!x.rw.old).map(x=>x.rw.clipH);
     ok(T+'с нагрузкой: высота строки в первых кадрах растёт с 0 постепенно (не скачком до полной), новая страница в первом кадре opacity ≤ 0,1',rwH.length>=2&&rwH[0]<=8&&rwH[rwH.length-1]<=30&&first4[0].nw&&first4[0].nw.op<=0.1,'высота '+rwH.join(',')+' opacity '+(first4[0].nw&&first4[0].nw.op));
     await click('.ic-mot-cap a[href="#/"]'); await W(1800);
     // ===== середина перехода (замедленно ×4): светлые пиксели, строка цельная, нет масок/клонов =====
     await p.evaluate(()=>{ window.__icMotMs=3160; }); await click('.ic-mot-cap a[href="#/motifs"]'); await W(700);
     const rr0=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bt=document.getElementById('ic-booktabs'); return {t:bt.getBoundingClientRect().bottom,b:rw.getBoundingClientRect().bottom}; }); const shM=await p.screenshot(), rr1=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bt=document.getElementById('ic-booktabs'); return {t:bt.getBoundingClientRect().bottom,b:rw.getBoundingClientRect().bottom}; }), rrM={t:rr0.t,b:Math.min(rr0.b,rr1.b)};
     const lumM=await p.evaluate(eval(LINES),[shM.toString('base64'),[[3,rrM.t+1,0,1,Math.max(1,rrM.b-rrM.t-2)],[vp.w-4,rrM.t+1,0,1,Math.max(1,rrM.b-rrM.t-2)]]]);
     ok(T+'середина перехода: нет светлых пикселей между переключателем и низом строки (она растёт поверх старой страницы)',lumM.lines.every(l=>Math.max(...l)<60),JSON.stringify(lumM.lines.map(l=>Math.max(...l))));
     const aM=await p.evaluate(AUDIT), kids=await p.evaluate(()=>{ const rw=document.querySelector('#iconologie .ic-mot-rwrap'), bar=rw.querySelector('.ic-ch-outer-bar'), B=bar.getBoundingClientRect(); const ks=[...bar.querySelectorAll('.ic-mot-tabs, .ic-mot-loupe, .ic-mot-back, .ic-mot-ttl')].map(e=>e.getBoundingClientRect()); return {inside:ks.every(r=>r.top>=B.top-1&&r.bottom<=B.bottom+1&&r.left>=B.left-1&&r.right<=B.right+1),clip:getComputedStyle(rw.querySelector('.ic-mot-rclip')).overflow,tabsMask:rw.querySelector('.ic-mot-tabs').classList.contains('ic-mot-fade')}; });
     ok(T+'середина перехода: нет масок/filter/клонов/will-change, все дети строки внутри неё, клип только у самой строки, маска вкладок снята',aM.bad.length===0&&aM.clones===0&&kids.inside&&kids.clip==='hidden'&&kids.tabsMask===false,JSON.stringify([aM,kids]));
     await W(3600); await p.evaluate(()=>{ window.__icMotMs=null; });
     await click('.ic-mot-cap a[href="#/"]'); await W(1800);
     // ===== ?slow=5 =====
     const p2=await ctx.newPage(); await p2.goto(BASE+(BASE.includes('?')?'&':'?')+'slow=5#/'); await p2.waitForSelector('.ic-lib-row',{timeout:40000}); await W(3500);
     await p2.evaluate(LOG); await p2.evaluate(()=>document.querySelector('.ic-mot-cap a[href="#/motifs"]').click()); await W(5800);
     const L5=await p2.evaluate(()=>window.__log), tc5=L5.filter(x=>x.tc).pop().tc, fr5=L5.filter(x=>x.t>=tc5), in5=fr5.filter(x=>x.nMot>0), ts5=(in5.find(x=>x.old&&x.old.op<0.999)||in5[0]).t, end5=in5.length?in5[in5.length-1].t-ts5:0, pe5=(fr5.find(x=>x.pill!=null&&x.pill>=138.9)||{t:ts5}).t-ts5;
     const v5=in5.filter(x=>!((x.old&&x.old.op>0.05)||(x.nw&&x.nw.op>0.05))), l5=fr5.filter(x=>x.light!==0);
     ok(T+'?slow=5: переход в 5 раз длиннее (конец ≈3950 мс вместо ≈790, подложка ≈2550), в каждом кадре видна страница, нет светлых мест',end5>=3500&&end5<=4600&&pe5>=1900&&pe5<=3300&&v5.length===0&&l5.length===0,'конец '+end5.toFixed(0)+' мс, подложка '+pe5.toFixed(0)+' мс, пустых кадров '+v5.length+', светлых '+l5.length); await p2.close();
   } else {
     await p.evaluate(LOG); await click('.ic-mot-cap a[href="#/motifs"]'); await W(1200);
     const an=await p.evaluate(()=>window.__an.filter(x=>/ic-pane|ic-ch-outer-bar|ic-mot-shd|ic-mot-rwrap|ic-mot-rclip/.test(x))); ok(T+'reduce: панели и строка сменяются мгновенно (анимаций страниц и строки нет)',(await hash())==='#/motifs'&&an.length===0,JSON.stringify(an));
     const r=await p.evaluate(REST); ok(T+'reduce: ничего не осталось (inline-стили, data-атрибуты, корень), активна панель «Мотивы»',r.bad.length===0&&r.dataMot===0&&r.rootStyle.indexOf('position')<0&&r.wraps===1&&r.rwPos==='sticky',JSON.stringify(r));
     const dp=await p.evaluate(()=>document.querySelector('.ic-mot-cap').dataset.pos); ok(T+'reduce: подложка на «Мотивах»',dp==='1');
   }
   // ===== повторные нажатия, «назад», прямой заход =====
   if(!reduce){
     await p.evaluate(()=>{ window.__an.length=0; window.__icMotMs=2500; }); await click('.ic-mot-cap a[href="#/motifs"]'); await W(300); await click('.ic-mot-cap a[href="#/"]'); await click('.ic-mot-cap a[href="#/motifs"]'); await W(3400); await p.evaluate(()=>{ window.__icMotMs=null; });
     const an2=await p.evaluate(()=>window.__an.filter(x=>/ic-pane/.test(x)).length);
     ok(T+'повторные нажатия во время перехода игнорируются (итог — «Мотивы», один переход: 2 анимации панелей)',(await hash())==='#/motifs'&&an2===2,await hash()+' анимаций панелей '+an2);
     await click('.ic-mot-cap a[href="#/"]'); await W(1800);
   } else { await click('.ic-mot-cap a[href="#/"]'); await W(800); }
   await click('.ic-mot-cap a[href="#/motifs"]'); await W(1800); await p.evaluate(()=>{ window.__an.length=0; }); await p.goBack(); await W(1500);
   const anb=await p.evaluate(()=>window.__an.filter(x=>/ic-pane|ic-ch-outer-bar|ic-mot-shd|ic-mot-rclip/.test(x)).length);
   ok(T+'«назад» браузера без анимации (панели переключаются мгновенно)',(await hash())==='#/'&&anb===0&&(await p.evaluate(()=>document.querySelector('.ic-mot-cap').dataset.pos))==='0',await hash()+' '+anb);
   await p.evaluate(()=>{ window.__an.length=0; }); await p.goto(BASE+'#/motifs'); await W(1500); const and=await p.evaluate(()=>window.__an.filter(x=>/ic-pane|ic-ch-outer-bar|ic-mot-shd|ic-mot-rclip/.test(x)).length); ok(T+'прямой заход без анимации',and===0);
   if(!reduce){
     // пять быстрых переключений: в конце ничего не осталось
     await p.goto(BASE+'#/'); await W(2000);
     for(let i=0;i<5;i++){ await p.evaluate(()=>{ window.__icMotMs=200; }); await click('.ic-mot-cap a[href="#/motifs"]'); await click('.ic-mot-cap a[href="#/motifs"]'); await W(700); await click('.ic-mot-cap a[href="#/"]'); await W(700); }
     await click('.ic-mot-cap a[href="#/motifs"]'); await W(900); await p.evaluate(()=>{ window.__icMotMs=null; });
     await p.evaluate(()=>window.scrollTo(0,900)); await W(500); await p.evaluate(()=>window.scrollTo(0,0)); await W(300);
     const fa2=await p.evaluate(AUDIT), fr2=await p.evaluate(REST);
     ok(T+'после 5 быстрых переключений и прокрутки: нет mask/filter/клонов/will-change, всё снято, одна видимая панель и одна строка разделов',fa2.bad.length===0&&fa2.clones===0&&fr2.bad.length===0&&fr2.anims===0&&fr2.wraps===1&&fr2.dataMot===0&&fr2.rwPos==='sticky'&&(await hash())==='#/motifs',JSON.stringify([fa2,fr2]));
   }
   await ctx.close();
  }
 }
 ok('консоль без ошибок',errs.length===0,errs.slice(0,4).join(' | ')); await br.close(); console.log(bad?('FAILS '+bad):'ALL OK'); process.exit(bad?1:0);
})();
