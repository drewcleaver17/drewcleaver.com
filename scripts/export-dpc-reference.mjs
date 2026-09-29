import fs from 'node:fs';
import {newState,calculateWorksheet,calculateLaunchWorksheet,newStage,withSchedule,schedulePresets} from '../src/lib/dpc-worksheet.mjs';
import {newState as earlier,calculateWorksheet as priorCalc} from '../src/lib/dpc-worksheet-v3.mjs';
import {centralTimestamp} from '../src/lib/dpc-revision.mjs';
const revision=JSON.parse(fs.readFileSync(new URL('../src/data/dpc-revisions.json',import.meta.url)));
const state=newState(),w=state.worksheet;
// Keep full reference inputs/roster and launch; sensitivity snapshots need only scalar results.
const summarize=r=>Object.fromEntries(Object.entries(r).filter(([key])=>!['roster','demand','warnings','customTotals','associateCompensation'].includes(key)));
const example=edit=>{const x=structuredClone(w);edit(x);return {mature:summarize(calculateWorksheet(x))};};
const zeroCoverage=example(x=>{for(const k of ['extendedSupport','leaveRelief','recruiting','extendedOccupancy'])x.staffing.settings[k]=0;});
const scheduleComparisons=schedulePresets.map(([key,label])=>{const x=withSchedule(w,key),requested=summarize(calculateWorksheet(x));x.values.members=1000;return {key,label,requested,atCapacity:summarize(calculateWorksheet(x))};});
const out={revision,centralTimestamp:centralTimestamp(revision.updatedAt),state,mature:calculateWorksheet(w),launch:calculateLaunchWorksheet(w),earlier:priorCalc(earlier().worksheet),zeroCoverage,scheduleComparisons,
 annualPaymentSensitivities:[0,50,100].map(share=>({share,...example(x=>x.values.prepayShare=share)})),
 paySensitivities:[150000,200000,250000,300000].map(pay=>({pay,...example(x=>x.staffing.roles.filter(r=>r.kind==='associate').forEach(r=>r.annualPay=pay))})),
 attendanceSensitivities:[70,100].map(attendance=>({attendance,...example(x=>x.values.attendance=attendance)})),
 cases:[['Downside: 250 members, 100% annual pay',x=>{x.values.members=250;x.values.prepayShare=100;}],['Base: 100% routine attendance',x=>{}],['Upside: 360 paid members, 70% attendance',x=>{x.values.attendance=70;}],['Owner-heavy: 40% assigned to owner',x=>{x.staffing.panels.weights={owner:40,'associate-a':30,'associate-b':30};}]].map(([label,edit])=>({label,...example(edit)})),
 sensitivities:{laterCutoff:example(x=>x.staffing.roles.filter(r=>r.kind!=='owner').forEach(r=>r.bookEnd=19)),shorterBlocks:example(x=>{x.values.extendedBlock=30;x.values.extendedMinutes=25;}),equalWeekdayDemand:example(x=>{x.staffing.weights.fill(1);x.staffing.demand.urgentWeights.fill(1);}),sameEnrollmentStress:example(x=>x.staffing.enrollmentMode='stress'),leadership:example(x=>{const a=x.staffing.roles[1],stage=newStage(a);stage.managementHours=2;a.stages.push(stage);x.staffing.settings.matureMonth=24;})}};
fs.writeFileSync(new URL('../docs/dpc/reference-results-r09.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log({revision:revision.pageRevision,capacity:out.mature.routineCapacity,members:out.mature.modeledMembers,surplus:out.mature.surplus,launchEnd:out.launch.endMembers,launchOperating:out.launch.totalOperatingResult,schedules:scheduleComparisons.map(x=>({name:x.label,capacity:x.atCapacity.safeMembers,profit:x.atCapacity.surplus,atRequested:x.requested.surplus})),pay:out.paySensitivities.map(x=>[x.pay,x.mature.surplus]),attendance:out.attendanceSensitivities.map(x=>[x.attendance,x.mature.safeMembers])});
