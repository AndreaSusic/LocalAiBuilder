const { fetchUnsplashImages, fetchPexelsImages, faceAwareFilter } = require('./stock');
const { buildQueries } = require('./llm');

// Main orchestration function
async function getStockImages(serviceType, country, minNeeded = 4, userImages = []) {
  // If user provided enough images, return them
  if (userImages.length >= minNeeded) {
    return userImages.slice(0, minNeeded);
  }

  let results = [];
  const queries = await buildQueries(serviceType, country);
  
  for (const query of queries) {
    // Try Unsplash first
    let imgs = await fetchUnsplashImages(query, 10);
    imgs = await faceAwareFilter(imgs, serviceType);
    
    // If not enough, try Pexels
    if (imgs.length < minNeeded) {
      const pexelsImgs = await fetchPexelsImages(query, 10);
      const filteredPexels = await faceAwareFilter(pexelsImgs, serviceType);
      imgs = [...imgs, ...filteredPexels];
    }
    
    results.push(...imgs);
    
    // Stop if we have enough
    if (results.length >= minNeeded) break;
  }
  
  // Remove duplicates and limit to needed amount
  const uniqueResults = results.filter((img, index, self) => 
    index === self.findIndex(i => i.src === img.src)
  );
  
  // Return only src and alt for UI, keep hiddenCredit internal
  return uniqueResults.slice(0, minNeeded).map(({ src, alt }) => ({ src, alt }));
}

module.exports = {
  getStockImages
};