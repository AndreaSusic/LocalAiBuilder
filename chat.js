const $ = id => document.getElementById(id);
const thread = $('chatThread'), input = $('chatInput'),
      send = $('sendBtn'), files = $('fileInput'),
      dropArea = $('dropArea'), selWrap = $('wrapIndustrySelect'),
      sel = $('industrySelect'), colourWrap = $('wrapColours'),
      col1 = $('col1'), col2 = $('col2');

const authModal = document.getElementById('authModal');
const authConfirmBtn = document.getElementById('modalContinueBtn');

if (authConfirmBtn) {
  authConfirmBtn.onclick = () => {
    // hide the modal
    if (authModal) authModal.classList.remove('open');
    // actually trigger the site‐build now that the user is authenticated
    fetch('/api/build-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, convo })
    });
  };
}

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
  sendHeight();
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
      <button id="colourDone" style="padding:1rem 2rem;font-size:1.1rem;background:#ffc000;color:#222;border:none;border-radius:6px;cursor:pointer;margin-top:1rem;">Confirm</button>
    </div>
  `;
  thread.appendChild(wrapper);
  thread.scrollTop = thread.scrollHeight;
  sendHeight();
  
  // Bind event handler
  wrapper.querySelector('#colourDone').onclick = () => {
    state.colours = [wrapper.querySelector('#col1').value, wrapper.querySelector('#col2').value];
    wrapper.remove();
    sendHeight();
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
  sendHeight();
  
  const dropZone = wrapper.querySelector('div');
  const fileInput = wrapper.querySelector('input[type="file"]');
  
  // File input handler
  fileInput.onchange = () => {
    if (fileInput.files.length) {
      images.push(...fileInput.files);
      bubble('user', `📷 ${fileInput.files.length} image(s) attached`);
      wrapper.remove();
      sendHeight();
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
      sendHeight();
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
    // ALWAYS send to the server, even on the very first message
    const fd = new FormData();
    fd.append('prompt', JSON.stringify(convo));
    images.forEach(f => fd.append('images', f));

    const res = await fetch('/api/analyse', {
      method: 'POST',
      body: fd
    });

    const j = await res.json();
    console.log('GPT raw ->', j);

    // Merge what GPT extracted and then ask only what's still missing:
    mergeState(j);
    handleMissing({});               // run your follow‐up flow immediately
    return;
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

  // Step 4: Done – prompt and show Sign In button
  const p = document.createElement('p');
  p.className = 'prompt-label';
  p.textContent = 'All set! Please sign in to continue.';
  thread.appendChild(p);

  // create & insert Sign In button
  const signInBtn = document.createElement('button');
  signInBtn.textContent = 'Sign In';
  signInBtn.className = 'sign-in-btn';
  thread.appendChild(signInBtn);

  // wire it to open the modal
  signInBtn.onclick = () => {
    if (authModal) {
      authModal.classList.add('open');
    } else {
      // Fallback: communicate with parent window to open modal
      window.parent.postMessage({type: 'open-auth-modal'}, '*');
    }
  };

  thread.scrollTop = thread.scrollHeight;
  sendHeight();
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

// File upload from footer file button
if (files) {
  files.onchange = () => {
    if (files.files.length) {
      images.push(...files.files);
      bubble('user', `📷 ${files.files.length} image(s) attached`);
    }
  };
}

// Initialize with greeting
bubble('ai', 'Hi! Tell me about your business and I will help you create a website.');