# Образец из прохода B (cartari, партия 2), см. _review/grok/INFRASTRUCTURE.md. Пути /tmp/... — рабочие каталоги той сессии, поправить под себя.
import json,re
R='/workspace/library'
d=json.load(open(R+'/books/cartari/entries.json'));IT={e['id']:e for e in d['items']}
SC={
'cart5-2':'Сверка со сканом (с. 152→153): дубль «non» — кустода внизу с. 152, внесённая в text_it при транскрипции; в печати один «non».',
'cartm33-2':'Сверка со сканом (с. 99→101): «nuti» — кустода («mi-|nuti»), внесённая при транскрипции; в печати «di minuti granelli».',
'cartm37-4':'Сверка со сканом (с. 106→108): «dente,» — кустода, внесённая при транскрипции; в печати «risplen-|dente,» один раз.',
'cartm37-5':'Сверка со сканом (с. 111→112): «che» — кустода с. 111 (в издании сама кустода не совпадает с началом с. 112 «cose»); в связном тексте «con le altre cose».',
'cartm37-6':'Сверка со сканом (с. 110→111): в печати «te-|ste» — перенос через страницу, в text_it разрыв абзаца посреди слова; RU «гол-/овы», EN «heads/heads» — то же.',
'cartm50-2':'Сверка со сканом (с. 160→161): дубль — кустода «temeuano», внесённая при транскрипции; в печати одно слово.',
'cartm54-3':'Сверка со сканом (с. 181→182): «& &» — кустода «&», внесённая при транскрипции; в печати один «&».',
'cartm54-4':'Сверка со сканом (с. 179→181): в печати «& huomi-|ni di conto» = «huomini di conto» (знатные люди); начало фразы — в cartm_cibeleatys (там text_it пустой). «люди без положения» — неверно.',
'cartm54-5':'Сверка со сканом (с. 182→183): «Per» — кустода; в печати стих начинается «Per lei si creda». Отсюда дубли «Car/For» и лишнее RU «Ибо».',
'cartm59-5':'Сверка со сканом (с. 198→200): «di di» — кустода «le di», внесённая при транскрипции; в печати «con parole di trarla».',
'cartm59-6':'Сверка со сканом (с. 200→201): «del do» — кустода «do del-», внесённая при транскрипции; в печати «scriuẽ-|do della Beotia» (тильда раскрыта верно).',
'cartm_anubis-3':'Сверка со сканом (с. 280→282): дубль «Marco» — кустода, внесённая при транскрипции; в печати один «Marco».',
'cartm_fauore-3':'Сверка со сканом (с. 399→401): в печати «con-|uiene, spinto»; «viene» — кустода с разрывом абзаца. EN «to come» — перевод обрывка, удалить.',
'cartm_fauore-4':'Сверка со сканом (с. 399→401): то же место, что cartm_fauore-3; «viene» — кустода. FR и RU повторяют «convient/подобает».',
'cartm_furoreira-3':'Сверка со сканом (с. 325→327): «re,» — искажённый остаток «Mar-|te,» (кустода «te,»); фраза «Và la Fama dinanzi al carro di Marte, perche…» начинается в cartm_marte. Догадка «Fama» по смыслу верна, но слово из предыдущей записи — обрывок убрать.',
'cartm_tifone-3':'Сверка со сканом (с. 356→358): «stasse.» — вторая половина «ba-|stasse.», конец слова уже есть в cartm_baccopompa. Перевод обрывка («довольно/suffice/suffît») удалить.',
'cartm_cupido-3':'Сверка со сканом (с. 406→407): ПОДТВЕРЖДЕНО — «conto» — кустода; в печати «niun contò facendosi».',
'carta41-2':'Сверка со сканом (с. 527): ПОДТВЕРЖДЕНО — в печати «Venere Calli piga» (= Callipyga); «Calliga» — ошибка транскрипции.',
'carta41-3':'Сверка со сканом (с. 527→528): дубль «Tali» — кустода; в печати «Tali» один раз. RU/EN тоже дублируют.',
'cartm_pignoriasfinge-1':'Сверка со сканом (с. 494→495): в печати «fre-|quentissima» (кустода «quen-»); обрывки «frequen-», «te-» — ошибки транскрипции. RU «встреча- встречается» — то же.',
'cartm_genio-4':'Сверка со сканом (с. 368): повтор есть в самой печати — опечатка издания; text_it верен.',
}
TE={'cart5-2','cartm33-2','cartm37-4','cartm50-2','cartm54-3','cartm59-5','cartm59-6','cartm_anubis-3','carta41-3'}
def tr_par(ent,field,snip):
  t=IT[ent][field]; h=[n for n,p in enumerate(t,1) if snip in p]; assert len(h)==1,(ent,field,snip,h); return h[0]
NEW=[
('cartm37-6','text_en','ocr','two other heads\n\nheads, which moved','two other heads, which moved (перенос «te-|ste» через страницу, скан с. 110→111)','medium',"vi erano due altre te- … ste, che si moueuano"),
('cartm37-6','text_ru','ocr','две иные гол-\n\nовы','две иные головы (перенос через страницу, скан с. 110→111)','medium',"vi erano due altre te- … ste, che si moueuano"),
('cartm54-3','text_en','ocr','and\n\nand on each side a Lion','and on each side a Lion (дубль «and» — кустода «&», скан с. 181→182)','medium','& & ad ciascheduno de i lati hà vn Lione'),
('cartm54-5','text_ru','ocr','Овидий: Ибо\n\nради неё','Овидий:\n\nРади неё, веруют… (лишнее «Ибо»: «Per» — кустода, в печати стих «Per lei si creda»)','medium','così dice Ouidio di questa Dea: Per'),
('cartm_fauore-4','text_ru','ocr','нежели ему подобает\n\nподобает, подгоняемое','нежели ему подобает, подгоняемое (дубль на стыке страниц: «viene» — кустода)','medium',"che non gli conuiene … viene, spinto dall'Adulatione"),
('cartm_furoreira-3','text_ru','addition','Молву, ибо при начале войн','Ибо при начале войн… (обрывок «re,» = «[Mar]te,» из фразы cartm_marte; «Молву» — догадка, слово из предыдущей записи)','medium','re, perche al cominciare delle guerre'),
('cartm_furoreira-3','text_en','addition','Fame, for at the starting of wars','For at the starting of wars… (обрывок «re,» = «[Mar]te,»; «Fame» — из предыдущей записи)','medium','re, perche al cominciare delle guerre'),
('carta41-3','text_ru','ocr','Кости Кости (Tali)','Кости (Tali) (дубль — кустода «Tali», скан с. 527→528)','medium',"del giuoco de i Tali Tali"),
('carta41-3','text_en','ocr','Knucklebones Knucklebones','Knucklebones (дубль — кустода «Tali», скан с. 527→528)','medium',"del giuoco de i Tali Tali"),
('carta41-2','text_en','mistranslation','Venus Calliga (Booted)','Venus Callipyga (в печати «Calli piga», скан с. 527); глосса «(Booted)» неверна','high','Nel Cameo si vede Venere Calliga come stà nelle Medaglie.'),
('cartm_pignoriasfinge-1','text_ru','ocr','часто\n\nвстреча- встречается','часто встречается (обрывки на стыке страниц, скан с. 494→495)','medium',"quest'vltima si vede frequen- te- quentissima"),
]
CAL={'text_ru':'Венера Каллипига (в печати «Calli piga», скан с. 527; «Calliga» — ошибка транскрипции); глосса «(Обутая)» неверна',
     'text_fr':'Vénus Callipyge (в печати «Calli piga», скан с. 527; «Calliga» — ошибка транскрипции); глосса «(Chaussée)» неверна'}
import collections
byent=collections.defaultdict(list)
for x in NEW: byent[x[0].rsplit('-',1)[0]].append(x)
ents={i.rsplit('-',1)[0] for i in SC}
cnt=collections.Counter()
for ent in sorted(ents):
  fn=f'{R}/_review/grok/cartari/{ent}.json'; J=json.load(open(fn))
  for iid,field,typ,cur,sug,conf,orig in byent.get(ent,[]):
    J['issues']=[i for i in J['issues'] if not (i['issue_id']==iid and i['field']==field)]
    par=tr_par(ent,field,cur)
    J['issues'].append({'field':field,'issue_id':iid,'fields':[],'paragraph':par,'type':typ,'original':orig,'current':cur,'suggested':sug,'confidence':conf,'added_in':'pass B'})
    cnt['new']+=1
  for i in J['issues']:
    iid=i['issue_id']
    if iid not in SC: continue
    i['scan_check']=SC[iid]; cnt['sc']+=1
    s=i['suggested']
    if iid in TE or iid=='cartm54-3':
      s=s.replace('опечатка оригинала','кустода, внесённая при транскрипции').replace('повтор «& &» оригинала','кустода «&», внесённая при транскрипции').replace('сбой «del do» оригинала','кустода «do del-», внесённая при транскрипции')
    if iid=='cartm_genio-4': s=s.replace('опечатка оригинала','опечатка издания, так в печати')
    if iid=='carta41-2' and i['field'] in CAL: s=CAL[i['field']]; i['confidence']='high'
    if iid=='cartm54-4' and i['field']=='text_fr':
      s='[des hommes] de condition («…& huomi-|ni di conto» = «huomini di conto», знатные люди; начало фразы — в cartm_cibeleatys, скан с. 179→181)'; i['confidence']='medium'
    if iid in ('cartm_cupido-3','cartm_tifone-3') and i['confidence']=='low': i['confidence']='medium'
    s=s.replace(', не уверен','').replace(' — не уверен','') if iid in ('cartm_tifone-3','carta41-2') else s
    i['suggested']=s
  # fields lists per shared id
  F=collections.defaultdict(list)
  for i in J['issues']:
    if i['field'] not in F[i['issue_id']]: F[i['issue_id']].append(i['field'])
  for i in J['issues']:
    if i['issue_id'] in SC: i['fields']=F[i['issue_id']]
    elif not i.get('fields'): i['fields']=F[i['issue_id']]
  with open(fn,'w') as f: json.dump(J,f,ensure_ascii=False,indent=2); f.write('\n')
print(cnt)
