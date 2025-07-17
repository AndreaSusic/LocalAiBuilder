import React, { useState, useMemo } from 'react';
import { SiteDataContext } from './SiteDataContext';
import { validateBeforeRender } from '../utils/dataValidation';

export function SiteDataProvider({ initialData, children }) {
  console.log('📦 SiteDataProvider with state management');
  
  // Initialize state with provided data
  const [siteData, setSiteData] = useState(() => {
    const defaultData = {
      company_name: 'Your Business Name',
      city: ['Your City'],
      services: 'Your Services',
      colours: ['#ffc000', '#000000'],
      industry: 'Your Industry',
      language: 'English',
      payment_plans: null,
      hero_video: null,
      social: {
        facebook: null,
        instagram: null,
        twitter: null,
        linkedin: null,
        youtube: null,
        tiktok: null,
        pinterest: null,
        snapchat: null,
        whatsapp: null,
        telegram: null,
        reddit: null,
        discord: null,
        github: null,
        behance: null,
        dribbble: null,
        medium: null,
        substack: null,
        patreon: null,
        onlyfans: null,
        twitch: null,
        spotify: null,
        apple_music: null,
        soundcloud: null,
        bandcamp: null,
        etsy: null,
        amazon: null,
        ebay: null,
        depop: null,
        poshmark: null,
        mercari: null,
        vinted: null,
        grailed: null,
        reverb: null,
        discogs: null,
        yelp: null,
        tripadvisor: null,
        foursquare: null,
        zomato: null,
        opentable: null,
        resy: null,
        booksy: null,
        classpass: null,
        mindbody: null,
        eventbrite: null,
        meetup: null,
        facebook_events: null,
        airbnb: null,
        vrbo: null,
        booking: null,
        expedia: null,
        hotels: null,
        kayak: null,
        skyscanner: null,
        uber: null,
        lyft: null
      },
      team: [],
      photos: [],
      reviews: [],
      images: [],
      contact: {
        phone: null,
        email: null,
        address: null,
        website: null
      },
      business_hours: [],
      maps_url: null,
      logo: null,
      favicon: null,
      meta: {
        title: null,
        description: null,
        keywords: null
      },
      // Add areas for dynamic element mapping
      quickLinks: {
        footer: [],
        nav: [],
        social: []
      },
      dynamicElements: {
        images: [],
        text: [],
        sections: []
      }
    };

    // Merge with initial data if provided
    if (initialData) {
      console.log('🔄 Merging initial data with default structure');
      return { ...defaultData, ...initialData };
    }

    return defaultData;
  });

  // Context value with state and setter
  const contextValue = useMemo(() => ({
    siteData,
    setSiteData
  }), [siteData]);

  return (
    <SiteDataContext.Provider value={contextValue}>
      {children}
    </SiteDataContext.Provider>
  );
}

export default SiteDataProvider;