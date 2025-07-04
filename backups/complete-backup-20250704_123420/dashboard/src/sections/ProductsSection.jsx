import React, { useContext } from 'react';
import SiteDataContext from '../context/SiteDataContext';

export default function ProductsSection() {
  const data = useContext(SiteDataContext);
  
  // Get products from Google Business Profile or fallback to services as products
  const products = data.google_profile?.products || [];
  const hasProducts = products.length > 0;
  
  // If no products, don't render this section
  if (!hasProducts && (!data.services || data.services === 'Your Services')) {
    return null;
  }
  
  // Create products from services if no GBP products available
  const displayProducts = hasProducts ? products : 
    data.services ? data.services.split(',').map((service, index) => ({
      id: `service_${index}`,
      name: service.trim(),
      description: `Professional ${service.trim().toLowerCase()} service`,
      image: data.images?.[index] || data.safeImg(''),
      category: data.industry || 'service'
    })) : [];
  
  if (displayProducts.length === 0) return null;

  return (
    <section className="products-section" style={{ 
      padding: '4rem 0', 
      backgroundColor: '#f8f9fa' 
    }}>
      <div className="container">
        <div className="section-header" style={{ 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: 'var(--primary)', 
            marginBottom: '1rem' 
          }}>
            {hasProducts ? 'Our Products' : `Our ${data.services ? 'Services' : 'Offerings'}`}
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666', 
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            {hasProducts 
              ? `Discover our range of quality products at ${data.company_name || 'our business'}`
              : `Professional ${data.industry?.toLowerCase() || 'services'} tailored to your needs`
            }
          </p>
        </div>

        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {displayProducts.slice(0, 6).map((product, index) => (
            <div key={product.id || index} className="product-card" style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}>
              <div className="product-image" style={{
                height: '200px',
                backgroundImage: `url(${data.safeImg(product.image)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {product.category && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {product.category}
                  </div>
                )}
              </div>
              
              <div className="product-content" style={{
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3'
                }}>
                  {product.name}
                </h3>
                
                <p style={{
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '1rem',
                  fontSize: '0.95rem'
                }}>
                  {product.description}
                </p>
                
                <button style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                }}>
                  {hasProducts ? 'Learn More' : 'Get Quote'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayProducts.length > 6 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '3rem' 
          }}>
            <button style={{
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '2px solid var(--primary)',
              padding: '1rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--primary)';
            }}>
              View All {hasProducts ? 'Products' : 'Services'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .section-header h2 {
            font-size: 2rem !important;
          }
          
          .section-header p {
            font-size: 1rem !important;
          }
          
          .product-content {
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .products-section {
            padding: 3rem 0 !important;
          }
          
          .section-header {
            margin-bottom: 2rem !important;
          }
          
          .section-header h2 {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </section>
  );
}