/* Снимок/сравнение горизонтальной геометрии (x, ширина) всех элементов на страницах с полосами шапки.
 * node rect_diff.js save out/rects-before.json   |   node rect_diff.js diff out/rects-before.json  (BASE=...) */
const { webkit } = require('playwright'); const fs=require('fs'); const BASE=process.env.BASE||'http://localhost:8975/index.html'; const W=ms=>new Promise(r=>setTimeout(r,ms));
const PAGES=['#/alciato/alc15','#/iconologie/p1-1','#/iconologie/list','#/iconologie/plates','#/audran/plates','#/cartari/text','#/cartari/plates','#/cartari/index','#/cartari/names',process.env.CH||'#/cartari/text'];
const SIZES=[[1180,820],[1366,1024],[820,1180],[390,844]];
(async()=>{ const [mode,file]=process.argv.slice(2); const br=await webkit.launch(); const out={};
 for(const [w,h] of SIZES){ const p=await (await br.newContext({viewport:{width:w,height:h}})).newPage();
  for(const pg of PAGES){ await p.goto(BASE+pg); await W(2200);
   out[w+'|'+pg]=await p.evaluate(()=>{ const r={}; let n=0; document.querySelectorAll('#iconologie *, .back-bar, .back-bar *').forEach(e=>{ const b=e.getBoundingClientRect(); if(!b.width) return; const k=(e.id?'#'+e.id:'')+e.tagName.toLowerCase()+'.'+String(e.className&&e.className.baseVal!==undefined?'':e.className).split(' ').slice(0,3).join('.')+'~'+(n++); r[k]=[Math.round(b.left),Math.round(b.width)]; }); return r; }); }
 }
 await br.close();
 if(mode==='save'){ fs.writeFileSync(file,JSON.stringify(out)); console.log('saved',Object.keys(out).length); return; }
 const old=JSON.parse(fs.readFileSync(file)); let bad=0; const sum={};
 for(const k of Object.keys(out)){ const a=old[k]||{}, b=out[k]; const d=[]; for(const e of Object.keys(b)){ if(!a[e]) {d.push(e+' NEW'); continue;} if(a[e][0]!==b[e][0]||a[e][1]!==b[e][1]) d.push(e+' '+a[e]+'→'+b[e]); } if(d.length){ bad++; console.log('\n'+k+' ('+d.length+' diffs)'); d.slice(0,+process.env.MAX||12).forEach(x=>console.log('  '+x)); } }
 console.log('pages with diffs:',bad,'of',Object.keys(out).length); })();
