import { createContext, useContext } from 'react';

export const SiteDataContext = createContext(null);

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    // Return default data if no context provided
    return {
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
        linkedin: null,
        tiktok: null
      },
      google_profile: null,
      conversation: []
    };
  }
  return context;
};