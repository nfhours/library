# Alciato — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/alciato/`. Проверены все 208 записей alciato (alc10…alc226; номера идут с пропусками, см. «Проблемы разбивки текста»). Тексты не исправлялись; ниже только сводка замечаний. Подробности — в `<id>.json`.

**Структура книги.** Оригинал — латынь, и он лежит в поле `text_fr`, несмотря на имя поля. Латинский девиз — в поле `fr`, латинское название раздела — в `group_fr`. Переводы: `text_ru`, `text_en`, `text_frtrans` (французский перевод); заголовки-переводы — `ru`, `en`, `name_fr`. Полей attrs и caption нет. В каждой записи один абзац (эпиграмма). Сканы `books/alciato/pages/<id>.jpg` — целая страница: девиз, гравюра, эпиграмма; по ним сверялись подписи и спорные чтения латыни. Ошибки латинского оригинала помечены [LA], поле `text_fr`.

## Итог

| Вердикт | Записей |
|---|---|
| ok | 113 |
| minor | 95 |
| major | 0 |
| **всего** | **208** |

### Уникальные ошибки и вхождения по полям

Одна ошибка = один `issue_id` (`<id>-<n>`). Если одна и та же ошибка есть в нескольких полях (RU, EN, FR…), она считается один раз как уникальная, а в «вхождениях» — по разу на каждое поле из списка `fields`.

| Показатель | Значение |
|---|---|
| Уникальных ошибок (issue_id) | 144 |
| Вхождений по полям (сумма длин `fields`) | 310 |
| Объектов-замечаний в JSON (одно замечание = один объект с полным списком `fields`) | 144 |

Вхождения по полям: RU — 86, EN — 75, FR — 63, text_fr [LA] — 36, caption_orig — 9, caption_ru — 9, caption_en — 9, caption_fr — 9, заголовок ru — 5, заголовок fr [LA] — 4, заголовок name_fr — 3, заголовок en — 2.

Уникальные ошибки по типу: mistranslation — 68, ocr — 39, omission — 16, name — 11, addition — 8, typo — 2. Уверенность: low — 72, medium — 47, high — 25.

Из 144 уникальных ошибок 9 касаются подписей (девизов и подзаголовков на странице), 36 — латыни в `text_fr` [LA], 4 — латинского/греческого девиза в поле `fr`, остальные 95 — переводов (текст и заголовки).

Разделы ниже: major — 0; «Проблемы разбивки текста» — 3 (+ пропуски нумерации без issue_id); «Подписи к гравюрам» — 9; «Ошибки латинского оригинала [LA]» — 36 в text_fr + 4 в заголовке fr; «Не уверен» — 21; «Повторяющиеся закономерности» — 6 пунктов. Каждый issue_id в каждом разделе — один раз; один issue_id может входить в несколько разделов.

## Major

Записей с вердиктом major нет. Самые серьёзные замечания (medium) — неверно понятые латинские слова, из-за которых меняется смысл строки, но не статьи в целом (например alc113-2 «cadet», alc126-2 «illicium», alc185-1 «Outin», alc189-1 «suum»). Поэтому записи оставлены minor. Замечания только о подписях всегда minor.

## Проблемы разбивки текста

Обрывы и пропуски латинского текста на стыках строк и страниц:

- `alc21-1` — text_fr [LA] — ocr, medium: «Ad superos reuocet, quod vigilem,» → [LA] строка испорчена (не держит размер пентаметра, нет слова): стандартное чтение — «Ad superos pigram quod reuocet vigilem.» — сверить по скану; не уверен в точном виде строки в издании 1551
- `alc82-1` — text_fr [LA] — ocr, medium: «Ephyrææ est Laidos.» → [LA] пропущено «ah, non» в конце строки 1 (на скане «…Laidos. ah, non / Erubuit…»; без него строка короче гекзаметра). Переводы «Ах, не постыдилась ли» уже его передают
- `alc219-1` — text_fr [LA] — omission, low: «Pallescunt studijs, laus diuturna» → [LA] выпал фрагмент на стыке страниц: последний стих обрывается на «laus diuturna» (на скане тоже конец страницы), последнего слова нет — вероятно «viret»; переводы достраивают смысл («слава долговечна»). Не уверен в слове

Без отдельного issue_id:

- Нумерация id идёт с пропусками: нет 9 номеров — alc32, alc52, alc105, alc111, alc124, alc129, alc150, alc176, alc201. Это не потеря данных: id = номер первой страницы, а каждый пропущенный номер — вторая страница двухстраничной записи (alc31 p31-32, alc51 p51-52, alc104 p104-105, alc110 p110-111, alc123 p123-124, alc128 p128-129, alc149 p149-150, alc175 p175-176, alc200 p200-201). `num` сплошной, 1…208.
- Двухстраничные записи проверены целиком; обрывов на стыке страниц внутри них нет.

## Подписи к гравюрам

Всего 9. caption_source: engraving — 9; text — 0. Во всех случаях подпись читалась со скана страницы (надпись на гравюре или набранный над/под ней девиз или подзаголовок). В text_fr и переводах её нет, поэтому позиция в тексте перевода во всех 9 случаях — «нет в тексте» (не начало, не середина и не конец). Ниже указано и место на странице.

Помечены только подписи, которые отличаются от заголовка `fr` по существу: недостающая часть девиза, греческий стих или подзаголовок, ярлык на гравюре. Различия в написании и артикле не помечались. Надписи на изображённых предметах (знамя SPQR, надгробия, монета BRVTI, межевой камень, карта и т. п.) по указанию пользователя не помечались. Подписи не удалять: предлагается вынести их в поля caption_orig / caption_ru / caption_en / caption_fr. «Текущий текст в переводе» — нынешние заголовки ru / en / name_fr, подписи в переводах нет.

### alc10 (`alc10-5`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Должно радоваться в Боге» / en «One must rejoice in God» / name_fr «Il faut se réjouir en Dieu» (fr «In Deo lætandum»)
- Позиция: в переводах — нет в тексте; на странице — надписи вырезаны на самой гравюре (греческая — вверху, GANYMEDES — посередине)
- caption_source: engraving
- caption_orig: «ΓΑΝΝΥΣΘΑΙ ΜΗΔΕΣΙ (γάνυσθαι μήδεσι). GANYMEDES»
- предлагается caption_ru «Радоваться замыслами. Ганимед»; caption_en «To rejoice in counsels. Ganymede»; caption_fr «Se réjouir en ses desseins. Ganymède»
- Что расходится с заголовком: девиз-заголовок fr «In Deo lætandum» / ru «Должно радоваться в Боге» с подписью не совпадает; надписей гравюры нет ни в тексте, ни в переводах

### alc20 (`alc20-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Химеру побеждают советом и доблестью» / en «The Chimera is overcome by counsel and courage» / name_fr «Par le conseil et la vertu on surmonte la Chimère» (fr «Consilio, & virtute Chimæram superari»)
- Позиция: в переводах — нет в тексте; на странице — девиз набран над гравюрой полностью, в заголовке обрезан
- caption_source: engraving
- caption_orig: «Consilio, & virtute Chimæram superari, id est, fortiores & deceptores.»
- предлагается caption_ru «Советом и доблестью побеждают Химеру, то есть более сильных и обманщиков»; caption_en «The Chimera is overcome by counsel and courage, that is, the stronger and the deceivers»; caption_fr «Par le conseil et la vertu on surmonte la Chimère, c’est-à-dire les plus forts et les trompeurs»
- Что расходится с заголовком: заголовки fr «Consilio, & virtute Chimæram superari» / ru / en / name_fr — без второй половины девиза «id est, fortiores & deceptores»

### alc22 (`alc22-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Жить трезво и не верить поспешно» / en «One must live soberly, and not believe rashly» / name_fr «Il faut vivre sobrement, et ne pas croire à la légère» (fr «Sobriè viuendum, & non temerè credendum»)
- Позиция: в переводах — нет в тексте; на странице — над латинским девизом набран греческий стих
- caption_source: engraving
- caption_orig: «Νῆφε καὶ μέμνησ’ ἀπιστεῖν· ἄρθρα ταῦτα τῶν φρενῶν. Sobriè viuendum: & non temerè credendum.»
- предлагается caption_ru «Будь трезв и помни, что не всему надо верить: вот суставы разума. Жить трезво и не верить поспешно»; caption_en «Be sober and remember to distrust: these are the joints of the mind. One must live soberly, and not believe rashly»; caption_fr «Sois sobre et souviens-toi de te méfier : ce sont là les articulations de l’esprit. Il faut vivre sobrement, et ne pas croire à la légère»
- Что расходится с заголовком: заголовки передают только латинскую часть девиза; греческий стих Эпихарма опущен

### alc23 (`alc23-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «В чём я преступил? Что делаю? Что упустил?» / en «Where have I overstepped? What am I doing? What have I omitted?» / name_fr «En quoi ai-je failli ? Que fais-je ? Qu'ai-je omis ?» (fr «Quid excessi? quid admisi? quid omisi?»)
- Позиция: в переводах — нет в тексте; на странице — над латинским девизом набран греческий стих
- caption_source: engraving
- caption_orig: «Πῆ παρέβην; τί δ’ ἔρεξα; τί μοι δέον οὐκ ἐτελέσθη; Quid excessi? quid admisi? quid omisi?»
- предлагается caption_ru «В чём я преступил? что совершил? что из должного не исполнил? В чём я преступил? Что совершил? Что упустил?»; caption_en «Where have I transgressed? What have I done? What duty have I left undone? Where have I overstepped? What have I committed? What have I omitted?»; caption_fr «En quoi ai-je transgressé ? Qu’ai-je fait ? Quel devoir n’ai-je pas accompli ? En quoi ai-je failli ? Qu’ai-je commis ? Qu’ai-je omis ?»
- Что расходится с заголовком: заголовки передают только латинскую часть; греческий стих (пифагорейские «Золотые стихи», 42) опущен

### alc41 (`alc41-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Терпи и воздерживайся» / en «Bear, and forbear» / name_fr «Supporte et abstiens-toi» (fr «Anechou kai apechou»)
- Позиция: в переводах — нет в тексте; на странице — девиз набран по-гречески над гравюрой
- caption_source: engraving
- caption_orig: «Ἀνέχου καὶ ἀπέχου.»
- предлагается caption_ru «Терпи и воздерживайся»; caption_en «Bear, and forbear»; caption_fr «Supporte et abstiens-toi»
- Что расходится с заголовком: заголовок fr — латинская транслитерация «Anechou kai apechou»; на странице девиз набран греческим шрифтом

### alc44 (`alc44-2`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Всё своё ношу с собой» / en «All that is mine, I carry with me» / name_fr «Je porte tout mon bien avec moi» (fr «Omnia mea mecum porto»)
- Позиция: в переводах — нет в тексте; на странице — надпись вырезана на гравюре, справа внизу, у моря
- caption_source: engraving
- caption_orig: «SCYTHICVM MARE»
- предлагается caption_ru «Скифское море»; caption_en «The Scythian Sea»; caption_fr «La mer de Scythie»
- Что расходится с заголовком: заголовок fr «Omnia mea mecum porto»; ярлыка гравюры нет ни в тексте, ни в переводах

### alc82 (`alc82-2`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Гробница блудницы» / en «The tomb of a courtesan» / name_fr «Le tombeau de la courtisane» (fr «Tumulus meretricis»)
- Позиция: в переводах — нет в тексте; на странице — под девизом набран греческий подзаголовок
- caption_source: engraving
- caption_orig: «Tumulus meretricis. Διαλογισμός.»
- предлагается caption_ru «Гробница блудницы. Диалог»; caption_en «The tomb of a courtesan. A dialogue»; caption_fr «Le tombeau de la courtisane. Dialogue»
- Что расходится с заголовком: заголовки fr «Tumulus meretricis» / ru / en / name_fr без подзаголовка «Διαλογισμός» (у других диалогов — alc31, alc40, alc51 — «Dialogismus» в заголовке есть)

### alc196 (`alc196-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Всё древнейшее — вымысел» / en «All the most ancient things are fabrications» / name_fr «Tout ce qui est très ancien n'est qu'invention» (fr «Antiquissima quæque commentitia»)
- Позиция: в переводах — нет в тексте; на странице — под девизом набран подзаголовок «APOLOGESIS»
- caption_source: engraving
- caption_orig: «Apologesis.»
- предлагается caption_ru «Апологесис (рассказ-притча)»; caption_en «Apologesis (a fable)»; caption_fr «Apologèse (récit allégorique)»
- Что расходится с заголовком: заголовки fr / ru / en / name_fr без подзаголовка «Apologesis» (ср. alc82-2, alc179, alc180 — подзаголовки Dialogismus/Prosopopoeia в заголовке есть)

### alc202 (`alc202-1`, поля: caption_orig/caption_ru/caption_en/caption_fr)

- Текущий текст в переводе: подписи нет; заголовки ru «Невежество должно быть устранено» / en «Ignorance must be removed» / name_fr «Il faut chasser l'ignorance» (fr «Submouendam ignorantiam»)
- Позиция: в переводах — нет в тексте; на странице — под девизом набран греческий подзаголовок
- caption_source: engraving
- caption_orig: «Διαλογισμός.»
- предлагается caption_ru «Диалог»; caption_en «A dialogue»; caption_fr «Dialogue»
- Что расходится с заголовком: заголовки fr / ru / en / name_fr без подзаголовка «Διαλογισμός» (ср. alc82-2; у alc210 «Dialogismus» в заголовке есть)

## Ошибки латинского оригинала [LA]

Латинский оригинал лежит в поле `text_fr` (не во французском!), девиз — в поле `fr`. Ниже все замечания к самой латыни: в основном сбои распознавания (потерянные тильды-сокращения, долгое ſ, прочитанное как f, перепутанные n/u, c/e). Колонка «Скан» показывает, подтверждено ли чтение по скану страницы. Правки в `books/` не вносились.

### В text_fr

| id | issue_id | Сейчас | Предлагается | Скан |
|---|---|---|---|---|
| alc10 | `alc10-1` | Ioues alite | «Iouis alite» (род. п.: «птицей Юпитера»); «Ioues» — сбой распознавания | по скану не сверялось (по грамматике/контексту) |
| alc10 | `alc10-2` | pueruli | «puerili … amore» (детской любовью); «pueruli» — сбой распознавания | по скану не сверялось (по грамматике/контексту) |
| alc16 | `alc16-1` | Hac cithara | «Hanc citharam» (дополнение к Accipe; на скане тильды-сокращения «Hãc citharã» потеряны при распознавании) | да, по скану |
| alc16 | `alc16-2` | cochæ | «conchæ» (сокращение с тильдой «cõchæ»; переводы «раковины / shell / conque» уже верны) | по скану не сверялось (по грамматике/контексту) |
| alc21 | `alc21-1` | Ad superos reuocet, quod vigilem, | строка испорчена (не держит размер пентаметра, нет слова): стандартное чтение — «Ad superos pigram quod reuocet vigilem.» — сверить по скану; не уверен в … | не подтверждено (не уверен) |
| alc29 | `alc29-1` | Hac caput | «Hæc caput, ille femur soluit» (она — голову, он — бедро; пара hæc/ille); «Hac» здесь — сбой распознавания (в строке 1 «Hac» = «здесь» верно) | по скану не сверялось (по грамматике/контексту) |
| alc31 | `alc31-3` | vetre | «ventre» (потеряна тильда «vẽtre») | по скану не сверялось (по грамматике/контексту) |
| alc31 | `alc31-5` | hoc sum pocula more iuuat | строка не разбирается («sum» без смысла); вероятно «hoc sumi pocula more iuuat» — «так пить чаши приятно»; не уверен, сверить по скану | не подтверждено (не уверен) |
| alc33 | `alc33-2` | viret | вероятно «vires» («столько сил имеет эта пальчатая трава»); «viret» ломает синтаксис — не уверен, сверить по скану | не подтверждено (не уверен) |
| alc36 | `alc36-1` | peremptо (последняя буква — кириллическая «о») | «perempto» — заменить кириллическую «о» на латинскую (ломает поиск) | по скану не сверялось (по грамматике/контексту) |
| alc44 | `alc44-1` | vetos | «ventos» (потеряна тильда «vẽtos») | по скану не сверялось (по грамматике/контексту) |
| alc45 | `alc45-1` | q, … stantq, caduntq, | знак сокращения передан запятой: «quòd scilicet omnes / … stantque, caduntque duces» (или как в других записях «q;») | по скану не сверялось (по грамматике/контексту) |
| alc51 | `alc51-1` | proptâ | «promptam» (на скане сокращение «prōptā»; при распознавании тильды переданы неверно, получилось «proptâ») | да, по скану |
| alc68 | `alc68-1` | ouain | «oua in» (на скане раздельно); переводы «яйцо» → мн. ч. «яйца / eggs / ses œufs» — мелочь | да, по скану |
| alc80 | `alc80-1` | Fanuus | «Faunus» (перестановка букв; на скане «Faunus») | да, по скану |
| alc82 | `alc82-1` | …Ephyrææ est Laidos. (конец строки 1) | пропущено «ah, non» в конце строки 1 (на скане «…Laidos. ah, non / Erubuit…»; без него строка короче гекзаметра). Переводы «Ах, не постыдилась ли» уже его … | да, по скану |
| alc91 | `alc91-1` | Asteriae | на скане «famulū Asteriā» = «famulum Asteriam volucris sumpsisse figuram» (слуга принял облик птицы астерии); «Asteriae» — сбой | да, по скану |
| alc96 | `alc96-1` | Sicretae | вероятно «Si cretæ» («если взмутит много ила/глины»; слито в одно слово); не уверен — сверить по скану | не подтверждено (не уверен) |
| alc102 | `alc102-1` | falsa | вероятно «salsa ossa» (долгое ſ прочитано как f) — «солёные кости», т. е. раковины устриц; не уверен по скану | не подтверждено (не уверен) |
| alc113 | `alc113-1` | eadem | «Nam cadet impostor» («ибо обманщик упадёт»); «eadem» — сбой распознавания (c→e, t→m) | по скану не сверялось (по грамматике/контексту) |
| alc115 | `alc115-1` | Expressius | «Expressus» (так на скане) | да, по скану |
| alc116 | `alc116-1` | videri | «viden'» (так на скане; = videsne) | да, по скану |
| alc126 | `alc126-1` | Illicitum | «Illicium» (так на скане) — «приманка» | да, по скану |
| alc127 | `alc127-1` | vrnq́ | на скане «super vtq́ cadauera bubo» («и как филин над трупами») | да, по скану |
| alc130 | `alc130-1` | fundiq́ | «fandiq́» (так на скане) — «искусных в речи» | да, по скану |
| alc142 | `alc142-1` | Mil | «Nil» (M вместо N) | по скану не сверялось (по грамматике/контексту) |
| alc146 | `alc146-1` | sinultates | «simultates» (так на скане) | да, по скану |
| alc154 | `alc154-1` | Prætervasq́ | на скане «Præteritasq́» («пропущенные») | да, по скану |
| alc166 | `alc166-1` | Connellunt | «Conuellunt» (так на скане; n вместо u) | да, по скану |
| alc179 | `alc179-1` | viraque | «vtraque» (так на скане) | да, по скану |
| alc186 | `alc186-1` | corruus | «coruus» (ворон; на скане «coruus/cornus» с плохим оттиском) | да, по скану |
| alc192 | `alc192-1` | Halcionet | «Halciones» (так на скане «Halcionet» — опечатка издания/распознавания; не уверен) | не подтверждено (не уверен) |
| alc200 | `alc200-1` | Hac | «Hæc» (так на скане) | да, по скану |
| alc208 | `alc208-1` | Ecqd | «Ecquid» (сокращение Ecq̃d с потерянной тильдой) | по скану не сверялось (по грамматике/контексту) |
| alc215 | `alc215-1` | fructu sperdens | вероятно «frugiperdam» (= ὠλεσίκαρπος, Од. X, 510; на скане «fruuiperdem»); не уверен | не подтверждено (не уверен) |
| alc219 | `alc219-1` | … laus diuturna (строка оборвана) | выпал фрагмент на стыке страниц: последний стих обрывается на «laus diuturna» (на скане тоже конец страницы), последнего слова нет — вероятно «viret»; переводы … | не подтверждено (не уверен) |

### В девизе (поле fr)

| id | issue_id | Сейчас | Предлагается | Скан |
|---|---|---|---|---|
| alc133 | `alc133-1` | Διχλογισμῶς | вероятно «Διαλογικῶς» (ср. alc119; χ вместо α); не уверен по скану | не подтверждено (не уверен) |
| alc149 | `alc149-1` | Allegoricos | на скане по-гречески «Ἀλληγορικῶς» (ср. греч. в заголовках alc119, alc133); транслитерация в данных | да, по скану |
| alc153 | `alc153-1` | descifcentes | «desciscentes» (ſ прочитано как f; так на скане «deſciſcentes») | да, по скану |
| alc179 | `alc179-2` | Prosopopoeia | на скане подзаголовок по-гречески «Προσωποποιΐα»; в данных латинская транслитерация (ср. alc149-1) | да, по скану |

Итого по сверке: да, по скану — 20, по скану не сверялось (по грамматике/контексту) — 11, не подтверждено (не уверен) — 9. Ещё одно латинское чтение включено в замечание к переводу без отдельного issue_id: `alc200-2` — «neropsq;» = «meropsq;» (щурка); по скану не сверялось.

Ошибки латыни, из-за которых искажён перевод (замечание к переводу зависит от чтения [LA]): `alc31-4`, `alc33-3`, `alc96-2`, `alc102-2`, `alc113-2`, `alc126-2`, `alc127-2`, `alc130-2`, `alc21-2`, `alc200-2`.

## Не уверен

Замечания, где сказано «не уверен» или «сверить по скану»: чтение или толкование оригинала требует проверки, правка не навязывается.

- `alc15-2` — заголовок ru/RU — name, low: «Constituunt hæc signa fidem» → Fides здесь — верность, честное слово (раздел Virtutes. Fides: союзы, тайна, молчание под пыткой), а «Символ Веры» читается как Credo: «Символ верности», «составляют Верность». Не уверен, что редактор хочет менять устоявшийся …
- `alc16-3` — RU/EN/FR — mistranslation, low: «Hac cithara, à lembi quæ forma halieutica fertur,» → fertur здесь «зовётся»: кифара, которую по форме лодки называют halieutica (рыбацкой). RU «эта кифара, что по форме челна зовётся «рыбацкой» (halieutica)»; EN «which from the shape of a boat is called halieutica»; FR «qu'on …
- `alc21-1` — text_fr [LA] — ocr, medium: «Ad superos reuocet, quod vigilem,» → [LA] строка испорчена (не держит размер пентаметра, нет слова): стандартное чтение — «Ad superos pigram quod reuocet vigilem.» — сверить по скану; не уверен в точном виде строки в издании 1551
- `alc23-3` — RU/EN/FR — mistranslation, low: «Quò pretergressus? quid agis? quod omittis agendum?» → в латыни 2-е лицо (самовопрошание к себе на «ты»): RU «Где ты преступил? что делаешь? что должное упускаешь?»; EN «Where did you overstep? What are you doing? What that ought to be done do you omit?»; FR «Où as-tu passé la mesure …
- `alc31-5` — text_fr [LA] — ocr, low: «hoc sum pocula more iuuat» → [LA] строка не разбирается («sum» без смысла); вероятно «hoc sumi pocula more iuuat» — «так пить чаши приятно»; не уверен, сверить по скану
- `alc33-2` — text_fr [LA] — ocr, low: «Herbaque tot viret hæc digitalis habet.» → [LA] вероятно «vires» («столько сил имеет эта пальчатая трава»); «viret» ломает синтаксис — не уверен, сверить по скану
- `alc33-3` — RU/EN/FR — mistranslation, low: «Herbaque tot viret hæc digitalis habet.» → при чтении vires: «и столько сил у этой пальчатой травы (digitalis)»; EN «and this finger-grass has so many powers»; FR «et cette herbe digitale a tant de vertus». Не уверен — зависит от alc33-2
- `alc78-1` — RU/EN/FR — mistranslation, low: «Dignus Epops Tereus, qui maluit ense putare, / Quàm linguam immodicam stridibus eruere.» → смысл, вероятно: «Достоин (похвалы) Терей-удод, что предпочёл отсечь мечом (язык Филомелы), а не терпеть её неумеренный язык с его криками»; во всех трёх переводах синтаксис спутан. Не уверен в чтении «stridibus» (возможно сбой в …
- `alc96-1` — text_fr [LA] — ocr, low: «multum excitet ergo / Sicretae,» → [LA] вероятно «Si cretæ» («если взмутит много ила/глины»; слито в одно слово); не уверен — сверить по скану
- `alc102-1` — text_fr [LA] — ocr, medium: «barba falsa ossa momordit,» → [LA] вероятно «salsa ossa» (долгое ſ прочитано как f) — «солёные кости», т. е. раковины устриц; не уверен по скану
- `alc118-1` — RU/EN/FR — mistranslation, low: «Princeps sororis pellicem.» → Терей любил Филомелу — сестру жены (Прокны), ставшую её соперницей; «своей сестры» искажает: RU «фракийский царь — сестру-наложницу (Филомелу)»; EN «the Thracian king loved the sister who became his concubine»; не уверен в лучшей …
- `alc133-1` — заголовок fr [LA] — ocr, low: «Διχλογισμῶς» → [LA] вероятно «Διαλογικῶς» (ср. alc119; χ вместо α); не уверен по скану
- `alc139-1` — RU/EN/FR — mistranslation, low: «stant nisi vota super.» → stant super = supersunt: «и надежда в тесноте: не осталось ничего, кроме молитв». EN «nothing is left but prayers»; FR «il ne reste que les prières»; не уверен
- `alc160-1` — RU/EN — addition, low: «Est fera, dum violat socios,» → «врага / enemies'» нет в тексте: «зверь — когда притесняет союзников» (FR «viole les alliés» буквально); не уверен — возможно, толкование комментаторов
- `alc172-1` — RU/EN/FR — mistranslation, low: «Agnoscitq́ vices naturæ:» → vices здесь — «очередь, ответная услуга»: лоза признаёт долг взаимности природы (ср. mutua iura). RU «и признаёт черёд природы — платить за добро»; EN «acknowledges nature's give-and-take»; FR «reconnaît le retour que veut la …
- `alc192-1` — text_fr [LA] — ocr, low: «His comptæ Halcionet» → [LA] «Halciones» (так на скане «Halcionet» — опечатка издания/распознавания; не уверен)
- `alc195-2` — RU/EN/FR — omission, low: «Purpureus: sed flos,» → пропущено purpureus (корень чёрный, [стебель/цветок] пурпурный, но цветок как молоко); не уверен в разборе
- `alc198-1` — RU/EN/FR — name, low: «Certabat plectro Sparthyn commissus in hostem,» → Sparthyn (Sparthis/Spartis) — имя соперника Эвнома, не этноним: «состязался плектром с противником Спартином»; не уверен в форме имени
- `alc198-2` — RU/EN/FR — mistranslation, low: «Pro cithara hic fidicen æneus ipsa sedet.» → ipsa — сама цикада: «здесь на кифаре сидит она сама, бронзовая, как кифаред» (на гравюре — цикада на кифаре); не уверен
- `alc215-1` — text_fr [LA] — ocr, medium: «Quòd fructu sperdens salicem» → [LA] вероятно «frugiperdam» (= ὠλεσίκαρπος, Од. X, 510; на скане «fruuiperdem»); не уверен
- `alc219-1` — text_fr [LA] — omission, low: «Pallescunt studijs, laus diuturna» → [LA] выпал фрагмент на стыке страниц: последний стих обрывается на «laus diuturna» (на скане тоже конец страницы), последнего слова нет — вероятно «viret»; переводы достраивают смысл («слава долговечна»). Не уверен в слове

## Повторяющиеся закономерности

1. **Одна ошибка во всех трёх переводах (58 из 95 ошибок перевода).** RU, EN и FR почти всегда ошибаются в одном и том же месте и одинаково: похоже, переводы сделаны один с другого или по одному разбору. Поэтому почти все замечания общие для трёх языков, а правку надо вносить сразу во все три поля.

2. **Сбой распознавания латыни переходит в перевод.** Переводчик честно переводил испорченное слово: «urnae» (alc127), «falsa ossa» (alc102), «eadem» вместо «cadet» (alc113), «Illicitum» вместо «Illicium» (alc126), «fundi» вместо «fandi» (alc130), «Expressius», «videri», «Hac». Типичные сбои: потерянная тильда-сокращение (vetre, vetos, proptâ, Ecqd), долгое ſ → f (falsa, descifcentes), n/u и c/e (Connellunt, sinultates, eadem), кириллическая «о» в alc36. Предложение: сначала исправить `text_fr` по скану, потом перевод.

3. **Имена и реалии прочитаны как обычные слова.** Curtius / Crassius как «короткий / толстый» (alc104), Sparthyn как «спартанский» (alc198), Outis как глагол (alc185), Polybides как «Полиид» (alc33); truo (пеликан) как «черпак / бирюк» (alc103, alc104); eruca (рукола) как «гусеница» (alc80, alc85); lupus cervarius (рысь) как «волк-гончая» (alc74); verna как «весенняя» (alc193); mala nomina (плохие долги) как «дурная слава» (alc70).

4. **Синтаксис: относительные местоимения и падежи.** Чаще всего подлежащее и дополнение меняются местами или qui/quam цепляется не к тому слову: alc10-4, alc15-1, alc16-4, alc31-4, alc36-2, alc88-1, alc115-2, alc117-1, alc123-1, alc189-1, alc214-1.

5. **Греческие девизы и подзаголовки (Dialogismus, Prosopopoeia, Apologesis) теряются или транслитерируются.** Греческий стих над латинским девизом (alc22, alc23), девиз только по-гречески (alc41), подзаголовок под девизом (alc82, alc196, alc202) — в заголовках нет, вынесено в подписи. В поле `fr` греческое записано латиницей или с ошибкой (alc133-1, alc149-1, alc179-2); в alc181 переведена только греческая часть девиза (alc181-1).

6. **Мелкие повторяющиеся ошибки RU.** Кальки и русизмы («кремль» для arx в alc19, «пиям» в alc212), опечатка «труслив ейший» (alc187), формы имён («Праксителес», «Эгейской» вместо «Ээйской»), род и число (alc168 «о прекрасном» вместо «о красавице»).

