# Сверка карточек гравюр Картари по изображениям

Метод: 212 гравюр, каждая открыта как изображение отдельным агентом на Opus (10 пакетов по ≤22), который не видел данных карты: он сначала читал подпись, напечатанную на самой гравюре (где её нет — Пиньория, индийская часть — описывал изображение и сверял с ближайшим текстом главы), затем сравнивал с карточкой: заголовок, итальянская подпись, русская подпись, место в главе. Исправленные 61 карточка перепроверены тем же способом вторым проходом (столбец «Повторная проверка»). Исправления лежат в [plates.json](plates.json) Второй проход нашёл ещё 2 расхождения (161 и 181), они исправлены по тексту главы и в таблице отмечены. Пакет 111–132 первым агентом был прочитан небрежно (он копировал подписи с карточек), поэтому подписи этого пакета перепроверены вслепую третьим агентом: все итальянские подписи совпали. Исправления лежат в [plates.json](plates.json) (читается только новой карточкой и сеткой; старые карточки и оглавление не затронуты).

## Итоги

| Тип расхождения | Число |
|---|---|
| Заголовок не тот | 46 |
| Итальянская подпись не та (чужая / с ошибками чтения / обрезана) | 8 |
| Итальянская подпись напечатана, но на карточке скрыта | 7 |
| Русская подпись не та | 1 |
| Место в главе не то | 29 |
| Карточек хотя бы с одним расхождением | 61 из 212 |
| Заголовок верный, но длинный/описательный (не менялся) | 93 |

Обозначения: З — заголовок, И — итальянская подпись, Р — русская подпись, М — место в главе; ✓ совпадает, ✗ исправлено, «дл» — верный, но длинный заголовок (не менялся).

## Таблица

| № | id | Было (заголовок) | На гравюре | З | И | Р | М | Стало | Повторная проверка |
|---|---|---|---|---|---|---|---|---|---|
| 1 | cartm_idolbelo | Начало идолопоклонства в Беле, в Семирамиде и в сыне Сирофан | «Principio dell'Idolatria in Belo, in Semiramis, & nel figliolo di Siro» | дл | ✓ | ✓ | ✓ |  |  |
| 2 | cartm_ladderofgods | Аллегорическая фигура небесных богов, сфер и бездн | увенчанная женская фигура с копьём и статуэткой между двумя гербами (д | ✗ | ✓ | ✓ | ✗ | заголовок: «Гербовая заставка»; место: frontespizio-dedica, блок 14 | ✓ совпадает |
| 3 | cartm1 | Провидение | «Imagini della Dea Prouidenza, tenuta da gl'antichi anima del Mondo & c» | ✓ | ✓ | ✓ | ✓ |  |  |
| 4 | cartm2 | Образ Вечности и бога Демогоргона | «Imagini della Eternità, con l'imagine del dio Demogorgone compagno del» | дл | ✓ | ✓ | ✓ |  |  |
| 5 | cartm3 | Пещера Вечности с образом Времени | «Antro dell'Eternità, con l'imagine del Tempo, ò del Fato, di Febo, del» | ✓ | ✗ | ✓ | ✓ | итал.: «Antro dell'Eternità, con l'imagine del Tempo, ò del Fato, di…» | ✓ совпадает |
| 6 | cart1 | Сатурн | «Imagini di Giano inteso ancora per il Sole, per il Tempo, per il Dio d» | ✗ | ✗ | ✓ | ✓ | заголовок: «Янус»; итал.: «Imagini di Giano inteso ancora per il Sole, per il Tempo, pe…» | ✓ совпадает |
| 7 | cartm4 | Образ Сатурна, Времени и года (среди звёзд) | «Imagine di Saturno, del Tempo, & dell'anno, che significa li tristi ef» | дл | ✓ | ✓ | ✓ |  |  |
| 8 | cartm5 | Образ Сатурна: время настоящее, прошедшее и будущее | «Imagine di Saturno, che significa il tempo presente, e passato, & auen» | дл | ✗ | ✓ | ✓ | итал.: «Imagine di Saturno, che significa il tempo presente, e passa…» | ✓ совпадает |
| 9 | cartm6 | Образ Сатурна и Времени со связанными шерстью ногами | «Imagine di Saturno, & del Tempo, che co' piedi legati di fil di lana, » | дл | ✓ | ✓ | ✓ |  |  |
| 10 | cartm8 | Образы четырёх времён года | «Imagini delle quattro stagioni dell'anno, dinotanti gli effetti & esse» | дл | ✗ | ✓ | ✓ | итал.: «Imagini delle quattro stagioni dell'anno, dinotanti gli effe…» | ✓ совпадает |
| 11 | cartm9 | Храм Януса, бога мира и войны | «Tempio di Giano Dio della pace, & della guerra ilquale staua serrato i» | ✓ | ✗ | ✓ | ✓ | итал.: «Tempio di Giano Dio della pace, & della guerra ilquale staua…» | ✓ совпадает |
| 12 | cartm10 | Образ Солнца, или Феба, и Юпитера у ассирийцев | «Imagine del Sole ò Febo, & di Gioue apo gli Assirij tenuti per vna med» | дл | ✗ | ✓ | ✓ | итал.: «Imagine del Sole ò Febo, & di Gioue apo gli Assirij tenuti p…» | ✓ совпадает |
| 13 | cartb17 | Девять Муз | «Imagine delle noue Muse riferite all'armonia de gl'Orbi celesti, & inu» | ✓ | ✗ | ✓ | ✓ | итал.: «Imagine delle noue Muse riferite all'armonia de gl'Orbi cele…» | ✓ совпадает |
| 14 | cartm11 | Аполлон среди Муз | «Apollo in mezo delle Muse per dare ad intendere, che il Sole hà virtù » | ✓ | ✗ | ✓ | ✓ | итал.: «Apollo in mezo delle Muse per dare ad intendere, che il Sole…» | ✓ совпадает |
| 15 | cart2 | Аполлон Феб, Солнце | «Imagini d'Apollo & de gli animali, & vccelli à lui sacrati, che signif» | ✓ | ✓ | ✓ | ✓ |  |  |
| 16 | cartm12 | Корабль Солнца, влекомый Крокодилом | «Naue del Sole portata da vn Crocodilo, che significa la prima causa ch» | ✓ | ✓ | ✓ | ✓ |  |  |
| 17 | cartm13 | Аполлон, обнимающий Дафну | «Apollo abbracciante Dafne per mostrare la conformità, che tiene il Lau» | ✓ | ✓ | ✓ | ✓ |  |  |
| 18 | cartm14 | Образ Аполлона, бога благоразумия | «Imagine d'Apollo, ò del Sole, significante lui esser Dio della prudenz» | дл | ✓ | ✓ | ✓ |  |  |
| 19 | cartm15 | Образ Аполлона-Митры | «Imagine di Apollo Mithra, significante la forza & effetti del Sole nel» | дл | ✓ | ✓ | ✓ |  |  |
| 20 | cartm16 | Образ священных быков у египтян | «Imagine dei Buoi sacri appresso gli Egittij. & significauano il Sole, » | дл | ✓ | ✓ | ✓ |  |  |
| 21 | cartm17 | Образ нагого Аполлона, любителя быков | «Imagine d'Apollo nudo, amatore de' Buoi, significa il Sole dar vita al» | дл | ✓ | ✓ | ✓ |  |  |
| 22 | cartm18 | Образ Аполлона и Земли у ассирийцев | «Imagine d'Apolline & della Terra appresso gl'Assirij significante gli » | дл | ✓ | ✓ | ✓ |  |  |
| 23 | cartm19 | Образ Адада и Адаргатис, богов ассирийцев | «Imagine di Adad, & d'Adargate Dei de gli Assirij intesi da loro per il» | дл | ✓ | ✓ | ✓ |  |  |
| 24 | cartm20 | Образ Сераписа, бога египтян | «Imagine di Serapi Dio delli Egittij inteso da loro per il Sole, & per » | дл | ✓ | ✓ | ✓ |  |  |
| 25 | cartm21 | Образ Солнца, изменчивого творца всех времён | «Imagine del Sole variatore & produttore di tutti li tempi, e stagioni,» | дл | ✓ | ✓ | ✓ |  |  |
| 26 | cartm22 | Образ Эскулапа, бога Медицины | «Imagine di Esculapio Dio della Medicina con gli animali à lui sacrati » | дл | ✓ | ✓ | ✓ |  |  |
| 27 | cartm23 | Образ Эскулапа с посвящёнными ему петухами | «Imagine di Esculapio Dio della medicina con li galli vccelli à lui sac» | дл | ✓ | ✓ | ✓ |  |  |
| 28 | cartm24 | Старинное кольцо с символом Здоровья | «Anello antico, nella gioia del quale è intagliato il simbolo della Sal» | ✓ | ✓ | ✓ | ✓ |  |  |
| 29 | cartm26 | Образ Гигиеи, дочери Эскулапа | «Imagine della dea Salute, & del Serpente à lei sacrato significante de» | ✗ | ✗ | ✓ | ✓ | заголовок: «Богиня Здоровья»; итал.: «Imagine della dea Salute, & del Serpente à lei sacrato signi…» | ✓ совпадает |
| 30 | cartm27 | Колесница Солнца, бога света | «Imagine d'Higia figliuola d'Esculapio co'l Cane, & Serpe simboli di su» | ✗ | ✗ | ✓ | ✓ | заголовок: «Гигия, дочь Эскулапа»; итал.: «Imagine d'Higia figliuola d'Esculapio co'l Cane, & Serpe sim…» | ✓ совпадает |
| 31 | cartm28 | Образ Солнца, называемого также Фебом и Аполлоном | «Carro del Sole Dio della luce con l'imagine & ornamento di esso Sole, » | ✗ | ✗ | ✓ | ✓ | заголовок: «Колесница Солнца»; итал.: «Carro del Sole Dio della luce con l'imagine & ornamento di e…» | ✓ совпадает |
| 32 | cartm29 | Образ Авроры и коня Пегаса | «Imagine dell'Aurora, & del Cauallo Pegaseo, che tirra il suo carro, di» | дл | ✓ | ✓ | ✓ |  |  |
| 33 | cartm30 | Образ Дианы, богини лесов и охоты | «Imagine di Diana dea delle selue, & della caccia, la quale s'intende p» | дл | ✓ | ✓ | ✓ |  |  |
| 34 | cartm_dianamoon | Образ Дианы охоты и лесов, с посвящёнными ей Оленями | «Imagine di Diana della caccia, & de boschi, & amatrice de Cerui à lei » | дл | ✓ | ✓ | ✓ |  |  |
| 35 | cartm31 | Статуя Люцины, богини родов | «Statua di Lucina dea de Parti tolta per la Luna essendo la Luna Pianet» | ✓ | ✓ | ✓ | ✓ |  |  |
| 36 | cartm32 | Образ Дианы Кинфии, то есть Луны | «Imagine di Diana Cinthia ò Luna dea cacciatrice con vn Pardo nella des» | дл | ✓ | ✓ | ✓ |  |  |
| 37 | cartm33 | Образ Гекаты, трёхликой богини | «Imagine di Hecate dea triforme detta anco Proserpina moglie di Plutone» | дл | ✓ | ✓ | ✓ |  |  |
| 38 | cartm34 | Изваяние Луны | «Simulacro della Luna significante la Luna riceuer il suo lume dal Sole» | ✓ | ✓ | ✓ | ✓ |  |  |
| 39 | cartm35 | Образ богини Природы, покрытой множеством грудей | «Imagine della Dea Natura tutta piena di poppe, per mostrare, che l'vni» | дл | ✓ | ✓ | ✓ |  |  |
| 40 | cartm36 | Образ Исиды, египетской богини | «Imagine d'Iside Dea Egittia, che è la Luna tenuta la Dea de Nauiganti,» | дл | ✓ | ✓ | ✓ |  |  |
| 41 | cartm37 | Образ Исиды, богини египтян, с систром | «Imagine d'Iside dea de gli Egitij, che è la Luna, con arnesi in mano d» | дл | ✓ | ✓ | ✓ |  |  |
| 42 | cart4 | Юпитер | «Imagine di Gioue & di Pan significante l'vniuerso, l'vno Dio delli dei» | ✗ | ✗ | ✓ | ✓ | заголовок: «Юпитер и Пан»; итал.: «Imagine di Gioue & di Pan significante l'vniuerso, l'vno Dio…» | ✓ совпадает |
| 43 | cartm38 | Образ бога-творца египтян и Юпитера | «Imagine del Dio creatore de gli Egittij, & di Gioue dio delli dei de g» | дл | ✓ | ✓ | ✓ |  |  |
| 44 | cartm39 | Образ Юпитера, бога богов древних | «Imagine di Gioue dio delli dei de gli Antichi significante la potenza » | дл | ✓ | ✓ | ✓ |  |  |
| 45 | cartm40 | Образ громовержца Юпитера против клятвопреступников | «Imagine di Gioue folgorante contro li Spergiuri nominato Gioue horcio,» | дл | ✓ | ✓ | ✓ |  |  |
| 46 | cartm41 | Образ Верности, означенной богом Фидием | «Imagine della Fede significata per il Dio Fidio adorato anticamente. L» | дл | ✓ | ✓ | ✓ |  |  |
| 47 | cartm42 | Образ бога Фидия, хранителя верности Юпитера | «Imagine del Dio Fidio custode della fede & fedeltà di Gioue detto Veio» | дл | ✓ | ✓ | ✓ |  |  |
| 48 | cartm43 | Образ Юпитера в окружении трёх Граций | «Imagine di Gioue circondato dalle tre gratie, & dalle tre hore, il cui» | дл | ✓ | ✓ | ✓ |  |  |
| 49 | cartm44 | Образ Юпитера с Молнией и Копьём | «Imagine di Gioue co'l Fulmine, & con l'Hasta per mostrare la Stabilità» | дл | ✓ | ✓ | ✓ |  |  |
| 50 | cartm45 | Образ громовержца Юпитера, подателя дождей | «Imagine di Gioue folgorante apportator di pioggie, & nembi; & l'imagin» | дл | ✓ | ✓ | ✓ |  |  |
| 51 | cartm46 | Образ оракула Юпитера Аммона у троглодитов | «Imagine dell'oracolo di Gioue Hammonio de Trogloditi significante l'os» | дл | ✓ | ✓ | ✓ |  |  |
| 52 | cartm47 | Образ Юпитера Аммона у аркадцев и египтян | «Imagine di Gioue Hammonio de gli Arcadi, & de gli Egittij, & della que» | дл | ✓ | ✓ | ✓ |  |  |
| 53 | cart5 | Юнона | «Imagine di Giunone Lucina, & della Dea Siria de Hieropoli nell'Assiria» | ✓ | ✓ | ✓ | ✓ |  |  |
| 54 | cartm48 | Образ Ириды, вестницы Юноны | «Imagine di Iride messaggiera di Giunone, figliuola di Thaumante, o sia» | дл | ✓ | ✓ | ✓ |  |  |
| 55 | cartm50 | Образ Кастора и Поллукса | «Imagine di Castore è Polluce, dei de Nauiganti, significanti al lor ap» | дл | ✓ | ✓ | ✓ |  |  |
| 56 | cartm51 | Образ Юноны Аргивской и Юноны-Спасительницы | «Imagine di Giunone Argiua, di Giunone saluatrice in Lauinio, & di Giun» | дл | ✓ | ✓ | ✓ |  |  |
| 57 | cartm52 | Образ Юноны, покровительницы брака | «Imagine di Giunone inuentrice ò protettrice del matrimonio, detta Giun» | дл | ✓ | ✓ | ✓ |  |  |
| 58 | cartm53 | Образ Гименея, бога брака | «Imagine d'Himeneo dio del matrimonio, & delle nozze, con l'imagini d'a» | дл | ✓ | ✓ | ✓ |  |  |
| 59 | cart6 | Великая Матерь (Опа-Берекинфия) | «Imagine della dea Ope detta anco Berecinthia madre de gli Dei, interpr» | ✓ | ✓ | ✓ | ✓ |  |  |
| 60 | cartm54 | Изваяние богини Кибелы на её колеснице | «Simulacro della Dea Cibele, che è la terra, & il carro doue era condot» | ✓ | ✓ | ✓ | ✓ |  |  |
| 61 | cartm55 | Храм богини Весты в Риме | «Tempio in Roma della Dea Vesta madre de gli Dei, & di Vesta dea del fu» | ✓ | ✓ | ✓ | ✓ |  |  |
| 62 | cartm56 | Образ Цереры Сицилийской | «Imagine di Cerere Siciliana inuentrice, & dea delle biade, & del suo c» | дл | ✓ | ✓ | ✓ |  |  |
| 63 | cartm57 | Статуя чёрной Цереры в Аркадии | «Statua di Cerere negra in Arcadia, dea delle biade conuertita in Caual» | ✓ | ✓ | ✓ | ✓ |  |  |
| 64 | cartm58 | Образ Помоны, богини садов | «Imagine di Pomona dea de gl'Horti, & moglie di Vertunno: con la Falce » | дл | ✓ | ✓ | ✓ |  |  |
| 65 | cartm59 | Образ богини Прозерпины и богини Бона | «Imagine della Dea Proserpina figliuola di Cerere intesa per le biade, » | дл | ✓ | ✓ | ✓ |  |  |
| 66 | cartm60 | Образ Главка, морского бога | «Imagine di Glauco dio marino dinotante il colore, & spuma del mare, & » | дл | ✓ | ✓ | ✓ |  |  |
| 67 | cartm61 | Образ Тритонов, Нереид и Галатеи | «Imagini de' Tritoni & delle Nereide huomini & donne marine secondo Ale» | дл | ✓ | ✓ | ✓ |  |  |
| 68 | cartm62 | Образ сирен Партенопы, Левкосии и Лигии | «Imagini di Partenope, Leucosia, & Ligia Sirene dee del mare figliuole » | дл | ✗ | ✓ | ✓ | итал.: «Imagini di Partenope, Leucosia, & Ligia Sirene dee del mare …» | ✓ совпадает |
| 69 | cartm63 | Образ Сциллы, сицилийской скалы | «Imagine di Scilla scoglio Siciliano detto da Poeti atrocissimo mostro » | дл | ✓ | ✓ | ✓ |  |  |
| 70 | cart7 | Нептун | «Imagini di Nettuno dio del mare, & di Anfitrice sua moglie, dinotanti » | ✓ | ✓ | ✓ | ✓ |  |  |
| 71 | cartm64 | Образ Нептуна согласно Филострату | «Imagine di Nottuno dio del mare appo Filostrato, o sia imagine di Tara» | дл | ✓ | ✓ | ✓ |  |  |
| 72 | cartm65 | Образ Евриномы и Дерцето, морских богинь | «Imagini di Eurinome, & di Decreto dee marine l'vna figliuola di Proteo» | дл | ✓ | ✓ | ✓ |  |  |
| 73 | cartm66 | Образы Борея, Австра, Эвра и Зефира, четырёх ветров | «Imagini di Borea, Austro, Euro, & Zefiro quattro venti principali, & d» | дл | ✓ | ✓ | ✓ |  |  |
| 74 | cartm67 | Образы рек Кефис и По | «Imagini di Cefiso, & del Pò fiumi, quello di Grecia, questo d'Italia, » | дл | ✓ | ✓ | ✓ |  |  |
| 75 | cartm68 | Образ Тибра, являющего изобилие | «Imagine del Teuere mostrante l'abbondanza, e'l principio dell'Imperio » | дл | ✓ | ✓ | ✓ |  |  |
| 76 | cartm69 | Образ реки Нил, восседающей на Сфинксе | «Imagini del fiume Nilo sedente sopra la Sfinge, con molti fanciulli in» | дл | ✓ | ✓ | ✓ |  |  |
| 77 | cartb18 | Вертумн и Помона | «Imagine di Vertunno, con Pomona appresso; tenuto per Dio de pensieri h» | ✓ | ✓ | ✓ | ✓ |  |  |
| 78 | cart8 | Плутон | «Imagini di Plutone dio dell'Inferno, di Proserpina sua moglie, di Euri» | ✓ | ✗ | ✓ | ✓ | итал.: «Imagini di Plutone dio dell'Inferno, di Proserpina sua mogli…» | ✓ совпадает |
| 79 | cartm70 | Образы Алекто, Тисифоны и Мегеры, трёх Фурий | «Imagini di Aletto, Tessifone, & Megera tre furie infernali punitrici d» | дл | ✓ | ✓ | ✓ |  |  |
| 80 | cartm72 | Образ Сфинкс Фиванской и Химеры Ликийской | «Imagine della Sfinge Thebana superata da Edipo, & della Chimera Licia » | дл | ✓ | ✓ | ✓ |  |  |
| 81 | cartm73 | Образы Клото, Лахесис и Атропос, трёх Парок | «Imagini di Cloto, Lachesi, & Atropo, dette le tre Parche, delle quali » | дл | ✓ | ✓ | ✓ |  |  |
| 82 | cartm74 | Образ Необходимости и трёх Парок | «Imagine della Necessità, & del fuso adamantino trauersando il mondo, &» | дл | ✓ | ✓ | ✓ |  |  |
| 83 | cartm75 | Образы трёх Парок, найденные в Штирии | «Imagini delle tre Parche trouate secondo Pietro Appiano in Stiria del » | дл | ✓ | ✓ | ✓ |  |  |
| 84 | cartm76 | Образ Харона, адского перевозчика | «Imagine di Charonte nocchiero infernale nel fiume nero di Acheronte, c» | дл | ✓ | ✓ | ✓ |  |  |
| 85 | cart9 | Меркурий | «Imagini di Mercurio messaggiero de i dei, Dio della eloquenza, & de me» | ✓ | ✗ | ✓ | ✓ | итал.: «Imagini di Mercurio messaggiero de i dei, Dio della eloquenz…» | ✓ совпадает |
| 86 | cartm77 | Образ Мира и его иероглифов | «Imagine della Pace, & de Hieroglifici ò segni che quella dimostrano, c» | дл | ✓ | ✓ | ✓ |  |  |
| 87 | cartm78 | Образы Согласия и Верности | «Imagini della Concordia, & hieroglifici denotanti la Fede, & la Concor» | дл | ✓ | ✓ | ✓ |  |  |
| 88 | cartm79 | Образ Меркурия, изобретателя Письменности | «Imagine di Mercurio inuentore delle Lettere, della Musica, della Geome» | дл | ✓ | ✓ | ✓ |  |  |
| 89 | cartm80 | Статуи Меркурия, называемые Гермами | «Statue di Mercurio, dette Hermi, per esser lui stato l'inuentore di tu» | ✓ | ✓ | ✓ | ✓ |  |  |
| 90 | cartm_night | Образ Ночи, кормилицы Смерти и Сна | «Imagine della Notte nutrice della Morte, & del Sonno, & imagine del So» | дл | ✓ | ✓ | ✓ |  |  |
| 91 | cartm_merceloq | Образ Меркурия, бога красноречия, и бога Анубиса | «Imagine di Mercurio dio della eloquenza, scorta de passeggieri, Dio de» | дл | ✓ | ✓ | ✓ |  |  |
| 92 | cartm_hercgall | Образ Геркулеса у галлов, бога красноречия | «Imagine di Hercole appo Francesi da loro tenuto Dio della eloquenza, &» | дл | ✓ | ✓ | ✓ |  |  |
| 93 | cartm81 | Образ вооружённого и пирующего Геркулеса | «Imagine d'Ercole armato, d'Hercole mangiatore, & beuitore, & dell'vcce» | дл | ✓ | ✓ | ✓ |  |  |
| 94 | cartm82 | Аполлон и Геркулес спорят из-за треножника | «Imagine d'Apolline, & d'Hercole, che contendono insieme del Tripode, &» | дл | ✓ | ✓ | ✓ |  |  |
| 95 | cart10 | Минерва (вместе с Меркурием) | «Imagini di Mercurio, & di Minerua, quello dio della Eloquenza, questa » | ✗ | ✓ | ✓ | ✓ | заголовок: «Меркурий и Минерва» | ✓ совпадает |
| 96 | cartm_marte | Марс | «Imagine di Marte Dio della guerra, del suo carro, & della Fama sua mes» | ✓ | ✓ | ✓ | ✓ |  |  |
| 97 | cartm_bacco | Вакх | «Imagine di Bacco significante li varij effetti del vino del quale esso» | ✓ | ✓ | ✓ | ✓ |  |  |
| 98 | cartm_como | Ком, бог пиршеств | «Imagine di Como Dio de Conuiuij, secondo Filostrato, significante, che» | ✓ | ✓ | ✓ | ✓ |  |  |
| 99 | cartm_baccopompa | Вакх и вакхическое шествие | «Imagini di Bacco, & della pompa, feste, & cerimonie bacchanali, & l'ha» | ✓ | ✓ | ✓ | ✓ |  |  |
| 100 | cartm_tifone | Тифон и Гор | «Imagini di Tifone fratel d'Osiri, & di Horo figliuolo d'Osiri, che è B» | ✓ | ✓ | ✓ | ✓ |  |  |
| 101 | cartm_horopriapo | Гор, бог египтян | «Imagine di Horo Dio delli Egittij, che è Priapo, & Bacco ancora, il qu» | ✓ | ✓ | ✓ | ✓ |  |  |
| 102 | cartm_priapohorti | Приап, бог садов | «Imagine di Priapo Dio delli Horti, & del membro virile, & dell'Asino, » | ✓ | ✓ | ✓ | ✓ |  |  |
| 103 | cartm_genio | Добрый и злой Гений | «Imagini del Genio buono, & cattiuo, custode & osseruatore della genera» | ✓ | ✓ | ✓ | ✓ |  |  |
| 104 | cartm_fortunadatrice | Фортуна, подательница и раздательница | «Imagine della Fortuna datrice, & dispensatrice, & patrona delle ricche» | ✓ | ✓ | ✓ | ✓ |  |  |
| 105 | cartm_occasione | Случай (бог Кер) | «Hieroglifico denotante la buona Fortuna quasi sempre andare con l'Eloq» | ✓ | ✓ | ✓ | ✓ |  |  |
| 106 | cartm_fortunascithi | Фортуна у скифов | «Imagine della Fortuna appò gli Scithi significante la sua velocità & i» | ✓ | ✓ | ✓ | ✓ |  |  |
| 107 | cartm_fortunaegira | Фортуна в Эгире | «Imagine della Fortuna in Egira, significante nell'Amore volerui buona » | ✓ | ✓ | ✓ | ✓ |  |  |
| 108 | cartm_fortunacauallo | Фортуна верхом на коне | «Imagine della Fortuna à cauallo che velocemente corre, dal Fato & dal » | ✓ | ✓ | ✓ | ✓ |  |  |
| 109 | cartm_eroteanterote | Эрот и Антэрот | «Imagine de gli Dei Erote, & Anterote fratelli & figliuoli di Venere, i» | ✓ | ✓ | ✓ | ✓ |  |  |
| 110 | cartm_trionfoamore | Триумф Любви | «Trionfo d'Amore descritto da Filostrato, dal Petrarca, & da altri anti» | ✓ | ✓ | ✓ | ✓ |  |  |
| 111 | cartm_imaginiamore | Изображения Любви различных действий | «Imagini d'Amore significanti gli varij effetti & potenze d'Amore, qual» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 112 | cartm_panecupido | Пан и Купидон | «Imagine di Pane, & Cupido, l'vno vinto, l'altro vincitore, per mostrar» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 113 | cartm_venere2 | Венера | «Imagine di Venere nata dalla spuma del mare, della bellezza Dea, & del» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 114 | cartm_tempiopafo | Храм Венеры в Пафосе | «Tempio di Venere in Pafo Città di Cipro con gieroglifico lei & sua nat» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 115 | cartm_venerecigni | Венера, влекомая Лебедями | «Imagine di Venere tirata in carro da' Cigni, retti da gl'Amorini; per » | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 116 | cartm_venerepiaceri | Венера, богиня наслаждений | «Imagine di Venere Dea de piaceri, madre d'Amore, accompagnata da gl'Am» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 117 | cartm_venerecupidogiogo | Венера, Купидон, Ярмо и Козёл | «Imagini di Venere, di Cupido, del Giogo, & del Capro, quali significan» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 118 | cartm_venerearmata | Венера вооружённая, победительница и в оковах | «Imagine di Venere armata, di Venere vitrice, & di Venere in ceppi dino» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 119 | cartm_fortunalieta | Весёлая и печальная Фортуна | «Imagini della lieta, & trista fortuna, ouero della fortuna passata, pr» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 120 | cartm_giustitia | Справедливость | «Imagine della Giustitia custoditrice de buoni, & punitrice de rei; & i» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 121 | cartm_calunniaapelle | Картина «Клевета» Апеллеса | «Tauola della Calumnia dipinta d'Apelle, nella quale vi è il Giudice co» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 122 | cartm_invidia | Зависть | «Imagini dell'Inuidia, che à se stessa nuoce, essendo che l'inuidioso s» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 123 | cartm_naue | Корабль Вакха | «Imagine della Naue di Bacco, del monte Timolo di Lidia delle Bacche pe» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 124 | cartm_martescithi | Храм Марса у скифов | «Imagine del Tempio di Marte Dio della guerra, che era così fatto appo » | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 125 | cartm_furoreira | Неистовство и Гнев | «Imagine del Furore, & dell'Ira, & de suoi mali effetti, che sono sprez» | ✓ | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 126 | cartm83 | Образ Вулкана, рассекающего голову Юпитеру | «Imagine di Vulcano, che con vna secure di Diamante aprì il capo à Giou» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 127 | cartm84 | Образ Беллоны, богини войны | «Imagine di Bellona Dea della guerra & carrattiera di Marte, & de suoi » | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 128 | cartm85 | Образ Минервы, изобретательницы прядения и ткачества | «Imagine di Minerua inuentrice del filare, teffere, cucire, & altri don» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 129 | cartm86 | Образ Доблести и Чести | «Imagine della Virtù, & dell'Honore, che si risguardano così scolpiti i» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 130 | cartm87 | Образы богини Волюпии | «Imagini della Dea Volupia Dea de piaceri conculcante la Dea Virtù sott» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 131 | cartm88 | Образ богини Ангероны и бога Молчания | «Imagine della Dea Angerona da alcuni tenuta Dea del Piacere, & delle h» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 132 | cartm_jovegiants | Образ Юпитера, поражающего молнией Гигантов | «Imagine di Gioue fulminatore de i Giganti, che con le gambe loro di Se» | дл | ✓ | ✓ | ✓ |  | пакет перепроверен вслепую (подписи) |
| 133 | cartm_vulcan | Образ Вулкана, бога огня, с его кузницей | «Imagine di Vulcano Dio del Fuoco con la sua fucina, & li Ciclopi, che » | дл | ✓ | ✓ | ✓ |  |  |
| 134 | cartm_discordia | Образ Раздора по Аристиду | «Imagine della Discordia secondo Aristide, la quale per li suoi mali ef» | дл | ✓ | ✓ | ✓ |  |  |
| 135 | cartm_victory1 | Образ Победы с её знаками отличия | «Imagine della Vittoria con le sue insegne, l'Aquila, la Palma, & il La» | дл | ✓ | ✓ | ✓ |  |  |
| 136 | cartm_victory2 | Образ вооружённой Победы и её же без крыльев | «Imagine della Vittoria armata, & della medesima senza ale. La prima è » | дл | ✓ | ✓ | ✓ |  |  |
| 137 | cartm90 | Образ Вакха согласно Макробию | «Imagine di Bacco significante li effetti del vino, del quale fù l'inue» | дл | ✓ | ✓ | ✓ |  |  |
| 138 | cartm92 | Образы Вакха-триумфатора на слоне | «Imagini di Bacco trionfatore, & inuentore del Trionfo, doppo hauer sup» | дл | ✓ | ✓ | ✓ |  |  |
| 139 | cartm97 | Образы богов Ларов и Пенатов | «Imagini delli Dei Lari, cioè custodi delle priuate case, & delle parti» | дл | ✓ | ✓ | ✓ |  |  |
| 140 | cartb20 | Немезида | «Imagine della dea Nemesi dimostratrice delle buone opere, & seuera pun» | ✓ | ✓ | ✓ | ✓ |  |  |
| 141 | cartm101 | Образ Мома, бога порицания | «Imagine di Momo Dio della reprensione, ò maledicenza, & del biasmo, fi» | дл | ✓ | ✓ | ✓ |  |  |
| 142 | cartm102 | Образ Обмана по Данте | «Imagine della Fraude secondo Dante, qual dinota che li fraudolenti & i» | дл | ✓ | ✓ | ✓ |  |  |
| 143 | cartm107 | Образ доброго Случая и непостоянной Благосклонности | «Imagine del buono Euento & felice successo, del Fauore instabile, lieu» | дл | ✓ | ✓ | ✓ |  |  |
| 144 | cartb19 | Макария, или Счастье | «Imagine della Dea Macaria, ò Dea Felicità, figliuola d'Hercole, con il» | ✓ | ✓ | ✓ | ✓ |  |  |
| 145 | cart15 | Грации | «Imagini delle tre Gratie Dee della bellezza, & gratia; Dee ancora dell» | ✓ | ✓ | ✓ | ✓ |  |  |
| 146 | cartm117 | Образ Граций, ведомых Меркурием | «Imagine delle Gratie guidate da Mercurio dinotante, che il giouare & l» | дл | ✓ | ✓ | ✓ |  |  |
| 147 | carta2 | Эскулап | Митра, закалывающий быка; собака, змея, лев, ворон, факелоносцы, колес | ✗ | ✓ | ✓ | ✗ | заголовок: «Митра, убивающий быка»; место: annotationi-pignoria, блок 46 | ✓ совпадает |
| 148 | cartf3 | Юнона на камее | Юноша с факелом в колеснице, запряжённой двумя петухами, над ним звезд | ✗ | ✓ | ✓ | ✗ | заголовок: «Люцифер»; место: annotationi-pignoria, блок 66 | ✓ совпадает |
| 149 | carta3 | Изида на камее | Три сидящие фигуры: женщина, кормящая младенца; Юпитер (Серапис?) с мо | ✗ | ✓ | ✓ | ✓ | заголовок: «Три божества»; место: annotationi-pignoria, блок 80 | ✓ совпадает |
| 150 | carta4 | Борющиеся сатиры | Два сатира: человекоподобный с хвостиком и козлоногий, держат бубен/ки | ✗ | ✓ | ✓ | ✗ | заголовок: «Два рода Сатиров»; место: annotationi-pignoria, блок 94 | ✓ совпадает |
| 151 | cartf4 | Честь — в мужском и женском облике | Юноша с копьём и рогом изобилия (Честь) и воин в шлеме с копьём (Добле | ✓ | ✓ | ✓ | ✓ |  |  |
| 152 | carta28 | Образ Свободы | Свобода в лавровом венке с шапкой-пилеем и раскрытой ладонью; медальон | дл | ✓ | ✓ | ✓ |  |  |
| 153 | carta7 | Церера (Великая Мать) | Возлежащая Земля со звёздным шаром, путти несут корзины плодов | ✗ | ✓ | ✓ | ✗ | заголовок: «Земля»; место: annotationi-pignoria, блок 145 | ✓ совпадает |
| 154 | carta8 | Палемон и дельфин | Палемон-путто на дельфине у дерева; две камеи с морскими божествами | ✓ | ✓ | ✓ | ✓ |  |  |
| 155 | carta30 | Дагон | возлежащий бородатый бог под покрывалом, с веслом, опирающийся на морс | ✗ | ✓ | ✓ | ✓ | заголовок: «Океан» | ✓ совпадает |
| 156 | carta9 | Три Парки | три обнажённые женщины у скалы, две льют воду из урн на постаментах | ✗ | ✓ | ✓ | ✗ | заголовок: «Нимфы»; место: annotationi-pignoria, блок 223 | ✓ совпадает |
| 157 | carta31 | Меркурий и Пегас | император на коне; в медальонах — всадник над поверженным врагом и луч | ✗ | ✓ | ✓ | ✗ | заголовок: «Конная статуя Марка Аврелия»; место: annotationi-pignoria, блок 242 | ✓ совпадает |
| 158 | carta10 | Терм (бог границ) | герма Термина: голова в венке на сужающемся столбе, у основания два ку | ✓ | ✓ | ✓ | ✓ |  |  |
| 159 | carta32 | Два подвига Геркулеса | два Геркулеса в львиной шкуре: один с луком, другой с трофеем на копье | ✗ | ✓ | ✓ | ✗ | заголовок: «Геркулес с трофеем»; место: annotationi-pignoria, блок 258 | ✓ совпадает |
| 160 | carta33 | Семон Санк | юный безбородый нагой Геркулес с палицей и яблоками в руке | ✗ | ✓ | ✓ | ✓ | заголовок: «Юный Геркулес» | ✓ совпадает |
| 161 | carta13 | Гермафена (Минерва и Меркурий) | женщина с мечом указывает на грифона на колонне; в медальонах треножни | ✗ | ✓ | ✓ | ✓ | заголовок: «Аполлон с грифоном»; место: annotationi-pignoria, блок 269 | при перепроверке заголовок и место уточнены (Аполлон с грифоном, блок 269 — описывает именно эту фигуру) |
| 162 | carta35 | Минерва и корабль Арго | Минерва указывает мастеру, строящему корабль Арго; ниже Минерва перед  | ✓ | ✓ | ✓ | ✓ |  |  |
| 163 | carta36 | Марс Градив и Марс-победитель | Марс в шлеме с копьём и Венера, над ними летящий Амур | ✗ | ✓ | ✓ | ✗ | заголовок: «Марс и Венера»; место: annotationi-pignoria, блок 290 | ✓ совпадает |
| 164 | carta37 | Римские военные знамёна | нагой юный воин в шлеме с пером, с копьём и щитом, стоит на шаре | ✗ | ✓ | ✓ | ✗ | заголовок: «Обнажённый Марс»; место: annotationi-pignoria, блок 296 | ✓ совпадает |
| 165 | carta15 | Вакхическое шествие с яшмы Баггариса | вакханка с запрокинутой головой поднимает фигурку флейтиста; мальчик с | ✗ | ✓ | ✓ | ✗ | заголовок: «Вакханка»; место: annotationi-pignoria, блок 310 | ✓ совпадает |
| 166 | carta38 | Гений римского народа | бородатый муж в тоге со скипетром и свитком/ветвью; в медальоне юная г | ✗ | ✓ | ✓ | ✓ | заголовок: «Гений Сената» | ✓ совпадает |
| 167 | carta16 | Патера и рог Гения | бородатый Гений возлежит на ложе с патерой, змея у стола, женщина с ац | ✗ | ✓ | ✓ | ✓ | заголовок: «Гений на лектистернии» | ✓ совпадает |
| 168 | carta17 | Гений Антиохии | два юных Гения с модием на голове: один держит голову Солнца, другой — | ✗ | ✓ | ✓ | ✓ | заголовок: «Два Гения с модием» | ✓ совпадает |
| 169 | carta39 | Аполлон-кифаред («Святому Аполлону») | сидящая покрытая покрывалом богиня (Тиха Антиохии) над пловцом-рекой;  | ✗ | ✓ | ✓ | ✓ | заголовок: «Гений Антиохии» | ✓ совпадает |
| 170 | carta18 | Гений и Фортуна | юный Гений с патерой и Рогом изобилия у алтаря, дитя в звёздном плаще  | ✗ | ✓ | ✓ | ✓ | заголовок: «Гении с Рогом изобилия» | ✓ совпадает |
| 171 | carta19 | Фортуна на крыльях Лебедя | Фортуна верхом на лебеде по волнам, держит парус | ✓ | ✓ | ✓ | ✓ |  |  |
| 172 | carta40 | Эрот и Антэрот (колесница Матери) | крылатый Амур с луком над двумя сидящими фигурами; в медальоне крылата | ✗ | ✓ | ✓ | ✗ | заголовок: «Небесный Амур»; место: annotationi-pignoria, блок 366 | ✓ совпадает |
| 173 | carta20 | Два Амура и коза (мысль Авзония) | крылатые амуры обуздывают, связывают и оседлывают львицу | ✗ | ✓ | ✓ | ✗ | заголовок: «Амуры и львица»; место: annotationi-pignoria, блок 373 | ✓ совпадает |
| 174 | carta41 | Храм Венеры в Пафосе | Купидон, привязанный к дереву, его секут женщины; в медальоне два Амур | ✗ | ✓ | ✓ | ✗ | заголовок: «Распятый Купидон»; место: annotationi-pignoria, блок 375 | ✓ совпадает |
| 175 | carta22 | Молодой Янус | голова двуликого Януса с двумя юношескими лицами | ✓ | ✓ | ✓ | ✗ | место: aggionta, блок 6 | ✓ совпадает |
| 176 | carta23 | Ваза с образом Справедливости | обломок статуи без головы, в одеянии, с поясом из фигур (колесница со  | ✗ | ✓ | ✓ | ✗ | заголовок: «Обломок статуи Прозерпины»; место: aggionta, блок 24 | ✓ совпадает |
| 177 | carta24 | Статуя священника с его регалиями | безголовый обломок задрапированной статуи с перевязью, украшенной фигу | ✗ | ✓ | ✓ | ✓ | заголовок: «Перевязь статуи Прозерпины» | ✓ совпадает |
| 178 | carta43 | Фландрский Аттис, книга «Attidis initia», и статуя Пейреска | фигура юноши во фригийской шапке, в штанах, открытых на животе (Аттис) | дл | ✓ | ✓ | ✓ |  |  |
| 179 | carta25 | Первая Пантеистическая Рука | бронзовая рука с птицей (орлом) на двух поднятых пальцах, змеёй, шишко | ✓ | ✓ | ✓ | ✓ |  |  |
| 180 | carta44 | Символическая рука с лирой (четвёртая Пантеистическая рука) | поднятая рука (два пальца вверх) с лирой и другими знаками на ладони | дл | ✓ | ✓ | ✓ |  |  |
| 181 | carta45 | Юношеская фигура с посохом (надпись TYXAINI) | нагой юноша в лавровом венке с копьём, увенчанным рукой; на постаменте | ✗ | ✓ | ✗ | ✗ | заголовок: «Бог Тиллин»; итал.: «ΤΥΛΛΙΝΙ…»; русская подпись: «Тиллину.»; место: aggionta, блок 32 | надпись на постаменте считается подписью (как в тексте главы, блок 32): итал. ΤΥΛΛΙΝΙ, рус. «Тиллину.» |
| 182 | carta27 | Третья Пантеистическая Рука | раскрытая бронзовая рука, обвитая змеёй от большого пальца до запястья | ✓ | ✓ | ✓ | ✗ | место: aggionta, блок 31 | ✓ совпадает |
| 183 | carti1 | Омойока | сидящее мексиканское божество в перьях с опахалом; сверху ветвь, по ст | ✓ | ✓ | ✓ | ✓ |  |  |
| 184 | carti2 | Мексиканский идол с дарителями | мексиканское божество, сидящее на троне в рамке; в одной руке пучок пе | ✗ | ✓ | ✓ | ✓ | заголовок: «Хомопока» | ✓ совпадает |
| 185 | carti3 | Миктлантекутли и подземные боги | две коленопреклонённые мексиканские фигуры в перьях, обращённые друг к | ✓ | ✓ | ✓ | ✓ |  |  |
| 186 | carti4 | Вицлипуцли и спутник | две мексиканские фигуры друг против друга: слева сидящая (женская) фиг | ✗ | ✓ | ✓ | ✓ | заголовок: «Посол Ситлалатонака и Чимальман» | ✓ совпадает |
| 187 | carti5 | Крылатый дух | пляшущая фигура в перьях на голове, с развевающимся шарфом и подвеской | ✗ | ✓ | ✓ | ✓ | заголовок: «Посол Ситлалатонака» | ✓ совпадает |
| 188 | carti6 | Кецалькоатль | крылатая фигура с навершием-метой на голове и литуусом, стоит на ступе | ✓ | ✓ | ✓ | ✓ |  |  |
| 189 | carti_constantinevot | Медаль Константина: две крылатые Победы со щитом «VOT PR» и  | две крылатые Победы держат щит с надписью VOT PR над постаментом с кре | дл | ✓ | ✓ | ✓ |  |  |
| 190 | carti_constantinelabaro | Медаль Констанция: Император с лабарумом, увенчанный Победой | император с лабарумом (монограмма ☧), которого венчает крылатая Победа | дл | ✓ | ✓ | ✓ |  |  |
| 191 | carti_idolimessico | Два мексиканских идола, сопоставленные с египетскими фигурам | мексиканская голова в уборе с хвостом из подбородка; рядом египетская  | ✗ | ✓ | ✓ | ✓ | заголовок: «Мексиканский идол и египетский Гор» | ✓ совпадает |
| 192 | carti_pagodeelefante | Чешуйчатый идол из Мексики и «Пагода Слона» из Гоа | сидящий идол, весь покрытый чешуёй, с обезьяньим лицом; в углу — фигур | ✗ | ✓ | ✓ | ✗ | заголовок: «Второй мексиканский идол»; место: seconda-parte-indiani, блок 36 | ✓ совпадает |
| 193 | carti7 | «Египетские» божества-кентавры (вступление к Японии) | большая нагая фигура с тремя слоновьими головами и несколькими руками; | ✗ | ✓ | ✓ | ✗ | заголовок: «Пагода Слона и Ганиссоне»; место: seconda-parte-indiani, блок 38 | ✓ совпадает |
| 194 | carti8 | Каннон, сын Амиды | нагое божество в короне с сиянием, держит два копья; на груди множеств | ✓ | ✓ | ✓ | ✗ | место: seconda-parte-indiani, блок 40 | ✓ совпадает |
| 195 | carti9 | Ещё одна статуя Амиды близ Меако | два божества: слева нагая фигура на цветке лотоса над львом, с пальцем | ✗ | ✓ | ✓ | ✗ | заголовок: «Амида на Розе и Гарпократ»; место: seconda-parte-indiani, блок 41 | ✓ совпадает |
| 196 | carti10 | Бог-ящерица, покровитель учёности | бритоголовая статуя, сидящая на Розе под навесом, с которого на цепях  | ✗ | ✓ | ✓ | ✗ | заголовок: «Статуя Амиды близ Меако»; место: seconda-parte-indiani, блок 42 | ✓ совпадает |
| 197 | carti12 | Японский замок-храм | японский многоярусный храм на скальном основании, у входа несколько фи | ✓ | ✓ | ✓ | ✓ |  |  |
| 198 | carti13 | Великий японский идол | фигура на троне в храме с колоннами на ступенях; на потолке круглое из | ✗ | ✓ | ✓ | ✗ | заголовок: «Храм Бога-Ящерицы»; место: seconda-parte-indiani, блок 43 | ✓ совпадает |
| 199 | carti14 | Второй идольчик из собрания Алеандро | японский идол в короне внутри лучистой овальной мандорлы на вазе-пьеде | ✗ | ✓ | ✓ | ✓ | заголовок: «Японский идол Малоко» | ✓ совпадает |
| 200 | carti15 | Лысый смеющийся идол (первый идольчик) | лысый улыбающийся идол с нимбом, руки сцеплены пальцами, на подставке | ✓ | ✓ | ✓ | ✗ | место: seconda-parte-indiani, блок 48 | ✓ совпадает |
| 201 | carti16 | Воинственный дух (второй идольчик) | воин в доспехе с нимбом-кольцом, стоящий на чудовище (облакообразном с | ✓ | ✓ | ✓ | ✓ |  |  |
| 202 | carti17 | Пара фигур (третий и четвёртый идольчики) | две фигуры: карлик с мешком на плече на двух бочонках и сидящий идол в | ✓ | ✓ | ✓ | ✓ |  |  |
| 203 | carti18 | Плачущий идол (пятый идольчик) | лысый идол с нимбом, ладони сложены прямо в молитве | ✓ | ✓ | ✓ | ✓ |  |  |
| 204 | carti19 | Синекожая пара божеств (шестой и седьмой идольчики) | две сидящие фигуры: идол с цветком в волосах и жезлом; идол в высокой  | ✗ | ✓ | ✓ | ✓ | заголовок: «Шестой и седьмой идольчики» | ✓ совпадает |
| 205 | carti20 | Шестирукое божество с луком (восьмой идольчик) | шестирукое божество в шлеме-голове льва, с луком и полумесяцем, сидяще | дл | ✓ | ✓ | ✓ |  |  |
| 206 | carti21 | Святоподобная фигура с нимбом | лысый идол с нимбом, ладони сложены в молитве, на круглой подставке | ✓ | ✓ | ✓ | ✓ |  |  |
| 207 | carti22 | Богиня с младенцем на руках | стоящая фигура в венце с нимбом, держащая младенца у груди | ✓ | ✓ | ✓ | ✓ |  |  |
| 208 | carti23 | Синекожий идол в пламенном нимбе | воин в доспехе и венце с пламенным нимбом, с копьём и орудием, стоит н | ✓ | ✓ | ✓ | ✓ |  |  |
| 209 | carti24 | Красный идол, сидящий на звере | божество, сидящее на лотосе на спине льва (зверя), с чешуйчатой мандор | ✗ | ✓ | ✓ | ✗ | заголовок: «Идол верхом на звере»; место: seconda-parte-indiani, блок 61 | ✓ совпадает |
| 210 | carti25 | Воин на облаке с пламенным нимбом | воин в доспехе с пламенным нимбом, с коротким дротиком в правой руке,  | ✗ | ✓ | ✓ | ✗ | заголовок: «Воин, попирающий чудовище»; место: seconda-parte-indiani, блок 59 | ✓ совпадает |
| 211 | carti26 | Крылатый дух, попирающий поверженного | воин с пламенным нимбом, замахнувшийся оружием, стоит на поверженной ф | ✗ | ✓ | ✓ | ✗ | заголовок: «Воин с поднятым оружием»; место: seconda-parte-indiani, блок 60 | ✓ совпадает |
| 212 | carti27 | Заключение серии японских идолов; идол из слоновой кости Пей | нагой гротескный карлик с кудрями и короной на вазе-пьедестале (идолок | дл | ✓ | ✓ | ✗ | место: seconda-parte-indiani, блок 64 | ✓ совпадает |
