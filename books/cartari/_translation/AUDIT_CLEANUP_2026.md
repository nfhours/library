# Аудит итоговой чистки (2026-11-06)

Независимая проверка незакоммиченных правок трёх агентов (`git diff` против HEAD). Проверено 123 изменённых фрагмента в 51 файле (без FROM_FR_CHECK.md). Каждый сверен с итальянским `_text/TEXT_reading.md`, сканом 0604 и соседним текстом.

## Технические проверки

- `build_chapters.py --lang en --check` и `--lang fr --check` для всех 18 изменённых глав (annotationi-pignoria, apollo, bacco, catalogo-dei, diana, fortuna, giove, giunone, gran-madre, gratie, mercurio, minerva, nettuno, proemio, saturno, seconda-parte-indiani, venere, vertunno): **OK** (до моих правок и после них).
- ru/en/fr `--all` собраны во временную папку (scratchpad), настоящие chapters_*.json не тронуты: 25 глав, 3760 блоков во всех трёх языках. В chapter_links.tsv было 1 предупреждение (см. исправление 1), после исправления — 0.
- names.json собран во временную папку функциями `tools/build_names.py`: Фетида — 6 упоминаний, Тефида — 7, Фест (вместе с «Помпей Фест») — 23, Акмон — 1. Ложных совпадений «Помпей» нет.
- Пометы [?N]: во всех изменённых файлах последовательности пометок совпадают с HEAD, кроме seconda-parte-indiani (как и задумано). В seconda-parte-indiani ru/en/fr: в тексте [?1]–[?7], в примечаниях [?1]–[?7], наборы совпадают; в собранных JSON у блока 27 есть собственное пояснение (qm) во всех трёх языках. QMARKS.md: 107 строк в таблице, совпадает с заголовком «107; со своим пояснением: 53».
- Поиск оставшихся ошибочных форм в текстах глав ru/en/fr (журналы *.review.md, PROGRESS.md и FROM_FR_CHECK.md не считаются):
  - «Тетид»: 0.
  - «Алкмон»: 0.
  - «Festus Pompeius» / «Pompeo Festo» / «Фест Помпей»: 0.
  - «Apolline» во fr: только в примечаниях о печатной форме (catalogo-dei, annotationi-pignoria, seconda-parte-indiani).
  - «Rat» во fr: 0, везде souris/Souris.
  - Tethys/Téthys стоят только там, где речь о титаниде: apollo (Клавдиан ×3 и примечание [?8]), nettuno 88, 232, 234, 238, 261. Thetis/Thétis/Фетида — только о Нереиде: catalogo-dei 18, gratie, minerva ×4, nettuno 249.

## (A) Исправления по FROM_FR_CHECK: вердикты

| Место | Итальянский | Вердикт |
|---|---|---|
| proemio 11 ru | «ciascheduna Città, ogni luoco, ogni casa, & ogni persona se ne faceua» | верно: «каждый Город, каждое место, каждый дом и каждый человек заводили» |
| proemio 174 en | «All'hor, ch'haurà pietà de' nostri mali / Febo, che questi…» | порядок строк восстановлен верно, но строка «when there shall have pity on our ills» неграмматична. **Исправлено** (см. исправление 2) |
| saturno 76 ru/en/fr | «fà il medesimo di tutto l'anno … l'apre … serrarlo» | верно: «то же самое и со всем годом» / «with the whole year» / fr «il la referme» (la = l'année) |
| apollo 235 ru | «hà le penne à piedi ornati di ardentissimi carbonchi» | верно, теперь согласуется с примечанием [?7] |
| diana 32 ru | Проперций, «La Luna à mezo il Cielo rosseggiasse» | верно: лишнее «не» убрано, «Хотя» без «бы»; 3 строки, как и было |
| diana 100 ru/en | «Seguita poi, che la verità è» | верно (Пруденций продолжает; цитата из Пруденция идёт прямо перед этим) |
| diana 112 ru/en | «ò veramente la Natura delle cose» | верно: «или же» / «or else» |
| giove 52 ru | «S'amor ti torne … E che ti renda» | верно: «так пусть любовь вернёт … и возвратит»; строк столько же |
| vertunno 1 ru | «I cocomeri» | верно: «арбузы» |
| mercurio 65 ru | «dona, e toglie / I sonni» | верно: «сон» |
| minerva 169 ru | «E però la Gorgone» | верно: «И потому» |
| bacco 146 ru/en | «perch'ei si era voltato» | верно (причина) |
| fortuna 153 ru | «come si pare dire» | верно: «как, по-видимому, принято говорить» |
| venere 6 ru | «fanno … che Venere … siano vna Dea sola, ma siano tanti i nomi» | верно: всё утверждение передано как чужое мнение |
| venere 51 ru | «come che hauesse così belle natiche» | верно: «ведь у неё…» |
| venere 99 ru/en | «come che fossero forse più … obligate» | верно (причина, а не уступка) |
| giunone 28 en | «Il che dicono de gli altri ancora esser pur troppo vero» | верно: «others too say» (ru и fr уже были верны) |
| gratie 34 en | «viene ad incontrare Thetide … armi per Achille» | верно: Thetis |
| annotationi-pignoria 297 ru/en | V.S.L.L.M | верно: «радостно» / «gladly» добавлено; fr примечание [?18] «Heder» → «Haeder»: верно, как в тексте (HÆDER) |
| seconda-parte-indiani 27 ru/en | «vna nel corpo dall'Incensiere» | верно: «на теле Кадильницы» / «on the body of the Censer», + [?3] (fr уже было верно) |

## (B) Решения по глоссарию: вердикты

- **Фетида / Тефида.** Все 16 мест в ru, 8 в en и 7 в fr проверены по итальянскому контексту (TEXT_reading 226, 2578, 2596, 2601, 4541, 4690, 4699, 4717 ×2, 6618 ×2, 6711, 6729, 9052): разделение верное. Падежи правильные: «Тефида», «Тефиде», «Тефиду», «Тефиды»; «Фетиде», «Фетиды», «Фетиду». Порядок и число строк в стихах Клавдиана не изменились, пометы на полях (`<aside>`) на месте. TAVOLA_RU t0623 «Тефида; Фетида»: верно, на с. 216 речь о Тефиде (жена Океана), на с. 331 — о Фетиде (свадьба Пелея и Фетиды; в разметке сканов это с. 329–330, нумерация указателя сдвинута, как и с. 85 → скан с. 83).
- **Помпей Фест.** Все 8 мест, где у Картари полное имя (2438, 2446 помета, 2733, 3846, 4195, 4217 помета, 4824, 9908), исправлены во всех трёх языках. Падежи правильные: «Помпей Фест», «у Помпея Феста», «с Помпеем Фестом». Голое «Festo» везде осталось «Фест» / «Festus». Слова «festo» в значении «праздник» в итальянском тексте нет, ни одна такая правка не задета.
- **Акмон.** ru mercurio 437 «Акмон» — верно (TEXT_reading 6024). en/fr уже давали Acmon.
- **Apolline → fr Apollon, Topo → Souris, Girolamo Aleandro.** Правки только в глоссарии и в fr/*.glossary-new.tsv, в текстах глав правок нет; проверено, что fr-тексты уже давали Apollon/souris/Girolamo Aleandro. Даты 1480–1542 и 1574–1629 и упоминание кардинала (TEXT_reading, индийская часть) подтверждаются.

## (C) seconda-parte-indiani

Скан 0604 печатает «dall'Incenſiere». Чтение *dell'* по гравюре — разумное; новая помета [?3] стоит во всех трёх языках, прежние [?3]–[?6] переименованы в [?4]–[?7] и в тексте, и в примечаниях. Пояснения ru/en/fr по смыслу совпадают. Записи «Решено/Resolved/Résolu» добавлены в три файла *.review.md. В QMARKS.md добавлена строка 3, строки 4–7 переименованы, итоговые числа обновлены. Пояснение в строке 4 начинается с текста про «Homopoca»: так было и в прежней строке 3, это не новая ошибка.

## Мои исправления

1. **books/cartari/chapter_links.tsv, стр. 194** (cartm_discordia, minerva 281): якорь «свадьбу Тетиды и Пелея, где были» → «свадьбу Фетиды и Пелея, где были». Замена Тетида → Фетида сломала привязку (сборка ru выдавала ПРЕДУПРЕЖДЕНИЕ); теперь предупреждений 0.
2. **en/proemio.md, стр. 432** (Клавдиан, строфа 10): «when there shall have pity on our ills» → «when on our ills shall take pity». Порядок строк итальянского сохранён (сначала «pietà de' nostri mali», потом «Febo…»), но с «there» фраза была неграмматичной. Число строк не изменилось.
3. **GLOSSARY.tsv стр. 455, NAMES_TYPES.tsv стр. 366, fr/gratie.glossary-new.tsv стр. 2**: ключ «Thetide (Nereide, madre d'Achille)» → «Thetide (Nereide madre d'Achille)». `tools/build_names.py` делит итальянскую колонку по запятой, поэтому запись разваливалась на «Thetide (Nereide» и «madre d'Achille)» (это видно в поле it и в slug в names.json). Проверено: после правки ключи NAMES_TYPES совпадают с глоссарием, а запись собирается как одна.

## Открытые сомнения (не правил)

- catalogo-dei п. 18 и nettuno 88/261: выбор между Фетидой и Тефидой сделан по контексту и обоснован. Сомнения записаны в GLOSSARY_FIXES_2026.md; я с этим выбором согласен.
- GLOSSARY_FIXES_2026.md всё ещё приводит старый ключ «Thetide (Nereide, madre d'Achille)», так как это журнал правок того агента. Настоящий ключ теперь без запятой.
- В `tools/build_names.py` в словаре MERGE осталась запись `"Festo Pompeio": "Festo"`. Она больше ни с чем не совпадает и ничего не ломает, потому что записи уже слиты в глоссарии; её можно удалить.
- Сгенерированные файлы tavola.json (t0623 «Тетида») и names.json устарели, их нужно пересобрать (build_tavola.py, build_names.py) после пересборки chapters_*.json.
- books/cartari/entries.json — отдельный корпус переводов статей. Там остались «Фест Помпей», «Festus Pompeius», «Тетиду» (nettuno), «Алкмон», а en/fr используют Thetis/Thétis для Тефиды в apollo/nettuno. Это вне объёма чистки, не правил.
- ru diana 100 «Далее он продолжает, что истина в том, что…» — грамматически допустимо, но тяжеловесно; можно «Далее он говорит, что истина в том, что…». Оставлено.
