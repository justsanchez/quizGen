/**
 * This component ensures that the app is in development mode, so we can bypass validation and
 * also not exhaust the API calls
 *
 * Usage:
 * - quizGenV1/src/components/PromptPage.jsx
 * - quizGenV1/src/components/AIQuizNotes.jsx
 *
 */

import { createContext, useContext, useState } from 'react';

const DevelopingFlagContext = createContext();

export function DevelopingFlagProvider({ children }) {

  // ! set the development flag here
  const [isDeveloping, setIsDeveloping] = useState(true);

  const value = {
    isDeveloping,
    setIsDeveloping
  };

  return (
    <DevelopingFlagContext.Provider value={value}>
      {children}
    </DevelopingFlagContext.Provider>
  );
}

export function useDevelopingFlag() {
  return useContext(DevelopingFlagContext);
}