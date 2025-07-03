// Test the preview system with Kigen Plastika data
const kiigenData = {
  company_name: "Kigen Plastika",
  city: ["Osećina"],
  industry: "landscaping", 
  gbp_url: "https://maps.google.com/maps?place_id=ChIJvW8VATCFWUcRDDXH5bhDN4k",
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
    },
    {
      id: "website_service_3",
      name: "Cisterne", 
      description: "Authentic Cisterne services from Kigen Plastika",
      category: "authentic_service",
      source: "website"
    }
  ]
};

async function testPreview() {
  console.log('🧪 Testing preview generation...');
  
  try {
    const previewId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const response = await fetch('http://localhost:5000/api/cache-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        id: previewId,
        data: kiigenData 
      })
    });
    
    const result = await response.json();
    console.log('✅ Preview result:', result);
    
    // Also test the data content
    console.log('📦 Preview data content:');
    console.log('  Company:', kiigenData.company_name);
    console.log('  Products:', kiigenData.products?.length || 0);
    kiigenData.products?.forEach((p, i) => console.log(`    ${i + 1}. ${p.name} (${p.source})`));
    
    if (result.shortUrl) {
      console.log('🔗 Access template at:', result.shortUrl);
      
      // Test if we can retrieve the data
      const testResponse = await fetch(result.shortUrl.replace('/t/v1/', '/api/preview/'));
      const testData = await testResponse.json();
      console.log('📦 Retrieved data:', testData.company_name);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPreview();