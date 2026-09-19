import { validateState as validateLegacyState } from './metsi-model.mjs';
import { launchGroups, computeLaunch, launchMetrics, monthlyColumns } from './dpc-launch.mjs';
export const MODEL_VERSION = 'dpc-2026-09-v2';
const f = (key,label,value,unit,min=0,max=100000000,step='any',help='',nullable=false) => ({key,label,value,unit,min,max,step,help,nullable});
const matureGroups = [
 {name:'Membership & pricing',note:'Both editable columns begin with the reference assumptions. Replace them with your figures and label their basis.',fields:[
 f('members','Target mature members',360,'members',0,1000000,1),
 f('corePrice','Core monthly membership',200,'$/month'),f('extendedPrice','Extended monthly membership',300,'$/month'),
 f('extendedMix','Members on Extended',75,'%',0,100,0.1,'The rest use Core. Attendance is assumed equal across tiers.'),
 f('prepayShare','Members paying annually',0,'%',0,100,0.1),f('prepayDiscount','Annual-payment discount',20,'%',0,100,0.1,'Applies only to the prepaid share. Revenue is earned over the year.'),
 f('attendance','Members using a routine visit each month',70,'%',0,100,0.1),
 f('extraShortVisits','Additional short visits sold',0,'visits/month',0,100000,1),f('extraLongVisits','Additional long visits sold',0,'visits/month',0,100000,1),
 f('extraShortPrice','Additional short visit price',60,'$/visit'),f('extraLongPrice','Additional long visit price',100,'$/visit')]},
 {name:'Appointment time & access',note:'Capacity respects both the daily visit cap and time available. Paid extra visits consume the same appointment capacity.',fields:[
 f('coreMinutes','Core physician time',25,'minutes',0,480,1),f('coreBlock','Core calendar block',30,'minutes',1,480,1),
 f('extendedMinutes','Extended physician time',45,'minutes',0,480,1),f('extendedBlock','Extended calendar block',60,'minutes',1,480,1),
 f('extraShortMinutes','Extra short visit calendar block',30,'minutes',1,480,1),f('extraLongMinutes','Extra long visit calendar block',60,'minutes',1,480,1),
 f('dailyVisitCap','Routine appointment cap per physician',6,'visits/day',0,100,0.1),
 f('breakHours','Breaks per physician day',1,'hours/day',0,24,0.25),f('urgentHours','Protected urgent time per physician day',1,'hours/day',0,24,0.25),
 f('adminHours','Protected messages and follow-up per day',1,'hours/day',0,24,0.25)]},
 {name:'Physicians & working calendar',note:'One owner with up to two associates preserves the proposed practice size. Hours include protected time. Annual compensation is not automatically prorated when hours change.',fields:[
 f('ownerDays','Owner working days per week',3,'days/week',0,7,0.5),f('ownerHours','Owner working hours per day',9,'hours/day',0,24,0.25),f('ownerWeeks','Owner working weeks per year',46,'weeks/year',0,52,0.5),
 f('associates','Associate physicians',2,'physicians',0,2,1),f('associateDays','Each associate’s working days',5,'days/week',0,7,0.5),f('associateHours','Each associate’s hours per day',9,'hours/day',0,24,0.25),f('associateWeeks','Each associate’s working weeks',46,'weeks/year',0,52,0.5),
 f('ownerPay','Owner annual cash compensation',180000,'$/year'),f('associatePay','Annual cash compensation per associate',260000,'$/year'),
 f('burdenRate','Benefits, payroll costs and malpractice',20,'% of physician pay',0,200,0.1,'The reference converts its $140,000 allowance into 20% of $700,000 cash pay. Add fixed adjustments below.'),
 f('burdenAdjustment','Additional fixed physician employment costs',0,'$/year',-100000000,100000000,'any','Use a negative adjustment to reconcile a known total. Combined employment costs cannot be negative.')]},
 {name:'Local operating costs',note:'Annual amounts are fully loaded. Include costs once. These are planning figures until replaced with practice data.',fields:[
 f('support','Local support staff',90000,'$/year'),f('occupancy','Occupancy and utilities',60000,'$/year'),f('technology','Clinical technology and supplies',18000,'$/year'),f('marketing','Local marketing',18000,'$/year'),f('other','Other administration and business insurance',24000,'$/year'),f('platformFee','Nonclinical platform service fee',5000,'$/location/month'),
 f('debtService','Annual principal and interest payments',0,'$/year',0,100000000,'any','Deducted only in cash after debt service, not in operating surplus.'),
 f('startupCapital','One-time startup capital',null,'$',0,100000000,'any','One-time equipment, deposits and setup spending. The launch model spends it once in the selected startup month. Blank means unknown.',true),f('workingCapital','Opening working-capital reserve',null,'$',0,100000000,'any','Optional target cash buffer. It is not an expense or a source of cash. The launch model compares month-end cash with this target.',true)]},
 {name:'Network & platform economics',note:'Location revenue belongs to the practices. Platform fees belong to the support company. Multiplication assumes equally mature practices, not an opening forecast.',fields:[
 f('locations','Mature locations in the network',25,'locations',0,100000,1),
 f('centralOverhead','Platform annual fixed overhead',null,'$/year',0,100000000,'any','Required to estimate platform surplus. No platform profit is shown until both costs are supplied.',true),
 f('platformCostPerSite','Platform service-delivery cost per location',null,'$/location/year',0,100000000,'any','Costs paid by the platform, excluding its fixed overhead.',true)]},
 {name:'Decision targets & pilot design',note:'These are proposed decision thresholds, not measured results. A pilot does not demonstrate retention until each participant completes the observation period.',fields:[
 f('targetMargin','Target location operating margin',15,'%',0,99,0.1),f('maxUtilization','Maximum planned routine utilization',85,'%',1,100,0.1),
 f('pilotMembers','Opt-in pilot members',25,'members',0,100000,1),f('pilotDays','Observation period per pilot member',90,'days',1,730,1),f('baselineWeeks','Baseline preparation',2,'weeks',0,52,1),
 f('retentionTarget','Pilot retention target',90,'%',0,100,0.1),f('replyTarget','Routine replies within response target',90,'%',0,100,0.1),f('replyHours','Routine response target during coverage',24,'business hours',1,168,1),f('planTarget','Visits ending with an agreed care plan',90,'%',0,100,0.1),
 f('stableMonths','Stable performance before another location',6,'months',0,120,1),f('ownershipMinMonths','Earliest potential associate ownership',18,'months',0,240,1),f('ownershipMaxMonths','Latest planning point for ownership',36,'months',0,240,1)]}
];
export const groups = [...matureGroups, ...launchGroups];
export const fields=groups.flatMap(g=>g.fields);
export const reference=Object.freeze(Object.fromEntries(fields.map(f=>[f.key,f.value])));
export const money=n=>n==null?'Not provided':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const number=n=>n==null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
export const metrics=[
 ['revenue','Annual location revenue','money'],['costs','Annual location operating costs','money'],['surplus','Annual location operating surplus','money'],['margin','Location operating margin','percent'],['cashAfterDebt','Cash after debt service','money'],
 ['netDues','Net dues per member per month','money2'],['breakEvenMembers','Break-even members','count'],['targetMembers','Members required for target margin','count'],
 ['routineCapacity','Routine visit capacity per month','number'],['routineDemand','Member routine visits per month','number'],['utilization','Capacity used, including extra visits','percent'],['safeMembers','Members within utilization target','count'],
 ['physicianPay','Annual physician cash pay','money'],['physicianBurden','Annual physician employment costs','money'],['physicianDays','Physician working days per year','number'],['routineHours','Routine appointment hours per year','number'],['adminAnnualHours','Protected admin hours per year','number'],['urgentAnnualHours','Protected urgent hours per year','number'],
 ['coreAnnual','Core annual prepayment','money'],['extendedAnnual','Extended annual prepayment','money'],['startupTotal','Startup capital plus opening reserve','money'],
 ['networkRevenue','Annual revenue across practices','money'],['platformRevenue','Annual platform revenue','money'],['platformSurplus','Annual platform surplus','money'],['combinedSurplus','Combined practice and platform surplus','money'],['pilotRevenue','Pilot dues over observation period','money']
];
export function formatMetric(v,type){if(v==null)return type==='month'?'Not reached / incomplete':type.startsWith('money')?'Not provided':'—';if(type==='month')return 'Month '+v;return type==='money2'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(v):type==='money'?money(v):type==='percent'?number(v)+'%':type==='count'?Math.ceil(v).toLocaleString('en-US'):number(v);}
export function validateValues(v){const errors=[];if(!v||typeof v!=='object'||Array.isArray(v))return ['Missing model inputs.'];for(const f of fields){const n=v[f.key];if(n===null&&f.nullable)continue;if(typeof n!=='number'||!Number.isFinite(n)||n<f.min||n>f.max||(f.step===1&&!Number.isInteger(n)))errors.push(`${f.label}: enter ${f.min}–${f.max}${f.step===1?' as a whole number':''}.`);}return errors;}
export function calculate(v){const invalid=validateValues(v);if(invalid.length)throw new Error(invalid[0]);
 const share=v.extendedMix/100,blend=v.corePrice*(1-share)+v.extendedPrice*share,netDues=blend*(1-v.prepayShare/100*v.prepayDiscount/100);
 const weightedBlock=v.coreBlock*(1-share)+v.extendedBlock*share,reserved=v.breakHours+v.urgentHours+v.adminHours;
 const ownerDayHours=Math.max(0,v.ownerHours-reserved),associateDayHours=Math.max(0,v.associateHours-reserved);
 const ownerDays=v.ownerDays*v.ownerWeeks,associateDays=v.associates*v.associateDays*v.associateWeeks,physicianDays=ownerDays+associateDays;
 const routineHours=ownerDays*ownerDayHours+associateDays*associateDayHours;
 const capacityMinutes=(ownerDays*Math.min(v.dailyVisitCap*weightedBlock,ownerDayHours*60)+associateDays*Math.min(v.dailyVisitCap*weightedBlock,associateDayHours*60))/12;
 const routineCapacity=capacityMinutes/weightedBlock,routineDemand=v.members*v.attendance/100;
 const extraMinutes=v.extraShortVisits*v.extraShortMinutes+v.extraLongVisits*v.extraLongMinutes,demandMinutes=routineDemand*weightedBlock+extraMinutes;
 const utilization=capacityMinutes>0?demandMinutes/capacityMinutes*100:null;
 const extraRevenue=(v.extraShortVisits*v.extraShortPrice+v.extraLongVisits*v.extraLongPrice)*12;
 const revenue=v.members*netDues*12+extraRevenue,physicianPay=v.ownerPay+v.associates*v.associatePay,physicianBurden=physicianPay*v.burdenRate/100+v.burdenAdjustment;
 const localCosts=v.support+v.occupancy+v.technology+v.marketing+v.other,costs=physicianPay+physicianBurden+localCosts+v.platformFee*12,surplus=revenue-costs;
 const breakEvenMembers=netDues>0?Math.max(0,Math.ceil((costs-extraRevenue)/(netDues*12))):null;
 const targetMembers=netDues>0?Math.max(0,Math.ceil((costs/(1-v.targetMargin/100)-extraRevenue)/(netDues*12))):null;
 const safeMembers=v.attendance>0?Math.max(0,Math.floor((capacityMinutes*v.maxUtilization/100-extraMinutes)/(weightedBlock*v.attendance/100))):null;
 const platformRevenue=v.locations*v.platformFee*12;
 const platformSurplus=v.centralOverhead!==null&&v.platformCostPerSite!==null?platformRevenue-v.centralOverhead-v.locations*v.platformCostPerSite:null;
 const warnings=[];
 if(v.members===0)warnings.push('No active members. Revenue may still include paid extra visits.');
 if(physicianBurden<0)warnings.push('Physician employment costs are negative. Correct the fixed adjustment before using the results.');
 if(v.coreMinutes>v.coreBlock||v.extendedMinutes>v.extendedBlock)warnings.push('Physician time exceeds a calendar block. Lengthen the block or revise the visit time.');
 if((v.ownerDays>0&&reserved>v.ownerHours)||(v.associates>0&&v.associateDays>0&&reserved>v.associateHours))warnings.push('Protected time exceeds the working day. That role has no routine capacity.');
 if(capacityMinutes===0)warnings.push('No routine appointment capacity is available.');
 if(utilization!==null&&utilization>100)warnings.push('Visit demand exceeds routine capacity. Revenue assumes these appointments can be delivered.');
 else if(utilization!==null&&utilization>v.maxUtilization)warnings.push('Routine utilization exceeds the selected access target.');
 if(v.attendance===0)warnings.push('Zero attendance cannot establish a safe enrollment cap. Messages and urgent care still require staff.');
 if(netDues===0)warnings.push('Net membership dues are zero. Membership alone cannot establish break-even.');
 if(revenue>0&&surplus/revenue*100<v.targetMargin)warnings.push('Location margin is below the selected expansion target.');
 if(safeMembers!==null&&targetMembers!==null&&targetMembers>safeMembers)warnings.push('The target margin needs more members than the current access target allows. Change price, cost or capacity assumptions together.');
 if(v.centralOverhead===null||v.platformCostPerSite===null)warnings.push('Platform costs are incomplete. Platform and combined surplus are not estimated.');
 if(v.startupCapital===null||v.workingCapital===null)warnings.push('Startup capital is incomplete. Operating surplus does not establish the cash needed to launch.');
 if(v.ownershipMinMonths>v.ownershipMaxMonths)warnings.push('The ownership planning range is reversed.');
 return {revenue,costs,surplus,margin:revenue?surplus/revenue*100:null,cashAfterDebt:surplus-v.debtService,netDues,breakEvenMembers,targetMembers,routineCapacity,routineDemand,utilization,safeMembers,physicianPay,physicianBurden,physicianDays,routineHours,adminAnnualHours:physicianDays*v.adminHours,urgentAnnualHours:physicianDays*v.urgentHours,coreAnnual:v.corePrice*12*(1-v.prepayDiscount/100),extendedAnnual:v.extendedPrice*12*(1-v.prepayDiscount/100),startupTotal:v.startupCapital!==null&&v.workingCapital!==null?v.startupCapital+v.workingCapital:null,networkRevenue:v.locations*revenue,platformRevenue,platformSurplus,combinedSurplus:platformSurplus===null?null:v.locations*surplus+platformSurplus,pilotRevenue:v.pilotMembers*netDues*12*v.pilotDays/365,warnings};
}

export { launchMetrics, monthlyColumns } from './dpc-launch.mjs';
export function calculateLaunch(values) {
  const errors=validateValues(values);
  if(errors.length) throw new Error(errors[0]);
  return computeLaunch(values,calculate);
}
const bases=['Reference assumptions','Ballpark estimates','Actuals and estimates','Actual practice figures'];
export const MODEL_NOTES=[
  'All reference values are illustrative. No practice data, commitments or endorsements are implied.',
  'Annual compensation is entered, not prorated by hours. The launch model pays each role from its start month.',
  'Capacity uses the smaller of the daily visit cap and available hours. Weeks are spread evenly across months. Extra visits consume the same routine capacity.',
  'Launch members are expected values and can be fractional. Initial members start new billing at opening. Later additions follow attrition and stop at the mature enrollment target, not at a clinical capacity limit.',
  'Annual members pay on joining and each 12-month renewal. Revenue is earned in equal monthly amounts. Cancellation at a monthly boundary refunds all unearned dues.',
  'Startup capital is spent once. Opening cash and a financing draw are cash sources. The working-capital reserve is a target buffer, never an expense or duplicated cash source.',
  'Debt service is the entered annual payment divided by 12, from its start month. No payoff, loan terms or amortization is inferred.',
  'Cash recovery means cumulative receipts less operating costs, startup spending and debt payments, excluding opening cash and financing. Prepayment can bring this forward while leaving service/refund obligations.',
  'Break-even and cash recovery are the first months that remain nonnegative for the rest of the selected horizon, not promises about later months.',
  'Monthly cash is an approximation. Taxes, owner distributions, replacement equipment, inflation and changes in working capital beyond entered items are excluded. Revenue assumes all modeled care can be delivered.',
  'Platform fees are an expense to practices and revenue to the support company. Combined surplus eliminates the internal transfer. Network figures multiply equally mature practices, not their opening schedules.',
  'Local saving stays in this browser and device. Export and import are the exchange mechanism. No information is automatically sent.'
];
export function newState(){
  return {schemaVersion:2,modelVersion:MODEL_VERSION,name:'DPC concept discussion',author:'',updatedAt:null,migration:null,scenarios:[
    {name:'Practice inputs',basis:'Reference assumptions',launchBasis:'Reference assumptions',period:'',notes:'',values:{...reference}},
    {name:'Proposed scenario',basis:'Reference assumptions',launchBasis:'Reference assumptions',period:'',notes:'',values:{...reference}}
  ],feedback:''};
}
export function validateState(raw){
  if(raw?.schemaVersion===1 && raw?.modelVersion==='metsi-2026-09-v1') {
    const old=validateLegacyState(raw),state=newState();
    for(const key of ['name','author','feedback','updatedAt']) state[key]=old[key];
    state.scenarios=old.scenarios.map(s=>({...s,launchBasis:'Reference assumptions',values:{...reference,...s.values}}));
    state.migration={fromVersion:'metsi-2026-09-v1',note:'Imported an earlier comparison. All 56 original input values, names, notes and feedback are preserved. Fourteen launch inputs were added as illustrative defaults: 36 months, opening in month 2, 30 initial members, 25 new enrollments/month, 1% monthly attrition, owner starting month 2, associates in months 5 and 11, local costs and startup spending in month 1, opening cash unknown, no financing draw, financing month 1 and debt payments from month 2. Existing startup spending, target reserve and annual debt payments now also feed the launch view. Review the new timing before relying on launch results.'};
    return state;
  }
  if(!raw||typeof raw!=='object'||raw.schemaVersion!==2||raw.modelVersion!==MODEL_VERSION) throw new Error('Unsupported model version. Use a review file exported by this tool or its original comparison.');
  if(!Array.isArray(raw.scenarios)||raw.scenarios.length!==2) throw new Error('The file must contain both editable scenarios.');
  const state=newState();
  for(const key of ['name','author','feedback']) {
    if(typeof raw[key]!=='string'||raw[key].length>20000) throw new Error('Invalid discussion text.');
    state[key]=raw[key];
  }
  for(let i=0;i<2;i++) {
    const s=raw.scenarios[i];
    if(!s||!bases.includes(s.basis)||!bases.includes(s.launchBasis)) throw new Error('Invalid input basis.');
    for(const key of ['name','period','notes']) if(typeof s[key]!=='string'||s[key].length>20000) throw new Error('Invalid scenario text.');
    const errors=validateValues(s.values);if(errors.length) throw new Error(errors[0]);
    state.scenarios[i]={name:s.name,basis:s.basis,launchBasis:s.launchBasis,period:s.period,notes:s.notes,values:Object.fromEntries(fields.map(f=>[f.key,s.values[f.key]]))};
  }
  if(raw.migration!==null && raw.migration!==undefined) {
    if(raw.migration.fromVersion!=='metsi-2026-09-v1'||typeof raw.migration.note!=='string'||raw.migration.note.length>20000) throw new Error('Invalid migration record.');
    state.migration={fromVersion:raw.migration.fromVersion,note:raw.migration.note};
  }
  state.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;
  return state;
}
export function exportPack(state){
  const s=validateState(state);
  return {...s,exportedAt:new Date().toISOString(),reference:{...reference},results:{reference:calculate(reference),scenarios:s.scenarios.map(s=>calculate(s.values)),launchReference:calculateLaunch(reference),launchScenarios:s.scenarios.map(s=>calculateLaunch(s.values))},modelNotes:MODEL_NOTES};
}
export function reviewText(state){
  const pack=exportPack(state);
  const lines=['DIRECT PRIMARY CARE - SCENARIO REVIEW',pack.name,`Prepared by: ${pack.author||'Not supplied'}`,`Exported: ${pack.exportedAt}`,`Model: ${MODEL_VERSION}`,''];
  if(pack.migration) lines.push('MIGRATION',pack.migration.note,'');
  for(let i=0;i<2;i++){
    const s=pack.scenarios[i],r=pack.results.scenarios[i],l=pack.results.launchScenarios[i];
    lines.push(s.name,`Mature-model basis: ${s.basis}; launch basis: ${s.launchBasis}; period: ${s.period||'Not supplied'}`,...metrics.map(([k,label,type])=>`${label}: ${formatMetric(r[k],type)}`),'',...launchMetrics.map(([k,label,type])=>`${label}: ${formatMetric(l[k],type)}`),'',...fields.map(f=>`${f.label}: ${s.values[f.key]??'Not supplied'} ${f.unit} (reference: ${f.value??'not supplied'})`),'',`Notes: ${s.notes||'None'}`,'Checks:',...[...r.warnings,...l.warnings].map(w=>'- '+w),'','MONTHLY LAUNCH ROWS',monthlyColumns.map(c=>c[1]).join(' | '),...l.rows.map(row=>monthlyColumns.map(([key,,type])=>formatMetric(row[key],type)).join(' | ')),'');
  }
  lines.push('FEEDBACK / QUESTIONS',pack.feedback||'None','','MODEL DEFINITIONS',...MODEL_NOTES);
  return lines.join('\n');
}
const csvCell=x=>{let s=String(x??'');if(typeof x==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function comparisonCsv(state){
  const p=exportPack(state),rs=[p.results.reference,...p.results.scenarios],ls=[p.results.launchReference,...p.results.launchScenarios];
  const units={money:'USD',money2:'USD',percent:'%',count:'count',number:'see row label',month:'planning month'};
  const rows=[['Direct Primary Care comparison',p.name],['Model version',MODEL_VERSION],['Author',p.author],['Mature-model basis','Reference assumptions',...p.scenarios.map(s=>s.basis)],['Launch basis','Reference assumptions',...p.scenarios.map(s=>s.launchBasis)],['Period','Illustrative',...p.scenarios.map(s=>s.period)],['Assumption','Units','Reference',...p.scenarios.map(s=>s.name)]];
  for(const f of fields) rows.push([f.label,f.unit,f.value??'Not supplied',...p.scenarios.map(s=>s.values[f.key]??'Not supplied')]);
  rows.push([],['Mature result','Units','Reference',...p.scenarios.map(s=>s.name)]);
  for(const [k,label,type] of metrics) rows.push([label,units[type],...rs.map(r=>r[k]??'Not provided')]);
  rows.push([],['Launch result','Units','Reference',...p.scenarios.map(s=>s.name)]);
  for(const [k,label,type] of launchMetrics) rows.push([label,units[type],...ls.map(r=>r[k]??'Not available')]);
  ['Reference assumptions',...p.scenarios.map(s=>s.name)].forEach((name,i)=>{
    rows.push([],['MONTHLY LAUNCH',name],monthlyColumns.map(c=>c[1]));
    for(const row of ls[i].rows) rows.push(monthlyColumns.map(([key])=>row[key]??'Not available'));
  });
  rows.push([],['Scenario notes',...p.scenarios.map(s=>s.notes)],['Feedback',p.feedback]);
  if(p.migration) rows.push(['Migration',p.migration.note]);
  for(const note of MODEL_NOTES) rows.push(['Model note',note]);
  return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
}
