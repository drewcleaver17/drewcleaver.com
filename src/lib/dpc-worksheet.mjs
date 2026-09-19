import {fields as originalFields, groups as originalGroups, reference, metrics, launchMetrics, monthlyColumns, formatMetric, MODEL_NOTES, validateState as validateEarlier} from './dpc-model.mjs';
import {computeLaunch} from './dpc-launch.mjs';
export {reference,metrics,launchMetrics,monthlyColumns,formatMetric};
export const MODEL_VERSION='dpc-2026-09-v3';
export const bases=['Reference assumptions','Ballpark estimates','Actuals and estimates','Actual practice figures'];
export const fields=originalFields.map(f=>({...f,min:Math.min(0,f.min),nullable:true}));
export const groups=originalGroups.map((g,i)=>({...g,note:i===0?'Start with the illustrative figures and replace any of them. Zero means none; an empty cell means unknown.':g.note,fields:g.fields.map(f=>fields.find(x=>x.key===f.key))}));
export const treatments=[
 ['note','Reference only — no financial effect'],
 ['practice_monthly_cost','Practice expense — $ per month'],
 ['practice_annual_cost','Practice expense — $ per year'],
 ['practice_monthly_revenue','Practice revenue — $ per month'],
 ['practice_annual_revenue','Practice revenue — $ per year'],
 ['practice_startup_cost','Practice startup expense — $ once'],
 ['platform_annual_cost','Platform expense — $ per year, whole network'],
 ['platform_annual_revenue','Platform revenue — $ per year, whole network']
];
export const notes=[...MODEL_NOTES.filter(x=>!x.startsWith('All reference')&&!x.startsWith('Local saving')),
 'Every assumption may be empty or zero. Empty means unknown. Calculations depending on missing values remain incomplete; saving and exporting still work. Zero calendar blocks or timing months cannot establish a schedule.',
 'Added rows affect money only when a financial treatment is selected. Financial rows use USD; reference rows may contain any unit or no number. Recurring practice rows start with the existing cost-start or opening month, startup rows use the startup spending month. Annual recurring figures are spread over 12 months.',
 'Added platform rows are whole-network annual external amounts. Use the existing platform fee for practice-to-platform transfers so the combined result eliminates them. Added revenue does not automatically add appointment capacity.',
 'The dated PDF remains the reference illustration. This worksheet is edited and saved independently. Older comparisons preserve both sets of inputs, which can be opened one at a time.',
 'Saving stays in this browser and device. JSON exports contain the active worksheet, preserved earlier worksheets, notes and feedback. Nothing is automatically transmitted. Keep patient information out of this tool.'
];
const known=x=>typeof x==='number'&&Number.isFinite(x);
const sum=(...xs)=>xs.every(known)?xs.reduce((a,b)=>a+b,0):null;
const mul=(...xs)=>xs.every(known)?xs.reduce((a,b)=>a*b,1):null;
const div=(a,b)=>known(a)&&known(b)&&b>0?a/b:null;
const map=(x,fn)=>known(x)?fn(x):null;
const difference=(a,b)=>sum(a,mul(-1,b));
const text=(x,label)=>{if(typeof x!=='string'||x.length>20000)throw new Error('Invalid '+label+'.');return x;};
export function blankRow(id){return {id,category:'',label:'',value:null,unit:'',treatment:'note',notes:''};}
export function newState(){return {schemaVersion:3,modelVersion:MODEL_VERSION,name:'DPC working model',author:'',updatedAt:null,feedback:'',migrationNotes:[],preservedWorksheets:[],worksheet:{name:'Working assumptions',basis:'Reference assumptions',launchBasis:'Reference assumptions',period:'',notes:'',values:{...reference},customRows:[]}};}
function validateWorksheet(raw){
 if(!raw||!raw.values||!Array.isArray(raw.customRows))throw new Error('Missing worksheet inputs.');
 if(!bases.includes(raw.basis)||!bases.includes(raw.launchBasis))throw new Error('Invalid input basis.');
 const w={name:text(raw.name,'worksheet name'),basis:raw.basis,launchBasis:raw.launchBasis,period:text(raw.period,'reporting period'),notes:text(raw.notes,'source notes'),values:{},customRows:[]};
 for(const f of fields){const v=raw.values[f.key];if(v!==null&&(!known(v)||v<f.min||v>f.max||(f.step===1&&!Number.isInteger(v))))throw new Error('Invalid '+f.label+'. Use an empty cell or a number from '+f.min+' to '+f.max+'.');w.values[f.key]=v;}
 const ids=new Set();
 for(const row of raw.customRows){if(!row||typeof row.id!=='string'||!row.id||row.id.length>200||ids.has(row.id))throw new Error('Invalid or duplicate custom row.');ids.add(row.id);
  if(!treatments.some(t=>t[0]===row.treatment))throw new Error('Unknown custom-row calculation.');
  if(row.value!==null&&(!known(row.value)||Math.abs(row.value)>1e9))throw new Error('Invalid custom-row value.');
  const clean={id:row.id,category:text(row.category,'row category'),label:text(row.label,'row label'),value:row.value,unit:text(row.unit,'row unit'),treatment:row.treatment,notes:text(row.notes,'row notes')};
  if(clean.treatment!=='note'&&clean.unit!=='USD')throw new Error('Financial rows must use USD.');w.customRows.push(clean);
 }
 return w;
}
export function validateState(raw){
 if(raw?.schemaVersion===1||raw?.schemaVersion===2){
  const old=validateEarlier(raw),s=newState();for(const key of ['name','author','feedback','updatedAt'])s[key]=old[key];
  s.worksheet={...old.scenarios[0],values:{...old.scenarios[0].values},customRows:[]};
  s.preservedWorksheets=[{...old.scenarios[1],values:{...old.scenarios[1].values},customRows:[]}];
  s.migrationNotes=[...(old.migration?[old.migration.note]:[]),'The earlier comparison has become separate worksheets. The first column is open; the second is retained under Earlier inputs below. All original values, names, periods, notes and feedback are preserved. Open either worksheet individually; exports include both.'];return s;
 }
 if(!raw||raw.schemaVersion!==3||raw.modelVersion!==MODEL_VERSION)throw new Error('Unsupported review-file version.');
 const s=newState();for(const key of ['name','author','feedback'])s[key]=text(raw[key],key);
 if(!Array.isArray(raw.preservedWorksheets)||!Array.isArray(raw.migrationNotes))throw new Error('Invalid saved worksheet collection.');
 s.worksheet=validateWorksheet(raw.worksheet);s.preservedWorksheets=raw.preservedWorksheets.map(validateWorksheet);s.migrationNotes=raw.migrationNotes.map(x=>text(x,'migration note'));
 s.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;return s;
}
export function openPreserved(state,index){const s=validateState(state);if(!Number.isInteger(index)||!s.preservedWorksheets[index])throw new Error('Choose an earlier worksheet.');[s.worksheet,s.preservedWorksheets[index]]=[s.preservedWorksheets[index],s.worksheet];return s;}
export function rowTotals(rows){
 const buckets=Object.fromEntries(treatments.slice(1).map(([k])=>[k,[]]));for(const r of rows)if(r.treatment!=='note')buckets[r.treatment].push(r.value);
 const totals=Object.fromEntries(Object.entries(buckets).map(([k,x])=>[k,sum(...x)]));
 return {annualCost:sum(mul(totals.practice_monthly_cost,12),totals.practice_annual_cost),annualRevenue:sum(mul(totals.practice_monthly_revenue,12),totals.practice_annual_revenue),startup:totals.practice_startup_cost,platformCost:totals.platform_annual_cost,platformRevenue:totals.platform_annual_revenue};
}
export function calculateWorksheet(worksheet){
 const w=validateWorksheet(worksheet),v=w.values,c=rowTotals(w.customRows);
 const mix=div(v.extendedMix,100),blend=sum(mul(v.corePrice,difference(1,mix)),mul(v.extendedPrice,mix));
 const netDues=mul(blend,difference(1,mul(div(v.prepayShare,100),div(v.prepayDiscount,100))));
 const block=sum(mul(v.coreBlock,difference(1,mix)),mul(v.extendedBlock,mix));
 const protectedHours=sum(v.breakHours,v.urgentHours,v.adminHours);
 const ownerHours=map(difference(v.ownerHours,protectedHours),x=>Math.max(0,x)),associateHours=map(difference(v.associateHours,protectedHours),x=>Math.max(0,x));
 const ownerDays=mul(v.ownerDays,v.ownerWeeks),associateDays=mul(v.associates,v.associateDays,v.associateWeeks),physicianDays=sum(ownerDays,associateDays);
 const roleMinutes=hours=>known(hours)&&known(v.dailyVisitCap)&&known(block)&&block>0?Math.min(v.dailyVisitCap*block,hours*60):null;
 const capacityMinutes=div(sum(mul(ownerDays,roleMinutes(ownerHours)),mul(associateDays,roleMinutes(associateHours))),12);
 const routineCapacity=div(capacityMinutes,block),routineDemand=mul(v.members,div(v.attendance,100));
 const extraMinutes=sum(mul(v.extraShortVisits,v.extraShortMinutes),mul(v.extraLongVisits,v.extraLongMinutes));
 const demandMinutes=sum(mul(routineDemand,block),extraMinutes),utilization=mul(div(demandMinutes,capacityMinutes),100);
 const extraRevenue=sum(mul(sum(mul(v.extraShortVisits,v.extraShortPrice),mul(v.extraLongVisits,v.extraLongPrice)),12),c.annualRevenue);
 const revenue=sum(mul(v.members,netDues,12),extraRevenue),physicianPay=sum(v.ownerPay,mul(v.associates,v.associatePay));
 const physicianBurden=sum(mul(physicianPay,div(v.burdenRate,100)),v.burdenAdjustment);
 const costs=sum(physicianPay,physicianBurden,v.support,v.occupancy,v.technology,v.marketing,v.other,mul(v.platformFee,12),c.annualCost),surplus=difference(revenue,costs);
 const breakEvenMembers=map(div(difference(costs,extraRevenue),mul(netDues,12)),x=>Math.max(0,Math.ceil(x)));
 const targetMembers=map(div(difference(div(costs,difference(1,div(v.targetMargin,100))),extraRevenue),mul(netDues,12)),x=>Math.max(0,Math.ceil(x)));
 const safeMembers=map(div(difference(mul(capacityMinutes,div(v.maxUtilization,100)),extraMinutes),mul(block,div(v.attendance,100))),x=>Math.max(0,Math.floor(x)));
 const platformRevenue=sum(mul(v.locations,v.platformFee,12),c.platformRevenue);
 const platformSurplus=difference(platformRevenue,sum(v.centralOverhead,mul(v.locations,v.platformCostPerSite),c.platformCost));
 const warnings=[];
 const missing=fields.filter(f=>v[f.key]===null).map(f=>f.label);
 if(missing.length)warnings.push('Unknown inputs: '+missing.join(', ')+'. Dependent results remain incomplete; your worksheet can still be saved and exported.');
 if(w.customRows.some(r=>r.treatment!=='note'&&r.value===null))warnings.push('An added financial row has no value. Its affected financial totals remain incomplete. Enter zero only if the amount is none.');
 if(v.coreBlock===0||v.extendedBlock===0||v.extraShortMinutes===0||v.extraLongMinutes===0)warnings.push('A zero appointment block does not define a usable booking. Review calendar durations before relying on capacity.');
 if(known(physicianBurden)&&physicianBurden<0)warnings.push('Physician employment costs are negative. Review the fixed adjustment.');
 if(known(v.coreMinutes)&&known(v.coreBlock)&&v.coreMinutes>v.coreBlock||known(v.extendedMinutes)&&known(v.extendedBlock)&&v.extendedMinutes>v.extendedBlock)warnings.push('Physician time exceeds its calendar block.');
 if(known(protectedHours)&&((v.ownerDays>0&&known(v.ownerHours)&&protectedHours>v.ownerHours)||(v.associates>0&&v.associateDays>0&&known(v.associateHours)&&protectedHours>v.associateHours)))warnings.push('Protected time exceeds the working day. That role has no routine capacity.');
 if(capacityMinutes===0)warnings.push('There is no routine appointment capacity.');
 if(known(utilization)&&utilization>100)warnings.push('Visit demand exceeds routine capacity. Revenue assumes all promised care can be delivered.');
 else if(known(utilization)&&known(v.maxUtilization)&&utilization>v.maxUtilization)warnings.push('Routine utilization exceeds the selected access target.');
 if(v.attendance===0)warnings.push('Zero attendance cannot establish a safe enrollment limit.');
 if(netDues===0)warnings.push('Net membership dues are zero. Membership cannot establish break-even.');
 const margin=mul(div(surplus,revenue),100);
 if(known(margin)&&known(v.targetMargin)&&margin<v.targetMargin)warnings.push('Practice margin is below the selected target.');
 if(known(targetMembers)&&known(safeMembers)&&targetMembers>safeMembers)warnings.push('The target margin requires more members than the selected access target allows.');
 if(w.customRows.some(r=>r.treatment.includes('revenue')))warnings.push('Added revenue is assumed external and does not add appointment capacity. Use the existing platform fee for internal transfers.');
 if(w.customRows.some(r=>r.treatment!=='note'&&r.value<0))warnings.push('A negative financial row reverses its selected effect; confirm it represents an intentional credit or adjustment.');
 if(known(v.ownershipMinMonths)&&known(v.ownershipMaxMonths)&&v.ownershipMinMonths>v.ownershipMaxMonths)warnings.push('The ownership planning range is reversed.');
 return {revenue,costs,surplus,margin,cashAfterDebt:difference(surplus,v.debtService),netDues,breakEvenMembers,targetMembers,routineCapacity,routineDemand,utilization,safeMembers,physicianPay,physicianBurden,physicianDays,routineHours:sum(mul(ownerDays,ownerHours),mul(associateDays,associateHours)),adminAnnualHours:mul(physicianDays,v.adminHours),urgentAnnualHours:mul(physicianDays,v.urgentHours),coreAnnual:mul(v.corePrice,12,difference(1,div(v.prepayDiscount,100))),extendedAnnual:mul(v.extendedPrice,12,difference(1,div(v.prepayDiscount,100))),startupTotal:sum(v.startupCapital,v.workingCapital,c.startup),networkRevenue:mul(v.locations,revenue),platformRevenue,platformSurplus,combinedSurplus:sum(mul(v.locations,surplus),platformSurplus),pilotRevenue:div(mul(v.pilotMembers,netDues,12,v.pilotDays),365),warnings,customTotals:c};
}
export function calculateLaunchWorksheet(worksheet){
 const w=validateWorksheet(worksheet),v=w.values,c=rowTotals(w.customRows);
 const required=['members','corePrice','extendedPrice','extendedMix','prepayShare','prepayDiscount','attendance','extraShortVisits','extraLongVisits','extraShortPrice','extraLongPrice','coreBlock','extendedBlock','extraShortMinutes','extraLongMinutes','dailyVisitCap','breakHours','urgentHours','adminHours','ownerDays','ownerHours','ownerWeeks','associates','associateDays','associateHours','associateWeeks','ownerPay','associatePay','burdenRate','burdenAdjustment','support','occupancy','technology','marketing','other','platformFee','debtService','maxUtilization','horizonMonths','openingMonth','initialMembers','monthlyNewMembers','monthlyAttrition','ownerStartMonth','costStartMonth','startupMonth','financingDraw'];
 if(v.associates>=1)required.push('associate1Month');if(v.associates>=2)required.push('associate2Month');if(v.financingDraw!==0)required.push('financingMonth');if(v.debtService!==0)required.push('debtStartMonth');
 const missing=required.filter(k=>v[k]===null);
 const invalidTime=['horizonMonths','openingMonth','ownerStartMonth','costStartMonth','startupMonth',...(v.associates>=1?['associate1Month']:[]),...(v.associates>=2?['associate2Month']:[]),...(v.financingDraw!==0?['financingMonth']:[]),...(v.debtService!==0?['debtStartMonth']:[])].filter(k=>v[k]===0);
 const invalidBlocks=['coreBlock','extendedBlock','extraShortMinutes','extraLongMinutes'].filter(k=>v[k]===0);
 const warnings=[];
 if(missing.length)warnings.push('Complete these inputs for the monthly launch view: '+missing.map(k=>fields.find(f=>f.key===k).label).join(', ')+'.');
 if(invalidTime.length||invalidBlocks.length)warnings.push('The launch schedule needs positive timing months and appointment blocks. Zero entries are saved, but cannot define those timings.');
 if(c.annualCost===null||c.annualRevenue===null)warnings.push('Complete the added recurring financial rows to calculate the monthly launch.');
 if(warnings.length)return {available:false,rows:[],warnings,...Object.fromEntries(launchMetrics.map(([key])=>[key,null]))};
 const effective={...v,other:v.other+c.annualCost,startupCapital:sum(v.startupCapital,c.startup),financingMonth:v.financingDraw===0?1:v.financingMonth,debtStartMonth:v.debtService===0?1:v.debtStartMonth};
 const launch=computeLaunch(effective,x=>calculateWorksheet({...w,values:{...v,ownerDays:x.ownerDays,associates:x.associates,members:0,extraShortVisits:0,extraLongVisits:0},customRows:[]}),{annualRevenue:c.annualRevenue});
 if(c.startup===null)launch.warnings.push('An added startup expense is unknown, so cash and funding totals remain incomplete.');
 return {...launch,available:true};
}
export function exportPack(state){const s=validateState(state);return {...s,exportedAt:new Date().toISOString(),results:{mature:calculateWorksheet(s.worksheet),launch:calculateLaunchWorksheet(s.worksheet)},modelNotes:notes};}
export function reviewText(state){const p=exportPack(state),lines=['DIRECT PRIMARY CARE — WORKSHEET REVIEW',p.name,'Prepared by: '+(p.author||'Not supplied'),'Exported: '+p.exportedAt,'Model: '+MODEL_VERSION,''];
 for(const [index,w]of [p.worksheet,...p.preservedWorksheets].entries()){
  const r=calculateWorksheet(w),l=calculateLaunchWorksheet(w);lines.push((index?'PRESERVED EARLIER WORKSHEET: ':'ACTIVE WORKSHEET: ')+w.name,'Basis: '+w.basis+'; launch: '+w.launchBasis+'; period: '+(w.period||'Not supplied'));
  lines.push(...fields.map(f=>f.label+': '+(w.values[f.key]??'Unknown')+' '+f.unit),'','ADDED ROWS');
  for(const row of w.customRows)lines.push([row.category,row.label,row.value??'No value',row.unit,treatments.find(t=>t[0]===row.treatment)[1],row.notes].join(' | '));
  lines.push('',...metrics.map(([k,label,type])=>label+': '+formatMetric(r[k],type)),...launchMetrics.map(([k,label,type])=>label+': '+formatMetric(l[k],type)),'Sources and notes: '+w.notes,'Checks:',...[...r.warnings,...l.warnings],'MONTHLY LAUNCH',monthlyColumns.map(c=>c[1]).join(' | '),...l.rows.map(row=>monthlyColumns.map(([key,,type])=>formatMetric(row[key],type)).join(' | ')),'');
 }
 lines.push('FEEDBACK',p.feedback,...p.migrationNotes,'MODEL DEFINITIONS',...notes);return lines.join('\n');
}
const csvCell=value=>{let s=String(value??'Unknown');if(typeof value==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function worksheetCsv(state){const p=exportPack(state),rows=[['Direct Primary Care worksheet',p.name],['Model',MODEL_VERSION],['Author',p.author],['Feedback',p.feedback]];
 for(const [index,w]of [p.worksheet,...p.preservedWorksheets].entries()){
  const r=calculateWorksheet(w),l=calculateLaunchWorksheet(w);rows.push([],[(index?'PRESERVED EARLIER':'ACTIVE')+' WORKSHEET',w.name],['Basis',w.basis],['Launch basis',w.launchBasis],['Period',w.period],['Source notes',w.notes],['Assumption','Units','Value']);
  for(const f of fields)rows.push([f.label,f.unit,w.values[f.key]]);
  rows.push([],['Added category','Description','Value','Unit','Treatment','Notes']);for(const row of w.customRows)rows.push([row.category,row.label,row.value,row.unit,treatments.find(t=>t[0]===row.treatment)[1],row.notes]);
  rows.push([],['Result','Value']);for(const [k,label]of metrics)rows.push([label,r[k]]);for(const [k,label]of launchMetrics)rows.push([label,l[k]]);
  rows.push([],['MONTHLY LAUNCH'],monthlyColumns.map(c=>c[1]));for(const row of l.rows)rows.push(monthlyColumns.map(([key])=>row[key]));
 }
 for(const n of [...p.migrationNotes,...notes])rows.push(['Model note',n]);return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
}
