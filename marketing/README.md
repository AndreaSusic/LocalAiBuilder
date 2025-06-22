# GoAISite Marketing Site

This is a lightweight, standalone marketing site for GoAISite that runs independently from the main application.

## Structure
- `index.html` - Homepage with value proposition and features
- `pricing.html` - Pricing plans (Starter €10/mo, Pro €20/mo, Agency €40/mo)  
- `contact.html` - Contact form and support information
- `terms.html` - Terms of Service
- `privacy.html` - Privacy Policy
- `styles.css` - Shared stylesheet with GoAISite branding

## Design Features
- Brand colors: Primary #ffc000 (yellow), Dark #222, Light #f9fafb
- Cooper Hewitt font family via CDN
- Responsive, mobile-first design with max-width 960px container
- Clean navigation with logo and main links
- Professional styling with hover effects and transitions

## Deployment
This marketing site can be served from any static hosting provider or CDN. All files are self-contained with no build process required.

## Access
To view the marketing site:
1. Navigate to `/marketing/` directory  
2. Open `index.html` in a web browser
3. Or serve via any HTTP server (e.g., `python -m http.server` from the marketing folder)