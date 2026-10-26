# Образец из прохода B (cartari, партия 2), см. _review/grok/INFRASTRUCTURE.md. Пути /tmp/... — рабочие каталоги той сессии, поправить под себя.
import json,sys,os,subprocess,re,difflib
from PIL import Image
M=json.load(open('/tmp/cart_manifest.json'))['sequences'][0]['canvases']
LAB={}
for x in M: LAB.setdefault(x['label'],x['images'][0]['resource']['@id'])
def pages(rng):
    out=[]
    for part in rng.split(','):
        part=part.strip()
        if '-' in part:
            a,b=part.split('-'); out+= [str(i) for i in range(int(a),int(b)+1)]
        else: out.append(part)
    return out
def get(lbl):
    fn=f'/tmp/hd/{lbl}.jpg'
    if not os.path.exists(fn): subprocess.run(['curl','-sL','-o',fn,LAB[lbl]],check=True)
    tsv=f'/tmp/hd/{lbl}.tsv'
    if not os.path.exists(tsv): subprocess.run(['tesseract',fn,f'/tmp/hd/{lbl}','-l','ita','tsv'],capture_output=True)
    return fn,tsv
def words(tsv):
    W=[]
    for l in open(tsv).read().split('\n')[1:]:
        c=l.split('\t')
        if len(c)==12 and c[11].strip(): W.append((c[11],int(c[6]),int(c[7]),int(c[8]),int(c[9])))
    return W
norm=lambda s: re.sub(r'[^a-z]','',s.lower().replace('ſ','s').replace('u','v'))
def locate(rng,snip,iid,extra=0):
    sw=[norm(w) for w in snip.split() if norm(w)]
    best=(0,None)
    lbls=pages(rng); 
    if extra: 
        i0=[x['label'] for x in M].index(lbls[0]); i1=[x['label'] for x in M].index(lbls[-1])
        lbls=[x['label'] for x in M[max(0,i0-extra):i1+extra+1]]
    for lbl in lbls:
        if lbl not in LAB: continue
        fn,tsv=get(lbl); W=words(tsv); nw=[norm(w[0]) for w in W]
        n=len(sw)
        for i in range(0,max(1,len(nw)-n+1)):
            s=difflib.SequenceMatcher(None,''.join(sw),''.join(nw[i:i+n])).ratio()
            if s>best[0]: best=(s,(lbl,W[i]))
    s,(lbl,w)=best
    im=Image.open(f'/tmp/hd/{lbl}.jpg'); W_,H=im.size
    y=w[2]; crop=im.crop((120,max(0,y-200),W_-120,min(H,y+230)))
    out=f'/tmp/hd/c_{iid}.png'; crop.save(out)
    print(iid,'page',lbl,'score',round(s,2),'at',w[1],w[2],'->',out, LAB[lbl])
if __name__=='__main__':
    locate(sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]) if len(sys.argv)>4 else 0)
