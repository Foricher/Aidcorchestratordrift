import { useState } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface ComplianceRule {
  id: number;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  devices: number;
}

const mockRules: ComplianceRule[] = [
  {
    id: 1,
    name: "Password Complexity",
    description: "Ensure minimum password length and complexity requirements",
    severity: "critical",
    enabled: true,
    devices: 24
  },
  {
    id: 2,
    name: "SNMP Configuration",
    description: "Verify SNMP v3 is configured with proper authentication",
    severity: "high",
    enabled: true,
    devices: 24
  },
  {
    id: 3,
    name: "NTP Server Sync",
    description: "Check that devices are synchronized with corporate NTP servers",
    severity: "medium",
    enabled: true,
    devices: 24
  },
  {
    id: 4,
    name: "SSH Version Check",
    description: "Ensure SSH version 2 is enabled and version 1 is disabled",
    severity: "critical",
    enabled: true,
    devices: 24
  },
  {
    id: 5,
    name: "Banner Configuration",
    description: "Verify login banners are configured",
    severity: "low",
    enabled: false,
    devices: 0
  },
];

const severityColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export function ComplianceRules() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRules = mockRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Compliance Rules</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Rule
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search compliance rules..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devices
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-md">{rule.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[rule.severity]}`}
                  >
                    {rule.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {rule.enabled ? (
                      <>
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-sm text-green-600">Enabled</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-600">Disabled</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {rule.devices} devices
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

      {filteredRules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No compliance rules found matching your search.</p>
        </div>
      )}
    </div>
  );
}
