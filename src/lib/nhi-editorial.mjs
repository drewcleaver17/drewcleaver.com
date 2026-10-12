// Editorial judgments stay separate from factual significance and evidence labels.
export const rubricVersion = 'nhi-impact-learning-v1';
export const assessmentProvenance = 'AI-assisted editorial assessment by ChatGPT; no independent human review is claimed.';
export const essentialItems = data => data.editorial?.essentialPath?.items || [];
export const essentialIDs = data => new Set(essentialItems(data).map(item=>item.eventId));
export const candidatePriority = (assessment, weights={impact:0.6,learning:0.4}) => assessment?.status==='assessed'
  ? weights.impact*(assessment.historicalImpact-1)/9 + weights.learning*(assessment.learningValue-1)/4 : null;
export function unassessedEntry(reason, reviewedOn) {
  return {status:'unassessed',historicalImpact:null,learningValue:null,rationale:reason,
    limitations:'Unassessed means insufficient reviewed evidence, not low impact or low factual certainty.',references:[],
    reviewedOn,rubricVersion,assessor:assessmentProvenance,inspectionBasis:'New or revised record awaiting an editorial consequence assessment.'};
}
export function validateEditorial(data, eventBounds, now=new Date()) {
  if(!data.editorial)return []; // Older schema/import fixtures remain readable.
  const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);},text=v=>typeof v==='string'&&Boolean(v.trim());
  const stamp=v=>/^\d{4}-\d{2}-\d{2}$/.test(v || '')&&Number.isFinite(Date.parse(v))&&v<=now.toISOString().slice(0,10);
  const ed=data.editorial,events=new Map(data.events.map(e=>[e.id,e]));
  check(ed.rubric?.version===rubricVersion,'Unsupported editorial rubric');
  check(ed.rubric?.weights?.impact===0.6 && ed.rubric?.weights?.learning===0.4,'Unexpected selection weights');
  check(text(ed.rubric?.method)&&text(ed.rubric?.scope),'Missing assessment method or evidence boundary');
  for(const e of data.events) {
    const a=ed.assessments?.[e.id];check(Boolean(a),'Missing explicit editorial status: '+e.id);if(!a)continue;
    check(['assessed','unassessed'].includes(a.status),'Invalid assessment status: '+e.id);
    check(a.status==='assessed' ? Number.isInteger(a.historicalImpact)&&a.historicalImpact>=1&&a.historicalImpact<=10&&Number.isInteger(a.learningValue)&&a.learningValue>=1&&a.learningValue<=5 : a.historicalImpact===null&&a.learningValue===null,'Invalid editorial scores: '+e.id);
    check([a.rationale,a.limitations,a.inspectionBasis].every(text)&&stamp(a.reviewedOn)&&a.rubricVersion===rubricVersion&&a.assessor===assessmentProvenance,'Incomplete assessment/provenance: '+e.id);
    check(Array.isArray(a.references)&&(a.status==='unassessed'||a.references.length>0)&&a.references.every(r=>data.sources[r.sourceId]&&text(r.supports)),'Unsupported assessment rationale: '+e.id);
    if(a.historicalImpact===10)check(text(a.foundationalJustification),'Unjustified foundational score: '+e.id);
  }
  for(const id of Object.keys(ed.assessments || {}))check(events.has(id),'Orphan assessment: '+id);
  const path=ed.essentialPath,items=path?.items || [],ids=new Set();
  check(text(path?.version)&&stamp(path?.reviewedOn)&&text(path?.selectionMethod)&&text(path?.coverageLimits),'Incomplete essential manifest');
  check(path?.count===items.length&&items.length>=80&&items.length<=120,'Essential count does not match manifest');
  let previous=null;
  for(const item of items) {
    const e=events.get(item.eventId);check(Boolean(e)&&!ids.has(item.eventId),'Unknown/duplicate essential ID: '+item.eventId);ids.add(item.eventId);
    check(e?.publicationStatus==='published'&&ed.assessments?.[item.eventId]?.status==='assessed','Ineligible essential ID: '+item.eventId);
    check(text(item.reason)&&text(item.question),'Missing essential teaching rationale: '+item.eventId);
    if(e){const key=[eventBounds(e)[0],e.id];check(Number.isFinite(key[0]),'Undated essential ID: '+e.id);check(!previous||key[0]>previous[0]||(key[0]===previous[0]&&key[1]>=previous[1]),'Essential manifest is not chronological: '+e.id);previous=key;}
  }
  check(ed.calibration?.length===12&&ed.calibration.every(c=>events.has(c.eventId)&&text(c.reasoning)),'Missing varied 12-entry calibration');
  return errors;
}
