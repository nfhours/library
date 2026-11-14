/* Библиотека: указатель книг и карточки статей.
   Реестр книг: library.json. Каждая книга: books/<slug>/book.json + entries.json,
   гравюры: books/<slug>/img/, сканы страниц: books/<slug>/pages/. */
(function(){
  // Бампать при каждой правке app.css (и, по желанию, когда меняется логика
  // в app.js, завязанная на новую разметку), чтобы браузеры и CDN не отдавали
  // старую закэшированную копию стилей после деплоя.
  var APP_VER = "157";
  var me = document.currentScript;
  var BASE = (me && me.src) ? me.src.replace(/[^\/]*$/, "") : "./";
  var root = document.getElementById("iconologie");
  if(!root){ root = document.createElement("div"); root.id = "iconologie"; (me && me.parentNode ? me.parentNode : document.body).appendChild(root); }
  // Единый sticky-контейнер шапки (.ic-stack): шапка сайта (.back-bar), меню
  // книги (.ic-booktabs) и, в главе, строка раздела (.ic-rbar) — ОДИН
  // sticky-элемент, прячется одним transform (installBookHide ниже). .back-bar
  // живёт вне root (index.html), поэтому на каждой установке root.innerHTML
  // она (1) сперва «паркуется» обратно в body перед root, чтобы не уничтожиться
  // вместе со старой разметкой, и (2) если новая разметка начинается с
  // .ic-stack — переезжает в него первым ребёнком. Страницы без .ic-stack
  // (указатель, «Имена», карточка гравюры и др.) остаются со своей sticky-
  // .back-bar в body, как раньше.
  (function(){
    var bb = document.querySelector(".back-bar");
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    if(!bb || !desc || !desc.set || !root.parentNode) return;
    Object.defineProperty(root, "innerHTML", {configurable:true,
      get:function(){ return desc.get.call(root); },
      set:function(v){
        if(bb.parentNode !== root.parentNode) root.parentNode.insertBefore(bb, root);
        desc.set.call(root, v);
        var st = root.querySelector(":scope > .ic-stack");
        if(st) st.insertBefore(bb, st.firstChild);
      }});
  })();
  root.className = "ic";
  if(root.dataset.top) root.style.setProperty("--top", root.dataset.top);
  // syncTopVar — root.dataset.top/--top задаёт пользователь статично
  // ("52px" в index.html), в расчёте на то, что внешняя .back-bar всегда
  // этой высоты. app.css теперь уменьшает её высоту в компактном режиме
  // (малая высота экрана — ландшафт телефона, см. .back-bar там же), и без
  // пересчёта .ic-rbar (position:sticky;top:var(--top)) садилась бы с
  // неверным отступом — либо щель кремового фона под .back-bar, либо
  // перекрытие. Меряем РЕАЛЬНУЮ высоту .back-bar и держим --top (и
  // root.dataset.top — его читает весь остальной код файла напрямую через
  // parseFloat, не через CSS var) в синхроне: на старте и на каждый
  // resize/orientationchange (поворот экрана «на лету»).
  function syncTopVar(){
    var bbar = document.querySelector(".back-bar");
    var px = (bbar ? Math.round(bbar.getBoundingClientRect().height) : (parseFloat(root.dataset.top)||0))+"px";
    if(root.dataset.top !== px){ root.dataset.top = px; }
    root.style.setProperty("--top", px);
  }
  syncTopVar();
  // bookTabsH/headerStackH/syncHeaderStack — этот раунд (задание, пункт 3-5):
  // новое общее меню книги (.ic-booktabs, bookTabsHtml ниже) сидит МЕЖДУ
  // внешней .back-bar и строкой раздела книги (капсула .ic-rbar/.ic-rbar-tv
  // читалки/указателя/«Имён») на каждой странице книги — высота видимого
  // "стека" над контентом/над капсулой теперь не просто root.dataset.top
  // (высота .back-bar), а она ЖЕ + реальная высота .ic-booktabs, если она
  // есть на странице (на страницах без book.meta.home её вовсе нет —
  // bookTabsH() тогда 0, headerStackH() совпадает со старым root.dataset.top,
  // ни одно из мест, где уже использовался root.dataset.top для прочих книг,
  // не задето). --top2 (app.css) — та же сумма как CSS-переменная, читает её
  // .ic-rbar/.ic-rbar-tv (position:sticky/fixed;top:var(--top2)) для
  // собственной позиции под меню книги — синхронизируется явно, сразу после
  // вставки разметки капсулы (см. renderChapter/renderTavola/renderNames), а
  // не только по resize/orientationchange ниже (высота меню книги не зависит
  // от скролла и не должна «плыть» при первом кадре).
  function bookTabsH(){ var bt = document.getElementById("ic-booktabs"); return bt ? bt.getBoundingClientRect().height : 0; }
  function headerStackH(){ return (parseFloat(root.dataset.top)||0) + bookTabsH(); }
  function syncHeaderStack(){ root.style.setProperty("--top2", headerStackH()+"px"); }
  syncHeaderStack();
  window.addEventListener("resize", function(){ syncTopVar(); updateSheetMaxH(); syncHeaderStack(); });
  window.addEventListener("orientationchange", function(){ syncTopVar(); updateSheetMaxH(); syncHeaderStack(); });
  // visualViewport — события, которые СУЩЕСТВУЮТ ИМЕННО для динамической
  // адресной строки iOS Safari (её показ/скрытие при скролле меняет
  // visualViewport.height независимо от window.innerHeight/resize, который
  // в этом случае вовсе не обязан сработать). См. updateSheetMaxH() ниже —
  // единственное место, где JS ограничивает высоту выезжающей шторки; сама
  // привязка «под панелью» теперь чистый CSS (position:absolute внутри
  // position:sticky .ic-rbar, app.css), эти слушатели лишь подрезают
  // max-height, не трогая top/позицию.
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize", updateSheetMaxH);
    window.visualViewport.addEventListener("scroll", updateSheetMaxH);
  }
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
    slowConn:     {ru:"Медленное соединение, ещё немного…", en:"Slow connection, almost there…", fr:"Connexion lente, encore un instant…"},
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
    chFrPrep:     {ru:"Французский перевод готовится. Ниже — итальянский текст издания 1626 года.", en:"French translation in preparation. Below is the Italian text of the 1626 edition.", fr:"Traduction française en préparation. Ci-dessous : le texte italien de l'édition de 1626."},
    chFrSoon:     {ru:"Французский перевод готовится.", en:"French translation in preparation.", fr:"Traduction française en préparation."},
    chFrPartial:  {ru:"Главы, ещё не переведённые на французский, показаны с итальянским текстом.", en:"Chapters not yet translated into French are shown with the Italian text.", fr:"Les chapitres pas encore traduits en français sont présentés avec le texte italien."},
    chNotYet:     {ru:"Перевод этой главы ещё не добавлен на сайт.", en:"This chapter has not been added to the site yet.", fr:"Ce chapitre n'a pas encore été ajouté au site."},
    chNext:       {ru:"Следующая глава", en:"Next chapter", fr:"Chapitre suivant"},
    chPrev:       {ru:"Предыдущая глава", en:"Previous chapter", fr:"Chapitre précédent"},
    chToc:        {ru:"Главы", en:"Chapters", fr:"Chapitres"},
    contents:     {ru:"Содержание", en:"Contents", fr:"Sommaire"},
    rbBack:       {ru:"Назад", en:"Back", fr:"Retour"},
    rbTop:        {ru:"К началу главы", en:"To the start", fr:"Au début"},
    rbTopShort:   {ru:"Начало", en:"Start", fr:"Début"},
    rbPosLabel:   {ru:"Открыть содержание", en:"Open the contents", fr:"Ouvrir le sommaire"},
    qmLabel:      {ru:"Пояснение к неясному месту", en:"Note on an unclear passage", fr:"Note sur un passage obscur"},
    qmDefault:    {ru:"Место в оригинале неясно, переведено по смыслу.", en:"The passage is unclear in the original; translated by sense.", fr:"Le passage est obscur dans l'original ; traduit selon le sens."},
    // hmReadSub — теперь подпись карточки раздела «Текст» на обложке
    // (bkTabText выше задаёт заголовок) — плитки «Читать»/«Продолжить»
    // и «Содержание» с главной книги убраны этим раундом.
    hmReadSub:    {ru:"Содержание по частям", en:"Contents by part", fr:"Sommaire par partie"},
    hmGallery:    {ru:"Гравюры", en:"Engravings", fr:"Gravures"},
    hmGallerySub: {ru:"Все иллюстрации книги: {n}", en:"All the illustrations: {n}", fr:"Toutes les illustrations : {n}"},
    hmSearch:     {ru:"Поиск", en:"Search", fr:"Recherche"},
    hmSearchSub:  {ru:"По переводу, итальянскому тексту, гравюрам, именам и указателю", en:"Across the translation, the Italian text, engravings, names and index", fr:"Dans la traduction, le texte italien, les gravures, les noms et l’index"},
    hmIndex:      {ru:"Указатель", en:"Index", fr:"Index"},
    hmIndexSub:   {ru:"Предметы и имена по страницам издания 1626\u00a0года", en:"Subjects and names, by the pages of the 1626 edition", fr:"Sujets et noms, par pages de l’édition de 1626"},
    tvSub:        {ru:"Tavola delle cose notabili — указатель издания 1626 года. Цифры — страницы этого издания; ссылка открывает соответствующее место в переводе.", en:"Tavola delle cose notabili — the index of the 1626 edition. The numbers are pages of that edition; a link opens the matching place in the translation.", fr:"Tavola delle cose notabili — l’index de l’édition de 1626. Les chiffres sont les pages de cette édition ; le lien ouvre l’endroit correspondant dans la traduction."},
    tvSearchPh:   {ru:"Найти в указателе: имя, предмет…", en:"Search the index: name, subject…", fr:"Chercher dans l’index : nom, sujet…"},
    // Короткая нейтральная подпись кнопки «Найти» в капсуле указателя
    // (.ic-rbar-tvsearch), когда запрос ещё не введён — в отличие от
    // tvSearchPh (длинная подсказка, только для placeholder/aria-label поля
    // ВНУТРИ шторки поиска), эта подпись должна помещаться в узкую кнопку
    // капсулы на 390px рядом с двумя другими кнопками. Тот же короткий стиль,
    // что у nmSearchPh ("Найти имя"/"Find a name"), но без слова "имя" — тут
    // ищут и предметы, и имена.
    tvSearchBtn:  {ru:"Найти", en:"Find", fr:"Chercher"},
    // Активная метка кнопки «Найти» в новой капсуле .ic-rbar (указатель и
    // имена) — {q} подставляется как есть, без доп. кавычек/форматирования
    // (сам запрос короткий, 1-2 слова). Общий ключ для обеих страниц.
    tvSearchActive: {ru:"Найти: {q}", en:"Search: {q}", fr:"Chercher : {q}"},
    tvReset:      {ru:"Сбросить", en:"Reset", fr:"Réinitialiser"},
    tvBack:       {ru:"К книге", en:"To the book", fr:"Au livre"},
    tvSortRu:     {ru:"По алфавиту", en:"A–Z", fr:"Ordre alphabétique"},
    tvSortIt:     {ru:"Как в книге 1626 года", en:"As in the 1626 book", fr:"Comme dans le livre de 1626"},
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
    tvPrinted:    {ru:"в книге указана с. {n}", en:"the book’s own index cites p. {n}", fr:"l’index du livre indique la p. {n}"},
    hmNames:      {ru:"Имена", en:"Names", fr:"Noms"},
    hmNamesSub:   {ru:"Боги, герои, авторы, места и народы", en:"Gods, heroes, authors, places and peoples", fr:"Dieux, héros, auteurs, lieux et peuples"},
    nmSub:        {ru:"Имена из глоссария перевода. Карточка имени показывает гравюры, где оно названо, и все места перевода, где оно встречается, во всех падежах.", en:"Names from the translation glossary. A name’s page shows the engravings that name it and every place in the translation where it occurs, in any case form.", fr:"Noms du glossaire de la traduction. La fiche d’un nom montre les gravures qui le citent et tous les passages de la traduction où il apparaît, à tous les cas."},
    nmSearchPh:   {ru:"Найти имя", en:"Find a name", fr:"Chercher un nom"},
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
    plPrev:       {ru:"Предыдущая", en:"Previous", fr:"Précédente"},
    plNext:       {ru:"Следующая", en:"Next", fr:"Suivante"},
    plCount:      {ru:"Гравюра {k} из {n}", en:"Engraving {k} of {n}", fr:"Gravure {k} sur {n}"},
    plBetween:    {ru:"между с. {a} и {b}", en:"between pp. {a} and {b}", fr:"entre p. {a} et {b}"},
    plNoCap:      {ru:"У этой гравюры нет подписи в переводе.", en:"This engraving has no caption in the translation.", fr:"Cette gravure n’a pas de légende dans la traduction."},
    plEdition:    {ru:"издание\u00a01626", en:"1626\u00a0edition", fr:"édition\u00a0de\u00a01626"},
    plZoomLabel:  {ru:"Гравюра на весь экран", en:"Engraving, full screen", fr:"Gravure en plein écran"},
    srHint:       {ru:"Введите слово или имя: ищем в переводе (на русском, английском и французском), в итальянском тексте издания, в подписях гравюр, среди имён и в указателе. Можно писать и «Фортуна», и «Fortuna».", en:"Type a word or a name: we search the translation (in Russian, English and French), the Italian text of the edition, engraving captions, names and the index. «Fortuna» and «Фортуна» both work.", fr:"Saisissez un mot ou un nom : nous cherchons dans la traduction (en russe, anglais et français), le texte italien de l’édition, les légendes des gravures, les noms et l’index. « Fortuna » et « Фортуна » fonctionnent."},
    srLoading:    {ru:"Загружаю тексты…", en:"Loading the texts…", fr:"Chargement des textes…"},
    srNone:       {ru:"Ничего не найдено. Попробуйте другую форму слова или старое написание, например «Lanuuio» вместо «Lanuvio».", en:"Nothing found. Try another form of the word or an old spelling, e.g. «Lanuuio» for «Lanuvio».", fr:"Rien trouvé. Essayez une autre forme du mot ou une ancienne graphie, par exemple « Lanuuio » pour « Lanuvio »."},
    srText:       {ru:"В тексте", en:"In the text", fr:"Dans le texte"},
    srMore:       {ru:"Показать ещё {n}", en:"Show {n} more", fr:"Afficher {n} de plus"},
    srItOrig:     {ru:"итальянский текст", en:"Italian text", fr:"texte italien"},
    srPlace:      {ru:"Поиск по книге", en:"Search the book", fr:"Recherche dans le livre"},
    hmNavLabel:   {ru:"Разделы книги", en:"Book sections", fr:"Sections du livre"},
    hmCloseToc:   {ru:"Закрыть содержание", en:"Close contents", fr:"Fermer le sommaire"},
    // bkTabText — подпись вкладки «Текст» в новом общем меню книги
    // (.ic-booktabs, bookTabsHtml ниже): отдельный раздел «только содержание»
    // (tocPartsHtml без текущей главы) — не то же самое, что hmRead/hmToc
    // (прежняя плитка главной книги, убранная этим раундом), поэтому ключ
    // новый, а не повторное использование hmToc/hmRead.
    bkTabText:    {ru:"Текст", en:"Text", fr:"Texte"}
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
  // cameFromHash — хэш страницы, с которой реально пришли на ТЕКУЩУЮ:
  // пишется в обработчике hashchange ниже по e.oldURL, т.е. не зависит от
  // того, какая именно ссылка была нажата — общий для ВСЕХ переходов
  // аналог chCtx (который помнит только переходы указатель/имена/поиск/
  // гравюра → глава или карточку). Нужен уголку-назад общего меню книги
  // (bindBookBack ниже, round «nav-tabs»), чтобы решить: если предыдущий
  // шаг истории реально совпадает с родителем страницы — history.back()
  // (переход назад тем же путём, что и пришли, со штатным восстановлением
  // позиции через namesUi.pos); если нет (прямая ссылка, перезагрузка,
  // внешний переход) — обычная навигация на родителя, а не history.back()
  // в неизвестное место.
  var cameFromHash = "";
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

  // renderBackBarBrand (round «nav-tabs», решение Андрея, задание пункт 1) —
  // слева в шапке сайта теперь только «Библиотека» (имя "Andrey Stepin"
  // убрано совсем), тем же шрифтом/размером, каким оно было. Ведёт на
  // главную библиотеки — ссылка <a>; на САМОЙ главной библиотеки это не
  // ссылка, а обычный текст (span), isHome передаётся из route() (!p.slug)
  // при каждой навигации и из setLang() при смене языка. !forcedBook — та
  // же проверка, что и раньше: сборка жёстко привязана к одной книге
  // (data-book на #iconologie — конкретный слаг, не "library") — самой
  // библиотеки нет, элемент вообще не показываем.
  var backBarEl = document.querySelector(".back-bar");
  var backBarBrandIsHome = false;
  function renderBackBarBrand(isHome){
    if(isHome != null) backBarBrandIsHome = isHome;
    if(!backBarEl || forcedBook) return;
    var brand = backBarEl.querySelector(".back-bar-brand");
    if(!brand) return;
    if(backBarBrandIsHome){
      brand.innerHTML = '<span>'+esc(t("toLibrary"))+'</span>';
    } else {
      brand.innerHTML = '<a href="#/">'+esc(t("toLibrary"))+'</a>';
      brand.querySelector("a").addEventListener("click", function(ev){ ev.preventDefault(); location.hash = ""; });
    }
  }
  renderBackBarBrand(false);

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
  // «Последнее место чтения» (saveLastRead/loadLastRead/lastReadKey) — убрано
  // целиком этим раундом (задание, пункт 2): обложка больше не предлагает
  // плитку «Читать»/«Продолжить», поэтому ничего не пишет в localStorage.

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

  // Экран загрузки (до того, как книга дошла с сервера — book.json/
  // entries.json/ornaments.json/engravings.json, и до loadChapters() для
  // книг с home+chapters, который сам не меняет этот экран, пока не
  // отрендерит настоящую страницу, см. route()). Бумажная текстура — тот
  // же приём, что у .ic-home (.ic:has(.ic-loading), app.css), применённый
  // СРАЗУ, без ожидания отрисовки главной книги.
  //
  // Заголовок того, что открывается — захардкожен для Картари (книга ещё
  // не пришла, значит book.json's title нам не доступен — та же проблема
  // курицы и яйца, что раньше была с орнаментом на этом экране), плюс уже
  // переведённые ключи t("hmIndex")/t("hmNames") и статичный словарь
  // CHAP_SHORT (app.js, ниже) для тех глав, короткое название которых не
  // требует загруженных данных. hashInfo — результат parseHash(), который
  // route() уже посчитал ДО вызова openBook(); не парсим location.hash
  // здесь повторно.
  function loadingTitle(slug, hashInfo){
    var p = hashInfo || {};
    if(slug === "cartari"){
      if(!p.view || p.view === "home"){
        var book = {ru:"Образы богов древних", en:"The Images of the Gods of the Ancients", fr:"Les Images des Dieux des Anciens"};
        return {text: book[state.lang] || book.ru, cls:"ic-title"};
      }
    }
    if(p.view === "tavola") return {text: t("hmIndex"), cls:"ic-h-fr"};
    if(p.view === "names") return {text: t("hmNames"), cls:"ic-h-fr"};
    if(p.view === "chapter" && p.chapter && CHAP_SHORT[p.chapter]){
      var e = CHAP_SHORT[p.chapter];
      return {text: e[state.lang] || e.ru, cls:"ic-h-fr"};
    }
    return null;
  }
  function loadingHtml(slug, hashInfo){
    var title = loadingTitle(slug, hashInfo);
    var titleHtml = title ? '<h1 class="'+title.cls+' ic-loading-title">'+esc(title.text)+'</h1>' : "";
    var loadingLabel = t("loading").replace(/[…]+$/,"");
    return '<div class="ic-loading">'+titleHtml+
      '<div class="ic-loading-bar"><div class="ic-loading-bar-fill"></div></div>'+
      '<p class="ic-sub ic-loading-text">'+esc(loadingLabel)+'</p></div>';
  }
  // Реальный прогресс загрузки (байтовый режим) или честная имитация
  // (временной режим) — см. комментарий у trackedFetch() ниже про выбор
  // режима. progress в обоих режимах выражается долей [0..1] и пишется в
  // CSS-переменную --loading-progress на самом .ic-loading (app.css читает
  // её как ширину заливки), не чаще раза на requestAnimationFrame.
  function openBook(slug, hashInfo, cb){
    if(books[slug] !== undefined){ cb(books[slug]==="error" ? null : books[slug]); return; }
    root.innerHTML = loadingHtml(slug, hashInfo);
    // Если экран загрузки держится дольше 8с — скорее всего медленная связь,
    // меняем текст на подсказку об этом. loadGen пришпилен к renderGen на
    // момент показа экрана (тот же сквозной паттерн отмены устаревших
    // колбэков, что и везде в файле); textEl.isConnected — дополнительная
    // защита: даже без новой навигации (gen не изменился) контент мог
    // успеть отрендериться по-настоящему к этому моменту, и этот элемент
    // уже не в DOM — тогда таймер не должен ничего трогать.
    var loadGen = renderGen;
    var textEl = root.querySelector(".ic-loading-text");
    var loadingEl = root.querySelector(".ic-loading");
    setTimeout(function(){
      if(renderGen !== loadGen || !textEl || !textEl.isConnected) return;
      textEl.textContent = t("slowConn");
    }, 8000);

    var progressMode = null; // "bytes" | "time", решается один раз, по book.json (см. ниже)
    var rafPending = false, pendingFrac = 0, shownFrac = 0;
    // Монотонный храповик: полоса никогда не двигается назад, только вперёд,
    // до самого finishProgress() — подстраховка поверх двухэтапной схемы
    // ниже (которая и так не должна давать обратных скачков, но лишняя
    // защита от дребезга в крайних случаях не повредит).
    function setProgress(frac){
      shownFrac = Math.max(shownFrac, Math.max(0, Math.min(1, frac)));
      pendingFrac = shownFrac;
      if(rafPending) return;
      rafPending = true;
      requestAnimationFrame(function(){
        rafPending = false;
        if(renderGen !== loadGen || !loadingEl || !loadingEl.isConnected) return;
        loadingEl.style.setProperty("--loading-progress", pendingFrac);
      });
    }
    function setProgressNow(frac){
      if(renderGen !== loadGen || !loadingEl || !loadingEl.isConnected) return;
      loadingEl.style.setProperty("--loading-progress", Math.max(0, Math.min(1, frac)));
    }
    var timeRaf = null;
    function startTimeFallback(){
      progressMode = "time";
      var start = Date.now();
      (function tick(){
        if(renderGen !== loadGen) return;
        var elapsed = Date.now() - start;
        // плавное приближение к 90%, никогда не достигая его само по себе —
        // рывок до 100% делает finishProgress() по факту реального завершения.
        setProgress(0.9 * (1 - Math.exp(-elapsed/1800)));
        timeRaf = requestAnimationFrame(tick);
      })();
    }
    function finishProgress(){
      if(timeRaf){ cancelAnimationFrame(timeRaf); timeRaf = null; }
      setProgressNow(1);
    }
    // Байтовый режим — в два этапа, а не единым totalLoaded/totalExpected на
    // всю загрузку: book.json (этап A) разбирается РАНЬШЕ, чем известно,
    // сколько ещё запросов (entries/ornaments/engravings) вообще будет
    // сделано — его знаменатель поэтому временно "весь мир", и голый
    // totalLoaded/totalExpected показал бы ложные ~100% на этом файле одном,
    // а затем заметно откатился бы назад, когда остальные запросы добавили
    // бы свой вес. Этап A получает маленькую фиксированную долю шкалы
    // (STAGE_A_SHARE); этап B (entries + опционально ornaments/engravings/
    // engraving_map, все параллельно через Promise.all) ждёт, пока придут
    // ЗАГОЛОВКИ (Content-Length) ВСЕХ его участников — их количество уже
    // известно синхронно до того, как они запущены (см. вызов ниже) — и
    // только тогда начинает показывать настоящее отношение байт; до этого
    // момента полоса просто держится на границе этапа A, без ложных скачков.
    var STAGE_A_SHARE = 0.08;
    var stageAExpected = 0, stageALoaded = 0;
    var stageBHeadersExpected = 0, stageBHeadersSeen = 0, stageBReady = false;
    var stageBExpected = 0, stageBLoaded = 0;
    function reportStageA(){
      if(stageAExpected > 0) setProgress(Math.min(STAGE_A_SHARE, (stageALoaded/stageAExpected) * STAGE_A_SHARE));
    }
    function reportStageB(){
      if(!stageBReady || stageBExpected <= 0) return;
      var span = 0.95 - STAGE_A_SHARE;
      setProgress(STAGE_A_SHARE + Math.min(span, (stageBLoaded/stageBExpected) * span));
    }
    // Читает тело ответа порциями (ReadableStream), суммируя реально пришедшие
    // байты в loadedRef (этапный счётчик, через колбэк onChunk) по мере
    // прихода каждого чанка — не чаще раза на requestAnimationFrame (см.
    // setProgress/report* выше).
    function readWithProgress(r, onChunk){
      var reader = r.body.getReader(), chunks = [];
      function pump(){
        return reader.read().then(function(res){
          if(res.done){
            var blob = new Blob(chunks);
            return blob.text();
          }
          chunks.push(res.value);
          onChunk(res.value.length);
          return pump();
        });
      }
      return pump().then(function(txt){ return JSON.parse(txt); });
    }
    // role: "book" (этап A, тоже решает байтовый/временной режим — один раз,
    // дальше не пересматривается) | "stageB" (entries/ornaments/engravings).
    function trackedFetch(url, role){
      return fetch(url,{cache:"no-cache"}).then(function(r){
        if(!r.ok){
          // Даже отказ (404 и т.п.) засчитывается как "заголовок пришёл" для
          // этапа B — иначе опциональный ornaments/engravings-запрос, которому
          // и так предстоит .catch() у вызывающего кода, навсегда заблокировал
          // бы stageBReady (счётчик никогда не дотянется до ожидаемого числа).
          if(role === "stageB") stageBHeadersSeen++;
          throw 0;
        }
        if(role === "book"){
          var len = parseInt(r.headers.get("Content-Length"), 10);
          if(isFinite(len) && len > 0 && r.body && r.body.getReader){
            progressMode = "bytes";
            stageAExpected = len;
            return readWithProgress(r, function(n){ stageALoaded += n; reportStageA(); });
          }
          startTimeFallback();
          return r.json();
        }
        // stageB
        stageBHeadersSeen++;
        if(progressMode === "bytes" && r.body && r.body.getReader){
          var len2 = parseInt(r.headers.get("Content-Length"), 10);
          if(isFinite(len2) && len2 > 0){
            stageBExpected += len2;
            if(stageBHeadersSeen >= stageBHeadersExpected){ stageBReady = true; reportStageB(); }
            return readWithProgress(r, function(n){ stageBLoaded += n; reportStageB(); });
          }
        }
        if(stageBHeadersSeen >= stageBHeadersExpected){ stageBReady = true; reportStageB(); }
        return r.json();
      });
    }

    trackedFetch(BASE+"books/"+slug+"/book.json", "book")
      .then(function(meta){
        var ornCfg = meta.ornaments;
        var ornSlug = (ornCfg && ornCfg.enabled) ? (ornCfg.source || slug) : null;
        // Количество запросов этапа B известно здесь, синхронно, ДО того,
        // как они запущены ниже — этим и пользуется stageBReady выше.
        stageBHeadersExpected = 1 + (ornSlug ? 3 : 0);
        return Promise.all([
          Promise.resolve(meta),
          trackedFetch(BASE+"books/"+slug+"/entries.json", "stageB"),
          ornSlug ? trackedFetch(BASE+"books/"+ornSlug+"/ornaments.json", "stageB").catch(function(){ return []; })
            : Promise.resolve(null),
          ornSlug ? Promise.all([
              trackedFetch(BASE+"books/"+ornSlug+"/engravings.json", "stageB").catch(function(){ return []; }),
              trackedFetch(BASE+"books/"+ornSlug+"/engraving_map.json", "stageB").catch(function(){ return {}; })
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
      finishProgress();
      // Плавный переход к настоящему контенту без мигания: root (сам .ic,
      // несущий бумажную текстуру — она не меняется между экранами, поэтому
      // не дёргается) уходит в opacity:0 ПЕРЕД заменой innerHTML, cb(book)
      // синхронно подменяет содержимое (экран загрузки вместе с ним), и уже
      // после этого двойной requestAnimationFrame включает CSS-переход
      // обратно в opacity:1 за .25с — тот же приём, что nudgeRepaint()
      // использует для форс-reflow, только здесь ещё и с анимацией.
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduced){
        cb(book);
      } else {
        root.style.transition = "none";
        root.style.opacity = "0";
        cb(book);
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            root.style.transition = "opacity .25s ease";
            root.style.opacity = "1";
          });
        });
      }
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
  // Форматы адреса: "#/<slug>/<id>" — карточка; "#/<slug>" — указатель книги
  // (или обложка — "#/<slug>" без суффикса, книги с book.json home: пять
  // самостоятельных разделов, задание этого раунда, пункт 1-2);
  // "#/<slug>/about" — страница «О книге»; "#/<slug>/find" — указатель
  // карточек книги с главной (там "#/<slug>" ведёт на обложку);
  // "#/<slug>/text" — содержание по частям; "#/<slug>/plates" — все гравюры
  // сеткой по главам; "#/<slug>/search" — поиск по книге;
  // "#/<slug>/home[/gallery|search]" — ЛЕГАСИ, редирект на обложку/plates/
  // search (route() ниже) — сохранённые/расшаренные ссылки до этого раунда;
  // "#/<slug>/ch/<глава>[/<блок>]" — глава русского перевода (только книги с
  // book.json chapters); "#/<slug>/plate/<n>" — просмотр таблицы целиком с
  // номерами (только для книг с book.json viewer:"plate");
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
    if(rest[0]==="text") return {slug:slug, view:"text"};
    if(rest[0]==="plates") return {slug:slug, view:"plates"};
    if(rest[0]==="search") return {slug:slug, view:"search"};
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
    return coverHref(book);
  }

  function route(){
    renderGen++;
    if(activeSheetClose){ activeSheetClose(); }
    if(sv) sv.close();
    var p = parseHash(), gen = renderGen;
    renderBackBarBrand(!p.slug);
    // .back-bar-fixed/.ic-booktabs-fixed (index.html/app.css) — фикс
    // мигания sticky при частых программных scrollTo в жесте по рейлу букв
    // (указатель/«Имена») — убран этим раундом вместе с position:fixed у
    // .ic-rbar-tv (см. комментарий там же в app.css): рейл теперь троттлится
    // через rAF (wireAzRail/frame), и отдельный position:fixed сверху для
    // той же цели больше не нужен — указатель/«Имена» живут на том же
    // обычном sticky, что и читалка главы, без исключений.
    if(!p.slug){ renderLibraryHome(); return; }
    openBook(p.slug, p, function(book){
      if(!book){ if(!forcedBook) renderLibraryHome(); return; }
      var isPlateBook = book.meta.viewer==="plate";
      var hasHome = !!(book.meta.home && book.meta.chapters);
      // Legacy #/<slug>/home[,/gallery,/search] -> новые адреса обложки/
      // разделов (задание, пункт 6 и пункт 2): обложка теперь сам базовый
      // адрес книги без суффикса ("/home" больше не самостоятельный
      // маршрут — только редирект для старых сохранённых/расшаренных ссылок).
      if(hasHome && p.view==="home"){
        if(p.tab==="gallery"){ location.replace(hrefFor(book, "plates")); return; }
        if(p.tab==="search"){ location.replace(hrefFor(book, "search")); return; }
        location.replace(coverHref(book)); return;
      }
      if(hasHome && p.view==="find"){ location.replace(hrefFor(book, "search")); return; }
      if(hasHome && p.id && book.chap===undefined){ loadChapters(book, function(){ if(gen===renderGen) route(); }); return; }
      if(hasHome && p.id && book.chap && book.chap.pl.byOld[p.id]){ location.replace(hrefFor(book, "plate/"+book.chap.pl.byOld[p.id])); return; }
      if(hasHome && p.id){ location.replace(legacyHref(book, p.id)); return; }
      if(hasHome && !p.id && !p.view) renderHome(book);
      else if(p.view==="text" && hasHome) renderBookText(book);
      else if(p.view==="plates" && hasHome) renderBookPlates(book);
      else if(p.view==="search" && hasHome) renderBookSearch(book);
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
  // cameFromHash/pagePos (см. var cameFromHash выше и namesUi.pos ниже) —
  // ОДНА точка перехвата на ЛЮБОЙ переход хэша, а не ручная расстановка в
  // каждом обработчике клика (round «sheets-dark», задание часть 3): к
  // моменту этого события location.hash уже новый, но window.scrollY ещё
  // старый (страница не перерисована — route() вызывается ниже, синхронно
  // внутри этого же обработчика) — e.oldURL хэшчендж-события даёт тот самый
  // хэш, с которого ушли, без необходимости помнить его отдельно на каждой
  // ссылке. namesUi.pos — тот же словарь «позиция на странице X», который
  // этот файл уже использует точечно для указателя/имён/гравюр/поиска —
  // здесь просто пишется для ЛЮБОГО хэша единообразно.
  window.addEventListener("hashchange", function(e){
    var oldHash = "#"+(e.oldURL.split("#")[1]||"");
    namesUi.pos[oldHash] = window.scrollY;
    cameFromHash = oldHash;
    route();
  });
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
    if(book.meta.home && book.meta.chapters) location.hash = hrefFor(book, "search");
    else location.hash = forcedBook ? "" : "#/"+book.slug;
  }
  function hrefFor(book, suffix){ return forcedBook ? "#/"+suffix : "#/"+book.slug+"/"+suffix; }
  // coverHref — базовый адрес книги без суффикса (обложка), задание пункт 2:
  // раньше это был hrefFor(book,"home") с собственным маршрутом "/home";
  // теперь "/home" — только редирект на старые ссылки (route() ниже), сама
  // обложка — пустой путь книги.
  function coverHref(book){ return forcedBook ? "#/" : "#/"+book.slug; }
  // Уголок-«назад» и лупа общего меню книги (round «nav-tabs», решение
  // Андрея) — тонкие SVG-иконки без заливки, currentColor (наследуют цвет
  // кнопки, см. app.css .ic-bt-back/.ic-bt-search).
  var ICON_BACK = '<svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true"><path d="M9.5 2 2.5 9l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_SEARCH = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.6" stroke="currentColor" stroke-width="1.7"/><line x1="12.7" y1="12.7" x2="17.3" y2="17.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  // bookTabsHtml — общее меню книги (round «nav-tabs», решение Андрея):
  // уголок-назад слева, вкладки «Текст · Гравюры · Указатель · Имена»
  // посередине (без «Поиска» — страница #/<slug>/search остаётся для
  // прямых ссылок, но в этом меню больше не вкладка), лупа справа —
  // открывает тёмную шторку полнотекстового поиска ПРЯМО ЗДЕСЬ, на любой
  // странице книги (bindBookSearchSheet ниже), а не уводит на отдельную
  // страницу. ОДНО и то же на каждой странице книги — вызывается из каждой
  // render*-функции, не дублирует разметку.
  // activeSect — один из "text"/"plates"/"index"/"names": глава и карточка
  // гравюры/имени передают "text"/"plates"/"names" соответственно
  // (относятся к этим разделам, даже когда location.hash не совпадает
  // буквально с адресом самого раздела) — см. вызовы в renderChapter/
  // renderPlateCard/renderNameCard.
  // backOpts — {parentHref, ctxTypes, hide}: parentHref — структурный
  // родитель (куда ведёт уголок, если не сработал более точный переход по
  // ctxTypes — см. ctxActiveFor/bindBookBack ниже); hide — true только на
  // обложке в режиме forcedBook (одна книга без самой библиотеки — вести
  // назад некуда).
  // id="ic-booktabs" — общий якорь для installScrollHide (прячется вместе с
  // .back-bar, см. его комментарий) и для headerStackH()/syncHeaderStack()
  // выше (высота меню книги, которую строка раздела и столбик букв держат в
  // своих статичных отступах).
  function bookTabsHtml(book, activeSect, backOpts){
    backOpts = backOpts || {};
    var tabs = [["text", t("bkTabText")], ["plates", t("hmGallery")]];
    if(book.meta.tavola) tabs.push(["index", t("hmIndex")]);
    if(book.meta.names) tabs.push(["names", t("hmNames")]);
    var backActive = backOpts.ctxTypes ? ctxActiveFor(backOpts.ctxTypes) : false;
    var backHref = backOpts.parentHref || coverHref(book);
    var backBtn = backOpts.hide ? "" :
      '<button type="button" class="ic-bt-back" data-rb="back" data-active="'+(backActive?"1":"0")+'" data-fallback-href="'+esc(backHref)+'" aria-label="'+esc(t("rbBack"))+'">'+ICON_BACK+'</button>';
    // Лупа — только у книг с «домашней» страницей (book.meta.home), т.е.
    // ровно там, где вообще есть страница #/<slug>/search, на которую она
    // ссылается по смыслу (как раньше ячейка «Поиск»/вкладка «Поиск»).
    var searchBtn = book.meta.home
      ? '<button type="button" class="ic-bt-search" data-rb="booksearch" aria-pressed="false" aria-label="'+esc(t("hmSearch"))+'">'+ICON_SEARCH+'</button>'
      : "";
    return '<nav class="ic-booktabs" id="ic-booktabs" aria-label="'+esc(t("hmNavLabel"))+'">'+
      backBtn+
      '<div class="ic-bt-tabs">'+tabs.map(function(x){
        // .ic-bt-label — см. предыдущие раунды: подпись в своём span,
        // сжимается до ширины текста, подчёркивание/плашка активной
        // вкладки (app.css) — ровно по её ширине.
        return '<a href="'+esc(hrefFor(book, x[0]))+'" class="'+(activeSect===x[0]?"on":"")+'"><span class="ic-bt-label">'+esc(x[1])+'</span></a>';
      }).join("")+'</div>'+
      searchBtn+
      (book.meta.home ? bookSearchSheetHtml(book) : "")+
    '</nav>';
  }
  // bookSearchSheetHtml — тёмная шторка полнотекстового поиска (та же
  // разметка/контракт, что ждёт wireBookSearch на отдельной странице
  // #/<slug>/search — форма .ic-home-search + соседний div.ic-sr),
  // ВЛОЖЕНА внутрь .ic-booktabs (а не .ic-rbar, как раньше, когда поиск
  // был ячейкой капсулы читалки) — тот же приём "position:absolute;top:
  // 100% от ближайшего позиционированного предка", но предок теперь общее
  // меню книги, которое есть на КАЖДОЙ странице (round «nav-tabs»).
  function bookSearchSheetHtml(book){
    return '<div class="ic-rb-sheet" id="ic-rb-sheet">'+
        '<div class="ic-rb-sheet-slide">'+
          '<div class="ic-rb-sheet-panel">'+
            '<div class="ic-rb-sheet-head">'+
              '<form class="ic-home-search" role="search">'+
                '<span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srPlace"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srPlace"))+'">'+
                '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
              '</form>'+
              '<button type="button" class="ic-rb-sheet-close">'+esc(t("close"))+'</button>'+
            '</div>'+
            '<div class="ic-sr" aria-live="polite"></div>'+
          '</div>'+
        '</div>'+
      '</div>';
  }
  // bindBookBack — уголок-назад (единый на каждой странице книги, round
  // «nav-tabs»): data-active="1" (chCtx реально привёл именно сюда, см.
  // ctxActiveFor/CHAP_CTX_TYPES/CARD_CTX_TYPES ниже) — history.back()
  // безусловно (возврат туда, откуда пришли, тем же путём, со штатным
  // восстановлением позиции браузером/namesUi.pos); иначе — на структурный
  // родитель (data-fallback-href), через history.back(), если реальный
  // предыдущий хэш (cameFromHash) совпадает с ним, иначе обычная навигация.
  function bindBookBack(root){
    var btn = root.querySelector('[data-rb="back"]');
    if(!btn) return;
    btn.addEventListener("click",function(){
      if(btn.getAttribute("data-active")==="1"){ history.back(); return; }
      var target = btn.getAttribute("data-fallback-href");
      if(cameFromHash && cameFromHash === target) history.back();
      else location.hash = target.replace(/^#/,"");
    });
  }
  // bindBookSearchSheet — лупа общего меню книги (round «nav-tabs»):
  // открывает/закрывает ту же тёмную шторку, что раньше была ячейкой
  // «Поиск» капсулы читалки (makeRbSheet — тот же общий хелпер, см. его
  // определение у installScrollHide выше; wireBookSearch — тот же
  // контракт, что и на отдельной странице #/<slug>/search). rbSheets —
  // ОБЩИЙ на страницу регистр шторок (его же использует страница для
  // своих ячеек «Содержание»/«Тип» и т.п., см. вызовы в соответствующих
  // render*-функциях) — чтобы единое затемнение (#ic-rb-dim) и взаимное
  // исключение шторок работали одинаково, какая бы из них ни открылась.
  function bindBookSearchSheet(root, book, gen, rbSheets){
    var btn = root.querySelector('[data-rb="booksearch"]'), sheetEl = root.querySelector("#ic-rb-sheet");
    if(!btn || !sheetEl) return null;
    var sheetForm = sheetEl.querySelector(".ic-home-search"), sheetInput = sheetForm.querySelector(".ic-search");
    var sheetApi = makeRbSheet(sheetEl, btn, {
      registry: rbSheets,
      onOpen: function(presetQuery){
        if(presetQuery != null){ sheetInput.value = presetQuery; sheetInput.dispatchEvent(new Event("input",{bubbles:true})); }
        if(window.matchMedia && window.matchMedia("(pointer:fine)").matches) sheetInput.focus({preventScroll:true});
      },
      onClose: function(){ sheetInput.blur(); }
    });
    wireBookSearch(book, sheetForm, sheetEl.querySelector(".ic-sr"), gen, 0);
    sheetEl.querySelector(".ic-sr").addEventListener("click", function(e){
      var a = e.target.closest("a");
      if(a && /\/ch\//.test(a.getAttribute("href")||"")) searchReopen = {hash: location.hash, query: sheetInput.value};
    });
    btn.addEventListener("click", function(){ sheetApi.toggle(); });
    return sheetApi;
  }
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
  // restoreOrTop — тот же словарь namesUi.pos, что указатель/имена/гравюры/
  // поиск уже используют точечно для своих собственных переходов, но здесь
  // общая точка для ЛЮБОЙ страницы книги: позиция пишется один раз,
  // централизованно, в обработчике hashchange (см. его комментарий выше)
  // для КАЖДОГО перехода — так что к возврату уголком-назад (bindBookBack)
  // запись уже есть для любой страницы.
  function restoreOrTop(gen){
    var y = namesUi.pos[location.hash];
    if(y!=null){
      delete namesUi.pos[location.hash];
      requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); });
    } else toTop(true);
  }
  // WebKit (в т.ч. iPadOS) иногда не перерисовывает position:sticky после замены
  // innerHTML на SPA-переходе — элемент «застревает» в старом положении/размере.
  // Небольшой форс-reflow после каждого рендера чинит это без видимого мигания.
  function nudgeRepaint(){
    requestAnimationFrame(function(){ window.scrollTo(window.scrollX, window.scrollY); });
  }

  /* ---------- «пришли сюда»: единая подсветка места перехода ----------
     Раньше это была заливка всего абзаца (.ic-ch-hl) — читалась как
     перманентное пятно, которое к тому же никогда не гасло у обычного
     перехода (гасло только у flash() указателя, резко, через 2.2с). Теперь
     везде один и тот же эффект: тонкая серая черта на левом поле (у всей
     высоты блока-цели — hlMark ставит её ВНУТРЬ самого блока, через
     position:relative на нём; у диапазона страницы без найденного блока —
     через reposition() по границам всех блоков диапазона, см. renderChapter)
     + если известна позиция слова, уже вплетённое в разметку подчёркивание
     (.ic-ch-mark, см. inl()/blockHtml()) — и то, и другое гаснет через
     HL_FADE_AFTER одной и той же CSS-transition по opacity (app.css), без
     каких-либо изменений геометрии/отступов. */
  var HL_FADE_AFTER = 3000, HL_FADE_MS = 2500;
  var HL_FADE_STATIC = 3500; // prefers-reduced-motion: без анимации, держится статично, потом убирается
  function hlMark(container, label){
    var cs = getComputedStyle(container);
    if(cs.position === "static") container.style.position = "relative";
    var el = document.createElement("div");
    el.className = "ic-hl-mark"; el.setAttribute("aria-hidden","true");
    if(label) el.setAttribute("data-pg", label);
    container.appendChild(el);
    return el;
  }
  function unwrapEl(el){
    var p = el && el.parentNode; if(!p) return;
    while(el.firstChild) p.insertBefore(el.firstChild, el);
    p.removeChild(el);
  }
  // markEl — созданная hlMark() маргинальная черта (или null); wordEls —
  // массив .ic-ch-mark подчёркиваний слова (или пусто) — оба угасают и
  // убираются из DOM синхронно, одной и той же задержкой.
  function hlFadeOut(markEl, wordEls, gen){
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){
      // Без opacity-transition вовсе: заливка просто есть HL_FADE_STATIC
      // мс статично, потом убирается одним прыжком — никакого fade.
      setTimeout(function(){
        if(gen !== undefined && gen !== renderGen) return;
        if(markEl && markEl.parentNode) markEl.parentNode.removeChild(markEl);
        (wordEls||[]).forEach(unwrapEl);
      }, HL_FADE_STATIC);
      return;
    }
    setTimeout(function(){
      if(gen !== undefined && gen !== renderGen) return;
      if(markEl) markEl.classList.add("ic-hl-fading");
      (wordEls||[]).forEach(function(w){ w.classList.add("ic-hl-fading"); });
      setTimeout(function(){
        if(markEl && markEl.parentNode) markEl.parentNode.removeChild(markEl);
        (wordEls||[]).forEach(unwrapEl);
      }, HL_FADE_MS);
    }, HL_FADE_AFTER);
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

  // Общий механизм показа/скрытия шапки сайта (.back-bar) + меню книги
  // (.ic-booktabs) по направлению прокрутки — единым движением, в один и тот
  // же тик, тем же классом "ic-bb-hidden" на обоих элементах (они уже
  // существовали отдельно: .back-bar — в index.html, .ic-booktabs — рендерит
  // bookTabsHtml ниже; одинаковая transition в app.css даёт одно визуальное
  // движение без рассинхрона). Round (этот раунд, задание пункт 5):
  // двухуровневая схема — строка раздела (капсула .ic-rbar/.ic-rbar-tv),
  // если она есть на странице, больше НЕ прячется вовсе (статична,
  // position:sticky/fixed;top:var(--top2)) — поэтому функция больше не
  // принимает panelEl/hiddenClass для какой-то третьей панели, только
  // .back-bar+.ic-booktabs. Вызывается на КАЖДОЙ странице книги (не только
  // там, где есть строка раздела) — на страницах без строки раздела (обложка,
  // текст, гравюры, карточка гравюры, поиск) это и даёт «уезжает/
  // возвращается всё целиком» (задание, пункт 5).
  // opts.isActive — функция-страж (gen===renderGen у вызывающей стороны):
  // как только она вернёт false, цикл останавливается и снимает класс
  // скрытия, не оставляя шапку предыдущего рендера скрытой навсегда.
  // opts.onTick — необязательная работа на каждый кадр ПОКА активно (paintPg
  // у читалки). opts.suppress — необязательная функция: пока возвращает
  // true, шапка+вкладки всегда показаны и накопители сбрасываются (когда
  // открыта/анимируется шторка поиска/содержания/сортировки).
  // opts.minToggleGap (этот раунд, задание пункт 1 — «не больше одного
  // переключения за 400мс», сейчас используется только главой) — после
  // ФАКТИЧЕСКОГО переключения (не каждого тика!) следующее игнорируется,
  // пока не пройдёт этот интервал; счётчики down/up продолжают копиться как
  // обычно, так что по истечении паузы применяется актуальное на тот момент
  // направление, а не замороженное на момент последнего переключения.
  function installScrollHide(opts){
    opts = opts || {};
    var hideAt = opts.hideAt != null ? opts.hideAt : 26, showAt = opts.showAt != null ? opts.showAt : 10;
    var topGuard = opts.topGuard != null ? opts.topGuard : 36, bottomGuard = opts.bottomGuard != null ? opts.bottomGuard : 160;
    var minToggleGap = opts.minToggleGap != null ? opts.minToggleGap : 0;
    var lastY = window.scrollY, down = 0, up = 0, hidden = false, curHidden = false, lastToggleAt = 0;
    function setHidden(v){
      curHidden = v;
      var bbar = document.querySelector(".back-bar");
      if(bbar) bbar.classList.toggle("ic-bb-hidden", v);
      var bt = document.getElementById("ic-booktabs");
      if(bt) bt.classList.toggle("ic-bb-hidden", v);
      // Строка раздела (.ic-rbar, читалка главы — указатель/«Имена» этим
      // раундом сюда вообще не заходят, installScrollHide там не
      // устанавливается, см. задание пункт 1/renderTavola/renderNames)
      // прячется вслед за шапкой+меню книги — в тот же тик, тем же v —
      // снапом к top:0 (+safe-area), а не статичным var(--top2), как раньше.
      var rb = document.getElementById("ic-rbar");
      if(rb) rb.classList.toggle("ic-rbar-snap", v);
      var rail = document.querySelector(".ic-az-rail");
      if(rail) rail.classList.toggle("ic-az-rail-snap", v);
    }
    function tick(){
      if(opts.isActive && !opts.isActive()){ if(curHidden) setHidden(false); return; }
      var y = window.scrollY, dy = y - lastY; lastY = y;
      var doc = document.documentElement;
      var nearTop = y < topGuard, nearBottom = (doc.scrollHeight - (y + window.innerHeight)) < bottomGuard;
      // Резиновый отскок iOS (scrollY < 0 или дальше конца документа) —
      // этот раунд, задание пункт 1: Safari на границах страницы на кадр-два
      // отдаёт y вне [0, max], с рывком dy, который иначе читался бы как
      // настоящая прокрутка и мог бы переключить видимость на самом краю
      // жеста. Полностью игнорируем такой тик — не трогаем ни счётчики, ни
      // hidden, просто ждём кадра с нормальным y (как при suppress).
      var overscroll = y < 0 || (y + window.innerHeight) > doc.scrollHeight + 0.5;
      if(overscroll){ /* no-op этот тик */ }
      else if(opts.suppress && opts.suppress()){ hidden = false; down = 0; up = 0; }
      else if(nearTop || nearBottom){ hidden = false; down = 0; up = 0; }
      else if(dy > 0.5){ down += dy; up = 0; if(down > hideAt) hidden = true; }
      else if(dy < -0.5){ up += -dy; down = 0; if(up > showAt) hidden = false; }
      if(hidden !== curHidden){
        var now = performance.now();
        if(now - lastToggleAt >= minToggleGap){ lastToggleAt = now; setHidden(hidden); }
      }
      if(opts.onTick) opts.onTick();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // installBookHide — ОДНА общая функция прятания шапки для всех страниц
  // книги, где она прячется (глава, Текст, Гравюры, Поиск, обложка, карточка
  // имени); указатель/«Имена» её не вызывают. Прячется весь .ic-stack
  // (шапка+вкладки+строка раздела) одним transform/transition: translateY(
  // −(высота шапки+вкладок)), так что строка раздела (если есть) оказывается
  // у верха экрана, без отдельной логики для неё. Спокойные пороги: вниз ≥80px,
  // вверх ≥40px подряд, не чаще раза в 400мс; тики с scrollY<0, scrollY>maxScroll
  // (резиновый отскок iOS) и с расстоянием до конца страницы <2px полностью
  // игнорируются (ни счётчиков, ни lastY не трогаем). У верха (<36px) —
  // всегда показана; у нижнего края сама НЕ возвращается.
  // opts: isActive, suppress (держит шапку показанной), onTick.
  function installBookHide(opts){
    opts = opts || {};
    var HIDE_AT = 80, SHOW_AT = 40, GAP = 400, TOP_GUARD = 36, END_EPS = 2;
    var lastY = window.scrollY, down = 0, up = 0, want = false, cur = false, lastToggleAt = -1e9;
    function setHidden(v){
      var st = document.getElementById("ic-stack");
      cur = v;
      if(!st) return;
      if(v){
        var bb = st.querySelector(".back-bar"), bt = document.getElementById("ic-booktabs");
        st.style.setProperty("--ic-stack-hide", ((bb ? bb.offsetHeight : 0) + (bt ? bt.offsetHeight : 0))+"px");
      }
      st.classList.toggle("ic-stack-hidden", v);
    }
    function tick(){
      if(opts.isActive && !opts.isActive()){ if(cur) setHidden(false); return; }
      var y = window.scrollY, doc = document.documentElement;
      var maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
      if(y < 0 || y > maxY || (maxY - y) < END_EPS){ /* отскок/самый край — тик игнорируем */ }
      else {
        var dy = y - lastY; lastY = y;
        if(opts.suppress && opts.suppress()){ want = false; down = 0; up = 0; }
        else if(y < TOP_GUARD){ want = false; down = 0; up = 0; }
        else if(dy > 0.5){ down += dy; up = 0; if(down >= HIDE_AT) want = true; }
        else if(dy < -0.5){ up += -dy; down = 0; if(up >= SHOW_AT) want = false; }
      }
      if(want !== cur){
        var now = performance.now();
        if(now - lastToggleAt >= GAP){ lastToggleAt = now; setHidden(want); }
      }
      if(opts.onTick) opts.onTick();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // showBarsAlways — этот раунд (задание, пункт 1): указатель/«Имена»
  // installScrollHide вообще не вызывают — шапка+меню книги+строка раздела
  // там всегда на месте, единым неподвижным блоком (решение Андрея, см.
  // задание). Но .back-bar живёт вне root (index.html) и переживает смену
  // страниц — если читатель пришёл сюда СО страницы, где шапка была спрятана
  // прокруткой (например, из главы), класс ic-bb-hidden иначе остался бы
  // висеть на ней навсегда (тикать здесь некому, он снимается только внутри
  // installScrollHide). .ic-booktabs/.ic-rbar/.ic-az-rail каждый раз
  // пересобираются заново через root.innerHTML — свежая разметка и так без
  // этих классов, сбрасывать нечего.
  function showBarsAlways(){
    var bbar = document.querySelector(".back-bar");
    if(bbar) bbar.classList.remove("ic-bb-hidden");
  }

  // --ic-sheet-maxh — Round (баг «шторка выезжает под адресной строкой
  // настоящего iOS Safari, без шапки/панели над собой»): раньше ВЕСЬ расчёт
  // позиции выезжающей панели (.ic-rb-sheet) делал JS, одним снимком
  // getBoundingClientRect() в момент открытия (см. бывший setIcTopH) — на
  // настоящем устройстве адресная строка Safari прячется/появляется на
  // лету, и этот снимок тут же мог оказаться неверным, особенно если сама
  // капсула .ic-rbar только начала анимированно показываться. Теперь top
  // панели — ЧИСТЫЙ CSS: .ic-rb-sheet вложена ВНУТРЬ .ic-rbar (а не рядом, в
  // .ic-ch-outer) и выставлена position:absolute;top:100% — .ic-rbar уже
  // position:sticky (а значит «positioned» по спецификации), и этого
  // достаточно, чтобы быть containing block для абсолютных потомков без
  // всякого JS, на КАЖДЫЙ кадр, включая кадры собственной transform-
  // анимации капсулы (проверено в WebKit — см. отчёт). JS здесь остаётся
  // только для ОГРАНИЧЕНИЯ высоты (не позиции!): containing block панели —
  // сама капсула, у неё нет понятия «сколько места осталось до низа
  // ВИДИМОЙ области», а чистый dvh тоже не решает (не знает, где именно
  // начинается панель). window.visualViewport.height — единственный номер,
  // который меняется СИНХРОННО с показом/скрытием адресной строки, в
  // отличие от window.innerHeight; пересчитывается на его resize/scroll
  // (см. слушатели у syncTopVar выше), а не разовым снимком при открытии —
  // поэтому даже если адресная строка дёрнется ПОСРЕДИ анимации, max-height
  // подстроится по факту события, а не останется замороженным неверным
  // числом.
  function updateSheetMaxH(){
    var rbar = document.getElementById("ic-rbar");
    var vv = window.visualViewport;
    var vh = vv ? vv.height : window.innerHeight;
    // rbar.getBoundingClientRect().bottom НЕНАДЁЖЕН именно в тот момент,
    // когда он нужнее всего: open() зовёт showBarsForced() (снимает класс
    // ic-bb-hidden с .back-bar/.ic-booktabs синхронно), а СРАЗУ ЗА ним — эту
    // функцию, в том же тике, ДО того как CSS transition transform шапки+
    // меню книги успеет продвинуться хоть на кадр — rect.bottom в этот
    // момент ещё отражает СКРЫТУЮ позицию (тот же класс гонки, что был у
    // бывшего --ic-topH, просто теперь из-за собственной транзишен шапки,
    // а не адресной строки Safari). Сама капсула .ic-rbar этим раундом
    // больше не прячется вовсе (см. задание, пункт 5) — rect.bottom её
    // высоты эта гонка не касается, только позиция элементов НАД ней.
    // transform — это только позиция, высоту (rect.height) он не меняет, поэтому низ
    // капсулы «в покое» можно посчитать без оглядки на анимацию: headerStackH()
    // (--top сайта + реальная высота .ic-booktabs — её sticky-отступ, то же
    // число, что и у натурального потока при scrollY=0, т.к. .ic-rbar идёт
    // сразу за .ic-booktabs/.back-bar) + собственная высота капсулы.
    // Round «nav-tabs»: шторка поиска теперь вложена в .ic-booktabs (не
    // .ic-rbar) и есть на страницах БЕЗ строки раздела вовсе — там .ic-rbar
    // нет, и низ «стека» — это просто низ самого headerStackH() (шапка+
    // вкладки), без высоты капсулы.
    var bottom = headerStackH() + (rbar ? rbar.getBoundingClientRect().height : 0);
    var maxh = Math.max(120, vh - bottom - 8);
    document.documentElement.style.setProperty("--ic-sheet-maxh", maxh+"px");
    // --ic-rbar-bottom — тот же "bottom" (нижняя граница .ic-rbar от верха
    // вьюпорта, в px), но для #ic-rb-dim (app.css): дим должен начинаться
    // РОВНО там же, где щель шторки, и не затрагивать область над капсулой
    // (там адресная строка настоящего Safari — задание, пункт 3, фикс
    // мигания её цвета). Тот же continuously-synced механизм, что у
    // --ic-sheet-maxh выше — пересчитывается на каждый resize/scroll
    // visualViewport, а не разовым снимком при открытии.
    document.documentElement.style.setProperty("--ic-rbar-bottom", bottom+"px");
  }

  // syncSheetChrome — общее затемнение страницы (#ic-rb-dim, ОДНО на
  // страницу — не по одному внутри каждой шторки, как раньше), пока ХОТЬ
  // ОДНА шторка этого registry открыта или ещё анимируется (закрывается).
  // #ic-rb-dim — всегда position:fixed ВНЕ .ic-rbar (обычный реальный
  // вьюпорт, не завязан на containing block капсулы), поэтому не нужно
  // искать/переключать дим-слой внутри каждого sheetEl отдельно — один
  // вызов syncSheetChrome(registry) после любого изменения isOpen/
  // isAnimating любой шторки этого registry решает всё сразу.
  // Больше НЕ трогает z-index капсулы (.ic-rbar-elevated — убран этим
  // раундом, см. подробное обоснование в app.css у бывшего правила
  // .ic-rbar.ic-rbar-elevated). Это был обходной маневр по стеку слоёв под
  // ровно тот же баг, который расследование настоящего видео с iPhone
  // определило как причину: пока панель (.ic-rb-sheet-panel, прямой
  // ребёнок .ic-rbar) уезжала transform'ом выше нижней границы .back-bar,
  // elevated держал .ic-rbar НАД .back-bar в стеке на всё время анимации —
  // из-за чего уехавшая панель красилась ПОВЕРХ шапки/капсулы, а не
  // пряталась под них. Настоящий фикс — геометрический, не по z-index:
  // .ic-rb-sheet сам стал клип-боксом (height:var(--ic-sheet-maxh);
  // overflow:hidden, см. app.css) — уехавшая часть панели физически не
  // рисуется выше границы щели, независимо от того, кто «выше» в стеке.
  function syncSheetChrome(registry){
    var any = registry.some(function(s){ return s.isOpen() || s.isAnimating(); });
    var dim = document.getElementById("ic-rb-dim");
    if(dim) dim.classList.toggle("ic-rb-dim-show", any);
  }

  // Общий механизм выезжающей панели-шторки читалки (.ic-rb-sheet) — делит
  // поиск (sheetApi) и список глав (tocSheetApi) читалки, см. их создание в
  // renderChapter. sheetEl — корневой .ic-rb-sheet этого экземпляра, теперь
  // ВЛОЖЕННЫЙ внутрь .ic-rbar (а не рядом, в .ic-ch-outer) и БЕЗ своего
  // .ic-rb-sheet-dim (затемнение общее на страницу, см. syncSheetChrome
  // выше) — внутри ожидает только .ic-rb-sheet-panel. btn — кнопка
  // .ic-rbar, которой выставляется aria-pressed.
  //
  // Round N (правки «дёргается» + «список глав как шторка», см. задание):
  // 1. sheetAnimating — отдельный от isOpen флаг: выставляется true сразу на
  //    open()/close(), снимается по transitionend на transform панели (с
  //    запасным таймером — на случай prefers-reduced-motion, где transition
  //    снят вовсе и transitionend не придёт). installScrollHide (caller)
  //    обязан проверять ОБА — isOpen() || isAnimating() — иначе scroll-hide
  //    может начать прятать бары СРЕДИ анимации закрытия (это и было
  //    дёрганьем — две анимации transform конкурировали).
  // 2. lockBodyScroll()/unlockBodyScroll() (общий механизм, см. ниже у
  //    openObjectSheet) подключены сюда же, синхронно с open()/close() —
  //    прокрутка страницы под шторкой заморожена без прыжка scrollY.
  // 3. activeSheetClose регистрируется на open(), снимается на close() —
  //    route() (вызывается на каждую навигацию) корректно закрывает
  //    открытую панель без следов; closeFromRoute — МГНОВЕННАЯ версия (DOM
  //    всё равно будет переписан следующим root.innerHTML, анимировать нечего,
  //    важно только снять body-lock и document-level слушатель Esc).
  // Взаимоисключение (поиск vs список глав, пункт 1 задания): opts.registry —
  // общий массив API обеих панелей одной главы; open() синхронно и МГНОВЕННО
  // (closeInstant, без собственной анимации закрытия) закрывает любую другую
  // открытую панель из того же registry перед тем, как начать открываться.
  function makeRbSheet(sheetEl, btn, opts){
    opts = opts || {};
    var registry = opts.registry || [];
    var panel = sheetEl.querySelector(".ic-rb-sheet-panel");
    // slide — НОВЫЙ отдельный wrapper (.ic-rb-sheet-slide, между .ic-rb-sheet
    // и .ic-rb-sheet-panel, см. app.css/разметка в app.js), на который теперь
    // перенесён transform/transition слайда — см. подробный комментарий у
    // .ic-rb-sheet-slide в app.css про найденную причину «шапка не
    // закреплена» (транзишен был прямо на самом scroll-контейнере с
    // position:sticky внутри — известный баг WebKit). transitionend слушаем
    // здесь тоже на slide, не на panel (у panel больше нет transform).
    var slide = sheetEl.querySelector(".ic-rb-sheet-slide") || panel;
    var isOpenFlag = false, animating = false, animTimer = null;
    function onTransEnd(e){ if(e.target===slide && e.propertyName==="transform") clearAnim(); }
    function clearAnim(){
      if(animTimer){ clearTimeout(animTimer); animTimer = null; }
      slide.removeEventListener("transitionend", onTransEnd);
      animating = false;
      syncSheetChrome(registry);
    }
    function startAnim(){
      clearAnim();
      animating = true;
      slide.addEventListener("transitionend", onTransEnd);
      // 420ms — запас сверх .34s CSS-перехода слайда (app.css), на случай
      // сбоя/отсутствия transitionend (prefers-reduced-motion снимает
      // transition целиком — события просто не будет).
      animTimer = setTimeout(clearAnim, 420);
    }
    function onKey(e){ if(e.key==="Escape") close(); }
    function showBarsForced(){
      var bbar = document.querySelector(".back-bar");
      if(bbar) bbar.classList.remove("ic-bb-hidden");
      var bt = document.getElementById("ic-booktabs");
      if(bt) bt.classList.remove("ic-bb-hidden");
      var stk = document.getElementById("ic-stack");
      if(stk) stk.classList.remove("ic-stack-hidden");
    }
    function open(arg){
      registry.forEach(function(s){ if(s !== api && s.isOpen()) s.closeInstant(); });
      showBarsForced();
      updateSheetMaxH();
      lockBodyScroll();
      startAnim();
      sheetEl.classList.add("ic-rb-sheet-open");
      isOpenFlag = true;
      if(btn) btn.setAttribute("aria-pressed","true");
      activeSheetClose = closeFromRoute;
      document.addEventListener("keydown", onKey);
      syncSheetChrome(registry);
      if(opts.onOpen) opts.onOpen(arg);
    }
    function close(){
      if(!isOpenFlag) return;
      sheetEl.classList.remove("ic-rb-sheet-open");
      isOpenFlag = false;
      startAnim();
      if(btn) btn.setAttribute("aria-pressed","false");
      document.removeEventListener("keydown", onKey);
      if(activeSheetClose === closeFromRoute) activeSheetClose = null;
      unlockBodyScroll();
      syncSheetChrome(registry);
      if(opts.onClose) opts.onClose();
    }
    // route() дёргает activeSheetClose() на КАЖДУЮ навигацию (даже когда эта
    // панель не открыта — тогда достаточно no-op через isOpenFlag-гард в
    // unlockBodyScroll/здесь не нужно ничего делать, но сам activeSheetClose
    // всегда указывает на панель, что открыта прямо сейчас, см. open() выше).
    function closeFromRoute(){
      isOpenFlag = false; clearAnim();
      document.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      activeSheetClose = null;
      syncSheetChrome(registry);
    }
    // closeInstant — взаимоисключение (см. open() выше): закрывает БЕЗ
    // собственной анимации, синхронно, не трогая body-lock (следующий же
    // open() другой панели из того же registry снова его выставит —
    // lockBodyScroll идемпотентен, см. его определение; если открытия не
    // следует, вызывающая сторона сама вызовет обычный close()). Общий дим
    // не мигает здесь вовсе: closeInstant вызывается ТОЛЬКО из open() другой
    // шторки того же registry — та уже сама выставила его ДО этого вызова
    // (см. open() выше — showBarsForced()+classList.add идут раньше
    // registry.forEach), так что syncSheetChrome(registry) всё равно увидит
    // «кто-то открыт» и не потребует отдельного вызова тут.
    function closeInstant(){
      if(!isOpenFlag) return;
      sheetEl.classList.add("ic-rb-sheet-noanim");
      sheetEl.classList.remove("ic-rb-sheet-open");
      void sheetEl.offsetHeight;
      sheetEl.classList.remove("ic-rb-sheet-noanim");
      isOpenFlag = false; clearAnim();
      if(btn) btn.setAttribute("aria-pressed","false");
      document.removeEventListener("keydown", onKey);
      if(activeSheetClose === closeFromRoute) activeSheetClose = null;
    }
    function dimClick(){ if(isOpenFlag) close(); }
    var dim = document.getElementById("ic-rb-dim");
    if(dim) dim.addEventListener("click", dimClick);
    Array.prototype.slice.call(sheetEl.querySelectorAll(".ic-rb-sheet-close")).forEach(function(b){ b.addEventListener("click", close); });
    var api = {
      open: open, close: close, closeInstant: closeInstant,
      isOpen: function(){ return isOpenFlag; },
      isAnimating: function(){ return animating; },
      toggle: function(arg){ isOpenFlag ? close() : open(arg); }
    };
    registry.push(api);
    return api;
  }

  // Вертикальный алфавитный столбик на узких экранах (указатель/имена) —
  // по образцу списка контактов iPhone: одиночное касание по букве скроллит
  // к ней (onPick), а ведение пальцем вверх-вниз по всей полосе (pointerdown/
  // move/up/cancel — не раздельные touch/mouse) на лету меняет букву и
  // показывает крупную подсказку (peek) по центру экрана, пока палец/кнопка
  // зажаты. Слушатели висят на самом контейнере rail, а не на кнопках —
  // кнопки каждый fill() пересобираются заново, но rail-элемент остаётся тем
  // же узлом, поэтому его не нужно перевешивать повторно.
  // opts: {onPick, onDragStart, onDragEnd}. Геометрия (rail rect + список
  // кнопок) кэшируется ОДИН раз на pointerdown и используется во всех
  // btnAt() этого жеста (сброс — на pointerup/pointercancel), просто чтобы
  // не перезапрашивать getBoundingClientRect()/querySelectorAll на каждый
  // pointermove. Столбик теперь статичен (top/bottom — неподвижные CSS-
  // границы, см. .ic-az-rail в app.css) — геометрия физически не может
  // измениться посреди жеста, но кэш всё равно дешевле повторных запросов.
  // onDragStart/onDragEnd — сигнал вызывающей стороне (renderTavola/
  // renderNames): замораживает installScrollHide (suppress), пока палец на
  // полосе (чтобы жест не прятал капсулу), и переключает класс активности
  // столбика (яркость кнопок в покое/при касании — см. задание).
  function wireAzRail(rail, peek, opts){
    opts = opts || {};
    var onPick = opts.onPick || function(){};
    var dragging = false, cachedRect = null, cachedBtns = null;
    // Троттлинг прыжков по rAF (пункт 2 задания): pointermove САМ больше не
    // вызывает pick/onPick — он только обновляет pendingY (последнюю
    // известную координату пальца). Один rAF-цикл, запущенный на
    // pointerdown, на каждый кадр проверяет pendingY и, если нужно, зовёт
    // pick — так onPick (а значит и реальный window.scrollTo внутри него,
    // см. renderTavola/renderNames) срабатывает НЕ ЧАЩЕ одного раза за кадр,
    // а не на каждое из множества pointermove между двумя кадрами на быстром
    // свайпе. lastLetter — вторая часть троттлинга: даже если rAF тикнул,
    // pick не зовётся повторно, если палец всё ещё над той же буквой, на
    // которой уже стояли (сравнение data-l с прошлым разом), раз координата
    // чуть сдвинулась в пределах той же кнопки.
    var lastLetter = null, pendingY = null, rafId = null;
    function btnAt(clientY){
      var btns = cachedBtns || rail.querySelectorAll("button");
      if(!btns.length) return null;
      var r = cachedRect || rail.getBoundingClientRect();
      var ratio = r.height ? Math.min(1, Math.max(0, (clientY - r.top) / r.height)) : 0;
      var idx = Math.min(btns.length - 1, Math.floor(ratio * btns.length));
      return btns[idx];
    }
    function pick(btn, drag){
      if(!btn) return;
      var l = btn.getAttribute("data-l");
      if(drag && l === lastLetter) return;
      lastLetter = l;
      onPick(l);
      // data-peek — ВСЕГДА одна исходная буква этой кнопки (см. buildAzRail),
      // а не её видимый текст: в режиме «через одну» (.ic-az-paired) у
      // нечётных кнопок видимого текста нет вовсе, а у чётных виден
      // объединённый "А·Б" — подсказка в центре экрана должна показывать
      // РОВНО ту одну букву, в которую сейчас попал палец, а не слипшуюся
      // пару, иначе переход между соседними буквами не читался бы на пике.
      if(drag){ peek.textContent = btn.getAttribute("data-peek") || btn.textContent; peek.classList.add("show"); }
    }
    function frame(){
      rafId = null;
      if(!dragging) return;
      if(pendingY != null) pick(btnAt(pendingY), true);
      rafId = requestAnimationFrame(frame);
    }
    function end(){
      if(!dragging) return;
      dragging = false; peek.classList.remove("show");
      cachedRect = null; cachedBtns = null; lastLetter = null; pendingY = null;
      if(rafId != null){ cancelAnimationFrame(rafId); rafId = null; }
      if(opts.onDragEnd) opts.onDragEnd();
    }
    rail.addEventListener("pointerdown", function(e){
      dragging = true;
      cachedRect = rail.getBoundingClientRect();
      cachedBtns = rail.querySelectorAll("button");
      lastLetter = null;
      if(rail.setPointerCapture){ try{ rail.setPointerCapture(e.pointerId); }catch(err){} }
      if(opts.onDragStart) opts.onDragStart();
      pick(e.target.closest("button") || btnAt(e.clientY), true);
      pendingY = e.clientY;
      rafId = requestAnimationFrame(frame);
    });
    rail.addEventListener("pointermove", function(e){ if(dragging) pendingY = e.clientY; });
    rail.addEventListener("pointerup", end);
    rail.addEventListener("pointercancel", end);
  }

  // Верхняя граница .ic-az-rail — ДВА заранее посчитанных положения (этот
  // раунд, задание пункт 2), не одно статичное, как раньше: --az-top (шапка+
  // меню книги видны — headerStackH() + реальная высота капсулы .ic-rbar-tv
  // + отступ 14px) и --az-top-snap (шапка+меню книги спрятаны, капсула сама
  // сидит у top:0 — только её высота + 14px, см. .ic-az-rail-snap в
  // app.css). Между ними переключает installScrollHide/setHidden тем же
  // классом и в тот же тик, что и саму капсулу (.ic-rbar-snap) — редкий
  // порог (hideAt/showAt), не каждый кадр скролла, так что считать здесь
  // оба значения один раз, без пересчёта на каждый тик, по-прежнему можно и
  // нужно. rect.height капсулы не меняется от translateY/top (тот же факт,
  // на который опирается updateSheetMaxH выше), поэтому измерение верно
  // независимо от того, спрятана ли капсула в этот момент. Не хардкод —
  // высота капсулы зависит от языка интерфейса (RU/EN/FR) и от компактного
  // ландшафтного режима на низком экране (см. медиа-правила .ic-rbar/
  // .back-bar). Вызывается из fill() у renderTavola/renderNames (и из
  // общего resize/orientationchange слушателя ниже) — один слушатель на
  // весь модуль, no-op если рейла сейчас нет на странице (тот же приём, что
  // у fitCtxLabels/closeQm).
  function syncAzRailBounds(){
    syncHeaderStack();
    var rail = document.querySelector(".ic-az-rail");
    if(!rail) return;
    var rbar = document.getElementById("ic-rbar"), rbarH = rbar ? rbar.getBoundingClientRect().height : 0;
    rail.style.setProperty("--az-top", Math.max(0, headerStackH() + rbarH + 14)+"px");
    rail.style.setProperty("--az-top-snap", Math.max(0, rbarH + 14)+"px");
  }
  window.addEventListener("resize", syncAzRailBounds);
  window.addEventListener("orientationchange", syncAzRailBounds);

  // buildAzRail — разметка кнопок столбика из списка реальных букв (letters,
  // без disabled). available — текущая доступная высота столбика в px
  // (измеряется ПОСЛЕ применения статичных top/bottom, см. вызов в fill()) —
  // решает, нужен ли режим «через одну» (по образцу контактов iOS): если
  // шаг на букву (available/letters.length) меньше AZ_MIN_STEP, показываем
  // подпись только у ЧЁТНЫХ кнопок, "A·B" (текущая + следующая буква), а
  // НЕЧЁТНЫЕ остаются в DOM без видимого текста — физических кнопок ровно
  // столько же, сколько исходных букв, поэтому wireAzRail/btnAt (деление
  // полосы по числу <button>) трогать не пришлось: жест пальцем попадает в
  // любую исходную букву, не только показанную. Подпись чётной кнопки
  // выезжает за её нижний край на половину высоты соседней (.ic-az-pair-label,
  // position:absolute;top:100% — см. app.css), визуально сидя НА СТЫКЕ двух
  // физических кнопок, как в контактах iOS. data-peek у КАЖДОЙ кнопки — её
  // ОДНА исходная буква (не объединённая подпись) — именно её показывает
  // крупная подсказка в центре экрана при протяжке (см. pick() у wireAzRail):
  // иначе у нечётных кнопок (без видимого текста) подсказка осталась бы
  // пустой, а у чётных показывала бы слипшуюся пару вместо одной буквы.
  // dataAttrFn(l) — необязательное преобразование буквы в значение data-l
  // (renderNames передаёт "#"→"0").
  var AZ_MIN_STEP = 17; // px — эмпирический порог (см. отчёт проверки): ниже
  // этого шага кнопки визуально слипаются/нечитаемы на реальном рендере —
  // подтверждено реальными данными Cartari на укороченном портрете (390×500,
  // "Имена" на RU: 26 букв, доступная высота 333px, шаг ~12.8px — paired
  // срабатывает без необходимости подделывать данные).
  function buildAzRail(letters, dataAttrFn, available){
    var n = letters.length;
    var paired = n > 0 && (available / n) < AZ_MIN_STEP;
    var html = letters.map(function(l, i){
      var dl = dataAttrFn ? dataAttrFn(l) : l;
      if(!paired) return '<button type="button" data-l="'+dl+'" data-peek="'+l+'">'+l+'</button>';
      if(i % 2 === 1) return '<button type="button" data-l="'+dl+'" data-peek="'+l+'"></button>';
      var partner = letters[i+1];
      var label = partner ? (l+"·"+partner) : l;
      return '<button type="button" data-l="'+dl+'" data-peek="'+l+'"><span class="ic-az-pair-label">'+label+'</span></button>';
    }).join("");
    return {html: html, paired: paired, tight: paired || n > 26};
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
    var tl = trLang(book);
    if(book.chap && tl && !(book.chap.trDone && book.chap.trDone[tl])){ loadChaptersTr(book, tl, cb); return; }
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
      if(tl) loadChaptersTr(book, tl, cb); else cb(book.chap);
    }).catch(function(){
      // НЕ book.chap = null — так провал ОДНОЙ попытки (например, fetch
      // оборван на лету реальной перезагрузкой/сменой вкладки iOS Safari —
      // независимо подтверждено: в этом раунде воспроизведено, что ТАКОЙ же
      // "TypeError: Load failed" у fetch(cfg.data) ловится здесь при быстрой
      // перезагрузке страницы сразу после перехода в главу, ДО того как её
      // загрузка успела завершиться) навсегда застревал бы книге: следующая
      // же проверка `book.chap !== undefined` (выше) считала бы null таким
      // же законным "уже загружено", как и настоящие данные, и КАЖДЫЙ
      // следующий заход в любую главу этой книги получал бы chap:null без
      // единой новой попытки — именно так и падал tocPartsHtml (см. его
      // комментарий) на chap.bySlug. book.chap остаётся undefined — следующий
      // вызов loadChapters для этой книги просто попробует загрузить заново.
      cb(null);
    });
  }
  // Переводы (chapters_en.json, chapters_fr.json): блоки совпадают с русскими по номерам. Готовые главы — c.en / c.fr = {title, blocks}.
  function trLang(book){
    var cfg = book.meta.chapters;
    return cfg && (state.lang==="en" || state.lang==="fr") && cfg["data_"+state.lang] ? state.lang : "";
  }
  function loadChaptersTr(book, lang, cb){
    var cfg = book.meta.chapters, chap = book.chap;
    function done(){ (chap.trDone = chap.trDone || {})[lang] = true; cb(chap); }
    fetch(BASE+"books/"+book.slug+"/"+cfg["data_"+lang],{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){
        (d.chapters || []).forEach(function(e){
          var c = chap.bySlug[e.slug];
          if(c){ c["title_"+lang] = e.title; c[lang] = e.blocks ? e : null; }
        });
        done();
      }).catch(done);
  }
  // *курсив* из исходного md; остальной текст экранируется.
  // markSpan — [start,len] символов в СЫРОМ s (до esc/markdown), которые надо
  // обвести подчёркиванием (.ic-ch-mark, см. app.css) — слово, по которому
  // реально пришли (из карточки имени или результата поиска, см. комментарий
  // у okN/wordSpec в renderChapter). Оборачиваем служебными символами-
  // метками \u0001/\u0002 ДО esc()/разметки markdown — они не совпадают ни
  // с одним спецсимволом esc(), ни с "*"/"[?]", так что остаток конвейера
  // работает как обычно и не может "откусить" границу обёртки посередине
  // форматирования.
  function inl(s, qs, markSpan){
    if(markSpan && markSpan[1] > 0){
      var ms0 = Math.max(0, markSpan[0]|0), ms1 = Math.min(s.length, ms0 + (markSpan[1]|0));
      if(ms1 > ms0) s = s.slice(0, ms0) + "\u0001" + s.slice(ms0, ms1) + "\u0002" + s.slice(ms1);
    }
    var h = esc(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
    h = h.replace(/\u0001/g,'<mark class="ic-ch-mark">').replace(/\u0002/g,"</mark>");
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
  // Тот же адрес главы, но с позицией конкретного найденного слова внутри
  // блока — "w<start>-<len>" четвёртым сегментом (см. wordSpec в
  // renderChapter): он подчёркивается при открытии (.ic-ch-mark), а не
  // просто подсвечивает весь блок. sp — массив [start,len,…] (как у
  // nmSnippet/srFind); берём только ПЕРВУЮ пару — если слово встретилось в
  // блоке несколько раз, подчёркиваем первое совпадение, не все (см.
  // комментарий у fix 1 в задании: не домысливать точность, которой нет).
  function chapterHrefWord(book, slug, block, sp){
    if(!sp || sp.length < 2 || !(sp[1] > 0)) return chapterHref(book, slug, block);
    return hrefFor(book, "ch/"+slug+"/"+block+"/w"+sp[0]+"-"+sp[1]);
  }
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
      // Без loading="lazy" здесь: это картинки внутри текста главы, куда renderChapter может
      // сразу после рендера прыгнуть далеко вниз (к найденному блоку). "lazy" у WebKit работает
      // по дистанции до текущей точки прокрутки В МОМЕНТ разбора документа — то есть до прыжка,
      // когда все такие картинки ещё далеко от верха страницы и браузер их не запрашивает вовсе;
      // WebKit заново решает, пора их грузить или нет, только при следующей перерисовке после
      // scrollTo, с задержкой и порогом, который заметно отличается от Chromium. Раз ширина/высота
      // у картинки всегда известны заранее (aspect-ratio ниже), резервирование места не страдает
      // от эагерной загрузки, а риск «картинка выше цели прогрузилась только через 9 секунд и
      // снап к тому моменту уже остановился» снимается тем, что запрос уходит сразу.
      return '<figure class="ic-ch-fig" data-for="'+b.n+'"><div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(src)+'"'+
        (f.w&&f.h ? ' width="'+f.w+'" height="'+f.h+'" style="aspect-ratio:'+f.w+'/'+f.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:f.pt||""}))+'"></div>'+(f.cap ? '<figcaption>'+inl(f.cap, null)+'</figcaption>' : "")+'</figure>';
    }).join("");
  }
  function pageHref(book, label){
    var pm = book.chap && book.chap.pm, slug, i;
    for(slug in pm) for(i = 0; i < pm[slug].length; i++){
      var r = pm[slug][i];
      if(r[1]===label) return hrefFor(book, "ch/"+slug+"/"+r[2]+"/"+r[2]+"-"+r[3]+"-"+label);
    }
    return "";
  }
  // markSpan — только для обычного текстового/помётного блока с реально
  // найденным словом (см. комментарий у okN/wordSpec в renderChapter); для
  // "cap" (гравюра+подпись) сознательно не применяется — цель-картинка не
  // получает подчёркивания слова, только маргинальную черту (ic-hl-mark),
  // у неё нет "слова", которое можно подчеркнуть.
  function blockHtml(book, b, slug, markSpan){
    var n = ' data-n="'+b.n+'"', qs = qmState(b);
    if(b.t==="aside" && slug==="aggionta"){
      var am = /^(Л\.|Fol\.)\s+(\d+)(.*)$/.exec(b.text), ah = am && pageHref(book, am[2]);
      if(ah) return '<aside class="ic-ch-aside"'+n+'><a href="'+esc(ah)+'">'+esc(am[1]+" "+am[2])+'</a>'+inl(am[3], qs)+'</aside>';
    }
    if(b.t==="aside") return '<aside class="ic-ch-aside"'+n+'>'+inl(b.text, qs, markSpan)+'</aside>';
    if(b.t==="quote") return quoteHtml(b).replace('<div class="ic-ch-quote"', '<div class="ic-ch-quote"'+n);
    if(b.t==="cap"){
      if(b.mv) return "";
      var src = b.eng ? BASE+"books/"+(book.meta.ornaments && book.meta.ornaments.source || book.slug)+"/engravings/"+b.eng : "";
      // loading="lazy" снято по той же причине, что в figsHtml() выше.
      return '<figure class="ic-ch-fig"'+n+'>'+
        (src ? '<div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(src)+'"'+
          (b.w&&b.h ? ' width="'+b.w+'" height="'+b.h+'" style="aspect-ratio:'+b.w+'/'+b.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:b.pt || b.text.slice(0,60)}))+'"></div>' : "")+
        '<figcaption>'+inl(b.text, qs)+'</figcaption></figure>';
    }
    if(b.t==="h") return '<h'+(b.lv===2?2:3)+' class="ic-ch-h"'+n+'>'+inl(b.text, qs, markSpan)+'</h'+(b.lv===2?2:3)+'>';
    if(b.text.indexOf("\n")>=0) return '<p class="ic-ch-lines"'+n+'>'+inl(b.text, qs, markSpan).replace(/\n/g,"<br>")+'</p>';
    return '<p'+n+'>'+inl(b.text, qs, markSpan)+'</p>';
  }

  // Ячейка «глава · страница» (.ic-rbar-pos): название главы усекается
  // ПРОСТЫМ CSS-эллипсисом (text-overflow:ellipsis в app.css) — на ≤460px
  // название скрывается целиком через обычный CSS @media, см.
  // .ic-rbar-pos-ch{display:none} в app.css.
  // Пересчёт max-height выезжающей панели при ресайзе — уже покрыт общим
  // слушателем window resize/orientationchange+visualViewport у syncTopVar/
  // updateSheetMaxH() (самое начало файла); отдельный слушатель здесь
  // больше не нужен — top панели не JS-величина вовсе (чистый CSS, см.
  // комментарий у updateSheetMaxH()).
  // Esc закрывает открытую панель поиска читалки — один слушатель на весь
  // модуль (не по одному на каждый рендер главы), через клик по уже
  // подключённой кнопке «Закрыть» внутри панели, а не вызовом closure
  // (sheetClose/sheetApi — приватные переменные внутри renderChapter,
  // недоступные здесь; DOM-кнопка — общий интерфейс, который есть всегда).
  document.addEventListener("keydown", function(e){
    if(e.key !== "Escape") return;
    var openSheetEl = document.querySelector(".ic-rb-sheet.ic-rb-sheet-open");
    var btn = openSheetEl && openSheetEl.querySelector(".ic-rb-sheet-close");
    if(btn) btn.click();
  });
  function renderChapter(book, slug, blockN, pageSpec){
    var gen = renderGen;
    // Автооткрытие панели поиска при возврате «К поиску» (searchReopen, см.
    // его определение выше): если читатель открыл поиск на ЭТОЙ главе и
    // кликнул по результату, ведущему на другую главу, history.back() вернёт
    // сюда — тем же hash, который не менялся при открытии/закрытии оверлея —
    // но без автоматически открытой панели. Читаем/обнуляем здесь, ДО того
    // как заново построится разметка панели ниже, чтобы один и тот же
    // возврат не открывал её повторно при будущих ре-рендерах того же hash.
    var reopenSearchQuery = (searchReopen && searchReopen.hash === location.hash) ? searchReopen.query : null;
    if(reopenSearchQuery != null) searchReopen = null;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var ch = chap && chap.bySlug[slug];
      var idx = ch ? chap.list.indexOf(ch) : -1;
      var prev = idx > 0 ? chap.list[idx-1] : null, next = idx >= 0 ? chap.list[idx+1] : null;
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
        // Пункт 4 этого раунда: слияние в один диапазон теперь ВСЕГДА, когда
        // несколько страниц подряд начинаются с одного блока — не только для
        // чисто цифровых меток ("тит."/"посв. N"/"Page N" тоже сливаются
        // через pgLabel() на обоих концах, напр. «тит. 2v – посв. 1v»).
        // Отдельная раскладка "в столбик" (прежний idxs.map-фоллбэк для
        // нецифрового случая) больше не нужна — она не достижима, пока
        // idxs.length>1 всегда уходит в эту ветку.
        if(idxs.length > 1){
          var first = pmRows[idxs[0]][1], last = pmRows[idxs[idxs.length-1]][1];
          var mlb = pgLabel(first)+" – "+pgLabel(last);
          return '<div class="ic-pgm"><button type="button" class="ic-pgm-b" data-pi="'+idxs[0]+'" aria-pressed="false" aria-label="'+esc(t("svOpen",{p:first}))+'">'+esc(mlb)+'</button></div>';
        }
        var lb = pgLabel(pmRows[idxs[0]][1]);
        return '<div class="ic-pgm" style="--k:0"><button type="button" class="ic-pgm-b" data-pi="'+idxs[0]+'" aria-pressed="false" aria-label="'+esc(t("svOpen",{p:pmRows[idxs[0]][1]}))+'">'+esc(lb)+'</button></div>';
      }
      var trl = trLang(book), enMode = !!trl, blocks = ch && (enMode ? (ch[trl] && ch[trl].blocks) : ch.blocks);
      var enPrep = enMode && ch && !blocks && chap.pm[slug] && chap.pm[slug].length;
      // okN/wordSpec — вычисляются ЗДЕСЬ, до сборки HTML тела главы: слово-
      // подсветка (см. .ic-ch-mark в app.css и markSpan у blockHtml/inl ниже)
      // вплетается в разметку искомого блока на этапе самого blockHtml(), а
      // не постфактум через DOM-поиск — позиции символов (wordSpec) считаны
      // против СЫРОГО b.text (c "*"/"[?]" на месте нетронутыми), ровно то же,
      // что видит здесь inl(), так что смещения совпадают без пересчёта.
      // "w<start>-<len>" в pageSpec — так ссылки из карточки имени (см.
      // chapterHrefWord в renderNameCard) и из результатов поиска по русскому
      // тексту (см. тот же helper в srRender/txRow) кодируют позицию
      // конкретного найденного слова; у указателя (tavola) и у "Что пишет
      // Картари" на карточке гравюры такой позиции вообще нет в данных —
      // там pageSpec либо отсутствует, либо это диапазон страницы (pgm ниже),
      // поэтому для них подсветка остаётся только маргинальной чертой, без
      // подчёркивания слова — так и должно быть, это не недосмотр.
      var okN = blockN && /^[1-9]\d*$/.test(blockN);
      var wordSpec = pageSpec && /^w(\d+)-(\d+)$/.exec(pageSpec);
      var markSpan = (okN && wordSpec) ? [+wordSpec[1], +wordSpec[2]] : null;
      var body = blocks
        // markSpan — позиция слова в РУССКОМ тексте блока (так её считают названия/поиск,
        // см. nmSnippet/srFind), поэтому применяем её только когда реально показан русский
        // текст (!enMode) — на EN/FR тот же номер блока (b.n совпадает, см. комментарий у
        // trLang) содержит СОВСЕМ другой текст другой длины, и то же смещение символов там
        // просто подчеркнёт случайный кусок перевода, а не искомое слово.
        ? '<div class="ic-text ic-ch-body" lang="'+(enMode ? trl : "ru")+'">'+blocks.map(function(b){ return pgmHtml(b)+figsHtml(book, b)+blockHtml(book, b, slug, (markSpan && !enMode && b.n===+blockN) ? markSpan : null); }).join("")+'</div>'
        : enPrep ? '<div class="ic-text ic-ch-body ic-ch-itbody"></div>'
        : '<p class="ic-sub">'+esc(t("chNotYet"))+'</p>';
      var posTitle = ch ? chapTitle(ch) : "";
      var posTitleShort = ch ? chapTitleShort(ch) : "";
      // .ic-ch-outer — панель .ic-rbar вынесена ИЗ узкого .ic-wrap.ic-ch-wrap
      // (780px) в собственную более широкую обёртку (до 1120px, см. app.css):
      // так у неё есть куда расти, когда контекстная подпись и короткая форма
      // заголовка главы длинны одновременно, а колонка чтения ниже остаётся
      // прежней ширины и центрируется независимо (margin:auto у обеих).
      //
      // Round «nav-tabs» (решение Андрея): книжные вкладки (bookTabsHtml) —
      // ОБЩЕЕ меню книги над строкой раздела, одно на все страницы книги,
      // с уголком-назад и лупой (шторка поиска теперь часть самого меню —
      // см. bookTabsHtml/bookSearchSheetHtml/bindBookSearchSheet выше).
      // Строка раздела главы — [Глава · страница] [Скан] [Начало] (без
      // ячейки контекста — её роль целиком взял на себя уголок-назад общего
      // меню, см. bindBookBack).
      root.innerHTML =
        '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, "text", {parentHref: hrefFor(book,"text"), ctxTypes: CHAP_CTX_TYPES})+
        '<div class="ic-ch-outer ic-ch-outer-bar">'+
          '<div class="ic-rbar" id="ic-rbar">'+
            '<div class="ic-rbar-row">'+
              '<button type="button" class="ic-rbar-pos" data-rb="pos" aria-haspopup="dialog" aria-pressed="false" aria-label="'+esc(t("rbPosLabel"))+'">'+
                '<span class="ic-rbar-pos-inner">'+
                  '<span class="ic-rbar-pos-ch" data-rb-ch><span class="ic-rbar-full">'+esc(posTitle)+'</span><span class="ic-rbar-short">'+esc(posTitleShort)+'</span></span>'+
                  '<span class="ic-rbar-pos-pg" data-rb-pg></span>'+
                '</span></button>'+
              '<button type="button" class="ic-rbar-scan" data-rb="scan" aria-pressed="false"'+(pmRows.length?"":" disabled")+'>'+esc(t("svScan"))+'</button>'+
              '<button type="button" class="ic-rbar-top" data-rb="top"><span class="ic-rbar-full">'+esc(t("rbTop"))+'</span><span class="ic-rbar-short">'+esc(t("rbTopShort"))+'</span></button>'+
            '</div>'+
            langSwitch()+
            // Выезжающая панель «Содержание» (кнопка data-rb="pos") — та же
            // разметка/анимация/класс .ic-rb-sheet..., что у панели поиска
            // выше (makeRbSheet ниже — общий хелпер для обеих, см. комментарий
            // там), просто с другим содержимым головы (заголовок+кнопка
            // закрытия вместо формы поиска) и списком глав (tocPartsHtml)
            // вместо .ic-sr. В отличие от панели поиска эта нужна ВСЕГДА
            // (кнопка «pos» есть у любой книги читалки, не только у книг с
            // «домашней» страницей) — поэтому не обёрнута в book.meta.home.
            // Модификатор .ic-rb-sheet-toc переопределяет стиль текущей главы
            // в списке (app.css): полужирный + акцентная черта слева, без
            // курсива/стрелки «›», которые даёт обычный .ic-toc-part
            // a[aria-current] у старой полноэкранной шторки.
            '<div class="ic-rb-sheet ic-rb-sheet-toc" id="ic-rb-toc-sheet">'+
              '<div class="ic-rb-sheet-slide">'+
                '<div class="ic-rb-sheet-panel">'+
                  '<div class="ic-rb-sheet-head">'+
                    '<span class="ic-rb-sheet-head-title">'+esc(t("contents"))+'</span>'+
                    '<button type="button" class="ic-rb-sheet-close">'+esc(t("close"))+'</button>'+
                  '</div>'+
                  '<nav class="ic-rb-toc-body">'+tocPartsHtml(book, chap, ch && ch.slug)+'</nav>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '</div>'+
        // #ic-rb-dim — единое затемнение страницы (ОДНО, не по одному внутри
        // каждой шторки), всегда position:fixed;inset:0 ВНЕ .ic-rbar — см.
        // подробный комментарий у syncSheetChrome() в app.js и у #ic-rb-dim
        // в app.css. Показывается/прячется синхронно с любой из шторок ниже.
        '<div id="ic-rb-dim"></div>'+
        '<div class="ic-ch-outer">'+
          '<div class="ic-wrap ic-ch-wrap">'+
            '<header class="ic-head">'+
              '<p class="ic-kicker">'+esc(bt(book.meta.title))+'</p>'+
              '<h1 class="ic-h-fr">'+esc(ch ? chapTitle(ch) : "")+'</h1>'+
            '</header>'+
            (enMode ? (enPrep ? '<p class="ic-ch-note">'+esc(t(trl==="fr" ? "chFrPrep" : "chEnPrep"))+'</p>' : "") : (state.lang!=="ru" && ch && ch.blocks ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : ""))+
            body+
            (ch ? '<div class="ic-pager">'+pagerBtn(prev,t("chPrev"))+pagerBtn(next,t("chNext"))+'</div>' : "")+
          '</div>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      syncHeaderStack();
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
      // Новая панель читалки (.ic-rbar) — один делегированный обработчик на всю
      // строку вместо отдельных слушателей на каждую кнопку.
      var rbar = root.querySelector("#ic-rbar"), rbarRow = root.querySelector(".ic-rbar-row"), pgEl = root.querySelector("[data-rb-pg]");
      var pgmEls = Array.prototype.slice.call(root.querySelectorAll(".ic-pgm-b"));
      // Текущая страница издания 1626 года по текущей прокрутке: последняя метка
      // страницы (та же вёрстка .ic-pgm-b, что открывает «Скан» внутри текста),
      // чей верх уже прошёл выше панели — классический приём «scrollspy».
      function curPgIdx(){
        if(!pgmEls.length) return -1;
        var off = headerStackH() + (rbar ? rbar.getBoundingClientRect().height : 0) + 4;
        var cur = pgmEls[0];
        for(var i=0;i<pgmEls.length;i++){ if(pgmEls[i].getBoundingClientRect().top <= off) cur = pgmEls[i]; else break; }
        return +cur.getAttribute("data-pi");
      }
      // lastPaintedPi — не перерисовываем номер страницы, если он не сменился
      // с прошлого тика скролла.
      var lastPaintedPi = null;
      function paintPg(){
        if(!pgEl) return;
        var pi = curPgIdx();
        if(pi === lastPaintedPi) return;
        lastPaintedPi = pi;
        // "· " перед номером страницы (пункт 3 этого раунда) — название главы
        // (.ic-rbar-pos-ch, см. разметку выше) теперь снова видно на любой
        // ширине, так что у двух ячеек нужен разделитель между ними; тот же
        // " · ", что уже используется для пар "X · Y" по всему файлу (nmForm/
        // chCtxLabel и т.п., см. задание). Пробел до точки даёт существующий
        // margin-right:6px у .ic-rbar-pos-ch.
        pgEl.textContent = pi >= 0 ? "· "+pgLabel(pmRows[pi][1]) : "";
      }
      paintPg();
      if(rbarRow) rbarRow.addEventListener("click", function(e){
        var b = e.target.closest("[data-rb]"); if(!b || b.disabled) return;
        var act = b.getAttribute("data-rb");
        if(act==="pos"){ if(tocSheetApi) tocSheetApi.toggle(); return; }
        if(act==="top"){
          var off = headerStackH() + (rbar ? rbar.getBoundingClientRect().height : 0) + 4;
          var r = root.querySelector(".ic-ch-wrap").getBoundingClientRect();
          window.scrollTo(0, window.scrollY + r.top - off);
          return;
        }
        if(act==="scan"){ var pi = curPgIdx(); if(pi >= 0) openSv(book, pmRows, pi); return; }
      });
      // Выезжающие панели читалки — поиск (.ic-rb-sheet, заменяет прежний
      // переход на home/search, см. act==="search" выше) и список глав
      // (.ic-rb-sheet.ic-rb-sheet-toc, заменяет старую полноэкранную шторку
      // openChapToc — та остаётся только для плитки «Содержание» на главной
      // книги, см. её собственный вызов ниже по файлу). Обе — ТОТ ЖЕ
      // механизм open/close/анимация-с-задержкой/scroll-lock/взаимоисключение,
      // вынесенный в общий хелпер makeRbSheet (определён у installScrollHide
      // выше) — не дублируем его логику здесь.
      var rbSheets = [];
      // Лупа общего меню книги (bookTabsHtml) — тот же оверлей поиска
      // ШТОРКОЙ поверх текущей главы, что и на любой другой странице книги
      // (round «nav-tabs», bindBookSearchSheet выше). Автооткрытие с
      // прежним запросом при возврате «К поиску» (searchReopen) — через
      // reopenSearchQuery, прочитанный в начале функции.
      var sheetApi = bindBookSearchSheet(root, book, gen, rbSheets);
      if(sheetApi && reopenSearchQuery != null) sheetApi.open(reopenSearchQuery);
      var tocSheetApi = null, tocSheetEl = root.querySelector("#ic-rb-toc-sheet");
      if(tocSheetEl){
        var posBtn = root.querySelector('[data-rb="pos"]');
        // onOpen — прокрутка списка к текущей главе, ОДИН раз, синхронно,
        // до первого кадра анимации выезда (round «sheets-dark», задание
        // часть 2 пункт 5): scrollTop выставляется здесь же, пока браузер
        // ещё не отрисовал кадр — слайд уже получил класс .ic-rb-sheet-open
        // (startAnim()/classList.add выше, в open()), но сам рендер следующего
        // кадра случится только после возврата из этого синхронного
        // обработчика, так что строка уже на месте ДО того, как панель
        // начнёт визуально выезжать — скачка/доскролла во время анимации нет.
        // headH (высота sticky-шапки .ic-rb-sheet-head) вычитается явно —
        // раньше оставшийся отступ считался как треть свободного места
        // (avail/3), и для первых глав списка эта доля могла оказаться
        // меньше высоты шапки, оставляя строку наполовину под ней; теперь
        // фиксированный зазор headH+12px (задание) — строка гарантированно
        // видна целиком при любой позиции в списке.
        tocSheetApi = makeRbSheet(tocSheetEl, posBtn, {registry: rbSheets, onOpen: function(){
          var panelEl = tocSheetEl.querySelector(".ic-rb-sheet-panel");
          var headEl = tocSheetEl.querySelector(".ic-rb-sheet-head");
          var cur = tocSheetEl.querySelector('[aria-current="page"]');
          if(!panelEl || !cur) return;
          var headH = headEl ? headEl.getBoundingClientRect().height : 0;
          var target = cur.offsetTop - headH - 12;
          panelEl.scrollTop = Math.max(0, target);
        }});
        // Выбор пункта списка — переход по обычной ссылке (<a href>), сама
        // навигация закроет панель через route()/activeSheetClose; здесь
        // нужно только запустить ту же (анимированную) close(), чтобы она не
        // осталась визуально открытой в момент смены hash на месте, пока
        // идёт переход (route() иначе использует closeFromRoute — мгновенно,
        // без анимации, что здесь неуместно: ссылка кликнута внутри самой
        // этой же вкладки/главы, а не извне).
        tocSheetEl.querySelector(".ic-rb-toc-body").addEventListener("click", function(e){ if(e.target.closest("a")) tocSheetApi.close(); });
      }
      // Показ/скрытие панели и внешней .back-bar синхронно, по направлению
      // прокрутки — не по абсолютной позиции, как у .ic-controls выше (тот
      // плавно сжимается с самого начала списка; здесь нужно ровно обратное:
      // всегда видна у самого верха и у самого низа главы, прячется только
      // при заметной прокрутке вниз и возвращается при небольшой прокрутке
      // вверх). transform, а не изменение высоты/отображения — у sticky-
      // элемента это не двигает раскладку страницы (панель просто съезжает
      // за верхний край своего — уже не занимающего места у остального
      // текста — "прилипшего" положения), прокрутка читателя не прыгает.
      // Пороги по 1626-странице не подходят здесь: SHOW_AT/HIDE_AT в пикселях
      // накопленного движения в одну сторону — короткое дрожание инерции на
      // телефоне меняет знак почти каждый кадр и обнуляет накопитель, не
      // долетая до порога; настоящая прокрутка быстро набирает нужную сумму.
      // Пороги/накопители и синхронизация с .back-bar+.ic-booktabs — в общей
      // installScrollHide (см. выше, рядом с wireSearchClear); здесь только её
      // подключение, с paintPg как дополнительной работой на каждый активный
      // кадр. Строка раздела (rbar) этим раундом (задание, пункт 5) больше НЕ
      // прячется вместе с шапкой+вкладками — она статична (position:sticky;
      // top:var(--top2), app.css), прячутся только .back-bar и .ic-booktabs
      // (единым движением, их синхронно переключает installScrollHide).
      // suppress — пока ЛЮБАЯ из двух панелей открыта ИЛИ ещё анимируется
      // (открывается/закрывается) шапку+вкладки держим показанными: см.
      // комментарий у makeRbSheet про sheetAnimating/transitionend — без учёта
      // анимации scroll-hide иначе может начать прятать их СРЕДИ анимации
      // закрытия (это и было дёрганьем, пункт 3 задачи прошлого раунда).
      // hideAt/showAt/minToggleGap (этот раунд, задание пункт 1 — «спокойнее»
      // в главе): было 26/10 без ограничения частоты — хватало короткого
      // смаха, и мелкое колебание прокрутки у края жеста могло переключить
      // видимость несколько раз подряд. Теперь прячет только после ≥80px
      // прокрутки вниз подряд, показывает после ≥40px вверх подряд, и не
      // чаще одного переключения за 400мс (см. installScrollHide выше).
      installBookHide({isActive:function(){ return gen === renderGen; }, onTick:paintPg,
        suppress:function(){
        return rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); });
      }});
      root.querySelectorAll("[data-ch]").forEach(function(b){ b.addEventListener("click",function(){ location.hash = chapterHref(book, b.getAttribute("data-ch")).replace(/^#/,""); }); });
      root.querySelectorAll(".ic-fig").forEach(function(f){ f.addEventListener("click",function(){ lightbox(f.getAttribute("data-src")); }); });
      root.querySelectorAll(".ic-ch-aside a").forEach(function(a){ a.addEventListener("click",function(){ namesUi.chVia = a.getAttribute("href"); }); });
      root.querySelectorAll(".ic-pgm-b").forEach(function(b){ b.addEventListener("click",function(){ openSv(book, pmRows, +b.getAttribute("data-pi")); }); });
      // figs — отдельная гравюра БЕЗ собственной подписи, стоящая перед найденным блоком (см.
      // комментарий у figsHtml выше); сам искомый текст лежит в блоке data-n=blockN, не в figs.
      // Раньше, когда перед найденным блоком стояла такая гравюра, целью прокрутки и подсветки
      // становилась именно она (figs[0]) — то есть чужой, более высокий элемент без искомого
      // слова, а не блок, который его на самом деле содержит. Теперь приоритет у текстового блока
      // всегда; figs только получает вспомогательную подсветку (ниже), не являясь целью прокрутки.
      var figs = okN ? root.querySelectorAll('.ic-ch-body [data-for="'+blockN+'"]') : [];
      var textTarget = okN ? root.querySelector('.ic-ch-body [data-n="'+blockN+'"]') : null;
      var target = okN ? (textTarget || (figs.length ? figs[0] : null)) : null;
      // hadSpecificTarget — был ли найден настоящий блок/картинка-цель ДО того,
      // как ниже на target может "по умолчанию" сесть первый блок диапазона
      // страницы (pgEls[0]) просто за неимением лучшего — см. комментарий у
      // hlLine ниже: эти два случая должны давать РАЗНУЮ геометрию метки.
      var hadSpecificTarget = !!target;
      var bodyEl = root.querySelector(".ic-ch-body"), pgEls = [];
      if(pgm && bodyEl){
        for(var bn = +pgm[1]; bn <= +pgm[2]; bn++){
          bodyEl.querySelectorAll('[data-for="'+bn+'"],[data-n="'+bn+'"]').forEach(function(el){ pgEls.push(el); });
        }
        if(pgEls.length && !target) target = pgEls[0];
      }
      // hlLine — тонкая серая черта на левом поле (см. hlMark выше). У записи
      // указателя часто известны И конкретный блок (термин найден на
      // странице), И диапазон блоков всей страницы (pgm, для метки "с. N" —
      // просто декоративная граница страницы издания). Раз есть настоящая
      // цель (hadSpecificTarget), черта идёт ПО НЕЙ (по высоте ровно этого
      // блока/картинки, через position:relative на самом target) — диапазон
      // страницы здесь не нужен как отдельная черта. Только когда настоящей
      // цели вообще нет (полкита — не нашли конкретный блок, pgEls[0] сел на
      // target лишь как резерв), черта идёт по всему диапазону (та же
      // геометрия, что раньше была у .ic-ch-pgline, пересчитывается в
      // snap() ниже по границам всех блоков диапазона). hlWords —
      // подчёркивания слова, уже вплетённые в разметку (см. markSpan у
      // inl()/blockHtml() и okN/wordSpec выше), если слово было известно —
      // у указателя/карточки гравюры их не бывает вовсе.
      var hlLine = null, hlWords = [], hlLineIsRange = false;
      if(hadSpecificTarget && target && okN){
        hlLine = hlMark(target);
        if(markSpan) hlWords = Array.prototype.slice.call(target.querySelectorAll(".ic-ch-mark"));
      } else if(pgEls.length && bodyEl){
        hlLine = hlMark(bodyEl, t("tvPage")+" "+pgm[3]);
        hlLineIsRange = true;
      }
      if(target){
        // Гравюра перед блоком по-прежнему мягко отмечается как сопутствующий элемент (не цель
        // прокрутки/видимости) — но больше не рамкой/заливкой, см. app.css: класс остался просто
        // вспомогательным маркером для будущего, без визуального эффекта сам по себе.
        if(okN && figs.length && figs[0]!==target) figs.forEach(function(f){ f.classList.add("ic-ch-fig-near"); });
        var headerOffset = headerStackH();
        // baseOff (задание, пункт 2) — ТЕКУЩЕЕ, реально действующее положение
        // низа строки раздела (.ic-rbar) в момент прыжка: берём её собственный
        // getBoundingClientRect().top (а не var(--top2)/0 напрямую, и БЕЗ
        // Math.max с headerOffset — проверено Playwright-прогоном: именно
        // этот max и обнулял весь смысл чтения реального .top, подставляя
        // назад полную headerOffset даже когда капсула уже снапнута к 0)
        // — это само по себе отражает оба состояния пункта 1 (строка на
        // var(--top2), когда шапка+меню книги видны, ИЛИ снапнута к top:0,
        // когда они спрятаны прокруткой), плюс её реальную высоту, плюс 16px
        // гарантированного зазора сверху цели. headerOffset (сумма высот
        // шапки+меню книги, без строки раздела) остаётся резервным —
        // используется ниже только как запасное значение, если .ic-rbar
        // почему-то не найден в DOM вовсе.
        // curBaseOff — пункт 2 этого раунда: НЕ читаем rbar.getBoundingClientRect().top
        // напрямую (нашли Playwright-прогоном: .ic-rbar теперь анимирует top
        // transition'ом .3s, пункт 1, и геометрия в момент самого переключения
        // класса — середина анимации, ещё не 0/не var(--top2)) — вместо этого
        // сами знаем ИТОГОВОЕ значение top по классу (.ic-rbar-snap => 0,
        // иначе headerStackH(), что и есть var(--top2) по построению), и берём
        // только высоту капсулы из реального прямоугольника (она не анимируется,
        // transition только на top). Это тот же принцип "текущее действующее
        // положение", просто без гонки с переходной анимацией.
        function curBaseOff(){
          if(!rbar) return headerOffset + 16;
          var stk0 = document.getElementById("ic-stack");
          var finalTop = (stk0 && stk0.classList.contains("ic-stack-hidden")) ? 0 : headerOffset;
          return finalTop + rbar.getBoundingClientRect().height + 16;
        }
        var snap = function(){
          if(gen !== renderGen) return;
          var baseOff = curBaseOff();
          if(hlLine && hlLineIsRange){
            var bt0 = bodyEl.getBoundingClientRect().top, t0 = Infinity, t1 = 0;
            pgEls.forEach(function(el){ var r = el.getBoundingClientRect(); t0 = Math.min(t0, r.top-bt0); t1 = Math.max(t1, r.bottom-bt0); });
            hlLine.style.top = t0+"px"; hlLine.style.height = Math.max(0, t1-t0)+"px";
          }
          var r = target.getBoundingClientRect(), off = baseOff;
          // Для цели типа "картинка+подпись" (data-n ведёт прямо на <figure>, окN) обычный
          // декоративный отступ (+24px сверху, помимо шапки) иногда — на считанные десятки
          // пикселей — обрезает нижний край подписи на телефонном экране, хотя сама фигура
          // целиком НЕ выше вьюпорта и прекрасно влезла бы с отступом чуть поменьше. В этом
          // случае (и только в нём — когда с обычным отступом не влезает, а с минимальным,
          // ровно под шапкой, без запаса, влезает) используем минимально необходимый отступ,
          // а не ужимаем его всегда и для всех целей без нужды.
          if(okN){
            var vh = window.innerHeight;
            // -2px запаса: при масштабе экрана (DPR) getBoundingClientRect() отдаёт дробные
            // пиксели, и попытка впихнуть высоту ровно в vh без запаса иногда на доли пикселя
            // всё равно перехлёстывает нижнюю границу из-за округления при вычислении scrollTo.
            if(headerOffset + r.height <= vh - 2 && baseOff + r.height > vh) off = Math.max(headerOffset, vh - r.height - 2);
          }
          window.scrollTo(0, window.scrollY + r.top - off);
        };
        snap();
        if(hlLine || hlWords.length) hlFadeOut(hlLine, hlWords, gen);
        // На медленной связи гравюры/шрифты выше цели могут догружаться ещё долго после первого
        // прыжка; ширина/высота у <img> заданы, но пока файл не пришёл, браузер иногда всё равно
        // чуть сдвигает раскладку (шрифт, декодирование картинки). Поэтому держим прицел на месте:
        // переповторяем snap() при каждой догрузке картинки и при готовности шрифтов, пока либо не
        // кончились картинки, либо читатель сам не тронул страницу (тогда переставать мешать).
        //
        // У Chromium это почти всегда избыточно: scroll anchoring сам компенсирует такие сдвиги.
        // У WebKit (все браузеры на iOS, включая не-Safari) scroll anchoring нет вовсе — ни один
        // сдвиг выше точки прокрутки не компенсируется автоматически, значит здесь это не защита
        // "на всякий случай", а единственный механизм вообще. Поэтому добавлен ResizeObserver на
        // body главы — это эшелон обороны против ЛЮБОГО источника сдвига (не только img/fonts: то
        // же самое может вызвать <details>, донабор строки веб-шрифтом без лейаут-события, которое
        // мы бы иначе отследили, и т.п.), а не только двух конкретных отслеживаемых событий.
        var stopped = false, ro = null, mo = null;
        if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if(!stopped && gen===renderGen) snap(); });
        function stop(){
          if(stopped) return;
          stopped = true;
          document.removeEventListener("wheel", stop);
          document.removeEventListener("touchstart", stop);
          document.removeEventListener("touchmove", stop);
          document.removeEventListener("keydown", stop);
          document.removeEventListener("pointerdown", stop);
          if(ro){ ro.disconnect(); ro = null; }
          if(mo){ mo.disconnect(); mo = null; }
        }
        // touchstart (а не только touchmove) — чтобы само касание экрана, ещё до какого-либо
        // движения пальцем, сразу считалось "пользователь взялся за страницу" и больше не мешать;
        // в задании это прямо отдельное условие ("тронул страницу"), не только факт прокрутки.
        document.addEventListener("wheel", stop, {passive:true, once:true});
        document.addEventListener("touchstart", stop, {passive:true, once:true});
        document.addEventListener("touchmove", stop, {passive:true, once:true});
        document.addEventListener("keydown", stop, {once:true});
        document.addEventListener("pointerdown", stop, {passive:true, once:true});
        var imgs = Array.prototype.slice.call(bodyEl.querySelectorAll("img"));
        var pending = imgs.filter(function(im){ return !im.complete; });
        pending.forEach(function(im){
          function onDone(){
            im.removeEventListener("load", onDone); im.removeEventListener("error", onDone);
            if(!stopped && gen === renderGen) snap();
          }
          im.addEventListener("load", onDone); im.addEventListener("error", onDone);
        });
        if(window.ResizeObserver){
          ro = new ResizeObserver(function(){ if(!stopped && gen===renderGen) snap(); });
          ro.observe(bodyEl);
        }
        // mo (пункт 2 этого раунда, найдено Playwright-проверкой): сам прыжок
        // снапа — большой разовый скачок window.scrollY за один тик — не
        // отличим для installScrollHide (app.js) от обычной быстрой
        // прокрутки читателем вниз: его independent rAF-цикл измеряет dy
        // между кадрами и, увидев этот скачок, может ТОЛЬКО ПОСЛЕ самого
        // snap() переключить класс ic-rbar-snap (пункт 1) — baseOff уже
        // посчитан и применён ДО этого переключения, по состоянию "шапка
        // ещё видна", и после переключения цель оказывается сдвинута от
        // капсулы на лишние ~header+booktabs px вместо 16px. Наблюдаем за
        // сменой класса #ic-rbar и пересчитываем snap() ещё раз, если она
        // случилась, — тот же защитный приём, что уже есть для догрузки
        // картинок/шрифтов/ResizeObserver выше, просто для ещё одного
        // источника сдвига «эффективного верха» цели.
        if(rbar && window.MutationObserver){
          mo = new MutationObserver(function(){ if(!stopped && gen===renderGen) snap(); });
          mo.observe(rbar, {attributes:true, attributeFilter:["class"]});
        }
        setTimeout(stop, 12000);
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
      // ordered() — тот же приём, что у renderNames (см. nmForm/nmLetterOf/
      // nmSortKey выше): при sort!=="it" список идёт по алфавиту ТЕКУЩЕГО
      // языка интерфейса (кириллица на ru, латиница на en/fr), а не жёстко
      // по русскому e.ru, как раньше (ruLetter читал только [А-Я]). Ветка
      // sort==="it" (порядок и буквы издания 1626 года) не трогается.
      function ordered(){
        if(tavolaUi.sort==="it") return d.entries.map(function(e){ return {e:e, l:e.letter}; });
        var loc = state.lang==="en" ? "en" : state.lang==="fr" ? "fr" : "ru";
        return d.entries.map(function(e){ var nm = nmForm(e); return {e:e, l:nmLetterOf(nm, loc), k:nmSortKey(nm)}; }).sort(function(a,b){
          return a.l===b.l ? a.k.localeCompare(b.k, loc) : a.l.localeCompare(b.l, loc);
        });
      }
      function lettersOf(list){ var out = []; list.forEach(function(x){ if(out.indexOf(x.l)<0) out.push(x.l); }); return out; }
      function pagesHtml(e){
        if(e.see){
          var tg = e.see_id && d.byId[e.see_id];
          return '<span class="ic-tv-see">'+esc(t("tvSee"))+' '+(tg ? '<a href="#" data-tv="'+esc(e.see_id)+'">'+esc(nmForm(tg))+'</a>' : esc(e.see))+'</span>';
        }
        if(!e.pages || !e.pages.length) return "";
        return '<span class="ic-tv-pg">'+esc(t("tvPage"))+' '+e.pages.map(function(p){
          var href = hrefFor(book, "ch/"+p.ch+"/"+(p.n||0)+(p.a ? "/"+p.a+"-"+p.b+"-"+p.p : ""));
          var note = p.printedPage ? ' <i class="ic-tv-pp">('+esc(t("tvPrinted",{n:p.printedPage}))+')</i>' : "";
          return '<a href="'+esc(href)+'" title="'+esc(t("tvOpen"))+'">'+p.p+'</a>'+note;
        }).join(", ")+'</span>';
      }
      function entryHtml(e, sub){
        // Крупно — форма на языке интерфейса (nmForm: en/fr/ru с фоллбэком),
        // мелко рядом — всегда e.it (итальянский оригинал для сверки с
        // книгой 1626 года, не меняется языком интерфейса).
        var nm = nmForm(e);
        return '<div class="ic-tv-'+(sub?"sub":"e")+'"'+(sub?"":' id="tv-'+e.id+'"')+'>'+
          '<div class="ic-tv-l"><span class="ic-tv-ru">'+esc(nm||e.it)+'</span>'+(nm ? ' <span class="ic-tv-it" lang="it">'+esc(e.it)+'</span>' : "")+'</div>'+
          pagesHtml(e)+'</div>';
      }
      // Подпись кнопки «Найти» — активная («Найти: Амур»), когда tavolaUi.q
      // не пуста, иначе нейтральная (tvSearchPh, как у прежнего placeholder).
      function tvSearchLabel(){ return tavolaUi.q ? t("tvSearchActive",{q:tavolaUi.q}) : t("tvSearchBtn"); }
      // Подпись кнопки сортировки — ТЕКУЩИЙ порядок (прямой переключатель,
      // без шторки): tvSortRu/tvSortIt — те же два i18n-ключа, что раньше
      // размечали два отдельных чипа .ic-tv-sort, теперь одна подпись.
      function tvSortLabel(){ return tavolaUi.sort==="it" ? t("tvSortIt") : t("tvSortRu"); }
      // Верх страницы — та же капсула .ic-rbar/.ic-rbar-row, что у панели
      // чтения главы (см. renderChapter), с тем же id="ic-rbar": страницы
      // показываются по очереди (root.innerHTML целиком заменяется на
      // навигации), так что совпадение id с читалкой не конфликтует, а даёт
      // бесплатно работающие updateSheetMaxH()/makeRbSheet's showBarsForced(),
      // которые ищут панель именно по этому id. Три ячейки вместо пяти:
      // [Книга][Найти][сортировка]. Горизонтальные буквы и счётчик больше не
      // помещаются в капсулу — перенесены ниже, в светлую часть .ic-wrap.ic-tv
      // (см. задание, пункт 1).
      root.innerHTML =
        bookTabsHtml(book, "index", {parentHref: coverHref(book)})+
        '<div id="ic-rb-dim"></div>'+
        '<div class="ic-ch-outer">'+
          '<div class="ic-rbar ic-rbar-tv" id="ic-rbar">'+
            '<div class="ic-rbar-row">'+
              '<button type="button" class="ic-rbar-tvsearch" data-rb="search" aria-pressed="false"><span class="ic-rbar-tvsearch-label">'+esc(tvSearchLabel())+'</span></button>'+
              '<button type="button" class="ic-rbar-sort" data-rb="sort"><span class="ic-rbar-sort-label">'+esc(tvSortLabel())+'</span></button>'+
            '</div>'+
            langSwitch()+
            '<div class="ic-rb-sheet" id="ic-tv-search-sheet">'+
              '<div class="ic-rb-sheet-slide">'+
                '<div class="ic-rb-sheet-panel">'+
                  '<div class="ic-rb-sheet-head">'+
                    '<form class="ic-home-search" role="search">'+
                      '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("tvSearchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("tvSearchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
                    '</form>'+
                    '<button type="button" class="ic-rb-sheet-close">'+esc(t("close"))+'</button>'+
                  '</div>'+
                  '<div class="ic-tv-sheet-foot"><p class="ic-tv-sheet-count"></p><button type="button" class="ic-tv-sheet-reset">'+esc(t("tvReset"))+'</button></div>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          // .ic-ch-outer должен обнимать ВСЮ страницу (капсулу + светлую
          // колонку ниже), а не только капсулу — иначе её собственная высота
          // (немногим больше капсулы) заканчивается почти сразу под ней, и
          // position:sticky у .ic-rbar отрывается от верха после первого же
          // небольшого скролла (тот же приём, что у .ic-ch-outer в
          // renderChapter, который оборачивает и .ic-rbar, и .ic-wrap.ic-ch-wrap).
          '<div class="ic-wrap ic-tv">'+
            '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmIndex"))+'</h1></header>'+
            '<p class="ic-tv-lead">'+esc(t("tvSub"))+'</p>'+
            '<nav class="ic-tv-letters-lt" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
            '<p class="ic-count ic-tv-count"></p>'+
            '<div class="ic-tv-list"></div>'+
            '<nav class="ic-az-rail" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
            '<div class="ic-az-peek" aria-hidden="true"></div>'+
          '</div>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      var rbar = root.querySelector("#ic-rbar"), rbarRow = root.querySelector(".ic-rbar-row");
      var sheetEl = root.querySelector("#ic-tv-search-sheet"), sheetInput = sheetEl.querySelector(".ic-search"),
          sheetCnt = sheetEl.querySelector(".ic-tv-sheet-count");
      var searchBtn = root.querySelector('[data-rb="search"]'), searchLabelEl = searchBtn.querySelector(".ic-rbar-tvsearch-label");
      var sortBtn = root.querySelector('[data-rb="sort"]'), sortLabelEl = sortBtn.querySelector(".ic-rbar-sort-label");
      var list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          lnav = root.querySelector(".ic-tv-letters-lt"),
          rail = root.querySelector(".ic-az-rail"), peek = root.querySelector(".ic-az-peek");
      sheetInput.value = tavolaUi.q;
      // azDragging — выставляется wireAzRail'ом на весь жест по рейлу (между
      // pointerdown и pointerup/cancel), читается в suppress ниже, чтобы на
      // это время заморозить скрытие капсулы (жест по буквам не должен
      // прятать шапку). Столбик сам больше НЕ синхронизирован с шапкой (см.
      // .ic-az-rail в app.css и syncAzRailBounds/buildAzRail выше) — azDragging
      // здесь только про suppress и про класс активности (яркость кнопок,
      // см. wireAzRail ниже). rbSheets — тот же паттерн взаимоисключения
      // шторок, что в renderChapter (здесь фактически только одна шторка, но
      // тот же общий механизм makeRbSheet этого требует).
      var azDragging = false, rbSheets = [];
      bindBookSearchSheet(root, book, gen, rbSheets);
      function updateSearchLabel(){ searchLabelEl.textContent = tvSearchLabel(); }
      function fill(){
        var words = tvFold(sheetInput.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        ordered().forEach(function(x){
          var e = x.e;
          if(words.length && !words.every(function(w){ return e.h.indexOf(w) >= 0; })) return;
          if(x.l !== cur){ if(cur) html += '</section>'; cur = x.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="tv-L'+cur+'"><h2>'+cur+'</h2>'; }
          n++;
          html += entryHtml(e, false) + (e.subs||[]).map(function(x){ return entryHtml(x, true); }).join("");
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        var countText = words.length ? t("tvFound",{n:n}) : t("tvAll",{n:d.entries.length});
        cnt.textContent = countText; sheetCnt.textContent = countText;
        lnav.innerHTML = lettersOf(ordered()).map(function(l){ return '<button type="button" data-l="'+l+'"'+(have[l] ? "" : " disabled")+'>'+l+'</button>'; }).join("");
        // Столбик на узких экранах — только буквы, у которых реально есть
        // статьи в текущем отборе (have), без disabled-кнопок вовсе.
        // Границы статичны (syncAzRailBounds сам читает актуальную высоту
        // капсулы) — buildAzRail меряет реально доступную высоту столбика
        // (она уже верна благодаря position:fixed;top/bottom в app.css,
        // независимо от текущего содержимого) и решает, нужен ли режим
        // «через одну» (см. задание, пункт 2).
        var railLetters = lettersOf(ordered()).filter(function(l){ return have[l]; });
        syncAzRailBounds();
        var built = buildAzRail(railLetters, null, rail.getBoundingClientRect().height);
        rail.innerHTML = built.html;
        rail.classList.toggle("ic-az-tight", built.tight);
        rail.classList.toggle("ic-az-paired", built.paired);
      }
      function barH(){ return rbar.getBoundingClientRect().height + headerStackH() + 10; }
      // Тот же маргинальный маркер и то же ~4-секундное угасание, что у
      // перехода в главу (hlMark/hlFadeOut выше) — раньше здесь была
      // отдельная заливка строки (.ic-ch-hl), резко пропадавшая через 2.2с;
      // теперь единая система на оба случая.
      function flash(el){ hlFadeOut(hlMark(el), [], gen); }
      function scrollToEl(el){ window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - barH()); }
      sheetInput.addEventListener("input",function(){ tavolaUi.q = sheetInput.value; updateSearchLabel(); fill(); });
      wireSearchClear(sheetInput);
      lnav.addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b) return;
        var el = document.getElementById("tv-L"+b.getAttribute("data-l")); if(el) scrollToEl(el);
      });
      wireAzRail(rail, peek, {
        // Прыжок именно во время ведения пальцем по рейлу (не тот же вызов,
        // что у tap-клика по горизонтальному ряду букв lnav выше — там
        // остаётся scrollToEl/двухаргументный scrollTo без изменений,
        // задание трогать его не просит) — объектный синтаксис с явным
        // behavior:"instant" (задание, пункт 2); WebKit его поддерживает,
        // не ломается и не игнорирует (проверено Playwright/WebKit, см.
        // отчёт).
        onPick: function(l){ var el = document.getElementById("tv-L"+l); if(el) window.scrollTo({top: window.scrollY + el.getBoundingClientRect().top - barH(), left:0, behavior:"instant"}); },
        onDragStart: function(){ azDragging = true; rail.classList.add("ic-az-rail-active"); },
        onDragEnd: function(){ azDragging = false; rail.classList.remove("ic-az-rail-active"); }
      });
      // Этот раунд (задание, пункт 5): строка раздела указателя (капсула
      // .ic-rbar-tv) теперь СТАТИЧНА (position:fixed;top:var(--top2),
      // app.css) и никогда не прячется — прячутся только .back-bar и
      // .ic-booktabs (общее меню книги), единым движением, через
      // installScrollHide (см. его подключение ниже, у az-rail).
      var sheetApi = makeRbSheet(sheetEl, searchBtn, {
        registry: rbSheets,
        onOpen: function(){ if(window.matchMedia && window.matchMedia("(pointer:fine)").matches) sheetInput.focus({preventScroll:true}); },
        onClose: function(){ sheetInput.blur(); }
      });
      sheetEl.querySelector(".ic-tv-sheet-reset").addEventListener("click", function(){
        sheetInput.value = ""; tavolaUi.q = ""; updateSearchLabel(); fill(); sheetInput.focus();
      });
      rbarRow.addEventListener("click", function(e){
        var b = e.target.closest("[data-rb]"); if(!b) return;
        var act = b.getAttribute("data-rb");
        if(act==="search"){ sheetApi.toggle(); return; }
        if(act==="sort"){
          tavolaUi.sort = tavolaUi.sort==="ru" ? "it" : "ru";
          sortLabelEl.textContent = tvSortLabel();
          fill(); window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH())));
          return;
        }
      });
      list.addEventListener("click",function(e){
        var a = e.target.closest("a");
        if(!a) return;
        if(a.hasAttribute("data-tv")){
          e.preventDefault();
          var id = d.byId[a.getAttribute("data-tv")].id, el = document.getElementById("tv-"+id);
          if(!el){ sheetInput.value = tavolaUi.q = ""; updateSearchLabel(); fill(); el = document.getElementById("tv-"+id); }
          if(el){ scrollToEl(el); flash(el); }
        } else {
          tavolaUi.scroll = window.scrollY; tavolaUi.via = a.getAttribute("href");
          // ru/it — оба поля записи (не только ru), чтобы контекстная подпись
          // в читалке могла показать итальянский текст на EN/FR интерфейсе
          // (см. chCtxLabel() в renderChapter) вместо замороженного в момент
          // клика русского label. tavola.json хранит it строкой (не массивом,
          // в отличие от names.json), поэтому дополнительного join не нужно.
          var tvRowEl = a.closest(".ic-tv-e,.ic-tv-sub");
          var tvRuEl = tvRowEl && tvRowEl.querySelector(".ic-tv-ru"), tvItEl = tvRowEl && tvRowEl.querySelector(".ic-tv-it");
          var tvRu = tvRuEl ? tvRuEl.textContent : "";
          chCtx = {hash: a.getAttribute("href"), type:"tavola", ru: tvRu, it: tvItEl ? tvItEl.textContent : tvRu};
        }
      });
      fill();
      syncHeaderStack();
      showBarsAlways();
      if(tavolaUi.scroll){ var y = tavolaUi.scroll; tavolaUi.scroll = 0; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
      else toTop(true);
      nudgeRepaint();
    });
  }

  /* ---------- имена (#/<slug>/names, #/<slug>/names/<id>; book.json "names": файл) ----------
     names.json строит tools/build_names.py: имена из глоссария с типом, гравюрами и упоминаниями в русском переводе.
     Упоминание — [глава, блок, позиция, длина, …] в тексте блока (у цитаты: строки через \n и «— автор»). */
  var namesCache = {}, namesUi = {q:"", ty:"all", pos:{}, via:"", chVia:""};
  // Откуда читатель попал в главу — для контекстной ссылки «К…» в новой панели
  // читалки (.ic-rbar). hash — адрес главы, на который действительно перешли
  // (сравнивается с location.hash при рендере главы, тот же приём, что и у
  // namesUi.chVia/tavolaUi.via); type различает четыре источника; label — то, что
  // показать читателю (статья указателя, имя, запрос поиска; у гравюры — пусто,
  // подпись статична). В памяти, без сохранения между перезагрузками — тот же
  // принятый в этом файле подход, что у namesUi/tavolaUi. ru/it — сырые поля
  // источника (а не готовая строка), чтобы язык подписи пересчитывался заново
  // при каждом рендере главы по текущему state.lang (см. chCtxLabel() в
  // renderChapter) — иначе подпись осталась бы «заморожена» на том языке,
  // на котором по записи кликнули, даже после переключения языка без
  // повторной навигации; label — для типов, где ru/it не применимы (search:
  // произвольный текст запроса пользователя, не поле из tavola/names.json).
  var chCtx = {hash:"", type:"", ru:"", it:"", label:""};
  // Типы chCtx, из которых можно попасть на карточку имени/гравюры (в
  // отличие от главы — см. CHAP_CTX_TYPES ниже): names/plates — переход со
  // списка (Имена/Гравюры), search — из результатов поиска, name — с
  // упоминания в ДРУГОЙ карточке имени (переход имя→имя или имя→гравюра).
  var CARD_CTX_TYPES = {names:1, search:1, plates:1, name:1};
  // Типы chCtx, из которых можно попасть в главу читалки: tavola — со
  // статьи указателя, plate — с карточки гравюры («Читать в главе»),
  // name — с упоминания в карточке имени, search — из результатов поиска.
  var CHAP_CTX_TYPES = {tavola:1, plate:1, name:1, search:1};
  // ctxActiveFor — общее ядро уголка-назад (round «nav-tabs», решение
  // Андрея): используется bookTabsHtml/bindBookBack (см. их объявление
  // выше) — показывает, что chCtx реально привёл именно на эту страницу
  // (а не просто где-то когда-то был выставлен по другому поводу).
  function ctxActiveFor(types){ return !!(types && chCtx.hash && chCtx.hash === location.hash && types[chCtx.type]); }
  // searchReopen — «вернуться к поиску»: открытие/закрытие выезжающей панели
  // поиска читалки (.ic-rb-sheet) НЕ меняет location.hash (это client-side
  // UI-состояние поверх текущей главы), поэтому chCtx (который сравнивается
  // с location.hash) здесь не годится как «куда вернуться». Когда читатель
  // открывает поиск на главе X и кликает по результату, ведущему на главу Y,
  // history.back() с Y вернёт на тот же hash X (он не менялся) — но панель
  // поиска сама не откроется заново без этой записи. hash — адрес главы X
  // (где сейчас открыт оверлей, в момент клика по результату), query — что
  // было введено в поле. Устанавливается в renderChapter (клик по ссылке
  // внутри .ic-rb-sheet), читается и обнуляется там же (в начале рендера
  // любой главы), чтобы не повторяться при будущих ре-рендерах того же hash.
  var searchReopen = null;
  var NM_TYPES = ["g","c","a","p","n"];
  // nmForm/nmLetterOf/nmFoldLatin — форма имени, по которой читатель
  // интерфейса EN/FR видит список «Имена», и буква, по которой эта форма
  // сортируется/группируется в алфавитный столбик. Раньше буква (e.l) и
  // порядок строк считались build_names.py один раз по русской форме —
  // теперь имя показывается и сортируется по форме ТЕКУЩЕГО языка интерфейса
  // (кириллица для ru, латиница для en/fr), поэтому и буква, и порядок
  // пересчитываются на клиенте при каждой перерисовке списка, не в build-
  // скрипте. nmFoldLatin снимает диакритику (NFD + strip combining marks —
  // тот же диапазон, что в tvFold выше), чтобы «É»/«Ê» и т.п. попадали под
  // свою базовую букву в алфавитном столбике и фильтре.
  function nmFoldLatin(s){ return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,""); }
  function nmForm(e){ return (state.lang==="en" ? e.en : state.lang==="fr" ? e.fr : e.ru) || e.ru || (e.it||[])[0] || ""; }
  // nmLetterOf(name, loc) — буква алфавитного столбика, ЯЗЫКОЗАВИСИМАЯ:
  // раньше регулярка искала первую подряд латинскую ИЛИ кириллическую букву
  // без привязки к текущему языку сортировки — у t0173 (tavola.json) форма
  // ru начинается с латинского "Deus" внутри русской фразы ("Deus: откуда
  // происходит"), и запись получала букву «D» в RU-столбике вместо верной
  // кириллической буквы. Теперь при loc==="ru" ищем СНАЧАЛА кириллицу
  // (латиница — только если во всей строке кириллицы вовсе нет, запасной
  // случай), при loc==="en"/"fr" — наоборот, латиницу первой.
  function nmLetterOf(name, loc){
    var s = nmFoldLatin(name).toUpperCase().replace(/Ё/g,"Е");
    var cyr = s.match(/[А-Я]/), lat = s.match(/[A-Z]/);
    var m = loc==="ru" ? (cyr || lat) : (lat || cyr);
    return m ? m[0] : "#";
  }
  function nmSortKey(name){ return nmFoldLatin(name).replace(/[«»\s]/g,""); }
  function loadNames(book, cb){
    if(namesCache[book.slug]){ cb(namesCache[book.slug]); return; }
    fetch(BASE+"books/"+book.slug+"/"+book.meta.names,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){
        d.byId = {};
        d.names.forEach(function(e){
          e.h = tvFold(e.ru+" "+(e.it||[]).join(" ")+" "+(e.v||[]).join(" ")+" "+(e.en||"")+" "+(e.fr||""));
          d.byId[e.id] = e;
        });
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
      // ordered() — список имён в порядке ТЕКУЩЕГО языка интерфейса: буква и
      // ключ сортировки считаются по nmForm(e) (кириллица на ru, латиница на
      // en/fr), а не по e.ru всегда, как раньше (e.l/e.k, посчитанные build-
      // скриптом). Пересчитывается при каждом fill(), включая переключение
      // языка без повторной навигации (bindLangSwitch перерисовывает страницу).
      function ordered(){
        var loc = state.lang==="en" ? "en" : state.lang==="fr" ? "fr" : "ru";
        return d.names.map(function(e){ var nm = nmForm(e); return {e:e, name:nm, l:nmLetterOf(nm, loc), k:nmSortKey(nm)}; })
          .sort(function(a,b){ return a.l===b.l ? a.k.localeCompare(b.k, loc) : a.l.localeCompare(b.l, loc); });
      }
      var letters = [];
      ordered().forEach(function(x){ if(letters.indexOf(x.l)<0) letters.push(x.l); });
      // Подпись кнопки «Найти» — та же схема, что в renderTavola (общий
      // ключ tvSearchActive), только нейтральная форма — nmSearchPh.
      function nmSearchLabel(){ return namesUi.q ? t("tvSearchActive",{q:namesUi.q}) : t("nmSearchPh"); }
      function nmTypeLabel(){ return t(namesUi.ty==="all" ? "nmAll" : "nmT_"+namesUi.ty); }
      // Верх страницы — та же капсула .ic-rbar/.ic-rbar-row, что у читалки и
      // у /index выше (см. подробный комментарий в renderTavola): id="ic-rbar"
      // переиспользуется без конфликта (страницы взаимоисключающие). Третья
      // ячейка здесь — НЕ прямой переключатель (типов пять+«Все», не два),
      // а кнопка, открывающая отдельную выезжающую шторку выбора типа
      // (makeRbSheet, тот же механизм, что у шторки «Содержание» читалки).
      root.innerHTML =
        bookTabsHtml(book, "names", {parentHref: coverHref(book)})+
        '<div id="ic-rb-dim"></div>'+
        '<div class="ic-ch-outer">'+
          '<div class="ic-rbar ic-rbar-tv" id="ic-rbar">'+
            '<div class="ic-rbar-row">'+
              '<button type="button" class="ic-rbar-tvsearch" data-rb="search" aria-pressed="false"><span class="ic-rbar-tvsearch-label">'+esc(nmSearchLabel())+'</span></button>'+
              '<button type="button" class="ic-rbar-sort" data-rb="type" aria-pressed="false"><span class="ic-rbar-sort-label">'+esc(nmTypeLabel())+'</span></button>'+
            '</div>'+
            langSwitch()+
            '<div class="ic-rb-sheet" id="ic-tv-search-sheet">'+
              '<div class="ic-rb-sheet-slide">'+
                '<div class="ic-rb-sheet-panel">'+
                  '<div class="ic-rb-sheet-head">'+
                    '<form class="ic-home-search" role="search">'+
                      '<span class="ic-search-wrap"><input class="ic-search" type="search" placeholder="'+esc(t("nmSearchPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("nmSearchPh"))+'"><button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
                    '</form>'+
                    '<button type="button" class="ic-rb-sheet-close">'+esc(t("close"))+'</button>'+
                  '</div>'+
                  '<div class="ic-tv-sheet-foot"><p class="ic-tv-sheet-count"></p><button type="button" class="ic-tv-sheet-reset">'+esc(t("tvReset"))+'</button></div>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="ic-rb-sheet" id="ic-tv-type-sheet">'+
              '<div class="ic-rb-sheet-slide">'+
                '<div class="ic-rb-sheet-panel">'+
                  '<div class="ic-rb-sheet-head"><span class="ic-rb-sheet-head-title">'+esc(t("nmTypeLabel"))+'</span><button type="button" class="ic-rb-sheet-close">'+esc(t("close"))+'</button></div>'+
                  '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("nmTypeLabel"))+'">'+
                    ["all"].concat(NM_TYPES).map(function(k){
                      return tcount[k] ? '<button type="button" class="ic-tv-typerow" data-ty="'+k+'" aria-pressed="'+(namesUi.ty===k)+'"><span>'+esc(t(k==="all" ? "nmAll" : "nmT_"+k))+'</span><span class="ic-tv-typecount">'+tcount[k]+'</span></button>' : "";
                    }).join("")+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          // См. тот же комментарий в renderTavola — .ic-ch-outer должен
          // обнимать всю страницу, иначе position:sticky капсулы отрывается
          // от верха почти сразу после начала скролла.
          '<div class="ic-wrap ic-tv ic-nm">'+
            '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmNames"))+'</h1></header>'+
            '<p class="ic-tv-lead">'+esc(t("nmSub"))+'</p>'+
            '<nav class="ic-tv-letters-lt" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
            '<p class="ic-count ic-tv-count"></p>'+
            '<div class="ic-tv-list"></div>'+
            '<nav class="ic-az-rail" aria-label="'+esc(t("tvLetters"))+'"></nav>'+
            '<div class="ic-az-peek" aria-hidden="true"></div>'+
          '</div>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      var rbar = root.querySelector("#ic-rbar"), rbarRow = root.querySelector(".ic-rbar-row");
      var sheetEl = root.querySelector("#ic-tv-search-sheet"), sheetInput = sheetEl.querySelector(".ic-search"),
          sheetCnt = sheetEl.querySelector(".ic-tv-sheet-count");
      var searchBtn = root.querySelector('[data-rb="search"]'), searchLabelEl = searchBtn.querySelector(".ic-rbar-tvsearch-label");
      var typeBtn = root.querySelector('[data-rb="type"]'), typeLabelEl = typeBtn.querySelector(".ic-rbar-sort-label"), typeSheetEl = root.querySelector("#ic-tv-type-sheet");
      var list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          lnav = root.querySelector(".ic-tv-letters-lt"),
          rail = root.querySelector(".ic-az-rail"), peek = root.querySelector(".ic-az-peek");
      sheetInput.value = namesUi.q;
      // azDragging/rbSheets — см. тот же комментарий в renderTavola (только
      // suppress и класс активности столбика, не синхронизация позиции);
      // здесь rbSheets реально взаимоисключает ДВЕ шторки (поиск и тип).
      var azDragging = false, rbSheets = [];
      bindBookSearchSheet(root, book, gen, rbSheets);
      function updateSearchLabel(){ searchLabelEl.textContent = nmSearchLabel(); }
      function updateTypeLabel(){ typeLabelEl.textContent = nmTypeLabel(); }
      function fill(){
        var words = tvFold(sheetInput.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        ordered().forEach(function(x){
          var e = x.e;
          if(namesUi.ty !== "all" && e.t !== namesUi.ty) return;
          if(words.length && !words.every(function(w){ return e.h.indexOf(w) >= 0; })) return;
          if(x.l !== cur){ if(cur) html += '</section>'; cur = x.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="nm-L'+(cur==="#" ? "0" : cur)+'"><h2>'+cur+'</h2>'; }
          n++;
          html += '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'">'+
            '<span class="ic-tv-l"><span class="ic-tv-ru">'+esc(x.name)+'</span> <span class="ic-tv-it" lang="it">'+esc((e.it||[]).join(" · "))+'</span></span>'+
            '<span class="ic-nm-meta"><span class="ic-nm-type">'+esc(t("nmT1_"+e.t))+'</span>'+(e.n ? '<span class="ic-nm-n">'+e.n+'</span>' : "")+'</span></a>';
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        var countText = (words.length || namesUi.ty!=="all") ? t("nmFound",{n:n}) : t("nmTotal",{n:d.names.length});
        cnt.textContent = countText; sheetCnt.textContent = countText;
        lnav.innerHTML = letters.map(function(l){ return '<button type="button" data-l="'+(l==="#" ? "0" : l)+'"'+(have[l] ? "" : " disabled")+'>'+l+'</button>'; }).join("");
        // Столбик на узких экранах — только буквы, для которых реально есть
        // статьи при текущих отборе/фильтре типа (have), без disabled-кнопок.
        // См. комментарий у того же места в renderTavola — границы столбика
        // статичны, buildAzRail сам решает про режим «через одну».
        var railLetters = letters.filter(function(l){ return have[l]; });
        syncAzRailBounds();
        var built = buildAzRail(railLetters, function(l){ return l==="#" ? "0" : l; }, rail.getBoundingClientRect().height);
        rail.innerHTML = built.html;
        rail.classList.toggle("ic-az-tight", built.tight);
        rail.classList.toggle("ic-az-paired", built.paired);
      }
      function barH(){ return rbar.getBoundingClientRect().height + headerStackH() + 10; }
      sheetInput.addEventListener("input",function(){ namesUi.q = sheetInput.value; updateSearchLabel(); fill(); });
      wireSearchClear(sheetInput);
      lnav.addEventListener("click",function(e){
        var b = e.target.closest("button"); if(!b) return;
        var el = document.getElementById("nm-L"+b.getAttribute("data-l"));
        if(el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - barH());
      });
      wireAzRail(rail, peek, {
        // См. тот же комментарий в renderTavola — ТОЛЬКО прыжок во время
        // ведения пальцем по рейлу получает объектный синтаксис с явным
        // behavior:"instant" (задание, пункт 2); остальные scrollTo в этом
        // файле (строка ниже у lnav, восстановление позиции и т.п.) не
        // трогаются.
        onPick: function(dl){ var el = document.getElementById("nm-L"+dl); if(el) window.scrollTo({top: window.scrollY + el.getBoundingClientRect().top - barH(), left:0, behavior:"instant"}); },
        onDragStart: function(){ azDragging = true; rail.classList.add("ic-az-rail-active"); },
        onDragEnd: function(){ azDragging = false; rail.classList.remove("ic-az-rail-active"); }
      });
      // Капсула/шапка здесь больше НЕ прячутся при скролле — см. тот же
      // комментарий в renderTavola (пункт 1 задания).
      var sheetApi = makeRbSheet(sheetEl, searchBtn, {
        registry: rbSheets,
        onOpen: function(){ if(window.matchMedia && window.matchMedia("(pointer:fine)").matches) sheetInput.focus({preventScroll:true}); },
        onClose: function(){ sheetInput.blur(); }
      });
      sheetEl.querySelector(".ic-tv-sheet-reset").addEventListener("click", function(){
        sheetInput.value = ""; namesUi.q = ""; updateSearchLabel(); fill(); sheetInput.focus();
      });
      var typeSheetApi = makeRbSheet(typeSheetEl, typeBtn, {registry: rbSheets});
      typeSheetEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
        var b = e.target.closest("button"); if(!b) return;
        namesUi.ty = b.getAttribute("data-ty");
        typeSheetEl.querySelectorAll(".ic-tv-typerow").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        updateTypeLabel(); fill(); typeSheetApi.close();
        window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH())));
      });
      rbarRow.addEventListener("click", function(e){
        var b = e.target.closest("[data-rb]"); if(!b) return;
        var act = b.getAttribute("data-rb");
        if(act==="search"){ sheetApi.toggle(); return; }
        if(act==="type"){ typeSheetApi.toggle(); return; }
      });
      list.addEventListener("click",function(e){
        var a = e.target.closest("a.ic-nm-row");
        if(a){
          namesUi.pos[location.hash] = window.scrollY; namesUi.via = a.getAttribute("href");
          // chCtx — этот раунд, задание пункт 2: карточка имени читает это
          // (type:"names") для строки «Назад: Имена» — тот же общий
          // контекст-механизм, что у чтения глав (renderChapter), просто
          // другой тип назначения.
          chCtx = {hash: a.getAttribute("href"), type:"names"};
        }
      });
      fill();
      syncHeaderStack();
      showBarsAlways();
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
    var gal = pls.length ? '<h2 class="ic-nm-h">'+esc(t("nmPlates"))+'</h2><ul class="ic-gal" data-gal="1">'+pls.map(function(g){
      // width/height (пункт 7) — из w/h гравюры в plates.json, тот же приём,
      // что уже был у renderPlateCard (p.w/p.h) — задаёт реальную пропорцию
      // карточки сразу, без letterbox-рамки и без прыжка раскладки при
      // догрузке файла. Номер страницы (пункт 8) — мелким приглушённым
      // текстом под названием, тот же platePageStr, что у карточки гравюры.
      var gPg = platePageStr(g.page);
      return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book, "plate/"+g.id))+'">'+
        '<span class="ic-gal-img"><img loading="lazy" src="'+esc(engBase+"thumb/"+g.file+"_t.webp")+'"'+(g.w && g.h ? ' width="'+g.w+'" height="'+g.h+'"' : "")+' alt=""></span>'+
        '<span class="ic-gal-cap">'+esc(plTitle(chap, g))+(gPg ? '<small class="ic-gal-pg">'+esc(gPg)+'</small>' : "")+'</span></a></li>';
    }).join("")+'</ul>' : "";
    // Пункт 15 этого раунда: главу "catalogo-autori" книга (не ошибка данных
    // — см. задание) упоминает дважды подряд почти целиком (два издания
    // внутри одной главы) — один и тот же автор может иметь два РАЗНЫХ по
    // номеру блока, но БАЙТОВО идентичных по тексту упоминания в одной
    // группе главы. Схлопываем такие в ОДНУ строку (ссылка — на первое) с
    // счётчиком "×N", не теряя при этом различающиеся упоминания (сравнение
    // по точному тексту блока, не по номеру главы/эвристике). totalCollapsed
    // — пересчитанный итог для сводки (nmStat) ниже: число ВИДИМЫХ строк, а
    // не сырых совпадений e.n.
    var totalCollapsed = 0;
    var ments = order.map(function(ci){
      var slug = d.chapters[ci], ch = chap && chap.bySlug[slug];
      if(!ch || !ch.blocks) return "";
      var rows = [];
      byCh[ci].forEach(function(m){
        var b = ch.blocks[m[1]-1];
        if(!b) return;
        var text = nmBlockText(b);
        var dup = rows.filter(function(row){ return row.text === text; })[0];
        if(dup){ dup.count++; return; }
        rows.push({m:m, text:text, count:1});
      });
      totalCollapsed += rows.length;
      return '<section class="ic-nm-ch"><h3>'+esc(chapTitle(ch))+' <span class="ic-nm-chn">'+rows.length+'</span></h3><ul class="ic-nm-ms">'+rows.map(function(row){
        var m = row.m, badge = row.count > 1 ? ' <span class="ic-nm-chn">×'+row.count+'</span>' : "";
        return '<li><a href="'+esc(chapterHrefWord(book, slug, m[1], m.slice(2)))+'">'+nmSnippet(row.text, m.slice(2))+'</a>'+badge+'</li>';
      }).join("")+'</ul></section>';
    }).join("");
    root.innerHTML =
      // Пункт 13 этого раунда: карточка имени — обычная страница, НЕ список
      // (fixed:false — см. комментарий у bookTabsHtml выше); обёртка больше
      // не несёт .ic-tv (margin-top:var(--tv-content-top) — компенсация под
      // ФИКСИРОВАННЫЙ .ic-rbar-tv указателя/«Имён», которого здесь вообще
      // нет), только .ic-wrap ic-nm — та же база, что у Текста/Гравюр/Поиска
      // (пункт 17 — одинаковая отбивка сверху у всех страниц без строки
      // раздела).
      '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, "names", {parentHref: hrefFor(book, "names"), ctxTypes: CARD_CTX_TYPES})+'</div>'+
      '<div class="ic-wrap ic-nm">'+
        '<div class="ic-top-row">'+langSwitch()+'</div>'+
        // Строка-крошка перед киккером (тип записи) — раздел, из которого
        // пришли, теперь решает только уголок-назад общего меню (round
        // «nav-tabs», bindBookBack).
        '<header class="ic-head"><p class="ic-kicker">'+esc(t("hmNames"))+' · '+esc(t("nmT1_"+e.t))+'</p><h1 class="ic-h-fr">'+esc(nmForm(e))+'</h1>'+
          ((e.it||[]).length ? '<p class="ic-nm-it" lang="it">'+esc(e.it.join(" · "))+'</p>' : "")+'</header>'+
        gal+
        '<h2 class="ic-nm-h">'+esc(t("nmMentions"))+'</h2>'+
        '<p class="ic-count">'+esc(totalCollapsed ? t("nmStat",{n:totalCollapsed, c:order.length}) : t("nmNoMentions"))+'</p>'+
        ments+
      '</div>';
    bindLangSwitch(root);
    bindBookBack(root);
    bindBookSearchSheet(root, book, gen, []);
    root.addEventListener("click",function(ev){
      var a = ev.target.closest(".ic-nm-ms a");
      if(a){
        namesUi.pos[location.hash] = window.scrollY; namesUi.chVia = a.getAttribute("href");
        // it — массив (names.json), склеивается тем же разделителем " · ",
        // что и везде в рендере имён выше (ic-tv-it/ic-nm-it, см. e.it.join).
        chCtx = {hash: a.getAttribute("href"), type:"name", ru: e.ru, it: (e.it||[]).join(" · ") || e.ru};
        return;
      }
      // Галерея гравюр этого имени (пункт 2 этого раунда) — карточка
      // гравюры, открытая отсюда, должна уметь показать «Назад: <это имя>»
      // (chCtx.type==="name", см. ctxActiveFor/CARD_CTX_TYPES) — тот же общий тип, что уже
      // задаёт переход имя→глава по ссылке на упоминание выше, просто другая
      // цель (гравюра вместо главы читает его точно так же).
      var g = ev.target.closest('[data-gal] a.ic-gal-item');
      if(g){
        namesUi.pos[location.hash] = window.scrollY;
        chCtx = {hash: g.getAttribute("href"), type:"name", ru: e.ru, it: (e.it||[]).join(" · ") || e.ru};
      }
    });
    var y = namesUi.pos[location.hash];
    if(y){ delete namesUi.pos[location.hash]; requestAnimationFrame(function(){ if(gen===renderGen) window.scrollTo(0,y); }); }
    else toTop(true);
    syncHeaderStack();
    installBookHide({isActive:function(){ return gen===renderGen; }});
    nudgeRepaint();
  }

  /* ---------- содержание книги по частям (book.json chapters.parts) ---------- */
  function chapTitle(c){ return ((state.lang==="en" || state.lang==="fr") && c["title_"+state.lang] ? c["title_"+state.lang] : c.title).replace(/\s*\(вступление\)$/,""); }
  // Короткие формы заголовков глав — только для тех ~9 из 25, чьи полные
  // названия слишком длинны для «панели читалки» на телефоне (.ic-rbar-pos-ch
  // на ≤620px, см. app.css): не обрезка по словам, а осмысленное сокращение
  // (как rbTopShort выше). Имена богов (saturno…gratie) и так
  // короткие — для них записи нет, chapTitleShort возвращает chapTitle(c).
  var CHAP_SHORT = {
    "frontespizio-dedica":        {ru:"Титульный лист",       en:"Title page",            fr:"Page de titre"},
    "prefatione":                 {ru:"Предисловие",          en:"Preface",               fr:"Préface"},
    "catalogo-dei":               {ru:"Каталог богов",        en:"Catalogue of gods",     fr:"Catalogue des dieux"},
    "catalogo-autori":            {ru:"Каталог авторов",      en:"Catalogue of authors",  fr:"Catalogue des auteurs"},
    "proemio":                    {ru:"Образы богов",         en:"Images of the gods",    fr:"Images des dieux"},
    "annotationi-pignoria":       {ru:"Аннотации Пиньории",   en:"Pignoria’s annotations",fr:"Annotations de Pignoria"},
    "aggionta":                   {ru:"Прибавление Пиньории", en:"Pignoria’s addition",   fr:"Addition de Pignoria"},
    "seconda-parte-titolo-dedica":{ru:"Второй титульный лист",en:"Second title page",     fr:"Second titre"},
    "seconda-parte-indiani":      {ru:"Боги индийские",       en:"Gods of the Indians",   fr:"Dieux des Indiens"}
  };
  function chapTitleShort(c){
    var e = c && CHAP_SHORT[c.slug];
    return e ? (e[state.lang] || e.ru) : chapTitle(c);
  }
  function tocPartsHtml(book, chap, curSlug){
    var parts = (book.meta.chapters && book.meta.chapters.parts) || [], used = {};
    function link(c){
      return '<li><a href="'+esc(chapterHref(book, c.slug))+'"'+(c.slug===curSlug?' aria-current="page"':"")+((trLang(book) ? c[trLang(book)] : c.blocks)?"":' class="ic-ch-off"')+'>'+esc(chapTitle(c))+'</a></li>';
    }
    function extra(x){ return '<li><a href="'+esc(hrefFor(book, x.to))+'">'+esc(bt(x.title))+'</a></li>'; }
    // chap — null, если его загрузка не удалась (loadChapters, см. его
    // комментарий: попытка не кэшируется навсегда именно ради следующей,
    // повторной попытки) — у вызывающей стороны (renderChapter/renderBookText/
    // openChapToc) в этот момент уже нечего показывать в самом списке глав,
    // но пункт «Библиотека»/обложка (home ниже) не зависит от chap вообще и
    // должен остаться доступным даже тогда.
    var groups = chap ? parts.map(function(pt){
      var cs = pt.slugs.map(function(sl){ used[sl] = 1; return chap.bySlug[sl]; }).filter(Boolean);
      var li = cs.map(function(c){
        var after = (pt.links || []).filter(function(x){ return x.after===c.slug && (x.to!=="index" || book.meta.tavola); });
        return link(c)+after.map(extra).join("");
      }).join("");
      return cs.length ? '<section class="ic-toc-part"><h3>'+esc(bt(pt.name))+'</h3><ol>'+li+'</ol></section>' : "";
    }) : [];
    var rest = chap ? chap.list.filter(function(c){ return !used[c.slug]; }) : [];
    if(rest.length) groups.push('<section class="ic-toc-part"><ol>'+rest.map(link).join("")+'</ol></section>');
    // Выход на главную книги из списка глав: уголок-назад общего меню при
    // активном контексте перехода (chCtx) ведёт туда, откуда пришли, а не
    // на обложку — переход на обложку в этом случае остаётся доступен
    // здесь, первым пунктом выезжающего списка глав.
    var home = book.meta.home ? '<section class="ic-toc-part"><ol><li><a href="'+esc(coverHref(book))+'">'+esc(t("tvBack"))+'</a></li></ol></section>' : "";
    return home+groups.join("");
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
  function plTitle(chap, p){ return state.lang==="fr" && chap && chap.pl ? t("plateTitle",{n:chap.pl.list.indexOf(p)+1}) : p.title; }
  // on — больше никогда не делает плитку визуально "уже нажатой" (вызовы
  // ниже всегда передают false): раньше aria-current="page" на вкладке
  // tab==="read"/"gallery"/"search" давало плитке вид предварительно
  // выбранной (акцентная рамка, см. правило [aria-current] в app.css),
  // что читалось как "уже нажато" при обычном заходе на /home. Параметр
  // оставлен (а не удалён) только для обратной совместимости вызовов —
  // живой tap-feedback вместо него теперь даёт :active в CSS.
  // Пункт 12 этого раунда: большие плитки .ic-home-tile-t/-s заменены
  // компактным списком строк по образцу .secs a макета book-structure.html
  // (заголовок <b> + одна строка описания <span>) — те же строки i18n
  // (hmReadSub/hmGallerySub/... — не новые), просто другая разметка/CSS
  // (см. .ic-home-tile/b/span в app.css). on/attrs — как раньше.
  function homeTile(href, title, sub, on, attrs){
    return '<a class="ic-home-tile" href="'+esc(href)+'"'+(on?' aria-current="page"':"")+(attrs||"")+'><b>'+esc(title)+'</b><span>'+esc(sub)+'</span></a>';
  }
  /* ---------- поиск по книге (#/<slug>/search; книги с home и chapters) ----------
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
    // Пункт 15(б) этого раунда — read-only аудит нашёл, что здесь (в отличие
    // от гравюр/указателя, где виден номер страницы) этот же паттерн двух
    // изданий в главе catalogo-autori ДЕЙСТВИТЕЛЬНО выглядел бы как
    // визуальный дубль: строка результата показывает только главу и обрезок
    // текста, без номера блока/страницы, так что два байтово идентичных
    // абзаца (из разных изданий) неотличимы на глаз. ВАЖНО: такие пары НЕ
    // обязательно соседние в списке после сортировки по k (блок первого
    // печатания N и блок второго печатания N+39, см. задание) — между парой
    // одного абзаца обычно стоит пара ДРУГОГО абзаца с меньшим N+39, чем N
    // текущего (сортировка чисто по номеру блока чередует 2 разных абзаца:
    // A(n1), B(n2), A(n1+39), B(n2+39)). Поэтому ищем совпадение по ВСЕМУ
    // уже накопленному списку (по тексту r.raw + языку it/ru), а не только по
    // непосредственно предыдущей записи — тот же приём схлопывания, что у
    // карточки имени (пункт 15а выше), просто без предположения о соседстве.
    (function(){
      var out = [], byText = {};
      tx.forEach(function(h){
        var key = (h.it ? "it|" : "ru|")+h.r.raw;
        var first = byText[key];
        if(first){ first.count = (first.count||1)+1; return; }
        byText[key] = h;
        out.push(h);
      });
      tx = out;
    })();
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
      // Внутренний кэш "свёрнутый ru"/"свёрнутый it" для ранжирования — НЕ
      // "fr"/"fi": names.json отдал имени e.fr настоящее поле (французская
      // форма) ещё в прошлом раунде локализации, так что ленивая
      // инициализация тут никогда не срабатывала (e.fr почти всегда задано),
      // e._srIt оставался настоящим undefined, и .indexOf падал. Префикс
      // _sr гарантированно не пересекается ни с одним реальным полем
      // источников книги (проверено по факту: `grep -o '"[a-zA-Z_]*":'
      // books/cartari/*.json` не даёт ни одного ключа, начинающегося на _).
      if(e._srRu === undefined){ e._srRu = tvFold(e.ru); e._srIt = tvFold((e.it||[]).join(" ")); }
      nm.push({e:e, k:(e._srRu.indexOf(tw[0].w) === 0 || e._srIt.indexOf(tw[0].w) === 0) ? 0 : 1});
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
      // Итальянский текст (h.it) — отдельная языковая версия страницы 1626 года,
      // позиция слова в НЕЙ не совпадает с позицией в русском переводе того же
      // блока, поэтому для этой ветки — только обычная ссылка на блок, без
      // подчёркивания слова (нечего честно подчёркивать, см. задание про "не
      // домысливать точность, которой нет").
      var dupBadge = h.count > 1 ? ' <span class="ic-nm-chn">×'+h.count+'</span>' : "";
      if(h.it) return '<li><a class="ic-sr-a" href="'+esc(chapterHref(book, ch.slug, r.m.block))+'"><span class="ic-sr-meta">'+esc(chapTitle(ch))+' · '+esc(pgLabel(r.m.label))+' · '+esc(t("srItOrig"))+'</span>'+
        '<span class="ic-sr-snip ic-sr-it" lang="it">'+nmSnippet(r.raw, h.sp)+'</span></a>'+dupBadge+'</li>';
      return '<li><a class="ic-sr-a" href="'+esc(chapterHrefWord(book, ch.slug, r.n, h.sp))+'"><span class="ic-sr-meta">'+esc(chapTitle(ch))+'</span>'+
        '<span class="ic-sr-snip" lang="ru">'+nmSnippet(r.raw, h.sp)+'</span></a>'+dupBadge+'</li>';
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
      return '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'"><span class="ic-tv-l"><span class="ic-tv-ru">'+esc(nmForm(e))+'</span> <span class="ic-tv-it" lang="it">'+esc((e.it||[]).join(" · "))+'</span></span>'+
        '<span class="ic-nm-meta"><span class="ic-nm-type">'+esc(t("nmT1_"+e.t))+'</span>'+(e.n ? '<span class="ic-nm-n">'+e.n+'</span>' : "")+'</span></a>';
    }
    function tvPages(e){
      if(e.see || !e.pages || !e.pages.length) return "";
      return '<span class="ic-tv-pg">'+esc(t("tvPage"))+' '+e.pages.slice(0, 8).map(function(p){
        var note = p.printedPage ? ' <i class="ic-tv-pp">('+esc(t("tvPrinted",{n:p.printedPage}))+')</i>' : "";
        return '<a href="'+esc(hrefFor(book, "ch/"+p.ch+"/"+(p.n||0)+(p.a ? "/"+p.a+"-"+p.b+"-"+p.p : "")))+'" title="'+esc(t("tvOpen"))+'">'+p.p+'</a>'+note;
      }).join(", ")+(e.pages.length > 8 ? " …" : "")+'</span>';
    }
    function tvLine(e){ var nm = nmForm(e); return '<div class="ic-tv-l"><span class="ic-tv-ru">'+esc(nm||e.it)+'</span>'+(nm ? ' <span class="ic-tv-it" lang="it">'+esc(e.it)+'</span>' : "")+'</div>'; }
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
        if(el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - headerStackH() - 12);
        return;
      }
      if(a && a.getAttribute("href")){
        var h = a.getAttribute("href");
        namesUi.pos[location.hash] = window.scrollY; namesUi.via = h; namesUi.chVia = h;
        // chCtx — этот раунд, задание пункт 2: строка «Назад: Поиск» на
        // карточке имени/гравюры нужна от ТЕХ ЖЕ результатов поиска, что и
        // «К поиску» в читалке главы — расширил условие с /ch/ на /names/ и
        // /plate/ (тип "search" общий, читает его renderNameCard/
        // renderPlateCard так же, как renderChapter).
        if(/\/ch\/|\/names\/|\/plate\//.test(h)) chCtx = {hash: h, type:"search", label: q.value};
      }
    });
    paint();
    srLoad(book, book.chap, function(c){
      if(gen !== renderGen) return;
      ctx = c; paint();
      if(restoreY) requestAnimationFrame(function(){ if(gen === renderGen) window.scrollTo(0, restoreY); });
    });
  }

  // renderHome — обложка книги (#/<slug>, базовый адрес без суффикса,
  // задание этого раунда, пункт 2): название/автор/издание/гравюра/blurb +
  // список пяти разделов-карточек (ведут на новые самостоятельные страницы
  // text/plates/index/names/search, не на вкладки). Плитка «Читать»/
  // «Продолжить» и вся логика localStorage (loadLastRead/saveLastRead),
  // плитка «Содержание» (openChapToc) и встроенные вкладки gallery/search
  // убраны целиком — это теперь отдельные страницы (renderBookText/
  // renderBookPlates/renderBookSearch ниже), без состояния на обложке.
  function renderHome(book){
    var gen = renderGen, h = book.meta.home;
    restoreState(book.slug);
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var engBase = engBaseOf(book);
      var hero = h.hero ? engBase+h.hero : "";
      var galCount = galleryEntries(chap).length;
      var orn = book.ornaments, ornRec = function(type, seed){ return orn && pickOrnament(orn[type], "home|"+seed); };
      var hp = ornRec("headpiece","head");
      // Концовка обложки — тот же легкий divider (не полновесный tailpiece),
      // что и в прошлых раундах, см. подробное обоснование там же (density
      // <= 0.1 из ornaments.json, сид "home|tailLight").
      var tpRec = (function(){
        var list = orn && orn.tailpiece;
        if(!list || !list.length) return null;
        var light = list.filter(function(o){ return (o.density||1) <= 0.1; });
        var pool = light.length ? light : list;
        return pool[strHash("home|tailLight") % pool.length];
      })();
      // Пять разделов-карточек (задание, пункт 2) — те же .ic-home-tile, что
      // раньше показывали плитки «Читать»/«Содержание»/«Гравюры»/«Поиск»/
      // «Указатель»/«Имена», теперь ведут на пять самостоятельных страниц.
      var secs = [
        homeTile(hrefFor(book,"text"), t("bkTabText"), t("hmReadSub"), false),
        homeTile(hrefFor(book,"plates"), t("hmGallery"), t("hmGallerySub",{n:galCount}), false)
      ];
      if(book.meta.tavola) secs.push(homeTile(hrefFor(book,"index"), t("hmIndex"), t("hmIndexSub"), false));
      if(book.meta.names) secs.push(homeTile(hrefFor(book,"names"), t("hmNames"), t("hmNamesSub"), false));
      secs.push(homeTile(hrefFor(book,"search"), t("hmSearch"), t("hmSearchSub"), false));
      root.innerHTML =
        '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, null, {parentHref: "#/", hide: forcedBook})+'</div>'+
        '<div class="ic-wrap ic-home">'+
          // Пункт 1 этого раунда: ссылка «Библиотека» убрана отсюда — теперь
          // она одна на все страницы книги, в шапке сайта рядом с именем
          // (renderBackBarBrand выше), а не только на обложке.
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          (hp ? ornamentMaskHtml(book, hp, "ic-orn-headpiece") : "")+
          '<header class="ic-home-hero">'+
            '<div class="ic-home-txt">'+
              '<p class="ic-kicker">'+esc(book.meta.title.original||"")+'</p>'+
              '<h1 class="ic-title">'+esc(bt(book.meta.title))+'</h1>'+
              '<p class="ic-home-author">'+esc(bt(h.author))+'</p>'+
              '<p class="ic-home-ed">'+(h.editionShort ? '<span class="ic-ed-long">' : '<span>')+esc(bt(h.edition))+(h.addition ? ' · '+esc(bt(h.addition)) : "")+'</span>'+(h.editionShort ? '<span class="ic-ed-short">'+esc(bt(h.editionShort))+'</span>' : "")+'</p>'+
            '</div>'+
            '<nav class="ic-home-tiles" aria-label="'+esc(t("hmNavLabel"))+'">'+secs.join("")+'</nav>'+
            (hero ? '<figure class="ic-home-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(hero)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(hero)+'" alt="'+esc(t("engravingAlt",{title:bt(book.meta.title)}))+'"></div></figure>' : "")+
            '<p class="ic-home-blurb">'+esc(bt(h.blurb))+'</p>'+
          '</header>'+
          // Пункт 4 этого раунда: маленькая виньетка-разделитель (dv,
          // раньше шла здесь перед концовкой) убрана — остаётся только
          // ангел-концовка (tpRec) ниже.
          (tpRec ? ornamentMaskHtml(book, tpRec, "ic-orn-tailpiece") : "")+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      bindBookSearchSheet(root, book, gen, []);
      var fig = root.querySelector(".ic-home-fig .ic-fig"); if(fig) fig.addEventListener("click",function(){ lightbox(fig.getAttribute("data-src")); });
      state.scroll = 0; restoreOrTop(gen);
      installBookHide({isActive:function(){ return gen===renderGen; }});
      nudgeRepaint();
    });
  }

  // renderBookText — раздел «Текст» (#/<slug>/text, задание пункт 1): только
  // содержание по частям, та же разметка tocPartsHtml, что строит выезжающую
  // шторку «Содержание» в читалке (renderChapter), просто как полноценная
  // страница (curSlug=null — ни одна глава не подсвечена) и без строки
  // раздела (задание, пункт 4 — у этой страницы строки раздела нет вовсе).
  function renderBookText(book){
    var gen = renderGen;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      root.innerHTML =
        '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, "text", {parentHref: coverHref(book)})+'</div>'+
        '<div class="ic-wrap">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("bkTabText"))+'</h1></header>'+
          tocPartsHtml(book, chap, null)+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      bindBookSearchSheet(root, book, gen, []);
      root.querySelectorAll("[data-ch]").forEach(function(b){ b.addEventListener("click",function(){ location.hash = chapterHref(book, b.getAttribute("data-ch")).replace(/^#/,""); }); });
      state.scroll = 0; restoreOrTop(gen);
      installBookHide({isActive:function(){ return gen===renderGen; }});
      nudgeRepaint();
    });
  }

  // renderBookPlates — раздел «Гравюры» (#/<slug>/plates, задание пункт 1):
  // сетка 2 колонки, сгруппированная по главам — тот же приём, что раньше
  // показывала вкладка tab==="gallery" на обложке (renderHome), теперь
  // отдельный полноценный маршрут, не вкладка. Без строки раздела.
  function renderBookPlates(book){
    var gen = renderGen;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var engBase = engBaseOf(book);
      // Группировка по главам в порядке книги (chap.list), не по порядку
      // гравюр: словарь {chapterSlug: [гравюры...]}, заполняемый в порядке
      // chap.pl.list (задание — "сохраняя порядок chap.pl.list").
      var byCh = {};
      galleryEntries(chap).forEach(function(p){ (byCh[p.chapter] = byCh[p.chapter] || []).push(p); });
      var html = chap.list.filter(function(c){ return byCh[c.slug] && byCh[c.slug].length; }).map(function(c){
        // data-chtitle (этот раунд, задание пункт 2) — заголовок ИМЕННО ТОЙ
        // группы главы, из которой кликнули карточку: сетка уже сгруппирована
        // по главам (см. комментарий выше), так что название группы — самый
        // естественный контекст для «Назад: <глава>» на карточке гравюры,
        // точнее общего «Гравюры».
        return '<h2 class="ic-pl-h">'+esc(chapTitle(c))+'</h2><ul class="ic-gal ic-gal-grid">'+byCh[c.slug].map(function(g){
          var thumb = engBase+"thumb/"+g.file+"_t.webp", gPg = platePageStr(g.page);
          return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book, "plate/"+g.id))+'" data-id="'+esc(g.id)+'" data-chtitle="'+esc(chapTitle(c))+'">'+
            '<span class="ic-gal-img"><img loading="lazy" src="'+esc(thumb)+'"'+(g.w && g.h ? ' width="'+g.w+'" height="'+g.h+'"' : "")+' alt=""></span>'+
            '<span class="ic-gal-cap">'+esc(plTitle(chap, g))+(gPg ? '<small class="ic-gal-pg">'+esc(gPg)+'</small>' : "")+'</span></a></li>';
        }).join("")+'</ul>';
      }).join("");
      root.innerHTML =
        '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, "plates", {parentHref: coverHref(book)})+'</div>'+
        '<div class="ic-wrap">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmGallery"))+'</h1></header>'+
          html+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      bindBookSearchSheet(root, book, gen, []);
      var gl = root.querySelector(".ic-gal"); if(gl) root.querySelectorAll(".ic-gal").forEach(function(g){ g.addEventListener("click",function(e){
        var a = e.target.closest(".ic-gal-item");
        if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){
          e.preventDefault();
          namesUi.pos[location.hash] = window.scrollY;
          chCtx = {hash: hrefFor(book, "plate/"+a.getAttribute("data-id")), type:"plates", label: a.getAttribute("data-chtitle")||""};
          go(book, "plate/"+a.getAttribute("data-id"));
        }
      }); });
      state.scroll = 0; restoreOrTop(gen);
      installBookHide({isActive:function(){ return gen===renderGen; }});
      nudgeRepaint();
    });
  }

  // renderBookSearch — раздел «Поиск» (#/<slug>/search, задание пункт 1):
  // перенос прежней вкладки home/search as-is — тот же контракт разметки
  // .ic-home-search/.ic-sr и wireBookSearch, теперь отдельная страница. Без
  // строки раздела (сама страница — уже прямой доступ к поиску).
  function renderBookSearch(book){
    var gen = renderGen;
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var restoreY = namesUi.pos[location.hash] || 0; delete namesUi.pos[location.hash];
      root.innerHTML =
        '<div class="ic-stack" id="ic-stack">'+
        bookTabsHtml(book, "search", {parentHref: coverHref(book)})+'</div>'+
        '<div class="ic-wrap">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmSearch"))+'</h1></header>'+
          '<form class="ic-home-search" role="search">'+
            '<span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srPlace"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srPlace"))+'">'+
            '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span></form>'+
          '<div class="ic-sr" aria-live="polite"></div>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      bindBookSearchSheet(root, book, gen, []);
      var form = root.querySelector(".ic-home-search");
      wireBookSearch(book, form, root.querySelector(".ic-sr"), gen, restoreY);
      if(!restoreY) form.querySelector(".ic-search").focus({preventScroll:true});
      state.scroll = 0;
      if(!restoreY) toTop(true);
      installBookHide({isActive:function(){ return gen===renderGen; }});
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
    var ch = chap.bySlug[e.chapter], bl = state.lang!=="ru" && ch && ch[state.lang] !== undefined ? (ch[state.lang] && ch[state.lang].blocks) : (ch && ch.blocks), b = bl && bl[e.block-1];
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
      if(!p){ location.replace(hrefFor(book, pl && pl.byOld[id] ? "plate/"+pl.byOld[id] : "plates")); return; }
      var gal = pl.list, idx = gal.indexOf(p);
      var engBase = engBaseOf(book), src = engBase+p.file+"_display.webp";
      var ch = chap.bySlug[p.chapter], cf = p.cap_from, cch = cf ? chap.bySlug[cf.chapter] : ch,
        capB = (p.at==="cap" || cf) && cch && cch.blocks ? cch.blocks[(cf ? cf.block : p.block)-1] : null;
      var prev = idx > 0 ? gal[idx-1] : null, next = idx < gal.length-1 ? gal[idx+1] : null;
      // Ряд из трёх равных пилюль «Предыдущая / Все гравюры / Следующая»
      // (задание, пункт 1 — по макету book-structure.html, .row2/.row2 a):
      // заменяет прежний двуячеечный пейджер с заголовками соседних гравюр —
      // простые равные пилюли без названия статьи, как в макете.
      // Пункт 10 этого раунда: без prev/next — нет пилюли вовсе (раньше
      // рисовался пустой disabled-span ic-pc-off, видимый пробел-заглушка).
      // Ряд .ic-pc-pager — flex, у каждой пилюли flex:1 1 0 (app.css), так
      // что при 1-2 из 3 ячеек оставшиеся просто делят доступную ширину
      // поровну — не требует отдельной компенсирующей разметки/CSS.
      function navPill(n, dir){
        if(!n) return "";
        return '<a class="ic-pc-pill" rel="'+dir+'" href="'+esc(hrefFor(book,"plate/"+n.id))+'">'+esc(t(dir==="prev"?"plPrev":"plNext"))+'</a>';
      }
      // Пункт 11 этого раунда: строка местоположения — ОДНА строка «глава ·
      // страница» (тот же разделитель " · ", что и везде в файле — nmForm/
      // chCtxLabel и пр.), без упоминания издания (· plEdition) — мокап не
      // упоминает издание в строке местоположения карточки, только главу и
      // страницу, так что этот суффикс убран, не просто сокращён.
      var pg = platePageStr(p.page);
      var locBits = []; if(ch) locBits.push(chapTitle(ch)); if(pg) locBits.push(pg);
      var meta = locBits.length ? ['<span>'+esc(locBits.join(" · "))+'</span>'] : [];
      var trl = trLang(book), enP = !!trl;
      var enCapB = enP && (p.at==="cap" || cf) && cch && cch[trl] && cch[trl].blocks[(cf ? cf.block : p.block)-1];
      var explParas = p.expl.map(function(e){ return explHtml(chap, e); }).join("");
      var explBlock = '<section class="ic-pc-expl" aria-labelledby="ic-pc-expl-h"><h2 id="ic-pc-expl-h" class="ic-pc-expl-h">'+esc(t("plExplH"))+'</h2>'+
        (enP ? (explParas ? '<div class="ic-text ic-pc-expl-body" lang="'+trl+'">'+explParas+'</div>' : '<p class="ic-ch-note">'+esc(t(trl==="fr" ? "chFrSoon" : "chEnSoon"))+'</p>')
          : state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : explParas ? '<div class="ic-text ic-pc-expl-body" lang="ru">'+explParas+'</div>' : '<p class="ic-pc-none">'+esc(t("plNoExpl"))+'</p>')+
        '</section>';
      root.innerHTML =
        bookTabsHtml(book, "plates", {parentHref: hrefFor(book, "plates"), ctxTypes: CARD_CTX_TYPES})+
        '<div class="ic-wrap ic-home ic-plate-card">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<article class="ic-pc" data-id="'+esc(p.id)+'">'+
            '<figure class="ic-pc-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(src)+'"'+
              (p.w && p.h ? ' width="'+p.w+'" height="'+p.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:p.title}))+'"></div></figure>'+
            '<div class="ic-pc-body">'+
              '<p class="ic-pc-count">'+esc(t("plCount",{k:idx+1, n:gal.length}))+'</p>'+
              '<h1 class="ic-pc-title">'+esc(enCapB || trl==="fr" ? t("plateTitle",{n:idx+1}) : p.title)+'</h1>'+
              (enCapB ? '<p class="ic-pc-ru" lang="'+trl+'">'+inl(enCapB.text, qmState(enCapB))+'</p>' : trl==="fr" ? "" : p.ru_caption ? '<p class="ic-pc-ru" lang="ru">'+inl(p.ru_caption, capB ? qmState(capB) : null)+'</p>' : "")+
              (p.it_caption ? '<p class="ic-pc-it" lang="it">'+esc(p.it_caption)+'</p>' : "")+
              (meta.length ? '<p class="ic-pc-meta">'+meta.join('<span class="ic-pc-sep" aria-hidden="true"> · </span>')+'</p>' : "")+
              explBlock+
              '<a class="ic-pc-read" href="'+esc(chapterHref(book, p.chapter, p.block))+'">'+esc(t("plRead"))+'</a>'+
            '</div>'+
          '</article>'+
          '<nav class="ic-pc-pager" aria-label="'+esc(t("hmGallery"))+'">'+navPill(prev,"prev")+
            '<a class="ic-pc-pill" href="'+esc(hrefFor(book,"plates"))+'" data-rb="all">'+esc(t("plAll"))+'</a>'+
            navPill(next,"next")+'</nav>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      bindBookSearchSheet(root, book, gen, []);
      // «Все гравюры» в новом ряду трёх пилюль — та же эвристика
      // history.back(), что раньше была у верхней ссылки «← Все гравюры»
      // (убрана этим раундом — книжные вкладки «Гравюры» сверху уже дают тот
      // же путь назад, см. задание пункт 1): если пришли СЮДА именно со
      // страницы «Гравюры» (namesUi.via), возврат идёт через history.back(),
      // иначе — обычный переход по ссылке.
      var pcAll = root.querySelector('[data-rb="all"]');
      if(pcAll) pcAll.addEventListener("click",function(e){
        if(namesUi.via===location.hash){ e.preventDefault(); history.back(); }
      });
      // Клик «Читать в главе» — глава запоминает, что пришли именно отсюда (карточка
      // гравюры), чтобы новая панель читалки могла предложить вернуться назад тем же
      // History.back(), а не просто показать обычную кнопку «К оглавлению».
      var pcRead = root.querySelector(".ic-pc-read");
      if(pcRead) pcRead.addEventListener("click",function(){ chCtx = {hash: pcRead.getAttribute("href"), type:"plate", label:""}; });
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
    var top0 = headerStackH() + 8, kids = root.querySelectorAll(".ic-ch-body > :not(.ic-pgm):not(.ic-hl-mark)"), a = null, y0 = 0, i;
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
    if(panel){ d.style.top = headerStackH()+"px"; }
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
      // Активное состояние кнопки «Скан» в панели читалки (.ic-rbar-scan) —
      // тот же паттерн aria-pressed, что у .ic-pgm-b выше: включено всё
      // время, пока открыта панель скана (любая её страница), независимо от
      // того, с какой именно страницы её открыли.
      var scanBtn = root.querySelector(".ic-rbar-scan"); if(scanBtn) scanBtn.setAttribute("aria-pressed", String(on));
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
