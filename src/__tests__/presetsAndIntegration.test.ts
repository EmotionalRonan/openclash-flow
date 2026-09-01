import { describe, it, expect } from 'vitest';
import {
  INITIAL_TRAFFIC_RULES,
  INITIAL_POLICY_GROUPS,
  INITIAL_PROXIES,
  DEFAULT_OPENCLASH_SETTINGS,
} from '../data/presetRules';
import { parseSubscriptionInput, generateOpenClashYaml } from '../utils/parser';
import { simulateTrafficRoute } from '../utils/ruleMatcher';

describe('5. 预设规则库与端到端集成测试 (Presets & End-to-End Integration)', () => {
  it('默认预设数据应包含完整有效的初始拓扑要素', () => {
    expect(INITIAL_TRAFFIC_RULES.length).toBeGreaterThanOrEqual(6);
    expect(INITIAL_POLICY_GROUPS.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_PROXIES.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_OPENCLASH_SETTINGS.runMode).toBe('fake-ip');
    expect(DEFAULT_OPENCLASH_SETTINGS.coreType).toBe('Meta');

    // 检查所有规则的目标策略组是否真实存在于默认组列表中或者是 DIRECT/REJECT
    const groupNames = new Set(INITIAL_POLICY_GROUPS.map((g) => g.name));
    INITIAL_TRAFFIC_RULES.forEach((rule) => {
      const isBuiltin = rule.targetGroup.includes('DIRECT') || rule.targetGroup.includes('REJECT');
      const exists = groupNames.has(rule.targetGroup) || isBuiltin;
      expect(exists).toBe(true);
    });
  });

  it('批量多协议混编订阅文本解析测试', () => {
    const multiProtocolText = [
      'ss://YWVzLTEyOC1nY206cGFzczEyMw@1.1.1.1:8388#%E9%A6%99%E6%B8%AF%2001',
      'vless://11111111-2222-3333-4444-555555555555@2.2.2.2:443?security=reality&sni=test.com#%E6%97%A5%E6%9C%AC%2002',
      'hy2://token999@3.3.3.3:8443?sni=bing.com#%E7%BE%8E%E5%9B%BD%2003',
      'trojan://pass888@4.4.4.4:443?sni=trojan.org#%E6%96%B0%E5%8A%A0%E5%9D%A1%2004',
    ].join('\n');

    const nodes = parseSubscriptionInput(multiProtocolText);
    expect(nodes.length).toBe(4);
    expect(nodes.map((n) => n.type)).toEqual(['ss', 'vless', 'hysteria2', 'trojan']);
    expect(nodes.map((n) => n.country)).toEqual(['HK', 'JP', 'US', 'SG']);
  });

  it('端到端仿真：主流互联网业务分流全覆盖', () => {
    const testCases = [
      { input: 'chat.openai.com', expectedGroup: '🤖 AI 服务 (AI)' },
      { input: 'claude.ai', expectedGroup: '🤖 AI 服务 (AI)' },
      { input: 'www.netflix.com', expectedGroup: '🎬 海外流媒体 (MEDIA)' },
      { input: 'store.steampowered.com', expectedGroup: '🎮 游戏加速 (GAME)' },
      { input: 'www.googleadservices.com', expectedGroup: '🛡️ 广告拦截 (REJECT)' },
      { input: 'pagead2.googlesyndication.com', expectedGroup: '🛡️ 广告拦截 (REJECT)' },
      { input: 'www.bilibili.com', expectedGroup: '🇨🇳 国内直连 (DIRECT)' },
      { input: 'www.baidu.com', expectedGroup: '🇨🇳 国内直连 (DIRECT)' },
      { input: '192.168.1.254', expectedGroup: '🇨🇳 国内直连 (DIRECT)' },
    ];

    testCases.forEach(({ input, expectedGroup }) => {
      const res = simulateTrafficRoute(input, INITIAL_TRAFFIC_RULES, INITIAL_POLICY_GROUPS, INITIAL_PROXIES);
      expect(res.targetGroup).toBe(expectedGroup);
      expect(res.evaluationSteps.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('配置生成与再次解析一致性校验', () => {
    const yaml = generateOpenClashYaml(
      DEFAULT_OPENCLASH_SETTINGS,
      INITIAL_PROXIES,
      INITIAL_POLICY_GROUPS,
      INITIAL_TRAFFIC_RULES
    );
    expect(yaml).toBeTruthy();
    expect(yaml.length).toBeGreaterThan(500);

    // 验证由系统生成的 YAML 可被 parseSubscriptionInput 成功解析出代理节点
    const reimportedNodes = parseSubscriptionInput(yaml);
    expect(reimportedNodes.length).toBe(INITIAL_PROXIES.length);
    expect(reimportedNodes[0].server).toBe(INITIAL_PROXIES[0].server);
  });
});
