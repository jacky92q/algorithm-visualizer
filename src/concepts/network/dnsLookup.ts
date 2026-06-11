import type { Concept } from '../types';
import { ActorFlowRenderer } from '../flow/ActorFlowRenderer';
import { buildFlow } from '../flow/buildFlow';

const browser = { id: 'b', label: '브라우저', labelEn: 'Browser', glyph: '🌐', color: '#2A9D8F' };
const resolver = { id: 'r', label: '리졸버', labelEn: 'Resolver', sub: 'ISP', glyph: '🛰️', color: '#C9821C' };
const root = { id: 'root', label: '루트', labelEn: 'Root', sub: '.', glyph: '📚', color: '#6F4E37' };
const tld = { id: 'tld', label: 'TLD', labelEn: 'TLD', sub: '.com', glyph: '🏷️', color: '#9C6BAE' };
const auth = { id: 'a', label: '권한', labelEn: 'Authoritative', sub: 'NS', glyph: '🏠', color: '#C85A3A' };

export const dnsLookup: Concept = {
  meta: {
    id: 'dns-lookup',
    category: 'network',
    name: 'DNS Resolution',
    blurb: '도메인 이름을 IP 주소로 번역합니다',
    summary:
      '사람은 example.com을 기억하지만 컴퓨터는 IP 주소가 필요합니다. DNS는 이 이름을 주소로 바꾸는 인터넷의 전화번호부입니다. 리졸버가 루트 → TLD(.com) → 권한 서버를 차례로 물어 최종 IP를 찾아오고, 그 결과를 캐시에 저장해 다음엔 더 빠르게 답합니다.',
    glyph: '📖',
    accent: 'amber',
    en: {
      name: 'DNS Resolution',
      blurb: 'Translate a domain name into an IP address',
      summary:
        'Humans remember example.com, but computers need an IP address. DNS is the internet\'s phone book that maps names to addresses. A resolver asks the root → TLD (.com) → authoritative servers in turn to find the final IP, then caches the result so the next lookup is faster.',
    },
  },
  build: () =>
    buildFlow(
      [browser, resolver, root, tld, auth],
      [
        {
          from: 'b', to: 'r', label: 'example.com?', tone: 'active',
          phase: '질의 시작', phaseEn: 'Query starts',
          caption: '브라우저가 "example.com의 IP가 뭐야?"라고 리졸버(보통 ISP/통신사)에게 묻습니다.',
          captionEn: 'The browser asks the resolver (usually your ISP): "What is the IP of example.com?"',
          action: 'QUERY',
        },
        {
          from: 'r', to: 'root', label: 'example.com?', tone: 'neutral',
          phase: '재귀 탐색', phaseEn: 'Recursive lookup',
          caption: '리졸버가 캐시에 없으면 루트 서버에게 묻습니다. 루트는 최상위 시작점입니다.',
          captionEn: "If not cached, the resolver asks a root server — the top of the hierarchy.",
          action: '→ ROOT',
        },
        {
          from: 'root', to: 'r', label: '.com → TLD 서버', labelEn: '.com → ask TLD', tone: 'neutral', dashed: true,
          phase: '재귀 탐색', phaseEn: 'Recursive lookup',
          caption: '루트는 IP를 직접 모릅니다. 대신 ".com을 담당하는 TLD 서버에게 물어봐"라고 알려줍니다.',
          captionEn: "The root doesn't know the IP, but points the resolver to the TLD server responsible for .com.",
          action: 'REFERRAL',
        },
        {
          from: 'r', to: 'tld', label: 'example.com?', tone: 'neutral',
          phase: '재귀 탐색', phaseEn: 'Recursive lookup',
          caption: '리졸버가 이번엔 .com TLD 서버에게 묻습니다.',
          captionEn: 'The resolver now asks the .com TLD server.',
          action: '→ TLD',
        },
        {
          from: 'tld', to: 'r', label: '→ 권한 서버', labelEn: '→ ask Authoritative', tone: 'neutral', dashed: true,
          phase: '재귀 탐색', phaseEn: 'Recursive lookup',
          caption: 'TLD 서버는 "example.com을 실제로 관리하는 권한(authoritative) 서버"를 알려줍니다.',
          captionEn: 'The TLD server points to the authoritative server that actually manages example.com.',
          action: 'REFERRAL',
        },
        {
          from: 'r', to: 'a', label: 'example.com?', tone: 'active',
          phase: '정답 확보', phaseEn: 'Answer found',
          caption: '드디어 리졸버가 권한 서버에게 묻습니다. 이 서버가 진짜 정답을 가지고 있습니다.',
          captionEn: 'Finally the resolver asks the authoritative server, which holds the real answer.',
          action: '→ AUTH',
        },
        {
          from: 'a', to: 'r', label: 'A 93.184.216.34', tone: 'good', dashed: true,
          phase: '정답 확보', phaseEn: 'Answer found',
          caption: '권한 서버가 A 레코드(IP 주소)를 돌려줍니다. 리졸버는 이 답을 캐시에 저장합니다.',
          captionEn: 'The authoritative server returns the A record (IP address). The resolver caches this answer.',
          action: 'ANSWER',
        },
        {
          from: 'r', to: 'b', label: '93.184.216.34', tone: 'good',
          phase: '정답 확보', phaseEn: 'Answer found',
          caption: '리졸버가 IP를 브라우저에 전달합니다. 이제 브라우저는 그 주소로 TCP 연결을 시작할 수 있습니다.',
          captionEn: 'The resolver hands the IP to the browser, which can now open a TCP connection to that address.',
          action: 'RESOLVED',
        },
      ],
      {
        phase: '질의 시작', phaseEn: 'Query starts',
        caption: 'example.com을 입력하면, 먼저 그 이름을 IP 주소로 바꿔야 합니다. DNS가 이 일을 합니다.',
        captionEn: 'Type example.com and the name must first become an IP address. DNS does this.',
        action: 'START',
      },
    ),
  createRenderer: () => new ActorFlowRenderer(),
};
