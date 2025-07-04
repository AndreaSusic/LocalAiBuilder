/**************************************************************************
 * QUICK GBP PRODUCT INSPECTOR
 * Run this after you have `gbpData` loaded to inspect the product structure
 **************************************************************************/

function inspectGbpProducts(gbpData = {}) {
  console.log('🔍 GBP PRODUCT INSPECTOR STARTING...');
  console.log('📦 Full GBP data structure:');
  console.dir(gbpData, { depth: 2, colors: true });
  
  const { products } = gbpData;

  if (!Array.isArray(products) || !products.length) {
    console.log('🔍  No "products" array found – either the field is missing or empty.');
    console.log(
      '⚠️  If you expected products, check:\n' +
      '   • Are you calling the Business Information API (not Places)?\n' +
      '   • Does your OAuth token include `https://www.googleapis.com/auth/business.manage`?\n' +
      '   • Does the listing actually have products in the GBP dashboard?'
    );
    return;
  }

  // Pretty-print the first product so you can see its real structure
  console.log(`✅  Found ${products.length} product(s). Sample (index 0):\n`);
  console.dir(products[0], { depth: 5, colors: true });

  // Optional: If you want to list just the key names for all products
  const keys = new Set();
  products.forEach(p => Object.keys(p || {}).forEach(k => keys.add(k)));
  console.log('\n🗝️  Keys present across all products:', [...keys]);
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { inspectGbpProducts };
}

// Test with mock data if run directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🧪 Testing GBP inspector with mock data...');
  
  // Test with Kigen Plastika website-extracted data
  const mockGbpData = {
    name: "KIGEN PLASTIKA",
    products: [
      {
        id: "website_service_1",
        name: "Plastični rezervoari",
        description: "Authentic plastični rezervoari services from Kigen Plastika",
        category: "authentic_service",
        source: "website"
      },
      {
        id: "website_service_2", 
        name: "cisterne",
        description: "Authentic cisterne services from Kigen Plastika",
        category: "authentic_service",
        source: "website"
      }
    ]
  };
  
  inspectGbpProducts(mockGbpData);
}