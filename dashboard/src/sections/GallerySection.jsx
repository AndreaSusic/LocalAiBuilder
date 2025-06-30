import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function GallerySection() {
  const { images = [], google = {} } = useContext(SiteDataContext) || {};
  
  // Default gallery images
  const defaultGallery = [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&auto=format&fit=crop"
  ];

  // Combine user images, Google photos, and defaults
  const galleryImages = [
    ...images.slice(0, 5),
    ...(google.photos || []).slice(0, 5 - images.length),
    ...defaultGallery.slice(0, Math.max(0, 5 - images.length - (google.photos?.length || 0)))
  ].slice(0, 5);

  return (
    <section className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <img 
            key={index} 
            src={image} 
            alt={`Gallery image ${index + 1}`} 
          />
        ))}
      </div>
    </section>
  );
}