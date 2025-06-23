const $ = id => document.getElementById(id);
const thread = $('chatThread'), input = $('chatInput'),
      send = $('sendBtn'), selWrap = $('wrapIndustrySelect'),
      sel = $('industrySelect');

const RX_INDS = /(dental|plumb|lawn|roof|legal|marketing|shoe|retail)/i;

let convo = [], state = {company_name: null, city: null, industry: null,
                         language: null, services: null, colours: null}, images = [],
    turns = 0, MAX_FREE = 15;

let awaitingKey = null;

// bubble helper
function bubble(role, txt) { 
  const d = document.createElement('div');
  d.className = `bubble ${role === 'user' ? 'user' : 'ai'}`;
  d.innerHTML = txt;
  thread.appendChild(d);
  thread.scrollTop = thread.scrollHeight;
}

// Create color picker inline
function createColorPicker() {
  const wrapper = document.createElement('div');
  wrapper.id = 'inlineColorPicker';
  wrapper.innerHTML = `
    <div style="margin:1rem 0;padding:.8rem;border:1px dashed #bbb;border-radius:8px;">
      Pick two brand colours:<br>
      Primary <input type="color" id="col1" value="#ffc000">
      Secondary <input type="color" id="col2" value="#000000">
      <button id="colourDone" style="padding:12px 24px;font-size:16px;background:#ffc000;border:none;border-radius:6px;cursor:pointer;margin-top:8px;">Confirm</button>
    </div>
  `;
  thread.appendChild(wrapper);
  thread.scrollTop = thread.scrollHeight;
  
  // Bind event handler
  wrapper.querySelector('#colourDone').onclick = () => {
    state.colours = [wrapper.querySelector('#col1').value, wrapper.querySelector('#col2').value];
    wrapper.remove();
    handleMissing({});
  };
}

// Create drop zone inline
function createDropZone() {
  const wrapper = document.createElement('div');
  wrapper.id = 'inlineDropZone';
  wrapper.innerHTML = `
    <div style="border:2px dashed #bbb;border-radius:8px;padding:1rem;text-align:center;color:#666;margin:1rem 0;">
      <p>Drag & drop images/logo here or <label class="file-label" style="color:#0050c8;cursor:pointer;text-decoration:underline;">browse files
        <input type="file" accept="image/*" multiple hidden>
      </label></p>
    </div>
  `;
  thread.appendChild(wrapper);
  thread.scrollTop = thread.scrollHeight;
  
  const dropZone = wrapper.querySelector('div');
  const fileInput = wrapper.querySelector('input[type="file"]');
  
  // File input handler
  fileInput.onchange = () => {
    if (fileInput.files.length) {
      images.push(...fileInput.files);
      bubble('user', `📷 ${fileInput.files.length} image(s) attached`);
      wrapper.remove();
      handleMissing({});
    }
  };
  
  // Drag and drop handlers
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#ffc000';
    dropZone.style.background = '#fffbe9';
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#bbb';
    dropZone.style.background = 'transparent';
  });
  
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#bbb';
    dropZone.style.background = 'transparent';
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      images.push(...imageFiles);
      bubble('user', `📷 ${imageFiles.length} image(s) attached`);
      wrapper.remove();
      handleMissing({});
    }
  });
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
    awaitingKey = null;
  }

  if (text) bubble('user', text);
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
  mergeState(res);

  // Step 1: Ask for text Qs (company, city, industry, language, services)
  const order = ['company_name','city','industry','language','services'];
  const next  = order.find(k=>state[k]===null);

  if(next){
    const Q={
      company_name:'What\'s the name of your business?',
      city:'Which city do you mainly serve?',
      industry:'What industry best describes your business?',
      language:'What primary language should the website use?',
      services:'List your most important services or products.'
    }[next];
    const lastAI=convo.filter(m=>m.role==='assistant').pop()?.content;
    if(lastAI!==Q){
      bubble('ai',Q); convo.push({role:'assistant',content:Q});
      awaitingKey=next;
    }
    return;
  }

  // Step 2: If colours missing, show picker inline and wait
  if(state.colours===null){
    const lastAI=convo.filter(m=>m.role==='assistant').pop()?.content;
    if(lastAI!=='Please pick two brand colours.' && !document.getElementById('inlineColorPicker')){
      bubble('ai','Please pick two brand colours.');
      convo.push({role:'assistant',content:'Please pick two brand colours.'});
      createColorPicker();
    }
    return;  // wait for Done
  }

  // Step 3: If images missing, show drop-zone inline and wait for file
  if(images.length===0 && !document.getElementById('inlineDropZone')){
    bubble('ai','Can you upload images and a logo for me to use on your website?');
    convo.push({role:'assistant',content:'Please upload images or logo.'});
    createDropZone();
    return;
  }

  // Step 4: If everything is ready, generate
  bubble('ai','Great! Generating your site…');
  fetch('/api/build-site',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({state, convo})
  });
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

// File input removed from footer

// Initialize chat without greeting - starts clean