# Гроссон: сверка транскрипции со сканами (только отчёт)

Проверялось, как записан французский оригинал (text_fr, legend_fr, obverse_fr, reverse_fr, material_fr, findspot_fr; названия fr/name_fr — редакционные, сверялись только по смыслу) против печатных страниц и планшетов 1773 г. Сканы: `~/Projects/photos/grosson/raw/` (PDF 1–20, front, discours) и `raw_extracted/`. Данные не менялись. Сверку вели независимые проверяющие по девяти срезам (весь список записей, страница за страницей); данные из PDF читались глазами (tesseract eng на длинном s слабый), поэтому оценки «ок» — «замечаний не найдено», а не гарантия. Формат — как в `grosson-audit.md`.

Серьёзность: **критично** — искажён смысл/числа/имя/надпись, не та запись, пропущен или выдуман целый кусок; **заметно** — потеряна/добавлена фраза или строка надписи, неверное слово; **мелочь** — буква, диакритика, пунктуация, разрыв строк надписи. Тип **орфография** — запись набрана не как в печати.

## Сводка

- Всего записей: 249; без замечаний: **135**; с замечаниями: **114**.
- Замечаний всего: **172** — критично 11, заметно 32, мелочь 129.
- Записей по наибольшей серьёзности замечания: критично — 9, заметно — 27, только мелочи — 78.
- По типам: надпись — 49, пропуск — 45, орфография — 26, ошибка чтения — 25, прочее — 20, не та запись — 4, лишнее — 3.

### Орфография печати (правило библиотеки)

- Основной текст Гроссона записан **в орфографии печати**: «étoit/étoient», «&», «Monumens», «Colier», «tems», «monnoie», опечатки печати (caractérisques, Monfaucon, «plance LVIII», «leur écrits») переданы. Проверяющие оценили записи: «как напечатано» — 239, «смешанно» — 7, «n/a» — 3 (записи без текста). Целиком в современной орфографии не записана ни одна запись.
- Единичные модернизации есть в **23** записях (9%): диакритика («différe» вместо «diffère», «coûteuses», «récupérer»), «François» вместо «Français», «Cyrénéen», «Église»/«collège» вместо «Eglise»/«college», потеря лигатур Æ/Œ («Provinciæ» → «Provincia/ae»), нормализованное «M.» вместо «Mr.», раскрытые/нормализованные написания надписей (U вместо V, Æ → AE, точки и разрыв строк потеряны). Записи: pl1-17, pl5-4, pl7-1, pl8-2, pl8-8, pl9-2, pl9-3, pl9-4, pl9-5, pl11-1, pl12-1, pl14-2, pl14-3, pl15-2, pl16-2, pl35-1, pl37-2, pl40-4, pl41-4, pl42-1, frag-1, frag-5, frag-18.
- Системно (не считалось ошибками, но отличается от печати): тексты сносок и маркеры (1)–(93) в text_fr, как правило, не перенесены; квадратные скобки печати [ ] часто заменены круглыми; начальные номера абзацев («8.», «9.») не переносились.

### Группа pl1–pl7 (монеты и медали, в прошлом аудите сканами не проверялась)

Сверена по печатным стр. 24–61 и планшетам I–VII полностью (все 81 записей): записей с замечаниями **24**; замечаний: критично 3, заметно 8, мелочь 24. Главное (вне группы — pl8-2: пропущено ~27 строк печ. 65 и вставлена фраза, которой в печати нет): pl1-19 (пропущены два абзаца стр. 31 о Magistrature de Marseille и Timouchos), pl1-12 (примечание и сноска (1)), pl3-1 (вводная фраза планшета III, перефразирование), pl5-9 (чужой кусок сноски (17) вклеен в основной текст), pl7-1/pl7-2 (пропущены два куска о Mariana и Bulgaran, фраза о монете Клотера в не той записи), pl6-2 («VICTYRIA» с Y), pl6-5 («SEGTBERTVS»).

### Топ-10 самых проблемных записей

| # | id | запись | критично | заметно | мелочь |
|---|---|---|---|---|---|
| 1 | pl7-1 | Бюст (юноша) / крест — Хлотарь II / Buste (jeune homme) / Croix — Clotaire II | 2 | 1 | 2 |
| 2 | frag-20 | Эпитафия Гая Постумия Венуста от его супруги и наследницы Росции Лоха… / Épitaphe de Caius Postumius Venustus, par son épouse et héritière Ros… | 2 | 0 | 1 |
| 3 | pl5-9 | Диана / рог изобилия / Diane / Corne d'abondance | 1 | 0 | 2 |
| 4 | pl8-2 | Бюст / крест — Хлотарь I или II / Buste / Croix — Clotaire Ier ou II | 1 | 0 | 2 |
| 5 | frag-19 | Эпитафия Флавии Телесфорианы и Флавии Фронти, обеспеченных по завещан… / Épitaphe de Flavia Telesphoriana et Flavia Fronti, dotées par testame… | 1 | 0 | 2 |
| 6 | pl13-1 | Фрагмент алтаря с надписью (предположительно финикийские знаки) / Fragment d'autel inscrit (caractères phéniciens présumés) | 1 | 0 | 1 |
| 7 | pl14-2 | Боковая сторона гробницы (фестон и ленты) / Face latérale du tombeau (feston et rubans) | 1 | 0 | 1 |
| 8 | frag-9 | Неясный фрагмент: ...ATRI P. YCAR O. / Fragment incertain: ...ATRI P. YCAR O. | 1 | 0 | 1 |
| 9 | frag-10 | Фрагмент: Августий, опекун Августалия / Fragment: Augustius, tuteur d'Augustalis | 1 | 0 | 0 |
| 10 | frag-11 | Фрагмент из некрополя в устье Юво (имя Никомед) / Fragment de la nécropole de l'embouchure de l'Huveaune (nom de Nicomè… | 0 | 3 | 1 |

(Рейтинг: критично ×100 + заметно ×10 + мелочь ×1.)

## Таблица замечаний

Порядок: критично → заметно → мелочь, внутри — по порядку записей. «Скан» — где смотрели (PDF, страница PDF, печатная страница).

| id | поле | тип | серьёзность | в печати | у нас | примечание |
|---|---|---|---|---|---|---|
| pl5-9 | text_fr | лишнее | критично | «le revers représente une corne d'abondance, au milieu des deux constellations de Castor & Pollux…» (стр. 49); текст «Effigie, avec les attributs du jeu sur le revers. (… | «le revers représente une Effigie, avec les attributs du jeu sur le revers (c'étoit peut-être les Jettons de la Société), une corne d'abondance…» | текст сноски вклеен в основной текст; «sa Société» -> «la Société»; в печати после «représente une» идёт сразу «corne d'abondance» |
| pl7-1 | text_fr | пропуск | критично | после «…du temps que Gondemar régnoit en Espagne.»: «Marianna ajoute que cela se prouve par les lettres d'un Comte de ce temps-là, appellé Bulgaran, Gouverneur de la Gau… | отсутствует | пропущено ~70 слов с датами 610-613 и именами |
| pl7-1 | text_fr | пропуск | критично | после «…forcer d'être Arienne.»: «Les meilleurs Historiens Espagnols [dit M. Leblanc], demeurent d'accord que ces Princes ravagerent & pillerent une partie de l'Espagne;… | отсутствует | два крупных пропуска; без них «Ce sentiment» повисает |
| pl8-2 | text_fr | пропуск | критично | …jaloux de conserver à leur Patrie ce titre de Souveraineté particulière. Lorsque cette Ville fit successivement avec les Comtes de Provence, Raymond Berenger & Charles … | «…jaloux de conserver à leur Patrie ce titre de Souveraineté particulière, jusques à sa réunion définitive à la Monarchie Françoise; ce Privilège honorifique est trop gl… | пропущено ~27 строк печ. стр. 65 (конвенции, Louis XI, Forbin, дата 19 Janvier 1481, сноски 42-43 с латинским текстом); вместо них вставлено «jusques à sa réunion définitive à la Monarchie Françoise», которого в печати … |
| pl13-1 | text_fr | не та запись | критично | «Le Fragment de Bas-relief en marbre blanc, représenté sous le n°. 1 de cette Planche, a été trouvé dans Marseille, & a long-temps resté incrusté sur la Forteresse de No… | «No. 1. Fragment de marbre blanc, sur lequel on remarque des caractères qui ne ressemblent à aucun de ceux que je connois; je soupçonne qu'ils pourroient être Phéniciens… | запись — пересказ/перефразировка, а не печатный текст: почти ни одной фразы дословно; потеряны: находка в Марселе, «au bout du mur», сомнения о назначении, показ знатокам, рассуждение о торговле с Финикией, «Seroit-il s… |
| pl14-2 | text_fr | не та запись | критично | (30) Ruffi, Hist. de Marf. Ce Palais étoit où fe trouve actuellement le Domaine des Bernardines: le Roi René l'avoit habité fur fes derniers jours; il y fit même fon Tes… | (Note: ce Tombeau se trouvait placé où se trouve aujourd'hui le Domaine des Bernardines; ...) | это сноска (30) к абзацу 4 записи pl14-1 (о Palais графов), стоит в pl14-2; Palais заменено на Tombeau (смысл искажён), опущено «Ruffi, Hist. de Marf.», современная орфография (trouvait, aujourd'hui) |
| frag-9 | text_fr | не та запись | критично | №9: «Les Auteurs du manuscrit de la Massiliographie nous apprennent que le fragment d'épitaphe sous ce numero, étoit dans le terroir de cette Ville. « Ce fragment [disen… | начинается с «Ducange dans son Glossaire (41), cite l'inscription suivante comme Marseilloise. Vetus inscriptio Massiliae...» | в печати №9 = D.M./M C/OLVTIMOS/ATRI. P./YCAR/O. с абзацем про рукопись и Плутона (пропущен целиком); фраза про Дюканжа и сноска (41) относятся к №10 (Augustius) |
| frag-10 | text_fr | лишнее | критично | в печати №10: «Ducange ... cite l'inscription suivante comme Marseilloise ... fragment d'épitaphe, ainsi qu'on peut le remarquer: AVGVSTIVS / AVGVSTALIS TVTOR / CONNIVEN… | «Autre fragment d'inscription cité par Ruffi; c'est le reste de la dédicace d'un monument élevé par des neveux ... FLAVIA IVLIANA NEPOTES. Une autre citation, dans le mê… | на стр. 276 нет предложений про Ruffi, neveux, FLAVIA IVLIANA NEPOTES и «Autre citation»; в печати вводная фраза — про Дюканжа (у нас она оказалась в frag-9). Сноска (41) отсутствует. Нужна проверка по планшету 44 (исто… |
| frag-19 | text_fr | пропуск | критично | Le regret de la perte de trois personnes du sexe, auxquelles trois parens ou amis tenoient par les liens de la reconnoissance, les avoit réunis, pour leur élever à frais… | (абзаца нет; после фразы «...gardien de ces monumens (30).» сразу сноска 30) | пропущен целый абзац на стр. 285 |
| frag-20 | text_fr | пропуск | критично | L'enthousiasme que nous causent les premières lectures de leur histoire, faites dans un âge peu propre à réfléchir, accompagné des éloges démesurés qu'on leur prodigue d… | (абзац отсутствует; после «Antinous n'eut-il pas des Autels chez ces mêmes Romains?» сразу «Le nom de LOCHAGIA») | пропущен длинный фрагмент стр. 286-287 и маркер (32) |
| frag-20 | text_fr | пропуск | критично | (32) Ce que nous nommons par habitude la grandeur des Romains ne mérite pas toujours ce nom, mais ils eurent des Historiens, des Poëtes & des Orateurs célèbres qui suren… | (сноска 32 отсутствует) | пропущена сноска 32 (стр. 287) |
| pl1-12 | text_fr | пропуск | заметно | …dont on voit encore les vestiges. [Voyez les comment. de César, lib. II. de Bello Civili. Les Troupes qui furent laissées en garnison dans ce nouvel établissement, port… | текст обрывается на «…les vestiges.» | пропущены скобочное примечание и сноска (1) (если не хранятся в другом поле) |
| pl1-19 | text_fr | пропуск | заметно | после «susceptible de difficultés.»: La Magistrature de Marseille étoit composée de six cents Citoyens (4), sous le nom de Timouchos. Il n'est pas naturel qu'on eût perm… | после «difficultés.» сразу абзац «Le revers de cette Médaille est un Taureau menaçant…» | пропущено ~28 строк печ. текста о магистратуре/Timouchos (стр. 31); фраза о реверсе вынесена в отдельный абзац (в печати — конец сплошного текста). Возможно, текст в другой записи, но в этой отсутствует |
| pl3-1 | text_fr | ошибка чтения | заметно | Celle comprise sous le numéro 1, représente la tête d'Apollon, & sur le revers, un Cheval broutant l'herbe; la contre-marque est un Delta. | Celle désignée par le n°. 1, représente d'un côté la tête d'Apollon, & sur le revers, un Cheval broutant l'herbe; la contre-marque est un Delta. | Начало перефразировано по образцу Pl. IV (в печати «comprise sous le numéro 1», без «d'un côté»; «&» vs «&» ок). Также опущена вводная фраза «Les Médailles contenues dans cette Planche, sont toutes en bronze, & des même… |
| pl6-2 | text_fr/legend_fr | надпись | заметно | «O. VICTYR IA» (Y, не V; пробел перед IA, как напечатано) | «O. VICTVR IA» / «O VICTVRIA» | в печати Y в слове VICTYR; в legend_fr ещё нет точки и пробела |
| pl6-5 | text_fr/legend_fr | надпись | заметно | «SEGTBERTVS. R.» (T вместо I, и в гравюре так же) | «SEGIBERTVS. R.» | печатная опечатка надписи исправлена; нужно «SEGTBERTVS» |
| pl6-5 | reverse_fr | лишнее | заметно | в тексте только «la Croix semblable à celle… avec l'abréviation MA» | «le mot MASSILIA effacé pour partie par le temps» | утверждения нет в печатном тексте (выдумка/перенос из №10) |
| pl7-1 | text_fr | не та запись | заметно | «M. Bonami, dans son Mémoire… cite cette Médaille sous ce seul titre: Monnoie de Clotaire, frappée à Marseille.» стоит на стр. 57 в конце описания №2 (после «impossible … | это предложение в конце текста pl7-1 | принадлежит pl7-2; в pl7-2 его нет |
| pl7-2 | text_fr | пропуск | заметно | «…il est difficile, & même impossible de le décider. M. Bonami, dans son Mémoire inséré dans le Recueil de l'Académie des Inscriptions, cite cette Médaille sous ce seul … | обрывается на «impossible de le décider.» | последнее предложение стоит в pl7-1 |
| pl14-1 | legend_fr | надпись | заметно | на планшете: DVLCISSIMO T. INNOCENTIS / FILIO TANNONIO QVI VIXIT / ANNOS V.M.VI.D.VI. TANNONIVS / T. VALERIANA PARENTES FILIO / CARISSIMO ET OMNI TEMPORE / VITAE SVAE DE… | развёрнутая версия из текста книги (TITO INNOCENTISSIMO (DIIS)... TITA VALERIANA) | legend_fr = раскрытый текст из печ.125, не надпись планшета; надпись на камне другая (сокращения, INNOCENTIS, T. VALERIANA, D M) |
| pl26-1 | text_fr | надпись | заметно | Desinit in piscem mulier formosa superne | Definit in piscem... | Гораций: в печати Deſinit (длинное s), у нас прочитано как f |
| pl32-6 | text_fr | ошибка чтения | заметно | ce qui confirme que ce terrain | ce qui confirmé que ce terrain | лишний акцент, искажена форма |
| pl32-7 | legend_fr | надпись | заметно | на гравюре 4 строки: ΛΕΥΛΗΜΟΣ ΛΙΟΝΥΣΙΟΥ / ΓΕΒΑΙΤΕΡΟΣ ΝΙΚΗΣΑΣ / ΕΦΗΒΟΥΣ ΕΥ ΤΑΞΙΑΙ / ΚΑΙ ΓΙΜΑΣΙΑΡΧΗΣΑΣ ΔΙΣ | ΛΕΥΔΗΜΟΣ ΔΙΟΝΥΣΙΟΥ ΓΕΒΑΙΤΕΡΟΣ ΝΙΚΗΣΑΣ ΕΦΗΒΟΥΣ ΕΥ ΤΑΞΙΑΙ ΚΑΙ ΓΙΜΑΣΙΑΡΧΗΣΑΣ ΔΙΣ | гравёр вырезал Λ вместо Δ (ΛΕΥΛΗΜΟΣ, ΛΙΟΝΥΣΙΟΥ); у нас Δ (исправление). Разрывы строк потеряны. Проверено по крупному кропу |
| pl37-1 | legend_fr | надпись | заметно | на гравюре: ΕΤΟΥΣ ϚΙΤ(с чертой) ... ΑΓΑΝΑΙΟΥ ... ϘΒ (коппа/стигма, а не Σ/Ψ) | ΕΤΟΥΣ ΣΙΤ ΛΛΗΝΟΣ ΑΓΑΝΑΙΟΥ ... ΖΗΣ ΑΣΕ ΤΗ ΨΒ | легенда нормализована/не буква в букву с гравюрой (архаичные знаки стигма/коппа, разбивка строк); читал неуверенно, нужна проверка по большому кадру планшета 37 |
| pl37-2 | legend_fr | надпись | заметно | на гравюре: ... ΔΙΑΣ ΝΙΚΟΥΣ (сн. 9 печатает NIKOYS); ΟΣ ΚΑΙ ΔΙΑΣ | ΔΣ ΚΑΙ ΔΙΑΣ ΝΙΚΟΣ | расхождения в греческой легенде (ΔΣ vs ΟΣ, ΝΙΚΟΣ vs ΝΙΚΟΥΣ); нужна перепроверка по плакату |
| pl38-1 | legend_fr | надпись | заметно | на гравюре: D M / T PVBL RVFINI / T PVBL CHA TO / SEX LVCIL FLAVIANVS / FRATRES | D M TITI PVBLI RVFINI TITVS PVBLIVS CHARITO SEXTIVS LVCILLVS FLAVIANVS FRATR ES | легенда — расширенное чтение из текста, а не надпись на камне; 'FRATR ES' с лишним пробелом |
| pl38-2 | legend_fr | надпись | заметно | на гравюре: D M / COSSVTIAE / VICTORIA / OMP. ABAS / CANTVS CO / IVGI. EIIS / SI F AE | D M COSSVTIAE VICTORIA POMPEA ABASCANTVS CONIVGI EIVS SACRVM IVSSIT FIERI AERE | легенда дана по расширению в тексте (стр. 247), не по гравюре |
| pl39-5 | legend_fr | надпись | заметно | на гравюре и в тексте стр. 253: T. DOMITIO ASI / ATICO LALIHE / COLVCI OPTIMO / ID SIBI. | T DOMITIO ASI ATICO LALIHE CONIVGI OPTIMO ID SIBI (и в text_fr 'CONIVGI') | в печати COLVCI (вариант для CONIVGI, сн. текст объясняет 'COLVCI pour Conjugi'); у нас в надписи CONIVGI — подмена |
| pl42-3 | legend_fr | надпись | заметно | гравюра: Τ·ΠΟΡΚΙΩ·ΠΡΟΚΛΟΥ,ΑΛΙΑΝΟΥ·ΕΞΟΧΟ / ΤΑΤΟΥΑΝΔΡΟΣ,ΚΑΙ·ΠΡΟΦΗΤΟΤ·ΤΟΩ / ΚΥΡΕΙΝΑ,ΚΟΡΝΗΛΙΑΝΩ·ΙΕΡΕΙΑΕΥΚΟΘΕΑ, / ΧΙΛΙΑΡΧΩ ΛΕΓΙ·ΕΑ·ΠΟΛΙΑΡΧΕΙΔ,ΧΟΟΡΤ / Θ ΒΑΤΑΟΝΩΝ,... (всего 12… | ΤΠΟΡΚΙΩΠΡΟΚΛΟΥ ΑΙΛΙΑΝΟΥ ΕΞΟΧΩΤΑΤΟΥ ΑΝΔΡΟΣ ΚΑΙ ΠΡΟΦΗΤΟΥ | легенда — нормализованное начало надписи, обрывается на 2 строках из 12; ΑΙΛΙΑΝΟΥ вместо ΑΛΙΑΝΟΥ, ΕΞΟΧΩ вместо ΕΞΟΧΟ, ΠΡΟΦΗΤΟΥ вместо ΠΡΟΦΗΤΟΤ, нет точек/разрывов. Гравюра искажённая; сверять нужно как напечатано |
| frag-5 | text_fr | пропуск | заметно | Ruffi ne s'étoit point attaché à la connoissance des antiquités; on s'en apperçoit aisément à la lecture de son ouvrage. Une lettre mutilée est souvent mal interprétée p… | … l'inscription n'auroit autrement aucun sens. Je lis dans le sens suivant ... | пропущены 3 предложения между «aucun sens.» и «Je lis» |
| frag-6 | text_fr | пропуск | заметно | dans la cérémonie de la dédicace de l'ex-voto. En ce cas il faut de nécessité admettre que cette inscription n'est qu'un fragment d'une plus grande. Je crois qu'on doit … | ...de l'ex-voto. Je crois qu'on doit la lire comme il suit: | пропущено предложение «En ce cas il faut ... plus grande.» |
| frag-8 | text_fr | пропуск | заметно | (40) ... Saint Lazare étoit même nommé St. Ladre. Voyez l'histoire des Ordres Royaux, &c. de Notre-Dame de Mont-Carmel & de St. Lazare par Mr. Gautier de Sibert. Paris 1… | ... nommé St. Ladre. | пропущена библиографическая ссылка в сноске 40 |
| frag-11 | text_fr | пропуск | заметно | dont les ruines se voient encore à deux toises de distance. J'ai parcouru attentivement ces ruines, & j'ai apperçu que cet édifice devoit avoir beaucoup contribué à dégr… | ... l'ancienne Abbaye des Prémontrés. Les pierres taillées ... | пропущены два предложения |
| frag-11 | text_fr | пропуск | заметно | (42) Je crois inutile de dire ici les raisons qui font rejetter l'opinion de ceux qui croient que les Cassianites de St. Sauveur avoient autrefois leur Abbaye en ce lieu… | нет маркера (42) и сноски | пропущена сноска целиком |
| frag-11 | text_fr | надпись | заметно | D. M. / / ARVNI / / ¤¤¤¤¤ / IVN ¤ ¤ I ¤ IDIS / ¤¤¤¤¤ / SECVNDI ¤ F / NICOMEDIS ¤ ¤ / ¤¤¤¤¤ / ¤ ¤ NR ¤ / ¤ / ¤ ¤ | ... [caractères effacés] ... NICOMEDIS [caractères effacés et illisibles] | последняя строка с NR и штрихами опущена, лакуны заменены пояснением; «ARVNI» в печати в рамке /ARVNI/ |
| frag-12 | text_fr | пропуск | заметно | ce Couvent ainsi que je l'ai observé (43), est bâti sur une portion ... C'est de là que cette épitaphe avoit sans doute été tirée; elle étoit gravée sur une pierre dure … | ce Couvent est bâti sur une portion ... cimetière. On y lisoit: | пропущены «ainsi que je l'ai observé (43)» и предложение «C'est de là ... pierre dure (44)» |
| frag-12 | text_fr | пропуск | заметно | (43) Page 96. (44) Ce qu'on nomme à Marseille pierre froide ou pierre dure, est une espece de marbre gris cendré mêlé de fragmens de coquillages & de parties cristallisé… | — | сноски 43 и 44 отсутствуют |
| frag-21 | text_fr | пропуск | заметно | Ce local est pourtant celui sur lequel les antiquités seroient plus facilement déterrées. Toutes les maisons qui y sont bâties, sont sur la roche vive; la terre des cime… | (пропущено между «...le moindre doute.» и «Ainsi mettons l'opinion...») | пропущены две фразы, стр. 289; ours: «qui établissent le moindre doute. Ainsi mettons» |
| greek-p1 | text_fr | пропуск | заметно | mais les fouilles dans les terrains qui ont servi de cimetière, ou qui ont contenu des édifices publics dans les temps de Marseille ancienne, ne sont pas totalement épui… | (обрыв на «...l'usage commun des deux langues dans Marseille.» затем только сноска 38) | пропущено окончание вступительного абзаца (стр. 294) и сноска 39 (общий текст greek-p1..p5; примечание: возможно, 5 записей делят один абзац намеренно, но концовка не приведена) |
| greek-p2 | text_fr | пропуск | заметно | mais les fouilles dans les terrains qui ont servi de cimetière, ou qui ont contenu des édifices publics dans les temps de Marseille ancienne, ne sont pas totalement épui… | (обрыв на «...l'usage commun des deux langues dans Marseille.» затем только сноска 38) | пропущено окончание вступительного абзаца (стр. 294) и сноска 39 (общий текст greek-p1..p5; примечание: возможно, 5 записей делят один абзац намеренно, но концовка не приведена) |
| greek-p3 | text_fr | пропуск | заметно | mais les fouilles dans les terrains qui ont servi de cimetière, ou qui ont contenu des édifices publics dans les temps de Marseille ancienne, ne sont pas totalement épui… | (обрыв на «...l'usage commun des deux langues dans Marseille.» затем только сноска 38) | пропущено окончание вступительного абзаца (стр. 294) и сноска 39 (общий текст greek-p1..p5; примечание: возможно, 5 записей делят один абзац намеренно, но концовка не приведена) |
| greek-p4 | text_fr | пропуск | заметно | mais les fouilles dans les terrains qui ont servi de cimetière, ou qui ont contenu des édifices publics dans les temps de Marseille ancienne, ne sont pas totalement épui… | (обрыв на «...l'usage commun des deux langues dans Marseille.» затем только сноска 38) | пропущено окончание вступительного абзаца (стр. 294) и сноска 39 (общий текст greek-p1..p5; примечание: возможно, 5 записей делят один абзац намеренно, но концовка не приведена) |
| greek-p5 | text_fr | пропуск | заметно | mais les fouilles dans les terrains qui ont servi de cimetière, ou qui ont contenu des édifices publics dans les temps de Marseille ancienne, ne sont pas totalement épui… | (обрыв на «...l'usage commun des deux langues dans Marseille.» затем только сноска 38) | пропущено окончание вступительного абзаца (стр. 294) и сноска 39 (общий текст greek-p1..p5; примечание: возможно, 5 записей делят один абзац намеренно, но концовка не приведена) |
| pl1-4 | legend_fr/reverse_fr | прочее | мелочь | в тексте печати: «AAE» (малые капитали) | ΛΛΕ | греческая форма взята с гравюры (там читается скорее ΛΜΕ/ΛΛΕ, неуверенно); text_fr «AAE» верен печати |
| pl1-5 | legend_fr/reverse_fr | прочее | мелочь | текст: «A, H en caracteres grecs»; на гравюре внизу ΛΗΠ/ΑΗΠ | ΑΗΠΙ | чтение с гравюры неуверенное, в тексте только A, H |
| pl1-15 | text_fr | пропуск | мелочь | s'interpréter autrement (2). + сноска (2): J'ai en mon pouvoir une de ces Médailles, trouvée, avec nombre d'autres pareilles, à Martigues, Colonie Marseilloise; ce qui m… | «autrement.» без маркера и сноски | нет знака сноски и самой сноски |
| pl1-17 | text_fr | пропуск | мелочь | Lacydon (3), Massiliensium Portus + сноска (3): Édition d'Isaac Vossius, chez Ulacq, à la Haye, 1658. les autres Éditions de Pierre-Jean Olivier, en 1557, de Henri Estie… | «Lacydon, Massiliensium Portus» без маркера | нет маркера и сноски (3) |
| pl1-17 | text_fr | орфография | мелочь | Cyrenéen; J. C. | Cyrénéen; J.C. | единичные модернизации |
| pl2-7 | legend_fr/reverse_fr | надпись | мелочь | les lettres I P L en caractères grecs (в тексте набрано латиницей I P L; на гравюре ΗΠΛ/ΙΠΛ) | MASSA ΙΠΛ (греческими буквами) | Печатный текст даёт латинские IPL; греческая транслитерация — редакторская; на планшете нижние буквы читаются как ΗΠΛ (неоднозначно). |
| pl3-2 | text_fr | ошибка чтения | мелочь | la recolte du vin | la récolte du vin | В печати «recolte» без акута. |
| pl3-3 | text_fr | ошибка чтения | мелочь | differe / différe → печать «diffère» | differe ... différe | В печати оба раза «diffère» (в первом случае набрано «diftère» = diffère с долгой s); у нас неверные акценты. |
| pl3-8 | text_fr | ошибка чтения | мелочь | ne diffère que par un serpent | ne différe que par un serpent | Печать: «diffère». |
| pl5-2 | reverse_fr/legend_fr | прочее | мелочь | в тексте №2 слова MASSALIETON нет (есть на гравюре по-гречески) | MASSALIETON | легенда взята с гравюры/из соседних номеров, в печатном описании отсутствует |
| pl5-4 | text_fr | орфография | мелочь | «couteuses» (без акцента), «alloi» | «coûteuses», «aloi» | две мелкие модернизации; «aloi» — печать «alloi» (de bon alloi) |
| pl5-4 | text_fr | пропуск | мелочь | сноска (16) «Ce qui sert à prouver cette vérité, c'est que les Marseillois étoient en usage de donner un côté de la Médaille à chaque croyance, lorsqu'ils en mettoient l… | нет сноски и маркера | сноска печати отсутствует в записи (если не хранится отдельно) |
| pl5-8 | text_fr | пропуск | мелочь | маркеры сносок (17), (18); сноска (17) про Copa Syrisca и сноска (18) «Dict. de Boudot, au mot Redimitus» | нет | сноски не перенесены |
| pl5-9 | text_fr | пропуск | мелочь | маркер (19) и сноска «Voyez sur cette Médaille, Beger antiq. de l'Électeur Palatin, page 194, 195 & 196, cité par M. Germain, Mémoire manuscrit.» | нет |  |
| pl5-9 | reverse_fr | прочее | мелочь | в тексте — «une corne d'abondance… deux étoiles & les deux bonnets de la liberté» | «corne d'abondance entre les deux étoiles de Castor et Pollux et deux bonnets» | редакционный пересказ, смысл верен |
| pl6-1 | text_fr | ошибка чтения | мелочь | «avec ces mots HLVDOVICVS. IM.» | «avec les mots» | ces -> les |
| pl6-2 | text_fr | прочее | мелочь | маркер (21) после «en 635» | нет | сноски не перенесены |
| pl6-3 | text_fr | прочее | мелочь | маркеры/сноски (21) Daniel; (22) Ibidem, Bonamy; (23) монеты Arles/Chalon/Lyon | нет | сноски не перенесены |
| pl6-4 | text_fr | прочее | мелочь | маркеры/сноски (21) Daniel; (22) Ibidem, Bonamy; (23) монеты Arles/Chalon/Lyon | нет | сноски не перенесены |
| pl6-7 | text_fr | пропуск | мелочь | начало абзаца «7. Sous ce chiffre…» | «Sous ce chiffre…» без «7.» | номер в начале абзаца опущен (в №6 и др. тоже без номера в абзаце, но там слова) |
| pl7-1 | legend_fr/text_fr | надпись | мелочь | «VICTORIA. GOTTICA.» (точка после VICTORIA) | «VICTORIA GOTTICA» | точка опущена |
| pl7-1 | text_fr | орфография | мелочь | «savoir, que les Goths d'Espagne qui avoient» | «savoir: que les Goths d'Espagne, qui avoient» | пунктуация; в печати цитата Мариана в кавычках-ёлочках построчно |
| pl7-2 | legend_fr | надпись | мелочь | «VIETVRIA. CHLOT.» (точка) | «VIETVRIA CHLOT» | в text_fr точка есть, в legend_fr нет |
| pl7-4 | text_fr | прочее | мелочь | «C. A» (с пробелом), маркеры сносок [30]-[33] | «C.A», без маркеров | сноски [30]-[33] не перенесены |
| pl8-2 | text_fr | пропуск | мелочь | маркеры и сноски (38) Voyez Gaufridi, Hist. de Provence, liv. 5, art. 19, où il convient de ce fait; (39) Leblanc, traité…; (40) Tristan…; (41) La plus ridicule de ces e… | маркеров и сносок нет | нет знаков (38)-(41) и текста сносок |
| pl8-2 | text_fr | орфография | мелочь | reflexion | réflexion | единичная модернизация; Clotaire в тексте печати без H (CLOTARIVS), тогда как obverse_fr/legend_fr — CHLOTARIVS (так на гравюре) — расхождение внутри записи, не ошибка |
| pl8-3 | text_fr | пропуск | мелочь | monnoies de France (44), & par Ruffy … Histoire de Marseille (45).  Сноски: (44) Planche 4. édition de Paris, 1666. (45) tom. 1. pag. 58. seconde édition, 1696. | без маркеров и сносок | нет сносок |
| pl8-4 | text_fr | пропуск | мелочь | la cinquième année de son règne (46). Сноска: Gregorius Turonensis. | без маркера и сноски | нет сноски (46) |
| pl8-5 | text_fr | пропуск | мелочь | Histoire de France (47); Traité historique des monnoies de France (48); SIGEBERTVS REX I (49). Сноски: (47) Édition in-12, pag. 255, tom. 1. (48) Pag. 66. (49) Voyez la … | «M. Leblanc», без маркеров и сносок | нет сносок 47-49 |
| pl8-6 | text_fr | прочее | мелочь | les nombre V & II plus bas le mot CONOB (без ; ); в печати опечатка «Contantinople» | les nombres V & II plus bas; le mot CONOB; Constantinople | исправлена грамматика/опечатка; для «как напечатано» вернуть |
| pl8-6 | text_fr | пропуск | мелочь | маркеры [51], [52], [53], (54), (50), * и сноски: (50) Daniel, Hist. de France, tom. 1. Ruffi, Hist. de Marseille, tom. 1, page 42. [51] Vol. XX. édition in-4°. * Nota, … | маркеров и сносок нет | нет 6 сносок; Autharis (54), «par indivis (50)» |
| pl8-8 | text_fr | орфография | мелочь | Frère de Childeric II; son Frère Clotaire III | Frere … Frere | в печати с accent grave |
| pl9-1 | text_fr | пропуск | мелочь | conquêtes (55). Сноска: (55) Ruffi, Hist. de Marseille, tom. 1. | без маркера и сноски | нет сноски (55); в печати опечатка «Médaillles» |
| pl9-2 | text_fr | орфография | мелочь | dif-fère (с gravis) | différe | печатная диакритика/орфография |
| pl9-3 | text_fr | пропуск | мелочь | выноска (56) Archiv. de Marseille. Ruffi, Hist. de Marseille, tom. 1. pag. 126 (знак (56) после «Comte de Provence») | нет (знак сноски и текст сноски опущены) | сноска |
| pl9-3 | text_fr | орфография | мелочь | Provinciæ (лигатура æ) | Provinciae | печатная диакритика/орфография |
| pl9-4 | text_fr | пропуск | мелочь | выноска (57) [Marseillez] Je me suis servi de la dénomination dont on se servoit alors pour désigner ces monnoies (знак (57) после «Gros Marseillez») | нет (знак сноски и текст сноски опущены) | сноска |
| pl9-4 | text_fr | орфография | мелочь | Massiliæ (лигатура) | Massiliae | печатная диакритика/орфография |
| pl9-5 | text_fr | пропуск | мелочь | выноска (58) Hist. de Marseille, tom. 1 (знак (58) после «Ruffi») | нет (знак сноски и текст сноски опущены) | сноска |
| pl9-5 | text_fr | орфография | мелочь | 17 Février 1696 | 17 Février 1696 [1596] | в печати 1696 (опечатка книги); редакторская вставка [1596] в скобках — не печатное, допустимо если помечено |
| pl9-5 | text_fr | орфография | мелочь | Emblème | Embléme | печатная диакритика/орфография |
| pl9-5 | text_fr | орфография | мелочь | rebelles | rébelles | печатная диакритика/орфография |
| pl9-6 | text_fr | пропуск | мелочь | выноска (59) La disette des Médailles ou monnoies particulières à chaque Colonie Marseilloise... (длинная сноска; знак (59) после «infructueuses») | нет (знак сноски и текст сноски опущены) | сноска |
| pl9-9 | text_fr | пропуск | мелочь | выноска (60) Girardin, Hist. de la Ville & de l'Église de Fréjus, tom. 1. pag. 3. L'Abbé Girardin se fonde sur un passage de Strabon... (знак (60) после «Colonie de Mars… | нет (знак сноски и текст сноски опущены) | сноска |
| pl9-10 | text_fr | прочее | мелочь | Astruc ... Languedoc (65)...; Gaules (63); (62),(64),(66) | нет номеров сносок | в тексте опущены маркеры сносок (62)-(66) и сами сноски |
| pl10-1 | text_fr | прочее | мелочь | (15)(16)(17)(18)(19)(20) + сноски внизу страниц | маркеры (15)-(17) есть, текст сносок отсутствует | напр. (16) «Le Sr. Nicolas, Peintre. Cet Artiste, amateur des Antiquités...», (18) длинная сноска про Сен-Венсана |
| pl10-2 | text_fr | надпись | мелочь | MATRIS DEVM / MAGNAE IDEÆ PALATINÆ EIVSQ: M. / RELIGIONIS AD PARNOR / NAVIVS. IANVARIVS | MATRIS DEVM MAGNAE IDEAE PALATINAE EIVSQ. M. RELIGIONIS AD PARNOR NAVIVS IANVARIVS | в печати лигатуры Æ, после EIVSQ двоеточие, после NAVIVS точка, 4 строки; у нас AE, точка, всё в одну строку |
| pl10-2 | text_fr | прочее | мелочь | сноски (19),(20),(21) | маркер (20),(21) есть, текст сносок нет | напр. (21) «Parnes, montagnes de l'Attique, au-dessus d'Eleusis & d'Acharnæ» |
| pl11-1 | text_fr | орфография | мелочь | un Collegue; Eglise; decorée; [22]; [23]; [temps auquel ... Citoyen] | Collègue; Église; décorée; (22); (23); (temps auquel ...) | в печати квадратные скобки, у нас круглые; модернизированы ударения |
| pl11-1 | text_fr | прочее | мелочь | footnotes (22) «Histoire de Marseille.», (23) «La Ville de Rome adopta cet Emblème...» | нет текста сносок |  |
| pl12-1 | text_fr | орфография | мелочь | E-glise supérieure (без акцента) | Église | печатная диакритика/орфография |
| pl12-1 | text_fr | орфография | мелочь | égalèment | également | печатная диакритика/орфография |
| pl12-2 | text_fr | пропуск | мелочь | выноска (27) Les Ex-voto étoient autant en usage parmi les Payens que parmi nous. Ils s'acquittoient de cet acte de religion... V. S. Votum solvit (знак (27) после «prés… | нет (знак сноски и текст сноски опущены) | сноска |
| pl13-1 | text_fr | пропуск | мелочь | маркер сноски (28) после «dédié des Temples» и сноска «(28) Les petits Autels votifs étoient en usage chez les Payens; on en a trouvé des quantités dans les décombres de… | нет | сноска и маркер отсутствуют |
| pl13-2 | text_fr | пропуск | мелочь | «pour les morts (29);» и сноска «(29) Trimalcion faisant faire son Tombeau de son vivant, eut soin d'ordonner d'y représenter sa Chienne. Petron, Satyric. chap. 71.» | «pour les morts;» без маркера и сноски | остальной текст (4 абзаца, стр. 123-124) совпадает с печатью дословно |
| pl14-1 | text_fr | надпись | мелочь | DULCISSIMO TITO INNOCENTISSIMO / DIIS) FILIO TANNONIO QUI VIXIT, (MANIBUS / ANNOS V. MENSES VI. ... VITÆ SUÆ | ... VITAE SUAE ... | Æ-лигатура в печати, запятая после VIXIT, 6 строк |
| pl14-1 | text_fr | прочее | мелочь | «Salle à manger (30)» | нет (30) | опущен маркер сноски |
| pl14-2 | text_fr | орфография | мелочь | éphemère (без акцента на первом e) | éphémère |  |
| pl14-3 | text_fr | орфография | мелочь | récupererent; Eglise; Evêque | récupérèrent; Église; Évêque |  |
| pl15-2 | text_fr | орфография | мелочь | «si autentique (32)» | «si authentique (32)» | модернизация одного слова; остальное дословно, сноска 32 верна |
| pl15-4 | text_fr | ошибка чтения | мелочь | «Imagunculæ» (лигатура æ, дважды в абзаце; курсив) | «Imagunculae» | лигатура æ разложена на ae |
| pl16-2 | text_fr | орфография | мелочь | «Diocletien», «Jupiter Dolichene» (без акцентов) | «Dioclétien», «Dolichène» | две мелкие модернизации; остальное дословно, сноска 40 верна |
| pl16-4 | legend_fr | надпись | мелочь | на планшете греческими буквами: ΜΑΣΣΙ / ΦΩ…ΥΥ / Κ / ΑΣΥΑ·ΑΥΤ | MASSI FOGU K ASVA AVT (латиницей) | у нас латинская транслитерация; греческие буквы на камне; в книге латиницей (text_fr) |
| pl17-1 | legend_fr | надпись | мелочь | ΟΔΗΜΟΣ (в венке) / ΑΡΤΕΜΟΥΝΑΠΟΛΛΩΝΙΟΥ ΙΚΕΣΙΟΥ ΔΕΓΥ / ΝΑΙ / ΚΑ | ΟΔΗΜΟΣ — ΑΡΤΕΜΟΥΝ ΑΠΟΛΛΩΝΙΟΥ ΙΚΕΣΙΟΥ ΔΕΓΥΝΑΙΚΑ | на камне слитно АРТЕМОУΝΑΠΟΛΛΩΝΙΟΥ, перенос ΔΕΓΥ/ΝΑΙ/ΚΑ; у нас пробел после ΑΡΤΕΜΟΥΝ, склеено ΔΕΓΥΝΑΙΚΑ, добавлено «—»; текст сверен только по плану (не посимвольно) |
| pl17-3 | text_fr | прочее | мелочь | «[54] Juvenal, Satyr. 8.» (квадратные скобки, маркер в тексте тоже [54]) | «(54) Juvenal, Satyr. 8.» | маркер в тексте у нас [54], а в сноске круглые скобки; в печати везде квадратные |
| pl20-1 | text_fr | ошибка чтения | мелочь | Provinciæ Massiliensis ac Reliquæ Phocensis Annales | Provincia Massiliensis ac Reliqua Phocensis Annales | потеряна лигатура/буква æ в латинском заглавии сноски 66 |
| pl20-2 | text_fr | надпись | мелочь | ...AD PARNOR NAVIUS IANVARIVS. | ...NAVIUS IANVARIUS. | в печати последнее слово IANVARIVS (V на конце) |
| pl20-2 | text_fr | надпись | мелочь | EIVSQ. est ici mis pour | EIUSQ. est ici mis pour | в печати V, в разъяснении к надписи |
| pl21-1 | text_fr | ошибка чтения | мелочь | décoré de plusieurs vestiges | decoré | нет акцента |
| pl22-2 | text_fr | надпись | мелочь | IVLIÆ. QVINTINÆ | IVLIÆ QVINTINÆ | в печати точка после IVLIÆ (то же в legend_fr) |
| pl22-2 | text_fr | ошибка чтения | мелочь | Cossutia Hycla, sa mere. | sa mère | в печати без акцента |
| pl26-1 | text_fr | ошибка чтения | мелочь | récuperer sans injustice | récupérer | сноска 77; в печати без акцента на 2-м e |
| pl29-3 | text_fr | ошибка чтения | мелочь | caracteres suivans | caractères suivans | в печати без грависа |
| pl29-4 | text_fr | прочее | мелочь | …pour ornement. Le doute qu'il pourroit y avoir… (один абзац) | абзац разбит перед «Le doute…» (idx 1/2) | в печати «Le doute» продолжает тот же абзац; разрыв лишний |
| pl29-8 | legend_fr | надпись | мелочь | MARCI. COSSVTII. CHRESIMI. (с точками) | MARCI COSSVTII CHRESIMI | точки опущены в legend (в text_fr есть) |
| pl31-2 | text_fr | ошибка чтения | мелочь | plance LVIII | planche LVIII | опечатка оригинала исправлена |
| pl31-6 | text_fr | ошибка чтения | мелочь | ces réflexions | ces reflexions | в печати accent aigu |
| pl32-3 | text_fr | ошибка чтения | мелочь | Les petits osselets | Les petits ossellets | на стр. 206 печатно osselets (одно l) |
| pl32-4 | text_fr | ошибка чтения | мелочь | diamettre du vase | diametre du vase | в печати двойное t |
| pl32-7 | text_fr | ошибка чтения | мелочь | du college | du collège | в печати без грависа |
| pl33-6 | legend_fr | надпись | мелочь | OTONOIA (латиницей в тексте; на гравюре под фигурами видно OTONO...) | ΟΤΟΝΟΙΑ (греч. буквами) | в печатном тексте слово набрано латинскими буквами; у нас греческими |
| pl33-7 | legend_fr | надпись | мелочь | на гравюре: α, монограмма Chi-Rho, ω (строчные) | Α ☧ Ω | регистр букв; в тексте Alpha & Omega |
| pl35-1 | text_fr | орфография | мелочь | Pinede (без акцента, 'la petite Pinede (1)'); 'delà du chemin' в сн. 98 | Pinède / au-delà | отдельные современные акценты/написания |
| pl37-2 | text_fr | орфография | мелочь | traduite en Français comme il suit (стр. 240) | François | в печати Français; в остальном текст по печати |
| pl37-3 | legend_fr | надпись | мелочь | на гравюре строки: ΧΑΡΜΟΛΑΩ / ΘΡΑCΩΝΟC / ΚΛΙΜΕ/ΝΩΝ ΧΑΡΗC ΟΑΠ/ΕΛΕΥΘΕΡΟC (лунар. сигма, разрывы строк) | ΧΑΡΜΟΛΑΩ ΘΡΑΣΩΝΟΣ ΚΑΙ ΜΕ ΝΩΝ ΧΑΡΙΣ ΟΑΠΕΛΕΥΘΕΡΟΣ | нормализовано; неуверенное чтение |
| pl37-4 | legend_fr | надпись | мелочь | на гравюре: Ο ΓΝΗΤΕ / ΗCΤΕ ΚΑΙ / ΡΕ ΧΑΙΡΕ / ... ΕΤΗ / Ζ ΜΗΝΙ Ε (разрывы строк, лунар. сигма) | Ω ΓΝΗΤΕ ΗΣΤΕ ΚΑΙ ΡΕ ΧΑΙΡΕ ΤΡΙΣΧΙΛΙΑΚΙΣ ΕΤΗ Ζ ΜΗΝΙ Ε | первая буква Ο/Ω, нормализация; неуверенно |
| pl38-1 | text_fr | надпись | мелочь | DIIS MANIBVS TITI PVBLII RVFINI ... | DHIS MANIBVS (в латинской надписи по печати) — см. текст | в нашем тексте 'DHIS' вместо печатного 'DIIS' (стр. 243) |
| pl38-3 | legend_fr | надпись | мелочь | ΦΛΑ ΣΤΑΤΙΩ / ΣΥΡΙΑΝΩ / ΠΑΤΡΙ. / ΕΥΣΕΒΕ ΣΤΑΤ / ΣΤΑΤ. ΣΤΑ.ΤΙΑΝΟΣ | ΦΛΑ ΣΤΑΤΙΩ ΣΥΡΙΑΝΩ ΠΑΤΡΙ ΕΥΣΕΒΕ ΣΤΑΤ ΣΤΑΤ ΣΤΑΤΙΑΝΟΣ | гравюра: ΣΤΑ.ΤΙΑΝΟΣ (с точкой, ΙΑ/ΤΙ), знаки препинания опущены |
| pl38-4 | legend_fr | надпись | мелочь | на гравюре с сердечками: D ♥ M / HIO ♥ POMPEIO / FELICIANO ♥ / POMPEIA ♥ / MVSK ♥ ALVMNO / ♥ DVLCISSIMO | D M HIO POMPEIO FELICIANO POMPEIA MVSKA ALVMNO DVLCISSIMO | MVSK (на камне) vs MVSKA; сердечки опущены |
| pl39-1 | legend_fr | надпись | мелочь | на гравюре: D M / T.MACCI° MARCELL° / MACCIA IANVARIA / FILI° PIISSIM° / ET LICINIA CARPIMÆ VXOR (в тексте стр. 250: FILIO PIISSIMO, PIISSIMO) | ... FILIO PIISSIMO ET LICINIA CARPIMAE VXOR | текст ок; легенда нормализована относительно гравюры, AE вместо Æ |
| pl39-3 | legend_fr | надпись | мелочь | гравюра: PRÆF. ALÆ. HISPANÆ, ORN. FLAMIN. COLON. AQVENS, CONT TIAN DVDISTI | PRAEF ALAE HISPANAE | Æ-лигатуры, точки опущены; текст (стр. 251-252) совпадает |
| pl40-1 | text_fr | прочее | мелочь | LICYRIAE ... SEBASTEO ... AMICAE MIRENTISSIMAE (гравюра: IVNI TYRAN MIS) | LICYRIÆ, AMICÆ с лигатурами не как в печати 'AE' | гравюра даёт IVNI TYRANMIS; текст у нас по печати; лигатуры |
| pl40-3 | legend_fr | надпись | мелочь | гравюра: D M / MARCII ♥ / LENAEVS E / TYCHECIA IA / DEO FILIO / PIENTISSIM; в тексте стр. 256 без IA, PIENTISSIMO | ... TYCHECIA DEO FILIO PIENTISSIMO | IA и обрезанное PIENTISSIM только на гравюре; текст ок |
| pl40-4 | text_fr | орфография | мелочь | DIIS MANIBVS (капителью), CAIVS INGENVVS | DIIS MANIBUS (u вместо V) | в нашем тексте 'MANIBUS' вместо печатного 'MANIBVS' |
| pl41-1 | text_fr | надпись | мелочь | D.M. / CASSIE / FORTVNAT / ACONIS PAT / RONAE MER / ENTISSIM | ACONIS PA TRONAE MERENTISSIM | иной разрыв строк: в печати PAT/RONAE MER/ENTISSIM |
| pl41-1 | legend_fr | надпись | мелочь | (на гравюре CASSIAE ... TRONAEMAE RENTISSIM) | D M CASSIE ... MERENTISSIM | легенда взята из набора, а не с гравюры; допустимо |
| pl41-4 | text_fr | надпись | мелочь | D. ‖ (две «бедренные кости» вместо M) | D.M. | в печати вместо M знак «II» (два Femur); у нас D.M. |
| pl41-4 | legend_fr | надпись | мелочь | D II POMPONI AE PRIMI CENIAE ANNIA F FII CLA SOROR KARISSIME | D II POMPONIAE PRIMICENIAE ANNIA F FIICLA SOROR KARISSIME | разрывы строк слиты (AE, FII/CLA), ок по смыслу |
| pl41-4 | text_fr | орфография | мелочь | «un autre interprétation» (так в печати) | «une autre interprétation» | нормализовано |
| pl42-1 | text_fr | орфография | мелочь | ortographié | orthographié | в печати «ortographié» |
| pl42-1 | text_fr | надпись | мелочь | CALPVRNIAE / AR¹ RIDIS / VAB CREGES / ET CABLVRNIA / ONESIME VLVMN | то же в одну строку | совпадает; разрывы строк не сохранены |
| pl42-2 | text_fr | надпись | мелочь | ANN. III. MEN. VII. DIEB. XVI. (на гравюре MENS.) | ANN. III. MENS. VII. DIEB. XVI. | в тексте печати MEN., на гравюре MENS. |
| pl42-2 | text_fr | надпись | мелочь | QVÆ (лигатура) | QVAE | лигатура Æ в печатной надписи |
| pl42-3 | text_fr | надпись | мелочь | Ælianus, Æmilienne (лигатура Æ) | Aelianus, Aemilienne | лигатуры Æ/æ в печати (и в латинском: PRAEFECTO=PRÆFECTO, QVARTAE=QVARTÆ и т.д.) |
| pl42-3 | text_fr | прочее | мелочь | сноска «(a)» к Legion XV отдельным маркером | «(32) ... Cette Légion étoit nommée...» слита с 32 | в печати две сноски: (32) и (a) |
| frag-1 | text_fr | орфография | мелочь | sa fille cherie | sa fille chérie | в печати без акцента |
| frag-2 | text_fr | надпись | мелочь | FLAVO LVCIANO / .... ANIAE / DEFVNCTIS; «& .... Ania» (4 точки) | ...ANIAE; «& ... Ania» (3 точки) | число точек лакуны |
| frag-5 | text_fr | орфография | мелочь | Ingenuus; Ænea | Ingenius; Enea | опечатка/лигатура: в печати «Ingenuus» (сейчас «Ingenius»), «Ænea» |
| frag-6 | text_fr | прочее | мелочь | «... qui le composoient (39), servent ...» (маркер сноски 39) | маркер (39) отсутствует; сноска дана абзацем «Voyez la Planche 16 No. 4.» | маркер потерян |
| frag-9 | text_fr | надпись | мелочь | D. M. / M . C / OLVTIMOS / ATRI. P. / YCAR / O. | D.M. M. C. OLVTIMOS ATRI. P. YCAR O. | сама надпись и пояснение «Ce sont les lettres ... ATRI P.» совпадают |
| frag-11 | text_fr | пропуск | мелочь | sont toutes de grandeurs & de qualités inégales | sont de grandeurs & qualités inégales | нет «toutes», «de» |
| frag-12 | text_fr | прочее | мелочь | J'interpéte (опечатка печати) | J'interprète | исправлено |
| frag-15 | text_fr | ошибка чтения | мелочь | Tullius le Ligurien son frère | son frere | диакритика |
| frag-16 | text_fr | надпись | мелочь | LVMNE DVLCISSIMAE (без многоточия, две строки: D. M. / LVMNE DVLCISSIMAE) | D.M. ...LVMNE DVLCISSIMAE | многоточие добавлено; в печати начало надписи не помечено точками (возможно редакционное) |
| frag-18 | text_fr | ошибка чтения | мелочь | Cornelia secunda (строчная s, курсив) | Cornelia Secunda | заглавная вместо печатной строчной |
| frag-18 | text_fr | ошибка чтения | мелочь | rapportée pat Ruffi (опечатка печати); leur écrits | par Ruffi; leurs écrits | исправлены опечатки оригинала; решить, сохранять ли |
| frag-18 | text_fr | орфография | мелочь | Saty. 1a. (сноска 28); Sueton. in vita Caligulæ, Cap. 20. | Satyre 1.; Suétone, in vita Caligulae, cap. 20. | сноски 28-29 слегка нормализованы |
| frag-18 | text_fr | пропуск | мелочь | сама надпись №18 в печати на стр. 281-282 не набрана (только перевод) | — | замечание: ок |
| frag-19 | text_fr | ошибка чтения | мелочь | Tes-/mento dotare (в печати «Tesmento») | Testmento | искажение; в печати разрыв Tef-/mento |
| frag-19 | text_fr | ошибка чтения | мелочь | FLAVIÆ FRONTIS (лигатура Æ) | FLAVIAE FRONTIS | лигатура |
| frag-20 | text_fr | надпись | мелочь | CONIVXIX (в печати так); VENVSTVS в основном тексте, «Venustus» курсив | CONIVXIX / Venustus | надпись совпадает; в печати в прозе «Venustus»/«VENVSTVS» (V вместо U, мелочь) |
| frag-21 | text_fr | ошибка чтения | мелочь | règles geométriques | règles géométriques | диакритика |
| frag-21 | text_fr | ошибка чтения | мелочь | Collége (в печати стр. 288-290 с акутом); d'Appollon Delphien | Collège; d'Apollon Delphien | орфография печати: Collége, Appollon (двойное p) |
| frag-21 | text_fr | надпись | мелочь | строки с точками: «COLLE APOLLI FLAMIN / ..... ATRE ... ORVM / ET DE ..... / DENDROPH ... MASSIL» | число точек и разрывы строк не совпадают | в печати 5 точек в начале 2-й строки; перенос строк потерян |
| frag-23 | text_fr | надпись | мелочь | 6 строк, в начале каждой строки ряд точек: ..... OPTIMAE / ..... ORIAE EIVS / ..... VNDISI INAM / ..... FAMA DIMIT / ..... NOMEN / ..... NERIT. | OPTIMAE ORIAE EIVS ...... VNDISI INAM ...... FAMA DIMIT ...... NOMEN ...... NERIT. | точки перед OPTIMAE и ORIAE утеряны, разбивка по строкам потеряна |
| frag-25 | text_fr | надпись | мелочь | TITVS & de IVNIVS; TITVS IVNIVS (капитель) | Titus & de Iunius; Titus Iunius | V/U: в печати TITVS IVNIVS |
| frag-25 | text_fr | ошибка чтения | мелочь | (36) Ruffi, hist. de Marſ., pag. 317, tom. 2. | Marf. | ſ прочитано как f (в печати Marſ. = Mars.) |
| frag-26 | text_fr | надпись | мелочь | D. M. / P. AELIO / EVTICHE / TI / COLLIBERTO / SECVNDVS. (6 строк) | D.M. P. AELIO EVTICHE TI COLLIBERTO SECVNDVS | разрывы строк не переданы (содержание верно) |
| greek-4 | text_fr | пропуск | мелочь | на печати предложение «...en caractères grecs:» + 4 строки DIONISI / DIONISI / SIDEITI / METRIMA. | DIONISI DIONISI SIDEITI METRIMA | разбивка на строки не передана; слова верны |

## Записи без замечаний

pl1-1, pl1-2, pl1-3, pl1-6, pl1-7, pl1-8, pl1-9, pl1-10, pl1-11, pl1-13, pl1-14, pl1-16, pl1-18, pl2-1, pl2-2, pl2-3, pl2-4, pl2-5, pl2-6, pl2-8, pl2-9, pl3-4, pl3-5, pl3-6, pl3-7, pl4-1, pl4-2, pl4-3, pl4-4, pl4-5, pl4-6, pl4-7, pl4-8, pl4-9, pl4-10, pl4-11, pl4-12, pl4-13, pl4-14, pl4-15, pl4-16, pl5-1, pl5-3, pl5-5, pl5-6, pl5-7, pl6-6, pl6-8, pl6-9, pl6-10, pl7-3, pl7-5, pl7-6, pl7-7, pl7-8, pl7-9, pl7-10, pl8-1, pl8-7, pl9-7, pl9-8, pl9-11, pl12-3, pl15-1, pl15-3, pl16-1, pl16-3, pl17-2, pl18-1, pl18-2, pl18-3, pl19-1, pl19-2, pl20-3, pl21-2, pl22-1, pl23-1, pl23-2, pl24-1, pl24-2, pl24-3, pl25-1, pl25-2, pl25-3, pl25-4, pl27-1, pl27-2, pl28-1, pl28-2, pl28-3, pl29-1, pl29-2, pl29-5, pl29-6, pl29-7, pl30-1, pl30-2, pl30-3, pl30-4, pl30-5, pl30-6, pl30-7, pl31-1, pl31-3, pl31-4, pl31-5, pl31-7, pl32-1, pl32-2, pl32-5, pl32-8, pl33-1, pl33-2, pl33-3, pl33-4, pl33-5, pl33-8, pl33-9, pl33-10, pl34-1, pl36-1, pl39-2, pl39-4, pl40-2, pl41-2, pl41-3, pl41-5, frag-3, frag-4, frag-7, frag-13, frag-14, frag-17, frag-22, frag-24.

## Оговорки

- Греческие надписи на планшетах 37 (pl37-1…4) прочитаны неуверенно (лунарная сигма, стигма/коппа, разрывы строк) — перед правкой перепроверить по крупному кадру; для pl4-16 и pl1-4/1-5 нижние буквы на монетах читаются неуверенно.
- Планшеты 21–28 и часть планшетов 33–36 сверялись только по надписям; гравюры 43/44 (frag-1…13) в PDF 18 не найдены, поэтому frag-9 и frag-10 стоит сверить по планшету 44.
- Подписи на самих гравюрах местами отличаются от печатного текста (pl19-2, pl20-1, pl20-2): legend_fr то по гравюре, то по тексту — единого правила нет.
- Вводные абзацы разделов и планшетов (стр. 269–270, вводные к планшетам II–IV) в данных отсутствуют.
- Первичный список 249 записей разбит на 9 срезов; срез s4 (pl9–pl17) первоначально проверен частично и дозапущен.
