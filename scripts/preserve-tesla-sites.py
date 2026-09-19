"""Create inert, local archival replays from recovered public HTML. Requires beautifulsoup4.
Run with the recovery working directory as argv[1]. Never republishes active storefront code.
"""
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from urllib.parse import urljoin,urlparse,unquote
from urllib.request import urlopen,Request
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,re,sys
work=Path(sys.argv[1]); site=Path(__file__).resolve().parents[1]; root=site/'public/archives';assets=root/'assets';assets.mkdir(parents=True,exist_ok=True)
cachefile=work/'asset-cache.json'; cache=json.loads(cachefile.read_text()) if cachefile.exists() else {}; records=[]
def original_asset(u):
 u=u.replace('//specteslacup.com/cdn/shop/','//cdn.shopify.com/s/files/1/0472/1344/5275/')
 u=u.replace('//specteslacup.com/cdn/fonts/','//fonts.shopifycdn.com/')
 return 'https:'+u if u.startswith('//') else u

def getasset(u,base):
 if u.startswith('data:') or u.startswith('#'):return u
 if u.startswith('/archives/assets/') and (site/'public'/u.lstrip('/')).exists():return u
 u=original_asset(urljoin(base,u));h=hashlib.sha256(u.encode()).hexdigest()[:20]
 if u in cache:return cache[u]['local']
 try:
  r=urlopen(Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=25);b=r.read();typ=r.headers.get_content_type()
  if not (typ.startswith('image/') or 'css' in typ or 'font' in typ or 'octet-stream' in typ):raise ValueError(typ)
  ext={'text/css':'.css','image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','image/svg+xml':'.svg','image/gif':'.gif','font/woff2':'.woff2','font/woff':'.woff'}.get(typ,Path(urlparse(u).path).suffix or '.bin')
  name=h+ext;local='/archives/assets/'+name;(assets/name).write_bytes(b)
  cache[u]={'local':local,'source':u,'retrieved':r.url,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'type':typ}
  return local
 except Exception as e:
  cache[u]={'local':None,'source':u,'error':str(e)};return None

pages=[{'file':'tesloco-original.html','original':'https://tesloco.wordpress.com/','local':'tesloco/2026-09-19/index.html','label':'Home · surviving WordPress site','date':'Recovered September 19, 2026','project':'tesloco'}]
for f,path,label in [('wp-services.html','our-services','Our Services'),('wp-about.html','about-2','About TESLOCO'),('wp-quote.html','get-a-quote','Get a Quote · inactive')]:pages.append({'file':f,'original':'https://tesloco.wordpress.com/'+path+'/','local':'tesloco/2026-09-19/'+path+'/index.html','label':label,'date':'Recovered September 19, 2026','project':'tesloco'})
pages += [{'file':'cup-latest.html','original':'https://specteslacup.com/','timestamp':'20260208081150','local':'specteslacup/2026-02-08/index.html','label':'Home · February 8, 2026','date':'Wayback capture · February 8, 2026','project':'specteslacup'}, {'file':'cup-first.html','original':'https://specteslacup.com/','timestamp':'20221017031946','local':'specteslacup/2022-10-17/index.html','label':'Earlier home · October 17, 2022','date':'Wayback capture · October 17, 2022','project':'specteslacup'}]
for p in json.loads((work/'recovery/pages.json').read_text()):
 stamp=p['timestamp'];dt=stamp[:4]+'-'+stamp[4:6]+'-'+stamp[6:8];path=urlparse(p['original']).path.strip('/')
 pages.append({**p,'file':'recovery/source/'+p['file'],'local':'specteslacup/'+dt+'/'+path+'/index.html','date':'Wayback capture · '+dt,'project':'specteslacup'})
linkmap={p['original'].rstrip('/'):'/archives/'+p['local'] for p in reversed(pages)}
soups=[];requests=set()
for p in pages:
 s=BeautifulSoup((work/p['file']).read_text(),'html.parser');p['title']=s.title.get_text(' ',strip=True) if s.title else p['original'];p.setdefault('label',p['title'].split(' – ')[0]);p['source']='https://web.archive.org/web/'+p['timestamp']+'/'+p['original'] if p.get('timestamp') else p['original'];p['raw_sha256']=hashlib.sha256((work/p['file']).read_bytes()).hexdigest()
 for t in s.select('noscript link[rel="stylesheet"]'):s.head.append(t.extract())
 for t in s.select('link[as="style"]'):t['rel']=['stylesheet'];t.attrs.pop('as',None)
 for t in s.select('script,noscript,object,embed,base,template,#actionbar,#wpadminbar,.wp-lightbox-overlay,.widget_eu_cookie_law_widget'):t.decompose()
 for t in s.select('link'):
  if 'stylesheet' not in t.get('rel',[]) or any(x in t.get('href','') for x in ['calendly','hulk','wallet','contact-form','actionbar']):t.decompose()
 for t in s.select('meta'):
  if t.get('http-equiv') or t.get('name','').lower() not in ['viewport','description']:t.decompose()
 for t in list(s.find_all()):
  for key in list(t.attrs):
   if key.startswith('on') or key in ['srcdoc','ping','nonce','integrity','crossorigin']:del t[key]
 for form in s.find_all('form'):
  form.name='div';form.attrs={k:v for k,v in form.attrs.items() if k in ['class','id']};msg=s.new_tag('p');msg['class']='preservation-inactive';msg.string='Archived form — submissions are closed.';form.insert(0,msg)
 for t in s.select('input,textarea,select,button'):t['disabled']='';t.attrs.pop('name',None);t.attrs.pop('formaction',None)
 for t in s.select('input[type="hidden"]'):t.decompose()
 for t in s.find_all('iframe'):
  src=t.get('src','');msg=s.new_tag('p');msg['class']='preservation-inactive'
  m=re.search(r'(?:youtube(?:-nocookie)?\.com/embed/)([\w-]+)',src)
  if m:
   a=s.new_tag('a',href='https://www.youtube.com/watch?v='+m[1],target='_blank',rel='noopener noreferrer');a.string='Watch the original video on YouTube ↗';msg.append(a)
  else:msg.string='External embed omitted from this preserved copy.'
  t.replace_with(msg)
 for t in s.select('[data-video-id]'):
  v=t['data-video-id']
  if re.fullmatch(r'[\w-]{11}',v):
   a=s.new_tag('a',href='https://www.youtube.com/watch?v='+v,target='_blank',rel='noopener noreferrer');a.string='Watch the original video on YouTube ↗';a['class']='preservation-video';t.insert_after(a)
 # Promote lazy assets before removing inactive JS attributes.
 for t in s.find_all('img'):
  src=t.get('data-src',t.get('src','')).replace('{width}','1080')
  if 'pixel.' in src or not src or src.startswith('data:image/gif'):t.decompose();continue
  t['src']=src;t['loading']='eager';t['class']=[c for c in t.get('class',[]) if c not in ['lazyload','fade-in']];t['style']=t.get('style','')+';opacity:1;visibility:visible;'
  for k in ['srcset','data-src','data-srcset','sizes']:t.attrs.pop(k,None)
 for t in s.select('[data-bgset]'):
  choices=[v.strip().split()[0] for v in t['data-bgset'].split(',') if v.strip()]
  if choices:
   src=next((v for v in choices if '_1080x' in v),choices[-1]);t['style']=t.get('style','')+";background-image:url('"+src+"');"
  del t['data-bgset']
 for t in s.find_all('a'):
  href=t.get('href','');absolute=urljoin(p['original'],href)
  if href.startswith('#'):continue
  target=linkmap.get(absolute.rstrip('/'))
  if target:t['href']=target;t.attrs.pop('target',None)
  elif urlparse(absolute).netloc in ['specteslacup.com','www.specteslacup.com','tesloco.wordpress.com','tesloco.com','www.tesloco.com'] or href.startswith(('mailto:','tel:','javascript:')) or '/cart' in absolute or 'calendly.com' in absolute:
   t.attrs.pop('href',None);t['aria-disabled']='true';t['title']='Historical link; this destination is not available in the preserved copy.'
  else:t['href']=absolute;t['target']='_blank';t['rel']='noopener noreferrer'
 for t in s.find_all(['img','link']):
  attr='src' if t.name=='img' else 'href'
  if t.get(attr):requests.add((t[attr],p['original']))
 for t in s.select('[style],style'):
  css=t.get('style','') if t.name!='style' else t.get_text()
  for u in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)',css):requests.add((u,p['original']))
 soups.append((p,s))
print('Downloading',len(requests),'asset references',flush=True)
with ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(lambda x:getasset(*x),requests))
cachefile.write_text(json.dumps(cache,indent=2))
# Resolve font/image references inside recovered stylesheets.
for u,r in list(cache.items()):
 if not r.get('local') or r.get('type')!='text/css':continue
 file=site/'public'/r['local'].lstrip('/');css=file.read_text();
 def cssurl(m):
  url=m.group(1).strip(' \"\'');local=getasset(url,u);return 'url("'+(local or 'data:,')+'")'
 css=re.sub(r'url\(([^)]+)\)',cssurl,css);css=re.sub(r'@import\s+[^;]+;','',css);file.write_text(css)
cachefile.write_text(json.dumps(cache,indent=2))
extra='''
html,body{min-width:0!important}body{overflow-wrap:break-word}img{max-width:100%}a[aria-disabled=true]{cursor:default}.preservation-inactive{font:14px/1.5 system-ui!important;border:1px solid #c8c8c8;padding:12px;color:#424242;background:#f2f2f2}.preservation-video{display:block;text-align:center;padding:12px;background:#161616;color:white;font:14px/1.5 system-ui}
.preservation-banner{font:14px/1.5 system-ui!important;padding:12px 20px;background:#173e35;color:#fff;text-align:center}.preservation-banner a{color:white;text-decoration:underline}
.slideshow__slide{opacity:1!important;visibility:visible!important}.slideshow__image{opacity:1!important}.slideshow__button,.slideshow__controls,.slideshow__video,.slideshow__video-play,.slideshow__text-content .icon{display:none!important}.slideshow__text-content{opacity:1!important;visibility:visible!important}.lazyload,.fade-in{opacity:1!important}.feature-row__image{background-size:cover;background-position:center}.site-header__cart,.site-header__search,.site-header__account,.site-header__menu{display:none!important}.drawer{display:none!important}
@media(max-width:749px){.site-header__logo-image{max-width:200px!important}.site-header__logo{max-width:100%!important}.site-header__wrapper{position:relative!important}.slideshow__heading{font-size:26px!important}.slideshow__text-content{max-width:100%!important}.slideshow{height:520px!important}.slideshow__image{height:100%!important;object-fit:cover}.slideshow__text-container{width:100%!important}.custom__item{max-width:100%}.wp-block-columns{flex-wrap:wrap!important}.wp-block-column{flex-basis:100%!important}}
'''
for p,s in soups:
 for t in list(s.find_all(['img','link'])):
  attr='src' if t.name=='img' else 'href'
  if not t.get(attr):continue
  local=getasset(t[attr],p['original'])
  if local:t[attr]=local
  elif t.name=='img':
   alt=t.get('alt','');replacement=s.new_tag('span');replacement['class']='preservation-inactive';replacement.string=('Image not recovered: '+alt) if alt else 'Original image not recovered';t.replace_with(replacement)
  else:t.decompose()
 for t in s.select('[style],style'):
  css=t.get('style','') if t.name!='style' else t.get_text()
  def repl(m):return 'url("'+(getasset(m.group(1).strip(' \"\''),p['original']) or 'data:,')+'")'
  css=re.sub(r'url\(([^)]+)\)',repl,css)
  if t.name=='style':t.string=css
  else:t['style']=css
 for t in s.find_all():
  for key in list(t.attrs):
   if key.startswith('data-'):del t[key]
 for c in s.find_all(string=lambda t:isinstance(t,Comment)):c.extract()
 if not s.head:s.html.insert(0,s.new_tag('head'))
 meta=s.new_tag('meta',charset='utf-8');s.head.insert(0,meta)
 meta=s.new_tag('meta',attrs={'name':'robots','content':'noindex, nofollow'});s.head.append(meta)
 meta=s.new_tag('meta',attrs={'http-equiv':'Content-Security-Policy','content':"default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; form-action 'none'; base-uri 'none'; frame-src 'none'; script-src 'none'"});s.head.insert(1,meta)
 style=s.new_tag('style');style.string=extra;s.head.append(style)
 banner=s.new_tag('div');banner['class']='preservation-banner';banner.string='Preserved website · '+p['date']+' · Original plans and offers are historical. ';a=s.new_tag('a',href='/'+p['project']+'/',target='_blank',rel='noopener');a.string='Archive guide';banner.append(a);s.body.insert(0,banner)
 dest=root/p['local'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(str(s))
 p['path']='/archives/'+p['local'];p['preserved_sha256']=hashlib.sha256(dest.read_bytes()).hexdigest();records.append(p)
(root/'manifest.json').write_text(json.dumps({'recovered':'2026-09-19','pages':records,'assets':list(cache.values()),'method':'Original public HTML; scripts/trackers removed, forms disabled, assets copied locally; internal navigation rewritten. Capture dates are not content revision dates. Shopify /cdn/shop paths resolved to the store CDN namespace present in the 2022 source. CSS fonts/images recovered where available. No account access or billing changes.'},indent=2))
(site/'src/data/website-archives.json').write_text(json.dumps(records,indent=2))
print('Preserved',len(records),'pages;',sum(bool(v.get('local')) for v in cache.values()),'assets; missing',sum(not v.get('local') for v in cache.values()),flush=True)
for k,v in cache.items():
 if not v.get('local'):print('MISSING',k,v['error'],flush=True)
