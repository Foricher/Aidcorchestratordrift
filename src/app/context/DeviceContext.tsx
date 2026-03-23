import { createContext, useContext, useState, type ReactNode } from "react";

export interface Device {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  platform: "AOS8" | "AOSX" | "Other";
  site: string;
  status: "active" | "inactive";
  lastCheck: string;
  complianceRules: string[];
}

const mockDevices: Device[] = [
  { 
    id: 1, 
    name: "router-core-01", 
    ipAddress: "10.0.1.1", 
    type: "Router", 
    platform: "AOSX",
    site: "Brest Lab", 
    status: "active", 
    lastCheck: "2 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check", "BGP", "OSPF"]
  },
  { 
    id: 2, 
    name: "switch-access-01", 
    ipAddress: "10.0.2.1", 
    type: "Switch", 
    platform: "AOSX",
    site: "Brest Lab", 
    status: "active", 
    lastCheck: "5 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check", "OSPF"]
  },
  { 
    id: 3, 
    name: "switch-access-02", 
    ipAddress: "10.0.2.2", 
    type: "Switch", 
    platform: "AOS8",
    site: "Thousand Oaks", 
    status: "active", 
    lastCheck: "5 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"]
  },
  { 
    id: 4, 
    name: "firewall-01", 
    ipAddress: "10.0.3.1", 
    type: "Firewall", 
    platform: "Other",
    site: "Brest Lab", 
    status: "active", 
    lastCheck: "1 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"]
  },
  { 
    id: 5, 
    name: "router-branch-01", 
    ipAddress: "10.1.1.1", 
    type: "Router", 
    platform: "AOS8",
    site: "Thousand Oaks", 
    status: "inactive", 
    lastCheck: "2 hours ago",
    complianceRules: ["Password Complexity", "NTP Server Sync", "BGP"]
  },
];

interface DeviceContextValue {
  devices: Device[];
  addDevice: (device: Device) => void;
  updateDevice: (device: Device) => void;
  deleteDevice: (id: number) => void;
  removeComplianceRuleFromAllDevices: (ruleName: string) => void;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(mockDevices);

  const addDevice = (device: Device) => {
    setDevices((prev) => [...prev, device]);
  };

  const updateDevice = (device: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === device.id ? device : d)));
  };

  const deleteDevice = (id: number) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const removeComplianceRuleFromAllDevices = (ruleName: string) => {
    setDevices((prev) =>
      prev.map((device) => ({
        ...device,
        complianceRules: device.complianceRules.filter((rule) => rule !== ruleName),
      }))
    );
  };

  return (
    <DeviceContext.Provider value={{ devices, addDevice, updateDevice, deleteDevice, removeComplianceRuleFromAllDevices }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevices must be used within DeviceProvider");
  return ctx;
}
