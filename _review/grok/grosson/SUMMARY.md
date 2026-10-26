# Grosson — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/grosson/`. Проверены все 249 записей grosson (pl1-1 … pl42-3, frag-1 … frag-26, greek-p1 … greek-p5, greek-4) в 13 пакетах. `books/` и `entries.json` не правились: ниже только сводка замечаний, подробности — в `<id>.json`, `notes.csv` (заметки), `attrs_check.csv` (сверка структурных полей и легенд с гравюрами).

**Структура книги.** Оригинал — французский (Гроссон, «Recueil des antiquités et monumens marseillois», 1773), поле `text_fr`, список абзацев (последний абзац часто — примечания). Переводы: `text_ru`, `text_en` (тоже списки абзацев). Заголовки: `fr`/`name_fr`, `ru`, `en`. Структурные поля `*_fr/_ru/_en`: `material`, `findspot`, `legend` (транскрипция надписи, во всех языках одинакова), у монет — `obverse`, `reverse`. Группа — `group_fr` («Planche N»). Гравюры: `img/plN-full.jpg` (целая доска), для фрагментов — `img/fragplate-1…5.jpg` (наборные таблицы; №5 — гравюра на дереве с греческими фрагментами). Поле `part` делит книгу на 5 частей (см. таблицу). Все доски просмотрены; надписи, подписи и выходные строки сверены по ним.

## Итог

| Часть | Записей | ok | minor | major | Уникальных issue_id |
|---|---|---|---|---|---|
| Часть 1 — монеты и медали (pl1–pl9) | 100 | 70 | 30 | 0 | 36 |
| Часть 2 — рельефы, статуэтки, саркофаги, архитектурные фрагменты (pl10–pl28) | 49 | 32 | 16 | 1 | 22 |
| Часть 3 — светильники, сосуды и утварь (pl29–pl33) | 40 | 28 | 12 | 0 | 10 |
| Часть 4 — постройки (pl34–pl36) | 3 | 2 | 1 | 0 | 2 |
| Часть 5 — надписи, эпитафии и фрагменты (pl37–pl42, frag-1…26, греческие фрагменты) | 57 | 29 | 28 | 0 | 34 |
| **всего** | **249** | **161** | **87** | **1** | **104** |

Итоговая строка `progress.csv`: `grosson,249,161,87,1`. Уникальный issue_id относится к части по первой записи, где он встречается (общие issue_id из разных частей считаются один раз).

### Уникальные ошибки и вхождения по полям

Одна ошибка = один `issue_id`. Общие issue_id (одна и та же ошибка в нескольких записях) считаются один раз; в списке записей указаны все места.

| Показатель | Значение |
|---|---|
| Уникальных ошибок (issue_id) | 104 |
| Объектов-замечаний в JSON (с повторами общих issue_id) | 121 |
| Общих issue_id (в нескольких записях) | 8 |
| Вхождений по полям (сумма длин `fields`, по уникальным) | 180 |
| из них подписей (caption_source) | 1 |

Вхождения по полям: text_ru — 79, text_en — 39, ru — 16, en — 12, fr — 8, name_fr — 8, findspot_ru — 3, reverse_ru — 2, obverse_ru — 2, text_fr — 2, reverse_fr — 1, legend_fr — 1, legend_ru — 1, legend_en — 1, findspot_fr — 1, findspot_en — 1, material_ru — 1, caption_ru — 1, caption_en — 1.

Уникальные ошибки по типу: mistranslation — 54, name — 18, typo — 14, addition — 13, omission — 5. Уверенность: low — 48, medium — 34, high — 22.

Общие issue_id: `pl7-4-1` — pl7-4, pl7-9, pl8-5; `pl16-4-1` — pl16-4, pl36-1, pl42-3, frag-6, frag-21; `pl20-1-1` — pl20-1, frag-13; `pl29-5-1` — pl29-5, pl30-6, pl31-4; `pl38-1-2` — pl38-1, pl38-4, pl41-5; `greek-p1-1` — greek-p1, greek-p2, greek-p3; `greek-p2-1` — greek-p2, greek-p3, greek-p4, greek-p5; `greek-p4-1` — greek-p4, greek-p5.

## Major

- `pl10-2-1` (pl10-2) — fr, name_fr, ru, en, legend_fr, legend_ru, legend_en, findspot_fr, findspot_ru, findspot_en — mistranslation, high: «заголовок «Autel de Cybèle (ex-voto de Navius Januarius)» / «Алтарь Кибелы (обет Навия Януария)» / «Altar of Cybele (votive offering of Navius Januarius)»; legend_* = надпись Навия Януария; findspot_* = «quartier des Pen …» → структурные поля смешивают два памятника. По тексту № 2 — алтарь со сфинксом и львом, долго служивший купелью в церкви Сен-Лоран (место находки не названо; «il n'en reste plus aujourd'hui de vestiges»); надпись MATRIS DEVM… NAVIVS IANVARIVS стоит на другом мраморе — барельефе из Ле-Пенн над дверью приходской церкви, который Гроссон приводит лишь как довод. На гравюре (pl10, № 2) на алтаре надписи …

Единственная major — `pl10-2` (по решению пользователя, правило aud11: структурные поля и заголовок описывают не тот памятник). `pl37-3-1` пользователь понизил до minor: заголовок называет верный предмет, но путает, кто кого отпустил; так же оценены другие заголовки, искажающие отношения лиц (`pl40-3-1`, `pl42-1-1`, `frag-26-1`, `greek-p4-1`).

## Ошибки по частям и типам

Каждый issue_id один раз — в части первой записи, где он встречается.

### Часть 1 — монеты и медали (pl1–pl9) — 36

#### mistranslation — 18

- `pl1-1-1` (pl1-1) — text_ru — mistranslation, low: «означают костюм того времени, который ещё встречается и в наши дни» → réparu — «снова появились», а не «ещё встречается»: «…означают костюм того времени, который вновь вошёл в моду в наши дни»
- `pl1-9-1` (pl1-9) — text_ru, text_en — mistranslation, low: «RU «Клеймо — звезда; на ней читаются буквы MASSA»; EN «The countermark is a star: the letters MASSA are read on it»» → y — «на ней (на монете)», а не «на звезде»: на гравюре (pl1-9) ΜΑΣΣΑ идёт вдоль края оборота, звёздочка рядом. RU «Клеймо — звезда; на монете читаются буквы MASSA»; EN «The countermark is a star; the letters MASSA can be read on the coin»
- `pl1-17-1` (pl1-17) — text_ru — mistranslation, medium: ««Затем после Афенополиса, и Ольбии, и Тавроиса, и Цитаристы, и Лакидона — порт марсельцев, а в нём и сама Массалия»» → post здесь наречие («далее»), названия — в им. п., а Lacydon и есть «порт марсельцев» (ради этого Гроссон и приводит цитату); в переводе выходит, что порт идёт после Лакидона. «Далее — Афинополь, и Ольбия, и Тавроис, и Китарист, и Лакидон, порт массилийцев, а при нём и сама Массилия»
- `pl3-4-1` (pl3-4) — text_en — mistranslation, low: «The countermark on the reverse is a star: on it one reads the abbreviation MASSA, in Greek characters.» → y — «на нём (на обороте)», а не «на звезде»: на гравюре (pl3-4) ΜΑΣΣΑ идёт вдоль края оборота, звёздочка в поле рядом с орлом (как в pl1-9-1). «The countermark on the reverse is a star; on the reverse one reads the abbreviation MASSA, in Greek characters». RU «на нём» двусмысленно, но допустимо (= на обороте)
- `pl3-8-1` (pl3-8) — text_ru — mistranslation, low: «а одно лишь крыло означало бы бесконечную длительность — как бы отсечённую от времени?» → coupée относится к l'Aile (крыло, отрезанное у Времени — Сатурна/Кроноса), а не к durée: «…а одно лишь крыло, как бы отсечённое у Времени, означало бы бесконечную длительность?»
- `pl4-12-1` (pl4-12) — text_ru, text_en — mistranslation, low: «RU «воздавали ту же честь Богине, которая им покровительствовала»; EN «paid the same homage to the Goddess who was their protectress»» → en = «Наук и Искусств», а не «марсельцев»: в переводах выходит, что Минерва покровительствовала марсельцам. RU «…воздавали ту же честь Богине, покровительнице Наук и Искусств»; EN «…to the Goddess who was the protectress of the Sciences and Arts»
- `pl5-4-1` (pl5-4) — text_ru, text_en — mistranslation, low: «RU «на доброкачественных монетах, предъявляемых к обмену»; EN «onto sound coins that were presented for exchange»» → la monnoie здесь — Монетный двор (куда монету приносили на проверку/перечеканку), а не «обмен». RU «…на доброкачественных монетах, которые приносили на Монетный двор»; EN «…onto sound coins brought to the Mint»
- `pl6-3-1` (pl6-3) — text_ru — mistranslation, low: «обозначающие треть золотого солида, то есть три золотых солида» → ou — «или» (Гроссон даёт два альтернативных толкования), а не «то есть» (выходит, что треть солида = три солида). «…обозначающие треть золотого солида или же три золотых солида». EN «or the three gold sols» верно
- `pl7-1-1` (pl7-1) — text_ru — mistranslation, low: «поскольку Хлотарю II было лишь 29 лет, когда он стал единственным королём» → dans sa 29e année — «шёл 29-й год» (т.е. 28 лет; ср. 584 + 4 мес. → 613). «…поскольку Хлотарю II шёл лишь 29-й год, когда он стал единственным королём Французской монархии». EN «in his 29th year» верно
- `pl7-1-2` (pl7-1) — text_ru — mistranslation, low: «испанские готы, всегда противостоявшие франкам, даже по эту сторону Пиренеев в Лангедоке, со времени великого поражения войска Хлодвига под Арлем платили дань французским королям» → depuis… относится к «toujours tenu tête» (противостояли со времени поражения под Арлем), а в RU выходит, что дань платили со времени поражения. «…испанские готы, которые со времени великого поражения войска Хлодвига под Арлем всегда противостояли франкам, даже по эту сторону Пиренеев, в Лангедоке, стали данниками французских королей во времена, когда в Испании правил Гондемар». EN (с запятыми) пер …
- `pl8-3-1` (pl8-3) — text_ru, ru, reverse_ru — mistranslation, medium: «text_ru «процветший крест» (дважды); ru «… / процветший крест — эпоха виконтов»; reverse_ru «процветший крест (с расширяющимися концами)»» → croix cléchée — крест с концами в виде ушка ключа (тулузский/окситанский крест, о котором и говорит Гроссон: «ainsi que les Comtes de Toulouse»), а «процветший» — это croix fleuronnée/fleurie. Предлагается «ключевидный крест (croix cléchée)» в text_ru, ru и reverse_ru. Не уверен в устоявшемся русском геральдическом термине — допустимо оставить «croix cléchée» с пояснением «тулузского типа»
- `pl8-4-1` (pl8-4) — text_ru, text_en — mistranslation, medium: «RU «Эта эпоха начинается лишь с утверждения последних в Галлии»; EN «This period dates only from the establishment of the latter in Gaul»» → ces premiers — «первые», т.е. франки (а не остготы — «последние»): дальше Гроссон и объясняет, что франков в Галлию привёл лишь Хлодвиг. RU «…лишь с утверждения первых из них (франков) в Галлии»; EN «…from the establishment of the former (the Franks) in Gaul»
- `pl8-6-1` (pl8-6) — text_ru, text_en — mistranslation, low: «RU «На оборотах монет тех эпох нередко читаются prima, secunda и т. д.»; EN «One often reads on the reverses of medals of these periods, prima, secunda, etc.»» → des époques — дополнение к «on lit» («читаются обозначения очерёдности/эпох — prima, secunda…»), а не «монет тех эпох». RU «На оборотах монет нередко читаются обозначения очерёдности — prima, secunda и т. д. — буквами, прибавленными без разделения в конце последних слов легенды»; EN «One often reads on medal reverses ordinal marks — prima, secunda, etc. — given by letters added…»
- `pl9-5-1` (pl9-5) — text_ru — mistranslation, low: «в намёке на его предприятия, которые он выдавал за ложный предлог общественного блага» → colorer de — «прикрывать, приукрашивать»: он прикрывал свои предприятия ложным предлогом общественного блага, а не «выдавал их за предлог». «…намекая на свои предприятия, которые он прикрывал ложным предлогом общественного блага». EN верно
- `pl9-6-1` (pl9-6) — text_ru — mistranslation, low: «все они из среднебронзового сплава» → moyen bronze — нумизматическая категория по размеру («средняя бронза»), а не сплав: «все они — средней бронзы (среднего модуля)». EN «medium bronze» верно
- `pl9-6-2` (pl9-6) — text_ru, text_en — mistranslation, low: «RU «помещая на своих монетах Божество, бывшее их покровителем»; EN «the Divinity that was their protectress»» → en = «этих Искусств» (как в pl4-12-1): RU «…Божество, покровительствовавшее этим Искусствам»; EN «…the Divinity who was the protectress of those Arts»
- `pl9-10-1` (pl9-10) — text_ru — mistranslation, low: «(и там, где была Рода родосцев, откуда назван самый полноводный из галльских рек — Родан)» → в скобочном переводе цитаты рассогласование («самый … из рек»), пропущено multò («намного»), fertilissimus — «самый плодородный/обильный», а не «полноводный»: «(и где была Рода родосцев, откуда получила имя Родан — намного самая плодоносная из рек Галлии)». EN цитату не переводит
- `pl9-10-2` (pl9-10) — text_ru — mistranslation, low: «Почему эти последние никогда не фигурировали в разделах владений между марсельцами и галлами?» → divisions — «распри, раздоры», не «разделы владений»: «Почему эти последние никогда не участвовали в распрях между марсельцами и галлами?»

#### name — 5

- `pl1-12-1` (pl1-12) — text_ru — name, low: «между Тулоном и Сьота» → la Ciotat — Ла-Сьота (артикль входит в название): «между Тулоном и Ла-Сьота»
- `pl7-4-1` (pl7-4, pl7-9, pl8-5) — text_ru, ru, obverse_ru — name, high: «text_ru «Карибера, или Керебера» … «Кариберу, иначе Хереберу»; ru «… — Карибер»; obverse_ru «бюст Карибера (Керебера)»» → Caribert / Cherebert у Гроссона — один король, Хариберт I (сын Хлотаря I, ум. 567); стандартная русская форма — «Хариберт». Сейчас в RU два варианта — «Карибер» и «Керебер» (плюс один раз «Херебер»). Предлагается: при первом упоминании «Хариберт (Caribert, или Cherebert)», дальше везде «Хариберт»; ru-заголовок «… — Хариберт»; obverse_ru «бюст Хариберта». Применить ко всем записям, где это тот же к …
- `pl8-3-3` (pl8-3) — text_ru — name, medium: «упомянута г-ном Бутрувом в его любопытных изысканиях о монетах Франции» → Bouterove — типографское написание (v вместо u) фамилии Claude Bouteroue, автора «Recherches curieuses des monoyes de France» (1666); по-русски «Бутру». «…упомянута г-ном Бутру (у Гроссона — Bouterove) в его «Любопытных изысканиях о монетах Франции»». EN сохраняет написание оригинала — допустимо
- `pl9-1-1` (pl9-1) — text_ru — name, low: «Сеньория Сен-Марсель, Йер, Бреганзон» → Bréganson/Brégançon — «Брегансон» (форт Брегансон): «…Йер, Брегансон…»
- `pl9-5-2` (pl9-5) — text_ru, obverse_ru — name, low: «text_ru «Карлу де Казо»; obverse_ru «герб Карла де Казо»» → марсельский консул XVI в. — по-русски «Шарль де Казо» (Карл — для государей: Карл I Анжуйский). «…слишком печально известному Шарлю де Казо»; obverse_ru «герб Шарля де Казо»

#### typo — 4

- `pl6-8-1` (pl6-8) — text_ru — typo, low: «которая представляется мне одним из тех накидок, что древние называли хламидой» → согласование: «…одной из тех накидок, что древние называли хламидой»
- `pl7-4-2` (pl7-4) — text_ru — typo, low: ««Арибер­ту», «Арибер­т» (внутри слов мягкий перенос U+00AD)» → убрать невидимые мягкие переносы (U+00AD) в «Ариберту», «Ариберт» — единственный такой символ во всём entries.json; мешает поиску
- `pl8-2-1` (pl8-2) — text_ru — typo, low: «оба они в равной мере обладали сувереном над Марселем» → Souveraineté — «суверенитет», не «суверен»: «…оба они в равной мере обладали суверенитетом над Марселем»
- `pl9-7-1` (pl9-7) — text_ru — typo, low: «У города Афины были подобные монеты.» → «У Афин были подобные монеты» (или «У города Афин…»)

#### addition — 7

- `pl1-4-1` (pl1-4) — text_ru, text_en — addition, high: «RU «[На гравюре внизу читается ΛΛΕ, а не AAE — расхождение с текстом Гроссона.]»; EN «[The engraving reads ΛΛΕ at the bottom, not AAE — a discrepancy with Grosson's text.]»» → в переводах добавлено примечание переводчика в квадратных скобках — у Гроссона его нет. Из text_ru/text_en убрать; наблюдение по гравюре (оно верно, см. legend_*) перенести в отдельное поле примечания
- `pl1-5-1` (pl1-5) — text_ru, text_en — addition, high: «RU «[На гравюре внизу видно четыре знака, примерно ΑΗΠΙ, а не только Α, Η, как у Гроссона — чтение предположительное.]»; EN «[The engraving shows four characters at the bottom, roughly ΑΗΠΙ, not just Α, Η as in Grosson's …» → в переводах добавлено примечание переводчика в квадратных скобках — у Гроссона его нет. Из text_ru/text_en убрать; наблюдение по гравюре (оно верно, см. legend_*) перенести в отдельное поле примечания. Здесь примечание к тому же ещё и стоит не на месте: в конце §1 (о причёске), хотя относится к §2 (о реверсе)
- `pl1-10-1` (pl1-10) — text_ru, text_en — addition, high: «RU «[На самой гравюре внизу видны буквы A и Λ, а не два Λ — расхождение с текстом Гроссона.]»; EN «[The engraving itself shows A and Λ below, not two Λ's — a discrepancy with Grosson's text.]»» → в переводах добавлено примечание переводчика в квадратных скобках — у Гроссона его нет. Из text_ru/text_en убрать; наблюдение по гравюре (оно верно, см. legend_*) перенести в отдельное поле примечания
- `pl1-11-1` (pl1-11) — text_ru, text_en — addition, high: «RU «[На гравюре внизу читается ТАΛ, а не ТАА — расхождение с текстом Гроссона.]»; EN «[The engraving reads TAΛ at the bottom, not TAA — a discrepancy with Grosson's text.]»» → в переводах добавлено примечание переводчика в квадратных скобках — у Гроссона его нет. Из text_ru/text_en убрать; наблюдение по гравюре (оно верно, см. legend_*) перенести в отдельное поле примечания
- `pl2-7-1` (pl2-7) — text_ru, text_en — addition, high: «RU «[Начертание нижних букв на самой гравюре читается не вполне однозначно; следуем чтению Гроссона.]»; EN «[The engraving's lower letters are not entirely unambiguous on close inspection; Grosson's own reading is follow …» → в переводах добавлено примечание переводчика в квадратных скобках — у Гроссона его нет (тот же случай, что pl1-4-1/pl1-5-1/pl1-10-1/pl1-11-1). Из text_ru/text_en убрать; наблюдение (на гравюре внизу четыре знака, приблизительно ΗΤΠΛ — проверить по фото) перенести в отдельное поле примечания
- `pl5-9-1` (pl5-9) — text_ru, reverse_ru — addition, low: «text_ru «…и двух фригийских колпаков свободы»; reverse_ru «…и двумя фригийскими колпаками свободы»» → «фригийских» добавлено переводчиком: у Гроссона просто bonnets de la liberté (reverse_fr — «deux bonnets de la liberté», EN «caps of liberty» без добавки); на гравюре (pl5-9) колпаки колоколовидные (пилосы Диоскуров), не фригийские. RU «…и двух колпаков свободы»; reverse_ru «…и двумя колпаками свободы»
- `pl8-3-2` (pl8-3) — reverse_fr — addition, high: «reverse_fr «croix clechée (с расширяющимися, process концами), légende MASILIA»» → во французское поле попал мусор — русские слова «с расширяющимися … концами» и «process»; это поле оригинала (не перевод). Убрать только мусор: «croix clechée, légende MASILIA». Обе части подтверждены текстом статьи — «une Croix clechée, avec ce mot, MASILIA» (text_fr §1); на гравюре (pl8-full, №3) MASILIA тоже читается вокруг креста. Пояснение о форме концов в fr-поле не нужно: в тексте его нет

#### omission — 2

- `pl1-6-1` (pl1-6) — text_ru — omission, low: «причёска — в заплетённых косах, подвязанных лентами» → пропущено retroussées («подобранные, поднятые»; EN «swept up» передаёт): «причёска — из подобранных кос, подвязанных лентами»
- `pl7-1-3` (pl7-1) — text_ru — omission, low: «чтобы отомстить за их сестру Хлотильду жестокости Амальрика, короля вестготов» → Amauri — франкская форма имени вестготского короля Амалариха (Amalaric, 511–531): контекст подтверждает — муж Хлотильды, дочери Хлодвига, принуждал её к арианству, поход Хильдеберта (и Хлотаря) в Испанию 531 г. Пропущен вариант «Amauri ou» (EN сохраняет), и конструкция «отомстить … жестокости» неграмматична. «…чтобы отомстить за жестокости, которые терпела их сестра Хлотильда от Амалариха (Amauri) …

### Часть 2 — рельефы, статуэтки, саркофаги, архитектурные фрагменты (pl10–pl28) — 22

#### mistranslation — 10

- `pl10-1-1` (pl10-1) — text_en — mistranslation, low: «one sees the Bust of the tutelary Divinity of the Family, set upon a herm.» → pieu — «столб, кол»; «herm» — толкование переводчика (Гроссон говорит о гаинах только в §3). «…set upon a post». RU «на столбе» верно
- `pl10-2-1` (pl10-2) — fr, name_fr, ru, en, legend_fr, legend_ru, legend_en, findspot_fr, findspot_ru, findspot_en — mistranslation, high: «заголовок «Autel de Cybèle (ex-voto de Navius Januarius)» / «Алтарь Кибелы (обет Навия Януария)» / «Altar of Cybele (votive offering of Navius Januarius)»; legend_* = надпись Навия Януария; findspot_* = «quartier des Pen …» → структурные поля смешивают два памятника. По тексту № 2 — алтарь со сфинксом и львом, долго служивший купелью в церкви Сен-Лоран (место находки не названо; «il n'en reste plus aujourd'hui de vestiges»); надпись MATRIS DEVM… NAVIVS IANVARIVS стоит на другом мраморе — барельефе из Ле-Пенн над дверью приходской церкви, который Гроссон приводит лишь как довод. На гравюре (pl10, № 2) на алтаре надписи …
- `pl14-3-1` (pl14-3) — text_en — mistranslation, low: «at Santa Maria della Navicella, which gave this monument its surname:» → наоборот: памятник (ладья) дал церкви прозвание «della Navicella». «…at Santa Maria della Navicella, which owes this surname to the monument:». RU верно
- `pl15-1-1` (pl15-1) — text_ru, text_en — mistranslation, medium: «RU «(высота 1/2 фута до кольца)»; EN «(height 1/2 foot up to the ring)»» → écrou — «гайка» (крепёж внизу фигуры, виден на гравюре pl15 № 1 под ногами), не «кольцо»: RU «(высота 1/2 фута до гайки)»; EN «(height 1/2 foot up to the nut)»
- `pl15-2-1` (pl15-2) — text_en, en — mistranslation, medium: «text_en «playing a blow-gun (sarbacane)»; en «Small bronze: Priest of Jupiter playing a blow-gun»» → jouer de — «играть на» (инструменте); на гравюре (pl15 № 2) фигура дует в длинную трубу с раструбом — духовой инструмент, а не духовое ружьё. EN «playing a pipe (sarbacane)»; en «Small bronze: Priest of Jupiter playing a pipe». RU «на сарбакане (духовой трубке)» допустимо
- `pl16-3-1` (pl16-3) — text_ru — mistranslation, low: «но после смерти этого государя монахи Сен-Виктора потребовали…» → Генрих Ангулемский (внебрачный сын Генриха II, губернатор Прованса) не был государем; Prince здесь — «принц». «…после смерти этого принца…». EN «this Prince» допустимо
- `pl17-2-1` (pl17-2) — text_en — mistranslation, medium: «represents a horn or hunting-cup,» → cornet à bouquin — рожок из рога (пастушья/сигнальная труба), а не «чаша»: «…represents a horn or a cow-horn trumpet (cornet à bouquin)». RU «охотничий рожок» допустимо
- `pl18-1-1` (pl18-1) — text_ru — mistranslation, low: «это была своего рода риза, которую современные гречанки…» → rochet — короткое белое облачение (роше, род стихаря), а «риза» — фелонь/казула, длинное верхнее облачение священника; смысл «короткая верхняя туника до колен» теряется. «…своего рода роше (короткий стихарь)…». EN «rochet» верно
- `pl27-1-1` (pl27-1) — text_en — mistranslation, medium: «that these capitals had not been made as a matter of principle to decorate these places;» → de principe — «изначально» (ср. pl23-2 «destinées de principe» → «originally intended»): «…had not originally been made to decorate these places». RU «изначально» верно
- `pl28-3-1` (pl28-3) — text_ru, text_en, en — mistranslation, medium: «RU «семью львиными головами, держащими широкие прутья»; EN «seven lion's heads holding broad rods»; en «Tomb with lion-head handles…»» → tenir à — «быть прикреплённым к»; baguettes — широкие рёбра (валики) крышки. На гравюре (pl28 № 3) семь львиных масок на концах рёбер двускатной крышки, ничего не держат; ручек нет. RU «…семью львиными головами на концах широких рёбер»; EN «…seven lion's heads set at the ends of broad ribs»; en «Tomb with lion heads and a medallion of a magistrate or man of letters»

#### name — 5

- `pl10-2-2` (pl10-2) — text_ru — name, medium: «в местности, называемой Пеннес; …на двери прихода Пеннес» → Les Pennes (ныне Ле-Пенн-Мирабо): конечное -s не читается; в pl20-2 тот же топоним передан «Пенн» («селение Пенн») — унифицировать: «…в местности, называемой Пенн…», «…прихода Пенн». (findspot_ru — в составе pl10-2-1)
- `pl11-1-3` (pl11-1) — text_ru — name, low: «по свидетельству Руффи (22); …если верить историку Руффи» → во всех остальных записях RU — «Рюффи» (pl8-3, pl9-4, pl15-3 и др., 43 записи); здесь дважды «Руффи» (§3, §9). Унифицировать: «Рюффи»
- `pl17-1-1` (pl17-1) — text_en, en — name, medium: «text_en «to Artemon, wife of Apollonius Icesius»; en «…for Artemon, wife of Apollonius Icesius»» → Artemon — мужская форма; у Гроссона женское имя Artemone (греч. ΑΡΤΕΜΟΥΝ, вин. п.). EN «Artemone» в text_en и en. RU «Артемоне» верно
- `pl20-1-2` (pl20-1) — text_ru — name, medium: «Гене» → Guesnay в RU по всей книге — «Генэ» (18 вхождений в 14 записях: pl38-3, pl39-4, pl40-1, pl40-2, pl42-2, frag-*, greek-p*); здесь «Гене» (2 вхождения: «Рюффи и Гене (66)» и далее). Унифицировать: «Генэ». (Исправление к батчу 10: бывший pl38-3-1 перенесён сюда и переименован — в pl38-3 форма верная.)
- `pl25-1-1` (pl25-1) — text_ru, findspot_ru — name, low: «text_ru «дома г-на Мульер»; findspot_ru «фундамент дома г-на Мульер, в конце Курса»» → фамилия не склонена: «дома г-на Мульера» (text_ru и findspot_ru)

#### typo — 5

- `pl11-1-4` (pl11-1) — text_ru — typo, low: «как я недавно видел в Экс(е) на здании, построенном римлянами» → служебный вариант «Экс(е)» остался в тексте: «…как я недавно видел в Эксе…»
- `pl15-4-1` (pl15-4) — text_ru — typo, low: «Подобно тому как марселькие женщины могли перенять…» → опечатка: «марсельские» (лучше «марсельянки»/«марсельские женщины»)
- `pl16-4-1` (pl16-4, pl36-1, pl42-3, frag-6, frag-21) — text_ru — typo, high: ««в подвалах Сен-Соверa» (§4 и примечание 48) — последняя буква латинская a» → смешение алфавитов: «Сен-Совёра» с кириллической «а» (2 места), в форме заголовков/findspot_ru («Сен-Совёр»). Та же ошибка в pl36-1, pl42-3, frag-6, frag-21 — см. notes.csv
- `pl19-2-1` (pl19-2) — text_ru — typo, high: «который отослал его графу де Брienne.» → смешение алфавитов (латинские «ienne» в кириллическом слове) и нет падежа: «…графу де Бриенну»
- `pl20-1-1` (pl20-1, frag-13) — text_ru — typo, high: «упоминают некоего Марка Кария Максимина и некоего Марка Кария Пакату.» → Pacatus — мужское имя; вин. п. «Паката»: «…и некоего Марка Кария Паката»

#### addition — 2

- `pl11-1-1` (pl11-1) — text_ru — addition, medium: «(«О Цицерон, если бы ты так говорил [на суде], Милону не пришлось бы есть бородатых рыб [т.е. питаться в изгнании]!»)» → в скобочный перевод цитаты вставлены пояснения переводчика в квадратных скобках — у Гроссона их нет (тот же тип, что pl1-4-1). Оставить перевод без вставок: «(О Цицерон, если бы ты так говорил, Милон не ел бы бородатых рыб!)»; толкование при желании — в отдельное примечание
- `pl11-1-2` (pl11-1) — text_en — addition, low: «It was of this speech that Milo is said to have exclaimed, after reading it:» → «is said to» — добавленная оговорка: Гроссон утверждает прямо («Milon s'écria»). «It was of this speech that Milo exclaimed, after reading it:»

### Часть 3 — светильники, сосуды и утварь (pl29–pl33) — 10

#### mistranslation — 5

- `pl29-6-1` (pl29-6) — text_ru, text_en — mistranslation, medium: «RU «две небольшие цепочки»; EN «two small chains»» → brochettes — «стерженьки, штырьки», не цепочки; на гравюре (pl29 № 6) сбоку торчит короткий штырёк, цепей нет. RU «…и два небольших стерженька…»; EN «…and two small pins…»
- `pl31-7-1` (pl31-7) — text_ru, text_en — mistranslation, medium: «RU «следовательно, их назначение было множественным»; EN «they were therefore put to multiple uses»» → d'un usage multiplié — «в широком (частом) употреблении»: разные формы → много изготовлялось, а не «много назначений». RU «…следовательно, они были в широком употреблении»; EN «…they were therefore in widespread use»
- `pl32-1-1` (pl32-1) — ru, material_ru, text_ru — mistranslation, high: «ru «Патера из яшмы (нефрита)»; material_ru «яшма (нефрит)»; text_ru «Патера из яшмы (нефрита)»» → jade — «нефрит» (жадеит); «яшма» — jaspe, другой камень. ru «Патера из нефрита»; material_ru «нефрит»; text_ru «Патера из нефрита…»
- `pl32-3-1` (pl32-3) — fr, name_fr, ru, en — mistranslation, medium: «fr/name_fr «Autel en marbre blanc (consacré à Cybèle)»; ru «…(посвящённый Кибеле)»; en «…(consecrated to Cybele)»» → заголовок делает атрибуцию категоричной; у Гроссона — «Кибеле или иному божеству плодов земли». fr «Autel en marbre blanc (Cybèle ou divinité des productions de la terre)»; ru «Алтарь из белого мрамора (Кибеле или иному божеству плодородия)»; en «White-marble altar (to Cybele or another deity of the earth's produce)»
- `pl32-6-1` (pl32-6) — text_ru — mistranslation, low: «Они были помещены под двумя небольшими кирпичными сводами» → en maçonnerie — «каменная кладка», материал (кирпич) не указан: «…под двумя небольшими сводами из кладки». EN «masonry» верно

#### name — 3

- `pl29-5-1` (pl29-5, pl30-6, pl31-4) — text_ru, findspot_ru — name, low: «text_ru «в квартале Paradis»; findspot_ru «квартал Paradis»» → топоним оставлен латиницей; в pl21-2 RU — «кладбище Паради». Унифицировать: «в квартале Паради» / «квартал Паради»
- `pl30-4-1` (pl30-4) — text_ru — name, high: «Г-н Крепс, комиссар флота, владеет совершенно подобной;» → фамилия искажена (перестановка букв): Cresp → «Кресп». EN «M. Cresp» верно
- `pl30-5-1` (pl30-5) — text_en — name, medium: «lacrimatories, preféricules, lamps, and paterae» → полуфранцузская форма с ошибочным акцентом; в pl31-3 EN тот же термин — «praefericula». Унифицировать: «lacrimatories, praefericula, lamps, and paterae»

#### typo — 1

- `pl33-8-1` (pl33-8) — text_ru — typo, high: «лараriях» → смешение кириллицы и латиницы («ri» латинскими буквами): «в ларариях»

#### addition — 1

- `pl31-2-1` (pl31-2) — text_ru, text_en — addition, medium: «RU «была принята, как мне казалось, лишь одними марсельцами»; EN «its singular shape, I believed, had been adopted by the Marseillais alone»» → оговорка «как мне казалось» / «I believed» добавлена переводчиками (видимо, ради согласования с прим. 83, где Гроссон сам признаёт ошибку). В тексте — прямое утверждение: RU «…была принята лишь одними марсельцами»; EN «…had been adopted by the Marseillais alone»; поправку оставить прим. 83

### Часть 4 — постройки (pl34–pl36) — 2

#### mistranslation — 1

- `pl36-1-1` (pl36-1) — text_en — mistranslation, low: «On the west side, at the far left end, in the northern part … Everything else indicates this hall was intended» → 1) у Гроссона два места (западная часть И левый конец в северной части — отсюда «deux arceaux»; ниже «celle qui est à la partie de l'ouest» отличает одну нишу от другой); EN сливает их в одно. «On the west side, and at the far end of the left side in the northern part, there are two arches…». 2) «Tout indique au reste» — «впрочем, всё указывает», а не «всё прочее»: «Moreover, everything indicates …

#### omission — 1

- `pl36-1-2` (pl36-1) — caption_ru, caption_en — omission, medium: «надписей плана в полях нет (буквенные отсылки A–R объяснены в §17, но стороны света и масштаб — нет)» → гравированные надписи на плане вынести в отдельные поля подписи (не удалять, не вставлять в текст). caption_orig: «Nord · Sud · Est · ouest · Echele de [8 4 — проверить по фото] … 20 cannes»; caption_ru: «Север · Юг · Восток · Запад · Масштаб … 20 канн»; caption_en: «North · South · East · West · Scale … 20 cannes». Мелкие цифры после «Echele de» неразборчивы — проверить по фото

### Часть 5 — надписи, эпитафии и фрагменты (pl37–pl42, frag-1…26, греческие фрагменты) — 34

#### mistranslation — 20

- `pl37-3-1` (pl37-3) — fr, name_fr, ru, en — mistranslation, high: «fr/name_fr «Pierre sépulcrale de Carmolaus, affranchi par Charles»; ru «Надгробный камень Кармолая, отпущенного на волю Карлом»; en «Sepulchral stone of Carmolaus, freed by Charles»» → заголовок искажает смысл: у Гроссона вольноотпущенник — Карл, воздвигший памятник Кармолаю, сыну Фрасона; Кармолая никто не отпускал. fr «Pierre sépulcrale de Carmolaus, érigée par Charles l'affranchi»; ru «Надгробный камень Кармолая, воздвигнутый вольноотпущенником Карлом»; en «Sepulchral stone of Carmolaus, raised by Charles the freedman»
- `pl37-4-1` (pl37-4) — ru, text_ru, text_en — mistranslation, medium: «ru «Киппа Огнеты»; text_ru «Огнета, покойся…», «к манам усопшей», «её прах»; text_en «her ashes»» → у Гроссона Огнет — мужчина («du défunt»). ru «Киппа Огнета»; text_ru «Огнет, покойся…», «к манам усопшего», «его прах»; text_en «his ashes»
- `pl38-1-1` (pl38-1) — text_ru, text_en — mistranslation, medium: «RU «плотничий топорик (ascia)»; EN «a carpenter's adze»» → marteau taillant — каменотёсный молоток; Гроссон дальше прямо говорит, что это «le marteau taillant des Maçons, le vrai Ascia», а не топор. RU «каменотёсный молоток (ascia)»; EN «a mason's cutting hammer (ascia)»
- `pl38-1-2` (pl38-1, pl38-4, pl41-5) — text_ru, text_en — mistranslation, medium: «RU «рельефно изображены»; EN «shows in relief»» → en creux — углублённо, врезанным контуром (не рельеф). RU «на ней врезаны…»; EN «it shows, incised, …»
- `pl39-2-1` (pl39-2) — fr, name_fr, ru, en — mistranslation, medium: «fr/name_fr «Épitaphe grecque de Zosime, par Thallusa»; ru «Греческая эпитафия Зосима от Таллусы»; en «Greek-named epitaph of Zosimus, by Thallusa»» → надпись латинская (D.M. ZOSIMO SODALI THALLVSA); у Гроссона греческое только имя. К тому же en не совпадает с fr/ru. fr «Épitaphe de Zosime (nom grec), par Thallusa»; ru «Эпитафия Зосима (греческое имя) от Таллусы»; en «Epitaph of Zosimus (a Greek name), by Thallusa»
- `pl40-3-1` (pl40-3) — fr, name_fr, ru, en — mistranslation, medium: «fr/name_fr «Épitaphe de Marcius Eutyches, par son père Lenaeus»; ru «Эпитафия Марция Эвтиха от его отца Ленея»; en «Epitaph of Marcius Eutyches, by his father Lenaeus»» → у Гроссона Марций и Эвтих — двое, а сын — Жадей (Jadéus); заголовок сливает имена и делает сыном «Марция Эвтиха». По тексту: fr «Épitaphe de Marcius et Eutyches, par Lenaeus (à son fils Jadéus)»; ru «Эпитафия Марция и Эвтиха от Ленея (сыну Жадею)»; en «Epitaph of Marcius and Eutyches, by Lenaeus (to his son Jadeus)». Чтение Гроссона само по себе путаное — Не уверен в лучшей формулировке
- `pl41-5-2` (pl41-5) — text_en — mistranslation, medium: «which gave rise to naming the color of Tyre, Tirida, after purple» → смысл перевёрнут: это пурпур получил название «тирский цвет», Tirida, а не наоборот. «…which had led to purple being given the name of Tyrian color, Tirida». RU верно
- `pl41-5-3` (pl41-5) — text_ru — mistranslation, low: «узкая пурпурная полоса (Angusticlave) — одеяние римских всадников — хранилась» → у Гроссона Angusticlave — одежда всадников (в §7 — одеяние с узкими пурпурными полосами), а не сама полоса. «…что Angusticlave, одеяние римских всадников, хранилась…». EN верно
- `pl42-1-1` (pl42-1) — fr, name_fr, ru, en — mistranslation, medium: «fr/name_fr «Épitaphe de Calpurnia, élève d'Onesime»; ru «Эпитафия Кальпурнии, воспитанницы Онесима»; en «Epitaph of Calpurnia, pupil of Onesimus»» → у Гроссона воспитанница Онесима — одна из двух посвятительниц (тоже из рода Кальпурниев), а не покойная. fr «Épitaphe de Calpurnia, élevée par deux personnes, dont une Calpurnia élève d'Onesime»; ru «Эпитафия Кальпурнии, воздвигнутая двумя лицами, одно из которых — Кальпурния, воспитанница Онесима»; en «Epitaph of Calpurnia, raised by two persons, one a Calpurnia, pupil of Onesimus»
- `pl42-2-1` (pl42-2) — text_ru, text_en — mistranslation, medium: «RU «как самые изысканные благовония»; EN «as much as ever-improving spices»» → mieilleux = mielleux, «медвяные, сладкие как мёд» (перевод MELEARITA); EN «ever-improving» — ошибка, RU потерял «toujours mieilleux». RU «…как всегда медвяные благовония»; EN «…as much as ever-honeyed spices»
- `pl42-3-2` (pl42-3) — text_ru — mistranslation, low: «префекту дарданской когорты» → у Гроссона — «когорты троянцев» (так он понимает DARDANORVM); RU подставляет правильное латинское значение. По тексту: «префекту когорты троянцев». EN «Trojan» верно. Не уверен, нужна ли правка (смысл близок)
- `frag-6-1` (frag-6) — text_ru — mistranslation, medium: «офицера» → Officier здесь — должностное лицо ремесленной коллегии, не военный; ниже в том же абзаце RU сам пишет «должностных лиц». «…благочестию некоего должностного лица одной из марсельских ремесленных коллегий». EN «Officer» допустимо
- `frag-10-1` (frag-10) — text_ru, text_en — mistranslation, low: «RU «с согласия Дунния»; EN «with the consent of Dunnius»» → у Гроссона «avec la participation» — «при участии», а не «с согласия». RU «при участии Дунния…»; EN «with the participation of Dunnius…»
- `frag-13-1` (frag-13) — text_ru, text_en — mistranslation, low: «RU «своему прелюбящему брату»; EN «his most loving brother»» → у Гроссона «très-pieux», и примечание 46 объясняет именно PIVS (семейная почтительность). RU «своему преблагочестивому брату» (как в других записях); EN «his most dutiful brother»
- `frag-16-1` (frag-16) — text_ru — mistranslation, low: ««его милая, его нежная, или его дорогая воспитанница»» → говорят кормилицы (Elles) — «sa» здесь «её», не «его». «её милая, её нежная или её дорогая воспитанница». EN «his/her» допустимо
- `frag-20-1` (frag-20) — text_ru — mistranslation, medium: «миловидный раб Гая» → «раб» добавлен — он вольноотпущенник; mignon здесь «любимец, фаворит». «Гай Постумий Вольноотпущенник, любимец Гая, завещав…». EN «Caius's pretty favorite» близко к тексту
- `frag-21-1` (frag-21) — text_ru — mistranslation, medium: «но нам нечего предъявить» → смысл перевёрнут: доказательств нет у противников, а не «у нас». «…но им нечего нам предъявить». EN «none can be produced» верно
- `frag-21-2` (frag-21) — text_ru, text_en — mistranslation, medium: «RU «дал двенадцать корзин для этого памятника»; EN «gave twelve baskets for this monument»» → у Гроссона дан памятник, а двенадцать корзин — предмет освящения (отчёт о расходах на освящение двенадцати корзин). RU «Отчитавшись в расходе, понесённом общиной по случаю освящения двенадцати корзин, дал этот памятник»; EN «Having rendered account of the expense incurred by the Community for the consecration of twelve baskets, gave this monument»
- `frag-26-1` (frag-26) — fr, name_fr, ru, en — mistranslation, medium: «fr/name_fr «Épitaphe de Publius Aelius Eutyches, par son affranchi Secundus»; ru «…от его вольноотпущенника Секунда»; en «…by his freedman Secundus»» → у Гроссона Публий Элий — вольноотпущенник Эвтиха, а Секунд его вольноотпущенником не назван (COLLIBERTO — «соотпущеннику»). fr «Épitaphe de Publius Aelius, affranchi d'Eutiches, par Secundus»; ru «Эпитафия Публия Элия, вольноотпущенника Эвтиха, от Секунда»; en «Epitaph of Publius Aelius, freedman of Eutyches, by Secundus»
- `greek-p4-1` (greek-p4, greek-p5) — fr, name_fr, ru, en — mistranslation, high: «fr/name_fr «Fragment grec 4 (nom de Parmenon)»; ru «Греческий фрагмент 4 (имя Пармено)»; en «Greek fragment 4 (the name Parmenon)»» → на гравюре (fragplate-5) имя ΠΑΡΜΕΝΟΝ есть только в № 1, 2, 3 — Гроссон и говорит «sur trois inscriptions»; в № 4 его нет. fr «Fragment grec 4»; ru «Греческий фрагмент 4»; en «Greek fragment 4»

#### name — 5

- `pl37-2-1` (pl37-2) — text_ru — name, low: «Денис Жюль» → одно лицо названо то «Денис Жюль» (§4 и в §8), то «Дени Жюль» (§8). Унифицировать (французская передача — «Дени Жюль»; Не уверен, какую форму принять по всей книге)
- `pl40-4-1` (pl40-4) — ru, text_ru — name, low: «ru «Эпитафия Децимуса Марция от Гая Ингенуя»; text_ru «Децимусу Марцию»» → латинское личное имя Decimus по-русски передаётся «Децим» (ср. «Тит», «Квинт» в этой же книге): ru «Эпитафия Децима Марция от Гая Ингенуя»; text_ru «Дециму Марцию»
- `pl41-3-1` (pl41-3) — text_en — name, low: «Tomb found on the plain of St. Michael» → топоним переведён на английский, тогда как findspot_en и вся книга оставляют французские названия (Saint-Victor, Saint-Sauveur). «Tomb found on the plain of St. Michel»
- `frag-6-2` (frag-6) — ru, text_ru — name, low: «ru «Обет Лелия, сына Нимпия…»; text_ru «Лелий, сын Нимпия»» → LIELIVS / Lielius ≠ Laelius; «Лелий» подменяет имя. «Лиелий» (ru «Обет Лиелия…»). Не уверен в принятой передаче — low
- `greek-p1-1` (greek-p1, greek-p2, greek-p3) — ru — name, medium: ««Греческий фрагмент 1 (имя Пармено)»» → ΠΑΡΜΕΝΟΝ / PARMENON — «Парменон» (en «Parmenon», text_ru «PARMENON»); «Пармено» обрезано. ru «Греческий фрагмент 1 (имя Парменон)»

#### typo — 4

- `pl40-1-1` (pl40-1) — text_ru — typo, high: «Лициии» → пропущен слог: «Лицирии» (как в заголовке)
- `pl41-5-1` (pl41-5) — text_ru — typo, high: «всаднический сословие» → ошибка согласования: «всадническое сословие»
- `pl42-3-1` (pl42-3) — text_ru — typo, high: «в одной из античных подвалов» → ошибка согласования (подвал — м. р.): «в одном из античных подвалов»
- `frag-21-3` (frag-21) — text_ru — typo, high: «некий должностной лица» → ошибка согласования: «некое должностное лицо»

#### addition — 3

- `frag-10-2` (frag-10) — text_fr, text_ru, text_en — addition, high: «text_fr «Autre fragment d'inscription cité par Ruffi; c'est le reste de la dédicace d'un monument élevé par des neveux en l'honneur d'un oncle ou d'une tante, ainsi que le dénotent les mots FLAVIA IVLIANA NEPOTES.»; text …» → ошибка разбивки текста: первое предложение §1 относится к фрагменту № 17 (FLAVIA IVLIANA NEPOTES — на fragplate-2 это № 17; в frag-17 то же предложение стоит на своём месте), на гравюре № 10 только AVGVSTIVS … PONENDVM CVRAVIT. Удалить это предложение из text_fr/text_ru/text_en записи frag-10; соответственно убрать связку «Une autre citation, dans le même ordre d'idées:» / «Другая, сходная по смыс …
- `greek-p2-1` (greek-p2, greek-p3, greek-p4, greek-p5) — text_fr, text_ru, text_en — addition, medium: «§1 (вступление к греческим фрагментам) и §2 (прим. 38) целиком повторены в greek-p1…greek-p5» → общий вводный абзац Гроссона ко всем фрагментам гравюры размножен по пяти записям; относится к группе, а не к фрагменту № 2. Оставить в greek-p1 (или в поле группы) и убрать из greek-p2…p5 во всех трёх языках. Не уверен, не задумано ли дублирование намеренно
- `greek-4-2` (greek-4) — text_en — addition, low: «the City of Sida, like the others, must have profited, as the others did, from the advantages» → «comme les autres» передано дважды. «…and the City of Sida, like the others, must have profited from the advantages Marseille offered them»

#### omission — 2

- `frag-18-1` (frag-18) — text_ru, text_en — omission, high: «RU «Pallet, kak будто попрал босыми ногами змею, или как ритор, готовящийся говорить перед лионским алтарём». (затем повтор перевода); EN — латинский стих пропущен («Juvenal say (28): let him grow pale…»)» → RU: испорченная вставка (латиница «Pallet, kak» в русском тексте, латинский стих потерян, перевод дан дважды) — восстановить: «…заставляет Ювенала (28) сказать: Palleat ut nudis pressit qui calcibus anguem, Aut Lugdunensem Rhetor dicturus ad aram. Пусть он побледнеет от страха…». EN: вернуть латинский стих перед переводом: «…makes Juvenal say (28): Palleat ut nudis pressit qui calcibus anguem, Aut …
- `greek-4-1` (greek-4) — ru, en — omission, low: «ru «Греческий фрагмент 6: Дионисий, сын Дионисия, из города Сиды»; en «Greek fragment 6: Dionysius, son of Dionysius, of the city of Sida»» → fr-заголовок содержит чтение «Dionisi Dionisi Sideiti Metrima» и имя посвятителя (Metrima); ru/en его опускают. ru «Греческий фрагмент 6: Dionisi Dionisi Sideiti Metrima (Дионисий, сын Дионисия, из города Сиды)»; en «Greek fragment 6: Dionisi Dionisi Sideiti Metrima (Dionysius, son of Dionysius, of the city of Sida)»

## Проблемы разбивки текста

С отдельным issue_id:

- `frag-10-2` — text_fr/text_ru/text_en — addition, high: первое предложение §1 («Autre fragment d'inscription cité par Ruffi; … FLAVIA IVLIANA NEPOTES») относится к frag-17. На fragplate-2 № 10 — только надпись Августия, а FLAVIA IVLIANA — это № 17. Предложение удалить из frag-10 во всех трёх языках, вместе со связкой «Une autre citation, dans le même ordre d'idées:» (Не уверен, как Гроссон вводит № 10 в издании — проверить по фото страницы).
- `greek-p2-1` (greek-p2…p5) — text_fr/text_ru/text_en — addition, medium: общее вступление Гроссона к греческим фрагментам (§1) и примечание 38 (§2) целиком повторены в пяти записях. Оставить в greek-p1 (или в поле группы). Не уверен, не задумано ли дублирование.
- `pl10-2-1` (major): структурные поля и заголовок pl10-2 смешивают два памятника — алтарь со сфинксом и львом (№ 2) и надпись Навия Януария с барельефа из Ле-Пенн (pl20-2).
- `pl8-3-2` — reverse_fr: в поле оригинала попал русский мусор («с расширяющимися, process концами»).

Без issue_id (особенности данных и издания, см. notes.csv):

- `greek-4` — id «greek-4», но `num` 6 и заголовок «Fragment grec 6»; id не согласован с greek-p1…p5 (менять id не нам).
- `pl8-1`, `pl9-1` — §1 содержит общее замечание Гроссона о масштабе всей доски, а не описание монеты; переведено верно.
- `pl4-16` — запись целиком составлена современными редакторами (flag «non décrit par Grosson»).
- `pl14-2` — §2 text_fr — современное примечание (новая орфография), не Гроссон.
- `pl13-2` — в конце text_fr испорченный повтор «qualité aux accouchemens.»; RU/EN его опускают (допустимо).
- `pl9-5` — text_fr «1696 [1596]» (опечатка издания с поправкой); RU/EN молча дают 1596.

## Подписи к гравюрам

Всего 1 (caption_source: engraving — 1, text — 0). Доски Гроссона почти не несут подписей: номера предметов, выходные строки меценатов (только заметки, см. ниже) и надписи на самих памятниках (они в `legend_*`).

### pl36-1 (`pl36-1-2`, поля: caption_ru/caption_en; предлагается также caption_orig)

- Текущий текст в переводе: подписи нет; буквенные отсылки A–R плана объяснены в §17 (переведены), а стороны света и масштаб — нигде
- Позиция: в переводах — нет в тексте; на доске — надписи на самом плане: «Nord» сверху, «Sud» снизу, «ouest» слева, «Est» справа; масштабная линейка внизу слева
- caption_source: engraving
- caption_orig: «Nord · Sud · Est · ouest · Echele de [8 4 — проверить по фото] … 1–20 cannes»
- предлагается caption_ru «Север · Юг · Восток · Запад · Масштаб … 20 канн»; caption_en «North · South · East · West · Scale … 20 cannes»
- Мелкие цифры после «Echele de» неразборчивы — проверить по фото. Подпись не удалять и не вставлять в текст — вынести в поля подписи.

## Не уверен

Замечания, где сказано «Не уверен» или «проверить по фото»:

- `pl2-7-1` — чтение нижних букв на гравюре (≈ ΗΤΠΛ) — проверить по фото
- `pl8-3-1` — русский геральдический термин для croix cléchée («ключевидный крест» или оставить французский термин)
- `pl36-1-1` — точная топография ниш в §6 (EN сливает два места) — проверить по плану
- `pl36-1-2` — цифры масштаба «Echele de 8 4(?)»
- `pl37-2-1` — какую форму принять: «Дени Жюль» или «Денис Жюль»
- `pl40-3-1` — чтение Гроссона путаное (Marcius & Etyches … à Jadéus); формулировка заголовка предварительная
- `pl42-3-2` — нужна ли правка «дарданской» → «троянцев» (смысл близок)
- `frag-6-2` — передача Lielius («Лиелий»)
- `frag-10-2` — как Гроссон вводит № 10 после удаления чужого предложения
- `greek-p2-1` — не задумано ли дублирование вступления

Только в заметках (без issue): `pl13-1` (неизвестные знаки на фрагменте, не транскрибированы), `pl32-4` («2 pieds» у вазы в 8 дюймов — ошибка источника?), `pl37-2` (belle-fille — падчерица или невестка), `greek-4` (RU «Метрима воздвигла» — пол посвятителя у Гроссона не указан), неуверенно прочитанные фамилии меценатов (pl4, pl5, pl9, pl10, pl21, pl24, pl32).

## Повторяющиеся закономерности

### material_* — заметка о закономерности (не issue)

Решение пользователя: `material_*` — только заметка. Металл или материал в тексте статьи обычно не назван (особенно у монет pl1–pl7: argent/or); значение, видимо, взято из вводного текста к доске или из современного каталога. Проверялось только, что ru/en верно переводят fr и что поле не противоречит тексту или гравюре. Единственная ошибка перевода — `pl32-1-1` (jade → «яшма» вместо «нефрит»). Подтверждения текстом: pl1-12 (bronze), pl9-1…pl9-5, pl9-10, pl9-11 (argent/or), pl6-3 и pl7-1 («tiers de sol d'or»).

### Примечания переводчиков в квадратных скобках

В части 1 переводчики вписали в text_ru/text_en свои замечания о расхождении гравюры с текстом Гроссона. Наблюдения верны, но у Гроссона их нет: убрать из перевода, перенести в отдельное поле примечания. Issue: `pl1-4-1`, `pl1-5-1` (к тому же не на своём месте), `pl1-10-1`, `pl1-11-1`, `pl2-7-1`. Того же рода: `pl11-1-1` (пояснения в скобках внутри перевода цитаты из Цицерона); добавленные оговорки без скобок — `pl11-1-2` (EN «is said to»), `pl31-2-1` («как мне казалось» / «I believed»), добавленные слова — `pl5-9-1` («фригийских»).

### Латинские цитаты: в EN переводятся непоследовательно

Гроссон приводит латинские цитаты без перевода или с собственным французским пересказом. Переводы обращаются с ними по-разному:

- EN оставляет цитату без перевода, RU переводит в скобках: pl1-17 (Помпоний Мела), pl9-10 (Плиний).
- Обе версии переводят: pl3-8 (Плиний), pl26-1 (Гораций).
- Обе оставляют без перевода: pl20-2 (Ливий), pl29-8 (формулы завещания).
- Обратный случай — латынь потеряна: `frag-18-1` (Ювенал: в RU испорченная вставка «Pallet, kak…», в EN латинский стих выпал).

Решить единое правило (например: латинская цитата сохраняется, перевод — в скобках в обоих языках) — это не issue по отдельным записям, кроме frag-18-1.

### Разные формы имён — унифицировать

- **Салии (Saliens).** RU везде «салии»; EN — «Salyens» (pl2-3, pl3-4), «Saly» (pl26-1), «Salii» (pl31-7). Предлагается одна форма в EN (напр. «Salyes» или «Salii»). Только заметка.
- **Генэ (Guesnay).** RU «Генэ» — 18 вхождений в 14 записях; «Гене» только в pl20-1 → `pl20-1-2`.
- **Дени Жюль / Денис Жюль** (pl37-2) → `pl37-2-1`.
- **Рюффи / Руффи** (Ruffi). «Руффи» дважды в pl11-1 → `pl11-1-3`; остальные записи — «Рюффи».
- **Сен-Совёр.** Заголовки и findspot_ru — «Сен-Совёр»; в тексте «Сен-Соверa» с латинской a (pl16-4, pl36-1, pl42-3, frag-6, frag-21) → `pl16-4-1`. Привести к «Сен-Совёр(а)».
- **Пенн / Пеннес / Пэны** (Les Pennes). pl10-2 «Пеннес» → `pl10-2-2` («Пенн», как pl20-2); pl35-1 «Пэны» повторяет написание Гроссона «les Pènes» (только заметка).
- **Паради / Paradis.** Латиницей в pl29-5, pl30-6, pl31-4; в pl21-2 «Паради» → `pl29-5-1`.
- **Хариберт** (Caribert/Cherebert). В RU «Карибер», «Керебер», «Херебер» → `pl7-4-1`.
- **Пакат** (Pacatus). «Пакату» в именительном и винительном падеже (pl20-1, frag-13) → `pl20-1-1`.
- **Парменон**. В заголовках «Пармено» (greek-p1…p3) → `greek-p1-1`; в greek-p4/p5 имени на гравюре нет → `greek-p4-1`.
- **Прочие:** praefericula / preféricules (EN, `pl30-5-1`); Децим / Децимус (`pl40-4-1`); St. Michel / St. Michael (EN, `pl41-3-1`); Шарль де Казо (`pl9-5-2`); Ла-Сьота (`pl1-12-1`); Бутру (`pl8-3-3`); Кресп (`pl30-4-1`); Мульер (склонение, `pl25-1-1`).

### Смешение алфавитов и сбои в RU

Латинские буквы внутри русских слов: `pl16-4-1` (Соверa), `pl19-2-1` (Брienne), `pl33-8-1` (лараriях), `frag-18-1` («kak»). Мягкие переносы U+00AD: `pl7-4-2`. Ошибки согласования: `pl6-8-1`, `pl41-5-1`, `pl42-3-1`, `frag-21-3`. Это стоит проверить автоматически по всей книге.

### Заголовки, искажающие отношения лиц

Заголовки эпитафий составлены редакторами и местами расходятся с переводом надписи у Гроссона: `pl37-3-1`, `pl40-3-1`, `pl42-1-1`, `frag-26-1`, `pl39-2-1` («греческая» латинская надпись), `pl32-3-1` (категоричная атрибуция Кибеле), `greek-p4-1`. Все — minor (предмет назван верно; major — только если заголовок указывает не тот предмет, как pl10-2).

## Выходные строки меценатов и знаки граверов

Только заметки (по правилу: выходные строки, издатели и меценаты — не issue). Фамилии с «(?)» читаются неуверенно — проверить по фото.

| Доска | Выходная строка | Знак гравера |
|---|---|---|
| pl1 | aux depens de Mr. Michel honnoraire de l'Ac. de Peinture et Sculp. de Marseille | — |
| pl2 | Aux depens de Mr. Barrigue de Fontainieu de l'ac. Royall de peint. & sculp. de Mars.lle | — |
| pl3 | aux depens de Mr. Roux deputé du Commerce de Mars.lle | — |
| pl4 | Aux depens de Mr. M…tre ß(?) de Marseille | — |
| pl5 | Aux depens de Mr. M.tre Lavabre(?) avocat en la Cour | — |
| pl6 | Aux depens de Mr. Al.dre Badaraque negociant | — |
| pl7 | — (герб без текста) | — |
| pl8 | Aux depens de Mr. M.tre Cathalan avocat en la Cour | — |
| pl9 | Aux depens de Mr. Roussier(?) de l'Ac. de P. et Sculp. de Marseille | — |
| pl10 | Aux depens de Mr Mestre(?) d'Aigalades Tres.r G.l de France | — |
| pl11 | Aux depens de Mr Réaudeau Receveur G.l des fermes du Roy a Mars.lle de l'Ac. de P. et Sculp. de la d.te ville | — |
| pl12 | Aux depens de Mr Le Marquis de Glandeves Niozelles | — |
| pl13 | Aux depens de Mr Duranti de la Calade, Conseiller en la Cour des Comptes, aydes et finances d'Aix | — |
| pl14 | Aux depens de Mr Rouviere | — |
| pl15 | Aux depens de Mr Boyer de Fonscolombe Ho.re de l'Ac. de Peinture de Mars.lle | — |
| pl16 | Aux depens de Mr le Baron de la Tour d'Aigues Co.ller au Parlement Ho.re de l'Ac. de P. et Sculp. de Marseille | — |
| pl17 | Aux depens de Mr Clary Ancien Echevin | — |
| pl18 | Aux depens de Mr Reaudeau de Chemilly T.er G.l des mareschaussées de France | — |
| pl19 | — | — |
| pl20 | Aux depens de Mr S. G. | — |
| pl21 | Aux Depens De Mr Patil(?), lieutent G.l civil en la seneschaussée, Des Academies De Mars.lle | D.F |
| pl22 | Aux Depens de Mr Escalon ancien Echevin | D.F |
| pl23 | — | D.f(?) |
| pl24 | Aux Depens de Mr Chaumel(?) L.t G.l Criminel en la Senech.sée | D.f |
| pl25 | Aux Depens de Mr F.N. Badaraque neg.t | D (монограмма) |
| pl26 | — | Lant.me F. |
| pl27 | — | Iant.me F (= Lant.me F.) |
| pl28 | — | — |
| pl29 | — | Ia-F(?) |
| pl30 | — | LA.F |
| pl31 | — | A.F (LA.F?) |
| pl32 | Aaux Depens De Mr lisden(?) Laint(?) | — |
| pl33 | — | LA.F |
| pl34 | Aux depens De Mr *** Negociant | Lant.me F. |
| pl35 | Aux Depens de Mr Magnan de l'acad. de P. et Sc. de Marse.lle | — |
| pl36 | Aux Depens De Mr Martin lieutenant G.l en l'Amirauté de St Tropez | — |
| pl37 | — | AF |
| pl38 | — | Lant.me Sculp. |
| pl39 | — | AF |
| pl40 | — | AF |
| pl41 | Aux depens de l'Auteur (с гербом Гроссона) | — |
| pl42 | — | — |
| fragplate-1…5 | — (наборные таблицы; №5 — гравюра на дереве) | — |

## Расхождения legend_* (и текста) с гравюрой

Все — info: `legend_*` следует чтению Гроссона или гравюре, смысл не меняется. Исключения, вынесенные в issue: `pl10-2-1` (надпись чужого памятника), `greek-p4-1` (имени Парменона на № 4–5 нет).

| id | legend_* / текст | на гравюре |
|---|---|---|
| pl1-4, pl1-5, pl1-10, pl1-11 | legend по гравюре (ΛΛΕ; ΑΗΠΙ; A Λ; TAΛ), текст — AAE; A, H; два Λ; TAA | как legend (pl1-5 предположительно) |
| pl1-17 | текст: крест «avec les lettres MA» | крест без букв |
| pl2-7 | MASSA ΙΠΛ (Гроссон IPL) | ΜΑΣΣΛ / ≈ ΗΤΠΛ — проверить по фото |
| pl2-8 | контрамарка Λ и O | второй знак неясен (Δ/ромб?) |
| pl3-1 | MASSA (в тексте не названо) | ΜΑΣΣΑ над конём |
| pl4-5 | MASSALIETON | ΜΑΣΣΑ / внизу ΙΔΑ(?) |
| pl4-16 | [MA]MA (современное описание) | скорее ΜΑΣ — проверить по фото |
| pl5-4 | лев, треножник, сосуд/крест | льва не видно |
| pl5-9 | MASSEILS | ΜΑΣΣΕΙΑΣ |
| pl8-2 | CHLOTARIVS (текст CLOTARIVS) | CHLOTARIVS |
| pl13-1 | — | строка неизвестных знаков, не транскрибирована — проверить по фото |
| pl19-2 | DOLICHENIO | DOLIGHENIO(?) |
| pl20-1 | VALISINIVS MAR CARII ANEON VSID | ≈ VALISINIVS·MARCARIIANEONTVSID· — проверить по фото |
| pl29-8 | MARCI COSSVTII CHRESIMI (раскрытое) | ретроградно, сокращённо: M·COS… / CHRESIMI |
| pl33-6 | OTONOIA (чтение Гроссона; правильно ΟΜΟΝΟΙΑ) | OTONO… |
| pl37-1 | ΑΓΑΝΑΙΟΥ | Γ или Υ — проверить по фото |
| pl37-2 | ΙΟΥΛΙΟΣ ΔΣ ΚΑΙ ΔΙΑΣ ΝΙΚΟΣ | ΙΟΥΛΙ/ΟΣ ΚΑΙ … ΝΙΚΟΥΣ (без ΔΣ) |
| pl37-3 | ΧΑΡΙΣ | ΧΑΡΗΣ(?) |
| pl37-4 | ΤΡΙΣΧΙΛΙΑΚΙΣ ΕΤΗ Ζ ΜΗΝΙ Ε (раскрыто) | числовой знак и сокращения |
| pl38-2 | POMPEA … CONIVGI EIVS SACRVM IVSSIT FIERI AERE (восстановлено Гроссоном) | OMP / CO IVGI EIIS / S I F Æ |
| pl39-1 | CARPIMAE | CARPIME |
| pl39-5 | CONIVGI (текст §1 и legend) | COLVCI |
| pl40-3 | E TYCHECIA DEO | E TYCHECIA IA DEO (IA = Jadéus) |
| pl41-5 | MINANTIVS | MINATIVS |
| pl42-2 | обрывается на DOLOREM; Гроссон «quinze jours» | полный текст до DIEB XVI |
| pl42-3 | только начало 11-строчной греческой надписи | полный греческий текст |
| frag-20 | IDEM HERES | IDEN HERES |
| frag-21 | SPONTVLARVM (§1) / SPORTVLARVM (§3) | SPORTVLARVM |
| frag-22 | ANNOS XII (Гроссон: «onze ans») | A. XI |
| frag-24 | обсуждаются лишь EX TESTA / INFRA P. XX | видны и другие буквы (IVS LL AVG, VERVNT FE…) |

## Сверка JSON/CSV

Перед этой сводкой проверено: 249 JSON на 249 записей; у каждого id/book/pass верны; verdict ok ⇔ нет issues; у всех issues полный набор полей, `field` = `fields[0]`. Исправлено в этом коммите:

- бывший `pl38-3-1` в pl20-1 переименован в `pl20-1-2` (запись pl38-3 его больше не содержит);
- `greek-p1-2` переименован в `greek-p2-1` (в greek-p1 его нет);
- общие issue_id приведены к единому type и confidence (`pl20-1-1` — typo/high, `pl16-4-1` — high); подсказка pl16-4-1 в pl16-4 — «Сен-Совёра»;
- в attrs_check.csv строка о material_* (pl1) — статус «pattern note (решено пользователем)» вместо «ждёт решения».

Остаётся: строка `grosson,200,134,65,1` в progress.csv записана до того, как pl38-3 стал ok (фактически на тот момент было бы 135/64/1). Строки накопительные, итог `grosson,249,161,87,1` верен. `pl8-3-2` — `original` взят из reverse_fr (поле оригинала), а не из text_fr: это сделано намеренно.
