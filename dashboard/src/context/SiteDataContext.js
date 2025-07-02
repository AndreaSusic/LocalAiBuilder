import { createContext, useContext } from 'react';
import { validateBeforeRender } from '../utils/dataValidation';

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

  // Validate data before returning
  try {
    validateBeforeRender(context);
  } catch (error) {
    console.error('❌ VALIDATION FAILED in SiteDataContext:', error.message);
    console.error('🚨 DATA CONTAMINATION DETECTED - Blocking template render');
    
    // Return safe default data to prevent rendering contaminated content
    return {
      company_name: 'Data Validation Error',
      city: ['Please Refresh'],
      services: 'Validation Failed',
      colours: ['#ff0000', '#ffffff'],
      industry: 'Error',
      language: 'English',
      payment_plans: null,
      hero_video: null,
      social: {
        facebook: null,
        instagram: null,
        linkedin: null,
        tiktok: null
      },
      ai_customization: { hero_title: 'Data Validation Error - Please Refresh' },
      google_profile: null,
      conversation: []
    };
  }

  return context;
};