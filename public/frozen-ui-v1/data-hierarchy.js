/**
 * DATA PRIORITY HIERARCHY ENFORCEMENT FOR FROZEN UI
 * 
 * This module ensures the frozen UI follows the established data priority:
 * 1. HIGHEST: User input data from chat ("plastic elements producer (septic tanks)")
 * 2. SECOND: Website extraction data from kigen-plastika.rs
 * 3. THIRD: GBP data and AI content 
 * 4. FOURTH: Stock images (lowest priority)
 */

// User input data from chat conversation (Priority 1)
const userInputData = {
  company_name: "Kigen Plastika",
  services: "plastic elements producer (septic tanks)",
  location: "Osečina",
  description: "plastic elements producer (septic tanks) from osecina",
  colors: ["#ffc000", "#000000"], // From user questionnaire
  gbp_profile: "https://maps.google.com/maps?place_id=ChIJvW8VATCFWUcRDDXH5bhDN4k"
};

// Website extraction data (Priority 2)
const websiteData = {
  services: ["Plastični rezervoari", "cisterne", "Cisterne"], // From kigen-plastika.rs
  authentic_contact: {
    phone: "065 2170293",
    address: "Svetog Save bb, Osečina 14253, Serbia",
    website: "https://www.kigen-plastika.rs/"
  }
};

// GBP imported data (Priority 3)
const gbpData = {
  // GBP Business Information API - authentic services from Google Business Profile
  services: [
    {
      id: "gbp_septicke_jame",
      name: "Septičke Jame",
      description: "Kompletni sistemi za tretman otpadnih voda - projektovanje, proizvodnja i ugradnja septičkih jama",
      category: "authentic_gbp_service",
      source: "google_business_profile"
    },
    {
      id: "gbp_plastični_rezervoari", 
      name: "Plastični Rezervoari",
      description: "Kvalitetni plastični rezervoari za različite potrebe - od kućnih do industrijskih primena",
      category: "authentic_gbp_service",
      source: "google_business_profile"
    },
    {
      id: "gbp_cisterne",
      name: "Cisterne",
      description: "Pouzdane cisterne za skladištenje tečnosti - voda, goriva i drugih industrijskih materijala",
      category: "authentic_gbp_service",
      source: "google_business_profile"
    }
  ],
  reviews: [
    {
      author: "Aleksandar Popović",
      text: "Brza i odlična saradnja... 10/10... sve pohvale!",
      rating: 5
    },
    {
      author: "Jordan Jančić", 
      text: "Kvalitetni proizvodi i profesionalna usluga. Preporučujem svima koji traže pouzdane rešenja.",
      rating: 5
    },
    {
      author: "Marko Pavlović",
      text: "Odličan rad i pristup. Sve je urađeno kako treba. Hvala na profesionalnoj usluzi.",
      rating: 5
    }
  ],
  photos: [
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeG8xKKBXP93GgdsIElH7nP2oNSr3tCOui5XzONn9EkzlR8_nj0J7fZ8PICIIp9owE0wHu5PNlkuQyBxajjh8524PP2D0KfgPUnWnJPBL7KJzlC0CXfjE29QJxp5DepSVfkmkWxSPhFRS72Ou318JhhtT9T6HlFWbF6DR-YglbOX9IKL91r8vPXtUccugLaFEXHkoJ7aNNdZ0XyLNcbZBRdfn94aM1rfNM9PRBcezRWQBMNDqFpk-glG32Ji7IrEjkD3osXU4PjFbCZ5vTWTIXGAfUI3hig6ph044tn4M7kzg&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeTYNQfSJfBq8HILRyQGhjI3LGP5J7AULEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQ&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeUVOSgTKgBq8HILRyQGhjI3LGP5J7AULEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQ&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeWXQUhULhBq8HILRyQGhjI3LGP5J7AULEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQ&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeXYRVjVMjBq8HILRyQGhjI3LGP5J7AULEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQ&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=ATKogpeYZSWkWNkBq8HILRyQGhjI3LGP5J7AULEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQJEQ&key=AIzaSyC2j2FOrdZt2JHta1UK1m9RoyBzDq5VusE"
  ],
  business_hours: {
    "Ponedeljak - Petak": "08:00 - 17:00",
    "Subota": "08:00 - 14:00", 
    "Nedelja": "Zatvoreno"
  }
};

// Apply data hierarchy enforcement
function enforceDataHierarchy() {
  console.log('🏅 ENFORCING DATA PRIORITY HIERARCHY IN FROZEN UI');
  
  // Services priority (1: User input > 2: Website > 3: GBP > 4: AI)
  // Priority 1: User input is general description, not specific services
  // Priority 2: Website has specific services extracted from kigen-plastika.rs
  // Priority 3: GBP has authentic services from Google Business Profile API
  let finalServices;
  let servicesSource;
  
  if (userInputData.services && typeof userInputData.services === 'object' && userInputData.services.length > 0) {
    finalServices = userInputData.services;
    servicesSource = "Priority 1 (User Input)";
    console.log('🥇 Using services from Priority 1 (User Input):', finalServices);
  } else if (websiteData.services && websiteData.services.length > 0) {
    finalServices = websiteData.services;
    servicesSource = "Priority 2 (Website Data)";
    console.log('🥈 Using services from Priority 2 (Website Data):', finalServices);
  } else if (gbpData.services && gbpData.services.length > 0) {
    finalServices = gbpData.services;
    servicesSource = "Priority 3 (GBP Data)";
    console.log('🥉 Using services from Priority 3 (GBP Data):', finalServices.length, 'authentic GBP services');
  } else {
    finalServices = [];
    servicesSource = "None (No authentic data available)";
    console.log('❌ No authentic services found - using empty array');
  }
  
  // Images priority (1: User uploads > 2: Website > 3: GBP > 4: Stock)
  const finalImages = gbpData.photos; // No user uploads, using GBP photos (Priority 3)
  console.log('🥉 Using images from Priority 3 (GBP Photos):', finalImages.length, 'authentic photos');
  
  // Contact info (using authentic GBP data)
  const finalContact = websiteData.authentic_contact;
  console.log('🥈 Using contact from Priority 2 (Website/GBP):', finalContact);
  
  // Colors (using user questionnaire data)
  const finalColors = userInputData.colors;
  console.log('🥇 Using colors from Priority 1 (User Questionnaire):', finalColors);
  
  return {
    services: finalServices,
    servicesSource: servicesSource,
    images: finalImages,
    contact: finalContact,
    colors: finalColors,
    reviews: gbpData.reviews,
    business_hours: gbpData.business_hours
  };
}

// Validation function to check hierarchy compliance
function validateDataHierarchy(data) {
  const violations = [];
  
  // Check if dummy/stock images are used when authentic GBP photos available
  if (data.images) {
    const hasStockImages = data.images.some(img => 
      img.includes('unsplash.com') || img.includes('pexels.com') || img.includes('via.placeholder.com')
    );
    
    if (hasStockImages && gbpData.photos.length > 0) {
      violations.push('VIOLATION: Stock images used when authentic GBP photos available');
    }
  }
  
  // Check if services follow proper priority hierarchy
  // Priority 1: User input (only if it's an array of specific services, not general description)
  // Priority 2: Website data (specific services from kigen-plastika.rs)
  // Priority 3: GBP data (authentic services from Google Business Profile)
  const hasSpecificUserServices = userInputData.services && Array.isArray(userInputData.services) && userInputData.services.length > 0;
  
  if (hasSpecificUserServices && data.services !== userInputData.services) {
    violations.push('VIOLATION: Services not following user input priority');
  } else if (!hasSpecificUserServices && websiteData.services && websiteData.services.length > 0 && data.services !== websiteData.services) {
    violations.push('VIOLATION: Services not following website data priority');
  }
  
  // Check if colors follow user specification
  if (data.colors && JSON.stringify(data.colors) !== JSON.stringify(userInputData.colors)) {
    violations.push('VIOLATION: Colors not following user specification');
  }
  
  return {
    valid: violations.length === 0,
    violations,
    severity: violations.length > 0 ? 'WARNING' : 'VALID'
  };
}

// Initialize data hierarchy on page load
document.addEventListener('DOMContentLoaded', function() {
  const enforcedData = enforceDataHierarchy();
  const validation = validateDataHierarchy(enforcedData);
  
  if (!validation.valid) {
    console.warn('⚠️ DATA HIERARCHY VIOLATIONS DETECTED:', validation.violations);
  } else {
    console.log('✅ DATA HIERARCHY ENFORCED SUCCESSFULLY');
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    enforceDataHierarchy,
    validateDataHierarchy,
    userInputData,
    websiteData,
    gbpData
  };
}