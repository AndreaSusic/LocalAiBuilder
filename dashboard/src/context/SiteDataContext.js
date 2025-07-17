import { createContext, useContext } from 'react';

console.log('🕵️‍♂️ SiteDataContext loaded');

export const SiteDataContext = createContext(null);

// Custom hook to use SiteDataContext with better error handling
export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    console.warn('useSiteData must be used within a SiteDataProvider');
    return { siteData: {}, setSiteData: () => {} };
  }
  return context;
};

// Hook for accessing siteData directly (backward compatibility)
export const useSiteDataValue = () => {
  const { siteData } = useSiteData();
  return siteData;
};