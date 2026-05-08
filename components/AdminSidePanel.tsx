"use client";

/**
 * AdminSidePanel
 * Wrapper que provee el contexto PanelNoti a SidebarRoot + RootNoti,
 * de forma que ambos comparten la misma instancia (un solo fetch/socket).
 */

import { PanelNotiProvider } from "@/contexts/PanelNotiContext";
import SidebarRootInner from "@/components/sidebarroot";
import RootNotiInner from "@/components/rootnoti";

const AdminSidePanel = () => (
  <PanelNotiProvider>
    <SidebarRootInner />
    <RootNotiInner />
  </PanelNotiProvider>
);

export default AdminSidePanel;
