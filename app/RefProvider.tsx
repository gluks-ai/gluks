'use client';

import React, { createContext, useContext } from 'react';

interface RefProviderProps {
  children: React.ReactNode;
  refValue: string | null;
}

const RefContext = createContext<string | null>(null);

export const useRefContext = () => useContext(RefContext);

export const RefProvider: React.FC<RefProviderProps> = ({ children, refValue }) => {
  return <RefContext.Provider value={refValue}>{children}</RefContext.Provider>;
};
