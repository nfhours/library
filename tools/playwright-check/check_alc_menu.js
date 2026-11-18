/* Альчато, страница эмблемы: «Библиотека» и меню книги — часть страницы, строка раздела sticky top:0, меню НЕ появляется при прокрутке вверх;
 * смена высоты окна (панели Safari) во время прокрутки не двигает строку раздела и контент. BASE=http://localhost:8975/index.html node check_alc_menu.js */
const { webkit, devices } = require('playwright'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0,n=0; const ok=(a,c,x)=>{ n++; if(!c) bad++; console.log((c?'ok  ':'FAIL ')+a+(x!==undefined?' '+x:'')); };
(async()=>{ const br=await webkit.launch(); const errs=[]; const vp={width:390,height:664};
 const ctx=await br.newContext({...devices['iPhone 13'],viewport:vp}), p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|cancelled/i.test(m.text())) errs.push(m.text()); });
 await p.goto(BASE+'#/alciato'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');localStorage.setItem('ic-alc-mode','tr');}); await p.goto(BASE+'#/alciato/alc15'); await p.reload(); await W(3000);
 const st=()=>p.evaluate(()=>{ const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null;}, bb=r('.back-bar'), bt=r('#ic-booktabs'), rb=r('.ic-rbar'), fg=r('.ic-alc-figs');
   return {y:Math.round(scrollY),bbB:Math.round(bb.bottom),btT:Math.round(bt.top),btB:Math.round(bt.bottom),rbT:Math.round(rb.top),figDoc:Math.round(fg.top+scrollY),menu:document.getElementById('ic-stack').classList.contains('ic-alc-menu'),pos:[getComputedStyle(document.querySelector('.back-bar')).position,getComputedStyle(document.getElementById('ic-booktabs')).position,getComputedStyle(document.querySelector('.ic-rbar')).position].join('/')}; });
 const s0=await st(); ok('вверху: шапка, меню, строка раздела на своих местах',s0.y===0&&s0.bbB>0&&s0.btT>=s0.bbB-1&&s0.rbT>=s0.btB-1&&!s0.menu,JSON.stringify(s0));
 ok('шапка и меню не sticky/fixed, строка раздела sticky',/^(relative|static)\/sticky\/sticky$/.test(s0.pos)||/^(relative|static)\/(relative|static)\/sticky$/.test(s0.pos),s0.pos);
 await p.evaluate(()=>window.dispatchEvent(new Event('touchstart'))); await W(200);
 for(let i=0;i<30;i++){ await p.evaluate(()=>window.scrollBy(0,20)); await W(40); } await W(300);
 const s1=await st(); ok('вниз: шапка и меню уехали нативно, строка раздела у верха, меню не вылезло',s1.bbB<=0&&s1.btB<=0&&s1.rbT===0&&!s1.menu,JSON.stringify(s1));
 for(const d of [-25,-30,-80,-120]){ await p.evaluate(dd=>window.scrollBy(0,dd),d); await W(450); }
 const s2=await st(); ok('вверх (25, 30, 80, 120 px подряд): меню не появилось, строка раздела на месте, контент не сдвинут',!s2.menu&&s2.btB<=0&&s2.rbT===0&&s2.figDoc===s1.figDoc,JSON.stringify(s2));
 await p.evaluate(()=>window.scrollBy(0,60)); await W(500); const s4=await st(); ok('вниз: без изменений',!s4.menu&&s4.rbT===0,JSON.stringify(s4));
 // смена высоты окна во время прокрутки (панели Safari)
 const base=await st(); const seq=[];
 for(const h of [664,760,664,744,664,780,664]){ await p.setViewportSize({width:390,height:h}); await p.evaluate(()=>window.scrollBy(0,6)); await W(120); seq.push(await st()); }
 ok('смена высоты окна: строка раздела всегда у верха',seq.every(s=>s.rbT===0),seq.map(s=>s.rbT).join(','));
 ok('смена высоты окна: контент не прыгает',seq.every((s,i)=>s.figDoc===base.figDoc),seq.map(s=>s.figDoc).join(','));
 ok('смена высоты окна: меню не появляется',seq.every(s=>!s.menu&&s.btB<=0));
 // светлая полоса: фон строки раздела продолжается вверх; «отскок» — строка раздела опущена на 60 px (как при отскоке/смене панелей Safari), над строкой должно быть тёмно
 const sh=await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.ic-rbar'),'::before');return c.backgroundColor+' h='+c.height+' bottom='+c.bottom;}); ok('фон строки раздела продолжается вверх (::before)',/rgb\(22, 19, 15\) h=120px/.test(sh),sh);
 await p.evaluate(()=>{document.querySelector('.ic-rbar').style.top='60px';}); await W(300);
 const fs=require('fs'),cp=require('child_process'),png=require('path').join(__dirname,'out/alc-bounce.png'); await p.screenshot({path:png,clip:{x:0,y:0,width:390,height:70}});
 const px=cp.execSync("python3 -c \"from PIL import Image;im=Image.open('"+png+"').convert('RGB');W,H=im.size;print(max(sum(im.getpixel((x,y)))/3 for x in range(0,W,10) for y in range(0,int(H*0.5),4)))\"").toString().trim();
 ok('при опущенной строке раздела сверху нет светлой полосы (яркость ≤ 40)',+px<=40,px);
 await p.evaluate(()=>{document.querySelector('.ic-rbar').style.top='';});
 await p.setViewportSize(vp); await p.evaluate(()=>window.scrollTo(0,0)); await W(700); const s5=await st(); ok('наверху меню на месте',s5.y===0&&!s5.menu&&s5.btT>=s5.bbB-1,JSON.stringify(s5));
 // фон html — цвет шапки только на странице эмблемы; бумага — на body; без горизонтальной прокрутки, без лишнего места сверху, клики по шапке работают
 await p.evaluate(()=>window.scrollTo(0,0)); await W(400);
 const tp=await p.evaluate(()=>{ const se=document.scrollingElement, h=document.documentElement, r=document.getElementById('iconologie'), m=document.querySelector('meta[name="theme-color"]'); return {cls:h.classList.contains('ic-flow-page'),html:getComputedStyle(h).backgroundColor,body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(r).backgroundColor,rh:Math.round(r.getBoundingClientRect().height),ih:innerHeight,theme:m&&m.content,sw:se.scrollWidth,cw:se.clientWidth,bb:Math.round(document.querySelector('.back-bar').getBoundingClientRect().top),y:scrollY}; });
 ok('страница эмблемы: html и body #16130f, бумага на контейнере ≥ высоты экрана, theme-color #16130f',tp.cls&&tp.html==='rgb(22, 19, 15)'&&tp.body==='rgb(22, 19, 15)'&&tp.root==='rgb(236, 229, 212)'&&tp.rh>=tp.ih&&tp.theme==='#16130f',JSON.stringify(tp));
 // между строкой раздела и бумагой нет тёмной щели: полоска сразу под строкой раздела (у левого края, где нет чернил) светлая
 await p.evaluate(()=>window.scrollTo(0,0)); await W(400);
 { const g=await p.evaluate(()=>{ const rb=document.querySelector('.ic-rbar').getBoundingClientRect(), w=document.querySelector('.ic-wrap').getBoundingClientRect(), r=document.getElementById('iconologie').getBoundingClientRect(), bt=document.getElementById('ic-booktabs'); return {rbB:Math.round(rb.bottom*10)/10,wrT:Math.round(w.top*10)/10,rootT:Math.round(r.top+scrollY),rbBdoc:0,rbBg:getComputedStyle(document.querySelector('.ic-rbar')).backgroundColor}; });
   ok('между строкой раздела и бумагой нет щели (контент начинается у нижнего края строки, корень = бумага)',Math.abs(g.wrT-g.rbB)<=14&&g.rootT===0,JSON.stringify(g)); }
 await p.evaluate(()=>window.scrollTo(0,0)); await W(300);
 ok('нет горизонтальной прокрутки, вверху нет лишнего места',tp.sw<=tp.cw&&tp.bb===0&&tp.y===0,JSON.stringify(tp));
 await p.tap('.back-bar .back-bar-brand a'); await W(1500); ok('клик по «Библиотеке» работает',!/alciato\/alc15$/.test(await p.evaluate(()=>location.hash)),await p.evaluate(()=>location.hash));
 for(const h of ['#/alciato/list','#/alciato','#/cartari','#/iconologie']){ await p.goto(BASE+h); await W(1800); const o=await p.evaluate(()=>({cls:document.documentElement.classList.contains('ic-flow-page'),html:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,theme:(document.querySelector('meta[name="theme-color"]')||{}).content,sw:document.scrollingElement.scrollWidth,cw:document.scrollingElement.clientWidth})); ok('уход на '+h+': схема на всём сайте: html и body тёмные, theme-color шапки',o.cls&&o.html==='rgb(22, 19, 15)'&&o.body==='rgb(22, 19, 15)'&&o.theme==='#16130f'&&o.sw<=o.cw,JSON.stringify(o)); }
 ok('console clean',errs.length===0,errs.slice(0,3).join(' | '));
 await br.close(); console.log('passed '+(n-bad)+'/'+n); process.exit(bad?1:0); })();
