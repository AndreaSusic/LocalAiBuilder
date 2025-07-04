const { fetchGbpProducts } = require('./src/gbp/fetchProducts.js');

async function main() {
  const cid = process.argv[2];
  
  if (!cid) {
    console.log('Usage: node demoScrape.js <CID>');
    console.log('Example: node demoScrape.js 9887445968323294476');
    process.exit(1);
  }

  console.log(`🔍 Fetching products for CID: ${cid}`);
  
  try {
    const products = await fetchGbpProducts(cid);
    
    if (products.length === 0) {
      console.log('⚠️ No products found for this business');
    } else {
      console.log(`📦 Found ${products.length} products:`);
      
      // Show first 3 products as requested
      const displayProducts = products.slice(0, 3);
      
      displayProducts.forEach((product, index) => {
        console.log(`\n--- Product ${index + 1} ---`);
        console.log(JSON.stringify(product, null, 2));
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();