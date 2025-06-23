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
  cleanupExtras();

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
      const p=document.createElement('p');
      p.className='prompt-label';
      p.textContent=Q;
      thread.appendChild(p);
      convo.push({role:'assistant',content:Q});
      awaitingKey=next;
      thread.scrollTop = thread.scrollHeight;
    }
    return;
  }

  // Step 2: Colours (if missing)
  if(state.colours===null){
    const colourQ = 'Please pick two brand colours.';
    const lastAI = convo.filter(m=>m.role==='assistant').pop()?.content;
    if(lastAI!==colourQ){
      const p=document.createElement('p');
      p.className='prompt-label';
      p.textContent=colourQ;
      thread.appendChild(p);
      // Insert colour picker directly under label
      insertAfter(p, `
        <label class="wrapColours">
          Primary <input type="color" id="col1" value="#ffc000">
          Secondary <input type="color" id="col2" value="#000000">
          <button id="colourDone">Done</button>
        </label>
      `);
      convo.push({role:'assistant',content:colourQ});
      $('colourDone').onclick = ()=>{
        state.colours = [$('col1').value, $('col2').value];
        cleanupExtras();
        askNextQuestion();
      };
      thread.scrollTop = thread.scrollHeight;
    }
    return;
  }

  // Step 3: Images (if missing)
  if(images.length===0 && !document.querySelector('.drop-zone')){
    const imgQ = 'Can you upload images and a logo for me to use on your website?';
    const p=document.createElement('p');
    p.className='prompt-label';
    p.textContent=imgQ;
    thread.appendChild(p);
    insertAfter(p, `
      <div id="dropArea" class="drop-zone">
        <p>Drag & drop images/logo here or <label class="file-label">browse
          <input type="file" id="fileInput" accept="image/*" multiple hidden>
        </label></p>
      </div>
    `);
    convo.push({role:'assistant',content:imgQ});
    
    // Re-wire drag/drop/file logic
    const dropArea = $('dropArea');
    const files = $('fileInput');
    
    files.onchange = () => {
      if (files.files.length) {
        images.push(...files.files);
        bubble('user', `📷 ${files.files.length} image(s) attached`);
        askNextQuestion();
      }
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
        askNextQuestion();
      }
    });
    
    thread.scrollTop = thread.scrollHeight;
    return;
  }

  // Step 4: Done
  const p=document.createElement('p');
  p.className='prompt-label';
  p.textContent='Great! Generating your site…';
  thread.appendChild(p);
  fetch('/api/build-site',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({state, convo})
  });
  thread.scrollTop = thread.scrollHeight;
}

function askNextQuestion(){ handleMissing({}); }

// Helper: insertAfter()
function insertAfter(node, html){
  const div = document.createElement('div');
  div.innerHTML = html;
  node.parentNode.insertBefore(div.firstElementChild, node.nextSibling);
}

// Helper: cleanupExtras()
function cleanupExtras(){
  document.querySelectorAll('.wrapColours, .drop-zone').forEach(e=>e.remove());
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

// Initialize with greeting
const initGreeting = document.createElement('p');
initGreeting.className = 'prompt-label';
initGreeting.textContent = 'Hi! Tell me about your business and I will help you create a website.';
thread.appendChild(initGreeting);