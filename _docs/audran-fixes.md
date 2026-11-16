# Одран: сверка текста и переводов со сканами (этап 1)

Источник сканов: ~/Projects/photos/audran/ (0001–0077; https://archive.org/details/gri_proportionsd00audr). Таблицы идут через кадр: таблица N = кадр 00(11+2N) (aud1 = 0013 … aud30 = 0071; у aud21–aud30 листы повёрнуты на 90°). Проверялись все 30 записей: text_fr (совпадает с caption — это главная гравированная подпись таблицы), fr-названия, num/page, группы, переводы RU/EN; замечания Грока (ветка grok-review, _review/grok/audran/) — все перепроверены по доскам.

## Итог
- Подтверждено и исправлено: 13 (в 38 патчах к entries.json: text_fr, caption, text_ru, text_en, названия, группы).
- Ложных замечаний: 8. Оставлено: 17 (ярлыки чертежа, орфография и т. п.).
- Надписи внутри чертежа (шкалы «Echelle de 2 pieds», «Hauteur de la veüe de celuy qui dessigne», «Mesure de la Jambe marquée A», примечание о ножке циркуля на aud15, «Épaisseur de la Cuisse…» на aud18, «La perspective empesche…» на aud20, выходные строки «Avec privilege du Roy» и «Ce vend a Paris chez Audran…») остаются на гравюре и в данные не добавлялись.
- Орфография XVII в. (testes/têtes, minuttes, u/v, «Ludovise»/«Ludouise») не приводилась к единому виду: это не ошибки чтения.

## Исправления
- **aud1:** добавлено «de concert» (travaillé de concert par trois célèbres sculpteurs), «celles de ses deux fils», ссылка по печати «le sujet est en Virg. 2e de l'Énéide V. 201», приписка «Pl. Liv. 36 Ch. 5.» (в печати «Liu.»); RU/EN: «обработанного сообща / worked in concert», «не колеблясь» вместо «без труда», добавлена ссылка на Плиния (кн. 36, гл. 5).
- **aud6:** RU «с боку» → «сбоку».
- **aud10:** «surbaissée» → «surbaissé»; группа была ошибочной («Антиной»): на доске два египетских терма (фас и профиль), Антиноя нет → группа «Египетский герм» (ru/fr/en). Название верно.
- **aud11:** на доске Антиной (три вида), заголовки уже «Антиной» (правка Грока из первого раунда применена ранее); вертикальная легенда «La Statue d'Antinous Surnommée l'admirable ce conserue a Rome au Jardin du Vatican» — ярлык, в данные не добавлена.
- **aud15:** «sur les deux pieds» → «sur ses deux pieds» (+ RU/EN).
- **aud17:** «flesches» → «fleches», «Vatican» → «Vaticant» (как напечатано).
- **aud19:** «a de hauteur» → «à de hauteur».
- **aud21:** подпись совпадает; в RU/EN добавлено пояснение к «le Lantin» (вероятно l'Antin, то есть Антиной, не доказано).
- **aud25:** на доске вторая строка «a 7 têtes de hauteur.» — добавлена в text_fr/caption/RU/EN.
- **aud26:** замечание Грока про заголовок — ложное: заголовки («Enfant à la cruche», «Ребёнок с кувшином», «Child with a jug») уже верны; рост — 5 голов по печати; какая это статуя, по доске установить нельзя.
- **aud29:** «R. Vrbm. in.» → «R. Vrbin. in.», «sculp. Cum priuil.» (+ RU/EN).
- **aud30:** связной подписи на доске нет — только атрибуции «R.V. In. — G. Au. s. C.P.R.» и номер 30. Они внесены в text_fr/caption как у aud29, RU/EN-перевод заменён (прежнее «завершающая книгу» было придумано). Название теперь по сюжету: «Deux têtes tenues par les cheveux» / «Две головы, схваченные за волосы» / «Two heads held by the hair» (две бородатые головы с закрытыми глазами, схваченные рукой за волосы).
- **aud2–5, 8, 9, 12–14, 16, 18, 20, 22–24, 27, 28:** подписи, числа обмеров, переводы совпадают с досками (aud13: «l'Echelle du l'Antin», «diferences» раскрыты и модернизированы — оставлено).
- **num/page** всех 30 записей совпадают с печатным номером таблицы на листе.
- **aud28:** группа «Венера Медичи» на доске не названа (там «Venus antique») — оставлено.

## Не входит в данные
Предисловие и «Avertissement» (кадры 0007–0011) в данных Одрана отсутствуют — это не таблицы; транскрипция и перевод не делались (нужно решение).

## Таблица замечаний (Грок + собственные)

| id | запись | статус | что на доске |
|---|---|---|---|
| aud1-1 | aud1 | подтверждено | кадр 0013: «travaillé de concert par trois celebres Sculpteurs»; пропуск «de concert» исправлен в FR/RU/EN. Также «celles de ses deux fils» (в данных «celle») и «le suiet est en Virg. 2e de l'Eneide V. 201» (в данных пересказ «sujet tiré du second livre…») — п |
| aud1-2 | aud1 | подтверждено | кадр 0013: под текстом справа «Pl. Liu. 36 Ch. 5.» — добавлено «Pl. Liv. 36 Ch. 5.» в text_fr/caption, в RU «Плиний, кн. 36, гл. 5.», в EN «Pliny, book 36, ch. 5.». Внизу листа типографская строка «Ce vend a Paris chez Audran… Avec privilege du Roy» и номер 1  |
| aud1-3 | aud1 | подтверждено | «ne faire point de difficulté» = не колеблясь; RU исправлен («не колеблясь»). EN «no difficulty» допустимо, оставлено. |
| aud6-1 | aud6 | подтверждено | кадр 0023: подпись «Le même Hercule veu de côté a 7 têtes 3 parties 7 minutes de hauteur» совпадает; в RU «с боку» → «сбоку». |
| aud7-1 | aud7 | ложное | кадр 0025: ярлык чертежа «Hauteur de la veüe de celuy qui dessigne» — ярлык, не добавлять. Подпись сверху «Le mesme Hercule fait par Glicon à de hauteur 7 testes 3 parties 7 minuttes» совпадает с данными. |
| aud7-2 | aud7 | ложное | ярлык чертежа «Mesure de la Jambe marquée A» — ярлык, не добавлять. |
| aud7-3 | aud7 | ложное | ярлык чертежа «Echelle mise en perspective» — ярлык, не добавлять. |
| aud10-1 | aud10 | подтверждено | кадр 0031: на доске «…le haut de la tête est Surbaissé.» (м. р., без второго e) — исправлено «surbaissée»→«surbaissé»; RU/EN верны. Числа 7 têtes 1 partie 7 minutes, «4 mesures de nez», «2 tétins» сверены. Номер на доске 10. |
| aud10-2 | aud10 | подтверждено | на доске два египетских терма (фас и профиль, клафт), Антиноя нет; group* были ошибочно «Антиной» — заменены на «Terme égyptien / Египетский герм / Egyptian herm» (заголовки fr/ru/en верны). |
| aud2-0 | aud2 | оставлено | кадр 0015: «Laocoon a de hauteur 7 testes 2 parties 3 minutes.» — совпадает, ок. |
| aud3-0 | aud3 | оставлено | кадр 0017: совпадает, ок. |
| aud4-0 | aud4 | оставлено | кадр 0019: «Laocoon a de haulteur 7 testes 2 parties 3 minutes.» совпадает, ок. |
| aud5-0 | aud5 | оставлено | кадр 0021: подпись совпадает («suposant», «minuttes», «Glicon grec»), RU/EN верны; ярлыки замеров — не добавлять. |
| aud8-0 | aud8 | оставлено | кадр 0027: «Pyrasme au jardin Ludouise a Rome, a de hauteur 7 têtes 2 parties .» совпадает (u/v не нормализуем), ок. |
| aud9-0 | aud9 | оставлено | кадр 0029: «Le mesme 7 testes 2 parties de hauteur.» совпадает, ок. |
| aud11-1 | aud11 | подтверждено | Кадр 0033, лист 11: три вида кудрявого юноши с плащом (Антиной), не герм. В данных заголовки уже «Антиноус/Антиной» — правка Грока уже применена, дополнительных патчей нет. |
| aud11-2 | aud11 | оставлено | Вертикальная подпись слева читается целиком: «La Statue d'Antinous Surnommée l'admirable ce conserue a Rome au Jardin du Vatican» (ce conserue = se conserve). Ярлык-легенда статуи, не добавлять (по брифу); при желании можно ввести как вторую подпись. Основная  |
| aud12 | aud12 | оставлено | Кадр 0035: «Le mesme Antinous à 7 testes 2 parties», №12 — верно. |
| aud13-1 | aud13 | ложное | Кадр 0037: «Echelle de 2 pieds» — ярлык, не добавлять. Основная подпись верна (на доске «l'Echelle du l'Antin», «diferences» — данные раскрыты/модернизированы, смысл верен), №13. |
| aud14 | aud14 | оставлено | Кадр 0039: «La Bergere Grecque a de hauteur 7 testes 3 parties 6 minutes.», №14 — верно. |
| aud15-1 | aud15 | ложное | Кадр 0041: примечание «Si la Pointe du Compas eut esté placée dans la Cavité des reins ou des fesses Ces mesures seroient venuës plus petites Elles sont marquées de deux etoiles» есть, но это ярлык чертежа — не добавлять. Ошибка чтения в основной подписи: на д |
| aud16 | aud16 | оставлено | Кадр 0043: подпись совпадает («sur ses deux pieds»), №16. |
| aud17-1 | aud17 | подтверждено | Кадр 0045: на доске «fleches» (исправлено) и «Jardin du Vaticant» (исправлено «Vatican»→«Vaticant»). Переводы верны. |
| aud18-1 | aud18 | ложное | Кадр 0047: «Épaisseur de la Cuisse droite veüe en racourcy par le Genoüil» — подпись к врезке-схеме (круг ABC), ярлык, не добавлять. Основная подпись верна, №18. |
| aud19 | aud19 | подтверждено | Кадр 0049: на доске «à de hauteur» (в данных «a») — мелкая правка акцента. №19. |
| aud20-1 | aud20 | ложное | Кадр 0051: «La perspective empesche que l'on ne voye le haut de la Figure aussi grand qu'il est» — ярлык, не добавлять. Основная подпись верна, №20. |
| aud21-1 | aud21 | подтверждено | кадр 0053: подпись «Ce fragment de l'antique, à de hauteur 7 têtes 2 parties. On croit que c'est du même qui à fait le Lantin.» Text_fr верен; «le Lantin» = вероятно l'Antin(oüs) (7 голов 2 части как у Антиноя aud12). Само чтение не менял; в RU/EN добавлено по |
| aud21-text | aud21 | оставлено | text_fr/caption совпадают с доской, числа верны |
| aud22-ok | aud22 | оставлено | кадр 0055: «La même 8 têtes de hauteur» — совпадает |
| aud23-ok | aud23 | оставлено | кадр 0057: «Mirmille mourant à de hauteur 8 têtes, sa Statue est à Rome au jardin Ludouise.» На доске «Ludouise» (u вместо v) — данные дают «Ludovise»; орфографию не трогаю |
| aud24-ok | aud24 | оставлено | кадр 0059: «Le grand enfant du Laocoon a de hauteur 7 têtes 2 parties» — совпадает |
| aud25-1 | aud25 | подтверждено | кадр 0061: «l'Un des ensans(enfans) de Laocoon marqué B. a 7 têtes de hauteur.» Вторая строка пропущена в данных — добавлена в text_fr, caption, RU, EN |
| aud26-1 | aud26 | ложное | кадр 0063: на доске ребёнок (путто) с кувшином, из которого льётся вода, два вида; подпись «Il a 5 testes de hauteur.» Заголовки в данных уже «Enfant à la cruche / Ребёнок с кувшином / Child with a jug» — правок не нужно (статуя не названа; «testes» в оригинал |
| aud27-1 | aud27 | оставлено | кадр 0065: нижняя строка «Livre pour aprendre à désigner avec les proportions des parties qui ont esté choisie dans les ouvrages de N. Poussin, et gravé par J. Pesne» + выходная «A Paris chez Audran…» — выходные/служебные строки гравюры, не подпись таблицы; яр |
| aud27-2 | aud27 | оставлено | «Eschelle de 12 minuttes» — ярлык шкалы у правого края, не добавлять |
| aud28-1 | aud28 | оставлено | кадр 0067: «Echelle de 12 minutes» — ярлык шкалы, не добавлять; подпись «Les parties du visage d'vne Venus antique mesurées de leurs mesmes grandeurs.» совпадает. Группа «Венера Медичи» на доске не названа (только «Venus antique») — см. notes |
| aud29-1 | aud29 | подтверждено | кадр 0069: слева «R. Vrbin. in.» (не Vrbm), справа «G. Au. Sculp. Cum priuil.» — исправлено чтение; на доске обе головы: бородач с трезубцеобразным венцом и воин в шлеме |
| aud30-1 | aud30 | подтверждено | кадр 0071: связной подписи нет; есть только мелкие гравированные атрибуции «R.V. In.» (слева) и «G. Au. s. C.P.R.» (справа) и номер 30. Изображены две головы бородачей с закрытыми глазами, схваченные рукой за волосы. Занесены атрибуции в text_fr/caption как на |

## Доводка (этап 3)
- **Обрезка таблиц.** Все 30 таблиц обрезаны по краю гравированного поля (вместе с подписями гравюры и номером таблицы) с полем бумаги 2,5%: фон сканера и кромка книги в кадр не попадают; листы aud21–aud30 повёрнуты по часовой, чтобы таблица читалась прямо; наклон выравнивается (оценка по строкам, у большинства листов он <1°). Скрипт `tools/build_audran_plates.py` (`--detect` — первичная разметка, без флагов — сборка `img/audN.webp` (1600 px), `img/audN_full.webp` (2400 px) и `thumb/audN_t.webp`). Рамки лежат в `books/audran/_crops/crops.json` (проценты исходного кадра, наклон — в `angles.json`); `python3 tools/crop-editor/server.py audran` открывает их в редакторе (в списке все 77 кадров, 30 таблиц с рамками), после правки рамок — `python3 tools/build_audran_plates.py`.
- **Предисловие.** Кадры 0007–0010 («PREFACE.») и 0011 («AVERTISSEMENTS.», «EXTRAIT DU PRIVILEGE DU ROY.»): транскрипция по печати (орфография как напечатана, опечатки не исправлялись; кустод «ont» на 0008, сигнатура «B» на 0009; печатных номеров страниц нет, страницы подписаны I–V), перевод RU/EN. Заголовок на 0011 напечатан во множественном числе — «Предуведомления» / «Notices» / «Avertissements». Данные: `books/audran/preface.json` (блоки, страницы), `pages_it.json` (транскрипция страниц), `scans/` (листы по краю бумаги, миниатюры, `sizes.json`; сборка `build_audran_plates.py --scans`). Кадры 0006 и 0012 — обороты листа с просвечивающей печатью, текста нет.
- Остальное: строка группы над заголовком скрывается, если совпадает с названием; описание на обложке — без повтора автора и тире.
