import React, { createContext, useContext } from "react";

export interface TerminalTab {
  id: string;
  name: string;
}

interface SSHTerminalContextType {
  tabs: TerminalTab[];
  activeTabId: string;
  setTabs: (tabs: TerminalTab[]) => void;
  setActiveTabId: (id: string) => void;
  openSSHTerminal: (deviceName: string) => void;
  setShowDeviceModal: (show: boolean) => void;
}

export const SSHTerminalContext = createContext<SSHTerminalContextType | undefined>(undefined);

export function useSSHTerminal() {
  const context = useContext(SSHTerminalContext);
  if (!context) {
    throw new Error("useSSHTerminal must be used within SSHTerminalProvider");
  }
  return context;
}
