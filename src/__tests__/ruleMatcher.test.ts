import { describe, it, expect } from 'vitest';
import { isIpAddress, isIpInCidr, simulateTrafficRoute } from '../utils/ruleMatcher';
import { TrafficRule, PolicyGroup, ProxyNode } from '../types/openclash';

describe('2. 规则匹配引擎与流量分流仿真 (Rule Matcher & Simulator)', () => {
  it('应准确判定 IP 地址合法性 (IPv4 / IPv6)', () => {
    expect(isIpAddress('192.168.1.1')).toBe(true);
    expect(isIpAddress('8.8.8.8')).toBe(true);
    expect(isIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(isIpAddress('google.com')).toBe(false);
    expect(isIpAddress('api.openai.com')).toBe(false);
    expect(isIpAddress('192.168.1')).toBe(false);
  });

  it('应准确执行 CIDR 网段掩码计算 (isIpInCidr)', () => {
    expect(isIpInCidr('192.168.1.50', '192.168.1.0/24')).toBe(true);
    expect(isIpInCidr('192.168.2.1', '192.168.1.0/24')).toBe(false);
    expect(isIpInCidr('10.0.5.9', '10.0.0.0/8')).toBe(true);
    expect(isIpInCidr('172.16.5.1', '172.16.0.0/12')).toBe(true);
    expect(isIpInCidr('114.114.114.114', '114.114.114.114/32')).toBe(true);
  });

  const mockRules: TrafficRule[] = [
    { id: '1', type: 'DOMAIN-SUFFIX', payload: 'openai.com', targetGroup: '🤖 AI 服务', enabled: true },
    { id: '2', type: 'DOMAIN-KEYWORD', payload: 'netflix', targetGroup: '🎬 海外流媒体', enabled: true },
    { id: '3', type: 'DOMAIN', payload: 'adservice.google.com', targetGroup: '🛑 广告拦截 (REJECT)', enabled: true },
    { id: '4', type: 'IP-CIDR', payload: '192.168.0.0/16', targetGroup: '🎯 全球直连 (DIRECT)', enabled: true },
    { id: '5', type: 'GEOIP', payload: 'cn', targetGroup: '🎯 全球直连 (DIRECT)', enabled: true },
    { id: '6', type: 'MATCH', payload: '', targetGroup: '🚀 节点选择 (PROXY)', enabled: true },
  ];

  const mockProxies: ProxyNode[] = [
    { id: 'p1', name: '🇭🇰 香港 01', type: 'vless', server: '1.1.1.1', port: 443, latency: 45, status: 'online', country: 'HK', flag: '🇭🇰' },
    { id: 'p2', name: '🇯🇵 日本 01', type: 'vless', server: '2.2.2.2', port: 443, latency: 25, status: 'online', country: 'JP', flag: '🇯🇵' },
    { id: 'p3', name: '🇺🇸 美国 01', type: 'vless', server: '3.3.3.3', port: 443, latency: 130, status: 'online', country: 'US', flag: '🇺🇸' },
  ];

  const mockGroups: PolicyGroup[] = [
    { id: 'g1', name: '🤖 AI 服务', type: 'select', proxies: ['🇺🇸 美国 01', '🇯🇵 日本 01'] },
    { id: 'g2', name: '🎬 海外流媒体', type: 'url-test', proxies: ['🇭🇰 香港 01', '🇯🇵 日本 01'], url: 'http://cp.cloudflare.com' },
    { id: 'g3', name: '🚀 节点选择 (PROXY)', type: 'select', proxies: ['🇭🇰 香港 01', '🇯🇵 日本 01', '🇺🇸 美国 01'] },
  ];

  it('应准确命中 DOMAIN-SUFFIX 规则并走对应策略组', () => {
    const res = simulateTrafficRoute('api.openai.com', mockRules, mockGroups, mockProxies);
    expect(res.matchedRule?.type).toBe('DOMAIN-SUFFIX');
    expect(res.matchedRule?.payload).toBe('openai.com');
    expect(res.targetGroup).toBe('🤖 AI 服务');
    expect(res.selectedNode?.name).toBe('🇺🇸 美国 01');
    expect(res.evaluationSteps.length).toBeGreaterThanOrEqual(3);
  });

  it('应准确命中 DOMAIN-KEYWORD 规则并按 url-test 自动优选最低延迟节点', () => {
    const res = simulateTrafficRoute('www.netflix.com', mockRules, mockGroups, mockProxies);
    expect(res.matchedRule?.type).toBe('DOMAIN-KEYWORD');
    expect(res.targetGroup).toBe('🎬 海外流媒体');
    // 日本 01 延迟 25ms < 香港 01 延迟 45ms
    expect(res.selectedNode?.name).toBe('🇯🇵 日本 01');
  });

  it('应准确命中 DOMAIN 绝对匹配并触发 REJECT 阻断', () => {
    const res = simulateTrafficRoute('adservice.google.com', mockRules, mockGroups, mockProxies);
    expect(res.matchedRule?.type).toBe('DOMAIN');
    expect(res.targetGroup).toBe('🛑 广告拦截 (REJECT)');
    expect(res.selectedNode?.type).toBe('reject');
  });

  it('应准确命中 GEOIP CN 规则并触发 DIRECT 直连', () => {
    const res = simulateTrafficRoute('www.bilibili.com', mockRules, mockGroups, mockProxies);
    expect(res.matchedRule?.type).toBe('GEOIP');
    expect(res.targetGroup).toBe('🎯 全球直连 (DIRECT)');
    expect(res.selectedNode?.type).toBe('direct');
  });

  it('前置未匹配规则时应触发 MATCH 兜底策略', () => {
    const res = simulateTrafficRoute('some-unknown-international-domain.org', mockRules, mockGroups, mockProxies);
    expect(res.matchedRule?.type).toBe('MATCH');
    expect(res.targetGroup).toBe('🚀 节点选择 (PROXY)');
    expect(res.selectedNode?.name).toBe('🇭🇰 香港 01');
  });
});
