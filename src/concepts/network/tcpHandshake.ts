import type { Concept } from '../types';
import { ActorFlowRenderer } from '../flow/ActorFlowRenderer';
import { buildFlow } from '../flow/buildFlow';

const client = { id: 'c', label: '클라이언트', labelEn: 'Client', sub: '203.0.113.5', glyph: '💻', color: '#2A9D8F' };
const server = { id: 's', label: '서버', labelEn: 'Server', sub: '93.184.216.34', glyph: '🖥️', color: '#C9821C' };

export const tcpHandshake: Concept = {
  meta: {
    id: 'tcp-handshake',
    category: 'network',
    name: 'TCP 3-way Handshake',
    blurb: '연결을 세 번의 악수로 수립합니다',
    summary:
      'TCP는 데이터를 보내기 전에 양쪽이 서로 준비됐는지 확인하는 "3-way handshake"로 연결을 엽니다. SYN → SYN-ACK → ACK 세 단계로 시퀀스 번호를 교환해 신뢰성 있는 양방향 통신 채널을 만든 뒤, 데이터를 주고받고 마지막에 연결을 정상 종료합니다.',
    glyph: '🤝',
    accent: 'teal',
    en: {
      name: 'TCP 3-way Handshake',
      blurb: 'Open a connection with three handshakes',
      summary:
        'Before sending data, TCP opens a connection with a "3-way handshake" so both sides confirm they are ready. The SYN → SYN-ACK → ACK sequence exchanges sequence numbers to build a reliable two-way channel; data is then exchanged and the connection is closed cleanly.',
    },
  },
  build: () =>
    buildFlow(
      [client, server],
      [
        {
          from: 'c', to: 's', label: 'SYN  seq=100', tone: 'active',
          phase: '연결 수립', phaseEn: 'Connection setup',
          caption: '클라이언트가 SYN(동기화) 패킷을 보내 연결을 요청합니다. 시작 시퀀스 번호(seq=100)를 함께 전달합니다.',
          captionEn: 'The client sends a SYN (synchronize) packet to request a connection, carrying its initial sequence number (seq=100).',
          action: 'SYN',
        },
        {
          from: 's', to: 'c', label: 'SYN-ACK  seq=300, ack=101', tone: 'active', dashed: true,
          phase: '연결 수립', phaseEn: 'Connection setup',
          caption: '서버가 SYN-ACK으로 응답합니다. 클라이언트의 seq에 +1한 ack=101로 잘 받았음을 알리고, 자신의 시퀀스(seq=300)도 보냅니다.',
          captionEn: 'The server replies with SYN-ACK: ack=101 acknowledges the client (+1), and it sends its own sequence number (seq=300).',
          action: 'SYN-ACK',
        },
        {
          from: 'c', to: 's', label: 'ACK  ack=301', tone: 'good',
          phase: '연결 수립', phaseEn: 'Connection setup',
          caption: '클라이언트가 ACK로 서버의 시퀀스를 확인(ack=301)합니다. 이로써 양방향 연결이 수립됐습니다 (ESTABLISHED).',
          captionEn: "The client ACKs the server's sequence (ack=301). The two-way connection is now ESTABLISHED.",
          action: 'ACK',
        },
        {
          from: 'c', to: 's', label: 'GET /index.html', tone: 'neutral',
          phase: '데이터 전송', phaseEn: 'Data transfer',
          caption: '연결이 열렸으니 실제 데이터를 주고받습니다. 클라이언트가 HTTP 요청을 보냅니다.',
          captionEn: 'With the connection open, real data flows. The client sends an HTTP request.',
          action: 'DATA →',
        },
        {
          from: 's', to: 'c', label: '200 OK  + HTML', tone: 'neutral', dashed: true,
          phase: '데이터 전송', phaseEn: 'Data transfer',
          caption: '서버가 요청한 페이지를 200 OK 응답으로 돌려줍니다.',
          captionEn: 'The server returns the requested page with a 200 OK response.',
          action: '← DATA',
        },
        {
          from: 'c', to: 's', label: 'FIN', tone: 'compare',
          phase: '연결 종료', phaseEn: 'Connection teardown',
          caption: '전송이 끝나면 클라이언트가 FIN을 보내 연결 종료를 요청합니다.',
          captionEn: 'When done, the client sends FIN to request closing the connection.',
          action: 'FIN',
        },
        {
          from: 's', to: 'c', label: 'ACK  +  FIN', tone: 'compare', dashed: true,
          phase: '연결 종료', phaseEn: 'Connection teardown',
          caption: '서버가 ACK와 FIN으로 응답하고, 마지막 ACK가 오가면 연결이 깔끔하게 닫힙니다.',
          captionEn: 'The server responds with ACK and FIN; a final ACK closes the connection cleanly.',
          action: 'CLOSE',
        },
      ],
      {
        phase: '연결 수립', phaseEn: 'Connection setup',
        caption: 'TCP는 신뢰성 있는 연결입니다. 데이터를 보내기 전, 세 번의 악수로 연결을 엽니다.',
        captionEn: 'TCP is a reliable connection. Before any data, it opens with a three-way handshake.',
        action: 'START',
      },
    ),
  createRenderer: () => new ActorFlowRenderer(),
};
