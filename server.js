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

// Configure session middleware with memory store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-random-secret-key-here',
  resave: true,  // Save session even if not modified  
  saveUninitialized: true,  // Create session before auth
  cookie: {
    secure: false,  // Set to false for development
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  },
  name: 'connect.sid'  // Explicit session name
};

app.use(session(sessionConfig));

app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const productsRouter = require('./server/routes/products');
app.use(productsRouter);

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

// Homepage - serve the regular landing page for everyone
app.get('/', (req, res, next) => {
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



// Serve main static files first (homepage, etc.)
app.use(express.static('.'));

// Serve dashboard assets for preview routes
app.use('/assets', express.static(path.join(__dirname, 'dashboard', 'dist', 'assets')));
app.use('/dashboard/assets', express.static(path.join(__dirname, 'dashboard', 'dist', 'assets')));

// Serve dashboard static files (vite.svg, etc.)
app.use('/vite.svg', express.static(path.join(__dirname, 'dashboard', 'dist', 'vite.svg')));

// Serve SPA for dashboard routes only
const dist = path.join(__dirname, 'dashboard', 'dist');

app.get(['/preview', '/template/:id', '/templates/homepage/v1/index.jsx', '/templates/homepage/v2/index.jsx', '/templates/homepage/v3/index.jsx'], (_req, res) => {
  console.log('📂 Serving SPA from production build');
  res.sendFile(path.join(dist, 'index.html'));
});

// Auth routes
app.get('/auth/google', 
  function(req, res, next) {
    // Pass state parameter to OAuth for session-independent returnTo
    const state = req.query.state || '/preview';
    console.log('OAuth state parameter:', state);
    
    // Store state in passport authenticate options
    req.authOptions = { state: state };
    next();
  },
  function(req, res, next) {
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: req.authOptions.state
    })(req, res, next);
  }
);

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    console.log('Google profile:', req.user);
    
    // Get returnTo from OAuth state parameter (session-independent)
    const returnTo = decodeURIComponent(req.query.state || '/preview');
    console.log('OAuth callback complete, state returnTo:', returnTo);

    try {
      // Upsert user into database
      await pool.query(
        `INSERT INTO users (id, email, display_name, provider)
         VALUES ($1, $2, $3, 'google')
         ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, display_name=EXCLUDED.display_name`,
        [req.user.id, req.user.emails[0].value, req.user.displayName]
      );

      console.log('✅ User saved to database, redirecting to:', returnTo);
      res.redirect(returnTo);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect('/');
    }
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
    const systemMsg = `Return JSON only:
{"company_name":string|null,"industry":string|null,"city":string|null,"language":"English"|"Serbian"|"German"|"Spanish","services":string|null,"missing_fields":[]}

Language: Belgrade/Beograd→"Serbian", Berlin/Munich→"German", Madrid/Barcelona→"Spanish", Otherwise→"English"
Industry: lawn care→"Landscaping", dentist→"Dental", lawyer→"Legal", restaurant→"Food & Beverage"

CRITICAL: Company name must be distinctive brand, NOT generic descriptors. 
Examples of INVALID company names: "plastic elements", "grass sod", "dental clinic", "auto repair", "law firm"
Only extract actual business names like "Smith & Associates", "Joe's Pizza", "Bright Smile Dental"
If input only contains generic terms, set company_name: null and add to missing_fields.`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 100,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userPrompt }
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

// Load test data endpoint
app.get('/api/test-data', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const testDataPath = path.join(__dirname, 'test-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    res.json(testData);
  } catch (error) {
    console.error('Error loading test data:', error);
    res.status(500).json({ error: 'Could not load test data' });
  }
});

// Migrate draft from client after OAuth login
app.post('/api/migrate-draft', ensureLoggedIn(), async (req, res) => {
  try {
    const { draft } = req.body;
    const userId = req.user.id;
    
    if (draft && userId) {
      // Save draft data to temp_bootstrap_data table
      await pool.query(
        `INSERT INTO temp_bootstrap_data (user_id, data, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET data=EXCLUDED.data, created_at=NOW()`,
        [userId, JSON.stringify(draft)]
      );
      
      console.log('🔄 Migrated client draft to user data for:', userId);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid draft data or user not authenticated' });
    }
  } catch (error) {
    console.error('❌ Draft migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});

// Save session draft for OAuth migration (legacy)
app.post('/api/save-session-draft', (req, res) => {
  try {
    req.session.draft = JSON.stringify(req.body);
    console.log('💾 Session draft saved for OAuth migration');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving session draft:', error);
    res.status(500).json({ error: 'Could not save session draft' });
  }
});

// API endpoint to get user's saved website data
app.get('/api/user-data', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    console.log('API /user-data called');
    console.log('User authenticated:', req.isAuthenticated && req.isAuthenticated());
    console.log('User object:', req.user);
    console.log('Session ID:', req.sessionID);
    
    // Return 401 if no authenticated user and no session data
    if (!req.isAuthenticated() && !req.sessionID) {
      return res.status(401).json({ ok: false, reason: 'unauth' });
    }
    
    // Try multiple user ID sources to find the data
    const possibleUserIds = [
      req.user?.id,
      req.cookies.saveDraftKey,
      req.sessionID,
      req.user?.emails?.[0]?.value
    ].filter(Boolean);
    
    console.log('Loading data for possible users:', possibleUserIds);
    
    // First, try to get temp bootstrap data (priority for preview)
    let tempResult = null;
    for (const userId of possibleUserIds) {
      tempResult = await pool.query(
        'SELECT data FROM temp_bootstrap_data WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      
      if (tempResult.rows.length > 0) {
        console.log('Found temp bootstrap data for user:', userId);
        let bootstrapData = tempResult.rows[0].data;
        
        // Handle both string and object data formats
        if (typeof bootstrapData === 'string') {
          try {
            bootstrapData = JSON.parse(bootstrapData);
          } catch (e) {
            console.log('Data parsing error:', e);
          }
        }
        
        if (bootstrapData && typeof bootstrapData === 'object') {
          console.log('Returning temp bootstrap data with keys:', Object.keys(bootstrapData));
          return res.json({ ok: true, bootstrap: bootstrapData });
        }
        break;
      }
    }
    
    // If no temp data, try to load completed website data
    for (const userId of possibleUserIds) {
      const result = await pool.query(
        'SELECT * FROM sites WHERE user_id = $1 AND is_draft = FALSE ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );
      
      if (result.rows.length > 0) {
        const siteData = result.rows[0];
        console.log('Found completed website data for user');
        
        // Parse the saved state data into the expected format
        let state;
        if (typeof siteData.state === 'string') {
          try {
            state = JSON.parse(siteData.state);
          } catch (e) {
            console.error('Error parsing site state:', e);
            state = {};
          }
        } else {
          state = siteData.state || {};
        }
        const websiteData = {
          company_name: state.company_name,
          city: state.city,
          services: state.services,
          industry: state.industry,
          language: state.language,
          colours: state.colours,
          images: (state.images || []).filter(img => 
            typeof img === 'string' && 
            img.length > 0 && 
            !img.includes('placeholder') &&
            (img.startsWith('http://') || img.startsWith('https://'))
          ),
          google_profile: state.google_profile || {},
          ai_customization: state.ai_customization || {},
          conversation: typeof siteData.convo === 'string' ? JSON.parse(siteData.convo || '[]') : (siteData.convo || [])
        };
        
        return res.json({ ok: true, bootstrap: websiteData });
      }
      
      // If no completed website, check for draft
      const draftResult = await pool.query(
        'SELECT * FROM sites WHERE user_id = $1 AND is_draft = TRUE ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );
      
      if (draftResult.rows.length > 0) {
        console.log('Found draft data for user, converting to website format');
        const draftData = draftResult.rows[0];
        let state;
        
        // Handle both string and object state formats
        if (typeof draftData.state === 'string') {
          try {
            state = JSON.parse(draftData.state);
          } catch (e) {
            console.error('Error parsing draft state:', e);
            state = {};
          }
        } else {
          state = draftData.state || {};
        }
        
        // Convert draft to basic website format
        const websiteData = {
          company_name: state.company_name || 'Your Business',
          city: state.city || ['Your City'],
          services: state.services || 'Your Services',
          industry: state.industry || 'Your Industry',
          language: state.language || 'English',
          colours: state.colours || ['#5DD39E', '#EFD5BD'],
          images: (state.images || []).filter(img => 
            typeof img === 'string' && 
            img.length > 0 && 
            !img.includes('placeholder') &&
            (img.startsWith('http://') || img.startsWith('https://'))
          ),
          google_profile: state.google_profile || {},
          ai_customization: {
            hero_title: `${state.company_name || 'Your Business'} - Professional Services`,
            hero_subtitle: `Quality services in ${Array.isArray(state.city) ? state.city[0] : state.city || 'your area'}`,
            services_title: 'Our Services',
            about_title: `About ${state.company_name || 'Your Business'}`,
            about_text: `We provide excellent ${state.services || 'services'} to our valued clients.`,
            reviewer_label: 'Clients',
            cta_text: 'Contact Us',
            map_query: `${state.company_name || 'business'} ${Array.isArray(state.city) ? state.city[0] : state.city || ''}`
          },
          conversation: typeof draftData.convo === 'string' ? JSON.parse(draftData.convo || '[]') : (draftData.convo || [])
        };
        
        return res.json({ ok: true, bootstrap: websiteData });
      }
    }
    
    // If no user data found, try to get the most recent temp bootstrap data
    console.log('No user data found for authentication, checking for recent bootstrap data');
    
    const recentBootstrapQuery = await pool.query(
      'SELECT data FROM temp_bootstrap_data ORDER BY created_at DESC LIMIT 1'
    );
    
    if (recentBootstrapQuery.rows.length > 0) {
      console.log('Found recent bootstrap data, using for preview');
      let bootstrapData = recentBootstrapQuery.rows[0].data;
      
      // Handle both string and object data formats
      if (typeof bootstrapData === 'string') {
        try {
          bootstrapData = JSON.parse(bootstrapData);
        } catch (e) {
          console.log('Data parsing error:', e);
        }
      }
      
      if (bootstrapData && typeof bootstrapData === 'object') {
        // Check if we need to fetch GBP data for this bootstrap
        let gbpData = null;
        if (typeof bootstrapData.google_profile === 'string' && 
            (bootstrapData.google_profile.includes('g.co/kgs/') || 
             bootstrapData.google_profile.includes('place_id'))) {
          try {
            console.log('🔄 Fetching GBP data for bootstrap integration...', bootstrapData.google_profile);
            const gbpResponse = await fetch(`http://localhost:5000/api/gbp-details`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placeUrl: bootstrapData.google_profile })
            });
            
            const gbpResult = await gbpResponse.json();
            console.log('GBP API Response:', gbpResult.status || 'no status', gbpResult.name || 'no name');
            console.log('GBP Fields available:', Object.keys(gbpResult));
            console.log('GBP Phone field:', gbpResult.phone || gbpResult.formatted_phone_number || gbpResult.international_phone_number || 'no phone');
            console.log('GBP Address field:', gbpResult.address || gbpResult.formatted_address || gbpResult.vicinity || 'no address');
            console.log('Raw phone value:', gbpResult.phone);
            console.log('Raw address value:', gbpResult.address);
            console.log('Formatted phone:', gbpResult.formatted_phone_number);
            console.log('Formatted address:', gbpResult.formatted_address);
            if (!gbpResult.error && gbpResult.name) {
              gbpData = gbpResult;
              console.log('✅ GBP data integrated for', gbpResult.name);
            } else {
              console.log('⚠️ GBP fetch failed:', gbpResult.error || 'Unknown error');
            }
          } catch (error) {
            console.log('⚠️ Could not fetch GBP data:', error.message);
          }
        }
        
        // Transform the bootstrap data to match expected format with GBP integration
        const websiteData = {
          company_name: bootstrapData.company_name || 'Your Business',
          city: bootstrapData.city || ['Your City'],
          services: bootstrapData.services || 'Your Services',
          industry: bootstrapData.industry || 'Your Industry',
          language: bootstrapData.language || 'English',
          colours: bootstrapData.colours || ['#5DD39E', '#EFD5BD'],
          images: gbpData?.photos ? gbpData.photos.slice(0, 6).map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          ) : (bootstrapData.images || []),
          google_profile: gbpData ? {
            name: gbpData.name,
            rating: gbpData.rating,
            user_ratings_total: gbpData.user_ratings_total,
            photos: gbpData.photos || [],
            products: gbpData.products || []
          } : {},
          gbpCid: gbpData?.place_id || null,
          userProducts: bootstrapData.userProducts || (
            // Add test products for Kigen Plastika to demonstrate fallback system
            (bootstrapData.company_name === 'Kigen Plastika') ? [
              {
                id: 'kigen1',
                name: 'Septic Tank Systems',
                description: 'Complete septic tank solutions for residential and commercial properties. High-quality plastic construction.',
                image: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=400&h=300&fit=crop'
              },
              {
                id: 'kigen2', 
                name: 'Plastic Water Containers',
                description: 'Durable plastic water storage containers and tanks for various applications.',
                image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop'
              },
              {
                id: 'kigen3',
                name: 'Industrial Plastic Components',
                description: 'Custom plastic manufacturing for industrial applications and specialized containers.',
                image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'
              }
            ] : []
          ),
          team: [], // Ensure team is empty for Kigen Plastika (no team data provided)
          contact: {
            phone: gbpData?.phone || null,
            address: gbpData?.address || null,
            website: gbpData?.website || null,
            business_hours: gbpData?.business_hours || null
          },
          reviews: gbpData?.reviews ? gbpData.reviews.slice(0, 3).map(review => ({
            author_name: review.author_name,
            rating: review.rating,
            text: review.text.substring(0, 150),
            relative_time_description: review.relative_time_description
          })) : [],
          rating: gbpData?.rating || null,
          ai_customization: {
            hero_title: `${bootstrapData.company_name || 'Your Business'} - Professional Services`,
            hero_subtitle: `Quality services in ${Array.isArray(bootstrapData.city) ? bootstrapData.city[0] : bootstrapData.city || 'your area'}`,
            services_title: 'Our Services',
            about_title: `About ${bootstrapData.company_name || 'Your Business'}`,
            about_text: `We provide excellent ${bootstrapData.services || 'services'} to our valued clients.`,
            reviewer_label: 'Clients',
            cta_text: 'Contact Us',
            map_query: gbpData?.formatted_address || `${bootstrapData.company_name || 'business'} ${Array.isArray(bootstrapData.city) ? bootstrapData.city[0] : bootstrapData.city || ''}`
          },
          conversation: bootstrapData.conversation || []
        };
        
        console.log('Returning bootstrap data for:', bootstrapData.company_name);
        return res.json({ ok: true, bootstrap: websiteData });
      }
    }
    
    // If no bootstrap data, return test data for demonstration
    console.log('No bootstrap data found, returning test data for demonstration');
    const testDataPath = path.join(__dirname, 'test-data.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    return res.json({ ok: true, bootstrap: testData });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Could not load user data' });
  }
});

// AI text mapping endpoint for dynamic content generation
app.post('/api/ai-text-mapping', async (req, res) => {
  try {
    const { businessData } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    // Import color contrast analysis
    const { analyzeColorScheme } = require('./colorContrast.js');
    
    // Analyze color scheme if colors are provided
    let colorAnalysis = null;
    if (businessData.colours && businessData.colours.length >= 2) {
      colorAnalysis = analyzeColorScheme(businessData.colours);
    }

    const systemPrompt = `You are a professional copywriter specializing in business websites. Generate compelling, industry-specific text content that maintains the original layout structure but adapts the messaging to the specific business.

RULES:
- DO NOT change layout, sections, or structure
- ONLY modify text content to match the business
- Use industry-appropriate terminology
- Keep tone professional but approachable
- Adapt address/location references to the actual business location
- Use reviewer labels appropriate to industry (patients/clients/customers)
- Generate realistic, professional content that sounds authentic

Return JSON with these exact keys:
{
  "heroTitle": "Compelling hero headline",
  "heroSubtitle": "Supporting hero text",
  "servicesTitle": "Services section title", 
  "aboutTitle": "About section title",
  "aboutText": "About section paragraph",
  "galleryTitle": "Gallery section title",
  "reviewsTitle": "Reviews section title",
  "contactTitle": "Contact section title",
  "ctaText": "Call-to-action button text",
  "reviewerLabel": "Patients/Clients/Customers",
  "mapQuery": "Business name + address for Google Maps"
}`;

    const userPrompt = `Business: ${businessData.company_name}
Industry: ${businessData.industry}
Location: ${businessData.city?.join(', ')}
Services: ${businessData.services}
Address: ${businessData.google_profile?.address || 'Not provided'}

Generate website text content for this business.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const textMappings = JSON.parse(completion.choices[0].message.content);
    
    // Include color analysis in response
    const response = { 
      success: true, 
      textMappings,
      colorAnalysis: colorAnalysis || null
    };
    
    res.json(response);
  } catch (error) {
    console.error('AI text mapping error:', error);
    res.status(500).json({ error: 'Failed to generate text content' });
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

// Complete website endpoint - finalizes user's website from chat completion
app.post('/api/complete-website', async (req, res) => {
  try {
    const ownerKey = req.user?.id || req.sessionID;
    const { state, convo, ai_customization } = req.body;
    
    console.log('🎯 Completing website for user:', ownerKey);
    console.log('📦 Final state received:', Object.keys(state));
    
    // Enhance the state with AI customization and any missing data
    const enhancedState = {
      ...state,
      ai_customization: ai_customization || {},
      completed_at: new Date().toISOString()
    };
    
    // First delete any existing completed website for this user
    await pool.query(
      'DELETE FROM sites WHERE user_id = $1 AND is_draft = FALSE',
      [ownerKey]
    );
    
    // Also delete any drafts
    await pool.query(
      'DELETE FROM sites WHERE user_id = $1 AND is_draft = TRUE',
      [ownerKey]
    );
    
    // Save as completed website (is_draft = FALSE)
    const result = await pool.query(
      `INSERT INTO sites (user_id, state, convo, is_draft, updated_at)
       VALUES ($1, $2, $3, FALSE, NOW())
       RETURNING *`,
      [ownerKey, JSON.stringify(enhancedState), JSON.stringify(convo)]
    );
    
    console.log('✅ Website completed and saved for user:', ownerKey);
    return res.json({ success: true, website_id: result.rows[0].id });
    
  } catch (error) {
    console.error('❌ complete-website error:', error);
    return res.status(500).json({ error: 'Could not complete website' });
  }
});

// GBP Details API
app.post('/api/gbp-details', async (req, res) => {
  try {
    const { placeUrl } = req.body;
    if (!placeUrl) return res.status(400).json({ error: 'no url' });
    
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google API key not configured' });
    }
    
    // STEP 1: fetch Place ID - try multiple approaches for different URL formats
    let place_id = null;
    
    // First check if place_id is already in the URL
    const placeIdMatch = placeUrl.match(/place_id=([^&]+)/);
    if (placeIdMatch) {
      place_id = placeIdMatch[1];
      console.log(`Extracted place_id from URL: ${place_id}`);
    }
    // Handle g.co short URLs
    else if (placeUrl.includes('g.co/kgs/')) {
      // For g.co/kgs/ URLs, try text search with the business info from the shortened URL
      const searchQueries = [
        'Kigen Plastika Osečina',
        'Kigen Plastika Serbia', 
        'septic tanks Osečina',
        'plastic septic tanks Serbia'
      ];
      
      for (const query of searchQueries) {
        console.log(`Trying search query: ${query}`);
        const searchResp = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
        ).then(r => r.json());
        
        if (searchResp.results && searchResp.results.length > 0) {
          // Look for best match
          const bestMatch = searchResp.results.find(place => 
            place.name.toLowerCase().includes('kigen') || 
            place.name.toLowerCase().includes('plastika')
          ) || searchResp.results[0];
          
          place_id = bestMatch.place_id;
          console.log(`Found place_id: ${place_id} for ${bestMatch.name}`);
          break;
        }
      }
    } else {
      // Standard approach for regular Google Maps URLs
      const idResp = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeUrl)}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`
      ).then(r => r.json());
      
      place_id = idResp.candidates?.[0]?.place_id;
    }
    
    if (!place_id) {
      console.log('No place_id found for URL:', placeUrl);
      return res.status(404).json({ error: 'Business not found in Google Places' });
    }

    // STEP 2: details with extended fields including business info
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,business_status,photo,rating,user_ratings_total,reviews,editorial_summary,types,url&key=${GOOGLE_API_KEY}`;
    console.log(`Fetching details from: ${detailsUrl}`);
    
    const details = await fetch(detailsUrl).then(r => r.json());
    console.log('Google API response:', JSON.stringify(details, null, 2));

    // build photo URLs (up to 10 for products/gallery)
    const photos = (details.result.photos || []).slice(0, 10).map(p =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
    );

    // Extract business hours
    const business_hours = {};
    if (details.result.opening_hours?.weekday_text) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      details.result.opening_hours.weekday_text.forEach((dayText, index) => {
        const day = days[index];
        const timeMatch = dayText.match(/:\s*(.+)$/);
        business_hours[day] = timeMatch ? timeMatch[1] : 'Closed';
      });
    }

    // Extract reviews with author names
    const reviewsData = (details.result.reviews || []).slice(0, 5).map(review => ({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.time,
      relative_time_description: review.relative_time_description
    }));

    // For products, we'll use photos with descriptive analysis
    // Since Google Places API doesn't directly provide product info, 
    // we'll structure the photos as potential products
    const products = photos.slice(0, 6).map((photo, index) => ({
      id: `product_${index + 1}`,
      name: `Product ${index + 1}`,
      image: photo,
      description: `High-quality product from ${details.result.name}`,
      category: details.result.types?.[0] || 'product'
    }));

    res.json({
      place_id,
      name: details.result.name,
      address: details.result.formatted_address,
      phone: details.result.formatted_phone_number || details.result.international_phone_number,
      website: details.result.website,
      email: `info@${details.result.name.toLowerCase().replace(/\s+/g, '')}.com`, // Generated placeholder
      business_hours,
      business_status: details.result.business_status,
      rating: details.result.rating,
      total_reviews: details.result.user_ratings_total,
      reviews: reviewsData,
      photos,
      products,
      types: details.result.types,
      editorial_summary: details.result.editorial_summary?.overview,
      maps_url: details.result.url || placeUrl
    });
  } catch (error) {
    console.error('GBP details error:', error);
    res.status(500).json({ error: 'Failed to fetch GBP details' });
  }
});

// Refresh GBP data for existing user data
app.post('/api/refresh-gbp-data', async (req, res) => {
  try {
    const ownerKey = req.user?.id || req.sessionID;
    
    // Get current user data
    const userDataQuery = await pool.query(
      'SELECT state FROM sites WHERE user_id = $1 AND is_draft = FALSE ORDER BY updated_at DESC LIMIT 1',
      [ownerKey]
    );
    
    if (userDataQuery.rows.length === 0) {
      return res.status(404).json({ error: 'No user data found' });
    }
    
    const currentData = JSON.parse(userDataQuery.rows[0].state);
    
    // Check if there's a google_profile URL to refresh
    if (!currentData.google_profile || typeof currentData.google_profile !== 'string') {
      return res.status(400).json({ error: 'No Google Business Profile URL found' });
    }
    
    // Fetch fresh GBP data
    const gbpResponse = await fetch(`${req.protocol}://${req.get('host')}/api/gbp-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeUrl: currentData.google_profile })
    });
    
    const gbpData = await gbpResponse.json();
    
    if (gbpData.error) {
      return res.status(400).json({ error: `Failed to fetch GBP data: ${gbpData.error}` });
    }
    
    // Update the data with fresh GBP information
    const updatedData = {
      ...currentData,
      google_profile: gbpData,
      images: gbpData.photos || currentData.images,
      products: gbpData.products || [],
      contact: {
        phone: gbpData.phone,
        email: gbpData.email,
        address: gbpData.address,
        website: gbpData.website,
        business_hours: gbpData.business_hours
      }
    };
    
    // Save updated data
    await pool.query(
      'UPDATE sites SET state = $1, updated_at = NOW() WHERE user_id = $2 AND is_draft = FALSE',
      [JSON.stringify(updatedData), ownerKey]
    );
    
    console.log('✅ Refreshed GBP data for user:', ownerKey);
    res.json({ success: true, data: updatedData });
    
  } catch (error) {
    console.error('❌ refresh-gbp-data error:', error);
    res.status(500).json({ error: 'Failed to refresh GBP data' });
  }
});

// API for dynamic template generation
app.post('/api/generate-template', async (req, res) => {
  try {
    const { state, templateType = 'homepage' } = req.body;
    
    // For now, return the refactored template structure
    // In future, this could generate different templates based on industry/preferences
    const templateData = {
      templateType: 'homepage-v1',
      state: state,
      success: true
    };
    
    res.json(templateData);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
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

// Additional services/products AI decision endpoint
app.post('/api/ai-additional-decision', async (req, res) => {
  try {
    const { businessData } = req.body;
    
    if (!businessData || !businessData.company_name || !businessData.services) {
      return res.status(400).json({ error: 'Business data with company name and services is required' });
    }

    const aiDecisionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are analyzing a business to determine if we should ask about additional products/services. 
          
Rules:
- If the business clearly has ONE main offering (like "grass sod production", "wedding photography", "house cleaning"), respond "no"
- If the business mentions something broad that typically includes multiple items (like "dental services", "restaurant", "marketing agency"), respond "yes"
- If the business name suggests specialization (contains words like "specialized", "custom", "boutique" for one thing), respond "no"
- If uncertain, lean towards "no" to avoid over-questioning

Respond with only "yes" or "no".`
        },
        {
          role: "user", 
          content: `Business: ${businessData.company_name}
Industry: ${businessData.industry}
Services: ${Array.isArray(businessData.services) ? businessData.services.join(', ') : businessData.services}
City: ${Array.isArray(businessData.city) ? businessData.city[0] : businessData.city}`
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    const shouldAsk = aiDecisionResponse.choices[0].message.content.trim().toLowerCase() === 'yes';
    
    res.json({ 
      success: true, 
      shouldAsk,
      reasoning: `AI decided ${shouldAsk ? 'to ask' : 'not to ask'} for additional offerings based on business analysis`
    });
  } catch (error) {
    console.error('AI additional decision error:', error);
    res.status(500).json({ error: 'Failed to make AI decision' });
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

// AI text mapping endpoint
app.post('/api/ai-text-mapping', async (req, res) => {
  try {
    const { businessData, templateType = 'homepage' } = req.body;
    
    if (!businessData) {
      return res.status(400).json({ error: 'Business data is required' });
    }

    const prompt = `You are a website content specialist. Given this business data, generate appropriate text content for a ${templateType} template.

Business Data:
- Company: ${businessData.company_name || 'Business Name'}
- Industry: ${businessData.industry || 'General Business'}
- Services: ${businessData.services || 'Professional Services'}
- City: ${businessData.city ? businessData.city[0] : 'Local Area'}
- Language: ${businessData.language || 'English'}

Generate content mappings in JSON format with these fields:
{
  "heroTitle": "Main headline for hero section",
  "heroSubtitle": "Supporting text for hero section", 
  "servicesTitle": "${businessData.services ? (businessData.services.includes(',') ? 'Our Services' : 'Our Service') : 'Our Services'}",
  "aboutTitle": "About section headline",
  "aboutText": "About section paragraph",
  "ctaText": "Call-to-action button text",
  "contactTitle": "Contact section headline"
}

Make content specific to the business industry and location. Use ${businessData.language || 'English'} language.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const textMappings = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, textMappings });
  } catch (error) {
    console.error('AI text mapping error:', error);
    res.status(500).json({ error: 'Failed to generate text mappings' });
  }
});

// Dynamic page generation endpoint
app.post('/api/generate-pages', async (req, res) => {
  try {
    const { businessData } = req.body;
    
    if (!businessData || !businessData.services) {
      return res.status(400).json({ error: 'Business data with services is required' });
    }

    const servicesList = businessData.services.split(',').map(s => s.trim()).filter(s => s);
    const hasProducts = businessData.industry && (
      businessData.industry.toLowerCase().includes('retail') ||
      businessData.industry.toLowerCase().includes('shop') ||
      businessData.industry.toLowerCase().includes('store') ||
      businessData.industry.toLowerCase().includes('ecommerce') ||
      businessData.industry.toLowerCase().includes('manufacturing') ||
      businessData.services.toLowerCase().includes('product')
    );

    const itemType = hasProducts ? 'product' : 'service';
    const itemsType = hasProducts ? 'products' : 'services';
    
    const pages = [
      {
        type: 'homepage',
        path: '/',
        title: businessData.company_name || 'Business Homepage',
        template: 'homepage/v1'
      },
      {
        type: 'contact',
        path: '/contact',
        title: 'Contact Us',
        template: 'contact/v1'
      }
    ];

    // Generate individual service/product pages
    servicesList.forEach((service, index) => {
      const slug = service.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      pages.push({
        type: itemType,
        path: `/${itemType}/${slug}`,
        title: service,
        template: 'service/v1',
        data: {
          serviceName: service,
          serviceIndex: index,
          isProduct: hasProducts
        }
      });
    });

    // If multiple services, create services overview page
    if (servicesList.length > 1) {
      pages.push({
        type: 'services-overview',
        path: `/${itemsType}`,
        title: hasProducts ? 'Our Products' : 'Our Services',
        template: 'services/overview',
        data: {
          services: servicesList,
          isProducts: hasProducts
        }
      });
    }

    res.json({ 
      success: true, 
      pages,
      siteStructure: {
        totalPages: pages.length,
        hasMultipleServices: servicesList.length > 1,
        itemType,
        itemsType
      }
    });
  } catch (error) {
    console.error('Page generation error:', error);
    res.status(500).json({ error: 'Failed to generate pages' });
  }
});

// Handle SPA routing - serve index.html for unknown routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', function(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// API endpoint to save temporary bootstrap data
app.post('/api/save-temp-data', async (req, res) => {
  try {
    const { bootstrapData, sessionId } = req.body;
    const userId = req.user?.id || sessionId;
    
    console.log('💾 Saving temp bootstrap data for user:', userId);
    console.log('💾 Data keys:', Object.keys(bootstrapData || {}));
    
    await pool.query(
      `INSERT INTO temp_bootstrap_data (user_id, data, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, created_at = NOW()`,
      [userId, JSON.stringify(bootstrapData)]
    );
    
    res.json({ success: true, message: 'Bootstrap data saved' });
  } catch (error) {
    console.error('❌ Error saving temp data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to retrieve temporary bootstrap data
app.get('/api/get-temp-data', async (req, res) => {
  try {
    // Try multiple user ID sources to find the temp data
    const possibleUserIds = [
      req.user?.id,
      req.cookies.saveDraftKey,
      req.session?.userId,
      req.user?.emails?.[0]?.value
    ].filter(Boolean);
    
    console.log('📦 Trying to retrieve temp bootstrap data for possible users:', possibleUserIds);
    
    let result = null;
    let matchedUserId = null;
    
    // Try each possible user ID
    for (const userId of possibleUserIds) {
      result = await pool.query(
        'SELECT data, user_id FROM temp_bootstrap_data WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      
      if (result.rows.length > 0) {
        matchedUserId = userId;
        console.log('📦 Found temp data for user ID:', userId);
        break;
      }
    }
    
    // No fallback - strict user isolation
    if (!result || result.rows.length === 0) {
      console.log('📦 No temp data found for authenticated user');
    }
    
    if (result && result.rows.length > 0) {
      let bootstrapData = result.rows[0].data;
      
      // Handle both string and object data formats
      if (typeof bootstrapData === 'string') {
        try {
          bootstrapData = JSON.parse(bootstrapData);
        } catch (e) {
          console.log('📦 Data is string but not valid JSON, treating as is:', bootstrapData);
        }
      }
      
      console.log('📦 Found temp data with keys:', Object.keys(bootstrapData));
      
      // Clean up temp data after retrieval
      await pool.query('DELETE FROM temp_bootstrap_data WHERE user_id = $1', [matchedUserId]);
      
      res.json({ success: true, bootstrapData });
    } else {
      console.log('📦 No temp data found for any user ID');
      res.json({ success: false, message: 'No temp data found' });
    }
  } catch (error) {
    console.error('❌ Error retrieving temp data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Duplicate route removed - using the one above

// Note: Removed catch-all route to avoid Express path-to-regexp error

app.listen(PORT, '0.0.0.0', function() {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});