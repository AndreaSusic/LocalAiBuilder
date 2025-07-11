/**
 * IMAGE RECOGNITION SYSTEM FOR SERVICE MATCHING
 * Uses OpenAI Vision API to analyze GBP photos and match them to appropriate services
 */

let fetch;
async function ensureFetch() {
  if (!fetch) {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
  }
  return fetch;
}

/**
 * Analyze photos using OpenAI Vision API to match services
 * @param {Array} photos - Array of photo URLs from GBP
 * @param {Array} services - Array of service names to match
 * @returns {Object} - Mapping of services to best matching photo URLs
 */
async function analyzePhotosForServices(photos, services) {
  console.log('🔍 ANALYZING PHOTOS FOR SERVICE MATCHING');
  console.log('📸 Photos to analyze:', photos.length);
  console.log('🏷️ Services to match:', services);
  
  if (!photos || photos.length === 0) {
    console.log('⚠️ No photos provided for analysis');
    return {};
  }

  if (!services || services.length === 0) {
    console.log('⚠️ No services provided for matching');
    return {};
  }

  try {
    await ensureFetch();
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const serviceMatches = {};
    
    // Analyze each photo to determine what it shows
    const photoAnalyses = await Promise.all(
      photos.map(async (photoUrl, index) => {
        try {
          console.log(`🔍 Analyzing photo ${index + 1}/${photos.length}`);
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
              messages: [
                {
                  role: 'system',
                  content: `You are an expert in analyzing construction and industrial photos. 
                  
                  Analyze the image and determine what it shows from these specific services:
                  - Plastični rezervoari (Plastic tanks/containers)
                  - Cisterne (Cisterns/large tanks)  
                  - Septičke jame (Septic tanks/septic systems)
                  
                  Respond with ONLY the matching service name exactly as listed above, or "none" if it doesn't clearly match any service.`
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'What service does this image best represent?'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: photoUrl
                      }
                    }
                  ]
                }
              ],
              max_tokens: 50
            })
          });

          if (!response.ok) {
            console.log(`⚠️ API error for photo ${index + 1}: ${response.status}`);
            return { photoUrl, index, service: 'none' };
          }

          const data = await response.json();
          const detectedService = data.choices[0].message.content.trim();
          
          console.log(`📸 Photo ${index + 1} analysis: ${detectedService}`);
          
          return {
            photoUrl,
            index,
            service: detectedService
          };
          
        } catch (error) {
          console.log(`❌ Error analyzing photo ${index + 1}:`, error.message);
          return { photoUrl, index, service: 'none' };
        }
      })
    );

    // Match services to their best photos
    for (const service of services) {
      const matchingPhotos = photoAnalyses.filter(analysis => 
        analysis.service === service
      );
      
      if (matchingPhotos.length > 0) {
        // Use the first matching photo
        serviceMatches[service] = matchingPhotos[0].photoUrl;
        console.log(`✅ Matched "${service}" to photo ${matchingPhotos[0].index + 1}`);
      } else {
        // Find best fallback based on keywords
        let fallbackPhoto = null;
        
        if (service.toLowerCase().includes('rezervoar')) {
          fallbackPhoto = photoAnalyses.find(p => 
            p.service.toLowerCase().includes('rezervoar') || 
            p.service.toLowerCase().includes('tank')
          );
        } else if (service.toLowerCase().includes('cistern')) {
          fallbackPhoto = photoAnalyses.find(p => 
            p.service.toLowerCase().includes('cistern') || 
            p.service.toLowerCase().includes('tank')
          );
        } else if (service.toLowerCase().includes('septič')) {
          fallbackPhoto = photoAnalyses.find(p => 
            p.service.toLowerCase().includes('septič') || 
            p.service.toLowerCase().includes('septic')
          );
        }
        
        if (fallbackPhoto) {
          serviceMatches[service] = fallbackPhoto.photoUrl;
          console.log(`🔄 Fallback match for "${service}" to photo ${fallbackPhoto.index + 1}`);
        } else {
          // Use first available photo as last resort
          serviceMatches[service] = photos[0];
          console.log(`⚠️ No specific match for "${service}", using first photo`);
        }
      }
    }

    console.log('✅ PHOTO ANALYSIS COMPLETE');
    console.log('🎯 Service matches:', Object.keys(serviceMatches).length);
    
    return serviceMatches;
    
  } catch (error) {
    console.error('❌ PHOTO ANALYSIS ERROR:', error.message);
    
    // Return fallback mapping
    const fallbackMatches = {};
    services.forEach((service, index) => {
      fallbackMatches[service] = photos[index % photos.length];
    });
    
    return fallbackMatches;
  }
}

module.exports = {
  analyzePhotosForServices
};