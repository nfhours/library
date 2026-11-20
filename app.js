/* Библиотека: указатель книг и карточки статей.
   Реестр книг: library.json. Каждая книга: books/<slug>/book.json + entries.json,
   гравюры: books/<slug>/img/, сканы страниц: books/<slug>/pages/. */
(function(){
  // Бампать при каждой правке app.css (и, по желанию, когда меняется логика
  // в app.js, завязанная на новую разметку), чтобы браузеры и CDN не отдавали
  // старую закэшированную копию стилей после деплоя.
  // Режим восстановления прокрутки — в самом начале и при каждой навигации:
  // у iOS Safari он относится к записи истории, и новая запись снова «auto».
  function ensureManual(){ try{ if(history.scrollRestoration !== "manual") history.scrollRestoration = "manual"; }catch(e){} }
  ensureManual();
  var APP_VER = "266";
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
  // Стабильная высота экрана для гравюр (Рипа, Одран): считается один раз на ширину окна и пересчитывается только при смене
  // ширины (поворот). Прокрутка в iOS Safari прячет/показывает адресную строку и меняет высоту окна (resize) — размер гравюры
  // от этого меняться не должен. --ic-vh — наибольшая высота (100vh, как у обложки Картари), --ic-svh — наименьшая (100svh).
  var stableVhW = 0;
  function stableVh(){
    var w = window.innerWidth;
    if(stableVhW === w || !document.body) return;
    stableVhW = w;
    var p = document.createElement("div");
    p.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;visibility:hidden;pointer-events:none;height:100vh";
    document.body.appendChild(p);
    var lv = p.getBoundingClientRect().height; p.style.height = "100svh";
    var sv = p.getBoundingClientRect().height || lv; p.remove();
    document.documentElement.style.setProperty("--ic-vh", lv+"px");
    document.documentElement.style.setProperty("--ic-svh", Math.min(lv, sv)+"px");
  }
  stableVh();
  window.addEventListener("resize", function(){ syncTopVar(); updateSheetMaxH(); syncHeaderStack(); stableVh(); });
  window.addEventListener("orientationchange", function(){ syncTopVar(); updateSheetMaxH(); syncHeaderStack(); stableVh(); });
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
  addLink("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=IM+Fell+English:ital@0;1&display=swap");
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
    libWip:       {ru:"В работе", en:"In progress", fr:"En cours"},
    motTitle:     {ru:"Мотивы", en:"Motifs", fr:"Motifs"},
    motSub:       {ru:"Поиск гравюр по изображённым предметам", en:"Find engravings by the objects they show", fr:"Chercher des gravures par les objets représentés"},
    motAllBooks:  {ru:"Все книги", en:"All books", fr:"Tous les livres"},
    motMore:      {ru:"ещё {n}", en:"{n} more", fr:"{n} de plus"},
    motBkBtn:     {ru:"Книги: {b}", en:"Books: {b}", fr:"Livres : {b}"},
    motBkAllS:    {ru:"все", en:"all", fr:"tous"},
    motBkSome:    {ru:"{k} из {n}", en:"{k} of {n}", fr:"{k} sur {n}"},
    motBkTtl:     {ru:"Искать в книгах", en:"Search in books", fr:"Chercher dans les livres"},
    motOf:        {ru:"из", en:"of", fr:"sur"},
    motTabBooks:  {ru:"Книги", en:"Books", fr:"Livres"},
    motNone:      {ru:"Ничего не найдено", en:"Nothing found", fr:"Aucun résultat"},
    motBooks:     {ru:"Книги", en:"Books", fr:"Livres"},
    motFind:      {ru:"Найти мотив", en:"Find a motif", fr:"Chercher un motif"},
    motCats:      {ru:"Категории", en:"Categories", fr:"Catégories"},
    motCatAll:    {ru:"Все", en:"All", fr:"Tous"},
    motCObj:      {ru:"Предметы", en:"Objects", fr:"Objets"},
    motCWeap:     {ru:"Оружие", en:"Weapons", fr:"Armes"},
    motCAnim:     {ru:"Животные", en:"Animals", fr:"Animaux"},
    motCPlant:    {ru:"Растения", en:"Plants", fr:"Plantes"},
    motCSky:      {ru:"Небесное", en:"Celestial", fr:"Céleste"},
    motCPose:     {ru:"Позы и жесты", en:"Poses and gestures", fr:"Poses et gestes"},
    motCTrait:    {ru:"Черты фигуры", en:"Figure traits", fr:"Traits de la figure"},
    motCPlace:    {ru:"Места и постройки", en:"Places and buildings", fr:"Lieux et édifices"},
    motCChar:     {ru:"Персонажи", en:"Characters", fr:"Personnages"},
    motCount:     {ru:"Гравюр: {n}", en:"Engravings: {n}", fr:"Gravures : {n}"},
    libWipTag:    {ru:"в работе", en:"in progress", fr:"en cours"},
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
    fbDone:   {ru:"Готово", en:"Done", fr:"OK"},
    fbPhName: {ru:"Имя", en:"Name", fr:"Nom"},
    fbPhIdx:  {ru:"Слово в указателе", en:"Word in the index", fr:"Mot de l’index"},
    fbArt:    {ru:"Найти статью", en:"Find article", fr:"Chercher un article"},
    fbName:   {ru:"Найти имя", en:"Find name", fr:"Chercher un nom"},
    fbIdx:    {ru:"Найти в указателе", en:"Find in index", fr:"Chercher dans l’index"},
    fbpArt:   {ru:"Статья", en:"Article", fr:"Article"},
    fbpName:  {ru:"Имя", en:"Name", fr:"Nom"},
    fbpIdx:   {ru:"Указатель", en:"Index", fr:"Index"},
    srAllPh:  {ru:"Поиск по всей книге", en:"Search the whole book", fr:"Recherche dans tout le livre"},
    // Активная метка кнопки «Найти» в новой капсуле .ic-rbar (указатель и
    // имена) — {q} подставляется как есть, без доп. кавычек/форматирования
    // (сам запрос короткий, 1-2 слова). Общий ключ для обеих страниц.
    tvSearchActive: {ru:"Найти: {q}", en:"Search: {q}", fr:"Chercher : {q}"},
    tvReset:      {ru:"Сбросить", en:"Reset", fr:"Réinitialiser"},
    tvSortRu:     {ru:"По алфавиту", en:"A–Z", fr:"Ordre alphabétique"},
    tvSortIt:     {ru:"Как в книге 1626 года", en:"As in the 1626 book", fr:"Comme dans le livre de 1626"},
    tvLetters:    {ru:"Буквы указателя", en:"Index letters", fr:"Lettres de l’index"},
    tvFound:      {ru:"Найдено статей: {n}", en:"Entries found: {n}", fr:"Articles trouvés : {n}"},
    tvAll:        {ru:"Статей: {n}", en:"Entries: {n}", fr:"Articles : {n}"},
    tvNone:       {ru:"Ничего не найдено.", en:"Nothing found.", fr:"Rien trouvé."},
    tvSee:        {ru:"см.", en:"see", fr:"voir"},
    tvPage:       {ru:"с.", en:"p.", fr:"p."},
    svScan:       {ru:"Скан", en:"Scan", fr:"Scan"},
    svTrans:      {ru:"Транскрипция", en:"Transcription", fr:"Transcription"},
    svIt:         {ru:"Итальянский текст", en:"Italian text", fr:"Texte italien"},
    svOpen:       {ru:"Открыть скан страницы {p} издания 1626 года", en:"Open the scan of page {p} of the 1626 edition", fr:"Ouvrir le scan de la page {p} de l’édition de 1626"},
    svTitle:      {ru:"тит.", en:"title", fr:"titre"},
    svDedic:      {ru:"посв.", en:"ded.", fr:"dédic."},
    svDlg:        {ru:"Оригинал 1626 года", en:"Original of 1626", fr:"Original de 1626"},
    svPrev:       {ru:"Предыдущая страница", en:"Previous page", fr:"Page précédente"},
    svNext:       {ru:"Следующая страница", en:"Next page", fr:"Page suivante"},
    svMkEng:      {ru:"гравюра", en:"engraving", fr:"gravure"},
    svMkOrn:      {ru:"орнамент", en:"ornament", fr:"ornement"},
    svMkBlank:    {ru:"пустая страница", en:"blank page", fr:"page blanche"},
    svMkSign:     {ru:"знак", en:"mark", fr:"signe"},
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
    srHint:       {ru:"Можно искать слова, имена и номера страниц: «Фортуна», «Fortuna», «429».", en:"Search words, names and page numbers: “Fortuna”, “Фортуна”, “429”.", fr:"Cherchez des mots, des noms et des numéros de page : « Fortuna », « Фортуна », « 429 »."},
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
    bkTabText:    {ru:"Текст", en:"Text", fr:"Texte"},
    audTables:    {ru:"Таблицы", en:"Plates", fr:"Planches"},
    audPreface:   {ru:"Предисловие", en:"Preface", fr:"Préface"},
    audPrefaceSub:{ru:"Предисловие и предуведомление автора", en:"The preface and the notice to the reader", fr:"La préface et l’avertissement"},
    audTblAbbr:   {ru:"табл.", en:"pl.", fr:"pl."},
    audTablesSub: {ru:"Все гравированные таблицы: {n}", en:"All the engraved plates: {n}", fr:"Toutes les planches gravées : {n}"},
    // единицы обмеров — строго по предисловию Одрана (preface.json, блок 35)
    audUnits:     {ru:"Цифры на гравюре — размеры частей тела. Мерой служит голова статуи: она делится на 4 части (p.), часть — на 12 долей, «минут» (m.). Например, «2 p. 3 m.» — две части и три минуты, чуть больше половины головы.", en:"The figures on the engraving are the sizes of the parts of the body. The unit is the statue’s head: it is divided into 4 parts (p.), and each part into 12 smaller units, “minutes” (m.). For example, “2 p. 3 m.” means two parts and three minutes, a little more than half a head.", fr:"Les chiffres de la gravure donnent la taille des parties du corps. L’unité est la tête de la statue : elle se divise en 4 parties (p.), et chaque partie en 12 petites unités, les « minutes » (m.). Par exemple, « 2 p. 3 m. » signifie deux parties et trois minutes, un peu plus d’une demi-tête."},
    audUnitsFt:   {ru:"Цифры на гравюре — размеры частей тела. Эта небольшая статуя обмерена в футах, дюймах (p.) и линиях (l.): вся фигура — 45 дюймов 7 линий, что равно 30 частям головы.", en:"The figures on the engraving are the sizes of the parts of the body. This small statue is measured in feet, inches (p.) and lines (l.): the whole figure is 45 inches 7 lines, which equals 30 parts of the head.", fr:"Les chiffres de la gravure donnent la taille des parties du corps. Cette petite statue est mesurée en pieds, pouces (p.) et lignes (l.) : la figure entière fait 45 pouces 7 lignes, ce qui égale 30 parties de tête."},
    rpTabArticles:{ru:"Статьи", en:"Articles", fr:"Articles"},
    rpArtSub:     {ru:"Все статьи в двух частях: {n}", en:"All articles in two parts: {n}", fr:"Tous les articles en deux parties : {n}"},
    rpPart:       {ru:"Часть", en:"Part", fr:"Partie"},
    rpOrder:      {ru:"Порядок", en:"Order", fr:"Ordre"},
    rpOrdBook:    {ru:"Книга", en:"Book", fr:"Livre"},
    rpOrdAlpha:   {ru:"А–Я", en:"A–Z", fr:"A–Z"},
    rpOrdPage:    {ru:"Стр.", en:"Page", fr:"Page"},
    rpSrPh:       {ru:"Поиск по всему тексту", en:"Search the full text", fr:"Recherche dans tout le texte"},
    rpFindPh:     {ru:"Название или предмет", en:"Title or subject", fr:"Titre ou sujet"},
    rpPartAll:    {ru:"Все части", en:"All parts", fr:"Toutes les parties"},
    grNote:       {ru:"Примечание", en:"Note", fr:"Note"},
    grItems:      {ru:"Предметы", en:"Objects", fr:"Objets"},
    grItemsSub:   {ru:"Все предметы по порядку книги: {n}", en:"All the objects in the book's order: {n}", fr:"Tous les objets dans l'ordre du livre : {n}"},
    grTextSub:    {ru:"Вступительное рассуждение автора", en:"The author's preliminary discourse", fr:"Le discours préliminaire de l'auteur"},
    grFind:       {ru:"Найти предмет", en:"Find object", fr:"Chercher un objet"},
    grNo:         {ru:"№", en:"No.", fr:"n°"},
    grQm:         {ru:"Знак на гравюре не читается.", en:"The character cannot be read on the engraving.", fr:"Signe illisible sur la gravure."},
    grDiscours:   {ru:"Вступительное рассуждение", en:"Preliminary Discourse", fr:"Discours préliminaire"},
    grNoRes:      {ru:"Ничего не найдено.", en:"Nothing found.", fr:"Aucun résultat."},
    grNoResPart:  {ru:"В выбранной части ничего не найдено. Выберите «Все части».", en:"Nothing found in the selected part. Choose “All parts”.", fr:"Aucun résultat dans la partie choisie. Choisissez « Toutes les parties »."},
    grSrHint:     {ru:"Ищет слово в тексте записей (описания, надписи, примечания) и во вступительном рассуждении.", en:"Finds a word in the entries (descriptions, inscriptions, notes) and in the preliminary discourse.", fr:"Cherche un mot dans les notices (descriptions, inscriptions, notes) et dans le discours préliminaire."},
    rpPrevFull:   {ru:"Предыдущая", en:"Previous", fr:"Précédente"},
    rpNextFull:   {ru:"Следующая", en:"Next", fr:"Suivante"},
    rpSrHint:     {ru:"Ищет слово во всём тексте статей: в названиях, описаниях и переводах.", en:"Finds a word anywhere in the articles: titles, descriptions and translations.", fr:"Cherche un mot dans tous les textes : titres, descriptions et traductions."},
    rpSrMore:     {ru:"Ещё {n}: уточните запрос.", en:"{n} more: refine the query.", fr:"{n} de plus : précisez la requête."},
    // Альчато (каркас Рипы/Одрана)
    alcEmb:       {ru:"Эмблемы", en:"Emblems", fr:"Emblèmes"},
    alcEmbSub:    {ru:"Все эмблемы по разделам: {n}", en:"All the emblems by section: {n}", fr:"Tous les emblèmes par section : {n}"},
    alcGalSub:    {ru:"Все гравюры книги: {n}", en:"All the woodcuts: {n}", fr:"Toutes les gravures : {n}"},
    alcFind:      {ru:"Найти эмблему", en:"Find emblem", fr:"Chercher un emblème"},
    alcSec:       {ru:"Раздел", en:"Section", fr:"Section"},
    alcGreek:     {ru:"Греческие места", en:"Greek passages", fr:"Passages grecs"},
    alcSrHint:    {ru:"Ищет слово в девизах, переводе эпиграмм и латинском тексте.", en:"Finds a word in the mottoes, the translated epigrams and the Latin text.", fr:"Cherche un mot dans les devises, la traduction des épigrammes et le texte latin."}
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
  // flowPage — страница эмблемы Альчато: класс ic-flow-page на html (тёмные html/body, бумага на контейнере содержимого, см. app.css) и
  // <meta name="theme-color"> цвета шапки (#16130f); при уходе возвращается прежнее значение (тега не было — убирается).
  var flowTheme = null, flowActive = false, flowHold = false, flowW = window.innerWidth, flowTimer = 0, flowListen = false;
  // Тёмный фон html/body (класс ic-flow-page) стоит ПОСТОЯННО, пока открыта страница с этой схемой: Safari 26 красит свою верхнюю панель в цвет
  // фона html, и переключение по прокрутке заставляло панель мигать; при отскоке с разгона класс, поставленный позже, давал светлые кадры.
  // Единственное исключение — поворот экрана (orientationchange, resize с изменением ширины; смена одной высоты не считается): на ≈400 мс
  // фон снимается, чтобы при перерисовке Safari на iPad не было тёмных пятен, затем возвращается.
  function flowSync(){
    var want = flowActive && !flowHold, h = document.documentElement;
    if(h.classList.contains("ic-flow-page") !== want) h.classList.toggle("ic-flow-page", want);
  }
  function flowListeners(){
    if(flowListen) return; flowListen = true;
    function rot(){
      if(!flowActive){ flowW = window.innerWidth; return; }
      flowHold = true; flowSync(); clearTimeout(flowTimer);
      flowTimer = setTimeout(function(){ flowHold = false; flowW = window.innerWidth; flowSync(); }, 400);
    }
    window.addEventListener("orientationchange", rot);
    window.addEventListener("resize", function(){ if(window.innerWidth !== flowW){ flowW = window.innerWidth; rot(); } });
  }
  // flowPage(on) — страница со схемой «шапка уезжает нативно» открыта / закрыта; плюс <meta name="theme-color"> цвета шапки (#16130f),
  // при уходе возвращается прежнее значение (тега не было — убирается).
  function flowPage(on){
    flowListeners(); flowActive = !!on; if(!on){ flowHold = false; clearTimeout(flowTimer); } flowSync();
    var m = document.querySelector('meta[name="theme-color"]');
    if(on){
      if(!flowTheme){ flowTheme = {had: !!m, val: m ? m.getAttribute("content") : null}; }
      if(!m){ m = document.createElement("meta"); m.setAttribute("name", "theme-color"); document.head.appendChild(m); }
      m.setAttribute("content", "#16130f");
    } else if(flowTheme){
      if(m){ if(flowTheme.had) m.setAttribute("content", flowTheme.val); else m.parentNode.removeChild(m); }
      flowTheme = null;
    }
  }
  // flowClean — снять следы старой логики скрытия (installBookHide) при входе на страницу эмблемы: .back-bar переживает смену страниц, и класс/стиль
  // скрытия на нём (или на меню/строке раздела) оставили бы пустое место над строкой раздела. Только для страницы эмблемы Альчато.
  function flowClean(){
    ["ic-stack","ic-booktabs","ic-rbar"].forEach(function(id){ var e = document.getElementById(id); if(!e) return;
      e.classList.remove("ic-stack-hidden", "ic-bb-hidden", "ic-rbar-snap");
      ["transform","opacity","visibility","transition"].forEach(function(k){ e.style.removeProperty(k); }); e.style.removeProperty("--ic-stack-hide"); });
    var bb = document.querySelector(".back-bar");
    if(bb){ bb.classList.remove("ic-bb-hidden"); ["transform","opacity","visibility"].forEach(function(k){ bb.style.removeProperty(k); }); }
  }
  function flowOn(){ flowClean(); var st = document.getElementById("ic-stack"); if(st) st.classList.add("ic-stack-flow"); flowPage(true); }

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
    langKeep = captureBlockPos();
    route();
    langKeep = null;
  }
  // Смена языка внутри главы: блок под верхним краем (под строкой раздела) и
  // его смещение запоминаются до перерисовки, после неё renderChapter
  // возвращает тот же блок (data-n) на то же место уже на новом языке.
  var langKeep = null;
  function viewEdge(){
    var e = 0;
    [document.getElementById("ic-stack"), root.querySelector(".ic-rbar")].forEach(function(el){
      if(el) e = Math.max(e, el.getBoundingClientRect().bottom);
    });
    return Math.max(0, e);
  }
  // Общий якорь для смены языка: любой элемент с data-anchor (строка списка,
  // абзац статьи) или блок главы (.ic-ch-body [data-n]). Запоминается
  // первый элемент под верхним краем и его смещение, после перерисовки на
  // новом языке тот же якорь возвращается на то же место.
  var ANCHOR_SEL = ".ic-ch-body [data-n], [data-anchor]";
  function anchorOf(el){ return el.getAttribute("data-anchor") || el.getAttribute("data-n"); }
  function captureBlockPos(){
    var chap = /^#\/[^?]*\/ch\//.test(location.hash) || /^#\/ch\//.test(location.hash);
    var edge = viewEdge(), els = root.querySelectorAll(chap ? ".ic-ch-body [data-n]" : "[data-anchor]");
    if(!chap && !els.length) return null;
    for(var i=0;i<els.length;i++){
      var r = els[i].getBoundingClientRect();
      if(r.bottom > edge + 1) return {hash: location.hash, n: anchorOf(els[i]), dy: r.top - edge, anchor: !chap};
    }
    return null;
  }
  function restoreBlockPos(keep, gen){
    var moved = false;
    function onUser(){ moved = true; }
    ["touchstart","wheel","keydown","pointerdown"].forEach(function(n){ window.addEventListener(n, onUser, {once:true, passive:true}); });
    function apply(){
      if(moved || gen !== renderGen) return;
      var el = root.querySelector(keep.anchor ? '[data-anchor="'+keep.n+'"]' : '.ic-ch-body [data-n="'+keep.n+'"]');
      if(!el) return;
      var d = el.getBoundingClientRect().top - viewEdge() - keep.dy;
      if(Math.abs(d) > 0.5) window.scrollTo(0, Math.max(0, window.scrollY + d));
    }
    apply(); requestAnimationFrame(apply);
    [150, 500, 1100, 2200].forEach(function(ms){ setTimeout(apply, ms); });
    root.querySelectorAll("img").forEach(function(img){ if(!img.complete) img.addEventListener("load", apply, {once:true}); });
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
  // Совпадение только с начала слова: перед найденным местом — начало строки или не буква/цифра (пробел, пунктуация, дефис, кавычка).
  // Окончание после слова может быть любым («лоно» → лоно/лона/лоном), но «лоно» не находится внутри «слоном», «Аполлоном».
  var WS_LETTER = /[\p{L}\p{N}]/u;
  function wsFind(f, w, from){
    var p = from || 0;
    while((p = f.indexOf(w, p)) >= 0){
      if(p === 0 || !WS_LETTER.test(f.charAt(p-1))) return p;
      p++;
    }
    return -1;
  }
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
    if(slug === "alciato" && (!p.view || p.view === "home")){
      var al = {ru:"Эмблемы", en:"Emblems", fr:"Emblèmes"};
      return {text: al[state.lang] || al.ru, cls:"ic-title"};
    }
    if(slug === "audran" && (!p.view || p.view === "home")){
      var ab = {ru:"Пропорции человеческого тела", en:"The Proportions of the Human Body", fr:"Les Proportions du corps humain"};
      return {text: ab[state.lang] || ab.ru, cls:"ic-title"};
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
    var silent = !!(hashInfo && hashInfo.silent);   // тихая подгрузка данных книги: без экрана «Загрузка» (страница мотива уже показана с шапкой)
    if(!silent) root.innerHTML = loadingHtml(slug, hashInfo);
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
      if(silent){ cb(book); return; }
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
      if(silent){ cb(null); return; }
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
    var segs = location.hash.split("?")[0].replace(/^#\/?/, "").split("/").filter(Boolean);
    var slug, rest;
    if(forcedBook){
      if(segs[0] === forcedBook){ slug = forcedBook; rest = segs.slice(1); }
      else { slug = forcedBook; rest = segs; }
    } else {
      if(segs[0]==="motifs") return {motifs:true, mb:segs[1] || "all", mid:segs[2] || null};
      if(segs.length===1 && /^p[12]-\d+$/.test(segs[0])) return {slug:"iconologie", id:segs[0]};
      if(!segs.length) return {slug:null};
      if(!/^[a-z][a-z0-9-]*$/.test(segs[0])) return {slug:null};
      slug = segs[0]; rest = segs.slice(1);
    }
    if(!rest.length) return {slug:slug};
    if((slug==="iconologie" || slug==="alciato") && rest[0]==="list") return {slug:slug, view:"list"};
    if(slug==="audran" && rest[0]==="preface") return {slug:slug, view:"preface"};
    if(slug==="grosson" && rest[0]==="items") return {slug:slug, view:"items"};
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
    if(motNav && motNav.hashPending){ motNav.hashPending = false; return; }   // адрес поменял сам переход «Книги | Мотивы»: страницы уже на месте
    if(motSelPending){ motSelPending = false; return; }                         // адрес поменял выбор книг в поле: страница уже перерисована на месте
    ensureManual();
    renderGen++;
    flowPage(false);   // тёмные html/body и theme-color шапки — только на странице эмблемы Альчато (renderCard → flowOn)
    if(activeSheetClose){ activeSheetClose(); }
    if(sv) sv.close();
    var p = parseHash(), gen = renderGen;
    renderBackBarBrand(!p.slug && !p.motifs);
    if(motNav && p.slug) motNavAbort();
    // .back-bar-fixed/.ic-booktabs-fixed (index.html/app.css) — фикс
    // мигания sticky при частых программных scrollTo в жесте по рейлу букв
    // (указатель/«Имена») — убран этим раундом вместе с position:fixed у
    // .ic-rbar-tv (см. комментарий там же в app.css): рейл теперь троттлится
    // через rAF (wireAzRail/frame), и отдельный position:fixed сверху для
    // той же цели больше не нужен — указатель/«Имена» живут на том же
    // обычном sticky, что и читалка главы, без исключений.
    if(p.motifs){
      if(p.mb && p.mb.indexOf("+") >= 0){   // список книг через «+»: приводим к каноническому виду (все → #/motifs, одна книга — её слаг)
        if(!MOT.ready){ motLoad(function(){ if(gen === renderGen) route(); }); return; }
        var cn = motSelect(p.mb).param; if(cn !== p.mb){ location.replace(motHref(cn, p.mid)); return; }
      }
      if(!p.mid) motifsRoute(p); else renderMotifs(p); return; }
    if(!p.slug){ homeRoute(); return; }
    openBook(p.slug, p, function(book){
      if(!book){ if(!forcedBook) homeRoute(); return; }
      if(isAlc(book) && !book.alc){ alcLoad(book, function(){ if(gen===renderGen) route(); }); return; }
      if(isRpLayout(book)){
        if(isAud(book) && p.view==="list"){ location.replace(hrefFor(book,"plates")); return; }
        if(isAud(book) && p.view==="preface") renderAudPreface(book);
        else if(p.view==="plates") renderRipaPlates(book);
        else if(p.view==="about"){ location.replace(coverHref(book)); return; }
        else {
          try{
            if(p.view==="list") renderRipaList(book);
            else if(p.id && book.byId[p.id]) renderCard(book, book.byId[p.id]);
            else renderRipaHome(book);
          }catch(err){
            // страница не должна пропадать: каркас (шапка, меню) остаётся, ошибка — в консоль
            if(window.console && console.error) console.error("ripa render failed", err);
            unlockBodyScroll();
            if(!root.querySelector("#ic-stack")){
              root.innerHTML = ripaShell(book, p.view==="list" ? "list" : p.view==="plates" ? "plates" : null, "")+'<div class="ic-wrap ic-rp"><p class="ic-empty">'+esc(t("emptySearch"))+'</p></div>';
              try{ ripaBind(book, gen, []); }catch(_){}
            }
          }
        }
        return;
      }
      if(isGro(book)){ renderGroRoute(book, p); return; }
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
    ensureManual();
    var oldHash = "#"+(e.oldURL.split("#")[1]||"");
    namesUi.pos[oldHash] = window.scrollY;
    cameFromHash = oldHash;
    // Откуда пришли: «назад» (history.back, кнопка браузера, уголок) или новым
    // переходом по ссылке. Каждой записи истории при первом заходе ставим
    // возрастающий номер в history.state; переход к записи с меньшим номером —
    // это возврат назад. Только при возврате глава восстанавливает место.
    var st = history.state, idx = st && st.ic;
    if(idx != null) navBack = idx < histIdx;
    else { idx = nextHistIdx(); try{ history.replaceState({ic: idx}, ""); }catch(err){} navBack = false; }
    histIdx = idx;
    route();
    navBack = false;
  });
  // «назад» Safari/жест при открытом просмотре скана: запись {sv:1} снимается,
  // просмотр закрывается, хэш (глава) остаётся тем же.
  window.addEventListener("popstate", function(){
    ensureManual();
    // popstate приходит ДО hashchange: histIdx здесь трогать нельзя (иначе
    // hashchange не отличит «назад» от нового перехода и глава не вернёт
    // место) — только при снятии записи просмотра скана, где хэш не меняется.
    var st = history.state;
    if(sv && sv.panel !== true && !(st && st.sv)){
      if(st && st.ic != null) histIdx = st.ic;
      sv.close(true);
    }
  });
  // Позицию страницы ведём сами (namesUi.pos + navBack); встроенное
  // восстановление Safari после «назад» спорило бы с ним.
  ensureManual();
  var histIdx = 0, navBack = false, histSeq = 0;
  function nextHistIdx(){ return Date.now()*1000 + (histSeq++ % 1000); }
  (function(){
    var st = history.state;
    if(st && st.ic != null) histIdx = st.ic;
    else { histIdx = nextHistIdx(); try{ history.replaceState({ic: histIdx}, ""); }catch(err){} }
  })();
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
    if(isGro(book)){ location.hash = hrefFor(book, "plates"); return; }
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
    // backOpts.tabs — свой список вкладок [[раздел, подпись], ...] (книги без
    // «домашней» страницы, напр. Рипа в новом виде); backOpts.searchSheet —
    // готовая разметка своей шторки поиска (тогда лупа есть и без book.meta.home).
    var tabs = backOpts.tabs || [["text", t("bkTabText")], ["plates", t("hmGallery")]];
    if(!backOpts.tabs && book.meta.tavola) tabs.push(["index", t("hmIndex")]);
    if(!backOpts.tabs && book.meta.names) tabs.push(["names", t("hmNames")]);
    var backActive = backOpts.ctxTypes ? ctxActiveFor(backOpts.ctxTypes) : false;
    var backHref = backOpts.parentHref || coverHref(book);
    var backBtn = backOpts.hide ? "" :
      '<button type="button" class="ic-bt-back" data-rb="back" data-active="'+(backActive?"1":"0")+'" data-fallback-href="'+esc(backHref)+'" aria-label="'+esc(t("rbBack"))+'">'+ICON_BACK+'</button>';
    // Лупа — только у книг с «домашней» страницей (book.meta.home), т.е.
    // ровно там, где вообще есть страница #/<slug>/search, на которую она
    // ссылается по смыслу (как раньше ячейка «Поиск»/вкладка «Поиск»).
    var searchBtn = (book.meta.home || backOpts.searchSheet)
      ? '<button type="button" class="ic-bt-search" data-rb="booksearch" aria-pressed="'+(activeSect==="search"?"true":"false")+'" aria-label="'+esc(t("hmSearch"))+'">'+ICON_SEARCH+'</button>'
      : "";
    return '<nav class="ic-booktabs" id="ic-booktabs" aria-label="'+esc(t("hmNavLabel"))+'">'+
      backBtn+
      '<div class="ic-bt-tabs'+(backOpts.tabs ? " ic-bt-tabs-fit" : "")+'">'+tabs.map(function(x){
        // .ic-bt-label — см. предыдущие раунды: подпись в своём span,
        // сжимается до ширины текста, подчёркивание/плашка активной
        // вкладки (app.css) — ровно по её ширине.
        return '<a href="'+esc(x[2] || hrefFor(book, x[0]))+'" class="'+(activeSect===x[0]?"on":"")+'"><span class="ic-bt-label">'+esc(x[1])+'</span></a>';
      }).join("")+'</div>'+
      searchBtn+
      (backOpts.searchSheet ? backOpts.searchSheet : (book.meta.home && activeSect !== "search" ? bookSearchSheetHtml(book) : ""))+
    '</nav>';
  }
  // bookShell — общий каркас страницы книги: единый sticky-контейнер
  // #ic-stack (шапка «Библиотека» паркуется в него хуком на root.innerHTML) =
  // меню книги (.ic-booktabs: уголок назад, вкладки, лупа) + опциональная
  // строка раздела (rbarHtml — готовая .ic-ch-outer.ic-ch-outer-bar). Прячется
  // installBookHide. Используют Картари (главы, гравюры, поиск) и Рипа (?new).
  function bookShell(book, activeSect, o){
    o = o || {};
    return '<div class="ic-stack" id="ic-stack">'+bookTabsHtml(book, activeSect, o.tabsOpts)+(o.rbarHtml||"")+'</div>';
  }
  // rbSheetHtml — разметка тёмной шторки (.ic-rb-sheet) с содержимым от
  // вызывающего: headHtml — липкая голова (поле поиска и т.п.), bodyHtml — остальное.
  // Оживляется makeRbSheet(sheetEl, кнопка, {registry}).
  function rbSheetHtml(id, cls, headHtml, bodyHtml){
    return '<div class="ic-rb-sheet'+(cls?" "+cls:"")+'" id="'+id+'">'+
        '<div class="ic-rb-sheet-slide">'+
          '<div class="ic-rb-sheet-panel">'+
            (headHtml ? '<div class="ic-rb-sheet-head">'+headHtml+'</div>' : "")+
            (bodyHtml||"")+
          '</div>'+
        '</div>'+
      '</div>';
  }
  // bookSearchSheetHtml — тёмная шторка полнотекстового поиска (та же
  // разметка/контракт, что ждёт wireBookSearch на отдельной странице
  // #/<slug>/search — форма .ic-home-search + соседний div.ic-sr),
  // ВЛОЖЕНА внутрь .ic-booktabs (а не .ic-rbar, как раньше, когда поиск
  // был ячейкой капсулы читалки) — тот же приём "position:absolute;top:
  // 100% от ближайшего позиционированного предка", но предок теперь общее
  // меню книги, которое есть на КАЖДОЙ странице (round «nav-tabs»).
  function bookSearchSheetHtml(book){
    return rbSheetHtml("ic-rb-sheet", "",
      '<form class="ic-home-search" role="search">'+
        '<span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srAllPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srAllPh"))+'">'+
        '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span>'+
      '</form>',
      '<div class="ic-sr" aria-live="polite"></div>');
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
      if(a && /\/ch\//.test(a.getAttribute("href")||"")) searchReopen = {hash: location.hash, query: sheetInput.value, top: sheetEl.querySelector(".ic-sr").scrollTop};
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
      var r=root.getBoundingClientRect(); if(r.top<headerOffset) hardScrollTo(Math.max(0, window.scrollY+r.top-headerOffset));
    }
    // Новый переход: целью стоит верх страницы до конца отрисовки (см. holdAt)
    holdAt(gen, 0);
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
      holdAt(gen, y);
      requestAnimationFrame(function(){ if(gen===renderGen) hardScrollTo(y); });
    } else toTop(true);
  }
  // WebKit (в т.ч. iPadOS) иногда не перерисовывает position:sticky после замены
  // innerHTML на SPA-переходе — элемент «застревает» в старом положении/размере.
  // Небольшой форс-reflow после каждого рендера чинит это без видимого мигания.
  function nudgeRepaint(){
    // Раньше здесь закреплялся ТЕКУЩИЙ scrollY — при инерции iOS это было
    // промежуточное значение прокрутки предыдущей страницы. Если у перехода
    // есть цель (holdAt: верх или сохранённая позиция), закрепляем её.
    var gen = renderGen;
    requestAnimationFrame(function(){
      if(hold && hold.gen === gen && gen === renderGen) hardScrollTo(hold.y);
      else window.scrollTo(window.scrollX, window.scrollY);
    });
  }
  // hardScrollTo — scrollTo, который iOS не игнорирует во время инерционной
  // прокрутки: на кадр overflow:hidden на html обрывает инерцию, затем
  // прокручиваем и возвращаем overflow.
  var hsLocked = false, hsTarget = 0;
  function hsUnlock(){
    hsLocked = false;
    document.documentElement.classList.remove("ic-hs-lock");
  }
  // Один общий замок: повторный вызов в том же кадре второй блокировки не
  // ставит (только обновляет цель), снимается замок всегда полностью, а не
  // «возвращением прежнего значения»; страховка — любой touchstart/wheel.
  function hardScrollTo(y){
    var de = document.documentElement;
    hsTarget = y;
    if(!hsLocked){
      hsLocked = true;
      de.classList.add("ic-hs-lock");
      requestAnimationFrame(function(){
        hsUnlock();
        if(Math.abs(window.scrollY - hsTarget) > 10) window.scrollTo(0, hsTarget);
      });
      // страховка: если кадр не придёт (фоновая вкладка) — снять через 300 мс
      setTimeout(hsUnlock, 300);
    }
    window.scrollTo(0, y);
    void de.offsetHeight;
  }
  ["touchstart","wheel","keydown","pointerdown"].forEach(function(n){
    window.addEventListener(n, hsUnlock, {passive:true, capture:true});
  });
  // holdAt — цель прокрутки текущего перехода (верх или сохранённая позиция
  // при «назад»): пока читатель не коснулся экрана, несколько раз проверяем,
  // что страница стоит на цели (инерция, догрузка раскладки, Safari).
  var hold = null;
  function holdAt(gen, y){
    hold = {gen: gen, y: y};
    var touched = false;
    function onT(){ touched = true; }
    ["touchstart","wheel","keydown"].forEach(function(n){ window.addEventListener(n, onT, {once:true, passive:true, capture:true}); });
    [60, 200, 500, 1000].forEach(function(ms){ setTimeout(function(){
      if(touched || gen !== renderGen) return;
      if(Math.abs(window.scrollY - y) > 10) hardScrollTo(y);
    }, ms); });
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
        (wordEls||[]).forEach(function(w){ w.classList.add("ic-hl-fading"); });
      }, HL_FADE_STATIC);
      return;
    }
    setTimeout(function(){
      if(gen !== undefined && gen !== renderGen) return;
      if(markEl) markEl.classList.add("ic-hl-fading");
      (wordEls||[]).forEach(function(w){ w.classList.add("ic-hl-fading"); });
      setTimeout(function(){
        if(markEl && markEl.parentNode) markEl.parentNode.removeChild(markEl);
        // слово не разворачиваем: перестройка текста дала бы мигание; <mark>
        // остаётся прозрачным
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
  // Полоса «Найти» под строкой раздела: поле + крестик, список виден и фильтруется сразу.
  // Закрывается по «Готово»/Enter, Esc, касанию списка и прокрутке; фильтр остаётся.
  // «Найти…» — ячейка строки раздела, она же поле ввода (input уже в DOM, при касании ничего не перерисовывается).
  function findCellHtml(ph, val){
    return '<div class="ic-rbar-findcell'+(String(val||"").trim() ? " ic-rbar-on" : "")+'"><input class="ic-rbar-findin" type="search" enterkeyhint="search" value="'+esc(val||"")+'" placeholder="'+esc(ph)+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(ph)+'">'+
      '<button type="button" class="ic-rbar-findx" aria-label="'+esc(t("clearSearch"))+'"'+(String(val||"") ? "" : " hidden")+'>&times;</button></div>';
  }
  // Enter/«Найти» на клавиатуре, тап по списку и начало прокрутки снимают фокус (клавиатура уходит), текст остаётся.
  // Крестик виден только при тексте: очищает и оставляет фокус. Ячейка с текстом залита как выбранная.
  function wireFindBar(o){
    var cell = o.cell, inp = cell.querySelector("input"), xb = cell.querySelector(".ic-rbar-findx"), gen = o.gen, at = 0;
    function sync(){ xb.hidden = !inp.value; cell.classList.toggle("ic-rbar-on", !!inp.value.trim()); }
    function blur(){ if(document.activeElement === inp) inp.blur(); }
    inp.addEventListener("focus", function(){
      at = Date.now();
      var bt0 = document.getElementById("ic-booktabs"), stk0 = document.getElementById("ic-stack");
      if(bt0) bt0.classList.remove("ic-bb-hidden"); if(stk0) stk0.classList.remove("ic-stack-hidden");
      if(o.onFocus) o.onFocus();
    });
    inp.addEventListener("input", sync);
    inp.addEventListener("keydown", function(e){ if(e.key==="Enter" || e.key==="Escape"){ e.preventDefault(); blur(); } });
    xb.addEventListener("mousedown", function(e){ e.preventDefault(); });
    xb.addEventListener("touchstart", function(e){ e.preventDefault(); xb.click(); }, {passive:false});
    xb.addEventListener("click", function(){ inp.value = ""; sync(); inp.dispatchEvent(new Event("input", {bubbles:true})); inp.focus({preventScroll:true}); });
    function outside(e){
      if(gen !== renderGen){ document.removeEventListener("touchmove", outside, true); document.removeEventListener("wheel", outside, true); return; }
      if(document.activeElement === inp && Date.now()-at > 300 && !(e.target.closest && e.target.closest(".ic-rbar-findcell"))) blur();
    }
    document.addEventListener("touchmove", outside, true); document.addEventListener("wheel", outside, true);
    return {set:function(on){ if(!on) blur(); }, blur:blur, sync:sync, isOpen:function(){ return document.activeElement === inp; }, input:inp};
  }
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
    // Пока читатель сам не коснулся/не крутил страницу, любое смещение —
    // программное (прыжок к месту перехода, подгонка при догрузке картинок):
    // шапка остаётся показанной. Первый жест/колесо/клавиша снимает режим.
    var userMoved = false;
    function onUser(){
      if(userMoved) return;
      userMoved = true; lastY = window.scrollY; down = 0; up = 0;
      ["touchstart","wheel","keydown","pointerdown"].forEach(function(n){ window.removeEventListener(n, onUser, true); });
    }
    ["touchstart","wheel","keydown","pointerdown"].forEach(function(n){ window.addEventListener(n, onUser, {capture:true, passive:true}); });
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
      if(opts.isActive && !opts.isActive()){
        if(cur) setHidden(false);
        ["touchstart","wheel","keydown","pointerdown"].forEach(function(n){ window.removeEventListener(n, onUser, true); });
        return;
      }
      if(!userMoved){ lastY = window.scrollY; requestAnimationFrame(tick); return; }
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
  // Города на главной библиотеки: book.json хранит место на языке издания (Padova, Paris…).
  var LIB_PLACE = {
    "Padova":    {ru:"Падуя",   en:"Padua",     fr:"Padoue"},
    "Paris":     {ru:"Париж",   en:"Paris",     fr:"Paris"},
    "Lyon":      {ru:"Лион",    en:"Lyon",      fr:"Lyon"},
    "Marseille": {ru:"Марсель", en:"Marseille", fr:"Marseille"}
  };
  // каталог данных книги: «path» в library.json — относительный (books/<slug>/) или абсолютный URL отдельного репозитория (тяжёлые файлы)
  function bookDir(b){ return /^https?:\/\//.test(b.path || "") ? b.path.replace(/\/?$/, "/") : BASE+"books/"+b.slug+"/"; }
  // Данные строки книги на главной. Для книг из внешних репозиториев (path = https://…) они лежат прямо в library.json (поле meta) и миниатюра — в этом репозитории (поле thumb):
  // список рисуется сразу, внешний book.json грузится только при входе в книгу.
  function libMetaOf(b){
    if(b.meta) return Promise.resolve(b.meta);
    return fetch(bookDir(b)+"book.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
  }
  function libRowHtml(b, m){
    var wip = b.status === "wip", L = state.lang;
    var pl = m.place ? ((LIB_PLACE[m.place] && (LIB_PLACE[m.place][L] || LIB_PLACE[m.place].ru)) || m.place) : "";
    var placeYear = [pl, m.year].filter(Boolean).join(", ");
    var orig = m.title && m.title.original && m.title.original !== bt(m.title) ? m.title.original : "";
    var thumb = b.thumb ? BASE+b.thumb : bookDir(b)+(m.libThumb || "lib-thumb.webp");
    var auth = m.libAuthor ? (m.libAuthor[L] || m.libAuthor.ru) : m.author;
    var title = m.libTitle ? (m.libTitle[L] || m.libTitle.ru) : bt(m.title);
    var desc = !wip && m.libDesc ? (m.libDesc[L] || m.libDesc.ru) : "";
    return '<li class="ic-lib-row'+(wip ? " ic-lib-wip" : "")+'" data-slug="'+esc(b.slug)+'"'+
        (wip ? ' aria-disabled="true"' : ' tabindex="0" role="link"'+(m.home && m.chapters ? ' data-home="1"' : ""))+'>'+
      '<div class="ic-lib-thumb"><img src="'+esc(thumb)+'" alt="" decoding="async"></div>'+
      '<div class="ic-lib-txt">'+
        (orig ? '<span class="ic-lib-orig">'+esc(orig)+'</span>' : "")+
        '<h2 class="ic-lib-title">'+esc(title)+'</h2>'+
        (auth ? '<span class="ic-lib-author">'+esc(auth)+'</span>' : "")+
        (placeYear ? '<span class="ic-lib-place">'+esc(placeYear)+'</span>' : "")+
        (wip ? '<span class="ic-lib-tag">'+esc(t("libWipTag"))+'</span>' : (desc ? '<span class="ic-lib-desc">'+esc(desc)+'</span>' : ""))+
      '</div>'+
    '</li>';
  }

  /* ---------- библиотека: список книг — панель «Книги» сессии «Книги | Мотивы» (motSession ниже) ---------- */

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
      var k = isRipa(book) || isAlc(book) ? ripaFindKey(it) : it.key;
      return nq.split(/\s+/).every(function(w){ return wsFind(k, w) > -1; });
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
        var am = words.every(function(w){ return wsFind(a.titleKey, w)>-1; }) ? 0 : 1;
        var bm = words.every(function(w){ return wsFind(b.titleKey, w)>-1; }) ? 0 : 1;
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
        var isTitleHit = nqWords.every(function(w){ return wsFind(it.titleKey, w)>-1; });
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

  /* ---------- Иконология Рипы ----------
     Каркас — общий с Картари (bookShell,
     rbSheetHtml/makeRbSheet, installBookHide, hlMark/hlFadeOut, restoreOrTop,
     общий якорь смены языка data-anchor). Страницы: «Статьи» (список),
     «Гравюры» (сетка), «О книге», сама статья — renderCard (ветка rp). */
  // Рипа — единственный вид; флаги ?old/?new в адресе ничего не меняют (игнорируются)
  function isRipa(book){ return !!book && book.slug==="iconologie"; }
  // Одран: «Таблицы» — тот же каркас, что у Рипы (обложка, меню, строка раздела, Пред./След.), но без лупы, списка статей и скана.
  function isAud(book){ return !!book && book.slug==="audran"; }
  // Альчато: тот же каркас, что у Рипы (обложка, «Эмблемы · Гравюры», лупа); данные — text.json + _translation_v2 (alcLoad).
  function isAlc(book){ return !!book && book.slug==="alciato"; }
  function isRpLayout(book){ return isRipa(book) || isAud(book) || isAlc(book); }
  // Гроссон: viewer "plate" в общем каркасе книги (Таблицы · Текст · Поиск; карточка таблицы — renderGroCard)
  function isGro(book){ return !!book && book.slug==="grosson"; }
  var RIPA_CTX = {ripa:1};
  // «Найти статью» в новом виде — только названия (RU/EN/FR и оригинальное французское заглавие); предметы и текст ищет лупа
  function ripaFindKey(it){
    if(it.findKey === undefined){
      it.findKey = norm([it.fr, it.ru, it.en||"", it.name_fr||""].join(" "));
    }
    return it.findKey;
  }
  function ripaFlag(it){
    var f = state.lang==="fr" ? (it.flag_fr || it.flag) : state.lang==="en" ? (it.flag_en || it.flag) : it.flag;
    return f ? " ("+esc(f)+")" : "";
  }
  var ripaHl = null;   // {id, q}: слово, к которому ведёт результат поиска (подсветка в статье)
  function ripaTabs(book){
    if(isGro(book)) return [["plates", t("audTables"), hrefFor(book,"plates")], ["items", t("grItems"), hrefFor(book,"items")], ["text", t("bkTabText"), hrefFor(book,"text")]];
    if(isAlc(book)) return [["list", t("alcEmb"), hrefFor(book,"list")], ["plates", t("hmGallery"), hrefFor(book,"plates")]];
    if(isAud(book)) return [["plates", t("audTables"), hrefFor(book,"plates")], ["preface", t("audPreface"), hrefFor(book,"preface")]];
    return [["list", t("rpTabArticles"), hrefFor(book,"list")], ["plates", t("hmGallery"), hrefFor(book,"plates")]];
  }
  function ripaLoupeSheet(){
    return rbSheetHtml("ic-rb-sheet", "ic-rp-loupe",
      '<form class="ic-home-search" role="search"><span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srAllPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srAllPh"))+'">'+
        '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span></form>',
      '<div class="ic-sr" aria-live="polite"></div>');
  }
  function ripaBarWrap(inner){
    return '<div class="ic-ch-outer ic-ch-outer-bar"><div class="ic-rbar ic-rbar-rp" id="ic-rbar">'+inner+'</div></div>';
  }
  function ripaShell(book, active, rbarInner, ctxTypes, parentOverride){
    return bookShell(book, active, {tabsOpts:{tabs:ripaTabs(book), parentHref:(parentOverride || (!active ? "#/" : ctxTypes ? hrefFor(book, (isAud(book) || isGro(book)) ? "plates" : "list") : coverHref(book))), ctxTypes:ctxTypes, searchSheet:isAud(book) ? "" : ripaLoupeSheet()}, rbarHtml: rbarInner ? ripaBarWrap(rbarInner) : ""})+
      '<div id="ic-rb-dim"></div>';
  }
  // Переход в статью из списка/сетки/поиска: запоминаем, откуда пришли (уголок «назад»
  // вернёт туда же, на то же место), и слово для подсветки.
  function ripaOpen(book, id, q, from){
    var h = hrefFor(book, id)+(from || "");
    chCtx = {hash: h, type:"ripa", label:""};
    ripaHl = q && q.trim() ? {id:id, q:q.trim()} : null;
    namesUi.pos[location.hash] = window.scrollY;
    location.hash = h.replace(/^#/,"");
  }
  // Название статьи в строке раздела и вкладка «Статьи» из статьи: в список, прокрученный к этой статье,
  // со мягкой подсветкой строки. Обычный переход (запись истории), «назад» браузера вернёт в статью.
  var ripaFocus = null;   // id статьи, к которой должен прокрутиться и которую подсветить список
  function ripaToList(book, id){
    ripaFocus = id;
    namesUi.pos[location.hash] = window.scrollY;
    var h = hrefFor(book, isAud(book) ? "plates" : "list");
    if(location.hash === h){ route(); return; }
    location.hash = h.replace(/^#/,"");
  }
  // Пред./След. — заменяют запись истории (статьи не копятся в «назад»).
  function ripaStep(book, id){
    var fq = motFromRaw(), h = hrefFor(book, motIsPl(book) ? "plate/"+id : id)+(fq ? "?from="+fq : ""), act = ctxActiveFor(RIPA_CTX);
    if(act) chCtx = {hash: h, type: motIsPl(book) ? "plates" : "ripa", label:""};
    ripaHl = null;
    location.replace(h);
  }
  var RP_CHEV_L = '<svg class="ic-rp-chev" width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true"><path d="M9.5 2 2.5 9l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var RP_CHEV_R = '<svg class="ic-rp-chev" width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true"><path d="M2.5 2l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Общая часть всех страниц: после innerHTML.
  function ripaBind(book, gen, rbSheets){
    bindLangSwitch(root);
    bindBookBack(root);
    syncHeaderStack();
    var sheetApi = bindBookSearchSheet(root, book, gen, rbSheets);
    ripaWireLoupe(book, gen);
    return sheetApi;
  }
  // Лупа: поиск по всей книге с фрагментом, где найдено слово; результат ведёт в статью с подсветкой.
  function ripaSnippet(it, words, book){
    var parts = [titleOf(it)];
    if(it.fr) parts.push(it.fr);
    (it.attrs||[]).forEach(function(a){
      var what = state.lang==="fr" ? (a.what_frtrans || a.what_en || a.what) : state.lang==="en" && a.what_en ? a.what_en : a.what;
      var meaning = state.lang==="fr" ? (a.meaning_frtrans || a.meaning_en || a.meaning) : state.lang==="en" && a.meaning_en ? a.meaning_en : a.meaning;
      parts.push(what, meaning);
    });
    if(it.alcTr) alcSnipParts(it).forEach(function(p){ parts.push(p); });
    else (textFor(it, book)||[]).forEach(function(p){ parts.push(p); });
    for(var i=2;i<parts.length;i++){
      var raw = String(parts[i]||"").replace(/¶/g," "), nr = norm(raw);
      for(var k=0;k<words.length;k++){
        var ix = wsFind(nr, words[k]);
        if(ix>=0 && nr.length===raw.length){
          var a0 = Math.max(0, ix-40), b0 = Math.min(raw.length, ix+words[k].length+70);
          return (a0>0?"…":"")+esc(raw.slice(a0,ix))+"<mark>"+esc(raw.slice(ix,ix+words[k].length))+"</mark>"+esc(raw.slice(ix+words[k].length,b0))+(b0<raw.length?"…":"");
        }
      }
    }
    return "";
  }
  var ripaLoupeUi = {q:""};
  function ripaWireLoupe(book, gen){
    if(isGro(book)){ groWireLoupe(book, gen); return; }
    var sheetEl = root.querySelector("#ic-rb-sheet.ic-rp-loupe"); if(!sheetEl) return;
    var form = sheetEl.querySelector(".ic-home-search"), q = form.querySelector(".ic-search"), box = sheetEl.querySelector(".ic-sr"), timer = 0;
    q.value = ripaLoupeUi.q; wireSearchClear(q);
    function run(){
      ripaLoupeUi.q = q.value;
      var nq = norm(q.value.trim());
      if(!nq){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t(isAlc(book) ? "alcSrHint" : "rpSrHint"))+'</p>'; return; }
      var words = nq.split(/\s+/);
      var res = book.items.filter(function(it){
        var k = it.key; return words.every(function(w){ return wsFind(k, w)>-1; });
      });
      res.sort(function(a,b){
        var am = words.every(function(w){ return wsFind(a.titleKey, w)>-1; }) ? 0 : 1, bm = words.every(function(w){ return wsFind(b.titleKey, w)>-1; }) ? 0 : 1;
        return am - bm || a.ord - b.ord;
      });
      if(!res.length){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("emptySearch"))+'</p>'; return; }
      var LIM = 60;
      box.innerHTML = '<p class="ic-sr-hint">'+esc(t("found",{n:res.length}))+'</p><ul class="ic-sr-ul">'+res.slice(0,LIM).map(function(it){
        var sn = ripaSnippet(it, words, book);
        return '<li><a class="ic-sr-a ic-rp-sra" href="'+esc(hrefFor(book,it.id))+'" data-id="'+esc(it.id)+'"><span class="ic-rp-srb"><span class="ic-sr-t">'+esc(titleOf(it))+'</span>'+(sn ? '<span class="ic-sr-snip">'+sn+'</span>' : "")+'</span>'+
          '<span class="ic-rp-srp">'+esc(t("pageAbbr"))+' '+esc(it.page)+'</span></a></li>';
      }).join("")+'</ul>'+(res.length>LIM ? '<p class="ic-sr-hint">'+esc(t("rpSrMore",{n:res.length-LIM}))+'</p>' : "");
    }
    q.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(run, 120); });
    form.addEventListener("submit", function(e){ e.preventDefault(); clearTimeout(timer); run(); q.blur(); });
    box.addEventListener("click", function(e){
      var a = e.target.closest("a.ic-sr-a"); if(!a) return;
      e.preventDefault();
      ripaOpen(book, a.getAttribute("data-id"), q.value);
    });
    run();
  }


  /* ----- Обложка книги (#/iconologie, ?new): та же разметка и стили, что у обложки Картари (renderHome) ----- */
  // Всё, что на обложке меняется руками, — здесь: гравюра обложки (id статьи; файл img/<id>_display.webp) и подписи.
  var RIPA_COVERS = {
    iconologie: {
      hero: "title-part1_display.webp", // гравированный титул части 1 (экземпляр Internet Archive), img/
      plate: "p1-1",
      author: {ru:"Чезаре Рипа", en:"Cesare Ripa", fr:"Cesare Ripa"},
      edition: {ru:"Париж, 1677 · перевод Жана Бодуэна", en:"Paris, 1677 · translated by Jean Baudoin", fr:"Paris, 1677 · traduction de Jean Baudoin"}
    },
    grosson: {
      heroPath: "title.webp",
      author: {ru:"Жан-Батист-Бернар Гроссон", en:"Jean-Baptiste-Bernard Grosson", fr:"Jean-Baptiste-Bernard Grosson"},
      edition: {ru:"Марсель, 1773", en:"Marseille, 1773", fr:"Marseille, 1773"}
    },
    audran: {
      hero: "title_display.webp", // титульный лист (экземпляр Internet Archive / Getty Research Institute), img/
      author: {ru:"Жерар Одран", en:"Gérard Audran", fr:"Gérard Audran"},
      edition: {ru:"Париж, 1683", en:"Paris, 1683", fr:"Paris, 1683"}
    },
    alciato: {
      heavyHero: "plates/fm0007.webp", // титульный лист (кадр 7), из репозитория nfhours/alciato (book.json heavy)
      author: {ru:"Андреа Альчато", en:"Andrea Alciato", fr:"André Alciat"},
      edition: {ru:"Лион, 1551", en:"Lyon, 1551", fr:"Lyon, 1551"}
    }
  };
  function renderRipaHome(book){
    var gen = renderGen, rbSheets = [];
    restoreState(book.slug);
    var RIPA_COVER = RIPA_COVERS[book.slug] || RIPA_COVERS.iconologie;
    var it = book.byId[RIPA_COVER.plate], hero = RIPA_COVER.heavyHero ? alcHeavy(book)+RIPA_COVER.heavyHero : RIPA_COVER.heroPath ? BASE+"books/"+book.slug+"/"+RIPA_COVER.heroPath : RIPA_COVER.hero ? BASE+"books/"+book.slug+"/img/"+RIPA_COVER.hero : (it && it.img && it.img[0] ? BASE+"books/"+book.slug+"/img/"+it.img[0].replace(/\.(jpe?g|webp)$/i,"")+"_display.webp" : "");
    var nPl = book.items.filter(function(x){ return !x.textOnly && x.img && x.img.length; }).length;
    var secs = isGro(book)
      ? [homeTile(hrefFor(book,"plates"), t("audTables"), t("audTablesSub",{n:groPlates(book).list.length}), false),
         homeTile(hrefFor(book,"items"), t("grItems"), t("grItemsSub",{n:book.items.length}), false),
         homeTile(hrefFor(book,"text"), t("bkTabText"), t("grTextSub"), false)]
      : isAlc(book)
      ? [homeTile(hrefFor(book,"list"), t("alcEmb"), t("alcEmbSub",{n:book.items.filter(function(x){ return !x.intro; }).length}), false),
         homeTile(hrefFor(book,"plates"), t("hmGallery"), t("alcGalSub",{n:Object.keys(book.alc.thumbs).length}), false)]
      : isAud(book)
      ? [homeTile(hrefFor(book,"plates"), t("audTables"), t("audTablesSub",{n:nPl}), false),
         homeTile(hrefFor(book,"preface"), t("audPreface"), t("audPrefaceSub"), false)]
      : [homeTile(hrefFor(book,"list"), t("rpTabArticles"), t("rpArtSub",{n:book.items.length}), false),
         homeTile(hrefFor(book,"plates"), t("hmGallery"), t("hmGallerySub",{n:nPl}), false)].concat(forcedBook ? [] : [homeTile(motHref(book.slug), t("motTitle"), t("motSub"), false)]);
    var L = state.lang;
    root.innerHTML = ripaShell(book, null, "")+
      '<div class="ic-wrap ic-home ic-home-rp">'+
        '<div class="ic-top-row">'+langSwitch()+'</div>'+
        '<header class="ic-home-hero">'+
          '<div class="ic-home-txt">'+
            '<p class="ic-kicker" lang="'+(isAlc(book) ? "la" : "fr")+'">'+esc(book.meta.title.original||"")+'</p>'+
            '<h1 class="ic-title">'+esc(bt(isGro(book) && book.meta.libTitle ? book.meta.libTitle : book.meta.title))+'</h1>'+
            '<p class="ic-home-author">'+esc(RIPA_COVER.author[L]||RIPA_COVER.author.ru)+'</p>'+
            '<p class="ic-home-ed"><span>'+esc(RIPA_COVER.edition[L]||RIPA_COVER.edition.ru)+'</span></p>'+
          '</div>'+
          '<nav class="ic-home-tiles" aria-label="'+esc(t("hmNavLabel"))+'">'+secs.join("")+'</nav>'+
          (hero ? '<figure class="ic-home-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(hero)+'"><img class="ic-eng-display" src="'+esc(hero)+'" alt="'+esc(t("engravingAlt",{title:bt(book.meta.title)}))+'"></div></figure>' : "")+
          '<p class="ic-home-blurb">'+esc(bt(book.meta.libDesc && isGro(book) ? book.meta.libDesc : book.meta.subtitle))+'</p>'+
        '</header>'+
      '</div>';
    ripaBind(book, gen, rbSheets);
    var fig = root.querySelector(".ic-home-fig .ic-fig"); if(fig) fig.addEventListener("click",function(){
      if(isAlc(book)) openImgFull(fig.getAttribute("data-src").replace(/\.webp$/, "_full.webp"), bt(book.meta.title), {cls:"ic-svx-alc"}); else lightbox(fig.getAttribute("data-src")); });
    state.scroll = 0; restoreOrTop(gen);
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }

  /* ----- «Статьи» ----- */
  // на кнопках строки выбор виден, только если он не по умолчанию
  function ripaPartLabel(){ return t(state.filter==="1" ? "fPart1" : state.filter==="2" ? "fPart2" : "rpPart"); }
  function ripaOrdLabel(){ return t(state.sort==="ru" ? "rpOrdAlpha" : state.sort==="page" ? "rpOrdPage" : "rpOrder"); }
  function renderRipaList(book){
    var gen = renderGen, keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, alc = isAlc(book);
    restoreState(book.slug); state.scroll = 0;
    if(alc){ state.sort = "book"; state.filter = "all"; }   // Альчато: только порядок книги, по разделам
    var focusId = ripaFocus; ripaFocus = null;
    var focusIt = focusId && book.byId[focusId];
    if(focusIt){
      // сбрасываем только то, что скрывает статью: сперва текст в «Найти», потом часть
      var inRes = function(){ return filtered(book).indexOf(focusIt) >= 0; };
      if(!inRes()){
        var q0 = state.q; state.q = "";
        if(!inRes()){ state.q = q0; state.filter = "all"; if(!inRes()) state.q = ""; }
        keep(book.slug);
      }
    }
    var multi = book.meta.parts && book.meta.parts.length > 1, rbSheets = [];
    var findCount = 0;
    var rbar = alc ?
      '<div class="ic-rbar-row">'+findCellHtml(t("alcFind"), state.q)+
        '<button type="button" class="ic-rbar-sort ic-rbar-secb" data-rb="sec"><span class="ic-rbar-sort-label">'+esc(t("alcSec"))+'</span></button></div>'+
      langSwitch()+
      rbSheetHtml("ic-alc-secs", "", "",
        '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("alcSec"))+'">'+
          book.alc.sections.map(function(sc){ return '<button type="button" class="ic-tv-typerow" data-sec="'+sc.i+'" aria-pressed="false"><span>'+esc(sc[state.lang] || sc.ru)+'</span></button>'; }).join("")+
        '</div>') :
      '<div class="ic-rbar-row">'+
        findCellHtml(t("fbArt"), state.q)+
        (multi ? '<button type="button" class="ic-rbar-sort ic-rbar-partb'+(state.filter!=="all" ? " ic-rbar-on" : "")+'" data-rb="part"><span class="ic-rbar-sort-label">'+esc(ripaPartLabel())+'</span></button>' : "")+
        '<button type="button" class="ic-rbar-sort'+(state.sort!=="book" ? " ic-rbar-on" : "")+'" data-rb="sort"><span class="ic-rbar-sort-label">'+esc(ripaOrdLabel())+'</span></button>'+
      '</div>'+
      langSwitch()+
      (multi ? rbSheetHtml("ic-ripa-part", "", "",
        '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("rpPart"))+'">'+
          [["all","rpPartAll"],["1","fPart1"],["2","fPart2"]].map(function(x){ return '<button type="button" class="ic-tv-typerow" data-f="'+x[0]+'" aria-pressed="'+(state.filter===x[0])+'"><span>'+esc(t(x[1]))+'</span></button>'; }).join("")+
        '</div>') : "")+
      rbSheetHtml("ic-ripa-sort", "", "",
        '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("rpOrder"))+'">'+
          [["book","sBook"],["ru","sAlpha"],["page","sPage"]].map(function(x){ return '<button type="button" class="ic-tv-typerow" data-sort-opt="'+x[0]+'" aria-pressed="'+(state.sort===x[0])+'"><span>'+esc(t(x[1]))+'</span></button>'; }).join("")+
        '</div>');
    root.innerHTML = ripaShell(book, "list", rbar)+
      '<div class="ic-ch-outer"><div class="ic-wrap ic-rp'+(alc ? " ic-rp-alc" : "")+'">'+
        '<header class="ic-head ic-rp-head"><h1 class="ic-h-fr ic-rp-h1">'+esc(t(alc ? "alcEmb" : "rpTabArticles"))+'</h1></header>'+
        '<p class="ic-count ic-rp-count"></p>'+
        '<div class="ic-list ic-rp-list"></div>'+
      '</div></div>';
    var sheetApi = ripaBind(book, gen, rbSheets);
    var rbarEl = root.querySelector("#ic-rbar"), rbarRow = root.querySelector(".ic-rbar-row"), list = root.querySelector(".ic-rp-list");
    var sortEl = root.querySelector("#ic-ripa-sort"), partEl = root.querySelector("#ic-ripa-part"), partBtn = root.querySelector('[data-rb="part"]'), sortBtn = root.querySelector('[data-rb="sort"]');
    var fb = wireFindBar({cell:root.querySelector(".ic-rbar-findcell"), gen:gen, onFocus:function(){ rbSheets.forEach(function(sh){ if(sh.isOpen()) sh.close(); }); }}), findIn = fb.input;
    function setFind(on){ fb.set(on); }
    function barH(){ return rbarEl.getBoundingClientRect().height + headerStackH() + 10; }
    var hmW = [];
    function rowHtml(it, showPart){
      var ttl = titleOf(it), r = null, f = null;
      if(hmW.length){
        f = [{t:ttl, vis:true, lang:state.lang}, {t:it.fr||"", vis:alc || state.lang!=="fr", lang:alc ? "la" : "fr"}];
        var seen = {}; seen[norm(ttl)] = 1; seen[norm(it.fr||"")] = 1;
        [["ru", it.ru], ["en", it.en], ["fr", it.name_fr]].forEach(function(p){ var k = norm(p[1]); if(p[1] && !seen[k]){ seen[k] = 1; f.push({t:p[1], vis:false, lang:p[0]}); } });
        r = hfMatch(f, hmW.length, norm, function(s, w){ var p = wsFind(s, hmW[w]); return p >= 0 ? [p, hmW[w].length] : null; });
      }
      if(alc){
        var th = alcThumbSrc(book, it), tw = book.alc.thumbs[it.id];
        return '<li class="ic-row-item ic-alc-row" tabindex="0" role="link" data-id="'+it.id+'" data-anchor="'+it.id+'">'+
          '<span class="ic-alc-th">'+(th ? '<img loading="lazy" decoding="async" src="'+esc(th)+'" width="'+tw[0]+'" height="'+tw[1]+'" alt="">' : "")+'</span>'+
          '<span class="ic-rp-t"><span class="ic-tv-ru">'+(r ? hfMark(ttl, r.sp[0]) : esc(ttl))+'</span>'+
            (it.fr ? '<span class="ic-alc-rla" lang="la">'+(r ? hfMark(it.fr, r.sp[1]) : esc(it.fr))+'</span>' : "")+(r && r.cap >= 0 ? hfCaption(f[r.cap], r.sp[r.cap]) : "")+'</span>'+
          '<span class="ic-rp-pg">'+esc(alcPageLbl(it))+'</span></li>';
      }
      var fr = state.lang!=="fr" && it.fr ? ' <span class="ic-tv-it ic-rp-fr" lang="fr">'+(r ? hfMark(it.fr, r.sp[1]) : esc(it.fr))+'</span>' : "";
      return '<li class="ic-row-item" tabindex="0" role="link" data-id="'+it.id+'" data-anchor="'+it.id+'">'+
        '<span class="ic-rp-t"><span class="ic-tv-ru">'+(r ? hfMark(ttl, r.sp[0]) : esc(ttl))+ripaFlag(it)+'</span>'+fr+(r && r.cap >= 0 ? hfCaption(f[r.cap], r.sp[r.cap]) : "")+'</span>'+
        '<span class="ic-rp-pg">'+(showPart ? '<small>'+esc(t("partN",{n:it.part}))+'</small>' : "")+esc(it.page)+'</span></li>';
    }
    // Защита: исключение при построении списка не должно убирать страницу. Шапка/меню/строка раздела
    // остаются, шторки и подложка закрываются, ошибка уходит в консоль.
    function fill(){
      try{ fillRaw(); updateLabels(); clampSheetScroll(); }
      catch(err){
        if(window.console && console.error) console.error("ripa list render failed", err);
        try{ setFind(false); }catch(_){}
        rbSheets.forEach(function(sh){ try{ sh.close(); }catch(_){} });
        unlockBodyScroll();
        var dim = document.getElementById("ic-rb-dim"); if(dim) dim.classList.remove("ic-rb-dim-show");
        list.innerHTML = '<p class="ic-empty">'+esc(t("emptySearch"))+'</p>';
      }
    }
    function fillRaw(){
      var res = filtered(book), nq = state.q.trim(), grouped = state.sort==="book" && !nq;
      hmW = isRipa(book) || alc ? norm(nq).split(/\s+/).filter(Boolean) : [];
      var showPart = multi && (state.sort==="ru" || (!grouped && state.filter!=="1" && state.filter!=="2"));
      findCount = res.length;
      // «Найдено: N» — только при активном фильтре или выбранной части
      root.querySelector(".ic-rp-count").textContent = (nq || state.filter==="1" || state.filter==="2") ? t("found",{n:res.length}) : "";
      if(!res.length){ list.innerHTML = '<p class="ic-empty">'+esc(t("emptySearch"))+'</p>'; return; }
      var html = "", open = false, grp = null, part = 0;
      res.forEach(function(it){
        if(grouped && alc){
          if(it.sec !== grp){
            if(open) html += "</ul></section>";
            var sc = book.alc.secBy[it.sec] || {}, gn = sc[state.lang] || sc.ru || "";
            html += '<section class="ic-rp-sec ic-tv-sec" data-sec="'+sc.i+'"><h2><span class="ic-gcap ic-gcap-w">'+esc(gn)+'</span>'+(sc.intro ? "" : '<span class="ic-gfr" lang="la">'+esc(sc.rubric)+'</span>')+'</h2><ul>';
            grp = it.sec; open = true;
          }
        } else if(grouped){
          var gk = it.part+"|"+it.group+"|"+(it.group_fr||"")+"|"+(it.group_page||"");
          if(gk !== grp){
            if(open) html += "</ul></section>";
            if(multi && it.part !== part){ html += '<h2 class="ic-part ic-rp-part">'+esc(partLabel(book,it.part))+'</h2>'; part = it.part; }
            var g = groupOf(it);
            html += '<section class="ic-rp-sec ic-tv-sec"><h2><span class="ic-gcap'+(g.length>2?" ic-gcap-w":"")+'">'+esc(g)+'</span>'+(it.group_fr?'<span class="ic-gfr">'+esc(it.group_fr)+'</span>':"")+(it.group_page?'<span class="ic-gpg">'+esc(t("pageAbbr"))+' '+esc(it.group_page)+'</span>':"")+'</h2><ul>';
            grp = gk; open = true;
          }
        } else if(!open){ html += '<section class="ic-rp-sec"><ul>'; open = true; }
        html += rowHtml(it, showPart);
      });
      if(open) html += "</ul></section>";
      list.innerHTML = html;
    }
    function updateLabels(){
      if(!sortBtn) return;
      sortBtn.classList.toggle("ic-rbar-on", state.sort!=="book");
      if(partBtn) partBtn.classList.toggle("ic-rbar-on", state.filter!=="all");
      sortBtn.querySelector(".ic-rbar-sort-label").textContent = ripaOrdLabel();
      if(partBtn) partBtn.querySelector(".ic-rbar-sort-label").textContent = ripaPartLabel();
      root.querySelectorAll("#ic-ripa-part [data-f]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-f")===state.filter); });
      sortEl.querySelectorAll("[data-sort-opt]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-sort-opt")===state.sort); });
    }
    function toListTop(){ window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH()))); }
    findIn.addEventListener("input", function(){ state.q = findIn.value; keep(book.slug); fill(); updateLabels(); toListTop(); });
    var sortApi = sortEl ? makeRbSheet(sortEl, sortBtn, {registry: rbSheets}) : null;
    var secEl = root.querySelector("#ic-alc-secs"), secBtn = root.querySelector('[data-rb="sec"]');
    var secApi = secEl ? makeRbSheet(secEl, secBtn, {registry: rbSheets}) : null;
    // «Раздел»: тап по разделу — шторка закрывается, список прокручивается к его заголовку (поиск в «Найти» сбрасывается)
    if(secEl) secEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
      var b = e.target.closest("[data-sec]"); if(!b) return;
      secApi.close();
      if(state.q){ state.q = ""; findIn.value = ""; fb.sync(); keep(book.slug); fill(); }
      var h = list.querySelector('.ic-rp-sec[data-sec="'+b.getAttribute("data-sec")+'"]'); if(!h) return;
      var ty = Math.max(0, window.scrollY + h.getBoundingClientRect().top - barH() + 4);
      holdAt(gen, ty); hardScrollTo(ty);
    });
    var partApi = partEl ? makeRbSheet(partEl, partBtn, {registry: rbSheets}) : null;
    if(partEl) partEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
      var b = e.target.closest("[data-f]"); if(!b) return;
      state.filter = b.getAttribute("data-f"); keep(book.slug); updateLabels(); fill(); partApi.close(); toListTop();
    });
    if(sortEl) sortEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
      var b = e.target.closest("[data-sort-opt]"); if(!b) return;
      state.sort = b.getAttribute("data-sort-opt"); keep(book.slug); updateLabels(); fill(); sortApi.close(); toListTop();
    });
    rbarRow.addEventListener("click", function(e){
      var b = e.target.closest("[data-rb]"); if(!b) return;
      var act = b.getAttribute("data-rb");
      setFind(false); if(act==="sort" && sortApi) sortApi.toggle(); else if(act==="part" && partApi) partApi.toggle(); else if(act==="sec" && secApi) secApi.toggle();
    });
    function openRow(r){ if(r){ setFind(false); ripaOpen(book, r.getAttribute("data-id"), ""); } }
    list.addEventListener("click", function(e){ setFind(false); openRow(e.target.closest(".ic-row-item")); });
    list.addEventListener("keydown", function(e){ var r = e.target.closest(".ic-row-item"); if(r && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); openRow(r); } });
    fill();
    var focusRow = focusIt ? list.querySelector('.ic-row-item[data-id="'+focusIt.id+'"]') : null;
    if(focusRow){
      var ty = Math.max(0, window.scrollY + focusRow.getBoundingClientRect().top - barH() - 6);
      holdAt(gen, ty); hardScrollTo(ty);
      hlFadeOut(hlMark(focusRow), [], gen);
    } else if(keepPos) restoreBlockPos(keepPos, gen); else restoreOrTop(gen);
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return fb.isOpen() || rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }

  /* ----- «Гравюры» ----- */
  // Миниатюр у Рипы пока нет (см. отчёт): сетка берёт готовые *_display.webp, ленивая загрузка;
  // рамка фиксированной пропорции, чтобы lazy-картинки вне экрана не грузились разом.
  function ripaThumb(book, it){
    var src = (it.img||[])[0]; if(!src) return "";
    return BASE+"books/"+book.slug+"/thumb/"+src.replace(/\.(jpe?g|webp)$/i,"")+"_t.webp";
  }
  /* ----- Одран: «Предисловие» (предисловие + предуведомление): текст на языке интерфейса, сканы и транскрипция — как у глав Картари ----- */
  function loadAudPreface(book, cb){
    if(book.pref){ cb(book.pref); return; }
    fetch(BASE+"books/"+book.slug+"/preface.json",{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ book.pref = d; cb(d); }).catch(function(){ cb(null); });
  }
  function renderAudPreface(book){
    var gen = renderGen, keep = (langKeep && langKeep.hash === location.hash) ? langKeep : null, rbSheets = [];
    restoreState(book.slug);
    loadAudPreface(book, function(pf){
      if(gen !== renderGen) return;
      var L = state.lang, rows = pf ? pf.rows : [], pmAt = {};
      rows.forEach(function(r, i){ (pmAt[r[2]] = pmAt[r[2]] || []).push(i); });
      function pgm(n){
        var ix = pmAt[n]; if(!ix) return "";
        var first = rows[ix[0]][1], lb = ix.length > 1 ? pgLabel(first)+" – "+pgLabel(rows[ix[ix.length-1]][1]) : pgLabel(first);
        return '<div class="ic-pgm"><button type="button" class="ic-pgm-b" data-pi="'+ix[0]+'" aria-pressed="false" aria-label="'+esc(t("svOpen",{p:first}))+'">'+esc(lb)+'</button></div>';
      }
      var body = pf ? pf.blocks.map(function(b){ return pgm(b.n)+blockHtml(book, {n:b.n, t:b.t, lv:b.lv, text:b[L] || b.ru}, "preface", null); }).join("")
        : '<p class="ic-sub">'+esc(t("chNotYet"))+'</p>';
      var rbar = '<div class="ic-rbar-row">'+
          '<button type="button" class="ic-rbar-lbl ic-rbar-lbl-b" data-rb="top"><span class="ic-rbar-pos-ch">'+esc(t("audPreface"))+'</span></button>'+
          '<button type="button" class="ic-rbar-scan" data-rb="scan" aria-pressed="false"'+(rows.length ? "" : " disabled")+'>'+esc(t("svScan"))+'</button>'+
        '</div>'+langSwitch();
      root.innerHTML = ripaShell(book, "preface", rbar, null)+
        '<div class="ic-ch-outer"><div class="ic-wrap ic-ch-wrap ic-rp-aud">'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("audPreface"))+'</h1></header>'+
          '<div class="ic-text ic-ch-body" lang="'+(L === "fr" ? "fr" : L)+'">'+body+'</div>'+
        '</div></div>';
      ripaBind(book, gen, rbSheets);
      function openAt(i){ if(rows.length) openSv(book, rows, i); }
      root.querySelectorAll(".ic-pgm-b").forEach(function(b){ b.addEventListener("click", function(){ openAt(+b.getAttribute("data-pi")); }); });
      var scanB = root.querySelector('[data-rb="scan"]'); if(scanB) scanB.addEventListener("click", function(){ openAt(0); });
      var topB = root.querySelector('[data-rb="top"]'); if(topB) topB.addEventListener("click", function(){ hardScrollTo(0); });
      state.scroll = 0;
      if(keep) restoreBlockPos(keep, gen); else restoreOrTop(gen);
      installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return !!sv; }});
      nudgeRepaint();
    });
  }

  function renderRipaPlates(book){
    var gen = renderGen, keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, multi = book.meta.parts && book.meta.parts.length > 1, rbSheets = [];
    var aud = isAud(book), alc = isAlc(book), byPart = {}, order = [];
    book.items.forEach(function(it){
      if(alc ? !book.alc.thumbs[it.id] : (it.textOnly || !it.img || !it.img.length)) return;
      var k = alc ? it.sec : aud ? (it.group || "") : it.part;   // Альчато: по разделам, только вырезанные гравюры   // Одран: группы по статуям, в порядке книги
      if(!byPart[k]){ byPart[k] = []; order.push(k); }
      byPart[k].push(it);
    });
    if(!aud && !alc) order = Object.keys(byPart).sort();
    var html = order.map(function(pn){
      var head = alc ? '<h2 class="ic-pl-h">'+esc(alcSecName(book, byPart[pn][0]))+'</h2>' : aud ? '<h2 class="ic-pl-h">'+esc(groupOf(byPart[pn][0]))+'</h2>' : (multi ? '<h2 class="ic-pl-h">'+esc(partLabel(book,+pn))+'</h2>' : "");
      return head+'<ul class="ic-gal ic-gal-grid'+(aud ? " ic-gal-aud" : "")+(alc ? " ic-gal-alc" : "")+'">'+byPart[pn].map(function(it){
        return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book,it.id))+'" data-id="'+esc(it.id)+'" data-anchor="'+esc(it.id)+'"><span class="ic-gal-img ic-rp-gimg"><img loading="lazy" decoding="async" src="'+esc(alc ? alcThumbSrc(book,it) : ripaThumb(book,it))+'" alt=""></span>'+
          '<span class="ic-gal-cap">'+esc(titleOf(it))+'<small class="ic-gal-pg">'+(aud ? esc(t("audTblAbbr"))+' '+esc(it.num) : esc(t("pageAbbr"))+' '+esc(alc ? alcPageLbl(it) : it.page))+'</small></span></a></li>';
      }).join("")+'</ul>';
    }).join("");
    root.innerHTML = ripaShell(book, "plates", "")+
      '<div class="ic-wrap ic-rp'+(aud ? " ic-rp-aud" : "")+'"><div class="ic-top-row">'+langSwitch()+'</div>'+
        '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(aud ? t("audTables") : t("hmGallery"))+'</h1>'+(aud ? '<p class="ic-sub ic-aud-intro">'+esc(t("audUnits"))+'</p>' : "")+'</header>'+html+'</div>';
    ripaBind(book, gen, rbSheets);
    root.querySelectorAll(".ic-gal").forEach(function(g){ g.addEventListener("click", function(e){
      var a = e.target.closest(".ic-gal-item");
      if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){ e.preventDefault(); ripaOpen(book, a.getAttribute("data-id"), ""); }
    }); });
    state.scroll = 0;
    if(keepPos) restoreBlockPos(keepPos, gen); else restoreOrTop(gen);
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }

  /* ---------- Гроссон (viewer "plate"): «Таблицы» · «Текст» · «Поиск» в общем каркасе книги ----------
     Тот же bookShell/ripaShell, что у Рипы и Одрана; прежняя логика шапки (installBookHide). Карточка таблицы — renderPlate (ниже) в новом каркасе. */
  function groPlates(book){
    if(book._gro) return book._gro;
    var by = {}, list = [], meta = {};
    (book.meta.plates||[]).forEach(function(p){ meta[String(p.n)] = p; });
    book.items.forEach(function(it){ var k = String(it.plate); if(!by[k]){ by[k] = {n:k, part:it.part, objs:[], meta:meta[k] || {}}; list.push(by[k]); } by[k].objs.push(it); });
    return (book._gro = {list:list, by:by});
  }
  function groPlateTitle(p){
    var m = p.meta || {}, L = state.lang;
    return (L==="fr" ? (m.title_fr || m.title_en) : L==="en" ? m.title_en : "") || m.title_ru || t("plateTitle",{n:p.n});
  }
  // короткое имя таблицы для пейджера и подсказок: «Таблица I» (до первой точки), иначе полное
  function groPlateShort(p){ return groPlateTitle(p).split(/\.\s/)[0].replace(/\s*\([^)]*\)\s*$/, ""); }
  // «Таблица I, № 4»: сверху мелко в шторке предмета и в списке «Предметы»
  function groRef(book, it){ var P = groPlates(book).by[String(it.plate)]; return (P ? groPlateShort(P) : "")+(it.num ? ", "+t("grNo")+" "+it.num : ""); }
  function groFlagOf(it){ var L = state.lang; return (L==="fr" ? (it.flag_fr || it.flag) : L==="en" ? (it.flag_en || it.flag) : it.flag) || ""; }
  function groNotesHtml(it){
    return [groNoteOf(it), groFlagOf(it)].filter(Boolean).map(function(x){ return '<p class="ic-gro-note"><b>'+esc(t("grNote"))+'.</b> '+esc(x)+'</p>'; }).join("");
  }
  function groNoteOf(it){
    var L = state.lang;
    return (L==="fr" ? (it.note_fr || it.note_en) : L==="en" ? it.note_en : "") || it.note_ru || "";
  }
  // [?] в легендах и сведениях — кружок-пояснение, как в других книгах
  function groFieldHtml(val){
    var s = String(val), n = (s.match(/\[\?\]/g) || []).length;
    if(!n) return esc(s);
    var msg = t("grQm"), list = []; for(var i = 0; i < n; i++) list.push(msg);
    return inl(s, {list:list, i:0});
  }
  function groPrefaceBlocks(book){
    var a = book.meta.about || {}, L = state.lang, src = a[L] || a.fr || a.ru || [];
    return src.map(function(s, i){
      s = String(s);
      return s.charAt(0)==="§" ? {n:i+1, t:"h", lv:2, text:s.slice(1)} : {n:i+1, t:"p", text:s};
    });
  }
  function groOpen(book, n, id, q){
    var h = hrefFor(book, "plate/"+n);
    chCtx = {hash: h, type:"ripa", label:""};
    ripaHl = (id || (q && q.trim())) ? {id:id || "", q:(q || "").trim()} : null;
    namesUi.pos[location.hash] = window.scrollY;
    location.hash = h.replace(/^#/,"");
  }
  // Подсветка слова, с которым пришли из поиска, внутри контейнера: первое вхождение; возвращает <mark> или null
  function groMarkWord(container, q){
    var words = norm(q).split(/\s+/).filter(Boolean); if(!container || !words.length) return null;
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null), node, found = null;
    while((node = walker.nextNode())){
      if(node.parentNode.closest(".ic-lang,.ic-nav-pager,.ic-pager,button,.ic-qm")) continue;
      var nt = norm(node.data);
      if(nt.length !== node.data.length) continue;
      for(var i = 0; i < words.length; i++){ var ix = wsFind(nt, words[i]); if(ix >= 0){ found = {node:node, ix:ix, len:words[i].length}; break; } }
      if(found) break;
    }
    if(!found) return null;
    var r = document.createRange(); r.setStart(found.node, found.ix); r.setEnd(found.node, found.ix+found.len);
    var m = document.createElement("mark"); m.className = "ic-ch-mark"; r.surroundContents(m);
    return m;
  }
  function groScrollTo(el, gen){
    var edge = viewEdge(), ty = Math.max(0, window.scrollY + el.getBoundingClientRect().top - edge - Math.round((window.innerHeight - edge) * 0.22));
    holdAt(gen, ty); hardScrollTo(ty);
  }

  function renderGroPlates(book){
    var gen = renderGen, keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, rbSheets = [];
    restoreState(book.slug);
    var G = groPlates(book), parts = book.meta.parts || [];
    if(!/^[1-5]$/.test(state.filter)) state.filter = "all";
    function partLbl(){ return (state.filter==="all" ? t("rpPartAll") : partLabel(book, +state.filter))+" ▾"; }
    function gridHtml(){
      return parts.filter(function(pt){ return state.filter==="all" || String(pt.n)===state.filter; }).map(function(pt){
        var pls = G.list.filter(function(p){ return p.part===pt.n; }); if(!pls.length) return "";
        return '<h2 class="ic-pl-h" data-part="'+pt.n+'">'+esc(partLabel(book, pt.n))+'</h2><ul class="ic-gal ic-gal-grid">'+pls.map(function(p){
          var o = p.objs[0], src = o.img && o.img[0] ? BASE+"books/"+book.slug+"/img/"+o.img[0] : "", th = p.meta && p.meta.thumb;
          return '<li><a class="ic-gal-item" href="'+esc(hrefFor(book,"plate/"+p.n))+'" data-plate="'+esc(p.n)+'" data-anchor="t'+esc(p.n)+'"><span class="ic-gal-img ic-rp-gimg">'+(src ? '<img loading="lazy" decoding="async" src="'+esc(src)+'"'+(th ? ' width="'+th[0]+'" height="'+th[1]+'"' : "")+' alt="">' : "")+'</span>'+
            '<span class="ic-gal-cap">'+esc(groPlateTitle(p))+'<small class="ic-gal-pg">'+esc(t("pageAbbr"))+' '+esc(o.page||"")+'</small></span></a></li>';
        }).join("")+'</ul>';
      }).join("");
    }
    var rbar = '<div class="ic-rbar-row">'+
        '<button type="button" class="ic-rbar-sort ic-rbar-partb'+(state.filter!=="all" ? " ic-rbar-on" : "")+'" data-rb="part" aria-label="'+esc(t("rpPart"))+'"><span class="ic-rbar-sort-label">'+esc(partLbl())+'</span></button>'+
      '</div>'+langSwitch()+
      rbSheetHtml("ic-gro-part", "", "",
        '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("rpPart"))+'">'+
          [["all", t("rpPartAll")]].concat(parts.map(function(pt){ return [String(pt.n), partLabel(book, pt.n)]; })).map(function(x){
            return '<button type="button" class="ic-tv-typerow" data-f="'+x[0]+'" aria-pressed="'+(state.filter===x[0])+'"><span>'+esc(x[1])+'</span></button>'; }).join("")+
        '</div>');
    root.innerHTML = ripaShell(book, "plates", rbar, null)+
      '<div class="ic-ch-outer"><div class="ic-wrap ic-rp ic-rp-gro"><header class="ic-head ic-rp-head"><h1 class="ic-h-fr ic-rp-h1">'+esc(t("audTables"))+'</h1></header>'+
        '<div class="ic-gro-grid">'+gridHtml()+'</div></div></div>';
    ripaBind(book, gen, rbSheets);
    var partEl = root.querySelector("#ic-gro-part"), partBtn = root.querySelector('[data-rb="part"]'), grid = root.querySelector(".ic-gro-grid");
    var partApi = makeRbSheet(partEl, partBtn, {registry: rbSheets});
    partBtn.addEventListener("click", function(){ partApi.toggle(); });
    partEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
      var b = e.target.closest("[data-f]"); if(!b) return;
      state.filter = b.getAttribute("data-f"); keep(book.slug);
      grid.innerHTML = gridHtml();
      partBtn.classList.toggle("ic-rbar-on", state.filter!=="all");
      partBtn.querySelector(".ic-rbar-sort-label").textContent = partLbl();
      partEl.querySelectorAll("[data-f]").forEach(function(x){ x.setAttribute("aria-pressed", x.getAttribute("data-f")===state.filter); });
      partApi.close(); hardScrollTo(0);
    });
    grid.addEventListener("click", function(e){
      var a = e.target.closest(".ic-gal-item");
      if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){ e.preventDefault(); groOpen(book, a.getAttribute("data-plate"), "", ""); }
    });
    state.scroll = 0;
    if(keepPos) restoreBlockPos(keepPos, gen); else restoreOrTop(gen);
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }

  function groScans(book){
    return ((book.meta.about && book.meta.about.pages) || []).map(function(f){ return BASE+"books/"+book.slug+"/pages/"+f; });
  }
  function renderGroText(book){
    var gen = renderGen, keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, rbSheets = [], L = state.lang;
    restoreState(book.slug);
    var scans = groScans(book), blocks = groPrefaceBlocks(book), hl = ripaHl && ripaHl.id==="" && ripaHl.q ? ripaHl : null; ripaHl = null;
    var rbar = '<div class="ic-rbar-row">'+
        '<button type="button" class="ic-rbar-lbl ic-rbar-lbl-b" data-rb="top"><span class="ic-rbar-pos-ch">'+esc(t("grDiscours"))+'</span></button>'+
        (scans.length ? '<button type="button" class="ic-rbar-scan" data-rb="scan" aria-pressed="false">'+esc(t("svScan"))+'</button>' : "")+
      '</div>'+langSwitch();
    root.innerHTML = ripaShell(book, "text", rbar, null)+
      '<div class="ic-ch-outer"><div class="ic-wrap ic-ch-wrap ic-rp-gro">'+
        '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("grDiscours"))+'</h1></header>'+
        '<div class="ic-text ic-ch-body" lang="'+L+'">'+blocks.map(function(b){ return blockHtml(book, b, "preface", null); }).join("")+'</div>'+
      '</div></div>';
    root.querySelectorAll(".ic-ch-body [data-n]").forEach(function(el){ el.setAttribute("data-anchor", "g"+el.getAttribute("data-n")); });
    ripaBind(book, gen, rbSheets);
    var scanB = root.querySelector('[data-rb="scan"]'), topB = root.querySelector('[data-rb="top"]');
    if(scanB) scanB.addEventListener("click", function(){ openImgFull(scans, t("grDiscours")); });
    if(topB) topB.addEventListener("click", function(){ hardScrollTo(0); });
    state.scroll = 0;
    var mk = null;
    if(hl){
      var m = groMarkWord(root.querySelector(".ic-ch-body"), hl.q);
      if(m){ mk = m; groScrollTo(m, gen); hlFadeOut(null, [m], gen); }
    }
    if(!mk){ if(keepPos) restoreBlockPos(keepPos, gen); else restoreOrTop(gen); }
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return !!sv; }});
    nudgeRepaint();
  }

  // «Предметы»: плоский список всех предметов по порядку книги (по образцу «Статей» Рипы): части → таблицы → строки
  var groItemsPart = "all";   // часть в списке «Предметы» (отдельно от «Таблиц»)
  function renderGroItems(book){
    var gen = renderGen, keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, rbSheets = [];
    restoreState(book.slug); state.scroll = 0;
    var G = groPlates(book), parts = book.meta.parts || [];
    function partLbl(){ return (groItemsPart==="all" ? t("rpPartAll") : partLabel(book, +groItemsPart))+" ▾"; }
    var rbar = '<div class="ic-rbar-row">'+findCellHtml(t("grFind"), state.q)+
        '<button type="button" class="ic-rbar-sort ic-rbar-partb'+(groItemsPart!=="all" ? " ic-rbar-on" : "")+'" data-rb="part" aria-label="'+esc(t("rpPart"))+'"><span class="ic-rbar-sort-label">'+esc(partLbl())+'</span></button>'+
      '</div>'+langSwitch()+
      rbSheetHtml("ic-gro-part", "", "",
        '<div class="ic-tv-typelist" role="group" aria-label="'+esc(t("rpPart"))+'">'+
          [["all", t("rpPartAll")]].concat(parts.map(function(pt){ return [String(pt.n), partLabel(book, pt.n)]; })).map(function(x){
            return '<button type="button" class="ic-tv-typerow" data-f="'+x[0]+'" aria-pressed="'+(groItemsPart===x[0])+'"><span>'+esc(x[1])+'</span></button>'; }).join("")+
        '</div>');
    root.innerHTML = ripaShell(book, "items", rbar)+
      '<div class="ic-ch-outer"><div class="ic-wrap ic-rp ic-rp-gro"><header class="ic-head ic-rp-head"><h1 class="ic-h-fr ic-rp-h1">'+esc(t("grItems"))+'</h1></header>'+
        '<p class="ic-count ic-rp-count"></p><div class="ic-list ic-rp-list"></div></div></div>';
    var sheetApi = ripaBind(book, gen, rbSheets);
    var rbarEl = root.querySelector("#ic-rbar"), rbarRow = root.querySelector(".ic-rbar-row"), list = root.querySelector(".ic-rp-list"), cnt = root.querySelector(".ic-rp-count");
    var partEl = root.querySelector("#ic-gro-part"), partBtn = root.querySelector('[data-rb="part"]');
    var fb = wireFindBar({cell:root.querySelector(".ic-rbar-findcell"), gen:gen, onFocus:function(){ rbSheets.forEach(function(sh){ if(sh.isOpen()) sh.close(); }); }}), findIn = fb.input;
    function barH(){ return rbarEl.getBoundingClientRect().height + headerStackH() + 10; }
    function keyOf(it){ if(!it._gk) it._gk = norm([it.fr, it.ru, it.en||"", it.name_fr||"", groRef(book, it)].join(" ")); return it._gk; }
    function rowHtml(it){
      return '<li class="ic-row-item" tabindex="0" role="link" data-id="'+it.id+'" data-plate="'+esc(it.plate)+'" data-anchor="'+it.id+'">'+
        '<span class="ic-rp-t"><small class="ic-gro-ref">'+esc(groRef(book, it))+'</small><span class="ic-tv-ru">'+esc(titleOf(it))+'</span></span>'+
        '<span class="ic-rp-pg">'+esc(it.page ? t("pageAbbr")+" "+it.page : "")+'</span></li>';
    }
    function fill(){
      var nq = norm(state.q.trim()), words = nq ? nq.split(/\s+/).filter(Boolean) : [], n = 0, html = "";
      parts.forEach(function(pt){
        if(groItemsPart!=="all" && String(pt.n)!==groItemsPart) return;
        var sec = "";
        G.list.filter(function(p){ return p.part===pt.n; }).forEach(function(p){
          var rows = p.objs.filter(function(it){ return !words.length || words.every(function(w){ return wsFind(keyOf(it), w) > -1; }); });
          if(!rows.length) return;
          n += rows.length;
          sec += '<section class="ic-rp-sec ic-tv-sec"><h2><span class="ic-gcap ic-gcap-w">'+esc(groPlateTitle(p))+'</span></h2><ul>'+rows.map(rowHtml).join("")+'</ul></section>';
        });
        if(sec) html += '<h2 class="ic-part ic-rp-part">'+esc(partLabel(book, pt.n))+'</h2>'+sec;
      });
      cnt.textContent = words.length ? t("found",{n:n}) : "";
      list.innerHTML = html || '<p class="ic-empty">'+esc(t(groItemsPart!=="all" ? "grNoResPart" : "grNoRes"))+'</p>';
      partBtn.classList.toggle("ic-rbar-on", groItemsPart!=="all");
      partBtn.querySelector(".ic-rbar-sort-label").textContent = partLbl();
      partEl.querySelectorAll("[data-f]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-f")===groItemsPart); });
      clampSheetScroll();
    }
    function toListTop(){ window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH()))); }
    findIn.addEventListener("input", function(){ state.q = findIn.value; keep(book.slug); fill(); toListTop(); });
    var partApi = makeRbSheet(partEl, partBtn, {registry: rbSheets});
    partEl.querySelector(".ic-tv-typelist").addEventListener("click", function(e){
      var b = e.target.closest("[data-f]"); if(!b) return;
      groItemsPart = b.getAttribute("data-f"); fill(); partApi.close(); toListTop();
    });
    rbarRow.addEventListener("click", function(e){ var b = e.target.closest("[data-rb]"); if(b && b.getAttribute("data-rb")==="part"){ fb.set(false); partApi.toggle(); } });
    function openRow(r){ if(r){ fb.set(false); groOpen(book, r.getAttribute("data-plate"), r.getAttribute("data-id"), ""); } }
    list.addEventListener("click", function(e){ openRow(e.target.closest(".ic-row-item")); });
    list.addEventListener("keydown", function(e){ var r = e.target.closest(".ic-row-item"); if(r && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); openRow(r); } });
    fill();
    if(keepPos) restoreBlockPos(keepPos, gen); else restoreOrTop(gen);
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return fb.isOpen() || rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }

  // Поиск по книге — лупа-шторка (как у Картари и Рипы): предметы, таблицы, предисловие; переход с подсветкой слова
  function groDocs(book){
    var L = state.lang;
    if(book._groDocs && book._groDocs.L===L) return book._groDocs.list;
    var list = [];
    groPrefaceBlocks(book).forEach(function(b){ list.push({kind:"p", n:b.n, title:t("grDiscours"), texts:[b.text]}); });
    groPlates(book).list.forEach(function(p){
      var m = p.meta || {}, tx = [groPlateTitle(p), m["caption_"+L] || m.caption_ru || "", ].concat(m["intro_"+L] || m.intro_ru || []);
      list.push({kind:"t", plate:p.n, title:groPlateTitle(p), page:p.objs[0].page, texts:tx.filter(Boolean).map(String), head:""});
    });
    book.items.forEach(function(it){
      var txt = (textFor(it, book) || []).slice();
      [fieldVal(it,"legend"), fieldVal(it,"obverse"), fieldVal(it,"reverse"), fieldVal(it,"material"), fieldVal(it,"findspot"), groNoteOf(it), groFlagOf(it)].forEach(function(v){ if(v) txt.push(v); });
      list.push({kind:"e", id:it.id, plate:it.plate, title:titleOf(it), ref:groRef(book, it), page:it.page, texts:txt.map(function(x){ return String(x).replace(/¶/g," "); }), head:[it.fr, it.ru, it.en||"", it.name_fr||"", groRef(book, it)].join(" ")});
    });
    list.forEach(function(d){ d.nt = d.texts.map(norm); d.nh = norm((d.title||"")+" "+(d.head||"")); });
    book._groDocs = {L:L, list:list};
    return list;
  }
  function groWireLoupe(book, gen){
    var sheetEl = root.querySelector("#ic-rb-sheet.ic-rp-loupe"); if(!sheetEl) return;
    var form = sheetEl.querySelector(".ic-home-search"), q = form.querySelector(".ic-search"), box = sheetEl.querySelector(".ic-sr"), timer = 0;
    q.value = ripaLoupeUi.q; wireSearchClear(q);
    function snippet(d, words){
      for(var i = 0; i < d.texts.length; i++){
        var raw = d.texts[i], nr = d.nt[i];
        if(nr.length !== raw.length) continue;
        for(var k = 0; k < words.length; k++){
          var ix = wsFind(nr, words[k]);
          if(ix >= 0){
            var a0 = Math.max(0, ix-40), b0 = Math.min(raw.length, ix+words[k].length+70);
            return (a0>0?"…":"")+esc(raw.slice(a0,ix))+"<mark>"+esc(raw.slice(ix,ix+words[k].length))+"</mark>"+esc(raw.slice(ix+words[k].length,b0))+(b0<raw.length?"…":"");
          }
        }
      }
      return "";
    }
    function run(){
      ripaLoupeUi.q = q.value;
      var nq = norm(q.value.trim());
      if(!nq){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("grSrHint"))+'</p>'; return; }
      var words = nq.split(/\s+/).filter(Boolean);
      var res = groDocs(book).filter(function(d){ return words.every(function(w){ return wsFind(d.nh, w)>-1 || d.nt.some(function(x){ return wsFind(x, w)>-1; }); }); });
      res.sort(function(a,b){ var am = words.every(function(w){ return wsFind(a.nh, w)>-1; }) ? 0 : 1, bm = words.every(function(w){ return wsFind(b.nh, w)>-1; }) ? 0 : 1; return am - bm; });
      if(!res.length){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("grNoRes"))+'</p>'; return; }
      var LIM = 60;
      box.innerHTML = '<p class="ic-sr-hint">'+esc(t("found",{n:res.length}))+'</p><ul class="ic-sr-ul">'+res.slice(0,LIM).map(function(d){
        var sn = snippet(d, words), href = d.kind==="p" ? hrefFor(book,"text") : hrefFor(book,"plate/"+d.plate);
        var meta = d.kind==="p" ? esc(t("bkTabText")) : esc(t("pageAbbr"))+' '+esc(d.page||"");
        return '<li><a class="ic-sr-a ic-rp-sra" href="'+esc(href)+'" data-kind="'+d.kind+'" data-id="'+esc(d.id||"")+'" data-plate="'+esc(d.plate||"")+'"><span class="ic-rp-srb">'+(d.ref ? '<small class="ic-gro-ref">'+esc(d.ref)+'</small>' : "")+'<span class="ic-sr-t">'+esc(d.title)+'</span>'+(sn ? '<span class="ic-sr-snip">'+sn+'</span>' : "")+'</span><span class="ic-rp-srp">'+meta+'</span></a></li>';
      }).join("")+'</ul>'+(res.length>LIM ? '<p class="ic-sr-hint">'+esc(t("rpSrMore",{n:res.length-LIM}))+'</p>' : "");
    }
    q.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(run, 120); });
    form.addEventListener("submit", function(e){ e.preventDefault(); clearTimeout(timer); run(); q.blur(); });
    box.addEventListener("click", function(e){
      var a = e.target.closest("a.ic-sr-a"); if(!a) return;
      e.preventDefault();
      var kind = a.getAttribute("data-kind");
      if(kind==="p"){
        chCtx = {hash:hrefFor(book,"text"), type:"ripa", label:""};
        ripaHl = {id:"", q:q.value.trim()}; namesUi.pos[location.hash] = window.scrollY;
        location.hash = hrefFor(book,"text").replace(/^#/,"");
      } else groOpen(book, a.getAttribute("data-plate"), a.getAttribute("data-id"), q.value);
    });
    run();
  }

  // Пред./След. карточек таблиц — заменяют запись истории
  function groStep(book, n){
    var h = hrefFor(book, "plate/"+n);
    if(ctxActiveFor(RIPA_CTX)) chCtx = {hash:h, type:"ripa", label:""};
    ripaHl = null;
    location.replace(h);
  }

  var groObj = null;     // окно предмета текущей карточки: {open(i), body}
  var groFocus = null;   // номер таблицы, к которой должна прокрутиться сетка при возврате из карточки через вкладку «Таблицы»
  function groToList(book, n){
    groFocus = n; namesUi.pos[location.hash] = window.scrollY;
    var h = hrefFor(book, "plates");
    if(location.hash === h){ route(); return; }
    location.hash = h.replace(/^#/,"");
  }
  // Карточка таблицы: гравюра с метками, список предметов (содержимое прежнее) в общем каркасе книги; «Пред./След.» по порядку книги
  function renderGroCard(book, plateNum, opts){
    var gen = renderGen, n = String(plateNum), G = groPlates(book), P = G.by[n], keepPos = (langKeep && langKeep.hash === location.hash) ? langKeep : null, rbSheets = [];
    if(!P){ location.replace(hrefFor(book,"plates")); return; }
    restoreState(book.slug);
    var objs = P.objs, plateMeta = P.meta, src = BASE+"books/"+book.slug+"/img/"+objs[0].plate_img, title = groPlateTitle(P);
    var introArr = plateMeta["intro_"+state.lang] || plateMeta.intro_ru;
    var introHtml = introArr && introArr.length ? '<div class="ic-plate-intro ic-text">'+paraHtml(introArr)+'</div>' : "";
    var cap = plateMeta["caption_"+state.lang] || plateMeta.caption_ru || plateMeta.caption_fr || "";
    var hotspots = objs.map(function(it){
      var box = it.bbox || [0,0,10,10];
      return '<button type="button" class="ic-hotspot'+(ready(it, book)?" on":"")+'" data-id="'+it.id+'" style="left:'+box[0]+'%;top:'+box[1]+'%;width:'+box[2]+'%;height:'+box[3]+'%" aria-label="'+esc(it.num||"")+'"><span>'+esc(it.num||"")+'</span></button>';
    }).join("");
    var pi = G.list.indexOf(P), prev = pi > 0 ? G.list[pi-1] : null, next = pi < G.list.length-1 ? G.list[pi+1] : null;
    var pgLbl = esc(t("pageAbbr"))+' '+esc(objs[0].page||"");
    var rbar = '<div class="ic-rbar-row">'+
        '<button type="button" class="ic-rbar-lbl ic-rbar-lbl-b" data-rb="tolist" aria-label="'+esc(t("audTables")+": "+title)+'"><span class="ic-rbar-pos-ch">'+esc(title)+'</span><span class="ic-rbar-pos-pg">'+pgLbl+'</span></button>'+
        '<button type="button" class="ic-rbar-nv" data-nav="prev" data-go="'+(prev?prev.n:"")+'"'+(prev?' title="'+esc(groPlateShort(prev))+'"':" disabled")+'>'+t("navPrev")+'</button>'+
        '<button type="button" class="ic-rbar-nv" data-nav="next" data-go="'+(next?next.n:"")+'"'+(next?' title="'+esc(groPlateShort(next))+'"':" disabled")+'>'+t("navNext")+'</button>'+
      '</div>'+langSwitch()+
      rbSheetHtml("ic-gro-obj", "ic-gro-objsheet",
        '<button type="button" class="ic-gro-nv" data-d="-1" aria-label="'+esc(t("prevArticle"))+'">‹</button>'+
        '<span class="ic-rb-sheet-head-title"></span>'+
        '<button type="button" class="ic-gro-nv" data-d="1" aria-label="'+esc(t("nextArticle"))+'">›</button>'+
        '<button type="button" class="ic-rb-sheet-close ic-gro-x" aria-label="'+esc(t("close"))+'">&times;</button>',
        '<div class="ic-gro-ob-body"></div>');
    var pager = '<div class="ic-pager ic-rp-pager">'+
        (prev ? '<button type="button" class="ic-rp-nb ic-rp-nb-prev" data-go="'+prev.n+'">'+RP_CHEV_L+'<span class="ic-rp-nb-t"><small>'+t("rpPrevFull")+'</small><span>'+esc(groPlateShort(prev))+'</span></span></button>' : '<span></span>')+
        (next ? '<button type="button" class="ic-rp-nb ic-rp-nb-next" data-go="'+next.n+'"><span class="ic-rp-nb-t"><small>'+t("rpNextFull")+'</small><span>'+esc(groPlateShort(next))+'</span></span>'+RP_CHEV_R+'</button>' : '<span></span>')+
      '</div>';
    root.innerHTML = ripaShell(book, "plates", rbar, RIPA_CTX)+
      '<div class="ic-ch-outer"><div class="ic-wrap ic-rp ic-rp-gro"><div class="ic-top-row">'+langSwitch()+'</div>'+
        '<header class="ic-head"><p class="ic-kicker">'+esc(partLabel(book, P.part))+'</p><h1 class="ic-h-fr">'+esc(title)+'</h1></header>'+
        introHtml+
        '<div class="ic-plate-wrap"><img class="ic-fade-img" src="'+esc(src)+'" alt="">'+hotspots+'</div>'+
        (cap ? '<p class="ic-plate-caption">'+esc(cap)+'</p>' : "")+
        '<div class="ic-seg ic-gro-seg" role="group">'+
          '<button type="button" class="ic-chip" data-view="list" aria-pressed="true">'+t("viewList")+'</button>'+
          '<button type="button" class="ic-chip" data-view="book" aria-pressed="false">'+t("viewBook")+'</button>'+
        '</div>'+
        '<div class="ic-view-body" data-view="list">'+objListHtml(book, objs)+'</div>'+
        pager+
      '</div></div>';
    ripaBind(book, gen, rbSheets);
    root.querySelectorAll("[data-go]").forEach(function(b){ b.addEventListener("click", function(){ var g = b.getAttribute("data-go"); if(g) groStep(book, g); }); });
    var toListB = root.querySelector('[data-rb="tolist"]'); if(toListB) toListB.addEventListener("click", function(){ groToList(book, n); });
    var tabL = root.querySelector('.ic-bt-tabs a[href="'+hrefFor(book,"plates")+'"]');
    if(tabL) tabL.addEventListener("click", function(e){ if(e.metaKey||e.ctrlKey||e.shiftKey||e.button) return; e.preventDefault(); groToList(book, n); });
    // окно предмета: тёмная шторка строки раздела (makeRbSheet), ‹ › — по предметам этой таблицы
    var obEl = root.querySelector("#ic-gro-obj"), obBody = obEl.querySelector(".ic-gro-ob-body"), obTitle = obEl.querySelector(".ic-rb-sheet-head-title"), obIdx = 0;
    var obApi = makeRbSheet(obEl, null, {registry: rbSheets, onClose: function(){ highlightHotspot(null); }});
    function obShow(i){
      if(i < 0 || i >= objs.length) return;
      obIdx = i; var it = objs[i];
      obTitle.innerHTML = '<small class="ic-gro-ref">'+esc(groRef(book, it))+'</small><b class="ic-gro-ttl">'+esc(titleOf(it))+'</b>';
      obBody.innerHTML = objectDetailHtml(book, it); bindObjectDetail(book, it, obBody);
      obEl.querySelector('[data-d="-1"]').disabled = i === 0; obEl.querySelector('[data-d="1"]').disabled = i === objs.length-1;
      obBody.scrollTop = 0; highlightHotspot(it.id);
    }
    obEl.querySelectorAll(".ic-gro-nv").forEach(function(b){ b.addEventListener("click", function(){ obShow(obIdx + (+b.getAttribute("data-d"))); }); });
    groObj = {open: function(i){ obShow(i); if(!obApi.isOpen()) obApi.open(); }, body: obBody};
    wireObjList(book, objs);
    var viewBody = root.querySelector(".ic-view-body");
    root.querySelectorAll(".ic-gro-seg .ic-chip").forEach(function(b){
      b.addEventListener("click", function(){
        root.querySelectorAll(".ic-gro-seg .ic-chip").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
        var v = b.getAttribute("data-view"); viewBody.setAttribute("data-view", v);
        if(v==="book"){ viewBody.innerHTML = '<div class="ic-text ic-book-text">'+bookTextHtml(book, objs)+'</div>'; wireBookText(book, objs, viewBody); }
        else { viewBody.innerHTML = objListHtml(book, objs); wireObjList(book, objs); }
      });
    });
    root.querySelectorAll(".ic-hotspot").forEach(function(b){
      b.addEventListener("click", function(){
        openObjectSheet(book, objs, objs.indexOf(book.byId[b.getAttribute("data-id")]));
      });
    });
    var hl = ripaHl && ripaHl.id ? ripaHl : null; ripaHl = null;
    var focusId = hl ? hl.id : (opts && opts.focus);
    state.scroll = 0;
    if(focusId && book.byId[focusId]){
      openObjectSheet(book, objs, objs.indexOf(book.byId[focusId]));
      if(hl && hl.q){ var m1 = groMarkWord(groObj && groObj.body, hl.q); if(m1) hlFadeOut(null, [m1], gen); }
    } else if(keepPos) restoreBlockPos(keepPos, gen);
    else toTop();
    installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return !!sv || rbSheets.some(function(s){ return s.isOpen() || s.isAnimating(); }); }});
    nudgeRepaint();
  }
  function renderGroRoute(book, p){
    var v = p.view;
    if(v==="home" || v==="about" || v==="find" || v==="list" || v==="search" || v==="tavola" || v==="names" || v==="chapter"){ location.replace(!v || v==="home" || v==="about" ? coverHref(book) : hrefFor(book, v==="search" ? "plates" : "plates")); return; }
    try{
      if(!v && !p.id) renderRipaHome(book);
      else if(v==="plates") renderGroPlates(book);
      else if(v==="items") renderGroItems(book);
      else if(v==="text") renderGroText(book);
      else if(v==="plate") renderGroCard(book, p.plateNum);
      else if(p.id && book.byId[p.id]) renderGroCard(book, book.byId[p.id].plate, {focus:p.id});
      else location.replace(hrefFor(book,"plates"));
    }catch(err){
      if(window.console && console.error) console.error("grosson render failed", err);
      unlockBodyScroll();
    }
  }

  /* ---------- Мотивы: поиск гравюр по изображённым предметам (#/motifs) ----------
     Данные: books/_motifs/index.json — реестр {books:[{slug,file,name}]}, файл мотивов каждой книги —
     motifs_*.json ({motifs:[{id,ru,en,fr,category,parent,articles:[id статей]}]}). Новая книга добавляется
     строкой в реестре, код страницы не меняется. Адреса: #/motifs[/<книги>] — список, #/motifs/<книги>/<id> — сетка;
     <книги> = «all» или слаги через «+». */
  var MOT_CATS = ["предмет","оружие","животное","растение","небесное","поза и жест","черта фигуры","место и постройка","персонаж"];
  var MOT_CAT_KEY = {"предмет":"motCObj","оружие":"motCWeap","животное":"motCAnim","растение":"motCPlant","небесное":"motCSky","поза и жест":"motCPose","черта фигуры":"motCTrait","место и постройка":"motCPlace","персонаж":"motCChar"};
  var MOT = {ready:false, cbs:null, books:[], byArt:{}, vocab:{}};
  var MOT_CUR = "all";   // выбранные книги страницы «Мотивы» (param адреса)
  var MOT_BOOK = {slug:"motifs", meta:{}};
  var motUi = {q:"", cat:"all", find:false};
  var MOT_ALL_LBL = {
    ru:{"предмет":"Все предметы","оружие":"Всё оружие","животное":"Все животные","растение":"Все растения","небесное":"Всё небесное","поза и жест":"Все позы и жесты","черта фигуры":"Все черты фигуры","место и постройка":"Все места и постройки","персонаж":"Все персонажи"},
    en:{"предмет":"All objects","оружие":"All weapons","животное":"All animals","растение":"All plants","небесное":"All celestial","поза и жест":"All poses and gestures","черта фигуры":"All figure traits","место и постройка":"All places and buildings","персонаж":"All characters"},
    fr:{"предмет":"Tous les objets","оружие":"Toutes les armes","животное":"Tous les animaux","растение":"Toutes les plantes","небесное":"Tout le céleste","поза и жест":"Toutes les poses et gestes","черта фигуры":"Tous les traits de la figure","место и постройка":"Tous les lieux et édifices","персонаж":"Tous les personnages"}};
  function motLoad(cb){
    if(MOT.ready){ cb(); return; }
    if(MOT.cbs){ MOT.cbs.push(cb); return; }
    MOT.cbs = [cb];
    function done(){
      MOT.books.forEach(function(b){ Object.keys(b.bind).forEach(function(id){ var m = MOT.vocab[id]; if(!m) return; b.bind[id].forEach(function(a){ (MOT.byArt[b.slug+"|"+a] = MOT.byArt[b.slug+"|"+a] || []).push(m); }); }); });
      MOT.ready = true; var c = MOT.cbs; MOT.cbs = null; c.forEach(function(f){ f(); });
    }
    function getJ(u){ return fetch(BASE+"books/_motifs/"+u,{cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
    // общий словарь (id, названия, разделы, родители) и файлы привязок книг грузятся параллельно, сразу после реестра
    getJ("index.json").then(function(man){
      var list = (man && man.books) || [], got = {};
      if(!list.length || !man.vocab){ done(); return; }
      Promise.all([getJ(man.vocab)].concat(list.map(function(b){ return getJ(b.file); }))).then(function(res){
        var v = res[0];
        if(v && v.motifs){
          v.motifs.forEach(function(m){ MOT.vocab[m.id] = m; });
          list.forEach(function(b, i){ var d = res[i+1]; if(d && d.bindings) got[b.slug] = {slug:b.slug, name:b.name||{}, bind:d.bindings}; });
          MOT.books = list.map(function(x){ return got[x.slug]; }).filter(Boolean);
        }
        done();
      });
    });
  }
  function motBookName(b){ return b.name[state.lang] || b.name.ru || b.slug; }
  function motName(m){ var x = String(m[state.lang] || m.ru || m.id); return x.charAt(0).toUpperCase()+x.slice(1); }
  // «all» / «a+b» -> {sel:[слаги], param}; param — как в адресе
  function motSelect(param){
    var all = MOT.books.map(function(b){ return b.slug; });
    var want = (param && param !== "all") ? String(param).split("+") : [];
    var sel = all.filter(function(sl){ return want.indexOf(sl) >= 0; });
    return (sel.length && sel.length < all.length) ? {sel:sel, param:sel.join("+"), all:false} : {sel:all, param:"all", all:true};   // выбрано несколько или одна книга — слаги через «+»; все — «all»
  }
  function motHref(param, id){ return "#/motifs"+(id ? "/"+(param || "all")+"/"+id : (param && param !== "all" ? "/"+param : "")); }
  // индекс мотивов по выбранным книгам: число гравюр у родителя — с учётом дочерних
  function motBuild(sel){
    var nodes = {}, order = [];
    Object.keys(MOT.vocab).forEach(function(id){ var m = MOT.vocab[id]; var n = nodes[id] = {id:id, ru:m.ru, en:m.en, fr:m.fr, category:m.category, parent:m.parent || null, own:[], kids:[]}; order.push(n); });
    MOT.books.forEach(function(b){
      if(sel.indexOf(b.slug) < 0) return;
      Object.keys(b.bind).forEach(function(id){ var n = nodes[id]; if(n) b.bind[id].forEach(function(a){ n.own.push(b.slug+"|"+a); }); });
    });
    order.forEach(function(n){ var p = n.parent && nodes[n.parent]; if(p) p.kids.push(n); });
    function allOf(n){
      if(n.all) return n.all;
      var seen = {}, res = [];
      function add(k){ if(!seen[k]){ seen[k] = 1; res.push(k); } }
      n.own.forEach(add); n.kids.forEach(function(c){ allOf(c).forEach(add); });
      return (n.all = res);
    }
    order.forEach(allOf);
    return {nodes:nodes, list:order.filter(function(n){ return n.all.length > 0; })};
  }
  function motSort(a, b){ return b.all.length - a.all.length || motName(a).localeCompare(motName(b), state.lang); }
  // Выбор книги: раскрывающееся поле «Книги: все ▾» (заголовок-кнопка + строки «Все книги» / по книге); раскрывается на месте анимацией высоты контейнера (~280 мс, ease-out) и opacity строк
  var MOT_CHEV = '<svg class="ic-mot-chev" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1.5 1.5 6 6l4.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MOT_CHK = '<svg class="ic-mot-chk" width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true"><path d="M1.5 6.5 5.5 10.5 14.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MOT_DASH = '<svg class="ic-mot-dash" width="12" height="2" viewBox="0 0 12 2" fill="none" aria-hidden="true"><path d="M1 1h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var T_BK = 280;
  function motBookLabel(cur){
    var n = MOT.books.length, b;
    if(cur.all) return t("motBkBtn",{b: t("motBkAllS")});
    if(cur.sel.length === 1){ b = MOT.books.filter(function(x){ return x.slug === cur.sel[0]; })[0]; return t("motBkBtn",{b: motBookName(b || {name:{}, slug:cur.sel[0]})}); }
    return t("motBkBtn",{b: t("motBkSome",{k:cur.sel.length, n:n})});
  }
  function motBkCount(b){ var seen = {}; Object.keys(b.bind).forEach(function(k){ b.bind[k].forEach(function(a){ seen[a] = 1; }); }); return Object.keys(seen).length; }
  // сведения для строк (обложка) — из library.json и book.json; грузятся один раз
  function motBookInfo(cb){
    if(MOT.info){ cb(MOT.info); return; }
    loadLibrary(function(list){
      var need = MOT.books.map(function(b){ return list.filter(function(x){ return x.slug === b.slug; })[0]; });
      Promise.all(need.map(function(b){ return b ? libMetaOf(b) : null; })).then(function(ms){
        var info = {};
        MOT.books.forEach(function(b, i){
          var lb = need[i], m = ms[i] || {};
          info[b.slug] = {thumb: lb ? (lb.thumb ? BASE+lb.thumb : bookDir(lb)+(m.libThumb || "lib-thumb.webp")) : "", m:m};
        });
        MOT.info = info; cb(info);
      });
    });
  }
  // строки поля: «Все книги» (галочка / черта / пусто) и по строке на книгу (обложка, название, число гравюр с мотивами, чекбокс)
  function motBkRows(cur, info){
    function th(slug){ var inf = info && info[slug]; return inf && inf.thumb ? '<img src="'+esc(inf.thumb)+'" alt="" decoding="async">' : ""; }
    var total = 0; MOT.books.forEach(function(b){ total += motBkCount(b); });
    function cb(){ return '<span class="ic-mot-cb" aria-hidden="true">'+MOT_CHK+MOT_DASH+'</span>'; }
    return '<button type="button" class="ic-mot-bkrow ic-mot-bkall" role="checkbox" data-bk="all" aria-checked="'+(cur.all ? "true" : "mixed")+'"><span class="ic-mot-bkth ic-mot-bkth2">'+MOT.books.slice(0,2).map(function(b){ return th(b.slug); }).join("")+'</span><span class="ic-mot-bknm">'+esc(t("motAllBooks"))+'</span><span class="ic-mot-bkn">'+total+'</span>'+cb()+'</button>'+
      MOT.books.map(function(b){
        return '<button type="button" class="ic-mot-bkrow" role="checkbox" data-bk="'+esc(b.slug)+'" aria-checked="'+(cur.sel.indexOf(b.slug) >= 0)+'"><span class="ic-mot-bkth">'+th(b.slug)+'</span><span class="ic-mot-bknm">'+esc(motBookName(b))+'</span><span class="ic-mot-bkn">'+motBkCount(b)+'</span>'+cb()+'</button>';
      }).join("");
  }
  function motBooksBtn(cur){
    if(MOT.books.length < 2) return "";   // у одной книги выбирать нечего
    return '<div class="ic-mot-bk"><button type="button" class="ic-mot-bookbtn" aria-expanded="false" aria-haspopup="true"><span class="ic-mot-bkhl">'+esc(motBookLabel(cur))+'</span>'+MOT_CHEV+'</button>'+
      '<div class="ic-mot-bkbody" role="group" aria-label="'+esc(t("motBkTtl"))+'" hidden>'+motBkRows(cur, MOT.info)+'</div></div>';
  }
  // заголовок и состояние строк по текущему выбору (поле при этом остаётся раскрытым)
  function motBkSync(box, cur){
    box.querySelector(".ic-mot-bkhl").textContent = motBookLabel(cur);
    [].forEach.call(box.querySelectorAll("[data-bk]"), function(r){
      var sl = r.getAttribute("data-bk");
      r.setAttribute("aria-checked", sl === "all" ? (cur.all ? "true" : "mixed") : String(cur.sel.indexOf(sl) >= 0));
    });
  }
  var motSelPending = false;
  function motSetAddr(param, mid){
    var h = motHref(param, mid);
    if(location.hash === h) return;
    motSelPending = true; location.replace(h);   // route() пропустит это изменение адреса: страница уже перерисована на месте
  }
  function motBkReduce(){ return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  // раскрыть/свернуть: только высота контейнера и opacity строк (transform страницы не используется); done — по окончании
  function motBkSet(box, open, done){
    var hd = box.querySelector(".ic-mot-bookbtn"), body = box.querySelector(".ic-mot-bkbody");
    if(box.classList.contains("ic-open") === open){ if(done) done(); return; }
    box.classList.toggle("ic-open", open); hd.setAttribute("aria-expanded", open ? "true" : "false");
    body.getAnimations().forEach(function(a){ a.cancel(); });
    var rows = [].slice.call(body.querySelectorAll(".ic-mot-bkrow"));
    rows.forEach(function(r){ r.getAnimations().forEach(function(a){ a.cancel(); }); });
    if(motBkReduce()){ body.hidden = !open; if(done) done(); return; }
    var H = open ? (body.hidden = false, body.scrollHeight) : body.offsetHeight;
    var a = body.animate([{height:(open ? 0 : H)+"px"},{height:(open ? H : 0)+"px"}], {duration:T_BK, easing:"cubic-bezier(0,0,.2,1)", fill:"both"});
    rows.forEach(function(r){ r.animate([{opacity:open ? 0 : 1},{opacity:open ? 1 : 0}], {duration:T_BK, easing:"cubic-bezier(0,0,.2,1)", fill:"both"}); });
    a.onfinish = function(){
      a.cancel(); rows.forEach(function(r){ r.getAnimations().forEach(function(x){ x.cancel(); }); });
      if(!open) body.hidden = true;
      if(done) done();
    };
  }
  var motBkDoc = false;
  // host — контейнер со всеми такими полями страницы (делегирование); cur — выбранные книги (меняется на месте), mid — мотив (или null), onChange — перерисовать страницу под новый выбор
  function motMountBooks(host, cur, mid, onChange){
    if(!host || MOT.books.length < 2) return;
    if(!MOT.info) motBookInfo(function(){ [].forEach.call(root.querySelectorAll(".ic-mot-bkbody"), function(b){ b.innerHTML = motBkRows(cur, MOT.info); }); });
    host.addEventListener("click", function(e){
      var box = e.target.closest(".ic-mot-bk"); if(!box) return;
      if(e.target.closest(".ic-mot-bookbtn")){ motBkSet(box, !box.classList.contains("ic-open")); return; }
      var r = e.target.closest("[data-bk]"); if(!r) return;
      var sl = r.getAttribute("data-bk"), all = MOT.books.map(function(b){ return b.slug; }), sel = cur.sel.slice();
      if(sl === "all"){ if(cur.all) return; sel = all; }                       // «Все книги»: отметить все; если все уже отмечены — без изменений
      else if(sel.indexOf(sl) >= 0){ if(sel.length === 1) return; sel.splice(sel.indexOf(sl), 1); }   // последнюю отмеченную книгу снять нельзя
      else sel = all.filter(function(x){ return x === sl || sel.indexOf(x) >= 0; });
      var nc = motSelect(sel.join("+")); cur.sel = nc.sel; cur.param = nc.param; cur.all = nc.all;
      MOT_CUR = cur.param; motBkSync(box, cur); motSetAddr(cur.param, mid);
      if(onChange) onChange();
    });
    host.addEventListener("keydown", function(e){
      var box = e.target.closest && e.target.closest(".ic-mot-bk"); if(!box) return;
      if(e.key === "Escape" && box.classList.contains("ic-open")){ e.preventDefault(); motBkSet(box, false); box.querySelector(".ic-mot-bookbtn").focus(); return; }
      if((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target.closest(".ic-mot-bkbody")){
        var rows = [].slice.call(box.querySelectorAll(".ic-mot-bkrow")), i = rows.indexOf(e.target.closest(".ic-mot-bkrow"));
        e.preventDefault(); rows[(i + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
      }
    });
    if(!motBkDoc){   // тап вне поля сворачивает его без изменений (один слушатель на документ)
      motBkDoc = true;
      document.addEventListener("click", function(e){
        [].forEach.call(document.querySelectorAll(".ic-mot-bk.ic-open"), function(box){ if(!box.contains(e.target)) motBkSet(box, false); });
      }, true);
    }
  }
  // Шапка «Мотивов» и главной библиотеки: переключатель «Книги | Мотивы» (одна капсула, подложка выбранной половины переезжает)
  function motTop(active){
    var pos = active === "motifs" ? 1 : 0;
    return '<nav class="ic-booktabs ic-mot-bt" id="ic-booktabs" aria-label="'+esc(t("hmNavLabel"))+'">'+
      '<div class="ic-mot-cap" data-pos="'+pos+'"><span class="ic-mot-pill" aria-hidden="true"><i></i></span>'+
        '<a href="#/"'+(pos === 0 ? ' class="on"' : "")+'><span>'+esc(t("motTabBooks"))+'</span></a>'+
        '<a href="#/motifs"'+(pos === 1 ? ' class="on"' : "")+'><span>'+esc(t("motTitle"))+'</span></a></div></nav>';
  }
  function motShell(strip){
    // строка разделов: обрезающий контейнер (из него она выезжает вниз из-под переключателя), линия над ней и мягкая тень под ней
    return '<div class="ic-stack ic-mot-stack ic-stack-flow" id="ic-stack">'+motTop("motifs")+(strip ? '<div class="ic-mot-rwrap"><div class="ic-mot-rclip">'+ripaBarWrap(strip)+'</div><i class="ic-mot-shd"></i></div>' : "")+'</div>';
  }
  /* ---------- сессия «Книги | Мотивы» и переход между ними (v258) ----------
     Главная библиотеки и каталог «Мотивов» — две панели, собранные ОДИН раз и живущие в DOM вместе (скрытая — `.ic-pane-off`: вне потока, нулевая высота, visibility:hidden,
     раскладка уже посчитана); общая шапка («Библиотека», переключатель) и строка разделов (скрыта на главной) — тоже один раз. Нажатие на переключатель НЕ строит страницу —
     только переключает готовые. Обе панели на время перехода кладутся друг на друга абсолютно, каждая на своё конечное место; строка разделов — абсолютная поверх, её контейнер
     анимирует height (0↔H), сама строка — translateY(−100%↔0). После подготовки (позиции, новая страница с opacity 0) ждём ДВА requestAnimationFrame и только тогда запускаем
     ВСЕ анимации одновременно с общим startTime = document.timeline.currentTime (относительные задержки — delay внутри Web Animations; setTimeout для фаз нет): если главный поток
     занят, анимации всё равно начинаются с нуля. Тайминг (мс, × slow): уход старой 0–180 (opacity 1→0, translateY 0→+6px, ease-in (.4,0,1,1)); появление новой — delay 90, длится 700
     (opacity 0→1, translateY −6→0, ease-out (0,0,.2,1)); шапка/строка 0–320 (.45,0,.2,1); подложка переключателя 0–510 той же кривой. Конец ≈790: абсолютное позиционирование снято,
     старая панель скрыта, строка на «Мотивах» — в обычной прилипающей позиции; положение до и после совпадает пиксель в пиксель.
     Только по нажатию на переключатель (прямой заход, «назад/вперёд», обновление — панели переключаются мгновенно, без анимации); повторные нажатия игнорируются; reduce-motion — мгновенно.
     НИКАКИХ клонов, шлейфа, масок и filter на этих страницах (на iPhone дают артефакты). */
  var motNav = null, motHomeY = 0, libMetas = null, MS = null;
  var C_IN = "cubic-bezier(.4,0,1,1)", C_OUT = "cubic-bezier(0,0,.2,1)", C_HDR = "cubic-bezier(.45,0,.2,1)", MOT_DIM = "rgba(236,229,212,.62)", MOT_LIT = "rgb(236,229,212)";
  var T_OUT = 180, T_IN0 = 90, T_IN = 700, T_HDR = 320, T_END = 790, T_PILL = 510;
  // ?slow=N в адресе (например ?slow=5#/motifs) — все длительности перехода ×N (проверка на телефоне); без параметра — как есть. __icMotMs — замедление в тестах.
  function motSlow(){ var m = /[?&]slow=([0-9.]+)/.exec(location.search), n = m ? parseFloat(m[1]) : 1; return (n > 0 && n <= 30) ? n : 1; }
  function motScale(){ return (window.__icMotMs || T_END)/T_END*motSlow(); }
  function msPane(w){ return root.querySelector(':scope > .ic-pane[data-pane="'+w+'"]'); }
  function msAlive(){ return !!(MS && msPane("home") && msPane("motifs")); }
  function msHtml(){
    return '<div class="ic-stack ic-mot-stack ic-stack-flow" id="ic-stack">'+motTop("books")+
        '<div class="ic-mot-rwrap ic-mot-rw-off"><div class="ic-mot-rclip">'+ripaBarWrap("")+'</div><i class="ic-mot-shd"></i></div></div>'+
      '<div class="ic-wrap ic-lib ic-pane" data-pane="home"></div>'+
      '<div class="ic-wrap ic-rp ic-mot ic-pane ic-pane-off" data-pane="motifs" aria-hidden="true"></div>'+
      '<div id="ic-rb-dim"></div>';
  }
  // главная: панель «Книги»
  function motFillHome(pane, list, metas){
    var ready = [], wip = [];
    list.forEach(function(b, i){ if(!metas[i]) return; (b.status === "wip" ? wip : ready).push(libRowHtml(b, metas[i])); });
    pane.innerHTML =
      '<div class="ic-top-row">'+langSwitch()+'</div>'+
      '<p class="ic-sub ic-lib-sub">'+t("libSub")+'</p>'+
      (ready.length || wip.length ? "" : '<p class="ic-empty">'+t("libEmpty")+'</p>')+
      (ready.length ? '<ul class="ic-lib-list">'+ready.join("")+'</ul>' : "")+
      (wip.length ? '<h2 class="ic-lib-sect">'+esc(t("libWip"))+'</h2><ul class="ic-lib-list">'+wip.join("")+'</ul>' : "");
    pane.querySelectorAll(".ic-lib-row:not(.ic-lib-wip)").forEach(function(c){
      function go(){ location.hash = "#/"+c.getAttribute("data-slug")+(c.hasAttribute("data-home") ? "/home" : ""); }
      c.addEventListener("click", go);
      c.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
    });
  }
  function libReady(cb){
    loadLibrary(function(list){
      if(libMetas && libMetas.length === list.length){ cb(list, libMetas); return; }
      Promise.all(list.map(function(b){ return libMetaOf(b); })).then(function(m){ libMetas = m; cb(list, m); });
    });
  }
  // мгновенная активация панели (прямой заход, «назад/вперёд», смена языка и т. п.) — без анимации
  function msActivate(which){
    var home = msPane("home"), mot = msPane("motifs"), rw = root.querySelector(":scope > .ic-stack .ic-mot-rwrap"), cap = root.querySelector(".ic-mot-cap");
    home.classList.toggle("ic-pane-off", which !== 0); home.setAttribute("aria-hidden", which !== 0 ? "true" : "false");
    mot.classList.toggle("ic-pane-off", which !== 1); mot.setAttribute("aria-hidden", which !== 1 ? "true" : "false");
    rw.classList.toggle("ic-mot-rw-off", which !== 1);
    if(cap){ cap.setAttribute("data-pos", which); [].forEach.call(cap.querySelectorAll("a"), function(a, i){ a.classList.toggle("on", i === which); }); }
    renderBackBarBrand(which === 0);
    MS.active = which;
    var tb = root.querySelector(".ic-mot-tabs"); if(tb) tb.dispatchEvent(new Event("scroll"));   // затухание краёв вкладок пересчитывается, когда строка показана
  }
  // сборка сессии: обе панели и шапка строятся один раз; потом переключаются, а не строятся заново
  function msBuild(which, p){
    var gen = renderGen;
    root.innerHTML = loadingHtml("", {});
    var dataLeft = 2, gotList = null, gotMetas = null;
    function build(){
      var list = gotList, metas = gotMetas;
      if(gen !== renderGen) return;
      var cur = motSelect(p ? p.mb : "all");
      root.innerHTML = msHtml();
      var rb = root.querySelector(":scope > .ic-stack .ic-mot-rwrap .ic-rbar"), mot = msPane("motifs");
      motFillHome(msPane("home"), list, metas);
      var api = null;
      if(MOT.books.length) api = motFillCatalog(cur, gen, rb, mot);
      else { mot.innerHTML = '<div class="ic-top-row">'+langSwitch()+'</div><p class="ic-empty">'+esc(t("motNone"))+'</p>'; }
      MS = {lang:state.lang, mb:cur.param, active:which, api:api};
      ripaBind(MOT_BOOK, gen, []);
      flowOn();   // шапка уезжает нативно (HANDOFF, раздел 10): «Библиотека» и переключатель — часть страницы; прилипает только строка разделов
      msActivate(which);
      msScroll(gen, which);
      nudgeRepaint();
    }
    motLoad(function(){ if(--dataLeft === 0) build(); });                                   // данные мотивов и книг грузятся параллельно
    libReady(function(list, metas){ gotList = list; gotMetas = metas; if(--dataLeft === 0) build(); });
  }
  function msScroll(gen, which){
    if(which === 1){ state.scroll = 0; restoreOrTop(gen); if(MS.api && motUi.find && !motUi.q.trim()) MS.api.setFind(true); }
    else restoreOrTop(gen);
  }
  function homeRoute(){
    var gen = renderGen;
    if(msAlive() && MS.lang === state.lang){ flowOn(); msActivate(0); msScroll(gen, 0); return; }
    msBuild(0, null);
  }
  function motifsRoute(p){
    var gen = renderGen;
    if(msAlive() && MS.lang === state.lang && MS.mb === motSelect(p.mb).param){ flowOn(); msActivate(1); msScroll(gen, 1); return; }
    msBuild(1, p);
  }
  // подложка и подписи переключателя: Web Animations, стартуют вместе со всем (общий startTime)
  function msPillJobs(nav, to, jobs, sc){
    var cap = nav && nav.querySelector(".ic-mot-cap"); if(!cap) return;
    var dur = T_PILL*sc, pill = cap.querySelector(".ic-mot-pill"), as = cap.querySelectorAll("a");
    cap.setAttribute("data-pos", to);
    [].forEach.call(as, function(a, i){ a.classList.toggle("on", i === to); });
    jobs.push([pill, [{transform:"translate3d("+(100*(1-to))+"%,0,0)"}, {transform:"translate3d("+(100*to)+"%,0,0)"}], {duration:dur, easing:C_HDR}]);
    [].forEach.call(as, function(a, i){ jobs.push([a, i === to ? [{color:MOT_DIM},{color:MOT_LIT}] : [{color:MOT_LIT},{color:MOT_DIM}], {duration:dur, easing:C_HDR}]); });
  }
  function msAbs(el, top){ el.style.position = "absolute"; el.style.left = "0"; el.style.right = "0"; el.style.top = top+"px"; }
  function msClear(el){ if(!el) return; ["position","left","right","top","zIndex","pointerEvents","opacity","height","transform"].forEach(function(k){ el.style[k] = ""; }); if(!el.getAttribute("style")) el.removeAttribute("style"); el.removeAttribute("data-mot"); }
  function msFinish(n){
    if(!n || n.done) return; n.done = true;
    clearTimeout(n.timer);
    var oldP = n.oldP, newP = n.newP, rw = n.rw;
    [oldP, newP, rw].concat(rw ? [].slice.call(rw.querySelectorAll(".ic-mot-rclip, .ic-ch-outer-bar, .ic-mot-shd")) : []).forEach(function(e){ if(e && e.getAnimations) e.getAnimations().forEach(function(a){ a.cancel(); }); });
    if(motNav === n) motNav = null;
    if(!msAlive()){ root.style.position = ""; root.style.minHeight = ""; return; }   // уже ушли на другую страницу
    msClear(newP); msClear(oldP); msClear(rw);
    [rw && rw.querySelector(".ic-mot-rclip"), rw && rw.querySelector(".ic-ch-outer-bar"), rw && rw.querySelector(".ic-mot-shd")].forEach(function(e){ if(e){ e.style.height = ""; e.style.transform = ""; e.style.opacity = ""; if(!e.getAttribute("style")) e.removeAttribute("style"); } });
    root.style.position = ""; root.style.minHeight = ""; if(!root.getAttribute("style")) root.removeAttribute("style");
    msActivate(n.to);
  }
  function motNavAbort(){ if(motNav) msFinish(motNav); }
  function msSwitch(from, to, nav, href){
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var home = msPane("home"), mot = msPane("motifs"), rw = root.querySelector(":scope > .ic-stack .ic-mot-rwrap"), oldP = from ? mot : home, newP = to ? mot : home;
    var clip = rw.querySelector(".ic-mot-rclip"), bar = rw.querySelector(".ic-ch-outer-bar"), shd = rw.querySelector(".ic-mot-shd");
    if(window.scrollY > 1) window.scrollTo(0, 0);   // нажато не вверху: сначала страница без анимации наверх, потом переход
    var n = motNav = {from:from, to:to, oldP:oldP, newP:newP, rw:rw, t0:performance.now(), hashPending:false, done:false};
    var sc = motScale(), target = href.replace(/^#/, "");
    n.timer = setTimeout(function(){ msFinish(n); }, 6000 + T_END*sc);
    if(reduce){   // мгновенно: панели переключаются, подложка переезжает
      motNav = null; clearTimeout(n.timer); n.hashPending = false;
      msActivate(to); window.scrollTo(0, 0); location.hash = target;
      var jr = []; msPillJobs(nav, to, jr, sc); jr.forEach(function(j){ j[0].animate(j[1], j[2]); });
      return;
    }
    n.hashPending = true; location.hash = target;
    // 1. подготовка (только стили и измерения, страницы не строятся): положения в документе
    var bt = document.getElementById("ic-booktabs"), hdr = Math.round(bt.getBoundingClientRect().bottom + window.scrollY);
    var oldTop = Math.round(oldP.getBoundingClientRect().top + window.scrollY), rootH = Math.max(Math.ceil(root.getBoundingClientRect().height), window.innerHeight);
    if(to) rw.classList.remove("ic-mot-rw-off");
    var H = Math.round(rw.getBoundingClientRect().height);
    var newTop = hdr + (to ? H : 0);
    root.style.position = "relative"; root.style.minHeight = rootH+"px";
    msAbs(oldP, oldTop); oldP.style.pointerEvents = "none"; oldP.setAttribute("data-mot", "old");
    newP.classList.remove("ic-pane-off"); newP.setAttribute("aria-hidden", "false"); msAbs(newP, newTop); newP.style.opacity = "0"; newP.setAttribute("data-mot", "new");
    msAbs(rw, hdr); rw.style.zIndex = "9"; rw.setAttribute("data-mot", to ? "new" : "old");
    if(to){ clip.style.height = "0px"; bar.style.transform = "translate3d(0,-100%,0)"; shd.style.opacity = "0"; }   // первый кадр выезда — строка свёрнута
    var tb = root.querySelector(".ic-mot-tabs"); if(tb) tb.classList.remove("ic-mot-fade");   // на время перехода маска вкладок снята
    // 2. два requestAnimationFrame (первый кадр с новым состоянием уже нарисован), затем ВСЕ анимации стартуют одновременно с общим startTime
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      if(motNav !== n || n.done) return;
      var st = document.timeline.currentTime, jobs = [], last = null;
      jobs.push([oldP, [{opacity:1, transform:"translate3d(0,0,0)"}, {opacity:0, transform:"translate3d(0,6px,0)"}], {duration:T_OUT*sc, easing:C_IN, fill:"forwards"}]);
      jobs.push([newP, [{opacity:0, transform:"translate3d(0,-6px,0)"}, {opacity:1, transform:"translate3d(0,0,0)"}], {duration:T_IN*sc, delay:T_IN0*sc, easing:C_OUT, fill:"backwards"}]);
      var so = {duration:T_HDR*sc, easing:C_HDR, fill:"both"};
      jobs.push([clip, [{height:(to ? 0 : H)+"px"}, {height:(to ? H : 0)+"px"}], so]);
      jobs.push([bar, [{transform:"translate3d(0,"+(to ? "-100%" : "0")+",0)"}, {transform:"translate3d(0,"+(to ? "0" : "-100%")+",0)"}], so]);
      jobs.push([shd, [{opacity: to ? 0 : 1}, {opacity: to ? 1 : 0}], so]);
      msPillJobs(nav, to, jobs, sc);
      jobs.forEach(function(j){ var a = j[0].animate(j[1], j[2]); a.startTime = st; if(j[0] === newP) last = a; });
      last.onfinish = function(){ msFinish(n); };
    }); });
  }
  // плитка/метка мотива не остаётся «нажатой»: после тапа фокус снимается (подсветки по :focus нет)
  root.addEventListener("click", function(e){
    var f = e.target.closest && e.target.closest(".ic-mot-tile, .ic-mot-tag, .ic-mot-more, .ic-mot-allbtn"); if(f && f.blur) setTimeout(function(){ f.blur(); }, 0);
  }, true);
  root.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest(".ic-mot-cap a"); if(!a) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var nav = a.closest(".ic-booktabs"), cap = a.closest(".ic-mot-cap"), from = +cap.getAttribute("data-pos"), to = a.getAttribute("href") === "#/motifs" ? 1 : 0;
    if(from === to) return;                      // та же половина: обычный переход по ссылке (например, со страницы мотива в каталог)
    if(!msAlive() || !nav.closest("#iconologie > .ic-stack.ic-mot-stack") || !root.querySelector(":scope > .ic-stack .ic-mot-rwrap.ic-mot-rw-off, :scope > .ic-pane")) return;   // не в сессии (страница мотива): обычный переход по ссылке
    e.preventDefault();
    if(motNav) return;                           // переход уже идёт
    msSwitch(from, to, nav, a.getAttribute("href"));
  });
  // страницы готовятся заранее, в простое: переход стартует в тот же кадр, что и нажатие
  function motWarm(){
    var run = function(){
      motLoad(function(){});
      loadLibrary(function(list){
        if(libMetas) return;
        Promise.all(list.map(function(b){ return libMetaOf(b); }))
          .then(function(m){ if(!libMetas) libMetas = m; });
      });
    };
    if(window.requestIdleCallback) requestIdleCallback(run, {timeout:1500}); else setTimeout(run, 400);
  }
  function motNum(n){
    var L = state.lang;
    if(L === "ru"){ var a = n % 100, b = n % 10; return n+" "+((a > 10 && a < 15) ? "гравюр" : b === 1 ? "гравюра" : (b >= 2 && b <= 4) ? "гравюры" : "гравюр"); }
    if(L === "fr") return n+" "+(n === 1 ? "gravure" : "gravures");
    return n+" "+(n === 1 ? "engraving" : "engravings");
  }
  // «22 мотива» / «22 motifs»: число мотивов в разделе (число на плитке — число гравюр)
  function motMotifsN(n){
    var L = state.lang;
    if(L === "ru"){ var a = n % 100, b = n % 10; return n+" "+((a > 10 && a < 15) ? "мотивов" : b === 1 ? "мотив" : (b >= 2 && b <= 4) ? "мотива" : "мотивов"); }
    return n+" "+(n === 1 ? "motif" : "motifs");
  }
  // мотив-родитель, названный так же, как раздел («Оружие» в разделе «Оружие»), подписывается «Оружие, всё» / «All weapons» / «Toutes les armes»
  function motSameAsSection(n){
    var c = MOT_ALL_LBL.ru[n.category]; if(!c) return false;
    var lab = norm(t(MOT_CAT_KEY[n.category])), nm = norm(motName(n));
    if(!lab || !nm) return false;
    var k = 0; while(k < nm.length && k < lab.length && nm.charAt(k) === lab.charAt(k)) k++;
    return Math.abs(nm.length - lab.length) <= 1 && k >= nm.length - 1 && k >= lab.length - 1 && nm.length > 3;
  }
  function motTileName(n){
    if(!motSameAsSection(n)) return motName(n);
    return state.lang === "ru" ? motName(n)+", всё" : MOT_ALL_LBL[state.lang][n.category];
  }
  function motTile(n, cur, cls){
    return '<a class="ic-mot-tile'+(cls ? " "+cls : "")+'" href="'+esc(motHref(cur.param, n.id))+'" data-id="'+esc(n.id)+'"><span class="ic-mot-nm">'+esc(motTileName(n))+'</span><span class="ic-mot-n" aria-label="'+esc(t("motCount",{n:n.all.length}))+'">'+n.all.length+'</span></a>';
  }
  var MOT_LOUPE = '<button type="button" class="ic-mot-loupe" aria-label="'+"%L%"+'">'+ICON_SEARCH+'</button>';
  function motLoupe(){ return MOT_LOUPE.replace("%L%", esc(t("motFind"))); }
  function renderMotifs(p){
    var gen = renderGen;
    root.innerHTML = loadingHtml("", {});
    motLoad(function(){
      if(gen !== renderGen) return;
      var cur = motSelect(p.mb);
      if(!MOT.books.length){ root.innerHTML = motShell("")+'<div class="ic-wrap ic-rp ic-mot"><div class="ic-top-row">'+langSwitch()+'</div><p class="ic-empty">'+esc(t("motNone"))+'</p></div>'; ripaBind(MOT_BOOK, gen, []); return; }
      // нужные книги (названия статей, картинки) — только для страницы мотива; каталогу хватает данных мотивов
      var pend = p.mid && cur.sel.some(motNotReady);
      if(pend) renderMotifGrid(p, cur, gen, true);   // шапка, строка с названием и заголовок — сразу; «Загрузка» только в области сетки
      motEnsure(p.mid ? cur.sel : [], gen, function(){ renderMotifGrid(p, cur, gen); });
    });
  }
  // Каталог «Мотивов»: строка разделов (rbarEl — .ic-rbar в стеке) и панель страницы (pane) заполняются один раз при сборке сессии и дальше живут в DOM
  function motFillCatalog(cur, gen, rbarEl, pane){
    var ix = motBuild(cur.sel);
    var findOn = motUi.find || !!motUi.q.trim();
    var strip = '<div class="ic-mot-bar'+(findOn ? " ic-mot-finding" : "")+'">'+
        '<div class="ic-mot-tabs" role="tablist" aria-label="'+esc(t("motCats"))+'"></div>'+
        '<div class="ic-mot-findbox"><input class="ic-mot-findin" type="search" enterkeyhint="search" value="'+esc(motUi.q)+'" placeholder="'+esc(t("motFind"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("motFind"))+'">'+
        '<button type="button" class="ic-mot-findx" aria-label="'+esc(t("clearSearch"))+'">&times;</button></div>'+
        motLoupe()+
      '</div>';
    rbarEl.innerHTML = strip;
    pane.innerHTML = '<div class="ic-top-row">'+langSwitch()+'</div><div class="ic-mot-body"></div>';
    var bkBtn = motBooksBtn(cur); MOT_CUR = cur.param;
    motMountBooks(pane, cur, null, function(){ if(MS) MS.mb = cur.param; ix = motBuild(cur.sel); fill(); });   // выбор книг: числа и плитки пересчитываются на месте, поле остаётся раскрытым
    var bar = rbarEl.querySelector(".ic-mot-bar"), tabsEl = bar.querySelector(".ic-mot-tabs"), body = pane.querySelector(".ic-mot-body"),
        findIn = bar.querySelector(".ic-mot-findin");
    function roots(list){ var inL = {}; list.forEach(function(n){ inL[n.id] = 1; }); return list.filter(function(n){ return !(n.parent && inL[n.parent]); }); }
    function family(arr, inS){
      var html = "";
      arr.slice().sort(motSort).forEach(function(n){
        var kids = n.kids.filter(function(c){ return inS[c.id]; }).sort(motSort);
        html += '<div class="ic-mot-fam">'+motTile(n, cur, kids.length ? "ic-mot-par" : "")+kids.map(function(c){ return motTile(c, cur, "ic-mot-kid"); }).join("")+'</div>';
      });
      return html;
    }
    var keepL = 0, smooth = false;
    function maskSync(){   // мягкое затухание краёв прокручиваемой строки вкладок: слева — только если прокручено от начала, справа — только если есть что листать
      var l = tabsEl.scrollLeft > 1 ? 24 : 0, r = tabsEl.scrollLeft + tabsEl.clientWidth < tabsEl.scrollWidth - 1 ? 24 : 0;
      tabsEl.style.setProperty("--ml", l+"px"); tabsEl.style.setProperty("--mr", r+"px");
      tabsEl.classList.toggle("ic-mot-fade", !motNav && (l > 0 || r > 0));   // маска есть только в покое (во время перехода — нет)
    }
    function fill(){
      keepL = tabsEl.scrollLeft;
      var nq = norm(motUi.q.trim()), words = nq ? nq.split(/\s+/) : [];
      var have = {}; ix.list.forEach(function(n){ have[n.category] = 1; });
      var cats = MOT_CATS.filter(function(c){ return have[c]; });
      if(motUi.cat !== "all" && !have[motUi.cat]) motUi.cat = "all";
      tabsEl.innerHTML = [["all", t("motCatAll")]].concat(cats.map(function(c){ return [c, t(MOT_CAT_KEY[c])]; })).map(function(x){
        return '<button type="button" class="ic-mot-tab" role="tab" data-cat="'+esc(x[0])+'" aria-selected="'+(motUi.cat===x[0])+'" aria-pressed="'+(motUi.cat===x[0])+'">'+esc(x[1])+'</button>';
      }).join("");
      tabsEl.scrollLeft = keepL;
      var on = tabsEl.querySelector('[aria-pressed="true"]');
      if(on && tabsEl.scrollWidth > tabsEl.clientWidth){
        var tl = on.getBoundingClientRect().left - tabsEl.getBoundingClientRect().left + tabsEl.scrollLeft;
        var want = Math.max(0, Math.min(tabsEl.scrollWidth - tabsEl.clientWidth, tl - (tabsEl.clientWidth - on.offsetWidth)/2));
        if(smooth && tabsEl.scrollTo) tabsEl.scrollTo({left:want, behavior:"smooth"}); else tabsEl.scrollLeft = want;
      }
      maskSync();
      var html = "";
      if(words.length){
        var S = ix.list.filter(function(n){ return words.every(function(w){ return wsFind(norm(motName(n)), w) > -1; }); }).sort(motSort);
        html = bkBtn+(S.length ? '<div class="ic-mot-grid2">'+S.map(function(n){ return motTile(n, cur, ""); }).join("")+'</div>' : '<p class="ic-empty">'+esc(t("motNone"))+'</p>');
      } else if(motUi.cat === "all"){
        html = '<header class="ic-head ic-rp-head"><h1 class="ic-h-fr ic-rp-h1">'+esc(t("motTitle"))+'</h1><p class="ic-sub ic-mot-sub">'+esc(t("motSub"))+'</p>'+bkBtn+'</header>';
        cats.forEach(function(c){
          var L = ix.list.filter(function(n){ return n.category === c; }), top = roots(L).sort(motSort).slice(0, 8);
          html += '<section class="ic-mot-sect"><h2 class="ic-mot-sh"><span>'+esc(t(MOT_CAT_KEY[c]))+'</span></h2>'+
            '<div class="ic-mot-grid2">'+top.map(function(n){ return motTile(n, cur, ""); }).join("")+'</div>'+
            '<button type="button" class="ic-mot-allbtn" data-cat="'+esc(c)+'">'+esc(MOT_ALL_LBL[state.lang][c])+' · '+L.length+'</button></section>';
        });
      } else {
        var L2 = ix.list.filter(function(n){ return n.category === motUi.cat; }), inS = {}; L2.forEach(function(n){ inS[n.id] = 1; });
        html = bkBtn+'<h2 class="ic-mot-sh ic-mot-sh1"><span>'+esc(t(MOT_CAT_KEY[motUi.cat]))+'</span></h2>'+
          '<div class="ic-mot-fams">'+family(roots(L2), inS)+'</div>';
      }
      var kept = body.querySelector(".ic-mot-bk"); if(kept) kept.parentNode.removeChild(kept);   // поле выбора книг переживает перерисовку (остаётся раскрытым)
      body.innerHTML = html;
      var nb = body.querySelector(".ic-mot-bk"); if(kept && nb) nb.parentNode.replaceChild(kept, nb);
    }
    function setFind(v){
      motUi.find = v; bar.classList.toggle("ic-mot-finding", v);
      if(v){ try{ findIn.focus({preventScroll:true}); }catch(e){ findIn.focus(); } }
      else { findIn.blur(); }
    }
    bar.querySelector(".ic-mot-loupe").addEventListener("click", function(){ setFind(true); });
    bar.querySelector(".ic-mot-findx").addEventListener("click", function(){ motUi.q = ""; findIn.value = ""; setFind(false); fill(); window.scrollTo(0,0); });
    findIn.addEventListener("input", function(){ motUi.q = findIn.value; fill(); });
    findIn.addEventListener("keydown", function(e){ if(e.key==="Enter" || e.key==="Escape"){ e.preventDefault(); findIn.blur(); } });
    function pickCat(c){ motUi.cat = c; smooth = true; fill(); smooth = false; window.scrollTo(0,0); }
    tabsEl.addEventListener("scroll", maskSync, {passive:true});
    tabsEl.addEventListener("click", function(e){ var b = e.target.closest("[data-cat]"); if(b) pickCat(b.getAttribute("data-cat")); });
    body.addEventListener("click", function(e){
      var b = e.target.closest(".ic-mot-allbtn"); if(b){ pickCat(b.getAttribute("data-cat")); return; }
      // переход в мотив: место запоминается заранее (обычный переход по ссылке в WebKit сбрасывает прокрутку до события)
      var a = e.target.closest("a.ic-mot-tile");
      if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){ e.preventDefault(); namesUi.pos[location.hash] = window.scrollY; location.hash = a.getAttribute("href").replace(/^#/,""); }
    });
    fill();
    return {setFind:setFind, tabs:tabsEl};
  }
  function motThumb(book, it){
    if(motIsPlObj(it)) return engBaseOf(book)+"thumb/"+it.file+"_t.webp";
    var src = (it.img||[])[0]; if(!src) return "";
    return isAlc(book) && book.alc ? alcThumbSrc(book, it) : ripaThumb(book, it);
  }
  function renderMotifGrid(p, cur, gen, pending){
    var rbSheets = [], names = {}, fromQ = "";
    MOT.books.forEach(function(b){ names[b.slug] = motBookName(b); });
    // изменяемые части страницы (заголовок строки, число, метки вложенных, сетка) — пересобираются при смене выбора книг
    function dyn(pend){
      var ix = motBuild(cur.sel), n = ix.nodes[p.mid], items = n ? motItems(cur, n) : [], total = items.length;
      fromQ = "?from=motif:"+cur.param+":"+p.mid;
      if(pend) total = n ? n.all.length : 0;
      var used = []; items.forEach(function(x){ if(used.indexOf(x.book.slug) < 0) used.push(x.book.slug); });
      var many = cur.sel.length > 1;   // подпись книги под гравюрой — когда выбрано несколько книг
      var kids = n ? n.kids.filter(function(c){ return c.all.length > 0; }).sort(motSort) : [];
      return {
        ttl: n && total ? esc(motName(n)+" · "+motNum(total)) : esc(t("motTitle")),
        head: n && n.all.length ? esc(motName(n)) : esc(t("motTitle")),
        count: esc(motNum(total))+(used.length ? ' · '+esc(used.map(function(s){ return names[s] || s; }).join(", ")) : ""),
        kids: kids.length ? '<div class="ic-mot-tags ic-mot-kids">'+kids.map(function(c, ki){ return '<a class="ic-mot-tag'+(ki >= 10 ? " ic-mot-kx" : "")+'" href="'+esc(motHref(cur.param, c.id))+'">'+esc(motName(c))+'</a>'; }).join("")+
          (kids.length > 10 ? '<button type="button" class="ic-mot-more">'+esc(t("motMore",{n:kids.length-10}))+'</button>' : "")+'</div>' : "",
        grid: pend ? '<p class="ic-mot-wait">'+esc(t("loading"))+'</p>' : items.length ? '<ul class="ic-gal ic-gal-grid ic-mot-grid">'+items.map(function(x, ix0){
          var th = motThumb(x.book, x.it);
          var pgS = x.plate ? platePageStr(x.it.page) : (t("pageAbbr")+" "+x.it.page);
          return '<li><a class="ic-gal-item" href="'+esc(motHrefOf(x, fromQ))+'" data-slug="'+esc(x.book.slug)+'" data-id="'+esc(x.it.id)+'" data-anchor="'+esc(x.book.slug+"-"+x.it.id)+'"><span class="ic-gal-img ic-rp-gimg">'+(th ? (ix0 < 4 ? '<img fetchpriority="high" decoding="async" src="'+esc(th)+'" alt="">' : '<img loading="lazy" decoding="async" src="'+esc(th)+'" alt="">') : "")+'</span>'+
            '<span class="ic-gal-cap">'+esc(motTitleAny(x.it))+'<small class="ic-gal-pg">'+(many ? esc(names[x.book.slug]||x.book.slug)+(pgS ? ' · ' : "") : "")+esc(pgS)+'</small></span></a></li>';
        }).join("")+'</ul>' : '<p class="ic-empty">'+esc(t("motNone"))+'</p>'
      };
    }
    var d = dyn(pending);
    var strip = '<div class="ic-mot-bar ic-mot-bar-m"><button type="button" class="ic-mot-back" aria-label="'+esc(t("rbBack"))+'">'+ICON_BACK+'</button><span class="ic-mot-ttl">'+d.ttl+'</span>'+motLoupe()+'</div>';
    root.innerHTML = motShell(strip)+
      '<div class="ic-wrap ic-rp ic-mot"><div class="ic-top-row">'+langSwitch()+'</div>'+
        '<header class="ic-head"><h1 class="ic-h-fr ic-mot-h1">'+d.head+'</h1><p class="ic-count ic-mot-count">'+d.count+'</p></header>'+
        '<div class="ic-mot-kidsbox">'+d.kids+'</div>'+
        '<div class="ic-mot-bkhost">'+motBooksBtn(cur)+'</div><div class="ic-mot-gridbox">'+d.grid+'</div></div><div id="ic-rb-dim"></div>';
    ripaBind(MOT_BOOK, gen, rbSheets);
    flowOn();
    var kidsBox = root.querySelector(".ic-mot-kidsbox"), gridBox = root.querySelector(".ic-mot-gridbox");
    function paint(pend){
      var d2 = dyn(pend);
      root.querySelector(".ic-mot-ttl").innerHTML = d2.ttl; root.querySelector(".ic-mot-h1").innerHTML = d2.head; root.querySelector(".ic-mot-count").innerHTML = d2.count;
      kidsBox.innerHTML = d2.kids; gridBox.innerHTML = d2.grid;
    }
    MOT_CUR = cur.param;
    motMountBooks(root.querySelector(".ic-mot-bkhost"), cur, p.mid, function(){   // выбор книг: сетка и числа пересчитываются на месте, поле остаётся раскрытым
      var pend = cur.sel.some(motNotReady); paint(pend);
      if(pend) motEnsure(cur.sel, gen, function(){ paint(false); });
    });
    // назад — в каталог на тот же раздел и место прокрутки (если пришли из каталога — шаг истории назад)
    root.querySelector(".ic-mot-back").addEventListener("click", function(){
      if(cameFromHash && /^#\/motifs(\/[^\/]*)?$/.test(cameFromHash)) history.back(); else location.hash = "#/motifs";
    });
    root.querySelector(".ic-mot-loupe").addEventListener("click", function(){ motUi.find = true; location.hash = "#/motifs"; });
    gridBox.addEventListener("click", function(e){
      var a = e.target.closest(".ic-gal-item");
      if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button===0){
        e.preventDefault(); if(a.blur) a.blur();
        var bk = books[a.getAttribute("data-slug")], id = a.getAttribute("data-id");
        if(motIsPl(bk)) motOpen({book:bk, it:bk.chap.pl.byId[id], plate:true}, fromQ); else ripaOpen(bk, id, "", fromQ);
      }
    });
    kidsBox.addEventListener("click", function(e){   // «ещё N» — раскрыть остальные метки на месте
      var moreB = e.target.closest(".ic-mot-more"); if(!moreB) return;
      moreB.parentNode.classList.add("ic-mot-open"); moreB.parentNode.removeChild(moreB);
    });
    if(document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
    if(!pending){ state.scroll = 0; restoreOrTop(gen); }
    nudgeRepaint();
  }
  // Метки мотивов на карточке статьи (после «Что изображено»): разметка секции; если данные ещё не загружены — заполняется позже
  function motTagsInner(slug, id, lim){
    var ms = MOT.byArt[slug+"|"+id] || [];
    return ms.map(function(m, i){ return '<a class="ic-mot-tag'+(lim && i >= lim ? " ic-mot-kx" : "")+'" href="'+esc(motHref(slug, m.id))+'">'+esc(motName(m))+'</a>'; }).join("")+
      (lim && ms.length > lim ? '<button type="button" class="ic-mot-more">'+esc(t("motMore",{n:ms.length-lim}))+'</button>' : "");
  }
  // метки мотивов на карточке гравюры (Картари): первые 10 и «ещё N»; данные мотивов могут прийти позже — секция заполняется тогда
  function motPlateSection(book, p, gen){
    function inner(){ var tags = motTagsInner(book.slug, p.id, 10); return tags ? '<h3>'+esc(t("motTitle"))+'</h3><div class="ic-mot-tags ic-mot-kids">'+tags+'</div>' : ""; }
    function wire(el){
      var mb = el.querySelector(".ic-mot-more");
      if(mb) mb.addEventListener("click", function(){ mb.parentNode.classList.add("ic-mot-open"); mb.parentNode.removeChild(mb); });
    }
    var inn = MOT.ready ? inner() : "";
    if(!MOT.ready) motLoad(function(){
      if(gen !== renderGen) return;
      var el = root.querySelector('.ic-mot-sec[data-mt]'); if(!el) return;
      el.innerHTML = inner(); el.hidden = !el.innerHTML; wire(el);
    });
    return {html:'<section class="ic-sec ic-mot-sec" data-mt="1"'+(inn ? "" : " hidden")+'>'+inn+'</section>', wire:wire};
  }
  // Контекст «статья открыта из мотива»: адрес вида #/iconologie/p1-61?from=motif:<книги>:<id мотива>. Стрелка «назад» ведёт на страницу мотива,
  // «Пред./След.» листают гравюры мотива по порядку сетки.
  function motFromRaw(){ var m = /[?&]from=([^&]+)/.exec(location.hash); return m ? m[1] : null; }
  function motFromParse(){
    var r = motFromRaw(); if(!r) return null;
    var a = decodeURIComponent(r).split(":"); if(a[0] !== "motif" || !a[2]) return null;
    return {param:a[1] || "all", mid:a[2]};
  }
  // книга с «карточками гравюр» (Картари): элементы мотива — гравюры plates.json (book.chap.pl), а не статьи
  function motIsPl(bk){ return !!(bk && bk !== "error" && bk.meta && bk.meta.chapters && bk.meta.chapters.plates); }
  function motIsPlObj(it){ return !!(it && it.file && Array.isArray(it.expl)); }
  function motItems(cur, n){
    var items = [];
    n.all.forEach(function(k){
      var i = k.indexOf("|"), slug = k.slice(0,i), id = k.slice(i+1), bk = books[slug];
      if(!bk || bk === "error") return;
      if(motIsPl(bk)){
        var pl = bk.chap && bk.chap.pl, p = pl && pl.byId[id];
        if(p) items.push({book:bk, it:p, plate:true, ord:pl.list.indexOf(p)});
      } else if(bk.byId && bk.byId[id]) items.push({book:bk, it:bk.byId[id], ord:bk.byId[id].ord});
    });
    var bo = MOT.books.map(function(b){ return b.slug; });
    items.sort(function(a,b){ return bo.indexOf(a.book.slug) - bo.indexOf(b.book.slug) || a.ord - b.ord; });
    return items;
  }
  function motTitleAny(it){ return motIsPlObj(it) ? plName(it) : titleOf(it); }
  // нужные книги (данные статей; для Картари — ещё и plates.json) подгружаются тихо, по очереди
  function motNotReady(sl){ var b = books[sl]; return b === undefined || (b !== "error" && motIsPl(b) && b.chap === undefined); }
  function motEnsure(sel, gen, cb){
    var need = sel.filter(motNotReady);
    (function next(){
      if(gen !== renderGen) return;
      var slug = need.shift();
      if(!slug){ cb(); return; }
      openBook(slug, {silent:true}, function(bk){ if(bk && motIsPl(bk)) loadChapters(bk, function(){ next(); }); else next(); });
    })();
  }
  // переход к статье/гравюре мотива: «назад» ведёт в сетку мотива, Пред./След. заменяют запись истории
  function motHrefOf(x, fq){ return (x.plate ? hrefFor(x.book, "plate/"+x.it.id) : hrefFor(x.book, x.it.id))+(fq || ""); }
  function motOpen(x, fq){
    var h = motHrefOf(x, fq);
    chCtx = {hash: h, type: x.plate ? "plates" : "ripa", label:""};
    ripaHl = null;
    namesUi.pos[location.hash] = window.scrollY;
    location.hash = h.replace(/^#/,"");
  }
  function motStep(x, fq){
    var h = motHrefOf(x, fq);
    if(ctxActiveFor(RIPA_CTX) || ctxActiveFor(CARD_CTX_TYPES)) chCtx = {hash: h, type: x.plate ? "plates" : "ripa", label:""};
    ripaHl = null;
    location.replace(h);
  }
  function motCardCtx(book, it, from){
    var cur = motSelect(from.param), n = motBuild(cur.sel).nodes[from.mid]; if(!n) return null;
    var list = motItems(cur, n), idx = -1;
    for(var i = 0; i < list.length; i++){ if(list[i].book === book && list[i].it === it){ idx = i; break; } }
    if(idx < 0) return null;
    return {list:list, idx:idx, total:list.length, name:motName(n), prev:list[idx-1] || null, next:list[idx+1] || null};
  }
  function motCardSection(book, it, gen){
    var inner = MOT.ready ? motCardInner(book, it) : "";
    var html = '<section class="ic-sec ic-mot-sec" data-mt="1"'+(inner ? "" : " hidden")+'>'+inner+'</section>';
    if(!MOT.ready) motLoad(function(){
      if(gen !== renderGen) return;
      var el = root.querySelector('.ic-mot-sec[data-mt]'); if(!el) return;
      el.innerHTML = motCardInner(book, it); el.hidden = !(MOT.byArt[book.slug+"|"+it.id] || []).length;
    });
    return html;
  }
  function motCardInner(book, it){
    var tags = motTagsInner(book.slug, it.id);
    return tags ? '<h3>'+esc(t("motTitle"))+'</h3><div class="ic-mot-tags">'+tags+'</div>' : "";
  }

  // Подсветка слова, с которым пришли из поиска: первое вхождение в тексте статьи.
  function ripaHighlight(gen){
    var h = ripaHl; ripaHl = null;
    if(!h) return false;
    var words = norm(h.q).split(/\s+/).filter(Boolean); if(!words.length) return false;
    var walker = document.createTreeWalker(root.querySelector(".ic-rp"), NodeFilter.SHOW_TEXT, null), node, found = null;
    while((node = walker.nextNode())){
      if(node.parentNode.closest(".ic-original,.ic-head,.ic-top-row,.ic-pager")) continue;
      var nt = norm(node.data);
      if(nt.length !== node.data.length) continue;
      for(var i=0;i<words.length;i++){ var ix = wsFind(nt, words[i]); if(ix>=0){ found = {node:node, ix:ix, len:words[i].length}; break; } }
      if(found) break;
    }
    if(!found) return false;
    var r = document.createRange(); r.setStart(found.node, found.ix); r.setEnd(found.node, found.ix+found.len);
    var m = document.createElement("mark"); m.className = "ic-ch-mark"; r.surroundContents(m);
    var edge = viewEdge();
    var ty = Math.max(0, window.scrollY + m.getBoundingClientRect().top - edge - Math.round((window.innerHeight - edge) * 0.22));
    holdAt(gen, ty); hardScrollTo(ty);
    hlFadeOut(null, [m], gen);
    return true;
  }
  // Переход из поиска: статья сразу открывается у найденного слова. Пока миниатюры гравюр не сообщили пропорции
  // (ленивая картинка иначе догрузится и сдвинет текст), содержимое скрыто; высоты гравюр резервируются
  // атрибутами width/height, затем прокрутка к слову — до первой отрисовки.
  function ripaPlace(book, it, gen){
    var wrap = root.querySelector(".ic-rp"); if(!wrap){ ripaHl = null; return; }
    wrap.style.visibility = "hidden";
    var imgs = Array.prototype.slice.call(wrap.querySelectorAll(".ic-fig img")), left = imgs.length, done = false;
    function go(){
      if(done) return; done = true;
      if(gen !== renderGen) return;
      if(!ripaHighlight(gen)) toTop();
      wrap.style.visibility = "";
    }
    if(!left){ go(); return; }
    setTimeout(go, 700);
    imgs.forEach(function(im, k){
      var src = (it.img||[])[k], th = new Image();
      function fin(){ if(--left === 0) go(); }
      th.onload = function(){ if(th.naturalWidth && !im.getAttribute("width")){ im.setAttribute("width", th.naturalWidth); im.setAttribute("height", th.naturalHeight); } fin(); };
      th.onerror = fin;
      if(!src){ fin(); return; }
      th.src = BASE+"books/"+book.slug+"/thumb/"+src.replace(/\.(jpe?g|webp)$/i,"")+"_t.webp";
    });
  }
  function ripaAnchors(){
    var i = 0;
    root.querySelectorAll(".ic-rp .ic-figs, .ic-rp .ic-sec, .ic-rp .ic-text > p, .ic-rp .ic-attrs > li").forEach(function(el){ el.setAttribute("data-anchor", "a"+(i++)); });
  }

  /* ----- Альчато: данные (text.json — латынь, страницы, разделы; _translation_v2 — перевод RU/EN/FR и вводные тексты) ----- */
  // Тяжёлые картинки — из репозитория nfhours/alciato (book.json heavy): plates/<стр>.webp (+_full), thumb/<стр>_t.webp.
  function alcHeavy(book){ return String(book.meta.heavy || BASE+"books/"+book.slug+"/").replace(/\/?$/, "/"); }
  function alcLoad(book, cb){
    var base = BASE+"books/"+book.slug+"/", tr = base+"_translation_v2/";
    function j(u){ return fetch(u,{cache:"no-cache"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
    Promise.all([j(base+"text.json"), j(tr+"ru.json"), j(tr+"en.json"), j(tr+"fr.json"), j(tr+"intro.json"), j(base+"fit.json").catch(function(){ return {}; })])
      .then(function(res){ alcPrep(book, res[0], {ru:res[1], en:res[2], fr:res[3]}, res[4]); book.alc.fit = res[5] || {}; cb(); })
      .catch(function(err){ if(window.console && console.error) console.error("alciato data failed", err); book.alc = {sections:[], secBy:{}, la:{}, pages:{}, thumbs:{}, fit:{}}; cb(); });
  }
  function alcTrim(s){ return String(s||"").replace(/\s+$/,"").replace(/\.$/,""); }
  function alcPrep(book, d, tr, intro){
    var A = {sections:d.sections||[], secBy:{}, la:d.la||{}, pages:d.pages||{}, thumbs:d.thumbs||{}, introGreek:d.introGreek||{}};
    A.sections.forEach(function(sc, i){ sc.i = i; A.secBy[sc.rubric] = sc; });
    var introSec = A.sections.filter(function(x){ return x.intro; })[0] || {rubric:""};
    var items = [];
    (intro||[]).forEach(function(x){
      var la = A.la[x.id] || {};
      var it = {id:x.id, num:"", page:String(x.page), sec:introSec.rubric, intro:true,
        ru:alcTrim(x.title_ru), en:alcTrim(x.title_en), name_fr:alcTrim(x.title_fr), fr:alcTrim(la.motto || x.title_la), alcTr:{}};
      ["ru","en","fr"].forEach(function(L){ it.alcTr[L] = {motto:x["title_"+L], subheading:null, epigrams:[{label:null, reading:x["text_"+L]||[]}],
        greek:(x.greek||[]).map(function(g){ return {original:g.original, translation:L==="ru" ? g.translation : ((A.introGreek[x.id]||{})[L]||"")}; })}; });
      items.push(it);
    });
    book.items.forEach(function(it){
      var sc = A.secBy[it.section] || {}, la = A.la[it.id] || {};
      it.sec = it.section; it.alcTr = {ru:tr.ru[it.num], en:tr.en[it.num], fr:tr.fr[it.num]};
      ["ru","en","fr"].forEach(function(L){ var m = it.alcTr[L] && it.alcTr[L].motto; var v = (!it.no_motto && m) ? alcTrim(m) : (sc[L] || sc.ru || ""); if(L==="fr") it.name_fr = v; else it[L] = v; });
      it.fr = it.no_motto ? "" : alcTrim(la.motto || it.fr);
      it.img = []; it.scans = [];
      items.push(it);
    });
    var byId = {};
    items.forEach(function(it, i){
      it.ord = i; byId[it.id] = it; it.pn = parseInt(it.page,10)||0; it.findKey = undefined;
      var la = A.la[it.id] || {}, parts = [it.fr, (la.lines||[]).join(" ")];
      it.titleKey = norm([it.fr, it.ru, it.en, it.name_fr].join(" "));
      ["ru","en","fr"].forEach(function(L){ var tt = it.alcTr[L]; if(!tt) return;
        parts.push(tt.motto||"", tt.subheading||"");
        (tt.epigrams||[]).forEach(function(e){ parts.push(e.label||"", (e.reading||[]).join(" ")); });
        (tt.greek||[]).forEach(function(g){ parts.push(g.original||"", g.translation||""); }); });
      it.key = norm([it.ru, it.en, it.name_fr].concat(parts).join(" "));
    });
    // пометки [?] в тексте перевода не показываем (в ключах поиска и в транскрипции они остались)
    items.forEach(function(it){
      ["ru","en"].forEach(function(L){ if(it[L]) it[L] = alcQ(it[L]); }); if(it.name_fr) it.name_fr = alcQ(it.name_fr);
      ["ru","en","fr"].forEach(function(L){ var tt = it.alcTr[L]; if(!tt) return;
        if(tt.motto) tt.motto = alcQ(tt.motto); if(tt.subheading) tt.subheading = alcQ(tt.subheading);
        (tt.epigrams||[]).forEach(function(e){ if(e.label) e.label = alcQ(e.label); e.reading = (e.reading||[]).map(alcQ); });
        (tt.greek||[]).forEach(function(g){ if(g.translation) g.translation = alcQ(g.translation); }); });
    });
    book.items = items; book.byId = byId; book.alc = A;
  }
  function alcQ(s){ return String(s).replace(/ ?\[\?\]/g,"").replace(/^\s+/,""); }
  function alcTrOf(it){ return it.alcTr && (it.alcTr[state.lang] || it.alcTr.ru) || null; }
  function alcSecName(book, it){ var sc = book.alc.secBy[it.sec]; return sc ? (sc[state.lang] || sc.ru) : ""; }
  // фрагменты для сниппета лупы: перевод (язык интерфейса), греческие места, латынь
  function alcSnipParts(it){
    var tt = alcTrOf(it), out = [];
    if(tt){ (tt.epigrams||[]).forEach(function(e){ (e.reading||[]).forEach(function(l){ out.push(l); }); }); (tt.greek||[]).forEach(function(g){ out.push(g.translation||""); }); }
    var la = books.alciato && books.alciato.alc && books.alciato.alc.la[it.id];
    if(la) la.lines.forEach(function(l){ out.push(l.replace(/^# /,"")); });
    return out;
  }
  function alcThumbSrc(book, it){ var pg = book.alc.pages[it.id]; return pg && book.alc.thumbs[it.id] ? alcHeavy(book)+"thumb/"+pg[0][0]+"_t.webp" : ""; }
  function alcPageLbl(it){ return String(it.page).replace("-", "–"); }
  // Страница эмблемы: страницы книги целиком (pages, с рамкой и напечатанным текстом; вторая страница двухстраничной — сразу под первой), девиз в переводе
  // крупно и латинский под ним, «Перевод» (эпиграмма построчно), «Оригинал» (латынь построчно курсивом), греческие места.
  // Пилот «перевод в рамке страницы»: у этих эмблем перевод набирается HTML-текстом в поле для текста (области «вычитания» crops.json,
  // fit.json), поверх plates/; «Оригинал» — pages/ (фото страницы с латынью). Остальные — страницы целиком, как раньше.
    var ALC_FIT_FLOOR = 11, ALC_FIT_CAP = 0.05, ALC_PAD_X = 0.04, ALC_PAD_Y = 0.03, ALC_LH = [1.3, 1.22, 1.15, 1.1];
  var alcMode = "tr";
  try{ if(localStorage.getItem("ic-alc-mode") === "orig") alcMode = "orig"; }catch(e){}
  function alcIsFit(book, it){
    var A = book.alc, pgs = A.pages[it.id] || [];
    return pgs.length > 0 && pgs.every(function(pg){ return A.fit && A.fit[pg[0]]; });
  }
  // строки перевода по страницам эмблемы: строки стиха делятся так, как шли строки латыни (fit[страница].n)
  function alcFieldItems(book, it, tt){
    var A = book.alc, pgs = A.pages[it.id] || [], items = [], out = pgs.map(function(){ return []; });
    if(tt.subheading) items.push({lab:tt.subheading});
    (tt.epigrams||[]).forEach(function(e){ if(e.label) items.push({lab:e.label}); (e.reading||[]).forEach(function(l, i){ items.push({l:l, ev:i % 2 === 1}); }); });
    var cur = 0, used = 0, last = pgs.length - 1;
    items.forEach(function(x){
      if(cur < last && used >= A.fit[pgs[cur][0]].n){ cur++; used = 0; }
      out[cur].push(x); if(x.l !== undefined) used++;
    });
    return out;
  }
  function alcFitHtml(book, it, tt){
    var A = book.alc, H = alcHeavy(book), pgs = A.pages[it.id] || [], per = alcFieldItems(book, it, tt || {epigrams:[]});
    var alt = esc(t("engravingAlt",{title:titleOf(it)}));
    return '<div class="ic-figs ic-alc-figs ic-alc-fitfigs" data-mode="'+alcMode+'">'+pgs.map(function(pg, k){
        var f = A.fit[pg[0]].h;
        return '<figure class="ic-fig ic-alc-pg ic-alc-fit" data-k="'+k+'" style="aspect-ratio:'+pg[1]+'/'+pg[2]+'">'+
          '<img class="ic-alc-pl" src="'+esc(H+"plates/"+pg[0]+".webp")+'" width="'+pg[1]+'" height="'+pg[2]+'" alt="'+alt+'">'+
          '<img class="ic-alc-or" data-src="'+esc(H+"pages/"+pg[0]+".webp")+'" width="'+pg[1]+'" height="'+pg[2]+'" alt="'+alt+'"'+(alcMode==="orig" ? ' src="'+esc(H+"pages/"+pg[0]+".webp")+'"' : "")+'>'+
          '<div class="ic-alc-fld" data-pg="'+pg[0]+'" style="left:'+f[0]+'%;top:'+f[1]+'%;width:'+f[2]+'%;height:'+f[3]+'%"><div class="ic-alc-in">'+
            per[k].map(function(x){ return x.lab !== undefined ? '<span class="ic-alc-fl">'+esc(x.lab)+'</span>' : '<span class="ic-alc-fv'+(x.ev ? " ic-alc-ev" : "")+'">'+esc(x.l)+'</span>'; }).join("")+
          '</div></div></figure>';
      }).join("")+'</div>';
  }
  // Подбор кегля под поле (до показа): наибольший кегль, при котором текст по высоте заполняет поле (с внутренними полями 4 % / 3 %), верхний предел — доля ширины страницы, нижний — 11 px;
  // не влезло на нижнем пределе — меньше межстрочный; всё равно не влезло — data-fit="over" (текст не обрезается).
  // Порядок уступок, если на нижнем пределе (11 px) не влезло: межстрочный 1.3 → 1.1, затем отступ чётных строк 1.2em → 0.6em → 0,
  // затем внутренние поля (вертикальные, потом горизонтальные) вдвое/до нуля. Нигде не влезло — кегль ниже 11 px (data-fit="sub"), чтобы текст не вылезал из поля.
  var ALC_STEPS = [[1.3,1.2,1,1],[1.22,1.2,1,1],[1.15,1.2,1,1],[1.1,1.2,1,1],[1.1,0.6,1,1],[1.1,0,1,1],[1.1,0,0.5,1],[1.1,0,0.5,0.5],[1.1,0,0,0.5],[1.1,0,0,0]];
  function alcFitField(fl){
    var fig = fl.parentNode, inn = fl.firstChild, W = fig.clientWidth; if(!W || !inn) return;
    var fw = fl.offsetWidth, fh = fl.offsetHeight, cap = Math.max(ALC_FIT_FLOOR, W * ALC_FIT_CAP), st, w, h;
    function setStep(q){
      var px = Math.round(fw * ALC_PAD_X * q[3] * 100) / 100, py = Math.round(fh * ALC_PAD_Y * q[2] * 100) / 100;
      fl.style.padding = py+"px "+px+"px"; inn.style.setProperty("--ind", q[1]+"em"); inn.style.lineHeight = q[0];
      w = fl.clientWidth - 2*px; h = fl.clientHeight - 2*py;
    }
    function fits(f){ inn.style.fontSize = f+"px"; return inn.offsetHeight <= h + 0.5 && inn.scrollWidth <= w + 0.5; }
    var si = 0, fs = ALC_FIT_FLOOR;
    for(; si < ALC_STEPS.length; si++){ setStep(ALC_STEPS[si]); if(fits(ALC_FIT_FLOOR)) break; }
    var over = si === ALC_STEPS.length; if(over) si = ALC_STEPS.length - 1;
    setStep(ALC_STEPS[si]);
    if(over){ // крайняя мера: кегль ниже предела, чтобы текст не вылезал из поля (data-fit="sub")
      var l2 = 7, h2 = ALC_FIT_FLOOR; fs = l2;
      for(var j = 0; j < 8; j++){ var m2 = (l2 + h2) / 2; if(fits(m2)) l2 = m2; else h2 = m2; }
      fs = l2;
    } else {
      if(fits(cap)) fs = cap;
      else { var lo = ALC_FIT_FLOOR, hi = cap; for(var i = 0; i < 8; i++){ var mid = (lo + hi) / 2; if(fits(mid)) lo = mid; else hi = mid; } fs = lo; }
    }
    fs = Math.floor(fs * 100) / 100; fits(fs);
    st = ALC_STEPS[si];
    fl.setAttribute("data-fit", over ? "sub" : si ? "relaxed" : "ok"); fl.setAttribute("data-fs", fs);
    fl.setAttribute("data-lh", st[0]); fl.setAttribute("data-relax", si ? "lh"+st[0]+" ind"+st[1]+" py"+st[2]+" px"+st[3] : "");
    fl.style.visibility = "";
  }
  function alcFitAll(){ var r = root.querySelectorAll(".ic-alc-fld"); for(var i = 0; i < r.length; i++) alcFitField(r[i]); }
  var alcFitBound = false;
  function alcBindFit(book, it){
    alcFitAll();
    var fg = root.querySelector(".ic-alc-fitfigs"); if(!fg) return;
    function setMode(m){
      alcMode = m; try{ localStorage.setItem("ic-alc-mode", m); }catch(e){}
      fg.setAttribute("data-mode", m);
      root.querySelectorAll('[data-rb="alcorig"]').forEach(function(b){ b.setAttribute("aria-pressed", m === "orig"); });
      if(m === "orig") fg.querySelectorAll(".ic-alc-or").forEach(function(im){ if(!im.getAttribute("src")) im.setAttribute("src", im.getAttribute("data-src")); });
      else alcFitAll();
    }
    root.querySelectorAll('[data-rb="alcorig"]').forEach(function(b){ b.addEventListener("click", function(){ setMode(alcMode === "orig" ? "tr" : "orig"); }); });
    if(alcMode === "orig") setMode("orig");
    if(!alcFitBound){
      alcFitBound = true; var tm = 0;
      window.addEventListener("resize", function(){ cancelAnimationFrame(tm); tm = requestAnimationFrame(function(){ if(root.querySelector(".ic-alc-fld")) alcFitAll(); }); });
    }
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if(root.querySelector(".ic-alc-fld")) alcFitAll(); });
  }
  function alcCardHtml(book, it){
    var A = book.alc, H = alcHeavy(book), tt = alcTrOf(it), la = A.la[it.id] || {lines:[]};
    var fit = alcIsFit(book, it);
    var figs = fit ? "" : (A.pages[it.id]||[]).map(function(pg, k){
      return '<figure class="ic-fig ic-alc-pg" data-k="'+k+'"><img src="'+esc(H+"pages/"+pg[0]+".webp")+'" width="'+pg[1]+'" height="'+pg[2]+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'"></figure>';
    }).join("");
    function lines(arr, lang){
      var h = "", buf = [];
      function flush(){ if(buf.length){ h += '<p class="ic-alc-v">'+buf.map(function(l){ return '<span>'+esc(l)+'</span>'; }).join("")+'</p>'; buf = []; } }
      arr.forEach(function(l){ if(/^# /.test(l)){ flush(); h += '<p class="ic-alc-lbl">'+esc(l.slice(2))+'</p>'; } else buf.push(l); });
      flush();
      return h;
    }
    var tr = "";
    if(tt){
      if(tt.subheading) tr += '<p class="ic-alc-lbl">'+esc(tt.subheading)+'</p>';
      (tt.epigrams||[]).forEach(function(e){ tr += (e.label ? '<p class="ic-alc-lbl">'+esc(e.label)+'</p>' : "")+lines(e.reading||[]); });
    }
    var laMotto = it.intro ? it.fr : (it.no_motto ? "" : la.motto);
    var head = '<header class="ic-head ic-alc-head"><h1 class="ic-h-fr ic-alc-motto">'+esc(titleOf(it))+'</h1>'+(laMotto ? '<p class="ic-alc-la" lang="la">'+esc(laMotto)+'</p>' : "")+'</header>';
    // порядок: девиз (перевод крупно, латынь под ним) → страница (с переводом в рамке) → «Пред./След.»; нет поля — перевод под страницей
    return head+(fit ? alcFitHtml(book, it, tt) : '<div class="ic-figs ic-alc-figs">'+figs+'</div>')+
      (tr && !fit ? '<section class="ic-sec ic-alc-trsec"><div class="ic-text ic-alc-verse">'+tr+'</div></section>' : "");
  }

  function renderCard(book, it){
    var rp = isRpLayout(book), aud = isAud(book), alc = isAlc(book), keepRp = (langKeep && langKeep.hash === location.hash) ? langKeep : null;
    var s=alc ? book.items : seq(book), i=s.indexOf(it);
    if(i<0){ s=book.items; i=it.ord; }
    var prev=s[i-1], next=s[i+1];
    var mfrom = rp ? motFromParse() : null, mctx = null, prevB = book, nextB = book;
    if(mfrom){
      if(!MOT.ready){ var gen0 = renderGen; motLoad(function(){ if(gen0 === renderGen) route(); }); }
      else if(motSelect(mfrom.param).sel.some(motNotReady)){ var gen1 = renderGen; motEnsure(motSelect(mfrom.param).sel, gen1, function(){ if(gen1 === renderGen) route(); }); }
      else mctx = motCardCtx(book, it, mfrom);
    }
    if(mctx){ prev = mctx.prev ? mctx.prev.it : null; prevB = mctx.prev ? mctx.prev.book : book; next = mctx.next ? mctx.next.it : null; nextB = mctx.next ? mctx.next.book : book; }
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
    var eng = it.textOnly || alc ? null : engravingFor(book, it);
    var imgs = eng
      ? '<figure class="ic-fig ic-fig-eng" data-src="'+esc(eng.display)+'"><img class="ic-fade-img ic-eng-display" loading="lazy" src="'+esc(eng.display)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'"></figure>'
      : (it.textOnly ? [] : (it.img||[])).map(function(src,k){
          // Iconologie: рядом с каждой картинкой <имя>.webp лежит <имя>_display.webp (бумага прозрачна,
          // тушь почти чёрная, мягкий край запечён в файл, как у Картари); показываем его,
          // по клику открывается полная картинка (<имя>.webp).
          if(book.slug==="iconologie" && /\.(jpe?g|webp)$/i.test(src)){
            var disp = imgBase+src.replace(/\.(jpe?g|webp)$/i,"_display.webp");
            return '<figure class="ic-fig ic-fig-eng" data-src="'+esc(imgBase+src)+'"><img class="ic-eng-display" loading="lazy" src="'+esc(disp)+'" alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'">'+
              (it.img.length>1?'<figcaption>'+t("figOf",{k:k+1,n:it.img.length})+'</figcaption>':"")+'</figure>';
          }
          var full = aud ? imgBase+src.replace(/\.(jpe?g|webp)$/i,"_full.webp") : imgBase+src;
          // Одран: без анимации появления (картинка сразу на месте); размеры из данных резервируют место
          var wh = aud && it.img_wh ? ' width="'+it.img_wh[0]+'" height="'+it.img_wh[1]+'"' : "";
          return '<figure class="ic-fig" data-src="'+esc(full)+'"><img class="'+(aud ? "" : "ic-fade-img")+'" loading="lazy" src="'+esc(imgBase+src)+'"'+wh+' alt="'+esc(t("engravingAlt",{title:titleOf(it)}))+'">'+
            (it.img.length>1?'<figcaption>'+t("figOf",{k:k+1,n:it.img.length})+'</figcaption>':"")+'</figure>';
        }).join("");
    var captionLine = it.caption && !aud ? '<p class="ic-caption"><b>'+esc(t("captionLbl"))+'</b> '+esc(it.caption)+'</p>' : "";
    // Одран: общее пояснение к цифрам — абзацем на странице «Таблицы»; здесь — только своё пояснение «Мира греков» (aud13: футы/дюймы/линии)
    if(aud && it.id==="aud13") captionLine = '<p class="ic-aud-units">'+esc(t("audUnitsFt"))+'</p>';
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

    var rpTitle = esc(titleOf(it)), rpHasOrig = !!(showOrig && (hasScans||hasFr));
    var rpBar = rp ?
      '<div class="ic-rbar-row">'+
        '<button type="button" class="ic-rbar-lbl ic-rbar-lbl-b" data-rb="tolist" aria-label="'+esc(t("rpTabArticles")+": "+titleOf(it))+'"><span class="ic-rbar-pos-ch">'+rpTitle+'</span><span class="ic-rbar-pos-pg">'+(aud ? esc(t("audTblAbbr"))+' '+esc(it.num) : esc(t("pageAbbr"))+' '+esc(alc ? alcPageLbl(it) : it.page))+'</span></button>'+
        (alc ? (alcIsFit(book, it) ? '<button type="button" class="ic-rbar-scan" data-rb="alcorig" aria-pressed="'+(alcMode==="orig")+'">'+esc(t("originalSec"))+'</button>' : "") : aud ? "" : '<button type="button" class="ic-rbar-scan" data-rb="scan" aria-pressed="false"'+(rpHasOrig?"":" disabled")+'>'+esc(t("svScan"))+'</button>')+
        '<button type="button" class="ic-rbar-nv" data-nav="prev" data-go="'+(prev?prev.id:"")+'"'+(prev?' title="'+esc(titleOf(prev))+'"':" disabled")+'>'+t("navPrev")+'</button>'+
        '<button type="button" class="ic-rbar-nv" data-nav="next" data-go="'+(next?next.id:"")+'"'+(next?' title="'+esc(titleOf(next))+'"':" disabled")+'>'+t("navNext")+'</button>'+
      '</div>'+langSwitch() : "";
    var rpPager = rp ?
      '<div class="ic-pager ic-rp-pager">'+
        (prev ? '<button type="button" class="ic-rp-nb ic-rp-nb-prev" data-go="'+prev.id+'">'+RP_CHEV_L+'<span class="ic-rp-nb-t"><small>'+t("rpPrevFull")+'</small><span>'+esc(motTitleAny(prev))+'</span></span></button>' : '<span></span>')+
        (next ? '<button type="button" class="ic-rp-nb ic-rp-nb-next" data-go="'+next.id+'"><span class="ic-rp-nb-t"><small>'+t("rpNextFull")+'</small><span>'+esc(motTitleAny(next))+'</span></span>'+RP_CHEV_R+'</button>' : '<span></span>')+
      '</div>' : "";
    var rpSheets = [];
    root.innerHTML =
      (rp ? ripaShell(book, aud ? "plates" : "list", rpBar, RIPA_CTX, mfrom ? motHref(mfrom.param, mfrom.mid) : null)+'<div class="ic-ch-outer">' : "")+
      '<div class="ic-wrap'+(rp?" ic-rp":"")+(aud?" ic-rp-aud":"")+(alc?" ic-rp-alc":"")+'">'+
        (rp ? '<div class="ic-top-row">'+langSwitch()+'</div>' : '<div class="ic-nav">'+
          '<button type="button" class="ic-back">'+t("back")+'</button>'+
          '<div class="ic-nav-pager">'+
            '<button type="button" class="ic-nav-pager-b" data-go="'+(prev?prev.id:"")+'"'+(prev?' title="'+esc(titleOf(prev))+'"':" disabled")+'>'+t("navPrev")+'</button>'+
            '<button type="button" class="ic-nav-pager-b" data-go="'+(next?next.id:"")+'"'+(next?' title="'+esc(titleOf(next))+'"':" disabled")+'>'+t("navNext")+'</button>'+
          '</div>'+
          '<span class="ic-nav-pos">'+pos+'</span>'+
          langSwitch()+
        '</div>')+
        (alc ? alcCardHtml(book, it) : headHtml+
        '<header class="ic-head">'+
          (aud ? (norm(groupOf(it)) !== norm(titleOf(it)) ? '<p class="ic-kicker">'+esc(groupOf(it))+'</p>' : "")+'<h1 class="ic-h-fr">'+esc(titleOf(it))+'</h1>' :
          '<p class="ic-kicker">'+(it.num?it.num+". ":"")+esc(it.group_fr?groupOf(it):(book.meta.parts&&book.meta.parts.length>1?partLabel(book,it.part):""))+'</p>'+
          '<h1 class="ic-h-fr">'+esc(it.fr)+'</h1>'+
          (titleOf(it)!==it.fr?'<p class="ic-h-ru">'+esc(titleOf(it))+'</p>':""))+
        '</header>'+
        (imgs?'<div class="ic-figs">'+imgs+'</div>'+captionLine+plateLink:"")+
        (fieldsHtml?'<section class="ic-sec"><h3>'+t("infoSec")+'</h3><ul class="ic-attrs">'+fieldsHtml+'</ul></section>':"")+
        (attrs?'<section class="ic-sec"><h3>'+t("whatSec")+'</h3><ul class="ic-attrs">'+attrs+'</ul></section>':"")+
        (isRipa(book) ? motCardSection(book, it, renderGen) : "")+
        (transl?'<section class="ic-sec"><h3>'+t("translSec")+'</h3><div class="ic-text">'+transl+'</div>'+(chEx?chEx.more:"")+'</section>':"")+
        ((hasScans||hasFr)?renderOriginal(it,book):"")+
        (!imgs && !transl ? '<div class="ic-missing"><b>'+t("missing")+'</b><br>'+t("missingAt",{part:it.part,page:esc(it.page)})+'</div>':"")+
        (transl?tailHtml:""))+
        (rp ? (mctx ? '<p class="ic-rp-mcap">'+esc(mctx.name+", "+(mctx.idx+1)+" "+t("motOf")+" "+mctx.total)+'</p>' : "")+rpPager : '<div class="ic-pager">'+
          '<button type="button" data-go="'+(prev?prev.id:"")+'"'+(prev?"":" disabled")+'><small>'+t("pagerBack")+'</small><span>'+(prev?esc(prev.fr):"")+'</span>'+(prev?'<em>'+esc(titleOf(prev))+'</em>':"")+'</button>'+
          '<button type="button" data-go="'+(next?next.id:"")+'"'+(next?"":" disabled")+'><small>'+t("pagerNext")+'</small><span>'+(next?esc(next.fr):"")+'</span>'+(next?'<em>'+esc(titleOf(next))+'</em>':"")+'</button>'+
        '</div>')+
      '</div>'+(rp ? '</div>' : "");

    if(alc) flowOn();   // шапка уезжает нативно — только страница эмблемы Альчато (HANDOFF, раздел 10)
    if(rp) ripaBind(book, renderGen, rpSheets);
    else bindLangSwitch(root);
    var backEl = root.querySelector(".ic-back");
    if(backEl) backEl.addEventListener("click",function(){
      goIndex(book);
    });
    root.querySelectorAll("[data-go]").forEach(function(b){ b.addEventListener("click",function(){
      var id=b.getAttribute("data-go"); if(!id) return;
      var tb = book; if(mctx){ if(prev && id === prev.id) tb = prevB; else if(next && id === next.id) tb = nextB; }
      if(rp) ripaStep(tb, id); else go(book, id);
    });});
    if(alc && alcIsFit(book, it)) alcBindFit(book, it);
    root.querySelectorAll(".ic-fig").forEach(function(f){ f.addEventListener("click",function(e){
      if(alc && e.target.closest && e.target.closest(".ic-alc-fld")) return; // текст перевода выделяется, не открывает просмотр
      if(alc){ openImgFull((book.alc.pages[it.id]||[]).map(function(pg){ return alcHeavy(book)+"pages/"+pg[0]+"_full.webp"; }), titleOf(it), {at:+f.getAttribute("data-k"), cls:"ic-svx-alc"}); return; }
      if(rp) openImgFull(f.getAttribute("data-src"), titleOf(it)); else lightbox(f.getAttribute("data-src")); }); });
    if(showOrig && (hasScans||hasFr)) bindOriginal(it, pagesBase);
    if(rp){
      var gen = renderGen;
      // «Скан» в строке раздела: раскрывает/сворачивает панель оригинала (скан/текст) и показывает её
      var scanB = root.querySelector('[data-rb="scan"]'), det = root.querySelector(".ic-original");
      if(scanB && det){
        det.addEventListener("toggle", function(){ scanB.setAttribute("aria-pressed", det.open); });
        scanB.addEventListener("click", function(){
          det.open = !det.open;
          if(det.open) hardScrollTo(Math.max(0, window.scrollY + det.getBoundingClientRect().top - viewEdge() - 12));
        });
      }
      function setVis(){ var st0 = document.getElementById("ic-stack"); if(!st0) return;
        if(alc){ // страница эмблемы: шапка и меню — часть страницы, .ic-stack без своего блока (display:contents)
          var hh = 0, bt = document.getElementById("ic-booktabs"); Array.prototype.forEach.call(st0.children, function(c){ hh += c.offsetHeight; });
          root.style.setProperty("--ic-stack-full", hh+"px"); return; }
        root.style.setProperty("--ic-stack-full", Math.round(st0.getBoundingClientRect().height)+"px"); }
      var visW = window.innerWidth;   // высота панелей от прокрутки не меняется: пересчёт только при смене ширины (поворот)
      setVis(); window.addEventListener("resize", function rs(){ if(gen !== renderGen){ window.removeEventListener("resize", rs); return; } if(window.innerWidth === visW) return; visW = window.innerWidth; setVis(); });
      ripaAnchors();
      var toListB = root.querySelector('[data-rb="tolist"]'); if(toListB) toListB.addEventListener("click", function(){ ripaToList(book, it.id); });
      var tabList = root.querySelector('.ic-bt-tabs a[href="'+hrefFor(book, aud ? "plates" : "list")+'"]');
      if(tabList) tabList.addEventListener("click", function(e){ if(e.metaKey||e.ctrlKey||e.shiftKey||e.button) return; e.preventDefault(); ripaToList(book, it.id); });
      if(keepRp && keepRp.anchor) restoreBlockPos(keepRp, gen);
      else if(ripaHl && ripaHl.id===it.id) ripaPlace(book, it, gen);
      else { toTop(); ripaHl = null; }
      // страница эмблемы Альчато: шапка и меню книги — часть страницы (нативная прокрутка), строка раздела sticky; скрипта прятания нет
      if(!alc) installBookHide({isActive:function(){ return gen===renderGen; }, suppress:function(){ return rpSheets.some(function(x){ return x.isOpen() || x.isAnimating(); }); }});
      nudgeRepaint();
      return;
    }
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
        (f.w&&f.h ? ' width="'+f.w+'" height="'+f.h+'" style="aspect-ratio:'+f.w+'/'+f.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:plNameById(book, f.pid, f.pt)}))+'"></div>'+(f.cap ? '<figcaption>'+inl(f.cap, null)+'</figcaption>' : "")+'</figure>';
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
          (b.w&&b.h ? ' width="'+b.w+'" height="'+b.h+'" style="aspect-ratio:'+b.w+'/'+b.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:plNameById(book, b.pid, b.pt) || b.text.slice(0,60)}))+'"></div>' : "")+
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
  function renderChapter(book, slug, blockN, pageSpec){
    var gen = renderGen, cameBack = navBack;
    var keep = (langKeep && langKeep.hash === location.hash) ? langKeep : null;
    if(keep){ blockN = null; pageSpec = null; }
    // Автооткрытие панели поиска при возврате «К поиску» (searchReopen, см.
    // его определение выше): если читатель открыл поиск на ЭТОЙ главе и
    // кликнул по результату, ведущему на другую главу, history.back() вернёт
    // сюда — тем же hash, который не менялся при открытии/закрытии оверлея —
    // но без автоматически открытой панели. Читаем/обнуляем здесь, ДО того
    // как заново построится разметка панели ниже, чтобы один и тот же
    // возврат не открывал её повторно при будущих ре-рендерах того же hash.
    var reopenSearchQuery = (searchReopen && searchReopen.hash === location.hash) ? searchReopen.query : null;
    var reopenSearchTop = (reopenSearchQuery != null && searchReopen.top) || 0;
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
        pgEl.textContent = pi >= 0 ? pgLabel(pmRows[pi][1]) : "";
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
      if(sheetApi && reopenSearchQuery != null){
        sheetApi.open(reopenSearchQuery);
        // список результатов в шторке — на то же место прокрутки
        var srTop = reopenSearchTop, srBox = root.querySelector("#ic-rb-sheet .ic-sr"), tries = 0;
        if(srTop > 0 && srBox) (function fit(){
          if(gen !== renderGen) return;
          if(srBox.scrollHeight - srBox.clientHeight >= srTop - 1){ srBox.scrollTop = srTop; return; }
          if(++tries < 40) setTimeout(fit, 50);
        })();
      }
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
          var listEl = tocSheetEl.querySelector(".ic-rb-toc-body");
          var cur = tocSheetEl.querySelector('[aria-current="page"]');
          if(!listEl || !cur) return;
          // Текущая глава — примерно в верхней трети блока списка (он сам
          // начинается под заголовком), целиком видна; один раз, до анимации.
          var d = cur.getBoundingClientRect().top - listEl.getBoundingClientRect().top - listEl.clientHeight/3;
          listEl.scrollTop = Math.max(0, listEl.scrollTop + d);
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
      } else if(keep) restoreBlockPos(keep, gen);
      else if(cameBack) restoreOrTop(gen);
      else toTop(true);
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
  // ---- совпадение по полям, которых может не быть в строке списка ----
  // fields: [{t:текст, vis:есть ли в строке, lang}] в порядке показа: язык интерфейса, оригинал, варианты, остальные языки.
  // Слово ищется сначала в видимых полях (подсветка в строке), иначе — в первом скрытом (одна подпись под строкой).
  function hfSpan(text, fold, fs, fl){
    var n = text.length, lens = [0], i, a = -1, b = -1;
    for(i = 1; i <= n; i++) lens[i] = fold(text.slice(0, i)).length;
    for(i = 0; i < n; i++){
      if(a < 0 && lens[i+1] > fs) a = i;
      if(a >= 0 && lens[i+1] >= fs+fl){ b = i+1; break; }
    }
    if(a < 0) return null;
    return [a, (b < 0 ? n : b)-a];
  }
  function hfMerge(list){
    list.sort(function(x, y){ return x[0]-y[0]; });
    var flat = [];
    list.forEach(function(p){
      var l = flat.length;
      if(l && p[0] < flat[l-2]+flat[l-1]) flat[l-1] = Math.max(flat[l-1], p[0]+p[1]-flat[l-2]);
      else flat.push(p[0], p[1]);
    });
    return flat;
  }
  function hfMatch(fields, nw, fold, matcher){
    var fs = fields.map(function(f){ return f.t ? fold(f.t) : ""; }), asg = [], cap = -1, out = fields.map(function(){ return []; }), w, i;
    for(w = 0; w < nw; w++){
      for(i = 0; i < fields.length; i++){
        var m = fs[i] && matcher(fs[i], w);
        if(m){ asg.push([i, m]); break; }
      }
    }
    asg.forEach(function(a){ if(!fields[a[0]].vis && (cap < 0 || a[0] < cap)) cap = a[0]; });
    asg.forEach(function(a){
      if(fields[a[0]].vis || a[0] === cap){ var sp = hfSpan(fields[a[0]].t, fold, a[1][0], a[1][1]); if(sp) out[a[0]].push(sp); }
    });
    return {sp: out.map(hfMerge), cap: cap};
  }
  function hfMark(text, sp){
    var out = "", cur = 0;
    for(var k = 0; k < sp.length; k += 2){ out += esc(text.slice(cur, sp[k]))+'<mark class="ic-hf-mark">'+esc(text.slice(sp[k], sp[k]+sp[k+1]))+"</mark>"; cur = sp[k]+sp[k+1]; }
    return out+esc(text.slice(cur));
  }
  function hfCaption(f, sp){ return '<span class="ic-hf"'+(f.lang ? ' lang="'+f.lang+'"' : "")+'>'+hfMark(f.t, sp)+'</span>'; }
  // имена Картари: строка показывает имя на языке интерфейса и итальянский оригинал
  function nmFields(e, name){
    var f = [{t:name, vis:true, lang:state.lang}, {t:(e.it||[]).join(" · "), vis:true, lang:"it"}], seen = {};
    seen[tvFold(name)] = 1; seen[tvFold(f[1].t)] = 1;
    (e.v||[]).forEach(function(v){ var k = tvFold(v); if(v && !seen[k]){ seen[k] = 1; f.push({t:v, vis:false, lang:""}); } });
    ["ru","en","fr"].forEach(function(l){ var v = e[l], k = tvFold(v); if(v && !seen[k]){ seen[k] = 1; f.push({t:v, vis:false, lang:l}); } });
    return f;
  }
  function nmLineHtml(e, name, hm){
    var f = nmFields(e, name), r = hm ? hfMatch(f, hm.n, tvFold, hm.fn) : null;
    return '<span class="ic-tv-ru">'+(r ? hfMark(f[0].t, r.sp[0]) : esc(name))+'</span> <span class="ic-tv-it" lang="it">'+(r ? hfMark(f[1].t, r.sp[1]) : esc(f[1].t))+'</span>'+
      (r && r.cap >= 0 ? hfCaption(f[r.cap], r.sp[r.cap]) : "");
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
      var tvN = 0;
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
              findCellHtml(t("fbIdx"), tavolaUi.q)+
              '<button type="button" class="ic-rbar-sort'+(tavolaUi.sort==="it" ? " ic-rbar-on" : "")+'" data-rb="sort"><span class="ic-rbar-sort-label">'+esc(tvSortLabel())+'</span></button>'+
            '</div>'+
            langSwitch()+
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
      var fb = wireFindBar({cell:root.querySelector(".ic-rbar-findcell"), gen:gen, onFocus:function(){ rbSheets.forEach(function(sh){ if(sh.isOpen()) sh.close(); }); }}), sheetInput = fb.input;
      var sortBtn = root.querySelector('[data-rb="sort"]'), sortLabelEl = sortBtn.querySelector(".ic-rbar-sort-label");
      var list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          lnav = root.querySelector(".ic-tv-letters-lt"),
          rail = root.querySelector(".ic-az-rail"), peek = root.querySelector(".ic-az-peek");
      sheetInput.value = tavolaUi.q; sheetInput.dispatchEvent(new Event("input"));
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
      function updateSearchLabel(){ fb.sync(); }
      function fill(){
        var words = tvFold(sheetInput.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        ordered().forEach(function(x){
          var e = x.e;
          if(words.length && !words.every(function(w){ return wsFind(e.h, w) >= 0; })) return;
          if(x.l !== cur){ if(cur) html += '</section>'; cur = x.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="tv-L'+cur+'"><h2>'+cur+'</h2>'; }
          n++;
          html += entryHtml(e, false) + (e.subs||[]).map(function(x){ return entryHtml(x, true); }).join("");
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        clampSheetScroll();
        var countText = words.length ? t("tvFound",{n:n}) : t("tvAll",{n:d.entries.length});
        cnt.textContent = countText; tvN = n; updateSearchLabel();
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
      sheetInput.addEventListener("input",function(){ tavolaUi.q = sheetInput.value; fill(); toListTop(); });
      function toListTop(){ window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH()))); }
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
      rbarRow.addEventListener("click", function(e){
        var b = e.target.closest("[data-rb]"); if(!b) return;
        var act = b.getAttribute("data-rb");
        fb.set(false);
        if(act==="sort"){
          tavolaUi.sort = tavolaUi.sort==="ru" ? "it" : "ru";
          sortLabelEl.textContent = tvSortLabel(); sortBtn.classList.toggle("ic-rbar-on", tavolaUi.sort==="it");
          fill(); window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH())));
          return;
        }
      });
      list.addEventListener("click",function(e){
        fb.set(false);
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
      var nmN = 0;
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
              findCellHtml(t("fbName"), namesUi.q)+
              '<button type="button" class="ic-rbar-sort'+(namesUi.ty!=="all" ? " ic-rbar-on" : "")+'" data-rb="type" aria-pressed="false"><span class="ic-rbar-sort-label">'+esc(nmTypeLabel())+'</span></button>'+
            '</div>'+
            langSwitch()+
            '<div class="ic-rb-sheet" id="ic-tv-type-sheet">'+
              '<div class="ic-rb-sheet-slide">'+
                '<div class="ic-rb-sheet-panel">'+
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
      var fb = wireFindBar({cell:root.querySelector(".ic-rbar-findcell"), gen:gen, onFocus:function(){ rbSheets.forEach(function(sh){ if(sh.isOpen()) sh.close(); }); }}), sheetInput = fb.input;
      var typeBtn = root.querySelector('[data-rb="type"]'), typeLabelEl = typeBtn.querySelector(".ic-rbar-sort-label"), typeSheetEl = root.querySelector("#ic-tv-type-sheet");
      var list = root.querySelector(".ic-tv-list"), cnt = root.querySelector(".ic-tv-count"),
          lnav = root.querySelector(".ic-tv-letters-lt"),
          rail = root.querySelector(".ic-az-rail"), peek = root.querySelector(".ic-az-peek");
      sheetInput.value = namesUi.q; sheetInput.dispatchEvent(new Event("input"));
      // azDragging/rbSheets — см. тот же комментарий в renderTavola (только
      // suppress и класс активности столбика, не синхронизация позиции);
      // здесь rbSheets реально взаимоисключает ДВЕ шторки (поиск и тип).
      var azDragging = false, rbSheets = [];
      bindBookSearchSheet(root, book, gen, rbSheets);
      function updateSearchLabel(){ fb.sync(); }
      function updateTypeLabel(){ typeLabelEl.textContent = nmTypeLabel(); typeBtn.classList.toggle("ic-rbar-on", namesUi.ty!=="all"); }
      function fill(){
        var words = tvFold(sheetInput.value.trim()).split(/\s+/).filter(Boolean), html = "", n = 0, have = {}, cur = null;
        var nmHm = words.length ? {n:words.length, fn:function(f, w){ var p = wsFind(f, words[w]); return p >= 0 ? [p, words[w].length] : null; }} : null;
        ordered().forEach(function(x){
          var e = x.e;
          if(namesUi.ty !== "all" && e.t !== namesUi.ty) return;
          if(words.length && !words.every(function(w){ return wsFind(e.h, w) >= 0; })) return;
          if(x.l !== cur){ if(cur) html += '</section>'; cur = x.l; have[cur] = 1; html += '<section class="ic-tv-sec" id="nm-L'+(cur==="#" ? "0" : cur)+'"><h2>'+cur+'</h2>'; }
          n++;
          html += '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'">'+
            '<span class="ic-tv-l">'+nmLineHtml(e, x.name, nmHm)+'</span>'+
            '<span class="ic-nm-meta"><span class="ic-nm-type">'+esc(t("nmT1_"+e.t))+'</span>'+(e.n ? '<span class="ic-nm-n">'+e.n+'</span>' : "")+'</span></a>';
        });
        if(cur) html += '</section>';
        list.innerHTML = html || '<p class="ic-empty">'+esc(t("tvNone"))+'</p>';
        clampSheetScroll();
        var countText = (words.length || namesUi.ty!=="all") ? t("nmFound",{n:n}) : t("nmTotal",{n:d.names.length});
        cnt.textContent = countText; nmN = n; updateSearchLabel();
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
      sheetInput.addEventListener("input",function(){ namesUi.q = sheetInput.value; fill(); toListTop(); });
      function toListTop(){ window.scrollTo(0, Math.min(window.scrollY, Math.max(0, list.getBoundingClientRect().top + window.scrollY - barH()))); }
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
        fb.set(false);
        if(act==="type"){ typeSheetApi.toggle(); return; }
      });
      list.addEventListener("click",function(e){
        fb.set(false);
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
        // Позиции слова (m[2..]) посчитаны по РУССКОМУ тексту; на EN/FR выдержка берётся из перевода того же блока
        // (b.n совпадает) — с начала блока, без метки слова; нет перевода блока — только номер абзаца, без русского текста.
        var trN = trLang(book), tb = trN && ch[trN] && ch[trN].blocks && ch[trN].blocks[m[1]-1], snipHtml;
        if(!trN) snipHtml = nmSnippet(row.text, m.slice(2));
        else if(tb){ var tt = nmBlockText(tb), cut = tt.length > 170 ? tt.lastIndexOf(" ", 170) : -1; snipHtml = nmPlain(cut > 40 ? tt.slice(0, cut) : tt.slice(0, 170))+(tt.length > 170 ? "…" : ""); }
        else snipHtml = "¶ "+m[1];
        return '<li><a href="'+esc(chapterHrefWord(book, slug, m[1], m.slice(2)))+'">'+snipHtml+'</a>'+badge+'</li>';
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
      bookShell(book, "names", {tabsOpts:{parentHref: hrefFor(book, "names"), ctxTypes: CARD_CTX_TYPES}})+
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
  // Название гравюры на языке интерфейса (plates.json: title — рус., title_en/title_fr — переводы по GLOSSARY.tsv).
  function plName(p){ if(!p) return ""; var l = state.lang; return (l==="en" && p.title_en) || (l==="fr" && p.title_fr) || p.title; }
  function plNameById(book, id, fb){ var pl = book.chap && book.chap.pl, p = pl && id && pl.byId[id]; return p ? plName(p) : (fb || ""); }
  function plTitle(chap, p){ return plName(p); }
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
      if(p.sfl !== state.lang || p.sf === undefined){ p.sfl = state.lang; p.sf = undefined; }
      if(p.sf === undefined) p.sf = srFold(plName(p)+" | "+(p.ru_caption||"")+" | "+(p.it_caption||""));
      if(!srFind(p.sf, words)) return;
      var tsp = srFind(srFold(plName(p)), words, true);
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
        '<span class="ic-sr-pb"><span class="ic-sr-t">'+(h.tsp ? srMark(plName(p), h.tsp) : esc(plName(p)))+'</span>'+snip+'</span></a></li>';
    }
    var nmHm = {n:tw.length, fn:function(f, w){ var r = srFind(f, [tw[w]], true); return r && r !== true ? [r[0], r[1]] : null; }};
    function nmRow(h){
      var e = h.e;
      return '<a class="ic-nm-row" href="'+esc(hrefFor(book, "names/"+e.id))+'"><span class="ic-tv-l">'+nmLineHtml(e, nmForm(e), nmHm)+'</span>'+
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
    // главы могут быть ещё не загружены (вкладка «Имена», «Указатель», Рипа): грузим сами, а не показываем «перевод не добавлен»
    if(!book.meta.chapters){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("chNotYet"))+'</p>'; return; }
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
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      if(!chap){ box.innerHTML = '<p class="ic-sr-hint">'+esc(t("chNotYet"))+'</p>'; return; }
      srLoad(book, chap, function(c){
        if(gen !== renderGen) return;
        ctx = c; paint();
        if(restoreY) requestAnimationFrame(function(){ if(gen === renderGen) window.scrollTo(0, restoreY); });
      });
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
        bookShell(book, null, {tabsOpts:{parentHref: "#/", hide: forcedBook}})+
        '<div class="ic-wrap ic-home">'+
          // Пункт 1 этого раунда: ссылка «Библиотека» убрана отсюда — теперь
          // она одна на все страницы книги, в шапке сайта рядом с именем
          // (renderBackBarBrand выше), а не только на обложке.
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          (hp ? ornamentMaskHtml(book, hp, "ic-orn-headpiece") : "")+
          '<header class="ic-home-hero">'+
            '<div class="ic-home-txt">'+
              '<p class="ic-kicker" lang="it">'+esc(book.meta.title.original||"")+'</p>'+
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
      var fig = root.querySelector(".ic-home-fig .ic-fig"); if(fig) fig.addEventListener("click",function(){
      if(isAlc(book)) openImgFull(fig.getAttribute("data-src").replace(/\.webp$/, "_full.webp"), bt(book.meta.title), {cls:"ic-svx-alc"}); else lightbox(fig.getAttribute("data-src")); });
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
        bookShell(book, "text", {tabsOpts:{parentHref: coverHref(book)}})+
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
        bookShell(book, "plates", {tabsOpts:{parentHref: coverHref(book)}})+
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
        bookShell(book, "search", {tabsOpts:{parentHref: coverHref(book)}})+
        '<div class="ic-wrap">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<header class="ic-head"><p class="ic-kicker">'+esc(bt(book.meta.title))+'</p><h1 class="ic-h-fr">'+esc(t("hmSearch"))+'</h1></header>'+
          '<form class="ic-home-search" role="search">'+
            '<span class="ic-search-wrap"><input class="ic-search" type="search" enterkeyhint="search" placeholder="'+esc(t("srAllPh"))+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(t("srAllPh"))+'">'+
            '<button type="button" class="ic-search-clear" aria-label="'+esc(t("clearSearch"))+'" hidden>&times;</button></span></form>'+
          '<div class="ic-sr" aria-live="polite"></div>'+
        '</div>';
      bindLangSwitch(root);
      bindBookBack(root);
      var form = root.querySelector(".ic-home-search");
      var lp = root.querySelector('[data-rb="booksearch"]');
      if(lp) lp.addEventListener("click", function(){ form.querySelector(".ic-search").focus(); });
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
    var gen = renderGen, mfrom = motFromParse();
    if(!mfrom){ renderPlateCard2(book, id, null, gen); return; }
    // «открыта из мотива»: данные мотивов и книг мотива нужны до отрисовки (подпись «мотив, k из n», Пред./След.)
    motLoad(function(){
      if(gen !== renderGen) return;
      motEnsure(motSelect(mfrom.param).sel, gen, function(){ renderPlateCard2(book, id, mfrom, gen); });
    });
  }
  function renderPlateCard2(book, id, mfrom, gen){
    loadChapters(book, function(chap){
      if(gen !== renderGen) return;
      var pl = chap && chap.pl, p = pl && pl.byId[id];
      if(!p){ location.replace(hrefFor(book, pl && pl.byOld[id] ? "plate/"+pl.byOld[id] : "plates")); return; }
      var gal = pl.list, idx = gal.indexOf(p);
      var engBase = engBaseOf(book), src = engBase+p.file+"_display.webp";
      var ch = chap.bySlug[p.chapter], cf = p.cap_from, cch = cf ? chap.bySlug[cf.chapter] : ch,
        capB = (p.at==="cap" || cf) && cch && cch.blocks ? cch.blocks[(cf ? cf.block : p.block)-1] : null;
      var prev = idx > 0 ? gal[idx-1] : null, next = idx < gal.length-1 ? gal[idx+1] : null;
      // контекст мотива: Пред./След. — соседние гравюры мотива (могут быть и статьи другой книги), «назад» — в сетку мотива
      var mctx = mfrom ? motCardCtx(book, p, mfrom) : null, fq = mfrom ? "?from="+motFromRaw() : "", prevX = null, nextX = null;
      if(mctx){ prevX = mctx.prev; nextX = mctx.next; prev = prevX ? prevX.it : null; next = nextX ? nextX.it : null; }
      function xOf(n){ return n === prev ? prevX : n === next ? nextX : null; }
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
        return '<a class="ic-pc-pill" rel="'+dir+'" href="'+esc(mctx ? motHrefOf(xOf(n), fq) : hrefFor(book,"plate/"+n.id))+'">'+esc(t(dir==="prev"?"plPrev":"plNext"))+'</a>';
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
      var mSec = motPlateSection(book, p, gen);
      var explParas = p.expl.map(function(e){ return explHtml(chap, e); }).join("");
      var explBlock = '<section class="ic-pc-expl" aria-labelledby="ic-pc-expl-h"><h2 id="ic-pc-expl-h" class="ic-pc-expl-h">'+esc(t("plExplH"))+'</h2>'+
        (enP ? (explParas ? '<div class="ic-text ic-pc-expl-body" lang="'+trl+'">'+explParas+'</div>' : '<p class="ic-ch-note">'+esc(t(trl==="fr" ? "chFrSoon" : "chEnSoon"))+'</p>')
          : state.lang!=="ru" ? '<p class="ic-ch-note">'+esc(t("chRuOnly"))+'</p>' : explParas ? '<div class="ic-text ic-pc-expl-body" lang="ru">'+explParas+'</div>' : '<p class="ic-pc-none">'+esc(t("plNoExpl"))+'</p>')+
        '</section>';
      root.innerHTML =
        bookTabsHtml(book, "plates", {parentHref: mfrom ? motHref(mfrom.param, mfrom.mid) : hrefFor(book, "plates"), ctxTypes: CARD_CTX_TYPES})+
        '<div class="ic-wrap ic-home ic-plate-card">'+
          '<div class="ic-top-row">'+langSwitch()+'</div>'+
          '<article class="ic-pc" data-id="'+esc(p.id)+'">'+
            '<figure class="ic-pc-fig"><div class="ic-fig ic-fig-eng" data-src="'+esc(src)+'"><img class="ic-fade-img ic-eng-display" src="'+esc(src)+'"'+
              (p.w && p.h ? ' width="'+p.w+'" height="'+p.h+'"' : "")+' alt="'+esc(t("engravingAlt",{title:plName(p)}))+'"></div></figure>'+
            '<div class="ic-pc-body">'+
              '<p class="ic-pc-count">'+esc(mctx ? mctx.name+", "+(mctx.idx+1)+" "+t("motOf")+" "+mctx.total : t("plCount",{k:idx+1, n:gal.length}))+'</p>'+
              '<h1 class="ic-pc-title">'+esc(plName(p))+'</h1>'+
              (enCapB ? '<p class="ic-pc-ru" lang="'+trl+'">'+inl(enCapB.text, qmState(enCapB))+'</p>' : trl==="fr" ? "" : p.ru_caption ? '<p class="ic-pc-ru" lang="ru">'+inl(p.ru_caption, capB ? qmState(capB) : null)+'</p>' : "")+
              (p.it_caption ? '<p class="ic-pc-it" lang="it">'+esc(p.it_caption)+'</p>' : "")+
              (meta.length ? '<p class="ic-pc-meta">'+meta.join('<span class="ic-pc-sep" aria-hidden="true"> · </span>')+'</p>' : "")+
              explBlock+
              mSec.html+
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
      var mEl = root.querySelector('.ic-mot-sec[data-mt]'); if(mEl) mSec.wire(mEl);
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
      [prev,next].forEach(function(n){ if(n && motIsPlObj(n)){ var im = new Image(); im.src = engBase+n.file+"_display.webp"; } });
      function step(n){ if(!n) return; if(mctx) motStep(xOf(n), fq); else location.replace(hrefFor(book, "plate/"+n.id)); }
      // Пред./След. из мотива заменяют запись истории (гравюры мотива не копятся в «назад»)
      if(mctx) root.querySelectorAll(".ic-pc-pill[rel]").forEach(function(a){ a.addEventListener("click", function(e){
        if(e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); step(a.getAttribute("rel") === "prev" ? prev : next); }); });
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
        fieldsHtml += '<li><b>'+esc(label)+'</b><span>'+(isGro(book) ? groFieldHtml(val) : esc(val))+'</span></li>';
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
      (isGro(book) ? groNotesHtml(it) : "")+
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
      return '<li class="ic-obj" data-id="'+it.id+'" data-anchor="o'+it.id+'">'+
        '<details class="ic-obj-d">'+
          '<summary class="ic-obj-sum">'+
            '<span class="ic-obj-num">'+esc(it.num||"")+'</span>'+
            '<span class="ic-obj-name">'+esc(titleOf(it))+'</span>'+
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
        if(!isPhoneWidth() && !isGro(book)) return;
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
      html = html.replace(/^<p>/, "<p>"+marker);
      if(isGro(book)) html += groNotesHtml(it);
      return html;
    }).join("");
  }
  function wireBookText(book, objs, container){
    container.querySelectorAll(".ic-numref").forEach(function(a){
      a.addEventListener("click",function(e){
        e.preventDefault();
        var id = a.getAttribute("data-id");
        if(isPhoneWidth() || isGro(book)){ openObjectSheet(book, objs, objs.indexOf(book.byId[id])); return; }
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
  // Пока шторка открыта, body закреплён с top=-scrollY. Если страница под шторкой стала короче
  // (фильтр списка), липкая шапка остаётся в контейнере короче этого смещения и уезжает за экран.
  // Поэтому после любой смены высоты контента подтягиваем сохранённую позицию к новому максимуму.
  function clampSheetScroll(){
    if(sheetScrollY==null) return;
    var maxY = Math.max(0, document.body.offsetHeight - window.innerHeight);
    if(sheetScrollY > maxY){ sheetScrollY = maxY; document.body.style.top = (-maxY)+"px"; }
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
    if(isGro(book) && groObj){ groObj.open(idx); return; }
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
    if(isGro(book)){ renderGroCard(book, plateNum, opts); return; }
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

  // Просмотр одной гравюры на весь экран (новый вид Рипы): тёмный фон, нативный щипок;
  // закрывается «назад»/жестом от края/Esc/уголком — запись истории, как у просмотра сканов.
  // src — адрес или список адресов (страницы одной эмблемы Альчато — друг под другом); o.at — к какой прокрутить, o.cls — свой класс.
  function openImgFull(src, title, o){
    if(sv) return;
    o = o || {};
    var srcs = [].concat(src), d = document.createElement("div");
    d.className = "ic ic-svx ic-svx-one"+(srcs.length > 1 ? " ic-svx-many" : "")+(o.cls ? " "+o.cls : ""); d.setAttribute("role","dialog"); d.setAttribute("aria-label", t("lbAlt"));
    d.innerHTML = '<div class="ic-svx-bar"><button type="button" class="ic-svx-back" aria-label="'+esc(t("close"))+'">'+ICON_BACK+'</button><span class="ic-svx-pos">'+esc(title||"")+'</span></div>'+
      '<div class="ic-svx-feed">'+srcs.map(function(x){ return '<img alt="" src="'+esc(x)+'">'; }).join("")+'</div>';
    var st = {idx:0, panel:false};
    function onKey(e){ if(e.key === "Escape") st.close(); }
    st.close = function(fromPop){
      if(sv !== st) return;
      sv = null; document.removeEventListener("keydown", onKey);
      if(fromPop !== true && history.state && history.state.sv){ try{ history.back(); }catch(e){} }
      d.remove();
    };
    st.go = function(){};
    d.querySelector(".ic-svx-back").addEventListener("click", function(){ st.close(); });
    sv = st;
    try{ histIdx = nextHistIdx(); history.pushState({ic: histIdx, sv: 1}, ""); }catch(e){}
    ensureManual();
    document.addEventListener("keydown", onKey);
    document.body.appendChild(d);
    if(o.at){ var im = d.querySelectorAll(".ic-svx-feed img")[o.at], fd = d.querySelector(".ic-svx-feed");
      if(im){ var toAt = function(){ fd.scrollTop = im.offsetTop; }, all = d.querySelectorAll(".ic-svx-feed img");
        for(var q = 0; q <= o.at; q++) all[q].addEventListener("load", toAt); toAt(); } }
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
      if(state.lang !== "ru"){
        x = x.replace(/\[(ИНИЦИАЛ|ГРАВЮРА|ВИНЬЕТКА|ПУСТАЯ СТРАНИЦА)([^\]]*)\]/g, function(m, k, r){
          var body = r.replace(/^:\s*/, "");
          if(k === "ИНИЦИАЛ") return body;
          var cyr = (body.match(/[А-Яа-яЁё]/g) || []).length, label = t({ГРАВЮРА: "svMkEng", ВИНЬЕТКА: "svMkOrn"}[k] || "svMkBlank");
          return cyr > body.length * 0.3 || k !== "ГРАВЮРА" ? "[" + label + "]" : "[" + label + ": " + body + "]";
        }).replace(/\[знак\]/g, "[" + t("svMkSign") + "]").replace(/(^| · )с\. /g, "$1p. ");
      }
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

  /* ---------- Просмотр сканов на телефоне/узком экране (< 1400px): вертикальная лента ----------
     Тёмный полноэкранный слой: сверху строка в стиле меню (назад · «с. N» · Скан|Транскрипция), под ней — ВСЕ сканы
     главы друг под другом в обычной нативной прокрутке (никаких своих жестов). Заглушка каждого скана — коробка с
     aspect-ratio по реальному размеру (scans/sizes.json) и миниатюрой scans/thumb, полный скан грузится лениво
     (loading=lazy) и плавно проявляется поверх — при догрузке ничего не прыгает. Увеличение — нативный щипок
     браузера (страница не блокирует масштаб: ни touch-action, ни user-scalable). «Транскрипция» — та же лента, но
     вместо картинок итальянский набранный текст страниц с метками. «с. N» — страница, занимающая большую часть экрана. */
  var svSizes = {};
  function openSvFull(book, rows, idx, scansDir){
    var pad4 = function(n){ return ("000"+n).slice(-4); };
    var d = document.createElement("div");
    d.className = "ic ic-svx"; d.setAttribute("role","dialog"); d.setAttribute("aria-label", t("svDlg"));
    d.innerHTML =
      '<div class="ic-svx-bar">'+
        '<button type="button" class="ic-svx-back" aria-label="'+esc(t("close"))+'">'+ICON_BACK+'</button>'+
        '<span class="ic-svx-pos"></span>'+
        '<div class="ic-svx-sw" role="group">'+
          '<button type="button" data-m="scan">'+esc(t("svScan"))+'</button>'+
          '<button type="button" data-m="it">'+esc(t("svTrans"))+'</button></div>'+
      '</div>'+
      '<div class="ic-svx-feed"></div>';
    var feed = d.querySelector(".ic-svx-feed"), pos = d.querySelector(".ic-svx-pos");
    var st = {idx:idx, panel:false}, items = [], ticking = false, quietUntil = 0;

    function mark(on){
      root.querySelectorAll(".ic-pgm-b").forEach(function(b){ b.setAttribute("aria-pressed", String(on && +b.getAttribute("data-pi") === st.idx)); });
      var scanBtn = root.querySelector(".ic-rbar-scan"); if(scanBtn) scanBtn.setAttribute("aria-pressed", String(on));
    }
    function setPos(){ pos.textContent = pgLabel(rows[st.idx][1]); mark(true); }
    function build(all){
      feed.innerHTML = ""; items = [];
      rows.forEach(function(r, j){
        var it = document.createElement("section"); it.className = "ic-svx-item"; it.setAttribute("data-j", j);
        if(svMode === "scan"){
          var sz = svSizes[pad4(r[0])] || [1100, 1600];
          var pg = document.createElement("div"); pg.className = "ic-svx-pg"; pg.style.aspectRatio = sz[0]+" / "+sz[1];
          var th = document.createElement("img"); th.className = "ic-svx-th"; th.alt = ""; th.loading = "lazy"; th.src = scansDir+"thumb/"+pad4(r[0])+".webp";
          var fu = document.createElement("img"); fu.className = "ic-svx-fu"; fu.alt = ""; fu.loading = "lazy"; fu.decoding = "async";
          fu.addEventListener("load", function(){ fu.classList.add("ic-svx-on"); });
          fu.src = scansDir+pad4(r[0])+".webp";
          pg.appendChild(th); pg.appendChild(fu); it.appendChild(pg);
        } else {
          it.className += " ic-svx-t";
          it.innerHTML = '<h3 class="ic-svx-h">'+esc(pgLabel(r[1]))+'</h3><div class="ic-sv-it" lang="it">'+itHtml(all[String(r[0])])+'</div>';
        }
        feed.appendChild(it); items.push(it);
      });
    }
    function toCur(){ var it = items[st.idx]; quietUntil = performance.now()+500; if(it) feed.scrollTop = it.offsetTop; }
    function curByScroll(){
      // страница, занимающая большую часть экрана (наибольшее пересечение с видимой областью ленты)
      var top = feed.scrollTop, bot = top + feed.clientHeight, best = st.idx, bestV = -1;
      for(var j = 0; j < items.length; j++){
        var it = items[j], a = it.offsetTop, z = a + it.offsetHeight;
        if(z < top) continue; if(a > bot) break;
        var v = Math.min(z, bot) - Math.max(a, top);
        if(v > bestV){ bestV = v; best = j; }
      }
      return best;
    }
    feed.addEventListener("scroll", function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){ ticking = false; if(performance.now() < quietUntil) return; var j = curByScroll(); if(j !== st.idx){ st.idx = j; setPos(); } });
    }, {passive:true});
    function render(){
      d.querySelectorAll(".ic-svx-sw [data-m]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === svMode)); });
      d.classList.toggle("ic-svx-textmode", svMode === "it");
      var at = st.idx;
      if(svMode === "it") loadPagesIt(book, function(all){ if(sv !== st) return; build(all); st.idx = at; toCur(); setPos(); });
      else { build(); toCur(); setPos(); }
    }
    d.querySelectorAll(".ic-svx-sw [data-m]").forEach(function(b){ b.addEventListener("click", function(){
      var m = b.getAttribute("data-m"); if(m === svMode) return; svMode = m; render();
    }); });
    st.go = function(i){ if(i < 0 || i >= rows.length) return; st.idx = i; toCur(); setPos(); };
    st.close = function(fromPop){
      if(sv !== st) return;
      sv = null;
      document.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize);
      // запись истории, добавленная при открытии: закрываем её «назад» (если
      // закрыли не самим жестом назад и хэш не сменился)
      if(fromPop !== true && history.state && history.state.sv){ try{ history.back(); }catch(e){} }
      var blk = rows[st.idx] && root.querySelector('.ic-ch-body [data-n="'+rows[st.idx][2]+'"]');
      if(!blk){ var pb = root.querySelector('.ic-pgm-b[data-pi="'+st.idx+'"]'); blk = pb && pb.closest(".ic-pgm"); }
      d.remove(); mark(false);
      // текст главы — к странице 1626, на которой остановились
      if(blk){ var top = blk.getBoundingClientRect().top + window.scrollY - headerStackH() - 16; window.scrollTo(0, Math.max(0, top)); }
    };
    function onKey(e){ if(e.key === "Escape") st.close(); }
    function onResize(){ if(window.innerWidth >= 1400) st.close(); }
    d.querySelector(".ic-svx-back").addEventListener("click", function(){ st.close(); });

    sv = st;
    try{ histIdx = nextHistIdx(); history.pushState({ic: histIdx, sv: 1}, ""); }catch(e){}
    ensureManual();
    document.addEventListener("keydown", onKey); window.addEventListener("resize", onResize);
    document.body.appendChild(d);
    function start(){ if(sv === st) render(); }
    if(svSizes.__loaded) start();
    else fetch(scansDir+"sizes.json").then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; })
      .then(function(j){ svSizes = j || {}; svSizes.__loaded = 1; start(); });
  }

  function openSv(book, rows, idx){
    if(sv){
      if(sv.panel && sv.idx === idx){ sv.close(); return; }
      sv.go(idx); return;
    }
    var panel = window.innerWidth >= 1400, base = BASE+"books/"+book.slug+"/", scansDir = base+(book.meta.chapters.scans || "scans/");
    if(!panel){ openSvFull(book, rows, idx, scansDir); return; }
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

    stage.addEventListener("click", function(e){ if(e.target === img) stage.classList.toggle("ic-sv-zoom"); });

    sv = st;
    document.addEventListener("keydown", onKey); window.addEventListener("resize", onResize);
    keepAnchor(function(){ root.classList.add("ic-has-sv"); document.body.appendChild(d); });
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
