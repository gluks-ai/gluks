// lib/ai/RefContext.tsx
'use client';
import { createContext, useContext } from 'react';

export const RefContext = createContext<string | null>(null);

export const useRefContext = () => useContext(RefContext);
