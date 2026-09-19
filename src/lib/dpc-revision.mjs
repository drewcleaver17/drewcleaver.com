export function centralTimestamp(iso){
 const date=new Date(iso);if(!Number.isFinite(date.getTime()))throw Error('Invalid revision timestamp');
 const options={timeZone:'America/Chicago',year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'};
 const label=new Intl.DateTimeFormat('en-US',options).format(date);
 const offset=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'longOffset'}).formatToParts(date).find(x=>x.type==='timeZoneName').value.replace('GMT','UTC');
 return label+' ('+offset+')';
}
