export interface Substitute {
  regex: string;
  replace: string;
}

export interface ComplianceRuleDef {
  include_regex: string;
  exclude_regex: string;
  substitutes: Substitute[];
  children: ComplianceRuleDef[];
}

export interface ComplianceRule {
  id: number;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  devices: number;
  platform: "AOS8" | "AOSX" | "Other";
  compliance_rule_def: ComplianceRuleDef[];
  remediation: {
    scripts: string[];
  };
}

export const mockRules: ComplianceRule[] = [
  {
    id: 1,
    name: "Password Complexity",
    description: "Ensure minimum password length and complexity requirements",
    severity: "critical",
    enabled: true,
    devices: 24,
    platform: "AOSX",
    compliance_rule_def: [{ include_regex: "", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["fix-password-complexity"] },
  },
  {
    id: 2,
    name: "SNMP Configuration",
    description: "Verify SNMP v3 is configured with proper authentication",
    severity: "high",
    enabled: true,
    devices: 24,
    platform: "AOSX",
    compliance_rule_def: [{ include_regex: "", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["configure-snmpv3"] },
  },
  {
    id: 3,
    name: "NTP Server Sync",
    description: "Check that devices are synchronized with corporate NTP servers",
    severity: "medium",
    enabled: true,
    devices: 24,
    platform: "AOSX",
    compliance_rule_def: [{ include_regex: "", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["sync-ntp-servers"] },
  },
  {
    id: 4,
    name: "NTP Server Sync",
    description: "Check that devices are synchronized with corporate NTP servers",
    severity: "medium",
    enabled: true,
    devices: 24,
    platform: "AOS8",
    compliance_rule_def: [{ include_regex: "ntp\\s+.*", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["sync-ntp-servers"] },
  },
  {
    id: 5,
    name: "SSH Version Check",
    description: "Ensure SSH version 2 is enabled and version 1 is disabled",
    severity: "critical",
    enabled: true,
    devices: 24,
    platform: "AOSX",
    compliance_rule_def: [{ include_regex: "", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["enforce-sshv2"] },
  },
  {
    id: 6,
    name: "BGP",
    description: "Verify BGP routing protocol configuration",
    severity: "critical",
    enabled: true,
    devices: 12,
    platform: "AOS8",
    compliance_rule_def: [{ include_regex: "ip\\s+bgp.*", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["configure-evpn-vxlan"] },
  },
  {
    id: 7,
    name: "OSPF",
    description: "Ensure OSPF routing protocol is properly configured",
    severity: "critical",
    enabled: true,
    devices: 10,
    platform: "AOS8",
    compliance_rule_def: [{ include_regex: "ip\\s+ospf.*", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: ["configure-evpn-vxlan"] },
  },
  {
    id: 8,
    name: "OSPF",
    description: "Ensure OSPF routing protocol is properly configured",
    severity: "critical",
    enabled: true,
    devices: 12,
    platform: "AOSX",
    compliance_rule_def: [{
      "include_regex": "vrf\s+.*",
      "exclude_regex": "",
      "substitutes": [],
      "children": [
        {
          "include_regex": "ip",
          "exclude_regex": "",
          "substitutes": [],
          "children": [
            {
              "include_regex": "ipv4",
              "exclude_regex": "",
              "substitutes": [],
              "children": [
                {
                  "include_regex": "ospf",
                  "exclude_regex": "",
                  "substitutes": [],
                  "children": [
                    {
                      "include_regex": ".*",
                      "exclude_regex": 'log',
                      "substitutes": [],
                      "children": [
                        {
                          "include_regex": ".*",
                          "exclude_regex": "",
                          "substitutes": [],
                          "children": [
                            {
                              "include_regex": ".*",
                              "exclude_regex": "",
                              "substitutes": [],
                              "children": [
                                {
                                  "include_regex": ".*",
                                  "exclude_regex": "",
                                  "substitutes": [],
                                  "children": []
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
        }
      ],
    }
    ],
    remediation: { scripts: ["configure-evpn-vxlan"] },
  },

  {
    id: 9,
    name: "Banner Configuration",
    description: "Verify login banners are configured",
    severity: "low",
    enabled: false,
    devices: 0,
    platform: "AOSX",
    compliance_rule_def: [{ include_regex: "", exclude_regex: "", substitutes: [], children: [] }],
    remediation: { scripts: [] },
  },
];
