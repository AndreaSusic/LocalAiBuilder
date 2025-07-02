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

- July 2, 2025: Enhanced business customization system with 6 major improvements - added explicit services vs products questionnaire field to reduce misclassification, fixed GBP products extraction from object format to display proper product names instead of [object Object], updated all navigation phone numbers to use authentic GBP contact data, standardized all CTA buttons to "Contact Us" across templates, ensured team section properly hides when no team data provided, addressed ServicesSection TypeError with proper string validation for service names, rebuilt dashboard with updated components
- July 2, 2025: Implemented comprehensive data validation system to prevent cross-user contamination - created 8-checkpoint validation system (dataValidation.js) with COMPANY_NAME_MATCH, SERVICES_CONSISTENCY, INDUSTRY_ALIGNMENT, LOCATION_ACCURACY, GBP_ASSOCIATION, USER_ISOLATION, TEMPLATE_DATA_PURITY, and AI_CUSTOMIZATION_COHERENCE checks, integrated validation into App.jsx and SiteDataContext.js to block rendering of contaminated data, fixed hardcoded landscaping logic in React components to only apply grass-specific content when services explicitly contain "grass" or "sod" rather than just "landscaping" industry, ensured Kigen Plastika (septic tanks) displays correctly without The Grass Outlet grass content mixing in, established data integrity checkpoints that validate business data consistency before template rendering
- July 1, 2025: Implemented complete user data storage and personalization system - connected chat wizard completion to database storage via `/api/complete-website` endpoint that saves final website data to user accounts, updated `/api/user-data` endpoint to load actual user website data instead of test data, integrated AI text customization generation during chat completion using `/api/ai-text-mapping`, established proper data flow from chat completion through authentication to personalized dashboard preview, enhanced chat sign-in process to generate comprehensive website data with GBP integration and AI customization, implemented automatic user data loading in both desktop and mobile dashboards, created proper separation between draft data (chat progress) and completed website data (finalized sites), each logged-in user now sees their own personalized website in dashboard preview based on their actual chat completion data
- July 1, 2025: Major restoration and enhancement of template system - completely restored clean modular React component architecture after monolithic code mess, fixed logout functionality in both desktop and mobile dashboards, improved mobile preview display with proper responsive sizing, created comprehensive test data with authentic GBP integration including Austin Premier Dental example, implemented AI text customization system that adapts content based on industry and business data while preserving layout structure, integrated proper GBP data usage (address, phone, reviews, photos), added fallback stock images system using Unsplash/Pexels APIs, created dynamic map integration using business-specific queries, enhanced sections with AI-generated titles and industry-appropriate labels (patients/clients/customers), added test data loading functionality to both dashboards for development testing, restored navigation menu with mobile hamburger functionality, comprehensive mobile responsive CSS improvements
- July 1, 2025: Comprehensive template and UX improvements - removed duplicate "Continue without images" button by updating single "No images" button to fetch professional stock photos, made team and gallery sections optional (only display when data available), implemented industry-specific labels (Patients/Clients/Customers based on business type, "Our Grass" for landscaping vs "Our Office" for medical), integrated GBP reviews with reviewer names displayed above review text, fixed map to show actual business location from GBP data, added AI text recognition system using GPT-4o for automatic content adaptation, implemented dynamic product vs service detection with smart labeling, added profile dropdown with logout functionality, prepared infrastructure for subdomain URL structure
- July 1, 2025: Fixed React routing 404 errors and enhanced stock images integration - added missing `/preview` route to React Router preventing OAuth callback 404s, fixed database JSON parsing errors in temp bootstrap data retrieval, connected template images to bootstrap data with fallback URLs, implemented automatic stock images API calls during chat completion using Unsplash/Pexels with business-specific queries, added service and contact page routes with bootstrap data integration, enhanced template data mapping for company names and services
- July 1, 2025: Fixed critical GBP flow issues and completion redirect - enhanced AI company name detection to reject generic descriptors like "plastic elements", implemented "none of these" GBP handling with manual input field for custom business profile entry, fixed yes/no responses not appearing in chat history by adding user bubbles before processing, resolved CORS redirect issue by changing preview.html to direct dashboard redirect with bootstrap data, optimized AI response speed with reduced token limits and simplified prompts
- July 1, 2025: Enhanced UI styling and GBP integration - fixed desktop dashboard .view-live-btn button to use yellow background (#ffc000) with white text, updated homepage hero h1 title from "Your Practice Name" to "Appealing title for you Website", removed Invisalign provider sentence from service page hero section, implemented /api/gbp-details endpoint for Google Business Profile data extraction, added GBP URL detection in chat.js to automatically fetch business details when users paste Google Maps links, integrated GBP photos and contact information into template data flow
- June 30, 2025: Major front-end refactor with React component system - implemented complete modular architecture with HeroSection, ServicesSection, AboutSection, GallerySection, ReviewsSection, ContactSection components in /src/sections/, created SiteDataContext for dynamic data injection from chat wizard state, built HomePageV1 template using modular sections, added bootstrap functionality to chat.js that exposes state as window.bootstrapData and redirects to /preview page, created /api/generate-template endpoint for dynamic template generation, established data flow from chat wizard to React components with proper prop injection and fallback content, all existing CSS classes and functionality preserved
- June 30, 2025: Enhanced images API with API keys and ES module compatibility - fixed node-fetch ES module import error by implementing dynamic imports with ensureFetch() helper function, successfully configured UNSPLASH_KEY and PEXELS_KEY environment secrets, tested API endpoint returning high-quality professional images for different service types (dentist, restaurant), face detection and expression filtering working correctly, Pexels integration providing excellent contextual business photos, system ready for production use with professional image content
- June 30, 2025: Comprehensive legal pages integration and images API implementation - added full header/footer navigation to all legal pages (tos.html, privacy.html, cookies.html) using main site branding, removed legal page links from template footers to keep them clean, updated service/contact template page labels to "YourLogo" with homepage links, implemented complete stock images API with Unsplash/Pexels integration, face detection filtering system, and intelligent query building for different service types, added /api/stock-images endpoint for retrieving contextual professional images based on business type and location
- June 29, 2025: Fixed dropdown menu functionality and completed legal framework - resolved mobile dropdown bullets/alignment issues by adding list-style: none and text-align: left CSS rules, implemented click-to-toggle functionality for mobile Services dropdown using onClick handler with display toggle logic, fixed desktop hover functionality with !important rule for proper dropdown display, created comprehensive tos.html page with GDPR/CCPA compliant terms of service content, updated footer legal links in both main site index.html and dashboard Footer.jsx component to include all three legal pages (Terms of Service, Privacy Policy, Cookie Policy)
- June 29, 2025: Fixed mobile dropdown menu consistency and updated legal pages - corrected Services dropdown CSS in shared Menu component to display: none by default instead of display: block with grey background, ensuring consistent behavior across all templates, created comprehensive GDPR/CCPA compliant privacy.html and cookies.html pages with proper styling and navigation
- June 29, 2025: Unified hamburger menu system and fixed View Live Site button - replaced ContactV1 custom navigation with shared Menu component from homepage for consistent hamburger menu behavior across all templates, removed border from view-live-btn-mobile button in dashboard, now all templates (homepage, service, contact) use identical hamburger menu logic managed in one location
- June 29, 2025: Fixed template navigation and styling issues - removed Chatislav script from dashboard template pages by removing it from dashboard/index.html, fixed hamburger menu defaulting to open by adding useEffect reset in Menu component, changed chat input button background to yellow (#ffc000), added white text color to homepage Schedule button, removed Call button from service template mobile sticky bar keeping only Schedule button
- June 29, 2025: Fixed mobile dashboard layout and styling issues - forced left alignment of mobile header elements with flexbox wrapper, made preview height adaptive using calc(100vh - 350px) with min/max constraints, reduced chat-container min-height to 50px for better space usage, updated button colors (.chat-input button hover and .view-live-btn-mobile to #ffc000 background with white text), verified hamburger menu functionality on service page with proper CSS classes
- June 29, 2025: Updated dashboard preview system and layout - changed desktop grid to 3fr 1fr ratio for better preview visibility, implemented template preview in Live Preview box instead of new tabs for both desktop and mobile, added mobile template preview functionality with same behavior as desktop, reorganized mobile header with logo in left corner and removed View Preview button, unified preview experience across all devices with iframe display in dashboard
- June 29, 2025: Created complete React Contact page template - implemented ContactV1 component with exact HTML/CSS conversion from Contact1.html, added responsive navigation with hamburger menu, contact info grid with Font Awesome icons, working contact form with state management, Google Maps iframe integration, operating hours table, secondary CTA section, and footer with social icons, added contact template routing at /templates/contact/v1/index.jsx with server-side support, integrated contact page into dashboard Pages dropdown navigation for both desktop and mobile interfaces
- June 29, 2025: Implemented scroll-triggered sticky CTA for mobile service page - added JavaScript scroll detection to monitor hero button visibility, implemented smooth pull-up animation with CSS transforms and transitions, sticky bar automatically shows when scrolling past hero section and hides when returning to top, mobile-only behavior with proper responsive design
- June 29, 2025: Implemented all layout and styling improvements from user HTML file - added body display: block, set FAQ section max-width to 720px, set Other Services section max-width to 1100px, fixed mobile before/after images to equal height with CSS grid (2fr 2fr), updated dashboard desktop grid to use grid-template-columns: 2fr 2fr, applied CSS classes and styling from uploaded service1_1751213908454.html file for consistent branding and layout
- June 29, 2025: Created Invisalign service page with shared components - implemented complete ServiceInvisalign React component at /service/invisalign route, created reusable Menu and Footer components with Invisalign dropdown navigation, added comprehensive service page sections (hero, pain points, benefits, before/after, testimonials, FAQ accordion, similar services, map block), integrated CSS-in-JS token system for consistent theming, added server routing for /service/* paths to handle React Router navigation
- June 29, 2025: Added "Schedule now" button to all template navigation bars - implemented consistent CTA button across all three template versions (V1, V2, V3) in both desktop and mobile navigation menus, styled buttons to match each template's design system with appropriate colors and gradients, rebuilt dashboard with updated components
- June 29, 2025: Implemented final destination template URLs - converted template routes from redirects to direct serving, URLs /templates/homepage/v1/index.jsx, /templates/homepage/v2/index.jsx, /templates/homepage/v3/index.jsx now serve as final destinations through dashboard React Router, updated both desktop and mobile dashboard version buttons to open exact template URLs in new tabs, built and configured server to serve dashboard index.html for template routes
- June 28, 2025: Fixed versioned template routing system - implemented exact routes pointing to /templates/homepage/v1/index.jsx, /templates/homepage/v2/index.jsx, /templates/homepage/v3/index.jsx with HTTP 302 redirects to React dashboard template viewer, resolved static file serving conflicts with custom middleware, added server-side route handlers with proper debugging, confirmed routes work correctly with redirect to port 4000 dashboard templates
- June 28, 2025: Removed .version-selector class from templates page - eliminated sidebar version selection interface from template dashboard as requested
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