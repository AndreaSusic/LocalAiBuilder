const $ = id => document.getElementById(id);
const thread = $('chatThread'), input = $('chatInput'),
      send = $('sendBtn'),
      dropArea = $('dropArea'), selWrap = $('wrapIndustrySelect'),
      sel = $('industrySelect'), colourWrap = $('wrapColours'),
      col1 = $('col1'), col2 = $('col2');

const urlParams = new URLSearchParams(window.location.search);
const loadDraft = urlParams.has('draft');
const startFresh = urlParams.has('fresh');

const authModal = document.getElementById('authModal');
const authConfirmBtn = document.getElementById('modalContinueBtn');

if (authConfirmBtn) {
  authConfirmBtn.onclick = () => {
    // hide the modal
    if (authModal) authModal.classList.remove('open');
    // actually trigger the site‐build now that the user is authenticated
    console.log('Saving draft with state:', state, 'and convo:', convo);
    fetch('/api/build-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
  wrapper.querySelector('#colourDone').onclick = async () => {
    const col1Val = wrapper.querySelector('#col1').value;
    const col2Val = wrapper.querySelector('#col2').value;
    state.colours = [col1Val, col2Val];
    bubble('user', `🎨 Selected colors: ${col1Val}, ${col2Val}`);
    wrapper.remove();
    
    // Show font picker after colors are set and images are handled
    if (state.colours && (images.length > 0 || document.getElementById('inlineDropZone'))) {
      const fontWrapper = document.getElementById('wrapFont');
      if (fontWrapper) {
        fontWrapper.classList.remove('hidden');
      }
    }
    
    sendHeight();
    await handleMissing({});
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
      <button class="skip-btn" style="margin-top:10px;padding:5px 10px;background:#666;color:white;border:none;border-radius:3px;cursor:pointer;">No images</button>
    </div>
  `;
  thread.appendChild(wrapper);
  thread.scrollTop = thread.scrollHeight;
  sendHeight();
  
  const dropZone = wrapper.querySelector('div');
  const fileInput = wrapper.querySelector('input[type="file"]');
  const skipBtn = wrapper.querySelector('.skip-btn');
  
  // File input handler
  fileInput.onchange = async () => {
    if (fileInput.files.length) {
      images.push(...fileInput.files);
      bubble('user', `📷 ${fileInput.files.length} image(s) attached`);
      // Show add more images option instead of removing wrapper
      showImageGalleryWithAddMore();
      wrapper.remove();
      
      // Show font picker after images are uploaded and colours are set
      if (state.colours) {
        const fontWrapper = document.getElementById('wrapFont');
        if (fontWrapper) {
          fontWrapper.hidden = false;
        }
      }
      
      sendHeight();
      await handleMissing({});
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
      // Show add more images option instead of removing wrapper
      showImageGalleryWithAddMore();
      wrapper.remove();
      
      // Show font picker after images are uploaded and colours are set
      if (state.colours) {
        const fontWrapper = document.getElementById('wrapFont');
        if (fontWrapper) {
          fontWrapper.hidden = false;
        }
      }
      
      sendHeight();
      handleMissing({});
    }
  });
  
  // Skip button handler
  skipBtn.onclick = async () => {
    bubble('user', 'No images');
    convo.push({ role: 'user', content: 'No images' });
    wrapper.remove();
    
    // Show font picker after "no images" is selected and colours are set
    if (state.colours) {
      const fontWrapper = document.getElementById('wrapFont');
      if (fontWrapper) {
        fontWrapper.classList.remove('hidden');
      }
    }
    
    sendHeight();
    await handleMissing({});
  };
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
  console.log('🛫 sendUser triggered; current state:', state);
  const text = input.innerText.trim();
  if (!text) return;

  // If we just asked for a specific key, take reply verbatim
  if (awaitingKey && text) {
    state[awaitingKey] = text.trim();
    awaitingKey = null;
  }
  
  // Handle "no images" responses
  if (text.toLowerCase().includes('no') || text.toLowerCase().includes('don\'t have')) {
    if (images.length === 0 && document.getElementById('inlineDropZone')) {
      // User doesn't have images, skip this step
      document.getElementById('inlineDropZone').remove();
      images.push(new File([''], 'placeholder.png', { type: 'image/png' })); // Add placeholder to proceed
      sendHeight();
      await handleMissing({});
    }
  }

  if (text) bubble('user', text);

  // soft industry mapping only
  if (!state.industry) { 
    const m = text.match(RX_INDS);
    if (m) state.industry = guessIndustry(m[1]); 
  }

  convo.push({role: 'user', content: text});
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

    // --- begin save-draft instrumentation ---
    console.log('📝 About to call save-draft, convo length:', convo.length);
    try {
      const saveRes = await fetch('/api/save-draft', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, convo })
      });
      console.log('✅ save-draft response status:', saveRes.status);
      const saveJson = await saveRes.json().catch(() => null);
      console.log('💾 save-draft response body:', saveJson);
    } catch (err) {
      console.error('❌ Error calling save-draft:', err);
    }
    // --- end save-draft instrumentation ---

    await handleMissing(j);               // run your follow‐up flow immediately
    
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

async function handleMissing(res){
  // Note: mergeState(res) and draft saving now happens in sendUser()
  // This function just handles the UI logic for missing fields

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
      // Auto-save draft after each AI response
      saveDraft();
    }
    return;
  }

  // Step 2: If colours missing, show picker inline and wait
  if(state.colours===null){
    const lastAI=convo.filter(m=>m.role==='assistant').pop()?.content;
    if(lastAI!=='Please pick two brand colours.' && !document.getElementById('inlineColorPicker')){
      // Don't add duplicate bubble, just show the color picker
      convo.push({role:'assistant',content:'Please pick two brand colours.'});
      createColorPicker();
      // Auto-save draft after each AI response
      setTimeout(() => saveDraft(), 100);
    }
    return;  // wait for Done
  }

  // Show font picker after colours are set and images step is reached
  if (state.colours && (images.length > 0 || document.getElementById('inlineDropZone'))) {
    const fontWrapper = document.getElementById('wrapFont');
    if (fontWrapper) {
      fontWrapper.classList.remove('hidden');
    }
  }

  // Step 3: If images missing, show drop-zone inline and wait for file
  if(images.length===0 && !document.getElementById('inlineDropZone')){
    bubble('ai','Can you upload images and a logo for me to use on your website?');
    convo.push({role:'assistant',content:'Please upload images or logo.'});
    createDropZone();
    
    // Font selector will be shown after image upload is complete
    
    // Auto-save draft after each AI response
    saveDraft();
    return;
  }

  // Step 4: Done – prompt and show Sign In button
  // Check if sign in button already exists to avoid duplicates
  const existingSignIn = document.querySelector('.sign-in-btn');
  if (!existingSignIn) {
    const p = document.createElement('p');
    p.className = 'prompt-label';
    p.textContent = "You're all set to start! You can adjust elements and sections in the next steps. Please sign in to continue.";
    thread.appendChild(p);

    const signInBtn = document.createElement('button');
    signInBtn.textContent = 'Sign In';
    signInBtn.className = 'sign-in-btn';
    thread.appendChild(signInBtn);

    // wire it to trigger login in parent window
    signInBtn.onclick = () => {
      window.parent.postMessage({type: 'trigger-login'}, '*');
    };

    // Hide chat footer when sign in button appears
    const chatFooter = document.getElementById('chatFooter');
    if (chatFooter) chatFooter.style.display = 'none';
    
    // Hide font selector when conversation is complete
    const fontSelector = document.getElementById('wrapFont');
    if (fontSelector) {
      fontSelector.hidden = true;
    }
    
    // Auto-save draft when conversation is complete
    setTimeout(() => saveDraft(), 100);
  }



  thread.scrollTop = thread.scrollHeight;
  sendHeight();
}

function paywall() {
  bubble('ai', 'Free limit reached - <a href="/pricing">upgrade to Pro</a>.');
  document.getElementById('chatFooter').style.display = 'none';
}

// Auto-save draft function - simplified since we now save after each response
async function saveDraft() {
  try {
    const response = await fetch('/api/save-draft', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, convo })
    });
    if (response.ok) {
      console.log('Draft auto-saved successfully');
    } else {
      console.log('Draft save failed:', response.status);
    }
  } catch (error) {
    console.log('Draft auto-save failed:', error);
  }
}

// events
send.onclick = sendUser;
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendUser();
  }
});

// File upload handling removed - now handled via drop zones only

// Function to show image gallery with add more option
function showImageGalleryWithAddMore() {
  // Don't remove existing galleries, just add a new one with unique ID
  const galleryId = 'imageGallery_' + Date.now();
  
  const galleryWrapper = document.createElement('div');
  galleryWrapper.id = galleryId;
  galleryWrapper.className = 'image-gallery';
  galleryWrapper.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin:1rem 0;">
      <span>Images uploaded (${images.length})</span>
      <button class="addMoreBtn" style="background:#ffc000;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:18px;">+</button>
    </div>
  `;
  
  // Find the last image gallery or first position to insert
  const existingGalleries = document.querySelectorAll('.image-gallery');
  const signInBtn = document.querySelector('.sign-in-btn');
  
  if (existingGalleries.length > 0) {
    // Insert after the last existing gallery
    const lastGallery = existingGalleries[existingGalleries.length - 1];
    lastGallery.insertAdjacentElement('afterend', galleryWrapper);
  } else if (signInBtn) {
    // Insert before sign-in button
    signInBtn.insertAdjacentElement('beforebegin', galleryWrapper);
  } else {
    // Append to thread
    thread.appendChild(galleryWrapper);
  }
  
  // Wire add more button
  galleryWrapper.querySelector('.addMoreBtn').onclick = () => {
    createDropZone();
  };
  
  sendHeight();
}

// Initialize with personalized greeting
window.addEventListener('load', async () => {
  // On initial load, always hide wrapFont
  const fontWrapper = document.getElementById('wrapFont');
  if (fontWrapper) fontWrapper.classList.add('hidden');
  let name = null;
  
  // Handle draft vs fresh mode
  let draftLoaded = false;
  if (loadDraft) {
    // fetch last draft and inject
    try {
      const r = await fetch('/api/last-draft', { credentials: 'include' });
      console.log('Draft fetch response:', r.status);
      if (r.ok) {
        const { state: dState, convo: dConvo } = await r.json();
        console.log('Loaded draft data:', { dState, dConvo });
        state = dState;
        convo = dConvo;
        // render existing convo bubbles
        convo.forEach(m => bubble(m.role, m.content));
        draftLoaded = true;
      } else if (r.status === 204) {
        console.log('No draft found');
      }
    } catch(e){console.error('Draft loading error:', e);}
  } else if (startFresh) {
    state = { company_name:null, city:null, industry:null, language:null, services:null, colours:null };
    convo = [];
  }
  
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (r.ok) {
      const j = await r.json();
      name = j.name;
    }
  } catch (e) {
    console.warn('Could not fetch user:', e);
  }
  
  // Only show greeting if no draft was loaded
  if (!draftLoaded) {
    const greetingText = name
      ? `Welcome, ${name}! Let's create your brand-new website.`
      : 'Hi! I will help you create your brand-new website. Tell me about your business and what you would like your site to include.';
    bubble('ai', greetingText);
  } else {
    console.log('Draft loaded successfully:', { state, convo });
  }
  

  
  // Wire up font selector for chat interface
  document.getElementById('fontSelect')?.addEventListener('change', e => {
    document.body.style.fontFamily = e.target.value;
    // Also apply to parent window if accessible
    try {
      window.parent.document.body.style.fontFamily = e.target.value;
    } catch (e) {
      // Cross-origin restriction, ignore
    }
  });
  
  sendHeight();
});