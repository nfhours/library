/* Альчато: перевод в рамке страницы — ВСЕ эмблемы и вводные × RU/EN/FR × ширины 390 и 430: текст внутри поля (переполнения нет), список полей с кеглем < 10 / < 11 px.
 * Эмблемы без поля (alc85, alc213): перевод под страницей. Кнопка «Оригинал» в строке раздела, порядок блоков, запоминание режима, [?] не показывается.
 * Скриншоты out/alc-fit-<lang>-<id>.png (в чат не читать). BASE=http://localhost:8975/index.html [VW=390] [LANGS=ru,en,fr] node check_alc_fit.js */
const { webkit, devices } = require('playwright'); const path=require('path'), fs=require('fs');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
const T=JSON.parse(fs.readFileSync(path.join(__dirname,'../../books/alciato/text.json'),'utf8')), FIT=JSON.parse(fs.readFileSync(path.join(__dirname,'../../books/alciato/fit.json'),'utf8'));
const IDS=(process.env.IDS?process.env.IDS.split(','):Object.keys(T.pages)), NOFIT=IDS.filter(i=>T.pages[i].some(p=>!FIT[p[0]])), SHOT3=['alc17','alc31','alc123'];
const VWS=(process.env.VW||'390,430').split(',').map(Number), LANGS=(process.env.LANGS||'ru,en,fr').split(',');
let bad=0,n=0; const sub10=[],sub11=[],relaxed=[]; const ok=(name,c,x)=>{ n++; if(!c) bad++; if(!c||process.env.V) console.log((c?'ok  ':'FAIL ')+name+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(); const errs=[];
 for(const vw of VWS){
  const ctx=await br.newContext({...devices['iPhone 13'],viewport:{width:vw,height:844}}), p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
  for(const L of LANGS){
   await p.goto(BASE+'#/alciato'); await p.evaluate(l=>{localStorage.setItem('ic-lang',l);localStorage.setItem('ic-alc-mode','tr');sessionStorage.clear();},L); await p.reload(); await W(1500);
   for(const id of IDS){
    await p.goto(BASE+'#/alciato/'+id);
    const nofit=NOFIT.includes(id);
    await p.waitForFunction(nf=>nf?document.querySelector('.ic-alc-pg'):[...document.querySelectorAll('.ic-alc-fld')].length&&[...document.querySelectorAll('.ic-alc-fld')].every(f=>f.dataset.fit),nofit,{timeout:8000}).catch(()=>{});
    await p.evaluate(()=>document.fonts&&document.fonts.ready); await W(120);
    const r=await p.evaluate(()=>[...document.querySelectorAll('.ic-alc-fld')].map(f=>{ const i=f.firstChild, fr=f.getBoundingClientRect(), ir=i.getBoundingClientRect();
      return {pg:f.dataset.pg,fit:f.dataset.fit,fs:+f.dataset.fs,lh:+f.dataset.lh,rx:f.dataset.relax,vis:getComputedStyle(f).visibility,txt:i.textContent,
        inside:ir.top>=fr.top-1&&ir.bottom<=fr.bottom+1&&i.scrollWidth<=f.clientWidth+1,ty:(()=>{const c=getComputedStyle(i);return {st:c.fontStyle,w:c.fontWeight,c:c.color,o:c.opacity};})()}; }));
    const lay=await p.evaluate(()=>{ const q=s=>document.querySelector(s), top=e=>e?Math.round(e.getBoundingClientRect().top+scrollY):null;
      return {head:top(q('.ic-alc-head')),fig:top(q('.ic-alc-figs')),pager:top(q('.ic-rp-pager')),orig:!!q('.ic-alc-orig'),greek:!!q('.ic-alc-greek'),sw:!!q('.ic-alc-sw'),qm:[...document.querySelectorAll('.ic-wrap .ic-alc-fld, .ic-wrap .ic-alc-trsec, .ic-wrap .ic-alc-motto')].some(e=>/\[\?\]/.test(e.textContent)),
        trsec:!!q('.ic-alc-trsec'),btn:(()=>{const b=q('[data-rb="alcorig"]');if(!b)return 0;const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const hit=d=>{const e=document.elementFromPoint(cx,cy+d);return e&&e.closest('[data-rb="alcorig"]')===b;};return hit(-21)&&hit(21)?Math.max(44,Math.round(r.height)):Math.round(r.height);})(),motto:(q('.ic-alc-motto')||{}).textContent,la:!!q('.ic-alc-la')}; });
    const tag=L+' '+id+' @'+vw;
    ok(tag+' order: motto < page < pager',lay.head<lay.fig&&lay.fig<lay.pager,JSON.stringify(lay));
    ok(tag+' no «Оригинал» block / greek block / old switch / [?]',!lay.orig&&!lay.greek&&!lay.sw&&!lay.qm);
    if(nofit){
      ok(tag+' no field: translation under page, no button',r.length===0&&lay.trsec&&lay.btn===0);
    } else {
      ok(tag+' fields present, visible, no translation below page',r.length>0&&r.every(x=>x.vis==='visible')&&!lay.trsec);
      ok(tag+' text inside field (no overflow)',r.every(x=>x.inside),r.map(x=>x.fs+'px'+(x.inside?'':' OVER')).join(' | '));
      ok(tag+' typography: italic 600, ink, opacity 1',r.every(x=>x.ty.st==='italic'&&x.ty.w==='600'&&x.ty.c==='rgb(28, 24, 19)'&&x.ty.o==='1'),JSON.stringify(r[0].ty));
      ok(tag+' no [?] in field',r.every(x=>!/\[\?\]/.test(x.txt)));
      ok(tag+' button «Оригинал» зона касания ≥44px',lay.btn>=44,lay.btn);
      const m=Math.min(...r.map(x=>x.fs)); if(m<10) sub10.push(tag+' '+m+'px'); if(m<11) sub11.push(tag+' '+m);
      if(r.some(x=>x.rx)) relaxed.push(tag);
      if(vw===390&&(L==='ru'&&SHOT3.includes(id))) await p.locator('.ic-alc-fitfigs').screenshot({path:path.join(OUT,'alc-fit-'+L+'-'+id+'.png')});
    }
   }
  }
  await ctx.close();
 }
 if(!process.env.NOUI){
 const ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE+'#/alciato'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');localStorage.setItem('ic-alc-mode','tr');}); await p.goto(BASE+'#/alciato/alc10'); await p.reload(); await W(2500);
 const pr=()=>p.evaluate(()=>{ const b=document.querySelector('[data-rb="alcorig"]'),im=document.querySelector('.ic-alc-or'); return {pressed:b.getAttribute('aria-pressed'),txt:b.textContent,fld:getComputedStyle(document.querySelector('.ic-alc-fld')).visibility,or:getComputedStyle(im).visibility,nat:im.naturalWidth,h:Math.round(b.getBoundingClientRect().height),bg:getComputedStyle(b).backgroundColor}; });
 let s0=await pr(); ok('«Оригинал» не нажата: перевод в рамке',s0.pressed==='false'&&s0.fld==='visible'&&s0.or==='hidden'&&s0.txt==='Оригинал',JSON.stringify(s0));
 await p.tap('[data-rb="alcorig"]'); await W(2500); let s1=await pr();
 ok('«Оригинал» нажата: фото оригинала, заливка',s1.pressed==='true'&&s1.fld==='hidden'&&s1.or==='visible'&&s1.nat>0&&s1.bg!==s0.bg,JSON.stringify(s1));
 await p.tap('.ic-rp-nb-next'); await W(2500); let s2=await pr(); ok('режим сохраняется при «След.»',s2.pressed==='true'&&s2.or==='visible',JSON.stringify(s2));
 await p.tap('[data-nav="prev"]'); await W(2000); let s3=await pr(); ok('режим сохраняется при «Пред.»',s3.pressed==='true',JSON.stringify(s3));
 await p.tap('.ic-alc-or'); await W(1500); const fs_=await p.evaluate(()=>[...document.querySelectorAll('.ic-svx-alc img')].map(i=>i.src.replace(/^.*\//,'')));
 ok('полноэкранный просмотр: pages/_full',fs_.join()==='alc10_full.webp',fs_.join()); await p.goBack(); await W(800);
 await p.tap('[data-rb="alcorig"]'); await W(600); let s4=await pr(); ok('отжата: снова перевод',s4.pressed==='false'&&s4.fld==='visible');
 }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 console.log('кегль < 10 px:',sub10.length?sub10.join('; '):'нигде'); console.log('кегль < 11 px (полей): '+sub11.length+' — '+sub11.slice(0,400).join('; '));
 console.log('уступки (межстрочный/отступ/поля):',relaxed.length);
 console.log('passed '+(n-bad)+'/'+n); await br.close(); process.exit(bad?1:0); })();
