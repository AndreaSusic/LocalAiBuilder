// CLI demo for stock images API
const { getStockImages } = require('./imageSelector');

async function testStockImages() {
  console.log('Testing stock images API...');
  
  try {
    const images = await getStockImages('dentist', 'Germany', 4);
    console.log('\nResults:');
    console.log(JSON.stringify(images, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nNote: To use this API, you need to set environment variables:');
    console.log('- UNSPLASH_KEY=your_unsplash_access_key');
    console.log('- PEXELS_KEY=your_pexels_api_key');
  }
}

// Run demo if called directly
if (require.main === module) {
  testStockImages();
}

module.exports = { testStockImages };