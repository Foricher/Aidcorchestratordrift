import { createContext, useContext, useState, type ReactNode } from "react";
import { mockPlaybooks, type Playbook } from "@/app/data/playbooks";

interface RemediationContextValue {
  playbooks: Playbook[];
  addPlaybook: (playbook: Playbook) => void;
  updatePlaybook: (playbook: Playbook) => void;
  deletePlaybook: (id: number) => void;
  getPlaybookById: (id: number) => Playbook | undefined;
  getPlaybookByName: (name: string) => Playbook | undefined;
}

const RemediationContext = createContext<RemediationContextValue | null>(null);

export function RemediationProvider({ children }: { children: ReactNode }) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);

  const addPlaybook = (playbook: Playbook) => {
    setPlaybooks((prev) => [...prev, playbook]);
  };

  const updatePlaybook = (playbook: Playbook) => {
    setPlaybooks((prev) => prev.map((p) => (p.id === playbook.id ? playbook : p)));
  };

  const deletePlaybook = (id: number) => {
    setPlaybooks((prev) => prev.filter((p) => p.id !== id));
  };

  const getPlaybookById = (id: number) => {
    return playbooks.find((p) => p.id === id);
  };

  const getPlaybookByName = (name: string) => {
    return playbooks.find((p) => p.name === name);
  };

  return (
    <RemediationContext.Provider
      value={{ playbooks, addPlaybook, updatePlaybook, deletePlaybook, getPlaybookById, getPlaybookByName }}
    >
      {children}
    </RemediationContext.Provider>
  );
}

export function useRemediations() {
  const ctx = useContext(RemediationContext);
  if (!ctx) throw new Error("useRemediations must be used within RemediationProvider");
  return ctx;
}
