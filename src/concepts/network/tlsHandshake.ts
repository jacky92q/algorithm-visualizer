import type { Concept } from '../types';
import { ActorFlowRenderer } from '../flow/ActorFlowRenderer';
import { buildFlow } from '../flow/buildFlow';

const client = { id: 'c', label: '브라우저', labelEn: 'Browser', sub: 'client', glyph: '🌐', color: '#2A9D8F' };
const server = { id: 's', label: '서버', labelEn: 'Server', sub: 'example.com', glyph: '🔐', color: '#9C6BAE' };

export const tlsHandshake: Concept = {
  meta: {
    id: 'tls-handshake',
    category: 'network',
    name: 'TLS / HTTPS Handshake',
    blurb: '암호화 통신을 위한 열쇠를 교환합니다',
    summary:
      'HTTPS의 자물쇠(🔒)는 TLS 핸드셰이크에서 시작됩니다. 브라우저와 서버는 사용할 암호 방식을 협상하고, 인증서로 서버의 신원을 검증한 뒤, 도청당해도 안전하게 공유 비밀키를 만들어냅니다. 이후 모든 데이터는 그 키로 암호화되어 오갑니다.',
    glyph: '🔒',
    accent: 'plum',
    en: {
      name: 'TLS / HTTPS Handshake',
      blurb: 'Exchange keys to talk securely',
      summary:
        "The padlock (🔒) in HTTPS comes from the TLS handshake. The browser and server negotiate a cipher, verify the server's identity via its certificate, and derive a shared secret key that stays safe even if eavesdropped. All later data is encrypted with that key.",
    },
  },
  build: () =>
    buildFlow(
      [client, server],
      [
        {
          from: 'c', to: 's', label: 'ClientHello', tone: 'active',
          phase: '협상', phaseEn: 'Negotiation',
          caption: '브라우저가 ClientHello로 지원하는 암호 방식 목록과 랜덤 값을 보냅니다.',
          captionEn: 'The browser sends ClientHello with its supported cipher suites and a random value.',
          action: 'HELLO →',
        },
        {
          from: 's', to: 'c', label: 'ServerHello', tone: 'active', dashed: true,
          phase: '협상', phaseEn: 'Negotiation',
          caption: '서버가 ServerHello로 사용할 암호 방식을 하나 고르고 자신의 랜덤 값을 보냅니다.',
          captionEn: 'The server picks one cipher suite in ServerHello and returns its own random value.',
          action: '← HELLO',
        },
        {
          from: 's', to: 'c', label: 'Certificate', tone: 'compare', dashed: true, tag: '📜',
          phase: '인증', phaseEn: 'Authentication',
          caption: '서버가 인증서를 보냅니다. 브라우저는 CA 서명을 검증해 "진짜 그 서버"인지 확인합니다.',
          captionEn: 'The server sends its certificate. The browser checks the CA signature to confirm the server is genuine.',
          action: 'CERT',
        },
        {
          from: 'c', to: 's', label: 'Key Share', tone: 'good', tag: '🔑',
          phase: '키 교환', phaseEn: 'Key exchange',
          caption: '브라우저가 키 공유 값을 보냅니다. 양쪽은 이를 조합해 도청자는 모르는 공유 비밀키를 각자 계산합니다.',
          captionEn: 'The browser sends its key share. Both sides combine values to derive a shared secret no eavesdropper can compute.',
          action: 'KEY',
        },
        {
          from: 's', to: 'c', label: 'Finished', tone: 'good', dashed: true, tag: '✓',
          phase: '키 교환', phaseEn: 'Key exchange',
          caption: '서버가 Finished 메시지로 핸드셰이크 완료를 알립니다. 이제 공유키가 양쪽에 준비됐습니다.',
          captionEn: 'The server sends Finished to complete the handshake. The shared key is now ready on both sides.',
          action: 'DONE',
        },
        {
          from: 'c', to: 's', label: '암호화 데이터', labelEn: 'Encrypted data', tone: 'good', tag: '🔒',
          phase: '보안 통신', phaseEn: 'Secure channel',
          caption: '이제부터 모든 요청과 응답은 공유키로 암호화되어 오갑니다 — 이것이 HTTPS의 🔒 입니다.',
          captionEn: 'From now on every request and response is encrypted with the shared key — this is the 🔒 in HTTPS.',
          action: '🔒 SECURE',
        },
      ],
      {
        phase: '협상', phaseEn: 'Negotiation',
        caption: 'HTTPS는 TLS 핸드셰이크로 시작합니다. 도청 위험이 있는 네트워크에서 안전한 키를 만드는 과정입니다.',
        captionEn: 'HTTPS begins with a TLS handshake — building a safe key over a network that may be eavesdropped.',
        action: 'START',
      },
    ),
  createRenderer: () => new ActorFlowRenderer(),
};
