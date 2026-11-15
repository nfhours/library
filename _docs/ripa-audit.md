# Аудит перевода «Иконологии» Рипы (RU/EN против французского оригинала)

Первая версия — только отчёт; затем замечания перепроверены и исправлены (см. колонку «статус»). Проверено 440 статей `books/iconologie/entries.json`: `text_ru`, `text_en`, названия `ru`/`en`, `attrs` (what/meaning RU/EN) против `text_fr` и французских версий атрибутов. Проверку выполняли модели-ревьюеры по частям (по 44 статьи), поэтому замечания — это кандидаты на правку, а не окончательный вердикт: перед правкой каждую стоит сверить со сканом. Орфография оригинала (vne, &, ſ) ошибкой не считалась.

Серьёзность: **критично** — искажён смысл, потеряно или добавлено существенное, перепутаны атрибуты/числа/цвета/руки; **заметно** — потеряна фраза или деталь, неверное имя, непереведённая цитата, расхождение RU/EN; **мелочь** — неточность без потери смысла.

## Сводка

- Всего статей: 440; чистых (без замечаний): **306**; с замечаниями: **134**.
- Замечаний всего: **199** — критично 4, заметно 48, мелочь 147.
- Статей по наибольшей серьёзности замечания: критично — 2, заметно — 34, только мелочи — 98.
- По типам: смысл 58, RU≠EN 29, транскрипция 26, имя 22, добавление 21, атрибут 18, цитата/стих 10, прочее 10, пропуск 5.

### Топ-10 самых проблемных статей

| # | id | статья | критично | заметно | мелочь |
|---|---|---|---|---|---|
| 1 | p1-6 | Добродетельная любовь / Amour vertueux | 3 | 0 | 0 |
| 2 | p1-65 | Сила / Force | 1 | 0 | 1 |
| 3 | p1-101 | Милосердие / Misericorde | 0 | 4 | 0 |
| 4 | p1-13 | Искусность, хитроумие / Artifice | 0 | 3 | 2 |
| 5 | p1-88 | Свобода воли / Libre arbitre | 0 | 2 | 2 |
| 6 | p2-14 | Юг / Le Midy | 0 | 2 | 1 |
| 7 | p2-15 | Север / Le Septentrion | 0 | 2 | 1 |
| 8 | p2-119 | Общение в человеческой жизни / Commerce de la vie humaine | 0 | 2 | 1 |
| 9 | p1-97 | Память о полученных благодеяниях / Memoire des bien-faits receus | 0 | 2 | 0 |
| 10 | p1-115 | Мир / Paix | 0 | 2 | 0 |

(Рейтинг: критично ×100 + заметно ×10 + мелочь ×1.)

## Таблица замечаний

Порядок: критично → заметно → мелочь, внутри — по порядку статей.

| id | поле | тип | серьёзность | что в оригинале | что у нас | предлагаемая правка | статус |
|---|---|---|---|---|---|---|---|
| p1-6 | attrs[0].what | атрибут | критично | vn enfant ... quatre guirlandes de laurier, l'vne sur la teste, & les trois autres en ses deux mains | Крылатый юноша с венком на голове и двумя гирляндами в руках | Крылатый ребёнок с лавровым венком на голове и тремя гирляндами в руках (всего четыре) | исправлено |
| p1-6 | attrs[0].what_en | атрибут | критично | vn enfant ... les trois autres en ses deux mains | A winged youth ... and two laurel garlands in his hands | A winged child with a laurel wreath on his head and three laurel garlands in his hands (four in all) | исправлено |
| p1-6 | attrs[0].what_frtrans | атрибут | критично | les trois autres en ses deux mains | un jeune homme ailé ... deux guirlandes de laurier dans les mains | Un enfant ailé ... et trois guirlandes de laurier dans les mains | исправлено |
| p1-65 | attrs[0].meaning | атрибут | критично | Ses armes = force du corps; le rameau (de chêne) = force de l'esprit | Дуб ... символ силы тела; лев ... образ силы духа | Дубовая ветвь означает силу духа, оружие — силу тела; лев и вепрь — обе силы (тело и дух); исправить RU/EN/frtrans | исправлено |
| p1-7 | attrs[1] | добавление | заметно | (в тексте нет никаких особых атрибутов, пустая строка) | У фигуры нет иных атрибутов, кроме дельфина и волн; «простота образа подчёркивает бескорыстную привязанность» | Удалить attrs[1] целиком: в оригинале такого описания и такого толкования нет | исправлено |
| p1-13 | text_en[0] | смысл | заметно | de la droite il montre vne ruche (скорее: gauche) | resting upon an endless screw, and with his right he points to a hive | and with his left he points to a hive | исправлено |
| p1-13 | text_fr[0] | транскрипция | заметно | Il tient la main droite appuyée sur vne viz sans fin, & de la droite il montre vne ruche | две «droite» подряд (RU и EN повторяют: правой ... правой же; right ... right) | вторая должна быть «gauche»: сверить со сканом; в RU/EN: левой рукой указывает на улей | ложное: транскрипция верна по скану (стр. 26): в оригинале действительно «la main droite ... de la droite»; опечатка источника, text_fr не менять |
| p1-13 | text_ru[0] | смысл | заметно | de la droite il montre vne ruche (скорее: gauche) | Правой рукой он опирается ... а правой же указывает на улей | Правой рукой опирается на винт, а левой указывает на улей | исправлено |
| p1-25 | text_fr[0] | транскрипция | заметно | описание фигуры (text_fr[0]) | нет скипетра, покрывала на лице, шагающей позы и горлиц, хотя text_fr[5]-[8] их объясняют | вероятно пропущена часть описания (sceptre, voile, tourterelles, marche): сверить со сканом и дополнить; attrs тоже без этих деталей | ложное: text_fr[0] совпадает со сканом (стр. 45): в оригинале нет скипетра, покрывала, походки и горлиц в первом описании; они появляются только в поясняющих абзацах — свойство источника, дополнять нечем |
| p1-49 | attrs[0].meaning | атрибут | заметно | bras nuds: sans les fondemens d'vne solide doctrine ... l'Eloquence seroit desarmée | Доспех означает, что без основания учёности красноречие было бы безоружным (то же в meaning_en/meaning_frtrans) | Относить «безоружность» к обнажённым рукам, а не к доспеху; доспех/меч в тексте отдельно не истолкованы | исправлено |
| p1-59 | text_ru[5] | имя | заметно | Valere le Grand (EN: Valerius Maximus) | Валерия Великого | Валерий Максим (согласовать с EN) | исправлено |
| p1-66 | attrs[0].meaning | смысл | заметно | épigramme Grecque ... que j'ay ainsi traduite (переводчик — сам автор Бодуэн) | по греческой эпиграмме, переведённой Альциатом (то же meaning_en/frtrans) | Эпиграмма греческая, у Альциата эмблема; перевод — Бодуэна | исправлено |
| p1-88 | attrs[0].meaning | добавление | заметно | (в text_fr нет толкования буквы Y и царского убора) | буква Y (путь Пифагора) — развилка между добром и злом; царское убранство — власть разума над выбором | Толкования отсутствуют в оригинале; убрать или подтвердить по недостающему тексту | исправлено |
| p1-88 | text_fr[1] | транскрипция | заметно | (статья обрывается определением Свободной Воли; нет толкования короны, скипетра, буквы Y, разноцветного платья) | text_fr из 2 абзацев; attrs толкуют Y и убор | Вероятно, потерян продолжающий текст; проверить по скану | ложное: по скану p1-088/089 текст статьи действительно кончается определением; транскрипция полная, продолжения нет |
| p1-97 | text_en[3] | смысл | заметно | dans vne forest où il s'estoit sauvé pour secouër le joug de son maistre (il = раб) | in a forest where it had fled to shake off its master's yoke (it = лев) | where he had fled — бежал раб, а не лев | исправлено |
| p1-97 | text_ru[3] | RU≠EN | заметно | vne fille de Ceste | некоей девушки из Кесты (EN: a maiden of Sestos) | Согласовать RU и EN; вероятно, «из Сеста» (Sestos) | исправлено |
| p1-101 | attrs[0].meaning | RU≠EN | заметно | la corneille est un oiseau que les Égyptiens révéraient | галка — птица, которую египтяне почитали | «ворона — птица...» | исправлено |
| p1-101 | attrs[0].what | RU≠EN | заметно | une corneille à ses pieds | галкой у ног (what_en: a crow) | «вороной у ног» | исправлено |
| p1-101 | text_ru[0] | RU≠EN | заметно | à ses pieds vne corneille | с галкой у ног (EN: crow) | corneille = ворона, не галка; «с вороной у ног» | исправлено |
| p1-101 | text_ru[4] | RU≠EN | заметно | la corneille que l'on a mise à ses pieds | Что до галки, помещённой у её ног | «Что до вороны» | исправлено |
| p1-114 | text_ru[5] | RU≠EN | заметно | riviere Sellienne (EN: Selemnus) | реке Селлеенте | Пересмотреть имя: у Павсания река Селемн; согласовать RU и EN | исправлено |
| p1-115 | text_ru[4] | смысл | заметно | La premiere est celle d'Auguste, où elle est gravée tenant... (elle = Paix) | Первая — медаль Августа, где он изображён держащим... (он = Мир) | Читается как Август с оливковой ветвью; везде в [4]-[9] писать «она (Мир) изображена» | исправлено |
| p1-115 | text_ru[8] | смысл | заметно | où elle se voit assise en vn thrône... aprés s'en estre servie comme Hercule | где он восседает на троне... опираясь на палицу, которой он, подобно Геркулесу, воспользовался | Субъект — Мир, а не Гальба: «где она восседает... которой она, подобно Геркулесу, воспользовалась»; род согласовать также в [5],[6],[7] | исправлено |
| p1-132 | text_ru[4] | цитата/стих | заметно | Sur tous les actes vicieux / Leur fait haïr l'ingratitude | Всем порочным деяниям / Внушает ненависть к неблагодарности | «Из всех порочных дел заставляет их ненавидеть прежде всего неблагодарность» | исправлено |
| p1-145 | attrs[0].what(+what_en,what_frtrans) | атрибут | заметно | couronne d'épines (text_fr[0]; в meaning тоже) | couronné de laurier / laurel-crowned / лавром | Привести к тексту: увенчан терновым венцом (или сверить с гравюрой) | ложное: на гравюре (p1-143-1) у кающегося лавровый венок; attrs описывают гравюру, а терновый венец текста — в meaning |
| p1-146 | text_en[5] | смысл | заметно | luy fait tenir vn fusil en main (fusil = огниво/кресало) | makes it hold a flintlock in hand | a fire-steel (striker) in hand; ружьё-флинтлок здесь неверно | исправлено |
| p1-152 | text_ru[3] | имя | заметно | Devises Heroïques de Paradin | Героических Эмблемах Паладина | Парадена (Клод Парадин), не Паладина | исправлено |
| p1-172 | text_en[2] | цитата/стих | заметно | Celle de qui l'amour est pure, / Ne l'invoque jamais en vain | She whose love is pure / Is never invoked in vain | She whose love is pure / Never invokes her in vain | исправлено |
| p1-172 | text_ru[2] | цитата/стих | заметно | Celle de qui l'amour est pure, / Ne l'invoque jamais en vain | Та, чья любовь чиста, / Никогда не призывается напрасно | Субъект/объект перепутан: Та, чья любовь чиста, никогда не призывает её (Юнону) напрасно | исправлено |
| p2-13 | text_ru[0],[7]; text_en[0],[7]; attrs[0].what_en | смысл | заметно | ceinture ... de bleu turquin | пояс бирюзовой сини / belt of turquoise blue | bleu turquin = тёмно-синий (индиго/«турецкий синий»), не бирюзовый: «пояс тёмно-синего цвета» / dark blue | исправлено |
| p2-14 | attrs[0].meaning | добавление | заметно | le Lotte ... se trouve dans le fond de l'Euphrate, se lève avec le Soleil (о юге/экваторе не сказано) | лотос — южное, экваториальное растение | Заменить на: «лотос, поднимающийся из воды с восходом солнца и скрывающийся с закатом» | исправлено |
| p2-14 | text_ru[0]; text_en[0] | смысл | заметно | ceinture de bleu turquin | пояс бирюзовой сини / girdle of turquoise blue | тёмно-синий / dark blue (turquin не turquoise) | исправлено |
| p2-15 | text_ru[0],[3]; attrs[0].what | смысл | заметно | couvert d'armes blanches (блестящие/светлые доспехи) | облачён в белое оружие | «белое оружие» по-русски значит холодное оружие; лучше «в светлых (блестящих) доспехах» (EN «white armor» допустим) | исправлено |
| p2-15 | text_ru[0],[4]; text_en[0],[4] | смысл | заметно | écharpe de bleu turquin | перевязь бирюзовой сини / scarf of turquoise blue | тёмно-синего цвета / dark blue | исправлено |
| p2-16 | text_ru[0]; text_en[0] | смысл | заметно | ceinture de bleu turquin | пояс бирюзовой сини / girdle of turquoise blue | тёмно-синий / dark blue | исправлено |
| p2-17 | attrs[0].meaning | добавление | заметно | цветы сеет только Восточный ветер (р.2); у Южного ветра цветов нет | сеемые цветы — атрибут, общий для всех четырёх ветров | Убрать «общий для всех четырёх ветров»; в тексте общие только крылья | исправлено |
| p2-21 | attrs[0].meaning; attrs[0].meaning_en | смысл | заметно | Heures en enfance, Jours en adolescence, Mois en jeunesse, Année en virilité, Temps en vieillesse | Юность месяцев — первая из четырёх возрастных ступеней (перечислено пять) | Месяцы — третья из пяти ступеней (часы-дни-месяцы-год-время); убрать «первая из четырёх» | исправлено |
| p2-33 | attrs[0].what | атрибут | заметно | [0] tient de la main gauche vn globe ... de la droite vne Ecrevice; [8] globe de la main droite; [10] Ecrevice de la main gauche | шар в правой руке, Рак в левой (RU text_ru[0] — наоборот) | Оригинал внутренне противоречив ([0] vs [8],[10]); отметить и выбрать вариант сознательно | исправлено |
| p2-33 | text_ru[0]; text_en[0] | смысл | заметно | cercle de bleu turquin | круг бирюзовой сини / turquoise blue | тёмно-синий / dark blue | исправлено |
| p2-34 | text_ru[0]; text_en[0] | смысл | заметно | cercle ... de bleu turquin | круг ... бирюзовой сини / turquoise blue | тёмно-синий / dark blue | исправлено |
| p2-35 | text_ru[0]; text_en[0]; attrs[0] | смысл | заметно | ceinture ... de bleu turquin (в [5]: couleur celeste) | пояс бирюзовой сини / turquoise (what_frtrans: bleu turquoise) | тёмно-синий / dark blue; what_frtrans: bleu turquin | исправлено |
| p2-36 | text_ru[0]; text_en[0] | смысл | заметно | ceinture un cercle de bleu turquin | круг бирюзовой сини / turquoise blue | тёмно-синий / dark blue | исправлено |
| p2-62 | text_fr[2] | транскрипция | заметно | (конец статьи о Fortune d'or) | text_fr[2]-[4]: «A ces figures de la Fortune, l'on en peut adjoûter encore deux autres… Fortune Pacifique… laurier» | Абзацы [2]-[4] дублируют текст p2-59 (Bonne Fortune) — вероятно, ошибка вёрстки/сегментации; проверить по скану и убрать из p2-62, если их там нет | ложное: Абзацы [2]-[4] стоят в оригинале (с. 77) именно в конце «Fortune d'or»; дублем является p2-59[3]-[4], а не p2-62 (правка p2-59 вне этой группы) |
| p2-66 | text_en[5] | смысл | заметно | à les deduire par nombres | teaches it to set them forth in due order | «teaches it to set them forth in numbers (verse/measure)» | исправлено |
| p2-66 | text_ru[5] | смысл | заметно | à les deduire par nombres | научающий выводить их по порядку | «научающий излагать их стихами (размерами)» — nombres = стихотворные размеры | исправлено |
| p2-76 | text_ru[0] | пропуск | заметно | le visage folastre & lascif | лик игривый и шаловливый | «лик игривый и похотливый (развязный)» — потеряно lascif (EN: wanton) | исправлено |
| p2-88 | attrs[0].what | атрибут | заметно | une besche en la main droite, & en la gauche un soc de charruë | с заступом на плече и лемехом плуга в руке | «с заступом в правой руке и лемехом плуга в левой» (так же what_en «over his shoulder», what_frtrans «sur l'épaule») | исправлено |
| p2-119 | attrs[0].what | атрибут | заметно | vne cicogne (text_fr[0]) | what_frtrans: héron; what: цаплю; what_en: heron (в meaning: «цапля/аист», «heron/stork») | Заменить на аиста / stork во всех полях attrs (what_frtrans, what, what_en, meaning) | исправлено |
| p2-119 | text_ru[0] | атрибут | заметно | tient vne cicogne de la main gauche | держит в левой руке цаплю | держит в левой руке аиста (cicogne = аист; далее в тексте сами «аисты») | исправлено |
| p2-167 | text_ru[1] | RU≠EN | заметно | J'obmets que la guirlande d'hysope signifie | Добавлю, что венец из иссопа (EN: I omit) | Опускаю / Не стану говорить подробно, что венец из иссопа... (как в EN и оригинале) | исправлено |
| p2-187 | text_ru[1] | смысл | заметно | J'obmets que le crocodile sur qui elle est montée | Добавлю, что крокодил, на котором она восседает | Умалчиваю о том, что крокодил... (J'obmets = «опускаю/не стану говорить»; EN верно: I omit) | исправлено |
| p2-198 | text_ru[0] | смысл | заметно | J'obmets que par la queuë du scorpion | Добавлю, что хвостом скорпиона | Умалчиваю о том, что... (J'obmets = опускаю; EN верно: I omit) | исправлено |
| p1-1 | attrs[0].meaning_frtrans | имя | мелочь | l'Indigence son ennemie (text_fr[1]) | la Disette, son ennemie | заменить на l'Indigence, как в тексте | исправлено |
| p1-4 | attrs[3].meaning | смысл | мелочь | un ormeau sec, environné d'vn sep de vigne | (сухое дерево) ... (цветущая лоза) | убрать «цветущая»: в оригинале просто виноградная лоза | исправлено |
| p1-4 | attrs[3].meaning_en | смысл | мелочь | un ormeau sec, environné d'vn sep de vigne | the bare tree ... the flowering vine | убрать «flowering»: vine | исправлено |
| p1-4 | attrs[3].meaning_frtrans | смысл | мелочь | un ormeau sec, environné d'vn sep de vigne | la vigne fleurie | убрать «fleurie»: la vigne | исправлено |
| p1-5 | text_en[3] | RU≠EN | мелочь | Amarillis à son Myrtille | Amaryllis ... her Myrtillo (RU: Миртиль) | унифицировать имя: Myrtil / Mirtillo во всех версиях | ложное: имя уже единообразно: p1-5 и p2-97 везде Myrtillo (EN) / Миртил(ль)... Amaryllis; расхождение лишь в грамматических формах («Миртиль» в тексте p1-5 — форма к Myrtille), правки нет |
| p1-9 | attrs[0].what | прочее | мелочь | le sacré Nom de JESVS sur sa poitrine | имя IHS (Иисус) на груди | «имя ИИСУС» на груди (в оригинале JESVS, а не монограмма IHS) | исправлено |
| p1-9 | attrs[0].what_en | прочее | мелочь | le sacré Nom de JESVS sur sa poitrine | the name IHS (Jesus) on its breast | the sacred Name of JESUS on its breast | исправлено |
| p1-9 | attrs[0].what_frtrans | прочее | мелочь | le sacré Nom de JESVS sur sa poitrine | le nom IHS (Jésus) sur la poitrine | le saint Nom de JESVS sur la poitrine | исправлено |
| p1-10 | text_fr[6] | транскрипция | мелочь | se remit à l'heure mesme sur la teste, & se tournant vers le messager | (пропущено существительное: что именно надел на голову; RU/EN подставляют «венец»/crown) | вероятно пропущено «sa couronne»: se remit à l'heure mesme sur la teste [sa couronne]; сверить со сканом | ложное: text_fr[6] совпадает со сканом (стр. 23): в оригинале «se remit à l'heure mesme sur la teste» без существительного (elliptical, венец из предшествующего контекста); перевод «венец» уместен |
| p1-11 | text_en[0] | смысл | мелочь | non autrement qu'on a de coustume de representer Dieu & les Anges | in no other way than Custom represents God and the Angels | in no other way than is customary in representing God and the Angels | исправлено |
| p1-12 | attrs | пропуск | мелочь | зелёное платье = надежда славы или выгоды (text_fr[2]) | нет записи о зелёном платье | добавить attrs: зелёное платье означает надежду на славу или выгоду | оставлено (стилистика) |
| p1-12 | text_ru[2] | смысл | мелочь | ne s'estudient à perfectionner la nature ... qu'à cause de l'esperance | стремятся усовершенствовать природу ... в надежде либо снискать славу | потеряно «только»: стремятся ... лишь в надежде (EN содержит only) | исправлено |
| p1-13 | text_fr[2] | транскрипция | мелочь | Ariste a pris plaisir de citer en ses Mecaniques | Ariste (RU: Арист; EN: Aristus) | вероятно Aristote (Механика Аристотеля): сверить со сканом; перевод: Аристотель / Aristotle | ложное: скан (стр. 27): «Ariste», транскрипция верна; в тексте источника именно Ariste, перевод передаёт напечатанное |
| p1-13 | text_fr[3] | транскрипция | мелочь | au & Prince des Poëtes Latins | au & Prince | переставлено: «& au Prince des Poëtes Latins» | ложное: скан (стр. 27): «au & Prince des Poëtes Latins», транскрипция верна (опечатка источника) |
| p1-17 | text_en[8] | смысл | мелочь | les Poëtes qui en sont inspirez (en = les Muses) | the Poets inspired by her | the Poets inspired by them (the Muses) | исправлено |
| p1-17 | text_ru[8] | смысл | мелочь | les Poëtes qui en sont inspirez (en = les Muses) | Поэты, вдохновляемые ею (Зарёй) | Поэты, вдохновляемые Музами | исправлено |
| p1-26 | attrs[0].meaning | смысл | мелочь | la foudre ... vn épervier ... vn dauphin (молния, воздух, вода) | в небе, в воздухе и в воде | молния, воздух (ястреб) и вода (дельфин): «в небе» и «в воздухе» дублируют друг друга | оставлено (стилистика) |
| p1-36 | attrs[0].what | атрибут | мелочь | des aisles au dos, les bras en haut | взъерошенными волосами и поднятыми крыльями | крылья за спиной, руки подняты (не крылья) | исправлено |
| p1-36 | attrs[0].what_en | атрибут | мелочь | des aisles au dos, les bras en haut | bristling hair and raised wings | wings on her back and raised arms | исправлено |
| p1-36 | attrs[0].what_frtrans | атрибут | мелочь | des aisles au dos, les bras en haut | les cheveux hérissés et les ailes dressées | des ailes au dos et les bras levés | исправлено |
| p1-42 | attrs | пропуск | мелочь | trepied d'or à la teste (вариант) ; rosée qui tombe du ciel (text_fr[0], [4]-[5]) | в attrs нет ни золотого треножника, ни росы | добавить attrs: золотой треножник на голове (благородство металла, совершенство числа три) и падающая с неба роса | исправлено |
| p1-43 | attrs[0].what | атрибут | мелочь | vn jeune garçon | Юноша, идущий во тьме | Мальчик (юный мальчик), идущий во тьме | исправлено |
| p1-43 | attrs[0].what_en | атрибут | мелочь | vn jeune garçon | A youth walking in darkness | A young boy walking in darkness | исправлено |
| p1-43 | attrs[0].what_frtrans | атрибут | мелочь | vn jeune garçon | Un jeune homme marchant dans les ténèbres | Un jeune garçon marchant dans les ténèbres | исправлено |
| p1-44 | attrs[1].what_frtrans | смысл | мелочь | vn chameau sur ses genoux | Un chameau à genoux | Un chameau sur ses genoux | исправлено |
| p1-46 | attrs[0].meaning_frtrans | смысл | мелочь | pasle ... vne des marques de la douleur | La pâleur est une marque de deuil | В meaning_frtrans: «marque de douleur» (RU/EN уже верно: скорбь/grief) | исправлено |
| p1-54 | text_en[0] | смысл | мелочь | vne horloge à la teste | an hourglass upon his head (также attrs[0].what_en/meaning_en «hourglass», what_frtrans «sablier»; RU «часы») | horloge = часы/clock, не sablier; привести EN и frtrans к «clock» | исправлено |
| p1-55 | attrs[1].meaning | добавление | мелочь | (о соколе в тексте нет объяснения; только «vn faucon de la gauche») | неизменный атрибут странствующего путника (то же в meaning_en/frtrans) | Убрать выдуманное толкование или оставить пустым | исправлено |
| p1-56 | attrs[4].meaning | добавление | мелочь | pierre de touche ... infaillible du prix des metaux; огонь совершенствует металлы | и огонь, раскрывающий тайны природы | Убрать «раскрывающий тайны природы»; в тексте огонь совершенствует/разделяет металлы | исправлено |
| p1-56 | text_fr[1] | транскрипция | мелочь | Car elle se produit par l'âge, Et fait par vn divers vsage ... (стих) | стихотворные строки слиты в прозу без разделителей «/» | Разбить стих разделителями « / » как в других статьях | исправлено |
| p1-56 | text_ru[1] | смысл | мелочь | ce que l'Art ... A de plus admirable en soy | то, что Искусство ... являет в себе ещё более дивным | «самое дивное» (plus admirable = most admirable), а не «ещё более»; стих передан прозой | исправлено |
| p1-57 | attrs[2].meaning | добавление | мелочь | les pieds sur vne roüe (в тексте колесо не истолковано) | переменчивость и непостоянство благосклонности | Пометить как толкование составителя или убрать | исправлено |
| p1-65 | text_ru[1] | добавление | мелочь | accommoder la figure à la façon de parler | приноровить изображение к грамматическому роду этого слова (то же text_en[1] «gender of the word») | «к способу выражения»; про грамматический род в оригинале нет | исправлено |
| p1-69 | attrs[0].meaning | смысл | мелочь | ne l'obligent pas tant ... que celles du Ciel | Слава заботится не о земном, а о небесной награде | «не столько о земном, сколько о небесном» (ослабить категоричность) | исправлено |
| p1-73 | text_fr[1] | транскрипция | мелочь | attendant que leurs bonnes soient revenuës | leurs bonnes (без существительного); RU «добрая сила», EN «strength» | Вероятно пропущено слово (plumes?); проверить по скану | исправлено |
| p1-79 | text_ru[4] | имя | мелочь | Pierius liv. 50 | Пьерий в 50-й книге | Пиерий (как в p1-53, p1-59, p1-65) | исправлено |
| p1-82 | attrs[0].meaning | добавление | мелочь | l'heliotrope, ou la fleur du Soleil (толкования гелиотропа в тексте нет) | гелиотроп ... — сравнение разума со светом (то же EN/frtrans) | Толкование из текста про Аристотеля притянуто; убрать или пометить | исправлено |
| p1-84 | attrs[0].meaning | добавление | мелочь | l'image de la Nature, pour montrer qu'elle invente toutes choses | образ Природы — её неисчерпаемый источник | «изобретает всё сущее»; «неисчерпаемый источник» не из текста | исправлено |
| p1-86 | text_en[4] | смысл | мелочь | J'obmets que parmy plusieurs medailles | I omit not to mention that among several medals | I pass over that / I leave aside that | исправлено |
| p1-86 | text_ru[4] | смысл | мелочь | J'obmets que parmy plusieurs medailles | Не премину заметить, что среди многих медалей | «Умолчу о том» (как в p1-53) | исправлено |
| p1-88 | text_en[0] | смысл | мелочь | vn equipage de Roy | with the retinue of a King | in royal array / royal trappings | исправлено |
| p1-88 | text_ru[0] | смысл | мелочь | vn equipage de Roy | со свитой, подобающей Царю (EN «retinue of a King») | «в царском облачении/убранстве» (equipage = снаряжение, убор) | исправлено |
| p1-90 | text_ru[3] | смысл | мелочь | les elemens, qui sont le chef-d'œuvre de ses mains | стихии, являющиеся венцом творения рук Его | «шедевром (творением) рук Его»; «венец» искажает chef-d'œuvre | исправлено |
| p1-99 | text_en[5] | пропуск | мелочь | en vos jugemens, en vos regles, en vos poids, ny en vos mesures | in judgment, in measures of length, of weight, or of quantity | Перевести цитату по французскому: в судах, в правилах (мерилах), в весах и в мерах; в RU тоже нет «regles» | исправлено |
| p1-99 | text_ru[1] | RU≠EN | мелочь | Procax regnoit en Albanie | во времена, когда в Албании царствовал Прокс (EN: Procas) | «Прокас»/«Прока» (согласовать с EN) | исправлено |
| p1-109 | text_fr[3] | транскрипция | мелочь | nous apprend | nou apprend | nous apprend (пропущена s) | ложное: скан p1-108-4: в печати действительно «nou apprend»; транскрипция верна оригиналу |
| p1-121 | text_fr[1] | транскрипция | мелочь | instrument porportionné | instrument porportionné | proportionné (опечатка) | ложное: скан p1-120-3: в печати действительно «porportionné»; транскрипция верна оригиналу |
| p1-126 | text_ru[1] | имя | мелочь | sœur & compagne de la Charité (EN: Charity) | сестрой и спутницей Милосердия | Charité (caritas) — «Любовь/Милосердие» смешано с Misericorde (Милосердие, p1-101); согласовать терминологию (также ru[4]) | исправлено |
| p1-126 | text_ru[4] | имя | мелочь | preuves de sa charité | доказательства своего милосердия | «любви к ближнему (милосердия-caritas)»; согласовать с ru[1] | исправлено |
| p1-128 | text_fr[6] | транскрипция | мелочь | de peur que la malice ne change ast son entendement | change ast | changeast (разрыв слова) | исправлено |
| p1-130 | text_ru[2] | RU≠EN | мелочь | la Perseverance (EN: Perseverance; заголовок ru: Настойчивость) | чтобы с ней непременно соединялось Постоянство | «Настойчивость» — единообразно с названием | исправлено |
| p1-138 | text_en[2] | RU≠EN | мелочь | Marcia, Otacilla, Severa | RU: Марции Отацилии Северы (одно лицо); EN: Marcia, Otacilia, Severa (три имени) | В EN слить: Marcia Otacilia Severa (как в RU) или оба варианта привести к оригиналу | исправлено |
| p1-139 | text_fr[1] | транскрипция | мелочь | les Thologiens | Thologiens | Исправить на Theologiens/Théologiens | ложное: в скане (p1-139-1) напечатано «Thologiens» — опечатка оригинала, транскрипция верна |
| p1-139 | text_ru[3] | смысл | мелочь | Par ses bras nuds se doivent entendre les actions | Под её обнажёнными руками должно разуметь деяния | Обнажёнными руками означены деяния (а не «под руками») | оставлено (стилистика) |
| p1-141 | text_fr[4] | транскрипция | мелочь | les Analois | Analois (RU: англы, EN: Angles) | Исправить транскрипцию: Anglois | ложное: в скане (p1-141-3) напечатано «Analois» — опечатка оригинала; RU/EN уже «англы/Angles» |
| p1-142 | attrs[0].what_en | RU≠EN | мелочь | deux amours / two small Cupids (text_en[0]) | two cherubs | Заменить cherubs на Cupids | исправлено |
| p1-144 | text_ru[0] | цитата/стих | мелочь | pereunt discrimine nullo Amissæ leges | pereunt discrimine nullo Amissa leges (без различия гибнут утраченные законы) | Латынь: Amissæ; русская глосса в скобках добавлена переводчиком (в оригинале и EN её нет, она противоречит французскому стиху) - убрать или оговорить | исправлено |
| p1-151 | text_en[3] | смысл | мелочь | comme le globe n'en reçoit aucune de mouvement | as the globe receives no motion but a circular one | добавлено «but a circular one»; по оригиналу: no contrary motion | исправлено |
| p1-151 | text_ru[3] | смысл | мелочь | comme le globe n'en reçoit aucune de mouvement | как шар не приемлет никакого иного движения кроме кругового | добавлено «кроме кругового»; по оригиналу: шар не знает противоположного движения | исправлено |
| p1-162 | text_fr[0] | транскрипция | мелочь | de la main gauche tient vn livre ... & de la gauche le bord | de la main gauche ... & de la gauche (дважды левая) | Первое gauche, вероятно, droite (EN: right hand) | ложное: в скане (p1-162-3) напечатано «gauche» дважды (опечатка); транскрипция верна; по гравюре книга в левой, край одеяния в правой |
| p1-162 | text_ru[0] | RU≠EN | мелочь | EN: in her right hand an account-book ... with her left the hem | RU: в левой руке счётную книгу ... другой рукою край одеяния | Согласовать руки RU и EN (в RU правая) | исправлено |
| p1-162 | text_ru[0] | прочее | мелочь | un petit lezard | небольшой ящерка | небольшая ящерка | исправлено |
| p1-169 | text_ru[0] | RU≠EN | мелочь | vne branche de rosier / a branch of the rose bush | с веткой шиповника | веткой розового куста | исправлено |
| p2-4 | attrs[0].meaning | добавление | мелочь | Le Soleil darde ses rayons à plomb sur sa teste (о небесном происхождении огня не сказано) | Солнечные лучи над головой — небесное происхождение огня | Убрать толкование: «Солнце отвесно льёт лучи на голову» без «небесного происхождения» | исправлено |
| p2-6 | text_fr[6] | транскрипция | мелочь | extrememement venimeux | extrememement (лишнее «me») | extremement venimeux | исправлено |
| p2-6 | text_ru[1] | имя | мелочь | selon Joseph | по Иосифу (EN: Josephus) | Иосиф Флавий (по Флавию Иосифу), чтобы не путать с патриархом | исправлено |
| p2-8 | attrs[0].what | атрибут | мелочь | vn voile de plusieurs couleurs ... vne écharpe de plumes | в накидке из перьев (разноцветное покрывало опущено) | «в разноцветном покрывале, наполовину скрывающем тело, и с перевязью из перьев» | исправлено |
| p2-9 | attrs[0].what | добавление | мелочь | par la guirlande & les bouquets de diverses fleurs qu'elle porte | Молодая женщина ... в обеих поднятых руках букеты | В тексте нет «молодая» и «обеих поднятых рук»; убрать или оговорить как описание картинки | ложное: attrs описывают гравюру (p2-10-1): молодая женщина, поднятые руки с букетами |
| p2-12 | attrs[0].what | добавление | мелочь | manger, de boire, & de se chauffer (стола не упомянуто) | стоящая спиной к огню у стола с едой | Убрать «у стола с едой» | ложное: на гравюре (p2-10-1) фигура у стола с едой; attrs описывают гравюру |
| p2-13 | text_ru[3] | RU≠EN | мелочь | sa chevelure blonde (в [0]: cheveux blonds comme l'or) | русые волосы (в [0]: «златовидными как золото»; EN: golden hair) | Единообразно: «светлые (золотые) волосы»; в [0] «златокудрыми» вместо «златовидными как золото» | исправлено |
| p2-14 | text_ru[4]; text_en[4] | смысл | мелочь | J'obmets qu'il porte deux fleches | Упомяну, что он несёт ... / I note that he carries | «Опускаю» не точно: смысл «Не забудем, что...»; согласовать с p2-42 (там «Опускаю/I omit») | исправлено |
| p2-15 | text_ru[0]; attrs[0].what | смысл | мелочь | les cheveux blonds | русыми волосами | светлыми (белокурыми) волосами | исправлено |
| p2-16 | text_fr[0]/[6] | прочее | мелочь | [0] tient de la gauche des pavots; [6] pavots qu'il tient de la main droite | RU/EN повторяют противоречие; attrs: маки в левой | Оригинал противоречив; пометить, attrs следует [0] | оставлено (стилистика) |
| p2-16 | text_ru[1] | имя | мелочь | Pontan | Понтан (EN: Pontano) | Понтано (Джованни Понтано), как в EN | исправлено |
| p2-19 | attrs[0].what | добавление | мелочь | tient vn arrosoir en main | выдыхающий облако и держащий лейку, из которой льётся вода | Убрать «выдыхающий облако» и «льётся вода» (нет в тексте); то же в meaning/what_en/meaning_en | исправлено |
| p2-26 | text_fr[3] | транскрипция | мелочь | le Soleil de mesme en ce mois-là, & ne fait seulement que perfectionner | нет глагола после «de mesme en ce mois-là» | Вероятно пропуск: «le Soleil de mesme ... [n'engendre rien] & ne fait seulement que»; сверить со сканом | исправлено |
| p2-31 | attrs[0].what; what_en | добавление | мелочь | le Signe du Verseur d'eau (описание знака не дано) | (коленопреклонённым юношей с сосудом, льющим воду) | Убрать скобку: в тексте нет описания фигуры Водолея | исправлено |
| p2-32 | attrs[0].what; what_en | добавление | мелочь | le Signe des Poissons (без описания) | (две рыбы в круге) | Убрать скобку | исправлено |
| p2-37 | text_ru[14] | смысл | мелочь | Le cinquiéme a Mars pour ascendant | Пятым восходящим светилом служит Марс | «Пятый возраст имеет своим управителем (восходящим) Марс»; потерян «возраст» | исправлено |
| p2-42 | text_ru[4]; text_fr[4] | транскрипция | мелочь | Astons (у Плиния Astomi — «безротые») | Астонами / EN: Astomi | В text_fr вероятно «Astomes»; RU «Астомами», согласовать с EN | ложное: скан p.55: в печати «Astons», транскрипция верна; RU «Астонами» следует печати |
| p2-44 | text_ru[0] | смысл | мелочь | une femme ... qui tient vn luth | подле коей возлежит лань, держащая лютню | Причастие «держащая» относится к лани; переписать: «женщина, держащая лютню ..., подле неё лань» | исправлено |
| p2-55 | text_en[1] | RU≠EN | мелочь | On la represente par un jeune homme ... d'une femme | He is represented by a young man | Concord — it/she: «It (Concord) is represented by a young man…» (RU «Его» корректно) | исправлено |
| p2-59 | attrs[0].what | добавление | мелочь | une femme ... assise, s'appuye du bras droit sur une roüe (крыльев нет) | крылатая женщина, сидящая, опирающаяся на колесо | Убрать «крылатая» (так же what_en «winged», what_frtrans «ailée»), если крылья не видны на гравюре | ложное: на гравюре Bonne Fortune (скан p2-59-1) женщина с крыльями; «крылатая» оправдано изображением |
| p2-62 | attrs[0].what | добавление | мелочь | une belle femme, avec des aisles au dos, & couchée tout de son long | Крылатая обнажённая женщина, возлежащая | «обнажённая» в тексте нет (так же what_en «naked», what_frtrans «nue») — убрать или подтвердить по гравюре | исправлено |
| p2-62 | text_en[3] | имя | мелочь | Antonin le Debonnaire; Fortune Pacifique | Antoninus the Kind; Pacific Fortune | Единообразно с p2-59: «Antoninus the Debonair»; «Peaceful Fortune» | исправлено |
| p2-62 | text_ru[3] | имя | мелочь | Antonin le Debonnaire; Fortune Pacifique | Антонина Благочестивого; Фортуна Мирная | Единообразно с p2-59: «Антонина Благодушного (le Débonnaire)», «Фортуна Миротворная» (или выбрать один вариант для обеих статей) | исправлено |
| p2-63 | text_ru[0] | смысл | мелочь | pour l'assommer avec sa massuë | дабы оглушить его своей палицей | «чтобы сразить/прибить его палицей» (assommer = убить ударом, не оглушить) | исправлено |
| p2-69 | ru | имя | мелочь | Polymnie (заголовок и текст) | ru «Полигимния» / текст «Полимния»; en «Polyhymnia» / текст «Polymnia» | Унифицировать написание в заголовке и тексте (ru: Полигимния/Полимния; en: Polyhymnia/Polymnia) | исправлено |
| p2-69 | text_ru[0] | имя | мелочь | Euterpe | Евтерпа | В статье p2-75 заголовок «Эвтерпа» — унифицировать («Эвтерпа») | исправлено |
| p2-75 | text_en[2] | RU≠EN | мелочь | soit au dessus de la Dialectique | RU «выше Диалектики» / EN «presides over Dialectic» | EN привести к оригиналу/RU: «stands above Dialectic» | исправлено |
| p2-75 | text_ru[0] | смысл | мелочь | les clerons, les hauts-bois | корнетов, гобоев | clairon = труба/горн (clarion): «горнов/труб» вместо «корнетов» | исправлено |
| p2-76 | text_ru[0] | смысл | мелочь | des brodequins aux pieds | котурны (лёгкая комическая обувь) | Котурны — трагическая обувь; для комедии «сокки/башмаки» (brodequins = buskins в EN); убрать противоречивую вставку в скобках | исправлено |
| p2-78 | text_ru[0] | смысл | мелочь | un cornet à bouquin | охотничий рог (hunting horn) | cornet à bouquin = цинк/корнет (духовой инструмент), не охотничий рог (то же в EN, attrs, и в p2-79) | исправлено |
| p2-78 | text_ru[5] | смысл | мелочь | les nombres de la Poësie | числа Поэзии | «стихотворные размеры (ритм) Поэзии» | исправлено |
| p2-79 | text_ru[0] | смысл | мелочь | un cornet à bouquin en la main droite | охотничьим рогом в правой руке | «корнетом (цинком)» — см. p2-78 | исправлено |
| p2-81 | text_ru[0] | RU≠EN | мелочь | un écriteau en la droite | свитком в правой руке (EN placard) | «табличкой/надписью» вместо «свитком» (так же в attrs) | исправлено |
| p2-85 | ru | имя | мелочь | Vertu invincible | Непобедимая доблесть (в тексте и атрибутах — «Добродетель») | «Непобедимая добродетель» — единообразно с текстом | исправлено |
| p2-86 | attrs[0].what | добавление | мелочь | un lion & un sanglier qui marchent ensemble | ведущий связанных льва и вепря (liés ensemble / bound) | Убрать «связанных»: в тексте лишь «идущих вместе» | исправлено |
| p2-86 | ru | имя | мелочь | Vertu de corps & de courage | Доблесть тела и духа | «Добродетель тела и мужества» (courage = мужество, в тексте «сила мужества») | исправлено |
| p2-87 | text_ru[1] | смысл | мелочь | pour en assommer un dragon | дабы оглушить ею дракона | «чтобы сразить/прибить дракона» (assommer) | исправлено |
| p2-90 | attrs[0].what | добавление | мелочь | porter & rapporter une grosse pierre sur une haute montagne | несущий на плече огромный камень | «на плече» в тексте нет — убрать (так же what_en) | исправлено |
| p2-90 | attrs[0].what_frtrans | RU≠EN | мелочь | porter & rapporter une grosse pierre | portant sur l'épaule une énorme pierre qu'il pousse au haut d'une montagne | «portant une énorme pierre au haut d'une montagne» — «pousse» расходится с RU/EN «несущий/carrying» и текстом | исправлено |
| p2-96 | text_fr[1] | транскрипция | мелочь | trois sceptres (fr[1]) vs quatre sceptres (fr[6]) | три скипетра / three scepters (text, attrs.what) vs четыре (fr[6]) | Расхождение в самом оригинале (trois/quatre); сверить со сканом, при ошибке OCR исправить; перевод следует оригиналу | оставлено (стилистика) |
| p2-97 | text_en[1] | RU≠EN | мелочь | une horloge en la main droite (в attrs: sablier) | EN: a clock in his right hand; RU: песочные часы | Привести к единому: EN "an hourglass" (в attrs EN уже sand-glass); в text_en[1] и [2] "the clock" -> "the hourglass" | исправлено |
| p2-97 | text_fr[3] | транскрипция | мелочь | Κιρκνος (греч. название птицы) | Κιρκνος | Вероятно ошибка OCR греческого слова (ожидается Κίγκλος, лат. cinclus); сверить со сканом | оставлено (стилистика) |
| p2-100 | text_en[3] | RU≠EN | мелочь | Ancur, fils d'Emidas Roy de Phrygie | EN: Ancurus, son of Midas King of Phrygia; RU: Анкура, сына Эмидаса | Привести к единому: в оригинале Emidas (искажённое Midas); либо оба "Мидаса" со сноской, либо оба по оригиналу | исправлено |
| p2-103 | text_en[1] | RU≠EN | мелочь | vn écriteau, avec ce mot Grec Φιλαυτία | EN: a tablet (text_en[1], [3]); attrs EN: a scroll; RU: свиток | Заменить "tablet" на "scroll"/"placard" для единообразия с attrs | исправлено |
| p2-105a | text_ru[0] | имя | мелочь | Amathonte (тот же абзац в p2-101) | RU: Аматунт (в p2-101 text_ru[4]: Амафунт) | Единообразно: Аматунт (Амафунт) во всех статьях | исправлено |
| p2-108 | attrs[0].meaning | прочее | мелочь | l'aumône secrète | Скрытые руки — тайная подаяние | Опечатка рода: "тайное подаяние" | исправлено |
| p2-111 | ru | имя | мелочь | Amour de Renommée | ru: Любовь к известности; text_ru[0]: Любовь к Молве (Славе); en: Love of Fame / Renown | Единообразно передавать Renommée (напр. "Любовь к славе"/"к молве"), согласовать с названием p2-99 «Любовь к славе» (Amour de la gloire) | исправлено |
| p2-115 | ru | имя | мелочь | Charité | ru: Любовь, милосердие (Caritas); text_ru[0]: Милосердие (Каритас) | Единообразно: "Милосердие (Caritas)" или "Любовь (Caritas)" — как в тексте статьи и в соседних статьях | исправлено |
| p2-119 | ru | имя | мелочь | Commerce de la vie humaine | ru: Общение в человеческой жизни; text_ru[0]: «Оборот жизни», «взаимного оборота» | Единообразно: «Общение/Обмен в человеческой жизни» в названии и тексте (EN везде Commerce) | исправлено |
| p2-124 | text_ru[1] | смысл | мелочь | L'vn éveille ... / Et l'autre est l'aiguillon (l'un = horloge, l'autre = éperon) | Одни пробуждают ... / А другая — то острие | «Одно (часы) пробуждает наши заботы своей великой быстротой, / А другая (шпора) — острие, что колет и торопит нас» (мн. число «Одни» неверно) | исправлено |
| p2-125 | ru | имя | мелочь | Doctrine | ru: Учёность; text_ru[0]: Учения; en: Learning; text_en: Doctrine | Единообразно: название и текст (RU «Учение/Учёность», EN «Doctrine») | исправлено |
| p2-128 | text_en[0] | RU≠EN | мелочь | vn écriteau qui dit, VIRTVTEM ELIGO | EN: a tablet; RU: свиток; attrs EN: a scroll | "tablet" -> "scroll"/"placard" для единообразия с attrs | исправлено |
| p2-131 | text_en[0] | смысл | мелочь | vne sonde (свинцовый лот) | a plumb-line, or level | a plumb-line, or sounding-lead (в первом упоминании; «level» только для niveau) | исправлено |
| p2-138 | attrs[0].meaning | смысл | мелочь | морион в тексте — символ мудрости (sagesse; dard — война, olivier — мир) | военная сила как основа доброго правления / military strength | шишак — мудрость (Паллада); военная сила — дротик | исправлено |
| p2-139 | en | прочее | мелочь | Honnesteté (благопристойность, приличие) | Honesty | Decency / Propriety (Honesty вводит в заблуждение) | исправлено |
| p2-162 | en | прочее | мелочь | Pudicité = chasteté | Pudicity (в тексте Chastity) | Chastity (согласовать с text_en) | исправлено |
| p2-162 | ru | прочее | мелочь | Pudicité (в тексте передаётся как Целомудрие) | Стыдливость | Целомудрие (согласовать с text_ru и attrs) | исправлено |
| p2-163 | text_ru[1] | добавление | мелочь | DEVS SALVTIS MEÆ | БОЖЕ, БОЖЕ СПАСЕНИЯ МОЕГО | БОЖЕ СПАСЕНИЯ МОЕГО (лишнее «Боже») | исправлено |
| p2-165 | text_ru[0] | RU≠EN | мелочь | Vous me laverez, Seigneur, & je seray plus blanc que la neige | Омой меня, Господи, и я буду белее снега (EN: Thou shalt wash me) | Ты омоешь меня, Господи, и я буду белее снега | исправлено |
| p2-167 | text_en[1] | цитата/стих | мелочь | conformément à ces paroles de David, Asperges me Domine hysopo | Asperges me Domine hysopo, &c. (без перевода, в RU переведено) | добавить перевод: Thou shalt sprinkle me, O Lord, with hyssop | оставлено (стилистика) |
| p2-167 | text_fr[1] | транскрипция | мелочь | ne sommes purgez de nos pechez par la Penitence | ne sommes purgez ... par la Penitence (вероятно пропущено «que») | сверить с оригиналом: «ne sommes purgez de nos pechez que par la Penitence»; тогда в переводе «только покаянием» | ложное: на скане p.184 «ne sommes purgez de nos pechez par la Penitence» без que; транскрипция верна |
| p2-168 | text_fr[0] | транскрипция | мелочь | d'autant que | dautant que | d'autant que | ложное: на скане «dautant» без апострофа (орфография оригинала) |
| p2-170 | text_ru[0] | имя | мелочь | Reformation (название «Исправление нравов») | Под Преобразованием следует понимать | Под Исправлением (Реформацией) — согласовать с названием | исправлено |
| p2-189 | text_ru[0] | RU≠EN | мелочь | trois divers écriteaux | три различных свитка (EN: placards) | «три различные таблички/записки» (écriteaux — не свитки); так же attrs[2] | оставлено (стилистика) |
| p2-192 | text_ru[0] | имя | мелочь | la principale cause de la Detraction | праздность — главная причина Злословия (заголовок: Очернение; для Médisance — Злоречие) | единообразить термин: Очернение/Хуление вместо Злословия | исправлено |
| p2-201 | text_ru[0] | пропуск | мелочь | dont elle est le sanglant boute-feu | разжигателем коей она является | добавить «кровавым» (EN: bloody firebrand) | исправлено |
| p2-223 | text_en[0] | цитата/стих | мелочь | TORPET INERS (RU даёт перевод «косневет в бездействии») | TORPET INERS без перевода | Добавить перевод в скобках, как в RU: (“sluggish, it grows numb”) | исправлено |
| p2-228 | ru | RU≠EN | мелочь | Severité (EN Severity); в тексте RU «Строгость» | Суровость (заголовок) vs «Строгость» (text_ru[0]) | Привести к единому термину («Строгость» либо «Суровость») | исправлено |
| p2-229 | text_en[0] | цитата/стих | мелочь | INTVITV PRETII (RU: «В расчёте на цену») | INTVITV PRETII без перевода | Добавить перевод в скобках («with an eye to the price») | исправлено |
| p2-230 | text_ru[0] | имя | мелочь | chouëte ... chat-huant ... hibou | сова на голове; филин у ног; ...заяц, ворона и сова (hibou = сова) | Уточнить: chat-huant — неясыть/сова, hibou — филин; единообразно передать hibou/chat-huant | исправлено |
| p2-234 | text_en[0] | цитата/стих | мелочь | OCCVLTVM VISV DECVRRITE PISCIS AD HAMVM (RU переведено) | та же надпись без перевода | Добавить перевод в скобках, как в RU | исправлено |
| p2-243 | text_fr[0] | транскрипция | мелочь | vne ma- \| niere de sphere (перенос слова между абзацами 0 и 1); text_fr[5] «à vn en enfant» | vne ma-  /  niere; «vn en enfant» | Склеить «maniere» в text_fr[0]; исправить на «à vn enfant» | ложное: скан: в оригинале «à vn en enfant» (опечатка издания), text_fr верен; ma-/niere — разбивка по границе страницы, принятая в книге |
| p2-247 | text_en[0] | цитата/стих | мелочь | IMITATIO (RU: «ПОДРАЖАНИЕ») | IMITATIO без перевода | Добавить (“imitation”) | исправлено |
| p2-247 | text_fr[4] | транскрипция | мелочь | Et comme ils rejettoient du nombre des Poëtes... (ils — без антецедента) | начало абзаца без подлежащего | Проверить по скану: возможно, потерян фрагмент в конце text_fr[3]/начале [4] | исправлено |
| p2-247 | text_ru[1] | смысл | мелочь | melancolie ... aduste (лат. adusta, «выжженная, пережжённая») | меланхолия, которую врачи называют жгучей | «выжженная/сожжённая (adusta)»; EN «adust» оставить или «burnt» | исправлено |
| p2-248 | attrs[4].what_en | RU≠EN | мелочь | clairon (text_en[0]: trumpet; RU: рожок) | Lyre and horn | Унифицировать: clairon = trumpet/bugle в EN (attrs и текст) | исправлено |
| p2-250 | attrs[3].what | атрибут | мелочь | livre de musique posé sur vne enclume; marteaux dans les bassins des balances | Наковальня и молоты на весах (what_frtrans: enclume et marteaux sur une balance) | «Книга нот на наковальне; на чашах весов — молоты» | исправлено |
| p2-250 | text_en[7] | RU≠EN | мелочь | Eunomius (RU Евномий; attrs_en Eunomius) | Eunomus | Привести к «Eunomius» во всех полях EN | исправлено |
| p2-250 | text_fr[4] | транскрипция | мелочь | certe mysterieuse figure | certe (вместо «cette») | Исправить на «cette» | исправлено |
| p2-251 | text_en[5] | смысл | мелочь | vne boussole (RU: буссоль) | compass (при compass = циркуль в других статьях) | «a magnetic compass»/«a mariner's compass», как в Hydrography | исправлено |
| p2-251 | text_ru[4] | RU≠EN | мелочь | l'Architecture de mesme est le plus illustre de tous les travaux militaires | Фортификация равным образом — славнейшее... (EN: Architecture) | Заменить «Фортификация» на «Архитектура», как в оригинале | исправлено |
| p2-256 | text_fr[2] | транскрипция | мелочь | Petraque | Petraque | Petrarque (RU/EN Петрарка/Petrarch верны) | ложное: скан: в оригинале напечатано «Petraque»; транскрипция верна, RU/EN уже верны |
| p2-261 | text_ru[1] | прочее | мелочь | vne gruë en l'air, tenant vn caillou | летящая в воздухе журавль, держащая | «летящий в воздухе журавль, держащий» (согласование рода) | исправлено |
| p2-262 | text_en[0] | цитата/стих | мелочь | PAR ET IMPAR (RU: «ЧЁТ И НЕЧЁТ») | PAR ET IMPAR без перевода | Добавить (“even and odd”) | исправлено |

## Результат исправлений

Замечаний всего 199: **исправлено 169**, **ложных 22**, **оставлено (стилистика) 8**.

По серьёзности:

| серьёзность | исправлено | ложных | оставлено |
|---|---|---|---|
| критично | 4 | 0 | 0 |
| заметно | 43 | 5 | 0 |
| мелочь | 122 | 17 | 8 |

По типам:

| тип | исправлено | ложных | оставлено |
|---|---|---|---|
| смысл | 56 | 0 | 2 |
| RU≠EN | 27 | 1 | 1 |
| транскрипция | 7 | 17 | 2 |
| имя | 22 | 0 | 0 |
| добавление | 18 | 3 | 0 |
| атрибут | 17 | 1 | 0 |
| цитата/стих | 9 | 0 | 1 |
| прочее | 9 | 0 | 1 |
| пропуск | 4 | 0 | 1 |

Правки внесены в `books/iconologie/entries.json` (затронуто статей: 116); «bleu turquin» (тёмно-синий, не бирюзовый) встречается во французском тексте ровно в 8 статьях: p2-13, 14, 15, 16, 33, 34, 35, 36; во всех RU и EN (текст и attrs) исправлено, «бирюз…»/«turquoise» в книге не осталось. Каждое замечание перед правкой перепроверялось по `text_fr`, транскрипция и сомнительные места — по скану страницы.

## Оставленные стилистические мелочи

| id | поле | что в оригинале | что у нас | предложение ревьюера |
|---|---|---|---|---|
| p1-12 | attrs | зелёное платье = надежда славы или выгоды (text_fr[2]) | нет записи о зелёном платье | добавить attrs: зелёное платье означает надежду на славу или выгоду |
| p1-26 | attrs[0].meaning | la foudre ... vn épervier ... vn dauphin (молния, воздух, вода) | в небе, в воздухе и в воде | молния, воздух (ястреб) и вода (дельфин): «в небе» и «в воздухе» дублируют друг друга |
| p1-139 | text_ru[3] | Par ses bras nuds se doivent entendre les actions | Под её обнажёнными руками должно разуметь деяния | Обнажёнными руками означены деяния (а не «под руками») |
| p2-16 | text_fr[0]/[6] | [0] tient de la gauche des pavots; [6] pavots qu'il tient de la main droite | RU/EN повторяют противоречие; attrs: маки в левой | Оригинал противоречив; пометить, attrs следует [0] |
| p2-96 | text_fr[1] | trois sceptres (fr[1]) vs quatre sceptres (fr[6]) | три скипетра / three scepters (text, attrs.what) vs четыре (fr[6]) | Расхождение в самом оригинале (trois/quatre); сверить со сканом, при ошибке OCR исправить; перевод следует оригиналу |
| p2-97 | text_fr[3] | Κιρκνος (греч. название птицы) | Κιρκνος | Вероятно ошибка OCR греческого слова (ожидается Κίγκλος, лат. cinclus); сверить со сканом |
| p2-167 | text_en[1] | conformément à ces paroles de David, Asperges me Domine hysopo | Asperges me Domine hysopo, &c. (без перевода, в RU переведено) | добавить перевод: Thou shalt sprinkle me, O Lord, with hyssop |
| p2-189 | text_ru[0] | trois divers écriteaux | три различных свитка (EN: placards) | «три различные таблички/записки» (écriteaux — не свитки); так же attrs[2] |
