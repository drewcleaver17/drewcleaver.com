import { fields, groups, reference, metrics, launchMetrics, monthlyColumns, calculate, calculateLaunch, formatMetric, money, number, newState, validateState, exportPack, reviewText, comparisonCsv } from '../lib/dpc-model.mjs';
const DRAFT_KEY='dpc:model:v2:draft',SAVES_KEY='dpc:model:v2:saves';
const LEGACY_DRAFT='metsi:model:v1:draft',LEGACY_SAVES='metsi:model:v1:saves';
export function initializeDpcModel(){
 const root=document.querySelector('[data-dpc-tool]');if(!root||root.dataset.ready)return;root.dataset.ready='true';
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 let state=newState(),timer,valid=true,saves=[],draftWritable=true,savesWritable=true,launchResults=[];
 const launchKeys=new Set(groups.slice(-2).flatMap(g=>g.fields.map(f=>f.key)));
 const announce=t=>q('[data-action-status]').textContent=t;
 try{
  const raw=localStorage.getItem(DRAFT_KEY)??localStorage.getItem(LEGACY_DRAFT);
  if(raw)state=validateState(JSON.parse(raw));
 }catch{draftWritable=false;announce('A saved draft could not be read. Autosave is paused to preserve it. You can still edit and export a new comparison.');}
 try{
  const raw=localStorage.getItem(SAVES_KEY)??localStorage.getItem(LEGACY_SAVES);
  const list=raw?JSON.parse(raw):[];
  if(!Array.isArray(list))throw new Error('Invalid saved list');
  saves=list.map(x=>{
   if(!x||typeof x.id!=='string'||typeof x.savedAt!=='string')throw new Error('Invalid named copy');
   return {id:x.id,savedAt:x.savedAt,state:validateState(x.state)};
  });
 }catch{savesWritable=false;announce('Named copies could not be read. They remain untouched in this browser. Export your open comparison to keep new work.');}
 qa('[data-enhanced]').forEach(el=>el.hidden=false);qa('[data-input]').forEach(el=>el.disabled=false);
 function saveDraft(){
  clearTimeout(timer);timer=null;if(!valid)return;
  state.updatedAt=new Date().toISOString();
  if(!draftWritable){q('[data-save-status]').textContent='Autosave is unavailable or paused to protect an unreadable draft. Download a review file to keep your changes.';return;}
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(state));q('[data-save-status]').textContent='Saved in this browser at '+new Date(state.updatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'. Export for a durable backup.';}
  catch{q('[data-save-status]').textContent='This browser could not save your changes. Download a review file to keep them.';}
 }
 function scheduleSave(){clearTimeout(timer);if(valid){q('[data-save-status]').textContent='Saving changes in this browser…';timer=setTimeout(saveDraft,450);}else q('[data-save-status]').textContent='Saving is paused until the highlighted input is complete.';}
 function populate(){
  qa('[data-meta]').forEach(el=>el.value=state[el.dataset.meta]);
  qa('[data-scenario-meta]').forEach(el=>el.value=state.scenarios[Number(el.dataset.scenario)][el.dataset.scenarioMeta]);
  qa('[data-input]').forEach(el=>{el.value=state.scenarios[Number(el.dataset.scenario)].values[el.dataset.input]??'';el.removeAttribute('aria-invalid');q(`[data-error="${el.dataset.scenario}-${el.dataset.input}"]`).hidden=true;});
  valid=true;render();
 }
 function drawChart(svg,series,title){
  const NS='http://www.w3.org/2000/svg';svg.replaceChildren();svg.setAttribute('viewBox','0 0 360 230');svg.setAttribute('aria-label',title);
  const add=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;svg.append(e);return e;};
  add('title',{},title);if(!series.length)return;
  const all=series.flatMap(s=>s.values),min=Math.min(0,...all),max=Math.max(0,...all);const span=max-min||1;
  const left=62,top=22,width=276,height=169,n=series[0].values.length;
  const y=v=>top+(max-v)/span*height;
  const axis=n=>Math.abs(n)>=1000000?(n<0?'-$':'$')+number(Math.abs(n)/1000000)+'m':Math.abs(n)>=1000?(n<0?'-$':'$')+number(Math.abs(n)/1000)+'k':money(n);
  for(let i=0;i<4;i++){const val=max-span*i/3,yy=y(val);add('line',{x1:left,x2:left+width,y1:yy,y2:yy,stroke:'#c9d3c2','stroke-width':1});add('text',{x:left-7,y:yy+4,'text-anchor':'end','font-size':12,fill:'#53665a'},axis(val));}
  for(const s of series){const d=s.values.map((v,i)=>(i?'L':'M')+(left+i/(n-1)*width).toFixed(2)+' '+y(v).toFixed(2)).join(' ');add('path',{d,fill:'none',stroke:s.color,'stroke-width':2.4,...(s.dashed?{'stroke-dasharray':'6 4'}:{})});}
  for(const m of [...new Set([1,12,24,n])].filter(m=>m<=n))add('text',{x:left+(m-1)/(n-1)*width,y:210,'text-anchor':'middle','font-size':12,fill:'#53665a'},String(m));
  add('text',{x:200,y:226,'text-anchor':'middle','font-size':11,fill:'#53665a'},'Planning month');
 }
 function drawMonthly(){
  const i=Number(q('[data-launch-scenario]').value),r=launchResults[i];
  const name=i===0?'Reference assumptions':state.scenarios[i-1].name||`Scenario ${i}`;
  q('[data-launch-title]').textContent=name+' · '+(i===0?reference:state.scenarios[i-1].values).horizonMonths+' planning months';
  q('[data-monthly-caption]').textContent=name+' — monthly launch detail';
  q('[data-launch-invalid]').hidden=Boolean(r);q('[data-monthly-body]').replaceChildren();
  if(!r){drawChart(q('[data-chart="operations"]'),[],'Complete inputs to show this chart');drawChart(q('[data-chart="cash"]'),[],'Complete inputs to show this chart');q('[data-cash-chart-title]').textContent='Cash view unavailable';q('[data-cash-chart-note]').textContent='';return;}
  drawChart(q('[data-chart="operations"]'),[{values:r.rows.map(x=>x.revenue),color:'#173e35'},{values:r.rows.map(x=>x.costs),color:'#986626',dashed:true}],name+': monthly earned revenue and operating costs');
  let cashValues,title,note;
  if(r.endingCash!==null){cashValues=r.rows.map(x=>x.cashBalance);title='Month-end cash balance';note='Includes opening cash, the financing draw, startup spending and entered debt payments. Negative cash needs funding. Unearned annual dues remain an obligation.';}
  else if(r.grossFundingNeed!==null){cashValues=r.rows.map(x=>x.cumulativeRecovery);title='Cumulative cash before financing';note='Includes startup spending and debt payments. Excludes opening cash and financing. This is not the business’s funded bank balance.';}
  else{let cumulative=0;cashValues=r.rows.map(x=>cumulative+=x.receipts-x.costs-x.debtPayment);title='Operating cash before startup or financing';note='Startup spending is unknown. This partial view excludes it, opening cash and financing. It does not establish total funding needs.';}
  q('[data-cash-chart-title]').textContent=title;q('[data-cash-chart-note]').textContent=note;
  drawChart(q('[data-chart="cash"]'),[{values:cashValues,color:'#235c48'}],name+': '+title);
  const fragment=document.createDocumentFragment();
  for(const row of r.rows){const tr=document.createElement('tr');tr.dataset.overCapacity=String(row.overCapacity);for(const [key,,type]of monthlyColumns){const cell=document.createElement(key==='month'?'th':'td');if(key==='month')cell.scope='row';cell.textContent=formatMetric(row[key],type);tr.append(cell);}fragment.append(tr);}
  q('[data-monthly-body]').append(fragment);
 }
 function render(){
  const bad=[false,false];
  qa('[data-input]').forEach(el=>{
   const f=fields.find(f=>f.key===el.dataset.input),empty=el.value.trim()==='',n=empty?null:Number(el.value);
   const isBad=(empty&&!f.nullable)||(!empty&&(!Number.isFinite(n)||n<f.min||n>f.max||(f.step===1&&!Number.isInteger(n))));
   const error=q(`[data-error="${el.dataset.scenario}-${f.key}"]`);
   if(isBad){bad[Number(el.dataset.scenario)]=true;el.setAttribute('aria-invalid','true');error.textContent=`Enter ${f.min}–${f.max}${f.step===1?' (whole number)':''}.`;error.hidden=false;}
   else{el.removeAttribute('aria-invalid');error.hidden=true;state.scenarios[Number(el.dataset.scenario)].values[f.key]=n;}
  });
  valid=!bad.some(Boolean);q('[data-validation]').hidden=valid;q('[data-validation]').textContent=valid?'':'Complete the highlighted inputs. That column’s results are unavailable and exports are paused.';
  const results=[calculate(reference),...state.scenarios.map((s,i)=>bad[i]?null:calculate(s.values))];
  launchResults=[calculateLaunch(reference),...state.scenarios.map((s,i)=>bad[i]?null:calculateLaunch(s.values))];
  for(const [attribute,defs,outputs] of [['data-result',metrics,results],['data-launch-result',launchMetrics,launchResults]]){
   qa(`[${attribute}]`).forEach(el=>{const i=Number(el.dataset.resultColumn),r=outputs[i],def=defs.find(m=>m[0]===el.getAttribute(attribute));el.textContent=r?formatMetric(r[def[0]],def[2]):'Check inputs';el.dataset.label=i===0?'Reference assumptions':state.scenarios[i-1].name||`Scenario ${i}`;});
  }
  qa('[data-column-name]').forEach(el=>{const i=Number(el.dataset.columnName);if(i>=0)el.textContent=state.scenarios[i].name||`Scenario ${i+1}`;});
  qa('[data-input]').forEach(el=>{const f=fields.find(f=>f.key===el.dataset.input);el.setAttribute('aria-label',f.label+': '+(state.scenarios[Number(el.dataset.scenario)].name||'Unnamed scenario'));});
  [...q('[data-launch-scenario]').options].forEach((option,i)=>option.textContent=i===0?'Reference assumptions':state.scenarios[i-1].name||`Scenario ${i}`);
  for(let i=0;i<2;i++){
   const name=state.scenarios[i].name||`Scenario ${i+1}`;q(`[data-check-title="${i}"]`).textContent=name+': items to resolve';q(`[data-notes-label="${i}"]`).textContent=name+': sources and notes';
   const ul=q(`[data-warnings="${i}"]`);ul.replaceChildren();
   const warnings=results[i+1]?[...results[i+1].warnings,...launchResults[i+1].warnings]:['Complete the highlighted input to recalculate.'];
   for(const text of warnings.length?[...new Set(warnings)]:['No arithmetic or target flags. Clinical access and input accuracy still need review.']){const li=document.createElement('li');li.textContent=text;ul.append(li);}
  }
  if(valid){const a=results[1],b=results[2],d=b.surplus-a.surplus;q('[data-comparison]').textContent=`${state.scenarios[1].name||'Proposed'} versus ${state.scenarios[0].name||'Practice'}: ${d>=0?'+':''}${money(d)} annual mature operating surplus${a.margin!==null&&b.margin!==null?' and '+(b.margin-a.margin>=0?'+':'')+number(b.margin-a.margin)+' percentage points of margin':''}.`;}
  else q('[data-comparison]').textContent='Complete both columns to compare changes.';
  qa('[data-inline-summary]').forEach(el=>el.textContent=q('[data-comparison]').textContent);
  q('[data-migration]').hidden=!state.migration;q('[data-migration]').textContent=state.migration?.note||'';
  const subject=encodeURIComponent('Direct Primary Care model feedback: '+state.name);
  q('[data-email-draft]').href=`mailto:${root.dataset.email}?subject=${subject}&body=${encodeURIComponent('Hi Drew,\n\nI have a new Direct Primary Care comparison to discuss: '+state.name+'.\n\nI will attach the review JSON file with both scenarios, sources and feedback.\n\n'+(state.author||''))}`;
  drawMonthly();
 }
 function listSaves(){const select=q('[data-saved-select]'),selected=select.value;select.replaceChildren(new Option('Choose a saved copy',''));saves.forEach(s=>select.add(new Option(s.state.name+' — '+new Date(s.savedAt).toLocaleString(),s.id)));select.value=selected;}
 function download(content,mime,extension){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='DPC-Review-'+new Date().toISOString().slice(0,10)+extension;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 const requireValid=()=>{render();if(valid)return true;announce('Complete the highlighted numbers before saving, copying or exporting.');q('[aria-invalid="true"]')?.focus();return false;};
 root.addEventListener('input',event=>{
  const el=event.target;
  if(el.matches('[data-meta]'))state[el.dataset.meta]=el.value;
  else if(el.matches('[data-scenario-meta]'))state.scenarios[Number(el.dataset.scenario)][el.dataset.scenarioMeta]=el.value;
  else if(!el.matches('[data-input]'))return;
  if(el.matches('[data-input]')){const i=Number(el.dataset.scenario),key=launchKeys.has(el.dataset.input)?'launchBasis':'basis';if(state.scenarios[i][key]==='Reference assumptions'){state.scenarios[i][key]='Ballpark estimates';q(`[data-scenario-meta="${key}"][data-scenario="${i}"]`).value='Ballpark estimates';}}
  render();scheduleSave();
 });
 root.addEventListener('change',event=>{
  const el=event.target;
  if(el.matches('[data-launch-scenario]')){drawMonthly();return;}
  if(el.matches('select[data-scenario-meta]')){state.scenarios[Number(el.dataset.scenario)][el.dataset.scenarioMeta]=el.value;render();scheduleSave();}
 });
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='load-copy'){
   const found=saves.find(s=>s.id===q('[data-saved-select]').value);if(!found){announce('Choose a saved copy first.');return;}
   if(!window.confirm('Load this saved comparison? Export current edits first if you want to keep them.'))return;
   state=validateState(found.state);populate();saveDraft();announce('Saved comparison loaded. Any migration notes appear above the inputs.');return;
  }
  if(action==='delete-copy'){
   if(!savesWritable){announce('Named copies remain protected because they could not be read.');return;}
   const id=q('[data-saved-select]').value;if(!id){announce('Choose a saved copy first.');return;}
   if(!window.confirm('Delete this named copy from the current tool? Your open comparison and any earlier-version backup stay.'))return;
   const remaining=saves.filter(s=>s.id!==id);try{localStorage.setItem(SAVES_KEY,JSON.stringify(remaining));saves=remaining;listSaves();announce('Named copy deleted. The open comparison is unchanged.');}catch{announce('This browser could not update saved copies.');}return;
  }
  if(action==='reset-current'||action==='reset-proposed'){
   const i=action==='reset-current'?0:1;if(!window.confirm('Reset this column’s numbers and notes to the reference? The other column and shared feedback stay.'))return;
   state.scenarios[i]={...newState().scenarios[i],name:state.scenarios[i].name};populate();saveDraft();announce('Column reset to reference assumptions.');return;
  }
  if(!requireValid())return;
  if(action==='copy-current'){
   if(!window.confirm('Replace the proposed column with the practice inputs and notes?'))return;
   state.scenarios[1]={...structuredClone(state.scenarios[0]),name:state.scenarios[1].name};populate();saveDraft();announce('Inputs copied. The columns now edit independently.');
  }else if(action==='save-copy'){
   if(!savesWritable){announce('Named copies remain protected because they could not be read. Download a review file instead.');return;}
   if(saves.length>=20){announce('You have 20 named copies. Export or delete one before saving another.');return;}
   saveDraft();const copy={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),savedAt:new Date().toISOString(),state:structuredClone(state)};
   try{localStorage.setItem(SAVES_KEY,JSON.stringify([...saves,copy]));saves.push(copy);listSaves();q('[data-saved-select]').value=copy.id;announce('Named comparison saved in this browser.');}catch{announce('Could not save a named copy. Download the review file instead.');}
  }else if(action==='export-json'){download(JSON.stringify(exportPack(state),null,2),'application/json','.json');announce('Review file downloaded. Attach it when emailing Drew.');}
  else if(action==='export-csv'){download(comparisonCsv(state),'text/csv;charset=utf-8','.csv');announce('Comparison and monthly rows exported. Use the JSON review file to restore editing.');}
  else if(action==='export-text'){download(reviewText(state),'text/plain;charset=utf-8','.txt');announce('Readable summary downloaded with inputs, monthly rows and feedback.');}
  else if(action==='copy-summary'){const text=reviewText(state);try{await navigator.clipboard.writeText(text);announce('Full comparison and feedback copied.');}catch{const area=q('[data-copy-fallback]');area.value=text;area.hidden=false;area.focus();area.select();announce('Select and copy the summary below.');}}
 });
 q('[data-import]').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{if(file.size>2*1024*1024)throw new Error('This file is too large. Use a JSON review file exported by this tool.');const imported=validateState(JSON.parse(await file.text()));if(!window.confirm('Import this comparison and replace the open inputs? Export current edits first if needed.'))return;state=imported;populate();saveDraft();announce('Review file imported and results recalculated. Any added launch assumptions are disclosed above.');}
  catch(error){announce('Import failed: '+(error instanceof Error?error.message:'Invalid review file.')+' Your current comparison is unchanged.');}
  finally{event.target.value='';}
 });
 window.addEventListener('pagehide',()=>{if(timer&&valid)saveDraft();});
 window.addEventListener('storage',e=>{if(e.key===DRAFT_KEY)announce('Another tab updated the saved draft. Export this comparison before reloading if you want to keep both.');});
 populate();listSaves();
 if(!draftWritable)q('[data-save-status]').textContent='Autosave is unavailable or paused to protect an unreadable draft. Export to keep new changes.';
 else if(state.updatedAt)q('[data-save-status]').textContent='Restored the draft saved '+new Date(state.updatedAt).toLocaleString()+'. Changes autosave here.';
}
