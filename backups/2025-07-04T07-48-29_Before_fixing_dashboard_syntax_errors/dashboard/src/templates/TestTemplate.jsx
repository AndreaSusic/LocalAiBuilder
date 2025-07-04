import React from 'react';

export default function TestTemplate({ bootstrap }) {
  console.log('🚀 TestTemplate function started, bootstrap:', !!bootstrap);
  console.log('🏠 TestTemplate rendering with data:', Object.keys(bootstrap || {}));
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0066cc' }}>Test Template</h1>
      <p>Company: {bootstrap?.company_name || 'Not provided'}</p>
      <p>City: {bootstrap?.city?.[0] || 'Not provided'}</p>
      <p>Services: {bootstrap?.services || 'Not provided'}</p>
      <p>Industry: {bootstrap?.industry || 'Not provided'}</p>
      
      {/* Add data-edit attributes for inline editing */}
      <div data-edit="hero.title" style={{ border: '2px dashed #ccc', padding: '10px', margin: '10px 0' }}>
        <h2>Editable Title: {bootstrap?.company_name || 'Your Business Name'}</h2>
      </div>
      
      <div data-edit="hero.description" style={{ border: '2px dashed #ccc', padding: '10px', margin: '10px 0' }}>
        <p>Editable Description: Welcome to our business in {bootstrap?.city?.[0] || 'Your City'}</p>
      </div>
      
      <div data-edit="services.main" style={{ border: '2px dashed #ccc', padding: '10px', margin: '10px 0' }}>
        <h3>Our Services: {bootstrap?.services || 'Your Services'}</h3>
      </div>
    </div>
  );
}