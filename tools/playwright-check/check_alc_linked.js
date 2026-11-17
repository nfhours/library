/* Альчато: шапка привязана к прокрутке (installLinkedHide). Медленная прокрутка вниз и вверх на alc15, видео out/alc-linked.webm.
 * BASE=http://localhost:8975/index.html node check_alc_linked.js */
const { webkit, devices } = require('playwright'); const path=require('path'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(); const errs=[];
 const ctx=await br.newContext({...devices['iPhone 13'],recordVideo:{dir:path.join(__dirname,'out/vid'),size:{width:390,height:664}}}), p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
 await p.goto(BASE+'#/alciato'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');localStorage.setItem('ic-alc-mode','tr');}); await p.goto(BASE+'#/alciato/alc15'); await p.reload(); await W(3000);
 const st=()=>p.evaluate(()=>{ const s=document.getElementById('ic-stack'), bb=s.querySelector('.back-bar'), bt=document.getElementById('ic-booktabs'), m=document.querySelector('.ic-alc-motto'), g=document.querySelector('.ic-alc-figs');
   const H=bb.offsetHeight+bt.offsetHeight, ty=new DOMMatrix(getComputedStyle(s).transform).m42; return {y:Math.round(scrollY),ty:Math.round(ty*10)/10,H,mt:Math.round(m.getBoundingClientRect().top),rb:Math.round(document.querySelector('.ic-rbar').getBoundingClientRect().top),fig:Math.round(g.getBoundingClientRect().top)}; });
 const s0=await st(); ok('вверху шапка видна',s0.ty===0&&s0.y===0,JSON.stringify(s0));
 await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); await W(200);
 const down=[]; for(let i=0;i<40;i++){ await p.evaluate(()=>window.scrollBy(0,12)); await W(45); down.push(await st()); }
 const syncOk=down.every(s=>{ const exp=-Math.min(s.y,s.H); return Math.abs(s.ty-exp)<=Math.max(3,0.04*s.H)+4; });
 ok('вниз: translateY = −scrollY (до полного скрытия)',syncOk,down.filter((s,i)=>i%8===0).map(s=>s.y+'→'+s.ty).join(' '));
 const last=down[down.length-1]; ok('к уходу девиза за верх шапки нет, гравюра выше',Math.abs(last.ty)>=last.H-4&&last.rb<=8,JSON.stringify(last));
 const tys=down.map(s=>s.ty); ok('без дребезга вниз: сдвиг монотонный',tys.every((v,i)=>i===0||v<=tys[i-1]+0.5));
 // мелкие обратные движения < 12 px — шапка не возвращается
 for(let i=0;i<3;i++){ await p.evaluate(()=>window.scrollBy(0,-3)); await W(50); } const sm=await st(); ok('обратное < 12 px игнорируется',sm.ty<=-sm.H+4,JSON.stringify(sm));
 await p.evaluate(()=>window.scrollBy(0,40)); await W(100);
 const up=[]; for(let i=0;i<30;i++){ await p.evaluate(()=>window.scrollBy(0,-12)); await W(45); up.push(await st()); }
 await W(500); const u1=await st(); ok('вверх ≥ 12 px: шапка вернулась',u1.ty>=-1,JSON.stringify(u1));
 const flips=up.map(s=>s.ty).filter((v,i,a)=>i&&(v<a[i-1]-0.5)).length; ok('без дребезга вверх',flips===0,flips);
 await p.evaluate(()=>window.scrollTo(0,0)); await W(500); const t0=await st(); ok('вверху снова полностью видна',t0.ty===0,JSON.stringify(t0));
 await p.evaluate(()=>window.scrollTo(0,0));
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 await ctx.close(); await br.close(); console.log('passed '+(n-bad)+'/'+n); process.exit(bad?1:0); })();
