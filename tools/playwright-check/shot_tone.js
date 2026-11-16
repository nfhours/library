/* Скриншоты: сетка и таблица Одрана, сетка Рипы (однородность тона). BASE=http://localhost:8975/index.html node shot_tone.js */
const { webkit, devices } = require('playwright'); const path=require('path'); const W=ms=>new Promise(r=>setTimeout(r,ms));
const BASE=process.env.BASE||'http://localhost:8975/index.html', OUT=path.join(__dirname,'out');
(async()=>{ const br=await webkit.launch(), ctx=await br.newContext({...devices['iPhone 13']}), p=await ctx.newPage();
 for(const [h,f,y] of [['#/audran/plates','audran-grid-tone.png',700],['#/audran/aud15','audran-plate-tone.png',0],['#/iconologie/plates','ripa-grid-tone.png',900]]){
  await p.goto(BASE+h); await p.evaluate(()=>{localStorage.setItem('ic-lang','ru');sessionStorage.clear();}); await p.reload(); await W(3500); await p.evaluate(y=>window.scrollTo(0,y),y); await W(900);
  await p.screenshot({path:path.join(OUT,f)}); }
 await br.close(); console.log('ok'); })();
