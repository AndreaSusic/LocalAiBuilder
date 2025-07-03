const puppeteer = require('puppeteer-core');

// Simple cache for website extraction
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function extractServicesFromWebsite(websiteUrl) {
  console.log('🌐 Extracting services from website:', websiteUrl);
  
  // Check cache first
  const cached = cache.get(websiteUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🔄 Returning cached website services');
    return cached.data;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.goto(websiteUrl, { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Extract services/products from website content
    const services = await page.evaluate(() => {
      const textContent = document.body.textContent || '';
      const results = [];
      
      // Look for Serbian service terms (Kigen Plastika is Serbian company)
      const servicePatterns = [
        /septičk[ae] tank[eo]v?i?/gi,
        /plastični[e]? rezervoar[ie]?/gi,
        /septik[- ]tank[eo]v?i?/gi,
        /plastični[e]? kanalizacija/gi,
        /fekalni[e]? rezervoar[ie]?/gi,
        /cisterni?[e]?/gi,
        /rezervoar[ie]? za vodu/gi,
        /plastični[e]? posud[eio]/gi
      ];
      
      // Also look for English terms
      const englishPatterns = [
        /septic tank[s]?/gi,
        /plastic tank[s]?/gi,
        /water tank[s]?/gi,
        /storage tank[s]?/gi,
        /plastic container[s]?/gi,
        /waste water/gi,
        /sewage tank[s]?/gi
      ];
      
      const allPatterns = [...servicePatterns, ...englishPatterns];
      const foundServices = new Set();
      
      allPatterns.forEach(pattern => {
        const matches = textContent.match(pattern);
        if (matches) {
          matches.forEach(match => {
            foundServices.add(match.trim());
          });
        }
      });
      
      // Convert to structured format
      Array.from(foundServices).forEach((service, index) => {
        if (service.length > 3) { // Filter out very short matches
          results.push({
            id: `website_service_${index + 1}`,
            name: service,
            source: 'website'
          });
        }
      });
      
      return results.slice(0, 6); // Limit to 6 services
    });

    console.log(`📦 Found ${services.length} services from website:`, services);
    
    // Cache the results
    cache.set(websiteUrl, { data: services, timestamp: Date.now() });
    
    return services;

  } catch (error) {
    console.error('❌ Error extracting from website:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  extractServicesFromWebsite
};