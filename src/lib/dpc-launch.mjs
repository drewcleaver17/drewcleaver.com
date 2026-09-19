const field = (key,label,value,unit,min,max,help='',nullable=false,step=1) => ({key,label,value,unit,min,max,step,help,nullable});
export const launchGroups = [
  {name:'Launch timing & enrollment',note:'Illustrative new-practice timeline. Month 1 is the first planning month. Members enroll at the beginning of a month. Mature members is the enrollment target, not a clinically approved cap.',fields:[
    field('horizonMonths','Planning horizon',36,'months',24,36),
    field('openingMonth','First month of patient care',2,'month',1,36),
    field('initialMembers','Members joining at opening',30,'members',0,1000000),
    field('monthlyNewMembers','New enrollments per following month',25,'members/month',0,1000000,'Gross additions after attrition, limited by the mature enrollment target.'),
    field('monthlyAttrition','Monthly member attrition',1,'%',0,100,'Applied before the next month’s billing. Annual members receive a modeled pro-rata refund of unused dues.',false,0.1),
    field('ownerStartMonth','Owner compensation starts',2,'month',1,60,'Salary starts here. Patient capacity begins only when the practice is also open.'),
    field('associate1Month','First associate starts',5,'month',1,60,'Used only if the mature physician count includes this associate. After the horizon means not hired in this plan.'),
    field('associate2Month','Second associate starts',11,'month',1,60,'Used only if two associates are selected. Full annual compensation divided by 12 starts in this month.')
  ]},
  {name:'Launch cash & financing',note:'The existing local costs, startup capital, target reserve and annual debt payments feed this view. Enter an explicit zero when a cost or cash source is absent. Monthly timing does not test daily liquidity.',fields:[
    field('costStartMonth','Local costs and platform fee start',1,'month',1,60,'All entered local recurring costs, the fixed employment-cost adjustment and platform fee start together at their full monthly run rate.'),
    field('startupMonth','One-time startup spending month',1,'month',1,60,'Uses the startup capital amount above. Exclude costs already entered as recurring expenses.'),
    field('openingCash','Cash available before month 1',null,'$',0,100000000,'Cash already in the business. Do not include the separate financing draw again.',true,'any'),
    field('financingDraw','One financing draw',0,'$',0,100000000,'Debt or equity cash received once. This is a cash source, not revenue. Investor returns are not calculated.',false,'any'),
    field('financingMonth','Financing received',1,'month',1,60),
    field('debtStartMonth','Entered debt payments start',2,'month',1,60,'Uses annual principal-plus-interest payments divided by 12. No loan amortization or payoff is inferred. Set repayments to match the financing terms.')
  ]}
];

export const launchMetrics = [
  ['endMembers','Members at end of horizon','number'],
  ['totalRevenue','Earned revenue over horizon','money'],
  ['totalOperatingResult','Operating result over horizon','money'],
  ['operatingBreakEvenMonth','Operating break-even through remaining horizon','month'],
  ['cashRecoveryMonth','Cumulative cash recovery through remaining horizon','month'],
  ['grossFundingNeed','Funding need before opening cash, financing and reserve','money'],
  ['additionalFunding','Additional funding to avoid negative month-end cash','money'],
  ['reserveTopUp','Additional funding to maintain the entered reserve','money'],
  ['minCash','Lowest month-end cash balance','money'],
  ['endingCash','Cash at end of horizon','money'],
  ['endingDeferredRevenue','Unearned annual dues at end of horizon','money'],
  ['monthsOverTarget','Months above the selected utilization target','count'],
  ['monthsOverCapacity','Months with more demand than routine capacity','count']
];
export const monthlyColumns = [
  ['month','Month','count'],['members','Members','number'],['newMembers','New','number'],['lostMembers','Left','number'],['physicians','Physicians','count'],
  ['capacity','Routine visit capacity','number'],['demand','Routine visit demand','number'],['utilization','Utilization incl. extras','percent'],
  ['revenue','Earned revenue','money'],['receipts','Net cash receipts','money'],['refunds','Annual-dues refunds','money'],['costs','Operating costs','money'],['operatingResult','Operating result','money'],
  ['debtPayment','Debt payment','money'],['startupSpend','Startup spending','money'],['financing','Financing received','money'],
  ['cashMovement','Net cash movement','money'],['cashBalance','Ending cash','money'],['cumulativeRecovery','Cumulative cash before financing','money'],['deferredRevenue','Unearned dues','money']
];

export function computeLaunch(v, matureCalculator, adjustments = {}) {
  const share = v.prepayShare / 100;
  const blend = v.corePrice * (1-v.extendedMix/100) + v.extendedPrice * v.extendedMix/100;
  const annualMonthlyDues = blend * (1-v.prepayDiscount/100);
  const churn = v.monthlyAttrition / 100;
  const baseLocalCosts = v.support+v.occupancy+v.technology+v.marketing+v.other;
  const extras = v.extraShortVisits*v.extraShortPrice+v.extraLongVisits*v.extraLongPrice+(adjustments.annualRevenue ?? 0)/12;
  const startupKnown = v.startupCapital !== null;
  const cashKnown = startupKnown && v.openingCash !== null;
  let monthlyMembers=0, annualCohorts=[], cumulativeRecovery=0, cashBalance=v.openingCash;
  const rows=[];
  for(let month=1; month<=v.horizonMonths; month++) {
    const open=month>=v.openingMonth;
    const owner=month>=v.ownerStartMonth;
    const associates=Number(v.associates>=1 && month>=v.associate1Month)+Number(v.associates>=2 && month>=v.associate2Month);
    const costsStarted=month>=v.costStartMonth;
    let newMembers=0, lostMembers=0, refunds=0, annualCollections=0;
    if(open) {
      // Cancellation happens at the next monthly boundary. Remaining prepaid service is refunded.
      const monthlyLost=monthlyMembers*churn;
      monthlyMembers-=monthlyLost;
      lostMembers+=monthlyLost;
      for(const cohort of annualCohorts) {
        const lost=cohort.members*churn;
        refunds+=lost*cohort.remaining*annualMonthlyDues;
        cohort.members-=lost;
        lostMembers+=lost;
        if(cohort.remaining===0) {
          annualCollections+=cohort.members*annualMonthlyDues*12;
          cohort.remaining=12;
        }
      }
      const retained=monthlyMembers+annualCohorts.reduce((n,c)=>n+c.members,0);
      newMembers=month===v.openingMonth ? v.initialMembers : Math.min(v.monthlyNewMembers,Math.max(0,v.members-retained));
      monthlyMembers+=newMembers*(1-share);
      if(newMembers*share>0) {
        annualCohorts.push({members:newMembers*share,remaining:12});
        annualCollections+=newMembers*share*annualMonthlyDues*12;
      }
    }
    const annualMembers=annualCohorts.reduce((n,c)=>n+c.members,0);
    const members=monthlyMembers+annualMembers;
    const revenue=monthlyMembers*blend+annualMembers*annualMonthlyDues+(open?extras:0);
    const receipts=monthlyMembers*blend+annualCollections-refunds+(open?extras:0);
    for(const cohort of annualCohorts) if(open) cohort.remaining-=1;
    const deferredRevenue=annualCohorts.reduce((n,c)=>n+c.members*c.remaining*annualMonthlyDues,0);
    const pay=(owner?v.ownerPay:0)+associates*v.associatePay;
    const costs=pay*(1+v.burdenRate/100)/12+(costsStarted?(baseLocalCosts+v.burdenAdjustment)/12+v.platformFee:0);
    const capacityModel=matureCalculator({...v,ownerDays:open&&owner?v.ownerDays:0,associates:open?associates:0,members:0,extraShortVisits:0,extraLongVisits:0});
    const capacity=capacityModel.routineCapacity;
    const block=v.coreBlock*(1-v.extendedMix/100)+v.extendedBlock*v.extendedMix/100;
    const demand=members*v.attendance/100;
    const extraMinutes=open?v.extraShortVisits*v.extraShortMinutes+v.extraLongVisits*v.extraLongMinutes:0;
    const demandMinutes=demand*block+extraMinutes;
    const utilization=capacity>0?demandMinutes/(capacity*block)*100:null;
    const overCapacity=demandMinutes>capacity*block+1e-7;
    const overTarget=demandMinutes>capacity*block*v.maxUtilization/100+1e-7;
    const debtPayment=month>=v.debtStartMonth?v.debtService/12:0;
    const startupSpend=startupKnown?(month===v.startupMonth?v.startupCapital:0):null;
    const financing=month===v.financingMonth?v.financingDraw:0;
    const operatingResult=revenue-costs;
    if(startupKnown) cumulativeRecovery+=receipts-costs-debtPayment-startupSpend;
    const cashMovement=startupKnown?receipts-costs-debtPayment-startupSpend+financing:null;
    if(cashKnown) cashBalance+=cashMovement;
    rows.push({month,members,newMembers,lostMembers,physicians:open?Number(owner)+associates:0,capacity,demand,utilization,overCapacity,overTarget,revenue,receipts,refunds,costs,operatingResult,debtPayment,startupSpend,financing,cashMovement,cashBalance:cashKnown?cashBalance:null,cumulativeRecovery:startupKnown?cumulativeRecovery:null,deferredRevenue});
  }
  const firstSustained = key => {
    const i=rows.findIndex((r,i)=>r.month>=v.openingMonth && r.revenue>0 && r[key]!==null && rows.slice(i).every(x=>x[key]>=-1e-7));
    return i<0?null:rows[i].month;
  };
  const minCash=cashKnown?Math.min(...rows.map(r=>r.cashBalance)):null;
  const warnings=[];
  if(v.startupCapital===null) warnings.push('Startup spending is unknown. Cash movement, recovery and funding needs remain incomplete. Enter an explicit zero only if no startup spending is required.');
  if(v.openingCash===null) warnings.push('Opening cash is unknown. Cash balances and the remaining funding gap are not calculated.');
  if(v.workingCapital===null) warnings.push('The target cash reserve is unknown. Funding need excludes any reserve until you enter one.');
  if(v.initialMembers>v.members) warnings.push('Opening members exceed the mature enrollment target. The model preserves those members and pauses new additions until below target.');
  if(v.openingMonth>v.horizonMonths) warnings.push('The practice does not open within the selected horizon.');
  if(v.ownerStartMonth>v.openingMonth) warnings.push('The owner starts after opening. Review coverage and capacity before enrolling patients.');
  if(v.costStartMonth>v.openingMonth) warnings.push('Local costs begin after patient care. Verify this timing against real contracts.');
  if(v.startupMonth>v.openingMonth && (v.startupCapital??1)>0) warnings.push('Startup spending occurs after opening. Verify that the practice can open before paying these costs.');
  if(v.startupMonth>v.horizonMonths && (v.startupCapital??1)>0) warnings.push('Startup spending falls outside this horizon and is excluded from its cash totals.');
  if(v.financingDraw>0 && v.financingMonth>v.horizonMonths) warnings.push('The financing draw falls outside this horizon and does not fund this plan.');
  if(v.financingDraw>0 && v.debtService===0) warnings.push('The financing draw has no entered debt payments. Identify whether it is equity or add the agreed debt repayment schedule.');
  if(rows.some(r=>r.overCapacity)) warnings.push('Some months promise more routine care than the schedule supports. Revenue assumes delivery. Change enrollment, staffing or the offering before relying on this plan.');
  else if(rows.some(r=>r.overTarget)) warnings.push('Some months exceed the selected access target even though physical routine capacity may remain.');
  if(v.prepayShare>0) warnings.push('Annual receipts arrive at joining and each 12-month renewal. Revenue is earned monthly. Cancellations refund unused prepaid months. Contract terms may differ. Unearned dues remain a service/refund obligation.');
  if(minCash!==null && minCash<0) warnings.push('The modeled cash balance falls below zero. Additional funding is needed before the shortfall.');
  if(v.burdenAdjustment<0) warnings.push('Review the fixed employment-cost adjustment during the staffing ramp. A credit appropriate for the mature team may overstate launch cash.');
  return {rows,warnings,endMembers:rows.at(-1).members,totalRevenue:rows.reduce((n,r)=>n+r.revenue,0),totalOperatingResult:rows.reduce((n,r)=>n+r.operatingResult,0),operatingBreakEvenMonth:firstSustained('operatingResult'),cashRecoveryMonth:startupKnown?firstSustained('cumulativeRecovery'):null,grossFundingNeed:startupKnown?Math.max(0,-Math.min(0,...rows.map(r=>r.cumulativeRecovery))):null,additionalFunding:minCash===null?null:Math.max(0,-minCash),reserveTopUp:minCash===null||v.workingCapital===null?null:Math.max(0,v.workingCapital-minCash),minCash,endingCash:cashKnown?rows.at(-1).cashBalance:null,endingDeferredRevenue:rows.at(-1).deferredRevenue,monthsOverTarget:rows.filter(r=>r.overTarget).length,monthsOverCapacity:rows.filter(r=>r.overCapacity).length};
}
