import {fields,groups,reference,metrics,launchMetrics,monthlyColumns,formatMetric,treatments,newState,blankRow,validateState,openPreserved,calculateWorksheet,calculateLaunchWorksheet,exportPack,reviewText,worksheetCsv} from '../lib/dpc-worksheet.mjs';
const DRAFT='dpc:worksheet:v3:draft',SAVES='dpc:worksheet:v3:saves';
const oldDrafts=['dpc:model:v2:draft','metsi:model:v1:draft'],oldSaves=['dpc:model:v2:saves','metsi:model:v1:saves'];
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
  add('title',{},title);if(!series.length){add('text',{x:180,y:115,'text-anchor':'middle','font-size':13,fill:'#53665a'},'Complete the required inputs to chart.');return;}
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
  else{let total=0;values=l.rows.map(r=>total+=r.receipts-r.costs-r.debtPayment);title='Operating cash before startup or financing';note='Startup spending is incomplete. This partial view excludes it, opening cash and financing, so it does not establish total funding needs.';}
  q('[data-cash-chart-title]').textContent=title;q('[data-cash-chart-note]').textContent=note;drawChart(q('[data-chart="cash"]'),[{values,color:'#235c48'}],title);
  const fragment=document.createDocumentFragment();for(const row of l.rows){const tr=document.createElement('tr');tr.dataset.overCapacity=String(row.overCapacity);for(const [key,,type]of monthlyColumns){const cell=document.createElement(key==='month'?'th':'td');if(key==='month')cell.scope='row';cell.textContent=formatMetric(row[key],type);tr.append(cell);}fragment.append(tr);}q('[data-monthly-body]').append(fragment);
 }
 function readInputs(){
  valid=true;
  for(const el of qa('[data-input]')){const f=fields.find(f=>f.key===el.dataset.input),value=el.value.trim()===''?null:Number(el.value),bad=el.validity.badInput||(value!==null&&(!Number.isFinite(value)||value<f.min||value>f.max||(f.step===1&&!Number.isInteger(value))));const error=q('[data-error="'+f.key+'"]');error.hidden=!bad;
   if(bad){valid=false;el.setAttribute('aria-invalid','true');error.textContent='Use an empty cell or '+f.min+'–'+f.max+(f.step===1?' as a whole number.':'.');}else{el.removeAttribute('aria-invalid');state.worksheet.values[f.key]=value;}
  }
  for(const [index,row]of state.worksheet.customRows.entries()){const card=qa('[data-custom-row]')[index],el=card.querySelector('[data-row-field="value"]'),value=el.value.trim()===''?null:Number(el.value),bad=el.validity.badInput||(value!==null&&(!Number.isFinite(value)||Math.abs(value)>1e9));const error=card.querySelector('[data-row-error]');error.hidden=!bad;if(bad){valid=false;el.setAttribute('aria-invalid','true');error.textContent='Use an empty cell or a number between −1 billion and 1 billion.';}else{el.removeAttribute('aria-invalid');row.value=value;}}
 }
 function render(){
  readInputs();const m=valid?calculateWorksheet(state.worksheet):null,l=valid?calculateLaunchWorksheet(state.worksheet):null;
  q('[data-validation]').hidden=valid;q('[data-validation]').textContent=valid?'':'Correct the highlighted number. Empty and zero values are allowed; incomplete worksheets can be saved.';
  for(const [attribute,defs,result]of [['data-result',metrics,m],['data-launch-result',launchMetrics,l]])for(const el of qa('['+attribute+']')){const def=defs.find(d=>d[0]===el.getAttribute(attribute));el.textContent=result?formatMetric(result[def[0]],def[2]):'Check number';}
  q('[data-results-name]').textContent=state.worksheet.name||'Your worksheet';const ul=q('[data-warnings]');ul.replaceChildren();const messages=valid?[...m.warnings,...l.warnings]:['Correct the highlighted number to recalculate.'];for(const message of messages.length?[...new Set(messages)]:['No arithmetic flags. Clinical access and source accuracy still need review.']){const li=document.createElement('li');li.textContent=message;ul.append(li);}
  q('[data-migration]').hidden=!state.migrationNotes.length;q('[data-migration]').textContent=state.migrationNotes.join(' ');
  q('[data-no-custom]').hidden=state.worksheet.customRows.length>0;
  q('[data-email-draft]').href='mailto:'+root.dataset.email+'?subject='+encodeURIComponent('Direct Primary Care worksheet: '+state.name)+'&body='+encodeURIComponent('Hi Drew,\n\nI have updated the DPC worksheet: '+state.name+'.\n\nI will attach the review JSON file with my inputs, added rows and feedback.\n\n'+state.author);
  renderMonthly(l);
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
 function listEarlier(){const select=q('[data-earlier-select]');select.replaceChildren(new Option(state.preservedWorksheets.length?'Choose an earlier worksheet':'No earlier worksheet retained',''));state.preservedWorksheets.forEach((w,i)=>select.add(new Option(w.name||'Unnamed worksheet',String(i))));}
 function listSaves(){const select=q('[data-saved-select]'),selected=select.value;select.replaceChildren(new Option('Choose a saved copy',''));for(const s of saves)select.add(new Option(s.state.name+' / '+s.state.worksheet.name+' — '+new Date(s.savedAt).toLocaleString(),s.id));select.value=selected;}
 function populate(){qa('[data-meta]').forEach(el=>el.value=state[el.dataset.meta]);qa('[data-sheet-meta]').forEach(el=>el.value=state.worksheet[el.dataset.sheetMeta]);qa('[data-input]').forEach(el=>el.value=state.worksheet.values[el.dataset.input]??'');renderRows();listEarlier();render();}
 function check(){render();if(valid){try{validateState(state);return true;}catch(e){announce(e.message);return false;}}announce('Correct the highlighted number first. Blank inputs can be saved and exported.');q('[aria-invalid="true"]')?.focus();return false;}
 function download(content,type,extension){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download='DPC-Worksheet-'+new Date().toISOString().slice(0,10)+extension;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 function edit(event){const el=event.target;if(el.matches('[data-meta]'))state[el.dataset.meta]=el.value;else if(el.matches('[data-sheet-meta]'))state.worksheet[el.dataset.sheetMeta]=el.value;
  else if(el.matches('[data-input]')){const key=launchKeys.has(el.dataset.input)?'launchBasis':'basis';if(state.worksheet[key]==='Reference assumptions'){state.worksheet[key]='Ballpark estimates';q('[data-sheet-meta="'+key+'"]').value='Ballpark estimates';}}
  else if(el.matches('[data-row-field]')){const card=el.closest('[data-custom-row]'),row=state.worksheet.customRows.find(r=>r.id===card.dataset.customRow),key=el.dataset.rowField;if(key!=='value')row[key]=el.value;if(key==='treatment'){if(row.treatment!=='note')row.unit='USD';const unit=card.querySelector('[data-row-field="unit"]');unit.value=row.unit;unit.disabled=row.treatment!=='note';}}
  else return;render();scheduleSave();
 }
 root.addEventListener('input',edit);root.addEventListener('change',event=>{if(event.target.matches('select[data-sheet-meta],select[data-row-field]'))edit(event);});
 root.addEventListener('click',async event=>{
  const remove=event.target.closest('[data-remove-row]');if(remove){if(!window.confirm('Remove this added row and its effect on the model?'))return;state.worksheet.customRows=state.worksheet.customRows.filter(r=>r.id!==remove.dataset.removeRow);renderRows();render();scheduleSave();q('[data-action="add-row"]').focus();return;}
  const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='add-row'){const row=blankRow(Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));state.worksheet.customRows.push(row);renderRows();render();scheduleSave();qa('[data-custom-row]').at(-1).querySelector('input').focus();return;}
  if(action==='load-copy'){const copy=saves.find(s=>s.id===q('[data-saved-select]').value);if(!copy){announce('Choose a saved copy first.');return;}if(!window.confirm('Open this saved copy? Download the current worksheet first to keep any unsaved edits.'))return;state=validateState(copy.state);populate();save();announce('Saved worksheet opened.');return;}
  if(action==='delete-copy'){if(!savesWritable){announce('Unreadable saved copies remain protected.');return;}const id=q('[data-saved-select]').value;if(!id)return;if(!window.confirm('Delete this named copy? The open worksheet and earlier-version backups stay.'))return;const next=saves.filter(s=>s.id!==id);try{localStorage.setItem(SAVES,JSON.stringify(next));saves=next;listSaves();announce('Saved copy deleted.');}catch{announce('This browser could not update saved copies.');}return;}
  if(action==='restore-defaults'){if(!window.confirm('Restore the 70 prefilled figures? Your worksheet name, added rows, notes and feedback stay.'))return;state.worksheet.values={...reference};state.worksheet.basis='Reference assumptions';state.worksheet.launchBasis='Reference assumptions';populate();save();announce('Prefilled figures restored. Added rows and notes are unchanged.');return;}
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
