# Глоссарий: решения автора по 6 вопросам (2026-11-06) — журнал правок

Формат строки: язык | глава | строка файла (на момент правки) | было → стало | причина.
Проверка: `python3 tools/build_chapters.py --lang en|fr --check <slug>` — OK для apollo, catalogo-dei, gratie, minerva, nettuno, diana, giunone, gran-madre, annotationi-pignoria, mercurio (для ru `--check` не поддерживается скриптом). Пометки [?N] не затронуты.

## Решения

1. **Apolline** — fr = «Apollon» (по-французски «Apolline» читается как женское имя); ru «Аполлин», en «Apolline» без изменений. В fr/*.md форма «Apolline» осталась только в примечаниях, где речь о печатной форме (catalogo-dei, annotationi-pignoria, seconda-parte-indiani) — так и должно быть.
2. **Topo** — у Картари всюду мышь: Аполлон Сминфий («Sminthi i Topi», TEXT_reading 2493, 2517) и статуя царя Сетона с мышью / Мыши, посланные Вулканом на арабов (Геродот II 141; TEXT_reading 6595). «ratto» в тексте встречается только как наречие «быстро» (8012, 8330), «sorci» нет. Все три перевода уже давали мышь (ru Мышь/Мыши, en mouse/mice, fr souris/Souris) — правки только в глоссарии (fr Rat → Souris) и в fr/apollo.glossary-new.tsv. Строку «Topo (ratto)» не заводил: случая крысы нет.
3. **Thetide/Tetide/Tethide** — разделено на две записи. Нереида Фетида (Фетида/Thetis/Thétis): каталог богов п. 18 («Tethide… bellissima di tutte le Dee dopo Venere» — красота после Венеры = Фетида, которую сватали Зевс и Посейдон), Грации (идёт к Вулкану за оружием для Ахилла, Ил. XVIII), Минерва ×2 (то же; ларец Кипсела), Минерва — свадьба Пелея и Фетиды ×2 (текст и подпись к гравюре Раздора), Нептун — Эвринома сопровождает её к Вулкану «у Гомера» (Ил. XVIII 398). Титанида Тефида (Тефида/Tethys/Téthys): Аполлон — стихи Клавдиана (De raptu Proserpinae I, ткань Прозерпины: Тефида нянчит младенцев Солнце и Луну; в латинском оригинале Tethys) ×3; Нептун — жена Океана (помета, текст ×2, «Тефида была старой»), Нереиды сопровождают своих богов «Океана, Нерея, Нептуна, Тефиду, Дориду» (рядом с Океаном и Доридой — титанида), воды под именем «Океана, Нептуна, Тефиды, Дориды, Амфитриты».
4. **Girolamo Aleandro** — одна запись (ru Джироламо Алеандро / en Girolamo Aleandro / fr Girolamo Aleandro); удалена строка с fr «Jérôme Aléandre». Почти все упоминания — Джироламо Алеандро Младший (1574–1629), друг Иньории: «il mio Sig. Girolamo Aleandro nella sua Heliaca», письмо о руке Торнакса (Аджунта), каталог авторов (Heliaca), индийская часть (японские идолы, латинский комментарий о диадеме). Кардинал (1480–1542) упомянут один раз: «viua e compita imagine del grande GIROLAMO ALEANDRO Cardinale» (индийская часть). Строка «Girolamo Aleandro il giouane» оставлена: форма в тексте есть (TEXT_reading 10928). Тексты ru/en/fr уже были согласованы (fr везде «Girolamo Aleandro», «le Jeune» в одном месте) — правок в главах нет.
5. **Festo Pompeo / Festo Pompeio / Festo** — одна запись (грамматик Секст Помпей Фест): итал. «Festo, Festo Pompeo, Festo Pompeio» → ru «Фест, Помпей Фест», en/fr «Festus, Pompeius Festus». Полное имя у Картари (TEXT_reading 2438 + помета 2446, 2733, 3846, 4195 + помета 4217, 4824, 9908) → «Помпей Фест» / «Pompeius Festus»; просто «Festo» → «Фест» / «Festus» (не менялось). Слова «festo» в значении «праздничный» в итальянском тексте нет. Строка глоссария «Festo» удалена (слита). fr-формы «Festus Pompeius» заменены на «Pompeius Festus».
6. **Alcmone** — это керкоп Акмон (Ἄκμων), брат Пассала, «furono figliuoli di Mennone» (TEXT_reading 6024), не Алкмена/Алкмеон. Одна запись: ru «Акмон», en «Acmon», fr «Acmon», с пометкой, что Картари печатает «Alcmone». en/fr уже давали Acmon; ru «Алкмон» → «Акмон».

Fornuto/Cornuto не трогал.

## Правки в глоссариях

- GLOSSARY.tsv | стр. 34 | `Festo Pompeio	Фест Помпей	Festus	Festus	далее в тексте — просто "Festo"` → `Festo, Festo Pompeo, Festo Pompeio	Фест, Помпей Фест	Festus, Pompeius Festus	Festus, Pompeius Festus	<комментарий>` | вопрос 5
- GLOSSARY.tsv | стр. 779 | `Festo	Фест	Festus	Festus	автор` → удалена (слита со стр. 34) | вопрос 5
- GLOSSARY.tsv | стр. 455 | `Thetide	Тетида	Tethys	Téthys	жена Океана; единая форма…` → `Thetide (Nereide, madre d'Achille)	Фетида	Thetis	Thétis	<где встречается, склонение>` | вопрос 3
- GLOSSARY.tsv | стр. 456 | `Tetide	Тетида	Tethys	Téthys	…` → `Thetide (moglie d'Oceano)	Тефида	Tethys	Téthys	<где встречается, склонение>` | вопрос 3
- GLOSSARY.tsv | стр. 638 | `Alcmone	Алкмон	Acmon	Acmon	керкоп` → `Alcmone	Акмон	Acmon	Acmon	<керкоп, Картари печатает Alcmone>` | вопрос 6
- GLOSSARY.tsv | стр. 1046 | `Topo	Мышь	Mouse	Rat	…` → `Topo	Мышь	Mouse	Souris	… крыс в тексте нет; fr «Rat» было ошибкой` | вопрос 2
- GLOSSARY.tsv | стр. 1289 | `Apolline	Аполлин	Apolline	Apolline	…` → `Apolline	Аполлин	Apolline	Apollon	… fr = Apollon (женское имя по-французски)` | вопрос 1
- GLOSSARY.tsv | стр. 1318 | `Girolamo Aleandro	…	Jérôme Aléandre	Heliaca — «Гелиака»` → удалена (дубль) | вопрос 4
- GLOSSARY.tsv | стр. 1366 | `Girolamo Aleandro il giouane	…	(пустой комментарий)` → комментарий «так в тексте один раз (индийская часть, скан 0617); то же лицо…» | вопрос 4
- GLOSSARY.tsv | стр. 1402 | `Girolamo Aleandro	…	Girolamo Aleandro	Кардинал и его тёзка…` → тот же набор форм, комментарий о том, кто где имеется в виду | вопрос 4
- NAMES_TYPES.tsv (ключи для tools/build_names.py, должны совпадать с глоссарием) | `Festo Pompeio	Фест Помпей	a` → `Festo, Festo Pompeo, Festo Pompeio	Фест, Помпей Фест	a`; `Festo	Фест	a` удалена; `Thetide	Тетида	g` / `Tetide	Тетида	g` → `Thetide (Nereide, madre d'Achille)	Фетида	g` / `Thetide (moglie d'Oceano)	Тефида	g`; `Alcmone	Алкмон	c` → `Alcmone	Акмон	c`; дубль `Girolamo Aleandro	Джироламо Алеандро	a` удалён | вопросы 3–6
- TAVOLA_RU.tsv | t0623 | `Thetide → Тетида` → `Тефида; Фетида` (в указателе с. 85 и 216 — Тефида, с. 331 — Фетида) | вопрос 3
- fr/apollo.glossary-new.tsv | стр. 10 | `Topo (Topi)	…	souris	Le glossaire donne « Rat »… ; à trancher` → `… tranché : glossaire corrigé en « Souris » (Rat était une erreur)` | вопрос 2
- fr/gratie.glossary-new.tsv | стр. 2 | `Thetide	Тетида	Thétis	mère d'Achille ; non Téthys (la ligne du glossaire donne Téthys…)` → `Thetide	Фетида	Thétis	mère d'Achille ; non Téthys, épouse d'Océan (glossaire : ligne « Thetide (Nereide, madre d'Achille) »)` | вопрос 3
- fr/nettuno.glossary-new.tsv | стр. 1 | `Festo Pompeo	Фест Помпей	Festus Pompeius	grammairien; glossaire a Festo (Festus)` → `Festo Pompeo	Помпей Фест	Pompeius Festus	grammairien Sextus Pompeius Festus; …; « Festo » seul → Festus` | вопрос 5

## Правки в главах

### Вопрос 3 (Фетида / Тефида)
- ru | apollo | 474 (стих Клавдиана) | «Затем Тетида» → «Затем Тефида» | Клавдиан: Tethys, нянька Солнца и Луны
- ru | apollo | 492 (стих) | «милосердной Тетиде» → «милосердной Тефиде» | то же
- ru | apollo | 501 | «Почему Тетида держала Солнце» → «Почему Тефида…» | то же
- ru | QMARKS.md | 63 (цитата блока [?8] apollo, 2 раза) | «милосердной Тетиде» → «милосердной Тефиде» | синхронизация цитаты
- ru | catalogo-dei | 46 (п. 18) | «18 Тетида» → «18 Фетида» | прекраснейшая после Венеры — Нереида
- ru | catalogo-dei | 222 (примечание) | «…передано «Тетида» по глоссарию» → «…прекраснейшая морская Богиня после Венеры — Нереида Фетида, мать Ахилла (а не Тефида, жена Океана); передано «Фетида» по глоссарию» | то же
- en | catalogo-dei | 46 | «18 Tethys» → «18 Thetis» | то же
- en | catalogo-dei | 224 (note) | «rendered "Tethys" per the glossary, which gives a single form…» → «rendered "Thetis" per the glossary: … i.e. the Nereid Thetis, mother of Achilles (not Tethys, wife of Oceanus)» | то же
- fr | catalogo-dei | 46 | «18 Téthys» → «18 Thétis» | то же
- fr | catalogo-dei | 224 (note) | «variante de *Thetide* ; rendu « Téthys »…» → «variante de *Thetide* ; la plus belle déesse marine après Vénus est la Néréide Thétis, mère d'Achille (et non Téthys, épouse d'Océan) ; rendu « Thétis »…» | то же
- ru | gratie | 87 | «навстречу Тетиде» → «навстречу Фетиде» | идёт к Вулкану за оружием Ахилла
- en | gratie | 87 | «comes to meet Tethys» → «comes to meet Thetis» | то же (fr уже «Thétis»)
- ru | minerva | 517 | «пошла к нему Тетида» → «Фетида»; «давал Тетиде оружие» → «Фетиде» | оружие Ахилла, ларец Кипсела
- ru | minerva | 618 | «свадьбу Тетиды и Пелея» → «Фетиды» | свадьба Пелея
- ru | minerva | 631 (подпись к гравюре) | «свадьбу Пелея и Тетиды» → «Фетиды» | то же
- en | minerva | 517 ×2, 618, 631 | «Tethys» → «Thetis» (4 раза) | то же
- fr | minerva | 517 ×2, 618, 631 | «Téthys» → «Thétis» (4 раза) | то же
- ru | nettuno | 249 | «сопровождает Тетиду» → «Фетиду» | Гомер, Ил. XVIII: Фетида у Гефеста, Эвринома
- en | nettuno | 249 | «accompanies Tethys» → «accompanies Thetis» | то же
- fr | nettuno | 249 | «accompagne Téthys» → «accompagne Thétis» | то же
- ru | nettuno | 88 | «Нептуна, Тетиду, Дориду» → «Тефиду» | рядом с Океаном и Доридой — титанида (en/fr уже Tethys/Téthys)
- ru | nettuno | 232 (помета) | «<aside>Тетида</aside>» → «<aside>Тефида</aside>» | жена Океана
- ru | nettuno | 234 | «жену — Тетиду» → «Тефиду» | жена Океана
- ru | nettuno | 238 | «Тетида была старой» → «Тефида» | жена Океана
- ru | nettuno | 261 | «Нептуна, Тетиды, Дориды» → «Тефиды» | воды/морские божества рядом с Океаном
- (en/fr apollo «Tethys/Téthys» и en/fr nettuno 88, 232, 234, 238, 261 — уже верны, не менялись)

### Вопрос 5 (Помпей Фест)
- ru | apollo | 350 (помета) | «Фест Помпей» → «Помпей Фест»
- ru | apollo | 352 | «объясняет Фест Помпей» → «объясняет Помпей Фест» (дальше «Фест добавляет» — итал. «esso Festo», не менялось)
- en | apollo | 349 (aside) | «Festus» → «Pompeius Festus» (итал. помета «Festo Pompeo.»)
- en | apollo | 351 | «Festus seems to give» → «Pompeius Festus seems to give»
- fr | apollo | 349 (aside) | «Festus» → «Pompeius Festus»
- fr | apollo | 351 | «Festus semble rendre» → «Pompeius Festus semble rendre»
- ru | diana | 112 | «Фест Помпей пишет» → «Помпей Фест пишет» (итал. «Festo Pompeio scriue»)
- en | diana | 112 | «Festus writes that a mule» → «Pompeius Festus writes…»
- fr | diana | 112 | «Festus écrit qu'un mulet» → «Pompeius Festus écrit…»
- ru | giunone | 123 | «говорит Фест Помпей» → «говорит Помпей Фест»
- en | giunone | 123 | «as Festus Pompeius says» → «as Pompeius Festus says»
- fr | giunone | 123 | «le dit Festus Pompeius» → «le dit Pompeius Festus»
- ru | gran-madre | 134 (помета) | «Диодор. Фест Помпей. Куб» → «Диодор. Помпей Фест. Куб»
- ru | gran-madre | 138 | «вместе с Фестом Помпеем» → «вместе с Помпеем Фестом»
- en | gran-madre | 134 (aside) | «Festus Pompeius» → «Pompeius Festus»
- en | gran-madre | 138 | «with Festus Pompeius» → «with Pompeius Festus»
- fr | gran-madre | 134 (aside) | «Festus Pompeius» → «Pompeius Festus»
- fr | gran-madre | 138 | «avec Festus Pompeius» → «avec Pompeius Festus»
- ru | nettuno | 356 | «у Феста Помпея» → «у Помпея Феста»
- en | nettuno | 356 | «read also in Festus, where» → «read also in Pompeius Festus, where» (итал. «Festo Pompeo»)
- fr | nettuno | 356 | «chez Festus Pompeius» → «chez Pompeius Festus»
- ru | annotationi-pignoria | 485 | «у Феста Помпея и у Варрона» → «у Помпея Феста…»
- en | annotationi-pignoria | 484 | «in Festus Pompeius and Varro» → «in Pompeius Festus and Varro»
- fr | annotationi-pignoria | 484 | «chez Festus Pompeius et Varron» → «chez Pompeius Festus et Varron»

### Вопрос 6 (Акмон)
- ru | mercurio | 437 | «другого Алкмон» → «другого Акмон» | керкоп Акмон (en/fr уже Acmon)

### Вопрос 1 (Apolline)
- fr | catalogo-dei | 221 (note) | «(la forme « Apolline » du glossaire se lit…)» → «(la forme « Apolline » se lit…)» | глоссарий теперь сам даёт Apollon

## Итог по числу замен в главах
- ru: 25 — вопр. 3: 16 (apollo 3, catalogo-dei 2, gratie 1, minerva 4, nettuno 6) + QMARKS 1; вопр. 5: 8; вопр. 6: 1.
- en: 16 — вопр. 3: 8 (catalogo-dei 2, gratie 1, minerva 4, nettuno 1); вопр. 5: 8.
- fr: 16 — вопр. 3: 7 (catalogo-dei 2, minerva 4, nettuno 1); вопр. 5: 8; вопр. 1: 1 (примечание).

## Сомнения
- catalogo-dei п. 18: напечатано «Tethide», по описанию (красота после Венеры) выбрана Фетида; эпитет может быть у составителя каталога и неточным.
- nettuno 88 («Oceano, Nereo, Nettuno, Tetide, Dorida» — боги, которых сопровождают Нереиды) и 261: выбрана Тефида по соседству с Океаном и Доридой; Фетиду здесь тоже нельзя полностью исключить.
- en «Mouse» в глоссарии с заглавной, а в en-тексте животные строчные (en E3) — не менял. fr: в apollo «souris» строчными, в minerva «Souris» с заглавной — не унифицировал (вне поставленной задачи).
- Ru «Пасал» (en Passalus, fr Passalos) — не трогал.
