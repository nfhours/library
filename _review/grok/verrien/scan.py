# Поиск аномалий в монограммах verrien (часть 2, flag=='') для одной партии.
# Запуск: python3 _review/grok/verrien/scan.py <первый_id> <n>  (например v2-1-2 200)
# Печатает аномалии; пишет сырой список в /tmp/verrien_last.json. Вердикты вносятся в monograms_anomalies.csv вручную, по фото.
import json,re,collections,sys,os
ROOT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
L=json.load(open(os.path.join(ROOT,'books/verrien/entries.json')))['items']
P=[e for e in L if e['part']==2 and e['flag']=='']
start,n=sys.argv[1],int(sys.argv[2])
ids=[e['id'] for e in P]; i=ids.index(start); B=P[i:i+n]
prev = P[i-1]['fr'] if i>0 else ''
AL='ABCDEFGHIKLMNOPQRSTVXYZ'
def key(s): return tuple(AL.index(c) if c in AL else 99 for c in s)
byplate=collections.defaultdict(list)
for e in P: byplate[e['plate_img']].append(e)
out=[]
for e in B:
    k=[]
    fr=e['fr']
    if not fr.strip() or not e['ru'].strip(): k.append('empty')
    if not re.fullmatch(r'[A-Z]{1,4}',fr): k.append('real_text_or_nonletters')
    vals={'fr':fr,'ru':e['ru'],'name_fr':e['name_fr'],'text_fr':'|'.join(e['text_fr']),'text_ru':'|'.join(e['text_ru'])}
    if len(set(vals.values()))>1: k.append('fr_ru_mismatch:'+json.dumps(vals,ensure_ascii=False))
    if e['meaning_fr'] or e['meaning_ru'] or e['motto_fr']: k.append('extra_fields')
    if re.search('[JUW]',fr): k.append('letter_JUW')
    same=[x['id'] for x in byplate[e['plate_img']] if x['fr']==fr and x['id']!=e['id']]
    if same: k.append('dup_on_plate:'+','.join(same))
    if re.fullmatch(r'[A-Z]{1,4}',fr) and re.fullmatch(r'[A-Z]{1,4}',prev or 'A'):
        if not (len(fr)>len(prev) or (len(fr)==len(prev) and key(fr)>key(prev))): k.append('order:%s after %s'%(fr,prev))
        if len(set(fr))<len(fr): k.append('repeated_letter')
    prev=fr
    out.append((e['id'],e['plate_img'],fr,k))
for o in out:
    if o[3]: print(o)
print('first',B[0]['id'],'last',B[-1]['id'],'next',P[i+n]['id'] if i+n<len(P) else None,'n',len(B))
print('plates',sorted(set(e['plate_img'] for e in B),key=lambda s:int(s.split('-')[1].split('.')[0])))
json.dump([[o[0],o[1],o[2],o[3]] for o in out],open('/tmp/verrien_last.json','w'),ensure_ascii=False)
