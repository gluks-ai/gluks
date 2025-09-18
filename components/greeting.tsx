'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import refDataRaw from '../lib/ai/refs.json';

// -----------------------------
// Types
// -----------------------------
interface RefDataMap {
  [key: string]: {
    name: string;
    regularPrompt: string;
    profile: { title: string; experience: string; languages: string[]; specialties: string[]; bio: string };
    contact: { phone: string; email: string; whatsapp?: string; linkedin?: string; availability?: string };
    properties?: Array<any>;
    performance?: Record<string, any>;
    certifications?: string[];
    workingHours?: Record<string, string>;
    image?: { profilePhoto?: string; avatar?: string };
    marketReports?: Array<{ title: string; date: string; url: string }>;
  };
}

const refData = refDataRaw as RefDataMap;

interface AgentGreetingProps {
  ref?: string; // optional, default if not provided
}

export const Greeting = ({ ref = 'REF123' }: AgentGreetingProps) => {
  const [agentInfo, setAgentInfo] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    experience?: string;
    propertyCount?: number;
  }>({});

  useEffect(() => {
    const data = refData[ref];

    if (data) {
      setAgentInfo({
        name: data.name,
        email: data.contact?.email,
        phone: data.contact?.phone,
        experience: data.profile?.experience,
        propertyCount: data.properties?.length ?? 0,
      });
    } else {
      // fallback if ref is invalid
      setAgentInfo({
        name: 'Gluks',
        email: 'não disponível',
        phone: 'não disponível',
        experience: 'não disponível',
        propertyCount: 0,
      });
    }
  }, [ref]);

  return (
    <div className="mx-auto mt-8 flex max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-zinc-900 md:text-3xl"
      >
        Olá, sou <span className="text-indigo-600">{agentInfo.name || 'Gluks'}</span>!
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-lg text-zinc-600 md:text-xl"
      >
        Posso ser contactado pelo{' '}
        {agentInfo.email && ' email '}
        {agentInfo.email && (
          <span className="font-medium text-zinc-800">{agentInfo.email}</span>
        )}
        {agentInfo.email && agentInfo.phone && ' e '}
        {agentInfo.phone && ' telefone '}
        {agentInfo.phone && (
          <span className="font-medium text-zinc-800">{agentInfo.phone}</span>
        )}
        .
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-2 text-lg text-zinc-600 md:text-xl"
      >
        Atualmente possuo <span className="font-medium text-indigo-600">{agentInfo.propertyCount}</span>{' '}
        propriedades em carteira.
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 text-sm text-zinc-400 md:text-base"
      >
        Bem-vindo ao nosso sistema imobiliário premium! Estou aqui para ajudá-lo a encontrar as melhores oportunidades.
      </motion.div>
    </div>

  );
};
