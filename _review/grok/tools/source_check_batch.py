# Образец из прохода B (cartari, партия 2), см. _review/grok/INFRASTRUCTURE.md. Пути /tmp/... — рабочие каталоги той сессии, поправить под себя.
import json,csv,os
R='/workspace/library'
d=json.load(open(R+'/books/cartari/entries.json'));IT={e['id']:e for e in d['items']}
U='https://digi.ub.uni-heidelberg.de/diglitData/image/cartari1626/4/%03d.jpg'
K='кустода (слово-отсылка внизу страницы) попала в text_it при транскрипции'
S=[
('cart5-2',152,'152 → 153','с. 152, последняя строка + кустода «non»; с. 153, 1-я строка','gli huomini non non haueuano','gli huomini non haueuano','transcription_error',['text_ru','text_en','text_fr'],f'Дубль «non» — не опечатка издания: {K}. В печати один «non».'),
('cartm33-2',99,'99 → 101','с. 99, последняя строка + кустода «nuti»; с. 101, 1-я строка (с. 100 — гравюра)','di minuti nuti granelli','di minuti granelli','transcription_error',['text_fr'],f'«nuti» — {K} («mi-|nuti»). В печати «di minuti granelli». RU/EN верны; FR «menues grains menus» — следствие.'),
('cartm37-4',106,'106 → 108','с. 106, последняя строка «risplen-» + кустода «dente,»; с. 108, 1-я строка (с. 107 — гравюра)','tutta risplendente, dente,','tutta risplendente,','transcription_error',['text_ru','text_en','text_fr'],f'Дубль «dente» — {K}. В печати «risplen-|dente,» один раз.'),
('cartm37-5',111,'111 → 112','с. 111, последняя строка + кустода «che»; с. 112, 1-я строка начинается «cose»','con le altre che cose','con le altre cose','transcription_error',['text_en','text_fr'],'Кустода «che» внизу с. 111 не совпадает с началом с. 112 («cose») — сбой кустоды в самом издании; в связном тексте печати «con le altre cose». «che» попало в text_it из кустоды.'),
('cartm37-6',110,'110 → 111','с. 110, последняя строка «te-» (кустоды нет); с. 111, 1-я строка «ste,»','due altre te-\n\nste, che si moueuano','due altre teste, che si moueuano','transcription_error',['text_ru','text_en','text_fr'],'В печати «te-|ste» — перенос слова через страницу; в text_it на этом месте разрыв абзаца посреди слова. RU «гол-\\n\\nовы», EN «heads\\n\\nheads», FR «têtes / têtes» — следствие.'),
('cartm50-2',160,'160 → 161','с. 160, последняя строка + кустода «temeuano»; с. 161, 1-я строка','temeuano temeuano','temeuano','transcription_error',['text_ru','text_en','text_fr'],f'Дубль — {K}. В печати один «temeuano».'),
('cartm54-3',181,'181 → 182','с. 181, последняя строка + кустода «&»; с. 182, 1-я строка','ginocchio, & & ad ciascheduno','ginocchio, & ad ciascheduno','transcription_error',['text_ru','text_en','text_fr'],f'«& &» — {K}. RU «и\\n\\nи», EN «and\\n\\nand», FR «et et» — следствие.'),
('cartm54-4',181,'179 → 181','с. 179, последняя строка «& huomi-» + кустода «ni»; с. 181, 1-я строка «ni di conto» (с. 180 — гравюра)','ni di conto, li quali','[huomi]ni di conto, li quali','transcription_error',['text_fr'],'Разрез записи посреди слова: «huomi-|ni di conto» = «huomini di conto» (знатные люди). Начало фразы («…& huomi-») относится к предыдущей записи cartm_cibeleatys, у которой text_it пустой (переводы есть; RU кончается дублем «но и многие знатные,, но и многие знатные»). Отдельного review-файла для cartm_cibeleatys нет — нужна проверка.'),
('cartm54-5',182,'182 → 183','с. 182, последняя строка «…di questa Dea:» + кустода «Per»; с. 183, 1-я строка стихов «Per lei si creda»','Dea: Per\n\nlei si creda','Dea:\n\nPer lei si creda','transcription_error',['text_ru','text_en','text_fr'],'«Per» — кустода, отделённая от стиха; в печати стих начинается «Per lei si creda». Отсюда FR «Car\\n\\nCar», EN «For\\n\\nFor» (см. также cartm54-2), RU лишнее «Ибо».'),
('cartm59-5',198,'198 → 200','с. 198, последняя строка «paro-» + кустода «le di»; с. 200, 1-я строка «le di trarla» (с. 199 — гравюра)','con parole di di trarla','con parole di trarla','transcription_error',['text_fr'],f'Дубль «di» — {K} («le di»). RU/EN верны, FR «de de» — следствие.'),
('cartm59-6',200,'200 → 201','с. 200, последняя строка «scriuẽ-» + кустода «do del-»; с. 201, 1-я строка «do della Beotia»','scriuendo del do della Beotia','scriuendo della Beotia','transcription_error',['text_fr'],'«del do» — кустода «do del-» в text_it. Тильда «scriuẽ-» раскрыта верно (scriuendo). FR «du la Béotie» — следствие; RU/EN передают смысл.'),
('cartm_anubis-3',280,'280 → 282','с. 280, последняя строка + кустода «Marco»; с. 282, 1-я строка (с. 281 — гравюра)','Marco Marco Tullio','Marco Tullio','transcription_error',['text_ru','text_en','text_fr'],f'Дубль «Marco» — {K}.'),
('cartm_fauore-3',399,'399 → 401','с. 399, последняя строка «con-» + кустода «uiene»; с. 401, 1-я строка «uiene, spinto» (с. 400 — гравюра)','che non gli conuiene\n\nviene, spinto','che non gli conuiene, spinto','transcription_error',['text_en'],'В печати «con-|uiene, spinto»: «viene» — кустода (u/v) с разрывом абзаца. EN «to come» — перевод обрывка «viene».'),
('cartm_fauore-4',399,'399 → 401','то же место, что cartm_fauore-3','che non gli conuiene\n\nviene, spinto','che non gli conuiene, spinto','transcription_error',['text_ru','text_fr'],'То же место, что cartm_fauore-3. FR «qu\'il ne lui convient / qu\'il ne lui convient», RU «подобает / подобает» — следствие (RU-строка добавлена).'),
('cartm_furoreira-3',325,'325 → 327','с. 325, последняя строка «Và la Fama dinanzi al carro di Mar-» + кустода «te,»; с. 327, 1-я строка (с. 326 — гравюра «Furore»)','\n\nre, perche al cominciare','\n\nperche al cominciare','transcription_error',['text_ru','text_en','text_fr'],'«re,» — искажённый остаток «[Mar]te,»; фраза начинается в cartm_marte («…carro di Marte,» — там уже есть). Догадка переводчиков (Молва/Fame/Renommée) по смыслу верна, но это слово из предыдущей записи: обрывок лучше убрать или отметить «[…]».'),
('cartm_tifone-3',356,'356 → 358','с. 356, последняя строка «ba-» + кустода; с. 358, 1-я строка «stasse.» (с. 357 — гравюра)','\n\nstasse. Et di Horo','\n\nEt di Horo','transcription_error',['text_ru','text_en','text_fr'],'«stasse.» — вторая половина «ba-|stasse.»; конец слова уже есть в cartm_baccopompa («bastasse.»). «довольно / suffice / suffît» — перевод обрывка, удалить.'),
('cartm_cupido-3',406,'406 → 407','с. 406, последняя строка + кустода «conto»; с. 407, 1-я строка «contò facendosi»','niun conto\n\ncontò facendosi','niun contò facendosi','transcription_error',['text_ru'],'«conto» — кустода (без акцента) с разрывом абзаца; в печати «niun contò facendosi». Подтверждает issue («ни во что не ставил»).'),
('carta41-3',527,'527 → 528','с. 527, последняя строка + кустода «Tali»; с. 528, 1-я строка «Tali Questo era…»','de i\n\nTali Tali Questo','de i\n\nTali Questo','transcription_error',['text_ru','text_en','text_fr'],'Дубль «Tali» — кустода. RU «Кости Кости», EN «Knucklebones Knucklebones», FR «Osselets Osselets» — следствие (RU/EN-строки добавлены).'),
('carta41-2',527,'527','нижняя треть, строка «Nel Cameo si vede Venere Calli piga…»','Venere Calliga','Venere Callipiga','transcription_error',['text_ru','text_en','text_fr'],'В печати «Venere Calli piga» (с пробелом) = Callipyga; «Calliga» — пропуск слога при транскрипции. Догадка issue («Callipyga») подтверждена; глоссы «(Обутая)/(Booted)/(Chaussée)» неверны. orig_after даёт слитное «Callipiga»; буквально в печати «Calli piga».'),
('cartm_pignoriasfinge-1',494,'494 → 495','с. 494, последняя строка «fre-» + кустода «quen-»; с. 495, 1-я строка «quentissima»','si vede frequen-\n\nte- quentissima nelle','si vede frequentissima nelle','transcription_error',['text_ru','text_fr'],'В печати «fre-|quentissima» (кустода «quen-»). В text_it обрывки «frequen-» и «te-» с разрывом абзаца. RU «встреча- встречается», FR «repré-» — следствие; EN верен.'),
('cartm_genio-4',368,'368','середина страницы','o perch\'egli di questa hauesse la cura, ò perch\'egli di questa hauesse la cura',None,'edition_error',['text_en','text_fr'],'Повтор есть в самой печати (внутри строки, не на стыке) — опечатка издания; text_it верен. RU верно опускает дубль; EN/FR повторяют.'),
]
rows=[]
for iid,pg,pl,region,find,rep,ver,aff,note in S:
  ent=iid.rsplit('-',1)[0]
  paras=IT[ent]['text_it']; hits=[(n,p) for n,p in enumerate(paras,1) if find in p]
  assert len(hits)==1,(iid,len(hits))
  n,p=hits[0]
  assert p.count(find)==1,(iid,'multi')
  after=p.replace(find,rep) if rep else None
  sc={'issue_id':iid,'scan_url':U%pg,'page':pl,'region':region,'orig_field':'text_it','paragraph':n,
      'orig_before':p,'orig_after':after,'verdict':ver,'translation_affected':aff,'note':note,'pass':'B','batch':2}
  fn=f'{R}/_review/grok/cartari/{ent}.json'; J=json.load(open(fn))
  J.setdefault('source_check',[]); J['source_check']=[x for x in J['source_check'] if x['issue_id']!=iid]+[sc]
  with open(fn,'w') as f: json.dump(J,f,ensure_ascii=False,indent=2); f.write('\n')
  rows.append([2,iid,ent,pl,U%pg,region,n,ver,';'.join(aff),find.replace('\n',' / '),(rep or '').replace('\n',' / '),note])
fn=f'{R}/_review/grok/cartari/source_check.csv'
old=list(csv.reader(open(fn)))
old=[r for r in old if not (r[0]=='2')]
with open(fn,'w',newline='') as f:
  w=csv.writer(f); w.writerows(old); w.writerows(rows)
print(len(rows))
