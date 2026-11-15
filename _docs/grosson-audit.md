# Аудит перевода «Гроссона» (RU/EN против французского оригинала)

Только отчёт, правок в данные не вносилось. Проверено 249 записей `books/grosson/entries.json`: `text_ru`/`text_en` против `text_fr`, `legend_ru`/`legend_en` против `legend_fr` (надписи), названия `ru`/`en`, поля obverse/reverse/material/findspot/motifs; `attrs` у книги не заполнены ни в одной записи. Записи проверены восемью независимыми проходами по ~32 записи; замечания в таблице — как их записали проходы, без повторной перепроверки по скану (в отличие от аудита Рипы), поэтому часть «транскрипция» и «смысл» стоит подтвердить по странице перед правкой. Формат — как у `_docs/ripa-audit.md`.

Серьёзность: **критично** — искажён смысл, потеряно или добавлено существенное, перепутаны числа/имена/надписи; **заметно** — потеряна фраза или деталь, неверное имя, расхождение RU/EN; **мелочь** — неточность без потери смысла.

## Сводка

- Всего записей: 249; чистых: **191**; с замечаниями: **58**.
- Замечаний всего: **86** — критично 2, заметно 16, мелочь 68.
- Записей по наибольшей серьёзности: критично — 1, заметно — 13, только мелочи — 44.
- По типам: смысл 27, транскрипция 18, прочее 10, добавление 10, RU≠EN 9, имя 5, надпись 4, пропуск 3.

### Топ-10 самых проблемных записей

| # | id | запись | критично | заметно | мелочь |
|---|---|---|---|---|---|
| 1 | pl8-4 | Бюст / крест на перекладине — Хильдерик II / Buste / Croix sur barre — Childeric II | 2 | 0 | 0 |
| 2 | pl15-4 | Терракотовый медальон (imaguncula или булла вольноотпущенника) / Médaillon de terre cuite (Imaguncula ou bulle d'affranchi) | 0 | 2 | 1 |
| 3 | pl29-6 | Бронзовая трёхрожковая лампа, найденная в старом еврейском квартале / Lampe en bronze à trois becs, trouvée dans l'ancienne Juiverie | 0 | 2 | 0 |
| 4 | frag-18 | Эпитафия Квинта Галлия Евфемия, секстумвира празднеств Августа, от Корнелии Секунды / Épitaphe de Quintus Gallius Euphemius, sextumvir des fêtes d'Auguste, par Cornelia Secunda | 0 | 2 | 0 |
| 5 | pl38-1 | Погребальный алтарь братьев Руфина, Харитона, Луцилла и Флавиана (спор об ascia) / Autel funéraire des frères Rufinus, Charito, Lucillus et Flavianus (débat sur l'ascia) | 0 | 1 | 3 |
| 6 | pl42-2 | Эпитафия малютки Сеандиллы / Épitaphe de la petite Seandilla | 0 | 1 | 2 |
| 7 | pl42-3 | Греческая надпись в честь Тита Порция Прокла Элиана (карьера римского офицера) / Inscription grecque pour Titus Porcius Proclus Aelianus (carrière d'un officier romain) | 0 | 1 | 2 |
| 8 | pl8-3 | Голова (в лавре) / процветший крест — эпоха виконтов / Tête (laurier) / Croix clechée — époque des Vicomtes | 0 | 1 | 1 |
| 9 | pl13-2 | Барельеф: пара, подающая друг другу правую руку, с собакой (супружеский вотив) / Bas-relief: couple se donnant la main droite, avec chien (ex-voto conjugal) | 0 | 1 | 0 |
| 10 | pl17-2 | Костяной стаканчик для игры в кости (обе стороны: ниша и Гарпократ) / Cornet à jouer aux dés en os (les deux faces: niche et Harpocrate) | 0 | 1 | 0 |

(Рейтинг: критично ×100 + заметно ×10 + мелочь ×1.)

## Таблица замечаний

Порядок: критично → заметно → мелочь, внутри — по порядку записей.

| id | поле | тип | серьёзность | что в оригинале | что у нас | предлагаемая правка |
|---|---|---|---|---|---|---|
| pl8-4 | text_ru[0] | смысл | критично | «Cette époque ne date que d'après l'établissement de ces premiers dans les Gaules» — «ces premiers» = les François (упомянутые первыми; далее: Clovis transporta les Francs dans cette partie de l'Europe), т.е. речь об утверждении франков в Галлии | «Эта эпоха начинается лишь с утверждения последних в Галлии» — «последних» относится к остготам | «Эта эпоха начинается лишь с утверждения первых (франков) в Галлии, что позднее правления Хильдерика I…» |
| pl8-4 | text_en[0] | смысл | критично | «ces premiers» = les François (Francs), establishment of the Franks in Gaul | «This period dates only from the establishment of the latter in Gaul» — «the latter» = Ostrogoths | «…from the establishment of the former (the Franks) in Gaul…» |
| pl8-3 | reverse_fr | транскрипция | заметно | reverse_fr должен быть французским: «croix clechée, légende MASILIA» | «croix clechée (с расширяющимися, process концами), légende MASILIA» — в французское поле попала русская вставка с обрывком «process» | reverse_fr: «croix clechée, légende MASILIA»; reverse_ru/en при этом сохраняют свои пояснения |
| pl13-2 | text_fr[1] | транскрипция | заметно | "Cette Déesse présidoit encore, suivant l'opinion commune, aux accouchemens; qualité aux accouchemens. Les dévots parens..." | В оригинальном тексте лишний обрывок "qualité aux accouchemens." (дублирует предыдущее; похоже на OCR-остаток); RU/EN его не переводят | Во французском удалить обрывок "qualité aux accouchemens." или восстановить по странице (возможно "cette qualité..."); RU/EN менять не надо |
| pl15-4 | text_ru[5] | пропуск | заметно | Сноски (38) и (39) содержат латинский текст: "Majores nostri nullam, ne privatam quidem rem agere fœminas sine autoritate voluerunt; in manu esse parentum, fratrum, virorum." и "Mulieres omnes propter infirmitatem consilii, majores in tutorum potestate esse voluerunt." | Латинский текст опущен, дан только русский перевод | Сохранить латинские цитаты буква в букву и дать перевод после них (как в других записях) |
| pl15-4 | text_en[5] | пропуск | заметно | Сноски (38) и (39) содержат латинский текст (Majores nostri nullam... / Mulieres omnes propter infirmitatem consilii...) | Латинский текст опущен, дан только английский перевод | Сохранить латинские цитаты буква в букву, перевод — после них |
| pl17-2 | text_en[0] | смысл | заметно | "une corne ou un cornet à bouquin" (рог или охотничий рожок) | "a horn or hunting-cup" — cornet à bouquin переведён как "чашка/кубок"; RU верно: "охотничий рожок"; RU≠EN | "a horn or a hunting-horn" |
| pl29-6 | text_ru[0] | смысл | заметно | «deux petites brochettes, qui servoient à les tenir en équilibre, & à les suspendre» (brochette = маленький стержень/шпилька) | «две небольшие цепочки» (RU) | «две небольшие шпильки (стерженьки)» |
| pl29-6 | text_en[0] | смысл | заметно | «deux petites brochettes» (маленькие стержни/шпильки) | «two small chains» | «two small pins (skewers)» |
| pl33-2 | text_ru[0] | смысл | заметно | «Il a été jetté en fonte, en deux parties» — «Il» (м.р.) относится к носику (gouleau), не к гидрии | «Она была отлита в двух частях, спаянных между собой» — относит к гидрии; EN «It» двусмысленно | RU: «Он (носик) был отлит в двух частях, спаянных между собой»; EN: «The spout was cast in two pieces…» |
| pl37-3 | fr / ru / en | смысл | заметно | Заголовок «Pierre sépulcrale de Carmolaus, affranchi par Charles»; в тексте Carolus libertus (Charles l'Affranchi) воздвиг памятник Carmolaus: вольноотпущенник - Карл, а не Кармолай | «Кармолая, отпущенного на волю Карлом» / «freed by Charles»: получается, что Карл отпустил Кармолая | «Надгробный камень Кармолая, воздвигнутый вольноотпущенником Карлом» / «erected by the freedman Charles» (и исправить name_fr/fr) |
| pl38-1 | text_ru[4] | смысл | заметно | «d'un côté la figure de l'Ascia & celle d'un Equerre» (обе фигуры с одной стороны); «en creux» (углублённо) | «с одной стороны фигура ascia, а с другой — наугольника»; «рельефно» | «на одной стороне углублённо изображены ascia и наугольник» |
| pl42-2 | text_en[1] | смысл | заметно | «aromates toujours mieilleux» (медоточивые, т.е. mielleux; лат. MELEARITA, медово-сладкая) | «ever-improving spices» | «as much as ever-honeyed (honey-sweet) spices» |
| pl42-3 | text_ru[1] | RU≠EN | заметно | «Préfet de la cohorte des Troyens» (EN: Trojan cohort) | «префекту дарданской когорты» | «префекту когорты троянцев» (по FR; в латинской строке DARDANORVM) |
| frag-18 | text_ru[0] | надпись | заметно | Латинские стихи Ювенала: «Palleat ut nudis pressit qui calcibus anguem, Aut Lugdunensem Rhetor dicturus ad aram.», затем перевод | Латинский текст отсутствует; вместо него искажённая «Pallet, kak будто попрал босыми ногами змею…», после чего идёт ещё один перевод (дублирование) | Вставить «Palleat ut nudis pressit qui calcibus anguem, Aut Lugdunensem Rhetor dicturus ad aram.», убрать лишний первый перевод, оставить «Пусть он побледнеет от страха…» |
| frag-18 | text_en[0] | надпись | заметно | Латинские стихи Ювенала «Palleat ut nudis… ad aram.» приведены перед переводом | Стихи пропущены, только перевод «let him grow pale…» | Вставить латинские стихи перед переводом |
| frag-20 | text_ru[0] | смысл | заметно | «Caius Postumius l'Affranchi, Mignon de Caius» (любимец Гая, вольноотпущенник) | «миловидный раб Гая» (раб — добавление, противоречит LIBERTVS; EN: «Caius's pretty favorite») | «Гай Постумий Вольноотпущенник, любимец (миньон) Гая…» |
| frag-22 | text_fr[0] | транскрипция | заметно | «ANNOS XII» в латинском тексте, а перевод «vécut onze ans» | XII (RU/EN повторяют XII и пишут «одиннадцать/eleven») | проверить по странице; вероятно ANNOS XI |
| pl1-1 | text_ru[1] | надпись | мелочь | «On lit ce mot ... en caracteres grecs: MASSALIETON» (латиницей, как в legend_fr) | «греческими буквами: МАССАЛИЕТОН» (кириллическая транслитерация) | заменить на MASSALIETON, как в text_fr/legend_ru |
| pl1-6 | text_ru[0] | RU≠EN | мелочь | «tresses retroussées, nouées avec des rubans» (EN: braids swept up, tied with ribbons) | RU: «в заплетённых косах, подвязанных лентами» — «retroussées» (зачёсанные вверх) потеряно | «причёска — зачёсанные вверх косы, подвязанные лентами» |
| pl1-17 | text_ru[0] | надпись | мелочь | «ce mot grec: LACYDON»; цитата Помпония Мелы по-латыни «Tunc post Athenopolis, & Olbia, & Taurois, & Citharistes, & Lacydon, Massiliensium Portus, & in eo ipsa Massilia» | RU: «ЛАКИДОН» и латинская цитата Мелы заменена русским переводом (EN сохраняет латинский текст) | оставить LACYDON и латинскую цитату как в text_fr (перевод можно дать в скобках) |
| pl2-3 | text_ru[0] | RU≠EN | мелочь | «les Saliens, les Liguriens & les Oxubiens» | RU «оксубиями», EN «Oxybians» — формы расходятся между собой | привести к единому написанию (в RU «оксибиями»/EN Oxybii либо оба по оригиналу Oxubiens) |
| pl2-7 | text_ru[0] | RU≠EN | мелочь | «les lettres IPL en caractères grecs» (text_fr и text_en: IPL) | RU: «ΙΠΛ греческими знаками» (в legend ΙΠΛ), а в text_fr/EN — IPL | в тексте дать как в text_fr: IPL (либо везде одинаково ΙΠΛ) |
| pl5-2 | obverse_ru | прочее | мелочь | «comme celle du numéro 2 de la troisième Planche» | «как на Planche III №2» — французское слово не переведено | «как на монете №2 Таблицы III» |
| pl5-4 | text_ru[0] / text_en[0] | смысл | мелочь | «les monnoies de bon aloi qu'on présentoit à la monnoie, lors des recherches sur le billonage» (предъявляли на монетный двор при розыске порчи монеты) | RU «предъявляемых к обмену»; EN «presented for exchange» — «à la monnoie» (на монетный двор) утрачено | RU «предъявляемых на монетный двор»; EN «presented at the mint» |
| pl5-9 | text_ru[0] / reverse_ru | добавление | мелочь | «les deux bonnets de la liberté» | «двух фригийских колпаков свободы» — «фригийских» отсутствует в оригинале | «двух колпаков свободы» |
| pl6-1 | text_ru[0] | смысл | мелочь | «Louis le Débonnaire ou le Pieux» | «Людовика Простодушного, или Благочестивого» («Débonnaire» = добродушный, мягкий; EN Debonair верно) | «Людовика Добродушного (Мягкого), или Благочестивого» |
| pl7-1 | text_ru[1] | RU≠EN | мелочь | «Amauri ou Amalaric, Roi des Visigoths» | RU: «Амальрика» (вариант Amauri пропущен); EN: «Amauri or Amalaric» | «Амори, или Амальрика, короля вестготов» |
| pl8-2 | text_ru[0] | прочее | мелочь | «ils ont également possédé la Souveraineté de Marseille» | «оба они в равной мере обладали сувереном над Марселем» — опечатка/нарушено управление | «обладали суверенитетом над Марселем» |
| pl8-2 | text_fr[0] | транскрипция | мелочь | На монете (img/pl8-2) и в legend_fr: CHLOTARIVS REX (с Н) | text_fr[0] дважды: «CLOTARIVS REX» (без Н), и RU/EN повторяют это; расхождение с legend_fr и с изображением | Проверить по странице; если в печатном тексте Н нет — оставить, иначе исправить на CHLOTARIVS в text_fr/ru/en |
| pl8-3 | ru / text_ru[0] / reverse_ru | прочее | мелочь | «Croix clechée» — геральдический термин (крест клеше, «крест Тулузы», с полыми расширяющимися концами) | «процветший крест» (=fleury/fleuronnée), в EN при этом «cross clechée» оставлено | «крест клеше» (при необходимости — «крест Тулузы») |
| pl9-5 | text_ru[0] / text_en[0] | добавление | мелочь | Девиз SERVARI ET SERVARE MEVM EST дан без перевода | RU добавлено «(сохраниться самому и сохранить — вот мой удел)», EN «(to be preserved myself, and to preserve, is my task)» — толкование переводчика, которого нет у Гроссона | Убрать скобку или оформить как примечание переводчика |
| pl9-10 | text_ru[1] | добавление | мелочь | Цитата Pline дана по-латыни без перевода: "Atque ubi Rhoda Rhodiorum fuit, unde dictus multò Galliarum fertilissimus Rhodanus amnis" | В RU добавлен собственный перевод в скобках: "самый полноводный из галльских рек — Родан"; fertilissimus (плодороднейший) передан как "полноводный", и фраза грамматически неверна (EN глоссы не имеет) | Убрать скобочный перевод или исправить: «и там, где была Рода родосцев, от которой назван Родан, плодороднейшая из рек Галлии» |
| pl10-1 | text_en[0] | смысл | мелочь | "placé sur un pieu" (на столбе, колу) | "set upon a herm"; в этом же тексте herm/gaine далее относится к терминальным божествам, здесь же слово не соответствует pieu | "set upon a stake (post)" |
| pl11-1 | text_ru[2] | имя | мелочь | Ruffi | "Руффи" (в [2] и [8]), тогда как во всех остальных записях книги (pl15-3, pl16-2, pl16-3, pl17-2, pl19-2, pl20-1) — "Рюффи" | Унифицировать написание фамилии Ruffi (в [2] и [8] привести к принятому в книге варианту) |
| pl11-1 | text_en[3] | смысл | мелочь | "(temps auquel la piété des Fidèles auroit élevé ce monument à la mémoire du saint Citoyen)" — время, когда благочестие верующих воздвигло бы памятник | "(the time to which the Faithful's piety would be assigned, had they raised this monument...)" — фраза искажена и непонятна | "(the period in which the piety of the Faithful would have raised this monument to the memory of the holy Citizen)" |
| pl15-1 | text_ru[3] | смысл | мелочь | "(hauteur 1/2 pied jusqu'à l'écrou)" — écrou = гайка | "до кольца" | "(высота 1/2 фута до гайки)" |
| pl15-1 | text_en[3] | смысл | мелочь | "jusqu'à l'écrou" — écrou = nut | "up to the ring" | "(height 1/2 foot up to the nut)" |
| pl15-4 | text_ru[2] | прочее | мелочь | Марсельские женщины (les Marseilloises) | Опечатка: "марселькие женщины" | "марсельские женщины" |
| pl16-4 | text_ru[3] | прочее | мелочь | "St. Sauveur" | "Сен-Соверa" — в слове латинская буква "a" вместо кириллической (также в text_ru[8]) | "Сен-Совёр" (как в pl20-1), кириллицей |
| pl19-2 | text_ru[0] | прочее | мелочь | M. le Comte de Brienne | "графу де Брienne" — латиницей в кириллическом тексте | "графу де Бриенну" |
| pl22-2 | text_ru[0] | имя | мелочь | «l'Autel de St. Mauront» | «алтаря Св. Морона» | «алтаря св. Мауронта (Маурона)» |
| pl22-2 | findspot_ru | имя | мелочь | «Autel de St. Mauront» | «алтарь св. Морона» | «алтарь св. Мауронта (Маурона)» |
| pl22-2 | text_fr[2] | транскрипция | мелочь | «Un artiste instruit devroit se faire une délicatesse de profaner ainsi les talens» — по смыслу пропущено отрицание | RU/EN переданы с отрицанием («не осквернять» / «not to profane»), т.е. FR, вероятно, неполон | проверить по странице; вероятно «de ne point profaner ainsi les talens» |
| pl27-1 | text_ru[2] | RU≠EN | мелочь | «feuilles de refend en volute» | RU «завитков рассечённых листьев», EN «volute-shaped acanthus leaves» (акант в оригинале не упомянут) | EN: «deeply cut (split) leaves in volutes», без «acanthus» |
| pl27-1 | text_ru[1] | добавление | мелочь | «à orner quelque édifice profane & très-profane» | «светского, причём весьма нецеломудренного, здания» | «светского, и притом весьма мирского (языческого) здания» |
| pl27-2 | text_ru[0] | смысл | мелочь | «dans le costume Romain en godrons» (godron = годрон/выпуклые овалы, не каннелюра) | «в римском каннелированном стиле (en godrons)»; EN «gadrooned» | «в римском стиле с годронами» |
| pl28-1 | text_en[0] | добавление | мелочь | «les circonvolutions des feuilles de refend» | «the volutes of the acanthus leaves» | «the convolutions of the cut (split) leaves» |
| pl29-3 | text_fr[0] | транскрипция | мелочь | В тексте «ANIΣΣEN» набрано смесью латинских A, N, I, E и греческой Σ, тогда как legend_fr — целиком греческое «ΑΝΙΣΣΕΝ»; в тексте говорится «mot… Grec» | RU/EN повторяют смешанное написание в text и в названии | унифицировать на греческие буквы ΑΝΙΣΣΕΝ в text_fr/ru/en и в fr/ru/en названия |
| pl29-4 | text_fr[1] | транскрипция | мелочь | «Mr. de Caylus fait l'éloge des belles patries que renferme ce morceau» | RU «прекрасные черты», EN «fine qualities» (переведено как parties) | FR: «belles parties» |
| pl30-1 | text_fr[1] | транскрипция | мелочь | «la Déesse de Arts» | RU «богиня Искусств» | FR: «la Déesse des Arts» |
| pl30-5 | text_fr[1] | транскрипция | мелочь | сноска «(82) Valerius Maximus lib. 11.»; у Валерия Максима о марсельцах — кн. II | «lib. 11» (цифры 1-1, вероятная OCR-ошибка вместо римского II); RU/EN «кн. 11» / «Bk. 11» | FR: «lib. II»; RU «кн. II»; EN «Bk. II» (сверить со сканом) |
| pl31-1 | text_en[0] | добавление | мелочь | «les feuilles de refend» (рассечённые листья) | «scrollwork leaves» (завитки) — RU «рассечённые листья»; RU≠EN | EN: «cut (split) leaves» / «the leaf-cut ornament» |
| pl32-1 | ru / material_ru / text_ru[0] | смысл | мелочь | «pierre de Jade» (нефрит) | «яшма (нефрит)» — яшма это jasper, не jade | «нефрит» (заголовок, материал, текст) |
| pl32-6 | text_ru[0] | RU≠EN | мелочь | «sous deux petites voûtes en maçonnerie» (каменная кладка вообще) | RU «под двумя небольшими кирпичными сводами»; EN «masonry vaults» | RU: «под двумя небольшими сводами из каменной кладки» |
| pl33-6 | text_fr[0] / legend_fr | транскрипция | мелочь | греч. слово Concordia = ΟΜΟΝΟΙΑ; в text_fr «OTONOIA» латиницей, в legend_fr «ΟΤΟΝΟΙΑ» | в FR вероятная опечатка/OCR M→T (в RU/EN повторено ΟΤΟΝΟΙΑ; в text_ru греческими буквами, в text_fr латиницей) | сверить со сканом/гравюрой; если ΟΜΟΝΟΙΑ — исправить FR (text_fr «OMONOIA», legend_fr «ΟΜΟΝΟΙΑ») и RU/EN |
| pl33-8 | text_ru[0] | прочее | мелочь | «Larraires» (ларарии) | «лараriях» — латинские буквы «ri» внутри кириллического слова | «ларариях» |
| pl36-1 | text_ru[0,2,10,12,15] | прочее | мелочь | «St. Sauveur» (Сен-Совёр) | «Сен-Соверa» с латинской «a» на конце; также непоследовательно с «Сен-Совёр» в ru/объяснении | единообразно «Сен-Совёр» (кириллицей) |
| pl37-4 | text_ru[2] | добавление | мелочь | «aux mânes du défunt», «ses cendres» (покойный, мужской род) | «манам усопшей», «её прах» | «манам усопшего», «его прах» |
| pl37-4 | text_en[2] | добавление | мелочь | «aux mânes du défunt», «ses cendres» (masc.) | «the departed's shade ... her ashes» | «his ashes» (или нейтрально «the deceased's») |
| pl38-1 | text_ru[3] | добавление | мелочь | «un marteau taillant» (молоток-тесло каменщика) | «плотничий топорик (ascia)» | «молоток-тесло (marteau taillant) (ascia)» - «плотничий» в оригинале нет, далее автор сам называет его инструментом каменщиков |
| pl38-1 | text_en[3] | добавление | мелочь | «un marteau taillant» | «a carpenter's adze» | «a mason's cutting hammer (ascia)» |
| pl38-1 | text_en[4] | смысл | мелочь | «elle représente en creux» (углублённым резным изображением) | «it shows in relief» | «it shows, incised, on one side...» |
| pl38-4 | text_ru[0] | смысл | мелочь | «sculptée en creux» | «рельефно высеченная» | «высеченная углублённо (врезная)» |
| pl38-4 | text_en[0] | смысл | мелочь | «sculptée en creux» | «carved in relief» | «carved in intaglio / incised» |
| pl39-1 | text_ru[1] / ru | прочее | мелочь | Само название и надпись T. MACCIO MARCELLO дают Titus Maccius Marcellus (один человек); во французском переводе «à Titus Maccius, Marcellus son fils» имя разорвано, что противоречит заголовку | В тексте «Титу Маккию; Марцелл, его сын», в заголовке «Тита Маккия Марцелла» | Оставить перевод по FR, но пометить внутреннее противоречие самого FR (лучше: «Титу Маккию Марцеллу, преблагочестивому сыну»); то же в text_en[1] |
| pl39-2 | en | RU≠EN | мелочь | FR/RU: «Épitaphe grecque» / «Греческая эпитафия» | EN: «Greek-named epitaph» | Согласовать RU и EN (по FR: «Greek epitaph» либо во всех трёх «эпитафия с греческим именем»; надпись латинская, имя греческое) |
| pl40-1 | text_ru[1] | транскрипция | мелочь | Licyria | «Лициии» | «Лицирии» |
| pl41-5 | text_ru[0] | смысл | мелочь | «sculptée en creux l'épitaphe» | «была рельефно высечена» | «была высечена углублённо» |
| pl41-5 | text_en[0] | смысл | мелочь | «sculptée en creux» | «carved in relief» | «carved in intaglio / incised» |
| pl41-5 | text_ru[5] | RU≠EN | мелочь | «l'Angusticlave, qui étoit la robbe des Chevaliers Romains» | «узкая пурпурная полоса (Angusticlave) — одеяние римских всадников» (EN: «garment») | «Angusticlave — одеяние римских всадников» |
| pl41-5 | text_en[5] | смысл | мелочь | «ce qui avoit fait donner le nom de couleur de Tyr, Tirida, à la couleur de pourpre» (пурпуру дали название «тирский цвет») | «gave rise to naming the color of Tyre, Tirida, after purple» (смысл перевёрнут) | «which led to the purple color being called the color of Tyre, Tirida» |
| pl42-2 | text_ru[1] | пропуск | мелочь | «autant que les aromates toujours mieilleux» | «как самые изысканные благовония» (потеряно «toujours mieilleux») | «как благовония, всегда медовые (медоточивые)» |
| pl42-2 | text_fr[1] | транскрипция | мелочь | Надпись: DIEB. XVI (шестнадцать дней); во французском переводе «quinze jours»; также «mieilleux» | RU/EN следуют FR: «пятнадцать дней»/«fifteen days» | Пометить расхождение XVI/«quinze» в самом FR (возможно, ошибка Гроссона); «mieilleux» -> «mielleux»; RU/EN оставить по FR или с примечанием |
| pl42-3 | text_ru[0] | транскрипция | мелочь | St. Sauveur | «Сен-Соверa» (латинская «a» в кириллическом слове); findspot_ru - «Сен-Совёр» | «Сен-Совёр» (то же в text_ru[2] и frag-6 text_ru[0]) |
| pl42-3 | text_ru[1] | смысл | мелочь | «Vicaire du coupement à faire sur la voie Flaminienne...» (EN: road-cutting) | «викарию по прокладке дороги вдоль...» | «викарию по прорубке (расчистке) на Фламиниевой, Эмилиевой и Лигурийской дорогах» |
| frag-6 | text_ru[0] | транскрипция | мелочь | St. Sauveur | «Сен-Соверa» (латинская «a») | «Сен-Совёр» |
| frag-13 | ru | имя | мелочь | Marcus Caris Pacatus (Pacatus — им. п.) | «Марка Кария Пакату» в названии | «Марка Кария Паката» / «Пакат» |
| frag-13 | text_ru[0] | имя | мелочь | Marcus Caris Pacatus a élevé… | «Марк Карий Пакату воздвиг» (неверная форма имени) | «Марк Карий Пакат воздвиг» |
| frag-13 | text_ru[0] | смысл | мелочь | FRATRI PIISSIMO = «à son très-pieux frere», сноска 46: PIVS — сыновняя почтительность, пиетет | RU «прелюбящему брату», EN «most loving brother» (сноска 46 про piety остаётся без опоры) | «своему благочестивейшему (преданнейшему) брату» / «most dutiful brother» (RU и EN) |
| frag-14 | text_fr[0] | транскрипция | мелочь | «ANN. XXL» при переводе «trente ans» (вероятно, опечатка вместо XXX) | ANN. XXL (RU/EN повторяют XXL и переводят «тридцати/thirty») | проверить по странице; вероятно ANN. XXX |
| frag-19 | text_fr[0] | транскрипция | мелочь | «Testamento dotare» | «Testmento dotare» (опечатка) | Testamento dotare |
| frag-21 | text_fr[0] | транскрипция | мелочь | «XII SPORTVLARVM» (так же в text_fr[2]; sportulae) | «XII SPONTVLARVM» в text_fr[0] (и в RU/EN) | SPORTVLARVM (во всех трёх языках) |
| frag-21 | text_ru[0] | прочее | мелочь | St. Sauveur | «Сен-Соверa» (латинская «a» в кириллическом слове) | «Сен-Совера» |
| frag-21 | text_ru[2] | смысл | мелочь | «…de douze corbeilles, a donné ce monument» | «дал двенадцать корзин для этого памятника» (EN: «gave twelve baskets for this monument»): объект «ce monument» заменён | «…по случаю освящения двенадцати корзин дал этот памятник» (RU и EN) |
| frag-25 | text_fr[1] | транскрипция | мелочь | «hist. de Marseille» (длинная s) | «Marf.» | «Mars.» |
