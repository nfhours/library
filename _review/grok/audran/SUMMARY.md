# Audran — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/audran/`. Проверены все 29 записей audran с оригиналом и переводом (aud1…aud29). Запись aud30 не проверялась: у неё нет оригинала (`text_fr` и `caption` пусты), хотя `text_ru`/`text_en` есть. Тексты не исправлялись; ниже только сводка замечаний, подробности — в `<id>.json`, `notes.csv`, `labels.csv`.

**Структура книги.** 30 досок, одна запись на доску (`img/audN.jpg` — целая доска со всеми надписями), частей и особых типов записей нет. Оригинал — французский, поле `text_fr` (всегда один абзац); поле `caption` содержит тот же текст — это главная гравированная подпись доски (обычно сверху). Заголовки `fr`/`name_fr` — короткие названия, `group*` — название статуи. Переводы: русский (`text_ru`, `ru`, `group`) и английский (`text_en`, `en`, `group_en`); французского перевода текста нет (`group_frtrans` повторяет название группы). Поля `attrs` нет. Все подписи сверены по доскам.

## Итог

| Вердикт | Записей |
|---|---|
| ok | 14 |
| minor | 13 |
| major | 2 |
| **всего** | **29** |

| Показатель | Значение |
|---|---|
| Уникальных ошибок (issue_id) | 21 |
| Вхождений по полям (сумма длин `fields`) | 61 |
| из них подписей (caption_source) | 11 |

Вхождения по полям: caption_orig — 11, caption_ru — 11, caption_en — 11, text_ru — 6, text_fr — 5, caption — 5, text_en — 4, fr — 2, name_fr — 2, ru — 2, en — 2. Поле `caption` указано вместе с `text_fr`, потому что это один и тот же текст.

По типу: omission — 14, name — 3, ocr — 2, mistranslation — 1, typo — 1. Уверенность: low — 3, medium — 3, high — 15.

По пакетам (`progress.csv`): пакет 1 aud1…aud20 — 11 ok / 8 minor / 1 major; пакет 2 aud21…aud29 — 3 ok / 5 minor / 1 major; итоговая строка `audran,29,14,13,2`.

## Major

Обе записи major — по решению пользователя: заголовок указывает не ту статую, текст подписи при этом верен.

- `aud11-1` — fr/name_fr/ru/en — name, high: «Elle a de hauteur 7 têtes 2 parties.» → на доске aud11 не египетский герм, а Антиной (кудрявый юноша с плащом, три вида; ср. aud12 «Le mesme Antinous»), и вертикальная подпись слева: «La Statue d'Antinous surnommée l'admi[rable …] a Rome au Jardin du Vatican». «Elle» в тексте = «La Statue». Заголовки: fr/name_fr «Antinoüs», ru «Антиной», en «Antinous»
- `aud26-1` — fr/name_fr/ru/en — name, medium: «Il a 5 têtes de hauteur.» → на доске aud26 не сын Лаокоона, а маленький ребёнок (путто) с кувшином, из которого льётся вода, в двух видах; рост 5 голов — пропорции младенца, у сыновей Лаокоона 7 голов (aud24, aud25). Какая это статуя, по доске не установить — не достраивать. Заголовки: fr/name_fr «Enfant à l'urne» или просто «Enfant», ru «Ребёнок с кувшином», en «Child with an urn»

## Ошибки по записям

Каждый issue_id один раз, в порядке записей.

### aud1 — minor («Laocoon»)

- `aud1-1` — text_fr/caption/text_ru/text_en — omission, high: «Le tout est d'un seul bloc de marbre, travaillé par trois célèbres sculpteurs» → на гравюре «travaillé de concert par trois celebres Sculpteurs» — пропущено «de concert» (сообща). text_fr/caption: «travaillé de concert par trois célèbres sculpteurs»; RU «обработанного сообща тремя знаменитыми скульпторами»; EN «worked in concert by three celebrated sculptors». Сверено по aud1.jpg
- `aud1-2` — text_fr/caption/text_ru/text_en — omission, high: «Agésandre, Polydore et Athénodore.» → на гравюре после имён скульпторов, справа отдельной строкой: «Pl. Liu. 36 Ch. 5.» (Плиний, «Естественная история», кн. 36, гл. 5). Добавить в конец text_fr/caption «Pl. Liv. 36 Ch. 5.»; RU «(Плиний, кн. 36, гл. 5)»; EN «(Pliny, book 36, ch. 5)». Сверено по aud1.jpg
- `aud1-3` — text_ru — mistranslation, low: «plusieurs n'ont point fait de difficulté de luy donner le premier rang» → ne pas faire difficulté de — «не колебаться, не стесняться», а не «без труда»: «многие не колеблясь отдавали ей первое место»

### aud6 — minor («Hercule Farnèse (de côté)»)

- `aud6-1` — text_ru — typo, high: «Le même Hercule veu de côté» → «сбоку» пишется слитно: «Тот же Геркулес, если смотреть сбоку,»

### aud7 — minor («Hercule Farnèse (par Glicon)»)

- `aud7-1` — caption_orig/caption_ru/caption_en — omission, high: «Hauteur de la veüe / de celuy qui dessigne» → вынести в отдельные поля (сейчас: гравированный ярлык чертежа в две части по сторонам фигуры на уровне плеч — слева «Hauteur de la veüe», справа «de celuy qui dessigne», у горизонтали высоты глаза). caption_orig: «Hauteur de la veüe de celuy qui dessigne»; caption_ru: «Высота глаза рисующего»; caption_en: «Eye level of the draughtsman». Сверено по aud7.jpg
- `aud7-2` — caption_orig/caption_ru/caption_en — omission, high: «Mesure de la Jambe marquée A» → вынести в отдельные поля (сейчас: гравированный ярлык вертикально слева внизу, над шкалой с мерками 7 p. 11 m и 4 p. 7 m ½). caption_orig: «Mesure de la Jambe marquée A»; caption_ru: «Мера ноги, отмеченной A»; caption_en: «Measurement of the leg marked A». Сверено по aud7.jpg
- `aud7-3` — caption_orig/caption_ru/caption_en — omission, high: «Echelle mise en perspective» → вынести в отдельные поля (сейчас: гравированный ярлык вертикально слева внизу, под шкалой). caption_orig: «Echelle mise en perspective»; caption_ru: «Шкала, построенная в перспективе»; caption_en: «Scale set in perspective». Сверено по aud7.jpg

### aud11 — major («Terme égyptien (vue 2)»)

- `aud11-1` — fr/name_fr/ru/en — name, high: «Elle a de hauteur 7 têtes 2 parties.» → на доске aud11 не египетский герм, а Антиной (кудрявый юноша с плащом, три вида; ср. aud12 «Le mesme Antinous»), и вертикальная подпись слева: «La Statue d'Antinous surnommée l'admi[rable …] a Rome au Jardin du Vatican». «Elle» в тексте = «La Statue». Заголовки: fr/name_fr «Antinoüs», ru «Антиной», en «Antinous»
- `aud11-2` — caption_orig/caption_ru/caption_en — omission, medium: «La Statue d'Antinous surnommée l'admi[…] / a Rome au Jardin du Vatican (вертикально у левого края доски aud11. …» → вынести в отдельные поля (сейчас: вторая подпись гравюры, вертикально вдоль левого края, слева от фигуры; в text_fr/caption отсутствует). caption_orig: «La Statue d'Antinous surnommée l'admi[…] a Rome au Jardin du Vatican» — конец первой строки стёрт, читаемо только «l'admi», дальше «[…]»; проверить по фото, не достраивать; caption_ru: «Статуя Антиноя, прозванная […], в Риме, в саду Ватикана»; caption_en: «The statue of Antinous called […], in Rome, in the Vatican Garden». Сверено по aud11.jpg; …

### aud13 — minor («La Paix des Grecs»)

- `aud13-1` — caption_orig/caption_ru/caption_en — omission, high: «Echelle de 2 pieds» → вынести в отдельные поля (сейчас: гравированный ярлык вертикально у шкалы справа, в нижней половине доски). caption_orig: «Echelle de 2 pieds»; caption_ru: «Шкала в 2 фута»; caption_en: «Scale of 2 feet». Сверено по aud13.jpg

### aud15 — minor («Vénus de Médicis»)

- `aud15-1` — caption_orig/caption_ru/caption_en — omission, high: «Si la Pointe du Compas eut esté placée dans la Cavité des reins ou des fesses Ces mesure[s] seroient venues pl …» → вынести в отдельные поля (сейчас: гравированное примечание вертикально у левого края, между двумя звёздочками у бедра левой фигуры; в text_fr/caption отсутствует). caption_orig: «Si la Pointe du Compas eut esté placée dans la Cavité des reins ou des fesses, ces mesures seroient venues plus petites. Elles sont marquées de deux etoiles.»; caption_ru: «Если бы ножку циркуля поставили в углубление поясницы или ягодиц, эти мерки вышли бы меньше. Они отмечены двумя звёздочками»; caption_en: «Had the p …

### aud17 — minor («Apollon Pythien»)

- `aud17-1` — text_fr/caption — ocr, low: «Apollon pythien decochant ses flesches» → на гравюре «ses fleches» (без s); в остальном старая орфография в text_fr сохранена. Переводы верны. Сверено по aud17.jpg

### aud18 — minor («Apollon Pythien (vue 2)»)

- `aud18-1` — caption_orig/caption_ru/caption_en — omission, high: «Épaisseur de la Cuisse droite veüe en racourcy par le Genoüil» → вынести в отдельные поля (сейчас: гравированная подпись под круговой схемой — разрез бедра с точками A, B, C и мерками 3 p. 4 m, 3 p. 3 m — справа от фигуры, ниже середины доски). caption_orig: «Épaisseur de la Cuisse droite veüe en racourcy par le Genoüil»; caption_ru: «Толщина правого бедра, видимая в ракурсе со стороны колена»; caption_en: «Thickness of the right thigh seen foreshortened from the knee». Сверено по aud18.jpg

### aud20 — minor («Apollon Pythien (perspective)»)

- `aud20-1` — caption_orig/caption_ru/caption_en — omission, high: «La perspective empesche que lon ne voye le haut de la Figure aussi grand quil est» → вынести в отдельные поля (сейчас: гравированное примечание наклонно слева от головы, под основной подписью; в text_fr/caption отсутствует). caption_orig: «La perspective empesche que l'on ne voye le haut de la Figure aussi grand qu'il est»; caption_ru: «Перспектива не позволяет видеть верх фигуры таким большим, каков он есть»; caption_en: «The perspective prevents the top of the figure from being seen as large as it is». Сверено по aud20.jpg

### aud21 — minor («Fragment de l'antique»)

- `aud21-1` — text_ru/text_en — name, medium: «On croit que c'est du même qui a fait le Lantin.» → «le Lantin» = l'Antin(ous), Антиной (так называли статую в XVII в.; ср. aud13 «l'Echelle de l'Antin», в text_fr раскрыто «l'Antinoüs»). RU «Полагают, что он выполнен тем же мастером, что и Антиной»; EN «It is believed to be by the same sculptor who made the Antinous»

### aud25 — minor («Enfant de Laocoon, marqué B»)

- `aud25-1` — text_fr/caption/text_ru/text_en — omission, high: «L'un des enfans de Laocoon, marqué B.» → на гравюре вторая строка подписи: «a 7 têtes de hauteur.» Добавить: text_fr/caption «L'un des enfans de Laocoon, marqué B, a 7 têtes de hauteur.»; RU «Один из сыновей Лаокоона, обозначенный буквой B, имеет высоту 7 голов»; EN «One of the children of Laocoon, marked B, is 7 heads in height». Сверено по aud25.jpg

### aud26 — major («Enfant de Laocoon (suite)»)

- `aud26-1` — fr/name_fr/ru/en — name, medium: «Il a 5 têtes de hauteur.» → на доске aud26 не сын Лаокоона, а маленький ребёнок (путто) с кувшином, из которого льётся вода, в двух видах; рост 5 голов — пропорции младенца, у сыновей Лаокоона 7 голов (aud24, aud25). Какая это статуя, по доске не установить — не достраивать. Заголовки: fr/name_fr «Enfant à l'urne» или просто «Enfant», ru «Ребёнок с кувшином», en «Child with an urn»

### aud27 — minor («Visage d'Apollon»)

- `aud27-1` — caption_orig/caption_ru/caption_en — omission, high: «Livre pour aprendre à désigner avec les proportions des parties qui ont esté choisie dans les ouvrages de N. P …» → вынести в отдельные поля (сейчас: две гравированные строки внизу слева, под рисунками глаз; ниже — выходная строка «A Paris chez Audran…», она в notes). caption_orig: «Livre pour aprendre à désigner avec les proportions des parties qui ont esté choisie dans les ouvrages de N. Poussin, et gravé par J. Pesne.»; caption_ru: «Книга для обучения рисованию с пропорциями частей, выбранных из произведений Н. Пуссена; гравировал Ж. Пен»; caption_en: «A book for learning to draw, with the proportions of t …
- `aud27-2` — caption_orig/caption_ru/caption_en — omission, high: «Eschelle de 12 minuttes» → вынести в отдельные поля (сейчас: гравированный ярлык вертикально у правого края, под шкалой). caption_orig: «Eschelle de 12 minuttes»; caption_ru: «Шкала в 12 минут»; caption_en: «Scale of 12 minutes». Сверено по aud27.jpg

### aud28 — minor («Visage de Vénus»)

- `aud28-1` — caption_orig/caption_ru/caption_en — omission, high: «Echelle de 12 minutes» → вынести в отдельные поля (сейчас: гравированный ярлык внизу посередине, под горизонтальной шкалой). caption_orig: «Echelle de 12 minutes»; caption_ru: «Шкала в 12 минут»; caption_en: «Scale of 12 minutes». Сверено по aud28.jpg

### aud29 — minor («Têtes (fronton)»)

- `aud29-1` — text_fr/caption — ocr, low: «R. Vrbm. in.» → на гравюре внизу слева, мелко: вероятно «R. Vrbin. in.» (= Raphael Urbinas invenit; переводы так и толкуют); «Vrbm» — похоже на слитые минимы. Не уверен — проверить по фото

По типам: omission — `aud1-1`, `aud1-2`, `aud7-1`, `aud7-2`, `aud7-3`, `aud11-2`, `aud13-1`, `aud15-1`, `aud18-1`, `aud20-1`, `aud25-1`, `aud27-1`, `aud27-2`, `aud28-1`; name — `aud11-1`, `aud21-1`, `aud26-1`; ocr — `aud17-1`, `aud29-1`; mistranslation — `aud1-3`; typo — `aud6-1`.

## Проблемы разбивки текста

Текст каждой доски — одна подпись в один абзац; обрывов на стыке страниц нет. Неполная передача гравированной подписи в `text_fr`/`caption` (переводы повторяют пропуск):

- `aud1-1` — text_fr/caption/text_ru/text_en — omission, high: «Le tout est d'un seul bloc de marbre, travaillé par trois célèbres sculpteurs» → на гравюре «travaillé de concert par trois celebres Sculpteurs» — пропущено «de concert» (сообща). text_fr/caption: «travaillé de concert par trois célèbres sculpteurs»; RU «обработанного сообща тремя знаменитыми скульпторами»; EN «worked in concert by three c …
- `aud1-2` — text_fr/caption/text_ru/text_en — omission, high: «Agésandre, Polydore et Athénodore.» → на гравюре после имён скульпторов, справа отдельной строкой: «Pl. Liu. 36 Ch. 5.» (Плиний, «Естественная история», кн. 36, гл. 5). Добавить в конец text_fr/caption «Pl. Liv. 36 Ch. 5.»; RU «(Плиний, кн. 36, гл. 5)»; EN «(Pliny, book 36, ch. 5)». Сверено по aud …
- `aud25-1` — text_fr/caption/text_ru/text_en — omission, high: «L'un des enfans de Laocoon, marqué B.» → на гравюре вторая строка подписи: «a 7 têtes de hauteur.» Добавить: text_fr/caption «L'un des enfans de Laocoon, marqué B, a 7 têtes de hauteur.»; RU «Один из сыновей Лаокоона, обозначенный буквой B, имеет высоту 7 голов»; EN «One of the children of Laocoon, m …

Без issue_id: орфография в `text_fr` нормализована непоследовательно (testes → têtes везде, dessignateurs → dessinateurs, имена скульпторов модернизированы, а haulteur, minuttes, mesme, suposant, egallement оставлены); в aud13 сокращение гравюры «l'Antin» раскрыто как «l'Antinoüs». См. `notes.csv`.

## Подписи к гравюрам

Всего 11. caption_source: engraving — 11. Основная подпись каждой доски уже есть в данных (`text_fr` = `caption`, переводы — `text_ru`/`text_en`, позиция — весь текст). Ниже — гравированные надписи, которых в данных нет: вторая подпись, примечания и ярлыки чертежа (ярлыки по решению пользователя тоже вынесены как подписи; бывший список — `labels.csv`, статус «converted»). Предлагаются поля caption_orig / caption_ru / caption_en (французского перевода текста в книге нет, поэтому caption_fr не нужен); ничего не удалять. «Текущий текст в переводе» — во всех случаях подписи в переводе нет, поэтому позиция в тексте перевода — «нет в тексте»; в таблице указано место на доске. Выходные строки (Avec privilege du Roy, адрес Audran) — не подписи, только `notes.csv`.

| id | issue_id | Текущий текст в переводе | Место на доске | caption_source | caption_orig | caption_ru | caption_en |
|---|---|---|---|---|---|---|---|
| aud7 | `aud7-1` | нет (текст перевода: «Тот же Геркулес, выполненный Гликоном, имеет высоту 7 голов 3 части 7 …») | гравированный ярлык чертежа в две части по сторонам фигуры на уровне плеч — слева «Hauteur de la veüe», справа «de celuy qui dessigne», у горизонтали высоты глаза | engraving | Hauteur de la veüe de celuy qui dessigne | Высота глаза рисующего | Eye level of the draughtsman |
| aud7 | `aud7-2` | нет (текст перевода: «Тот же Геркулес, выполненный Гликоном, имеет высоту 7 голов 3 части 7 …») | гравированный ярлык вертикально слева внизу, над шкалой с мерками 7 p. 11 m и 4 p. 7 m ½ | engraving | Mesure de la Jambe marquée A | Мера ноги, отмеченной A | Measurement of the leg marked A |
| aud7 | `aud7-3` | нет (текст перевода: «Тот же Геркулес, выполненный Гликоном, имеет высоту 7 голов 3 части 7 …») | гравированный ярлык вертикально слева внизу, под шкалой | engraving | Echelle mise en perspective | Шкала, построенная в перспективе | Scale set in perspective |
| aud11 | `aud11-2` | нет (текст перевода: «Она имеет высоту 7 голов 2 части.») | вторая подпись гравюры, вертикально вдоль левого края, слева от фигуры; в text_fr/caption отсутствует | engraving | La Statue d'Antinous surnommée l'admi[…] a Rome au Jardin du Vatican | Статуя Антиноя, прозванная […], в Риме, в саду Ватикана | The statue of Antinous called […], in Rome, in the Vatican Garden |
| aud13 | `aud13-1` | нет (текст перевода: «Мир греков. Имеет высоту 7 голов 2 части, при условии, что фигура прям …») | гравированный ярлык вертикально у шкалы справа, в нижней половине доски | engraving | Echelle de 2 pieds | Шкала в 2 фута | Scale of 2 feet |
| aud15 | `aud15-1` | нет (текст перевода: «Статуя Венеры Афродиты, называемой Медичи, имеет высоту 7 голов 3 част …») | гравированное примечание вертикально у левого края, между двумя звёздочками у бедра левой фигуры; в text_fr/caption отсутствует | engraving | Si la Pointe du Compas eut esté placée dans la Cavité des reins ou des fesses, ces mesures seroient venues plus petites. Elles sont marquées de deux etoiles. | Если бы ножку циркуля поставили в углубление поясницы или ягодиц, эти мерки вышли бы меньше. Они отмечены двумя звёздочками | Had the point of the compass been set in the hollow of the loins or buttocks, these measurements would have come out smaller. They are marked with two stars |
| aud18 | `aud18-1` | нет (текст перевода: «Тот же имеет высоту 7 голов 3 части 6 минут.») | гравированная подпись под круговой схемой — разрез бедра с точками A, B, C и мерками 3 p. 4 m, 3 p. 3 m — справа от фигуры, ниже середины доски | engraving | Épaisseur de la Cuisse droite veüe en racourcy par le Genoüil | Толщина правого бедра, видимая в ракурсе со стороны колена | Thickness of the right thigh seen foreshortened from the knee |
| aud20 | `aud20-1` | нет (текст перевода: «Тот же имеет высоту 7 голов 3 части 6 минут.») | гравированное примечание наклонно слева от головы, под основной подписью; в text_fr/caption отсутствует | engraving | La perspective empesche que l'on ne voye le haut de la Figure aussi grand qu'il est | Перспектива не позволяет видеть верх фигуры таким большим, каков он есть | The perspective prevents the top of the figure from being seen as large as it is |
| aud27 | `aud27-1` | нет (текст перевода: «Части лица, измеренные в той же величине, в какой они на статуе Аполло …») | две гравированные строки внизу слева, под рисунками глаз; ниже — выходная строка «A Paris chez Audran…», она в notes | engraving | Livre pour aprendre à désigner avec les proportions des parties qui ont esté choisie dans les ouvrages de N. Poussin, et gravé par J. Pesne. | Книга для обучения рисованию с пропорциями частей, выбранных из произведений Н. Пуссена; гравировал Ж. Пен | A book for learning to draw, with the proportions of the parts selected from the works of N. Poussin, and engraved by J. Pesne |
| aud27 | `aud27-2` | нет (текст перевода: «Части лица, измеренные в той же величине, в какой они на статуе Аполло …») | гравированный ярлык вертикально у правого края, под шкалой | engraving | Eschelle de 12 minuttes | Шкала в 12 минут | Scale of 12 minutes |
| aud28 | `aud28-1` | нет (текст перевода: «Части лица античной Венеры, измеренные в их истинную величину.») | гравированный ярлык внизу посередине, под горизонтальной шкалой | engraving | Echelle de 12 minutes | Шкала в 12 минут | Scale of 12 minutes |

aud11-2: конец первой строки подписи стёрт; оставлено «[…]», догадка не вписывается — проверить по фото (см. «Не уверен»).

## Не уверен

- `aud11-2` — caption_orig/caption_ru/caption_en — omission, medium: «La Statue d'Antinous surnommée l'admi[…] / a Rome au Jardin du Vatican (вертикально у левого края доски aud11. …» → вынести в отдельные поля (сейчас: вторая подпись гравюры, вертикально вдоль левого края, слева от фигуры; в text_fr/caption отсутствует). caption_orig: «La Statue d'Antinous surnommée l'admi[…] a Rome au Jardin du Vatican» — конец первой строки стёрт, читаемо только «l'admi», дальше «[…]»; проверить по фото, не достраивать; caption_ru: «Статуя Антиноя, прозванная […], в Риме, в саду Ватикана»; cap …
- `aud26-1` — fr/name_fr/ru/en — name, medium: «Il a 5 têtes de hauteur.» → на доске aud26 не сын Лаокоона, а маленький ребёнок (путто) с кувшином, из которого льётся вода, в двух видах; рост 5 голов — пропорции младенца, у сыновей Лаокоона 7 голов (aud24, aud25). Какая это статуя, по доске не установить — не достраивать. Заголовки: fr/name_fr «Enfant à l'urne» или просто «Enfant», ru «Ребёнок с кувшином», en «Child with an urn»
- `aud29-1` — text_fr/caption — ocr, low: «R. Vrbm. in.» → на гравюре внизу слева, мелко: вероятно «R. Vrbin. in.» (= Raphael Urbinas invenit; переводы так и толкуют); «Vrbm» — похоже на слитые минимы. Не уверен — проверить по фото

Прочие замечания с уверенностью low (не спорные, а мелкие): `aud1-3`, `aud17-1`.

## Заметки

| id | вид | заметка |
|---|---|---|
| aud1..aud29 | imprint | Внизу досок — выходные строки гравюры: «Avec privilege du Roy» / «Avec priuil.», номер доски; на aud1 «Se Vend a Paris chez Audran Rue S. Jacques aux deux Piliers d'or»; на aud27 «A Paris Chez Audran rue S. Jacques aux 2 pilliers d'or, avec priuilege du Roy». В данных их нет; по решению пользователя — только заметка, не подписи |
| aud1..aud20 | data_format | text_fr = caption (одно и то же поле дважды); орфография нормализована непоследовательно: «testes» везде заменено на «têtes», «dessignateurs» → «dessinateurs», имена скульпторов модернизированы (Agesander → Agésandre, Athenedore → Athénodore), а «haulteur», «minuttes», «mesme», «suposant», «egallement» сохранены. Косметика, не issue |
| aud13 | data_format | на гравюре сокращение «l'Echelle de l'Antin», в text_fr раскрыто «l'eschelle de l'Antinoüs» (с другой орфографией). Перевод верен. Не issue |
| aud30 | no_original | text_fr и caption пусты, но text_ru/text_en есть («Ещё одна пара декоративных голов того же цикла, завершающая книгу» — современное описание, не перевод). По GROK.md не проверяется (нет оригинала); отметить в SUMMARY |
| aud29 | data_format | text_fr/caption aud29 — это и есть выходные строки гравюры («R. Vrbm. in.» слева, «G. Au. sculp cum privil.» справа), других надписей на доске нет; переводы раскрывают сокращения в скобках. См. issue aud29-1 (чтение «Vrbm») |
| aud22/aud23 | data_format | «La même 8 têtes de hauteur» (aud22) стоит перед первой названной доской этой статуи (aud23 «Mirmille mourant»); «La même» по-французски относится к статуе (ж. р.), RU «Тот же» — к мирмиллону. Смысл не страдает, не issue |

## Повторяющиеся закономерности

1. **Переводы точно следуют `text_fr`, поэтому ошибки `text_fr` переходят в оба перевода:** пропуски гравированного текста (aud1-1, aud1-2, aud25-1) есть и в RU, и в EN — правку вносить во все три поля (и в `caption`).
2. **Гравированные надписи вне главной подписи не попали в данные:** вторая подпись (aud11), примечания (aud15, aud20, aud27) и ярлыки чертежа (aud7, aud13, aud18, aud27, aud28) — 11 подписей.
3. **Заголовки по соседней доске:** aud11 и aud26 получили заголовок предыдущей серии («Terme égyptien (vue 2)», «Enfant de Laocoon (suite)»), хотя на доске другая статуя — обе major.
4. **Старые названия статуй** не распознаны переводчиком: «le Lantin» = Антиной (aud21-1).

## Fix

Готовые исправления (`fix`) — только для major с confidence high. Нумерация абзацев: `text_ru` / `text_en` / `text_fr` в `books/<book>/entries.json` — список строк; `paragraph` — номер элемента списка, с 1 (переводы строк `\n\n` внутри элемента абзац не делят). `paragraph: null` — fix к строковому полю (заголовок, `legend_*`, `findspot_*`), `before` = значение поля целиком. `fix` — объект, если правка одна, или массив объектов (несколько полей или абзацев). `before` скопирован из entries.json побайтно; в `after` изменено только ошибочное место. Проверка: `python3 _review/grok/fix_check.py` (`-v` печатает каждую правку с контекстом). entries.json не изменялся.

- `aud11-1`: 4 fix (fr, name_fr, ru, en; paragraph null — ошибка в заголовках, не в text_*).
- Без fix: `aud26-1` (confidence medium, раздел «Не уверен»).
- Всего fix: 4.
