const express = require('express');
const router = express.Router();

// Import the TypeScript module (will be compiled to JS)
let fetchGbpProducts;

// Dynamic import to handle potential TypeScript compilation issues
async function initFetchProducts() {
  try {
    const module = await import('../../src/gbp/fetchProducts.js');
    fetchGbpProducts = module.fetchGbpProducts;
  } catch (error) {
    console.error('Failed to import fetchGbpProducts:', error);
    // Fallback function that returns empty array
    fetchGbpProducts = async () => [];
  }
}

// Initialize the import
initFetchProducts();

router.get('/api/gbp-products', async (req, res) => {
  const { cid } = req.query;
  
  if (!cid) {
    return res.status(400).json({ error: 'cid required' });
  }

  try {
    console.log('🔍 GBP Products API called with CID:', cid);
    
    if (!fetchGbpProducts) {
      await initFetchProducts();
    }
    
    const data = await fetchGbpProducts(cid);
    console.log(`📦 Returning ${data.length} products for CID:`, cid);
    
    res.json(data);
  } catch (error) {
    console.error('❌ GBP Products API error:', error);
    res.status(500).json({ 
      error: 'scrape-failed', 
      detail: error.message 
    });
  }
});

module.exports = router;