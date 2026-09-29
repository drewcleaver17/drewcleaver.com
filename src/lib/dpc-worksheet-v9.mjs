import * as prior from './dpc-worksheet-v3.mjs';
import * as r06 from './dpc-worksheet-v5.mjs';
import * as previous from './dpc-worksheet-v8.mjs';
import {newStaffing,validateStaffing,rosterCapacity,evaluateDemand,membershipLimit,addedCosts,known,sum,mul,roleFields as priorRoleFields,settingFields,days,newRole as priorNewRole,newStage,demandFields,cleanDemand,panelShares,admitPanels} from './dpc-assigned-panels.mjs';
export {settingFields,days,newStage,demandFields};
export const legacyFields=r06.fields;
export const roleFields=priorRoleFields.map(f=>f.key==='annualPay'?{...f,label:'Annual base salary',value:150000,help:'Base salary only. The separate practice profit-share pool includes its own employer burden. Paid from the role start month, including leave.'}:f);
export function newRole(...args){const r=priorNewRole(...args);if(r.kind!=='owner'){r.annualPay=150000;r.availableEnd=18;}return r;}
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
export const MODEL_VERSION='dpc-2026-09-v9';
export const {bases,treatments,blankRow}=prior;
const workloadLabels={coreMinutes:'Physician minutes: short routine visit',coreBlock:'Calendar block: short routine visit',extendedMinutes:'Physician minutes: long routine visit',extendedBlock:'Calendar block: long routine visit'};
export const fields=prior.fields.map(f=>f.key==='attendance'?{...f,value:100,help:'R09 base: 100% to budget the intended monthly habit. 70% is an unmeasured comparison.'}:workloadLabels[f.key]?{...f,label:workloadLabels[f.key],help:'Visit workload is separate from membership tier. The long-visit share is in workload controls.'}:f);
export const groups=prior.groups.map(g=>({...g,fields:g.fields.map(f=>fields.find(x=>x.key===f.key))}));
export const reference={...prior.reference,attendance:100,corePrice:250,extendedPrice:350,associatePay:150000,prepayDiscount:20,prepayShare:50,coreBlock:25,extendedBlock:45,coreMinutes:25,extendedMinutes:45,extraShortMinutes:25,extraLongMinutes:45};
export function formatMetric(value,type){return value===null||value===undefined?(type==='month'?'Not reached / incomplete':'Not provided'):prior.formatMetric(value,type);}
export const replacedKeys=new Set(['dailyVisitCap','breakHours','urgentHours','adminHours','ownerDays','ownerHours','ownerWeeks','associates','associateDays','associateHours','associateWeeks','ownerPay','associatePay','ownerStartMonth','associate1Month','associate2Month']);
export const notes=[
 'Trial prices are $250/$350 monthly or $2,400/$3,360 paid annually upfront. Default annual take-up is 50%, an illustrative midpoint, not measured demand.',
 'The reference keeps $150,000 associate bases, $180,000 owner pay and a proposed 20% employer-cost profit-share pool. Higher compensation sensitivities are required; recruitment acceptance is unproven.',
 'Coverage allowances total $60,000: $30,000 extra support, $20,000 relief, $5,000 recruiting and $5,000 extended operations. These are provisional planning allowances, not vendor quotes. Relief money does not schedule substitute capacity. Clear any unverified input to keep it unknown.',
 'Owner in-person days are Tuesday–Thursday. Associate A: Sunday–Thursday, Friday/Saturday off. Associate B: Tuesday–Saturday, Sunday/Monday off. Both work five consecutive onsite days. All three physicians overlap Tuesday–Thursday for collaboration and development; teaching time must be budgeted before scheduling it. Days off carry no assumed on-call obligation.',
 'Core members use a 25-minute routine booking and Extended members use a 45-minute routine booking in this trial. The default 75% Extended share therefore creates a 40-minute weighted routine block. The visit mix remains editable because membership tier mix and actual completed-visit mix may diverge.',
 'R09 assigns every member to one physician. Routine and onboarding work is distributed only across that physician’s clinic days using editable relative day weights, uniform by default. Panel weights start capacity-proportional, not measured preference. No routine cross-physician pooling. 100% monthly attendance is the base; 70% is a comparison.',
 'Short-notice access uses a separate protected reserve. Expected completed requests, unused reserve and excess requests are distinct. No additional revenue is assumed for these requests while inclusion versus existing extra-visit charges is unresolved. Extra paid visits entered separately are distinct work, never the same urgent encounter billed twice.',
 'The 85% target applies once to routine/onboarding capacity for scheduling variation. Urgent reserve is already protected and is not discounted again. Leave reduces annual capacity through working weeks; dated absence testing is still required. Owner escalation defaults to zero because no additional commitment is agreed.',
 'Associates have a ceiling of 12 total encounters, not a promise of 12 routine appointments. With six routine hours, one urgent reserve and the default 40-minute weighted block, about nine routine visits fit before onboarding; a lower Core-heavy mix can approach the 11-routine-encounter cap. Owner has six scheduled slots plus one urgent reserve (seven total). The owner day is 10–7: three morning and three afternoon slots within 10–5, one hour lunch, urgent 5–6 and messages 6–7. Unused time within those slots is not extra visit inventory.',
 'Launch applicants keep assigned-panel waitlists. No reassignment when a doctor joins or leaves. Launch admissions remain constrained even when the mature stress case is selected. Fractional launch members are expected values capped at whole-person mature panel limits.',
 'Availability defines scheduled work only. No after-hours response or off-day duty is assumed. The response-time field is a discussion target, not an established guarantee.',
 'The optional Friday–Monday physician is a separate hiring scenario. Any selected start month is a planning input, not an automatic hiring recommendation. Additional rooms, support, leave coverage and incremental paying members must be validated.',
 ...r06.notes.filter(x=>!x.startsWith('The launch initially')&&!x.startsWith('Constrained enrollment')&&!x.startsWith('The model uses separate')&&!x.startsWith('R06 trial')&&!x.startsWith('Associate A works')&&!x.startsWith('Daily demand weights')).map(x=>x.replace('R06 uses separate','The model uses separate'))
];
export const metrics=[['requestedMembers','Requested mature enrollment','number'],['modeledMembers','Members used for revenue','number'],...prior.metrics.filter(([k])=>!['routineHours','adminAnnualHours','urgentAnnualHours'].includes(k)).map(row=>row[0]==='utilization'?['utilization','Highest weekday load / physical capacity','percent']:row),['availabilityHours','Annual physician availability hours','number'],['routineHours','Annual routine capacity hours','number'],['protectedHours','Annual protected work hours, excluding breaks','number'],['activeMonthlyHours','Modeled active physician work per month','number'],['escalationHours','Owner escalation hours per month','number'],['worstDayUtilization','Highest weekday load / selected target','percent'],['deferredMembers','Requested members outside target capacity','number'],['physicianBasePay','Annual physician base salaries','money'],['costsBeforeIncentives','Operating costs before profit sharing','money'],['incentiveCost','Profit-share pool including employer burden','money'],['incentiveCash','Gross cash bonuses, all eligible associates','money'],['bonusPerAssociate','Gross bonus per eligible associate','money'],['enteredBaseCost','Costs before coverage increments and profit sharing','money'],['surplusBeforeCoverage','Surplus before coverage increments and profit sharing','money']];
export const launchMetrics=[...prior.launchMetrics,['operatingLossRecoveryMonth','Cumulative operating-loss recovery','month'],['waitlistedAtEnd','Unadmitted applicants at end, no waitlist attrition','number'],['monthsIncompleteDelivery','Months with retained care beyond capacity','count']];
export const monthlyColumns=[...prior.monthlyColumns.slice(0,5),['waitlist','Unadmitted applicants','number'],['unserved','Members beyond physical capacity','number'],...prior.monthlyColumns.slice(5),['incentiveCost','Profit-share employer cost','money'],['cumulativeOperating','Cumulative operating result','money']];
const legacyWorksheet=w=>prior.validateState({...prior.newState(),worksheet:w}).worksheet;
export function newState(){
 const s=prior.newState(),staffing=newStaffing();
 staffing.roles.filter(r=>r.kind!=='owner').forEach(r=>r.annualPay=150000);
 staffing.roles[0].weekdays=[false,false,true,true,true,false,false];
 Object.assign(staffing.roles[0],{availableStart:10,availableEnd:19,bookStart:10,bookEnd:17,adminHours:0,adminOutside:1,urgentInside:0,cap:7});
 staffing.roles[1].weekdays=[true,true,true,true,true,false,false];
 staffing.roles[2].weekdays=[false,false,true,true,true,true,true];
 staffing.incentives={poolPercent:20,annualHurdle:0,qualityPercent:100};
 staffing.demand={longVisitPercent:75,routineFlexPercent:0,urgentWeights:[1,2,2,2,2,2,1]};
 staffing.panels={version:1,weights:{owner:69,'associate-a':172.5,'associate-b':172.5}};staffing.weights.fill(1);
 staffing.roles.forEach(r=>{r.coverage='Onsite on scheduled days; no off-day or after-hours obligation';if(r.kind!=='owner')r.availableEnd=18;});staffing.settings.escalationPercent=0;
 Object.assign(staffing.settings,{extendedSupport:30000,leaveRelief:20000,recruiting:5000,extendedOccupancy:5000});
 Object.assign(staffing.settings,{onboardingMinutes:45});
 return {...s,schemaVersion:9,modelVersion:MODEL_VERSION,worksheet:{...s.worksheet,name:'R09 assigned panels — 100% monthly attendance',values:{...reference},engine:'staffing',staffing}};
}
function cleanWorksheet(w){if(!w.staffing?.panels)return previous.validateState({...previous.newState(),worksheet:w}).worksheet;const clean=legacyWorksheet(w);return {...clean,engine:w.engine,staffing:validateStaffing(w.staffing)};}
export function validateState(raw){
 const current=raw?.schemaVersion===9&&raw.modelVersion===MODEL_VERSION;
 if(!current&&![1,2,3,4,5,6,7,8].includes(raw?.schemaVersion))throw Error('Unsupported review-file version.');
 const old=previous.validateState(current?{...raw,schemaVersion:8,modelVersion:previous.MODEL_VERSION}:raw);
 const restore=(w,source)=>source?.staffing?.panels?cleanWorksheet(source):w;
 return {...old,schemaVersion:9,modelVersion:MODEL_VERSION,worksheet:restore(old.worksheet,raw.worksheet),preservedWorksheets:old.preservedWorksheets.map((w,i)=>restore(w,raw.preservedWorksheets?.[i])),migrationNotes:current?old.migrationNotes:[...old.migrationNotes,'R09 preserves earlier calculations unchanged. Start R09 assigned-panel proposal explicitly to retain this worksheet and open the corrected care model.']};
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
 return {...base,revenue,costs,surplus,margin,associateCompensation:eligible.map(r=>({id:r.id,name:r.name,base:r.annualPay,bonus:bonusPerAssociate,total:sum(r.annualPay,bonusPerAssociate)})),physicianBasePay:pay,physicianPay:sum(pay,bonus.cash),basePhysicianBurden:baseBurden,physicianBurden:sum(baseBurden,bonus.burden),costsBeforeIncentives,incentiveCost:bonus.loaded,incentiveCash:bonus.cash,incentiveBurden:bonus.burden,eligibleSurplus:bonus.eligibleSurplus,bonusPerAssociate,associateTotalPay:eligible.length&&eligible.every(r=>r.annualPay===eligible[0].annualPay)?sum(eligible[0].annualPay,bonusPerAssociate):null,eligibleAssociateCount:eligible.length,enteredBaseCost,surplusBeforeCoverage:known(revenue)&&known(enteredBaseCost)?revenue-enteredBaseCost:null,breakEvenMembers,targetMembers,cashAfterDebt:known(surplus)&&known(v.debtService)?surplus-v.debtService:null,networkRevenue:mul(v.locations,revenue),combinedSurplus:sum(mul(v.locations,surplus),base.platformSurplus)};
}
const ratio=(x,n)=>known(x)?x/n:null;
function settingsMissing(w){return settingFields.filter(f=>w.staffing.settings[f.key]===null).map(f=>f.label);}
function wholePanels(w,n,multiplier=1){if(!known(n))return null;const shares=panelShares(w),rows=Object.entries(shares).map(([id,p])=>({id,value:Math.floor(n*p),remainder:n*p-Math.floor(n*p)}));let left=n-rows.reduce((t,r)=>t+r.value,0);for(const r of [...rows].sort((a,b)=>b.remainder-a.remainder))if(left-->0)r.value++;return Object.fromEntries(rows.map(r=>[r.id,r.value*multiplier]));}
function wholePanelLimit(w,roster,limit){for(let n=limit;n>=Math.max(0,limit-1000);n--){const a=wholePanels(w,n),b=wholePanels(w,n,w.values.monthlyAttrition/100);if(evaluateDemand(w,roster,n,n*w.values.monthlyAttrition/100,{assigned:a,newAssigned:b}).fits)return n;}return 0;}
export function calculateWorksheet(worksheet){
 const w=cleanWorksheet(worksheet);if(!w.staffing?.panels)return previous.calculateWorksheet(w);
 const v=w.values,z=w.staffing.settings,roster=rosterCapacity(w,z.matureMonth),limit=membershipLimit(w,roster,{onboardingRate:ratio(v.monthlyAttrition,100)}),safeMembers=known(limit)?wholePanelLimit(w,roster,Math.floor(limit+1e-6)):null;
 const members=known(v.members)&&known(safeMembers)?(w.staffing.enrollmentMode==='stress'?v.members:Math.min(v.members,safeMembers)):null;
 const onboarding=mul(members,ratio(v.monthlyAttrition,100)),demand=evaluateDemand(w,roster,members,onboarding,{assigned:wholePanels(w,members),newAssigned:wholePanels(w,members,v.monthlyAttrition/100)}),physical=evaluateDemand(w,roster,members,onboarding,{target:false,assigned:wholePanels(w,members),newAssigned:wholePanels(w,members,v.monthlyAttrition/100)}),result=economics(w,members,roster.pay,addedCosts(w));
 const warnings=[...roster.warnings,'Assigned-panel limits are planning arithmetic, not demand evidence. Thin-coverage days and dated leave require appointment-level validation.'];if(z.escalationPercent>0&&roster.daily.some(d=>d.physicians>0&&d.ownerPhysicians===0))warnings.push('Entered owner escalation requires work on owner off days. No off-day commitment is assumed; the daily test flags that gap.');if(w.staffing.incentives)warnings.push('Profit sharing is a proposed, quality-conditioned assumption. Annual prepayments and ancillary sales do not directly earn bonuses. Final awards require agreed terms and funding.');const missing=settingsMissing(w);if(missing.length)warnings.push('Unknown staffing inputs: '+missing.join(', ')+'. Dependent results remain incomplete.');
 if(limit===null&&roster.complete&&v.attendance===0&&z.urgentRate===0)warnings.push('Zero recurring care demand cannot establish a finite mature panel. Enter a workload basis before interpreting capacity or revenue.');
 if(w.staffing.enrollmentMode==='stress')warnings.push('UNCONSTRAINED STRESS CASE: requested members and revenue may exceed the roster. These amounts assume delivery, not a feasible forecast.');
 if(known(safeMembers)&&known(v.members)&&v.members>safeMembers)warnings.push('Requested enrollment exceeds assigned-panel or protected team-access capacity. Constrained mode uses '+safeMembers+' members or fewer for revenue.');
 if(roster.roles.some(r=>r.annualPay===null))warnings.push('A physician compensation amount is unknown. Financial results remain incomplete.');
 if(w.customRows.some(r=>r.treatment!=='note'&&r.value===null))warnings.push('An added financial amount is blank. Affected totals remain incomplete.');
 if(known(result.targetMembers)&&known(safeMembers)&&result.targetMembers>safeMembers)warnings.push('The target margin requires more members than the roster supports at the access target.');
 if(known(result.margin)&&known(v.targetMargin)&&result.margin<v.targetMargin)warnings.push('Operating margin is below the selected target.');
 if(v.coreMinutes>v.coreBlock||v.extendedMinutes>v.extendedBlock)warnings.push('Physician time exceeds its calendar block.');
 if(w.staffing.roles.some(r=>r.stages.length))warnings.push('Stages are planning dates, not readiness approvals. Replacement training and a new location need financing and continuity arrangements.');
 return {...result,engine:w.engine,panels:demand.panels,roster,demand,requestedMembers:v.members,modeledMembers:members,safeMembers,routineCapacity:roster.routineCapacity,routineDemand:demand.routineDemand,utilization:physical.pressure,worstDayUtilization:demand.pressure,availabilityHours:roster.availabilityHours,routineHours:roster.bookableHours,protectedHours:roster.protectedHours,activeMonthlyHours:demand.activeHours,escalationHours:demand.escalationHours,physicianDays:roster.complete?sum(...roster.roles.map(r=>r.weekdays.filter(Boolean).length*r.weeks)):null,deferredMembers:known(members)&&known(v.members)?Math.max(0,v.members-members):null,warnings};
}
function emptyLaunch(warnings){return {available:false,rows:[],warnings,...Object.fromEntries(launchMetrics.map(([k])=>[k,null]))};}
export function calculateLaunchWorksheet(worksheet){
 const w=cleanWorksheet(worksheet);if(!w.staffing?.panels)return previous.calculateLaunchWorksheet(w);
 const v=w.values,s=w.staffing,c=prior.rowTotals(w.customRows);
 const required=['horizonMonths','openingMonth','members','initialMembers','monthlyNewMembers','monthlyAttrition','prepayShare','prepayDiscount','corePrice','extendedPrice','extendedMix','attendance','maxUtilization','extraShortVisits','extraLongVisits','extraShortMinutes','extraLongMinutes','extraShortPrice','extraLongPrice'];
 const missing=required.filter(k=>!known(v[k]));if(missing.length||v.horizonMonths===0||v.openingMonth===0)return emptyLaunch(['Complete enrollment/pricing and positive timing: '+missing.join(', ')+'. Zero and blank values remain saved.']);
 const share=v.prepayShare/100,blend=v.corePrice*(1-v.extendedMix/100)+v.extendedPrice*v.extendedMix/100,annualDues=blend*(1-v.prepayDiscount/100),churn=v.monthlyAttrition/100;
 const extra=sum(mul(v.extraShortVisits,v.extraShortPrice),mul(v.extraLongVisits,v.extraLongPrice),ratio(c.annualRevenue,12));
 const local=sum(v.support,v.occupancy,v.technology,v.marketing,v.other,v.burdenAdjustment,mul(v.platformFee,12),c.annualCost,addedCosts(w));
 const startup=sum(v.startupCapital,c.startup),rows=[],warnings=[];let monthlyMembers=0,cohorts=[],waitlist=0,cumulativeOperating=0,cumulativeRecovery=0,cashBalance=v.openingCash;
 let panelMembers=Object.fromEntries(s.roles.map(r=>[r.id,0])),panelWait={...panelMembers};const allocation=panelShares(w);
 for(let month=1;month<=v.horizonMonths;month++){
  const open=month>=v.openingMonth,roster=rosterCapacity(w,month,{partial:s.launchAccess==='staffed-days'});
  if(open&&!roster.complete)return emptyLaunch(['The month '+month+' roster or demand weights are incomplete. '+roster.warnings.join(' ')]);
  let refunds=0,annualCollections=0,lostMembers=0,newMembers=0,admittedForMonth={};
  if(open){
   lostMembers=monthlyMembers*churn;monthlyMembers-=lostMembers;
   for(const cohort of cohorts){const lost=cohort.members*churn;refunds+=lost*cohort.remaining*annualDues;lostMembers+=lost;cohort.members-=lost;if(cohort.remaining===0){annualCollections+=cohort.members*annualDues*12;cohort.remaining=12;}}
   for(const id in panelMembers)panelMembers[id]*=1-churn;
   const retained=monthlyMembers+cohorts.reduce((n,c)=>n+c.members,0);const applicants=month===v.openingMonth?v.initialMembers:v.monthlyNewMembers;
   for(const id in panelWait)panelWait[id]+=applicants*(allocation[id]??0);
   const admitted=admitPanels(w,roster,panelMembers,panelWait,Math.max(0,v.members-retained));
   if(admitted===null)return emptyLaunch(['Complete assigned-panel allocation and workload inputs.']);
   admittedForMonth=admitted;newMembers=Object.values(admitted).reduce((a,b)=>a+b,0);for(const id in panelMembers){panelMembers[id]+=admitted[id]??0;panelWait[id]-=admitted[id]??0;}
   waitlist=Object.values(panelWait).reduce((a,b)=>a+b,0);
   monthlyMembers+=newMembers*(1-share);if(newMembers*share>0){cohorts.push({members:newMembers*share,remaining:12});annualCollections+=newMembers*share*annualDues*12;}
  }
  const annualMembers=cohorts.reduce((n,c)=>n+c.members,0),members=monthlyMembers+annualMembers;
  const demand=open?evaluateDemand(w,roster,members,newMembers,{assigned:panelMembers,newAssigned:admittedForMonth}):null,physical=open?evaluateDemand(w,roster,members,newMembers,{target:false,assigned:panelMembers,newAssigned:admittedForMonth}):null;
  const unserved=open?(physical.complete&&physical.fits?0:null):0;
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
  rows.push({assignedPanels:structuredClone(panelMembers),assignedWaitlist:structuredClone(panelWait),panelDemand:demand?.panels,month,members,newMembers,lostMembers,waitlist,unserved,physicians:open?roster.physicians:0,capacity:open?roster.routineCapacity:0,demand:demand?.routineDemand??0,utilization:physical?.pressure??null,overCapacity:Boolean(physical&&!physical.fits),overTarget:Boolean(demand&&!demand.fits),revenue,receipts,refunds,costs,costsBeforeIncentives,incentiveCost:bonus.loaded,incentiveCash:bonus.cash,operatingResult,debtPayment,startupSpend,financing,cashMovement,cashBalance,cumulativeRecovery,cumulativeOperating,deferredRevenue,deliveryIncomplete});
 }
 const sustained=key=>{const i=rows.findIndex((r,i)=>r.month>=v.openingMonth&&r.revenue>0&&rows.slice(i).every(x=>known(x[key])&&x[key]>=-1e-6));return i<0?null:rows[i].month;};
 const all=key=>rows.every(r=>known(r[key])),total=key=>sum(...rows.map(r=>r[key])),minCash=all('cashBalance')?Math.min(...rows.map(r=>r.cashBalance)):null;
 if(settingsMissing(w).length)warnings.push('Blank staffing costs or inputs keep affected financial results incomplete. Membership and capacity can still calculate.');
 if(!known(startup))warnings.push('Startup spending is unknown; funding and investment recovery remain incomplete.');if(v.openingCash===null)warnings.push('Opening cash is unknown; remaining funding gap is incomplete.');
 if(rows.some(r=>r.deliveryIncomplete))warnings.push('Retained membership exceeds physical capacity in some months. No automatic transfers are assumed. Revenue/cash become incomplete until coverage is resolved.');
 if(rows.some(r=>r.overTarget))warnings.push('Some retained care obligations exceed the access buffer; new admissions pause.');
 if(s.enrollmentMode==='stress')warnings.push('UNCONSTRAINED STRESS CASE: launch revenue assumes delivery even when the roster cannot support it.');
 if(s.launchAccess==='staffed-days')warnings.push('Before full staffing, access is promised on staffed days only. Routine panels stay assigned. Team requests are modeled only on staffed days; patient acceptance is unproven.');
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
  if(w.staffing.panels)for(const r of w.staffing.roles)rows.push(['Assigned-panel allocation weight: '+r.name,w.staffing.panels.weights[r.id]??0]);
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
  if(m.panels){rows.push([],['ASSIGNED PANELS','Members','Routine panel limit']);for(const p of m.panels)rows.push([p.name,p.members,p.panelLimit]);rows.push([],['TEAM ACCESS BY WEEKDAY','Held encounters','Expected requests','Expected completed','Unused hours','Excess encounters']);for(const d of m.demand.daily)rows.push([d.day,d.reservedEncounters,d.additionalDemand,d.expectedCompleted,d.unusedReserveMinutes/60,d.excessEncounters]);for(const r of l.rows)for(const [id,n]of Object.entries(r.assignedPanels??{}))rows.push(['Launch panel',r.month,id,n,r.assignedWaitlist[id]]);}
  rows.push([],['MONTHLY LAUNCH'],monthlyColumns.map(c=>c[1]));for(const r of l.rows)rows.push(monthlyColumns.map(([k])=>r[k]??null));for(const warning of [...m.warnings,...l.warnings])rows.push(['Check',warning]);
 }for(const n of [...p.migrationNotes,...notes])rows.push(['Model note',n]);return rows;}
export function reviewText(state){return reviewRows(state).map(row=>row.map(x=>x===null?'Unknown':String(x)).join(' | ')).join('\n');}
const csvCell=x=>{let s=x===null?'Unknown':String(x);if(typeof x==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function worksheetCsv(state){return '\uFEFF'+reviewRows(state).map(r=>r.map(csvCell).join(',')).join('\r\n');}

export const schedulePresets=[['consecutive','Base: A Sunday–Thursday / B Tuesday–Saturday'],['fourth','Optional junior: add Friday–Monday']];
export function withSchedule(worksheet,key){
 if(!schedulePresets.some(([id])=>id===key))throw Error('Unknown schedule scenario.');
 const w=structuredClone(worksheet);if(!w.staffing?.demand)throw Error('Start the revised proposal to compare schedules.');
 const roles=w.staffing.roles;if(roles.some(r=>r.stages.length)||roles.length>4||roles[0]?.kind!=='owner'||roles[1]?.kind!=='associate'||roles[2]?.kind!=='associate'||(roles[3]&&roles[3].id!=='scenario-c'))throw Error('Schedule presets need the original owner and two associates without stages. Save this custom roster and start a revised proposal first.');
 roles[0].weekdays=[false,false,true,true,true,false,false];
 roles[1].weekdays=[true,true,true,true,true,false,false];
 roles[2].weekdays=[false,false,true,true,true,true,true];
 w.staffing.roles=roles.slice(0,3);
 if(key==='fourth'){const r=roles[3]??newRole('scenario-c','Optional junior — Friday–Monday',[true,true,false,false,false,true,true],w.staffing.settings.matureMonth);w.staffing.roles.push(r);if(w.staffing.panels)w.staffing.panels.weights[r.id]=138;}
 w.name=schedulePresets.find(([id])=>id===key)[1];w.basis='Ballpark estimates';return w;
}
