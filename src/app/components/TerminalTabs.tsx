import { X } from "lucide-react";
import { Terminal } from "./Terminal";

interface TerminalTab {
  id: string;
  name: string;
}

interface TerminalTabsProps {
  tabs: TerminalTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  setTabs: (tabs: TerminalTab[]) => void;
}

export function TerminalTabs({
  tabs,
  activeTabId,
  setActiveTabId,
  setTabs,
}: TerminalTabsProps) {
  const closeTerminal = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    
    // If the closed tab was active, switch to another available tab or empty string
    if (activeTabId === id) {
      setActiveTabId(newTabs.length > 0 ? newTabs[0].id : "");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-gray-700 bg-gray-900 px-3 py-1.5 gap-1 flex-shrink-0">
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none whitespace-nowrap text-xs font-medium transition-colors border-b-2 ${
                activeTabId === tab.id
                  ? "bg-gray-800 text-white border-blue-500"
                  : "bg-gray-900 text-gray-400 hover:text-gray-200 border-transparent hover:bg-gray-800"
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span>● {tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(tab.id);
                }}
                className="ml-1 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`w-full h-full ${
              activeTabId === tab.id ? "block" : "hidden"
            }`}
          >
            <Terminal terminalId={tab.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
