import type { Concept } from '../types';
import { ActorFlowRenderer } from '../flow/ActorFlowRenderer';
import { buildFlow } from '../flow/buildFlow';

const client = { id: 'c', label: '새 기기', labelEn: 'New device', sub: '0.0.0.0', glyph: '📱', color: '#2A9D8F' };
const server = { id: 's', label: 'DHCP 서버', labelEn: 'DHCP Server', sub: '192.168.0.1', glyph: '🖧', color: '#C9821C' };

export const dhcp: Concept = {
  meta: {
    id: 'dhcp-dora',
    category: 'network',
    name: 'DHCP (DORA)',
    blurb: '네트워크에 접속하면 IP를 자동으로 받습니다',
    summary:
      'Wi-Fi에 연결하면 내 기기는 아직 IP 주소가 없습니다(0.0.0.0). DHCP는 네 단계(DORA: Discover, Offer, Request, Ack)로 주소를 자동 임대해 줍니다. 기기가 "주소 주세요"라고 방송하면 서버가 후보를 제안하고, 기기가 그걸 요청하면 서버가 확정해 줍니다.',
    glyph: '📡',
    accent: 'coral',
    en: {
      name: 'DHCP (DORA)',
      blurb: 'Get an IP address automatically when you join a network',
      summary:
        'When you join Wi-Fi, your device has no IP yet (0.0.0.0). DHCP auto-leases an address in four steps (DORA: Discover, Offer, Request, Ack). The device broadcasts "I need an address", a server offers one, the device requests it, and the server acknowledges.',
    },
  },
  build: () =>
    buildFlow(
      [client, server],
      [
        {
          from: 'c', to: 's', label: 'DHCPDISCOVER', labelEn: 'DISCOVER (broadcast)', tone: 'active', tag: '📢',
          phase: 'D · Discover', phaseEn: 'D · Discover',
          caption: '새 기기는 아직 주소가 없어, 네트워크 전체에 "DHCP 서버 있나요?"라고 방송(broadcast)합니다.',
          captionEn: 'With no address yet, the device broadcasts to the whole network: "Any DHCP server out there?"',
          action: 'DISCOVER',
        },
        {
          from: 's', to: 'c', label: 'DHCPOFFER 192.168.0.50', tone: 'active', dashed: true,
          phase: 'O · Offer', phaseEn: 'O · Offer',
          caption: 'DHCP 서버가 사용 가능한 주소 하나(192.168.0.50)를 후보로 제안합니다.',
          captionEn: 'A DHCP server offers an available address (192.168.0.50) as a candidate.',
          action: 'OFFER',
        },
        {
          from: 'c', to: 's', label: 'DHCPREQUEST 192.168.0.50', tone: 'good', tag: '🙋',
          phase: 'R · Request', phaseEn: 'R · Request',
          caption: '기기가 "그 주소로 할게요!"라고 정식 요청합니다. (여러 서버가 제안했다면 하나를 고르는 단계)',
          captionEn: 'The device formally requests that address. (If several servers offered, this picks one.)',
          action: 'REQUEST',
        },
        {
          from: 's', to: 'c', label: 'DHCPACK ✓ lease', tone: 'good', dashed: true, tag: '✅',
          phase: 'A · Acknowledge', phaseEn: 'A · Acknowledge',
          caption: '서버가 확정(ACK)하고 임대 기간·게이트웨이·DNS 정보를 함께 줍니다. 이제 기기는 인터넷을 쓸 수 있습니다.',
          captionEn: 'The server acknowledges and sends the lease time, gateway and DNS info. The device can now use the internet.',
          action: 'ACK',
        },
      ],
      {
        phase: 'D · Discover', phaseEn: 'D · Discover',
        caption: 'Wi-Fi에 막 접속한 기기는 IP가 없습니다. DHCP가 DORA 4단계로 주소를 자동 배정합니다.',
        captionEn: 'A device that just joined Wi-Fi has no IP. DHCP auto-assigns one through the four DORA steps.',
        action: 'START',
      },
    ),
  createRenderer: () => new ActorFlowRenderer(),
};
