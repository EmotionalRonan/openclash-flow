#!/bin/bash
set -e

PKG_NAME="luci-app-openclash-flow"
PKG_VERSION="1.0.1-1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_ROOT="${WORK_DIR}/build-ipk"
OUT_DIR="${WORK_DIR}/dist-ipk"
PUBLIC_DIR="${WORK_DIR}/public"

# 支持的架构列表定义与描述
declare -A ARCH_DESC=(
  ["all"]="全架构通用 (Universal / All Architectures)"
  ["x86_64"]="x86_64 软路由 / PC / 虚拟机 (Intel & AMD 64位)"
  ["aarch64_generic"]="ARM64 / AArch64 (树莓派4/5, N1, R2S/R4S/R5S/R6S, RK3568/RK3588, MT798x)"
  ["arm_cortex-a7_neon-vfpv4"]="ARMv7 32位 (IPQ40xx, GL.iNet, 华硕等)"
  ["mipsel_24kc"]="MIPS 32位小端 (MT7621, K2P, Newifi D2 等)"
  ["mips_24kc"]="MIPS 32位大端 (AR9344, QCA953x, AR71xx 等)"
)

SUPPORTED_ARCHS=("all" "x86_64" "aarch64_generic" "arm_cortex-a7_neon-vfpv4" "mipsel_24kc" "mips_24kc")

TARGET_ARG="${1:-all-arch}"

if [ "${TARGET_ARG}" = "all-arch" ] || [ "${TARGET_ARG}" = "--all" ] || [ "${TARGET_ARG}" = "multi" ]; then
  BUILD_ARCHS=("${SUPPORTED_ARCHS[@]}")
else
  MATCHED=false
  for a in "${SUPPORTED_ARCHS[@]}"; do
    if [ "${a}" = "${TARGET_ARG}" ]; then
      BUILD_ARCHS=("${a}")
      MATCHED=true
      break
    fi
  done
  if [ "${MATCHED}" = false ]; then
    echo "⚠️ 未知架构参数: ${TARGET_ARG}"
    echo "支持的架构参数: all | x86_64 | aarch64_generic | arm_cortex-a7_neon-vfpv4 | mipsel_24kc | mips_24kc | all-arch"
    exit 1
  fi
fi

echo "============================================================"
echo "🚀 开始构建 OpenWrt / ImmortalWRT 多架构 IPK 插件"
echo "📦 软件包: ${PKG_NAME}"
echo "🔢 版本号: ${PKG_VERSION}"
echo "🎯 目标架构: ${BUILD_ARCHS[*]}"
echo "============================================================"

# 1. 清理历史构建并编译前端生产静态资源
echo ""
echo "⚙️ [1/4] 编译前端单页应用 (Vite build)..."
rm -rf "${WORK_DIR}/dist" "${OUT_DIR}" "${BUILD_ROOT}"
rm -f "${PUBLIC_DIR}"/*.ipk "${PUBLIC_DIR}/sha256sums.txt"

npm run build

mkdir -p "${OUT_DIR}"

# 2. 准备公共 data 目录结构 (LuCI 控制器与静态文件)
echo ""
echo "📂 [2/4] 构建公共 LuCI 系统安装目录树..."
COMMON_DATA_DIR="${BUILD_ROOT}/common-data"
rm -rf "${BUILD_ROOT}"
mkdir -p "${COMMON_DATA_DIR}"

# A. 前端静态资源
TARGET_WWW="${COMMON_DATA_DIR}/www/luci-static/resources/openclash-flow"
mkdir -p "${TARGET_WWW}"
cp -r "${WORK_DIR}/dist/"* "${TARGET_WWW}/"

# 创建 /www/assets 软链接以双重保障：哪怕浏览器缓存了请求 /assets/ 的旧 HTML 也能正常读取
ln -sf "luci-static/resources/openclash-flow/assets" "${COMMON_DATA_DIR}/www/assets"

# B. LuCI Controller /usr/lib/lua/luci/controller/openclash_flow.lua (兼容 OpenWrt 18.06 / 19.07 及 luci-compat)
TARGET_CONTROLLER="${COMMON_DATA_DIR}/usr/lib/lua/luci/controller"
mkdir -p "${TARGET_CONTROLLER}"
cat << 'EOF' > "${TARGET_CONTROLLER}/openclash_flow.lua"
module("luci.controller.openclash_flow", package.seeall)

function index()
    local page = entry({"admin", "services", "openclash_flow"}, template("openclash_flow/index"), _("OpenClash 拓扑编排"), 65)
    page.dependent = false

    entry({"admin", "services", "openclash_flow", "api_sync"}, call("action_sync_config")).leaf = true
    entry({"admin", "services", "openclash_flow", "api_status"}, call("action_status")).leaf = true
end

function action_status()
    luci.http.prepare_content("application/json")
    local uci = require "luci.model.uci".cursor()
    local enabled = uci:get("openclash", "config", "enable") or "1"
    luci.http.write_json({
        status = "ok",
        openclash_enabled = (enabled == "1"),
        version = "1.0.0-1"
    })
end

function action_sync_config()
    luci.http.prepare_content("application/json")
    local data = luci.http.content()
    if data and #data > 0 then
        local fp = io.open("/etc/openclash/config.yaml.flow_bak", "w")
        if fp then
            fp:write(data)
            fp:close()
        end
        luci.http.write_json({ success = true, message = "配置已写入 /etc/openclash/" })
    else
        luci.http.write_json({ success = false, message = "空数据 payload" })
    end
end
EOF

# C. LuCI 21.02 / 22.03 / 23.05+ Modern LuCI JS View & Menu.d
# (现代 OpenWrt/ImmortalWRT 原生菜单注册)
TARGET_LUCI_MENU="${COMMON_DATA_DIR}/usr/share/luci/menu.d"
mkdir -p "${TARGET_LUCI_MENU}"
cat << 'EOF' > "${TARGET_LUCI_MENU}/luci-app-openclash-flow.json"
{
  "admin/services/openclash_flow": {
    "title": "OpenClash 拓扑编排",
    "order": 65,
    "action": {
      "type": "view",
      "path": "openclash_flow/index"
    }
  }
}
EOF

TARGET_LUCI_JS_VIEW="${COMMON_DATA_DIR}/www/luci-static/resources/view/openclash_flow"
mkdir -p "${TARGET_LUCI_JS_VIEW}"
cat << 'EOF' > "${TARGET_LUCI_JS_VIEW}/index.js"
'use strict';
'require view';

return view.extend({
    render: function() {
        // 自动注入动态时间戳参数，强制浏览器向路由器拉取最新资源，彻底杜绝 IPK 升级后旧版缓存问题
        var cacheBust = new Date().getTime();
        var pageUrl = L.resource('openclash-flow/index.html') + '?_t=' + cacheBust;
        return E('div', { 'class': 'cbi-map', 'id': 'cbi-openclash-flow', 'style': 'padding: 0; margin: 0;' }, [
            E('div', { 'style': 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 4px 2px;' }, [
                E('div', { 'style': 'display: flex; align-items: center; gap: 8px;' }, [
                    E('span', { 'style': 'font-weight: 700; font-size: 15px; color: #f8fafc;' }, [ _('OpenClash Flow 智能拓扑编排') ]),
                    E('span', { 'class': 'badge', 'style': 'font-size: 11px; background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 2px 8px; border-radius: 9999px;' }, [ 'v1.0.1' ])
                ]),
                E('div', { 'style': 'display: flex; align-items: center; gap: 8px;' }, [
                    E('button', {
                        'class': 'btn cbi-button',
                        'style': 'font-size: 12px; padding: 4px 10px; border-radius: 6px;',
                        'click': function() {
                            var iframe = document.getElementById('openclash-flow-frame');
                            if (iframe) {
                                iframe.src = L.resource('openclash-flow/index.html') + '?_t=' + new Date().getTime();
                            }
                        }
                    }, [ '↻ ' + _('强制重载最新界面') ]),
                    E('a', {
                        'href': pageUrl,
                        'target': '_blank',
                        'class': 'btn cbi-button cbi-button-action',
                        'style': 'font-size: 12px; padding: 4px 12px; border-radius: 6px; text-decoration: none;'
                    }, [ '↗ ' + _('独立全屏打开') ])
                ])
            ]),
            E('iframe', {
                'id': 'openclash-flow-frame',
                'src': pageUrl,
                'style': 'width: 100%; height: calc(100vh - 120px); min-height: 540px; border: 1px solid #1e293b; border-radius: 12px; background: #020617; display: block; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);',
                'title': 'OpenClash Flow Canvas'
            })
        ]);
    },
    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
EOF

# D. LuCI View Template (供 Legacy LuCI / luci-compat 模板引擎备用)
TARGET_VIEW="${COMMON_DATA_DIR}/usr/lib/lua/luci/view/openclash_flow"
mkdir -p "${TARGET_VIEW}"
cat << 'EOF' > "${TARGET_VIEW}/index.htm"
<%+header%>
<div class="cbi-map" id="cbi-openclash-flow">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 4px 2px;">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; font-size: 15px;">OpenClash Flow 智能拓扑编排</span>
            <span style="font-size: 11px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 2px 8px; border-radius: 9999px;">v1.0.1</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="document.getElementById('openclash-flow-frame').src='<%=resource%>/openclash-flow/index.html?v='+Date.now()" class="cbi-button" style="font-size: 12px; padding: 4px 10px; border-radius: 6px;">
                ↻ 强制重载最新界面
            </button>
            <a href="<%=resource%>/openclash-flow/index.html?v=<%=os.time()%>" target="_blank" class="cbi-button cbi-button-action" style="font-size: 12px; padding: 4px 12px; border-radius: 6px; text-decoration: none;">
                ↗ 独立全屏打开
            </a>
        </div>
    </div>
    <div style="width:100%; height:calc(100vh - 120px); min-height:540px; border-radius:12px; overflow:hidden; border:1px solid #1e293b; background:#020617; position:relative;">
        <iframe id="openclash-flow-frame" src="<%=resource%>/openclash-flow/index.html?v=<%=os.time()%>" style="width:100%; height:100%; border:none; display:block;" title="OpenClash Flow Canvas"></iframe>
    </div>
</div>
<%+footer%>
EOF

# E. LuCI RPCD ACL 权限注册
TARGET_ACL="${COMMON_DATA_DIR}/usr/share/rpcd/acl.d"
mkdir -p "${TARGET_ACL}"
cat << 'EOF' > "${TARGET_ACL}/luci-app-openclash-flow.json"
{
  "luci-app-openclash-flow": {
    "description": "Grant UCI access for OpenClash Flow",
    "read": {
      "uci": [ "openclash", "openclash_flow" ]
    },
    "write": {
      "uci": [ "openclash", "openclash_flow" ]
    }
  }
}
EOF

# F. UCI 默认配置
TARGET_ETC_CONFIG="${COMMON_DATA_DIR}/etc/config"
mkdir -p "${TARGET_ETC_CONFIG}"
cat << 'EOF' > "${TARGET_ETC_CONFIG}/openclash_flow"
config openclash_flow 'global'
	option enabled '1'
	option listen_port '3000'
	option auto_sync '1'
	option default_view 'canvas'
EOF

# G. CLI 工具
TARGET_BIN="${COMMON_DATA_DIR}/usr/bin"
mkdir -p "${TARGET_BIN}"
cat << 'EOF' > "${TARGET_BIN}/openclash-flow-cli"
#!/bin/sh
# OpenClash Flow Command Line Tool
echo "OpenClash Flow CLI v1.0.0"
case "$1" in
    status)
        /etc/init.d/openclash status 2>/dev/null || echo "OpenClash status check..."
        ;;
    sync)
        echo "Syncing OpenClash Flow visual rules..."
        ;;
    *)
        echo "Usage: $0 {status|sync|restart}"
        ;;
esac
exit 0
EOF
chmod +x "${TARGET_BIN}/openclash-flow-cli"

# 3. 针对各架构分别打包专属 IPK (使用 OpenWrt 官方标准 ipkg-build)
echo ""
echo "📦 [3/4] 针对各个架构封装专属 control 与 IPK..."

for ARCH in "${BUILD_ARCHS[@]}"; do
  ARCH_PKG_DIR="${BUILD_ROOT}/pkg_${ARCH}"
  rm -rf "${ARCH_PKG_DIR}"
  mkdir -p "${ARCH_PKG_DIR}"

  echo "  🔨 正在构建 [${ARCH}]: ${ARCH_DESC[$ARCH]}"

  # 复制公共 rootfs 目录树 (usr/, www/, etc/)
  cp -a "${COMMON_DATA_DIR}/." "${ARCH_PKG_DIR}/"

  # 创建 OpenWrt 标准包元数据目录 CONTROL
  mkdir -p "${ARCH_PKG_DIR}/CONTROL"

  # A. 生成针对该架构的 control 文件
  cat << EOF > "${ARCH_PKG_DIR}/CONTROL/control"
Package: ${PKG_NAME}
Version: ${PKG_VERSION}
Depends: libc, luci-base
Section: luci
Architecture: ${ARCH}
Maintainer: OpenClash Flow Studio
Title: OpenClash Flow Visual Rule & Infinite Canvas Orchestrator (${ARCH})
Description: Visual infinite canvas rule orchestrator, step-by-step traffic simulator, and multi-protocol subscription parser for OpenClash on ImmortalWRT / OpenWrt (${ARCH_DESC[$ARCH]}).
EOF

  # B. postinst 脚本 (强化缓存清理与 Web 守护进程即时热重载)
  cat << 'EOF' > "${ARCH_PKG_DIR}/CONTROL/postinst"
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || {
    ln -sf /www/luci-static/resources/openclash-flow/assets /www/assets 2>/dev/null || true
    
    # 彻底清理所有 LuCI 视图及路由缓存、ucode 预编译缓存
    rm -f /tmp/luci-indexcache /var/run/luci-indexcache /tmp/luci-reloadcache 2>/dev/null || true
    rm -rf /tmp/luci-modulecache/ /tmp/luci-sessions/ 2>/dev/null || true
    
    # 写入版本标记时间戳
    echo "$(date +%s)" > /etc/openclash-flow.version 2>/dev/null || true

    # 强制重启 RPC 守护进程与 Web 服务器 (uhttpd / nginx)，立即使新静态文件生效
    /etc/init.d/rpcd restart 2>/dev/null || true
    /etc/init.d/uhttpd restart 2>/dev/null || true
    /etc/init.d/nginx restart 2>/dev/null || true

    echo "=================================================="
    echo " OpenClash Flow 拓扑编排插件已成功安装/升级！"
    echo " [自动加载最新界面]：已自动清空 LuCI 缓存并重启 Web 服务。"
    echo " 提示：若浏览器仍显示旧版，请按 Ctrl+F5 (Mac: Cmd+Shift+R) 强制刷新。"
    echo "=================================================="
    exit 0
}
EOF
  chmod 0755 "${ARCH_PKG_DIR}/CONTROL/postinst"

  # C. prerm 脚本
  cat << 'EOF' > "${ARCH_PKG_DIR}/CONTROL/prerm"
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || {
    [ -L /www/assets ] && rm -f /www/assets 2>/dev/null || true
    rm -f /tmp/luci-indexcache /var/run/luci-indexcache 2>/dev/null || true
    rm -rf /tmp/luci-modulecache/ 2>/dev/null || true
    exit 0
}
EOF
  chmod 0755 "${ARCH_PKG_DIR}/CONTROL/prerm"

  # D. 保护配置文件
  echo "/etc/config/openclash_flow" > "${ARCH_PKG_DIR}/CONTROL/conffiles"
  chmod 0644 "${ARCH_PKG_DIR}/CONTROL/conffiles"

  # 使用 OpenWrt 官方标准打包脚本封装生成 IPK
  bash "${SCRIPT_DIR}/ipkg-build" "${ARCH_PKG_DIR}" "${OUT_DIR}" > /dev/null

  IPK_NAME="${PKG_NAME}_${PKG_VERSION}_${ARCH}.ipk"
  SIZE=$(ls -lh "${OUT_DIR}/${IPK_NAME}" | awk '{print $5}')
  echo "     ✅ 产物: ${IPK_NAME} (${SIZE})"
done

# 4. 生成 SHA256 校验和清单
echo ""
echo "🔒 [4/4] 计算生成 SHA256 校验和清单..."
cd "${OUT_DIR}"
sha256sum *.ipk > "${OUT_DIR}/sha256sums.txt"
cp -f "${OUT_DIR}"/*.ipk "${OUT_DIR}/sha256sums.txt" "${PUBLIC_DIR}/" 2>/dev/null || true

echo ""
echo "============================================================"
echo "✨ 全部架构 IPK 软件包构建完成！"
echo "📂 产物目录: ${OUT_DIR}/"
echo "------------------------------------------------------------"
ls -lh "${OUT_DIR}"/*.ipk
echo "------------------------------------------------------------"
cat "${OUT_DIR}/sha256sums.txt"
echo "============================================================"
