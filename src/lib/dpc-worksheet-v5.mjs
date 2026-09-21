import * as prior from './dpc-worksheet-v3.mjs';
import * as r05 from './dpc-worksheet-v4.mjs';
import {newStaffing,validateStaffing,rosterCapacity,evaluateDemand,membershipLimit,addedCosts,known,sum,mul,roleFields as priorRoleFields,settingFields,days,newRole as priorNewRole,newStage} from './dpc-staffing.mjs';
export {settingFields,days,newStage};
export const roleFields=priorRoleFields.map(f=>f.key==='annualPay'?{...f,label:'Annual base salary',value:150000,help:'Base salary only. The separate practice profit-share pool includes its own employer burden. Paid from the role start month, including leave.'}:f);
export function newRole(...args){const r=priorNewRole(...args);if(r.kind!=='owner')r.annualPay=150000;return r;}
export const incentiveFields=[
 {key:'poolPercent',label:'Share of eligible operating surplus',unit:'%',min:0,max:100,step:'any',help:'Total employer-cost pool for all eligible associates, including employer burden on bonuses. Trial assumption: 20%.'},
 {key:'annualHurdle',label:'Annual surplus retained before profit sharing',unit:'$/year',min:0,max:1e8,step:'any',help:'Operating-profit hurdle, divided by 12 in the launch. This is not a cash reserve or startup-loss recovery requirement.'},
 {key:'qualityPercent',label:'Portion earned under the quality scorecard',unit:'%',min:0,max:100,step:'any',help:'100% models all agreed conditions achieved; it is not an observed result. Use 0% for no award. No test, prescription or product sales targets.'}
];
function cleanIncentives(raw){if(raw===null)return null;if(!raw||typeof raw!=='object')throw Error('Missing profit-share assumptions.');return Object.fromEntries(incentiveFields.map(f=>{const x=raw[f.key];if(x!==null&&(!known(x)||x<f.min||x>f.max))throw Error('Invalid '+f.label);return [f.key,x];}));}
function incentive(w,revenue,costs,extra,period=1,eligible=1){
 const a=w.staffing?.incentives;
 if(!a||eligible===0||a.poolPercent===0||a.qualityPercent===0)return {loaded:0,cash:0,burden:0,eligibleSurplus:known(revenue)&&known(costs)&&known(extra)?revenue-extra-costs:null};
 if(![revenue,costs,extra,w.values.burdenRate,...incentiveFields.map(f=>a[f.key])].every(known))return {loaded:null,cash:null,burden:null,eligibleSurplus:null};
 const eligibleSurplus=revenue-extra-costs,loaded=Math.max(0,eligibleSurplus-a.annualHurdle*period)*a.poolPercent/100*a.qualityPercent/100,cash=loaded/(1+w.values.burdenRate/100);
 return {loaded,cash,burden:loaded-cash,eligibleSurplus};
}
function eligibleRoles(w,month){return rosterCapacity(w,month).roles.filter(r=>['associate','replacement'].includes(r.kind)&&!r.unknown&&r.weeks>0&&r.weekdays.some(Boolean));}
function requiredMembers(w,costs,extra,netDues,target,eligible){
 if(![costs,extra,netDues,target].every(known)||netDues<=0)return null;
 const a=w.staffing.incentives,q=a&&eligible?a.poolPercent*a.qualityPercent/10000:0,h=a?.annualHurdle??0;
 if(a&&eligible&&!incentiveFields.every(f=>known(a[f.key])))return null;
 const threshold=extra+costs+h,candidates=[0,threshold,costs/(1-target/100),((1-q)*costs-q*(extra+h))/(1-target/100-q)];
 const members=candidates.filter(Number.isFinite).map(rev=>Math.max(0,Math.ceil((rev-extra)/(netDues*12)-1e-9))).sort((a,b)=>a-b);
 for(const n of members){const rev=n*netDues*12+extra,b=incentive(w,rev,costs,extra,1,eligible);if(known(b.loaded)&&rev-costs-b.loaded>=rev*target/100-1e-6)return n;}
 return null;
}
export const MODEL_VERSION='dpc-2026-09-v5';
export const {fields,groups,bases,treatments,blankRow}=prior;
export const reference={...prior.reference,corePrice:250,extendedPrice:350,associatePay:150000,prepayDiscount:20};
export function formatMetric(value,type){return value===null||value===undefined?(type==='month'?'Not reached / incomplete':'Not provided'):prior.formatMetric(value,type);}
export const replacedKeys=new Set(['dailyVisitCap','breakHours','urgentHours','adminHours','ownerDays','ownerHours','ownerWeeks','associates','associateDays','associateHours','associateWeeks','ownerPay','associatePay','ownerStartMonth','associate1Month','associate2Month']);
export const notes=[
 'R06 trial pricing is $250/$350 monthly or $2,400/$3,360 paid yearly. Annual take-up is editable; the default 0% is a monthly-pay baseline, not a predicted take-up rate.',
 'New associates start at $150,000 base salary. A proposed 20% employer-cost pool shares positive membership-funded operating surplus after base payroll, employer burden, support fee and all operating costs. Extra visits and custom ancillary revenue are excluded from this incentive basis; all costs remain deducted. The hurdle and quality-earned percentage are editable.',
 'The pool includes employer burden on bonuses. Gross cash bonuses are split equally across active associate/replacement roles, not by sales or test orders; owner and relief roles are excluded. Launch awards accrue and are paid monthly in this illustration, with the annual hurdle divided by 12. Contract terms, annual true-up, startup-loss recovery and any cash-reserve gate remain to be agreed.',
 'Quality measures should reward timely follow-up, care-plan completion, appropriate testing and patient experience, with case-mix review. No award for refusing complex patients, suppressing incident reporting or increasing product sales. The model assumes scorecard conditions are met; it does not verify them.',
 'R06 uses separate physician rosters. Availability is an outer response window, not booked patient time or measured active work. Salary is independent of hours.',
 'Associate A works Sunday–Thursday and Associate B Tuesday–Saturday by default. Their total encounter ceiling is 12; the owner has a separate ceiling. Routine visits must finish by the booking cutoff. All schedules and utilization rates are illustrative.',
 'Routine capacity respects time and the total encounter cap after reserving urgent encounters. Routine, onboarding, extra and urgent work consume capacity. No-shows consume unreclaimed routine bookings. Owner escalation uses owner urgent reserve once.',
 'Daily demand weights are normalized. Defaults give each weekday twice the weight of Saturday or Sunday. Patients are assumed willing to use available team capacity on those days; continuity and access are unvalidated. Working weeks average absence into capacity but do not schedule leave relief.',
 'Constrained enrollment admits only what daily utilization targets support. Existing members are not automatically transferred when capacity falls. Physical overload makes revenue and cash incomplete; explicitly selected stress mode retains unconstrained amounts.',
 'The launch initially offers access on staffed days and redistributes demand to them, unless seven-day access is selected. Validate that limited offer with patients. Mature coverage still needs absence and owner escalation arrangements.',
 'Additional coverage costs start in the local-cost month. Role compensation starts/stops separately and includes paid leave. Do not count a paid relief role again in the additional relief expense.',
 'Mature results use the selected roster month. Leadership stages change schedules and pay only as entered. Readiness, financing, clinical authority, ownership and a second location remain separate decisions.',
 'Annual dues arrive on joining and every 12-month renewal, are earned monthly, and unused months are refunded on modeled attrition. Operating loss recovery excludes startup and debt; investment cash recovery includes both and excludes financing.',
 ...prior.notes.filter(x=>x.startsWith('Every assumption')||x.startsWith('Added')||x.startsWith('Saving')),
 'Older worksheets retain earlier rules and all 70 inputs. Start a new proposed worksheet explicitly to use the revised roster. Earlier copies remain openable and exportable. Web edits do not update the PDF.'
];
export const metrics=[['requestedMembers','Requested mature enrollment','number'],['modeledMembers','Members used for revenue','number'],...prior.metrics.filter(([k])=>!['routineHours','adminAnnualHours','urgentAnnualHours'].includes(k)),['availabilityHours','Annual physician availability hours','number'],['routineHours','Annual routine capacity hours','number'],['protectedHours','Annual protected work hours, excluding breaks','number'],['activeMonthlyHours','Modeled active physician work per month','number'],['escalationHours','Owner escalation hours per month','number'],['worstDayUtilization','Highest weekday load / selected target','percent'],['deferredMembers','Requested members outside target capacity','number'],['physicianBasePay','Annual physician base salaries','money'],['costsBeforeIncentives','Operating costs before profit sharing','money'],['incentiveCost','Profit-share pool including employer burden','money'],['incentiveCash','Gross cash bonuses, all eligible associates','money'],['bonusPerAssociate','Gross bonus per eligible associate','money'],['enteredBaseCost','Costs before coverage increments and profit sharing','money'],['surplusBeforeCoverage','Surplus before coverage increments and profit sharing','money']];
export const launchMetrics=[...prior.launchMetrics,['operatingLossRecoveryMonth','Cumulative operating-loss recovery','month'],['waitlistedAtEnd','Unadmitted applicants at end, no waitlist attrition','number'],['monthsIncompleteDelivery','Months with retained care beyond capacity','count']];
export const monthlyColumns=[...prior.monthlyColumns.slice(0,5),['waitlist','Unadmitted applicants','number'],['unserved','Members beyond physical capacity','number'],...prior.monthlyColumns.slice(5),['incentiveCost','Profit-share employer cost','money'],['cumulativeOperating','Cumulative operating result','money']];
const legacyWorksheet=w=>prior.validateState({...prior.newState(),worksheet:w}).worksheet;
export function newState(){const s=prior.newState(),staffing=newStaffing();staffing.roles.filter(r=>r.kind!=='owner').forEach(r=>r.annualPay=150000);staffing.incentives={poolPercent:20,annualHurdle:0,qualityPercent:100};return {...s,schemaVersion:5,modelVersion:MODEL_VERSION,worksheet:{...s.worksheet,values:{...reference},engine:'staffing',staffing}};}
function cleanWorksheet(w){const clean=legacyWorksheet(w);if(!['staffing','legacy-v3'].includes(w.engine))throw Error('Unknown worksheet calculation mode.');return {...clean,engine:w.engine,staffing:w.engine==='staffing'?{...validateStaffing(w.staffing),incentives:cleanIncentives(w.staffing.incentives)}:null};}
export function validateState(raw){
 if([1,2,3,4].includes(raw?.schemaVersion)){
  const old=r05.validateState(raw),preserve=w=>({...w,staffing:w.staffing?{...w.staffing,incentives:null}:null});
  return {...old,schemaVersion:5,modelVersion:MODEL_VERSION,worksheet:preserve(old.worksheet),preservedWorksheets:old.preservedWorksheets.map(preserve),migrationNotes:[...old.migrationNotes,'R06 preserves your prior pricing, salaries, schedules and results with profit sharing disabled. Choose “Start revised staffing proposal” to retain these inputs and open the $250/$350, $150,000-base proposal.']};
 }
 if(raw?.schemaVersion!==5||raw.modelVersion!==MODEL_VERSION)throw Error('Unsupported review-file version.');
 const old=prior.validateState({...raw,schemaVersion:3,modelVersion:prior.MODEL_VERSION});return {...old,schemaVersion:5,modelVersion:MODEL_VERSION,worksheet:cleanWorksheet(raw.worksheet),preservedWorksheets:raw.preservedWorksheets.map(cleanWorksheet)};
}

export function openPreserved(state,index){const s=validateState(state);if(!Number.isInteger(index)||!s.preservedWorksheets[index])throw Error('Choose an earlier worksheet.');[s.worksheet,s.preservedWorksheets[index]]=[s.preservedWorksheets[index],s.worksheet];return s;}
export function startRevised(state){const s=validateState(state);s.preservedWorksheets.push(s.worksheet);s.worksheet=newState().worksheet;return s;}
function economics(w,members,pay,increment){
 const v=w.values,base=prior.calculateWorksheet(w),c=prior.rowTotals(w.customRows);
 const extra=sum(mul(sum(mul(v.extraShortVisits,v.extraShortPrice),mul(v.extraLongVisits,v.extraLongPrice)),12),c.annualRevenue);
 const revenue=sum(mul(members,base.netDues,12),extra),baseBurden=sum(mul(pay,known(v.burdenRate)?v.burdenRate/100:null),v.burdenAdjustment);
 const enteredBaseCost=sum(pay,baseBurden,v.support,v.occupancy,v.technology,v.marketing,v.other,mul(v.platformFee,12),c.annualCost),costsBeforeIncentives=sum(enteredBaseCost,increment);
 const eligible=eligibleRoles(w,w.staffing.settings.matureMonth),bonus=incentive(w,revenue,costsBeforeIncentives,extra,1,eligible.length),costs=sum(costsBeforeIncentives,bonus.loaded);
 const surplus=known(revenue)&&known(costs)?revenue-costs:null,margin=known(surplus)&&revenue>0?surplus/revenue*100:null;
 const breakEvenMembers=requiredMembers(w,costsBeforeIncentives,extra,base.netDues,0,eligible.length),targetMembers=requiredMembers(w,costsBeforeIncentives,extra,base.netDues,v.targetMargin,eligible.length);
 const bonusPerAssociate=eligible.length?ratio(bonus.cash,eligible.length):0;
 return {...base,revenue,costs,surplus,margin,physicianBasePay:pay,physicianPay:sum(pay,bonus.cash),basePhysicianBurden:baseBurden,physicianBurden:sum(baseBurden,bonus.burden),costsBeforeIncentives,incentiveCost:bonus.loaded,incentiveCash:bonus.cash,incentiveBurden:bonus.burden,eligibleSurplus:bonus.eligibleSurplus,bonusPerAssociate,associateTotalPay:eligible.length?sum(eligible[0].annualPay,bonusPerAssociate):null,eligibleAssociateCount:eligible.length,enteredBaseCost,surplusBeforeCoverage:known(revenue)&&known(enteredBaseCost)?revenue-enteredBaseCost:null,breakEvenMembers,targetMembers,cashAfterDebt:known(surplus)&&known(v.debtService)?surplus-v.debtService:null,networkRevenue:mul(v.locations,revenue),combinedSurplus:sum(mul(v.locations,surplus),base.platformSurplus)};
}
const ratio=(x,n)=>known(x)?x/n:null;
function settingsMissing(w){return settingFields.filter(f=>w.staffing.settings[f.key]===null).map(f=>f.label);}
export function calculateWorksheet(worksheet){
 const w=cleanWorksheet(worksheet);if(w.engine==='legacy-v3')return {...prior.calculateWorksheet(w),requestedMembers:w.values.members,modeledMembers:w.values.members,engine:w.engine};
 const v=w.values,z=w.staffing.settings,roster=rosterCapacity(w,z.matureMonth),limit=membershipLimit(w,roster,{onboardingRate:ratio(v.monthlyAttrition,100)}),safeMembers=known(limit)?Math.floor(limit+1e-6):null;
 const members=known(v.members)&&known(safeMembers)?(w.staffing.enrollmentMode==='stress'?v.members:Math.min(v.members,safeMembers)):null;
 const onboarding=mul(members,ratio(v.monthlyAttrition,100)),demand=evaluateDemand(w,roster,members,onboarding),physical=evaluateDemand(w,roster,members,onboarding,{target:false}),result=economics(w,members,roster.pay,addedCosts(w));
 const warnings=[...roster.warnings];if(w.staffing.incentives)warnings.push('Profit sharing is a proposed, quality-conditioned assumption. Annual prepayments and ancillary sales do not directly earn bonuses. Final awards require agreed terms and funding.');const missing=settingsMissing(w);if(missing.length)warnings.push('Unknown staffing inputs: '+missing.join(', ')+'. Dependent results remain incomplete.');
 if(limit===null&&roster.complete&&v.attendance===0&&z.urgentRate===0)warnings.push('Zero recurring care demand cannot establish a finite mature panel. Enter a workload basis before interpreting capacity or revenue.');
 if(w.staffing.enrollmentMode==='stress')warnings.push('UNCONSTRAINED STRESS CASE: requested members and revenue may exceed the roster. These amounts assume delivery, not a feasible forecast.');
 if(known(safeMembers)&&known(v.members)&&v.members>safeMembers)warnings.push('Requested enrollment exceeds the weekday access target. Constrained mode uses '+safeMembers+' members or fewer for revenue.');
 if(roster.roles.some(r=>r.annualPay===null))warnings.push('A physician compensation amount is unknown. Financial results remain incomplete.');
 if(w.customRows.some(r=>r.treatment!=='note'&&r.value===null))warnings.push('An added financial amount is blank. Affected totals remain incomplete.');
 if(known(result.targetMembers)&&known(safeMembers)&&result.targetMembers>safeMembers)warnings.push('The target margin requires more members than the roster supports at the access target.');
 if(known(result.margin)&&known(v.targetMargin)&&result.margin<v.targetMargin)warnings.push('Operating margin is below the selected target.');
 if(v.coreMinutes>v.coreBlock||v.extendedMinutes>v.extendedBlock)warnings.push('Physician time exceeds its calendar block.');
 if(w.staffing.roles.some(r=>r.stages.length))warnings.push('Stages are planning dates, not readiness approvals. Replacement training and a new location need financing and continuity arrangements.');
 return {...result,engine:w.engine,roster,demand,requestedMembers:v.members,modeledMembers:members,safeMembers,routineCapacity:roster.routineCapacity,routineDemand:demand.routineDemand,utilization:physical.pressure,worstDayUtilization:demand.pressure,availabilityHours:roster.availabilityHours,routineHours:roster.bookableHours,protectedHours:roster.protectedHours,activeMonthlyHours:demand.activeHours,escalationHours:demand.escalationHours,physicianDays:roster.complete?sum(...roster.roles.map(r=>r.weekdays.filter(Boolean).length*r.weeks)):null,deferredMembers:known(members)&&known(v.members)?Math.max(0,v.members-members):null,warnings};
}
function emptyLaunch(warnings){return {available:false,rows:[],warnings,...Object.fromEntries(launchMetrics.map(([k])=>[k,null]))};}
export function calculateLaunchWorksheet(worksheet){
 const w=cleanWorksheet(worksheet);if(w.engine==='legacy-v3')return prior.calculateLaunchWorksheet(w);
 const v=w.values,s=w.staffing,c=prior.rowTotals(w.customRows);
 const required=['horizonMonths','openingMonth','members','initialMembers','monthlyNewMembers','monthlyAttrition','prepayShare','prepayDiscount','corePrice','extendedPrice','extendedMix','attendance','maxUtilization','extraShortVisits','extraLongVisits','extraShortMinutes','extraLongMinutes','extraShortPrice','extraLongPrice'];
 const missing=required.filter(k=>!known(v[k]));if(missing.length||v.horizonMonths===0||v.openingMonth===0)return emptyLaunch(['Complete enrollment/pricing and positive timing: '+missing.join(', ')+'. Zero and blank values remain saved.']);
 const share=v.prepayShare/100,blend=v.corePrice*(1-v.extendedMix/100)+v.extendedPrice*v.extendedMix/100,annualDues=blend*(1-v.prepayDiscount/100),churn=v.monthlyAttrition/100;
 const extra=sum(mul(v.extraShortVisits,v.extraShortPrice),mul(v.extraLongVisits,v.extraLongPrice),ratio(c.annualRevenue,12));
 const local=sum(v.support,v.occupancy,v.technology,v.marketing,v.other,v.burdenAdjustment,mul(v.platformFee,12),c.annualCost,addedCosts(w));
 const startup=sum(v.startupCapital,c.startup),rows=[],warnings=[];let monthlyMembers=0,cohorts=[],waitlist=0,cumulativeOperating=0,cumulativeRecovery=0,cashBalance=v.openingCash;
 for(let month=1;month<=v.horizonMonths;month++){
  const open=month>=v.openingMonth,roster=rosterCapacity(w,month,{partial:s.launchAccess==='staffed-days'});
  if(open&&!roster.complete)return emptyLaunch(['The month '+month+' roster or demand weights are incomplete. '+roster.warnings.join(' ')]);
  let refunds=0,annualCollections=0,lostMembers=0,newMembers=0;
  if(open){
   lostMembers=monthlyMembers*churn;monthlyMembers-=lostMembers;
   for(const cohort of cohorts){const lost=cohort.members*churn;refunds+=lost*cohort.remaining*annualDues;lostMembers+=lost;cohort.members-=lost;if(cohort.remaining===0){annualCollections+=cohort.members*annualDues*12;cohort.remaining=12;}}
   const retained=monthlyMembers+cohorts.reduce((n,c)=>n+c.members,0);waitlist+=month===v.openingMonth?v.initialMembers:v.monthlyNewMembers;
   const wanted=Math.min(waitlist,Math.max(0,v.members-retained)),limit=membershipLimit(w,roster,{retained,onboardingRate:1,maximum:v.members});
   if(limit===null)return emptyLaunch(['Complete workload inputs to calculate enrollment.']);
   newMembers=s.enrollmentMode==='stress'?wanted:Math.min(wanted,Math.max(0,limit-retained));waitlist-=newMembers;
   monthlyMembers+=newMembers*(1-share);if(newMembers*share>0){cohorts.push({members:newMembers*share,remaining:12});annualCollections+=newMembers*share*annualDues*12;}
  }
  const annualMembers=cohorts.reduce((n,c)=>n+c.members,0),members=monthlyMembers+annualMembers;
  const demand=open?evaluateDemand(w,roster,members,newMembers):null,physical=open?evaluateDemand(w,roster,members,newMembers,{target:false}):null;
  const physicalLimit=open?membershipLimit(w,roster,{retained:members,onboardingRate:0,target:false}):0,unserved=open&&known(physicalLimit)?Math.max(0,members-physicalLimit):null;
  const deliveryIncomplete=open&&(!physical.complete||!physical.fits)&&s.enrollmentMode!=='stress';
  const revenue=deliveryIncomplete?null:sum(monthlyMembers*blend+annualMembers*annualDues,open?extra:0),receipts=deliveryIncomplete?null:sum(monthlyMembers*blend+annualCollections-refunds,open?extra:0);
  for(const cohort of cohorts)if(open)cohort.remaining--;const deferredRevenue=cohorts.reduce((n,c)=>n+c.members*c.remaining*annualDues,0);
  const pay=roster.pay,costsStarted=known(v.costStartMonth)&&v.costStartMonth>0?month>=v.costStartMonth:null,employment=known(pay)&&known(v.burdenRate)?pay*(1+v.burdenRate/100)/12:null;
  const costsBeforeIncentives=sum(employment,costsStarted===null?null:costsStarted?ratio(local,12):0),eligible=eligibleRoles(w,month),bonus=incentive(w,revenue,costsBeforeIncentives,open?extra:0,1/12,eligible.length),costs=sum(costsBeforeIncentives,bonus.loaded);
  const debtPayment=v.debtService===0?0:known(v.debtService)&&known(v.debtStartMonth)&&v.debtStartMonth>0?(month>=v.debtStartMonth?v.debtService/12:0):null;
  const startupSpend=known(startup)&&known(v.startupMonth)&&v.startupMonth>0?(month===v.startupMonth?startup:0):null,financing=v.financingDraw===0?0:known(v.financingDraw)&&known(v.financingMonth)&&v.financingMonth>0?(month===v.financingMonth?v.financingDraw:0):null;
  const operatingResult=sum(revenue,mul(-1,costs));cumulativeOperating=sum(cumulativeOperating,operatingResult);
  const preFinance=sum(receipts,mul(-1,costs),mul(-1,debtPayment),mul(-1,startupSpend));cumulativeRecovery=sum(cumulativeRecovery,preFinance);
  const cashMovement=sum(preFinance,financing);cashBalance=sum(cashBalance,cashMovement);
  rows.push({month,members,newMembers,lostMembers,waitlist,unserved,physicians:open?roster.physicians:0,capacity:open?roster.routineCapacity:0,demand:demand?.routineDemand??0,utilization:physical?.pressure??null,overCapacity:Boolean(physical&&!physical.fits),overTarget:Boolean(demand&&!demand.fits),revenue,receipts,refunds,costs,costsBeforeIncentives,incentiveCost:bonus.loaded,incentiveCash:bonus.cash,operatingResult,debtPayment,startupSpend,financing,cashMovement,cashBalance,cumulativeRecovery,cumulativeOperating,deferredRevenue,deliveryIncomplete});
 }
 const sustained=key=>{const i=rows.findIndex((r,i)=>r.month>=v.openingMonth&&r.revenue>0&&rows.slice(i).every(x=>known(x[key])&&x[key]>=-1e-6));return i<0?null:rows[i].month;};
 const all=key=>rows.every(r=>known(r[key])),total=key=>sum(...rows.map(r=>r[key])),minCash=all('cashBalance')?Math.min(...rows.map(r=>r.cashBalance)):null;
 if(settingsMissing(w).length)warnings.push('Blank staffing costs or inputs keep affected financial results incomplete. Membership and capacity can still calculate.');
 if(!known(startup))warnings.push('Startup spending is unknown; funding and investment recovery remain incomplete.');if(v.openingCash===null)warnings.push('Opening cash is unknown; remaining funding gap is incomplete.');
 if(rows.some(r=>r.deliveryIncomplete))warnings.push('Retained membership exceeds physical capacity in some months. No automatic transfers are assumed. Revenue/cash become incomplete until coverage is resolved.');
 if(rows.some(r=>r.overTarget))warnings.push('Some retained care obligations exceed the access buffer; new admissions pause.');
 if(s.enrollmentMode==='stress')warnings.push('UNCONSTRAINED STRESS CASE: launch revenue assumes delivery even when the roster cannot support it.');
 if(s.launchAccess==='staffed-days')warnings.push('Before full staffing, access is promised on staffed days only. Demand is redistributed to those days; patient acceptance is unproven.');
 warnings.push('Unadmitted applicants accumulate with no waitlist attrition. They are not members, revenue or traction. Fractional people are expected values.');
 if(v.prepayShare>0)warnings.push('Annual prepayments remain unearned service/refund obligations until monthly care is earned.');
 for(const [key,label]of [['startupMonth','Startup spending'],['costStartMonth','Local costs'],['financingMonth','Financing']])if(v[key]>v.horizonMonths)warnings.push(label+' falls after the modeled horizon.');
 if(v.costStartMonth>v.openingMonth)warnings.push('Local costs begin after care opens; verify timing.');if(v.startupMonth>v.openingMonth&&startup!==0)warnings.push('Startup spending occurs after care opens; verify that opening is possible.');
 return {available:true,rows,warnings,endMembers:rows.at(-1).members,totalRevenue:total('revenue'),totalOperatingResult:total('operatingResult'),operatingBreakEvenMonth:sustained('operatingResult'),cashRecoveryMonth:sustained('cumulativeRecovery'),operatingLossRecoveryMonth:sustained('cumulativeOperating'),grossFundingNeed:all('cumulativeRecovery')?Math.max(0,-Math.min(0,...rows.map(r=>r.cumulativeRecovery))):null,additionalFunding:known(minCash)?Math.max(0,-minCash):null,reserveTopUp:known(minCash)&&known(v.workingCapital)?Math.max(0,v.workingCapital-minCash):null,minCash,endingCash:rows.at(-1).cashBalance,endingDeferredRevenue:rows.at(-1).deferredRevenue,monthsOverTarget:rows.filter(r=>r.overTarget).length,monthsOverCapacity:rows.filter(r=>r.overCapacity).length,waitlistedAtEnd:rows.at(-1).waitlist,monthsIncompleteDelivery:rows.filter(r=>r.deliveryIncomplete).length};
}
export function exportPack(state){const s=validateState(state);return {...s,exportedAt:new Date().toISOString(),results:{mature:calculateWorksheet(s.worksheet),launch:calculateLaunchWorksheet(s.worksheet)},modelNotes:notes};}
export function worksheetRows(w){
 const rows=[['Calculation mode',w.engine],...fields.map(f=>[(w.engine==='staffing'&&replacedKeys.has(f.key)?'Preserved earlier input (not active): ':'')+f.label,f.unit,w.values[f.key]])];
 if(w.engine==='staffing'){
  if(w.staffing.incentives)for(const f of incentiveFields)rows.push([f.label,f.unit,w.staffing.incentives[f.key]]);else rows.push(['Profit sharing','Disabled for preserved earlier worksheet']);
  rows.push(['Enrollment mode',w.staffing.enrollmentMode],['Launch access',w.staffing.launchAccess]);for(const f of settingFields)rows.push([f.label,f.unit,w.staffing.settings[f.key]]);days.forEach((d,i)=>rows.push([d+' demand weight','relative weight',w.staffing.weights[i]]));
  for(const r of w.staffing.roles){rows.push(['Role',r.name,r.kind],['Weekdays',days.filter((_,i)=>r.weekdays[i]).join(', ')],['Coverage arrangement',r.coverage]);for(const f of roleFields)rows.push([f.label,f.unit,r[f.key]]);for(const stage of r.stages){rows.push(['Stage',stage.label,stage.month],['Stage weekdays',days.filter((_,i)=>stage.weekdays[i]).join(', ')]);for(const f of roleFields.filter(f=>!['startMonth','endMonth'].includes(f.key)))rows.push([f.label,f.unit,stage[f.key]]);}}
 }return rows;
}
function reviewRows(state){const p=exportPack(state),rows=[['DIRECT PRIMARY CARE WORKSHEET',p.name],['Model',MODEL_VERSION],['Author',p.author],['Feedback',p.feedback]];
 for(const [i,w]of [p.worksheet,...p.preservedWorksheets].entries()){
  const m=calculateWorksheet(w),l=calculateLaunchWorksheet(w);rows.push([],[(i?'PRESERVED':'ACTIVE')+' WORKSHEET',w.name],['Basis',w.basis],['Launch basis',w.launchBasis],['Period',w.period],['Sources and notes',w.notes],...worksheetRows(w),[],['CUSTOM ROWS']);for(const r of w.customRows)rows.push([r.category,r.label,r.value,r.unit,r.treatment,r.notes]);
  rows.push([],['RESULTS']);for(const [k,label]of metrics)rows.push([label,m[k]??null]);for(const [k,label]of launchMetrics)rows.push([label,l[k]??null]);
  if(m.roster){rows.push([],['WEEKDAY CAPACITY','Physicians','Routine visits/month','Demand weight']);for(const d of m.roster.daily)rows.push([d.day,d.physicians,d.routineCapacity,d.weight]);}
  rows.push([],['MONTHLY LAUNCH'],monthlyColumns.map(c=>c[1]));for(const r of l.rows)rows.push(monthlyColumns.map(([k])=>r[k]??null));for(const warning of [...m.warnings,...l.warnings])rows.push(['Check',warning]);
 }for(const n of [...p.migrationNotes,...notes])rows.push(['Model note',n]);return rows;}
export function reviewText(state){return reviewRows(state).map(row=>row.map(x=>x===null?'Unknown':String(x)).join(' | ')).join('\n');}
const csvCell=x=>{let s=x===null?'Unknown':String(x);if(typeof x==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function worksheetCsv(state){return '\uFEFF'+reviewRows(state).map(r=>r.map(csvCell).join(',')).join('\r\n');}
