# Executed by build-dpc-deck.py with the preserved layout helpers.
M=DATA['mature']; L=DATA['launch']; S=DATA['sensitivities']; Z=DATA['zeroCoverage']
STAMP=DATA['centralTimestamp']; REV=DATA['revision']['pdfRevision']

begin('Independent concept by Drew Cleaver','Direct Primary Care',True,f'{REV}. Reference finalized {STAMP}. Web edits do not change this PDF.')
text('A Physician-Owned\nGrowth Model',48,184,864,132,40,font='Title')
text('Staggered associate coverage, protected clinical time\nand a path toward practice ownership',48,348,850,75,23,color='#D7E1D5')
text('An operating hypothesis for physician, operator and investor review',48,439,850,32,16,color=MINT)

begin('The growth hypothesis','Physician development and patient access\nmust support the same business')
two('Local practice','One owner and two associates build continuing relationships. Membership funds care, follow-up and a defined response service.','Ownership pathway','Associates learn operations, mentor successors and may pursue ownership. Shared support must make practices easier to run at a fee they value.')
text('The revised roster is a proposal to test. No recruiting interest, clinical outcomes, partnerships or funding commitments are assumed.',48,428,864,57,17,bold=True)

begin('Category and patient value','The proposed price needs evidence\nof a better patient experience',foot='Source: AAFP DPC overview and its 2024 data context. DPC Frontier definition. Proposed prices and service intensity are hypotheses.')
table(['Established DPC category','Proposed variation'],[
 ['Periodic fees outside insurance billing','Core $200 / Extended $300 each month'],
 ['Longer relationships and access','A staggered seven-day associate roster'],
 ['Employment and ownership options','A mentored associate-to-owner pathway'],
 ['Different local practice structures','Shared nonclinical support for a stated fee']
],[410,454],rowh=48,size=17)
text('AAFP gives general $50-$100 monthly pricing context. Willingness to pay for this $200-$300 offering remains unproven.',48,435,864,52,18,bold=True)
source_link('AAFP');source_link('DPC Frontier',1)

begin('Proposed weekly roster','Ten associate workdays cover seven days\nbefore leave or absences')
table(['Role','Sun','Mon','Tue','Wed','Thu','Fri','Sat'],[
 ['Associate A','9-9','9-9','9-9','9-9','9-9','Off','Off'],
 ['Associate B','Off','Off','9-9','9-9','9-9','9-9','9-9'],
 ['Owner*','Off','9-6','Off','9-6','Off','9-6','Off']
],[220,92,92,92,92,92,92,92],rowh=53,size=16)
text('9-9 means 9 a.m.-9 p.m. availability. Routine bookings end earlier. Each associate has a 12-encounter daily ceiling.',48,410,864,48,18,bold=True)
text('*Owner Monday/Wednesday/Friday is illustrative. All roles use 46 working weeks. Six weeks of absence per role still need relief and escalation coverage.',48,461,864,30,11)

begin('The daily time budget','A twelve-hour window does not provide\ntwelve one-hour routine bookings')
table(['Associate day, illustrative','Hours / capacity'],[
 ['Outer availability, 9 a.m.-9 p.m.','12 hours'],
 ['Routine booking window, 9 a.m.-6 p.m.','9 hours'],
 ['Breaks / messages / urgent reserve','1 hour each'],
 ['Time left for routine appointments','6 hours'],
 ['Routine capacity: all 60-minute / reference mix','6 / 6.86 visits per day']
],[630,234],rowh=43,size=17)
text('The 12 ceiling includes urgent and onboarding encounters. Three late hours remain response availability; onsite/remote arrangements are undecided.',48,451,864,40,15)

begin('Capacity and demand','Weekday bottlenecks constrain enrollment\nbefore the monthly average does')
table(['Reference comparison','Earlier model','Revised roster'],[
 ['Routine capacity / month','299',f"{M['routineCapacity']:.1f}"],
 ['Members within selected access target','363',str(M['safeMembers'])],
 ['Demand check','Monthly average','Daily weights + onboarding'],
 ['Requested mature members','360','360']
],[450,207,207],rowh=51,size=17)
text('325 is an arithmetic planning limit, not a clinically validated panel. It includes 70% routine attendance, 85% utilization and replacement-member onboarding.',48,433,864,49,17,bold=True)

begin('Mature practice economics','The revised constrained case falls short\nbefore added coverage costs')
table([f"Annual economics at {M['modeledMembers']} members",'USD'],[
 ['Membership revenue at $275 blended monthly dues',money(M['revenue'])],
 ['Physician pay plus employment costs','($840,000)'],
 ['Existing local costs and platform fee','($270,000)'],
 ['Result before four coverage increments',money(M['surplusBeforeCoverage'])],
 ['Evening/weekend support, relief, recruiting, extra operations','Unknown'],
 ['Final operating result','Incomplete']
],[654,210],rowh=40,size=16)
text('Existing cost assumptions total $1.11m annually. Added costs need quotes. Salary is independent of days and hours. Before tax, depreciation and financing.',48,467,864,26,11)

begin('Sensitivity, not a recommendation','Booking windows and demand patterns\nchange the enrollment limit')
table(['One change from the revised reference','Members within target'],[
 ['6 p.m. cutoff and reference weekday weights','325'],
 ['Associates finish routine appointments at 7 p.m.',str(S['laterCutoff']['mature']['safeMembers'])],
 ['30-minute blocks with 25 physician minutes',str(S['shorterBlocks']['mature']['safeMembers'])],
 ['Equal demand across all seven weekdays',str(S['equalWeekdayDemand']['mature']['safeMembers'])]
],[650,214],rowh=51,size=17)
text('Shorter blocks change the offering and require clinical review. At unchanged 360 enrollment, the old $78,000 surplus remains only before new costs and ignores the revised access conflict.',48,432,864,58,16,bold=True)

begin('Launch and enrollment','Admissions follow available care\nas the team comes together')
table(['Planning input','Illustrative reference'],[
 ['Horizon / care opens','36 months / month 2'],
 ['Opening applicants / later gross applicants','30 / 25 each month'],
 ['Attrition / enrollment ceiling','1% per month / 360'],
 ['Owner / Associate A / Associate B starts','Months 2 / 5 / 11'],
 ['Actual modeled admission at opening',f"{L['rows'][1]['newMembers']:.1f} expected members"]
],[570,294],rowh=43,size=17)
text('Before full staffing, the reference offers staffed-day access only. Unadmitted applicants wait without generating revenue. Their willingness to wait is unproven.',48,452,864,38,15)

begin('Launch cash requirements','The funding requirement stays incomplete\nuntil coverage and setup are costed')
text('Diagnostic: cumulative operating result',48,177,500,32,18,bold=True)
curve=[r['cumulativeOperating'] for r in Z['launch']['rows']]
for amount in [0,-250000,-500000]:
 y=224+(-amount)/500000*172
 c.setStrokeColor(HexColor(LINE));c.setLineWidth(.7);c.line(115,H-y,550,H-y)
 text('$0' if amount==0 else f'-${abs(amount)//1000}k',48,y-7,60,20,11)
c.setStrokeColor(HexColor('#235C48'));c.setLineWidth(2.5)
path=c.beginPath()
for i,value in enumerate(curve):
 x=115+i/35*435;y=224+(-value)/500000*172
 if i==0:path.moveTo(x,H-y)
 else:path.lineTo(x,H-y)
c.drawPath(path)
for month in [1,12,24,36]:text(str(month),107+(month-1)/35*435,411,35,18,11)
text('Planning month',280,434,150,22,11)
text(money(Z['launch']['totalOperatingResult']),590,188,320,48,30,bold=True)
text('36-month loss with all four coverage increments set to zero. Sustained monthly break-even is not reached.',590,244,320,112,18)
text('Coverage quotes, startup spending, opening cash and a reserve remain unknown.',590,371,320,82,17)
text('This lower-cost sensitivity excludes startup spending, debt and financing. It is not a complete funding ask.',48,467,864,26,12,bold=True)

begin('Cash timing','Annual prepayments create an obligation\nwhile revenue is earned over time')
table(['Flow','Treatment'],[
 ['Annual payment at joining / renewal','Cash arrives immediately; revenue is earned monthly'],
 ['Cancellation','Unused prepaid months refunded in this illustration'],
 ['Startup spending','One cash outflow, separate from recurring costs'],
 ['Opening cash / financing / reserve','Funding sources / funding source / target balance']
],[365,499],rowh=52,size=17)
text('Operating break-even, accumulated operating-loss recovery and startup investment recovery are different milestones. Financing is never operating revenue.',48,450,864,39,15)

begin('Physician development','Leadership time needs a funded\nreduction in clinical capacity',True)
two('Proposed progression','Build patient relationships and operating judgment. Take on management and mentoring. Reduce appointments as agreed. Pursue ownership only with readiness, financing and continuity in place.','Modeled example',f"Associate A adds two management hours per working day from month 24, with unchanged pay. At that roster snapshot, the reference enrollment limit falls from 325 to {S['leadership']['mature']['safeMembers']} members.")
text('The example is optional, not a promised timeline. Longer availability does not itself prove faster clinical development or readiness to lead.',48,432,864,52,17,bold=True,color=MINT)

begin('Succession and continuity','A replacement adds expense before\na departing physician can leave')
two('Model the overlap','Enter a replacement start month, salary, working days and reduced initial availability. Deduct mentoring time from the trainer. A fourth paid physician during overlap is shown explicitly.','Protect the handoff','A departure removes that physician from this location. Retained members do not automatically transfer. If physical capacity falls short, the constrained cash forecast becomes incomplete.')
text('A second location needs its own demand, startup and financing plan. Its earnings are not included in this one-location launch forecast.',48,435,864,50,17,bold=True)

begin('Shared nonclinical support','Support-company fees must buy\nmeasurable value for practices')
table(['Equally mature locations','Practice revenue / year','Platform fees / year'],[
 ['1',money(M['revenue']),'$60,000'],
 ['25',money(M['revenue']*25),'$1,500,000'],
 ['100',money(M['revenue']*100),'$6,000,000']
],[230,317,317],rowh=52,size=17)
text('Fees could fund scheduling systems, recruiting support, vendor coordination, reporting and owner development. Delivery costs and central overhead remain unknown.',48,408,864,50,17)
text('Combined economics eliminate the internal fee transfer. Clinical authority stays with physicians. No investor return or exit multiple is assumed.',48,462,864,30,12)

begin('Validation before expansion','A small set of tests determines\nwhether the concept deserves capital')
table(['Hypothesis','Evidence / reviewer','Decision informed'],[
 ['Patients pay and stay','Paid demand and retention; patients + DPC operator','Price and included services'],
 ['Work fits the roster','Visits, messages, urgent work, leave; physician lead','Panel, cutoff and coverage'],
 ['Associates want the pathway','Recruiting discussions and terms; physicians','Pay, progression and ownership'],
 ['Shared support earns its fee','Costed service trial; practice operators','Platform scope and margin'],
 ['Launch can fund obligations','Quotes and cash scenarios; finance advisor','Funded pilot, then expansion']
],[220,402,242],rowh=49,size=15)

begin('Ownership and boundaries','Practice cash flow and platform earnings\nare separate potential returns',True)
two('Possible economic relationship','Physicians own and control clinical practices. Practices pay for agreed nonclinical services. A support company could be an investment vehicle if its contracts and earnings validate the case.','Decisions still open','Drew may build the support company or help a physician-led founding team. Founder roles, ownership percentages, buy-in terms, compensation and partnerships remain undecided.')
text('Current legal and tax review must address clinical authority, service agreements, franchise questions and membership terms. No finalized structure or investment offering.',48,428,864,57,16,color=MINT)

begin('A working proposal with a record','R05 preserves earlier inputs\nand makes the new assumptions editable')
two('Review workflow','One open worksheet. Separate physician schedules and leadership stages. Add missing rows, leave unknowns blank, save locally and export a review file. Nothing is automatically sent.','Revision lineage','R01: initial concept and PDF. R02: comparison tool and green design. R03: independent DPC and launch model. R04: one worksheet. R05: staffing, progression and daily constraints.')
text(f'{REV} / model dpc-2026-09-v4 / saved-file schema 4.\nReference finalized {STAMP}. The web history links to release evidence.',48,421,864,65,15,bold=True)

begin('Sources and next decisions','Expert criticism should resolve\ncoverage, economics and readiness')
items=[('AAFP: DPC category, career options and price context','AAFP'),('DPC Frontier: category definition','DPC Frontier'),('AMA: clinical and administrative work extend beyond appointments','AMA'),('IRS: distinct HSA contribution and reimbursement rules','IRS Notice 2026-5'),('Texas Medical Association: clinical-independence background','Texas Medical Association'),('FTC: Franchise Rule guidance','FTC'),('Interactive model, full sources and revision history','Working model')]
for i,(label,key) in enumerate(items):linked(label,sources[key],48,177+i*35)
text('Priority decisions: routine cutoff and response terms; coverage cost; patient-value evidence; ownership and succession terms.',48,435,864,50,17,bold=True)
c.save()
reader=PdfReader(OUT)
print(json.dumps({'file':str(OUT),'pages':len(reader.pages),'bytes':OUT.stat().st_size,'fit_issues':issues,'links':sum(len(p.get('/Annots',[])) for p in reader.pages)}))
if issues:raise SystemExit('Resolve text fit issues before release')
