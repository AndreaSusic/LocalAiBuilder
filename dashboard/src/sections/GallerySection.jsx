import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function GallerySection() {
  const { images = [], google_profile = {}, safeImg } = useContext(SiteDataContext) || {};
  
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
    <section className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <img key={index} src={safeImg ? safeImg(image) : image} alt={`Gallery image ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}