import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as m from '../src/lib/dpc-worksheet-v8.mjs';
import * as r07 from '../src/lib/dpc-worksheet-v7.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('R08 exact consecutive onsite roster, days off and shared owner days',()=>{
 const w=m.newState().worksheet;
 assert.deepEqual(w.staffing.roles.map(r=>r.weekdays),[[false,false,true,true,true,false,false],[true,true,true,true,true,false,false],[false,false,true,true,true,true,true]]);
 const a=m.calculateWorksheet(w);assert.deepEqual(a.roster.daily.map(d=>d.physicians),[1,1,3,3,3,1,1]);
 assert.equal(a.routineCapacity,414);assert.equal(a.safeMembers,247);assert.equal(a.requestedMembers,360);assert.equal(a.modeledMembers,247);assert.equal(a.deferredMembers,113);
 assert.deepEqual(a.demand.daily.filter(d=>d.pressure===a.worstDayUtilization).map(d=>d.day),['Monday','Friday']);
 const old=r07.newState().worksheet;assert.deepEqual(w.values,old.values);assert.deepEqual(w.staffing.settings,old.staffing.settings);assert.deepEqual(w.staffing.demand,old.staffing.demand);assert.deepEqual(w.staffing.weights,old.staffing.weights);
 near(a.revenue,247*325*.9*12);assert.equal(a.costs,906000);assert.equal(a.incentiveCost,0);assert.equal(a.surplus,-39030);
 const l=m.calculateLaunchWorksheet(w);assert.equal(l.operatingBreakEvenMonth,null);assert.equal(l.operatingLossRecoveryMonth,null);near(l.totalOperatingResult,-336951.2386376432);
 const junior=m.withSchedule(w,'fourth');junior.values.members=247;assert.equal(m.calculateWorksheet(junior).surplus,-219030);assert.equal(w.staffing.roles.length,3);
});
test('R07 migration, export and explicit R08 reset preserve entered work and results',()=>{
 const s=r07.newState();s.feedback='Keep feedback';s.worksheet.notes='Keep sources';s.worksheet.name='My prior schedule';s.preservedWorksheets.push(structuredClone(s.worksheet));
 const upgraded=m.validateState(s);assert.deepEqual(upgraded.worksheet,s.worksheet);assert.deepEqual(upgraded.preservedWorksheets,s.preservedWorksheets);assert.equal(upgraded.feedback,s.feedback);
 near(m.calculateWorksheet(upgraded.worksheet).surplus,r07.calculateWorksheet(s.worksheet).surplus);near(m.calculateLaunchWorksheet(upgraded.worksheet).totalOperatingResult,r07.calculateLaunchWorksheet(s.worksheet).totalOperatingResult);
 const reset=m.startRevised(upgraded);assert.deepEqual(reset.preservedWorksheets.at(-1),s.worksheet);assert.equal(reset.feedback,s.feedback);assert.equal(m.calculateWorksheet(reset.worksheet).safeMembers,247);
 assert.deepEqual(m.validateState(m.exportPack(reset)).worksheet,reset.worksheet);assert.deepEqual(m.openPreserved(reset,1).worksheet,s.worksheet);
});
test('R08 snapshot matches current model and remains outside published revision count',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../docs/dpc/reference-results-r08.json',import.meta.url)));const revision=d.revision;assert.deepEqual(d.revision,revision);assert.equal(revision.history.length,7);assert.equal(revision.pageRevision,'R08 review');
 const a=m.calculateWorksheet(d.state.worksheet);for(const k of ['safeMembers','modeledMembers','revenue','costs','surplus'])assert.equal(d.mature[k],a[k]);assert.deepEqual(m.schedulePresets.map(x=>x[0]),['consecutive','fourth']);
});
