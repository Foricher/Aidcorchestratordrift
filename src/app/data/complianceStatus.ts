export interface DeviceCompliance {
  id: number;
  deviceName: string;
  ipAddress: string;
  site: string;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  status: "compliant" | "drift" | "error";
  lastCheck: string;
}

export interface RuleDriftResult {
  ruleId: number;
  ruleName: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "compliant" | "drift";
  missingText: string;
  extraText: string;
}

export const mockComplianceData: DeviceCompliance[] = [
  {
    id: 1,
    deviceName: "router-core-01",
    ipAddress: "10.0.1.1",
    site: "Brest Lab",
    totalRules: 4,
    passedRules: 4,
    failedRules: 0,
    status: "compliant",
    lastCheck: "2 min ago"
  },
  {
    id: 2,
    deviceName: "switch-access-01",
    ipAddress: "10.0.2.1",
    site: "Brest Lab",
    totalRules: 4,
    passedRules: 3,
    failedRules: 1,
    status: "drift",
    lastCheck: "5 min ago"
  },
  {
    id: 3,
    deviceName: "switch-access-02",
    ipAddress: "10.0.2.2",
    site: "Thousand Oaks",
    totalRules: 4,
    passedRules: 4,
    failedRules: 0,
    status: "compliant",
    lastCheck: "5 min ago"
  },
  {
    id: 4,
    deviceName: "firewall-01",
    ipAddress: "10.0.3.1",
    site: "Brest Lab",
    totalRules: 4,
    passedRules: 2,
    failedRules: 2,
    status: "drift",
    lastCheck: "1 min ago"
  },
  {
    id: 5,
    deviceName: "router-branch-01",
    ipAddress: "10.1.1.1",
    site: "Thousand Oaks",
    totalRules: 4,
    passedRules: 0,
    failedRules: 0,
    status: "error",
    lastCheck: "2 hours ago"
  },
  {
    id: 6,
    deviceName: "SW12_OS6560",
    ipAddress: "10.0.2.3",
    site: "Brest lab",
    totalRules: 3,
    passedRules: 2,
    failedRules: 1,
    status: "drift",
    lastCheck: "3 hours ago"
  },
];

export const deviceDriftResults: Record<number, RuleDriftResult[]> = {
  1: [
    { ruleId: 1, ruleName: "Password Complexity", severity: "critical", status: "compliant", missingText: "", extraText: "" },
    { ruleId: 2, ruleName: "SNMP Configuration",  severity: "high",     status: "compliant", missingText: "", extraText: "" },
    { ruleId: 3, ruleName: "NTP Server Sync",      severity: "medium",   status: "compliant", missingText: "", extraText: "" },
    { ruleId: 4, ruleName: "SSH Version Check",    severity: "critical", status: "compliant", missingText: "", extraText: "" },
  ],
  2: [
    { ruleId: 1, ruleName: "Password Complexity", severity: "critical", status: "compliant", missingText: "", extraText: "" },
    { ruleId: 2, ruleName: "SNMP Configuration",  severity: "high",     status: "compliant", missingText: "", extraText: "" },
    {
      ruleId: 3, ruleName: "NTP Server Sync", severity: "medium", status: "drift",
      missingText: `ntp server 10.0.0.1 prefer  [intent line 185]
ntp server 10.0.0.2  [intent line 186]
ntp authenticate  [intent line 187]`,
      extraText: "",
    },
    { ruleId: 4, ruleName: "SSH Version Check", severity: "critical", status: "compliant", missingText: "", extraText: "" },
  ],
  3: [
    { ruleId: 1, ruleName: "Password Complexity", severity: "critical", status: "compliant", missingText: "", extraText: "" },
    { ruleId: 2, ruleName: "SNMP Configuration",  severity: "high",     status: "compliant", missingText: "", extraText: "" },
    { ruleId: 3, ruleName: "NTP Server Sync",      severity: "medium",   status: "compliant", missingText: "", extraText: "" },
    { ruleId: 4, ruleName: "SSH Version Check",    severity: "critical", status: "compliant", missingText: "", extraText: "" },
  ],
  4: [
    {
      ruleId: 1, ruleName: "Password Complexity", severity: "critical", status: "drift",
      missingText: `user-password-profile default  [intent line 44]
{    [intent line 45]
    min-length 8 [intent line 46]
    {    [intent line 47]
        complexity upper-case minimum 1 [intent line 48]
        complexity lower-case minimum 1   [intent line 49]
        complexity numeric minimum 1    [intent line 50]
        complexity special-char minimum 1     [intent line 51]
     }   [intent line 52]
    }   [intent line 53]`,
      extraText: `user-password-profile default  [running line 44]
{   [running line 45]
    min-length 6    [running line 46]
    {      [running line 47]
        complexity upper-case minimum 0     [running line 48]
        complexity lower-case minimum 1     [running line 49]
    }  [running line 50]  
 }  [running line 51]`,
    },
    {
      ruleId: 2, ruleName: "SNMP Configuration", severity: "high", status: "drift",
      missingText: `snmp-server user snmpv3user  [intent line 112]
auth sha auth-password $CREDENTIAL$  [intent line 113]
snmp-server view all 1.3.6  [intent line 114]`,
      extraText: `snmp-server community public ro  [running line 112]
snmp-server community private rw  [running line 113]
snmp-server enable traps  [running line 114]`,
    },
    { ruleId: 3, ruleName: "NTP Server Sync",   severity: "medium",   status: "compliant", missingText: "", extraText: "" },
    { ruleId: 4, ruleName: "SSH Version Check", severity: "critical", status: "compliant", missingText: "", extraText: "" },
  ],
  5: [],
  6: [
    { ruleId: 1, ruleName: "BGP",             severity: "high",   status: "compliant", missingText: "", extraText: "" },
    { ruleId: 2, ruleName: "OSPF",            severity: "high",   status: "compliant", missingText: "", extraText: "" },
    {
      ruleId: 3, ruleName: "NTP Server Sync", severity: "medium", status: "drift",
      missingText: `ntp server clock3.ovcirrus.com  [intent line 77]
ntp peer 10.69.154.20  [intent line 79]`,
      extraText: `ntp server 10.69.154.20  [running line 77]`,
    },
  ],
};

export const deviceRunningContent: Record<number, string> = {
  6: `! Chassis:
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
ntp server clock2.ovcirrus.com
ntp server 10.69.154.20
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
};
