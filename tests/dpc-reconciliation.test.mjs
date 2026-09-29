import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/dpc-worksheet-v7.mjs';
import * as r06 from '../src/lib/dpc-worksheet-v6.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('owner six scheduled visits and urgent/admin holds fit independently of associate availability',()=>{
 const w=m.newState().worksheet,a=m.calculateWorksheet(w),o=a.roster.roles[0];
 assert.deepEqual([o.availableStart,o.availableEnd,o.bookStart,o.bookEnd],[10,19,10,17]);
 assert.equal(o.weightedRoutineVisits,6);assert.equal(o.cap,7);assert.equal(o.urgentHours,1);assert.equal(o.adminOutside,1);
 near(a.routineCapacity,(3*6+10*9)*46/12);assert.equal(a.safeMembers,412);
 near(a.availabilityHours,(3*9+10*12)*46);near(a.routineHours,(3*6*40/60+10*6)*46);
 assert.equal(a.roster.daily[0].names.length,1);assert.equal(a.roster.daily[6].names.length,1);
 w.staffing.roles[1].availableEnd=24;const b=m.calculateWorksheet(w);near(b.routineCapacity,a.routineCapacity);near(b.costs,a.costs);
 w.staffing.roles[0].adminOutside=2;assert.equal(m.calculateWorksheet(w).safeMembers,null);
 w.staffing.roles[0].adminOutside=null;assert.equal(m.calculateWorksheet(w).revenue,null);
});
test('coverage-inclusive base reconciles revenue, payroll, expenses and earned performance pool',()=>{
 const w=m.newState().worksheet,a=m.calculateWorksheet(w);
 const revenue=360*(.25*250+.75*350)*(1-.5*.2)*12;
 const salaries=180000+2*150000,baseBurden=salaries*.2,local=90000+60000+18000+18000+24000,fee=5000*12,coverage=30000+20000+5000+5000;
 const before=salaries+baseBurden+local+fee+coverage,pool=(revenue-before)*.2;
 near(a.revenue,revenue);near(a.costsBeforeIncentives,before);near(a.incentiveCost,pool);near(a.bonusPerAssociate,pool/1.2/2);near(a.costs,before+pool);near(a.surplus,revenue-before-pool);
 for(const key of ['extendedSupport','leaveRelief','recruiting','extendedOccupancy']){const x=structuredClone(w);x.staffing.settings[key]=null;assert.equal(m.calculateWorksheet(x).surplus,null);near(m.calculateWorksheet(x).revenue,revenue);}
 for(const share of [0,50,100]){w.values.prepayShare=share;near(m.calculateWorksheet(w).revenue,360*325*(1-share/100*.2)*12);}
});
test('R06 migration preserves all entered inputs, results, named feedback and stages',()=>{
 const s=r06.newState();s.worksheet.name='My R06';s.feedback='Retain my feedback';s.worksheet.customRows.push({...m.blankRow('note'),label:'Retain me'});
 const stage=r06.newStage(s.worksheet.staffing.roles[1]);stage.managementHours=1;s.worksheet.staffing.roles[1].stages.push(stage);
 const old=r06.calculateWorksheet(s.worksheet),oldLaunch=r06.calculateLaunchWorksheet(s.worksheet),up=m.validateState(s);
 assert.deepEqual(up.worksheet.values,s.worksheet.values);assert.equal(up.feedback,s.feedback);assert.deepEqual(up.worksheet.customRows,s.worksheet.customRows);
 for(let i=0;i<3;i++){const {adminOutside,stages,...role}=up.worksheet.staffing.roles[i];assert.equal(adminOutside,0);assert.deepEqual(role,Object.fromEntries(Object.entries(s.worksheet.staffing.roles[i]).filter(([k])=>k!=='stages')));for(const st of stages)assert.equal(st.adminOutside,0);}
 const now=m.calculateWorksheet(up.worksheet);for(const key of ['safeMembers','routineCapacity','revenue','costs','surplus','incentiveCost','activeMonthlyHours'])near(now[key],old[key]);near(m.calculateLaunchWorksheet(up.worksheet).totalOperatingResult,oldLaunch.totalOperatingResult);
 const revised=m.startRevised(up);assert.equal(revised.worksheet.staffing.roles[0].cap,7);assert.equal(revised.preservedWorksheets[0].staffing.roles[0].cap,6);
 assert.deepEqual(m.validateState(m.exportPack(up)).worksheet,up.worksheet);
});
test('annual cash reconciles to earned revenue and deferred dues through renewals/refunds',()=>{
 for(const share of [0,50,100]){
  const w=m.newState().worksheet;w.values.prepayShare=share;w.values.startupCapital=100000;w.values.openingCash=400000;
  const l=m.calculateLaunchWorksheet(w);let deferred=0,cash=400000;
  for(const row of l.rows){near(deferred+row.receipts-row.revenue,row.deferredRevenue);deferred=row.deferredRevenue;cash+=row.receipts-row.costs-row.startupSpend-row.debtPayment+row.financing;near(cash,row.cashBalance);}
  if(share===50){near(l.rows[1].receipts,51675);near(l.rows[1].revenue,8775);near(l.rows[1].deferredRevenue,42900);}
 }
});
test('optional junior is not in base; same enrollment includes full incremental salary and bonus effect',()=>{
 const w=m.newState().worksheet,a=m.calculateWorksheet(w),junior=m.calculateWorksheet(m.withSchedule(w,'fourth'));
 assert.equal(w.staffing.roles.length,3);assert.equal(junior.roster.roles.length,4);assert.equal(junior.modeledMembers,360);near(junior.costsBeforeIncentives-a.costsBeforeIncentives,180000);near(junior.surplus,142080);assert.equal(junior.safeMembers,494);
 const constrained=m.calculateWorksheet(m.withSchedule(w,'consecutive'));assert.equal(constrained.requestedMembers,360);assert.equal(constrained.modeledMembers,247);
});

test('physician time cannot overrun an active booking block or silently become known',()=>{const w=m.newState().worksheet;w.values.coreMinutes=26;assert.equal(m.calculateWorksheet(w).safeMembers,null);w.values.coreMinutes=null;assert.equal(m.calculateWorksheet(w).safeMembers,null);w.values.coreMinutes=25;assert.equal(m.calculateWorksheet(w).safeMembers,412);});
