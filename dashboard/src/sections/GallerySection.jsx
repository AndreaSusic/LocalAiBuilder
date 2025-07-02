import React, { useContext, useState } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';

export default function GallerySection() {
  const { images = [], google_profile = {}, safeImg, company_name = 'Our Business' } = useContext(SiteDataContext) || {};
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Use GBP photos first, then provided images
  const gbpPhotos = google_profile.photos || [];
  const providedImages = Array.isArray(images) ? 
    images.filter(img => 
      typeof img === 'string' && 
      img.length > 0 && 
      !img.includes('placeholder') &&
      (img.startsWith('http://') || img.startsWith('https://'))
    ) : [];
  
  const galleryImages = [...gbpPhotos, ...providedImages];
  
  // Don't show gallery if no images available
  if (galleryImages.length === 0) return null;

  return (
    <>
      <section className="gallery" style={{
        padding: '4rem 0',
        backgroundColor: '#ffffff'
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
              Gallery
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Take a look at our work and facilities at {company_name}
            </p>
          </div>

          <div className="gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {galleryImages.slice(0, 8).map((image, index) => (
              <div 
                key={index} 
                className="gallery-item"
                style={{
                  aspectRatio: '1/1',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => setSelectedImage(image)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img 
                  src={safeImg ? safeImg(image) : image} 
                  alt={`${company_name} gallery image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>


        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .gallery-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.75rem !important;
            }
            
            .section-header h2 {
              font-size: 2rem !important;
            }
            
            .section-header p {
              font-size: 1rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .gallery {
              padding: 3rem 0 !important;
            }
            
            .gallery-grid {
              grid-template-columns: 1fr !important;
            }
            
            .section-header {
              margin-bottom: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="lightbox-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="lightbox-content"
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={safeImg ? safeImg(selectedImage) : selectedImage}
              alt="Gallery preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <button
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}