import { syncChoices } from './nhi-controls.mjs';
import { canonicalNhiURL } from '../lib/nhi-routes.mjs';
import { peopleStateFromParams,peopleParams,peopleInitialState,filterPeople,personURL } from '../lib/ufo-people.mjs';

const getSaved=key=>{try{return sessionStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{sessionStorage.setItem(key,value);}catch{}};
const localPath=(value,prefix)=>{try {if(!value)return null;const u=canonicalNhiURL(value,location.origin);return u && u.pathname.startsWith(prefix)?u.pathname+u.search+u.hash:null;}catch{return null;}};

function initialiseCommon() {
  const previous=localPath(getSaved('ufos.timeline.return'),'/nhi/');
  if(previous && !previous.startsWith('/nhi/people/'))for(const link of document.querySelectorAll('[data-return-timeline]')){const url=new URL(previous,location.origin);url.searchParams.set('resume','1');link.href=url.pathname+url.search+url.hash;}
  const directory=localPath(getSaved('ufos.people.return'),'/nhi/people/');
  if(directory)for(const link of document.querySelectorAll('[data-return-people]'))link.href=directory;
  const failed=image=>{image.hidden=true;image.parentElement.classList.add('portrait-unavailable');};
  document.addEventListener('error',event=>{if(event.target.matches?.('[data-portrait]'))failed(event.target);},true);
  for(const image of document.querySelectorAll('[data-portrait]'))if(image.complete && image.naturalWidth===0)failed(image);
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('[data-person-timeline],[data-related-event]');
    if(!link)return;
    save('ufos.people.return',location.pathname+location.search+location.hash);
    save('ufos.people.name',document.querySelector('[data-profile-heading]')?.textContent || 'people');
    const destination=new URL(link.href);destination.searchParams.set('via','people');link.href=destination.href;
  });
  const openHash=()=>{
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target)return;
    for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
  };
  window.addEventListener('hashchange',openHash);openHash();
}

function initialiseDirectory() {
  const dataNode=document.getElementById('people-index');if(!dataNode)return;
  const index=JSON.parse(dataNode.textContent),form=document.getElementById('people-filters');
  const grid=document.getElementById('people-grid'),panel=document.getElementById('people-profile-panel');
  const content=document.getElementById('person-content'),notice=document.getElementById('people-notice');
  const cards=new Map([...grid.querySelectorAll('[data-person]')].map(n=>[n.dataset.person,n]));
  const cache=new Map();let request=0,controller,timer,origin=null;
  let state=peopleStateFromParams(new URLSearchParams(location.search));
  if(!state.person && location.hash.startsWith('#entity-'))state.person=location.hash.slice(8);
  try{const savedOrigin=JSON.parse(getSaved('ufos.people.origin'));if(savedOrigin?.id===state.person && Number.isFinite(savedOrigin.scroll))origin=savedOrigin;}catch{}
  const control=key=>form.elements.namedItem(key);
  const remember=()=>save('ufos.people.return',location.pathname+location.search+location.hash);
  const writeURL=mode=>{
    if(!mode)return;
    const url=new URL(location.href);url.search=peopleParams(state).toString();url.hash=state.person?'entity-'+state.person:'people';
    history[mode==='push'?'pushState':'replaceState'](null,'',url);remember();
  };
  const stampPosition=()=>history.replaceState({peopleScroll:window.scrollY,personFocus:state.person || null},'',location.href);
  function clearProfile() {
    request++;controller?.abort();panel.hidden=true;content.replaceChildren();
    for(const card of cards.values())card.querySelector('.person-open').setAttribute('aria-expanded','false');
  }
  async function showProfile(focus=false) {
    const id=state.person;
    if(!id){clearProfile();return;}
    const card=cards.get(id);
    if(!card){clearProfile();notice.textContent='That profile could not be found. Search the directory below.';return;}
    const token=++request;controller?.abort();controller=new AbortController();
    for(const c of cards.values())c.querySelector('.person-open').setAttribute('aria-expanded',String(c===card));
    const matches=filterPeople(index,state).some(n=>n.id===id);
    card.hidden=false;card.after(panel);panel.hidden=false;content.setAttribute('aria-busy','true');
    document.getElementById('person-permalink').href=personURL(id);
    content.textContent='Loading profile…';notice.textContent=matches?'':'The linked profile is shown alongside your filtered results.';
    try {
      let markup=cache.get(id);
      if(!markup) {
        const response=await fetch(personURL(id),{signal:controller.signal});
        if(!response.ok)throw new Error('Profile response '+response.status);
        const documentCopy=new DOMParser().parseFromString(await response.text(),'text/html');
        const article=documentCopy.querySelector('[data-profile]');
        if(!article || article.dataset.profile!==id)throw new Error('Profile identity mismatch');
        markup=article.outerHTML;cache.set(id,markup);
      }
      if(token!==request)return;
      // Only same-origin, build-generated profile markup is accepted. No scripts are copied.
      const parsed=new DOMParser().parseFromString(markup,'text/html');
      const article=parsed.querySelector('[data-profile]');
      for(const element of article.querySelectorAll('script,iframe,object,embed'))element.remove();
      for(const heading of [...article.querySelectorAll('h1,h2,h3')]) {
        const replacement=document.createElement('h'+(Number(heading.tagName[1])+1));
        for(const attribute of heading.attributes)replacement.setAttribute(attribute.name,attribute.value);
        replacement.replaceChildren(...heading.childNodes);heading.replaceWith(replacement);
      }
      content.replaceChildren(document.importNode(article,true));content.removeAttribute('aria-busy');
      if(focus){content.firstElementChild.focus({preventScroll:true});panel.scrollIntoView({block:'start'});}
    }catch(error){
      if(error.name==='AbortError' || token!==request)return;
      content.replaceChildren();const paragraph=document.createElement('p');paragraph.textContent='Inline loading is unavailable. The complete profile is available on its own page.';
      const link=document.createElement('a');link.href=personURL(id);link.className='button button-outline';link.textContent='Read the full profile →';content.append(paragraph,link);content.removeAttribute('aria-busy');
    }
  }
  function render(mode,focusProfile=false) {
    control('q').value=state.q;for(const option of control('role').options)option.selected=state.role.includes(option.value);control('sort').value=state.sort;control('featured').checked=state.featured;syncChoices(form);
    const results=filterPeople(index,state),shown=new Set(results.map(n=>n.id));
    for(const card of cards.values())card.hidden=!shown.has(card.dataset.person);
    for(const entry of results)grid.append(cards.get(entry.id));
    document.getElementById('people-count').textContent=`${results.length} of ${index.length} people${state.featured?' · featured contributors':''}`;
    document.getElementById('people-empty').hidden=results.length!==0;
    notice.textContent='';writeURL(mode);void showProfile(focusProfile);
  }
  function reset() {clearTimeout(timer);state={...peopleInitialState,sort:state.sort};render('push');control('q').focus();}
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);state.person='';render('push');});
  form.addEventListener('reset',event=>{event.preventDefault();reset();});
  form.addEventListener('input',event=>{
    if(event.target.name!=='q')return;clearTimeout(timer);state.q=event.target.value;state.person='';timer=setTimeout(()=>render('replace'),150);
  });
  form.addEventListener('change',event=>{
    if(!['q','role','sort','featured'].includes(event.target.name))return;clearTimeout(timer);
    state[event.target.name]=event.target.multiple?[...event.target.selectedOptions].map(o=>o.value):event.target.type==='checkbox'?event.target.checked:event.target.value;state.person='';render('push');
  });
  grid.addEventListener('click',event=>{
    const link=event.target.closest?.('.person-open');if(!link || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    event.preventDefault();clearTimeout(timer);const id=link.closest('[data-person]').dataset.person;
    origin={id,scroll:window.scrollY};save('ufos.people.origin',JSON.stringify(origin));stampPosition();state.person=id;render('push',true);
  });
  document.getElementById('close-person').addEventListener('click',()=>{
    const id=state.person;state.person='';render('push');const link=cards.get(origin?.id || id)?.querySelector('.person-open');
    link?.focus({preventScroll:true});if(origin)window.scrollTo(0,origin.scroll);else link?.scrollIntoView({block:'center'});
  });
  document.getElementById('people-empty-reset').addEventListener('click',reset);
  window.addEventListener('popstate',event=>{
    state=peopleStateFromParams(new URLSearchParams(location.search));render(null,Boolean(state.person));
    if(!state.person && Number.isFinite(event.state?.peopleScroll))requestAnimationFrame(()=>window.scrollTo(0,event.state.peopleScroll));
  });
  window.addEventListener('pagehide',stampPosition);
  render(null,Boolean(state.person));form.hidden=false;remember();
}
initialiseCommon();initialiseDirectory();
