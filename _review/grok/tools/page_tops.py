# Образец из прохода B (cartari, партия 2), см. _review/grok/INFRASTRUCTURE.md. Пути /tmp/... — рабочие каталоги той сессии, поправить под себя.
import sys
exec(open('/tmp/hd/loc.py').read().split("if __name__")[0])
from PIL import Image
for l in sys.argv[1:]:
  fn,t=get(l);ws=words(t)
  ws=[w for w in ws if w[2]>150 and w[2]<500]
  print(l,' '.join(w[0] for w in ws[:25]))
  im=Image.open(fn);W,H=im.size;im.crop((120,120,W-120,420)).save(f'/tmp/hd/t{l}.png')
