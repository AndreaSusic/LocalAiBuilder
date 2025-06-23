const $ = id => document.getElementById(id);
const thread = $('chatThread'), input = $('chatInput'),
      send = $('sendBtn'), files = $('fileInput'),
      dropArea = $('dropArea'), selWrap = $('wrapIndustrySelect'),
      sel = $('industrySelect');

const RX_INDS = /(dental|plumb|lawn|roof|legal|marketing|shoe|retail)/i;

let convo = [], state = {company_name: null, city: null, industry: null,
                         language: null, services: null}, images = [],
    turns = 0, MAX_FREE = 15;

let awaitingKey = null;   // (company_name, city, industry, …)

// bubble helper
function bubble(role, txt) { 
  const d = document.createElement('div');
  d.className = `bubble ${role === 'user' ? 'user' : 'ai'}`;
  d.innerHTML = txt;
  thread.appendChild(d);
  thread.scrollTop = thread.scrollHeight;
}

function guessIndustry(word) {
  const map = {
    dental: 'Dental',
    plumb: 'Plumbing',
    lawn: 'Landscaping',
    roof: 'Roofing',
    legal: 'Legal',
    marketing: 'Advertising & Marketing',
    shoe: 'Shoes & Apparel',
    retail: 'Retail'
  };
  for (const k in map) {
    if (word.toLowerCase().includes(k)) return map[k];
  }
  return null;
}

// send logic
async function sendUser() {
  const text = input.innerText.trim();
  if (!text && !files.files.length) return;

  // If we just asked for a specific key, take reply verbatim
  if (awaitingKey && text) {
    state[awaitingKey] = text.trim();
    awaitingKey = null;     // reset
  }

  if (text) bubble('user', text);        // preview
  if (files.files.length) bubble('user', '📷 image attached');

  // soft industry mapping only
  if (!state.industry) { 
    const m = text.match(RX_INDS);
    if (m) state.industry = guessIndustry(m[1]); 
  }

  convo.push({role: 'user', content: text});
  images.push(...files.files);
  files.value = '';
  input.textContent = '';

  if (++turns > MAX_FREE) {
    paywall();
    return;
  }

  try {
    const fd = new FormData();
    fd.append('prompt', JSON.stringify(convo));
    images.forEach(f => fd.append('images', f));

    const res = await fetch('/api/analyse', {method: 'POST', body: fd});
    const j = await res.json();
    handleMissing(j);
  } catch (error) {
    console.error('Error:', error);
    bubble('ai', 'Sorry, something went wrong. Please try again.');
  }
}

function mergeState(obj) {
  ['company_name', 'industry', 'language', 'services'].forEach(k => {
    if (obj[k]) state[k] = obj[k];
  });
  
  // Handle city as array or string
  if (Array.isArray(obj.city)) {
    state.city = obj.city;
  } else if (obj.city) {
    state.city = [obj.city];
  }
}

function handleMissing(res){
  mergeState(res);                    // keep existing merge

  // 1) If GPT flagged low-confidence industry, show dropdown once
  if(state.industry===null && (res.missing_fields||[]).includes('industry')){
    selWrap.classList.remove('hidden');
    sel.onchange = () =>{
      state.industry = sel.value;
      selWrap.classList.add('hidden');
      askNextQuestion();
    };
    return;  // wait for user to pick
  }

  askNextQuestion();
}

function askNextQuestion(){
  const order = ['company_name','city','industry','language','services'];
  const next  = order.find(k => state[k] === null);

  if(!next){
    bubble('ai','Great! Generating your site...');
    
    // Save data to server
    fetch('/api/build-site', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ convo, state })
    });
    
    return;
  }

  const questions = {
    company_name: 'What is the name of your business?',
    city: 'Which city do you mainly serve?',
    industry: 'What industry best describes your business?',
    language: 'What primary language should the website use?',
    services: 'List your most important services or products.'
  };
  const Q = questions[next];

  const lastAI = convo.filter(m => m.role === 'assistant').pop()?.content;
  if (lastAI !== Q){
    bubble('ai', Q);
    convo.push({role:'assistant', content: Q});
    awaitingKey = next;                 // remember what we just asked
  }
}

function paywall() {
  bubble('ai', 'Free limit reached - <a href="/pricing">upgrade to Pro</a>.');
  document.getElementById('chatFooter').style.display = 'none';
}

// events
send.onclick = sendUser;
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendUser();
  }
});

// File upload and drag-drop events
files.onchange = () => {
  if (files.files.length) bubble('user', '📷 image attached');
};

dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', e => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  
  const droppedFiles = Array.from(e.dataTransfer.files);
  const imageFiles = droppedFiles.filter(f => f.type.startsWith('image/'));
  
  if (imageFiles.length > 0) {
    images.push(...imageFiles);
    bubble('user', `📷 ${imageFiles.length} image(s) attached`);
  }
});

// Initialize with greeting
bubble('ai', 'Hi! Tell me about your business and I will help you create a website.');