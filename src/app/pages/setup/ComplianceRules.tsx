import { useState } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle, AlertCircle, Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { useComplianceRules } from "@/app/context/ComplianceRulesContext";
import { useDevices } from "@/app/context/DeviceContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";

const severityColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export function ComplianceRules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { rules, deleteRule, updateRule } = useComplianceRules();
  const { devices, removeComplianceRuleFromAllDevices } = useDevices();

  const getDevicesUsingRule = (ruleName: string) => {
    return devices.filter((device) => device.complianceRules.includes(ruleName));
  };

  const handleDeleteRule = (ruleId: number) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const devicesUsingRule = getDevicesUsingRule(rule.name);
    
    // Update all devices to remove this rule
    devicesUsingRule.forEach((device) => {
      updateRule({
        ...rule,
        devices: devicesUsingRule.length,
      });
      removeComplianceRuleFromAllDevices(rule.name);
    });

    deleteRule(ruleId);
    setDeleteConfirmId(null);
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">Compliance Rules</h1>
        </div>
        <button 
          onClick={() => navigate("/setup/compliance-rules/new")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
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
                Platform
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{rule.platform}</div>
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => navigate(`/setup/compliance-rules/${rule.id}`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Rule</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setDeleteConfirmId(rule.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Rule</TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId !== null && (() => {
        const ruleToDelete = rules.find((r) => r.id === deleteConfirmId);
        const devicesUsingRule = ruleToDelete ? getDevicesUsingRule(ruleToDelete.name) : [];

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Delete Compliance Rule</h2>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-medium">{ruleToDelete?.name}</span>? This action cannot be undone.
                </p>

                {devicesUsingRule.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-2">
                          This rule is used by {devicesUsingRule.length} device{devicesUsingRule.length !== 1 ? 's' : ''}
                        </p>
                        <ul className="text-xs text-amber-800 space-y-1">
                          {devicesUsingRule.map((device) => (
                            <li key={device.id} className="flex items-center gap-2">
                              <span className="text-amber-600">•</span>
                              {device.name}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-amber-800 mt-2">
                          The rule will be removed from these devices.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRule(deleteConfirmId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {filteredRules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No compliance rules found matching your search.</p>
        </div>
      )}
    </div>
  );
}