const $ = id => document.getElementById(id);
const th = $('chatThread');
const inp = $('chatInput');
const send = $('sendBtn');
const fsel = $('fileInput');

let convo = [];          // {role,content}[]
let images = [];         // File[]
let turns = 0;
const MAX_FREE = 15;

function bubble(role, txt) {
  const d = document.createElement('div');
  d.className = `bubble ${role === 'user' ? 'user' : 'ai'}`;
  d.textContent = txt;
  th.appendChild(d);
  th.scrollTop = th.scrollHeight;
}

function addFiles(list) {
  for (const f of list) {
    if (!f.type.startsWith('image/')) continue;
    images.push(f);
    bubble('user', '📷 image attached');
  }
  fsel.value = '';
}

async function sendUser() {
  const txt = inp.innerText.trim();
  if (!txt && !fsel.files.length) return;

  if (txt) bubble('user', txt);
  addFiles(fsel.files);
  convo.push({ role: 'user', content: txt });
  inp.textContent = '';

  if (++turns > MAX_FREE) {
    paywall();
    return;
  }

  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: txt })
    });
    const result = await response.json();
    handleAI(result);
  } catch (err) {
    bubble('ai', 'Sorry, something went wrong. Please try again.');
  }
}

function handleAI(res) {
  const miss = res.missing_fields || [];
  if (!miss.length) {
    bubble('ai', 'Great! Generating your site…');
    return;
  }

  const next = miss[0];
  const questions = {
    company_name: 'What is the name of your business?',
    city: 'Which city do you mainly serve?',
    industry: 'What industry best describes your business?',
    language: 'What primary language should the website use?',
    services: 'List your most important services or products.',
    colours: 'Any brand colours? Reply with two hex codes or say "no preference".',
    images: 'Feel free to drag & drop your logo or photos right here.'
  };

  const question = questions[next] || `Please provide your ${next}.`;
  bubble('ai', question);
  convo.push({ role: 'assistant', content: question });
}

function paywall() {
  bubble('ai', 'Free limit reached – Upgrade to Pro to continue.');
  $('chatFooter').remove();
}

// Event listeners
send.onclick = sendUser;
inp.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendUser();
  }
});
fsel.onchange = () => addFiles(fsel.files);
$('fileInput').addEventListener('click', e => e.stopPropagation());

// Welcome message
bubble('ai', 'Hi! I will help you create your website. Tell me about your business and what you would like your site to include.');