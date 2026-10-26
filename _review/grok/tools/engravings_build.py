# Образец из прохода B (cartari, партия 2), см. _review/grok/INFRASTRUCTURE.md. Пути /tmp/... — рабочие каталоги той сессии, поправить под себя.
import json,csv,re
R='/workspace/library'
d=json.load(open(R+'/books/cartari/entries.json'))['items'];IT={e['id']:e for e in d}
ORD={e['id']:n for n,e in enumerate(d)}
IMG=set(open('/tmp/eg/repo_img.txt').read().split()); PG=open('/tmp/eg/repo_pages.txt').read().split()
V='https://digi.ub.uni-heidelberg.de/diglitData/image/cartari1626/4/%03d.jpg'
def pages(s):
  out=set()
  for part in str(s).split(','):
    part=part.strip()
    m=re.match(r'^(\d+)-(\d+)$',part)
    if m: out|=set(range(int(m[1]),int(m[2])+1))
    elif re.match(r'^\d+$',part): out.add(int(part))
  return out
PS={e['id']:pages(e.get('page','')) for e in d}
F='full (рамка, вся страница)'
P=[
(49,'cart2',F,'Аполлон с посвящёнными ему животными и птицами',''),
(51,'cartm12',F,'Корабль Солнца, несомый крокодилом',''),
(53,'cartm13',F,'Аполлон, обнимающий Дафну',''),
(55,'cartm14',F,'Аполлон (Солнце) — бог благоразумия и власти',''),
(57,'cartm15',F,'Аполлон-Митра',''),
(59,'cartm16',F,'Священные быки египтян',''),
(61,'cartm17',F,'Нагой Аполлон, любитель быков',''),
(63,'cartm18',F,'Аполлон и Земля у ассирийцев',''),
(65,'cartm19',F,'Адад и Адаргата',''),
(66,'cartm20',F,'Серапис с трёхголовым чудищем',''),
(68,'cartm21',F,'Солнце — податель времён года; четыре сосуда',''),
(70,'cartm22',F,'Эскулап со священными животными',''),
(72,'cartm23',F,'Эскулап с петухами и змеем',''),
(75,'cartm24',F,'Античный перстень с пентаграммой (знак Здоровья)',''),
(77,'cartm25',F,'Богиня Салюс (Здоровье) со змеем',''),
(79,'cartm26',F,'Гигиея с псом и змеёй',''),
(81,'cartm27',F,'Колесница Солнца, запряжённая четвёркой коней',''),
(82,'cartm28',F,'Солнце-Феб, знаки зодиака и Луна',''),
(84,'cartm29',F,'Аврора на колеснице, Пегас',''),
(95,'cartm32',F,'Диана Кинфия с барсом и львом',''),
(98,'cartm33',F,'Геката триединая',''),
(100,'cartm34',F,'Изваяние Луны, получающей свет от Солнца','В entries поле page=100 стоит также у cartm_dianamoon («Imagine di Diana della caccia…»), но на с. 100 гравюра с подписью cartm34 («Simulacro della Luna…»). Где в издании гравюра cartm_dianamoon — не найдено на просмотренных страницах; проверить по фото.'),
(103,'cartm35',F,'Богиня Природа, многогрудая',''),
(105,'cartm36',F,'Исида — богиня мореплавателей (Ио)',''),
(107,'cartm37',F,'Исида египтян с атрибутами Нила',''),
(112,None,'bottom-middle (виньетка-концовка)','Виньетка: солнце с лицом','Не гравюра-таблица, а концовка главы; ниже кустода «GIOVE». В реестр включена для полноты, в счёт таблиц не входит.'),
(114,'cart4',F,'Юпитер и Пан',''),
(144,'cartm46',F,'Оракул Юпитера Аммона у троглодитов',''),
(151,'cart5',F,'Юнона Луцина и Сирийская богиня с птицами',''),
(155,'cartm48',F,'Ирида, вестница Юноны',''),
(157,'cartm49',F,'Юнона — царица богов; кукушка','В entries у cartm49 page=150, а гравюра с её подписью — на с. 157; проверить поле page.'),
(159,'cartm50',F,'Кастор и Поллукс',''),
(180,'cartm54',F,'Кибела на колеснице, запряжённой коровами',''),
(197,'cartm58',F,'Помона с серпом и псом',''),
(199,'cartm59',F,'Прозерпина и Добрая Богиня',''),
(202,'cartm60',F,'Главк, морской бог',''),
(271,'cartm80',F,'Гермы Меркурия',''),
(279,'cartm_merceloq',F,'Меркурий — бог красноречия, и Анубис',''),
(281,'cartm_anubis',F,'Анубис с крокодилом, Аписом и Юпитером Аммоном',''),
(283,'cartm_hercgall',F,'Галльский Геркулес — бог красноречия',''),
(287,'cartm81',F,'Геркулес вооружённый и Геркулес-обжора; птица Фолика',''),
(300,'cartm84',F,'Беллона и её жрецы',''),
(326,'cartm_furoreira',F,'Фурор (Неистовство) и Гнев',''),
(328,'cartm_martescithi',F,'Храм Марса у скифов; Марс у аравитян',''),
(357,'cartm_tifone',F,'Тифон и Гор',''),
(359,'cartm_horopriapo',F,'Гор-Приап с диском',''),
(367,'cartm_genio',F,'Добрый и злой Гений',''),
(398,'cartm_fortunacauallo',F,'Фортуна на коне, за ней Рок и Судьба',''),
(400,'cartm107',F,'Благой Исход, Фавор, Лесть и Зависть; колесо Фортуны','Начало подписи не попало в кроп: сверено от «Fauore instabile…» до конца; первую строку проверить по фото.'),
(402,'cartb19',F,'Макария (Счастье) с кадуцеем и рогом изобилия',''),
(408,'cartm_eroteanterote',F,'Эрот и Антэрот; Амур Летейский',''),
(492,'carta30','top, half (над текстом)','Полулежащая задрапированная фигура божества (по соседнему тексту — Нил?)','Подписи на доске не видно (миниатюра) — проверить по фото. Сюжет — проверить по фото.'),
(494,None,'top, half (над текстом)','Три обнажённые женские фигуры','Запись не определена: ниже — текст «Et simile scoltura…» (cartm_pignoriasfinge, textOnly, про Нимф); подписи не видно — проверить по фото.'),
(495,'carta9','middle, half (между абзацами)','Три женские фигуры в одеждах — Парки (Фата)','Текст под гравюрой: «…FATIS VICTRICIBVS… le Parche». В entries у carta9 page=494, img=carta9_p534.jpg — по скану гравюра на с. 495; проверить поле page.'),
(496,'carta31','middle, half (между абзацами)','Две камеи и Меркурий, укрощающий Пегаса','Ниже — «Ne due Camei s\'è rappresentato, in vno Mercurio, che frena il Pegaso…». Подписи на доске не видно — проверить по фото.'),
(496,None,'bottom (виньетка-концовка)','Орнаментальная концовка','Не гравюра-таблица.'),
(526,'carta20','top, half (над текстом)','Амуры и Венера (по тексту: амуры привязывают Купидона к кресту, сюжет Авсония)','Подписи на доске не видно — проверить по фото.'),
(526,None,'bottom (виньетка-концовка)','Орнаментальная концовка','Не гравюра-таблица.'),
(527,'carta41','top, half (над текстом)','Сцена с фигурами среди деревьев (к тексту о храме Венеры в Пафосе)','Сюжет и подпись — проверить по фото.'),
(528,'cartm_pignoriaerrata','bottom, half (под текстом «IL FINE»)','Сидящая задрапированная фигура с посохом (вставная гравюра «к №52–53»)','Подпись прочитана по кропу.'),
(529,'carta21','bottom, half (под текстом)','Две головы в профиль (бородатый старец — Сатурн?)','У carta21 в entries нет img (HANDOFF: нужна обрезка со с. 529). Кустода внизу «Giano». Сюжет — проверить по фото.'),
]
NOCAP={492,494,496,526,527,529}
BTW={492:'над текстом «Vuole il Pighio…» (carta30); перед ней — конец carta8 (с. 491) [по скану]',
494:'между концом с. 493 (текст о Ниле, carta30) и «Et simile scoltura…» (cartm_pignoriasfinge) [по скану]',
495:'между «…Delle Lamie vedasi il Del-rio…» (cartm_pignoriasfinge) и «Et si sono tratte da vna Medaglia… FATIS VICTRICIBVS» (carta9) [по скану]',
496:'между «…daglie. & di quella…» и «Ne due Camei s’è rappresentato…» (оба — carta31) [по скану]',
526:'над текстом «Il pensiero d’Ausonio…» (carta20) [по скану]',
527:'над текстом «Nel Cameo s’è rappresentato il tempio di Venere…» (carta41) [по скану]',
528:'после «…TALI EBOREI. IL FINE.» (конец carta41) [по скану]',
529:'под текстом «AGGIVNTA… Aturno haueua vna falce…» (carta21) [по скану]'}
rows=[];cnt={}
for page,ent,pos,subj,note in P:
  cnt[page]=cnt.get(page,0)+1; gid=f'cart-g-{page}-{cnt[page]}'
  vign='концовка' in pos
  if vign: cap=''
  elif page in NOCAP: cap='проверить по фото'
  else: cap=(IT[ent].get('caption') or '') if ent else 'проверить по фото'
  # between
  bef=[e for e,s in PS.items() if page-1 in s]; aft=[e for e,s in PS.items() if page+1 in s]
  bef=sorted(bef,key=ORD.get); aft=sorted(aft,key=ORD.get)
  if pos.startswith(F[:4]) and not vign:
    b=bef[-1] if bef else 'не определено'; a=aft[0] if aft else 'не определено'
    btw=(f'прерывает текст {b} (с. {page-1} → с. {page+1})' if b==a else f'{b} (с. {page-1}) | {a} (с. {page+1})')+' [по полю page, не по скану]'
  elif vign: btw=''
  else: btw=BTW.get(page,'')
  rf=[]
  if ent:
    im=IT[ent].get('img') or []
    if isinstance(im,str): im=json.loads(im.replace("'",'"'))
    for x in im:
      if x in IMG: rf.append('img/'+x)
      elif x in PG: rf.append('pages/'+x+' (img указывает на файл, которого нет в img/; он есть в pages/)')
      else: rf.append(x+' (в img указан, файла нет в репо)')
    if not im: rf.append('img не указан')
    if (ent+'.jpg') in IMG and 'img/'+ent+'.jpg' not in rf: rf.append('img/'+ent+'.jpg')
    if not any(r.startswith('img/') for r in rf):
      pg=[x for x in PG if x.split('.')[0]==ent or x.startswith(ent+'_p')]
      if pg: rf.append('скан(ы) в pages/: '+', '.join(pg[:3])+(' …' if len(pg)>3 else ''))
  n=note
  if cap and cap!='проверить по фото': n=(n+' ' if n else '')+'caption_on_plate = repo caption, совпадение с гравюрой проверено по кропу (по словам; акценты и u/v построчно не сверялись).'
  rows.append([gid,page,V%page,pos,ent or 'null',btw,cap,subj,'; '.join(dict.fromkeys(rf)),n.strip()])
with open(R+'/_review/grok/cartari/engravings.csv','w',newline='') as f:
  w=csv.writer(f); w.writerow(['engr_id','page','iiif_page_url','position','entry_id','between_entries','caption_on_plate','subject_ru','repo_image','notes']); w.writerows(rows)
plates=[r for r in rows if 'концовка' not in r[3]]
print(len(rows),'plates',len(plates),'vignettes',len(rows)-len(plates),'pages',len({r[1] for r in rows}))
print('no entry',[r[0] for r in rows if r[4]=='null'])
print('check photo',sum(1 for r in rows if 'проверить по фото' in r[6]+r[9]))
for r in rows: print(r[0],r[4],'|',r[5],'|',r[8])
