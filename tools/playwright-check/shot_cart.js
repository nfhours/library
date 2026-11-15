const { webkit, devices } = require('playwright'); const path=require('path');
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out'); const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage();
 await p.goto(BASE+'#/cartari/home'); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await W(4000);
 console.log(await p.$eval('.ic-home-fig img',i=>i.src+' '+i.naturalWidth)); await p.screenshot({path:path.join(OUT,'home-cartari-cover.png')}); await br.close(); })();
