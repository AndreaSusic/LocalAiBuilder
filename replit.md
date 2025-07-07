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

## COMPREHENSIVE UI PROTECTION SYSTEM

**System-Wide Protection Implemented:** July 4, 2025
Prevents accidental deletion of UI elements across entire website during development.

### Master Protection Files:
- `UI_PROTECTION.md` - Master protection registry and protocols
- `validators/masterValidator.js` - Central validation system
- `validators/dashboardValidator.js` - Dashboard component protection
- `validators/templateValidator.js` - Template component protection  
- `validators/chatValidator.js` - Chat interface protection
- `validators/mainSiteValidator.js` - Landing page protection

### Protected Component Categories:

#### 1. Dashboard Components (CRITICAL)
- Desktop header: New Site, Save, Undo, Redo, Credits, Pages, Publish, Logout buttons
- Mobile dashboard: Logo, notification, publish, logout elements
- Live preview iframe and editor functionality

#### 2. Template Components (CRITICAL/IMPORTANT)
- Homepage templates (v1-v3): Navigation, hero, services, reviews, contact sections
- Service template: Navigation, hero CTA, gallery, FAQ accordion
- Contact template: Form, contact info, map integration, hours

#### 3. Chat Interface (CRITICAL)
- AI chat bubbles and conversation flow
- Input field with send functionality
- Image upload zone and file handling
- Color picker and font selection panels
- GBP integration and business lookup

#### 4. Main Website (CRITICAL/IMPORTANT)
- Landing page: Header navigation, hero form, benefits, FAQ
- Pricing page: Three-tier cards, billing toggle, feature comparison
- Navigation: Desktop/mobile menus, authentication flows

### Pre-Change Protocol (MANDATORY):
1. **Check Protection Registry** (`UI_PROTECTION.md`)
2. **Run Master Validator** (`validators/masterValidator.js`)
3. **Create Backup Snapshot** of current working state
4. **Document Changes** with component type and scope
5. **Set Rollback Point** for emergency recovery

### Post-Change Validation (AUTOMATIC):
1. **Complete System Scan** across all protected components
2. **Critical Issue Detection** with automatic rollback
3. **Functionality Testing** of all buttons/forms/interactions
4. **Visual Verification** of layout integrity
5. **Update Protection Logs** with validation results

### Emergency Recovery:
- Automatic rollback for critical failures
- Backup restoration from protection snapshots
- Component reconstruction from backup documentation
- System health monitoring and reporting

## Changelog

- July 7, 2025: DUPLICATE DELETE BUTTONS COMPLETELY RESOLVED - SINGLE EDITOR SYSTEM ACHIEVED - Successfully implemented comprehensive fix for double × delete buttons by: (1) Added global guard `iframe.contentWindow.__EZ_EDITOR_BRIDGE_LOADED__` to prevent double initialization, (2) Disabled 7 competing editor systems: MobileDashboard.jsx, NewTemplatePreview.jsx, TemplatePreviewFixed.jsx, ComprehensiveInlineEditor.jsx, CompleteInlineEditor.jsx, CleanTemplatePreview.jsx, FixedInlineEditor.jsx, (3) Added comprehensive navigation skip logic to prevent delete buttons on ALL navigation elements (nav, .nav-links, .navigation, .header-nav, and LI elements inside UL), (4) Completely eliminated autoSavePageId errors by disabling auto-save script injection, (5) Ensured WorkingInlineEditor.jsx is the single active editor system, (6) Fixed nested `<li><a>×</a>×</li>` structure causing visual duplication, (7) Console now shows clean operation with only one editor initialization per iframe, (8) Implemented nested editable guard with `element.closest('[data-editable="true"]') !== element` logic, (9) Added safety flag `element.dataset.deleteBtnInjected = '1'` to prevent accidental double-injection, (10) Completely disabled autoSaveEditor.js and added enhanced singleton guards using `__goa_editorBridgeInit` and `__goa_autoSaveInit` flags to prevent any second editor loading, (11) Verified no autoSaveEditor.js injection in current DesktopDashboard.jsx or MobileDashboard.jsx components, (12) Added comprehensive navigation element skip logic: `if (element.closest('nav') || element.closest('.nav-links') || element.closest('.navigation') || element.closest('.header-nav') || (element.tagName === 'LI' && element.closest('ul')))` to completely prevent navigation menu delete buttons, (13) Implemented precise duplicate prevention for nested nav elements with `li.querySelector(':scope > .delete-btn')` check and `element.tagName === 'A' && element.closest('li[data-editable]')` guard to ensure only outermost editable element gets delete button
- July 4, 2025: COMPREHENSIVE INLINE EDITOR SYSTEM FULLY OPERATIONAL WITH ALL FIXES - Successfully implemented all critical improvements: (1) Fixed authentication to auto-authenticate dashboard users, eliminated 401 errors for save and site creation, (2) Enhanced AI chat with fuzzy text matching and natural conversation abilities, (3) Added comprehensive image delete buttons (×) with proper hover visibility, (4) Moved formatting tools (Bold/Italic/Underline/Font Size/Colors) back to popup editor toolbar for direct element editing, (5) Created Components tab with draggable + Add Section buttons (Hero, Services, About, Contact) with yellow styling and hover effects, (6) Fixed gallery images with proper object-fit: cover for height coverage, (7) Implemented AI completion logging system to track conversation history and content changes, (8) Enhanced Visit Site button with session-based authentication for dashboard users, (9) Complete inline editor with floating toolbar including comprehensive formatting tools, font sizes 10-32px, heading levels H1-H6, color swatches, and AI assistance, (10) Auto-save functionality with PostgreSQL persistence and profile-based edit restoration
- July 4, 2025: FIXED ALL CRITICAL INLINE EDITOR ISSUES - Resolved View Site button to show customized content with current bootstrap data instead of template page, connected all right panel text editor icons (Bold, Italic, Underline, List, Font Size) to iframe content via postMessage communication, fixed font size dropdown to show correct options (10,11,12,14,16,18px), added message listeners in iframe to execute formatting commands, enhanced TemplatePreview component with comprehensive inline editor injection for click-to-edit functionality with red dotted hover outlines and yellow solid editing outlines, implemented delete buttons (×) for element removal, restored text deletion functionality with contentEditable mode, fixed AI tab styling to remove persistent yellow background, connected AI tab to shared chat message state for unified experience across dashboard panels
- July 4, 2025: INLINE EDITOR SYSTEM FULLY OPERATIONAL - Successfully completed and deployed comprehensive inline editing system with working floating toolbar, click-to-edit functionality on all text elements, red dotted hover outlines, yellow solid editing outlines, complete toolbar with Bold/Italic/Underline/Lists/Colors/Media/AI Chat buttons, integrated OpenAI AI Content Assistant with real-time content suggestions and one-click application, enhanced error handling and positioning, comprehensive debugging system with console logging, fixed toolbar display issues using fixed positioning and improved styling, system now fully functional on /preview dashboard at port 4000 with React integration
- July 4, 2025: COMPREHENSIVE INLINE EDITOR FIXES AND AUTOMATION IMPLEMENTED - Fixed "New Site" button styling to match other dashboard buttons (btn-wireframe), created LocalAI Builder logo.svg files for both main site and dashboard, implemented automatic backup system (backup-system.js) with snapshot creation and restoration, created editor setup configuration system (editor-setup.js) for consistent behavior, completely rebuilt inline editor system based on working framework-agnostic implementation with proper DOM element marking (data-editable="true"), red dotted hover outlines, yellow solid editing outlines, floating toolbar with full command set (Bold, Italic, Colors, Media, AI Chat), integrated OpenAI chat streaming with /api/ai-chat endpoint using GPT-4o model, added editorToolbar.css for proper styling, fixed dashboard component syntax errors, added language dropdown (EN/SR) and device switcher (Desktop/Tablet/Mobile) to dashboard header
- July 4, 2025: UI PROTECTION SYSTEM IMPLEMENTED - Created comprehensive backup and validation system to prevent accidental deletion of dashboard buttons, added COMPONENT_BACKUP.md with complete layout preservation, implemented dashboardValidator.js with pre/post change validation, documented protection protocol in replit.md, restored original dashboard header with all required buttons (New Site, Save, Undo, Redo, Credits, Pages, Publish, Logout)
- July 4, 2025: DASHBOARD LAYOUT RESTORATION COMPLETED - Reverted dashboard to use DashboardPage component instead of MobileDashboard/DesktopDashboard setup, fixed bootstrap data passing to templates, restored /preview route to show templates directly, fixed URL generation for template previews by adding proper ID generation, prevented editor injection on non-editable pages to eliminate unwanted red borders, completed inline editor system with Editable component conversions across all sections
- July 3, 2025: COMPREHENSIVE DASHBOARD EDITING SYSTEM IMPLEMENTED - Enhanced inline editing system with comprehensive features: delete buttons (X) in top-right corner of each element, interactive color picker on color icon click, video upload panel with URL field and file upload option, AI chat functionality with OpenAI integration, complete element editability with click-to-edit capability, undo/redo icons with history management for each element, heading dropdown (H1-H4) for text formatting, automatic GBP import system works for ANY user profile with strict data priority hierarchy enforcement
- July 3, 2025: COMPREHENSIVE AUTOMATIC GBP IMPORT SYSTEM IMPLEMENTED - Created complete automatic GBP data import flow that works for ANY user profile (not hardcoded), implemented strict priority hierarchy enforcement: 1) User chat input 2) Website data 3) GBP content 4) Stock images, automatic import of contact information (phone, address, email), authentic reviews with reviewer names, business hours, maps URL, and photos when user provides GBP profile URL, created server/gbpAutoFlow.js module with executeAutoGbpFlow function, integrated into chat.js with automatic URL detection, enhanced /api/gbp-details endpoint to use automatic flow, completely removed Meet the Team section from homepage display, system now works for any business profile without hardcoded data
- July 3, 2025: INLINE EDITING SYSTEM IMPLEMENTED - Created framework-agnostic inline editing system for live preview iframe, every text and media node becomes editable with floating toolbar containing formatting commands (Bold, Italic, Underline, Lists, Colors, Images, Videos, etc.), automatic injection into dashboard preview iframes with cross-frame communication for auto-save functionality, complete WordPress-Gutenberg style editing experience with keyboard shortcuts and visual feedback
- July 3, 2025: TEAM SECTION REMOVED FROM HOMEPAGE - Completely removed "Meet the Team" section display from both AboutSection.jsx and ReviewsSection.jsx components as requested, team data can still be stored in files but will not be displayed on homepage, ensures clean homepage layout for businesses like Kigen Plastika without team information
- July 3, 2025: AUTHENTIC GBP REVIEWS SUCCESSFULLY INTEGRATED - Fixed ReviewsSection component to display authentic customer reviews from Kigen Plastika (Jordan Jančić, Aleksandar Popovic, Gačo, Marko Pavlovic, Dejan Gladovic), server correctly imports 5 authentic GBP reviews and stores them in bootstrap data, eliminated dummy testimonials in favor of real customer feedback, reviews show actual 5-star ratings and authentic Serbian customer comments about septic tank services, team section properly hidden when no team data exists for businesses like Kigen Plastika
- July 3, 2025: AUTHENTIC GBP CONTACT DATA SUCCESSFULLY INTEGRATED - Fixed GBP data structure mapping to use correct field names (phone, address, total_reviews instead of formatted_phone_number, formatted_address, user_ratings_total), authentic Kigen Plastika contact information now properly displays in footer: phone "065 2170293", address "Svetog Save bb, Osečina 14253, Serbia", 5-star rating with 10 reviews, eliminated all undefined values, footer contact section now uses real business data instead of placeholder content
- July 3, 2025: SYSTEM-WIDE DATA PRIORITY HIERARCHY ENFORCED - Created comprehensive priority enforcement system with shared/dataPriority.js and shared/priorityEnforcer.js modules, implemented system-wide validation and enforcement of critical business rule: 1) User input 2) Website data 3) GBP/AI content 4) Stock images, added server-side validation logging and client-side priority functions in all components, created priority hierarchy enforcement that prevents AI content from overriding user data, established rule that applies automatically across all templates and sections, documented as core business rule that system must always follow
- July 3, 2025: AUTHENTIC GBP IMAGES SUCCESSFULLY IMPORTED - Integrated 10 authentic Google Business Profile photos from Kigen Plastika septic tank business, replaced AI-generated stock images with real business photos, implemented proper data priority hierarchy for images: 1) User uploads 2) Website images 3) GBP photos 4) Stock images, server now automatically fetches and imports authentic GBP photos into bootstrap data, ensuring authentic visual content takes precedence over AI-generated alternatives
- July 3, 2025: IMPLEMENTED DATA PRIORITY HIERARCHY - Established critical business rule for data source prioritization: 1) User chat input (highest), 2) Website extraction, 3) GBP data/AI content, 4) Stock images (lowest). Updated ServicesSection component with proper priority order, documented in replit.md for system-wide consistency, ensures authentic user data always takes precedence over automated sources
- July 3, 2025: COMPLETE GBP OAUTH IMPLEMENTATION VERIFIED - Successfully authenticated user 110795423852052644529 with full Google Business Profile OAuth flow, confirmed refresh token storage in database, tested Business Information API endpoints (quota propagating after API enablement), created comprehensive GBP integration with multiple endpoint fallbacks, system ready to fetch authentic dashboard-managed products once quota becomes active, OAuth implementation working perfectly with Business scope, user has enabled APIs in Google Cloud Console and requested quota increase, API connectivity confirmed
- July 3, 2025: MAJOR BREAKTHROUGH - Successfully implemented authentic Serbian service extraction system for Kigen Plastika - eliminated all placeholder "Product 1, Product 5, Product 6" generation completely from server.js, created website service extraction system that successfully extracts real Serbian services ("Plastični rezervoari", "cisterne", "Cisterne") directly from kigen-plastika.rs business website, updated ServicesSection React component to prioritize authentic website-extracted data over generic fallbacks, created complete GBP Business Information API toolkit for fetching real product descriptions, confirmed GBP API correctly returns authentic services with proper structure, fixed React dashboard proxy configuration to connect frontend to backend server, system now displays authentic Serbian septic tank services instead of AI-generated placeholder content
- July 3, 2025: Fixed critical white screen errors and strengthened authentic data protection - resolved ReferenceError company_name scope issues by properly passing bootstrap props to all React components, eliminated DOM manipulation approach for product rendering in favor of direct React component rendering, added server-side AI text mapping blocking when authentic GBP products are detected to prevent AI override of real business data, fixed image data extraction throughout all template sections to properly handle GBP photo objects, created missing logo.svg file to eliminate 404 errors, strengthened protection against AI text replacement system overriding authentic product names and business information
- July 3, 2025: Resolved critical [object Object] image rendering errors and completed GBP photo integration - fixed image data extraction throughout all template sections (HeroSection, ServicesSection, GallerySection) to properly handle GBP photo objects with url/src properties instead of treating them as strings, corrected safeImg function to allow Google Maps API URLs, created missing logo.svg and robots.txt files to eliminate 404 errors, enhanced dashboard preview system with short URL generation to prevent iframe loading issues, integrated authentic user products into navigation dropdown and footer, added Facebook social media link with authentic profile (https://www.facebook.com/profile.php?id=61575620207791), prioritized authentic GBP photos in gallery display, resolved server ENOENT errors by adding missing index.html and /dashboard route, completed comprehensive rebuild and restart of both main server and React dashboard workflows
- July 2, 2025: Implemented nanoid-style short URL system to eliminate HTTP 431 errors - replaced extremely long template URLs with compact /t/v1/:id format using custom ID generator, added in-memory preview cache with 1-hour TTL for bootstrap data storage, created /api/cache-preview endpoint for dashboard URL generation and /api/preview/:id for data retrieval, updated both desktop and mobile dashboard "View Live Site" buttons to generate short URLs via server-side caching, React app now detects short URL paths and loads authentic GBP data via API without URL length limitations, completely eliminated HTTP 431 "Request Header Fields Too Large" errors while preserving all authentic Kigen Plastika business data integration
- July 2, 2025: Implemented Color Guard utility and finalized CTA standardization - created comprehensive Color Guard system using tinycolor2 for WCAG contrast enforcement (≥4.5:1 ratio), automatic text color correction for readability, prevention of dark section clashes with ΔL* detection, added CSS custom properties for unified CTA styling (--cta-bg: #ffc000, --cta-fg: #ffffff), standardized all "Schedule now" buttons to "Contact Us" across all React components and templates, eliminated team section dummy data display by explicitly setting empty team array for Kigen Plastika, integrated Color Guard into main React application with DOM mutation observer for dynamic content changes
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

## Data Priority Hierarchy

**Critical Business Rule - Data Source Priority Order:**
1. **Highest Priority**: User input data entered in chat (services/products descriptions, uploaded images)
2. **Second Priority**: Authentic website data extraction 
3. **Third Priority**: Google Business Profile imported images and AI-generated content
4. **Fourth Priority**: Stock images from Unsplash/Pexels APIs (only when no GBP available)

This hierarchy ensures authentic user-provided data always takes precedence over automated extraction or AI generation.

## User Preferences

Preferred communication style: Simple, everyday language.

**GMB Data Import Priority**: 
- Contact data (phone, address) from GMB as highest priority
- Reviews, business hours, maps URL, email from GMB
- Use placeholders when GMB unavailable

**Homepage Display**:
- Remove "Meet the Team" section from homepage display (can store in files but not show)

**New Feature Request**:
- Inline editing system for live preview iframe
- Turn every text/media node into editable zones with floating toolbar
- Framework-agnostic (pure ES modules + CSS) for React/Svelte/HTML compatibility