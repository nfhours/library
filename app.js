/* Библиотека: указатель книг и карточки статей.
   Реестр книг: library.json. Каждая книга: books/<slug>/book.json + entries.json,
   гравюры: books/<slug>/img/, сканы страниц: books/<slug>/pages/. */
(function(){
  // Бампать при каждой правке app.css (и, по желанию, когда меняется логика
  // в app.js, завязанная на новую разметку), чтобы браузеры и CDN не отдавали
  // старую закэшированную копию стилей после деплоя.
  var APP_VER = "65";
  var me = document.currentScript;
  var BASE = (me && me.src) ? me.src.replace(/[^\/]*$/, "") : "./";
  var root = document.getElementById("iconologie");
  if(!root){ root = document.createElement("div"); root.id = "iconologie"; (me && me.parentNode ? me.parentNode : document.body).appendChild(root); }
  root.className = "ic";
  if(root.dataset.top) root.style.setProperty("--top", root.dataset.top);
  // data-book="<slug>" запирает блок на одной книге (так подключается блок на Тильде).
  // Без атрибута — поведение по умолчанию, то же самое, что было до появления библиотеки:
  // блок показывает "iconologie" напрямую, старые адреса "#/p1-3" продолжают работать
  // без каких-либо правок на стороне Тильды. data-book="library" — особое значение,
  // которое явно включает список всех книг (так подключён index.html на GitHub Pages).
  var dataBookAttr = root.getAttribute("data-book");
  var forcedBook = dataBookAttr === "library" ? null : (dataBookAttr || "iconologie");

  // шрифты и стили
  function addLink(href){ var l=document.createElement("link"); l.rel="stylesheet"; l.href=href; document.head.appendChild(l); }
  addLink("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IM+Fell+English:ital@0;1&display=swap");
  var existingLink = document.querySelector('link[data-ic]');
  if(existingLink && existingLink.getAttribute("data-ic")!==APP_VER){ existingLink.remove(); existingLink=null; }
  if(!existingLink){
    var l=document.createElement("link"); l.rel="stylesheet"; l.href=BASE+"app.css?v="+APP_VER; l.setAttribute("data-ic",APP_VER); document.head.appendChild(l);
    // "load" doesn't bubble, so a capturing listener is how one handler
    // catches every engraving image as it finishes, however it got rendered
    // (innerHTML swaps happen all over render*()). Listening on `document`
    // rather than `root`: the object-detail sheet (openObjectSheet) appends
    // its panel directly to document.body, outside root's subtree, so a
    // listener on root never sees its images load and they stayed stuck at
    // opacity:0 (the .ic-fade-img default) forever.
    document.addEventListener("load", function(e){
      var el = e.target;
      if(el && el.tagName==="IMG" && el.classList && el.classList.contains("ic-fade-img")) el.classList.add("ic-img-in");
    }, true);
  }

  /* ---------- i18n ---------- */
  var DICT = {
    libTitle:     {ru:"Библиотека", en:"Library", fr:"Bibliothèque"},
    libSub:       {ru:"Старые книги об образах и древностях, с переводом на русский и английский.",
                    en:"Old books on allegory and antiquities, translated into Russian and English.",
                    fr:"D'anciens livres sur les emblèmes et les antiquités, traduits en russe et en anglais."},
    libEmpty:     {ru:"Книги ещё не добавлены.", en:"No books added yet.", fr:"Aucun livre n'a encore été ajouté."},
    progress:     {ru:"Переведено статей: {done} из {total}", en:"Articles translated: {done} of {total}", fr:"Articles traduits : {done} sur {total}"},
    searchPh:     {ru:"Найти: сюжет, предмет, слово по-русски, по-французски или по-английски", en:"Search: subject, motif, a word in English, French, or Russian", fr:"Rechercher : sujet, motif, un mot en français, en anglais ou en russe"},
    fAll:         {ru:"Все", en:"All", fr:"Tout"},
    fPart1:       {ru:"Часть 1", en:"Part 1", fr:"Partie 1"},
    fPart2:       {ru:"Часть 2", en:"Part 2", fr:"Partie 2"},
    fReady:       {ru:"С гравюрой и переводом", en:"With engraving and translation", fr:"Avec gravure et traduction"},
    fWithImg:     {ru:"С гравюрой", en:"With engraving", fr:"Avec gravure"},
    fNoImg:       {ru:"Без гравюры", en:"Without engraving", fr:"Sans gravure"},
    sBook:        {ru:"Как в книге", en:"As in the book", fr:"Comme dans le livre"},
    sAlpha:       {ru:"По алфавиту", en:"Alphabetical", fr:"Par ordre alphabétique"},
    sPage:        {ru:"По странице", en:"By page", fr:"Par page"},
    found:        {ru:"Найдено: {n}", en:"Found: {n}", fr:"Trouvé : {n}"},
    groupItems:   {ru:"{n} записей", en:"{n} entries", fr:"{n} fiches"},
    matchTitle:   {ru:"Совпадения в названии", en:"Title matches", fr:"Correspondances dans le titre"},
    matchBody:    {ru:"Совпадения в тексте", en:"Text matches", fr:"Correspondances dans le texte"},
    clearSearch:  {ru:"Очистить поиск", en:"Clear search", fr:"Effacer la recherche"},
    emptyReady:   {ru:"Пока нет готовых статей. Они появятся здесь по мере перевода.", en:"No articles finished yet. They will appear here as the translation progresses.", fr:"Aucun article terminé pour l'instant. Ils apparaîtront ici au fur et à mesure de la traduction."},
    emptySearch:  {ru:"Ничего не найдено. Попробуйте другое слово или старое написание, например «hyver» вместо «hiver».",
                    en:"Nothing found. Try another word or the old spelling, e.g. “hyver” instead of “hiver”.",
                    fr:"Rien n'a été trouvé. Essayez un autre mot ou l'ancienne orthographe, par exemple « hyver » au lieu de « hiver »."},
    partN:        {ru:"ч. {n}", en:"pt. {n}", fr:"part. {n}"},
    pageAbbr:     {ru:"с.", en:"p.", fr:"p."},
    loading:      {ru:"Загрузка…", en:"Loading…", fr:"Chargement…"},
    loadError:    {ru:"Не удалось загрузить данные. Обновите страницу.", en:"Could not load the data. Please refresh the page.", fr:"Impossible de charger les données. Veuillez actualiser la page."},
    bookError:    {ru:"Эта книга временно недоступна.", en:"This book is temporarily unavailable.", fr:"Ce livre est temporairement indisponible."},
    back:         {ru:"К оглавлению", en:"Back to index", fr:"Retour à l'index"},
    toLibrary:    {ru:"Библиотека", en:"Library", fr:"Bibliothèque"},
    prevArticle:  {ru:"Предыдущая статья", en:"Previous article", fr:"Article précédent"},
    nextArticle:  {ru:"Следующая статья", en:"Next article", fr:"Article suivant"},
    position:     {ru:"Часть {part}, с. {page}", en:"Part {part}, p. {page}", fr:"Partie {part}, p. {page}"},
    positionPage: {ru:"с. {page}", en:"p. {page}", fr:"p. {page}"},
    engravingAlt: {ru:"Гравюра: {title}", en:"Engraving: {title}", fr:"Gravure : {title}"},
    figOf:        {ru:"{k} из {n}", en:"{k} of {n}", fr:"{k} sur {n}"},
    captionLbl:   {ru:"Подпись на гравюре:", en:"Caption on the engraving:", fr:"Légende de la gravure :"},
    whatSec:      {ru:"Что изображено", en:"What is depicted", fr:"Ce qui est représenté"},
    translSec:    {ru:"Перевод", en:"Translation", fr:"Traduction"},
    originalSec:  {ru:"Оригинал", en:"Original", fr:"Original"},
    viewScan:     {ru:"скан", en:"scan", fr:"numérisation"},
    viewText:     {ru:"текст", en:"text", fr:"texte"},
    openFull:     {ru:"Открыть на весь экран", en:"Open fullscreen", fr:"Ouvrir en plein écran"},
    pagePrev:     {ru:"Предыдущая страница", en:"Previous page", fr:"Page précédente"},
    pageNext:     {ru:"Следующая страница", en:"Next page", fr:"Page suivante"},
    pageOf:       {ru:"стр. {k} из {n}", en:"page {k} of {n}", fr:"page {k} sur {n}"},
    missing:      {ru:"Эта статья ещё не добавлена.", en:"This article has not been added yet.", fr:"Cet article n'a pas encore été ajouté."},
    missingAt:    {ru:"В книге: часть {part}, страница {page}.", en:"In the book: part {part}, page {page}.", fr:"Dans le livre : partie {part}, page {page}."},
    pagerBack:    {ru:"Назад", en:"Back", fr:"Précédent"},
    pagerNext:    {ru:"Дальше", en:"Next", fr:"Suivant"},
    navPrev:      {ru:"Пред.", en:"Prev", fr:"Préc."},
    navNext:      {ru:"След.", en:"Next", fr:"Suiv."},
    lbAlt:        {ru:"Гравюра", en:"Engraving", fr:"Gravure"},
    close:        {ru:"Закрыть", en:"Close", fr:"Fermer"},
    langName:     {ru:"RU", en:"EN", fr:"FR"},
    aboutLink:    {ru:"О книге", en:"About the book", fr:"À propos du livre"},
    moreInfo:     {ru:"Подробнее", en:"More info", fr:"En savoir plus"},
    aboutTitle:   {ru:"О книге", en:"About the book", fr:"À propos du livre"},
    aboutPartial: {ru:"Перевод ещё не завершён — вот что готово на сегодня.", en:"The translation is not finished yet - here is what's ready so far.", fr:"La traduction n'est pas encore terminée — voici ce qui est prêt à ce jour."},
    plateLink:    {ru:"Смотреть таблицу целиком", en:"View the full plate", fr:"Voir la planche entière"},
    plateTitle:   {ru:"Таблица {n}", en:"Plate {n}", fr:"Planche {n}"},
    plateHint:    {ru:"Нажмите на номер, чтобы открыть предмет.", en:"Click a number to open that object.", fr:"Cliquez sur un numéro pour ouvrir cet objet."},
    infoSec:      {ru:"Сведения", en:"Details", fr:"Détails"},
    objCount:     {ru:"Предметов: {n}", en:"Objects: {n}", fr:"Objets : {n}"},
    progressShort:{ru:"{done} из {total} переведено", en:"{done} of {total} translated", fr:"{done} sur {total} traduits"},
    viewList:     {ru:"Список предметов", en:"Object list", fr:"Liste des objets"},
    viewBook:     {ru:"Как в книге", en:"As printed", fr:"Comme imprimé"}
  };
  function t(key, vars){
    var s = (DICT[key] && (DICT[key][state.lang] || DICT[key].en || DICT[key].ru)) || key;
    if(vars) for(var k in vars) s = s.replace("{"+k+"}", vars[k]);
    return s;
  }
  // текст с полки книги: {ru,en} -> строка на текущем языке, с откатом на ru
  function bt(field){ return field ? (field[state.lang] || field.ru || "") : ""; }
  function partLabel(book, n){
    var p = book && book.meta && book.meta.parts && book.meta.parts.filter(function(x){return x.n===n;})[0];
    if(p) return p[state.lang] || p.ru;
    return t("partN",{n:n});
  }

  var state={q:"",filter:"all",sort:"book",scroll:0,lang:"ru"};

  // язык: ?lang= в URL (приоритет и запоминается) > сохранённый выбор > data-lang на блоке > ru
  (function initLang(){
    var qLang = null;
    try{ qLang = new URLSearchParams(location.search).get("lang"); }catch(e){}
    var saved = null;
    try{ saved = localStorage.getItem("ic-lang"); }catch(e){}
    var fromAttr = root.getAttribute("data-lang");
    var isLang = function(v){ return v==="en"||v==="ru"||v==="fr"; };
    var lang = isLang(qLang) ? qLang : isLang(saved) ? saved : isLang(fromAttr) ? fromAttr : "en";
    state.lang = lang;
    if(qLang && qLang!==saved){ try{ localStorage.setItem("ic-lang", qLang); }catch(e){} }
    root.setAttribute("data-lang", lang);
  })();

  // Always-visible RU/EN switch in the page's fixed top bar (if one exists —
  // e.g. the standalone GitHub Pages index.html), so it never scrolls away
  // or disappears depending on which view is rendered. The per-page switch
  // in the content itself (langSwitch()/bindLangSwitch() below) stays as a
  // fallback for contexts with no such bar (Tilda embed).
  var backBarLangEl = document.getElementById("back-bar-lang");
  if(backBarLangEl) document.body.classList.add("has-back-bar-lang");
  function renderBackBarLang(){
    if(!backBarLangEl) return;
    backBarLangEl.innerHTML =
      '<button type="button" data-lang="ru" aria-pressed="'+(state.lang==="ru")+'">RU</button>'+
      '<button type="button" data-lang="en" aria-pressed="'+(state.lang==="en")+'">EN</button>'+
      '<button type="button" data-lang="fr" aria-pressed="'+(state.lang==="fr")+'">FR</button>';
    backBarLangEl.querySelectorAll("button").forEach(function(b){
      b.addEventListener("click",function(){ setLang(b.getAttribute("data-lang")); });
    });
  }
  renderBackBarLang();

  function setLang(l){
    state.lang = l;
    try{ localStorage.setItem("ic-lang", l); }catch(e){}
    try{
      var u = new URL(location.href);
      u.searchParams.set("lang", l);
      history.replaceState(null, "", u.toString());
    }catch(e){}
    root.setAttribute("data-lang", l);
    renderBackBarLang();
    route();
  }
  function keep(slug){ try{ sessionStorage.setItem("ic-state:"+slug, JSON.stringify({q:state.q,filter:state.filter,sort:state.sort})); }catch(e){} }
  function restoreState(slug){
    state.q=""; state.filter="all"; state.sort="book";
    try{ var s=sessionStorage.getItem("ic-state:"+slug); if(s){ var o=JSON.parse(s); state.q=o.q||""; state.filter=o.filter||"all"; state.sort=o.sort||"book"; } }catch(e){}
  }

  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/¶/g,"").replace(/ſ/g,"s").replace(/ё/g,"е").replace(/j/g,"i").replace(/v/g,"u").replace(/y/g,"i").replace(/['’]/g," "); }
  // paragraphs may embed a quoted verse after a ¶ marker, with lines separated by " / ";
  // render the verse as its own italic, line-broken block instead of running it into the prose.
  function paraHtml(arr){
    return (arr||[]).map(function(p){
      var s = String(p||"");
      if(s.charAt(0)==="§") return "<h3 class=\"ic-subhead\">"+esc(s.slice(1))+"</h3>";
      var parts = s.split("¶"), html = "";
      if(parts[0]) html += "<p>"+esc(parts[0])+"</p>";
      for(var i=1;i<parts.length;i++){
        html += '<p class="ic-verse">'+parts[i].split(" / ").map(esc).join("<br>")+'</p>';
      }
      return html;
    }).join("");
  }
  // для книг с просмотром по табличкам (viewer:"plate") готовность значит, что есть
  // перевод текста, а не только вырезанная картинка — картинка есть у всех объектов
  // таблицы сразу, это не то же самое, что статья готова.
  function ready(it, book){
    if(book && book.meta && book.meta.viewer==="plate") return !!(it.text_ru && it.text_ru.length);
    return (it.img&&it.img.length) || (it.text_ru&&it.text_ru.length);
  }
  // заголовок/перевод/группа на текущем языке, с откатом на русский, если EN ещё не готов
  function titleOf(it){
    if(state.lang==="fr" && it.name_fr) return it.name_fr;
    return state.lang==="en" && it.en ? it.en : it.ru;
  }
  function groupOf(it){
    if(state.lang==="fr" && it.group_frtrans) return it.group_frtrans;
    return state.lang==="en" && it.group_en ? it.group_en : it.group;
  }
  // Translated body text (the "Translation" section). text_fr is overloaded
  // across this app: for books with an "Original" toggle (showOriginal!==
  // false), text_fr already holds the ORIGINAL-language text shown there —
  // reusing it as a French *translation* here would just duplicate that same
  // text under a "Translation" label. So the FR-translation reading of
  // text_fr is opt-in per book (book.meta.frIsTranslation), set only for
  // books where text_fr is a genuine French translation of the source
  // (e.g. Cartari, translated from Italian). A third case: book.meta.
  // sourceIsFrench, for books whose ORIGINAL is already French (Audran,
  // Grosson, Iconologie) — there text_fr IS both the original and the
  // correct thing to show as "Translation" when lang is fr, since nothing
  // needs translating. text_frtrans is a genuine new French translation,
  // used (e.g. Alciato, translated from Latin) distinct from the original-
  // language text_fr shown separately in the "Original" panel.
  function textFor(it, book){
    if(state.lang==="fr"){
      if(it.text_frtrans && it.text_frtrans.length) return it.text_frtrans;
      if(book && book.meta && (book.meta.frIsTranslation || book.meta.sourceIsFrench) && it.text_fr && it.text_fr.length) return it.text_fr;
    }
    if(state.lang==="en" && it.text_en && it.text_en.length) return it.text_en;
    return it.text_ru;
  }
  // True when the "Original" text_fr panel would just repeat what textFor()
  // is already showing in the Translation section (lang is fr, no genuine
  // text_frtrans, and text_fr is being reused as the French original-as-
  // translation via sourceIsFrench). Hide the Original panel's text view in
  // that case to avoid showing the identical paragraph twice.
  function fuOrigIsDup(it, book){
    return state.lang==="fr" && !(it.text_frtrans && it.text_frtrans.length) &&
      !(book && book.meta && book.meta.frIsTranslation) &&
      !!(book && book.meta && book.meta.sourceIsFrench);
  }

  /* ---------- загрузка библиотеки и книг ---------- */
  var library = null;        // содержимое library.json
  var books = {};            // кэш: slug -> {meta, items, byId} | "error" | undefined(загружается)

  function loadLibrary(cb){
    if(library){ cb(library); return; }
    fetch(BASE+"library.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ library = d.books || []; cb(library); })
      .catch(function(){ library = []; cb(library); });
  }

  function openBook(slug, cb){
    if(books[slug] !== undefined){ cb(books[slug]==="error" ? null : books[slug]); return; }
    root.innerHTML = '<div class="ic-wrap"><p class="ic-sub">'+t("loading")+'</p></div>';
    Promise.all([
      fetch(BASE+"books/"+slug+"/book.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }),
      fetch(BASE+"books/"+slug+"/entries.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
    ]).then(function(res){
      var meta = res[0], data = res[1];
      var items = data.items || [], byId = {};
      items.forEach(function(it,i){
        it.ord=i; byId[it.id]=it; it.pn=parseInt(it.page,10)||0;
        // Separate from the full-text search key below: used only to rank a
        // search hit higher when the word is literally in the title (in any
        // of the three languages), not just somewhere in the article body.
        it.titleKey = norm([it.fr,it.ru,it.en||""].join(" "));
        it.key = norm([it.fr,it.ru,it.en||"",it.group,it.group_fr,it.group_en||"",it.num,it.caption||"",
          it.legend_ru||"",it.legend_en||"",it.legend_fr||"",
          (it.attrs||[]).map(function(a){return a.what+" "+a.meaning+" "+(a.what_en||"")+" "+(a.meaning_en||"");}).join(" "),
          (it.text_ru||[]).join(" "),(it.text_en||[]).join(" "),(it.text_fr||[]).join(" ")].join(" "));
      });
      var book = {slug:slug, meta:meta, items:items, byId:byId};
      books[slug] = book;
      cb(book);
    }).catch(function(){
      books[slug] = "error";
      root.innerHTML = '<div class="ic-wrap"><p class="ic-empty">'+t("bookError")+'</p><button type="button" class="ic-back ic-to-lib">'+t("toLibrary")+'</button></div>';
      var b = root.querySelector(".ic-to-lib"); if(b) b.addEventListener("click",function(){ location.hash=""; });
      cb(null);
    });
  }

  /* ---------- маршрутизация ---------- */
  // Форматы адреса: "#/<slug>/<id>" — карточка; "#/<slug>" — указатель книги;
  // "#/<slug>/about" — страница «О книге»; "#/<slug>/plate/<n>" — просмотр таблицы
  // целиком с номерами (только для книг с book.json viewer:"plate");
  // "#/" или пусто — библиотека (когда книга не закреплена через data-book).
  // Старый формат без слага "#/p1-3" по-прежнему работает и ведёт в "iconologie" —
  // так не ломаются ссылки, сохранённые до появления библиотеки.
  function parseHash(){
    var segs = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    var slug, rest;
    if(forcedBook){
      if(segs[0] === forcedBook){ slug = forcedBook; rest = segs.slice(1); }
      else { slug = forcedBook; rest = segs; }
    } else {
      if(segs.length===1 && /^p[12]-\d+$/.test(segs[0])) return {slug:"iconologie", id:segs[0]};
      if(!segs.length) return {slug:null};
      if(!/^[a-z][a-z0-9-]*$/.test(segs[0])) return {slug:null};
      slug = segs[0]; rest = segs.slice(1);
    }
    if(!rest.length) return {slug:slug};
    if(rest[0]==="about") return {slug:slug, view:"about"};
    if(rest[0]==="plate" && rest[1]) return {slug:slug, view:"plate", plateNum:rest[1]};
    return {slug:slug, id:rest[0]};
  }

  function route(){
    if(activeSheetClose){ activeSheetClose(); }
    var p = parseHash();
    if(!p.slug){ renderLibraryHome(); return; }
    openBook(p.slug, function(book){
      if(!book){ if(!forcedBook) renderLibraryHome(); return; }
      var isPlateBook = book.meta.viewer==="plate";
      if(p.view==="about") renderAbout(book);
      else if(p.view==="plate") renderPlate(book, p.plateNum);
      else if(p.id && book.byId[p.id] && isPlateBook && book.byId[p.id].plate!=null) renderPlate(book, book.byId[p.id].plate, {focus:p.id});
      else if(p.id && book.byId[p.id]) renderCard(book, book.byId[p.id]);
      else if(isPlateBook) renderPlateIndex(book);
      else renderIndex(book);
    });
  }
  window.addEventListener("hashchange", route);
  loadLibrary(function(){ route(); });

  // Collapse the sticky search/filter bar smoothly as the visitor scrolls
  // down a long index, so the list genuinely slides up to take its place
  // — not just a hidden overlay with a gap left behind. Progress tracks
  // scrollY continuously (not a hide/show threshold), and an eased current
  // value chases that target every frame, which is what gives the list its
  // slight catch-up lag instead of snapping. Deliberately NOT applied to
  // the article-page nav (.ic-nav) — that bar is small and only has two
  // short-lived items in it, collapsing it added motion without benefit
  // and looked like it was falling apart on scroll.
  (function(){
    var current = 0, target = 0, naturalHeight = 0, measuredFor = null;
    var START = 30, RANGE = 130, EASE = 0.18;

    function measure(bar){
      if(bar === measuredFor) return;
      measuredFor = bar;
      bar.style.maxHeight = "none";
      naturalHeight = bar.getBoundingClientRect().height;
      current = 0; target = 0;
      bar.style.maxHeight = naturalHeight + "px";
    }

    function tick(){
      var bar = root.querySelector(".ic-controls");
      if(bar){
        measure(bar);
        // iOS resizes the visual viewport when the keyboard opens for a
        // focused field, which otherwise reads exactly like a downward
        // scroll to the check below and collapses the bar the visitor is
        // trying to type into. Keep it pinned open while the search field
        // (or anything else inside the bar) has focus.
        var focusedInBar = document.activeElement && bar.contains(document.activeElement);
        target = focusedInBar ? 0 : Math.min(1, Math.max(0, (window.scrollY - START) / RANGE));
        current += (target - current) * EASE;
        if(Math.abs(target - current) < 0.001) current = target;
        var shift = naturalHeight * current;
        bar.style.maxHeight = (naturalHeight - shift) + "px";
        // Fully faded out by the halfway point, same threshold where pointer
        // events turn off — otherwise the translucent, blurred panel keeps
        // hanging over the list rows scrolling up underneath it for the rest
        // of the collapse, reading as text showing through text.
        bar.style.opacity = String(current < 0.5 ? 1 - current * 2 : 0);
        bar.style.overflow = "hidden";
        bar.style.pointerEvents = current > 0.5 ? "none" : "";
        // Shift the content itself up by the same amount the box has shrunk,
        // so rows exit past the fixed top edge instead of getting cut off
        // wherever the box's shrinking bottom edge happens to land.
        for(var i=0;i<bar.children.length;i++){
          bar.children[i].style.transform = shift ? "translateY(-"+shift+"px)" : "";
        }
      } else {
        measuredFor = null;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  function go(book, id){ state.scroll = window.scrollY; location.hash = forcedBook ? "#/"+id : "#/"+book.slug+"/"+id; }
  function goIndex(book){ location.hash = forcedBook ? "" : "#/"+book.slug; }
  function hrefFor(book, suffix){ return forcedBook ? "#/"+suffix : "#/"+book.slug+"/"+suffix; }
  function toTop(){
    // The standalone page's back-bar is sticky over the top of the viewport
    // (root.dataset.top, e.g. "52px"). Snapping root's top to 0 would land
    // the new article's first row — the "Back to index" button — right
    // under that bar instead of below it, so the target is offset by the
    // bar's own height, not the bare top of the viewport.
    var headerOffset = parseFloat(root.dataset.top) || 0;
    function snap(){ var r=root.getBoundingClientRect(); if(r.top<headerOffset) window.scrollTo(0, window.scrollY+r.top-headerOffset); }
    snap();
    // The big plate/figure images have no explicit width/height, so the page
    // grows once each one finishes loading. The browser's own scroll
    // anchoring then nudges the scroll position to compensate for that shift
    // — which is what was occasionally leaving an article open mid-page
    // instead of at the top. Re-snap after each image loads to undo that.
    root.querySelectorAll("img").forEach(function(img){
      if(img.complete) return;
      img.addEventListener("load", snap, {once:true});
    });
  }
  // WebKit (в т.ч. iPadOS) иногда не перерисовывает position:sticky после замены
  // innerHTML на SPA-переходе — элемент «застревает» в старом положении/размере.
  // Небольшой форс-reflow после каждого рендера чинит это без видимого мигания.
  function nudgeRepaint(){
    requestAnimationFrame(function(){ window.scrollTo(window.scrollX, window.scrollY); });
  }

  function langSwitch(){
    return '<div class="ic-lang" role="group" aria-label="RU / EN / FR">'+
      '<button type="button" class="ic-lang-b" data-lang="ru" aria-pressed="'+(state.lang==="ru")+'">RU</button>'+
      '<button type="button" class="ic-lang-b" data-lang="en" aria-pressed="'+(state.lang==="en")+'">EN</button>'+
      '<button type="button" class="ic-lang-b" data-lang="fr" aria-pressed="'+(state.lang==="fr")+'">FR</button>'+
      '</div>';
  }
  function bindLangSwitch(container){
    container.querySelectorAll(".ic-lang-b").forEach(function(b){ b.addEventListener("click",function(){ setLang(b.getAttribute("data-lang")); }); });
  }

  // "x" button to empty the search field in one tap instead of holding
  // backspace — shows only once there's something to clear, re-fires the
  // input event so the existing filtering logic just runs as normal.
  function wireSearchClear(q){
    var btn = q.parentNode.querySelector(".ic-search-clear");
    if(!btn) return;
    function sync(){ btn.hidden = !q.value; }
    sync();
    q.addEventListener("input", sync);
    btn.addEventListener("click", function(){
      q.value = "";
      q.dispatchEvent(new Event("input", {bubbles:true}));
      q.focus();
    });
  }

  /* ---------- библиотека: список книг ---------- */
  function renderLibraryHome(){
    root.innerHTML = '<div class="ic-wrap"><p class="ic-sub">'+t("loading")+'</p></div>';
    loadLibrary(function(list){
      Promise.all(list.map(function(b){
        return fetch(BASE+"books/"+b.slug+"/book.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
      })).then(function(metas){
        var cards = list.map(function(b,i){
          var m = metas[i]; if(!m) return "";
          return '<li class="ic-book-card" tabindex="0" role="link" data-slug="'+esc(b.slug)+'">'+
            '<div class="ic-book-head">'+
              '<h2 class="ic-book-title">'+esc(bt(m.title))+'</h2>'+
              (m.author?'<p class="ic-book-author">'+esc(m.author)+(m.year?", "+m.year:"")+'</p>':"")+
            '</div>'+
            (m.subtitle?
              '<details class="ic-book-more"><summary>'+esc(t("moreInfo"))+'</summary>'+
              '<p class="ic-book-sub">'+esc(bt(m.subtitle))+'</p></details>'
            : "")+
          '</li>';
        }).join("");
        root.innerHTML =
          '<div class="ic-wrap">'+
            '<div class="ic-top-row">'+langSwitch()+'</div>'+
            '<h1 class="ic-title">'+t("libTitle")+'</h1>'+
            '<p class="ic-sub">'+t("libSub")+'</p>'+
            '<ul class="ic-booklist">'+(cards || '<p class="ic-empty">'+t("libEmpty")+'</p>')+'</ul>'+
          '</div>';
        bindLangSwitch(root);
        // The <details>/<summary> toggle only expands/collapses the longer
        // description in place — a click or Enter/Space on it must not also
        // trigger the card's own handler below, which is what opens the book.
        root.querySelectorAll(".ic-book-card").forEach(function(c){
          c.addEventListener("click",function(e){
            if(e.target.closest(".ic-book-more")) return;
            location.hash = "#/"+c.getAttribute("data-slug");
          });
          c.addEventListener("keydown",function(e){
            if((e.key==="Enter"||e.key===" ") && !e.target.closest(".ic-book-more")){ e.preventDefault(); location.hash = "#/"+c.getAttribute("data-slug"); }
          });
        });
        nudgeRepaint();
      });
    });
  }

  /* ---------- указатель книги ---------- */
  function filtered(book){
    var nq = norm(state.q.trim());
    var res = book.items.filter(function(it){
      if(state.filter==="1" && it.part!==1) return false;
      if(state.filter==="2" && it.part!==2) return false;
      if(state.filter==="ready" && !ready(it, book)) return false;
      if(state.filter==="withimg" && it.textOnly) return false;
      if(state.filter==="noimg" && !it.textOnly) return false;
      return !nq || nq.split(/\s+/).every(function(w){ return it.key.indexOf(w)>-1; });
    });
    if(state.sort==="ru") res.sort(function(a,b){ return titleOf(a).localeCompare(titleOf(b),state.lang==="ru"?"ru":state.lang); });
    else if(state.sort==="page") res.sort(function(a,b){ return a.part-b.part || a.pn-b.pn || a.ord-b.ord; });
    // While searching, a hit whose title literally contains the word (in any
    // of the three languages) outranks one that only matches somewhere in
    // the body text — stable sort, so the chosen sort order above still
    // decides the order within each of those two groups.
    if(nq){
      var words = nq.split(/\s+/);
      res.sort(function(a,b){
        var am = words.every(function(w){ return a.titleKey.indexOf(w)>-1; }) ? 0 : 1;
        var bm = words.every(function(w){ return b.titleKey.indexOf(w)>-1; }) ? 0 : 1;
        return am - bm;
      });
    }
    return res;
  }

  function renderIndex(book){
    restoreState(book.slug);
    var multiPart = book.meta.parts && book.meta.parts.length > 1;
    var hasTextOnly = book.items.some(function(it){ return it.textOnly; });
    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-top-row">'+(forcedBook?"":'<button type="button" class="ic-to-lib-link ic-back">'+t("toLibrary")+'</button>')+
          (book.meta.about?'<a class="ic-about-link" href="'+esc(hrefFor(book,"about"))+'">'+t("aboutLink")+'</a>':"")+
          langSwitch()+'</div>'+
        '<h1 class="ic-title">'+esc(bt(book.meta.title))+'</h1>'+
        '<p class="ic-sub">'+esc(bt(book.meta.subtitle))+'</p>'+
        '<div class="ic-controls">'+
          '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("searchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("searchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
          '<div class="ic-row"><div class="ic-seg" role="group" aria-label="Filter">'+
            chip("all",t("fAll"))+(multiPart?chip("1",t("fPart1"))+chip("2",t("fPart2")):"")+
            (hasTextOnly?chip("withimg",t("fWithImg"))+chip("noimg",t("fNoImg")):"")+
          '</div><select class="ic-sort" aria-label="Sort">'+
            opt("book",t("sBook"))+opt("ru",t("sAlpha"))+opt("page",t("sPage"))+
          '</select></div>'+
          '<p class="ic-count"></p>'+
        '</div>'+
        '<div class="ic-list"></div>'+
      '</div>';
    bindLangSwitch(root);
    var toLib = root.querySelector(".ic-to-lib-link"); if(toLib) toLib.addEventListener("click",function(){ location.hash=""; });
    var q=root.querySelector(".ic-search"); q.value=state.q;
    q.addEventListener("input",function(){ state.q=q.value; keep(book.slug); fill(book); });
    wireSearchClear(q);
    root.querySelector(".ic-sort").addEventListener("change",function(e){ state.sort=e.target.value; keep(book.slug); fill(book); });
    root.querySelectorAll(".ic-chip").forEach(function(b){ b.addEventListener("click",function(){
      state.filter=b.getAttribute("data-f"); keep(book.slug);
      root.querySelectorAll(".ic-chip").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
      fill(book);
    });});
    root.querySelector(".ic-list").addEventListener("click",function(e){
      var r=e.target.closest(".ic-row-item"); if(r) go(book, r.getAttribute("data-id"));
    });
    root.querySelector(".ic-list").addEventListener("keydown",function(e){
      var r=e.target.closest(".ic-row-item"); if(r && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); go(book, r.getAttribute("data-id")); }
    });
    fill(book);
    if(state.scroll){ var y=state.scroll; state.scroll=0; requestAnimationFrame(function(){ window.scrollTo(0,y); }); }
    nudgeRepaint();
  }
  function chip(v,t_){ return '<button type="button" class="ic-chip" data-f="'+v+'" aria-pressed="'+(state.filter===v)+'">'+t_+'</button>'; }
  function opt(v,t_){ return '<option value="'+v+'"'+(state.sort===v?" selected":"")+'>'+t_+'</option>'; }

  function fill(book){
    var list=root.querySelector(".ic-list"), count=root.querySelector(".ic-count");
    var res=filtered(book), nq=state.q.trim();
    var multiPart = book.meta.parts && book.meta.parts.length > 1;
    count.textContent = res.length ? t("found",{n:res.length}) : "";
    if(!res.length){
      list.innerHTML = '<p class="ic-empty">'+(state.filter==="ready" && !nq ? t("emptyReady") : t("emptySearch"))+'</p>';
      return;
    }
    var grouped = state.sort==="book" && !nq, showPart = multiPart && (state.sort==="ru" || (!grouped && state.filter!=="1" && state.filter!=="2"));
    // While searching, the relevance sort (title hits first, then body-text
    // hits) can interleave book parts out of order — repeating "Part One" /
    // "Part Two" back and forth made no sense as section headers there. So
    // during a search the big header marks the RELEVANCE group instead (title
    // match vs. text-only match); it's still per-part the rest of the time.
    // Either way each row also carries its own "pt. 1" / "pt. 2" tag below.
    var nqWords = nq ? norm(nq).split(/\s+/) : null;
    // Pre-count how many entries fall in each group, so the collapsed <summary>
    // can show "12 entries" before the group is ever opened — otherwise we'd
    // only learn the count once we'd already streamed past the whole group.
    var groupCounts = {};
    if(grouped){
      res.forEach(function(it){
        var gk=it.part+"|"+it.group+"|"+(it.group_fr||"")+"|"+(it.group_page||"");
        groupCounts[gk]=(groupCounts[gk]||0)+1;
      });
    }
    var html="", part=0, grp=null, open=false, openTag="", relGroup=null;
    res.forEach(function(it){
      if(nq){
        var isTitleHit = nqWords.every(function(w){ return it.titleKey.indexOf(w)>-1; });
        var rg = isTitleHit ? "title" : "body";
        if(rg!==relGroup){
          if(open){ html+="</ul></"+openTag+">"; open=false; }
          html+='<h2 class="ic-part">'+esc(t(isTitleHit?"matchTitle":"matchBody"))+'</h2>';
          relGroup=rg; grp=null;
        }
      } else if(state.sort!=="ru" && it.part!==part){
        if(open){ html+="</ul></"+openTag+">"; open=false; }
        if(multiPart) html+='<h2 class="ic-part">'+esc(partLabel(book,it.part))+'</h2>';
        part=it.part; grp=null;
      }
      if(grouped){
        var gk=it.part+"|"+it.group+"|"+(it.group_fr||"")+"|"+(it.group_page||"");
        if(gk!==grp){
          if(open) html+="</ul></"+openTag+">";
          html+='<details class="ic-group"><summary><h2><span class="ic-gcap">'+esc(groupOf(it))+'</span>'+(it.group_fr?'<span class="ic-gfr">'+esc(it.group_fr)+'</span>':"")+
            (it.group_page?'<span class="ic-gpg">'+esc(t("pageAbbr"))+' '+esc(it.group_page)+'</span>':"")+
            '<span class="ic-gn">'+esc(t("groupItems",{n:groupCounts[gk]}))+'</span></h2></summary><ul>';
          grp=gk; open=true; openTag="details";
        }
      } else if(!open){ html+='<section class="ic-group"><ul>'; open=true; openTag="section"; }
      html+='<li class="ic-row-item" tabindex="0" role="link" data-id="'+it.id+'">'+
        '<span class="ic-pg">'+esc(it.page)+'<small>'+(showPart?t("partN",{n:it.part}):t("pageAbbr"))+'</small></span>'+
        '<span><span class="ic-ru">'+esc(titleOf(it))+(it.flag?" ("+esc(it.flag)+")":"")+'</span></span>'+
      '</li>';
    });
    if(open) html+="</ul></"+openTag+">";
    list.innerHTML=html;
  }

  /* ---------- указатель книги с просмотром по табличкам (viewer:"plate") ----------
     Основная единица — таблица, не отдельный предмет: одна строка на таблицу
     (миниатюра, название, число предметов, страницы, готовность). Поиск
     переключает список на предметы (как в renderIndex), ведущие через
     существующий id-маршрут в renderPlate(book, plate, {focus:id}). */
  function plateRowsOf(book){
    var byPlate = {};
    book.items.forEach(function(it){
      // Some books carry supplementary entries (errata, alphabetical indices)
      // that aren't tied to any engraved plate — no plate_img/bbox, just a
      // scan + translated text. They're reachable by id (renderCard), but
      // have no place in the plate grid; skip them here so they don't form
      // a bogus plate:null group, which breaks the Number(key)<->byPlate[key]
      // round trip below ("null" key can't be found back via Number("null")).
      if(it.plate==null || it.plate==="") return;
      (byPlate[it.plate]=byPlate[it.plate]||[]).push(it);
    });
    return Object.keys(byPlate).map(Number).sort(function(a,b){return a-b;}).map(function(n){
      return {n:n, objs:byPlate[n]};
    });
  }
  function plateRowsHtml(book){
    return plateRowsOf(book).map(function(r){
      var objs = r.objs, n = r.n;
      var pm = (book.meta.plates||[]).filter(function(p){ return p.n===n; })[0] || {};
      var title = pm["title_"+state.lang] || pm.title_ru || t("plateTitle",{n:n});
      var done = objs.filter(function(it){ return ready(it, book); }).length;
      var pages = objs.map(function(it){ return parseInt(it.page,10); }).filter(function(x){ return x; });
      var pmin = pages.length?Math.min.apply(null,pages):null, pmax = pages.length?Math.max.apply(null,pages):null;
      var pageStr = pmin!=null ? (esc(t("pageAbbr"))+" "+(pmin===pmax?pmin:pmin+"–"+pmax)) : "";
      var thumb = BASE+"books/"+book.slug+"/img/"+objs[0].plate_img;
      var pct = objs.length?Math.round(done*100/objs.length):0;
      return '<li class="ic-plate-row" tabindex="0" role="link" data-n="'+n+'">'+
        '<span class="ic-plate-thumb"><img class="ic-fade-img" loading="lazy" src="'+esc(thumb)+'" alt=""></span>'+
        '<span class="ic-plate-body">'+
          '<span class="ic-plate-name">'+esc(title)+'</span>'+
          '<span class="ic-plate-meta">'+esc(t("objCount",{n:objs.length}))+(pageStr?' · '+pageStr:'')+'</span>'+
          '<span class="ic-plate-prog">'+esc(t("progressShort",{done:done,total:objs.length}))+'<span class="ic-bar"><i style="width:'+pct+'%"></i></span></span>'+
        '</span>'+
      '</li>';
    }).join("");
  }
  function renderPlateIndex(book){
    restoreState(book.slug);
    var items = book.items;
    var done = items.filter(function(it){ return ready(it, book); }).length, pct = items.length ? Math.round(done*100/items.length) : 0;
    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-top-row">'+(forcedBook?"":'<button type="button" class="ic-to-lib-link ic-back">'+t("toLibrary")+'</button>')+
          (book.meta.about?'<a class="ic-about-link" href="'+esc(hrefFor(book,"about"))+'">'+t("aboutLink")+'</a>':"")+
          langSwitch()+'</div>'+
        '<h1 class="ic-title">'+esc(bt(book.meta.title))+'</h1>'+
        '<p class="ic-sub">'+esc(bt(book.meta.subtitle))+'</p>'+
        '<div class="ic-controls">'+
          '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("searchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("searchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
          '<p class="ic-count"></p>'+
        '</div>'+
        '<ul class="ic-plate-ul"></ul>'+
        '<div class="ic-list"></div>'+
      '</div>';
    bindLangSwitch(root);
    var toLib = root.querySelector(".ic-to-lib-link"); if(toLib) toLib.addEventListener("click",function(){ location.hash=""; });
    var q=root.querySelector(".ic-search"); q.value=state.q;
    function refresh(){
      var plateUl = root.querySelector(".ic-plate-ul"), list = root.querySelector(".ic-list"), count = root.querySelector(".ic-count");
      if(!state.q.trim()){
        plateUl.hidden=false; list.hidden=true; count.textContent="";
        plateUl.innerHTML = plateRowsHtml(book);
      } else {
        plateUl.hidden=true; list.hidden=false;
        fill(book);
      }
    }
    q.addEventListener("input",function(){ state.q=q.value; keep(book.slug); refresh(); });
    wireSearchClear(q);
    root.querySelector(".ic-list").addEventListener("click",function(e){
      var r=e.target.closest(".ic-row-item"); if(r) go(book, r.getAttribute("data-id"));
    });
    root.querySelector(".ic-list").addEventListener("keydown",function(e){
      var r=e.target.closest(".ic-row-item"); if(r && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); go(book, r.getAttribute("data-id")); }
    });
    root.querySelector(".ic-plate-ul").addEventListener("click",function(e){
      var r=e.target.closest(".ic-plate-row"); if(r){ state.scroll=window.scrollY; location.hash = hrefFor(book,"plate/"+r.getAttribute("data-n")); }
    });
    root.querySelector(".ic-plate-ul").addEventListener("keydown",function(e){
      var r=e.target.closest(".ic-plate-row"); if(r && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); state.scroll=window.scrollY; location.hash = hrefFor(book,"plate/"+r.getAttribute("data-n")); }
    });
    refresh();
    if(state.scroll){ var y=state.scroll; state.scroll=0; requestAnimationFrame(function(){ window.scrollTo(0,y); }); }
    nudgeRepaint();
  }

  /* ---------- карточка статьи ---------- */
  function seq(book){ var r=filtered(book); if(state.sort==="ru") return r; return r.slice().sort(function(a,b){return a.ord-b.ord;}); }
  // значение «своего» поля книги (book.json -> fields): сперва на текущем языке,
  // потом откат на русский перевод поля, потом на само поле без языка (владелец,
  // размер в оригинальных единицах, размер в см — они одни на все языки).
  function fieldVal(it, key){
    return it[key+"_"+state.lang] || it[key+"_ru"] || it[key] || "";
  }

  function renderCard(book, it){
    var s=seq(book), i=s.indexOf(it);
    if(i<0){ s=book.items; i=it.ord; }
    var prev=s[i-1], next=s[i+1];
    var pos = it.part ? t("position",{part:it.part,page:it.page}) : t("positionPage",{page:it.page});
    var imgBase = BASE+"books/"+book.slug+"/img/";
    var pagesBase = BASE+"books/"+book.slug+"/pages/";
    var imgs=(it.textOnly ? [] : (it.img||[])).map(function(src,k){
      return '<figure class="ic-fig" data-src="'+esc(imgBase+src)+'"><img class="ic-fade-img" loading="lazy" src="'+esc(imgBase+src)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'">'+
        (it.img.length>1?'<figcaption>'+t("figOf",{k:k+1,n:it.img.length})+'</figcaption>':"")+'</figure>';
    }).join("");
    var captionLine = it.caption ? '<p class="ic-caption"><b>'+esc(t("captionLbl"))+'</b> '+esc(it.caption)+'</p>' : "";
    var attrs=(it.attrs||[]).map(function(a){
      var what = state.lang==="fr" ? (a.what_frtrans || a.what_en || a.what) : state.lang==="en" && a.what_en ? a.what_en : a.what;
      var meaning = state.lang==="fr" ? (a.meaning_frtrans || a.meaning_en || a.meaning) : state.lang==="en" && a.meaning_en ? a.meaning_en : a.meaning;
      return '<li><b>'+esc(what)+'</b><span>'+esc(meaning)+'</span></li>';
    }).join("");
    var translArr = textFor(it, book);
    var transl=paraHtml(translArr);
    var showOrig = book.meta.showOriginal !== false;
    var hasScans = showOrig && it.scans && it.scans.length;
    var hasFr = showOrig && !book.meta.frIsTranslation && it.text_fr && it.text_fr.length && !fuOrigIsDup(it, book);
    var plateLink = (book.meta.viewer==="plate" && it.plate!=null)
      ? '<p class="ic-plate-link"><a href="'+esc(hrefFor(book,"plate/"+it.plate))+'">'+t("plateLink")+'</a></p>' : "";
    var fieldsHtml = "";
    if(book.meta.fields){
      Object.keys(book.meta.fields).forEach(function(key){
        var val = fieldVal(it, key);
        if(!val) return;
        var label = book.meta.fields[key][state.lang] || book.meta.fields[key].ru;
        fieldsHtml += '<li><b>'+esc(label)+'</b><span>'+esc(val)+'</span></li>';
      });
    }

    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-nav">'+
          '<button type="button" class="ic-back">'+t("back")+'</button>'+
          '<div class="ic-nav-pager">'+
            '<button type="button" class="ic-nav-pager-b" data-go="'+(prev?prev.id:"")+'"'+(prev?' title="'+esc(titleOf(prev))+'"':" disabled")+'>'+t("navPrev")+'</button>'+
            '<button type="button" class="ic-nav-pager-b" data-go="'+(next?next.id:"")+'"'+(next?' title="'+esc(titleOf(next))+'"':" disabled")+'>'+t("navNext")+'</button>'+
          '</div>'+
          '<span class="ic-nav-pos">'+pos+'</span>'+
          langSwitch()+
        '</div>'+
        '<header class="ic-head">'+
          '<p class="ic-kicker">'+(it.num?it.num+". ":"")+esc(it.group_fr?groupOf(it):(book.meta.parts&&book.meta.parts.length>1?partLabel(book,it.part):""))+'</p>'+
          '<h1 class="ic-h-fr">'+esc(it.fr)+'</h1>'+
          (titleOf(it)!==it.fr?'<p class="ic-h-ru">'+esc(titleOf(it))+'</p>':"")+
        '</header>'+
        (imgs?'<div class="ic-figs">'+imgs+'</div>'+captionLine+plateLink:"")+
        (fieldsHtml?'<section class="ic-sec"><h3>'+t("infoSec")+'</h3><ul class="ic-attrs">'+fieldsHtml+'</ul></section>':"")+
        (attrs?'<section class="ic-sec"><h3>'+t("whatSec")+'</h3><ul class="ic-attrs">'+attrs+'</ul></section>':"")+
        (transl?'<section class="ic-sec"><h3>'+t("translSec")+'</h3><div class="ic-text">'+transl+'</div></section>':"")+
        ((hasScans||hasFr)?renderOriginal(it,book):"")+
        (!imgs && !transl ? '<div class="ic-missing"><b>'+t("missing")+'</b><br>'+t("missingAt",{part:it.part,page:esc(it.page)})+'</div>':"")+
        '<div class="ic-pager">'+
          '<button type="button" data-go="'+(prev?prev.id:"")+'"'+(prev?"":" disabled")+'><small>'+t("pagerBack")+'</small><span>'+(prev?esc(prev.fr):"")+'</span>'+(prev?'<em>'+esc(titleOf(prev))+'</em>':"")+'</button>'+
          '<button type="button" data-go="'+(next?next.id:"")+'"'+(next?"":" disabled")+'><small>'+t("pagerNext")+'</small><span>'+(next?esc(next.fr):"")+'</span>'+(next?'<em>'+esc(titleOf(next))+'</em>':"")+'</button>'+
        '</div>'+
      '</div>';

    bindLangSwitch(root);
    root.querySelector(".ic-back").addEventListener("click",function(){
      goIndex(book);
    });
    root.querySelectorAll("[data-go]").forEach(function(b){ b.addEventListener("click",function(){
      var id=b.getAttribute("data-go"); if(id) go(book, id);
    });});
    root.querySelectorAll(".ic-fig").forEach(function(f){ f.addEventListener("click",function(){ lightbox(f.getAttribute("data-src")); }); });
    if(showOrig && (hasScans||hasFr)) bindOriginal(it, pagesBase);
    toTop();
    nudgeRepaint();
  }

  /* ---------- раздел «Оригинал»: скан / французский текст ---------- */
  function renderOriginal(it,book){
    var hasScans = it.scans && it.scans.length;
    var hasFr = !(book && book.meta && book.meta.frIsTranslation) && it.text_fr && it.text_fr.length && !fuOrigIsDup(it, book);
    var defaultView = hasScans ? "scan" : "text";
    return '<details class="ic-details ic-original"><summary>'+t("originalSec")+'</summary>'+
      '<div class="ic-orig-body" data-loaded="0">'+
        (hasScans && hasFr ? '<div class="ic-orig-toggle">'+
          '<button type="button" class="ic-ov-b" data-view="scan" aria-pressed="true">'+t("viewScan")+'</button>'+
          '<button type="button" class="ic-ov-b" data-view="text" aria-pressed="false">'+t("viewText")+'</button>'+
        '</div>' : "")+
        '<div class="ic-orig-view" data-view="'+defaultView+'"></div>'+
      '</div>'+
    '</details>';
  }
  function bindOriginal(it, pagesBase, container){
    var det = (container||root).querySelector(".ic-original");
    if(!det) return;
    var body = det.querySelector(".ic-orig-body");
    var view = det.querySelector(".ic-orig-view");
    var page = 0;
    function textHtml(){
      return '<div class="ic-text ic-fr-text">'+paraHtml(it.text_fr)+'</div>';
    }
    function scanHtml(){
      var scans = it.scans||[];
      if(!scans.length) return "";
      var src = pagesBase+scans[page];
      return '<div class="ic-scan">'+
        '<div class="ic-scan-frame" data-src="'+esc(src)+'">'+
          '<img class="ic-fade-img" src="'+esc(src)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'">'+
          '<button type="button" class="ic-scan-zoom" aria-label="'+esc(t("openFull"))+'">⤢</button>'+
        '</div>'+
        (scans.length>1?'<div class="ic-scan-nav">'+
          '<button type="button" class="ic-scan-prev" aria-label="'+esc(t("pagePrev"))+'"'+(page===0?" disabled":"")+'>‹</button>'+
          '<span>'+esc(t("pageOf",{k:page+1,n:scans.length}))+'</span>'+
          '<button type="button" class="ic-scan-next" aria-label="'+esc(t("pageNext"))+'"'+(page===scans.length-1?" disabled":"")+'>›</button>'+
        '</div>':"")+
      '</div>';
    }
    function draw(v){
      view.setAttribute("data-view", v);
      view.innerHTML = v==="scan" ? scanHtml() : textHtml();
      if(v==="scan"){
        var frame = view.querySelector(".ic-scan-frame");
        if(frame) frame.addEventListener("click",function(){ lightbox(frame.getAttribute("data-src")); });
        var pv=view.querySelector(".ic-scan-prev"), nx=view.querySelector(".ic-scan-next");
        if(pv) pv.addEventListener("click",function(e){ e.stopPropagation(); if(page>0){ page--; draw("scan"); } });
        if(nx) nx.addEventListener("click",function(e){ e.stopPropagation(); if(page<it.scans.length-1){ page++; draw("scan"); } });
      }
    }
    // ленивая загрузка: рисуем содержимое раздела только при первом открытии <details>
    det.addEventListener("toggle",function(){
      if(det.open && body.getAttribute("data-loaded")==="0"){
        body.setAttribute("data-loaded","1");
        draw(view.getAttribute("data-view"));
      }
    });
    det.querySelectorAll(".ic-ov-b").forEach(function(b){
      b.addEventListener("click",function(){
        det.querySelectorAll(".ic-ov-b").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        draw(b.getAttribute("data-view"));
      });
    });
  }

  /* ---------- «О книге» (book.meta.about) ---------- */
  function renderAbout(book){
    var about = book.meta.about;
    if(!about){ goIndex(book); return; }
    var arr = state.lang==="fr" ? (about.fr && about.fr.length ? about.fr : about.ru)
      : (state.lang==="en" && about.en && about.en.length) ? about.en : (about.ru && about.ru.length ? about.ru : about.fr);
    var note = state.lang==="fr" ? (about.note_fr || about.note_en) : state.lang==="en" ? about.note_en : about.note_ru;
    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-nav">'+
          '<button type="button" class="ic-back">'+t("back")+'</button>'+
          langSwitch()+
        '</div>'+
        '<header class="ic-head"><h1 class="ic-h-fr">'+esc(t("aboutTitle"))+'</h1></header>'+
        (note?'<p class="ic-caption">'+esc(note)+'</p>':"")+
        '<div class="ic-text">'+paraHtml(arr)+'</div>'+
      '</div>';
    bindLangSwitch(root);
    root.querySelector(".ic-back").addEventListener("click",function(){ goIndex(book); });
    toTop(); nudgeRepaint();
  }

  /* ---------- просмотр таблицы целиком (book.json viewer:"plate") ----------
     Основной экран для книг-табличек: гравюра с номерами, вводный текст и
     подпись Гроссона к этой таблице, и компактный список предметов, где
     нажатие раскрывает сведения на месте (без перехода на отдельную страницу).
     opts.focus — id предмета: раскрыть, прокрутить и подсветить на гравюре
     (так адрес вида #/grosson/pl1-3 попадает в нужное место таблицы). */
  function objectDetailHtml(book, it){
    var imgSrc = BASE+"books/"+book.slug+"/img/"+((it.img&&it.img[0])||"");
    var imgHtml = it.img && it.img[0] ? '<img class="ic-obj-img ic-fade-img" src="'+esc(imgSrc)+'" alt="">' : "";
    var fieldsHtml = "";
    if(book.meta.fields){
      Object.keys(book.meta.fields).forEach(function(key){
        var val = fieldVal(it, key);
        if(!val) return;
        var label = book.meta.fields[key][state.lang] || book.meta.fields[key].ru;
        fieldsHtml += '<li><b>'+esc(label)+'</b><span>'+esc(val)+'</span></li>';
      });
    }
    var translArr = textFor(it, book);
    var transl = paraHtml(translArr);
    var showOrig = book.meta.showOriginal !== false;
    var hasScans = showOrig && it.scans && it.scans.length;
    var hasFr = showOrig && !book.meta.frIsTranslation && it.text_fr && it.text_fr.length && !fuOrigIsDup(it, book);
    if(!fieldsHtml && !transl){
      return imgHtml+'<div class="ic-missing"><b>'+t("missing")+'</b></div>';
    }
    return imgHtml+
      (fieldsHtml?'<section class="ic-sec"><h3>'+t("infoSec")+'</h3><ul class="ic-attrs">'+fieldsHtml+'</ul></section>':"")+
      (transl?'<section class="ic-sec"><h3>'+t("translSec")+'</h3><div class="ic-text">'+transl+'</div></section>':"")+
      ((hasScans||hasFr)?renderOriginal(it,book):"");
  }
  function bindObjectDetail(book, it, container){
    var pagesBase = BASE+"books/"+book.slug+"/pages/";
    var showOrig = book.meta.showOriginal !== false;
    if(showOrig && ((it.scans && it.scans.length) || (it.text_fr && it.text_fr.length))) bindOriginal(it, pagesBase, container);
  }
  function highlightHotspot(id){
    root.querySelectorAll(".ic-hotspot").forEach(function(b){ b.classList.toggle("focus", id!=null && b.getAttribute("data-id")===id); });
  }
  function objListHtml(book, objs){
    return '<ul class="ic-objlist">'+objs.map(function(it){
      return '<li class="ic-obj" data-id="'+it.id+'">'+
        '<details class="ic-obj-d">'+
          '<summary class="ic-obj-sum">'+
            '<span class="ic-obj-num">'+esc(it.num||"")+'</span>'+
            '<span class="ic-obj-name">'+esc(titleOf(it))+'</span>'+
            '<span class="ic-obj-dot'+(ready(it,book)?" on":"")+'"></span>'+
          '</summary>'+
          '<div class="ic-obj-body" data-loaded="0"></div>'+
        '</details>'+
      '</li>';
    }).join("")+'</ul>';
  }
  function wireObjList(book, objs){
    root.querySelectorAll(".ic-obj-d").forEach(function(det){
      var li = det.closest(".ic-obj"), id = li.getAttribute("data-id"), it = book.byId[id];
      det.addEventListener("toggle",function(){
        if(det.open){
          var body = det.querySelector(".ic-obj-body");
          if(body.getAttribute("data-loaded")==="0"){
            body.setAttribute("data-loaded","1");
            body.innerHTML = objectDetailHtml(book, it);
            bindObjectDetail(book, it, body);
          }
          highlightHotspot(id);
        } else if(!root.querySelector(".ic-obj-d[open]")){
          highlightHotspot(null);
        }
      });
    });
  }
  // режим «как в книге»: сплошной текст Гроссона для всей таблицы, каждый
  // предмет начинается с кликабельного номера-ссылки, который подсвечивает
  // этот предмет на гравюре (и на телефоне открывает его панель).
  function bookTextHtml(book, objs){
    return objs.map(function(it){
      var arr = textFor(it, book);
      if(!arr || !arr.length) return "";
      var html = paraHtml(arr);
      var marker = '<a href="#" class="ic-numref" data-id="'+it.id+'">'+esc(it.num||"")+'</a> ';
      return html.replace(/^<p>/, "<p>"+marker);
    }).join("");
  }
  function wireBookText(book, objs, container){
    container.querySelectorAll(".ic-numref").forEach(function(a){
      a.addEventListener("click",function(e){
        e.preventDefault();
        var id = a.getAttribute("data-id");
        if(isPhoneWidth()){ openObjectSheet(book, objs, objs.indexOf(book.byId[id])); return; }
        highlightHotspot(id);
        var hs = root.querySelector('.ic-hotspot[data-id="'+id+'"]');
        if(hs) hs.scrollIntoView({block:"center", behavior:"smooth"});
      });
    });
  }
  function openObjectInline(book, id){
    var li = root.querySelector('.ic-obj[data-id="'+id+'"]');
    if(!li) return;
    var det = li.querySelector(".ic-obj-d");
    if(!det.open) det.open = true; else highlightHotspot(id);
    requestAnimationFrame(function(){ li.scrollIntoView({block:"center", behavior:"smooth"}); });
  }
  function isPhoneWidth(){ return window.matchMedia("(max-width: 640px)").matches; }
  // iOS Safari does not reliably stop the page behind a fixed overlay from
  // scrolling under touch with just overflow:hidden; pinning body to the
  // current scroll position is the common, reliable fix. Kept across
  // prev/next navigation inside the sheet (locked once, unlocked on close),
  // so swiping through objects doesn't jump or re-trigger the lock.
  var sheetScrollY = null;
  // openObjectSheet's panel is appended straight to document.body (so it can
  // sit above everything, including body-scroll-lock), which means it is
  // never inside the #iconologie root that route() rewrites on every
  // navigation. Without this, pressing the browser's own Back/Forward (or
  // any other hash change) while a sheet is open left it stuck on screen,
  // stacked on top of whatever route() rendered next underneath it. Tracks
  // the currently-open sheet's own close() so route() can tear it down
  // first; null when no sheet is open.
  var activeSheetClose = null;
  function lockBodyScroll(){
    if(sheetScrollY!=null) return;
    sheetScrollY = window.scrollY;
    document.body.style.position="fixed";
    document.body.style.top=(-sheetScrollY)+"px";
    document.body.style.left="0"; document.body.style.right="0";
    document.documentElement.style.overflow="hidden";
  }
  function unlockBodyScroll(){
    if(sheetScrollY==null) return;
    document.body.style.position=""; document.body.style.top="";
    document.body.style.left=""; document.body.style.right="";
    document.documentElement.style.overflow="";
    window.scrollTo(0, sheetScrollY);
    sheetScrollY = null;
  }
  function openObjectSheet(book, objs, idx){
    var it = objs[idx];
    var d = document.createElement("div");
    d.className = "ic ic-sheet";
    d.innerHTML =
      '<div class="ic-sheet-backdrop"></div>'+
      '<div class="ic-sheet-panel" role="dialog" aria-label="'+esc(titleOf(it))+'">'+
        '<div class="ic-sheet-head">'+
          '<button type="button" class="ic-sheet-prev" aria-label="'+esc(t("prevArticle"))+'"'+(idx===0?" disabled":"")+'>‹</button>'+
          '<span class="ic-sheet-title">'+esc(it.num||"")+'. '+esc(titleOf(it))+'</span>'+
          '<button type="button" class="ic-sheet-next" aria-label="'+esc(t("nextArticle"))+'"'+(idx===objs.length-1?" disabled":"")+'>›</button>'+
          '<button type="button" class="ic-sheet-close" aria-label="'+esc(t("close"))+'">×</button>'+
        '</div>'+
        '<div class="ic-sheet-body"></div>'+
      '</div>';
    document.body.appendChild(d);
    lockBodyScroll();
    var body = d.querySelector(".ic-sheet-body");
    body.insertAdjacentHTML("beforeend", objectDetailHtml(book, it));
    bindObjectDetail(book, it, body);
    highlightHotspot(it.id);
    function remove(){ d.remove(); document.removeEventListener("keydown",onKey); }
    function close(){ remove(); unlockBodyScroll(); highlightHotspot(null); activeSheetClose=null; }
    activeSheetClose = close;
    function onKey(e){ if(e.key==="Escape") close(); }
    function goTo(j){ if(j<0||j>=objs.length) return; remove(); openObjectSheet(book, objs, j); }
    d.querySelector(".ic-sheet-backdrop").addEventListener("click", close);
    d.querySelector(".ic-sheet-close").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    d.querySelector(".ic-sheet-prev").addEventListener("click",function(){ goTo(idx-1); });
    d.querySelector(".ic-sheet-next").addEventListener("click",function(){ goTo(idx+1); });
    var touchStartX=null, panel=d.querySelector(".ic-sheet-panel");
    panel.addEventListener("touchstart",function(e){ touchStartX=e.touches[0].clientX; },{passive:true});
    panel.addEventListener("touchend",function(e){
      if(touchStartX==null) return;
      var dx=e.changedTouches[0].clientX-touchStartX; touchStartX=null;
      if(Math.abs(dx)>60){ if(dx<0) goTo(idx+1); else goTo(idx-1); }
    },{passive:true});
  }
  function renderPlate(book, plateNum, opts){
    var n = String(plateNum);
    var objs = book.items.filter(function(it){ return String(it.plate)===n; });
    if(!objs.length){ goIndex(book); return; }
    var plateImg = objs[0].plate_img;
    var src = BASE+"books/"+book.slug+"/img/"+plateImg;
    var plateMeta = (book.meta.plates||[]).filter(function(p){ return String(p.n)===n; })[0] || {};
    var title = plateMeta["title_"+state.lang] || plateMeta.title_ru || t("plateTitle",{n:n});
    var introArr = plateMeta["intro_"+state.lang] || plateMeta.intro_ru;
    var introHtml = introArr && introArr.length ? '<div class="ic-plate-intro ic-text">'+paraHtml(introArr)+'</div>' : "";
    var cap = plateMeta["caption_"+state.lang] || plateMeta.caption_ru || plateMeta.caption_fr || "";
    var captionHtml = cap ? '<p class="ic-plate-caption">'+esc(cap)+'</p>' : "";
    var hotspots = objs.map(function(it){
      var box = it.bbox || [0,0,10,10];
      var isReady = ready(it, book);
      return '<button type="button" class="ic-hotspot'+(isReady?" on":"")+'" data-id="'+it.id+'" '+
        'style="left:'+box[0]+'%;top:'+box[1]+'%;width:'+box[2]+'%;height:'+box[3]+'%" '+
        'aria-label="'+esc(it.num||"")+'"><span>'+esc(it.num||"")+'</span></button>';
    }).join("");
    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-nav">'+
          '<button type="button" class="ic-back">'+t("back")+'</button>'+
          langSwitch()+
        '</div>'+
        '<header class="ic-head"><h1 class="ic-h-fr">'+esc(title)+'</h1></header>'+
        introHtml+
        '<div class="ic-plate-wrap"><img class="ic-fade-img" src="'+esc(src)+'" alt="">'+hotspots+'</div>'+
        captionHtml+
        '<div class="ic-view-toggle" role="group">'+
          '<button type="button" class="ic-ov-b" data-view="list" aria-pressed="true">'+t("viewList")+'</button>'+
          '<button type="button" class="ic-ov-b" data-view="book" aria-pressed="false">'+t("viewBook")+'</button>'+
        '</div>'+
        '<div class="ic-view-body" data-view="list">'+objListHtml(book, objs)+'</div>'+
      '</div>';
    bindLangSwitch(root);
    root.querySelector(".ic-back").addEventListener("click",function(){ goIndex(book); });
    wireObjList(book, objs);
    var viewBody = root.querySelector(".ic-view-body");
    root.querySelectorAll(".ic-view-toggle .ic-ov-b").forEach(function(b){
      b.addEventListener("click",function(){
        root.querySelectorAll(".ic-view-toggle .ic-ov-b").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        var v = b.getAttribute("data-view");
        viewBody.setAttribute("data-view", v);
        if(v==="book"){
          viewBody.innerHTML = '<div class="ic-text ic-book-text">'+bookTextHtml(book, objs)+'</div>';
          wireBookText(book, objs, viewBody);
        } else {
          viewBody.innerHTML = objListHtml(book, objs);
          wireObjList(book, objs);
        }
      });
    });
    root.querySelectorAll(".ic-hotspot").forEach(function(b){
      b.addEventListener("click",function(){
        var id = b.getAttribute("data-id");
        if(isPhoneWidth()) openObjectSheet(book, objs, objs.indexOf(book.byId[id]));
        else openObjectInline(book, id);
      });
    });
    if(opts && opts.focus){
      if(isPhoneWidth()) openObjectSheet(book, objs, objs.indexOf(book.byId[opts.focus]));
      else openObjectInline(book, opts.focus);
    } else {
      toTop();
    }
    nudgeRepaint();
  }

  function lightbox(src){
    var d=document.createElement("div"); d.className="ic ic-lb"; d.setAttribute("role","dialog"); d.setAttribute("aria-label",t("lbAlt"));
    d.innerHTML='<img src="'+esc(src)+'" alt=""><button type="button" aria-label="'+esc(t("close"))+'">×</button>';
    function close(){ d.remove(); document.removeEventListener("keydown",onKey); document.documentElement.style.overflow=""; }
    function onKey(e){ if(e.key==="Escape") close(); }
    d.addEventListener("click",close); document.addEventListener("keydown",onKey);
    document.documentElement.style.overflow="hidden";
    document.body.appendChild(d); d.querySelector("button").focus();
  }

  // стрелки клавиатуры в карточке
  document.addEventListener("keydown",function(e){
    if(!/^#\/.*[a-z0-9]-/i.test(location.hash) || document.querySelector(".ic-lb")) return;
    if(e.target.matches && e.target.matches("input,textarea,select")) return;
    var pagerBtns = root.querySelectorAll(".ic-pager button[data-go]");
    var b = e.key==="ArrowLeft" ? pagerBtns[0] : e.key==="ArrowRight" ? pagerBtns[1] : null;
    if(b && !b.disabled) b.click();
  });
})();
