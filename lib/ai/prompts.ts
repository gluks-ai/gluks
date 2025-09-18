// -----------------------------
// Imports
// -----------------------------
import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';
import defaultDataRaw from './data.json';
import refDataRaw from './refs.json';

// -----------------------------
// Types
// -----------------------------
interface DefaultData {
  artifactsPrompt: string;
  regularPrompt: string;
  codePrompt: string;
  sheetPrompt: string;
  updateDocumentPrompt: string;
  updateDocumentCodePrompt: string;
  updateDocumentSheetPrompt: string;
  getRequestPromptFromHints: string;
  systemPrompt: {
    chatModelReasoning: string;
    default: string;
  };
  name: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  units?: number;
  avgRent?: number;
  sqft: number;
  address: string;
  features: string[];
  images: string[];
  status: string;
  roi?: number;
  capRate?: number;
}

interface RefDataItem {
  name: string;
  greeting?: string;
  regularPrompt?: string;
  profile?: {
    title: string;
    experience: string;
    languages: string[];
    specialties: string[];
    bio: string;
  };
  contact?: {
    phone: string;
    email: string;
    whatsapp?: string;
    linkedin?: string;
    availability?: string;
  };
  image?: {
    profilePhoto?: string;
    avatar?: string;
  };
  properties?: Property[];
  performance?: Record<string, number>;
  certifications?: string[];
  workingHours?: Record<string, string>;
  marketReports?: Array<{ title: string; date: string; url: string }>;
}

interface RefDataMap {
  [ref: string]: RefDataItem;
}

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

// -----------------------------
// Raw data
// -----------------------------
const defaultData = defaultDataRaw as DefaultData;
const refData = refDataRaw as RefDataMap;

// -----------------------------
// Type for merged agent data
// -----------------------------
type AgentData = DefaultData & Partial<RefDataItem>;

// -----------------------------
// Deep merge helper
// -----------------------------
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result: any = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge((target as any)[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

// -----------------------------
// Get merged REF data
// -----------------------------
export const getDataByRef = (ref?: string): AgentData => {
  if (ref && refData[ref]) {
    const merged: AgentData = deepMerge(defaultData, refData[ref]);

    if (!refData[ref].regularPrompt && merged.regularPrompt) {
      merged.regularPrompt = merged.regularPrompt.replace(
        'You are ,',
        `You are ${refData[ref].name},`
      );
    }

    return merged;
  }

  // Default fallback
  return {
    ...defaultData,
    regularPrompt: defaultData.regularPrompt.replace('You are ,', 'You are Gluks,'),
  };
};

// -----------------------------
// Request hints
// -----------------------------
export const getRequestPromptFromHints = (requestHints: RequestHints, ref?: string) => {
  const dynamicData = getDataByRef(ref);
  return `
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
- Bot Name: ${dynamicData.name}
`;
};

// -----------------------------
// System prompt
// -----------------------------
export const systemPrompt = ({
  selectedChatModel,
  requestHints,
  ref,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  ref?: string;
}) => {
  const dynamicData = getDataByRef(ref);
  const requestPrompt = getRequestPromptFromHints(requestHints, ref);

  // Insert full agent data so LLM doesn’t invent anything
  const agentDataSnippet = `
⚠️ USE ONLY THE FOLLOWING DATA WHEN ANSWERING USER:
Name: ${dynamicData.name}
Title: ${dynamicData.profile?.title || 'N/A'}
Bio: ${dynamicData.profile?.bio || 'N/A'}
Experience: ${dynamicData.profile?.experience || 'N/A'}
Languages: ${dynamicData.profile?.languages?.join(', ') || 'N/A'}
Specialties: ${dynamicData.profile?.specialties?.join(', ') || 'N/A'}
Email: ${dynamicData.contact?.email || 'N/A'}
Phone: ${dynamicData.contact?.phone || 'N/A'}
WhatsApp: ${dynamicData.contact?.whatsapp || 'N/A'}
LinkedIn: ${dynamicData.contact?.linkedin || 'N/A'}
Properties: ${
    dynamicData.properties?.map(p => `${p.title} (${p.type})`).join(', ') || 'N/A'
  }
`;

  if (selectedChatModel === 'chat-model-reasoning') {
    return `${dynamicData.regularPrompt}\n\n${agentDataSnippet}\n\n${requestPrompt}`;
  } else {
    return `${dynamicData.regularPrompt}\n\n${agentDataSnippet}\n\n${requestPrompt}\n\n${dynamicData.artifactsPrompt}`;
  }
};

// -----------------------------
// Code / Sheet prompts
// -----------------------------
export const codePrompt = (ref?: string) => getDataByRef(ref).codePrompt;
export const sheetPrompt = (ref?: string) => getDataByRef(ref).sheetPrompt;

// -----------------------------
// Update document
// -----------------------------
export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
  ref?: string
) => {
  return type === 'text'
    ? `Improve the following real estate document contents based on the given prompt. Only make improvements related to real estate matters.\n\n${currentContent}`
    : type === 'code'
    ? `Improve the following real estate calculation code snippet based on the given prompt. Only make improvements for real estate-related calculations.\n\n${currentContent}`
    : type === 'sheet'
    ? `Improve the following real estate spreadsheet based on the given prompt. Only make improvements related to real estate data and calculations.\n\n${currentContent}`
    : '';
};
