import { RuleType, PolicyGroupType, ProxyType } from './openclash';

export type CanvasNodeType = 'inbound' | 'rule' | 'group' | 'outbound' | 'custom-rule';

export interface CanvasNodeData {
  id: string;
  type: CanvasNodeType;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // Step in the network pipeline
  step: 1 | 2 | 3 | 4;
  stepName: string;
  // Specific data references
  ruleType?: RuleType;
  payload?: string;
  targetGroup?: string;
  groupType?: PolicyGroupType;
  proxyCount?: number;
  nodeType?: ProxyType | 'direct' | 'reject';
  latency?: number;
  flag?: string;
  icon?: string;
  color?: string;
  enabled?: boolean;
  rawId?: string; // ID linking to TrafficRule, PolicyGroup, or ProxyNode
}

export interface CanvasEdge {
  id: string;
  fromNodeId: string;
  fromPort: 'out';
  toNodeId: string;
  toPort: 'in';
  active?: boolean;
  color?: string;
  label?: string;
  animated?: boolean;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface StepSimulationState {
  isActive: boolean;
  targetQuery: string;
  currentStep: number; // 0 (idle), 1 (inbound), 2 (rule), 3 (group), 4 (outbound)
  activeNodeIds: string[];
  activeEdgeIds: string[];
  explanation: string;
  details: {
    inbound?: string;
    matchedRule?: string;
    selectedGroup?: string;
    outboundNode?: string;
  };
}
