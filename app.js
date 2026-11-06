/* Библиотека: указатель книг и карточки статей.
   Реестр книг: library.json. Каждая книга: books/<slug>/book.json + entries.json,
   гравюры: books/<slug>/img/, сканы страниц: books/<slug>/pages/. */
(function(){
  // Бампать при каждой правке app.css (и, по желанию, когда меняется логика
  // в app.js, завязанная на новую разметку), чтобы браузеры и CDN не отдавали
  // старую закэшированную копию стилей после деплоя.
  var APP_VER = "109";
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
    libSub:       {ru:"Старые книги об образах и древностях, с переводом на русский, английский и французский.",
                    en:"Old books on allegory and antiquities, translated into Russian, English and French.",
                    fr:"D'anciens livres sur les emblèmes et les antiquités, traduits en russe, en anglais et en français."},
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
    viewBook:     {ru:"Как в книге", en:"As printed", fr:"Comme imprimé"},
    readInChapter:{ru:"Читать в главе →", en:"Read in the chapter →", fr:"Lire dans le chapitre →"},
    chApprox:     {ru:"Границы фрагмента определены приблизительно — полный текст в главе.", en:"The excerpt boundaries are approximate — see the chapter for the full text.", fr:"Les limites de l'extrait sont approximatives — le texte complet est dans le chapitre."},
    chRuOnly:     {ru:"", en:"The chapter text is available in Russian only.", fr:"Le texte du chapitre n'existe qu'en russe."},
    chEnPrep:     {ru:"Английский перевод готовится. Ниже — итальянский текст издания 1626 года.", en:"English translation in preparation. Below is the Italian text of the 1626 edition.", fr:"Traduction anglaise en préparation. Ci-dessous : le texte italien de l'édition de 1626."},
    chEnSoon:     {ru:"Английский перевод готовится.", en:"English translation in preparation.", fr:"Traduction anglaise en préparation."},
    chNotYet:     {ru:"Перевод этой главы ещё не добавлен на сайт.", en:"This chapter has not been added to the site yet.", fr:"Ce chapitre n'a pas encore été ajouté au site."},
    chNext:       {ru:"Следующая глава", en:"Next chapter", fr:"Chapitre suivant"},
    chPrev:       {ru:"Предыдущая глава", en:"Previous chapter", fr:"Chapitre précédent"},
    chToc:        {ru:"Главы", en:"Chapters", fr:"Chapitres"},
    contents:     {ru:"Содержание", en:"Contents", fr:"Sommaire"},
    qmLabel:      {ru:"Пояснение к неясному месту", en:"Note on an unclear passage", fr:"Note sur un passage obscur"},
    qmDefault:    {ru:"Место в оригинале неясно, переведено по смыслу.", en:"The passage is unclear in the original; translated by sense.", fr:"Le passage est obscur dans l'original ; traduit selon le sens."},
    hmRead:       {ru:"Читать книгу", en:"Read the book", fr:"Lire le livre"},
    hmReadSub:    {ru:"Содержание по частям", en:"Contents by part", fr:"Sommaire par partie"},
    hmGallery:    {ru:"Гравюры", en:"Engravings", fr:"Gravures"},
    hmGallerySub: {ru:"Все иллюстрации книги: {n}", en:"All the illustrations: {n}", fr:"Toutes les illustrations : {n}"},
    hmSearch:     {ru:"Поиск", en:"Search", fr:"Recherche"},
    hmSearchSub:  {ru:"По переводу, итальянскому тексту, гравюрам, именам и указателю", en:"Across the translation, the Italian text, engravings, names and index", fr:"Dans la traduction, le texte italien, les gravures, les noms et l’index"},
    hmIndex:      {ru:"Указатель", en:"Index", fr:"Index"},
    hmIndexSub:   {ru:"Предметы и имена по страницам издания 1626\u00a0года", en:"Subjects and names, by the pages of the 1626 edition", fr:"Sujets et noms, par pages de l’édition de 1626"},
    tvSub:        {ru:"Tavola delle cose notabili — указатель издания 1626 года. Цифры — страницы этого издания; ссылка открывает соответствующее место в переводе (в перевод не внесена разбивка на страницы, поэтому место определено с точностью до абзаца).", en:"Tavola delle cose notabili — the index of the 1626 edition. The numbers are pages of that edition; a link opens the matching place in the translation (the translation has no page breaks, so the place is accurate to the paragraph).", fr:"Tavola delle cose notabili — l’index de l’édition de 1626. Les chiffres sont les pages de cette édition ; le lien ouvre l’endroit correspondant de la traduction (au paragraphe près)."},
    tvSearchPh:   {ru:"Найти в указателе: имя, предмет…", en:"Search the index: name, subject…", fr:"Chercher dans l’index : nom, sujet…"},
    tvBack:       {ru:"К книге", en:"To the book", fr:"Au livre"},
    tvSortRu:     {ru:"По-русски", en:"Russian order", fr:"Ordre russe"},
    tvSortIt:     {ru:"По-итальянски", en:"Italian order", fr:"Ordre italien"},
    tvLetters:    {ru:"Буквы указателя", en:"Index letters", fr:"Lettres de l’index"},
    tvFound:      {ru:"Найдено статей: {n}", en:"Entries found: {n}", fr:"Articles trouvés : {n}"},
    tvAll:        {ru:"Статей: {n}", en:"Entries: {n}", fr:"Articles : {n}"},
    tvNone:       {ru:"Ничего не найдено.", en:"Nothing found.", fr:"Rien trouvé."},
    tvSee:        {ru:"см.", en:"see", fr:"voir"},
    tvPage:       {ru:"с.", en:"p.", fr:"p."},
    svScan:       {ru:"Скан", en:"Scan", fr:"Scan"},
    svIt:         {ru:"Итальянский текст", en:"Italian text", fr:"Texte italien"},
    svOpen:       {ru:"Открыть скан страницы {p} издания 1626 года", en:"Open the scan of page {p} of the 1626 edition", fr:"Ouvrir le scan de la page {p} de l’édition de 1626"},
    svTitle:      {ru:"тит.", en:"title", fr:"titre"},
    svDedic:      {ru:"посв.", en:"ded.", fr:"dédic."},
    svDlg:        {ru:"Оригинал 1626 года", en:"Original of 1626", fr:"Original de 1626"},
    svPrev:       {ru:"Предыдущая страница", en:"Previous page", fr:"Page précédente"},
    svNext:       {ru:"Следующая страница", en:"Next page", fr:"Page suivante"},
    svNoText:     {ru:"Текста на этой странице нет.", en:"No text on this page.", fr:"Pas de texte sur cette page."},
    tvOpen:       {ru:"Открыть место в переводе", en:"Open the place in the translation", fr:"Ouvrir l’endroit dans la traduction"},
    hmNames:      {ru:"Имена", en:"Names", fr:"Noms"},
    hmNamesSub:   {ru:"Боги, герои, авторы, места и народы", en:"Gods, heroes, authors, places and peoples", fr:"Dieux, héros, auteurs, lieux et peuples"},
    nmSub:        {ru:"Имена из глоссария перевода. Карточка имени показывает гравюры, где оно названо, и все места перевода, где оно встречается, во всех падежах.", en:"Names from the translation glossary. A name’s page shows the engravings that name it and every place in the translation where it occurs, in any case form.", fr:"Noms du glossaire de la traduction. La fiche d’un nom montre les gravures qui le citent et tous les passages de la traduction où il apparaît, à tous les cas."},
    nmSearchPh:   {ru:"Найти имя: русское или итальянское…", en:"Find a name: Russian or Italian…", fr:"Chercher un nom : russe ou italien…"},
    nmTypeLabel:  {ru:"Тип имени", en:"Name type", fr:"Type de nom"},
    nmAll:        {ru:"Все", en:"All", fr:"Tous"},
    nmT_g:        {ru:"Божества", en:"Deities", fr:"Divinités"},
    nmT_c:        {ru:"Персонажи", en:"Characters", fr:"Personnages"},
    nmT_a:        {ru:"Авторы", en:"Authors", fr:"Auteurs"},
    nmT_p:        {ru:"Места", en:"Places", fr:"Lieux"},
    nmT_n:        {ru:"Народы", en:"Peoples", fr:"Peuples"},
    nmT1_g:       {ru:"божество", en:"deity", fr:"divinité"},
    nmT1_c:       {ru:"персонаж", en:"character", fr:"personnage"},
    nmT1_a:       {ru:"автор", en:"author", fr:"auteur"},
    nmT1_p:       {ru:"место", en:"place", fr:"lieu"},
    nmT1_n:       {ru:"народ", en:"people", fr:"peuple"},
    nmFound:      {ru:"Найдено имён: {n}", en:"Names found: {n}", fr:"Noms trouvés : {n}"},
    nmTotal:      {ru:"Имён: {n}", en:"Names: {n}", fr:"Noms : {n}"},
    nmPlates:     {ru:"Гравюры", en:"Engravings", fr:"Gravures"},
    nmMentions:   {ru:"Упоминания", en:"Mentions", fr:"Mentions"},
    nmStat:       {ru:"Абзацев с упоминанием: {n}, глав: {c}", en:"Passages mentioning it: {n}, chapters: {c}", fr:"Passages qui le citent : {n}, chapitres : {c}"},
    nmNoMentions: {ru:"В тексте перевода имя не встречается; оно названо только на гравюрах.", en:"The name does not occur in the text of the translation; it is named only on the engravings.", fr:"Le nom n’apparaît pas dans le texte de la traduction ; il n’est cité que sur les gravures."},
    hmSoon:       {ru:"скоро", en:"soon", fr:"bientôt"},
    plRead:       {ru:"Читать в главе", en:"Read in the chapter", fr:"Lire dans le chapitre"},
    plExplH:      {ru:"Что пишет Картари", en:"What Cartari writes", fr:"Ce qu’écrit Cartari"},
    plNoExpl:     {ru:"В тексте нет отдельного описания этой гравюры.", en:"The text has no separate description of this engraving.", fr:"Le texte ne décrit pas cette gravure à part."},
    plTitlePage:  {ru:"второй титульный лист", en:"second title page", fr:"second titre"},
    plAll:        {ru:"Все гравюры", en:"All engravings", fr:"Toutes les gravures"},
    plPrev:       {ru:"Предыдущая гравюра", en:"Previous engraving", fr:"Gravure précédente"},
    plNext:       {ru:"Следующая гравюра", en:"Next engraving", fr:"Gravure suivante"},
    plCount:      {ru:"Гравюра {k} из {n}", en:"Engraving {k} of {n}", fr:"Gravure {k} sur {n}"},
    plBetween:    {ru:"между с. {a} и {b}", en:"between pp. {a} and {b}", fr:"entre p. {a} et {b}"},
    plNoCap:      {ru:"У этой гравюры нет подписи в переводе.", en:"This engraving has no caption in the translation.", fr:"Cette gravure n’a pas de légende dans la traduction."},
    plEdition:    {ru:"издание\u00a01626", en:"1626\u00a0edition", fr:"édition\u00a0de\u00a01626"},
    plZoomLabel:  {ru:"Гравюра на весь экран", en:"Engraving, full screen", fr:"Gravure en plein écran"},
    srHint:       {ru:"Введите слово или имя: ищем в русском переводе, в итальянском тексте издания, в подписях гравюр, среди имён и в указателе. Можно писать и «Фортуна», и «Fortuna».", en:"Type a word or a name: we search the Russian translation, the Italian text of the edition, engraving captions, names and the index. «Fortuna» and «Фортуна» both work.", fr:"Saisissez un mot ou un nom : nous cherchons dans la traduction russe, le texte italien de l’édition, les légendes des gravures, les noms et l’index. « Fortuna » et « Фортуна » fonctionnent."},
    srLoading:    {ru:"Загружаю тексты…", en:"Loading the texts…", fr:"Chargement des textes…"},
    srNone:       {ru:"Ничего не найдено. Попробуйте другую форму слова или старое написание, например «Lanuuio» вместо «Lanuvio».", en:"Nothing found. Try another form of the word or an old spelling, e.g. «Lanuuio» for «Lanuvio».", fr:"Rien trouvé. Essayez une autre forme du mot ou une ancienne graphie, par exemple « Lanuuio » pour « Lanuvio »."},
    srText:       {ru:"В тексте", en:"In the text", fr:"Dans le texte"},
    srMore:       {ru:"Показать ещё {n}", en:"Show {n} more", fr:"Afficher {n} de plus"},
    srItOrig:     {ru:"итальянский текст", en:"Italian text", fr:"texte italien"},
    srPlace:      {ru:"Поиск по книге", en:"Search the book", fr:"Recherche dans le livre"},
    hmNavLabel:   {ru:"Разделы книги", en:"Book sections", fr:"Sections du livre"},
    hmCloseToc:   {ru:"Закрыть содержание", en:"Close contents", fr:"Fermer le sommaire"}
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
  // Bumped on every route() dispatch (every navigation). toTop()'s snap()
  // can be deferred an arbitrary amount — it's re-run from an image's "load"
  // event, and route() swaps root.innerHTML long before a big, un-sized
  // plate/figure image actually finishes downloading. If the visitor
  // navigates on (Back, a different plate, next/prev) before that image
  // loads, the stale listener still fires later, against the SAME shared
  // `root` element — now showing a completely different page — and both
  // reads its layout (wrong target) and calls scrollTo against it. That is
  // what was observed as "scroll back doesn't restore" (the real restore
  // lands fine, then a late stale snap() yanks it back toward the top a
  // moment later) and as the overlapping/doubled header screenshots (the
  // jump lands mid-repaint of the new page, while its own fade-in images are
  // still settling). Every deferred scroll adjustment below captures the
  // generation it belongs to and is a no-op once a newer navigation has
  // moved the counter on.
  var renderGen = 0;

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
  // dropHtml/dividerPick are only used by renderCard: dropHtml replaces the
  // visible first letter of the very first paragraph with a dropcap ornament
  // (the letter itself stays in the markup, visually hidden, so copy/paste
  // and screen readers still get plain text). dividerPick(idx) is called for
  // each "§" subhead encountered, in order, and may return a divider ornament
  // to print above that subhead.
  function paraHtml(arr, dropHtml, dividerPick){
    var usedDrop = false, subheadIdx = 0;
    return (arr||[]).map(function(p){
      var s = String(p||"");
      if(s.charAt(0)==="§"){
        var divider = dividerPick ? dividerPick(subheadIdx++) : "";
        return divider+"<h3 class=\"ic-subhead\">"+esc(s.slice(1))+"</h3>";
      }
      var parts = s.split("¶"), html = "";
      if(parts[0]){
        // The dropcap stands in for the first LETTER, not the first
        // character — an opening “quote mark often precedes it, and that
        // has to stay visible in front of the cap rather than get hidden
        // along with the letter it's replacing.
        var letterMatch = dropHtml && !usedDrop ? parts[0].match(/[A-Za-z]/) : null;
        if(letterMatch){
          usedDrop = true;
          var idx = letterMatch.index;
          // Any lead punctuation (an opening quote mark, most often) is kept
          // in the text but hidden along with the letter the cap stands in
          // for — floating it out in front of the cap visually, as its own
          // DOM position would, reads as a stray character next to the cap
          // rather than part of the word it belongs to.
          var lead = parts[0].slice(0, idx), letter = parts[0].charAt(idx), rest = parts[0].slice(idx+1);
          html += '<p class="ic-dropcap-p">'+dropHtml+'<span class="ic-dropcap-letter">'+esc(lead)+esc(letter)+"</span>"+esc(rest)+"</p>";
        } else {
          html += "<p>"+esc(parts[0])+"</p>";
        }
      }
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
    fetch(BASE+"books/"+slug+"/book.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(meta){
        var ornCfg = meta.ornaments;
        var ornSlug = (ornCfg && ornCfg.enabled) ? (ornCfg.source || slug) : null;
        return Promise.all([
          Promise.resolve(meta),
          fetch(BASE+"books/"+slug+"/entries.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }),
          ornSlug ? fetch(BASE+"books/"+ornSlug+"/ornaments.json",{cache:"no-cache"})
              .then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; })
            : Promise.resolve(null),
          ornSlug ? Promise.all([
              fetch(BASE+"books/"+ornSlug+"/engravings.json",{cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; }),
              fetch(BASE+"books/"+ornSlug+"/engraving_map.json",{cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; })
            ]) : Promise.resolve(null)
        ]);
      }).then(function(res){
      var meta = res[0], data = res[1], ornList = res[2], engRes = res[3];
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
      var ornSlug = meta.ornaments && meta.ornaments.source || slug;
      var book = {slug:slug, meta:meta, items:items, byId:byId,
        ornaments:groupOrnaments(ornList, ornSlug),
        engravings:groupEngravings(engRes, ornSlug)};
      books[slug] = book;
      cb(book);
    }).catch(function(){
      books[slug] = "error";
      root.innerHTML = '<div class="ic-wrap"><p class="ic-empty">'+t("bookError")+'</p><button type="button" class="ic-back ic-to-lib">'+t("toLibrary")+'</button></div>';
      var b = root.querySelector(".ic-to-lib"); if(b) b.addEventListener("click",function(){ location.hash=""; });
      cb(null);
    });
  }

  /* ---------- украшения (заставки/концовки/буквицы/разделители) ----------
     book.meta.ornaments = {enabled, source} selects which book's ornaments.json
     to use (its own, or another book's) — groupOrnaments() sorts the flat list
     from that file into buckets this module reads from. Each article gets one
     headpiece/tailpiece/divider picked deterministically from its id, so the
     set alternates across articles but a given article always shows the same
     one; a dropcap is used only when the article's first letter (of whichever
     language is on screen) has a cut capital for it. */
  function groupOrnaments(list, srcSlug){
    if(!list || !list.length) return null;
    var g = {srcSlug:srcSlug, headpiece:[], tailpiece:[], divider:[], dropcap:{}};
    list.forEach(function(o){
      if(o.type==="dropcap"){
        if(!o.letter) return;
        (g.dropcap[o.letter] = g.dropcap[o.letter] || []).push(o);
      } else if(g[o.type]){
        g[o.type].push(o);
      }
    });
    return g;
  }
  // engRes is [engravings.json list, engraving_map.json {articleId: file}]
  // from openBook, or null when ornaments aren't enabled for this book.
  // Indexed by filename so renderCard can go straight from an article id to
  // the cut engraving's display file (WebP).
  function groupEngravings(engRes, srcSlug){
    if(!engRes) return null;
    var list = engRes[0] || [], map = engRes[1] || {};
    var byFile = {};
    list.forEach(function(e){ byFile[e.file] = e; });
    return {srcSlug:srcSlug, map:map, byFile:byFile};
  }
  function engravingFor(book, it){
    var eng = book.engravings;
    if(!eng) return null;
    var file = eng.map[it.id];
    var rec = file && eng.byFile[file];
    if(!rec) return null;
    var base = BASE+"books/"+eng.srcSlug+"/engravings/";
    return {display: base+rec.display};
  }
  function strHash(s){
    var h = 5381;
    for(var i=0;i<s.length;i++) h = ((h<<5)+h+s.charCodeAt(i))|0;
    return h>>>0;
  }
  function pickOrnament(list, seed){
    if(!list || !list.length) return null;
    return list[strHash(seed) % list.length];
  }
  // The cut SVGs vary in trace fidelity -- a shape's "clean" heuristic at
  // cut time (path count, file size) doesn't guarantee it visually reads
  // right (an intricate engraved design can trace into many tiny correct-
  // but-illegible fragments). The PNG is always faithful to the verified
  // alpha mask, so it's the rendering default; SVG is kept as a bonus
  // deliverable, not wired into the page.
  function ornSrc(book, rec){
    return BASE+"books/"+book.ornaments.srcSlug+"/ornaments/"+rec.file;
  }
  // mask-image div: the cut PNG/SVG is ink-on-transparent, so using it as a
  // CSS mask (not a plain <img>) lets the ornament pick up the reader's own
  // text/accent color via background-color instead of a baked-in ink color —
  // "in the color of the text or a muted accent, no sepia" per the brief.
  function ornamentMaskHtml(book, rec, cls){
    var src = ornSrc(book, rec);
    var ratio = (rec.width && rec.height) ? (rec.width/rec.height) : 3;
    return '<span class="ic-orn '+cls+'" aria-hidden="true" style="--orn-src:url(\''+esc(src)+'\');--orn-ratio:'+ratio+'"></span>';
  }
  function headpieceHtml(book, it){
    if(!book.ornaments) return "";
    var rec = pickOrnament(book.ornaments.headpiece, it.id+"|head");
    return rec ? ornamentMaskHtml(book, rec, "ic-orn-headpiece") : "";
  }
  function tailpieceHtml(book, it){
    if(!book.ornaments) return "";
    var rec = pickOrnament(book.ornaments.tailpiece, it.id+"|tail");
    return rec ? ornamentMaskHtml(book, rec, "ic-orn-tailpiece") : "";
  }
  function dividerHtml(book, it, idx){
    if(!book.ornaments) return "";
    var rec = pickOrnament(book.ornaments.divider, it.id+"|div|"+idx);
    return rec ? ornamentMaskHtml(book, rec, "ic-orn-divider") : "";
  }
  // First letter of the text actually on screen (whichever language), stripped
  // of accents; only Latin letters can match, since the cut dropcaps are the
  // book's own Latin capitals — Cyrillic text falls through to a plain first
  // letter, same as a book with no dropcap at all.
  function firstLetterFor(text){
    var s = String(text||"").normalize("NFD").replace(/[̀-ͯ]/g,"");
    var m = s.match(/[A-Za-z]/);
    return m ? m[0].toUpperCase() : null;
  }
  function dropcapFor(book, it, firstPara){
    if(!book.ornaments) return null;
    var letter = firstLetterFor(firstPara);
    if(!letter) return null;
    var list = book.ornaments.dropcap[letter];
    if(!list || !list.length) return null;
    var rec = pickOrnament(list, it.id+"|dc|"+letter);
    return rec ? ornamentMaskHtml(book, rec, "ic-dropcap") : null;
  }

  /* ---------- маршрутизация ---------- */
  // Форматы адреса: "#/<slug>/<id>" — карточка; "#/<slug>" — указатель книги;
  // "#/<slug>/about" — страница «О книге»; "#/<slug>/find" — указатель карточек книги с главной (там "#/<slug>" ведёт на главную); "#/<slug>/home[/gallery|search]" — главная книги (book.json home); "#/<slug>/ch/<глава>[/<блок>]" — глава
  // русского перевода (только книги с book.json chapters); "#/<slug>/plate/<n>" — просмотр таблицы
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
    if(rest[0]==="home") return {slug:slug, view:"home", tab:rest[1]};
    if(rest[0]==="find") return {slug:slug, view:"find"};
    if(rest[0]==="index") return {slug:slug, view:"tavola"};
    if(rest[0]==="names") return {slug:slug, view:"names", name:rest[1]};
    if(rest[0]==="plate" && rest[1]) return {slug:slug, view:"plate", plateNum:rest[1]};
    if(rest[0]==="ch" && rest[1]) return {slug:slug, view:"chapter", chapter:rest[1], block:rest[2], page:rest[3]};
    return {slug:slug, id:rest[0]};
  }

  // Адреса старых карточек книги с главной: глава перевода, к которой привязана карточка (chapter_links.tsv),
  // либо адрес из book.json legacyRedirect, иначе главная.
  function legacyHref(book, id){
    var rd = book.meta.legacyRedirect && book.meta.legacyRedirect[id], chap = book.chap, lk = chap && chap.links[id];
    if(rd) return hrefFor(book, rd);
    if(lk && chap.bySlug[lk.chapter]) return chapterHref(book, lk.chapter, lk.block);
    return hrefFor(book, "home");
  }

  function route(){
    renderGen++;
    if(activeSheetClose){ activeSheetClose(); }
    if(sv) sv.close();
    var p = parseHash(), gen = renderGen;
    if(!p.slug){ renderLibraryHome(); return; }
    openBook(p.slug, function(book){
      if(!book){ if(!forcedBook) renderLibraryHome(); return; }
      var isPlateBook = book.meta.viewer==="plate";
      var hasHome = !!(book.meta.home && book.meta.chapters);
      if(hasHome && !p.id && !p.view){ location.replace(hrefFor(book, "home")); return; }
      if(hasHome && p.view==="find"){ location.replace(hrefFor(book, "home/search")); return; }
      if(hasHome && p.id && book.chap===undefined){ loadChapters(book, function(){ if(gen===renderGen) route(); }); return; }
      if(hasHome && p.id && book.chap && book.chap.pl.byOld[p.id]){ location.replace(hrefFor(book, "plate/"+book.chap.pl.byOld[p.id])); return; }
      if(hasHome && p.id){ location.replace(legacyHref(book, p.id)); return; }
      if(p.view==="home" && book.meta.home) renderHome(book, p.tab);
      else if(p.view==="chapter" && book.meta.chapters) renderChapter(book, p.chapter, p.block, p.page);
      else if(p.view==="tavola" && book.meta.tavola) renderTavola(book);
      else if(p.view==="names" && book.meta.names) renderNames(book, p.name);
      else if(p.id && book.byId[p.id] && book.meta.chapters && state.lang==="ru" && book.chap===undefined)
        loadChapters(book, function(){ if(gen===renderGen) renderCard(book, book.byId[p.id]); });
      else if(p.view==="about") renderAbout(book);
      else if(p.view==="plate" && book.meta.home && book.meta.chapters) renderPlateCard(book, p.plateNum);
      else if(p.view==="plate") renderPlate(book, p.plateNum);
      else if(p.view==="find") renderIndex(book);
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
  function goIndex(book){
    if(book.meta.home && book.meta.chapters) location.hash = hrefFor(book, "home/search");
    else location.hash = forcedBook ? "" : "#/"+book.slug;
  }
  function hrefFor(book, suffix){ return forcedBook ? "#/"+suffix : "#/"+book.slug+"/"+suffix; }
  function toTop(noImgSnap){
    // The standalone page's back-bar is sticky over the top of the viewport
    // (root.dataset.top, e.g. "52px"). Snapping root's top to 0 would land
    // the new article's first row — the "Back to index" button — right
    // under that bar instead of below it, so the target is offset by the
    // bar's own height, not the bare top of the viewport.
    var headerOffset = parseFloat(root.dataset.top) || 0;
    // Pin to the navigation this toTop() call belongs to — see renderGen's
    // comment above. snap() can still be invoked long after the visitor has
    // moved on (from a slow image's "load" event), and by then root holds a
    // different page entirely; without this guard snap() would measure and
    // scroll that unrelated page instead of doing nothing.
    var gen = renderGen;
    function snap(){
      if(gen !== renderGen) return;
      var r=root.getBoundingClientRect(); if(r.top<headerOffset) window.scrollTo(0, window.scrollY+r.top-headerOffset);
    }
    snap();
    // The big plate/figure images have no explicit width/height, so the page
    // grows once each one finishes loading. The browser's own scroll
    // anchoring then nudges the scroll position to compensate for that shift
    // — which is what was occasionally leaving an article open mid-page
    // instead of at the top. Re-snap after each image loads to undo that.
    // noImgSnap: в длинной главе картинки подгружаются лениво уже при прокрутке, и
    // повторный snap() на их load возвращал страницу в начало.
    if(noImgSnap) return;
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

  /* ---------- шапка книги: заголовок + сворачиваемые сведения ----------
     Заголовок книги (в отличие от статьи) сознательно остаётся без всяких
     украшений по бокам — только название и стрелка, раскрывающая сведения
     о книге (автор/год/место, подзаголовок) на месте, без перехода на
     отдельную страницу. Анимация — через grid-template-rows (0fr -> 1fr),
     единственный способ плавно анимировать auto-высоту без измерения её в
     JS; prefers-reduced-motion отключает её в CSS (app.css), не здесь. */
  function bookHeaderHtml(book){
    var infoId = "ic-book-info-"+book.slug;
    var metaLine = book.meta.author
      ? esc(book.meta.author)+(book.meta.year?", "+esc(book.meta.place?book.meta.place+" ":"")+book.meta.year:"")
      : "";
    return '<div class="ic-top-row">'+(forcedBook?"":'<button type="button" class="ic-to-lib-link ic-back">'+t("toLibrary")+'</button>')+langSwitch()+'</div>'+
      '<div class="ic-book-head">'+
        '<h1 class="ic-title">'+esc(bt(book.meta.title))+'</h1>'+
        '<button type="button" class="ic-info-toggle" aria-expanded="false" aria-controls="'+infoId+'">'+
          '<span>'+esc(t("moreInfo"))+'</span>'+
          '<svg class="ic-info-arrow" viewBox="0 0 16 16" aria-hidden="true" width="12" height="12"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '</button>'+
        '<div class="ic-book-info" id="'+infoId+'"><div class="ic-book-info-in">'+
          (metaLine?'<p class="ic-book-meta">'+metaLine+'</p>':"")+
          '<p class="ic-sub">'+esc(bt(book.meta.subtitle))+'</p>'+
        '</div></div>'+
      '</div>';
  }
  function bindBookHeader(container){
    var btn = container.querySelector(".ic-info-toggle");
    if(!btn) return;
    var panel = container.querySelector(".ic-book-info");
    btn.addEventListener("click",function(){
      var open = btn.getAttribute("aria-expanded")==="true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("open", !open);
    });
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
          return '<li class="ic-book-card" tabindex="0" role="link" data-slug="'+esc(b.slug)+'"'+(m.home && m.chapters ? ' data-home="1"' : "")+'>'+
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
            location.hash = "#/"+c.getAttribute("data-slug")+(c.hasAttribute("data-home") ? "/home" : "");
          });
          c.addEventListener("keydown",function(e){
            if((e.key==="Enter"||e.key===" ") && !e.target.closest(".ic-book-more")){ e.preventDefault(); location.hash = "#/"+c.getAttribute("data-slug")+(c.hasAttribute("data-home") ? "/home" : ""); }
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
      if(!nq) return true;
      var k = it.key, ck = chapKey(book, it);
      if(ck) k += " "+ck;
      return nq.split(/\s+/).every(function(w){ return k.indexOf(w)>-1; });
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
        bookHeaderHtml(book)+
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
    bindBookHeader(root);
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
    if(state.lang==="ru" && book.meta.chapters && book.chap===undefined){
      var cgen = renderGen;
      loadChapters(book, function(){ if(cgen===renderGen && state.q.trim()) fill(book); });
    }
    if(state.scroll){ var y=state.scroll, gen=renderGen; state.scroll=0; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
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
          // Collapsible <details> suits books with long chapters (many items
          // per group, worth hiding until opened). Books whose groups are
          // just short alphabetical labels (e.g. Iconologia's letter
          // headings) read better fully expanded, as they did before
          // collapsing was introduced — book.meta.flatGroups opts a book
          // out of the <details> wrapper back to a plain, always-open
          // <section>, while keeping the same grouped headings.
          if(book.meta.flatGroups){
            html+='<section class="ic-group"><h2><span class="ic-gcap">'+esc(groupOf(it))+'</span>'+(it.group_fr?'<span class="ic-gfr">'+esc(it.group_fr)+'</span>':"")+
              (it.group_page?'<span class="ic-gpg">'+esc(t("pageAbbr"))+' '+esc(it.group_page)+'</span>':"")+
              '</h2><ul>';
            openTag="section";
          } else {
            html+='<details class="ic-group"><summary><h2><span class="ic-gcap">'+esc(groupOf(it))+'</span>'+(it.group_fr?'<span class="ic-gfr">'+esc(it.group_fr)+'</span>':"")+
              (it.group_page?'<span class="ic-gpg">'+esc(t("pageAbbr"))+' '+esc(it.group_page)+'</span>':"")+
              '<span class="ic-gn">'+esc(t("groupItems",{n:groupCounts[gk]}))+'</span></h2></summary><ul>';
            openTag="details";
          }
          grp=gk; open=true;
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
        bookHeaderHtml(book)+
        '<div class="ic-controls">'+
          '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("searchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("searchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
          '<p class="ic-count"></p>'+
        '</div>'+
        '<ul class="ic-plate-ul"></ul>'+
        '<div class="ic-list"></div>'+
      '</div>';
    bindLangSwitch(root);
    bindBookHeader(root);
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
    if(state.scroll){ var y=state.scroll, gen=renderGen; state.scroll=0; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
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
    var pagesBase = BASE+"books/"+book.slug+"/"+(book.meta.pagesDir || "pages/");
    // A cut engraving (books/<slug>/engravings/, matched to this article by
    // printed page) replaces the old page-scan figure when there is one:
    // the "_display.webp" file (real transparency: paper clear, line opaque)
    // is shown; a click opens the same WebP full screen. The full-size raw
    // JPG crops are not kept in the repository (see ALGORITHM.md); the frame
    // is exactly the crops.json frame, see ALGORITHM.md's standing rule
    // against auto-cropping the plate further.
    var eng = it.textOnly ? null : engravingFor(book, it);
    var imgs = eng
      ? '<figure class="ic-fig ic-fig-eng" data-src="'+esc(eng.display)+'"><img class="ic-fade-img ic-eng-display" loading="lazy" src="'+esc(eng.display)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'"></figure>'
      : (it.textOnly ? [] : (it.img||[])).map(function(src,k){
          // Iconologie: рядом с каждой картинкой <имя>.webp лежит <имя>_display.webp (бумага прозрачна,
          // тушь почти чёрная, мягкий край запечён в файл, как у Картари); показываем его,
          // по клику открывается полная картинка (<имя>.webp).
          if(book.slug==="iconologie" && /\.(jpe?g|webp)$/i.test(src)){
            var disp = imgBase+src.replace(/\.(jpe?g|webp)$/i,"_display.webp");
            return '<figure class="ic-fig ic-fig-eng" data-src="'+esc(imgBase+src)+'"><img class="ic-fade-img ic-eng-display" loading="lazy" src="'+esc(disp)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'">'+
              (it.img.length>1?'<figcaption>'+t("figOf",{k:k+1,n:it.img.length})+'</figcaption>':"")+'</figure>';
          }
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
    var headHtml = headpieceHtml(book, it);
    var tailHtml = tailpieceHtml(book, it);
    var dropHtml = translArr && translArr.length ? dropcapFor(book, it, translArr[0]) : null;
    var transl=paraHtml(translArr, dropHtml, function(idx){ return dividerHtml(book, it, idx); });
    var chEx = chapterExcerpt(book, it);
    if(chEx) transl = chEx.html;
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
        headHtml+
        '<header class="ic-head">'+
          '<p class="ic-kicker">'+(it.num?it.num+". ":"")+esc(it.group_fr?groupOf(it):(book.meta.parts&&book.meta.parts.length>1?partLabel(book,it.part):""))+'</p>'+
          '<h1 class="ic-h-fr">'+esc(it.fr)+'</h1>'+
          (titleOf(it)!==it.fr?'<p class="ic-h-ru">'+esc(titleOf(it))+'</p>':"")+
        '</header>'+
        (imgs?'<div class="ic-figs">'+imgs+'</div>'+captionLine+plateLink:"")+
        (fieldsHtml?'<section class="ic-sec"><h3>'+t("infoSec")+'</h3><ul class="ic-attrs">'+fieldsHtml+'</ul></section>':"")+
        (attrs?'<section class="ic-sec"><h3>'+t("whatSec")+'</h3><ul class="ic-attrs">'+attrs+'</ul></section>':"")+
        (transl?'<section class="ic-sec"><h3>'+t("translSec")+'</h3><div class="ic-text">'+transl+'</div>'+(chEx?chEx.more:"")+'</section>':"")+
        ((hasScans||hasFr)?renderOriginal(it,book):"")+
        (!imgs && !transl ? '<div class="ic-missing"><b>'+t("missing")+'</b><br>'+t("missingAt",{part:it.part,page:esc(it.page)})+'</div>':"")+
        (transl?tailHtml:"")+
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

  /* ---------- главы русского перевода (book.meta.chapters) ----------
     chapters.data — chapters_ru.json (оглавление + блоки собранных глав),
     chapters.links — chapter_links.tsv (запись -> глава, блок, уверенность).
     Грузится лениво: только при открытии главы или карточки с русским
     текстом, поэтому остальные книги и указатель Картари этого не касаются. */
  function loadChapters(book, cb){
    var cfg = book.meta.chapters;
    if(!cfg){ cb(null); return; }
    if(book.chap && state.lang==="en" && cfg.data_en && !book.chap.enDone){ loadChaptersEn(book, cb); return; }
    if(book.chap !== undefined){ cb(book.chap); return; }
    var base = BASE+"books/"+book.slug+"/";
    Promise.all([
      fetch(base+cfg.data,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }),
      fetch(base+cfg.links,{cache:"no-cache"}).then(function(r){ return r.ok ? r.text() : ""; }).catch(function(){ return ""; }),
      cfg.plates ? fetch(base+cfg.plates,{cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; }) : Promise.resolve({}),
      cfg.pagemap ? fetch(base+cfg.pagemap,{cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; }) : Promise.resolve({})
    ]).then(function(res){
      var list = res[0].chapters || [], bySlug = {}, links = {};
      list.forEach(function(c){ bySlug[c.slug] = c; });
      res[1].split("\n").slice(1).forEach(function(ln){
        var c = ln.replace(/\r$/,"").split("\t");
        if(c.length < 4 || !c[0]) return;
        links[c[0]] = {chapter:c[1], block:parseInt(c[2],10), conf:c[3], end:parseInt(c[4],10)||0, anchor:c[5]||""};
      });
      var pls = (res[2] && res[2].plates) || [], byId = {}, byOld = {};
      pls.forEach(function(p){ byId[p.id] = p; (p.old_ids||[]).forEach(function(o){ byOld[o] = p.id; }); });
      book.chap = {list:list, bySlug:bySlug, links:links, pl:{list:pls, byId:byId, byOld:byOld}, pm:(res[3] && res[3].chapters) || {}};
      if(state.lang==="en" && cfg.data_en) loadChaptersEn(book, cb); else cb(book.chap);
    }).catch(function(){ book.chap = null; cb(null); });
  }
  // Английский перевод (chapters_en.json): блоки совпадают с русскими по номерам. Готовые главы — c.en = {title, blocks}.
  function loadChaptersEn(book, cb){
    var cfg = book.meta.chapters, chap = book.chap;
    fetch(BASE+"books/"+book.slug+"/"+cfg.data_en,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){
        (d.chapters || []).forEach(function(e){
          var c = chap.bySlug[e.slug];
          if(c){ c.title_en = e.title; c.en = e.blocks ? e : null; }
        });
        chap.enDone = true; cb(chap);
      }).catch(function(){ chap.enDone = true; cb(chap); });
  }
  // *курсив* из исходного md; остальной текст экранируется
  function inl(s, qs){
    var h = esc(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
    if(h.indexOf("[?]") < 0) return h;
    qs = qs || {list:null, i:0};
    return h.replace(/\[\?\]/g,function(){
      var e = qs.list ? qs.list[qs.i] : null;
      qs.i++;
      return '<button type="button" class="ic-qm" aria-label="'+esc(t("qmLabel"))+'" aria-expanded="false" data-qm="'+esc(e ? e.replace(/\[\?\]/g,"°") : "")+'">°</button>';
    });
  }
  function qmState(b){ return {list:b.qm||null, i:0}; }
  function quoteHtml(b){
    var stanzas = [[]], qs = qmState(b);
    (b.lines||[]).forEach(function(l){ if(l.trim()) stanzas[stanzas.length-1].push('<span class="ic-vl">'+inl(l, qs)+'</span>'); else if(stanzas[stanzas.length-1].length) stanzas.push([]); });
    var h = '<div class="ic-ch-quote">'+stanzas.filter(function(x){ return x.length; }).map(function(x){ return '<p class="ic-verse">'+x.join("<br>")+'</p>'; }).join("");
    if(b.author) h += '<p class="ic-ch-qa">— '+inl(b.author, qs)+'</p>';
    return h+'</div>';
  }
  // Поиск в русском интерфейсе идёт и по новому переводу: текст фрагмента главы, к которому привязана запись.
  function chapKey(book, it){
    if(state.lang!=="ru" || !book.chap) return "";
    if(it.chKey===undefined){
      var lk = book.chap.links[it.id], ch = lk && book.chap.bySlug[lk.chapter], parts = [];
      if(ch && ch.blocks && lk.block && lk.block <= ch.blocks.length){
        var end = Math.min(Math.max(lk.end || lk.block, lk.block), ch.blocks.length, lk.block+149);
        for(var i = lk.block-1; i < end; i++){
          var b = ch.blocks[i];
          parts.push(b.t==="quote" ? (b.lines||[]).join(" ") : (b.text||""));
        }
      }
      it.chKey = parts.length ? norm(parts.join(" ").replace(/\*/g,"").replace(/\[\?\]/g," ")) : "";
    }
    return it.chKey;
  }
  function chapterHref(book, slug, block){ return hrefFor(book, "ch/"+slug+(block?"/"+block:"")); }
  // Карточка записи в русском интерфейсе: первые 2–3 абзаца нового перевода с места записи
  // + кнопка в главу. null — запись не привязана (или язык не русский): остаётся старый text_ru.
  function chapterExcerpt(book, it){
    if(state.lang!=="ru" || !book.chap) return null;
    var lk = book.chap.links[it.id], ch = lk && book.chap.bySlug[lk.chapter];
    if(!ch || !ch.blocks || !lk.block || lk.block > ch.blocks.length) return null;
    var end = Math.min(lk.end || ch.blocks.length, ch.blocks.length), out = [], n = 0;
    for(var i = lk.block-1; i < end && n < 3; i++){
      var b = ch.blocks[i];
      if(b.t==="p"){
        var txt = b.text, qs = qmState(b);
        if(i===lk.block-1 && lk.anchor){
          var k = txt.indexOf(lk.anchor);
          if(k > 0){
            qs.i = (txt.slice(0,k).match(/\[\?\]/g)||[]).length;
            txt = (/^[А-ЯЁ«"]/.test(lk.anchor) ? "" : "…") + txt.slice(k);
          }
        }
        out.push('<p>'+inl(txt, qs)+'</p>'); n++;
      } else if(b.t==="quote"){ out.push(quoteHtml(b)); n++; }
    }
    if(!out.length) return null;
    return {
      html: out.join(""),
      more: (lk.conf!=="точно" ? '<p class="ic-ch-note">'+esc(t("chApprox"))+'</p>' : "")+
        '<p class="ic-ch-more"><a class="ic-ch-btn" href="'+esc(chapterHref(book, lk.chapter, lk.block))+'">'+esc(t("readInChapter"))+'</a></p>'
    };
  }

  // Гравюры без печатной подписи стоят перед блоком, к которому привязаны (plates.json, at=before).
  function figsHtml(book, b){
    return (b.figs||[]).map(function(f){
      var src = BASE+"books/"+(book.meta.ornaments && book.meta.ornaments.source || book.slug)+"/engravings/"+f.eng;
      return '<figure class="ic-ch-fig" data-for="'+b.n+'"><div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" loading="lazy" src="'+esc(src)+'"'+
        (f.w&&f.h ? ' width="'+f.w+'" height="'+f.h+'" style="aspect-ratio:'+f.w+'/'+f.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:f.pt||""}))+'"></div></figure>';
    }).join("");
  }
  function blockHtml(book, b){
    var n = ' data-n="'+b.n+'"', qs = qmState(b);
    if(b.t==="aside") return '<aside class="ic-ch-aside"'+n+'>'+inl(b.text, qs)+'</aside>';
    if(b.t==="quote") return quoteHtml(b).replace('<div class="ic-ch-quote"', '<div class="ic-ch-quote"'+n);
    if(b.t==="cap"){
      var src = b.eng ? BASE+"books/"+(book.meta.ornaments && book.meta.ornaments.source || book.slug)+"/engravings/"+b.eng : "";
      return '<figure class="ic-ch-fig"'+n+'>'+
        (src ? '<div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" loading="lazy" src="'+esc(src)+'"'+
          (b.w&&b.h ? ' width="'+b.w+'" height="'+b.h+'" style="aspect-ratio:'+b.w+'/'+b.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:b.pt || b.text.slice(0,60)}))+'"></div>' : "")+
        '<figcaption>'+inl(b.text, qs)+'</figcaption></figure>';
    }
    if(b.t==="h") return '<h'+(b.lv===2?2:3)+' class="ic-ch-h"'+n+'>'+inl(b.text, qs)+'</h'+(b.lv===2?2:3)+'>';
    if(b.text.indexOf("\n")>=0) return '<p class="ic-ch-lines"'+n+'>'+inl(b.text, qs).replace(/\n/g,"<br>")+'</p>';
    return '<p'+n+'>'+inl(b.text, qs)+'</p>';
  }

  function cfg_en(book){ return book.meta.chapters && book.meta.chapters.data_en; }
  function renderChapter(book, slug, blockN, pageSpec){
    var gen = renderGen;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var ch = chap && chap.bySlug[slug];
      var idx = ch ? chap.list.indexOf(ch) : -1;
      var prev = idx > 0 ? chap.list[idx-1] : null, next = idx >= 0 ? chap.list[idx+1] : null;
      var toc = chap ? '<button type="button" class="ic-toc-btn" aria-haspopup="dialog"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>'+esc(t("contents"))+'</span></button>' : "";
      function pagerBtn(c, label){
        return c ? '<button type="button" data-ch="'+esc(c.slug)+'"><small>'+esc(label)+'</small><span>'+esc(chapTitle(c))+'</span></button>'
                 : '<button type="button" disabled></button>';
      }
      var pmRows = (ch && chap.pm[slug]) || [], pmAt = {};
      pmRows.forEach(function(r, i){ (pmAt[r[2]] = pmAt[r[2]] || []).push(i); });
      // Если несколько страниц подряд начинаются с одного и того же блока (страница без своего текста,
      // например гравюра на весь лист), их метки сливаются в одну: «с. 415–416» вместо двух подряд.
      function pgmHtml(b){
        var idxs = pmAt[b.n] || [];
        if(!idxs.length) return "";
        var first = pmRows[idxs[0]][1], last = pmRows[idxs[idxs.length-1]][1];
        if(idxs.length > 1 && /^\d+$/.test(first) && /^\d+$/.test(last)){
          var mlb = t("tvPage")+" "+first+"–"+last;
          return '<div class="ic-pgm"><button type="button" class="ic-pgm-b" data-pi="'+idxs[0]+'" aria-pressed="false" aria-label="'+esc(t("svOpen",{p:first}))+'">'+esc(mlb)+'</button></div>';
        }
        return idxs.map(function(i, k){
          var lb = pgLabel(pmRows[i][1]);
          return '<div class="ic-pgm" style="--k:'+k+'"><button type="button" class="ic-pgm-b" data-pi="'+i+'" aria-pressed="false" aria-label="'+esc(t("svOpen",{p:pmRows[i][1]}))+'">'+esc(lb)+'</button></div>';
        }).join("");
      }
      var enMode = state.lang==="en" && !!cfg_en(book), blocks = ch && (enMode ? (ch.en && ch.en.blocks) : ch.blocks);
      var enPrep = enMode && ch && !blocks && chap.pm[slug] && chap.pm[slug].length;
      var body = blocks
        ? '<div class="ic-text ic-ch-body" lang="'+(enMode ? "en" : "ru")+'">'+blocks.map(function(b){ return pgmHtml(b)+figsHtml(book, b)+blockHtml(book, b); }).join("")+'</div>'
        : enPrep ? '<div class="ic-text ic-ch-body ic-ch-itbody"></div>'
        : '<p class="ic-sub">'+esc(t("chNotYet"))+'</p>';
      root.innerHTML =
        '<div class="ic-wrap ic-ch-wrap">'+
          '<div class="ic-nav">'+
            '<button type="button" class="ic-back">'+t("back")+'</button>'+
            '<span class="ic-nav-pos"></span>'+
            langSwitch()+
          '</div>'+
          '<header class="ic-head">'+
            '<p class="ic-kicker">'+esc(bt(book.meta.title))+'</p>'+
            '<h1 class="ic-h-fr">'+esc(ch ? chapTitle(ch) : "")+'</h1>'+
          '</header>'+
          toc+
          (enMode ? (enPrep ? '<p class="ic-ch-note">'+esc(t("chEnPrep"))+'</p>' : "") : (state.lang!=="ru" && ch && ch.blocks ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : ""))+
          body+
          (ch ? '<div class="ic-pager">'+pagerBtn(prev,t("chPrev"))+pagerBtn(next,t("chNext"))+'</div>' : "")+
        '</div>';
      bindLangSwitch(root);
      if(enPrep){
        loadPagesIt(book, function(all){
          var box = root.querySelector(".ic-ch-itbody");
          if(gen !== renderGen || !box) return;
          box.innerHTML = chap.pm[slug].map(function(r){
            return '<div class="ic-sv-it ic-ch-itp" lang="it"><h3 class="ic-ch-itp-h">'+esc(pgLabel(r[1]))+'</h3>'+itHtml(all[String(r[0])])+'</div>';
          }).join("");
        });
      }
      var pgm = pageSpec && /^(\d+)-(\d+)-(\d+)$/.exec(pageSpec);
      root.querySelector(".ic-back").addEventListener("click",function(){
        if(namesUi.chVia===location.hash){ history.back(); return; }
        if(pgm && book.meta.tavola){ if(tavolaUi.via===location.hash) history.back(); else location.hash = hrefFor(book, "index").replace(/^#/,""); }
        else if(book.meta.home) location.hash = hrefFor(book, "home"); else goIndex(book);
      });
      var tocBtn = root.querySelector(".ic-toc-btn");
      if(tocBtn) tocBtn.addEventListener("click",function(){ openChapToc(book, chap, ch, tocBtn); });
      root.querySelectorAll("[data-ch]").forEach(function(b){ b.addEventListener("click",function(){ location.hash = chapterHref(book, b.getAttribute("data-ch")).replace(/^#/,""); }); });
      root.querySelectorAll(".ic-fig").forEach(function(f){ f.addEventListener("click",function(){ lightbox(f.getAttribute("data-src")); }); });
      root.querySelectorAll(".ic-pgm-b").forEach(function(b){ b.addEventListener("click",function(){ openSv(book, pmRows, +b.getAttribute("data-pi")); }); });
      var okN = blockN && /^[1-9]\d*$/.test(blockN), figs = okN ? root.querySelectorAll('.ic-ch-body [data-for="'+blockN+'"]') : [];
      var target = okN ? (figs.length ? figs[0] : root.querySelector('.ic-ch-body [data-n="'+blockN+'"]')) : null;
      var bodyEl = root.querySelector(".ic-ch-body"), pgEls = [], pgLine = null;
      if(pgm && bodyEl){
        for(var bn = +pgm[1]; bn <= +pgm[2]; bn++){
          bodyEl.querySelectorAll('[data-for="'+bn+'"],[data-n="'+bn+'"]').forEach(function(el){ el.classList.add("ic-ch-pg"); pgEls.push(el); });
        }
        if(pgEls.length){
          pgLine = document.createElement("div"); pgLine.className = "ic-ch-pgline"; pgLine.setAttribute("aria-hidden","true");
          pgLine.setAttribute("data-pg", t("tvPage")+" "+pgm[3]);
          bodyEl.appendChild(pgLine);
          if(!target) target = pgEls[0];
        }
      }
      if(target){
        if(okN){ if(figs.length) figs.forEach(function(f){ f.classList.add("ic-ch-hl"); }); else target.classList.add("ic-ch-hl"); }
        var off = (parseFloat(root.dataset.top) || 0) + (okN ? 24 : 40);
        var snap = function(){
          if(gen !== renderGen) return;
          if(pgLine && pgEls.length){
            var bt0 = bodyEl.getBoundingClientRect().top, t0 = Infinity, t1 = 0;
            pgEls.forEach(function(el){ var r = el.getBoundingClientRect(); t0 = Math.min(t0, r.top-bt0); t1 = Math.max(t1, r.bottom-bt0); });
            pgLine.style.top = t0+"px"; pgLine.style.height = Math.max(0, t1-t0)+"px";
          }
          window.scrollTo(0, window.scrollY + target.getBoundingClientRect().top - off);
        };
        snap();
        // На медленной связи гравюры/шрифты выше цели могут догружаться ещё долго после первого
        // прыжка; ширина/высота у <img> заданы, но пока файл не пришёл, браузер иногда всё равно
        // чуть сдвигает раскладку (шрифт, декодирование картинки). Поэтому держим прицел на месте:
        // переповторяем snap() при каждой догрузке картинки и при готовности шрифтов, пока либо не
        // кончились картинки, либо читатель сам не тронул страницу (тогда переставать мешать).
        if(document.fonts && document.fonts.ready) document.fonts.ready.then(snap);
        var stopped = false;
        function stop(){ stopped = true; document.removeEventListener("wheel", stop); document.removeEventListener("touchmove", stop); document.removeEventListener("keydown", stop); }
        document.addEventListener("wheel", stop, {passive:true, once:true});
        document.addEventListener("touchmove", stop, {passive:true, once:true});
        document.addEventListener("keydown", stop, {once:true});
        var imgs = Array.prototype.slice.call(bodyEl.querySelectorAll("img"));
        var pending = imgs.filter(function(im){ return !im.complete; });
        pending.forEach(function(im){
          function onDone(){
            im.removeEventListener("load", onDone); im.removeEventListener("error", onDone);
            if(!stopped && gen === renderGen) snap();
          }
          im.addEventListener("load", onDone); im.addEventListener("error", onDone);
        });
        if(pending.length) setTimeout(stop, 12000);
      } else toTop(true);
      nudgeRepaint();
    });
  }



  /* ---------- указатель (Tavola, #/<slug>/index; book.json "tavola": файл) ----------
     tavola.json строит tools/build_tavola.py: статьи с русским и итальянским заголовками и
     номерами страниц издания 1626 г.; у каждой страницы — глава и номер блока перевода (a–b — блоки страницы, n — блок с термином, если он найден на странице). */
  var tavolaCache = {}, tavolaUi = {q:"", scroll:0, sort:"ru"};
  function tvFold(s){
    s = String(s||"").toLowerCase().replace(/ё/g,"е").normalize("NFD").replace(/[̀-ͯ]/g,"");
    return s.replace(/ph/g,"f").replace(/th/g,"t").replace(/ch/g,"c").replace(/h/g,"").replace(/v/g,"u").replace(/j/g,"i").replace(/k/g,"c").replace(/y/g,"i").replace(/([a-z])\1+/g,"$1");
  }
  function loadTavola(book, cb){
    if(tavolaCache[book.slug]){ cb(tavolaCache[book.slug]); return; }
    fetch(BASE+"books/"+book.slug+"/"+book.meta.tavola,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){
        d.byId = {};
        d.entries.forEach(function(e){
          e.h = tvFold(e.ru+" "+e.it+" "+(e.subs||[]).map(function(x){ return x.ru+" "+x.it; }).join(" "));
          d.byId[e.id] = e;
          (e.subs||[]).forEach(function(x){ d.byId[x.id] = e; });
        });
        tavolaCache[book.slug] = d; cb(d);
      }).catch(function(){ cb(null); });
  }
  function renderTavola(book){
    var gen = renderGen;
    loadTavola(book, function(d){
      if(gen !== renderGen) return;
      if(!d){ root.innerHTML = '<div class="ic-wrap"><p class="ic-sub">'+esc(t("chNotYet"))+'</p></div>'; return; }
      function ruLetter(e){ var m = (e.ru||"").toUpperCase().replace(/Ё/g,"Е").match(/[А-Я]/); return m ? m[0] : e.letter; }
      function ordered(){
        if(tavolaUi.sort==="it") return d.entries.map(function(e){ return {e:e, l:e.letter}; });
        return d.entries.map(function(e){ return {e:e, l:ruLetter(e)}; }).sort(function(a,b){
          return a.l===b.l ? (a.e.ru||a.e.it).replace(/[«»\s]/g,"").localeCompare((b.e.ru||b.e.it).replace(/[«»\s]/g,""), "ru") : a.l.localeCompare(b.l, "ru");
        });
      }
      function lettersOf(list){ var out = []; list.forEach(function(x){ if(out.indexOf(x.l)<0) out.push(x.l); }); return out; }
      function pagesHtml(e){
        if(e.see){
          var tg = e.see_id && d.byId[e.see_id];
          return '<span class="ic-tv-see">'+esc(t("tvSee"))+' '+(tg ? '<a href="#" data-tv="'+esc(e.see_id)+'">'+esc(tg.ru||tg.it)+'</a>' : esc(e.see))+'</span>';
        }
        if(!e.pages || !e.pages.length) return "";
        return '<span class="ic-tv-pg">'+esc(t("tvPage"))+' '+e.pages.map(function(p){
          var href = hrefFor(book, "ch/"+p.ch+"/"+(p.n||0)+(p.a ? "/"+p.a+"-"+p.b+"-"+p.p : ""));
          return '<a href="'+esc(href)+'" title="'+esc(t("tvOpen"))+'">'+p.p+'</a>';
        }).join(", ")+'</span>';
      }
      function entryHtml(e, sub){
        return '<div class="ic-tv-'+(sub?"sub":"e")+'"'+(sub?"":' id="tv-'+e.id+'"')+'>'+
          '<div class="ic-tv-l"><span class="ic-tv-ru">'+esc(e.ru||e.it)+'</span>'+(e.ru ? ' <span class="ic-tv-it" lang="it">'+esc(e.it)+'</span>' : "")+'</div>'+
          pagesHtml(e)+'</div>';
      }
      root.innerHTML =
        '<div class="ic-wrap ic-tv">'+
          '<div class="ic-nav"><button type="button" class="ic-back">← '+esc(book.meta.home ? t("tvBack") : t("back"))+'</button><span class="ic-nav-pos"></span>'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmIndex"))+'</h1></header>'+
          '<p class="ic-tv-lead">'+esc(t("tvSub"))+'</p>'+
          (state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : "")+
          '<div class="ic-tv-bar">'+
            '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("tvSearchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("tvSearchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
            '<nav class="ic-tv-letters" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
          '</div>'+
          '<div class="ic-tv-meta"><p class="ic-count ic-tv-count"></p><div class="ic-seg ic-tv-sort" role="group">'+
            '<button type="button" class="ic-chip" data-s="ru" aria-pressed="'+(tavolaUi.sort==="ru")+'">'+esc(t("tvSortRu"))+'</button>'+
            '<button type="button" class="ic-chip" data-s="it" aria-pressed="'+(tavolaUi.sort==="it")+'">'+esc(t("tvSortIt"))+'</button></div></div>'+
          '<div class="ic-tv-list"></div>'+
        '</div>';
      bindLangSwitch(root);
      root.querySelector(".ic-back").addEventListener("click",function(){ location.hash = book.meta.home ? hrefFor(book,"home") : ""; });
      var q = root.querySelector(".ic-search"), list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          bar = root.querySelector(".ic-tv-bar"), lnav = root.querySelector(".ic-tv-letters");
      q.value = tavolaUi.q;
      function fill(){
        var words = tvFold(q.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        ordered().forEach(function(x){
          var e = x.e;
          if(words.length && !words.every(function(w){ return e.h.indexOf(w) >= 0; })) return;
          if(x.l !== cur){ if(cur) html += '</section>'; cur = x.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="tv-L'+cur+'"><h2>'+cur+'</h2>'; }
          n++;
          html += entryHtml(e, false) + (e.subs||[]).map(function(x){ return entryHtml(x, true); }).join("");
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        cnt.textContent = words.length ? t("tvFound",{n:n}) : t("tvAll",{n:d.entries.length});
        lnav.innerHTML = lettersOf(ordered()).map(function(l){ return '<button type="button" data-l="'+l+'"'+(have[l] ? "" : " disabled")+'>'+l+'</button>'; }).join("");
      }
      function barH(){ return bar.getBoundingClientRect().height + (parseFloat(root.dataset.top)||0) + 10; }
      function flash(el){ el.classList.add("ic-ch-hl"); setTimeout(function(){ el.classList.remove("ic-ch-hl"); }, 2200); }
      function scrollToEl(el){ window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - barH()); }
      q.addEventListener("input",function(){ tavolaUi.q = q.value; fill(); });
      wireSearchClear(q);
      lnav.addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b) return;
        var el = document.getElementById("tv-L"+b.getAttribute("data-l")); if(el) scrollToEl(el);
      });
      root.querySelector(".ic-tv-sort").addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b || b.getAttribute("data-s")===tavolaUi.sort) return;
        tavolaUi.sort = b.getAttribute("data-s");
        root.querySelectorAll(".ic-tv-sort .ic-chip").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        fill(); window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH())));
      });
      list.addEventListener("click",function(e){
        var a = e.target.closest("a");
        if(!a) return;
        if(a.hasAttribute("data-tv")){
          e.preventDefault();
          var id = d.byId[a.getAttribute("data-tv")].id, el = document.getElementById("tv-"+id);
          if(!el){ q.value = tavolaUi.q = ""; fill(); el = document.getElementById("tv-"+id); }
          if(el){ scrollToEl(el); flash(el); }
        } else { tavolaUi.scroll = window.scrollY; tavolaUi.via = a.getAttribute("href"); }
      });
      fill();
      if(tavolaUi.scroll){ var y = tavolaUi.scroll; tavolaUi.scroll = 0; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
      else toTop(true);
      nudgeRepaint();
    });
  }

  /* ---------- имена (#/<slug>/names, #/<slug>/names/<id>; book.json "names": файл) ----------
     names.json строит tools/build_names.py: имена из глоссария с типом, гравюрами и упоминаниями в русском переводе.
     Упоминание — [глава, блок, позиция, длина, …] в тексте блока (у цитаты: строки через \n и «— автор»). */
  var namesCache = {}, namesUi = {q:"", ty:"all", pos:{}, via:"", chVia:""};
  var NM_TYPES = ["g","c","a","p","n"];
  function loadNames(book, cb){
    if(namesCache[book.slug]){ cb(namesCache[book.slug]); return; }
    fetch(BASE+"books/"+book.slug+"/"+book.meta.names,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){
        d.byId = {};
        d.names.forEach(function(e){
          var m = (e.ru||"").toUpperCase().replace(/Ё/g,"Е").match(/[А-Я]/);
          e.l = m ? m[0] : "#";
          e.h = tvFold(e.ru+" "+(e.it||[]).join(" ")+" "+(e.v||[]).join(" "));
          e.k = (e.ru||"").replace(/[«»\s]/g,"");
          d.byId[e.id] = e;
        });
        d.names.sort(function(a,b){ return a.l===b.l ? a.k.localeCompare(b.k,"ru") : a.l.localeCompare(b.l,"ru"); });
        namesCache[book.slug] = d; cb(d);
      }).catch(function(){ cb(null); });
  }
  function nmBlockText(b){
    if(b.t==="quote") return (b.lines||[]).join("\n")+(b.author ? "\n— "+b.author : "");
    return b.text||"";
  }
  function nmPlain(s){ return esc(s.replace(/\*/g,"").replace(/\[\?\]/g,"").replace(/\n/g," / ")); }
  function nmSnippet(text, sp){
    var W = 85, s0 = Math.max(0, sp[0]-W), e0 = Math.min(text.length, sp[0]+sp[1]+W), i;
    if(s0 > 0){ i = text.indexOf(" ", s0); if(i >= 0 && i < sp[0]) s0 = i+1; }
    if(e0 < text.length){ i = text.lastIndexOf(" ", e0); if(i > sp[0]+sp[1]) e0 = i; }
    var out = s0 > 0 ? "…" : "", cur = s0;
    for(var k = 0; k < sp.length; k += 2){
      if(sp[k] < cur || sp[k]+sp[k+1] > e0) continue;
      out += nmPlain(text.slice(cur, sp[k]))+"<mark>"+nmPlain(text.slice(sp[k], sp[k]+sp[k+1]))+"</mark>";
      cur = sp[k]+sp[k+1];
    }
    return out+nmPlain(text.slice(cur, e0))+(e0 < text.length ? "…" : "");
  }
  function nmCount(e){ return e.n||0; }
  function renderNames(book, nameId){
    var gen = renderGen;
    loadNames(book, function(d){
      if(gen !== renderGen) return;
      if(!d){ root.innerHTML = '<div class="ic-wrap"><p class="ic-sub">'+esc(t("chNotYet"))+'</p></div>'; return; }
      if(nameId){
        loadChapters(book, function(chap){
          if(gen !== renderGen) return;
          renderNameCard(book, d, chap, d.byId[nameId], gen);
        });
        return;
      }
      var tcount = {all:d.names.length};
      NM_TYPES.forEach(function(k){ tcount[k] = 0; });
      d.names.forEach(function(e){ tcount[e.t]++; });
      if(!tcount[namesUi.ty]) namesUi.ty = "all";
      var letters = [];
      d.names.forEach(function(e){ if(letters.indexOf(e.l)<0) letters.push(e.l); });
      root.innerHTML =
        '<div class="ic-wrap ic-tv ic-nm">'+
          '<div class="ic-nav"><button type="button" class="ic-back">← '+esc(book.meta.home ? t("tvBack") : t("back"))+'</button><span class="ic-nav-pos"></span>'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmNames"))+'</h1></header>'+
          '<p class="ic-tv-lead">'+esc(t("nmSub"))+'</p>'+
          (state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : "")+
          '<div class="ic-tv-bar">'+
            '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("nmSearchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("nmSearchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
            '<nav class="ic-tv-letters" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
          '</div>'+
          '<div class="ic-tv-meta"><div class="ic-seg ic-nm-types" role="group" aria-label="'+esc(t("nmTypeLabel"))+'">'+
            ["all"].concat(NM_TYPES).map(function(k){
              return tcount[k] ? '<button type="button" class="ic-chip" data-ty="'+k+'" aria-pressed="'+(namesUi.ty===k)+'">'+esc(t(k==="all" ? "nmAll" : "nmT_"+k))+'</button>' : "";
            }).join("")+'</div><p class="ic-count ic-tv-count"></p></div>'+
          '<div class="ic-tv-list"></div>'+
        '</div>';
      bindLangSwitch(root);
      root.querySelector(".ic-back").addEventListener("click",function(){ location.hash = book.meta.home ? hrefFor(book,"home") : ""; });
      var q = root.querySelector(".ic-search"), list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          bar = root.querySelector(".ic-tv-bar"), lnav = root.querySelector(".ic-tv-letters");
      q.value = namesUi.q;
      function fill(){
        var words = tvFold(q.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        d.names.forEach(function(e){
          if(namesUi.ty !== "all" && e.t !== namesUi.ty) return;
          if(words.length && !words.every(function(w){ return e.h.indexOf(w) >= 0; })) return;
          if(e.l !== cur){ if(cur) html += '</section>'; cur = e.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="nm-L'+(cur==="#" ? "0" : cur)+'"><h2>'+cur+'</h2>'; }
          n++;
          html += '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'">'+
            '<span class="ic-tv-l"><span class="ic-tv-ru">'+esc(e.ru)+'</span> <span class="ic-tv-it" lang="it">'+esc((e.it||[]).join(" · "))+'</span></span>'+
            '<span class="ic-nm-meta"><span class="ic-nm-type">'+esc(t("nmT1_"+e.t))+'</span>'+(e.n ? '<span class="ic-nm-n">'+e.n+'</span>' : "")+'</span></a>';
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        cnt.textContent = (words.length || namesUi.ty!=="all") ? t("nmFound",{n:n}) : t("nmTotal",{n:d.names.length});
        lnav.innerHTML = letters.map(function(l){ return '<button type="button" data-l="'+(l==="#" ? "0" : l)+'"'+(have[l] ? "" : " disabled")+'>'+l+'</button>'; }).join("");
      }
      function barH(){ return bar.getBoundingClientRect().height + (parseFloat(root.dataset.top)||0) + 10; }
      q.addEventListener("input",function(){ namesUi.q = q.value; fill(); });
      wireSearchClear(q);
      lnav.addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b) return;
        var el = document.getElementById("nm-L"+b.getAttribute("data-l"));
        if(el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - barH());
      });
      root.querySelector(".ic-nm-types").addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b || b.getAttribute("data-ty")===namesUi.ty) return;
        namesUi.ty = b.getAttribute("data-ty");
        root.querySelectorAll(".ic-nm-types .ic-chip").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        fill(); window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH())));
      });
      list.addEventListener("click",function(e){
        var a = e.target.closest("a.ic-nm-row");
        if(a){ namesUi.pos[location.hash] = window.scrollY; namesUi.via = a.getAttribute("href"); }
      });
      fill();
      var y = namesUi.pos[location.hash];
      if(y){ delete namesUi.pos[location.hash]; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
      else toTop(true);
      nudgeRepaint();
    });
  }
  function renderNameCard(book, d, chap, e, gen){
    if(!e){ location.replace(hrefFor(book, "names")); return; }
    var engBase = engBaseOf(book), pls = (e.pl||[]).map(function(id){ return chap && chap.pl.byId[id]; }).filter(Boolean);
    var byCh = {}, order = [];
    (e.m||[]).forEach(function(m){ if(!byCh[m[0]]){ byCh[m[0]] = []; order.push(m[0]); } byCh[m[0]].push(m); });
    order.sort(function(a,b){ return a-b; });
    var occ = 0; (e.m||[]).forEach(function(m){ occ += (m.length-2)/2; });
    var gal = pls.length ? '<h2 class="ic-nm-h">'+esc(t("nmPlates"))+'</h2><ul class="ic-gal">'+pls.map(function(g){
      return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book, "plate/"+g.id))+'">'+
        '<span class="ic-gal-img"><img loading="lazy" src="'+esc(engBase+"thumb/"+g.file+"_t.webp")+'" alt=""></span>'+
        '<span class="ic-gal-cap">'+esc(g.title)+'</span></a></li>';
    }).join("")+'</ul>' : "";
    var ments = order.map(function(ci){
      var slug = d.chapters[ci], ch = chap && chap.bySlug[slug];
      if(!ch || !ch.blocks) return "";
      return '<section class="ic-nm-ch"><h3>'+esc(chapTitle(ch))+' <span class="ic-nm-chn">'+byCh[ci].length+'</span></h3><ul class="ic-nm-ms">'+byCh[ci].map(function(m){
        var b = ch.blocks[m[1]-1];
        if(!b) return "";
        return '<li><a href="'+esc(chapterHref(book, slug, m[1]))+'">'+nmSnippet(nmBlockText(b), m.slice(2))+'</a></li>';
      }).join("")+'</ul></section>';
    }).join("");
    root.innerHTML =
      '<div class="ic-wrap ic-tv ic-nm">'+
        '<div class="ic-nav"><button type="button" class="ic-back">← '+esc(t("hmNames"))+'</button><span class="ic-nav-pos"></span>'+langSwitch()+'</div>'+
        '<header class="ic-head"><p class="ic-kicker">'+esc(t("nmT1_"+e.t))+'</p><h1 class="ic-h-fr">'+esc(e.ru)+'</h1>'+
          ((e.it||[]).length ? '<p class="ic-nm-it" lang="it">'+esc(e.it.join(" · "))+'</p>' : "")+'</header>'+
        (state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : "")+
        gal+
        '<h2 class="ic-nm-h">'+esc(t("nmMentions"))+'</h2>'+
        '<p class="ic-count">'+esc(e.n ? t("nmStat",{n:e.n, c:order.length}) : t("nmNoMentions"))+'</p>'+
        ments+
      '</div>';
    bindLangSwitch(root);
    root.querySelector(".ic-back").addEventListener("click",function(){
      if(namesUi.via===location.hash) history.back(); else location.hash = hrefFor(book,"names").replace(/^#/,"");
    });
    root.addEventListener("click",function(ev){
      var a = ev.target.closest(".ic-nm-ms a");
      if(a){ namesUi.pos[location.hash] = window.scrollY; namesUi.chVia = a.getAttribute("href"); }
    });
    var y = namesUi.pos[location.hash];
    if(y){ delete namesUi.pos[location.hash]; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
    else toTop(true);
    nudgeRepaint();
  }

  /* ---------- содержание книги по частям (book.json chapters.parts) ---------- */
  function chapTitle(c){ return (state.lang==="en" && c.title_en ? c.title_en : c.title).replace(/\s*\(вступление\)$/,""); }
  function tocPartsHtml(book, chap, curSlug){
    var parts = (book.meta.chapters && book.meta.chapters.parts) || [], used = {};
    function link(c){
      return '<li><a href="'+esc(chapterHref(book, c.slug))+'"'+(c.slug===curSlug?' aria-current="page"':"")+((state.lang==="en" ? c.en : c.blocks)?"":' class="ic-ch-off"')+'>'+esc(chapTitle(c))+'</a></li>';
    }
    var groups = parts.map(function(pt){
      var cs = pt.slugs.map(function(sl){ used[sl] = 1; return chap.bySlug[sl]; }).filter(Boolean);
      return cs.length ? '<section class="ic-toc-part"><h3>'+esc(bt(pt.name))+'</h3><ol>'+cs.map(link).join("")+'</ol></section>' : "";
    });
    var rest = chap.list.filter(function(c){ return !used[c.slug]; });
    if(rest.length) groups.push('<section class="ic-toc-part"><ol>'+rest.map(link).join("")+'</ol></section>');
    return groups.join("");
  }
  function openChapToc(book, chap, ch, opener){
    var d = document.createElement("div");
    d.className = "ic ic-toc-drawer";
    d.innerHTML =
      '<div class="ic-toc-backdrop"></div>'+
      '<div class="ic-toc-panel" role="dialog" aria-modal="true" aria-label="'+esc(t("contents"))+'">'+
        '<div class="ic-toc-head"><span>'+esc(t("contents"))+'</span>'+
          '<button type="button" class="ic-toc-close" aria-label="'+esc(t("hmCloseToc"))+'">×</button></div>'+
        '<nav class="ic-toc-body">'+tocPartsHtml(book, chap, ch && ch.slug)+'</nav>'+
      '</div>';
    document.body.appendChild(d);
    lockBodyScroll();
    var cur = d.querySelector('[aria-current="page"]'), closeBtn = d.querySelector(".ic-toc-close");
    if(cur){ var bd = d.querySelector(".ic-toc-body"); bd.scrollTop = Math.max(0, cur.offsetTop - bd.clientHeight/3); }
    closeBtn.focus({preventScroll:true});
    function close(){
      d.remove(); document.removeEventListener("keydown", onKey);
      unlockBodyScroll(); activeSheetClose = null;
      if(opener && document.body.contains(opener)) opener.focus({preventScroll:true});
    }
    activeSheetClose = close;
    function onKey(e){ if(e.key==="Escape") close(); }
    document.addEventListener("keydown", onKey);
    d.querySelector(".ic-toc-backdrop").addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    d.querySelector(".ic-toc-body").addEventListener("click", function(e){ if(e.target.closest("a")) close(); });
  }

  /* ---------- пояснение к «°» (бывшее «[?]») в тексте перевода ---------- */
  var qmPop = null, qmBtnOpen = null;
  function closeQm(){
    if(qmPop){ qmPop.remove(); qmPop = null; }
    if(qmBtnOpen){ qmBtnOpen.setAttribute("aria-expanded","false"); qmBtnOpen = null; }
  }
  function openQm(btn){
    closeQm();
    var txt = btn.getAttribute("data-qm");
    var d = document.createElement("div");
    d.className = "ic ic-qm-pop"; d.setAttribute("role","note");
    d.innerHTML = '<p>'+(txt ? inl(txt) : esc(t("qmDefault")))+'</p>';
    document.body.appendChild(d);
    var r = btn.getBoundingClientRect(), vw = document.documentElement.clientWidth, w = Math.min(340, vw - 24);
    d.style.width = w+"px";
    var left = Math.min(Math.max(12, r.left + r.width/2 - w/2), vw - w - 12);
    var h = d.offsetHeight, below = r.bottom + 8, top = (below + h > window.innerHeight && r.top - h - 8 > 8) ? r.top - h - 8 : below;
    d.style.left = (left + window.scrollX)+"px"; d.style.top = (top + window.scrollY)+"px";
    btn.setAttribute("aria-expanded","true");
    qmPop = d; qmBtnOpen = btn;
  }
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest(".ic-qm");
    if(b){ e.preventDefault(); if(b === qmBtnOpen) closeQm(); else openQm(b); return; }
    if(qmPop && !e.target.closest(".ic-qm-pop")) closeQm();
  });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeQm(); });
  window.addEventListener("hashchange", closeQm);
  window.addEventListener("resize", closeQm);

  /* ---------- главная книги (#/<slug>/home, book.json home) ---------- */
  // Сетка и карточки гравюр читают только plates.json (chap.pl); файлы — books/<источник>/engravings/<file>_display.webp
  function engBaseOf(book){ return BASE+"books/"+(book.engravings ? book.engravings.srcSlug : (book.meta.ornaments && book.meta.ornaments.source || book.slug))+"/engravings/"; }
  function galleryEntries(chap){ return chap && chap.pl ? chap.pl.list : []; }
  function homeTile(href, title, sub, on){
    return '<a class="ic-home-tile" href="'+esc(href)+'"'+(on?' aria-current="page"':"")+'><span class="ic-home-tile-t">'+esc(title)+'</span><span class="ic-home-tile-s">'+esc(sub)+'</span></a>';
  }
  /* ---------- поиск по книге (#/<slug>/home/search; книги с home и chapters) ----------
     Один запрос ищется сразу в пяти источниках: русском переводе (chapters_ru.json), итальянской
     транскрипции страниц (pages_it.json), подписях гравюр (plates.json), именах (names.json) и указателе
     (tavola.json). Всё считается в браузере, без перезагрузки: данные грузятся при первом открытии вкладки.
     Сравнение — по «свёрнутому» тексту той же длины (srFold), поэтому подсветка ложится на исходные символы. */
  var searchUi = {q:"", lim:null, ctx:{}};
  var SR_LETTER = /[a-z0-9а-я]/, SR_MORE = 30;
  function srFold(s){
    return String(s||"").toLowerCase().replace(/ё/g,"е").replace(/ſ/g,"s")
      .replace(/[^\u0000-\u007fЀ-ӿ]/g,function(c){ return c.normalize("NFD").charAt(0); })
      .replace(/[jvy]/g,function(c){ return c==="v" ? "u" : "i"; });
  }
  // слова запроса: свёрнутые; у русских слов отрезан последний гласный/й, чтобы находить «Фортуны», «Митре», «Фортуной»
  function srWords(q){
    var ws = srFold(q).split(/[^a-z0-9а-я]+/).filter(Boolean);
    if(ws.length > 1) ws = ws.filter(function(w){ return w.length > 1; });
    if(!ws.length || ws.join("").length < 2) return null;
    return ws.map(function(w){
      var cyr = /[а-я]/.test(w);
      return {w: cyr && w.length >= 5 ? w.replace(/[аяыиуюеоьй]$/,"") : w, extra: cyr ? 3 : 2};
    });
  }
  // слово запроса стоит в начале слова текста, после него — не больше extra букв (окончание); возвращает [нач, длина, …] или true
  function srFind(f, words, spans){
    var out = [];
    for(var i = 0; i < words.length; i++){
      var w = words[i].w, from = 0, p, e, ok = false;
      while((p = f.indexOf(w, from)) >= 0){
        from = p+1;
        if(p > 0 && SR_LETTER.test(f.charAt(p-1))) continue;
        e = p+w.length;
        while(e < f.length && SR_LETTER.test(f.charAt(e))) e++;
        if(e-p-w.length <= words[i].extra){ ok = true; break; }
      }
      if(!ok) return null;
      out.push([p, e-p]);
    }
    if(!spans) return true;
    out.sort(function(a,b){ return a[0]-b[0]; });
    var flat = [];
    out.forEach(function(s){
      var l = flat.length;
      if(l && s[0] < flat[l-2]+flat[l-1]) flat[l-1] = Math.max(flat[l-1], s[0]+s[1]-flat[l-2]);
      else flat.push(s[0], s[1]);
    });
    return flat;
  }
  function srMark(text, sp){
    var out = "", cur = 0;
    for(var k = 0; k < sp.length; k += 2){ out += esc(text.slice(cur, sp[k]))+"<mark>"+esc(text.slice(sp[k], sp[k]+sp[k+1]))+"</mark>"; cur = sp[k]+sp[k+1]; }
    return out+esc(text.slice(cur));
  }
  function srTv(words){ return words.map(function(x){ return {w: tvFold(x.w), extra: x.extra}; }); }

  function srLoad(book, chap, cb){
    var c = searchUi.ctx[book.slug];
    if(c){ cb(c); return; }
    var cfg = book.meta.chapters, need = 1 + (book.meta.names ? 1 : 0) + (book.meta.tavola ? 1 : 0), got = {}, n = 0;
    function done(k, v){ got[k] = v; if(++n < need) return; searchUi.ctx[book.slug] = srBuild(book, chap, got); cb(searchUi.ctx[book.slug]); }
    loadPagesIt(book, function(d){ done("it", d); });
    if(book.meta.names) loadNames(book, function(d){ done("names", d); });
    if(book.meta.tavola) loadTavola(book, function(d){ done("tavola", d); });
  }
  function srBuild(book, chap, got){
    var c = {ru:[], it:[], names:got.names, tavola:got.tavola, chap:chap, tm:{}}, scanMap = {};
    chap.list.forEach(function(ch, ci){
      ch.ci = ci;
      (ch.blocks || []).forEach(function(b){
        var raw = nmBlockText(b);
        if(raw) c.ru.push({ch:ch, n:b.n, raw:raw, f:srFold(raw)});
      });
      (chap.pm[ch.slug] || []).forEach(function(r){ if(!scanMap[r[0]]) scanMap[r[0]] = {ch:ch, label:r[1], block:r[2]}; });
    });
    Object.keys(got.it || {}).forEach(function(k){
      var e = got.it[k], m = scanMap[k];
      if(!m) return;
      var raw = ((e[1] || "")+((e[4] && e[4].length) ? "  "+e[4].join(" · ") : "")).replace(/\s+/g," ");
      if(raw.trim()) c.it.push({m:m, raw:raw, f:srFold(raw)});
    });
    return c;
  }

  function srRender(book, box, c, q){
    var words = srWords(q);
    if(!words){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("srHint"))+'</p>'; return; }
    if(!c){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("srLoading"))+'</p>'; return; }
    var lim = searchUi.lim || (searchUi.lim = {t:20, g:10, n:20, i:20}), tw = srTv(words), chap = c.chap;
    // В тексте: перевод и итальянский текст в порядке глав; главы, чьё название совпадает с запросом, идут первыми
    var chFirst = {};
    chap.list.forEach(function(ch){ chFirst[ch.slug] = srFind(srFold(ch.title), words) ? 0 : 1; });
    var tx = [];
    c.ru.forEach(function(r){
      var sp = srFind(r.f, words, true);
      if(sp) tx.push({k:chFirst[r.ch.slug]*1e9 + r.ch.ci*1e6 + r.n*2, r:r, sp:sp});
    });
    c.it.forEach(function(r){
      var sp = srFind(r.f, words, true);
      if(sp) tx.push({k:chFirst[r.m.ch.slug]*1e9 + r.m.ch.ci*1e6 + r.m.block*2 + 1, r:r, sp:sp, it:true});
    });
    tx.sort(function(a,b){ return a.k-b.k; });
    // Гравюры
    var engBase = engBaseOf(book), pl = [];
    chap.pl.list.forEach(function(p){
      if(p.sf === undefined) p.sf = srFold(p.title+" | "+(p.ru_caption||"")+" | "+(p.it_caption||""));
      if(!srFind(p.sf, words)) return;
      var tsp = srFind(srFold(p.title), words, true);
      pl.push({p:p, tsp:tsp, k:tsp ? 0 : 1});
    });
    pl.sort(function(a,b){ return a.k-b.k; });
    // Имена
    var nm = [];
    if(c.names) c.names.names.forEach(function(e){
      if(!srFind(e.h, tw)) return;
      if(e.fr === undefined){ e.fr = tvFold(e.ru); e.fi = tvFold((e.it||[]).join(" ")); }
      nm.push({e:e, k:(e.fr.indexOf(tw[0].w) === 0 || e.fi.indexOf(tw[0].w) === 0) ? 0 : 1});
    });
    nm.sort(function(a,b){ return a.k-b.k || (b.e.n||0)-(a.e.n||0); });
    // Указатель
    var tv = [];
    if(c.tavola) c.tavola.entries.forEach(function(e){
      if(!srFind(e.h, tw)) return;
      if(e.hm === undefined) e.hm = tvFold(e.ru+" "+e.it);
      var subs = (e.subs||[]).filter(function(s){ if(s.hm === undefined) s.hm = tvFold(s.ru+" "+s.it); return srFind(s.hm, tw); });
      tv.push({e:e, subs:subs, main:!!srFind(e.hm, tw)});
    });
    tv.sort(function(a,b){ return (b.main?1:0)-(a.main?1:0); });

    if(!tx.length && !pl.length && !nm.length && !tv.length){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("srNone"))+'</p>'; return; }

    function more(g, total){
      return total > lim[g] ? '<button type="button" class="ic-sr-more" data-g="'+g+'">'+esc(t("srMore",{n:Math.min(SR_MORE, total-lim[g])}))+'</button>' : "";
    }
    function head(g, key, n){ return '<h2 class="ic-nm-h" id="ic-sr-'+g+'">'+esc(t(key))+' <span class="ic-nm-chn">'+n+'</span></h2>'; }
    function txRow(h){
      var r = h.r, ch = h.it ? r.m.ch : r.ch;
      if(h.it) return '<li><a class="ic-sr-a" href="'+esc(chapterHref(book, ch.slug, r.m.block))+'"><span class="ic-sr-meta">'+esc(chapTitle(ch))+' · '+esc(pgLabel(r.m.label))+' · '+esc(t("srItOrig"))+'</span>'+
        '<span class="ic-sr-snip ic-sr-it" lang="it">'+nmSnippet(r.raw, h.sp)+'</span></a></li>';
      return '<li><a class="ic-sr-a" href="'+esc(chapterHref(book, ch.slug, r.n))+'"><span class="ic-sr-meta">'+esc(chapTitle(ch))+'</span>'+
        '<span class="ic-sr-snip" lang="ru">'+nmSnippet(r.raw, h.sp)+'</span></a></li>';
    }
    function plRow(h){
      var p = h.p, snip = "";
      if(!h.tsp){
        var cap = p.ru_caption || "", sp = cap && srFind(srFold(cap), words, true);
        if(!sp){ cap = p.it_caption || ""; sp = cap && srFind(srFold(cap), words, true); }
        if(sp) snip = '<span class="ic-sr-snip" lang="'+(cap === p.ru_caption ? "ru" : "it")+'">'+nmSnippet(cap, sp)+'</span>';
      }
      return '<li><a class="ic-sr-a ic-sr-pl" href="'+esc(hrefFor(book, "plate/"+p.id))+'"><span class="ic-sr-th"><img loading="lazy" src="'+esc(engBase+"thumb/"+p.file+"_t.webp")+'" alt=""></span>'+
        '<span class="ic-sr-pb"><span class="ic-sr-t">'+(h.tsp ? srMark(p.title, h.tsp) : esc(p.title))+'</span>'+snip+'</span></a></li>';
    }
    function nmRow(h){
      var e = h.e;
      return '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'"><span class="ic-tv-l"><span class="ic-tv-ru">'+esc(e.ru)+'</span> <span class="ic-tv-it" lang="it">'+esc((e.it||[]).join(" · "))+'</span></span>'+
        '<span class="ic-nm-meta"><span class="ic-nm-type">'+esc(t("nmT1_"+e.t))+'</span>'+(e.n ? '<span class="ic-nm-n">'+e.n+'</span>' : "")+'</span></a>';
    }
    function tvPages(e){
      if(e.see || !e.pages || !e.pages.length) return "";
      return '<span class="ic-tv-pg">'+esc(t("tvPage"))+' '+e.pages.slice(0, 8).map(function(p){
        return '<a href="'+esc(hrefFor(book, "ch/"+p.ch+"/"+(p.n||0)+(p.a ? "/"+p.a+"-"+p.b+"-"+p.p : "")))+'" title="'+esc(t("tvOpen"))+'">'+p.p+'</a>';
      }).join(", ")+(e.pages.length > 8 ? " …" : "")+'</span>';
    }
    function tvLine(e){ return '<div class="ic-tv-l"><span class="ic-tv-ru">'+esc(e.ru||e.it)+'</span>'+(e.ru ? ' <span class="ic-tv-it" lang="it">'+esc(e.it)+'</span>' : "")+'</div>'; }
    function tvRow(h){
      var showMain = h.main || !h.subs.length;
      return '<div class="ic-tv-e">'+tvLine(h.e)+(showMain ? tvPages(h.e) : "")+
        h.subs.map(function(s){ return '<div class="ic-tv-sub">'+tvLine(s)+tvPages(s)+'</div>'; }).join("")+'</div>';
    }

    var nav = [["t", "srText", tx.length], ["g", "nmPlates", pl.length], ["n", "hmNames", nm.length], ["i", "hmIndex", tv.length]].filter(function(x){ return x[2]; });
    var html = '<nav class="ic-sr-nav" aria-label="'+esc(t("srPlace"))+'">'+nav.map(function(x){
      return '<button type="button" data-jump="'+x[0]+'">'+esc(t(x[1]))+' <b>'+x[2]+'</b></button>'; }).join("")+'</nav>';
    if(tx.length) html += head("t","srText",tx.length)+'<ul class="ic-sr-ul">'+tx.slice(0, lim.t).map(txRow).join("")+'</ul>'+more("t", tx.length);
    if(pl.length) html += head("g","nmPlates",pl.length)+'<ul class="ic-sr-ul">'+pl.slice(0, lim.g).map(plRow).join("")+'</ul>'+more("g", pl.length);
    if(nm.length) html += head("n","hmNames",nm.length)+'<div class="ic-sr-nm">'+nm.slice(0, lim.n).map(nmRow).join("")+'</div>'+more("n", nm.length);
    if(tv.length) html += head("i","hmIndex",tv.length)+'<div class="ic-sr-tv">'+tv.slice(0, lim.i).map(tvRow).join("")+'</div>'+more("i", tv.length);
    box.innerHTML = html;
  }

  function wireBookSearch(book, form, box, gen, restoreY){
    var q = form.querySelector(".ic-search"), ctx = searchUi.ctx[book.slug] || null, timer = 0, lastQ = searchUi.q;
    if(!book.chap){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("chNotYet"))+'</p>'; return; }
    q.value = searchUi.q;
    wireSearchClear(q);
    function paint(){ if(gen === renderGen) srRender(book, box, ctx, q.value); }
    function run(){
      if(q.value !== lastQ){ lastQ = q.value; searchUi.lim = null; }
      searchUi.q = q.value; paint();
    }
    q.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(run, 120); });
    form.addEventListener("submit", function(e){ e.preventDefault(); clearTimeout(timer); run(); q.blur(); });
    box.addEventListener("click", function(e){
      var b = e.target.closest("button"), a = e.target.closest("a");
      if(b && b.classList.contains("ic-sr-more")){ searchUi.lim[b.getAttribute("data-g")] += SR_MORE; paint(); return; }
      if(b && b.getAttribute("data-jump")){
        var el = document.getElementById("ic-sr-"+b.getAttribute("data-jump"));
        if(el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (parseFloat(root.dataset.top) || 0) - 12);
        return;
      }
      if(a && a.getAttribute("href")){
        var h = a.getAttribute("href");
        namesUi.pos[location.hash] = window.scrollY; namesUi.via = h; namesUi.chVia = h;
      }
    });
    paint();
    srLoad(book, book.chap, function(c){
      if(gen !== renderGen) return;
      ctx = c; paint();
      if(restoreY) requestAnimationFrame(function(){ if(gen === renderGen) window.scrollTo(0, restoreY); });
    });
  }

  function renderHome(book, tabArg){
    var gen = renderGen, h = book.meta.home, tab = tabArg==="gallery" || tabArg==="search" ? tabArg : "read";
    restoreState(book.slug);
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var engBase = engBaseOf(book);
      var hero = h.hero ? engBase+h.hero : "";
      var gal = tab==="gallery" ? galleryEntries(chap) : [];
      var galCount = galleryEntries(chap).length;
      var panel;
      if(tab==="read"){
        panel = (state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : "")+
          (chap ? '<div class="ic-home-toc">'+tocPartsHtml(book, chap, null)+'</div>' : '<p class="ic-empty">'+esc(t("chNotYet"))+'</p>');
      } else if(tab==="gallery"){
        panel = '<ul class="ic-gal">'+gal.map(function(g){
          var thumb = engBase+"thumb/"+g.file+"_t.webp";
          return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book, "plate/"+g.id))+'" data-id="'+esc(g.id)+'">'+
            '<span class="ic-gal-img"><img loading="lazy" src="'+esc(thumb)+'" alt=""></span>'+
            '<span class="ic-gal-cap">'+esc(g.title)+'</span></a></li>';
        }).join("")+'</ul>';
      } else {
        panel = '<form class="ic-home-search" role="search">'+
          '<span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srPlace"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srPlace"))+'">'+
          '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span></form>'+
          '<div class="ic-sr" aria-live="polite"></div>';
      }
      var orn = book.ornaments, ornRec = function(type, seed){ return orn && pickOrnament(orn[type], "home|"+seed); };
      var hp = ornRec("headpiece","head"), tp = ornRec("tailpiece","tail"), dv = ornRec("divider","div");
      root.innerHTML =
        '<div class="ic-wrap ic-home">'+
          '<div class="ic-top-row">'+(forcedBook?"":'<button type="button" class="ic-to-lib-link ic-back">← '+t("toLibrary")+'</button>')+langSwitch()+'</div>'+
          (hp ? ornamentMaskHtml(book, hp, "ic-orn-headpiece") : "")+
          '<header class="ic-home-hero">'+
            '<div class="ic-home-txt">'+
              '<p class="ic-kicker">'+esc(book.meta.title.original||"")+'</p>'+
              '<h1 class="ic-title">'+esc(bt(book.meta.title))+'</h1>'+
              '<p class="ic-home-author">'+esc(bt(h.author))+'</p>'+
              '<p class="ic-home-ed">'+(h.editionShort ? '<span class="ic-ed-long">' : '<span>')+esc(bt(h.edition))+(h.addition ? ' · '+esc(bt(h.addition)) : "")+'</span>'+(h.editionShort ? '<span class="ic-ed-short">'+esc(bt(h.editionShort))+'</span>' : "")+'</p>'+
            '</div>'+
            '<nav class="ic-home-tiles" aria-label="'+esc(t("hmNavLabel"))+'">'+
              homeTile(hrefFor(book,"home"), t("hmRead"), t("hmReadSub"), tab==="read")+
              homeTile(hrefFor(book,"home/gallery"), t("hmGallery"), t("hmGallerySub",{n:galCount}), tab==="gallery")+
              homeTile(hrefFor(book,"home/search"), t("hmSearch"), t("hmSearchSub"), tab==="search")+
              (book.meta.tavola ? homeTile(hrefFor(book,"index"), t("hmIndex"), t("hmIndexSub"), false) : "")+
              (book.meta.names ? homeTile(hrefFor(book,"names"), t("hmNames"), t("hmNamesSub"), false) : "")+
              (book.meta.tavola ? [] : ['hmIndex']).concat(book.meta.names ? [] : ['hmNames']).map(function(k){ return '<div class="ic-home-tile ic-soon" aria-disabled="true"><span class="ic-home-tile-t">'+esc(t(k))+'</span><span class="ic-home-tile-s">'+esc(t("hmSoon"))+'</span></div>'; }).join("")+
            '</nav>'+
            (hero ? '<figure class="ic-home-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(hero)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(hero)+'" alt="'+esc(t("engravingAlt",{title:bt(book.meta.title)}))+'"></div></figure>' : "")+
            '<p class="ic-home-blurb">'+esc(bt(h.blurb))+'</p>'+
          '</header>'+
          (dv ? ornamentMaskHtml(book, dv, "ic-orn-divider") : "")+
          '<section class="ic-home-panel" id="ic-home-panel">'+panel+'</section>'+
          (tp ? ornamentMaskHtml(book, tp, "ic-orn-tailpiece") : "")+
        '</div>';
      bindLangSwitch(root);
      var toLib = root.querySelector(".ic-to-lib-link"); if(toLib) toLib.addEventListener("click",function(){ location.hash=""; });
      var fig = root.querySelector(".ic-home-fig .ic-fig"); if(fig) fig.addEventListener("click",function(){ lightbox(fig.getAttribute("data-src")); });
      var gl = root.querySelector(".ic-gal"); if(gl) gl.addEventListener("click",function(e){
        var a = e.target.closest(".ic-gal-item");
        if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){ e.preventDefault(); go(book, "plate/"+a.getAttribute("data-id")); }
      });
      var form = root.querySelector(".ic-home-search"), restoreY = 0;
      if(tab==="search"){ restoreY = namesUi.pos[location.hash] || 0; delete namesUi.pos[location.hash]; }
      if(form){
        wireBookSearch(book, form, root.querySelector(".ic-sr"), gen, restoreY);
        if(tabArg && !restoreY) form.querySelector(".ic-search").focus({preventScroll:true});
      }
      var pn = root.querySelector("#ic-home-panel");
      if(tab==="gallery" && state.scroll){ var y = state.scroll; state.scroll = 0; window.scrollTo(0, y); }
      else if(restoreY){ state.scroll = 0; }
      else if(tabArg){
        state.scroll = 0;
        var off = (parseFloat(root.dataset.top) || 0) + 12;
        var snap = function(){ if(gen !== renderGen) return; window.scrollTo(0, window.scrollY + pn.getBoundingClientRect().top - off); };
        snap();
        if(document.fonts && document.fonts.ready) document.fonts.ready.then(snap);
      } else { state.scroll = 0; toTop(true); }
      nudgeRepaint();
    });
  }

  /* ---------- карточка гравюры (#/<slug>/plate/<id>; книги с home и chapters) ---------- */
  function platePageStr(p){
    p = String(p||"").trim();
    if(/^Titelblatt/.test(p)) return t("plTitlePage");
    var m = /^(\d+)\.5$/.exec(p);
    if(m) return t("plBetween",{a:m[1], b:parseInt(m[1],10)+1});
    return p ? t("pageAbbr")+" "+p.replace(/\s*-\s*/g,"–") : "";
  }
  // Абзацы перевода, на которые plates.json ссылается как на объяснение гравюры
  function explHtml(chap, e){
    var ch = chap.bySlug[e.chapter], bl = state.lang==="en" ? (ch && ch.en && ch.en.blocks) : (ch && ch.blocks), b = bl && bl[e.block-1];
    if(!b) return "";
    if(b.t==="quote") return quoteHtml(b);
    var h = inl(b.text, qmState(b));
    return b.text.indexOf("\n")>=0 ? '<p class="ic-ch-lines">'+h.replace(/\n/g,"<br>")+'</p>' : '<p>'+h+'</p>';
  }
  function zoomLightbox(src){
    var d = document.createElement("div"); d.className = "ic ic-lb ic-lb-zoom"; d.setAttribute("role","dialog"); d.setAttribute("aria-label",t("plZoomLabel"));
    d.innerHTML = '<div class="ic-lbz-sc"><img src="'+esc(src)+'" alt=""></div><button type="button" aria-label="'+esc(t("close"))+'">×</button>';
    var sc = d.firstChild, img = sc.firstChild, zoomed = false;
    function close(){ d.remove(); document.removeEventListener("keydown",onKey); document.documentElement.style.overflow=""; }
    function onKey(e){ if(e.key==="Escape") close(); }
    img.addEventListener("click",function(e){
      e.stopPropagation();
      var r = img.getBoundingClientRect(), fx = (e.clientX - r.left)/r.width, fy = (e.clientY - r.top)/r.height;
      zoomed = !zoomed;
      sc.classList.toggle("zoomed", zoomed);
      if(zoomed){
        img.style.width = Math.max(img.naturalWidth, r.width*2.2)+"px";
        var r2 = img.getBoundingClientRect();
        sc.scrollLeft = fx*r2.width - sc.clientWidth/2;
        sc.scrollTop = fy*r2.height - sc.clientHeight/2;
      } else img.style.width = "";
    });
    sc.addEventListener("click",close);
    d.querySelector("button").addEventListener("click",close);
    document.addEventListener("keydown",onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(d); d.querySelector("button").focus();
  }
  var plateKeyHandler = null;
  function renderPlateCard(book, id){
    var gen = renderGen;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var pl = chap && chap.pl, p = pl && pl.byId[id];
      if(!p){ location.replace(hrefFor(book, pl && pl.byOld[id] ? "plate/"+pl.byOld[id] : "home/gallery")); return; }
      var gal = pl.list, idx = gal.indexOf(p);
      var engBase = engBaseOf(book), src = engBase+p.file+"_display.webp";
      var ch = chap.bySlug[p.chapter], capB = p.at==="cap" && ch && ch.blocks ? ch.blocks[p.block-1] : null;
      var prev = idx > 0 ? gal[idx-1] : null, next = idx < gal.length-1 ? gal[idx+1] : null;
      function navLink(n, dir){
        if(!n) return '<span class="ic-pc-step ic-pc-'+dir+' ic-pc-off" aria-hidden="true"></span>';
        return '<a class="ic-pc-step ic-pc-'+dir+'" rel="'+dir+'" href="'+esc(hrefFor(book,"plate/"+n.id))+'" aria-label="'+esc(t(dir==="prev"?"plPrev":"plNext"))+'">'+
          '<span class="ic-pc-arrow" aria-hidden="true">'+(dir==="prev"?"←":"→")+'</span><span class="ic-pc-step-t">'+esc(n.title)+'</span></a>';
      }
      var meta = [];
      if(ch) meta.push('<span>'+esc(chapTitle(ch))+'</span>');
      var pg = platePageStr(p.page); if(pg) meta.push('<span>'+esc(pg)+' · '+esc(t("plEdition"))+'</span>');
      var enP = state.lang==="en" && !!cfg_en(book);
      var enCapB = enP && p.at==="cap" && ch && ch.en && ch.en.blocks[p.block-1];
      var explParas = p.expl.map(function(e){ return explHtml(chap, e); }).join("");
      var explBlock = '<section class="ic-pc-expl" aria-labelledby="ic-pc-expl-h"><h2 id="ic-pc-expl-h" class="ic-pc-expl-h">'+esc(t("plExplH"))+'</h2>'+
        (enP ? (explParas ? '<div class="ic-text ic-pc-expl-body" lang="en">'+explParas+'</div>' : '<p class="ic-ch-note">'+esc(t("chEnSoon"))+'</p>')
          : state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : explParas ? '<div class="ic-text ic-pc-expl-body" lang="ru">'+explParas+'</div>' : '<p class="ic-pc-none">'+esc(t("plNoExpl"))+'</p>')+
        '</section>';
      root.innerHTML =
        '<div class="ic-wrap ic-home ic-plate-card">'+
          '<div class="ic-top-row"><button type="button" class="ic-to-lib-link ic-back ic-pc-all">← '+esc(t("plAll"))+'</button>'+langSwitch()+'</div>'+
          '<article class="ic-pc" data-id="'+esc(p.id)+'">'+
            '<figure class="ic-pc-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(src)+'"'+
              (p.w && p.h ? ' width="'+p.w+'" height="'+p.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:p.title}))+'"></div></figure>'+
            '<div class="ic-pc-body">'+
              '<p class="ic-pc-count">'+esc(t("plCount",{k:idx+1, n:gal.length}))+'</p>'+
              '<h1 class="ic-pc-title">'+esc(enCapB ? t("plateTitle",{n:idx+1}) : p.title)+'</h1>'+
              (enCapB ? '<p class="ic-pc-ru" lang="en">'+inl(enCapB.text, qmState(enCapB))+'</p>' : p.ru_caption ? '<p class="ic-pc-ru" lang="ru">'+inl(p.ru_caption, capB ? qmState(capB) : null)+'</p>' : "")+
              (p.it_caption ? '<p class="ic-pc-it" lang="it">'+esc(p.it_caption)+'</p>' : "")+
              (meta.length ? '<p class="ic-pc-meta">'+meta.join('<span class="ic-pc-sep" aria-hidden="true"> · </span>')+'</p>' : "")+
              explBlock+
              '<a class="ic-pc-read" href="'+esc(chapterHref(book, p.chapter, p.block))+'">'+esc(t("plRead"))+'</a>'+
            '</div>'+
          '</article>'+
          '<nav class="ic-pc-pager" aria-label="'+esc(t("hmGallery"))+'">'+navLink(prev,"prev")+navLink(next,"next")+'</nav>'+
        '</div>';
      bindLangSwitch(root);
      root.querySelector(".ic-pc-all").addEventListener("click",function(){
        if(namesUi.via===location.hash){ history.back(); return; }
        location.hash = hrefFor(book, "home/gallery");
      });
      var fig = root.querySelector(".ic-pc-fig .ic-fig"); fig.addEventListener("click",function(){ zoomLightbox(src); });
      [prev,next].forEach(function(n){ if(n){ var im = new Image(); im.src = engBase+n.file+"_display.webp"; } });
      function step(n){ if(n) location.replace(hrefFor(book, "plate/"+n.id)); }
      var art = root.querySelector(".ic-pc"), x0 = 0, y0 = 0, t0 = 0, tracking = false;
      art.addEventListener("touchstart",function(e){
        if(e.touches.length !== 1){ tracking = false; return; }
        tracking = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
      },{passive:true});
      art.addEventListener("touchend",function(e){
        if(!tracking || document.querySelector(".ic-lb")) return;
        tracking = false;
        var tc = e.changedTouches[0], dx = tc.clientX - x0, dy = tc.clientY - y0;
        if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)*1.6 && Date.now() - t0 < 700) step(dx < 0 ? next : prev);
      },{passive:true});
      if(plateKeyHandler) document.removeEventListener("keydown", plateKeyHandler);
      plateKeyHandler = function(e){
        if(!/\/plate\//.test(location.hash) || document.querySelector(".ic-lb") || e.altKey || e.metaKey || e.ctrlKey) return;
        if(e.target.matches && e.target.matches("input,textarea,select")) return;
        if(e.key === "ArrowLeft") step(prev); else if(e.key === "ArrowRight") step(next);
      };
      document.addEventListener("keydown", plateKeyHandler);
      toTop();
      nudgeRepaint();
    });
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
    var pagesBase = BASE+"books/"+book.slug+"/"+(book.meta.pagesDir || "pages/");
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
      // On a phone, inline-expanding one row at a time means scanning through
      // a plate's objects means opening, reading, closing and reopening the
      // next row by hand — there's no way to flip straight to the next item.
      // The hotspot-click sheet (openObjectSheet) already has prev/next
      // paging built in, so route list taps there too on phone width instead
      // of the inline <details> expand (kept as-is on desktop, where the
      // inline list already reads fine without a modal).
      var sum = det.querySelector(".ic-obj-sum");
      sum.addEventListener("click",function(e){
        if(!isPhoneWidth()) return;
        e.preventDefault();
        openObjectSheet(book, objs, objs.indexOf(it));
      });
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
    // Whole-plate prev/next: quickly flipping through consecutive plates to
    // scan/QA a book shouldn't mean going back to the index and picking the
    // next row by hand each time. Order is the book's own plates[] order
    // (already the correct sequence after any renumbering), independent of
    // the objects-within-a-plate ordering used elsewhere.
    var plateSeq = (book.meta.plates||[]).map(function(p){ return String(p.n); });
    var pi = plateSeq.indexOf(n);
    var prevN = pi>0 ? plateSeq[pi-1] : null, nextN = (pi>=0 && pi<plateSeq.length-1) ? plateSeq[pi+1] : null;
    var platePager = '<div class="ic-nav-pager">'+
      '<button type="button" class="ic-nav-pager-b" data-plate="'+(prevN||"")+'"'+(prevN?"":" disabled")+'>'+t("navPrev")+'</button>'+
      '<button type="button" class="ic-nav-pager-b" data-plate="'+(nextN||"")+'"'+(nextN?"":" disabled")+'>'+t("navNext")+'</button>'+
    '</div>';
    root.innerHTML =
      '<div class="ic-wrap">'+
        '<div class="ic-nav">'+
          '<button type="button" class="ic-back">'+t("back")+'</button>'+
          platePager+
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
    root.querySelectorAll(".ic-nav-pager-b[data-plate]").forEach(function(b){
      b.addEventListener("click",function(){
        var pn = b.getAttribute("data-plate"); if(pn) location.hash = hrefFor(book,"plate/"+pn);
      });
    });
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


  /* ---------- «Оригинал рядом»: скан страницы издания 1626 г. и её итальянский текст ----------
     Метки «с. N» стоят у блока, с которого начинается страница (pagemap.json строит tools/build_pagemap.py),
     поэтому привязка точна до абзаца. От 1400px скан — панель справа от текста, уже — на весь экран. */
  var sv = null, svMode = "scan", itCache = {};
  function pgLabel(l){
    var m = /^(Titelblatt|Widmung)_?(\w*)$/.exec(l);
    return m ? t(m[1]==="Titelblatt" ? "svTitle" : "svDedic")+(m[2] ? " "+m[2] : "") : t("tvPage")+" "+l;
  }
  function loadPagesIt(book, cb){
    var cfg = book.meta.chapters;
    if(itCache[book.slug]){ cb(itCache[book.slug]); return; }
    fetch(BASE+"books/"+book.slug+"/"+cfg.pagesIt,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ itCache[book.slug] = d; cb(d); }).catch(function(){ cb({}); });
  }
  function itHtml(e){
    if(!e) return '<p class="ic-sv-none">'+esc(t("svNoText"))+'</p>';
    function fmt(x){
      if(state.lang !== "ru") x = x.replace(/\[(ИНИЦИАЛ|ГРАВЮРА|ВИНЬЕТКА|ПУСТАЯ СТРАНИЦА)([^\]]*)\]/g, function(m, k, r){
        var body = r.replace(/^:\s*/, "");
        if(k === "ИНИЦИАЛ") return body;
        var cyr = (body.match(/[А-Яа-яЁё]/g) || []).length, label = {ГРАВЮРА: "engraving", ВИНЬЕТКА: "ornament"}[k] || "blank page";
        return cyr > body.length * 0.3 || k !== "ГРАВЮРА" ? "[" + label + "]" : "[" + label + ": " + body + "]";
      });
      return esc(x).replace(/\*([^*\n]+)\*/g,"<em>$1</em>").replace(/\[([^\]]*[А-Яа-яЁё][^\]]*)\]/g,'<span class="ic-sv-ed">[$1]</span>').replace(/\n/g,"<br>");
    }
    var h = "";
    if(e[0]) h += '<p class="ic-sv-run">'+fmt(e[0])+'</p>';
    (e[1] || "").split(/\n\n+/).forEach(function(par){ if(par.trim()) h += '<p>'+fmt(par)+'</p>'; });
    (e[4] || []).forEach(function(m){ h += '<p class="ic-sv-mar">'+fmt(m)+'</p>'; });
    if(e[2] || e[3]) h += '<p class="ic-sv-foot">'+fmt([e[3], e[2]].filter(Boolean).join("    "))+'</p>';
    return h || '<p class="ic-sv-none">'+esc(t("svNoText"))+'</p>';
  }
  // удерживает на месте верхний видимый блок главы, пока меняется раскладка
  function keepAnchor(change){
    var top0 = (parseFloat(root.dataset.top) || 0) + 8, kids = root.querySelectorAll(".ic-ch-body > :not(.ic-pgm):not(.ic-ch-pgline)"), a = null, y0 = 0, i;
    for(i = 0; i < kids.length; i++){ var r = kids[i].getBoundingClientRect(); if(r.bottom > top0){ a = kids[i]; y0 = r.top; break; } }
    change();
    if(a){ var d = a.getBoundingClientRect().top - y0; if(d) window.scrollTo(0, window.scrollY + d); }
  }

  function openSv(book, rows, idx){
    if(sv){
      if(sv.panel && sv.idx === idx){ sv.close(); return; }
      sv.go(idx); return;
    }
    var panel = window.innerWidth >= 1400, base = BASE+"books/"+book.slug+"/", scansDir = base+(book.meta.chapters.scans || "scans/");
    var d = document.createElement("div");
    d.className = "ic ic-sv "+(panel ? "ic-sv-panel" : "ic-sv-full");
    d.setAttribute("role","dialog"); d.setAttribute("aria-label", t("svDlg"));
    if(panel){ d.style.top = (parseFloat(root.dataset.top) || 0)+"px"; }
    d.innerHTML =
      '<div class="ic-sv-bar">'+
        '<div class="ic-sv-pager"><button type="button" class="ic-sv-pv" aria-label="'+esc(t("svPrev"))+'">‹</button><span class="ic-sv-pos"></span><button type="button" class="ic-sv-nx" aria-label="'+esc(t("svNext"))+'">›</button></div>'+
        '<div class="ic-seg ic-sv-sw" role="group">'+
          '<button type="button" class="ic-chip" data-m="scan">'+esc(t("svScan"))+'</button>'+
          '<button type="button" class="ic-chip" data-m="it">'+esc(t("svIt"))+'</button></div>'+
        '<button type="button" class="ic-sv-x" aria-label="'+esc(t("close"))+'">×</button>'+
      '</div>'+
      '<div class="ic-sv-stage"></div>';
    var stage = d.querySelector(".ic-sv-stage"), pos = d.querySelector(".ic-sv-pos"), pv = d.querySelector(".ic-sv-pv"), nx = d.querySelector(".ic-sv-nx");
    var Z = {s:1, x:0, y:0}, img = null, st = {idx:idx, panel:panel};

    function mark(on){
      root.querySelectorAll(".ic-pgm-b").forEach(function(b){ b.setAttribute("aria-pressed", String(on && +b.getAttribute("data-pi") === st.idx)); });
    }
    function applyZ(){ if(img) img.style.transform = Z.s === 1 && !Z.x && !Z.y ? "" : "translate("+Z.x+"px,"+Z.y+"px) scale("+Z.s+")"; }
    function clampZ(){
      if(!img) return;
      var mx = Math.max(0, (img.offsetWidth*Z.s - stage.clientWidth)/2), my = Math.max(0, (img.offsetHeight*Z.s - stage.clientHeight)/2);
      Z.x = Math.max(-mx, Math.min(mx, Z.x)); Z.y = Math.max(-my, Math.min(my, Z.y));
    }
    function show(){
      var r = rows[st.idx];
      pos.textContent = pgLabel(r[1]);
      pv.disabled = st.idx <= 0; nx.disabled = st.idx >= rows.length-1;
      d.querySelectorAll(".ic-sv-sw [data-m]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === svMode)); });
      Z.s = 1; Z.x = Z.y = 0; img = null;
      stage.classList.toggle("ic-sv-text", svMode === "it");
      stage.scrollTop = 0; stage.scrollLeft = 0;
      stage.classList.remove("ic-sv-zoom");
      if(svMode === "scan"){
        var pad = ("000"+r[0]).slice(-4), im = document.createElement("img");
        im.className = "ic-sv-img"; im.alt = ""; im.draggable = false; im.src = scansDir+pad+".webp";
        stage.innerHTML = ""; stage.appendChild(im); img = im;
        [st.idx-1, st.idx+1].forEach(function(j){ if(rows[j]) (new Image()).src = scansDir+("000"+rows[j][0]).slice(-4)+".webp"; });
      } else {
        var key = String(r[0]), at = st.idx;
        stage.innerHTML = "";
        loadPagesIt(book, function(all){ if(sv === st && st.idx === at) { stage.innerHTML = '<div class="ic-sv-it" lang="it">'+itHtml(all[key])+'</div>'; stage.scrollTop = 0; } });
      }
      mark(true);
    }
    st.go = function(i){ if(i < 0 || i >= rows.length || i === st.idx) return; st.idx = i; show(); };
    st.close = function(){
      keepAnchor(function(){ d.remove(); root.classList.remove("ic-has-sv"); });
      document.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize);
      sv = null; mark(false);
    };
    function onKey(e){
      if(e.key === "Escape") st.close();
      else if(e.key === "ArrowLeft") st.go(st.idx-1);
      else if(e.key === "ArrowRight") st.go(st.idx+1);
    }
    function onResize(){ if((window.innerWidth >= 1400) !== panel) st.close(); }
    pv.addEventListener("click", function(){ st.go(st.idx-1); });
    nx.addEventListener("click", function(){ st.go(st.idx+1); });
    d.querySelector(".ic-sv-x").addEventListener("click", function(){ st.close(); });
    d.querySelectorAll(".ic-sv-sw [data-m]").forEach(function(b){ b.addEventListener("click", function(){ svMode = b.getAttribute("data-m"); show(); }); });

    if(panel){
      stage.addEventListener("click", function(e){ if(e.target === img) stage.classList.toggle("ic-sv-zoom"); });
    } else {
      var t0 = null, pinch = null, lastTap = 0;
      function dist(a, b){ return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }
      function rel(cx, cy){ var r = stage.getBoundingClientRect(); return {x: cx-r.left-r.width/2, y: cy-r.top-r.height/2}; }
      function zoomAt(ns, p){
        ns = Math.max(1, Math.min(4, ns));
        Z.x = p.x-(p.x-Z.x)*(ns/Z.s); Z.y = p.y-(p.y-Z.y)*(ns/Z.s); Z.s = ns;
        if(Z.s === 1){ Z.x = Z.y = 0; } clampZ(); applyZ();
      }
      stage.addEventListener("touchstart", function(e){
        if(e.touches.length === 2 && img){
          var a = e.touches[0], b = e.touches[1], m = rel((a.clientX+b.clientX)/2, (a.clientY+b.clientY)/2);
          pinch = {d:dist(a,b), s:Z.s, m:m}; t0 = null;
        } else if(e.touches.length === 1){
          var tt = e.touches[0]; t0 = {x:tt.clientX, y:tt.clientY, zx:Z.x, zy:Z.y, t:Date.now(), moved:false};
        }
      }, {passive:true});
      stage.addEventListener("touchmove", function(e){
        var textMode = !img;
        if(pinch && e.touches.length === 2){
          e.preventDefault();
          var a = e.touches[0], b = e.touches[1];
          zoomAt(pinch.s*dist(a,b)/pinch.d, pinch.m);
        } else if(t0 && e.touches.length === 1){
          var tt = e.touches[0], dx = tt.clientX-t0.x, dy = tt.clientY-t0.y;
          if(Math.abs(dx) + Math.abs(dy) > 8) t0.moved = true;
          if(textMode) return;
          e.preventDefault();
          if(Z.s > 1){ Z.x = t0.zx+dx; Z.y = t0.zy+dy; clampZ(); applyZ(); }
          else { img.style.transform = "translateX("+(dx*.5)+"px)"; }
        }
      }, {passive:false});
      stage.addEventListener("touchend", function(e){
        if(pinch){ if(e.touches.length < 2){ pinch = null; if(Z.s < 1.05) { Z.s = 1; Z.x = Z.y = 0; applyZ(); } } return; }
        if(!t0) return;
        var c = e.changedTouches[0], dx = c.clientX-t0.x, dy = c.clientY-t0.y, tap = !t0.moved && Date.now()-t0.t < 300;
        t0 = null;
        if(img && Z.s === 1){ img.style.transform = ""; }
        if(Z.s === 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)*1.5){ st.go(st.idx + (dx < 0 ? 1 : -1)); lastTap = 0; return; }
        if(tap && img){
          if(Date.now()-lastTap < 320){ lastTap = 0; zoomAt(Z.s > 1 ? 1 : 2.5, rel(c.clientX, c.clientY)); }
          else lastTap = Date.now();
        }
      }, {passive:true});
      stage.addEventListener("touchcancel", function(){ t0 = null; pinch = null; if(img && Z.s === 1) img.style.transform = ""; }, {passive:true});
    }

    sv = st;
    document.addEventListener("keydown", onKey); window.addEventListener("resize", onResize);
    if(panel){
      keepAnchor(function(){ root.classList.add("ic-has-sv"); document.body.appendChild(d); });
    } else document.body.appendChild(d);
    show();
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
