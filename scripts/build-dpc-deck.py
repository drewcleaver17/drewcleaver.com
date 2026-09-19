"""Build the dated DPC reference deck from the checked model export. PDF only."""
import json, html
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'docs/dpc/reference-results-r05.json').read_text())
OUT=ROOT/'public/dpc-deck.pdf'
for name,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Title','DejaVuSerif.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')
W,H=960,540
GREEN='#173E35';INK='#203D34';PAPER='#F7F5EE';MINT='#D5E6BD';MUTED='#5D6962';LINE='#CCD5C7'
c=Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('Direct Primary Care: A Physician-Owned Growth Model')
c.setAuthor('Drew Cleaver')
c.setSubject('Independent reference scenario. '+DATA['revision']['pdfRevision']+'. '+DATA['centralTimestamp']+'. Model dpc-2026-09-v4.')
issues=[];page=0;dark=False
sources={
 'AMA':'https://www.ama-assn.org/practice-management/physician-health/doctors-work-fewer-hours-ehr-still-follows-them-home',
 'AAFP':'https://www.aafp.org/practice-operations/practice-and-payment-models/direct-primary-care',
 'DPC Frontier':'https://www.dpcfrontier.com/defined',
 'IRS Notice 2026-5':'https://www.irs.gov/pub/irs-drop/n-26-05.pdf',
 'Texas Medical Association':'https://www.texmed.org/CPMwhitepaper/',
 'FTC':'https://www.ftc.gov/business-guidance/resources/franchise-rule-compliance-guide',
 'Working model':'https://drewcleaver.com/dpc/'
}
def money(n):return ('-$' if n<0 else '$')+f'{abs(n):,.0f}'
def text(t,x,y,w,h,size=19,bold=False,color=None,font=None):
 st=ParagraphStyle('p',fontName=font or ('Bold' if bold else 'Body'),fontSize=size,leading=size*1.25,textColor=HexColor(color or (PAPER if dark else INK)),spaceBefore=0,spaceAfter=0)
 p=Paragraph(html.escape(t).replace('\n','<br/>'),st);_,ph=p.wrap(w,h)
 if ph>h+1:issues.append((page,t[:65],round(ph,1),h))
 p.drawOn(c,x,H-y-ph)
 return ph

def begin(kicker,title,is_dark=False,foot='Illustrative assumptions for expert review. No practice affiliation, operating data or commitments implied.'):
 global page,dark
 if page:c.showPage()
 page+=1;dark=is_dark
 c.setFillColor(HexColor(GREEN if dark else PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
 c.bookmarkPage('p'+str(page));c.addOutlineEntry(title.replace('\n',' '),'p'+str(page),0)
 text(kicker.upper(),48,27,864,20,10,True,MINT if dark else '#235C48')
 text(title,48,62,864,96,30,font='Title')
 c.setStrokeColor(HexColor('#6E8875' if dark else '#A8B9A0'));c.setLineWidth(.8);c.line(48,H-156,912,H-156)
 text(foot,48,493,823,30,9,color='#D7E1D5' if dark else MUTED)
 text(f'{page:02}',881,500,30,20,10,color=MINT if dark else MUTED)

def two(left_head,left,right_head,right,y=186):
 text(left_head,48,y,402,36,20,True);text(left,48,y+44,402,222,19)
 text(right_head,510,y,402,36,20,True);text(right,510,y+44,402,222,19)

def table(headers,rows,widths,y=181,rowh=47,size=17):
 vals=[headers]+rows;cells=[]
 for ri,row in enumerate(vals):
  cells.append([Paragraph(html.escape(str(v)).replace('\n','<br/>'),ParagraphStyle('cell',fontName='Bold' if ri==0 else 'Body',fontSize=size,leading=size*1.2,textColor=HexColor(PAPER if ri==0 else INK))) for v in row])
 for ri,row in enumerate(cells):
  for ci,cell in enumerate(row):
   _,h=cell.wrap(widths[ci]-20,rowh)
   if h>rowh-10:issues.append((page,f'table {ri},{ci}',round(h,1),rowh-10))
 t=Table(cells,colWidths=widths,rowHeights=[rowh]*len(cells));styles=[('BACKGROUND',(0,0),(-1,0),HexColor(GREEN)),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('LINEBELOW',(0,0),(-1,-1),.45,HexColor(LINE))]
 for i in range(1,len(cells)):
  if i%2==0:styles.append(('BACKGROUND',(0,i),(-1,i),HexColor('#EAF0E3')))
 t.setStyle(TableStyle(styles));_,h=t.wrapOn(c,sum(widths),H);t.drawOn(c,48,H-y-h)

def linked(label,url,x,y,w=830):
 text(label,x,y,w,35,15,bold=True,color='#235C48');c.linkURL(url,(x,H-y-31,x+w,H-y),relative=0,thickness=0)

def source_link(key,offset=0):
 c.linkURL(sources[key],(48+offset*300,12,340+offset*300,44),relative=0,thickness=0)

exec((ROOT/'scripts/dpc-deck-r05-content.py').read_text())
