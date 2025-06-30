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


const RX_INDS = /(dental|doctor|health|plastic|psic|saas|news|magaz|astrol|home|decor|apparel|cloth|market|cosmetics|plumb|lawn|roof|legal|marketing|shoe|retail|realestate|tech|it|finance|automotive|beauty|food|hospitality|manufacturing|pets|sports|travel|transport)/i;
const RX_SOCIAL = /(facebook\.com|instagram\.com|tiktok\.com|linkedin\.com)/i;
const RX_GBP    = /(goo\.gl\/maps|google\.[a-z.]+\/maps|business\.site)/i;
const RX_PAY    = /(payment|financ(e|ing)|installment|plan)/i;
const RX_VID    = /(youtube\.com|youtu\.be|vimeo\.com)/i;


let convo = [], state = {
  company_name: null,
  city: null,
  industry: null,
  language: null,
  services: null,
  colours: null,
  social: {                // NEW  : fb / ig / tt / li etc.
    facebook: null,
    instagram: null,
    tiktok: null,
    linkedin: null
  },
  google_profile: null,    // NEW  : full "https://goo.gl/maps/…" or business.site url
  payment_plans: null,     // NEW  : "Yes" / "No" / details
  hero_video: null         // NEW  : YouTube/Vimeo URL or uploaded File
}, images = [],
    turns = 0, MAX_FREE = 15;

let awaitingKey = null;
let gbpList = [];  // Store GBP search results

// Perform GBP lookup and display results
async function performGbpLookup() {
  console.log('🔍 Starting GBP lookup for:', state.company_name, 'in', state.city);
  try {
    const response = await fetch('/api/find-gbp', {
      method: 'POST',
      body: JSON.stringify({
        name: state.company_name,
        city: state.city
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const list = await response.json();
    gbpList = list; // Store for selection
    console.log('📋 GBP lookup results:', list.length, 'businesses found');
    console.log('📋 Updated gbpList:', gbpList);
    
    if (list.length === 1) {
      // Only one result found - ask for confirmation
      console.log('📍 Single GBP result, asking for confirmation');
      bubble('ai', `Can you confirm that this is your business address?\n${list[0].name} – ${list[0].address}\n\nReply "yes" to confirm or "no" if this isn't your business.`);
      convo.push({role: 'assistant', content: `Can you confirm that this is your business address?\n${list[0].name} – ${list[0].address}\n\nReply "yes" to confirm or "no" if this isn't your business.`});
    } else if (list.length > 1) {
      // Multiple results found - show numbered list
      console.log('📍 Multiple GBP results, showing numbered list');
      const numbered = list.map((m, i) => `${i + 1}) ${m.name} – ${m.address}`).join('\n');
      bubble('ai', `Which one of these is your business?\n${numbered}\n0) None of these`);
      convo.push({role: 'assistant', content: `Which one of these is your business?\n${numbered}\n0) None of these`});
    } else {
      console.log('📍 No GBP results found');
      bubble('ai', 'No Google Business Profiles found with that name. We\'ll continue without it.');
      state.google_profile = 'no';
      convo.push({role: 'assistant', content: 'No Google Business Profiles found with that name.'});
      await handleMissing({});
    }
  } catch (error) {
    console.error('GBP lookup error:', error);
    bubble('ai', 'Unable to search for Google Business Profile. We\'ll continue without it.');
    state.google_profile = 'no';
    await handleMissing({});
  }
}

// Fetch detailed GBP information using the new API
async function fetchGbpDetails(placeUrl) {
  try {
    bubble('ai', 'Fetching your business details...');
    
    const response = await fetch('/api/gbp-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeUrl })
    });
    
    if (response.ok) {
      const gbpData = await response.json();
      console.log('📍 GBP details fetched:', gbpData);
      
      // Store GBP data in state
      state.google = gbpData;
      state.google_profile = placeUrl;
      
      bubble('ai', `Great! I found: ${gbpData.name}${gbpData.address ? ` at ${gbpData.address}` : ''}. This will help personalize your website with accurate contact details and photos.`);
      
      // Bootstrap data for template system
      updateBootstrapData();
      
      awaitingKey = null;
      await handleMissing({});
    } else {
      console.error('❌ GBP details fetch failed:', response.status);
      state.google_profile = placeUrl; // Still store the URL
      bubble('ai', 'Found your business profile but couldn\'t fetch all details. We can proceed with creating your website.');
      awaitingKey = null;
      await handleMissing({});
    }
  } catch (error) {
    console.error('❌ GBP details error:', error);
    state.google_profile = placeUrl; // Still store the URL
    bubble('ai', 'Found your business profile. Let\'s continue with creating your website.');
    awaitingKey = null;
    await handleMissing({});
  }
}

// Update bootstrap data for the template system
function updateBootstrapData() {
  if (typeof window !== 'undefined') {
    window.bootstrapData = {
      company_name: state.company_name,
      city: state.city,
      industry: state.industry,
      language: state.language,
      services: state.services ? state.services.split(',').map(s => s.trim()) : [],
      images: images.filter(img => img.size > 0).map((img, index) => URL.createObjectURL(img)),
      google: state.google || {},
      colors: state.colours
    };
    console.log('🎨 Bootstrap data updated:', window.bootstrapData);
  }
}

// bubble helper
function bubble(role, txt) { 
  const d = document.createElement('div');
  d.className = `bubble ${role === 'user' ? 'user' : 'ai'}`;
  d.innerHTML = txt;
  thread.appendChild(d);
  thread.scrollTop = thread.scrollHeight;
  sendHeight();
}

// Clear the input field to prevent stale values
function clearInput() {
  const input = document.getElementById("chatInput");
  if (input) {
    if (input.value !== undefined) {
      input.value = "";   // <textarea>
    } else {
      input.textContent = ""; // contenteditable div
    }
  }
}

// Create color picker inline
// Create font picker inline in chat thread
function showFontPickerInline() {
  // Don't create duplicate font pickers
  if (document.getElementById('inlineFontPicker')) return;
  
  const wrapper = document.createElement('div');
  wrapper.id = 'inlineFontPicker';
  wrapper.innerHTML = `
    <div style="background:#f5f5f5;border-radius:8px;padding:1rem;margin:1rem 0;">
      <p style="margin-bottom:10px;color:#333;">Choose your font:</p>
      <select id="inlineFontSelect" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
        <option value="Roboto, sans-serif">Roboto</option>
        <option value="Open Sans, sans-serif">Open Sans</option>
        <option value="Lato, sans-serif">Lato</option>
        <option value="Montserrat, sans-serif">Montserrat</option>
        <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
        <option value="Raleway, sans-serif">Raleway</option>
        <option value="PT Sans, sans-serif">PT Sans</option>
        <option value="Noto Sans, sans-serif">Noto Sans</option>
        <option value="Merriweather, serif">Merriweather</option>
        <option value="Ubuntu, sans-serif">Ubuntu</option>
        <option value="Poppins, sans-serif">Poppins</option>
        <option value="Oswald, sans-serif">Oswald</option>
      </select>
    </div>
  `;
  thread.appendChild(wrapper);
  thread.scrollTop = thread.scrollHeight;
  sendHeight();
  
  // Wire up the font selector
  wrapper.querySelector('#inlineFontSelect').addEventListener('change', e => {
    document.body.style.fontFamily = e.target.value;
    try {
      window.parent.document.body.style.fontFamily = e.target.value;
    } catch (e) {
      // Cross-origin restriction, ignore
    }
  });
}

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
    
    // Font picker will be shown at the final step
    
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
      
      // Font picker will be shown at the final step
      
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
      
      // Font picker will be shown at the final step
      
      sendHeight();
      handleMissing({});
    }
  });
  
  // Skip button handler
  skipBtn.onclick = async () => {
    bubble('user', 'No images');
    convo.push({ role: 'user', content: 'No images' });
    wrapper.remove();
    
    // Font picker will be shown at the final step
    
    sendHeight();
    await handleMissing({});
  };
}

function guessIndustry(word) {
  const map = {
    dental:        'Dental',
    doctor:        'Medical',
    health:        'Medical',
    plastic:       'Medical',
    psic:          'Medical',      // catches “psychologist”
    saas:          'SaaS',
    news:          'News & Magazine',
    magaz:         'News & Magazine',
    astrol:        'Astrology',
    home:          'Home & Decor',
    decor:         'Home & Decor',
    apparel:       'Clothes & Apparel',
    cloth:         'Clothes & Apparel',
    market:        'Marketplaces',
    cosmetics:     'Cosmetics',
    plumb:         'Plumbing',
    lawn:          'Landscaping',
    roof:          'Roofing',
    legal:         'Legal',
    marketing:     'Advertising & Marketing',
    retail:        'Retail',
    realestate:    'Real Estate',
    tech:          'IT & Software',
    it:            'IT & Software',
    finance:       'Accounting & Finance',
    automotive:    'Automotive',
    beauty:        'Beauty & Wellness',
    food:          'Food & Beverage',
    hospitality:   'Hospitality',
    manufacturing: 'Manufacturing',
    pets:          'Pets',
    sports:        'Sports & Fitness',
    travel:        'Travel',
    transport:     'Transportation & Logistics'
  };
  word = word.toLowerCase();
  for (const key in map) {
    if (word.includes(key)) return map[key];
  }
  return null;
}

// send logic
async function sendUser() {
  console.log('🛫 sendUser triggered; current state:', state);
  console.log('🔍 gbpList length:', gbpList.length, 'awaitingKey:', awaitingKey);
  const text = input.innerText.trim();
  if (!text) return;

  let responseHandled = false;

  // Handle GBP selection responses first (highest priority)
  if (gbpList.length > 0) {
    console.log('📋 Processing GBP selection with gbpList:', gbpList);
    console.log('📝 User response for GBP confirmation:', text);
    if (gbpList.length === 1 && (text.toLowerCase().includes('yes') || text.toLowerCase().includes('confirm'))) {
      // User confirmed the single result
      state.google_profile = gbpList[0].mapsUrl;
      gbpList = []; // Clear the list
      awaitingKey = null; // Clear awaiting key
      console.log('✅ GBP confirmed, set to:', state.google_profile);
      responseHandled = true;
      clearInput();
      await handleMissing({});
      return;
    } else if (gbpList.length === 1 && text.toLowerCase().includes('no')) {
      // User rejected the single result
      state.google_profile = 'no';
      gbpList = []; // Clear the list
      awaitingKey = null; // Clear awaiting key
      console.log('❌ GBP rejected, set to no');
      responseHandled = true;
      clearInput();
      await handleMissing({});
      return;
    } else if (/^[0-9]+$/.test(text.trim())) {
      // Handle numbered selection for multiple results
      const idx = parseInt(text.trim()) - 1;
      if (idx >= 0 && idx < gbpList.length) {
        const selectedPlace = gbpList[idx];
        gbpList = []; // Clear the list
        awaitingKey = null; // Clear awaiting key
        console.log('🔢 GBP selected from list:', selectedPlace.mapsUrl);
        responseHandled = true;
        input.innerText = '';
        // Fetch detailed information for selected place
        await fetchGbpDetails(selectedPlace.mapsUrl);
        return;
      } else if (text.trim() === '0') {
        state.google_profile = 'no';
        gbpList = []; // Clear the list
        awaitingKey = null; // Clear awaiting key
        console.log('0️⃣ GBP none selected, set to no');
        responseHandled = true;
        input.innerText = '';
        await handleMissing({});
        return;
      }
    }
  }
  // If we just asked for a specific key, take reply verbatim
  else if (awaitingKey && text) {
    if (awaitingKey === 'hero_video' && text.toLowerCase().includes('skip')) {
      state[awaitingKey] = 'skip';
    } else if (awaitingKey === 'social') {
      // Don't assign directly, let the auto-detection handle it
      // Just mark that we got a response
      if (!RX_SOCIAL.test(text)) {
        state.social.response = text.trim();
      }
    } else if (awaitingKey === 'google_profile') {
      if (text.toLowerCase().includes('yes')) {
        // Search for GBP by company name + city
        awaitingKey = null; // Clear the awaiting key
        responseHandled = true; // Mark response as handled
        clearInput(); // Clear the input field
        console.log('🔍 User has GBP, triggering lookup');
        setTimeout(async () => {
          await performGbpLookup();
        }, 100);
        return; // Don't continue with normal flow
      } else {
        // User doesn't have GBP
        state.google_profile = 'no';
        awaitingKey = null;
        responseHandled = true; // Mark response as handled
        clearInput(); // Clear the input field
        console.log('🚫 User said no to having GBP');
      }
    } else {
      state[awaitingKey] = text.trim();
      awaitingKey = null;
    }
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

  // Only add user message to chat if it wasn't handled by special logic
  if (text && !responseHandled) {
    console.log('💬 Adding user message to chat:', text);
    bubble('user', text);
  } else if (responseHandled) {
    console.log('🚫 Skipping user message bubble - response was handled by special logic');
  }

  // soft industry mapping only
  if (!state.industry) { 
    const m = text.match(RX_INDS);
    if (m) state.industry = guessIndustry(m[1]); 
  }

  // --- quick auto-detect for new keys ---
  if (RX_SOCIAL.test(text)) {
    const urls = text.match(/https?:\/\/\S+/g) || [];
    urls.forEach(url => {
      if (url.includes('facebook') && !state.social.facebook) state.social.facebook = url;
      if (url.includes('instagram') && !state.social.instagram) state.social.instagram = url;
      if (url.includes('tiktok') && !state.social.tiktok) state.social.tiktok = url;
      if (url.includes('linkedin') && !state.social.linkedin) state.social.linkedin = url;
    });
  } else if (awaitingKey === 'social' && !RX_SOCIAL.test(text)) {
    // If user responded to social question but no URLs detected, mark as "no social media"
    state.social = { facebook: null, instagram: null, tiktok: null, linkedin: null, response: text };
  }
  if (!state.google_profile && RX_GBP.test(text)) {
    const urlMatch = text.match(/https?:\/\/\S+/);
    if (urlMatch) state.google_profile = urlMatch[0];
  }
  if (!state.payment_plans && RX_PAY.test(text)) {
    state.payment_plans = text;
  }
  if (!state.hero_video && RX_VID.test(text)) {
    const urlMatch = text.match(/https?:\/\/\S+/);
    if (urlMatch) state.hero_video = urlMatch[0];
  }

  convo.push({role: 'user', content: text});
  clearInput();

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
  
  // Handle new fields
  if (obj.social) state.social = obj.social;
  if (obj.google_profile) state.google_profile = obj.google_profile;
  if (obj.payment_plans) state.payment_plans = obj.payment_plans;
  if (obj.hero_video) state.hero_video = obj.hero_video;
}

async function handleMissing(res){
  // Note: mergeState(res) and draft saving now happens in sendUser()
  // This function just handles the UI logic for missing fields

  // Step 1: Ask for text Qs (company, city, industry, language, services, social, google_profile, payment_plans, hero_video)
  const order = [
    'company_name','city','industry','language','services',
    'social','google_profile','payment_plans','hero_video'
  ];
  const next = order.find(k => {
    if (k === 'social') {
      // Consider social "complete" if user provided any URLs OR answered the question
      return !state.social.facebook && !state.social.instagram && !state.social.tiktok && !state.social.linkedin && 
             !state.social.response;
    }
    if (k === 'google_profile') {
      // Consider google_profile "complete" if it has any value (URL, 'no', etc.)
      return state.google_profile === null;
    }
    return state[k] === null;
  });

  if(next){
    const Q={
      company_name:'What\'s the name of your business?',
      city:'In which city is your business located?',
      industry:'What industry best describes your business?',
      language:'What primary language should the website use?',
      services:'List your most important services or products.',
      social: 'Could you share any business social-media profile links (Facebook, Instagram, TikTok, LinkedIn)? Paste links one below other.',
      google_profile: 'Do you have a Google Business Profile? (Reply "yes" or "no")',
      payment_plans: 'Do you offer payment plans or financing options?',
      hero_video: 'If you have a promo / intro video (YouTube/Vimeo URL), please paste it (or say "skip").'
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

  // Font picker will be shown at the final step before sign-in

  // Step 3: If images missing, show drop-zone inline and wait for file
  if(images.length===0 && !document.getElementById('inlineDropZone')){
    bubble('ai','Can you upload images and a logo for me to use on your website?');
    convo.push({role:'assistant',content:'Please upload images or logo.'});
    createDropZone();
    
    // Font picker will be shown at the end when all steps are complete
    
    // Auto-save draft after each AI response
    saveDraft();
    return;
  }

  // Step 4: Done – show font picker then prompt and Sign In button
  // Check if sign in button already exists to avoid duplicates
  const existingSignIn = document.querySelector('.sign-in-btn');
  if (!existingSignIn) {
    // Show font picker right before completion message
    showFontPickerInline();
    
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
      fontSelector.classList.add('hidden');
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
  
  // Initialize bootstrap data for template system
  window.bootstrapData = window.bootstrapData || {};
  

  
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

// Complete the wizard and bootstrap the template system
async function finishWizard() {
  console.log('🎉 Wizard complete, bootstrapping template system');
  
  // Update bootstrap data one final time
  updateBootstrapData();
  
  // Show completion message
  bubble('ai', 'Perfect! I have all the information needed to create your website. Generating your preview...');
  
  // Save final state
  await saveDraft();
  
  // Redirect to template preview after short delay
  setTimeout(() => {
    window.bootstrapData = window.bootstrapData || {};
    console.log('🚀 Redirecting to preview with data:', window.bootstrapData);
    window.location.href = '/preview';
  }, 2000);
}