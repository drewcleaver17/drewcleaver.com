import * as prior from './dpc-worksheet-v3.mjs';
import * as r06 from './dpc-worksheet-v5.mjs';
import {newStaffing,validateStaffing,rosterCapacity,evaluateDemand,membershipLimit,addedCosts,known,sum,mul,roleFields as priorRoleFields,settingFields,days,newRole as priorNewRole,newStage,demandFields,cleanDemand} from './dpc-staffing-v2.mjs';
export {settingFields,days,newStage,demandFields};
export const legacyFields=r06.fields;
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
export const MODEL_VERSION='dpc-2026-09-v6';
export const {bases,treatments,blankRow}=prior;
const workloadLabels={coreMinutes:'Physician minutes: short routine visit',coreBlock:'Calendar block: short routine visit',extendedMinutes:'Physician minutes: long routine visit',extendedBlock:'Calendar block: long routine visit'};
export const fields=prior.fields.map(f=>workloadLabels[f.key]?{...f,label:workloadLabels[f.key],help:'Visit workload is separate from membership tier. The long-visit share is in workload controls.'}:f);
export const groups=prior.groups.map(g=>({...g,fields:g.fields.map(f=>fields.find(x=>x.key===f.key))}));
export const reference={...prior.reference,corePrice:250,extendedPrice:350,associatePay:150000,prepayDiscount:20,prepayShare:50,coreBlock:25,extendedBlock:45,coreMinutes:25,extendedMinutes:45,extraShortMinutes:25,extraLongMinutes:45};
export function formatMetric(value,type){return value===null||value===undefined?(type==='month'?'Not reached / incomplete':'Not provided'):prior.formatMetric(value,type);}
export const replacedKeys=new Set(['dailyVisitCap','breakHours','urgentHours','adminHours','ownerDays','ownerHours','ownerWeeks','associates','associateDays','associateHours','associateWeeks','ownerPay','associatePay','ownerStartMonth','associate1Month','associate2Month']);
export const notes=[
 'Trial prices are $250/$350 monthly or $2,400/$3,360 paid annually upfront. Default annual take-up is 50%, an illustrative midpoint, not measured demand.',
 'The reference keeps $150,000 associate bases, $180,000 owner pay and a proposed 20% employer-cost profit-share pool. Higher compensation sensitivities are required; recruitment acceptance is unproven.',
 'Coverage allowances total $60,000: $30,000 extra support, $20,000 relief, $5,000 recruiting and $5,000 extended operations. These are provisional planning allowances, not vendor quotes. Relief money does not schedule substitute capacity. Clear any unverified input to keep it unknown.',
 'Owner in-person days are Tuesday–Thursday. Associate A: Sunday/Monday/Tuesday/Wednesday/Friday. Associate B: Monday/Tuesday/Thursday/Friday/Saturday. Both work five days with one weekend day; their days off are nonconsecutive.',
 'Core members use a 25-minute routine booking and Extended members use a 45-minute routine booking in this trial. The default 75% Extended share therefore creates a 40-minute weighted routine block. The visit mix remains editable because membership tier mix and actual completed-visit mix may diverge.',
 'Routine flexibility defaults to 0%, retaining patient-preferred weekday weights. An editable share of routine/onboarding work can move in proportion to routine capacity. Urgent demand has independent weekday weights and cannot move with this slider. Neither flexibility nor willingness to cross-cover is proven.',
 'Associates have a ceiling of 12 total encounters, not a promise of 12 routine appointments. With six routine hours, one urgent reserve and the default 40-minute weighted block, about nine routine visits fit before onboarding; a lower Core-heavy mix can approach the 11-routine-encounter cap. Owner ceiling is six, with one urgent encounter reserved.',
 'The optional Friday–Monday physician is a separate hiring scenario. Any selected start month is a planning input, not an automatic hiring recommendation. Additional rooms, support, leave coverage and incremental paying members must be validated.',
 ...r06.notes.filter(x=>!x.startsWith('R06 trial')&&!x.startsWith('Associate A works')&&!x.startsWith('Daily demand weights'))
];
export const metrics=[['requestedMembers','Requested mature enrollment','number'],['modeledMembers','Members used for revenue','number'],...prior.metrics.filter(([k])=>!['routineHours','adminAnnualHours','urgentAnnualHours'].includes(k)),['availabilityHours','Annual physician availability hours','number'],['routineHours','Annual routine capacity hours','number'],['protectedHours','Annual protected work hours, excluding breaks','number'],['activeMonthlyHours','Modeled active physician work per month','number'],['escalationHours','Owner escalation hours per month','number'],['worstDayUtilization','Highest weekday load / selected target','percent'],['deferredMembers','Requested members outside target capacity','number'],['physicianBasePay','Annual physician base salaries','money'],['costsBeforeIncentives','Operating costs before profit sharing','money'],['incentiveCost','Profit-share pool including employer burden','money'],['incentiveCash','Gross cash bonuses, all eligible associates','money'],['bonusPerAssociate','Gross bonus per eligible associate','money'],['enteredBaseCost','Costs before coverage increments and profit sharing','money'],['surplusBeforeCoverage','Surplus before coverage increments and profit sharing','money']];
export const launchMetrics=[...prior.launchMetrics,['operatingLossRecoveryMonth','Cumulative operating-loss recovery','month'],['waitlistedAtEnd','Unadmitted applicants at end, no waitlist attrition','number'],['monthsIncompleteDelivery','Months with retained care beyond capacity','count']];
export const monthlyColumns=[...prior.monthlyColumns.slice(0,5),['waitlist','Unadmitted applicants','number'],['unserved','Members beyond physical capacity','number'],...prior.monthlyColumns.slice(5),['incentiveCost','Profit-share employer cost','money'],['cumulativeOperating','Cumulative operating result','money']];
const legacyWorksheet=w=>prior.validateState({...prior.newState(),worksheet:w}).worksheet;
export function newState(){
 const s=prior.newState(),staffing=newStaffing();
 staffing.roles.filter(r=>r.kind!=='owner').forEach(r=>r.annualPay=150000);
 staffing.roles[0].weekdays=[false,false,true,true,true,false,false];
 staffing.roles[1].weekdays=[true,true,true,true,false,true,false];
 staffing.roles[2].weekdays=[false,true,true,false,true,true,true];
 staffing.incentives={poolPercent:20,annualHurdle:0,qualityPercent:100};
 staffing.demand={longVisitPercent:75,routineFlexPercent:0,urgentWeights:[1,2,2,2,2,2,1]};
 Object.assign(staffing.settings,{extendedSupport:30000,leaveRelief:20000,recruiting:5000,extendedOccupancy:5000});
 Object.assign(staffing.settings,{onboardingMinutes:45});
 return {...s,schemaVersion:6,modelVersion:MODEL_VERSION,worksheet:{...s.worksheet,name:'Balanced coverage planning case',values:{...reference},engine:'staffing',staffing}};
}
function cleanWorksheet(w){const clean=legacyWorksheet(w);if(!['staffing','legacy-v3'].includes(w.engine))throw Error('Unknown worksheet calculation mode.');return {...clean,engine:w.engine,staffing:w.engine==='staffing'?{...validateStaffing(w.staffing),incentives:cleanIncentives(w.staffing.incentives)}:null};}
export function validateState(raw){
 const legacy=[1,2,3,4,5].includes(raw?.schemaVersion);
 if(!legacy&&(raw?.schemaVersion!==6||raw.modelVersion!==MODEL_VERSION))throw Error('Unsupported review-file version.');
 const old=r06.validateState(legacy?raw:{...raw,schemaVersion:5,modelVersion:r06.MODEL_VERSION});
 const restore=(w,source)=>({...w,staffing:w.staffing?{...w.staffing,demand:legacy?null:cleanDemand(source.staffing?.demand)}:null});
 return {...old,schemaVersion:6,modelVersion:MODEL_VERSION,worksheet:restore(old.worksheet,raw.worksheet),preservedWorksheets:old.preservedWorksheets.map((w,i)=>restore(w,raw.preservedWorksheets?.[i])),migrationNotes:legacy?[...old.migrationNotes,'The audited proposal preserves earlier demand, scheduling, prices and incentives under their original calculation rules. Start the revised proposal to use separate visit mix, urgent demand and balanced coverage.']:old.migrationNotes};
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
 const w=cleanWorksheet(worksheet);if(!w.staffing?.demand)return r06.calculateWorksheet(w);
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
 const w=cleanWorksheet(worksheet);if(!w.staffing?.demand)return r06.calculateLaunchWorksheet(w);
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
  if(w.staffing.demand){for(const f of demandFields)rows.push([f.label,f.unit,w.staffing.demand[f.key]]);days.forEach((d,i)=>rows.push([d+' urgent demand weight','relative weight',w.staffing.demand.urgentWeights[i]]));}else rows.push(['Demand engine','Preserved earlier scheduling rules']);
  if(w.staffing.incentives)for(const f of incentiveFields)rows.push([f.label,f.unit,w.staffing.incentives[f.key]]);else rows.push(['Profit sharing','Disabled for preserved earlier worksheet']);
  rows.push(['Enrollment mode',w.staffing.enrollmentMode],['Launch access',w.staffing.launchAccess]);for(const f of settingFields)rows.push([f.label,f.unit,w.staffing.settings[f.key]]);days.forEach((d,i)=>rows.push([d+' demand weight','relative weight',w.staffing.weights[i]]));
  for(const r of w.staffing.roles){rows.push(['Role',r.name,r.kind],['Weekdays',days.filter((_,i)=>r.weekdays[i]).join(', ')],['Coverage arrangement',r.coverage]);for(const f of roleFields)rows.push([f.label,f.unit,r[f.key]]);for(const stage of r.stages){rows.push(['Stage',stage.label,stage.month],['Stage weekdays',days.filter((_,i)=>stage.weekdays[i]).join(', ')]);for(const f of roleFields.filter(f=>!['startMonth','endMonth'].includes(f.key)))rows.push([f.label,f.unit,stage[f.key]]);}}
 }return rows;
}
function reviewRows(state){const p=exportPack(state),rows=[['DIRECT PRIMARY CARE WORKSHEET',p.name],['Model',MODEL_VERSION],['Author',p.author],['Feedback',p.feedback]];
 for(const [i,w]of [p.worksheet,...p.preservedWorksheets].entries()){
  const m=calculateWorksheet(w),l=calculateLaunchWorksheet(w);rows.push([],[(i?'PRESERVED':'ACTIVE')+' WORKSHEET',w.name],['Basis',w.basis],['Launch basis',w.launchBasis],['Period',w.period],['Sources and notes',w.notes],...worksheetRows(w),[],['CUSTOM ROWS']);for(const r of w.customRows)rows.push([r.category,r.label,r.value,r.unit,r.treatment,r.notes]);
  rows.push([],['RESULTS']);for(const [k,label]of metrics)rows.push([label,m[k]??null]);for(const [k,label]of launchMetrics)rows.push([label,l[k]??null]);
  if(m.roster){rows.push([],['WEEKDAY CAPACITY','Physicians','Routine visits/month','Preferred routine weight','Allocated routine weight','Urgent weight']);for(const d of m.roster.daily)rows.push([d.day,d.physicians,d.routineCapacity,d.weight,d.routineWeight??d.weight,d.urgentWeight??d.weight]);}
  rows.push([],['MONTHLY LAUNCH'],monthlyColumns.map(c=>c[1]));for(const r of l.rows)rows.push(monthlyColumns.map(([k])=>r[k]??null));for(const warning of [...m.warnings,...l.warnings])rows.push(['Check',warning]);
 }for(const n of [...p.migrationNotes,...notes])rows.push(['Model note',n]);return rows;}
export function reviewText(state){return reviewRows(state).map(row=>row.map(x=>x===null?'Unknown':String(x)).join(' | ')).join('\n');}
const csvCell=x=>{let s=x===null?'Unknown':String(x);if(typeof x==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function worksheetCsv(state){return '\uFEFF'+reviewRows(state).map(r=>r.map(csvCell).join(',')).join('\r\n');}

export const schedulePresets=[['balanced','Two associates: balanced weekdays'],['consecutive','Two associates: Sun–Thu / Tue–Sat'],['fourth','Three associates: add Friday–Monday']];
export function withSchedule(worksheet,key){
 if(!schedulePresets.some(([id])=>id===key))throw Error('Unknown schedule scenario.');
 const w=structuredClone(worksheet);if(!w.staffing?.demand)throw Error('Start the revised proposal to compare schedules.');
 const roles=w.staffing.roles;if(roles.some(r=>r.stages.length)||roles.length>4||roles[0]?.kind!=='owner'||roles[1]?.kind!=='associate'||roles[2]?.kind!=='associate'||(roles[3]&&roles[3].id!=='scenario-c'))throw Error('Schedule presets need the original owner and two associates without stages. Save this custom roster and start a revised proposal first.');
 roles[0].weekdays=[false,false,true,true,true,false,false];
 roles[1].weekdays=key==='balanced'?[true,true,true,true,false,true,false]:[true,true,true,true,true,false,false];
 roles[2].weekdays=key==='balanced'?[false,true,true,false,true,true,true]:[false,false,true,true,true,true,true];
 w.staffing.roles=roles.slice(0,3);
 if(key==='fourth'){const r=roles[3]??newRole('scenario-c','Associate C — Friday–Monday',[true,true,false,false,false,true,true],w.staffing.settings.matureMonth);w.staffing.roles.push(r);}
 w.name=schedulePresets.find(([id])=>id===key)[1];w.basis='Ballpark estimates';return w;
}
