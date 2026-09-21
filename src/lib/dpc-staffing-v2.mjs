// Audited roster model. Earlier engines keep importing dpc-staffing.mjs. Monetary totals deliberately propagate unknown inputs.
export const known=x=>typeof x==='number'&&Number.isFinite(x);
export const sum=(...xs)=>xs.every(known)?xs.reduce((a,b)=>a+b,0):null;
export const mul=(...xs)=>xs.every(known)?xs.reduce((a,b)=>a*b,1):null;
export const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const f=(key,label,value,unit,min=0,max=1e8,step='any',help='')=>({key,label,value,unit,min,max,step,help});
export const roleFields=[
 f('startMonth','First paid month',1,'month',0,120,1,'Capacity begins only after the practice also opens. Zero or blank is an undefined start.'),
 f('endMonth','Final paid month',0,'month; 0 = no planned departure',0,120,1,'Departure removes capacity and pay after this month. Blank means unknown.'),
 f('weeks','Working weeks per year',46,'weeks/year',0,52),
 f('availableStart','Availability begins',9,'hour, 24-hour clock',0,24),
 f('availableEnd','Availability ends',21,'hour, 24-hour clock',0,24),
 f('bookStart','Routine booking begins',9,'hour, 24-hour clock',0,24),
 f('bookEnd','Routine appointments must finish by',18,'hour, 24-hour clock',0,24,'18 = 6 p.m. This earlier cutoff is an illustrative assumption.'),
 f('cap','Maximum total encounters per day',12,'encounters/day',0,100,1,'Includes routine, onboarding, urgent and visit-equivalent virtual encounters. Repeat visits count again.'),
 f('coreMultiplier','Short appointment-block multiplier',1,'times the shared short block',0,10,'any','Adjust this role independently. 1 uses the shared block; 2 doubles it. The derived minutes appear in the roster summary.'),
 f('extendedMultiplier','Long appointment-block multiplier',1,'times the shared long block',0,10,'any','Role-specific blocks change capacity. Pooled workload allocates appointments in proportion to role capacity.'),
 f('breakHours','Breaks inside booking window',1,'hours/day',0,24),
 f('adminHours','Messages and follow-up inside booking window',1,'hours/day',0,24),
 f('urgentHours','Total protected urgent reserve',1,'hours/day',0,24,'Protected capacity, not an assumption that this whole reserve is used.'),
 f('urgentInside','Urgent reserve inside booking window',1,'hours/day',0,24,'Remaining urgent reserve sits after/before routine bookings, within availability. Counted only once.'),
 f('managementHours','Management and training inside booking window',0,'hours/day',0,24),
 f('otherHours','Other protected time inside booking window',0,'hours/day',0,24),
 f('annualPay','Annual cash compensation',260000,'$/year',0,1e8,'any','Independent of availability and days. Salary begins at the start month, including paid leave.')
];
export const settingFields=[
 f('matureMonth','Month used for mature roster snapshot',12,'planning month',0,120,1,'Stage changes and departures affect the snapshot at this month.'),
 f('onboardingMinutes','Additional onboarding block',60,'minutes per new member',0,480,'any','Added once on joining, in addition to ongoing attendance. Enter 0 if attendance already includes onboarding.'),
 f('urgentRate','Urgent encounters per 100 members',5,'encounters/month',0,1000,'any','Illustrative utilization hypothesis, separate from routine attendance.'),
 f('urgentMinutes','Urgent encounter block',60,'minutes',0,480),
 f('escalationPercent','Urgent encounters needing owner escalation',10,'%',0,100),
 f('escalationMinutes','Additional owner work per escalation',20,'minutes',0,480,'any','Consumes owner urgent reserve. Off-day escalation coverage still needs an explicit agreement.'),
 f('noShowPercent','Routine bookings lost to no-shows',0,'%',0,100,'any','Attendance represents completed visits. Bookings = attended visits / show rate. Lost blocks are not reclaimed.'),
 f('extendedSupport','Additional evening/weekend support',null,'$/year',0,1e8,'any','Increment above existing local support cost. Unknown until costed; enter 0 only if already included.'),
 f('leaveRelief','Additional leave-relief expense',null,'$/year',0,1e8,'any','Does not create capacity by itself. Add a relief role to schedule it; avoid double-counting its pay here.'),
 f('recruiting','Recurring recruiting and development',null,'$/year',0,1e8,'any','Annual budget. One-time recruitment/setup belongs in startup spending or a custom startup row.'),
 f('extendedOccupancy','Additional extended-hours operating cost',null,'$/year',0,1e8,'any','Increment above existing utilities, occupancy and insurance assumptions.')
];
export function newRole(id,name,weekdays,startMonth,owner=false){return {id,name,kind:owner?'owner':'associate',weekdays:[...weekdays],coverage:'Onsite/remote arrangement to agree',stages:[],...Object.fromEntries(roleFields.map(f=>[f.key,f.value])),startMonth,availableEnd:owner?18:21,annualPay:owner?180000:260000,cap:owner?6:12};}
export const demandFields=[
 f('longVisitPercent','Long appointments as a share of routine visits',75,'%',0,100,'any','Independent of the percentage buying Extended membership. Default 75% preserves the earlier workload for comparison; measure the actual visit mix.'),
 f('routineFlexPercent','Routine demand that can move to available days',0,'%',0,100,'any','0% keeps patient-preferred days. 100% distributes routine/onboarding work in proportion to routine capacity. Urgent demand never follows this slider. Scheduling flexibility and continuity must be validated.')
];
export function cleanDemand(raw){if(raw===null)return null;if(!raw||typeof raw!=='object')throw Error('Missing visit-mix and scheduling assumptions.');if(!Array.isArray(raw.urgentWeights)||raw.urgentWeights.length!==7||raw.urgentWeights.some(x=>x!==null&&(!known(x)||x<0||x>100)))throw Error('Invalid urgent weekday demand weights.');return {...numeric(raw,demandFields),urgentWeights:[...raw.urgentWeights]};}
export function newStaffing(){return {settings:Object.fromEntries(settingFields.map(f=>[f.key,f.value])),weights:[1,2,2,2,2,2,1],launchAccess:'staffed-days',enrollmentMode:'constrained',roles:[newRole('owner','Physician owner',[false,true,false,true,false,true,false],2,true),newRole('associate-a','Associate A',[true,true,true,true,true,false,false],5),newRole('associate-b','Associate B',[false,false,true,true,true,true,true],11)]};}
const checkText=(x,label)=>{if(typeof x!=='string'||x.length>20000)throw Error('Invalid '+label);return x;};
function numeric(raw,defs){const result={};for(const f of defs){const x=raw?.[f.key];if(x!==null&&(!known(x)||x<f.min||x>f.max||(f.step===1&&!Number.isInteger(x))))throw Error('Invalid '+f.label);result[f.key]=x;}return result;}
function weekdays(raw){if(!Array.isArray(raw)||raw.length!==7||raw.some(x=>typeof x!=='boolean'))throw Error('Invalid weekday schedule');return [...raw];}
export function validateStaffing(raw){
 if(!raw||!Array.isArray(raw.roles)||!raw.roles.length||raw.roles.length>20)throw Error('Supply 1–20 physician roles.');
 if(!['staffed-days','seven-days'].includes(raw.launchAccess)||!['constrained','stress'].includes(raw.enrollmentMode))throw Error('Invalid enrollment or access policy.');
 const ids=new Set();const roles=raw.roles.map(r=>{
  if(typeof r.id!=='string'||!r.id||r.id.length>200||ids.has(r.id))throw Error('Duplicate or invalid physician role.');ids.add(r.id);
  if(!['owner','associate','replacement','relief'].includes(r.kind)||!Array.isArray(r.stages))throw Error('Invalid physician role or stages.');
  const role={...numeric(r,roleFields),id:r.id,name:checkText(r.name,'role name'),kind:r.kind,coverage:checkText(r.coverage,'coverage arrangement'),weekdays:weekdays(r.weekdays),stages:[]};
  const months=new Set();role.stages=r.stages.map(s=>{if(s.month!==null&&(!Number.isInteger(s.month)||s.month<0||s.month>120||months.has(s.month)))throw Error('Invalid or duplicate stage month.');months.add(s.month);return {month:s.month,label:checkText(s.label,'stage label'),weekdays:weekdays(s.weekdays),...numeric(s,roleFields.filter(f=>!['startMonth','endMonth'].includes(f.key)))};});return role;
 });
 if(roles.filter(r=>r.kind==='owner').length!==1)throw Error('Keep exactly one physician-owner role.');
 if(!Array.isArray(raw.weights)||raw.weights.length!==7||raw.weights.some(x=>x!==null&&(!known(x)||x<0||x>100)))throw Error('Invalid weekday demand weights.');
 return {settings:numeric(raw.settings,settingFields),demand:cleanDemand(raw.demand),weights:[...raw.weights],launchAccess:raw.launchAccess,enrollmentMode:raw.enrollmentMode,roles};
}
export function newStage(role){return {month:Math.min(120,Math.max(24,...role.stages.map(s=>(s.month??18)+6))),label:'Proposed leadership stage',weekdays:[...role.weekdays],...Object.fromEntries(roleFields.filter(f=>!['startMonth','endMonth'].includes(f.key)).map(f=>[f.key,role[f.key]]))};}
export function roleAt(role,month){
 if(!known(month)||month<=0||!known(role.startMonth)||role.startMonth<=0||role.endMonth===null||role.stages.some(s=>!known(s.month)||s.month<=0))return {unknown:true,...role};
 if(role.endMonth>0&&role.endMonth<role.startMonth)return {unknown:true,...role};
 if(month<role.startMonth||(role.endMonth>0&&month>role.endMonth))return null;
 let active={...role};for(const stage of [...role.stages].sort((a,b)=>a.month-b.month))if(month>=stage.month)active={...active,...stage};return active;
}
export function rosterCapacity(worksheet,month,{partial=false}={}){
 const s=worksheet.staffing,v=worksheet.values,z=s.settings,warnings=[];
 const active=s.roles.map(r=>roleAt(r,month)).filter(Boolean);
 const pay=sum(...active.map(r=>r.unknown?null:r.annualPay));
 const mix=s.demand?.longVisitPercent;
 const block=known(mix)&&known(v.coreBlock)&&known(v.extendedBlock)?v.coreBlock*(1-mix/100)+v.extendedBlock*mix/100:null;
 const daily=days.map((day,i)=>({day,index:i,physicians:0,ownerPhysicians:0,names:[],routineMinutes:0,routineCount:0,totalCount:0,urgentMinutes:0,ownerUrgent:0,availabilityHours:0,bookableHours:0,protectedHours:0,adminHours:0,managementHours:0,otherHours:0,breakHours:0}));
 const roles=[];let complete=known(block)&&block>0&&known(z.urgentMinutes)&&z.urgentMinutes>0;
 for(const r of active){
  const good=!r.unknown&&roleFields.filter(f=>f.key!=='annualPay').every(f=>known(r[f.key]))&&r.availableEnd>=r.availableStart&&r.bookEnd>=r.bookStart&&r.bookStart>=r.availableStart&&r.bookEnd<=r.availableEnd&&r.urgentInside<=r.urgentHours;
  let available=null,routineHours=null,routineCount=null,routineMinutes=null,roleBlock=null,actualBookableHours=null;
  if(good){
   available=r.availableEnd-r.availableStart;
   const booked=r.bookEnd-r.bookStart,inside=r.breakHours+r.adminHours+r.urgentInside+r.managementHours+r.otherHours;
   const outside=available-booked;
   if(inside>booked+1e-9||r.urgentHours-r.urgentInside>outside+1e-9){complete=false;warnings.push(r.name+': protected time does not fit within the entered windows.');}
   routineHours=Math.max(0,booked-inside);
   roleBlock=known(mix)&&known(v.coreBlock)&&known(v.extendedBlock)?v.coreBlock*r.coreMultiplier*(1-mix/100)+v.extendedBlock*r.extendedMultiplier*mix/100:null;
   if(!known(roleBlock)||roleBlock<=0||(mix<100&&v.coreBlock*r.coreMultiplier===0)||(mix>0&&v.extendedBlock*r.extendedMultiplier===0)){complete=false;warnings.push(r.name+': an active appointment type needs a positive block.');}
   if(v.coreMinutes>v.coreBlock*r.coreMultiplier||v.extendedMinutes>v.extendedBlock*r.extendedMultiplier)warnings.push(r.name+': planned physician time exceeds a role-specific appointment block.');
   // All reserved urgent encounters count toward the total cap. They are not routine inventory.
   routineCount=known(z.urgentMinutes)&&z.urgentMinutes>0?Math.max(0,r.cap-r.urgentHours*60/z.urgentMinutes):null;
   routineMinutes=known(block)&&block>0&&known(routineCount)&&roleBlock>0?Math.min(routineHours*60/roleBlock*block,routineCount*block):null;
   actualBookableHours=known(routineMinutes)?routineMinutes/block*roleBlock/60:null;
   if(r.cap*60+inside*60>available*60+1e-9)warnings.push(r.name+': '+r.cap+' one-hour routine bookings do not fit with protected time. The ceiling is not a booking promise.');
   if(r.weeks<52&&r.weekdays.some(Boolean))warnings.push(r.name+': '+(52-r.weeks)+' weeks without this role are not scheduled. Annual averages do not guarantee leave coverage.');
  }else{complete=false;warnings.push(r.name+': complete or correct the start/departure, stage, compensation and daily schedule inputs.');}
  const report={...r,available,routineHours,routineCount,routineMinutes,roleBlock,coreBlock:mul(v.coreBlock,r.coreMultiplier),extendedBlock:mul(v.extendedBlock,r.extendedMultiplier),worstHourBookings:known(routineHours)&&known(routineCount)?Math.min(Math.floor(routineHours),Math.floor(routineCount)):null,weightedRoutineVisits:known(routineMinutes)&&known(block)&&block>0?routineMinutes/block:null};roles.push(report);
  if(!good||!known(routineMinutes))continue;
  for(let i=0;i<7;i++)if(r.weekdays[i]&&r.weeks>0){
   const d=daily[i],factor=r.weeks/12;d.physicians++;d.names.push(r.name);if(r.kind==='owner')d.ownerPhysicians++;
   d.routineMinutes+=routineMinutes*factor;d.routineCount+=routineCount*factor;d.totalCount+=r.cap*factor;d.urgentMinutes+=Math.min(r.urgentHours*60,r.cap*z.urgentMinutes)*factor;if(r.kind==='owner')d.ownerUrgent+=r.urgentHours*60*factor;
   d.availabilityHours+=available*factor;d.bookableHours+=actualBookableHours*factor;d.protectedHours+=(r.adminHours+r.urgentHours+r.managementHours+r.otherHours)*factor;d.adminHours+=r.adminHours*factor;d.managementHours+=r.managementHours*factor;d.otherHours+=r.otherHours*factor;d.breakHours+=r.breakHours*factor;
  }
 }
 if(active.length>3)warnings.push('This month has '+active.length+' paid physicians. Additional support, rooms and recruitment must be budgeted; more capacity does not establish member demand.');
 if(s.weights.some(x=>x===null)||sum(...s.weights)===0){complete=false;warnings.push('Enter weekday demand weights with a positive total.');}
 const anyStaffed=daily.some(d=>d.physicians>0);
 const included=s.weights.map((weight,i)=>partial&&anyStaffed&&daily[i].physicians===0?0:weight),total=sum(...included);
 if(!known(total)||total<=0)complete=false;
 const urgentIncluded=s.demand.urgentWeights.map((weight,i)=>partial&&anyStaffed&&daily[i].physicians===0?0:weight),urgentTotal=sum(...urgentIncluded),flex=s.demand.routineFlexPercent;
 if(!known(urgentTotal)||urgentTotal<=0||!known(flex)){complete=false;warnings.push('Complete routine flexibility and urgent weekday weights with a positive total.');}
 const totalRoutine=sum(...daily.map(d=>d.routineMinutes));
 daily.forEach((d,i)=>{d.weight=known(total)&&total>0?included[i]/total:null;d.urgentWeight=known(urgentTotal)&&urgentTotal>0?urgentIncluded[i]/urgentTotal:null;d.routineWeight=known(d.weight)&&known(flex)?(1-flex/100)*d.weight+flex/100*(totalRoutine>0?d.routineMinutes/totalRoutine:d.weight):null;d.routineCapacity=complete?d.routineMinutes/block:null;});
 const ownerUrgent=sum(...daily.map(d=>d.ownerUrgent));
 const uncovered=days.filter((_,i)=>daily[i].physicians===0),ownerOff=days.filter((_,i)=>daily[i].physicians>0&&daily[i].ownerPhysicians===0);
 if(partial&&uncovered.length)warnings.push('Limited launch access: demand is redistributed to staffed days. Closed: '+uncovered.join(', ')+'. Patient acceptance and cross-coverage are unvalidated.');
 if(ownerOff.length&&z.escalationPercent>0)warnings.push('Owner escalation on '+ownerOff.join(', ')+' needs a separate response arrangement. Modeled owner effort is allocated to owner workdays and does not establish urgent response time.');
 return {complete,pay,roles,daily,block,ownerUrgent,uncovered,warnings,physicians:active.length,routineCapacity:complete?sum(...daily.map(d=>d.routineMinutes))/block:null,availabilityHours:complete?sum(...daily.map(d=>d.availabilityHours))*12:null,bookableHours:complete?sum(...daily.map(d=>d.bookableHours))*12:null,protectedHours:complete?sum(...daily.map(d=>d.protectedHours))*12:null};
}
export function evaluateDemand(w,roster,members,newMembers=0,{target=true}={}){
 const v=w.values,z=w.staffing.settings;
 const needed=[members,newMembers,v.attendance,v.maxUtilization,v.extraShortVisits,v.extraLongVisits,v.extraShortMinutes,v.extraLongMinutes,z.onboardingMinutes,z.urgentRate,z.urgentMinutes,z.escalationPercent,z.escalationMinutes,z.noShowPercent];
 if(!roster.complete||!needed.every(known)||z.noShowPercent>=100)return {complete:false,fits:false,pressure:null,daily:[],routineDemand:null,activeHours:null,escalationHours:null};
 const factor=target?v.maxUtilization/100:1;
 const routine=members*v.attendance/100/(1-z.noShowPercent/100);
 const onboardCount=z.onboardingMinutes>0?newMembers:0;
 const minutes=routine*roster.block+newMembers*z.onboardingMinutes+v.extraShortVisits*v.extraShortMinutes+v.extraLongVisits*v.extraLongMinutes;
 const encounters=routine+onboardCount+v.extraShortVisits+v.extraLongVisits;
 const urgent=members*z.urgentRate/100*z.urgentMinutes;
 const escalation=members*z.urgentRate/100*z.escalationPercent/100*z.escalationMinutes;
 let pressure=0;
 const ratio=(need,cap)=>need<=1e-7?0:cap>0?need/cap:Infinity;
 const daily=roster.daily.map(d=>{
  const esc=roster.ownerUrgent>0?escalation*d.ownerUrgent/roster.ownerUrgent:0;
  const p=Math.max(ratio(minutes*d.routineWeight,d.routineMinutes*factor),ratio(encounters*d.routineWeight,d.routineCount*factor),ratio(encounters*d.routineWeight+members*z.urgentRate/100*d.urgentWeight,d.totalCount*factor),ratio(urgent*d.urgentWeight+esc,d.urgentMinutes*factor));pressure=Math.max(pressure,p);
  return {...d,routineDemand:routine*d.routineWeight,onboarding:newMembers*d.routineWeight,urgentDemand:members*z.urgentRate/100*d.urgentWeight,pressure:Number.isFinite(p)?p*100:null,over:p>1+1e-7};
 });
 pressure=Math.max(pressure,ratio(escalation,roster.ownerUrgent*factor));
 const activeHours=sum(...roster.daily.map(d=>d.routineMinutes>0?minutes*d.routineWeight*d.bookableHours/d.routineMinutes:0))+urgent/60+escalation/60+sum(...roster.daily.map(d=>d.adminHours+d.managementHours+d.otherHours));
 return {complete:true,fits:pressure<=1+1e-7,pressure:Number.isFinite(pressure)?pressure*100:null,daily,routineDemand:routine,escalationHours:escalation/60,activeHours};
}
export function membershipLimit(w,roster,{retained=0,onboardingRate=0,maximum=1e6,target=true}={}){
 if(!known(retained)||!known(onboardingRate)||!known(maximum)||!roster.complete)return null;
 // No recurring or replacement workload cannot establish a finite mature panel.
 if(maximum===1e6&&w.values.attendance===0&&w.staffing.settings.urgentRate===0&&(onboardingRate===0||w.staffing.settings.onboardingMinutes===0))return null;
 const test=n=>evaluateDemand(w,roster,n,retained>0?Math.max(0,n-retained):n*onboardingRate,{target});
 if(!test(0).complete)return null;
 if(!test(0).fits)return 0;
 let lo=0,hi=maximum;for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(test(mid).fits)lo=mid;else hi=mid;}return lo;
}
export function addedCosts(w){return sum(...['extendedSupport','leaveRelief','recruiting','extendedOccupancy'].map(k=>w.staffing.settings[k]));}
