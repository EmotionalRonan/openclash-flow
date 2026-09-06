import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  CanvasNodeData, 
  CanvasEdge, 
  StepSimulationState,
  CanvasNodeType 
} from '../../types/canvas';
import { PolicyGroup, TrafficRule, ProxyNode, RuleCategoryItem, RuleType } from '../../types/openclash';
import { CanvasNodeCard } from './CanvasNodeCard';
import { CanvasWire } from './CanvasWire';
import { CanvasMinimap } from './CanvasMinimap';
import { StepSimulatorBar } from './StepSimulatorBar';
import { CanvasPaletteDrawer } from './CanvasPaletteDrawer';
import { NodeEditModal } from './NodeEditModal';
import { EdgeEditModal } from './EdgeEditModal';
import { simulateTrafficRoute } from '../../utils/ruleMatcher';
import { useTheme } from '../../context/ThemeContext';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Move, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Layers, 
  Check, 
  ShieldCheck,
  Grid,
  RotateCcw,
  Zap
} from 'lucide-react';

interface InfiniteFlowCanvasProps {
  policyGroups: PolicyGroup[];
  setPolicyGroups: React.Dispatch<React.SetStateAction<PolicyGroup[]>>;
  rules: TrafficRule[];
  setRules: React.Dispatch<React.SetStateAction<TrafficRule[]>>;
  proxies: ProxyNode[];
}

export const InfiniteFlowCanvas: React.FC<InfiniteFlowCanvasProps> = ({
  policyGroups,
  setPolicyGroups,
  rules,
  setRules,
  proxies,
}) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport transformation: Pan and Zoom (adaptive to screen width)
  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return { x: 15, y: 15 };
    }
    return { x: 40, y: 30 };
  });

  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 0.52;
      if (window.innerWidth < 1024) return 0.68;
    }
    return 0.85;
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Zoom & Pan refs for non-passive wheel listener
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Touch panning & pinch zoom tracking
  const touchStateRef = useRef<{
    dist: number;
    initialZoom: number;
  }>({ dist: 0, initialZoom: 0.85 });

  // Nodes & Edges on canvas
  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);

  // Selection & Modal Editing State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CanvasNodeData | null>(null);
  const [editingEdge, setEditingEdge] = useState<CanvasEdge | null>(null);

  // Dragging a node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Port Connecting Interaction
  const [connectingPort, setConnectingPort] = useState<{
    nodeId: string;
    portType: 'in' | 'out';
    startX: number;
    startY: number;
  } | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Palette drawer (collapsed on tablet/mobile by default to maximize canvas space)
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
  });

  // Simulation State
  const [simState, setSimState] = useState<StepSimulationState>({
    isActive: false,
    targetQuery: 'api.openai.com',
    currentStep: 0,
    activeNodeIds: [],
    activeEdgeIds: [],
    explanation: '',
    details: {},
  });
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // 1. Initialize Layout Algorithm to place nodes in 4 Pipeline Stage Columns
  const autoLayoutNodes = useCallback(() => {
    const newNodes: CanvasNodeData[] = [];
    const newEdges: CanvasEdge[] = [];

    // Step 1: Inbound Node
    const inboundNode: CanvasNodeData = {
      id: 'inbound-core',
      type: 'inbound',
      title: '局域网流量入口 (Inbound)',
      subtitle: 'Fake-IP DNS 劫持 + TUN 虚拟网卡',
      x: 60,
      y: 180,
      width: 250,
      height: 150,
      step: 1,
      stepName: '流量捕获',
    };
    newNodes.push(inboundNode);

    // Step 2: Rule Nodes (Top rules)
    const activeRules = rules.slice(0, 7); // Display primary rules cleanly on canvas
    activeRules.forEach((rule, idx) => {
      const ruleNode: CanvasNodeData = {
        id: `node-rule-${rule.id}`,
        type: rule.id.startsWith('custom') ? 'custom-rule' : 'rule',
        title: rule.comment || rule.payload,
        subtitle: `匹配: ${rule.payload}`,
        x: 440,
        y: 40 + idx * 145,
        width: 260,
        height: 125,
        step: 2,
        stepName: '分流规则',
        ruleType: rule.type,
        payload: rule.payload,
        targetGroup: rule.targetGroup,
        enabled: rule.enabled,
        rawId: rule.id,
      };
      newNodes.push(ruleNode);

      // Inbound -> Rule edge
      newEdges.push({
        id: `edge-inbound-${rule.id}`,
        fromNodeId: inboundNode.id,
        fromPort: 'out',
        toNodeId: ruleNode.id,
        toPort: 'in',
        color: '#475569',
      });
    });

    // Step 3: Policy Groups
    policyGroups.slice(0, 6).forEach((group, idx) => {
      const groupNode: CanvasNodeData = {
        id: `node-group-${group.id}`,
        type: 'group',
        title: group.name,
        subtitle: group.description || '策略分流调度组',
        x: 840,
        y: 40 + idx * 145,
        width: 260,
        height: 125,
        step: 3,
        stepName: '策略调度',
        groupType: group.type,
        proxyCount: group.proxies.length,
        rawId: group.id,
      };
      newNodes.push(groupNode);
    });

    // Step 4: Outbound Proxies
    proxies.slice(0, 6).forEach((proxy, idx) => {
      const outboundNode: CanvasNodeData = {
        id: `node-proxy-${proxy.id}`,
        type: 'outbound',
        title: proxy.name,
        subtitle: `${proxy.server}:${proxy.port}`,
        x: 1240,
        y: 40 + idx * 145,
        width: 250,
        height: 125,
        step: 4,
        stepName: '物理出口',
        nodeType: proxy.type,
        latency: proxy.latency,
        flag: proxy.flag,
        rawId: proxy.id,
      };
      newNodes.push(outboundNode);
    });

    // Direct and Reject sinks
    const directSink: CanvasNodeData = {
      id: 'node-sink-direct',
      type: 'outbound',
      title: '🇨🇳 DIRECT 直连',
      subtitle: '国内流量直通 WAN 网关',
      x: 1240,
      y: 40 + proxies.slice(0, 6).length * 145,
      width: 250,
      height: 110,
      step: 4,
      stepName: '直连网关',
      nodeType: 'direct',
    };
    newNodes.push(directSink);

    // Dynamic Connections between Rules -> Groups
    activeRules.forEach((rule) => {
      const matchingGroup = policyGroups.find((g) => g.name === rule.targetGroup);
      if (matchingGroup) {
        newEdges.push({
          id: `edge-rule-${rule.id}-group-${matchingGroup.id}`,
          fromNodeId: `node-rule-${rule.id}`,
          fromPort: 'out',
          toNodeId: `node-group-${matchingGroup.id}`,
          toPort: 'in',
          color: '#6366f1',
        });
      }
    });

    // Dynamic Connections between Groups -> Outbounds
    policyGroups.slice(0, 6).forEach((group) => {
      group.proxies.forEach((proxyName) => {
        const matchingProxy = proxies.find((p) => p.name === proxyName);
        if (matchingProxy) {
          newEdges.push({
            id: `edge-group-${group.id}-proxy-${matchingProxy.id}`,
            fromNodeId: `node-group-${group.id}`,
            fromPort: 'out',
            toNodeId: `node-proxy-${matchingProxy.id}`,
            toPort: 'in',
            color: '#8b5cf6',
          });
        } else if (proxyName === 'DIRECT') {
          newEdges.push({
            id: `edge-group-${group.id}-direct`,
            fromNodeId: `node-group-${group.id}`,
            fromPort: 'out',
            toNodeId: directSink.id,
            toPort: 'in',
            color: '#0ea5e9',
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [rules, policyGroups, proxies]);

  // Initial layout effect
  useEffect(() => {
    autoLayoutNodes();
  }, [autoLayoutNodes]);

  // Fit view calculation to center and scale all nodes into container
  const fitView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    if (!containerWidth || !containerHeight) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + (n.width || 260));
      maxY = Math.max(maxY, n.y + (n.height || 140));
    });

    const isSmallScreen = containerWidth < 640;
    const padding = isSmallScreen ? 20 : 50;
    const boxWidth = maxX - minX + padding * 2;
    const boxHeight = maxY - minY + padding * 2;

    const scaleX = containerWidth / Math.max(boxWidth, 100);
    const scaleY = containerHeight / Math.max(boxHeight, 100);
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.32), 1.15);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = containerWidth / 2 - centerX * targetZoom;
    const newPanY = containerHeight / 2 - centerY * targetZoom;

    setZoom(Number(targetZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [nodes]);

  // Listen to window resize to ensure canvas remains accessible
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && isPaletteOpen) {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPaletteOpen]);

  // Viewport Pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background directly
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  // Touch handlers for mobile & tablet (Pan and Pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        dist,
        initialZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    } else if (e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStateRef.current.dist > 0) {
        const ratio = currentDist / touchStateRef.current.dist;
        const newZoom = Math.min(Math.max(touchStateRef.current.initialZoom * ratio, 0.32), 2.0);
        setZoom(Number(newZoom.toFixed(2)));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleQuickAddPreset = (item: RuleCategoryItem) => {
    const newRuleId = `custom-rule-${Date.now()}`;
    const targetGroup = policyGroups[0]?.name || '🚀 节点选择 (PROXY)';
    const newRule: TrafficRule = {
      id: newRuleId,
      type: item.type,
      payload: item.payload,
      targetGroup,
      comment: item.title,
      enabled: true,
      category: item.category,
    };

    setRules((prev) => [newRule, ...prev]);

    // Position in Step 2 column below existing rules
    const existingRuleNodes = nodes.filter((n) => n.step === 2);
    const newY = existingRuleNodes.length > 0
      ? Math.max(...existingRuleNodes.map((n) => n.y)) + 140
      : 80;

    const newNode: CanvasNodeData = {
      id: `node-rule-${newRuleId}`,
      type: 'custom-rule',
      title: item.title,
      subtitle: `${item.type} ${item.payload}`,
      x: 440,
      y: newY,
      width: 260,
      height: 120,
      step: 2,
      stepName: '分流规则',
      ruleType: item.type,
      payload: item.payload,
      targetGroup,
      rawId: newRuleId,
    };

    setNodes((prev) => [...prev, newNode]);

    const groupNode = nodes.find((n) => n.step === 3 && n.title === targetGroup);
    if (groupNode) {
      setEdges((prev) => [
        ...prev,
        {
          id: `edge-${newNode.id}-${groupNode.id}-${Date.now()}`,
          fromNodeId: newNode.id,
          fromPort: 'out',
          toNodeId: groupNode.id,
          toPort: 'in',
          color: '#10b981',
        },
      ]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    // Dragging a node
    if (draggedNodeId) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        // Convert screen mouse position to world coordinates taking zoom and pan into account
        const worldX = (e.clientX - containerRect.left - pan.x) / zoom - nodeDragOffset.x;
        const worldY = (e.clientY - containerRect.top - pan.y) / zoom - nodeDragOffset.y;

        setNodes((prev) =>
          prev.map((n) => (n.id === draggedNodeId ? { ...n, x: worldX, y: worldY } : n))
        );
      }
    }

    // Connecting port line
    if (connectingPort) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const worldX = (e.clientX - containerRect.left - pan.x) / zoom;
        const worldY = (e.clientY - containerRect.top - pan.y) / zoom;
        setConnectingMousePos({ x: worldX, y: worldY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    setConnectingPort(null);
  };

  // Global mouseup safety to ensure drag and pan terminate even if mouse is released outside container
  useEffect(() => {
    if (!draggedNodeId && !isPanning && !connectingPort) return;

    const onGlobalMouseUp = () => {
      setDraggedNodeId(null);
      setIsPanning(false);
      setConnectingPort(null);
    };

    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [draggedNodeId, isPanning, connectingPort]);

  // Native non-passive Wheel Zoom to prevent browser "Unable to preventDefault inside passive event listener invocation" error
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Safely prevent page scrolling while zooming on the canvas
      e.preventDefault();

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.35), 2.0);

      const containerRect = container.getBoundingClientRect();
      if (!containerRect) return;

      // Zoom centered towards mouse cursor
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
      const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNodeData) => {
    e.stopPropagation();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const worldMouseX = (e.clientX - containerRect.left - pan.x) / zoom;
    const worldMouseY = (e.clientY - containerRect.top - pan.y) / zoom;

    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggedNodeId(node.id);
    setNodeDragOffset({
      x: worldMouseX - node.x,
      y: worldMouseY - node.y,
    });
  };

  // Port Connecting Start
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portType: 'in' | 'out') => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const startX = portType === 'out' ? node.x + node.width : node.x;
    const startY = node.y + (node.height || 140) / 2;

    setConnectingPort({ nodeId, portType, startX, startY });
    setConnectingMousePos({ x: startX, y: startY });
  };

  // Port Connecting Drop/Complete
  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string, targetPortType: 'in' | 'out') => {
    if (!connectingPort) return;
    if (connectingPort.nodeId === targetNodeId) return; // Cannot connect to self

    const sourceNode = nodes.find((n) => n.id === connectingPort.nodeId);
    const targetNode = nodes.find((n) => n.id === targetNodeId);

    if (!sourceNode || !targetNode) return;

    // Validate Pipeline Step Order: Only allow Step N -> Step N+1 or connecting to next logical stages
    let fromNode = connectingPort.portType === 'out' ? sourceNode : targetNode;
    let toNode = connectingPort.portType === 'out' ? targetNode : sourceNode;

    if (fromNode.step >= toNode.step) {
      // Inverted or invalid connection
      setConnectingPort(null);
      return;
    }

    // Handle Rule -> PolicyGroup connection
    if (fromNode.type === 'rule' || fromNode.type === 'custom-rule') {
      if (toNode.type === 'group') {
        const targetGroupName = toNode.title;
        // Update OpenClash TrafficRule state
        if (fromNode.rawId) {
          setRules((prev) =>
            prev.map((r) => (r.id === fromNode.rawId ? { ...r, targetGroup: targetGroupName } : r))
          );
        }
        // Update local node & edge
        setNodes((prev) =>
          prev.map((n) => (n.id === fromNode.id ? { ...n, targetGroup: targetGroupName } : n))
        );
      }
    }

    // Handle PolicyGroup -> Outbound connection
    if (fromNode.type === 'group' && toNode.type === 'outbound') {
      const proxyName = toNode.title;
      if (fromNode.rawId) {
        setPolicyGroups((prev) =>
          prev.map((g) => {
            if (g.id === fromNode.rawId) {
              if (!g.proxies.includes(proxyName)) {
                return { ...g, proxies: [...g.proxies, proxyName] };
              }
            }
            return g;
          })
        );
      }
    }

    // Add Edge to canvas
    const newEdgeId = `edge-${fromNode.id}-${toNode.id}-${Date.now()}`;
    setEdges((prev) => [
      ...prev.filter((e) => !(e.fromNodeId === fromNode.id && e.toNodeId === toNode.id)),
      {
        id: newEdgeId,
        fromNodeId: fromNode.id,
        fromPort: 'out',
        toNodeId: toNode.id,
        toPort: 'in',
        color: '#10b981',
      },
    ]);

    setConnectingPort(null);
  };

  // Delete an edge
  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
    if (editingEdge?.id === edgeId) setEditingEdge(null);
  };

  // Delete a custom rule node
  const handleDeleteNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.rawId) {
      setRules((prev) => prev.filter((r) => r.id !== node.rawId));
    }
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (editingNode?.id === nodeId) setEditingNode(null);
  };

  // Edit & Selection Handlers
  const handleEditNode = (node: CanvasNodeData) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setEditingNode(node);
  };

  const handleSaveNode = (updatedNode: CanvasNodeData) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));

    // Sync to OpenClash state if rule
    if (updatedNode.type === 'rule' || updatedNode.type === 'custom-rule') {
      if (updatedNode.rawId) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === updatedNode.rawId
              ? {
                  ...r,
                  comment: updatedNode.title,
                  type: updatedNode.ruleType || r.type,
                  payload: updatedNode.payload || r.payload,
                  targetGroup: updatedNode.targetGroup || r.targetGroup,
                  enabled: updatedNode.enabled !== false,
                }
              : r
          )
        );
      }

      // If target group changed, update canvas edge
      if (updatedNode.targetGroup) {
        const matchingGroupNode = nodes.find(
          (n) => n.type === 'group' && n.title === updatedNode.targetGroup
        );
        if (matchingGroupNode) {
          setEdges((prev) => {
            const hasExisting = prev.some((e) => e.fromNodeId === updatedNode.id);
            if (hasExisting) {
              return prev.map((e) =>
                e.fromNodeId === updatedNode.id ? { ...e, toNodeId: matchingGroupNode.id } : e
              );
            } else {
              return [
                ...prev,
                {
                  id: `edge-${updatedNode.id}-${matchingGroupNode.id}-${Date.now()}`,
                  fromNodeId: updatedNode.id,
                  fromPort: 'out',
                  toNodeId: matchingGroupNode.id,
                  toPort: 'in',
                  color: '#6366f1',
                },
              ];
            }
          });
        }
      }
    }

    // Sync to OpenClash state if group
    if (updatedNode.type === 'group' && updatedNode.rawId) {
      setPolicyGroups((prev) =>
        prev.map((g) =>
          g.id === updatedNode.rawId
            ? {
                ...g,
                name: updatedNode.title,
                type: updatedNode.groupType || g.type,
              }
            : g
        )
      );
    }
  };

  const handleSelectEdge = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  };

  const handleEditEdge = (edge: CanvasEdge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setEditingEdge(edge);
  };

  const handleSaveEdge = (updatedEdge: CanvasEdge, newTargetNodeId?: string) => {
    const finalTargetId = newTargetNodeId || updatedEdge.toNodeId;
    setEdges((prev) =>
      prev.map((e) =>
        e.id === updatedEdge.id ? { ...updatedEdge, toNodeId: finalTargetId } : e
      )
    );

    // If target node was changed, update OpenClash rule target group if the source is a rule
    const fromNode = nodes.find((n) => n.id === updatedEdge.fromNodeId);
    const toNode = nodes.find((n) => n.id === finalTargetId);
    if (
      fromNode &&
      toNode &&
      (fromNode.type === 'rule' || fromNode.type === 'custom-rule') &&
      toNode.type === 'group'
    ) {
      if (fromNode.rawId) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === fromNode.rawId ? { ...r, targetGroup: toNode.title } : r
          )
        );
      }
      setNodes((prev) =>
        prev.map((n) => (n.id === fromNode.id ? { ...n, targetGroup: toNode.title } : n))
      );
    }
  };

  // Drag over canvas to drop preset from palette
  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Drop preset directly onto infinite canvas
  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const payload = JSON.parse(dataStr);
      if (payload.type === 'preset') {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // Calculate drop coordinates in world space
        const dropX = (e.clientX - containerRect.left - pan.x) / zoom;
        const dropY = (e.clientY - containerRect.top - pan.y) / zoom;

        // Add as a new rule
        const newRuleId = `custom-rule-${Date.now()}`;
        const newRule: TrafficRule = {
          id: newRuleId,
          type: 'DOMAIN-SUFFIX',
          payload: payload.id || 'custom.domain.com',
          targetGroup: policyGroups[0]?.name || '🚀 节点选择 (PROXY)',
          comment: payload.id,
          enabled: true,
          category: 'custom',
        };

        setRules((prev) => [newRule, ...prev]);

        // Add node to canvas directly at drop point
        const newNode: CanvasNodeData = {
          id: `node-rule-${newRuleId}`,
          type: 'custom-rule',
          title: payload.id,
          subtitle: `匹配: ${payload.id}`,
          x: dropX,
          y: dropY,
          width: 260,
          height: 120,
          step: 2,
          stepName: '分流规则',
          ruleType: 'DOMAIN-SUFFIX',
          payload: payload.id,
          targetGroup: newRule.targetGroup,
          rawId: newRuleId,
        };

        setNodes((prev) => [...prev, newNode]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom rule node from Drawer
  const handleAddCustomNode = (
    type: RuleType,
    payload: string,
    title: string,
    category: any
  ) => {
    const newRuleId = `custom-rule-${Date.now()}`;
    const targetGroup = policyGroups[0]?.name || '🚀 节点选择 (PROXY)';
    const newRule: TrafficRule = {
      id: newRuleId,
      type,
      payload,
      targetGroup,
      comment: title,
      enabled: true,
      category,
    };

    setRules((prev) => [newRule, ...prev]);

    // Position in Step 2 column below existing rules
    const existingRuleNodes = nodes.filter((n) => n.step === 2);
    const newY = existingRuleNodes.length > 0
      ? Math.max(...existingRuleNodes.map((n) => n.y)) + 140
      : 80;

    const newNode: CanvasNodeData = {
      id: `node-rule-${newRuleId}`,
      type: 'custom-rule',
      title,
      subtitle: `${type} ${payload}`,
      x: 440,
      y: newY,
      width: 260,
      height: 120,
      step: 2,
      stepName: '分流规则',
      ruleType: type,
      payload,
      targetGroup,
      rawId: newRuleId,
    };

    setNodes((prev) => [...prev, newNode]);
  };

  // Step Simulation Logic
  const startSimulation = () => {
    const query = simState.targetQuery.trim();
    if (!query) return;

    // Step 1: Inbound packet arriving
    const inboundNode = nodes.find((n) => n.step === 1);
    
    // Evaluate rule match engine
    const matchRes = simulateTrafficRoute(query, rules, policyGroups, proxies);
    const matchedRule = matchRes.matchedRule;
    const targetGroupName = matchRes.targetGroup || '🚀 节点选择 (PROXY)';
    const selectedProxy = matchRes.selectedNode;

    // Find canvas nodes matching simulation results
    let matchedRuleNode = nodes.find(
      (n) => n.step === 2 && matchedRule && (n.rawId === matchedRule.id || (n.ruleType === matchedRule.type && n.payload === matchedRule.payload))
    );
    if (!matchedRuleNode) {
      matchedRuleNode = nodes.find((n) => {
        if (n.step !== 2 || !n.payload) return false;
        const p = n.payload.toLowerCase();
        const q = query.toLowerCase();
        if (n.ruleType === 'DOMAIN-SUFFIX') return q.endsWith(p);
        if (n.ruleType === 'DOMAIN-KEYWORD') return q.includes(p);
        if (n.ruleType === 'DOMAIN') return q === p;
        return false;
      }) || nodes.find((n) => n.step === 2);
    }

    const matchedGroupNode = nodes.find((n) => n.step === 3 && n.title === targetGroupName) || nodes.find((n) => n.step === 3);
    const matchingProxyNode = nodes.find((n) => n.step === 4 && selectedProxy && n.title === selectedProxy.name) ||
      nodes.find((n) => n.step === 4) ||
      nodes.find((n) => n.type === 'outbound');

    const fakeIp = matchRes.dnsResolvedIp || '198.18.0.42';

    setSimState({
      isActive: true,
      targetQuery: query,
      currentStep: 1,
      activeNodeIds: inboundNode ? [inboundNode.id] : [],
      activeEdgeIds: [],
      explanation: `Step 1: 局域网终端发起对 ${query} 的访问请求，被 OpenClash Fake-IP DNS 劫持并分配虚拟 IP (${fakeIp})，由 utun 网卡注入内核。`,
      details: {
        inbound: `Fake-IP 劫持 -> ${fakeIp} (:443)`,
        matchedRule: matchedRule ? `${matchedRule.type}, ${matchedRule.payload}` : (matchedRuleNode ? `${matchedRuleNode.ruleType} ${matchedRuleNode.payload}` : 'MATCH (兜底)'),
        selectedGroup: targetGroupName,
        outboundNode: selectedProxy?.name || matchingProxyNode?.title || '🇭🇰 香港 IPLC 01',
      },
    });
  };

  const nextSimulationStep = () => {
    const nextStep = simState.currentStep + 1;
    if (nextStep > 4) return;

    const query = simState.targetQuery.trim();
    const inboundNode = nodes.find((n) => n.step === 1);
    
    // Evaluate rule match engine
    const matchRes = simulateTrafficRoute(query, rules, policyGroups, proxies);
    const matchedRule = matchRes.matchedRule;
    const targetGroupName = matchRes.targetGroup || '🚀 节点选择 (PROXY)';
    const selectedProxy = matchRes.selectedNode;

    let matchedRuleNode = nodes.find(
      (n) => n.step === 2 && matchedRule && (n.rawId === matchedRule.id || (n.ruleType === matchedRule.type && n.payload === matchedRule.payload))
    );
    if (!matchedRuleNode) {
      matchedRuleNode = nodes.find((n) => {
        if (n.step !== 2 || !n.payload) return false;
        const p = n.payload.toLowerCase();
        const q = query.toLowerCase();
        if (n.ruleType === 'DOMAIN-SUFFIX') return q.endsWith(p);
        if (n.ruleType === 'DOMAIN-KEYWORD') return q.includes(p);
        if (n.ruleType === 'DOMAIN') return q === p;
        return false;
      }) || nodes.find((n) => n.step === 2);
    }

    const matchedGroupNode = nodes.find((n) => n.step === 3 && n.title === targetGroupName) || nodes.find((n) => n.step === 3);
    const matchingProxyNode = nodes.find((n) => n.step === 4 && selectedProxy && n.title === selectedProxy.name) ||
      nodes.find((n) => n.step === 4);

    if (nextStep === 2) {
      const activeEdge = edges.find(
        (e) => e.fromNodeId === inboundNode?.id && e.toNodeId === matchedRuleNode?.id
      );
      const ruleText = matchedRule ? `${matchedRule.type}, ${matchedRule.payload}` : `${matchedRuleNode?.ruleType} ${matchedRuleNode?.payload}`;
      setSimState((prev) => ({
        ...prev,
        currentStep: 2,
        activeNodeIds: [matchedRuleNode?.id || ''],
        activeEdgeIds: activeEdge ? [activeEdge.id] : [],
        explanation: `Step 2: Clash 核心引擎扫描分流规则，精准命中 [${ruleText}]，指定路由目标策略组为 [${targetGroupName}]。`,
      }));
    } else if (nextStep === 3) {
      const activeEdge = edges.find(
        (e) => e.fromNodeId === matchedRuleNode?.id && e.toNodeId === matchedGroupNode?.id
      );
      const groupType = matchedGroupNode?.groupType || 'select';
      setSimState((prev) => ({
        ...prev,
        currentStep: 3,
        activeNodeIds: [matchedGroupNode?.id || ''],
        activeEdgeIds: activeEdge ? [activeEdge.id] : [],
        explanation: `Step 3: 策略组 [${matchedGroupNode?.title || targetGroupName}] 依据调度策略 (${groupType})，从可用节点列表中优选最优物理出站节点。`,
      }));
    } else if (nextStep === 4) {
      const activeEdge = edges.find(
        (e) => e.fromNodeId === matchedGroupNode?.id && e.toNodeId === matchingProxyNode?.id
      );
      const nodeTitle = selectedProxy?.name || matchingProxyNode?.title || '出口节点';
      const latency = selectedProxy?.latency || matchingProxyNode?.latency || 28;
      setSimState((prev) => ({
        ...prev,
        currentStep: 4,
        activeNodeIds: [matchingProxyNode?.id || ''],
        activeEdgeIds: activeEdge ? [activeEdge.id] : [],
        explanation: `Step 4: 流量已建立加密握手，通过物理出口 [${nodeTitle}] (实测延迟 ${latency}ms) 发送至目标服务器！`,
      }));
      setIsAutoPlaying(false);
    }
  };

  const resetSimulation = () => {
    setIsAutoPlaying(false);
    setSimState({
      isActive: false,
      targetQuery: 'api.openai.com',
      currentStep: 0,
      activeNodeIds: [],
      activeEdgeIds: [],
      explanation: '',
      details: {},
    });
  };

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && simState.isActive) {
      if (simState.currentStep < 4) {
        timer = setTimeout(() => {
          nextSimulationStep();
        }, 1400);
      } else {
        setIsAutoPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, simState.isActive, simState.currentStep]);

  return (
    <div className="space-y-4">
      {/* Step Simulation Controls Toolbar */}
      <StepSimulatorBar
        simState={simState}
        onTargetChange={(q) => setSimState((prev) => ({ ...prev, targetQuery: q }))}
        onStartSimulation={startSimulation}
        onNextStep={nextSimulationStep}
        onResetSimulation={resetSimulation}
        onToggleAutoPlay={() => {
          if (!simState.isActive) startSimulation();
          setIsAutoPlaying(!isAutoPlaying);
        }}
        isAutoPlaying={isAutoPlaying}
      />

      {/* Main Infinite Canvas Box */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragOver={handleDragOverCanvas}
        onDrop={handleDropOnCanvas}
        style={{
          backgroundImage:
            resolvedTheme === 'dark'
              ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
              : 'radial-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        className="relative w-full h-[480px] sm:h-[580px] lg:h-[calc(100vh-270px)] min-h-[480px] max-h-[860px] bg-[#f2f3f7] dark:bg-[#090a10] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden select-none cursor-default shadow-2xl touch-none transition-colors"
      >
        {/* Floating Canvas Navigation Toolbar */}
        <div className="absolute top-3 sm:top-4 right-2 sm:right-4 z-30 flex items-center gap-1 sm:gap-1.5 apple-glass border border-black/[0.08] dark:border-white/[0.1] p-1 sm:p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            className="p-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] apple-press transition-colors"
            title="放大画布 (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.32, Number((z - 0.15).toFixed(2))))}
            className="p-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] apple-press transition-colors"
            title="缩小画布 (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={fitView}
            className="flex items-center gap-1 p-1.5 px-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] text-[#1d1d1f] dark:text-[#d4d4d8] hover:text-black dark:hover:text-white apple-press transition-colors text-xs font-semibold"
            title="自适应所有节点居中缩放"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">自适应</span>
          </button>
          <button
            onClick={() => {
              setZoom(0.85);
              setPan({ x: 40, y: 30 });
            }}
            className="p-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] text-[#1d1d1f] dark:text-[#d4d4d8] hover:text-black dark:hover:text-white apple-press transition-colors font-mono text-xs font-semibold px-2"
            title="重置缩放比例为 85%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <div className="w-[1px] h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-0.5" />
          <button
            onClick={() => {
              autoLayoutNodes();
              setTimeout(fitView, 50);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
            title="一键根据 OpenClash 管道自动重排拓扑并居中"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">整理布局</span>
          </button>
        </div>

        {/* Side Palette Drawer */}
        <CanvasPaletteDrawer
          isOpen={isPaletteOpen}
          onToggle={() => setIsPaletteOpen(!isPaletteOpen)}
          onDragStartPreset={(e, item) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'preset', id: item.payload }));
          }}
          onAddCustomNode={handleAddCustomNode}
          onQuickAddPreset={handleQuickAddPreset}
        />

        {/* Minimap Radar */}
        <CanvasMinimap
          nodes={nodes}
          pan={pan}
          zoom={zoom}
          canvasWidth={containerRef.current?.clientWidth || 1000}
          canvasHeight={660}
        />

        {/* Canvas World Transform Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Dynamic Grid Background in World Coordinates */}
          <div
            style={{
              width: '3200px',
              height: '2400px',
              transform: 'translate(-800px, -600px)',
              backgroundImage: `
                radial-gradient(circle, rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px),
                linear-gradient(to right, rgba(51, 65, 85, 0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(51, 65, 85, 0.12) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px, 128px 128px, 128px 128px',
            }}
            className="absolute pointer-events-none"
          />

          {/* Pipeline Stage Column Headers & Flow Direction Indicators */}
          <div className="absolute top-[-36px] left-0 pointer-events-none text-xs font-bold font-mono select-none">
            {/* Step 1 Header */}
            <div style={{ position: 'absolute', left: '60px', width: '250px' }} className="text-sky-500 dark:text-sky-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/15 dark:bg-sky-500/25 border border-sky-500/30 flex items-center justify-center text-[10px] font-bold">1</span>
              <span className="font-semibold tracking-tight">Step 1: 流量入口层</span>
            </div>

            {/* Step 2 Header */}
            <div style={{ position: 'absolute', left: '440px', width: '260px' }} className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">2</span>
              <span className="font-semibold tracking-tight">Step 2: 规则匹配层</span>
            </div>

            {/* Step 3 Header */}
            <div style={{ position: 'absolute', left: '840px', width: '260px' }} className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/15 dark:bg-purple-500/25 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">3</span>
              <span className="font-semibold tracking-tight">Step 3: 策略调度层</span>
            </div>

            {/* Step 4 Header */}
            <div style={{ position: 'absolute', left: '1240px', width: '250px' }} className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">4</span>
              <span className="font-semibold tracking-tight">Step 4: 物理出口层</span>
            </div>
          </div>

          {/* SVG Connection Layer */}
          <svg
            className="absolute top-0 left-0 w-[4000px] h-[3000px] overflow-visible pointer-events-none"
          >
            <defs>
              <linearGradient id="activeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Render all Wires */}
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
              const toNode = nodes.find((n) => n.id === edge.toNodeId);
              const isActive = simState.activeEdgeIds.includes(edge.id);

              return (
                <CanvasWire
                  key={edge.id}
                  edge={edge}
                  fromNode={fromNode}
                  toNode={toNode}
                  isActive={isActive}
                  isSelected={selectedEdgeId === edge.id}
                  onSelectEdge={handleSelectEdge}
                  onEditEdge={handleEditEdge}
                  onDeleteEdge={handleDeleteEdge}
                />
              );
            })}

            {/* Currently Dragging Bezier Link */}
            {connectingPort && (
              <path
                d={`M ${connectingPort.startX} ${connectingPort.startY} C ${
                  connectingPort.startX + (connectingPort.portType === 'out' ? 60 : -60)
                } ${connectingPort.startY}, ${
                  connectingMousePos.x - (connectingPort.portType === 'out' ? 60 : -60)
                } ${connectingMousePos.y}, ${connectingMousePos.x} ${connectingMousePos.y}`}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Nodes Layer */}
          <div className="pointer-events-auto">
            {nodes.map((node) => {
              const isActiveInSimulation = simState.activeNodeIds.includes(node.id);

              return (
                <CanvasNodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  isDragging={draggedNodeId === node.id}
                  isActiveInSimulation={isActiveInSimulation}
                  simulationStep={simState.currentStep}
                  onMouseDown={handleNodeMouseDown}
                  onPortMouseDown={handlePortMouseDown}
                  onPortMouseUp={handlePortMouseUp}
                  onEditNode={handleEditNode}
                  onDeleteNode={handleDeleteNode}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-400 bg-slate-900/85 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-sm pointer-events-none shadow-lg">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            空白处拖拽平移
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            右侧端口拉线连接
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            双击卡片/连线可即时编辑
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            滚轮缩放
          </span>
        </div>

        {/* Node Editing Modal */}
        <NodeEditModal
          isOpen={!!editingNode}
          node={editingNode}
          policyGroups={policyGroups}
          proxies={proxies}
          onClose={() => setEditingNode(null)}
          onSaveNode={handleSaveNode}
          onDeleteNode={handleDeleteNode}
        />

        {/* Edge Editing Modal */}
        <EdgeEditModal
          isOpen={!!editingEdge}
          edge={editingEdge}
          nodes={nodes}
          onClose={() => setEditingEdge(null)}
          onSaveEdge={handleSaveEdge}
          onDeleteEdge={handleDeleteEdge}
        />
      </div>
    </div>
  );
};
