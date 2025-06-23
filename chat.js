const $ = id => document.getElementById(id);
const thread = $('chatThread'), input = $('chatInput'),
      send = $('sendBtn'), files = $('fileInput'),
      dropArea = $('dropArea');

const RX_INDS = /(dental|plumb|lawn|roof|legal|marketing|shoe|retail)/i;

let convo = [], state = {company_name: null, city: null, industry: null,
                         language: null, services: null}, images = [],
    turns = 0, MAX_FREE = 15;

let awaitingKey = null;   // (company_name, city, industry, …)

// bubble helper
function bubble(role, txt) { 
  const d = document.createElement('div');
  d.className = `bubble ${role === 'user' ? 'user' : 'ai'}`;
  d.textContent = txt;
  thread.appendChild(d);
  thread.scrollTop = thread.scrollHeight;
}

// local regex fallback for industry only
function softFillIndustry(text) {
  if (!state.industry) {
    const m = text.match(RX_INDS);
    if (m) state.industry = guessIndustry(m[1]);
  }
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

  // If we just asked for a specific key, take today's reply verbatim
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
    mergeState(j);
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

function handleMissing(r) {
  let miss = r.missing_fields || [];
  miss = miss.filter(k => state[k] === null);     // drop any we just filled
  if (!miss.length) {
    bubble('ai', 'Great! Generating your site...');
    
    // Save data to server
    fetch('/api/build-site', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ convo, state })
    });
    
    return;
  }

  const key = miss[0];
  const questions = {
    company_name: 'What is the name of your business?',
    city: 'Which city do you mainly serve?',
    industry: 'What industry best describes your business?',
    language: 'What primary language should the website use?',
    services: 'List your most important services or products.'
  };
  const Q = questions[key] || `Please provide your ${key}.`;

  const lastAI = convo.filter(m => m.role === 'assistant').pop()?.content;
  if (lastAI !== Q) {
    awaitingKey = key;
    bubble('ai', Q);
    convo.push({role: 'assistant', content: Q});
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