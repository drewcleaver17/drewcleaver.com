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
DATA=json.loads((ROOT/'docs/dpc/reference-results.json').read_text())
OUT=ROOT/'public/dpc-deck.pdf'
for name,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Title','DejaVuSerif.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')
W,H=960,540
GREEN='#173E35';INK='#203D34';PAPER='#F7F5EE';MINT='#D5E6BD';MUTED='#5D6962';LINE='#CCD5C7'
c=Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('Direct Primary Care: A Physician-Owned Growth Model')
c.setAuthor('Drew Cleaver')
c.setSubject('Independent concept for expert review. Dated illustrative reference, September 19, 2026. Model dpc-2026-09-v2.')
issues=[];page=0;dark=False
sources={
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

begin('Independent concept by Drew Cleaver','Direct Primary Care',True,'Reference scenario dated September 19, 2026. Web edits do not change this PDF. Model dpc-2026-09-v2.')
text('A Physician-Owned\nGrowth Model',48,190,864,130,40,font='Title')
text('Small practices, protected clinical time and shared nonclinical support',48,350,780,70,23,color='#D7E1D5')
text('For discussion with physicians, operators, advisors and potential investors',48,440,850,30,15,color=MINT)

begin('The investment question','The concept needs proof at the practice\nand support-company levels')
two('Practice proposition','Patients pay for continuity and access. Physicians receive fair compensation, manageable work and a potential path to ownership.','Growth proposition','Shared services must deliver more value than they cost. Repeatable openings and retained practices would support expansion.')
text('Current status: an operating hypothesis and working model. Roles, partners, ownership and funding remain undecided.',48,440,864,45,16,bold=True)

begin('Category and proposed variation','The proposed experience requires\na premium-value test',foot='Sources: AAFP DPC overview and 2024 data brief context; DPC Frontier definition. Reference prices are hypotheses, not local market quotes.')
table(['Established DPC context','This proposal to test'],[
 ['Periodic membership for primary care','Core $200 / Extended $300 per month'],
 ['Care outside traditional insurance billing','Protected time and planned relationship visits'],
 ['Physicians may be employees or owners','One owner and up to two associates'],
 ['Practice structures and services vary','A mentored ownership path and shared support']
],[405,459],rowh=49,size=17)
text('AAFP describes a general $50-$100 monthly range. The proposed $200-$300 needs evidence that its experience is worth the premium.',48,442,864,47,16,bold=True)

begin('Patient demand','Continuity and dependable access\nmust justify the membership')
two('Offer to test','Core: 25 physician minutes in a 30-minute block. Extended: 45 minutes in a 60-minute block. A monthly check-in is optional and guided by need.','Evidence to collect','Interview likely buyers about alternatives and budget. Test paid demand and reasons for staying. Track useful care plans, access and the work between visits.')
text('Extra-visit charges and included services remain design questions. Membership does not replace coverage for hospital or specialist care.',48,430,864,58,16)

begin('Clinical work and capacity','Protected time limits the panel\nthat the schedule can support')
table(['Mature reference schedule','Assumption'],[
 ['Owner / each associate','3 / 5 days per week, 46 weeks per year'],
 ['Working day','9 hours, including 1 hour each for break, urgent care and admin'],
 ['Routine appointments','6 per physician day, subject to available hours'],
 ['Monthly routine demand / capacity','252 / 299 visits at 360 members and 70% attendance']
],[360,504],rowh=52,size=17)
text('The 85% access target allows 363 members under this mix. This arithmetic does not establish a clinically safe panel or complete after-hours coverage.',48,447,864,44,16)

begin('Physician ownership','A credible ownership path needs\nclear readiness and financing terms',True)
two('Proposed progression','Join a physician-led practice. Develop relationships and operating skills. Qualify through care quality and business readiness. Explore ownership of a new or existing location.','Unresolved terms','Buy-in valuation, funding, transition coverage, governance, exit rights and succession. The 18-36 month window is a planning hypothesis, not a promised promotion.')
text('Drew developed the concept. Future founder roles, ownership percentages and compensation remain open.',48,443,864,40,16,bold=True,color=MINT)

begin('Mature practice economics','The reference practice earns $78,000\nafter physician pay and platform fees')
table(['Annual economics at 360 members','USD'],[
 ['Membership revenue at $275 blended monthly dues','$1,188,000'],
 ['Physician cash pay and employment costs','($840,000)'],
 ['Local nonphysician operating costs','($210,000)'],
 ['Support-company fee','($60,000)'],
 ['Operating surplus / margin','$78,000 / 6.6%']
],[660,204],rowh=43,size=17)
text('Before depreciation, financing costs and tax. Startup spending and the support company’s own costs remain separate.',48,453,864,38,15)

begin('The binding trade-off','The margin target requires more members\nthan the reference access target allows')
table(['Enrollment threshold','Members'],[
 ['Break-even at the reference price and costs','337'],
 ['Maximum within the 85% utilization target','363'],
 ['Required for a 15% operating margin','396']
],[660,204],rowh=52,size=19)
text('The gap requires a better price, cost or capacity combination. Filling more appointments alone would compromise the selected access target.',48,412,864,64,21,bold=True)

begin('Launch assumptions','The opening plan adds physicians\nas enrollment grows')
table(['Timing input','Illustrative reference'],[
 ['Planning horizon / care begins','36 months / month 2'],
 ['Initial / subsequent gross enrollments','30 at opening / 25 per following month'],
 ['Monthly attrition / mature enrollment target','1% / 360 members'],
 ['Owner / first associate / second associate','Months 2 / 5 / 11'],
 ['Local costs and platform fee','Full monthly run rate from month 1']
],[490,374],rowh=45,size=17)
text('Hiring dates are independent inputs. The tool flags any period when enrollment outruns routine capacity.',48,463,864,30,14)

begin('Launch result','Monthly break-even arrives before\nthe opening losses are recovered')
curve=DATA['operatingCurve'];peak=min(curve,key=lambda r:r['cumulative'])
# A precise data chart in searchable PDF vector output, derived from the model.
x0,y0,cw,ch=73,195,500,230;lo=-320000;hi=0
for val in [0,-100000,-200000,-300000]:
 yy=H-(y0+(hi-val)/(hi-lo)*ch);c.setStrokeColor(HexColor(LINE));c.line(x0,yy,x0+cw,yy)
 text('$0' if val==0 else f'-${abs(val)//1000}k',x0-27,H-yy-6,62,20,10,color=MUTED)
p=c.beginPath()
for i,row in enumerate(curve):
 x=x0+(row['month']-1)/35*cw;y=H-(y0+(hi-row['cumulative'])/(hi-lo)*ch)
 (p.moveTo if i==0 else p.lineTo)(x,y)
c.setStrokeColor(HexColor('#235C48'));c.setLineWidth(2.5);c.drawPath(p)
for m in [1,12,24,36]:text(str(m),x0+(m-1)/35*cw-6,435,45,20,11,color=MUTED)
text('Planning month',252,456,200,22,12,color=MUTED)
text('Cumulative operating cash before startup spending',48,171,570,25,13,bold=True)
text('Month 16',635,188,277,43,29,bold=True);text('First operating break-even that holds through month 36',635,234,277,70,17)
text(money(peak['cumulative']),635,320,277,43,29,bold=True);text('Peak operating cash deficit in month 15. Still about $161,000 below zero at month 36.',635,366,277,96,17)

begin('Funding and cash timing','The total opening funding requirement\nremains incomplete')
two('Known in the illustration','The enrollment ramp and recurring costs create an operating funding requirement near $296,000 before setup costs, reserves or financing. This is a lower bound for this scenario.','Still required','Equipment, deposits and setup quotes. Opening cash. A target reserve. Financing terms and repayment timing. These inputs remain blank or explicitly zero until supplied.')
text('Startup spending occurs once. Opening cash and financing are sources. A reserve is a target balance, not another expense.',48,442,864,43,16,bold=True)

begin('Prepayment sensitivity','Annual payment changes cash timing\nand can sharply reduce earned margin')
table(['Mature reference case','Annual surplus','Margin'],[
 ['All monthly payments','$78,000','6.6%'],
 ['25% prepay with a 20% discount','$18,600','1.6%'],
 ['All prepay with a 20% discount','-$159,600','-16.8%']
],[540,180,144],rowh=51,size=18)
text('The launch model collects annual dues on joining and renewal, earns them monthly, and refunds unused months after cancellation. Unearned dues remain an obligation.',48,408,864,73,19)

begin('Shared nonclinical support','Practices must receive measurable value\nfor the proposed service fee',True)
two('Proposed services','Administrative workflows, scheduling systems, vendor coordination, recruiting support, operating reports and practice-owner development. Service scope and delivery costs require quotes.','Practice value test','Measure hours saved, service reliability and opening effort. Compare the fee with a realistic independent alternative. Practices retain clinical judgment, care quality and patient relationships.')
text('Reference fee: $5,000 per location per month. No assumed clinical control, finalized contract or legal safe harbor.',48,440,864,47,16,color=MINT)

begin('Network economics','Practice sales and support-company\nrevenue belong to different businesses')
table(['Equally mature locations','Practice revenue / year','Platform revenue / year'],[
 ['1','$1.188 million','$60,000'],['25','$29.7 million','$1.5 million'],['100','$118.8 million','$6.0 million']
],[230,317,317],rowh=52,size=17)
text('Platform surplus = service fees minus delivery costs and central overhead. Both cost inputs remain unknown. Combined surplus eliminates the fee transfer.',48,397,864,77,20)

begin('Capital and governance','An investable support company needs\nproven earnings and enforceable boundaries')
two('Possible sources of return','Physician owners could earn practice distributions after obligations. Support-company investors could earn returns from its independently validated profits and value. No investor return or exit multiple is assumed.','Decisions before financing','Who founds and owns each business? What does the fee buy? Who funds new locations? What clinical boundaries and exit rights apply? What capital type fits the cash profile?')

begin('Validation sequence','Evidence should determine the next\ncommitment')
table(['Hypothesis','Evidence and reviewer','Decision informed'],[
 ['Patients value the offering','Paid demand and retention; patients and DPC operator','Price and included care'],
 ['The work fits the schedule','Time study incl. messages; physician lead','Panel, staffing and access'],
 ['Physicians want the pathway','Recruiting interviews and terms; physician operators','Compensation and ownership'],
 ['Support justifies its fee','Costed service trial; practice operator','Fee and platform scope'],
 ['Launch cash and structure work','Quotes and scenarios; finance and healthcare counsel','Funded pilot, then expansion']
],[236,365,263],rowh=49,size=16)

begin('Decision gates and open issues','A pilot can narrow the uncertainty\nbefore network expansion')
two('Proposed gates to test','Observe 25 opt-in members for 90 days each. Test 90% retention, agreed care plans and routine replies within the selected coverage target. Keep routine utilization at or below 85%.','Conditions still unresolved','Define the actual offering and response promise. Fund the launch. Validate physician terms. Meet a sustainable margin and access target together, then observe stable performance before another site.')
text('Tax treatment, membership terms, clinical ownership and possible franchise obligations require current specialist review. The concept makes no eligibility or outcome promises.',48,431,864,57,15)

begin('Sources and review invitation','The next version should reflect\nexpert criticism and better inputs',foot='Sources accessed September 19, 2026. The TMA paper is dated 2016 and supplies background, not a current legal opinion. No affiliated practice or committed participant.')
items=[('AAFP: category, career options and general pricing context','AAFP'),('DPC Frontier: category definition','DPC Frontier'),('IRS Notice 2026-5: distinct HSA contribution and reimbursement rules','IRS Notice 2026-5'),('Texas Medical Association: clinical independence background','Texas Medical Association'),('FTC: franchise-rule guidance','FTC'),('Editable comparison, assumptions, notes and export','Working model')]
for i,(label,key) in enumerate(items):linked(label,sources[key],48,181+i*42)
text('Prepared by Drew Cleaver. Founder roles, ownership, compensation and partnerships remain undecided.',48,451,864,38,15)
c.save()
reader=PdfReader(OUT)
print(json.dumps({'file':str(OUT),'pages':len(reader.pages),'bytes':OUT.stat().st_size,'fit_issues':issues,'links':sum(len(p.get('/Annots',[])) for p in reader.pages)}))
if issues:raise SystemExit('Resolve text fit issues before release')
