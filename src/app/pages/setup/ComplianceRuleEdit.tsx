import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

interface Substitute {
  regex: string;
  replace: string;
}

interface ComplianceRuleDef {
  include_regex: string;
  exclude_regex: string;
  substitutes: Substitute[];
  children: ComplianceRuleDef[];
}

interface ComplianceRule {
  id?: number;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  platform: "AOS8" | "AOSX" | "Other";
  compliance_rule_def: ComplianceRuleDef[];
  remediation: {
    scripts: string[];
  };
}

// Mock playbooks from remediation page
const availableScripts = [
  "fix_password_complexity.yml",
  "configure_snmpv3.yml",
  "sync_ntp_servers.yml",
  "enforce_ssh_v2.yml",
  "configure_evpn_vxlan.yml",
];

// Component for editing a single rule definition
function RuleDefEditor({ 
  ruleDef, 
  onChange, 
  onDelete, 
  level = 0 
}: { 
  ruleDef: ComplianceRuleDef; 
  onChange: (updated: ComplianceRuleDef) => void; 
  onDelete: () => void;
  level?: number;
}) {
  const addSubstitute = () => {
    onChange({
      ...ruleDef,
      substitutes: [...ruleDef.substitutes, { regex: "", replace: "" }]
    });
  };

  const updateSubstitute = (index: number, field: "regex" | "replace", value: string) => {
    const updated = [...ruleDef.substitutes];
    updated[index][field] = value;
    onChange({ ...ruleDef, substitutes: updated });
  };

  const deleteSubstitute = (index: number) => {
    onChange({
      ...ruleDef,
      substitutes: ruleDef.substitutes.filter((_, i) => i !== index)
    });
  };

  const addChild = () => {
    onChange({
      ...ruleDef,
      children: [
        ...ruleDef.children,
        { include_regex: "", exclude_regex: "", substitutes: [], children: [] }
      ]
    });
  };

  const updateChild = (index: number, updated: ComplianceRuleDef) => {
    const newChildren = [...ruleDef.children];
    newChildren[index] = updated;
    onChange({ ...ruleDef, children: newChildren });
  };

  const deleteChild = (index: number) => {
    onChange({
      ...ruleDef,
      children: ruleDef.children.filter((_, i) => i !== index)
    });
  };

  const indent = level * 24;

  return (
    <div 
      className="border border-gray-300 rounded-lg p-4 bg-white"
      style={{ marginLeft: `${indent}px` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          {level === 0 ? "Rule Definition" : `Child Level ${level}`}
        </h4>
        {level > 0 && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 p-1"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Include Regex */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Include Regex
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="e.g., interfaces-ethernet\s+port\s+.*"
            value={ruleDef.include_regex}
            onChange={(e) => onChange({ ...ruleDef, include_regex: e.target.value })}
          />
        </div>

        {/* Exclude Regex */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Exclude Regex (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="e.g., ^#.*"
            value={ruleDef.exclude_regex}
            onChange={(e) => onChange({ ...ruleDef, exclude_regex: e.target.value })}
          />
        </div>

        {/* Substitutes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Substitutes
            </label>
            <button
              onClick={addSubstitute}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Substitute
            </button>
          </div>
          <div className="space-y-2">
            {ruleDef.substitutes.map((sub, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="Regex (e.g., vrf\s+(CORP[-_]EMP))"
                  value={sub.regex}
                  onChange={(e) => updateSubstitute(idx, "regex", e.target.value)}
                />
                <span className="text-gray-400 mt-1">→</span>
                <input
                  type="text"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="Replace (e.g., CORP_EMP)"
                  value={sub.replace}
                  onChange={(e) => updateSubstitute(idx, "replace", e.target.value)}
                />
                <button
                  onClick={() => deleteSubstitute(idx)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">
              Children Rules
            </label>
            <button
              onClick={addChild}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Child
            </button>
          </div>
          <div className="space-y-3">
            {ruleDef.children.map((child, idx) => (
              <RuleDefEditor
                key={idx}
                ruleDef={child}
                onChange={(updated) => updateChild(idx, updated)}
                onDelete={() => deleteChild(idx)}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComplianceRuleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== "new";

  const [rule, setRule] = useState<ComplianceRule>({
    name: "",
    severity: "low",
    description: "",
    platform: "AOSX",
    compliance_rule_def: [
      {
        include_regex: "",
        exclude_regex: "",
        substitutes: [],
        children: []
      }
    ],
    remediation: {
      scripts: []
    }
  });

  const addRuleDef = () => {
    setRule({
      ...rule,
      compliance_rule_def: [
        ...rule.compliance_rule_def,
        { include_regex: "", exclude_regex: "", substitutes: [], children: [] }
      ]
    });
  };

  const updateRuleDef = (index: number, updated: ComplianceRuleDef) => {
    const newDefs = [...rule.compliance_rule_def];
    newDefs[index] = updated;
    setRule({ ...rule, compliance_rule_def: newDefs });
  };

  const deleteRuleDef = (index: number) => {
    setRule({
      ...rule,
      compliance_rule_def: rule.compliance_rule_def.filter((_, i) => i !== index)
    });
  };

  const toggleScript = (script: string) => {
    const scripts = rule.remediation.scripts;
    if (scripts.includes(script)) {
      setRule({
        ...rule,
        remediation: {
          scripts: scripts.filter(s => s !== script)
        }
      });
    } else {
      setRule({
        ...rule,
        remediation: {
          scripts: [...scripts, script]
        }
      });
    }
  };

  const handleSave = () => {
    if (!rule.name.trim()) {
      alert("Rule name is mandatory");
      return;
    }
    // Here you would save the rule
    console.log("Saving rule:", rule);
    navigate("/setup/compliance-rules");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/setup/compliance-rules")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            {isEditing ? "Edit Compliance Rule" : "Add Compliance Rule"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Save Rule
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Password Complexity"
                value={rule.name}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rule.severity}
                onChange={(e) => setRule({ ...rule, severity: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rule.platform}
                onChange={(e) => setRule({ ...rule, platform: e.target.value as any })}
              >
                <option value="AOSX">AOSX</option>
                <option value="AOS8">AOS8</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional description of the compliance rule"
                value={rule.description}
                onChange={(e) => setRule({ ...rule, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Compliance Rule Definition */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Compliance Rule Definition</h2>
            <button
              onClick={addRuleDef}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus size={16} />
              Add Rule Definition
            </button>
          </div>
          <div className="space-y-4">
            {rule.compliance_rule_def.map((ruleDef, idx) => (
              <div key={idx}>
                <RuleDefEditor
                  ruleDef={ruleDef}
                  onChange={(updated) => updateRuleDef(idx, updated)}
                  onDelete={() => deleteRuleDef(idx)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Remediation */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Remediation Scripts</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select playbooks to run when this compliance rule detects a drift
          </p>
          <div className="space-y-2">
            {availableScripts.map((script) => (
              <label
                key={script}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  checked={rule.remediation.scripts.includes(script)}
                  onChange={() => toggleScript(script)}
                />
                <span className="text-sm font-mono text-gray-900">{script}</span>
              </label>
            ))}
          </div>
        </div>

        {/* JSON Preview */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">JSON Preview</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
            {JSON.stringify(rule, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
