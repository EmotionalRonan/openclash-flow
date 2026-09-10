#
# Copyright (C) 2026 OpenClash Flow Project
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-openclash-flow
PKG_VERSION:=1.0.6
PKG_RELEASE:=2

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=OpenClash Flow Team

LUCI_TITLE:=LuCI Support for OpenClash Visual Flow & Infinite Canvas
LUCI_DEPENDS:=+libc +luci-base +luci-compat +luci-app-openclash
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
