import { createContext, useContext, useState, type ReactNode } from "react";
import { mockRules, type ComplianceRule } from "@/app/data/complianceRules";

interface ComplianceRulesContextValue {
  rules: ComplianceRule[];
  updateRule: (updated: ComplianceRule) => void;
  addRule: (rule: Omit<ComplianceRule, "id">) => void;
  deleteRule: (id: number) => void;
  removeRemediationScriptFromAllRules: (scriptName: string) => void;
}

const ComplianceRulesContext = createContext<ComplianceRulesContextValue | null>(null);

export function ComplianceRulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<ComplianceRule[]>(mockRules);

  const updateRule = (updated: ComplianceRule) => {
    setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const addRule = (rule: Omit<ComplianceRule, "id">) => {
    const newId = Math.max(...rules.map((r) => r.id), 0) + 1;
    setRules((prev) => [...prev, { ...rule, id: newId }]);
  };

  const deleteRule = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const removeRemediationScriptFromAllRules = (scriptName: string) => {
    setRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        remediation: {
          scripts: rule.remediation.scripts.filter((script) => script !== scriptName),
        },
      }))
    );
  };

  return (
    <ComplianceRulesContext.Provider value={{ rules, updateRule, addRule, deleteRule, removeRemediationScriptFromAllRules }}>
      {children}
    </ComplianceRulesContext.Provider>
  );
}

export function useComplianceRules() {
  const ctx = useContext(ComplianceRulesContext);
  if (!ctx) throw new Error("useComplianceRules must be used within ComplianceRulesProvider");
  return ctx;
}
