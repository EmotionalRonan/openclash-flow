# OpenClash Flow - 拓扑流图与可视化分流编排系统

<div align="center">

![OpenClash Flow Logo](public/icon.svg)

**专为 OpenWrt / ImmortalWRT 设计的下一代 OpenClash 可视化规则流图与无限画布编排工具**

[![Platform](https://img.shields.io/badge/Platform-ImmortalWRT%20%7C%20OpenWrt-blue.svg)](https://openwrt.org)
[![LuCI Version](https://img.shields.io/badge/LuCI-21.02%20~%2024.10+-emerald.svg)](https://github.com/openwrt/luci)
[![Architecture](https://img.shields.io/badge/Arch-x86__64%20%7C%20aarch64%20%7C%20arm%20%7C%20mips%20%7C%20all-orange.svg)](#-支持的路由器架构与产物清单)
[![GitHub Actions CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue?logo=github-actions&logoColor=white)](#-github-actions-持续集成与自动发布)
[![Tests](https://img.shields.io/badge/Tests-27%20Passed-brightgreen.svg)](#-自动化测试套件与用例验证)
[![License](https://img.shields.io/badge/License-Apache%202.0-indigo.svg)](LICENSE)

[功能特性](#-核心功能特性) • [架构产物](#-支持的路由器架构与产物清单) • [编译构建](#-编译构建流程) • [GitHub CI](#-github-actions-持续集成与自动发布) • [测试验证](#-自动化测试套件与用例验证) • [路由器安装](#-路由器安装部署指南) • [技术栈](#-技术栈)

</div>

---

## 📖 项目介绍

**OpenClash Flow** 是一款针对 ImmortalWRT / OpenWrt 软路由环境深度优化的图形化分流拓扑流图与规则编排套件（`luci-app-openclash-flow`）。

### 💡 解决的核心痛点
在传统 OpenClash 配置与维护过程中，网络管理员常面临以下问题：
1. **规则繁杂割裂**：成百上千条分流规则分散在文本或长列表中，缺乏直观的拓扑关联，难以看清“哪些域名走了哪个策略组、最终落在哪台物理节点”；
2. **策略调度不透明**：自动测速（`url-test`）、故障容灾（`fallback`）等组内逻辑不直观；
3. **调试诊断成本高**：排查某个特定网站（如 Netflix、ChatGPT、Steam、本地直连）为何分流异常时，往往需要反复翻查底层日志；
4. **配置同步繁琐**：修改一条规则需要反复手动重启内核或覆写复杂 YAML。

**OpenClash Flow** 引入了**无限画布流图（Infinite Canvas）**与**端到端动态粒子仿真**，将流量从局域网注入（Inbound）、规则匹配（Rule Evaluation）、策略调度（Policy Routing）到物理出站（Outbound）的全生命周期进行无缝拓扑还原与可视化拖拽编排。

---

## ✨ 核心功能特性

### 1. 🌐 无限画布流图引擎 (Infinite Flow Canvas)
- **自由视口漫游与缩放**：支持鼠标左键拖拽漫游，鼠标滚轮在 35% ~ 200% 间基于光标中心平滑缩放，支持一键 100% 居中重置；
- **智能自动整理布局**：算法一键计算拓扑各层级最优列距与节点纵向间距，自动排列规整画布；
- **全局微缩雷达小地图 (Minimap)**：实时映射全局节点坐标与视口漫游矩形。

### 2. 🔀 交互式贝塞尔拉线编排 (Interactive Ports & Wiring)
- **端口拖拽拉线**：按住节点右侧输出端口（👉 Output Port），拖出平滑三次贝塞尔导向线至下游目标节点左侧输入端口（👈 Input Port），即可即时重写分流规则的目标策略组；
- **可视化断开/重连**：连线支持悬停高亮与一键断开，修改即时响应。

### 3. 🧪 步进式流图仿真与粒子回放 (Step-by-Step Flow Simulator)
- **全链路追踪**：输入任意测试域名或 IP（如 `api.openai.com`、`netflix.com`、`bilibili.com`、`adservice.google.com`）；
- **发光粒子动态流淌**：
  - **Step 1** 流量入口 Fake-IP 劫持高亮；
  - **Step 2** 命中规则卡片绿光闪烁；
  - **Step 3** 目标策略组亮起；
  - **Step 4** 终点物理节点握手与延迟呈现；
- **双模回放**：支持「单步执行 (Step Next)」深度技术剖析或「自动播放 (Auto Play)」全自动巡航。

### 4. 🗂️ 预设资源库与多视图看板
- **海量场景规则库**：内置 🤖 AI 服务、🎬 海外流媒体、🎮 游戏低延迟、🛡️ 广告拦截、🇨🇳 国内直连等预设，支持直接将卡片拖入画布任意坐标生成规则；
- **多维度视图**：支持 **无限画布流图**、**泳道式看板 (Kanban)**、**规则优先级树 (Priority Tree)** 自由无缝切换。

### 5. 📡 节点解析与协议支持
- 支持多协议节点解析与管理：`VLESS (Reality / Vision)`、`Hysteria 2`、`TUIC v5`、`Trojan`、`Shadowsocks / SS2022`、`VMess`；
- 支持根据节点名称与 Emoji 自动识别国旗并一键按地区生成 `url-test` 自动优选策略组。

### 6. 🔄 编译器与多端同步
- **Clash YAML 编译**：严格遵循 Clash Meta / Mihomo 规范输出全量标准配置；
- **ImmortalWRT UCI 脚本**：一键生成标准 OpenWrt UCI Shell 脚本，免重启安全应用；
- **多架构 IPK 矩阵**：支持一键构建全架构通用包及针对 x86_64、ARM64、ARMv7、MIPSEL、MIPS 独立编译的 opkg 安装包。

---

## 📦 支持的路由器架构与产物清单

项目提供针对不同硬件架构专属构建的 IPK 安装包及全架构通用包：

| 目标架构 (Architecture) | 软件包文件名 | 典型适用设备 / 芯片方案 | SHA256 校验和前缀 |
| :--- | :--- | :--- | :--- |
| **all (全架构通用)** | `luci-app-openclash-flow_1.0.0-1_all.ipk` | 所有 ImmortalWRT / OpenWrt 设备通用 | `c4ea70c0b9...` |
| **x86_64** | `luci-app-openclash-flow_1.0.0-1_x86_64.ipk` | Intel / AMD 软路由 (J4125/N5105/N100/i3/i5/i7)、PVE、ESXi、VMware | `391f8347ae...` |
| **aarch64_generic** | `luci-app-openclash-flow_1.0.0-1_aarch64_generic.ipk` | ARM64 软路由与开发板 (斐讯 N1, 树莓派 4/5, NanoPi R2S/R4S/R5S/R6S, RK3568/RK3588, MT7981/MT7986) | `47d32ab2ce...` |
| **arm_cortex-a7_neon-vfpv4** | `luci-app-openclash-flow_1.0.0-1_arm_cortex-a7_neon-vfpv4.ipk` | 32位 ARM 多核平台 (高通 IPQ4018/IPQ4019, GL.iNet B1300, 华硕 RT-AC58U) | `bf1485b1ca...` |
| **mipsel_24kc** | `luci-app-openclash-flow_1.0.0-1_mipsel_24kc.ipk` | 经典小端 MIPS 平台 (联发科 MT7621/MT7628, 斐讯 K2P, Newifi D2, 极路由 B70) | `3692f86896...` |
| **mips_24kc** | `luci-app-openclash-flow_1.0.0-1_mips_24kc.ipk` | 大端 MIPS 平台 (高通 Atheros AR9344, QCA9531, AR7161, TP-Link WDR7500) | `ecac36d0e3...` |

> 完整 SHA256 清单可在构建产物中的 `dist-ipk/sha256sums.txt` 查看并校验。

---

## 🛠️ 编译构建流程

### 环境要求
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`
- Linux / macOS 开发环境（构建 IPK 需要基础系统工具 `tar`、`gzip`、`bash`、`sha256sum`）

---

### 方式一：一键全架构矩阵打包 (推荐)

运行以下命令将一次性完成前端编译、LuCI 控制器装配，并**同时构建全部 6 种架构**的 IPK 安装包及 SHA256 校验和：

```bash
# 执行全架构批量构建
npm run build:ipk

# 或者直接调用打包脚本
bash ./scripts/build-ipk.sh all-arch
```

**产物输出路径：**
```text
dist-ipk/
├── luci-app-openclash-flow_1.0.0-1_all.ipk
├── luci-app-openclash-flow_1.0.0-1_x86_64.ipk
├── luci-app-openclash-flow_1.0.0-1_aarch64_generic.ipk
├── luci-app-openclash-flow_1.0.0-1_arm_cortex-a7_neon-vfpv4.ipk
├── luci-app-openclash-flow_1.0.0-1_mipsel_24kc.ipk
├── luci-app-openclash-flow_1.0.0-1_mips_24kc.ipk
└── sha256sums.txt
```

---

### 方式二：按指定硬件架构单独构建

如果只需针对特定架构编译单个安装包，可以使用专用的 npm 命令或向脚本传参：

```bash
# 1. 仅构建通用全架构 IPK (all)
npm run build:ipk:all
# 或: bash ./scripts/build-ipk.sh all

# 2. 仅构建 x86_64 软路由专属 IPK
npm run build:ipk:x86
# 或: bash ./scripts/build-ipk.sh x86_64

# 3. 仅构建 aarch64 (ARM64 / N1 / 树莓派 / RK3588) IPK
npm run build:ipk:aarch64
# 或: bash ./scripts/build-ipk.sh aarch64_generic

# 4. 仅构建 ARM 32位 (IPQ4019 / Cortex-A7) IPK
npm run build:ipk:arm
# 或: bash ./scripts/build-ipk.sh arm_cortex-a7_neon-vfpv4

# 5. 仅构建 MIPS 32位小端 (MT7621 / K2P) IPK
npm run build:ipk:mipsel
# 或: bash ./scripts/build-ipk.sh mipsel_24kc

# 6. 仅构建 MIPS 32位大端 (AR9344) IPK
npm run build:ipk:mips
# 或: bash ./scripts/build-ipk.sh mips_24kc
```

---

### 方式三：前端独立开发调试

```bash
# 启动本地热重载调试服务器 (端口 3000)
npm run dev

# 执行 TypeScript 类型校验
npm run lint

# 仅编译前端生产单页应用 (输出至 dist/)
npm run build
```

---

### 方式四：OpenWrt SDK / Buildroot 源码集成构建

如果您正在使用 OpenWrt / ImmortalWRT 源码编译定制固件：

1. 将项目目录下的 `package-openwrt/` 拷贝或软链接至 OpenWrt 源码根目录下的 `package/luci-app-openclash-flow`：
   ```bash
   cp -r package-openwrt /path/to/openwrt/package/luci-app-openclash-flow
   ```
2. 在 OpenWrt 源码根目录下配置 menuconfig：
   ```bash
   make menuconfig
   # 选择：LuCI -> 3. Applications -> luci-app-openclash-flow (选为 <*> 编入固件 或 <M> 生成 IPK)
   ```
3. 执行独立包编译：
   ```bash
   make package/luci-app-openclash-flow/compile V=s
   ```
   编译产物将输出在 `bin/packages/<arch>/luci/luci-app-openclash-flow_*.ipk`。

---

## 🤖 GitHub Actions 持续集成与自动发布

本项目已配置完善的 **GitHub Actions CI/CD** 自动化工作流（`.github/workflows/build-ipk.yml`），无需本地配置编译环境即可自动获取最新架构 IPK。

### 🔄 自动化触发时机
- **代码提交 (Push)**：向 `main` 或 `master` 分支推送代码时自动触发；
- **合并请求 (Pull Request)**：针对主分支提交 PR 时自动触发代码检查与测试；
- **版本发布 (Release / Tag)**：发布形如 `v1.0.0` 的 Release Tag 时，自动构建并直接挂载 IPK 附件至 GitHub Release Assets；
- **手动调度 (workflow_dispatch)**：可在 GitHub 仓库 Actions 界面随时一键手动触发构建。

### ⚙️ CI 自动化流水线流程
```text
📥 Checkout ➔ 🟢 Setup Node 20 ➔ 📦 Install Deps ➔ 🔍 Type & Lint Check ➔ 🧪 Vitest (27 Tests) ➔ 🔨 Build 6 Arch IPKs ➔ 📊 Generate Step Summary ➔ 📤 Upload Artifacts / Release
```

### 📥 如何在 GitHub 上查看与下载生成的 IPK 产物

1. 进入 GitHub 仓库页面，点击顶部 **「Actions」** 标签；
2. 点击最新一次运行成功的 workflow（如 `Build & Test OpenClash Flow IPK Packages`）；
3. 在运行详情页的 **「Artifacts」** 区域，直接点击 **`luci-app-openclash-flow-ipks`** 下载全架构 IPK 压缩包；
4. 在详情页面的 **Summary 报告** 中，可直接查阅各架构产物的文件大小、SHA256 校验和及路由器一键安装指令。

---

## 🧪 自动化测试套件与用例验证

项目基于 **Vitest** 深度集成了一套覆盖协议解析、流图仿真、规则匹配、配置编译器与多架构产物完整性的自动化测试框架。

### 🚀 运行测试指令

```bash
# 执行全量自动化测试套件
npm test

# 交互式监听模式 (用于开发调试)
npx vitest
```

### 📋 测试用例覆盖矩阵 (27 / 27 项全部通过)

| 测试套件 (Suite) | 测试文件 | 验证的核心业务与边界场景 | 测试用例数 |
| :--- | :--- | :--- | :---: |
| **1. 协议解析器** | `src/__tests__/parser.test.ts` | <li>节点名称与国旗 Emoji 智能识别匹配 (`HK/JP/US/TW/SG/UK/DE/UN`)</li><li>Shadowsocks (`ss://`) 密码与加密算法解析</li><li>VLESS Reality (`vless://`) 密钥、ShortID 与流控解析</li><li>Hysteria 2 (`hy2://`) 握手参数与端口解析</li><li>Trojan (`trojan://`) 协议解析与异常 URL 编码容错</li><li>Clash YAML 多节点文本解析与 Base64 订阅解码</li> | 6 项通过 |
| **2. 规则分流引擎** | `src/__tests__/ruleMatcher.test.ts` | <li>IPv4 / IPv6 地址格式合法性判定 (`isIpAddress`)</li><li>CIDR 掩码及子网范围计算 (`isIpInCidr`)</li><li>`DOMAIN-SUFFIX` 域名后缀匹配与策略组跳转</li><li>`DOMAIN-KEYWORD` 关键词匹配与 `url-test` 自动测速优选</li><li>`DOMAIN` 绝对匹配与 `REJECT` 拦截阻断</li><li>`GEOIP CN` 大陆流量识别与 `DIRECT` 直连出站</li><li>`MATCH` 兜底全量规则级联路由</li> | 7 项通过 |
| **3. 配置生成器** | `src/__tests__/configGenerator.test.ts` | <li>Clash Meta / Mihomo 标准 YAML 结构完整性输出校验</li><li>DNS Fake-IP 模式与 TUN 堆栈配置生成</li><li>ImmortalWRT UCI Shell 脚本生成及参数校验</li> | 2 项通过 |
| **4. 多架构 IPK 产物** | `src/__tests__/ipkArtifacts.test.ts` | <li>校验全部 6 种硬件架构 (`all/x86_64/aarch64/arm/mipsel/mips`) IPK 是否全部构建生成</li><li>校验各架构 IPK 离线包体积处于合规范围 (`100KB ~ 5MB`)</li><li>校验 `sha256sums.txt` 完整性与哈希一致性</li> | 8 项通过 |
| **5. 端到端集成测试** | `src/__tests__/presetsAndIntegration.test.ts` | <li>初始拓扑数据与策略组要素完整性校验</li><li>混编多协议订阅文本一键批量解析</li><li>主流业务全链路仿真（AI、海外流媒体、游戏、广告拦截、内网直连）</li><li>YAML 编译导出与再次逆向导入的无损一致性测试</li> | 4 项通过 |

### 📊 典型测试输出示例

```text
 ✓ src/__tests__/presetsAndIntegration.test.ts (4 tests) 33ms
 ✓ src/__tests__/parser.test.ts (6 tests) 17ms
 ✓ src/__tests__/configGenerator.test.ts (2 tests) 15ms
 ✓ src/__tests__/ruleMatcher.test.ts (7 tests) 10ms
 ✓ src/__tests__/ipkArtifacts.test.ts (8 tests) 10ms

 Test Files  5 passed (5)
      Tests  27 passed (27)
   Start at  06:45:45
   Duration  1.66s
```

---

## 📦 IPK 软件包结构说明

生成的各架构 `.ipk` 内部遵循严格的 OpenWrt / Debian 软件包标准：

```text
luci-app-openclash-flow_1.0.0-1_<arch>.ipk
├── debian-binary                                       # 格式版本 (2.0)
├── control.tar.gz
│   ├── control                                         # 包含 Architecture: <arch> 声明
│   ├── postinst                                        # 自动清理 LuCI 缓存并重启 rpcd 守护进程
│   └── prerm                                           # 卸载前清理
└── data.tar.gz
    ├── /usr/lib/lua/luci/controller/openclash_flow.lua  # LuCI 菜单路由定义 (服务 -> OpenClash 拓扑)
    ├── /usr/lib/lua/luci/view/openclash_flow/index.htm   # LuCI 原生内嵌视图
    ├── /usr/share/rpcd/acl.d/luci-app-openclash-flow.json # LuCI 23.05+ RPCD / ACL 授权规则
    ├── /etc/config/openclash_flow                        # UCI 初始配置文件
    ├── /usr/bin/openclash-flow-cli                      # CLI 快捷诊断工具
    └── /www/luci-static/resources/openclash-flow/       # 生产级前端静态资源 (HTML/JS/CSS/SVG)
```

---

## 🚀 路由器安装部署指南

### 方法一：SSH 终端一键安装 (推荐)

通过 SSH 或 TTYD 终端登录路由器后台，依次运行以下指令（以 `x86_64` 为例，其他架构替换文件名即可）：

```bash
# 1. 更新 opkg 软件源
opkg update

# 2. 下载并安装对应架构的 IPK 软件包
wget -O /tmp/luci-app-openclash-flow.ipk http://<路由器IP>:3000/luci-app-openclash-flow_1.0.0-1_x86_64.ipk
opkg install /tmp/luci-app-openclash-flow.ipk

# 3. 清理 LuCI 菜单缓存并重启 RPC 守护进程
rm -f /tmp/luci-indexcache
/etc/init.d/rpcd restart
```

安装完成后，刷新浏览器后台，即可在 **服务 (Services) -> OpenClash 拓扑编排** 中使用。

---

### 方法二：LuCI 网页界面直接上传

1. 在本系统 **「配置与 IPK」** 界面选择您的 CPU 架构，点击 **「下载此 IPK」**；
2. 登录 ImmortalWRT / OpenWrt 路由器后台，进入 **系统 (System) -> 软件包 (Software)**；
3. 点击 **「上传软件包... (Upload Package)」** 按钮，选择下载的 `.ipk` 文件并点击「安装」；
4. 安装完成后刷新浏览器页面即可。

---

### 方法三：SCP 离线传输安装

```bash
# 本地终端上传 IPK 到路由器
scp dist-ipk/luci-app-openclash-flow_1.0.0-1_all.ipk root@192.168.1.1:/tmp/

# SSH 登录路由器执行安装
ssh root@192.168.1.1 "opkg install /tmp/luci-app-openclash-flow_1.0.0-1_all.ipk && rm -f /tmp/luci-indexcache && /etc/init.d/rpcd restart"
```

---

## 🧱 技术栈

| 维度 | 采用技术 | 说明 |
| :--- | :--- | :--- |
| **前端核心** | React 18 + TypeScript | 强类型保证数据一致性与渲染性能 |
| **构建工具** | Vite 6 | 秒级热重载与优化生产打包 |
| **多架构构建** | Shell + Tar + Gzip + Sha256 | 原生自动化生成多架构 opkg / ipk 安装包矩阵 |
| **UI 与样式** | Tailwind CSS + Lucide Icons | 现代化暗色系控制台设计规范 |
| **动画与流图** | HTML5 Canvas + Motion | 高帧率贝塞尔连线计算与光粒子流回放 |
| **固件层集成** | LuCI Lua Controller + LuCI CBI View | 完美融合 OpenWrt / ImmortalWRT 原生界面 |
| **权限控制** | RPCD ACL (`/usr/share/rpcd/acl.d/`) | 兼容 OpenWrt 21.02+ 及 23.05+ 新版权限树 |
| **规则编译** | 自主研发 YAML / UCI 抽象语法树编译器 | 支持 100% 格式无损互转与动态热重载 |

---

## ❓ 常见问题 (FAQ)

**Q: 我应该下载哪个架构的 IPK 文件？**
> **A:**
> - 如果不确定自己的架构：直接下载 `all`（全架构通用版），它可以在任何架构的 OpenWrt 设备上安装运行；
> - x86 软路由（如工控机、虚拟机）：选择 `x86_64`；
> - 斐讯 N1、树莓派 4/5、NanoPi、RK3568/RK3588、MT7981/MT7986：选择 `aarch64_generic`；
> - MT7621 / K2P / Newifi D2：选择 `mipsel_24kc`。

**Q: 安装后在 LuCI 菜单里没有看到「OpenClash 拓扑编排」入口？**
> **A:** 这是由于 LuCI 的路由缓存未更新导致。请通过 SSH 登录路由器执行：
> ```bash
> rm -f /tmp/luci-indexcache && rm -rf /tmp/luci-modulecache/ && /etc/init.d/rpcd restart
> ```
> 然后在浏览器中按 `Ctrl + F5` 强制刷新页面。

**Q: 是否支持在没有安装 OpenClash 的纯净 OpenWrt 上运行？**
> **A:** 支持独立使用。如果尚未安装主程序 `luci-app-openclash`，本工具仍可在浏览器中作为强大的规则编排器、订阅转换器与流量调试器使用，并可导出 YAML 配置文件手动使用。

---

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源协议。
