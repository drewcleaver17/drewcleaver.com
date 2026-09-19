import {fields,groups,reference,metrics,launchMetrics,monthlyColumns,formatMetric,treatments,newState,blankRow,validateState,openPreserved,calculateWorksheet,calculateLaunchWorksheet,exportPack,reviewText,worksheetCsv,roleFields,settingFields,days,newRole,newStage,replacedKeys,startRevised} from '../lib/dpc-worksheet.mjs';
const DRAFT='dpc:worksheet:v4:draft',SAVES='dpc:worksheet:v4:saves';
const oldDrafts=['dpc:worksheet:v3:draft','dpc:model:v2:draft','metsi:model:v1:draft'],oldSaves=['dpc:worksheet:v3:saves','dpc:model:v2:saves','metsi:model:v1:saves'];
export function initializeDpcWorksheet(){
 const root=document.querySelector('[data-dpc-worksheet]');if(!root||root.dataset.ready)return;root.dataset.ready='true';
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],announce=s=>q('[data-action-status]').textContent=s;
 let state=newState(),saves=[],timer,valid=true,draftWritable=true,savesWritable=true;
 const launchKeys=new Set(groups.slice(-2).flatMap(g=>g.fields.map(f=>f.key)));
 function readFirst(keys){for(const k of keys){const raw=localStorage.getItem(k);if(raw!==null)return raw;}return null;}
 try{const raw=readFirst([DRAFT,...oldDrafts]);if(raw!==null)state=validateState(JSON.parse(raw));}catch{draftWritable=false;announce('An earlier draft could not be read. It is untouched; autosave is paused. You can edit and export a new worksheet.');}
 try{const raw=readFirst([SAVES,...oldSaves]),list=raw===null?[]:JSON.parse(raw);if(!Array.isArray(list))throw new Error();saves=list.map(s=>{if(!s||typeof s.id!=='string'||typeof s.savedAt!=='string')throw new Error();return {id:s.id,savedAt:s.savedAt,state:validateState(s.state)};});}catch{savesWritable=false;announce('Saved copies could not be read and remain untouched. Download a review file to keep your new work.');}
 qa('[data-input],button[data-action],[data-import]').forEach(el=>el.disabled=false);
 function save(){clearTimeout(timer);timer=null;if(!valid)return;state.updatedAt=new Date().toISOString();if(!draftWritable){q('[data-save-status]').textContent='Autosave is paused to protect an unreadable earlier draft. Export to keep your work.';return;}
  try{localStorage.setItem(DRAFT,JSON.stringify(state));q('[data-save-status]').textContent='Saved in this browser at '+new Date(state.updatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'. Blank cells and added rows are included.';}catch{q('[data-save-status]').textContent='This browser could not save. Download a review file to keep your work.';}
 }
 function scheduleSave(){clearTimeout(timer);if(valid){q('[data-save-status]').textContent='Saving in this browser…';timer=setTimeout(save,450);}else q('[data-save-status]').textContent='Saving paused for an invalid number. Empty cells and zero are allowed.';}
 function drawChart(svg,series,title){
  const NS='http://www.w3.org/2000/svg';svg.replaceChildren();svg.setAttribute('aria-label',title);
  const add=(tag,attrs={},text)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;svg.append(el);return el;};
  series=series.filter(s=>s.values.length&&s.values.every(v=>typeof v==='number'&&Number.isFinite(v)));add('title',{},title);if(!series.length){add('text',{x:180,y:115,'text-anchor':'middle','font-size':13,fill:'#53665a'},'Complete the required inputs to chart.');return;}
  const values=series.flatMap(s=>s.values),lo=Math.min(0,...values),hi=Math.max(0,...values),span=hi-lo||1,n=series[0].values.length;
  const y=v=>22+(hi-v)/span*169,x=i=>62+i/Math.max(1,n-1)*276;
  const short=v=>(v<0?'-$':'$')+new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(Math.abs(v)>=1e6?Math.abs(v)/1e6:Math.abs(v)>=1000?Math.abs(v)/1000:Math.abs(v))+(Math.abs(v)>=1e6?'m':Math.abs(v)>=1000?'k':'');
  for(let i=0;i<4;i++){const v=hi-span*i/3;add('line',{x1:62,x2:338,y1:y(v),y2:y(v),stroke:'#c9d3c2'});add('text',{x:55,y:y(v)+4,'text-anchor':'end','font-size':12,fill:'#53665a'},short(v));}
  for(const s of series)add('path',{d:s.values.map((v,i)=>(i?'L':'M')+x(i).toFixed(2)+' '+y(v).toFixed(2)).join(' '),fill:'none',stroke:s.color,'stroke-width':2.4,...(s.dashed?{'stroke-dasharray':'6 4'}:{})});
  for(const m of [...new Set([1,12,24,n])].filter(m=>m<=n))add('text',{x:x(m-1),y:210,'text-anchor':'middle','font-size':12,fill:'#53665a'},String(m));add('text',{x:200,y:226,'text-anchor':'middle','font-size':11,fill:'#53665a'},'Planning month');
 }
 function renderMonthly(l){
  q('[data-monthly-body]').replaceChildren();q('[data-monthly-caption]').textContent=state.worksheet.name+' — monthly launch';
  q('[data-launch-incomplete]').hidden=Boolean(l?.available);q('[data-launch-incomplete]').textContent=l?.available?'':(l?.warnings.join(' ')||'Correct the invalid number to recalculate.');
  if(!l?.available){drawChart(q('[data-chart="operations"]'),[],'Monthly results incomplete');drawChart(q('[data-chart="cash"]'),[],'Cash results incomplete');q('[data-cash-chart-title]').textContent='Cash view incomplete';q('[data-cash-chart-note]').textContent='Blank inputs remain unknown; they are not counted as zero.';return;}
  drawChart(q('[data-chart="operations"]'),[{values:l.rows.map(r=>r.revenue),color:'#173e35'},{values:l.rows.map(r=>r.costs),color:'#986626',dashed:true}],'Monthly earned revenue and operating costs');
  let values,title,note;
  if(l.endingCash!==null){values=l.rows.map(r=>r.cashBalance);title='Month-end cash balance';note='Includes opening cash, financing, startup spending and entered debt payments. Unearned annual dues remain an obligation.';}
  else if(l.grossFundingNeed!==null){values=l.rows.map(r=>r.cumulativeRecovery);title='Cumulative cash before financing';note='Includes startup spending and debt payments; excludes opening cash and financing.';}
  else if(l.rows.every(r=>[r.receipts,r.costs,r.debtPayment].every(v=>typeof v==='number'&&Number.isFinite(v)))){let total=0;values=l.rows.map(r=>total+=r.receipts-r.costs-r.debtPayment);title='Operating cash before startup or financing';note='This partial view excludes startup spending, opening cash and financing. It does not establish total funding needs.';}else{values=[];title='Cash projection incomplete';note='Enter missing costs and resolve delivery conflicts. Unknown amounts are not zero.';}
  q('[data-cash-chart-title]').textContent=title;q('[data-cash-chart-note]').textContent=note;drawChart(q('[data-chart="cash"]'),[{values,color:'#235c48'}],title);
  const fragment=document.createDocumentFragment();for(const row of l.rows){const tr=document.createElement('tr');tr.dataset.overCapacity=String(row.overCapacity);for(const [key,,type]of monthlyColumns){const cell=document.createElement(key==='month'?'th':'td');if(key==='month')cell.scope='row';cell.textContent=formatMetric(row[key],type);tr.append(cell);}fragment.append(tr);}q('[data-monthly-body]').append(fragment);
 }
 function readInputs(){
  valid=true;
  for(const el of qa('[data-input]')){if(state.worksheet.engine==='staffing'&&replacedKeys.has(el.dataset.input))continue;const f=fields.find(f=>f.key===el.dataset.input),value=el.value.trim()===''?null:Number(el.value),bad=el.validity.badInput||(value!==null&&(!Number.isFinite(value)||value<f.min||value>f.max||(f.step===1&&!Number.isInteger(value))));const error=q('[data-error="'+f.key+'"]');error.hidden=!bad;
   if(bad){valid=false;el.setAttribute('aria-invalid','true');error.textContent='Use an empty cell or '+f.min+'–'+f.max+(f.step===1?' as a whole number.':'.');}else{el.removeAttribute('aria-invalid');state.worksheet.values[f.key]=value;}
  }
  for(const [index,row]of state.worksheet.customRows.entries()){const card=qa('[data-custom-row]')[index],el=card.querySelector('[data-row-field="value"]'),value=el.value.trim()===''?null:Number(el.value),bad=el.validity.badInput||(value!==null&&(!Number.isFinite(value)||Math.abs(value)>1e9));const error=card.querySelector('[data-row-error]');error.hidden=!bad;if(bad){valid=false;el.setAttribute('aria-invalid','true');error.textContent='Use an empty cell or a number between −1 billion and 1 billion.';}else{el.removeAttribute('aria-invalid');row.value=value;}}
 }
 function render(){
  readInputs();readStructured();let m=null,l=null;if(valid){try{validateState(state);m=calculateWorksheet(state.worksheet);l=calculateLaunchWorksheet(state.worksheet);}catch(e){valid=false;announce(e.message);}}
  q('[data-validation]').hidden=valid;q('[data-validation]').textContent=valid?'':'Correct the highlighted number. Empty and zero values are allowed; incomplete worksheets can be saved.';
  for(const [attribute,defs,result]of [['data-result',metrics,m],['data-launch-result',launchMetrics,l]])for(const el of qa('['+attribute+']')){const def=defs.find(d=>d[0]===el.getAttribute(attribute));el.textContent=result?formatMetric(result[def[0]],def[2]):'Check number';}
  q('[data-results-name]').textContent=state.worksheet.name||'Your worksheet';const ul=q('[data-warnings]');ul.replaceChildren();const messages=valid?[...m.warnings,...l.warnings]:['Correct the highlighted number to recalculate.'];for(const message of messages.length?[...new Set(messages)]:['No arithmetic flags. Clinical access and source accuracy still need review.']){const li=document.createElement('li');li.textContent=message;ul.append(li);}
  q('[data-migration]').hidden=!state.migrationNotes.length;q('[data-migration]').textContent=state.migrationNotes.join(' ');
  q('[data-no-custom]').hidden=state.worksheet.customRows.length>0;
  q('[data-email-draft]').href='mailto:'+root.dataset.email+'?subject='+encodeURIComponent('Direct Primary Care worksheet: '+state.name)+'&body='+encodeURIComponent('Hi Drew,\n\nI have updated the DPC worksheet: '+state.name+'.\n\nI will attach the review JSON file with my inputs, added rows and feedback.\n\n'+state.author);
  renderMonthly(l);renderRoster(m);
 }
 function renderRows(){
  const host=q('[data-custom-rows]');host.replaceChildren();
  for(const [index,row]of state.worksheet.customRows.entries()){
   const card=document.createElement('div');card.className='custom-row';card.dataset.customRow=row.id;const h=document.createElement('h4');h.textContent='Added row '+(index+1);card.append(h);
   for(const [key,title,type]of [['category','Category','text'],['label','Description','text'],['value','Value (optional)','number'],['unit','Unit','text'],['treatment','Include in calculations','select'],['notes','Source or note (optional)','textarea']]){
    const label=document.createElement('label');label.textContent=title;const input=document.createElement(type==='select'?'select':type==='textarea'?'textarea':'input');input.dataset.rowField=key;
    if(type==='select')for(const [value,text]of treatments)input.add(new Option(text,value));else if(type!=='textarea')input.type=type;
    if(type==='number'){input.step='any';input.min='-1000000000';input.max='1000000000';input.inputMode='decimal';input.placeholder='Unknown / no value';}
    if(type==='textarea')input.rows=2;if(key==='unit'){input.placeholder='e.g. hours, members, %, USD';input.disabled=row.treatment!=='note';}
    input.value=row[key]??'';input.setAttribute('aria-label',title+': added row '+(index+1));label.append(input);card.append(label);
   }
   const error=document.createElement('p');error.dataset.rowError='';error.hidden=true;card.append(error);const remove=document.createElement('button');remove.type='button';remove.dataset.removeRow=row.id;remove.textContent='Remove row '+(index+1);card.append(remove);host.append(card);
  }
 }
 function atPath(path){let value=state.worksheet.staffing;for(const key of path.split('.'))value=value[key];return value;}
 function structuredField(host,path,f){
  const label=document.createElement('label');label.className='structured-field';label.textContent=f.label+(f.unit?' ('+f.unit+')':'');
  if(f.help){const note=document.createElement('span');note.className='structured-help';note.textContent=f.help;label.append(note);}
  const input=document.createElement('input');input.type=f.text?'text':'number';input.dataset.structured=path;input.setAttribute('aria-label',f.label+': '+path);input.value=atPath(path)??'';
  if(!f.text){input.min=f.min??0;input.max=f.max??1e8;input.step=f.step??'any';input.inputMode='decimal';input.placeholder='Unknown';}
  label.append(input);host.append(label);
 }
 function structuredSelect(host,path,title,options){const label=document.createElement('label');label.className='structured-field';label.textContent=title;const select=document.createElement('select');select.dataset.structured=path;for(const [value,text]of options)select.add(new Option(text,value));select.value=atPath(path);label.append(select);host.append(label);}
 function weekdayControls(host,path){const group=document.createElement('fieldset'),legend=document.createElement('legend');group.className='weekday-picks';legend.textContent='Working weekdays';group.append(legend);days.forEach((day,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.structured=path+'.'+i;input.checked=atPath(path+'.'+i);input.setAttribute('aria-label',day+': '+path);label.append(input,document.createTextNode(day.slice(0,3)));group.append(label);});host.append(group);}
 function roleButton(host,label,action,index,stage){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.roleAction=action;b.dataset.roleIndex=index;if(stage!==undefined)b.dataset.stageIndex=stage;host.append(b);}
 function renderStaffing(){
  const active=state.worksheet.engine==='staffing';q('[data-staffing-section]').hidden=!active;q('[data-roster-section]').hidden=!active;
  for(const row of qa('[data-replaced]')){row.hidden=active;row.querySelector('input').disabled=active;}
  q('[data-engine-note]').textContent=active?'Active: revised staffing proposal. Physician schedules below replace the earlier shared calendar inputs. All active assumptions are open.':'Active: preserved earlier worksheet. It keeps its original nine-hour/shared-cap definitions and calculation rules. Start the revised proposal explicitly to retain this worksheet and open the new model.';
  const host=q('[data-staffing-controls]');host.replaceChildren();if(!active)return;
  const settings=document.createElement('div');settings.className='staffing-settings';const heading=document.createElement('h4');heading.textContent='Workload, enrollment and additional costs';settings.append(heading);
  structuredSelect(settings,'enrollmentMode','Enrollment model',[['constrained','Constrain admissions to the access target'],['stress','Unconstrained stress case — assumes delivery']]);
  structuredSelect(settings,'launchAccess','Access during the staffing ramp',[['staffed-days','Staffed days only — patient acceptance unvalidated'],['seven-days','Seven-day access from opening']]);
  for(const f of settingFields)structuredField(settings,'settings.'+f.key,f);
  const help=document.createElement('p');help.className='small';help.textContent='Relative weekday demand weights are normalized. Default: 2 for each weekday, 1 for each weekend day. This is a hypothesis, not observed demand.';settings.append(help);
  days.forEach((day,i)=>structuredField(settings,'weights.'+i,{label:day+' demand weight',unit:'relative weight',min:0,max:100}));host.append(settings);
  for(const [index,r]of state.worksheet.staffing.roles.entries()){
   const card=document.createElement('section');card.className='role-editor';const h=document.createElement('h4');h.textContent=r.name;card.append(h);const path='roles.'+index;
   structuredField(card,path+'.name',{label:'Role name',text:true});if(r.kind!=='owner')structuredSelect(card,path+'.kind','Role purpose',[['associate','Associate'],['replacement','Replacement'],['relief','Leave relief']]);
   structuredField(card,path+'.coverage',{label:'Onsite / remote response arrangement',text:true});weekdayControls(card,path+'.weekdays');
   for(const f of roleFields)structuredField(card,path+'.'+f.key,f);
   const guidance=document.createElement('p');guidance.className='small';guidance.textContent='A leadership stage takes effect in its planning month. Reduce booking time or days and enter management/training time and pay explicitly. Readiness requires separate clinical, continuity, financial and leadership review. Dates do not confer ownership. A departing physician has no capacity here after the final paid month.';card.append(guidance);
   for(const [si,stage]of r.stages.entries()){
    const section=document.createElement('section');section.className='stage-editor';const title=document.createElement('h5');title.textContent='Stage '+(si+1)+' — '+r.name;section.append(title);const sp=path+'.stages.'+si;
    structuredField(section,sp+'.label',{label:'Stage description',text:true});structuredField(section,sp+'.month',{label:'Stage begins',unit:'planning month',min:0,max:120,step:1});weekdayControls(section,sp+'.weekdays');
    for(const f of roleFields.filter(f=>!['startMonth','endMonth'].includes(f.key)))structuredField(section,sp+'.'+f.key,f);
    roleButton(section,'Remove stage '+(si+1),'remove-stage',index,si);card.append(section);
   }
   roleButton(card,'Add leadership / training stage','add-stage',index);if(r.kind!=='owner')roleButton(card,'Remove '+r.name,'remove-role',index);host.append(card);
  }
 }
 function readStructured(){
  if(state.worksheet.engine!=='staffing')return;
  for(const el of qa('[data-structured][type="number"]')){const value=el.value.trim()===''?null:Number(el.value),bad=el.validity.badInput||(value!==null&&(!Number.isFinite(value)||value<Number(el.min)||value>Number(el.max)||(el.step==='1'&&!Number.isInteger(value))));if(bad){valid=false;el.setAttribute('aria-invalid','true');}else el.removeAttribute('aria-invalid');}
 }
 function renderRoster(m){
  if(!m?.roster)return;const body=q('[data-roster-body]');body.replaceChildren();for(const d of m.roster.daily){const tr=document.createElement('tr'),demand=m.demand.daily?.find(x=>x.index===d.index);for(const value of [d.day,d.names.join(', ')||'None',formatMetric(d.routineCapacity,'number'),formatMetric(d.weight===null?null:d.weight*100,'percent'),demand?.over&&demand.pressure===null?'No capacity':formatMetric(demand?.pressure,'percent')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}
  const summaries=q('[data-role-summaries]');summaries.replaceChildren();for(const r of m.roster.roles){const p=document.createElement('p');p.className='small';p.textContent=r.name+': Core/Extended blocks '+formatMetric(r.coreBlock,'number')+'/'+formatMetric(r.extendedBlock,'number')+' minutes; '+formatMetric(r.available,'number')+' availability hours/day; '+formatMetric(r.routineHours,'number')+' hours left for routine bookings; '+formatMetric(r.weightedRoutineVisits,'number')+' weighted routine slots/day; '+formatMetric(r.worstHourBookings,'count')+' whole one-hour routine bookings fit. Annual pay '+formatMetric(r.annualPay,'money')+'.';summaries.append(p);}
  const select=q('[data-absence]'),value=select.value;select.replaceChildren(new Option('Choose a physician',''));for(const r of m.roster.roles)select.add(new Option(r.name,r.id));select.value=value;
  const selected=m.roster.roles.find(r=>r.id===select.value);q('[data-absence-result]').textContent=selected?'Without '+selected.name+', days with no remaining scheduled physician: '+(days.filter((_,i)=>!m.roster.roles.some(r=>r.id!==selected.id&&r.weekdays[i])).join(', ')||'none')+'. Remaining appointment capacity is lower even where a physician remains.':'Select a physician to see which days lose all scheduled coverage.';
 }
 q('[data-absence]').addEventListener('change',()=>render());
 function listEarlier(){const select=q('[data-earlier-select]');select.replaceChildren(new Option(state.preservedWorksheets.length?'Choose an earlier worksheet':'No earlier worksheet retained',''));state.preservedWorksheets.forEach((w,i)=>select.add(new Option(w.name||'Unnamed worksheet',String(i))));}
 function listSaves(){const select=q('[data-saved-select]'),selected=select.value;select.replaceChildren(new Option('Choose a saved copy',''));for(const s of saves)select.add(new Option(s.state.name+' / '+s.state.worksheet.name+' — '+new Date(s.savedAt).toLocaleString(),s.id));select.value=selected;}
 function populate(){qa('[data-meta]').forEach(el=>el.value=state[el.dataset.meta]);qa('[data-sheet-meta]').forEach(el=>el.value=state.worksheet[el.dataset.sheetMeta]);qa('[data-input]').forEach(el=>el.value=state.worksheet.values[el.dataset.input]??'');renderRows();renderStaffing();listEarlier();render();}
 function check(){render();if(valid){try{validateState(state);return true;}catch(e){announce(e.message);return false;}}announce('Correct the highlighted number first. Blank inputs can be saved and exported.');q('[aria-invalid="true"]')?.focus();return false;}
 function download(content,type,extension){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download='DPC-Worksheet-'+new Date().toISOString().slice(0,10)+extension;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 function edit(event){const el=event.target;if(el.matches('[data-meta]'))state[el.dataset.meta]=el.value;else if(el.matches('[data-sheet-meta]'))state.worksheet[el.dataset.sheetMeta]=el.value;
  else if(el.matches('[data-input]')){const key=launchKeys.has(el.dataset.input)?'launchBasis':'basis';if(state.worksheet[key]==='Reference assumptions'){state.worksheet[key]='Ballpark estimates';q('[data-sheet-meta="'+key+'"]').value='Ballpark estimates';}}
  else if(el.matches('[data-row-field]')){const card=el.closest('[data-custom-row]'),row=state.worksheet.customRows.find(r=>r.id===card.dataset.customRow),key=el.dataset.rowField;if(key!=='value')row[key]=el.value;if(key==='treatment'){if(row.treatment!=='note')row.unit='USD';const unit=card.querySelector('[data-row-field="unit"]');unit.value=row.unit;unit.disabled=row.treatment!=='note';}}
  else if(el.matches('[data-structured]')){const path=el.dataset.structured.split('.');let target=state.worksheet.staffing;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=el.type==='checkbox'?el.checked:el.type==='number'?(el.value.trim()===''?null:Number(el.value)):el.value;if(state.worksheet.basis==='Reference assumptions'){state.worksheet.basis='Ballpark estimates';q('[data-sheet-meta="basis"]').value='Ballpark estimates';}}
  else return;render();scheduleSave();
 }
 root.addEventListener('input',edit);root.addEventListener('change',event=>{if(event.target.matches('select[data-sheet-meta],select[data-row-field],select[data-structured]'))edit(event);});
 root.addEventListener('click',async event=>{
  const remove=event.target.closest('[data-remove-row]');if(remove){if(!window.confirm('Remove this added row and its effect on the model?'))return;state.worksheet.customRows=state.worksheet.customRows.filter(r=>r.id!==remove.dataset.removeRow);renderRows();render();scheduleSave();q('[data-action="add-row"]').focus();return;}
  const roleAction=event.target.closest('[data-role-action]');if(roleAction){if(roleAction.dataset.roleAction==='add-stage'&&!check())return;const index=Number(roleAction.dataset.roleIndex),role=state.worksheet.staffing.roles[index];if(roleAction.dataset.roleAction==='add-stage')role.stages.push(newStage(role));else if(roleAction.dataset.roleAction==='remove-stage')role.stages.splice(Number(roleAction.dataset.stageIndex),1);else if(roleAction.dataset.roleAction==='remove-role'){if(role.kind==='owner')return;state.worksheet.staffing.roles.splice(index,1);}renderStaffing();render();scheduleSave();return;}
  const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='start-revised'){if(!check())return;state=startRevised(state);populate();save();announce('Revised proposal opened. Your previous worksheet is retained under Earlier inputs.');return;}
  if(action==='add-role'){if(state.worksheet.engine!=='staffing'||!check())return;const role=newRole('role-'+Date.now().toString(36),'Replacement / relief physician',[false,true,true,true,true,true,false],24);role.kind='replacement';role.annualPay=null;state.worksheet.staffing.roles.push(role);renderStaffing();render();scheduleSave();return;}
  if(action==='add-row'){const row=blankRow(Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));state.worksheet.customRows.push(row);renderRows();render();scheduleSave();qa('[data-custom-row]').at(-1).querySelector('input').focus();return;}
  if(action==='load-copy'){const copy=saves.find(s=>s.id===q('[data-saved-select]').value);if(!copy){announce('Choose a saved copy first.');return;}if(!window.confirm('Open this saved copy? Download the current worksheet first to keep any unsaved edits.'))return;state=validateState(copy.state);populate();save();announce('Saved worksheet opened.');return;}
  if(action==='delete-copy'){if(!savesWritable){announce('Unreadable saved copies remain protected.');return;}const id=q('[data-saved-select]').value;if(!id)return;if(!window.confirm('Delete this named copy? The open worksheet and earlier-version backups stay.'))return;const next=saves.filter(s=>s.id!==id);try{localStorage.setItem(SAVES,JSON.stringify(next));saves=next;listSaves();announce('Saved copy deleted.');}catch{announce('This browser could not update saved copies.');}return;}
  if(action==='restore-defaults'){if(!window.confirm('Restore prefilled assumptions? The current worksheet is retained first; your names, added rows, notes and feedback stay.'))return;state.preservedWorksheets.push(structuredClone(state.worksheet));state.worksheet.values={...reference};if(state.worksheet.engine==='staffing')state.worksheet.staffing=newState().worksheet.staffing;state.worksheet.basis='Reference assumptions';state.worksheet.launchBasis='Reference assumptions';populate();save();announce('Prefilled figures restored. Added rows and notes are unchanged.');return;}
  if(!check())return;
  if(action==='open-earlier'){const value=q('[data-earlier-select]').value;if(value===''){announce('Choose an earlier worksheet first.');return;}state=openPreserved(state,Number(value));populate();save();announce('Earlier worksheet opened. The previous worksheet is retained in the same list.');q('[data-sheet-meta="name"]').focus();}
  else if(action==='save-copy'){if(!savesWritable){announce('Unreadable saved copies are protected. Download a review file instead.');return;}save();const copy={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),savedAt:new Date().toISOString(),state:structuredClone(state)};try{localStorage.setItem(SAVES,JSON.stringify([...saves,copy]));saves.push(copy);listSaves();q('[data-saved-select]').value=copy.id;announce('Named worksheet saved, including blanks and added rows.');}catch{announce('This browser could not save a named copy. Download the review file.');}}
  else if(action==='export-json'){download(JSON.stringify(exportPack(state),null,2),'application/json','.json');announce('Review file downloaded with inputs, added rows and feedback.');}
  else if(action==='export-csv'){download(worksheetCsv(state),'text/csv;charset=utf-8','.csv');announce('Worksheet and monthly rows exported. Use JSON to restore editing.');}
  else if(action==='export-text'){download(reviewText(state),'text/plain;charset=utf-8','.txt');announce('Readable review downloaded.');}
  else if(action==='copy-summary'){const summary=reviewText(state);try{await navigator.clipboard.writeText(summary);announce('Review copied.');}catch{const area=q('[data-copy-fallback]');area.value=summary;area.hidden=false;area.focus();area.select();announce('Select and copy the review below.');}}
 });
 q('[data-import]').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('Use a review JSON file smaller than 5 MB.');const imported=validateState(JSON.parse(await file.text()));if(!window.confirm('Import this review and replace the open worksheet? Download current edits first if needed.'))return;state=imported;populate();save();announce('Review imported. Results were recalculated and earlier inputs preserved.');}catch(e){announce('Import failed: '+e.message+' Current inputs are unchanged.');}finally{event.target.value='';}});
 window.addEventListener('pagehide',()=>{if(timer&&valid)save();});window.addEventListener('storage',e=>{if(e.key===DRAFT)announce('Another tab changed the saved draft. Export this worksheet before reloading to keep both.');});
 populate();listSaves();if(!draftWritable)q('[data-save-status]').textContent='Autosave is paused to protect an unreadable earlier draft. Export to keep new work.';else if(state.updatedAt)q('[data-save-status]').textContent='Restored the draft from '+new Date(state.updatedAt).toLocaleString()+'. Edits save in this browser.';
}
