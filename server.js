const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const { OpenAI } = require("openai");           // ← ONE import
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY            // ← ONE client
});

// 🔽 Temporary debug
console.log("OPENAI_API_KEY length:",
            (process.env.OPENAI_API_KEY || "").length);

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory user store
const users = []; // { id, email, passwordHash, displayName, provider }

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-random-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // For demo: serialize entire profile
    return done(null, profile);
  }
));

// Configure Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const user = users.find(u => u.email === email);
    if (!user) return done(null, false, { message: 'Wrong email.' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? done(null, user) : done(null, false, { message: 'Wrong password.' });
  }
));

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
  // For Google users, use the Google ID; for local users, use our generated ID
  const id = user.id || user.emails?.[0]?.value;
  done(null, { id, provider: user.provider || 'google' });
});

passport.deserializeUser(function(obj, done) {
  if (obj.provider === 'local') {
    const user = users.find(u => u.id === obj.id);
    done(null, user);
  } else {
    // For Google users, we'd typically fetch from database, but for demo we'll store in session
    done(null, obj);
  }
});

// Serve static files
app.use(express.static('.'));

// Auth routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to profile
    res.redirect('/profile');
  }
);

app.get('/profile', function(req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    const displayName = user.displayName || user.emails?.[0]?.value || 'User';
    const email = user.email || (user.emails ? user.emails[0].value : 'Not provided');
    const photo = user.photos ? user.photos[0].value : '';
    const provider = user.provider || 'google';
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile - LocalAI Builder</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <div class="container" style="padding: 2rem; text-align: center;">
          <h1>Welcome, ${displayName}!</h1>
          <p>Email: ${email}</p>
          <p>Login method: ${provider === 'local' ? 'Email & Password' : 'Google OAuth'}</p>
          ${photo ? `<img src="${photo}" alt="Profile" style="border-radius: 50%; width: 100px; height: 100px;">` : ''}
          <br><br>
          <a href="/logout" class="btn-primary" style="margin-right: 1rem;">Logout</a>
          <a href="/" class="btn-secondary">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  } else {
    res.redirect('/');
  }
});

app.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Local authentication routes
app.post('/login', 
  passport.authenticate('local', { 
    successRedirect: '/profile', 
    failureRedirect: '/' 
  })
);

app.post('/signup', async function(req, res) {
  const { email, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.redirect('/?error=email-exists');
  }
  
  // Hash password and create user
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      email,
      passwordHash,
      displayName: email.split('@')[0], // Use email prefix as display name
      provider: 'local'
    };
    
    users.push(newUser);
    
    // Log in the new user
    req.login(newUser, function(err) {
      if (err) {
        return res.redirect('/?error=login-failed');
      }
      return res.redirect('/profile');
    });
  } catch (error) {
    res.redirect('/?error=signup-failed');
  }
});

// GPT-powered business analysis API
app.post("/api/analyse", express.json(), express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    // Handle both JSON and FormData requests
    let userPrompt = "";
    if (req.body && req.body.prompt) {
      if (typeof req.body.prompt === 'string') {
        // Try to parse as JSON conversation array
        try {
          const conversationArray = JSON.parse(req.body.prompt);
          if (Array.isArray(conversationArray)) {
            userPrompt = conversationArray.map(msg => `${msg.role}: ${msg.content}`).join('\n');
          } else {
            userPrompt = req.body.prompt;
          }
        } catch (e) {
          userPrompt = req.body.prompt;
        }
      } else {
        userPrompt = req.body.prompt;
      }
    }
    userPrompt = (userPrompt || "No prompt provided").slice(0, 500);
    const systemMsg = `
Extract business data and return ONLY valid JSON:

{
  "company_name": string|null,
  "industry": string|null,
  "city": string|null,
  "language": "English"|"Serbian"|"German"|"Spanish",
  "services": string|null,
  "missing_fields": []
}

RULES:
1. Language (NEVER null):
   - Belgrade/Beograd/Novi Sad → "Serbian"
   - Berlin/Munich/Hamburg → "German"
   - Madrid/Barcelona → "Spanish"
   - Otherwise → "English"

2. A company_name is considered present when the user reply
   contains **any capitalised word followed by another word**
   (e.g. "My Tooth", "Green Lawn", "BlueSky").
   As soon as you detect such a phrase, fill company_name
   and REMOVE "company_name" from missing_fields.
   Never ask for company_name again once it is filled.

3. City detection (scan text for these patterns):
   - "in Austin" → city: "Austin"
   - "based in Chicago" → city: "Chicago"  
   - "dental clinic Austin" → city: "Austin" (standalone city name)
   - "law firm Berlin" → city: "Berlin"
   - "restaurant Belgrade" → city: "Belgrade"
   - Known cities: Austin, Chicago, London, Berlin, Belgrade, Paris, New York, Los Angeles, Sydney, Toronto, Madrid, Barcelona, Munich, Hamburg, Novi Sad
   - "just restaurant" → city: null (no location)

4. Services:
   - Extract main services/products offered by the business
   - If not mentioned, set services: null and add "services" to missing_fields

4. "industry" must be one of these 25 categories  
   ["Accounting & Finance","Advertising & Marketing","Automotive",
    "Beauty & Wellness","Construction","Consulting","Dental",
    "Education","Food & Beverage","Healthcare","Hospitality",
    "IT & Software","Landscaping","Legal","Manufacturing",
    "Pets","Plumbing","Real Estate","Retail","Roofing",
    "Shoes & Apparel","Sports & Fitness","Transportation & Logistics",
    "Travel","Other"]

   • If user text clearly maps to one, set it and  
     **industry_confidence** to 100.  
   • If unsure, guess the best match and include  
     industry_confidence (0-100).  
   • If confidence < 60, set "industry":"Other" and  
     add "industry" to missing_fields.

   Do NOT ask about industry again once it is set by either the model
   or the user.

5. Missing fields:
   - Add key to missing_fields only if truly cannot determine
   - Apply all inference rules first

5. **Mandatory rule**:  
   For every key whose value is \`null\`, you MUST include that key
   in \`missing_fields\`.  
   If a value is not \`null\`, its key MUST NOT appear in
   \`missing_fields\`.  The two lists must always stay in sync.
`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemMsg.trim() },
        { role: "user",   content: userPrompt }
      ]
    });
    
    console.log("GPT raw ->", completion.choices[0].message.content);
    
    const json = JSON.parse(completion.choices[0].message.content);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "analysis_failed" });
  }
});

// Handle SPA routing - serve index.html for unknown routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', function(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

app.listen(PORT, '0.0.0.0', function() {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});