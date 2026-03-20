export interface Playbook {
  id: number;
  name: string;
  description: string;
  script: string;
  order: number;
}

export const mockPlaybooks: Playbook[] = [
  {
    id: 1,
    name: "fix-password-complexity",
    description: "Remediate password complexity issues by applying secure password policies",
    script: "fix_password_complexity.yml",
    order: 10,
  },
  {
    id: 2,
    name: "configure-snmp-v3",
    description: "Configure SNMP v3 with authentication and encryption",
    script: "configure_snmpv3.yml",
    order: 20,
  },
  {
    id: 3,
    name: "sync-ntp-servers",
    description: "Configure corporate NTP servers for time synchronization",
    script: "sync_ntp_servers.yml",
    order: 15,
  },
  {
    id: 4,
    name: "enforce-ssh-v2",
    description: "Enforce SSH version 2 and disable version 1",
    script: "enforce_ssh_v2.yml",
    order: 5,
  },
  {
    id: 5,
    name: "configure-evpn-vxlan",
    description: "Configure EVPN-VXLAN overlay network for data center fabric",
    script: "configure_evpn_vxlan.yml",
    order: 30,
  },
];
