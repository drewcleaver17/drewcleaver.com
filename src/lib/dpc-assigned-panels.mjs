// R09: continuity panels and independently protected daily team access.
import * as prior from './dpc-staffing-v3.mjs';
export * from './dpc-staffing-v3.mjs';
const {known,sum,days}=prior;
export const demandFields=prior.demandFields.filter(f=>f.key!=='routineFlexPercent');
export function validateStaffing(raw){
 const clean=prior.validateStaffing(raw);
 if(!raw.panels||raw.panels.version!==1||!raw.panels.weights)throw Error('Missing assigned-panel allocation.');
 const weights={};for(const r of clean.roles){const v=raw.panels.weights[r.id]??0;if(v!==null&&(!known(v)||v<0||v>1e8))throw Error('Invalid panel allocation.');weights[r.id]=v;}
 return {...clean,incentives:raw.incentives,panels:{version:1,weights}};
}
export function panelShares(w){const weights=w.staffing.panels.weights,total=sum(...w.staffing.roles.map(r=>weights[r.id]??0));return Object.fromEntries(w.staffing.roles.map(r=>[r.id,known(total)&&total>0?(weights[r.id]??0)/total:null]));}
export function rosterCapacity(w,month,opts={}){
 const r=prior.rosterCapacity(w,month,opts);r.warnings=r.warnings.filter(x=>!x.includes('one-hour routine')&&!x.includes('Owner escalation'));
 if(Object.values(panelShares(w)).some(x=>!known(x)))r.complete=false;
 return r;
}
const ratio=(n,c)=>n<=1e-7?0:c>0?n/c:Infinity;
export function evaluateDemand(w,roster,members,newMembers=0,{target=true,assigned=null,newAssigned=null}={}){
 const v=w.values,z=w.staffing.settings,shares=panelShares(w),factor=target?v.maxUtilization/100:1;
 const needed=[members,newMembers,v.attendance,v.maxUtilization,v.extraShortVisits,v.extraLongVisits,v.extraShortMinutes,v.extraLongMinutes,z.onboardingMinutes,z.urgentRate,z.urgentMinutes,z.escalationPercent,z.escalationMinutes,z.noShowPercent];
 if(!roster.complete||!needed.every(known)||z.noShowPercent>=100)return {complete:false,fits:false,pressure:null,daily:[],panels:[],routineDemand:null,activeHours:null};
 const assignedN=assigned??Object.fromEntries(Object.entries(shares).map(([id,p])=>[id,members*p]));
 const assignedNew=newAssigned??Object.fromEntries(Object.entries(shares).map(([id,p])=>[id,newMembers*p]));
 let pressure=0,routineDemand=0,routineWork=0;
 const daily=roster.daily.map(d=>({...d,routineDemand:0,onboarding:0,pressure:0,over:false}));
 const panels=w.staffing.roles.map(role=>{
  const r=roster.roles.find(r=>r.id===role.id),n=assignedN[role.id]??0,newN=assignedNew[role.id]??0;
  const booked=n*v.attendance/100/(1-z.noShowPercent/100),onCount=z.onboardingMinutes>0?newN:0;
  const block=r?.roleBlock??roster.block,minutes=booked*block+newN*z.onboardingMinutes,encounters=booked+onCount;
  const on=r?.weekdays??days.map(()=>false),count=on.filter(Boolean).length,weightTotal=sum(...w.staffing.weights.filter((_,i)=>on[i]));
  let p=0;const perDay=days.map((day,i)=>{
   const share=on[i]&&weightTotal>0?w.staffing.weights[i]/weightTotal:0;
   const cap=on[i]?(r.weightedRoutineVisits*r.roleBlock*r.weeks/12):0,slots=on[i]?r.routineCount*r.weeks/12:0;
   const load=Math.max(ratio(minutes*share,cap*factor),ratio(encounters*share,slots*factor));p=Math.max(p,load);
   daily[i].routineDemand+=booked*share;daily[i].onboarding+=newN*share;daily[i].pressure=Math.max(daily[i].pressure,load*100);
   return {day,on:!!on[i],bookings:booked*share,onboarding:newN*share,minutes:minutes*share,capacityMinutes:cap,pressure:Number.isFinite(load)?load*100:null};
  });
  if((booked>0||onCount>0)&&(!r||count===0||weightTotal<=0||r.weeks===0))p=Infinity;
  pressure=Math.max(pressure,p);routineDemand+=booked;routineWork+=minutes/60;
  // Standalone mature panel limit, before team-access constraints; replacement onboarding included.
  const perMemberMinutes=v.attendance/100/(1-z.noShowPercent/100)*block+v.monthlyAttrition/100*z.onboardingMinutes;
  const perMemberCount=v.attendance/100/(1-z.noShowPercent/100)+(z.onboardingMinutes>0?v.monthlyAttrition/100:0);
  let limit=Infinity;for(let i=0;i<7;i++)if(on[i]){const share=weightTotal>0?w.staffing.weights[i]/weightTotal:0;if(share>0)limit=Math.min(limit,perDay[i].capacityMinutes*factor/(perMemberMinutes*share),r.routineCount*r.weeks/12*factor/(perMemberCount*share));}
  if(!r||!count)limit=0;
  return {id:role.id,name:role.name,members:n,newMembers:newN,allocationPercent:(shares[role.id]??0)*100,routineMonthly:r?count*r.weightedRoutineVisits*r.weeks/12:0,panelLimit:Number.isFinite(limit)?Math.floor(limit+1e-7):null,pressure:Number.isFinite(p)?p*100:null,over:p>1+1e-7,daily:perDay};
 });
 // Extra paid visits are additional team encounters in the protected reserve, not routine inventory.
 const extraMinutes=v.extraShortVisits*v.extraShortMinutes+v.extraLongVisits*v.extraLongMinutes;
 const extraCount=v.extraShortVisits+v.extraLongVisits;
 let completed=0,excess=0,unused=0,escalationHours=0;
 for(const d of daily){
  const urgent=members*z.urgentRate/100*d.urgentWeight,extra=extraCount*d.urgentWeight;
  const escalation=urgent*z.escalationPercent/100*z.escalationMinutes;
  // Escalation can only consume owner capacity on the day requested; never shift to a day off.
  const escLoad=ratio(escalation,d.ownerUrgent),minutes=urgent*z.urgentMinutes+extraMinutes*d.urgentWeight+escalation;
  const load=Math.max(ratio(minutes,d.urgentMinutes),ratio(urgent+extra,d.urgentMinutes/z.urgentMinutes),escLoad);pressure=Math.max(pressure,load);escalationHours+=escalation/60;
  const fraction=minutes>0?Math.min(1,d.urgentMinutes/minutes,(urgent+extra)>0?(d.urgentMinutes/z.urgentMinutes)/(urgent+extra):1,escLoad>0?1/escLoad:1):1;
  Object.assign(d,{urgentDemand:urgent,additionalDemand:urgent+extra,reservedEncounters:d.urgentMinutes/z.urgentMinutes,expectedCompleted:(urgent+extra)*fraction,completedMinutes:minutes*fraction,unusedReserveMinutes:Math.max(0,d.urgentMinutes-minutes*fraction),excessEncounters:(urgent+extra)*(1-fraction),escalationMinutes:escalation,pressure:Math.max(d.pressure,load*100),over:d.pressure>100+1e-5||load>1+1e-7});
  if(!Number.isFinite(d.pressure))d.pressure=null;completed+=d.expectedCompleted;excess+=d.excessEncounters;unused+=d.unusedReserveMinutes;
 }
 return {complete:true,fits:pressure<=1+1e-7,pressure:Number.isFinite(pressure)?pressure*100:null,daily,panels,routineDemand,expectedCompleted:completed,excessEncounters:excess,unusedReserveMinutes:unused,escalationHours,activeHours:routineWork+sum(...daily.map(d=>d.completedMinutes))/60+sum(...daily.map(d=>d.adminHours+d.managementHours+d.otherHours))};
}
export function membershipLimit(w,roster,{retained=0,onboardingRate=0,maximum=1e6,target=true}={}){
 if(!known(retained)||!known(onboardingRate)||!known(maximum)||!roster.complete)return null;
 if(maximum===1e6&&w.values.attendance===0&&w.staffing.settings.urgentRate===0&&(onboardingRate===0||w.staffing.settings.onboardingMinutes===0))return null;
 const test=n=>evaluateDemand(w,roster,n,retained>0?Math.max(0,n-retained):n*onboardingRate,{target});
 if(!test(0).complete)return null;if(!test(0).fits)return 0;let lo=0,hi=maximum;for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(test(mid).fits)lo=mid;else hi=mid;}return lo;
}
export function admitPanels(w,roster,retained,waiting,remaining){
 const ids=w.staffing.roles.map(r=>r.id),total=x=>Object.values(x).reduce((a,b)=>a+b,0),base=total(retained),zero=Object.fromEntries(ids.map(id=>[id,0]));
 const test=add=>{const d=evaluateDemand(w,roster,base+total(add),total(add),{assigned:Object.fromEntries(ids.map(id=>[id,(retained[id]??0)+(add[id]??0)])),newAssigned:add});if(d.panels.some(p=>p.panelLimit!==null&&p.members>p.panelLimit+1e-7))d.fits=false;return d;};
 if(!test(zero).complete)return null;if(w.staffing.launchAccess==='seven-days'&&roster.uncovered.length)return zero;if(!test(zero).fits)return zero;
 const add={...zero};
 // Each requested panel keeps its own waitlist; no applicants silently move to another doctor.
 for(const id of ids){if(!roster.roles.some(r=>r.id===id))continue;let lo=0,hi=Math.min(waiting[id]??0,remaining);for(let i=0;i<35;i++){let mid=(lo+hi)/2;if(test({...zero,[id]:mid}).fits)lo=mid;else hi=mid;}add[id]=lo;}
 let lo=0,hi=Math.min(1,remaining/Math.max(total(add),1e-9));for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(test(Object.fromEntries(ids.map(id=>[id,add[id]*mid]))).fits)lo=mid;else hi=mid;}
 return Object.fromEntries(ids.map(id=>[id,add[id]*lo]));
}
