import { describe, it, expect } from 'vitest';
import { generateOpenClashYaml, generateImmortalWrtUciScript } from '../utils/parser';
import { OpenClashSettings, ProxyNode, PolicyGroup, TrafficRule } from '../types/openclash';

describe('3. 配置生成器与 UCI 脚本测试 (Config Generator)', () => {
  const mockSettings: OpenClashSettings = {
    coreType: 'Meta',
    runMode: 'fake-ip',
    proxyMode: 'rule',
    mixedPort: 7890,
    redirPort: 7892,
    tproxyPort: 7895,
    dnsPort: 7874,
    controllerPort: 9090,
    secret: 'clash123456',
    allowLan: true,
    bindAddress: '*',
    logLevel: 'info',
    tunEnable: true,
    tunStack: 'system',
    routerHost: '192.168.1.1',
    enableGeoIPDat: true,
  };

  const mockProxies: ProxyNode[] = [
    {
      id: 'p1',
      name: '🇭🇰 香港 01 [VLESS]',
      type: 'vless',
      server: 'hk.node.com',
      port: 443,
      uuid: 'uuid-1234',
      tls: true,
      sni: 'hk.node.com',
      latency: 35,
      status: 'online',
      country: 'HK',
      flag: '🇭🇰',
    },
  ];

  const mockGroups: PolicyGroup[] = [
    {
      id: 'g1',
      name: '🚀 节点选择 (PROXY)',
      type: 'select',
      proxies: ['🇭🇰 香港 01 [VLESS]', 'DIRECT'],
    },
    {
      id: 'g2',
      name: '⚡ 自动优选 (Auto)',
      type: 'url-test',
      proxies: ['🇭🇰 香港 01 [VLESS]'],
      url: 'http://cp.cloudflare.com/generate_204',
      interval: 300,
    },
  ];

  const mockRules: TrafficRule[] = [
    { id: 'r1', type: 'DOMAIN-SUFFIX', payload: 'openai.com', targetGroup: '🚀 节点选择 (PROXY)', enabled: true },
    { id: 'r2', type: 'GEOIP', payload: 'cn', targetGroup: 'DIRECT', enabled: true },
    { id: 'r3', type: 'MATCH', payload: '', targetGroup: '🚀 节点选择 (PROXY)', enabled: true },
  ];

  it('应生成结构完整合规的 Clash Meta YAML 格式文本', () => {
    const yaml = generateOpenClashYaml(mockSettings, mockProxies, mockGroups, mockRules);

    expect(yaml).toContain('mixed-port: 7890');
    expect(yaml).toContain('mode: rule');
    expect(yaml).toContain('enhanced-mode: fake-ip');
    expect(yaml).toContain('fake-ip-range: 198.18.0.1/16');
    expect(yaml).toContain('secret: clash123456');
    expect(yaml).toContain('tun:');
    expect(yaml).toContain('proxies:');
    expect(yaml).toContain('proxy-groups:');
    expect(yaml).toContain('rules:');
    expect(yaml).toContain('DOMAIN-SUFFIX,openai.com,🚀 节点选择 (PROXY)');
    expect(yaml).toContain('GEOIP,cn,DIRECT');
    expect(yaml).toContain('MATCH,🚀 节点选择 (PROXY)');
  });

  it('应生成正确的 ImmortalWRT UCI Shell 自动化脚本', () => {
    const script = generateImmortalWrtUciScript(mockSettings);

    expect(script).toContain('#!/bin/sh');
    expect(script).toContain("uci set openclash.config.enable='1'");
    expect(script).toContain("uci set openclash.config.operation_mode='fake-ip'");
    expect(script).toContain("uci set openclash.config.core_type='Meta'");
    expect(script).toContain("uci set openclash.config.mixed_port='7890'");
    expect(script).toContain("uci set openclash.config.dashboard_port='9090'");
    expect(script).toContain("uci commit openclash");
    expect(script).toContain("/etc/init.d/openclash restart");
  });
});
