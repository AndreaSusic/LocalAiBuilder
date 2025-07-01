import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function GallerySection() {
  const { images = [], google = {} } = useContext(SiteDataContext) || {};
  
  const defaultGalleryImages = [
    'https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?w=900&auto=format&fit=crop&q=60',
    'https://plus.unsplash.com/premium_photo-1674575134867-cb7623d39bdb?w=900&auto=format&fit=crop&q=60',
    'https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60',
    'https://plus.unsplash.com/premium_photo-1674567520651-6e1f0a5a8fd3?w=900&auto=format&fit=crop&q=60'
  ];
  
  // Ensure images is an array of strings (URLs)
  const imageUrls = Array.isArray(images) ? 
    images.filter(img => typeof img === 'string' && img.length > 0) : [];
  
  const galleryImages = imageUrls.length > 0 ? imageUrls : 
                       (google.photos && Array.isArray(google.photos)) ? google.photos : 
                       defaultGalleryImages;

  return (
    <section className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <img key={index} src={image} alt={`Gallery image ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}