import { useState } from "react";
import { Plus, Search, Edit, Trash2, Server } from "lucide-react";

interface Device {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
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
    site: "Brest Lab", 
    status: "active", 
    lastCheck: "2 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"]
  },
  { 
    id: 2, 
    name: "switch-access-01", 
    ipAddress: "10.0.2.1", 
    type: "Switch", 
    site: "Brest Lab", 
    status: "active", 
    lastCheck: "5 min ago",
    complianceRules: ["Password Complexity", "SNMP Configuration", "NTP Server Sync", "SSH Version Check"]
  },
  { 
    id: 3, 
    name: "switch-access-02", 
    ipAddress: "10.0.2.2", 
    type: "Switch", 
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
    site: "Thousand Oaks", 
    status: "inactive", 
    lastCheck: "2 hours ago",
    complianceRules: ["Password Complexity", "NTP Server Sync"]
  },
];

export function Device() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = mockDevices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ipAddress.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Devices</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Device
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search devices by name or IP address..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance Rules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Check
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDevices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Server className="text-gray-400" size={20} />
                    <span className="text-sm font-medium text-gray-900">{device.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.site}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      device.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {device.complianceRules.map((rule, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {device.lastCheck}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No devices found matching your search.</p>
        </div>
      )}
    </div>
  );
}