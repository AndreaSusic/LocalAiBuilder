import React from 'react';
import { SiteDataContext } from './context/SiteDataContext';
import HomePageV1 from './templates/HomePageV1';

export default function App1({ bootstrap }) {
  return (
    <SiteDataContext.Provider value={bootstrap}>
      <HomePageV1 />
    </SiteDataContext.Provider>
  );
}