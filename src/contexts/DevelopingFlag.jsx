import { createContext, useContext, useState } from 'react';

const DevelopingFlagContext = createContext();

/**
 * Provides the global "developing" flag. When `true`, components that would
 * otherwise hit the DeepSeek API (PromptPage, AIQuizNotes, QuizSection) skip
 * remote calls and use canned fixtures, so iterating on UI doesn't burn API
 * quota.
 *
 * Default: `true`. Toggle by editing the initial `useState` value below, or
 * by calling `setIsDeveloping(false)` from a consumer.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
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

/**
 * Hook accessor for the DevelopingFlagContext value.
 * @returns {{ isDeveloping: boolean, setIsDeveloping: (v: boolean) => void }}
 */
export function useDevelopingFlag() {
  return useContext(DevelopingFlagContext);
}