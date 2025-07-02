// Test script to validate current Kigen Plastika data
const { validateBeforeRender } = require('./dashboard/src/utils/dataValidation.js');

// Current bootstrap data from API response
const currentData = {
  "company_name": "Kigen Plastika",
  "city": ["Osečina"],
  "services": "Septic Tanks",
  "industry": "Landscaping",
  "language": "Serbian",
  "colours": ["#ffc000", "#000000"],
  "images": ["stock_photos_placeholder"],
  "google_profile": "https://maps.google.com/maps?place_id=ChIJvW8VATCFWUcRDDXH5bhDN4k",
  "ai_customization": {
    "hero_title": "Kigen Plastika - Professional Services",
    "hero_subtitle": "Quality services in Osečina",
    "services_title": "Our Services",
    "about_title": "About Kigen Plastika",
    "about_text": "We provide excellent Septic Tanks to our valued clients.",
    "reviewer_label": "Clients",
    "cta_text": "Contact Us",
    "map_query": "Kigen Plastika Osečina"
  },
  "conversation": [
    {"role": "user", "content": "plastic elements producer (septic tanks) from osecina"},
    {"role": "assistant", "content": "What's the name of your business?"},
    {"role": "user", "content": "kigen plastika"},
    {"role": "assistant", "content": "Could you share any business social-media profile links (Facebook, Instagram, TikTok, LinkedIn)? Paste links one below other."},
    {"role": "user", "content": "no"},
    {"role": "assistant", "content": "Do you have a Google Business Profile? (Reply \"yes\" or \"no\")"},
    {"role": "user", "content": "yes"},
    {"role": "assistant", "content": "Can you confirm that this is your business address?\nKIGEN PLASTIKA – Svetog Save bb, Osečina 14253, Serbia\n\nReply \"yes\" to confirm or \"no\" if this isn't your business."},
    {"role": "user", "content": "yes"},
    {"role": "assistant", "content": "Do you offer payment plans or financing options? Please describe them and provide the prices."},
    {"role": "user", "content": "no"},
    {"role": "assistant", "content": "If you have a promo / intro video (YouTube/Vimeo URL), please paste it (or say \"skip\")."},
    {"role": "user", "content": "skip"},
    {"role": "assistant", "content": "Please pick two brand colours."},
    {"role": "assistant", "content": "Please upload images or logo."}
  ]
};

console.log('🔍 RUNNING DATA VALIDATION FOR KIGEN PLASTIKA');
console.log('================================================');

try {
  const validation = validateBeforeRender(currentData);
  console.log('✅ VALIDATION PASSED');
} catch (error) {
  console.log('❌ VALIDATION FAILED:', error.message);
}

console.log('\n📊 DETAILED ANALYSIS:');
console.log('Company Name:', currentData.company_name);
console.log('Industry:', currentData.industry);
console.log('Services:', currentData.services);
console.log('Images:', currentData.images);
console.log('GBP URL:', currentData.google_profile);

// Check specific validation points
console.log('\n🎯 SPECIFIC VALIDATION CHECKS:');

// 1. Industry vs Services alignment
const isLandscaping = currentData.industry.toLowerCase().includes('landscap');
const hasSepticServices = currentData.services.toLowerCase().includes('septic');
const hasGrassServices = currentData.services.toLowerCase().includes('grass') || currentData.services.toLowerCase().includes('sod');

console.log('- Industry is Landscaping:', isLandscaping);
console.log('- Services include septic tanks:', hasSepticServices);
console.log('- Services include grass/sod:', hasGrassServices);
console.log('- Valid non-grass landscaping business:', isLandscaping && hasSepticServices && !hasGrassServices);

// 2. Image data validation
console.log('- Images are placeholder:', currentData.images.includes('stock_photos_placeholder'));
console.log('- GBP is URL string (needs object):', typeof currentData.google_profile === 'string');

// 3. Contact information
console.log('- Missing contact details from GBP');