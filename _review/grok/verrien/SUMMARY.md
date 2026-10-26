# Verrien — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/verrien/`. Проверены все 3289 записей verrien с оригиналом и переводом: часть 1 — 945, часть 2 — 248 медальонов и 2062 монограмм (быстрая проверка на странности, см. ниже), часть 3 — 34. Не проверялись служебные записи (index — 3, blank_page — 1). Тексты не исправлялись; здесь только сводка замечаний, подробности — в `<id>.json` и в CSV-файлах этой папки.

**Структура книги.** Оригинал — французский, поле `text_fr` (список абзацев). В части 1 абзацы такие: описание кружка; девиз (латынь, реже итальянский/испанский/французский), он же отдельно в `motto_fr`; французское толкование, оно же отдельно в `meaning_fr`. Заголовки: `fr` / `name_fr` (франц.), `ru`. Перевод только русский: `text_ru` (те же абзацы), `meaning_ru` (толкование). Английского перевода нет, поле `attrs` везде пустое. В части 2 у медальона один абзац — выгравированное название аллегории (оно же в `fr`, `name_fr`, `meaning_fr`), у монограммы — только буквы. Часть 3 — современные французские описания картушей (не текст издания). Сканов текстовых страниц нет (в `books/verrien/pages/` только указатель), поэтому чтения оригинала проверялись по смыслу и грамматике, а подписи медальонов и монограмм — по гравюрам (`plate_img`, кропы `img`).

## Итог

| Часть | Проверено записей | ok | minor | major | Уникальных ошибок (issue_id) | Вхождений по полям |
|---|---|---|---|---|---|---|
| Часть 1 (эмблемы) | 945 | 744 | 201 | 0 | 210 | 499 |
| Часть 2, медальоны | 248 | 239 | 9 | 0 | 10 | 36 |
| Часть 2, монограммы | 2062 | 2051 | 11 | 0 | 11 | 55 |
| Часть 3 (картуши) | 34 | 32 | 2 | 0 | 2 | 2 |
| **всего** | **3289** | **3066** | **223** | **0** | **233** | **592** |

Монограммы: из 2062 записей 2013 — обычные записи из одних букв (только посчитаны, отдельных файлов нет, в таблице учтены как ok); 49 записей со странностями получили свой JSON (38 ok, 11 minor).

### Уникальные ошибки и вхождения по полям

Одна ошибка = один `issue_id` (`<id>-<n>`), считается один раз. «Вхождения» — сумма длин списков `fields`: одна ошибка, повторённая в нескольких полях (например девиз в `text_fr`, `motto_fr` и скопированный в `text_ru`), даёт несколько вхождений.

Вхождения по полям: text_ru — 214, text_fr — 111, meaning_ru — 91, motto_fr — 88, ru — 46, fr — 16, name_fr — 16, meaning_fr — 10.

Уникальные ошибки по типу: ocr — 97, mistranslation — 64, addition — 41, typo — 13, name — 12, omission — 6. Уверенность: low — 119, medium — 83, high — 31.

| Тип | Часть 1 (эмблемы) | Часть 2, медальоны | Часть 2, монограммы | Часть 3 (картуши) | всего |
|---|---|---|---|---|---|
| ocr | 94 | 3 | 0 | 0 | 97 |
| mistranslation | 57 | 5 | 0 | 2 | 64 |
| addition | 39 | 2 | 0 | 0 | 41 |
| typo | 3 | 0 | 10 | 0 | 13 |
| name | 12 | 0 | 0 | 0 | 12 |
| omission | 5 | 0 | 1 | 0 | 6 |

Из 210 ошибок части 1: 85 — искажённые девизы (латынь [LA], итальянский [IT], испанский [ES]) в `motto_fr`/`text_fr`, почти всегда скопированные без перевода и в `text_ru`; 9 — прочие сбои французского текста; остальные — ошибки русского перевода.

## Major

Записей с вердиктом major нет ни в одной части. Самые серьёзные замечания (medium/high) — неверно переданный предмет (fusil «огниво» как «кремень», masse d'armes «булава» как «связка оружия»), перевод латинского девиза вместо французского толкования и искажённые девизы. Смысл статьи в целом при этом не теряется, поэтому записи оставлены minor.

## Ошибки по частям и типам

Полный список, каждый issue_id один раз. Формат: `issue_id` — поля — тип, уверенность: «оригинал» → предложение.

### Часть 1 (эмблемы) — 210

#### ocr — 94

- `v1-1-8-1` — text_fr/motto_fr/text_ru — ocr, high: «Defidia.» → [LA] «Desidia» (долгое ſ прочитано как f; desidia — праздность, ср. «C'est la paresse»); латинский девиз скопирован в text_ru с той же ошибкой. Скана текстовой страницы нет — по смыслу
- `v1-2-6-1` — text_fr/motto_fr/text_ru — ocr, high: «Nil mihi vobiscam est.» → [LA] «vobiscum» (a вместо u); латинский девиз скопирован в text_ru с той же ошибкой. Скана текстовой страницы нет — по грамматике
- `v1-3-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Spes altera vita.» → [LA] вероятно «Spes altera vitæ» («надежда на другую жизнь»; потеряно æ), ср. толкование «une seconde vie»; не уверен — скана текста нет
- `v1-4-14-2` — text_fr/motto_fr/text_ru — ocr, low: «Privo dite moriro.» → [IT] «Privo di te morirò» (di te слито; скана текста нет — по грамматике)
- `v1-5-7-1` — text_fr/motto_fr/text_ru — ocr, low: «Volenter trahimur.» → [LA] «Volenter» — не латинское слово; вероятно «Volentes trahimur» («нас влечёт по доброй воле»). Скана текста нет; не уверен
- `v1-6-7-1` — text_fr/motto_fr/text_ru — ocr, high: «Non bene conveninnt.» → [LA] «Non bene conveniunt» (ni → in; ср. v1-5-11 «Non conveniunt»); опечатка скопирована и в text_ru. Скана текста нет — по смыслу
- `v1-7-9-1` — text_fr/meaning_fr — ocr, low: «Je péris parce qui me devoit conserver.» → «par ce qui» (слитно «parce» — ошибка набора/OCR); text_ru переведён верно. Скана текста нет
- `v1-10-10-1` — text_fr/motto_fr/text_ru — ocr, high: «Non metentis, sed ferentis.» → [LA] «sed serentis» (долгое ſ прочитано как f; serere — сеять, ср. «celuy qui l'a semée»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-10-12-1` — text_fr/motto_fr/text_ru — ocr, medium: «Quò molius, eò suavius.» → [LA] «Quò mollius» (mollis — мягкий; ср. «plus doucement»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-11-9-1` — text_fr/motto_fr/text_ru — ocr, high: «Hostem vocat & fucat.» → [LA] «& fugat» (обращает в бегство, ср. «il le fait fuir»; fucat — «подкрашивает»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-13-2-1` — text_fr/motto_fr/text_ru — ocr, low: «Non capio, ni capior.» → [LA] «ni» — не латинское слово (вероятно «nisi»/«nec»; ср. толкование «Il a voulu estre pris»). Скана текста нет; не уверен
- `v1-13-12-1` — text_fr/motto_fr/text_ru — ocr, medium: «Devorat & ploreat.» → [LA] «& plorat» (ploreat — несуществующая форма; ср. «Il pleure»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-14-1-1` — text_fr/motto_fr/text_ru — ocr, high: «Va illi quem tetigerit.» → [LA] «Væ illi» (горе ему; лигатура æ потеряна, ср. «Malheur à celuy»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-15-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Antes muerta, che cautiva.» → [ES] «que cautiva» (che — итальянское; девиз испанский); возможно, опечатка самого издания. Скана текста нет; не уверен
- `v1-15-11-2` — text_fr/motto_fr/text_ru — ocr, medium: «Epiace, è punge.» → [IT] «E piace, e punge» (слитно «Epiace» — ошибка разбивки слов). Скана текста нет — по смыслу
- `v1-15-15-1` — text_fr/motto_fr/text_ru — ocr, medium: «Gio vane è maturo.» → [IT] «Giovane è maturo» (слово разорвано пробелом). Скана текста нет — по смыслу
- `v1-16-10-1` — text_fr/motto_fr/text_ru — ocr, low: «Domum mucrone tuctum.» → [LA] «tuctum» — не латинская форма; вероятно «Domum mucrone tuetur» (защищает дом жалом; ср. «Elle deffend sa maison»). Скана текста нет; не уверен
- `v1-17-13-1` — text_fr/motto_fr/text_ru — ocr, high: «Harent in corde sagittæ.» → [LA] «Hærent» (лигатура æ потеряна; hærere — застревать, ср. «attachées»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-18-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Musis aurora benigno.» → [LA] «benigna» (согласование с aurora, ж. р.); скопировано и в text_ru. Скана текста нет — по смыслу; возможно, опечатка издания
- `v1-19-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Propriis non parcis.» → [LA] вероятно «Propriis non parcit» (3-е лицо, ср. «Il ne pardonne pas»); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-19-15-1` — text_fr/motto_fr/text_ru — ocr, high: «Æstu non vi.» → [LA] «Astu non vi» (astus — хитрость, ср. «La ruse… que la force»; æstus — зной/прилив); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-21-2-1` — text_fr/ru/text_ru — ocr, low: «Vn Vautour sur une Chambre, qui attend quelque petit Oiseau pour se jetter dessus.» → «sur une Chambre» не сходится с гравюрой (v1-21 №2: птица на ветви дерева у скалы, никакого дома); вероятно, искажение (Branche?). Перевод «на доме» основан на этом чтении. Скана текста нет; не уверен
- `v1-21-5-1` — text_fr/motto_fr/text_ru — ocr, high: «Alis venenum.» → [LA] «Aliis venenum» (aliis — другим, ср. «pour les autres»; alis — крыльям); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-21-9-1` — text_fr/fr/name_fr — ocr, low: «Vne Coc qui chante.» → «Vn Coq» (род и написание; ср. «Coc-d'Inde» в v1-21-8 — возможно, орфография издания, но «Vne» явная ошибка); перевод верен
- `v1-23-1-1` — text_fr/motto_fr/text_ru — ocr, low: «No quiere chi no descança.» → [ES] «quien» (chi — итальянское; ср. v1-15-9 «che»); возможно, ошибка самого издания. Скана текста нет; не уверен
- `v1-23-8-1` — text_fr/motto_fr/text_ru — ocr, high: «Splandidor motu.» → [LA] «Splendidior motu» (ср. «plus brillant quand on m'agite»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-23-9-1` — text_fr/motto_fr/text_ru — ocr, high: «Pacatis ludit in unidis.» → [LA] «in undis» (лишняя i); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-24-5-1` — text_fr/motto_fr/text_ru — ocr, medium: «Quo cito fit, cito perit.» → [LA] «Quod cito fit, cito perit» (известная сентенция; ср. «Ce qui vient vîte»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-24-15-1` — text_fr/motto_fr/text_ru — ocr, medium: «Infletum ducere voces.» → [LA] «In fletum ducere voces» (слито; infletum — не слово); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-25-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Stat recta ferax que.» → [LA] «Stat recta feraxque» (энклитика -que пишется слитно); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-26-3-1` — text_fr/motto_fr/text_ru — ocr, high: «Non morietur innultus.» → [LA] «inultus» (неотомщённый; лишняя n); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-26-5-1` — text_fr/motto_fr/text_ru — ocr, medium: «Nec justus capta relaxat.» → [LA] вероятно «Nec jussus capta relaxat» («и по приказу не отпускает добычу», ср. «Il n'obeit pas pour rendre…»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-26-15-1` — text_fr/meaning_fr — ocr, medium: «Il est étonnant que je sois si grand, n'estant forty que d'un œuf.» → «sorty» (долгое ſ прочитано как f); text_ru переведён верно. Скана текста нет — по смыслу
- `v1-27-4-2` — text_fr/motto_fr/text_ru — ocr, low: «Aris, agrisque laboro.» → [LA] по толкованию («Malades») ожидается «ægrisque» (больным) — возможно, потеряна лигатура æ; но «agris» (полям) тоже осмысленно. Скана текста нет; не уверен
- `v1-27-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Solus que regit me spiritus.» → [LA] «Solusque» (энклитика -que пишется слитно; ср. v1-25-6); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-27-8-1` — text_fr/motto_fr/text_ru — ocr, medium: «Pormi limpiezza me quieren.» → [ES] «Por mi limpieza me quieren» (слитное «Pormi», итальянизированное -zz-); скопировано и в text_ru. Скана текста нет; возможно, орфография издания
- `v1-28-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Quis metiet?» → [LA] классически «Quis metietur?» (metior — отложительный глагол); возможно, так в издании. Скана текста нет; не уверен
- `v1-29-5-1` — text_fr/meaning_fr — ocr, medium: «Ou je feray rompuë ou bandée.» → «seray» (долгое ſ прочитано как f); text_ru переведён верно (по смыслу). Скана текста нет — по смыслу
- `v1-29-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Nunc fatibus apta.» → [LA] вероятно «Nunc fœtibus (fetibus) apta» («теперь пригоден к порождению», ср. «Je puis à present produire»); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-29-7-1` — text_fr/motto_fr/text_ru — ocr, medium: «Non capio ni capior.» → [LA] тот же девиз, что v1-13-2; толкование «Je ne prend rien si on ne me prend» подтверждает «nisi capior»; скопировано и в text_ru. Скана текста нет
- `v1-30-5-1` — text_fr/motto_fr/text_ru — ocr, high: «Modo vita superfit.» → [LA] «Modo vita supersit» (долгое ſ прочитано как f; ср. «pourvû qu'il n'en meure pas»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-31-2-1` — text_fr/motto_fr/text_ru — ocr, medium: «Nec casus cedam.» → [LA] «Nec cæsus cedam» (лигатура æ потеряна; cæsus — раненый, ср. «Tout blessé que je suis»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-31-3-1` — text_fr/motto_fr/text_ru — ocr, high: «Ad me delam.» → [LA] «Ad medelam» (для лечения, ср. «pour me guerir»; слово ошибочно разорвано); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-32-5-1` — text_fr/meaning_fr — ocr, low: «La bonté s'épreuve dans l'aversité.» → «l'adversité» (пропущена d; ср. девиз Adversa); возможно, опечатка издания. text_ru переведён верно
- `v1-32-8-1` — text_fr/motto_fr/text_ru — ocr, low: «Quebrantar lo cosa fea.» → [ES] девиз искажён: по толкованию («Rompre la foy c'est chose honteuse») ожидается «Quebrantar la fe, cosa fea» — пропущено «fe», «lo» вместо «la». Скана текста нет; не уверен
- `v1-33-9-1` — text_fr/motto_fr/text_ru — ocr, medium: «Qui en se me oppone me corona.» → [ES] «Quien se me opone me corona» (слово «Quien» разорвано; итальянизированное «oppone»); скопировано и в text_ru. Скана текста нет; возможно, орфография издания
- `v1-33-15-1` — text_fr/motto_fr/text_ru — ocr, medium: «Demi canto mi carcel.» → [ES] «De mi canto mi carcel» («от моего пения — моя темница»; слитное «Demi», ср. v1-27-7 «De mi regla mi valor»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-35-15-1` — text_fr/motto_fr/text_ru — ocr, high: «Deus & tutamen in armis.» → [LA] «Decus & tutamen in armis» (известный девиз; decus — красота, ср. «Ma beauté & ma seureté»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-36-7-1` — text_fr/motto_fr/text_ru — ocr, high: «Vno perente, crescit alter.» → [LA] «Vno pereunte» (abl. abs.; ср. «L'un finit»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-36-11-1` — text_fr/motto_fr/text_ru — ocr, low: «Non fregit qui quærit hostes.» → [LA] вероятно «Non fugit qui quærit hostes» («не бежит тот, кто ищет врагов», ср. «Il ne craint pas, mais il cherche»); fregit по смыслу не подходит. Скана текста нет; не уверен
- `v1-37-9-1` — text_fr/motto_fr/text_ru — ocr, high: «Ferendum & sparendum.» → [LA] «Ferendum & sperandum» (ср. «attendre ses roses»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-37-11-1` — text_fr/motto_fr/text_ru — ocr, low: «Ex luce luces.» → [LA] по толкованию («Il cache du venin sous ses brillans») ожидается «Ex luce lues» (из блеска — зараза/яд); «luces» смысла не даёт. Скана текста нет; не уверен
- `v1-37-15-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas che en la tierra nocivo.» → [ES] «Mas que en la tierra nocivo» (che — итальянское; ср. v1-15-9, v1-23-1); возможно, орфография издания. Скана текста нет; не уверен
- `v1-39-7-1` — text_fr/motto_fr/text_ru — ocr, high: «Ab omnia.» → [LA] «Ad omnia» (ad + acc., ср. «Propre à tout»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-40-1-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas firmezza chè luz.» → [ES] «Mas firmeza que luz» (итальянизированные «chè», «-zz-»; ср. v1-15-9, v1-23-1, v1-37-15); возможно, орфография издания. Скана текста нет; не уверен
- `v1-40-8-1` — text_fr/motto_fr/text_ru — ocr, high: «Qui me alit extenguit.» → [LA] «extinguit» (ср. «me fait mourir»; известный девиз «Qui me alit me extinguit»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-40-12-1` — text_fr/motto_fr/text_ru — ocr, medium: «Ostendit navos, non contrahit.» → [LA] «nævos» (пятна/недостатки; лигатура æ потеряна, ср. «les défauts»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-41-7-1` — text_fr/meaning_fr — ocr, medium: «Je suis devoyé au Soleil & à Mars.» → «devoüé» (dévoué — «посвящён»; devoyé — «сбит с пути»); text_ru «предан» переведён верно. Скана текста нет — по смыслу
- `v1-41-14-1` — text_fr/motto_fr/text_ru — ocr, high: «Si tempus fuverit.» → [LA] «Si tempus faverit» (ср. «Si le temps m'est favorable»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-42-2-1` — text_fr/motto_fr/text_ru — ocr, medium: «Servat que fovet que.» → [LA] «Servatque fovetque» (энклитика -que пишется слитно; ср. v1-25-6, v1-27-6); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-42-11-1` — text_fr/motto_fr/text_ru — ocr, medium: «Solo haret cœlum spectat.» → [LA] «Solo hæret» (лигатура æ потеряна; ср. v1-28-7 «Cœlo hæret, solo lucet»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-43-12-1` — text_fr/motto_fr/text_ru — ocr, medium: «Dulçorem vicinia fecit.» → [LA] «Dulcorem» (ç в латыни нет — французская буква при OCR/наборе); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-44-11-1` — text_fr/motto_fr/text_ru — ocr, medium: «Haret inexpletum lachrymans.» → [LA] «Hæret inexpletum lachrymans» (лигатура æ потеряна; ср. v1-42-11); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-45-7-1` — text_fr/motto_fr/text_ru — ocr, low: «Lex ex lex.» → [LA] «Lex ex lex» бессмысленно; по толкованию («Oüy & non») вероятно «Lex & exlex» (закон и беззаконие — паутина держит малых и рвётся большими). Скана текста нет; не уверен
- `v1-45-13-1` — text_fr/motto_fr/text_ru — ocr, medium: «Hac illac per fluo.» → [LA] «Hac illac perfluo» (Теренций; слово разорвано); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-47-11-1` — text_fr/motto_fr/text_ru — ocr, medium: «Schema il favor, crescon gli affanny.» → [IT] «Scema il favor, crescon gli affanni» (scemare — убывать; «-y» вместо «-i»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-48-13-1` — text_fr/motto_fr/text_ru — ocr, high: «Vt profit.» → [LA] «Vt prosit» (долгое ſ прочитано как f; profit — французское слово; ср. «pour en tirer du profit»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-49-8-1` — text_fr/motto_fr/text_ru — ocr, medium: «Vnus idem que inter diversa.» → [LA] «Vnus idemque» (энклитика -que пишется слитно; ср. v1-25-6, v1-27-6, v1-42-2); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-49-15-1` — text_fr/motto_fr/text_ru — ocr, low: «Transfundit pasta venenum.» → [LA] вероятно «pastus» / «pastu» (пища передаёт яд, ср. «Ce repas les empoisonne»); «pasta» сомнительно. Скана текста нет; не уверен
- `v1-52-7-1` — text_fr/motto_fr/text_ru — ocr, high: «Vivindo vici mea fata.» → [LA] «Vivendo vici mea fata» (ср. «En vivant»); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-53-3-1` — text_fr/motto_fr/text_ru — ocr, high: «Incluctabile fatum.» → [LA] «Ineluctabile fatum» (ne → nc); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-53-10-1` — text_fr/motto_fr/text_ru — ocr, high: «Dulces exuvis.» → [LA] «Dulces exuviæ» (Aen. IV 651); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-54-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Sibi mihi libertas.» → [LA] «Sibi mihi» не согласуется с толкованием «Si je puis une fois estre libre…»; вероятно «Si sit mihi libertas» (слито/искажено). Скана текста нет; не уверен
- `v1-55-2-1` — text_fr/motto_fr/text_ru — ocr, medium: «Tacendo impetravi vita.» → [LA] «Tacendo impetravi vitam» (вин. п.); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-55-3-1` — text_fr/motto_fr/text_ru — ocr, low: «Da mi grido mi honor.» → [ES/IT] смесь: исп. «De mi grito mi honor» или ит. «Dal mio grido il mio onore»; ср. итальянизмы в испанских девизах (v1-15-9, v1-37-15). Возможно, орфография издания; не уверен
- `v1-56-9-1` — text_fr/motto_fr/text_ru — ocr, medium: «Amatur terrore pudor.» → [LA] вероятно «Armatur terrore pudor» (роза в шипах: стыдливость вооружена страхом; ср. «se fait craindre»); скопировано и в text_ru. Скана текста нет
- `v1-56-12-1` — text_fr/motto_fr/text_ru — ocr, high: «Ostendit navos non contrahit.» → [LA] «Ostendit nævos, non contrahit» (nævus — пятно; лигатура æ потеряна); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-56-13-1` — text_fr/motto_fr/text_ru — ocr, low: «Virgo ille juventa est.» → [LA] «Virgo ille» не согласуется (ille м. р.); вероятно «Virgo illi juventa est» — искажено; толкование «de ma jeunesse» тоже странно. Скана текста нет; не уверен
- `v1-56-14-1` — text_fr/motto_fr/text_ru — ocr, low: «Segura alos soplos.» → [ES] «Segura a los soplos» (слитное «alos» — вероятно, орфография издания); скопировано и в text_ru. Не уверен
- `v1-57-1-1` — text_fr/motto_fr/text_ru — ocr, low: «Cœli sociat major quam maris.» → [LA] «sociat major» грамматически не связано; по толкованию («Son commerce est plus grand avec le Ciel») вероятно «Cœli societas major quam maris». Скана текста нет; не уверен
- `v1-57-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas cubrido mas seguro.» → [ES] причастие от cubrir — «cubierto»: «Mas cubierto, mas seguro»; возможно, орфография издания. Скана текста нет; не уверен
- `v1-57-13-1` — text_fr/motto_fr/text_ru — ocr, medium: «Mas vejente ningunt.» → [ES] «Mas vigilante ninguno» (ср. «Nul n'est plus vigilant»); «vejente ningunt» — искажение; скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-58-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Esto tien esu remedio y non yo.» → [ES] вероятно «Este tiene su remedio, y no yo» (tien/esu — разрыв/слияние слов, non — итальянизм; ср. v1-55-3); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-59-2-1` — fr/name_fr/text_fr/ru/text_ru — ocr, medium: «Une Barque qui fuit de loin de grands Vaisseaux.» → вероятно «qui suit de loin» (длинное s прочитано как f): девиз «Sequar & attingam» и толкование «Je les suivray & je les joindray» — лодка следует за кораблями, а не бежит от них; на гравюре (v1-57.jpg №2) лодка позади кораблей. П …
- `v1-59-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Pale san lardore.» → [IT] слова слиты/искажены, смысла не дают; возможно «Palesa l'ardore» (обнаруживает жар — для алембика). Скана текста нет; не уверен
- `v1-59-14-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas dulcura che alteza.» → [ES] «Mas dulzura que alteza» (che — итальянизм, ср. v1-37-15; dulcura — вероятно, орфография издания). Скана текста нет; не уверен
- `v1-60-8-1` — text_fr/motto_fr/text_ru — ocr, low: «Ne piu ardente, ne piu fidelle.» → [IT] «Né più ardente, né più fedele» (fidelle — офранцуженное написание; возможно, орфография издания). Не уверен
- `v1-61-1-1` — text_fr/meaning_fr — ocr, low: «Vne seule mé suffit.» → «me suffit» — лишний акцент (mé), вероятно OCR. Перевод верен. Скана текста нет
- `v1-61-3-1` — text_fr/motto_fr/text_ru — ocr, medium: «In flama & pur non arde.» → [IT] «In fiamma, e pur non arde» (fi → f, потеряна буква); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-61-15-1` — text_fr/motto_fr/text_ru — ocr, medium: «Al fuoco solsi rende.» → [IT] «Al fuoco sol si rende» (слияние слов); скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-62-4-1` — text_fr/motto_fr/text_ru — ocr, low: «Deorsum non ovam.» → [LA] «ovam» смысла не даёт; для пламени ожидается что-то вроде «Deorsum nunquam» (никогда вниз); искажено. Скана текста нет; не уверен
- `v1-63-2-1` — text_fr/motto_fr/text_ru — ocr, medium: «Mordendo sanati.» → [LA] «Mordendo sanat» (кусая, исцеляет; ср. «Sa morsure guerit»); «sanati» не согласуется. Скопировано и в text_ru. Скана текста нет; не уверен в точной форме
- `v1-63-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Menos luz, ma vida.» → [ES] «Menos luz, mas vida» (ср. «je vivrois plus long-temps»); ma — итальянизм/потеря s. Скопировано и в text_ru. Скана текста нет — по смыслу
- `v1-63-8-1` — text_fr/motto_fr/text_ru — ocr, high: «Indusum labor illustrat.» → [LA] «Inclusum labor illustrat» (cl → d; ср. «Tout enfermé qu'il est»); скопировано и в text_ru. Скана текста нет — по смыслу

#### mistranslation — 57

- `v1-1-1-1` — ru — mistranslation, low: «Vaisseau en Mer» → заголовок: «Корабль в море» (в порт он только входит; text_ru верно)
- `v1-1-10-1` — ru — mistranslation, low: «Femme maigre coëffée avec des Serpens» → заголовок: «Худая женщина со змеями в волосах» (Зависть — толкование, а не изображение; text_ru верно)
- `v1-1-11-1` — ru/text_ru — mistranslation, medium: «Une Chévre qui est taitée par un jeune Loup.» → tetée (taitée) par un jeune Loup — «которую сосёт волчонок»: коза кормит волка себе на погибель (Sibi damna parat). Заголовок «Коза, вскармливающая волчонка»; text_ru «Коза, которую сосёт молодой волк»
- `v1-3-5-1` — ru — mistranslation, low: «Plante qui produit des Calebaces» → сосуды не наполняются сами — это тыквы сами тянутся к сосудам с водой: «Растение-горлянка, тянущееся к сосудам с водой»
- `v1-6-9-1` — text_ru/meaning_ru — mistranslation, low: «Ne t'y fie, ni ne t'en défie.» → «Не доверяйся ему и не остерегайся его» (Fide & diffide); «вполне», «совсем», «отвергай» — пересказ, а не перевод
- `v1-7-3-1` — text_ru/meaning_ru — mistranslation, low: «Il est juste que les gourmans perissent.» → gourmands — «обжоры, жадные»: «Справедливо, чтобы обжоры погибали» (дефисная двойка «хищные-ненасытные» — следы черновика)
- `v1-7-4-2` — text_ru — mistranslation, low: «Un Faucon qui pointe & fond sur une perdrix.» → pointer (о соколе) — «взмывать, устремляться ввысь», не «высматривать»: «Сокол, который взмывает и падает на куропатку»
- `v1-7-6-1` — text_ru/meaning_ru — mistranslation, low: «Les courageux vont par tout.» → переведён латинский девиз, а не французское толкование: «Смелые проходят повсюду»
- `v1-7-15-1` — text_ru/meaning_ru — mistranslation, low: «Bacchus l'accommode.» → переведён латинский девиз (Cum Baccho melius), а не французское толкование: «Вакх её настраивает / ей к лицу Вакх»
- `v1-8-10-1` — text_ru/meaning_ru — mistranslation, low: «Je vis où les autres meurent.» → переведён латинский девиз, а не французское толкование: «Я живу там, где другие умирают»
- `v1-9-4-1` — ru — mistranslation, medium: «Ours qui attaque des Mouches à» → заголовок перевёрнут: медведь сам нападает на пчёл — «Медведь, нападающий на пчёл» (text_ru верно)
- `v1-9-11-1` — text_ru — mistranslation, low: «Un Champ de Blé prest à couper.» → «сенокос» — о траве, не о хлебе; дефисная двойка — след черновика: «Поле пшеницы, готовое к жатве»
- `v1-10-15-1` — text_ru/meaning_ru — mistranslation, low: «Il a toujours de la vertu.» → переведён латинский девиз (Semper inclita virtus), а не толкование: «В ней всегда есть добродетель / сила»
- `v1-11-6-1` — ru/text_ru — mistranslation, medium: «Une Lunette d'approche sur son genou.» → genou — шарнир (коленчатое крепление) штатива, не колено; на гравюре труба на треноге: «Подзорная труба на шарнирном штативе»
- `v1-11-12-1` — text_ru/meaning_ru — mistranslation, low: «On la connoît en la touchant.» → «по звону» — толкование латинского pulsu; французское: «Его узнают, когда по нему ударят / прикоснувшись к нему»
- `v1-12-6-1` — text_ru/meaning_ru — mistranslation, low: «L'amour nous tuë.» → «безудержная страсть» — из латинского Venus improba; французское: «Любовь нас убивает»
- `v1-15-2-1` — ru/text_ru — mistranslation, low: «Vn Aigle posé avec ce mot.» → «avec ce mot» — «с таким девизом» (mot = девиз, т. е. следующий Fortis à forte), не «со словом рядом»: «Сидящий орёл с таким девизом»
- `v1-16-3-1` — text_ru/meaning_ru — mistranslation, medium: «Si je ne suis pas beau j'ay de la vertu en recompense.» → переведён латинский девиз, а не французское толкование: «Если я не красив, то взамен у меня есть доблесть»
- `v1-16-8-1` — text_ru/meaning_ru — mistranslation, low: «On ne me voit point sans s'en repentir.» → переведён латинский девиз (Nusquam visus impunè); французское: «Меня не видят, не пожалев об этом»
- `v1-17-5-1` — text_ru/meaning_ru — mistranslation, low: «Il y a plus de douceur que d'amertume.» → переведён латинский девиз (Plus mellis quam fellis), а не толкование: «В нём больше сладости, чем горечи»
- `v1-17-14-1` — text_ru/meaning_ru — mistranslation, low: «J'apporte la paix.» → «предвещаю» — из латинского prænuntia; французское: «Я приношу мир»
- `v1-18-13-1` — text_ru/meaning_ru — mistranslation, low: «L'envie fait la Cour à l'integrité.» → integrité — честность, непорочность, не «добродетель»; fait la Cour — «увивается»: «Зависть увивается за честностью»
- `v1-19-14-1` — text_ru/meaning_ru — mistranslation, medium: «Je suis assez fort pour aller seul.» → переведён латинский девиз, а не французское толкование: «Я достаточно силён, чтобы ходить одному»
- `v1-20-8-1` — text_ru/meaning_ru — mistranslation, low: «Il prend chez luy sa recompense.» → переведён латинский девиз (Sibi pulcherrima merces); французское: «Свою награду он находит в самом себе»
- `v1-21-14-1` — text_ru/meaning_ru — mistranslation, low: «C'est pour moy.» → переведён латинский девиз (Hoc mihi usu est); французское: «Это для меня»
- `v1-22-11-1` — text_ru/meaning_ru — mistranslation, low: «Elles ne travaillent qu'à la même chose.» → переведён латинский девиз (Labor omnibus unus); французское: «Они трудятся только над одним и тем же»
- `v1-23-12-1` — text_ru/meaning_ru — mistranslation, low: «Les nuages me dérobent ma lumiere.» → «солнце» — из латинского девиза (solem); французское: «Облака похищают у меня мой свет»
- `v1-24-13-1` — text_ru/meaning_ru — mistranslation, low: «Je r'accommoderay mon travail interrompu.» → «сотку» — из латинского retexam; французское: «Я исправлю свою прерванную работу»
- `v1-25-2-1` — text_ru/meaning_ru — mistranslation, low: «Elle se soustient d'elle-même.» → «собственной массой» — из латинского девиза (Mole sua stat); французское: «Она держится сама собой»
- `v1-26-11-1` — text_ru/meaning_ru — mistranslation, low: «Il recompense les doctes & les braves.» → «венчает» — из латинского coronat; французское: «Он награждает учёных и храбрых»
- `v1-27-4-1` — text_ru/meaning_ru — mistranslation, medium: «Je travaille pour les Autels & pour les Malades, ou je travaille pour Dieu & pour les homm …» → «pour les Malades» — «для больных» (французский читает девиз как ægris — больным), а не «для полей»: «Я тружусь для алтарей и для больных, или: для Бога и для людей»
- `v1-27-12-1` — text_ru/meaning_ru — mistranslation, medium: «Il est plus clair quand il paroist.» → переведён латинский девиз (De carcere clarior exit), а не толкование: «Она ярче, когда появляется»
- `v1-30-1-1` — text_ru/meaning_ru — mistranslation, low: «Sa naissance est modeste, & sa vieillesse honorable.» → «юность» — из латинского juventus; французское: «Его рождение скромно, а старость почтенна»
- `v1-31-15-1` — text_ru/meaning_ru — mistranslation, low: «Il en faut user sobrement.» → en — «им» (вином), не «всем» (обобщение из латинского modus in rebus): «Им следует пользоваться умеренно»
- `v1-34-3-1` — text_ru/meaning_ru — mistranslation, low: «On se ruine quand on attaque un plus fort que soy.» → se ruiner здесь — «губить себя», не «разоряться» (о деньгах): «Губишь себя, нападая на того, кто сильнее тебя»
- `v1-34-5-1` — text_ru/meaning_ru — mistranslation, low: «C'est l'épreuve de la fidelité.» → «истинное свидетельство» — из латинского vera notitia; французское: «Это проверка верности»
- `v1-35-14-1` — text_ru/meaning_ru — mistranslation, low: «L'arbre croît, & l'amour naît.» → «разгорается» — из латинского gliscit ardor; французское: «Дерево растёт, и любовь рождается»
- `v1-37-2-1` — text_ru/meaning_ru — mistranslation, low: «Je ne me soucie pas de disparoistre pourveu que j'aye brulé.» → «сиять» — из латинского luceam; французское brulé — «гореть»: «…лишь бы я успела сгореть / погореть»
- `v1-38-12-1` — text_ru/meaning_ru — mistranslation, low: «Ma durée est dans ma bonté.» → «жизнь» — из итальянского vita; французское durée: «Моя долговечность — в моих достоинствах (доброте)»
- `v1-39-4-1` — text_ru/meaning_ru — mistranslation, low: «Il annonce le printemps.» → переведён латинский девиз (Renovatum nuntiat annum); французское: «Он возвещает весну»
- `v1-40-9-1` — ru/text_ru — mistranslation, low: «Une Cavale toute nuë sans selle & sans bride, & courant.» → toute nuë о лошади — «неосёдланная, без сбруи», «нагая» звучит нелепо: «Кобылица без всякой сбруи, без седла и без узды, скачущая»
- `v1-44-1-1` — text_ru/meaning_ru — mistranslation, low: «Ces choses ne me briseront pas.» → «не повредит» — из латинского nocent; французское: «Это меня не сломит»
- `v1-47-5-1` — text_ru/meaning_ru — mistranslation, medium: «La bonté de Dieu nous rend joyeux.» → «дарит нам этот досуг» — из латинского девиза (Deus nobis hæc otia fecit); французское: «Благость Божья делает нас радостными»
- `v1-49-3-1` — text_ru/meaning_ru — mistranslation, low: «Double assurance.» → assurance здесь — «защита, безопасность» (ср. Securitas altera): «Двойная защита»
- `v1-50-5-1` — text_ru/meaning_ru — mistranslation, low: «Je vis de ce qui m'est contraire.» → contraire — «противоположное, враждебное», не «противно» (отвратительно): «Я живу тем, что мне противоположно»
- `v1-51-6-1` — text_ru/meaning_ru — mistranslation, low: «C'est une temerité que cet insulte.» → insulte (м. р., XVII в.) — «нападение, натиск», ср. «un enfant armé qui l'attaque»: «Это нападение — безрассудство»
- `v1-51-15-1` — ru/text_ru — mistranslation, low: «qui le quitte pour aller prendre un Mouton qu'il manque.» → qu'il manque — «которого он упускает» (промахивается), а не «ускользающей»: «…бросает её, чтобы схватить барана/овцу, и упускает его»
- `v1-55-1-1` — text_ru/meaning_ru — mistranslation, low: «Il a seul toute mon amour.» → перевод латинского девиза, а не французского толкования: «Он один владеет всей моей любовью»
- `v1-55-5-1` — text_ru/meaning_ru — mistranslation, low: «La societé n'est bonne que parmy ses semblables.» → перевод латинского девиза (Dissimilium infida societas), а не французского толкования: «Общество хорошо лишь среди себе подобных»
- `v1-56-10-1` — text_ru/meaning_ru — mistranslation, low: «Sa fuite le rend plus beau.» → fuite — «бегство» (ср. лат. fuga), не «полёт»: «Бегство делает его прекраснее»
- `v1-57-2-1` — text_ru/meaning_ru — mistranslation, low: «Il n'est rien de plus ardant.» → ardant (ardent) — «пылающий, жгучий», не «яростный» (оттенок из лат. vehementior): «Нет ничего более пылающего / жгучего»
- `v1-61-4-1` — text_ru/meaning_ru — mistranslation, medium: «J'éleve ou je consomme.» → глаголы переходные, говорит Солнце: élever — «возвышать», consommer (consumer) — «сжигать, истреблять»: «Я возвышаю или сжигаю»
- `v1-61-6-1` — text_ru/meaning_ru — mistranslation, low: «Vn même penchant nous unit.» → penchant — игра слов «наклон / склонность»; «наклон» теряет любовный смысл: «Нас соединяет одна склонность»
- `v1-63-10-1` — text_ru/meaning_ru — mistranslation, low: «Elle paroist plus grande estant tombée.» → пересказ латинского девиза; французское толкование: «Упав, она кажется больше»
- `v1-63-14-1` — ru/text_ru — mistranslation, medium: «Une Pyramide dans la mer batuë des flos & des vents.» → batuë des flots — страдательный оборот («битая волнами»), пирамида неподвижна: «Пирамида в море, которую бьют волны и ветры»
- `v1-63-14-2` — text_ru/meaning_ru — mistranslation, medium: «Je suis en vain batuë de toutes parts.» → тот же страдательный оборот: «Меня тщетно бьют со всех сторон»
- `v1-63-15-1` — text_ru/meaning_ru — mistranslation, low: «On se repentira de m'attaquer dans mon repos.» → перевод латинского девиза, а не французского толкования: «Пожалеет тот, кто нападёт на меня, пока я в покое»

#### addition — 39

- `v1-3-5-2` — text_ru/meaning_ru — addition, low: «Elles le font naturellement.» → «без наставника» — из девиза, в толковании нет: «Они делают это сами по природе»; не уверен, что это нужно править
- `v1-4-14-1` — text_ru/meaning_ru — addition, low: «Privo dite moriro.» → в оригинале толкования нет (meaning_fr пуст), RU добавил перевод итальянского девиза третьим абзацем. Перевод верен по смыслу (Privo di te morirò), но это добавка; пометить как перевод девиза или убрать. Не уверен, что нужно прави …
- `v1-4-15-1` — text_ru/meaning_ru — addition, low: «non may ingrata.» → толкования в оригинале нет (meaning_fr пуст), RU добавил перевод девиза; к тому же ingrata — жен. р.: «Никогда не бываю неблагодарной». Пометить как перевод девиза или убрать; не уверен, что нужно править
- `v1-5-4-1` — text_ru — addition, high: «Une Harpe.» → «Без строя — нет гармонии» в оригинале нет (первый абзац — только «Une Harpe.»): «Арфа.»
- `v1-5-11-1` — ru — addition, low: «Olivier chargé d'un sep de vigne» → «привитой» в оригинале нет (chargé — «обременённая, обвитая»): «Маслина, обвитая виноградной лозой» (ср. девиз Non conveniunt)
- `v1-7-4-1` — text_ru/meaning_ru — addition, medium: «Il faut nous contenter de ce qui nous est destiné.» → «То, что выше нас, нас не касается;» — перевод латинского девиза, вставленный во французское толкование: «Нужно довольствоваться тем, что нам предназначено.»
- `v1-7-12-1` — text_ru — addition, low: «Vn Renard qui tient la teste d'une statuë humaine.» → «в пасти» в оригинале нет: «Лис, держащий голову человеческой статуи»
- `v1-8-6-1` — text_ru/meaning_ru — addition, medium: «Elle a servy à beaucoup de victoires.» → «Скольких чудовищ она одолела —» — перевод латинского девиза, вставленный в толкование: «Она послужила многим победам.»
- `v1-8-12-1` — text_ru/meaning_ru — addition, high: «Vn Niveau, ny çà, ny là.» → служебная заглушка переводчика: во французском один абзац, meaning_fr пуст — второй абзац text_ru и meaning_ru удалить (пустая строка)
- `v1-9-13-1` — ru — addition, low: «Coq sur une Trompette» → «боевой» в оригинале нет: «Петух на трубе» (text_ru верно)
- `v1-10-6-1` — text_ru/meaning_ru — addition, medium: «A force de se froter, le feu en sort.» → «Сила рождается от силы:» — перевод латинского девиза (Vim ex vi), вставленный в толкование: «От трения возникает огонь»
- `v1-12-2-1` — text_ru/meaning_ru — addition, low: «Il se renouvelle.» → «сбросив старую кожу» — из латинского девиза (positis exuviis), во французском нет: «Она обновляется»
- `v1-12-3-1` — text_ru/meaning_ru — addition, medium: «Elle a tous ses feux.» → «Прометей ничего у неё не отнял:» — перевод латинского девиза, вставленный в толкование: «Все её огни при ней»
- `v1-12-15-1` — text_ru/meaning_ru — addition, medium: «La vertu croist toûjours.» → «не знает убывания,» — перевод латинского девиза, вставленный в толкование: «Добродетель всегда растёт»
- `v1-14-2-1` — text_ru/meaning_ru — addition, medium: «La prudence les fait voir de tous côtez.» → «Осторожные люди:» — перевод латинского девиза (Prudentes), вставленный в толкование: «Благоразумие заставляет их видеть со всех сторон»
- `v1-14-5-1` — text_ru/meaning_ru — addition, medium: «Heureux si nous pouvions trouver de pareils amis.» → «Да сохранится такая любовь;» — перевод латинского девиза (Talis amor teneat), вставленный в толкование: «Счастливы были бы мы, найдя подобных друзей»
- `v1-15-13-1` — text_ru/meaning_ru — addition, medium: «Elle est au dessus du hazard.» → «он не боится фортуны» — перевод латинского девиза, вставленный в толкование: «Он выше случая»
- `v1-15-14-1` — text_ru/meaning_ru — addition, low: «On ne le cüeille point sans travail.» → «и горечи» — из латинского девиза (amaritudine), во французском только travail: «Его не срывают без труда»
- `v1-16-2-1` — text_ru/meaning_ru — addition, low: «Il nous met à couvert du mauvais temps.» → «— летом и зимой» — из латинского девиза, во французском нет: «Он укрывает нас от непогоды»
- `v1-16-10-2` — text_ru/meaning_ru — addition, low: «Elle deffend sa maison avec ses armes.» → «жалом-» — из латинского mucrone, дефисная двойка: «Она защищает свой дом своим оружием»
- `v1-16-12-1` — text_ru/meaning_ru — addition, medium: «Il sçait se deffendre.» → «Он отражает летящие стрелы и» — перевод латинского девиза, вставленный в толкование: «Он умеет защищаться»
- `v1-17-7-1` — text_ru/meaning_ru — addition, low: «Entreprenez quelque chose de grand.» → «достойное и» — из латинского девиза (dignum), во французском только grand: «Предпримите что-нибудь великое»
- `v1-17-15-1` — text_ru/meaning_ru — addition, low: «Elle sort plus freche & plus gaye.» → «Погружаясь,» — из латинского девиза (Dum mergitur), во французском нет: «Она выходит более свежей и бодрой»
- `v1-18-2-1` — text_ru/meaning_ru — addition, low: «Il est tout fier de resister aux vents.» → «что неподвижен и» — из латинского immota, во французском нет: «Он весь горд тем, что противостоит ветрам»
- `v1-18-8-1` — text_ru/meaning_ru — addition, medium: «Il faut le ployer & non pas le rompre.» → «покорностью, а не силой» — перевод латинского девиза (Obsequio non vi), вставленный в толкование: «Его нужно сгибать, а не ломать»
- `v1-18-9-1` — meaning_ru — addition, low: «Virescit vulnere virtus.» → во французском толкования нет (meaning_fr пуст, text_fr из двух абзацев) — meaning_ru переводит латинский девиз; перевод верен, но это добавление. Возможно, толкование потеряно в самом text_fr — проверить по изданию
- `v1-18-15-1` — text_ru/meaning_ru — addition, low: «Je repousse aprés avoir esté blessé.» → «поражён и» — двойка, во французском только blessé: «Я вновь отрастаю после того, как был ранен»
- `v1-19-11-1` — text_ru/meaning_ru — addition, medium: «Il vaut mieux étant vieux.» → «и достоин похвалы в старости» — перевод латинского девиза (Non illaudata senectus), вставленный в толкование: «Старея, он становится лучше»
- `v1-20-10-1` — text_ru/meaning_ru — addition, low: «Il chante ou du moins il annonce sa mort & celle des autres.» → «для себя и для мира» — из латинского девиза (Sibi canit & orbi), во французском нет: «Он поёт или по крайней мере возвещает свою смерть и смерть других»
- `v1-23-9-2` — text_ru/meaning_ru — addition, low: «Il se joüe aprés l'orage.» → «на волнах» — из латинского девиза, во французском нет: «Оно резвится после бури»
- `v1-24-11-1` — text_ru/meaning_ru — addition, low: «Ce n'est pas pour elle qu'elle sonne.» → «одного» — из латинского uni; французское: «Он звонит не для себя»
- `v1-26-14-1` — text_ru/meaning_ru — addition, low: «Elle se consomme dans la guerre.» → «но» — из латинского sed, во французском противопоставления нет: «Он сгорает на войне»
- `v1-27-15-1` — text_ru/meaning_ru — addition, low: «La vertu ne craint rien.» → «Благородная» — из латинского generosa, во французском нет: «Доблесть ничего не боится»
- `v1-28-13-1` — text_ru/meaning_ru — addition, low: «Je ne cherche que la justice.» → «прямое и» — из испанского девиза (retto), во французском только justice: «Я ищу только справедливости»
- `v1-41-1-1` — text_ru/meaning_ru — addition, low: «Il menace & n'a point peur.» → «бедой» — из латинского damnum, во французском нет: «Он грозит и ничего не боится»
- `v1-42-14-1` — text_ru/meaning_ru — addition, low: «Jusqu'à ce qu'on me lâche.» → «на врага» — из латинского in hostem, во французском нет: «Пока меня не спустят»
- `v1-44-13-1` — text_ru/meaning_ru — addition, low: «Il y restera tant que je vivray.» → «и помню себя» — из латинского memor ipse mei, во французском нет: «Он останется там, пока я жив»
- `v1-48-6-1` — text_ru/meaning_ru — addition, low: «Mon odeur en est plus douce.» → «От противоположности» — из латинского девиза (Per opposita), во французском нет: «Мой запах от этого становится слаще»
- `v1-52-6-1` — text_ru/meaning_ru — addition, low: «La vertu m'a élevée.» → «к небесам» — из латинского ad æthera; во французском толковании нет: «Доблесть возвысила меня»

#### typo — 3

- `v1-3-6-1` — text_ru/meaning_ru — typo, medium: «Toute sorte de chair,» → опечатка/несогласование: «Всякая плоть, то есть вся человеческая красота, подобна мне и есть лишь сено» (c'est à dire передать как пояснение)
- `v1-31-6-1` — ru/text_ru — typo, medium: «Un Laurier soutenant un Sep de vigne.» → тавтология «лозу виноградной лозы»: «Лавр, поддерживающий виноградную лозу»
- `v1-36-6-1` — text_ru/meaning_ru — typo, medium: «Si j'endommage je recompense.» → «вредлю» — несуществующая форма: «Если я наношу ущерб, то и вознаграждаю»

#### name — 12

- `v1-1-15-1` — ru/text_ru — name, low: «Un Loup qui veut devorer un Chevreüil,» → chevreuil — косуля, не оленёнок: «Волк, бросающий косулю ради барана» / «…сожрать косулю…»
- `v1-2-3-1` — ru/text_ru — name, low: «Une Epine blanche, avec un Arc en Ciel au dessus.» → épine blanche — боярышник, не шиповник: «Боярышник с радугой» / «Боярышник, над которым радуга»
- `v1-3-3-1` — ru/text_ru — name, medium: «Une Herbe nommée Anjoubarde,» → Anjoubarde = joubarbe — молодило (живучка, «заячья капуста»), его и сажали на крыши: «Трава, называемая молодилом…» / «Молодило на крыше»
- `v1-11-15-1` — ru/text_ru — name, medium: «Vne Force à tondre des draps, sur une piéce de drap.» → forces à tondre — стригальные (суконные) ножницы, не ворсовальная шишка (это chardon); заголовок неверен по предмету, в text_ru «ворсовальные» лишнее: «Суконные ножницы на куске сукна»
- `v1-15-11-1` — ru — name, low: «Branche de Rosier avec une rose» → rosier — розовый куст, не шиповник: «Ветка розового куста с розой» (text_ru верно)
- `v1-27-13-1` — ru/text_ru — name, medium: «Vn fusil frapé d'un Caillou.» → fusil — огниво (стальное кресало), caillou — кремень; в переводе предметы спутаны: «Огниво, по которому бьют кремнём»
- `v1-45-5-1` — ru/text_ru — name, medium: «Une branche d'Olives qui entoure une masse d'armes.» → masse d'armes — булава (палица), не «связка оружия»; на гравюре (v1-45 №5) ветвь обвивает булаву: заголовок и text_ru «Оливковая ветвь, обвивающая булаву»
- `v1-49-5-1` — ru/text_ru — name, medium: «Un Fusil sur une pierre, qui jette du feu.» → fusil — огниво (стальное кресало), не кремень (ср. v1-27-13): «Огниво на камне, высекающее огонь»
- `v1-52-14-1` — ru/text_ru — name, medium: «Deux mains qui tiennent, l'une une pierre, l'autre un fusil & faisant du feu.» → fusil — огниво (кресало), не кремень (ср. v1-27-13, v1-49-5); иначе выходит «камень и кремень»: «…одна камень, другая огниво…»
- `v1-54-12-1` — ru/text_ru — name, low: «Une Carabine ou arme à feu bandée.» → carabine — карабин, не мушкет; «ou arme à feu» опущено: «Карабин, или взведённое огнестрельное оружие»
- `v1-54-13-1` — ru/text_ru — name, low: «une masse de Chancelier» → masse — булава (церемониальная), не жезл; повтор «жезл… жезл» стирает различие: «Маршальский жезл Франции и булава канцлера»
- `v1-62-13-1` — ru/text_ru — name, medium: «Un Amour qui bat le fusil.» → battre le fusil — бить огнивом (стальным кресалом) о кремень; fusil — огниво, не кремень (ср. v1-27-13, v1-49-5, v1-52-14): «Амур, высекающий огонь огнивом»

#### omission — 5

- `v1-8-12-2` — text_fr/motto_fr — omission, low: «Vn Niveau, ny çà, ny là.» → разбивка: «ny çà, ny là» («ни туда, ни сюда»), вероятно, — девиз/толкование, слитый с описанием; motto_fr пуст. Скана текста нет — проверить по изданию; не уверен
- `v1-14-6-1` — text_ru — omission, low: «Vne Borne ou bute de terre dans un Carrefour, avec une tête de Mercure dessus.» → пропущено «ou bute de terre»: «Межевой столб, или земляной холмик, на перекрёстке, с головой Меркурия наверху»
- `v1-20-11-1` — text_ru/meaning_ru — omission, medium: «Mon innocence ne craint point la foudre.» → переведён латинский девиз; пропущено «Mon innocence»: «Моя невинность не страшится молнии»
- `v1-26-4-1` — text_fr/motto_fr/meaning_fr — omission, low: «Un Lion vaillant & veillant.» → разбивка: только описание, девиза и толкования нет (motto_fr, meaning_fr пусты), в отличие от соседних эмблем; возможно, потеряны при извлечении текста. Перевод того, что есть, верен. Скана текста нет; не уверен
- `v1-60-2-1` — text_fr/motto_fr/text_ru — omission, low: «Decoris, roboris & custod... [illegible]» → девиз оборван в источнике извлечения («custod…» — вероятно custodiæ); нужно сверить с изданием и дописать в оригинал и перевод. Скана текста нет

### Часть 2, медальоны — 10

#### ocr — 3

- `v2-3-1-1` — fr/name_fr/text_fr/meaning_fr/ru/text_ru/meaning_ru — ocr, high: «AMI HEUREUX» → на медальоне (кроп v2-3-1.jpg) подпись «AME HEUREUSE» (перенос «AME HEVR / EVSE»); фигура — крылатая женщина. Читать «AME HEUREUSE», перевод — «Счастливая душа». Подтверждено сканом
- `v2-125-4-1` — fr/name_fr/text_fr/meaning_fr — ocr, medium: «LEVSNE» → на медальоне «IEVSNE» = JEUSNE (jeûne, «пост»; I/J и V/U — старая графика); первая буква прочитана как L. Фигура с рыбой/крокодилом — аллегория Поста. Читать «IEVSNE» (JEUSNE)
- `v2-139-2-1` — fr/name_fr/text_fr/meaning_fr — ocr, high: «AMOUR VERS TA PATRIE» → на медальоне «AMOUR VERS / SA PATRIE» (S прочитано как T). Читать «AMOUR VERS SA PATRIE». Перевод «Любовь к отечеству» верен. Подтверждено сканом

#### mistranslation — 5

- `v2-102-7-1` — ru/text_ru/meaning_ru — mistranslation, medium: «REFORMATION» → в аллегорическом словаре REFORMATION — «исправление, преобразование (нравов)», а не историческая Реформация; тот же заголовок в v2-18-15 переведён «Исправление». Предлагается «Исправление (нравов)» — единообразно с v2-18-15
- `v2-115-5-1` — ru/text_ru/meaning_ru — mistranslation, low: «OECONOMIE» → OECONOMIE (аллегория Oeconomia) — «домоводство, управление хозяйством»; «экономия» по-русски читается как «бережливость»: «Домоводство (хозяйствование)»
- `v2-117-5-1` — ru/text_ru/meaning_ru — mistranslation, low: «HOROGRAPHIE» → калька; HOROGRAPHIE — искусство построения (солнечных) часов, по-русски «гномоника»: «Гномоника (искусство солнечных часов)»
- `v2-129-10-1` — ru/text_ru/meaning_ru — mistranslation, medium: «ERASTO» → на медальоне действительно «ERASTO», но это Эрато — муза любовной поэзии (женская фигура со струнным инструментом и Амуром; в той же серии EUTERPE, POLYMNIE, CALLIOPEE). Перевод с догадкой в скобках: «Эрато (муза любовной поэзии)» …
- `v2-152-7-1` — ru/text_ru/meaning_ru — mistranslation, low: «EMBUCHE» → embûche — «засада, ловушка» (фигура с сетью и щитом), не «коварство»: «Засада (ловушка)»

#### addition — 2

- `v2-125-4-2` — ru/text_ru/meaning_ru — addition, high: «LEVSNE» → в поле перевода оставлена служебная пометка переводчика с сомнением; значение однозначно — jeûne. Должно быть просто «Пост»
- `v2-149-9-1` — ru/text_ru/meaning_ru — addition, low: «BEATI CONFREGIT» → в переводе — догадка переводчика в квадратных скобках; латинская подпись (как на гравюре «BEATI CON / FREGIT») неполна и неграмматична (confregit — «сокрушил/преломил»). Убрать служебную скобку либо дать буквально «Блаженны… сокру …

### Часть 2, монограммы — 11

#### typo — 10

- `v2-3-6-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «AE» → «AF» — по алфавитной последовательности (AD, AE, [AF], AG) и полному набору пар; на гравюре также «AE» (опечатка издания). Подтверждено сканом подписи; само чтение вензеля как AF не проверялось
- `v2-64-3-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «IMP» → «IMR» — по последовательности (IMQ, [IMR], IMS) и отсутствию IMR в наборе; на гравюре также «IMP» (опечатка издания). Подпись сверена со сканом; чтение самого вензеля не проверялось
- `v2-66-4-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «MRT» → «MPT» — по последовательности (MPS, [MPT], MPV) и полному набору; на гравюре также «MRT» (опечатка издания). Подпись сверена со сканом
- `v2-92-2-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «QYZ» → «QXZ» — по ряду QXY, [QXZ], RYZ и отсутствию QXZ в наборе; на гравюре также «QYZ» (опечатка издания). Подпись сверена со сканом; чтение вензеля не проверялось
- `v2-92-6-1` — fr/name_fr/text_fr/ru/text_ru — typo, low: «SYZ» → вероятно «SZA» — по закономерности ряда (QXY, [QXZ], RYZ, [SZA]) и повтору SYZ; на гравюре «SYZ». Не уверен: возможно, гравёр сознательно не стал делать переход через конец алфавита
- `v2-130-5-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «EQR» → «FQR» — по ряду [FQR], [FQS], FQT и отсутствию FQR в наборе; на гравюре «EQR». Подпись сверена со сканом; чтение вензеля не проверялось
- `v2-130-6-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «EQS» → «FQS» — по ряду и отсутствию FQS в наборе; на гравюре «EQS»
- `v2-130-8-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «FQY» → «FQV» — по ряду FQT, [FQV], FQX и отсутствию FQV в наборе; на гравюре «FQY»
- `v2-132-8-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «MXZ» → «MYZ» — по ряду LXZ, [MYZ], NZA и отсутствию MYZ в наборе; на гравюре «MXZ»
- `v2-150-14-1` — fr/name_fr/text_fr/ru/text_ru — typo, medium: «GXZ» → «GYZ» — по ряду FXZ, [GYZ] и отсутствию GYZ в наборе; на гравюре «GXZ». Подпись сверена со сканом; чтение вензеля не проверялось

#### omission — 1

- `v2-67-4-1` — fr/name_fr/text_fr/ru/text_ru — omission, medium: «[illegible]» → «ORV — реконструкция по ряду, подписи на гравюре нет»: по последовательности ORT, [ORV], ORX и отсутствию ORV во всей части; в fr/name_fr/text_fr и ru/text_ru вместо «[illegible]» / «[неразборчиво]» поставить «ORV» с пометкой, что …

### Часть 3 (картуши) — 2

#### mistranslation — 2

- `v3-6-ii-1` — text_ru — mistranslation, low: «surmonté d'un lapin» → lapin — «кролик», не «заяц» (lièvre): «увенчанный кроликом»
- `v3-17-i-1` — text_ru — mistranslation, medium: «surmonté d'un oiseau échassier» → «oiseau échassier» — голенастая (болотная) птица; «птица-брод» — не существующее слово (калька): «увенчанный голенастой птицей»

## Проблемы разбивки текста

С отдельным issue_id:

- `v1-8-12-1` — text_ru/meaning_ru — addition, high: «Vn Niveau, ny çà, ny là.» → служебная заглушка переводчика: во французском один абзац, meaning_fr пуст — второй абзац text_ru и meaning_ru удалить (пустая строка)
- `v1-8-12-2` — text_fr/motto_fr — omission, low: «Vn Niveau, ny çà, ny là.» → разбивка: «ny çà, ny là» («ни туда, ни сюда»), вероятно, — девиз/толкование, слитый с описанием; motto_fr пуст. Скана текста нет — проверить по изданию; не уверен
- `v1-26-4-1` — text_fr/motto_fr/meaning_fr — omission, low: «Un Lion vaillant & veillant.» → разбивка: только описание, девиза и толкования нет (motto_fr, meaning_fr пусты), в отличие от соседних эмблем; возможно, потеряны при извлечении текста. Перевод того, что есть, верен. Скана текста нет; не уверен
- `v1-60-2-1` — text_fr/motto_fr/text_ru — omission, low: «Decoris, roboris & custod... [illegible]» → девиз оборван в источнике извлечения («custod…» — вероятно custodiæ); нужно сверить с изданием и дописать в оригинал и перевод. Скана текста нет
- `v1-4-14-1` — text_ru/meaning_ru — addition, low: «Privo dite moriro.» → в оригинале толкования нет (meaning_fr пуст), RU добавил перевод итальянского девиза третьим абзацем. Перевод верен по смыслу (Privo di te morirò), но это добавка; пометить как перевод девиза или убрать. Не уверен, что нужно прави …
- `v1-4-15-1` — text_ru/meaning_ru — addition, low: «non may ingrata.» → толкования в оригинале нет (meaning_fr пуст), RU добавил перевод девиза; к тому же ingrata — жен. р.: «Никогда не бываю неблагодарной». Пометить как перевод девиза или убрать; не уверен, что нужно править
- `v1-18-9-1` — meaning_ru — addition, low: «Virescit vulnere virtus.» → во французском толкования нет (meaning_fr пуст, text_fr из двух абзацев) — meaning_ru переводит латинский девиз; перевод верен, но это добавление. Возможно, толкование потеряно в самом text_fr — проверить по изданию
- `v2-67-4-1` — fr/name_fr/text_fr/ru/text_ru — omission, medium: «[illegible]» → «ORV — реконструкция по ряду, подписи на гравюре нет»: по последовательности ORT, [ORV], ORX и отсутствию ORV во всей части; в fr/name_fr/text_fr и ru/text_ru вместо «[illegible]» / «[неразборчиво]» поставить «ORV» с пометкой, что …

Слитые и разорванные слова в оригинале (ocr, 18): `v1-4-14-2`, `v1-7-9-1`, `v1-15-11-2`, `v1-15-15-1`, `v1-24-15-1`, `v1-25-6-1`, `v1-27-6-1`, `v1-27-8-1`, `v1-31-3-1`, `v1-33-9-1`, `v1-33-15-1`, `v1-42-2-1`, `v1-45-13-1`, `v1-49-8-1`, `v1-56-14-1`, `v1-58-6-1`, `v1-59-12-1`, `v1-61-15-1` — например «Epiace» = «E piace», «Gio vane» = «Giovane», «ferax que» = «feraxque», «Ad me delam» = «Ad medelam». Подробности — в списке выше.

Без отдельного issue_id (данные, не перевод):

- Заголовки `fr`/`name_fr` в начале части 1 (86 записей, v1-1-1…v1-15-13) — укороченное начало описания, у части из них (не меньше 35) обрыв посреди фразы на служебном слове («Homme qui se fait traîner dans», «Faucon qui pointe & fond sur»). Начиная с v1-16 заголовки полные. Перевод `ru` дан по полному описанию.
- В 9 записях части 1 (v1-19-1, v1-19-8, v1-20-3, v1-21-2, v1-22-8, v1-24-14, v1-28-1, v1-30-9, v1-31-12) `fr` обрезан ровно на 80 символах, а `name_fr` полный.
- Абзацев в `text_ru` больше, чем в `text_fr`, у 3 записей: v1-4-14, v1-4-15, v1-8-12 (в переводе добавлено толкование или заглушка; см. issue выше).
- Девиз и толкование продублированы: девиз — в `text_fr` §2 и `motto_fr`, толкование — в последнем абзаце `text_fr`/`text_ru` и в `meaning_fr`/`meaning_ru`. В замечаниях указаны оба поля.

## Подписи к гравюрам

Замечаний с полями caption_* — 0: подписей, которые нужно выносить отдельно из-за расхождения с заголовком (как в alciato), в verrien не найдено. Новых подписей не придумывалось. Ниже — где сейчас стоят подписи, по типам записей; предлагается со временем завести поля caption_orig / caption_ru (и caption_source), а текущие абзацы не удалять.

| Записи | Текущий текст подписи в переводе | Позиция в `text_ru` | caption_source | Предложение |
|---|---|---|---|---|
| Часть 1, девиз и толкование в `text_ru` (844; в т. ч. v1-4-14, v1-4-15, где толкование добавлено только в переводе) | девиз скопирован без перевода, как в оригинале (напр. v1-1-8 «Defidia.») | середина (§2 из 3) | text (набранный девиз; при сверке досок части 1 надписей в кружках не отмечено) | caption_orig = `motto_fr`; caption_ru — перевод девиза (сейчас его нет нигде, кроме случаев, когда он «протёк» в толкование, см. следующий раздел) |
| Часть 1, девиз без толкования (30) | девиз без перевода | конец (§2 из 2) | text | то же |
| Часть 1, исключения (2): v1-17-1, v1-60-2 | v1-17-1: французский девиз переведён («Когда Бог пожелает.»); v1-60-2: девиз оборван, «[неразборчиво]» (issue v1-60-2-1) | конец (§2 из 2) | text | caption_orig = `motto_fr`; caption_ru = нынешний §2 |
| Часть 2, медальоны (248) | перевод выгравированного названия (напр. v2-3-1 «Счастливый друг») | весь текст (единственный абзац; начало = конец) | engraving | caption_orig — подпись как на гравюре (с переносом и старой графикой: «AME HEVR / EVSE»); caption_ru = нынешний `text_ru` |
| Часть 2, монограммы (2062) | те же буквы, что в оригинале | весь текст | engraving | caption_orig = буквы гравюры; caption_ru не нужен |
| Часть 3 (34) | — (надписей на картушах нет) | — | — | — |

Где выгравированная подпись расходится с данными (issue заведён, правка — в поля подписи и заголовка):

- `v2-3-1-1` — fr/name_fr/text_fr/meaning_fr/ru/text_ru/meaning_ru — ocr, high: «AMI HEUREUX» → на медальоне (кроп v2-3-1.jpg) подпись «AME HEUREUSE» (перенос «AME HEVR / EVSE»); фигура — крылатая женщина. Читать «AME HEUREUSE», перевод — «Счастливая душа». Подтверждено сканом
- `v2-125-4-1` — fr/name_fr/text_fr/meaning_fr — ocr, medium: «LEVSNE» → на медальоне «IEVSNE» = JEUSNE (jeûne, «пост»; I/J и V/U — старая графика); первая буква прочитана как L. Фигура с рыбой/крокодилом — аллегория Поста. Читать «IEVSNE» (JEUSNE)
- `v2-139-2-1` — fr/name_fr/text_fr/meaning_fr — ocr, high: «AMOUR VERS TA PATRIE» → на медальоне «AMOUR VERS / SA PATRIE» (S прочитано как T). Читать «AMOUR VERS SA PATRIE». Перевод «Любовь к отечеству» верен. Подтверждено сканом
- `v2-129-10-1` — ru/text_ru/meaning_ru — mistranslation, medium: «ERASTO» → на медальоне действительно «ERASTO», но это Эрато — муза любовной поэзии (женская фигура со струнным инструментом и Амуром; в той же серии EUTERPE, POLYMNIE, CALLIOPEE). Перевод с догадкой в скобках: «Эрато (муза любовной поэзии)» …

Особенности гравюр, которые данные повторяют верно (не issue), — см. «Особенности издания и гравюр»; подписи монограмм — в разделе «Вторая часть: монограммы».

## Толкование переведено по девизу, а не по французскому тексту

Самая частая ошибка перевода части 1: русское толкование (последний абзац `text_ru` и `meaning_ru`) переводит латинский (реже итальянский/испанский) девиз, а не французское толкование Верьена. Всего 67 issue_id из 210 в части 1.

| Вид | Сколько | issue_id |
|---|---|---|
| Толкование заменено переводом девиза | 18 | v1-7-6-1, v1-7-15-1, v1-8-10-1, v1-10-15-1, v1-16-3-1, v1-16-8-1, v1-17-5-1, v1-19-14-1, v1-20-8-1, v1-20-11-1, v1-21-14-1, v1-22-11-1, v1-27-12-1, v1-39-4-1, v1-55-1-1, v1-55-5-1, v1-63-10-1, v1-63-15-1 |
| Перевод девиза вставлен перед толкованием («Сила рождается от силы: от трения возникает огонь») | 11 | v1-7-4-1, v1-8-6-1, v1-10-6-1, v1-12-3-1, v1-12-15-1, v1-14-2-1, v1-14-5-1, v1-15-13-1, v1-16-12-1, v1-18-8-1, v1-19-11-1 |
| В толкование попали слова или оттенки из девиза («сбросив старую кожу», «на врага», «к небесам») | 35 | v1-3-5-2, v1-11-12-1, v1-12-2-1, v1-12-6-1, v1-15-14-1, v1-16-2-1, v1-16-10-2, v1-17-7-1, v1-17-14-1, v1-17-15-1, v1-18-2-1, v1-20-10-1, v1-23-9-2, v1-23-12-1, v1-24-11-1, v1-24-13-1, v1-25-2-1, v1-26-11-1, v1-26-14-1, v1-27-15-1, v1-28-13-1, v1-30-1-1, v1-31-15-1, v1-34-5-1, v1-35-14-1, v1-37-2-1, v1-38-12-1, v1-41-1-1, v1-42-14-1, v1-44-1-1, v1-44-13-1, v1-47-5-1, v1-48-6-1, v1-52-6-1, v1-57-2-1 |
| Толкования во французском нет, а в `meaning_ru` добавлен перевод девиза | 3 | v1-4-14-1, v1-4-15-1, v1-18-9-1 |

Предложение: толкование переводить только по французскому `meaning_fr`, а перевод девиза держать отдельно (caption_ru, см. «Подписи к гравюрам»).

### Девиз без толкования и толкование без девиза (особенность издания, не ошибка)

По решению пользователя это не issue: в издании у части кружков есть только девиз или только толкование. Ранее заведённые 8 замечаний (v1-49-6, v1-52-2, v1-53-12, v1-53-13, v1-56-2, v1-56-4, v1-58-7, v1-58-11) сняты. Полный список — `motto_gloss_pattern.csv`: 101 записей части 1, из них толкование без девиза — 67, девиз без толкования — 34. Список сверен с данными (`motto_fr`/`meaning_fr`) — совпадает.

- Толкование без девиза (67): v1-4-4, v1-4-13, v1-13-1, v1-13-3, v1-13-5, v1-13-7, v1-13-9, v1-13-11, v1-13-14, v1-18-5, v1-18-7, v1-18-11, v1-18-14, v1-29-15, v1-32-3, v1-35-7, v1-35-13, v1-39-5, v1-40-5, v1-40-6, v1-44-2, v1-44-4, v1-44-8, v1-44-10, v1-44-12, v1-44-14, v1-47-10, v1-47-12, v1-47-14, v1-48-2, v1-48-4, v1-49-12, v1-49-14, v1-53-14, v1-58-1, v1-58-2, v1-58-8, v1-58-9, v1-58-10, v1-58-12, v1-58-13, v1-58-14, v1-58-15, v1-59-11, v1-60-1, v1-60-3, v1-60-4, v1-60-6, v1-60-11, v1-60-12, v1-60-13, v1-60-15, v1-61-1, v1-61-2, v1-61-4, v1-61-6, v1-61-7, v1-61-8, v1-61-14, v1-62-2, v1-62-7, v1-62-8, v1-62-9, v1-62-10, v1-62-12, v1-62-14, v1-62-15
- Девиз без толкования (34): v1-4-14, v1-4-15, v1-17-1, v1-18-9, v1-49-6, v1-52-2, v1-53-12, v1-53-13, v1-56-2, v1-56-4, v1-58-7, v1-58-11, v1-59-12, v1-59-14, v1-59-15, v1-60-2, v1-60-5, v1-60-8, v1-60-9, v1-60-14, v1-61-3, v1-61-5, v1-61-9, v1-61-10, v1-61-11, v1-61-12, v1-61-13, v1-61-15, v1-62-3, v1-62-4, v1-62-5, v1-62-6, v1-62-11, v1-62-13

Ещё 2 записи без девиза и без толкования (только описание) в список не входят и оставлены с issue «разбивка»: v1-8-12 (`v1-8-12-2`), v1-26-4 (`v1-26-4-1`).

## Совпадающие переводы аллегорий

По решению пользователя не issue: разные французские названия медальонов переведены одним русским словом. Групп — 9. Предложены различающие варианты (по желанию редактора). Источник — `medal_ru_collisions.csv`.

| Сейчас по-русски | Французское название | id | Предлагаемый вариант |
|---|---|---|---|
| Благоразумие | DISCRETION | v2-105-9 | Рассудительность / Сдержанность |
| Благоразумие | PRUDENCE | v2-91-11 | Благоразумие |
| Благочестие | DEVOTION | v2-153-12 | Набожность |
| Благочестие | PIETE | v2-111-9 | Благочестие |
| Верность | FIDELITE | v2-116-1 | Верность |
| Верность | LOYAUTE | v2-65-6 | Честность / Прямодушие |
| Исправление | CORRECTION | v2-38-5 | Вразумление / Наказание |
| Исправление | REFORMATION | v2-18-15 | Исправление (нравов) |
| Любовь к славе | AMOUR DE LA GLOIRE | v2-154-1 | Любовь к славе |
| Любовь к славе | AMOUR DE RENOMMEE | v2-149-2 | Любовь к доброму имени |
| Милосердие | CHARITE | v2-153-8 | Любовь (христианская; caritas) |
| Милосердие | CLEMENCE | v2-25-12 | Снисхождение / Милость |
| Милосердие | MISERICORDE | v2-90-15 | Милосердие |
| Послушание | DOCILITE | v2-154-13 | Восприимчивость (к наставлению) |
| Послушание | OBEISSANCE | v2-37-12 v2-101-13 | Послушание |
| Разум | INTELLECT | v2-12-5 | Разум (интеллект) |
| Разум | INTELLIGENCE | v2-88-11 | Понимание / Разумение |
| Учение | DOCTRINE | v2-42-14 v2-147-5 | Учение (доктрина) |
| Учение | ESTUDE | v2-28-8 | Занятия / Изучение |

Связанное замечание: REFORMATION в v2-102-7 переведено «Реформация» (issue `v2-102-7-1`, предложено «Исправление (нравов)», как в v2-18-15); после правки v2-102-7 войдёт в группу «Исправление».

## Вторая часть: монограммы

Не перевод, а быстрая проверка на странности: настоящий текст кроме букв, пустые записи, дубли одинаковых букв на одной доске, опечатки в подписи, расхождение букв в заголовке и переводе. Обычные записи из одних букв только посчитаны.

| Показатель | Значение |
|---|---|
| Всего записей | 2062 |
| Обычные (только буквы) | 2013 |
| Со странностями (свой JSON) | 49 |
| из них issue (minor) | 11 |
| — опечатки подписи (typo) | 10 |
| — пустая подпись (omission) | 1 |
| — особенности издания (не issue) | 35 |
| — верная половина дубля (ok) | 3 |
| Записи с настоящим текстом | 0 |
| Расхождение букв fr / ru | 0 |
| Пропуски в ряду (записи нет) | 2 |

Все опечатки подписи повторяют гравюру (ошибка самого издания); правильное чтение восстановлено по алфавитному ряду и по тому, что ожидаемой комбинации больше нигде в части нет. Сам рисунок вензеля не перечитывался.

### Опечатка подписи (issue) — 7

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-66-4 | v2-66.jpg | MRT | minor | на доске v2-66 (гравир. «64») подпись «MRT» в ряду MPQ, MPR, MPS, [MPT], MPV; MPT во всей части отсутствует, MRT встречается дважды (здесь и на своём месте). На гравюре тоже «MRT» — опечатка издания, … |
| v2-92-2 | v2-92.jpg | QYZ | minor | на доске v2-92 (гравир. «90») в ряду «через пять» (PVX…PVZ, QXY, [QXZ], RYZ, [SZA]) выгравировано «QYZ»; QXZ во всей части отсутствует, а QYZ встречается ещё раз на своём месте (v2-102-6). Опечатка из … |
| v2-92-6 | v2-92.jpg | SYZ | minor | на той же доске после RYZ выгравировано «SYZ»; по логике ряда (с переходом через конец алфавита, как YZA, XAZ, VZA, TZA, RZA) ожидается «SZA»; SYZ уже есть в предыдущем ряду (v2-80). На гравюре именно … |
| v2-130-5 | v2-130.jpg | EQR | minor | на доске v2-130 (гравир. «128») после EPZ выгравировано «EQR», «EQS», затем FQT…: ожидается FQR, FQS. FQR/FQS во всей части отсутствуют, EQR/EQS встречаются ещё раз на своём месте (v2-135-8/9). Опечат … |
| v2-130-6 | v2-130.jpg | EQS | minor | то же, «EQS» на месте ожидаемого «FQS» (см. v2-130-5) |
| v2-132-8 | v2-132.jpg | MXZ | minor | на доске v2-132 (гравир. «130») ряд LXY, LXZ, MXZ, NZA: ожидается MYZ (MYZ во всей части отсутствует, MXZ уже есть на своём месте — v2-126-6). На гравюре «MXZ» — опечатка издания, повторённая в данных … |
| v2-150-14 | v2-150.jpg | GXZ | minor | на доске v2-150 (гравир. «148») ряд EVX, EVY, EVZ, FXY, FXZ, GXZ: ожидается GYZ (ср. DVX…EXY, EXZ, FYZ; CTV…DXY, DXZ, EYZ). GYZ во всей части отсутствует, GXZ уже есть на своём месте (v2-148-7). На гр … |

### Дубль на доске из-за опечатки (одна половина — issue, другая ok) — 6

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-3-5 | v2-3.jpg | AE | ok | подпись «AE» выгравирована дважды (v2-3-5, v2-3-6); первая — верна (идёт после AD). См. v2-3-6 |
| v2-3-6 | v2-3.jpg | AE | minor | повтор «AE» на месте ожидаемого «AF»: последовательность AD, AE, [AF], AG; AF во всей второй части отсутствует (все 253 пары встречаются ровно по разу, кроме AE×2 и AF×0). На гравюре тоже «AE» — опеча … |
| v2-64-1 | v2-64.jpg | IMP | ok | подпись «IMP» выгравирована на доске v2-64 (гравир. «62») дважды (v2-64-1, v2-64-3); первая верна (после IMO). См. v2-64-3 |
| v2-64-3 | v2-64.jpg | IMP | minor | повтор «IMP» на месте ожидаемого «IMR»: ряд IMN, IMO, IMP, IMQ, [IMR], IMS; IMR во всей части отсутствует. На гравюре тоже «IMP» — опечатка издания, повторённая в данных и переводе |
| v2-130-8 | v2-130.jpg | FQY | minor | на доске v2-130 ряд выгравирован FQT, FQY, FQX, FQY, FQZ: первый «FQY» стоит на месте ожидаемого «FQV» (FQV во всей части отсутствует); второй FQY (v2-130-10) — на своём месте. Опечатка издания |
| v2-130-10 | v2-130.jpg | FQY | ok | второй «FQY» на доске v2-130 — верный (после FQX). См. v2-130-8 |

### Пустая подпись (issue) — 1

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-67-4 | v2-67.jpg | [illegible] | minor | на доске v2-67 (гравир. «65») у вензеля №4 подписи нет вовсе (место пустое на скане); в данных «[illegible]» / «[неразборчиво]». По ряду ORS, ORT, [ORV], ORX ожидается «ORV» (ORV во всей части отсутст … |

### Дубль на доске — два варианта вензеля одной буквы (особенность издания) — 10

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-1-3 | v2-1.jpg | B | ok | на доске v2-1 (гравир. «1») буква «B» выгравирована дважды (v2-1-3 и v2-1-4) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-4 | v2-1.jpg | B | ok | на доске v2-1 (гравир. «1») буква «B» выгравирована дважды (v2-1-3 и v2-1-4) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-6 | v2-1.jpg | D | ok | на доске v2-1 (гравир. «1») буква «D» выгравирована дважды (v2-1-6 и v2-1-7) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-7 | v2-1.jpg | D | ok | на доске v2-1 (гравир. «1») буква «D» выгравирована дважды (v2-1-6 и v2-1-7) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-9 | v2-1.jpg | F | ok | на доске v2-1 (гравир. «1») буква «F» выгравирована дважды (v2-1-9 и v2-1-10) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-10 | v2-1.jpg | F | ok | на доске v2-1 (гравир. «1») буква «F» выгравирована дважды (v2-1-9 и v2-1-10) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-11 | v2-1.jpg | G | ok | на доске v2-1 (гравир. «1») буква «G» выгравирована дважды (v2-1-11 и v2-1-12) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-12 | v2-1.jpg | G | ok | на доске v2-1 (гравир. «1») буква «G» выгравирована дважды (v2-1-11 и v2-1-12) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-13 | v2-1.jpg | H | ok | на доске v2-1 (гравир. «1») буква «H» выгравирована дважды (v2-1-13 и v2-1-14) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |
| v2-1-14 | v2-1.jpg | H | ok | на доске v2-1 (гравир. «1») буква «H» выгравирована дважды (v2-1-13 и v2-1-14) — два варианта вензеля одной буквы; данные совпадают со сканом. Особенность издания, не ошибка |

### Одиночная буква вне ряда (особенность издания) — 1

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-21-3 | v2-21.jpg | Z | ok | на доске v2-21 (гравир. «20 bis») выгравирована одиночная «Z» между XZ и YZ (данные совпадают со сканом). Одиночные буквы идут на v2-1–v2-2; «Z» уже есть (v2-2-14) — это второй вариант вензеля Z, вста … |

### Ряд продолжен через конец алфавита (особенность издания) — 10

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-40-2 | v2-40.jpg | YZA | ok | на доске v2-40 (гравир. «38») выгравировано «YZA» после XYZ: ряд «соседних» тройных вензелей (ABC, BCD … XYZ) продолжен с переходом через конец алфавита. Данные совпадают со сканом. Особенность издани … |
| v2-55-2 | v2-55.jpg | XAZ | ok | на доске v2-55 (гравир. «53») «XAZ»: ряд «через одну» (…TXY, VYZ) с переходом через конец алфавита — ожидалось бы XZA; на гравюре именно «XAZ», данные совпадают. Особенность издания |
| v2-55-3 | v2-55.jpg | ZBC | ok | «ZBC» на v2-55 — продолжение того же ряда через конец алфавита (ср. YZA, v2-40-2); данные совпадают со сканом. Особенность издания |
| v2-68-8 | v2-68.jpg | VZA | ok | «VZA» на доске v2-68 (гравир. «66»): ряд …SXZ, TYZ продолжен через конец алфавита (ср. YZA, XAZ, ZBC); данные совпадают со сканом. Особенность издания |
| v2-80-14 | v2-80.jpg | TZA | ok | «TZA» на доске v2-80 (гравир. «78»): ряд …RXZ, SYZ продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA); данные совпадают со сканом. Особенность издания |
| v2-102-8 | v2-102.jpg | RZA | ok | «RZA» на доске v2-102.jpg: ряд «через шесть» (…PXZ, QYZ) продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA, TZA); особенность издания. На гравюре (доска v2-102, гравир. «100») подпись «RZA» — дан … |
| v2-111-10 | v2-111.jpg | QZA | ok | «QZA» на доске v2-111 (гравир. «109»): ряд …OXZ, PYZ продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA, TZA, RZA); на гравюре «QZA», данные совпадают со сканом. Особенность издания |
| v2-119-10 | v2-119.jpg | PZA | ok | «PZA» на доске v2-119 (гравир. «117»): ряд продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA, TZA, RZA, QZA); данные совпадают со сканом. Особенность издания |
| v2-126-9 | v2-126.jpg | OZA | ok | «OZA» на доске v2-126 (гравир. «124»): ряд продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA, TZA, RZA, QZA); данные совпадают со сканом. Особенность издания |
| v2-132-9 | v2-132.jpg | NZA | ok | «NZA» на доске v2-132 (гравир. «130»): ряд продолжен через конец алфавита (ср. YZA, XAZ, ZBC, VZA, TZA, RZA, QZA); данные совпадают со сканом. Особенность издания |

### Буквы подписи в другом порядке (особенность издания) — 14

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| v2-42-1 | v2-42.jpg | DBL | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBL» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-2 | v2-42.jpg | DBM | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBM» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-3 | v2-42.jpg | DBN | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBN» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-4 | v2-42.jpg | DBO | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBO» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-5 | v2-42.jpg | DBP | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBP» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-6 | v2-42.jpg | DBQ | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBQ» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-7 | v2-42.jpg | DBR | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBR» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-8 | v2-42.jpg | DBS | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBS» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-9 | v2-42.jpg | DBT | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBT» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-10 | v2-42.jpg | DBV | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBV» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-11 | v2-42.jpg | DBX | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBX» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-12 | v2-42.jpg | DBY | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBY» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-42-13 | v2-42.jpg | DBZ | ok | на доске v2-42 (гравир. «40») все 13 подписей выгравированы как «DBZ» (DBL…DBZ), хотя ряд на предыдущей доске идёт BDE…BDK и по логике должен продолжаться BDL…BDZ (BDL–BDZ во всей части отсутствуют). … |
| v2-53-3 | v2-53.jpg | OQT | ok | на доске v2-53 (гравир. «51») «OQT» выгравирован перед OQR, OQS (ожидалось OQR, OQS, OQT, OQV); данные повторяют порядок гравюры. Набор вензелей полный, порядок кружков — особенность издания |

### Пропуск в ряду — записи нет — 2

| id | доска | подпись | вердикт | примечание |
|---|---|---|---|---|
| gap after v2-99-15 | v2-99.jpg / v2-100.jpg | (IPY) | n/a | между IPX (v2-99-15, последняя на доске «97») и IPZ (v2-100-1, первая на доске «98») нет вензеля IPY — ни на гравюре, ни в данных. Пропуск в издании; записи нет, поэтому не считается аномальной запись … |
| gap after v2-123-5 | v2-123.jpg | (EOT) | n/a | на доске v2-123 (гравир. «121») ряд EOR, EOS, EOV — вензеля EOT нет ни на гравюре, ни в данных. Пропуск в издании; записи нет |

Пропущенные монограммы IPY (между v2-99-15 IPX и v2-100-1 IPZ) и EOT (на доске v2-123 между EOS и EOV) отсутствуют и на гравюре, и в данных — это пропуск издания; записей для них нет, issue не заводилось.

Сводка по пакетам — `monograms_scan.csv`, полный список — `monograms_anomalies.csv`.

## Особенности издания и гравюр

Не issue (кроме ERASTO, где есть issue на перевод). Источник — `summary_notes.csv`.

| id | вид | примечание |
|---|---|---|
| v2-93-8 | engraving_quirk | На медальоне выгравировано «BEATI MISERI / CORDIAM» (данные совпадают со сканом). Латынь неполная/неграмматичная (ср. Мф 5:7 «Beati misericordes»); перевод «Блаженны милосердные» передаёт задуманный смысл. Не issue |
| v2-102-9 | engraving_quirk | На медальоне сокращение «AM. COURTOISE» (= AMOUR COURTOISE); данные повторяют сокращение. Перевод «Учтивая любовь» верен. Не issue |
| v2-32-15..v2-62-15 | data_format | Заголовки медальонов в данных с v2-32-15 по v2-62-15 записаны строчными с современными акцентами («Innocence», «Liberalité»), до и после — прописными без акцентов; на сканах везде прописные. Косметика, не issue |
| v2-117-13 | engraving_quirk | На медальоне «ICHONOGRA / PHIE» (обычно ICHNOGRAPHIE); данные повторяют гравюру. Перевод «Ихнография» верен. Не issue |
| v2-129-10 | engraving_quirk | На медальоне «ERASTO» вместо ERATO (муза); данные повторяют гравюру. Перевод исправить — см. issue v2-129-10-1 |
| v2-120-10 | crop_check | Кроп v2-120-10 показывает монограмму (сбитая сетка v2-120); подпись «BEATI PAU / PERES» сверена по целой доске v2-120.jpg — совпадает |
| v2-138-7 | engraving_quirk | На медальоне «BEATI PAS / SIONUM» (данные совпадают); латынь неграмматична (ср. Мф 5:10 «Beati qui persecutionem patiuntur»). Перевод «Блаженны в страданиях» передаёт смысл. Не issue |
| v2-120-10/v2-133-7/v2-138-7 | data_format | Переводы латинских «Beati…»-медальонов оформлены по-разному: v2-133-7 в кавычках «Блаженны чистые сердцем», остальные без кавычек. Косметика, не issue |
| v2-141-11/v2-145-1 | engraving_quirk | Сокращения на медальонах: «IUST. RIGOUREUSE» (= IUSTICE), «ORGUEIL INSUPORT» (= INSUPORTABLE); данные повторяют гравюру, переводы даны полностью. Не issue |
| v2-149-9/v2-153-3/v2-154-6 | engraving_quirk | Ещё «Beati…»-медальоны с неполной/неграмматичной латынью гравюры: «BEATI CON / FREGIT», «BEATI» (одно слово), «BEATI MITES QUONIAM» (оборвано на quoniam); данные повторяют гравюру. Кавычки в переводах снова непоследовательны (v2-151-7, v2-154-6 в «») |
| v2-150-13 | engraving_quirk | Сокращение «GOUVERNEMENT DE LA REP.» на гравюре; перевод дан полностью («Управление Республикой»). Не issue |
| v2-92-6 | not_sure | Для раздела «Не уверен»: issue v2-92-6-1 (монограмма «SYZ», возможно «SZA») — низкая уверенность; гравёр мог сознательно не делать переход через конец алфавита |

## Дефекты досок и кропов

Только для сведения, не issue. Источник — `plate_notes.csv`. Главное:

- **Смещение нумерации досок части 2 на −2.** v2-1…v2-20 совпадают с номером на гравюре; v2-21 — «20 bis», v2-22 — пустая страница; с v2-23 гравированный номер = group − 2 (подтверждено выборочно до v2-145 = «143»). `group_fr` «Planche N» поэтому не совпадает с номером на скане.
- **Сбитая сетка кропов на v2-120** (гравир. «118»): все 15 кропов `img` не совпадают с вензелями; №10 (медальон BEATI PAUPERES) показывает монограмму. Подписи сверены по целой доске — данные верны; нужна переразметка bbox.
- **Переставленные доски части 1:** файлы v1-54.jpg ↔ v1-56.jpg и v1-57.jpg ↔ v1-59.jpg (вместе с кропами); внутри досок переставлены кружки v1-36 №1/№2, v1-50 №1/№2, v1-56 №4/№5.
- **Обрезанные и смещённые кропы** в части 2 (кроп — только полоска подписи или край страницы): v2-62-13…15, v2-74-13…15, v2-120 и др.

| id | доска | кружок | наблюдение | статус |
|---|---|---|---|---|
| v1-5-1 | v1-5 | 1 | Текст: «Un Flambeau allumé, qui en allume un autre» (факел зажигает другой); на гравюре предмет больше похож на циркуль/щипцы в руке — сходство с двумя факелами неочевидно | info; проверить по изданию |
| v1-15-6 | v1-15 | 6 | Текст: «Vn Aigle tenant une couronne dans ses serres»; на гравюре орёл держит, по-видимому, ветвь, а не корону | info |
| v1-21-2 | v1-21 | 2 | Текст: «Vn Vautour sur une Chambre»; на гравюре птица на ветви дерева у скалы, дома нет (см. issue v1-21-2-1 — вероятное искажение слова) | info; связано с issue |
| v1-36-1/v1-36-2 | v1-36 | 1-2 | №1 изображает три короны (описание v1-36-2: корона Дофина между миртовым и лавровым венками), №2 — алмаз (описание v1-36-1); №3–15 совпадают. Номера кружков 1 и 2 переставлены относительно текста (в издании или в разметке img) | info; проверить разметку img |
| v1-49-8 | v1-49 | 8 | Текст: «Deux Cœurs liez par un lâs d'Amour»; на гравюре №8 различима сидящая мужская фигура, двух сердец с узлом не видно | info; проверить по изданию |
| v1-50-1/v1-50-2 | v1-50 | 1-2 | №1 изображает солнечные часы на постаменте (описание v1-50-2), №2 — знамя на древке (описание v1-50-1 «Guidon»); №3–5 совпадают. Номера 1 и 2 переставлены относительно текста (ср. v1-36 №1/№2) | info; проверить разметку img |
| sweep v1-1..v1-49 #1/#2 | v1-1..v1-49 | 1-2 | Сверка кружков №1/№2 всех 49 досок с описаниями: перестановка только на v1-36 (уже в списке); на v1-50 — см. строку выше. Остальные 48 досок совпадают (v1-5 №1 и v1-21 №2 — расхождение изображения, не перестановка, см. выше) | info |
| v1-54/v1-56 | v1-54+v1-56 | 1-15 | Файлы досок v1-54.jpg и v1-56.jpg переставлены целиком: v1-54.jpg изображает сюжеты v1-56 (молния, луна среди звёзд, солнце, раковины, жемчуг, роза в шипах, летящий лебедь, зеркало, свеча в фонаре), а v1-56.jpg — сюжеты v1-54 (пламя, корабль с руном на мачте, горящий фитиль, орлёнок с молнией, дикобраз между собак, … термометр, карабин, жезл маршала и булава канцлера, фонтан, костёр). Кропы img (v … | info; проверить разметку plate_img/img |
| v1-56-4/v1-56-5 | v1-54.jpg (=доска v1-56) | 4-5 | Сверка текстов v1-56 с v1-54.jpg: №4 изображает закрытую раковину (описание v1-56-5), №5 — радугу (описание v1-56-4 «Arc-en-Ciel»); остальные 13 кружков совпадают. Номера 4 и 5 переставлены относительно текста (поверх перестановки файлов v1-54/v1-56) | info; проверить разметку img |
| v1-57/v1-59 | v1-57+v1-59 | 1-15 | Файлы досок v1-57.jpg и v1-59.jpg переставлены целиком (как v1-54/v1-56): v1-59.jpg изображает все 15 сюжетов v1-57 (жемчужина, молния, солнце, подпорка у дома, жемчужина в буре, ветер и огонь, лебедь, пчела, единорог, закрытый шлем, Полярная звезда, собака у стада), а v1-57.jpg — сюжеты v1-59 (лев и солнце, барка, бегущая от кораблей, … рука, алембик, лавровый венок, дерево с лозой, граната). Кро … | info; проверить разметку plate_img/img |
| part 2 plate numbering | v2-21..v2-27+ | — | Гравированный номер доски во второй части расходится с group/group_fr начиная с v2-21: v2-1..v2-20 = «1»..«20»; v2-21 (стихии/времена года/формы правления) — «20 bis»; v2-22 — пустая страница (blank_page, просвечивает оборот); с v2-23 гравированный номер = group − 2 (v2-23 = 21, v2-25 = 23, v2-27 = 25). group_fr «Planche N» поэтому не совпадает с номером на скане; смещение −2 подтверждено до v2-14 … | info; нумерация данных vs издания |
| v2-62-13..15 (+ ещё 8) | v2-62 | 13-15 | Обрезанные кропы img: у v2-62-13 (GKZ), v2-62-14 (Gloire), v2-62-15 (Harmonie) bbox высотой 2–3 % доски — кроп содержит только полоску с подписью, сам медальон/монограмма не попадает. Подписи GLOIRE и HARMONIE сверены по целой доске v2-62.jpg — совпадают. Та же аномалия по высоте bbox (< 6 %) ещё у v2-44-14, v2-53-1..3, v2-74-13, v2-74-14 (medal), v2-120-13, v2-120-14; v2-74-13/14 и v2-120-13/14 п … | info; проверить bbox/img |
| v2-74-15 (+ ещё 5) | v2-74 | 15 | Смещённые кропы img: у v2-74-15 (HARMONIE D'AMOUR) bbox x=93.8 %, ширина 6.2 % — кроп захватывает только край страницы, медальон не попадает. Подпись «HARMONIE D'AMOUR» сверена по целой доске v2-74.jpg — совпадает. Та же аномалия (ширина bbox < 10 %, у правого края) у v1-39-15, v2-44-15, v2-120-3, v2-120-6, v2-120-15; v2-120-3/6/15 подтверждены визуально (только край страницы), v1-39-15 и v2-44-15 … | info; проверить bbox/img |
| v2-120-1..15 | v2-120 | 1-15 | Сетка кропов img на доске v2-120 (гравир. «118») сбита целиком: кропы нарезаны почти равной сеткой со сдвигом и не совпадают с монограммами. №1, 2, 4, 5, 7, 8 захватывают монограмму частично/с соседями; №3, 6, 15 — только край страницы; №13, 14 — узкие полосы; №9, 12 — обрезки; №10 (медальон BEATI PAUPERES) — показывает монограмму BLO/BLM вместо медальона, №11 — части BLQ. Подписи (AKP…BLQ, BEATI … | info; переразметить bbox/img для v2-120 |
| v3-8-ii | v3-8 | ii | Текст: «au centre, un agneau» (ягнёнок); на гравюре в центре картуша идущий зверь, больше похожий на волка/собаку, чем на ягнёнка. Описания части 3 — современные (не текст издания) | info |
| v3-17-i | v3-17 | i | Текст: «Un cheval et un éléphant encadrent…»; на гравюре слева не конь, а верблюд (горб, длинная шея). Описания части 3 — современные (не текст издания) | info |
| v3-17-ii | v3-17 | ii | Текст сам себе противоречит: «un cartouche vide… au centre, un jeune poulain»; на гравюре щит (не пустой) с жеребёнком внутри. Перевод «пустой картуш» точно следует французскому | info |

## Не уверен

Замечания, где прямо сказано «не уверен» или «проверить по изданию»: 38. Сканов текста нет, поэтому восстановленные чтения девизов — по смыслу толкования, правка не навязывается. Монограмма v2-92-6 («SYZ», возможно «SZA») — единственная low среди монограмм: гравёр мог сознательно не делать переход через конец алфавита.

- `v1-3-5-2` — text_ru/meaning_ru — addition, low: «Elles le font naturellement.» → «без наставника» — из девиза, в толковании нет: «Они делают это сами по природе»; не уверен, что это нужно править
- `v1-3-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Spes altera vita.» → [LA] вероятно «Spes altera vitæ» («надежда на другую жизнь»; потеряно æ), ср. толкование «une seconde vie»; не уверен — скана текста нет
- `v1-4-14-1` — text_ru/meaning_ru — addition, low: «Privo dite moriro.» → в оригинале толкования нет (meaning_fr пуст), RU добавил перевод итальянского девиза третьим абзацем. Перевод верен по смыслу (Privo di te morirò), но это добавка; пометить как перевод девиза или убрать. Не уверен, что нужно прави …
- `v1-4-15-1` — text_ru/meaning_ru — addition, low: «non may ingrata.» → толкования в оригинале нет (meaning_fr пуст), RU добавил перевод девиза; к тому же ingrata — жен. р.: «Никогда не бываю неблагодарной». Пометить как перевод девиза или убрать; не уверен, что нужно править
- `v1-5-7-1` — text_fr/motto_fr/text_ru — ocr, low: «Volenter trahimur.» → [LA] «Volenter» — не латинское слово; вероятно «Volentes trahimur» («нас влечёт по доброй воле»). Скана текста нет; не уверен
- `v1-8-12-2` — text_fr/motto_fr — omission, low: «Vn Niveau, ny çà, ny là.» → разбивка: «ny çà, ny là» («ни туда, ни сюда»), вероятно, — девиз/толкование, слитый с описанием; motto_fr пуст. Скана текста нет — проверить по изданию; не уверен
- `v1-13-2-1` — text_fr/motto_fr/text_ru — ocr, low: «Non capio, ni capior.» → [LA] «ni» — не латинское слово (вероятно «nisi»/«nec»; ср. толкование «Il a voulu estre pris»). Скана текста нет; не уверен
- `v1-15-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Antes muerta, che cautiva.» → [ES] «que cautiva» (che — итальянское; девиз испанский); возможно, опечатка самого издания. Скана текста нет; не уверен
- `v1-16-10-1` — text_fr/motto_fr/text_ru — ocr, low: «Domum mucrone tuctum.» → [LA] «tuctum» — не латинская форма; вероятно «Domum mucrone tuetur» (защищает дом жалом; ср. «Elle deffend sa maison»). Скана текста нет; не уверен
- `v1-18-9-1` — meaning_ru — addition, low: «Virescit vulnere virtus.» → во французском толкования нет (meaning_fr пуст, text_fr из двух абзацев) — meaning_ru переводит латинский девиз; перевод верен, но это добавление. Возможно, толкование потеряно в самом text_fr — проверить по изданию
- `v1-19-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Propriis non parcis.» → [LA] вероятно «Propriis non parcit» (3-е лицо, ср. «Il ne pardonne pas»); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-21-2-1` — text_fr/ru/text_ru — ocr, low: «Vn Vautour sur une Chambre, qui attend quelque petit Oiseau pour se jetter dessus.» → «sur une Chambre» не сходится с гравюрой (v1-21 №2: птица на ветви дерева у скалы, никакого дома); вероятно, искажение (Branche?). Перевод «на доме» основан на этом чтении. Скана текста нет; не уверен
- `v1-23-1-1` — text_fr/motto_fr/text_ru — ocr, low: «No quiere chi no descança.» → [ES] «quien» (chi — итальянское; ср. v1-15-9 «che»); возможно, ошибка самого издания. Скана текста нет; не уверен
- `v1-26-4-1` — text_fr/motto_fr/meaning_fr — omission, low: «Un Lion vaillant & veillant.» → разбивка: только описание, девиза и толкования нет (motto_fr, meaning_fr пусты), в отличие от соседних эмблем; возможно, потеряны при извлечении текста. Перевод того, что есть, верен. Скана текста нет; не уверен
- `v1-27-4-2` — text_fr/motto_fr/text_ru — ocr, low: «Aris, agrisque laboro.» → [LA] по толкованию («Malades») ожидается «ægrisque» (больным) — возможно, потеряна лигатура æ; но «agris» (полям) тоже осмысленно. Скана текста нет; не уверен
- `v1-28-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Quis metiet?» → [LA] классически «Quis metietur?» (metior — отложительный глагол); возможно, так в издании. Скана текста нет; не уверен
- `v1-29-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Nunc fatibus apta.» → [LA] вероятно «Nunc fœtibus (fetibus) apta» («теперь пригоден к порождению», ср. «Je puis à present produire»); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-32-8-1` — text_fr/motto_fr/text_ru — ocr, low: «Quebrantar lo cosa fea.» → [ES] девиз искажён: по толкованию («Rompre la foy c'est chose honteuse») ожидается «Quebrantar la fe, cosa fea» — пропущено «fe», «lo» вместо «la». Скана текста нет; не уверен
- `v1-36-11-1` — text_fr/motto_fr/text_ru — ocr, low: «Non fregit qui quærit hostes.» → [LA] вероятно «Non fugit qui quærit hostes» («не бежит тот, кто ищет врагов», ср. «Il ne craint pas, mais il cherche»); fregit по смыслу не подходит. Скана текста нет; не уверен
- `v1-37-11-1` — text_fr/motto_fr/text_ru — ocr, low: «Ex luce luces.» → [LA] по толкованию («Il cache du venin sous ses brillans») ожидается «Ex luce lues» (из блеска — зараза/яд); «luces» смысла не даёт. Скана текста нет; не уверен
- `v1-37-15-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas che en la tierra nocivo.» → [ES] «Mas que en la tierra nocivo» (che — итальянское; ср. v1-15-9, v1-23-1); возможно, орфография издания. Скана текста нет; не уверен
- `v1-40-1-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas firmezza chè luz.» → [ES] «Mas firmeza que luz» (итальянизированные «chè», «-zz-»; ср. v1-15-9, v1-23-1, v1-37-15); возможно, орфография издания. Скана текста нет; не уверен
- `v1-45-7-1` — text_fr/motto_fr/text_ru — ocr, low: «Lex ex lex.» → [LA] «Lex ex lex» бессмысленно; по толкованию («Oüy & non») вероятно «Lex & exlex» (закон и беззаконие — паутина держит малых и рвётся большими). Скана текста нет; не уверен
- `v1-49-15-1` — text_fr/motto_fr/text_ru — ocr, low: «Transfundit pasta venenum.» → [LA] вероятно «pastus» / «pastu» (пища передаёт яд, ср. «Ce repas les empoisonne»); «pasta» сомнительно. Скана текста нет; не уверен
- `v1-54-9-1` — text_fr/motto_fr/text_ru — ocr, low: «Sibi mihi libertas.» → [LA] «Sibi mihi» не согласуется с толкованием «Si je puis une fois estre libre…»; вероятно «Si sit mihi libertas» (слито/искажено). Скана текста нет; не уверен
- `v1-55-3-1` — text_fr/motto_fr/text_ru — ocr, low: «Da mi grido mi honor.» → [ES/IT] смесь: исп. «De mi grito mi honor» или ит. «Dal mio grido il mio onore»; ср. итальянизмы в испанских девизах (v1-15-9, v1-37-15). Возможно, орфография издания; не уверен
- `v1-56-13-1` — text_fr/motto_fr/text_ru — ocr, low: «Virgo ille juventa est.» → [LA] «Virgo ille» не согласуется (ille м. р.); вероятно «Virgo illi juventa est» — искажено; толкование «de ma jeunesse» тоже странно. Скана текста нет; не уверен
- `v1-56-14-1` — text_fr/motto_fr/text_ru — ocr, low: «Segura alos soplos.» → [ES] «Segura a los soplos» (слитное «alos» — вероятно, орфография издания); скопировано и в text_ru. Не уверен
- `v1-57-1-1` — text_fr/motto_fr/text_ru — ocr, low: «Cœli sociat major quam maris.» → [LA] «sociat major» грамматически не связано; по толкованию («Son commerce est plus grand avec le Ciel») вероятно «Cœli societas major quam maris». Скана текста нет; не уверен
- `v1-57-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas cubrido mas seguro.» → [ES] причастие от cubrir — «cubierto»: «Mas cubierto, mas seguro»; возможно, орфография издания. Скана текста нет; не уверен
- `v1-58-6-1` — text_fr/motto_fr/text_ru — ocr, medium: «Esto tien esu remedio y non yo.» → [ES] вероятно «Este tiene su remedio, y no yo» (tien/esu — разрыв/слияние слов, non — итальянизм; ср. v1-55-3); скопировано и в text_ru. Скана текста нет; не уверен
- `v1-59-12-1` — text_fr/motto_fr/text_ru — ocr, low: «Pale san lardore.» → [IT] слова слиты/искажены, смысла не дают; возможно «Palesa l'ardore» (обнаруживает жар — для алембика). Скана текста нет; не уверен
- `v1-59-14-1` — text_fr/motto_fr/text_ru — ocr, low: «Mas dulcura che alteza.» → [ES] «Mas dulzura que alteza» (che — итальянизм, ср. v1-37-15; dulcura — вероятно, орфография издания). Скана текста нет; не уверен
- `v1-60-2-1` — text_fr/motto_fr/text_ru — omission, low: «Decoris, roboris & custod... [illegible]» → девиз оборван в источнике извлечения («custod…» — вероятно custodiæ); нужно сверить с изданием и дописать в оригинал и перевод. Скана текста нет
- `v1-60-8-1` — text_fr/motto_fr/text_ru — ocr, low: «Ne piu ardente, ne piu fidelle.» → [IT] «Né più ardente, né più fedele» (fidelle — офранцуженное написание; возможно, орфография издания). Не уверен
- `v1-62-4-1` — text_fr/motto_fr/text_ru — ocr, low: «Deorsum non ovam.» → [LA] «ovam» смысла не даёт; для пламени ожидается что-то вроде «Deorsum nunquam» (никогда вниз); искажено. Скана текста нет; не уверен
- `v1-63-2-1` — text_fr/motto_fr/text_ru — ocr, medium: «Mordendo sanati.» → [LA] «Mordendo sanat» (кусая, исцеляет; ср. «Sa morsure guerit»); «sanati» не согласуется. Скопировано и в text_ru. Скана текста нет; не уверен в точной форме
- `v2-92-6-1` — fr/name_fr/text_fr/ru/text_ru — typo, low: «SYZ» → вероятно «SZA» — по закономерности ряда (QXY, [QXZ], RYZ, [SZA]) и повтору SYZ; на гравюре «SYZ». Не уверен: возможно, гравёр сознательно не стал делать переход через конец алфавита

Ещё 84 замечаний с уверенностью low без пометки «не уверен» — это стилистические и терминологические правки, где перевод не неверен, а неточен (список — по полю confidence в JSON): `v1-1-1-1`, `v1-1-10-1`, `v1-1-15-1`, `v1-2-3-1`, `v1-3-5-1`, `v1-4-14-2`, `v1-5-11-1`, `v1-6-9-1`, `v1-7-3-1`, `v1-7-4-2`, `v1-7-6-1`, `v1-7-9-1`, `v1-7-12-1`, `v1-7-15-1`, `v1-8-10-1`, `v1-9-11-1`, `v1-9-13-1`, `v1-10-15-1`, `v1-11-12-1`, `v1-12-2-1`, `v1-12-6-1`, `v1-14-6-1`, `v1-15-2-1`, `v1-15-11-1`, `v1-15-14-1`, `v1-16-2-1`, `v1-16-8-1`, `v1-16-10-2`, `v1-17-5-1`, `v1-17-7-1`, `v1-17-14-1`, `v1-17-15-1`, `v1-18-2-1`, `v1-18-13-1`, `v1-18-15-1`, `v1-20-8-1`, `v1-20-10-1`, `v1-21-9-1`, `v1-21-14-1`, `v1-22-11-1`, `v1-23-9-2`, `v1-23-12-1`, `v1-24-11-1`, `v1-24-13-1`, `v1-25-2-1`, `v1-26-11-1`, `v1-26-14-1`, `v1-27-15-1`, `v1-28-13-1`, `v1-30-1-1`, `v1-31-15-1`, `v1-32-5-1`, `v1-34-3-1`, `v1-34-5-1`, `v1-35-14-1`, `v1-37-2-1`, `v1-38-12-1`, `v1-39-4-1`, `v1-40-9-1`, `v1-41-1-1`, `v1-42-14-1`, `v1-44-1-1`, `v1-44-13-1`, `v1-48-6-1`, `v1-49-3-1`, `v1-50-5-1`, `v1-51-6-1`, `v1-51-15-1`, `v1-52-6-1`, `v1-54-12-1`, `v1-54-13-1`, `v1-55-1-1`, `v1-55-5-1`, `v1-56-10-1`, `v1-57-2-1`, `v1-61-1-1`, `v1-61-6-1`, `v1-63-10-1`, `v1-63-15-1`, `v2-115-5-1`, `v2-117-5-1`, `v2-149-9-1`, `v2-152-7-1`, `v3-6-ii-1`.

## Повторяющиеся закономерности

1. **Толкование по девизу** — 67 замечаний, см. отдельный раздел.
2. **Искажённые девизы копируются в перевод.** Девиз в `text_ru` не переводится, а копируется, поэтому каждая ошибка распознавания девиза есть и в переводе (86 issue_id с полями motto_fr + text_ru). Типичные сбои: долгое ſ → f (Defidia, ferentis, superfit, profit), потерянная лигатура æ (Va, Harent, Haret, casus, navos), слитые/разорванные слова (Epiace, ferax que, Ad me delam), лишние/пропущенные буквы (vobiscam, innultus, unidis).
3. **Испанские и итальянские девизы** ([ES] — 15, [IT] — 8): в испанских — итальянизмы (che вместо que, -zz-, non), в итальянских — слитые слова. Часть, вероятно, — орфография самого издания, поэтому почти все с пометкой «не уверен».
4. **fusil = огниво, а не кремень** — одна и та же ошибка в 4 записях: v1-27-13-1, v1-49-5-1, v1-52-14-1, v1-62-13-1; там же masse d'armes / masse de Chancelier — «булава», не «связка оружия» / «жезл» (v1-45-5-1, v1-54-13-1).
5. **Следы черновика в переводе:** дефисные пары-варианты («хищные-ненасытные» v1-7-3, «сенокосу-жатве» v1-9-11, «жалом-оружием» v1-16-10), служебные пометки в поле перевода («[неразборчиво/без пояснения в тексте]» v1-8-12, «Пост(?) […]» v2-125-4, «[хлеб]» v2-149-9).
6. **Заголовки `ru` толкуют, а не описывают** (Зависть вместо «худой женщины со змеями», «Корабль в порту»), и наоборот — неверный предмет в заголовке при верном `text_ru` (v1-1-1, v1-1-10, v1-9-4, v1-15-11).
7. **Монограммы:** опечатки издания на месте ожидаемых комбинаций (AE/AF, IMP/IMR, MRT/MPT, QYZ/QXZ, EQR/FQR, EQS/FQS, FQY/FQV, MXZ/MYZ, GXZ/GYZ) и последовательные особенности издания (переход через конец алфавита, ряд DB* вместо BD*) — 35 особенностей, не ошибок.

## Расхождения JSON и CSV

Найдены при сборке сводки и исправлены (только в файлах `_review/grok/`, `entries.json` не трогался):

- **Поля толкования.** В 77 замечаниях части 1 к толкованию было указано только `text_ru`, хотя тот же текст лежит в `meaning_ru`; в 6 замечаниях к французскому толкованию не было `meaning_fr` (`v1-7-9-1`, `v1-26-15-1`, `v1-29-5-1`, `v1-32-5-1`, `v1-41-7-1`, `v1-61-1-1`). Поля добавлены в JSON, счёт вхождений по полям в «Итоге» пересчитан (было 509, стало 592). Число уникальных ошибок не изменилось.
- **progress.csv, монограммы.** Строки `verrien-p2-mono` по пакетам записаны в формате сканирования (проверено, обычные, со странностями, issue), а не «проверено, ok, minor, major» по заголовку. Они оставлены как есть; в конец добавлена итоговая строка в формате заголовка `verrien-p2-mono,2062,2051,11,0` (2051 ok = 2013 обычных + 38 ok среди 49 со странностями). Для итогов брать её.
- **Тип `typo`.** Не входит в список типов GROK.md, но используется последовательно (опечатки в переводе и в подписях: 3 в части 1, 10 в монограммах) и так же, как в alciato; оставлен.
- **v1-8-12 и v1-26-4** (нет ни девиза, ни толкования) оставлены с замечаниями: это проблемы разбивки текста, а не «девиз без толкования», под снятие 8 замечаний не подпадают.
- Остальное сходится: вердикты в JSON совпадают с последними строками `progress.csv` по каждой части; 49 JSON монограмм = 49 строк `monograms_anomalies.csv` (без 2 строк-пропусков), вердикты совпадают; сумма `monograms_scan.csv` = 2062 / 2013 / 49 / 11; `motto_gloss_pattern.csv` совпадает с данными; повторов issue_id нет.

## Fix

Замечаний major нет, поэтому fix не делались (0). Правила fix — в `_review/grok/fix_check.py` и в разделе Fix сводки cartari.
