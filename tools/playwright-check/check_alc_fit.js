/* Альчато, пилот «перевод в рамке страницы»: для 10 эмблем × RU/EN/FR × ширины 390 и 430 — текст целиком внутри поля, кегль ≥ нижнего предела.
 * Скриншоты out/alc-fit-<lang>-<id>-<w>.png (в чат не читать). BASE=http://localhost:8975/index.html node check_alc_fit.js */
const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=['alc10','alc17','alc31','alc55','alc82','alc119','alc123','alc149','alc196','intro-2'], SHOT3=['alc17','alc31','alc149'];
const FLOOR=10; let bad=0,n=0, lhRed=[]; const ok=(name,c,x)=>{ n++; if(!c) bad++; console.log((c?'ok  ':'FAIL ')+name+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(); const errs=[];
 for(const vw of [390,430]){
  const ctx=await br.newContext({...devices['iPhone 13'],viewport:{width:vw,height:844}}), p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
  for(const L of ['ru','en','fr']){
   await p.goto(BASE+'#/alciato'); await p.evaluate(l=>{localStorage.setItem('ic-lang',l);localStorage.setItem('ic-alc-mode','tr');sessionStorage.clear();},L); await p.reload(); await W(1500);
   for(const id of IDS){
    await p.goto(BASE+'#/alciato/'+id); await W(1800);
    await p.waitForSelector('.ic-alc-fld',{timeout:8000}).catch(()=>{});
    await p.evaluate(()=>document.fonts&&document.fonts.ready); await W(500);
    const r=await p.evaluate(()=>[...document.querySelectorAll('.ic-alc-fld')].map(f=>{ const i=f.firstChild, fr=f.getBoundingClientRect(), ir=i.getBoundingClientRect();
      return {pg:f.dataset.pg,fit:f.dataset.fit,fs:+f.dataset.fs,lh:+f.dataset.lh,fh:Math.round(fr.height),ih:Math.round(ir.height),fw:Math.round(fr.width),sw:i.scrollWidth,vis:getComputedStyle(f).visibility,lines:i.children.length,
        inside:ir.top>=fr.top-1&&ir.bottom<=fr.bottom+1&&i.scrollWidth<=f.clientWidth+1,sel:getComputedStyle(f).userSelect||getComputedStyle(f).webkitUserSelect,tag:f.firstChild.tagName}; }));
    const tag=L+' '+id+' @'+vw;
    ok(tag+' fields present, visible',r.length>0&&r.every(x=>x.vis==='visible'),r.length);
    ok(tag+' text inside field, fs>=floor',r.every(x=>x.inside&&x.fs>=FLOOR-0.01),r.map(x=>x.fs+'px/'+x.lh+' '+x.ih+'/'+x.fh+(x.inside?'':' OVER')).join(' | '));
    if(r.some(x=>x.fit==='lh')) lhRed.push(tag+' lh '+r.filter(x=>x.fit==='lh').map(x=>x.lh).join('/'));
    if(vw===390&&(L==='ru'||SHOT3.includes(id))||(vw===430&&false)) await p.locator('.ic-alc-fitfigs').screenshot({path:path.join(OUT,'alc-fit-'+L+'-'+id+'.png')});
   }
  }
  await ctx.close();
 }
 // переключатель + оригинал
 const ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(); await p.goto(BASE+'#/alciato/alc10'); await W(2500);
 const sw=await p.evaluate(()=>[...document.querySelectorAll('.ic-alc-sw button')].map(b=>[b.textContent,Math.round(b.getBoundingClientRect().height)]));
 ok('switch Перевод/Оригинал, ≥44',sw.length===2&&sw.every(x=>x[1]>=44),JSON.stringify(sw));
 await p.tap('.ic-alc-sw button[data-alcm="orig"]'); await W(2500);
 const o=await p.evaluate(()=>{ const im=document.querySelector('.ic-alc-or'); return {nat:im.naturalWidth,src:im.src.replace(/^.*\//,''),fld:getComputedStyle(document.querySelector('.ic-alc-fld')).visibility,pl:getComputedStyle(document.querySelector('.ic-alc-pl')).visibility,or:getComputedStyle(im).visibility}; });
 ok('orig mode: pages/ photo shown, field hidden',o.nat>0&&/alc10\.webp/.test(o.src)&&o.fld==='hidden'&&o.or==='visible',JSON.stringify(o));
 await p.tap('.ic-alc-or'); await W(1500);
 const fs=await p.evaluate(()=>[...document.querySelectorAll('.ic-svx-alc img')].map(i=>i.src.replace(/^.*\//,'')));
 ok('fullscreen opens original (pages/_full)',fs.join()==='alc10_full.webp',fs.join()); await p.goBack(); await W(800);
 await p.tap('.ic-alc-sw button[data-alcm="tr"]'); await W(600);
 const bl=await p.evaluate(()=>({h3:[...document.querySelectorAll('.ic-rp-alc .ic-sec h3')].map(x=>x.textContent),la:!!document.querySelector('.ic-alc-la')}));
 ok('below page: no translation block, «Оригинал» latin lines kept',!bl.h3.some(x=>/^(Перевод|Translation|Traduction)$/.test(x))&&bl.h3.some(x=>/Original|Оригинал/.test(x))&&bl.la,JSON.stringify(bl));
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 console.log('межстрочный уменьшен:',lhRed.length?lhRed.join('; '):'нигде');
 console.log('passed '+(n-bad)+'/'+n); await br.close(); process.exit(bad?1:0); })();
