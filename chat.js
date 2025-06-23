const $ = id=>document.getElementById(id);
const th=$('chatThread'), inp=$('chatInput'), btn=$('sendBtn');
const fsel=$('fileInput'), selWrap=$('wrapIndustrySelect'),
      sel=$('industrySelect');

let convo=[], images=[], turns=0, MAX_FREE=15;
let state={ company_name:null, city:null, industry:null,
            language:null, services:null };

const RX_COMP = /([A-Z][\w-]+\s+[A-Z][\w-]+)/;      // two capitalised words
const RX_INDS = /(dental|plumb|lawn|roof|legal|lawyer|marketing|shoe|retail)/i;

function bubble(role,text){ const d=document.createElement('div');
  d.className=`bubble ${role==='user'?'user':'ai'}`; d.innerHTML=text;
  th.appendChild(d); th.scrollTop=th.scrollHeight; }

function addFiles(list){ for(const f of list)
  (f.type.startsWith('image/'))&&(images.push(f),bubble('user','📷 image attached'));
  fsel.value=''; }

async function sendUser(){
  const txt=inp.innerText.trim();
  if(!txt&&!fsel.files.length) return;
  if(txt) bubble('user',txt); addFiles(fsel.files);
  convo.push({role:'user',content:txt}); inp.textContent='';
  if(++turns>MAX_FREE){ paywall(); return; }

  /* client-side soft fill */
  if(!state.company_name){ const m=txt.match(RX_COMP); if(m) state.company_name=m[1]; }
  if(!state.industry){ const m=txt.match(RX_INDS); if(m) state.industry=guessIndustry(m[1]); }

  const fd=new FormData();
  fd.append('prompt',JSON.stringify(convo));
  images.forEach(f=>fd.append('images',f));
  const j=await(await fetch('/api/analyse',{method:'POST',body:fd})).json();
  mergeState(j); handleMissing(j);
}

function guessIndustry(word){
  const map={dental:'Dental',plumb:'Plumbing',lawn:'Landscaping',
             roof:'Roofing',legal:'Legal',lawyer:'Legal',
             marketing:'Advertising & Marketing',
             shoe:'Shoes & Apparel',retail:'Retail'};
  for(const k in map) if(word.toLowerCase().includes(k)) return map[k];
  return null;
}

function mergeState(r){
  ['company_name','city','industry','language','services'].forEach(k=>{
    if(r[k]) state[k]=r[k];
  });
}

function handleMissing(r){
  let miss=r.missing_fields||[];
  /* If GPT low-confidence industry, miss already has "industry" */

  if(miss.includes('industry')){
    selWrap.classList.remove('hidden');
    sel.onchange=()=>{
      state.industry=sel.value; selWrap.classList.add('hidden');
      askNext(); };
    return;
  }
  askNext();
}

function askNext(){
  const miss=Object.keys(state).filter(k=>state[k]===null);
  if(!miss.length){ bubble('ai','Great! Generating your site…'); return; }
  const key=miss[0];
  const Q={
    company_name:'What's the name of your business?',
    city:'Which city do you mainly serve?',
    language:'What primary language should the website use?',
    services:'List your most important services or products.'
  }[key]||`Please provide your ${key}.`;
  const lastAI=convo.filter(m=>m.role==='assistant').pop()?.content;
  if(lastAI!==Q){ bubble('ai',Q); convo.push({role:'assistant',content:Q}); }
}

function paywall(){ bubble('ai','Free limit reached – <a href="/pricing">upgrade</a> to continue.');
  $('chatFooter').style.display='none'; }

btn.onclick=sendUser;
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendUser();}});
fsel.onchange=()=>addFiles(fsel.files);

// Initialize with greeting
bubble('ai', 'Hi! Tell me about your business and I'll help you create a website.');