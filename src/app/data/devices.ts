export interface Device {
  id: number;
  name: string;
  hostname: string;
  ip: string;
  type: string;
}

export const mockDevices: Device[] = [
  {
    id: 1,
    name: "Router-Core-01",
    hostname: "router-core-01.dc",
    ip: "192.168.1.10",
    type: "Router",
  },
  {
    id: 2,
    name: "Switch-Access-01",
    hostname: "switch-access-01.dc",
    ip: "192.168.1.20",
    type: "Switch",
  },
  {
    id: 3,
    name: "Firewall-Main",
    hostname: "fw-main.dc",
    ip: "192.168.1.30",
    type: "Firewall",
  },
  {
    id: 4,
    name: "Server-Web-01",
    hostname: "web-01.dc",
    ip: "192.168.1.40",
    type: "Server",
  },
  {
    id: 5,
    name: "Server-DB-01",
    hostname: "db-01.dc",
    ip: "192.168.1.50",
    type: "Server",
  },
  {
    id: 6,
    name: "LoadBalancer-01",
    hostname: "lb-01.dc",
    ip: "192.168.1.60",
    type: "LoadBalancer",
  },
];
