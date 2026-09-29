M=DATA['mature'];L=DATA['launch'];REV=DATA['revision']['pdfRevision'];STAMP=DATA['centralTimestamp']
begin('Independent concept by Drew Cleaver','Direct Primary Care',True,f'{REV}. Finalized {STAMP}. Review only; not published.')
text('Continuity with your physician.\nSeven-day access to the team.',48,191,864,125,34,font='Title')
text('One owner, two associates, assigned routine panels\nand protected short-notice appointments.',48,350,850,75,23)
text('An operating hypothesis for physician and investor review.',48,443,864,27,17)

begin('The premium proposition','Relationships and access\nare complementary promises')
two('Assigned continuity','One included routine visit each month, with the member\'s assigned physician on any of that doctor\'s clinic days. The concept encourages a regular relationship and community habit.','Team access','Additional, short-notice and semi-urgent needs can be seen by another scheduled team doctor. Seven-day coverage does not mean every doctor is available every day.')
text('No practice endorsement, agreed physician participation, measured outcomes or paid demand is implied.',48,442,864,44,15,bold=True)

begin('Authoritative roster','Consecutive days off.\nIntentional Tuesday-Thursday overlap.')
table(['Role','Sun','Mon','Tue','Wed','Thu','Fri','Sat'],[[r['name']]+['On' if on else 'Off' for on in r['weekdays']] for r in M['roster']['roles']]+[['Onsite total']+[str(d['physicians']) for d in M['roster']['daily']]],[220,92,92,92,92,92,92,92],rowh=42,size=16)
text('No on-call obligation on days off. Collaboration and mentoring require protected time when scheduled; the overlap is not free teaching capacity.',48,414,864,67,18)

begin('Time budget','Protect access before routine booking')
table(['Illustrative clinic day','Owner','Each associate'],[['Onsite / available','10 a.m.-7 p.m.','9 a.m.-6 p.m.'],['Routine window','10 a.m.-5 p.m.','9 a.m.-6 p.m.'],['Break / admin / reserve','1 / 1 / 1 hours','1 / 1 / 1 hours'],['Routine inventory / total ceiling','6 / 7 encounters','9 / 12 encounters'],['Working weeks / unscheduled leave','46 / 6','46 / 6']],[414,225,225],rowh=45,size=16)
text('No late-evening service is assumed. Owner reserve 5-6 and admin 6-7 sit outside routine bookings. Additional mentoring reduces routine inventory.',48,458,864,35,13)

begin('What changed','R09 corrects the care policy,\nnot just the calendar')
table(['Revision','Members','Revenue','Surplus'],[['R07 published','360','$1,263,600','$286,080'],['R08 draft','247','$866,970','-$39,030'],['R09 review','345',money(M['revenue']),money(M['surplus'])]],[294,130,220,220],rowh=48,size=18)
text('R08 fixed weekday pooled demand did not match the intended policy. R09 uses assigned panels and 100% attendance, with protected reserve separate from routine scheduling. This is not an isolated roster comparison.',48,394,864,85,18)

begin('Entitlement and attendance','Budget the intended monthly habit')
table(['Assumption','Selected base'],[['Included routine entitlement','One visit per member per month'],['Completed routine attendance','100%; 70% shown separately'],['Core / Extended routine block','25 / 45 minutes'],['Long-visit share / average block','75% / 40 minutes'],['Replacement onboarding / monthly attrition','45 minutes / 1%']],[564,300],rowh=44,size=16)
text('Attendance, visit mix, no-shows and patient preference are assumptions, not measured utilization. Onboarding is additional work, with no invented fee.',48,457,864,35,13)

begin('Assigned panels','345 supported members\nat 100% monthly attendance')
table(['Physician','Raw slots/mo','Panel limit','Assigned'],[[p['name'],f"{p['routineMonthly']:g}",str(p['panelLimit']),str(p['members'])] for p in M['panels']],[324,180,180,180],rowh=53,size=18)
text('360 requested; 345 modeled. Starting allocation: 16.7% owner and 41.7% each associate. Whole-person rounding yields 57 / 144 / 144. These are planning allocations, not observed preferences.',48,417,864,67,17)

begin('Weekly access','Held time is not a completed encounter')
table(['Day','Doctors','Held','Expected','Unused hrs','Excess'],[[d['day'],str(d['physicians']),f"{d['reservedEncounters']:.2f}",f"{d['expectedCompleted']:.2f}",f"{d['unusedReserveMinutes']/60:.2f}",f"{d['excessEncounters']:.2f}"] for d in M['demand']['daily']],[210,105,130,145,145,129],rowh=34,size=15)
text('Monthly totals by weekday, averaged over 46 working weeks. Base: five requests per 100 members/month, 60-minute blocks, double weekday weight.',48,465,864,25,11)

begin('Scheduling limits','Annual averages cannot prove\nsame-day or next-day service')
two('What the model tests','Assigned routine panels, weekday workload, protected reserve, encounter ceilings, onboarding, uneven preferences, working weeks, staffing stages and off-day escalation conflicts.','What operations must prove','Arrival timing, acuity, no-shows, cancellations, appointment choice, dated leave, documentation burden and actual response performance. Sunday, Monday, Friday and Saturday have one doctor.')
text('15% routine scheduling buffer is applied once. Reserve is held separately. Relief dollars do not create a substitute schedule.',48,448,864,42,15,bold=True)

begin('Membership economics','Keep pricing and payment terms explicit')
table(['Tier','Monthly','Annual upfront'],[['Core / 25-minute routine','$250','$2,400'],['Extended / 45-minute routine','$350','$3,360']],[424,220,220],rowh=58,size=19)
text('20% annual discount. At 25% Core / 75% Extended and 50% annual take-up, earned dues average $292.50/member/month.',48,379,864,53,19)
text('Short-notice inclusion versus existing extra-visit charges is unresolved. Base short-notice revenue: $0. Separately entered paid visits consume reserve and must be distinct encounters.',48,445,864,42,14)

begin('Mature reconciliation','Earned revenue funds the practice')
table(['Annual base economics','USD'],[['345 members x $292.50 x 12',money(M['revenue'])],['Base costs including coverage allowances',money(M['costsBeforeIncentives'])],['Bonus employer-cost pool',money(M['incentiveCost'])],['Total expenses',money(M['costs'])],['Operating surplus / margin',money(M['surplus'])+f" / {M['margin']:.1f}%"]],[604,260],rowh=43,size=17)
text(f"Break-even: {M['breakEvenMembers']} members. 15% target margin: {M['targetMembers']}. Before tax, debt and startup recovery; paid enrollment remains unproven.",48,455,864,38,14)

begin('Compensation','Existing salaries remain the starting case')
table(['Compensation / expense assumption','USD per year'],[['Owner base / each associate base','$180,000 / $150,000'],['Gross bonus per associate',money(M['bonusPerAssociate'])],['Total cash per associate',money(150000+M['bonusPerAssociate'])],['Employer burden on all gross bonuses',money(M['incentiveBurden'])],['Provisional additional coverage allowances','$60,000']],[624,240],rowh=43,size=17)
text('20% of positive membership-funded surplus, inclusive of employer bonus costs; $0 hurdle, full quality award. Not agreed terms. No product or prescribing commission.',48,455,864,36,13)

begin('Sensitivity','Show the downside as clearly\nas the target case')
table(['Case','Members','Revenue','Surplus'],[[label,str(x['mature']['modeledMembers']),money(x['mature']['revenue']),money(x['mature']['surplus'])] for label,x in zip(['250; all annual pay','Base; 100% attendance','360; 70% attendance','40% owner-panel demand'],DATA['cases'])],[330,110,212,212],rowh=50,size=17)
text('Upside depends on lower attendance and paid demand. Owner-heavy allocation holds unused associate capacity instead of silently switching routine physicians.',48,450,864,40,15)

begin('Annual payment','Upfront cash is not operating profit')
table(['Annual-pay share','Earned revenue','Bonus / associate','Surplus'],[[str(x['share'])+'%',money(x['mature']['revenue']),money(x['mature']['bonusPerAssociate']),money(x['mature']['surplus'])] for x in DATA['annualPaymentSensitivities']],[180,228,228,228],rowh=53,size=16)
text('Cash is collected at joining and renewal; revenue is earned monthly. Cancellations refund unused prepaid months in this model. Deferred dues remain a service/refund obligation; final contract terms are unresolved.',48,411,864,73,18)

begin('Launch continuity','Grow each panel without\nassuming reassignment')
table(['Launch assumption','Reference'],[['Owner / A / B start','Months 2 / 5 / 11'],['Opening / monthly later applicants','30 / 25'],['Opening admitted / waiting','5 / 25'],['Panel weights','16.7% / 41.7% / 41.7%'],['End of month 36',f"{L['endMembers']:.0f} members"]],[524,340],rowh=43,size=17)
text('Applicants wait for their assigned doctor. Joining doctors do not take an existing panel. Limited staffed-day launch access requires patient acceptance.',48,455,864,36,14)

begin('Launch economics','Operating recovery and funding\nare different questions')
table(['36-month result','Reference'],[['Cumulative operating result',money(L['totalOperatingResult'])],['Sustained monthly break-even',f"Month {L['operatingBreakEvenMonth']}"],['Cumulative operating-loss recovery',f"Month {L['operatingLossRecoveryMonth']}"],['Startup / opening cash / reserve','Unknown'],['Complete funding requirement','Unknown']],[604,260],rowh=43,size=17)
text('Funding and upfront annual receipts are not earnings. Cash timing, startup spending, debt, financing and reserves remain separately visible in the worksheet.',48,455,864,36,14)

begin('Optional staffing','A junior is a separate scenario')
table(['Roster','Supported','Modeled','Surplus'],[[label,str(x['requested']['safeMembers']),str(x['requested']['modeledMembers']),money(x['requested']['surplus'])] for label,x in zip(['Owner + two associates','Add Fri-Mon junior'],DATA['scheduleComparisons'])],[354,150,150,210],rowh=62,size=17)
text('Junior: $150,000 plus employer burden. Additional rooms and support are uncosted. Its proposed panel is a scenario, not consent to reassign existing members. Incremental demand must justify the hire.',48,405,864,78,18)

begin('Growth conditions','Validate one practice\nbefore expanding')
two('Physician evidence','Recruitment acceptance, actual daily workload, protected mentoring, leave coverage, quality, continuity and compensation terms. Ownership and leadership progression require funded clinical time reductions.','Commercial evidence','Paid willingness to buy the premium offer, assigned-panel preferences, attendance, retention, collections and costed support. Improved outcomes and retention are hypotheses, not claims.')
text('Shared support fee remains $5,000/location/month. Platform delivery costs and central overhead remain unknown. No ancillary revenue or investor return is invented.',48,444,864,42,14)

begin('Independent review','Scope, payment and legal terms\nstill require expert decisions')
two('Membership terms','Define which additional encounters are included, whether existing extra-visit charges apply, cancellation/refund details, actual response terms and launch access. No unlimited included visits are promised.','Clinical and ownership scope','No expanded services or physician commitments. Existing optional-care discussion does not add base revenue. Ownership, clinical boundaries, fee arrangements and tax treatment need qualified review.')
linked('Category context: AAFP',sources['AAFP'],48,446,400)
linked('DPC definition: DPC Frontier',sources['DPC Frontier'],510,446,402)

begin('R09 review only','A reproducible reference,\nwith earlier work preserved')
text('Page, calculator and both PDF paths use the same R09 reference snapshot. Existing saved worksheets keep their names, inputs, notes, feedback and historical engines. Start R09 explicitly to retain the current worksheet and open the revised care model.',48,186,864,114,21)
text('R07 is published. R08 was a roster-only review; R09 supersedes it within draft PR #56. Neither review is counted as a published release. No deployment is authorized by this document.',48,325,864,87,20)
linked('Review PR #56', 'https://github.com/drewcleaver17/drewcleaver.com/pull/56',48,445,400)
linked('Current published page (R07)',sources['Working model'],510,445,402)
c.save()
