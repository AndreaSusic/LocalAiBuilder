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

// Helper: Insert new HTML after a node
function insertAfter(node, html){
  const temp = document.createElement('div');
  temp.innerHTML = html;
  node.parentNode.insertBefore(temp.firstElementChild, node.nextSibling);
}

// Helper: Remove any extra color pickers or drop-zones before adding new ones
function cleanupExtras(){
  document.querySelectorAll('.wrapColours, .drop-zone').forEach(e=>e.remove());
}

// Call this function after every step, e.g. after a question is asked/answered
function handleMissing(res){
  mergeState(res);  // Your merge logic
  cleanupExtras();

  // 1. Ask for text fields first (company, city, etc.)
  const order = ['company_name','city','industry','language','services'];
  const next = order.find(k=>state[k] === null);

  if(next){
    const Q = {
      company_name: 'What\'s the name of your business?',
      city: 'Which city do you mainly serve?',
      industry: 'What industry best describes your business?',
      language: 'What primary language should the website use?',
      services: 'List your most important services or products.'
    }[next];

    // Show as AI bubble
    bubble('ai', Q);
    convo.push({role:'assistant', content:Q});
    awaitingKey = next;
    return;
  }

  // 2. If color pickers missing, insert under color label
  if(state.colours === null){
    const label = 'Please pick two brand colours.';
    
    // Show as AI bubble
    bubble('ai', label);
    
    // Insert color picker after the bubble
    const lastBubble = thread.lastElementChild;
    insertAfter(lastBubble, `
      <label class="wrapColours">
        Primary <input type="color" id="col1" value="#ffc000">
        Secondary <input type="color" id="col2" value="#000000">
        <button id="colourDone">Done</button>
      </label>
    `);
    convo.push({role:'assistant', content:label});
    $('colourDone').onclick = ()=>{
      state.colours = [$('col1').value, $('col2').value];
      cleanupExtras();
      handleMissing({});
    };
    return;
  }

  // 3. If images missing, insert drop zone under image label
  if(images.length === 0 && !document.querySelector('.drop-zone')){
    const label = 'Can you upload images and a logo for me to use on your website?';
    
    // Show as AI bubble
    bubble('ai', label);
    
    // Insert drop zone after the bubble
    const lastBubble = thread.lastElementChild;
    insertAfter(lastBubble, `
      <div id="dropArea" class="drop-zone">
        <p>Drag & drop images/logo here or <label class="file-label">browse
          <input type="file" id="fileInput2" accept="image/*" multiple hidden>
        </label></p>
      </div>
    `);
    convo.push({role:'assistant', content:label});
    
    // Wire up file/drag-drop handlers
    const newDropArea = document.querySelector('.drop-zone');
    const newFileInput = document.getElementById('fileInput2');
    
    if (newFileInput) {
      newFileInput.onchange = () => {
        if (newFileInput.files.length) {
          images.push(...newFileInput.files);
          bubble('user', `📷 ${newFileInput.files.length} image(s) attached`);
          handleMissing({});
        }
      };
    }
    
    if (newDropArea) {
      newDropArea.addEventListener('dragover', e => {
        e.preventDefault();
        newDropArea.classList.add('dragover');
      });
      
      newDropArea.addEventListener('dragleave', e => {
        e.preventDefault();
        newDropArea.classList.remove('dragover');
      });
      
      newDropArea.addEventListener('drop', e => {
        e.preventDefault();
        newDropArea.classList.remove('dragover');
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        const imageFiles = droppedFiles.filter(f => f.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
          images.push(...imageFiles);
          bubble('user', `📷 ${imageFiles.length} image(s) attached`);
          handleMissing({});
        }
      });
    }
    
    return;
  }

  // 4. Everything collected
  bubble('ai', 'Great! Generating your site…');
  fetch('/api/build-site', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({state, convo})
  });
}

function askNextQuestion(){ handleMissing({}); }

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

// File upload events handled dynamically when drop zone is created

// Initialize with greeting
window.addEventListener('DOMContentLoaded', () => {
  bubble('ai', 'Hi! Tell me about your business and I will help you create a website.');
});