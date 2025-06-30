const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer();
const path = require('path');

const { OpenAI } = require("openai");           // ← ONE import
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY            // ← ONE client
});

const { Pool } = require('pg');
const { getStockImages } = require('./imageSelector');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_drafts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        state JSONB,
        conversation JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}
initDB();

// 🔽 Temporary debug
console.log("OPENAI_API_KEY length:",
            (process.env.OPENAI_API_KEY || "").length);

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory user store
const users = []; // { id, email, passwordHash, displayName, provider }

// Middleware to ensure user is logged in
function ensureLoggedIn() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Authentication required' });
  };
}

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-random-secret-key-here',
  resave: false,
  saveUninitialized: true,     // now true, cookie sent immediately
  cookie: {
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Set persistent draft key cookie for chat sessions
app.get('/chat', (req, res, next) => {
  // Ensure a session exists
  req.session.isChatSession = true;
  // Set a long-lived cookie with the raw session ID
  res.cookie('saveDraftKey', req.sessionID, {
    maxAge: 30*24*60*60*1000, // 30 days
    httpOnly: false,          // allow client to send it back
    sameSite: 'lax'
  });
  next();
});

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Debug log to see what Google returns
    console.log('Google profile:', JSON.stringify(profile, null, 2));
    // For demo: serialize entire profile
    return done(null, profile);
  }
));

// Configure Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return done(null, false, { message: 'User not found' });
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
  // Store the complete user object for the session
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // Return the complete user object from session
  done(null, user);
});

// API endpoint to check authentication status
app.get('/api/me', (req, res) => {
  if (req.user) {
    res.json({ 
      name: req.user.displayName, 
      email: req.user.emails && req.user.emails[0] ? req.user.emails[0].value : req.user.email 
    });
  } else {
    res.status(401).json({}); 
  }
});

// API endpoint to get last draft
app.get('/api/last-draft', (req, res) => {
  if (req.user) {
    // For now, return empty state - in future this would load from database
    res.json({ 
      state: { company_name:null, city:null, industry:null, language:null, services:null, colours:null },
      convo: []
    });
  } else {
    res.status(401).json({}); 
  }
});

// Homepage redirect for logged-in users (temporarily disabled to debug GBP flow)
app.get('/', async (req, res, next) => {
  // Temporarily disabled redirect to debug GBP issues
  // TODO: Re-enable after fixing GBP confirmation flow
  console.log('Homepage accessed, user authenticated:', !!req.user);
  next();
});

// Block template JSX files from being served as static content
app.use('/templates/homepage', (req, res, next) => {
  if (req.path.endsWith('.jsx')) {
    // Let our route handler deal with it
    next();
  } else {
    // For other files, serve them normally
    express.static(path.join(__dirname, 'dashboard', 'dist', 'templates', 'homepage'))(req, res, next);
  }
});

// Template routing - proxy to dashboard for direct URL access
app.get('/templates/homepage/v:ver/index.jsx', (req, res) => {
  const ver = req.params.ver;
  console.log(`Template route hit: v${ver}`);
  
  // Serve the dashboard index.html to handle React Router for this route
  res.sendFile(path.join(__dirname, 'dashboard', 'dist', 'index.html'));
});

// Service template routing - proxy to dashboard for React Router
app.get('/templates/service/v:ver/index.jsx', (req, res) => {
  const ver = req.params.ver;
  console.log(`Service template route hit: v${ver}`);
  
  // Serve the dashboard index.html to handle React Router for this route
  res.sendFile(path.join(__dirname, 'dashboard', 'dist', 'index.html'));
});

// Contact template routing - proxy to dashboard for React Router  
app.get('/templates/contact/v:ver/index.jsx', (req, res) => {
  const ver = req.params.ver;
  console.log(`Contact template route hit: v${ver}`);
  
  // Serve the dashboard index.html to handle React Router for this route
  res.sendFile(path.join(__dirname, 'dashboard', 'dist', 'index.html'));
});

// Serve dashboard assets (before main static files)
app.use('/assets', express.static(path.join(__dirname, 'dashboard', 'dist', 'assets')));

// Serve static files (after template routes)
app.use(express.static('.'));

// Auth routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const userId = req.user.id;
    console.log('Google profile:', req.user);

    try {
      // Upsert user into database
      await pool.query(
        `INSERT INTO users (id, email, display_name, provider)
         VALUES ($1, $2, $3, 'google')
         ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, display_name=EXCLUDED.display_name`,
        [req.user.id, req.user.emails[0].value, req.user.displayName]
      );

      // 1) Find the latest session draft row
      const { rows } = await pool.query(
        `SELECT id
         FROM sites
         WHERE user_id = $1 AND is_draft = TRUE
         ORDER BY updated_at DESC
         LIMIT 1`,
        [req.cookies.saveDraftKey]
      );

      if (rows.length) {
        try {
          await pool.query(
            `UPDATE sites
             SET user_id = $1
             WHERE id = $2`,
            [req.user.id, rows[0].id]
          );
          console.log('🔄 Migrated draft id=' + rows[0].id);
        } catch (err) {
          if (err.code === '23505') {
            console.warn('⚠️ Duplicate draft migration ignored for id=' + rows[0].id);
          } else {
            console.error('❌ Migration error:', err);
          }
        }
      } else {
        console.log('ℹ️  No session‐draft to migrate for', req.cookies.saveDraftKey);
      }

      // 3) Now check for that ONE migrated draft under the user ID
      const { rows: urows } = await pool.query(
        `SELECT 1 FROM sites
         WHERE user_id = $1 AND is_draft = TRUE
         LIMIT 1`,
        [req.user.id]
      );

      if (urows.length) {
        console.log('Draft found, redirecting to dashboard');
        // After successful login, send users to the dashboard on port 3002 (mapped from 4000)
        const dashboardUrl = process.env.DASHBOARD_URL || 'https://840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev:3002/';
        return res.redirect(dashboardUrl);
      }
    } catch (err) {
      console.error('DB error checking draft:', err);
      // on error, default to homepage
    }

    console.log('No draft found, redirecting to dashboard');
    // After successful login, send users to the dashboard on port 3002 (mapped from 4000)
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev:3002/';
    res.redirect(dashboardUrl);
  }
);

app.get('/profile', function(req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    console.log('User object:', JSON.stringify(user, null, 2)); // Debug log
    const displayName = user.displayName || user.emails?.[0]?.value || 'User';
    const email = user.emails?.[0]?.value || user.email || 'Not provided';
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
  
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.redirect('/?error=email-exists');
    }
    
    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUserId = Date.now().toString();
    const displayName = email.split('@')[0];
    
    await pool.query(
      `INSERT INTO users (id, email, password_hash, display_name, provider)
       VALUES ($1, $2, $3, $4, 'local')`,
      [newUserId, email, passwordHash, displayName]
    );
    
    // Create user object for login
    const newUser = {
      id: newUserId,
      email,
      password_hash: passwordHash,
      display_name: displayName,
      provider: 'local'
    };
    
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

// Google Business Profile lookup API
app.post('/api/find-gbp', async (req, res) => {
  try {
    const { name, city } = req.body;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google API key not configured' });
    }
    
    // Build search query using company name + city
    const cityName = Array.isArray(city) ? city[0] : city;
    const query = `${name} ${cityName}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return res.json([]);
    }
    
    // Filter results to only include businesses that closely match the name
    const nameWords = name.toLowerCase().split(' ');
    const filteredResults = data.results.filter(place => {
      const placeName = place.name.toLowerCase();
      return nameWords.some(word => placeName.includes(word));
    });
    
    // Format results for frontend
    const results = filteredResults.slice(0, 5).map(place => ({
      name: place.name,
      address: place.formatted_address,
      mapsUrl: `https://maps.google.com/maps?place_id=${place.place_id}`,
      placeId: place.place_id
    }));
    
    res.json(results);
  } catch (error) {
    console.error('GBP lookup error:', error);
    res.status(500).json({ error: 'Failed to search Google Business Profiles' });
  }
});

// GPT-powered business analysis API  
// Use upload.none() to parse text fields in multipart/form-data
app.post("/api/analyse", upload.none(), async (req, res) => {
  try {
    console.log("Full request body:", req.body);
    console.log("Request body type:", typeof req.body);
    
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
    } else {
      console.log("No prompt found in request body");
      userPrompt = "No business description provided";
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

2. A company_name must be a distinctive brand term—generic descriptors are not valid.
   If the user's input contains a generic phrase immediately before words like
   "company", "service", "studio", "clinic", "agency" (for example, "grass sod company",
   "auto repair service", "design studio"), then set "company_name": null
   and add "company_name" to missing_fields.

3. City detection (scan text for these patterns):
   - "in Austin" → city: "Austin"
   - "based in Chicago" → city: "Chicago"  
   - "dental clinic Austin" → city: "Austin" (standalone city name)
   - "law firm Berlin" → city: "Berlin"
   - "restaurant Belgrade" → city: "Belgrade"
   - Known cities: Austin, Chicago, London, Berlin, Belgrade, Paris, New York, Los Angeles, Sydney, Toronto, Madrid, Barcelona, Munich, Hamburg, Novi Sad
   - "just restaurant" → city: null (no location)
   
   If the user lists more than one city, return "city" as an array of strings.
   Example: "Austin, New York" → "city":["Austin","New York"]

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

// Save draft endpoint - saves work in progress (no auth required)
app.post('/api/save-draft', async (req, res) => {
  // Use Google user ID if present, otherwise sessionID
  const ownerKey = req.user?.id || req.sessionID;
  const { state, convo } = req.body;
  console.log('🎯 save-draft for ownerKey=', ownerKey);
  console.log('📦 state type:', typeof state, 'convo type:', typeof convo);
  try {
    // Don't double-stringify - the data is already JSON objects from the client
    const result = await pool.query(
      `INSERT INTO sites (user_id, state, convo, is_draft, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW())
       ON CONFLICT (user_id, is_draft)
       DO UPDATE SET state = EXCLUDED.state,
                     convo = EXCLUDED.convo,
                     updated_at = NOW()
       RETURNING *`,
      [ownerKey, JSON.stringify(state), JSON.stringify(convo)]
    );
    console.log('✅ save-draft upserted:', result.rows[0]);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ save-draft error:', err.stack || err);
    return res.status(500).json({ error: 'Could not save draft' });
  }
});

// Build site endpoint to save collected data
app.post('/api/build-site', ensureLoggedIn(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { convo, state } = req.body;
    console.log('Building site with data:', { convo, state });
    
    try {
      // Upsert draft to sites table
      await pool.query(`
        INSERT INTO sites (user_id, state, convo, is_draft, updated_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (user_id, is_draft)
        DO UPDATE SET 
          state = EXCLUDED.state,
          convo = EXCLUDED.convo,
          updated_at = NOW()
      `, [userId, JSON.stringify(state), JSON.stringify(convo)]);
      
      console.log('Draft saved to sites table for user:', userId);
    } catch (error) {
      console.error('Failed to save draft:', error.message);
    }
    
    // Here you would typically save to database
    // For now, just log the collected data
    console.log('Conversation:', convo);
    console.log('Final state:', state);
    
    res.json({ success: true, message: 'Site data saved successfully' });
  } catch (error) {
    console.error('Error saving site data:', error);
    res.status(500).json({ error: 'Failed to save site data' });
  }
});

// Current user info endpoint  
app.get('/api/me', (req, res) => {
  if (req.user) {
    res.json({ 
      name: req.user.displayName || req.user.name?.givenName || req.user.email?.split('@')[0] || 'User',
      email: req.user.emails?.[0]?.value || req.user.email
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Get user's last draft (no auth required)
app.get('/api/last-draft', async (req, res) => {
  const ownerKey = req.user?.id || req.sessionID;
  console.log('🔍 last-draft lookup for ownerKey=', ownerKey);
  try {
    const { rows } = await pool.query(
      `SELECT state, convo
       FROM sites
       WHERE user_id = $1 AND is_draft = TRUE
       ORDER BY updated_at DESC
       LIMIT 1`,
      [ownerKey]
    );
    if (!rows.length) return res.status(204).end();
    res.json({
      state: rows[0].state,
      conversation: rows[0].convo
    });
  } catch (error) {
    console.error('Failed to get draft:', error);
    res.status(500).json({ error: 'Failed to load draft' });
  }
});

// Stock images API endpoint
app.post('/api/stock-images', async (req, res) => {
  try {
    const { serviceType, country, minNeeded = 4, userImages = [] } = req.body;
    
    if (!serviceType || !country) {
      return res.status(400).json({ error: 'serviceType and country are required' });
    }
    
    const images = await getStockImages(serviceType, country, minNeeded, userImages);
    res.json({ images });
  } catch (error) {
    console.error('Stock images API error:', error);
    res.status(500).json({ error: 'Failed to fetch stock images' });
  }
});

// Google Business Profile details endpoint
app.post('/api/gbp-details', async (req, res) => {
  const { placeUrl } = req.body;
  
  if (!placeUrl) {
    return res.status(400).json({ error: 'placeUrl is required' });
  }
  
  const GOOGLE_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_KEY;
  
  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  try {
    // Import fetch dynamically
    const { default: fetch } = await import('node-fetch');
    
    // STEP 1: Get Place ID from URL
    const idResp = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeUrl)}&inputtype=textquery&fields=place_id&key=${GOOGLE_KEY}`
    ).then(r => r.json());
    
    const place_id = idResp.candidates?.[0]?.place_id;
    if (!place_id) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // STEP 2: Get place details
    const details = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,photo,rating,user_ratings_total&key=${GOOGLE_KEY}`
    ).then(r => r.json());

    if (details.status !== 'OK') {
      return res.status(400).json({ error: 'Failed to fetch place details', details: details.error_message });
    }

    // Build photo URLs (first 3)
    const photos = (details.result.photos || []).slice(0, 3).map(p =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${p.photo_reference}&key=${GOOGLE_KEY}`
    );

    res.json({
      name: details.result.name,
      address: details.result.formatted_address,
      phone: details.result.formatted_phone_number,
      rating: details.result.rating,
      reviews: details.result.user_ratings_total,
      photos
    });

  } catch (error) {
    console.error('GBP API error:', error);
    res.status(500).json({ error: 'Failed to fetch Google Business Profile details' });
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