# LocalAI Builder Website

## Overview

LocalAI Builder is a static marketing website for an AI-powered website building platform. The site is built with pure HTML5, vanilla CSS, and JavaScript, designed to be fully responsive and accessible. It serves as a complete customer journey from landing page to checkout, including industry-specific solutions and account management.

## System Architecture

### Frontend Architecture
- **Pure Static Site**: No frameworks or build tools required
- **Mobile-First Design**: Responsive layout using CSS Grid and Flexbox
- **Single CSS File**: All styles contained in `styles.css` (≤ 120 KB unminified)
- **Vanilla JavaScript**: Single `script.js` file handling all interactions
- **Modular HTML Pages**: Each page serves a specific purpose in the customer journey

### Styling System
- **CSS Variables**: Centralized color palette and design tokens
- **Responsive Typography**: Using `clamp()` functions for fluid scaling
- **Breakpoint Strategy**: Mobile-first with breakpoints at 640px and 1024px
- **Component-Based CSS**: Reusable classes for consistent UI elements

### Multilingual Support
- **Attribute-Based Translation**: `data-lang` attributes on all user-facing text
- **Serbian Support**: Embedded in HTML comments for future JavaScript implementation
- **Translation Ready**: Structure prepared for dynamic language switching

## Key Components

### Navigation System
- **Sticky Header**: Fixed navigation with mobile hamburger menu
- **Logo**: SVG-based scalable logo with brand colors
- **Responsive Menu**: Collapsible navigation for mobile devices
- **Active States**: Visual indication of current page

### Interactive Elements
- **AI Prompt Form**: Dynamic word counting and conditional field display
- **FAQ Accordion**: Expandable question/answer sections
- **Pricing Calculator**: Plan selection with billing frequency options
- **Shopping Cart**: URL parameter-based plan selection and pricing

### Page Structure
1. **Homepage (index.html)**: Hero section with prompt input, benefits, how-it-works, FAQ, testimonials
2. **Pricing (pricing.html)**: Three-tier pricing with feature comparison
3. **Industries**: Specialized landing pages for different business sectors
4. **Cart/Checkout**: Shopping flow with payment integration placeholders
5. **Account Management**: User dashboard for orders and websites
6. **Legal Pages**: Privacy policy and terms of service

## Data Flow

### User Journey
1. **Landing**: User arrives at homepage, enters business description
2. **Qualification**: Form validates input and shows additional fields for detailed requirements
3. **Plan Selection**: User chooses appropriate pricing tier based on needs
4. **Industry Targeting**: Optional industry-specific landing pages for SEO
5. **Cart Review**: Plan summary with billing options
6. **Checkout**: Payment processing (currently placeholder)
7. **Account Access**: Post-purchase dashboard for managing websites

### State Management
- **URL Parameters**: Plan and industry selection passed via query strings
- **Local Storage**: Cart contents and user preferences
- **Form Validation**: Client-side validation with user feedback
- **Dynamic Content**: JavaScript-driven content updates based on user selections

## External Dependencies

### Payment Processing (Placeholder)
- **Stripe Integration**: Credit card processing (links prepared)
- **PayPal SDK**: Alternative payment method (placeholders ready)
- **Apple/Google Pay**: Mobile payment options mentioned

### Hosting Requirements
- **Static Hosting**: Can be deployed on any static file server
- **Python Server**: Currently configured for Python's built-in HTTP server
- **CDN Ready**: Optimized for content delivery network deployment

### Future Integrations
- **Analytics**: Google Analytics or similar tracking
- **Email Service**: Contact form and newsletter functionality
- **CRM Integration**: Lead capture and customer management

## Deployment Strategy

### Current Setup
- **Replit Environment**: Configured for Node.js 20 and Python 3.11
- **Development Server**: Python HTTP server on port 5000
- **Static Files**: All assets served directly without processing

### Production Considerations
- **Asset Optimization**: CSS and JavaScript can be minified
- **Image Optimization**: SVG logos and icons for scalability
- **Caching Strategy**: Static assets suitable for long-term caching
- **SSL/HTTPS**: Required for payment processing integration

### Scalability
- **Database Ready**: Structure prepared for dynamic content management
- **API Integration**: Placeholder structure for backend services
- **User Authentication**: Account system framework in place

## Changelog

- June 28, 2025: Implemented React component template system - extracted homepage into 9 modular components (Hero, Features, Services, Testimonials, Team, Gallery, ContactMap, SecondaryCTA, Footer), created design token system with ThemeProvider context, built data-driven template architecture with JSON schema, added React Router for template preview routes (/templates/homepage-1), integrated template navigation into existing Version 1 cards in both desktop and mobile dashboards, preserved original dashboard functionality while enabling component-based website generation
- June 28, 2025: Fixed GBP duplicate message issue - implemented clearInput() helper function to prevent stale text in input fields, added proper input clearing throughout conversation flow, eliminated duplicate "yes" responses during GBP confirmation process
- June 28, 2025: Implemented intelligent Google Business Profile lookup system - replaced address-based search with company name + city lookup for more accurate results, added yes/no prompt for GBP ownership, integrated Google Places API with name-based filtering, enhanced user experience with numbered selection system, removed unnecessary address field from state schema, improved search precision by matching business names rather than physical addresses
- June 26, 2025: Fixed React dashboard deployment with simplified Vite configuration - resolved blocked host errors by removing complex HMR settings, dashboard now runs on port 4000 (mapped to 3002 by Replit), added mobile full-screen preview overlay with floating "View Preview" button and close functionality, all features working properly with allowedHosts: 'all' configuration
- June 26, 2025: Created React dashboard with Vite - added complete dashboard interface in /dashboard folder with three-panel layout (versions/chat, live preview, editor), responsive design with mobile hamburger menu, all buttons wired to console logging, running on port 5173 alongside main Node.js app on port 5000, configured with proper Replit host binding and WSS HMR for public URL access
- June 25, 2025: Fixed font picker positioning and visibility system - created showFontPickerInline() function to inject font picker directly into chat thread before completion message, replaced all hidden attribute usage with CSS classes for consistent visibility control, font picker now appears at correct position in conversation flow after colors and images are handled
- June 24, 2025: Fixed authentication callback to redirect based on draft status - implemented PostgreSQL draft checking in Google OAuth callback, users with existing drafts now redirect to /chat?draft=true, new users go to homepage, added "no images" skip option with text recognition, fixed color picker to show user selection feedback with colored confirmation message
- June 24, 2025: Implemented MongoDB draft system for conversation persistence - added database connection with MongoClient, extended /api/build-site to save user drafts, created /api/last-draft endpoint for retrieving saved conversations, updated chat.js to load drafts on ?draft=true parameter, enhanced state management to include conversation history
- June 24, 2025: Fixed layout padding with unified CSS rule - removed incorrect .footer class while keeping .site-footer, applied consistent 50px horizontal padding using single rule for header/chatContainer/benefits/faq sections, corrected login button conversion to "Profile" for authenticated users
- June 24, 2025: Fixed Google OAuth email display and streamlined login flow - corrected session serialization to preserve complete user profile data, updated OAuth callback to redirect directly to homepage instead of profile page, confirmed email scope working correctly
- June 24, 2025: Enhanced session system with draft/fresh functionality - removed static script injection, implemented async user detection, added /api/last-draft endpoint for conversation persistence, created draft vs fresh URL parameters for chat modes, updated banner styling to match brand guidelines
- June 24, 2025: Implemented session-aware authentication system - added /api/me endpoint for user status checking, created welcome banner for returning users on homepage, integrated dynamic user name detection in chat interface, configured proper session cookies with 24-hour expiration
- June 24, 2025: Fixed chat interface image upload flow - prevented duplicate sign-in buttons, positioned "add more images" button above sign-in area, added legal documentation (Asymmetric Digital doo business name, 14-day refund policy page, navigation links to refund policy)
- June 24, 2025: Implemented personalized chat greetings - removed static AI bubble from HTML, added dynamic greeting based on user login status, integrated backend user name injection system
- June 23, 2025: Implemented clean homepage with docked chat interface - removed old RegEx form elements, created responsive layout with hero at 45% width and chat pane with 30px margins, added color picker integration and enhanced conversation flow (company → city → industry → language → services → colors → images), fully responsive across all devices
- June 23, 2025: Enhanced chat interface with direct answer capture - removed regex-based company name detection, implemented verbatim response capture, added prominent drag-and-drop zone, enabled multiple cities support, and created data persistence endpoint for site generation
- June 22, 2025: Enhanced city detection and company name validation - implemented comprehensive location patterns (standalone cities, "in/based in" phrases), refined company name rules to reject generic endings (clinic, studio, agency), always-visible image uploader and color pickers for improved UX
- June 22, 2025: Added image upload capability with deduplication - implemented drag-and-drop image zone with file browser fallback, enhanced system prompt for distinctive company names, aligned JavaScript key names with GPT response structure (company_name), added conditional drop zone visibility
- June 22, 2025: Migrated to CSS class-based visibility system - replaced HTML hidden attributes with .hidden CSS class for better performance, removed legacy CSS rules that conflicted with new system, color pickers now toggle with panel visibility for cleaner UX
- June 22, 2025: Optimized follow-up panel visibility - panel now starts fully hidden and shows only when missing_fields is not empty, aligned wrapper IDs with GPT response keys (wrapLanguage), enhanced language inference rules for consistent city-based detection
- June 22, 2025: Replaced regex detection with GPT-powered analysis - implemented OpenAI API backend route for intelligent business data extraction, added debounced frontend calls for accurate company/industry/city/language detection
- June 22, 2025: Added beta banner and wait-list form to marketing site - implemented "Beta Preview – Launching Soon" banner across all 5 pages, added email capture form on homepage for early access sign-ups
- June 22, 2025: Created lightweight marketing site in /marketing/ folder - independent 5-page site (index, pricing, contact, terms, privacy) with GoAISite branding, Cooper Hewitt fonts, and €10/20/40 pricing structure, designed for CDN deployment
- June 22, 2025: Fixed JavaScript observer variable conflict preventing page load errors
- June 22, 2025: Enhanced homepage with smart follow-up panel - added dual color picker, industry/location/language inputs, intelligent detection for missing business data (company name, city, industry), improved form data collection for personalized website generation
- June 22, 2025: Complete branding refresh to GoAISite - updated logo to 92px with AI-themed design, Cooper Hewitt wordmark font, changed primary color from green (#2e8b57) to yellow (#ffc000), updated menu tab colors to #545454
- June 22, 2025: Implemented dual authentication system - Google OAuth and email/password login with user registration, in-memory user store, and unified profile page
- June 22, 2025: Added Chatislav 24/7 chat widget to all pages (index, pricing, cart, checkout, account, signup, privacy, tos) for customer support
- June 22, 2025: Major pricing page redesign - removed Free Trial card, implemented pill-style billing toggle, updated all plan buttons to "Try for Free", added "Everything in X, plus:" headings to Pro/Agency plans, updated responsive layout for 3 plans
- June 21, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.