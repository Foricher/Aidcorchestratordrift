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
  intentTemplateName: string;
  intentTemplateContent: string;
}

export interface IntentTemplate {
  name: string;
  updatedAt: string;
  content: string;
}

const defaultIntentTemplates: IntentTemplate[] = [
  {
    name: "simple-aos8-template",
    updatedAt: "2026-03-13 14:30:00",
    content: `--- System & Management ---
{% if device.primary_ip -%}
ip interface "Management" address {{ device.primary_ip.address.ip }} mask {{ device.primary_ip.address.netmask }}
{%- endif %}
! --- VLAN Creation ---
{% for vlan in device.tenant.vlans.all() -%}
vlan {{ vlan.vid }} admin-state enable
vlan {{ vlan.vid }} name "{{ vlan.name }}"
{% endfor %}
! --- Physical Interface Configuration ---
{% for interface in device.interfaces.all() -%}
{% if interface.type == '1000base-t' or interface.type == '10gbase-x' -%}
!
! Interface {{ interface.name }}
{% if interface.description -%}
interfaces {{ interface.name }} alias "{{ interface.description }}"
{%- endif %}
{% if interface.mode == 'access' and interface.untagged_vlan -%}
vlan {{ interface.untagged_vlan.vid }} port default {{ interface.name }}
{%- elif interface.mode == 'tagged' -%}
  {% if interface.untagged_vlan -%}
vlan {{ interface.untagged_vlan.vid }} port default {{ interface.name }}
  {%- endif %}
  {% for vlan in interface.tagged_vlans.all() -%}
vlan {{ vlan.vid }} members port {{ interface.name }} tagged
  {%- endfor %}
{%- endif %}
{% if interface.enabled -%}
interfaces {{ interface.name }} admin-state enable
{%- else -%}
interfaces {{ interface.name }} admin-state disable
{%- endif %}
{%- endif %}
{% endfor %}`,
  },
  {
    name: "advanced-aos8-template",
    updatedAt: "2026-03-14 15:30:00",
    content: `--- System & Management ---
{% if device.primary_ip -%}
ip interface "Management" address {{ device.primary_ip.address.ip }} mask {{ device.primary_ip.address.netmask }}
{%- endif %}
! --- VLAN Creation ---
{% for vlan in device.tenant.vlans.all() -%}
vlan {{ vlan.vid }} admin-state enable
vlan {{ vlan.vid }} name "{{ vlan.name }}"
{% endfor %}
! --- Physical Interface Configuration ---
{% for interface in device.interfaces.all() -%}
{% if interface.type == '1000base-t' or interface.type == '10gbase-x' -%}
!
! Interface {{ interface.name }}
{% if interface.description -%}
interfaces {{ interface.name }} alias "{{ interface.description }}"
{%- endif %}
{% if interface.mode == 'access' and interface.untagged_vlan -%}
vlan {{ interface.untagged_vlan.vid }} port default {{ interface.name }}
{%- elif interface.mode == 'tagged' -%}
  {% if interface.untagged_vlan -%}
vlan {{ interface.untagged_vlan.vid }} port default {{ interface.name }}
  {%- endif %}
  {% for vlan in interface.tagged_vlans.all() -%}
vlan {{ vlan.vid }} members port {{ interface.name }} tagged
  {%- endfor %}
{%- endif %}
{% if interface.enabled -%}
interfaces {{ interface.name }} admin-state enable
{%- else -%}
interfaces {{ interface.name }} admin-state disable
{%- endif %}
{%- endif %}
{% endfor %}`,
  },
  {
    name: "simple-aosx-template",
    updatedAt: "2026-03-15 15:30:00",
    content: "hostname {{device.name}}\nplatform aosx\nintent-mode simple\n",
  },
  {
    name: "advanced-aosx-template",
    updatedAt: "2026-03-17 15:30:00",
    content: "hostname {{device.name}}\nplatform aosx\nintent-mode advanced\npolicy strict\n",
  },
  {
    name: "firewall-template",
    updatedAt: "2026-03-20 15:30:00",
    content: "hostname {{device.name}}\nplatform firewall\nintent-mode hardened\n",
  },
];

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
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check", "BGP", "OSPF"],
    intentTemplateName: "advanced-aosx-template",
    intentTemplateContent: "",
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
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check", "OSPF"],
    intentTemplateName: "simple-aosx-template",
    intentTemplateContent: "",
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
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"],
    intentTemplateName: "simple-aos8-template",
    intentTemplateContent: "",
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
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"],
    intentTemplateName: "firewall-template",
    intentTemplateContent: "",
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
    complianceRules: ["Password Complexity", "NTP Server Sync", "BGP"],
    intentTemplateName: "advanced-aos8-template",
    intentTemplateContent: "",
  },
  {
    id: 6,
    name: "SW12_OS6560",
    ipAddress: "10.0.2.3",
    type: "Switch",
    platform: "AOS8",
    site: "Brest lab",
    status: "active",
    lastCheck: "never",
    complianceRules: ["BGP", "OSPF", "NTP Server Sync"],
    intentTemplateName: "",
    intentTemplateContent: `! Chassis:
system name "SW12_OS6560"
system location "Brest"

! Configuration:
configuration error-file-limit 2

! Capability Manager:
! Virtual Flow Control:
! LFP:
! Interface:
interfaces port 1/1/19 admin-state disable

! Port_Manager:
! Link Aggregate:
! VLAN:
vlan 1 admin-state enable
vlan 1540 admin-state enable
vlan 1540 name "1540"
vlan 1540 members port 1/1/1-28 untagged

! PVLAN:
! Spanning Tree:
spantree mode flat
spantree vlan 1 admin-state enable
spantree vlan 1540 admin-state enable

! DA-UNP:
unp profile "devProfPrinter"
unp profile "devProfWindows"
unp profile "devProfIP-Phone"
unp profile "devProfWireless-Router"
unp profile "devProfSmartPhone/PDA/Tablets"
unp classification-rule "devProfPrinter"
unp classification-rule "devProfPrinter" precedence 255
unp classification-rule "devProfPrinter" Profile1 "devProfPrinter"
unp classification-rule "devProfPrinter" device-type "Printer"
unp classification-rule "devProfWindows"
unp classification-rule "devProfWindows" precedence 255
unp classification-rule "devProfWindows" Profile1 "devProfWindows"
unp classification-rule "devProfWindows" device-type "Windows"
unp classification-rule "devProfIP-Phone"
unp classification-rule "devProfIP-Phone" precedence 255
unp classification-rule "devProfIP-Phone" Profile1 "devProfIP-Phone"
unp classification-rule "devProfIP-Phone" device-type "IP-Phone"
unp classification-rule "devProfWireless-Router"
unp classification-rule "devProfWireless-Router" precedence 255
unp classification-rule "devProfWireless-Router" Profile1 "devProfWireless-Router"
unp classification-rule "devProfWireless-Router" device-type "Wireless-Router"
unp classification-rule "devProfSmartPhone/PDA/Tablets"
unp classification-rule "devProfSmartPhone/PDA/Tablets" precedence 255
unp classification-rule "devProfSmartPhone/PDA/Tablets" Profile1 "devProfSmartPhone/PDA/Tablets"
unp classification-rule "devProfSmartPhone/PDA/Tablets" device-type "SmartPhone/PDA/Tablets"

! Bridging:
! Port Mirroring:
! Port Mapping:
! IP:
ip interface "1540" address 10.69.154.83 mask 255.255.254.0 vlan 1540 ifindex 1

! IPv6:
! IPSec:
! IPMS:
! AAA:
aaa authentication default "local"
aaa authentication console "local"
aaa authentication ftp "local"
aaa authentication http "local"
aaa authentication snmp "local"
aaa authentication ssh "local"
user password-history 0
aaa tacacs command-authorization disable

! NTP:
ntp server clock0.ovcirrus.com
ntp server clock1.ovcirrus.com
ntp server clock3.ovcirrus.com
ntp server clock2.ovcirrus.com
ntp peer 10.69.154.20
ntp client admin-state enable

! QOS:
! Policy Manager:
! VLAN Stacking:
! ERP:
! MVRP:
! LLDP:
! UDLD:
! Server Load Balance:
! High Availability Vlan:
! Session Manager:
session cli timeout 120

! Web:
! Trap Manager:
! Health Monitor:
health threshold memory 90

! System Service:
swlog output socket 10.69.154.205 10514
ip name-server 10.69.154.20
ip domain-lookup
system timezone CET

! SNMP:
snmp authentication-trap enable

! BFD:
! IP Route Manager:
ip static-route 0.0.0.0/0 gateway 10.69.154.1 metric 1

! VRRP:
! UDP Relay:
! RIP:
! OSPF:
! IP Multicast:
! DVMRP:
! IPMR:
! RIPng:
! OSPF3:
! BGP:
! ISIS:
! Module:
! LAN Power:
! RDP:
! DHL:
! Ethernet-OAM:
! SAA:
! SPB-ISIS:
! SVCMGR:
! EVB:
! APP-FINGERPRINT:
! FCOE:
! QMR:
! OPENFLOW:
! Dynamic auto-fabric:
! SIP Snooping:
! DHCP Server:
! DHCPv6 Relay:
! DHCPv6 Snooping:
! DHCPv6 Server:
! DHCP Message Service:
! DHCP Active Lease Service:
! Virtual Chassis Split Protection:
! DHCP Snooping:
! APP-MONITORING:
! Loopback Detection:
! VM-SNOOPING:
! PPPOE-IA:
! Security:
! Zero Configuration:
! MAC Security:
! OVC:
cloud-agent admin-state enable
cloud-agent discovery-interval 5

! EFM-OAM:
! ALARM-MANAGER:
! DEVICE-PROFILE:

device-profile admin-state enable

! PTP:
! IP DHCP RELAY:
! TEST-OAM:
! LOOPBACK TEST:
! UDP6 RELAY:
! MGMT AGENT:
! MRP:
! PKGMGR:
pkgmgr install nos-ovng-agent-v6.0.deb
appmgr start ams-apps iot-profiler argument "-u ej9xSqfwUbX -P wNJUDueaVTd -h 143.209.0.2 -p 31885 -q 2"
appmgr start ovng-agent config-agent argument "-q 0,-h 143.209.0.2,-p 31885,-u ej9xSqfwUbX,-P wNJUDueaVTd,--id AOS_JSZ201400964"
appmgr start ovng-agent monitoring-agent argument "-q 0,-h 143.209.0.2,-p 31885,-u ej9xSqfwUbX,-P wNJUDueaVTd,--id AOS_JSZ201400964"

! SITEMGR:
! SWLIC:
! MPLS:
! LDP:`,
  },
];

const getFormattedDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

interface DeviceContextValue {
  devices: Device[];
  intentTemplates: IntentTemplate[];
  addDevice: (device: Device) => void;
  updateDevice: (device: Device) => void;
  deleteDevice: (id: number) => void;
  removeComplianceRuleFromAllDevices: (ruleName: string) => void;
  updateIntentTemplateContent: (templateName: string, content: string) => void;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [intentTemplates, setIntentTemplates] = useState<IntentTemplate[]>(defaultIntentTemplates);

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

  const updateIntentTemplateContent = (templateName: string, content: string) => {
    const normalizedContent = content.replace(/\r\n/g, "\n");

    setIntentTemplates((prev) =>
      prev.map((template) =>
        template.name === templateName
          ? {
              ...template,
              content: normalizedContent,
              updatedAt: getFormattedDateTime(new Date()),
            }
          : template,
      ),
    );
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        intentTemplates,
        addDevice,
        updateDevice,
        deleteDevice,
        removeComplianceRuleFromAllDevices,
        updateIntentTemplateContent,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevices must be used within DeviceProvider");
  return ctx;
}
