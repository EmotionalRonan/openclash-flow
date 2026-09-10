import { describe, it, expect } from 'vitest';
import { 
  FALLBACK_ALL_POLICY_GROUPS, 
  FALLBACK_ALL_PROXIES, 
  FALLBACK_ALL_RULES,
  RAW_FALLBACK_ALL_YAML_SAMPLE 
} from '../data/fallbackAllConfig';
import { parseFullClashYaml } from '../utils/parser';
import { PolicyGroup, ProxyNode, TrafficRule } from '../types/openclash';

describe('Fallback-All 生产配置与全量增删改查 (CRUD) 验证', () => {
  it('应具备完整的基础生产策略组、节点与分流规则', () => {
    expect(FALLBACK_ALL_POLICY_GROUPS.length).toBeGreaterThanOrEqual(10);
    expect(FALLBACK_ALL_PROXIES.length).toBeGreaterThanOrEqual(5);
    expect(FALLBACK_ALL_RULES.length).toBeGreaterThanOrEqual(10);

    // Verify key policy groups exist
    const groupNames = FALLBACK_ALL_POLICY_GROUPS.map((g) => g.name);
    expect(groupNames).toContain('ChatGPT');
    expect(groupNames).toContain('Gemini');
    expect(groupNames).toContain('Claude');
    expect(groupNames).toContain('YouTube');
    expect(groupNames).toContain('国外');
    expect(groupNames).toContain('国内');
  });

  it('使用 parseFullClashYaml 解析真实 Fallback-All YAML 样本', () => {
    const parsed = parseFullClashYaml(RAW_FALLBACK_ALL_YAML_SAMPLE);
    expect(parsed.proxies.length).toBeGreaterThanOrEqual(4);
    expect(parsed.proxyGroups.length).toBeGreaterThanOrEqual(7);
    expect(parsed.rules.length).toBeGreaterThanOrEqual(8);

    // Proxies should have parsed types correctly
    const types = parsed.proxies.map((p) => p.type);
    expect(types).toContain('ss');
  });

  it('节点 CRUD 操作：新增、编辑、删除及策略组级联重命名', () => {
    let proxies: ProxyNode[] = [...FALLBACK_ALL_PROXIES];
    let groups: PolicyGroup[] = [...FALLBACK_ALL_POLICY_GROUPS];

    // 1. Create Node
    const newNode: ProxyNode = {
      id: 'test-node-1',
      name: '🇸🇬 新加坡 01 专线',
      type: 'vless',
      server: 'sg01.test.com',
      port: 443,
      country: 'SG',
      flag: '🇸🇬',
      latency: 45,
      status: 'online',
    };
    proxies.push(newNode);
    expect(proxies.some((p) => p.id === 'test-node-1')).toBe(true);

    // 2. Add node to a policy group
    const targetGroupId = groups[0].id;
    groups = groups.map((g) => {
      if (g.id === targetGroupId) {
        return { ...g, proxies: [...g.proxies, newNode.name] };
      }
      return g;
    });
    expect(groups.find((g) => g.id === targetGroupId)?.proxies).toContain('🇸🇬 新加坡 01 专线');

    // 3. Edit Node (rename & port update) and cascade rename in policy group
    const oldName = '🇸🇬 新加坡 01 专线';
    const updatedName = '🇸🇬 新加坡 01 高速专线';
    proxies = proxies.map((p) => (p.id === 'test-node-1' ? { ...p, name: updatedName, port: 8443 } : p));
    groups = groups.map((g) => ({
      ...g,
      proxies: g.proxies.map((n) => (n === oldName ? updatedName : n)),
    }));

    expect(proxies.find((p) => p.id === 'test-node-1')?.name).toBe(updatedName);
    expect(groups.find((g) => g.id === targetGroupId)?.proxies).toContain(updatedName);
    expect(groups.find((g) => g.id === targetGroupId)?.proxies).not.toContain(oldName);

    // 4. Delete Node
    proxies = proxies.filter((p) => p.id !== 'test-node-1');
    groups = groups.map((g) => ({
      ...g,
      proxies: g.proxies.filter((n) => n !== updatedName),
    }));

    expect(proxies.some((p) => p.id === 'test-node-1')).toBe(false);
    expect(groups.find((g) => g.id === targetGroupId)?.proxies).not.toContain(updatedName);
  });

  it('策略组 CRUD 操作：新增、编辑、删除', () => {
    let groups: PolicyGroup[] = [...FALLBACK_ALL_POLICY_GROUPS];

    // 1. Create Group
    const newGroup: PolicyGroup = {
      id: 'grp-ai-services',
      name: '🤖 人工智能服务',
      type: 'select',
      proxies: ['ChatGPT', 'DIRECT'],
      description: '专用于 OpenAI / Claude / Gemini 分流',
    };
    groups.push(newGroup);
    expect(groups.some((g) => g.id === 'grp-ai-services')).toBe(true);

    // 2. Edit Group
    groups = groups.map((g) =>
      g.id === 'grp-ai-services'
        ? { ...g, type: 'url-test', tolerance: 30, interval: 300 }
        : g
    );
    const edited = groups.find((g) => g.id === 'grp-ai-services');
    expect(edited?.type).toBe('url-test');
    expect(edited?.tolerance).toBe(30);

    // 3. Delete Group
    groups = groups.filter((g) => g.id !== 'grp-ai-services');
    expect(groups.some((g) => g.id === 'grp-ai-services')).toBe(false);
  });

  it('分流规则 CRUD 操作：新增、编辑、停用/启用、删除', () => {
    let rules: TrafficRule[] = [...FALLBACK_ALL_RULES];

    // 1. Create Rule
    const customRule: TrafficRule = {
      id: 'rule-custom-github',
      type: 'DOMAIN-SUFFIX',
      payload: 'github.com',
      targetGroup: 'GitHub',
      comment: 'GitHub 极速访问',
      enabled: true,
      category: 'dev',
    };
    rules.unshift(customRule);
    expect(rules[0].id).toBe('rule-custom-github');

    // 2. Edit Rule
    rules = rules.map((r) =>
      r.id === 'rule-custom-github'
        ? { ...r, targetGroup: 'DIRECT', comment: 'GitHub 直连测试' }
        : r
    );
    const edited = rules.find((r) => r.id === 'rule-custom-github');
    expect(edited?.targetGroup).toBe('DIRECT');

    // 3. Toggle Enable/Disable
    rules = rules.map((r) =>
      r.id === 'rule-custom-github' ? { ...r, enabled: !r.enabled } : r
    );
    expect(rules.find((r) => r.id === 'rule-custom-github')?.enabled).toBe(false);

    // 4. Delete Rule
    rules = rules.filter((r) => r.id !== 'rule-custom-github');
    expect(rules.some((r) => r.id === 'rule-custom-github')).toBe(false);
  });
});
