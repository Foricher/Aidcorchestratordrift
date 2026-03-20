import { useState, Fragment } from "react";
import { Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, CheckCheck, Terminal, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import referenceSnapshot from '../../../misc/aosx-reference-snapshot.txt?raw';
import runningSnapshot from '../../../misc/aosx-running-snapshot.txt?raw';

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

interface RuleDriftResult {
  ruleId: number;
  ruleName: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "compliant" | "drift";
  missingText: string;
  extraText: string;
}

const deviceDriftResults: Record<number, RuleDriftResult[]> = {
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
    min-length 8
    {
        complexity upper-case minimum 1
        complexity lower-case minimum 1
        complexity numeric minimum 1
        complexity special-char minimum 1
    }`,
      extraText: `user-password-profile default  [running line 44]
    min-length 6
    {
        complexity upper-case minimum 0
        complexity lower-case minimum 1
    }`,
    },
    {
      ruleId: 2, ruleName: "SNMP Configuration", severity: "high", status: "drift",
      missingText: `snmp-server user snmpv3user  [intent line 112]
    auth sha auth-password $CREDENTIAL$
snmp-server view all 1.3.6  [intent line 113]`,
      extraText: `snmp-server community public ro  [running line 112]
snmp-server community private rw  [running line 113]
snmp-server enable traps  [running line 114]`,
    },
    { ruleId: 3, ruleName: "NTP Server Sync",   severity: "medium",   status: "compliant", missingText: "", extraText: "" },
    { ruleId: 4, ruleName: "SSH Version Check", severity: "critical", status: "compliant", missingText: "", extraText: "" },
  ],
  5: [],
};

function parseDriftAnnotated(text: string): Array<{ lineNumber: number | null; text: string }> {
  return text.split('\n').map(line => {
    const match = line.match(/\s*\[(intent|running) line (\d+)\]\s*$/);
    if (match) {
      return {
        lineNumber: parseInt(match[2], 10),
        text: line.replace(/\s*\[(intent|running) line \d+\]\s*$/, ''),
      };
    }
    return { lineNumber: null, text: line };
  });
}

function DriftLinesViewer({ text, type }: { text: string; type: "missing" | "extra" }) {
  if (!text.trim()) return null;
  const lines = parseDriftAnnotated(text);
  const isMissing = type === "missing";
  return (
    <div className={`rounded border overflow-hidden bg-slate-950 ${
      isMissing ? "border-red-900/60" : "border-green-900/60"
    }`}>
      <div className="overflow-auto max-h-[200px]">
        {lines.map((line, i) => (
          <div key={i} className={`flex ${
            isMissing ? "bg-red-950/25 hover:bg-red-950/40" : "bg-green-950/25 hover:bg-green-950/40"
          }`}>
            <span className={`select-none text-right pr-3 pl-3 py-0.5 min-w-[3rem] border-r font-mono text-xs leading-relaxed shrink-0 ${
              isMissing ? "text-red-600/70 border-red-900/40" : "text-green-600/70 border-green-900/40"
            }`}>
              {line.lineNumber ?? ""}
            </span>
            <span className={`w-5 text-center py-0.5 font-mono text-xs leading-relaxed shrink-0 select-none ${
              isMissing ? "text-red-500" : "text-green-500"
            }`}>
              {line.lineNumber !== null ? (isMissing ? "-" : "+") : " "}
            </span>
            <span className={`font-mono text-xs pl-2 pr-4 py-0.5 whitespace-pre leading-relaxed ${
              isMissing ? "text-red-200" : "text-green-200"
            }`}>
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriftTab({ deviceId }: { deviceId: number }) {
  const results = deviceDriftResults[deviceId] ?? [];
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No compliance data available for this device.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 overflow-auto max-h-[500px] pr-1">
      {results.map(rule => (
        <div
          key={rule.ruleId}
          className={`rounded-lg border ${
            rule.status === "drift" ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg ${
            rule.status === "drift"
              ? "bg-orange-100 border-b border-orange-200"
              : "bg-gray-100 border-b border-gray-200"
          }`}>
            <span className="text-sm font-medium text-gray-800 flex-1">{rule.ruleName}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {({
                    critical: <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 rounded px-1.5 py-0.5 cursor-default">Critical</span>,
                    high:     <span className="text-xs font-semibold text-orange-700 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5 cursor-default">High</span>,
                    medium:   <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200 rounded px-1.5 py-0.5 cursor-default">Medium</span>,
                    low:      <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded px-1.5 py-0.5 cursor-default">Low</span>,
                  } as Record<string, React.ReactNode>)[rule.severity]}
                </span>
              </TooltipTrigger>
              <TooltipContent>Severity</TooltipContent>
            </Tooltip>
            {rule.status === "compliant" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
                <CheckCircle size={11} /> Compliant
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-200 border border-orange-300 rounded-full px-2 py-0.5">
                <AlertTriangle size={11} /> Drift
              </span>
            )}
          </div>
          {rule.status === "drift" && (
            <div className="p-3 flex flex-col gap-2">
              {rule.missingText.trim() && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-red-600">− Missing lines (in intent, absent from running)</span>
                  <DriftLinesViewer text={rule.missingText} type="missing" />
                </div>
              )}
              {rule.extraText.trim() && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-green-700">+ Extra lines (in running, absent from intent)</span>
                  <DriftLinesViewer text={rule.extraText} type="extra" />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ConfigViewer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="rounded border border-slate-700 overflow-hidden bg-slate-950">
      <div className="overflow-auto max-h-[400px]">
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-slate-800/50">
            <span className="select-none text-right text-slate-500 pr-3 pl-4 py-0.5 min-w-[3.5rem] border-r border-slate-700 font-mono text-xs leading-relaxed shrink-0">
              {i + 1}
            </span>
            <span className="font-mono text-xs text-slate-200 pl-3 pr-4 py-0.5 whitespace-pre leading-relaxed">
              {line || ' '}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComplianceStatus() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
              <th className="px-3 py-3 w-10"></th>
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
              const isExpanded = expandedRows.has(device.id);

              return (
                <Fragment key={device.id}>
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(device.id)}
                  >
                    <td className="px-3 py-4 w-10">
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </td>
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
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={8} className="px-0 py-0">
                        <div className="px-8 py-4 border-t border-gray-200">
                          <Tabs defaultValue="drift" className="px-8">
                            <TabsList className="mb-3">
                              <TabsTrigger value="drift">Drift</TabsTrigger>
                              <TabsTrigger value="intent">Intent Configuration</TabsTrigger>
                              <TabsTrigger value="running">Running Configuration</TabsTrigger>
                            </TabsList>
                            <TabsContent value="drift" className="mt-0 px-8">
                              <DriftTab deviceId={device.id} />
                            </TabsContent>
                            <TabsContent value="intent" className="mt-0 px-8">
                              <ConfigViewer text={referenceSnapshot} />
                            </TabsContent>
                            <TabsContent value="running" className="mt-0 px-8">
                              <ConfigViewer text={runningSnapshot} />
                            </TabsContent>
                          </Tabs>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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