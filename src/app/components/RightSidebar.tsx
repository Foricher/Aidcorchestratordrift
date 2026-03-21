import { Terminal as TerminalIcon, Plus, Trash2 } from "lucide-react";
import { TerminalTabs } from "./TerminalTabs";
import { DeviceSelectModal } from "./DeviceSelectModal";
import { mockDevices, Device } from "../data/devices";

interface TerminalTab {
  id: string;
  name: string;
}

interface RightSidebarProps {
  isOpen: boolean;
  tabs: TerminalTab[];
  setTabs: (tabs: TerminalTab[]) => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  showDeviceModal: boolean;
  setShowDeviceModal: (show: boolean) => void;
}

export function RightSidebar({
  isOpen,
  tabs,
  setTabs,
  activeTabId,
  setActiveTabId,
  showDeviceModal,
  setShowDeviceModal,
}: RightSidebarProps) {
  const handleDeviceSelect = (device: Device) => {
    const newId = `terminal-${Date.now()}`;
    const newName = device.name;
    setTabs([...tabs, { id: newId, name: newName }]);
    setActiveTabId(newId);
  };

  const openDeviceModal = () => {
    setShowDeviceModal(true);
  };

  const closeAllTerminals = () => {
    setTabs([]);
    setActiveTabId("");
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">SSH Terminal</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openDeviceModal}
            className="flex-shrink-0 p-1 text-gray-600 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded"
            title="New terminal"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={closeAllTerminals}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
            title="Close all terminals"
            disabled={tabs.length === 0}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-950">
        <TerminalTabs
          tabs={tabs}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          setTabs={setTabs}
        />
      </div>

      {/* Device Selection Modal */}
      <DeviceSelectModal
        isOpen={showDeviceModal}
        devices={mockDevices}
        onSelect={handleDeviceSelect}
        onClose={() => setShowDeviceModal(false)}
      />
    </div>
  );
}
