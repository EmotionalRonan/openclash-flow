import { TrafficRule, PolicyGroup, ProxyNode, SimulationResult } from '../types/openclash';

/**
 * Check if string is a valid IPv4 / IPv6
 */
export function isIpAddress(str: string): boolean {
  return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(str) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(str);
}

/**
 * Check if IP is in CIDR
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) return ip === cidr;
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);

  const ip2long = (addr: string) =>
    addr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;

  try {
    return (ip2long(ip) & mask) === (ip2long(range) & mask);
  } catch {
    return false;
  }
}

/**
 * Simulate the OpenClash / Mihomo rule evaluation pipeline for a given domain or IP
 */
export function simulateTrafficRoute(
  input: string,
  rules: TrafficRule[],
  groups: PolicyGroup[],
  proxies: ProxyNode[]
): SimulationResult {
  const target = input.trim().toLowerCase();
  const isDomain = !isIpAddress(target);
  const evaluationSteps: SimulationResult['evaluationSteps'] = [];

  let simulatedIp = isDomain ? '198.18.0.' + (Math.floor(Math.random() * 250) + 2) : target;

  // Step 1: DNS Resolution & Fake-IP interception
  if (isDomain) {
    evaluationSteps.push({
      step: 1,
      title: 'DNS 劫持与 Fake-IP 映射',
      detail: `域名 [${target}] 被 OpenClash 内置 Core DNS 拦截，分配 Fake-IP 池地址: ${simulatedIp} (TTL: 1s)`,
      status: 'pass',
    });
  } else {
    evaluationSteps.push({
      step: 1,
      title: '直接 IP 流量捕获',
      detail: `目标为物理 IP 地址 [${target}]，跳过 Fake-IP 映射，直接进入协议与网段规则匹配`,
      status: 'pass',
    });
  }

  // Step 2: Rule Cascade Matching
  let matchedRule: TrafficRule | undefined;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const payload = rule.payload.toLowerCase();

    // RULE-SET match (Clash / Mihomo rule-provider)
    if (rule.type === 'RULE-SET') {
      const setName = payload.split('/')[0].trim().toLowerCase();
      let matched = false;

      if (setName.includes('chatgpt') && /openai|chatgpt|oaistatic|sora/i.test(target)) matched = true;
      else if (setName.includes('claude') && /claude|anthropic/i.test(target)) matched = true;
      else if (setName.includes('gemini') && /gemini|bard|makersuite|deepmind/i.test(target)) matched = true;
      else if (setName.includes('copilot') && /copilot|githubcopilot/i.test(target)) matched = true;
      else if (setName.includes('perplexity') && /perplexity/i.test(target)) matched = true;
      else if (setName.includes('grok') && /x\.ai|grok/i.test(target)) matched = true;
      else if (setName.includes('groq') && /groq/i.test(target)) matched = true;
      else if (setName.includes('github') && /github|ghcr|raw\.githubusercontent/i.test(target)) matched = true;
      else if (setName.includes('youtube') && /youtube|ytimg|googlevideo|youtu\.be/i.test(target)) matched = true;
      else if (setName.includes('netflix') && /netflix|nflxvideo|nflximg|nflxext/i.test(target)) matched = true;
      else if (setName.includes('telegram') && /telegram|t\.me|tdesktop/i.test(target)) matched = true;
      else if (setName.includes('spotify') && /spotify|scdn/i.test(target)) matched = true;
      else if (setName.includes('steam') && /steam|valve|steamstatic/i.test(target)) matched = true;
      else if (setName.includes('bilibili') && /bilibili|biliapi|hdslb/i.test(target)) matched = true;
      else if (setName.includes('apple') && /apple|icloud|itunes|mzstatic/i.test(target)) matched = true;
      else if (setName.includes('google') && /google|gmail|gstatic|android/i.test(target)) matched = true;
      else if (setName.includes('microsoft') && /microsoft|azure|msn|windows|live\.com/i.test(target)) matched = true;
      else if (setName.includes('block') && /adservice|telemetry|track|doubleclick|pagead/i.test(target)) matched = true;
      else if (setName.includes('china') || setName.includes('direct')) {
        if (target.endsWith('.cn') || /baidu|qq|aliyun|taobao|jd|163|weibo|zhihu|bilibili/i.test(target)) matched = true;
      }

      if (matched) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则集命中: RULE-SET, ${rule.payload}`,
          detail: `目标 [${target}] 命中规则集 [${rule.payload}]，路由流向策略组: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // DOMAIN-SUFFIX match
    if (rule.type === 'DOMAIN-SUFFIX') {
      if (isDomain && (target === payload || target.endsWith('.' + payload))) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则命中: DOMAIN-SUFFIX, ${rule.payload}`,
          detail: `目标域名 [${target}] 与后缀规则 [${rule.payload}] 精确匹配，路由目标: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // DOMAIN-KEYWORD match
    if (rule.type === 'DOMAIN-KEYWORD') {
      if (isDomain && target.includes(payload)) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则命中: DOMAIN-KEYWORD, ${rule.payload}`,
          detail: `目标域名 [${target}] 包含关键字 [${rule.payload}]，路由目标: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // DOMAIN exact match
    if (rule.type === 'DOMAIN') {
      if (isDomain && target === payload) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则命中: DOMAIN, ${rule.payload}`,
          detail: `目标域名 [${target}] 完全相等匹配，路由目标: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // IP-CIDR match
    if (rule.type === 'IP-CIDR') {
      if (isIpInCidr(simulatedIp, payload) || (!isDomain && isIpInCidr(target, payload))) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则命中: IP-CIDR, ${rule.payload}`,
          detail: `目标 IP [${simulatedIp}] 属于网段 [${rule.payload}]，路由目标: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // GEOIP CN match
    if (rule.type === 'GEOIP' && payload === 'cn') {
      const isCnDomain = target.endsWith('.cn') || /bilibili|baidu|qq|aliyun|taobao|jd|163|weibo|zhihu/i.test(target);
      if (isCnDomain || isIpInCidr(simulatedIp, '114.114.114.114/32') || isIpInCidr(simulatedIp, '223.5.5.5/32')) {
        matchedRule = rule;
        evaluationSteps.push({
          step: 2,
          title: `规则命中: GEOIP, CN`,
          detail: `经 GeoIP.dat 数据库查询，目标归属于中国大陆 IP/域名列表，路由目标: ${rule.targetGroup}`,
          status: 'hit',
        });
        break;
      }
    }

    // MATCH Fallback
    if (rule.type === 'MATCH') {
      matchedRule = rule;
      evaluationSteps.push({
        step: 2,
        title: `规则兜底: MATCH (默认策略)`,
        detail: `所有前置特定规则均未命中，触发最终兜底规则 MATCH，路由目标: ${rule.targetGroup}`,
        status: 'hit',
      });
      break;
    }
  }

  // If somehow nothing matched
  if (!matchedRule) {
    matchedRule = {
      id: 'fallback-match',
      type: 'MATCH',
      payload: '',
      targetGroup: '🚀 节点选择 (PROXY)',
      enabled: true,
    };
    evaluationSteps.push({
      step: 2,
      title: '未命中任何规则 -> 兜底代理',
      detail: '根据 OpenClash 默认配置，未显式匹配的流量流向 PROXY 策略组',
      status: 'hit',
    });
  }

  // Step 3: Policy Group Resolution
  const targetGroupName = matchedRule.targetGroup;
  let finalNode: ProxyNode | { name: string; type: string; latency?: number } | undefined;

  if (targetGroupName.includes('DIRECT')) {
    finalNode = { name: 'DIRECT (直连出站)', type: 'direct', latency: 8 };
    evaluationSteps.push({
      step: 3,
      title: '策略组解析: DIRECT (直连)',
      detail: '流量绕过所有代理节点，由 ImmortalWRT WAN 口路由网关直接发出',
      status: 'final',
    });
  } else if (targetGroupName.includes('REJECT')) {
    finalNode = { name: 'REJECT (阻止连接)', type: 'reject', latency: 0 };
    evaluationSteps.push({
      step: 3,
      title: '策略组解析: REJECT (拦截)',
      detail: 'DNS 响应 0.0.0.0 或 TCP RST 连接重置，广告与恶意流量已成功阻断',
      status: 'final',
    });
  } else {
    // Find matching policy group
    const foundGroup = groups.find((g) => g.name === targetGroupName || targetGroupName.includes(g.id));
    
    if (foundGroup) {
      // Pick first valid proxy node in group or lowest latency
      const candidateNames = foundGroup.proxies;
      const matchedProxies = proxies.filter((p) => candidateNames.includes(p.name));

      if (foundGroup.type === 'url-test') {
        // pick lowest latency
        const sorted = [...matchedProxies].sort((a, b) => (a.latency || 999) - (b.latency || 999));
        finalNode = sorted[0] || proxies[0];
        evaluationSteps.push({
          step: 3,
          title: `策略组解析: ${foundGroup.name} (URL-Test 自动优选)`,
          detail: `组类型为自动测速，当前探测延迟最低可用节点为 [${finalNode?.name}] (${finalNode?.latency}ms)`,
          status: 'pass',
        });
      } else if (foundGroup.type === 'fallback') {
        const firstValid = candidateNames.map((n) => proxies.find((p) => p.name === n)).find(Boolean);
        finalNode = firstValid || proxies[0];
        evaluationSteps.push({
          step: 3,
          title: `策略组解析: ${foundGroup.name} (Fallback 故障转移)`,
          detail: `主节点 [${finalNode?.name}] 健康检查在线，选为主出口`,
          status: 'pass',
        });
      } else {
        // selector - prioritize the first configured proxy in the group
        const firstValid = candidateNames.map((n) => proxies.find((p) => p.name === n)).find(Boolean);
        finalNode = firstValid || proxies[0];
        evaluationSteps.push({
          step: 3,
          title: `策略组解析: ${foundGroup.name} (手动选择)`,
          detail: `当前策略组绑定激活出站节点: [${finalNode?.name}] (${finalNode?.type?.toUpperCase()})`,
          status: 'pass',
        });
      }
    } else {
      finalNode = proxies[0] || { name: '默认代理', type: 'vless', latency: 30 };
      evaluationSteps.push({
        step: 3,
        title: `策略组出站: ${targetGroupName}`,
        detail: `路由至选定节点 [${finalNode.name}]`,
        status: 'pass',
      });
    }

    // Final Node Execution Step
    evaluationSteps.push({
      step: 4,
      title: `物理出站链路: [${finalNode?.name}]`,
      detail: `协议: ${(finalNode as any)?.type?.toUpperCase() || 'PROXY'} | 目标真实地址已加密隧道转发 | 预估往返延迟: ${(finalNode as any)?.latency || 35}ms`,
      status: 'final',
    });
  }

  return {
    target,
    isDomain,
    dnsResolvedIp: simulatedIp,
    dnsMode: 'Fake-IP (198.18.0.0/16)',
    matchedRule,
    targetGroup: targetGroupName,
    selectedNode: finalNode,
    evaluationSteps,
  };
}
