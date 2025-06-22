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