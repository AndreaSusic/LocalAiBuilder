const puppeteer = require('puppeteer-core');
// Simple in-memory cache for 6 hours
const cache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
function cleanUrl(dataHref) {
    let url = dataHref;
    if (!url.startsWith('http')) {
        url = 'https://www.google.com' + url;
    }
    return url.replace(/amp;/g, '');
}
function extractImageUrl(backgroundImage) {
    if (!backgroundImage)
        return '';
    // Remove url() wrapper and quotes
    return backgroundImage
        .replace(/^url\(['"]?/, '')
        .replace(/['"]?\)$/, '');
}
async function fetchProductDescription(page, productUrl) {
    try {
        await page.goto(productUrl, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.waitForSelector('.Y89TQc', { timeout: 5000 });
        const description = await page.evaluate(() => {
            const element = document.querySelector('.Y89TQc');
            return element ? element.textContent?.trim() || null : null;
        });
        return description;
    }
    catch (error) {
        console.warn('Failed to fetch product description:', error);
        return null;
    }
}
async function fetchGbpProducts(cid) {
    // Check cache first
    const cached = cache.get(cid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('🔄 Returning cached GBP products for CID:', cid);
        return cached.data;
    }
    let browser;
    try {
        console.log('🔍 Fetching GBP products for CID:', cid);
        browser = await puppeteer.launch({
            headless: true,
            executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--lang=en'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
        const productsUrl = `https://www.google.com/local/place/products/product?ludocid=${cid}&hl=en`;
        console.log('📋 Opening products page:', productsUrl);
        await page.goto(productsUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        // Wait for product elements to load
        try {
            await page.waitForSelector('.J8zyUd', { timeout: 10000 });
        }
        catch (error) {
            console.log('⚠️ No products found for CID:', cid);
            cache.set(cid, { data: [], timestamp: Date.now() });
            return [];
        }
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.J8zyUd');
            const results = [];
            productElements.forEach((el) => {
                const id = el.dataset.id;
                const nameElement = el.querySelector('.t3RpAe');
                const linkElement = el.querySelector('a[data-href]');
                const imageElement = el.querySelector('.LFhsDb');
                if (id && nameElement && linkElement) {
                    const name = nameElement.textContent?.trim() || '';
                    const dataHref = linkElement.dataset.href || '';
                    const backgroundImage = imageElement ?
                        window.getComputedStyle(imageElement).backgroundImage : '';
                    results.push({
                        id,
                        name,
                        dataHref,
                        backgroundImage
                    });
                }
            });
            return results;
        });
        console.log(`📦 Found ${products.length} products`);
        const finalProducts = [];
        for (const product of products) {
            const cleanedUrl = cleanUrl(product.dataHref);
            const imageUrl = extractImageUrl(product.backgroundImage);
            // Fetch description from individual product page
            const description = await fetchProductDescription(page, cleanedUrl);
            finalProducts.push({
                id: product.id,
                name: product.name,
                description,
                image: imageUrl,
                url: cleanedUrl
            });
        }
        // Cache the results
        cache.set(cid, { data: finalProducts, timestamp: Date.now() });
        console.log('✅ GBP products fetched and cached');
        return finalProducts;
    }
    catch (error) {
        console.error('❌ Error fetching GBP products:', error);
        return [];
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
}
module.exports = { fetchGbpProducts };
