const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out');
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage(), errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/access control|Load failed|cancelled/i.test(m.text())) errs.push(m.text()); });
 for(const lang of (process.env.LANGS||'ru,en').split(',')){
  await p.goto(BASE+'#/'); await p.evaluate(l=>{localStorage.setItem('ic-lang',l);sessionStorage.clear();},lang); await p.reload(); await W(3500);
  await p.screenshot({path:path.join(OUT,(process.env.TAG||'home')+'-'+lang+'.png'),fullPage:true});
 }
 console.log(errs.length?'ERR '+errs.slice(0,3):'console clean'); await br.close(); })();
