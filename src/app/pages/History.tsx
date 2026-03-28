import { useState } from "react";
import { Search, Calendar, TrendingUp, TrendingDown, AlertCircle, History as HistoryIcon } from "lucide-react";

interface HistoryEvent {
  id: number;
  timestamp: string;
  device: string;
  site: string;
  rules: string[];
  eventType: "drift_detected" | "drift_resolved" | "compliance_check";
  severity: "critical" | "high" | "medium" | "low";
  details: string;
}

const mockHistory: HistoryEvent[] = [
  {
    id: 1,
    timestamp: "2026-03-13 14:30:00",
    device: "firewall-01",
    site: "Brest Lab",
    rules: ["SSH Version Check", "SNMP Configuration"],
    eventType: "drift_detected",
    severity: "critical",
    details: "SSH version 1 detected on device"
  },
  {
    id: 2,
    timestamp: "2026-03-13 14:15:00",
    device: "switch-access-01",
    site: "Brest Lab",
    rules: ["NTP Server Sync"],
    eventType: "drift_detected",
    severity: "medium",
    details: "Device not synchronized with corporate NTP server"
  },
  {
    id: 3,
    timestamp: "2026-03-13 14:00:00",
    device: "router-core-01",
    site: "Brest Lab",
    rules: ["Password Complexity", "NTP Server Sync", "SSH Version Check"],
    eventType: "compliance_check",
    severity: "critical",
    details: "Compliance check passed"
  },
  {
    id: 4,
    timestamp: "2026-03-13 13:45:00",
    device: "firewall-01",
    site: "Brest Lab",
    rules: ["SNMP Configuration"],
    eventType: "drift_resolved",
    severity: "high",
    details: "SNMP v3 configuration corrected"
  },
  {
    id: 5,
    timestamp: "2026-03-13 13:30:00",
    device: "switch-access-02",
    site: "Thousand Oaks",
    rules: ["Password Complexity", "NTP Server Sync"],
    eventType: "compliance_check",
    severity: "critical",
    details: "Compliance check passed"
  },
  {
    id: 6,
    timestamp: "2026-03-13 13:15:00",
    device: "router-branch-01",
    site: "Thousand Oaks",
    rules: ["NTP Server Sync"],
    eventType: "drift_detected",
    severity: "medium",
    details: "Device unreachable for compliance check"
  },
  {
    id: 7,
    timestamp: "2026-03-13 13:00:00",
    device: "firewall-01",
    site: "Brest Lab",
    rules: ["SNMP Configuration", "Password Complexity"],
    eventType: "drift_detected",
    severity: "high",
    details: "SNMP v3 authentication not configured"
  },
  {
    id: 8,
    timestamp: "2026-03-13 12:45:00",
    device: "switch-access-01",
    site: "Brest Lab",
    rules: ["SSH Version Check", "Password Complexity", "NTP Server Sync", "SNMP Configuration"],
    eventType: "compliance_check",
    severity: "critical",
    details: "Compliance check passed"
  },
];

const severityColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  const filteredHistory = mockHistory.filter(event => {
    const matchesSearch = event.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.rules.some(rule => rule.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEventType = eventTypeFilter === "all" || event.eventType === eventTypeFilter;
    return matchesSearch && matchesEventType;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <HistoryIcon size={28} className="text-blue-600" />
        <h1 className="text-3xl font-semibold text-gray-900">History</h1>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-red-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Drift Detected</span>
          </div>
          <p className="text-3xl font-semibold text-red-600">
            {mockHistory.filter(e => e.eventType === "drift_detected").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Drift Resolved</span>
          </div>
          <p className="text-3xl font-semibold text-green-600">
            {mockHistory.filter(e => e.eventType === "drift_resolved").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Total Events</span>
          </div>
          <p className="text-3xl font-semibold text-blue-600">{mockHistory.length}</p>
          <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by device or rule..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEventTypeFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                eventTypeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setEventTypeFilter("drift_detected")}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                eventTypeFilter === "drift_detected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Drift
            </button>
            <button
              onClick={() => setEventTypeFilter("drift_resolved")}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                eventTypeFilter === "drift_resolved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance Rules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredHistory.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {event.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{event.device}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {event.site}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {event.rules.map((rule, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-300"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {event.eventType === "drift_detected" && (
                      <>
                        <AlertCircle className="text-red-600" size={16} />
                        <span className="text-sm text-red-600">Drift Detected</span>
                      </>
                    )}
                    {event.eventType === "drift_resolved" && (
                      <>
                        <TrendingDown className="text-green-600" size={16} />
                        <span className="text-sm text-green-600">Drift Resolved</span>
                      </>
                    )}
                    {event.eventType === "compliance_check" && (
                      <>
                        <Calendar className="text-blue-600" size={16} />
                        <span className="text-sm text-blue-600">Compliance Check</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[event.severity]}`}
                  >
                    {event.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {event.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No history events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}