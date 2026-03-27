import { useState, Fragment } from "react";
import { Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, CheckCheck, Terminal, ChevronDown, Check, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { useSSHTerminal } from "../context/SSHTerminalContext";
import { useDevices } from "../context/DeviceContext";
import { mockComplianceData, deviceDriftResults, deviceRunningContent } from "../data/complianceStatus";
import referenceSnapshot from '../../../misc/aosx-reference-snapshot.txt?raw';
import runningSnapshot from '../../../misc/aosx-running-snapshot.txt?raw';

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

function DriftTab({ 
  deviceId, 
  acceptedRules, 
  onAcceptRule, 
  onRejectRule 
}: { 
  deviceId: number;
  acceptedRules: Record<number, Set<number>>;
  onAcceptRule: (deviceId: number, ruleId: number) => void;
  onRejectRule: (deviceId: number, ruleId: number) => void;
}) {
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const results = deviceDriftResults[deviceId] ?? [];

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No compliance data available for this device.
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-col gap-3 overflow-auto max-h-[500px] pr-1">
        {results.map(rule => (
          <div
            key={rule.ruleId}
            className={`rounded-lg border ${
              rule.status === "drift" && !acceptedRules[deviceId]?.has(rule.ruleId)
                ? "border-orange-300 bg-orange-50"
                : rule.status === "drift" && acceptedRules[deviceId]?.has(rule.ruleId)
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg ${
            rule.status === "drift" && !acceptedRules[deviceId]?.has(rule.ruleId)
              ? "bg-orange-100 border-b border-orange-200"
              : rule.status === "drift" && acceptedRules[deviceId]?.has(rule.ruleId)
              ? "bg-green-100 border-b border-green-200"
              : "bg-gray-100 border-b border-gray-200"
          }`}>
            <span className="text-sm font-medium text-gray-800 flex-1">{rule.ruleName}</span>
            {acceptedRules[deviceId]?.has(rule.ruleId) && (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5">
                ✓ Accepted
              </span>
            )}
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
            {rule.status === "compliant" || (acceptedRules[deviceId]?.has(rule.ruleId)) ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
                <CheckCircle size={11} /> Compliant
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-200 border border-orange-300 rounded-full px-2 py-0.5">
                <AlertTriangle size={11} /> Drift
              </span>
            )}
          </div>
          {rule.status === "drift" && !acceptedRules[deviceId]?.has(rule.ruleId) && (
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
              <div className="flex gap-2 pt-2 border-t border-orange-200">
                <button
                  onClick={() => { onAcceptRule(deviceId, rule.ruleId); setIsAcceptModalOpen(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-xs font-medium border border-green-200"
                  title="Accept this drift"
                >
                  <Check size={12} />
                  Accept
                </button>
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-400 cursor-not-allowed rounded text-xs font-medium border border-gray-200"
                  title="Reject (only available after accepting)"
                >
                  <X size={12} />
                  Reject
                </button>
              </div>
            </div>
          )}
          {rule.status === "drift" && acceptedRules[deviceId]?.has(rule.ruleId) && (
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
              <div className="flex gap-2 pt-2 border-t border-orange-200">
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-400 cursor-not-allowed rounded text-xs font-medium border border-gray-200"
                  title="Already accepted"
                >
                  <Check size={12} />
                  Accept
                </button>
                <button
                  onClick={() => { onRejectRule(deviceId, rule.ruleId); setIsRejectModalOpen(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-xs font-medium border border-red-200"
                  title="Reject this accepted drift"
                >
                  <X size={12} />
                  Reject
                </button>
              </div>
            </div>
          )}
          </div>
        ))}
      </div>

      {isAcceptModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Accept Drift</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Accept the current drift for this compliance rule. This action confirms user approval of the drift, and the rule status will be updated to compliant.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Drift</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Reject the previously accepted drift for this compliance rule. The rule status will be updated to indicate drift.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ConfigViewer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-950 shadow-sm">
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-900/70 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Configuration</span>
        <span className="text-[11px] text-slate-500">{lines.length} lines</span>
      </div>
      <div className="overflow-auto max-h-[420px]">
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
  const [acceptedRules, setAcceptedRules] = useState<Record<number, Set<number>>>({});
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const { openSSHTerminal } = useSSHTerminal();
  const { devices, intentTemplates } = useDevices();

  const getIntentContent = (deviceId: number): string => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return referenceSnapshot;
    if (device.intentTemplateName === "") return device.intentTemplateContent;
    const template = intentTemplates.find((t) => t.name === device.intentTemplateName);
    return template?.content ?? referenceSnapshot;
  };

  const acceptRule = (deviceId: number, ruleId: number) => {
    setAcceptedRules(prev => ({
      ...prev,
      [deviceId]: new Set([...(prev[deviceId] || []), ruleId])
    }));
  };

  const rejectRule = (deviceId: number, ruleId: number) => {
    setAcceptedRules(prev => {
      const deviceRules = new Set(prev[deviceId] || []);
      deviceRules.delete(ruleId);
      return {
        ...prev,
        [deviceId]: deviceRules
      };
    });
  };

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
    // Calculate actual device status for filtering
    const acceptedRulesCount = acceptedRules[device.id] ? acceptedRules[device.id].size : 0;
    const actualPassedRules = device.passedRules + acceptedRulesCount;
    const actualDeviceStatus = actualPassedRules === device.totalRules ? "compliant" : 
                             device.status === "error" ? "error" : "drift";
    const matchesStatus = statusFilter === "all" || actualDeviceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const compliantCount = mockComplianceData.filter(d => {
    const acceptedRulesCount = acceptedRules[d.id] ? acceptedRules[d.id].size : 0;
    const actualPassedRules = d.passedRules + acceptedRulesCount;
    return actualPassedRules === d.totalRules;
  }).length;
  const driftCount = mockComplianceData.filter(d => {
    const acceptedRulesCount = acceptedRules[d.id] ? acceptedRules[d.id].size : 0;
    const actualPassedRules = d.passedRules + acceptedRulesCount;
    return actualPassedRules < d.totalRules && d.status !== "error";
  }).length;
  const errorCount = mockComplianceData.filter(d => d.status === "error").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle size={28} className="text-blue-600" />
        <h1 className="text-3xl font-semibold text-gray-900">Compliance Status</h1>
      </div>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((device) => {
              // Calculate actual passed rules including accepted rules
              const acceptedRulesCount = acceptedRules[device.id] ? acceptedRules[device.id].size : 0;
              const actualPassedRules = device.passedRules + acceptedRulesCount;
              const complianceRate = device.totalRules > 0 
                ? Math.round((actualPassedRules / device.totalRules) * 100) 
                : 0;
              // Calculate actual device status based on accepted rules
              const actualDeviceStatus = actualPassedRules === device.totalRules ? "compliant" : 
                                       device.status === "error" ? "error" : "drift";
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
                        {actualDeviceStatus === "compliant" && (
                          <>
                            <CheckCircle className="text-green-600" size={18} />
                            <span className="text-sm text-green-600 font-medium">Compliant</span>
                          </>
                        )}
                        {actualDeviceStatus === "drift" && (
                          <>
                            <AlertTriangle className="text-orange-600" size={18} />
                            <span className="text-sm text-orange-600 font-medium">Drift</span>
                          </>
                        )}
                        {actualDeviceStatus === "error" && (
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
                          {actualPassedRules}/{device.totalRules}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {device.lastCheck}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-0 py-0">
                        <div className="px-8 py-4 border-t border-gray-200">
                          <div className="flex items-center justify-start gap-1.5 mb-4 pl-8">
                            <button 
                              onClick={() => setIsCheckModalOpen(true)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-200"
                              title="Check Drift"
                            >
                              <RefreshCw size={12} />
                              Check
                            </button>
                            <button 
                              onClick={() => setIsResolveModalOpen(true)}
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
                              onClick={() => openSSHTerminal(device.deviceName)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-200"
                              title="Open SSH Terminal"
                            >
                              <Terminal size={12} />
                              SSH Terminal
                            </button>
                          </div>
                          <Tabs defaultValue="drift" className="px-8">
                            <TabsList className="mb-4 h-auto p-1 bg-slate-100 border border-slate-200 rounded-xl gap-1 inline-flex">
                              <TabsTrigger
                                value="drift"
                                className="rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                              >
                                Drift
                              </TabsTrigger>
                              <TabsTrigger
                                value="intent"
                                className="rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                              >
                                Intent Configuration
                              </TabsTrigger>
                              <TabsTrigger
                                value="running"
                                className="rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                              >
                                Running Configuration
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="drift" className="mt-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <DriftTab 
                                deviceId={device.id} 
                                acceptedRules={acceptedRules}
                                onAcceptRule={acceptRule}
                                onRejectRule={rejectRule}
                              />
                            </TabsContent>
                            <TabsContent value="intent" className="mt-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <ConfigViewer text={getIntentContent(device.id)} />
                            </TabsContent>
                            <TabsContent value="running" className="mt-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <ConfigViewer text={deviceRunningContent[device.id] ?? runningSnapshot} />
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

      {isCheckModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Compliance Check</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Run the Ansible script to retrieve the running configuration, then update the device’s compliance status
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsCheckModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isResolveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Drift Remediation</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Execute the Ansible remediation scripts for the device to address the compliance rules in drift, then perform another drift check and update the device’s compliance status.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}