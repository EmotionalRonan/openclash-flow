import { describe, it, expect } from 'vitest';
import {
  detectCountryFromNodeName,
  parseProtocolUri,
  parseSubscriptionInput,
  generateOpenClashYaml,
  generateImmortalWrtUciScript,
} from '../utils/parser';
import { OpenClashSettings, ProxyNode, PolicyGroup, TrafficRule } from '../types/openclash';

describe('1. 协议解析器测试 (Protocol & Subscription Parser)', () => {
  it('应正确从节点名称识别国家代码与 Emoji 国旗', () => {
    expect(detectCountryFromNodeName('🇭🇰 香港 01 BGP [VLESS]')).toEqual({ country: 'HK', flag: '🇭🇰' });
    expect(detectCountryFromNodeName('JP Tokyo 02 10Gbps')).toEqual({ country: 'JP', flag: '🇯🇵' });
    expect(detectCountryFromNodeName('美国 洛杉矶 GIA CN2')).toEqual({ country: 'US', flag: '🇺🇸' });
    expect(detectCountryFromNodeName('台湾 台北 01 中华电信')).toEqual({ country: 'TW', flag: '🇹🇼' });
    expect(detectCountryFromNodeName('Singapore 03 SG')).toEqual({ country: 'SG', flag: '🇸🇬' });
    expect(detectCountryFromNodeName('UK London Premium')).toEqual({ country: 'UK', flag: '🇬🇧' });
    expect(detectCountryFromNodeName('德国 法兰克福 DE-01')).toEqual({ country: 'DE', flag: '🇩🇪' });
    expect(detectCountryFromNodeName('未知自定义节点节点')).toEqual({ country: 'UN', flag: '🌐' });
  });

  it('应正确解析 Shadowsocks (ss://) 格式链接', () => {
    // base64("aes-256-gcm:pass12345") = "YWVzLTI1Ni1nY206cGFzczEyMzQ1"
    const ssUri = 'ss://YWVzLTI1Ni1nY206cGFzczEyMzQ1@1.2.3.4:8388#%E9%A6%99%E6%B8%AF%20SS%2001';
    const node = parseProtocolUri(ssUri, 0);

    expect(node).not.toBeNull();
    expect(node?.type).toBe('ss');
    expect(node?.server).toBe('1.2.3.4');
    expect(node?.port).toBe(8388);
    expect(node?.cipher).toBe('aes-256-gcm');
    expect(node?.password).toBe('pass12345');
    expect(node?.name).toBe('香港 SS 01');
    expect(node?.country).toBe('HK');
  });

  it('应正确解析 VLESS Reality (vless://) 链接及其查询参数', () => {
    const vlessUri = 'vless://a1b2c3d4-e5f6-7890-abcd-ef1234567890@us-node.example.com:443?security=reality&sni=gateway.icloud.com&pbk=publicKey123456&sid=shortId888&type=tcp&flow=xtls-rprx-vision#%E7%BE%8E%E5%9B%BD%20VLESS%20Reality';
    const node = parseProtocolUri(vlessUri, 1);

    expect(node).not.toBeNull();
    expect(node?.type).toBe('vless');
    expect(node?.server).toBe('us-node.example.com');
    expect(node?.port).toBe(443);
    expect(node?.uuid).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(node?.tls).toBe(true);
    expect(node?.sni).toBe('gateway.icloud.com');
    expect(node?.flow).toBe('xtls-rprx-vision');
    expect(node?.realityOpts?.publicKey).toBe('publicKey123456');
    expect(node?.realityOpts?.shortId).toBe('shortId888');
    expect(node?.country).toBe('US');
  });

  it('应正确解析 Hysteria 2 (hysteria2:// 或 hy2://) 链接', () => {
    const hy2Uri = 'hy2://mySecretToken@jp.hysteria.net:8443?sni=bing.com#%E6%97%A5%E6%9C%AC%20Hysteria2%2001';
    const node = parseProtocolUri(hy2Uri, 2);

    expect(node).not.toBeNull();
    expect(node?.type).toBe('hysteria2');
    expect(node?.server).toBe('jp.hysteria.net');
    expect(node?.port).toBe(8443);
    expect(node?.password).toBe('mySecretToken');
    expect(node?.sni).toBe('bing.com');
    expect(node?.country).toBe('JP');
  });

  it('应正确解析 Trojan (trojan://) 链接及异常 URL 编码容错', () => {
    const trojanUri = 'trojan://pass9999@sg.trojan.org:443?sni=sg.trojan.org#%E6%96%B0%E5%8A%A0%E5%9D%A1%20Trojan%2001';
    const node = parseProtocolUri(trojanUri, 3);

    expect(node).not.toBeNull();
    expect(node?.type).toBe('trojan');
    expect(node?.server).toBe('sg.trojan.org');
    expect(node?.port).toBe(443);
    expect(node?.password).toBe('pass9999');
    expect(node?.tls).toBe(true);
    expect(node?.country).toBe('SG');

    // 容错测试：非法 URI 编码不应抛出异常崩溃
    const malformedUri = 'trojan://pass9999@sg.trojan.org:443#%E6%96%B0%E5%8A%A0%E5%9坡%20Node';
    const malformedNode = parseProtocolUri(malformedUri, 4);
    expect(malformedNode).not.toBeNull();
  });

  it('应正确解析原始 Clash YAML 订阅文本', () => {
    const rawYaml = `
proxies:
  - name: "🇭🇰 香港 01 [VLESS]"
    type: vless
    server: hk.clash.net
    port: 443
    uuid: 12345678-1234-1234-1234-123456789012
    tls: true
    network: ws
    ws-opts:
      path: /graphql
  - name: "🇯🇵 日本 01 [SS]"
    type: ss
    server: jp.clash.net
    port: 8388
    cipher: aes-128-gcm
    password: pass
`;
    const nodes = parseSubscriptionInput(rawYaml);
    expect(nodes.length).toBe(2);
    expect(nodes[0].name).toBe('🇭🇰 香港 01 [VLESS]');
    expect(nodes[0].type).toBe('vless');
    expect(nodes[0].country).toBe('HK');
    expect(nodes[0].wsPath).toBe('/graphql');

    expect(nodes[1].name).toBe('🇯🇵 日本 01 [SS]');
    expect(nodes[1].type).toBe('ss');
    expect(nodes[1].country).toBe('JP');
  });
});
