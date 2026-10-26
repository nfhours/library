# Iconologie — сводка проверки переводов (проход A)

Ветка `grok-review`, папка `_review/grok/iconologie/`. Проверены все 440 записей iconologie (p1-1…p1-174, p2-1…p2-262; оригинал text_fr, переводы text_ru и text_en, attrs, заголовки). Подписи к гравюрам сверены по изображениям (только подписи). Тексты не исправлялись; ниже только сводка замечаний. Подробности — в `<id>.json`.

## Итог

| Вердикт | Записей |
|---|---|
| ok | 254 |
| minor | 186 |
| major | 0 |
| **всего** | **440** |

### Уникальные ошибки и вхождения по полям

Одна ошибка = один `issue_id` (`<id>-<n>`). Если одна и та же ошибка есть в нескольких полях (RU, EN, attrs…), она считается один раз как уникальная, а в «вхождениях» — по разу на каждое поле из списка `fields`.

| Показатель | Значение |
|---|---|
| Уникальных ошибок (issue_id) | 234 |
| Вхождений по полям (сумма длин `fields`) | 323 |
| Объектов-замечаний в JSON (одно замечание = один объект с полным списком `fields`) | 234 |

Вхождения по полям: RU — 135, attrs — 75, EN — 48, caption_ru — 23, caption_en — 23, caption_orig — 17, заголовок ru — 2.

Уникальные ошибки по типу: mistranslation — 113, addition — 54, name — 37, omission — 26, ocr — 4. Уверенность: low — 167, medium — 37, high — 30.

Из 234 уникальных ошибок 23 касаются подписей к гравюрам (см. раздел «Подписи к гравюрам»), 211 — текста перевода, attrs и заголовков.

Разделы ниже: major — 0; «Проблемы разбивки текста» — 5; «Подписи к гравюрам» — 23; «Не уверен» — 32; «Повторяющиеся закономерности» — расхождения заголовка и текста 22, толкования в attrs не из текста 51, дубли в исходных данных — 3 (без issue_id). Каждый issue_id в каждом разделе — один раз; один issue_id может входить в несколько разделов.

## Major

Записей с вердиктом major нет. Пропусков смысла, искажений, меняющих статью, и чужого текста не найдено. Опущенная латынь (p2-173-1, p2-175-1) и пропущенное ограничение (p1-12-1) записаны как omission, но смысл статьи сохранён, поэтому это minor. Замечания уровня medium тоже оставлены minor; замечания только о подписях всегда minor.

## Проблемы разбивки текста

Дубли текста между записями и возможные пропуски на стыках. Заголовки и подписи не включены.

- `p2-62-1` — RU/EN — name, low: «tirée d'vne medaille d'Antonin le Debonnaire» → абз. 4–5 дословно повторяют абз. 4–5 статьи p2-59, но переведены иначе (там «Фортуна Миротворная», «Антонина Благодушного» / «Peaceful Fortune», «Antoninus the Debonair»); унифицировать имя и термин в обеих статьях
- `p2-101-1` — attrs — addition, low: «dont la premiere represente le plaisir, le jeu, l'harmonie, & le chastiment d'Amour» → по тексту первый лист — Удовольствие, Игра, Согласие, Наказание (абз. 1), Мучение/Свидетельство/Удовлетворение тоже на «первом» (абз. 4), третий — гриф и ликующие (абз. 3); нумерация листов в attrs противоречит тексту — не …
- `p2-105a-1` — RU — name, low: «semble s'en aller à Paphos, ou à Amathonte» → принятая форма — «Амафунт» (так и в дубле этого текста, p2-101 абз. 5); унифицировать
- `p2-105d-1` — RU — mistranslation, low: «vne espece de rhetorique muette» → «своего рода немой риторикой» — так в дубле этого текста (p2-101, абз. 17) и в EN «mute rhetoric»; унифицировать
- `p2-247-2` — RU/EN — addition, low: «Et comme ils rejettoient du nombre des Poëtes ceux qui manquoient de cette partie» → «древние» / «the ancients» — догадка переводчика: у «ils» и «cette partie» в тексте нет антецедента (¶4 кончается Цицероном и маской). Возможно, перед ¶5 выпал фрагмент оригинала — не уверен; сверить со страницей издания. Если …

Без отдельного issue_id (отмечено в замечаниях или при проверке):

- p2-101 абз. 5–10 дословно = статья p2-105a; абз. 11–19 = статьи p2-105b / p2-105c / p2-105d (общий текст листа с медальонами записан и в сводной записи, и в отдельных). Переводы дублей местами расходятся (см. p2-105a-1, p2-105d-1).
- p2-62 абз. 4–5 = p2-59 абз. 4–5 (тот же текст, переведён иначе; см. p2-62-1).
- p2-158: скан гравюры обрезан, видна только вторая строка подписи; подпись не проверена, замечание не ставилось.

## Подписи к гравюрам

Всего 23. Позиция: «начало» — 0, «середина» — 0, «конец» — 0; во всех 23 случаях подпись есть только на гравюре (над медальоном), а в text_fr, text_ru и text_en её нет.

caption_source: engraving (caption_orig прочитан с гравюры) — 23; text — 0; null — 0.

Помечены только подписи, которые отличаются от заголовка fr по существу; различия в написании (V/U, I/J, опечатки гравёра) и в артикле не помечались. Подписи не удалять: предлагается вынести их в поля caption_orig / caption_ru / caption_en. Замечание только о подписи — minor. «Текущий текст в переводе» ниже: подписи в переводе нет, приведены нынешние заголовки ru/en, ближайшие к подписи.

### p1-6 (`p1-6-2`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Добродетельная любовь» / en «Virtuous Love» переводят fr «Amour vertueux», а не подпись
- caption_source: engraving
- caption_orig (с гравюры): "Amour de vertu" (надпись: AMOVR·DE·VERTV)
- предлагается caption_ru: "Любовь к добродетели"; caption_en: "Love of Virtue"

### p1-7 (`p1-7-2`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; подписи нет нигде; заголовки ru «Благородная, учтивая душа» / en «Courteous Soul» переводят fr «Ame courtoise»
- caption_source: engraving
- caption_orig (с гравюры): "Ame courtoise et traictable" (надпись: AME·COVRTOISE·ET·TRAICTABLE)
- предлагается caption_ru: "Душа учтивая и обходительная"; caption_en: "Courteous and Tractable Soul"
- Примечание: Попутно: «Благородная» в заголовке ru нет ни в fr, ни на гравюре (не уверен, откуда взято).

### p1-10 (`p1-10-1`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Любовь к отечеству» / en «Love of One's Country» переводят fr «Amour de la Patrie»
- caption_source: engraving
- caption_orig (с гравюры): "Amour vers sa Patrie" (надпись: AMOVR·VERS·SA·PATRIE)
- предлагается caption_ru: "Любовь к своему отечеству"; caption_en: "Love toward One's Country"

### p1-11 (`p1-11-1`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Блаженная душа» / en «Blessed Soul» переводят fr «Ame bien-heureuse»; «raisonnable» подписи в них нет
- caption_source: engraving
- caption_orig (с гравюры): "Ame raisonnable et heureuse" (надпись: AME·RAISONNABLE·ET·HEVREVSE)
- предлагается caption_ru: "Разумная и счастливая душа"; caption_en: "Rational and Happy Soul"

### p1-28 (`p1-28-2`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Уверенность, доверие» / en «Confidence» переводят fr «Confiance»; по смыслу подходят и к подписи, но отдельных полей нет
- caption_source: engraving
- caption_orig (с гравюры): "Confidence" (надпись: CONFIDENCE)
- предлагается caption_ru: "Уверенность, доверие"; caption_en: "Confidence"

### p1-37 (`p1-37-1`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Стремление к Богу» / en «Desire toward God» переводят fr «Desir envers Dieu»; по смыслу совпадают с подписью, но отдельных полей нет
- caption_source: engraving
- caption_orig (с гравюры): "Desir vers Dieu" (надпись: DESIR·VERS·DIEV)
- предлагается caption_ru: "Стремление к Богу"; caption_en: "Desire toward God"

### p1-60 (`p1-60-1`, поля: caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Твёрдость речи» / en «Firmness of Speech» переводят fr «Fermeté de langage»; по смыслу совпадают с подписью, но отдельных полей нет
- caption_source: engraving
- caption_orig (с гравюры): "Fermeté du langage" (надпись: FERMETE·DV·LANGAGE)
- предлагается caption_ru: "Твёрдость речи"; caption_en: "Firmness of Speech"

### p1-73 (`p1-73-2`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Благодарность, или признательность» / en «Gratitude, or Thankfulness» переводят fr «Gratitude, ou Reconnoissance»; на гравюре только «Gratitude»
- caption_source: engraving
- caption_orig (с гравюры): "Gratitude" (надпись: GRATITVDE)
- предлагается caption_ru: "Благодарность"; caption_en: "Gratitude"

### p1-88 (`p1-88-3`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Свобода воли» / en «Free Will» переводят fr «Libre arbitre»; на гравюре (две строки) полнее: «Libre ou Franc Arbitre»
- caption_source: engraving
- caption_orig (с гравюры): "Libre ou Franc Arbitre" (надпись: LIBRE·OV·FRANC / ARBITRE)
- предлагается caption_ru: "Свободная, или вольная, воля"; caption_en: "Free or Unconstrained Will"
- Примечание: Перевод подписи: «вольная воля»/«Unconstrained» — не уверен, можно «Свобода, или вольность, воли» / «Free or Frank Will».

### p1-150 (`p1-150-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Человеческая мудрость» / en «Human Wisdom» переводят fr «Sagesse humaine»; на гравюре иначе: «Sapience humaine»
- caption_source: engraving
- caption_orig (с гравюры): "Sapience humaine" (надпись: SAPIENCE HVMAINE)
- предлагается caption_ru: "Человеческая премудрость"; caption_en: "Human Sapience"
- Примечание: Перевод подписи: «Human Sapience» — не уверен, можно «Human Wisdom» с пометкой.

### p1-152 (`p1-152-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Тайна, или молчание» / en «Secrecy, or Silence» переводят fr «Secret, ou Silence»; на гравюре только «SECRET»
- caption_source: engraving
- caption_orig (с гравюры): "Secret" (надпись: SECRET)
- предлагается caption_ru: "Тайна"; caption_en: "Secrecy"

### p2-37 (`p2-37-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «О возрасте человека вообще» / en «Of the Age of Man in General» переводят fr «De l'âge de l'homme en general»; на гравюре общий лист «LES QVATRE AGES» с медальонами «Le Siecle d'or / d'argent / de bronze / de fer»
- caption_source: engraving
- caption_orig (с гравюры): "Les quatre âges" (надпись: LES QVATRE AGES)
- предлагается caption_ru: "Четыре века"; caption_en: "The Four Ages"
- Примечание: Лист относится к статьям p2-38..p2-41 (века мира), а не к возрастам человека — не уверен, стоит ли вообще связывать эту подпись с p2-37; attrs это уже отмечают.

### p2-38 (`p2-38-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовок fr «L'âge d'or»; на гравюре «LE SIECLE D'OR» (siècle вместо âge)
- caption_source: engraving
- caption_orig (с гравюры): "Le Siecle d'or" (надпись: LE SIECLE D'OR)
- предлагается caption_ru: "Золотой век"; caption_en: "The Golden Age"
- Примечание: Перевод подписи совпадает с текущими заголовками ru/en; различие только в caption_orig.

### p2-39 (`p2-39-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовок fr «L'âge d'argent»; на гравюре «LE SIECLE D'ARGENT»
- caption_source: engraving
- caption_orig (с гравюры): "Le Siecle d'argent" (надпись: LE SIECLE D'ARGENT)
- предлагается caption_ru: "Серебряный век"; caption_en: "The Silver Age"
- Примечание: Перевод подписи совпадает с текущими заголовками ru/en; различие только в caption_orig.

### p2-40 (`p2-40-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Медный век» / en «The Bronze Age» переводят fr «L'âge d'airain»; на гравюре «LE SIECLE DE BRONZE»
- caption_source: engraving
- caption_orig (с гравюры): "Le Siecle de bronze" (надпись: LE SIECLE DE BRONZE)
- предлагается caption_ru: "Бронзовый век"; caption_en: "The Bronze Age"
- Примечание: caption_ru отличается от заголовка (бронзовый, не медный).

### p2-41 (`p2-41-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовок fr «L'âge de fer»; на гравюре «LE SIECLE DE FER»
- caption_source: engraving
- caption_orig (с гравюры): "Le Siecle de fer" (надпись: LE SIECLE DE FER)
- предлагается caption_ru: "Железный век"; caption_en: "The Iron Age"
- Примечание: Перевод подписи совпадает с текущими заголовками ru/en; различие только в caption_orig.

### p2-42 (`p2-42-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Общие замечания о пяти чувствах» / en «General Remarks on the Five Senses of Nature» переводят fr «Remarques generales sur les cinq sens de Nature»; на гравюре (общий лист с пятью медальонами) «LES CINQ SENS DE NATVRE», ниже повтор «LES CINCQ SENS DE NATVRE»
- caption_source: engraving
- caption_orig (с гравюры): "Les cinq sens de nature" (надпись: LES CINQ SENS DE NATVRE)
- предлагается caption_ru: "Пять чувств природы"; caption_en: "The Five Senses of Nature"

### p2-60 (`p2-60-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Фортуна любви» / en «Fortune of Love» переводят fr «Fortune d'amour»; на гравюре «FORTVNE EN AMOVR»
- caption_source: engraving
- caption_orig (с гравюры): "Fortune en amour" (надпись: FORTVNE EN AMOVR)
- предлагается caption_ru: "Удача в любви"; caption_en: "Fortune in Love"
- Примечание: Перевод подписи — не уверен; можно «Фортуна в любви».

### p2-64 (`p2-64-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Сила и благоразумие вместе» / en «Strength and Prudence Together» переводят fr «Force & Prudence ensemble»; на гравюре без «ensemble»: «FORCE ET PRVDENCE»
- caption_source: engraving
- caption_orig (с гравюры): "Force et Prudence" (надпись: FORCE ET PRVDENCE)
- предлагается caption_ru: "Сила и благоразумие"; caption_en: "Strength and Prudence"

### p2-82 (`p2-82-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Молва в обычном изображении» / en «Fame Depicted in the Ordinary Manner» переводят fr «Renommée peinte à l'ordinaire»; на гравюре только «RENOMMEE»
- caption_source: engraving
- caption_orig (с гравюры): "Renommée" (надпись: RENOMMEE)
- предлагается caption_ru: "Молва"; caption_en: "Fame"

### p2-105 (`p2-105-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Алчность, или вожделение» / en «Cupidity, or Covetousness» переводят fr «Cupidité ou Convoitise»; на гравюре только «CVPIDITE»
- caption_source: engraving
- caption_orig (с гравюры): "Cupidité" (надпись: CVPIDITE)
- предлагается caption_ru: "Алчность"; caption_en: "Cupidity"

### p2-167 (`p2-167-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки ru «Раскаяние в грехе» / en «Repentance for Sin» переводят fr «Repentance de peché»; на гравюре мн. ч. «REPENTANCE DES PECHEZ»
- caption_source: engraving
- caption_orig (с гравюры): "Repentance des pechez" (надпись: REPENTANCE DES PECHEZ)
- предлагается caption_ru: "Раскаяние в грехах"; caption_en: "Repentance for Sins"

### p2-257 (`p2-257-1`, поля: caption_orig/caption_ru/caption_en)

- Позиция: в переводах отсутствует (подпись только на гравюре, над медальоном)
- Текущий текст в переводе: подписи нет; заголовки fr «Iconographie» / ru «Иконография» / en «Iconography»; на гравюре «ICHONOGRAPHIE» — это не орфография, а другой термин: ихнография (ichnographia, Витрувий) — чертёж плана здания
- caption_source: engraving
- caption_orig (с гравюры): "Ichnographie" (надпись: ICHONOGRAPHIE)
- предлагается caption_ru: "Ихнография (план)"; caption_en: "Ichnography"
- Примечание: Attrs [2] («линейка у плана здания — черчение фасадов и планов») и соседство с Planemetrie/Symmetrie поддерживают чтение «ихнография»; возможно, ошибочен и сам заголовок fr — не уверен, это решение за редактором (заголовки не правлю).

## Не уверен

Замечания, где сказано «не уверен»: толкование или чтение оригинала требует проверки, правка не навязывается.

- `p1-7-2` — caption_orig/caption_ru/caption_en — omission, high: «AME·COVRTOISE·ET·TRAICTABLE (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Ame courtoise et traictable" (сверено по фото …
- `p1-16-1` — RU — mistranslation, low: «& les livres vn signe exprés de l'authorité des écritures» → книги — явный знак авторитета писаний/письменных текстов (строчное «écritures» здесь скорее «писания» вообще; не уверен)
- `p1-36-1` — RU/EN — mistranslation, low: «Le mesme nous est encore demontré par sa teste à l'évent» → её головой, выставленной на ветер / вскинутой («à l'évent»; ср. абзац 1 «la teste en dehors»), а не «непокрытой»; EN «bare head» → «her head thrust out to the wind»; не уверен в оттенке
- `p1-65-1` — attrs — mistranslation, medium: «Ses armes sont des symboles de la force de son corps; & le rameau qu'elle tient en main, en est vn de celle de son …» → по тексту оружие — символ силы тела, а ветвь (дубовая) — силы духа (абзац 3: «Ses armes … la force de son corps; & le rameau … celle de son esprit»); «Дуб — символ силы тела» противоречит тексту. Лев и вепрь по Пиерию означают …
- `p1-82-1` — attrs — addition, low: «Il a le visage voilé, pour faire voir que la cause de cet Instinct est si fort cachée» → в тексте гелиотроп не истолкован (Солнце в абзаце 2 сравнивается с разумом без связи с цветком), а бег означает «склонность и движение, непосредственно в нём заключённые» (абзац 3), а не быстроту; толкование гелиотропа пометить …
- `p1-88-3` — caption_orig/caption_ru/caption_en — omission, high: «LIBRE·OV·FRANC / ARBITRE (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Libre ou Franc Arbitre" (сверено по фото …
- `p1-99-1` — RU — name, low: «au temps que Procax regnoit en Albanie» → в Альбе (Alba Longa) царствовал Прока (EN «Procas»); «Албания» — буквально, но речь об Альбе Лонге — не уверен, можно оставить «Албания» с примечанием
- `p1-111-1` — RU/EN — mistranslation, low: «l'on trouve à la fin, qu'on peut achever ce qu'inutilement on a commencé» → буквально: «в конце концов видят, что [не] могут завершить то, что тщетно начали» — вероятно, в оригинале пропущено «ne»; перевод передаёт другой смысл. Не уверен: предложить «обнаруживают, что не в силах довести до конца то, что …
- `p1-114-1` — RU — name, low: «n'attribuoit vne pareille vertu à la riviere Sellienne» → реке Селемн (Павсаний VII, 23, как в EN «Selemnus»); «Селлеента» не соответствует ни FR «Sellienne», ни традиционному имени. Не уверен в выборе формы — можно «Селлиенской реке» буквально
- `p1-130-1` — RU — mistranslation, low: «mais il faut necessairement que la Perseverance y soit jointe» → держать один термин для Perseverance: в заголовке «Настойчивость», в тексте «Постоянство» (ср. отдельную статью Constance). Предлагается «Настойчивость» или сменить заголовок на «Упорство/Постоянство» — не уверен, какой термин …
- `p1-141-1` — RU/EN — name, low: «les Sueves, les Analois, & les anciens Bourguignons» → «Analois» — скорее аланы (у Рипы Alani), а не англы: свевы, аланы и древние бургунды / the Suevi, the Alans… — не уверен, проверить по Рипе
- `p1-142-1` — RU/EN — mistranslation, low: «il ne peut plus tenir sa colere» → больше не может сохранять гнев (гнев проходит — он раскаивается и винит себя) / he can no longer keep up his anger; «сдержать гнев» даёт обратный смысл — не уверен
- `p1-147-1` — attrs — addition, low: «vn baston noueux, où s'entortille vn serpent» → в тексте статьи змея на посохе не толкуется; это толкование не из текста — убрать или пометить как общеизвестное — не уверен, нет ли его в соседних абзацах
- `p1-149-1` — RU/EN — mistranslation, low: «il sert de rempart à l'estomach, où quelques anciens l'ont placée» → служат оплотом груди / to the breast — estomach в XVII в. часто «грудь» (латы защищают грудь, thorax); «желудок» сомнителен — не уверен
- `p1-150-1` — caption_orig/caption_ru/caption_en — omission, high: «SAPIENCE HVMAINE (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Sapience humaine" (сверено по фото img/p1-150.jpg: …
- `p1-155-1` — RU — mistranslation, low: «tient si fort dans l'indifference que ses actions soient éclairées, qu'il les manifeste luy-mesme, & met à découvert …» → настолько безразличен к тому, видны ли его поступки, что сам их являет…; «невольно, по чёрному злому умыслу» противоречиво: смысл — он лишь как можно реже грешит умышленно, по чёрному злу (не уверен в точной трактовке); EN ближе …
- `p1-164-1` — attrs — addition, low: «vne tasse sur la teste, & vn cœur au milieu» → с чашей на голове и сердцем посередине (в тексте «au milieu» — вероятно, посреди чаши, как у Рипы; «на груди» в тексте нет) — не уверен
- `p2-15-1` — RU/EN — mistranslation, low: «Et les neiges fonduës» → в оригинале «fonduës» — без отрицания: «И талые снега» / «And the melted snows» (или, если fondre = «обрушиться», «выпавшие снега») — не уверен в трактовке, но «нерастаявшие/never melted» — обратный смысл
- `p2-37-1` — caption_orig/caption_ru/caption_en — omission, high: «LES QVATRE AGES (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Les quatre âges" (сверено по фото img/p2-37.jpg: …
- `p2-42-2` — RU — name, low: «certains peuples appellez Astons» → …именуемые Астомами (у Плиния Astomi, «безротые»; EN «Astomi» верно) — не уверен, не сохранять ли форму оригинала с пометкой
- `p2-49-1` — RU/EN — mistranslation, low: «en ceux qui abondent d'un sens parfaitement temperé» → вероятно, в оригинале опечатка «sens» вместо «sang»: «у тех, кто изобилует совершенно уравновешенной кровью» / «abound in a perfectly tempered blood» (речь о сангвинике, ср. абз. 4) — не уверен; при сохранении буквального чтения …
- `p2-51-1` — RU/EN/attrs — name, low: «avec un passereau solitaire sur le haut de sa teste» → «passereau solitaire» — название птицы (Passer solitarius, синий каменный дрозд / blue rock thrush), а не «одинокий воробей»; можно «каменный дрозд (passereau solitaire)» — не уверен, не оставить ли буквально, т.к. абз. 4 …
- `p2-60-1` — caption_orig/caption_ru/caption_en — omission, high: «FORTVNE EN AMOVR (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Fortune en amour" (сверено по фото img/p2-60.jpg: …
- `p2-75-2` — RU/attrs — mistranslation, low: «outre les clerons, les hauts-bois, & tels autres instrumens» → «clerons» (clairons) — горны / трубы-кларины, не корнеты: «помимо горнов (труб), гобоев…» — не уверен, можно оставить
- `p2-76-1` — RU — mistranslation, medium: «& des brodequins aux pieds» → котурны — обувь трагических актёров; комическая обувь — сокки: «а на ногах — сокки (лёгкая комическая обувь)» или «полусапожки»; в абз. 2 и attrs уже нейтрально («обувь»). EN «buskins» тоже обычно = котурн, но как перевод …
- `p2-101-1` — attrs — addition, low: «dont la premiere represente le plaisir, le jeu, l'harmonie, & le chastiment d'Amour» → по тексту первый лист — Удовольствие, Игра, Согласие, Наказание (абз. 1), Мучение/Свидетельство/Удовлетворение тоже на «первом» (абз. 4), третий — гриф и ликующие (абз. 3); нумерация листов в attrs противоречит тексту — не …
- `p2-102-1` — RU — mistranslation, medium: «bien qu'il semble veritablement avoir en luy toutes les choses qui luy sont opposées» → «opposées» — поставленные перед ним: «кажется, что оно воистину содержит всё, что перед ним поставлено»; EN «opposed to it» тоже двусмысленно — не уверен для EN
- `p2-151-1` — attrs — addition, low: «Toutes lesquelles choses jointes ensemble signifient, la Foy, la Justice, la Dignité, la Science, la Sagesse, & …» → в тексте значения даны списком для всех атрибутов вместе, без распределения; «правило и руководство» относится к самому Закону, не к зеркалу — не уверен, допустимо ли распределение, но зеркало истолковано неверно
- `p2-162-2` — RU/EN — mistranslation, low: «en tirant à terre à contremont vn gros navire avec vn simple filet» → «filet» здесь, вероятно, тонкая верёвка, бечёвка (у Ливия/Овидия — Клавдия Квинта тянет корабль поясом/верёвкой): «простой бечёвкой» / «a mere cord» — не уверен
- `p2-247-2` — RU/EN — addition, low: «Et comme ils rejettoient du nombre des Poëtes ceux qui manquoient de cette partie» → «древние» / «the ancients» — догадка переводчика: у «ils» и «cette partie» в тексте нет антецедента (¶4 кончается Цицероном и маской). Возможно, перед ¶5 выпал фрагмент оригинала — не уверен; сверить со страницей издания. Если …
- `p2-257-1` — caption_orig/caption_ru/caption_en — omission, high: «ICHONOGRAPHIE (надпись на гравюре)» → вынести подпись к гравюре в отдельные поля (сейчас: подпись только на гравюре, над медальоном; в text_fr и переводах отсутствует; в entries.json поля caption нет). caption_orig: "Ichnographie" (сверено по фото img/p2-257.jpg: …
- `p2-262-1` — RU/EN — mistranslation, low: «quatre raisons principales, dont la premiere est dite vocale» → raisons здесь, вероятно, «отношения (числовые соотношения)», а не «причины» — не уверен: ru «четыре главных рода отношений», en «four principal ratios»

## Повторяющиеся закономерности

1. **Термин заголовка не совпадает с термином в тексте (22).** Заголовок ru переводит понятие одним словом, а в тексте статьи и в attrs стоит другое (например «Суровость» / «Строгость», «Сладострастие, блуд» / «Распутство», «Военная архитектура» / «Фортификация», «Обдумывание» / «Рассудительность»). Иногда неверен сам заголовок: p2-208 «Непослушание» вместо «Непонятливость» (Indocilité); p2-176 — «Substance» означает «Пропитание (Достаток)». Предложение: унифицировать по заголовку или поправить заголовок. issue_id: `p1-83-1`, `p1-130-1`, `p2-104-1`, `p2-111-1`, `p2-119-2`, `p2-123-1`, `p2-124-1`, `p2-125-1`, `p2-126-1`, `p2-155-1`, `p2-162-1`, `p2-170-1`, `p2-176-1`, `p2-177-1`, `p2-181-1`, `p2-187-1`, `p2-192-1`, `p2-208-1`, `p2-214-1`, `p2-228-1`, `p2-251-1`, `p2-261-2`.

2. **Толкования в attrs, которых нет в тексте (51).** attrs объясняют атрибут (позу, животное, предмет), который автор статьи не истолковывает или объясняет иначе; часто это общеизвестная символика или вывод по гравюре. Предложение: убрать толкование или пометить его как внетекстовое. issue_id: `p1-2-3`, `p1-4-2`, `p1-7-1`, `p1-49-3`, `p1-54-1`, `p1-55-1`, `p1-57-2`, `p1-82-1`, `p1-84-1`, `p1-88-2`, `p1-134-1`, `p1-147-1`, `p1-156-1`, `p1-164-1`, `p1-171-1`, `p2-4-1`, `p2-14-1`, `p2-41-2`, `p2-47-1`, `p2-58-2`, `p2-81-1`, `p2-86-1`, `p2-87-2`, `p2-88-1`, `p2-92-1`, `p2-93-1`, `p2-97-1`, `p2-101-1`, `p2-103-1`, `p2-105a-2`, `p2-105d-2`, `p2-114-1`, `p2-125-2`, `p2-135-1`, `p2-144-1`, `p2-150-1`, `p2-151-1`, `p2-154-1`, `p2-164-1`, `p2-166-1`, `p2-171-2`, `p2-180-1`, `p2-188-1`, `p2-191-1`, `p2-198-2`, `p2-211-1`, `p2-214-2`, `p2-228-2`, `p2-230-1`, `p2-255-1`, `p2-257-2`.

3. **Дубли в исходных данных (3, без issue_id).** p2-101 абз. 5–10 = p2-105a и абз. 11–19 = p2-105b/c/d; p2-62 абз. 4–5 = p2-59 абз. 4–5. Одинаковый французский текст переведён по-разному (имена, термины): см. p2-62-1, p2-105a-1, p2-105d-1. Предложение: решить на уровне данных, какую запись оставить, и выровнять переводы.

4. **Мелкие повторяющиеся ошибки RU.** Несогласование рода и числа с заголовком-аллегорией (Гнев — «её», журавль — «летящая», часы — «один за другим»). «gorge» переведено буквально, хотя в XVII в. это «грудь» (p1-78, p1-85). Опущенная латынь надписей там, где в остальных статьях она сохранена (p2-173, p2-175).

## Fix

Замечаний major нет, поэтому fix не делались (0). Правила fix — в `_review/grok/fix_check.py` и в разделе Fix сводки cartari.
