# Cartari — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/cartari/`. Проверены все 164 записи cartari, где есть оригинал (text_it) и хотя бы один перевод: text_ru и text_en, затем дополнительно text_fr. Тексты не исправлялись; ниже только сводка замечаний. Подробности — в `<id>.json`.

## Итог

| Вердикт | Записей |
|---|---|
| ok | 31 |
| minor | 103 |
| major | 30 |
| **всего** | **164** |

### Уникальные ошибки и вхождения по полям

Одна ошибка = один `issue_id` (`<id>-<n>`). Если одна и та же ошибка есть в нескольких переводах, она считается один раз как уникальная, а в «вхождениях» — по разу на каждое поле из списка `fields`.

| Показатель | Значение |
|---|---|
| Уникальных ошибок (issue_id) | 393 |
| Вхождений по полям (сумма длин `fields`) | 890 |
| Объектов-замечаний в JSON (по одному на поле, где замечание записано) | 647 |

Вхождения по полям: RU — 312, FR — 312, EN — 263, IT — 3 (IT — замечания к самому оригиналу: опечатки/сбои text_it).

Уникальные ошибки по типу: mistranslation — 201, addition — 121, ocr — 30, name — 30, omission — 10, wrong_article — 1.

Из 393 уникальных ошибок 101 касаются подписей к гравюрам (см. раздел «Подписи к гравюрам»), 292 — текста перевода.

Разделы ниже: major — 62 уникальные ошибки (issue_id) в 30 записях; «Проблемы разбивки текста» — 36; «Подписи к гравюрам» — 101; «Не уверен» — 30.

## Major

Записи с вердиктом major. Под каждой — ошибки, из-за которых запись major (пропуск, искажение смысла, чужой/дублированный текст; высокая уверенность). Каждый `issue_id` — один раз; поле(я) — все переводы, где ошибка есть. Критерий отбора: тип omission / wrong_article, либо addition / mistranslation / name с уверенностью high; замечания только о подписях сюда не входят (они minor). Если в major-записи таких нет (cartm44), приведены её замечания medium. Формат: `issue_id` — поля — тип, уверенность: «оригинал» → суть/исправление (из замечания к RU; если замечание записано только к EN/FR, оно помечено [EN]/[FR] и дано на языке перевода с русским пояснением в скобках).

**cartm_intro1**

- `cartm_intro1-1` — RU/EN/FR — mistranslation, high: «fù creduto più vniversalmente, che fosse di esso Prometheo» → более распространённым было мнение, что это [статуя] самого Прометея (речь о статуе, а не об останках)
- `cartm_intro1-2` — RU/EN/FR — mistranslation, high: «& che hauendolo a questo fine condotto in cielo, egli auuedutosi» → и что, когда она [Минерва] ради этого вознесла его на небо, он заметил (lo = Прометея; субъект — Минерва)
- `cartm_intro1-3` — RU/EN/FR — addition, high: «come vedremo poi nella sua imagine, & pure sacrificauano a tutti in vn medesimo modo» → удалить повторный фрагмент «имели на своём языке собственные имена … одним и тем же образом.» (дубль предыдущего предложения, в оригинале его нет)
- `cartm_intro1-8` — RU — mistranslation, high: «Tertulliano dicendo, che la religione in Roma fù ordinata da Numa» → Тертуллиан говорит, что религия в Риме (опечатка: латиница «relig» внутри русского слова)

**cartm_intro2**

- `cartm_intro2-1` — RU/EN/FR — mistranslation, high: «Et sarebbe, dice Plinio, stato meglio assai, che mandarle come in bando alle ville» → И это, говорит Плиний, было бы куда лучше, чем отсылать их, словно в изгнание, по виллам. (смысл перевёрнут; ср. Плиний XXXV, 26: satius … quam in villarum exilia pelli)
- `cartm_intro2-2` — RU/EN/FR — mistranslation, high: «ma di legno di vliuo non saluatico» → но из дерева оливы не дикой (садовой) — у Геродота V, 82 тоже культурная олива
- `cartm_intro2-4` — RU — mistranslation, high: «fatte da pittori, & scultori eccellenti» → созданных превосходными живописцами и ваятелями (в русском тексте осталось английское слово «writen»)
- `cartm_intro2-5` — RU — mistranslation, high: «della terra sterile & infecoda» → отбросами бесплодной и неплодородной земли
- `cartm_intro2-6` — RU — mistranslation, high: «& come che Gioue gli mostrasse tutto quello, che douea fare» → и словно Юпитер показывал ему всё, что надлежало делать
- `cartm_intro2-7` — EN/FR — mistranslation, high: «da quella di Scipione in fuori, che era leuata del Campidoglio» → [EN] except that of Scipio, which was taken from the Capitol

**cartm15**

- `cartm15-2` — RU/EN/FR — mistranslation, high: «così di nascosto, che non sarebbono pure state viste da gli occhi del Sole» → так тайно, что их не увидели бы даже очи Солнца (смысл перевёрнут)

**cartm21**

- `cartm21-2` — RU/EN/FR — mistranslation, high: «vn fosco, & oscuro, l'altro chiaro, e lucido, & questo chiamauano celeste, quello infernale» → и светлый называли небесным, а тёмный — преисподним (questo = последний упомянутый, светлый; ср. Макробий Sat. I, 19: clarum superum, caeruleum inferum)
- `cartm21-3` — RU/EN — name, high: «& era chiamato capo di Volcano» → назывался «глава (голова) Вулкана» — в оригинале и в подписи «capo di Vulcano»

**cartm28**

- `cartm28-2` — RU/EN/FR — mistranslation, high: «Quiui ad vn parto il Sole, e la sorella / Finto ella stessa hauea» → Здесь Солнце и сестру его, рождённых одними родами, / Она [Прозерпина] сама изобразила (finto = изобразила; речь о вышивке на одеянии)
- `cartm28-3` — EN/FR — mistranslation, high: «che disegna Claudiano nella veste di Proserpina» → [EN] which Claudian depicts on the robe of Proserpina
- `cartm28-4` — RU — mistranslation, high: «ò Ver nel grembo / Grata gli tiene» → или на лоне (на коленях) / с радостью их держит

**cartm37**

- `cartm37-2` — RU/FR — mistranslation, high: «che tirassero per arte magica, & a forza d'incanti Gioue di Cielo a venire a rispondere» → которые волшебным искусством и силою заклятий стягивали Юпитера с Неба, дабы тот являлся им отвечать (субъект — Фавн и Пик)
- `cartm37-3` — RU/EN/FR — mistranslation, high: «Là già perduta luce, se con fosche» → Её (Луны) уже утраченный свет… («Là» = «La», артикль/местоимение, а не «там»)
- `cartm37-4` — RU/EN/FR — mistranslation, high: «vna Luna tutta risplendente, dente» → Луна, вся сияющая (дубль «dente» — опечатка оригинала)

**cartm_isismoonjove**

- `cartm_isismoonjove-1` — RU/EN/FR — addition, high: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → удалить вводный блок о конце главы об Изиде: text_it начинается с «saggi, che Gioue fosse…»; этот текст принадлежит другой записи (нужна сверка в проходе B)
- `cartm_isismoonjove-2` — RU/EN/FR — wrong_article, high: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → абзацы 2–4 — сокращённый дубль конца cartm37 (Луна, волшебницы, Фавн и Пик); в text_it этой записи их нет — удалить
- `cartm_isismoonjove-3` — RU/EN/FR — mistranslation, high: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → древние мудрецы не верили, что Юпитер таков, каким его видят на Капитолии

**cartm_pan1**

- `cartm_pan1-1` — RU — addition, high: «— (в text_it фрагмент один раз)» → удалить повторный фрагмент (дублирует уже переведённый выше отрывок; в text_it один раз)
- `cartm_pan1-2` — RU/EN/FR — mistranslation, high: «La picciol coda, & hà d'acuto pino Le tempie cinte» → и виски его увенчаны острой сосновой хвоей («ухо» выдумано)
- `cartm_pan1-3` — RU/EN/FR — addition, high: «lunge, & hirte,» → абзац 2 — дубль конца стихотворения и комментария Сервия/Боккаччо; удалить. Попутно: «lunge» = «длинные» (не «далёкой»), «questi fu vn'huomo dotto» = «он (Пан) был учёным мужем»

**cartm41**

- `cartm41-2` — RU/EN/FR — mistranslation, high: «Et per punire Gioue lo spergiuro, come hò detto» → А поскольку Юпитер, как я сказал, карает клятвопреступника (Юпитер — субъект, не объект)

**cartm44**

- `cartm44-2` — RU/EN/FR — mistranslation, medium: «Ne altra insegna pare, che sia propria a Gioue del Fulmine, benche lo dessero i Romani» → И никакая иная эмблема не кажется столь свойственной Юпитеру, как молния, хотя римляне давали её и богу Сумману (смысл инвертирован)
- `cartm44-3` — RU/EN/FR — mistranslation, medium: «in alcune medaglie pure antiche di Antonino Pio» → на некоторых также древних медалях (pure = тоже)

**cartm53**

- `cartm53-2` — RU/EN/FR — name, high: «Giunone, come hò detto, alcuni da Venere» → Юноной, как я сказал; иные — Венерой, а иные — Гименеем (Giunone; конец cartm51 «da Giu[none]»; также дубль «иные иные»)
- `cartm53-3` — RU/EN/FR — mistranslation, high: «coronato di diuersi fiori, & di verde persa» → …и зелёным майораном (persa = майоран; у Катулла amaracus); то же в стихе «Благоухающего мирта» → «душистого майорана»
- `cartm53-4` — RU/FR — name, high: «il che Plutarco ancora conferma ne i suoi problemi» → Плутарх в своих «Римских вопросах» (Талассий, Гай/Гая — Quaest. Rom. 30–31)
- `cartm53-5` — RU — name, high: «Et à questo fare chiamaua in suo aiuto la Dea Virginense» → богиню Виргиненсу (Virginensis; дважды в тексте)

**cartm58**

- `cartm58-2` — RU/EN/FR — addition, high: «Queste cose si operauano a' 28. d'Aprile, & il primo giorno di Maggio» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор конца абзаца 1 + текст о Доброй Богине из cartm59)

**cartm59**

- `cartm59-2` — RU/EN/FR — addition, high: «cercò più volte con parole di di trarla alle sue voglie» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор второй половины абзаца 1)
- `cartm59-3` — RU/EN/FR — addition, high: «era questa Proserpina, figliuola di Cerere.» → удалить редакторскую пометку — это не перевод

**cartm63**

- `cartm63-2` — RU/EN/FR — addition, high: «fuori della spelonca horrenda porgeua spesso in mare le spauenteuoli teste, guardando se naue» → text_it обрывается на «guardando se naue»; всё дальнейшее (Харибда, превращение Сциллы, Платон о Нереидах, Павсаний, Палемон-Портун) отсутствует в оригинале этой записи — удалить или перенести в следующую запись после сверки …

**cartm70**

- `cartm70-2` — RU/EN — addition, high: «Quà, quà venite à vdir le mie querele Contra questo maluagio, empio, e crudele.» → text_it кончается стихами Катулла; весь последующий блок (страсти души, Стаций о Тисифоне, Овидий, Стикс) в оригинале этой записи отсутствует — удалить/перенести после сверки
- `cartm70-3` — RU — mistranslation, high: «sacrificauano loro ogni anno in certo dì a ciò destinato, alcune pecore pregne» → неких суягных овец («супоросая» — о свинье)
- `cartm70-4` — RU — name, high: «Et Suida riferendo di Menippo Cinico» → о Мениппе Кинике
- `cartm70-5` — FR — addition, high: «Atheniesi le dimandauano le Dee Seuere, & i Sicionij le» → [FR] блок после стиха Катулла (Стаций, Овидий, Стикс) отсутствует в text_it этой записи, к тому же повторён дважды — удалить

**cartm76**

- `cartm76-2` — RU/EN/FR — addition, high: «Ma questa distintione non faceuano gli antichi» → абзацы 2–4 — полный повторный перевод абзаца 1 (с редакторскими пометками); удалить

**cartm78**

- `cartm78-2` — RU/EN/FR — addition, high: «Percioche la Fede hà da stare secreta» → абзац 2 — текст из предыдущей записи (Согласие, Силий Италик) + повтор абзаца 1; в text_it нет — удалить
- `cartm78-3` — RU/EN/FR — addition, high: «Erano oltre di ciò i pomi granati ancora segno di Concordia» → абзац 3 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить

**cartm80**

- `cartm80-2` — RU/EN/FR — addition, high: «ne di bel corpo, grande, e sodo» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор начала абзаца 1 + редакторская пометка)
- `cartm80-3` — RU/EN/FR — mistranslation, high: «& con simili statoe honorauano spesso i gradi, & valorosi Capitani» → такими статуями часто чтили великих и доблестных Полководцев («gradi» = опечатка «grandi»)

**cartm_night**

- `cartm_night-2` — RU/EN/FR — addition, high: «qualche poco, & è così dipinta, che rappresenta l'ornamento del Cielo» → абзацы 2–3 — повтор абзаца 1; в конце абз. 3 добавлено «описывает Ахайю… […продолжение см. в карточке…]», чего в text_it нет — удалить

**cartm_hercgall**

- `cartm_hercgall-2` — RU/EN/FR — addition, high: «quenza, in questa guisa, come racconta Luciano» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить; глосса «Черножопым» и окончание имени — уже текст следующей записи

**cartm81**

- `cartm81-2` — RU/EN/FR — addition, high: «Melampigo, che viene a dire, dal negro culo» → абзацы 2–3 — сокращённый (с «...») повтор начала абзаца 1; удалить
- `cartm81-3` — RU/EN/FR — mistranslation, high: «che se ne portasse in collo vn ferro cinghiale» → как нёс на плечах свирепого кабана («ferro» = «fero», Эриманфский вепрь)
- `cartm81-5` — EN/FR — mistranslation, high: «ornandole di virtù, & di opere giuste, & honeste» → [EN] adorning them with virtue, and with just and honest works

**cart10**

- `cart10-2` — RU/EN/FR — mistranslation, high: «Giuano intanto con le chiome sparse Le donne d'Ilio» → Шли между тем с распущенными власами / Жёны Илиона… («Giuano» = «givano», шли; Юноны здесь нет)
- `cart10-3` — RU/EN/FR — mistranslation, high: «spiccò fuori della terra vn rampollo di oglio» → забил из земли родник масла (rampollo di oglio = струя масла; у Павсания перед храмом потекло масло)

**cartm_virtuhonore**

- `cartm_virtuhonore-2` — RU/EN/FR — mistranslation, high: «Et perche a questa si accostò Hercole, hebbe così glorioso nome.» → И поскольку Геркулес примкнул к ней, он стяжал столь славное имя (подлежащее — Геркулес, не Добродетель)

**cartm_marte**

- `cartm_marte-2` — RU/EN/FR — mistranslation, high: «battendosi la natura con mano ingrauidò di Marte» → ударив себя рукою по лону, зачала Марса («la natura» = детородные части, не «земля»)
- `cartm_marte-3` — RU/EN/FR — mistranslation, high: «& fu fatto morire per mano … vn Tribuno della plebe, che hebbe ardire di nomarlo» → и был казнён по приговору правосудия некий плебейский трибун, осмелившийся его назвать (казнён сам трибун)
- `cartm_marte-4` — EN/FR — mistranslation, high: «quello perche è feroce, come scriue Pausania, & il più forte» → [EN] the former (the Dog) because it is fierce … the latter (the Wolf) either because… («quello/questo» перепутаны; RU верно)

**cartm_lare**

- `cartm_lare-2` — RU/EN/FR — mistranslation, high: «d'onde vna serua della sua moglie detta Ocrisia, che quiui era stata assisa» → некая служанка его жены, по имени Окрисия (Окрисия — служанка, мать Сервия Туллия, а не жена Тарквиния)

**cartm_eroteanterote**

- `cartm_eroteanterote-2` — RU/EN/FR — mistranslation, high: «li quali diceuano gli antichi tutti venire da Cupido, che accendergli alla virtù» → …приходят от Купидона (скорее), чем то, что он воспламеняет их к добродетели — «che» сравнительное; смысл инвертирован

**cartm_venerebarba**

- `cartm_venerebarba-1` — RU/EN/FR — mistranslation, high: «& nelli Dei non esser differenza di esso, come nè mortali» → и что у богов нет различия пола, какое есть у смертных (смысл инвертирован; ср. в тексте ниже «che è trà mortali»)

**cartm_gratieintro**

- `cartm_gratieintro-1` — RU/EN/FR — mistranslation, high: «che non ne rompono; … o torcono pure vna» → что не ломают и не сгибают ни одного (колоса) — отрицание распространяется на «torcono»; смысл инвертирован

**cartm_pignorialisimaco**

- `cartm_pignorialisimaco-1` — RU/FR/EN — mistranslation, high: «Antichità, tenne sempre, che l'effiggie con le corna, che si vede nelle Medaglie di Lisimaco» → [Фульвио Орсини, муж весьма сведущий в] Древностях, всегда полагал… — фраза продолжает конец carta15 («Fuluio Orsino homo intendentissimo delle / Anti-»); подлежащее — Орсини, а не «Древность»; EN «Antiquity always held» → …

**carta27**

- `carta27-1` — RU/EN/FR — mistranslation, high: «la sferza, che passim si effigiaua in mano d'Oro, al qual Oro spetta ancora la testuggine» → бич, который повсюду изображался в руке Ора (Гора), какому Ору принадлежит также черепаха; далее «Золотого Гарпократа» → «Ора Гарпократа» (Oro = Гор, не золото)

## Проблемы разбивки текста

Дубли абзацев и фрагментов, текст соседних записей, оборванные или продолженные из другой записи фразы, кустоды и повторы на стыке страниц, редакторские пометки внутри перевода. Подписи к гравюрам, слитые с текстом, вынесены в следующий раздел.

- `cartm_intro1-3` — RU/EN/FR — addition, high: «come vedremo poi nella sua imagine, & pure sacrificauano a tutti in vn medesimo modo» → удалить повторный фрагмент «имели на своём языке собственные имена … одним и тем же образом.» (дубль предыдущего предложения, в оригинале его нет)
- `cartm28-6` — RU/FR — mistranslation, medium: «Ma non voglio entrare in queste cose Sole de gli Astrologi» → в эти дела астрологов («Sole» — колонтитул/сбой набора в оригинале; в EN «these matters The Sun of the Astrologers» — так же)
- `cartm37-6` — FR — ocr, low: «vi erano due altre te- … ste, che si moueuano» → [FR] deux autres têtes, qui se mouvaient (повтор на стыке страниц)
- `cartm_isismoonjove-1` — RU/EN/FR — addition, high: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → удалить вводный блок о конце главы об Изиде: text_it начинается с «saggi, che Gioue fosse…»; этот текст принадлежит другой записи (нужна сверка в проходе B)
- `cartm_isismoonjove-2` — RU/EN/FR — wrong_article, high: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → абзацы 2–4 — сокращённый дубль конца cartm37 (Луна, волшебницы, Фавн и Пик); в text_it этой записи их нет — удалить
- `cartm_isismoonjove-5` — FR — addition, medium: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → [FR] не уверен: вступление о Юпитере (Сатурн, Ямвлих, лотос) в text_it этой записи отсутствует — возможно, текст соседней записи; сверить по фото, не дописывать
- `cartm_pan1-1` — RU — addition, high: «— (в text_it фрагмент один раз)» → удалить повторный фрагмент (дублирует уже переведённый выше отрывок; в text_it один раз)
- `cartm_pan1-3` — RU/EN/FR — addition, high: «lunge, & hirte,» → абзац 2 — дубль конца стихотворения и комментария Сервия/Боккаччо; удалить. Попутно: «lunge» = «длинные» (не «далёкой»), «questi fu vn'huomo dotto» = «он (Пан) был учёным мужем»
- `cartm53-2` — RU/EN/FR — name, high: «Giunone, come hò detto, alcuni da Venere» → Юноной, как я сказал; иные — Венерой, а иные — Гименеем (Giunone; конец cartm51 «da Giu[none]»; также дубль «иные иные»)
- `cartm54-3` — RU/FR/EN — mistranslation, high: «con la sinistra mano sostiene vno scudo fermato sopra il ginocchio, & & ad ciascheduno de i lati» → …упёртый в колено, и с каждой стороны у неё по Льву (дубль «и» на стыке страниц; то же в EN «and / and»)
- `cartm54-4` — FR — mistranslation, low: «ni di conto, li quali si mutauano di habito» → [FR] не уверен: начало фразы оборвано на стыке страниц; «…ni di conto» может значить «люди без положения» — сверить с предыдущей записью, не дописывать
- `cartm58-2` — RU/EN/FR — addition, high: «Queste cose si operauano a' 28. d'Aprile, & il primo giorno di Maggio» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор конца абзаца 1 + текст о Доброй Богине из cartm59)
- `cartm59-2` — RU/EN/FR — addition, high: «cercò più volte con parole di di trarla alle sue voglie» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор второй половины абзаца 1)
- `cartm59-3` — RU/EN/FR — addition, high: «era questa Proserpina, figliuola di Cerere.» → удалить редакторскую пометку — это не перевод
- `cartm63-2` — RU/EN/FR — addition, high: «fuori della spelonca horrenda porgeua spesso in mare le spauenteuoli teste, guardando se naue» → text_it обрывается на «guardando se naue»; всё дальнейшее (Харибда, превращение Сциллы, Платон о Нереидах, Павсаний, Палемон-Портун) отсутствует в оригинале этой записи — удалить или перенести в следующую запись после сверки …
- `cartm70-2` — RU/EN — addition, high: «Quà, quà venite à vdir le mie querele Contra questo maluagio, empio, e crudele.» → text_it кончается стихами Катулла; весь последующий блок (страсти души, Стаций о Тисифоне, Овидий, Стикс) в оригинале этой записи отсутствует — удалить/перенести после сверки
- `cartm70-5` — FR — addition, high: «Atheniesi le dimandauano le Dee Seuere, & i Sicionij le» → [FR] блок после стиха Катулла (Стаций, Овидий, Стикс) отсутствует в text_it этой записи, к тому же повторён дважды — удалить
- `cartm76-2` — RU/EN/FR — addition, high: «Ma questa distintione non faceuano gli antichi» → абзацы 2–4 — полный повторный перевод абзаца 1 (с редакторскими пометками); удалить
- `cartm78-2` — RU/EN/FR — addition, high: «Percioche la Fede hà da stare secreta» → абзац 2 — текст из предыдущей записи (Согласие, Силий Италик) + повтор абзаца 1; в text_it нет — удалить
- `cartm78-3` — RU/EN/FR — addition, high: «Erano oltre di ciò i pomi granati ancora segno di Concordia» → абзац 3 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить
- `cartm80-2` — RU/EN/FR — addition, high: «ne di bel corpo, grande, e sodo» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить (повтор начала абзаца 1 + редакторская пометка)
- `cartm_night-2` — RU/EN/FR — addition, high: «qualche poco, & è così dipinta, che rappresenta l'ornamento del Cielo» → абзацы 2–3 — повтор абзаца 1; в конце абз. 3 добавлено «описывает Ахайю… […продолжение см. в карточке…]», чего в text_it нет — удалить
- `cartm_hercgall-2` — RU/EN/FR — addition, high: «quenza, in questa guisa, come racconta Luciano» → абзац 2 — дубль уже переведённого текста (и/или текст соседней записи / редакторская пометка); в text_it этой записи его нет — удалить; глосса «Черножопым» и окончание имени — уже текст следующей записи
- `cartm81-2` — RU/EN/FR — addition, high: «Melampigo, che viene a dire, dal negro culo» → абзацы 2–3 — сокращённый (с «...») повтор начала абзаца 1; удалить
- `cartm_tifone-3` — RU/FR/EN — addition, low: «stasse. Et di Horo auuene quasi anco il medesimo» → «stasse» — обрывок слова с предыдущей страницы; «довольно» / EN «suffice.» — догадка переводчика; лучше «…» — не уверен
- `cartm_fauore-3` — EN — mistranslation, low: «perche vuole ogni hora salire più sù, che non gli conuiene» → [EN] than is fitting for him (Фавор, м. р.); на переносе страницы текст EN спутан («to come») — проверить стык, не уверен
- `cartm_fauore-4` — FR — ocr, low: «spinto dall'Adulatione, che l'accompagna sempre» → [FR] plus haut qu'il ne lui convient, poussée par la Flatterie (повтор «qu'il ne lui convient» на стыке страниц — удалить дубль)
- `cartm_cupido-3` — RU/EN — ocr, medium: «Melete giouane Atheniese niun conto» → «contò facendosi» на переносе — повтор «conto/contò», а не «рассказывал»: «ни во что не ставил [Тимагора], издеваясь…»; убрать «рассказывал» — не уверен в точной реконструкции
- `cartm_venerecigni-2` — RU/FR/EN — ocr, low: «Va nuotando Venere pel mare, dicono, per dare … ad intendere quanto sia amara» → дабы дать понять (на переносе удвоено; EN «to show / to understand» → «to make understood»)
- `cartm_venerearmata-3` — RU/FR/EN — addition, medium: «nè scriuendo si può mettere così interamente tutto, che non … vi rimanga qualche cosa sempre» → чтобы не осталось всегда чего-нибудь ещё (кустода «an-» ошибочно развёрнута в «древние»); EN «so fully everything that / the ancients / something always remains» → убрать «the ancients»
- `cartm_furoreira-3` — FR/EN — addition, low: «re, perche al cominciare delle guerre più se dice spesso di quello, che se ne seguita poi» → [FR] […]re, car au commencement des guerres (обрывок слова со стыка страниц; «la Renommée» — догадка, не уверен; EN «Fame» → «[…]re»)
- `carta3-4` — FR — ocr, low: «che si vedono con figure hierogliifiche» → [FR] demi-cercles d'Or et d'Argent (искажение переноса «O-/ro» на стыке)
- `cartm_pignoriasfinge-1` — FR — ocr, low: «& quest'vltima si vede frequen- te- quentissima nelle monete di Corinto» → [FR] se voit très fréquemment sur les monnaies de Corinthe (лишний обрывок «repré-» на стыке страниц)
- `cartm_pignorialisimaco-1` — RU/FR/EN — mistranslation, high: «Antichità, tenne sempre, che l'effiggie con le corna, che si vede nelle Medaglie di Lisimaco» → [Фульвио Орсини, муж весьма сведущий в] Древностях, всегда полагал… — фраза продолжает конец carta15 («Fuluio Orsino homo intendentissimo delle / Anti-»); подлежащее — Орсини, а не «Древность»; EN «Antiquity always held» → …
- `cartm_pignoriapriapo-2` — RU/FR/EN — ocr, low: «non che gl'occhi di chi hauesse vn … tantino di rossore honorato» → кустода «santi-» (sic, = tantino) ошибочно переведена как «свято-» — удалить; EN «shred a shred» — убрать повтор
- `carta41-3` — FR — ocr, low: «Si vede in esso il tiro felicissimo appresso gl'antichi, del giuoco de i» → [FR] au jeu des Osselets (кустода «Tali» повторена — удалить дубль)

## Подписи к гравюрам

Всего 101: позиция «начало» — 76, «конец» — 16, «середина» — 0, подпись в переводах отсутствует — 9.

caption_source: engraving (caption_orig прочитан с гравюры в books/cartari/img) — 57; text (caption_orig взят из text_it) — 34; null (caption_orig «проверить по фото»: изображения нет в репозитории или фразы нет на странице) — 10.

Подписи осмысленны, их не удалять: предлагается вынести в отдельные поля caption_orig / caption_ru / caption_en / caption_fr. Для каждой записи: где подпись сейчас стоит в переводах, текущий текст подписи в переводах, caption_source и caption_orig (с гравюры, из text_it или «проверить по фото»). Замечание только о подписи — minor.

### cart2 (`cart2-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "Образы Аполлона и животных и птиц, ему посвящённых, которые означают действия Солнца; а также то, что Аполлон был богом прорицания. Он держит в руке благодати, означающие ту пользу, что мы получаем от Солнца, и ту выгоду, что от него нам проистекает."
- caption_en (текущий текст в переводе): "Images of Apollo and the animals and birds sacred to him, which signify the effects of the Sun; and that Apollo was the god of divination. He holds in his hand the graces, signifying the benefit we have from the Sun, and the usefulness that comes to us from it."
- caption_fr (текущий текст в переводе): "Images d'Apollon et des animaux et oiseaux qui lui sont consacrés, lesquels signifient les effets du Soleil ; et qu'Apollon fut le dieu de la divination. Il tient en main les grâces, qui signifient le bienfait que nous recevons du Soleil, et l'utilité qui nous en provient."
- caption_source: engraving
- caption_orig (с гравюры): "Imagini d'Apollo & de gli animali, & vccelli à lui sacrati, che significano gli effetti del Sole: & Apollo esser stato Dio dell'indouinare. hà le gratie in mano che significano il giouamento, che dal Sole habbiamo, & la vtilità che a noi peruiene da esso." (сверено по гравюре img/cart2.jpg; поле caption в entries.json расходится с гравюрой: «Ha le grazie» → «hà le gratie», «perviene» → «peruiene»)

### cartm13 (`cartm13-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Аполлон, обнимающий Дафну, — чтобы показать сходство, которое имеет Лавр с этим богом: быть вечнозелёным и обладать очистительной силой; кроме того, это показывает покровительство, которое Аполлон оказывает императорам и поэтам»."
- caption_en (текущий текст в переводе): "“Apollo embracing Daphne, to show the affinity that the Laurel holds with this god, in being ever green and having a purgative power; besides which it shows the Protection that Apollo holds over Emperors and Poets.”"
- caption_fr (текущий текст в переводе): "« Apollon embrassant Daphné, pour montrer l'affinité que le Laurier a avec ce dieu, étant toujours vert et doué d'une force purgative ; cela montre aussi la Protection qu'Apollon exerce sur les Empereurs et les Poètes. »"
- caption_source: engraving
- caption_orig (с гравюры): "Apollo abbracciante Dafne per mostrare la conformità, che tiene il Lauro con questo Dio di essere sempre verde, & hauere forza purgatiua, oltrache mostra la Protettione, che tiene Apolline de gl'Imperatori, & di Poeti." (сверено по гравюре img/cartm13.jpg; совпадает с полем caption в entries.json)

### cartm14 (`cartm14-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Аполлона, или Солнца, означающий, что он — бог благоразумия и власти, и что мудрый человек должен много слушать и действовать, но мало говорить; а также означает, что Солнце, то есть Бог, всё слышит и видит»."
- caption_en (текущий текст в переводе): "“The image of Apollo, or of the Sun, signifying that he is the god of prudence and of power, and that the wise man should listen and act much, but speak little; it also signifies that the Sun, that is, God, hears and sees all things.”"
- caption_fr (текущий текст в переводе): "« L'image d'Apollon, ou du Soleil, signifiant qu'il est le dieu de la prudence et du pouvoir, et que l'homme sage doit beaucoup écouter et agir, mais peu parler ; cela signifie aussi que le Soleil, c'est-à-dire Dieu, entend et voit tout. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Apollo, ò del Sole, significante lui esser Dio della prudenza, & del potere, & che l'huomo sauio debbia ascoltare & operar assai, ma parlar poco, è così significa ancora il Sole cioè Dio tutto sentire & vedere." (сверено по гравюре img/cartm14.jpg; в поле caption «è cor significa»; на гравюре «è cos[ì] significa» (последняя буква слабо пропечатана))

### cartm15 (`cartm15-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Аполлона-Митры, означающий силу и воздействие Солнца на Луну и на все вещи; и что Солнце среди звёзд подобно Льву среди зверей, и в этом знаке (созвездии) оно являет нам наибольшую свою силу»."
- caption_en (текущий текст в переводе): "“The image of Apollo Mithras, signifying the power and effects of the Sun upon the Moon and upon all things, and that the Sun is among the Stars as the Lion is among the beasts, and in that sign shows us here its greatest strength.”"
- caption_fr (текущий текст в переводе): "« L'image d'Apollon Mithra, signifiant la force et les effets du Soleil sur la Lune et sur toutes choses, et que le Soleil est parmi les étoiles comme le Lion parmi les bêtes, et que dans ce signe il nous montre ici sa plus grande force. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Apollo Mithra, significante la forza & effetti del Sole nella Luna & in tutte le cose, & il Sole esser fra le Stelle, come il Leone fra le fere, & in tal segno qui appresso noi mostrar la sua maggior forza." (сверено по гравюре img/cartm15.jpg; совпадает с полем caption в entries.json)

### cartm16 (`cartm16-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ священных быков у египтян; они означали Солнце, Осириса и Земледелие»."
- caption_en (текущий текст в переводе): "“The image of the sacred Oxen among the Egyptians, which signified the Sun, Osiris, and Agriculture.”"
- caption_fr (текущий текст в переводе): "« L'image des Bœufs sacrés chez les Égyptiens, qui signifiaient le Soleil, Osiris et l'Agriculture. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine dei Buoi sacri appresso gli Egittij, & significauano il Sole, Osiride, & l'Agricoltura." (сверено по гравюре img/cartm16.jpg; совпадает с полем caption в entries.json)

### cartm17 (`cartm17-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ нагого Аполлона, любящего быков, означает, что Солнце даёт жизнь земледелию, ибо своим умеренным теплом придаёт силу семени, травам, растениям и всему, дабы они достигли должного совершенства, зрелости и завершения»."
- caption_en (текущий текст в переводе): "“The image of naked Apollo, lover of Oxen, signifies that the Sun gives life to the things of agriculture, because with its moderate heat it gives strength to the seed, to herbs, to plants, and to everything, so that they may come to their due perfection, ripeness, and end.”"
- caption_fr (текущий текст в переводе): "« L'image d'Apollon nu, amateur de Bœufs, signifie que le Soleil donne vie aux choses de l'agriculture, car par sa chaleur modérée il donne force à la semence, aux herbes, aux plantes et à toutes choses, afin qu'elles parviennent à leur juste perfection, maturité et fin. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Apollo nudo, amatore de' Buoi, significa il Sole dar vita alle cose dell'agricoltura, perche con il suo moderato calore dà forza al seme, all'herbe, piante, & al tutto, accio peruenghino alla sua debita perfettione maturità & fine." (сверено по гравюре img/cartm17.jpg; совпадает с полем caption в entries.json)

### cartm18 (`cartm18-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Аполлона и Земли у ассирийцев, означающий воздействие Солнца на землю и на все вещи, с образами природы и материи, из которой вещи образованы и происходят. Змей, которым они заканчиваются, означает извилистый путь Солнца»."
- caption_en (текущий текст в переводе): "“The image of Apollo and the Earth among the Assyrians, signifying the effects of the Sun upon the earth, and upon all things, with the images of nature and of the matter from which things are formed and take their origin. The serpent in which they end denotes the winding course of the Sun.”"
- caption_fr (текущий текст в переводе): "« L'image d'Apollon et de la Terre chez les Assyriens, signifiant les effets du Soleil sur la terre et sur toutes choses, avec les images de la nature et de la matière dont les choses sont formées et tirent leur origine. Le serpent par lequel elles se terminent indique la course sinueuse du Soleil. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Apolline & della Terra appresso gl'Assirij significante gli effetti del Sole nella terra, & in tutte le cose, con le Imagini della natura & della materia onde sono formate, & hanno origine le cose. il serpente in che finiscono dinota il tortuoso giro del Sole." (сверено по гравюре img/cartm18.jpg; совпадает с полем caption в entries.json)

### cartm19 (`cartm19-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Адада и Адаргатис, богов ассирийцев, понимаемых ими как Солнце и Земля, означающий, что всё, что рождается на земле, происходит от силы Солнца и солнечных лучей»."
- caption_en (текущий текст в переводе): "“The image of Adad, and of Adargatis, gods of the Assyrians, understood by them as the Sun and the Earth, denoting that everything born on earth comes from the power of the Sun and from solar rays.”"
- caption_fr (текущий текст в переводе): "« L'image d'Adad et d'Adargatis, dieux des Assyriens, entendus par eux comme le Soleil et la Terre, indiquant que tout ce qui naît sur terre provient de la vertu du Soleil et des rayons solaires. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Adad, & d'Adargate Dei de gli Assirij intesi da loro per il Sole & per la Terra, dinotante che tutto ciò che nasce in terra prouiene dalla virtù del Sole, & da raggi solari." (сверено по гравюре img/cartm19.jpg; совпадает с полем caption в entries.json)

### cartm20 (`cartm20-1`, поля: RU/EN/FR)

- Позиция: начало (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Сераписа, бога египтян, понимаемого ими как Солнце и как Нил, с изваянием тела о трёх главах, означающих три времени — прошедшее, настоящее и будущее, — и что Солнце движется в порядке и мере, никогда не отклоняясь»."
- caption_en (текущий текст в переводе): "“The image of Serapis, god of the Egyptians, understood by them as the Sun, and as the Nile, with the likeness of a body with three heads, signifying the three times — past, present, and to come — and that the Sun proceeds with order and measure, never deviating.”"
- caption_fr (текущий текст в переводе): "« L'image de Sérapis, dieu des Égyptiens, entendu par eux comme le Soleil et comme le Nil, avec la représentation d'un corps à trois têtes, signifiant les trois temps — passé, présent et à venir — et que le Soleil avance avec ordre et mesure, sans jamais dévier. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Serapi Dio delli Egittij inteso da loro per il Sole, & per il Nilo, co'l simulacro d'vn corpo con tre capi significanti li tre tempi passato, presente, & auenire, & il Sole andar con ordine & misura ne mai deuiare." (сверено по гравюре img/cartm20.jpg; совпадает с полем caption в entries.json)

### cartm21 (`cartm21-1`, поля: RU/FR/EN)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Солнца, изменяющего и порождающего все времена и времена года, и все вещи, жизнь и смерть, с четырьмя сосудами, в которых заключено разнообразие благ и зол, именуемых: кузница Вулкана, смех Юпитера, смерть Сатурна и грудь Юноны, из коих происходит всё»."
- caption_en (текущий текст в переводе): "“The image of the Sun, changer and producer of all times and seasons, and of all things, of life and death, and of four vessels in which lies the variety of goods and ills, named the forge of Vulcan, the laughter of Jove, the death of Saturn, and the breast of Juno, from which all things proceed.”"
- caption_fr (текущий текст в переводе): "« L'image du Soleil, qui change et produit tous les temps et toutes les saisons, et toutes choses, la vie et la mort, et de quatre vases où se trouve la variété des biens et des maux, nommés la forge de Vulcain, le rire de Jupiter, la mort de Saturne et le sein de Junon, d'où procède toute chose. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine del Sole variatore & produttore di tutti li tempi, e stagioni, & de tutte le cose, della vita & morte, & de quattro vasi oue stà la varietà de beni & mali nominati capo di Vulcano, riso di Gioue, morte di Saturno, & poppa di Giunone, da quali prouiene il tutto." (сверено по гравюре img/cartm21.jpg; совпадает с полем caption в entries.json)

### cartm22 (`cartm22-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Эскулапа, бога Медицины, со священными ему животными, означающими трудность врачебного искусства и обязанность доброго врача; понимается также как очищенный воздух, приносящий здоровье»."
- caption_en (текущий текст в переводе): "“The image of Aesculapius, god of Medicine, with the animals sacred to him, signifying the difficulty of Medicine, and the office of the good Physician; understood also as purified air, bringer of health.”"
- caption_fr (текущий текст в переводе): "« L'image d'Esculape, dieu de la Médecine, avec les animaux qui lui sont sacrés, signifiant la difficulté de la Médecine et le devoir du bon Médecin ; entendu aussi comme l'air purifié, porteur de santé. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Esculapio Dio della Medicina con gli animali à lui sacrati significanti la difficultà della Medicina, & l'officio del buon Medico, inteso ancora per l'aria purgata apportatrice di sanità." (сверено по гравюре img/cartm22.jpg; совпадает с полем caption в entries.json)

### cartm23 (`cartm23-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Эскулапа, бога медицины, с петухами, посвящёнными ему птицами, означающими бдительность, необходимую врачам, и змеем — символом здоровья и долголетия, проистекающих от врачебного попечения»."
- caption_en (текущий текст в переводе): "“The image of Aesculapius, god of medicine, with the roosters, birds sacred to him, signifying the vigilance necessary to Physicians, and the serpent, symbol of health and length of life, which comes from the care of Physicians.”"
- caption_fr (текущий текст в переводе): "« L'image d'Esculape, dieu de la médecine, avec les coqs, oiseaux qui lui sont sacrés, signifiant la vigilance nécessaire aux Médecins, et le serpent, symbole de santé et de longévité, qui provient du soin des Médecins. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Esculapio Dio della medicina con li galli vccelli à lui sacrati, significanti la vigilanza necessaria alli Medici, & il serpente simbolo di sanità, & longhezza di vita, che prouiene dalla cura de Medici." (сверено по гравюре img/cartm23.jpg; совпадает с полем caption в entries.json)

### cartm25 (`cartm25-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ богини Здоровья и посвящённого ей Змея, означающий, что благодаря питью лекарств — как очистительных, так и укрепляющих, — к нам возвращается утраченное здоровье, долголетие и стойкость жизни; а само здоровье означено Змеем»"
- caption_en (текущий текст в переводе): "“The image of the goddess Health, and of the Serpent sacred to her, signifying that through the drinking of medicines, both purgative and preservative, lost health comes back to us, together with length and stability of life, health itself being signified by the Serpent.”"
- caption_fr (текущий текст в переводе): "« L'image de la déesse Santé, et du Serpent qui lui est sacré, signifiant que par la prise de médicaments, tant purgatifs que conservatifs, la santé perdue nous revient, ainsi que la longueur et la stabilité de la vie, la santé elle-même étant signifiée par le Serpent. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della dea Salute, & del Serpente à lei sacrato significante della beuanda delle medicine sì purgatiue, come conseruatiue, peruenir à noi la sanità perduta, la longhezza, & stabilità della vita, & la sanità significata per il Serpente." (сверено по гравюре img/cartm25.jpg; совпадает с полем caption в entries.json)

### cartm26 (`cartm26-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Гигиеи, дочери Эскулапа, с Псом и Змеем — символами её отца, означающими усердие доброго врача и те следствия, что проистекают из него»."
- caption_en (текущий текст в переводе): "“The image of Hygieia, daughter of Aesculapius, with the Dog and the Serpent, symbols of her father, signifying the diligence of the good Physician, and the effects that result from it.”"
- caption_fr (текущий текст в переводе): "« L'image d'Hygie, fille d'Esculape, avec le Chien et le Serpent, symboles de son père, signifiant la diligence du bon Médecin, et les effets qui en résultent. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Higia figliuola d'Esculapio co'l Cane, & Serpe simboli di suo Padre, significanti la diligenza del buon Medico, & gli effetti, che da questa ne risultano." (сверено по гравюре img/cartm26.jpg; совпадает с полем caption в entries.json)

### cartm27 (`cartm27-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Колесница Солнца, бога света, с образом и убранством самого Солнца, влекомая четырьмя конями, означающими четыре проявления его сияния в течение дня и года, а также быстроту его движения и его тело»."
- caption_en (текущий текст в переводе): "“The Chariot of the Sun, god of light, with the image and ornament of the Sun itself, drawn by four Horses, signifying the four splendours and effects of the Sun through the day and the year, and the swiftness of its motion and its body.”"
- caption_fr (текущий текст в переводе): "« Le Char du Soleil, dieu de la lumière, avec l'image et l'ornement du Soleil lui-même, tiré par quatre Chevaux, signifiant les quatre splendeurs et effets du Soleil au long du jour et de l'année, ainsi que la rapidité de son mouvement et son corps. »"
- caption_source: engraving
- caption_orig (с гравюры): "Carro del Sole Dio della luce con l'imagine & ornamento di esso Sole, tirato da quattro Caualli, significante li quattro effetti splendori del Sole del giorno & dell'anno, & la velocità del moto suo, & suo corpo." (сверено по гравюре img/cartm27.jpg; совпадает с полем caption в entries.json)

### cartm28 (`cartm28-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Солнца, называемого также Фебом и Аполлоном, богом дня, означающий его воздействие на времена года и небесные знаки, а также на Луну; и что Луна в знаке Овна становится весьма влажной, соединяясь с Солнцем, которое всё освещает и всему даёт жизнь»."
- caption_en (текущий текст в переводе): "“The image of the Sun, also called Phoebus and Apollo, god of the day, signifying his effects upon the seasons and the celestial signs, and upon the Moon, and that the Moon in the sign of Aries is most moist, being joined with the Sun, which illuminates all things and gives life to all.”"
- caption_fr (текущий текст в переводе): "« L'image du Soleil, aussi appelé Phébus et Apollon, dieu du jour, signifiant ses effets sur les saisons et les signes célestes, et sur la Lune, et que la Lune dans le signe du Bélier est très humide, étant conjointe au Soleil, qui illumine tout et donne vie à tout. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine del Sole detto anco Febo, & Apolline dio del giorno significante gli effetti suoi nelle stagioni & ne segni celesti, & nella Luna, & che la Luna nel segno d'Ariete, è humidissima essendo congionta con il Sole, che tutto illumina, & a tutto da vita." (сверено по гравюре img/cartm28.jpg; совпадает с полем caption в entries.json)

### cartm29 (`cartm29-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Авроры и коня Пегаса, влекущего её колесницу, означающий, что тот час (рассвет) наиболее удобен и наиболее плодотворен для учёных занятий, и ту славу, что проистекает от этого учёному и добродетельному человеку»."
- caption_en (текущий текст в переводе): "“The image of Aurora, and of the horse Pegasus, who draws her chariot, denoting that that hour is the most convenient and most profitable for study, and the glory that results from it for the learned and virtuous man.”"
- caption_fr (текущий текст в переводе): "« L'image de l'Aurore, et du cheval Pégase, qui tire son char, indiquant que cette heure est la plus propice et la plus profitable à l'étude, et la gloire qui en résulte pour l'homme savant et vertueux. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine dell'Aurora, & del Cauallo Pegaseo, che tirra il suo carro, dinotante quell'hora essere la più commoda, & di maggior profitto per lo studiare, & la gloria che ne risulta al dotto & virtuoso." (сверено по гравюре img/cartm29.jpg; совпадает с полем caption в entries.json)

### cartm31 (`cartm31-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Статуя Люцины, богини родов, отождествляемой с Луной, поскольку Луна — влажная планета, способная облегчать быстроту родов; изображена закутанной в знак стыдливости рожающей женщины»."
- caption_en (текущий текст в переводе): "“The statue of Lucina, goddess of Childbirth, identified with the Moon, the Moon being a moist planet apt to facilitate the swiftness of childbirth, and figured veiled for the modesty of the woman giving birth.”"
- caption_fr (текущий текст в переводе): "« La statue de Lucine, déesse des accouchements, assimilée à la Lune, la Lune étant une planète humide propre à faciliter la rapidité de l'accouchement, et représentée voilée pour la pudeur de la femme qui accouche. »"
- caption_source: engraving
- caption_orig (с гравюры): "Statua di Lucina dea de Parti tolta per la Luna essendo la Luna Pianeta humido atto à facilitare la prestezza del parto, & figurata per la vergogna della donna parturiente." (сверено по гравюре img/cartm31.jpg; совпадает с полем caption в entries.json)

### cartm32 (`cartm32-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Дианы Кинфии, то есть Луны, богини-охотницы, с леопардом в правой руке и львом в левой — так она была изваяна в Коринфе, в храме Юноны, на ковчеге тирана Кипсела»."
- caption_en (текущий текст в переводе): "“The image of Diana Cynthia, or the Moon, huntress goddess, with a Leopard in her right hand, and a Lion in her left, thus carved in Corinth in the temple of Juno, on the chest of the tyrant Cypselus.”"
- caption_fr (текущий текст в переводе): "« L'image de Diane Cynthia, ou la Lune, déesse chasseresse, avec un Léopard dans la main droite et un Lion dans la main gauche, ainsi sculptée à Corinthe dans le temple de Junon, sur le coffre du tyran Cypsélos. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Diana Cinthia ò Luna dea cacciatrice con vn Pardo nella destra, & vn Leone nella sinistra, così scolpita in Corinto nel tempio di Giunone nell'Arca di Cipsello tiranno." (сверено по гравюре img/cartm32.jpg; совпадает с полем caption в entries.json)

### cartm33 (`cartm33-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Гекаты, трёхликой богини, называемой также Прозерпиной, супругой Плутона и царицей Преисподней, означающий три фазы Луны и её власть над стихийными вещами»."
- caption_en (текущий текст в переводе): "“The image of Hecate, the triform goddess, also called Proserpina, wife of Pluto and queen of the Underworld, signifying the three aspects of the Moon, and lunar power over elemental things.”"
- caption_fr (текущий текст в переводе): "« L'image d'Hécate, déesse triforme, aussi appelée Proserpine, épouse de Pluton et reine des Enfers, signifiant les trois aspects de la Lune, et le pouvoir lunaire sur les choses élémentaires. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Hecate dea triforme detta anco Proserpina moglie di Plutone reina dell'Inferno significante li tre aspetti della Luna, & la potenza lunare nelle cose elementari." (сверено по гравюре img/cartm33.jpg; совпадает с полем caption в entries.json)

### cartm34 (`cartm34-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Изваяние Луны, означающее, что Луна получает свой свет от Солнца и не имеет в себе никакого собственного света, но, напротив, является тёмным и помрачённым телом, сделанным сияющим Солнцем, которое означено головой ястреба»."
- caption_en (текущий текст в переводе): "“The likeness of the Moon, signifying that the Moon receives its light from the Sun and has no light of its own, but rather is a dark and shadowed body made to shine by the Sun, signified by the hawk's head.”"
- caption_fr (текущий текст в переводе): "« Le simulacre de la Lune, signifiant que la Lune reçoit sa lumière du Soleil et n'a en elle-même aucune lumière, mais est au contraire un corps obscur et assombri, rendu brillant par le Soleil, signifié par la tête d'épervier. »"
- caption_source: engraving
- caption_orig (с гравюры): "Simulacro della Luna significante la Luna riceuer il suo lume dal Sole & non hauer in se luce alcuna, anzi esser corpo oscuro & ottenebrato fatto risplendente dal Sole significato dal capo di sparauiero." (сверено по гравюре img/cartm34.jpg; совпадает с полем caption в entries.json)

### cartm35 (`cartm35-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ богини Природы, вся покрытая грудями, — чтобы показать, что вселенная получает питание от её сокрытой силы»."
- caption_en (текущий текст в переводе): "“The image of the goddess Nature, all covered with breasts, to show that the universe takes nourishment from her hidden power.”"
- caption_fr (текущий текст в переводе): "« L'image de la déesse Nature, toute couverte de seins, pour montrer que l'univers tire sa nourriture de sa vertu cachée. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della Dea Natura tutta piena di poppe, per mostrare, che l'vniuerso piglia nutrimento dalla virtù occulta della medesima." (сверено по гравюре img/cartm35.jpg; совпадает с полем caption в entries.json)

### cartm36 (`cartm36-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Исиды, египетской богини, отождествляемой с Луной, почитаемой богиней мореплавателей; у греков она звалась Ио, превращённая Юпитером в корову после того, как была обесчещена, а затем, вернув свой истинный облик, бежала морем в Египет, где и была почитаема теми народами за полученные от неё благодеяния»."
- caption_en (текущий текст в переводе): "“The image of Isis, the Egyptian goddess, who is the Moon held to be the goddess of Sailors; among the Greeks she was Io, transformed by Jove into a cow after having been violated, and, having returned to her own form, fled by sea to Egypt, where she was worshipped by those peoples for the benefits received.”"
- caption_fr (текущий текст в переводе): "« L'image d'Isis, déesse égyptienne, qui est la Lune tenue pour la déesse des Navigateurs ; chez les Grecs elle fut Io, transformée par Jupiter en vache après avoir été violée, et, revenue à sa propre forme, s'enfuit par mer en Égypte, où elle fut adorée par ces peuples pour les bienfaits reçus. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Iside Dea Egittia, che è la Luna tenuta la Dea de Nauiganti, & fù Io apo Greci la quale transformata in vacca dà Gioue essendo stata stuprata, & ritornata nella sua propria forma fuggì per mare in Egitto, & quiui fù da quelli popoli adorata per benefitij ricevuti." (сверено по гравюре img/cartm36.jpg; совпадает с полем caption в entries.json)

### cartm37 (`cartm37-1`, поля: RU/EN/FR)

- Позиция: конец (отдельный абзац)
- caption_ru (текущий текст в переводе): "«Образ Исиды, богини египтян, отождествляемой с Луной, с предметами в руках, обозначающими природу Нила и Египта, лунные затмения и иные её воздействия как на воды, так и на стихии»."
- caption_en (текущий текст в переводе): "“The image of Isis, goddess of the Egyptians, who is the Moon, with implements in her hands denoting the nature of the Nile and of Egypt, lunar Eclipses, and her other effects both upon the waters and upon the elements.”"
- caption_fr (текущий текст в переводе): "« L'image d'Isis, déesse des Égyptiens, qui est la Lune, avec des instruments dans les mains désignant la nature du Nil et de l'Égypte, les Éclipses lunaires, et ses autres effets tant sur les eaux que sur les éléments. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Iside dea de gli Egitij, che è la Luna, con arnesi in mano denotanti la natura del Nilo & dell'Egitto, gl'Ecclissi lunari, & altri effetti suoi si nelle acque, come nelle cose elementari." (сверено по гравюре img/cartm37.jpg; совпадает с полем caption в entries.json)

### cartm38 (`cartm38-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ бога-творца египтян и Юпитера, бога богов древних язычников, означающих природу Божества, Его провидение, благость, общение [с миром] и правление всеми вещами»."
- caption_en (текущий текст в переводе): "“The image of the creator-god of the Egyptians, and of Jove, god of the gods of the ancient pagans, denoting the nature of God, and His providence, goodness, communication, and government of all things.”"
- caption_fr (текущий текст в переводе): "« L'image du dieu créateur des Égyptiens, et de Jupiter, dieu des dieux des anciens païens, indiquant la nature de Dieu, et sa providence, sa bonté, sa communication et son gouvernement de toutes choses. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine del Dio creatore de gli Egittij, & di Gioue dio delli dei de gli antichi etnici, che dinotano la natura di Dio, & la sua prouidenza, bontà, communicatione, & gouerno di tutte le cose." (сверено по гравюре img/cartm38.jpg; совпадает с полем caption в entries.json)

### cartm41 (`cartm41-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Верности (Веры), означенной богом Фидием, почитавшимся в древности. Истина изображена здесь как Мать, Честь — как Отец, Любовь — как связующее звено»."
- caption_en (текущий текст в переводе): "“The image of Faith, signified by the god Fidius, worshipped in ancient times. Truth is represented here as the Mother, Honour as the Father, Love as the bond between them.”"
- caption_fr (текущий текст в переводе): "« L'image de la Foi, signifiée par le dieu Fidius, adoré dans l'Antiquité. La Vérité est représentée ici comme la Mère, l'Honneur comme le Père, l'Amour comme le lien entre eux. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della Fede significata per il Dio Fidio adorato anticamente. La Verità è rappresentata quì come Madre, l'Honore come Padre, l'Amore come legame." (сверено по гравюре img/cartm41.jpg; совпадает с полем caption в entries.json)

### cartm44 (`cartm44-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Юпитера с молнией и копьём, чтобы показать стойкость правления Божественного Провидения, а вместе с тем и скорую кару за злые деяния нечестивых»."
- caption_en (текущий текст в переводе): "“The image of Jove with the Thunderbolt and the Spear, to show the stability of the government of divine Providence, and together with it the swift punishment it metes out to the wicked deeds of the sinful.”"
- caption_fr (текущий текст в переводе): "« L'image de Jupiter avec la Foudre et la Lance, pour montrer la stabilité du gouvernement de la divine Providence, et en même temps le châtiment rapide qu'elle inflige aux œuvres mauvaises des méchants. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Gioue co'l Fulmine, & con l'Hasta per mostrare la Stabilità del Gouerno della diuina Prouidenza; & insieme il pronto castigo della medesima all'opre maluagie de' tristi." (сверено по гравюре img/cartm44.jpg; совпадает с полем caption в entries.json)

### cartm45 (`cartm45-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ громовержца Юпитера, подателя дождей и туч; и образ Юпитера Лабрадея лидийского, означающий, что Бог готов карать злодеев, а также являющий Божественное провидение»."
- caption_en (текущий текст в переводе): "“The image of thundering Jove, bringer of rains and storm-clouds; and the image of Jove Labradeus of the Lydians, signifying that God is ready to punish evildoers, and showing divine providence.”"
- caption_fr (текущий текст в переводе): "« L'image de Jupiter foudroyant, dispensateur des pluies et des nuages d'orage ; et l'image de Jupiter Labradeus des Lydiens, signifiant que Dieu est prêt à châtier les malfaiteurs, et manifestant la providence divine. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Gioue folgorante apportator di pioggie, & nembi; & l'imagine di Gioue Labradeo di Lidi, significante esser Iddio apparecchiato à castigare li malfattori, & la prouidenza diuina." (сверено по гравюре img/cartm45.jpg; совпадает с полем caption в entries.json)

### cartm46 (`cartm46-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ оракула Юпитера Аммона у троглодитов, означающий тёмность и ничтожность вещей мирских, и что надлежит взирать и возвышаться остротой разума до высоты вещей божественных»."
- caption_en (текущий текст в переводе): "“The image of the oracle of Jove Hammon of the Troglodytes, signifying the obscurity and lowliness of worldly things, and that one must look, and rise with sharpness of intellect, to the height of divine things.”"
- caption_fr (текущий текст в переводе): "« L'image de l'oracle de Jupiter Hammon des Troglodytes, signifiant l'obscurité et la bassesse des choses du monde, et qu'il faut regarder et s'élever, par l'acuité de l'intellect, jusqu'à la hauteur des choses divines. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine dell'oracolo di Gioue Hammonio de Trogloditi significante l'oscurità, & viltà delle cose mondane, & che bisogna riguardare, & inalzarsi con l'acutezza dell'intelletto all'altezza delle diuine." (сверено по гравюре img/cartm46.jpg; совпадает с полем caption в entries.json)

### cartm47 (`cartm47-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Юпитера Аммона у аркадцев и египтян, с дубом и бараном, посвящёнными ему, означающими, что Бог есть источник жизни и податель пропитания, а также двусмысленность ответов упомянутого оракула Аммона»."
- caption_en (текущий текст в переводе): "“The image of Jove Hammon of the Arcadians and Egyptians, with the oak and the ram sacred to him, signifying that God is the author of life and sustainer of living, and also the ambiguous answers of the said oracle of Hammon.”"
- caption_fr (текущий текст в переводе): "« L'image de Jupiter Hammon des Arcadiens et des Égyptiens, avec le chêne et le bélier qui lui sont sacrés, signifiant que Dieu est l'auteur de la vie et le soutien de la subsistance, ainsi que le caractère ambigu des réponses dudit oracle d'Hammon. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Gioue Hammonio de gli Arcadi, & de gli Egittij, & della quercia, & del montone à lui sacrati, significanti Iddio esser auttore della vita & mantenitore del viuere, & delle risposte dubie del detto oracolo Hammonio." (сверено по гравюре img/cartm47.jpg; совпадает с полем caption в entries.json)

### cart5 (`cart5-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образ Юноны Люцины и Сирийской богини из Гиераполя в Ассирии, которая есть одна и та же с Юноной, и птиц, ей посвящённых, означающих, что Юнона — царица Неба, владычица воздуха, госпожа царств и богатств. Её же понимали и как Добродетель."
- caption_en (текущий текст в переводе): "Image of Juno Lucina, and of the Syrian Goddess of Hierapolis in Assyria, who is one and the same as Juno, and of the birds sacred to her, signifying that Juno is queen of Heaven, ruler of the air, mistress of kingdoms and of riches. She was also understood as Virtue."
- caption_fr (текущий текст в переводе): "Image de Junon Lucine, et de la Déesse Syrienne d'Hiérapolis en Assyrie, qui n'est qu'une seule et même chose avec Junon ; et des oiseaux qui lui sont consacrés, signifiant que Junon est reine du Ciel, maîtresse de l'air, souveraine des royaumes et des richesses. On la comprenait aussi comme la Vertu."
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Giunone Lucina, & della Dea Siria di Hieropoli nell'Assiria, che è vn'istessa con Giunone, & delli vccelli à lei sacrati significanti Giunone esser regina del Cielo, dominatrice dell'aria signora de regni, & delle ricchezze. Questa fu intesa ancora per la virtù." (сверено по гравюре img/cart5.jpg; совпадает с полем caption в entries.json)

### cartm48 (`cartm48-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Ириды, вестницы Юноны, дочери Тавманта, то есть Удивления: символ того, что богатства, подобно её цветам, вызывают изумление у глупцов и быстро исчезают»."
- caption_en (текущий текст в переводе): "“The image of Iris, messenger of Juno, daughter of Thaumas, that is, of Wonder: a symbol, through her colours, of riches, which are a marvel to fools and soon vanish.”"
- caption_fr (текущий текст в переводе): "« L'image d'Iris, messagère de Junon, fille de Thaumas, c'est-à-dire de l'Émerveillement : symbole, par ses couleurs, des richesses, qui émerveillent les sots et disparaissent bien vite. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Iride messaggiera di Giunone, figliuola di Thaumante, o sia della ammiratione: simbolo per i suoi colori delle ricchezze, che sono di marauiglia à sciocchi, & presto spariscono." (сверено по гравюре img/cartm48.jpg; совпадает с полем caption в entries.json)

### cartm50 (`cartm50-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Кастора и Поллукса, богов мореплавателей, означающих, что при их появлении наступает штиль; они же покровители коней, будучи звёздами стремительнейшего хода, и один из двенадцати знаков Зодиака, именуемый двумя близнецами, сыновьями Юпитера и Леды»."
- caption_en (текущий текст в переводе): "“The image of Castor and Pollux, gods of Sailors, signifying that calm weather appears at their rising; they are also protectors of Horses, being stars most swift in their course, and one of the twelve signs of the Zodiac, called the two twins, sons of Jove and Leda.”"
- caption_fr (текущий текст в переводе): "« L'image de Castor et Pollux, dieux des Navigateurs, signifiant que le calme apparaît à leur lever ; ils sont aussi protecteurs des Chevaux, étant des étoiles d'une course très rapide, et l'un des douze signes du Zodiaque, appelés les deux jumeaux, fils de Jupiter et de Léda. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Castore è Polluce, dei de Nauiganti, significanti al lor apparire bonaccia, quali sono anco protettori de Caualli, essendo stelle velocissime nel corso loro, & vno de dodici segni del Zodiaco, detti i duoi gemelli figliuoli di Gioue, & di Leda." (сверено по гравюре img/cartm50.jpg; совпадает с полем caption в entries.json)

### cartm51 (`cartm51-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Юноны Аргивской, Юноны-Спасительницы в Лавинии и Юноны, царицы богов, владычицы воздуха, мачехи и ненавистницы Вакха и Геркулеса, очистительницы и освятительницы вещей — что есть истинное действие воздуха»."
- caption_en (текущий текст в переводе): "“The image of Argive Juno, of Juno the Saviour at Lavinium, and of Juno Queen of the Gods, patroness of the air, stepmother and hater of Bacchus and of Hercules, purifier and cleanser of things — the proper effect of the air.”"
- caption_fr (текущий текст в переводе): "« L'image de Junon Argienne, de Junon Sauveuse à Lavinium, et de Junon Reine des dieux, patronne de l'air, marâtre et ennemie de Bacchus et d'Hercule, purificatrice et épuratrice des choses — effet propre de l'air. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Giunone Argiua, di Giunone saluatrice in Lauinio, & di Giunone regina de gli Dei, dell'aria patrona, matrigna, & odiatrice di Bacco, & di Hercole, purgatrice, & mondatrice delle cose proprio effetto dell'aria." (сверено по гравюре img/cartm51.jpg; совпадает с полем caption в entries.json)

### cartm53 (`cartm53-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Гименея, бога брака и свадеб, с изображениями нескольких детей, собирающих рассыпанные орехи, означающий вечность и нерасторжимость брака, девичий румянец, и что тому, кто принимает на себя заботу о доме, надлежит оставить детские забавы»."
- caption_en (текущий текст в переводе): "“The image of Hymen, god of marriage and weddings, with the images of some children gathering scattered nuts, signifying the perpetuity and indissolubility of marriage, virginal blushing, and that whoever takes on the charge of a household must leave behind childish things.”"
- caption_fr (текущий текст в переводе): "« L'image d'Hyménée, dieu du mariage et des noces, avec les images de quelques enfants ramassant des noix éparpillées, signifiant la perpétuité et l'indissolubilité du mariage, la rougeur virginale, et que celui qui prend la charge d'une maison doit délaisser les choses enfantines. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Himeneo dio del matrimonio, & delle nozze, con l'imagini d'alcuni fanciulli, che raccolgono noci sparse, significante la perpetuità, & indissolubilità del matrimonio, il rossor virginale, & che bisogna à chi ha carico di casa lasciar le cose fanciullesche." (сверено по гравюре img/cartm53.jpg; совпадает с полем caption в entries.json)

### cart6 (`cart6-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образ богини Опы, также называемой Берекинфией, матери богов, толкуемой как Земля; и животных, и деревьев, ей посвящённых, воспевающих плодоносное возделывание земли, и что всякий, сколь бы он ни был велик, подвластен природе. Есть здесь также образ её жрецов, именуемых Корибантами, показывающий, что каждый должен усердно упражняться в добродетели и не пребывать в праздности."
- caption_en (текущий текст в переводе): "Image of the goddess Ops, also called Berecynthia, mother of the gods, interpreted as the Earth; and of the animals and trees sacred to her, singing the fruitful cultivation of the soil, and that every man, however great, is subject to nature. There is also here the image of her priests, called Corybantes, showing that everyone must exercise themselves virtuously, and not remain idle."
- caption_fr (текущий текст в переводе): "Image de la déesse Ops, dite aussi Bérécynthie, mère des dieux, interprétée comme la Terre ; et des animaux et des arbres qui lui sont consacrés, chantant la culture fructueuse du sol, et que chacun, si grand soit-il, est soumis à la nature. Il y a ici aussi l'image de ses prêtres, appelés Corybantes, montrant que chacun doit s'exercer vertueusement et ne pas demeurer oisif."
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della dea Ope detta anco Berecinthia madre de gli Dei, interpretata per la Terra, & gli animali, & alberi à lei sacrati significanti la fruttuosa coltiuatione del terreno, & ogni vno esser sottoposto alla natura benche grande. Vi è anco l'imagine de suoi Sacerdoti detti Coribanti, che dimostrano che ogn'vno debba essercitarsi virtuosamente e non stare otioso." (сверено по гравюре img/cart6.jpg; в поле caption потерян перенос «signifi-canti» («sacrati, canti» → «sacrati significanti»))

### cartm54 (`cartm54-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Изваяние богини Кибелы, то есть Земли, и колесница, на которой её провозили в процессиях, влекомая двумя коровами, означающими плодородие земли и ту пользу, что проистекает от неё для смертных»."
- caption_en (текущий текст в переводе): "“The likeness of the goddess Cybele, who is the earth, and the chariot on which she was led in procession, drawn by two Cows denoting the fertility of the earth, and the benefit that comes from it to mortals.”"
- caption_fr (текущий текст в переводе): "« Le simulacre de la déesse Cybèle, qui est la terre, et le char sur lequel elle était conduite en procession, tiré par deux Vaches indiquant la fertilité de la terre, et l'utilité qui en revient aux mortels. »"
- caption_source: engraving
- caption_orig (с гравюры): "Simulacro della Dea Cibele, che è la terra, & il carro doue era condotto processionalmente, tirato da due Vacche dinotanti la fertilità della terra, & la vtilità che da quella ne viene à mortali." (сверено по гравюре img/cartm54.jpg; совпадает с полем caption в entries.json)

### cartm55 (`cartm55-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Храм в Риме богини Весты, матери богов, и Весты, богини огня и девственности, означающей тот животворящий жар, что даёт жизнь всем вещам, то есть невидимую божественную душу, с двумя весталками-хранительницами, следящими, чтобы вечный огонь не угас»."
- caption_en (текущий текст в переводе): "“The temple in Rome of the goddess Vesta, mother of the Gods, and of Vesta, goddess of fire and of Virginity, signifying that life-giving heat which gives life to things, that is, the invisible divine spirit, with the two Vestal guardians, so that the perpetual fire should not be extinguished.”"
- caption_fr (текущий текст в переводе): "« Le temple à Rome de la déesse Vesta, mère des Dieux, et de Vesta, déesse du feu et de la Virginité, signifiant cette chaleur vivifiante qui donne vie aux choses, c'est-à-dire l'âme divine invisible, avec les deux Vestales gardiennes, afin que le feu perpétuel ne s'éteigne pas. »"
- caption_source: engraving
- caption_orig (с гравюры): "Tempio in Roma della Dea Vesta madre de gli Dei, & di Vesta dea del fuoco, & della Virginità significante quel viuifico calore, che da vita alle cose, ouero l'animo diuino inuisibile, con le due Vestali custoditrici, che'l fuoco perpetuo non si estinguesse." (сверено по гравюре img/cartm55.jpg; совпадает с полем caption в entries.json)

### cartm56 (`cartm56-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Цереры Сицилийской, изобретательницы и богини злаков, и её колесницы, влекомой драконами, означающей плодородную землю и её возделывание, поскольку злаки не слишком высоко поднимаются и кажутся почти стелющимися, а также означает извилистые борозды вспаханной земли»."
- caption_en (текущий текст в переводе): "“The image of Sicilian Ceres, inventress and goddess of grain, and of her chariot drawn by Dragons, signifying the fruitful earth and its cultivation, since the grain does not rise very high and seems almost to creep, and also denoting the winding furrows of the ploughed earth.”"
- caption_fr (текущий текст в переводе): "« L'image de Cérès de Sicile, inventrice et déesse du blé, et de son char tiré par des Dragons, signifiant la terre fertile et sa culture, le blé ne s'élevant guère et semblant presque ramper, et indiquant aussi les sillons sinueux de la terre labourée. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Cerere Siciliana inuentrice, & dea delle biade, & del suo carro tirato da Draghi significante la terra fruttifera, & la sua coltura, essendo che le biade non molto s'inalzino e parino quasi serpere, & dinota ancora li torti solchi della terra arata." (сверено по гравюре img/cartm56.jpg; совпадает с полем caption в entries.json)

### cartm58 (`cartm58-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Помоны, богини садов и супруги Вертумна: с серпом в руке для срезания плодов, которым, как считалось, она дарует зрелость; рядом с ней — пёс, страж садов»."
- caption_en (текущий текст в переводе): "“The image of Pomona, goddess of Orchards, and wife of Vertumnus: with a Sickle in her hand for cutting Fruits, to which she was believed to give ripeness. With a Dog nearby, guardian of Gardens.”"
- caption_fr (текущий текст в переводе): "« L'image de Pomone, déesse des Vergers, et épouse de Vertumne : avec une Faucille à la main pour couper les Fruits, auxquels on la croyait donner la maturité. Avec, auprès d'elle, un Chien, gardien des Jardins. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Pomona dea de gl'Horti, & moglie di Vertunno: con la Falce in mano per tagliare i Frutti, à quali essa era creduta dare la maturità. col Cane appresso custode de' Giardini." (сверено по гравюре img/cartm58.jpg; совпадает с полем caption в entries.json)

### cartm59 (`cartm59-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ богини Прозерпины, дочери Цереры, понимаемой как злаки, и образ богини Боны, понимаемой как земля и та сила, что сохраняет рассеянные семена, со змеем и гусыней, посвящёнными названным богиням»."
- caption_en (текущий текст в переводе): "“The image of the goddess Proserpina, daughter of Ceres, understood as the grain, and the image of the goddess Bona, understood as the earth and as that power which preserves the scattered seeds, with the serpent and the goose sacred to the said goddesses.”"
- caption_fr (текущий текст в переводе): "« L'image de la déesse Proserpine, fille de Cérès, entendue comme le blé, et l'image de la déesse Bona, entendue comme la terre et comme cette vertu qui conserve les semences éparses, avec le serpent et l'oie qui sont sacrés à ces déesses. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della Dea Proserpina figliuola di Cerere intesa per le biade, & imagine della dea Bona intesa per la terra, & per quella virtù che conserua li sparsi semi, co'l serpente & oca alle dette sacrati." (сверено по гравюре img/cartm59.jpg; совпадает с полем caption в entries.json)

### cartm63 (`cartm63-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Сциллы, сицилийской скалы, называемой поэтами жесточайшим морским чудовищем, означающей опасности, которым подвержены мореплаватели: бури, скалы, мели, корсары и тысячи тяжких и смертельных бед»."
- caption_en (текущий текст в переводе): "“The image of Scylla, the Sicilian rock, called by the Poets a most savage sea monster, signifying the dangers to which sailors are exposed: storms, rocks, shoals, corsairs, and a thousand grave and deadly ills.”"
- caption_fr (текущий текст в переводе): "« L'image de Scylla, l'écueil sicilien, appelé par les Poètes un très cruel monstre marin, signifiant les dangers auxquels sont exposés les navigateurs : tempêtes, écueils, bas-fonds, corsaires, et mille maux graves et mortels. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Scilla scoglio Siciliano detto da Poeti atrocissimo mostro marino, & significa li pericoli à quali sono sottoposti li nauiganti; di fortune, scogli, secche, corsari, & mille graui, & mortali mali." (сверено по гравюре img/cartm63.jpg; совпадает с полем caption в entries.json)

### cartm70 (`cartm70-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образы Алекто, Тисифоны и Мегеры, трёх адских фурий, карательниц зла, а вместе и его причинительниц, понимаемых как три страсти души — Гнев, Алчность и Похоть, с чёрной овцой, им посвящённой, и горлицами — знаком печали»."
- caption_en (текущий текст в переводе): "“The images of Alecto, Tisiphone, and Megaera, three infernal Furies, punishers of evil, and also bringers of it, understood as three passions of the soul — Wrath, Avarice, and Lust — with the black sheep sacred to them, and the turtledoves, a sign of sorrow.”"
- caption_fr (текущий текст в переводе): "« Les images d'Alecto, Tisiphone et Mégère, trois Furies infernales, punisseuses du mal, et aussi pourvoyeuses de celui-ci, entendues comme trois passions de l'âme — la Colère, l'Avarice et la Luxure — avec la brebis noire qui leur est sacrée, et les tourterelles, signe de tristesse. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagini di Aletto, Tessifone, & Megera tre furie infernali punitrici del male, & di quello anco apportatrici, intese per tre passioni dell'animo, Ira, Auaritia, & Libidine, con la pecora nera à loro sacrata, & con le tortore segno di mestitia." (сверено по гравюре img/cartm70.jpg; совпадает с полем caption в entries.json)

### cartm75 (`cartm75-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образы трёх Парок, найденные, согласно Пьетро Апиано, в Штирии в 1500 году, толкуемые так: Клото — воззвание, то есть начало жизни; Лахесис — жребий, то есть обычай и путь, или течение жизни; Атропос — без порядка, то есть необходимость и разнообразие смерти, общей для всех вещей мира»."
- caption_en (текущий текст в переводе): "“The images of the three Fates found, according to Peter Apian, in Styria in 1500, interpreted thus: Clotho, evocation, that is, the beginning of life; Lachesis, lot, that is, the custom and path, or course of life; Atropos, without order, that is, the necessity and variety of death common to all things of the world.”"
- caption_fr (текущий текст в переводе): "« Les images des trois Parques trouvées, selon Pierre Apian, en Styrie en 1500, interprétées ainsi : Clotho, l'évocation, c'est-à-dire le commencement de la vie ; Lachésis, le sort, c'est-à-dire l'usage et le chemin, ou le cours de la vie ; Atropos, sans ordre, c'est-à-dire la nécessité et la variété de la mort, commune à toutes les choses du monde. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagini delle tre Parche trouate secondo Pietro Appiano in Stiria del 1500. interpretate Cloto euocatione cioè principio di vita, Lachesi sorte cioè vso, e camino, o corso di vita, Atropo senza ordine, cioè necessità & varietà della morte à tutte le cose del mondo comune." (сверено по гравюре img/cartm75.jpg; совпадает с полем caption в entries.json)

### cartm76 (`cartm76-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Харона, адского перевозчика на чёрной реке Ахеронт, с его ладьёй и веслом, понимаемого как время, пожирающее жизнь, разрушителя всех вещей; прочие же его свойства означают нищету и злосчастие жизни человеческой»."
- caption_en (текущий текст в переводе): "“The image of Charon, infernal ferryman on the black river Acheron, with his boat and oar, understood as time, the consumer of life, destroyer of all things; his other effects also denote the misery and unhappiness of human life.”"
- caption_fr (текущий текст в переводе): "« L'image de Charon, nocher infernal sur le fleuve noir de l'Achéron, avec sa barque et sa rame, entendu comme le temps, consumateur de la vie, destructeur de toutes choses ; ses autres effets indiquent aussi la misère et le malheur de la vie humaine. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Charonte nocchiero infernale nel fiume nero di Acheronte, con vna sua barca, & remo, inteso per il tempo consumatore della vita, distruggitore di tutte le cose, & altri effetti suoi dinota ancora la miseria, & infelicità della vita humana." (сверено по гравюре img/cartm76.jpg; совпадает с полем caption в entries.json)

### cartm78 (`cartm78-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образы Согласия и иероглифов, означающих Верность и Согласие, с образом Верности, означающим её сокровенность и чистоту, а также то, что благодаря Согласию умножаются изобилие вещей, народы и земледелие, с птицами — аистом и вороной, — посвящёнными Согласию и означающими те же следствия»."
- caption_en (текущий текст в переводе): "“The images of Concord, and of hieroglyphs denoting Faith and Concord, with the image of Faith, signifying her secrecy and purity, and that through Concord the abundance of things, peoples, and agriculture is multiplied, with the Stork and the Crow, birds sacred to concord, denoting the same effects.”"
- caption_fr (текущий текст в переводе): "« Les images de la Concorde, et des hiéroglyphes désignant la Foi et la Concorde, avec l'image de la Foi, signifiant son caractère secret et sa pureté, et que par la Concorde se multiplient l'abondance des choses, les peuples et l'agriculture, avec la Cigogne et la Corneille, oiseaux sacrés à la concorde, indiquant les mêmes effets. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagini della Concordia, & hieroglifici denotanti la Fede, & la Concordia. con la imagine della Fede, significanti la secretezza della medesima, & la sua purità, & che per la Concordia multiplica l'abondanza delle cose, le genti, & l'agricoltura, con gli vccelli Cicogna, & Cornice alla concordia sacrati, che dinotano l'istessi effetti." (сверено по гравюре img/cartm78.jpg; совпадает с полем caption в entries.json)

### cartm79 (`cartm79-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Меркурия, изобретателя Письменности, Музыки, Геометрии и благородных искусств, и образ Палестры, его дочери, богини борьбы, держащей на коленях ветвь оливы, поскольку борцы имели обычай умащаться маслом»."
- caption_en (текущий текст в переводе): "“The image of Mercury, inventor of Letters, Music, Geometry, and the liberal arts, and the image of Palaestra, his daughter, goddess of wrestling, who holds in her lap a branch of olive, it being the custom of wrestlers to anoint themselves with oil.”"
- caption_fr (текущий текст в переводе): "« L'image de Mercure, inventeur des Lettres, de la Musique, de la Géométrie et des arts libéraux, et l'image de Palestre, sa fille, déesse de la lutte, qui tient sur ses genoux une branche d'olivier, les lutteurs ayant coutume de s'oindre d'huile. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Mercurio inuentore delle Lettere, della Musica, della Geometria, & delle buone arti, & imagine di Palestra sua figliuola Dea della lotta, che tiene in grembo vn ramo di vliuo, essendo vso de lottatori di vngersi con olio." (сверено по гравюре img/cartm79.jpg; совпадает с полем caption в entries.json)

### cartm80 (`cartm80-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Статуи Меркурия, называемые Гермами, поскольку он был изобретателем всех благородных искусств, которые не боятся ударов времени или фортуны, и добродетельные люди не страшатся никакой им обиды; означают они также стойкость правдивой речи»."
- caption_en (текущий текст в переводе): "“Statues of Mercury, called Herms, he having been the inventor of all the liberal arts, which fear no blows of time or fortune, and virtuous men fear no injury to them; they also signify the steadfastness of truthful speech.”"
- caption_fr (текущий текст в переводе): "« Statues de Mercure, appelées Herms, celui-ci ayant été l'inventeur de tous les arts libéraux, qui ne craignent ni les coups du temps ni de la fortune, et les hommes vertueux ne craignent aucune offense qui leur soit faite ; elles signifient aussi la fermeté de la parole véridique. »"
- caption_source: engraving
- caption_orig (с гравюры): "Statue di Mercurio, dette Hermi, per esser lui stato l'inuentore di tutte le buone arti, quali non temono colpi di tempo ò di fortuna, & li virtuosi non temono niuna loro ingiuria. significano ancora la saldezza del parlar veridico." (сверено по гравюре img/cartm80.jpg; совпадает с полем caption в entries.json)

### cartm_night (`cartm_night-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образ Ночи, кормилицы Смерти и Сна, и образ Сна, брата и спутника Смерти; покой и сладостное подкрепление смертных. А рог означает отдых и многообразие сновидений."
- caption_en (текущий текст в переводе): "Image of Night, nurse of Death and of Sleep, and image of Sleep, brother and companion of Death; rest and sweet restoration of mortals. And the horn denotes repose and the variety of dreams."
- caption_fr (текущий текст в переводе): "Image de la Nuit, nourrice de la Mort et du Sommeil, et image du Sommeil, frère et compagnon de la Mort ; repos et doux réconfort des mortels. Et la corne signifie le repos et la diversité des songes."
- caption_source: engraving
- caption_orig (с гравюры): "Imagine della Notte nutrice della Morte, & del Sonno, & imagine del Sonno fratello & compagno della Morte; quiete & dolce ristoro de mortali. & il corno dinota il riposo, & varietà de' sogni." (сверено по гравюре img/cartm_night.jpg; совпадает с полем caption в entries.json)

### cartm_anubis (`cartm_anubis-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образ Анубиса, бога проницательности, стражи и верности, с крокодилом — животным Египта, земноводным и водным, с Аписом, Юпитером-Аммоном и иными таинственными изображениями."
- caption_en (текущий текст в переводе): "Image of Anubis, god of sagacity, guardianship, and fidelity, with the Crocodile, an animal of Egypt, both terrestrial and aquatic, with Apis, Jove Hammon, and other mysterious figures."
- caption_fr (текущий текст в переводе): "Image d'Anubis, dieu de la sagacité, de la garde et de la fidélité, avec le Crocodile, animal d'Égypte, terrestre et aquatique, avec Apis, Jupiter Hammon, et d'autres figures mystérieuses."
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Anubide Dio della Sagacità, Custodia, & Fideltà, con il Cocodrillo animale d'Egitto, terrestre, & acquatico, con Api, Gioue Hammone, & altre figure misteriose." (сверено по гравюре img/cartm_anubis.jpg; совпадает с полем caption в entries.json)

### cartm_hercgall (`cartm_hercgall-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образ Геркулеса, которого галлы почитали как бога красноречия и воинского искусства, а некоторые отождествляли его также с Меркурием; и этот образ означает силу и воинскую дисциплину, особенно в старых военачальниках и опытных ораторах."
- caption_en (текущий текст в переводе): "Image of Hercules, held by the Gauls as the God of eloquence and of military exercise, who was by some also held to be Mercury; and this image denotes strength and military discipline, especially in old Captains and seasoned orators."
- caption_fr (текущий текст в переводе): "Image d'Hercule, tenu par les Français (Gaulois) pour le Dieu de l'éloquence et de l'exercice militaire, et que certains tenaient aussi pour Mercure ; et cette image signifie la force et la discipline militaire, surtout chez les vieux Capitaines et les orateurs consommés."
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Hercole appo Francesi da loro tenuto Dio della eloquenza, & dell'essercitio, qual fù da alcuni tenuto anco per Mercurio & questa imagine dinota a forza, & disciplina militare, massime in vecchi Capitani, & consumati oratori." (сверено по гравюре img/cartm_hercgall.jpg; совпадает с полем caption в entries.json)

### cartm81 (`cartm81-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ вооружённого Геркулеса, Геркулеса-едока и пьяницы, а также птицы Лысухи, посвящённой ему за её прожорливость, и жертвенника, называемого «ярмом быка», знака его благодарной природы и благости; увенчанного тополем, поскольку он также принимается за Время, которое всё поглощает и уничтожает»."
- caption_en (текущий текст в переводе): "“The image of Hercules armed, of Hercules the eater and drinker, and of the Coot bird sacred to him for its voracity, and of the altar sacred to him called the yoke of the ox, a sign of his grateful nature and benignity; crowned then with the poplar tree, being also taken for Time, which devours and consumes all things.”"
- caption_fr (текущий текст в переводе): "« L'image d'Hercule armé, d'Hercule mangeur et buveur, et de l'oiseau Foulque qui lui est sacré pour sa voracité, et de l'autel qui lui est sacré appelé le joug du bœuf, signe de sa nature reconnaissante et de sa bonté ; couronné ensuite du peuplier, étant aussi pris pour le Temps, qui dévore et consume toutes choses. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Ercole armato, d'Hercole mangiatore, & beuitore, & dell'vccello Felica à lui sacrato per la sua voracità, & dell'altare sacratogli detto il giogo del bue, segno della sua grata natura, & benignità; coronato poi dell'albero pioppa, essendo tolto anco per il tempo che tutto diuora & consuma." (сверено по гравюре img/cartm81.jpg; в поле caption «Folica»; на гравюре напечатано «Felica»)

### cartm82 (`cartm82-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Аполлона и Геркулеса, спорящих друг с другом из-за треножника, а также Латоны и Дианы, примиряющих Аполлона, и Минервы, примиряющей Геркулеса: означающих гнев Геркулеса на оракул Аполлона за то, что не получил от него ответа, смягчившийся же после того, как ответ был получен; треножник же есть знак чести, уважения, героической доблести и истины»."
- caption_en (текущий текст в переводе): "“The image of Apollo and Hercules, contending together over the Tripod, and of Latona and Diana making peace with Apollo, and of Minerva making peace with Hercules: signifying the wrath of Hercules at Apollo's oracle for not having received an answer from it, afterward mitigated once he had received one; and the Tripod is a sign of honour, of esteem, of heroic virtue, and of truth.”"
- caption_fr (текущий текст в переводе): "« L'image d'Apollon et d'Hercule, se disputant ensemble le Trépied, et de Latone et Diane apaisant Apollon, et de Minerve apaisant Hercule : signifiant la colère d'Hercule contre l'oracle d'Apollon pour n'en avoir pas reçu de réponse, apaisée ensuite une fois la réponse obtenue ; et le Trépied est signe d'honneur, d'estime, de vertu héroïque et de vérité. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine d'Apolline, & d'Hercole, che contendono insieme del Tripode, & di Latona, & Diana che pacificano Apollo, & di Minerua che pacifica Hercole: significanti l'ira di Hercole con l'oracolo d'Apolline per non haverne hauuta risposta, mitigata poi hauendola hauuta, & il Tripode è segno d'honore, di stima, e virtù heroica, & di verità." (сверено по гравюре img/cartm82.jpg; совпадает с полем caption в entries.json)

### cart10 (`cart10-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Образы Меркурия и Минервы — тот бог Красноречия, эта — Благоразумия, изобретательница добрых искусств; означают, что Красноречие и Благоразумие необходимо должны быть соединены вместе, если слова должны приносить пользу делам человеческим."
- caption_en (текущий текст в переводе): "Images of Mercury and of Minerva — he the god of Eloquence, she of Prudence, inventress of the good arts; signifying that Eloquence and Prudence must needs be joined together, if words are to be of benefit to human actions."
- caption_fr (текущий текст в переводе): "Images de Mercure et de Minerve — lui dieu de l'Éloquence, elle de la Prudence, inventrice des bons arts — signifiant que l'Éloquence et la Prudence doivent nécessairement être unies, si les paroles doivent servir aux actions humaines."
- caption_source: engraving
- caption_orig (с гравюры): "Imagini di Mercurio, & di Minerua, quello dio della Eloquenza, questa della Prudenza, & delle arti buone inuentrice, dinotante esser necessario la Eloquenza, & la Prudenza esser congionte insieme, se deuono giouar le parole alle operationi humane." (сверено по гравюре img/cart10.jpg; совпадает с полем caption в entries.json)

### cartm_virtuhonore (`cartm_virtuhonore-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Добродетели и Чести, взирающих друг на друга, так изваянных на медали Вителлия, означающее, что от добродетели и добродетельных деяний происходит честь, а с честью — изобилие всего и всякое человеческое счастье."
- caption_en (текущий текст в переводе): "Image of Virtue and Honor, gazing upon each other thus carved on a medal of Vitellius, denoting that from virtue and virtuous actions comes honor, and with honor the abundance of all things, and every human felicity."
- caption_fr (текущий текст в переводе): "Image de la Vertu et de l'Honneur, se regardant l'un l'autre ainsi sculptés sur une médaille de Vitellius, dénotant que de la vertu et des actions vertueuses provient l'honneur, et qu'avec l'honneur vient l'abondance de toutes choses, et toute félicité humaine."
- caption_source: text
- caption_orig (из text_it): "Imagine della Virtù, & dell'Honore, che si risguardano così scolpiti in vna medaglia di Vitellio, dinotante dalla virtù & attioni virtuose prouenir l'honore, & con l'honore l'abondanza del tutto, & ogni humana felicità."

### cartm_volupia (`cartm_volupia-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение богини Волупии, богини наслаждений, попирающей богиню Добродетель под ногами своими, означающее презренную и позорную жизнь преданных наслаждениям, во всём презирающих добродетель, предавшихся лишь всякого рода пороку, словно существа неразумные."
- caption_en (текущий текст в переводе): "Image of the Goddess Volupia, Goddess of pleasures, trampling the Goddess Virtue beneath her feet, denoting the detestable and infamous life of those given over to pleasures, in every way despisers of virtue, given only to every sort of vice, as though irrational creatures."
- caption_fr (текущий текст в переводе): "Images de la Déesse Volupia, Déesse des plaisirs, foulant aux pieds la Déesse Vertu, dénotant la vie détestable et infâme de ceux adonnés aux plaisirs, en tout contempteurs de la vertu, livrés seulement à toute sorte de vice, comme des êtres presque irrationnels."
- caption_source: text
- caption_orig (из text_it): "Imagini della Dea Volupia Dea de piaceri conculcante la Dea Virtù sotto li piedi suoi, denotante la detestanda, & infame vita de' dati à piaceri, in tutto spreggiatori della virtù, solo dati ad ogni sorte di vitio, quasi irrationali."

### cartm_angerona (`cartm_angerona-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_angerona.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_volcano (`cartm_volcano-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_volcano.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_marte (`cartm_marte-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Марса, бога войны, его колесницы, и Славы, его вестницы и предвозвестницы, которая говорит более, чем есть на самом деле. А под Марсом разумеется тот жар Солнца, что воспламеняет кровь и духи, делая людей склонными к гневу, войнам и неистовству."
- caption_en (текущий текст в переводе): "Image of Mars, God of war, of his chariot, and of Fame, his messenger and forerunner, who says more than is in fact true. And by Mars is understood that ardor of the Sun which kindles the blood and the spirits, making men prone thereafter to wrath, wars, and furies."
- caption_fr (текущий текст в переводе): "Image de Mars, Dieu de la guerre, de son char, et de la Renommée, sa messagère et avant-courrière, qui dit plus qu'il n'en est en effet. Et par Mars est entendue cette ardeur du Soleil, qui enflamme le sang et les esprits pour les rendre ensuite enclins aux colères, aux guerres, et aux fureurs."
- caption_source: text
- caption_orig (из text_it): "Imagine di Marte Dio della guerra, del suo carro, & della Fama sua messaggiera & anticipatrice, che più dice di quello è in effetto. Et per Marte vien inteso quell'ardor del Sole, che accende il sangue & li spiriti per farli poi facili alle ire, guerre, & furori."

### cartm_bacco (`cartm_bacco-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Вакха, означающее различные действия вина, коего он был изобретателем, а также и действия опьянения, каковые суть откровение сокрытых вещей, неистовство, похоть и тому подобное. Сей бог вместе с Геркулесом, оба фиванцы и сыновья Юпитера, славою превзошли всех древних."
- caption_en (текущий текст в переводе): "Image of Bacchus, signifying the various effects of wine, of which he was the inventor, and further the effects of drunkenness, which are the revealing of hidden things, fury, lust, and the like. He, together with Hercules, both Thebans and sons of Jove, surpassed all the ancients in glory."
- caption_fr (текущий текст в переводе): "Image de Bacchus, signifiant les divers effets du vin, dont il fut l'inventeur, et de plus les effets de l'ivresse, qui sont la révélation des choses cachées, la fureur, la luxure, et choses semblables. Celui-ci, avec Hercule, tous deux Thébains et fils de Jupiter, surpassèrent en gloire tous les anciens."
- caption_source: text
- caption_orig (из text_it): "Imagine di Bacco significante li varij effetti del vino del quale esso fù l'inuentore, & di più gli effetti della vbbriachezza, che sono riuelationi di cose occulte, furore, libidine, & simili. Questi con Hercole tutti due Thebani, & figlioli di Gioue, di gloria tutti gl'antichi superarono."

### cartm_como (`cartm_como-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Кома, бога пиршеств, согласно Филострату, означающее, что умеренные пиршества веселят людей и, пробуждая дух, делают их дерзновенными, тогда как, напротив, невоздержанная пища делает человека сонливым, непригодным и притупленным разумом, и слабым телом."
- caption_en (текущий текст в переводе): "Image of Comus, God of banquets, according to Philostratus, signifying that modest feasts cheer men and, awakening the spirits, make them bold, whereas, on the contrary, immoderate eating makes a man drowsy, inept, dull of wit, and weak of body."
- caption_fr (текущий текст в переводе): "Image de Comus, Dieu des banquets, selon Philostrate, signifiant que les banquets modérés réjouissent les hommes et, en éveillant les esprits, les rendent hardis, tandis qu'au contraire, la nourriture immodérée rend l'homme somnolent, inapte, l'esprit émoussé, et le corps faible."
- caption_source: text
- caption_orig (из text_it): "Imagine di Como Dio de Conuiuij, secondo Filostrato, significante, che li Conuiti modesti allegrano li huomini & sueglian do li spiriti li fanno diuenir arditi, & che all'incontro l'immoderato cibo fà l'huomo sonnolento, inetto, o tuso d'ingegno, & debole di corpo."

### cartm_baccopompa (`cartm_baccopompa-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения Вакха, и торжественного шествия, празднеств и обрядов вакхических, и одеяния Вакханок, или Менад, его спутниц, означающее, что жертвоприношения вакхические очищали души от вины, подобно тому как вино очищает их от мыслей."
- caption_en (текущий текст в переводе): "Images of Bacchus, and of the pomp, feasts, and bacchanalian ceremonies, and of the attire of the Bacchae, or Maenads, his followers, signifying that the bacchanalian sacrifices purged souls of guilt, just as wine purges them of thoughts."
- caption_fr (текущий текст в переводе): "Images de Bacchus, et de la pompe, des fêtes, et des cérémonies bachiques, et de l'habit des Bacchantes, ou Ménades, ses suivantes, signifiant que les sacrifices bachiques purgeaient les âmes des fautes, comme le vin les purge des pensées."
- caption_source: text
- caption_orig (из text_it): "Imagini di Bacco, & della pompa, feste, & cerimonie bacchanali, & l'habito delle Bacche, o Menadi sue seguaci, significante che li sacrificij bacchanali purgauan gl'animi dalle colpe, come il vino li purga da pensieri."

### cartm_tifone (`cartm_tifone-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения Тифона, брата Осириса, и Гора, сына Осирисова, каковой есть Вакх у греков, и который превозмог названного Тифона, хотя и обращённого в Крокодила; с Бегемотом и Ястребом, иероглифами, означающими Доблесть, сражающуюся и сопротивляющуюся злу, и в конце его превозмогающую и попирающую."
- caption_en (текущий текст в переводе): "Images of Typhon, brother of Osiris, and of Horus, son of Osiris, who is Bacchus among the Greeks, who overcame the said Typhon, even though transformed into a Crocodile; with the Hippopotamus, and Sparrowhawk, hieroglyphs denoting Virtue fighting, and resisting evil, and in the end overcoming and trampling it."
- caption_fr (текущий текст в переводе): "Images de Typhon, frère d'Osiris, et d'Horus, fils d'Osiris, qui est Bacchus chez les Grecs, lequel surmonta ledit Typhon, bien que changé en Crocodile ; avec l'Hippopotame, et l'Épervier, hiéroglyphes dénotant la Vertu combattante, et résistant au mal, et qui à la fin le surmonte et le foule aux pieds."
- caption_source: text
- caption_orig (из text_it): "Imagini di Tifone fratel d'Osiri, & di Horo figliuolo d'Osiri, che è Baccho appo i Greci, qual Horo superò il detto Tifone, benche in Crocodilo tramutato; con l'Hippopotamo, & Sparauiere hieroglisici denotanti la Virtù combattente, & resistente al male, & ch'al fine lo supera e conculca."

### cartm_horopriapo (`cartm_horopriapo-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Гора, бога египтян, каковой есть Приап, и также Вакх, разумеемый под семенной силою и под Солнцем; с изображением Диска, означающим округлость мира, который освещается Солнцем, и в который Солнце вливает свою силу."
- caption_en (текущий текст в переводе): "Image of Horus, God of the Egyptians, who is Priapus, and Bacchus too, understood as the seminal virtue, and as the Sun; with the depiction of the Disc signifying the roundness of the world, which is illuminated by the Sun, and into which the Sun infuses its virtue."
- caption_fr (текущий текст в переводе): "Image d'Horus, Dieu des Égyptiens, qui est Priape, et aussi Bacchus, entendu pour la vertu séminale, et pour le Soleil ; avec le dessin du Disque signifiant la rotondité du monde, qui est illuminé par le Soleil, et auquel le Soleil insuffle sa vertu."
- caption_source: text
- caption_orig (из text_it): "Imagine di Horo Dio delli Egittij, che è Priapo, & Bacco ancora, il quale viene inteso per la virtù seminale, & per il Sole; con il disegno del Disco significante la rotondità del mondo, che viene dal Sole illuminato, & à cui il Sole influisce la virtù sua."

### cartm_priapohorti (`cartm_priapohorti-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Приапа, бога Садов, и мужского члена, и Осла, и Козла, ему посвящённых, разумеемого под силою семенной или порождающей. Он бог, карающий Воров, и воровство, означаемое серпом, а животные суть знак мощного порождения."
- caption_en (текущий текст в переводе): "Image of Priapus, God of Gardens, and of the virile member, and of the Ass, and of the Billy-goat sacred to him, understood as the seminal or generative virtue. He is a God who punishes Thieves, and theft signified by the sickle, and the animals are a sign of potent generation."
- caption_fr (текущий текст в переводе): "Image de Priape, Dieu des Jardins, et du membre viril, et de l'Âne, et du Bouc, qui lui sont consacrés, entendu pour la vertu séminale ou génératrice. Il est Dieu punisseur des Voleurs, et du vol signifié par la faucille, et les animaux sont signe de puissante génération."
- caption_source: text
- caption_orig (из text_it): "Imagine di Priapo Dio delli Horti, & del membro virile, & dell'Asino, & del Becco à lui sacrati, essendo inteso per la virtù seminale ò generatiua. è Dio punitore de Ladri, & del furto significato nella falce, & li animali sono segno di potente generatione."

### cartm_lare (`cartm_lare-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_lare.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_genio (`cartm_genio-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения доброго и злого Гения, хранителя и наблюдателя человеческого рождения, деяний, Городов и частных мест."
- caption_en (текущий текст в переводе): "Images of the good, and evil Genius, guardian and observer of human generation, of actions, and of Cities, and private places."
- caption_fr (текущий текст в переводе): "Images du bon Génie, et du mauvais, gardien et observateur de la génération humaine, des actions, et des Cités, et lieux privés."
- caption_source: text
- caption_orig (из text_it): "Imagini del Genio buono, & cattiuo, custode & osseruatore della generatione humana, delle attioni, & delle Città, & luoghi priuati."

### cartm_fortuna (`cartm_fortuna-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_fortuna.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_fortunadatrice (`cartm_fortunadatrice-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Фортуны, подательницы и раздательницы, владычицы богатств и благ человеческих, и правительницы вещей здесь внизу, в коих нет никакой твёрдости или устойчивости более той, что можно приписать Кораблю, колеблемому в непостоянных волнах морских."
- caption_en (текущий текст в переводе): "Image of Fortune, giver, and dispenser, and patroness of riches and human goods, and governess of the things here below, in which there is no steadiness or stability any more than one could say a Ship has, tossing upon the unstable waves of the sea."
- caption_fr (текущий текст в переводе): "Image de la Fortune, donatrice, et dispensatrice, et patronne des richesses et des biens humains, et gouvernante des choses d'ici-bas, dans lesquelles il n'y a aucune fermeté ou stabilité, pas plus qu'on ne pourrait dire qu'en a un Navire flottant sur les ondes instables de la mer."
- caption_source: text
- caption_orig (из text_it): "Imagine della Fortuna datrice, & dispensatrice, & patrona delle ricchezze & beni humani, & gouernatrice delle cose di quà giù, nelle quali non è fermezza ò stabilità alcuna più di quello si può dire habbi vna Naue fluttuante nelle instabili onde marine."

### cartm_occasione (`cartm_occasione-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Иероглиф, означающий, что добрая Фортуна почти всегда идёт вместе с Красноречием и с Учёностью, и изображение Случая, или удобного мгновения, называемого греками богом Кер, которого кто не ухватит, когда он является, тот после тщетно его ищет и раскаивается."
- caption_en (текущий текст в переводе): "A hieroglyph denoting that good Fortune almost always goes together with Eloquence, and with Learning, and the image of Occasion, or opportunity, called by the Greeks the God Kairos, whom whoever does not seize when he presents himself afterward seeks in vain, and repents."
- caption_fr (текущий текст в переводе): "Hiéroglyphe dénotant que la bonne Fortune va presque toujours avec l'Éloquence, et avec la Doctrine, et l'image de l'Occasion, ou opportunité, appelée par les Grecs le Dieu Kairos, lequel celui qui ne saisit pas quand il se présente le cherche ensuite en vain, et s'en repent."
- caption_source: text
- caption_orig (из text_it): "Hieroglifico denotante la buona Fortuna quasi sempre andare con l'Eloquenza, & con la Dottrina, & l'imagine dell'Occasione, & opportunità da Greci detta il Dio Chero qual chi non prende quando si appresenta in vano poi si cerca e si pentisce."

### cartm_fortunascithi (`cartm_fortunascithi-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Фортуны у скифов, означающее её быстроту и непостоянство в вещах мирских, и что должно следовать за Случаем, ибо стремительно он улетает, и тщетно потом его преследуют, и тщетно раскаиваются в случаях упущенных и оставленных без внимания."
- caption_en (текущий текст в переводе): "Image of Fortune among the Scythians, signifying her speed, and instability in worldly things, and that one must follow Occasion, because swiftly she flies away, and in vain is she then pursued, and in vain do men repent of occasions lost, and let slip."
- caption_fr (текущий текст в переводе): "Image de la Fortune chez les Scythes, signifiant sa vitesse, et son instabilité dans les choses mondaines, et qu'il faut suivre l'Occasion, car rapidement elle s'envole, et en vain la poursuit-on ensuite, et en vain se repent-on des occasions perdues et négligées."
- caption_source: text
- caption_orig (из text_it): "Imagine della Fortuna appò gli Scithi significante la sua velocità & instabilità nelle cose mondane, & che bisogna secondare l'Occasione, perche velocemente se ne vola & in vano poi si segue, & in vano si pente delle occasioni perdute & tralasciate."

### cartm_fortunaegira (`cartm_fortunaegira-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Фортуны в Эгире, означающее, что в Любви нужны добрая удача и богатства, ибо без них не достичь желанного вожделения. Но я полагаю, что и в этом, как и во всех деяниях, надлежит иметь добродетели, кои и творят добрую Фортуну, ибо нет никакой Фортуны, но есть лишь измышленное имя."
- caption_en (текущий текст в переводе): "Image of Fortune at Aegira, signifying that in Love one needs good fortune, and riches, for otherwise, without them, one does not attain the desired wish. But I believe that in this, as in all actions, one must possess virtues, which are what make good Fortune, for there is no Fortune at all, but it is an imagined name."
- caption_fr (текущий текст в переводе): "Image de la Fortune à Égire, signifiant qu'en Amour il faut bonne fortune, et richesses, sinon, sans elles, on n'obtient pas le désir souhaité. Mais je crois qu'en cela, comme en toutes les actions, il faut avoir des vertus, qui sont ce qui fait la bonne Fortune, car il n'y a aucune Fortune, mais c'est un nom imaginé."
- caption_source: text
- caption_orig (из text_it): "Imagine della Fortuna in Egira, significante nell'Amore volerui buona fortuna, & ricchezze, altrimenti senza non si ottenere lo bramato desiderio. ma io credo, che sì in questa come in tutte le attioni bisogna hauer delle virtù, che quelle fanno la buona Fortuna, perche non ci è Fortuna alcuna, ma è nome imaginato."

### cartm_fortunacauallo (`cartm_fortunacauallo-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Фортуны верхом на коне, стремительно бегущей, преследуемой Роком и Судьбою, означающее быстроту её, и что там, где они есть, она не имеет никакой власти или твёрдости."
- caption_en (текущий текст в переводе): "Image of Fortune on horseback, running swiftly, pursued by Fate, and by Destiny, denoting her speed, and that where these are, she has no power, or steadiness at all."
- caption_fr (текущий текст в переводе): "Image de la Fortune à cheval, courant rapidement, poursuivie par le Destin, et par la Fatalité, dénotant sa vitesse, et que là où ceux-ci se trouvent, elle n'a aucun pouvoir, ni aucune fermeté."
- caption_source: text
- caption_orig (из text_it): "Imagine della Fortuna à cauallo che velocemente corre, dal Fato & dal Destino seguitata, dinotante la velocità di quella, & doue questi sono, quella non hauer possa ò fermezza alcuna."

### cartm_buonoeuento (`cartm_buonoeuento-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение доброго Исхода, то есть благополучного успеха и счастливого конца предприятий, чьё изваяние у римлян было на Капитолии вместе с изваянием доброй Фортуны, в виде весёлого юноши с чашей, колосом и маком."
- caption_en (текущий текст в переводе): "Image of Good Event, that is, prosperous success, and happy end of enterprises, whose image among the Romans was on the Capitol together with that of good Fortune, in the form of a cheerful youth with a cup, an ear of grain, and a poppy."
- caption_fr (текущий текст в переводе): "Image du bon Événement, c'est-à-dire du succès prospère et de l'heureuse fin des entreprises, dont le simulacre chez les Romains fut sur le Capitole avec celui de la bonne Fortune, sous la forme d'un jeune homme gai avec coupe, épi, et pavot."
- caption_source: text
- caption_orig (из text_it): "Imagine del buono Euento, cioè prospero successo & felice fine delle imprese, il cui simulacro appresso de' Romani fu nel Campidoglio con quello della buona Fortuna, in forma di giouane allegro con tazza, spica, & papauero."

### cartm_fauore (`cartm_fauore-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_fauore.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_felicita (`cartm_felicita-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_felicita.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_cupido (`cartm_cupido-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_cupido.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_eroteanterote (`cartm_eroteanterote-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение богов Эрота и Антэрота, братьев и сыновей Венеры, разумеемых — один как любящий, другой как отвечающий взаимностью, то есть любовь взаимная, и изображение любви Летейской, что заставляет разлюбить и забыть любимого человека."
- caption_en (текущий текст в переводе): "Image of the Gods Eros, and Anteros, brothers, and sons of Venus, understood — the one for loving, the other for loving in return, that is, reciprocal love, and the image of Lethean love, which makes one cease to love, and forget the beloved person."
- caption_fr (текущий текст в переводе): "Image des Dieux Éros, et Anteros, frères, et fils de Vénus, entendus — l'un pour aimer, l'autre pour aimer en retour, c'est-à-dire l'amour réciproque, et l'image de l'amour léthéen, qui fait cesser d'aimer, et oublier la personne aimée."
- caption_source: text
- caption_orig (из text_it): "Imagine de gli Dei Erote, & Anterote fratelli & figliuoli di Venere, intesi l'vno per l'amare l'altro per il riamare, ouero l'amor reciproco, & l'imagine dell'amor Letheo che fà disamare, & dimenticare la persona amata."

### cartm_trionfoamore (`cartm_trionfoamore-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Триумф Любви, описанный Филостратом, Петраркой и иными древними и новыми авторами, означающий силу Любви."
- caption_en (текущий текст в переводе): "Triumph of Love, described by Philostratus, by Petrarch, and by other ancient and modern authors, signifying the force of Love."
- caption_fr (текущий текст в переводе): "Triomphe d'Amour, décrit par Philostrate, par Pétrarque, et par d'autres auteurs anciens et modernes, signifiant la force de l'Amour."
- caption_source: text
- caption_orig (из text_it): "Trionfo d'Amore descritto da Filostrato, dal Petrarca, & da altri antichi & moderni, significante la forza d'Amore."

### cartm_imaginiamore (`cartm_imaginiamore-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения Любви, означающие различные действия и могущество Любви, что в сердцах благородных и учтивых легко обретает место, а жёсткие и упорные сокрушает и ломает. Означает также, сколь легко даём мы себя увлечь действиями сладострастными и похотливыми, особенно в юности."
- caption_en (текущий текст в переводе): "Images of Love, signifying the various effects, and powers of Love, which easily finds place in noble, and gentle hearts, and shatters, and breaks the hard, and obstinate. It denotes also how easily we let ourselves be lured by wanton, and lustful effects, especially in youth."
- caption_fr (текущий текст в переводе): "Images d'Amour, signifiant les divers effets, et pouvoirs de l'Amour, lequel trouve aisément place dans les cœurs nobles, et courtois, et brise, et rompt les durs, et obstinés. Elle dénote aussi combien facilement nous nous laissons séduire par des effets lascifs, et libidineux, surtout dans la jeunesse."
- caption_source: text
- caption_orig (из text_it): "Imagini d'Amore significanti gli varij effetti & potenze d'Amore, qual ne cuori nobili & gentili facilmente hà luogo, & li duri & ostinati spezza & rompe. dinota ancora quanto facilmente ci lasciano adescare da gli effetti lasciui, & libidinosi massime in giouentù."

### cartm_panecupido (`cartm_panecupido-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Пана и Купидона, один побеждённый, другой победитель, дабы показать власть Любви над всеобщей Природой, что, прельщённая услаждением дел своих, не помышляет ни о чём ином, кроме как делать их прекрасными и нарядными."
- caption_en (текущий текст в переводе): "Image of Pan, and Cupid, the one conquered, the other victor, to show the power of Love over universal Nature, which, enamored of the delight of its own operations, thinks of nothing else, than of making them beautiful, and adorned."
- caption_fr (текущий текст в переводе): "Image de Pan, et de Cupidon, l'un vaincu, l'autre vainqueur, pour montrer le pouvoir de l'Amour sur la Nature universelle, qui, éprise du plaisir de ses propres opérations, ne pense à rien d'autre qu'à les rendre belles, et parées."
- caption_source: text
- caption_orig (из text_it): "Imagine di Pane, & Cupido, l'vno vinto, l'altro vincitore, per mostrare il potere d'Amore sopra la Natura vniuersale, che inuaghita del diletto delle operationi sue, non pensa ad altro, che à farle belle, & adorne."

### cartm_venere2 (`cartm_venere2-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_venere2.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_tempiopafo (`cartm_tempiopafo-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Храм Венеры в Пафосе, городе Кипра, с иероглифом, являющим её самоё и её природу. Колесница Венеры, влекомая Лебедями и Голубями, ей посвящёнными, с её изображением на этой колеснице, нагим, с тремя Грациями при ней, как изображали её саксонцы, с тремя золотыми яблоками в одной руке, и шаром в другой, что являет, что золото пролагает путь сладострастию, и означает всё это природное плотское желание к порождению."
- caption_en (текущий текст в переводе): "Temple of Venus at Paphos, a City of Cyprus, with a hieroglyph showing her and her nature. The chariot of Venus, drawn by Swans, and by Doves sacred to her, with her image upon the said chariot, naked, with the three Graces beside her, as the Saxons depicted her, with three golden apples in one hand, and a ball in the other, showing that gold makes its way to wantonness, and all this denotes the natural carnal desire to generate."
- caption_fr (текущий текст в переводе): "Temple de Vénus à Paphos, Ville de Chypre, avec hiéroglyphe la montrant elle et sa nature. Char de Vénus tiré par des Cygnes, et par des Colombes qui lui sont consacrées, avec son image sur ledit char, nue, avec les trois Grâces auprès d'elle, comme la peignaient les Saxons, avec trois pommes d'or dans une main, et une boule dans l'autre, montrant que l'or se fraie un chemin vers la lascivité, et tout ceci dénote le désir charnel naturel pour engendrer."
- caption_source: text
- caption_orig (из text_it): "Tempio di Venere in Pafo Città di Cipro con gieroglifico lei & sua natura dimostrante. Carro di Venere tirato da Cigni & da Colombe à lei sacrate, con la sua imagine sopra detto carro nuda con le tre Gratie seco, come li Sassoni la dipingeuano, con tre pomi d'oro in Una mano, & Una palla nell'altra, & dimostra l'oro farsi via alla lasciuia, & dinota il tutto il natural desiderio carnale per generare."

### cartm_venerecigni (`cartm_venerecigni-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Венеры, влекомой в колеснице Лебедями, управляемыми маленькими Амурами; дабы показать, что пение и безмятежность природы весьма сообразны с наслаждениями Любви."
- caption_en (текущий текст в переводе): "Image of Venus drawn in a chariot by Swans, guided by little Loves; to show that song, and the placidity of nature, have much affinity with the pleasures of Love."
- caption_fr (текущий текст в переводе): "Image de Vénus tirée en char par des Cygnes, conduits par de petits Amours; pour montrer que le chant, et la placidité de la nature ont beaucoup d'affinité avec les plaisirs de l'Amour."
- caption_source: text
- caption_orig (из text_it): "Imagine di Venere tirata in carro da' Cigni, retti da gl'Amorini; per mostrare, che il canto, & la placidità della natura hanno molto confacimento co' piaceri d'Amore."

### cartm_venerepiaceri (`cartm_venerepiaceri-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Венеры, богини наслаждений, матери Любви, сопровождаемой маленькими Амурами, Орами и тремя Грациями, означающими любовные услады, и доброе предзнаменование, что творили древние таковыми изображениями новобрачным, согласного брака и пламенной любви."
- caption_en (текущий текст в переводе): "Image of Venus, Goddess of pleasures, mother of Love, accompanied by little Loves, by the Hours, and by the three Graces, signifying amorous delights, and the good omen that the ancients made with such images for newlywed brides, of harmonious marriage, and of ardent love."
- caption_fr (текущий текст в переводе): "Image de Vénus, Déesse des plaisirs, mère de l'Amour, accompagnée de petits Amours, des Heures, et des trois Grâces, signifiant les délices amoureuses, et le bon augure que faisaient les anciens par de telles images aux nouvelles Épouses, de mariage concorde, et d'amour ardent."
- caption_source: text
- caption_orig (из text_it): "Imagine di Venere Dea de piaceri, madre d'Amore, accompagnata da gl'Amorini, dalle Hore, & dalle tre gratie significanti le delitie amorose, & il buono augurio, che faceuano gl'antichi con tal imagini alle nouelle Spose, di concorde matrimonio, & di ardente amore."

### cartm_venerecupidogiogo (`cartm_venerecupidogiogo-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения Венеры, Купидона, Ярма и Козла, кои означают порождение, и изображение Черепахи, иероглиф, означающий опасность замужних и рожающих женщин, и каковою должна быть должность их в попечении о доме и воспитании детей, и что молчание необходимо женщинам более всякой иной добродетели."
- caption_en (текущий текст в переводе): "Images of Venus, of Cupid, of the Yoke, and of the Goat, which signify generation, and the image of the Tortoise, a hieroglyph, which denotes the danger of married, and childbearing Women, and what their office must be in the care of the household, and the raising of children, and that silence is necessary to women above every other virtue."
- caption_fr (текущий текст в переводе): "Images de Vénus, de Cupidon, du Joug, et du Bouc, qui signifient la génération, et l'image de la Tortue, hiéroglyphe, qui dénote le danger des Femmes mariées, et en couches, et quel doit être leur office dans le soin du ménage et l'éducation des enfants, et que le silence est nécessaire aux femmes par-dessus toute autre vertu."
- caption_source: text
- caption_orig (из text_it): "Imagini di Venere, di Cupido, del Giogo, & del Capro, quali significano la generatione, & l'imagine della Testudine hieroglifico, che dinota il pericolo delle Donne maritate, e parturienti, & qual deue essere il loro vfficio nella cura familiare & alleuar figliuoli, & il silentio esser necessario alle donne sopra ogni virtù."

### cartm_venerearmata (`cartm_venerearmata-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Венеры вооружённой, Венеры победительницы, и Венеры в оковах, означающее твёрдость, что должна быть в супругах и влюблённых, означает также это изображение доблесть Лакедемонских Женщин против Мессенцев, что шли разграбить их Город, доблестно ими защищённый."
- caption_en (текущий текст в переводе): "Image of Venus armed, of Venus victorious, and of Venus in chains, denoting the firmness that must be in married couples, and lovers; this image also denotes the valor of the Lacedaemonian Women against the Messenians, who went to sack their City, valorously defended by them."
- caption_fr (текущий текст в переводе): "Image de Vénus armée, de Vénus victorieuse, et de Vénus enchaînée, dénotant la fermeté qui doit être chez les époux, et les amants ; cette image dénote aussi la valeur des Femmes Lacédémoniennes contre les Messéniens, qui allaient saccager leur Cité, vaillamment défendue par elles."
- caption_source: text
- caption_orig (из text_it): "Imagine di Venere armata, di Venere vitrice, & di Venere in ceppi dinotante la fermezza, che deue essere nelli maritati & amanti, dinota ancora questa imagine il valore delle Donne Lacedemonie contro i Messenij, che andauano à saccheggiar la loro Città, da esse valorosamente difesa."

### cartm_fortunalieta (`cartm_fortunalieta-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения весёлой и печальной Фортуны, или же Фортуны прошедшей, настоящей и грядущей, почитаемой древними, хотя и было это лишь воображаемое имя, более всех ложных богов их, и владычицы вещей здесь внизу, и это божество измыслили древние в оправдание своего неразумия."
- caption_en (текущий текст в переводе): "Images of joyful, and sad Fortune, or of Fortune past, present, and to come, held by the ancients, although it was only an imagined name, greater than all their false gods, and patroness of the things here below, and this deity the ancients imagined as an excuse for their own imprudence."
- caption_fr (текущий текст в переводе): "Images de la Fortune joyeuse, et triste, ou de la fortune passée, présente, et à venir, tenue par les anciens, bien que ce ne fût qu'un nom imaginé, plus grand que tous leurs faux dieux, et patronne des choses d'ici-bas, et cette divinité, les anciens l'imaginèrent pour excuser leur propre imprudence."
- caption_source: text
- caption_orig (из text_it): "Imagini della lieta, & trista fortuna, ouero della fortuna passata, presente, & ventura, giudicata da gli antichi, benche sij solo vn nome imaginato, maggiore de tutti li loro dei falsi, & patrona delle cose di qua giù, & questo nume li antichi s'imaginorono per scusa dell'imprudenze loro."

### cartm_nemesi (`cartm_nemesi-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение богини Немезиды, являющей добрые дела и суровой карательницы гордецов и злодеев; и учтивой и щедрой дарительницы, и наградительницы добрых деяний; почитаемой знающей всё: дочери Справедливости, что наставляет нас, что в деяниях должно соблюдать меру и рассудительность."
- caption_en (текущий текст в переводе): "Image of the goddess Nemesis, who shows forth good works, and is a severe punisher of the proud, and the wicked; and a courteous, and generous giver, and rewarder of good deeds; being held the knower of all things: daughter of Justice, who teaches us that in our actions we must use measure and discretion."
- caption_fr (текущий текст в переводе): "Image de la déesse Némésis, qui montre les bonnes œuvres, et est sévère punisseuse des orgueilleux, et des méchants ; et courtoise, et généreuse donatrice, et récompenseuse des bonnes actions ; étant tenue pour la connaisseuse de toutes choses : fille de la Justice, qui nous enseigne qu'il faut, dans les actions, user de mesure et de discernement."
- caption_source: text
- caption_orig (из text_it): "Imagine della dea Nemesi dimostratrice delle buone opere, & seuera punitrice de superbi, & maluagi; & cortese, & larga donatrice, & premiatrice delle buone operationi; essendo tenuta la conoscitrice de tutte: figliuola della Giustitia, che ci ammaestra nelle attioni douersi vsare misura e seno."

### cartm_giustitia (`cartm_giustitia-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Справедливости, хранительницы добрых и карательницы виновных; и изображение Справедливости, попирающей и наказующей обиду, и иероглиф, означающий названную Справедливость, и какою должна она быть, являться и действовать."
- caption_en (текущий текст в переводе): "Image of Justice, guardian of the good, and punisher of the guilty; and image of Justice, trampling, and chastising injury, and a hieroglyph denoting the said Justice, and what she must be, appear, and do."
- caption_fr (текущий текст в переводе): "Image de la Justice, gardienne des bons, et punisseuse des coupables ; et image de la Justice, foulant aux pieds, et châtiant l'injure, et hiéroglyphe dénotant ladite Justice, et ce qu'elle doit être, paraître, et faire."
- caption_source: text
- caption_orig (из text_it): "Imagine della Giustitia custoditrice de buoni, & punitrice de rei; & imagine della Giustitia conculcante, & castigante l'ingiuria, & hieroglifico denotante detta Giustitia, & quale deue essere, apparere, & operare."

### cartm_calunniaapelle (`cartm_calunniaapelle-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Картина «Клевета», написанная Апеллесом, на коей изображён Судья с ослиными ушами, означающими Невежество, и две женщины шепчут ему на ухо, одна — Невежество, другая — Подозрение. Старец, что предшествует Клевете, есть Завистник, тот, что держит за волосы Клевету и Оклеветанного. Из двух женщин, сопровождающих Клевету, одна есть Обман, а другая — Коварство. Из двух женщин внизу одна — Покаяние, взирающее на Истину, следствие клеветания, что в награду ожидает позор, ущерб и поношение."
- caption_en (текущий текст в переводе): "The panel of Calumny, painted by Apelles, in which is the Judge with Ass's ears denoting Ignorance, and two women whisper in his ear, one is Ignorance, the other Suspicion. The old man who precedes Calumny is Envy, the one who holds Calumny and the Calumniated by the hair. Of the two Women who accompany Calumny, one is Fraud, and the other Treachery. Of the two women below, one is Penitence looking back at Truth, the effect of Calumniating, which awaits as recompense shame, harm, and vituperation."
- caption_fr (текущий текст в переводе): "Tableau de la Calomnie peint par Apelle, dans lequel se trouve le Juge aux oreilles d'Âne dénotant l'Ignorance, et deux femmes lui parlent à l'oreille, l'une est l'Ignorance, l'autre le Soupçon. Le vieillard qui précède la Calomnie est l'Envieux, celui qui tient par les cheveux la Calomnie et le Calomnié. Des deux Femmes qui accompagnent la Calomnie, l'une est la Fraude, et l'autre l'Embûche. Des deux femmes en bas, l'une est la Pénitence regardant la Vérité, effet du calomnier, qui pour récompense attend la honte, le dommage, et le vitupère."
- caption_source: text
- caption_orig (из text_it): "Tauola della Calumnia dipinta d'Apelle, nella quale vi è il Giudice con le orecchie d'Asino dinotante l'Ignoranza, e due donne li fauellano all'orecchie, vna è l'Ignoranza l'altra la Suspitione. Il vecchio che precede alla Calumnia è l'inuidioso, quello che per capelli tiene la Calumnia e il Calumniato. Le due Donne, che accompagnano la Calumnia l'vna è la Fraude, & l'altra l'Insidia. Delle due donne abasso vna è la Penitenza riguardante la Verità, effetto del Calumniare, che per ricompensa aspetta la vergogna, il danno, & il vituperio."

### cartm_invidia (`cartm_invidia-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображения Зависти, что вредит самой себе, ибо завистник изводит себя, видя чужое благополучие, и затыкает уши чужим похвалам, и сжимает себе горло, дабы задохнуться, видя их превозносимыми, и это есть худший из пороков."
- caption_en (текущий текст в переводе): "Images of Envy, who harms herself, since the envious man wastes away seeing the prosperity of others, and stops his ears against the praises of others, and squeezes his own throat to suffocate himself, upon seeing them exalted, and this is the worst of vices."
- caption_fr (текущий текст в переводе): "Images de l'Envie, qui se nuit à elle-même, puisque l'envieux se consume en voyant la prospérité d'autrui, et se bouche les oreilles aux louanges d'autrui, et se serre la gorge pour s'étouffer, les voyant exaltées, et ceci est le pire des vices."
- caption_source: text
- caption_orig (из text_it): "Imagini dell'Inuidia, che à se stessa nuoce, essendo che l'inuidioso si strugge vedendo l'altrui prosperità, & si ottura l'orecchie à l'altrui lodi, & si stringe la gola per soffocarsi, quelle vedendo essaltate, & questo è il pessimo de vitij."

### cartm_momo (`cartm_momo-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Мома, бога порицания, или злоречия, и хулы, сына Сна и Ночи, означающего, что хулители суть ничтожны, и никогда ничего не делают сами, а лишь хулят деяния других, взирая всегда не иначе как на достойное порицания, никогда — на достохвальное, подобно кротам, что не взирают ни на Солнце, ни на день, но лишь на тьму и мрак."
- caption_en (текущий текст в переводе): "Image of Momus, God of reprehension, or ill-speaking, and of blame, son of Sleep, and of Night, signifying that detractors are worth nothing, and never accomplish anything themselves, but only blame the deeds of others, looking always only at what is reprehensible, never at what is praiseworthy, like moles, that look not upon the Sun nor the day, but only at darkness and obscurity."
- caption_fr (текущий текст в переводе): "Image de Momus, Dieu de la réprimande, ou médisance, et du blâme, fils du Sommeil, et de la Nuit, signifiant que les détracteurs ne valent rien, et n'accomplissent jamais rien eux-mêmes, mais ne font que blâmer les actions d'autrui, ne regardant jamais que ce qui est répréhensible, jamais ce qui est louable, pareils à des taupes, qui ne regardent ni le Soleil ni le jour, mais seulement les ténèbres et l'obscurité."
- caption_source: text
- caption_orig (из text_it): "Imagine di Momo Dio della reprensione, ò maledicenza, & del biasmo, figliuolo del Sonno, & della Notte, significante li detrattori non esser da niente, ne mai oprar nulla, solo biasimare le operationi altrui, non riguardando mai se non al riprensibile, non mai al lodeuole, simili à talpe, che non riguardano il Sole ne il giorno, ma solo le tenebre & l'oscurità."

### cartm_fraude (`cartm_fraude-1`, поля: RU)

- Позиция: в переводах отсутствует
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; изображения books/cartari/img/cartm_fraude.jpg в репозитории нет; в entries.json есть поле caption — сверить с ним)
- Текущий текст: подписи в text_ru/text_en/text_fr нет

### cartm_naue (`cartm_naue-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Корабля Вакха, горы Тимол Лидийской, по коей рыщут Вакханки, и Тирренских корсаров, пленивших Вакха, обращённых им за их злодеяния в Дельфинов, означающее, что пороки и грехи заставляют человека утратить разум."
- caption_en (текущий текст в переводе): "Image of the Ship of Bacchus, of Mount Tmolus of Lydia, over which the Bacchae range, and of the Tyrrhenian Pirates who captured Bacchus and were by him transformed into Dolphins for their misdeeds, signifying that vices and sins make man lose his reason."
- caption_fr (текущий текст в переводе): "Image du Navire de Bacchus, du mont Tmolos de Lydie, que parcourent les Bacchantes, et des Corsaires Tyrrhéniens, capteurs de Bacchus, transformés par lui en Dauphins pour leurs méfaits, signifiant que les vices et les péchés font perdre à l'homme la raison."
- caption_source: text
- caption_orig (из text_it): "Imagine della Naue di Bacco, del monte Timolo di Lidia delle Bacche per quello scorrenti, & de Corsari Tirrheni captori di Bacco da quello tramutati in Delfini per loro misfatti significanti li vitij, & peccati far perder all'huomo la ragione."

### cartm_martescithi (`cartm_martescithi-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Храма Марса, бога войны, каковой был устроен так у скифов, и изображения Марса у жителей каменистой Аравии, разумеемого также под Солнцем, и под силою его во всех человеческих действиях."
- caption_en (текущий текст в переводе): "Image of the Temple of Mars, God of war, which was made thus among the Scythians, and of the figure of Mars among those of Arabia Petraea, understood also as the Sun, and as the force thereof in all human actions."
- caption_fr (текущий текст в переводе): "Image du Temple de Mars, Dieu de la guerre, qui était ainsi fait chez les Scythes, et de la figure de Mars chez ceux de l'Arabie pétrée, entendu aussi pour le Soleil, et pour la force de celui-ci dans toutes les actions humaines."
- caption_source: text
- caption_orig (из text_it): "Imagine del Tempio di Marte Dio della guerra, che era così fatto appo li Scithi, & della figura di Marte appo quelli d'Arabia petrea, inteso per il Sole ancora, & per la forza di quello in tutte le attioni humane."

### cartm_furoreira (`cartm_furoreira-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "Изображение Неистовства и Гнева, и их злых последствий, кои суть презрение всякой опасности, хотя бы и явной смерти и утраты чести, не взирая ни на Бога, ни на людей, ни на друзей или кровных родичей, ни даже на собственную выгоду; теряя неистовый и гневливый разум в неистовстве и в гневе."
- caption_en (текущий текст в переводе): "Image of Fury and of Wrath, and of their evil effects, which are to scorn every danger, even manifest death and loss of honor, having regard neither for God, nor for men, nor for friends or kinsmen, nor even for one's own interest; the furious and wrathful man losing his reason in fury and in wrath."
- caption_fr (текущий текст в переводе): "Image de la Fureur, et de la Colère, et de leurs mauvais effets, qui sont de mépriser tout péril, fût-il manifeste de mort et de perte d'honneur, sans égard ni pour Dieu, ni pour les hommes, ni pour les amis ou les parents, ni même pour son propre intérêt ; l'homme furieux et colérique perdant la raison dans la fureur et dans la colère."
- caption_source: text
- caption_orig (из text_it): "Imagine del Furore, & dell'Ira, & de suoi mali effetti, che sono sprezzar ogni pericolo, benche manifesto di morte & perdita d'honore non riguardando nè à Dio, nè à gl'huomini, nè ad amici ò consanguinei, nè pur al proprio interesse; perdendo il furioso & iracondo la ragione nel furore & nell'ira."

### cartm83 (`cartm83-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Вулкана, который алмазной секирой рассёк голову Юпитеру, откуда родилась Минерва, богиня мудрости, означающая, что всякое знание исходит от Бога, и что мыслительная способность пребывает в мозгу. Означает также, что у женщин нет ни совета, ни знания»."
- caption_en (текущий текст в переводе): "“The image of Vulcan, who with a Diamond axe split open Jove's head, from which Minerva, goddess of wisdom, was born, denoting that all knowledge comes from God, and that the intellectual faculty resides in the brain. It also signifies that in women there is neither counsel nor knowledge.”"
- caption_fr (текущий текст в переводе): "« L'image de Vulcain, qui d'une hache de Diamant fendit la tête de Jupiter, d'où naquit Minerve, déesse de la sagesse, signifiant que tout savoir vient de Dieu, et que la vertu intellective réside dans le cerveau. Elle signifie aussi que chez les femmes il n'y a ni conseil ni savoir. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Vulcano, che con vna secure di Diamante aprì il capo à Gioue, ilquale ne nasce Minerua dea della sapientia, che dinota ogni sapere venir da Dio, & star nel ceruello la virtù intellettiua. significa ancora nelle donne non esser nè consiglio nè sapere." (сверено по гравюре img/cartm83.jpg; совпадает с полем caption в entries.json)

### cartm84 (`cartm84-1`, поля: RU/EN/FR)

- Позиция: начало (слита с началом абзаца)
- caption_ru (текущий текст в переводе): "«Образ Беллоны, богини войны и колесничей Марса, а также её жрецов, которые сами себя ранят, и сосны, ей посвящённой; она понимается как приносящая убийства, разрушения, резню — свойственные войне следствия»."
- caption_en (текущий текст в переводе): "“The image of Bellona, goddess of war and charioteer of Mars, and of her Priests, who wound themselves, and of the Pine sacred to her; she is understood as the bringer of killings, ruin, and slaughter, effects proper to war.”"
- caption_fr (текущий текст в переводе): "« L'image de Bellone, déesse de la guerre et conductrice du char de Mars, et de ses Prêtres, qui se blessent eux-mêmes, et du Pin qui lui est sacré ; elle est entendue comme l'apporteuse des tueries, des ruines, des massacres, effets propres à la guerre. »"
- caption_source: engraving
- caption_orig (с гравюры): "Imagine di Bellona Dea della guerra & carrattiera di Marte, & de suoi Sacerdoti, che da se stessi feriscono, & del Pino à lei sacrato, questa vien intesa per l'apportatrice delle vccisioni, ruine, stragi, effetti proprij della guerre." (сверено по гравюре img/cartm84.jpg; совпадает с полем caption в entries.json)

### carta7 (`carta7-2`, поля: RU/FR)

- Позиция: конец (отдельные абзацы [2, 3, 4])
- caption_ru (текущий текст в переводе): "«Но поскольку мы коснулись предмета Земли, не будет неуместным поместить здесь её образ в том облике, который у древних означал её твёрдость». / «Эту [Землю] называли они СТАБИЛЬНОЙ, как читается на медали императора Коммода, тогда как на другой, Юлии, супруги Септимия Севера, она именуется Плодородием. И по праву, ибо Земля в высшей степени плодородна, согласно чему Поэты дают ей прозвание «всеродящей». А об этой медали пусть обратятся к Себастьяно Эриццо». / «Храм Весты взят с золотой медали императора Тита, на которой вне Храма видны две фигуры с копьями в руках, которых я не дерзаю назвать Весталками»."
- caption_en (текущий текст в переводе): ""But since we are on the subject of the Earth, it will not be unfitting to place here her image in that posture which among the ancients signified her steadfastness." / "This [Earth] they called STABILE (Steadfast), as may be read on a Medal of the Emperor Commodus, whereas on another, of Julia, wife of Septimius Severus, she is called Fecundity. And rightly so, for the Earth is supremely fertile, according to which the Poets give her the epithet of all-begetting. And on this Medal see Sebastiano Erizzo." / "The Temple of Vesta is taken from a gold Medal of the Emperor Titus, on which two figures with spears in hand are seen outside the Temple, whom I do not dare call Vestals.""
- caption_fr (текущий текст в переводе): "« Mais puisque nous en sommes à propos de la Terre, il ne sera pas malvenu de placer ici son image dans cette posture qui, chez les anciens, signifiait sa fermeté. » / « On l'appelait STABILE (Stable), comme on le lit sur une Médaille de l'empereur Commode, tandis que sur une autre, de Julia, épouse de Septime Sévère, elle est appelée Fécondité. Et à juste titre, car la Terre est souverainement féconde, selon quoi les Poètes lui donnent l'épithète de mère universelle. Et sur cette Médaille, voir Sebastiano Erizzo. » / « Le Temple de Vesta est tiré d'une Médaille d'or de l'empereur Titus, où l'on voit, hors du Temple, deux figures tenant des lances en main, que je n'ose appeler Vestales. »"
- caption_source: engraving
- caption_orig (с гравюры): абзацы 2–3 читаются на странице с гравюрой (img/carta7.jpg; это примечание Пиньории, набранное основным шрифтом над и под гравюрой, а не подпись на доске): "Ma poiche siamo a proposito della Terra, non disdirà il metter qui la sua imagine in quella positura, che appresso gl'antichi significaua la sua fermezza." / "Questa chiamauano essi STABILE, come si legge in vna Medaglia di Commodo Imperatore che in vn'altra di Giulia moglie di Settimo Seuero è chiamata Feconditá. Et a ragione, perche la Terra è sommamente feconda; secondo che i Poeti le danno epiteto di omniparente. Et sopra questa Medaglia vedasi Sebastiano Erizzo."; абзац 4 (храм Весты) начинается внизу страницы «Il Tempio di Vesta s'è tratto da vna Medaglia d'Oro dell'Imperator Tito, doue si vedono due figure con haste in mano fuori del Tempio, …» и продолжается на следующей — остаток «проверить по фото» (в text_it этих абзацев нет; поле caption в entries.json — абзац основного текста над гравюрой)

### carta31 (`carta31-1`, поля: RU/FR)

- Позиция: конец (отдельные абзацы [3])
- caption_ru (текущий текст в переводе): "«Вторая же [камея] взята с древней резьбы»."
- caption_en (текущий текст в переводе): ""The second [cameo] is taken from an ancient carving.""
- caption_fr (текущий текст в переводе): "« La seconde [camée] est tirée d'une taille antique. »"
- caption_source: null
- caption_orig: «проверить по фото» (в text_it подписи нет; на странице img/carta31.jpg этой фразы нет — под гравюрой только примечание «Ne due Camei…»)

## Не уверен

Замечания, где в предложении стоит «не уверен» (толкование или чтение оригинала требует проверки; правка не навязывается).

- `cartm2b-4` — EN/FR — mistranslation, low: «e à gli altri rai s'inchina» → [EN] before his lofty rays bows (вероятно «alti rai»; «other» бессмысленно) — не уверен в чтении оригинала
- `cartm16-3` — RU — name, low: «la conduceuano nella Città del Nilo» → отводили в Город Нила (Нилополь; у Диодора — Νείλου πόλις) — не уверен, что Картари имел в виду именно название
- `cartm16-5` — FR — mistranslation, low: «vn suo ragazzo era stato guasto da vna di quelle bestie» → [FR] un de ses jeunes serviteurs avait été mis à mal (estropié) par une de ces bêtes («guasto» не обязательно «съеден») — не уверен
- `cartm18-2` — RU/EN/FR — mistranslation, medium: «che dall'vn lato, & dall'altro haueua due altre figure tre imagini parimente di femina» → по обе стороны от которой были ещё две женские фигуры (всего три женских изображения) — в оригинале, вероятно, сбой набора; «по две» с каждой стороны неверно
- `cartm23-3` — RU/EN — mistranslation, low: «perche il bosco, che era quiui all'interno» → роща, что была там вокруг (вероятно «all'intorno»; в EN «within there» — так же) — не уверен в чтении оригинала
- `cartm28-5` — RU/EN/FR — mistranslation, medium: «A Thetide pietosa ascinga il petto.» → Осушает грудь милосердной Фетиды (ascinga = asciuga) — не уверен в чтении слова
- `cartm_isismoonjove-5` — FR — addition, medium: «saggi, che Gioue fosse, quale si vede nel Campidoglio» → [FR] не уверен: вступление о Юпитере (Сатурн, Ямвлих, лотос) в text_it этой записи отсутствует — возможно, текст соседней записи; сверить по фото, не дописывать
- `cartm38-4` — IT — ocr, low: «giurauano parimente di non torre doro alcuno da' giuocatori» → [IT] не уверен: возможно «dono» (дар, подкуп); нужна сверка со сканом в проходе B
- `cartm46-2` — RU/EN/FR — mistranslation, low: «quando taglia via tutti gli effetti del corpo» → не уверен: вероятно «affetti» — «когда отсекает все страсти (влечения) тела»
- `cartm47-3` — RU/EN/FR — mistranslation, low: «tutti quelli che sono quiui, vanno à battere lo scorticato Montone» → не уверен: у Геродота (II, 42) присутствующие бьют себя в грудь, оплакивая барана; перевод буквален, допустимо пояснение
- `cartm54-4` — FR — mistranslation, low: «ni di conto, li quali si mutauano di habito» → [FR] не уверен: начало фразы оборвано на стыке страниц; «…ni di conto» может значить «люди без положения» — сверить с предыдущей записью, не дописывать
- `cartm_virtuhonore-3` — EN/FR/RU — mistranslation, medium: «che la sua via gli mostraua prima stretta, & certa, & difficile» → [EN] narrow, steep, and difficult («certa» здесь, вероятно, «erta» — крутая; во всяком случае не «uncertain»); RU «тесным» → «крутым» — не уверен
- `cartm_volcano-3` — IT/FR — ocr, low: «& gli sforzarono a fuggirsi nelle Egitto.» → [IT] по смыслу (Геродот II 141) арабы бегут из Египта; «nelle Egitto» — вероятно, порча текста; не уверен, нужна сверка в проходе B
- `cartm_tifone-3` — RU/FR/EN — addition, low: «stasse. Et di Horo auuene quasi anco il medesimo» → «stasse» — обрывок слова с предыдущей страницы; «довольно» / EN «suffice.» — догадка переводчика; лучше «…» — не уверен
- `cartm_fauore-3` — EN — mistranslation, low: «perche vuole ogni hora salire più sù, che non gli conuiene» → [EN] than is fitting for him (Фавор, м. р.); на переносе страницы текст EN спутан («to come») — проверить стык, не уверен
- `cartm_cupido-3` — RU/EN — ocr, medium: «Melete giouane Atheniese niun conto» → «contò facendosi» на переносе — повтор «conto/contò», а не «рассказывал»: «ни во что не ставил [Тимагора], издеваясь…»; убрать «рассказывал» — не уверен в точной реконструкции
- `cartm_eroteanterote-6` — EN/FR — mistranslation, low: «Ch'al carro de la madre erano giunti,» → [EN] Which were yoked to his mother's chariot («giunti» = запряжены, не «пришли»), не уверен
- `cartm_imaginiamore-2` — RU/EN/FR — mistranslation, medium: «& alcuni altri mostrauano di volerla calciare» → а иные показывали, что хотят её пнуть / обуть (у Плиния «calciarent» — обувают); «оседлать» неверно, точный смысл — не уверен; убрать повтор «иные иные»
- `cartm_gratieintro-2` — EN/FR/RU — mistranslation, medium: «Et alcune di lor spoglian la chioma,» → [EN] And some of them strip his (Phoebus') head of the crown of rays — «chioma» Солнца, не их собственные волосы; RU «снимают с главы убор» → «снимают с его главы [лучистый венец]», не уверен
- `cartm_calunniaapelle-3` — RU/FR/EN — mistranslation, medium: «& porgeua la mano alla Calumnia, che veniua à lui» → и (судья) протягивал руку Клевете — глагол в ед. ч., у Лукиана руку протягивает судья; EN «and extended her hand» → «and he held out his hand», не уверен
- `cartm_furoreira-3` — FR/EN — addition, low: «re, perche al cominciare delle guerre più se dice spesso di quello, che se ne seguita poi» → [FR] […]re, car au commencement des guerres (обрывок слова со стыка страниц; «la Renommée» — догадка, не уверен; EN «Fame» → «[…]re»)
- `cartm84-2` — RU/FR/EN — ocr, medium: «dapoi spiegaua vn'hasta ne' capi de' nemici» → метал копьё в поля (земли) неприятелей — «capi», вероятно, опечатка за «campi»; «вождей» — контаминация; EN «in the chiefs' lands of the enemies» → «into the enemies' fields», не уверен
- `cartm_pignoriahecatombe-1` — RU/FR/EN — addition, medium: «Ma io credo, che'l nostro Autore parli de' poueri» → говорит о бедняках (людях; вставка «[животных]» не обоснована — не уверен в толковании, но «poveri» без существительного = бедные люди); то же EN «the poor [animals]»
- `carta3-3` — FR — mistranslation, low: «che il Timpano chiama con nome di Crotalo» → [FR] le Tympanon du nom de Crotale … le Tympanon n'était pas non plus («Timpano» — тимпан, ручной бубен; «timbale» — литавра и ж. р.; так же в абзаце 3; не уверен в выборе слова)
- `cartm_pignoriaspinola-1` — FR/RU/EN — mistranslation, low: «Et la medesima Inuentione della fauola principale tiene dipinta in vn Quadretto vagamente il S. Andrea Spinola» → [FR] le Seigneur Andrea Spinola possède, peinte avec grâce dans un petit tableau, la même invention («tiene dipinta» = держит у себя написанной, владеет картиной, а не сам написал; не уверен; та же ошибка в RU/EN)
- `carta7-2` — RU/FR — addition, medium: «inanzi la quale i Senatori correuano a piedi scalzi.» → перенести подпись к гравюре в отдельные поля (сейчас: отдельные абзацы [2, 3, 4], конец текста) — абзацы 2–4 похожи на подписи Пиньории к фигурам (Земля STABILE / Плодородие; храм Весты); к какой гравюре относятся — не уверен. …
- `carta13-2` — RU/FR/EN — mistranslation, medium: «'Dum vocat haec Caesar, poterit lorica vocari: Pectore cum sacro federit, Aegis erit.'» → «Пока он пуст (vacat), Цезарь, его можно звать панцирем; когда же ляжет (sederit) на священную грудь — станет эгидой» (Марциал VII.1; «vocat», «federit» — опечатки); EN аналогично, не уверен в степени, в какой переводчик должен …
- `cartm_pignoriavelsero-1` — RU/FR/EN — mistranslation, medium: «essere errata la sottoscritta di passa vinti leggi del Codice» → ошибочность подписи (датировки) более чем двадцати законов Кодекса («passa vinti» = свыше двадцати); EN «the subscription reading "twenty laws"» → «the subscriptions of more than twenty laws» — не уверен
- `carta41-2` — RU/FR/EN — mistranslation, medium: «Nel Cameo si vede Venere Calliga come stà nelle Medaglie.» → Венера Каллига — пояснение «(Обутая)» добавлено и сомнительно (вероятно, искажённое «Callipyga»), не уверен; убрать глоссу; то же EN «(Booted)»
- `carti6-4` — FR — name, low: «che i Cumani, che furono scoperti già vicini al Perù non lontani dal Mare» → [FR] les Cumani (Cumanais), découverts déjà près du Pérou (в оригинале «Cumani»; «Cumanagotos» — модернизирующая догадка; не уверен)

## Fix

Готовые исправления (`fix`) добавлены только к замечаниям из раздела Major с confidence high (по каждому объекту-замечанию). Нумерация абзацев: `text_ru` / `text_en` / `text_fr` в `books/<book>/entries.json` — список строк; `paragraph` — номер элемента списка, с 1 (переводы строк `\n\n` внутри элемента абзац не делят). `paragraph: null` — fix к строковому полю (заголовок, `legend_*`, `findspot_*`), `before` = значение поля целиком. `fix` — объект, если правка одна, или массив объектов (несколько полей или абзацев). `before` скопирован из entries.json побайтно; в `after` изменено только ошибочное место. Проверка: `python3 _review/grok/fix_check.py` (`-v` печатает каждую правку с контекстом). entries.json не изменялся.

- issue_id с fix: 40; объектов-замечаний с fix: 90; всего fix (поле + абзац): 92 (`cartm21-3` — по два абзаца в RU и EN).
- Без fix — проблемы разбивки текста (20): `cartm_intro1-3`, `cartm_isismoonjove-1`, `cartm_isismoonjove-2`, `cartm_pan1-1`, `cartm_pan1-3`, `cartm53-2`, `cartm58-2`, `cartm59-2`, `cartm59-3`, `cartm63-2`, `cartm70-2`, `cartm70-5`, `cartm76-2`, `cartm78-2`, `cartm78-3`, `cartm80-2`, `cartm_night-2`, `cartm_hercgall-2`, `cartm81-2`, `cartm_pignorialisimaco-1`.
- Без fix — confidence medium (2): `cartm44-2`, `cartm44-3`.
- Без fix — отдельные поля с confidence ниже high (7): `cartm_intro2-7` FR (medium), `cartm37-3` FR (medium), `cartm37-4` FR (low), `cartm81-5` FR (medium), `cartm_marte-4` FR (medium), `cartm_lare-2` EN и FR (low).
- `cartm_gratieintro-1`: ошибочное место включает повтор «или / or they / ou» между переносами `\n\n`, он убран вместе с правкой смысла.

## Сверка со сканом (проход B, адресный)

Источник: Heidelberg UB, Cartari, *Imagini de gli Dei delli Antichi*, Padova 1626 (IIIF: https://digi.ub.uni-heidelberg.de/diglit/cartari1626). Нумерация страниц совпадает с полем `page`. Проверяются только помеченные места (~87: ocr / «не уверен» / «проверить по фото» / упоминания скана + 5 пилотных), партиями по 20. Результаты — массив `source_check` в `<id>.json` и `source_check.csv`; в связанных issue добавлено поле `scan_check`. entries.json не менялся.

Вердикты: `transcription_error` — text_it расходится с печатью (`orig_after` = абзац по скану); `edition_error` — опечатка самого издания, text_it верен печати, меняется только пояснение в issue; `ok` — text_it совпадает с печатью; «проверить по фото» — на скане не читается. Разница в акцентах (fù/fu) не считается ошибкой; маргиналии отмечаются отдельно.

### Партия 1 (20 мест, проверено 20 из ~87)

| вердикт | мест |
|---|---|
| transcription_error | 10 |
| edition_error | 3 |
| ok | 7 |
| проверить по фото | 0 |

Затронуты переводы: в 13 местах (10 transcription_error + 3 edition_error).

Главное:
- **Кустоды (слово-отсылка внизу страницы) попали в text_it** и дали повторы, которые в проходе A считались «опечатками оригинала»: `cartm16-4` (anco anco), `cartm20-2` (stendendo do), `cartm23-2` (bacchette chette), `cartm32-2` (metallo metallo), `cartm19-3` (benche le porti benche le porti — плюс вставлено «per insegne di», в печати «benche le porti Minerua parimente»), `cartm28-8` (потеряно «Merig-»: в печати «& da Meriggie la sinistra»), `cartm18-2` (в печати «due al-|tre imagini», «figure» лишнее). Пояснения в issue исправлены. Почти все сбои на стыках страниц (часто через гравюру), в остальные партии смотреть на них в первую очередь.
- `cart2-4`: подтверждено. При транскрипции пропущена последняя строка с. 52: «Riparano poi gli Scarauaggi la loro progenie in questo modo: Spargo-[no]». Все три перевода надо дополнить.
- `cartm23-3` (all'intorno) и `cartm80-3` (в печати «grãdi» = grandi, тильда потеряна): подтверждены. Для `cartm23-3` добавлена FR-строка («à l'intérieur»), для `cartm28-8` — EN-строка («and and»).
- Опечатки издания: `cartm81-3` «ferro» (= fero), `cartm84-2` «capi» (вероятно campi, не уверен), `cartm28-5` «ascinga» (= asciuga).
- Попутно: text_it `cart2` «rinolgono» (с. 54) — в печати, по-видимому, «riuolgono»: проверить по фото. Страница 85 в издании ошибочно напечатана как «95». `cartm46-2`: в печати «effetti», «affetti» остаётся конъектурой; соседнее «cose [e]terne» — проверить по фото. На полях с. 301 «Licrofonte» (в тексте «Licrofone») — маргиналия, не ошибка. Тильды в этих местах раскрыты верно («fiãma» → fiamma, «Cãbise» → Cambise), кроме `cartm80-3`.
