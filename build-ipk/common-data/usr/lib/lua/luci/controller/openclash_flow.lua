module("luci.controller.openclash_flow", package.seeall)

function index()
    if not nixio.fs.access("/etc/config/openclash") and not nixio.fs.access("/etc/config/openclash_flow") then
        return
    end

    local page = entry({"admin", "services", "openclash_flow"}, template("openclash_flow/index"), _("OpenClash 拓扑编排"), 65)
    page.dependent = true
    page.acl_depends = { "luci-app-openclash-flow" }

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
