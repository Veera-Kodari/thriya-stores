import React, { createContext, useContext, useState, useEffect } from 'react';
import contentData from './content.json';

const ContentContext = createContext({});

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(contentData);
  // For future: fetch from API or CMS
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (key) => {
  const content = useContext(ContentContext);
  return key.split('.').reduce((obj, k) => obj && obj[k], content);
};
