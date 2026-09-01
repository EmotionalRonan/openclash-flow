# OpenClash Flow — ImmortalWRT 图形化分流管理系统详细设计文档

> **版本**: v1.0.0  
> **适用平台**: ImmortalWRT / OpenWrt (基于 OpenClash / Mihomo / Clash Meta 内核)  
> **核心仓库参考**: [vernesong/openclash](https://github.com/vernesong/openclash)

---

## 目录 (Table of Contents)

1. [项目概述与设计背景](#一-项目概述与设计背景)
2. [总体系统架构与分层设计](#二-总体系统架构与分层设计)
3. [核心功能模块详细设计](#三-核心功能模块详细设计)
   - 3.1 无限画布分流编排引擎 (Infinite Flow Canvas Engine)
     - 3.1.1 视口平移缩放与坐标投影体系 (Pan & Zoom Viewport)
     - 3.1.2 四阶段管线分层拓扑架构 (4-Step Pipeline Architecture)
     - 3.1.3 端口拉线连线与规则重写交互 (Interactive Port & Wire Engine)
     - 3.1.4 侧边预设资源抽屉与自由拖拽放置 (Palette Drawer & Drag-in)
     - 3.1.5 步进式流图仿真与发光粒子流回放 (Step-by-Step Simulator & Flow Particles)
     - 3.1.6 拓扑小地图全局雷达 (Minimap Radar)
   - 3.2 泳道式看板与优先级树视图 (Kanban Board & Priority Tree)
   - 3.3 多协议订阅与节点解析引擎 (Node & Subscription Parser)
   - 3.4 流量即时仿真与路由调试器 (Traffic Simulator)
   - 3.5 实时数据流与日志监控引擎 (Live Log Monitor)
   - 3.6 规则编译器与 UCI 脚本生成器 (Compiler & Sync Engine)
4. [前后端与 ImmortalWRT 交互时序与流程图](#四-前后端与-immortalwrt-交互时序与流程图)
5. [OpenClash 底层流量接管与分流机制](#五-openclash-底层流量接管与分流机制)
6. [核心数据模型定义 (TypeScript Interfaces)](#六-核心数据模型定义)
7. [配置文件与 UCI 指令映射规范](#七-配置文件与-uci-指令映射规范)
8. [部署与安装实践指南](#八-部署与安装实践指南)

---

## 一、项目概述与设计背景

### 1.1 背景与痛点
在基于 OpenWrt / ImmortalWRT 软路由环境部署 OpenClash 时，传统配置方式存在以下痛点：
- **配置文件层级复杂**：Clash 的 YAML 配置涉及 `proxies`、`proxy-groups`、`rules`、`dns`、`tun` 等大量参数，手动编辑极易出现 YAML 缩进错误或语法异常。
- **分流规则维护繁琐**：添加某项特定服务（如 OpenAI、Netflix、Steam、局域网直连）需要人工查找规则类型（`DOMAIN-SUFFIX`、`IP-CIDR`、`GEOIP`）并手动绑定到策略组。
- **调试困难**：当某个域名或流量无法按预期走代理时，缺乏直观的毫秒级决策链路仿真工具。
- **多协议节点管理复杂**：混合使用 VLESS (Reality)、Hysteria2、Trojan、Shadowsocks 等协议时，缺乏跨协议的自动地理位置识别与地区优选编排。

### 1.2 系统设计目标
**OpenClash Flow** 旨在构建一套专为 ImmortalWRT 优化的图形化分流管理面板：
- **拖拽式规则编排**：将预设服务或自定义 IP/域名通过拖拽直观分配给策略组。
- **全格式订阅解析**：兼容 Clash YAML、Base64 订阅文本以及单节点 URI（`vless://`, `hysteria2://`, `trojan://`, `ss://` 等）。
- **即时路由仿真**：输入任意域名或 IP 即可回放 DNS 劫持、规则匹配、策略组判定及出口节点选择。
- **双向输出**：自动编译输出标准 `/etc/openclash/config.yaml` 配置文件和对应的 ImmortalWRT UCI 部署脚本。

---

## 二、总体系统架构与分层设计

系统采用现代化模块化架构设计，分为 **表示层 (UI Presentation Layer)**、**策略编译与仿真层 (AST & Simulation Engine)**、**节点解析与管理层 (Node Parser Layer)** 以及 **路由器底层交互层 (ImmortalWRT Driver Layer)**。

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Web 客户端表现层 (React + Tailwind CSS)                    │
│  ┌───────────────────────┬──────────────────────┬─────────────────────────────────────┐  │
│  │ 拖拽式分流看板        │ 节点与多协议订阅管理 │ 流量实时仿真调试器 (Simulator)      │  │
│  ├───────────────────────┼──────────────────────┼─────────────────────────────────────┤  │
│  │ 实时数据流监控日志    │ YAML / UCI 编译生成器│ 路由器全局设置 (TUN/Fake-IP)        │  │
│  └───────────────────────┴──────────────────────┴─────────────────────────────────────┘  │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               策略编译与状态控制核心 (Core Engine)                         │
│  ┌──────────────────────────────────────────────┬──────────────────────────────────────┐ │
│  │ 规则 AST 编译器 (YAML / UCI Generator)       │ 流量决策回放引擎 (Route Simulator)   │ │
│  ├──────────────────────────────────────────────┼──────────────────────────────────────┤ │
│  │ 订阅与节点多协议嗅探器 (Base64/YAML/URI)      │ 地区智能聚类与优选编排 (Geo-Grouper) │ │
│  └──────────────────────────────────────────────┴──────────────────────────────────────┘ │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼ (REST API :9090)                      ▼ (文件持久化 /etc/openclash)
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                ImmortalWRT 路由器底层执行环境                             │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Linux Netfilter 防火墙 (iptables / nftables / TProxy / utun 虚拟网卡接口)          │  │
│  ├────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ OpenClash / Mihomo (Clash Meta) 内核                                               │  │
│  │  • Fake-IP DNS 模块 (198.18.0.1/16 映射池)                                         │  │
│  │  • 级联规则匹配器 (DOMAIN-SUFFIX -> IP-CIDR -> GEOIP -> MATCH)                     │  │
│  │  • 出站链路策略组调度 (URL-Test / Fallback / Select / Load-Balance)                │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 三、核心功能模块详细设计

### 3.1 无限画布分流编排引擎 (Infinite Flow Canvas Engine)

为解决传统路由器分流配置中缺乏拓扑全景感知、规则与策略组割裂的问题，系统构建了**无限画布流图引擎 (Infinite Flow Canvas)**，将 OpenClash 完整流量路由生命周期映射为可视化的四阶段有向无环拓扑图（DAG）。

#### 3.1.1 视口平移缩放与坐标投影体系 (Pan & Zoom Viewport)
- **坐标变换模型**：
  采用两维世界坐标体系 $(x_{\text{world}}, y_{\text{world}})$ 与视口屏幕坐标体系 $(x_{\text{screen}}, y_{\text{screen}})$ 的双向投影映射：
  $$x_{\text{screen}} = x_{\text{world}} \times \text{Zoom} + \text{Pan}_x$$
  $$y_{\text{screen}} = y_{\text{world}} \times \text{Zoom} + \text{Pan}_y$$
- **缩放算法 (Zoom towards Cursor)**：
  支持鼠标滚轮在 $[35\%, 200\%]$ 范围内无级平滑缩放。缩放中心严格绑定于当前鼠标光标所在的世界坐标点，防止视口跳动：
  $$\text{Pan}_{\text{new}} = \text{Cursor} - (\text{Cursor} - \text{Pan}_{\text{old}}) \times \frac{\text{Zoom}_{\text{new}}}{\text{Zoom}_{\text{old}}}$$
- **漫游交互**：
  在画布空白背景处按住鼠标左键即可自由漫游平移；双击或点击工具栏「100%」即可一键重置视口居中。

#### 3.1.2 四阶段管线分层拓扑架构 (4-Step Pipeline Architecture)
画布将 OpenClash 的网络生命周期严格拆分为四个自左向右依次流动的核心管线阶段 (Step 1 ~ Step 4)：

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Step 1: 流量入口 │ ────> │ Step 2: 规则匹配 │ ────> │ Step 3: 策略调度 │ ────> │ Step 4: 物理出口 │
│ (Inbound Source)│       │(Rule Evaluation)│       │ (Policy Routing)│       │(Outbound Sinks) │
│ • Fake-IP 劫持  │       │ • DOMAIN-SUFFIX │       │ • 节点选择PROXY │       │ • VLESS Reality │
│ • TUN 虚拟网卡  │       │ • IP-CIDR / GEO │       │ • URL-Test 自动 │       │ • Hysteria2 / SS│
│ • 本地 DNS :7874│       │ • 广告拦截/直连 │       │ • Fallback 容灾 │       │ • DIRECT / REJECT│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Step 1: 流量入口层 (Inbound Source)**：
   - 展示局域网终端流量注入源，显示 OpenClash 的 DNS 监听端口 (`:7874`)、`utun` 虚拟接口与 Fake-IP (`198.18.0.0/16`) 地址池状态。
2. **Step 2: 规则匹配层 (Rule Evaluation)**：
   - 承载所有的分流判定单元，每个规则卡片包含匹配类型（`DOMAIN-SUFFIX`, `IP-CIDR`, `GEOIP` 等）、匹配载荷（如 `openai.com`）以及目标策略组绑定。
3. **Step 3: 策略调度层 (Policy Routing)**：
   - 承载策略组节点，包含调度算法（`select`, `url-test`, `fallback`, `load-balance`）和包含的节点总数。
4. **Step 4: 物理出口层 (Outbound Sinks)**：
   - 承载真实外部出站代理节点（标注加密协议、实测延迟、国旗图标）以及系统内建的 `DIRECT`（国内直连）和 `REJECT`（广告阻断）落地网关。

#### 3.1.3 端口拉线连线与规则重写交互 (Interactive Port & Wire Engine)
- **端口体系 (Ports)**：
  - 每个 Step 1 ~ 3 节点的右侧边缘设有 **输出端口 (Output Port, 👉)**；
  - 每个 Step 2 ~ 4 节点的左侧边缘设有 **输入端口 (Input Port, 👈)**。
- **动态平滑三次贝塞尔连线 (Cubic Bezier Wire)**：
  连线几何公式采用端点切线水平约束的三次贝塞尔曲线：
  $$C(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
  其中控制点 $P_1 = (x_1 + dx, y_1), P_2 = (x_2 - dx, y_2)$，$dx = \max(|x_2 - x_1| \times 0.5, 40)$，确保曲线在任何角度下保持极其圆润自然的导向感。
- **连线触发状态更新机制**：
  - 当用户从 **Step 2 规则卡片** 的输出端口拉线连接到 **Step 3 策略组卡片** 的输入端口时，系统即时更新该条规则的 `targetGroup` 属性，并自动同步至 OpenClash AST 状态；
  - 当用户从 **Step 3 策略组卡片** 的输出端口拉线连接到 **Step 4 代理节点卡片** 时，系统自动将该物理节点加入该策略组的 `proxies` 列表中；
  - 悬停于任意连线中点处，提供即时断开（Trash）按钮，点击即可断开关联。

#### 3.1.4 侧边预设资源抽屉与自由拖拽放置 (Palette Drawer & Drag-in)
- **左侧预设资源抽屉**：
  集成收纳 OpenAI、Claude、Gemini、Netflix、YouTube、Steam、广告过滤及国内直连等数百条经过生产环境检验的规则预设。
- **画布自由放置机制**：
  支持直接将预设卡片从资源抽屉拖拽至画布任意世界坐标位置，松开鼠标即可在鼠标着陆点自动生成独立的规则节点；
- **自定义规则极速生成**：
  抽屉底部支持快速录入自定义匹配类型与域名/CIDR，一键生成全新规则卡片并投递至画布。

#### 3.1.5 步进式流图仿真与发光粒子流回放 (Step-by-Step Simulator & Flow Particles)
- **分步回放引擎 (Step Simulator)**：
  用户在顶部仿真栏输入待测试的任意目标（如 `api.openai.com`、`netflix.com` 或 `114.114.114.114`），点击「开始回放仿真」或「单步执行 (Step Next)」：
  - **Step 1 (流量捕获)**：Inbound 卡片亮起青色光环，说明 Fake-IP 劫持与 utun 捕获完成；
  - **Step 2 (规则匹配)**：命中的规则卡片闪烁绿色霓虹光环并标注 `Step 2 命中`；
  - **发光粒子流 (Animated Flow Particles)**：在 Step 1 $\to$ Step 2 $\to$ Step 3 $\to$ Step 4 的连线上生成动态沿贝塞尔曲线路径运动的发光绿色粒子；
  - **Step 3 (策略调度)**：调度组高亮，展示出站策略判定；
  - **Step 4 (物理出口)**：终点物理节点亮起，展示握手延迟与协议类型。
- **连续自动播放 (Auto Play)**：支持以 1.4s/步 的速率全自动巡航回放，直观向网络管理员展示完整决策链路。

#### 3.1.6 拓扑小地图全局雷达 (Minimap Radar)
- 位于画布右下角，通过高精度全局坐标微缩映射渲染整张画布上所有节点与视口矩形框架。
- 视口框随用户的画布平移与缩放实时同步，极大增强了大规模规则集群下的空间方位感知。

---

### 3.2 泳道式看板与优先级树视图 (Kanban Board & Priority Tree)
- **多视图无缝切换**：
  - **无限画布流图 (Infinite Flow Canvas)**：用于全局拓扑规划、端到端连线编排与单步仿真回放；
  - **泳道看板 (Kanban Board)**：按策略组（如 🚀 节点选择、🤖 AI 服务、🎬 海外流媒体、🛡️ 广告拦截、🇨🇳 国内直连）纵向分列，支持卡片在策略组泳道间拖动转移；
  - **规则优先级树 (Priority Tree)**：直观展示规则自上而下的扫描顺序（从第 1 条到第 N 条），支持置顶、置底或向上/向下微调，并支持开关规则启用状态与一键删除。

### 3.3 多协议订阅与节点解析引擎 (Node & Subscription Parser)
- **协议解析器支持列表**：
  | 协议 | 格式示例 | 特殊特性解析 |
  | :--- | :--- | :--- |
  | **VLESS** | `vless://uuid@server:port?security=reality&sni=...` | Reality 公钥、Short ID、XTLS-rprx-vision 流控 |
  | **Hysteria2** | `hysteria2://password@server:port?sni=...` | UDP 快速握手、端口跳跃、自定义 SNI |
  | **Trojan** | `trojan://password@server:port?sni=...` | ALPN 协商、SNI 证书校验 |
  | **VMess** | `vmess://Base64(JSON)` | AlterID、WS-Path、TLS 加密 |
  | **Shadowsocks** | `ss://Base64(method:password)@server:port` | 2022-blake3、AEAD 加密套件 |
- **智能地理位置与国旗提取算法**：
  - 通过节点名称中的关键字与 Emoji 旗帜（如 `HK`, `香港`, `JP`, `东京`, `US`, `美西`, `SG`, `新加坡`, `TW`, `台湾`）自动计算 ISO 国家代码与国旗标识。
  - **智能生成地区组**：一键扫描所有可用节点，自动建立地区专属的 `url-test` 自动优选策略组。

### 3.4 流量即时仿真与路由调试器 (Traffic Simulator)
- **算法匹配流水线**：
  1. **输入解析**：校验用户输入的字符串是 IPv4 / IPv6 地址还是 FQDN 域名。
  2. **DNS 仿真**：若是域名，仿真 DNS 劫持并分配 Fake-IP（如 `198.18.0.x`）。
  3. **规则级联扫描**：
     - 逐条评估 `DOMAIN` (全匹配)、`DOMAIN-SUFFIX` (后缀递归匹配)、`DOMAIN-KEYWORD` (关键字匹配)。
     - 评估 `IP-CIDR` / `IP-CIDR6` (子网掩码计算) 与 `GEOIP` (国家代码库匹配)。
     - 命中第一条规则即熔断返回。
     - 若所有规则均未命中，回退至兜底规则 `MATCH`。
  4. **策略组出站解析**：回溯策略组的调度算法（`select` / `url-test` / `fallback`），并展示对应物理节点的延迟和连接参数。

### 3.5 实时数据流与日志监控引擎 (Live Log Monitor)
- **日志分类**：
  - `DNS`：记录客户端 DNS 解析请求与 Fake-IP 映射对应关系。
  - `MATCH`：记录 TCP/UDP 连接触发的规则类型与选定策略组。
  - `TRAFFIC`：记录 TUN 虚拟网卡出站会话的吞吐量与连接建立状态。
  - `WARN` / `ERROR`：记录节点握手超时、证书校验异常与广告拦截阻断（`REJECT`）。
- **交互控制**：支持实时流式推流、一键暂停、按级别与关键词检索、日志全量复制及一键导出为文本文件。

### 3.6 规则编译器与 UCI 脚本生成器 (Compiler & Sync Engine)
- **Clash YAML 编译**：
  - 将内存中的策略组与规则列表序列化为 100% 兼容的 `config.yaml`。
  - 包含完整的 `mixed-port`、`allow-lan`、`mode: rule`、`tun` 虚拟网卡开关、`dns.fake-ip` 规则池等。
- **ImmortalWRT UCI 脚本生成**：
  - 自动输出可通过 `uci set openclash.config.*` 配置的 Shell 部署脚本。
- **External Controller 同步**：
  - 支持通过 RESTful API（端口 `:9090`，Path `/configs?force=true`）进行 0 停机热重载。

---

## 四、前后端与 ImmortalWRT 交互时序与流程图

### 4.1 核心数据流转架构图 (Architecture Diagram)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        前端 Web 可视化管理面板                           │
│  [拖拽规则看板]       [一键导入节点/订阅]      [策略调试/仿真]    [实时日志] │
└──────────────┬───────────────────┬───────────────────┬─────────────────┘
               │ (1. 编排规则)      │ (2. 导入解析)      │ (3. 实时查询)
               ▼                   ▼                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     核心数据流与策略编译器 (AST Compiler)                │
│   • 规范化 TrafficRule[] / PolicyGroup[] AST 结构模型                    │
│   • 自动编译输出标准 OpenClash YAML 配置文件与 UCI Shell 部署脚本        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼ (REST API: 9090 / SSH / TTYD)     ▼ (下载 /etc/openclash/config.yaml)
┌────────────────────────────────────────────────────────────────────────┐
│                       ImmortalWRT 路由器系统 (Router)                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ 局域网终端访问流量 (PC / 手机 / 主机)                           │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Linux Netfilter 防火墙 (iptables / nftables / TProxy / TUN)    │   │
│   │ ├─ DNS 流量重定向至 OpenClash 监听端口 (:7874)                  │   │
│   │ └─ TCP/UDP 流量通过 utun 虚拟网卡注入 Clash Meta 内核          │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ OpenClash 分流执行引擎 (Clash Meta / Mihomo Core)              │   │
│   │ ├─ 1. DNS 劫持与 Fake-IP 地址池 (198.18.0.0/16) 映射            │   │
│   │ ├─ 2. 规则链自上而下匹配 (DOMAIN-SUFFIX > IP-CIDR > GEOIP > MATCH)│
│   │ └─ 3. 策略组决策 (URL-Test 优选 / Fallback 故障转移 / 手动指定)│   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│             ┌─────────────────────┼─────────────────────┐              │
│             ▼ (国内直连)          ▼ (广告阻断)           ▼ (加密代理)   │
│      ┌───────────────┐     ┌──────────────┐     ┌──────────────┐       │
│      │ 🇨🇳 DIRECT     │     │ 🛡️ REJECT    │     │ 🚀 节点专线   │       │
│      │ (WAN口直连)   │     │ (丢弃/0.0.0.0)│    │ (TLS/VLESS)  │       │
│      └───────────────┘     └──────────────┘     └──────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 策略配置与热重载时序图 (Sequence Diagram)

```text
用户 (User)        前端面板 (Web UI)        策略编译器 (Compiler)    OpenClash API (:9090)    ImmortalWRT 内核
    │                     │                          │                        │                     │
    │── 1. 拖拽调整规则 ─>│                          │                        │                     │
    │── 2. 导入订阅节点 ─>│                          │                        │                     │
    │                     │── 3. 请求编译新配置 ────>│                        │                     │
    │                     │                          │── 4. AST 校验与渲染 ───│                     │
    │                     │<─ 5. 返回 YAML / UCI ────│                        │                     │
    │                     │                                                   │                     │
    │── 6. 点击一键推送 ─>│                                                   │                     │
    │                     │────────── 7. PUT /configs?force=true ────────────>│                     │
    │                     │                                                   │── 8. 重载路由表 ───>│
    │                     │                                                   │<─ 9. 热重载完成 ────│
    │                     │<───────── 10. HTTP 204 No Content ────────────────│                     │
    │<─ 11. 提示同步成功 ─│                                                   │                     │
```

---

## 五、OpenClash 底层流量接管与分流机制

### 5.1 Fake-IP 与 TUN 模式工作流
1. **DNS 劫持 (DNS Hijack)**：
   - 客户端（如浏览器）发起 `api.openai.com` 的 A 记录解析请求。
   - 路由器的 `dnsmasq` / `iptables` 将端口 53 流量重定向至 OpenClash 本地 DNS 端口（`7874`）。
   - OpenClash 内核不等待远端真实解析，而是从 Fake-IP 地址池（`198.18.0.0/16`）即时分配一个保留地址（如 `198.18.0.42`）并写入内存映射表，向客户端秒级返回。
2. **TUN 虚拟网卡捕获 (TUN Mode)**：
   - 客户端收到 `198.18.0.42` 后，发起目标端口为 443 的 TCP SYN 握手报文。
   - 路由系统路由表将 `198.18.0.0/16` 网段直接路由至 `utun` 虚拟接口。
   - OpenClash 内核拦截该数据包，依据源 IP 及目标 Fake-IP 查表还原出原始域名 `api.openai.com`。
3. **规则匹配与出站 (Rule Evaluation)**：
   - 内核依次遍历 `rules` 列表，命中 `DOMAIN-SUFFIX, openai.com, 🤖 AI 服务 (AI)`。
   - 策略组 `🤖 AI 服务 (AI)` 依据其配置的优选节点，将加密流量封装并通过物理网卡出站至境外服务器。

---

## 六、核心数据模型定义

在系统中采用强类型 TypeScript 定义所有实体，确保数据流安全：

```typescript
// 1. 代理节点实体
export interface ProxyNode {
  id: string;
  name: string;
  type: 'ss' | 'vmess' | 'vless' | 'trojan' | 'hysteria2' | 'tuic' | 'wireguard';
  server: string;
  port: number;
  cipher?: string;
  password?: string;
  uuid?: string;
  alterId?: number;
  tls?: boolean;
  sni?: string;
  alpn?: string[];
  realityOpts?: {
    publicKey: string;
    shortId?: string;
  };
  latency?: number;
  status?: 'online' | 'slow' | 'offline';
  country?: string;
  flag?: string;
}

// 2. 策略分流组实体
export interface PolicyGroup {
  id: string;
  name: string;
  type: 'select' | 'url-test' | 'fallback' | 'load-balance';
  description?: string;
  proxies: string[];
  url?: string;
  interval?: number;
  icon?: string;
}

// 3. 流量分流规则实体
export interface TrafficRule {
  id: string;
  type: 'DOMAIN' | 'DOMAIN-SUFFIX' | 'DOMAIN-KEYWORD' | 'IP-CIDR' | 'GEOIP' | 'MATCH';
  payload: string;
  targetGroup: string;
  enabled: boolean;
  noResolve?: boolean;
  description?: string;
  category?: 'ai' | 'streaming' | 'gaming' | 'adblock' | 'direct' | 'custom';
}

// 4. 全局核心运行配置
export interface OpenClashSettings {
  runMode: 'fake-ip' | 'redir-host';
  networkMode: 'tun' | 'tproxy' | 'redir';
  mixedPort: number;
  tproxyPort: number;
  dnsPort: number;
  controllerPort: number;
  routerHost: string;
  secret: string;
  allowLan: boolean;
  ipv6: boolean;
  logLevel: 'info' | 'warning' | 'error' | 'debug';
}

// 5. 无限画布节点与拓扑实体 (Canvas Entities)
export type CanvasNodeType = 'inbound' | 'rule' | 'group' | 'outbound';

export interface CanvasNodeData {
  id: string;
  type: CanvasNodeType;
  title: string;
  subtitle?: string;
  tag?: string;
  iconType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  meta: {
    ruleId?: string;
    groupId?: string;
    proxyId?: string;
    ruleType?: string;
    payload?: string;
    groupType?: string;
    proxyCount?: number;
    latency?: number;
    protocol?: string;
    status?: string;
  };
}

export interface CanvasEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  active?: boolean;
  type?: 'inbound-rule' | 'rule-group' | 'group-outbound';
}

export interface ViewportState {
  pan: { x: number; y: number };
  zoom: number;
}

export interface StepSimulationState {
  active: boolean;
  currentStep: number; // 0=未开始, 1=Inbound, 2=Rule, 3=Group, 4=Outbound, 5=Finished
  autoPlay: boolean;
  query: string;
  matchedRuleId?: string;
  matchedGroupId?: string;
  matchedProxyId?: string;
  explanation: string[];
}
```

---

## 七、配置文件与 UCI 指令映射规范

### 7.1 OpenClash 标准 YAML 结构示例
```yaml
mixed-port: 7890
allow-lan: true
mode: rule
log-level: info
ipv6: false
external-controller: 0.0.0.0:9090
secret: ""

dns:
  enable: true
  listen: 0.0.0.0:7874
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
    - https://dns.alidns.com/dns-query

tun:
  enable: true
  stack: system
  dns-hijack:
    - tcp://any:53
    - udp://any:53
  auto-route: true
  auto-detect-interface: true

proxies:
  # 节点列表...

proxy-groups:
  - name: 🚀 节点选择 (PROXY)
    type: select
    proxies:
      - 🇭🇰 香港 IPLC 01
      - 🇯🇵 日本 Tokyo 01
      - DIRECT

rules:
  - DOMAIN-SUFFIX,openai.com,🤖 AI 服务 (AI)
  - DOMAIN-SUFFIX,netflix.com,🎬 海外流媒体 (MEDIA)
  - GEOIP,CN,🇨🇳 国内直连 (DIRECT)
  - MATCH,🐟 漏网之鱼 (FINAL)
```

### 7.2 ImmortalWRT UCI 指令映射规范
```bash
# 启用 OpenClash 内核
uci set openclash.config.enable='1'

# 设置运行模式为 TUN 虚拟网卡
uci set openclash.config.operation_mode='fake-ip'
uci set openclash.config.en_mode='fake-ip-tun'

# 配置端口监听
uci set openclash.config.http_port='7890'
uci set openclash.config.socks_port='7891'
uci set openclash.config.mixed_port='7890'
uci set openclash.config.cn_port='9090'

# 应用并重启 OpenClash 守护进程
uci commit openclash
/etc/init.d/openclash restart
```

---

## 八、部署与安装实践指南

1. **环境依赖确认**：
   - 确认 ImmortalWRT 路由器已安装 `luci-app-openclash` 与 `kmod-tun` 内核模块。
   - 确认核心文件已更新至最新 Clash Meta / Mihomo 版本。
2. **面板使用流程**：
   - **步骤 1**：在【节点与订阅】标签页粘贴机场或自建节点的订阅链接，点击【一键导入并自动分类】。
   - **步骤 2**：在【分流规则画布】中将需要的服务卡片拖入对应的策略组。
   - **步骤 3**：在【策略仿真】中输入常用域名（如 `chatgpt.com`）测试是否精准命中目标出口。
   - **步骤 4**：在【配置与同步】中下载 `config.yaml` 或直接点击【一键推送热更新】完成路由器同步。

---

*文档维护者: OpenClash Flow Team*  
*最后更新日期: 2026-08-31*
