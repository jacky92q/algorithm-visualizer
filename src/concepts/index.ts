import type { Concept } from './types';
import { tcpHandshake } from './network/tcpHandshake';
import { tlsHandshake } from './network/tlsHandshake';
import { dnsLookup } from './network/dnsLookup';
import { dhcp } from './network/dhcp';

export const CONCEPTS: Concept[] = [tcpHandshake, dnsLookup, tlsHandshake, dhcp];

export interface ConceptCategoryInfo {
  id: string;
  label: string;
  glyph: string;
}

export const CONCEPT_CATEGORIES: ConceptCategoryInfo[] = [
  { id: 'network', label: 'Network', glyph: '🌐' },
];

export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find((c) => c.meta.id === id);
}

export function conceptsByCategory(cat: string): Concept[] {
  return CONCEPTS.filter((c) => c.meta.category === cat);
}
