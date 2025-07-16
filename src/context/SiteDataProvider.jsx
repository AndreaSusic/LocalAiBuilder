/**
 * REACT STATE-BASED SITE DATA PROVIDER
 * Provides bootstrap data with undo/redo capabilities using React state management
 * instead of DOM manipulation, preventing React Virtual DOM conflicts
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { SiteDataContext } from '../../dashboard/src/context/SiteDataContext';
import { useUndoRedo } from '../hooks/useUndoRedo';

// Create a context for the state management functions
const SiteDataActionsContext = createContext(null);

export const SiteDataProvider = ({ children, initialData = {} }) => {
  // Initialize undo/redo state management with the bootstrap data
  const {
    state: siteData,
    updateState: updateSiteData,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
    currentIndex
  } = useUndoRedo(initialData);

  console.log('🔄 SiteDataProvider initialized with:', {
    company: siteData.company_name,
    services: siteData.services?.length || 0,
    images: siteData.images?.length || 0,
    historySize,
    currentIndex
  });

  // Update a specific field in the site data
  const updateField = useCallback((field, value) => {
    updateSiteData(prevData => ({
      ...prevData,
      [field]: value
    }));
    console.log(`📝 Updated field ${field}:`, value);
  }, [updateSiteData]);

  // Update a nested field (e.g., contact.phone)
  const updateNestedField = useCallback((parentField, childField, value) => {
    updateSiteData(prevData => ({
      ...prevData,
      [parentField]: {
        ...prevData[parentField],
        [childField]: value
      }
    }));
    console.log(`📝 Updated nested field ${parentField}.${childField}:`, value);
  }, [updateSiteData]);

  // Add a new service
  const addService = useCallback((service) => {
    updateSiteData(prevData => ({
      ...prevData,
      services: [...(prevData.services || []), service]
    }));
    console.log('➕ Added service:', service);
  }, [updateSiteData]);

  // Remove a service by index
  const removeService = useCallback((index) => {
    updateSiteData(prevData => ({
      ...prevData,
      services: prevData.services?.filter((_, i) => i !== index) || []
    }));
    console.log('➖ Removed service at index:', index);
  }, [updateSiteData]);

  // Update a service by index
  const updateService = useCallback((index, newService) => {
    updateSiteData(prevData => ({
      ...prevData,
      services: prevData.services?.map((service, i) => 
        i === index ? newService : service
      ) || []
    }));
    console.log('✏️ Updated service at index:', index, 'to:', newService);
  }, [updateSiteData]);

  // Add a new image
  const addImage = useCallback((image) => {
    updateSiteData(prevData => ({
      ...prevData,
      images: [...(prevData.images || []), image]
    }));
    console.log('🖼️ Added image:', image);
  }, [updateSiteData]);

  // Remove an image by index
  const removeImage = useCallback((index) => {
    updateSiteData(prevData => ({
      ...prevData,
      images: prevData.images?.filter((_, i) => i !== index) || []
    }));
    console.log('🗑️ Removed image at index:', index);
  }, [updateSiteData]);

  // Replace an image by index
  const replaceImage = useCallback((index, newImage) => {
    updateSiteData(prevData => ({
      ...prevData,
      images: prevData.images?.map((img, i) => 
        i === index ? newImage : img
      ) || []
    }));
    console.log('🔄 Replaced image at index:', index, 'with:', newImage);
  }, [updateSiteData]);

  // Update entire data object (for major changes)
  const updateAllData = useCallback((newData) => {
    updateSiteData(newData);
    console.log('🔄 Updated entire site data');
  }, [updateSiteData]);

  // Delete any element or section
  const deleteElement = useCallback((elementType, elementId) => {
    updateSiteData(prevData => {
      const newData = { ...prevData };
      
      switch (elementType) {
        case 'service':
          newData.services = newData.services?.filter((_, i) => i !== elementId) || [];
          break;
        case 'image':
          newData.images = newData.images?.filter((_, i) => i !== elementId) || [];
          break;
        case 'review':
          newData.reviews = newData.reviews?.filter((_, i) => i !== elementId) || [];
          break;
        case 'team_member':
          newData.team = newData.team?.filter((_, i) => i !== elementId) || [];
          break;
        default:
          // For text elements, set to empty or remove
          if (newData[elementType]) {
            newData[elementType] = '';
          }
          break;
      }
      
      return newData;
    });
    console.log(`🗑️ Deleted ${elementType} with ID:`, elementId);
  }, [updateSiteData]);

  // Delete element by path (for unmapped elements)
  const deleteElementByPath = useCallback((elementPath, originalElement = null) => {
    updateSiteData(prevData => {
      const newData = { ...prevData };
      
      if (elementPath.includes('.')) {
        // Handle nested paths
        const [parentField, childField] = elementPath.split('.');
        
        if (parentField === 'quickLinks') {
          // Initialize quickLinks if it doesn't exist
          if (!newData.quickLinks) {
            newData.quickLinks = {};
          }
          
          // Store original element for potential restoration
          if (originalElement) {
            if (!newData.quickLinks._deleted) {
              newData.quickLinks._deleted = {};
            }
            newData.quickLinks._deleted[childField] = originalElement;
          }
          
          // Mark as deleted/hidden
          newData.quickLinks[childField] = '';
          
        } else if (parentField === 'dynamicElements') {
          // Initialize dynamicElements if it doesn't exist
          if (!newData.dynamicElements) {
            newData.dynamicElements = {};
          }
          
          // Store original element for potential restoration
          if (originalElement) {
            if (!newData.dynamicElements._deleted) {
              newData.dynamicElements._deleted = {};
            }
            newData.dynamicElements._deleted[childField] = originalElement;
          }
          
          // Mark as deleted/hidden
          newData.dynamicElements[childField] = '';
          
        } else if (parentField === 'services' && !isNaN(childField)) {
          // Handle service deletion by index
          newData.services = newData.services?.filter((_, i) => i !== parseInt(childField)) || [];
        } else {
          // Handle other nested fields
          if (!newData[parentField]) {
            newData[parentField] = {};
          }
          newData[parentField][childField] = '';
        }
      } else {
        // Handle direct field deletion
        if (originalElement) {
          if (!newData._deleted) {
            newData._deleted = {};
          }
          newData._deleted[elementPath] = originalElement;
        }
        newData[elementPath] = '';
      }
      
      return newData;
    });
    console.log(`🗑️ Deleted element at path: ${elementPath}`);
  }, [updateSiteData]);

  // Listen for external data updates (from server or other sources)
  useEffect(() => {
    const handleDataUpdate = (event) => {
      if (event.data.type === 'updateSiteData') {
        updateAllData(event.data.data);
      }
    };

    window.addEventListener('message', handleDataUpdate);
    return () => window.removeEventListener('message', handleDataUpdate);
  }, [updateAllData]);

  // Actions object to pass to components
  const actions = {
    updateField,
    updateNestedField,
    addService,
    removeService,
    updateService,
    addImage,
    removeImage,
    replaceImage,
    updateAllData,
    deleteElement,
    deleteElementByPath,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
    currentIndex
  };

  return (
    <SiteDataContext.Provider value={siteData}>
      <SiteDataActionsContext.Provider value={actions}>
        {children}
      </SiteDataActionsContext.Provider>
    </SiteDataContext.Provider>
  );
};

// Custom hook to use the actions
export const useSiteDataActions = () => {
  const context = useContext(SiteDataActionsContext);
  if (!context) {
    throw new Error('useSiteDataActions must be used within a SiteDataProvider');
  }
  return context;
};

// Custom hook to use both data and actions
export const useSiteDataWithActions = () => {
  const data = useContext(SiteDataContext);
  const actions = useContext(SiteDataActionsContext);
  
  if (!data || !actions) {
    throw new Error('useSiteDataWithActions must be used within a SiteDataProvider');
  }
  
  return { data, actions };
};