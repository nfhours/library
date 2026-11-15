/* Общая проверка оформления результатов лупы (Картари и Рипа): шторка #ic-rb-sheet, контейнер .ic-sr */
const W = ms => new Promise(r => setTimeout(r, ms));
async function audit(page, name) {
  // миниатюры ленивые: пролистываем к каждой
  await page.evaluate(async () => { for (const im of document.querySelectorAll('#ic-rb-sheet .ic-sr img')) { im.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 120)); } });
  await W(900);
  const r = await page.evaluate(() => {
    const box = document.querySelector('#ic-rb-sheet .ic-sr'), bad = [], seen = {};
    const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const bgOf = el => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) { stack.push(c); if (c.a === 1) break; } } let bg = { r: 22, g: 19, b: 15, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); return bg; };
    const note = (k, msg) => { if (!seen[k]) { seen[k] = 1; bad.push(msg); } };
    const all = box.querySelectorAll('*'); let n = 0, imgs = 0, marks = 0, shortMarks = 0;
    all.forEach(el => {
      const cs = getComputedStyle(el), inH = !!el.closest('.ic-nm-h'), cls = el.className && el.className.baseVal === undefined ? el.className : '';
      if (!inH && cs.textTransform !== 'none') note('tt:' + cls, 'text-transform ' + cs.textTransform + ' on ' + el.tagName + '.' + cls);
      if (!inH && cs.letterSpacing !== 'normal' && parseFloat(cs.letterSpacing) !== 0) note('ls:' + cls, 'letter-spacing ' + cs.letterSpacing + ' on ' + el.tagName + '.' + cls);
      if (cs.textAlign !== 'left' && cs.textAlign !== 'start') note('ta:' + cls, 'text-align ' + cs.textAlign + ' on ' + el.tagName + '.' + cls);
      const own = [...el.childNodes].some(x => x.nodeType === 3 && x.data.trim());
      if (own && el.tagName !== 'MARK') {
        n++; const fg = parse(cs.color), bg = bgOf(el), c = blend(fg, bg), l1 = lum(c), l2 = lum(bg), ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
        const primary = el.matches('.ic-sr-t,.ic-sr-snip,.ic-tv-ru,.ic-sr-a,.ic-sr-nav button,.ic-tv-pg a,.ic-sr-more') && !el.matches('.ic-sr-meta');
        if (ratio < 4.5 || (primary && ratio < 7)) note('ct:' + cls + el.tagName, 'contrast ' + ratio.toFixed(2) + ' on ' + el.tagName + '.' + cls + ' "' + el.textContent.trim().slice(0, 20) + '"');
      }
      if (el.tagName === 'IMG') { imgs++; if (!(el.complete && el.naturalWidth > 0)) note('img:' + el.src, 'thumb not loaded ' + el.getAttribute('src')); }
      if (el.tagName === 'MARK') {
        marks++;
        for (const p of ['borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight', 'marginLeft', 'marginRight']) if (parseFloat(cs[p]) !== 0) note('mk:' + p, 'mark ' + p + '=' + cs[p]);
        if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) note('mkb', 'mark border');
        const bgc = parse(cs.backgroundColor); if (bgc.a < .2 || bgc.a > .5) note('mkbg', 'mark bg ' + cs.backgroundColor);
        const prev = el.previousSibling, pc = prev && prev.nodeType === 3 ? prev.data.slice(-1) : '';
        if (pc && /[\p{L}\p{N}]/u.test(pc)) { shortMarks++; note('mkw:' + el.textContent, 'mark starts mid-word: ' + (prev.data.slice(-6) + '[' + el.textContent + ']')); }
      }
    });
    const sz = (sel, px) => box.querySelectorAll(sel).forEach(e => { if (Math.abs(parseFloat(getComputedStyle(e).fontSize) - px) > .6) note('fs:' + sel, sel + ' font-size ' + getComputedStyle(e).fontSize + ' expected ' + px); });
    box.querySelectorAll('.ic-sr-th').forEach(th => { const c = parse(getComputedStyle(th).backgroundColor); if (lum(c) < .5) note('thbg', 'thumb background too dark (engraving lines are dark on transparent): ' + getComputedStyle(th).backgroundColor); });
    sz('.ic-sr-t', 17); sz('.ic-sr-snip', 15); sz('.ic-nm-h', 13); sz('.ic-sr-nav button', 15);
    box.querySelectorAll('.ic-sr-ul li').forEach(li => { const cs = getComputedStyle(li); if (cs.borderBottomStyle !== 'solid' || cs.paddingTop !== '12px' || cs.paddingBottom !== '12px') note('li', 'li border ' + cs.borderBottomStyle + ' pad ' + cs.paddingTop + '/' + cs.paddingBottom); });
    return { bad, texts: n, imgs, marks, shortMarks, items: box.querySelectorAll('li, .ic-nm-row, .ic-tv-e').length };
  });
  r.name = name; return r;
}
module.exports = { audit };
