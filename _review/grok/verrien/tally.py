# Сводка анализа монограмм verrien (часть 2) по партиям.
# Читает monograms_scan.csv (batch,first,last,scanned) и monograms_anomalies.csv,
# ПЕРЕЗАПИСЫВАЕТ monograms_scan.csv пересчитанными колонками и печатает строку для progress.csv.
# Запуск из любого каталога: python3 _review/grok/verrien/tally.py
import csv,collections,json,os
D=os.path.dirname(os.path.abspath(__file__))+'/'
old=list(csv.DictReader(open(D+'monograms_scan.csv')))
an=list(csv.DictReader(open(D+'monograms_anomalies.csv')))
QUIRK={'dup_on_plate_edition_variant','dup_letter_out_of_order_edition','caption_wraparound_edition','caption_letter_order_edition'}
DUP={'dup_on_plate_edition_variant','dup_on_plate_caption_typo'}
cols=['batch','first','last','scanned','plain_letters_only','anomalous_entries','real_text_entries','empty','dup_on_plate','caption_typo','edition_quirk','fr_ru_mismatch','issues']
out=[]
for r in old:
    b=r['batch']; A=[a for a in an if a['batch']==b and a['kind']!='sequence_gap']
    k=collections.Counter(a['kind'] for a in A)
    issues=sum(1 for a in A if a['verdict']!='ok')
    out.append(dict(batch=b,first=r['first'],last=r['last'],scanned=r['scanned'],plain_letters_only=int(r['scanned'])-len(A),
        anomalous_entries=len(A),real_text_entries=k['real_text'],empty=k['empty'],
        dup_on_plate=sum(v for x,v in k.items() if x in DUP),
        caption_typo=sum(1 for a in A if a['kind']=='caption_typo' or (a['kind']=='dup_on_plate_caption_typo' and a['verdict']!='ok')),
        edition_quirk=sum(v for x,v in k.items() if x in QUIRK),
        fr_ru_mismatch=k['fr_ru_mismatch'],issues=issues))
w=csv.DictWriter(open(D+'monograms_scan.csv','w'),fieldnames=cols); w.writeheader(); w.writerows(out)
s=lambda c: sum(int(r[c]) for r in out)
print('verrien-p2-mono,%d,%d,%d,%d'%(s('scanned'),s('plain_letters_only'),s('anomalous_entries'),s('issues')))
