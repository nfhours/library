# Инфраструктура проверки переводов (`_review/grok/`): инструкция для следующей модели

Документ составлен 2026-10-26. Все пути и скрипты ниже проверены на ветке `grok-review`. Что не проверено, помечено «не проверено». Чего нет в репозитории, сказано прямо.

## 1. Жёсткие правила

- Работать только в ветке `grok-review` и писать только в `_review/grok/`.
- Никогда не коммитить в `main` и ничего не сливать (merge).
- Никогда не менять `books/*/entries.json`. Правки предлагаются только в review-файлах (поле `fix`, `orig_after`).
- Без force-push.
- Ничего не выдумывать. Нечитаемое место — «проверить по фото», сомнение — «не уверен» (в SUMMARY.md раздел «Не уверен»).
- Подписи к гравюрам (caption) сохраняются и переводятся, не удаляются.
- Опечатки издания не «исправляются» в оригинале. Меняется только пояснение в issue (вердикт `edition_error`).
- Разница в акцентах (fù/fu, à/a) ошибкой не считается.
- Маргиналии (пометки на полях) фиксируются отдельно, в note, а не как ошибка текста.
- Любое число в отчёте — из запроса или скрипта, выполненного в момент отчёта, а не по памяти.

## 2. Дешёвый клон (shallow, blobless, sparse)

Команды проверены 2026-10-26: клон занимает 2,5 с и 27 МБ, вместе с `_review/`.

```bash
git clone --depth 1 --filter=blob:none --no-checkout -b grok-review https://github.com/nfhours/library.git library
cd library
git sparse-checkout set --no-cone '/books/*/entries.json' '/HANDOFF.md' '/README.md' '/_review/'
git checkout grok-review
```

- В рабочем дереве будут только `HANDOFF.md`, `README.md`, `_review/`, `books/<slug>/entries.json`. Папок `img/`, `pages/` и файлов `book.json` на диске нет, но в git они есть.
- Прочитать один файл без checkout (blob докачается сам): `git show HEAD:books/cartari/img/cart2.jpg > /tmp/cart2.jpg`, `git show HEAD:books/cartari/book.json`.
- Список файлов: `git ls-tree -r --name-only HEAD books/cartari/img`.
- Добавить папку на диск: `git sparse-checkout add /books/cartari/img/`. Она тяжёлая: в cartari 319 файлов в `img/` и 879 в `pages/`.
- Коммит и пуш:
  ```bash
  git -c user.name="Grok Bot" -c user.email="grok-bot@local" commit -m "<книга>: …"
  git push origin grok-review
  git ls-remote origin grok-review   # хэш должен совпасть с git rev-parse HEAD
  ```

## 3. Раскладка репозитория (по `git ls-tree HEAD`)

```
HANDOFF.md, README.md, index.html, app.js, app.css, library.json, motifs.json, img/, _verify/, tools/crop-editor/
books/<slug>/book.json      — метаданные книги
books/<slug>/entries.json   — {"title":…, "items":[…]} (cartari); записи книги
books/<slug>/img/           — обрезанные гравюры (по файлу на запись; имя = поле img)
books/<slug>/pages/         — сканы страниц для раздела «Оригинал»
_review/grok/               — всё, что пишет проверка (см. ниже)
```

Книги: `alciato`, `audran`, `cartari`, `grosson`, `iconologie`, `verrien`.

| книга | img/ | pages/ | review JSON в `_review/grok/<book>/` |
|---|---|---|---|
| alciato | 209 | 209 | 208 |
| audran | 30 | — | 29 |
| cartari | 319 | 879 | 164 |
| grosson | 179 | 22 | 249 |
| iconologie | 448 (+.gitkeep) | 978 | 440 |
| verrien | 3524 | 44 | 1276 |

- `GROK.md` — инструкция пользователя для ревьюера (Grok). В репозитории её нет и не должно быть (проверено `git ls-tree -r HEAD | grep -i grok.md`: пусто); правила из неё передаются в задании. Кратко (по состоянию на 2026-10-26):
  - проверять только переводы (RU/EN/FR) против оригинала; ветка только `grok-review`, писать только в `_review/grok/`; `main` не трогать, не мержить, `entries.json` не править, без force-push;
  - проход A — перевод против оригинала (text_it / text_fr / латынь); если французский — сам перевод, проверять и text_fr; подписи к гравюрам разрешено читать с изображений репо (`img/`, `pages/`);
  - пакеты по 20 записей: после каждого commit + push и отчёт ok/minor/major;
  - ничего не выдумывать: нечитаемое — «проверить по фото», сомнительное — «Не уверен» (раздел в SUMMARY.md);
  - подписи: раздельные поля caption_orig / caption_ru / caption_en (+caption_fr), подписи не удалять, а переводить; в SUMMARY — раздел со списком подписей и их положением; `caption_source` = `engraving` | `text` (null при «проверить по фото»);
  - одна ошибка во многих языках — один `issue_id`, считается один раз (объекты по полям, общий список `fields`);
  - `fix` только для major + high: `{field, paragraph, before, after}`; не давать `fix` для сбоев разбиения текста, «проверить по фото» и «не уверен»;
  - опечатки издания не исправлять (вердикт `edition_error`, правится только объяснение в issue); ударения и u/v — не ошибка; маргиналии — в note; раскрытие тильд проверять;
  - проход B (сверка со сканами) по порядку: cartari, verrien, alciato, iconologie, audran, grosson; партии по 20 мест, после каждой commit + push + стоп + отчёт;
  - verrien, монограммы: партии по 200 только со сканом аномалий (часть 1 — по 20);
  - вести реестр гравюр (`<book>/engravings.csv`) и этот файл.
- Папок `_work/` в git нет, они в `.gitignore`.
- Подробности по проекту — `HANDOFF.md`, особенно раздел 2 (поля) и раздел 4 (cartari).

### Поля `entries.json` (cartari; у других книг см. HANDOFF.md, раздел 2)

`id, num, page, fr, ru, en, name_fr, group, group_en, img, scans, caption, textOnly, text_it, text_fr, text_ru, text_en`.

- `text_*` — **список строк**; элемент списка = «абзац» для нумерации `paragraph` (с 1). Внутри элемента бывают `\n\n`, они абзац не делят.
- `page` — печатная страница или диапазон: `"49-54"`, `"294-296,302,304,311-319"`, бывает `"0.5"`.
- `caption` — подпись под гравюрой на итальянском. `textOnly: "True"` — запись без своей гравюры.
- У cartari оригинал — `text_it`; `book.json.frIsTranslation: true`, то есть `text_fr` — перевод.
- У iconologie, grosson, verrien, audran `sourceIsFrench: true`, то есть `text_fr` — оригинал.
- У alciato настоящий французский перевод лежит в `text_frtrans`.
- В verrien нет поля `en`; поле `flag` там — категория (`medal`/`index`/`blank_page`), а не замечание.
- Grosson: `viewer: "plate"`, записи `pl<N>-<k>` с `plate`, `bbox`, `legend_*`, `obverse_*`, `reverse_*`, `material_*`, `findspot_*`.

### `book.json`

Поля: `slug, title{ru,en,fr,original}, subtitle{…}, author, year, place, idPrefix, viewer, frIsTranslation | sourceIsFrench, …`. `source_url` есть только у audran.

## 4. Содержимое `_review/grok/`

```
_review/grok/INFRASTRUCTURE.md        — этот файл
_review/grok/progress.csv             — прогресс прохода A по пакетам
_review/grok/fix_check.py             — проверка полей fix (единственный скрипт проверки в репо)
_review/grok/tools/*.py               — образцы скриптов прохода B (см. §9)
_review/grok/<book>/SUMMARY.md        — сводка по книге
_review/grok/<book>/<id>.json         — review одной записи
_review/grok/cartari/source_check.csv — сверка со сканом (проход B)
_review/grok/cartari/engravings.csv   — реестр гравюр
_review/grok/audran/labels.csv, notes.csv
_review/grok/grosson/attrs_check.csv, notes.csv
_review/grok/verrien/medal_ru_collisions.csv, monograms_anomalies.csv, monograms_scan.csv,
                     motto_gloss_pattern.csv, plate_notes.csv, summary_notes.csv
_review/grok/verrien/tally.py         — сводка монограмм verrien по партиям (см. §9)
_review/grok/verrien/scan.py          — поиск аномалий в монограммах одной партии (см. §9)
```

`_review/grok/verrien/tally.py` использовался при проверке монограмм verrien (часть 2), но до коммита 2026-10-26 (партия 3 cartari) лежал только вне репозитория, в рабочей папке ревьюера (`git log --all -- '*tally*'` был пуст). Теперь добавлен в ветку вместе с `scan.py`; пути сделаны относительными. Общие счётчики по книгам считаются однострочником (§8).

## 5. Схема review JSON (`_review/grok/<book>/<id>.json`)

```json
{
  "id": "cartm37", "book": "cartari", "pass": "A", "verdict": "minor",
  "issues": [ {…}, … ],
  "source_check": [ {…}, … ]
}
```

Запись: `json.dump(J, f, ensure_ascii=False, indent=2)` и в конце `"\n"`.

- `verdict` записи: `ok` / `minor` / `major` (по самой серьёзной ошибке записи; как применялись критерии — см. раздел «Major» в SUMMARY.md книги).
- `pass` — `"A"` (проход по переводам). Сверка со сканом не меняет `pass`, а добавляет `source_check` и `scan_check`.
- У verrien (монограммы) на верхнем уровне есть ещё `scan: "monogram"` и `anomaly: {kind, note}`.

### Объект issue: один объект на одно поле

| поле | смысл |
|---|---|
| `field` | поле, к которому замечание: `text_ru`, `text_en`, `text_fr`, `ru`, `en`, `name_fr`, `caption_*`, `legend_ru`, `material_ru`… |
| `issue_id` | `<id записи>-<n>`, n с 1 по порядку в записи (`cartm37-4`, `pl10-2-1`). **Одна и та же ошибка в RU/EN/FR — один `issue_id`**, по объекту на каждое поле. |
| `fields` | все поля, где есть эта ошибка (одинаковый список у всех объектов с этим issue_id) |
| `paragraph` | номер элемента списка `text_*` (с 1); `null` — строковое поле |
| `type` | `mistranslation`, `addition`, `omission`, `name`, `ocr`, `typo`, `wrong_article` |
| `original` | цитата оригинала (text_it / text_fr) |
| `current` | текущий перевод |
| `suggested` | предложение + пояснение по-русски; «не уверен» прямо в тексте |
| `confidence` | `high` / `medium` / `low` |
| `caption_source` | только для подписей к гравюрам: `engraving` (подпись прочитана с гравюры или скана) или `text` (взята из текста) |
| `fix` | готовая правка (см. ниже), только для major с confidence high |
| `scan_check` | итог сверки со сканом одной строкой: «Сверка со сканом (с. N): …» |
| `added_in` | `"pass B"` — объект добавлен при сверке со сканом |

### `fix`

`fix` — объект или массив объектов `{field, paragraph, before, after}`.

- `before` — побайтная копия элемента `text_*[paragraph-1]` (или всего строкового поля при `paragraph: null`). Встречается в поле ровно один раз.
- `after` — тот же текст, где изменено только ошибочное место.
- Проверка: `python3 _review/grok/fix_check.py` (флаг `-v` печатает каждую правку с контекстом). Ожидаемый вывод сейчас: `fix по книгам: {'audran': 4, 'cartari': 92, 'grosson': 10} ошибок: 0`.

### `source_check`: сверка со сканом (проход B), массив в JSON записи

```json
{"issue_id":"cartm37-4","scan_url":"https://digi.ub.uni-heidelberg.de/diglitData/image/cartari1626/4/106.jpg",
 "page":"106 → 108","region":"с. 106, последняя строка + кустода; с. 108, 1-я строка",
 "orig_field":"text_it","paragraph":1,
 "orig_before":"<весь элемент text_it побайтно>","orig_after":"<то же, исправлено только место> | null",
 "verdict":"transcription_error","translation_affected":["text_ru","text_en","text_fr"],
 "note":"…","pass":"B","batch":2}
```

Вердикты:

| verdict | смысл | orig_after |
|---|---|---|
| `transcription_error` | text_it расходится с печатью | абзац по скану |
| `edition_error` | опечатка издания, text_it верен печати; меняется только пояснение в issue | `null` |
| `ok` | text_it совпадает с печатью | `null` |
| `проверить по фото` | на скане не читается | `null` |

В тот же issue добавляется `scan_check`. Если ошибка затрагивает перевод, а строки issue для этого поля нет, добавить объект с `added_in: "pass B"` и обновить `fields` у всех объектов этого issue_id. Формулировки «опечатка оригинала» исправлять на «кустода, внесённая при транскрипции», если скан показал кустоду.

`source_check.csv` — по строке на место: `batch, issue_id, entry, page, scan_url, region, paragraph, verdict, translation_affected, text_it_now, text_it_by_scan, note`.

## 6. Реестр гравюр (`<book>/engravings.csv`)

Ведётся для каждой просмотренной страницы скана, и для следующих книг тоже.

| колонка | содержимое |
|---|---|
| `engr_id` | `cart-g-<печатная стр.>-<n>`; для других книг — свой префикс по `idPrefix` |
| `page` | печатная страница |
| `iiif_page_url` | URL страницы (для cartari — `diglitData/image/cartari1626/4/NNN.jpg`) |
| `position` | `full (рамка, вся страница)`, `top, half`, `middle, half`, `bottom, half`, `… (виньетка-концовка)` |
| `entry_id` | id записи или `null` (причина — в notes) |
| `between_entries` | `A (с. p-1) \| B (с. p+1)` или «прерывает текст X»; источник — `[по полю page, не по скану]` или `[по скану]` |
| `caption_on_plate` | подпись как на доске. Если совпадает с `caption` в entries — берётся она (сверка по словам; акценты и u/v отдельно). Не видно — «проверить по фото». **Никогда не сочинять.** |
| `subject_ru` | сюжет коротко по-русски |
| `repo_image` | `img/<файл>`, или «в img указан, файла нет в репо», или «img не указан; скан(ы) в pages/: …» |
| `notes` | расхождения с entries (не та страница, нет файла и т. п.) |

В SUMMARY.md нужен раздел «Реестр гравюр» с числами: строк, гравюр, виньеток, страниц, без записи, «проверить по фото», без файла. Число гравюр включается в каждый отчёт о партии. Образец сборки — `tools/engravings_build.py`.

## 7. SUMMARY.md: обязательные разделы

Образец — `cartari/SUMMARY.md`:
1. `## Итог` — таблица вердиктов (ok/minor/major/всего); уникальные issue_id, вхождения (сумма длин `fields`), объекты; разбивка по полям и типам.
2. `## Major` — список major-ошибок.
3. `## Проблемы разбивки текста` — сбои абзацев, обрывки, слитые подписи.
4. `## Подписи к гравюрам` — по записи на гравюру.
5. `## Не уверен` — всё с «не уверен». После сверки со сканом строку не удалять, а дописать «Скан (проход B, с. N): …».
6. `## Fix` — правила нумерации, число fix.
7. `## Сверка со сканом (проход B, адресный)` — источник, вердикты, подраздел `### Партия N` на каждую партию: таблица вердиктов, «Затронуты переводы», 2–4 главные находки.
8. `## Реестр гравюр`.

## 8. `progress.csv` и счётчики

`progress.csv` — колонки `книга,проверено записей,ok,minor,major`. Строка добавляется после каждого пакета прохода A, значения накопительные: `cartari,40,9,20,11`. Пересчёт пишется отдельной строкой с пометкой в названии, например `cartari (пересчёт после правки подписей к гравюрам),164,35,99,30`. Для подкорпусов — свой ключ: `cartari_fr`, `verrien-p2-mono`.

Счётчики (проверено 2026-10-26):
```bash
python3 - <<'PY'
import json,glob,collections
b='cartari'; V=collections.Counter(); ids={}; objs=0
for fn in glob.glob(f'_review/grok/{b}/*.json'):
    J=json.load(open(fn)); V[J['verdict']]+=1
    for i in J['issues']:
        objs+=1; ids.setdefault(i['issue_id'],set()).update(i['fields'])
print(dict(V),'issue_id:',len(ids),'вхождений:',sum(len(s) for s in ids.values()),'объектов:',objs)
PY
```

## 9. Скрипты

- `_review/grok/fix_check.py` — проверка `fix`; запуск из корня клона: `python3 _review/grok/fix_check.py [-v]`. entries.json только читает.
- `_review/grok/tools/` — образцы из прохода B по cartari. В них зашиты пути `/tmp/hd`, `/tmp/pb`, `/tmp/cart_manifest.json`; перед запуском их надо поправить.
  - `iiif_locate.py` — грубый поиск места: качает страницу по манифесту, делает OCR (`tesseract … -l ita tsv`), ищет фрагмент через difflib и сохраняет кроп. Запуск: `python3 iiif_locate.py "<диапазон стр.>" "<фрагмент>" <issue_id> [доп. страниц]`. **OCR только для поиска; вердикт выносится по изображению.**
  - `page_tops.py <стр>…` — первые слова и кроп верха страницы, чтобы смотреть стыки и кустоды. Подключает `iiif_locate.py` через exec по пути `/tmp/hd/loc.py`.
  - `source_check_batch.py` — пишет `source_check` в `<id>.json` и строки в `source_check.csv`. Кортеж: `(issue_id, стр_для_URL, метка стр., region, find, replace|None, verdict, [поля], note)`. `find` должен встречаться в одном элементе `text_it` ровно один раз, иначе assert. Повторный запуск заменяет записи по issue_id.
  - `scan_check_issues.py` — `scan_check`, правка формулировок, новые объекты issue и выравнивание `fields`.
  - `engravings_build.py` — сборка `engravings.csv` из ручного списка (страница, запись, позиция, сюжет, примечание).
- `_review/grok/verrien/scan.py <первый_id> <n>` — монограммы verrien, часть 2 (`part==2`, `flag==''`): для n записей подряд печатает аномалии (пустые поля, не-буквы, расхождение fr/ru/name_fr/text_*, лишние поля, J/U/W, дубль на одной доске, порядок букв, повтор буквы). Сырой список пишет в `/tmp/verrien_last.json`. Вердикты по каждой аномалии вносятся в `monograms_anomalies.csv` вручную, по фото доски.
- `_review/grok/verrien/tally.py` — без аргументов. Читает `monograms_scan.csv` (берёт batch, first, last, scanned) и `monograms_anomalies.csv` (kind, verdict); **перезаписывает** `monograms_scan.csv` пересчитанными колонками (plain_letters_only, anomalous_entries, real_text_entries, empty, dup_on_plate, caption_typo, edition_quirk, fr_ru_mismatch, issues) и печатает строку `verrien-p2-mono,<scanned>,<обычных>,<со странностями>,<issue>`. Повторный запуск на текущих данных файл не меняет (проверено 2026-10-26: `git diff` пуст). Порядок: сначала добавить строку партии (batch, first, last, scanned) в `monograms_scan.csv` и аномалии в `monograms_anomalies.csv`, потом запустить. Внимание: печатаемая строка — в формате сканирования, а не «ok, minor, major» заголовка `progress.csv`; итог в формате заголовка — `verrien-p2-mono,2062,2051,11,0` (см. verrien/SUMMARY.md).
- Нужны: `python3` с Pillow, `tesseract` с языком `ita` (или `fra`), `curl`.

## 10. Источники сканов

Источники сверены 2026-10-26 (метаданные archive.org через `https://archive.org/metadata/<id>`, сравнение с `books/<slug>/book.json`). Расхождений с перечнем пользователя нет.

| книга | источник | статус |
|---|---|---|
| cartari | Heidelberg UB, Cartari, *Imagini de gli Dei delli Antichi*, Padova 1626, IIIF. Манифест: https://digi.ub.uni-heidelberg.de/diglit/iiif/cartari1626/manifest.json; просмотр: https://digi.ub.uni-heidelberg.de/diglit/cartari1626 | проверено, используется в проходе B |
| iconologie | Internet Archive `iconologieounouv00ripa` — https://archive.org/details/iconologieounouv00ripa (Paris, Louis Billaine, 1677; 550 изображений; совпадает с book.json: 1677, Billaine). Плюс в репо `books/iconologie/pages/` — 978 полных страниц | проверено |
| alciato | Основной источник — `books/alciato/pages/`: факсимиле Holbein Society 1871 (Internet Archive `andreaealciatie00alcigoog`, 295 изобр.; `bib_fict_1727159`, 312 изобр.). Оригинал Lyon, Rouille 1551 — `emblemata00alci_0` (246 изобр.), для спорных мест. book.json: 1551 Lyon — факсимиле воспроизводит это издание | проверено |
| verrien | Internet Archive `livrecurieuxetut00veri` — https://archive.org/details/livrecurieuxetut00veri (Paris 1685; 372 изобр.; совпадает с book.json: 1685) | проверено |
| audran | Internet Archive `gri_proportionsd00audr` — https://archive.org/details/gri_proportionsd00audr (1683; 77 изобр.; = `source_url` в book.json) | проверено |
| grosson | Gallica `bpt6k10402852` — https://gallica.bnf.fr/ark:/12148/bpt6k10402852 (book.json: 1773). Нужен браузер (Gallica не отдаёт страницы простым fetch) | вероятно то же издание; **не проверено** |
| все | сканы в репо: `books/<slug>/pages/` (читать через `git show HEAD:…`) | есть в git |

Cartari, детали:
- В манифесте 639 canvas; `label` = печатная страница (`"52"`), первые canvas — переплёт и форзацы.
- Полная страница: `https://digi.ub.uni-heidelberg.de/diglitData/image/cartari1626/4/%03d.jpg` (по метке: `052.jpg`), 1933×2701 px.
- IIIF Image API 2: `https://digi.ub.uni-heidelberg.de/iiif/2/cartari1626%3A052.jpg/{x,y,w,h}/full/0/default.jpg`. Кроп `0,2000,1933,701` проверен, ответ 200. info.json: `…%3A052.jpg/info.json`.
- Номер в адресе просмотрщика (`/diglit/cartari1626/0536`) — порядковый номер canvas, не страница. Для с. 494 это 0536.
- Разрешение: для курсива и кустод нужна полная ширина (1933 px) и кроп по высоте 300–700 px. Миниатюры 483 px годятся только для позиции гравюры, не для чтения.
- Суффикс `_pNNN` в именах `books/cartari/pages/` (например, `carta9_p534.jpg`) — по-видимому, номер скана в исходной съёмке, а не печатная страница. Не проверено.

## 11. Подводные камни

- **Кустоды (catchwords).** Внизу страницы печаталось первое слово следующей; транскрипция часто вносит его в текст. Отсюда дубли: «non non», «Marco Marco», «temeuano temeuano», «& &», «Tali Tali», «del do», «minuti nuti». В проходе A их называли «опечатками оригинала» — почти всегда это ошибка транскрипции. Бывает, что кустода издания сама не совпадает с началом следующей страницы (cartari с. 111/112: «che» / «cose»).
- **Стыки страниц через гравюру.** Полностраничная доска стоит между двумя страницами текста (с. 61, 98, 100, 107, 180, 199, 281, 326, 357, 400…). Обрывок слова до доски и после неё может попасть в разные записи: «Mar-|te» → «re,» в cartm_furoreira; «ba-|stasse» → «stasse.» в cartm_tifone; «huomi-|ni» → «ni di conto» в cartm54. Перевод обрывка обычно оказывается догадкой («Молву», «довольно»).
- **Ложный разрыв абзаца посреди слова:** `te-\n\nste`, `conuiene\n\nviene`, `conto\n\ncontò`.
- **Тильды:** `ẽ/ã/õ` = пропущенное n/m (`scriuẽdo` = scriuendo, `grãdi` = grandi, `fiãma` = fiamma). Проверять, что тильда раскрыта, а не потеряна (`cartm80-3`: «gradi» вместо «grandi»).
- **Акценты и u/v, ſ/s** — не ошибка (`fù/fu`, `vn/un`).
- **Ошибка издания или транскрипции.** Если в печати то же, что в text_it, — `edition_error`, text_it не трогать (`cartm28-5` «ascinga», `cartm81-3` «ferro», `cartm84-2` «capi», `cartm_genio-4` повтор). Конъектуры («campi», «affetti») — только «не уверен».
- **Маргиналии** («Car. 246», «Lin. 33», «Licrofonte» на полях с. 301) в text_it не входят, отмечаются в note.
- **Ошибки печатной нумерации:** у cartari с. 85 напечатана как «95». Метка в манифесте правильная.
- **Verrien, монограммы (2062 записи часть 2).** Проверяются пакетами по 200 (`monograms_scan.csv`). Типичные странности издания, которые не являются ошибками данных: `dup_on_plate_edition_variant` (одна буква выгравирована дважды как два варианта), `caption_letter_order_edition`, `caption_wraparound_edition`, `sequence_gap` (пропуск в самом издании: IPY, EOT). Ошибки: `caption_typo`, `dup_on_plate_caption_typo` (например, «AE» вместо «AF»). JSON заводится только для записей со странностями (`scan: "monogram"`, `anomaly.kind`), обычные только считаются. Подробно — `verrien/SUMMARY.md`, раздел «Вторая часть: монограммы».
- **Grosson, `material_*`** — по решению пользователя только заметка о закономерности, не issue. Металл в тексте статьи обычно не назван; проверяется только, что ru/en верно переводят fr и не противоречат тексту или гравюре (единственная ошибка — `pl32-1-1`, jade → «яшма»). См. `grosson/SUMMARY.md`, «material_* — заметка о закономерности».
- **cartari: `page` в entries бывает неверным** (найдено по реестру: cartm49 — 150 вместо 157, carta9 — 494 вместо 495, гравюра с. 100 принадлежит cartm34, а не cartm_dianamoon). Номер страницы для поиска брать из поля, а проверять по скану.

## 12. Порядок работы партиями

1. `git pull` в ветке `grok-review`, `git status` должен быть чистым.
2. Очередь мест: issue с type `ocr`, «не уверен», «проверить по фото», упоминания скана; приоритет — стыки страниц и кустоды.
3. Партия: **20 мест** (для монограмм verrien — **200 записей**). На каждое место:
   - найти страницу (поле `page` ± соседние, OCR-поиск);
   - посмотреть кроп глазами: конец страницы, кустоду, начало следующей;
   - вынести вердикт;
   - записать `source_check`, `scan_check`, новые объекты issue;
   - внести в реестр все гравюры на просмотренных страницах.
4. Проверки: `python3 _review/grok/fix_check.py`; assert уникальности `find` в скрипте партии; счётчики (§8).
5. SUMMARY.md: подраздел `### Партия N`, обновить «Реестр гравюр» и «Не уверен».
6. Коммит, `git push origin grok-review`, сверить с `git ls-remote`. **Остановиться** и отчитаться кратко по-русски:
   - проверено мест / всего;
   - вердикты (transcription_error / edition_error / ok / проверить по фото);
   - сколько затронуто переводов;
   - 2–4 находки;
   - число гравюр в реестре;
   - хэш коммита.
