import { useState } from "react";
import { Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, CheckCheck, Terminal } from "lucide-react";

interface DeviceCompliance {
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

const mockComplianceData: DeviceCompliance[] = [
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
];

export function ComplianceStatus() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = mockComplianceData.filter(device => {
    const matchesSearch = device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ipAddress.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const compliantCount = mockComplianceData.filter(d => d.status === "compliant").length;
  const driftCount = mockComplianceData.filter(d => d.status === "drift").length;
  const errorCount = mockComplianceData.filter(d => d.status === "error").length;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Compliance Status</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Compliant</span>
          </div>
          <p className="text-3xl font-semibold text-green-600">{compliantCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Drift Detected</span>
          </div>
          <p className="text-3xl font-semibold text-orange-600">{driftCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Errors</span>
          </div>
          <p className="text-3xl font-semibold text-red-600">{errorCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("compliant")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === "compliant"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Compliant
            </button>
            <button
              onClick={() => setStatusFilter("drift")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === "drift"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Drift
            </button>
            <button
              onClick={() => setStatusFilter("error")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Error
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Table */}
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
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
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
            {filteredData.map((device) => {
              const complianceRate = device.totalRules > 0 
                ? Math.round((device.passedRules / device.totalRules) * 100) 
                : 0;

              return (
                <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{device.deviceName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {device.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {device.site}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {device.status === "compliant" && (
                        <>
                          <CheckCircle className="text-green-600" size={18} />
                          <span className="text-sm text-green-600 font-medium">Compliant</span>
                        </>
                      )}
                      {device.status === "drift" && (
                        <>
                          <AlertTriangle className="text-orange-600" size={18} />
                          <span className="text-sm text-orange-600 font-medium">Drift</span>
                        </>
                      )}
                      {device.status === "error" && (
                        <>
                          <XCircle className="text-red-600" size={18} />
                          <span className="text-sm text-red-600 font-medium">Error</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[200px]">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              complianceRate === 100
                                ? "bg-green-600"
                                : complianceRate >= 50
                                ? "bg-orange-600"
                                : "bg-red-600"
                            }`}
                            style={{ width: `${complianceRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {device.passedRules}/{device.totalRules}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {device.lastCheck}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-200"
                        title="Check Drift"
                      >
                        <RefreshCw size={12} />
                        Check
                      </button>
                      <button 
                        disabled={device.status !== "drift"}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                          device.status === "drift" 
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                            : "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                        }`}
                        title="Resolve Drift"
                      >
                        <CheckCheck size={12} />
                        Resolve
                      </button>
                      <button 
                        className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-xs font-medium border border-gray-200"
                        title="Open SSH Terminal"
                      >
                        <Terminal size={12} />
                        SSH Terminal
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No devices found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}